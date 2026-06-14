import { useState } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

type Props = {
  onChange: (hoursAgo: number) => void;
  onReset: () => void;
};

export function CivicTimeSlider({ onChange, onReset }: Props) {
  const [value, setValue] = useState(0);
  const [playing, setPlaying] = useState(false);

  const handleChange = (v: number) => {
    setValue(v);
    onChange(v);
  };

  const formatHour = (h: number) => {
    if (h === 0) return 'Now';
    return `${h}h ago`;
  };

  return (
    <div className="flex items-center gap-3 bg-gray-900/95 border border-gray-800 rounded-xl px-4 py-2.5 backdrop-blur shadow-xl">
      <button
        onClick={() => setPlaying(!playing)}
        className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
      >
        {playing ? <Pause size={11} className="text-amber-400" /> : <Play size={11} className="text-emerald-400" />}
      </button>

      <div className="flex-1 flex items-center gap-3">
        <Clock size={10} className="text-gray-500 shrink-0" />
        <input
          type="range"
          min={0}
          max={24}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <span className="text-[10px] text-gray-400 font-mono w-14 text-right">{formatHour(value)}</span>
      </div>

      <button
        onClick={() => { setValue(0); onReset(); }}
        className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
        title="Reset View"
      >
        <RotateCcw size={11} className="text-gray-400" />
      </button>
    </div>
  );
}
