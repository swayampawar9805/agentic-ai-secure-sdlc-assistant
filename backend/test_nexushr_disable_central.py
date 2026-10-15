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
base = Path(r"C:\Tools\dependency-check-reports\nexushr-jars")
dep_dir = base / "dependencies"
base.mkdir(parents=True, exist_ok=True)
dep_dir.mkdir(parents=True, exist_ok=True)

with tempfile.TemporaryDirectory(prefix="nexushr_resolve_") as tmp:
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

    pom = next(root.rglob("pom.xml"), None)
    if pom is None:
        raise RuntimeError("pom.xml not found")

    print("Resolving runtime dependencies...")
    mvn = subprocess.run(
        [
            "cmd.exe", "/c", str(pom.parent / "mvnw.cmd"),
            "-f", str(pom),
            "dependency:copy-dependencies",
            f"-DoutputDirectory={dep_dir}",
            "-DincludeScope=runtime",
        ],
        cwd=str(pom.parent),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=600,
        check=False,
    )

    if mvn.returncode != 0:
        print("Maven failed:")
        print("\n".join((mvn.stdout + "\n" + mvn.stderr).splitlines()[-40:]))
        raise SystemExit(mvn.returncode)

jars = list(dep_dir.glob("*.jar"))
print("Resolved JAR files:", len(jars))

if not jars:
    raise RuntimeError("No JAR files were resolved")

report_path = base / "dependency-check-report.json"
log_path = base / "scanner-disable-central.log"

# Remove the previous report so we don't mistake a stale report for this run.
if report_path.exists():
    report_path.unlink()

command = [
    r"C:\Tools\dependency-check\bin\dependency-check.bat",
    "--project", "NexusHR Resolved JAR Diagnostic",
    "--scan", str(dep_dir),
    "--format", "JSON",
    "--out", str(base),
    "--noupdate",
    "--disableYarnAudit",
    "--disableCentral",
]

print("Running Dependency-Check with Central Analyzer disabled...")
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
    f"EXIT CODE: {result.returncode}\n\nSTDOUT:\n"
    + result.stdout + "\n\nSTDERR:\n" + result.stderr,
    encoding="utf-8",
)

print("Dependency-Check exit code:", result.returncode)
print("Report exists:", report_path.exists())
print("Log:", log_path)

if report_path.exists():
    report = json.loads(report_path.read_text(encoding="utf-8"))
    deps = report.get("dependencies", [])
    print("Dependencies detected:", len(deps))
    print("Dependencies with vulnerability entries:",
          sum(bool(d.get("vulnerabilities")) for d in deps))
    print("Total vulnerability entries:",
          sum(len(d.get("vulnerabilities", [])) for d in deps))

print("\nRelevant log lines:")
for line in log_path.read_text(encoding="utf-8", errors="replace").splitlines():
    if any(term in line.lower() for term in ("[error]", "[warn]", "analysis complete")):
        print(line)
