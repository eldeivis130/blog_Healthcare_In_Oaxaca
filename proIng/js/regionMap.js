/**
 * Interactive Region Map Module
 * Handles interactive map functionality for Oaxaca regions
 */

const RegionMap = {
    // Map state
    isInitialized: false,
    activeRegion: null,
    mapContainer: null,
    
    // Region data
    regions: {
        'sierra-mixe': {
            id: 'sierra-mixe',
            name: 'Sierra Mixe',
            population: '125,000',
            area: '4,930 km²',
            municipalities: 17,
            mainTown: 'Zacatepec',
            healthFacilities: 8,
            accessibility: 'Very Limited',
            color: '#e53e3e',
            coordinates: { lat: 17.2, lng: -95.8 },
            challenges: [
                'Extremely mountainous terrain',
                'No paved roads to many communities',
                'Only 2 hospitals for entire region',
                'Indigenous languages predominant'
            ],
            demographics: {
                indigenous: '85%',
                ruralPopulation: '92%',
                literacyRate: '65%',
                averageIncome: '$2,800 USD/year'
            },
            healthIndicators: {
                infantMortality: '28 per 1,000',
                maternalMortality: '89 per 100,000',
                lifeExpectancy: '71 years',
                vaccination: '68%'
            },
            description: 'The Sierra Mixe region is characterized by steep mountains and deep valleys, making healthcare access extremely challenging. Many communities are only accessible by foot or horseback.'
        },
        'mixteca': {
            id: 'mixteca',
            name: 'Mixteca',
            population: '350,000',
            area: '18,500 km²',
            municipalities: 155,
            mainTown: 'Huajuapan de León',
            healthFacilities: 15,
            accessibility: 'Limited',
            color: '#d69e2e',
            coordinates: { lat: 17.8, lng: -97.8 },
            challenges: [
                'Semi-arid climate affects road conditions',
                'High migration to US affects family structure',
                'Limited specialized medical services',
                'Economic poverty limits healthcare access'
            ],
            demographics: {
                indigenous: '45%',
                ruralPopulation: '75%',
                literacyRate: '78%',
                averageIncome: '$3,200 USD/year'
            },
            healthIndicators: {
                infantMortality: '22 per 1,000',
                maternalMortality: '72 per 100,000',
                lifeExpectancy: '73 years',
                vaccination: '74%'
            },
            description: 'The Mixteca region spans from mountains to coastal plains, with varying levels of healthcare accessibility. Migration patterns significantly impact community health dynamics.'
        },
        'valles-centrales': {
            id: 'valles-centrales',
            name: 'Valles Centrales',
            population: '1,200,000',
            area: '10,500 km²',
            municipalities: 121,
            mainTown: 'Oaxaca de Juárez',
            healthFacilities: 45,
            accessibility: 'Moderate',
            color: '#38a169',
            coordinates: { lat: 17.0, lng: -96.7 },
            challenges: [
                'Urban concentration leaves rural areas underserved',
                'Traffic congestion delays emergency response',
                'Healthcare quality varies dramatically by location',
                'Growing population strains existing infrastructure'
            ],
            demographics: {
                indigenous: '35%',
                ruralPopulation: '55%',
                literacyRate: '88%',
                averageIncome: '$4,800 USD/year'
            },
            healthIndicators: {
                infantMortality: '18 per 1,000',
                maternalMortality: '55 per 100,000',
                lifeExpectancy: '75 years',
                vaccination: '82%'
            },
            description: 'The Valles Centrales includes Oaxaca City and surrounding valleys. While more developed, rural communities still face significant healthcare access challenges.'
        }
    },

    /**
     * Initialize the region map module
     */
    init() {
        if (this.isInitialized) return;
        
        this.findMapElements();
        this.setupEventListeners();
        this.createInteractiveMap();
        this.setupRegionSelection();
        
        this.isInitialized = true;
        console.log('✅ RegionMap module initialized');
    },

    /**
     * Find map elements
     */
    findMapElements() {
        this.mapContainer = document.querySelector('.interactive-map');
        
        if (!this.mapContainer) {
            console.warn('Interactive map container not found');
            return;
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.mapContainer) return;
        
        // Click event for map interaction
        this.mapContainer.addEventListener('click', () => {
            this.showDetails();
        });
        
        // Keyboard support
        this.mapContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showDetails();
            }
        });
        
        // Make focusable
        this.mapContainer.setAttribute('tabindex', '0');
        this.mapContainer.setAttribute('role', 'button');
        this.mapContainer.setAttribute('aria-label', 'Interactive map of affected regions in Oaxaca');
    },

    /**
     * Create interactive map
     */
    createInteractiveMap() {
        if (!this.mapContainer) return;
        
        // Create SVG map
        const mapSVG = this.createSVGMap();
        
        // Update map content
        const mapContent = this.mapContainer.querySelector('.map-content');
        if (mapContent) {
            mapContent.innerHTML = `
                <div class="map-header">
                    <h3 class="map-title">Rural Oaxaca Healthcare Crisis Zones</h3>
                    <p class="map-subtitle">Click on regions to explore detailed information</p>
                </div>
                <div class="map-svg-container">
                    ${mapSVG}
                </div>
                <div class="map-legend">
                    ${this.createLegend()}
                </div>
                <div class="map-statistics">
                    ${this.createMapStatistics()}
                </div>
            `;
        }
    },

    /**
     * Create SVG map of Oaxaca regions
     */
    createSVGMap() {
        return `
            <svg viewBox="0 0 400 300" class="region-map-svg">
                <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
                    </filter>
                </defs>
                
                <!-- Sierra Mixe Region -->
                <path d="M 120 80 L 180 60 L 220 90 L 200 130 L 150 140 L 110 120 Z"
                      fill="${this.regions['sierra-mixe'].color}"
                      stroke="white"
                      stroke-width="2"
                      class="region-path"
                      data-region="sierra-mixe"
                      filter="url(#shadow)"
                      opacity="0.8">
                    <title>Sierra Mixe Region</title>
                </path>
                
                <!-- Mixteca Region -->
                <path d="M 50 120 L 110 120 L 150 140 L 130 180 L 80 190 L 40 160 Z"
                      fill="${this.regions['mixteca'].color}"
                      stroke="white"
                      stroke-width="2"
                      class="region-path"
                      data-region="mixteca"
                      filter="url(#shadow)"
                      opacity="0.8">
                    <title>Mixteca Region</title>
                </path>
                
                <!-- Valles Centrales Region -->
                <path d="M 200 130 L 280 120 L 320 160 L 290 200 L 230 210 L 180 180 Z"
                      fill="${this.regions['valles-centrales'].color}"
                      stroke="white"
                      stroke-width="2"
                      class="region-path"
                      data-region="valles-centrales"
                      filter="url(#shadow)"
                      opacity="0.8">
                    <title>Valles Centrales Region</title>
                </path>
                
                <!-- Cities/Towns -->
                <circle cx="165" cy="100" r="4" fill="white" stroke="#333" stroke-width="1">
                    <title>Zacatepec (Sierra Mixe)</title>
                </circle>
                <circle cx="90" cy="155" r="4" fill="white" stroke="#333" stroke-width="1">
                    <title>Huajuapan de León (Mixteca)</title>
                </circle>
                <circle cx="250" cy="165" r="6" fill="white" stroke="#333" stroke-width="2">
                    <title>Oaxaca de Juárez (Valles Centrales)</title>
                </circle>
                
                <!-- Region Labels -->
                <text x="165" y="110" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
                    Sierra Mixe
                </text>
                <text x="90" y="165" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
                    Mixteca
                </text>
                <text x="250" y="175" text-anchor="middle" fill="white" font-size="12" font-weight="bold">
                    Valles Centrales
                </text>
            </svg>
        `;
    },

    /**
     * Create map legend
     */
    createLegend() {
        return `
            <div class="map-legend-content">
                <h4>Healthcare Accessibility Levels</h4>
                <div class="legend-items">
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${this.regions['sierra-mixe'].color}"></div>
                        <span>Very Limited (Sierra Mixe)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${this.regions['mixteca'].color}"></div>
                        <span>Limited (Mixteca)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${this.regions['valles-centrales'].color}"></div>
                        <span>Moderate (Valles Centrales)</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Create map statistics
     */
    createMapStatistics() {
        const totalPopulation = Object.values(this.regions).reduce((sum, region) => {
            return sum + parseInt(region.population.replace(/,/g, ''));
        }, 0);

        const totalMunicipalities = Object.values(this.regions).reduce((sum, region) => {
            return sum + region.municipalities;
        }, 0);

        const totalHealthFacilities = Object.values(this.regions).reduce((sum, region) => {
            return sum + region.healthFacilities;
        }, 0);

        return `
            <div class="map-stats-grid">
                <div class="map-stat">
                    <div class="stat-value">${(totalPopulation / 1000000).toFixed(1)}M</div>
                    <div class="stat-label">Total Population</div>
                </div>
                <div class="map-stat">
                    <div class="stat-value">${totalMunicipalities}</div>
                    <div class="stat-label">Municipalities</div>
                </div>
                <div class="map-stat">
                    <div class="stat-value">${totalHealthFacilities}</div>
                    <div class="stat-label">Health Facilities</div>
                </div>
            </div>
        `;
    },

    /**
     * Setup region selection
     */
    setupRegionSelection() {
        // Add click events to SVG regions
        setTimeout(() => {
            const regionPaths = document.querySelectorAll('.region-path');
            regionPaths.forEach(path => {
                path.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const regionId = path.dataset.region;
                    this.selectRegion(regionId);
                });

                path.addEventListener('mouseenter', () => {
                    this.highlightRegion(path);
                });

                path.addEventListener('mouseleave', () => {
                    this.unhighlightRegion(path);
                });

                // Make focusable
                path.setAttribute('tabindex', '0');
                path.setAttribute('role', 'button');
                
                path.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const regionId = path.dataset.region;
                        this.selectRegion(regionId);
                    }
                });
            });
        }, 100);
    },

    /**
     * Highlight region on hover
     */
    highlightRegion(path) {
        path.style.opacity = '1';
        path.style.transform = 'scale(1.05)';
        path.style.transformOrigin = 'center';
        path.style.filter = 'url(#shadow) brightness(1.1)';
    },

    /**
     * Remove region highlight
     */
    unhighlightRegion(path) {
        if (path.dataset.region !== this.activeRegion) {
            path.style.opacity = '0.8';
            path.style.transform = 'scale(1)';
            path.style.filter = 'url(#shadow)';
        }
    },

    /**
     * Select region
     */
    selectRegion(regionId) {
        const region = this.regions[regionId];
        if (!region) return;

        // Update active region
        this.activeRegion = regionId;

        // Update visual selection
        this.updateRegionSelection(regionId);

        // Show detailed information
        this.showRegionDetails(region);

        // Dispatch event
        this.dispatchMapEvent('region-selected', { regionId, region });
    },

    /**
     * Update visual selection
     */
    updateRegionSelection(regionId) {
        const regionPaths = document.querySelectorAll('.region-path');
        regionPaths.forEach(path => {
            if (path.dataset.region === regionId) {
                path.style.opacity = '1';
                path.style.transform = 'scale(1.05)';
                path.style.filter = 'url(#shadow) brightness(1.2)';
                path.setAttribute('aria-selected', 'true');
            } else {
                path.style.opacity = '0.8';
                path.style.transform = 'scale(1)';
                path.style.filter = 'url(#shadow)';
                path.setAttribute('aria-selected', 'false');
            }
        });
    },

    /**
     * Show region details
     */
    showRegionDetails(region) {
        const detailsHTML = `
            <div class="region-details">
                <div class="region-header">
                    <div class="region-icon" style="background: ${region.color}">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="region-title">
                        <h3>${region.name}</h3>
                        <p class="region-main-town">${region.mainTown}</p>
                    </div>
                    <button class="region-close" onclick="RegionMap.closeDetails()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="region-content">
                    <div class="region-description">
                        <p>${region.description}</p>
                    </div>
                    
                    <div class="region-stats">
                        <div class="region-stat-grid">
                            <div class="region-stat">
                                <i class="fas fa-users"></i>
                                <div>
                                    <div class="stat-value">${region.population}</div>
                                    <div class="stat-label">Population</div>
                                </div>
                            </div>
                            <div class="region-stat">
                                <i class="fas fa-map"></i>
                                <div>
                                    <div class="stat-value">${region.area}</div>
                                    <div class="stat-label">Area</div>
                                </div>
                            </div>
                            <div class="region-stat">
                                <i class="fas fa-city"></i>
                                <div>
                                    <div class="stat-value">${region.municipalities}</div>
                                    <div class="stat-label">Municipalities</div>
                                </div>
                            </div>
                            <div class="region-stat">
                                <i class="fas fa-hospital"></i>
                                <div>
                                    <div class="stat-value">${region.healthFacilities}</div>
                                    <div class="stat-label">Health Facilities</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="region-sections">
                        <div class="region-section">
                            <h4><i class="fas fa-exclamation-triangle"></i> Key Challenges</h4>
                            <ul class="challenges-list">
                                ${region.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="region-section">
                            <h4><i class="fas fa-chart-bar"></i> Demographics</h4>
                            <div class="demographics-grid">
                                <div class="demo-item">
                                    <span class="demo-label">Indigenous Population:</span>
                                    <span class="demo-value">${region.demographics.indigenous}</span>
                                </div>
                                <div class="demo-item">
                                    <span class="demo-label">Rural Population:</span>
                                    <span class="demo-value">${region.demographics.ruralPopulation}</span>
                                </div>
                                <div class="demo-item">
                                    <span class="demo-label">Literacy Rate:</span>
                                    <span class="demo-value">${region.demographics.literacyRate}</span>
                                </div>
                                <div class="demo-item">
                                    <span class="demo-label">Average Income:</span>
                                    <span class="demo-value">${region.demographics.averageIncome}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="region-section">
                            <h4><i class="fas fa-heartbeat"></i> Health Indicators</h4>
                            <div class="health-indicators-grid">
                                <div class="health-item">
                                    <span class="health-label">Infant Mortality:</span>
                                    <span class="health-value">${region.healthIndicators.infantMortality}</span>
                                </div>
                                <div class="health-item">
                                    <span class="health-label">Maternal Mortality:</span>
                                    <span class="health-value">${region.healthIndicators.maternalMortality}</span>
                                </div>
                                <div class="health-item">
                                    <span class="health-label">Life Expectancy:</span>
                                    <span class="health-value">${region.healthIndicators.lifeExpectancy}</span>
                                </div>
                                <div class="health-item">
                                    <span class="health-label">Vaccination Rate:</span>
                                    <span class="health-value">${region.healthIndicators.vaccination}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="region-actions">
                        <button class="btn btn-primary" onclick="RegionMap.showSolutions('${region.id}')">
                            <i class="fas fa-lightbulb"></i> View Solutions for ${region.name}
                        </button>
                        <button class="btn btn-secondary" onclick="RegionMap.shareRegion('${region.id}')">
                            <i class="fas fa-share"></i> Share Information
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Show in modal
        if (window.Modal) {
            window.Modal.show('custom', {
                title: `${region.name} Region`,
                content: detailsHTML,
                size: 'large'
            });
        } else {
            // Fallback: show in alert
            const summary = `
${region.name} Region
Population: ${region.population}
Area: ${region.area}
Municipalities: ${region.municipalities}
Health Facilities: ${region.healthFacilities}
Accessibility: ${region.accessibility}

${region.description}
            `;
            alert(summary);
        }
    },

    /**
     * Show general details
     */
    showDetails() {
        const overviewHTML = `
            <div class="map-overview">
                <div class="overview-intro">
                    <p>Rural Oaxaca faces critical healthcare accessibility challenges across three main regions. Each region has unique characteristics and varying levels of healthcare infrastructure.</p>
                </div>
                
                <div class="regions-comparison">
                    <h4>Regional Comparison</h4>
                    <div class="comparison-table">
                        <div class="comparison-header">
                            <div class="col-region">Region</div>
                            <div class="col-pop">Population</div>
                            <div class="col-facilities">Health Facilities</div>
                            <div class="col-access">Accessibility</div>
                        </div>
                        ${Object.values(this.regions).map(region => `
                            <div class="comparison-row" onclick="RegionMap.selectRegion('${region.id}')">
                                <div class="col-region">
                                    <div class="region-color" style="background: ${region.color}"></div>
                                    ${region.name}
                                </div>
                                <div class="col-pop">${region.population}</div>
                                <div class="col-facilities">${region.healthFacilities}</div>
                                <div class="col-access">
                                    <span class="access-${region.accessibility.toLowerCase().replace(' ', '-')}">${region.accessibility}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="overview-stats">
                    <h4>Overall Impact</h4>
                    <div class="impact-grid">
                        <div class="impact-item">
                            <i class="fas fa-users"></i>
                            <div>
                                <div class="impact-value">1.7M+</div>
                                <div class="impact-label">People Affected</div>
                            </div>
                        </div>
                        <div class="impact-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <div class="impact-value">8+ hours</div>
                                <div class="impact-label">Emergency Travel Time</div>
                            </div>
                        </div>
                        <div class="impact-item">
                            <i class="fas fa-hospital"></i>
                            <div>
                                <div class="impact-value">68</div>
                                <div class="impact-label">Total Health Facilities</div>
                            </div>
                        </div>
                        <div class="impact-item">
                            <i class="fas fa-chart-line"></i>
                            <div>
                                <div class="impact-value">80%+</div>
                                <div class="impact-label">Community Participation</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="overview-actions">
                    <button class="btn btn-primary" onclick="RegionMap.closeDetails(); document.querySelector('#solutions').scrollIntoView({behavior: 'smooth'})">
                        <i class="fas fa-lightbulb"></i> Explore Solutions
                    </button>
                    <button class="btn btn-secondary" onclick="RegionMap.downloadMapData()">
                        <i class="fas fa-download"></i> Download Data
                    </button>
                </div>
            </div>
        `;

        // Show in modal
        if (window.Modal) {
            window.Modal.show('custom', {
                title: 'Rural Oaxaca Healthcare Crisis Regions',
                content: overviewHTML,
                size: 'large'
            });
        }
    },

    /**
     * Close details
     */
    closeDetails() {
        if (window.Modal) {
            window.Modal.close();
        }
        
        // Reset region selection
        this.activeRegion = null;
        this.updateRegionSelection(null);
    },

    /**
     * Show solutions for specific region
     */
    showSolutions(regionId) {
        const region = this.regions[regionId];
        if (!region) return;

        this.closeDetails();
        
        // Navigate to solutions section
        setTimeout(() => {
            const solutionsSection = document.querySelector('#solutions');
            if (solutionsSection) {
                solutionsSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Show region-specific notification
            if (window.Utils) {
                window.Utils.showNotification(
                    `Viewing solutions specifically applicable to ${region.name} region`,
                    'info',
                    5000
                );
            }
        }, 300);
    },

    /**
     * Share region information
     */
    shareRegion(regionId) {
        const region = this.regions[regionId];
        if (!region) return;

        const shareText = `Learn about the healthcare crisis in ${region.name}, Oaxaca: ${region.description}`;
        const shareUrl = `${window.location.href}?region=${regionId}`;

        if (navigator.share) {
            navigator.share({
                title: `Healthcare Crisis in ${region.name}`,
                text: shareText,
                url: shareUrl
            });
        } else if (window.Utils) {
            // Copy to clipboard
            window.Utils.copyToClipboard(`${shareText}\n\n${shareUrl}`);
        } else {
            // Fallback
            alert(`Share this information:\n\n${shareText}\n\n${shareUrl}`);
        }

        this.dispatchMapEvent('region-shared', { regionId, region });
    },

    /**
     * Download map data
     */
    downloadMapData() {
        const data = {
            timestamp: new Date().toISOString(),
            regions: this.regions,
            summary: {
                totalPopulation: Object.values(this.regions).reduce((sum, r) => sum + parseInt(r.population.replace(/,/g, '')), 0),
                totalMunicipalities: Object.values(this.regions).reduce((sum, r) => sum + r.municipalities, 0),
                totalHealthFacilities: Object.values(this.regions).reduce((sum, r) => sum + r.healthFacilities, 0)
            }
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'oaxaca-healthcare-crisis-data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (window.Utils) {
            window.Utils.showNotification('Healthcare data downloaded successfully', 'success');
        }

        this.dispatchMapEvent('data-downloaded', { data });
    },

    /**
     * Load region from URL parameter
     */
    loadRegionFromURL() {
        if (window.Utils) {
            const params = window.Utils.getURLParams();
            if (params.region && this.regions[params.region]) {
                setTimeout(() => {
                    this.selectRegion(params.region);
                }, 1000);
            }
        }
    },

    /**
     * Get region statistics
     */
    getRegionStatistics(regionId = null) {
        if (regionId) {
            return this.regions[regionId] || null;
        }
        
        return {
            totalRegions: Object.keys(this.regions).length,
            totalPopulation: Object.values(this.regions).reduce((sum, r) => sum + parseInt(r.population.replace(/,/g, '')), 0),
            totalMunicipalities: Object.values(this.regions).reduce((sum, r) => sum + r.municipalities, 0),
            totalHealthFacilities: Object.values(this.regions).reduce((sum, r) => sum + r.healthFacilities, 0),
            regions: this.regions
        };
    },

    /**
     * Dispatch map events
     */
    dispatchMapEvent(type, data = {}) {
        const event = new CustomEvent(`regionMap:${type}`, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(event);
    },

    /**
     * Get map state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            activeRegion: this.activeRegion,
            regions: Object.keys(this.regions),
            statistics: this.getRegionStatistics()
        };
    },

    /**
     * Clean up resources
     */
    destroy() {
        // Remove event listeners
        if (this.mapContainer) {
            this.mapContainer.removeEventListener('click', this.showDetails);
        }

        const regionPaths = document.querySelectorAll('.region-path');
        regionPaths.forEach(path => {
            path.removeEventListener('click', () => {});
            path.removeEventListener('mouseenter', () => {});
            path.removeEventListener('mouseleave', () => {});
            path.removeEventListener('keydown', () => {});
        });

        // Clear state
        this.isInitialized = false;
        this.activeRegion = null;
        this.mapContainer = null;

        console.log('🧹 RegionMap module destroyed');
    }
};

// CSS for region map
const regionMapStyles = `
/* Region Map Styles */
.map-svg-container {
    display: flex;
    justify-content: center;
    margin: 2rem 0;
}

.region-map-svg {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    padding: 1rem;
}

.region-path {
    cursor: pointer;
    transition: all 0.3s ease;
}

.region-path:hover {
    opacity: 1 !important;
    transform: scale(1.05);
    filter: brightness(1.1);
}

.region-path:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
}

.map-legend {
    margin: 2rem 0;
    text-align: center;
}

.map-legend-content h4 {
    margin-bottom: 1rem;
    color: #1a202c;
}

.legend-items {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #4a5568;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1px solid rgba(0,0,0,0.1);
}

.map-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
}

