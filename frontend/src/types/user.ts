import type { Role } from '@/constants/enum/role'

export interface UserResponse {
  id: number
  email: string
  phone: string | null
  accountStatus: 'ACTIVE' | 'PENDING' | 'BANNED'
  kycStatus: string
  trustLevel: string
  emailVerified: boolean
  phoneVerified: boolean
  enabled: boolean
  accountNonLocked: boolean
  createdAt: string
  updatedAt: string
  roles: Role[]
}
