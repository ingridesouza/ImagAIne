# ImagAIne - Plano de Desenvolvimento

Este documento descreve o plano de desenvolvimento, as funcionalidades implementadas e os próximos passos para a plataforma ImagAIne.

## Fase 1: Perfis de Usuário, Planos e Admin (Concluída)

Nesta fase, o foco foi enriquecer a experiência do usuário, introduzir um sistema de monetização básico e melhorar a capacidade de gerenciamento da plataforma.

-   **[X] Modelos de Dados Aprimorados**
    -   **O que:** Extensão do modelo `User` para incluir campos de perfil (foto, bio, redes sociais) e controle de assinatura (plano, contagem de uso, data de reset).
    -   **Status:** `Concluído`

-   **[X] API de Perfil de Usuário**
    -   **O que:** Implementação de endpoints para que os usuários possam visualizar (`GET /api/users/me/`) e editar (`PATCH /api/users/me/`) seus perfis.
    -   **Status:** `Concluído`

-   **[X] Sistema de Planos e Assinaturas**
    -   **O que:** Criação de um sistema com dois níveis de plano (`Free` e `Premium`) e um endpoint para upgrade (`POST /api/subscription/upgrade/`).
    -   **Status:** `Concluído`

-   **[X] Controle de Limites de Geração**
    -   **O que:** Integração da lógica de controle de uso na API de geração de imagens (`POST /api/generate/`), impondo limites mensais baseados no plano do usuário.
    -   **Status:** `Concluído`

-   **[X] Reset Mensal Automático**
    -   **O que:** Criação de uma tarefa agendada (Celery Beat) para resetar o contador de imagens de todos os usuários no primeiro dia de cada mês.
    -   **Status:** `Concluído`

-   **[X] Melhorias na Galeria Pública**
    -   **O que:** Atualização da API da galeria para exibir o nome completo do autor da imagem.
    -   **Status:** `Concluído`

-   **[X] Aprimoramento do Painel de Administração**
    -   **O que:** Instalação e configuração do `django-admin-interface` para uma UI de admin moderna. Personalização das visualizações dos modelos `User` e `Image` para facilitar o gerenciamento.
    -   **Status:** `Concluído`

## Fase 2: Próximos Passos e Melhorias Futuras

-   **Integração com Gateway de Pagamento (Prioridade: Alta)**
    -   **O que:** Substituir o endpoint de upgrade de plano por uma integração real com um serviço de pagamento como Stripe ou Mercado Pago para automatizar a cobrança.
    -   **Status:** `Pendente`

-   **Desenvolvimento do Frontend (Prioridade: Alta)**
    -   **O que:** Construir a interface do usuário com um framework moderno (ex: React, Vue, Svelte) para consumir a API do Django.
    -   **Status:** `Pendente`

-   **Notificações para Usuários (Prioridade: Média)**
    -   **O que:** Implementar um sistema de notificações para avisar os usuários quando o limite de imagens estiver próximo ou quando o contador for resetado.
    -   **Status:** `Pendente`
