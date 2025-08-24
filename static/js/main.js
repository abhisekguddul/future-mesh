// FutureMesh Main Application
class FutureMeshApp {
    
    static init() {
        this.initializeSidebar();
        this.initializeDropdowns();
        this.initializeTheme();
        this.initializeSearch();
        this.initializeNotifications();
        this.setupGlobalEventListeners();
        this.loadRoleBasedMenu();
    }
    
    static initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
        const mainContent = document.getElementById('mainContent');
        
        if (!sidebar) return;
        
        // Load sidebar state from storage
        const isCollapsed = Utils.getStorage(CONFIG.STORAGE_KEYS.SIDEBAR_STATE);
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
        
        // Toggle sidebar
        const toggleSidebar = () => {
            sidebar.classList.toggle('collapsed');
            const collapsed = sidebar.classList.contains('collapsed');
            Utils.setStorage(CONFIG.STORAGE_KEYS.SIDEBAR_STATE, collapsed);
        };
        
        // Desktop toggle
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }
        
        // Mobile toggle
        if (mobileSidebarToggle) {
            mobileSidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
        }
        
        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (Utils.isMobile() && 
                !sidebar.contains(e.target) && 
                !mobileSidebarToggle?.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth > 1200) {
                sidebar.classList.remove('show');
            }
        }, 250));
    }
    
    static initializeDropdowns() {
        // Notification dropdown
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationPanel = document.getElementById('notificationPanel');
        
        if (notificationBtn && notificationPanel) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationPanel.classList.toggle('show');
                
                // Close user menu if open
                const userMenuPanel = document.getElementById('userMenuPanel');
                if (userMenuPanel) {
                    userMenuPanel.classList.remove('show');
                }
            });
        }
        
        // User menu dropdown
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userMenuPanel = document.getElementById('userMenuPanel');
        
        if (userMenuBtn && userMenuPanel) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenuPanel.classList.toggle('show');
                
                // Close notification panel if open
                if (notificationPanel) {
                    notificationPanel.classList.remove('show');
                }
            });
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            if (notificationPanel) notificationPanel.classList.remove('show');
            if (userMenuPanel) userMenuPanel.classList.remove('show');
        });
    }
    
    static initializeTheme() {
        // Theme is already set via CSS variables
        // This method can be expanded for theme switching
        const savedTheme = Utils.getStorage(CONFIG.STORAGE_KEYS.THEME_PREFERENCE);
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }
    }
    
    static initializeSearch() {
        const searchInput = document.getElementById('globalSearch');
        if (!searchInput) return;
        
        const debouncedSearch = Utils.debounce(async (query) => {
            if (query.length < CONFIG.SEARCH.MIN_QUERY_LENGTH) return;
            
            try {
                await this.performGlobalSearch(query);
            } catch (error) {
                console.error('Search error:', error);
            }
        }, CONFIG.SEARCH.DEBOUNCE_DELAY);
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            debouncedSearch(query);
        });
        
        // Handle search submit
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if (query) {
                    this.performGlobalSearch(query);
                }
            }
        });
    }
    
    static async performGlobalSearch(query) {
        // Implement global search functionality
        console.log('Searching for:', query);
        // This would make API calls to search across jobs, users, etc.
    }
    
    static initializeNotifications() {
        this.loadNotifications();
        this.setupNotificationPolling();
    }
    
    static async loadNotifications() {
        if (!isAuthenticated()) return;
        
        try {
            const response = await FutureMeshAuth.authenticatedFetch(
                CONFIG.getEndpoint('NOTIFICATIONS')
            );
            
            if (response.ok) {
                const data = await response.json();
                this.updateNotificationUI(data.notifications);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }
    
    static updateNotificationUI(notifications) {
        const badge = document.getElementById('notificationBadge');
        const list = document.getElementById('notificationList');
        
        if (!badge || !list) return;
        
        // Update badge count
        const unreadCount = notifications.filter(n => !n.is_read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
        
        // Update notification list
        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-item">
                    <div class="empty-state">
                        <i class="fas fa-bell-slash"></i>
                        <h4>No notifications</h4>
                        <p>You're all caught up!</p>
                    </div>
                </div>
            `;
            return;
        }
        
        list.innerHTML = notifications.slice(0, CONFIG.NOTIFICATIONS.MAX_VISIBLE_NOTIFICATIONS)
            .map(notification => this.createNotificationHTML(notification))
            .join('');
    }
    
    static createNotificationHTML(notification) {
        const timeAgo = Utils.timeAgo(notification.created_at);
        const unreadClass = notification.is_read ? '' : 'unread';
        
        return `
            <div class="notification-item ${unreadClass}" 
                 data-notification-id="${notification.id}"
                 onclick="handleNotificationClick('${notification.id}', '${notification.action_url || '#'}')">
                <h6>${Utils.escapeHtml(notification.title)}</h6>
                <p>${Utils.escapeHtml(notification.message)}</p>
                <span class="notification-time">${timeAgo}</span>
            </div>
        `;
    }
    
    static setupNotificationPolling() {
        if (!isAuthenticated()) return;
        
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.loadNotifications();
            }
        }, CONFIG.NOTIFICATIONS.POLL_INTERVAL);
    }
    
    static loadRoleBasedMenu() {
        const user = getCurrentUser();
        if (!user) return;
        
        const menuContainer = document.getElementById('sidebarMenu');
        if (!menuContainer) return;
        
        const menuItems = CONFIG.getRoleMenu(user.role);
        const currentPath = window.location.pathname;
        
        menuContainer.innerHTML = menuItems.map(item => {
            const isActive = currentPath === item.href ? 'active' : '';
            return `
                <li>
                    <a href="${item.href}" class="${isActive}" data-menu-id="${item.id}">
                        <i class="${item.icon}"></i>
                        <span class="menu-text">${item.text}</span>
                    </a>
                </li>
            `;
        }).join('');
    }
    
    static setupGlobalEventListeners() {
        // Handle online/offline status
        window.addEventListener('online', () => {
            showToast('Connection restored', 'success');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            showToast('You are offline', 'warning');
        });
        
        // Handle visibility change for performance optimization
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.loadNotifications();
                if (typeof refreshDashboard === 'function') {
                    refreshDashboard();
                }
            }
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Handle form submissions globally
        document.addEventListener('submit', (e) => {
            this.handleFormSubmission(e);
        });
    }
    
    static handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('globalSearch');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to close modals and dropdowns
        if (e.key === 'Escape') {
            this.closeAllDropdowns();
            this.closeAllModals();
        }
    }
    
    static closeAllDropdowns() {
        document.querySelectorAll('.notification-panel, .user-menu-panel').forEach(panel => {
            panel.classList.remove('show');
        });
    }
    
    static closeAllModals() {
        document.querySelectorAll('.modal.show').forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }
    
    static handleFormSubmission(e) {
        const form = e.target;
        if (!form.classList.contains('needs-validation')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (form.checkValidity()) {
            // Form is valid, allow submission
            form.classList.add('was-validated');
        } else {
            // Form is invalid, show validation messages
            form.classList.add('was-validated');
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }
    }
    
    static async syncOfflineData() {
        // Implement offline data synchronization
        console.log('Syncing offline data...');
    }
    
    static showLoader(message = 'Loading...') {
        const loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.className = 'global-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="loader-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(loader);
        Utils.fadeIn(loader);
    }
    
    static hideLoader() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            Utils.fadeOut(loader, 300);
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 300);
        }
    }
}

// Toast notification system
class ToastManager {
    
    static show(message, type = 'info', duration = CONFIG.NOTIFICATIONS.TOAST_DURATION) {
        const container = this.getContainer();
        const toast = this.createToast(message, type);
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            this.remove(toast);
        }, duration);
        
        return toast;
    }
    
    static getContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(container);
        }
        return container;
    }
    
    static createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        
        const iconMap = {
            success: 'fas fa-check-circle',
            danger: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-header">
                <i class="${iconMap[type] || iconMap.info}"></i>
                <strong class="me-auto">${Utils.capitalize(type)}</strong>
                <button type="button" class="btn-close" onclick="ToastManager.remove(this.closest('.toast'))"></button>
            </div>
            <div class="toast-body">
                ${Utils.escapeHtml(message)}
            </div>
        `;
        
        return toast;
    }
    
    static remove(toast) {
        if (!toast) return;
        
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// Global helper functions
window.showToast = (message, type = 'info', duration) => {
    return ToastManager.show(message, type, duration);
};

window.showLoader = (message) => {
    FutureMeshApp.showLoader(message);
};

window.hideLoader = () => {
    FutureMeshApp.hideLoader();
};

window.handleNotificationClick = async (notificationId, actionUrl) => {
    try {
        // Mark notification as read
        await FutureMeshAuth.authenticatedFetch(
            CONFIG.getEndpoint('MARK_NOTIFICATION_READ', { id: notificationId }),
            { method: 'POST' }
        );
        
        // Update UI
        const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notificationElement) {
            notificationElement.classList.remove('unread');
        }
        
        // Navigate to action URL
        if (actionUrl && actionUrl !== '#') {
            window.location.href = actionUrl;
        }
        
        // Reload notifications
        FutureMeshApp.loadNotifications();
        
    } catch (error) {
        console.error('Failed to handle notification click:', error);
    }
};

window.markAllNotificationsRead = async () => {
    try {
        const notifications = document.querySelectorAll('.notification-item.unread');
        
        for (const notification of notifications) {
            const notificationId = notification.dataset.notificationId;
            if (notificationId) {
                await FutureMeshAuth.authenticatedFetch(
                    CONFIG.getEndpoint('MARK_NOTIFICATION_READ', { id: notificationId }),
                    { method: 'POST' }
                );
            }
        }
        
        // Reload notifications
        FutureMeshApp.loadNotifications();
        showToast('All notifications marked as read', 'success');
        
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        showToast('Failed to mark notifications as read', 'danger');
    }
};

// Initialize app when DOM is loaded
window.initializeApp = () => {
    FutureMeshApp.init();
};

// Export for use in other modules
window.FutureMeshApp = FutureMeshApp;
window.ToastManager = ToastManager;

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}