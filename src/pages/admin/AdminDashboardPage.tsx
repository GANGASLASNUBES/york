import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ChartBar as BarChart2, Users, Film, BookOpen, ArrowUpRight, ArrowDownRight, ChevronRight, Activity, Eye, ShoppingCart, Star, Zap, RefreshCw, Clock, Package, CreditCard, Globe, Target, Layers, ChartPie as PieChart, Hash } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

type TabId = 'tiktok' | 'revenue' | 'analytics' | 'glow' | 'content' | 'ledger';

interface StatCard {
  label: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  accent?: boolean;
}

interface TopVideo {
  id: string;
  title: string;
  views: number;
  clicks: number;
  conversions: number;
}

interface RevenueStream {
  source: string;
  amount: number;
  change: number;
  icon: React.ElementType;
}

interface ContentItem {
  id: string;
  title: string;
  type: 'script' | 'storyboard' | 'template' | 'asset';
  status: 'draft' | 'review' | 'approved' | 'live';
  updatedAt: string;
}

interface LedgerEntry {
  id: string;
  description: string;
  amount: number;
  type: 'inbound' | 'outbound';
  category: string;
  date: string;
}

// ─── Static mock data (real queries feed into this shape) ────────────────────

const MOCK_TOP_VIDEOS: TopVideo[] = [
  { id: '1', title: 'Glow Up Routine #7', views: 2_840_000, clicks: 142_000, conversions: 8_200 },
  { id: '2', title: 'LEXI City Haul 2026', views: 1_920_000, clicks: 96_000, conversions: 5_760 },
  { id: '3', title: 'Amazon Finds Under $30', views: 1_550_000, clicks: 124_000, conversions: 9_920 },
  { id: '4', title: 'Civic Art Walk NYC', views: 980_000, clicks: 39_200, conversions: 1_960 },
  { id: '5', title: 'Gear Drop Spring 26', views: 870_000, clicks: 52_200, conversions: 4_176 },
];

const MOCK_CONTENT: ContentItem[] = [
  { id: 'c1', title: 'Summer Glow Series Ep.1', type: 'script', status: 'approved', updatedAt: '2026-06-06' },
  { id: 'c2', title: 'Amazon Tech Haul Storyboard', type: 'storyboard', status: 'review', updatedAt: '2026-06-05' },
  { id: 'c3', title: 'Glow Club Intro Template', type: 'template', status: 'live', updatedAt: '2026-06-04' },
  { id: 'c4', title: 'LEXI Brand Reveal Asset Pack', type: 'asset', status: 'draft', updatedAt: '2026-06-03' },
  { id: 'c5', title: 'Civic Art Walk Script', type: 'script', status: 'approved', updatedAt: '2026-06-02' },
  { id: 'c6', title: 'CapCut Neon Transition', type: 'template', status: 'live', updatedAt: '2026-06-01' },
];

const MOCK_LEDGER: LedgerEntry[] = [
  { id: 'l1', description: 'Amazon Affiliate — May payout', amount: 14_820, type: 'inbound', category: 'Affiliate', date: '2026-06-01' },
  { id: 'l2', description: 'Glow Club MRR — June', amount: 28_600, type: 'inbound', category: 'Subscriptions', date: '2026-06-01' },
  { id: 'l3', description: 'Brand Deal — NovaSkin', amount: 8_000, type: 'inbound', category: 'Brand Deals', date: '2026-05-28' },
  { id: 'l4', description: 'CapCut Template Pack sales', amount: 3_420, type: 'inbound', category: 'Digital Products', date: '2026-05-27' },
  { id: 'l5', description: 'Studio equipment', amount: -2_300, type: 'outbound', category: 'Equipment', date: '2026-05-25' },
  { id: 'l6', description: 'Creator Studio — LEXI asset license', amount: 5_200, type: 'inbound', category: 'Licensing', date: '2026-05-24' },
  { id: 'l7', description: 'Cloud infra — Convex + Supabase', amount: -840, type: 'outbound', category: 'Infrastructure', date: '2026-06-01' },
  { id: 'l8', description: 'BIPS civic contract — Q2', amount: 12_000, type: 'inbound', category: 'Civic Contracts', date: '2026-04-01' },
];

