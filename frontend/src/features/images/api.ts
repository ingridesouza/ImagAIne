import { apiClient } from '@/lib/api-client';
import type {
  GenerateImagePayload,
  ImageRecord,
  PaginatedResponse,
} from '@/features/images/types';
import type { ImageComment } from '@/features/images/components/ImageDetailsDialog';

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
    const { data } = await apiClient.post<ImageRecord>(`/images/${imageId}/like/`);
    return data;
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
  async fetchComments(imageId: number) {
    const { data } = await apiClient.get<PaginatedResponse<ImageComment>>(
      `/images/${imageId}/comments/`
    );
    return data.results;
  },
  async addComment(imageId: number, text: string) {
    const { data } = await apiClient.post<ImageComment>(
      `/images/${imageId}/comments/`,
      { text }
    );
    return data;
  },
  async likeComment(imageId: number, commentId: number) {
    const { data } = await apiClient.post<{
      comment_id: number;
      is_liked: boolean;
      like_count: number;
    }>(`/images/${imageId}/comments/${commentId}/like/`);
    return data;
  },
  async unlikeComment(imageId: number, commentId: number) {
    const { data } = await apiClient.delete<{
      comment_id: number;
      is_liked: boolean;
      like_count: number;
    }>(`/images/${imageId}/comments/${commentId}/like/`);
    return data;
  },
  async addReply(imageId: number, parentId: number, text: string) {
    const { data } = await apiClient.post<ImageComment>(
      `/images/${imageId}/comments/`,
      { text, parent_id: parentId }
    );
    return data;
  },
  async refinePrompt(description: string, style?: string) {
    const { data } = await apiClient.post<{
      refined_prompt: string;
      negative_prompt: string;
    }>(
      '/refine-prompt/',
      {
        description,
        ...(style ? { style } : {}),
      },
      {
        timeout: 60000, // 60 segundos para chamadas LLM
      }
    );
    return data;
  },
};
