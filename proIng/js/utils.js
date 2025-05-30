/**
 * Utilities Module
 * Contains utility functions for common tasks, accessibility, and helper methods
 */

const Utils = {
    // State tracking
    isInitialized: false,
    currentTextSize: 'normal',
    isHighContrast: false,
    preferredLanguage: 'en',
    
    // Configuration
    config: {
        textSizeMultipliers: {
            small: 0.9,
            normal: 1.0,
            large: 1.2,
            xlarge: 1.4
        },
        supportedLanguages: ['en', 'es', 'mixteco', 'zapoteco'],
        debounceDelay: 300,
        throttleDelay: 100
    },

    /**
     * Initialize utilities module
     */
    init() {
        if (this.isInitialized) return;
        
        this.loadUserPreferences();
        this.setupEventListeners();
        this.initializeAccessibilityFeatures();
        this.setupPerformanceMonitoring();
        
        this.isInitialized = true;
        console.log('✅ Utils module initialized');
    },

    /**
     * Load user preferences from localStorage
     */
    loadUserPreferences() {
        try {
            const preferences = localStorage.getItem('healthOaxacaPreferences');
            if (preferences) {
                const parsed = JSON.parse(preferences);
                
                this.currentTextSize = parsed.textSize || 'normal';
                this.isHighContrast = parsed.highContrast || false;
                this.preferredLanguage = parsed.language || 'en';
                
                // Apply preferences
                this.applyTextSize(this.currentTextSize);
                if (this.isHighContrast) {
                    this.enableHighContrast();
                }
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    },

    /**
     * Save user preferences to localStorage
     */
    saveUserPreferences() {
        try {
            const preferences = {
                textSize: this.currentTextSize,
                highContrast: this.isHighContrast,
                language: this.preferredLanguage,
                timestamp: Date.now()
            };
            
            localStorage.setItem('healthOaxacaPreferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', () => {
            this.handleConnectionChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleConnectionChange(false);
        });

        // Page visibility
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Before unload
        window.addEventListener('beforeunload', () => {
            this.saveUserPreferences();
        });
    },

    /**
     * Initialize accessibility features
     */
    initializeAccessibilityFeatures() {
        // Add keyboard navigation helpers
        this.setupKeyboardNavigation();
        
        // Add screen reader announcements
        this.setupScreenReaderSupport();
        
        // Add focus management
        this.setupFocusManagement();
    },

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip to main content (Alt + M)
            if (e.altKey && e.key.toLowerCase() === 'm') {
                e.preventDefault();
                this.skipToMainContent();
            }
            
            // Skip to navigation (Alt + N)
            if (e.altKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                this.skipToNavigation();
            }
            
            // Toggle high contrast (Ctrl + Shift + C)
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                this.toggleHighContrast();
            }
        });
    },

    /**
     * Setup screen reader support
     */
    setupScreenReaderSupport() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
    },

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Track focus for better accessibility
        let isUsingKeyboard = false;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isUsingKeyboard = true;
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            isUsingKeyboard = false;
            document.body.classList.remove('keyboard-navigation');
        });
    },

    /**
     * Skip to main content
     */
    skipToMainContent() {
        const mainContent = document.querySelector('main, #main, .main-content');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
            this.announceToScreenReader('Skipped to main content');
        }
    },

    /**
     * Skip to navigation
     */
    skipToNavigation() {
        const navigation = document.querySelector('nav, #nav, .navbar');
        if (navigation) {
            const firstLink = navigation.querySelector('a, button');
            if (firstLink) {
                firstLink.focus();
                this.announceToScreenReader('Skipped to navigation');
            }
        }
    },

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    },

    /**
     * Increase text size
     */
    increaseTextSize() {
        const sizes = Object.keys(this.config.textSizeMultipliers);
        const currentIndex = sizes.indexOf(this.currentTextSize);
        
        if (currentIndex < sizes.length - 1) {
            const newSize = sizes[currentIndex + 1];
            this.applyTextSize(newSize);
            this.currentTextSize = newSize;
            this.saveUserPreferences();
            
            this.announceToScreenReader(`Text size increased to ${newSize}`);
            this.dispatchUtilEvent('text-size-changed', { size: newSize });
        }
    },

    /**
     * Decrease text size
     */
    decreaseTextSize() {
        const sizes = Object.keys(this.config.textSizeMultipliers);
        const currentIndex = sizes.indexOf(this.currentTextSize);
        
        if (currentIndex > 0) {
            const newSize = sizes[currentIndex - 1];
            this.applyTextSize(newSize);
            this.currentTextSize = newSize;
            this.saveUserPreferences();
            
            this.announceToScreenReader(`Text size decreased to ${newSize}`);
            this.dispatchUtilEvent('text-size-changed', { size: newSize });
        }
    },

    /**
     * Apply text size
     */
    applyTextSize(size) {
        const multiplier = this.config.textSizeMultipliers[size] || 1;
        document.documentElement.style.fontSize = `${16 * multiplier}px`;
        
        // Update body class
        document.body.className = document.body.className.replace(/text-size-\w+/g, '');
        document.body.classList.add(`text-size-${size}`);
    },

    /**
     * Toggle high contrast mode
     */
    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;
        
        if (this.isHighContrast) {
            this.enableHighContrast();
        } else {
            this.disableHighContrast();
        }
        
        this.saveUserPreferences();
        this.announceToScreenReader(`High contrast ${this.isHighContrast ? 'enabled' : 'disabled'}`);
        this.dispatchUtilEvent('high-contrast-toggled', { enabled: this.isHighContrast });
    },

    /**
     * Enable high contrast mode
     */
    enableHighContrast() {
        document.body.classList.add('high-contrast');
        this.isHighContrast = true;
    },

    /**
     * Disable high contrast mode
     */
    disableHighContrast() {
        document.body.classList.remove('high-contrast');
        this.isHighContrast = false;
    },

    /**
     * Share on social media
     */
    shareOnSocial(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent('Healthcare Crisis in Rural Oaxaca - Join the Solution');
        const text = encodeURIComponent('Learn about the critical healthcare accessibility crisis in rural Oaxaca and innovative solutions making a difference. #HealthcareAccess #RuralHealth #Oaxaca');
        
        let shareUrl;
        
        switch (platform.toLowerCase()) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}&hashtags=HealthcareAccess,RuralHealth,Oaxaca`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${text}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${title}%20${url}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${title}&body=${text}%0A%0A${url}`;
                break;
            default:
                console.warn(`Unsupported social platform: ${platform}`);
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
            this.dispatchUtilEvent('social-share', { platform, url: shareUrl });
        }
    },

    /**
     * Copy to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.announceToScreenReader('Copied to clipboard');
            this.showNotification('Copied to clipboard!', 'success');
            return true;
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                textArea.remove();
                this.announceToScreenReader('Copied to clipboard');
                this.showNotification('Copied to clipboard!', 'success');
                return true;
            } catch (fallbackError) {
                textArea.remove();
                this.showNotification('Failed to copy to clipboard', 'error');
                return false;
            }
        }
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Position notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            min-width: 300px;
            max-width: 500px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
        
        return notification;
    },

    /**
     * Show emergency contacts
     */
    showEmergencyContacts() {
        const contacts = `
🏥 EMERGENCY HEALTHCARE CONTACTS - RURAL OAXACA

🚨 EMERGENCY SERVICES
• General Emergency: 911
• Fire Department: 911
• Police: 911

🏥 HOSPITALS & MEDICAL CENTERS
• Hospital General de Oaxaca: +52 951 515 0660
• Cruz Roja Oaxaca (Red Cross): +52 951 516 4455
• Hospital de la Niñez Oaxaqueña: +52 951 501 3300
• IMSS Hospital General: +52 951 501 8400
• ISSSTE Hospital: +52 951 515 0500

🚑 AMBULANCE SERVICES
• Cruz Roja Ambulance: +52 951 516 4455
• IMSS Ambulance: +52 951 515 1414
• Private Ambulance: +52 951 514 2020

🏥 SPECIALIZED SERVICES
• Poison Control: 800 722 6911
• Mental Health Crisis: +52 951 516 7890
• Women's Health Emergency: +52 951 514 3456

📞 NON-EMERGENCY HEALTH INFO
• Health Ministry Oaxaca: +52 951 501 5950
• Email: salud.oaxaca@gob.mx
• Community Health Line: +52 951 502 1234

⚠️ FOR RURAL AREAS:
If roads are impassable, contact local community health workers or use radio communication if available.

📍 NEAREST HELIPAD:
Hospital General de Oaxaca has helicopter landing capability for critical emergencies.
        `;
        
        // Show in modal if available, otherwise use alert
        if (window.Modal) {
            window.Modal.show('custom', {
                title: 'Emergency Healthcare Contacts',
                content: `<pre style="white-space: pre-wrap; font-family: monospace; line-height: 1.6;">${contacts}</pre>`,
                size: 'large'
            });
        } else {
            alert(contacts);
        }
        
        this.dispatchUtilEvent('emergency-contacts-shown');
    },

    /**
     * Generate PDF report
     */
    generatePDFReport() {
        this.showNotification('Preparing PDF report...', 'info');
        
        // Simulate PDF generation
        setTimeout(() => {
            this.showNotification('PDF report generated! This would download in a real implementation.', 'success');
            
            // In real implementation, use libraries like jsPDF or html2pdf
            console.log('PDF generation would happen here');
            
            this.dispatchUtilEvent('pdf-generated');
        }, 2000);
    },

    /**
     * Format date
     */
    formatDate(date, locale = 'en-US', options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            return new Intl.DateTimeFormat(locale, formatOptions).format(new Date(date));
        } catch (error) {
            return new Date(date).toLocaleDateString();
        }
    },

    /**
     * Format number
     */
    formatNumber(number, locale = 'en-US', options = {}) {
        try {
            return new Intl.NumberFormat(locale, options).format(number);
        } catch (error) {
            return number.toLocaleString();
        }
    },

    /**
     * Format currency
     */
    formatCurrency(amount, currency = 'USD', locale = 'en-US') {
        return this.formatNumber(amount, locale, {
            style: 'currency',
            currency: currency
        });
    },

    /**
     * Validate email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate phone number (international format)
     */
    validatePhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    /**
     * Sanitize HTML
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

    /**
     * Debounce function
     */
    debounce(func, delay = this.config.debounceDelay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, delay = this.config.throttleDelay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    },

    /**
     * Deep clone object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * Get device information
     */
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height,
                pixelRatio: window.devicePixelRatio || 1
            },
            features: {
                localStorage: typeof Storage !== 'undefined',
                sessionStorage: typeof Storage !== 'undefined',
                geolocation: 'geolocation' in navigator,
                notifications: 'Notification' in window,
                serviceWorker: 'serviceWorker' in navigator
            }
        };
    },

    /**
     * Handle connection change
     */
    handleConnectionChange(isOnline) {
        const message = isOnline ? 'Connection restored' : 'Connection lost';
        const type = isOnline ? 'success' : 'warning';
        
        this.showNotification(message, type);
        this.announceToScreenReader(message);
        this.dispatchUtilEvent('connection-change', { isOnline });
    },

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        const isVisible = !document.hidden;
        this.dispatchUtilEvent('visibility-change', { isVisible });
    },

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) { // Tasks longer than 50ms
                            console.warn('Long task detected:', entry);
                            this.dispatchUtilEvent('long-task', { duration: entry.duration });
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (error) {
                console.warn('Performance monitoring not supported');
            }
        }
    },

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        if (!('performance' in window)) return null;
        
        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return null;
        
        return {
            // Load times
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
            
            // Network times
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnection: navigation.connectEnd - navigation.connectStart,
            serverResponse: navigation.responseStart - navigation.requestStart,
            downloadTime: navigation.responseEnd - navigation.responseStart,
            
            // Other metrics
            redirectTime: navigation.redirectEnd - navigation.redirectStart,
            unloadTime: navigation.unloadEventEnd - navigation.unloadEventStart,
            
            // Memory (if available)
            memory: 'memory' in performance ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    },

    /**
     * Log error for analytics
     */
    logError(error, context = {}) {
        const errorData = {
            message: error.message || error,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            context: context
        };
        
        // In a real application, send to error tracking service
        console.error('Error logged:', errorData);
        
        this.dispatchUtilEvent('error-logged', errorData);
        
        return errorData;
    },

    /**
     * Calculate reading time
     */
    calculateReadingTime(text, wordsPerMinute = 200) {
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return {
            words,
            minutes,
            text: minutes === 1 ? '1 minute read' : `${minutes} minutes read`
        };
    },

    /**
     * Smooth scroll to element
     */
    scrollToElement(selector, offset = 0) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        
        if (!element) {
            console.warn('Element not found for scrolling:', selector);
            return;
        }
        
        const elementTop = element.offsetTop - offset;
        
        window.scrollTo({
            top: Math.max(0, elementTop),
            behavior: 'smooth'
        });
        
        this.dispatchUtilEvent('scroll-to-element', { element, offset });
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const verticalVisible = (rect.top + threshold) < windowHeight && (rect.bottom - threshold) > 0;
        const horizontalVisible = (rect.left + threshold) < windowWidth && (rect.right - threshold) > 0;
        
        return verticalVisible && horizontalVisible;
    },

    /**
     * Get URL parameters
     */
    getURLParams(url = window.location.href) {
        const params = new URLSearchParams(new URL(url).search);
        const result = {};
        
        for (const [key, value] of params) {
            result[key] = value;
        }
        
        return result;
    },

    /**
     * Set URL parameter
     */
    setURLParam(key, value, pushState = false) {
        const url = new URL(window.location);
        
        if (value === null || value === undefined) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
        
        if (pushState) {
            history.pushState({}, '', url);
        } else {
            history.replaceState({}, '', url);
        }
        
        this.dispatchUtilEvent('url-param-changed', { key, value });
    },

    /**
     * Generate unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Format file size
     */
    formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    },

    /**
     * Convert to slug
     */
    toSlug(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Capitalize first letter
     */
    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    /**
     * Truncate text
     */
    truncateText(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength - suffix.length) + suffix;
    },

    /**
     * Check if user prefers reduced motion
     */
    prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    /**
     * Check if user prefers dark mode
     */
    prefersDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

    /**
     * Get contrast ratio between two colors
     */
    getContrastRatio(color1, color2) {
        // Simplified contrast ratio calculation
        // In production, use a proper color library
        const getLuminance = (color) => {
            // This is a simplified version
            const rgb = parseInt(color.replace('#', ''), 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;
            
            return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        };
        
        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        return (brightest + 0.05) / (darkest + 0.05);
    },

    /**
     * Wait for element to exist
     */
    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    },

    /**
     * Preload image
     */
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    },

    /**
     * Lazy load images
     */
    lazyLoadImages(selector = 'img[data-src]') {
        const images = document.querySelectorAll(selector);
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    },

    /**
     * Create toast notification
     */
    createToast(message, type = 'info', duration = 3000, actions = []) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const actionsHTML = actions.map(action => 
            `<button class="toast-action" onclick="${action.onClick}">${action.label}</button>`
        ).join('');
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-message">${message}</div>
                ${actionsHTML ? `<div class="toast-actions">${actionsHTML}</div>` : ''}
                <button class="toast-close" onclick="this.closest('.toast').remove()">×</button>
            </div>
        `;
        
        // Add to page
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        // Auto-remove
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, duration);
        }
        
        return toast;
    },

    /**
     * Load script dynamically
     */
    loadScript(src, attributes = {}) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            
            // Set attributes
            Object.keys(attributes).forEach(key => {
                script.setAttribute(key, attributes[key]);
            });
            
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            
            document.head.appendChild(script);
        });
    },

    /**
     * Load CSS dynamically
     */
    loadCSS(href, attributes = {}) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            // Set attributes
            Object.keys(attributes).forEach(key => {
                link.setAttribute(key, attributes[key]);
            });
            
            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
            
            document.head.appendChild(link);
        });
    },

    /**
     * Feature detection
     */
    supports: {
        localStorage: (() => {
            try {
                const test = 'test';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        })(),
        
        sessionStorage: (() => {
            try {
                const test = 'test';
                sessionStorage.setItem(test, test);
                sessionStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        })(),
        
        webGL: (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
            } catch (e) {
                return false;
            }
        })(),
        
        geolocation: 'geolocation' in navigator,
        
        notifications: 'Notification' in window,
        
        serviceWorker: 'serviceWorker' in navigator,
        
        intersectionObserver: 'IntersectionObserver' in window,
        
        mutationObserver: 'MutationObserver' in window
    },

    /**
     * Dispatch utility events
     */
    dispatchUtilEvent(type, data = {}) {
        const event = new CustomEvent(`utils:${type}`, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    },

    /**
     * Get utility state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            currentTextSize: this.currentTextSize,
            isHighContrast: this.isHighContrast,
            preferredLanguage: this.preferredLanguage,
            deviceInfo: this.getDeviceInfo(),
            supports: this.supports
        };
    },

    /**
     * Reset all preferences
     */
    resetPreferences() {
        this.currentTextSize = 'normal';
        this.isHighContrast = false;
        this.preferredLanguage = 'en';
        
        this.applyTextSize('normal');
        this.disableHighContrast();
        
        // Clear localStorage
        try {
            localStorage.removeItem('healthOaxacaPreferences');
        } catch (error) {
            console.warn('Failed to clear preferences:', error);
        }
        
        this.announceToScreenReader('Preferences reset to default');
        this.dispatchUtilEvent('preferences-reset');
    },

    /**
     * Clean up resources
     */
    destroy() {
        // Save preferences before destroying
        this.saveUserPreferences();
        
        // Remove event listeners
        window.removeEventListener('online', this.handleConnectionChange);
        window.removeEventListener('offline', this.handleConnectionChange);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('beforeunload', this.saveUserPreferences);
        
        // Clear state
        this.isInitialized = false;
        
        console.log('🧹 Utils module destroyed');
    }
};

// CSS for utility components
const utilityStyles = `
/* Utility Component Styles */
.notification {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    margin-bottom: 1rem;
    overflow: hidden;
    animation: slideInRight 0.3s ease-out;
}

