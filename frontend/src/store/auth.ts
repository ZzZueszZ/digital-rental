import { create } from 'zustand';

type AuthState = {
  accessToken?: string;
  setAccessToken: (token?: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: undefined,
  setAccessToken: (token) => set({ accessToken: token }),
  clear: () => set({ accessToken: undefined }),
}));

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const setAccessToken = (token?: string) => useAuthStore.getState().setAccessToken(token);
