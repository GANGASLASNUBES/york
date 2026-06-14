import { useState } from 'react';
import { Palette, Calendar, Trees, BookOpen, Gift, ChevronRight, Sparkles, MapPin } from 'lucide-react';

type StoryCategory = 'art' | 'events' | 'parks' | 'libraries' | 'gifts';

type StoryItem = {
  title: string;
  location: string;
  excerpt: string;
  category: StoryCategory;
};

const CATEGORIES: { key: StoryCategory; label: string; icon: typeof Palette; color: string }[] = [
  { key: 'art', label: 'Art Tours', icon: Palette, color: 'text-cyan-400' },
  { key: 'events', label: 'Events', icon: Calendar, color: 'text-pink-400' },
  { key: 'parks', label: 'Parks', icon: Trees, color: 'text-emerald-400' },
  { key: 'libraries', label: 'Libraries', icon: BookOpen, color: 'text-amber-400' },
  { key: 'gifts', label: 'Gift Ideas', icon: Gift, color: 'text-rose-400' },
];

const STORIES: StoryItem[] = [
  { title: 'La Joute by Riopelle', location: 'Place Jean-Paul-Riopelle', excerpt: 'A kinetic fountain that erupts with fire at dusk...', category: 'art' },
  { title: 'Festival International de Jazz', location: 'Place des Arts', excerpt: 'Over 3000 artists transform downtown...', category: 'events' },
  { title: 'Mont-Royal at Sunrise', location: 'Avenue du Parc', excerpt: 'The Belvedere offers the definitive city view...', category: 'parks' },
  { title: 'Grande Bibliotheque', location: 'Berri-UQAM', excerpt: 'A cathedral of knowledge with millions of documents...', category: 'libraries' },
  { title: 'Book Bundles', location: 'Local bookshops', excerpt: 'Curated reading packages from independent bookshops...', category: 'gifts' },
  { title: 'Under Pressure Murals', location: 'Saint-Laurent & Duluth', excerpt: 'Massive street art transforming blank walls...', category: 'art' },
  { title: 'Mural Festival', location: 'Boulevard Saint-Laurent', excerpt: 'Artists from around the world paint live...', category: 'events' },
];

type Props = {
  onStorySelect?: (story: StoryItem) => void;
};

export function CivicStoryOverlay({ onStorySelect }: Props) {
  const [activeCategory, setActiveCategory] = useState<StoryCategory | null>(null);

  const filtered = activeCategory
    ? STORIES.filter((s) => s.category === activeCategory)
    : STORIES.slice(0, 4);

  return (
    <div className="space-y-3">
      {/* Avatar + heading */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-900/60 to-amber-900/40 border border-amber-800/30 flex items-center justify-center relative overflow-hidden">
          <div className="w-4 h-4 rounded-full bg-red-600/80 absolute top-0.5" />
          <div className="absolute bottom-1 w-3 h-1.5">
            <svg viewBox="0 0 24 12" className="w-full h-full">
              <path d="M 2,8 C 6,2 18,2 22,8" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">Story Mode</h4>
          <p className="text-[9px] text-amber-400/70">Lexi's city narratives</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(isActive ? null : cat.key)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium transition-colors ${
                isActive ? `${cat.color} bg-gray-800` : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={9} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Story cards */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {filtered.map((story, i) => (
          <button
            key={i}
            onClick={() => onStorySelect?.(story)}
            className="w-full text-left p-3 bg-gray-800/40 hover:bg-gray-800/70 rounded-lg border border-transparent hover:border-amber-800/20 transition-all"
          >
            <div className="flex items-center gap-1 mb-1">
              <Sparkles size={8} className="text-amber-400" />
              <span className="text-[8px] text-amber-400 capitalize">{story.category}</span>
            </div>
            <h5 className="text-[11px] font-semibold text-white mb-0.5">{story.title}</h5>
            <div className="flex items-center gap-1">
              <MapPin size={7} className="text-gray-600" />
              <span className="text-[8px] text-gray-600">{story.location}</span>
            </div>
            <p className="text-[9px] text-gray-500 mt-1 line-clamp-2">{story.excerpt}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
