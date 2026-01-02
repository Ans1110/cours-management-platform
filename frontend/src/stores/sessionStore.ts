import { create } from "zustand";

interface SessionState {
  expiresAt: number | null;
  showExpiryModal: boolean;
  isExtending: boolean;

  // Actions
  setExpiresAt: (expiresAt: number) => void;
  setShowExpiryModal: (show: boolean) => void;
  setIsExtending: (extending: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  expiresAt: null,
  showExpiryModal: false,
  isExtending: false,

  setExpiresAt: (expiresAt: number) => {
    set({ expiresAt });
  },

  setShowExpiryModal: (show: boolean) => {
    set({ showExpiryModal: show });
  },

  setIsExtending: (extending: boolean) => {
    set({ isExtending: extending });
  },

  clearSession: () => {
    set({ expiresAt: null, showExpiryModal: false, isExtending: false });
  },
}));

export default useSessionStore;
