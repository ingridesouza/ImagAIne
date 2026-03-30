export type WizardStepId =
  | 'subject'
  | 'scene'
  | 'style'
  | 'lighting'
  | 'mood'
  | 'framing'
  | 'review';

export type WizardOption = {
  value: string;
  label: string;
  icon: string;
  description?: string;
};

export type WizardStepConfig = {
  id: WizardStepId;
  title: string;
  question: string;
  options: readonly WizardOption[];
  required: boolean;
  allowCustom: boolean;
  fieldName: keyof WizardFormData;
  customFieldName?: keyof WizardFormData;
};

export type WizardFormData = {
  subject: string;
  subjectCustom: string;
  scene: string;
  sceneCustom: string;
  style: string;
  lighting: string;
  lightingCustom: string;
  mood: string;
  moodCustom: string;
  framing: string;
  framingCustom: string;
  additionalDetails: string;
};

export type WizardState = {
  currentStep: number;
  formData: WizardFormData;
  refinedPrompt: string | null;
  negativePrompt: string | null;
  isRefining: boolean;
};
