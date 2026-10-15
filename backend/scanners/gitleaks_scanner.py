import os
import json
import subprocess

from scanners.semgrep_scanner import clean_file_path



def run_gitleaks(target_path, timeout=300, config_path=None):
    """
    Scan a directory for exposed secrets using Gitleaks.

    By default, Gitleaks uses its built-in rules.
    An explicit config_path can be supplied for controlled tests.
    Secret values are redacted in the scanner output.
    """
    target_path = os.path.abspath(target_path)

    command = [
        "gitleaks",
        "dir",
        "--report-format", "json",
        "--report-path", "-",
        "--redact", "100",
        "--no-banner",
        "--timeout", str(timeout),
    ]

    if config_path:
        command.extend([
            "--config",
            os.path.abspath(config_path),
        ])

    command.append(target_path)

    try:
        result = subprocess.run(
            command[:-1] + ["."],
            cwd=target_path,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout + 10,
            check=False,
        )

    except FileNotFoundError as error:
        raise RuntimeError(
            "Gitleaks is not installed or is not available in PATH."
        ) from error

    except subprocess.TimeoutExpired as error:
        raise RuntimeError(
            f"Secret scan timed out after {timeout} seconds."
        ) from error

    if result.returncode not in (0, 1):
        raise RuntimeError(
            "Gitleaks scan failed: "
            f"{result.stderr.strip()[:1000]}"
        )

    try:
        data = json.loads(result.stdout or "[]")
    except json.JSONDecodeError as error:
        raise RuntimeError(
            "Gitleaks returned invalid JSON."
        ) from error

    if not isinstance(data, list):
        raise RuntimeError(
            "Gitleaks returned an unexpected JSON structure."
        )

    return data



def parse_gitleaks_results(gitleaks_data):
    """
    Convert Gitleaks results to the application's Finding format.

    Never store the raw Secret or Match values.
    """

    findings = []

    for result in gitleaks_data:
        rule_id = str(
            result.get("RuleID") or "secret-detection"
        )[:255]

        rule_description = str(
            result.get("Description") or "Exposed secret"
        )

        rule_lower = rule_id.lower()
        description_lower = rule_description.lower()

        if (
            "private-key" in rule_lower
            or "private key" in description_lower
        ):
            severity = "critical"
        else:
            severity = "high"

        file_path = clean_file_path(
            str(result.get("File") or "")
        )[:500]

        line_number = result.get("StartLine")

        if (
            not isinstance(line_number, int)
            or isinstance(line_number, bool)
            or line_number < 1
        ):
            line_number = None

        findings.append({
            "severity": severity,
            "title": f"Exposed Secret: {rule_description}"[:255],
            "description": (
                "Gitleaks detected a potential exposed secret. "
                "The secret value has been redacted. Review the "
                "referenced file and rotate the credential if it "
                "is real. Remove the secret from source code and "
                "use environment variables or a secrets manager."
            ),
            "file_path": file_path,
            "line_number": line_number,
            "rule_id": rule_id,
            "tool": "Gitleaks",
            "remediation": (
                "Remove the exposed credential from the source "
                "code, revoke or rotate it if it is real, and "
                "store replacement credentials in environment "
                "variables or a secrets manager. Review repository "
                "history for previous exposure."
            ),
        })

    return findings
