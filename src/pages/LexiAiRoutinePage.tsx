import { useState } from 'react';
import { Sparkles, Loader as Loader2 } from 'lucide-react';

type GeneratedRoutine = {
  title: string;
  description: string;
  steps: Array<{ step: number; text: string }>;
  products: Array<{ name: string; link: string }>;
  estimatedCost: number;
};

const SKIN_OPTIONS = ['Dry', 'Oily', 'Combination', 'Sensitive'];

export function LexiAiRoutinePage() {
  const [skinType, setSkinType] = useState('Combination');
  const [budget, setBudget] = useState(80);
  const [timeMinutes, setTimeMinutes] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedRoutine | null>(null);

  const generate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const baseSteps: Record<string, string[]> = {
      dry: [
        'Cleanse with cream-based hydrating cleanser',
        'Apply hyaluronic acid serum on damp skin',
        'Pat in rich ceramide moisturizer',
        'Seal with facial oil (3-5 drops)',
        'Apply SPF 30+ (AM only)',
      ],
      oily: [
        'Cleanse with salicylic acid wash',
        'Tone with witch hazel or BHA toner',
        'Apply niacinamide serum',
        'Use oil-free gel moisturizer',
        'Mattifying SPF 30+ (AM only)',
      ],
      combination: [
        'Double cleanse: oil + gentle foaming',
        'Balance with hydrating toner',
        'Apply vitamin C serum (AM)',
        'Layer lightweight moisturizer',
        'Apply SPF 30+ (AM)',
      ],
      sensitive: [
        'Rinse with lukewarm water',
        'Cleanse with fragrance-free cleanser',
        'Apply centella or panthenol serum',
        'Moisturize with barrier-repair cream',
        'Mineral SPF 30+ (AM only)',
      ],
    };

    const stepCount = Math.max(3, Math.min(8, Math.floor(timeMinutes / 2)));
    const selected = (baseSteps[skinType.toLowerCase()] || baseSteps.combination).slice(0, stepCount);

    setResult({
      title: `AI Routine: ${skinType} skin, ${timeMinutes}min`,
      description: `Personalized ${stepCount}-step routine for ${skinType.toLowerCase()} skin within $${budget} budget.`,
      steps: selected.map((text, i) => ({ step: i + 1, text })),
      products: selected.map((_, i) => ({
        name: `Recommended product ${i + 1}`,
        link: `https://example.com/product/${i + 1}`,
      })),
      estimatedCost: Math.round((budget / stepCount) * stepCount),
    });
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-100 rounded-full text-rose-700 text-sm font-medium mb-4">
          <Sparkles size={14} />
          <span>AI-Powered</span>
        </div>
        <h1 className="text-4xl font-serif text-gray-900 mb-3">Routine Generator</h1>
        <p className="text-gray-600">Tell us about your skin and we'll build a personalized routine.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-rose-100 mb-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Skin Type</label>
            <div className="flex flex-wrap gap-2">
              {SKIN_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSkinType(opt)}
                  className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                    skinType === opt
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Budget: <span className="text-rose-600">${budget}</span>
            </label>
            <input
              type="range"
              min="20"
              max="300"
              step="10"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Time per Session: <span className="text-rose-600">{timeMinutes} min</span>
            </label>
            <input
              type="range"
              min="5"
              max="20"
              step="1"
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Generate My Routine
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-rose-100">
          <h2 className="text-2xl font-serif text-gray-900 mb-2">{result.title}</h2>
          <p className="text-gray-600 mb-6">{result.description}</p>
          <div className="mb-6 p-4 bg-rose-50 rounded-xl">
            <p className="text-sm text-rose-900">
              <span className="font-semibold">Estimated cost:</span> ${result.estimatedCost}
            </p>
          </div>
          <div className="space-y-3">
            {result.steps.map((step) => (
              <div key={step.step} className="flex gap-4 p-4 rounded-xl hover:bg-rose-50 transition-colors">
                <div className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                  {step.step}
                </div>
                <p className="text-gray-800 pt-1">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
