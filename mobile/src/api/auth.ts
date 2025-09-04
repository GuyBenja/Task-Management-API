import { api } from './client';
import type { ApiResponse } from '../types/api';

export async function register(username: string, password: string) {
  const res = await api.post<ApiResponse<{ username: string; role: string }>>('/auth/register', { username, password });
  return res.data;
}

export async function login(username: string, password: string) {
  const res = await api.post<ApiResponse<{ token: string }>>('/auth/login', { username, password });
  return res.data;
}
