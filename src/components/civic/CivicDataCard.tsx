import { Clock } from 'lucide-react';
import { CivicSeverityBadge } from './CivicSeverityBadge';

type Severity = 'green' | 'amber' | 'red';

type Props = {
  title: string;
  value: string;
  timestamp?: string;
  severity: Severity;
  detail?: string;
  icon?: React.ReactNode;
};

export function CivicDataCard({ title, value, timestamp, severity, detail, icon }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-gray-400">{icon}</div>}
          <h4 className="text-xs font-semibold text-white">{title}</h4>
        </div>
        <CivicSeverityBadge severity={severity} />
      </div>
      <p className="text-sm font-bold text-white mt-1">{value}</p>
      {detail && <p className="text-[10px] text-gray-500 mt-1">{detail}</p>}
      {timestamp && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-800/50">
          <Clock size={9} className="text-gray-600" />
          <span className="text-[9px] text-gray-600">{timestamp}</span>
        </div>
      )}
    </div>
  );
}
