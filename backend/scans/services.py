import os
import shutil
import tempfile
import zipfile
from django.db import transaction
import re
import subprocess
from urllib.parse import urlparse
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

from django.utils import timezone

from scanners.semgrep_scanner import (
    run_semgrep,
    parse_semgrep_results,
)

from scanners.gitleaks_scanner import (
    run_gitleaks,
    parse_gitleaks_results,
)

from scanners.dependency_check_scanner import (
    run_dependency_check,
    parse_dependency_check_results,
)

from .advisory_verifier import verify_dependency_advisory

from .models import Scan, Finding


def safe_extract_zip(
    zip_file,
    destination,
    max_files=5000,
    max_total_size=100 * 1024 * 1024,
    max_file_size=25 * 1024 * 1024,
    max_compression_ratio=100,
):
    """
    Safely extract ZIP archives with path and resource limits.

    Limits:
    - 5,000 archive entries
    - 100 MB total uncompressed data
    - 25 MB per file
    - Compression ratio of at most 100:1
    """

    destination = os.path.realpath(destination)
    members = zip_file.infolist()

    if len(members) > max_files:
        raise RuntimeError(
            f"ZIP contains too many entries. Maximum: {max_files}."
        )

    total_size = 0

    for member in members:
        # Reject symbolic links.
        unix_mode = (member.external_attr >> 16) & 0o170000

        if unix_mode == 0o120000:
            raise RuntimeError(
                "ZIP contains a symbolic link, which is not allowed."
            )

        # Reject encrypted entries because this scanner does not
        # support password-protected archives.
        if member.flag_bits & 0x1:
            raise RuntimeError(
                "Encrypted ZIP archives are not supported."
            )

        # Reject absolute paths and Windows drive paths.
        normalized_name = member.filename.replace("\\", "/")

        if (
            normalized_name.startswith("/")
            or re.match(r"^[A-Za-z]:", normalized_name)
        ):
            raise RuntimeError(
                "Unsafe absolute path found in ZIP archive."
            )

        # Resolve the target and ensure it stays inside destination.
        target_path = os.path.realpath(
            os.path.join(destination, normalized_name)
        )

        if not (
            target_path == destination
            or target_path.startswith(destination + os.sep)
        ):
            raise RuntimeError(
                f"Unsafe ZIP archive path: {member.filename}"
            )

        if member.file_size > max_file_size:
            raise RuntimeError(
                f"ZIP entry exceeds the per-file limit: "
                f"{member.filename}"
            )

        total_size += member.file_size

        if total_size > max_total_size:
            raise RuntimeError(
                "ZIP exceeds the maximum uncompressed size of 100 MB."
            )

        if member.file_size > 0:
            if member.compress_size == 0:
                raise RuntimeError(
                    "ZIP contains an invalid compression ratio."
                )

            ratio = member.file_size / member.compress_size

            if ratio > max_compression_ratio:
                raise RuntimeError(
                    f"ZIP entry has an excessive compression ratio: "
                    f"{member.filename}"
                )

    # Extract only after every entry passes validation.
    zip_file.extractall(destination)



def validate_github_url(repository_url):
    """Accept only standard public HTTPS GitHub repository URLs."""

    parsed = urlparse(repository_url.strip())

    if (
        parsed.scheme != "https"
        or parsed.hostname != "github.com"
        or parsed.username is not None
        or parsed.password is not None
        or parsed.port is not None
        or parsed.query
        or parsed.fragment
    ):
        raise RuntimeError(
            "Enter a valid public HTTPS GitHub repository URL."
        )

    parts = parsed.path.strip("/").split("/")

    if len(parts) != 2:
        raise RuntimeError(
            "GitHub URL must have the format "
            "https://github.com/owner/repository."
        )

    owner, repository = parts

    if repository.endswith(".git"):
        repository = repository[:-4]

    if (
        not re.fullmatch(r"[A-Za-z0-9-]+", owner)
        or not re.fullmatch(r"[A-Za-z0-9._-]+", repository)
        or repository in {".", ".."}
    ):
        raise RuntimeError("Invalid GitHub repository URL.")

    return (
        f"https://github.com/{owner}/{repository}.git"
    )


