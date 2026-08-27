"use client";

import { create } from "zustand";
import type { User } from "@tatalaku/shared";
import { api, setAccessToken, ApiRequestError } from "@/lib/api";
import type { LoginFormValues, RegisterFormValues } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  login: (values: LoginFormValues) => Promise<void>;
  register: (values: RegisterFormValues) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  clearError: () => set({ error: null }),

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
    set({ isLoading: true, error: null });
    try {
      // Try to refresh first to get a valid access token
      const token = await api.auth.refresh();
      if (!token) {
        set({ user: null, isLoading: false, isInitialized: true });
        return;
      }
      const res = await api.auth.me();
      set({ user: res.data.user, isLoading: false, isInitialized: true });
    } catch (err: unknown) {
      setAccessToken(null);

      let errorMessage =
        "Connection to server failed. Please ensure the backend and database are running.";
      if (err instanceof ApiRequestError && [401, 403, 404].includes(err.status)) {
        errorMessage = ""; // Invalid session, just redirect naturally
      }

      set({
        user: null,
        isLoading: false,
        isInitialized: true,
        error: errorMessage || null,
      });
    }
  },
}));
