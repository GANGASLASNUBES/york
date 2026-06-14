import { MapPin, Route, Bookmark, Share2, Play } from 'lucide-react';

type TrailType = 'art' | 'park' | 'festival' | 'safety' | 'custom';

type Props = {
  id: string;
  name: string;
  description: string;
  trailType: TrailType;
  pinCount: number;
  distance?: string;
  duration?: string;
  onStart?: () => void;
  onSave?: () => void;
  onShare?: () => void;
};

const trailStyles: Record<TrailType, { color: string; bg: string; border: string }> = {
  art: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-800/30' },
  park: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-800/30' },
  festival: { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-800/30' },
  safety: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-800/30' },
  custom: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-800/30' },
};

export function CityTrailCard({ name, description, trailType, pinCount, distance, duration, onStart, onSave, onShare }: Props) {
  const style = trailStyles[trailType];

  return (
    <div className={`bg-gray-900 border rounded-2xl overflow-hidden hover:border-gray-700 transition-colors ${style.border}`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className={`inline-block text-[9px] font-medium ${style.color} ${style.bg} px-2 py-0.5 rounded-full mb-2 capitalize`}>
              {trailType} trail
            </span>
            <h3 className="text-sm font-bold text-white">{name}</h3>
          </div>
          <Route size={18} className={style.color} />
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed mb-4">{description}</p>

        <div className="flex items-center gap-4 text-[10px] text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin size={9} />
            <span>{pinCount} stops</span>
          </div>
          {distance && (
            <div className="flex items-center gap-1">
              <Route size={9} />
              <span>{distance}</span>
            </div>
          )}
          {duration && <span>{duration}</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium text-white transition-colors ${
              trailType === 'art' ? 'bg-cyan-600 hover:bg-cyan-500' :
              trailType === 'park' ? 'bg-emerald-600 hover:bg-emerald-500' :
              trailType === 'festival' ? 'bg-pink-600 hover:bg-pink-500' :
              trailType === 'safety' ? 'bg-amber-600 hover:bg-amber-500' :
              'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            <Play size={11} />
            Start Trail
          </button>
          <button
            onClick={onSave}
            className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <Bookmark size={13} />
          </button>
          <button
            onClick={onShare}
            className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <Share2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
