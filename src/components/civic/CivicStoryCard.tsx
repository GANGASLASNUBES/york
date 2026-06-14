import { useState } from 'react';
import { ChevronDown, MapPin, Sparkles } from 'lucide-react';

type Props = {
  title: string;
  description: string;
  location: string;
  highlight?: string;
  imageUrl?: string;
  category?: string;
};

export function CivicStoryCard({ title, description, location, highlight, imageUrl, category }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-gray-900 border rounded-2xl overflow-hidden transition-all cursor-pointer ${
        expanded ? 'border-amber-800/40' : 'border-gray-800 hover:border-gray-700'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {imageUrl && expanded && (
        <div className="h-40 bg-gray-800 overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover opacity-80" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {category && (
              <span className="inline-block text-[9px] font-medium text-amber-400 bg-amber-900/20 px-2 py-0.5 rounded-full mb-2">
                {category}
              </span>
            )}
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={10} className="text-gray-500" />
              <span className="text-[10px] text-gray-500">{location}</span>
            </div>
          </div>
          <ChevronDown
            size={14}
            className={`text-gray-500 transition-transform mt-1 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>

        {expanded && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
            {highlight && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/10 border border-amber-800/20 rounded-lg">
                <Sparkles size={10} className="text-amber-400 shrink-0" />
                <span className="text-[11px] text-amber-300">{highlight}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
