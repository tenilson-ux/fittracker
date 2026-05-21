// Sistema de armazenamento local usando LocalStorage

const DB = {
    // Chaves do banco de dados
    KEYS: {
        PROFILE: 'fittracker_profile',
        WEIGHTS: 'fittracker_weights',
        FOODS: 'fittracker_foods',
        EXERCISES: 'fittracker_exercises',
        WATER: 'fittracker_water',
        WATER_GOAL: 'fittracker_water_goal'
    },

    // Salvar dados
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
            return false;
        }
    },

    // Carregar dados
    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            return null;
        }
    },

    // Deletar dados
    delete(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Erro ao deletar dados:', e);
            return false;
        }
    },

    // Limpar todos os dados
    clear() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (e) {
            console.error('Erro ao limpar dados:', e);
            return false;
        }
    }
};

// Funções específicas para cada tipo de dado

const ProfileDB = {
    save(profile) {
        return DB.save(DB.KEYS.PROFILE, profile);
    },
    
    load() {
        return DB.load(DB.KEYS.PROFILE);
    }
};

const WeightDB = {
    save(weight) {
        const weights = this.loadAll();
        weights.push(weight);
        weights.sort((a, b) => new Date(a.date) - new Date(b.date));
        return DB.save(DB.KEYS.WEIGHTS, weights);
    },
    
    loadAll() {
        return DB.load(DB.KEYS.WEIGHTS) || [];
    },
    
    delete(id) {
        const weights = this.loadAll();
        const filtered = weights.filter(w => w.id !== id);
        return DB.save(DB.KEYS.WEIGHTS, filtered);
    },
    
    getLatest() {
        const weights = this.loadAll();
        return weights.length > 0 ? weights[weights.length - 1] : null;
    }
};

const FoodDB = {
    save(food) {
        const foods = this.loadAll();
        foods.push(food);
        foods.sort((a, b) => new Date(b.date) - new Date(a.date));
        return DB.save(DB.KEYS.FOODS, foods);
    },
    
    loadAll() {
        return DB.load(DB.KEYS.FOODS) || [];
    },
    
    delete(id) {
        const foods = this.loadAll();
        const filtered = foods.filter(f => f.id !== id);
        return DB.save(DB.KEYS.FOODS, filtered);
    },
    
    getByDate(date) {
        const foods = this.loadAll();
        return foods.filter(f => f.date === date);
    }
};

const ExerciseDB = {
    save(exercise) {
        const exercises = this.loadAll();
        exercises.push(exercise);
        exercises.sort((a, b) => new Date(b.date) - new Date(a.date));
        return DB.save(DB.KEYS.EXERCISES, exercises);
    },
    
    loadAll() {
        return DB.load(DB.KEYS.EXERCISES) || [];
    },
    
    delete(id) {
        const exercises = this.loadAll();
        const filtered = exercises.filter(e => e.id !== id);
        return DB.save(DB.KEYS.EXERCISES, filtered);
    },
    
    getByDate(date) {
        const exercises = this.loadAll();
        return exercises.filter(e => e.date === date);
    }
};

const WaterDB = {
    save(date, amount) {
        const waterData = this.loadAll();
        const existing = waterData.find(w => w.date === date);
        
        if (existing) {
            existing.amount = amount;
        } else {
            waterData.push({ date, amount });
        }
        
        waterData.sort((a, b) => new Date(b.date) - new Date(a.date));
        return DB.save(DB.KEYS.WATER, waterData);
    },
    
    loadAll() {
        return DB.load(DB.KEYS.WATER) || [];
    },
    
    getByDate(date) {
        const waterData = this.loadAll();
        const record = waterData.find(w => w.date === date);
        return record ? record.amount : 0;
    },
    
    saveGoal(goal) {
        return DB.save(DB.KEYS.WATER_GOAL, goal);
    },
    
    loadGoal() {
        return DB.load(DB.KEYS.WATER_GOAL) || 2500;
    }
};