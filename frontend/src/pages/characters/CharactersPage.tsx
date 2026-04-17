import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Image as ImageIcon } from 'lucide-react';
import { imagesApi } from '@/features/images/api';

export const CharactersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: characters, isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => imagesApi.fetchCharacters(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      imagesApi.createCharacter(payload),
    onSuccess: (character: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      setShowCreate(false);
      setName('');
      setDescription('');
      navigate(`/characters/${character.id}`);
    },
  });

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-fg">Meus Personagens</h1>
          <p className="m-0 mt-1 text-sm text-fg-muted">
            Crie personagens reutilizáveis para gerar imagens consistentes.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-fg-inv transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Novo personagem
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-lg font-semibold text-fg">Criar personagem</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome do personagem"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-border bg-body px-4 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <textarea
              placeholder="Descrição (aparência, estilo, personalidade...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-body px-4 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreate(false)} className="rounded-full border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-inset">Cancelar</button>
              <button
                onClick={() => { if (name.trim()) createMutation.mutate({ name: name.trim(), description: description.trim() }); }}
                disabled={!name.trim() || createMutation.isPending}
                className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-fg-inv hover:bg-accent-hover disabled:opacity-50"
              >
                {createMutation.isPending ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-surface" />)}
        </div>
      ) : !characters || characters.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Users className="h-16 w-16 text-fg-muted" />
          <h2 className="text-lg font-medium text-fg">Nenhum personagem ainda</h2>
          <p className="max-w-sm text-sm text-fg-muted">
            Personagens permitem gerar múltiplas cenas mantendo aparência consistente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((char) => (
            <Link
              key={char.id}
              to={`/characters/${char.id}`}
              className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-accent/40 hover:shadow-md"
            >
              <div className="relative h-28 bg-inset">
                {char.thumbnail_url ? (
                  <img src={char.thumbnail_url} alt={char.name} className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-fg-muted" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-fg group-hover:text-accent">{char.name}</h3>
                {char.description && <p className="mt-1 text-xs text-fg-muted line-clamp-2">{char.description}</p>}
                <div className="mt-3 flex items-center gap-3 text-xs text-fg-muted">
                  <span>{char.reference_count} refs</span>
                  <span>{char.generation_count} gerações</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
