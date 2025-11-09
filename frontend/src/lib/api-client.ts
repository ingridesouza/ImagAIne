import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
} from 'axios';
import { env } from '@/lib/env';
import { useAuthStore } from '@/features/auth/store';

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const baseConfig: AxiosRequestConfig = {
  baseURL: env.apiBaseUrl,
  timeout: 15000,
};

export const apiClient = axios.create(baseConfig);
const refreshClient = axios.create(baseConfig);

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken, setSession, logout, user } = useAuthStore.getState();
  if (!refreshToken) {
    logout();
    return null;
  }
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/token/refresh/', { refresh: refreshToken })
      .then((response) => {
        const nextAccess = response.data.access as string | undefined;
        const nextRefresh = (response.data.refresh as string | undefined) ?? refreshToken;
        if (!nextAccess) {
          logout();
          return null;
        }
        setSession({
          accessToken: nextAccess,
          refreshToken: nextRefresh,
          user: user ?? null,
        });
        return nextAccess;
      })
      .catch(() => {
        logout();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetriableRequest | undefined;
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        const headers = new AxiosHeaders(originalRequest.headers);
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        originalRequest.headers = headers;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  },
);
