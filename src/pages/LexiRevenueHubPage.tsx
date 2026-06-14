import React, { useState } from 'react';
import { ShoppingBag, Users, Zap, Link2, ChartBar as BarChart3, Plus } from 'lucide-react';
import { BundleBuilder } from '../components/BundleBuilder';

type TabType = 'overview' | 'bundles' | 'glowClub' | 'routines' | 'affiliates' | 'shopify';

export function LexiRevenueHubPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showBundleBuilder, setShowBundleBuilder] = useState(false);

  // Sample data
  const stats = [
    { label: 'Total Revenue', value: '$24,580', icon: ShoppingBag, color: 'pink' },
    { label: 'Glow Club Members', value: '342', icon: Users, color: 'purple' },
    { label: 'Bundle Sales', value: '1,203', icon: Zap, color: 'blue' },
    { label: 'Affiliate Clicks', value: '5,231', icon: Link2, color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Revenue Hub</h1>
        <p className="text-gray-600">Manage all revenue streams for Lexi Rose</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors: Record<string, { bg: string; text: string }> = {
            pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
            blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
            amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
          };
          const style = colors[stat.color];

          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <div className={`p-2 rounded-lg ${style.bg}`}>
                  <Icon className={`${style.text}`} size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 flex gap-8 overflow-x-auto">
        {['overview', 'bundles', 'glowClub', 'routines', 'affiliates', 'shopify'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            className={`px-4 py-4 font-medium pb-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'glowClub' ? 'Glow Club' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview */}
        {activeTab === 'overview' && <OverviewTab />}

        {/* Bundles */}
        {activeTab === 'bundles' && (
          <BundlesTab showBuilder={showBundleBuilder} onShowBuilder={setShowBundleBuilder} />
        )}

        {/* Glow Club */}
        {activeTab === 'glowClub' && <GlowClubTab />}

        {/* Routines */}
        {activeTab === 'routines' && <RoutinesTab />}

        {/* Affiliates */}
        {activeTab === 'affiliates' && <AffiliatesTab />}

        {/* Shopify */}
        {activeTab === 'shopify' && <ShopifyTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Stream</h3>
        <div className="space-y-3">
          <RevenueRow label="Digital Bundles" amount="$12,340" percentage={50} />
          <RevenueRow label="Glow Club" amount="$7,200" percentage={29} />
          <RevenueRow label="Affiliate Links" amount="$3,100" percentage={13} />
          <RevenueRow label="Routines" amount="$1,940" percentage={8} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <ActivityItem
            label="New Bundle Sold"
            detail="Summer Beauty Bundle"
            time="2 hours ago"
            amount="$49.99"
          />
          <ActivityItem
            label="Glow Club Member"
            detail="New annual subscription"
            time="4 hours ago"
            amount="$179/year"
          />
          <ActivityItem
            label="Affiliate Click"
            detail="Skincare Brand Product"
            time="6 hours ago"
            amount="+$2.50"
          />
          <ActivityItem
            label="Routine Purchased"
            detail="30-Day Glow Up Challenge"
            time="1 day ago"
            amount="$29.99"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2">
            <Plus size={18} />
            Create Bundle
          </button>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
            <Plus size={18} />
            Add Routine
          </button>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Zap size={18} />
            Sync Shopify
          </button>
        </div>
      </div>

      {/* Performance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance</h3>
        <div className="space-y-3">
          <PerformanceMetric label="Avg. Bundle Price" value="$45.67" />
          <PerformanceMetric label="Glow Club Retention" value="94.2%" />
          <PerformanceMetric label="Affiliate Conversion" value="3.8%" />
          <PerformanceMetric label="Routine Rating" value="4.8/5" />
        </div>
      </div>
    </div>
  );
}

function BundlesTab({
  showBuilder,
  onShowBuilder,
}: {
  showBuilder: boolean;
  onShowBuilder: (show: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Digital Bundles</h2>
        <button
          onClick={() => onShowBuilder(!showBuilder)}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          New Bundle
        </button>
      </div>

      {showBuilder && (
        <BundleBuilder
          onSave={() => {
            onShowBuilder(false);
            alert('Bundle saved!');
          }}
          onCancel={() => onShowBuilder(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Summer Beauty Bundle', price: '$49.99', sales: 234, revenue: '$11,697' },
          { title: '30-Day Glow Challenge', price: '$39.99', sales: 156, revenue: '$6,238' },
          { title: 'Skincare Starter Kit', price: '$29.99', sales: 89, revenue: '$2,669' },
        ].map((bundle) => (
          <div key={bundle.title} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{bundle.title}</h3>
            <div className="space-y-1 mb-3">
              <p className="text-sm text-gray-600">Price: {bundle.price}</p>
              <p className="text-sm text-gray-600">Sales: {bundle.sales}</p>
              <p className="text-sm font-medium text-pink-600">Revenue: {bundle.revenue}</p>
            </div>
            <button className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlowClubTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Active Members</p>
          <p className="text-3xl font-bold text-gray-900">342</p>
          <p className="text-sm text-green-600 mt-2">+23 this month</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
          <p className="text-3xl font-bold text-gray-900">$7,200</p>
          <p className="text-sm text-green-600 mt-2">+12% vs last month</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Retention Rate</p>
          <p className="text-3xl font-bold text-gray-900">94.2%</p>
          <p className="text-sm text-green-600 mt-2">Industry leading</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Glow Club Features</h3>
        <div className="space-y-2">
          <FeatureItem label="Exclusive Routines" enabled />
          <FeatureItem label="Priority Support" enabled />
          <FeatureItem label="Early Access" enabled />
          <FeatureItem label="Product Discounts" enabled />
          <FeatureItem label="Community Access" enabled />
        </div>
      </div>
    </div>
  );
}

function RoutinesTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Beauty Routines Marketplace</h2>
        <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2">
          <Plus size={20} />
          New Routine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: 'Morning Glow Routine',
            price: '$9.99',
            steps: 5,
            subscribers: 1240,
          },
          {
            title: '30-Day Glow Challenge',
            price: '$29.99',
            steps: 30,
            subscribers: 856,
          },
          {
            title: 'Evening Wind Down',
            price: '$12.99',
            steps: 6,
            subscribers: 634,
          },
        ].map((routine) => (
          <div key={routine.title} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{routine.title}</h3>
            <div className="space-y-1 mb-3 text-sm text-gray-600">
              <p>Price: {routine.price}</p>
              <p>Steps: {routine.steps}</p>
              <p className="text-pink-600 font-medium">Subscribers: {routine.subscribers}</p>
            </div>
            <button className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AffiliatesTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Affiliate Automation</h2>
        <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2">
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Product</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Clicks</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Conversions</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Revenue</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Skincare Brand A', clicks: 2341, conversions: 156, revenue: '$780' },
              { name: 'Beauty Tools Co', clicks: 1876, conversions: 98, revenue: '$490' },
              { name: 'Wellness Plus', clicks: 1456, conversions: 124, revenue: '$830' },
            ].map((product) => (
              <tr key={product.name} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 font-medium text-sm">{product.name}</td>
                <td className="py-3 px-4 text-gray-600 text-sm">{product.clicks.toLocaleString()}</td>
                <td className="py-3 px-4 text-gray-600 text-sm">{product.conversions}</td>
                <td className="py-3 px-4 text-pink-600 font-semibold text-sm">{product.revenue}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShopifyTab() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Shopify Integration</h3>
        <p className="text-sm text-blue-800 mb-3">
          Connect your Shopify store to automatically sync products and inventory.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Connect Shopify Store
        </button>
      </div>

      <div className="space-y-4">
        <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
          <p className="font-medium text-gray-900">Sync Now</p>
          <p className="text-sm text-gray-600">Last synced: 2 hours ago</p>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Connected Products</p>
            <p className="text-2xl font-bold text-gray-900">1,240</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Inventory</p>
            <p className="text-2xl font-bold text-gray-900">34,567</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Last Sync</p>
            <p className="text-2xl font-bold text-gray-900">2h ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenueRow({
  label,
  amount,
  percentage,
}: {
  label: string;
  amount: string;
  percentage: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 font-medium text-sm">{label}</span>
      <div className="flex items-center gap-3 flex-1 ml-4">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-gray-600 font-semibold text-right min-w-16">{amount}</span>
      </div>
    </div>
  );
}

function ActivityItem({
  label,
  detail,
  time,
  amount,
}: {
  label: string;
  detail: string;
  time: string;
  amount: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-600">{detail}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
      <span className="font-semibold text-gray-900">{amount}</span>
    </div>
  );
}

function PerformanceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2">
      <span className="text-gray-700 text-sm">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function FeatureItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-gray-700 text-sm">{label}</span>
      <span className={enabled ? 'text-green-600 font-medium text-sm' : 'text-gray-400 text-sm'}>
        {enabled ? '✓ Enabled' : '✗ Disabled'}
      </span>
    </div>
  );
}
