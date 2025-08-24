// FutureMesh Authentication
class FutureMeshAuth {
    
    static init() {
        this.checkAuthStatus();
        this.setupAuthEventListeners();
    }
    
    static checkAuthStatus() {
        const token = this.getAuthToken();
        const userData = this.getUserData();
        
        if (token && userData) {
            CONFIG.APP_STATE.isAuthenticated = true;
            CONFIG.APP_STATE.currentUser = userData;
            
            // Verify token is still valid
            this.verifyToken().catch(() => {
                this.logout();
            });
        } else {
            this.logout();
        }
    }
    
    static async verifyToken() {
        const token = this.getAuthToken();
        if (!token) throw new Error('No token found');
        
        const response = await fetch(CONFIG.getEndpoint('PROFILE'), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Token verification failed');
        }
        
        const data = await response.json();
        this.setUserData(data.user);
        CONFIG.APP_STATE.currentUser = data.user;
        
        return data.user;
    }
    
    static async login(email, password) {
        try {
            const response = await fetch(CONFIG.getEndpoint('LOGIN'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Store auth data
            this.setAuthToken(data.access_token);
            this.setUserData(data.user);
            
            // Update app state
            CONFIG.APP_STATE.isAuthenticated = true;
            CONFIG.APP_STATE.currentUser = data.user;
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
            
            return data;
            
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    static async register(userData) {
        try {
            const response = await fetch(CONFIG.getEndpoint('REGISTER'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            // Store auth data
            this.setAuthToken(data.access_token);
            this.setUserData(data.user);
            
            // Update app state
            CONFIG.APP_STATE.isAuthenticated = true;
            CONFIG.APP_STATE.currentUser = data.user;
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
            
            return data;
            
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
    
    static logout() {
        // Clear stored data
        this.removeAuthToken();
        this.removeUserData();
        
        // Update app state
        CONFIG.APP_STATE.isAuthenticated = false;
        CONFIG.APP_STATE.currentUser = null;
        
        // Disconnect socket if connected
        if (CONFIG.APP_STATE.socket) {
            CONFIG.APP_STATE.socket.disconnect();
            CONFIG.APP_STATE.socket = null;
        }
        
        // Redirect to login
        if (window.location.pathname !== '/' && 
            window.location.pathname !== '/login' && 
            window.location.pathname !== '/register') {
            window.location.href = '/login';
        }
    }
    
    static getAuthToken() {
        return Utils.getStorage(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    }
    
    static setAuthToken(token) {
        Utils.setStorage(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, token);
    }
    
    static removeAuthToken() {
        Utils.removeStorage(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    }
    
    static getUserData() {
        return Utils.getStorage(CONFIG.STORAGE_KEYS.USER_DATA);
    }
    
    static setUserData(userData) {
        Utils.setStorage(CONFIG.STORAGE_KEYS.USER_DATA, userData);
    }
    
    static removeUserData() {
        Utils.removeStorage(CONFIG.STORAGE_KEYS.USER_DATA);
    }
    
    static getCurrentUser() {
        return CONFIG.APP_STATE.currentUser || this.getUserData();
    }
    
    static isAuthenticated() {
        return CONFIG.APP_STATE.isAuthenticated && !!this.getAuthToken();
    }
    
    static hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }
    
    static hasPermission(requiredRole) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        return CONFIG.hasPermission(user.role, requiredRole);
    }
    
    static requireAuth() {
        if (!this.isAuthenticated()) {
            this.logout();
            return false;
        }
        return true;
    }
    
    static requireRole(role) {
        if (!this.hasRole(role)) {
            showToast('Access denied: Insufficient permissions', 'danger');
            return false;
        }
        return true;
    }
    
    static getAuthHeaders() {
        const token = this.getAuthToken();
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    }
    
    static async authenticatedFetch(url, options = {}) {
        const headers = {
            ...this.getAuthHeaders(),
            ...options.headers
        };
        
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // If unauthorized, logout
        if (response.status === 401) {
            this.logout();
            throw new Error('Authentication failed');
        }
        
        return response;
    }
    
    static setupAuthEventListeners() {
        // Handle token expiration
        window.addEventListener('storage', (e) => {
            if (e.key === CONFIG.STORAGE_KEYS.ACCESS_TOKEN && !e.newValue) {
                // Token was removed in another tab
                this.logout();
            }
        });
        
        // Handle online/offline status
        window.addEventListener('online', () => {
            if (this.isAuthenticated()) {
                this.verifyToken().catch(() => {
                    this.logout();
                });
            }
        });
        
        // Periodic token verification (every 5 minutes)
        setInterval(() => {
            if (this.isAuthenticated() && navigator.onLine) {
                this.verifyToken().catch(() => {
                    console.warn('Token verification failed, logging out');
                    this.logout();
                });
            }
        }, 5 * 60 * 1000);
    }
    
    static async updateProfile(profileData) {
        try {
            const response = await this.authenticatedFetch(CONFIG.getEndpoint('PROFILE'), {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Profile update failed');
            }
            
            const data = await response.json();
            
            // Update stored user data
            this.setUserData(data.user);
            CONFIG.APP_STATE.currentUser = data.user;
            
            return data.user;
            
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }
    
    static async changePassword(currentPassword, newPassword) {
        try {
            const response = await this.authenticatedFetch('/api/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Password change failed');
            }
            
            const data = await response.json();
            
            // Update token if provided
            if (data.access_token) {
                this.setAuthToken(data.access_token);
            }
            
            return data;
            
        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        }
    }
    
    static async requestPasswordReset(email) {
        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Password reset request failed');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }
    
    static async resetPassword(token, newPassword) {
        try {
            const response = await fetch('/api/reset-password/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    token, 
                    new_password: newPassword 
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Password reset failed');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }
}

// Form validation and submission handlers
class AuthForms {
    
    static initLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.email.value.trim();
            const password = form.password.value;
            
            // Validate inputs
            if (!Utils.validateEmail(email)) {
                showToast('Please enter a valid email address', 'danger');
                return;
            }
            
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'danger');
                return;
            }
            
            // Show loading
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
            
            try {
                await FutureMeshAuth.login(email, password);
                showToast('Login successful!', 'success');
            } catch (error) {
                showToast(error.message, 'danger');
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    static initRegisterForm() {
        const form = document.getElementById('registerForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const userData = Object.fromEntries(formData.entries());
            
            // Validate inputs
            if (!Utils.validateEmail(userData.email)) {
                showToast('Please enter a valid email address', 'danger');
                return;
            }
            
            if (!Utils.validatePassword(userData.password)) {
                showToast('Password must be at least 8 characters with uppercase, lowercase, and number', 'danger');
                return;
            }
            
            if (userData.password !== userData.confirmPassword) {
                showToast('Passwords do not match', 'danger');
                return;
            }
            
            // Remove confirm password field
            delete userData.confirmPassword;
            
            // Show loading
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            
            try {
                await FutureMeshAuth.register(userData);
                showToast('Registration successful!', 'success');
            } catch (error) {
                showToast(error.message, 'danger');
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    static initPasswordResetForm() {
        const form = document.getElementById('passwordResetForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.email.value.trim();
            
            if (!Utils.validateEmail(email)) {
                showToast('Please enter a valid email address', 'danger');
                return;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            try {
                await FutureMeshAuth.requestPasswordReset(email);
                showToast('Password reset email sent!', 'success');
                form.reset();
            } catch (error) {
                showToast(error.message, 'danger');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
}

// Global functions for template use
window.getCurrentUser = () => FutureMeshAuth.getCurrentUser();
window.getAuthToken = () => FutureMeshAuth.getAuthToken();
window.isAuthenticated = () => FutureMeshAuth.isAuthenticated();
window.hasRole = (role) => FutureMeshAuth.hasRole(role);
window.hasPermission = (role) => FutureMeshAuth.hasPermission(role);
window.logout = () => FutureMeshAuth.logout();

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
    FutureMeshAuth.init();
    AuthForms.initLoginForm();
    AuthForms.initRegisterForm();
    AuthForms.initPasswordResetForm();
});

// Export for use in other modules
window.FutureMeshAuth = FutureMeshAuth;
window.AuthForms = AuthForms;