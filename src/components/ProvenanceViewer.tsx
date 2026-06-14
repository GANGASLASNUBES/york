import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Sparkles } from 'lucide-react';

export function ProvenanceViewer() {
  const provenance = useQuery(api.provenance.getProvenanceForUser);

  if (!provenance) {
    return <div className="p-4 text-gray-500">Loading artifacts...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">Artifacts</h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {provenance.length === 0 ? (
          <p className="text-sm text-gray-500">No artifacts yet</p>
        ) : (
          provenance.map((obj) => (
            <div key={obj._id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
              {obj.imageUrl && (
                <img
                  src={obj.imageUrl}
                  alt={obj.label}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-medium text-gray-900">{obj.label}</h3>
              {obj.description && (
                <p className="text-sm text-gray-600 mt-1">{obj.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">{obj.type}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
