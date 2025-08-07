import { CONFIG, navigateTo } from '../config/config.js';
import { AuthService } from '../services/auth.service.js';
import { StorageService } from '../services/storage.service.js';

export function ProfilePage() {
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
                        <a href="#" class="nav-link" data-route="dashboard">
                            <i class="fas fa-tachometer-alt me-2"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link active" data-route="profile">
                            <i class="fas fa-user me-2"></i> Meu Perfil
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-route="security">
                            <i class="fas fa-lock me-2"></i> Segurança
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-route="billing">
                            <i class="fas fa-credit-card me-2"></i> Cobrança
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
                                   placeholder="Buscar..." 
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
                        
                        <div class="topbar-divider d-none d-sm-block"></div>
                        
                        <!-- Nav Item - User Information -->
                        <li class="nav-item dropdown no-arrow">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="me-2 d-none d-lg-inline text-gray-600">${displayName}</span>
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
                        <h1 class="h3 mb-0 text-gray-800">Meu Perfil</h1>
                    </div>
                    
                    <!-- Content Row -->
                    <div class="row">
                        <div class="col-lg-4">
                            <!-- Profile Card -->
                            <div class="card shadow mb-4">
                                <div class="card-header py-3">
                                    <h6 class="m-0 font-weight-bold text-primary">Foto do Perfil</h6>
                                </div>
                                <div class="card-body text-center">
                                    <img class="img-profile rounded-circle mb-3" 
                                         src="https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4e73df&color=fff" 
                                         alt="${displayName}"
                                         width="150"
                                         height="150">
                                    <div class="small font-italic text-muted mb-4">JPG ou PNG não maior que 5 MB</div>
                                    <button class="btn btn-primary btn-sm">
                                        <i class="fas fa-upload fa-sm text-white-50"></i> Enviar Nova Foto
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-lg-8">
                            <!-- Account Details -->
                            <div class="card shadow mb-4">
                                <div class="card-header py-3">
                                    <h6 class="m-0 font-weight-bold text-primary">Informações da Conta</h6>
                                </div>
                                <div class="card-body">
                                    <form id="profile-form">
                                        <div class="row mb-3">
                                            <div class="col-md-6 mb-3 mb-md-0">
                                                <label class="form-label">Primeiro Nome</label>
                                                <input type="text" class="form-control" id="first-name" value="${user?.first_name || ''}">
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">Sobrenome</label>
                                                <input type="text" class="form-control" id="last-name" value="${user?.last_name || ''}">
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">E-mail</label>
                                            <input type="email" class="form-control" id="email" value="${user?.email || ''}" disabled>
                                            <div class="form-text">Para alterar seu e-mail, entre em contato com o suporte.</div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Nome de Exibição</label>
                                            <input type="text" class="form-control" id="display-name" value="${displayName}">
                                            <div class="form-text">Este é o nome que será exibido publicamente.</div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Biografia</label>
                                            <textarea class="form-control" id="bio" rows="3" placeholder="Conte-nos um pouco sobre você...">${user?.bio || ''}</textarea>
                                            <div class="form-text">Máximo de 500 caracteres.</div>
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deleteAccountModal">
                                                <i class="fas fa-trash-alt me-1"></i> Excluir Conta
                                            </button>
                                            <div>
                                                <button type="button" class="btn btn-secondary me-2">Cancelar</button>
                                                <button type="submit" class="btn btn-primary">
                                                    <i class="fas fa-save me-1"></i> Salvar Alterações
                                                </button>
                                            </div>
                                        </div>
                                    </form>
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
            
            <!-- Delete Account Modal -->
            <div class="modal fade" id="deleteAccountModal" tabindex="-1" aria-labelledby="deleteAccountModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title" id="deleteAccountModalLabel">
                                <i class="fas fa-exclamation-triangle me-2"></i> Confirmar Exclusão de Conta
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body">
                            <p class="text-danger">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                <strong>Atenção:</strong> Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
                            </p>
                            <p>Para confirmar a exclusão da sua conta, digite sua senha atual:</p>
                            
                            <form id="deleteAccountForm">
                                <div class="mb-3">
                                    <label for="currentPassword" class="form-label">Senha Atual</label>
                                    <input type="password" class="form-control" id="currentPassword" required>
                                    <div class="invalid-feedback">Por favor, insira sua senha atual.</div>
                                </div>
                                
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="confirmDelete" required>
                                    <label class="form-check-label" for="confirmDelete">
                                        Eu entendo que esta ação não pode ser desfeita e concordo em excluir permanentemente minha conta e todos os meus dados.
                                    </label>
                                    <div class="invalid-feedback">Você deve confirmar que entende as consequências.</div>
                                </div>
                                
                                <div class="d-flex justify-content-end gap-2">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                        <i class="fas fa-times me-1"></i> Cancelar
                                    </button>
                                    <button type="submit" class="btn btn-danger">
                                        <i class="fas fa-trash-alt me-1"></i> Confirmar Exclusão
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Função para mostrar mensagem de feedback
function showAlert(message, type = 'success') {
    // Remove alertas existentes
    const existingAlert = document.getElementById('alert-message');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    if (!message) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.id = 'alert-message';
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    const container = document.querySelector('.container-fluid.px-4');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Remove o alerta após 5 segundos
        setTimeout(() => {
            const alert = document.getElementById('alert-message');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
}

// Função para validar o formulário de exclusão de conta
function validateDeleteForm() {
    const form = document.getElementById('deleteAccountForm');
    const passwordInput = document.getElementById('currentPassword');
    const confirmCheckbox = document.getElementById('confirmDelete');
    let isValid = true;

    // Validação da senha
    if (!passwordInput.value.trim()) {
        passwordInput.classList.add('is-invalid');
        isValid = false;
    } else {
        passwordInput.classList.remove('is-invalid');
    }

    // Validação da confirmação
    if (!confirmCheckbox.checked) {
        confirmCheckbox.classList.add('is-invalid');
        isValid = false;
    } else {
        confirmCheckbox.classList.remove('is-invalid');
    }

    return isValid;
}

// Função para lidar com a exclusão da conta
async function handleDeleteAccount(e) {
    e.preventDefault();
    
    // Valida o formulário
    if (!validateDeleteForm()) {
        return;
    }
    
    const password = document.getElementById('currentPassword').value;
    const deleteButton = document.querySelector('#deleteAccountForm button[type="submit"]');
    const originalButtonText = deleteButton.innerHTML;
    
    try {
        // Desabilita o botão e mostra um indicador de carregamento
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Excluindo...';
        
        // Chama o serviço para excluir a conta
        await AuthService.deleteAccount(password);
        
        // Mostra mensagem de sucesso
        showAlert('Sua conta foi excluída com sucesso. Você será redirecionado para a página inicial.', 'success');
        
        // Fecha o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAccountModal'));
        if (modal) {
            modal.hide();
        }
        
        // Redireciona para a página inicial após um pequeno atraso
        setTimeout(() => {
            navigateTo(CONFIG.ROUTES.HOME);
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao excluir conta:', error);
        
        let errorMessage = 'Ocorreu um erro ao tentar excluir sua conta. Por favor, tente novamente.';
        
        // Mensagens de erro mais específicas com base na resposta da API
        if (error.response) {
            if (error.response.status === 400 && error.response.data.current_password) {
                errorMessage = 'A senha fornecida está incorreta. Por favor, tente novamente.';
                document.getElementById('currentPassword').classList.add('is-invalid');
            } else if (error.response.status === 403) {
                errorMessage = 'Você não tem permissão para realizar esta ação.';
            } else if (error.response.status === 404) {
                errorMessage = 'Conta não encontrada ou já foi excluída.';
            }
        }
        
        // Mostra a mensagem de erro
        showAlert(errorMessage, 'danger');
        
    } finally {
        // Restaura o botão ao estado original
        if (deleteButton) {
            deleteButton.disabled = false;
            deleteButton.innerHTML = originalButtonText;
        }
    }
}

// Função para limpar o formulário de exclusão de conta quando o modal for fechado
function setupDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
        modal.addEventListener('hidden.bs.modal', function () {
            const form = document.getElementById('deleteAccountForm');
            if (form) {
                form.reset();
                // Remove as classes de validação
                const formInputs = form.querySelectorAll('.is-invalid');
                formInputs.forEach(input => input.classList.remove('is-invalid'));
            }
        });
    }
}

// Inicialização dos eventos da página de perfil
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário está autenticado
    if (!StorageService.isAuthenticated()) {
        navigateTo(CONFIG.ROUTES.LOGIN);
        return;
    }
    
    // Configura o modal de exclusão de conta
    setupDeleteAccountModal();
    
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
    
    // Adiciona evento de envio do formulário de perfil
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Aqui você pode adicionar a lógica para salvar as alterações do perfil
            const formData = {
                first_name: document.getElementById('first-name').value,
                last_name: document.getElementById('last-name').value,
                display_name: document.getElementById('display-name').value,
                bio: document.getElementById('bio').value
            };
            
            try {
                // Simulando uma requisição de atualização
                console.log('Dados do perfil a serem salvos:', formData);
                
                // Aqui você faria a chamada para a API
                // await AuthService.updateProfile(formData);
                
                // Mostra mensagem de sucesso
                alert('Perfil atualizado com sucesso!');
                
                // Atualiza o nome de exibição na sidebar
                const displayName = formData.display_name || formData.first_name || user?.email?.split('@')[0] || 'Usuário';
                document.querySelector('.user-info h5').textContent = displayName;
                
            } catch (error) {
                console.error('Erro ao atualizar perfil:', error);
                alert('Ocorreu um erro ao atualizar o perfil. Por favor, tente novamente.');
            }
        });
    }
    
    // Adiciona evento para o botão de cancelar
    const cancelButton = document.querySelector('#profile-form button[type="button"]');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            // Recarrega a página para descartar as alterações
            window.location.reload();
        });
    }
});
