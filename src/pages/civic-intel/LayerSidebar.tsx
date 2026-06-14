import { Layers, ChevronLeft, RefreshCw,
  Building2, Snowflake, Trash2, Car, Construction, Calendar, Palette,
  Wind, Volume2, FileText, Wifi, Trees, Droplets, Bus, BookOpen, Zap
} from 'lucide-react';
import { CivicLayerToggle } from '../../components/civic/CivicLayerToggle';
import type { LayerKey } from './hooks/useCivicLayers';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  enabledLayers: Set<LayerKey>;
  onToggle: (key: LayerKey) => void;
};

const LAYER_CONFIG: { key: LayerKey; label: string; icon: typeof Building2; severity: 'green' | 'amber' | 'red' }[] = [
  { key: 'shelters', label: 'Shelters', icon: Building2, severity: 'green' },
  { key: 'snow', label: 'Snow Removal', icon: Snowflake, severity: 'amber' },
  { key: 'traffic', label: 'Traffic', icon: Car, severity: 'red' },
  { key: 'street_closures', label: 'Street Closures', icon: Construction, severity: 'amber' },
  { key: 'bike_paths', label: 'Bike Paths', icon: Bus, severity: 'green' },
  { key: 'cultural_events', label: 'Events', icon: Calendar, severity: 'green' },
  { key: 'public_art', label: 'Public Art', icon: Palette, severity: 'green' },
  { key: 'air_quality', label: 'Air Quality', icon: Wind, severity: 'green' },
  { key: 'noise', label: 'Noise', icon: Volume2, severity: 'amber' },
  { key: 'wifi', label: 'Wi-Fi', icon: Wifi, severity: 'green' },
  { key: 'parks', label: 'Parks', icon: Trees, severity: 'green' },
  { key: 'transit', label: 'Transit', icon: Bus, severity: 'amber' },
  { key: 'libraries', label: 'Libraries', icon: BookOpen, severity: 'green' },
  { key: 'waste', label: 'Waste', icon: Trash2, severity: 'green' },
  { key: 'water_quality', label: 'Water', icon: Droplets, severity: 'green' },
  { key: 'permits', label: 'Permits', icon: FileText, severity: 'green' },
  { key: 'pools', label: 'Pools', icon: Droplets, severity: 'green' },
  { key: 'sports', label: 'Sports', icon: Zap, severity: 'green' },
  { key: 'grants', label: 'Grants', icon: FileText, severity: 'green' },
  { key: 'contracts', label: 'Contracts', icon: FileText, severity: 'green' },
];

export default function LayerSidebar({ isOpen, onClose, enabledLayers, onToggle }: Props) {
  if (!isOpen) return null;

  const layers = LAYER_CONFIG.map((l) => ({
    key: l.key,
    label: l.label,
    icon: <l.icon size={11} />,
    severity: l.severity,
    lastUpdated: `${Math.floor(Math.random() * 30 + 1)}m ago`,
    enabled: enabledLayers.has(l.key),
  }));

  return (
    <div className="h-full w-56 bg-gray-900/95 border-r border-gray-800 backdrop-blur flex flex-col">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={12} className="text-gray-400" />
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Layers</h3>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <ChevronLeft size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <CivicLayerToggle layers={layers} onToggle={(key) => onToggle(key as LayerKey)} />
      </div>
      <div className="p-3 border-t border-gray-800">
        <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-[10px] font-medium text-white transition-colors">
          <RefreshCw size={10} />
          Refresh All
        </button>
      </div>
    </div>
  );
}
