import { Wind, Volume2, Snowflake, Calendar, Bus, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Modifier = {
  factor: string;
  icon: typeof Wind;
  loadDelta: number;
  energyDelta: number;
  active: boolean;
};

const MODIFIERS: Modifier[] = [
  { factor: 'Noise Level (High)', icon: Volume2, loadDelta: 1, energyDelta: 0, active: true },
  { factor: 'Air Quality (Poor)', icon: Wind, loadDelta: 0, energyDelta: -1, active: false },
  { factor: 'Snowstorm Active', icon: Snowflake, loadDelta: 1, energyDelta: -1, active: false },
  { factor: 'Cultural Event Nearby', icon: Calendar, loadDelta: 0, energyDelta: 1, active: true },
  { factor: 'Transit Disruption', icon: Bus, loadDelta: 1, energyDelta: 0, active: false },
];

type Props = {
  compact?: boolean;
};

export function EnvironmentalModifiers({ compact = false }: Props) {
  const activeModifiers = MODIFIERS.filter((m) => m.active);
  const totalLoad = activeModifiers.reduce((sum, m) => sum + m.loadDelta, 0);
  const totalEnergy = activeModifiers.reduce((sum, m) => sum + m.energyDelta, 0);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {activeModifiers.length > 0 ? (
          <>
            <div className="flex items-center gap-1">
              {totalLoad > 0 && <TrendingUp size={10} className="text-red-400" />}
              {totalLoad === 0 && <Minus size={10} className="text-gray-500" />}
              <span className="text-[9px] text-gray-400">Load {totalLoad > 0 ? `+${totalLoad}` : totalLoad}</span>
            </div>
            <div className="flex items-center gap-1">
              {totalEnergy > 0 && <TrendingUp size={10} className="text-emerald-400" />}
              {totalEnergy < 0 && <TrendingDown size={10} className="text-red-400" />}
              {totalEnergy === 0 && <Minus size={10} className="text-gray-500" />}
              <span className="text-[9px] text-gray-400">Energy {totalEnergy > 0 ? `+${totalEnergy}` : totalEnergy}</span>
            </div>
          </>
        ) : (
          <span className="text-[9px] text-gray-600">No environmental modifiers active</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Environmental Geometry</h4>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-medium ${totalLoad > 0 ? 'text-red-400' : 'text-gray-500'}`}>
            Load {totalLoad > 0 ? `+${totalLoad}` : '0'}
          </span>
          <span className={`text-[10px] font-medium ${totalEnergy > 0 ? 'text-emerald-400' : totalEnergy < 0 ? 'text-red-400' : 'text-gray-500'}`}>
            Energy {totalEnergy > 0 ? `+${totalEnergy}` : totalEnergy === 0 ? '0' : totalEnergy}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {MODIFIERS.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.factor}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                mod.active
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-gray-900/30 border-gray-800/50 opacity-50'
              }`}
            >
              <Icon size={12} className={mod.active ? 'text-amber-400' : 'text-gray-600'} />
              <span className={`text-[11px] flex-1 ${mod.active ? 'text-gray-300' : 'text-gray-600'}`}>
                {mod.factor}
              </span>
              <div className="flex items-center gap-2">
                {mod.loadDelta !== 0 && (
                  <span className={`text-[9px] font-medium ${mod.loadDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    L{mod.loadDelta > 0 ? '+' : ''}{mod.loadDelta}
                  </span>
                )}
                {mod.energyDelta !== 0 && (
                  <span className={`text-[9px] font-medium ${mod.energyDelta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    E{mod.energyDelta > 0 ? '+' : ''}{mod.energyDelta}
                  </span>
                )}
              </div>
              <div className={`w-2 h-2 rounded-full ${mod.active ? 'bg-emerald-400' : 'bg-gray-700'}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
