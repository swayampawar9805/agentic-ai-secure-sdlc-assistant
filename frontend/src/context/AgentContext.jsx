import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  initialAgents,
  initialExecutions,
} from "../data/mockAgents";

const AgentContext = createContext(null);

export function AgentProvider({ children }) {
  const [agents] = useState(() => {
    try {
      const saved = localStorage.getItem("secureguard_agents");

      return saved ? JSON.parse(saved) : initialAgents;
    } catch {
      return initialAgents;
    }
  });

  const [executions, setExecutions] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "secureguard_agent_executions"
      );

      return saved
        ? JSON.parse(saved)
        : initialExecutions;
    } catch {
      return initialExecutions;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "secureguard_agents",
      JSON.stringify(agents)
    );
  }, [agents]);

  useEffect(() => {
    localStorage.setItem(
      "secureguard_agent_executions",
      JSON.stringify(executions)
    );
  }, [executions]);

  const getAgent = (id) => {
    return agents.find((agent) => agent.id === id);
  };

  const getExecution = (id) => {
    return executions.find(
      (execution) => execution.id === id
    );
  };

  const updateExecutionStatus = (id, status) => {
    setExecutions((previous) =>
      previous.map((execution) =>
        execution.id === id
          ? {
              ...execution,
              status,
            }
          : execution
      )
    );
  };

  return (
    <AgentContext.Provider
      value={{
        agents,
        executions,
        getAgent,
        getExecution,
        updateExecutionStatus,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents() {
  const context = useContext(AgentContext);

  if (!context) {
    throw new Error(
      "useAgents must be used inside AgentProvider"
    );
  }

  return context;
}