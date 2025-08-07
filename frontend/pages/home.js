import { CONFIG, navigateTo } from '../config/config.js';
import { StorageService } from '../services/storage.service.js';

export function HomePage() {
    const isAuthenticated = StorageService.isAuthenticated();
    
    return `
        <div class="home-page">
            <!-- Hero Section -->
            <header class="hero-section py-5">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-lg-6">
                            <h1 class="display-4 fw-bold mb-4">Bem-vindo ao ImagAIne</h1>
                            <p class="lead mb-4">
                                Transforme suas ideias em imagens incríveis com o poder da inteligência artificial. 
                                Crie, edite e compartilhe suas criações de forma fácil e intuitiva.
                            </p>
                            <div class="d-flex gap-3">
                                ${isAuthenticated ? `
                                    <a href="${CONFIG.ROUTES.DASHBOARD}" class="btn btn-primary btn-lg">
                                        <i class="fas fa-tachometer-alt me-2"></i>Painel de Controle
                                    </a>
                                ` : `
                                    <a href="${CONFIG.ROUTES.REGISTER}" class="btn btn-primary btn-lg">
                                        <i class="fas fa-user-plus me-2"></i>Criar Conta
                                    </a>
                                    <a href="${CONFIG.ROUTES.LOGIN}" class="btn btn-outline-primary btn-lg">
                                        <i class="fas fa-sign-in-alt me-2"></i>Entrar
                                    </a>
                                `}
                            </div>
                        </div>
                        <div class="col-lg-6 d-none d-lg-block">
                            <div class="hero-image">
                                <img src="/assets/images/hero-illustration.svg" alt="Imagem de ilustração" class="img-fluid">
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Features Section -->
            <section class="py-5 bg-light">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="fw-bold">Recursos Incríveis</h2>
                        <p class="lead text-muted">Descubra o que você pode fazer com o ImagAIne</p>
                    </div>
                    
                    <div class="row g-4">
                        <div class="col-md-4">
                            <div class="card h-100 border-0 shadow-sm">
                                <div class="card-body text-center p-4">
                                    <div class="feature-icon mb-3">
                                        <i class="fas fa-magic fa-3x text-primary"></i>
                                    </div>
                                    <h4 class="h5">Geração de Imagens</h4>
                                    <p class="text-muted">
                                        Crie imagens incríveis a partir de descrições de texto usando IA avançada.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="card h-100 border-0 shadow-sm">
                                <div class="card-body text-center p-4">
                                    <div class="feature-icon mb-3">
                                        <i class="fas fa-edit fa-3x text-primary"></i>
                                    </div>
                                    <h4 class="h5">Edição Avançada</h4>
                                    <p class="text-muted">
                                        Edite e aprimore suas imagens com ferramentas poderosas de edição.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="card h-100 border-0 shadow-sm">
                                <div class="card-body text-center p-4">
                                    <div class="feature-icon mb-3">
                                        <i class="fas fa-share-alt fa-3x text-primary"></i>
                                    </div>
                                    <h4 class="h5">Compartilhamento Fácil</h4>
                                    <p class="text-muted">
                                        Compartilhe suas criações diretamente nas redes sociais ou baixe em alta qualidade.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- How It Works Section -->
            <section class="py-5">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="fw-bold">Como Funciona</h2>
                        <p class="lead text-muted">Crie imagens incríveis em apenas alguns passos</p>
                    </div>
                    
                    <div class="row g-4">
                        <div class="col-md-4">
                            <div class="text-center px-3">
                                <div class="step-number mb-3">1</div>
                                <h4 class="h5">Descreva sua ideia</h4>
                                <p class="text-muted mb-0">
                                    Digite uma descrição detalhada da imagem que você deseja criar.
                                </p>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="text-center px-3">
                                <div class="step-number mb-3">2</div>
                                <h4 class="h5">Escolha o estilo</h4>
                                <p class="text-muted mb-0">
                                    Selecione entre diferentes estilos artísticos para sua imagem.
                                </p>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="text-center px-3">
                                <div class="step-number mb-3">3</div>
                                <h4 class="h5">Gere e baixe</h4>
                                <p class="text-muted mb-0">
                                    Clique em gerar e baixe sua imagem em alta resolução.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    ${!isAuthenticated ? `
                        <div class="text-center mt-5">
                            <h3 class="h4 mb-4">Pronto para começar?</h3>
                            <a href="${CONFIG.ROUTES.REGISTER}" class="btn btn-primary btn-lg">
                                <i class="fas fa-rocket me-2"></i>Criar Conta Grátis
                            </a>
                        </div>
                    ` : ''}
                </div>
            </section>

            <!-- Testimonials Section -->
            <section class="py-5 bg-light">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="fw-bold">O que as pessoas estão dizendo</h2>
                        <p class="lead text-muted">Veja o que nossos usuários estão criando</p>
                    </div>
                    
                    <div class="row g-4">
                        <div class="col-md-4">
                            <div class="card h-100 border-0 shadow-sm">
                                <div class="card-body p-4">
                                    <div class="d-flex align-items-center mb-3">
                                        <img src="https://ui-avatars.com/api/?name=João+Silva&background=4e73df&color=fff" 
                                             alt="João Silva" 
                                             class="rounded-circle me-3" 
                                             width="48" 
                                             height="48">
                                        <div>
                                            <h5 class="mb-0">João Silva</h5>
                                            <div class="text-warning">
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <p class="mb-0">
                                        "Incrível! Consigo criar ilustrações profissionais para meus projetos em segundos."
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="card h-100 border-0 shadow-sm">
                                <div class="card-body p-4">
                                    <div class="d-flex align-items-center mb-3">
                                        <img src="https://ui-avatars.com/api/?name=Maria+Santos&background=36b9cc&color=fff" 
                                             alt="Maria Santos" 
                                             class="rounded-circle me-3" 
                                             width="48" 
                                             height="48">
                                        <div>
                                            <h5 class="mb-0">Maria Santos</h5>
                                            <div class="text-warning">
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <p class="mb-0">
                                        "Uso para criar artes para minhas redes sociais. Economiza muito tempo e o resultado é impressionante!"
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="card h-100 border-0 shadow-sm">
                                <div class="card-body p-4">
                                    <div class="d-flex align-items-center mb-3">
                                        <img src="https://ui-avatars.com/api/?name=Carlos+Oliveira&background=1cc88a&color=fff" 
                                             alt="Carlos Oliveira" 
                                             class="rounded-circle me-3" 
                                             width="48" 
                                             height="48">
                                        <div>
                                            <h5 class="mb-0">Carlos Oliveira</h5>
                                            <div class="text-warning">
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="far fa-star"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <p class="mb-0">
                                        "Ótima ferramenta para prototipagem rápida. As imagens geradas são de alta qualidade."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            ${!isAuthenticated ? `
                <section class="py-5 bg-primary text-white">
                    <div class="container text-center">
                        <h2 class="fw-bold mb-4">Pronto para transformar suas ideias em imagens?</h2>
                        <p class="lead mb-4">Junte-se a milhares de criativos que já estão usando o ImagAIne.</p>
                        <a href="${CONFIG.ROUTES.REGISTER}" class="btn btn-light btn-lg px-5">
                            <i class="fas fa-rocket me-2"></i>Começar Agora
                        </a>
                    </div>
                </section>
            ` : ''}
        </div>
    `;
}

// Estilos específicos para a página inicial
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona estilos específicos para a página inicial
    const style = document.createElement('style');
    style.textContent = `
        .hero-section {
            padding: 5rem 0;
            background: linear-gradient(135deg, #f8f9fc 0%, #e9ecef 100%);
        }
        
        .hero-image {
            animation: float 6s ease-in-out infinite;
        }
        
        .feature-icon {
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            background-color: rgba(78, 115, 223, 0.1);
            border-radius: 50%;
        }
        
        .step-number {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            background-color: var(--primary-color);
            color: white;
            border-radius: 50%;
            font-weight: bold;
            font-size: 1.5rem;
        }
        
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
        }
        
        .btn-lg {
            padding: 0.8rem 2rem;
            font-size: 1.1rem;
        }
    `;
    document.head.appendChild(style);
    
    // Verifica se o usuário está autenticado e redireciona se necessário
    if (StorageService.isAuthenticated() && window.location.pathname === '/') {
        navigateTo(CONFIG.ROUTES.DASHBOARD);
    }
});
