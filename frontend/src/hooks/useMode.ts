// src/hooks/useMode.ts

import { useContext } from "react";
import { ModeContext } from "../context/ModeContext";
import type { ModeContextValue } from "../context/ModeContext";

export function useMode(): ModeContextValue {
  const context = useContext(ModeContext);
  if (context === null) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
