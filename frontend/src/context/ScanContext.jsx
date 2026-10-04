import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { initialScans } from "../data/mockScans";

const ScanContext = createContext(null);

export function ScanProvider({ children }) {
  const [scans, setScans] = useState(() => {
    try {
      const saved = localStorage.getItem("secureguard_scans");

      return saved ? JSON.parse(saved) : initialScans;
    } catch {
      return initialScans;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "secureguard_scans",
      JSON.stringify(scans)
    );
  }, [scans]);

  const addScan = (scanData) => {
    const newScan = {
      ...scanData,
      id: `SCN-${Date.now()}`,
      status: "Queued",
      progress: 0,
      startedAt: new Date().toISOString(),
      duration: "—",
      findings: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
    };

    setScans((previous) => [newScan, ...previous]);

    return newScan;
  };

  const getScan = (id) => {
    return scans.find((scan) => scan.id === id);
  };

  return (
    <ScanContext.Provider
      value={{
        scans,
        addScan,
        getScan,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScans() {
  const context = useContext(ScanContext);

  if (!context) {
    throw new Error(
      "useScans must be used inside ScanProvider"
    );
  }

  return context;
}