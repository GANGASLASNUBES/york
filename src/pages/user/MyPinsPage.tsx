import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Plus, Circle, Trash2 } from 'lucide-react';
import { CivicSeverityBadge } from '../../components/civic/CivicSeverityBadge';

type UserPin = {
  id: string;
  title: string;
  category: string;
  type: 'public' | 'private' | 'gear' | 'story';
  severity: 'green' | 'amber' | 'red' | null;
  lat: number;
  lng: number;
  createdAt: string;
};

const MY_PINS: UserPin[] = [
  { id: '1', title: 'Safe Rest Spot - Berri', category: 'safety', type: 'public', severity: 'green', lat: 45.5120, lng: -73.5540, createdAt: '2 hours ago' },
  { id: '2', title: 'Glass on De Maisonneuve', category: 'safety', type: 'public', severity: 'amber', lat: 45.5100, lng: -73.5650, createdAt: '5 hours ago' },
  { id: '3', title: 'Favorite Coffee Shop', category: 'food', type: 'private', severity: null, lat: 45.5195, lng: -73.5721, createdAt: '2 days ago' },
  { id: '4', title: 'Best Mural Photo Angle', category: 'art', type: 'story', severity: null, lat: 45.5244, lng: -73.5692, createdAt: '3 days ago' },
  { id: '5', title: 'Warming Spot for BIPS Gear', category: 'safety', type: 'gear', severity: 'green', lat: 45.5017, lng: -73.5673, createdAt: '1 week ago' },
];

const typeColors: Record<string, string> = {
  public: 'text-blue-400 bg-blue-900/20',
  private: 'text-gray-400 bg-gray-800',
  gear: 'text-orange-400 bg-orange-900/20',
  story: 'text-amber-400 bg-amber-900/20',
};

export function MyPinsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <MapPin size={16} className="text-emerald-400" />
            <h1 className="text-sm font-bold">My Pins</h1>
            <span className="text-[9px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{MY_PINS.length}</span>
          </div>
          <button
            onClick={() => navigate('/bips/civic-intel')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-medium transition-colors"
          >
            <Plus size={12} />
            New Pin
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-2">
          {MY_PINS.map((pin) => (
            <div key={pin.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-white truncate">{pin.title}</h3>
                  {pin.severity && <CivicSeverityBadge severity={pin.severity} compact />}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[9px] text-gray-500">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${typeColors[pin.type]}`}>{pin.type}</span>
                  <span>{pin.category}</span>
                  <span>{pin.createdAt}</span>
                </div>
              </div>
              <button className="text-gray-600 hover:text-red-400 transition-colors p-1">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
