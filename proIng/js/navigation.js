/**
 * Navigation Module
 * Handles navigation functionality, mobile menu, and scroll effects
 */

class Navigation {
    constructor() {
        this.navbar = null;
        this.navMenu = null;
        this.mobileToggle = null;
        this.navLinks = [];
        this.isMenuOpen = false;
        this.scrollThreshold = 100;
        this.lastScrollY = 0;
        this.isScrollingUp = false;
        
        // Throttle functions
        this.throttledScroll = this.throttle(this.handleScroll.bind(this), 16); // ~60fps
        this.throttledResize = this.throttle(this.handleResize.bind(this), 250);
        
        // Bind methods
        this.handleMenuToggle = this.handleMenuToggle.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    /**
     * Initialize the navigation module
     */
    init() {
        try {
            this.findElements();
            this.setupEventListeners();
            this.setupInitialState();
            this.setupIntersectionObserver();
            
            console.log('✅ Navigation module initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Navigation module:', error);
            throw error;
        }
    }

    /**
     * Find and cache DOM elements
     */
    findElements() {
        this.navbar = document.getElementById('navbar');
        this.navMenu = document.getElementById('nav-menu');
        this.mobileToggle = document.getElementById('mobile-toggle');
        
        if (!this.navbar) {
            throw new Error('Navbar element not found');
        }
        
        // Cache navigation links
        this.navLinks = Array.from(this.navMenu?.querySelectorAll('a[href^="#"]') || []);
        
        // Cache all sections for intersection observer
        this.sections = this.navLinks.map(link => {
            const href = link.getAttribute('href');
            return {
                element: document.querySelector(href),
                id: href.substring(1),
                link: link
            };
        }).filter(section => section.element);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mobile menu toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', this.handleMenuToggle);
        }

        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', this.handleLinkClick);
        });

        // Scroll events
        window.addEventListener('scroll', this.throttledScroll, { passive: true });
        
        // Resize events
        window.addEventListener('resize', this.throttledResize);
        
        // Outside click to close mobile menu
        document.addEventListener('click', this.handleOutsideClick);
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Focus events for accessibility
        this.navLinks.forEach(link => {
            link.addEventListener('focus', () => {
                if (this.isMenuOpen && window.innerWidth < 768) {
                    // Ensure focused link is visible in mobile menu
                    link.scrollIntoView({ block: 'nearest' });
                }
            });
        });
    }

    /**
     * Setup initial state
     */
    setupInitialState() {
        // Set initial scroll state
        this.handleScroll();
        
        // Set initial active link based on current hash
        const currentHash = window.location.hash;
        if (currentHash) {
            this.setActiveLink(currentHash.substring(1));
        } else {
            this.setActiveLink('overview'); // Default to overview
        }
        
        // Update app state
        if (window.appState) {
            window.appState.setState({ 
                isMenuOpen: false,
                currentSection: currentHash ? currentHash.substring(1) : 'overview'
            });
        }
    }

    /**
     * Setup intersection observer for section detection
     */
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.setActiveLink(sectionId);
                    
                    // Update app state
                    if (window.appState) {
                        window.appState.setState({ currentSection: sectionId });
                    }
                    
                    // Update URL hash without triggering scroll
                    if (history.replaceState) {
                        history.replaceState(null, null, `#${sectionId}`);
                    }
                }
            });
        }, observerOptions);

        // Observe all sections
        this.sections.forEach(section => {
            if (section.element) {
                this.sectionObserver.observe(section.element);
            }
        });
    }

    /**
     * Handle mobile menu toggle
     */
    handleMenuToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.toggleMobileMenu();
    }

    /**
     * Toggle mobile menu state
     */
    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        
        // Update DOM
        if (this.navMenu) {
            this.navMenu.classList.toggle('active', this.isMenuOpen);
        }
        
        // Update toggle button
        if (this.mobileToggle) {
            const icon = this.mobileToggle.querySelector('i');
            if (icon) {
                icon.className = this.isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
            }
            this.mobileToggle.setAttribute('aria-expanded', this.isMenuOpen.toString());
        }
        
        // Update body class for scroll lock
        document.body.classList.toggle('mobile-menu-open', this.isMenuOpen);
        
        // Update app state
        if (window.appState) {
            window.appState.setState({ isMenuOpen: this.isMenuOpen });
        }
        
        // Focus management
        if (this.isMenuOpen) {
            // Focus first link when menu opens
            const firstLink = this.navLinks[0];
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }
        } else {
            // Return focus to toggle button when menu closes
            if (this.mobileToggle) {
                this.mobileToggle.focus();
            }
        }
        
        // Dispatch event
        this.dispatchNavigationEvent('menu-toggle', { isOpen: this.isMenuOpen });
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (this.isMenuOpen) {
            this.toggleMobileMenu();
        }
    }

    /**
     * Handle navigation link clicks
     */
    handleLinkClick(e) {
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                this.closeMobileMenu();
                
                // Smooth scroll to target
                this.scrollToSection(targetElement);
                
                // Set active link
                this.setActiveLink(targetId);
                
                // Update URL
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
                
                // Dispatch event
                this.dispatchNavigationEvent('link-click', { 
                    targetId, 
                    targetElement,
                    link 
                });
            }
        }
    }

    /**
     * Handle outside clicks to close mobile menu
     */
    handleOutsideClick(e) {
        if (!this.isMenuOpen) return;
        
        // Check if click is outside navbar
        if (!this.navbar.contains(e.target)) {
            this.closeMobileMenu();
        }
    }

    /**
     * Handle keyboard events
     */
    handleKeyPress(e) {
        // Escape key closes mobile menu
        if (e.key === 'Escape' && this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Enter or space on mobile toggle
        if ((e.key === 'Enter' || e.key === ' ') && e.target === this.mobileToggle) {
            e.preventDefault();
            this.handleMenuToggle(e);
        }
        
        // Arrow key navigation in mobile menu
        if (this.isMenuOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            this.handleArrowNavigation(e.key);
        }
    }

    /**
     * Handle arrow key navigation in mobile menu
     */
    handleArrowNavigation(key) {
        const focusedElement = document.activeElement;
        const currentIndex = this.navLinks.indexOf(focusedElement);
        
        if (currentIndex === -1) return;
        
        let nextIndex;
        if (key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % this.navLinks.length;
        } else {
            nextIndex = (currentIndex - 1 + this.navLinks.length) % this.navLinks.length;
        }
        
        this.navLinks[nextIndex].focus();
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const currentScrollY = window.pageYOffset;
        
        // Determine scroll direction
        this.isScrollingUp = currentScrollY < this.lastScrollY;
        this.lastScrollY = currentScrollY;
        
        // Update navbar state based on scroll position
        if (currentScrollY > this.scrollThreshold) {
            this.navbar.classList.add('scrolled');
            
            // Hide navbar on scroll down, show on scroll up (for mobile)
            if (window.innerWidth < 768) {
                if (this.isScrollingUp || currentScrollY < this.scrollThreshold * 2) {
                    this.navbar.classList.remove('hidden');
                } else {
                    this.navbar.classList.add('hidden');
                }
            }
        } else {
            this.navbar.classList.remove('scrolled', 'hidden');
        }
        
        // Close mobile menu on scroll (optional)
        if (this.isMenuOpen && currentScrollY > this.lastScrollY + 50) {
            this.closeMobileMenu();
        }
        
        // Update app state
        if (window.appState) {
            window.appState.setState({ scrollPosition: currentScrollY });
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const windowWidth = window.innerWidth;
        
        // Close mobile menu on desktop
        if (windowWidth >= 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Remove hidden class on desktop
        if (windowWidth >= 768) {
            this.navbar.classList.remove('hidden');
        }
    }

    /**
     * Scroll to section with offset
     */
    scrollToSection(element, offset = 100) {
        const elementTop = element.offsetTop - offset;
        
        window.scrollTo({
            top: Math.max(0, elementTop),
            behavior: 'smooth'
        });
    }

    /**
     * Set active navigation link
     */
    setActiveLink(sectionId) {
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
        
        // Add active class to current link
        const activeLink = this.navLinks.find(link => {
            const href = link.getAttribute('href');
            return href === `#${sectionId}`;
        });
        
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
        }
    }

    /**
     * Get current active section
     */
    getCurrentSection() {
        const activeLink = this.navLinks.find(link => link.classList.contains('active'));
        if (activeLink) {
            const href = activeLink.getAttribute('href');
            return href ? href.substring(1) : null;
        }
        return null;
    }

    /**
     * Navigate to section programmatically
     */
    navigateTo(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            this.scrollToSection(targetElement);
            this.setActiveLink(sectionId);
            
            // Update URL
            if (history.pushState) {
                history.pushState(null, null, `#${sectionId}`);
            }
            
            // Update app state
            if (window.appState) {
                window.appState.setState({ currentSection: sectionId });
            }
        }
    }

    /**
     * Dispatch navigation events
     */
    dispatchNavigationEvent(type, data = {}) {
        const event = new CustomEvent(`navigation:${type}`, {
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
     * Add custom navigation link
     */
    addNavigationLink(href, text, position = 'end') {
        if (!this.navMenu) return;
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        a.addEventListener('click', this.handleLinkClick);
        
        li.appendChild(a);
        
        if (position === 'start') {
            this.navMenu.insertBefore(li, this.navMenu.firstChild);
        } else {
            this.navMenu.appendChild(li);
        }
        
        // Update links cache
        this.navLinks = Array.from(this.navMenu.querySelectorAll('a[href^="#"]'));
    }

    /**
     * Remove navigation link
     */
    removeNavigationLink(href) {
        const link = this.navLinks.find(link => link.getAttribute('href') === href);
        if (link && link.parentElement) {
            link.parentElement.remove();
            // Update links cache
            this.navLinks = Array.from(this.navMenu?.querySelectorAll('a[href^="#"]') || []);
        }
    }

    /**
     * Update navigation link text
     */
    updateNavigationLink(href, newText) {
        const link = this.navLinks.find(link => link.getAttribute('href') === href);
        if (link) {
            link.textContent = newText;
        }
    }

    /**
     * Get navigation state
     */
    getState() {
        return {
            isMenuOpen: this.isMenuOpen,
            currentSection: this.getCurrentSection(),
            scrollPosition: this.lastScrollY,
            isScrollingUp: this.isScrollingUp,
            isScrolled: this.navbar?.classList.contains('scrolled') || false
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Remove event listeners
        if (this.mobileToggle) {
            this.mobileToggle.removeEventListener('click', this.handleMenuToggle);
        }
        
        this.navLinks.forEach(link => {
            link.removeEventListener('click', this.handleLinkClick);
        });
        
        window.removeEventListener('scroll', this.throttledScroll);
        window.removeEventListener('resize', this.throttledResize);
        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleKeyPress);
        
        // Disconnect intersection observer
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }
        
        // Clear references
        this.navbar = null;
        this.navMenu = null;
        this.mobileToggle = null;
        this.navLinks = [];
        this.sections = [];
        
        console.log('🧹 Navigation module destroyed');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Navigation = Navigation;
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}