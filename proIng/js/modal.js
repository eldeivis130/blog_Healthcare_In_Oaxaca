/**
 * Modal System Module
 * Handles modal dialogs, overlays, and user interactions
 */

const Modal = {
    // Modal state
    activeModals: new Map(),
    modalStack: [],
    isInitialized: false,
    focusStack: [],
    
    // Configuration
    config: {
        animationDuration: 300,
        closeOnOverlayClick: true,
        closeOnEscape: true,
        trapFocus: true,
        restoreFocus: true,
        scrollLock: true
    },

    // Modal templates
    templates: {
        support: {
            title: 'Support the Initiative',
            content: `
                <div class="modal-support">
                    <div class="support-options">
                        <h4>How You Can Help</h4>
                        <div class="support-grid">
                            <div class="support-option">
                                <div class="support-icon">💰</div>
                                <h5>Donate</h5>
                                <p>Support mobile clinic equipment and telemedicine infrastructure</p>
                                <button class="btn btn-primary" onclick="Modal.handleDonation()">Donate Now</button>
                            </div>
                            <div class="support-option">
                                <div class="support-icon">📢</div>
                                <h5>Advocate</h5>
                                <p>Share our mission and raise awareness about rural healthcare challenges</p>
                                <button class="btn btn-secondary" onclick="Modal.handleAdvocacy()">Learn More</button>
                            </div>
                            <div class="support-option">
                                <div class="support-icon">🤝</div>
                                <h5>Volunteer</h5>
                                <p>Join our community of volunteers making a difference</p>
                                <button class="btn btn-secondary" onclick="Modal.show('volunteer')">Volunteer</button>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            size: 'large'
        },
        
        partner: {
            title: 'Partnership Opportunities',
            content: `
                <div class="modal-partner">
                    <div class="partner-intro">
                        <p>Join our network of organizations working to improve healthcare access in rural Oaxaca.</p>
                    </div>
                    <div class="partner-types">
                        <div class="partner-type">
                            <h4>Healthcare Organizations</h4>
                            <ul>
                                <li>Provide medical expertise and resources</li>
                                <li>Train community health workers</li>
                                <li>Establish referral networks</li>
                            </ul>
                        </div>
                        <div class="partner-type">
                            <h4>Technology Partners</h4>
                            <ul>
                                <li>Develop telemedicine solutions</li>
                                <li>Provide connectivity infrastructure</li>
                                <li>Support digital health platforms</li>
                            </ul>
                        </div>
                        <div class="partner-type">
                            <h4>Government Agencies</h4>
                            <ul>
                                <li>Policy development and implementation</li>
                                <li>Funding and resource allocation</li>
                                <li>Regulatory support</li>
                            </ul>
                        </div>
                    </div>
                    <div class="partner-contact">
                        <h4>Get Started</h4>
                        <p>Contact our partnerships team to explore collaboration opportunities.</p>
                        <button class="btn btn-primary" onclick="Modal.handlePartnershipInquiry()">Contact Us</button>
                    </div>
                </div>
            `,
            size: 'large'
        },
        
        volunteer: {
            title: 'Volunteer Programs',
            content: `
                <div class="modal-volunteer">
                    <div class="volunteer-intro">
                        <p>Make a direct impact on rural healthcare by volunteering with our programs.</p>
                    </div>
                    <div class="volunteer-opportunities">
                        <div class="volunteer-opportunity">
                            <h4>🏥 Medical Volunteers</h4>
                            <p>Healthcare professionals providing direct care and training in rural communities.</p>
                            <div class="volunteer-requirements">
                                <strong>Requirements:</strong> Medical license, Spanish proficiency preferred
                            </div>
                        </div>
                        <div class="volunteer-opportunity">
                            <h4>💻 Technology Volunteers</h4>
                            <p>Support telemedicine infrastructure and digital health initiatives.</p>
                            <div class="volunteer-requirements">
                                <strong>Requirements:</strong> Technical background, remote work possible
                            </div>
                        </div>
                        <div class="volunteer-opportunity">
                            <h4>🌍 Community Outreach</h4>
                            <p>Help with community engagement, education, and cultural liaison work.</p>
                            <div class="volunteer-requirements">
                                <strong>Requirements:</strong> Cultural sensitivity, communication skills
                            </div>
                        </div>
                    </div>
                    <form class="volunteer-form" onsubmit="Modal.handleVolunteerSignup(event)">
                        <h4>Volunteer Application</h4>
                        <div class="form-group">
                            <label for="volunteer-name">Full Name</label>
                            <input type="text" id="volunteer-name" required>
                        </div>
                        <div class="form-group">
                            <label for="volunteer-email">Email</label>
                            <input type="email" id="volunteer-email" required>
                        </div>
                        <div class="form-group">
                            <label for="volunteer-interest">Area of Interest</label>
                            <select id="volunteer-interest" required>
                                <option value="">Select an area</option>
                                <option value="medical">Medical Volunteers</option>
                                <option value="technology">Technology Volunteers</option>
                                <option value="outreach">Community Outreach</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="volunteer-experience">Relevant Experience</label>
                            <textarea id="volunteer-experience" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Submit Application</button>
                    </form>
                </div>
            `,
            size: 'large'
        },
        
        feedback: {
            title: 'Community Feedback',
            content: `
                <div class="modal-feedback">
                    <div class="feedback-intro">
                        <p>Your input is valuable for improving healthcare accessibility in rural communities.</p>
                    </div>
                    <form class="feedback-form" onsubmit="Modal.handleFeedbackSubmission(event)">
                        <div class="form-group">
                            <label for="feedback-type">Feedback Type</label>
                            <select id="feedback-type" required>
                                <option value="">Select type</option>
                                <option value="experience">Personal Experience</option>
                                <option value="suggestion">Suggestion</option>
                                <option value="concern">Concern</option>
                                <option value="compliment">Compliment</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="feedback-location">Your Location (Optional)</label>
                            <input type="text" id="feedback-location" placeholder="e.g., Sierra Mixe, Oaxaca">
                        </div>
                        <div class="form-group">
                            <label for="feedback-message">Your Feedback</label>
                            <textarea id="feedback-message" rows="5" required placeholder="Share your experience or suggestions..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="feedback-contact">Contact Information (Optional)</label>
                            <input type="email" id="feedback-contact" placeholder="your.email@example.com">
                            <small>Only if you'd like us to follow up with you</small>
                        </div>
                        <button type="submit" class="btn btn-primary">Submit Feedback</button>
                    </form>
                </div>
            `,
            size: 'medium'
        },
        
        resources: {
            title: 'Healthcare Resources',
            content: `
                <div class="modal-resources">
                    <div class="resources-grid">
                        <div class="resource-category">
                            <h4>📋 Research Papers</h4>
                            <ul>
                                <li><a href="#" onclick="Modal.openResource('telemedicine-rural')">Telemedicine in Rural Healthcare Settings</a></li>
                                <li><a href="#" onclick="Modal.openResource('mobile-clinics')">Mobile Health Clinic Effectiveness</a></li>
                                <li><a href="#" onclick="Modal.openResource('community-engagement')">Community-Centered Healthcare Approaches</a></li>
                            </ul>
                        </div>
                        <div class="resource-category">
                            <h4>📊 Data & Statistics</h4>
                            <ul>
                                <li><a href="#" onclick="Modal.openResource('health-statistics')">Rural Oaxaca Health Statistics</a></li>
                                <li><a href="#" onclick="Modal.openResource('demographic-data')">Demographic Analysis</a></li>
                                <li><a href="#" onclick="Modal.openResource('progress-reports')">Pilot Program Results</a></li>
                            </ul>
                        </div>
                        <div class="resource-category">
                            <h4>🎓 Educational Materials</h4>
                            <ul>
                                <li><a href="#" onclick="Modal.openResource('health-guides')">Community Health Guides</a></li>
                                <li><a href="#" onclick="Modal.openResource('training-materials')">Healthcare Worker Training</a></li>
                                <li><a href="#" onclick="Modal.openResource('cultural-competency')">Cultural Competency Resources</a></li>
                            </ul>
                        </div>
                        <div class="resource-category">
                            <h4>🏥 Healthcare Directories</h4>
                            <ul>
                                <li><a href="#" onclick="Modal.openResource('facility-directory')">Healthcare Facility Directory</a></li>
                                <li><a href="#" onclick="Modal.openResource('specialist-network')">Specialist Referral Network</a></li>
                                <li><a href="#" onclick="Modal.openResource('emergency-contacts')">Emergency Contact Information</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            `,
            size: 'large'
        }
    },

    /**
     * Initialize the modal system
     */
    init() {
        if (this.isInitialized) return;
        
        this.createModalContainer();
        this.setupEventListeners();
        this.isInitialized = true;
        
        console.log('✅ Modal system initialized');
    },

    /**
     * Create modal container
     */
    createModalContainer() {
        if (document.getElementById('modal-container')) return;
        
        const container = document.createElement('div');
        container.id = 'modal-container';
        container.innerHTML = `
            <div class="modal-overlay" id="modal-overlay"></div>
            <div class="modal-wrapper" id="modal-wrapper" role="dialog" aria-modal="true" aria-hidden="true">
                <div class="modal-content" id="modal-content">
                    <div class="modal-header" id="modal-header">
                        <h2 class="modal-title" id="modal-title"></h2>
                        <button class="modal-close" id="modal-close" aria-label="Close modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="modal-body"></div>
                    <div class="modal-footer" id="modal-footer"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const overlay = document.getElementById('modal-overlay');
        const closeBtn = document.getElementById('modal-close');
        
        // Close on overlay click
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay && this.config.closeOnOverlayClick) {
                    this.close();
                }
            });
        }
        
        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.config.closeOnEscape && this.modalStack.length > 0) {
                this.close();
            }
            
            // Tab trapping
            if (e.key === 'Tab' && this.config.trapFocus && this.modalStack.length > 0) {
                this.trapFocus(e);
            }
        });
    },

    /**
     * Show modal
     */
    show(type, options = {}) {
        if (!this.isInitialized) {
            this.init();
        }
        
        const template = this.templates[type];
        if (!template && type !== 'custom') {
            console.error(`Modal template '${type}' not found`);
            return;
        }
        
        const modalData = type === 'custom' ? options : { ...template, ...options };
        const modalId = `modal-${Date.now()}`;
        
        // Store current focus
        if (this.config.restoreFocus) {
            this.focusStack.push(document.activeElement);
        }
        
        // Lock body scroll
        if (this.config.scrollLock) {
            this.lockBodyScroll();
        }
        
        // Update modal content
        this.updateModalContent(modalData);
        
        // Show modal
        this.showModalElement(modalId, modalData);
        
        // Add to stack
        this.modalStack.push(modalId);
        this.activeModals.set(modalId, modalData);
        
        // Dispatch event
        this.dispatchModalEvent('show', { id: modalId, type, data: modalData });
        
        return modalId;
    },

    /**
     * Update modal content
     */
    updateModalContent(modalData) {
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const footer = document.getElementById('modal-footer');
        const content = document.getElementById('modal-content');
        
        if (title) title.textContent = modalData.title || '';
        if (body) body.innerHTML = modalData.content || '';
        if (footer) footer.innerHTML = modalData.footer || '';
        
        // Set size
        if (content) {
            content.className = `modal-content ${modalData.size ? `modal-${modalData.size}` : 'modal-medium'}`;
        }
    },

    /**
     * Show modal element
     */
    showModalElement(modalId, modalData) {
        const container = document.getElementById('modal-container');
        const wrapper = document.getElementById('modal-wrapper');
        
        if (!container || !wrapper) return;
        
        // Show container
        container.style.display = 'flex';
        wrapper.setAttribute('aria-hidden', 'false');
        
        // Animate in
        requestAnimationFrame(() => {
            container.classList.add('modal-active');
            
            // Focus first focusable element
            setTimeout(() => {
                const firstFocusable = this.getFirstFocusableElement(wrapper);
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }, this.config.animationDuration);
        });
    },

    /**
     * Close modal
     */
    close(modalId = null) {
        const targetId = modalId || this.modalStack[this.modalStack.length - 1];
        if (!targetId) return;
        
        const container = document.getElementById('modal-container');
        const wrapper = document.getElementById('modal-wrapper');
        
        if (!container || !wrapper) return;
        
        // Remove from stack
        const index = this.modalStack.indexOf(targetId);
        if (index > -1) {
            this.modalStack.splice(index, 1);
        }
        
        this.activeModals.delete(targetId);
        
        // If no more modals, hide container
        if (this.modalStack.length === 0) {
            container.classList.remove('modal-active');
            wrapper.setAttribute('aria-hidden', 'true');
            
            setTimeout(() => {
                container.style.display = 'none';
                this.unlockBodyScroll();
                this.restoreFocus();
            }, this.config.animationDuration);
        }
        
        // Dispatch event
        this.dispatchModalEvent('close', { id: targetId });
    },

    /**
     * Close all modals
     */
    closeAll() {
        while (this.modalStack.length > 0) {
            this.close();
        }
    },

    /**
     * Lock body scroll
     */
    lockBodyScroll() {
        const scrollY = window.pageYOffset;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.dataset.scrollY = scrollY.toString();
    },

    /**
     * Unlock body scroll
     */
    unlockBodyScroll() {
        const scrollY = document.body.dataset.scrollY;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        if (scrollY) {
            window.scrollTo(0, parseInt(scrollY));
        }
        delete document.body.dataset.scrollY;
    },

    /**
     * Restore focus
     */
    restoreFocus() {
        if (this.config.restoreFocus && this.focusStack.length > 0) {
            const previousFocus = this.focusStack.pop();
            if (previousFocus && previousFocus.focus) {
                previousFocus.focus();
            }
        }
    },

    /**
     * Trap focus within modal
     */
    trapFocus(e) {
        const wrapper = document.getElementById('modal-wrapper');
        if (!wrapper) return;
        
        const focusableElements = this.getFocusableElements(wrapper);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    },

    /**
     * Get focusable elements
     */
    getFocusableElements(container) {
        const selector = 'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])';
        return Array.from(container.querySelectorAll(selector)).filter(el => {
            return !el.disabled && el.offsetParent !== null;
        });
    },

    /**
     * Get first focusable element
     */
    getFirstFocusableElement(container) {
        return this.getFocusableElements(container)[0];
    },

    /**
     * Handle form submissions and interactions
     */
    handleVolunteerSignup(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        this.showProcessing('Submitting your volunteer application...');
        
        setTimeout(() => {
            this.hideProcessing();
            this.showSuccess('Thank you for your interest! We will contact you within 48 hours.');
            setTimeout(() => this.close(), 2000);
        }, 2000);
        
        this.dispatchModalEvent('volunteer-signup', data);
    },

    handleFeedbackSubmission(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        this.showProcessing('Submitting your feedback...');
        
        setTimeout(() => {
            this.hideProcessing();
            this.showSuccess('Thank you for your feedback! Your input helps us improve our services.');
            setTimeout(() => this.close(), 2000);
        }, 1500);
        
        this.dispatchModalEvent('feedback-submitted', data);
    },

    handleDonation() {
        this.showProcessing('Redirecting to secure donation page...');
        
        setTimeout(() => {
            this.hideProcessing();
            // In a real implementation, redirect to payment processor
            alert('This would redirect to a secure donation platform like Stripe or PayPal.');
        }, 1000);
        
        this.dispatchModalEvent('donation-initiated');
    },

    handleAdvocacy() {
        this.close();
        
        // Show social sharing options
        if (window.Utils && window.Utils.shareOnSocial) {
            window.Utils.shareOnSocial('twitter');
        }
        
        this.dispatchModalEvent('advocacy-action');
    },

    handlePartnershipInquiry() {
        this.showProcessing('Preparing partnership information...');
        
        setTimeout(() => {
            this.hideProcessing();
            this.show('custom', {
                title: 'Partnership Contact',
                content: `
                    <div class="partnership-contact">
                        <p>Thank you for your interest in partnering with us!</p>
                        <div class="contact-info">
                            <h4>Partnership Team</h4>
                            <p>📧 partnerships@healthoaxaca.org</p>
                            <p>📞 +52 (951) 123-4567</p>
                            <p>📍 Oaxaca City, Oaxaca, Mexico</p>
                        </div>
                        <p>We typically respond to partnership inquiries within 2-3 business days.</p>
                    </div>
                `,
                size: 'medium'
            });
        }, 1000);
        
        this.dispatchModalEvent('partnership-inquiry');
    },

    openResource(resourceId) {
        const resources = {
            'telemedicine-rural': {
                title: 'Telemedicine in Rural Healthcare Settings',
                content: 'A comprehensive study on the effectiveness of telemedicine solutions in remote communities.'
            },
            'mobile-clinics': {
                title: 'Mobile Health Clinic Effectiveness',
                content: 'Analysis of mobile clinic programs and their impact on healthcare accessibility.'
            },
            'community-engagement': {
                title: 'Community-Centered Healthcare Approaches',
                content: 'Best practices for engaging rural communities in healthcare initiatives.'
            }
        };
        
        const resource = resources[resourceId];
        if (resource) {
            this.show('custom', {
                title: resource.title,
                content: `
                    <div class="resource-content">
                        <p>${resource.content}</p>
                        <div class="resource-actions">
                            <button class="btn btn-primary" onclick="Modal.downloadResource('${resourceId}')">
                                <i class="fas fa-download"></i> Download PDF
                            </button>
                            <button class="btn btn-secondary" onclick="Modal.shareResource('${resourceId}')">
                                <i class="fas fa-share"></i> Share
                            </button>
                        </div>
                    </div>
                `,
                size: 'medium'
            });
        }
    },

    downloadResource(resourceId) {
        // Simulate download
        this.showProcessing('Preparing download...');
        
        setTimeout(() => {
            this.hideProcessing();
            alert(`Download started for resource: ${resourceId}`);
        }, 1000);
    },

    shareResource(resourceId) {
        if (navigator.share) {
            navigator.share({
                title: 'Healthcare Resource',
                text: 'Check out this healthcare resource from HealthOaxaca',
                url: window.location.href
            });
        } else {
            // Fallback
            if (window.Utils && window.Utils.shareOnSocial) {
                window.Utils.shareOnSocial('twitter');
            }
        }
    },

    /**
     * Show processing state
     */
    showProcessing(message = 'Processing...') {
        const body = document.getElementById('modal-body');
        if (body) {
            body.innerHTML = `
                <div class="modal-processing">
                    <div class="processing-spinner"></div>
                    <p>${message}</p>
                </div>
            `;
        }
    },

    /**
     * Hide processing state
     */
    hideProcessing() {
        // Processing state is replaced by success/error messages
    },

    /**
     * Show success message
     */
    showSuccess(message) {
        const body = document.getElementById('modal-body');
        if (body) {
            body.innerHTML = `
                <div class="modal-success">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <p>${message}</p>
                </div>
            `;
        }
    },

    /**
     * Show error message
     */
    showError(message) {
        const body = document.getElementById('modal-body');
        if (body) {
            body.innerHTML = `
                <div class="modal-error">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <p>${message}</p>
                </div>
            `;
        }
    },

    /**
     * Dispatch modal events
     */
    dispatchModalEvent(type, data = {}) {
        const event = new CustomEvent(`modal:${type}`, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    },

    /**
     * Get modal state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            activeModals: this.activeModals.size,
            modalStack: [...this.modalStack],
            config: { ...this.config }
        };
    },

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    },

    /**
     * Add custom template
     */
    addTemplate(name, template) {
        this.templates[name] = template;
    },

    /**
     * Remove template
     */
    removeTemplate(name) {
        delete this.templates[name];
    },

    /**
     * Clean up resources
     */
    destroy() {
        // Close all modals
        this.closeAll();
        
        // Remove modal container
        const container = document.getElementById('modal-container');
        if (container) {
            container.remove();
        }
        
        // Clear state
        this.activeModals.clear();
        this.modalStack = [];
        this.focusStack = [];
        this.isInitialized = false;
        
        console.log('🧹 Modal system destroyed');
    }
};

