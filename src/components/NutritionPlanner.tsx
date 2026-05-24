import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Search, 
  Plus, 
  Trash2, 
  Calculator, 
  PlusCircle, 
  Sparkles, 
  Info,
  ChevronRight,
  ChevronDown,
  Apple,
  Dumbbell,
  Target
} from 'lucide-react';
import { FoodLog, FoodPreset, UserProfile } from '../types';
import { FOOD_PRESETS } from '../constants';

interface NutritionPlannerProps {
  foods: FoodLog[];
  profile: UserProfile;
  onAddFood: (food: Omit<FoodLog, 'id' | 'timestamp'>) => void;
  onRemoveFood: (id: string) => void;
  onUpdateTargets: (calories: number, protein: number, carbs: number, fat: number) => void;
  onUpdateProfilePartial: (updated: Partial<UserProfile>) => void;
}

export const NutritionPlanner: React.FC<NutritionPlannerProps> = ({
  foods,
  profile,
  onAddFood,
  onRemoveFood,
  onUpdateTargets,
  onUpdateProfilePartial
}) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  
  // A. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [selectedPreset, setSelectedPreset] = useState<FoodPreset | null>(null);
  const [portionGrams, setPortionGrams] = useState<number>(100);

  // Custom ingredient states
  const [useCustomFood, setUseCustomFood] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCals, setCustomCals] = useState('');
  const [customProt, setCustomProt] = useState('');
  const [customCarb, setCustomCarb] = useState('');
  const [customFat, setCustomFat] = useState('');

  // B. TDEE Macro Calculator State
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender || 'male');
  const [age, setAge] = useState<number>(profile.age || 26);
  const [height, setHeight] = useState<number>(profile.height || 178);
  const [weight, setWeight] = useState<number>(profile.weight || 73.5);
  const [activity, setActivity] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'extreme'>(profile.activityLevel || 'moderate');
  const [fitnessGoal, setFitnessGoal] = useState<'lose' | 'maintain' | 'gain'>(profile.goal || 'lose');

  // Filter food presets
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return FOOD_PRESETS;
    return FOOD_PRESETS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Selected preset dynamic calculations
  const presetCalsComputed = selectedPreset 
    ? Math.round((portionGrams * selectedPreset.caloriesPer100g) / 100) 
    : 0;
  const presetProtComputed = selectedPreset 
    ? Number(((portionGrams * selectedPreset.proteinPer100g) / 100).toFixed(1)) 
    : 0;
  const presetCarbComputed = selectedPreset 
    ? Number(((portionGrams * selectedPreset.carbsPer100g) / 100).toFixed(1)) 
    : 0;
  const presetFatComputed = selectedPreset 
    ? Number(((portionGrams * selectedPreset.fatPer100g) / 100).toFixed(1)) 
    : 0;

  // Add food submission logic
  const handleAddFoodFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useCustomFood) {
      if (!customName.trim()) return;
      onAddFood({
        name: customName,
        mealType: selectedMealType,
        portionGrams: 100, // Standard batch
        calories: parseInt(customCals) || 0,
        protein: parseFloat(customProt) || 0,
        carbs: parseFloat(customCarb) || 0,
        fat: parseFloat(customFat) || 0
      });
      // Reset custom form
      setCustomName('');
      setCustomCals('');
      setCustomProt('');
      setCustomCarb('');
      setCustomFat('');
      setUseCustomFood(false);
    } else {
      if (!selectedPreset) return;
      onAddFood({
        name: selectedPreset.name,
        mealType: selectedMealType,
        portionGrams: portionGrams,
        calories: presetCalsComputed,
        protein: presetProtComputed,
        carbs: presetCarbComputed,
        fat: presetFatComputed
      });
    }
    setShowAddFoodModal(false);
  };

  // Meal types definition for splitting displays
  const mealSections = [
    { type: 'breakfast' as const, name: '早餐 Breakfast', icon: '🍳', color: 'text-amber-500' },
    { type: 'lunch' as const, name: '午餐 Lunch', icon: '🍱', color: 'text-emerald-500' },
    { type: 'dinner' as const, name: '晚餐 Dinner', icon: '🍲', color: 'text-indigo-500' },
    { type: 'snack' as const, name: '加餐 Snacks/Other', icon: '🍌', color: 'text-pink-500' },
  ];

  // Calculate macronutrient and calories by meal types
  const getSubtotalsForMeal = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const mealFoods = foods.filter(f => f.mealType === type);
    return {
      calories: mealFoods.reduce((sum, item) => sum + item.calories, 0),
      protein: mealFoods.reduce((sum, item) => sum + item.protein, 0),
      carbs: mealFoods.reduce((sum, item) => sum + item.carbs, 0),
      fat: mealFoods.reduce((sum, item) => sum + item.fat, 0),
      items: mealFoods
    };
  };

  // C. Calculate TDEE and Macro recommendations dynamically
  const calculateMacrosRecommended = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Harris-Benedict Formula BMR estimates
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // 2. Activity factor multiplies
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extreme: 1.9
    };
    const tdee = Math.round(bmr * multipliers[activity]);

    // 3. Goal calorie adjustment
    let targetCals = tdee;
    if (fitnessGoal === 'lose') {
      targetCals = Math.max(1200, tdee - 450); // deficit
    } else if (fitnessGoal === 'gain') {
      targetCals = tdee + 300; // surplus
    }

    // 4. Macro Ratio estimates based on calorie target
    // Protein: 2.0g per kg for gain/lose, 1.5g for maintenance
    const proteinFactor = fitnessGoal === 'maintain' ? 1.6 : 2.0;
    const proteinTarget = Math.round(weight * proteinFactor);
    const proteinCalories = proteinTarget * 4;

    // Fat: 25% of total calories
    const fatCalories = targetCals * 0.25;
    const fatTarget = Math.round(fatCalories / 9);

    // Carbs: Remaining Calories
    const carbCalories = targetCals - proteinCalories - (fatTarget * 9);
    const carbTarget = Math.round(carbCalories / 4);

    // Apply targets back to the main App state and Profile
    onUpdateTargets(targetCals, proteinTarget, carbTarget, fatTarget);
    
    // Save info in Profile
    onUpdateProfilePartial({
      gender, age, height, weight, activityLevel: activity, goal: fitnessGoal
    });

    setShowCalculator(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Top Section - Custom iOS Title & Action row */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            膳食能量
          </h1>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            今日已记录 {foods.length} 个餐食项目
          </p>
        </div>
        <div className="flex gap-2">
          {/* TDEE Calculator toggle */}
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="p-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 transition-all text-zinc-800 dark:text-zinc-200 rounded-2xl flex items-center justify-center gap-1 font-bold text-xs"
          >
            <Calculator size={15} /> 智能宏计算
          </button>
          
          <button
            onClick={() => {
              setSelectedPreset(FOOD_PRESETS[0]);
              setShowAddFoodModal(true);
            }}
            className="p-3 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white rounded-2xl flex items-center gap-1 font-bold text-xs shadow-md shadow-blue-500/25"
          >
            <Plus size={15} /> 记饮食
          </button>
        </div>
      </div>

      {/* 2. Interactive TDEE Core Macro Calculator Slider Block */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 p-5 rounded-3xl space-y-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-blue-600">
              <Calculator size={18} />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">科学卡路里与宏指令配比设置</h3>
            </div>

            <form onSubmit={calculateMacrosRecommended} className="space-y-4 font-sans max-w-lg">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Gender select */}
                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold block">性别</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => setGender('male')}
                      className={`py-1.5 rounded-xl border text-center font-bold font-sans ${gender === 'male' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                    >
                      男
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setGender('female')}
                      className={`py-1.5 rounded-xl border text-center font-bold font-sans ${gender === 'female' ? 'bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-950/20' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                    >
                      女
                    </button>
                  </div>
                </div>

                {/* Fitness target goal */}
                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold block">塑形健康目标</span>
                  <select 
                    value={fitnessGoal} 
                    onChange={e => setFitnessGoal(e.target.value as any)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-2 py-1.5 rounded-xl text-zinc-750 focus:outline-hidden"
                  >
                    <option value="lose">减脂瘦身 (缺口)</option>
                    <option value="maintain">维持体重</option>
                    <option value="gain">增肌塑形 (盈余)</option>
                  </select>
                </div>

                {/* Age Input */}
                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold block">年龄 (周岁)</span>
                  <input 
                    type="number" 
                    value={age} 
                    onChange={e => setAge(parseInt(e.target.value) || 20)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-3 py-1.5 rounded-xl text-zinc-750 focus:outline-hidden"
                  />
                </div>

                {/* Height cm */}
                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold block">身高 (cm)</span>
                  <input 
                    type="number" 
                    value={height} 
                    onChange={e => setHeight(parseInt(e.target.value) || 170)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-3 py-1.5 rounded-xl text-zinc-750 focus:outline-hidden"
                  />
                </div>

                {/* Weight kg */}
                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold block">当前体重 (kg)</span>
                  <input 
                    type="number" 
                    step="0.1"
                    value={weight} 
                    onChange={e => setWeight(parseFloat(e.target.value) || 70)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-3 py-1.5 rounded-xl text-zinc-750 focus:outline-hidden"
                  />
                </div>

                {/* Activity level */}
                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold block">日常活动量级别</span>
                  <select 
                    value={activity} 
                    onChange={e => setActivity(e.target.value as any)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-2 py-1.5 rounded-xl text-zinc-750 focus:outline-hidden"
                  >
                    <option value="sedentary">极少运动 (久坐)</option>
                    <option value="light">轻度活动 (1-3天/周)</option>
                    <option value="moderate">中度活动 (3-5天/周)</option>
                    <option value="active">活跃健身 (6-7天/周)</option>
                    <option value="extreme">专业重体力/运动员</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/40 dark:border-blue-900/40 p-3 rounded-2xl flex gap-2.5 items-center">
                <Info size={15} className="text-blue-500 shrink-0" />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                  此工具使用 <strong>Mifflin-St Jeor / Harris-Benedict 经典算法</strong>，针对中国人膳食及活动系数推测目标营养素。
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-black text-xs rounded-xl active:scale-98"
              >
                生成我的专属每日健康打卡配額
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Add Dietary Calorie Preset & Custom Food Drawer overlay */}
      <AnimatePresence>
        {showAddFoodModal && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddFoodModal(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-white dark:bg-zinc-900 rounded-t-[32px] p-6 pb-8 z-55 border-t border-zinc-100 dark:border-zinc-800 shadow-2xl max-h-[88vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50">记录今日摄入成分</h3>
                <button 
                  onClick={() => setShowAddFoodModal(false)}
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-600"
                >
                  关闭
                </button>
              </div>

              {/* Meal categorizer switch */}
              <div className="space-y-1 mb-4">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">餐食类型 categorization</label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                  {mealSections.map((sect) => (
                    <button
                      key={sect.type}
                      type="button"
                      onClick={() => setSelectedMealType(sect.type)}
                      className={`py-2 text-[11px] font-bold rounded-xl transition-all text-center flex flex-col items-center justify-center ${
                        selectedMealType === sect.type
                          ? 'bg-white dark:bg-zinc-900 shadow-2xs text-zinc-900 dark:text-white'
                          : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      <span className="text-sm leading-none mb-0.5">{sect.icon}</span>
                      <span>{sect.type === 'breakfast' ? '早餐' : sect.type === 'lunch' ? '午餐' : sect.type === 'dinner' ? '晚餐' : '加餐'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form trigger custom vs presets selector */}
              <div className="flex gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4 text-xs font-bold font-sans">
                <button 
                  type="button" 
                  onClick={() => setUseCustomFood(false)}
                  className={`pb-1 px-1 border-b-2 transition-all ${!useCustomFood ? 'border-blue-600 text-blue-600' : 'border-transparent text-zinc-400'}`}
                >
                  智能食材库 (快捷推荐)
                </button>
                <button 
                  type="button" 
                  onClick={() => setUseCustomFood(true)}
                  className={`pb-1 px-1 border-b-2 transition-all ${useCustomFood ? 'border-blue-600 text-blue-600' : 'border-transparent text-zinc-400'}`}
                >
                  手动创建自定义食材
                </button>
              </div>

              <form onSubmit={handleAddFoodFormSubmit} className="space-y-4">
                {useCustomFood ? (
                  // Custom item form options
                  <div className="space-y-3 font-sans text-xs">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold block">食物名称</label>
                      <input 
                        type="text" 
                        placeholder="例如: 煎饺 / 挂面"
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-100"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-bold">卡路里 (kcal)</label>
                        <input 
                          type="number" 
                          placeholder="例如: 350"
                          value={customCals}
                          onChange={e => setCustomCals(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-100 font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-bold">蛋白质 (g)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          placeholder="例如: 12"
                          value={customProt}
                          onChange={e => setCustomProt(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-100 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-bold">碳水 (g)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          placeholder="例如: 45"
                          value={customCarb}
                          onChange={e => setCustomCarb(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-100 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-bold">脂肪 (g)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          placeholder="例如: 8"
                          value={customFat}
                          onChange={e => setCustomFat(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Standard search + preset calculator
                  <div className="space-y-4 font-sans text-xs">
                    {/* Compact search bar */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3.5 text-zinc-400" size={15} />
                      <input
                        type="search"
                        placeholder="搜索系统食材 (如: 鸡胸肉, 燕麦, 米饭)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                      />
                    </div>

                    {/* Presets flow selection */}
                    <div className="max-h-40 overflow-y-auto border border-zinc-100 dark:border-zinc-800 rounded-2xl p-2.5 bg-zinc-50/50 dark:bg-zinc-950/20 grid grid-cols-2 gap-2">
                      {filteredPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPreset(preset)}
                          className={`p-2.5 text-left rounded-xl transition-all border text-xs font-bold ${
                            selectedPreset?.name === preset.name
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="line-clamp-1">{preset.name}</div>
                          <span className={`${selectedPreset?.name === preset.name ? 'text-blue-100' : 'text-zinc-400'} text-[10px] font-mono font-medium block mt-0.5`}>
                            {preset.caloriesPer100g} kcal/100g
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Weight selector slider */}
                    {selectedPreset && (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-850/40 border border-zinc-100 dark:border-zinc-850 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-zinc-600 dark:text-zinc-300">食用量分量 (克) Portion</span>
                          <span className="text-sm font-black text-blue-600 font-mono">{portionGrams} g</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="800"
                          step="10"
                          value={portionGrams}
                          onChange={(e) => setPortionGrams(parseInt(e.target.value))}
                          className="w-full accent-blue-600"
                        />

                        {/* Calculated info breakdown block */}
                        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-4 gap-1 text-center font-mono">
                          <div>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-tight block">热量</span>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{presetCalsComputed} kcal</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-450 uppercase tracking-tight block">蛋白质</span>
                            <span className="text-xs font-bold text-orange-500">{presetProtComputed}g</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-450 uppercase tracking-tight block">碳水</span>
                            <span className="text-xs font-bold text-amber-500">{presetCarbComputed}g</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-450 uppercase tracking-tight block">脂肪</span>
                            <span className="text-xs font-bold text-emerald-500">{presetFatComputed}g</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!useCustomFood && !selectedPreset}
                  className="w-full p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 disabled:text-zinc-400 hover:disabled:bg-zinc-200 transition-colors text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/20 active:scale-98"
                >
                  添加至今日我的饮食
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Logged meal breakdown split grids */}
      <div className="space-y-4">
        {mealSections.map((sect) => {
          const mealStats = getSubtotalsForMeal(sect.type);
          return (
            <div 
              key={sect.type} 
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl p-5 space-y-3 shadow-2xs"
            >
              {/* Card headers holding subtotals */}
              <div className="flex justify-between items-center text-xs border-b border-zinc-50 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                  <span className="text-base">{sect.icon}</span>
                  <span>{sect.name}</span>
                </div>
                <span className="font-mono font-black text-zinc-800 dark:text-zinc-200">
                  {mealStats.calories} <span className="text-[9px] text-zinc-405 font-medium">kcal</span>
                </span>
              </div>

              {/* Items listing inside meal */}
              {mealStats.items.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {mealStats.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/20 p-3 rounded-2xl group transition-all border border-transparent hover:border-zinc-200/40"
                    >
                      <div>
                        <h4 className="font-bold text-zinc-800 dark:text-zinc-200 leading-none mb-1.5">{item.name}</h4>
                        <div className="flex items-center gap-2 text-[9px] text-zinc-400 font-mono font-medium">
                          <span>{item.portionGrams}g</span>
                          <span>•</span>
                          <span className="text-orange-500">P:{item.protein}g</span>
                          <span>•</span>
                          <span className="text-amber-500">C:{item.carbs}g</span>
                          <span>•</span>
                          <span className="text-emerald-500">F:{item.fat}g</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">
                          {item.calories} <span className="text-[9px] text-zinc-400 font-medium">kcal</span>
                        </span>
                        <button
                          onClick={() => onRemoveFood(item.id)}
                          className="p-1 px-2 text-zinc-300 hover:text-red-500 rounded-md transition-all active:scale-95"
                          title="删除餐食"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-5 text-center text-[11px] text-zinc-400">
                  暂无记录... 点击右上角“记饮食”来添加吧！
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
