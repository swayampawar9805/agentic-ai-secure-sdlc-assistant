import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  FileSearch,
  GitBranch,
  ShieldAlert,
  Wrench,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

import { useAgents } from "../context/AgentContext";

function AgentExecution() {
  const { id } = useParams();

  const {
    getExecution,
  } = useAgents();

  const execution = getExecution(id);

  if (!execution) {
    return (
      <div className="page-container">

        <Link
          to="/agents"
          className="agent-back-link"
        >
          <ArrowLeft size={16} />
          Back to AI Agents
        </Link>

        <div className="card agent-empty">
          Execution not found.
        </div>

      </div>
    );
  }

  const steps = [
    {
      number: 1,
      title: "Task Received",
      description:
        "Agent Supervisor received the security analysis request.",
      icon: BrainCircuit,
      status: "completed",
    },
    {
      number: 2,
      title: "Goal Planning",
      description:
        "The supervisor decomposed the task into specialized security analysis operations.",
      icon: GitBranch,
      status: "completed",
    },
    {
      number: 3,
      title: "Agent Routing",
      description:
        "The task was routed to the appropriate specialized security agent.",
      icon: ShieldAlert,
      status: "completed",
    },
    {
      number: 4,
      title: "Security Analysis",
      description:
        execution.output,
      icon: FileSearch,
      status:
        execution.status === "Running"
          ? "running"
          : "completed",
    },
    {
      number: 5,
      title: "Result Processing",
      description:
        "Analysis results are validated and prepared for the next stage.",
      icon: Code2,
      status:
        execution.status === "Completed"
          ? "completed"
          : "pending",
    },
    {
      number: 6,
      title: "Human Approval",
      description:
        "Developer reviews the generated recommendations before security-sensitive changes are applied.",
      icon: Wrench,
      status:
        execution.status === "Waiting Approval"
          ? "approval"
          : "pending",
    },
  ];

  return (
    <div className="page-container execution-page">

      <Link
        to="/agents"
        className="agent-back-link"
      >
        <ArrowLeft size={16} />
        Back to AI Agents
      </Link>

      <div className="execution-heading">

        <div>

          <span className="execution-id-label">
            {execution.id}
          </span>

          <h1>{execution.task}</h1>

          <p>
            {execution.project} •{" "}
            {execution.agent}
          </p>

        </div>

        <span
          className={`execution-status large ${execution.status
            .toLowerCase()
            .replace(" ", "-")}`}
        >
          <i />
          {execution.status}
        </span>

      </div>

      <div className="execution-overview">

        <div className="card execution-overview-card">

          <Clock3 size={17} />

          <span>Started</span>

          <strong>
            {execution.startedAt}
          </strong>

        </div>

        <div className="card execution-overview-card">

          <GitBranch size={17} />

          <span>Steps</span>

          <strong>
            {execution.steps}
          </strong>

        </div>

        <div className="card execution-overview-card">

          <BrainCircuit size={17} />

          <span>Agent</span>

          <strong>
            {execution.agent}
          </strong>

        </div>

        <div className="card execution-overview-card">

          <CheckCircle2 size={17} />

          <span>Duration</span>

          <strong>
            {execution.duration}
          </strong>

        </div>

      </div>

      <div className="execution-grid">

        <div className="card execution-timeline">

          <div className="agent-section-heading">

            <div>
              <h3>Execution Timeline</h3>

              <p>
                Agent workflow and execution state.
              </p>
            </div>

          </div>

          <div className="execution-steps">

            {steps.map((step) => {

              const Icon = step.icon;

              return (
                <div
                  className={`execution-step ${step.status}`}
                  key={step.number}
                >

                  <div className="execution-step-marker">

                    {step.status === "completed" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Icon size={16} />
                    )}

                  </div>

                  <div className="execution-step-content">

                    <div className="execution-step-heading">

                      <strong>
                        {step.title}
                      </strong>

                      <span>
                        Step {step.number}
                      </span>

                    </div>

                    <p>
                      {step.description}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        <aside className="execution-sidebar">

          <div className="card execution-output">

            <h3>Agent Output</h3>

            <div className="agent-output-box">
              {execution.output}
            </div>

          </div>

          <div className="card execution-approval">

            <div className="approval-icon">
              <ShieldAlert size={19} />
            </div>

            <h3>Human-in-the-Loop</h3>

            <p>
              Security-sensitive changes must be reviewed
              and approved by a developer before they can
              be applied.
            </p>

            {execution.status === "Waiting Approval" && (
              <div className="approval-actions">

                <button className="approval-review">
                  Review Changes
                </button>

                <button className="approval-reject">
                  Reject
                </button>

              </div>
            )}

          </div>

        </aside>

      </div>

    </div>
  );
}

export default AgentExecution;