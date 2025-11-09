import { apiClient } from '@/lib/api-client';
import type {
  GenerateImagePayload,
  ImageRecord,
  PaginatedResponse,
} from '@/features/images/types';

export const imagesApi = {
  async fetchMyImages(page = 1) {
    const { data } = await apiClient.get<PaginatedResponse<ImageRecord>>('/images/my-images/', {
      params: { page },
    });
    return data;
  },
  async fetchPublicImages(search?: string, page = 1) {
    const { data } = await apiClient.get<PaginatedResponse<ImageRecord>>('/images/public/', {
      params: {
        page,
        ...(search ? { search } : {}),
      },
    });
    return data;
  },
  async generate(payload: GenerateImagePayload) {
    const { data } = await apiClient.post<ImageRecord>('/generate/', payload);
    return data;
  },
  async publish(imageId: number) {
    const { data } = await apiClient.post<ImageRecord>(`/images/${imageId}/share/`);
    return data;
  },
  async updateShare(imageId: number, isPublic: boolean) {
    const { data } = await apiClient.patch<ImageRecord>(`/images/${imageId}/share/`, {
      is_public: isPublic,
    });
    return data;
  },
  async like(imageId: number) {
    await apiClient.post(`/images/${imageId}/like/`);
  },
  async unlike(imageId: number) {
    await apiClient.delete(`/images/${imageId}/like/`);
  },
  async registerDownload(imageId: number) {
    const { data } = await apiClient.post<{ download_url: string }>(
      `/images/${imageId}/download/`,
    );
    return data;
  },
};
