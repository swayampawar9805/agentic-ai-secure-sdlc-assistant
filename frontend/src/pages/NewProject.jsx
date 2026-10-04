import { useState } from "react";

import {
  ArrowLeft,
  FolderPlus,
  Code2,
  Upload,
  FileArchive,
  X,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useProjects } from "../context/ProjectContext";

function NewProject() {
  const navigate = useNavigate();

  const { addProject } = useProjects();

  const [sourceType, setSourceType] = useState("zip");
  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    language: "",
    framework: "",
    repositoryUrl: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFile = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".zip")) {
      setError("Please select a ZIP archive.");
      setFile(null);
      return;
    }

    if (selected.size > 100 * 1024 * 1024) {
      setError("Maximum file size is 100 MB.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.language || !form.framework) {
      setError("Please complete all required project fields.");
      return;
    }

    if (sourceType === "zip" && !file) {
      setError("Please upload a ZIP file.");
      return;
    }

    if (sourceType === "github") {
      try {
        const url = new URL(form.repositoryUrl);

        if (
          url.hostname !== "github.com" &&
          url.hostname !== "www.github.com"
        ) {
          setError("Please provide a valid GitHub repository URL.");
          return;
        }
      } catch {
        setError("Please enter a valid repository URL.");
        return;
      }
    }

    const newProject = addProject({
      ...form,
      sourceType: sourceType === "zip" ? "Upload ZIP" : "GitHub",
      repositoryUrl:
        sourceType === "github" ? form.repositoryUrl : "",
      fileName: sourceType === "zip" ? file.name : "",
    });

    navigate(`/projects/${newProject.id}`);
  };

  return (
    <div className="page-container new-project-page">

      <Link to="/projects" className="back-link">
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      <div className="page-header">
        <h1>Create New Project</h1>
        <p>
          Configure your application before beginning security analysis.
        </p>
      </div>

      <form className="project-form" onSubmit={handleSubmit}>

        <div className="card form-section">

          <div className="form-section-heading">
            <div className="form-section-icon">
              <FolderPlus size={20} />
            </div>

            <div>
              <h3>Project Information</h3>
              <p>Basic details about your software project.</p>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="project-name">
              Project Name <span>*</span>
            </label>

            <input
              id="project-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Healthcare Management System"
              maxLength={100}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="project-description">
              Description
            </label>

            <textarea
              id="project-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the purpose and functionality of your application..."
              rows={4}
              maxLength={1000}
            />
          </div>

          <div className="form-row">

            <div className="form-field">
              <label htmlFor="project-language">
                Programming Language <span>*</span>
              </label>

              <select
                id="project-language"
                name="language"
                value={form.language}
                onChange={(e) => {
                  setForm({
                    ...form,
                    language: e.target.value,
                    framework: "",
                  });
                }}
                required
              >
                <option value="">Select Language</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="C">C</option>
                <option value="C++">C++</option>
                <option value="C#">C#</option>
                <option value="Go">Go</option>
                <option value="PHP">PHP</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="project-framework">
                Framework <span>*</span>
              </label>

              <select
                id="project-framework"
                name="framework"
                value={form.framework}
                onChange={handleChange}
                required
              >
                <option value="">Select Framework</option>

                {form.language === "Python" && (
                  <>
                    <option>Django</option>
                    <option>Flask</option>
                    <option>FastAPI</option>
                    <option>Other</option>
                  </>
                )}

                {form.language === "Java" && (
                  <>
                    <option>Spring Boot</option>
                    <option>Spring MVC</option>
                    <option>Java Servlets</option>
                    <option>Other</option>
                  </>
                )}

                {form.language === "JavaScript" && (
                  <>
                    <option>React + Node.js</option>
                    <option>Express.js</option>
                    <option>Next.js</option>
                    <option>Vue.js</option>
                    <option>Other</option>
                  </>
                )}

                {form.language === "TypeScript" && (
                  <>
                    <option>React</option>
                    <option>Next.js</option>
                    <option>Angular</option>
                    <option>NestJS</option>
                    <option>Other</option>
                  </>
                )}

                {!["Python", "Java", "JavaScript", "TypeScript"].includes(
                  form.language
                ) && (
                  <>
                    <option>None / Standard Library</option>
                    <option>Other</option>
                  </>
                )}
              </select>
            </div>

          </div>

        </div>

        <div className="card form-section">

          <div className="form-section-heading">
            <div className="form-section-icon">
              <Code2 size={20} />
            </div>

            <div>
              <h3>Source Code Configuration</h3>
              <p>Choose how to provide your application source code.</p>
            </div>
          </div>

          <div className="source-options">

            <button
              type="button"
              className={`source-option ${
                sourceType === "zip" ? "selected" : ""
              }`}
              onClick={() => setSourceType("zip")}
            >
              <Upload size={21} />
              <strong>Upload ZIP</strong>
              <span>Upload a compressed source archive</span>
            </button>

            <button
            type="button"
            className={`source-option ${
                sourceType === "github" ? "selected" : ""
            }`}
            onClick={() => setSourceType("github")}
            >
            <FaGithub size={21} />
            <strong>GitHub Repository</strong>
            <span>Provide a repository URL</span>
            </button>

          </div>

          {sourceType === "zip" ? (

            <div className="upload-area">

              <input
                id="source-file"
                type="file"
                accept=".zip,application/zip"
                onChange={handleFile}
                hidden
              />

              {file ? (

                <div className="selected-file">
                  <FileArchive size={25} />

                  <div>
                    <strong>{file.name}</strong>
                    <span>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    aria-label="Remove selected file"
                  >
                    <X size={17} />
                  </button>
                </div>

              ) : (

                <label htmlFor="source-file" className="upload-label">
                  <div className="upload-icon">
                    <Upload size={24} />
                  </div>

                  <strong>Click to browse your files</strong>

                  <span>ZIP archive only · Maximum 100 MB</span>
                </label>

              )}

            </div>

          ) : (

            <div className="form-field">
              <label htmlFor="repository-url">
                GitHub Repository URL <span>*</span>
              </label>

              <input
                id="repository-url"
                name="repositoryUrl"
                type="url"
                value={form.repositoryUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/repository"
                required
              />

              <small>
                For this frontend prototype, the URL is saved as project
                metadata only. Repository cloning will be implemented later.
              </small>
            </div>

          )}

        </div>

        <div className="card security-notice">
          <ShieldCheck size={20} />

          <div>
            <strong>Security Notice</strong>
            <p>
              Source code will be analysed only after you initiate a scan.
              No automatic code modifications will be made.
            </p>
          </div>
        </div>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-actions">

          <Link to="/projects" className="secondary-button">
            Cancel
          </Link>

          <button type="submit" className="primary-button">
            <CheckCircle2 size={17} />
            Create Project
          </button>

        </div>

      </form>

    </div>
  );
}

export default NewProject;