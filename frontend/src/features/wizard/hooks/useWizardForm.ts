import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { imagesApi } from '@/features/images/api';
import { WIZARD_STEPS, TOTAL_STEPS } from '../constants';
import type { WizardFormData } from '../types';

const wizardSchema = z.object({
  subject: z.string(),
  subjectCustom: z.string(),
  scene: z.string(),
  sceneCustom: z.string(),
  style: z.string(),
  lighting: z.string(),
  lightingCustom: z.string(),
  mood: z.string(),
  moodCustom: z.string(),
  framing: z.string(),
  framingCustom: z.string(),
  additionalDetails: z.string(),
});

const defaultValues: WizardFormData = {
  subject: '',
  subjectCustom: '',
  scene: '',
  sceneCustom: '',
  style: 'photorealistic',
  lighting: '',
  lightingCustom: '',
  mood: '',
  moodCustom: '',
  framing: '',
  framingCustom: '',
  additionalDetails: '',
};

export const useWizardForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [refinedPrompt, setRefinedPrompt] = useState<string | null>(null);
  const [negativePrompt, setNegativePrompt] = useState<string | null>(null);

  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues,
    mode: 'onChange',
  });

  const refineMutation = useMutation({
    mutationFn: ({ description, style }: { description: string; style: string }) =>
      imagesApi.refinePrompt(description, style),
    onSuccess: (data) => {
      setRefinedPrompt(data.refined_prompt);
      setNegativePrompt(data.negative_prompt);
    },
  });

  const composeDescription = useCallback((values: WizardFormData): string => {
    const parts: string[] = [];

    // Sujeito (obrigatorio)
    const subject = values.subjectCustom || values.subject;
    if (subject) parts.push(subject);

    // Cenario
    const scene = values.sceneCustom || values.scene;
    if (scene) parts.push(`em ${scene}`);

    // Iluminacao
    const lighting = values.lightingCustom || values.lighting;
    if (lighting) parts.push(`com iluminacao ${lighting}`);

    // Clima
    const mood = values.moodCustom || values.mood;
    if (mood) parts.push(`atmosfera ${mood}`);

    // Enquadramento
    const framing = values.framingCustom || values.framing;
    if (framing) parts.push(`enquadramento ${framing}`);

    // Detalhes adicionais
    if (values.additionalDetails) {
      parts.push(values.additionalDetails);
    }

    return parts.join(', ');
  }, []);

  const canProceed = useCallback((): boolean => {
    const stepConfig = WIZARD_STEPS[currentStep];
    if (!stepConfig || stepConfig.id === 'review') return true;
    if (!stepConfig.required) return true;

    const value = form.getValues(stepConfig.fieldName);
    const customValue = stepConfig.customFieldName
      ? form.getValues(stepConfig.customFieldName)
      : '';

    return Boolean(value || customValue);
  }, [currentStep, form]);

  const nextStep = useCallback(() => {
    if (canProceed()) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
  }, [canProceed]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
    }
  }, []);

  const handleRefine = useCallback(async () => {
    const values = form.getValues();
    const description = composeDescription(values);
    try {
      await refineMutation.mutateAsync({
        description,
        style: values.style,
      });
    } catch {
      // Erro já é tratado pelo React Query via refineMutation.error
    }
  }, [form, composeDescription, refineMutation]);

  const reset = useCallback(() => {
    form.reset(defaultValues);
    setCurrentStep(0);
    setRefinedPrompt(null);
    setNegativePrompt(null);
  }, [form]);

  const getStepValue = useCallback(
    (stepIndex: number): string => {
      const stepConfig = WIZARD_STEPS[stepIndex];
      if (!stepConfig || stepConfig.id === 'review') return '';

      const value = form.getValues(stepConfig.fieldName);
      const customValue = stepConfig.customFieldName
        ? form.getValues(stepConfig.customFieldName)
        : '';

      if (customValue) return customValue;
      if (value) {
        const option = stepConfig.options.find((opt) => opt.value === value);
        return option?.label || value;
      }
      return '';
    },
    [form]
  );

  const isStepCompleted = useCallback(
    (stepIndex: number): boolean => {
      const stepConfig = WIZARD_STEPS[stepIndex];
      if (!stepConfig || stepConfig.id === 'review') return false;

      const value = form.getValues(stepConfig.fieldName);
      const customValue = stepConfig.customFieldName
        ? form.getValues(stepConfig.customFieldName)
        : '';

      return Boolean(value || customValue);
    },
    [form]
  );

  return {
    form,
    currentStep,
    totalSteps: TOTAL_STEPS,
    currentStepConfig: WIZARD_STEPS[currentStep],
    nextStep,
    prevStep,
    goToStep,
    canProceed,
    refinedPrompt,
    setRefinedPrompt,
    negativePrompt,
    composeDescription,
    handleRefine,
    isRefining: refineMutation.isPending,
    refineError: refineMutation.error,
    reset,
    getStepValue,
    isStepCompleted,
  };
};
