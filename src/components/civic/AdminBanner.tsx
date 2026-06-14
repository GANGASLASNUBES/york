import { TriangleAlert as AlertTriangle } from 'lucide-react';

export function AdminBanner() {
  return (
    <div className="bg-orange-950/60 border-b border-orange-800/40 px-4 py-1.5 flex items-center justify-center gap-2 shrink-0">
      <AlertTriangle size={11} className="text-orange-400" />
      <span className="text-[10px] font-medium text-orange-300">
        ADMIN MODE -- Changes affect the entire civic platform.
      </span>
    </div>
  );
}
