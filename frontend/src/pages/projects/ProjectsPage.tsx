import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderOpen, Globe, Lock, Image as ImageIcon } from 'lucide-react';
import { imagesApi } from '@/features/images/api';
import type { ProjectRecord } from '@/features/images/types';

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => imagesApi.fetchProjects(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; description?: string }) =>
      imagesApi.createProject(payload),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreate(false);
      setNewTitle('');
      setNewDescription('');
      navigate(`/projects/${project.id}`);
    },
  });

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createMutation.mutate({ title: newTitle.trim(), description: newDescription.trim() });
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-fg">Meus Projetos</h1>
          <p className="m-0 mt-1 text-sm text-fg-muted">
            Organize suas criações em coleções com narrativa.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-fg-inv transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Novo projeto
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-lg font-semibold text-fg">Criar projeto</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Título do projeto"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-border bg-body px-4 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-body px-4 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-inset"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || createMutation.isPending}
                className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-fg-inv transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {createMutation.isPending ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <FolderOpen className="h-16 w-16 text-fg-muted" />
          <h2 className="text-lg font-medium text-fg">Nenhum projeto ainda</h2>
          <p className="max-w-sm text-sm text-fg-muted">
            Projetos organizam suas imagens em coleções com ordem e narrativa. Crie seu primeiro!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
};

function ProjectCard({ project }: { project: ProjectRecord }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-accent/40 hover:shadow-md"
    >
      <div className="relative h-32 bg-inset">
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-fg-muted" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          {project.is_public ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-body/80 px-2 py-0.5 text-[10px] font-medium text-fg-sec backdrop-blur-sm">
              <Globe className="h-3 w-3" /> Público
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-body/80 px-2 py-0.5 text-[10px] font-medium text-fg-muted backdrop-blur-sm">
              <Lock className="h-3 w-3" /> Privado
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-fg group-hover:text-accent">{project.title}</h3>
        {project.description && (
          <p className="mt-1 text-xs text-fg-muted line-clamp-2">{project.description}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-fg-muted">
          <span>{project.image_count} {project.image_count === 1 ? 'imagem' : 'imagens'}</span>
        </div>
      </div>
    </Link>
  );
}
