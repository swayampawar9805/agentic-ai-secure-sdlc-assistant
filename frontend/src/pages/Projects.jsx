import { useMemo, useState } from "react";

import {
  Plus,
  Search,
  FolderKanban,
  MoreHorizontal,
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
  const { projects, deleteProject } = useProjects();

  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("All");
  const [view, setView] = useState("grid");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase());

      const matchesLanguage =
        language === "All" || project.language === language;

      return matchesSearch && matchesLanguage;
    });
  }, [projects, search, language]);

  const languages = [
    "All",
    ...new Set(projects.map((project) => project.language)),
  ];

  const handleDelete = (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`
    );

    if (confirmed) {
      deleteProject(project.id);
    }
  };

  return (
    <div className="page-container projects-page">

      <div className="projects-heading">

        <div className="page-header">
          <h1>My Projects</h1>
          <p>
            Manage your repositories and monitor their security posture.
          </p>
        </div>

        <Link to="/projects/new" className="primary-button">
          <Plus size={17} />
          Create Project
        </Link>

      </div>

      <div className="project-summary">

        <div className="card project-summary-card">
          <div className="summary-icon">
            <FolderKanban size={20} />
          </div>

          <div>
            <span>Total Projects</span>
            <h2>{projects.length}</h2>
          </div>
        </div>

        <div className="card project-summary-card">
          <div className="summary-icon green">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>Active Projects</span>
            <h2>
              {projects.filter((p) => p.status === "Active").length}
            </h2>
          </div>
        </div>

        <div className="card project-summary-card">
          <div className="summary-icon purple">
            <Code2 size={20} />
          </div>

          <div>
            <span>Languages</span>
            <h2>{new Set(projects.map((p) => p.language)).size}</h2>
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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="project-filters">

          <div className="filter-control">
            <SlidersHorizontal size={16} />

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All Languages" : item}
                </option>
              ))}
            </select>
          </div>

          <div className="view-toggle">
            <button
              type="button"
              aria-label="Grid view"
              className={view === "grid" ? "selected" : ""}
              onClick={() => setView("grid")}
            >
              <LayoutGrid size={17} />
            </button>

            <button
              type="button"
              aria-label="List view"
              className={view === "list" ? "selected" : ""}
              onClick={() => setView("list")}
            >
              <List size={18} />
            </button>
          </div>

        </div>

      </div>

      <div className="projects-result-heading">
        <h3>All Projects</h3>
        <span>{filteredProjects.length} projects found</span>
      </div>

      {filteredProjects.length === 0 ? (

        <div className="card projects-empty">
          <FolderKanban size={35} />
          <h3>No projects found</h3>
          <p>Try changing your search or create a new project.</p>

          <Link to="/projects/new" className="primary-button">
            <Plus size={16} />
            Create Project
          </Link>
        </div>

      ) : (

        <div className={`projects-grid ${view === "list" ? "list-view" : ""}`}>

          {filteredProjects.map((project) => (

            <div className="card project-card" key={project.id}>

              <div className="project-card-top">

                <div className="project-card-icon">
                  <FolderKanban size={21} />
                </div>

                <button
                  className="project-menu-button"
                  type="button"
                  aria-label={`Delete ${project.name}`}
                  onClick={() => handleDelete(project)}
                >
                  <Trash2 size={17} />
                </button>

              </div>

              <div className="project-card-title">
                <h3>{project.name}</h3>

                <span className="project-status">
                  <i></i>
                  {project.status}
                </span>
              </div>

              <p className="project-description">
                {project.description}
              </p>

              <div className="project-tags">
                <span>{project.language}</span>
                <span>{project.framework}</span>
              </div>

              <div className="project-card-divider"></div>

              <div className="project-metrics">

                <div>
                  <span>Security Score</span>

                  <strong>
                    {project.securityScore === null
                      ? "Not scanned"
                      : `${project.securityScore}%`}
                  </strong>
                </div>

                <div>
                  <span>Vulnerabilities</span>

                  <strong className={
                    project.vulnerabilities > 7 ? "danger-text" : ""
                  }>
                    {project.vulnerabilities ?? "—"}
                  </strong>
                </div>

              </div>

              <div className="project-card-bottom">

                <span className="project-date">
                  <CalendarDays size={14} />
                  {project.createdAt}
                </span>

                <Link
                  to={`/projects/${project.id}`}
                  className="project-open-link"
                >
                  View Project
                  <ExternalLink size={14} />
                </Link>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Projects;