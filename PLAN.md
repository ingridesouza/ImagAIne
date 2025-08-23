# ImagAIne - Plano de Retomada e Testes Finais

Este documento descreve os passos necessários para validar a implementação da arquitetura de multi-agentes (Analisador de Prompt, Crítico de Imagem e Sistema de Retentativa) assim que o acesso à API de geração de imagens for restabelecido.

## Passos para Validação

1.  **Resolver Acesso à API (Prioridade: Alta)**
    *   **O que:** Restaurar a capacidade de gerar imagens via API da Hugging Face.
    *   **Como:** Aguardar a renovação mensal dos créditos gratuitos ou fazer upgrade para um plano pago (PRO).
    *   **Status:** `Pendente`

2.  **Teste de Sucesso de Ponta a Ponta (Prioridade: Alta)**
    *   **O que:** Validar que o fluxo completo funciona sem erros.
    *   **Como:**
        1.  Reiniciar o worker do Docker: `docker compose restart worker`.
        2.  Monitorar os logs: `docker compose logs -f worker`.
        3.  Solicitar a geração de uma imagem com um prompt válido.
    *   **Resultado Esperado:** A imagem é gerada, o `Agente Crítico` a valida com sucesso (`Validation PASSED`), e a tarefa é concluída (`TASK_SUCCESS`) sem retentativas.
    *   **Status:** `Pendente`

3.  **Teste do Mecanismo de Retentativa (Prioridade: Média)**
    *   **O que:** Garantir que o sistema de retentativa funciona quando o `Agente Crítico` reprova uma imagem.
    *   **Como:**
        1.  Modificar temporariamente o `backend/agents/critic_agent.py` para que o método `validate_image` sempre retorne `False`.
        2.  Reiniciar o worker e solicitar uma nova imagem.
    *   **Resultado Esperado:** Os logs devem mostrar a imagem sendo reprovada, a tarefa sendo reenfileirada, e o contador de tentativas (`retry_count`) sendo incrementado até o limite de `MAX_RETRIES`, quando a imagem é marcada como `FAILED`.
    *   **Status:** `Pendente`

4.  **Limpeza Final (Prioridade: Baixa)**
    *   **O que:** Restaurar o `Agente Crítico` ao seu estado normal.
    *   **Como:** Reverter a modificação feita no passo 3, garantindo que `validate_image` retorne `True` para imagens válidas.
    *   **Status:** `Pendente`
