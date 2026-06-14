import { useState } from 'react';
import { Layout } from '../../components/Layout';
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface PlatformMetrics {
  platform: string;
  views: number;
  engagement: number;
  conversions: number;
  spent: number;
  roi: number;
  color: string;
}

const mockMetrics: PlatformMetrics[] = [
  {
    platform: 'TikTok',
    views: 125000,
    engagement: 8500,
    conversions: 450,
    spent: 3200,
    roi: 3.5,
    color: 'pink'
  },
  {
    platform: 'Instagram',
    views: 85000,
    engagement: 6200,
    conversions: 320,
    spent: 2800,
    roi: 2.8,
    color: 'purple'
  },
  {
    platform: 'ᗺIPSGear',
    views: 45000,
    engagement: 4100,
    conversions: 280,
    spent: 1500,
    roi: 4.2,
    color: 'amber'
  }
];

const timeSeriesData = [
  { date: 'Jan 1', views: 5200, engagement: 420, conversions: 18 },
  { date: 'Jan 2', views: 6100, engagement: 510, conversions: 22 },
  { date: 'Jan 3', views: 7800, engagement: 680, conversions: 31 },
  { date: 'Jan 4', views: 8900, engagement: 750, conversions: 35 },
  { date: 'Jan 5', views: 9200, engagement: 820, conversions: 42 },
  { date: 'Jan 6', views: 11500, engagement: 950, conversions: 48 },
  { date: 'Jan 7', views: 13200, engagement: 1100, conversions: 55 }
];

export function AnalyticsDashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('views');

  const totalMetrics = {
    views: mockMetrics.reduce((sum, m) => sum + m.views, 0),
    engagement: mockMetrics.reduce((sum, m) => sum + m.engagement, 0),
    conversions: mockMetrics.reduce((sum, m) => sum + m.conversions, 0),
    spent: mockMetrics.reduce((sum, m) => sum + m.spent, 0),
    avgRoi: mockMetrics.reduce((sum, m) => sum + m.roi, 0) / mockMetrics.length
  };

  const calculateROI = (conversions: number, spent: number) => {
    const avgOrderValue = 120;
    const revenue = conversions * avgOrderValue;
    return spent > 0 ? ((revenue - spent) / spent * 100).toFixed(1) : '0';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-amber-500">Analytics Dashboard</h1>
                <p className="text-gray-400 mt-1">Cross-platform campaign performance</p>
              </div>
              <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 rounded-lg font-semibold transition-colors">
                <Download className="w-5 h-5" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Time Range Selector */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: 'custom', label: 'Custom Range' }
            ].map(range => (
              <button
                key={range.value}
                onClick={() => setSelectedTimeRange(range.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTimeRange === range.value
                    ? 'bg-amber-600 text-black'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {range.label}
              </button>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-700/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-amber-400 text-sm font-semibold">Total Views</div>
                <Eye className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {(totalMetrics.views / 1000).toFixed(0)}K
              </div>
              <div className="flex items-center gap-1 text-sm text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-700/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-purple-400 text-sm font-semibold">Engagement</div>
                <MousePointerClick className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {(totalMetrics.engagement / 1000).toFixed(1)}K
              </div>
              <div className="flex items-center gap-1 text-sm text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>+8.3%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-700/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-green-400 text-sm font-semibold">Conversions</div>
                <ShoppingCart className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {totalMetrics.conversions}
              </div>
              <div className="flex items-center gap-1 text-sm text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>+15.7%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-blue-400 text-sm font-semibold">Avg ROI</div>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {totalMetrics.avgRoi.toFixed(1)}x
              </div>
              <div className="flex items-center gap-1 text-sm text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>+0.3x</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Time Series Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Performance Over Time</h2>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="views">Views</option>
                  <option value="engagement">Engagement</option>
                  <option value="conversions">Conversions</option>
                </select>
              </div>

              {/* Simple Bar Chart Visualization */}
              <div className="space-y-3">
                {timeSeriesData.map((data, index) => {
                  const value = selectedMetric === 'views' ? data.views :
                                selectedMetric === 'engagement' ? data.engagement :
                                data.conversions;
                  const maxValue = Math.max(...timeSeriesData.map(d =>
                    selectedMetric === 'views' ? d.views :
                    selectedMetric === 'engagement' ? d.engagement :
                    d.conversions
                  ));
                  const percentage = (value / maxValue) * 100;

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">{data.date}</span>
                        <span className="text-white font-semibold">
                          {value.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform Distribution */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Platform Distribution</h2>
                <PieChart className="w-5 h-5 text-amber-500" />
              </div>

              <div className="space-y-4">
                {mockMetrics.map((metric, index) => {
                  const totalViews = mockMetrics.reduce((sum, m) => sum + m.views, 0);
                  const percentage = (metric.views / totalViews) * 100;

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${metric.color}-500`} />
                          <span className="text-white font-medium">{metric.platform}</span>
                        </div>
                        <span className="text-gray-400">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${metric.color}-600 transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="text-sm text-gray-400 mb-3">Quick Stats</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Best Performer</div>
                    <div className="text-sm font-semibold text-amber-500 mt-1">TikTok</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Highest ROI</div>
                    <div className="text-sm font-semibold text-green-500 mt-1">ᗺIPSGear</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Comparison Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Platform Comparison</h2>
              <BarChart3 className="w-5 h-5 text-amber-500" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Platform</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Views</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Engagement</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Conversions</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Spent</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMetrics.map((metric, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full bg-${metric.color}-500`} />
                          <span className="font-medium text-white">{metric.platform}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-white">
                        {(metric.views / 1000).toFixed(0)}K
                      </td>
                      <td className="py-4 px-4 text-right text-white">
                        {(metric.engagement / 1000).toFixed(1)}K
                      </td>
                      <td className="py-4 px-4 text-right text-white">
                        {metric.conversions}
                      </td>
                      <td className="py-4 px-4 text-right text-white">
                        ${metric.spent.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-green-400 font-semibold">
                          {metric.roi}x
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-800/50 font-semibold">
                    <td className="py-4 px-4 text-white">Total</td>
                    <td className="py-4 px-4 text-right text-white">
                      {(totalMetrics.views / 1000).toFixed(0)}K
                    </td>
                    <td className="py-4 px-4 text-right text-white">
                      {(totalMetrics.engagement / 1000).toFixed(1)}K
                    </td>
                    <td className="py-4 px-4 text-right text-white">
                      {totalMetrics.conversions}
                    </td>
                    <td className="py-4 px-4 text-right text-white">
                      ${totalMetrics.spent.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-amber-500">
                      {totalMetrics.avgRoi.toFixed(1)}x
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-700/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600/20 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">ROI Calculator</h2>
                <p className="text-sm text-gray-400">Calculate return on investment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Total Spent</div>
                <div className="text-2xl font-bold text-white">
                  ${totalMetrics.spent.toLocaleString()}
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Revenue Generated</div>
                <div className="text-2xl font-bold text-white">
                  ${(totalMetrics.conversions * 120).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">Based on $120 avg order value</div>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Net Profit</div>
                <div className="text-2xl font-bold text-green-400">
                  ${((totalMetrics.conversions * 120) - totalMetrics.spent).toLocaleString()}
                </div>
                <div className="text-sm text-green-500 mt-1">
                  {calculateROI(totalMetrics.conversions, totalMetrics.spent)}% ROI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
