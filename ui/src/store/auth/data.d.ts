export interface IAuthState {
  authUser?: unknown;
}
export interface LoginResult {
  id: number
  accessToken: string
  refreshToken: string
  userName: string
  email: string
  roles: string[]
}