import type { WizardOption, WizardStepConfig } from './types';

export const SUBJECT_OPTIONS: readonly WizardOption[] = [
  { value: 'pessoa', label: 'Pessoa', icon: 'person', description: 'Retrato, personagem, figura humana' },
  { value: 'animal', label: 'Animal', icon: 'pets', description: 'Domesticos, selvagens, fantasticos' },
  { value: 'objeto', label: 'Objeto', icon: 'category', description: 'Produtos, itens, artefatos' },
  { value: 'paisagem', label: 'Paisagem', icon: 'landscape', description: 'Natureza, cidades, cenarios' },
  { value: 'personagem', label: 'Personagem', icon: 'theater_comedy', description: 'Fantasia, ficcao, games' },
  { value: 'abstrato', label: 'Abstrato', icon: 'blur_on', description: 'Formas, padroes, arte conceitual' },
] as const;

export const SCENE_OPTIONS: readonly WizardOption[] = [
  { value: 'praia', label: 'Praia', icon: 'beach_access', description: 'Areia, mar, tropical' },
  { value: 'floresta', label: 'Floresta', icon: 'forest', description: 'Arvores, natureza, verde' },
  { value: 'cidade', label: 'Cidade', icon: 'location_city', description: 'Urbano, predios, ruas' },
  { value: 'estudio', label: 'Estudio', icon: 'photo_camera', description: 'Fundo neutro, profissional' },
  { value: 'espaco', label: 'Espaco', icon: 'rocket_launch', description: 'Galaxias, planetas, cosmos' },
  { value: 'interior', label: 'Interior', icon: 'home', description: 'Casa, escritorio, ambiente' },
  { value: 'mundo fantastico', label: 'Mundo Fantastico', icon: 'castle', description: 'Magico, irreal, sonho' },
] as const;

export const STYLE_OPTIONS: readonly WizardOption[] = [
  { value: 'photorealistic', label: 'Fotorrealista', icon: 'photo_camera', description: 'Como uma foto real' },
  { value: 'anime', label: 'Anime/Manga', icon: 'animation', description: 'Estilo japones' },
  { value: 'digital_art', label: 'Arte Digital', icon: 'brush', description: 'Ilustracao moderna' },
  { value: 'oil_painting', label: 'Pintura a Oleo', icon: 'palette', description: 'Classico, artistico' },
  { value: 'watercolor', label: 'Aquarela', icon: 'water_drop', description: 'Suave, delicado' },
  { value: '3d_render', label: 'Render 3D', icon: 'view_in_ar', description: 'Modelagem 3D' },
  { value: 'pixel_art', label: 'Pixel Art', icon: 'grid_on', description: 'Retro, jogos classicos' },
  { value: 'sketch', label: 'Esboco', icon: 'draw', description: 'Desenho a lapis' },
] as const;

export const LIGHTING_OPTIONS: readonly WizardOption[] = [
  { value: 'luz natural', label: 'Luz Natural', icon: 'wb_sunny', description: 'Dia claro, sol' },
  { value: 'hora dourada', label: 'Hora Dourada', icon: 'brightness_5', description: 'Por do sol, amanhecer' },
  { value: 'neon', label: 'Neon', icon: 'lightbulb', description: 'Cores vibrantes, cyberpunk' },
  { value: 'dramatica', label: 'Dramatica', icon: 'contrast', description: 'Sombras fortes' },
  { value: 'suave', label: 'Suave', icon: 'blur_circular', description: 'Difusa, delicada' },
  { value: 'estudio', label: 'Estudio', icon: 'flash_on', description: 'Profissional, controlada' },
  { value: 'luar', label: 'Luar', icon: 'nightlight', description: 'Noturna, mistica' },
] as const;

export const MOOD_OPTIONS: readonly WizardOption[] = [
  { value: 'tranquilo', label: 'Tranquilo', icon: 'spa', description: 'Paz, serenidade' },
  { value: 'dramatico', label: 'Dramatico', icon: 'flash_on', description: 'Intenso, impactante' },
  { value: 'misterioso', label: 'Misterioso', icon: 'visibility_off', description: 'Enigmatico, sombrio' },
  { value: 'alegre', label: 'Alegre', icon: 'sentiment_satisfied', description: 'Feliz, vibrante' },
  { value: 'epico', label: 'Epico', icon: 'military_tech', description: 'Grandioso, heroico' },
  { value: 'romantico', label: 'Romantico', icon: 'favorite', description: 'Amor, delicadeza' },
  { value: 'melancolico', label: 'Melancolico', icon: 'rainy', description: 'Triste, nostalgico' },
  { value: 'assustador', label: 'Assustador', icon: 'skull', description: 'Terror, suspense' },
] as const;

export const FRAMING_OPTIONS: readonly WizardOption[] = [
  { value: 'close-up', label: 'Close-up', icon: 'center_focus_strong', description: 'Foco em detalhes' },
  { value: 'retrato', label: 'Retrato', icon: 'portrait', description: 'Rosto e busto' },
  { value: 'corpo inteiro', label: 'Corpo Inteiro', icon: 'accessibility_new', description: 'Figura completa' },
  { value: 'plano geral', label: 'Plano Geral', icon: 'panorama_wide_angle', description: 'Cenario amplo' },
  { value: 'vista aerea', label: 'Vista Aerea', icon: 'flight', description: 'De cima' },
  { value: 'contra-plongee', label: 'Contra-plongee', icon: 'straighten', description: 'De baixo, imponente' },
] as const;

export const WIZARD_STEPS: readonly WizardStepConfig[] = [
  {
    id: 'subject',
    title: 'Sujeito',
    question: 'O que voce quer criar?',
    options: SUBJECT_OPTIONS,
    required: true,
    allowCustom: true,
    fieldName: 'subject',
    customFieldName: 'subjectCustom',
  },
  {
    id: 'scene',
    title: 'Cenario',
    question: 'Onde esta acontecendo?',
    options: SCENE_OPTIONS,
    required: false,
    allowCustom: true,
    fieldName: 'scene',
    customFieldName: 'sceneCustom',
  },
  {
    id: 'style',
    title: 'Estilo',
    question: 'Qual estilo visual?',
    options: STYLE_OPTIONS,
    required: true,
    allowCustom: false,
    fieldName: 'style',
  },
  {
    id: 'lighting',
    title: 'Iluminacao',
    question: 'Qual iluminacao?',
    options: LIGHTING_OPTIONS,
    required: false,
    allowCustom: true,
    fieldName: 'lighting',
    customFieldName: 'lightingCustom',
  },
  {
    id: 'mood',
    title: 'Clima',
    question: 'Qual clima ou atmosfera?',
    options: MOOD_OPTIONS,
    required: false,
    allowCustom: true,
    fieldName: 'mood',
    customFieldName: 'moodCustom',
  },
  {
    id: 'framing',
    title: 'Enquadramento',
    question: 'Qual enquadramento?',
    options: FRAMING_OPTIONS,
    required: false,
    allowCustom: true,
    fieldName: 'framing',
    customFieldName: 'framingCustom',
  },
  {
    id: 'review',
    title: 'Revisao',
    question: 'Revise sua criacao',
    options: [],
    required: false,
    allowCustom: false,
    fieldName: 'additionalDetails',
  },
] as const;

export const TOTAL_STEPS = WIZARD_STEPS.length;
