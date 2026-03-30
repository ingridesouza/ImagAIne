import { useNavigate } from 'react-router-dom';
import {
  useWizardForm,
  WizardProgress,
  WizardStep,
  WizardReview,
} from '@/features/wizard';
import { WIZARD_STEPS } from '@/features/wizard/constants';

export const GuidedWizardPage = () => {
  const navigate = useNavigate();
  const {
    form,
    currentStep,
    totalSteps,
    currentStepConfig,
    nextStep,
    prevStep,
    goToStep,
    canProceed,
    refinedPrompt,
    setRefinedPrompt,
    negativePrompt,
    composeDescription,
    handleRefine,
    isRefining,
    refineError,
    getStepValue,
    isStepCompleted,
  } = useWizardForm();

  const isReviewStep = currentStepConfig?.id === 'review';
  const isFirstStep = currentStep === 0;
  const isLastRegularStep = currentStep === totalSteps - 2;

  return (
    <div className="wizard">
      <header className="wizard__header">
        <button
          type="button"
          className="wizard__back"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="wizard__header-text">
          <h1 className="wizard__title">
            {isReviewStep ? 'Revisao' : WIZARD_STEPS[currentStep]?.title}
          </h1>
        </div>
      </header>

      <WizardProgress
        currentStep={currentStep}
        onStepClick={goToStep}
        isStepCompleted={isStepCompleted}
      />

      <div className="wizard__content">
        {isReviewStep ? (
          <WizardReview
            form={form}
            getStepValue={getStepValue}
            goToStep={goToStep}
            onBack={prevStep}
            onRefine={handleRefine}
            isRefining={isRefining}
            refinedPrompt={refinedPrompt}
            setRefinedPrompt={setRefinedPrompt}
            negativePrompt={negativePrompt}
            composeDescription={composeDescription}
            refineError={refineError}
          />
        ) : (
          currentStepConfig && (
            <WizardStep
              key={currentStepConfig.id}
              stepConfig={currentStepConfig}
              form={form}
              onNext={nextStep}
              onBack={prevStep}
              isFirst={isFirstStep}
              isLast={isLastRegularStep}
              canProceed={canProceed()}
            />
          )
        )}
      </div>
    </div>
  );
};
