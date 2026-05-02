import { create } from 'zustand';

interface AuthState {
  user: {
    userId: string;
    email: string;
    role: string;
    username?: string;
    realName: string;
    badge: string;
    reputationScore: number;
    specialty?: string;
  } | null;
  loading: boolean;
  setUser: (user: AuthState['user']) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, loading: false }),
}));
