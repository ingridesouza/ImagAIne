import { useState, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { WizardStepConfig, WizardFormData } from '../types';
import { WizardOptionCard } from './WizardOptionCard';

type WizardStepProps = {
  stepConfig: WizardStepConfig;
  form: UseFormReturn<WizardFormData>;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
};

export const WizardStep = ({
  stepConfig,
  form,
  onNext,
  onBack,
  isFirst,
  isLast,
  canProceed,
}: WizardStepProps) => {
  const [showCustomInput, setShowCustomInput] = useState(false);

  const selectedValue = form.watch(stepConfig.fieldName);
  const customValue = stepConfig.customFieldName
    ? form.watch(stepConfig.customFieldName)
    : '';

  useEffect(() => {
    // Se tem valor customizado, mostra o input
    if (customValue) {
      setShowCustomInput(true);
    }
  }, [customValue]);

  const handleOptionSelect = (value: string) => {
    form.setValue(stepConfig.fieldName, value);
    // Limpa valor customizado quando seleciona opcao
    if (stepConfig.customFieldName) {
      form.setValue(stepConfig.customFieldName, '');
    }
    setShowCustomInput(false);
  };

  const handleCustomClick = () => {
    setShowCustomInput(true);
    form.setValue(stepConfig.fieldName, '');
  };

  const handleSkip = () => {
    form.setValue(stepConfig.fieldName, '');
    if (stepConfig.customFieldName) {
      form.setValue(stepConfig.customFieldName, '');
    }
    onNext();
  };

  return (
    <div className="wizard__step">
      <h2 className="wizard__step-question">{stepConfig.question}</h2>
      {!stepConfig.required && (
        <p className="wizard__step-subtitle">
          Esta etapa e opcional.{' '}
          <button type="button" className="wizard__skip-link" onClick={handleSkip}>
            Pular
          </button>
        </p>
      )}

      <div className="wizard__options">
        {stepConfig.options.map((option) => (
          <WizardOptionCard
            key={option.value}
            option={option}
            isSelected={selectedValue === option.value && !customValue}
            onSelect={handleOptionSelect}
          />
        ))}
      </div>

      {stepConfig.allowCustom && (
        <div className="wizard__custom-input">
          {!showCustomInput ? (
            <button
              type="button"
              className="wizard__custom-trigger"
              onClick={handleCustomClick}
            >
              <span className="material-symbols-outlined">edit</span>
              <span>Outro (descreva)</span>
            </button>
          ) : (
            <div className="wizard__custom-field-wrapper">
              <label className="wizard__custom-label">
                <span className="material-symbols-outlined">edit</span>
                Descreva com suas palavras:
              </label>
              <input
                type="text"
                className="wizard__custom-field"
                placeholder={`Ex: ${stepConfig.options[0]?.label.toLowerCase() || 'descreva aqui'}...`}
                {...form.register(stepConfig.customFieldName as keyof WizardFormData)}
                autoFocus
              />
              <button
                type="button"
                className="wizard__custom-cancel"
                onClick={() => {
                  setShowCustomInput(false);
                  if (stepConfig.customFieldName) {
                    form.setValue(stepConfig.customFieldName, '');
                  }
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      <div className="wizard__nav">
        {!isFirst && (
          <button type="button" className="wizard__nav-btn wizard__nav-btn--back" onClick={onBack}>
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar
          </button>
        )}
        <button
          type="button"
          className="wizard__nav-btn wizard__nav-btn--next"
          onClick={onNext}
          disabled={stepConfig.required && !canProceed}
        >
          {isLast ? 'Revisar' : 'Proximo'}
          <span className="material-symbols-outlined">
            {isLast ? 'check' : 'arrow_forward'}
          </span>
        </button>
      </div>
    </div>
  );
};
