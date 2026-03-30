import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UseFormReturn } from 'react-hook-form';
import type { WizardFormData } from '../types';
import { WIZARD_STEPS } from '../constants';

type WizardReviewProps = {
  form: UseFormReturn<WizardFormData>;
  getStepValue: (stepIndex: number) => string;
  goToStep: (step: number) => void;
  onBack: () => void;
  onRefine: () => Promise<void>;
  isRefining: boolean;
  refinedPrompt: string | null;
  setRefinedPrompt: (prompt: string | null) => void;
  negativePrompt: string | null;
  composeDescription: (values: WizardFormData) => string;
  refineError: Error | null;
};

export const WizardReview = ({
  form,
  getStepValue,
  goToStep,
  onBack,
  onRefine,
  isRefining,
  refinedPrompt,
  setRefinedPrompt,
  negativePrompt,
  composeDescription,
  refineError,
}: WizardReviewProps) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    if (refinedPrompt) {
      await navigator.clipboard.writeText(refinedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateNow = () => {
    navigate('/generate', {
      state: {
        prompt: refinedPrompt,
        negative_prompt: negativePrompt,
        autoGenerate: true,
      },
    });
  };

  const handleUsePrompt = () => {
    navigate('/generate', {
      state: {
        prompt: refinedPrompt,
        negative_prompt: negativePrompt,
      },
    });
  };

  const composedDescription = composeDescription(form.getValues());

  const stepsWithValues = WIZARD_STEPS.slice(0, -1).map((step, index) => ({
    ...step,
    index,
    value: getStepValue(index),
  }));

  return (
    <div className="wizard__step wizard__review">
      <div className="wizard__step-header">
        <h2 className="wizard__step-question">Revise sua criacao</h2>
        <p className="wizard__step-subtitle">
          Confira suas escolhas e gere o prompt otimizado
        </p>
      </div>

      {/* Choices as chips */}
      <div className="wizard__review-chips">
        {stepsWithValues.map((step) => (
          <button
            key={step.id}
            type="button"
            className={`wizard__review-chip ${step.value ? 'wizard__review-chip--filled' : 'wizard__review-chip--empty'}`}
            onClick={() => goToStep(step.index)}
          >
            <span className="wizard__review-chip-label">{step.title}</span>
            <span className="wizard__review-chip-value">
              {step.value || 'Nao definido'}
            </span>
            <span className="material-symbols-outlined wizard__review-chip-edit">edit</span>
          </button>
        ))}
      </div>

      {/* Additional details */}
      <div className="wizard__additional">
        <label className="wizard__additional-label">
          <span className="material-symbols-outlined">add_notes</span>
          Detalhes adicionais (opcional)
        </label>
        <textarea
          className="wizard__additional-field"
          placeholder="Adicione detalhes extras que deseja na imagem..."
          rows={3}
          {...form.register('additionalDetails')}
        />
      </div>

      {/* Preview */}
      <div className="wizard__preview">
        <label className="wizard__preview-label">
          <span className="material-symbols-outlined">preview</span>
          Descricao composta
        </label>
        <p className="wizard__preview-text">{composedDescription}</p>
      </div>

      {/* Error */}
      {refineError && (
        <div className="wizard__error">
          <span className="material-symbols-outlined">error</span>
          <span>Erro ao gerar prompt. Tente novamente.</span>
        </div>
      )}

      {/* Refine button */}
      {!refinedPrompt && (
        <button
          type="button"
          className="wizard__refine-btn"
          onClick={onRefine}
          disabled={isRefining}
        >
          {isRefining ? (
            <>
              <span className="wizard__refine-spinner" />
              Criando prompt otimizado...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">auto_awesome</span>
              Criar Prompt Otimizado
            </>
          )}
        </button>
      )}

      {/* Refined result */}
      {refinedPrompt && (
        <div className="wizard__result">
          <div className="wizard__result-header">
            <span className="material-symbols-outlined">check_circle</span>
            <span>Prompt Otimizado</span>
          </div>

          <div className="wizard__result-box">
            {isEditing ? (
              <textarea
                className="wizard__result-edit"
                value={refinedPrompt}
                onChange={(e) => setRefinedPrompt(e.target.value)}
                rows={4}
                autoFocus
              />
            ) : (
              <p className="wizard__result-text">{refinedPrompt}</p>
            )}
            <div className="wizard__result-actions">
              <button
                type="button"
                className="wizard__result-action"
                onClick={() => setIsEditing(!isEditing)}
              >
                <span className="material-symbols-outlined">
                  {isEditing ? 'check' : 'edit'}
                </span>
                {isEditing ? 'Salvar' : 'Editar'}
              </button>
              <button
                type="button"
                className="wizard__result-action"
                onClick={handleCopy}
              >
                <span className="material-symbols-outlined">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {negativePrompt && (
            <div className="wizard__result-negative">
              <span className="wizard__result-negative-label">Prompt Negativo</span>
              <span className="wizard__result-negative-text">{negativePrompt}</span>
            </div>
          )}

          <div className="wizard__result-buttons">
            <button
              type="button"
              className="wizard__nav-btn wizard__nav-btn--back"
              onClick={handleUsePrompt}
            >
              <span className="material-symbols-outlined">tune</span>
              Ajustar e Gerar
            </button>
            <button
              type="button"
              className="wizard__nav-btn wizard__nav-btn--next wizard__nav-btn--generate"
              onClick={handleGenerateNow}
            >
              <span className="material-symbols-outlined">bolt</span>
              Gerar Imagem Agora
            </button>
          </div>
        </div>
      )}

      {/* Back navigation */}
      {!refinedPrompt && (
        <div className="wizard__nav">
          <button type="button" className="wizard__nav-btn wizard__nav-btn--back" onClick={onBack}>
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar
          </button>
        </div>
      )}
    </div>
  );
};
