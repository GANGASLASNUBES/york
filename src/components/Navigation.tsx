import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useConvexAuth } from '../lib/auth-context';
import { Hop as Home, MessageSquare, Settings, LogOut, Zap, Anchor, Grid2x2 as Grid } from 'lucide-react';

export function Navigation() {
  const { user, isAdmin } = useAuth();
  const { signOut } = useConvexAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getThemeColor = () => {
    switch (user?.theme) {
      case 'spark':
        return 'bg-orange-100 text-orange-900';
      case 'anchor':
        return 'bg-teal-100 text-teal-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  return (
    <nav className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className={`p-4 ${getThemeColor()}`}>
        <div className="flex items-center gap-2 mb-2">
          {user?.role === 'admin' && <Grid size={20} />}
          {user?.theme === 'spark' && <Zap size={20} />}
          {user?.theme === 'anchor' && <Anchor size={20} />}
        </div>
        <h1 className="text-xl font-bold">BIPS</h1>
        <p className="text-sm opacity-75">{user?.name || 'Loading...'}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <NavLink to="/" icon={Home} label="Home" active={isActive('/')} />
        <NavLink to="/chat" icon={MessageSquare} label="Chat" active={isActive('/chat')} />

        {isAdmin && (
          <>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Admin</p>
              <NavLink to="/admin" icon={Settings} label="Control Center" active={isAdmin && isActive('/admin')} />
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
}

function NavLink({ to, icon: Icon, label, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-100 text-blue-900'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