.map-stat {
    text-align: center;
    padding: 1rem;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 10px;
}

.map-stat .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
}

.map-stat .stat-label {
    font-size: 0.8rem;
    color: #64748b;
    margin-top: 0.25rem;
}

/* Region Details Styles */
.region-details {
    max-height: 80vh;
    overflow-y: auto;
}

.region-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
}

.region-icon {
    width: 60px;
    height: 60px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
}

.region-title {
    flex: 1;
}

.region-title h3 {
    margin: 0;
    color: #1a202c;
    font-size: 1.5rem;
}

.region-main-town {
    color: #64748b;
    margin: 0;
}

.region-close {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.region-close:hover {
    background: #f1f5f9;
    color: #334155;
}

.region-description {
    margin-bottom: 2rem;
    color: #4a5568;
    line-height: 1.6;
}

.region-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.region-stat {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 10px;
}

.region-stat i {
    font-size: 1.5rem;
    color: #667eea;
}

.region-sections {
    margin-bottom: 2rem;
}

.region-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
}

.region-section h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #1a202c;
}

.region-section i {
    color: #667eea;
}

.challenges-list {
    list-style: none;
    padding: 0;
}

.challenges-list li {
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
    color: #4a5568;
}

.challenges-list li::before {
    content: '⚠️';
    position: absolute;
    left: 0;
}

