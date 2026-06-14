import { Users, MapPin, Archive, BookOpen, Radio, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const links = [
    { href: '/', label: 'Dashboard', icon: Radio },
    { href: '/contacts', label: 'Contacts', icon: Users },
    { href: '/sites', label: 'Sites', icon: MapPin },
    { href: '/provenance', label: 'Provenance', icon: Archive },
    { href: '/rituals', label: 'Rituals', icon: BookOpen },
    { href: '/hud', label: 'HUD', icon: Radio },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">BIPS v2.1</h1>
        <p className="text-sm text-gray-500 mt-1">Operational Ecosystem</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(href)
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
