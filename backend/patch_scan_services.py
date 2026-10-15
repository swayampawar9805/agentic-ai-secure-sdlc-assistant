from pathlib import Path

path = Path("scans/services.py")
source = path.read_text(encoding="utf-8")

old = '''            if scan.scan_type in {"full", "dependency"}:
                dependency_data = run_dependency_check(
                temp_directory
                )

                findings.extend(
                    parse_dependency_check_results(
                        dependency_data
                    )
                )
'''

new = '''        if scan.scan_type in {"full", "dependency"}:
            dependency_data = run_dependency_check(
                temp_directory
            )

            findings.extend(
                parse_dependency_check_results(
                    dependency_data
                )
            )
'''

if old not in source:
    raise SystemExit(
        "Expected dependency block was not found. "
        "No changes were made to services.py."
    )

path.write_text(source.replace(old, new, 1), encoding="utf-8")
print("Moved dependency scanning outside the Gitleaks block")
