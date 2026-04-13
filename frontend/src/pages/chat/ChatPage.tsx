import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Plus, Sparkles, Loader2, Image as ImageIcon, MessageSquare } from 'lucide-react';
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

export const ChatPage = () => {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch sessions list
  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => imagesApi.fetchSessions(),
  });

  // Fetch current session
  const { data: currentSession } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => imagesApi.fetchSession(sessionId!),
    enabled: !!sessionId,
  });

  const messages: ChatMessage[] = currentSession?.messages ?? [];

  // Create session
  const createMutation = useMutation({
    mutationFn: () => imagesApi.createSession(),
    onSuccess: (session: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      navigate(`/chat/${session.id}`);
    },
  });

  // Send message
  const sendMutation = useMutation({
    mutationFn: (text: string) => imagesApi.sendMessage(sessionId!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setInput('');
    },
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, sendMutation.isPending]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [sessionId]);

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    if (!sessionId) {
      // Create session then send
      createMutation.mutate();
      return;
    }
    sendMutation.mutate(input.trim());
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
      {/* Sessions sidebar */}
      <div className="hidden w-64 flex-shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <div className="flex items-center justify-between border-b border-border p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Sessões</h3>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-inset hover:text-accent"
            title="Nova sessão"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {activeSessions.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-fg-muted">Nenhuma sessão</p>
          ) : (
            activeSessions.map((session) => (
              <Link
                key={session.id}
                to={`/chat/${session.id}`}
                className={`mb-1 block rounded-lg px-3 py-2.5 text-left transition-colors ${
                  session.id === sessionId
                    ? 'bg-accent-soft text-accent'
                    : 'text-fg-sec hover:bg-inset'
                }`}
              >
                <span className="block truncate text-xs font-medium">{session.title}</span>
                <span className="block text-[10px] text-fg-muted">{session.message_count} msgs</span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {!sessionId ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
            <div className="rounded-full bg-accent-soft p-5">
              <Sparkles className="h-10 w-10 text-accent" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-fg">Agente Criativo</h1>
              <p className="mt-2 max-w-md text-sm text-fg-sec">
                Descreva o que você quer criar. Eu vou te ajudar a refinar a ideia
                e gerar a imagem perfeita.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['Um gato cyberpunk', 'Paisagem fantástica', 'Retrato renascentista', 'Cidade futurista'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    createMutation.mutate();
                  }}
                  className="rounded-full border border-border px-4 py-2 text-xs text-fg-sec transition-colors hover:border-accent hover:text-accent"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-accent text-fg-inv'
                        : 'bg-surface text-fg'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-accent">
                        <Sparkles className="h-3 w-3" /> Agente Criativo
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                    {msg.image_url && (
                      <div className="mt-3">
                        <img
                          src={msg.image_url}
                          alt={msg.prompt_used || 'Imagem gerada'}
                          className="max-h-72 rounded-xl border border-border object-contain"
                        />
                        {msg.prompt_used && (
                          <p className="mt-1.5 text-[10px] text-fg-muted italic">
                            Prompt: {msg.prompt_used.slice(0, 100)}...
                          </p>
                        )}
                      </div>
                    )}
                    {msg.image && !msg.image_url && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-inset px-3 py-2 text-xs text-fg-muted">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Gerando imagem...
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {sendMutation.isPending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-surface px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-fg-muted">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                      Pensando...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border bg-body px-4 py-3">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={sessionId ? 'Descreva o que quer criar...' : 'Comece uma nova conversa...'}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              style={{ maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMutation.isPending}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent text-fg-inv transition-all hover:bg-accent-hover active:scale-95 disabled:opacity-40"
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
  );
};
