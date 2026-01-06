/**
 * Admin Panel JavaScript
 * Main application logic for content management
 */

let currentSection = 'dashboard';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

/**
 * Check authentication status
 */
async function checkAuth() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        showLoginPage();
        return;
    }

    try {
        const user = await api.getCurrentUser();
        showDashboard(user);
        loadDashboardStats();
    } catch (error) {
        console.error('Auth check failed:', error);
        showLoginPage();
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('a').dataset.section;
            navigateToSection(section);
        });
    });
}

/**
 * Handle login
 */
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        await api.login(username, password);
        const user = await api.getCurrentUser();
        showDashboard(user);
        loadDashboardStats();
    } catch (error) {
        errorDiv.textContent = error.message || 'Giriş uğursuz oldu';
        errorDiv.classList.remove('d-none');
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    api.clearToken();
    showLoginPage();
}

/**
 * Show login page
 */
function showLoginPage() {
    document.getElementById('login-page').classList.remove('d-none');
    document.getElementById('dashboard').classList.add('d-none');
}

/**
 * Show dashboard
 */
function showDashboard(user) {
    document.getElementById('login-page').classList.add('d-none');
    document.getElementById('dashboard').classList.remove('d-none');
    document.getElementById('current-user').textContent = user.username;
    navigateToSection('dashboard');
}

/**
 * Navigate to section
 */
function navigateToSection(section) {
    currentSection = section;
    
    // Update active menu item
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) {
            link.classList.add('active');
        }
    });

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.add('d-none');
    });

    // Show selected section
    const targetSection = document.getElementById(`section-${section}`);
    if (targetSection) {
        targetSection.classList.remove('d-none');
        updatePageTitle(section);
        loadSectionContent(section);
    }
}

/**
 * Update page title
 */
function updatePageTitle(section) {
    const titles = {
        dashboard: 'İdarə Paneli',
        carousel: 'Karusel Slaydları',
        services: 'Xidmətlər',
        portfolio: 'Portfolyo Layihələri',
        blog: 'Blog Yazıları',
        faqs: 'Suallar',
        about: 'Haqqında Məzmunu',
        contact: 'Əlaqə',
        statistics: 'Statistika',
        partners: 'Tərəfdaşlar',
        licenses: 'Lisenziyalar'
    };
    document.getElementById('page-title').textContent = titles[section] || 'İdarə Paneli';
}

/**
 * Load section content
 */
async function loadSectionContent(section) {
    try {
        switch(section) {
            case 'dashboard':
                await loadDashboardStats();
                break;
            case 'carousel':
                await loadCarouselSlides();
                break;
            case 'services':
                await loadServices();
                break;
            case 'portfolio':
                await loadPortfolioProjects();
                break;
            case 'blog':
                await loadBlogPosts();
                break;
            case 'faqs':
                await loadFAQs();
                break;
            case 'about':
                await loadAboutContent();
                break;
            case 'contact':
                await loadContactInfo();
                await loadContactSubmissions();
                break;
            case 'statistics':
                await loadStatistics();
                break;
            case 'partners':
                await loadPartners();
                break;
            case 'licenses':
                await loadLicenses();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${section}:`, error);
        showError(`${section} məzmunu yüklənə bilmədi`);
    }
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        const [carousel, services, portfolio, contacts] = await Promise.all([
            api.getCarouselSlides(true),
            api.getServices(true),
            api.getPortfolioProjects(true),
            api.getContactSubmissions(true)
        ]);
        
        document.getElementById('stat-carousel').textContent = carousel.length || 0;
        document.getElementById('stat-services').textContent = services.length || 0;
        document.getElementById('stat-portfolio').textContent = portfolio.length || 0;
        document.getElementById('stat-contacts').textContent = contacts.length || 0;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * Load carousel slides
 */
async function loadCarouselSlides() {
    const slides = await api.getCarouselSlides();
    const container = document.getElementById('carousel-list');
    container.innerHTML = slides.length === 0 
        ? '<div class="empty-state"><i class="fas fa-images"></i><p>Karusel slaydı tapılmadı</p></div>'
        : slides.map(slide => createCarouselCard(slide)).join('');
}

function createCarouselCard(slide) {
    const imageUrl = slide.image_path.startsWith('http') 
        ? slide.image_path 
        : `http://localhost:8000/uploads/${slide.image_path}`;
    
    return `
        <div class="content-item">
            <img src="${imageUrl}" alt="${slide.title}" class="content-item-image">
            <div class="content-item-title">${slide.title}</div>
            ${slide.subtitle ? `<p class="text-muted">${slide.subtitle}</p>` : ''}
            <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="badge ${slide.is_active ? 'badge-active' : 'badge-inactive'}">
                    ${slide.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
                </span>
                <span class="text-muted">Sıra: ${slide.order}</span>
            </div>
            <div class="content-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editCarouselSlide(${slide.id})">
                    <i class="fas fa-edit"></i> Redaktə Et
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCarouselSlide(${slide.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

/**
 * Load services
 */
async function loadServices() {
    try {
    const services = await api.getServices();
    const container = document.getElementById('services-list');
        if (!container) {
            console.error('Services container not found');
            return;
        }
    container.innerHTML = services.length === 0
        ? '<div class="empty-state"><i class="fas fa-briefcase"></i><p>Xidmət tapılmadı</p></div>'
        : services.map(service => createServiceCard(service)).join('');
    } catch (error) {
        console.error('Error loading services:', error);
        const container = document.getElementById('services-list');
        if (container) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Xidmətlər yüklənərkən xəta: ${error.message}</p></div>`;
        }
    }
}

