import http from '@/utils/api/api.ts';
import { LoginResult } from '@/pages/authentication/login/data';

export const authApi = {

  async refreshToken(params: { refreshToken: string }): Promise<LoginResult> {
    const data = await http.post<LoginResult>("/pub/authenticate/refresh-token", {
      refreshToken: params.refreshToken
    });
    return data.data
  },
};
