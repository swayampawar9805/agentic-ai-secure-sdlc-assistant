import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Download,
  FileSearch,
  GitBranch,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TestTube,
  Wrench,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { initialReports } from "../data/mockReports";

function ReportDetails() {
  const { id } = useParams();

  const report = initialReports.find(
    (item) => item.id === id
  );

  if (!report) {
    return (
      <div className="page-container">

        <Link
          to="/reports"
          className="report-back-link"
        >
          <ArrowLeft size={15} />
          Back to Reports
        </Link>

        <div className="card report-not-found">
          Report not found.
        </div>

      </div>
    );
  }

  const getSeverityIcon = (severity) => {
    if (severity === "Critical") {
      return <CircleAlert size={14} />;
    }

    if (severity === "High") {
      return <ShieldAlert size={14} />;
    }

    if (severity === "Medium") {
      return <AlertTriangle size={14} />;
    }

    return <ShieldCheck size={14} />;
  };

  return (
    <div className="page-container report-details-page">

      {/* Back */}

      <Link
        to="/reports"
        className="report-back-link"
      >
        <ArrowLeft size={15} />
        Back to Reports
      </Link>

      {/* Header */}

      <div className="report-detail-heading">

        <div>

          <span className="report-id">
            {report.id}
          </span>

          <h1>
            {report.project}
          </h1>

          <p>
            Comprehensive Secure SDLC Security Report
          </p>

        </div>

        <button className="report-export-button">
          <Download size={15} />
          Export Report
        </button>

      </div>

      {/* Security score */}

      <div className="card report-hero">

        <div className="report-score-large">

          <div className="score-circle">

            <strong>
              {report.securityScore}
            </strong>

            <span>/100</span>

          </div>

          <div>

            <h2>
              Security Score
            </h2>

            <span
              className={`report-risk ${report.riskLevel.toLowerCase()}`}
            >
              {report.riskLevel} Risk
            </span>

          </div>

        </div>

        <div className="report-summary">

          <h3>Executive Summary</h3>

          <p>
            {report.summary}
          </p>

        </div>

      </div>

      {/* Finding summary */}

      <div className="report-detail-stats">

        <div className="card detail-stat critical">
          <CircleAlert size={18} />
          <span>Critical</span>
          <strong>
            {report.statistics.critical}
          </strong>
        </div>

        <div className="card detail-stat high">
          <ShieldAlert size={18} />
          <span>High</span>
          <strong>
            {report.statistics.high}
          </strong>
        </div>

        <div className="card detail-stat medium">
          <AlertTriangle size={18} />
          <span>Medium</span>
          <strong>
            {report.statistics.medium}
          </strong>
        </div>

        <div className="card detail-stat low">
          <ShieldCheck size={18} />
          <span>Low</span>
          <strong>
            {report.statistics.low}
          </strong>
        </div>

        <div className="card detail-stat fixed">
          <CheckCircle2 size={18} />
          <span>Fixed</span>
          <strong>
            {report.statistics.fixed}
          </strong>
        </div>

      </div>

      {/* SDLC Analysis */}

      <div className="card report-analysis">

        <div className="report-section-heading">

          <div>
            <h3>Secure SDLC Analysis</h3>

            <p>
              Results from every security stage.
            </p>
          </div>

          <Shield size={18} />

        </div>

        <div className="analysis-stage-grid">

          {report.analysis.map((stage) => {

            const iconMap = {
              "Requirements Analysis":
                FileSearch,

              "Threat Modeling":
                ShieldAlert,

              "Static Code Analysis":
                GitBranch,

              "Dependency Analysis":
                Shield,

              "Security Testing":
                TestTube,

              "Deployment Verification":
                CheckCircle2,
            };

            const Icon =
              iconMap[stage.name] ||
              Shield;

            return (
              <div
                className="analysis-stage"
                key={stage.name}
              >

                <div className="analysis-stage-icon">
                  <Icon size={17} />
                </div>

                <div className="analysis-stage-info">

                  <strong>
                    {stage.name}
                  </strong>

                  <span>
                    {stage.findings} findings
                  </span>

                </div>

                <span
                  className={`analysis-status ${stage.status.toLowerCase()}`}
                >
                  {stage.status ===
                  "Completed" ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <AlertTriangle size={13} />
                  )}

                  {stage.status}
                </span>

              </div>
            );
          })}

        </div>

      </div>

      {/* Findings */}

      <div className="card report-findings">

        <div className="report-section-heading">

          <div>
            <h3>Security Findings</h3>

            <p>
              Vulnerabilities and security issues
              discovered during analysis.
            </p>
          </div>

        </div>

        <div className="finding-table-wrapper">

          <table className="finding-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Finding</th>
                <th>Severity</th>
                <th>Category</th>
                <th>Component</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {report.findings.map((finding) => (

                <tr key={finding.id}>

                  <td>
                    <span className="finding-id">
                      {finding.id}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {finding.title}
                    </strong>
                  </td>

                  <td>

                    <span
                      className={`severity-badge ${finding.severity.toLowerCase()}`}
                    >
                      {getSeverityIcon(
                        finding.severity
                      )}

                      {finding.severity}
                    </span>

                  </td>

                  <td>
                    {finding.category}
                  </td>

                  <td>
                    {finding.component}
                  </td>

                  <td>
                    {finding.source}
                  </td>

                  <td>

                    <span
                      className={`finding-status ${finding.status.toLowerCase()}`}
                    >
                      {finding.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* Recommendations */}

      <div className="card recommendations">

        <div className="report-section-heading">

          <div>
            <h3>AI Security Recommendations</h3>

            <p>
              Recommendations generated from the
              combined security analysis.
            </p>
          </div>

          <Wrench size={18} />

        </div>

        <div className="recommendation-list">

          {report.recommendations.map(
            (recommendation, index) => (

              <div
                className="recommendation-item"
                key={index}
              >

                <span>
                  {index + 1}
                </span>

                <p>
                  {recommendation}
                </p>

              </div>

            )
          )}

        </div>

      </div>

      {/* Human approval */}

      <div className="card human-approval-report">

        <div className="approval-report-icon">
          <ShieldCheck size={19} />
        </div>

        <div>

          <h3>
            Human-in-the-Loop Verification
          </h3>

          <p>
            Security-sensitive remediation actions
            require developer review and explicit
            approval before changes are applied.
          </p>

        </div>

        <span>
          Approval Required
        </span>

      </div>

    </div>
  );
}

export default ReportDetails;