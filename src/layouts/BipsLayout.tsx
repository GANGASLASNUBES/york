import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, Scroll, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDomain } from '../context/DomainContext';

interface BipsLayoutProps {
  children: React.ReactNode;
}

export function BipsLayout({ children }: BipsLayoutProps) {
  const { logout: logoutFromAuth } = useAuth();
  const { config } = useDomain();

  const handleLogout = async () => {
    logoutFromAuth?.();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">BIPS</h1>
            <p className="text-sm text-gray-600">Be Iconic. Play Supreme.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 py-3 overflow-x-auto">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-blue-500 text-blue-600 whitespace-nowrap transition-colors hover:opacity-80"
          >
            <Zap size={20} />
            Dashboard
          </Link>
          <Link
            to="/contacts"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent text-gray-600 whitespace-nowrap transition-colors hover:text-gray-900"
          >
            <Users size={20} />
            Contacts
          </Link>
          <Link
            to="/sites"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent text-gray-600 whitespace-nowrap transition-colors hover:text-gray-900"
          >
            <MapPin size={20} />
            Sites
          </Link>
          <Link
            to="/provenance"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent text-gray-600 whitespace-nowrap transition-colors hover:text-gray-900"
          >
            <Scroll size={20} />
            Provenance
          </Link>
          <Link
            to="/analytics"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent text-gray-600 whitespace-nowrap transition-colors hover:text-gray-900"
          >
            Analytics
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Network</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Status</a></li>
                <li><a href="#" className="hover:underline">Health</a></li>
                <li><a href="#" className="hover:underline">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Tools</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">HUD</a></li>
                <li><a href="#" className="hover:underline">Devices</a></li>
                <li><a href="#" className="hover:underline">Hardware</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Guides</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Getting Started</a></li>
                <li><a href="#" className="hover:underline">Documentation</a></li>
                <li><a href="#" className="hover:underline">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Privacy</a></li>
                <li><a href="#" className="hover:underline">Terms</a></li>
                <li><a href="#" className="hover:underline">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>© 2026 BIPS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
