import { useEffect, useState } from 'react';
import type { MouseEvent, FormEvent } from 'react';
import { Download, Heart, X, Share2, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ImageRecord } from '@/features/images/types';

export type ImageComment = {
  id: number;
  user: { username: string };
  text: string;
  created_at: string;
};

type ImageDetailsDialogProps = {
  image: ImageRecord | null;
  onClose: () => void;
  onToggleLike?: (image: ImageRecord) => void;
  onDownload?: (image: ImageRecord) => void;
  onShare?: (image: ImageRecord) => void;
  onUpdateVisibility?: (image: ImageRecord, isPublic: boolean) => void;
  isUpdatingVisibility?: boolean;
  comments?: ImageComment[];
  onAddComment?: (image: ImageRecord, text: string) => void;
  isLoadingComments?: boolean;
};

export const ImageDetailsDialog = ({
  image,
  onClose,
  onToggleLike,
  onDownload,
  onShare,
  comments = [],
  onAddComment,
  isLoadingComments = false,
}: ImageDetailsDialogProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (image) {
      setShowComments(false);
      setNewComment('');
    }
  }, [image]);

  if (!image) {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmitComment = (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !image || !onAddComment) return;

    onAddComment(image, newComment);
    setNewComment('');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <div className="image-modal__backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className={`image-modal ${showComments ? 'image-modal--with-comments' : ''}`}>
        {/* Botão Fechar */}
        <button className="image-modal__close" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>

        {/* Área Principal */}
        <div className="image-modal__main">
          {/* Imagem */}
          <div className="image-modal__image-container">
            {image.image_url ? (
              <img src={image.image_url} alt={image.prompt} />
            ) : (
              <div className="image-modal__placeholder">
                <span>Imagem indisponível</span>
              </div>
            )}
          </div>

          {/* Prompt */}
          <div className="image-modal__prompt-section">
            <p className="image-modal__author">
              Por <strong>{image.user.username}</strong>
            </p>
            <p className="image-modal__prompt" title={image.prompt}>
              {image.prompt}
            </p>
          </div>
        </div>

        {/* Barra de Ações Vertical */}
        <div className="image-modal__actions">
          <button
            className={`image-modal__action-btn ${image.is_liked ? 'image-modal__action-btn--active' : ''}`}
            onClick={() => onToggleLike?.(image)}
            title="Curtir"
          >
            <Heart size={22} fill={image.is_liked ? 'currentColor' : 'none'} />
            <span>{image.like_count}</span>
          </button>

          <button
            className="image-modal__action-btn"
            onClick={() => setShowComments(!showComments)}
            title="Comentários"
          >
            <MessageCircle size={22} fill={showComments ? 'currentColor' : 'none'} />
            <span>{image.comment_count}</span>
          </button>

          <button
            className="image-modal__action-btn"
            onClick={() => onShare?.(image)}
            title="Compartilhar"
          >
            <Share2 size={22} />
            <span>Enviar</span>
          </button>

          <button
            className="image-modal__action-btn"
            onClick={() => onDownload?.(image)}
            title="Download"
          >
            <Download size={22} />
            <span>{image.download_count}</span>
          </button>
        </div>

        {/* Painel de Comentários */}
        {showComments && (
          <div className="image-modal__comments">
            <div className="image-modal__comments-header">
              <h3>Comentários</h3>
              <span>{comments.length}</span>
            </div>

            <div className="image-modal__comments-list">
              {isLoadingComments ? (
                <p className="image-modal__no-comments">Carregando comentários...</p>
              ) : comments.length === 0 ? (
                <p className="image-modal__no-comments">
                  Nenhum comentário ainda. Seja o primeiro!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="image-modal__comment">
                    <div className="image-modal__comment-header">
                      <strong>{comment.user.username}</strong>
                      <span>{formatTimeAgo(comment.created_at)}</span>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            <form className="image-modal__comment-form" onSubmit={handleSubmitComment}>
              <input
                type="text"
                placeholder="Adicionar comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button type="submit" variant="primary" disabled={!newComment.trim() || !onAddComment}>
                <Send size={16} />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
