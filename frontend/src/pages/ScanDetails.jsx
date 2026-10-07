import {
    ArrowLeft,
    ShieldCheck,
    Clock3,
    Code2,
    AlertTriangle,
    CheckCircle2,
    Package,
    KeyRound,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";

import { useScans } from "../context/ScanContext";
import { useFindings } from "../context/FindingContext";


function ScanDetails() {

    const { id } = useParams();


    const {
        getScan,
        getScanById,
    } = useScans();


    const {
        getFindingsByScan,
    } = useFindings();


    const [scan, setScan] =
        useState(() => getScan(id));


    const [findings, setFindings] =
        useState([]);


    const [loading, setLoading] =
        useState(!scan);


    const [findingsLoading, setFindingsLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    /*
     * Load scan information.
     */

    useEffect(() => {

        const loadScan = async () => {

            try {

                setLoading(true);
                setError("");

                const existingScan =
                    getScan(id);

                if (existingScan) {

                    setScan(existingScan);

                } else {

                    const currentScan =
                        await getScanById(id);

                    setScan(currentScan);
                }

            } catch (error) {

                console.error(
                    "Failed to load scan:",
                    error
                );

                setError(
                    "Failed to load scan."
                );

            } finally {

                setLoading(false);

            }

        };


        loadScan();

    }, [id]);


    /*
     * Load findings belonging to
     * this scan.
     */

    useEffect(() => {

        const loadFindings = async () => {

            try {

                setFindingsLoading(true);

                const data =
                    await getFindingsByScan(id);

                setFindings(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    "Failed to load findings:",
                    error
                );

                setFindings([]);

            } finally {

                setFindingsLoading(false);

            }

        };


        loadFindings();

    }, [id]);


    /*
     * Loading state.
     */

    if (loading) {

        return (

            <div className="page-container">

                <Link
                    to="/scans"
                    className="back-link"
                >

                    <ArrowLeft
                        size={16}
                    />

                    Back to Scans

                </Link>


                <div className="card projects-empty">

                    <h3>
                        Loading scan...
                    </h3>

                    <p>
                        Retrieving scan information.
                    </p>

                </div>

            </div>

        );

    }


    /*
     * Error / missing scan.
     */

    if (error || !scan) {

        return (

            <div className="page-container">

                <Link
                    to="/scans"
                    className="back-link"
                >

                    <ArrowLeft
                        size={16}
                    />

                    Back to Scans

                </Link>


                <div className="card projects-empty">

                    <h3>
                        Scan not found
                    </h3>

                    <p>
                        {error ||
                            "The requested scan record does not exist."}
                    </p>

                </div>

            </div>

        );

    }


    /*
     * Calculate severity counts.
     */

    const findingsBySeverity = {

        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,

    };


    findings.forEach(
        (finding) => {

            const severity =
                finding.severity?.toLowerCase();


            if (
                findingsBySeverity[
                    severity
                ] !== undefined
            ) {

                findingsBySeverity[
                    severity
                ]++;

            }

        }
    );


    const totalFindings =
        findings.length;


    const severityItems = [

        {
            label: "Critical",
            value: findingsBySeverity.critical,
            className: "critical",
        },

        {
            label: "High",
            value: findingsBySeverity.high,
            className: "high",
        },

        {
            label: "Medium",
            value: findingsBySeverity.medium,
            className: "medium",
        },

        {
            label: "Low",
            value: findingsBySeverity.low,
            className: "low",
        },

    ];


    /*
     * Format scan status.
     */

    const formatStatus = (
        status
    ) => {

        if (!status) {
            return "Unknown";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );

    };


    /*
     * Format scan type.
     */

    const formatScanType = (
        scanType
    ) => {

        if (scanType === "full") {
            return "Full Security Assessment";
        }

        if (scanType === "sast") {
            return "Static Code Analysis";
        }

        if (
            scanType === "dependency"
        ) {
            return "Dependency Scanning";
        }

        if (
            scanType === "secrets"
        ) {
            return "Secret Detection";
        }

        return scanType || "Security Scan";

    };


    /*
     * Format date/time.
     */

    const formatDateTime = (
        value
    ) => {

        if (!value) {
            return "Not started";
        }

        return new Date(
            value
        ).toLocaleString();

    };


    /*
     * Format severity.
     */

    const formatSeverity = (
        severity
    ) => {

        if (!severity) {
            return "Unknown";
        }

        return (
            severity.charAt(0).toUpperCase() +
            severity.slice(1)
        );

    };


    /*
     * Format finding status.
     */

    const formatFindingStatus = (
        status
    ) => {

        if (!status) {
            return "Open";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );

    };


    return (

        <div className="page-container scan-details-page">


            <Link
                to="/scans"
                className="back-link"
            >

                <ArrowLeft
                    size={16}
                />

                Back to Security Scans

            </Link>


            {/* Scan Header */}

            <div className="scan-details-heading">


                <div>

                    <div className="scan-id-label">

                        SCN-
                        {scan.id}

                    </div>


                    <h1>

                        {formatScanType(
                            scan.scan_type
                        )}

                    </h1>


                    <p>

                        {scan.project_name ||
                            "Unknown Project"}

                    </p>

                </div>


                <span
                    className={`scan-status ${scan.status}`}
                >

                    {formatStatus(
                        scan.status
                    )}

                </span>


            </div>


            {/* Scan Statistics */}

            <div className="scan-detail-stats">


                <div className="card scan-detail-stat">

                    <span>
                        Total Findings
                    </span>

                    <h2>

                        {findingsLoading
                            ? "..."
                            : totalFindings}

                    </h2>

                    <AlertTriangle
                        size={19}
                    />

                </div>


                <div className="card scan-detail-stat">

                    <span>
                        Scan Progress
                    </span>

                    <h2>

                        {scan.status === "completed"
                            ? "Completed"
                            : scan.status === "running"
                                ? "Running"
                                : scan.status === "failed"
                                    ? "Failed"
                                    : "Pending"}

                    </h2>

                    <CheckCircle2
                        size={19}
                    />

                </div>


                <div className="card scan-detail-stat">

                    <span>
                        Duration
                    </span>

                    <h2>

                        {scan.started_at &&
                            scan.completed_at
                            ? `${Math.round(
                                (
                                    new Date(
                                        scan.completed_at
                                    ) -
                                    new Date(
                                        scan.started_at
                                    )
                                ) / 1000
                            )} sec`
                            : "—"}

                    </h2>

                    <Clock3
                        size={19}
                    />

                </div>


            </div>


            {/* Scan information + tools */}

            <div className="scan-details-grid">


                <div className="card scan-detail-section">

                    <h3>
                        Scan Information
                    </h3>


                    <div className="detail-row">

                        <span>
                            Scan ID
                        </span>

                        <strong>
                            SCN-
                            {scan.id}
                        </strong>

                    </div>


                    <div className="detail-row">

                        <span>
                            Project
                        </span>

                        <strong>
                            {scan.project_name ||
                                "Unknown Project"}
                        </strong>

                    </div>


                    <div className="detail-row">

                        <span>
                            Scan Type
                        </span>

                        <strong>
                            {formatScanType(
                                scan.scan_type
                            )}
                        </strong>

                    </div>


                    <div className="detail-row">

                        <span>
                            Created At
                        </span>

                        <strong>
                            {formatDateTime(
                                scan.created_at
                            )}
                        </strong>

                    </div>


                    <div className="detail-row">

                        <span>
                            Started At
                        </span>

                        <strong>
                            {formatDateTime(
                                scan.started_at
                            )}
                        </strong>

                    </div>


                    <div className="detail-row">

                        <span>
                            Completed At
                        </span>

                        <strong>
                            {formatDateTime(
                                scan.completed_at
                            )}
                        </strong>

                    </div>


                    <div className="detail-row">

                        <span>
                            Status
                        </span>

                        <strong>
                            {formatStatus(
                                scan.status
                            )}
                        </strong>

                    </div>


                </div>


                {/* Security Tools */}

                <div className="card scan-detail-section">


                    <h3>
                        Security Tools
                    </h3>


                    {/* Semgrep */}

                    <div className="scan-tool-item">

                        <div className="scan-tool-icon">

                            <Code2
                                size={18}
                            />

                        </div>


                        <div>

                            <strong>
                                Semgrep
                            </strong>

                            <span>
                                Static application
                                security testing (SAST).
                            </span>

                        </div>


                        <ShieldCheck
                            size={17}
                            className="tool-check"
                        />

                    </div>


                    {/* Dependency Scanner */}

                    <div className="scan-tool-item">

                        <div className="scan-tool-icon">

                            <Package
                                size={18}
                            />

                        </div>


                        <div>

                            <strong>
                                Dependency Analysis
                            </strong>

                            <span>
                                Not connected yet.
                            </span>

                        </div>


                        <ShieldCheck
                            size={17}
                            className="tool-check"
                        />

                    </div>


                    {/* Secret Detection */}

                    <div className="scan-tool-item">

                        <div className="scan-tool-icon">

                            <KeyRound
                                size={18}
                            />

                        </div>


                        <div>

                            <strong>
                                Secret Detection
                            </strong>

                            <span>
                                Not connected yet.
                            </span>

                        </div>


                        <ShieldCheck
                            size={17}
                            className="tool-check"
                        />

                    </div>


                </div>


            </div>

            {/* Scan Error */}

            {scan.status === "failed" &&
                scan.error_message && (

                    <div className="scan-info-notice">

                        <AlertTriangle
                            size={18}
                        />

                        <div>

                            <strong>
                                Scan failed
                            </strong>

                            <p>
                                {scan.error_message}
                            </p>

                        </div>

                    </div>

            )}


            {/* Vulnerability Overview */}

            <div className="card severity-section">


                <div className="severity-heading">


                    <div>

                        <h3>
                            Vulnerability Overview
                        </h3>

                        <p>

                            {findingsLoading
                                ? "Loading findings..."
                                : totalFindings > 0
                                    ? "Security findings detected for this scan."
                                    : "No findings have been recorded for this scan."}

                        </p>

                    </div>


                    <span>

                        {findingsLoading
                            ? "Loading..."
                            : `${totalFindings} findings`}

                    </span>


                </div>


                <div className="severity-bar">


                    {severityItems.map(
                        (item) => (

                            <div
                                key={item.label}
                                className={`severity-segment ${item.className}`}
                                style={{
                                    width:
                                        totalFindings
                                            ? `${(
                                                item.value /
                                                totalFindings
                                            ) * 100}%`
                                            : "0%",
                                }}
                            />

                        )
                    )}


                </div>


                <div className="severity-list">


                    {severityItems.map(
                        (item) => (

                            <div
                                className="severity-row"
                                key={item.label}
                            >

                                <span>

                                    <i
                                        className={
                                            item.className
                                        }
                                    />

                                    {item.label}

                                </span>


                                <strong>
                                    {item.value}
                                </strong>

                            </div>

                        )
                    )}


                </div>


            </div>


            {/* Actual Findings */}

            <div className="card severity-section">


                <div className="severity-heading">

                    <div>

                        <h3>
                            Security Findings
                        </h3>

                        <p>
                            Detailed security findings
                            detected during this scan.
                        </p>

                    </div>

                </div>


                {findingsLoading ? (

                    <div className="projects-empty">

                        <h3>
                            Loading findings...
                        </h3>

                        <p>
                            Retrieving security findings
                            for this scan.
                        </p>

                    </div>

                ) : findings.length === 0 ? (

                    <div className="projects-empty">

                        <h3>
                            No findings
                        </h3>

                        <p>
                            No security findings were
                            detected by the configured
                            security tools.
                        </p>

                    </div>

                ) : (

                    <div>

                        {findings.map(
                            (finding) => (

                                <div
                                    key={finding.id}
                                    className="scan-tool-item"
                                >


                                    <div className="scan-tool-icon">

                                        <AlertTriangle
                                            size={18}
                                        />

                                    </div>


                                    <div>

                                        <strong>
                                            {finding.title ||
                                                "Security Finding"}
                                        </strong>


                                        <span>

                                            {formatSeverity(
                                                finding.severity
                                            )}

                                            {" • "}

                                            {finding.tool ||
                                                "Security Scanner"}

                                            {" • "}

                                            {finding.file_path ||
                                                "No file specified"}

                                            {finding.line_number
                                                ? `:${finding.line_number}`
                                                : ""}

                                        </span>


                                        {finding.rule_id && (

                                            <span>
                                                Rule: {finding.rule_id}
                                            </span>

                                        )}


                                        {finding.description && (

                                            <span>
                                                Description: {finding.description}
                                            </span>

                                        )}

                                        {finding.remediation && (

                                            <span>
                                                Remediation: {finding.remediation}
                                            </span>

                                        )}


                                        <span>
                                            Status:{" "}
                                            {formatFindingStatus(
                                                finding.status
                                            )}
                                        </span>


                                    </div>


                                    <ShieldCheck
                                        size={17}
                                        className="tool-check"
                                    />


                                </div>

                            )
                        )}

                    </div>

                )}


            </div>


            {/* Scanner Status Notice */}

            <div className="scan-info-notice">

                <CheckCircle2
                    size={18}
                />


                <div>

                    <strong>
                        Semgrep scanner connected
                    </strong>


                    <p>

                        This scan currently performs
                        static application security testing
                        using Semgrep. Additional security
                        tools such as CodeQL,
                        OWASP Dependency-Check and
                        secret detection will be integrated
                        in later phases.

                    </p>

                </div>

            </div>


        </div>

    );

}


export default ScanDetails;