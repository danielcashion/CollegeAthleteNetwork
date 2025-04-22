import { create } from "zustand";

interface AppStore {
  userIp: string | null;
  setUserIp: (ip: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  userIp: null,

  setUserIp: (userIp) => set({ userIp }),
}));
