import React, { useState } from 'react';
import { ChartBar as BarChart3, TrendingUp, ShoppingCart, Download, Users } from 'lucide-react';

type TimeRange = '7d' | '30d' | '90d';

export function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Cross-domain performance metrics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Section */}
      <OverviewSection timeRange={timeRange} />

      {/* Traffic Section */}
      <TrafficSection />

      {/* Revenue Section */}
      <RevenueSection />

      {/* Content Performance */}
      <ContentPerformanceSection />

      {/* Site Comparison */}
      <SiteComparisonSection />
    </div>
  );
}

function OverviewSection({ timeRange }: { timeRange: TimeRange }) {
  const stats = [
    { label: 'Total Views', value: '45.2K', change: '+12%', icon: Users, color: 'blue' },
    { label: 'Purchases', value: '328', change: '+18%', icon: ShoppingCart, color: 'green' },
    { label: 'Downloads', value: '1.2K', change: '+5%', icon: Download, color: 'purple' },
    { label: 'Revenue', value: '$12.4K', change: '+24%', icon: TrendingUp, color: 'amber' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors: Record<string, { bg: string; text: string }> = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
            green: { bg: 'bg-green-50', text: 'text-green-600' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
            amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
          };
          const style = colors[stat.color];

          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <div className={`p-2 rounded-lg ${style.bg}`}>
                  <Icon className={`${style.text}`} size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <p className="text-sm font-medium text-green-600">{stat.change}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrafficSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Pages */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Pages</h3>
        <div className="space-y-3">
          <PageMetric path="/products" views={2841} site="LEXI" />
          <PageMetric path="/contacts" views={1924} site="BIPS" />
          <PageMetric path="/catalog" views={1658} site="GEAR" />
          <PageMetric path="/downloads" views={1203} site="LEXI" />
          <PageMetric path="/routines" views={987} site="LEXI" />
        </div>
      </div>

      {/* Top Referrers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic Sources</h3>
        <div className="space-y-4">
          <ReferrerMetric source="TikTok" visits={5234} percentage={42} />
          <ReferrerMetric source="Instagram" visits={3421} percentage={27} />
          <ReferrerMetric source="Direct" visits={2156} percentage={17} />
          <ReferrerMetric source="YouTube" visits={1893} percentage={15} />
        </div>
      </div>
    </div>
  );
}

function RevenueSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue by Type */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">By Product Type</h4>
          <div className="space-y-3">
            <RevenueRow label="Digital Downloads" amount="$4,200" percentage={34} />
            <RevenueRow label="Products" amount="$3,800" percentage={31} />
            <RevenueRow label="Services" amount="$2,400" percentage={19} />
            <RevenueRow label="Affiliate" amount="$2,000" percentage={16} />
          </div>
        </div>

        {/* Revenue by Site */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">By Site</h4>
          <div className="space-y-3">
            <RevenueRow label="LexiRose" amount="$8,120" percentage={65} color="pink" />
            <RevenueRow label="BIPS" amount="$2,340" percentage={19} color="blue" />
            <RevenueRow label="Gear" amount="$1,940" percentage={16} color="slate" />
          </div>
        </div>

        {/* Top Products */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Top Products</h4>
          <div className="space-y-3">
            <ProductRow name="Skincare Set" sales={124} revenue="$3,720" />
            <ProductRow name="Makeup Kit" sales={89} revenue="$2,670" />
            <ProductRow name="Beauty Course" sales={45} revenue="$2,250" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentPerformanceSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Content Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Post</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Platform</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Impressions</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Engagement</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Clicks</th>
            </tr>
          </thead>
          <tbody>
            <ContentRow
              title="Morning Glow Routine"
              platform="TikTok"
              impressions={12400}
              engagement={8.2}
              clicks={1240}
            />
            <ContentRow
              title="Summer Collection"
              platform="Instagram"
              impressions={8920}
              engagement={6.5}
              clicks={580}
            />
            <ContentRow
              title="Makeup Tutorial"
              platform="YouTube"
              impressions={6340}
              engagement={12.1}
              clicks={766}
            />
            <ContentRow
              title="Product Launch"
              platform="Instagram"
              impressions={4821}
              engagement={7.3}
              clicks={352}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SiteComparisonSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SiteCard site="LEXI_SITE" views={18400} purchases={240} revenue={8120} color="pink" />
      <SiteCard site="BIPS_SITE" views={16200} purchases={89} revenue={2340} color="blue" />
      <SiteCard site="GEAR_SITE" views={10600} purchases={45} revenue={1940} color="slate" />
    </div>
  );
}

function PageMetric({ path, views, site }: { path: string; views: number; site: string }) {
  const siteColors: Record<string, string> = {
    LEXI: 'bg-pink-100 text-pink-700',
    BIPS: 'bg-blue-100 text-blue-700',
    GEAR: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        <span className={`px-2 py-1 rounded text-xs font-medium ${siteColors[site]}`}>{site}</span>
        <span className="text-gray-900 font-medium">{path}</span>
      </div>
      <span className="text-gray-600 font-semibold">{views.toLocaleString()}</span>
    </div>
  );
}

function ReferrerMetric({ source, visits, percentage }: { source: string; visits: number; percentage: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 font-medium">{source}</span>
      <div className="flex items-center gap-3 flex-1 ml-4">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-gray-600 font-semibold text-right min-w-16">{visits.toLocaleString()}</span>
      </div>
    </div>
  );
}

function RevenueRow({
  label,
  amount,
  percentage,
  color,
}: {
  label: string;
  amount: string;
  percentage: number;
  color?: string;
}) {
  const colors: Record<string, string> = {
    pink: 'from-pink-400 to-pink-600',
    blue: 'from-blue-400 to-blue-600',
    slate: 'from-slate-400 to-slate-600',
    default: 'from-green-400 to-green-600',
  };
  const gradient = colors[color || 'default'];

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 text-sm">{label}</span>
      <div className="flex items-center gap-2 flex-1 ml-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${gradient} rounded-full`} style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-gray-900 font-semibold text-right min-w-20">{amount}</span>
      </div>
    </div>
  );
}

function ProductRow({ name, sales, revenue }: { name: string; sales: number; revenue: string }) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-gray-700 text-sm">{name}</span>
      <div className="text-right text-xs">
        <p className="font-semibold text-gray-900">{sales} sales</p>
        <p className="text-gray-600">{revenue}</p>
      </div>
    </div>
  );
}

function ContentRow({
  title,
  platform,
  impressions,
  engagement,
  clicks,
}: {
  title: string;
  platform: string;
  impressions: number;
  engagement: number;
  clicks: number;
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">{platform}</span>
      </td>
      <td className="py-3 px-4">
        <p className="font-semibold text-gray-900 text-sm">{impressions.toLocaleString()}</p>
      </td>
      <td className="py-3 px-4">
        <p className="font-semibold text-green-600 text-sm">{engagement}%</p>
      </td>
      <td className="py-3 px-4">
        <p className="font-semibold text-gray-900 text-sm">{clicks.toLocaleString()}</p>
      </td>
    </tr>
  );
}

function SiteCard({
  site,
  views,
  purchases,
  revenue,
  color,
}: {
  site: string;
  views: number;
  purchases: number;
  revenue: number;
  color: string;
}) {
  const colors: Record<string, { header: string; text: string }> = {
    pink: { header: 'bg-gradient-to-br from-pink-600 to-pink-700', text: 'text-pink-600' },
    blue: { header: 'bg-gradient-to-br from-blue-600 to-blue-700', text: 'text-blue-600' },
    slate: { header: 'bg-gradient-to-br from-slate-600 to-slate-700', text: 'text-slate-600' },
  };
  const style = colors[color];
  const siteNames: Record<string, string> = {
    LEXI_SITE: 'LexiRose',
    BIPS_SITE: 'BIPS Network',
    GEAR_SITE: 'BIPS Gear',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className={`${style.header} p-4 text-white`}>
        <h3 className="text-lg font-bold">{siteNames[site]}</h3>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm text-gray-600">Page Views</p>
          <p className="text-2xl font-bold text-gray-900">{views.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Purchases</p>
          <p className="text-2xl font-bold text-gray-900">{purchases}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Revenue</p>
          <p className={`text-2xl font-bold ${style.text}`}>${revenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
