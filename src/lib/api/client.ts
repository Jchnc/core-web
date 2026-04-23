import axios, { type AxiosError, type AxiosInstance } from 'axios';

const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${NEXT_PUBLIC_APP_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

export function setClientAccessToken(token: string | null): void {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401
      || !originalRequest
      || (originalRequest as typeof originalRequest & { _retry?: boolean })._retry
    ) {
      return Promise.reject(error);
    }

    (originalRequest as typeof originalRequest & { _retry?: boolean })._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Refresh failed');

      const { data } = (await res.json()) as { data: { access_token: string } };
      const newToken = data.access_token;

      accessToken = newToken;
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch {
      accessToken = null;
      refreshQueue = [];
      window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
