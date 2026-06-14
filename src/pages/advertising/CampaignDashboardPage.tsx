import { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Link } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  DollarSign,
  Eye,
  MousePointerClick,
  Calendar,
  BarChart3,
  Edit,
  Copy,
  Archive
} from 'lucide-react';

type CampaignStatus = 'active' | 'draft' | 'completed' | 'paused' | 'scheduled';
type CampaignType = 'tiktok' | 'instagram' | 'bipsgear' | 'multi-platform';

interface Campaign {
  id: string;
  title: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  views: number;
  engagement: number;
  conversions: number;
  assets: number;
  platforms: string[];
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Winter Gear Launch 2024',
    type: 'multi-platform',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    budget: 10000,
    spent: 6500,
    views: 125000,
    engagement: 8500,
    conversions: 450,
    assets: 12,
    platforms: ['TikTok', 'Instagram', 'ᗺIPSGear']
  },
  {
    id: '2',
    title: 'AR Experience Beta Test',
    type: 'bipsgear',
    status: 'active',
    startDate: '2024-01-05',
    endDate: '2024-01-20',
    budget: 5000,
    spent: 2100,
    views: 45000,
    engagement: 3200,
    conversions: 180,
    assets: 6,
    platforms: ['ᗺIPSGear']
  },
  {
    id: '3',
    title: 'Valentine\'s Day Promo',
    type: 'tiktok',
    status: 'scheduled',
    startDate: '2024-02-01',
    endDate: '2024-02-14',
    budget: 8000,
    spent: 0,
    views: 0,
    engagement: 0,
    conversions: 0,
    assets: 8,
    platforms: ['TikTok']
  },
  {
    id: '4',
    title: 'Product Photography Series',
    type: 'instagram',
    status: 'draft',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    budget: 3000,
    spent: 0,
    views: 0,
    engagement: 0,
    conversions: 0,
    assets: 15,
    platforms: ['Instagram']
  },
  {
    id: '5',
    title: 'Holiday Season 2023',
    type: 'multi-platform',
    status: 'completed',
    startDate: '2023-12-01',
    endDate: '2023-12-31',
    budget: 15000,
    spent: 14800,
    views: 250000,
    engagement: 18500,
    conversions: 980,
    assets: 24,
    platforms: ['TikTok', 'Instagram', 'ᗺIPSGear']
  }
];

const statusColors = {
  active: 'bg-green-600',
  draft: 'bg-gray-600',
  completed: 'bg-blue-600',
  paused: 'bg-yellow-600',
  scheduled: 'bg-purple-600'
};

const platformColors = {
  TikTok: 'bg-pink-600',
  Instagram: 'bg-purple-600',
  'ᗺIPSGear': 'bg-amber-600'
};

export function CampaignDashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | 'all'>('all');

  const filteredCampaigns = selectedStatus === 'all'
    ? mockCampaigns
    : mockCampaigns.filter(c => c.status === selectedStatus);

  const stats = {
    active: mockCampaigns.filter(c => c.status === 'active').length,
    draft: mockCampaigns.filter(c => c.status === 'draft').length,
    completed: mockCampaigns.filter(c => c.status === 'completed').length,
    totalBudget: mockCampaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: mockCampaigns.reduce((sum, c) => sum + c.spent, 0),
    totalViews: mockCampaigns.reduce((sum, c) => sum + c.views, 0),
    totalEngagement: mockCampaigns.reduce((sum, c) => sum + c.engagement, 0),
    totalConversions: mockCampaigns.reduce((sum, c) => sum + c.conversions, 0)
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-amber-500">Campaign Dashboard</h1>
                <p className="text-gray-400 mt-1">Manage your advertising campaigns</p>
              </div>
              <Link
                to="/advertising/campaign-builder"
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Campaign
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-700/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-green-400 text-sm font-semibold">Active Campaigns</div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.active}</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/10 border border-gray-700/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm font-semibold">Draft Campaigns</div>
                <Edit className="w-5 h-5 text-gray-500" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.draft}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-blue-400 text-sm font-semibold">Completed</div>
                <Archive className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.completed}</div>
            </div>

            <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-700/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-amber-400 text-sm font-semibold">Budget Spent</div>
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-white">
                ${(stats.totalSpent / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-gray-400 mt-1">
                of ${(stats.totalBudget / 1000).toFixed(1)}K
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-600/20 p-3 rounded-lg">
                  <Eye className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Total Views</div>
                  <div className="text-2xl font-bold text-white">
                    {(stats.totalViews / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <MousePointerClick className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Total Engagement</div>
                  <div className="text-2xl font-bold text-white">
                    {(stats.totalEngagement / 1000).toFixed(1)}K
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Conversions</div>
                  <div className="text-2xl font-bold text-white">
                    {stats.totalConversions}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(['all', 'active', 'scheduled', 'draft', 'completed', 'paused'] as (CampaignStatus | 'all')[]).map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedStatus === status
                    ? 'bg-amber-600 text-black'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Campaign Cards */}
          <div className="space-y-4">
            {filteredCampaigns.map(campaign => (
              <div
                key={campaign.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-amber-600 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Campaign Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{campaign.title}</h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[campaign.status]}`}>
                            {campaign.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {campaign.platforms.map(platform => (
                            <span
                              key={platform}
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${
                                platformColors[platform as keyof typeof platformColors]
                              }`}
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Dates and Budget */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{campaign.startDate} to {campaign.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span>
                      </div>
                      <div>
                        <span>{campaign.assets} assets</span>
                      </div>
                    </div>

                    {/* Budget Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Budget Progress</span>
                        <span>{((campaign.spent / campaign.budget) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 transition-all"
                          style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Analytics Preview */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">Views</div>
                        <div className="text-lg font-semibold text-white">
                          {campaign.views > 0 ? `${(campaign.views / 1000).toFixed(0)}K` : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Engagement</div>
                        <div className="text-lg font-semibold text-white">
                          {campaign.engagement > 0 ? `${(campaign.engagement / 1000).toFixed(1)}K` : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Conversions</div>
                        <div className="text-lg font-semibold text-white">
                          {campaign.conversions > 0 ? campaign.conversions : '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Link
                      to={`/advertising/analytics/${campaign.id}`}
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Analytics</span>
                    </Link>
                    <Link
                      to={`/advertising/campaign-builder/${campaign.id}`}
                      className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                    <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Duplicate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-16">
              <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No campaigns found</h3>
              <p className="text-gray-500 mb-4">Create your first campaign to get started</p>
              <Link
                to="/advertising/campaign-builder"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Campaign
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
