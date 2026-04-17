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
  source_image?: number | null;
  generation_type?: string;
  strength?: number | null;
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

export type ProjectImageEntry = {
  id: number;
  image: ImageRecord;
  image_id: number;
  order: number;
  caption: string;
  created_at: string;
};

export type ProjectRecord = {
  id: string;
  user: { id: string; username: string };
  title: string;
  description: string;
  cover_image: number | null;
  cover_image_url: string | null;
  is_public: boolean;
  tags: string[];
  images: ProjectImageEntry[];
  image_count: number;
  created_at: string;
  updated_at: string;
};
