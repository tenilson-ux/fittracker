// Gerenciamento de gráficos usando Chart.js

const Charts = {
    instances: {},

    // Destruir gráfico existente
    destroy(chartId) {
        if (this.instances[chartId]) {
            this.instances[chartId].destroy();
            delete this.instances[chartId];
        }
    },

    // Gráfico de evolução de peso
    createWeightChart(canvasId, labels, data) {
        this.destroy(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Peso (kg)',
                    data: data,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // Gráfico de exercícios da semana
    createExerciseChart(canvasId, labels, data) {
        this.destroy(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calorias Queimadas',
                    data: data,
                    backgroundColor: '#2196F3',
                    borderColor: '#1976D2',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // Gráfico de consumo de água
    createWaterChart(canvasId, labels, data, goal) {
        this.destroy(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Água Consumida (ml)',
                    data: data,
                    backgroundColor: '#2196F3',
                    borderColor: '#1976D2',
                    borderWidth: 2,
                    borderRadius: 8
                }, {
                    label: 'Meta',
                    data: new Array(labels.length).fill(goal),
                    type: 'line',
                    borderColor: '#ff9800',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // Gráfico de balanço calórico
    createCalorieBalanceChart(canvasId, labels, consumed, burned) {
        this.destroy(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Consumidas',
                    data: consumed,
                    backgroundColor: '#FF6B6B',
                    borderRadius: 8
                }, {
                    label: 'Queimadas',
                    data: burned,
                    backgroundColor: '#4ECDC4',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
};