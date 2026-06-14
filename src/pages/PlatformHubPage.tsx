import { useState } from 'react';
import { Activity, TriangleAlert as AlertTriangle, ChartBar as BarChart2, Bell, Blocks, BookOpen, Bot, Clipboard, Cloud, Code as Code2, Cpu, ExternalLink, Eye, FileText, Flame, Gamepad2, Globe, Heart, Image, Key, Layers, LayoutDashboard, Map, MapPin, MessageSquare, Monitor, Package, Palette, Puzzle, Radio, Settings, Shield, ShoppingBag, Sparkles, Star, Terminal, Tv as Tv2, User, Users, Wrench, Zap, CircleCheck as CheckCircle2, Circle as XCircle, CircleAlert as AlertCircle } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Status = 'active' | 'stub' | 'incomplete' | 'not-needed';
type Domain = 'lexi' | 'bips' | 'gear' | 'ops' | 'admin' | 'civic' | 'leach';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
  status: Status;
  domain: Domain;
  auth?: 'public' | 'user' | 'admin';
}

// ─── Route Registry ────────────────────────────────────────────────────────────

const ROUTES: NavItem[] = [
  // Public / Root
  { label: 'Gear Store', href: '/', icon: Gamepad2, description: 'ᗺIPS Gear landing — gaming peripherals and accessories', status: 'active', domain: 'gear', auth: 'public' },
  { label: 'Auth / Login', href: '/auth/login', icon: Key, description: 'Supabase email/password authentication', status: 'active', domain: 'admin', auth: 'public' },
  { label: 'Auth / Register', href: '/auth/register', icon: User, description: 'New account registration', status: 'active', domain: 'admin', auth: 'public' },

  // Ops Control Panel
  { label: 'Operations Panel', href: '/ops', icon: Monitor, description: 'Tri-site control center — real-time stats, alerts, workboard, session', status: 'active', domain: 'ops', auth: 'public' },

  // BIPS Public
  { label: 'Civic Intel Map', href: '/bips/civic-intel', icon: Map, description: 'Real-time Montreal civic data, pins, stories, heat index map', status: 'active', domain: 'civic', auth: 'public' },
  { label: 'City Trails', href: '/bips/city-trails', icon: MapPin, description: 'Montreal art, parks, festivals, and safety trails', status: 'active', domain: 'civic', auth: 'public' },
  { label: 'Neighborhoods', href: '/bips/neighborhoods', icon: Layers, description: 'Borough mood rings, neighborhood snapshots', status: 'active', domain: 'civic', auth: 'public' },
  { label: 'Civic Stories (Lexi)', href: '/lexi/civic-stories', icon: BookOpen, description: 'Civic stories from the LexiRose domain', status: 'active', domain: 'lexi', auth: 'public' },
  { label: 'Gear Civic Modes', href: '/gear/civic-modes', icon: Wrench, description: 'Gear-domain civic mode configurations', status: 'active', domain: 'gear', auth: 'public' },

  // User (authenticated)
  { label: 'My Alerts', href: '/my/alerts', icon: Bell, description: 'User-managed civic alert subscriptions', status: 'active', domain: 'civic', auth: 'user' },
  { label: 'My Maps', href: '/my/maps', icon: Map, description: 'Saved map configurations per user', status: 'active', domain: 'civic', auth: 'user' },
  { label: 'My Pins', href: '/my/pins', icon: MapPin, description: 'User-created location pins on the civic map', status: 'active', domain: 'civic', auth: 'user' },
  { label: 'My Stories', href: '/my/stories', icon: FileText, description: 'User-authored civic stories', status: 'active', domain: 'civic', auth: 'user' },
  { label: 'Collab Maps', href: '/my/collab-maps', icon: Users, description: 'Real-time collaborative map editing', status: 'active', domain: 'civic', auth: 'user' },

  // Admin
  { label: 'Civic Command', href: '/admin/civic-command', icon: Terminal, description: 'Admin panel for civic data source management and seed', status: 'active', domain: 'admin', auth: 'admin' },
  { label: 'Translation Console', href: '/admin/translations', icon: Globe, description: 'i18n translation editor for all four languages', status: 'active', domain: 'admin', auth: 'admin' },

  // LEACH Copilots
  { label: 'LEACH Admin Copilot', href: '/leach/admin/copilot', icon: Bot, description: 'AI-assisted admin workboard and ops support via Supabase edge function', status: 'active', domain: 'leach', auth: 'public' },
  { label: 'LEACH Lexi Copilot', href: '/leach/lexi/copilot', icon: Sparkles, description: 'AI assistant for LexiRose audience engagement and content', status: 'active', domain: 'leach', auth: 'public' },

  // /app/* — BIPS Domain (admin-gated)
  { label: 'BIPS Dashboard', href: '/app/', icon: LayoutDashboard, description: 'Main BIPS admin dashboard (contacts, sites, events summary)', status: 'active', domain: 'bips', auth: 'admin' },
  { label: 'BIPS Contacts', href: '/app/contacts', icon: Users, description: 'Contacts management with trust profiles and channels', status: 'active', domain: 'bips', auth: 'admin' },
  { label: 'BIPS Sites', href: '/app/sites', icon: MapPin, description: 'Site registry: shelter, field, work locations', status: 'active', domain: 'bips', auth: 'admin' },
  { label: 'BIPS Provenance', href: '/app/provenance', icon: Layers, description: 'Artifact and recipe provenance tracking', status: 'active', domain: 'bips', auth: 'admin' },
  { label: 'BIPS Rituals', href: '/app/rituals', icon: Radio, description: 'Daily ritual and ceremony flows', status: 'active', domain: 'bips', auth: 'admin' },
  { label: 'BIPS HUD Telemetry', href: '/app/hud', icon: Cpu, description: 'AR HUD session telemetry viewer', status: 'active', domain: 'bips', auth: 'admin' },

  // /app/* — LEACH sub-system (BIPS domain)
  { label: 'LEACH Login', href: '/app/leach', icon: Key, description: 'LEACH protocol authentication portal', status: 'active', domain: 'leach', auth: 'admin' },
  { label: 'LEACH Lexi Dashboard', href: '/app/leach/dashboard', icon: Tv2, description: 'Lexi-side LEACH workboard and session dashboard', status: 'active', domain: 'leach', auth: 'admin' },
  { label: 'LEACH Kee Admin', href: '/app/leach/admin', icon: Shield, description: 'Kee (admin) side LEACH sync protocol and ops view', status: 'active', domain: 'leach', auth: 'admin' },
  { label: 'LEACH Sync Protocol', href: '/app/leach/sync-protocol', icon: Zap, description: 'Sync ritual viewer in user mode', status: 'active', domain: 'leach', auth: 'admin' },

  // /app/* — LexiRose Domain (admin-gated)
  { label: 'Lexi Home (Domain)', href: '/app/', icon: Tv2, description: 'LexiRose domain landing — placeholder, links to main pages', status: 'stub', domain: 'lexi', auth: 'admin' },
  { label: 'Lexi Products (Domain)', href: '/app/products', icon: ShoppingBag, description: 'Products page stub — text placeholder only', status: 'stub', domain: 'lexi', auth: 'admin' },
  { label: 'Lexi Downloads (Domain)', href: '/app/downloads', icon: FileText, description: 'Downloads page stub — text placeholder only', status: 'stub', domain: 'lexi', auth: 'admin' },
  { label: 'Lexi Routines (Domain)', href: '/app/routines', icon: Heart, description: 'Routines page stub — text placeholder only', status: 'stub', domain: 'lexi', auth: 'admin' },
  { label: 'Lexi Admin', href: '/app/admin', icon: Settings, description: 'LexiRose admin dashboard — content management', status: 'active', domain: 'lexi', auth: 'admin' },
  { label: 'Revenue Hub', href: '/app/revenue', icon: BarChart2, description: 'Revenue streams: bundles, subscriptions, affiliates, Shopify', status: 'active', domain: 'lexi', auth: 'admin' },
  { label: 'Glow Club', href: '/app/glow-club', icon: Star, description: 'Glow Club subscription landing and management', status: 'active', domain: 'lexi', auth: 'admin' },
  { label: 'AI Routine Generator', href: '/app/ai-routine', icon: Bot, description: 'AI-powered beauty routine builder via Supabase edge function', status: 'active', domain: 'lexi', auth: 'admin' },
  { label: 'Bundles', href: '/app/bundles', icon: Package, description: 'Bundle creation and management for digital product sets', status: 'active', domain: 'lexi', auth: 'admin' },
  { label: 'Routines Marketplace', href: '/app/marketplace', icon: ShoppingBag, description: 'Beauty routines for sale in the marketplace', status: 'active', domain: 'lexi', auth: 'admin' },

  // /app/* — Gear Domain (admin-gated)
  { label: 'Gear Catalog (Domain)', href: '/app/catalog', icon: Package, description: 'Gear catalog stub — placeholder in domain context', status: 'stub', domain: 'gear', auth: 'admin' },
  { label: 'Field Kits (Domain)', href: '/app/field-kits', icon: Wrench, description: 'Field kits stub — placeholder text only', status: 'stub', domain: 'gear', auth: 'admin' },
  { label: 'AR Accessories (Domain)', href: '/app/ar-accessories', icon: Cpu, description: 'AR accessories stub — placeholder text only', status: 'stub', domain: 'gear', auth: 'admin' },
  { label: 'Gear Configurator', href: '/app/configurator', icon: Gamepad2, description: 'Interactive gear build configurator with Convex persistence', status: 'active', domain: 'gear', auth: 'admin' },

  // Analytics (cross-domain)
  { label: 'Analytics (Site)', href: '/app/analytics', icon: Activity, description: 'Per-site analytics: page views, events, purchases', status: 'active', domain: 'admin', auth: 'admin' },
  { label: 'Cross-Domain Analytics', href: '/app/analytics/cross-domain', icon: BarChart2, description: 'Unified analytics across all three sites', status: 'active', domain: 'admin', auth: 'admin' },

  // Advertising Hub (unrouted — accessible via /app/advertising via creator studio)
  { label: 'Advertising Hub', href: '/app/advertising', icon: Flame, description: 'Ad campaign management — not wired to main router', status: 'incomplete', domain: 'admin', auth: 'admin' },
  { label: 'Campaign Builder', href: '/app/advertising/campaigns/new', icon: Blocks, description: 'Multi-step campaign creation — not wired to main router', status: 'incomplete', domain: 'admin', auth: 'admin' },
  { label: 'Asset Library', href: '/app/advertising/assets', icon: Image, description: 'Media asset library for ad creatives — not wired', status: 'incomplete', domain: 'admin', auth: 'admin' },

  // Creator Studio (unrouted)
  { label: 'Creator Studio', href: '/app/creator', icon: Palette, description: 'Design editor entry — not wired to main router', status: 'incomplete', domain: 'admin', auth: 'admin' },
  { label: 'Clothing Creator', href: '/app/creator/clothing', icon: ShoppingBag, description: 'Printful-based clothing design tool — not wired', status: 'incomplete', domain: 'admin', auth: 'admin' },

  // Not needed / legacy
  { label: 'HomePage', href: '/home', icon: LayoutDashboard, description: 'Generic home page — superseded by domain-specific landing', status: 'not-needed', domain: 'admin', auth: 'public' },
  { label: 'LoginPage (legacy)', href: '/login', icon: Key, description: 'Old login page — replaced by /auth/login', status: 'not-needed', domain: 'admin', auth: 'public' },
  { label: 'DashboardPage (generic)', href: '/dashboard', icon: LayoutDashboard, description: 'Generic dashboard — superseded by per-domain dashboards', status: 'not-needed', domain: 'admin', auth: 'public' },
  { label: 'MontrealHomePage', href: '/montreal', icon: MapPin, description: 'Montreal-specific home — not in router, superseded by civic-intel', status: 'not-needed', domain: 'civic', auth: 'public' },
  { label: 'AvatarDetailPage', href: '/avatar/:id', icon: User, description: 'Avatar detail — not wired to router, feature not prioritized', status: 'not-needed', domain: 'bips', auth: 'public' },
  { label: 'MobileStorePage', href: '/store/mobile', icon: ShoppingBag, description: 'Mobile store description page — not in router', status: 'not-needed', domain: 'gear', auth: 'public' },
  { label: 'AboutPage', href: '/about', icon: BookOpen, description: 'Generic about page — not wired to router', status: 'not-needed', domain: 'admin', auth: 'public' },
  { label: 'ArtPage', href: '/art', icon: Image, description: 'Art gallery — not wired to router', status: 'not-needed', domain: 'admin', auth: 'public' },
  { label: 'ClothingPage', href: '/clothing', icon: ShoppingBag, description: 'Clothing catalog — not wired to router', status: 'not-needed', domain: 'admin', auth: 'public' },
  { label: 'ChatPage', href: '/chat', icon: MessageSquare, description: 'Convex chat — not wired to router, feature paused', status: 'not-needed', domain: 'bips', auth: 'admin' },
  { label: 'SiteDetailPage', href: '/sites/:id', icon: MapPin, description: 'Site detail — not wired to router', status: 'not-needed', domain: 'bips', auth: 'public' },
];

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; cls: string; dotCls: string }> = {
  active: { label: 'Active', icon: CheckCircle2, cls: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/30', dotCls: 'bg-emerald-400' },
  stub: { label: 'Stub / Placeholder', icon: AlertCircle, cls: 'text-amber-400 bg-amber-900/30 border-amber-700/30', dotCls: 'bg-amber-400' },
  incomplete: { label: 'Incomplete / Unrouted', icon: AlertTriangle, cls: 'text-orange-400 bg-orange-900/30 border-orange-700/30', dotCls: 'bg-orange-400' },
  'not-needed': { label: 'Not Needed', icon: XCircle, cls: 'text-slate-500 bg-slate-800/30 border-slate-700/30', dotCls: 'bg-slate-600' },
};

const DOMAIN_CONFIG: Record<Domain, { label: string; color: string }> = {
  lexi: { label: 'LexiRose', color: 'text-rose-400' },
  bips: { label: 'BIPS MTL', color: 'text-cyan-400' },
  gear: { label: 'Gear', color: 'text-amber-400' },
  ops: { label: 'Ops', color: 'text-slate-300' },
  admin: { label: 'Admin / Shared', color: 'text-slate-400' },
  civic: { label: 'Civic', color: 'text-emerald-400' },
  leach: { label: 'LEACH', color: 'text-violet-400' },
};

const AUTH_CONFIG: Record<string, { label: string; cls: string }> = {
  public: { label: 'Public', cls: 'text-slate-400 bg-slate-800/40' },
  user: { label: 'Auth', cls: 'text-sky-400 bg-sky-900/20' },
  admin: { label: 'Admin', cls: 'text-rose-400 bg-rose-900/20' },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function PlatformHubPage() {
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('all');

  const visible = ROUTES.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (domainFilter !== 'all' && r.domain !== domainFilter) return false;
    return true;
  });

  const counts: Record<Status, number> = {
    active: ROUTES.filter((r) => r.status === 'active').length,
    stub: ROUTES.filter((r) => r.status === 'stub').length,
    incomplete: ROUTES.filter((r) => r.status === 'incomplete').length,
    'not-needed': ROUTES.filter((r) => r.status === 'not-needed').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe size={20} className="text-slate-400" />
                <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">ᗺIPS Unified Platform</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-100">Platform Navigation Hub</h1>
              <p className="text-slate-500 text-sm mt-1">All interfaces, routes, and their deployment status in one place</p>
            </div>
            <div className="sm:ml-auto flex gap-4 text-sm">
              <a href="/ops" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-100 transition-colors">
                <Monitor size={14} />
                Ops Panel
              </a>
              <a href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-100 transition-colors">
                <Gamepad2 size={14} />
                Gear Store
              </a>
            </div>
          </div>

          {/* Summary counts */}
          <div className="flex flex-wrap gap-3 mt-6">
            {(Object.keys(STATUS_CONFIG) as Status[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const Icon = cfg.icon;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(filter === s ? 'all' : s)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    filter === s ? cfg.cls + ' ring-1 ring-current' : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={12} />
                  {cfg.label}
                  <span className="opacity-70">{counts[s]}</span>
                </button>
              );
            })}
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-200 transition-colors">
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Domain filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDomainFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${domainFilter === 'all' ? 'bg-slate-700 text-slate-100' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'}`}
          >
            All Domains
          </button>
          {(Object.keys(DOMAIN_CONFIG) as Domain[]).map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(domainFilter === d ? 'all' : d)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${domainFilter === d ? 'bg-slate-700 text-slate-100' : `bg-slate-800/60 ${DOMAIN_CONFIG[d].color} hover:opacity-100 opacity-70`}`}
            >
              {DOMAIN_CONFIG[d].label}
            </button>
          ))}
        </div>

        {/* Route table */}
        <div className="space-y-1">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-slate-600 uppercase tracking-wider font-medium">
            <div className="col-span-4">Route / Interface</div>
            <div className="col-span-1 hidden md:block">Domain</div>
            <div className="col-span-1 hidden md:block">Auth</div>
            <div className="col-span-4 hidden md:block">Description</div>
            <div className="col-span-2">Status</div>
          </div>

          {visible.map((item) => {
            const sc = STATUS_CONFIG[item.status];
            const StatusIcon = sc.icon;
            const dc = DOMAIN_CONFIG[item.domain];
            const ac = AUTH_CONFIG[item.auth ?? 'public'];
            const isClickable = item.status === 'active';

            return (
              <div
                key={item.href + item.label}
                className={`group grid grid-cols-12 gap-2 px-4 py-3 rounded-xl border transition-all ${
                  item.status === 'not-needed'
                    ? 'border-transparent opacity-40 hover:opacity-60'
                    : item.status === 'active'
                    ? 'border-slate-700/30 bg-slate-800/30 hover:border-slate-600/50 hover:bg-slate-800/50'
                    : 'border-slate-800/40 bg-slate-900/20 hover:bg-slate-900/40'
                }`}
              >
                {/* Name + href */}
                <div className="col-span-4 md:col-span-4 flex items-center gap-2.5 min-w-0">
                  <item.icon size={14} className={item.status === 'active' ? dc.color : 'text-slate-600'} />
                  <div className="min-w-0">
                    {isClickable ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-slate-200 hover:text-white truncate block"
                      >
                        {item.label}
                        <ExternalLink size={10} className="inline ml-1 opacity-0 group-hover:opacity-50" />
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-slate-400 truncate block">{item.label}</span>
                    )}
                    <span className="text-xs text-slate-600 font-mono truncate block">{item.href}</span>
                  </div>
                </div>

                {/* Domain */}
                <div className="col-span-1 hidden md:flex items-center">
                  <span className={`text-xs font-medium ${dc.color}`}>{dc.label}</span>
                </div>

                {/* Auth */}
                <div className="col-span-1 hidden md:flex items-center">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ac.cls}`}>{ac.label}</span>
                </div>

                {/* Description */}
                <div className="col-span-4 hidden md:flex items-center">
                  <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                </div>

                {/* Status */}
                <div className="col-span-8 md:col-span-2 flex items-center gap-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${sc.dotCls} ${item.status === 'active' ? 'animate-pulse' : ''}`} />
                  <span className={`text-xs font-medium ${sc.cls.split(' ')[0]}`}>{sc.label}</span>
                </div>
              </div>
            );
          })}

          {visible.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-12">No routes match the current filter.</p>
          )}
        </div>

        {/* Deployment requirements */}
        <section className="border-t border-slate-800/60 pt-8">
          <h2 className="text-slate-200 font-bold text-lg mb-6 flex items-center gap-2">
            <Cloud size={18} className="text-slate-400" />
            Deployment Requirements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Convex */}
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={15} className="text-amber-400" />
                <span className="font-semibold text-slate-200">Convex</span>
                <span className="ml-auto text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/20 px-2 py-0.5 rounded">Required</span>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Create project at convex.dev</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Set <code className="text-amber-300 text-xs">VITE_CONVEX_URL</code> in .env</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Run <code className="text-amber-300 text-xs">npx convex deploy</code></li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />All convex/*.ts files auto-deploy</li>
                <li className="flex items-start gap-2"><AlertCircle size={12} className="text-amber-400 mt-0.5 shrink-0" /><span>Auth requires <code className="text-amber-300 text-xs">convex/auth.config.ts</code> with JWT provider</span></li>
              </ul>
            </div>

            {/* Supabase */}
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={15} className="text-emerald-400" />
                <span className="font-semibold text-slate-200">Supabase</span>
                <span className="ml-auto text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/20 px-2 py-0.5 rounded">Required</span>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Project already provisioned</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" /><code className="text-amber-300 text-xs">VITE_SUPABASE_URL</code> + <code className="text-amber-300 text-xs">VITE_SUPABASE_ANON_KEY</code></li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Run all migrations in <code className="text-amber-300 text-xs">supabase/migrations/</code></li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />8 Edge Functions deployed via MCP</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Email auth enabled in Supabase dashboard</li>
              </ul>
            </div>

            {/* Frontend Hosting */}
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Cloud size={15} className="text-sky-400" />
                <span className="font-semibold text-slate-200">Frontend (Vercel)</span>
                <span className="ml-auto text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/20 px-2 py-0.5 rounded">Required</span>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" /><code className="text-amber-300 text-xs">npm run build</code> — builds to <code className="text-amber-300 text-xs">dist/</code></li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Set all VITE_* env vars in Vercel dashboard</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Configure SPA rewrites: all paths → <code className="text-amber-300 text-xs">index.html</code></li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Domain routing via hostname detection (no server config needed)</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />PWA: <code className="text-amber-300 text-xs">public/manifest.json</code> + <code className="text-amber-300 text-xs">sw.js</code> included in dist</li>
              </ul>
            </div>

            {/* Environment Variables */}
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Key size={15} className="text-amber-400" />
                <span className="font-semibold text-slate-200">Environment Variables</span>
                <span className="ml-auto text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/20 px-2 py-0.5 rounded">Required</span>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-400 font-mono">
                <li className="flex items-start gap-2"><span className="text-amber-300 text-xs">VITE_CONVEX_URL</span></li>
                <li className="flex items-start gap-2"><span className="text-amber-300 text-xs">VITE_SUPABASE_URL</span></li>
                <li className="flex items-start gap-2"><span className="text-amber-300 text-xs">VITE_SUPABASE_ANON_KEY</span></li>
                <li className="flex items-start gap-2"><span className="text-amber-300 text-xs">VITE_OPENAI_API_KEY</span><span className="text-slate-500 font-sans text-xs ml-1">(AI copilots)</span></li>
                <li className="flex items-start gap-2"><span className="text-amber-300 text-xs">VITE_PRINTFUL_API_KEY</span><span className="text-slate-500 font-sans text-xs ml-1">(clothing)</span></li>
                <li className="flex items-start gap-2"><span className="text-amber-300 text-xs">VITE_MAPBOX_TOKEN</span><span className="text-slate-500 font-sans text-xs ml-1">(optional map tiles)</span></li>
              </ul>
            </div>

            {/* PWA / Mobile */}
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={15} className="text-sky-400" />
                <span className="font-semibold text-slate-200">PWA Install</span>
                <span className="ml-auto text-xs text-sky-400 bg-sky-900/20 border border-sky-700/20 px-2 py-0.5 rounded">Optional</span>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Navigate to <code className="text-amber-300 text-xs">/ops</code> in Chrome/Edge</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Browser menu → "Install App" or "Add to Home Screen"</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Works on Android (Chrome) and desktop</li>
                <li className="flex items-start gap-2"><AlertCircle size={12} className="text-amber-400 mt-0.5 shrink-0" />Add icons to <code className="text-amber-300 text-xs">public/icons/</code> (192x192, 512x512)</li>
                <li className="flex items-start gap-2"><AlertCircle size={12} className="text-amber-400 mt-0.5 shrink-0" />HTTPS required for service worker</li>
              </ul>
            </div>

            {/* Domain Config */}
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={15} className="text-slate-400" />
                <span className="font-semibold text-slate-200">Multi-Domain Routing</span>
                <span className="ml-auto text-xs text-sky-400 bg-sky-900/20 border border-sky-700/20 px-2 py-0.5 rounded">Optional</span>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" /><code className="text-amber-300 text-xs">bipsgear.com</code> → GEAR_SITE (default)</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" /><code className="text-amber-300 text-xs">bipsmontreal.com</code> → BIPS_SITE</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" /><code className="text-amber-300 text-xs">lexirose.ca</code> → LEXI_SITE</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />All 3 domains point to same Vercel deployment</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />Domain detection is purely client-side via hostname</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tech stack */}
        <section className="border-t border-slate-800/60 pt-8">
          <h2 className="text-slate-200 font-bold text-lg mb-4 flex items-center gap-2">
            <Code2 size={18} className="text-slate-400" />
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              'React 19.2', 'TypeScript 5.9', 'Vite 7.2', 'Tailwind CSS 3.4',
              'React Router 7.12', 'Convex 1.15', 'Supabase 2.105',
              'Leaflet / React-Leaflet', 'Lucide React', 'i18next (EN/FR/ES/ZH)',
              'PWA (manifest + service worker)', 'Deno Edge Functions',
            ].map((t) => (
              <span key={t} className="px-2.5 py-1 bg-slate-800/60 border border-slate-700/30 text-slate-400 text-xs rounded-lg">
                {t}
              </span>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-slate-800/40 py-4 mt-8">
        <p className="text-xs text-slate-600 text-center">
          ᗺIPS Unified Platform &mdash; Platform Navigation Hub &mdash; {new Date().toLocaleDateString('en-CA')}
        </p>
      </footer>
    </div>
  );
}
