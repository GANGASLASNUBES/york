import React from 'react';
import { Download } from 'lucide-react';

const SAMPLE_DOWNLOADS = [
  {
    id: '1',
    label: '30-Day Skincare Routine Guide',
    price: 19.99,
    description: 'Complete month-long skincare transformation plan',
  },
  {
    id: '2',
    label: 'Natural Makeup Techniques PDF',
    price: 14.99,
    description: 'Step-by-step guide to achieving natural makeup looks',
  },
  {
    id: '3',
    label: 'Wellness Habit Tracker',
    price: 9.99,
    description: 'Digital tracker for beauty & wellness routines',
  },
  {
    id: '4',
    label: 'Ingredient Glossary',
    price: 12.99,
    description: 'Complete guide to skincare ingredients',
  },
];

export function LexiDownloadsPage() {
  const downloads = SAMPLE_DOWNLOADS;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Digital Downloads</h1>
        <p className="text-lg text-gray-600">Beauty routines, guides, templates & resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {downloads.map((download) => (
          <div
            key={download.id}
            className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow border border-gray-200 flex flex-col"
          >
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-32 flex items-center justify-center">
              <Download className="text-purple-400" size={48} />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{download.label}</h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">{download.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-2xl font-bold text-pink-600">
                  ${download.price.toFixed(2)}
                </span>
                <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2">
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
