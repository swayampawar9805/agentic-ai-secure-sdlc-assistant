import os
import tempfile
import zipfile
import subprocess
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
import django
django.setup()

from projects.models import Project

p = Project.objects.get(id=4)

with tempfile.TemporaryDirectory(prefix="nexushr_maven_test_") as tmp:
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
        print("ERROR: pom.xml not found")
    else:
        project_dir = pom.parent
        wrapper = project_dir / "mvnw.cmd"

        if not wrapper.exists():
            print("ERROR: Maven wrapper not found:", wrapper)
        else:
            print("Project directory:", project_dir)
            print("Running Maven dependency:tree...")
            result = subprocess.run(
                ["cmd.exe", "/c", str(wrapper), "-f", str(pom), "dependency:tree"],
                cwd=str(project_dir),
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=600,
                check=False,
            )

            output = result.stdout + "\n" + result.stderr
            log = Path(r"C:\Tools\dependency-check-reports\nexushr-debug\maven-tree.log")
            log.write_text(output, encoding="utf-8")

            print("Maven exit code:", result.returncode)
            print("Full log:", log)
            print("\nLast 60 lines:")
            print("\n".join(output.splitlines()[-60:]))
