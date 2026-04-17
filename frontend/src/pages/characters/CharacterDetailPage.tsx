import { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Trash2, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { imagesApi } from '@/features/images/api';

const STYLES = [
  { value: 'photorealistic', label: 'Fotorrealista' },
  { value: 'anime', label: 'Anime' },
  { value: 'digital_art', label: 'Arte Digital' },
  { value: 'oil_painting', label: 'Pintura a Óleo' },
];

export const CharacterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scene, setScene] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const { data: character, isLoading } = useQuery({
    queryKey: ['character', id],
    queryFn: () => imagesApi.fetchCharacter(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { name?: string; description?: string }) =>
      imagesApi.updateCharacter(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', id] });
      setIsEditing(false);
      toast.success('Personagem atualizado.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => imagesApi.deleteCharacter(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      navigate('/characters');
      toast.success('Personagem deletado.');
    },
  });

  const uploadRefMutation = useMutation({
    mutationFn: (file: File) => imagesApi.uploadCharacterRef(id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', id] });
      toast.success('Referência adicionada.');
    },
    onError: () => toast.error('Erro ao enviar referência.'),
  });

  const removeRefMutation = useMutation({
    mutationFn: (refId: number) => imagesApi.removeCharacterRef(id!, refId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['character', id] }),
  });

  const generateMutation = useMutation({
    mutationFn: () => imagesApi.generateWithCharacter(id!, scene, style),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', id] });
      setScene('');
      toast.success('Cena na fila de geração.');
    },
    onError: () => toast.error('Erro ao gerar cena.'),
  });

  if (isLoading || !character) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="h-32 animate-pulse rounded-2xl bg-surface" />
      </section>
    );
  }

  const startEdit = () => {
    setEditName(character.name);
    setEditDesc(character.description);
    setIsEditing(true);
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10">
      <Link to="/characters" className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Personagens
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border border-border bg-body px-3 py-2 text-xl font-semibold text-fg focus:border-accent focus:outline-none" />
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2}
                className="w-full rounded-lg border border-border bg-body px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none resize-none" />
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-fg hover:bg-inset">Cancelar</button>
                <button onClick={() => updateMutation.mutate({ name: editName, description: editDesc })}
                  className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-fg-inv hover:bg-accent-hover">Salvar</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-fg">{character.name}</h1>
              {character.description && <p className="mt-1 text-sm text-fg-sec">{character.description}</p>}
              {character.style_notes && <p className="mt-1 text-xs text-fg-muted italic">{character.style_notes}</p>}
            </>
          )}
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            <button onClick={startEdit} className="rounded-full border border-border px-4 py-2 text-xs font-medium text-fg hover:bg-inset">Editar</button>
            <button onClick={() => { if (confirm('Deletar este personagem?')) deleteMutation.mutate(); }}
              className="rounded-full border border-danger/30 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* References */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">Imagens de referência</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadRefMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-fg-sec hover:bg-inset"
          >
            {uploadRefMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            Adicionar
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) uploadRefMutation.mutate(e.target.files[0]); e.target.value = ''; }} />
        </div>
        {character.references.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-8">
            <p className="text-xs text-fg-muted">Adicione imagens de referência para melhorar a consistência.</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {character.references.map((ref: { id: number; image_url: string; order: number }) => (
              <div key={ref.id} className="group relative flex-shrink-0">
                <img src={ref.image_url} alt="" className="h-28 w-28 rounded-xl border border-border object-cover" />
                <button
                  onClick={() => removeRefMutation.mutate(ref.id)}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-danger p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate scene */}
      <div className="mb-8 rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-fg">
          <Sparkles className="h-4 w-4 text-accent" />
          Gerar nova cena
        </h2>
        <div className="space-y-3">
          <textarea
            placeholder="Descreva a cena... (ex: em uma cafeteria, olhando pela janela)"
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-body px-4 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none resize-none"
          />
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  style === s.value ? 'border-accent bg-accent-soft text-accent' : 'border-border text-fg-muted hover:border-accent/40'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={!scene.trim() || generateMutation.isPending}
            className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-fg-inv transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Gerando...</>
            ) : (
              'Gerar cena'
            )}
          </button>
        </div>
      </div>

      {/* Generations */}
      {character.generations && character.generations.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-fg">Cenas geradas</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {character.generations.map((gen: { image: { id: number; image_url: string | null; status: string }; scene_description: string }) => (
              <div key={gen.image.id} className="overflow-hidden rounded-xl border border-border">
                {gen.image.status === 'READY' && gen.image.image_url ? (
                  <img src={gen.image.image_url} alt={gen.scene_description} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-surface">
                    {gen.image.status === 'GENERATING' ? (
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-fg-muted" />
                    )}
                  </div>
                )}
                {gen.scene_description && (
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] text-fg-muted line-clamp-2">{gen.scene_description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
