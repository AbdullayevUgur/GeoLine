/**
 * API Client for GeoLine CMS
 * Handles all API communication with the backend
 */

const API_BASE_URL = 'http://localhost:8000';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    /**
     * Get authorization headers
     */
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    /**
     * Handle API response
     */
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }
        if (response.status === 204) {
            return null;
        }
        return await response.json();
    }

    /**
     * Login
     */
    async login(username, password) {
        const response = await fetch(`${API_BASE_URL}/api/auth/login/json`, {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ username, password })
        });
        const data = await this.handleResponse(response);
        this.setToken(data.access_token);
        return data;
    }

    /**
     * Get current user
     */
    async getCurrentUser() {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: this.getHeaders()
        });
        return await this.handleResponse(response);
    }

    /**
     * Generic GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
        const response = await fetch(url, {
            headers: this.getHeaders()
        });
        return await this.handleResponse(response);
    }

    /**
     * Generic POST request
     */
    async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }

    /**
     * Generic PUT request
     */
    async put(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return await this.handleResponse(response);
    }

    /**
     * Generic DELETE request
     */
    async delete(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return await this.handleResponse(response);
    }

    /**
     * Upload file with form data
     */
    async uploadFile(endpoint, formData) {
        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: formData
        });
        return await this.handleResponse(response);
    }

    /**
     * Update file
     */
    async updateFile(endpoint, formData) {
        // Refresh token from localStorage before request
        this.token = localStorage.getItem('auth_token');
        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: headers,
            body: formData
        });
        return await this.handleResponse(response);
    }

    /**
     * Post file (for uploading files)
     */
    async postFile(endpoint, formData) {
        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: formData
        });
        return await this.handleResponse(response);
    }

    // Carousel endpoints
    async getCarouselSlides(activeOnly = false) {
        return await this.get('/api/carousel', { active_only: activeOnly });
    }

    async getCarouselSlide(id) {
        return await this.get(`/api/carousel/${id}`);
    }

    async createCarouselSlide(formData) {
        return await this.uploadFile('/api/carousel', formData);
    }

    async updateCarouselSlide(id, data) {
        return await this.put(`/api/carousel/${id}`, data);
    }

    async updateCarouselSlideImage(id, formData) {
        return await this.updateFile(`/api/carousel/${id}/image`, formData);
    }

    async deleteCarouselSlide(id) {
        return await this.delete(`/api/carousel/${id}`);
    }

    // Services endpoints
    async getServices(activeOnly = false) {
        return await this.get('/api/services', { active_only: activeOnly });
    }

    async getService(id) {
        return await this.get(`/api/services/${id}`);
    }

    async createService(formData) {
        return await this.uploadFile('/api/services', formData);
    }

    async updateService(id, data) {
        return await this.put(`/api/services/${id}`, data);
    }

    async updateServiceImage(id, formData) {
        return await this.updateFile(`/api/services/${id}/image`, formData);
    }

    async updateServiceVideo(id, formData) {
        return await this.updateFile(`/api/services/${id}/video`, formData);
    }

    async uploadServiceImages(formData) {
        return await this.uploadFile('/api/services/upload-images', formData);
    }

    async updateServiceImages(id, formData) {
        return await this.updateFile(`/api/services/${id}/images`, formData);
    }

    async deleteService(id) {
        return await this.delete(`/api/services/${id}`);
    }

    // Portfolio endpoints
    async getPortfolioProjects(activeOnly = false, statusFilter = null) {
        const params = { active_only: activeOnly };
        if (statusFilter) params.status_filter = statusFilter;
        return await this.get('/api/portfolio', params);
    }

    async getPortfolioProject(id) {
        return await this.get(`/api/portfolio/${id}`);
    }

    async createPortfolioProject(formData) {
        return await this.uploadFile('/api/portfolio', formData);
    }

    async updatePortfolioProject(id, data) {
        return await this.put(`/api/portfolio/${id}`, data);
    }

    async updatePortfolioProjectImage(id, formData) {
        return await this.updateFile(`/api/portfolio/${id}/image`, formData);
    }

    async deletePortfolioProject(id) {
        return await this.delete(`/api/portfolio/${id}`);
    }

    // Blog endpoints
    async getBlogPosts(publishedOnly = false) {
        return await this.get('/api/blog', { published_only: publishedOnly });
    }

    async getBlogPost(id) {
        return await this.get(`/api/blog/${id}`);
    }

    async createBlogPost(formData) {
        return await this.uploadFile('/api/blog', formData);
    }

    async updateBlogPost(id, data) {
        return await this.put(`/api/blog/${id}`, data);
    }

    async updateBlogPostImage(id, formData) {
        return await this.updateFile(`/api/blog/${id}/image`, formData);
    }

    async deleteBlogPost(id) {
        return await this.delete(`/api/blog/${id}`);
    }

    // FAQ endpoints
    async getFAQs(activeOnly = false) {
        return await this.get('/api/faqs', { active_only: activeOnly });
    }

    async getFAQ(id) {
        return await this.get(`/api/faqs/${id}`);
    }

    async createFAQ(data) {
        return await this.post('/api/faqs', data);
    }

    async updateFAQ(id, data) {
        return await this.put(`/api/faqs/${id}`, data);
    }

    async deleteFAQ(id) {
        return await this.delete(`/api/faqs/${id}`);
    }

    // About endpoints
    async getAboutContent(activeOnly = false) {
        return await this.get('/api/about', { active_only: activeOnly });
    }

    async getAboutContentById(id) {
        return await this.get(`/api/about/${id}`);
    }

    async createAboutContent(formData) {
        return await this.uploadFile('/api/about', formData);
    }

    async updateAboutContent(id, data) {
        return await this.put(`/api/about/${id}`, data);
    }

    async updateAboutContentImage(id, formData) {
        return await this.updateFile(`/api/about/${id}/image`, formData);
    }

    async deleteAboutContent(id) {
        return await this.delete(`/api/about/${id}`);
    }

    // Contact endpoints
    async getContactInfo(activeOnly = false) {
        return await this.get('/api/contact/info', { active_only: activeOnly });
    }

    async getContactInfoById(id) {
        return await this.get(`/api/contact/info/${id}`);
    }

    async createContactInfo(data) {
        return await this.post('/api/contact/info', data);
    }

    async updateContactInfo(id, data) {
        return await this.put(`/api/contact/info/${id}`, data);
    }

    async deleteContactInfo(id) {
        return await this.delete(`/api/contact/info/${id}`);
    }

    async getContactSubmissions(unreadOnly = false) {
        return await this.get('/api/contact/submissions', { unread_only: unreadOnly });
    }

    async markSubmissionAsRead(id) {
        return await this.put(`/api/contact/submissions/${id}/read`, {});
    }

    async deleteContactSubmission(id) {
        return await this.delete(`/api/contact/submissions/${id}`);
    }

    // Statistics endpoints
    async getStatistics(activeOnly = false) {
        return await this.get('/api/statistics', { active_only: activeOnly });
    }

    async getStatistic(id) {
        return await this.get(`/api/statistics/${id}`);
    }

    async createStatistic(data) {
        return await this.post('/api/statistics', data);
    }

    async updateStatistic(id, data) {
        return await this.put(`/api/statistics/${id}`, data);
    }

    async deleteStatistic(id) {
        return await this.delete(`/api/statistics/${id}`);
    }

    // Partners endpoints
    async getPartners(activeOnly = false) {
        return await this.get('/api/partners', { active_only: activeOnly });
    }

    async getPartner(id) {
        return await this.get(`/api/partners/${id}`);
    }

    async createPartner(formData) {
        return await this.uploadFile('/api/partners', formData);
    }

    async updatePartner(id, data) {
        return await this.put(`/api/partners/${id}`, data);
    }

    async updatePartnerImage(id, formData) {
        return await this.updateFile(`/api/partners/${id}/image`, formData);
    }

    async deletePartner(id) {
        return await this.delete(`/api/partners/${id}`);
    }

    // Licenses endpoints
    async getLicenses(activeOnly = false) {
        return await this.get('/api/licenses', { active_only: activeOnly });
    }

    async getLicense(id) {
        return await this.get(`/api/licenses/${id}`);
    }

    async createLicense(formData) {
        return await this.uploadFile('/api/licenses', formData);
    }

    async updateLicense(id, data) {
        return await this.put(`/api/licenses/${id}`, data);
    }

    async updateLicenseImage(id, formData) {
        return await this.updateFile(`/api/licenses/${id}/image`, formData);
    }

    async deleteLicense(id) {
        return await this.delete(`/api/licenses/${id}`);
    }
}

// Create global API client instance
const api = new APIClient();

