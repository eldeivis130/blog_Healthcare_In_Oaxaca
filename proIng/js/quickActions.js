/**
 * Quick Actions Module
 * Handles floating action button and quick access menu
 */

const QuickActions = {
    // State
    isInitialized: false,
    isMenuOpen: false,
    floatingBtn: null,
    actionsMenu: null,
    
    // Configuration
    config: {
        position: 'bottom-right',
        animationDuration: 300,
        hideOnScroll: false,
        autoHide: true,
        autoHideDelay: 5000
    },
    
    // Quick actions list
    actions: [
        {
            id: 'emergency',
            icon: 'fas fa-phone-alt',
            label: 'Emergency Contacts',
            description: 'Healthcare emergency numbers',
            color: '#e53e3e',
            action: () => QuickActions.showEmergencyContacts(),
            priority: 1
        },
        {
            id: 'feedback',
            icon: 'fas fa-comment',
            label: 'Submit Feedback',
            description: 'Share your experience',
            color: '#667eea',
            action: () => QuickActions.showFeedback(),
            priority: 2
        },
        {
            id: 'share',
            icon: 'fas fa-share-alt',
            label: 'Share',
            description: 'Share this information',
            color: '#38a169',
            action: () => QuickActions.showShareOptions(),
            priority: 3
        },
        {
            id: 'resources',
            icon: 'fas fa-book',
            label: 'Resources',
            description: 'Healthcare resources',
            color: '#d69e2e',
            action: () => QuickActions.showResources(),
            priority: 4
        },
        {
            id: 'accessibility',
            icon: 'fas fa-universal-access',
            label: 'Accessibility',
            description: 'Accessibility options',
            color: '#9f7aea',
            action: () => QuickActions.showAccessibilityOptions(),
            priority: 5
        }
    ],

    /**
     * Initialize the quick actions module
     */
    init() {
        if (this.isInitialized) return;
        
        this.createFloatingButton();
        this.createActionsMenu();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupAutoHide();
        
        this.isInitialized = true;
        console.log('✅ QuickActions module initialized');
    },

    /**
     * Create floating action button
     */
    createFloatingButton() {
        // Remove existing button if present
        const existing = document.querySelector('.floating-actions');
        if (existing) {
            existing.remove();
        }

        // Create floating actions container
        const container = document.createElement('div');
        container.className = 'floating-actions';
        container.innerHTML = `
            <button class="floating-btn" id="quick-actions-btn" aria-label="Quick actions menu" aria-expanded="false">
                <i class="fas fa-plus"></i>
            </button>
            <div class="quick-actions-menu" id="quick-actions-menu" role="menu" aria-hidden="true">
                ${this.createMenuItems()}
            </div>
        `;

        // Position the container
        this.positionContainer(container);

        // Add to page
        document.body.appendChild(container);

        // Cache elements
        this.floatingBtn = document.getElementById('quick-actions-btn');
        this.actionsMenu = document.getElementById('quick-actions-menu');
    },

    /**
     * Create menu items
     */
    createMenuItems() {
        return this.actions
            .sort((a, b) => a.priority - b.priority)
            .map(action => `
                <button class="quick-action-item" 
                        data-action="${action.id}"
                        role="menuitem"
                        aria-label="${action.label}: ${action.description}"
                        style="--action-color: ${action.color}">
                    <div class="action-icon">
                        <i class="${action.icon}"></i>
                    </div>
                    <div class="action-content">
                        <div class="action-label">${action.label}</div>
                        <div class="action-description">${action.description}</div>
                    </div>
                </button>
            `).join('');
    },

    /**
     * Create actions menu
     */
    createActionsMenu() {
        // Menu is created as part of the floating button
        // This method can be used for additional menu setup
    },

    /**
     * Position container based on configuration
     */
    positionContainer(container) {
        const positions = {
            'bottom-right': { bottom: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' },
            'top-right': { top: '20px', right: '20px' },
            'top-left': { top: '20px', left: '20px' }
        };

        const pos = positions[this.config.position] || positions['bottom-right'];
        
        Object.keys(pos).forEach(key => {
            container.style[key] = pos[key];
        });

        container.style.position = 'fixed';
        container.style.zIndex = '1000';
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.floatingBtn || !this.actionsMenu) return;

        // Main button click
        this.floatingBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Action item clicks
        this.actionsMenu.addEventListener('click', (e) => {
            const actionItem = e.target.closest('.quick-action-item');
            if (actionItem) {
                e.stopPropagation();
                const actionId = actionItem.dataset.action;
                this.executeAction(actionId);
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !e.target.closest('.floating-actions')) {
                this.close();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.close();
                this.floatingBtn.focus();
            }
        });

        // Scroll behavior
        if (this.config.hideOnScroll) {
            let scrollTimer;
            window.addEventListener('scroll', () => {
                this.hide();
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => {
                    this.show();
                }, 1000);
            });
        }

        // Focus management
        this.setupFocusManagement();
    },

    /**
     * Setup focus management for accessibility
     */
    setupFocusManagement() {
        const actionItems = this.actionsMenu.querySelectorAll('.quick-action-item');
        
        actionItems.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                let targetIndex;
                
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        targetIndex = (index + 1) % actionItems.length;
                        actionItems[targetIndex].focus();
                        break;
                        
                    case 'ArrowUp':
                        e.preventDefault();
                        targetIndex = (index - 1 + actionItems.length) % actionItems.length;
                        actionItems[targetIndex].focus();
                        break;
                        
                    case 'Home':
                        e.preventDefault();
                        actionItems[0].focus();
                        break;
                        
                    case 'End':
                        e.preventDefault();
                        actionItems[actionItems.length - 1].focus();
                        break;
                        
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        this.executeAction(item.dataset.action);
                        break;
                }
            });
        });
    },

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + Q to toggle quick actions
            if (e.altKey && e.key.toLowerCase() === 'q') {
                e.preventDefault();
                this.toggle();
            }
            
            // Alt + E for emergency contacts
            if (e.altKey && e.key.toLowerCase() === 'e') {
                e.preventDefault();
                this.showEmergencyContacts();
            }
            
            // Alt + F for feedback
            if (e.altKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                this.showFeedback();
            }
        });
    },

    /**
     * Setup auto-hide functionality
     */
    setupAutoHide() {
        if (!this.config.autoHide) return;

        let autoHideTimer;
        
        const resetAutoHide = () => {
            clearTimeout(autoHideTimer);
            if (this.isMenuOpen) {
                autoHideTimer = setTimeout(() => {
                    this.close();
                }, this.config.autoHideDelay);
            }
        };

        // Reset timer on user interaction
        this.actionsMenu.addEventListener('mouseenter', () => {
            clearTimeout(autoHideTimer);
        });

        this.actionsMenu.addEventListener('mouseleave', resetAutoHide);
        this.actionsMenu.addEventListener('focusin', () => {
            clearTimeout(autoHideTimer);
        });

        this.actionsMenu.addEventListener('focusout', resetAutoHide);
    },

    /**
     * Toggle menu
     */
    toggle() {
        if (this.isMenuOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Open menu
     */
    open() {
        if (this.isMenuOpen) return;

        this.isMenuOpen = true;
        this.actionsMenu.classList.add('active');
        this.actionsMenu.setAttribute('aria-hidden', 'false');
        this.floatingBtn.setAttribute('aria-expanded', 'true');
        
        // Change button icon
        const icon = this.floatingBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-times';
        }

        // Add animation classes
        const actionItems = this.actionsMenu.querySelectorAll('.quick-action-item');
        actionItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 50);
        });

        // Focus first item
        setTimeout(() => {
            const firstItem = this.actionsMenu.querySelector('.quick-action-item');
            if (firstItem) {
                firstItem.focus();
            }
        }, 100);

        this.dispatchActionEvent('menu-opened');
    },

    /**
     * Close menu
     */
    close() {
        if (!this.isMenuOpen) return;

        this.isMenuOpen = false;
        this.actionsMenu.classList.remove('active');
        this.actionsMenu.setAttribute('aria-hidden', 'true');
        this.floatingBtn.setAttribute('aria-expanded', 'false');
        
        // Change button icon back
        const icon = this.floatingBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-plus';
        }

        // Remove animation classes
        const actionItems = this.actionsMenu.querySelectorAll('.quick-action-item');
        actionItems.forEach(item => {
            item.classList.remove('visible');
        });

        this.dispatchActionEvent('menu-closed');
    },

    /**
     * Hide floating button
     */
    hide() {
        if (this.floatingBtn) {
            this.floatingBtn.style.transform = 'scale(0)';
            this.floatingBtn.style.opacity = '0';
        }
    },

    /**
     * Show floating button
     */
    show() {
        if (this.floatingBtn) {
            this.floatingBtn.style.transform = 'scale(1)';
            this.floatingBtn.style.opacity = '1';
        }
    },

    /**
     * Execute action by ID
     */
    executeAction(actionId) {
        const action = this.actions.find(a => a.id === actionId);
        if (!action) {
            console.warn(`Action ${actionId} not found`);
            return;
        }

        try {
            action.action();
            this.close();
            this.dispatchActionEvent('action-executed', { actionId, action });
        } catch (error) {
            console.error(`Error executing action ${actionId}:`, error);
            if (window.Utils) {
                window.Utils.showNotification('An error occurred while executing the action', 'error');
            }
        }
    },

    /**
     * Show emergency contacts
     */
    showEmergencyContacts() {
        if (window.Utils) {
            window.Utils.showEmergencyContacts();
        } else {
            // Fallback
            const contacts = `
EMERGENCY HEALTHCARE CONTACTS

🚨 Emergency Services: 911
🏥 Hospital General de Oaxaca: +52 951 515 0660
🚑 Cruz Roja Oaxaca: +52 951 516 4455
🏥 IMSS Hospital: +52 951 501 8400

For more contacts, visit the references section.
            `;
            alert(contacts);
        }
    },

    /**
     * Show feedback form
     */
    showFeedback() {
        if (window.Modal) {
            window.Modal.show('feedback');
        } else {
            // Fallback
            const feedback = prompt('Please share your feedback about healthcare access in rural Oaxaca:');
            if (feedback) {
                if (window.Utils) {
                    window.Utils.showNotification('Thank you for your feedback!', 'success');
                } else {
                    alert('Thank you for your feedback!');
                }
            }
        }
    },

    /**
     * Show share options
     */
    showShareOptions() {
        const shareOptionsHTML = `
            <div class="share-options">
                <h4>Share Healthcare Information</h4>
                <p>Help spread awareness about the healthcare crisis in rural Oaxaca</p>
                <div class="share-buttons">
                    <button class="share-btn twitter" onclick="QuickActions.shareOn('twitter')">
                        <i class="fab fa-twitter"></i> Twitter
                    </button>
                    <button class="share-btn facebook" onclick="QuickActions.shareOn('facebook')">
                        <i class="fab fa-facebook"></i> Facebook
                    </button>
                    <button class="share-btn linkedin" onclick="QuickActions.shareOn('linkedin')">
                        <i class="fab fa-linkedin"></i> LinkedIn
                    </button>
                    <button class="share-btn whatsapp" onclick="QuickActions.shareOn('whatsapp')">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
                    <button class="share-btn email" onclick="QuickActions.shareOn('email')">
                        <i class="fas fa-envelope"></i> Email
                    </button>
                    <button class="share-btn copy" onclick="QuickActions.copyLink()">
                        <i class="fas fa-link"></i> Copy Link
                    </button>
                </div>
            </div>
        `;

        if (window.Modal) {
            window.Modal.show('custom', {
                title: 'Share Information',
                content: shareOptionsHTML,
                size: 'medium'
            });
        } else {
            // Fallback to native sharing
            if (navigator.share) {
                navigator.share({
                    title: 'Healthcare Crisis in Rural Oaxaca',
                    text: 'Learn about the healthcare accessibility crisis in rural Oaxaca and innovative solutions.',
                    url: window.location.href
                });
            } else {
                this.copyLink();
            }
        }
    },

    /**
     * Share on specific platform
     */
    shareOn(platform) {
        if (window.Utils) {
            window.Utils.shareOnSocial(platform);
        } else {
            // Fallback
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent('Healthcare Crisis in Rural Oaxaca');
            
            let shareUrl;
            switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${title}%20${url}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${title}&body=Check out this important information about healthcare in rural Oaxaca: ${url}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        }
        
        // Close modal
        if (window.Modal) {
            window.Modal.close();
        }
    },

    /**
     * Copy link to clipboard
     */
    copyLink() {
        if (window.Utils) {
            window.Utils.copyToClipboard(window.location.href);
        } else {
            // Fallback
            try {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (error) {
                prompt('Copy this link:', window.location.href);
            }
        }
        
        // Close modal
        if (window.Modal) {
            window.Modal.close();
        }
    },

    /**
     * Show resources
     */
    showResources() {
        if (window.Modal) {
            window.Modal.show('resources');
        } else {
            // Fallback - navigate to references section
            const referencesSection = document.querySelector('#references');
            if (referencesSection) {
                referencesSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    },

    /**
     * Show accessibility options
     */
    showAccessibilityOptions() {
        const accessibilityHTML = `
            <div class="accessibility-options">
                <h4>Accessibility Options</h4>
                <p>Customize your viewing experience</p>
                
                <div class="accessibility-controls">
                    <div class="control-group">
                        <h5>Text Size</h5>
                        <div class="text-size-controls">
                            <button class="btn btn-secondary" onclick="QuickActions.changeTextSize('decrease')">
                                <i class="fas fa-minus"></i> Smaller
                            </button>
                            <button class="btn btn-secondary" onclick="QuickActions.changeTextSize('increase')">
                                <i class="fas fa-plus"></i> Larger
                            </button>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <h5>Display</h5>
                        <div class="display-controls">
                            <button class="btn btn-secondary" onclick="QuickActions.toggleHighContrast()">
                                <i class="fas fa-adjust"></i> Toggle High Contrast
                            </button>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <h5>Keyboard Shortcuts</h5>
                        <div class="shortcuts-info">
                            <div class="shortcut">
                                <kbd>Alt + Q</kbd> <span>Quick Actions</span>
                            </div>
                            <div class="shortcut">
                                <kbd>Alt + E</kbd> <span>Emergency Contacts</span>
                            </div>
                            <div class="shortcut">
                                <kbd>Alt + M</kbd> <span>Skip to Main Content</span>
                            </div>
                            <div class="shortcut">
                                <kbd>Ctrl + Shift + C</kbd> <span>High Contrast</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.Modal) {
            window.Modal.show('custom', {
                title: 'Accessibility Options',
                content: accessibilityHTML,
                size: 'medium'
            });
        } else {
            alert('Accessibility Options:\n\nKeyboard Shortcuts:\nAlt + Q: Quick Actions\nAlt + E: Emergency Contacts\nAlt + M: Skip to Main Content\nCtrl + Shift + C: High Contrast');
        }
    },

    /**
     * Change text size
     */
    changeTextSize(direction) {
        if (window.Utils) {
            if (direction === 'increase') {
                window.Utils.increaseTextSize();
            } else {
                window.Utils.decreaseTextSize();
            }
        }
    },

    /**
     * Toggle high contrast
     */
    toggleHighContrast() {
        if (window.Utils) {
            window.Utils.toggleHighContrast();
        } else {
            // Fallback
            document.body.classList.toggle('high-contrast');
        }
    },

    /**
     * Add custom action
     */
    addAction(action) {
        // Validate action object
        if (!action.id || !action.icon || !action.label || !action.action) {
            console.error('Invalid action object. Must have id, icon, label, and action properties.');
            return;
        }

        // Check if action already exists
        const existingIndex = this.actions.findIndex(a => a.id === action.id);
        if (existingIndex !== -1) {
            this.actions[existingIndex] = { ...this.actions[existingIndex], ...action };
        } else {
            this.actions.push({
                priority: this.actions.length + 1,
                color: '#667eea',
                description: '',
                ...action
            });
        }

        // Recreate menu if initialized
        if (this.isInitialized) {
            this.updateMenu();
        }
    },

    /**
     * Remove action
     */
    removeAction(actionId) {
        const index = this.actions.findIndex(a => a.id === actionId);
        if (index !== -1) {
            this.actions.splice(index, 1);
            
            // Recreate menu if initialized
            if (this.isInitialized) {
                this.updateMenu();
            }
        }
    },

    /**
     * Update menu after changes
     */
    updateMenu() {
        if (!this.actionsMenu) return;
        
        this.actionsMenu.innerHTML = this.createMenuItems();
        
        // Re-setup focus management
        this.setupFocusManagement();
    },

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Re-position if needed
        if (this.isInitialized && newConfig.position) {
            const container = document.querySelector('.floating-actions');
            if (container) {
                this.positionContainer(container);
            }
        }
    },

    /**
     * Dispatch action events
     */
    dispatchActionEvent(type, data = {}) {
        const event = new CustomEvent(`quickActions:${type}`, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    },

    /**
     * Get module state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isMenuOpen: this.isMenuOpen,
            actionsCount: this.actions.length,
            config: { ...this.config }
        };
    },

    /**
     * Clean up resources
     */
    destroy() {
        // Close menu
        this.close();
        
        // Remove elements
        const container = document.querySelector('.floating-actions');
        if (container) {
            container.remove();
        }
        
        // Clear references
        this.floatingBtn = null;
        this.actionsMenu = null;
        this.isInitialized = false;
        this.isMenuOpen = false;
        
        console.log('🧹 QuickActions module destroyed');
    }
};

// CSS for quick actions
const quickActionsStyles = `
/* Quick Actions Styles */
.floating-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
}

.floating-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1001;
}

.floating-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.6);
}

