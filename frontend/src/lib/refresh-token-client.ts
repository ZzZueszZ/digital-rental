import Cookies from 'js-cookie';

const REFRESH_TOKEN_KEY = 'refreshToken';

export const persistRefreshTokenCookie = async (token: string) => {
  Cookies.set(REFRESH_TOKEN_KEY, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

export const getRefreshTokenFromCookie = () => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const removeRefreshTokenCookie = async () => {
  Cookies.remove(REFRESH_TOKEN_KEY);
};
