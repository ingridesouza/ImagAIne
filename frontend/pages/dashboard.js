import { CONFIG, navigateTo } from '../config/config.js';
import { AuthService } from '../services/auth.service.js';
import { StorageService } from '../services/storage.service.js';

export function DashboardPage() {
    const user = StorageService.getUser();
    const displayName = user?.first_name || user?.email?.split('@')[0] || 'Usuário';
    
    return `
        <div class="dashboard-page">
            <!-- Sidebar -->
            <div class="sidebar">
                <div class="sidebar-header">
                    <h3 class="mb-0">ImagAIne</h3>
                </div>
                
                <div class="user-info text-center py-4">
                    <div class="user-avatar mb-2">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4e73df&color=fff" 
                             alt="${displayName}" 
                             class="rounded-circle" 
                             width="80" 
                             height="80">
                    </div>
                    <h5 class="mb-1">${displayName}</h5>
                    <p class="text-muted small mb-0">${user?.email || ''}</p>
                </div>
                
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a href="#" class="nav-link active" data-route="dashboard">
                            <i class="fas fa-tachometer-alt me-2"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-route="create">
                            <i class="fas fa-plus-circle me-2"></i> Nova Imagem
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-route="gallery">
                            <i class="fas fa-images me-2"></i> Minhas Imagens
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-route="templates">
                            <i class="fas fa-th-large me-2"></i> Modelos
                        </a>
                    </li>
                    <li class="nav-item mt-4">
                        <a href="#" class="nav-link" data-route="settings">
                            <i class="fas fa-cog me-2"></i> Configurações
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" id="logout-btn" class="nav-link text-danger">
                            <i class="fas fa-sign-out-alt me-2"></i> Sair
                        </a>
                    </li>
                </ul>
                
                <div class="sidebar-footer mt-auto p-3">
                    <div class="text-center text-muted small">
                        <p class="mb-1">ImagAIne v1.0.0</p>
                        <p class="mb-0">© ${new Date().getFullYear()} Todos os direitos reservados</p>
                    </div>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="main-content">
                <!-- Top Navigation -->
                <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow-sm">
                    <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle me-3">
                        <i class="fas fa-bars"></i>
                    </button>
                    
                    <!-- Topbar Search -->
                    <form class="d-none d-sm-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
                        <div class="input-group">
                            <input type="text" class="form-control bg-light border-0 small" 
                                   placeholder="Buscar imagens..." 
                                   aria-label="Search" 
                                   aria-describedby="basic-addon2">
                            <button class="btn btn-primary" type="button">
                                <i class="fas fa-search fa-sm"></i>
                            </button>
                        </div>
                    </form>
                    
                    <!-- Topbar Navbar -->
                    <ul class="navbar-nav ms-auto">
                        <!-- Nav Item - Alerts -->
                        <li class="nav-item dropdown no-arrow mx-1">
                            <a class="nav-link dropdown-toggle" href="#" id="alertsDropdown" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-bell fa-fw"></i>
                                <!-- Counter - Alerts -->
                                <span class="badge bg-danger badge-counter">3+</span>
                            </a>
                        </li>
                        
                        <!-- Nav Item - Messages -->
                        <li class="nav-item dropdown no-arrow mx-1">
                            <a class="nav-link dropdown-toggle" href="#" id="messagesDropdown" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-envelope fa-fw"></i>
                                <!-- Counter - Messages -->
                                <span class="badge bg-danger badge-counter">7</span>
                            </a>
                        </li>
                        
                        <div class="topbar-divider d-none d-sm-block"></div>
                        
                        <!-- Nav Item - User Information -->
                        <li class="nav-item dropdown no-arrow">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="me-2 d-none d-lg-inline text-gray-600 small">${displayName}</span>
                                <img class="img-profile rounded-circle"
                                    src="https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4e73df&color=fff" 
                                    width="32" height="32">
                            </a>
                            <!-- Dropdown - User Information -->
                            <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                                <li><a class="dropdown-item" href="#" data-route="profile">
                                    <i class="fas fa-user fa-sm fa-fw me-2 text-gray-400"></i>
                                    Perfil
                                </a></li>
                                <li><a class="dropdown-item" href="#" data-route="settings">
                                    <i class="fas fa-cogs fa-sm fa-fw me-2 text-gray-400"></i>
                                    Configurações
                                </a></li>
                                <li><a class="dropdown-item" href="#" data-route="activity">
                                    <i class="fas fa-list fa-sm fa-fw me-2 text-gray-400"></i>
                                    Atividades
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#" id="logout-dropdown-btn">
                                    <i class="fas fa-sign-out-alt fa-sm fa-fw me-2 text-gray-400"></i>
                                    Sair
                                </a></li>
                            </ul>
                        </li>
                    </ul>
                </nav>
                <!-- End of Topbar -->
                
                <!-- Begin Page Content -->
                <div class="container-fluid px-4">
                    <!-- Page Heading -->
                    <div class="d-sm-flex align-items-center justify-content-between mb-4">
                        <h1 class="h3 mb-0 text-gray-800">Dashboard</h1>
                        <a href="#" class="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm" data-route="create">
                            <i class="fas fa-plus fa-sm text-white-50"></i> Nova Imagem
                        </a>
                    </div>
                    
                    <!-- Content Row -->
                    <div class="row">
                        <!-- Earnings (Monthly) Card Example -->
                        <div class="col-xl-3 col-md-6 mb-4">
                            <div class="card border-left-primary shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                Imagens Geradas</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">24</div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-images fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Earnings (Monthly) Card Example -->
                        <div class="col-xl-3 col-md-6 mb-4">
                            <div class="card border-left-success shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                                Créditos Restantes</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">150</div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-coins fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Pending Requests Card Example -->
                        <div class="col-xl-3 col-md-6 mb-4">
                            <div class="card border-left-warning shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                                Modelos Salvos</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">5</div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-th-large fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Pending Requests Card Example -->
                        <div class="col-xl-3 col-md-6 mb-4">
                            <div class="card border-left-info shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                                Plano Atual</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">Grátis</div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-crown fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Content Row -->
                    <div class="row">
                        <!-- Area Chart -->
                        <div class="col-xl-8 col-lg-7">
                            <div class="card shadow mb-4">
                                <!-- Card Header - Dropdown -->
                                <div
                                    class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                    <h6 class="m-0 font-weight-bold text-primary">Visão Geral de Uso</h6>
                                    <div class="dropdown no-arrow">
                                        <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
                                            data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                                        </a>
                                        <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="dropdownMenuLink">
                                            <li><a class="dropdown-item" href="#">Hoje</a></li>
                                            <li><a class="dropdown-item" href="#">Esta Semana</a></li>
                                            <li><a class="dropdown-item" href="#">Este Mês</a></li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li><a class="dropdown-item" href="#">Personalizar</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <!-- Card Body -->
                                <div class="card-body">
                                    <div class="chart-area">
                                        <canvas id="myAreaChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Pie Chart -->
                        <div class="col-xl-4 col-lg-5">
                            <div class="card shadow mb-4">
                                <!-- Card Header - Dropdown -->
                                <div
                                    class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                    <h6 class="m-0 font-weight-bold text-primary">Uso de Estilos</h6>
                                    <div class="dropdown no-arrow">
                                        <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
                                            data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                                        </a>
                                        <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="dropdownMenuLink">
                                            <li><a class="dropdown-item" href="#">Exportar Dados</a></li>
                                            <li><a class="dropdown-item" href="#">Ver Detalhes</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <!-- Card Body -->
                                <div class="card-body">
                                    <div class="chart-pie pt-4 pb-2">
                                        <canvas id="myPieChart"></canvas>
                                    </div>
                                    <div class="mt-4 text-center small">
                                        <span class="me-2">
                                            <i class="fas fa-circle text-primary"></i> Realista
                                        </span>
                                        <span class="me-2">
                                            <i class="fas fa-circle text-success"></i> Artístico
                                        </span>
                                        <span class="me-2">
                                            <i class="fas fa-circle text-info"></i> Abstrato
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Content Row -->
                    <div class="row">
                        <!-- Content Column -->
                        <div class="col-lg-6 mb-4">
                            <!-- Project Card Example -->
                            <div class="card shadow mb-4">
                                <div class="card-header py-3">
                                    <h6 class="m-0 font-weight-bold text-primary">Atividades Recentes</h6>
                                </div>
                                <div class="card-body">
                                    <div class="activity-feed">
                                        <div class="activity-item d-flex mb-3">
                                            <div class="activity-icon bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                                                <i class="fas fa-plus"></i>
                                            </div>
                                            <div>
                                                <div class="small text-gray-500">Hoje, 10:45 AM</div>
                                                <p class="mb-0">Você criou uma nova imagem: <strong>"Paisagem de Outono"</strong></p>
                                            </div>
                                        </div>
                                        <div class="activity-item d-flex mb-3">
                                            <div class="activity-icon bg-success text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                                                <i class="fas fa-share-alt"></i>
                                            </div>
                                            <div>
                                                <div class="small text-gray-500">Ontem, 3:12 PM</div>
                                                <p class="mb-0">Você compartilhou <strong>"Retrato em Preto e Branco"</strong></p>
                                            </div>
                                        </div>
                                        <div class="activity-item d-flex mb-3">
                                            <div class="activity-icon bg-info text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                                                <i class="fas fa-download"></i>
                                            </div>
                                            <div>
                                                <div class="small text-gray-500">22/07/2023, 9:30 AM</div>
                                                <p class="mb-0">Você fez download de <strong>3 imagens</strong></p>
                                            </div>
                                        </div>
                                        <div class="activity-item d-flex">
                                            <div class="activity-icon bg-warning text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                                                <i class="fas fa-star"></i>
                                            </div>
                                            <div>
                                                <div class="small text-gray-500">20/07/2023, 4:20 PM</div>
                                                <p class="mb-0">Você adicionou <strong>"Pôr do Sol na Praia"</strong> aos favoritos</p>
                                            </div>
                                        </div>
                                    </div>
                                    <a href="#" class="btn btn-link p-0 mt-2" data-route="activity">Ver todas as atividades</a>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-lg-6 mb-4">
                            <!-- Illustrations -->
                            <div class="card shadow mb-4">
                                <div class="card-header py-3">
                                    <h6 class="m-0 font-weight-bold text-primary">Dicas e Truques</h6>
                                </div>
                                <div class="card-body">
                                    <div class="text-center">
                                        <img class="img-fluid px-3 px-sm-4 mt-3 mb-4" style="width: 15rem;"
                                            src="/assets/images/undraw_creative_team_re_85gn.svg" alt="Dicas">
                                    </div>
                                    <p>Descubra como criar imagens incríveis com nossas dicas exclusivas:</p>
                                    <ul class="mb-4">
                                        <li>Use descrições detalhadas para obter resultados mais precisos</li>
                                        <li>Experimente diferentes estilos artísticos</li>
                                        <li>Salve seus modelos favoritos para uso futuro</li>
                                        <li>Compartilhe suas criações nas redes sociais</li>
                                    </ul>
                                    <a target="_blank" rel="nofollow" href="#">Ver tutorial completo &rarr;</a>
                                </div>
                            </div>
                            
                            <!-- Approach -->
                            <div class="card shadow mb-4">
                                <div class="card-header py-3">
                                    <h6 class="m-0 font-weight-bold text-primary">Atualize para Premium</h6>
                                </div>
                                <div class="card-body">
                                    <p>Desbloqueie recursos exclusivos e aumente seus limites de geração de imagens.</p>
                                    <p class="mb-4">Aproveite benefícios como:</p>
                                    <ul class="mb-4">
                                        <li>Geração de imagens em alta resolução</li>
                                        <li>Sem marcas d'água</li>
                                        <li>Processamento prioritário</li>
                                        <li>Modelos exclusivos</li>
                                    </ul>
                                    <a href="#" class="btn btn-primary" data-route="upgrade">
                                        <i class="fas fa-crown me-2"></i>Atualizar Agora
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- /.container-fluid -->
                
                <!-- Footer -->
                <footer class="sticky-footer bg-white">
                    <div class="container my-auto">
                        <div class="copyright text-center my-auto">
                            <span>Copyright &copy; ImagAIne ${new Date().getFullYear()}</span>
                        </div>
                    </div>
                </footer>
                <!-- End of Footer -->
            </div>
            <!-- End of Main Content -->
        </div>
    `;
}

