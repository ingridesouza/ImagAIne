import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { imagesApi } from '@/features/images/api';

const STYLE_OPTIONS = [
  { value: 'photorealistic', label: 'Fotorrealista', icon: 'photo_camera' },
  { value: 'anime', label: 'Anime/Manga', icon: 'animation' },
  { value: 'digital_art', label: 'Arte Digital', icon: 'brush' },
  { value: 'oil_painting', label: 'Pintura a Oleo', icon: 'palette' },
  { value: 'watercolor', label: 'Aquarela', icon: 'water_drop' },
  { value: '3d_render', label: 'Render 3D', icon: 'view_in_ar' },
  { value: 'pixel_art', label: 'Pixel Art', icon: 'grid_on' },
  { value: 'sketch', label: 'Esboco', icon: 'draw' },
] as const;

export const PromptAssistantPage = () => {
  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('photorealistic');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const refineMutation = useMutation({
    mutationFn: () => imagesApi.refinePrompt(description, selectedStyle),
    onSuccess: (data) => {
      setRefinedPrompt(data.refined_prompt);
      setNegativePrompt(data.negative_prompt);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || refineMutation.isPending) return;
    refineMutation.mutate();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(refinedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    navigate('/explore', {
      state: {
        prompt: refinedPrompt,
        negative_prompt: negativePrompt,
      },
    });
  };

  return (
    <div className="prompt-assistant">
      <header className="prompt-assistant__header">
        <button
          type="button"
          className="prompt-assistant__back"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <p className="prompt-assistant__eyebrow">Assistente IA</p>
          <h1 className="prompt-assistant__title">Criador de Prompts</h1>
        </div>
      </header>

      <div className="prompt-assistant__content">
        <div className="prompt-assistant__input-section">
          <form onSubmit={handleSubmit}>
            <label className="prompt-assistant__label">
              <span className="material-symbols-outlined">edit_note</span>
              Descreva sua ideia
            </label>
            <textarea
              className="prompt-assistant__textarea"
              placeholder="Descreva de forma simples o que voce quer ver na imagem...&#10;&#10;Ex: um gato laranja fofo usando oculos de sol numa praia tropical ao por do sol"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={refineMutation.isPending}
            />

            <label className="prompt-assistant__label prompt-assistant__label--style">
              <span className="material-symbols-outlined">style</span>
              Escolha o estilo
            </label>
            <div className="prompt-assistant__styles">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  className={`prompt-assistant__style-btn${selectedStyle === style.value ? ' prompt-assistant__style-btn--active' : ''}`}
                  onClick={() => setSelectedStyle(style.value)}
                  disabled={refineMutation.isPending}
                >
                  <span className="material-symbols-outlined">{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="prompt-assistant__generate-btn"
              disabled={!description.trim() || refineMutation.isPending}
            >
              {refineMutation.isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Criando prompt...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Criar Prompt Otimizado
                </>
              )}
            </button>
          </form>

          {refineMutation.isError && (
            <div className="prompt-assistant__error">
              <span className="material-symbols-outlined">error</span>
              <span>Erro ao gerar prompt. Tente novamente.</span>
            </div>
          )}
        </div>

        {refinedPrompt && (
          <div className="prompt-assistant__result">
            <div className="prompt-assistant__result-header">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Prompt Otimizado</span>
            </div>

            <div className="prompt-assistant__prompt-box">
              <p className="prompt-assistant__prompt-text">{refinedPrompt}</p>
              <button
                type="button"
                className="prompt-assistant__copy-btn"
                onClick={handleCopy}
              >
                <span className="material-symbols-outlined">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            {negativePrompt && (
              <div className="prompt-assistant__negative">
                <span className="prompt-assistant__negative-label">Prompt Negativo:</span>
                <span className="prompt-assistant__negative-text">{negativePrompt}</span>
              </div>
            )}

            <div className="prompt-assistant__actions">
              <button
                type="button"
                className="prompt-assistant__action-btn prompt-assistant__action-btn--secondary"
                onClick={handleUsePrompt}
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Usar no Explorar
              </button>
              <button
                type="button"
                className="prompt-assistant__action-btn prompt-assistant__action-btn--primary"
                onClick={handleGenerateNow}
              >
                <span className="material-symbols-outlined">bolt</span>
                Gerar Imagem Agora
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
