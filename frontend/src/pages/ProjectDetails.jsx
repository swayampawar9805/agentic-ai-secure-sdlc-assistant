import {
  ArrowLeft,
  FolderKanban,
  ShieldCheck,
  ScanSearch,
  Code2,
  CalendarDays,
  FileArchive,
  AlertTriangle,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

import {
  Link,
  useParams,
} from "react-router-dom";

import { useProjects } from "../context/ProjectContext";

function ProjectDetails() {
  const { id } = useParams();

  const { getProject } = useProjects();

  const project = getProject(id);

  if (!project) {
    return (
      <div className="page-container">
        <Link to="/projects" className="back-link">
          <ArrowLeft size={16} />
          Back to Projects
        </Link>

        <div className="card projects-empty">
          <h3>Project not found</h3>
          <p>The requested project does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container project-details-page">

      <Link to="/projects" className="back-link">
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      <div className="project-details-heading">

        <div className="project-details-identity">
          <div className="project-details-icon">
            <FolderKanban size={26} />
          </div>

          <div>
            <h1>{project.name}</h1>
            <p>{project.description || "No description provided."}</p>

            <div className="project-tags">
              <span>{project.language}</span>
              <span>{project.framework}</span>
              <span className="project-status">
                <i></i>
                {project.status}
              </span>
            </div>
          </div>
        </div>

        <button className="primary-button" type="button">
          <ScanSearch size={17} />
          Start Security Scan
        </button>

      </div>

      <div className="project-detail-stats">

        <div className="card project-detail-stat">
          <span>Security Score</span>
          <h2>
            {project.securityScore === null
              ? "Not scanned"
              : `${project.securityScore}%`}
          </h2>
          <ShieldCheck size={19} />
        </div>

        <div className="card project-detail-stat">
          <span>Vulnerabilities</span>
          <h2>{project.vulnerabilities ?? "—"}</h2>
          <AlertTriangle size={19} />
        </div>

        <div className="card project-detail-stat">
          <span>Project Language</span>
          <h2>{project.language}</h2>
          <Code2 size={19} />
        </div>

      </div>

      <div className="project-details-grid">

        <div className="card detail-section">
          <h3>Project Information</h3>

          <div className="detail-row">
            <span>Project ID</span>
            <strong>{project.id}</strong>
          </div>

          <div className="detail-row">
            <span>Framework</span>
            <strong>{project.framework}</strong>
          </div>

          <div className="detail-row">
            <span>Source Type</span>
            <strong>{project.sourceType}</strong>
          </div>

          <div className="detail-row">
            <span>Created At</span>
            <strong>{project.createdAt}</strong>
          </div>

          <div className="detail-row">
            <span>Project Status</span>
            <strong>{project.status}</strong>
          </div>
        </div>

        <div className="card detail-section">
          <h3>Source Repository</h3>

          <div className="repository-display">
            {project.sourceType === "GitHub" ? (
            <FaGithub size={24} />
            ) : (
            <FileArchive size={24} />
            )}

            <div>
              <strong>
                {project.sourceType === "GitHub"
                  ? "GitHub Repository"
                  : "Uploaded Source"}
              </strong>

              <span>
                {project.repositoryUrl ||
                  project.fileName ||
                  "Source metadata saved"}
              </span>
            </div>
          </div>

          <div className="repository-note">
            <CalendarDays size={16} />
            <span>
              Security analysis will be available after scanner integration.
            </span>
          </div>
        </div>

      </div>

      <div className="card detail-section scan-placeholder">
        <div>
          <h3>Security Analysis</h3>
          <p>
            Scan history, vulnerability findings, and AI-generated
            recommendations will appear here.
          </p>
        </div>

        <div className="scan-placeholder-icon">
          <ShieldCheck size={30} />
        </div>
      </div>

    </div>
  );
}

export default ProjectDetails;