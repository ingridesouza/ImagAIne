import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { QUERY_KEYS } from '@/lib/constants';

export const AuthBootstrapper = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const { data, isError } = useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: () => authApi.fetchProfile(),
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  useEffect(() => {
    if (isError && accessToken) {
      logout();
    }
  }, [isError, accessToken, logout]);

  return null;
};