function createServiceCard(service) {
    let imageUrl = service.image_path.startsWith('http')
        ? service.image_path
        : `http://localhost:8000/uploads/${service.image_path}`;
    
    // Handle default placeholder gracefully
    if (service.image_path === "services/default-placeholder.jpg") {
        imageUrl = "https://via.placeholder.com/300x200?text=Service";
    }
    
    return `
        <div class="content-item">
            <img src="${imageUrl}" alt="${service.title}" class="content-item-image" onerror="this.src='https://via.placeholder.com/300x200?text=Service'">
            <div class="content-item-title">${service.title}</div>
            ${service.video_url ? '<span class="badge badge-info"><i class="fas fa-video"></i> Video var</span>' : ''}
            <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="badge ${service.is_active ? 'badge-active' : 'badge-inactive'}">
                    ${service.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
                </span>
            </div>
            <div class="content-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editService(${service.id})">
                    <i class="fas fa-edit"></i> Redaktə Et
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

/**
 * Load portfolio projects
 */
async function loadPortfolioProjects() {
    const projects = await api.getPortfolioProjects();
    const container = document.getElementById('portfolio-list');
    container.innerHTML = projects.length === 0
        ? '<div class="empty-state"><i class="fas fa-folder-open"></i><p>Portfolyo layihəsi tapılmadı</p></div>'
        : projects.map(project => createPortfolioCard(project)).join('');
}

function createPortfolioCard(project) {
    const imageUrl = project.image_path.startsWith('http')
        ? project.image_path
        : `http://localhost:8000/uploads/${project.image_path}`;
    
    const statusBadges = {
        'completed': 'badge-success',
        'in_progress': 'badge-warning',
        'future': 'badge-info'
    };
    
    const statusLabels = {
        'completed': 'Tamamlanıb',
        'in_progress': 'Davam edir',
        'future': 'Gələcək'
    };
    
    return `
        <div class="content-item">
            <img src="${imageUrl}" alt="${project.title}" class="content-item-image">
            <div class="content-item-title">${project.title}</div>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="badge ${statusBadges[project.status]}">${statusLabels[project.status] || project.status}</span>
                <span class="badge ${project.is_active ? 'badge-active' : 'badge-inactive'}">
                    ${project.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
                </span>
            </div>
            <div class="content-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editPortfolioProject(${project.id})">
                    <i class="fas fa-edit"></i> Redaktə Et
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePortfolioProject(${project.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

/**
 * Load blog posts
 */
async function loadBlogPosts() {
    const posts = await api.getBlogPosts();
    const container = document.getElementById('blog-list');
    container.innerHTML = posts.length === 0
        ? '<div class="empty-state"><i class="fas fa-blog"></i><p>Blog yazısı tapılmadı</p></div>'
        : posts.map(post => createBlogCard(post)).join('');
}

function createBlogCard(post) {
    const imageUrl = post.image_path 
        ? (post.image_path.startsWith('http') ? post.image_path : `http://localhost:8000/uploads/${post.image_path}`)
        : 'https://via.placeholder.com/300x200';
    
    return `
        <div class="content-item">
            ${post.image_path ? `<img src="${imageUrl}" alt="${post.title}" class="content-item-image">` : ''}
            <div class="content-item-title">${post.title}</div>
            ${post.excerpt ? `<p class="text-muted small">${post.excerpt.substring(0, 100)}...</p>` : ''}
            <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="badge ${post.is_published ? 'badge-published' : 'badge-draft'}">
                    ${post.is_published ? 'Dərc olunub' : 'Qaralama'}
                </span>
                ${post.author ? `<span class="text-muted small">Müəllif: ${post.author}</span>` : ''}
            </div>
            <div class="content-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editBlogPost(${post.id})">
                    <i class="fas fa-edit"></i> Redaktə Et
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteBlogPost(${post.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

/**
 * Load FAQs
 */
async function loadFAQs() {
    const faqs = await api.getFAQs();
    const container = document.getElementById('faqs-list');
    container.innerHTML = faqs.length === 0
        ? '<div class="empty-state"><i class="fas fa-question-circle"></i><p>Sual tapılmadı</p></div>'
        : faqs.map(faq => createFAQCard(faq)).join('');
}

function createFAQCard(faq) {
    return `
        <div class="content-item">
            <div class="content-item-title">${faq.question}</div>
            <p class="text-muted">${faq.answer.substring(0, 150)}...</p>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="badge ${faq.is_active ? 'badge-active' : 'badge-inactive'}">
                    ${faq.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
                </span>
                <span class="text-muted">Sıra: ${faq.order}</span>
            </div>
            <div class="content-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editFAQ(${faq.id})">
                    <i class="fas fa-edit"></i> Redaktə Et
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteFAQ(${faq.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

/**
 * Load about content
 */
async function loadAboutContent() {
    const content = await api.getAboutContent();
    const container = document.getElementById('about-list');
    container.innerHTML = content.length === 0
        ? '<div class="empty-state"><i class="fas fa-info-circle"></i><p>Haqqında məzmunu tapılmadı</p></div>'
        : content.map(item => createAboutCard(item)).join('');
}

function createAboutCard(item) {
    const imageUrl = item.image_path
        ? (item.image_path.startsWith('http') ? item.image_path : `http://localhost:8000/uploads/${item.image_path}`)
        : 'https://via.placeholder.com/300x200';
    
    return `
        <div class="content-item">
            ${item.image_path ? `<img src="${imageUrl}" alt="${item.title}" class="content-item-image">` : ''}
            <div class="content-item-title">${item.title}</div>
            ${item.subtitle ? `<p class="text-muted">${item.subtitle}</p>` : ''}
            <div class="content-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editAboutContent(${item.id})">
                    <i class="fas fa-edit"></i> Redaktə Et
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAboutContent(${item.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

/**
 * Load contact info
 */
async function loadContactInfo() {
    const info = await api.getContactInfo();
    const container = document.getElementById('contact-info-list');
    container.innerHTML = info.length === 0
        ? '<div class="empty-state"><i class="fas fa-envelope"></i><p>Əlaqə məlumatı tapılmadı</p></div>'
        : info.map(item => createContactInfoCard(item)).join('');
}

function createContactInfoCard(item) {
    const typeLabels = {
        'phone': 'Telefon',
        'email': 'E-poçt',
        'address': 'Ünvan',
        'hours': 'İş saatları',
        'whatsapp': 'WhatsApp'
    };
    
    return `
        <div class="content-item">
            <div class="content-item-title">${item.label}</div>
            <p class="text-muted">${item.value}</p>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="badge">${typeLabels[item.type] || item.type}</span>
                <span class="badge ${item.is_active ? 'badge-active' : 'badge-inactive'}">
                    ${item.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
                </span>
            </div>
            <div class="content-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editContactInfo(${item.id})">
                    <i class="fas fa-edit"></i> Redaktə Et
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteContactInfo(${item.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

/**
 * Load contact submissions
 */
async function loadContactSubmissions() {
    const submissions = await api.getContactSubmissions();
    const container = document.getElementById('contact-submissions-list');
    container.innerHTML = submissions.length === 0
        ? '<div class="empty-state"><i class="fas fa-envelope"></i><p>Əlaqə müraciəti tapılmadı</p></div>'
        : submissions.map(sub => createContactSubmissionCard(sub)).join('');
}

function createContactSubmissionCard(sub) {
    return `
        <div class="content-item">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="content-item-title">${sub.name}</div>
                    <p class="text-muted mb-1">${sub.email}</p>
                    ${sub.subject ? `<p class="mb-1"><strong>Mövzu:</strong> ${sub.subject}</p>` : ''}
                    <p class="text-muted">${sub.message.substring(0, 200)}...</p>
                </div>
                <span class="badge ${sub.is_read ? 'badge-secondary' : 'badge-warning'}">
                    ${sub.is_read ? 'Oxunub' : 'Oxunmayıb'}
                </span>
            </div>
            <div class="text-muted small mt-2">
                ${new Date(sub.created_at).toLocaleString('az-AZ')}
            </div>
            <div class="content-item-actions">
                ${!sub.is_read ? `
                    <button class="btn btn-sm btn-success" onclick="markSubmissionAsRead(${sub.id})">
                        <i class="fas fa-check"></i> Oxunub kimi işarələ
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteContactSubmission(${sub.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

/**
 * Load statistics
 */
async function loadStatistics() {
    const stats = await api.getStatistics();
    const container = document.getElementById('statistics-list');
    container.innerHTML = stats.length === 0
        ? '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>Statistika tapılmadı</p></div>'
        : stats.map(stat => createStatisticCard(stat)).join('');
}

function createStatisticCard(stat) {
    return `
        <div class="content-item">
            <div class="content-item-title">${stat.label}</div>
            <h3 class="text-primary">${stat.value}</h3>
            ${stat.icon ? `<i class="${stat.icon}"></i>` : ''}
            <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="badge ${stat.is_active ? 'badge-active' : 'badge-inactive'}">
                    ${stat.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
                </span>
                <span class="text-muted">Sıra: ${stat.order}</span>
            </div>
            <div class="content-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editStatistic(${stat.id})">
                    <i class="fas fa-edit"></i> Redaktə Et
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStatistic(${stat.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

/**
 * Load partners
 */
async function loadPartners() {
    const partners = await api.getPartners();
    const container = document.getElementById('partners-list');
    container.innerHTML = partners.length === 0
        ? '<div class="empty-state"><i class="fas fa-handshake"></i><p>Tərəfdaş tapılmadı</p></div>'
        : partners.map(partner => createPartnerCard(partner)).join('');
}

function createPartnerCard(partner) {
    const imageUrl = partner.image_path.startsWith('http')
        ? partner.image_path
        : `http://localhost:8000/uploads/${partner.image_path}`;
    
    return `
        <div class="content-item">
            <img src="${imageUrl}" alt="${partner.name}" class="content-item-image">
            <div class="content-item-title">${partner.name}</div>
            ${partner.website_url ? `<a href="${partner.website_url}" target="_blank" class="text-muted small">${partner.website_url}</a>` : ''}
            <div class="content-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editPartner(${partner.id})">
                    <i class="fas fa-edit"></i> Redaktə Et
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePartner(${partner.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

/**
 * Load licenses
 */
async function loadLicenses() {
    const licenses = await api.getLicenses();
    const container = document.getElementById('licenses-list');
    container.innerHTML = licenses.length === 0
        ? '<div class="empty-state"><i class="fas fa-certificate"></i><p>Lisenziya tapılmadı</p></div>'
        : licenses.map(license => createLicenseCard(license)).join('');
}

function createLicenseCard(license) {
    const imageUrl = license.image_path.startsWith('http')
        ? license.image_path
        : `http://localhost:8000/uploads/${license.image_path}`;
    
    return `
        <div class="content-item">
            <img src="${imageUrl}" alt="${license.title}" class="content-item-image">
            <div class="content-item-title">${license.title}</div>
            <div class="content-item-actions">
                <button class="btn btn-sm btn-primary" onclick="editLicense(${license.id})">
                    <i class="fas fa-edit"></i> Redaktə Et
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteLicense(${license.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `;
}

/**
 * Utility functions - Toast notifications
 */
function showError(message) {
    showToast('Xəta', message, 'danger');
}

function showSuccess(message) {
    showToast('Uğurlu', message, 'success');
}

function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Remove existing type classes
    toast.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning');
    
    // Add type class
    if (type === 'success') {
        toast.classList.add('bg-success', 'text-white');
    } else if (type === 'danger') {
        toast.classList.add('bg-danger', 'text-white');
    } else if (type === 'warning') {
        toast.classList.add('bg-warning', 'text-dark');
    } else {
        toast.classList.add('bg-info', 'text-white');
    }
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Delete functions (modals are in modals.js)
async function deleteCarouselSlide(id) {
    if (confirm('Bu karusel slaydını silmək istədiyinizə əminsiniz?')) {
        try {
            await api.deleteCarouselSlide(id);
            await loadCarouselSlides();
            showSuccess('Karusel slaydı uğurla silindi');
        } catch (error) {
            showError('Karusel slaydı silinə bilmədi: ' + error.message);
        }
    }
}

async function deleteService(id) {
    if (confirm('Bu xidməti silmək istədiyinizə əminsiniz?')) {
        try {
            await api.deleteService(id);
            await loadServices();
            showSuccess('Xidmət uğurla silindi');
        } catch (error) {
            showError('Xidmət silinə bilmədi: ' + error.message);
        }
    }
}

async function deletePortfolioProject(id) {
    if (confirm('Bu portfolyo layihəsini silmək istədiyinizə əminsiniz?')) {
        try {
            await api.deletePortfolioProject(id);
            await loadPortfolioProjects();
            showSuccess('Portfolyo layihəsi uğurla silindi');
        } catch (error) {
            showError('Portfolyo layihəsi silinə bilmədi: ' + error.message);
        }
    }
}

async function deleteBlogPost(id) {
    if (confirm('Bu blog yazısını silmək istədiyinizə əminsiniz?')) {
        try {
            await api.deleteBlogPost(id);
            await loadBlogPosts();
            showSuccess('Blog yazısı uğurla silindi');
        } catch (error) {
            showError('Blog yazısı silinə bilmədi: ' + error.message);
        }
    }
}

async function deleteFAQ(id) {
    if (confirm('Bu sualı silmək istədiyinizə əminsiniz?')) {
        try {
            await api.deleteFAQ(id);
            await loadFAQs();
            showSuccess('Sual uğurla silindi');
        } catch (error) {
            showError('Sual silinə bilmədi: ' + error.message);
        }
    }
}

async function deleteAboutContent(id) {
    if (confirm('Bu haqqında məzmununu silmək istədiyinizə əminsiniz?')) {
        try {
            await api.deleteAboutContent(id);
            await loadAboutContent();
            showSuccess('Haqqında məzmunu uğurla silindi');
        } catch (error) {
            showError('Haqqında məzmunu silinə bilmədi: ' + error.message);
        }
    }
}

async function deleteContactInfo(id) {
    if (confirm('Bu əlaqə məlumatını silmək istədiyinizə əminsiniz?')) {
        try {
            await api.deleteContactInfo(id);
            await loadContactInfo();
            showSuccess('Əlaqə məlumatı uğurla silindi');
        } catch (error) {
            showError('Əlaqə məlumatı silinə bilmədi: ' + error.message);
        }
    }
}

async function markSubmissionAsRead(id) {
    try {
        await api.markSubmissionAsRead(id);
        await loadContactSubmissions();
        showSuccess('Müraciət oxunub kimi işarələndi');
    } catch (error) {
        showError('Müraciəti oxunub kimi işarələmək mümkün olmadı: ' + error.message);
    }
}

async function deleteContactSubmission(id) {
    if (confirm('Bu əlaqə müraciətini silmək istədiyinizə əminsiniz?')) {
        try {
            await api.deleteContactSubmission(id);
            await loadContactSubmissions();
            showSuccess('Əlaqə müraciəti uğurla silindi');
        } catch (error) {
            showError('Əlaqə müraciəti silinə bilmədi: ' + error.message);
        }
    }
}

async function deleteStatistic(id) {
    if (confirm('Bu statistikani silmək istədiyinizə əminsiniz?')) {
        try {
            await api.deleteStatistic(id);
            await loadStatistics();
            showSuccess('Statistika uğurla silindi');
        } catch (error) {
            showError('Statistika silinə bilmədi: ' + error.message);
        }
    }
}

async function deletePartner(id) {
    if (confirm('Bu tərəfdaşı silmək istədiyinizə əminsiniz?')) {
        try {
            await api.deletePartner(id);
            await loadPartners();
            showSuccess('Tərəfdaş uğurla silindi');
        } catch (error) {
            showError('Tərəfdaş silinə bilmədi: ' + error.message);
        }
    }
}

async function deleteLicense(id) {
    if (confirm('Bu lisenziyanı silmək istədiyinizə əminsiniz?')) {
        try {
            await api.deleteLicense(id);
            await loadLicenses();
            showSuccess('Lisenziya uğurla silindi');
        } catch (error) {
            showError('Lisenziya silinə bilmədi: ' + error.message);
        }
    }
}

