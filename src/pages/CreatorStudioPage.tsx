import { Link } from 'react-router-dom';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Palette, Shirt, Car, Sparkles, ArrowRight } from 'lucide-react';

export function CreatorStudioPage() {
  const tools = [
    {
      id: 'design',
      title: 'Design Editor',
      description: 'Create stunning vehicle liveries and custom designs with our advanced editor',
      icon: Palette,
      link: '/creator/design',
      color: 'from-purple-500/20 to-pink-500/20',
    },
    {
      id: 'gamewear',
      title: 'Gamewear Designer',
      description: 'Design custom team jerseys and gaming apparel',
      icon: Shirt,
      link: '/creator/gamewear/new',
      color: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      id: 'vehicles',
      title: 'Vehicle Customizer',
      description: 'Build and customize racing vehicles with advanced tuning options',
      icon: Car,
      link: '/creator/vehicles',
      color: 'from-orange-500/20 to-red-500/20',
      comingSoon: true,
    },
    {
      id: 'assets',
      title: 'Asset Library',
      description: 'Browse and use thousands of pre-made designs, decals, and templates',
      icon: Sparkles,
      link: '/creator/assets',
      color: 'from-amber-500/20 to-yellow-500/20',
      comingSoon: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <section className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Palette size={48} className="text-amber-500" />
          <h1 className="text-5xl font-bold">Creator Studio</h1>
        </div>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Unleash your creativity with professional-grade design tools. Create custom liveries,
          team branding, and gaming apparel that stand out from the competition.
        </p>
      </section>

      {/* Tools Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.id}
              className="hover:border-amber-500/50 transition-all relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-50`} />
              <CardBody className="relative">
                <div className="flex items-start justify-between mb-4">
                  <Icon size={48} className="text-amber-500" />
                  {tool.comingSoon && (
                    <span className="text-xs bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-3">{tool.title}</h3>
                <p className="text-gray-400 mb-6">{tool.description}</p>
                {!tool.comingSoon ? (
                  <Link to={tool.link}>
                    <Button variant="primary" className="w-full">
                      Launch Tool
                      <ArrowRight className="inline-block ml-2" size={18} />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" className="w-full" disabled>
                    Coming Soon
                  </Button>
                )}
              </CardBody>
            </Card>
          );
        })}
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-16">
        <h2 className="text-3xl font-bold mb-6">Studio Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-amber-500 font-semibold mb-2">Professional Tools</h3>
            <p className="text-gray-400 text-sm">
              Layer-based editing, advanced color controls, and precision placement tools for
              creating pro-quality designs.
            </p>
          </div>
          <div>
            <h3 className="text-amber-500 font-semibold mb-2">Cloud Sync</h3>
            <p className="text-gray-400 text-sm">
              All your designs are automatically saved and synced across devices. Access your
              work anywhere, anytime.
            </p>
          </div>
          <div>
            <h3 className="text-amber-500 font-semibold mb-2">Export & Share</h3>
            <p className="text-gray-400 text-sm">
              Export designs in multiple formats or share directly with your team and community.
              Collaborate in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="text-center py-12 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
        <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Start with our Design Editor to create your first custom livery, or jump into the
          Gamewear Designer to build team apparel.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/creator/design">
            <Button variant="primary">Start Designing</Button>
          </Link>
          <a href="#" className="text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-2">
            View Tutorials
            <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
}
