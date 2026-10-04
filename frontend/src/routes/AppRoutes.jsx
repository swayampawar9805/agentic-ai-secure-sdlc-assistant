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
import Scans from "../pages/Scans";
import NewScan from "../pages/NewScan";
import ScanDetails from "../pages/ScanDetails";
import Vulnerabilities from "../pages/Vulnerabilities";
import VulnerabilityDetails from "../pages/VulnerabilityDetails";
import ThreatModeling from "../pages/ThreatModeling";
import ThreatDetails from "../pages/ThreatDetails";

import { ThreatProvider } from "../context/ThreatContext";

import {
  VulnerabilityProvider,
} from "../context/VulnerabilityContext";

import { ScanProvider } from "../context/ScanContext";

import { ProjectProvider } from "../context/ProjectContext";

function AppRoutes() {
  return (
    <ProjectProvider>
      <ScanProvider>
        <VulnerabilityProvider>
          <ThreatProvider>
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

              <Route
                path="/scans"
                element={<Scans />}
              />

              <Route
                path="/scans/new"
                element={<NewScan />}
              />

              <Route
                path="/scans/:id"
                element={<ScanDetails />}
              />

              <Route
                path="/vulnerabilities"
                element={<Vulnerabilities />}
              />

              <Route
                path="/vulnerabilities/:id"
                element={<VulnerabilityDetails />}
              />

              <Route
                path="/threats"
                element={<ThreatModeling />}
              />

              <Route
                path="/threats/:id"
                element={<ThreatDetails />}
              />

              {/* Retain all your other existing routes */}

            </Route>

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />

            </Routes>
          </BrowserRouter>
        </ThreatProvider>
        </VulnerabilityProvider>
      </ScanProvider>
    </ProjectProvider>
  );
}

export default AppRoutes;