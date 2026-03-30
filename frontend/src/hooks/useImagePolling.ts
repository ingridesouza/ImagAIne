import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { notifications } from '@/lib/notifications';
import type { ImageRecord } from '@/features/images/types';

type UseImagePollingOptions = {
  images: ImageRecord[];
  onImageReady?: (image: ImageRecord) => void;
  enabled?: boolean;
  pollingInterval?: number;
};

export const useImagePolling = ({
  images,
  onImageReady,
  enabled = true,
  pollingInterval = 5000,
}: UseImagePollingOptions) => {
  const queryClient = useQueryClient();
  const previousStatusRef = useRef<Map<number, ImageRecord['status']>>(new Map());
  const isFirstRenderRef = useRef(true);

  // Imagens em geracao
  const generatingImages = images.filter((img) => img.status === 'GENERATING');
  const hasGenerating = generatingImages.length > 0;

  // Polling quando ha imagens gerando
  useEffect(() => {
    if (!enabled || !hasGenerating) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImages() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myImagesInfinite() });
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enabled, hasGenerating, queryClient, pollingInterval]);

  // Detectar mudancas de status e disparar notificacoes
  useEffect(() => {
    const prevStatus = previousStatusRef.current;

    // Ignorar primeiro render para nao disparar notificacoes de imagens existentes
    if (isFirstRenderRef.current) {
      images.forEach((image) => {
        prevStatus.set(image.id, image.status);
      });
      isFirstRenderRef.current = false;
      return;
    }

    images.forEach((image) => {
      const prev = prevStatus.get(image.id);

      // Nova imagem (nao existia antes)
      if (prev === undefined) {
        prevStatus.set(image.id, image.status);
        return;
      }

      // Mudou de GENERATING para READY
      if (prev === 'GENERATING' && image.status === 'READY') {
        notifications.imageReady(image.id, () => {
          onImageReady?.(image);
        });
      }

      // Mudou de GENERATING para FAILED
      if (prev === 'GENERATING' && image.status === 'FAILED') {
        notifications.imageError(image.prompt);
      }

      prevStatus.set(image.id, image.status);
    });
  }, [images, onImageReady]);

  return {
    hasGenerating,
    generatingCount: generatingImages.length,
    generatingImages,
  };
};
