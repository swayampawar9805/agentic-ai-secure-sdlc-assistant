import {
  FolderKanban,
  ShieldCheck,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  ShieldAlert,
} from "lucide-react";

const stats = [
  {
    title: "Total Projects",
    value: "12",
    change: "+2 this month",
    icon: FolderKanban,
    color: "blue",
  },
  {
    title: "Security Scans",
    value: "48",
    change: "+12 this week",
    icon: ShieldCheck,
    color: "green",
  },
  {
    title: "Vulnerabilities",
    value: "23",
    change: "8 require attention",
    icon: AlertTriangle,
    color: "red",
  },
  {
    title: "Security Score",
    value: "86%",
    change: "+5% this month",
    icon: Activity,
    color: "purple",
  },
];

const projects = [
  {
    name: "Healthcare Management System",
    language: "Python",
    status: "Completed",
    vulnerabilities: 4,
    score: 92,
  },
  {
    name: "NexusHR",
    language: "Java",
    status: "Completed",
    vulnerabilities: 8,
    score: 78,
  },
  {
    name: "E-Commerce Platform",
    language: "JavaScript",
    status: "Running",
    vulnerabilities: 11,
    score: 65,
  },
];

const activities = [
  {
    title: "Security scan completed",
    description: "Healthcare Management System",
    time: "10 minutes ago",
    type: "success",
  },
  {
    title: "Critical vulnerability detected",
    description: "E-Commerce Platform",
    time: "35 minutes ago",
    type: "danger",
  },
  {
    title: "New project created",
    description: "NexusHR",
    time: "2 hours ago",
    type: "info",
  },
];

function Dashboard() {
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

        <button className="primary-button" type="button">
          <ShieldCheck size={17} />
          New Security Scan
        </button>

      </div>

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

              <h2>{stat.value}</h2>

              <p className="stat-change">
                {stat.change}
              </p>

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
              <p>Your recently analysed repositories</p>
            </div>

            <button className="text-button" type="button">
              View all <ArrowRight size={15} />
            </button>
          </div>

          <div className="project-list">

            {projects.map((project) => (
              <div className="project-row" key={project.name}>

                <div className="project-info">
                  <div className="project-icon">
                    <FolderKanban size={19} />
                  </div>

                  <div>
                    <h4>{project.name}</h4>
                    <span>{project.language}</span>
                  </div>
                </div>

                <div className="project-security">
                  <div className="security-score">
                    <span>{project.score}%</span>
                    <div className="score-track">
                      <div
                        className="score-fill"
                        style={{ width: `${project.score}%` }}
                      ></div>
                    </div>
                  </div>

                  <span className={`severity-count ${
                    project.vulnerabilities > 7 ? "high" : "medium"
                  }`}>
                    {project.vulnerabilities} issues
                  </span>
                </div>

              </div>
            ))}

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
            <h2>23</h2>
            <span>Total findings</span>
          </div>

          <div className="severity-bar">
            <div className="severity-critical"></div>
            <div className="severity-high"></div>
            <div className="severity-medium"></div>
            <div className="severity-low"></div>
          </div>

          <div className="severity-list">

            <div>
              <span><i className="dot critical"></i> Critical</span>
              <strong>2</strong>
            </div>

            <div>
              <span><i className="dot high"></i> High</span>
              <strong>6</strong>
            </div>

            <div>
              <span><i className="dot medium"></i> Medium</span>
              <strong>9</strong>
            </div>

            <div>
              <span><i className="dot low"></i> Low</span>
              <strong>6</strong>
            </div>

          </div>

        </div>

      </section>

      {/* Activity */}

      <section className="card dashboard-panel activity-panel">

        <div className="panel-heading">
          <div>
            <h3>Recent Activity</h3>
            <p>Latest events across your workspace</p>
          </div>

          <Clock3 size={18} className="muted-icon" />
        </div>

        <div className="activity-list">

          {activities.map((activity, index) => (
            <div className="activity-row" key={index}>

              <div className={`activity-icon ${activity.type}`}>
                <Activity size={17} />
              </div>

              <div className="activity-description">
                <h4>{activity.title}</h4>
                <p>{activity.description}</p>
              </div>

              <span className="activity-time">
                {activity.time}
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