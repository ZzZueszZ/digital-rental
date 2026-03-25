import { http, setIsLoggingOut } from '@/lib/http';
import { useAuthStore } from '@/store/auth';
import { removeRefreshTokenCookie } from '@/lib/refresh-token-client';

const AUTH_PATH = '/auth';
const USER_PATH = '/users';

export interface IBackendRes<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

export const authService = {
  login: (payload: any) =>
    http.post<IBackendRes<any>>(`${AUTH_PATH}/login`, payload),
  register: (payload: any) =>
    http.post<IBackendRes<any>>(`${AUTH_PATH}/register`, payload),
  me: () => http.get<IBackendRes<any>>(`${USER_PATH}/me`),
  logout: async (refreshToken?: string) => {
    setIsLoggingOut(true);
    try {
      await http.post(`${AUTH_PATH}/logout`, { refreshToken });
    } finally {
      useAuthStore.getState().clear();
      await removeRefreshTokenCookie();
      setIsLoggingOut(false);
    }
  },
  resendActivation: (payload: { email: string }) =>
    http.post<IBackendRes<any>>(`${AUTH_PATH}/activate/resend`, payload),
  activate: (token: string) =>
    http.get<IBackendRes<any>>(`${AUTH_PATH}/activate?token=${token}`),
  forgotPassword: (payload: { email: string }) =>
    http.post<IBackendRes<any>>(`${AUTH_PATH}/forgot-password`, payload),
  resetPassword: (payload: any) =>
    http.post<IBackendRes<any>>(`${AUTH_PATH}/reset-password`, payload),
};
