// Aplicação principal

const App = {
    profile: null,
    currentDate: Calculations.getToday(),

    // Inicializar aplicação
    init() {
        console.log('🎯 Iniciando FitTracker...');
        this.loadProfile();
        this.setupEventListeners();
        this.setDefaultDates();
        this.updateDashboard();
    },

    // Configurar event listeners
    setupEventListeners() {
        // Navegação entre abas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Formulário de perfil
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // Formulário de peso
        document.getElementById('weight-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addWeight();
        });

        // Formulário de alimentação
        document.getElementById('food-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFood();
        });

        // Formulário de exercício
        document.getElementById('exercise-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExercise();
        });

        // Botões de água
        document.querySelectorAll('.btn-water').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount);
                this.addWater(amount);
            });
        });

        document.getElementById('reset-water').addEventListener('click', () => {
            this.resetWater();
        });

        // Formulário de meta de água
        document.getElementById('water-goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWaterGoal();
        });
    },

    // Definir datas padrão nos formulários
    setDefaultDates() {
        const today = this.currentDate;
        document.getElementById('weight-date').value = today;
        document.getElementById('food-date').value = today;
        document.getElementById('exercise-date').value = today;
    },

    // Alternar entre abas
    switchTab(tabName) {
        // Atualizar botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Atualizar conteúdo
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Atualizar dados específicos da aba
        switch(tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'weight':
                this.updateWeightTab();
                break;
            case 'food':
                this.updateFoodTab();
                break;
            case 'exercise':
                this.updateExerciseTab();
                break;
            case 'water':
                this.updateWaterTab();
                break;
            case 'progress':
                this.updateProgressTab();
                break;
        }
    },

    // Carregar perfil
    loadProfile() {
        this.profile = ProfileDB.load();
        if (this.profile) {
            this.fillProfileForm();
            this.updateProfileSummary();
        }
    },

    // Preencher formulário de perfil
    fillProfileForm() {
        if (!this.profile) return;

        document.getElementById('name').value = this.profile.name || '';
        document.getElementById('age').value = this.profile.age || '';
        document.getElementById('gender').value = this.profile.gender || '';
        document.getElementById('height').value = this.profile.height || '';
        document.getElementById('initial-weight').value = this.profile.initialWeight || '';
        document.getElementById('goal-weight').value = this.profile.goalWeight || '';
        document.getElementById('activity-level').value = this.profile.activityLevel || '';
        document.getElementById('goal-type').value = this.profile.goalType || '';
    },

    // Salvar perfil
    saveProfile() {
        const profile = {
            name: document.getElementById('name').value,
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            height: parseFloat(document.getElementById('height').value),
            initialWeight: parseFloat(document.getElementById('initial-weight').value),
            goalWeight: parseFloat(document.getElementById('goal-weight').value),
            activityLevel: document.getElementById('activity-level').value,
            goalType: document.getElementById('goal-type').value,
            createdAt: this.profile?.createdAt || Calculations.getToday()
        };

        // Calcular métricas
        const currentWeight = WeightDB.getLatest()?.weight || profile.initialWeight;
        const bmr = Calculations.calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
        const tdee = Calculations.calculateTDEE(bmr, profile.activityLevel);
        const calorieGoal = Calculations.calculateCalorieGoal(tdee, profile.goalType);
        const macros = Calculations.calculateMacros(calorieGoal, profile.goalType);

        profile.bmr = bmr;
        profile.tdee = tdee;
        profile.calorieGoal = calorieGoal;
        profile.macros = macros;

        if (ProfileDB.save(profile)) {
            this.profile = profile;
            this.updateProfileSummary();
            alert('✅ Perfil salvo com sucesso!');
        } else {
            alert('❌ Erro ao salvar perfil!');
        }
    },

    // Atualizar resumo do perfil
    updateProfileSummary() {
        if (!this.profile) return;

        document.getElementById('profile-summary').style.display = 'block';
        document.getElementById('bmr-value').textContent = `${this.profile.bmr} kcal/dia`;
        document.getElementById('tdee-value').textContent = `${this.profile.tdee} kcal/dia`;
        document.getElementById('daily-calorie-goal').textContent = `${this.profile.calorieGoal} kcal/dia`;
        
        const weeklyGoal = Calculations.calculateWeeklyGoal(this.profile.tdee, this.profile.calorieGoal);
        const goalText = this.profile.goalType === 'lose' ? 'Perda' : 'Ganho';
        document.getElementById('weekly-goal').textContent = `${Math.abs(weeklyGoal)} kg/semana (${goalText})`;
    },

    // Adicionar peso
    addWeight() {
        const date = document.getElementById('weight-date').value;
        const weight = parseFloat(document.getElementById('weight-value').value);

        const weightData = {
            id: Calculations.generateId(),
            date: date,
            weight: weight,
            createdAt: new Date().toISOString()
        };

        if (WeightDB.save(weightData)) {
            alert('✅ Peso registrado com sucesso!');
            document.getElementById('weight-form').reset();
            this.setDefaultDates();
            this.updateWeightTab();
            this.updateDashboard();
        } else {
            alert('❌ Erro ao registrar peso!');
        }
    },

    // Atualizar aba de peso
    updateWeightTab() {
        const weights = WeightDB.loadAll();
        const tbody = document.getElementById('weight-list');
        
        if (weights.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhuma pesagem registrada</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        weights.slice().reverse().forEach((w, index) => {
            const prevWeight = index < weights.length - 1 ? weights[weights.length - 2 - index].weight : w.weight;
            const change = w.weight - prevWeight;
            const changeText = change === 0 ? '-' : `${change > 0 ? '+' : ''}${change.toFixed(1)} kg`;
            const changeClass = change > 0 ? 'text-danger' : change < 0 ? 'text-success' : '';

            const row = `
                <tr>
                    <td>${Calculations.formatDateDisplay(w.date)}</td>
                    <td>${w.weight.toFixed(1)} kg</td>
                    <td class="${changeClass}">${changeText}</td>
                    <td>
                        <button class="btn btn-danger" onclick="App.deleteWeight('${w.id}')">🗑️</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        // Atualizar gráfico
        const labels = weights.map(w => Calculations.formatDateDisplay(w.date));
        const data = weights.map(w => w.weight);
        Charts.createWeightChart('weight-chart', labels, data);
    },

    // Deletar peso
    deleteWeight(id) {
        if (confirm('Tem certeza que deseja deletar este registro?')) {
            if (WeightDB.delete(id)) {
                this.updateWeightTab();
                this.updateDashboard();
            }
        }
    },

    // Adicionar alimentação
    addFood() {
        const food = {
            id: Calculations.generateId(),
            date: document.getElementById('food-date').value,
            mealType: document.getElementById('meal-type').value,
            description: document.getElementById('food-description').value,
            calories: parseFloat(document.getElementById('food-calories').value),
            protein: parseFloat(document.getElementById('food-protein').value),
            carbs: parseFloat(document.getElementById('food-carbs').value),
            fats: parseFloat(document.getElementById('food-fats').value),
            createdAt: new Date().toISOString()
        };

        if (FoodDB.save(food)) {
            alert('✅ Refeição registrada com sucesso!');
            document.getElementById('food-form').reset();
            this.setDefaultDates();
            this.updateFoodTab();
            this.updateDashboard();
        } else {
            alert('❌ Erro ao registrar refeição!');
        }
    },

    // Atualizar aba de alimentação
    updateFoodTab() {
        const foods = FoodDB.loadAll();
        const todayFoods = FoodDB.getByDate(this.currentDate);
        
        // Atualizar refeições de hoje
        const todayMealsDiv = document.getElementById('today-meals');
        if (todayFoods.length === 0) {
            todayMealsDiv.innerHTML = '<p class="empty-state">Nenhuma refeição registrada hoje</p>';
        } else {
            todayMealsDiv.innerHTML = '';
            const mealTypes = {
                'breakfast': 'Café da Manhã',
                'morning-snack': 'Lanche da Manhã',
                'lunch': 'Almoço',
                'afternoon-snack': 'Lanche da Tarde',
                'dinner': 'Jantar',
                'supper': 'Ceia'
            };

            todayFoods.forEach(food => {
                const mealDiv = `
                    <div class="meal-item">
                        <div class="meal-header">
                            <span class="meal-type">${mealTypes[food.mealType]}</span>
                            <span class="meal-calories">${food.calories} kcal</span>
                        </div>
                        <div class="meal-description">${food.description}</div>
                        <div class="meal-macros">
                            <span>🥩 ${food.protein}g</span>
                            <span>🍞 ${food.carbs}g</span>
                            <span>🧈 ${food.fats}g</span>
                        </div>
                    </div>
                `;
                todayMealsDiv.innerHTML += mealDiv;
            });
        }

        // Atualizar tabela histórico
        const tbody = document.getElementById('food-list');
        if (foods.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhuma refeição registrada</td></tr>';
            return;
        }

        const mealTypes = {
            'breakfast': 'Café da Manhã',
            'morning-snack': 'Lanche da Manhã',
            'lunch': 'Almoço',
            'afternoon-snack': 'Lanche da Tarde',
            'dinner': 'Jantar',
            'supper': 'Ceia'
        };

        tbody.innerHTML = '';
        foods.slice(0, 20).forEach(food => {
            const row = `
                <tr>
                    <td>${Calculations.formatDateDisplay(food.date)}</td>
                    <td>${mealTypes[food.mealType]}</td>
                    <td>${food.description}</td>
                    <td>${food.calories} kcal</td>
                    <td>
                        <button class="btn btn-danger" onclick="App.deleteFood('${food.id}')">🗑️</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    },

    // Deletar alimentação
    deleteFood(id) {
        if (confirm('Tem certeza que deseja deletar este registro?')) {
            if (FoodDB.delete(id)) {
                this.updateFoodTab();
                this.updateDashboard();
            }
        }
    },

    // Adicionar exercício
    addExercise() {
        const exercise = {
            id: Calculations.generateId(),
            date: document.getElementById('exercise-date').value,
            type: document.getElementById('exercise-type').value,
            description: document.getElementById('exercise-description').value,
            duration: parseInt(document.getElementById('exercise-duration').value),
            calories: parseFloat(document.getElementById('exercise-calories').value),
            createdAt: new Date().toISOString()
        };

        if (ExerciseDB.save(exercise)) {
            alert('✅ Exercício registrado com sucesso!');
            document.getElementById('exercise-form').reset();
            this.setDefaultDates();
            this.updateExerciseTab();
            this.updateDashboard();
        } else {
            alert('❌ Erro ao registrar exercício!');
        }
    },

    // Atualizar aba de exercícios
    updateExerciseTab() {
        const exercises = ExerciseDB.loadAll();
        
        // Atualizar gráfico semanal
        const last7Days = Calculations.getLastNDays(7);
        const labels = last7Days.map(date => Calculations.formatDateDisplay(date));
        const data = last7Days.map(date => {
            const dayExercises = ExerciseDB.getByDate(date);
            return dayExercises.reduce((sum, ex) => sum + ex.calories, 0);
        });
        Charts.createExerciseChart('exercise-chart', labels, data);

        // Atualizar tabela
        const tbody = document.getElementById('exercise-list');
        if (exercises.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum exercício registrado</td></tr>';
            return;
        }

        const exerciseTypes = {
            'walking': 'Caminhada',
            'running': 'Corrida',
            'cycling': 'Ciclismo',
            'swimming': 'Natação',
            'gym': 'Academia',
            'yoga': 'Yoga',
            'dance': 'Dança',
            'sports': 'Esportes',
            'other': 'Outro'
        };

        tbody.innerHTML = '';
        exercises.slice(0, 20).forEach(ex => {
            const row = `
                <tr>
                    <td>${Calculations.formatDateDisplay(ex.date)}</td>
                    <td>${exerciseTypes[ex.type]}</td>
                    <td>${ex.description}</td>
                    <td>${ex.duration} min</td>
                    <td>${ex.calories} kcal</td>
                    <td>
                        <button class="btn btn-danger" onclick="App.deleteExercise('${ex.id}')">🗑️</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    },

    // Deletar exercício
    deleteExercise(id) {
        if (confirm('Tem certeza que deseja deletar este registro?')) {
            if (ExerciseDB.delete(id)) {
                this.updateExerciseTab();
                this.updateDashboard();
            }
        }
    },

    // Adicionar água
    addWater(amount) {
        const current = WaterDB.getByDate(this.currentDate);
        const newAmount = current + amount;
        
        if (WaterDB.save(this.currentDate, newAmount)) {
            this.updateWaterTab();
            this.updateDashboard();
        }
    },

    // Resetar água
    resetWater() {
        if (confirm('Resetar consumo de água de hoje?')) {
            if (WaterDB.save(this.currentDate, 0)) {
                this.updateWaterTab();
                this.updateDashboard();
            }
        }
    },

    // Salvar meta de água
    saveWaterGoal() {
        const goal = parseInt(document.getElementById('water-goal-input').value);
        if (WaterDB.saveGoal(goal)) {
            alert('✅ Meta de água atualizada!');
            this.updateWaterTab();
            this.updateDashboard();
        }
    },

    // Atualizar aba de água
    updateWaterTab() {
        const goal = WaterDB.loadGoal();
        const current = WaterDB.getByDate(this.currentDate);
        
        // Atualizar visual
        const percentage = Math.min((current / goal) * 100, 100);
        document.getElementById('water-fill').style.height = `${percentage}%`;
        document.getElementById('water-amount-display').textContent = `${current} / ${goal} ml`;
        
        // Atualizar input de meta
        document.getElementById('water-goal-input').value = goal;

        // Atualizar gráfico semanal
        const last7Days = Calculations.getLastNDays(7);
        const labels = last7Days.map(date => Calculations.formatDateDisplay(date));
        const data = last7Days.map(date => WaterDB.getByDate(date));
        Charts.createWaterChart('water-chart', labels, data, goal);
    },

    // Atualizar dashboard
    updateDashboard() {
        // Peso atual e IMC
        const latestWeight = WeightDB.getLatest();
        if (latestWeight && this.profile) {
            document.getElementById('current-weight').textContent = `${latestWeight.weight.toFixed(1)} kg`;
            
            const bmi = Calculations.calculateBMI(latestWeight.weight, this.profile.height);
            document.getElementById('current-bmi').textContent = bmi;
            document.getElementById('bmi-category').textContent = Calculations.classifyBMI(parseFloat(bmi));

            // Variação de peso
            const weights = WeightDB.loadAll();
            if (weights.length > 1) {
                const prevWeight = weights[weights.length - 2].weight;
                const change = latestWeight.weight - prevWeight;
                const changeText = `${change > 0 ? '+' : ''}${change.toFixed(1)} kg desde última pesagem`;
                const changeClass = change > 0 ? 'text-danger' : 'text-success';
                document.getElementById('weight-change').textContent = changeText;
                document.getElementById('weight-change').className = changeClass;
            }
        }

        // Meta calórica
        if (this.profile) {
            document.getElementById('calorie-goal').textContent = `${this.profile.calorieGoal} kcal`;
            
            const todayFoods = FoodDB.getByDate(this.currentDate);
            const consumed = todayFoods.reduce((sum, food) => sum + food.calories, 0);
            const percentage = Math.min((consumed / this.profile.calorieGoal) * 100, 100);
            
            document.getElementById('calorie-progress').style.width = `${percentage}%`;
            document.getElementById('calorie-consumed').textContent = `${consumed} / ${this.profile.calorieGoal} kcal`;

            // Macros de hoje
            const protein = todayFoods.reduce((sum, food) => sum + food.protein, 0);
            const carbs = todayFoods.reduce((sum, food) => sum + food.carbs, 0);
            const fats = todayFoods.reduce((sum, food) => sum + food.fats, 0);

            document.getElementById('protein-today').textContent = `${protein.toFixed(0)}g`;
            document.getElementById('carbs-today').textContent = `${carbs.toFixed(0)}g`;
            document.getElementById('fats-today').textContent = `${fats.toFixed(0)}g`;

            const proteinPercentage = Math.min((protein / this.profile.macros.protein) * 100, 100);
            const carbsPercentage = Math.min((carbs / this.profile.macros.carbs) * 100, 100);
            const fatsPercentage = Math.min((fats / this.profile.macros.fats) * 100, 100);

            document.getElementById('protein-bar').style.width = `${proteinPercentage}%`;
            document.getElementById('carbs-bar').style.width = `${carbsPercentage}%`;
            document.getElementById('fats-bar').style.width = `${fatsPercentage}%`;
        }

        // Água
        const waterGoal = WaterDB.loadGoal();
        const waterCurrent = WaterDB.getByDate(this.currentDate);
        const waterPercentage = Math.min((waterCurrent / waterGoal) * 100, 100);
        
        document.getElementById('water-consumed').textContent = `${(waterCurrent / 1000).toFixed(1)}L`;
        document.getElementById('water-progress').style.width = `${waterPercentage}%`;
        document.getElementById('water-goal-text').textContent = `Meta: ${(waterGoal / 1000).toFixed(1)}L`;

        // Atividades de hoje
        const todayExercises = ExerciseDB.getByDate(this.currentDate);
        const activitiesDiv = document.getElementById('today-activities');
        
        if (todayExercises.length === 0) {
            activitiesDiv.innerHTML = '<p class="empty-state">Nenhuma atividade registrada hoje</p>';
        } else {
            const exerciseTypes = {
                'walking': 'Caminhada',
                'running': 'Corrida',
                'cycling': 'Ciclismo',
                'swimming': 'Natação',
                'gym': 'Academia',
                'yoga': 'Yoga',
                'dance': 'Dança',
                'sports': 'Esportes',
                'other': 'Outro'
            };

            activitiesDiv.innerHTML = '';
            todayExercises.forEach(ex => {
                const activityDiv = `
                    <div class="meal-item">
                        <div class="meal-header">
                            <span class="meal-type">${exerciseTypes[ex.type]}</span>
                            <span class="meal-calories">${ex.calories} kcal</span>
                        </div>
                        <div class="meal-description">${ex.description}</div>
                        <div class="meal-macros">
                            <span>⏱️ ${ex.duration} minutos</span>
                        </div>
                    </div>
                `;
                activitiesDiv.innerHTML += activityDiv;
            });
        }
    },

    // Atualizar aba de progresso
    updateProgressTab() {
        if (!this.profile) {
            return;
        }

        const weights = WeightDB.loadAll();
        const foods = FoodDB.loadAll();
        const exercises = ExerciseDB.loadAll();
        const waterRecords = WaterDB.loadAll();

        // Peso perdido/ganho
        if (weights.length > 0) {
            const currentWeight = weights[weights.length - 1].weight;
            const initialWeight = this.profile.initialWeight;
            const change = currentWeight - initialWeight;
            const changeText = `${change > 0 ? '+' : ''}${change.toFixed(1)} kg`;
            document.getElementById('total-weight-change').textContent = changeText;
            document.getElementById('total-weight-change').className = change > 0 ? 'metric-large text-danger' : 'metric-large text-success';

            // Até a meta
            const toGoal = this.profile.goalWeight - currentWeight;
            const toGoalText = `${Math.abs(toGoal).toFixed(1)} kg`;
            document.getElementById('weight-to-goal').textContent = toGoalText;

            // Progresso
            const totalToLose = Math.abs(this.profile.goalWeight - initialWeight);
            const lost = Math.abs(change);
            const progressPercentage = Math.min((lost / totalToLose) * 100, 100);
            document.getElementById('goal-progress').style.width = `${progressPercentage}%`;
            document.getElementById('goal-percentage').textContent = `${progressPercentage.toFixed(0)}% concluído`;
        }

        // Dias no programa
        const daysInProgram = Calculations.daysBetween(this.profile.createdAt, this.currentDate);
        document.getElementById('days-in-program').textContent = `${daysInProgram} dias`;

        // Média de exercícios
        const weeks = Math.ceil(daysInProgram / 7);
        const avgExercises = weeks > 0 ? (exercises.length / weeks).toFixed(1) : 0;
        document.getElementById('avg-exercises').textContent = avgExercises;

        // Gráfico de peso (últimos 30 dias)
        const last30Weights = weights.slice(-30);
        if (last30Weights.length > 0) {
            const labels = last30Weights.map(w => Calculations.formatDateDisplay(w.date));
            const data = last30Weights.map(w => w.weight);
            Charts.createWeightChart('progress-weight-chart', labels, data);
        }

        // Balanço calórico semanal
        const last7Days = Calculations.getLastNDays(7);
        const labels = last7Days.map(date => Calculations.formatDateDisplay(date));
        const consumed = last7Days.map(date => {
            const dayFoods = FoodDB.getByDate(date);
            return dayFoods.reduce((sum, food) => sum + food.calories, 0);
        });
        const burned = last7Days.map(date => {
            const dayExercises = ExerciseDB.getByDate(date);
            return dayExercises.reduce((sum, ex) => sum + ex.calories, 0);
        });
        Charts.createCalorieBalanceChart('calorie-balance-chart', labels, consumed, burned);

        // Estatísticas
        const totalCaloriesConsumed = foods.reduce((sum, food) => sum + food.calories, 0);
        const totalCaloriesBurned = exercises.reduce((sum, ex) => sum + ex.calories, 0);
        const totalWater = waterRecords.reduce((sum, w) => sum + w.amount, 0);

        document.getElementById('total-calories-consumed').textContent = `${totalCaloriesConsumed.toFixed(0)} kcal`;
        document.getElementById('total-calories-burned').textContent = `${totalCaloriesBurned.toFixed(0)} kcal`;
        document.getElementById('total-water').textContent = `${(totalWater / 1000).toFixed(1)} L`;
        document.getElementById('total-exercises').textContent = exercises.length;
    }
};

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});