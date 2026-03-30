import { toast } from 'sonner';

export const notifications = {
  /**
   * Notifica quando uma imagem entra na fila de processamento
   */
  imageQueued: (prompt: string) => {
    toast.info('Imagem na fila', {
      description: prompt.length > 60 ? prompt.slice(0, 60) + '...' : prompt,
      duration: 4000,
    });
  },

  /**
   * Notifica quando uma imagem fica pronta
   */
  imageReady: (_imageId: number, onView?: () => void) => {
    toast.success('Sua imagem esta pronta!', {
      description: 'Clique para visualizar sua criacao',
      action: onView
        ? {
            label: 'Ver agora',
            onClick: onView,
          }
        : undefined,
      duration: 8000,
    });
  },

  /**
   * Notifica quando ha erro na geracao
   */
  imageError: (prompt: string) => {
    toast.error('Erro na geracao', {
      description: `Nao foi possivel gerar: ${prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt}`,
      duration: 6000,
    });
  },

  /**
   * Notificacoes genericas
   */
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },

  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },

  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },
};