def check_github_repository_size(repository_url, max_size_mb=500):
    """
    Check GitHub's reported repository size before cloning.
    Reject repositories larger than the configured limit.
    """
    parsed = urlparse(repository_url)
    parts = parsed.path.strip("/").split("/")

    owner = parts[0]
    repository = parts[1]

    if repository.endswith(".git"):
        repository = repository[:-4]

    api_url = (
        f"https://api.github.com/repos/{owner}/{repository}"
    )

    request = Request(
        api_url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "SecureSDLC-Assistant",
        },
    )

    try:
        with urlopen(request, timeout=10) as response:
            repository_data = json.loads(
                response.read().decode("utf-8")
            )

    except HTTPError as error:
        if error.code == 404:
            raise RuntimeError(
                "GitHub repository was not found or is not public."
            ) from error

        if error.code == 403:
            raise RuntimeError(
                "GitHub API rate limit or access restriction reached. "
                "Try again later."
            ) from error

        raise RuntimeError(
            f"Could not verify GitHub repository size "
            f"(HTTP {error.code})."
        ) from error

    except (URLError, TimeoutError, OSError) as error:
        raise RuntimeError(
            "Could not reach GitHub to verify repository size. "
            "Check your internet connection and try again."
        ) from error

    size_kb = repository_data.get("size")

    if not isinstance(size_kb, int) or size_kb < 0:
        raise RuntimeError(
            "GitHub returned an invalid repository size."
        )

    size_mb = size_kb / 1024

    if size_mb > max_size_mb:
        raise RuntimeError(
            f"Repository is too large to scan. "
            f"Reported size: {size_mb:.1f} MB. "
            f"Maximum allowed: {max_size_mb} MB."
        )


def check_directory_size(directory, max_size_mb=500):
    """Reject a checked-out repository that exceeds the size limit."""
    max_size_bytes = max_size_mb * 1024 * 1024
    total_size = 0

    for root, directories, files in os.walk(directory):
        # Do not follow symbolic links.
        directories[:] = [
            name for name in directories
            if not os.path.islink(os.path.join(root, name))
        ]

        for filename in files:
            file_path = os.path.join(root, filename)

            if os.path.islink(file_path):
                continue

            try:
                total_size += os.path.getsize(file_path)
            except OSError:
                continue

            if total_size > max_size_bytes:
                raise RuntimeError(
                    "Repository checkout exceeds the maximum "
                    f"allowed size of {max_size_mb} MB."
                )


def clone_github_repository(project, target_directory):
    """Clone a public GitHub repository without executing its code."""

    repository_url = validate_github_url(
        project.repository_url
    )
    check_github_repository_size(repository_url)

    branch = project.default_branch or "main"

    if (
        not re.fullmatch(
            r"[A-Za-z0-9][A-Za-z0-9._/-]{0,99}",
            branch,
        )
        or ".." in branch
        or "//" in branch
        or branch.endswith(("/", "."))
        or "@{" in branch
        or any(part.startswith(".") for part in branch.split("/"))
    ):
        raise RuntimeError("Invalid GitHub branch name.")


    command = [
        "git",
        "-c", "core.protectNTFS=false",
        "clone",
        "--depth", "1",
        "--single-branch",
        "--branch", branch,
        "--no-checkout",
        repository_url,
        target_directory,
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=120,
            check=False,
        )
    except subprocess.TimeoutExpired as error:
        raise RuntimeError(
            "GitHub cloning timed out after 120 seconds."
        ) from error
    except FileNotFoundError as error:
        raise RuntimeError(
            "Git was not found. Install Git and ensure it is "
            "available on your system PATH."
        ) from error

    if result.returncode != 0:
        details = result.stderr.strip()

        raise RuntimeError(
            "GitHub repository cloning failed: "
            f"{details[:1000]}"
        )
    
    checkout_command = [
        "git",
        "-C", target_directory,
        "-c", "core.protectNTFS=false",
        "checkout",
        "--force",
        branch,
        "--",
    ]

    checkout_result = subprocess.run(
        checkout_command,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=120,
        check=False,
    )

    if checkout_result.returncode != 0:
        details = checkout_result.stderr.strip()

        raise RuntimeError(
            "GitHub repository checkout failed: "
            f"{details[:1000]}"
        )




