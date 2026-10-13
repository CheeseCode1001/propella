import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser, LoginInput, SignupInput } from '@propella/shared';
import { api, setAccessToken, getAccessToken } from './api-client';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  sessionChecked: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: AuthUser | null) => void;
  setAccessToken: (token: string | null) => Promise<void>;
  setHydrated: () => void;
  setSessionChecked: (checked: boolean) => void;
  setError: (err: string | null) => void;

  login: (credentials: LoginInput) => Promise<AuthUser>;
  signup: (data: SignupInput) => Promise<{ pendingVerification: boolean; email: string }>;
  verifySignup: (email: string, code: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      sessionChecked: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: user !== null }),

      setAccessToken: async (token) => {
        await setAccessToken(token);
      },

      setHydrated: () => set({ hasHydrated: true }),
      setSessionChecked: (checked) => set({ sessionChecked: checked }),
      setError: (error) => set({ error }),

      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post<{
            data: { user: AuthUser; accessToken: string };
          }>('/auth/login', { email, password });

          await setAccessToken(res.data.accessToken);
          set({
            user: res.data.user,
            isAuthenticated: true,
            sessionChecked: true,
            isLoading: false,
          });
          return res.data.user;
        } catch (err: any) {
          const message = err instanceof Error ? err.message : 'Invalid credentials';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post<{
            data: { pendingVerification: boolean; email: string };
          }>('/auth/signup', data);
          set({ isLoading: false });
          return res.data;
        } catch (err: any) {
          const message = err instanceof Error ? err.message : 'Registration failed';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      verifySignup: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post<{
            data: { user: AuthUser; accessToken: string };
          }>('/auth/verify-signup', { email, code });

          await setAccessToken(res.data.accessToken);
          set({
            user: res.data.user,
            isAuthenticated: true,
            sessionChecked: true,
            isLoading: false,
          });
          return res.data.user;
        } catch (err: any) {
          const message = err instanceof Error ? err.message : 'Verification failed';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout', {}).catch(() => null);
        } finally {
          await setAccessToken(null);
          set({
            user: null,
            isAuthenticated: false,
            sessionChecked: true,
            error: null,
          });
        }
      },

      restoreSession: async () => {
        try {
          const token = await getAccessToken();
          if (!token) {
            set({ sessionChecked: true });
            return;
          }

          // Try fetching current user profile
          const res = await api.get<{ data: { user: AuthUser } }>('/users/me');
          set({
            user: res.data.user,
            isAuthenticated: true,
            sessionChecked: true,
          });
        } catch {
          // If token refresh failed, keep whatever user profile was persisted locally for offline use
          set({ sessionChecked: true });
        }
      },
    }),
    {
      name: 'propella-mobile-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export function useAuthReady(): boolean {
  return useAuthStore((s) => s.hasHydrated && s.sessionChecked);
}
