import { Radio, Wifi } from 'lucide-react';

interface HudSession {
  _id: string;
  _creationTime: number;
  deviceId: string;
  userId: string;
  lastSeenAt: number;
  mode: 'contacts' | 'sites' | 'provenance' | 'rituals';
}

interface HudStatusBarProps {
  session?: HudSession;
  isConnected?: boolean;
  mode?: string;
  onModeChange?: (mode: string) => void;
}

const modes = [
  { id: 'contacts', label: 'Contacts', icon: '👥' },
  { id: 'sites', label: 'Sites', icon: '📍' },
  { id: 'provenance', label: 'Provenance', icon: '📦' },
  { id: 'rituals', label: 'Rituals', icon: '📚' },
];

export function HudStatusBar({
  session,
  isConnected = false,
  mode = 'contacts',
  onModeChange,
}: HudStatusBarProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className={isConnected ? 'text-green-500' : 'text-gray-400'} size={20} />
            <span className="text-sm font-medium text-gray-900">
              HUD: {session?.deviceId || 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Wifi size={14} />
            {isConnected ? 'Connected' : 'Offline'}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Last seen: {session?.lastSeenAt ? new Date(session.lastSeenAt).toLocaleTimeString() : 'N/A'}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {modes.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onModeChange?.(id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === id
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
