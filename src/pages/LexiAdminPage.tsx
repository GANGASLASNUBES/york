import React, { useState } from 'react';
import { Calendar, Link2, Image, ChartBar as BarChart3, Plus, Trash2, Eye, Lock, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Sample data until Convex API is fully generated
const SAMPLE_SOCIAL_POSTS = [
  {
    id: '1',
    platform: 'tiktok',
    title: 'Morning Glow Routine',
    caption: 'Start your day with this 5-minute skincare routine! ✨',
    status: 'published' as const,
    publishedAt: Date.now(),
  },
  {
    id: '2',
    platform: 'instagram',
    title: 'Summer Collection',
    caption: 'New summer collection now available in the shop!',
    status: 'scheduled' as const,
    scheduledAt: Date.now() + 86400000,
  },
  {
    id: '3',
    platform: 'youtube',
    title: 'Makeup Tutorial',
    caption: 'Full tutorial on creating the perfect natural makeup look',
    status: 'draft' as const,
  },
];

const SAMPLE_ART_ASSETS = [
  { id: '1', label: 'Logo - Pink', usage: 'lexi_brand', tags: ['logo', 'brand'] },
  { id: '2', label: 'Heart Icon', usage: 'lexi_brand', tags: ['icon', 'social'] },
  { id: '3', label: 'Product Backdrop', usage: 'lexi_brand', tags: ['product', 'photo'] },
];

const SAMPLE_SHOPIFY_LINKS = [
  { id: '1', shopifyProductId: 'gid://shopify/Product/123', label: 'Skincare Set', active: true },
  { id: '2', shopifyProductId: 'gid://shopify/Product/456', label: 'Makeup Kit', active: true },
];

type TabType = 'social' | 'media' | 'shopify' | 'analytics' | 'revenue';

export function LexiAdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('social');
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage Lexi Rose brand, content, and analytics</p>
      </div>

      {/* Quick Access Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => navigate('/revenue')}
          className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-600 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Revenue Hub</h3>
          </div>
          <p className="text-sm text-gray-600">Manage bundles, subscriptions, routines, and more</p>
        </button>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BarChart3 className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Analytics</h3>
          </div>
          <p className="text-sm text-gray-600">View cross-domain performance and insights</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 flex gap-8 flex-wrap">
        <TabButton
          icon={<Clock size={20} />}
          label="Social"
          active={activeTab === 'social'}
          onClick={() => setActiveTab('social')}
        />
        <TabButton
          icon={<Image size={20} />}
          label="Art & Media"
          active={activeTab === 'media'}
          onClick={() => setActiveTab('media')}
        />
        <TabButton
          icon={<Link2 size={20} />}
          label="Shopify"
          active={activeTab === 'shopify'}
          onClick={() => setActiveTab('shopify')}
        />
        <TabButton
          icon={<BarChart3 size={20} />}
          label="Analytics"
          active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
        />
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'social' && <SocialTab showForm={showForm} setShowForm={setShowForm} />}
        {activeTab === 'media' && <MediaTab />}
        {activeTab === 'shopify' && <ShopifyTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
        active
          ? 'border-pink-600 text-pink-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function SocialTab({ showForm, setShowForm }: { showForm: boolean; setShowForm: (v: boolean) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Social Media Posts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      {showForm && <SocialPostForm onClose={() => setShowForm(false)} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAMPLE_SOCIAL_POSTS.map((post) => (
          <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <PlatformIcon platform={post.platform} />
                <span className="font-medium capitalize text-gray-900">{post.platform}</span>
              </div>
              <StatusBadge status={post.status} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.caption}</p>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm">
                Edit
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialPostForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Social Post</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
            <option>TikTok</option>
            <option>Instagram</option>
            <option>YouTube</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            placeholder="Post title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
          <textarea
            placeholder="Post caption"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
            <option>Draft</option>
            <option>Scheduled</option>
            <option>Published</option>
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
            Create Post
          </button>
        </div>
      </div>
    </div>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    tiktok: 'text-black',
    instagram: 'text-pink-600',
    youtube: 'text-red-600',
  };
  return <div className={`w-6 h-6 rounded-full ${colors[platform] || 'bg-gray-300'}`} />;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
    published: { bg: 'bg-green-100', text: 'text-green-700' },
  };
  const style = colors[status] || colors.draft;
  return <span className={`px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}>{status}</span>;
}

function MediaTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Art & Media Library</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
          <Plus size={20} />
          Upload Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SAMPLE_ART_ASSETS.map((asset) => (
          <div key={asset.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-br from-pink-100 to-pink-50 h-32 flex items-center justify-center">
              <Image className="text-pink-300" size={32} />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm mb-1">{asset.label}</h3>
              <p className="text-xs text-gray-600 mb-2">{asset.usage}</p>
              <div className="flex gap-2">
                <button className="flex-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                  View
                </button>
                <button className="flex-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                  <Trash2 size={14} className="inline" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-dashed border-pink-200 rounded-lg p-12 text-center">
        <Image className="mx-auto text-pink-300 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload New Asset</h3>
        <p className="text-gray-600 mb-4">Drag and drop your image here, or click to browse</p>
        <button className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
          Choose File
        </button>
      </div>
    </div>
  );
}

function ShopifyTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Shopify Links</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
          <Plus size={20} />
          Add Link
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Shopify ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_SHOPIFY_LINKS.map((link) => (
              <tr key={link.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{link.label}</td>
                <td className="py-3 px-4 text-sm text-gray-600 font-mono">{link.shopifyProductId.slice(-5)}</td>
                <td className="py-3 px-4">
                  {link.active ? (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <a
                    href="https://shopify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                  >
                    View on Shopify
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Lexi Analytics</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Page Views" value="2,341" change="+12%" />
        <StatsCard label="Downloads" value="156" change="+8%" />
        <StatsCard label="Affiliate Clicks" value="89" change="+23%" />
        <StatsCard label="Bookings" value="12" change="+5%" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
          <div className="h-64 bg-gradient-to-b from-pink-50 to-transparent rounded flex items-end justify-around px-4">
            <div className="w-12 h-20 bg-pink-200 rounded-t" />
            <div className="w-12 h-32 bg-pink-400 rounded-t" />
            <div className="w-12 h-24 bg-pink-300 rounded-t" />
            <div className="w-12 h-28 bg-pink-400 rounded-t" />
            <div className="w-12 h-40 bg-pink-500 rounded-t" />
            <div className="w-12 h-36 bg-pink-400 rounded-t" />
            <div className="w-12 h-44 bg-pink-600 rounded-t" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
          <div className="space-y-4">
            <PageRow label="/products" views={892} />
            <PageRow label="/downloads" views={654} />
            <PageRow label="/routines" views={421} />
            <PageRow label="/affiliates" views={298} />
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
        <div className="space-y-3">
          <SourceRow source="TikTok" value={1240} percentage={45} />
          <SourceRow source="Instagram" value={820} percentage={30} />
          <SourceRow source="Direct" value={480} percentage={18} />
          <SourceRow source="Other" value={220} percentage={7} />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, change }: { label: string; value: string; change: string }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
    </div>
  );
}

function PageRow({ label, views }: { label: string; views: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
            style={{ width: `${(views / 900) * 100}%` }}
          />
        </div>
        <span className="text-gray-600 font-semibold">{views}</span>
      </div>
    </div>
  );
}

function SourceRow({ source, value, percentage }: { source: string; value: number; percentage: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 font-medium">{source}</span>
      <div className="flex items-center gap-3 flex-1 ml-6">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-pink-600 rounded-full" style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-gray-600 font-semibold">{value}</span>
      </div>
    </div>
  );
}
