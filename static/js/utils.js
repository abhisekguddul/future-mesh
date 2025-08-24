// FutureMesh Utilities
class FutureMeshUtils {
    
    // Date and Time Utilities
    static formatDate(date, format = 'short') {
        if (!date) return '';
        
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        // If less than 24 hours, show relative time
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            
            if (hours > 0) {
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else if (minutes > 0) {
                return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            } else {
                return 'Just now';
            }
        }
        
        // Format options
        const options = {
            short: { month: 'short', day: 'numeric' },
            medium: { month: 'short', day: 'numeric', year: 'numeric' },
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            datetime: { 
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }
        };
        
        return d.toLocaleDateString('en-US', options[format] || options.short);
    }
    
    static formatTime(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }
    
    static timeAgo(date) {
        if (!date) return '';
        
        const now = new Date();
        const past = new Date(date);
        const diff = now - past;
        
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        const week = 7 * day;
        const month = 30 * day;
        const year = 365 * day;
        
        if (diff < minute) return 'Just now';
        if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
        if (diff < day) return `${Math.floor(diff / hour)}h ago`;
        if (diff < week) return `${Math.floor(diff / day)}d ago`;
        if (diff < month) return `${Math.floor(diff / week)}w ago`;
        if (diff < year) return `${Math.floor(diff / month)}mo ago`;
        return `${Math.floor(diff / year)}y ago`;
    }
    
    // String Utilities
    static truncate(str, length = 100, suffix = '...') {
        if (!str || str.length <= length) return str;
        return str.substring(0, length) + suffix;
    }
    
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    static slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Validation Utilities
    static validateEmail(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    }
    
    static validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return pattern.test(password);
    }
    
    static validatePhone(phone) {
        const pattern = /^\+?[\d\s-()]{10,}$/;
        return pattern.test(phone);
    }
    
    static validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // File Utilities
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    static getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
    
    static getFileType(filename) {
        const ext = this.getFileExtension(filename);
        const types = {
            image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
            document: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
            spreadsheet: ['xls', 'xlsx', 'csv'],
            presentation: ['ppt', 'pptx'],
            video: ['mp4', 'avi', 'mov', 'wmv', 'flv'],
            audio: ['mp3', 'wav', 'ogg', 'aac']
        };
        
        for (const [type, extensions] of Object.entries(types)) {
            if (extensions.includes(ext)) return type;
        }
        
        return 'unknown';
    }
    
    // Array Utilities
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = (item[key] || 'other');
            if (!groups[group]) groups[group] = [];
            groups[group].push(item);
            return groups;
        }, {});
    }
    
    static sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (order === 'desc') {
                return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
            }
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
    }
    
    static unique(array, key) {
        if (!key) return [...new Set(array)];
        
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }
    
    // Number Utilities
    static formatNumber(num, decimals = 0) {
        if (isNaN(num)) return '0';
        return Number(num).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    
    static formatPercentage(value, decimals = 1) {
        return `${(value * 100).toFixed(decimals)}%`;
    }
    
    // Storage Utilities
    static setStorage(key, value, isSession = false) {
        try {
            const storage = isSession ? sessionStorage : localStorage;
            storage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }
    
    static getStorage(key, isSession = false) {
        try {
            const storage = isSession ? sessionStorage : localStorage;
            const value = storage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    }
    
    static removeStorage(key, isSession = false) {
        try {
            const storage = isSession ? sessionStorage : localStorage;
            storage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }
    
    static clearStorage(isSession = false) {
        try {
            const storage = isSession ? sessionStorage : localStorage;
            storage.clear();
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }
    
    // DOM Utilities
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'class') {
                element.className = value;
            } else if (key === 'dataset') {
                for (const [dataKey, dataValue] of Object.entries(value)) {
                    element.dataset[dataKey] = dataValue;
                }
            } else {
                element.setAttribute(key, value);
            }
        }
        
        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else {
                element.appendChild(content);
            }
        }
        
        return element;
    }
    
    static addEventListeners(element, events) {
        for (const [event, handler] of Object.entries(events)) {
            element.addEventListener(event, handler);
        }
    }
    
    static fadeIn(element, duration = 300) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    static fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    static slideUp(element, duration = 300) {
        const height = element.offsetHeight;
        element.style.height = height + 'px';
        element.style.overflow = 'hidden';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.height = (height * (1 - progress)) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    static slideDown(element, duration = 300) {
        element.style.display = 'block';
        const height = element.scrollHeight;
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.height = (height * progress) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Network Utilities
    static async fetchWithRetry(url, options = {}, retries = 3) {
        for (let i = 0; i <= retries; i++) {
            try {
                const response = await fetch(url, options);
                
                if (response.ok) {
                    return response;
                }
                
                if (i === retries) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                if (i === retries) {
                    throw error;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
    }
    
    static isOnline() {
        return navigator.onLine;
    }
    
    // Device Utilities
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    static isTablet() {
        return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    }
    
    static isDesktop() {
        return !this.isMobile() && !this.isTablet();
    }
    
    static getDeviceType() {
        if (this.isMobile()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    }
    
    // Color Utilities
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    static rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }
    
    static lightenColor(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const amount = Math.round(2.55 * percent);
        const R = Math.min(255, rgb.r + amount);
        const G = Math.min(255, rgb.g + amount);
        const B = Math.min(255, rgb.b + amount);
        
        return this.rgbToHex(R, G, B);
    }
    
    static darkenColor(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const amount = Math.round(2.55 * percent);
        const R = Math.max(0, rgb.r - amount);
        const G = Math.max(0, rgb.g - amount);
        const B = Math.max(0, rgb.b - amount);
        
        return this.rgbToHex(R, G, B);
    }
    
    // Debounce and Throttle
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Random Utilities
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    static randomColor() {
        return `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }
    
    static randomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // Copy to Clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }
    
    // Deep Clone
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
}

// Export for use in other modules
window.Utils = FutureMeshUtils;