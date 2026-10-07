import json
import os
import subprocess


def run_semgrep(
    target_path,
):
    """
    Run Semgrep against a source directory
    and return the raw JSON result.
    """

    command = [
        "semgrep",
        "scan",
        "--config",
        "auto",
        "--json",
        "--no-git-ignore",
        target_path,
    ]

    try:

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=300,
        )

    except FileNotFoundError:
        raise RuntimeError(
            "Semgrep is not installed or "
            "is not available in PATH."
        )

    except subprocess.TimeoutExpired:
        raise RuntimeError(
            "Semgrep scan timed out."
        )

    if not result.stdout:
        raise RuntimeError(
            "Semgrep returned no output.\n"
            f"Error: {result.stderr}"
        )

    try:

        data = json.loads(
            result.stdout
        )

    except json.JSONDecodeError:
        raise RuntimeError(
            "Semgrep returned invalid JSON.\n"
            f"Output: {result.stdout}\n"
            f"Error: {result.stderr}"
        )

    print(
        f"Semgrep findings: "
        f"{len(data.get('results', []))}"
    )

    print(
        f"Semgrep files scanned: "
        f"{data.get('paths', {}).get('scanned', [])}"
    )

    return data


def parse_semgrep_results(
    semgrep_data,
):
    """
    Convert Semgrep JSON results into
    the application's common finding format.
    """

    findings = []

    for result in semgrep_data.get(
        "results",
        []
    ):

        extra = result.get(
            "extra",
            {}
        )

        metadata = extra.get(
            "metadata",
            {}
        )

        finding = {
            "severity": map_severity(
                extra.get("severity")
            ),

            "title": get_finding_title(
                result,
                metadata,
            ),

            "description": extra.get(
                "message",
                "",
            ),

            "file_path": clean_file_path(
                result.get(
                    "path",
                    "",
                )
            ),

            "line_number": (
                result.get(
                    "start",
                    {}
                ).get(
                    "line"
                )
            ),

            "rule_id": result.get(
                "check_id",
                "",
            ),

            "tool": "Semgrep",

            "remediation": get_remediation(
                extra,
                metadata,
            ),
        }

        findings.append(
            finding
        )

    return findings


def get_remediation(
    extra,
    metadata,
):
    """
    Extract useful remediation guidance
    from Semgrep results.
    """

    fix = extra.get(
        "fix"
    )

    # Ignore Semgrep values such as:
    # False, "False", None, or empty strings.
    if isinstance(
        fix,
        str
    ):

        cleaned_fix = fix.strip()

        if (
            cleaned_fix
            and cleaned_fix.lower()
            not in ["false", "none", "null"]
        ):

            return cleaned_fix

    # Check for regex-based fixes.
    fix_regex = extra.get(
        "fix_regex"
    )

    if isinstance(
        fix_regex,
        dict
    ):

        replacement = fix_regex.get(
            "replacement"
        )

        if isinstance(
            replacement,
            str
        ):

            cleaned_replacement = (
                replacement.strip()
            )

            if (
                cleaned_replacement
                and cleaned_replacement.lower()
                not in [
                    "false",
                    "none",
                    "null",
                ]
            ):

                return cleaned_replacement

    # Use Semgrep's rule message as
    # remediation guidance.
    message = extra.get(
        "message",
        ""
    )

    if isinstance(
        message,
        str
    ) and message.strip():

        return (
            "Review the Semgrep recommendation: "
            + message.strip()
        )

    return (
        "Review the reported code and apply "
        "a secure implementation that eliminates "
        "the identified vulnerability."
    )


def clean_file_path(
    file_path,
):
    """
    Convert an absolute scanner path into
    a clean project-relative path.
    """

    if not file_path:
        return ""

    normalized = file_path.replace(
        "\\",
        "/"
    )

    parts = normalized.split("/")

    for index, part in enumerate(parts):

        if part.startswith(
            "secure_sdlc_scan_"
        ):

            relative_parts = (
                parts[index + 1:]
            )

            return "/".join(
                relative_parts
            )

    return normalized


def map_severity(
    severity,
):
    """
    Map Semgrep severity values to
    the application's Finding severity.
    """

    mapping = {
        "ERROR": "high",
        "WARNING": "medium",
        "INFO": "info",
    }

    return mapping.get(
        severity,
        "info",
    )


def get_finding_title(
    result,
    metadata,
):
    """
    Generate a useful finding title
    from Semgrep metadata.
    """

    vulnerability_class = (
        metadata.get(
            "vulnerability_class"
        )
    )

    if (
        vulnerability_class
        and isinstance(
            vulnerability_class,
            list
        )
    ):

        if vulnerability_class:
            return vulnerability_class[0]

    check_id = result.get(
        "check_id",
        "",
    )

    return (
        check_id
        or "Security Finding"
    )