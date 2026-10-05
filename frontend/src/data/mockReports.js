export const initialReports = [
  {
    id: "RPT-001",

    project: "Healthcare Management System",

    generatedAt: "2026-10-05 10:38 AM",

    lastScan: "2026-10-05 10:32 AM",

    securityScore: 78,

    riskLevel: "Medium",

    summary:
      "The application demonstrates a moderate security posture. Several high-priority vulnerabilities require remediation before production deployment.",

    statistics: {
      critical: 2,
      high: 5,
      medium: 9,
      low: 4,
      fixed: 7,
      open: 13,
    },

    analysis: [
      {
        name: "Requirements Analysis",
        status: "Completed",
        findings: 7,
      },

      {
        name: "Threat Modeling",
        status: "Completed",
        findings: 6,
      },

      {
        name: "Static Code Analysis",
        status: "Completed",
        findings: 11,
      },

      {
        name: "Dependency Analysis",
        status: "Completed",
        findings: 4,
      },

      {
        name: "Security Testing",
        status: "Completed",
        findings: 8,
      },

      {
        name: "Deployment Verification",
        status: "Warning",
        findings: 3,
      },
    ],

    findings: [
      {
        id: "VUL-001",
        title: "SQL Injection",
        severity: "Critical",
        category: "Injection",
        component: "Patient Search API",
        status: "Open",
        source: "Code Review Agent",
      },

      {
        id: "VUL-002",
        title: "Broken Access Control",
        severity: "Critical",
        category: "Authorization",
        component: "Admin API",
        status: "Open",
        source: "Code Review Agent",
      },

      {
        id: "VUL-003",
        title: "Missing Authorization Check",
        severity: "High",
        category: "Access Control",
        component: "Patient Records",
        status: "Open",
        source: "Threat Modeling Agent",
      },

      {
        id: "VUL-004",
        title: "Weak Password Policy",
        severity: "High",
        category: "Authentication",
        component: "User Registration",
        status: "Open",
        source: "Requirements Agent",
      },

      {
        id: "VUL-005",
        title: "Outdated Dependency",
        severity: "High",
        category: "Dependency",
        component: "Django Package",
        status: "Fixed",
        source: "Dependency Agent",
      },

      {
        id: "VUL-006",
        title: "Missing Security Headers",
        severity: "Medium",
        category: "Configuration",
        component: "Web Server",
        status: "Open",
        source: "Deployment Agent",
      },

      {
        id: "VUL-007",
        title: "Insufficient Input Validation",
        severity: "Medium",
        category: "Validation",
        component: "Appointment API",
        status: "Open",
        source: "Code Review Agent",
      },

      {
        id: "VUL-008",
        title: "Verbose Error Messages",
        severity: "Low",
        category: "Information Disclosure",
        component: "Authentication API",
        status: "Fixed",
        source: "Remediation Agent",
      },
    ],

    recommendations: [
      "Implement parameterized queries for all database operations.",
      "Strengthen role-based authorization checks for sensitive endpoints.",
      "Update vulnerable third-party dependencies.",
      "Configure recommended HTTP security headers.",
      "Add security-focused automated tests for authentication and authorization.",
    ],
  },

  {
    id: "RPT-002",

    project: "NexusHR",

    generatedAt: "2026-10-04 04:22 PM",

    lastScan: "2026-10-04 04:10 PM",

    securityScore: 91,

    riskLevel: "Low",

    summary:
      "The application demonstrates a strong security posture with only a small number of low-priority findings remaining.",

    statistics: {
      critical: 0,
      high: 1,
      medium: 3,
      low: 5,
      fixed: 12,
      open: 4,
    },

    analysis: [
      {
        name: "Requirements Analysis",
        status: "Completed",
        findings: 3,
      },

      {
        name: "Threat Modeling",
        status: "Completed",
        findings: 4,
      },

      {
        name: "Static Code Analysis",
        status: "Completed",
        findings: 5,
      },

      {
        name: "Dependency Analysis",
        status: "Completed",
        findings: 2,
      },

      {
        name: "Security Testing",
        status: "Completed",
        findings: 3,
      },

      {
        name: "Deployment Verification",
        status: "Completed",
        findings: 1,
      },
    ],

    findings: [
      {
        id: "VUL-101",
        title: "Missing Rate Limiting",
        severity: "High",
        category: "Authentication",
        component: "Login API",
        status: "Open",
        source: "Security Testing Agent",
      },

      {
        id: "VUL-102",
        title: "Missing Security Header",
        severity: "Medium",
        category: "Configuration",
        component: "API Gateway",
        status: "Open",
        source: "Deployment Agent",
      },

      {
        id: "VUL-103",
        title: "Verbose Logging",
        severity: "Low",
        category: "Information Disclosure",
        component: "Authentication Service",
        status: "Fixed",
        source: "Code Review Agent",
      },
    ],

    recommendations: [
      "Implement rate limiting for authentication endpoints.",
      "Add recommended security headers.",
      "Continue monitoring dependency vulnerabilities.",
    ],
  },
];

export const initialReportMetrics = {
  totalReports: 2,
  averageScore: 84,
  openFindings: 17,
  fixedFindings: 19,
};