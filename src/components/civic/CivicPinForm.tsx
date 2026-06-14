import { useState } from 'react';
import { X, MapPin, Save } from 'lucide-react';

type PinType = 'public' | 'private' | 'gear' | 'story';
type Severity = 'green' | 'amber' | 'red' | null;

type PinData = {
  type: PinType;
  title: string;
  description: string;
  category: string;
  severity: Severity;
  lat: number;
  lng: number;
};

type Props = {
  lat: number;
  lng: number;
  onSave: (pin: PinData) => void;
  onCancel: () => void;
};

const PIN_TYPES: { value: PinType; label: string; color: string }[] = [
  { value: 'public', label: 'Public', color: 'bg-blue-600' },
  { value: 'private', label: 'Private', color: 'bg-gray-600' },
  { value: 'gear', label: 'Gear', color: 'bg-orange-600' },
  { value: 'story', label: 'Story', color: 'bg-amber-600' },
];

const CATEGORIES = ['shelter', 'event', 'safety', 'art', 'food', 'transit', 'wifi', 'park', 'general'];

export function CivicPinForm({ lat, lng, onSave, onCancel }: Props) {
  const [type, setType] = useState<PinType>('public');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [severity, setSeverity] = useState<Severity>(null);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({ type, title, description, category, severity, lat, lng });
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 w-80 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white">New Pin</h3>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="text-[9px] text-gray-500 mb-4 font-mono">
        {lat.toFixed(4)}, {lng.toFixed(4)}
      </div>

      {/* Pin type */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {PIN_TYPES.map((pt) => (
          <button
            key={pt.value}
            onClick={() => setType(pt.value)}
            className={`py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
              type === pt.value
                ? `${pt.color} text-white`
                : 'bg-gray-800 text-gray-500 hover:text-gray-300'
            }`}
          >
            {pt.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Pin title"
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-gray-600 mb-3"
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={3}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-gray-600 resize-none mb-3"
      />

      {/* Category */}
      <div className="mb-3">
        <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1.5">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Severity */}
      <div className="mb-4">
        <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1.5">Severity</label>
        <div className="flex gap-2">
          {(['green', 'amber', 'red'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverity(severity === s ? null : s)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${
                severity === s
                  ? s === 'green' ? 'bg-emerald-900/50 border-emerald-600 text-emerald-300'
                    : s === 'amber' ? 'bg-amber-900/50 border-amber-600 text-amber-300'
                    : 'bg-red-900/50 border-red-600 text-red-300'
                  : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="flex-1 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white transition-colors flex items-center justify-center gap-1.5"
        >
          <Save size={11} />
          Save Pin
        </button>
      </div>
    </div>
  );
}

export type { PinData };
