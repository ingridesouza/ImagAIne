import { useInfiniteQuery } from '@tanstack/react-query';
import { imagesApi } from '@/features/images/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { ImageRecord } from '@/features/images/types';

type UseInfiniteMyImagesOptions = {
  enabled?: boolean;
};

export const useInfiniteMyImages = ({ enabled = true }: UseInfiniteMyImagesOptions = {}) => {
  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.myImagesInfinite(),
    queryFn: ({ pageParam }) => imagesApi.fetchMyImagesPage({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      try {
        const url = new URL(lastPage.next);
        const nextPage = url.searchParams.get('page');
        return nextPage ? Number(nextPage) : undefined;
      } catch {
        // Se next nao for uma URL valida, tenta extrair o numero diretamente
        const match = lastPage.next.match(/page=(\d+)/);
        return match ? Number(match[1]) : undefined;
      }
    },
    enabled,
  });

  // Flatten das paginas
  const images: ImageRecord[] = query.data?.pages.flatMap((page) => page.results) ?? [];
  const totalCount = query.data?.pages[0]?.count ?? 0;

  return {
    ...query,
    images,
    totalCount,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
};

type UseInfinitePublicImagesOptions = {
  search?: string;
  enabled?: boolean;
};

export const useInfinitePublicImages = ({
  search = '',
  enabled = true,
}: UseInfinitePublicImagesOptions = {}) => {
  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.publicImagesInfinite(search),
    queryFn: ({ pageParam }) => imagesApi.fetchPublicImagesPage({ pageParam, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      try {
        const url = new URL(lastPage.next);
        const nextPage = url.searchParams.get('page');
        return nextPage ? Number(nextPage) : undefined;
      } catch {
        const match = lastPage.next.match(/page=(\d+)/);
        return match ? Number(match[1]) : undefined;
      }
    },
    enabled,
  });

  const images: ImageRecord[] = query.data?.pages.flatMap((page) => page.results) ?? [];
  const totalCount = query.data?.pages[0]?.count ?? 0;

  return {
    ...query,
    images,
    totalCount,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
};
