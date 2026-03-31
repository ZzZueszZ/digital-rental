import type { Role } from '@/constants/enum/role'

export interface UserResponse {
  id: number
  fullName: string | null
  firstName: string | null
  lastName: string | null
  email?: string
  phone?: string | null
  gender: string | null
  dateOfBirth: string | null
  avatarUrl: string | null
  occupation: string | null
  companyName: string | null
  accountStatus?: 'ACTIVE' | 'PENDING' | 'BANNED'
  kycStatus?: string
  trustLevel?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  enabled?: boolean
  accountNonLocked?: boolean
  createdAt: string
  updatedAt: string
  roles?: Role[]
}
