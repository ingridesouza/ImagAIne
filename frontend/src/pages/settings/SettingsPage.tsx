import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store';
import { authApi } from '@/features/auth/api';
import { QUERY_KEYS } from '@/lib/constants';
import { Eye, EyeOff } from 'lucide-react';

type AspectOption = '1:1' | '16:9' | '9:16' | '21:9';

const MODEL_OPTIONS = [
  'FLUX.1-dev (Padrão)',
];

const ASPECT_OPTIONS: { value: AspectOption; label: string; shape: 'square' | 'landscape' | 'portrait' }[] = [
  { value: '1:1', label: '1:1 Quadrado', shape: 'square' },
  { value: '16:9', label: '16:9 Paisagem', shape: 'landscape' },
  { value: '9:16', label: '9:16 Retrato', shape: 'portrait' },
  { value: '21:9', label: '21:9 Cinema', shape: 'landscape' },
];

type ChangePasswordForm = {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
};

export const SettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const pwForm = useForm<ChangePasswordForm>();

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordForm) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso.');
      setShowChangePassword(false);
      pwForm.reset();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || 'Erro ao alterar senha.');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (password: string) => authApi.deleteAccount({ password }),
    onSuccess: () => {
      toast.success('Conta deletada.');
      logout();
      navigate('/login');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || 'Erro ao deletar conta.');
    },
  });

  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [aspect, setAspect] = useState<AspectOption>('1:1');
  const [autoUpscale, setAutoUpscale] = useState(true);
  const [emailDone, setEmailDone] = useState(true);
  const [news, setNews] = useState(false);
  const [publicMode, setPublicMode] = useState(true);
  const queryClient = useQueryClient();

  useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: () => authApi.fetchProfile(),
  });

  const { data: prefsData } = useQuery<Record<string, unknown>>({
    queryKey: ['preferences'],
    queryFn: () => authApi.fetchPreferences(),
  });

  const saveMutation = useMutation({
    mutationFn: (prefs: Record<string, unknown>) => authApi.updatePreferences(prefs),
    onSuccess: (data) => {
      queryClient.setQueryData(['preferences'], data);
    },
  });

  const fullName = useMemo(() => {
    if (!user) return 'Usuário';
    const name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
    return name || user.username || 'Usuário';
  }, [user]);

  useMemo(() => {
    const prefs = prefsData ?? {};
    setSelectedModel((prefs?.model as string) || MODEL_OPTIONS[0]);
    setAspect((prefs?.aspect as AspectOption) || '1:1');
    setAutoUpscale(prefs?.autoUpscale === undefined ? true : Boolean(prefs.autoUpscale));
    setEmailDone(prefs?.emailDone === undefined ? true : Boolean(prefs.emailDone));
    setNews(Boolean(prefs?.news));
    setPublicMode(prefs?.publicMode === undefined ? true : Boolean(prefs.publicMode));
  }, [prefsData]);

  if (!user) return null;

  const handleSave = () => {
    const prefs = {
      selectedModel,
      aspect,
      autoUpscale,
      emailDone,
      news,
      publicMode,
      model: selectedModel,
    };
    saveMutation.mutate(prefs);
  };

  return (
    <div className="flex min-h-full flex-col bg-body text-fg">
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-5xl space-y-8 pb-16">
          <header className="pb-6 pt-2">
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="mt-1 text-base text-fg-muted">Gerencie sua conta e preferências.</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">Conta</h2>
            <div className="rounded-2xl bg-white dark:bg-white/[0.04] p-6 shadow-sm">
              <div className="mb-8 flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
                <div className="flex items-center gap-5">
                  <div className="group relative cursor-pointer">
                    <div className="h-24 w-24 rounded-full border-4 border-body bg-cover bg-center shadow-md bg-surface">
                      <span className="flex h-full w-full items-center justify-center text-xl font-bold text-accent">
                        {fullName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="material-symbols-outlined text-fg">edit</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{fullName}</h3>
                    <p className="text-fg-sec">{user.email}</p>
                    <span className="mt-2 inline-flex items-center rounded-full border border-accent/20 bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                      {user.is_verified ? 'Plano Pro' : 'Plano Free'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="h-11 w-full rounded-full border border-border bg-body px-6 text-sm font-semibold transition-colors hover:border-accent md:w-auto"
                >
                  {showChangePassword ? 'Cancelar' : 'Alterar senha'}
                </button>
              </div>

              {showChangePassword && (
                <form
                  onSubmit={pwForm.handleSubmit((data) => changePasswordMutation.mutate(data))}
                  className="mb-6 space-y-4 rounded-xl border border-border bg-body p-5"
                >
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fg-sec">Senha atual</label>
                    <div className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        className="form-input h-11 w-full rounded-lg border border-border bg-inset px-4 text-fg focus:border-accent focus:ring-0"
                        {...pwForm.register('current_password', { required: 'Obrigatório' })}
                      />
                      <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted">
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {pwForm.formState.errors.current_password && <p className="mt-1 text-xs text-danger">{pwForm.formState.errors.current_password.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fg-sec">Nova senha</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-input h-11 w-full rounded-lg border border-border bg-inset px-4 text-fg focus:border-accent focus:ring-0"
                      placeholder="Mínimo 8 caracteres"
                      {...pwForm.register('new_password', { required: 'Obrigatório', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                    />
                    {pwForm.formState.errors.new_password && <p className="mt-1 text-xs text-danger">{pwForm.formState.errors.new_password.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fg-sec">Confirmar nova senha</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-input h-11 w-full rounded-lg border border-border bg-inset px-4 text-fg focus:border-accent focus:ring-0"
                      {...pwForm.register('new_password_confirm', {
                        required: 'Obrigatório',
                        validate: (val) => val === pwForm.watch('new_password') || 'As senhas não coincidem',
                      })}
                    />
                    {pwForm.formState.errors.new_password_confirm && <p className="mt-1 text-xs text-danger">{pwForm.formState.errors.new_password_confirm.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-fg-inv transition-colors hover:bg-accent-hover disabled:opacity-50"
                  >
                    {changePasswordMutation.isPending ? 'Alterando...' : 'Confirmar alteração'}
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-fg-sec">Nome de usuário</span>
                  <input
                    className="form-input h-12 w-full rounded-lg border border-border bg-body px-4 text-fg placeholder:text-fg-muted focus:border-accent focus:ring-0"
                    type="text"
                    value={user.username}
                    readOnly
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-fg-sec">Email principal</span>
                  <input
                    className="form-input h-12 w-full rounded-lg border border-border bg-body px-4 text-fg placeholder:text-fg-muted focus:border-accent focus:ring-0"
                    type="email"
                    value={user.email}
                    readOnly
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted flex items-center gap-2">
              <span className="material-symbols-outlined text-accent">tune</span>
              Preferências de geração
            </h2>
            <div className="space-y-8 rounded-2xl bg-white dark:bg-white/[0.04] p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">Modelo padrão</h3>
                    <p className="text-sm text-fg-sec">Usado quando nenhum modelo é especificado.</p>
                  </div>
                  <div className="relative min-w-[220px]">
                    <select
                      className="form-select w-full rounded-lg border border-border bg-body py-2.5 pl-4 pr-10 text-fg focus:border-accent focus:ring-0"
                      value={selectedModel}
                      onChange={(event) => setSelectedModel(event.target.value)}
                    >
                      {MODEL_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              <div className="space-y-4">
                <div>
                  <h3 className="mb-1 font-semibold">Proporção padrão</h3>
                  <p className="mb-3 text-sm text-fg-sec">Formato inicial das suas criações.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {ASPECT_OPTIONS.map((option) => (
                    <label key={option.value} className="group cursor-pointer">
                      <input
                        className="peer sr-only"
                        type="radio"
                        name="aspect"
                        value={option.value}
                        checked={aspect === option.value}
                        onChange={() => setAspect(option.value)}
                      />
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-body p-4 transition-all hover:border-border peer-checked:border-accent peer-checked:bg-accent-soft">
                        <div
                          className={`border-2 border-current bg-current/20 ${
                            option.shape === 'square'
                              ? 'h-8 w-8 rounded-sm'
                              : option.shape === 'landscape'
                              ? 'h-6 w-10 rounded-sm'
                              : 'h-10 w-6 rounded-sm'
                          }`}
                        />
                        <span className="text-xs font-semibold text-fg-sec peer-checked:text-accent">
                          {option.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-border" />

              <div className="flex items-center justify-between gap-4">
                <div className="pr-2">
                  <h3 className="font-semibold">Upscaling automático</h3>
                  <p className="text-sm text-fg-sec">Aumentar a resolução das imagens ao gerar.</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={autoUpscale}
                    onChange={(event) => setAutoUpscale(event.target.checked)}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-inset transition-colors peer-checked:bg-accent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent">
                    <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-all peer-checked:translate-x-5" />
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted flex items-center gap-2">
              <span className="material-symbols-outlined text-accent">notifications</span>
              Notificações
            </h2>
            <div className="divide-y divide-border overflow-hidden rounded-2xl bg-white dark:bg-white/[0.04] shadow-sm">
              <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
                <div>
                  <h3 className="font-semibold">Email de geração concluída</h3>
                  <p className="text-sm text-fg-sec">Receba um email quando seus lotes estiverem prontos.</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={emailDone}
                    onChange={(event) => setEmailDone(event.target.checked)}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-inset transition-colors peer-checked:bg-accent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent">
                    <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-all peer-checked:translate-x-5" />
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
                <div>
                  <h3 className="font-semibold">Novidades e recursos</h3>
                  <p className="text-sm text-fg-sec">Fique por dentro das atualizações da plataforma.</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={news}
                    onChange={(event) => setNews(event.target.checked)}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-inset transition-colors peer-checked:bg-accent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent">
                    <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-all peer-checked:translate-x-5" />
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted flex items-center gap-2">
              <span className="material-symbols-outlined text-accent">security</span>
              Privacidade
            </h2>
            <div className="space-y-6 rounded-2xl bg-white dark:bg-white/[0.04] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Modo público</h3>
                  <p className="text-sm text-fg-sec">Suas gerações aparecem na galeria por padrão.</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={publicMode}
                    onChange={(event) => setPublicMode(event.target.checked)}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-inset transition-colors peer-checked:bg-accent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent">
                    <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-all peer-checked:translate-x-5" />
                  </div>
                </label>
              </div>

              <div className="mt-4 border-t border-red-900/30 pt-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-red-400">Zona de perigo</h3>
                <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-red-900/40 bg-red-950/30 p-4 sm:flex-row">
                  <div>
                    <h4 className="font-semibold text-fg">Deletar conta</h4>
                    <p className="text-sm text-fg-sec">
                      Esta ação é irreversível. Todos os seus dados e imagens serão perdidos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    className="whitespace-nowrap rounded-full border border-red-900/50 bg-red-900/30 px-4 py-2 text-sm font-bold text-red-300 transition-colors hover:bg-red-900/50 hover:text-red-200"
                  >
                    {showDeleteConfirm ? 'Cancelar' : 'Deletar minha conta'}
                  </button>
                </div>
                {showDeleteConfirm && (
                  <div className="mt-4 space-y-3 rounded-xl border border-red-900/40 bg-red-950/20 p-4">
                    <p className="text-sm text-fg-sec">
                      Digite sua senha para confirmar. <strong className="text-danger">Todos os seus dados e imagens serão permanentemente deletados.</strong>
                    </p>
                    <input
                      type="password"
                      placeholder="Sua senha"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="form-input h-11 w-full rounded-lg border border-red-900/40 bg-body px-4 text-fg placeholder:text-fg-muted focus:border-danger focus:ring-0"
                    />
                    <button
                      type="button"
                      disabled={!deletePassword || deleteAccountMutation.isPending}
                      onClick={() => deleteAccountMutation.mutate(deletePassword)}
                      className="w-full rounded-full bg-danger py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleteAccountMutation.isPending ? 'Deletando...' : 'Confirmar exclusão permanente'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex flex-col justify-end gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              className="rounded-full border border-border bg-surface px-8 py-3 text-sm font-bold text-fg transition-colors hover:bg-inset"
              onClick={logout}
            >
              Sair
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-bold text-fg transition-colors hover:bg-inset"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-accent px-8 py-3 text-sm font-bold text-fg-inv shadow-lg transition-all hover:-translate-y-0.5 hover:bg-accent-hover"
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
