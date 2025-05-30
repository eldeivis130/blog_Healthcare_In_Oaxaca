/**
 * Healthcare Crisis in Rural Oaxaca
 * Main JavaScript Controller
 * Coordinates all modules and initializes the application
 */

// Main Application Controller
class HealthOaxacaApp {
    constructor() {
        this.modules = {};
        this.initialized = false;
        this.config = {
            animationDuration: 300,
            scrollOffset: 100,
            mobileBreakpoint: 768,
            enableAnalytics: true,
            debugMode: false
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🏥 Initializing HealthOaxaca Application...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize all modules in order
            await this.initializeModules();
            
            // Set up global event listeners
            this.setupGlobalEvents();
            
            // Initialize performance monitoring
            this.initPerformanceMonitoring();
            
            // Mark as initialized
            this.initialized = true;
            
            console.log('✅ HealthOaxaca Application initialized successfully');
            
            // Trigger initialization complete event
            this.dispatchEvent('app:initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize HealthOaxaca Application:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize all application modules
     */
    async initializeModules() {
        const moduleInitializers = [
            { name: 'Navigation', init: () => this.initNavigation() },
            { name: 'Animations', init: () => this.initAnimations() },
            { name: 'Statistics', init: () => this.initStatistics() },
            { name: 'Timeline', init: () => this.initTimeline() },
            { name: 'Modal', init: () => this.initModal() },
            { name: 'Utils', init: () => this.initUtils() },
            { name: 'RegionMap', init: () => this.initRegionMap() },
            { name: 'QuickActions', init: () => this.initQuickActions() }
        ];

        for (const module of moduleInitializers) {
            try {
                console.log(`📦 Initializing ${module.name} module...`);
                await module.init();
                console.log(`✅ ${module.name} module initialized`);
            } catch (error) {
                console.warn(`⚠️ Failed to initialize ${module.name} module:`, error);
            }
        }
    }

    /**
     * Initialize Navigation module
     */
    initNavigation() {
        if (typeof Navigation !== 'undefined') {
            this.modules.navigation = new Navigation();
            this.modules.navigation.init();
        }
    }

    /**
     * Initialize Animations module
     */
    initAnimations() {
        if (typeof Animations !== 'undefined') {
            this.modules.animations = new Animations();
            this.modules.animations.init();
        }
    }

    /**
     * Initialize Statistics module
     */
    initStatistics() {
        if (typeof Statistics !== 'undefined') {
            this.modules.statistics = new Statistics();
            this.modules.statistics.init();
        }
    }

    /**
     * Initialize Timeline module
     */
    initTimeline() {
        if (typeof Timeline !== 'undefined') {
            this.modules.timeline = new Timeline();
            this.modules.timeline.init();
        }
    }

    /**
     * Initialize Modal module
     */
    initModal() {
        if (typeof Modal !== 'undefined') {
            this.modules.modal = Modal; // Modal is a singleton
            this.modules.modal.init();
        }
    }

    /**
     * Initialize Utils module
     */
    initUtils() {
        if (typeof Utils !== 'undefined') {
            this.modules.utils = Utils; // Utils is a static class
            this.modules.utils.init();
        }
    }

    /**
     * Initialize RegionMap module
     */
    initRegionMap() {
        if (typeof RegionMap !== 'undefined') {
            this.modules.regionMap = RegionMap; // RegionMap is a singleton
            this.modules.regionMap.init();
        }
    }

    /**
     * Initialize QuickActions module
     */
    initQuickActions() {
        if (typeof QuickActions !== 'undefined') {
            this.modules.quickActions = QuickActions; // QuickActions is a singleton
            this.modules.quickActions.init();
        }
    }

    /**
     * Set up global event listeners
     */
    setupGlobalEvents() {
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Handle scroll events
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                this.handleScroll();
            }, 16); // ~60fps
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 500);
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle mouse events for accessibility
        document.addEventListener('mousedown', () => {
            document.body.classList.add('using-mouse');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.remove('using-mouse');
            }
        });

        // Handle errors
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const windowWidth = window.innerWidth;
        const isMobile = windowWidth < this.config.mobileBreakpoint;
        
        // Update mobile state
        document.body.classList.toggle('is-mobile', isMobile);
        
        // Notify modules about resize
        this.dispatchEvent('app:resize', { width: windowWidth, isMobile });
        
        if (this.config.debugMode) {
            console.log('📱 Window resized:', { width: windowWidth, isMobile });
        }
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollY = window.pageYOffset;
        const scrollPercent = (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        
        // Update scroll position
        document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
        document.documentElement.style.setProperty('--scroll-percent', `${scrollPercent}%`);
        
        // Notify modules about scroll
        this.dispatchEvent('app:scroll', { scrollY, scrollPercent });
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        const isVisible = !document.hidden;
        
        if (isVisible) {
            // Page became visible
            this.dispatchEvent('app:visible');
        } else {
            // Page became hidden
            this.dispatchEvent('app:hidden');
        }
        
        if (this.config.debugMode) {
            console.log('👁️ Visibility changed:', isVisible ? 'visible' : 'hidden');
        }
    }

