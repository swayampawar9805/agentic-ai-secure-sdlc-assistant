import { useMemo, useState } from "react";

import {
  Plus,
  Search,
  ScanSearch,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Eye,
  Filter,
  ShieldCheck,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useScans } from "../context/ScanContext";

function Scans() {
  const { scans } = useScans();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const completed = scans.filter(
    (scan) => scan.status === "Completed (Demo)"
  ).length;

  const running = scans.filter(
    (scan) => scan.status === "Running"
  ).length;

  const totalFindings = scans.reduce((sum, scan) => {
    return (
      sum +
      Object.values(scan.findings).reduce(
        (total, value) => total + value,
        0
      )
    );
  }, 0);

  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      const matchesSearch =
        scan.projectName.toLowerCase().includes(search.toLowerCase()) ||
        scan.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || scan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [scans, search, statusFilter]);

  return (
    <div className="page-container scans-page">

      <div className="scans-heading">
        <div className="page-header">
          <h1>Security Scans</h1>
          <p>
            Initiate assessments and monitor application security analysis.
          </p>
        </div>

        <Link to="/scans/new" className="primary-button">
          <Plus size={17} />
          New Security Scan
        </Link>
      </div>

      <div className="scan-stats">

        <div className="card scan-stat-card">
          <div className="scan-stat-icon blue">
            <ScanSearch size={20} />
          </div>
          <span>Total Scans</span>
          <h2>{scans.length}</h2>
        </div>

        <div className="card scan-stat-card">
          <div className="scan-stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <span>Completed</span>
          <h2>{completed}</h2>
        </div>

        <div className="card scan-stat-card">
          <div className="scan-stat-icon purple">
            <Clock3 size={20} />
          </div>
          <span>Running</span>
          <h2>{running}</h2>
        </div>

        <div className="card scan-stat-card">
          <div className="scan-stat-icon red">
            <AlertTriangle size={20} />
          </div>
          <span>Total Findings</span>
          <h2>{totalFindings}</h2>
        </div>

      </div>

      <div className="card scan-history-card">

        <div className="scan-history-heading">
          <div>
            <h3>Scan History</h3>
            <p>Review previous security assessments.</p>
          </div>

          <div className="scan-filters">

            <div className="scan-search">
              <Search size={16} />

              <input
                placeholder="Search scans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="scan-status-filter">
              <Filter size={15} />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Completed (Demo)">Completed (Demo)</option>
                <option value="Queued">Queued</option>
                <option value="Running">Running</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

          </div>
        </div>

        <div className="scan-table-wrapper">
          <table className="scan-table">

            <thead>
              <tr>
                <th>Scan ID</th>
                <th>Project</th>
                <th>Scan Type</th>
                <th>Date</th>
                <th>Findings</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredScans.map((scan) => {

                const findings = Object.values(
                  scan.findings
                ).reduce((a, b) => a + b, 0);

                return (
                  <tr key={scan.id}>

                    <td className="scan-id">
                      {scan.id}
                    </td>

                    <td>
                      <div className="scan-project-cell">
                        <div className="scan-project-icon">
                          <ShieldCheck size={17} />
                        </div>

                        <span>{scan.projectName}</span>
                      </div>
                    </td>

                    <td>{scan.scanType}</td>

                    <td>
                      {new Date(scan.startedAt).toLocaleDateString()}
                    </td>

                    <td>
                      <strong>{findings}</strong>
                    </td>

                    <td>
                      <span
                        className={`scan-status ${
                          scan.status === "Completed (Demo)"
                            ? "completed"
                            : scan.status.toLowerCase()
                        }`}
                      >
                        {scan.status}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/scans/${scan.id}`}
                        className="scan-view-link"
                      >
                        <Eye size={15} />
                        View
                      </Link>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>

          {filteredScans.length === 0 && (
            <div className="scan-empty">
              <ScanSearch size={30} />
              <h3>No scans found</h3>
              <p>Try changing the filters or create a new scan.</p>
            </div>
          )}

        </div>

      </div>

      <div className="scan-demo-notice">
        <AlertTriangle size={16} />
        <span>
          Demo records are illustrative. Actual scanner execution will be
          connected through Django in a later milestone.
        </span>
      </div>

    </div>
  );
}

export default Scans;