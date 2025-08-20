const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Auth methods
    async login(email, password) {
        const response = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (response.success) {
            this.setToken(response.token);
        }
        
        return response;
    }

    async signup(email, password, firstName, lastName) {
        const response = await this.request('/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, firstName, lastName }),
        });
        
        if (response.success) {
            this.setToken(response.token);
        }
        
        return response;
    }

    logout() {
        this.removeToken();
    }

    // Problem methods
    async getProblems() {
        return this.request('/problems');
    }

    async createProblem(problemData) {
        return this.request('/problems', {
            method: 'POST',
            body: JSON.stringify(problemData),
        });
    }

    async updateProblem(problemId, problemData) {
        return this.request(`/problems/${problemId}`, {
            method: 'PUT',
            body: JSON.stringify(problemData),
        });
    }

    async deleteProblem(problemId) {
        return this.request(`/problems/${problemId}`, {
            method: 'DELETE',
        });
    }
}

export default new ApiService();