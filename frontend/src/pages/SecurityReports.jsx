import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileBarChart,
  FileText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Download,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  initialReports,
  initialReportMetrics,
} from "../data/mockReports";

function SecurityReports() {
  const reports = initialReports;

  const getScoreClass = (score) => {
    if (score >= 85) return "score-good";

    if (score >= 70) return "score-medium";

    return "score-danger";
  };

  return (
    <div className="page-container reports-page">

      {/* Header */}

      <div className="reports-heading">

        <div className="page-header">
          <h1>Security Reports</h1>

          <p>
            Consolidated security analysis across the
            complete Secure SDLC workflow.
          </p>
        </div>

        <button className="report-export-button">
          <Download size={15} />
          Export Report
        </button>

      </div>

      {/* Metrics */}

      <div className="report-metrics">

        <div className="card report-metric-card">

          <div className="report-metric-icon purple">
            <FileBarChart size={18} />
          </div>

          <span>Total Reports</span>

          <strong>
            {initialReportMetrics.totalReports}
          </strong>

          <small>
            Generated security reports
          </small>

        </div>

        <div className="card report-metric-card">

          <div className="report-metric-icon blue">
            <ShieldCheck size={18} />
          </div>

          <span>Average Score</span>

          <strong>
            {initialReportMetrics.averageScore}
            <small>/100</small>
          </strong>

          <small>
            Across all projects
          </small>

        </div>

        <div className="card report-metric-card">

          <div className="report-metric-icon orange">
            <AlertTriangle size={18} />
          </div>

          <span>Open Findings</span>

          <strong>
            {initialReportMetrics.openFindings}
          </strong>

          <small>
            Require attention
          </small>

        </div>

        <div className="card report-metric-card">

          <div className="report-metric-icon green">
            <CheckCircle2 size={18} />
          </div>

          <span>Fixed Findings</span>

          <strong>
            {initialReportMetrics.fixedFindings}
          </strong>

          <small>
            Successfully remediated
          </small>

        </div>

      </div>

      {/* Reports */}

      <div className="reports-section">

        <div className="report-section-heading">

          <div>
            <h3>Project Security Reports</h3>

            <p>
              Security posture of analyzed projects.
            </p>
          </div>

        </div>

        <div className="report-list">

          {reports.map((report) => (

            <div
              className="card report-project-card"
              key={report.id}
            >

              <div className="report-project-main">

                <div className="report-project-icon">
                  <FileText size={20} />
                </div>

                <div>

                  <div className="report-project-title">

                    <h3>
                      {report.project}
                    </h3>

                    <span>
                      {report.id}
                    </span>

                  </div>

                  <p>
                    Generated {report.generatedAt}
                  </p>

                </div>

              </div>

              <div
                className={`report-score ${getScoreClass(
                  report.securityScore
                )}`}
              >

                <strong>
                  {report.securityScore}
                </strong>

                <span>
                  Security Score
                </span>

              </div>

              <div
                className={`report-risk ${report.riskLevel.toLowerCase()}`}
              >
                {report.riskLevel} Risk
              </div>

              <div className="report-mini-stats">

                <div>
                  <strong>
                    {report.statistics.critical}
                  </strong>

                  <span>Critical</span>
                </div>

                <div>
                  <strong>
                    {report.statistics.high}
                  </strong>

                  <span>High</span>
                </div>

                <div>
                  <strong>
                    {report.statistics.medium}
                  </strong>

                  <span>Medium</span>
                </div>

                <div>
                  <strong>
                    {report.statistics.low}
                  </strong>

                  <span>Low</span>
                </div>

              </div>

              <Link
                to={`/reports/${report.id}`}
                className="report-view-button"
              >
                View
                <ChevronRight size={14} />
              </Link>

            </div>

          ))}

        </div>

      </div>

      {/* Security posture */}

      <div className="card security-posture">

        <div className="report-section-heading">

          <div>
            <h3>Security Posture Overview</h3>

            <p>
              Current distribution of security findings.
            </p>
          </div>

          <Shield size={18} />

        </div>

        <div className="posture-grid">

          <div className="posture-item critical">
            <CircleAlert size={17} />
            <span>Critical</span>
            <strong>
              {reports.reduce(
                (total, report) =>
                  total +
                  report.statistics.critical,
                0
              )}
            </strong>
          </div>

          <div className="posture-item high">
            <ShieldAlert size={17} />
            <span>High</span>
            <strong>
              {reports.reduce(
                (total, report) =>
                  total +
                  report.statistics.high,
                0
              )}
            </strong>
          </div>

          <div className="posture-item medium">
            <AlertTriangle size={17} />
            <span>Medium</span>
            <strong>
              {reports.reduce(
                (total, report) =>
                  total +
                  report.statistics.medium,
                0
              )}
            </strong>
          </div>

          <div className="posture-item low">
            <ShieldCheck size={17} />
            <span>Low</span>
            <strong>
              {reports.reduce(
                (total, report) =>
                  total +
                  report.statistics.low,
                0
              )}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default SecurityReports;