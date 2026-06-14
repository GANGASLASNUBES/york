import { Check, Package, Sparkles, Heart } from 'lucide-react';

type Bundle = {
  slug: string;
  title: string;
  price: number;
  description: string;
  includes: string[];
  icon: typeof Package;
  accent: string;
};

const BUNDLES: Bundle[] = [
  {
    slug: 'everyday-glow',
    title: 'The Everyday Glow Kit',
    price: 29,
    description: 'A simple, affordable routine for daily radiance.',
    includes: [
      'Morning routine',
      'Night routine',
      'Product list (budget-friendly)',
      '2-minute quick-prep guide',
    ],
    icon: Sparkles,
    accent: 'rose',
  },
  {
    slug: 'event-ready',
    title: 'Event-Ready Beauty Kit',
    price: 39,
    description: 'Look flawless for photos, events, and nights out.',
    includes: [
      'Pre-event skin prep',
      'Makeup base routine',
      'Shine-control guide',
      'Product list (mid-range)',
    ],
    icon: Package,
    accent: 'amber',
  },
  {
    slug: 'reset-kit',
    title: 'The Reset Kit',
    price: 24,
    description: 'A recovery routine for stressed, tired, or irritated skin.',
    includes: [
      'Skin reset routine',
      'Hydration protocol',
      'Redness-reduction guide',
      'Product list (gentle formulas)',
    ],
    icon: Heart,
    accent: 'pink',
  },
];

const accentMap: Record<string, { bg: string; text: string; border: string; button: string }> = {
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
    button: 'bg-rose-600 hover:bg-rose-700',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    button: 'bg-amber-600 hover:bg-amber-700',
  },
  pink: {
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
    button: 'bg-pink-600 hover:bg-pink-700',
  },
};

export function LexiBundlesPage() {
  return (
    <div className="bg-gradient-to-b from-rose-50/30 to-white min-h-screen">
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-serif text-gray-900 mb-4">Beauty Bundles</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Curated collections of routines, guides, and product lists. Pick a kit and get started today.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {BUNDLES.map((bundle) => {
            const Icon = bundle.icon;
            const a = accentMap[bundle.accent];
            return (
              <div
                key={bundle.slug}
                className={`bg-white rounded-3xl border-2 ${a.border} p-8 hover:shadow-xl transition-shadow flex flex-col`}
              >
                <div className={`w-14 h-14 ${a.bg} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon className={a.text} size={26} />
                </div>
                <h2 className="text-2xl font-serif text-gray-900 mb-2">{bundle.title}</h2>
                <p className="text-gray-600 mb-5 leading-relaxed">{bundle.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${bundle.price}</span>
                  <span className="text-gray-500 ml-1">one-time</span>
                </div>

                <div className="mb-6 flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-3">What's included:</p>
                  <ul className="space-y-2">
                    {bundle.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <div className={`w-5 h-5 rounded-full ${a.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className={a.text} size={12} />
                        </div>
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={`w-full py-3 ${a.button} text-white font-semibold rounded-full transition-colors`}>
                  Get This Kit
                </button>

                <p className={`text-xs ${a.text} text-center mt-3 font-medium`}>
                  Glow Club members save 20%
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-gradient-to-r from-rose-100 to-pink-100 rounded-3xl p-10 text-center">
          <h3 className="text-2xl font-serif text-gray-900 mb-3">Want everything?</h3>
          <p className="text-gray-700 mb-6 max-w-xl mx-auto">
            Glow Club members get all bundles at a 20% discount — plus weekly routines, live sessions, and unlimited AI routines.
          </p>
          <a
            href="/glow-club"
            className="inline-block px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-full transition-colors"
          >
            Explore Glow Club
          </a>
        </div>
      </section>
    </div>
  );
}
