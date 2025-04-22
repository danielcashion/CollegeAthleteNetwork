import { create } from "zustand";

interface UserSessionProps {
  session: any | null;
  setSession: (list: any | null) => void;
}

export const useUserSessionStore = create<UserSessionProps>()((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));
