export interface WorkoutLog {
  id: string;
  name: string;
  type: string; // e.g. "跑步", "力量训练", "游泳", "骑行", "瑜伽", "HIIT"
  duration: number; // in minutes
  caloriesBurned: number;
  intensity: 'easy' | 'medium' | 'hard';
  timestamp: number;
}

export interface FoodLog {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  portionGrams: number;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  timestamp: number;
}

export interface WeightLog {
  id: string;
  value: number; // in kg
  timestamp: number;
}

export interface WaterLog {
  id: string;
  volumeMl: number; // in ml e.g. 250
  timestamp: number;
}

export interface FoodPreset {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  category: string;
}

export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  age: number;
  height: number; // in cm
  weight: number; // in kg
  weightGoal: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme';
  goal: 'lose' | 'maintain' | 'gain';
  targetCalories: number;
  targetProtein: number; // grams
  targetCarbs: number; // grams
  targetFat: number; // grams
}
