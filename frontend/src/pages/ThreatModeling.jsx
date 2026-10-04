import { useMemo, useState } from "react";

import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  Network,
  Plus,
  Eye,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useThreats } from "../context/ThreatContext";

import {
  threatCategories,
} from "../data/mockThreats";

function ThreatModeling() {
  const { threats } = useThreats();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const criticalCount = threats.filter(
    (item) => item.severity === "Critical"
  ).length;

  const mitigatedCount = threats.filter(
    (item) => item.status === "Mitigated"
  ).length;

  const activeCount = threats.filter(
    (item) => item.status !== "Mitigated"
  ).length;

  const filteredThreats = useMemo(() => {
    return threats.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.projectName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.asset.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || item.stride === category;

      const matchesStatus =
        status === "All" || item.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [threats, search, category, status]);

  const strideCounts = threatCategories.map((name) => ({
    name,
    count: threats.filter((item) => item.stride === name).length,
  }));

  return (
    <div className="page-container threat-page">

      <div className="threat-page-heading">

        <div className="page-header">
          <h1>Threat Modeling</h1>
          <p>
            Identify attack scenarios, assess security risks,
            and manage mitigation strategies.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            alert("Threat model creation form will be implemented next.")
          }
        >
          <Plus size={16} />
          New Threat Model
        </button>

      </div>

      <div className="threat-stats">

        <div className="card threat-stat">
          <div className="threat-stat-icon purple">
            <Network size={19} />
          </div>

          <span>Total Threats</span>
          <h2>{threats.length}</h2>
          <small>Across all projects</small>
        </div>

        <div className="card threat-stat">
          <div className="threat-stat-icon red">
            <ShieldAlert size={19} />
          </div>

          <span>Critical Threats</span>
          <h2>{criticalCount}</h2>
          <small>Require priority review</small>
        </div>

        <div className="card threat-stat">
          <div className="threat-stat-icon orange">
            <Activity size={19} />
          </div>

          <span>Active Threats</span>
          <h2>{activeCount}</h2>
          <small>Awaiting final mitigation</small>
        </div>

        <div className="card threat-stat">
          <div className="threat-stat-icon green">
            <ShieldCheck size={19} />
          </div>

          <span>Mitigated</span>
          <h2>{mitigatedCount}</h2>
          <small>Recorded as mitigated</small>
        </div>

      </div>

      <div className="threat-content-grid">

        <div className="card stride-card">

          <div className="threat-section-heading">
            <div>
              <h3>STRIDE Distribution</h3>
              <p>Threats categorized by attack type</p>
            </div>

            <ShieldAlert size={18} />
          </div>

          <div className="stride-list">

            {strideCounts.map((item, index) => (
              <div className="stride-item" key={item.name}>

                <div className="stride-item-header">
                  <span className="stride-letter">
                    {"STRIDE"[index]}
                  </span>

                  <span className="stride-name">
                    {item.name}
                  </span>

                  <strong>{item.count}</strong>
                </div>

                <div className="stride-progress">
                  <div
                    style={{
                      width: `${
                        threats.length
                          ? (item.count / threats.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>

              </div>
            ))}

          </div>
        </div>

        <div className="card threat-methodology-card">

          <div className="threat-section-heading">
            <div>
              <h3>Threat Modeling Workflow</h3>
              <p>Security analysis lifecycle</p>
            </div>

            <Network size={18} />
          </div>

          <div className="threat-workflow">

            {[
              "System Architecture",
              "Asset Identification",
              "Entry Point Analysis",
              "STRIDE Assessment",
              "Risk Prioritization",
              "Mitigation Planning",
            ].map((step, index) => (
              <div className="threat-workflow-step" key={step}>
                <div className="workflow-number">
                  {index + 1}
                </div>

                <span>{step}</span>

                {index !== 5 && (
                  <div className="workflow-connector" />
                )}
              </div>
            ))}

          </div>
        </div>

      </div>

      <div className="card threat-table-card">

        <div className="threat-table-heading">

          <div>
            <h3>Identified Threats</h3>
            <p>Review potential attack scenarios and security risks.</p>
          </div>

          <div className="threat-filters">

            <div className="threat-search">
              <Search size={16} />

              <input
                placeholder="Search threats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="threat-filter">
              <Filter size={15} />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All STRIDE</option>

                {threatCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="threat-filter">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Identified">Identified</option>
                <option value="Under Review">Under Review</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Accepted Risk">Accepted Risk</option>
              </select>
            </div>

          </div>
        </div>

        <div className="threat-table-wrapper">

          <table className="threat-table">

            <thead>
              <tr>
                <th>Threat</th>
                <th>Project</th>
                <th>STRIDE Category</th>
                <th>Severity</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredThreats.map((item) => (
                <tr key={item.id}>

                  <td>
                    <div className="threat-title-cell">
                      <strong>{item.title}</strong>
                      <span>{item.id}</span>
                    </div>
                  </td>

                  <td>{item.projectName}</td>

                  <td>
                    <span className="stride-badge">
                      {item.stride}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`severity-badge ${item.severity.toLowerCase()}`}
                    >
                      <i />
                      {item.severity}
                    </span>
                  </td>

                  <td>
                    <strong className="risk-score">
                      {item.riskScore}/10
                    </strong>
                  </td>

                  <td>
                    <span
                      className={`threat-status ${item.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <Link
                      to={`/threats/${item.id}`}
                      className="threat-review-link"
                    >
                      <Eye size={15} />
                      Review
                    </Link>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>

          {filteredThreats.length === 0 && (
            <div className="threat-empty">
              <ShieldCheck size={30} />
              <h3>No threats found</h3>
              <p>Try modifying your filters.</p>
            </div>
          )}

        </div>

      </div>

      <div className="threat-demo-notice">
        <AlertTriangle size={16} />
        Demonstration threat models. Automated STRIDE analysis
        will be integrated with the AI agents in a later phase.
      </div>

    </div>
  );
}

export default ThreatModeling;