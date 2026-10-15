import { useMemo, useState } from "react";
import {
  Search,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Clock3,
  Eye,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useVulnerabilities } from "../context/VulnerabilityContext";

function Vulnerabilities() {
  const {
    vulnerabilities,
    loading,
    error,
    refreshFindings,
  } = useVulnerabilities();

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");

  const count = (value) =>
    vulnerabilities.filter(
      (item) => item.severity?.toLowerCase() === value.toLowerCase()
    ).length;

  const openCount = vulnerabilities.filter(
    (item) => item.status === "Open"
  ).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vulnerabilities.filter((item) => {
      const searchableFields = [
        item.title,
        item.projectName,
        item.id,
        item.file,
        item.category,
        item.tool,
      ];

      const matchesSearch =
        !query ||
        searchableFields.some((field) =>
          String(field ?? "").toLowerCase().includes(query)
        );

      const matchesSeverity =
        severity === "All" ||
        item.severity?.toLowerCase() === severity.toLowerCase();

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
          {loading ? "Loading findings..." : `${vulnerabilities.length} Findings`}
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
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="vulnerability-select">
              <Filter size={15} />
              <select
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
                aria-label="Filter by severity"
              >
                <option value="All">All Severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Info">Info</option>
              </select>
            </div>

            <div className="vulnerability-select">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label="Filter by status"
              >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="Resolved">Resolved</option>
                <option value="Ignored">Ignored</option>
              </select>
            </div>

            <button
              type="button"
              className="finding-view-link"
              onClick={refreshFindings}
              disabled={loading}
              title="Refresh findings"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="vulnerability-empty" role="alert">
            <AlertTriangle size={28} />
            <h3>Unable to load findings</h3>
            <p>{error}</p>
            <button
              type="button"
              className="primary-button"
              onClick={refreshFindings}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        )}

        {!error && (
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
                {!loading &&
                  filtered.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="finding-title">
                          <strong>{item.title || "Untitled finding"}</strong>
                          <span>#{item.id}</span>
                        </div>
                      </td>

                      <td>{item.projectName || "Unknown Project"}</td>

                      <td>
                        <span
                          className={`severity-badge ${(item.severity || "unknown").toLowerCase()}`}
                        >
                          <i />
                          {item.severity || "Unknown"}
                        </span>
                      </td>

                      <td>{item.category || "Security Finding"}</td>
                      <td>{item.tool || "Unknown Tool"}</td>

                      <td>
                        <span
                          className={`finding-status ${(item.status || "open")
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {item.status || "Open"}
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

            {loading && (
              <div className="vulnerability-empty" role="status">
                <RefreshCw size={28} />
                <h3>Loading security findings</h3>
                <p>Retrieving findings from the backend.</p>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="vulnerability-empty">
                <ShieldCheck size={32} />
                <h3>
                  {vulnerabilities.length === 0
                    ? "No security findings yet"
                    : "No matching findings"}
                </h3>
                <p>
                  {vulnerabilities.length === 0
                    ? "Run a scan on a project to populate this list."
                    : "Try changing your search or filters."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="vulnerability-demo-note">
        <ShieldCheck size={16} />
        Findings are loaded from the authenticated backend API.
      </div>
    </div>
  );
}

export default Vulnerabilities;