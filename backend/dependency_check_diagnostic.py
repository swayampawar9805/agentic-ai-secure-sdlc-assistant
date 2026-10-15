import tempfile
import zipfile
from pathlib import Path

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from projects.models import Project
from scanners.dependency_check_scanner import (
    run_dependency_check,
    parse_dependency_check_results,
)

p = Project.objects.get(id=4)
print("Project:", p.name)

with tempfile.TemporaryDirectory(prefix="nexushr_dependency_test_") as tmp:
    root = Path(tmp).resolve()

    with p.source_archive.open("rb") as archive:
        with zipfile.ZipFile(archive) as z:
            for item in z.infolist():
                destination = (root / item.filename).resolve()

                if destination != root and root not in destination.parents:
                    raise ValueError("Unsafe ZIP path detected")

                if item.is_dir():
                    destination.mkdir(parents=True, exist_ok=True)
                else:
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    with z.open(item) as source, destination.open("wb") as target:
                        target.write(source.read())

    print("Maven pom.xml files:", len(list(root.rglob("pom.xml"))))

    report = run_dependency_check(str(root))
    dependencies = report.get("dependencies", [])
    vulnerable = [d for d in dependencies if d.get("vulnerabilities")]
    findings = parse_dependency_check_results(report)

    print("\n=== DIRECT SCAN RESULTS ===")
    print("Report project:", report.get("projectInfo", {}).get("name"))
    print("Dependencies detected:", len(dependencies))
    print("Dependencies with vulnerabilities:", len(vulnerable))
    print("Vulnerability entries:", sum(
        len(d.get("vulnerabilities", [])) for d in dependencies
    ))
    print("Parsed application findings:", len(findings))

    print("\nDependency examples:")
    for d in dependencies[:15]:
        print({
            "file": d.get("filePath") or d.get("fileName"),
            "packages": [
                package.get("id")
                for package in (d.get("packages") or [])[:3]
                if isinstance(package, dict)
            ],
            "vulnerabilities": len(d.get("vulnerabilities", [])),
        })

    print("\nVulnerable dependencies:")
    for d in vulnerable:
        for v in d.get("vulnerabilities", []):
            print({
                "dependency": d.get("filePath") or d.get("fileName"),
                "id": v.get("name"),
                "severity": v.get("severity"),
            })

