import React, { useState } from 'react';
import { 
  User, 
  Scale, 
  Target, 
  Heart, 
  Info, 
  Settings, 
  ChevronRight, 
  TrendingDown, 
  Activity, 
  Plus, 
  ShieldAlert,
  Moon,
  Sun
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileScreenProps {
  profile: UserProfile;
  onUpdateProfilePartial: (updated: Partial<UserProfile>) => void;
  onResetApp: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateProfilePartial,
  onResetApp,
  dark,
  onToggleTheme
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [weightGoal, setWeightGoal] = useState(profile.weightGoal);

  // Math: Body Mass Index BMI
  const bmi = height > 0 ? Number((weight / ((height / 100) ** 2)).toFixed(1)) : 0;
  
  const getBmiStatus = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: '偏瘦 (Underweight)', color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' };
    if (bmiValue < 24.0) return { label: '标准正常 (Normal)', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' };
    if (bmiValue < 28.0) return { label: '偏重超重 (Overweight)', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' };
    return { label: '轻度肥胖 (Obese)', color: 'text-red-500 bg-red-50 dark:bg-red-950/20' };
  };

  const bmiStatus = getBmiStatus(bmi);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfilePartial({
      name: name || '健身达人',
      height: height || 175,
      weight: weight || 70,
      weightGoal: weightGoal || 65
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header with styling */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            个人主页
          </h1>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            您的个人身体参数及打卡目标
          </p>
        </div>
        
        {/* Dark theme toggle button */}
        <button
          onClick={onToggleTheme}
          className="p-3 bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 rounded-2xl flex items-center justify-center shadow-xs"
          title="切换深色模式"
        >
          {dark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>
      </div>

      {/* 2. iOS Profile Card display */}
      <div className="bg-white dark:bg-zinc-3000 bg-linear-to-tr from-zinc-50 to-zinc-100/40 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-600/10 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">{profile.name}</h2>
          <span className="text-xs font-bold font-sans text-blue-600 dark:text-blue-400 uppercase tracking-wide bg-blue-50 dark:bg-blue-950/20 px-2.5 py-0.5 rounded-full border border-blue-100/40 dark:border-blue-900/30">
            {profile.goal === 'lose' ? '减脂瘦身' : profile.goal === 'gain' ? '增肌增重' : '保持健康'}
          </span>
        </div>
      </div>

      {/* 3. BMI index dynamic calculator widget details */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <Heart size={16} className="text-rose-500" /> 身体健康指数 (BMI)
        </h3>

        <div className="grid grid-cols-2 gap-4 items-center font-sans">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-center">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase block">当前计算指数</span>
            <span className="text-3xl font-black font-mono text-zinc-800 dark:text-zinc-100 leading-tight">
              {bmi}
            </span>
            <span className={`text-[10px] font-bold block px-2 py-0.5 rounded-full mt-2 mx-auto max-w-max ${bmiStatus.color}`}>
              {bmiStatus.label}
            </span>
          </div>

          <div className="text-xs space-y-1.5 text-zinc-500 dark:text-zinc-400 leading-relaxed">
            <div className="flex justify-between">
              <span>正常指标范围:</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">18.5 - 23.9</span>
            </div>
            <p className="text-[10px] text-zinc-450 mt-1">
              BMI 是根据身高、体重计算得到的科学指数。建议将您的 BMI 保持在正常科学区间，能够更有效地抵御各类型慢性疾病。
            </p>
          </div>
        </div>
      </div>

      {/* 4. Settings body with expandable form actions */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden divide-y divide-zinc-50 dark:divide-zinc-800/80">
        <div className="p-5">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">基本健康参数设置</h3>
          
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-zinc-400 font-bold block">名字</span>
                  <input 
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2.5 rounded-xl text-zinc-850"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 font-bold block">身高 (cm)</span>
                  <input 
                    type="number"
                    value={height}
                    onChange={e => setHeight(parseInt(e.target.value) || 170)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2.5 rounded-xl text-zinc-850"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 font-bold block">当前体重 (kg)</span>
                  <input 
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={e => setWeight(parseFloat(e.target.value) || 70)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2.5 rounded-xl text-zinc-850"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 font-bold block">目标体重 (kg)</span>
                  <input 
                    type="number"
                    step="0.1"
                    value={weightGoal}
                    onChange={e => setWeightGoal(parseFloat(e.target.value) || 65)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-2.5 rounded-xl text-zinc-850"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  保存更新
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3.5 text-xs text-zinc-650 font-medium">
              <div className="flex justify-between py-1.5 border-b border-zinc-50 dark:border-zinc-850">
                <span className="text-zinc-400">名字 profile name</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold">{profile.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-50 dark:border-zinc-850">
                <span className="text-zinc-400">身高 Height</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold font-mono">{profile.height} cm</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-50 dark:border-zinc-850">
                <span className="text-zinc-400">当前体重 Current Weight</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold font-mono">{profile.weight} kg</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-50 dark:border-zinc-850">
                <span className="text-zinc-400">目标体重 Goal Weight</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold font-mono text-emerald-500">{profile.weightGoal} kg</span>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl text-center font-bold font-sans active:scale-98 transition-transform mt-2 block"
              >
                编辑身体档案资料
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Utility commands options */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">应用管理</h3>
        
        <div className="space-y-3 text-xs">
          <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100/40 dark:border-orange-900/40 p-3.5 rounded-2xl flex gap-3 items-center">
            <ShieldAlert size={16} className="text-orange-500 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                这是本地客户端储存系统。所有的打卡信息、健身时长和摄入计算都会安全地写在您的本机浏览器缓存中（localStorage）
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('您确定要重置所有健身打卡以及每日饮食计算记录吗？此操作无法撤销。')) {
                onResetApp();
              }
            }}
            className="w-full py-3 border border-dashed border-red-200 text-red-500 rounded-xl text-center font-bold hover:bg-red-50/50 dark:hover:bg-red-950/15 transition-all text-[11px]"
          >
            重置应用数据并载入演示数据
          </button>
        </div>
      </div>
    </div>
  );
};
