import { WIZARD_STEPS } from '../constants';

type WizardProgressProps = {
  currentStep: number;
  onStepClick: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
};

export const WizardProgress = ({
  currentStep,
  onStepClick,
  isStepCompleted,
}: WizardProgressProps) => {
  return (
    <div className="wizard__progress">
      {WIZARD_STEPS.map((step, index) => (
        <div key={step.id} className="wizard__progress-step">
          <button
            type="button"
            className={`wizard__progress-dot ${
              index === currentStep
                ? 'wizard__progress-dot--active'
                : isStepCompleted(index)
                ? 'wizard__progress-dot--completed'
                : ''
            }`}
            onClick={() => onStepClick(index)}
            disabled={index > currentStep && !isStepCompleted(index - 1)}
            title={step.title}
          >
            {isStepCompleted(index) && index !== currentStep ? (
              <span className="material-symbols-outlined wizard__progress-check">
                check
              </span>
            ) : (
              <span className="wizard__progress-number">{index + 1}</span>
            )}
          </button>
          {index < WIZARD_STEPS.length - 1 && (
            <div
              className={`wizard__progress-line ${
                isStepCompleted(index) ? 'wizard__progress-line--completed' : ''
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};
