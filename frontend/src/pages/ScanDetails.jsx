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

import { useScans } from "../context/ScanContext";

function ScanDetails() {
  const { id } = useParams();

  const { getScan } = useScans();

  const scan = getScan(id);

  if (!scan) {
    return (
      <div className="page-container">
        <Link to="/scans" className="back-link">
          <ArrowLeft size={16} />
          Back to Scans
        </Link>

        <div className="card projects-empty">
          <h3>Scan not found</h3>
          <p>The requested scan record does not exist.</p>
        </div>
      </div>
    );
  }

  const totalFindings = Object.values(
    scan.findings
  ).reduce((a, b) => a + b, 0);

  const severityItems = [
    {
      label: "Critical",
      value: scan.findings.critical,
      className: "critical",
    },
    {
      label: "High",
      value: scan.findings.high,
      className: "high",
    },
    {
      label: "Medium",
      value: scan.findings.medium,
      className: "medium",
    },
    {
      label: "Low",
      value: scan.findings.low,
      className: "low",
    },
  ];

  return (
    <div className="page-container scan-details-page">

      <Link to="/scans" className="back-link">
        <ArrowLeft size={16} />
        Back to Security Scans
      </Link>

      <div className="scan-details-heading">

        <div>
          <div className="scan-id-label">{scan.id}</div>
          <h1>{scan.scanName || scan.scanType}</h1>
          <p>{scan.projectName}</p>
        </div>

        <span className={`scan-status ${
          scan.status === "Completed (Demo)"
            ? "completed"
            : scan.status.toLowerCase()
        }`}>
          {scan.status}
        </span>

      </div>

      <div className="scan-detail-stats">

        <div className="card scan-detail-stat">
          <span>Total Findings</span>
          <h2>{totalFindings}</h2>
          <AlertTriangle size={19} />
        </div>

        <div className="card scan-detail-stat">
          <span>Scan Progress</span>
          <h2>{scan.progress}%</h2>
          <CheckCircle2 size={19} />
        </div>

        <div className="card scan-detail-stat">
          <span>Duration</span>
          <h2>{scan.duration}</h2>
          <Clock3 size={19} />
        </div>
      </div>

      <div className="scan-details-grid">

        <div className="card scan-detail-section">
          <h3>Scan Information</h3>

          <div className="detail-row">
            <span>Scan ID</span>
            <strong>{scan.id}</strong>
          </div>

          <div className="detail-row">
            <span>Project</span>
            <strong>{scan.projectName}</strong>
          </div>

          <div className="detail-row">
            <span>Scan Type</span>
            <strong>{scan.scanType}</strong>
          </div>

          <div className="detail-row">
            <span>Started At</span>
            <strong>
              {new Date(scan.startedAt).toLocaleString()}
            </strong>
          </div>

          <div className="detail-row">
            <span>Status</span>
            <strong>{scan.status}</strong>
          </div>
        </div>

        <div className="card scan-detail-section">
          <h3>Security Tools</h3>

          {scan.tools.map((tool) => (
            <div className="scan-tool-item" key={tool}>
              <div className="scan-tool-icon">
                {tool.includes("Dependency") ? (
                  <Package size={18} />
                ) : tool.includes("Secret") ? (
                  <KeyRound size={18} />
                ) : (
                  <Code2 size={18} />
                )}
              </div>

              <div>
                <strong>{tool}</strong>
                <span>Configured for assessment</span>
              </div>

              <ShieldCheck size={17} className="tool-check" />
            </div>
          ))}
        </div>

      </div>

      <div className="card severity-section">

        <div className="severity-heading">
          <div>
            <h3>Vulnerability Overview</h3>
            <p>Severity distribution for this scan record.</p>
          </div>

          <span>{totalFindings} findings</span>
        </div>

        <div className="severity-bar">
          {severityItems.map((item) => (
            <div
              key={item.label}
              className={`severity-segment ${item.className}`}
              style={{
                width: totalFindings
                  ? `${(item.value / totalFindings) * 100}%`
                  : "0%",
              }}
            />
          ))}
        </div>

        <div className="severity-list">
          {severityItems.map((item) => (
            <div className="severity-row" key={item.label}>
              <span>
                <i className={item.className}></i>
                {item.label}
              </span>

              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

      </div>

      <div className="scan-info-notice">
        <AlertTriangle size={18} />

        <div>
          <strong>Demonstration data</strong>
          <p>
            Findings displayed here are sample data for UI development.
            The current scan record has not been executed by Semgrep,
            CodeQL, or OWASP Dependency-Check.
          </p>
        </div>
      </div>

    </div>
  );
}

export default ScanDetails;