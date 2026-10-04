import {
  ShieldCheck,
  LayoutDashboard,
  FolderKanban,
  ScanSearch,
  Bug,
  Network,
  Bot,
  FileText,
  History,
  Settings,
  UserRound,
  LogOut,
  ShieldAlert,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  {
    title: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "DEVELOPMENT",
    items: [
      {
        name: "My Projects",
        path: "/projects",
        icon: FolderKanban,
      },
      {
        name: "New Project",
        path: "/projects/new",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "SECURITY",
    items: [
      {
        name: "Security Scans",
        path: "/scans",
        icon: ScanSearch,
      },
      {
        name: "Vulnerabilities",
        path: "/vulnerabilities",
        icon: Bug,
      },
      {
        name: "Threat Modeling",
        path: "/threats",
        icon: Network,
      },
      {
        name: "AI Agents",
        path: "/agents",
        icon: Bot,
      },
    ],
  },
  {
    title: "REPORTING",
    items: [
      {
        name: "Security Reports",
        path: "/reports",
        icon: FileText,
      },
      {
        name: "Scan History",
        path: "/history",
        icon: History,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
      },
      {
        name: "Profile",
        path: "/profile",
        icon: UserRound,
      },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-brand">
        <div className="brand-icon">
          <ShieldCheck size={23} />
        </div>

        <div className="brand-text">
          <h2>SecureGuard</h2>
          <span>AI SECURITY PLATFORM</span>
        </div>
      </div>

      <div className="sidebar-content">

        {navigation.map((group) => (
          <div className="nav-group" key={group.title}>

            <p className="nav-group-title">
              {group.title}
            </p>

            {group.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

          </div>
        ))}

      </div>

      <div className="sidebar-footer">
        <div className="security-status">
          <ShieldAlert size={18} />

          <div>
            <p>Security Engine</p>
            <span>
              <span className="status-dot"></span>
              Initializing
            </span>
          </div>
        </div>

        <button className="logout-button" type="button">
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;