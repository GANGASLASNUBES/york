import { useParams, Link } from 'react-router-dom';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Globe, ArrowLeft, ExternalLink, Users, Trophy, Gamepad2 } from 'lucide-react';
import { SITES } from '../lib/constants';

export function SiteDetailPage() {
  const { id } = useParams();
  const site = SITES.find((s) => s.id === Number(id));

  if (!site) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Site Not Found</h1>
        <Link to="/">
          <Button variant="ghost">Return Home</Button>
        </Link>
      </div>
    );
  }

  const getSiteDetails = (siteName: string) => {
    switch (siteName) {
      case 'Midtown Madness':
        return {
          description: 'Experience the ultimate open-world racing game set in bustling city streets.',
          features: ['Open World Racing', 'Multiplayer Modes', 'Custom Vehicles', 'Dynamic Weather'],
          stats: { players: '50K+', rating: '4.8/5', updates: 'Weekly' },
        };
      case 'Street Legal Racing':
        return {
          description: 'Build, tune, and race street machines in the most realistic racing simulator.',
          features: ['Realistic Physics', 'Deep Customization', 'Career Mode', 'Online Championships'],
          stats: { players: '75K+', rating: '4.9/5', updates: 'Monthly' },
        };
      case 'Redline Racing':
        return {
          description: 'High-octane circuit racing with professional-grade vehicles and tracks.',
          features: ['Pro Circuits', 'Licensed Cars', 'Esports Integration', 'Live Events'],
          stats: { players: '100K+', rating: '4.7/5', updates: 'Bi-weekly' },
        };
      case 'BIPS Studio':
        return {
          description: 'Create stunning designs, liveries, and branding for your gaming presence.',
          features: ['Design Tools', 'Asset Library', 'Cloud Sync', 'Team Collaboration'],
          stats: { users: '25K+', rating: '4.9/5', updates: 'Continuous' },
        };
      case 'BIPS Shop':
        return {
          description: 'Premium gaming gear, apparel, and digital collectibles.',
          features: ['Gaming Gear', 'Streetwear', 'Digital Art', 'Limited Editions'],
          stats: { products: '500+', rating: '4.8/5', shipping: 'Worldwide' },
        };
      default:
        return {
          description: 'Part of the BIPS Ecosystem.',
          features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
          stats: { active: 'Yes', category: site.category, status: 'Live' },
        };
    }
  };

  const details = getSiteDetails(site.name);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link to="/about" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-8">
        <ArrowLeft size={20} />
        Back to About
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={40} className="text-amber-500" />
            <div>
              <h1 className="text-4xl font-bold">{site.name}</h1>
              <span className="text-sm bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full">
                {site.category}
              </span>
            </div>
          </div>

          <p className="text-xl text-gray-400 mb-8">{details.description}</p>

          {/* Features */}
          <Card className="mb-6">
            <CardBody>
              <h2 className="text-2xl font-bold mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {details.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Visit Site */}
          <a href={site.url} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" className="w-full">
              Visit {site.name}
              <ExternalLink className="inline-block ml-2" size={18} />
            </Button>
          </a>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardBody>
              <h3 className="text-xl font-bold mb-4">Statistics</h3>
              <div className="space-y-3">
                {Object.entries(details.stats).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-400 capitalize">{key}</span>
                    <span className="text-amber-500 font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardBody>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-gray-400 hover:text-amber-500 transition-colors flex items-center gap-2"
                >
                  <Users size={16} />
                  Community
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-amber-500 transition-colors flex items-center gap-2"
                >
                  <Trophy size={16} />
                  Leaderboards
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-amber-500 transition-colors flex items-center gap-2"
                >
                  <Gamepad2 size={16} />
                  Getting Started
                </a>
              </div>
            </CardBody>
          </Card>

          {/* Integration */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardBody>
              <h3 className="text-xl font-bold mb-2">BIPS Integration</h3>
              <p className="text-gray-400 text-sm">
                This site is fully integrated with the BIPS Identity Graph. Your progress and
                achievements sync across all platforms.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Related Sites */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-6">More from BIPS Ecosystem</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {SITES.filter((s) => s.id !== site.id).map((relatedSite) => (
            <Link key={relatedSite.id} to={`/site/${relatedSite.id}`}>
              <Card className="hover:border-amber-500/50 transition-all cursor-pointer">
                <CardBody>
                  <Globe size={24} className="text-amber-500 mb-2" />
                  <h3 className="font-bold">{relatedSite.name}</h3>
                  <span className="text-xs text-gray-400">{relatedSite.category}</span>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
