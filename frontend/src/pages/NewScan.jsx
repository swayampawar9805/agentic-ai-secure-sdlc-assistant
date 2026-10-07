import { useState } from "react";

import {
  ArrowLeft,
  ScanSearch,
  ShieldCheck,
  Code2,
  Package,
  KeyRound,
  Layers3,
  Info,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useProjects } from "../context/ProjectContext";
import { useScans } from "../context/ScanContext";


const scanOptions = [

  {
    id: "sast",
    title: "Static Code Analysis",
    description:
      "Analyze source code for insecure coding patterns and vulnerabilities.",
    tool: "Semgrep + CodeQL",
    icon: Code2,
  },

  {
    id: "dependency",
    title: "Dependency Scanning",
    description:
      "Identify vulnerable third-party libraries and packages.",
    tool: "OWASP Dependency-Check",
    icon: Package,
  },

  {
    id: "secrets",
    title: "Secret Detection",
    description:
      "Identify potentially exposed API keys, tokens and credentials.",
    tool: "Secret scanning",
    icon: KeyRound,
  },

  {
    id: "full",
    title: "Full Security Assessment",
    description:
      "Combine the configured security analysis categories.",
    tool: "Multiple security tools",
    icon: Layers3,
  },

];


function NewScan() {

  const navigate =
    useNavigate();


  const { projects } =
    useProjects();


  const { addScan } =
    useScans();


  const [projectId, setProjectId] =
    useState("");


  const [selectedType, setSelectedType] =
    useState("full");


  const [scanName, setScanName] =
    useState("");


  const [error, setError] =
    useState("");


  const [submitting, setSubmitting] =
    useState(false);


  const selectedProject =
    projects.find(
      (project) =>
        project.id === Number(projectId)
    );


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    setSubmitting(true);


    if (!selectedProject) {

      setError(
        "Please select a project."
      );

      setSubmitting(false);

      return;
    }


    try {

      const scan =
        await addScan({

          project:
            selectedProject.id,

          scan_type:
            selectedType,

        });


      navigate(
        `/scans/${scan.id}`
      );


    } catch (error) {

      console.error(
        "Failed to create scan:",
        error
      );


      const responseData =
        error.response?.data;


      if (responseData) {

        const firstError =
          Object.values(
            responseData
          )[0];

        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : String(firstError)
        );

      } else {

        setError(
          "Failed to create scan. Please try again."
        );

      }

    } finally {

      setSubmitting(false);

    }

  };


  return (

    <div className="page-container new-scan-page">


      <Link
        to="/scans"
        className="back-link"
      >

        <ArrowLeft size={16} />

        Back to Security Scans

      </Link>


      <div className="page-header">

        <h1>
          New Security Scan
        </h1>

        <p>
          Configure a security assessment
          for your software project.
        </p>

      </div>


      <form
        className="scan-form"
        onSubmit={handleSubmit}
      >


        <div className="card scan-form-section">


          <div className="form-section-heading">

            <div className="form-section-icon">

              <ShieldCheck
                size={20}
              />

            </div>


            <div>

              <h3>
                Target Project
              </h3>

              <p>
                Select the project you
                want to assess.
              </p>

            </div>

          </div>


          <div className="form-field">

            <label
              htmlFor="scan-project"
            >

              Select Project{" "}

              <span>
                *
              </span>

            </label>


            <select
              id="scan-project"
              value={projectId}
              onChange={(e) =>
                setProjectId(
                  e.target.value
                )
              }
              required
            >

              <option value="">
                Choose a project
              </option>


              {projects.map(
                (project) => (

                  <option
                    key={project.id}
                    value={project.id}
                  >

                    {project.name} —{" "}
                    {project.language}

                  </option>

                )
              )}

            </select>

          </div>


          {selectedProject && (

            <div className="selected-project-preview">


              <div className="scan-project-icon">

                <Code2 size={19} />

              </div>


              <div>

                <strong>
                  {selectedProject.name}
                </strong>

                <span>

                  {selectedProject.language}{" "}
                  ·{" "}
                  {selectedProject.framework}

                </span>

              </div>


              <span className="project-status">

                <i></i>

                {selectedProject.status}

              </span>


            </div>

          )}


          <div className="form-field">

            <label htmlFor="scan-name">
              Scan Name
            </label>


            <input
              id="scan-name"
              value={scanName}
              onChange={(e) =>
                setScanName(
                  e.target.value
                )
              }
              placeholder="e.g. Initial Security Assessment"
              maxLength={100}
            />

          </div>


        </div>


        <div className="card scan-form-section">


          <div className="form-section-heading">

            <div className="form-section-icon">

              <ScanSearch
                size={20}
              />

            </div>


            <div>

              <h3>
                Scan Configuration
              </h3>

              <p>
                Choose the type of
                security assessment.
              </p>

            </div>

          </div>


          <div className="scan-type-grid">


            {scanOptions.map(
              (option) => {

                const Icon =
                  option.icon;


                return (

                  <button
                    type="button"
                    key={option.id}
                    className={`scan-type-option ${
                      selectedType ===
                      option.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedType(
                        option.id
                      )
                    }
                  >


                    <div className="scan-type-top">

                      <div className="scan-type-icon">

                        <Icon
                          size={21}
                        />

                      </div>


                      <span className="scan-radio">

                        {selectedType ===
                          option.id && (
                          <i></i>
                        )}

                      </span>

                    </div>


                    <strong>
                      {option.title}
                    </strong>


                    <p>
                      {option.description}
                    </p>


                    <span className="scan-tool-label">

                      {option.tool}

                    </span>


                  </button>

                );

              }
            )}

          </div>


        </div>


        <div className="scan-info-notice">

          <Info size={18} />


          <div>

            <strong>
              Scan execution is not
              connected yet
            </strong>

            <p>

              Creating this request
              will create a pending
              scan record in the
              Django backend. Real
              execution, progress
              updates and security
              findings will be
              implemented with the
              scanning infrastructure.

            </p>

          </div>

        </div>


        {error && (

          <div
            className="form-error"
            role="alert"
          >

            {error}

          </div>

        )}


        <div className="form-actions">


          <Link
            to="/scans"
            className="secondary-button"
          >

            Cancel

          </Link>


          <button
            type="submit"
            className="primary-button"
            disabled={submitting}
          >

            <ScanSearch
              size={17}
            />

            {submitting
              ? "Creating..."
              : "Create Scan Request"}

          </button>


        </div>


      </form>

    </div>

  );

}


export default NewScan;