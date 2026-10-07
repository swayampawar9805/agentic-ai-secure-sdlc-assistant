import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/ProtectedRoute"; // <-- FIXED: Added missing import

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
import Login from "../pages/Login/Login";
import Register from "../pages/Register";


import { AgentProvider } from "../context/AgentContext";
import { ThreatProvider } from "../context/ThreatContext";
import { VulnerabilityProvider } from "../context/VulnerabilityContext";
import { ScanProvider } from "../context/ScanContext";
import { ProjectProvider } from "../context/ProjectContext";
import { FindingProvider } from "../context/FindingContext";

function AppRoutes() {
  return (
    <ProjectProvider>
      <ScanProvider>
        <VulnerabilityProvider>
          <ThreatProvider>
            <AgentProvider>
              <FindingProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Public route outside AppLayout */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                  {/* Protected layout routes */}
                  <Route element={<AppLayout />}>
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />

                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/projects"
                      element={
                        <ProtectedRoute>
                          <Projects />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/projects/new"
                      element={
                        <ProtectedRoute>
                          <NewProject />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/projects/:id"
                      element={
                        <ProtectedRoute>
                          <ProjectDetails />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/scans"
                      element={
                        <ProtectedRoute>
                          <Scans />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/scans/new"
                      element={
                        <ProtectedRoute>
                          <NewScan />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/scans/:id"
                      element={
                        <ProtectedRoute>
                          <ScanDetails />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/vulnerabilities"
                      element={
                        <ProtectedRoute>
                          <Vulnerabilities />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/vulnerabilities/:id"
                      element={
                        <ProtectedRoute>
                          <VulnerabilityDetails />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/threats"
                      element={
                        <ProtectedRoute>
                          <ThreatModeling />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/threats/:id"
                      element={
                        <ProtectedRoute>
                          <ThreatDetails />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/agents"
                      element={
                        <ProtectedRoute>
                          <AIAgents />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/agents/executions/:id"
                      element={
                        <ProtectedRoute>
                          <AgentExecution />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/reports"
                      element={
                        <ProtectedRoute>
                          <SecurityReports />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/reports/:id"
                      element={
                        <ProtectedRoute>
                          <ReportDetails />
                        </ProtectedRoute>
                      }
                    />
                  </Route>


                  {/* Fallback Catch-all Route */}
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </BrowserRouter>
              </FindingProvider>
            </AgentProvider>
          </ThreatProvider>
        </VulnerabilityProvider>
      </ScanProvider>
    </ProjectProvider>
  );
}

export default AppRoutes;