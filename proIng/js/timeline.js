/**
 * Timeline Module
 * Handles interactive timeline functionality, animations, and user interactions
 */

class Timeline {
    constructor() {
        this.timelineContainer = null;
        this.timelineItems = [];
        this.observers = new Map();
        this.animatedItems = new Set();
        this.currentActiveItem = null;
        this.isReducedMotion = this.checkReducedMotion();
        
        // Configuration
        this.config = {
            observerThreshold: 0.3,
            observerRootMargin: '0px 0px -100px 0px',
            animationDelay: 200,
            animationDuration: 600,
            autoPlay: false,
            autoPlayInterval: 5000
        };
        
        // Timeline data
        this.timelineData = [
            {
                id: 'infrastructure',
                title: 'Infrastructure Deterioration',
                description: 'Lack of investment in rural infrastructure led to deteriorating roads and communication networks, isolating communities from urban medical centers during critical weather periods.',
                icon: 'fas fa-exclamation-triangle',
                color: '#e53e3e',
                year: 'Phase 1',
                details: 'Rural road infrastructure in Oaxaca has suffered from decades of underinvestment, making emergency medical transport extremely difficult.'
            },
            {
                id: 'migration',
                title: 'Medical Personnel Migration',
                description: 'Healthcare professionals increasingly concentrated in urban areas due to better working conditions and resources, leaving rural areas severely understaffed.',
                icon: 'fas fa-user-minus',
                color: '#d69e2e',
                year: 'Phase 2',
                details: 'The brain drain of medical professionals has left many rural communities with minimal healthcare coverage.'
            },
            {
                id: 'decline',
                title: 'Health Outcomes Decline',
                description: 'Maternal and infant mortality rates began rising above national averages as preventable diseases progressed to advanced stages before treatment.',
                icon: 'fas fa-chart-line-down',
                color: '#ed8936',
                year: 'Phase 3',
                details: 'Delayed medical attention has resulted in preventable deaths and complications that could have been avoided with timely care.'
            },
            {
                id: 'development',
                title: 'Solution Development',
                description: 'Researchers and healthcare professionals began developing integrated approaches combining telemedicine, mobile clinics, and community engagement strategies.',
                icon: 'fas fa-lightbulb',
                color: '#38a169',
                year: 'Phase 4',
                details: 'Innovative solutions are being developed to bridge the healthcare gap through technology and community-centered approaches.'
            },
            {
                id: 'pilot',
                title: 'Pilot Program Launch',
                description: 'Initial pilot programs in Sierra Mixe region demonstrated 80%+ community participation rates, proving the effectiveness of accessible, culturally-appropriate healthcare delivery.',
                icon: 'fas fa-rocket',
                color: '#667eea',
                year: 'Phase 5',
                details: 'The pilot programs have shown remarkable success, with community participation exceeding all expectations and demonstrating the viability of the integrated healthcare model.'
            }
        ];
        
        // Bind methods
        this.handleItemClick = this.handleItemClick.bind(this);
        this.handleKeyboardNavigation = this.handleKeyboardNavigation.bind(this);
        this.handleAutoPlay = this.handleAutoPlay.bind(this);
    }

