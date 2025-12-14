import { apiClient } from '@/lib/api-client';
import type {
  LoginPayload,
  RegisterPayload,
  UserProfile,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
} from '@/features/auth/types';

export type AuthResponse = {
  refresh: string;
  access: string;
  user: UserProfile;
};

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<AuthResponse>('/auth/login/', payload);
    return data;
  },
  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<{ detail: string }>('/auth/register/', payload);
    return data;
  },
  async fetchProfile() {
    const { data } = await apiClient.get<UserProfile>('/auth/profile/');
    return data;
  },
  async requestPasswordReset(payload: PasswordResetRequestPayload) {
    const { data } = await apiClient.post<{ detail: string }>(
      '/auth/password/reset/request/',
      payload,
    );
    return data;
  },
  async confirmPasswordReset(payload: PasswordResetConfirmPayload) {
    const { data } = await apiClient.post<{ detail: string }>(
      '/auth/password/reset/confirm/',
      payload,
    );
    return data;
  },
  async verifyEmail(token: string) {
    const { data } = await apiClient.get<{ detail: string }>(`/auth/verify-email/${token}/`);
    return data;
  },
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<UserProfile>('/auth/profile/avatar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async uploadCover(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<UserProfile>('/auth/profile/cover/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
