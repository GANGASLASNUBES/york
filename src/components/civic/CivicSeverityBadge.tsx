import { Circle } from 'lucide-react';

type Severity = 'green' | 'amber' | 'red';

const severityConfig: Record<Severity, { bg: string; text: string; dot: string; label: string }> = {
  green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'fill-emerald-400 text-emerald-400', label: 'Normal' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'fill-amber-400 text-amber-400', label: 'Warning' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'fill-red-400 text-red-400', label: 'Critical' },
};

type Props = {
  severity: Severity;
  label?: string;
  compact?: boolean;
};

export function CivicSeverityBadge({ severity, label, compact = false }: Props) {
  const config = severityConfig[severity];

  if (compact) {
    return <Circle size={6} className={config.dot} />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config.bg}`}>
      <Circle size={6} className={config.dot} />
      <span className={`text-[10px] font-medium ${config.text}`}>{label || config.label}</span>
    </span>
  );
}