// Inicialização dos eventos do dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário está autenticado
    if (!StorageService.isAuthenticated()) {
        navigateTo(CONFIG.ROUTES.LOGIN);
        return;
    }
    
    // Adiciona estilos específicos para o dashboard
    const style = document.createElement('style');
    style.textContent = `
        /* Layout Principal */
        .dashboard-page {
            display: flex;
            min-height: 100vh;
            background-color: #f8f9fc;
        }
        
        /* Sidebar */
        .sidebar {
            width: 250px;
            background: #fff;
            box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
            display: flex;
            flex-direction: column;
            z-index: 1;
        }
        
        .sidebar-header {
            padding: 1.5rem 1.5rem 0.5rem;
            font-weight: 800;
            font-size: 1.2rem;
            color: var(--primary-color);
            border-bottom: 1px solid #eaecf4;
            margin-bottom: 1rem;
        }
        
        .user-info {
            padding: 1rem;
            border-bottom: 1px solid #eaecf4;
        }
        
        .user-avatar {
            margin: 0 auto;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid #fff;
            box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
        }
        
        .nav {
            padding: 1rem 0;
        }
        
        .nav-link {
            padding: 0.75rem 1.5rem;
            color: #5a5c69;
            font-weight: 600;
            border-left: 3px solid transparent;
            transition: all 0.2s ease;
        }
        
        .nav-link:hover, .nav-link.active {
            color: var(--primary-color);
            background-color: rgba(78, 115, 223, 0.1);
            border-left-color: var(--primary-color);
        }
        
        .nav-link i {
            width: 20px;
            text-align: center;
            margin-right: 0.5rem;
        }
        
        .sidebar-footer {
            margin-top: auto;
            font-size: 0.8rem;
            color: #b7b9cc;
            border-top: 1px solid #eaecf4;
        }
        
        /* Conteúdo Principal */
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
        }
        
        /* Topbar */
        .topbar {
            height: 4.375rem;
            box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
            background-color: #fff;
        }
        
        .topbar-divider {
            width: 0;
            border-right: 1px solid #e3e6f0;
            height: calc(4.375rem - 2rem);
            margin: auto 1rem;
        }
        
        /* Cards */
        .card {
            border: none;
            border-radius: 0.35rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .card:hover {
            transform: translateY(-3px);
            box-shadow: 0 0.5rem 1.5rem 0.5rem rgba(58, 59, 69, 0.15);
        }
        
        .card-header {
            background-color: #f8f9fc;
            border-bottom: 1px solid #e3e6f0;
            padding: 1rem 1.25rem;
        }
        
        /* Botão de alternar sidebar em telas pequenas */
        #sidebarToggleTop {
            font-size: 1.2rem;
            padding: 0.5rem;
        }
        
        /* Gráficos */
        .chart-area {
            position: relative;
            height: 20rem;
            width: 100%;
        }
        
        .chart-pie {
            position: relative;
            height: 15rem;
            width: 100%;
        }
        
        /* Atividades Recentes */
        .activity-item {
            padding: 0.5rem 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .activity-item:last-child {
            border-bottom: none;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .sidebar {
                position: fixed;
                top: 0;
                left: -250px;
                bottom: 0;
                transition: all 0.3s ease;
            }
            
            .sidebar.show {
                left: 0;
            }
            
            .main-content {
                margin-left: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Adiciona evento de logout
    const logoutButtons = document.querySelectorAll('#logout-btn, #logout-dropdown-btn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await AuthService.logout();
                navigateTo(CONFIG.ROUTES.HOME);
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
            }
        });
    });
    
    // Adiciona evento para alternar a sidebar em telas pequenas
    const sidebarToggle = document.getElementById('sidebarToggleTop');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.sidebar').classList.toggle('show');
        });
    }
    
    // Inicializa tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Inicializa popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Adiciona evento de clique nos itens do menu
    document.querySelectorAll('.nav-link[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = e.currentTarget.getAttribute('data-route');
            if (route && CONFIG.ROUTES[route.toUpperCase()]) {
                navigateTo(CONFIG.ROUTES[route.toUpperCase()]);
            }
        });
    });
});
