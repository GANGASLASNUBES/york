import React, { useState } from 'react';
import { Heart, ChevronDown } from 'lucide-react';

interface Routine {
  id: string;
  title: string;
  category: 'skincare' | 'makeup' | 'wellness';
  duration: number;
  steps: string[];
  tips: string[];
}

const SAMPLE_ROUTINES: Routine[] = [
  {
    id: '1',
    title: 'Morning Glow Routine',
    category: 'skincare',
    duration: 10,
    steps: [
      'Cleanse with gentle facial wash',
      'Apply toner to balance pH',
      'Use hydrating serum',
      'Apply moisturizer with SPF 30+',
    ],
    tips: ['Use warm water for cleansing', 'Pat dry, don\'t rub', 'Apply SPF every day'],
  },
  {
    id: '2',
    title: 'Evening Wind Down',
    category: 'wellness',
    duration: 15,
    steps: [
      'Start with 5 minutes of deep breathing',
      'Prepare herbal tea',
      'Apply face mask',
      'Journal for 5 minutes',
      'Light stretching',
    ],
    tips: ['Consistency is key', 'Dim the lights', 'Put phone away'],
  },
  {
    id: '3',
    title: 'Natural Makeup Look',
    category: 'makeup',
    duration: 12,
    steps: [
      'Prime face with hydrating primer',
      'Apply foundation with damp sponge',
      'Conceal under eyes and blemishes',
      'Cream blush on cheeks and lips',
      'Soft mascara on upper lashes',
    ],
    tips: ['Less is more', 'Blend everything', 'Use cream products for natural look'],
  },
];

export function LexiRoutinesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Beauty Routines</h1>
        <p className="text-lg text-gray-600">Skincare, makeup & wellness guides curated by Lexi</p>
      </div>

      <div className="space-y-4">
        {SAMPLE_ROUTINES.map((routine) => (
          <div
            key={routine.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => setExpandedId(expandedId === routine.id ? null : routine.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="text-pink-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{routine.title}</h3>
                  <p className="text-sm text-gray-600">
                    {routine.category} • {routine.duration} min
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`transition-transform text-gray-400 ${
                  expandedId === routine.id ? 'rotate-180' : ''
                }`}
                size={24}
              />
            </button>

            {expandedId === routine.id && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Steps</h4>
                  <ol className="space-y-2">
                    {routine.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-gray-700">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-600 text-white text-sm flex items-center justify-center font-semibold">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Pro Tips</h4>
                  <ul className="space-y-2">
                    {routine.tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 text-gray-700">
                        <span className="text-pink-600 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
