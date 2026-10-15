from pathlib import Path

path = Path("scanners/dependency_check_scanner.py")
source = path.read_text(encoding="utf-8")

start = source.index("def run_dependency_check(")
end = source.index("\ndef parse_dependency_check_results(", start)

replacement = r'''
def run_dependency_check(target_path, timeout=600):
    """
    Run OWASP Dependency-Check against a project directory.

    Maven projects have their runtime dependencies resolved first.
    The original project directory is also scanned so other supported
    ecosystems in a mixed-language repository are not skipped.
    """
    executable = os.environ.get(
        "DEPENDENCY_CHECK_PATH",
        DEFAULT_EXECUTABLE,
    )

    if not os.path.isfile(executable):
        raise RuntimeError(
            "Dependency-Check was not found. Check "
            "DEPENDENCY_CHECK_PATH and the installation path."
        )

    target_path = os.path.abspath(target_path)

    with tempfile.TemporaryDirectory(
        prefix="secure_sdlc_dependency_check_"
    ) as work_directory:
        report_directory = os.path.join(work_directory, "report")
        os.makedirs(report_directory)
        report_path = os.path.join(
            report_directory,
            "dependency-check-report.json",
        )

        scan_paths = [target_path]

        # Ignore generated/vendor directories when searching for Maven POMs.
        excluded_directories = {
            ".git", "node_modules", ".venv", "venv",
            "target", "build", "dist",
        }
        pom_files = []

        for current_root, dirs, files in os.walk(target_path):
            dirs[:] = [
                name for name in dirs
                if name not in excluded_directories
            ]
            if "pom.xml" in files:
                pom_files.append(os.path.join(current_root, "pom.xml"))

        if pom_files:
            # Keep each Maven module's resolved artifacts in a separate folder.
            resolved_root = os.path.join(work_directory, "resolved-maven")
            os.makedirs(resolved_root)

            for index, pom_path in enumerate(sorted(pom_files), start=1):
                project_directory = os.path.dirname(pom_path)
                wrapper_name = (
                    "mvnw.cmd" if os.name == "nt" else "mvnw"
                )
                wrapper_path = os.path.join(
                    project_directory, wrapper_name
                )

                if os.path.isfile(wrapper_path):
                    if os.name == "nt":
                        maven_command = [
                            "cmd.exe", "/c", wrapper_path,
                        ]
                    else:
                        maven_command = [wrapper_path]
                else:
                    import shutil
                    maven_executable = shutil.which("mvn")
                    if not maven_executable:
                        raise RuntimeError(
                            f"Maven POM found at {pom_path}, but no "
                            "Maven wrapper or installed Maven executable "
                            "was found."
                        )
                    if os.name == "nt":
                        maven_command = [
                            "cmd.exe", "/c", maven_executable,
                        ]
                    else:
                        maven_command = [maven_executable]

                dependency_directory = os.path.join(
                    resolved_root, f"module-{index}"
                )
                os.makedirs(dependency_directory)

                maven_command.extend([
                    "-f", pom_path,
                    "dependency:copy-dependencies",
                    f"-DoutputDirectory={dependency_directory}",
                    "-DincludeScope=runtime",
                ])

                try:
                    maven_result = subprocess.run(
                        maven_command,
                        cwd=project_directory,
                        capture_output=True,
                        text=True,
                        encoding="utf-8",
                        errors="replace",
                        timeout=timeout,
                        check=False,
                    )
                except subprocess.TimeoutExpired as error:
                    raise RuntimeError(
                        f"Maven dependency resolution timed out for "
                        f"{pom_path} after {timeout} seconds."
                    ) from error
                except OSError as error:
                    raise RuntimeError(
                        f"Could not start Maven for {pom_path}."
                    ) from error

                if maven_result.returncode != 0:
                    details = (
                        maven_result.stderr or maven_result.stdout or ""
                    ).strip()
                    raise RuntimeError(
                        f"Maven dependency resolution failed for "
                        f"{pom_path}. Exit code: "
                        f"{maven_result.returncode}. "
                        f"Details: {details[-1500:]}"
                    )

                jar_count = sum(
                    1 for _, _, names in os.walk(dependency_directory)
                    for name in names if name.lower().endswith(".jar")
                )
                if jar_count == 0:
                    raise RuntimeError(
                        f"Maven completed but resolved no runtime JARs "
                        f"for {pom_path}."
                    )

            # Scan both source/manifests and the resolved Maven artifacts.
            scan_paths.append(resolved_root)

        command = [
            executable,
            "--project", "Secure SDLC Assistant",
        ]

        for scan_path in scan_paths:
            command.extend(["--scan", scan_path])

        command.extend([
            "--format", "JSON",
            "--out", report_directory,
            "--noupdate",
            "--disableYarnAudit",
            "--disableCentral",
        ])

        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=timeout,
                check=False,
            )
        except subprocess.TimeoutExpired as error:
            raise RuntimeError(
                f"Dependency-Check timed out after {timeout} seconds."
            ) from error
        except OSError as error:
            raise RuntimeError(
                "Could not start Dependency-Check. Verify its "
                "installation and Java configuration."
            ) from error

        if not os.path.isfile(report_path):
            details = (result.stderr or result.stdout or "").strip()
            raise RuntimeError(
                "Dependency-Check did not generate a JSON report. "
                f"Exit code: {result.returncode}. "
                f"Details: {details[:1000]}"
            )

        try:
            with open(report_path, "r", encoding="utf-8") as report_file:
                report_data = json.load(report_file)
        except (OSError, json.JSONDecodeError) as error:
            raise RuntimeError(
                "Dependency-Check generated an invalid JSON report."
            ) from error

        if result.returncode != 0:
            details = (result.stderr or result.stdout or "").strip()
            raise RuntimeError(
                "Dependency-Check reported an analysis error. "
                f"Exit code: {result.returncode}. "
                f"Details: {details[:1000]}"
            )

        if not isinstance(report_data, dict):
            raise RuntimeError(
                "Unexpected Dependency-Check report structure."
            )

        return report_data

'''

path.write_text(
    source[:start] + replacement + source[end:],
    encoding="utf-8",
)
print("Updated run_dependency_check()")
