import { useMemo, useState } from "react";

import {
  Plus,
  Search,
  FolderKanban,
  ExternalLink,
  Trash2,
  ShieldCheck,
  Code2,
  CalendarDays,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useProjects } from "../context/ProjectContext";


function Projects() {

  const {
    projects,
    loading,
    error,
    deleteProject,
  } = useProjects();


  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("All");
  const [view, setView] = useState("grid");


  const filteredProjects = useMemo(() => {

    return projects.filter((project) => {

      const projectName =
        project.name || "";

      const projectDescription =
        project.description || "";


      const matchesSearch =
        projectName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        projectDescription
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );


      const matchesLanguage =
        language === "All" ||
        project.language === language;


      return (
        matchesSearch &&
        matchesLanguage
      );

    });

  }, [
    projects,
    search,
    language,
  ]);


  const languages = [
    "All",
    ...new Set(
      projects
        .map(
          (project) =>
            project.language
        )
        .filter(Boolean)
    ),
  ];


  const activeProjects =
    projects.filter(
      (project) =>
        project.status === "active"
    ).length;


  const languageCount =
    new Set(
      projects
        .map(
          (project) =>
            project.language
        )
        .filter(Boolean)
    ).size;


  const handleDelete = async (
    project
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${project.name}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await deleteProject(
        project.id
      );

    } catch {

      // ProjectContext handles the error.
    }
  };


  const formatDate = (
    date
  ) => {

    if (!date) {
      return "—";
    }


    return new Date(
      date
    ).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };


  return (
    <div className="page-container projects-page">

      <div className="projects-heading">

        <div className="page-header">

          <h1>
            My Projects
          </h1>

          <p>
            Manage your repositories and
            monitor their security posture.
          </p>

        </div>


        <Link
          to="/projects/new"
          className="primary-button"
        >
          <Plus size={17} />
          Create Project
        </Link>

      </div>


      {error && (
        <div
          className="form-error"
          role="alert"
        >
          {error}
        </div>
      )}


      <div className="project-summary">

        <div className="card project-summary-card">

          <div className="summary-icon">
            <FolderKanban size={20} />
          </div>

          <div>

            <span>
              Total Projects
            </span>

            <h2>
              {projects.length}
            </h2>

          </div>

        </div>


        <div className="card project-summary-card">

          <div className="summary-icon green">
            <ShieldCheck size={20} />
          </div>

          <div>

            <span>
              Active Projects
            </span>

            <h2>
              {activeProjects}
            </h2>

          </div>

        </div>


        <div className="card project-summary-card">

          <div className="summary-icon purple">
            <Code2 size={20} />
          </div>

          <div>

            <span>
              Languages
            </span>

            <h2>
              {languageCount}
            </h2>

          </div>

        </div>

      </div>


      <div className="project-toolbar">

        <div className="project-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        <div className="project-filters">

          <div className="filter-control">

            <SlidersHorizontal
              size={16}
            />

            <select
              value={language}
              onChange={(e) =>
                setLanguage(
                  e.target.value
                )
              }
            >

              {languages.map(
                (item) => (

                  <option
                    key={item}
                    value={item}
                  >
                    {item === "All"
                      ? "All Languages"
                      : item}
                  </option>

                )
              )}

            </select>

          </div>


          <div className="view-toggle">

            <button
              type="button"
              aria-label="Grid view"
              className={
                view === "grid"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setView("grid")
              }
            >
              <LayoutGrid
                size={17}
              />
            </button>


            <button
              type="button"
              aria-label="List view"
              className={
                view === "list"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setView("list")
              }
            >
              <List size={18} />
            </button>

          </div>

        </div>

      </div>


      <div className="projects-result-heading">

        <h3>
          All Projects
        </h3>

        <span>
          {filteredProjects.length}{" "}
          {filteredProjects.length === 1
            ? "project"
            : "projects"}{" "}
          found
        </span>

      </div>


      {loading ? (

        <div className="card projects-empty">

          <FolderKanban
            size={35}
          />

          <h3>
            Loading projects...
          </h3>

          <p>
            Fetching your projects
            from the server.
          </p>

        </div>

      ) : filteredProjects.length === 0 ? (

        <div className="card projects-empty">

          <FolderKanban
            size={35}
          />

          <h3>
            No projects found
          </h3>

          <p>
            Try changing your search
            or create a new project.
          </p>


          <Link
            to="/projects/new"
            className="primary-button"
          >

            <Plus size={16} />

            Create Project

          </Link>

        </div>

      ) : (

        <div
          className={`projects-grid ${
            view === "list"
              ? "list-view"
              : ""
          }`}
        >

          {filteredProjects.map(
            (project) => (

              <div
                className="card project-card"
                key={project.id}
              >

                <div className="project-card-top">

                  <div className="project-card-icon">

                    <FolderKanban
                      size={21}
                    />

                  </div>


                  <button
                    className="project-menu-button"
                    type="button"
                    aria-label={`Delete ${project.name}`}
                    onClick={() =>
                      handleDelete(
                        project
                      )
                    }
                  >

                    <Trash2
                      size={17}
                    />

                  </button>

                </div>


                <div className="project-card-title">

                  <h3>
                    {project.name}
                  </h3>


                  <span className="project-status">

                    <i></i>

                    {project.status ===
                    "active"
                      ? "Active"
                      : "Archived"}

                  </span>

                </div>


                <p className="project-description">

                  {project.description ||
                    "No description provided."}

                </p>


                <div className="project-tags">

                  {project.language && (
                    <span>
                      {project.language}
                    </span>
                  )}

                  {project.framework && (
                    <span>
                      {project.framework}
                    </span>
                  )}

                  {project.source_type && (
                    <span>
                      {project.source_type ===
                      "github"
                        ? "GitHub"
                        : "ZIP"}
                    </span>
                  )}

                </div>


                <div className="project-card-divider"></div>


                <div className="project-metrics">

                  <div>

                    <span>
                      Security Score
                    </span>

                    <strong>
                      Not scanned
                    </strong>

                  </div>


                  <div>

                    <span>
                      Vulnerabilities
                    </span>

                    <strong>
                      —
                    </strong>

                  </div>

                </div>


                <div className="project-card-bottom">

                  <span className="project-date">

                    <CalendarDays
                      size={14}
                    />

                    {formatDate(
                      project.created_at
                    )}

                  </span>


                  <Link
                    to={`/projects/${project.id}`}
                    className="project-open-link"
                  >

                    View Project

                    <ExternalLink
                      size={14}
                    />

                  </Link>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}


export default Projects;