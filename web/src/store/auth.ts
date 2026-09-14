import { create } from "zustand";
import { api, setToken, getToken } from "../api/client";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  ready: boolean; // true once we've attempted to restore the session
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,

  async login(email, password) {
    const { token, user } = await api.login({ email, password });
    setToken(token);
    set({ user });
  },

  async register(name, email, password) {
    const { token, user } = await api.register({ name, email, password });
    setToken(token);
    set({ user });
  },

  logout() {
    setToken(null);
    set({ user: null });
  },

  async hydrate() {
    if (!getToken()) {
      set({ ready: true });
      return;
    }
    try {
      const { user } = await api.me();
      set({ user, ready: true });
    } catch {
      setToken(null);
      set({ user: null, ready: true });
    }
  },
}));
