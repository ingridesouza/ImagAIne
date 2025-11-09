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
    <section className="grid" style={{ gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0 }}>Criar nova imagem</h1>
          <p style={{ margin: 0, color: '#64748b' }}>
            Ajuste o prompt e acompanhe o status da fila em tempo real.
          </p>
        </div>
      </div>

      <div className="grid --two">
        <Card>
          <GenerateImageForm />
        </Card>

        <Card>
          <h3 style={{ marginTop: 0 }}>Fila em andamento</h3>
          {queue.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Nenhuma geração em processamento.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {queue.map((image) => (
                <li key={image.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{image.prompt}</strong>
                    <small style={{ display: 'block', color: '#94a3b8' }}>
                      Aspect {image.aspect_ratio} · seed {image.seed ?? 'aleatória'}
                    </small>
                  </div>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>Processando</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </section>
  );
};
