import { useState } from 'react';
import { Clock, Tag, ChevronRight, X } from 'lucide-react';

type Routine = {
  id: string;
  title: string;
  category: string;
  price: number;
  steps: string[];
  products: string[];
};

const ROUTINES: Routine[] = [
  {
    id: 'morning-glow',
    title: 'Morning Glow',
    category: 'Daily',
    price: 0,
    steps: ['Cleanse', 'Hydrate', 'Vitamin C', 'Moisturize', 'SPF'],
    products: ['Gentle gel cleanser', 'Hydrating toner', 'Vitamin C serum', 'Lightweight moisturizer', 'SPF 30+'],
  },
  {
    id: 'night-repair',
    title: 'Night Repair',
    category: 'Night',
    price: 4,
    steps: ['Double cleanse', 'Niacinamide', 'Moisturizer', 'Overnight mask'],
    products: ['Cleansing oil', 'Gel cleanser', 'Niacinamide 10%', 'Rich night cream', 'Overnight mask'],
  },
  {
    id: 'acne-control',
    title: 'Acne Control',
    category: 'Treatment',
    price: 6,
    steps: ['Salicylic cleanser', 'Spot treatment', 'Lightweight moisturizer'],
    products: ['Salicylic acid cleanser', 'Benzoyl peroxide spot gel', 'Oil-free moisturizer'],
  },
  {
    id: 'dry-rescue',
    title: 'Dry Skin Rescue',
    category: 'Treatment',
    price: 5,
    steps: ['Cream cleanse', 'Hyaluronic acid', 'Ceramide cream', 'Facial oil'],
    products: ['Cream cleanser', 'Hyaluronic acid serum', 'Ceramide repair cream', 'Squalane oil'],
  },
  {
    id: 'oily-balance',
    title: 'Oily Skin Balance',
    category: 'Treatment',
    price: 5,
    steps: ['Foam cleanse', 'BHA toner', 'Niacinamide', 'Gel moisturizer'],
    products: ['Foaming cleanser', 'BHA toner', 'Niacinamide serum', 'Oil-free gel moisturizer'],
  },
  {
    id: 'redness-relief',
    title: 'Redness Relief',
    category: 'Treatment',
    price: 6,
    steps: ['Lukewarm rinse', 'Fragrance-free cleanser', 'Centella serum', 'Barrier cream'],
    products: ['Fragrance-free cleanser', 'Centella asiatica serum', 'Barrier repair cream'],
  },
  {
    id: 'dollarama-budget',
    title: 'Dollarama Budget Routine',
    category: 'Budget',
    price: 3,
    steps: ['Micellar water', 'Hydrating lotion', 'Petroleum jelly (PM)', 'Drugstore SPF (AM)'],
    products: ['Micellar water', 'Basic hydrating lotion', 'Petroleum jelly', 'Drugstore SPF'],
  },
  {
    id: '5min-morning',
    title: '5-Minute Morning',
    category: 'Daily',
    price: 3,
    steps: ['Splash water', 'Tinted moisturizer + SPF', 'Lip balm'],
    products: ['Tinted moisturizer with SPF', 'Hydrating lip balm'],
  },
  {
    id: 'post-workout',
    title: 'Post-Workout Reset',
    category: 'Recovery',
    price: 4,
    steps: ['Gel cleanse', 'Hydrating mist', 'Lightweight serum', 'Gel moisturizer'],
    products: ['Gel cleanser', 'Hydrating facial mist', 'Lightweight hyaluronic serum', 'Gel moisturizer'],
  },
  {
    id: 'winter-protection',
    title: 'Winter Protection',
    category: 'Seasonal',
    price: 5,
    steps: ['Cream cleanse', 'Hydrating toner', 'Squalane oil', 'Rich moisturizer', 'Mineral SPF'],
    products: ['Cream cleanser', 'Hydrating toner', 'Squalane oil', 'Rich barrier moisturizer', 'Mineral SPF'],
  },
];

const CATEGORIES = ['All', 'Daily', 'Night', 'Treatment', 'Budget', 'Recovery', 'Seasonal'];

export function LexiRoutinesMarketplacePage() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Routine | null>(null);

  const filtered = filter === 'All' ? ROUTINES : ROUTINES.filter((r) => r.category === filter);

  return (
    <div className="bg-gradient-to-b from-rose-50/30 to-white min-h-screen">
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-serif text-gray-900 mb-4">Routines Marketplace</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse 10+ carefully crafted routines. Free and affordable options for every skin type.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                filter === cat
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-gray-700 border border-rose-200 hover:border-rose-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="text-left bg-white rounded-2xl border border-rose-100 p-6 hover:shadow-lg hover:border-rose-300 transition-all group"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-5xl font-serif text-rose-300">{r.title[0]}</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                  <Tag size={10} />
                  {r.category}
                </span>
                <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                  <Clock size={10} />
                  {r.steps.length} steps
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">{r.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-rose-600">
                  {r.price === 0 ? 'Free' : `$${r.price}`}
                </span>
                <ChevronRight className="text-gray-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" size={18} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full mb-2">
                  {selected.category}
                </span>
                <h2 className="text-3xl font-serif text-gray-900">{selected.title}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-600">
                {selected.price === 0 ? 'Free' : `$${selected.price}`}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">Steps</h3>
            <ol className="space-y-3 mb-6">
              {selected.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-gray-800 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>

            <h3 className="font-semibold text-gray-900 mb-3">Products</h3>
            <ul className="space-y-2 mb-6">
              {selected.products.map((p) => (
                <li key={p} className="text-sm text-gray-700 pl-4 border-l-2 border-rose-200 py-1">
                  {p}
                </li>
              ))}
            </ul>

            <button className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-full transition-colors">
              {selected.price === 0 ? 'Get Free Access' : `Unlock for $${selected.price}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