    /**
     * Handle orientation change
     */
    handleOrientationChange() {
        const orientation = window.screen?.orientation?.angle === 0 ? 'portrait' : 'landscape';
        
        // Update orientation class
        document.body.className = document.body.className.replace(/orientation-\w+/g, '');
        document.body.classList.add(`orientation-${orientation}`);
        
        // Notify modules
        this.dispatchEvent('app:orientation-change', { orientation });
        
        if (this.config.debugMode) {
            console.log('🔄 Orientation changed:', orientation);
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Alt + number keys for navigation
        if (e.altKey && !e.ctrlKey && !e.shiftKey) {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 6) {
                e.preventDefault();
                this.navigateToSection(num);
            }
        }

        // Escape key to close modals
        if (e.key === 'Escape') {
            if (this.modules.modal) {
                this.modules.modal.closeAll();
            }
            if (this.modules.quickActions) {
                this.modules.quickActions.close();
            }
        }

        // Accessibility shortcuts
        if (e.ctrlKey && e.shiftKey) {
            switch (e.key) {
                case 'C':
                    e.preventDefault();
                    if (this.modules.utils) {
                        this.modules.utils.toggleHighContrast();
                    }
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    if (this.modules.utils) {
                        this.modules.utils.increaseTextSize();
                    }
                    break;
                case '-':
                    e.preventDefault();
                    if (this.modules.utils) {
                        this.modules.utils.decreaseTextSize();
                    }
                    break;
            }
        }
    }

    /**
     * Navigate to section by number
     */
    navigateToSection(sectionNumber) {
        const sections = ['overview', 'problems', 'timeline', 'solutions', 'references', 'contact'];
        const sectionId = sections[sectionNumber - 1];
        
        if (sectionId) {
            this.scrollToSection(`#${sectionId}`);
        }
    }

