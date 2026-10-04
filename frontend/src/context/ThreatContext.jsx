import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { initialThreats } from "../data/mockThreats";

const ThreatContext = createContext(null);

export function ThreatProvider({ children }) {
  const [threats, setThreats] = useState(() => {
    try {
      const saved = localStorage.getItem("secureguard_threats");

      return saved ? JSON.parse(saved) : initialThreats;
    } catch {
      return initialThreats;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "secureguard_threats",
      JSON.stringify(threats)
    );
  }, [threats]);

  const getThreat = (id) =>
    threats.find((threat) => threat.id === id);

  const updateThreatStatus = (id, status) => {
    setThreats((previous) =>
      previous.map((threat) =>
        threat.id === id
          ? { ...threat, status }
          : threat
      )
    );
  };

  const updateMitigation = (id, mitigation) => {
    setThreats((previous) =>
      previous.map((threat) =>
        threat.id === id
          ? { ...threat, mitigation }
          : threat
      )
    );
  };

  const addThreat = (threat) => {
    setThreats((previous) => [
      {
        ...threat,
        id: `THR-${String(previous.length + 1).padStart(3, "0")}`,
        discoveredAt: new Date().toISOString().slice(0, 10),
      },
      ...previous,
    ]);
  };

  return (
    <ThreatContext.Provider
      value={{
        threats,
        getThreat,
        updateThreatStatus,
        updateMitigation,
        addThreat,
      }}
    >
      {children}
    </ThreatContext.Provider>
  );
}

export function useThreats() {
  const context = useContext(ThreatContext);

  if (!context) {
    throw new Error(
      "useThreats must be used inside ThreatProvider"
    );
  }

  return context;
}