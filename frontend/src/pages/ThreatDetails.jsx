import { useState } from "react";

import {
  ArrowLeft,
  ShieldAlert,
  Network,
  Target,
  ShieldCheck,
  FileText,
  Save,
  AlertTriangle,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

import { useThreats } from "../context/ThreatContext";

function ThreatDetails() {
  const { id } = useParams();

  const {
    getThreat,
    updateThreatStatus,
    updateMitigation,
  } = useThreats();

  const threat = getThreat(id);

  const [mitigation, setMitigation] = useState(
    threat?.mitigation || ""
  );

  const [message, setMessage] = useState("");

  if (!threat) {
    return (
      <div className="page-container">
        <Link to="/threats" className="threat-back-link">
          <ArrowLeft size={16} />
          Back to Threat Modeling
        </Link>

        <div className="card threat-empty">
          <h3>Threat not found</h3>
        </div>
      </div>
    );
  }

  const saveMitigation = () => {
    updateMitigation(threat.id, mitigation);
    setMessage("Mitigation strategy saved.");
  };

  const handleStatus = (value) => {
    updateThreatStatus(threat.id, value);
    setMessage(`Threat status updated to ${value}.`);
  };

  return (
    <div className="page-container threat-details-page">

      <Link to="/threats" className="threat-back-link">
        <ArrowLeft size={16} />
        Back to Threat Modeling
      </Link>

      <div className="threat-detail-heading">

        <div>
          <span className="threat-id-label">{threat.id}</span>

          <h1>{threat.title}</h1>

          <p>{threat.projectName}</p>
        </div>

        <span
          className={`severity-badge large ${threat.severity.toLowerCase()}`}
        >
          <i />
          {threat.severity} Risk
        </span>

      </div>

      {message && (
        <div className="threat-success-message" role="status">
          <ShieldCheck size={16} />
          {message}
        </div>
      )}

      <div className="threat-detail-grid">

        <div className="threat-detail-main">

          <div className="card threat-detail-card">

            <div className="threat-detail-card-heading">
              <ShieldAlert size={19} />
              <h3>Threat Description</h3>
            </div>

            <p>{threat.attackScenario}</p>

          </div>

          <div className="card threat-detail-card">

            <div className="threat-detail-card-heading">
              <Target size={19} />
              <h3>Attack Surface</h3>
            </div>

            <div className="threat-attribute">
              <span>Target Asset</span>
              <strong>{threat.asset}</strong>
            </div>

            <div className="threat-attribute">
              <span>Entry Point</span>
              <strong>{threat.entryPoint}</strong>
            </div>

            <div className="threat-attribute">
              <span>Trust Boundary</span>
              <strong>{threat.trustBoundary}</strong>
            </div>

            <div className="threat-attribute">
              <span>STRIDE Category</span>
              <strong>{threat.stride}</strong>
            </div>

          </div>

          <div className="card threat-detail-card">

            <div className="threat-detail-card-heading">
              <AlertTriangle size={19} />
              <h3>Potential Security Impact</h3>
            </div>

            <p>{threat.impact}</p>

          </div>

          <div className="card threat-detail-card">

            <div className="threat-detail-card-heading">
              <ShieldCheck size={19} />
              <h3>Mitigation Strategy</h3>
            </div>

            <p className="threat-mitigation-description">
              Recommended security controls can be reviewed and
              modified by the developer.
            </p>

            <textarea
              className="threat-mitigation-input"
              value={mitigation}
              onChange={(e) => setMitigation(e.target.value)}
              rows={6}
              placeholder="Enter mitigation strategy..."
            />

            <button
              className="primary-button threat-save-button"
              onClick={saveMitigation}
            >
              <Save size={15} />
              Save Mitigation
            </button>

          </div>

        </div>

        <aside className="threat-detail-sidebar">

          <div className="card threat-detail-card">

            <h3>Risk Assessment</h3>

            <div className="risk-score-display">
              <strong>{threat.riskScore}</strong>
              <span>/10</span>
            </div>

            <div className="risk-meter">
              <div
                className={
                  threat.riskScore >= 8
                    ? "critical"
                    : threat.riskScore >= 6
                    ? "high"
                    : "moderate"
                }
                style={{
                  width: `${threat.riskScore * 10}%`,
                }}
              />
            </div>

            <div className="threat-attribute">
              <span>Likelihood</span>
              <strong>{threat.likelihood}</strong>
            </div>

            <div className="threat-attribute">
              <span>Impact</span>
              <strong>{threat.impact === "Critical"
                ? "Critical"
                : threat.impact}</strong>
            </div>

            <div className="threat-attribute">
              <span>Severity</span>
              <strong>{threat.severity}</strong>
            </div>

          </div>

          <div className="card threat-detail-card">

            <h3>Threat Management</h3>

            <div className="threat-current-status">
              <span>Current Status</span>

              <span
                className={`threat-status ${threat.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {threat.status}
              </span>
            </div>

            <label className="threat-status-label">
              Update Status
            </label>

            <select
              className="threat-status-select"
              value={threat.status}
              onChange={(e) => handleStatus(e.target.value)}
            >
              <option value="Identified">Identified</option>
              <option value="Under Review">Under Review</option>
              <option value="Mitigated">Mitigated</option>
              <option value="Accepted Risk">Accepted Risk</option>
            </select>

            <div className="threat-attribute">
              <span>Assigned Team</span>
              <strong>{threat.owner}</strong>
            </div>

            <div className="threat-attribute">
              <span>Identified On</span>
              <strong>{threat.discoveredAt}</strong>
            </div>

          </div>

          <div className="card threat-detail-card">

            <div className="threat-detail-card-heading">
              <FileText size={18} />
              <h3>Analysis Information</h3>
            </div>

            <p className="threat-analysis-note">
              This record currently contains sample threat analysis.
              The future Threat Modeling Agent will generate
              attack scenarios, risk assessments, and mitigation
              recommendations from project requirements and architecture.
            </p>

          </div>

        </aside>

      </div>

    </div>
  );
}

export default ThreatDetails;