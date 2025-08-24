// FutureMesh Configuration
const CONFIG = {
    // API Configuration
    API_BASE_URL: window.location.origin,
    API_ENDPOINTS: {
        // Authentication
        LOGIN: '/api/login',
        REGISTER: '/api/register',
        PROFILE: '/api/profile',
        
        // Jobs
        JOBS: '/api/jobs',
        APPLY_JOB: '/api/jobs/{id}/apply',
        APPROVE_JOB: '/api/jobs/{id}/approve',
        
        // Applications
        APPLICATIONS: '/api/applications',
        SHORTLIST_APPLICATION: '/api/applications/{id}/shortlist',
        
        // Users
        ALUMNI: '/api/alumni',
        
        // Mentorship
        MENTORSHIP_REQUESTS: '/api/mentorship-requests',
        RESPOND_MENTORSHIP: '/api/mentorship-requests/{id}/respond',
        
        // Notifications
        NOTIFICATIONS: '/api/notifications',
        MARK_NOTIFICATION_READ: '/api/notifications/{id}/read',
        
        // Dashboard
        DASHBOARD_STATS: '/api/dashboard/stats',
        
        // File Upload
        UPLOAD: '/api/upload'
    },
    
    // Socket.IO Configuration
    SOCKET_CONFIG: {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true
    },
    
    // Role-based Menu Configuration
    ROLE_MENUS: {
        student: [
            { icon: 'fas fa-tachometer-alt', text: 'Dashboard', href: '/dashboard', id: 'dashboard' },
            { icon: 'fas fa-briefcase', text: 'Jobs', href: '/jobs', id: 'jobs' },
            { icon: 'fas fa-file-alt', text: 'Applications', href: '/applications', id: 'applications' },
            { icon: 'fas fa-users', text: 'Mentorship', href: '/mentorship', id: 'mentorship' },
            { icon: 'fas fa-project-diagram', text: 'Projects', href: '/projects', id: 'projects' },
            { icon: 'fas fa-user', text: 'Profile', href: '/profile', id: 'profile' },
            { icon: 'fas fa-bell', text: 'Notifications', href: '/notifications', id: 'notifications' }
        ],
        alumni: [
            { icon: 'fas fa-tachometer-alt', text: 'Dashboard', href: '/dashboard', id: 'dashboard' },
            { icon: 'fas fa-user-graduate', text: 'Students', href: '/students', id: 'students' },
            { icon: 'fas fa-comments', text: 'Mentorship', href: '/mentorship', id: 'mentorship' },
            { icon: 'fas fa-chart-line', text: 'Analytics', href: '/analytics', id: 'analytics' },
            { icon: 'fas fa-user', text: 'Profile', href: '/profile', id: 'profile' },
            { icon: 'fas fa-bell', text: 'Notifications', href: '/notifications', id: 'notifications' }
        ],
        hod: [
            { icon: 'fas fa-tachometer-alt', text: 'Dashboard', href: '/dashboard', id: 'dashboard' },
            { icon: 'fas fa-briefcase', text: 'Jobs', href: '/jobs', id: 'jobs' },
            { icon: 'fas fa-file-alt', text: 'Applications', href: '/applications', id: 'applications' },
            { icon: 'fas fa-users', text: 'Students', href: '/students', id: 'students' },
            { icon: 'fas fa-chart-bar', text: 'Reports', href: '/reports', id: 'reports' },
            { icon: 'fas fa-cogs', text: 'Settings', href: '/settings', id: 'settings' },
            { icon: 'fas fa-bell', text: 'Notifications', href: '/notifications', id: 'notifications' }
        ],
        hr: [
            { icon: 'fas fa-tachometer-alt', text: 'Dashboard', href: '/dashboard', id: 'dashboard' },
            { icon: 'fas fa-plus-circle', text: 'Post Job', href: '/post-job', id: 'post-job' },
            { icon: 'fas fa-briefcase', text: 'My Jobs', href: '/my-jobs', id: 'my-jobs' },
            { icon: 'fas fa-file-alt', text: 'Applications', href: '/applications', id: 'applications' },
            { icon: 'fas fa-users', text: 'Candidates', href: '/candidates', id: 'candidates' },
            { icon: 'fas fa-chart-line', text: 'Analytics', href: '/analytics', id: 'analytics' },
            { icon: 'fas fa-bell', text: 'Notifications', href: '/notifications', id: 'notifications' }
        ],
        admin: [
            { icon: 'fas fa-tachometer-alt', text: 'Dashboard', href: '/dashboard', id: 'dashboard' },
            { icon: 'fas fa-check-circle', text: 'Job Approvals', href: '/job-approvals', id: 'job-approvals' },
            { icon: 'fas fa-users', text: 'Users', href: '/users', id: 'users' },
            { icon: 'fas fa-building', text: 'Companies', href: '/companies', id: 'companies' },
            { icon: 'fas fa-chart-bar', text: 'Reports', href: '/reports', id: 'reports' },
            { icon: 'fas fa-cogs', text: 'Settings', href: '/settings', id: 'settings' },
            { icon: 'fas fa-bell', text: 'Notifications', href: '/notifications', id: 'notifications' }
        ],
        super_admin: [
            { icon: 'fas fa-tachometer-alt', text: 'Dashboard', href: '/dashboard', id: 'dashboard' },
            { icon: 'fas fa-users-cog', text: 'User Management', href: '/user-management', id: 'user-management' },
            { icon: 'fas fa-crown', text: 'Admin Control', href: '/admin-control', id: 'admin-control' },
            { icon: 'fas fa-chart-area', text: 'Analytics', href: '/analytics', id: 'analytics' },
            { icon: 'fas fa-server', text: 'System', href: '/system', id: 'system' },
            { icon: 'fas fa-shield-alt', text: 'Security', href: '/security', id: 'security' },
            { icon: 'fas fa-cogs', text: 'Settings', href: '/settings', id: 'settings' },
            { icon: 'fas fa-bell', text: 'Notifications', href: '/notifications', id: 'notifications' }
        ]
    },
    
    // Theme Configuration
    THEME: {
        DEFAULT_AVATAR: '/static/images/default-avatar.png',
        COLORS: {
            primary: '#00d4ff',
            secondary: '#7c3aed',
            success: '#00ff88',
            warning: '#ff6b35',
            danger: '#ff0080'
        }
    },
    
    // Pagination Configuration
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        MAX_PAGE_SIZE: 100
    },
    
    // File Upload Configuration
    UPLOAD: {
        MAX_FILE_SIZE: 16 * 1024 * 1024, // 16MB
        ALLOWED_TYPES: {
            resume: ['pdf', 'doc', 'docx'],
            image: ['jpg', 'jpeg', 'png', 'gif'],
            document: ['pdf', 'doc', 'docx', 'txt']
        }
    },
    
    // Notification Configuration
    NOTIFICATIONS: {
        TOAST_DURATION: 5000,
        POLL_INTERVAL: 30000, // 30 seconds
        MAX_VISIBLE_NOTIFICATIONS: 5
    },
    
    // Chart Configuration
    CHARTS: {
        DEFAULT_OPTIONS: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#b8c5d6'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#b8c5d6'
                    },
                    grid: {
                        color: 'rgba(0, 212, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#b8c5d6'
                    },
                    grid: {
                        color: 'rgba(0, 212, 255, 0.1)'
                    }
                }
            }
        },
        COLORS: {
            primary: 'rgba(0, 212, 255, 0.8)',
            secondary: 'rgba(124, 58, 237, 0.8)',
            success: 'rgba(0, 255, 136, 0.8)',
            warning: 'rgba(255, 107, 53, 0.8)',
            danger: 'rgba(255, 0, 128, 0.8)'
        }
    },
    
    // Search Configuration
    SEARCH: {
        DEBOUNCE_DELAY: 300,
        MIN_QUERY_LENGTH: 2
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'futuremesh_access_token',
        USER_DATA: 'futuremesh_user_data',
        THEME_PREFERENCE: 'futuremesh_theme',
        SIDEBAR_STATE: 'futuremesh_sidebar_collapsed',
        CHAT_PREFERENCES: 'futuremesh_chat_prefs'
    },
    
    // Application State
    APP_STATE: {
        currentUser: null,
        isAuthenticated: false,
        currentPage: null,
        notifications: [],
        socket: null
    }
};

// Helper function to get API endpoint with parameters
CONFIG.getEndpoint = function(key, params = {}) {
    let endpoint = this.API_ENDPOINTS[key];
    if (!endpoint) {
        console.error(`Endpoint ${key} not found`);
        return null;
    }
    
    // Replace parameters in endpoint
    for (const [param, value] of Object.entries(params)) {
        endpoint = endpoint.replace(`{${param}}`, value);
    }
    
    return this.API_BASE_URL + endpoint;
};

// Helper function to get role-specific menu
CONFIG.getRoleMenu = function(role) {
    return this.ROLE_MENUS[role] || [];
};

// Helper function to check if user has permission
CONFIG.hasPermission = function(userRole, requiredRole) {
    const roleHierarchy = {
        student: 1,
        alumni: 2,
        hr: 3,
        hod: 4,
        admin: 5,
        super_admin: 6
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}