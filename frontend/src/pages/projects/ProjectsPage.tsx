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
      className="group block rounded-3xl bg-white dark:bg-white/[0.04] shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
    >
      {/* Folder animation — images peek on hover */}
      <div className="relative h-40 bg-gradient-to-br from-flow-50 to-flow-100 dark:from-flow-950 dark:to-flow-900/50 overflow-hidden">
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {/* Folder icon with peek animation */}
            <div className="relative">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-sm">
                <ImageIcon className="h-7 w-7 text-flow-500" />
              </div>
              {/* Peeking thumbnails */}
              <div className="absolute -right-3 -top-2 size-8 rounded-lg bg-flow-200 dark:bg-flow-800 shadow-sm opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-1 rotate-6" />
              <div className="absolute -left-2 -bottom-2 size-7 rounded-lg bg-flow-300 dark:bg-flow-700 shadow-sm opacity-0 transition-all duration-500 group-hover:opacity-80 group-hover:translate-y-1 group-hover:-translate-x-1 -rotate-3" />
            </div>
          </div>
        )}
        {/* Badge */}
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-black/50 px-2.5 py-1 text-[10px] font-medium text-fg-sec backdrop-blur-md">
            {project.is_public ? <><Globe className="h-3 w-3" /> Público</> : <><Lock className="h-3 w-3" /> Privado</>}
          </span>
        </div>
        {/* Image count pill */}
        <div className="absolute left-3 bottom-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <ImageIcon className="h-3 w-3" />
            {project.image_count}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-sm font-semibold text-fg group-hover:text-accent transition-colors">{project.title}</h3>
        {project.description && (
          <p className="mt-1.5 text-xs text-fg-muted line-clamp-2 leading-relaxed">{project.description}</p>
        )}
      </div>
    </Link>
  );
}
