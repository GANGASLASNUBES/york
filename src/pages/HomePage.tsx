import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Zap, Heart, Palette, BookOpen, ShoppingBag } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-600" />
            <h1 className="text-2xl font-bold text-gray-900">LexiRose.ca</h1>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block px-4 py-2 bg-rose-100 rounded-full">
            <span className="text-sm font-semibold text-rose-700">Welcome to LexiRose.ca</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Beauty, Creativity & Community
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Explore curated beauty collections, engage with transformative content, and discover a community of creative professionals and enthusiasts.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition-all hover:shadow-lg flex items-center gap-2"
            >
              Enter Portal <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-lg font-semibold hover:border-rose-300 hover:bg-rose-50 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-16">What We Offer</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Palette,
                title: 'Design Studio',
                description: 'Create, customize, and collaborate on makeup designs with our advanced editor and community.',
                color: 'from-purple-400 to-pink-600',
              },
              {
                icon: ShoppingBag,
                title: 'Gamewear & Products',
                description: 'Shop curated collections of beauty products, gaming apparel, and exclusive merchandise.',
                color: 'from-rose-400 to-orange-600',
              },
              {
                icon: BookOpen,
                title: 'Educational Content',
                description: 'Access tutorials, guides, and digital downloads to master makeup artistry and styling.',
                color: 'from-blue-400 to-cyan-600',
              },
              {
                icon: Heart,
                title: 'Community Connection',
                description: 'Connect with other makeup artists, share work, and build lasting professional relationships.',
                color: 'from-red-400 to-rose-600',
              },
              {
                icon: Zap,
                title: 'Quick Booking',
                description: 'Schedule makeup services, consultations, and personalized sessions with flexible scheduling.',
                color: 'from-amber-400 to-yellow-600',
              },
              {
                icon: Star,
                title: 'Affiliate Network',
                description: 'Earn commissions by sharing products and services you love with your audience.',
                color: 'from-green-400 to-emerald-600',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group">
                  <div className="relative h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <div className="relative p-8 rounded-xl bg-white border border-gray-200 group-hover:border-gray-300 transition-all group-hover:shadow-lg h-full">
                      <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-6`}>
                        <Icon className="w-full h-full text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-16">Premium Services</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Professional Makeup Services</h4>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-gray-700">Bridal & Event Makeup</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-gray-700">Special Effects & Artistry</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-gray-700">Consultations & Personalized Training</span>
                </li>
              </ul>
              <button className="text-rose-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Book Now <ArrowRight size={18} />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Digital Products & Downloads</h4>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-gray-700">Makeup Tutorials & Guides</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-gray-700">Style & Color Theory PDFs</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-gray-700">Exclusive Behind-the-Scenes Content</span>
                </li>
              </ul>
              <button className="text-amber-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Explore Library <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-gradient-to-r from-rose-500 to-pink-600">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '500+', label: 'Community Members' },
              { number: '1000+', label: 'Tutorials Created' },
              { number: '50+', label: 'Professional Artists' },
              { number: '24/7', label: 'Available Support' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-white mb-2">{stat.number}</p>
                <p className="text-rose-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 border border-gray-200">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join the Community?</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Create an account to access exclusive content, connect with other professionals, and unlock premium services.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition-all hover:shadow-lg inline-flex items-center gap-2"
          >
            Get Started Now <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h5 className="text-white font-semibold mb-4">LexiRose.ca</h5>
              <p className="text-sm">Where creativity meets community. Transform your makeup artistry journey.</p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Services</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Design Studio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Booking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Products</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Community</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Artists</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gallery</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 LexiRose.ca. All rights reserved. Designed for beauty, creativity & community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
