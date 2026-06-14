import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Package,
  BarChart3,
  Sparkles,
  Palette,
  Cloud,
  Video,
  TrendingUp,
  Target
} from 'lucide-react';

export function AdvertisingHubPage() {
  const modules = [
    {
      title: 'Asset Library',
      description: 'Unified repository for videos, AR assets, telemetry visuals, and product shots',
      icon: Package,
      href: '/advertising/assets',
      color: 'amber',
      features: ['Video Clips', 'AR Overlays', 'Telemetry Data', 'Product Shots']
    },
    {
      title: 'Campaign Dashboard',
      description: 'Manage TikTok, Instagram, and ᗺIPSGear advertising campaigns',
      icon: Target,
      href: '/advertising/campaigns',
      color: 'blue',
      features: ['Multi-Platform', 'Real-time Status', 'Budget Tracking', 'Quick Actions']
    },
    {
      title: 'Campaign Builder',
      description: 'Create and launch new advertising campaigns across all platforms',
      icon: Sparkles,
      href: '/advertising/builder',
      color: 'green',
      features: ['Step-by-Step', 'Asset Selection', 'Platform Config', 'Telemetry Integration']
    },
    {
      title: 'Analytics Dashboard',
      description: 'Cross-platform metrics, ROI analysis, and performance tracking',
      icon: BarChart3,
      href: '/advertising/analytics',
      color: 'purple',
      features: ['Views & Engagement', 'Conversions', 'ROI Calculator', 'Export Data']
    },
    {
      title: 'Theme Customizer',
      description: 'Customize site appearance with colors, overlays, and nature textures',
      icon: Palette,
      href: '/advertising/themes',
      color: 'pink',
      features: ['Color Picker', 'Cybernetic Mode', 'Nature Textures', 'Gear States']
    },
    {
      title: 'Microsoft 365',
      description: 'Integrate OneDrive, Stream, Designer, Clipchamp, and Power BI',
      icon: Cloud,
      href: '/advertising/m365',
      color: 'cyan',
      features: ['OneDrive Sync', 'Video Stream', 'AI Designer', 'Power BI Dashboards']
    }
  ];

  const quickStats = [
    { label: 'Total Assets', value: '247', icon: Package },
    { label: 'Active Campaigns', value: '12', icon: TrendingUp },
    { label: 'Total Views', value: '1.2M', icon: Video },
    { label: 'Engagement Rate', value: '8.4%', icon: Target }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-4">
          Advertising <span className="text-amber-500">Hub</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Unified platform for managing assets, campaigns, and analytics across TikTok, Instagram, and ᗺIPSGear
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className="text-amber-500" size={40} />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="text-amber-500" size={32} />
                  <h2 className="text-2xl font-bold">{module.title}</h2>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-gray-400 mb-4">{module.description}</p>

                <div className="space-y-2 mb-6">
                  {module.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link to={module.href}>
                  <Button className="w-full">Open {module.title}</Button>
                </Link>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card className="mt-12">
        <CardHeader>
          <h2 className="text-2xl font-bold">Ecosystem Integration</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2 text-amber-500">ᗺIPSGear</h3>
              <p className="text-sm text-gray-400">Product showcase with telemetry visualization and direct shop integration</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-amber-500">Foster Hardware</h3>
              <p className="text-sm text-gray-400">Real-time device telemetry for battery runtime and heat zone mapping</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-amber-500">ᗺIPS Montreal</h3>
              <p className="text-sm text-gray-400">Creative pipeline connecting avatars, GameWear, and community resources</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
