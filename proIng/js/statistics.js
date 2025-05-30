/**
 * Statistics Module
 * Handles animated counters, data visualization, and statistical displays
 */

class Statistics {
    constructor() {
        this.counters = new Map();
        this.observers = new Map();
        this.animatedCounters = new Set();
        this.isReducedMotion = this.checkReducedMotion();
        
        // Configuration
        this.config = {
            animationDuration: 2000,
            countingSpeed: 16, // ~60fps
            observerThreshold: 0.3,
            observerRootMargin: '0px 0px -100px 0px'
        };
        
        // Data for statistics
        this.statisticsData = {
            emergencyTravelTime: { current: 0, target: 8, suffix: '+', unit: 'hrs' },
            patientsPerPhysician: { current: 0, target: 1000, suffix: '+', unit: '' },
            communityParticipation: { current: 0, target: 80, suffix: '%', unit: '' },
            criticalRegions: { current: 0, target: 3, suffix: '', unit: '' },
            rainySeasonMonths: { current: 0, target: 6, suffix: '', unit: 'months' },
            mortalityRates: { current: 0, target: 100, suffix: '', unit: 'Higher', isText: true }
        };
        
        // Chart configurations
        this.chartConfig = {
            colors: {
                primary: '#667eea',
                secondary: '#764ba2',
                emergency: '#e53e3e',
                success: '#38a169',
                warning: '#d69e2e',
                info: '#3182ce'
            },
            animations: {
                duration: 1500,
                easing: 'easeOutCubic'
            }
        };
    }

