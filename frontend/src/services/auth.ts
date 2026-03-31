import { http, setIsLoggingOut } from '@/lib/http'
import { useAuthStore } from '@/store/auth'
import { removeRefreshTokenCookie } from '@/lib/refresh-token-client'
import type { LoginRequest, LoginResponse } from '@/schemas/auth/login'
import type { UserResponse } from '@/types/user'
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangeEmailRequest,
  ResendActivationRequest,
} from '@/types/auth'

const AUTH_PATH = '/auth'
const USER_PATH = '/users'

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

export const authService = {
  login: (payload: LoginRequest) =>
    http.post<IBackendRes<LoginResponse>>(`${AUTH_PATH}/login`, payload),

  register: (payload: RegisterPayload) =>
    http.post<IBackendRes<UserResponse>>(`${AUTH_PATH}/register`, payload),

  me: () =>
    http.get<IBackendRes<UserResponse>>(`${USER_PATH}/me`),

  logout: async () => {
    setIsLoggingOut(true)
    try {
      await http.post<IBackendRes<unknown>>(`${AUTH_PATH}/logout`)
    } finally {
      useAuthStore.getState().clear()
      await removeRefreshTokenCookie()
      setIsLoggingOut(false)
    }
  },

  resendActivation: (payload: ResendActivationRequest) =>
    http.post<IBackendRes<string>>(`${AUTH_PATH}/activate/resend`, payload),

  activate: (token: string) =>
    http.get<IBackendRes<UserResponse>>(`${AUTH_PATH}/activate?token=${token}`),

  changePassword: (payload: ChangePasswordRequest) =>
    http.post<IBackendRes<unknown>>(`${AUTH_PATH}/change-password`, payload),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    http.post<IBackendRes<string>>(`${AUTH_PATH}/forgot-password`, payload),

  resetPassword: (payload: ResetPasswordRequest) =>
    http.post<IBackendRes<string>>(`${AUTH_PATH}/reset-password`, payload),

  changeEmail: (payload: ChangeEmailRequest) =>
    http.post<IBackendRes<unknown>>(`${AUTH_PATH}/change-email`, payload),
}
