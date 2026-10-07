import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Topbar() {

  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {

    setMenuOpen(false);

    await logout();

    navigate(
      "/login",
      { replace: true }
    );
  };

  const username =
    user?.username || "Developer";

  const firstName =
    user?.first_name ||
    username;

  const initials =
    username
      .slice(0, 2)
      .toUpperCase();

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

          <span>
            Workspace
          </span>

          <span className="breadcrumb-separator">
            /
          </span>

          <strong>
            Dashboard
          </strong>

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

          <kbd>
            ⌘ K
          </kbd>

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

        <div className="user-menu-wrapper">

          <button
            className="user-menu"
            type="button"
            onClick={() =>
              setMenuOpen(
                !menuOpen
              )
            }
          >

            <div className="user-avatar">
              {initials}
            </div>

            <div className="user-info">

              <strong>
                {firstName}
              </strong>

              <span>
                Security Engineer
              </span>

            </div>

            <ChevronDown
              size={16}
            />

          </button>

          {menuOpen && (

            <div className="user-dropdown">

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
              >

                <User size={16} />

                <span>
                  Profile
                </span>

              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
              >

                <Settings size={16} />

                <span>
                  Settings
                </span>

              </button>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="logout-item"
                onClick={handleLogout}
              >

                <LogOut size={16} />

                <span>
                  Logout
                </span>

              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default Topbar;