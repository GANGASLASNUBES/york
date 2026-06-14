import { Shield, Circle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CivicSearchBar, type SearchResult } from '../../components/civic/CivicSearchBar';
import { CivicSeverityBadge } from '../../components/civic/CivicSeverityBadge';
import { UserModeBadge } from '../../components/civic/UserModeBadge';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useAuth } from '../../hooks/useAuth';
import { isAdmin } from '../../lib/auth/guards';

type Props = {
  storyMode: boolean;
  onToggleStoryMode: () => void;
  onSearchSelect: (result: SearchResult) => void;
};

export default function TopBar({ storyMode, onToggleStoryMode, onSearchSelect }: Props) {
  const { t } = useTranslation();
  const { isAuthenticated: authed, user, session } = useAuth();
  const mode = isAdmin(session) ? 'admin' : authed ? 'authenticated' : 'public';

  return (
    <div className="h-14 bg-gray-900/95 border-b border-gray-800 flex items-center justify-between px-4 z-30 backdrop-blur shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
          <Shield size={14} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold flex items-center gap-2">
            {t('commandCenter.title')}
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-900/40 rounded-full">
              <Circle size={5} className="text-emerald-400 fill-emerald-400 animate-pulse" />
              <span className="text-[8px] text-emerald-400 font-medium">LIVE</span>
            </span>
          </h1>
        </div>
      </div>

      <div className="hidden md:block flex-1 max-w-md mx-4">
        <CivicSearchBar onSelect={onSearchSelect} />
      </div>

      <div className="flex items-center gap-3">
        <UserModeBadge mode={mode} userName={user?.user_metadata?.display_name} />
        <div className="hidden sm:flex items-center gap-2">
          <CivicSeverityBadge severity="green" label="16" />
          <CivicSeverityBadge severity="amber" label="3" />
          <CivicSeverityBadge severity="red" label="1" />
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <Clock size={10} />
          <span className="hidden sm:inline">{new Date().toLocaleTimeString()}</span>
        </div>
        <LanguageSwitcher compact />
        <button
          onClick={onToggleStoryMode}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            storyMode ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50' : 'bg-gray-800 text-gray-500'
          }`}
        >
          {t('commandCenter.stories')}
        </button>
      </div>
    </div>
  );
}
