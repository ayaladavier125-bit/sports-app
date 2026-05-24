import { FoodPreset, UserProfile, WorkoutLog, FoodLog, WeightLog } from './types';

export const FOOD_PRESETS: FoodPreset[] = [
  { name: '鸡胸肉 (水煮/香煎)', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, category: 'proteins' },
  { name: '全蛋 (水煮)', caloriesPer100g: 143, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 9.5, category: 'proteins' },
  { name: '牛排 (瘦肉)', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15, category: 'proteins' },
  { name: '三文鱼', caloriesPer100g: 206, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 12, category: 'proteins' },
  { name: '白米饭 (熟)', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, category: 'carbs' },
  { name: '红薯 (蒸)', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, category: 'carbs' },
  { name: '燕麦片 (生)', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9, category: 'carbs' },
  { name: '全麦面包', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4, category: 'carbs' },
  { name: '牛油果', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 14.7, category: 'fats' },
  { name: '混合坚果', caloriesPer100g: 607, proteinPer100g: 20, carbsPer100g: 21, fatPer100g: 54, category: 'fats' },
  { name: '苹果', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, category: 'fruits' },
  { name: '香蕉', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, category: 'fruits' },
  { name: '希腊酸奶 (无糖)', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, category: 'dairy' },
  { name: '全脂牛奶', caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.2, category: 'dairy' },
  { name: '西兰花 (水煮)', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, category: 'veg' },
  { name: '乳清蛋白粉', caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 6, fatPer100g: 5, category: 'supplements' }
];

export const WORKOUT_CATEGORIES = [
  { name: '跑步', icon: 'Flame', color: '#FF3B30', caloriesPerMin: 10 },
  { name: '力量训练', icon: 'Dumbbell', color: '#FF9500', caloriesPerMin: 6 },
  { name: '骑行', icon: 'Bike', color: '#34C759', caloriesPerMin: 8 },
  { name: '游泳', icon: 'Waves', color: '#5AC8FA', caloriesPerMin: 9 },
  { name: '瑜伽/拉伸', icon: 'Sparkles', color: '#AF52DE', caloriesPerMin: 3.5 },
  { name: 'HIIT/有氧操', icon: 'Activity', color: '#FF2D55', caloriesPerMin: 11 },
  { name: '羽毛球/网球', icon: 'Target', color: '#FFCC00', caloriesPerMin: 7 },
  { name: '健走', icon: 'Footprints', color: '#4CD964', caloriesPerMin: 4.5 }
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'iOS 健行者',
  gender: 'male',
  age: 26,
  height: 178,
  weight: 73.5,
  weightGoal: 70,
  activityLevel: 'moderate',
  goal: 'lose',
  targetCalories: 2100,
  targetProtein: 135,
  targetCarbs: 230,
  targetFat: 60
};

// Start logs relative to today to populate dashboard elegantly
const todayMidnight = new Date();
todayMidnight.setHours(0, 0, 0, 0);
const msInDay = 86400000;

export const INITIAL_WORKOUTS: WorkoutLog[] = [
  {
    id: 'w1',
    name: '晨跑 5 公里',
    type: '跑步',
    duration: 35,
    caloriesBurned: 350,
    intensity: 'medium',
    timestamp: todayMidnight.getTime() + 7.5 * 3600 * 1000 // 7:30 AM today
  },
  {
    id: 'w2',
    name: '器械力量锤炼',
    type: '力量训练',
    duration: 50,
    caloriesBurned: 300,
    intensity: 'hard',
    timestamp: todayMidnight.getTime() - msInDay + 18 * 3600 * 1000 // 6:00 PM yesterday
  }
];

export const INITIAL_FOODS: FoodLog[] = [
  {
    id: 'f1',
    name: '燕麦片 (生)',
    mealType: 'breakfast',
    portionGrams: 60,
    calories: Math.round((60 * 389) / 100),
    protein: Math.round((60 * 16.9) / 100),
    carbs: Math.round((60 * 66) / 100),
    fat: Math.round((60 * 6.9) / 100),
    timestamp: todayMidnight.getTime() + 8 * 3600 * 1000 // 8:00 AM today
  },
  {
    id: 'f2',
    name: '全蛋 (水煮) - 2个',
    mealType: 'breakfast',
    portionGrams: 100,
    calories: 143,
    protein: 13,
    carbs: 1.1,
    fat: 9.5,
    timestamp: todayMidnight.getTime() + 8 * 3600 * 1000
  },
  {
    id: 'f3',
    name: '鸡胸肉 (水煮/香煎)',
    mealType: 'lunch',
    portionGrams: 150,
    calories: Math.round((150 * 165) / 100),
    protein: Math.round((150 * 31) / 100),
    carbs: 0,
    fat: Math.round((150 * 3.6) / 100),
    timestamp: todayMidnight.getTime() + 12.5 * 3600 * 1000 // 12:30 PM today
  },
  {
    id: 'f4',
    name: '白米饭 (熟)',
    mealType: 'lunch',
    portionGrams: 200,
    calories: Math.round((200 * 130) / 100),
    protein: Math.round((200 * 2.7) / 100),
    carbs: Math.round((200 * 28) / 100),
    fat: Math.round((200 * 0.3) / 100),
    timestamp: todayMidnight.getTime() + 12.5 * 3600 * 1000
  }
];

export const INITIAL_WEIGHT_LOGS: WeightLog[] = [
  { id: 'we1', value: 75.2, timestamp: todayMidnight.getTime() - 6 * msInDay },
  { id: 'we2', value: 74.8, timestamp: todayMidnight.getTime() - 5 * msInDay },
  { id: 'we3', value: 74.9, timestamp: todayMidnight.getTime() - 4 * msInDay },
  { id: 'we4', value: 74.3, timestamp: todayMidnight.getTime() - 3 * msInDay },
  { id: 'we5', value: 74.0, timestamp: todayMidnight.getTime() - 2 * msInDay },
  { id: 'we6', value: 73.8, timestamp: todayMidnight.getTime() - 1 * msInDay },
  { id: 'we7', value: 73.5, timestamp: todayMidnight.getTime() }
];

export const INITIAL_WATER = 1250; // ml
