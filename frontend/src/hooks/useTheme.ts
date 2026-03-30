import { create } from 'zustand';

type Theme = 'light' | 'dark';

type ThemeStore = {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
};

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  localStorage.setItem('theme', theme);
}

export const useThemeStore = create<ThemeStore>((set) => {
  const initial = getInitialTheme();
  // Apply immediately so first paint matches
  if (typeof window !== 'undefined') applyTheme(initial);

  return {
    theme: initial,
    toggle: () =>
      set((state) => {
        const next = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        return { theme: next };
      }),
    set: (t) => {
      applyTheme(t);
      set({ theme: t });
    },
  };
});
