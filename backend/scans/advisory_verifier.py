
import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


OSV_API_BASE = "https://api.osv.dev/v1"
REQUEST_TIMEOUT = 5


def _request_json(url, payload=None):
    """Make a bounded-time JSON request to the OSV API."""
    headers = {
        "Accept": "application/json",
        "User-Agent": "SecureSDLC-Assistant/1.0",
    }

    data = None

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = Request(url, data=data, headers=headers, method=(
        "POST" if data is not None else "GET"
    ))

    with urlopen(request, timeout=REQUEST_TIMEOUT) as response:
        return json.loads(response.read().decode("utf-8"))


def _package_matches(affected_package, expected_package):
    """Require an exact Maven group:artifact match."""
    if not isinstance(affected_package, dict):
        return False

    if str(affected_package.get("ecosystem") or "").lower() != "maven":
        return False

    actual = str(affected_package.get("name") or "").strip().lower()
    expected = str(expected_package or "").strip().lower()

    return bool(expected and actual == expected)



def _fixed_version_for_package(vulnerability, package_name, installed_version):
    """
    Return a fix only when the installed version belongs to a
    range with exactly one identifiable fixed version.

    Maven versions are compared using packaging.version when possible.
    If comparison cannot be performed reliably, return an empty string.
    """
    try:
        from packaging.version import Version
        installed = Version(str(installed_version).strip())
    except Exception:
        return ""

    applicable_fixes = set()

    for affected in vulnerability.get("affected", []):
        if not isinstance(affected, dict):
            continue

        if not _package_matches(affected.get("package"), package_name):
            continue

        for version_range in affected.get("ranges", []):
            if not isinstance(version_range, dict):
                continue

            if str(version_range.get("type") or "").upper() != "ECOSYSTEM":
                continue

            introduced = None
            fixed = None

            for event in version_range.get("events", []):
                if not isinstance(event, dict):
                    continue

                if event.get("introduced") is not None:
                    introduced = event["introduced"]

                if event.get("fixed") is not None:
                    fixed = event["fixed"]
                    break

            if not introduced or not fixed:
                continue

            try:
                lower = Version(str(introduced))
                upper = Version(str(fixed))
            except Exception:
                continue

            if lower <= installed < upper:
                applicable_fixes.add(str(fixed))

    if len(applicable_fixes) == 1:
        return next(iter(applicable_fixes))

    return ""


def verify_dependency_advisory(
    vulnerability_id,
    package_name,
    installed_version,
):
    """
    Verify a CVE using OSV package-version results.

    A result is verified only when:
    - the package/version query returns the vulnerability;
    - the requested CVE matches the ID or an alias;
    - the advisory explicitly identifies the exact Maven package.

    Network errors and ambiguous evidence remain needs_review.
    """
    result = {
        "validation_status": "needs_review",
        "fixed_version": "",
        "advisory_severity": "",
        "verification_source": "OSV",
        "verification_message": "",
    }

    vulnerability_id = str(vulnerability_id or "").strip().upper()
    package_name = str(package_name or "").strip()
    installed_version = str(installed_version or "").strip()

    if not (
        vulnerability_id.startswith("CVE-")
        and package_name
        and installed_version
    ):
        result["verification_message"] = (
            "Missing CVE, Maven package identity, or installed version."
        )
        return result

    payload = {
        "package": {
            "name": package_name,
            "ecosystem": "Maven",
        },
        "version": installed_version,
    }

    try:
        query_result = _request_json(
            f"{OSV_API_BASE}/query",
            payload,
        )

        candidates = query_result.get("vulns", [])

        for candidate in candidates:
            osv_id = str(candidate.get("id") or "").strip()

            if not osv_id:
                continue

            advisory = _request_json(
                f"{OSV_API_BASE}/vulns/{quote(osv_id, safe='')}"
            )

            aliases = {
                str(alias).strip().upper()
                for alias in advisory.get("aliases", [])
            }
            aliases.add(osv_id.upper())

            if vulnerability_id not in aliases:
                continue

            exact_package_match = any(
                _package_matches(
                    item.get("package"),
                    package_name,
                )
                for item in advisory.get("affected", [])
                if isinstance(item, dict)
            )

            if not exact_package_match:
                continue

            result["validation_status"] = "advisory_verified"
            result["fixed_version"] = _fixed_version_for_package(
                advisory, package_name, installed_version
            )
            result["verification_message"] = (
                "OSV returned this vulnerability for the queried package "
                "and installed version, and the advisory identifies the "
                "exact Maven package. Review branch-specific fix information "
                "before upgrading."
            )
            return result

        result["verification_message"] = (
            "Verification completed, but OSV returned no matching record "
            "for this CVE, Maven package, and installed version. The finding "
            "remains unconfirmed by this source; this does not prove that "
            "the dependency is unaffected."
        )
        return result

    except (
        HTTPError,
        URLError,
        TimeoutError,
        OSError,
        ValueError,
    ):
        result["verification_message"] = (
            "Verification unavailable: the OSV request failed or its "
            "response could not be processed. The original scanner finding "
            "is retained and requires review."
        )
        return result
