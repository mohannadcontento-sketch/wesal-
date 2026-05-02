import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeTab: string;
  authModalOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setAuthModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeTab: 'shares',
  authModalOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
}));
