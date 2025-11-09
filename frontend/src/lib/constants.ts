import type { LucideIcon } from 'lucide-react';
import {
  Image as ImageIcon,
  Home,
  Sparkles,
  GalleryVerticalEnd,
  Settings,
} from 'lucide-react';

export type NavLink = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const NAV_LINKS: NavLink[] = [
  { label: 'Visão geral', path: '/', icon: Home },
  { label: 'Gerar imagem', path: '/generate', icon: Sparkles },
  { label: 'Minhas criações', path: '/my-images', icon: ImageIcon },
  { label: 'Galeria pública', path: '/public', icon: GalleryVerticalEnd },
  { label: 'Configurações', path: '/settings', icon: Settings },
];

export const QUERY_KEYS = {
  profile: ['auth', 'profile'] as const,
  myImages: () => ['images', 'my'] as const,
  publicImages: (search: string) => ['images', 'public', search] as const,
};
