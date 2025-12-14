export type UserProfile = {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  is_verified: boolean;
  profile_picture?: string | null;
  cover_picture?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
};

export type AuthSessionPayload = {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  bio?: string;
};

export type PasswordResetRequestPayload = {
  email: string;
};

export type PasswordResetConfirmPayload = {
  token: string;
  new_password: string;
  new_password_confirm: string;
};
