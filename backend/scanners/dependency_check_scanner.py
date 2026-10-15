
import json
import os
import subprocess
import tempfile
import re

from scanners.semgrep_scanner import clean_file_path


DEFAULT_EXECUTABLE = (
    r"C:\Tools\dependency-check\bin\dependency-check.bat"
)



def run_dependency_check(target_path, timeout=600):
    """
    Run OWASP Dependency-Check against a project directory.

    Maven projects have their runtime dependencies resolved first.
    The original project directory is also scanned so other supported
    ecosystems in a mixed-language repository are not skipped.
    """
    executable = os.environ.get(
        "DEPENDENCY_CHECK_PATH",
        DEFAULT_EXECUTABLE,
    )

    if not os.path.isfile(executable):
        raise RuntimeError(
            "Dependency-Check was not found. Check "
            "DEPENDENCY_CHECK_PATH and the installation path."
        )

    target_path = os.path.abspath(target_path)

    with tempfile.TemporaryDirectory(
        prefix="secure_sdlc_dependency_check_"
    ) as work_directory:
        report_directory = os.path.join(work_directory, "report")
        os.makedirs(report_directory)
        report_path = os.path.join(
            report_directory,
            "dependency-check-report.json",
        )

        scan_paths = [target_path]

        # Ignore generated/vendor directories when searching for Maven POMs.
        excluded_directories = {
            ".git", "node_modules", ".venv", "venv",
            "target", "build", "dist",
        }
        pom_files = []

        for current_root, dirs, files in os.walk(target_path):
            dirs[:] = [
                name for name in dirs
                if name not in excluded_directories
            ]
            if "pom.xml" in files:
                pom_files.append(os.path.join(current_root, "pom.xml"))

        if pom_files:
            # Keep each Maven module's resolved artifacts in a separate folder.
            resolved_root = os.path.join(work_directory, "resolved-maven")
            os.makedirs(resolved_root)

            for index, pom_path in enumerate(sorted(pom_files), start=1):
                project_directory = os.path.dirname(pom_path)
                wrapper_name = (
                    "mvnw.cmd" if os.name == "nt" else "mvnw"
                )
                wrapper_path = os.path.join(
                    project_directory, wrapper_name
                )

                if os.path.isfile(wrapper_path):
                    if os.name == "nt":
                        maven_command = [
                            "cmd.exe", "/c", wrapper_path,
                        ]
                    else:
                        maven_command = [wrapper_path]
                else:
                    import shutil
                    maven_executable = shutil.which("mvn")
                    if not maven_executable:
                        raise RuntimeError(
                            f"Maven POM found at {pom_path}, but no "
                            "Maven wrapper or installed Maven executable "
                            "was found."
                        )
                    if os.name == "nt":
                        maven_command = [
                            "cmd.exe", "/c", maven_executable,
                        ]
                    else:
                        maven_command = [maven_executable]

                dependency_directory = os.path.join(
                    resolved_root, f"module-{index}"
                )
                os.makedirs(dependency_directory)

                maven_command.extend([
                    "-f", pom_path,
                    "dependency:copy-dependencies",
                    f"-DoutputDirectory={dependency_directory}",
                    "-DincludeScope=runtime",
                ])

                try:
                    maven_result = subprocess.run(
                        maven_command,
                        cwd=project_directory,
                        capture_output=True,
                        text=True,
                        encoding="utf-8",
                        errors="replace",
                        timeout=timeout,
                        check=False,
                    )
                except subprocess.TimeoutExpired as error:
                    raise RuntimeError(
                        f"Maven dependency resolution timed out for "
                        f"{pom_path} after {timeout} seconds."
                    ) from error
                except OSError as error:
                    raise RuntimeError(
                        f"Could not start Maven for {pom_path}."
                    ) from error

                if maven_result.returncode != 0:
                    details = (
                        maven_result.stderr or maven_result.stdout or ""
                    ).strip()
                    raise RuntimeError(
                        f"Maven dependency resolution failed for "
                        f"{pom_path}. Exit code: "
                        f"{maven_result.returncode}. "
                        f"Details: {details[-1500:]}"
                    )

                jar_count = sum(
                    1 for _, _, names in os.walk(dependency_directory)
                    for name in names if name.lower().endswith(".jar")
                )
                if jar_count == 0:
                    raise RuntimeError(
                        f"Maven completed but resolved no runtime JARs "
                        f"for {pom_path}."
                    )

            # Scan both source/manifests and the resolved Maven artifacts.
            scan_paths.append(resolved_root)

        command = [
            executable,
            "--project", "Secure SDLC Assistant",
        ]

        for scan_path in scan_paths:
            command.extend(["--scan", scan_path])

        command.extend([
            "--format", "JSON",
            "--out", report_directory,
            "--noupdate",
            "--disableYarnAudit",
            "--disableCentral",
        ])

        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=timeout,
                check=False,
            )
        except subprocess.TimeoutExpired as error:
            raise RuntimeError(
                f"Dependency-Check timed out after {timeout} seconds."
            ) from error
        except OSError as error:
            raise RuntimeError(
                "Could not start Dependency-Check. Verify its "
                "installation and Java configuration."
            ) from error

        if not os.path.isfile(report_path):
            details = (result.stderr or result.stdout or "").strip()
            raise RuntimeError(
                "Dependency-Check did not generate a JSON report. "
                f"Exit code: {result.returncode}. "
                f"Details: {details[:1000]}"
            )

        try:
            with open(report_path, "r", encoding="utf-8") as report_file:
                report_data = json.load(report_file)
        except (OSError, json.JSONDecodeError) as error:
            raise RuntimeError(
                "Dependency-Check generated an invalid JSON report."
            ) from error

        if result.returncode != 0:
            details = (result.stderr or result.stdout or "").strip()
            raise RuntimeError(
                "Dependency-Check reported an analysis error. "
                f"Exit code: {result.returncode}. "
                f"Details: {details[:1000]}"
            )

        if not isinstance(report_data, dict):
            raise RuntimeError(
                "Unexpected Dependency-Check report structure."
            )

        return report_data


