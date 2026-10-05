export const initialAgents = [
  {
    id: "agent-supervisor",
    name: "Agent Supervisor",
    shortName: "Supervisor",
    type: "Orchestrator",
    description:
      "Coordinates the security analysis workflow, plans tasks, routes work to specialized agents, and maintains execution state.",
    status: "Online",
    model: "Llama 3",
    framework: "LangGraph",
    capabilities: [
      "Goal Planning",
      "Agent Routing",
      "Task Management",
      "Memory",
      "Human Approval",
    ],
    icon: "workflow",
  },

  {
    id: "requirements-agent",
    name: "Requirements Analysis Agent",
    shortName: "Requirements",
    type: "Analysis",
    description:
      "Analyzes software requirements and identifies security requirements, risks, assets, trust boundaries, and potential attack surfaces.",
    status: "Online",
    model: "Llama 3",
    framework: "LangGraph",
    capabilities: [
      "Requirement Analysis",
      "Security Requirement Extraction",
      "Risk Identification",
      "Asset Identification",
    ],
    icon: "file-search",
  },

  {
    id: "threat-agent",
    name: "Threat Modeling Agent",
    shortName: "Threat Modeling",
    type: "Security Analysis",
    description:
      "Generates threat scenarios from requirements and architecture using STRIDE-based threat modeling.",
    status: "Online",
    model: "Llama 3",
    framework: "LangGraph",
    capabilities: [
      "STRIDE Analysis",
      "Attack Scenario Generation",
      "Risk Assessment",
      "Mitigation Recommendations",
    ],
    icon: "shield-alert",
  },

  {
    id: "code-review-agent",
    name: "Secure Code Review Agent",
    shortName: "Code Review",
    type: "Code Security",
    description:
      "Reviews source code and combines static analysis results with contextual AI reasoning to identify security issues.",
    status: "Online",
    model: "Llama 3",
    framework: "LangGraph",
    capabilities: [
      "Code Analysis",
      "Security Review",
      "Vulnerability Detection",
      "Secure Coding Suggestions",
    ],
    icon: "code",
  },

  {
    id: "testing-agent",
    name: "Security Testing Agent",
    shortName: "Security Testing",
    type: "Testing",
    description:
      "Generates security-focused test cases based on identified risks and vulnerabilities.",
    status: "Online",
    model: "Llama 3",
    framework: "LangGraph",
    capabilities: [
      "Security Test Generation",
      "Test Prioritization",
      "Attack Simulation",
      "Validation",
    ],
    icon: "test-tube",
  },

  {
    id: "remediation-agent",
    name: "Remediation Agent",
    shortName: "Remediation",
    type: "Remediation",
    description:
      "Analyzes security findings and proposes secure fixes while keeping developers in control of changes.",
    status: "Online",
    model: "Llama 3",
    framework: "LangGraph",
    capabilities: [
      "Root Cause Analysis",
      "Fix Suggestions",
      "Patch Generation",
      "Human Approval",
    ],
    icon: "wrench",
  },

  {
    id: "dependency-agent",
    name: "Dependency Analysis Agent",
    shortName: "Dependencies",
    type: "Dependency Security",
    description:
      "Analyzes third-party dependencies and identifies known security vulnerabilities.",
    status: "Online",
    model: "Security Tools",
    framework: "OWASP Dependency-Check",
    capabilities: [
      "Dependency Scanning",
      "CVE Detection",
      "Version Analysis",
      "Upgrade Recommendations",
    ],
    icon: "package",
  },

  {
    id: "deployment-agent",
    name: "Deployment Security Agent",
    shortName: "Deployment",
    type: "Deployment Security",
    description:
      "Validates deployment configurations and checks whether security controls are correctly configured.",
    status: "Online",
    model: "Llama 3",
    framework: "LangGraph",
    capabilities: [
      "Configuration Analysis",
      "Deployment Validation",
      "Security Checklist",
      "Misconfiguration Detection",
    ],
    icon: "server",
  },
];

export const initialExecutions = [
  {
    id: "EXEC-001",
    project: "Healthcare Management System",
    agent: "Agent Supervisor",
    task: "Complete security analysis",
    status: "Completed",
    startedAt: "10:32:11",
    duration: "2m 41s",
    steps: 14,
    output: "Security analysis completed successfully.",
  },

  {
    id: "EXEC-002",
    project: "Healthcare Management System",
    agent: "Requirements Analysis Agent",
    task: "Analyze application requirements",
    status: "Completed",
    startedAt: "10:33:02",
    duration: "41s",
    steps: 5,
    output: "7 security requirements identified.",
  },

  {
    id: "EXEC-003",
    project: "Healthcare Management System",
    agent: "Threat Modeling Agent",
    task: "Generate STRIDE threat model",
    status: "Completed",
    startedAt: "10:33:46",
    duration: "54s",
    steps: 7,
    output: "6 potential threats identified.",
  },

  {
    id: "EXEC-004",
    project: "NexusHR",
    agent: "Secure Code Review Agent",
    task: "Review authentication module",
    status: "Running",
    startedAt: "10:35:17",
    duration: "Running",
    steps: 4,
    output: "Analyzing authentication and authorization logic.",
  },

  {
    id: "EXEC-005",
    project: "E-Commerce Platform",
    agent: "Remediation Agent",
    task: "Generate remediation suggestions",
    status: "Waiting Approval",
    startedAt: "10:37:20",
    duration: "1m 12s",
    steps: 9,
    output: "3 remediation suggestions require developer approval.",
  },
];