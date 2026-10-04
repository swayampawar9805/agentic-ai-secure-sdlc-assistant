import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";

function PlaceholderPage({ title }) {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{title}</h1>
        <p>This module will be implemented in a later milestone.</p>
      </div>

      <div className="card placeholder-card">
        <h3>{title}</h3>
        <p>Coming soon...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<AppLayout />}>

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/projects"
            element={<PlaceholderPage title="My Projects" />}
          />

          <Route
            path="/projects/new"
            element={<PlaceholderPage title="Create New Project" />}
          />

          <Route
            path="/scans"
            element={<PlaceholderPage title="Security Scans" />}
          />

          <Route
            path="/vulnerabilities"
            element={<PlaceholderPage title="Vulnerabilities" />}
          />

          <Route
            path="/threat-modeling"
            element={<PlaceholderPage title="Threat Modeling" />}
          />

          <Route
            path="/agents"
            element={<PlaceholderPage title="AI Agents" />}
          />

          <Route
            path="/reports"
            element={<PlaceholderPage title="Security Reports" />}
          />

          <Route
            path="/history"
            element={<PlaceholderPage title="Scan History" />}
          />

          <Route
            path="/settings"
            element={<PlaceholderPage title="Settings" />}
          />

          <Route
            path="/profile"
            element={<PlaceholderPage title="Profile" />}
          />

        </Route>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;