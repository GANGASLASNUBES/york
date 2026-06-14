import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Menu, X, LogIn, LogOut, User, Cloud, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/auth';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/art', label: 'Art' },
    { path: '/clothing', label: 'Clothing' },
    { path: '/gear', label: 'Gear' },
    { path: '/creator', label: 'Creator Studio' },
    { path: '/creator/clothing', label: 'Clothing Creator' },
    { path: '/advertising', label: 'Advertising' },
    { path: '/advertising/m365', label: 'M365' },
    { path: '/mobile-store', label: 'Mobile' },
    { path: '/about', label: 'About' },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors text-sm ${
                  isActive(item.path)
                    ? 'text-amber-500'
                    : 'text-gray-300 hover:text-amber-500'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 hover:border-gray-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <User size={14} className="text-amber-500" />
                  </div>
                  <span className="hidden sm:block text-sm text-gray-300 max-w-[120px] truncate">
                    {profile?.display_name || user.email?.split('@')[0]}
                  </span>
                  {profile?.ms_connected && (
                    <Cloud size={14} className="text-green-500" />
                  )}
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-800">
                      <p className="font-semibold text-sm truncate">{profile?.display_name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      {profile?.ms_connected && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Cloud size={12} className="text-green-500" />
                          <span className="text-xs text-green-400">{profile.ms_account_email}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      {!profile?.ms_connected && (
                        <Link
                          to="/advertising/m365"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-300"
                        >
                          <Cloud size={16} className="text-gray-500" />
                          Connect Microsoft 365
                        </Link>
                      )}
                      {profile?.ms_connected && (
                        <Link
                          to="/advertising/m365"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-300"
                        >
                          <Cloud size={16} className="text-green-500" />
                          Manage M365
                        </Link>
                      )}
                      <Link
                        to="/advertising/assets"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-300"
                      >
                        <User size={16} className="text-gray-500" />
                        Asset Library
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-900/30 transition-colors text-sm text-red-400"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg">
                  <User size={14} />
                  <span>Guest Mode</span>
                </div>
                <Link
                  to="/auth"
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:block">Sign In</span>
                </Link>
              </div>
            )}

            <button
              className="lg:hidden text-gray-300 hover:text-amber-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-800">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block py-3 font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-amber-500'
                    : 'text-gray-300 hover:text-amber-500'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
