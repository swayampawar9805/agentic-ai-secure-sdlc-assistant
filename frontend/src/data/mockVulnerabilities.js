export const initialVulnerabilities = [
  {
    id: "VUL-001",
    scanId: "SCN-001",
    projectId: "PRJ-001",
    projectName: "Healthcare Management System",

    title: "SQL Injection Vulnerability",
    severity: "Critical",
    category: "Injection",
    cwe: "CWE-89",
    owasp: "A03:2021 - Injection",

    file: "backend/patients/views.py",
    line: 84,

    description:
      "User-controlled input is incorporated into a SQL query without safe parameterization. An attacker may manipulate database queries and access or modify unauthorized records.",

    evidence:
      "cursor.execute(\"SELECT * FROM patients WHERE id = %s\" % patient_id)",

    recommendation:
      "Use parameterized queries or Django ORM filters instead of constructing SQL queries through string formatting.",

    secureCode:
      "patient = Patient.objects.filter(id=patient_id).first()",

    tool: "Semgrep",
    status: "Open",
    confidence: "High",

    discoveredAt: "2026-10-01T10:35:00",

    remediationStatus: "Not Requested",
    developerDecision: null,
  },

  {
    id: "VUL-002",
    scanId: "SCN-001",
    projectId: "PRJ-001",
    projectName: "Healthcare Management System",

    title: "Hardcoded Secret Detected",
    severity: "High",
    category: "Sensitive Data Exposure",
    cwe: "CWE-798",
    owasp: "A02:2021 - Cryptographic Failures",

    file: "backend/config/settings.py",
    line: 28,

    description:
      "A potentially sensitive credential is stored directly in the application source code. If committed to a repository, it may be exposed to unauthorized users.",

    evidence:
      "SECRET_KEY = 'django-insecure-example-key'",

    recommendation:
      "Load sensitive configuration from environment variables or a dedicated secrets manager. Rotate any credential that may have been exposed.",

    secureCode:
      "SECRET_KEY = os.environ['DJANGO_SECRET_KEY']",

    tool: "Secret Detection",
    status: "In Progress",
    confidence: "High",

    discoveredAt: "2026-10-01T10:38:00",

    remediationStatus: "Not Requested",
    developerDecision: null,
  },

  {
    id: "VUL-003",
    scanId: "SCN-001",
    projectId: "PRJ-001",
    projectName: "Healthcare Management System",

    title: "Missing Security Headers",
    severity: "Medium",
    category: "Security Misconfiguration",
    cwe: "CWE-693",
    owasp: "A05:2021 - Security Misconfiguration",

    file: "backend/config/settings.py",
    line: 112,

    description:
      "Some recommended HTTP security headers are not explicitly configured, potentially reducing browser-side security protections.",

    evidence:
      "SECURE_CONTENT_TYPE_NOSNIFF is not enabled.",

    recommendation:
      "Configure appropriate Django security settings and review the deployment's HTTP response headers.",

    secureCode:
      "SECURE_CONTENT_TYPE_NOSNIFF = True\nX_FRAME_OPTIONS = 'DENY'",

    tool: "Django Security Check",
    status: "Open",
    confidence: "Medium",

    discoveredAt: "2026-10-01T10:40:00",

    remediationStatus: "Not Requested",
    developerDecision: null,
  },

  {
    id: "VUL-004",
    scanId: "SCN-002",
    projectId: "PRJ-002",
    projectName: "NexusHR",

    title: "Insufficient Password Policy",
    severity: "High",
    category: "Authentication",
    cwe: "CWE-521",
    owasp: "A07:2021 - Identification and Authentication Failures",

    file: "src/main/java/com/nexushr/config/SecurityConfig.java",
    line: 67,

    description:
      "The application's password policy may permit weak credentials, increasing the risk of account compromise.",

    evidence:
      "No explicit password complexity or length policy detected.",

    recommendation:
      "Establish an appropriate password policy, enforce rate limiting, and use a secure password hashing mechanism.",

    secureCode:
      "Use a validated password policy and BCryptPasswordEncoder for password hashing.",

    tool: "CodeQL",
    status: "Open",
    confidence: "Medium",

    discoveredAt: "2026-10-02T14:20:00",

    remediationStatus: "Not Requested",
    developerDecision: null,
  },

  {
    id: "VUL-005",
    scanId: "SCN-003",
    projectId: "PRJ-003",
    projectName: "E-Commerce Platform",

    title: "Vulnerable Dependency Version",
    severity: "Critical",
    category: "Vulnerable Components",
    cwe: "CWE-1104",
    owasp: "A06:2021 - Vulnerable and Outdated Components",

    file: "package-lock.json",
    line: 1,

    description:
      "A dependency may contain a publicly documented security vulnerability. The affected package and version must be verified against authoritative vulnerability information.",

    evidence:
      "Dependency version flagged during the demonstration assessment.",

    recommendation:
      "Verify the affected package and upgrade to a patched compatible version. Run regression tests after updating.",

    secureCode:
      "Update the affected package to a verified patched version.",

    tool: "OWASP Dependency-Check",
    status: "Open",
    confidence: "High",

    discoveredAt: "2026-10-03T09:25:00",

    remediationStatus: "Not Requested",
    developerDecision: null,
  },
];