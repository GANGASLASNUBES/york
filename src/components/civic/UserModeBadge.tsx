import { User, Shield, Globe } from 'lucide-react';

type Mode = 'public' | 'authenticated' | 'admin';

type Props = {
  mode: Mode;
  userName?: string;
};

export function UserModeBadge({ mode, userName }: Props) {
  if (mode === 'admin') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-900/30 border border-orange-700/40 rounded-lg">
        <Shield size={10} className="text-orange-400" />
        <span className="text-[9px] font-medium text-orange-300">ADMIN</span>
      </div>
    );
  }

  if (mode === 'authenticated') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-900/30 border border-emerald-700/40 rounded-lg">
        <User size={10} className="text-emerald-400" />
        <span className="text-[9px] font-medium text-emerald-300 truncate max-w-[80px]">
          {userName || 'Signed In'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg">
      <Globe size={10} className="text-gray-400" />
      <span className="text-[9px] font-medium text-gray-400">PUBLIC</span>
    </div>
  );
}
