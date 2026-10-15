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
report_dir = Path(r"C:\Tools\dependency-check-reports\nexushr-jars")
report_dir.mkdir(parents=True, exist_ok=True)

with tempfile.TemporaryDirectory(prefix="nexushr_jar_scan_") as tmp:
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
        raise RuntimeError("pom.xml not found in project archive")

    project_dir = pom.parent
    dependency_dir = root / "resolved-dependencies"
    dependency_dir.mkdir()

    print("Resolving and copying runtime dependencies...")
    mvn = subprocess.run(
        [
            "cmd.exe", "/c", str(project_dir / "mvnw.cmd"),
            "-f", str(pom),
            "dependency:copy-dependencies",
            f"-DoutputDirectory={dependency_dir}",
            "-DincludeScope=runtime",
        ],
        cwd=str(project_dir),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=600,
        check=False,
    )

    jars = list(dependency_dir.glob("*.jar"))
    print("Maven exit code:", mvn.returncode)
    print("Resolved JAR files:", len(jars))

    if mvn.returncode != 0 or not jars:
        print("\nMaven output (last 35 lines):")
        print("\n".join((mvn.stdout + "\n" + mvn.stderr).splitlines()[-35:]))
    else:
        print("\nRunning Dependency-Check on resolved JARs...")
        command = [
            r"C:\Tools\dependency-check\bin\dependency-check.bat",
            "--project", "NexusHR Resolved JAR Diagnostic",
            "--scan", str(dependency_dir),
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

        log = report_dir / "scanner.log"
        log.write_text(
            f"EXIT CODE: {result.returncode}\n\n"
            + result.stdout + "\n" + result.stderr,
            encoding="utf-8",
        )

        report_path = report_dir / "dependency-check-report.json"
        print("Dependency-Check exit code:", result.returncode)
        print("Report exists:", report_path.exists())
        print("Log:", log)

        if report_path.exists():
            report = json.loads(report_path.read_text(encoding="utf-8"))
            deps = report.get("dependencies", [])
            vulnerable = [
                d for d in deps if d.get("vulnerabilities")
            ]
            print("Dependencies detected:", len(deps))
            print("Dependencies with vulnerability entries:", len(vulnerable))
            print("Total vulnerability entries:",
                  sum(len(d.get("vulnerabilities", [])) for d in deps))
            print("\nSample detected dependencies:")
            for dep in deps[:15]:
                print("-", dep.get("fileName") or dep.get("filePath") or "Unknown")
        else:
            print("\nScanner log (last 35 lines):")
            print("\n".join(log.read_text(
                encoding="utf-8", errors="replace"
            ).splitlines()[-35:]))
