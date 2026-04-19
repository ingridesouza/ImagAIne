import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Plus, Sparkles, Loader2, Wand2, Image, Palette, Zap } from 'lucide-react';
import { imagesApi } from '@/features/images/api';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  image: number | null;
  image_url: string | null;
  prompt_used: string;
  created_at: string;
};

const QUICK_PROMPTS = [
  { icon: Wand2, label: 'Retrato artístico', prompt: 'Crie um retrato artístico com iluminação dramática' },
  { icon: Image, label: 'Paisagem fantástica', prompt: 'Uma paisagem de mundo fantástico com montanhas flutuantes' },
  { icon: Palette, label: 'Arte abstrata', prompt: 'Arte abstrata vibrante com formas geométricas e cores vivas' },
  { icon: Zap, label: 'Cyberpunk', prompt: 'Cena cyberpunk com neon e chuva em uma megacidade futurista' },
];

export const ChatPage = () => {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => imagesApi.fetchSessions(),
  });

  const { data: currentSession } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => imagesApi.fetchSession(sessionId!),
    enabled: !!sessionId,
  });

  const messages: ChatMessage[] = currentSession?.messages ?? [];

  const createMutation = useMutation({
    mutationFn: () => imagesApi.createSession(),
    onSuccess: (session: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      navigate(`/chat/${session.id}`);
    },
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => imagesApi.sendMessage(sessionId!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setInput('');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, sendMutation.isPending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [sessionId]);

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    if (!sessionId) {
      createMutation.mutate();
      return;
    }
    sendMutation.mutate(input.trim());
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    if (!sessionId) {
      createMutation.mutate();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeSessions = (sessions ?? []).filter((s) => s.status === 'active');

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Sessions panel — glassmorphism */}
      <div className="hidden w-72 flex-shrink-0 border-r border-white/10 dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl md:flex md:flex-col">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-fg-muted">Sessões</span>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="flex size-8 items-center justify-center rounded-xl text-fg-muted transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-accent"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {activeSessions.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-fg-muted">Nenhuma sessão ainda</p>
          ) : (
            <div className="flex flex-col gap-1">
              {activeSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/chat/${session.id}`}
                  className={`block rounded-xl px-3 py-2.5 transition-all duration-200 ${
                    session.id === sessionId
                      ? 'bg-black/[0.06] dark:bg-white/[0.08] text-fg shadow-sm'
                      : 'text-fg-sec hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="block truncate text-sm font-medium">{session.title}</span>
                  <span className="block text-[10px] text-fg-muted mt-0.5">{session.message_count} mensagens</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {!sessionId ? (
          /* Welcome state — Apple-inspired centered hero */
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
            {/* Glowing icon */}
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-flow-500/20 blur-2xl" />
              <div className="relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-flow-500 to-flow-700 shadow-xl shadow-flow-500/30">
                <Sparkles className="h-9 w-9 text-white" />
              </div>
            </div>

            <div className="text-center max-w-lg">
              <h1 className="text-3xl font-bold tracking-tight text-fg">
                O que vamos criar?
              </h1>
              <p className="mt-3 text-base text-fg-muted leading-relaxed">
                Descreva sua ideia em linguagem natural. Eu vou refinar, sugerir e gerar a imagem perfeita para você.
              </p>
            </div>

            {/* Quick prompts — card grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="group flex items-center gap-3 rounded-2xl bg-white dark:bg-white/[0.04] p-4 text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-flow-50 dark:bg-flow-900/30 transition-colors group-hover:bg-flow-100 dark:group-hover:bg-flow-800/40">
                    <Icon className="h-5 w-5 text-flow-600 dark:text-flow-400" />
                  </div>
                  <span className="text-sm font-medium text-fg">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
                    {/* Agent avatar */}
                    {msg.role === 'assistant' && (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-flow-500 to-flow-700 shadow-sm mt-0.5">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-accent text-white rounded-br-md'
                          : 'bg-white dark:bg-white/[0.06] shadow-sm text-fg rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>

                      {/* Generated image — with glow */}
                      {msg.image_url && (
                        <div className="mt-3 overflow-hidden rounded-xl shadow-lg">
                          <img
                            src={msg.image_url}
                            alt={msg.prompt_used || 'Imagem gerada'}
                            className="w-full max-h-80 object-contain bg-black/5 dark:bg-white/5"
                          />
                        </div>
                      )}
                      {msg.prompt_used && (
                        <p className="mt-2 text-[11px] text-fg-muted/60 italic leading-relaxed">
                          {msg.prompt_used.slice(0, 120)}{msg.prompt_used.length > 120 ? '...' : ''}
                        </p>
                      )}
                      {msg.image && !msg.image_url && (
                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-flow-50 dark:bg-flow-900/20 px-4 py-3">
                          <div className="relative">
                            <div className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
                            <Loader2 className="relative h-4 w-4 animate-spin text-accent" />
                          </div>
                          <span className="text-xs font-medium text-fg-sec">Gerando sua imagem...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {sendMutation.isPending && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-flow-500 to-flow-700 shadow-sm">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-bl-md bg-white dark:bg-white/[0.06] shadow-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="size-2 rounded-full bg-fg-muted/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="size-2 rounded-full bg-fg-muted/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="size-2 rounded-full bg-fg-muted/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input — floating, glassmorphism */}
        <div className="px-4 py-4">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-end gap-3 rounded-2xl bg-white dark:bg-white/[0.06] shadow-lg p-2 border border-white/20 dark:border-white/[0.08]">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Descreva o que quer criar..."
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted/50 focus:outline-none"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sendMutation.isPending}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-accent to-flow-700 text-white shadow-sm shadow-accent/25 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
