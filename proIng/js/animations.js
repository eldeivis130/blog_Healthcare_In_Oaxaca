/**
 * Animations Module
 * Handles scroll animations, intersection observers, and visual effects
 */

class Animations {
    constructor() {
        this.observers = new Map();
        this.animatedElements = new Set();
        this.isReducedMotion = this.checkReducedMotion();
        this.scrollElements = [];
        this.parallaxElements = [];
        
        // Animation configurations
        this.config = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
            animationDuration: 600,
            animationDelay: 100,
            parallaxStrength: 0.5
        };
        
        // Bind methods
        this.handleScroll = this.throttle(this.handleScrollAnimations.bind(this), 16);
        this.handleResize = this.throttle(this.handleResizeAnimations.bind(this), 250);
    }

    /**
     * Initialize the animations module
     */
    init() {
        try {
            this.setupIntersectionObservers();
            this.findAnimationElements();
            this.setupScrollAnimations();
            this.setupParallaxElements();
            this.setupEventListeners();
            this.initializeLoadingAnimations();
            
            console.log('✅ Animations module initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Animations module:', error);
            throw error;
        }
    }

    /**
     * Check if user prefers reduced motion
     */
    checkReducedMotion() {
        return window.matchMedia && 
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Setup intersection observers for animations
     */
    setupIntersectionObservers() {
        // Main section observer
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target, 'fadeInUp');
                }
            });
        }, {
            threshold: this.config.threshold,
            rootMargin: this.config.rootMargin
        });

        // Card hover effects observer
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.staggerCardAnimations(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });

        // Timeline observer
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateTimelineItem(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });

        // Store observers
        this.observers.set('sections', sectionObserver);
        this.observers.set('cards', cardObserver);
        this.observers.set('timeline', timelineObserver);

        // Observe elements
        this.observeElements();
    }

    /**
     * Find and categorize animation elements
     */
    findAnimationElements() {
        // Sections to animate
        this.scrollElements = Array.from(document.querySelectorAll('.section'));
        
        // Card containers
        this.cardContainers = Array.from(document.querySelectorAll(
            '.stats-grid, .problems-grid, .solution-grid, .references-grid'
        ));
        
        // Timeline items
        this.timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
        
        // Parallax elements
        this.parallaxElements = Array.from(document.querySelectorAll(
            '.hero, .hero-background'
        ));
        
        // Elements with loading animations
        this.loadingElements = Array.from(document.querySelectorAll(
            '.stat-card, .problem-card, .solution-card, .reference-card'
        ));
    }

    /**
     * Observe elements with intersection observers
     */
    observeElements() {
        const sectionObserver = this.observers.get('sections');
        const cardObserver = this.observers.get('cards');
        const timelineObserver = this.observers.get('timeline');

        // Observe sections
        this.scrollElements.forEach(element => {
            sectionObserver.observe(element);
        });

        // Observe card containers
        this.cardContainers.forEach(container => {
            cardObserver.observe(container);
        });

        // Observe timeline items
        this.timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });
    }

    /**
     * Setup scroll-based animations
     */
    setupScrollAnimations() {
        if (!this.isReducedMotion) {
            window.addEventListener('scroll', this.handleScroll, { passive: true });
        }
    }

    /**
     * Setup parallax elements
     */
    setupParallaxElements() {
        if (!this.isReducedMotion && this.parallaxElements.length > 0) {
            this.updateParallax();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        window.addEventListener('resize', this.handleResize);
        
        // Listen for reduced motion changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', (e) => {
                this.isReducedMotion = e.matches;
                this.handleMotionPreferenceChange();
            });
        }

        // Listen for app events
        document.addEventListener('app:visible', () => {
            this.resumeAnimations();
        });

        document.addEventListener('app:hidden', () => {
            this.pauseAnimations();
        });
    }

    /**
     * Initialize loading animations
     */
    initializeLoadingAnimations() {
        this.loadingElements.forEach((element, index) => {
            element.classList.add('loading');
            
            // Stagger the loading animations
            setTimeout(() => {
                element.classList.add('loaded');
                element.classList.remove('loading');
            }, 100 + (index * 50));
        });
    }

    /**
     * Handle scroll animations
     */
    handleScrollAnimations() {
        if (this.isReducedMotion) return;

        const scrollY = window.pageYOffset;
        
        // Update parallax effects
        this.updateParallax(scrollY);
        
        // Update scroll progress
        this.updateScrollProgress(scrollY);
        
        // Handle scroll-triggered animations
        this.handleScrollTriggers(scrollY);
    }

    /**
     * Update parallax effects
     */
    updateParallax(scrollY = window.pageYOffset) {
        this.parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallaxSpeed) || this.config.parallaxStrength;
            const yPos = -(scrollY * speed);
            
            if (element.style.transform !== undefined) {
                element.style.transform = `translateY(${yPos}px)`;
            }
        });
    }

    /**
     * Update scroll progress indicator
     */
    updateScrollProgress(scrollY) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollY / docHeight) * 100;
        
        // Update CSS custom property for scroll progress
        document.documentElement.style.setProperty('--scroll-progress', `${scrollPercent}%`);
        
        // Dispatch scroll progress event
        this.dispatchAnimationEvent('scroll-progress', { percent: scrollPercent, scrollY });
    }

    /**
     * Handle scroll triggers
     */
    handleScrollTriggers(scrollY) {
        // Animate elements based on scroll position
        const viewportHeight = window.innerHeight;
        
        this.scrollElements.forEach(element => {
            if (this.animatedElements.has(element)) return;
            
            const elementTop = element.offsetTop;
            const elementHeight = element.offsetHeight;
            const triggerPoint = elementTop - (viewportHeight * 0.8);
            
            if (scrollY > triggerPoint) {
                this.animateElement(element, 'slideInUp');
                this.animatedElements.add(element);
            }
        });
    }

    /**
     * Animate individual element
     */
    animateElement(element, animationType = 'fadeInUp', delay = 0) {
        if (this.isReducedMotion) {
            element.classList.add('visible');
            return;
        }

        setTimeout(() => {
            element.classList.add('visible', animationType);
            
            // Remove animation class after animation completes
            setTimeout(() => {
                element.classList.remove(animationType);
            }, this.config.animationDuration);
            
        }, delay);
    }

    /**
     * Stagger card animations
     */
    staggerCardAnimations(container) {
        const cards = container.querySelectorAll('.stat-card, .problem-card, .solution-card, .reference-card');
        
        cards.forEach((card, index) => {
            if (this.animatedElements.has(card)) return;
            
            this.animateElement(card, 'scaleIn', index * this.config.animationDelay);
            this.animatedElements.add(card);
        });
    }

    /**
     * Animate timeline item
     */
    animateTimelineItem(item) {
        if (this.animatedElements.has(item)) return;
        
        const isEven = Array.from(item.parentElement.children).indexOf(item) % 2 === 1;
        const animationType = isEven ? 'slideInLeft' : 'slideInRight';
        
        this.animateElement(item, animationType);
        this.animatedElements.add(item);
    }

    /**
     * Handle resize animations
     */
    handleResizeAnimations() {
        // Recalculate positions after resize
        this.updateParallax();
        
        // Reset timeline animations on mobile
        if (window.innerWidth < 768) {
            this.timelineItems.forEach(item => {
                item.style.transform = '';
            });
        }
    }

    /**
     * Handle motion preference change
     */
    handleMotionPreferenceChange() {
        if (this.isReducedMotion) {
            // Disable all animations
            this.disableAnimations();
        } else {
            // Re-enable animations
            this.enableAnimations();
        }
    }

    /**
     * Disable all animations
     */
    disableAnimations() {
        document.documentElement.style.setProperty('--animation-duration', '0s');
        document.documentElement.style.setProperty('--transition-duration', '0s');
        
        // Remove animation classes
        this.scrollElements.forEach(element => {
            element.classList.add('visible');
        });
        
        this.loadingElements.forEach(element => {
            element.classList.add('loaded');
            element.classList.remove('loading');
        });
    }

    /**
     * Enable animations
     */
    enableAnimations() {
        document.documentElement.style.removeProperty('--animation-duration');
        document.documentElement.style.removeProperty('--transition-duration');
    }

    /**
     * Pause animations (when page is hidden)
     */
    pauseAnimations() {
        this.animationsPaused = true;
        
        // Pause CSS animations
        document.querySelectorAll('*').forEach(el => {
            if (getComputedStyle(el).animationName !== 'none') {
                el.style.animationPlayState = 'paused';
            }
        });
    }

    /**
     * Resume animations (when page becomes visible)
     */
    resumeAnimations() {
        this.animationsPaused = false;
        
        // Resume CSS animations
        document.querySelectorAll('*').forEach(el => {
            if (el.style.animationPlayState === 'paused') {
                el.style.animationPlayState = 'running';
            }
        });
    }

    /**
     * Animate counter numbers
     */
    animateCounter(element, startValue = 0, endValue = null, duration = 2000) {
        if (this.isReducedMotion) {
            element.textContent = endValue || element.dataset.target || element.textContent;
            return;
        }

        const target = endValue || parseFloat(element.dataset.target) || parseFloat(element.textContent);
        const increment = (target - startValue) / (duration / 16); // 60fps
        let current = startValue;
        
        const updateCounter = () => {
            current += increment;
            
            if (current >= target) {
                current = target;
                element.textContent = Math.floor(current);
                return;
            }
            
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        };
        
        updateCounter();
    }

    /**
     * Create floating animation
     */
    createFloatingAnimation(element, options = {}) {
        if (this.isReducedMotion) return;
        
        const config = {
            duration: 3000,
            amplitude: 10,
            ...options
        };
        
        element.style.animation = `floating ${config.duration}ms ease-in-out infinite`;
        element.style.setProperty('--floating-amplitude', `${config.amplitude}px`);
    }

    /**
     * Create typing animation
     */
    createTypingAnimation(element, text, speed = 100) {
        if (this.isReducedMotion) {
            element.textContent = text;
            return;
        }
        
        element.textContent = '';
        let i = 0;
        
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        };
        
        typeWriter();
    }

    /**
     * Create reveal animation
     */
    createRevealAnimation(element, direction = 'up') {
        if (this.isReducedMotion) {
            element.classList.add('visible');
            return;
        }
        
        element.classList.add('reveal', `reveal-${direction}`);
        
        setTimeout(() => {
            element.classList.add('revealed');
        }, 100);
    }

    /**
     * Add custom animation
     */
    addCustomAnimation(name, keyframes, options = {}) {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ${name} {
                ${keyframes}
            }
        `;
        document.head.appendChild(style);
        
        return {
            apply: (element, duration = '1s') => {
                element.style.animation = `${name} ${duration} ${options.easing || 'ease-out'} ${options.delay || '0s'} ${options.iterations || '1'} ${options.fillMode || 'forwards'}`;
            }
        };
    }

    /**
     * Reset animations for an element
     */
    resetAnimation(element) {
        element.classList.remove('visible', 'loaded', 'revealed');
        element.style.animation = '';
        element.style.transform = '';
        element.style.opacity = '';
        
        this.animatedElements.delete(element);
    }

    /**
     * Batch animate elements
     */
    batchAnimate(elements, animationType = 'fadeInUp', staggerDelay = 100) {
        elements.forEach((element, index) => {
            this.animateElement(element, animationType, index * staggerDelay);
        });
    }

    /**
     * Dispatch animation events
     */
    dispatchAnimationEvent(type, data = {}) {
        const event = new CustomEvent(`animation:${type}`, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Get animation state
     */
    getState() {
        return {
            isReducedMotion: this.isReducedMotion,
            animatedElements: this.animatedElements.size,
            animationsPaused: this.animationsPaused || false,
            parallaxEnabled: this.parallaxElements.length > 0 && !this.isReducedMotion
        };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Disconnect all observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        
        // Clear sets and arrays
        this.animatedElements.clear();
        this.scrollElements = [];
        this.parallaxElements = [];
        this.loadingElements = [];
        this.cardContainers = [];
        this.timelineItems = [];
        
        console.log('🧹 Animations module destroyed');
    }
}

// CSS animations to inject
const animationStyles = `
/* Animation Classes */
.fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
}

.slideInUp {
    animation: slideInUp 0.6s ease-out forwards;
}

.slideInLeft {
    animation: slideInLeft 0.6s ease-out forwards;
}

.slideInRight {
    animation: slideInRight 0.6s ease-out forwards;
}

.scaleIn {
    animation: scaleIn 0.4s ease-out forwards;
}

.floating {
    animation: floating 3s ease-in-out infinite;
}

.reveal {
    overflow: hidden;
    position: relative;
}

.reveal::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: currentColor;
    transform: translateX(-100%);
    transition: transform 0.6s ease-out;
}

.reveal.revealed::before {
    transform: translateX(100%);
}

/* Keyframe Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes floating {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(var(--floating-amplitude, -10px));
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
`;

// Inject animation styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Animations = Animations;
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Animations;
}