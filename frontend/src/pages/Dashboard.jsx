import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  FolderKanban,
  ShieldCheck,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

import { useProjects } from "../context/ProjectContext";
import { useScans } from "../context/ScanContext";
import { useVulnerabilities } from "../context/VulnerabilityContext";

const SEVERITIES = ["Critical", "High", "Medium", "Low"];

const normalize = (value) =>
  String(value ?? "").toLowerCase();

const getTimestamp = (item) => {
  const value =
    item?.created_at ??
    item?.createdAt ??
    item?.started_at ??
    item?.startedAt ??
    item?.updated_at ??
    item?.updatedAt;

  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatTimeAgo = (value) => {
  if (!value) return "Date unavailable";

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) return "Date unavailable";

  const difference = Date.now() - timestamp;

  if (difference < 0) return "Just now";

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
};

const getScanStatus = (scan) =>
  normalize(scan?.status);

const getScanProjectId = (scan) =>
  scan?.project_id ?? scan?.project;

const getFindingProjectId = (finding) =>
  finding?.projectId ??
  finding?.project_id ??
  finding?.scan?.project_id;

function Dashboard() {
  const navigate = useNavigate();

  const {
    projects: projectData,
    loading: projectsLoading,
    error: projectsError,
    refreshProjects,
  } = useProjects();

  const {
    scans: scanData,
    loading: scansLoading,
    error: scansError,
    refreshScans,
  } = useScans();

  const {
    vulnerabilities: findingData,
    loading: findingsLoading,
    error: findingsError,
    refreshFindings,
  } = useVulnerabilities();

  const projects = Array.isArray(projectData)
    ? projectData
    : [];

  const scans = Array.isArray(scanData)
    ? scanData
    : [];

  const findings = Array.isArray(findingData)
    ? findingData
    : [];

  const loading =
    projectsLoading || scansLoading || findingsLoading;

  const hasError =
    Boolean(projectsError || scansError || findingsError);

  const refreshDashboard = async () => {
    await Promise.allSettled([
      refreshProjects(),
      refreshScans(),
      refreshFindings(),
    ]);
  };

  const severityCounts = useMemo(() => {
    const counts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Info: 0,
    };

    findings.forEach((finding) => {
      const severity = normalize(finding.severity);

      const key =
        severity.charAt(0).toUpperCase() + severity.slice(1);

      if (Object.prototype.hasOwnProperty.call(counts, key)) {
        counts[key] += 1;
      }
    });

    return counts;
  }, [findings]);

  const openFindings = findings.filter(
    (finding) => normalize(finding.status) === "open"
  ).length;

  const completedScans = scans.filter(
    (scan) => getScanStatus(scan) === "completed"
  ).length;

  const runningScans = scans.filter((scan) =>
    ["running", "pending"].includes(getScanStatus(scan))
  ).length;

  const recentProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => getTimestamp(b) - getTimestamp(a))
        .slice(0, 3),
    [projects]
  );

  const projectFindingsCount = (project) =>
    findings.filter(
      (finding) =>
        String(getFindingProjectId(finding)) === String(project.id)
    ).length;

  const recentActivity = useMemo(() => {
    const scanActivities = scans.map((scan) => {
      const projectId = getScanProjectId(scan);

      const project = projects.find(
        (item) => String(item.id) === String(projectId)
      );

      const status = getScanStatus(scan);

      let title = "Security scan created";
      let type = "info";

      if (status === "completed") {
        title = "Security scan completed";
        type = "success";
      } else if (status === "failed") {
        title = "Security scan failed";
        type = "danger";
      } else if (status === "running") {
        title = "Security scan running";
      }

      return {
        id: `scan-${scan.id}`,
        title,
        description:
          scan.project_name ||
          project?.name ||
          `Scan #${scan.id}`,
        timestamp: getTimestamp(scan),
        timeValue:
          scan.created_at ??
          scan.createdAt ??
          scan.started_at ??
          scan.startedAt,
        type,
        destination: scan.id
          ? `/scans/${scan.id}`
          : "/scans",
      };
    });

    const findingActivities = findings.map((finding) => {
      const severity = normalize(finding.severity);
      const project = projects.find(
        (item) =>
          String(item.id) ===
          String(getFindingProjectId(finding))
      );

      return {
        id: `finding-${finding.id}`,
        title: `${severity || "Security"} vulnerability detected`,
        description:
          finding.project_name ||
          project?.name ||
          finding.title ||
          `Finding #${finding.id}`,
        timestamp: getTimestamp(finding),
        timeValue: finding.created_at ?? finding.createdAt,
        type:
          ["critical", "high"].includes(severity)
            ? "danger"
            : "info",
        destination: `/vulnerabilities/${finding.id}`,
      };
    });

    return [...scanActivities, ...findingActivities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [scans, findings, projects]);

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      change: "Registered projects",
      icon: FolderKanban,
      color: "blue",
    },
    {
      title: "Security Scans",
      value: scans.length,
      change: `${completedScans} completed · ${runningScans} pending/running`,
      icon: ShieldCheck,
      color: "green",
    },
    {
      title: "Vulnerabilities",
      value: findings.length,
      change: `${openFindings} open findings`,
      icon: AlertTriangle,
      color: "red",
    },
    {
      title: "Security Score",
      value: "N/A",
      change: "Score calculation not connected",
      icon: Activity,
      color: "purple",
    },
  ];

  return (
    <div className="page-container">
      <div className="dashboard-heading">
        <div className="page-header">
          <h1>Security Overview</h1>
          <p>
            Monitor your projects, security posture, and
            recent analysis activity.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="text-button"
            type="button"
            onClick={refreshDashboard}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          <button
            className="primary-button"
            type="button"
            onClick={() => navigate("/scans/new")}
          >
            <ShieldCheck size={17} />
            New Security Scan
          </button>
        </div>
      </div>

      {hasError && (
        <div className="card dashboard-panel">
          <p>
            Some dashboard data could not be loaded.
            Check your backend connection and try refreshing.
          </p>
          <button
            className="text-button"
            type="button"
            onClick={refreshDashboard}
          >
            Try again <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Statistics */}

      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="card stat-card" key={stat.title}>
              <div className="stat-top">
                <span>{stat.title}</span>

                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={19} />
                </div>
              </div>

              <h2>
                {loading ? "—" : stat.value}
              </h2>

              <p className="stat-change">{stat.change}</p>
            </div>
          );
        })}
      </section>

      {/* Main dashboard grid */}

      <section className="dashboard-grid">
        <div className="card dashboard-panel projects-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Projects</h3>
              <p>Your recently registered projects</p>
            </div>

            <button
              className="text-button"
              type="button"
              onClick={() => navigate("/projects")}
            >
              View all <ArrowRight size={15} />
            </button>
          </div>

          <div className="project-list">
            {!loading && recentProjects.length === 0 && (
              <p>No projects found. Create your first project.</p>
            )}

            {recentProjects.map((project) => {
              const issueCount = projectFindingsCount(project);

              const score =
                project.security_score ??
                project.securityScore;

              const validScore =
                score !== null &&
                score !== undefined &&
                score !== "" &&
                Number.isFinite(Number(score));

              return (
                <div
                  className="project-row"
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/projects/${project.id}`)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      navigate(`/projects/${project.id}`);
                    }
                  }}
                >
                  <div className="project-info">
                    <div className="project-icon">
                      <FolderKanban size={19} />
                    </div>

                    <div>
                      <h4>{project.name || `Project #${project.id}`}</h4>
                      <span>
                        {project.language ||
                          project.primary_language ||
                          "Language not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="project-security">
                    <div className="security-score">
                      <span>
                        {validScore ? `${Number(score)}%` : "N/A"}
                      </span>

                      <div className="score-track">
                        {validScore && (
                          <div
                            className="score-fill"
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, Number(score))
                              )}%`,
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <span
                      className={`severity-count ${
                        issueCount > 0 ? "high" : "medium"
                      }`}
                    >
                      {issueCount} issues
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Vulnerability Overview</h3>
              <p>Distribution by severity</p>
            </div>

            <ShieldAlert size={19} className="muted-icon" />
          </div>

          <div className="vulnerability-total">
            <h2>{loading ? "—" : findings.length}</h2>
            <span>Total findings</span>
          </div>

          <div className="severity-bar">
            {SEVERITIES.map((severity) => {
              const total = findings.length;
              const count = severityCounts[severity];

              return (
                <div
                  key={severity}
                  className={`severity-${severity.toLowerCase()}`}
                  style={{
                    width:
                      total > 0
                        ? `${(count / total) * 100}%`
                        : "0%",
                  }}
                  title={`${severity}: ${count}`}
                />
              );
            })}
          </div>

          <div className="severity-list">
            {SEVERITIES.map((severity) => (
              <div key={severity}>
                <span>
                  <i className={`dot ${severity.toLowerCase()}`} />
                  {" "}{severity}
                </span>
                <strong>
                  {loading ? "—" : severityCounts[severity]}
                </strong>
              </div>
            ))}

            <div>
              <span>
                <i className="dot" />
                {" "}Info
              </span>
              <strong>
                {loading ? "—" : severityCounts.Info}
              </strong>
            </div>
          </div>

          <button
            className="text-button"
            type="button"
            onClick={() => navigate("/vulnerabilities")}
          >
            View findings <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Recent Activity */}

      <section className="card dashboard-panel activity-panel">
        <div className="panel-heading">
          <div>
            <h3>Recent Activity</h3>
            <p>Latest recorded scans and findings</p>
          </div>

          <Clock3 size={18} className="muted-icon" />
        </div>

        <div className="activity-list">
          {!loading && recentActivity.length === 0 && (
            <p>No scan or finding activity is available yet.</p>
          )}

          {recentActivity.map((item) => (
            <div
              className="activity-row"
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(item.destination)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  navigate(item.destination);
                }
              }}
            >
              <div className={`activity-icon ${item.type}`}>
                <Activity size={17} />
              </div>

              <div className="activity-description">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>

              <span className="activity-time">
                {formatTimeAgo(item.timeValue)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-footer">
        <span>SecureGuard AI Security Platform</span>
        <span>
          System Overview <ArrowUpRight size={13} />
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
