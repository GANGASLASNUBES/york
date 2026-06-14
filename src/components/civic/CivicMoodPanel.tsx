import { TrendingUp, TrendingDown, Minus, Heart, Zap } from 'lucide-react';

type MoodLevel = 'low' | 'mid' | 'high';

type Props = {
  cityLoad: MoodLevel;
  cityEnergy: MoodLevel;
  modifiers: { factor: string; loadDelta: number; energyDelta: number }[];
};

const moodLabel: Record<MoodLevel, { text: string; color: string }> = {
  low: { text: 'Low', color: 'text-emerald-400' },
  mid: { text: 'Mid', color: 'text-amber-400' },
  high: { text: 'High', color: 'text-red-400' },
};

function getMoodStatus(load: MoodLevel, energy: MoodLevel): { label: string; color: string } {
  if (load === 'high') return { label: 'Stressed', color: 'text-red-400' };
  if (energy === 'high' && load === 'low') return { label: 'Energized', color: 'text-emerald-400' };
  return { label: 'Stable', color: 'text-blue-400' };
}

export function CivicMoodPanel({ cityLoad, cityEnergy, modifiers }: Props) {
  const mood = getMoodStatus(cityLoad, cityEnergy);

  return (
    <div className="space-y-4">
      {/* City Mood summary */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">City Mood</h4>
          <span className={`text-xs font-bold ${mood.color}`}>{mood.label}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={10} className="text-gray-500" />
              <span className="text-[9px] text-gray-500">Load Level</span>
            </div>
            <p className={`text-sm font-bold ${moodLabel[cityLoad].color}`}>{moodLabel[cityLoad].text}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart size={10} className="text-gray-500" />
              <span className="text-[9px] text-gray-500">Energy Level</span>
            </div>
            <p className={`text-sm font-bold ${moodLabel[cityEnergy].color}`}>{moodLabel[cityEnergy].text}</p>
          </div>
        </div>
      </div>

      {/* Active modifiers */}
      <div>
        <h4 className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Modifiers</h4>
        <div className="space-y-1">
          {modifiers.map((mod) => (
            <div key={mod.factor} className="flex items-center justify-between px-3 py-2 bg-gray-800/30 rounded-lg">
              <span className="text-[10px] text-gray-300">{mod.factor}</span>
              <div className="flex items-center gap-2">
                {mod.loadDelta !== 0 && (
                  <span className="text-[9px] text-red-400 flex items-center gap-0.5">
                    <TrendingUp size={8} />
                    L+{mod.loadDelta}
                  </span>
                )}
                {mod.energyDelta > 0 && (
                  <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp size={8} />
                    E+{mod.energyDelta}
                  </span>
                )}
                {mod.energyDelta < 0 && (
                  <span className="text-[9px] text-red-400 flex items-center gap-0.5">
                    <TrendingDown size={8} />
                    E{mod.energyDelta}
                  </span>
                )}
                {mod.loadDelta === 0 && mod.energyDelta === 0 && (
                  <Minus size={8} className="text-gray-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
