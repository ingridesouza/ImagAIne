import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Globe, Lock, Trash2, Image as ImageIcon,
  Plus, GripVertical, LayoutGrid, List, Share2,
} from 'lucide-react';
import { imagesApi } from '@/features/images/api';
import type { ImageRecord } from '@/features/images/types';

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'storyboard'>('grid');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showAddImage, setShowAddImage] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => imagesApi.fetchProject(id!),
    enabled: !!id,
  });

  const { data: myImages } = useQuery({
    queryKey: ['my-images-picker'],
    queryFn: () => imagesApi.fetchMyImages(),
    enabled: showAddImage,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<{ title: string; description: string; is_public: boolean }>) =>
      imagesApi.updateProject(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsEditing(false);
      toast.success('Projeto atualizado.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => imagesApi.deleteProject(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
      toast.success('Projeto deletado.');
    },
  });

  const addImageMutation = useMutation({
    mutationFn: (imageId: number) => imagesApi.addImageToProject(id!, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Imagem adicionada.');
    },
  });

  const removeImageMutation = useMutation({
    mutationFn: (imageId: number) => imagesApi.removeImageFromProject(id!, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  if (isLoading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="h-48 animate-pulse rounded-2xl bg-surface" />
        <div className="mt-4 h-8 w-64 animate-pulse rounded-lg bg-surface" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="flex flex-col items-center gap-4 py-20 text-center">
        <h2 className="text-lg font-medium text-fg">Projeto não encontrado</h2>
        <Link to="/projects" className="text-sm text-accent hover:text-accent-hover">
          Voltar para projetos
        </Link>
      </section>
    );
  }

  const startEdit = () => {
    setEditTitle(project.title);
    setEditDescription(project.description);
    setIsEditing(true);
  };

  const existingImageIds = new Set(project.images.map((pi) => pi.image.id));
  const availableImages = myImages?.results.filter(
    (img: ImageRecord) => img.status === 'READY' && !existingImageIds.has(img.id)
  ) ?? [];

  return (
    <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      {/* Header */}
      <div className="mb-6">
        <Link to="/projects" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-fg-muted hover:text-fg transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Projetos
        </Link>

        {/* Cover */}
        <div className="relative mb-4 h-32 overflow-hidden rounded-2xl bg-inset sm:h-40">
          {project.cover_image_url ? (
            <img src={project.cover_image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-fg-muted" />
            </div>
          )}
        </div>

        {/* Title + actions */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-body px-3 py-2 text-xl font-semibold text-fg focus:border-accent focus:outline-none"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-body px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-fg hover:bg-inset">Cancelar</button>
                  <button
                    onClick={() => updateMutation.mutate({ title: editTitle, description: editDescription })}
                    className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-fg-inv hover:bg-accent-hover"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-semibold tracking-tight text-fg">{project.title}</h1>
                {project.description && <p className="mt-1 text-sm text-fg-sec">{project.description}</p>}
                <div className="mt-2 flex items-center gap-3 text-xs text-fg-muted">
                  <span>@{project.user.username}</span>
                  <span>{project.image_count} {project.image_count === 1 ? 'imagem' : 'imagens'}</span>
                  <span className="inline-flex items-center gap-1">
                    {project.is_public ? <><Globe className="h-3 w-3" /> Público</> : <><Lock className="h-3 w-3" /> Privado</>}
                  </span>
                </div>
              </>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-2">
              <button onClick={startEdit} className="rounded-full border border-border px-4 py-2 text-xs font-medium text-fg transition-colors hover:bg-inset">Editar</button>
              <button
                onClick={() => updateMutation.mutate({ is_public: !project.is_public })}
                className="rounded-full border border-border px-4 py-2 text-xs font-medium text-fg transition-colors hover:bg-inset"
              >
                <Share2 className="mr-1 inline h-3 w-3" />
                {project.is_public ? 'Tornar privado' : 'Publicar'}
              </button>
              <button
                onClick={() => { if (confirm('Deletar este projeto?')) deleteMutation.mutate(); }}
                className="rounded-full border border-danger/30 px-3 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border border-border p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'grid' ? 'bg-accent text-fg-inv' : 'text-fg-muted hover:text-fg'}`}
          >
            <LayoutGrid className="mr-1 inline h-3.5 w-3.5" /> Grid
          </button>
          <button
            onClick={() => setViewMode('storyboard')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'storyboard' ? 'bg-accent text-fg-inv' : 'text-fg-muted hover:text-fg'}`}
          >
            <List className="mr-1 inline h-3.5 w-3.5" /> Storyboard
          </button>
        </div>
        <button
          onClick={() => setShowAddImage(!showAddImage)}
          className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-xs font-medium text-fg-inv transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar imagem
        </button>
      </div>

      {/* Add image picker */}
      {showAddImage && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
          <h4 className="mb-3 text-sm font-medium text-fg">Selecione uma imagem:</h4>
          {availableImages.length === 0 ? (
            <p className="text-xs text-fg-muted">Nenhuma imagem disponível. Gere imagens primeiro.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {availableImages.slice(0, 20).map((img: ImageRecord) => (
                <button
                  key={img.id}
                  onClick={() => { addImageMutation.mutate(img.id); setShowAddImage(false); }}
                  className="flex-shrink-0 overflow-hidden rounded-lg border border-border transition-all hover:border-accent hover:shadow-md"
                >
                  <img src={img.image_url || ''} alt={img.prompt || ''} className="h-20 w-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Images */}
      {project.images.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ImageIcon className="h-12 w-12 text-fg-muted" />
          <p className="text-sm text-fg-muted">Nenhuma imagem neste projeto ainda.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {project.images.map((pi) => (
            <div key={pi.id} className="group relative overflow-hidden rounded-xl border border-border">
              <img
                src={pi.image.image_url || ''}
                alt={pi.caption || pi.image.prompt || ''}
                className="aspect-square w-full object-cover"
              />
              <button
                onClick={() => removeImageMutation.mutate(pi.image.id)}
                className="absolute right-2 top-2 rounded-full bg-body/80 p-1.5 text-danger opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                title="Remover do projeto"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              {pi.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                  <p className="text-xs text-white line-clamp-2">{pi.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {project.images.map((pi, index) => (
            <div key={pi.id} className="flex gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/30">
              <div className="flex items-center text-fg-muted">
                <GripVertical className="h-5 w-5" />
                <span className="ml-1 w-6 text-center text-xs font-mono">{index + 1}</span>
              </div>
              <img
                src={pi.image.image_url || ''}
                alt={pi.caption || pi.image.prompt || ''}
                className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-fg">{pi.caption || pi.image.prompt || 'Sem descrição'}</p>
                <p className="mt-1 text-xs text-fg-muted">
                  {pi.image.aspect_ratio} — {pi.image.like_count} likes — {pi.image.download_count} downloads
                </p>
              </div>
              <button
                onClick={() => removeImageMutation.mutate(pi.image.id)}
                className="self-start rounded-full p-2 text-fg-muted transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
