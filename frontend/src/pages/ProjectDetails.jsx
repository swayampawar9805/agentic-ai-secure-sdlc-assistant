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
    useNavigate,
    useParams,
} from "react-router-dom";


import {
    useEffect,
    useState,
} from "react";


import { useProjects } from "../context/ProjectContext";

import { useScans } from "../context/ScanContext";



function ProjectDetails() {

    const { id } = useParams();

    const navigate = useNavigate();


    const {
        getProject,
        getProjectById,
    } = useProjects();


    const {
        addScan,
    } = useScans();



    const [project, setProject] =
        useState(() =>
            getProject(id)
        );


    const [loading, setLoading] =
        useState(!project);


    const [startingScan, setStartingScan] =
        useState(false);


    const [error, setError] =
        useState(null);



    useEffect(() => {

        const loadProject = async () => {

            setLoading(true);
            setError(null);


            try {

                const data =
                    await getProjectById(id);

                setProject(data);

            } catch (error) {

                console.error(
                    "Failed to load project:",
                    error
                );

                setError(
                    "Failed to load project."
                );

            } finally {

                setLoading(false);

            }
        };


        loadProject();

    }, [
        id,
        getProjectById,
    ]);



    const formatDate = (date) => {

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



    const formatSourceType = (
        sourceType
    ) => {

        if (
            sourceType === "github"
        ) {
            return "GitHub";
        }


        if (
            sourceType === "zip"
        ) {
            return "ZIP Upload";
        }


        return sourceType || "—";

    };



    const getArchiveName = () => {

        if (
            !project.source_archive
        ) {
            return "No archive uploaded";
        }


        return project.source_archive
            .split("/")
            .pop();

    };



    const getArchiveUrl = () => {

        if (
            !project.source_archive
        ) {
            return null;
        }


        if (
            project.source_archive.startsWith(
                "http"
            )
        ) {
            return project.source_archive;
        }


        return (
            `http://127.0.0.1:8000` +
            project.source_archive
        );

    };



    const handleStartScan = async () => {

        if (!project) {
            return;
        }


        setStartingScan(true);
        setError(null);


        try {

            const scan =
                await addScan({
                    project: project.id,
                    scan_type: "full",
                });


            navigate(
                `/scans/${scan.id}`
            );

        } catch (error) {

            console.error(
                "Failed to start scan:",
                error
            );


            const responseData =
                error.response?.data;


            if (
                responseData &&
                typeof responseData === "object"
            ) {

                const firstError =
                    Object.values(
                        responseData
                    )[0];


                if (
                    Array.isArray(
                        firstError
                    )
                ) {

                    setError(
                        firstError[0]
                    );

                } else {

                    setError(
                        String(firstError)
                    );

                }

            } else {

                setError(
                    "Failed to start security scan."
                );

            }

        } finally {

            setStartingScan(false);

        }

    };



    if (loading) {

        return (

            <div className="page-container">

                <Link
                    to="/projects"
                    className="back-link"
                >

                    <ArrowLeft size={16} />

                    Back to Projects

                </Link>


                <div className="card projects-empty">

                    <FolderKanban
                        size={35}
                    />


                    <h3>
                        Loading project...
                    </h3>


                    <p>
                        Fetching project
                        information from the server.
                    </p>

                </div>

            </div>

        );

    }



    if (error && !project) {

        return (

            <div className="page-container">

                <Link
                    to="/projects"
                    className="back-link"
                >

                    <ArrowLeft size={16} />

                    Back to Projects

                </Link>


                <div className="card projects-empty">

                    <h3>
                        {error}
                    </h3>


                    <p>
                        The requested project
                        could not be loaded.
                    </p>

                </div>

            </div>

        );

    }



    if (!project) {

        return (

            <div className="page-container">

                <Link
                    to="/projects"
                    className="back-link"
                >

                    <ArrowLeft size={16} />

                    Back to Projects

                </Link>


                <div className="card projects-empty">

                    <h3>
                        Project not found
                    </h3>


                    <p>
                        The requested project
                        does not exist.
                    </p>

                </div>

            </div>

        );

    }



    return (

        <div className="page-container project-details-page">


            <Link
                to="/projects"
                className="back-link"
            >

                <ArrowLeft size={16} />

                Back to Projects

            </Link>



            <div className="project-details-heading">


                <div className="project-details-identity">


                    <div className="project-details-icon">

                        <FolderKanban
                            size={26}
                        />

                    </div>



                    <div>

                        <h1>
                            {project.name}
                        </h1>


                        <p>
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



                            <span className="project-status">

                                <i></i>


                                {project.status ===
                                "active"
                                    ? "Active"
                                    : "Archived"}

                            </span>

                        </div>

                    </div>

                </div>



                <button
                    className="primary-button"
                    type="button"
                    onClick={
                        handleStartScan
                    }
                    disabled={
                        startingScan
                    }
                >

                    <ScanSearch
                        size={17}
                    />

                    {startingScan
                        ? "Starting Scan..."
                        : "Start Security Scan"}

                </button>

            </div>



            {error && (

                <div className="card">

                    <p>
                        {error}
                    </p>

                </div>

            )}



            <div className="project-detail-stats">


                <div className="card project-detail-stat">

                    <span>
                        Security Score
                    </span>


                    <h2>
                        Not scanned
                    </h2>


                    <ShieldCheck
                        size={19}
                    />

                </div>



                <div className="card project-detail-stat">

                    <span>
                        Vulnerabilities
                    </span>


                    <h2>
                        —
                    </h2>


                    <AlertTriangle
                        size={19}
                    />

                </div>



                <div className="card project-detail-stat">

                    <span>
                        Project Language
                    </span>


                    <h2>
                        {project.language ||
                            "—"}
                    </h2>


                    <Code2
                        size={19}
                    />

                </div>

            </div>



            <div className="project-details-grid">


                <div className="card detail-section">


                    <h3>
                        Project Information
                    </h3>



                    <div className="detail-row">

                        <span>
                            Project ID
                        </span>


                        <strong>
                            {project.id}
                        </strong>

                    </div>



                    <div className="detail-row">

                        <span>
                            Framework
                        </span>


                        <strong>
                            {project.framework ||
                                "—"}
                        </strong>

                    </div>



                    <div className="detail-row">

                        <span>
                            Source Type
                        </span>


                        <strong>
                            {formatSourceType(
                                project.source_type
                            )}
                        </strong>

                    </div>



                    <div className="detail-row">

                        <span>
                            Default Branch
                        </span>


                        <strong>
                            {project.default_branch ||
                                "—"}
                        </strong>

                    </div>



                    <div className="detail-row">

                        <span>
                            Created At
                        </span>


                        <strong>
                            {formatDate(
                                project.created_at
                            )}
                        </strong>

                    </div>



                    <div className="detail-row">

                        <span>
                            Last Updated
                        </span>


                        <strong>
                            {formatDate(
                                project.updated_at
                            )}
                        </strong>

                    </div>



                    <div className="detail-row">

                        <span>
                            Project Status
                        </span>


                        <strong>
                            {project.status ===
                            "active"
                                ? "Active"
                                : "Archived"}
                        </strong>

                    </div>

                </div>



                <div className="card detail-section">


                    <h3>
                        Source Code
                    </h3>



                    <div className="repository-display">


                        {project.source_type ===
                        "github" ? (

                            <FaGithub
                                size={24}
                            />

                        ) : (

                            <FileArchive
                                size={24}
                            />

                        )}



                        <div>

                            <strong>

                                {project.source_type ===
                                "github"
                                    ? "GitHub Repository"
                                    : "Uploaded ZIP Archive"}

                            </strong>



                            <span>

                                {project.source_type ===
                                "github"

                                    ? (
                                        project.repository_url ||
                                        "No repository URL"
                                    )

                                    : getArchiveName()}

                            </span>

                        </div>

                    </div>



                    {project.source_type ===
                        "zip" &&

                        project.source_archive && (

                            <a
                                href={
                                    getArchiveUrl()
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="primary-button"
                            >

                                <FileArchive
                                    size={16}
                                />

                                Download ZIP

                            </a>

                        )}



                    {project.source_type ===
                        "github" &&

                        project.repository_url && (

                            <a
                                href={
                                    project.repository_url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="primary-button"
                            >

                                <FaGithub
                                    size={16}
                                />

                                Open Repository

                            </a>

                        )}



                    <div className="repository-note">

                        <CalendarDays
                            size={16}
                        />

                        <span>
                            Security analysis will
                            be executed after scanner
                            integration.
                        </span>

                    </div>

                </div>

            </div>



            <div className="card detail-section scan-placeholder">


                <div>

                    <h3>
                        Security Analysis
                    </h3>


                    <p>
                        Scan history, vulnerability
                        findings, and AI-generated
                        recommendations will appear
                        here.
                    </p>

                </div>



                <div className="scan-placeholder-icon">

                    <ShieldCheck
                        size={30}
                    />

                </div>

            </div>


        </div>

    );

}


export default ProjectDetails;