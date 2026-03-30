import { useState, useEffect, useRef } from 'react';
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
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedValue = form.watch(stepConfig.fieldName);
  const customValue = stepConfig.customFieldName
    ? form.watch(stepConfig.customFieldName)
    : '';

  useEffect(() => {
    if (customValue) setShowCustomInput(true);
  }, [customValue]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  const handleOptionSelect = (value: string) => {
    form.setValue(stepConfig.fieldName, value);
    if (stepConfig.customFieldName) {
      form.setValue(stepConfig.customFieldName, '');
    }
    setShowCustomInput(false);

    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => onNext(), 400);
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
        <p className="wizard__step-hint">
          Opcional —{' '}
          <button type="button" className="wizard__skip-link" onClick={handleSkip}>
            pular
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
              <span className="material-symbols-outlined">edit_note</span>
              Descrever manualmente
            </button>
          ) : (
            <div className="wizard__custom-field-wrapper">
              <input
                type="text"
                className="wizard__custom-field"
                placeholder={`Ex: ${stepConfig.options[0]?.label.toLowerCase() || 'descreva aqui'}...`}
                {...form.register(stepConfig.customFieldName as keyof WizardFormData)}
                autoFocus
              />
              <div className="wizard__custom-actions">
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
                {customValue && (
                  <button
                    type="button"
                    className="wizard__custom-confirm"
                    onClick={onNext}
                  >
                    Continuar
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                )}
              </div>
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
          {isLast ? 'Revisar' : 'Continuar'}
          <span className="material-symbols-outlined">
            {isLast ? 'check' : 'arrow_forward'}
          </span>
        </button>
      </div>
    </div>
  );
};
