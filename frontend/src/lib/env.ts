const normalizeUrl = (value: string) => {
  if (!value) {
    return value;
  }
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const env = {
  apiBaseUrl: normalizeUrl(
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  ),
  appUrl: normalizeUrl(import.meta.env.VITE_APP_URL ?? 'http://localhost:5173'),
};
