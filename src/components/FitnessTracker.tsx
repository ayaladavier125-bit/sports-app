import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Flame, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import { WorkoutLog } from '../types';
import { WORKOUT_CATEGORIES } from '../constants';

interface FitnessTrackerProps {
  workouts: WorkoutLog[];
  onAddWorkout: (workout: Omit<WorkoutLog, 'id' | 'timestamp'>) => void;
  onRemoveWorkout: (id: string) => void;
}

export const FitnessTracker: React.FC<FitnessTrackerProps> = ({
  workouts,
  onAddWorkout,
  onRemoveWorkout
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(WORKOUT_CATEGORIES[1]); // Default to strength
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Daily fitness checks lists
  const [dailyChecklist, setDailyChecklist] = useState([
    { id: 'c1', label: '10,000 步数挑战', done: false, unit: '步' },
    { id: 'c2', label: '开合跳 50 次', done: false, unit: '个' },
    { id: 'c3', label: '平板支撑 2 分钟', done: false, unit: '秒' },
    { id: 'c4', label: '拉伸放松筋骨', done: false, unit: '分钟' },
  ]);

  // Calculations
  const totalDuration = workouts.reduce((sum, item) => sum + item.duration, 0);
  const totalCalories = workouts.reduce((sum, item) => sum + item.caloriesBurned, 0);
  
  // Suggested calories based on category and minutes
  const calculatedCalories = Math.round(duration * selectedCategory.caloriesPerMin);

  // Toggle exercise tasks
  const handleToggleCheck = (id: string) => {
    setDailyChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWorkout({
      name: workoutName.trim() || `${selectedCategory.name}训练`,
      type: selectedCategory.name,
      duration: duration,
      caloriesBurned: calculatedCalories,
      intensity: intensity
    });
    // Reset state & Close
    setWorkoutName('');
    setDuration(30);
    setIntensity('medium');
    setShowLogModal(false);
  };

  // Streak counter (dummy check for active logs)
  const completedTaskCount = dailyChecklist.filter(c => c.done).length;
  const currentStreak = workouts.length > 0 ? 3 : 0; // standard mock streak index to reward user

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header with add action button */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            健身打卡
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
            今日累计训练 {totalDuration} 分钟
          </p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="p-3.5 bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white rounded-2xl flex items-center gap-1.5 font-bold text-sm shadow-md shadow-red-500/20"
        >
          <Plus size={16} /> 记一次训练
        </button>
      </div>

      {/* 2. Fitness Stats Card row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 rounded-3xl">
          <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400">
            <Flame size={18} />
            <span className="text-sm font-bold font-sans">累计燃脂</span>
          </div>
          <div className="text-3xl font-black font-mono text-zinc-900 dark:text-zinc-50 leading-none">
            {totalCalories} <span className="text-sm font-sans text-zinc-400 font-medium ml-0.5">kcal</span>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-4 rounded-3xl">
          <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
            <Clock size={18} />
            <span className="text-sm font-bold font-sans">活动时间</span>
          </div>
          <div className="text-3xl font-black font-mono text-zinc-900 dark:text-zinc-50 leading-none">
            {totalDuration} <span className="text-sm font-sans text-zinc-400 font-medium ml-0.5">min</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive iOS log sheet drawer */}
      <AnimatePresence>
        {showLogModal && (
          <>
            {/* Modal Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogModal(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            {/* iOS Bottom Sheet modal */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-white dark:bg-zinc-900 rounded-t-[32px] p-6 pb-8 z-50 border-t border-zinc-100 dark:border-zinc-800 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* iOS Grab bar indicator */}
              <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-5" />

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">添加运动打卡记录</h3>
                <button 
                  onClick={() => setShowLogModal(false)}
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-600"
                >
                  关闭
                </button>
              </div>

              <form onSubmit={handleCreateWorkout} className="space-y-5">
                {/* Exercise Categories Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">选择运动项目</label>
                  <div className="grid grid-cols-4 gap-2">
                    {WORKOUT_CATEGORIES.map((cat, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                          selectedCategory.name === cat.name
                            ? 'bg-red-500 text-white shadow-xs'
                            : 'bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:text-zinc-300'
                        }`}
                      >
                        {/* Dynamic category colors can be styled directly */}
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                          style={{ backgroundColor: selectedCategory.name === cat.name ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.04)' }}
                        >
                          <Award size={14} />
                        </div>
                        <span className="text-[10px] font-bold leading-none">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Workout Name input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">自定义名称</label>
                  <input
                    type="text"
                    placeholder={`例如: ${selectedCategory.name}`}
                    value={workoutName}
                    onChange={e => setWorkoutName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl p-3.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-red-500 text-zinc-800 dark:text-zinc-100 font-sans"
                  />
                </div>

                {/* Duration select slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">训练时长 (分钟)</label>
                    <span className="text-sm font-black text-rose-500 font-mono">{duration} min</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                {/* Intensity select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">运动强度</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setIntensity(level)}
                        className={`p-3 rounded-2xl text-xs font-bold border transition-colors ${
                          intensity === level 
                            ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/40' 
                            : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {level === 'easy' ? '低强 (燃脂)' : level === 'medium' ? '中强 (有氧)' : '高强 (心肺)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Calculated Calories Estimate Notification with helpful Info */}
                <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl flex gap-3 items-center">
                  <Info size={16} className="text-neutral-400 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[11px] font-semibold text-zinc-500 block leading-none mb-1">系统预估消耗</span>
                    <span className="text-xs text-zinc-500">
                      根据项目常态代谢值算得：
                      <span className="font-bold font-mono text-rose-500 text-sm ml-1">
                        {calculatedCalories} kcal
                      </span>
                    </span>
                  </div>
                </div>

                {/* Save Submit Button */}
                <button
                  type="submit"
                  className="w-full p-4 bg-red-500 hover:bg-red-600 transition-colors text-white font-black text-sm rounded-2xl shadow-lg shadow-red-500/20 active:scale-98"
                >
                  添加至今日健身打卡
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Active Check-in streak indicator */}
      <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 dark:bg-red-950/30 text-rose-500 rounded-2xl">
            <Activity size={18} />
          </div>
          <div>
            <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-200">健康活力打卡挑战</h4>
            <p className="text-xs text-zinc-500 mt-0.5">已连续打卡 <span className="text-rose-500 font-bold font-mono text-sm">{currentStreak}</span> 天，超越了 88% 的健友</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full border border-rose-100 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/10 flex items-center justify-center">
          <Award size={18} className="text-rose-500" />
        </div>
      </div>

      {/* 5. Daily Task Challenge checkboxes */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 space-y-4">
        <div className="flex justify-between items-center bg-zinc-50/20 dark:bg-transparent">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-500" /> 今日微行动大卡 check-in
          </h3>
          <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 px-2.5 py-1 rounded-full border border-zinc-100 dark:border-zinc-800">
            {completedTaskCount} / 4
          </span>
        </div>

        <div className="space-y-2 font-sans">
          {dailyChecklist.map((task) => (
            <div 
              key={task.id}
              onClick={() => handleToggleCheck(task.id)}
              className="flex items-center gap-3 p-3.5 bg-zinc-50/60 dark:bg-zinc-800/20 rounded-2xl hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer select-none"
            >
              <div className="shrink-0">
                {task.done ? (
                  <CheckCircle2 size={20} className="text-emerald-500 fill-emerald-500/10" />
                ) : (
                  <div className="w-5.5 h-5.5 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
                )}
              </div>
              <span className={`text-sm font-semibold flex-1 ${task.done ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {task.label}
              </span>
              <span className="text-xs font-medium text-zinc-400">{task.unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Gym Log list history */}
      <div className="space-y-3">
        <h3 className="text-sm uppercase font-semibold tracking-wider text-zinc-400 px-1">打卡轨迹健身 History</h3>
        
        {workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map((log) => (
              <div 
                key={log.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-100/80 dark:border-zinc-800 p-4 rounded-3xl flex justify-between items-center group shadow-2xs hover:border-zinc-200 dark:hover:border-zinc-700/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-rose-500">
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{log.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5 font-medium uppercase">
                      <span>{log.type}</span>
                      <span>•</span>
                      <span>{log.duration} min</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full border leading-none text-[9.5px] ${
                        log.intensity === 'hard' 
                          ? 'border-rose-100 text-rose-500 bg-rose-50/50 dark:border-rose-950/20 dark:bg-rose-950/10' 
                          : log.intensity === 'medium'
                          ? 'border-amber-100 text-amber-500 bg-amber-50/50 dark:border-amber-950/20 dark:bg-amber-950/10'
                          : 'border-emerald-100 text-emerald-500 bg-emerald-50/50 dark:border-emerald-950/20 dark:bg-emerald-950/10'
                      }`}>
                        {log.intensity === 'hard' ? '高强' : log.intensity === 'medium' ? '中强' : '低强'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-zinc-800 dark:text-zinc-200">-{log.caloriesBurned}</div>
                    <div className="text-xs text-zinc-400 font-mono">kcal</div>
                  </div>
                  <button
                    onClick={() => onRemoveWorkout(log.id)}
                    className="p-2 text-zinc-300 hover:text-red-500 active:scale-95 transition-all"
                    title="删除"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-zinc-400 bg-zinc-50 dark:bg-zinc-850/20 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-850">
            今天还没有运动打卡。开始你的第一次锻炼吧！
          </div>
        )}
      </div>
    </div>
  );
};
