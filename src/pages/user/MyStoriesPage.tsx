import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Heart, Bookmark } from 'lucide-react';

type SavedStory = {
  id: string;
  title: string;
  category: string;
  location: string;
  savedAt: string;
};

const MY_STORIES: SavedStory[] = [
  { id: '1', title: 'La Joute by Riopelle', category: 'Art Tours', location: 'Place Jean-Paul-Riopelle', savedAt: '1 day ago' },
  { id: '2', title: 'Mont-Royal at Sunrise', category: 'Green Spaces', location: 'Avenue du Parc', savedAt: '2 days ago' },
  { id: '3', title: 'Festival International de Jazz', category: 'Events', location: 'Place des Arts', savedAt: '3 days ago' },
  { id: '4', title: 'Grande Bibliotheque', category: 'Libraries', location: 'Berri-UQAM', savedAt: '5 days ago' },
  { id: '5', title: 'Under Pressure Murals', category: 'Art Tours', location: 'Saint-Laurent & Duluth', savedAt: '1 week ago' },
];

const FOLLOWED_CATEGORIES = ['Art Tours', 'Events', 'Green Spaces'];

export function MyStoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <BookOpen size={16} className="text-amber-400" />
          <h1 className="text-sm font-bold">My Stories</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Followed categories */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Following</h2>
          <div className="flex flex-wrap gap-2">
            {FOLLOWED_CATEGORIES.map((cat) => (
              <span key={cat} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/20 border border-amber-800/30 rounded-lg text-[10px] text-amber-300 font-medium">
                <Heart size={9} className="fill-amber-400 text-amber-400" />
                {cat}
              </span>
            ))}
            <button className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-[10px] text-gray-400 hover:text-white transition-colors">
              + Follow more
            </button>
          </div>
        </div>

        {/* Saved stories */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Saved Stories</h2>
          <div className="space-y-2">
            {MY_STORIES.map((story) => (
              <div key={story.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-amber-900/20 flex items-center justify-center shrink-0">
                  <Bookmark size={14} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-white truncate">{story.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-gray-500">
                    <span className="text-amber-400/70">{story.category}</span>
                    <span>{story.location}</span>
                  </div>
                </div>
                <span className="text-[9px] text-gray-600 shrink-0">{story.savedAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
