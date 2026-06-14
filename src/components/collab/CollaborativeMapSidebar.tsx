import { Users, MapPin, Route, Layers } from 'lucide-react';

export type CollabMember = {
  id: string;
  email: string;
  role: 'view' | 'pin' | 'edit' | 'manage';
  accepted: boolean;
};

export type CollabPin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
  userName: string;
};

type Props = {
  members: CollabMember[];
  pins: CollabPin[];
  overlays: string[];
  onInvite: () => void;
};

export default function CollaborativeMapSidebar({ members, pins, overlays, onInvite }: Props) {
  return (
    <div className="w-64 bg-gray-900/95 border-l border-gray-800 h-full flex flex-col overflow-hidden">
      {/* Members section */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Users size={11} className="text-gray-400" />
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Members</h3>
          </div>
          <button
            onClick={onInvite}
            className="text-[9px] text-cyan-400 hover:text-cyan-300 font-medium"
          >
            + Invite
          </button>
        </div>
        <div className="space-y-1.5 max-h-28 overflow-y-auto">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between">
              <span className="text-[10px] text-gray-300 truncate max-w-[120px]">{m.email}</span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded ${
                m.role === 'manage' ? 'bg-amber-900/40 text-amber-300' :
                m.role === 'edit' ? 'bg-cyan-900/40 text-cyan-300' :
                m.role === 'pin' ? 'bg-emerald-900/40 text-emerald-300' :
                'bg-gray-800 text-gray-400'
              }`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Overlays section */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers size={11} className="text-gray-400" />
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Overlays</h3>
        </div>
        <div className="flex flex-wrap gap-1">
          {overlays.map((o) => (
            <span key={o} className="text-[9px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded capitalize">
              {o.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Pins section */}
      <div className="p-3 flex-1 overflow-y-auto">
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin size={11} className="text-gray-400" />
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pins ({pins.length})</h3>
        </div>
        <div className="space-y-1.5">
          {pins.map((p) => (
            <div key={p.id} className="bg-gray-800/50 rounded-lg px-2.5 py-1.5">
              <p className="text-[10px] text-gray-200 font-medium truncate">{p.title}</p>
              <p className="text-[9px] text-gray-500">{p.userName} -- {p.category}</p>
            </div>
          ))}
          {pins.length === 0 && (
            <p className="text-[10px] text-gray-600 text-center py-4">No pins yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
