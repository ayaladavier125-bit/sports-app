/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import { 
  Heart, 
  Dumbbell, 
  Apple, 
  User, 
  Battery, 
  Wifi, 
  Activity as ActivityIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkoutLog, FoodLog, WeightLog, UserProfile } from './types';
import { 
  DEFAULT_PROFILE, 
  INITIAL_WORKOUTS, 
  INITIAL_FOODS, 
  INITIAL_WEIGHT_LOGS, 
  INITIAL_WATER 
} from './constants';
import { Dashboard } from './components/Dashboard';
import { FitnessTracker } from './components/FitnessTracker';
import { NutritionPlanner } from './components/NutritionPlanner';
import { ProfileScreen } from './components/ProfileScreen';

export default function App() {
  // 1. Core navigation states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'fitness' | 'nutrition' | 'profile'>('dashboard');
  
  // 2. Persistent States (synced with LocalStorage)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fitring_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [workouts, setWorkouts] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('fitring_workouts');
    return saved ? JSON.parse(saved) : INITIAL_WORKOUTS;
  });

  const [foods, setFoods] = useState<FoodLog[]>(() => {
    const saved = localStorage.getItem('fitring_foods');
    return saved ? JSON.parse(saved) : INITIAL_FOODS;
  });

  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => {
    const saved = localStorage.getItem('fitring_weight_logs');
    return saved ? JSON.parse(saved) : INITIAL_WEIGHT_LOGS;
  });

  const [waterVolume, setWaterVolume] = useState<number>(() => {
    const saved = localStorage.getItem('fitring_water');
    return saved ? parseInt(saved) : INITIAL_WATER;
  });

  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('fitring_dark_mode');
    return saved === 'true';
  });

  // 3. Keep mock time running top bar
  const [timeStr, setTimeStr] = useState('10:45');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hrs = now.getHours().toString().padStart(2, '0');
      let mins = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // 4. Persistence Sync Handlers
  useEffect(() => {
    localStorage.setItem('fitring_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('fitring_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('fitring_foods', JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem('fitring_weight_logs', JSON.stringify(weightLogs));
  }, [weightLogs]);

  useEffect(() => {
    localStorage.setItem('fitring_water', waterVolume.toString());
  }, [waterVolume]);

  useEffect(() => {
    localStorage.setItem('fitring_dark_mode', dark.toString());
  }, [dark]);

  // 5. Actions Handlers
  const handleAddWater = (ml: number) => {
    setWaterVolume(prev => Math.max(0, prev + ml));
  };

  const handleClearWater = () => {
    setWaterVolume(0);
  };

  const handleAddWeight = (weightVal: number) => {
    const newLog: WeightLog = {
      id: 'we_' + Date.now(),
      value: weightVal,
      timestamp: Date.now()
    };
    setWeightLogs(prev => [...prev, newLog]);
    setProfile(prev => ({ ...prev, weight: weightVal }));
  };

  const handleRemoveWeight = (id: string) => {
    setWeightLogs(prev => prev.filter(w => w.id !== id));
  };

  const handleAddWorkout = (workout: Omit<WorkoutLog, 'id' | 'timestamp'>) => {
    const newWorkout: WorkoutLog = {
      ...workout,
      id: 'w_' + Date.now(),
      timestamp: Date.now()
    };
    setWorkouts(prev => [newWorkout, ...prev]);
  };

  const handleRemoveWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const handleAddFood = (food: Omit<FoodLog, 'id' | 'timestamp'>) => {
    const newFood: FoodLog = {
      ...food,
      id: 'f_' + Date.now(),
      timestamp: Date.now()
    };
    setFoods(prev => [newFood, ...prev]);
  };

  const handleRemoveFood = (id: string) => {
    setFoods(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdateTargets = (calories: number, protein: number, carbs: number, fat: number) => {
    setProfile(prev => ({
      ...prev,
      targetCalories: calories,
      targetProtein: protein,
      targetCarbs: carbs,
      targetFat: fat
    }));
  };

  const handleUpdateProfilePartial = (updated: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  const handleResetApp = () => {
    localStorage.clear();
    setProfile(DEFAULT_PROFILE);
    setWorkouts(INITIAL_WORKOUTS);
    setFoods(INITIAL_FOODS);
    setWeightLogs(INITIAL_WEIGHT_LOGS);
    setWaterVolume(INITIAL_WATER);
    location.reload();
  };

  // 6. Navigation tabs listing with metadata
  const tabs = [
    { id: 'dashboard' as const, label: '主页', icon: ActivityIcon, color: '#007AFF' },
    { id: 'fitness' as const, label: '健身', icon: Dumbbell, color: '#FF3B30' },
    { id: 'nutrition' as const, label: '膳食', icon: Apple, color: '#FF9500' },
    { id: 'profile' as const, label: '我的', icon: User, color: '#AF52DE' },
  ];

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-[#E5E5EA] dark:bg-zinc-950 flex justify-center items-center py-0 md:py-8 px-0 md:px-4 transition-colors duration-300 font-sans">
        
        {/* Core mockup wrapper mimic an iPhone phone screen framework */}
        <div className="w-full max-w-md bg-[#F2F2F7] dark:bg-[#1C1C1E] min-h-screen md:min-h-[820px] md:max-h-[880px] md:h-[850px] shadow-2xl md:rounded-[44px] border border-zinc-200/50 dark:border-zinc-805/85 flex flex-col overflow-hidden relative font-sans leading-relaxed selection:bg-blue-200">
          
          {/* iOS Dynamic Notch Speaker bar on top (strictly on larger desktop viewport frames) */}
          <div className="hidden md:block absolute top-2 inset-x-0 h-4 z-50 pointer-events-none">
            <div className="w-24 h-4 bg-zinc-900 dark:bg-zinc-950 rounded-full mx-auto flex items-center justify-center">
              <div className="w-8 h-1 bg-zinc-800/80 rounded-full" />
            </div>
          </div>

          {/* iOS Top Status bar decoration */}
          <div className="h-10 pt-4 px-6 flex justify-between items-center text-zinc-900 dark:text-zinc-100 font-sans tracking-tight shrink-0 select-none bg-[#F2F2F7]/85 dark:bg-[#1C1C1E]/85 backdrop-blur-md z-40">
            <span className="text-xs font-bold font-sans tracking-tight">
              {timeStr}
            </span>
            {/* Dynamic island center mockup */}
            <div className="hidden md:block w-20 h-5 bg-zinc-900 rounded-full mt-[-6px]" />
            <div className="flex items-center gap-1.5 text-zinc-650 dark:text-zinc-400">
              <Wifi size={13} className="text-zinc-850 dark:text-zinc-200" />
              <span className="text-[9px] font-black uppercase tracking-wider font-mono">5G</span>
              <Battery size={15} className="text-zinc-855 dark:text-zinc-200" />
            </div>
          </div>

          {/* Immersive view scroll port content */}
          <div className="flex-1 overflow-y-auto px-5 pt-3 pb-24 scrollbar-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.01 }}
                transition={{ duration: 0.16 }}
                className="w-full"
              >
                {activeTab === 'dashboard' && (
                  <Dashboard
                    workouts={workouts}
                    foods={foods}
                    weightLogs={weightLogs}
                    waterVolume={waterVolume}
                    profile={profile}
                    onAddWater={handleAddWater}
                    onClearWater={handleClearWater}
                    onAddWeight={handleAddWeight}
                    onRemoveWeight={handleRemoveWeight}
                  />
                )}
                {activeTab === 'fitness' && (
                  <FitnessTracker
                    workouts={workouts}
                    onAddWorkout={handleAddWorkout}
                    onRemoveWorkout={handleRemoveWorkout}
                  />
                )}
                {activeTab === 'nutrition' && (
                  <NutritionPlanner
                    foods={foods}
                    profile={profile}
                    onAddFood={handleAddFood}
                    onRemoveFood={handleRemoveFood}
                    onUpdateTargets={handleUpdateTargets}
                    onUpdateProfilePartial={handleUpdateProfilePartial}
                  />
                )}
                {activeTab === 'profile' && (
                  <ProfileScreen
                    profile={profile}
                    onUpdateProfilePartial={handleUpdateProfilePartial}
                    onResetApp={handleResetApp}
                    dark={dark}
                    onToggleTheme={() => setDark(!dark)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* iOS Bottom navigation tabs bar */}
          <div className="absolute bottom-0 inset-x-0 h-20 bg-white/95 dark:bg-[#1C1C1E]/95 border-t border-[#E5E5EA] dark:border-[#2C2C2E] backdrop-blur-md flex justify-around items-center px-4 pt-1 pb-4 z-40 select-none">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center justify-center py-1 flex-1 relative active:scale-95 transition-transform"
                >
                  <motion.div
                    className={`p-1.5 rounded-xl transition-colors ${
                      isActive 
                        ? 'text-zinc-900 dark:text-white' 
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    <TabIcon size={20} className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"} />
                  </motion.div>
                  <span className={`text-[9.5px] font-bold tracking-wide leading-none ${
                    isActive 
                      ? 'text-zinc-900 dark:text-white font-extrabold' 
                      : 'text-zinc-400 dark:text-zinc-500 font-medium'
                  }`}>
                    {tab.label}
                  </span>
                  
                  {/* Subtle navigation dot or capsule highlight indicator */}
                  {isActive && (
                    <motion.div 
                      layoutId="navHighlight"
                      className="absolute bottom-1 w-1 h-1 rounded-full"
                      style={{ backgroundColor: tab.color }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
