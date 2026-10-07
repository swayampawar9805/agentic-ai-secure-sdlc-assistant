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


  useEffect(() => {

    const loadScan = async () => {

      try {

        setLoading(true);
        setError("");


        const existingScan =
          getScan(id);


        let currentScan =
          existingScan;


        if (existingScan) {

          setScan(existingScan);

        } else {

          currentScan =
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
   * Calculate finding counts
   * from the actual API response.
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
          className={`scan-status ${
            scan.status
          }`}
        >

          {formatStatus(
            scan.status
          )}

        </span>


      </div>


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
                : "Not Started"}
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


        <div className="card scan-detail-section">


          <h3>
            Security Tools
          </h3>


          <div className="scan-tool-item">

            <div className="scan-tool-icon">

              <Code2
                size={18}
              />

            </div>


            <div>

              <strong>
                Scanner Integration
              </strong>

              <span>
                Will be configured in
                the security tools phase.
              </span>

            </div>


            <ShieldCheck
              size={17}
              className="tool-check"
            />

          </div>


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
              Detailed findings associated
              with this scan.
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
              No security findings have been
              recorded for this scan yet.
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
                      {finding.title}
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


      <div className="scan-info-notice">

        <AlertTriangle
          size={18}
        />


        <div>

          <strong>
            Scanner execution is not
            connected yet
          </strong>


          <p>

            This scan currently uses the
            backend finding infrastructure.
            Actual security analysis using
            Semgrep, CodeQL, OWASP
            Dependency-Check and other
            security tools will be integrated
            in a later phase.

          </p>

        </div>

      </div>


    </div>

  );

}


export default ScanDetails;
