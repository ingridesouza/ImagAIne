import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { MouseEvent, FormEvent } from 'react';
import { Download, Heart, X, Share2, MessageCircle, Send, CornerDownRight, ChevronDown, Sparkles } from 'lucide-react';
import { imagesApi } from '@/features/images/api';
import type { ImageRecord } from '@/features/images/types';

export type ImageCommentReply = {
  id: number;
  user: { username: string };
  text: string;
  created_at: string;
  like_count: number;
  is_liked: boolean;
};

export type ImageComment = {
  id: number;
  user: { username: string };
  text: string;
  created_at: string;
  like_count: number;
  is_liked: boolean;
  parent_id: number | null;
  reply_count: number;
  replies: ImageCommentReply[];
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
  onLikeComment?: (commentId: number) => void;
  onAddReply?: (parentId: number, text: string) => void;
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
  onLikeComment,
  onAddReply,
  isLoadingComments = false,
}: ImageDetailsDialogProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedPrompt, setExpandedPrompt] = useState(false);

  const [isLiked, setIsLiked] = useState(image?.is_liked ?? false);
  const [likeCount, setLikeCount] = useState(image?.like_count ?? 0);

  useEffect(() => {
    if (image) {
      setIsLiked(image.is_liked ?? false);
      setLikeCount(image.like_count ?? 0);
    }
  }, [image?.id]);

  useEffect(() => {
    if (image) {
      setShowComments(false);
      setNewComment('');
      setExpandedPrompt(false);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [image]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (image) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [image, handleKeyDown]);

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

  const promptIsLong = image.prompt.length > 120;

  return createPortal(
    <div className="img-dialog-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className={`img-dialog ${showComments ? 'img-dialog--comments-open' : ''}`}>
        {/* Left: Image */}
        <div className="img-dialog__image-side">
          {image.image_url ? (
            <img src={image.image_url} alt={image.prompt} draggable={false} />
          ) : (
            <div className="img-dialog__placeholder">
              <span>Imagem indisponível</span>
            </div>
          )}
        </div>

        {/* Right: Info panel */}
        <div className="img-dialog__info-side">
          {/* Header: author + close */}
          <div className="img-dialog__header">
            <div className="img-dialog__author">
              <div className="img-dialog__avatar">
                {(image.user.username?.[0] ?? 'U').toUpperCase()}
              </div>
              <div className="img-dialog__author-info">
                <span className="img-dialog__username">{image.user.username}</span>
                <span className="img-dialog__label">Criador</span>
              </div>
            </div>
            <button className="img-dialog__close" onClick={onClose} aria-label="Fechar">
              <X size={18} />
            </button>
          </div>

          {/* Prompt */}
          <div className="img-dialog__prompt-area">
            <p className={`img-dialog__prompt ${expandedPrompt ? 'img-dialog__prompt--expanded' : ''}`}>
              {image.prompt}
            </p>
            {promptIsLong && !expandedPrompt && (
              <button
                className="img-dialog__show-more"
                onClick={() => setExpandedPrompt(true)}
              >
                ver mais <ChevronDown size={14} />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="img-dialog__actions">
            <button
              className={`img-dialog__action ${isLiked ? 'img-dialog__action--liked' : ''}`}
              onClick={() => {
                setIsLiked(!isLiked);
                setLikeCount(isLiked ? Math.max(0, likeCount - 1) : likeCount + 1);
                onToggleLike?.(image);
              }}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likeCount}</span>
            </button>

            <button
              className={`img-dialog__action ${showComments ? 'img-dialog__action--active' : ''}`}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle size={18} fill={showComments ? 'currentColor' : 'none'} />
              <span>{image.comment_count}</span>
            </button>

            <button className="img-dialog__action" onClick={() => onShare?.(image)}>
              <Share2 size={18} />
            </button>

            <button className="img-dialog__action" onClick={() => onDownload?.(image)}>
              <Download size={18} />
              <span>{image.download_count}</span>
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="img-dialog__comments">
              <div className="img-dialog__comments-header">
                <span className="img-dialog__comments-title">Comentários</span>
                <span className="img-dialog__comments-count">{comments.length}</span>
              </div>

              <div className="img-dialog__comments-list">
                {isLoadingComments ? (
                  <div className="img-dialog__comments-empty">
                    <div className="img-dialog__loading-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                ) : comments.length === 0 ? (
                  <p className="img-dialog__comments-empty">
                    Nenhum comentário ainda. Seja o primeiro!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="img-dialog__comment">
                      <div className="img-dialog__comment-top">
                        <span className="img-dialog__comment-user">{comment.user.username}</span>
                        <span className="img-dialog__comment-time">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      <p className="img-dialog__comment-text">{comment.text}</p>

                      <div className="img-dialog__comment-actions">
                        <button
                          type="button"
                          className={`img-dialog__comment-btn ${comment.is_liked ? 'img-dialog__comment-btn--liked' : ''}`}
                          onClick={() => onLikeComment?.(comment.id)}
                        >
                          <Heart size={13} fill={comment.is_liked ? 'currentColor' : 'none'} />
                          {comment.like_count > 0 && <span>{comment.like_count}</span>}
                        </button>
                        <button
                          type="button"
                          className="img-dialog__comment-btn"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          <CornerDownRight size={13} />
                          <span>Responder</span>
                        </button>
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="img-dialog__replies">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="img-dialog__reply">
                              <div className="img-dialog__comment-top">
                                <span className="img-dialog__comment-user">{reply.user.username}</span>
                                <span className="img-dialog__comment-time">{formatTimeAgo(reply.created_at)}</span>
                              </div>
                              <p className="img-dialog__comment-text">{reply.text}</p>
                              <div className="img-dialog__comment-actions">
                                <button
                                  type="button"
                                  className={`img-dialog__comment-btn ${reply.is_liked ? 'img-dialog__comment-btn--liked' : ''}`}
                                  onClick={() => onLikeComment?.(reply.id)}
                                >
                                  <Heart size={13} fill={reply.is_liked ? 'currentColor' : 'none'} />
                                  {reply.like_count > 0 && <span>{reply.like_count}</span>}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <form
                          className="img-dialog__reply-form"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (replyText.trim() && onAddReply) {
                              onAddReply(comment.id, replyText);
                              setReplyText('');
                              setReplyingTo(null);
                            }
                          }}
                        >
                          <input
                            type="text"
                            placeholder={`Responder @${comment.user.username}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            autoFocus
                          />
                          <button type="submit" className="img-dialog__send-btn" disabled={!replyText.trim() || !onAddReply}>
                            <Send size={14} />
                          </button>
                        </form>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form className="img-dialog__comment-form" onSubmit={handleSubmitComment}>
                <input
                  type="text"
                  placeholder="Adicionar comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="img-dialog__send-btn" disabled={!newComment.trim() || !onAddComment}>
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* Related Images */}
          <RelatedImagesSection imageId={image.id} />
        </div>
      </div>
    </div>,
    document.body,
  );
};

function RelatedImagesSection({ imageId }: { imageId: number }) {
  const [related, setRelated] = useState<{ image: ImageRecord; similarity_score: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    imagesApi.fetchRelatedImages(imageId, 6)
      .then((data) => setRelated(data.results))
      .catch(() => setRelated([]))
      .finally(() => setLoading(false));
  }, [imageId]);

  if (loading) return null;
  if (related.length === 0) return null;

  return (
    <div className="img-dialog__related" style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
      <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-sec)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Sparkles size={14} />
        Imagens relacionadas
      </h4>
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }} className="no-scrollbar">
        {related.map(({ image: relImg }) => (
          <img
            key={relImg.id}
            src={relImg.image_url || ''}
            alt={relImg.prompt || ''}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              cursor: 'pointer',
              flexShrink: 0,
              border: '1px solid var(--color-border)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLImageElement).style.opacity = '0.8'; }}
            onMouseLeave={(e) => { (e.target as HTMLImageElement).style.opacity = '1'; }}
          />
        ))}
      </div>
    </div>
  );
}
