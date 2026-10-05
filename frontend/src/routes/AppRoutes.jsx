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
import AIAgents from "../pages/AIAgents";
import AgentExecution from "../pages/AgentExecution";
import SecurityReports from "../pages/SecurityReports";
import ReportDetails from "../pages/ReportDetails";

import { AgentProvider } from "../context/AgentContext";

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
            <AgentProvider>
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

              <Route
                path="/agents"
                element={<AIAgents />}
              />

              <Route
                path="/agents/executions/:id"
                element={<AgentExecution />}
              />

              <Route
                path="/reports"
                element={<SecurityReports />}
              />

              <Route
                path="/reports/:id"
                element={<ReportDetails />}
              />

              {/* Retain all your other existing routes */}

            </Route>

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />

            </Routes>
          </BrowserRouter>
            </AgentProvider>
        </ThreatProvider>
        </VulnerabilityProvider>
      </ScanProvider>
    </ProjectProvider>
  );
}

export default AppRoutes;