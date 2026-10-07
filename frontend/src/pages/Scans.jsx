import {
  useMemo,
  useState,
} from "react";

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

  const {
    scans,
    loading,
    error,
  } = useScans();


  const [search, setSearch] =
    useState("");


  const [statusFilter, setStatusFilter] =
    useState("All");


  const completed = scans.filter(
    (scan) =>
      scan.status === "completed"
  ).length;


  const running = scans.filter(
    (scan) =>
      scan.status === "running"
  ).length;


  /*
   * Calculate total findings
   * across all scans.
   *
   * finding_count is provided
   * directly by the Django backend.
   */
  const totalFindings = scans.reduce(
    (total, scan) =>
      total + (scan.finding_count || 0),
    0
  );


  const filteredScans =
    useMemo(() => {

      return scans.filter(
        (scan) => {

          const projectName =
            scan.project_name ||
            "";


          const scanId =
            String(
              scan.id || ""
            );


          const searchValue =
            search.toLowerCase();


          const matchesSearch =
            projectName
              .toLowerCase()
              .includes(
                searchValue
              ) ||

            scanId
              .toLowerCase()
              .includes(
                searchValue
              );


          const matchesStatus =
            statusFilter === "All" ||
            scan.status ===
              statusFilter;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      scans,
      search,
      statusFilter,
    ]);


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

    if (!scanType) {
      return "Full Security Scan";
    }

    if (
      scanType === "full"
    ) {
      return "Full Security Scan";
    }

    if (
      scanType === "sast"
    ) {
      return "Static Analysis";
    }

    if (
      scanType === "dependency"
    ) {
      return "Dependency Scan";
    }

    if (
      scanType === "secrets"
    ) {
      return "Secret Scan";
    }

    return scanType;

  };


  if (loading) {

    return (

      <div className="page-container scans-page">

        <div className="page-header">

          <h1>
            Security Scans
          </h1>

          <p>
            Loading security scans...
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="page-container scans-page">


      <div className="scans-heading">

        <div className="page-header">

          <h1>
            Security Scans
          </h1>

          <p>
            Initiate assessments and monitor
            application security analysis.
          </p>

        </div>


        <Link
          to="/scans/new"
          className="primary-button"
        >

          <Plus size={17} />

          New Security Scan

        </Link>

      </div>


      {error && (

        <div className="scan-demo-notice">

          <AlertTriangle size={16} />

          <span>
            {error}
          </span>

        </div>

      )}


      <div className="scan-stats">


        <div className="card scan-stat-card">

          <div className="scan-stat-icon blue">

            <ScanSearch size={20} />

          </div>

          <span>
            Total Scans
          </span>

          <h2>
            {scans.length}
          </h2>

        </div>


        <div className="card scan-stat-card">

          <div className="scan-stat-icon green">

            <CheckCircle2 size={20} />

          </div>

          <span>
            Completed
          </span>

          <h2>
            {completed}
          </h2>

        </div>


        <div className="card scan-stat-card">

          <div className="scan-stat-icon purple">

            <Clock3 size={20} />

          </div>

          <span>
            Running
          </span>

          <h2>
            {running}
          </h2>

        </div>


        <div className="card scan-stat-card">

          <div className="scan-stat-icon red">

            <AlertTriangle size={20} />

          </div>

          <span>
            Total Findings
          </span>

          <h2>
            {totalFindings}
          </h2>

        </div>


      </div>


      <div className="card scan-history-card">


        <div className="scan-history-heading">

          <div>

            <h3>
              Scan History
            </h3>

            <p>
              Review previous security assessments.
            </p>

          </div>


          <div className="scan-filters">


            <div className="scan-search">

              <Search size={16} />

              <input
                placeholder="Search scans..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="scan-status-filter">

              <Filter size={15} />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >

                <option value="All">
                  All Status
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="running">
                  Running
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="failed">
                  Failed
                </option>

              </select>

            </div>


          </div>

        </div>


        <div className="scan-table-wrapper">

          <table className="scan-table">


            <thead>

              <tr>

                <th>
                  Scan ID
                </th>

                <th>
                  Project
                </th>

                <th>
                  Scan Type
                </th>

                <th>
                  Date
                </th>

                <th>
                  Findings
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredScans.map(
                (scan) => {

                  return (

                    <tr
                      key={scan.id}
                    >

                      <td className="scan-id">

                        SCN-
                        {scan.id}

                      </td>


                      <td>

                        <div className="scan-project-cell">

                          <div className="scan-project-icon">

                            <ShieldCheck
                              size={17}
                            />

                          </div>

                          <span>
                            {scan.project_name ||
                              "Unknown Project"}
                          </span>

                        </div>

                      </td>


                      <td>

                        {formatScanType(
                          scan.scan_type
                        )}

                      </td>


                      <td>

                        {scan.created_at

                          ? new Date(
                              scan.created_at
                            ).toLocaleDateString()

                          : "—"}

                      </td>


                      <td>

                        <strong>
                          {scan.finding_count || 0}
                        </strong>

                      </td>


                      <td>

                        <span
                          className={`scan-status ${
                            scan.status
                          }`}
                        >

                          {formatStatus(
                            scan.status
                          )}

                        </span>

                      </td>


                      <td>

                        <Link
                          to={`/scans/${scan.id}`}
                          className="scan-view-link"
                        >

                          <Eye
                            size={15}
                          />

                          View

                        </Link>

                      </td>


                    </tr>

                  );

                }
              )}

            </tbody>


          </table>


          {filteredScans.length ===
            0 && (

            <div className="scan-empty">

              <ScanSearch
                size={30}
              />

              <h3>
                No scans found
              </h3>

              <p>
                Try changing the
                filters or create a
                new scan.
              </p>

            </div>

          )}


        </div>

      </div>


      <div className="scan-demo-notice">

        <AlertTriangle
          size={16}
        />

        <span>

          Scanner execution will be
          connected in a later milestone.
          Currently, scans are tracked
          through the Django backend.

        </span>

      </div>


    </div>

  );

}


export default Scans;