.floating-btn:focus {
    outline: 3px solid rgba(102, 126, 234, 0.5);
    outline-offset: 3px;
}

.floating-btn i {
    transition: transform 0.3s ease;
}

.floating-btn[aria-expanded="true"] i {
    transform: rotate(45deg);
}

.quick-actions-menu {
    background: white;
    border-radius: 15px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    padding: 0.5rem;
    display: none;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 280px;
    max-width: 320px;
    opacity: 0;
    transform: translateY(20px) scale(0.8);
    transition: all 0.3s ease;
    border: 1px solid rgba(102, 126, 234, 0.1);
}

.quick-actions-menu.active {
    display: flex;
    opacity: 1;
    transform: translateY(0) scale(1);
}

.quick-action-item {
    background: none;
    border: none;
    padding: 1rem;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: left;
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateX(20px);
    position: relative;
    overflow: hidden;
}

.quick-action-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--action-color, #667eea);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.quick-action-item:hover::before {
    opacity: 0.1;
}

.quick-action-item:focus {
    outline: 2px solid var(--action-color, #667eea);
    outline-offset: 2px;
}

.quick-action-item.visible {
    opacity: 1;
    transform: translateX(0);
}

.action-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--action-color, #667eea);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1rem;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
}

.action-content {
    flex: 1;
    position: relative;
    z-index: 1;
}