.demographics-grid,
.health-indicators-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.demo-item,
.health-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    border-left: 3px solid #667eea;
}

.demo-label,
.health-label {
    color: #4a5568;
    font-weight: 500;
}

.demo-value,
.health-value {
    color: #1a202c;
    font-weight: 600;
}

.region-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
    justify-content: center;
}

/* Overview Styles */
.overview-intro {
    margin-bottom: 2rem;
    color: #4a5568;
    line-height: 1.6;
}

.comparison-table {
    background: #f8fafc;
    border-radius: 12px;
    overflow: hidden;
    margin: 1rem 0;
}

.comparison-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
    background: #667eea;
    color: white;
    font-weight: 600;
}

.comparison-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    cursor: pointer;
    transition: background 0.2s ease;
}

.comparison-row:hover {
    background: #f1f5f9;
}

.comparison-row:last-child {
    border-bottom: none;
}

.col-region {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.region-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.access-very-limited { color: #e53e3e; font-weight: 600; }
.access-limited { color: #d69e2e; font-weight: 600; }
.access-moderate { color: #38a169; font-weight: 600; }

.impact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.impact-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.impact-item i {
    font-size: 2rem;
    color: #667eea;
}

.impact-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a202c;
}

.impact-label {
    color: #64748b;
    font-size: 0.9rem;
}

.overview-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
    .legend-items {
        flex-direction: column;
        align-items: center;
    }
    
    .map-stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .region-stat-grid {
        grid-template-columns: 1fr;
    }
    
    .comparison-header,
    .comparison-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
    
    .comparison-row {
        padding: 0.75rem;
    }
    
    .col-region,
    .col-pop,
    .col-facilities,
    .col-access {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .col-pop::before { content: "Population: "; color: #64748b; }
    .col-facilities::before { content: "Health Facilities: "; color: #64748b; }
    .col-access::before { content: "Accessibility: "; color: #64748b; }
    
    .demographics-grid,
    .health-indicators-grid {
        grid-template-columns: 1fr;
    }
    
    .impact-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .region-actions,
    .overview-actions {
        flex-direction: column;
        align-items: center;
    }
    
    .region-actions .btn,
    .overview-actions .btn {
        width: 100%;
        max-width: 280px;
    }
}

@media (max-width: 480px) {
    .map-stats-grid {
        grid-template-columns: 1fr;
    }
    
    .impact-grid {
        grid-template-columns: 1fr;
    }
    
    .region-header {
        flex-direction: column;
        text-align: center;
    }
    
    .region-stat {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
    }
}

/* Accessibility Improvements */
.region-path:focus,
.comparison-row:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
    .region-map-svg {
        background: white;
        border: 2px solid #000;
    }
    
    .region-path {
        stroke: #000;
        stroke-width: 3;
    }
    
    .legend-color {
        border: 2px solid #000;
    }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
    .region-path,
    .comparison-row,
    .region-close {
        transition: none;
    }
    
    .region-path:hover {
        transform: none;
    }
}
`;

// Inject region map styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = regionMapStyles;
    document.head.appendChild(styleSheet);
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => RegionMap.loadRegionFromURL(), 100);
        });
    } else {
        setTimeout(() => RegionMap.loadRegionFromURL(), 100);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.RegionMap = RegionMap;
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegionMap;
}