// ─── Utility ─────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(decimals)}K`;
  return n.toLocaleString();
}

function fmtUsd(n: number) {
  return `$${Math.abs(n).toLocaleString()}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ label, value, change, icon: Icon, accent }: StatCard) {
  const positive = change !== undefined && change >= 0;
  return (
    <div
      className="relative overflow-hidden rounded-xl border p-5 flex flex-col gap-3 transition-all duration-200 hover:border-red-500/40"
      style={{ background: '#0a0a0a', borderColor: accent ? '#FF003340' : '#1a1a1a' }}
    >
      {accent && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, #FF003308 0%, transparent 60%)' }} />
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: accent ? '#FF003320' : '#111' }}
        >
          <Icon size={14} style={{ color: accent ? '#FF0033' : '#555' }} />
        </div>
      </div>
      <div className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {value}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 text-xs font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {positive
            ? <ArrowUpRight size={12} style={{ color: '#22c55e' }} />
            : <ArrowDownRight size={12} style={{ color: '#FF0033' }} />}
          <span style={{ color: positive ? '#22c55e' : '#FF0033' }}>{Math.abs(change)}%</span>
          <span style={{ color: '#444' }}>vs last month</span>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-black tracking-[0.2em] uppercase mb-4"
      style={{ color: '#FF0033', fontFamily: 'Montserrat, sans-serif' }}
    >
      {children}
    </h2>
  );
}

function Divider() {
  return <div className="h-px w-full my-6" style={{ background: '#1a1a1a' }} />;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'tiktok', label: 'TikTok', icon: Film },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'glow', label: 'Glow Club', icon: Star },
  { id: 'content', label: 'Content', icon: Layers },
  { id: 'ledger', label: 'Ledger', icon: BookOpen },
];

// ─── Module: TikTok Performance ───────────────────────────────────────────────

function TikTokModule() {
  const kpis: StatCard[] = [
    { label: 'Total Views', value: '8.2M', change: 14, icon: Eye, accent: true },
    { label: 'Link Clicks', value: '453K', change: 22, icon: Target },
    { label: 'Conversions', value: '30.1K', change: 9, icon: ShoppingCart },
    { label: 'Glow Club Signups', value: '1,204', change: 31, icon: Users, accent: true },
    { label: 'Amazon Clicks', value: '218K', change: 17, icon: Package },
    { label: 'Affiliate Revenue', value: '$14.8K', change: 12, icon: DollarSign },
  ];

  return (
    <div>
      <SectionTitle>TikTok Performance</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <SectionTitle>Top Performing Videos</SectionTitle>
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#1a1a1a' }}>
        <table className="w-full text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <thead>
            <tr style={{ background: '#0f0f0f', borderBottom: '1px solid #1a1a1a' }}>
              <th className="text-left px-4 py-3 font-semibold tracking-wider" style={{ color: '#444' }}>VIDEO</th>
              <th className="text-right px-4 py-3 font-semibold tracking-wider" style={{ color: '#444' }}>VIEWS</th>
              <th className="text-right px-4 py-3 font-semibold tracking-wider" style={{ color: '#444' }}>CLICKS</th>
              <th className="text-right px-4 py-3 font-semibold tracking-wider" style={{ color: '#444' }}>CONV.</th>
              <th className="text-right px-4 py-3 font-semibold tracking-wider" style={{ color: '#444' }}>CTR</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TOP_VIDEOS.map((v, i) => (
              <tr
                key={v.id}
                className="transition-colors"
                style={{ borderBottom: '1px solid #111', background: i % 2 === 0 ? '#0a0a0a' : 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FF003308')}
                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? '#0a0a0a' : 'transparent')}
              >
                <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black" style={{ background: '#FF003320', color: '#FF0033' }}>
                    {i + 1}
                  </span>
                  {v.title}
                </td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: '#aaa' }}>{fmt(v.views)}</td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: '#aaa' }}>{fmt(v.clicks)}</td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: '#22c55e' }}>{fmt(v.conversions)}</td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: '#FF0033' }}>
                  {((v.clicks / v.views) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Module: Revenue Streams ──────────────────────────────────────────────────

function RevenueModule() {
  const streams: RevenueStream[] = [
    { source: 'Amazon Affiliate', amount: 14_820, change: 12, icon: Package },
    { source: 'Glow Club MRR', amount: 28_600, change: 8, icon: Star },
    { source: 'Digital Products', amount: 3_420, change: 44, icon: Zap },
    { source: 'Brand Deals', amount: 8_000, change: -5, icon: Hash },
    { source: 'Creator Studio', amount: 5_200, change: 20, icon: Film },
    { source: 'Gear Merch', amount: 6_100, change: 3, icon: ShoppingCart },
    { source: 'Civic Contracts', amount: 12_000, change: 0, icon: Globe },
  ];

  const total = streams.reduce((s, r) => s + r.amount, 0);

  const kpis: StatCard[] = [
    { label: 'Total Revenue', value: fmtUsd(total), change: 11, icon: DollarSign, accent: true },
    { label: 'MRR', value: '$28.6K', change: 8, icon: TrendingUp, accent: true },
    { label: 'Avg. Deal Size', value: '$8,000', change: -5, icon: CreditCard },
    { label: 'Revenue Sources', value: '7', icon: PieChart },
  ];

  return (
    <div>
      <SectionTitle>Revenue Overview</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <SectionTitle>Streams Breakdown</SectionTitle>
      <div className="space-y-2">
        {streams.map((s) => {
          const pct = Math.round((s.amount / total) * 100);
          return (
            <div
              key={s.source}
              className="rounded-xl border p-4 flex items-center gap-4"
              style={{ background: '#0a0a0a', borderColor: '#1a1a1a' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#111' }}>
                <s.icon size={14} style={{ color: '#FF0033' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.source}</span>
                  <span className="text-sm font-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{fmtUsd(s.amount)}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: s.change >= 0 ? '#FF0033' : '#444' }}
                  />
                </div>
              </div>
              <div className="text-xs font-semibold w-14 text-right shrink-0" style={{ fontFamily: 'Montserrat, sans-serif', color: s.change > 0 ? '#22c55e' : s.change < 0 ? '#FF0033' : '#555' }}>
                {s.change > 0 ? '+' : ''}{s.change}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Module: Website Analytics ────────────────────────────────────────────────

function AnalyticsModule() {
  const [siteStats, setSiteStats] = useState<{ pageViews: number; sessions: number; bounceRate: number } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('ad_analytics')
          .select('views, clicks, conversions')
          .limit(50);
        if (data) {
          const views = data.reduce((s: number, r: any) => s + (r.views ?? 0), 0);
          const clicks = data.reduce((s: number, r: any) => s + (r.clicks ?? 0), 0);
          const conversions = data.reduce((s: number, r: any) => s + (r.conversions ?? 0), 0);
          setSiteStats({ pageViews: views || 241_000, sessions: clicks || 87_400, bounceRate: conversions && clicks ? Math.round((1 - conversions / clicks) * 100) : 42 });
        } else {
          setSiteStats({ pageViews: 241_000, sessions: 87_400, bounceRate: 42 });
        }
      } catch {
        setSiteStats({ pageViews: 241_000, sessions: 87_400, bounceRate: 42 });
      }
    }
    load();
  }, []);

  const kpis: StatCard[] = [
    { label: 'Page Views', value: fmt(siteStats?.pageViews ?? 241_000), change: 19, icon: Eye, accent: true },
    { label: 'Sessions', value: fmt(siteStats?.sessions ?? 87_400), change: 11, icon: Activity },
    { label: 'Product Clicks', value: '34.2K', change: 28, icon: ShoppingCart, accent: true },
    { label: 'Bounce Rate', value: `${siteStats?.bounceRate ?? 42}%`, change: -4, icon: TrendingUp },
    { label: 'Avg. Time on Page', value: '2m 14s', change: 8, icon: Clock },
    { label: 'Organic Search', value: '61%', change: 5, icon: Globe },
  ];

  const funnel = [
    { stage: 'Landing', value: 100 },
    { stage: 'Product View', value: 58 },
    { stage: 'Add to Cart', value: 24 },
    { stage: 'Checkout', value: 14 },
    { stage: 'Purchase', value: 9 },
  ];

  return (
    <div>
      <SectionTitle>Website Analytics</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <SectionTitle>Conversion Funnel</SectionTitle>
      <div className="space-y-2">
        {funnel.map((f) => (
          <div key={f.stage} className="flex items-center gap-4">
            <span className="text-xs font-semibold w-28 shrink-0" style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>{f.stage}</span>
            <div className="flex-1 h-7 rounded-md overflow-hidden relative" style={{ background: '#111' }}>
              <div
                className="h-full flex items-center px-3 transition-all duration-700"
                style={{ width: `${f.value}%`, background: f.value === 100 ? '#FF0033' : `rgba(255,0,51,${f.value / 120})` }}
              >
                <span className="text-xs font-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{f.value}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Divider />

      <SectionTitle>SEO Metrics</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Domain Authority', value: '42' },
          { label: 'Indexed Pages', value: '318' },
          { label: 'Backlinks', value: '1.4K' },
          { label: 'Core Web Vitals', value: 'Good' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border p-4 text-center" style={{ background: '#0a0a0a', borderColor: '#1a1a1a' }}>
            <div className="text-xl font-black text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>{m.value}</div>
            <div className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#444', fontFamily: 'Montserrat, sans-serif' }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Module: Glow Club Management ────────────────────────────────────────────

function GlowClubModule() {
  const kpis: StatCard[] = [
    { label: 'Active Members', value: '2,387', change: 8, icon: Users, accent: true },
    { label: 'MRR', value: '$28.6K', change: 8, icon: DollarSign, accent: true },
    { label: 'Churn Rate', value: '2.1%', change: -0.4, icon: TrendingUp },
    { label: 'Avg. LTV', value: '$342', change: 5, icon: Star },
    { label: 'New This Month', value: '204', change: 31, icon: ArrowUpRight },
    { label: 'At-Risk Members', value: '38', change: -12, icon: Activity },
  ];

  const tiers = [
    { name: 'Core', members: 1_240, mrr: 12_400, color: '#FF0033' },
    { name: 'Pro', members: 870, mrr: 11_310, color: '#cc0028' },
    { name: 'Elite', members: 277, mrr: 4_848, color: '#880018' },
  ];

  const recentActivity = [
    { id: 'a1', event: 'New signup', detail: 'Core tier via TikTok', time: '3m ago' },
    { id: 'a2', event: 'Upgrade', detail: 'Core → Pro', time: '18m ago' },
    { id: 'a3', event: 'Cancellation', detail: 'Pro tier — price concern', time: '42m ago' },
    { id: 'a4', event: 'New signup', detail: 'Elite tier via Creator Studio', time: '1h ago' },
    { id: 'a5', event: 'Renewal', detail: 'Pro tier — 6-month', time: '2h ago' },
  ];

  return (
    <div>
      <SectionTitle>Glow Club Overview</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <SectionTitle>Tier Distribution</SectionTitle>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {tiers.map((t) => (
          <div key={t.name} className="rounded-xl border p-5" style={{ background: '#0a0a0a', borderColor: '#1a1a1a', borderTop: `2px solid ${t.color}` }}>
            <div className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: t.color, fontFamily: 'Montserrat, sans-serif' }}>{t.name}</div>
            <div className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.members.toLocaleString()}</div>
            <div className="text-xs text-white/40" style={{ fontFamily: 'Montserrat, sans-serif' }}>{fmtUsd(t.mrr)}/mo</div>
          </div>
        ))}
      </div>

      <SectionTitle>Recent Member Activity</SectionTitle>
      <div className="space-y-1.5">
        {recentActivity.map((a) => (
          <div key={a.id} className="rounded-lg border px-4 py-3 flex items-center justify-between" style={{ background: '#0a0a0a', borderColor: '#111' }}>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: a.event === 'Cancellation' ? '#FF0033' : '#22c55e' }} />
              <div>
                <span className="text-xs font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{a.event}</span>
                <span className="text-xs ml-2" style={{ color: '#555', fontFamily: 'Montserrat, sans-serif' }}>{a.detail}</span>
              </div>
            </div>
            <span className="text-[10px]" style={{ color: '#333', fontFamily: 'Montserrat, sans-serif' }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Module: Content Pipeline ─────────────────────────────────────────────────

const STATUS_COLORS: Record<ContentItem['status'], string> = {
  draft: '#333',
  review: '#f59e0b',
  approved: '#22c55e',
  live: '#FF0033',
};

const TYPE_LABELS: Record<ContentItem['type'], string> = {
  script: 'Script',
  storyboard: 'Board',
  template: 'Template',
  asset: 'Asset',
};

function ContentModule() {
  const counts = {
    draft: MOCK_CONTENT.filter((c) => c.status === 'draft').length,
    review: MOCK_CONTENT.filter((c) => c.status === 'review').length,
    approved: MOCK_CONTENT.filter((c) => c.status === 'approved').length,
    live: MOCK_CONTENT.filter((c) => c.status === 'live').length,
  };

  return (
    <div>
      <SectionTitle>Content Pipeline</SectionTitle>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {(Object.entries(counts) as [ContentItem['status'], number][]).map(([status, count]) => (
          <div key={status} className="rounded-xl border p-4 text-center" style={{ background: '#0a0a0a', borderColor: '#1a1a1a' }}>
            <div className="text-2xl font-black mb-1" style={{ color: STATUS_COLORS[status], fontFamily: 'Montserrat, sans-serif' }}>{count}</div>
            <div className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#333', fontFamily: 'Montserrat, sans-serif' }}>{status}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {MOCK_CONTENT.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border p-4 flex items-center gap-4 transition-all duration-150 cursor-pointer"
            style={{ background: '#0a0a0a', borderColor: '#1a1a1a' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#FF003340'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a'; }}
          >
            <div
              className="w-16 text-center text-[9px] font-black tracking-widest uppercase py-1 rounded"
              style={{ background: '#111', color: '#555', fontFamily: 'Montserrat, sans-serif' }}
            >
              {TYPE_LABELS[c.type]}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-white truncate block" style={{ fontFamily: 'Montserrat, sans-serif' }}>{c.title}</span>
              <span className="text-[10px]" style={{ color: '#333', fontFamily: 'Montserrat, sans-serif' }}>Updated {c.updatedAt}</span>
            </div>
            <div
              className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded"
              style={{ background: `${STATUS_COLORS[c.status]}18`, color: STATUS_COLORS[c.status], fontFamily: 'Montserrat, sans-serif' }}
            >
              {c.status}
            </div>
            <ChevronRight size={12} style={{ color: '#333' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Module: Financial Ledger ─────────────────────────────────────────────────

function LedgerModule() {
  const inbound = MOCK_LEDGER.filter((l) => l.type === 'inbound').reduce((s, l) => s + l.amount, 0);
  const outbound = Math.abs(MOCK_LEDGER.filter((l) => l.type === 'outbound').reduce((s, l) => s + l.amount, 0));
  const profit = inbound - outbound;
  const reinvestmentPct = Math.round((outbound / inbound) * 100);

  const kpis: StatCard[] = [
    { label: 'Total Inbound', value: fmtUsd(inbound), change: 11, icon: ArrowUpRight, accent: true },
    { label: 'Total Outbound', value: fmtUsd(outbound), change: 3, icon: ArrowDownRight },
    { label: 'Net Profit', value: fmtUsd(profit), change: 14, icon: TrendingUp, accent: true },
    { label: 'Reinvestment Rate', value: `${reinvestmentPct}%`, icon: RefreshCw },
  ];

  const categoryTotals = MOCK_LEDGER.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] ?? 0) + l.amount;
    return acc;
  }, {});

  return (
    <div>
      <SectionTitle>Financial Overview</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <SectionTitle>Revenue by Category</SectionTitle>
          <div className="space-y-2">
            {Object.entries(categoryTotals)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, val]) => (
                <div key={cat} className="flex items-center justify-between text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span style={{ color: '#666' }}>{cat}</span>
                  <span className="font-semibold text-white">{fmtUsd(val)}</span>
                </div>
              ))}
          </div>
        </div>
        <div>
          <SectionTitle>Expenses by Category</SectionTitle>
          <div className="space-y-2">
            {Object.entries(categoryTotals)
              .filter(([, v]) => v < 0)
              .map(([cat, val]) => (
                <div key={cat} className="flex items-center justify-between text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span style={{ color: '#666' }}>{cat}</span>
                  <span className="font-semibold" style={{ color: '#FF0033' }}>{fmtUsd(val)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <SectionTitle>Transaction Log</SectionTitle>
      <div className="space-y-1.5">
        {MOCK_LEDGER.map((l) => (
          <div
            key={l.id}
            className="rounded-lg border px-4 py-3 flex items-center gap-4"
            style={{ background: '#0a0a0a', borderColor: '#111' }}
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: l.type === 'inbound' ? '#22c55e' : '#FF0033' }}
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-white block truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{l.description}</span>
              <span className="text-[10px]" style={{ color: '#333', fontFamily: 'Montserrat, sans-serif' }}>{l.category} · {l.date}</span>
            </div>
            <span
              className="text-sm font-black shrink-0"
              style={{ color: l.type === 'inbound' ? '#22c55e' : '#FF0033', fontFamily: 'Montserrat, sans-serif' }}
            >
              {l.type === 'inbound' ? '+' : '−'}{fmtUsd(l.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tiktok');

  return (
    <div className="min-h-screen" style={{ background: '#000', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{ background: 'rgba(0,0,0,0.95)', borderColor: '#1a1a1a', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span
                className="text-lg font-black tracking-[0.15em] uppercase"
                style={{ color: '#fff', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }}
              >
                BIPS
                <span style={{ color: '#FF0033' }}> COMMAND</span>
              </span>
              <span className="text-[9px] font-semibold tracking-[0.25em] uppercase" style={{ color: '#333' }}>
                Admin Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#22c55e' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
              Live
            </div>
            <div className="text-[10px]" style={{ color: '#333', fontFamily: 'Montserrat, sans-serif' }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-0 overflow-x-auto" style={{ borderTop: '1px solid #111' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wider uppercase transition-all duration-150 whitespace-nowrap relative"
                style={{
                  color: active ? '#FF0033' : '#333',
                  fontFamily: 'Montserrat, sans-serif',
                  borderBottom: active ? '2px solid #FF0033' : '2px solid transparent',
                  background: 'transparent',
                }}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'tiktok' && <TikTokModule />}
        {activeTab === 'revenue' && <RevenueModule />}
        {activeTab === 'analytics' && <AnalyticsModule />}
        {activeTab === 'glow' && <GlowClubModule />}
        {activeTab === 'content' && <ContentModule />}
        {activeTab === 'ledger' && <LedgerModule />}
      </main>
    </div>
  );
}
