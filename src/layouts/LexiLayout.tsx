import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Download, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDomain } from '../context/DomainContext';

interface LexiLayoutProps {
  children: React.ReactNode;
}

export function LexiLayout({ children }: LexiLayoutProps) {
  const { logout: logoutFromAuth } = useAuth();
  const { config } = useDomain();

  const handleLogout = async () => {
    logoutFromAuth?.();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef8fb' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: config?.branding.secondaryColor || '#ffe6f2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {config?.branding.logoUrl && (
              <img src={config.branding.logoUrl} alt="Lexi Rose" className="h-10" />
            )}
            <div>
              <h1 className="text-2xl font-bold" style={{ color: config?.branding.primaryColor || '#ff4da6' }}>
                Lexi Rose
              </h1>
              <p className="text-sm" style={{ color: config?.branding.primaryColor }}>
                Beauty · Creative · Lifestyle
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: config?.branding.primaryColor || '#ff4da6', color: 'white' }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: config?.branding.secondaryColor || '#ffe6f2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 py-3 overflow-x-auto">
          <Link
            to="/"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 transition-colors hover:opacity-80 whitespace-nowrap"
            style={{
              color: config?.branding.primaryColor,
              borderColor: config?.branding.primaryColor,
            }}
          >
            <Sparkles size={20} />
            Featured
          </Link>
          <Link
            to="/products"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent transition-colors hover:opacity-80 text-gray-600 whitespace-nowrap"
            style={{ color: config?.branding.primaryColor + '80' }}
          >
            <ShoppingBag size={20} />
            Products
          </Link>
          <Link
            to="/downloads"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent transition-colors hover:opacity-80 text-gray-600 whitespace-nowrap"
            style={{ color: config?.branding.primaryColor + '80' }}
          >
            <Download size={20} />
            Downloads
          </Link>
          <Link
            to="/routines"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent transition-colors hover:opacity-80 text-gray-600 whitespace-nowrap"
            style={{ color: config?.branding.primaryColor + '80' }}
          >
            <Heart size={20} />
            Routines
          </Link>
          <Link
            to="/admin"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent transition-colors hover:opacity-80 text-gray-600 whitespace-nowrap"
            style={{ color: config?.branding.primaryColor + '80' }}
          >
            Admin
          </Link>
          <Link
            to="/analytics"
            className="flex items-center gap-2 font-medium pb-3 border-b-2 border-transparent transition-colors hover:opacity-80 text-gray-600 whitespace-nowrap"
            style={{ color: config?.branding.primaryColor + '80' }}
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
      <footer className="mt-20 border-t" style={{ borderColor: config?.branding.secondaryColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4" style={{ color: config?.branding.primaryColor }}>
                About
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Lexi's Story</a></li>
                <li><a href="#" className="hover:underline">Creative Process</a></li>
                <li><a href="#" className="hover:underline">Press Kit</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ color: config?.branding.primaryColor }}>
                Connect
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Instagram</a></li>
                <li><a href="#" className="hover:underline">TikTok</a></li>
                <li><a href="#" className="hover:underline">YouTube</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ color: config?.branding.primaryColor }}>
                Support
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">FAQ</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
                <li><a href="#" className="hover:underline">Shipping</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4" style={{ color: config?.branding.primaryColor }}>
                Legal
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Privacy</a></li>
                <li><a href="#" className="hover:underline">Terms</a></li>
                <li><a href="#" className="hover:underline">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-gray-600">
            <p>© 2026 Lexi Rose. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
