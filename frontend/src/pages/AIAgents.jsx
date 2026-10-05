import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  FileSearch,
  Package,
  Play,
  Server,
  ShieldAlert,
  TestTube,
  Wrench,
  Workflow,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAgents } from "../context/AgentContext";

const iconMap = {
  workflow: Workflow,
  "file-search": FileSearch,
  "shield-alert": ShieldAlert,
  code: Code2,
  "test-tube": TestTube,
  wrench: Wrench,
  package: Package,
  server: Server,
};

function AIAgents() {
  const {
    agents,
    executions,
  } = useAgents();

  const onlineAgents = agents.filter(
    (agent) => agent.status === "Online"
  ).length;

  const runningExecutions = executions.filter(
    (execution) => execution.status === "Running"
  ).length;

  const approvalExecutions = executions.filter(
    (execution) =>
      execution.status === "Waiting Approval"
  ).length;

  const completedExecutions = executions.filter(
    (execution) =>
      execution.status === "Completed"
  ).length;

  return (
    <div className="page-container agents-page">

      <div className="agents-page-heading">

        <div className="page-header">
          <h1>AI Agent Control Center</h1>

          <p>
            Monitor, inspect, and manage the multi-agent
            security analysis system.
          </p>
        </div>

        <div className="agent-system-status">
          <span className="status-dot" />
          Agent System Operational
        </div>

      </div>

      {/* Statistics */}

      <div className="agent-stats">

        <div className="card agent-stat">
          <div className="agent-stat-icon purple">
            <BrainCircuit size={18} />
          </div>

          <span>Active Agents</span>

          <h2>{onlineAgents}</h2>

          <small>
            All registered agents online
          </small>
        </div>

        <div className="card agent-stat">
          <div className="agent-stat-icon blue">
            <Activity size={18} />
          </div>

          <span>Running Tasks</span>

          <h2>{runningExecutions}</h2>

          <small>
            Currently executing
          </small>
        </div>

        <div className="card agent-stat">
          <div className="agent-stat-icon orange">
            <Clock3 size={18} />
          </div>

          <span>Awaiting Approval</span>

          <h2>{approvalExecutions}</h2>

          <small>
            Human action required
          </small>
        </div>

        <div className="card agent-stat">
          <div className="agent-stat-icon green">
            <CheckCircle2 size={18} />
          </div>

          <span>Completed</span>

          <h2>{completedExecutions}</h2>

          <small>
            Successful executions
          </small>
        </div>

      </div>

      {/* Architecture */}

      <div className="card agent-architecture">

        <div className="agent-section-heading">

          <div>
            <h3>Agent Architecture</h3>

            <p>
              Specialized agents coordinated by the
              Agent Supervisor.
            </p>
          </div>

          <Workflow size={19} />

        </div>

        <div className="agent-architecture-flow">

          <div className="supervisor-node">

            <BrainCircuit size={22} />

            <strong>Agent Supervisor</strong>

            <span>
              Planning • Memory • Routing
            </span>

          </div>

          <div className="architecture-line" />

          <div className="agent-node-grid">

            {agents
              .filter(
                (agent) =>
                  agent.type !== "Orchestrator"
              )
              .map((agent) => {

                const Icon =
                  iconMap[agent.icon] ||
                  BrainCircuit;

                return (
                  <div
                    className="architecture-agent-node"
                    key={agent.id}
                  >
                    <Icon size={17} />

                    <div>
                      <strong>
                        {agent.shortName}
                      </strong>

                      <span>
                        {agent.type}
                      </span>
                    </div>

                    <i className="online-dot" />
                  </div>
                );
              })}

          </div>

        </div>

      </div>

      {/* Agent cards */}

      <div className="agents-section">

        <div className="agent-section-heading">

          <div>
            <h3>Registered Agents</h3>

            <p>
              Specialized security agents available
              to the orchestration system.
            </p>
          </div>

        </div>

        <div className="agent-card-grid">

          {agents.map((agent) => {

            const Icon =
              iconMap[agent.icon] ||
              BrainCircuit;

            return (
              <div
                className="card agent-card"
                key={agent.id}
              >

                <div className="agent-card-top">

                  <div className="agent-icon">
                    <Icon size={19} />
                  </div>

                  <span className="agent-online">
                    <i />
                    {agent.status}
                  </span>

                </div>

                <div className="agent-card-title">

                  <h3>{agent.name}</h3>

                  <span>{agent.type}</span>

                </div>

                <p className="agent-description">
                  {agent.description}
                </p>

                <div className="agent-capabilities">

                  {agent.capabilities
                    .slice(0, 4)
                    .map((capability) => (
                      <span key={capability}>
                        {capability}
                      </span>
                    ))}

                </div>

                <div className="agent-card-footer">

                  <div>
                    <small>Model</small>
                    <strong>{agent.model}</strong>
                  </div>

                  <div>
                    <small>Framework</small>
                    <strong>{agent.framework}</strong>
                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Execution history */}

      <div className="card agent-executions">

        <div className="agent-section-heading">

          <div>
            <h3>Recent Agent Executions</h3>

            <p>
              Tasks performed by the agent system.
            </p>
          </div>

          <Play size={18} />

        </div>

        <div className="execution-table-wrapper">

          <table className="execution-table">

            <thead>

              <tr>
                <th>Execution</th>
                <th>Project</th>
                <th>Agent</th>
                <th>Task</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {executions.map((execution) => (

                <tr key={execution.id}>

                  <td>
                    <span className="execution-id">
                      {execution.id}
                    </span>
                  </td>

                  <td>
                    {execution.project}
                  </td>

                  <td>
                    <strong>
                      {execution.agent}
                    </strong>
                  </td>

                  <td>
                    {execution.task}
                  </td>

                  <td>

                    <span
                      className={`execution-status ${execution.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      <i />
                      {execution.status}
                    </span>

                  </td>

                  <td>
                    {execution.duration}
                  </td>

                  <td>

                    <Link
                      to={`/agents/executions/${execution.id}`}
                      className="execution-view"
                    >
                      View
                    </Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AIAgents;