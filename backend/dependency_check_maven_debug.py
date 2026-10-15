import os
import tempfile
import zipfile
import subprocess
import json
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
import django
django.setup()

from projects.models import Project

p = Project.objects.get(id=4)
report_dir = Path(r"C:\Tools\dependency-check-reports\nexushr-debug")
report_dir.mkdir(parents=True, exist_ok=True)
log_path = report_dir / "scanner.log"

with tempfile.TemporaryDirectory(prefix="nexushr_dc_debug_") as tmp:
    root = Path(tmp).resolve()

    with p.source_archive.open("rb") as archive:
        with zipfile.ZipFile(archive) as z:
            for item in z.infolist():
                dest = (root / item.filename).resolve()
                if dest != root and root not in dest.parents:
                    raise ValueError("Unsafe ZIP path detected")
                if item.is_dir():
                    dest.mkdir(parents=True, exist_ok=True)
                else:
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    with z.open(item) as src, dest.open("wb") as dst:
                        dst.write(src.read())

    command = [
        r"C:\Tools\dependency-check\bin\dependency-check.bat",
        "--project", "NexusHR Maven Diagnostic",
        "--scan", str(root),
        "--format", "JSON",
        "--out", str(report_dir),
        "--noupdate",
        "--disableYarnAudit",
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=600,
        check=False,
    )

    log_path.write_text(
        "EXIT CODE: " + str(result.returncode) + "\n\nSTDOUT:\n"
        + result.stdout + "\n\nSTDERR:\n" + result.stderr,
        encoding="utf-8",
    )

    report_path = report_dir / "dependency-check-report.json"
    print("Exit code:", result.returncode)
    print("Log:", log_path)
    print("Report exists:", report_path.exists())

    if report_path.exists():
        report = json.loads(report_path.read_text(encoding="utf-8"))
        deps = report.get("dependencies", [])
        print("Dependencies detected:", len(deps))
        print("Dependencies with vulnerabilities:",
              sum(bool(d.get("vulnerabilities")) for d in deps))

print("\nLast 50 log lines:")
if log_path.exists():
    lines = log_path.read_text(encoding="utf-8", errors="replace").splitlines()
    print("\n".join(lines[-50:]))
