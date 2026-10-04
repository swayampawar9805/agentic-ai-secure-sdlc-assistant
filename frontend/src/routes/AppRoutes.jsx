import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import NewProject from "../pages/NewProject";
import ProjectDetails from "../pages/ProjectDetails";

import { ProjectProvider } from "../context/ProjectContext";

function AppRoutes() {
  return (
    <ProjectProvider>
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
              element={<Projects />}
            />

            <Route
              path="/projects/new"
              element={<NewProject />}
            />

            <Route
              path="/projects/:id"
              element={<ProjectDetails />}
            />

            {/* Keep your remaining placeholder routes here */}

          </Route>

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />

        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  );
}

export default AppRoutes;