    /**
     * Initialize the statistics module
     */
    init() {
        try {
            this.findStatElements();
            this.setupIntersectionObserver();
            this.setupEventListeners();
            this.initializeCharts();
            this.setupDataRefresh();
            
            console.log('✅ Statistics module initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Statistics module:', error);
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
     * Find and cache statistic elements
     */
    findStatElements() {
        // Find counter elements
        this.counterElements = Array.from(document.querySelectorAll('.stat-number[data-target]'));
        
        // Find stat cards
        this.statCards = Array.from(document.querySelectorAll('.stat-card'));
        
        // Find statistics containers
        this.statsContainers = Array.from(document.querySelectorAll('.stats-grid, .stats-dashboard'));
        
        // Find chart containers
        this.chartContainers = Array.from(document.querySelectorAll('[data-chart]'));
        
        // Initialize counter data
        this.counterElements.forEach(element => {
            const target = parseFloat(element.dataset.target) || 0;
            const startValue = parseFloat(element.dataset.start) || 0;
            const duration = parseInt(element.dataset.duration) || this.config.animationDuration;
            const suffix = element.dataset.suffix || '';
            const prefix = element.dataset.prefix || '';
            
            this.counters.set(element, {
                startValue,
                target,
                current: startValue,
                duration,
                suffix,
                prefix,
                isAnimating: false,
                hasAnimated: false
            });
        });
    }

    /**
     * Setup intersection observer for triggering animations
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerContainerAnimation(entry.target);
                }
            });
        }, {
            threshold: this.config.observerThreshold,
            rootMargin: this.config.observerRootMargin
        });

        // Observe stats containers
        this.statsContainers.forEach(container => {
            observer.observe(container);
        });

        this.observers.set('stats', observer);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });

        // Listen for reduced motion changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', (e) => {
                this.isReducedMotion = e.matches;
                this.handleMotionPreferenceChange();
            });
        }

        // Setup card hover effects
        this.setupCardInteractions();
    }

    /**
     * Setup card interactions
     */
    setupCardInteractions() {
        this.statCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.enhanceCard(card);
            });

            card.addEventListener('mouseleave', () => {
                this.normalizeCard(card);
            });

            card.addEventListener('click', () => {
                this.showCardDetails(card);
            });
        });
    }

    /**
     * Trigger container animation
     */
    triggerContainerAnimation(container) {
        // Animate counters in the container
        const counters = container.querySelectorAll('.stat-number[data-target]');
        counters.forEach((counter, index) => {
            if (!this.animatedCounters.has(counter)) {
                setTimeout(() => {
                    this.animateCounter(counter);
                }, index * 200); // Stagger animations
            }
        });

        // Animate cards in the container
        const cards = container.querySelectorAll('.stat-card');
        this.staggerCardAnimations(cards);

        // Trigger any charts in the container
        const charts = container.querySelectorAll('[data-chart]');
        charts.forEach(chart => this.animateChart(chart));
    }

    /**
     * Animate counter element
     */
    animateCounter(element) {
        if (this.animatedCounters.has(element)) return;
        
        const counterData = this.counters.get(element);
        if (!counterData || counterData.isAnimating) return;

        this.animatedCounters.add(element);
        counterData.isAnimating = true;
        counterData.hasAnimated = true;

        if (this.isReducedMotion) {
            // Skip animation, show final value
            this.displayCounterValue(element, counterData.target, counterData);
            counterData.isAnimating = false;
            return;
        }

        const startTime = performance.now();
        const startValue = counterData.startValue;
        const endValue = counterData.target;
        const duration = counterData.duration;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function
            const easedProgress = this.easeOutCubic(progress);
            const currentValue = startValue + (endValue - startValue) * easedProgress;
            
            this.displayCounterValue(element, currentValue, counterData);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                counterData.isAnimating = false;
                this.onCounterComplete(element, counterData);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Display counter value with formatting
     */
    displayCounterValue(element, value, counterData) {
        let displayValue;
        
        if (counterData.suffix === '%' || value < 10) {
            displayValue = Math.round(value * 10) / 10; // One decimal for small numbers
        } else {
            displayValue = Math.floor(value);
        }

        // Handle special cases
        if (element.textContent.includes('Higher')) {
            element.textContent = 'Higher';
            return;
        }

        const formattedValue = this.formatNumber(displayValue);
        element.textContent = `${counterData.prefix}${formattedValue}${counterData.suffix}`;
    }

    /**
     * Format number with commas
     */
    formatNumber(num) {
        if (num >= 1000) {
            return num.toLocaleString();
        }
        return num.toString();
    }

    /**
     * Easing function - ease out cubic
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Handle counter animation completion
     */
    onCounterComplete(element, counterData) {
        // Add completion class for styling
        element.classList.add('counter-complete');
        
        // Dispatch completion event
        this.dispatchStatEvent('counter-complete', {
            element,
            value: counterData.target,
            data: counterData
        });

        // Add pulse effect
        if (!this.isReducedMotion) {
            element.style.animation = 'pulse 0.5s ease-out';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        }
    }

    /**
     * Stagger card animations
     */
    staggerCardAnimations(cards) {
        cards.forEach((card, index) => {
            if (card.classList.contains('animated')) return;
            
            setTimeout(() => {
                card.classList.add('animated', 'scale-in');
                
                // Add hover preparation
                this.prepareCardForInteraction(card);
                
            }, index * 150);
        });
    }

    /**
     * Prepare card for interaction
     */
    prepareCardForInteraction(card) {
        // Add data attributes for interaction
        if (!card.dataset.originalTransform) {
            card.dataset.originalTransform = getComputedStyle(card).transform;
        }
    }

    /**
     * Enhance card on hover
     */
    enhanceCard(card) {
        if (this.isReducedMotion) return;

        card.style.transform = 'translateY(-10px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.2)';
        
        // Enhance counter if present
        const counter = card.querySelector('.stat-number');
        if (counter && !this.counters.get(counter)?.isAnimating) {
            this.addCounterGlow(counter);
        }

        // Add ripple effect
        this.addRippleEffect(card);
    }

    /**
     * Normalize card after hover
     */
    normalizeCard(card) {
        if (this.isReducedMotion) return;

        card.style.transform = '';
        card.style.boxShadow = '';
        
        // Remove counter glow
        const counter = card.querySelector('.stat-number');
        if (counter) {
            this.removeCounterGlow(counter);
        }
    }

    /**
     * Add glow effect to counter
     */
    addCounterGlow(counter) {
        counter.style.textShadow = '0 0 20px rgba(102, 126, 234, 0.6)';
        counter.style.transform = 'scale(1.05)';
    }

    /**
     * Remove glow effect from counter
     */
    removeCounterGlow(counter) {
        counter.style.textShadow = '';
        counter.style.transform = '';
    }

    /**
     * Add ripple effect
     */
    addRippleEffect(element) {
        if (this.isReducedMotion) return;

        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(102, 126, 234, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            margin-top: -50px;
            margin-left: -50px;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Show card details
     */
    showCardDetails(card) {
        const statIcon = card.querySelector('.stat-icon');
        const statNumber = card.querySelector('.stat-number');
        const statLabel = card.querySelector('.stat-label');
        const statDescription = card.querySelector('.stat-description');

        const details = {
            icon: statIcon?.textContent || '',
            value: statNumber?.textContent || '',
            label: statLabel?.textContent || '',
            description: statDescription?.textContent || ''
        };

        this.dispatchStatEvent('card-click', { card, details });

        // Show detailed modal or tooltip
        this.showStatisticDetails(details);
    }

    /**
     * Show detailed statistics
     */
    showStatisticDetails(details) {
        // Create modal content
        const modalContent = `
            <div class="stat-detail-modal">
                <div class="stat-detail-header">
                    <span class="stat-detail-icon">${details.icon}</span>
                    <h3>${details.label}</h3>
                </div>
                <div class="stat-detail-value">${details.value}</div>
                <div class="stat-detail-description">${details.description}</div>
                <div class="stat-detail-context">
                    ${this.getStatisticContext(details.label)}
                </div>
            </div>
        `;

        // Show modal if Modal module is available
        if (window.Modal) {
            window.Modal.show('custom', {
                title: 'Healthcare Statistics',
                content: modalContent,
                size: 'medium'
            });
        } else {
            // Fallback alert
            alert(`${details.label}: ${details.value}\n\n${details.description}`);
        }
    }

    /**
     * Get contextual information for statistics
     */
    getStatisticContext(label) {
        const contexts = {
            'Hours Emergency Travel': 'During the rainy season (May-October), unpaved roads in rural Oaxaca become impassable, extending emergency travel times from 2 hours to over 8 hours.',
            'Patients per Physician': 'Rural Oaxaca has one of Mexico\'s lowest physician-to-patient ratios, with many communities relying on a single nurse for thousands of residents.',
            'Community Participation': 'When healthcare services are made accessible and culturally appropriate, community participation rates exceed 80%, demonstrating strong community engagement.',
            'Critical Regions': 'Sierra Mixe, Mixteca, and Valles Centrales are the three regions most severely affected by healthcare accessibility challenges.',
            'Months Rainy Season': 'The rainy season from May to October creates significant barriers to healthcare access due to impassable roads and isolated communities.',
            'Mortality Rates': 'Maternal and infant mortality rates in rural Oaxaca remain significantly higher than national averages due to delayed medical attention.'
        };

        return contexts[label] || 'This statistic represents a critical aspect of the healthcare accessibility crisis in rural Oaxaca.';
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        this.chartContainers.forEach(container => {
            const chartType = container.dataset.chart;
            const chartData = container.dataset.chartData;
            
            if (chartType && chartData) {
                this.createChart(container, chartType, JSON.parse(chartData));
            }
        });
    }

    /**
     * Create chart
     */
    createChart(container, type, data) {
        // Simple chart implementation (would use Chart.js or similar in production)
        switch (type) {
            case 'bar':
                this.createBarChart(container, data);
                break;
            case 'pie':
                this.createPieChart(container, data);
                break;
            case 'line':
                this.createLineChart(container, data);
                break;
            default:
                console.warn(`Chart type ${type} not supported`);
        }
    }

    /**
     * Create simple bar chart
     */
    createBarChart(container, data) {
        const maxValue = Math.max(...data.values);
        const chartHTML = `
            <div class="simple-bar-chart">
                <div class="chart-title">${data.title || 'Chart'}</div>
                <div class="chart-bars">
                    ${data.labels.map((label, index) => {
                        const value = data.values[index];
                        const height = (value / maxValue) * 100;
                        return `
                            <div class="chart-bar-container">
                                <div class="chart-bar" style="height: ${height}%" data-value="${value}">
                                    <span class="chart-bar-value">${value}</span>
                                </div>
                                <div class="chart-bar-label">${label}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = chartHTML;
        
        // Animate bars
        if (!this.isReducedMotion) {
            setTimeout(() => {
                const bars = container.querySelectorAll('.chart-bar');
                bars.forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.animation = 'growBar 1s ease-out forwards';
                    }, index * 200);
                });
            }, 100);
        }
    }

    /**
     * Animate chart
     */
    animateChart(chartContainer) {
        if (this.isReducedMotion) return;

        const bars = chartContainer.querySelectorAll('.chart-bar');
        const segments = chartContainer.querySelectorAll('.chart-segment');
        
        // Animate bars
        bars.forEach((bar, index) => {
            setTimeout(() => {
                bar.classList.add('animate');
            }, index * 150);
        });

        // Animate pie segments
        segments.forEach((segment, index) => {
            setTimeout(() => {
                segment.classList.add('animate');
            }, index * 100);
        });
    }

    /**
     * Refresh statistics data
     */
    refreshData(newData) {
        if (newData) {
            this.statisticsData = { ...this.statisticsData, ...newData };
        }

        // Update counters with new data
        this.counterElements.forEach(element => {
            const key = element.dataset.key;
            if (key && this.statisticsData[key]) {
                const counterData = this.counters.get(element);
                if (counterData) {
                    counterData.target = this.statisticsData[key].target;
                    // Re-animate if visible
                    if (this.isElementVisible(element)) {
                        this.animatedCounters.delete(element);
                        this.animateCounter(element);
                    }
                }
            }
        });
    }

    /**
     * Check if element is visible
     */
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    /**
     * Setup automatic data refresh
     */
    setupDataRefresh() {
        // In a real application, this would fetch data from an API
        setInterval(() => {
            if (Math.random() > 0.8) { // 20% chance to simulate data update
                this.simulateDataUpdate();
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Simulate data update (for demonstration)
     */
    simulateDataUpdate() {
        const updates = {
            communityParticipation: {
                ...this.statisticsData.communityParticipation,
                target: Math.min(85, this.statisticsData.communityParticipation.target + Math.random() * 2)
            }
        };

        this.refreshData(updates);
        
        // Notify about update
        this.dispatchStatEvent('data-updated', { updates });
    }

    /**
     * Pause animations
     */
    pauseAnimations() {
        this.counters.forEach((data, element) => {
            if (data.isAnimating) {
                data.isPaused = true;
            }
        });
    }

    /**
     * Resume animations
     */
    resumeAnimations() {
        this.counters.forEach((data, element) => {
            if (data.isPaused) {
                data.isPaused = false;
                // Resume animation if needed
            }
        });
    }

    /**
     * Handle motion preference change
     */
    handleMotionPreferenceChange() {
        if (this.isReducedMotion) {
            // Show final values immediately
            this.counters.forEach((data, element) => {
                this.displayCounterValue(element, data.target, data);
            });
        }
    }

    /**
     * Reset specific counter
     */
    resetCounter(element) {
        const counterData = this.counters.get(element);
        if (counterData) {
            counterData.current = counterData.startValue;
            counterData.isAnimating = false;
            counterData.hasAnimated = false;
            this.animatedCounters.delete(element);
            this.displayCounterValue(element, counterData.startValue, counterData);
        }
    }

    /**
     * Reset all counters
     */
    resetAllCounters() {
        this.counterElements.forEach(element => {
            this.resetCounter(element);
        });
        this.animatedCounters.clear();
    }

    /**
     * Get statistics summary
     */
    getStatisticsSummary() {
        const summary = {};
        
        this.counters.forEach((data, element) => {
            const label = element.closest('.stat-card')?.querySelector('.stat-label')?.textContent;
            if (label) {
                summary[label] = {
                    current: data.current,
                    target: data.target,
                    hasAnimated: data.hasAnimated
                };
            }
        });
        
        return summary;
    }

    /**
     * Dispatch statistics events
     */
    dispatchStatEvent(type, data = {}) {
        const event = new CustomEvent(`statistics:${type}`, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Get module state
     */
    getState() {
        return {
            isReducedMotion: this.isReducedMotion,
            animatedCounters: this.animatedCounters.size,
            totalCounters: this.counters.size,
            statisticsData: this.statisticsData
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Disconnect observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        
        // Clear maps and sets
        this.counters.clear();
        this.animatedCounters.clear();
        
        // Clear arrays
        this.counterElements = [];
        this.statCards = [];
        this.statsContainers = [];
        this.chartContainers = [];
        
        console.log('🧹 Statistics module destroyed');
    }
}

// CSS for chart animations
const chartStyles = `
/* Chart Animation Styles */
@keyframes growBar {
    from {
        height: 0;
    }
    to {
        height: var(--bar-height);
    }
}

@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.simple-bar-chart {
    padding: 1rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.chart-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-align: center;
}

.chart-bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 200px;
    gap: 10px;
}

.chart-bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    height: 100%;
}

.chart-bar {
    background: linear-gradient(135deg, #667eea, #764ba2);
    width: 100%;
    max-width: 40px;
    position: relative;
    border-radius: 4px 4px 0 0;
    transition: all 0.3s ease;
    --bar-height: 0%;
}

.chart-bar:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
}

.chart-bar-value {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    font-weight: 600;
    color: #4a5568;
}

.chart-bar-label {
    margin-top: 10px;
    font-size: 0.8rem;
    text-align: center;
    color: #64748b;
}

.stat-detail-modal {
    text-align: center;
    padding: 1rem;
}

.stat-detail-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.stat-detail-icon {
    font-size: 2rem;
}

.stat-detail-value {
    font-size: 3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
}

.stat-detail-description {
    color: #64748b;
    margin-bottom: 1rem;
    line-height: 1.6;
}

.stat-detail-context {
    background: #f7fafc;
    padding: 1rem;
    border-radius: 8px;
    color: #4a5568;
    font-size: 0.9rem;
    line-height: 1.5;
}
`;

// Inject chart styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = chartStyles;
    document.head.appendChild(styleSheet);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Statistics = Statistics;
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Statistics;
}