// src/context/ModeContext.tsx

import React, { createContext, useState } from "react";
import type { AppMode } from "../types/alert";

export interface ModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const ModeContext = createContext<ModeContextValue | null>(null);

interface ModeProviderProps {
  children: React.ReactNode;
}

export function ModeProvider({ children }: ModeProviderProps) {
  const [mode, setMode] = useState<AppMode>("live");

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}
