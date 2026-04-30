import { Role } from '@/constants/enum/role'
import { AccountStatus } from '@/constants/enum/status'

export { Role, AccountStatus };

export enum KycStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum TrustLevel {
  BASIC = 'BASIC',
  VERIFIED = 'VERIFIED',
  ELITE = 'ELITE',
}

export interface UserResponse {
  id: number
  email: string
  phone: string | null
  accountStatus: AccountStatus
  kycStatus: KycStatus
  trustLevel: TrustLevel
  emailVerified: boolean
  phoneVerified: boolean
  enabled: boolean
  accountNonLocked: boolean
  createdAt: string
  updatedAt: string
  roles: Role[] | string[]
}

export interface UserCriteria {
  keyword?: string
  email?: string
  phone?: string
  accountStatus?: AccountStatus
  kycStatus?: KycStatus
  trustLevel?: TrustLevel
  role?: string
}

export interface UserUpdateRequest {
  phone?: string
  accountStatus?: AccountStatus
  kycStatus?: KycStatus
  trustLevel?: TrustLevel
  enabled?: boolean
  accountNonLocked?: boolean
  roles?: string[]
}

export interface UserCreateRequest {
  email: string
  phone?: string
  password?: string
  roles?: string[]
  firstName?: string
  lastName?: string
}

export interface UserStatusUpdateRequest {
  status: AccountStatus
}

export interface UserProfileResponse {
  id: number
  fullName: string | null
  firstName: string | null
  lastName: string | null
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null
  dateOfBirth: string | null
  avatarUrl: string | null
  occupation: string | null
  companyName: string | null
  email: string
  roles: string[]
  createdAt: string
  updatedAt: string
}

export interface UserProfileUpdateRequest {
  fullName?: string
  firstName?: string
  lastName?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  dateOfBirth?: string
  occupation?: string
  companyName?: string
}
