import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { Download, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import type { ImageRecord } from '@/features/images/types';

const STATUS_COPY: Record<
  ImageRecord['status'],
  { label: string; variant: 'default' | 'success' | 'warning' }
> = {
  READY: { label: 'Pronta', variant: 'success' },
  GENERATING: { label: 'Em processamento', variant: 'warning' },
  FAILED: { label: 'Falhou', variant: 'default' },
};

type ImageDetailsDialogProps = {
  image: ImageRecord | null;
  onClose: () => void;
  onToggleLike?: (image: ImageRecord) => void;
  onDownload?: (image: ImageRecord) => void;
  onUpdateVisibility?: (image: ImageRecord, isPublic: boolean) => void;
  isUpdatingVisibility?: boolean;
};

type Tab = 'details' | 'settings';

export const ImageDetailsDialog = ({
  image,
  onClose,
  onToggleLike,
  onDownload,
  onUpdateVisibility,
  isUpdatingVisibility = false,
}: ImageDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [visibilityChoice, setVisibilityChoice] = useState<'public' | 'private'>('public');

  useEffect(() => {
    if (image) {
      setActiveTab('details');
      setVisibilityChoice(image.is_public ? 'public' : 'private');
    }
  }, [image]);

  if (!image) {
    return null;
  }

  const formattedDate = new Date(image.created_at).toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const handleVisibilityChange = (value: 'public' | 'private') => {
    setVisibilityChoice(value);
    if (image && onUpdateVisibility) {
      onUpdateVisibility(image, value === 'public');
    }
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const status = STATUS_COPY[image.status];

  return (
    <div className="image-dialog__backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className="image-dialog">
        <div className="image-dialog__header">
          <div>
            <p className="image-dialog__muted">Gerado por {image.user.username}</p>
            <h2>{image.prompt}</h2>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Fechar detalhes">
            <X size={18} />
            Fechar
          </Button>
        </div>

        <div className="image-dialog__content">
          <div className="image-dialog__preview">
            {image.image_url ? (
              <img src={image.image_url} alt={image.prompt} />
            ) : (
              <div className="image-dialog__placeholder">
                <span>Prévia indisponível</span>
              </div>
            )}
          </div>
          <div className="image-dialog__sidebar">
            <div className="image-dialog__tabs">
              <button
                type="button"
                className={activeTab === 'details' ? 'active' : ''}
                onClick={() => setActiveTab('details')}
              >
                Detalhes
              </button>
              <button
                type="button"
                className={activeTab === 'settings' ? 'active' : ''}
                onClick={() => setActiveTab('settings')}
              >
                Configurações
              </button>
            </div>

            {activeTab === 'details' ? (
              <div className="image-dialog__panel">
                <div className="image-dialog__badge-row">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <span className="image-dialog__muted">{formattedDate}</span>
                </div>

                {image.negative_prompt ? (
                  <p className="image-dialog__muted">
                    <strong>Evitar:</strong> {image.negative_prompt}
                  </p>
                ) : null}

                <dl className="image-dialog__list">
                  <div>
                    <dt>Aspect ratio</dt>
                    <dd>{image.aspect_ratio}</dd>
                  </div>
                  {image.seed ? (
                    <div>
                      <dt>Seed</dt>
                      <dd>{image.seed}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Tags</dt>
                    <dd>{image.tags.length ? image.tags.join(', ') : 'Sem tags'}</dd>
                  </div>
                </dl>

                <div className="image-dialog__stats">
                  <div>
                    <span className="image-dialog__muted">Curtidas</span>
                    <strong>{image.like_count}</strong>
                  </div>
                  <div>
                    <span className="image-dialog__muted">Comentários</span>
                    <strong>{image.comment_count}</strong>
                  </div>
                  <div>
                    <span className="image-dialog__muted">Downloads</span>
                    <strong>{image.download_count}</strong>
                  </div>
                </div>

                <div className="image-dialog__actions">
                  {onToggleLike ? (
                    <Button
                      type="button"
                      variant={image.is_liked ? 'primary' : 'secondary'}
                      onClick={() => onToggleLike(image)}
                    >
                      <Heart size={16} fill={image.is_liked ? '#fff' : 'none'} />
                      {image.is_liked ? 'Curtida' : 'Curtir'}
                    </Button>
                  ) : null}
                  {onDownload ? (
                    <Button type="button" variant="secondary" onClick={() => onDownload(image)}>
                      <Download size={16} />
                      Download
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="image-dialog__panel">
                <p className="image-dialog__muted">
                  Controle quem pode encontrar esta imagem na galeria pública. Tornar privada remove a imagem do feed
                  compartilhado.
                </p>
                <label className="form-group">
                  <span>Visibilidade</span>
                  <Select
                    value={visibilityChoice}
                    disabled={isUpdatingVisibility}
                    onChange={(event) =>
                      handleVisibilityChange(event.target.value as 'public' | 'private')
                    }
                  >
                    <option value="public">Pública</option>
                    <option value="private">Privada</option>
                  </Select>
                </label>
                {isUpdatingVisibility ? (
                  <span className="image-dialog__muted">Salvando alterações...</span>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
