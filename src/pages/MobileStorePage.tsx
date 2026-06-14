import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Smartphone, Download, Star, Shield, Zap,
  ShoppingBag, Bell, QrCode, ArrowRight, CheckCircle
} from 'lucide-react';

const appFeatures = [
  {
    icon: ShoppingBag,
    title: 'Browse & Purchase',
    description: 'Shop the full BIPS product catalog including art, clothing, and gaming gear directly from your phone.',
  },
  {
    icon: Bell,
    title: 'Push Notifications',
    description: 'Get instant alerts for new drops, restocks, flash sales, and exclusive mobile-only deals.',
  },
  {
    icon: QrCode,
    title: 'QR Code Scanning',
    description: 'Scan product QR codes at events and pop-ups for exclusive content and instant checkout.',
  },
  {
    icon: Zap,
    title: 'Creator Tools Mobile',
    description: 'Access lightweight design tools on the go. Start designs on mobile, finish on desktop.',
  },
];

const storeLinks = [
  {
    platform: 'Apple App Store',
    icon: '  ',
    status: 'coming_soon' as const,
    rating: '4.8',
    downloads: '10K+',
  },
  {
    platform: 'Google Play Store',
    icon: '  ',
    status: 'coming_soon' as const,
    rating: '4.7',
    downloads: '25K+',
  },
];

const mobileStats = [
  { value: '50K+', label: 'Downloads' },
  { value: '4.8', label: 'App Rating' },
  { value: '99.9%', label: 'Uptime' },
  { value: '< 2s', label: 'Load Time' },
];

export function MobileStorePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-amber-500/20">
            <Smartphone size={48} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-5xl font-bold">Mobile Store</h1>
            <p className="text-gray-400 mt-2 text-lg">App Store and Google Play integration</p>
          </div>
        </div>
      </div>

      <section className="mb-12 bg-gradient-to-r from-green-900/20 via-emerald-900/20 to-green-900/20 border border-amber-500/30 rounded-xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">BIPS in Your Pocket</h2>
              <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                The full BIPS ecosystem on your mobile device. Browse products, manage designs,
                track orders, and stay connected with the community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" className="min-w-[200px]">
                  <Download className="inline-block mr-2" size={20} />
                  App Store
                </Button>
                <Button variant="secondary" className="min-w-[200px]">
                  <Download className="inline-block mr-2" size={20} />
                  Google Play
                </Button>
              </div>
            </div>
            <div className="w-64 h-[480px] bg-gray-800 rounded-[2.5rem] border-4 border-gray-700 flex items-center justify-center relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-700 rounded-b-2xl" />
              <div className="text-center p-6">
                <Smartphone size={64} className="text-amber-500/40 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">App Preview</p>
                <p className="text-amber-500 font-bold mt-2">BIPS Mobile</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {mobileStats.map((stat, index) => (
          <Card key={index} className="hover:border-amber-500/30 transition-all">
            <CardBody className="text-center">
              <p className="text-4xl font-bold text-amber-500 mb-2">{stat.value}</p>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-bold mb-10">Mobile Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:border-amber-500/50 transition-all group">
                <CardBody>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit mb-4">
                    <Icon size={28} className="text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-bold mb-10">Available On</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {storeLinks.map((store, index) => (
            <Card key={index} className="hover:border-amber-500/50 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-emerald-900/30 opacity-50 group-hover:opacity-70 transition-opacity" />
              <CardBody className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gray-900/50 border border-amber-500/30">
                    <Smartphone size={32} className="text-amber-500" />
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full border border-amber-500/30">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{store.platform}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm text-gray-300 font-medium">{store.rating}</span>
                  </div>
                  <div className="text-sm text-gray-500">{store.downloads} downloads</div>
                </div>
                <Button variant="primary" className="w-full group-hover:bg-amber-600 transition-colors">
                  Get Notified
                  <ArrowRight className="inline-block ml-2" size={18} />
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="border-b border-gray-800 px-8 py-4">
          <h2 className="text-3xl font-bold">Why Go Mobile?</h2>
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 w-fit">
                <Shield size={24} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Secure Checkout</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Apple Pay, Google Pay, and encrypted payment processing for fast, secure purchases.
              </p>
            </div>
            <div className="flex flex-col">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 w-fit">
                <Zap size={24} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Instant Access</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get exclusive early access to drops and limited editions with mobile-first notifications.
              </p>
            </div>
            <div className="flex flex-col">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4 w-fit">
                <CheckCircle size={24} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Offline Mode</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Browse your saved designs, wishlist, and order history even without an internet connection.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
