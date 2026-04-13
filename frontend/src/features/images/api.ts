import { apiClient } from '@/lib/api-client';
import type {
  GenerateImagePayload,
  ImageRecord,
  PaginatedResponse,
  ProjectRecord,
} from '@/features/images/types';
import type { ImageComment } from '@/features/images/components/ImageDetailsDialog';

export const imagesApi = {
  async fetchMyImages(page = 1) {
    const { data } = await apiClient.get<PaginatedResponse<ImageRecord>>('/images/my-images/', {
      params: { page },
    });
    return data;
  },
  async fetchMyImagesPage({ pageParam = 1 }: { pageParam?: number }) {
    const { data } = await apiClient.get<PaginatedResponse<ImageRecord>>('/images/my-images/', {
      params: { page: pageParam },
    });
    return data;
  },
  async fetchLikedImages(page = 1) {
    const { data } = await apiClient.get<PaginatedResponse<ImageRecord>>('/images/liked/', {
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
  async fetchPublicImagesPage({
    pageParam = 1,
    search,
  }: {
    pageParam?: number;
    search?: string;
  }) {
    const { data } = await apiClient.get<PaginatedResponse<ImageRecord>>('/images/public/', {
      params: {
        page: pageParam,
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
  // Projects
  async fetchProjects() {
    const { data } = await apiClient.get<ProjectRecord[]>('/projects/');
    return data;
  },
  async fetchProject(projectId: string) {
    const { data } = await apiClient.get<ProjectRecord>(`/projects/${projectId}/`);
    return data;
  },
  async createProject(payload: { title: string; description?: string }) {
    const { data } = await apiClient.post<ProjectRecord>('/projects/', payload);
    return data;
  },
  async updateProject(projectId: string, payload: Partial<{ title: string; description: string; is_public: boolean; cover_image: number | null }>) {
    const { data } = await apiClient.put<ProjectRecord>(`/projects/${projectId}/`, payload);
    return data;
  },
  async deleteProject(projectId: string) {
    await apiClient.delete(`/projects/${projectId}/`);
  },
  async addImageToProject(projectId: string, imageId: number, order = 0, caption = '') {
    const { data } = await apiClient.post(`/projects/${projectId}/images/`, { image_id: imageId, order, caption });
    return data;
  },
  async removeImageFromProject(projectId: string, imageId: number) {
    await apiClient.delete(`/projects/${projectId}/images/${imageId}/remove/`);
  },
  async reorderProjectImages(projectId: string, imageIds: number[]) {
    const { data } = await apiClient.patch(`/projects/${projectId}/images/reorder/`, { image_ids: imageIds });
    return data;
  },
  async fetchPublicProjects(page = 1) {
    const { data } = await apiClient.get<PaginatedResponse<ProjectRecord>>('/projects/public/', { params: { page } });
    return data;
  },
  // Related & Suggestions
  async fetchRelatedImages(imageId: number, limit = 6) {
    const { data } = await apiClient.get<{
      count: number;
      results: { image: ImageRecord; similarity_score: number }[];
    }>(`/images/${imageId}/related/`, { params: { limit } });
    return data;
  },
  async fetchStyleSuggestions(limit = 5) {
    const { data } = await apiClient.get<{
      count: number;
      results: {
        label: string;
        example_prompt: string;
        example_image_id: number;
        frequency: number;
        confidence: number;
      }[];
    }>('/users/me/style-suggestions/', { params: { limit } });
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
