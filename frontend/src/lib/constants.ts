import type { LucideIcon } from 'lucide-react';
import { Compass, Home, Settings, Sparkles, User, Wand2 } from 'lucide-react';

export type NavLink = {
  label: string;
  path: string;
  icon: LucideIcon;
  section: 'discover' | 'library';
};

export const NAV_LINKS: NavLink[] = [
  { label: 'Explore', path: '/', icon: Compass, section: 'discover' },
  { label: 'Visão geral', path: '/dashboard', icon: Home, section: 'discover' },
  { label: 'Criar Prompt', path: '/wizard', icon: Wand2, section: 'discover' },
  { label: 'Gerar imagem', path: '/generate', icon: Sparkles, section: 'discover' },
  { label: 'Perfil', path: '/profile', icon: User, section: 'library' },
  { label: 'Configurações', path: '/settings', icon: Settings, section: 'library' },
];

export const QUERY_KEYS = {
  profile: ['auth', 'profile'] as const,
  myImages: () => ['images', 'my'] as const,
  publicImages: (search: string) => ['images', 'public', search] as const,
};