.action-label {
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
}

.action-description {
    color: #64748b;
    font-size: 0.8rem;
    line-height: 1.3;
}

/* Share Options Styles */
.share-options {
    text-align: center;
}

.share-options h4 {
    margin-bottom: 0.5rem;
    color: #1a202c;
}

.share-options p {
    color: #64748b;
    margin-bottom: 2rem;
}

.share-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
}

.share-btn {
    padding: 1rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    color: white;
}

.share-btn i {
    font-size: 1.5rem;
}

.share-btn.twitter { background: #1da1f2; }
.share-btn.facebook { background: #4267b2; }
.share-btn.linkedin { background: #0077b5; }
.share-btn.whatsapp { background: #25d366; }
.share-btn.email { background: #ea4335; }
.share-btn.copy { background: #6c757d; }

.share-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* Accessibility Options Styles */
.accessibility-options {
    text-align: center;
}

.accessibility-controls {
    margin-top: 2rem;
}

.control-group {
    margin-bottom: 2rem;
    text-align: left;
}

.control-group h5 {
    color: #1a202c;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.text-size-controls,
.display-controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.shortcuts-info {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.shortcut {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
}

.shortcut:last-child {
    margin-bottom: 0;
}

kbd {
    background: #e2e8f0;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-family: monospace;
    font-size: 0.8rem;
    min-width: 120px;
    text-align: center;
}

.shortcut span {
    color: #4a5568;
    flex: 1;
}

/* Animation delays for staggered appearance */
.quick-action-item:nth-child(1) { transition-delay: 0ms; }
.quick-action-item:nth-child(2) { transition-delay: 50ms; }
.quick-action-item:nth-child(3) { transition-delay: 100ms; }
.quick-action-item:nth-child(4) { transition-delay: 150ms; }
.quick-action-item:nth-child(5) { transition-delay: 200ms; }

/* Mobile responsiveness */
@media (max-width: 768px) {
    .floating-actions {
        bottom: 15px !important;
        right: 15px !important;
    }
    
    .floating-btn {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
    }
    
    .quick-actions-menu {
        min-width: 260px;
        max-width: calc(100vw - 30px);
    }
    
    .quick-action-item {
        padding: 0.75rem;
    }
    
    .action-icon {
        width: 35px;
        height: 35px;
        font-size: 0.9rem;
    }
    
    .action-label {
        font-size: 0.9rem;
    }
    
    .action-description {
        font-size: 0.75rem;
    }
    
    .share-buttons {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .text-size-controls,
    .display-controls {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    .quick-actions-menu {
        min-width: 240px;
    }
    
    .share-buttons {
        grid-template-columns: 1fr;
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .floating-btn,
    .quick-actions-menu,
    .quick-action-item,
    .share-btn {
        transition: none;
    }
    
    .floating-btn:hover {
        transform: none;
    }
    
    .share-btn:hover {
        transform: none;
    }
    
    .quick-action-item {
        opacity: 1;
        transform: none;
    }
}

/* High contrast mode */
.high-contrast .floating-btn {
    background: #000 !important;
    border: 2px solid #fff !important;
}

.high-contrast .quick-actions-menu {
    background: #fff !important;
    border: 2px solid #000 !important;
}

.high-contrast .quick-action-item {
    border: 1px solid #000 !important;
}

.high-contrast .action-icon {
    background: #000 !important;
}

/* Focus improvements */
.floating-btn:focus-visible,
.quick-action-item:focus-visible,
.share-btn:focus-visible {
    outline: 3px solid #667eea;
    outline-offset: 2px;
}

/* Print styles */
@media print {
    .floating-actions {
        display: none !important;
    }
}

/* Position variations */
.floating-actions.position-top-left {
    align-items: flex-start;
}

.floating-actions.position-top-right {
    align-items: flex-end;
}

.floating-actions.position-bottom-left {
    align-items: flex-start;
}

.floating-actions.position-bottom-right {
    align-items: flex-end;
}

/* Pulse animation for attention */
@keyframes pulse-attention {
    0%, 100% {
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    }
    50% {
        box-shadow: 0 12px 32px rgba(102, 126, 234, 0.8);
    }
}

.floating-btn.pulse {
    animation: pulse-attention 2s infinite;
}

/* Tooltip styles for actions */
.quick-action-item[data-tooltip] {
    position: relative;
}

.quick-action-item[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    background: #1a202c;
    color: white;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.8rem;
    white-space: nowrap;
    margin-left: 10px;
    z-index: 1002;
}

/* Loading state */
.quick-action-item.loading {
    opacity: 0.6;
    pointer-events: none;
}

.quick-action-item.loading .action-icon::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Inject quick actions styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = quickActionsStyles;
    document.head.appendChild(styleSheet);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.QuickActions = QuickActions;
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickActions;
}