// L10n Overview Main Application
class L10nApp {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 50;
        this.currentSort = { field: 'stars', order: 'desc' };
        this.currentFilters = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProjects();
        
        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.refreshData();
        }, 5 * 60 * 1000);
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value;
                    this.currentPage = 1;
                    this.loadProjects();
                }, 300);
            });
        }

        // Filter controls
        const filters = ['category-filter', 'status-filter', 'platform-filter'];
        filters.forEach(filterId => {
            const filterEl = document.getElementById(filterId);
            if (filterEl) {
                filterEl.addEventListener('change', (e) => {
                    const filterKey = filterId.replace('-filter', '');
                    if (e.target.value) {
                        this.currentFilters[filterKey] = e.target.value;
                    } else {
                        delete this.currentFilters[filterKey];
                    }
                    this.currentPage = 1;
                    this.loadProjects();
                });
            }
        });

        // Table sorting
        const sortHeaders = document.querySelectorAll('[data-sort]');
        sortHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const field = header.getAttribute('data-sort');
                if (this.currentSort.field === field) {
                    this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
                } else {
                    this.currentSort.field = field;
                    this.currentSort.order = 'desc';
                }
                this.updateSortHeaders();
                this.loadProjects();
            });
        });

        // Pagination
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadProjects();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentPage++;
                this.loadProjects();
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    updateSortHeaders() {
        // Remove all sort classes
        document.querySelectorAll('[data-sort]').forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
        });

        // Add current sort class
        const currentHeader = document.querySelector(`[data-sort="${this.currentSort.field}"]`);
        if (currentHeader) {
            currentHeader.classList.add(`sort-${this.currentSort.order}`);
        }
    }

    loadProjects() {
        if (!l10nData) {
            setTimeout(() => this.loadProjects(), 100);
            return;
        }

        const result = l10nData.getProjects(
            this.currentFilters,
            this.currentSort.field,
            this.currentSort.order,
            this.currentPage,
            this.pageSize
        );

        this.renderProjects(result.projects);
        this.updatePagination(result);
    }

    renderProjects(projects) {
        const tbody = document.getElementById('projects-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (projects.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center" style="padding: 2rem;">
                        <i class="fas fa-search" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p>Inga projekt hittades med de aktuella filtren.</p>
                    </td>
                </tr>
            `;
            return;
        }

        projects.forEach(project => {
            const row = document.createElement('tr');
            row.className = 'fade-in';
            row.innerHTML = `
                <td>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <strong>${this.escapeHtml(project.name)}</strong>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            ${project.totalStrings.toLocaleString()} strängar
                        </div>
                    </div>
                </td>
                <td>
                    <span class="platform-icon">
                        ${this.getCategoryIcon(project.category)}
                        ${this.getCategoryName(project.category)}
                    </span>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.25rem;">
                        <i class="fas fa-star" style="color: var(--accent-color);"></i>
                        ${project.stars.toLocaleString()}
                    </div>
                </td>
                <td>
                    <span class="platform-icon platform-${project.platform}">
                        ${this.getPlatformIcon(project.platform)}
                        ${this.getPlatformName(project.platform)}
                    </span>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${this.renderProgressBar(project.swedishProgress)}
                        <span class="status-badge ${this.getStatusClass(project.swedishProgress)}">
                            ${this.getStatusText(project.swedishProgress)}
                        </span>
                    </div>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <strong>${this.formatDate(project.lastUpdate)}</strong>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            ${this.getTimeAgo(project.lastUpdate)}
                        </div>
                    </div>
                </td>
                <td>
                    ${project.quality > 0 ? `
                        <span class="quality-score ${this.getQualityClass(project.quality)}">
                            <i class="fas fa-star"></i>
                            ${project.quality}/10
                        </span>
                    ` : '<span style="opacity: 0.5;">-</span>'}
                </td>
                <td>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <a href="${project.url}" target="_blank" class="btn btn-sm btn-secondary" title="Visa projekt">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        ${project.translationUrl ? `
                            <a href="${project.translationUrl}" target="_blank" class="btn btn-sm btn-primary" title="Översätt">
                                <i class="fas fa-language"></i>
                            </a>
                        ` : ''}
                        <button class="btn btn-sm btn-secondary" onclick="app.showProjectDetails('${project.id}')" title="Detaljer">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderProgressBar(progress) {
        return `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
                <div class="progress-text">${progress}%</div>
            </div>
        `;
    }

    getStatusClass(progress) {
        if (progress >= 90) return 'status-complete';
        if (progress >= 50) return 'status-partial';
        if (progress >= 10) return 'status-minimal';
        return 'status-none';
    }

    getStatusText(progress) {
        if (progress >= 90) return 'Komplett';
        if (progress >= 50) return 'Delvis';
        if (progress >= 10) return 'Minimal';
        if (progress > 0) return 'Påbörjad';
        return 'Saknas';
    }

    getQualityClass(quality) {
        if (quality >= 8) return 'quality-excellent';
        if (quality >= 6) return 'quality-good';
        return 'quality-poor';
    }

    getCategoryIcon(category) {
        const icons = {
            'development': 'fas fa-code',
            'desktop': 'fas fa-desktop',
            'web': 'fas fa-globe',
            'mobile': 'fas fa-mobile-alt',
            'system': 'fas fa-server',
            'media': 'fas fa-play-circle',
            'games': 'fas fa-gamepad',
            'security': 'fas fa-shield-alt'
        };
        return `<i class="${icons[category] || 'fas fa-folder'}"></i>`;
    }

    getCategoryName(category) {
        const names = {
            'development': 'Utveckling',
            'desktop': 'Skrivbord',
            'web': 'Webb',
            'mobile': 'Mobil',
            'system': 'System',
            'media': 'Media',
            'games': 'Spel',
            'security': 'Säkerhet'
        };
        return names[category] || category;
    }

    getPlatformIcon(platform) {
        const icons = {
            'weblate': 'fas fa-globe',
            'crowdin': 'fas fa-users',
            'transifex': 'fas fa-language',
            'github': 'fab fa-github',
            'kde': 'fab fa-linux',
            'gnome': 'fab fa-ubuntu',
            'other': 'fas fa-code-branch'
        };
        return `<i class="${icons[platform] || 'fas fa-code-branch'}"></i>`;
    }

    getPlatformName(platform) {
        const names = {
            'weblate': 'Weblate',
            'crowdin': 'Crowdin',
            'transifex': 'Transifex',
            'github': 'GitHub',
            'kde': 'KDE',
            'gnome': 'GNOME',
            'other': 'Övrigt'
        };
        return names[platform] || platform;
    }

    updatePagination(result) {
        const showingStart = document.getElementById('showing-start');
        const showingEnd = document.getElementById('showing-end');
        const totalShowing = document.getElementById('total-showing');
        const currentPageEl = document.getElementById('current-page');
        const totalPagesEl = document.getElementById('total-pages');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        const start = ((result.page - 1) * result.pageSize) + 1;
        const end = Math.min(result.page * result.pageSize, result.total);

        if (showingStart) showingStart.textContent = start.toLocaleString();
        if (showingEnd) showingEnd.textContent = end.toLocaleString();
        if (totalShowing) totalShowing.textContent = result.total.toLocaleString();
        if (currentPageEl) currentPageEl.textContent = result.page;
        if (totalPagesEl) totalPagesEl.textContent = result.totalPages;

        if (prevBtn) {
            prevBtn.disabled = result.page <= 1;
        }
        if (nextBtn) {
            nextBtn.disabled = result.page >= result.totalPages;
        }
    }

    formatDate(date) {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getTimeAgo(date) {
        const d = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diff = now - d;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Idag';
        if (days === 1) return 'Igår';
        if (days < 7) return `${days} dagar sedan`;
        if (days < 30) return `${Math.floor(days / 7)} veckor sedan`;
        if (days < 365) return `${Math.floor(days / 30)} månader sedan`;
        return `${Math.floor(days / 365)} år sedan`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showProjectDetails(projectId) {
        const project = l10nData.projects.find(p => p.id == projectId);
        if (!project) return;

        // Create modal with project details
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${this.escapeHtml(project.name)}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="project-details">
                        <div class="detail-row">
                            <strong>Kategori:</strong> ${this.getCategoryName(project.category)}
                        </div>
                        <div class="detail-row">
                            <strong>Plattform:</strong> ${this.getPlatformName(project.platform)}
                        </div>
                        <div class="detail-row">
                            <strong>Stars:</strong> ${project.stars.toLocaleString()}
                        </div>
                        <div class="detail-row">
                            <strong>Totala strängar:</strong> ${project.totalStrings.toLocaleString()}
                        </div>
                        <div class="detail-row">
                            <strong>Svenska strängar:</strong> ${project.swedishStrings.toLocaleString()}
                        </div>
                        <div class="detail-row">
                            <strong>Framsteg:</strong> ${this.renderProgressBar(project.swedishProgress)}
                        </div>
                        <div class="detail-row">
                            <strong>Kvalitet:</strong> ${project.quality > 0 ? `${project.quality}/10` : 'Inte bedömd'}
                        </div>
                        <div class="detail-row">
                            <strong>Senast uppdaterad:</strong> ${this.formatDate(project.lastUpdate)}
                        </div>
                        <div class="detail-row">
                            <strong>Bidragare:</strong> ${project.contributors}
                        </div>
                    </div>
                    <div class="modal-actions">
                        <a href="${project.url}" target="_blank" class="btn btn-primary">
                            <i class="fas fa-external-link-alt"></i> Visa projekt
                        </a>
                        ${project.translationUrl ? `
                            <a href="${project.translationUrl}" target="_blank" class="btn btn-secondary">
                                <i class="fas fa-language"></i> Bidra med översättning
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Add styles for modal
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
                z-index: 1000;
            }
            .modal-content {
                background: white; border-radius: 12px; max-width: 600px; width: 90%;
                max-height: 80vh; overflow-y: auto;
            }
            .modal-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 2rem; border-bottom: 1px solid var(--border-color);
            }
            .modal-close {
                background: none; border: none; font-size: 2rem; cursor: pointer;
                color: var(--text-secondary);
            }
            .modal-body { padding: 2rem; }
            .detail-row { margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; }
            .modal-actions { display: flex; gap: 1rem; margin-top: 2rem; }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Close modal events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }

    async refreshData() {
        if (l10nData && typeof l10nData.refreshData === 'function') {
            try {
                await l10nData.refreshData();
                this.loadProjects();
                
                // Show refresh notification
                this.showNotification('Data uppdaterad', 'success');
            } catch (error) {
                console.error('Failed to refresh data:', error);
                this.showNotification('Misslyckades med att uppdatera data', 'error');
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed; top: 2rem; right: 2rem; z-index: 1000;
                padding: 1rem 2rem; border-radius: 8px; color: white;
                animation: slideIn 0.3s ease-out;
            }
            .notification-success { background: var(--success-color); }
            .notification-error { background: var(--danger-color); }
            .notification-info { background: var(--primary-color); }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.app = new L10nApp();
});