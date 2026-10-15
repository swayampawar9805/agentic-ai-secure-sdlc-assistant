import os
import zipfile
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from projects.models import Project

p = Project.objects.get(id=4)

with p.source_archive.open("rb") as archive:
    with zipfile.ZipFile(archive) as z:
        pom_name = next(
            (name for name in z.namelist() if name.lower().endswith("/pom.xml")),
            None,
        )

        if pom_name is None:
            print("No pom.xml found")
        else:
            print("Maven manifest:", pom_name)
            print(z.read(pom_name).decode("utf-8", errors="replace"))
