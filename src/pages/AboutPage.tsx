import { Logo } from '../components/Logo';
import { Card, CardBody } from '../components/ui/Card';
import { Crown, Users, Zap, Globe, Palette, Code, ArrowRight } from 'lucide-react';
import { TAGLINE, SITES } from '../lib/constants';

const coreValues = [
  {
    icon: Crown,
    title: 'Excellence',
    description: 'We strive for excellence in everything we create, from products to experiences, ensuring quality that stands above the rest.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Our community drives us forward. We build tools and experiences that bring players and creators together.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We push boundaries with cutting-edge technology and creative solutions that redefine what\'s possible.',
  },
];

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent rounded-3xl pointer-events-none" />
        <div className="relative">
          <Logo size="lg" />
          <p className="text-3xl text-amber-500 mt-6 font-bold tracking-wide">{TAGLINE}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto mb-12">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 to-orange-900/30 opacity-50" />
          <CardBody className="text-center relative">
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              The BIPS Ecosystem is revolutionizing the gaming and creative industries by building a unified
              platform where players, creators, and brands converge. We believe in empowering individuals
              to build their digital legacy, create without limits, and compete at the highest level.
            </p>
          </CardBody>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-bold mb-10 text-center">Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coreValues.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} className="hover:border-amber-500/50 transition-all group">
                <CardBody className="text-center">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit mx-auto mb-6">
                    <Icon size={32} className="text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{value.description}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-bold mb-10 text-center">BIPS Ecosystem</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SITES.map((site) => (
            <Card key={site.id} className="hover:border-amber-500/50 transition-all group">
              <CardBody>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Globe size={18} className="text-amber-500" />
                  </div>
                  <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
                    {site.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{site.name}</h3>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-500 hover:text-amber-400 text-sm font-semibold inline-flex items-center gap-1 mt-1"
                >
                  Visit Site
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-bold mb-10 text-center">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:border-amber-500/50 transition-all">
            <CardBody>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit mb-4">
                <Palette size={28} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Creator Tools</h3>
              <p className="text-gray-400 leading-relaxed">
                Our Creator Studio provides powerful design tools for building custom vehicle
                liveries, team branding, and digital assets. Create professional-quality designs
                with our intuitive interface.
              </p>
            </CardBody>
          </Card>
          <Card className="hover:border-amber-500/50 transition-all">
            <CardBody>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit mb-4">
                <Code size={28} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Identity Graph</h3>
              <p className="text-gray-400 leading-relaxed">
                Connect your gaming identities across platforms. Build your reputation, track
                your achievements, and maintain your presence across the entire gaming ecosystem.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="text-center py-16 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 rounded-xl">
        <h2 className="text-4xl font-bold mb-4">Join the Revolution</h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
          Whether you're a player, creator, or brand, the BIPS Ecosystem has the tools and community
          to help you succeed. Start building your legacy today.
        </p>
        <a
          href="mailto:hello@bips.com"
          className="text-amber-500 hover:text-amber-400 font-bold text-xl"
        >
          hello@bips.com
        </a>
      </section>
    </div>
  );
}
