import { MapPin, CreditCard as Edit3, Route, Users, Clock } from 'lucide-react';

export type ActivityEvent = {
  id: string;
  type: 'pin_added' | 'pin_edited' | 'trail_updated' | 'member_joined' | 'map_edited';
  userName: string;
  description: string;
  timestamp: string;
};

type Props = {
  events: ActivityEvent[];
};

function getIcon(type: ActivityEvent['type']) {
  switch (type) {
    case 'pin_added': return <MapPin size={10} className="text-emerald-400" />;
    case 'pin_edited': return <Edit3 size={10} className="text-cyan-400" />;
    case 'trail_updated': return <Route size={10} className="text-amber-400" />;
    case 'member_joined': return <Users size={10} className="text-teal-400" />;
    case 'map_edited': return <Edit3 size={10} className="text-gray-400" />;
  }
}

export default function CollaborativeMapActivityFeed({ events }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Clock size={11} className="text-gray-400" />
        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Activity</h3>
      </div>
      {events.length === 0 && (
        <p className="text-[10px] text-gray-600 text-center py-4">No recent activity</p>
      )}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {events.map((e) => (
          <div key={e.id} className="flex items-start gap-2 bg-gray-800/30 rounded-lg px-2.5 py-2">
            <div className="mt-0.5">{getIcon(e.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-300">
                <span className="font-medium text-white">{e.userName}</span>{' '}
                {e.description}
              </p>
              <p className="text-[9px] text-gray-600">{e.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
