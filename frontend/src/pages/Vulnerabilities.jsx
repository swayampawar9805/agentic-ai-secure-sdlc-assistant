import { useMemo, useState } from "react";

import {
  Search,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Clock3,
  Eye,
  Filter,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useVulnerabilities } from "../context/VulnerabilityContext";

function Vulnerabilities() {
  const { vulnerabilities } = useVulnerabilities();

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");

  const count = (value) =>
    vulnerabilities.filter((item) => item.severity === value).length;

  const openCount = vulnerabilities.filter(
    (item) => item.status === "Open"
  ).length;

  const filtered = useMemo(() => {
    return vulnerabilities.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.projectName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.file.toLowerCase().includes(query);

      const matchesSeverity =
        severity === "All" || item.severity === severity;

      const matchesStatus =
        status === "All" || item.status === status;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [vulnerabilities, search, severity, status]);

  return (
    <div className="page-container vulnerability-page">

      <div className="vulnerability-heading">
        <div className="page-header">
          <h1>Vulnerabilities</h1>
          <p>
            Investigate security findings and manage remediation workflows.
          </p>
        </div>

        <div className="vulnerability-total">
          <ShieldAlert size={18} />
          {vulnerabilities.length} Findings
        </div>
      </div>

      <div className="vulnerability-stats">

        <div className="card vulnerability-stat">
          <div className="vulnerability-stat-icon red">
            <ShieldAlert size={19} />
          </div>
          <span>Critical</span>
          <h2>{count("Critical")}</h2>
        </div>

        <div className="card vulnerability-stat">
          <div className="vulnerability-stat-icon orange">
            <AlertTriangle size={19} />
          </div>
          <span>High</span>
          <h2>{count("High")}</h2>
        </div>

        <div className="card vulnerability-stat">
          <div className="vulnerability-stat-icon yellow">
            <Clock3 size={19} />
          </div>
          <span>Medium</span>
          <h2>{count("Medium")}</h2>
        </div>

        <div className="card vulnerability-stat">
          <div className="vulnerability-stat-icon green">
            <ShieldCheck size={19} />
          </div>
          <span>Open Findings</span>
          <h2>{openCount}</h2>
        </div>

      </div>

      <div className="card vulnerability-list-card">

        <div className="vulnerability-list-heading">
          <div>
            <h3>Security Findings</h3>
            <p>Review and prioritize discovered vulnerabilities.</p>
          </div>

          <div className="vulnerability-filters">

            <div className="vulnerability-search">
              <Search size={16} />

              <input
                placeholder="Search findings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="vulnerability-select">
              <Filter size={15} />

              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="All">All Severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="vulnerability-select">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Accepted Risk">Accepted Risk</option>
              </select>
            </div>

          </div>
        </div>

        <div className="vulnerability-table-wrapper">
          <table className="vulnerability-table">

            <thead>
              <tr>
                <th>Finding</th>
                <th>Project</th>
                <th>Severity</th>
                <th>Category</th>
                <th>Source</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>

                  <td>
                    <div className="finding-title">
                      <strong>{item.title}</strong>
                      <span>{item.id}</span>
                    </div>
                  </td>

                  <td>{item.projectName}</td>

                  <td>
                    <span
                      className={`severity-badge ${item.severity.toLowerCase()}`}
                    >
                      <i></i>
                      {item.severity}
                    </span>
                  </td>

                  <td>{item.category}</td>

                  <td>{item.tool}</td>

                  <td>
                    <span
                      className={`finding-status ${
                        item.status.toLowerCase().replace(" ", "-")
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <Link
                      to={`/vulnerabilities/${item.id}`}
                      className="finding-view-link"
                    >
                      <Eye size={15} />
                      Review
                    </Link>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

          {filtered.length === 0 && (
            <div className="vulnerability-empty">
              <ShieldCheck size={32} />
              <h3>No findings found</h3>
              <p>Try changing your search or filters.</p>
            </div>
          )}

        </div>
      </div>

      <div className="vulnerability-demo-note">
        <AlertTriangle size={16} />
        Demonstration findings only. Actual vulnerability data will be
        populated from the scanning pipeline.
      </div>

    </div>
  );
}

export default Vulnerabilities;