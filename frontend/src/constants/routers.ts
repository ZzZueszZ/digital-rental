export const Routers = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY: '/auth/verify',
  ACTIVATION_SUCCESS: '/auth/activation-success',
  LINK_EXPIRED: '/auth/link-expired',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ADMIN: '/admin',
  STAFF: '/staff',
  SHIPPER: '/shipper',
  FORBIDDEN: '/403',
} as const;

export default Routers;
