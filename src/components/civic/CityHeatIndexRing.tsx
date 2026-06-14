type Mood = 'energized' | 'stable' | 'stressed' | 'overloaded';

type Props = {
  compositeScore: number;
  mood: Mood;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
};

const moodConfig: Record<Mood, { color: string; glow: string; label: string }> = {
  energized: { color: '#10b981', glow: 'rgba(16, 185, 129, 0.3)', label: 'Energized' },
  stable: { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)', label: 'Stable' },
  stressed: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', label: 'Stressed' },
  overloaded: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)', label: 'Overloaded' },
};

const sizes = {
  sm: { ring: 60, stroke: 4, text: 'text-sm', label: 'text-[8px]' },
  md: { ring: 100, stroke: 6, text: 'text-xl', label: 'text-[10px]' },
  lg: { ring: 140, stroke: 8, text: 'text-3xl', label: 'text-xs' },
};

export function CityHeatIndexRing({ compositeScore, mood, size = 'md', showLabel = true }: Props) {
  const config = moodConfig[mood];
  const s = sizes[size];
  const radius = (s.ring - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (compositeScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: s.ring, height: s.ring }}>
        <svg width={s.ring} height={s.ring} className="transform -rotate-90">
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth={s.stroke}
          />
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${config.glow})`,
              transition: 'stroke-dashoffset 0.8s ease',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${s.text}`} style={{ color: config.color }}>
            {compositeScore}
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <p className={`font-semibold ${s.label}`} style={{ color: config.color }}>{config.label}</p>
          <p className="text-[8px] text-gray-600">City Heat Index</p>
        </div>
      )}
    </div>
  );
}
