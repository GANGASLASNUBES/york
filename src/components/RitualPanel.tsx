import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Scroll } from 'lucide-react';

export function RitualPanel() {
  const rituals = useQuery(api.rituals.getRituals);

  if (!rituals) {
    return <div className="p-4 text-gray-500">Loading rituals...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Scroll size={20} className="text-amber-600" />
        <h2 className="text-lg font-semibold text-gray-900">Rituals</h2>
      </div>

      <div className="space-y-3">
        {rituals.length === 0 ? (
          <p className="text-sm text-gray-500">No rituals yet</p>
        ) : (
          rituals.map((ritual) => (
            <div key={ritual._id} className="border-l-4 border-amber-200 pl-3 py-2">
              <h3 className="font-medium text-gray-900">{ritual.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{ritual.body}</p>
              <div className="mt-2 flex gap-2">
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded">
                  {ritual.scope}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
