"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface TwoFactorContextType {
 totpURI: string | null;
 backupCodes: string[];
 setSetupData: (data: { totpURI: string; backupCodes: string[] }) => void;
 reset: () => void;
}

const TwoFactorContext = createContext<TwoFactorContextType | undefined>(
 undefined
);

export function TwoFactorProvider({ children }: { children: ReactNode }) {
 const [totpURI, setTotpURI] = useState<string | null>(null);
 const [backupCodes, setBackupCodes] = useState<string[]>([]);

 const setSetupData = (data: { totpURI: string; backupCodes: string[] }) => {
  setTotpURI(data.totpURI);
  setBackupCodes(data.backupCodes);
 };

 const reset = () => {
  setTotpURI(null);
  setBackupCodes([]);
 };

 return (
  <TwoFactorContext.Provider
   value={{ totpURI, backupCodes, setSetupData, reset }}>
   {children}
  </TwoFactorContext.Provider>
 );
}

export function useTwoFactor() {
 const context = useContext(TwoFactorContext);
 if (context === undefined) {
  throw new Error("useTwoFactor must be used within a TwoFactorProvider");
 }
 return context;
}
