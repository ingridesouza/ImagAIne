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
      {WIZARD_STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = isStepCompleted(index);
        const isAccessible = index <= currentStep || isCompleted || isStepCompleted(index - 1);

        return (
          <button
            key={step.id}
            type="button"
            className={`wizard__progress-seg ${
              isActive
                ? 'wizard__progress-seg--active'
                : isCompleted
                ? 'wizard__progress-seg--done'
                : ''
            }`}
            onClick={() => onStepClick(index)}
            disabled={!isAccessible}
            title={step.title}
            aria-label={`${step.title} - passo ${index + 1}`}
          />
        );
      })}
    </div>
  );
};
