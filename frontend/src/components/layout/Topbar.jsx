import {
  Search,
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

function Topbar() {
  return (
    <header className="topbar">

      <div className="topbar-left">
        <button
          className="mobile-menu"
          aria-label="Open navigation"
          type="button"
        >
          <Menu size={21} />
        </button>

        <div className="breadcrumb">
          <span>Workspace</span>
          <span className="breadcrumb-separator">/</span>
          <strong>Dashboard</strong>
        </div>
      </div>

      <div className="topbar-right">

        <div className="search-box">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search anything..."
            aria-label="Search"
          />

          <kbd>⌘ K</kbd>
        </div>

        <button
          className="icon-button notification-button"
          aria-label="Notifications"
          type="button"
        >
          <Bell size={19} />
          <span className="notification-dot"></span>
        </button>

        <div className="topbar-divider"></div>

        <button className="user-menu" type="button">
          <div className="user-avatar">YS</div>

          <div className="user-info">
            <strong>Developer</strong>
            <span>Security Engineer</span>
          </div>

          <ChevronDown size={16} />
        </button>

      </div>

    </header>
  );
}

export default Topbar;