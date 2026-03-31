export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  otpCode: string
  newPassword: string
}

export interface ChangeEmailRequest {
  newEmail: string
}

export interface ResendActivationRequest {
  email: string
}
