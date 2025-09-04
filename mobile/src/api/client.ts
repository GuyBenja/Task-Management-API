import axios from 'axios';
import { API_BASE_URL } from '../config/env';

let authToken: string | null = null;

// Set the current auth token used by API client
export function setAuthToken(token: string | null) {
  authToken = token;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Inject Bearer token for every request if available
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});
