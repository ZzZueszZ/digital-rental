export interface LoginParams {
  userName: string
  password: string
}
export interface LoginResult {
  id: number
  accessToken: string
  refreshToken: string
  userName: string
  email: string
  roles: string[]
}