import { create } from "zustand";

interface TwoFactorStore {
 totpURI: string | null;
 backupCodes: string[];
 setSetupData: (data: { totpURI: string; backupCodes: string[] }) => void;
 reset: () => void;
}

export const useTwoFactorStore = create<TwoFactorStore>((set) => ({
 totpURI: null,
 backupCodes: [],
 setSetupData: (data) => set(data),
 reset: () => set({ totpURI: null, backupCodes: [] }),
}));
