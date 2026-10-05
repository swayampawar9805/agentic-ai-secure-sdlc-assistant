import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./styles/global.css";
import "./styles/layout.css";
import "./styles/dashboard.css";
import "./styles/projects.css";
import "./styles/scans.css";
import "./styles/vulnerabilities.css";
import "./styles/threats.css";
import "./styles/agents.css";
import "./styles/reports.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);