import { X, MapPin, Clock, ExternalLink } from 'lucide-react';
import { CivicSeverityBadge } from './CivicSeverityBadge';

type Severity = 'green' | 'amber' | 'red';

type Props = {
  title: string;
  type: string;
  location?: string;
  description: string;
  severity: Severity;
  timestamp?: string;
  details?: { label: string; value: string }[];
  onClose: () => void;
};

export function CivicDetailCard({ title, type, location, description, severity, timestamp, details, onClose }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">{type}</span>
            <CivicSeverityBadge severity={severity} />
          </div>
          <h3 className="text-sm font-bold text-white truncate">{title}</h3>
          {location && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={9} className="text-gray-500" />
              <span className="text-[10px] text-gray-500">{location}</span>
            </div>
          )}
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-xs text-gray-300 leading-relaxed">{description}</p>

        {details && details.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {details.map((d) => (
              <div key={d.label} className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-0">
                <span className="text-[10px] text-gray-500">{d.label}</span>
                <span className="text-[10px] text-white font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        {timestamp && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-800">
            <Clock size={9} className="text-gray-600" />
            <span className="text-[9px] text-gray-600">{timestamp}</span>
          </div>
        )}
      </div>
    </div>
  );
}
