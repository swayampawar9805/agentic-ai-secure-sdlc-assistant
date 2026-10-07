import os
import shutil
import tempfile
import zipfile

from django.utils import timezone

from scanners.semgrep_scanner import (
    run_semgrep,
    parse_semgrep_results,
)

from .models import Scan, Finding


def safe_extract_zip(
    zip_file,
    destination,
):
    """
    Safely extract a ZIP archive into destination.

    Prevents ZIP path traversal attacks by ensuring
    every extracted path remains inside destination.
    """

    destination = os.path.abspath(
        destination
    )

    for member in zip_file.infolist():

        member_path = os.path.abspath(
            os.path.join(
                destination,
                member.filename,
            )
        )

        if not (
            member_path == destination
            or member_path.startswith(
                destination + os.sep
            )
        ):
            raise RuntimeError(
                "Unsafe ZIP archive detected: "
                f"{member.filename}"
            )

    zip_file.extractall(
        destination
    )


def run_scan(scan):
    """
    Execute a security scan for a Scan object.

    Currently supports ZIP-upload projects.
    """

    scan.status = "running"
    scan.error_message = ""
    scan.started_at = timezone.now()

    scan.save(
        update_fields=[
            "status",
            "error_message",
            "started_at",
            "updated_at",
        ]
    )

    temp_directory = None

    try:

        project = scan.project

        # 1. Validate project source
        if project.source_type != "zip":
            raise RuntimeError(
                "Only ZIP-upload projects are supported "
                "by the current scanner."
            )

        if not project.source_archive:
            raise RuntimeError(
                "Project does not have a source ZIP file."
            )

        # 2. Create temporary directory
        temp_directory = tempfile.mkdtemp(
            prefix="secure_sdlc_scan_"
        )

        # 3. Open ZIP
        with zipfile.ZipFile(
            project.source_archive.path,
            "r",
        ) as zip_file:

            # 4. Safely extract ZIP
            safe_extract_zip(
                zip_file,
                temp_directory,
            )

        # 5. Run Semgrep
        semgrep_data = run_semgrep(
            temp_directory
        )

        # 6. Parse Semgrep results
        findings = parse_semgrep_results(
            semgrep_data
        )

        # 7. Remove old findings
        Finding.objects.filter(
            scan=scan
        ).delete()

        # 8. Save new findings
        for finding_data in findings:

            Finding.objects.create(
                scan=scan,
                **finding_data
            )

        # 9. Mark scan completed
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

        # 10. Remove temporary scan directory
        if temp_directory:

            shutil.rmtree(
                temp_directory,
                ignore_errors=True,
            )