.notification-info { border-left: 4px solid #3182ce; }
.notification-success { border-left: 4px solid #10b981; }
.notification-warning { border-left: 4px solid #f59e0b; }
.notification-error { border-left: 4px solid #ef4444; }

.notification-content {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.notification-message {
    flex: 1;
    color: #374151;
    font-weight: 500;
}

.notification-close {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 1.2rem;
    transition: all 0.2s ease;
}

.notification-close:hover {
    background: #f3f4f6;
    color: #374151;
}

.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10002;
    max-width: 400px;
}

.toast {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    margin-bottom: 0.5rem;
    overflow: hidden;
    animation: slideInRight 0.3s ease-out;
}

.toast-info { border-left: 4px solid #3182ce; }
.toast-success { border-left: 4px solid #10b981; }
.toast-warning { border-left: 4px solid #f59e0b; }
.toast-error { border-left: 4px solid #ef4444; }

.toast-content {
    padding: 1rem;
}

.toast-message {
    color: #374151;
    margin-bottom: 0.5rem;
}

.toast-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.toast-action {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.2s ease;
}

.toast-action:hover {
    background: #5a67d8;
}

.toast-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 1.2rem;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.toast-close:hover {
    background: #f3f4f6;
    color: #374151;
}

/* Accessibility Styles */
.keyboard-navigation *:focus {
    outline: 2px solid #667eea !important;
    outline-offset: 2px !important;
}

.text-size-small { font-size: 0.9em; }
.text-size-normal { font-size: 1em; }
.text-size-large { font-size: 1.2em; }
.text-size-xlarge { font-size: 1.4em; }

.high-contrast {
    filter: contrast(150%) brightness(110%);
}

.high-contrast * {
    text-shadow: none !important;
    box-shadow: none !important;
}

/* Lazy loading images */
img.lazy {
    opacity: 0;
    transition: opacity 0.3s;
}

img.lazy.loaded {
    opacity: 1;
}

/* Animations */
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .notification,
    .toast,
    img.lazy {
        animation: none;
        transition: none;
    }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .notification,
    .toast-container {
        left: 10px;
        right: 10px;
        max-width: none;
    }
    
    .toast-actions {
        flex-direction: column;
    }
}
`;

// Inject utility styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = utilityStyles;
    document.head.appendChild(styleSheet);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}