    /**
     * Initialize the timeline module
     */
    init() {
        try {
            this.findTimelineElements();
            this.setupIntersectionObserver();
            this.setupEventListeners();
            this.setupKeyboardNavigation();
            this.setupAutoPlay();
            this.enhanceAccessibility();
            
            console.log('✅ Timeline module initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Timeline module:', error);
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
     * Find and cache timeline elements
     */
    findTimelineElements() {
        this.timelineContainer = document.querySelector('.timeline-container');
        this.timelineElement = document.querySelector('.timeline');
        this.timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
        
        if (!this.timelineContainer || this.timelineItems.length === 0) {
            console.warn('Timeline elements not found');
            return;
        }

        // Cache timeline item data
        this.timelineItems.forEach((item, index) => {
            const icon = item.querySelector('.timeline-icon i');
            const title = item.querySelector('.timeline-content h4');
            const description = item.querySelector('.timeline-content p');
            
            item.dataset.index = index;
            item.dataset.id = this.timelineData[index]?.id || `item-${index}`;
            
            // Store original data
            item.timelineData = {
                index,
                id: item.dataset.id,
                title: title?.textContent || '',
                description: description?.textContent || '',
                icon: icon?.className || '',
                element: item
            };
        });
    }

    /**
     * Setup intersection observer for animations
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateTimelineItem(entry.target);
                }
            });
        }, {
            threshold: this.config.observerThreshold,
            rootMargin: this.config.observerRootMargin
        });

        // Observe timeline items
        this.timelineItems.forEach(item => {
            observer.observe(item);
        });

        this.observers.set('timeline', observer);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Click events on timeline items
        this.timelineItems.forEach(item => {
            item.addEventListener('click', this.handleItemClick);
            item.addEventListener('keydown', this.handleKeyboardNavigation);
            
            // Make items focusable
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-expanded', 'false');
        });

        // Hover effects
        this.setupHoverEffects();

        // Resize handling
        window.addEventListener('resize', this.throttle(() => {
            this.handleResize();
        }, 250));

        // Listen for reduced motion changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', (e) => {
                this.isReducedMotion = e.matches;
                this.handleMotionPreferenceChange();
            });
        }
    }

    /**
     * Setup hover effects
     */
    setupHoverEffects() {
        this.timelineItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.enhanceTimelineItem(item);
            });

            item.addEventListener('mouseleave', () => {
                this.normalizeTimelineItem(item);
            });
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.timeline-item')) {
                this.handleKeyboardNavigation(e);
            }
        });
    }

    /**
     * Setup auto-play functionality
     */
    setupAutoPlay() {
        if (this.config.autoPlay) {
            this.startAutoPlay();
        }
    }

    /**
     * Enhance accessibility
     */
    enhanceAccessibility() {
        // Add ARIA labels and descriptions
        this.timelineItems.forEach((item, index) => {
            const data = this.timelineData[index];
            if (data) {
                item.setAttribute('aria-label', `Timeline item ${index + 1}: ${data.title}`);
                item.setAttribute('aria-describedby', `timeline-desc-${index}`);
                
                // Add hidden description for screen readers
                const description = document.createElement('div');
                description.id = `timeline-desc-${index}`;
                description.className = 'sr-only';
                description.textContent = data.description;
                item.appendChild(description);
            }
        });

        // Add timeline navigation instructions
        if (this.timelineContainer) {
            const instructions = document.createElement('div');
            instructions.className = 'sr-only';
            instructions.innerHTML = `
                <p>Timeline navigation: Use arrow keys to move between items, Enter or Space to activate, Escape to close details.</p>
            `;
            this.timelineContainer.insertBefore(instructions, this.timelineElement);
        }
    }

    /**
     * Animate timeline item
     */
    animateTimelineItem(item) {
        if (this.animatedItems.has(item)) return;

        const index = parseInt(item.dataset.index);
        const isEven = index % 2 === 1; // Second item is index 1, which is odd, but visually "even" positioned

        if (this.isReducedMotion) {
            item.classList.add('visible');
            this.animatedItems.add(item);
            return;
        }

        // Add animation classes based on position
        const animationClass = isEven ? 'slide-in-left' : 'slide-in-right';
        
        setTimeout(() => {
            item.classList.add('visible', animationClass);
            this.animatedItems.add(item);
            
            // Add completion callback
            setTimeout(() => {
                item.classList.remove(animationClass);
                this.onItemAnimationComplete(item);
            }, this.config.animationDuration);
            
        }, index * this.config.animationDelay);
    }

    /**
     * Handle item animation completion
     */
    onItemAnimationComplete(item) {
        item.classList.add('animation-complete');
        
        // Dispatch completion event
        this.dispatchTimelineEvent('item-animated', {
            item,
            index: parseInt(item.dataset.index),
            data: item.timelineData
        });
    }

    /**
     * Handle timeline item click
     */
    handleItemClick(e) {
        const item = e.currentTarget;
        this.selectTimelineItem(item);
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(e) {
        const item = e.target.closest('.timeline-item');
        if (!item) return;

        const currentIndex = parseInt(item.dataset.index);
        let targetIndex = currentIndex;

        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                targetIndex = Math.max(0, currentIndex - 1);
                break;
                
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                targetIndex = Math.min(this.timelineItems.length - 1, currentIndex + 1);
                break;
                
            case 'Home':
                e.preventDefault();
                targetIndex = 0;
                break;
                
            case 'End':
                e.preventDefault();
                targetIndex = this.timelineItems.length - 1;
                break;
                
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.selectTimelineItem(item);
                return;
                
            case 'Escape':
                e.preventDefault();
                this.deselectAllItems();
                return;
        }

        // Focus target item
        if (targetIndex !== currentIndex) {
            this.timelineItems[targetIndex].focus();
        }
    }

    /**
     * Select timeline item
     */
    selectTimelineItem(item) {
        // Deselect current active item
        if (this.currentActiveItem) {
            this.deselectTimelineItem(this.currentActiveItem);
        }

        // Select new item
        this.currentActiveItem = item;
        item.classList.add('active', 'selected');
        item.setAttribute('aria-expanded', 'true');

        // Enhance visual feedback
        this.highlightTimelineItem(item);

        // Show detailed information
        this.showTimelineDetails(item);

        // Scroll item into view if needed
        this.scrollItemIntoView(item);

        // Dispatch selection event
        this.dispatchTimelineEvent('item-selected', {
            item,
            index: parseInt(item.dataset.index),
            data: item.timelineData
        });
    }

    /**
     * Deselect timeline item
     */
    deselectTimelineItem(item) {
        item.classList.remove('active', 'selected');
        item.setAttribute('aria-expanded', 'false');
        this.removeTimelineHighlight(item);
    }

    /**
     * Deselect all timeline items
     */
    deselectAllItems() {
        if (this.currentActiveItem) {
            this.deselectTimelineItem(this.currentActiveItem);
            this.currentActiveItem = null;
        }
        
        this.hideTimelineDetails();
    }

    /**
     * Enhance timeline item on hover
     */
    enhanceTimelineItem(item) {
        if (this.isReducedMotion) return;

        const content = item.querySelector('.timeline-content');
        const icon = item.querySelector('.timeline-icon');

        if (content) {
            content.style.transform = 'scale(1.02)';
            content.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.15)';
        }

        if (icon) {
            icon.style.transform = 'scale(1.1)';
            icon.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.4)';
        }

        // Add glow effect
        this.addGlowEffect(item);
    }

    /**
     * Normalize timeline item after hover
     */
    normalizeTimelineItem(item) {
        if (this.isReducedMotion) return;

        const content = item.querySelector('.timeline-content');
        const icon = item.querySelector('.timeline-icon');

        if (content) {
            content.style.transform = '';
            content.style.boxShadow = '';
        }

        if (icon) {
            icon.style.transform = '';
            icon.style.boxShadow = '';
        }

        this.removeGlowEffect(item);
    }

    /**
     * Highlight selected timeline item
     */
    highlightTimelineItem(item) {
        const index = parseInt(item.dataset.index);
        const data = this.timelineData[index];

        if (data && data.color) {
            const icon = item.querySelector('.timeline-icon');
            if (icon) {
                icon.style.background = `linear-gradient(135deg, ${data.color}, ${this.darkenColor(data.color, 20)})`;
                icon.style.boxShadow = `0 0 30px ${data.color}40`;
            }
        }

        // Add pulse animation
        if (!this.isReducedMotion) {
            item.style.animation = 'timelinePulse 1.5s ease-in-out infinite';
        }
    }

    /**
     * Remove timeline highlight
     */
    removeTimelineHighlight(item) {
        const icon = item.querySelector('.timeline-icon');
        if (icon) {
            icon.style.background = '';
            icon.style.boxShadow = '';
        }

        item.style.animation = '';
    }

    /**
     * Add glow effect
     */
    addGlowEffect(item) {
        item.style.filter = 'drop-shadow(0 0 10px rgba(102, 126, 234, 0.3))';
    }

    /**
     * Remove glow effect
     */
    removeGlowEffect(item) {
        item.style.filter = '';
    }

    /**
     * Show timeline details
     */
    showTimelineDetails(item) {
        const index = parseInt(item.dataset.index);
        const data = this.timelineData[index];

        if (!data) return;

        // Create or update details panel
        this.createDetailsPanel(data, item);
    }

    /**
     * Create details panel
     */
    createDetailsPanel(data, item) {
        // Remove existing panel
        const existing = document.querySelector('.timeline-details-panel');
        if (existing) {
            existing.remove();
        }

        // Create new panel
        const panel = document.createElement('div');
        panel.className = 'timeline-details-panel';
        panel.innerHTML = `
            <div class="timeline-details-content">
                <div class="timeline-details-header">
                    <div class="timeline-details-icon" style="background: linear-gradient(135deg, ${data.color}, ${this.darkenColor(data.color, 20)})">
                        <i class="${data.icon}"></i>
                    </div>
                    <div class="timeline-details-title">
                        <h3>${data.title}</h3>
                        <span class="timeline-details-year">${data.year}</span>
                    </div>
                    <button class="timeline-details-close" onclick="this.closest('.timeline-details-panel').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="timeline-details-body">
                    <p class="timeline-details-description">${data.description}</p>
                    <div class="timeline-details-extra">
                        <h4>Additional Information</h4>
                        <p>${data.details}</p>
                    </div>
                </div>
            </div>
        `;

        // Position panel
        const rect = item.getBoundingClientRect();
        const isLeft = rect.left < window.innerWidth / 2;
        
        panel.style.position = 'fixed';
        panel.style.top = `${rect.top + window.scrollY}px`;
        panel.style.left = isLeft ? `${rect.right + 20}px` : 'auto';
        panel.style.right = isLeft ? 'auto' : `${window.innerWidth - rect.left + 20}px`;
        panel.style.zIndex = '1000';

        // Add to page
        document.body.appendChild(panel);

        // Animate in
        if (!this.isReducedMotion) {
            panel.style.opacity = '0';
            panel.style.transform = 'scale(0.8) translateY(-20px)';
            
            setTimeout(() => {
                panel.style.transition = 'all 0.3s ease-out';
                panel.style.opacity = '1';
                panel.style.transform = 'scale(1) translateY(0)';
            }, 10);
        }

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!panel.contains(e.target) && !item.contains(e.target)) {
                    panel.remove();
                    this.deselectAllItems();
                }
            }, { once: true });
        }, 100);
    }

    /**
     * Hide timeline details
     */
    hideTimelineDetails() {
        const panel = document.querySelector('.timeline-details-panel');
        if (panel) {
            if (!this.isReducedMotion) {
                panel.style.transition = 'all 0.3s ease-out';
                panel.style.opacity = '0';
                panel.style.transform = 'scale(0.8) translateY(-20px)';
                setTimeout(() => panel.remove(), 300);
            } else {
                panel.remove();
            }
        }
    }

    /**
     * Scroll item into view
     */
    scrollItemIntoView(item) {
        const rect = item.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isVisible) {
            item.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    /**
     * Start auto-play
     */
    startAutoPlay() {
        if (this.autoPlayInterval) return;

        let currentIndex = 0;
        
        this.autoPlayInterval = setInterval(() => {
            if (currentIndex < this.timelineItems.length) {
                this.selectTimelineItem(this.timelineItems[currentIndex]);
                currentIndex++;
            } else {
                this.stopAutoPlay();
            }
        }, this.config.autoPlayInterval);
    }

    /**
     * Stop auto-play
     */
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Reposition details panel if open
        const panel = document.querySelector('.timeline-details-panel');
        if (panel && this.currentActiveItem) {
            const rect = this.currentActiveItem.getBoundingClientRect();
            const isLeft = rect.left < window.innerWidth / 2;
            
            panel.style.left = isLeft ? `${rect.right + 20}px` : 'auto';
            panel.style.right = isLeft ? 'auto' : `${window.innerWidth - rect.left + 20}px`;
        }

        // Adjust timeline layout for mobile
        if (window.innerWidth < 768) {
            this.adjustForMobile();
        } else {
            this.adjustForDesktop();
        }
    }

    /**
     * Adjust timeline for mobile
     */
    adjustForMobile() {
        this.timelineItems.forEach(item => {
            item.style.flexDirection = 'row';
            
            const content = item.querySelector('.timeline-content');
            if (content) {
                content.style.marginLeft = '4rem';
                content.style.marginRight = '0';
            }
        });
    }

    /**
     * Adjust timeline for desktop
     */
    adjustForDesktop() {
        this.timelineItems.forEach((item, index) => {
            const isEven = index % 2 === 1;
            item.style.flexDirection = isEven ? 'row-reverse' : 'row';
            
            const content = item.querySelector('.timeline-content');
            if (content) {
                content.style.marginLeft = '2rem';
                content.style.marginRight = '2rem';
            }
        });
    }

    /**
     * Handle motion preference change
     */
    handleMotionPreferenceChange() {
        if (this.isReducedMotion) {
            // Remove all animations
            this.timelineItems.forEach(item => {
                item.style.animation = '';
                item.style.transition = 'none';
            });
        }
    }

    /**
     * Darken color utility
     */
    darkenColor(color, percent) {
        // Simple color darkening - in production, use a proper color library
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
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
     * Dispatch timeline events
     */
    dispatchTimelineEvent(type, data = {}) {
        const event = new CustomEvent(`timeline:${type}`, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Get timeline state
     */
    getState() {
        return {
            isReducedMotion: this.isReducedMotion,
            animatedItems: this.animatedItems.size,
            totalItems: this.timelineItems.length,
            currentActiveItem: this.currentActiveItem?.dataset.index || null,
            autoPlay: !!this.autoPlayInterval
        };
    }

    /**
     * Add timeline item programmatically
     */
    addTimelineItem(data, position = 'end') {
        const item = this.createTimelineItem(data);
        
        if (position === 'start') {
            this.timelineElement.insertBefore(item, this.timelineElement.firstChild);
        } else {
            this.timelineElement.appendChild(item);
        }
        
        // Update arrays and setup events
        this.timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
        this.setupTimelineItem(item);
        
        return item;
    }

    /**
     * Create timeline item element
     */
    createTimelineItem(data) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-icon" style="background: linear-gradient(135deg, ${data.color}, ${this.darkenColor(data.color, 20)})">
                <i class="${data.icon}"></i>
            </div>
            <div class="timeline-content">
                <h4>${data.title}</h4>
                <p>${data.description}</p>
            </div>
        `;
        
        return item;
    }

    /**
     * Setup individual timeline item
     */
    setupTimelineItem(item) {
        item.addEventListener('click', this.handleItemClick);
        item.addEventListener('keydown', this.handleKeyboardNavigation);
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-expanded', 'false');
    }

    /**
     * Remove timeline item
     */
    removeTimelineItem(index) {
        const item = this.timelineItems[index];
        if (item) {
            if (this.currentActiveItem === item) {
                this.deselectAllItems();
            }
            
            item.remove();
            this.timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Stop auto-play
        this.stopAutoPlay();
        
        // Disconnect observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        
        // Remove event listeners
        this.timelineItems.forEach(item => {
            item.removeEventListener('click', this.handleItemClick);
            item.removeEventListener('keydown', this.handleKeyboardNavigation);
        });
        
        // Clear references
        this.timelineContainer = null;
        this.timelineElement = null;
        this.timelineItems = [];
        this.currentActiveItem = null;
        this.animatedItems.clear();
        
        // Remove details panel
        this.hideTimelineDetails();
        
        console.log('🧹 Timeline module destroyed');
    }
}

// CSS for timeline animations and details
const timelineStyles = `
/* Timeline Animation Styles */
@keyframes timelinePulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

.timeline-details-panel {
    background: white;
    border-radius: 15px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    border: 1px solid rgba(102, 126, 234, 0.2);
    overflow: hidden;
}

.timeline-details-content {
    padding: 0;
}

.timeline-details-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f7fafc, #edf2f7);
    border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.timeline-details-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    flex-shrink: 0;
}

.timeline-details-title {
    flex: 1;
}

.timeline-details-title h3 {
    margin: 0;
    color: #1a202c;
    font-size: 1.2rem;
    font-weight: 600;
}

.timeline-details-year {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 500;
}

.timeline-details-close {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.timeline-details-close:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
}

.timeline-details-body {
    padding: 1.5rem;
}

.timeline-details-description {
    color: #4a5568;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.timeline-details-extra h4 {
    color: #1a202c;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.timeline-details-extra p {
    color: #64748b;
    line-height: 1.5;
    font-size: 0.9rem;
}

/* Screen reader only content */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Enhanced timeline item states */
.timeline-item.selected .timeline-content {
    background: rgba(102, 126, 234, 0.05);
    border-color: rgba(102, 126, 234, 0.3);
}

.timeline-item:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
}

/* Mobile adjustments */
@media (max-width: 768px) {
    .timeline-details-panel {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        right: auto !important;
        transform: translate(-50%, -50%) !important;
        max-width: 90vw;
        max-height: 80vh;
        overflow-y: auto;
    }
}
`;

// Inject timeline styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = timelineStyles;
    document.head.appendChild(styleSheet);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Timeline = Timeline;
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Timeline;
}