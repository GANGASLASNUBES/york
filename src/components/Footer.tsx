import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Github, Twitter, Instagram, Youtube } from 'lucide-react';
import { TAGLINE } from '../lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Logo size="sm" />
            <p className="text-gray-400 mt-4 text-sm">{TAGLINE}</p>
            <div className="flex gap-4 mt-6">
              <a
                href="https://github.com/bips"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-500 transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com/bips"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-500 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com/bips"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-500 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://youtube.com/bips"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-500 transition-colors"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/art" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Art Gallery
                </Link>
              </li>
              <li>
                <Link to="/clothing" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Clothing
                </Link>
              </li>
              <li>
                <Link to="/gear" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Gaming Gear
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link to="/creator" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Creator Studio
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} ᗺIPS Ecosystem. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
