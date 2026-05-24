import React from 'react';

interface NestedRingsProps {
  calorieProgress: number; // e.g. 0.7
  exerciseProgress: number; // e.g. 0.5
  waterProgress: number; // e.g. 0.8
  calorieLabel?: string;
  exerciseLabel?: string;
  waterLabel?: string;
}

export const HealthRings: React.FC<NestedRingsProps> = ({
  calorieProgress,
  exerciseProgress,
  waterProgress,
  calorieLabel = '活动能量',
  exerciseLabel = '锻炼时间',
  waterLabel = '每日饮水'
}) => {
  const size = 160;
  const center = size / 2;
  const strokeWidth = 14;

  const ring1Radius = 66; // Outer ring
  const ring2Radius = 49; // Middle ring
  const ring3Radius = 32; // Inner ring

  const getRingParams = (radius: number, progress: number) => {
    const circumference = 2 * Math.PI * radius;
    // Cap progress at 1 for visual representation but can overshoot slightly
    const clampedProgress = Math.max(0, progress);
    const strokeDashoffset = circumference - (Math.min(1.5, clampedProgress) * circumference);
    return { circumference, strokeDashoffset };
  };

  const ring1 = getRingParams(ring1Radius, calorieProgress);
  const ring2 = getRingParams(ring2Radius, exerciseProgress);
  const ring3 = getRingParams(ring3Radius, waterProgress);

  return (
    <div className="flex items-center gap-6 justify-center bg-zinc-50 dark:bg-zinc-900/60 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800/80 shadow-xs">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Ring 1 - Red (Calorie Burn) */}
          <circle
            cx={center}
            cy={center}
            r={ring1Radius}
            fill="none"
            stroke="rgba(255, 59, 48, 0.12)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={ring1Radius}
            fill="none"
            stroke="#FF3B30"
            strokeWidth={strokeWidth}
            strokeDasharray={ring1.circumference}
            strokeDashoffset={ring1.strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />

          {/* Ring 2 - Green (Exercise Duration) */}
          <circle
            cx={center}
            cy={center}
            r={ring2Radius}
            fill="none"
            stroke="rgba(52, 199, 89, 0.12)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={ring2Radius}
            fill="none"
            stroke="#34C759"
            strokeWidth={strokeWidth}
            strokeDasharray={ring2.circumference}
            strokeDashoffset={ring2.strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />

          {/* Ring 3 - Blue (Water Intake) */}
          <circle
            cx={center}
            cy={center}
            r={ring3Radius}
            fill="none"
            stroke="rgba(0, 122, 255, 0.12)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={ring3Radius}
            fill="none"
            stroke="#007AFF"
            strokeWidth={strokeWidth}
            strokeDasharray={ring3.circumference}
            strokeDashoffset={ring3.strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Small legend elements in center or overlay decoration */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">FITRING</span>
          <span className="text-xl font-bold font-sans text-zinc-900 dark:text-zinc-100">
            {Math.round(calorieProgress * 100)}%
          </span>
        </div>
      </div>

      {/* Side Legend */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF3B30]" />
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{calorieLabel}</div>
            <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {Math.round(calorieProgress * 100)}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#34C759]" />
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{exerciseLabel}</div>
            <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {Math.round(exerciseProgress * 100)}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#007AFF]" />
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{waterLabel}</div>
            <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {Math.round(waterProgress * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
