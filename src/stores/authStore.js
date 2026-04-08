import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),

  clear: () => set({
    user: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}));
