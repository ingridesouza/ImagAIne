type UserSummary = {
  id: string;
  username: string;
};

export type ImageRecord = {
  id: number;
  user: UserSummary;
  prompt: string;
  negative_prompt?: string | null;
  aspect_ratio: string;
  seed?: number | null;
  image_url?: string | null;
  status: 'GENERATING' | 'READY' | 'FAILED';
  is_public: boolean;
  like_count: number;
  comment_count: number;
  download_count: number;
  is_liked: boolean;
  relevance_score: number;
  featured: boolean;
  tags: string[];
  created_at: string;
};

export type GenerateImagePayload = {
  prompt: string;
  negative_prompt?: string;
  aspect_ratio?: string;
  seed?: number | null;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
