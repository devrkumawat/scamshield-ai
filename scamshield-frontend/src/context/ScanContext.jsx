import { createContext, useCallback, useContext, useState, useMemo } from 'react';

const ScanCtx = createContext(null);

export function ScanProvider({ children }) {
  const [lastResult, setLastResult] = useState(null);
  const [scans, setScans] = useState([]);

  const addScan = useCallback((scan) => {
    // Keep only the 50 most recent scans in memory
    setScans((prev) => [scan, ...prev].slice(0, 50));
  }, []);

  const setScansFromServer = useCallback((serverScans) => {
    setScans(Array.isArray(serverScans) ? serverScans : []);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders 
  // of consuming components when the provider re-renders.
  const value = useMemo(
    () => ({
      lastResult,
      setLastResult,
      scans,
      addScan,
      setScansFromServer,
    }),
    [lastResult, scans, addScan, setScansFromServer]
  );

  return (
    <ScanCtx.Provider value={value}>
      {children}
    </ScanCtx.Provider>
  );
}

export function useScan() {
  const ctx = useContext(ScanCtx);
  
  if (!ctx) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  
  return ctx;
}