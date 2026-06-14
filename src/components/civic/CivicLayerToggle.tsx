import { Circle } from 'lucide-react';

type Severity = 'green' | 'amber' | 'red';

type Layer = {
  key: string;
  label: string;
  icon: React.ReactNode;
  severity: Severity;
  lastUpdated: string;
  enabled: boolean;
};

type Props = {
  layers: Layer[];
  onToggle: (key: string) => void;
};

const severityDot: Record<Severity, string> = {
  green: 'text-emerald-400 fill-emerald-400',
  amber: 'text-amber-400 fill-amber-400',
  red: 'text-red-400 fill-red-400',
};

export function CivicLayerToggle({ layers, onToggle }: Props) {
  return (
    <div className="space-y-0.5">
      {layers.map((layer) => (
        <button
          key={layer.key}
          onClick={() => onToggle(layer.key)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
            layer.enabled
              ? 'bg-gray-800/80 border border-gray-700/50'
              : 'hover:bg-gray-800/30 border border-transparent'
          }`}
        >
          <div className={`w-6 h-6 rounded flex items-center justify-center ${
            layer.enabled ? 'bg-emerald-900/40 text-emerald-400' : 'bg-gray-800 text-gray-600'
          }`}>
            {layer.icon}
          </div>
          <div className="flex-1 min-w-0">
            <span className={`text-[11px] font-medium block truncate ${
              layer.enabled ? 'text-white' : 'text-gray-500'
            }`}>
              {layer.label}
            </span>
            <span className="text-[8px] text-gray-600">{layer.lastUpdated}</span>
          </div>
          <Circle size={5} className={severityDot[layer.severity]} />
        </button>
      ))}
    </div>
  );
}
