import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, ArrowLeft, Plus, Layers, MapPin, Route, MoveVertical as MoreVertical } from 'lucide-react';

type SavedMap = {
  id: string;
  name: string;
  description: string;
  overlayCount: number;
  pinCount: number;
  trailCount: number;
  isPublic: boolean;
  updatedAt: string;
};

const SAVED_MAPS: SavedMap[] = [
  { id: '1', name: 'My Montreal', description: 'Default map with all my saved overlays and pins', overlayCount: 8, pinCount: 12, trailCount: 2, isPublic: false, updatedAt: '2 hours ago' },
  { id: '2', name: 'Daily Commute', description: 'Traffic, transit, and street closures for my route', overlayCount: 3, pinCount: 4, trailCount: 1, isPublic: false, updatedAt: '1 day ago' },
  { id: '3', name: 'Art Discovery', description: 'Public art, murals, and galleries across the city', overlayCount: 2, pinCount: 8, trailCount: 1, isPublic: true, updatedAt: '3 days ago' },
  { id: '4', name: 'Safety Map', description: 'Shelters, Wi-Fi, parks, and safe rest spots', overlayCount: 4, pinCount: 6, trailCount: 1, isPublic: false, updatedAt: '1 week ago' },
];

export function MyMapsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <Map size={16} className="text-emerald-400" />
            <h1 className="text-sm font-bold">My Maps</h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-medium transition-colors">
            <Plus size={12} />
            New Map
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-3">
          {SAVED_MAPS.map((map) => (
            <div
              key={map.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors cursor-pointer"
              onClick={() => navigate('/bips/civic-intel')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white">{map.name}</h3>
                    {map.isPublic && (
                      <span className="text-[8px] bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded-full">Public</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">{map.description}</p>
                </div>
                <button className="text-gray-500 hover:text-white p-1">
                  <MoreVertical size={14} />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800/50 text-[10px] text-gray-500">
                <div className="flex items-center gap-1">
                  <Layers size={9} />
                  <span>{map.overlayCount} layers</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={9} />
                  <span>{map.pinCount} pins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Route size={9} />
                  <span>{map.trailCount} trails</span>
                </div>
                <span className="ml-auto">{map.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
