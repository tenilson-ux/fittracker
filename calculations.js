// Funções de cálculo para o aplicativo

const Calculations = {
    // Calcular IMC (Índice de Massa Corporal)
    calculateBMI(weight, height) {
        const heightInMeters = height / 100;
        return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    },

    // Classificar IMC
    classifyBMI(bmi) {
        if (bmi < 18.5) return 'Abaixo do peso';
        if (bmi < 25) return 'Peso normal';
        if (bmi < 30) return 'Sobrepeso';
        if (bmi < 35) return 'Obesidade Grau I';
        if (bmi < 40) return 'Obesidade Grau II';
        return 'Obesidade Grau III';
    },

    // Calcular TMB (Taxa Metabólica Basal) - Fórmula de Harris-Benedict
    calculateBMR(weight, height, age, gender) {
        if (gender === 'male') {
            return (88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)).toFixed(0);
        } else {
            return (447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)).toFixed(0);
        }
    },

    // Calcular TDEE (Total Daily Energy Expenditure)
    calculateTDEE(bmr, activityLevel) {
        return (bmr * parseFloat(activityLevel)).toFixed(0);
    },

    // Calcular meta calórica baseada no objetivo
    calculateCalorieGoal(tdee, goalType) {
        const tdeeNum = parseFloat(tdee);
        
        switch (goalType) {
            case 'lose':
                return (tdeeNum - 500).toFixed(0); // Déficit de 500 kcal
            case 'gain':
                return (tdeeNum + 500).toFixed(0); // Superávit de 500 kcal
            case 'maintain':
            default:
                return tdeeNum.toFixed(0);
        }
    },

    // Calcular distribuição de macronutrientes
    calculateMacros(calories, goalType) {
        const cals = parseFloat(calories);
        
        let proteinPercent, carbsPercent, fatsPercent;
        
        switch (goalType) {
            case 'lose':
                proteinPercent = 0.35;
                carbsPercent = 0.35;
                fatsPercent = 0.30;
                break;
            case 'gain':
                proteinPercent = 0.30;
                carbsPercent = 0.45;
                fatsPercent = 0.25;
                break;
            case 'maintain':
            default:
                proteinPercent = 0.30;
                carbsPercent = 0.40;
                fatsPercent = 0.30;
        }
        
        return {
            protein: ((cals * proteinPercent) / 4).toFixed(0), // 4 kcal por grama
            carbs: ((cals * carbsPercent) / 4).toFixed(0),
            fats: ((cals * fatsPercent) / 9).toFixed(0) // 9 kcal por grama
        };
    },

    // Calcular perda/ganho semanal estimado
    calculateWeeklyGoal(currentCalories, goalCalories) {
        const difference = parseFloat(currentCalories) - parseFloat(goalCalories);
        const weeklyDeficit = difference * 7;
        const weightChange = (weeklyDeficit / 7700).toFixed(2); // 7700 kcal ≈ 1 kg
        return weightChange;
    },

    // Formatar data para yyyy-mm-dd
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Formatar data para exibição (dd/mm/yyyy)
    formatDateDisplay(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    },

    // Obter data de hoje
    getToday() {
        return this.formatDate(new Date());
    },

    // Calcular dias entre datas
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    // Obter datas dos últimos N dias
    getLastNDays(n) {
        const dates = [];
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(this.formatDate(date));
        }
        return dates;
    },

    // Gerar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};