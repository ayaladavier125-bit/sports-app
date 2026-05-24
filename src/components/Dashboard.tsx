import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Droplet, 
  Scale, 
  Utensils, 
  Plus, 
  Minus, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { WorkoutLog, FoodLog, WeightLog, UserProfile } from '../types';
import { HealthRings } from './HealthRings';

interface DashboardProps {
  workouts: WorkoutLog[];
  foods: FoodLog[];
  weightLogs: WeightLog[];
  waterVolume: number;
  profile: UserProfile;
  onAddWater: (ml: number) => void;
  onClearWater: () => void;
  onAddWeight: (weight: number) => void;
  onRemoveWeight: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  workouts,
  foods,
  weightLogs,
  waterVolume,
  profile,
  onAddWater,
  onClearWater,
  onAddWeight,
  onRemoveWeight
}) => {
  const [newWeight, setNewWeight] = useState<string>('');
  const [showWeightInput, setShowWeightInput] = useState(false);

  // 1. Calories and Nutrition Calculations
  const targetCalories = profile.targetCalories;
  
  // Food calories consumed today
  const caloriesConsumed = foods.reduce((sum, item) => sum + item.calories, 0);
  
  // Workouts calories burned today
  const caloriesBurned = workouts.reduce((sum, item) => sum + item.caloriesBurned, 0);
  
  // Net calories = Food Consumed - Active Burned
  const netCalories = caloriesConsumed - caloriesBurned;
  const remainingCalories = targetCalories - netCalories;

  // Macros totals
  const totalProtein = foods.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = foods.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = foods.reduce((sum, item) => sum + item.fat, 0);

  // Health Rings Calculations (percentage representation)
  const calorieRingProgress = targetCalories > 0 ? caloriesConsumed / targetCalories : 0;
  // Exercise ring based on active burn goal e.g. 500 kcal target
  const activeCaloriesGoal = 400; // default standard active health goal
  const exerciseRingProgress = caloriesBurned / activeCaloriesGoal;
  // Water ring progress based on 2000ml goal
  const waterGoal = 2000;
  const waterRingProgress = waterVolume / waterGoal;

  // 2. Weight statistics
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].value : profile.weight;
  const weightChange = weightLogs.length > 1 
    ? Number((currentWeight - weightLogs[0].value).toFixed(1)) 
    : 0;

  // Weight Trend Graph data preparation
  const renderWeightGraph = () => {
    if (weightLogs.length === 0) return null;

    const width = 340;
    const height = 120;
    const padding = 20;

    const weights = weightLogs.map(w => w.value);
    const minW = Math.min(...weights, profile.weightGoal) - 1;
    const maxW = Math.max(...weights, profile.weightGoal) + 1;
    const wRange = maxW - minW || 1;

    // Map weight list into SVG coordinates
    const points = weightLogs.map((log, index) => {
      const x = padding + (index * (width - 2 * padding)) / Math.max(1, weightLogs.length - 1);
      const y = height - padding - ((log.value - minW) * (height - 2 * padding)) / wRange;
      return { x, y, value: log.value, date: new Date(log.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) };
    });

    // Draw string path
    let pathD = '';
    points.forEach((p, idx) => {
      if (idx === 0) pathD = `M ${p.x} ${p.y}`;
      else pathD += ` L ${p.x} ${p.y}`;
    });

    // Underneath fill gradient path
    const fillD = pathD ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` : '';

    // Draw reference line for Goal Weight
    const goalY = height - padding - ((profile.weightGoal - minW) * (height - 2 * padding)) / wRange;

    return (
      <div className="relative w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Grids and Goal Line */}
          <line 
            x1={padding} 
            y1={goalY} 
            x2={width - padding} 
            y2={goalY} 
            stroke="#10B981" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
            opacity="0.6"
          />
          <text 
            x={width - padding - 80} 
            y={goalY - 4} 
            fill="#10B981" 
            className="text-[9px] font-medium font-sans"
          >
            目标体重: {profile.weightGoal} kg
          </text>

          {/* Under fill gradient */}
          {fillD && (
            <path
              d={fillD}
              fill="url(#weightGradient)"
              opacity="0.1"
            />
          )}

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#007AFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#ffffff"
                stroke="#007AFF"
                strokeWidth="2.5"
                className="cursor-pointer"
              />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                className="text-[9px] font-bold font-mono fill-zinc-700 dark:fill-zinc-300"
              >
                {p.value}
              </text>
              <text
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                className="text-[8px] font-mono fill-zinc-400 dark:fill-zinc-500"
              >
                {p.date}
              </text>
            </g>
          ))}

          {/* Gradients */}
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#007AFF" />
              <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (!isNaN(val) && val > 30 && val < 200) {
      onAddWeight(val);
      setNewWeight('');
      setShowWeightInput(false);
    }
  };

  // Get active health tips based on current nutrition and workouts
  const getMotivationalTips = () => {
    const tips = [];
    if (waterVolume < 1000) {
      tips.push({
        title: '补充水分',
        desc: '你现在的饮水量偏低。细胞代謝和肌肉恢复需要充足水分，多喝一杯水吧！',
        color: 'text-[#007AFF]',
        bg: 'bg-blue-50/50 dark:bg-blue-950/20'
      });
    } else {
      tips.push({
        title: '补水达成度棒',
        desc: '饮水过半！充足的水分有助肠胃蠕动和热量代谢，继续保持。',
        color: 'text-sky-500',
        bg: 'bg-sky-50/50 dark:bg-sky-950/20'
      });
    }

    if (totalProtein < profile.targetProtein * 0.5) {
      tips.push({
        title: '蛋白质加油站',
        desc: '为了增肌和提高饱腹感，建议在下一餐适量增加鸡胸、牛肉、鱼虾或鸡蛋的摄入。',
        color: 'text-amber-500',
        bg: 'bg-amber-50/50 dark:bg-amber-950/20'
      });
    }

    if (caloriesBurned < 200) {
      tips.push({
        title: '注入运动能量',
        desc: '在椅子上坐久了吗？站起来做3分钟扩胸拉伸或深蹲，活动全身关节。',
        color: 'text-rose-500',
        bg: 'bg-rose-50/50 dark:bg-rose-950/20'
      });
    } else {
      tips.push({
        title: '燃脂效率极佳',
        desc: '今日运动已消耗 ' + caloriesBurned + ' 大卡！高效率新陈代谢已开启。',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50/50 dark:bg-emerald-950/20'
      });
    }

    return tips;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header with motivational greeting */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            健身与膳食
          </h1>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900/40">
          <CheckCircle2 size={13} />
          <span>iOS 原生轻量化</span>
        </div>
      </div>

      {/* 2. Concentric Apple Activity Style Rings */}
      <HealthRings 
        calorieProgress={calorieRingProgress}
        exerciseProgress={exerciseRingProgress}
        waterProgress={waterRingProgress}
        calorieLabel="膳食摄入"
        exerciseLabel="消耗目标"
        waterLabel="饮水进度"
      />

      {/* 3. Calorie Balance Sheet Dashboard */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-25 pointer-events-none" />

        <div className="relative">
          <h3 className="text-xs uppercase font-semibold tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
            <Flame size={14} className="text-rose-500" /> 卡路里平衡收支
          </h3>

          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Left large remaining section */}
            <div>
              <div className="text-4xl font-black font-mono tracking-tight text-zinc-50 leading-none">
                {remainingCalories >= 0 ? remainingCalories : 0}
              </div>
              <div className="text-[11px] font-medium text-zinc-400 mt-1.5">
                {remainingCalories >= 0 ? '剩余可摄入大卡' : '超出推荐上限'}
              </div>
            </div>

            {/* Right formula calculations */}
            <div className="space-y-2 border-l border-zinc-800 pl-4 font-mono text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-sans">目标预算:</span>
                <span className="font-bold">{targetCalories} kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-sans flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#FF3B30]" /> 已摄入:
                </span>
                <span className="font-semibold text-rose-400">+{caloriesConsumed} kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-sans flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#34C759]" /> 运动消耗:
                </span>
                <span className="font-semibold text-emerald-400">-{caloriesBurned} kcal</span>
              </div>
              <div className="h-[1px] bg-zinc-800 my-1" />
              <div className="flex justify-between font-sans font-bold">
                <span className="text-zinc-100">当前净摄入:</span>
                <span className={netCalories > targetCalories ? 'text-amber-400' : 'text-zinc-100'}>
                  {netCalories} kcal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Three Macro Nutrients Sliders */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">今日核心营养素比例</h3>
        
        <div className="space-y-3 font-sans">
          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-zinc-700 dark:text-zinc-300">蛋白质 (增肌修护)</span>
              <span className="font-mono text-zinc-500 dark:text-zinc-400">
                {totalProtein}g / <span className="text-zinc-400">{profile.targetProtein}g</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalProtein / profile.targetProtein) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-zinc-700 dark:text-zinc-300">碳水化合物 (运动供能)</span>
              <span className="font-mono text-zinc-500 dark:text-zinc-400">
                {totalCarbs}g / <span className="text-zinc-400">{profile.targetCarbs}g</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalCarbs / profile.targetCarbs) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-zinc-700 dark:text-zinc-300">脂肪 (维持荷尔蒙)</span>
              <span className="font-mono text-zinc-500 dark:text-zinc-400">
                {totalFat}g / <span className="text-zinc-400">{profile.targetFat}g</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalFat / profile.targetFat) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Liquid Hydro Water Tracker Card */}
      <div className="bg-sky-50/50 dark:bg-sky-950/15 border border-sky-100/60 dark:border-sky-900/30 rounded-3xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-2xl text-blue-600 dark:text-sky-400">
              <Droplet size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-sky-950 dark:text-sky-300">智能积木补水杯</h4>
              <p className="text-[11px] text-sky-700/80 dark:text-sky-400/80">每日推荐摄入 2,000 毫升</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black font-mono text-blue-600 dark:text-sky-400">{waterVolume}</span>
            <span className="text-xs text-zinc-400 font-mono ml-0.5">/2000 ml</span>
          </div>
        </div>

        {/* Cup visualizer with animated height */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-28 border-[3px] border-sky-200/80 dark:border-sky-800/60 rounded-b-2xl rounded-t-lg relative overflow-hidden bg-white/60 dark:bg-zinc-950/40 flex flex-col justify-end">
            <motion.div 
              className="w-full bg-sky-400/80 dark:bg-sky-500/80 duration-500 rounded-b-lg relative"
              animate={{ height: `${Math.min(100, (waterVolume / 2000) * 100)}%` }}
              style={{ minHeight: waterVolume > 0 ? '4%' : '0' }}
            >
              {/* Ripple reflection overlay */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-sky-300/40 opacity-80" />
            </motion.div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2">
            <button 
              onClick={() => onAddWater(250)}
              className="py-2.5 px-3 bg-white dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-2xl text-xs font-bold text-blue-600 dark:text-sky-400 active:scale-95 transition-transform flex items-center justify-center gap-1 shadow-2xs"
            >
              <Plus size={13} /> 250 ml
            </button>
            <button 
              onClick={() => onAddWater(500)}
              className="py-2.5 px-3 bg-white dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-2xl text-xs font-bold text-blue-600 dark:text-sky-400 active:scale-95 transition-transform flex items-center justify-center gap-1 shadow-2xs"
            >
              <Plus size={13} /> 500 ml
            </button>
            <button 
              onClick={onClearWater}
              className="col-span-2 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 hover:text-rose-500 dark:text-zinc-500 transition-colors flex items-center justify-center gap-1"
            >
              <RefreshCw size={9} /> 重置今日饮水
            </button>
          </div>
        </div>
      </div>

      {/* 6. Weight Log & Interactive Trend Graph */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Scale size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">体重监测曲线</h4>
              <p className="text-[11px] text-zinc-400 font-medium">当前 {currentWeight} kg</p>
            </div>
          </div>

          <button
            onClick={() => setShowWeightInput(!showWeightInput)}
            className="p-1 px-3 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 rounded-full font-bold text-[11px] hover:bg-zinc-100 transition-colors"
          >
            {showWeightInput ? '取消' : '记体重'}
          </button>
        </div>

        {/* Input slide drawer */}
        <AnimatePresence>
          {showWeightInput && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleWeightSubmit}
              className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl flex items-center gap-3 overflow-hidden border border-zinc-100 dark:border-zinc-800"
            >
              <input 
                type="number" 
                step="0.1"
                placeholder="例如: 72.8"
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                autoFocus
                className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-zinc-400 font-bold">kg</span>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl active:scale-95 transition-transform"
              >
                保存
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {weightLogs.length > 0 ? (
          <div className="pt-2">
            {renderWeightGraph()}
            <div className="mt-4 flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
              <span>区间内重力浮动</span>
              <span className="flex items-center gap-1 font-bold font-mono">
                {weightChange > 0 ? (
                  <>
                    <TrendingUp size={14} className="text-amber-500" />
                    <span className="text-amber-500">+{weightChange} kg</span>
                  </>
                ) : weightChange < 0 ? (
                  <>
                    <TrendingDown size={14} className="text-emerald-500" />
                    <span className="text-emerald-500">{weightChange} kg</span>
                  </>
                ) : (
                  <span className="text-zinc-400">持平</span>
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-zinc-400">暂无体重记录，快去记录一个吧！</div>
        )}
      </div>

      {/* 7. Beautiful health recommendation prompts */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase font-semibold tracking-wider text-zinc-400 px-1">智能健康向导 Recommendation</h4>
        
        <div className="grid gap-3">
          {getMotivationalTips().map((tip, idx) => (
            <div key={idx} className={`p-4 rounded-2xl ${tip.bg} border border-transparent flex items-start gap-3`}>
              <Sparkles className={`shrink-0 mt-0.5 ${tip.color}`} size={16} />
              <div>
                <h5 className={`text-xs font-bold leading-none mb-1 text-zinc-800 dark:text-zinc-200`}>
                  {tip.title}
                </h5>
                <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {tip.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