def run_scan(scan):
    """
    Execute the requested security scan.

    Supported scan types:
    - full: Semgrep + Gitleaks
    - sast: Semgrep
    - secrets: Gitleaks

    Existing findings are preserved if scanning or
    atomic replacement fails.
    """

    scan.status = "running"
    scan.error_message = ""
    scan.started_at = timezone.now()
    scan.completed_at = None

    scan.save(
        update_fields=[
            "status",
            "error_message",
            "started_at",
            "completed_at",
            "updated_at",
        ]
    )

    temp_directory = None

    try:
        # 1. Validate the project source.
        project = scan.project

        if project.source_type not in {"zip", "github"}:
            raise RuntimeError(
                "Unsupported project source type."
            )

        if (
            project.source_type == "zip"
            and not project.source_archive
        ):
            raise RuntimeError(
                "Project does not have a source ZIP file."
            )

        if (
            project.source_type == "github"
            and not project.repository_url
        ):
            raise RuntimeError(
                "Project does not have a GitHub repository URL."
            )

        # 2. Validate the requested scan type.
        supported_scan_types = {
            "full",
            "sast",
            "secrets",
            "dependency",
        }

        if scan.scan_type not in supported_scan_types:
            raise RuntimeError(
                f"Scan type '{scan.scan_type}' is not supported yet. "
                "Available types: full, sast, secrets."
            )

        # 3. Create an isolated temporary directory.
        temp_directory = tempfile.mkdtemp(
            prefix="secure_sdlc_scan_"
        )

        # 4. Obtain the project source code.
        if project.source_type == "zip":
            with zipfile.ZipFile(
                project.source_archive.path,
                "r",
            ) as zip_file:
                safe_extract_zip(
                    zip_file,
                    temp_directory,
                )

        elif project.source_type == "github":
            clone_github_repository(
                project,
                temp_directory,
            )

        # 5. Check the extracted or checked-out size.
        check_directory_size(temp_directory)

        # 6. Execute the selected scanners.
        findings = []

        if scan.scan_type in {"full", "sast"}:
            semgrep_data = run_semgrep(
                temp_directory
            )

            findings.extend(
                parse_semgrep_results(
                    semgrep_data
                )
            )



        if scan.scan_type in {"full", "secrets"}:
            # Find a project-provided Gitleaks configuration.
            config_candidates = []

            for current_root, dirs, files in os.walk(temp_directory):
                dirs[:] = [
                    directory
                    for directory in dirs
                    if directory not in {
                        ".git",
                        "node_modules",
                        ".venv",
                        "venv",
                    }
                ]

                if ".gitleaks.toml" in files:
                    config_candidates.append(
                        os.path.join(current_root, ".gitleaks.toml")
                    )

            if len(config_candidates) > 1:
                raise ValueError(
                    "Multiple .gitleaks.toml files found. "
                    "Keep one project-level Gitleaks configuration."
                )

            gitleaks_config = (
                config_candidates[0]
                if config_candidates
                else None
            )

            gitleaks_data = run_gitleaks(
                temp_directory,
                config_path=gitleaks_config,
            )

            findings.extend(
                parse_gitleaks_results(gitleaks_data)
            )


        if scan.scan_type in {"full", "dependency"}:
            dependency_data = run_dependency_check(
                temp_directory
            )

            dependency_findings = parse_dependency_check_results(
                dependency_data
            )

            # Cache repeated checks within this scan.
            verification_cache = {}

            for finding_data in dependency_findings:
                # Temporary parser metadata; never pass it to Finding.
                package_name = finding_data.pop(
                    "package_name", ""
                )

                vulnerability_id = finding_data.get(
                    "rule_id", ""
                )
                installed_version = finding_data.get(
                    "installed_version", ""
                )

                # Only attempt independent verification when the
                # scanner supplied enough identifying information.
                if (
                    str(vulnerability_id).upper().startswith("CVE-")
                    and package_name
                    and installed_version
                ):
                    cache_key = (
                        vulnerability_id.upper(),
                        package_name.lower(),
                        installed_version,
                    )

                    if cache_key not in verification_cache:
                        verification_cache[cache_key] = (
                            verify_dependency_advisory(
                                vulnerability_id=vulnerability_id,
                                package_name=package_name,
                                installed_version=installed_version,
                            )
                        )

                    verification = verification_cache[cache_key]

                    # Keep the original scanner score and severity.
                    finding_data["validation_status"] = (
                        verification["validation_status"]
                    )

                    if verification.get("fixed_version"):
                        finding_data["fixed_version"] = (
                            verification["fixed_version"]
                        )

                    if verification.get("advisory_severity"):
                        finding_data["advisory_severity"] = (
                            verification["advisory_severity"]
                        )

                    verification_note = (
                        "\n\nIndependent advisory verification "
                        f"({verification['verification_source']}): "
                        f"{verification['verification_message']}"
                    )

                    finding_data["description"] = (
                        finding_data.get("description", "")
                        + verification_note
                    )[:10000]

            findings.extend(dependency_findings)


        print(f"Scan type: {scan.scan_type}")
        print(f"Total findings parsed: {len(findings)}")
        print(
            "Gitleaks findings:",
            sum(1 for f in findings if f["tool"] == "Gitleaks")
        )


        # 7. Atomically replace the findings.
        # If saving fails, the previous findings are restored.
        with transaction.atomic():
            Finding.objects.filter(
                scan=scan
            ).delete()

            Finding.objects.bulk_create(
                [
                    Finding(
                        scan=scan,
                        **finding_data
                    )
                    for finding_data in findings
                ]
            )

            scan.status = "completed"
            scan.error_message = ""
            scan.completed_at = timezone.now()

            scan.save(
                update_fields=[
                    "status",
                    "error_message",
                    "completed_at",
                    "updated_at",
                ]
            )

        return scan

    except Exception as error:
        scan.status = "failed"
        scan.error_message = str(error)
        scan.completed_at = timezone.now()

        scan.save(
            update_fields=[
                "status",
                "error_message",
                "completed_at",
                "updated_at",
            ]
        )

        raise

    finally:
        # Always remove temporary source files.
        if temp_directory:
            shutil.rmtree(
                temp_directory,
                ignore_errors=True,
            )

