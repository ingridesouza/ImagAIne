import type { ImageRecord } from '@/features/images/types';
import { ImageCard } from '@/features/images/components/ImageCard';
import { EmptyState } from '@/components/ui/EmptyState';

type Props = {
  images: ImageRecord[];
  isLoading?: boolean;
  canToggleVisibility?: boolean;
  onToggleVisibility?: (image: ImageRecord) => void;
  onToggleLike?: (image: ImageRecord) => void;
  onDownload?: (image: ImageRecord) => void;
  onShare?: (image: ImageRecord) => void;
};

export const ImageGrid = ({
  images,
  isLoading = false,
  canToggleVisibility,
  onToggleVisibility,
  onToggleLike,
  onDownload,
  onShare,
}: Props) => {
  if (!isLoading && images.length === 0) {
    return (
      <EmptyState
        title="Nenhuma imagem por aqui"
        description="Comece gerando um prompt inspirador ou explore a galeria pública."
      />
    );
  }

  return (
    <div className="image-grid">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          canToggleVisibility={canToggleVisibility}
          onToggleVisibility={onToggleVisibility}
          onToggleLike={onToggleLike}
          onDownload={onDownload}
          onShare={onShare}
        />
      ))}
    </div>
  );
};
