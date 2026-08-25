"use client";

import { create } from "zustand";
import type { User } from "@tatalaku/shared";
import { api, setAccessToken } from "@/lib/api";
import type { LoginFormValues, RegisterFormValues } from "@/features/auth/auth.types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  login: (values: LoginFormValues) => Promise<void>;
  register: (values: RegisterFormValues) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),

  login: async (values) => {
    set({ isLoading: true });
    try {
      const res = await api.auth.login(values);
      setAccessToken(res.data.accessToken);
      set({ user: res.data.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (values) => {
    set({ isLoading: true });
    try {
      const res = await api.auth.register(values);
      setAccessToken(res.data.accessToken);
      set({ user: res.data.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.auth.logout();
    } finally {
      setAccessToken(null);
      set({ user: null, isLoading: false });
    }
  },

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      // Try to refresh first to get a valid access token
      const token = await api.auth.refresh();
      if (!token) {
        set({ user: null, isLoading: false, isInitialized: true });
        return;
      }
      const res = await api.auth.me();
      set({ user: res.data.user, isLoading: false, isInitialized: true });
    } catch {
      setAccessToken(null);
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },
}));
