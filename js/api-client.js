/**
 * Frontend API Client for GeoLine Website
 * Handles public API communication with the backend
 */

const API_BASE_URL = 'http://localhost:8000';

class FrontendAPIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Generic GET request
     */
    async get(endpoint, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.baseURL}${endpoint}${queryString ? '?' + queryString : ''}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error (GET ${endpoint}):`, error);
            return [];
        }
    }

    /**
     * Generic POST request
     */
    async post(endpoint, data) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            console.log(`Making POST request to: ${url}`, data);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            console.log(`Response status: ${response.status}`);
            
            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    }
                } catch (e) {
                    // Ignore JSON parse errors
                }
                throw new Error(errorMessage);
            }
            
            if (response.status === 204) {
                return null;
            }
            
            const result = await response.json();
            console.log('Response data:', result);
            return result;
        } catch (error) {
            console.error(`API Error (POST ${endpoint}):`, error);
            // Re-throw with more context
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error(`Network error: Could not connect to ${this.baseURL}. Make sure the backend server is running.`);
            }
            throw error;
        }
    }

    /**
     * Get image URL
     */
    getImageUrl(imagePath) {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        return `${this.baseURL}/uploads/${imagePath}`;
    }

    // Carousel endpoints
    async getCarouselSlides() {
        return await this.get('/api/carousel', { active_only: true });
    }

    // Services endpoints
    async getServices() {
        return await this.get('/api/services', { active_only: true });
    }

    // Portfolio endpoints
    async getPortfolioProjects(statusFilter = null) {
        const params = { active_only: true };
        if (statusFilter) {
            params.status_filter = statusFilter;
        }
        return await this.get('/api/portfolio', params);
    }

    // Blog endpoints
    async getBlogPosts() {
        return await this.get('/api/blog', { published_only: true });
    }

    // FAQ endpoints
    async getFAQs() {
        return await this.get('/api/faqs', { active_only: true });
    }

    // About endpoints
    async getAboutContent() {
        const content = await this.get('/api/about', { active_only: true });
        return content.length > 0 ? content[0] : null;
    }

    // Contact endpoints
    async getContactInfo() {
        return await this.get('/api/contact/info', { active_only: true });
    }

    async submitContactForm(data) {
        return await this.post('/api/contact/submit', data);
    }

    // Statistics endpoints
    async getStatistics() {
        return await this.get('/api/statistics', { active_only: true });
    }

    // Partners endpoints
    async getPartners() {
        return await this.get('/api/partners', { active_only: true });
    }

    // Licenses endpoints
    async getLicenses() {
        return await this.get('/api/licenses', { active_only: true });
    }
}

// Create global API client instance
const frontendAPI = new FrontendAPIClient();