def parse_dependency_check_results(report_data):
    """
    Convert Dependency-Check vulnerabilities into the application's
    standard Finding format. Do not store dependency source contents.
    """
    findings = []
    seen = set()

    for dependency in report_data.get("dependencies", []):
        if dependency.get("isVirtual"):
            continue

        raw_file_path = str(
            dependency.get("filePath")
            or dependency.get("fileName")
            or ""
        )

        packages = dependency.get("packages") or []
        package_names = [
            str(package.get("id") or package.get("name") or "")
            for package in packages
            if isinstance(package, dict)
        ]
        package_label = ", ".join(
            name for name in package_names if name
        )

        # Maven JARs are copied into a temporary directory for analysis.
        # Store a stable package identifier instead of a path that will disappear.
        normalized_path = raw_file_path.replace("\\", "/").lower()

        if (
            "secure_sdlc_dependency_check_" in normalized_path
            and "resolved-maven/" in normalized_path
        ):
            jar_name = os.path.basename(raw_file_path)

            # Use the JAR filename consistently for all Maven dependencies.
            dependency_label = (
                jar_name[:-4]
                if jar_name.lower().endswith(".jar")
                else jar_name
            )

            file_path = f"Maven dependency: {dependency_label}"
        else:
            file_path = clean_file_path(raw_file_path)

        file_path = file_path[:500]

        for vulnerability in dependency.get("vulnerabilities", []):
            vulnerability_id = str(
                vulnerability.get("name")
                or vulnerability.get("source")
                or "Dependency vulnerability"
            )[:255]

            key = (file_path, vulnerability_id)
            if key in seen:
                continue
            seen.add(key)

            cvssv3 = vulnerability.get("cvssv3")
            cvssv2 = vulnerability.get("cvssv2")
            scanner_severity = str(
                vulnerability.get("severity") or "Unknown"
            ).strip()

            severity = map_dependency_severity(
                scanner_severity,
                cvssv3,
                cvssv2,
            )

            description = str(
                vulnerability.get("description") or ""
            ).strip()

            # Preserve available scoring evidence for review.
            evidence_lines = [
                "Validation status: Needs advisory review",
                "Validation method: Automated Dependency-Check matching",
                f"Scanner-reported severity: {scanner_severity}",
            ]

            for version_label, score_data in (
                ("CVSS v3", cvssv3),
                ("CVSS v2", cvssv2),
            ):
                if not isinstance(score_data, dict):
                    continue

                score = score_data.get("baseScore")
                score_severity = (
                    score_data.get("baseSeverity")
                    or score_data.get("severity")
                )
                vector = (
                    score_data.get("vectorString")
                    or score_data.get("cvssv3")
                    or score_data.get("cvssv2")
                )

                if score is not None:
                    evidence = f"{version_label} base score: {score}"
                    if score_severity:
                        evidence += f" ({score_severity})"
                    evidence_lines.append(evidence)

                if vector:
                    evidence_lines.append(
                        f"{version_label} vector: {vector}"
                    )

            description += (
                ("\n\n" if description else "")
                + "Validation evidence:\n"
                + "\n".join(evidence_lines)
            )

            references = vulnerability.get("references") or []
            reference_urls = [
                str(reference["url"])
                for reference in references
                if isinstance(reference, dict)
                and reference.get("url")
            ]

            if reference_urls:
                description += (
                    ("\n\n" if description else "")
                    + "References: "
                    + ", ".join(reference_urls[:5])
                )

            remediation = (
                "Validation required: review the linked vendor advisory and "
                "confirm that the detected dependency and installed version "
                "are affected. Check the advisory for a fixed version, then "
                "upgrade to a supported release where appropriate and retest. "
                "Do not treat the scanner match alone as proof of exploitability."
            )

            if package_label:
                remediation += f" Detected package(s): {package_label}."


            # Prefer the v3 score when available; otherwise use v2.
            selected_cvss = None
            selected_cvss_version = ""


            if (
                isinstance(cvssv3, dict)
                and cvssv3.get("baseScore") is not None
            ):
                selected_cvss = cvssv3
                selected_cvss_version = str(
                    cvssv3.get("version") or "3"
                )
            elif (
                isinstance(cvssv2, dict)
                and cvssv2.get("baseScore") is not None
            ):
                selected_cvss = cvssv2
                selected_cvss_version = str(
                    cvssv2.get("version") or "2"
                )

            cvss_score = None
            cvss_vector = ""

            if selected_cvss is not None:
                try:
                    cvss_score = float(selected_cvss["baseScore"])
                except (TypeError, ValueError):
                    cvss_score = None

                cvss_vector = str(
                    selected_cvss.get("vectorString")
                    or selected_cvss.get("cvssv3")
                    or selected_cvss.get("cvssv2")
                    or ""
                )[:255]


            # Prefer a reference explicitly naming this CVE.
            # Otherwise prefer a security advisory page over generic docs.
            valid_reference_urls = [
                url
                for url in reference_urls
                if url.startswith(("https://", "http://"))
            ]

            cve_token = vulnerability_id.lower()

            cve_specific_urls = [
                url for url in valid_reference_urls
                if cve_token in url.lower()
            ]

            security_urls = [
                url for url in valid_reference_urls
                if any(
                    marker in url.lower()
                    for marker in (
                        "/security",
                        "/advisories/",
                        "/advisory/",
                        "nvd.nist.gov",
                        "osv.dev",
                        "github.com/advisories/",
                    )
                )
            ]


            # Prefer explicitly classified vendor advisories.
            # Never interpret the selected URL alone as verification.
            valid_references = [
                reference
                for reference in references
                if isinstance(reference, dict)
                and str(reference.get("url") or "").startswith(
                    ("https://", "http://")
                )
            ]

            cve_token = vulnerability_id.lower()

            vendor_advisories = [
                reference
                for reference in valid_references
                if "VENDOR_ADVISORY" in str(
                    reference.get("name") or ""
                ).upper()
            ]

            cve_vendor_advisories = [
                reference
                for reference in vendor_advisories
                if cve_token in str(reference["url"]).lower()
            ]

            cve_references = [
                reference
                for reference in valid_references
                if cve_token in str(reference["url"]).lower()
            ]

            selected_reference = (
                cve_vendor_advisories[0]
                if cve_vendor_advisories
                else vendor_advisories[0]
                if vendor_advisories
                else cve_references[0]
                if cve_references
                else valid_references[0]
                if valid_references
                else None
            )

            advisory_url = (
                str(selected_reference["url"])
                if selected_reference
                else ""
            )


            # Extract an installed version only from an explicit Maven
            # package URL; don't guess it from an artifact filename.
            installed_version = ""

                        # Preserve Maven group:artifact for advisory verification.
            package_name = ""

            for package in packages:
                if not isinstance(package, dict):
                    continue

                package_id = str(package.get("id") or "")

                match = re.search(
                    r"^pkg:maven/([^/@?#]+)/([^/@?#]+)",
                    package_id,
                    re.IGNORECASE,
                )

                if match:
                    package_name = (
                        f"{match.group(1)}:{match.group(2)}"
                    )
                    break

            for package in packages:
                if not isinstance(package, dict):
                    continue

                package_id = str(package.get("id") or "")
                match = re.search(
                    r"^pkg:maven/[^/@]+/[^/@]+@([^?#]+)",
                    package_id,
                    re.IGNORECASE,
                )

                if match:
                    installed_version = match.group(1)[:100]
                    break

            findings.append({
                "severity": severity,
                "title": f"Vulnerable dependency: {vulnerability_id}"[:255],
                "description": description[:10000],
                "file_path": file_path,
                "line_number": None,
                "rule_id": vulnerability_id,
                "tool": "OWASP Dependency-Check",
                "remediation": remediation[:10000],

                "validation_status": "needs_review",
                "scanner_severity": scanner_severity[:20],
                "cvss_score": cvss_score,
                "cvss_version": selected_cvss_version,
                "cvss_vector": cvss_vector,
                "installed_version": installed_version,
                "package_name": package_name,
                "advisory_severity": "",
                "fixed_version": "",
                "advisory_url": advisory_url[:1000],
            })

    return findings


def map_dependency_severity(
    severity,
    cvssv3=None,
    cvssv2=None,
):
    """Map Dependency-Check severity and CVSS scores to Finding severity."""
    mapping = {
        "CRITICAL": "critical",
        "HIGH": "high",
        "MEDIUM": "medium",
        "MODERATE": "medium",
        "LOW": "low",
        "INFO": "info",
        "INFORMATIONAL": "info",
    }

    normalized = str(severity or "").strip().upper()

    if normalized in mapping:
        return mapping[normalized]

    for score_data in (cvssv3, cvssv2):
        if not isinstance(score_data, dict):
            continue

        try:
            score = float(score_data.get("baseScore"))
        except (TypeError, ValueError):
            continue

        if score >= 9.0:
            return "critical"
        if score >= 7.0:
            return "high"
        if score >= 4.0:
            return "medium"
        if score > 0:
            return "low"

    return "info"