    /**
     * Smooth scroll to section
     */
    scrollToSection(selector) {
        const element = document.querySelector(selector);
        if (element) {
            const offsetTop = element.offsetTop - this.config.scrollOffset;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Handle global errors
     */
    handleGlobalError(event) {
        console.error('🚨 Global error:', event.error);
        
        // Log error for analytics
        if (this.config.enableAnalytics) {
            this.logError('global_error', event.error);
        }
        
        // Show user-friendly error message
        this.showErrorNotification('An unexpected error occurred. Please refresh the page.');
    }

    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection(event) {
        console.error('🚨 Unhandled promise rejection:', event.reason);
        
        // Log error for analytics
        if (this.config.enableAnalytics) {
            this.logError('unhandled_rejection', event.reason);
        }
        
        // Prevent default browser behavior
        event.preventDefault();
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        // Show fallback UI
        const fallbackHTML = `
            <div class="error-fallback">
                <div class="container">
                    <h1>🏥 Healthcare Crisis in Rural Oaxaca</h1>
                    <p>We're experiencing technical difficulties. Please refresh the page.</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = fallbackHTML;
        
        // Log error
        if (this.config.enableAnalytics) {
            this.logError('initialization_error', error);
        }
    }

    /**
     * Show error notification
     */
    showErrorNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Initialize performance monitoring
     */
    initPerformanceMonitoring() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                    const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
                    
                    if (this.config.debugMode) {
                        console.log('⚡ Performance metrics:', {
                            loadTime: `${loadTime.toFixed(2)}ms`,
                            domContentLoaded: `${domContentLoaded.toFixed(2)}ms`,
                            totalLoadTime: `${perfData.loadEventEnd - perfData.navigationStart}ms`
                        });
                    }
                    
                    // Log performance data
                    if (this.config.enableAnalytics) {
                        this.logPerformance({
                            loadTime,
                            domContentLoaded,
                            totalLoadTime: perfData.loadEventEnd - perfData.navigationStart
                        });
                    }
                }, 0);
            });
        }
    }

    /**
     * Log error for analytics
     */
    logError(type, error) {
        try {
            const errorData = {
                type,
                message: error.message || error,
                stack: error.stack,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString()
            };
            
            // In a real application, send to analytics service
            console.log('📊 Error logged:', errorData);
        } catch (e) {
            console.warn('Failed to log error:', e);
        }
    }

    /**
     * Log performance data
     */
    logPerformance(data) {
        try {
            const performanceData = {
                ...data,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            };
            
            // In a real application, send to analytics service
            console.log('📊 Performance logged:', performanceData);
        } catch (e) {
            console.warn('Failed to log performance:', e);
        }
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
        
        if (this.config.debugMode) {
            console.log(`🎯 Event dispatched: ${eventName}`, data);
        }
    }

    /**
     * Get module by name
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Check if application is initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Enable debug mode
     */
    enableDebug() {
        this.config.debugMode = true;
        console.log('🐛 Debug mode enabled');
    }

    /**
     * Disable debug mode
     */
    disableDebug() {
        this.config.debugMode = false;
        console.log('🐛 Debug mode disabled');
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (this.config.debugMode) {
            console.log('⚙️ Configuration updated:', this.config);
        }
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clean up modules
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        
        // Clear modules
        this.modules = {};
        
        // Mark as not initialized
        this.initialized = false;
        
        console.log('🧹 HealthOaxaca Application destroyed');
    }
}

// Global utility functions
window.scrollToSection = function(selector) {
    if (window.app && window.app.isInitialized()) {
        window.app.scrollToSection(selector);
    } else {
        // Fallback scroll
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// Emergency contact function for quick access
window.showEmergencyContacts = function() {
    if (window.app && window.app.getModule('utils')) {
        window.app.getModule('utils').showEmergencyContacts();
    } else {
        // Fallback
        alert(`
Emergency Healthcare Contacts for Rural Oaxaca:

🏥 Hospital General de Oaxaca: +52 951 515 0660
🚑 Cruz Roja Oaxaca: +52 951 516 4455
📞 Emergency Services: 911
🏥 IMSS Oaxaca: +52 951 501 8400
🏥 ISSSTE Oaxaca: +52 951 515 0500

For non-emergency healthcare information:
📧 salud.oaxaca@gob.mx
📞 Health Ministry Oaxaca: +52 951 501 5950
        `);
    }
};

// Application state management
class AppState {
    constructor() {
        this.state = {
            currentSection: 'overview',
            scrollPosition: 0,
            isMenuOpen: false,
            activeModal: null,
            theme: 'light',
            fontSize: 'normal',
            highContrast: false,
            language: 'en'
        };
        
        this.subscribers = new Map();
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Update state
     */
    setState(updates) {
        const previousState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        // Notify subscribers
        this.notifySubscribers(this.state, previousState);
        
        // Save to localStorage
        this.saveToLocalStorage();
    }

    /**
     * Subscribe to state changes
     */
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            this.subscribers.get(key)?.delete(callback);
        };
    }

    /**
     * Notify subscribers of state changes
     */
    notifySubscribers(newState, previousState) {
        this.subscribers.forEach((callbacks, key) => {
            if (newState[key] !== previousState[key]) {
                callbacks.forEach(callback => {
                    try {
                        callback(newState[key], previousState[key]);
                    } catch (error) {
                        console.error(`Error in state subscriber for ${key}:`, error);
                    }
                });
            }
        });
    }

    /**
     * Save state to localStorage
     */
    saveToLocalStorage() {
        try {
            const persistentState = {
                theme: this.state.theme,
                fontSize: this.state.fontSize,
                highContrast: this.state.highContrast,
                language: this.state.language
            };
            localStorage.setItem('healthOaxacaState', JSON.stringify(persistentState));
        } catch (error) {
            console.warn('Failed to save state to localStorage:', error);
        }
    }

    /**
     * Load state from localStorage
     */
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('healthOaxacaState');
            if (saved) {
                const parsedState = JSON.parse(saved);
                this.setState(parsedState);
            }
        } catch (error) {
            console.warn('Failed to load state from localStorage:', error);
        }
    }
}

// Create global instances
window.app = new HealthOaxacaApp();
window.appState = new AppState();

// Initialize application when DOM is ready
(function() {
    'use strict';
    
    // Check if we're in a supported environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.error('HealthOaxaca App requires a browser environment');
        return;
    }
    
    // Load saved state
    window.appState.loadFromLocalStorage();
    
    // Apply saved preferences immediately
    const state = window.appState.getState();
    if (state.highContrast) {
        document.body.classList.add('high-contrast');
    }
    if (state.fontSize !== 'normal') {
        document.body.classList.add(`${state.fontSize}-text`);
    }
    
    // Initialize app
    window.app.init().catch(error => {
        console.error('Failed to initialize application:', error);
    });
    
    // Debug helpers (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.app.enableDebug();
        
        // Expose debug utilities
        window.HealthOaxacaDebug = {
            app: window.app,
            state: window.appState,
            enableDebug: () => window.app.enableDebug(),
            disableDebug: () => window.app.disableDebug(),
            getModules: () => window.app.modules,
            logState: () => console.log('Current state:', window.appState.getState()),
            logConfig: () => console.log('Current config:', window.app.getConfig())
        };
        
        console.log('🐛 Debug utilities available at window.HealthOaxacaDebug');
    }
})();

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('🔧 Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('🔧 Service Worker registration failed:', error);
            });
    });
}

// Export for ES6 modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HealthOaxacaApp, AppState };
}