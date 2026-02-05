import http from '@/utils/api/api';
import { AxiosResponse } from 'axios';
import { TableListParams, User } from '@/pages/system/accounts/data';

export async function query(params?: TableListParams, options?: { [key: string]: unknown }): Promise<AxiosResponse> {
  const data = await http.get('/api/v1/api/users', {
    params: {
      ...params,
    },
    ...options,
  });
  return data.data
}

export async function save(data: User): Promise<AxiosResponse<User>> {
  return await http.post<User>('/api/v1/api/users', data);
}

export async function remove(data: { id: number }) {
  return await http.delete('/api/v1/api/users', {
    data,
  });
}

export async function findBy(params: { userId: number }, options?: { [key: string]: unknown }): Promise<User> {
  const data = await http.get<{value: User}>('/api/v1/api/users/findBy', {
    params: {
      ...params,
    },
    ...options,
  });
  console.log('data', data);
  return data.data.value
}
