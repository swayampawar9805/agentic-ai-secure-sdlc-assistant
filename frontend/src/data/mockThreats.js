export const initialThreats = [
  {
    id: "THR-001",
    projectId: "PRJ-001",
    projectName: "Healthcare Management System",

    title: "Unauthorized Patient Record Access",
    category: "Information Disclosure",
    stride: "Information Disclosure",

    severity: "Critical",
    likelihood: "High",
    impact: "Critical",
    riskScore: 9,

    asset: "Patient Database",
    entryPoint: "Patient Records API",
    trustBoundary: "External Client → Backend API",

    attackScenario:
      "An authenticated user manipulates patient identifiers in API requests to access medical records belonging to other patients.",

    impact:
      "Exposure of sensitive healthcare information, privacy violations, and potential regulatory consequences.",

    mitigation:
      "Implement object-level authorization, verify patient ownership on every request, and apply role-based access control.",

    status: "Identified",
    owner: "Security Team",

    discoveredAt: "2026-10-01",
  },

  {
    id: "THR-002",
    projectId: "PRJ-001",
    projectName: "Healthcare Management System",

    title: "Session Token Theft",
    category: "Spoofing",
    stride: "Spoofing",

    severity: "High",
    likelihood: "Medium",
    impact: "Critical",
    riskScore: 8,

    asset: "Authentication Service",
    entryPoint: "Login and Session API",
    trustBoundary: "Browser → Authentication Backend",

    attackScenario:
      "An attacker obtains a valid session token through an insecure client environment and attempts to impersonate a legitimate user.",

    impact:
      "Unauthorized access to user accounts and sensitive application functions.",

    mitigation:
      "Use secure session management, HTTPS, appropriate cookie flags, token expiration, and session revocation.",

    status: "Under Review",
    owner: "Backend Team",

    discoveredAt: "2026-10-01",
  },

  {
    id: "THR-003",
    projectId: "PRJ-001",
    projectName: "Healthcare Management System",

    title: "Unauthorized Medical Record Modification",
    category: "Tampering",
    stride: "Tampering",

    severity: "High",
    likelihood: "Medium",
    impact: "High",
    riskScore: 7,

    asset: "Medical Records",
    entryPoint: "Record Update API",
    trustBoundary: "Application Server → Database",

    attackScenario:
      "A user modifies request parameters to alter medical information without the required permissions.",

    impact:
      "Loss of medical record integrity and potentially harmful decisions based on altered information.",

    mitigation:
      "Enforce server-side authorization, validate input, maintain audit logs, and restrict database write permissions.",

    status: "Identified",
    owner: "Backend Team",

    discoveredAt: "2026-10-02",
  },

  {
    id: "THR-004",
    projectId: "PRJ-002",
    projectName: "NexusHR",

    title: "Privilege Escalation Through Role Manipulation",
    category: "Elevation of Privilege",
    stride: "Elevation of Privilege",

    severity: "Critical",
    likelihood: "Medium",
    impact: "Critical",
    riskScore: 9,

    asset: "Role-Based Access Control",
    entryPoint: "Employee Management API",
    trustBoundary: "Employee Portal → Authorization Layer",

    attackScenario:
      "An ordinary employee attempts to modify role-related request parameters to gain administrative functionality.",

    impact:
      "Unauthorized access to employee records, administrative operations, and sensitive organizational information.",

    mitigation:
      "Perform role checks exclusively on the server, enforce least privilege, and prevent users from modifying privileged attributes.",

    status: "Identified",
    owner: "Security Team",

    discoveredAt: "2026-10-02",
  },

  {
    id: "THR-005",
    projectId: "PRJ-003",
    projectName: "E-Commerce Platform",

    title: "Denial of Service Against Product API",
    category: "Denial of Service",
    stride: "Denial of Service",

    severity: "Medium",
    likelihood: "High",
    impact: "Medium",
    riskScore: 6,

    asset: "Product Catalog Service",
    entryPoint: "Search API",
    trustBoundary: "Internet → Application Server",

    attackScenario:
      "An attacker submits excessive search requests or computationally expensive queries, exhausting application resources.",

    impact:
      "Reduced application performance, service disruption, and inability of legitimate users to access product information.",

    mitigation:
      "Implement rate limiting, request validation, pagination limits, caching, and resource monitoring.",

    status: "Mitigated",
    owner: "DevOps Team",

    discoveredAt: "2026-10-03",
  },

  {
    id: "THR-006",
    projectId: "PRJ-003",
    projectName: "E-Commerce Platform",

    title: "Insufficient Audit Logging",
    category: "Repudiation",
    stride: "Repudiation",

    severity: "Medium",
    likelihood: "Medium",
    impact: "High",
    riskScore: 6,

    asset: "Transaction Management",
    entryPoint: "Order Processing API",
    trustBoundary: "Application Server → Audit Storage",

    attackScenario:
      "A user performs sensitive operations without sufficient audit records to establish accountability.",

    impact:
      "Difficulty investigating fraudulent transactions and reconstructing security incidents.",

    mitigation:
      "Maintain tamper-resistant audit logs containing actor identity, timestamps, operation details, and relevant event metadata.",

    status: "Identified",
    owner: "Backend Team",

    discoveredAt: "2026-10-03",
  },
];

export const threatCategories = [
  "Spoofing",
  "Tampering",
  "Repudiation",
  "Information Disclosure",
  "Denial of Service",
  "Elevation of Privilege",
];

export const threatStatuses = [
  "Identified",
  "Under Review",
  "Mitigated",
  "Accepted Risk",
];