import { useQuery } from '@tanstack/react-query';
import { GenerateImageForm } from '@/features/images/components/GenerateImageForm';
import { imagesApi } from '@/features/images/api';
import { QUERY_KEYS } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import type { ImageRecord } from '@/features/images/types';

export const GenerateImagePage = () => {
  const { data: myImagesResponse } = useQuery({
    queryKey: QUERY_KEYS.myImages(),
    queryFn: () => imagesApi.fetchMyImages(),
  });

  const myImages: ImageRecord[] = myImagesResponse?.results ?? [];
  const queue = myImages.filter((image) => image.status === 'GENERATING');

  return (
    <section className="generate">
      <div className="generate__hero glass-panel">
        <div>
          <p className="page-eyebrow">Studio</p>
          <h1>Criar nova imagem</h1>
          <p>Descreva o conceito, ajuste parâmetros e acompanhe sua fila em tempo real.</p>
        </div>
        <div className="generate__summary">
          <span>Fila ativa</span>
          <strong>{queue.length.toLocaleString('pt-BR')}</strong>
        </div>
      </div>

      <div className="generate__layout">
        <Card className="glass-panel generate__panel">
          <GenerateImageForm />
        </Card>

        <Card className="glass-panel generate__panel generate__panel--queue">
          <div className="generate__panel-header">
            <h3>Fila em andamento</h3>
            <span>{queue.length ? `${queue.length} tarefas` : 'Atualizado agora'}</span>
          </div>
          {queue.length === 0 ? (
            <p className="generate__empty">Nenhuma geração em processamento.</p>
          ) : (
            <ul className="generate__queue">
              {queue.map((image) => (
                <li key={image.id} className="generate__queue-item">
                  <div>
                    <strong>{image.prompt}</strong>
                    <small>
                      Aspecto {image.aspect_ratio} • seed {image.seed ?? 'aleatória'}
                    </small>
                  </div>
                  <span className="generate__queue-status">Processando</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </section>
  );
};
