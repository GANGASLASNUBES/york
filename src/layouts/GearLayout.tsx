import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Zap, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDomain } from '../context/DomainContext';

interface GearLayoutProps {
  children: React.ReactNode;
}

export function GearLayout({ children }: GearLayoutProps) {
  const { logout: logoutFromAuth } = useAuth();
  const { config } = useDomain();

  const handleLogout = async () => {
    logoutFromAuth?.();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">BIPS Gear</h1>
            <p className="text-sm text-gray-400">Hardware · Accessories · Field Kits</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 py-3 overflow-x-auto">
          <Link
            to="/catalog"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-blue-500 text-blue-400 whitespace-nowrap transition-colors hover:text-blue-300"
          >
            <Package size={20} />
            Catalog
          </Link>
          <Link
            to="/field-kits"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent text-gray-400 whitespace-nowrap transition-colors hover:text-gray-300"
          >
            <Zap size={20} />
            Field Kits
          </Link>
          <Link
            to="/ar-accessories"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent text-gray-400 whitespace-nowrap transition-colors hover:text-gray-300"
          >
            <Shield size={20} />
            AR Accessories
          </Link>
          <Link
            to="/analytics"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent text-gray-400 whitespace-nowrap transition-colors hover:text-gray-300"
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
      <footer className="mt-20 border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-white mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-gray-200 transition-colors">Wheels</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Headsets</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Controllers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Specs</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-gray-200 transition-colors">Performance</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Compatibility</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Reviews</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-gray-200 transition-colors">Setup Guide</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Warranty</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-gray-200 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>© 2026 BIPS Gear. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
