// L10n Overview Charts Module
class L10nCharts {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        // Wait for data to be loaded
        if (typeof l10nData === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }

        // Listen for data refresh events
        document.addEventListener('dataRefresh', () => {
            this.updateAllCharts();
        });

        this.createCharts();
    }

    createCharts() {
        const chartData = l10nData.getChartData();
        
        this.createQualityChart(chartData.quality);
        this.createActivityChart(chartData.activity);
        this.createPlatformChart(chartData.platforms);
        this.createCategoryChart(chartData.categories);
    }

    createQualityChart(data) {
        const ctx = document.getElementById('qualityChart');
        if (!ctx) return;

        this.charts.quality = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: data.colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.parsed / total) * 100);
                                return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    createActivityChart(data) {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        this.charts.activity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels.map(date => {
                    return new Date(date).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Uppdateringar',
                    data: data.data,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 7
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function(context) {
                                return `${context[0].label}`;
                            },
                            label: function(context) {
                                return `${context.parsed.y} projekt uppdaterade`;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    createPlatformChart(data) {
        const ctx = document.getElementById('platformChart');
        if (!ctx) return;

        this.charts.platform = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels.map(label => {
                    // Capitalize first letter
                    return label.charAt(0).toUpperCase() + label.slice(1);
                }),
                datasets: [{
                    label: 'Antal projekt',
                    data: data.data,
                    backgroundColor: data.colors.map(color => color + '80'), // Add transparency
                    borderColor: data.colors,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y.toLocaleString()} projekt`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    createCategoryChart(data) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        this.charts.category = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: data.labels.map(label => {
                    // Convert to Swedish and capitalize
                    const translations = {
                        'development': 'Utveckling',
                        'desktop': 'Skrivbord',
                        'web': 'Webb',
                        'mobile': 'Mobil',
                        'system': 'System',
                        'media': 'Media',
                        'games': 'Spel',
                        'security': 'Säkerhet'
                    };
                    return translations[label] || label;
                }),
                datasets: [{
                    data: data.data,
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.7)',   // Blue
                        'rgba(16, 185, 129, 0.7)',  // Green
                        'rgba(245, 158, 11, 0.7)',  // Orange
                        'rgba(239, 68, 68, 0.7)',   // Red
                        'rgba(139, 92, 246, 0.7)',  // Purple
                        'rgba(236, 72, 153, 0.7)',  // Pink
                        'rgba(6, 182, 212, 0.7)',   // Cyan
                        'rgba(34, 197, 94, 0.7)'    // Emerald
                    ],
                    borderColor: [
                        '#2563eb', '#10b981', '#f59e0b', '#ef4444',
                        '#8b5cf6', '#ec4899', '#06b6d4', '#22c55e'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.r} projekt med svenska`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    updateAllCharts() {
        const chartData = l10nData.getChartData();
        
        // Update quality chart
        if (this.charts.quality) {
            this.charts.quality.data.datasets[0].data = chartData.quality.data;
            this.charts.quality.update();
        }

        // Update activity chart
        if (this.charts.activity) {
            this.charts.activity.data.datasets[0].data = chartData.activity.data;
            this.charts.activity.update();
        }

        // Update platform chart
        if (this.charts.platform) {
            this.charts.platform.data.labels = chartData.platforms.labels;
            this.charts.platform.data.datasets[0].data = chartData.platforms.data;
            this.charts.platform.update();
        }

        // Update category chart
        if (this.charts.category) {
            this.charts.category.data.labels = chartData.categories.labels.map(label => {
                const translations = {
                    'development': 'Utveckling',
                    'desktop': 'Skrivbord',
                    'web': 'Webb',
                    'mobile': 'Mobil',
                    'system': 'System',
                    'media': 'Media',
                    'games': 'Spel',
                    'security': 'Säkerhet'
                };
                return translations[label] || label;
            });
            this.charts.category.data.datasets[0].data = chartData.categories.data;
            this.charts.category.update();
        }
    }

    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

// Initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const charts = new L10nCharts();
});