// CSS for modal system
const modalStyles = `
/* Modal System Styles */
#modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-wrapper {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    opacity: 0;
    transform: scale(0.8) translateY(-50px);
    transition: all 0.3s ease;
}

.modal-content {
    background: white;
    border-radius: 20px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    position: relative;
}

.modal-small { max-width: 400px; }
.modal-medium { max-width: 600px; }
.modal-large { max-width: 900px; }

.modal-header {
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.modal-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a202c;
    flex: 1;
}

.modal-close {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    margin-left: 1rem;
    flex-shrink: 0;
}

.modal-close:hover {
    background: #f1f5f9;
    color: #334155;
}

.modal-body {
    padding: 1rem 2rem 2rem;
    max-height: 60vh;
    overflow-y: auto;
}

.modal-footer {
    padding: 1rem 2rem 2rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

/* Modal Active State */
#modal-container.modal-active .modal-overlay {
    opacity: 1;
}

#modal-container.modal-active .modal-wrapper {
    opacity: 1;
    transform: scale(1) translateY(0);
}

/* Modal Content Styles */
.support-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.support-option {
    text-align: center;
    padding: 1.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 15px;
    transition: all 0.3s ease;
}

.support-option:hover {
    border-color: #667eea;
    transform: translateY(-2px);
}

.support-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.partner-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 1.5rem 0;
}

.partner-type {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
}

.partner-type h4 {
    color: #1a202c;
    margin-bottom: 1rem;
}

.partner-type ul {
    list-style: none;
    padding: 0;
}

.partner-type li {
    padding: 0.5rem 0;
    color: #4a5568;
    position: relative;
    padding-left: 1.5rem;
}

.partner-type li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #38a169;
    font-weight: bold;
}

.volunteer-opportunities {
    margin: 1.5rem 0;
}

.volunteer-opportunity {
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 1rem;
}

.volunteer-opportunity h4 {
    color: #1a202c;
    margin-bottom: 0.5rem;
}

.volunteer-requirements {
    margin-top: 1rem;
    padding: 1rem;
    background: #f0f9ff;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #0369a1;
}

.volunteer-form {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group small {
    display: block;
    margin-top: 0.25rem;
    color: #6b7280;
    font-size: 0.875rem;
}

.feedback-form {
    margin-top: 1rem;
}

.resources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.resource-category {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
}

.resource-category h4 {
    color: #1a202c;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.resource-category ul {
    list-style: none;
    padding: 0;
}

.resource-category li {
    margin-bottom: 0.5rem;
}

.resource-category a {
    color: #667eea;
    text-decoration: none;
    padding: 0.5rem 0;
    display: block;
    border-radius: 6px;
    padding-left: 0.5rem;
    transition: all 0.2s ease;
}

.resource-category a:hover {
    background: #667eea;
    color: white;
    transform: translateX(4px);
}

/* Processing, Success, Error States */
.modal-processing,
.modal-success,
.modal-error {
    text-align: center;
    padding: 3rem 2rem;
}

.processing-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.success-icon,
.error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.success-icon {
    color: #10b981;
}

.error-icon {
    color: #ef4444;
}

.modal-success p,
.modal-error p {
    font-size: 1.1rem;
    color: #374151;
}

.partnership-contact {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
    text-align: center;
}

.contact-info {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 12px;
    margin: 1rem 0;
}

.contact-info h4 {
    color: #1a202c;
    margin-bottom: 1rem;
}

.contact-info p {
    margin: 0.5rem 0;
    color: #4a5568;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.resource-content {
    padding: 1rem 0;
}

.resource-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    #modal-container {
        padding: 1rem;
    }
    
    .modal-content {
        border-radius: 15px;
    }
    
    .modal-header,
    .modal-body,
    .modal-footer {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }
    
    .support-grid,
    .partner-types,
    .resources-grid {
        grid-template-columns: 1fr;
    }
    
    .resource-actions {
        flex-direction: column;
    }
    
    .modal-title {
        font-size: 1.25rem;
    }
}

@media (max-width: 480px) {
    #modal-container {
        padding: 0.5rem;
    }
    
    .modal-header,
    .modal-body,
    .modal-footer {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    
    .modal-header {
        padding-top: 1.5rem;
    }
    
    .modal-body {
        padding-top: 0.5rem;
        padding-bottom: 1.5rem;
    }
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
    .modal-overlay,
    .modal-wrapper,
    .support-option,
    .resource-category a {
        transition: none;
    }
    
    .processing-spinner {
        animation: none;
        border: 4px solid #667eea;
    }
}

/* Focus Styles */
.modal-wrapper:focus {
    outline: none;
}

.modal-close:focus,
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus,
.resource-category a:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
    .modal-content {
        border: 2px solid #000;
    }
    
    .modal-header {
        border-bottom-color: #000;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        border-color: #000;
    }
}
`;

// Inject modal styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Modal = Modal;
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modal;
}/**
 * Modal System Module
 * Handles modal dialogs, overlays, and user interactions
 */

