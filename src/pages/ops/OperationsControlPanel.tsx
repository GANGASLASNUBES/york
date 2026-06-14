import { useState, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Activity, TriangleAlert as AlertTriangle, Bell, BellOff, CircleCheck as CheckCircle, ChevronRight, Circle, Clipboard, Clock, ExternalLink, Flame, Gauge, Globe, Hash, Layers, LayoutDashboard, List, Loader as Loader2, MapPin, MessageSquare, Minus, Monitor, Package, Plus, RefreshCw, Settings, ShoppingBag, StickyNote, Terminal, TrendingUp, Tv as Tv2, Users, Wrench, X, Zap, BellRing, Camera, Shield } from 'lucide-react';
import {
  getPushPermissionState,
  requestPushPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getPushSubscriptionStatus,
  getOfflineQueue,
  removeFromOfflineQueue,
  registerBackgroundSync,
  type PushChannel,
  type PushPermissionState,
} from '../../lib/push';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'lexi' | 'bips' | 'gear' | 'workboard' | 'alerts' | 'notes' | 'session' | 'notifications';
type SiteFilter = 'LEXI_SITE' | 'BIPS_SITE' | 'GEAR_SITE' | 'ALL';
type AlertLevel = 'info' | 'warning' | 'critical';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ms: number) {
  const d = new Date(ms);
  return d.toLocaleString('en-CA', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
}

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color = 'text-slate-300', sub }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
        <Icon size={13} className={color} />
        {label}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function AlertBadge({ level }: { level: AlertLevel }) {
  const map: Record<AlertLevel, { label: string; cls: string }> = {
    info: { label: 'INFO', cls: 'bg-sky-900/60 text-sky-300 border-sky-700/50' },
    warning: { label: 'WARN', cls: 'bg-amber-900/60 text-amber-300 border-amber-700/50' },
    critical: { label: 'CRIT', cls: 'bg-red-900/60 text-red-300 border-red-700/50' },
  };
  const { label, cls } = map[level];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${cls}`}>
      {label}
    </span>
  );
}

function SiteBadge({ site }: { site: string }) {
  const map: Record<string, string> = {
    LEXI_SITE: 'bg-rose-900/50 text-rose-300 border-rose-700/40',
    BIPS_SITE: 'bg-cyan-900/50 text-cyan-300 border-cyan-700/40',
    GEAR_SITE: 'bg-amber-900/50 text-amber-300 border-amber-700/40',
    ALL: 'bg-slate-700/50 text-slate-300 border-slate-600/40',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${map[site] ?? 'bg-slate-800 text-slate-400 border-slate-700'}`}>
      {site.replace('_SITE', '')}
    </span>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab() {
  const summary = useQuery(api.ops.getOpsSummary);

  if (summary === undefined) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-3">
        <Loader2 className="animate-spin" size={20} />
        <span>Loading live data...</span>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-3">
        <AlertTriangle size={20} />
        <span>Sign in to view operations data</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Live indicator */}
      <div className="flex items-center gap-2 text-xs text-emerald-400">
        <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        Live — updates in real time
      </div>

      {/* Ops health row */}
      {summary.ops.activeSession && (
        <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl px-4 py-3 flex items-center gap-3">
          <Zap size={16} className="text-emerald-400" />
          <span className="text-emerald-300 text-sm font-medium">Active session: {summary.ops.activeSession.label}</span>
          <span className="text-emerald-500 text-xs ml-auto">{timeAgo(summary.ops.activeSession.startedAt)}</span>
        </div>
      )}
      {summary.ops.unresolvedAlerts > 0 && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400" />
          <span className="text-red-300 text-sm font-medium">{summary.ops.unresolvedAlerts} unresolved alert{summary.ops.unresolvedAlerts !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Per-site grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LexiRose */}
        <div className="bg-rose-950/30 border border-rose-800/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Tv2 size={16} className="text-rose-400" />
            <span className="text-rose-300 font-semibold text-sm tracking-wide">LexiRose</span>
            <a href="/app/lexi" className="ml-auto text-slate-500 hover:text-rose-400 transition-colors">
              <ExternalLink size={13} />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Subscribers" value={summary.lexi.activeSubscribers} icon={Users} color="text-rose-300" />
            <StatCard label="Bundles" value={summary.lexi.activeBundles} icon={Package} color="text-rose-300" />
            <StatCard label="Views 24h" value={summary.lexi.pageViews24h} icon={Activity} color="text-rose-300" />
            <StatCard label="Sales 7d" value={summary.lexi.purchases7d} icon={ShoppingBag} color="text-rose-300" />
          </div>
        </div>

        {/* BIPS MTL */}
        <div className="bg-cyan-950/30 border border-cyan-800/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-cyan-400" />
            <span className="text-cyan-300 font-semibold text-sm tracking-wide">BIPS Montreal</span>
            <a href="/app/bips" className="ml-auto text-slate-500 hover:text-cyan-400 transition-colors">
              <ExternalLink size={13} />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Contacts" value={summary.bips.contacts} icon={Users} color="text-cyan-300" />
            <StatCard label="Shelters" value={summary.bips.shelterSites} icon={MapPin} color="text-cyan-300" />
            <StatCard label="Views 24h" value={summary.bips.pageViews24h} icon={Activity} color="text-cyan-300" />
            <StatCard label="In Progress" value={summary.bips.workboardInProgress} icon={Clipboard} color="text-cyan-300" />
          </div>
        </div>

        {/* BIPS Gear */}
        <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-amber-400" />
            <span className="text-amber-300 font-semibold text-sm tracking-wide">BIPS Gear</span>
            <a href="/" className="ml-auto text-slate-500 hover:text-amber-400 transition-colors">
              <ExternalLink size={13} />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Gear Builds" value={summary.gear.gearBuilds} icon={Wrench} color="text-amber-300" />
            <StatCard label="Views 24h" value={summary.gear.pageViews24h} icon={Activity} color="text-amber-300" />
            <StatCard label="Sales 7d" value={summary.gear.purchases7d} icon={ShoppingBag} color="text-amber-300" />
            <StatCard label="Total Views" value={summary.ops.allPageViews} icon={TrendingUp} color="text-amber-300" />
          </div>
        </div>
      </div>

      {/* Platform-wide summary */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <Gauge size={15} />
          Platform Health
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Events 24h" value={summary.ops.totalEvents24h} icon={Activity} color="text-slate-300" />
          <StatCard label="Total Sales" value={summary.ops.allPurchases} icon={ShoppingBag} color="text-slate-300" />
          <StatCard label="All Page Views" value={summary.ops.allPageViews} icon={Globe} color="text-slate-300" />
          <StatCard label="Open Alerts" value={summary.ops.unresolvedAlerts} icon={Bell} color={summary.ops.unresolvedAlerts > 0 ? 'text-red-400' : 'text-slate-300'} />
        </div>
      </div>
    </div>
  );
}

// ─── Site Detail Tab (LexiRose) ──────────────────────────────────────────────

function LexiTab() {
  const summary = useQuery(api.ops.getOpsSummary);
  const notes = useQuery(api.ops.listNotes, { site: 'LEXI_SITE' });
  const [note, setNote] = useState('');
  const createNote = useMutation(api.ops.createNote);

  const handleNote = async () => {
    if (!note.trim()) return;
    await createNote({ site: 'LEXI_SITE', content: note.trim() });
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Tv2 size={20} className="text-rose-400" />
        <h2 className="text-rose-300 font-bold text-lg">LexiRose</h2>
        <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse ml-auto" />
        <span className="text-xs text-emerald-400">Live</span>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Active Subscribers" value={summary.lexi.activeSubscribers} icon={Users} color="text-rose-300" />
          <StatCard label="Active Bundles" value={summary.lexi.activeBundles} icon={Package} color="text-rose-300" />
          <StatCard label="Page Views 24h" value={summary.lexi.pageViews24h} icon={Activity} color="text-rose-300" />
          <StatCard label="Purchases 7d" value={summary.lexi.purchases7d} icon={ShoppingBag} color="text-rose-300" />
        </div>
      )}

      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <StickyNote size={14} />
          Site Notes
        </div>
        <div className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNote()}
            placeholder="Add a note for LexiRose..."
            className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
          />
          <button onClick={handleNote} className="px-4 py-2 bg-rose-700/40 hover:bg-rose-700/60 border border-rose-600/30 text-rose-300 rounded-lg text-sm transition-colors">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notes?.map((n) => (
            <div key={n._id} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-900/40 rounded-lg px-3 py-2">
              <MessageSquare size={12} className="text-rose-400 mt-0.5 shrink-0" />
              <span className="flex-1">{n.content}</span>
              <span className="text-slate-500 text-xs shrink-0">{timeAgo(n.createdAt)}</span>
            </div>
          ))}
          {notes?.length === 0 && <p className="text-slate-500 text-xs">No notes yet.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-3">
            <ExternalLink size={14} />
            Quick Links
          </div>
          <div className="space-y-2">
            {[
              { label: 'Revenue Hub', href: '/app/lexi/revenue' },
              { label: 'Glow Club', href: '/app/lexi/glow-club' },
              { label: 'Bundles', href: '/app/lexi/bundles' },
              { label: 'Routines', href: '/app/lexi/routines' },
              { label: 'Downloads', href: '/app/lexi/downloads' },
            ].map((link) => (
              <a key={link.href} href={link.href} className="flex items-center gap-2 text-sm text-slate-400 hover:text-rose-300 transition-colors py-1">
                <ChevronRight size={12} className="text-rose-500" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-3">
            <Settings size={14} />
            Admin Actions
          </div>
          <div className="space-y-2">
            {[
              { label: 'Manage Products', href: '/app/lexi/products' },
              { label: 'Creator Studio', href: '/app/creator' },
              { label: 'Analytics', href: '/app/analytics' },
              { label: 'Admin Panel', href: '/app/admin' },
            ].map((link) => (
              <a key={link.href} href={link.href} className="flex items-center gap-2 text-sm text-slate-400 hover:text-rose-300 transition-colors py-1">
                <ChevronRight size={12} className="text-rose-500" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BIPS MTL Tab ─────────────────────────────────────────────────────────────

function BipsTab() {
  const summary = useQuery(api.ops.getOpsSummary);
  const workboard = useQuery(api.leach.getWorkboardItems);
  const notes = useQuery(api.ops.listNotes, { site: 'BIPS_SITE' });
  const [note, setNote] = useState('');
  const createNote = useMutation(api.ops.createNote);

  const handleNote = async () => {
    if (!note.trim()) return;
    await createNote({ site: 'BIPS_SITE', content: note.trim() });
    setNote('');
  };

  const inProgress = workboard?.filter((w) => w.status === 'in_progress') ?? [];
  const blocked = workboard?.filter((w) => w.status === 'blocked') ?? [];

  const statusColors: Record<string, string> = {
    todo: 'text-slate-400',
    in_progress: 'text-cyan-400',
    done: 'text-emerald-400',
    blocked: 'text-red-400',
  };

  const priorityColors: Record<string, string> = {
    low: 'text-slate-500',
    medium: 'text-amber-400',
    high: 'text-red-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MapPin size={20} className="text-cyan-400" />
        <h2 className="text-cyan-300 font-bold text-lg">BIPS Montreal</h2>
        <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse ml-auto" />
        <span className="text-xs text-emerald-400">Live</span>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Contacts" value={summary.bips.contacts} icon={Users} color="text-cyan-300" />
          <StatCard label="Shelter Sites" value={summary.bips.shelterSites} icon={MapPin} color="text-cyan-300" />
          <StatCard label="Page Views 24h" value={summary.bips.pageViews24h} icon={Activity} color="text-cyan-300" />
          <StatCard label="In Progress" value={summary.bips.workboardInProgress} icon={Clipboard} color="text-cyan-300" />
        </div>
      )}

      {/* Active workboard items */}
      {(inProgress.length > 0 || blocked.length > 0) && (
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
            <Clipboard size={14} />
            Active Work Items
          </div>
          <div className="space-y-2">
            {[...inProgress, ...blocked].slice(0, 8).map((item) => (
              <div key={item._id} className="flex items-center gap-3 bg-slate-900/40 rounded-lg px-3 py-2">
                <Circle size={8} className={statusColors[item.status]} fill="currentColor" />
                <span className="flex-1 text-sm text-slate-300 truncate">{item.title}</span>
                <span className={`text-xs font-medium ${priorityColors[item.priority]}`}>{item.priority}</span>
                <span className="text-xs text-slate-500">{timeAgo(item.lastUpdated)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <StickyNote size={14} />
          Site Notes
        </div>
        <div className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNote()}
            placeholder="Add a note for BIPS MTL..."
            className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button onClick={handleNote} className="px-4 py-2 bg-cyan-700/40 hover:bg-cyan-700/60 border border-cyan-600/30 text-cyan-300 rounded-lg text-sm transition-colors">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {notes?.map((n) => (
            <div key={n._id} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-900/40 rounded-lg px-3 py-2">
              <MessageSquare size={12} className="text-cyan-400 mt-0.5 shrink-0" />
              <span className="flex-1">{n.content}</span>
              <span className="text-slate-500 text-xs shrink-0">{timeAgo(n.createdAt)}</span>
            </div>
          ))}
          {notes?.length === 0 && <p className="text-slate-500 text-xs">No notes yet.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-3">
            <ExternalLink size={14} />
            Quick Links
          </div>
          <div className="space-y-2">
            {[
              { label: 'Contacts', href: '/app/bips/contacts' },
              { label: 'Sites', href: '/app/bips/sites' },
              { label: 'HUD', href: '/app/bips/hud' },
              { label: 'Provenance', href: '/app/bips/provenance' },
              { label: 'Rituals', href: '/app/bips/rituals' },
              { label: 'Civic Intel', href: '/bips/civic-intel' },
            ].map((link) => (
              <a key={link.href} href={link.href} className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition-colors py-1">
                <ChevronRight size={12} className="text-cyan-500" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-3">
            <Terminal size={14} />
            LEACH Console
          </div>
          <div className="space-y-2">
            {[
              { label: 'Workboard', href: '/leach/admin/copilot' },
              { label: 'Lexi Copilot', href: '/leach/lexi/copilot' },
              { label: 'Sync Protocols', href: '/app/bips/leach/sync' },
            ].map((link) => (
              <a key={link.href} href={link.href} className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition-colors py-1">
                <ChevronRight size={12} className="text-cyan-500" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Gear Tab ─────────────────────────────────────────────────────────────────

function GearTab() {
  const summary = useQuery(api.ops.getOpsSummary);
  const notes = useQuery(api.ops.listNotes, { site: 'GEAR_SITE' });
  const [note, setNote] = useState('');
  const createNote = useMutation(api.ops.createNote);

  const handleNote = async () => {
    if (!note.trim()) return;
    await createNote({ site: 'GEAR_SITE', content: note.trim() });
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package size={20} className="text-amber-400" />
        <h2 className="text-amber-300 font-bold text-lg">BIPS Gear</h2>
        <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse ml-auto" />
        <span className="text-xs text-emerald-400">Live</span>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Gear Builds" value={summary.gear.gearBuilds} icon={Wrench} color="text-amber-300" />
          <StatCard label="Page Views 24h" value={summary.gear.pageViews24h} icon={Activity} color="text-amber-300" />
          <StatCard label="Purchases 7d" value={summary.gear.purchases7d} icon={ShoppingBag} color="text-amber-300" />
        </div>
      )}

      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <StickyNote size={14} />
          Site Notes
        </div>
        <div className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNote()}
            placeholder="Add a note for BIPS Gear..."
            className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <button onClick={handleNote} className="px-4 py-2 bg-amber-700/40 hover:bg-amber-700/60 border border-amber-600/30 text-amber-300 rounded-lg text-sm transition-colors">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {notes?.map((n) => (
            <div key={n._id} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-900/40 rounded-lg px-3 py-2">
              <MessageSquare size={12} className="text-amber-400 mt-0.5 shrink-0" />
              <span className="flex-1">{n.content}</span>
              <span className="text-slate-500 text-xs shrink-0">{timeAgo(n.createdAt)}</span>
            </div>
          ))}
          {notes?.length === 0 && <p className="text-slate-500 text-xs">No notes yet.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-3">
            <ExternalLink size={14} />
            Quick Links
          </div>
          <div className="space-y-2">
            {[
              { label: 'Gear Configurator', href: '/app/gear/configurator' },
              { label: 'Gear Products', href: '/' },
              { label: 'Civic Modes', href: '/gear/civic-modes' },
            ].map((link) => (
              <a key={link.href} href={link.href} className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 transition-colors py-1">
                <ChevronRight size={12} className="text-amber-500" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-3">
            <Settings size={14} />
            Store Management
          </div>
          <div className="space-y-2">
            {[
              { label: 'Printful Integration', href: '/app/creator/clothing' },
              { label: 'Advertising Hub', href: '/app/advertising' },
              { label: 'Cross-Domain Analytics', href: '/app/analytics/cross-domain' },
            ].map((link) => (
              <a key={link.href} href={link.href} className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 transition-colors py-1">
                <ChevronRight size={12} className="text-amber-500" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Workboard Tab ────────────────────────────────────────────────────────────

function WorkboardTab() {
  const workboard = useQuery(api.leach.getWorkboardItems);
  const createItem = useMutation(api.leach.createWorkboardItem);
  const updateItem = useMutation(api.leach.updateWorkboardItem);
  const deleteItem = useMutation(api.leach.deleteWorkboardItem);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createItem({ title: title.trim(), priority, status: 'todo' });
    setTitle('');
    setShowForm(false);
  };

  const filtered = workboard?.filter((w) => filterStatus === 'all' || w.status === filterStatus) ?? [];

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    todo: { label: 'To Do', color: 'text-slate-400 border-slate-600', icon: Circle },
    in_progress: { label: 'In Progress', color: 'text-cyan-400 border-cyan-700', icon: RefreshCw },
    blocked: { label: 'Blocked', color: 'text-red-400 border-red-700', icon: X },
    done: { label: 'Done', color: 'text-emerald-400 border-emerald-700', icon: CheckCircle },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clipboard size={20} className="text-slate-300" />
        <h2 className="text-slate-200 font-bold text-lg">Workboard</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-300 rounded-lg text-sm transition-colors"
        >
          <Plus size={14} />
          New Item
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Task title..."
            className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-400/50"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button onClick={handleCreate} className="px-4 py-1.5 bg-slate-600/60 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors">
              Add
            </button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'todo', 'in_progress', 'blocked', 'done'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-slate-600 text-slate-100' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            {s === 'all' ? 'All' : statusConfig[s]?.label ?? s}
            {s !== 'all' && workboard && (
              <span className="ml-1 opacity-60">({workboard.filter((w) => w.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">No items found.</p>
        )}
        {filtered.map((item) => {
          const sc = statusConfig[item.status];
          const Icon = sc?.icon ?? Circle;
          return (
            <div key={item._id} className="group flex items-center gap-3 bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3 hover:border-slate-600/50 transition-colors">
              <Icon size={14} className={sc?.color.split(' ')[0]} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{item.title}</p>
                {item.description && <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>}
              </div>
              <select
                value={item.status}
                onChange={(e) => updateItem({ itemId: item._id, status: e.target.value as 'todo' | 'in_progress' | 'done' | 'blocked' })}
                className="bg-slate-900/60 border border-slate-600/40 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
              <span className="text-xs text-slate-500">{timeAgo(item.lastUpdated)}</span>
              <button onClick={() => deleteItem({ itemId: item._id })} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400">
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Alerts Tab ───────────────────────────────────────────────────────────────

function AlertsTab() {
  const alerts = useQuery(api.ops.listAlerts);
  const createAlert = useMutation(api.ops.createAlert);
  const resolveAlert = useMutation(api.ops.resolveAlert);
  const deleteAlert = useMutation(api.ops.deleteAlert);

  const [site, setSite] = useState<SiteFilter>('ALL');
  const [level, setLevel] = useState<AlertLevel>('info');
  const [message, setMessage] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  const handleCreate = async () => {
    if (!message.trim()) return;
    await createAlert({ site, level, message: message.trim() });
    setMessage('');
  };

  const visible = alerts?.filter((a) => showResolved || !a.resolved) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell size={20} className="text-slate-300" />
        <h2 className="text-slate-200 font-bold text-lg">Alerts</h2>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs transition-colors ${showResolved ? 'bg-slate-700 border-slate-500 text-slate-200' : 'bg-transparent border-slate-700 text-slate-500 hover:text-slate-300'}`}
        >
          {showResolved ? <Bell size={12} /> : <BellOff size={12} />}
          {showResolved ? 'Hide Resolved' : 'Show Resolved'}
        </button>
      </div>

      {/* New alert form */}
      <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-4 space-y-3">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Create Alert</div>
        <div className="flex flex-wrap gap-2">
          <select value={site} onChange={(e) => setSite(e.target.value as SiteFilter)}
            className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none">
            <option value="ALL">All Sites</option>
            <option value="LEXI_SITE">LexiRose</option>
            <option value="BIPS_SITE">BIPS MTL</option>
            <option value="GEAR_SITE">Gear</option>
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value as AlertLevel)}
            className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Alert message..."
            className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-400/50"
          />
          <button onClick={handleCreate} className="px-4 py-2 bg-slate-600/60 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors">
            Send
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {visible.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            {showResolved ? 'No alerts found.' : 'No active alerts.'}
          </p>
        )}
        {visible.map((alert) => (
          <div key={alert._id}
            className={`flex items-start gap-3 rounded-xl px-4 py-3 border transition-opacity ${alert.resolved ? 'opacity-50' : ''} ${
              alert.level === 'critical' ? 'bg-red-950/30 border-red-800/30' :
              alert.level === 'warning' ? 'bg-amber-950/30 border-amber-800/30' :
              'bg-slate-800/50 border-slate-700/40'
            }`}
          >
            <div className="mt-0.5">
              <AlertBadge level={alert.level} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <SiteBadge site={alert.site} />
                <span className="text-xs text-slate-500">{formatTime(alert.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-300">{alert.message}</p>
              {alert.resolved && alert.resolvedAt && (
                <p className="text-xs text-emerald-500 mt-0.5">Resolved {timeAgo(alert.resolvedAt)}</p>
              )}
            </div>
            <div className="flex gap-1.5 shrink-0">
              {!alert.resolved && (
                <button onClick={() => resolveAlert({ alertId: alert._id })}
                  className="p-1.5 text-slate-500 hover:text-emerald-400 transition-colors" title="Resolve">
                  <CheckCircle size={14} />
                </button>
              )}
              <button onClick={() => deleteAlert({ alertId: alert._id })}
                className="p-1.5 text-slate-600 hover:text-red-400 transition-colors" title="Delete">
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notes Tab ────────────────────────────────────────────────────────────────

function NotesTab() {
  const notes = useQuery(api.ops.listNotes, {});
  const createNote = useMutation(api.ops.createNote);
  const deleteNote = useMutation(api.ops.deleteNote);

  const [site, setSite] = useState<SiteFilter>('ALL');
  const [content, setContent] = useState('');

  const handleCreate = async () => {
    if (!content.trim()) return;
    await createNote({ site, content: content.trim() });
    setContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <StickyNote size={20} className="text-slate-300" />
        <h2 className="text-slate-200 font-bold text-lg">Notes</h2>
      </div>

      <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
          <select value={site} onChange={(e) => setSite(e.target.value as SiteFilter)}
            className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none">
            <option value="ALL">All Sites</option>
            <option value="LEXI_SITE">LexiRose</option>
            <option value="BIPS_SITE">BIPS MTL</option>
            <option value="GEAR_SITE">Gear</option>
          </select>
        </div>
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a note..."
            rows={2}
            className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-400/50 resize-none"
          />
          <button onClick={handleCreate} className="px-4 py-2 bg-slate-600/60 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors self-end">
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {notes?.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">No notes yet.</p>
        )}
        {notes?.map((note) => (
          <div key={note._id} className="group flex items-start gap-3 bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3 hover:border-slate-600/50 transition-colors">
            <StickyNote size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <SiteBadge site={note.site} />
                <span className="text-xs text-slate-500">{note.createdBy}</span>
                <span className="text-xs text-slate-600">{timeAgo(note.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{note.content}</p>
            </div>
            <button onClick={() => deleteNote({ noteId: note._id })}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400 shrink-0">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Session Tab ──────────────────────────────────────────────────────────────

function SessionTab() {
  const session = useQuery(api.leach.getActiveSession);
  const syncRituals = useQuery(api.leach.getSyncRituals);
  const startSession = useMutation(api.leach.startSession);
  const endSession = useMutation(api.leach.endSession);

  const [label, setLabel] = useState('');
  const [duration, setDuration] = useState('60');

  const handleStart = async () => {
    if (!label.trim()) return;
    await startSession({ label: label.trim(), durationMinutes: parseInt(duration) || undefined });
    setLabel('');
  };

  const ritualTypeColors: Record<string, string> = {
    daily_checkin: 'text-emerald-400',
    weekly_review: 'text-sky-400',
    reminder: 'text-amber-400',
    cowork_session: 'text-rose-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Zap size={20} className="text-slate-300" />
        <h2 className="text-slate-200 font-bold text-lg">Session Mode</h2>
      </div>

      {/* Current session */}
      <div className={`rounded-xl border p-5 ${session ? 'bg-emerald-950/30 border-emerald-800/30' : 'bg-slate-800/40 border-slate-700/30'}`}>
        {session ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-300 font-semibold">Session Active</span>
            </div>
            <p className="text-slate-200 text-lg font-medium">{session.label}</p>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Clock size={13} />
              Started {timeAgo(session.startedAt)}
              {session.durationMinutes && <span>— {session.durationMinutes} min planned</span>}
            </div>
            <button
              onClick={() => endSession({})}
              className="mt-2 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-700/30 text-red-300 rounded-lg text-sm transition-colors"
            >
              End Session
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">No active session. Start one to begin a tracked work block.</p>
            <div className="flex flex-wrap gap-2">
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="Session label..."
                className="flex-1 min-w-48 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-400/50"
              />
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
              >
                <option value="30">30 min</option>
                <option value="60">1 hour</option>
                <option value="90">90 min</option>
                <option value="120">2 hours</option>
              </select>
              <button onClick={handleStart} className="px-4 py-2 bg-emerald-700/40 hover:bg-emerald-700/60 border border-emerald-600/30 text-emerald-300 rounded-lg text-sm transition-colors">
                Start
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sync rituals */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <RefreshCw size={14} />
          Sync Rituals
        </div>
        <div className="space-y-2">
          {syncRituals?.length === 0 && (
            <p className="text-slate-500 text-xs">No sync rituals configured.</p>
          )}
          {syncRituals?.map((ritual) => (
            <div key={ritual._id} className="flex items-center gap-3 bg-slate-900/40 rounded-lg px-3 py-2">
              <span className={`text-xs font-medium ${ritualTypeColors[ritual.type] ?? 'text-slate-400'}`}>
                {ritual.type.replace(/_/g, ' ')}
              </span>
              <span className="flex-1 text-sm text-slate-300">{ritual.label}</span>
              <span className={`text-xs ${ritual.enabled ? 'text-emerald-500' : 'text-slate-600'}`}>
                {ritual.enabled ? 'enabled' : 'disabled'}
              </span>
              {ritual.timeOfDay && <span className="text-xs text-slate-500">{ritual.timeOfDay}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const pushLog = useQuery(api.ops.listPushLog);
  const snapshots = useQuery(api.ops.listSnapshots, {});
  const triggerSnapshot = useMutation(api.ops.triggerAutoSnapshot);
  const dispatchPush = useAction(api.ops.dispatchAlertPush);

  const [permState, setPermState] = useState<PushPermissionState>('unsupported');
  const [subStatus, setSubStatus] = useState<{ subscribed: boolean; channel: PushChannel | null }>({ subscribed: false, channel: null });
  const [channel, setChannel] = useState<PushChannel>('ALL');
  const [offlineQueue, setOfflineQueue] = useState<ReturnType<typeof getOfflineQueue>>([]);
  const [manualTitle, setManualTitle] = useState('');
  const [manualBody, setManualBody] = useState('');
  const [manualLevel, setManualLevel] = useState<'info' | 'warning' | 'critical'>('info');
  const [manualDomain, setManualDomain] = useState<PushChannel>('ALL');
  const [snapping, setSnapping] = useState<PushChannel | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [localMsg, setLocalMsg] = useState('');

  useEffect(() => {
    setPermState(getPushPermissionState());
    (async () => {
      const s = await getPushSubscriptionStatus();
      setSubStatus(s);
    })();
    setOfflineQueue(getOfflineQueue());
  }, []);

  const handleRequestPermission = async () => {
    const result = await requestPushPermission();
    setPermState(result === 'granted' ? 'granted' : 'denied');
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      await subscribeToPush(channel);
      const s = await getPushSubscriptionStatus();
      setSubStatus(s);
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribeFromPush();
    const s = await getPushSubscriptionStatus();
    setSubStatus(s);
  };

  const handleDispatch = async () => {
    if (!manualTitle.trim()) return;
    setDispatching(true);
    try {
      await dispatchPush({ domain: manualDomain, level: manualLevel, title: manualTitle.trim(), body: manualBody.trim() });
      setManualTitle('');
      setManualBody('');
    } finally {
      setDispatching(false);
    }
  };

  const handleSnapshot = async (domain: PushChannel) => {
    setSnapping(domain);
    try {
      await triggerSnapshot({ domain });
    } finally {
      setSnapping(null);
    }
  };

  const handleSync = () => {
    registerBackgroundSync('bips-ops-sync');
    setLocalMsg('Background sync registered.');
    setTimeout(() => setLocalMsg(''), 3000);
  };

  const handleFlushQueue = () => {
    setOfflineQueue(getOfflineQueue());
  };

  const permColor = permState === 'granted' ? 'text-emerald-400' : permState === 'denied' ? 'text-red-400' : permState === 'unsupported' ? 'text-slate-500' : 'text-amber-400';
  const permLabel = { granted: 'Granted', denied: 'Denied', default: 'Not yet requested', unsupported: 'Unsupported' }[permState] ?? permState;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BellRing size={20} className="text-slate-300" />
        <h2 className="text-slate-200 font-bold text-lg">Notifications & Push</h2>
      </div>

      {/* Permission + subscription */}
      <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-5 space-y-4">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Push Permission</div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${permColor}`}>{permLabel}</span>
          {permState === 'default' && (
            <button onClick={handleRequestPermission} className="px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-300 rounded-lg text-xs transition-colors">
              Request Permission
            </button>
          )}
        </div>

        {permState === 'granted' && (
          <div className="space-y-3 pt-1 border-t border-slate-700/40">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-3">Subscription</div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-sm ${subStatus.subscribed ? 'text-emerald-400' : 'text-slate-500'}`}>
                {subStatus.subscribed ? `Subscribed — channel: ${subStatus.channel ?? 'ALL'}` : 'Not subscribed'}
              </span>
            </div>
            {!subStatus.subscribed ? (
              <div className="flex items-center gap-2 flex-wrap">
                <select value={channel} onChange={(e) => setChannel(e.target.value as PushChannel)}
                  className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none">
                  <option value="ALL">All Sites</option>
                  <option value="LEXI_SITE">LexiRose only</option>
                  <option value="BIPS_SITE">BIPS MTL only</option>
                  <option value="GEAR_SITE">Gear only</option>
                </select>
                <button onClick={handleSubscribe} disabled={subscribing}
                  className="px-4 py-1.5 bg-emerald-700/40 hover:bg-emerald-700/60 border border-emerald-600/30 text-emerald-300 rounded-lg text-sm transition-colors disabled:opacity-50">
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            ) : (
              <button onClick={handleUnsubscribe}
                className="px-4 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-700/30 text-red-300 rounded-lg text-sm transition-colors">
                Unsubscribe
              </button>
            )}
          </div>
        )}
      </div>

      {/* Manual push dispatch */}
      <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-slate-400" />
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Dispatch Push Notification</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={manualDomain} onChange={(e) => setManualDomain(e.target.value as PushChannel)}
            className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none">
            <option value="ALL">All Sites</option>
            <option value="LEXI_SITE">LexiRose</option>
            <option value="BIPS_SITE">BIPS MTL</option>
            <option value="GEAR_SITE">Gear</option>
          </select>
          <select value={manualLevel} onChange={(e) => setManualLevel(e.target.value as 'info' | 'warning' | 'critical')}
            className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)}
          placeholder="Notification title..."
          className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-400/50" />
        <div className="flex gap-2">
          <input value={manualBody} onChange={(e) => setManualBody(e.target.value)}
            placeholder="Body (optional)..."
            className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-400/50" />
          <button onClick={handleDispatch} disabled={dispatching || !manualTitle.trim()}
            className="px-4 py-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-300 rounded-lg text-sm transition-colors disabled:opacity-50">
            {dispatching ? 'Sending...' : 'Dispatch'}
          </button>
        </div>
      </div>

      {/* Push log */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <List size={14} />
          Push Log
          <span className="ml-auto text-xs text-slate-500">{pushLog?.length ?? 0} recent</span>
        </div>
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {pushLog?.length === 0 && <p className="text-slate-500 text-xs">No push dispatches yet.</p>}
          {pushLog?.map((entry) => (
            <div key={entry._id} className="flex items-start gap-3 bg-slate-900/40 rounded-lg px-3 py-2">
              <AlertBadge level={entry.level} />
              <SiteBadge site={entry.domain} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{entry.title}</p>
                {entry.body && <p className="text-xs text-slate-500 truncate">{entry.body}</p>}
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs ${entry.sent > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>{entry.sent} sent</span>
                {entry.failed > 0 && <span className="text-xs text-red-400 ml-2">{entry.failed} failed</span>}
                <p className="text-xs text-slate-600">{timeAgo(entry.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Snapshots */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <Camera size={14} />
          Ops Snapshots
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['LEXI_SITE', 'BIPS_SITE', 'GEAR_SITE', 'ALL'] as PushChannel[]).map((d) => (
            <button key={d} onClick={() => handleSnapshot(d)} disabled={snapping === d}
              className="px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-300 rounded-lg text-xs transition-colors disabled:opacity-50">
              {snapping === d ? 'Snapping...' : `Snap ${d.replace('_SITE', '')}`}
            </button>
          ))}
        </div>
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {snapshots?.length === 0 && <p className="text-slate-500 text-xs">No snapshots yet.</p>}
          {snapshots?.map((snap) => (
            <div key={snap._id} className="bg-slate-900/40 rounded-lg px-3 py-2 space-y-1">
              <div className="flex items-center gap-2">
                <SiteBadge site={snap.domain ?? 'ALL'} />
                <span className="text-xs text-slate-400">{snap.trigger ?? 'manual'}</span>
                <span className="text-xs text-slate-600 ml-auto">{timeAgo(snap.createdAt)}</span>
              </div>
              {snap.diff && Object.keys(snap.diff).length > 0 && (
                <div className="text-xs text-slate-500 space-y-0.5 pl-1 border-l border-slate-700/60">
                  {Object.entries(snap.diff).slice(0, 5).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-red-400 line-through">{String(v.from)}</span>
                      <span className="text-emerald-400">{String(v.to)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Offline queue + background sync */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <RefreshCw size={14} />
          Offline Queue &amp; Sync
          <button onClick={handleFlushQueue} className="ml-auto px-2.5 py-1 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-400 rounded text-xs transition-colors">
            Refresh
          </button>
          <button onClick={handleSync} className="px-2.5 py-1 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/40 text-slate-400 rounded text-xs transition-colors">
            Trigger Sync
          </button>
        </div>
        {localMsg && <p className="text-xs text-emerald-400">{localMsg}</p>}
        {offlineQueue.length === 0 ? (
          <p className="text-slate-500 text-xs">Offline queue is empty.</p>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {offlineQueue.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-slate-900/40 rounded px-3 py-1.5">
                <span className="text-xs text-slate-400 font-mono">{item.type}</span>
                <span className="flex-1 text-xs text-slate-500 truncate">{JSON.stringify(item.payload)}</span>
                <button onClick={() => { removeFromOfflineQueue(item.id); setOfflineQueue(getOfflineQueue()); }}
                  className="text-slate-600 hover:text-red-400 transition-colors">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'lexi', label: 'LexiRose', icon: Tv2 },
  { id: 'bips', label: 'BIPS MTL', icon: MapPin },
  { id: 'gear', label: 'Gear', icon: Package },
  { id: 'workboard', label: 'Workboard', icon: Clipboard },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'session', label: 'Session', icon: Zap },
  { id: 'notifications', label: 'Notifications', icon: BellRing },
];

export function OperationsControlPanel() {
  const [tab, setTab] = useState<Tab>('overview');
  const alerts = useQuery(api.ops.listAlerts);
  const unresolved = alerts?.filter((a) => !a.resolved).length ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-14">
            <div className="flex items-center gap-2.5">
              <Monitor size={18} className="text-slate-400" />
              <span className="font-bold text-slate-100 tracking-tight text-sm">ᗺIPS OPS</span>
              <span className="text-slate-700 text-xs">|</span>
              <span className="text-slate-500 text-xs">Control Panel</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {unresolved > 0 && (
                <button onClick={() => setTab('alerts')} className="flex items-center gap-1.5 px-2.5 py-1 bg-red-900/40 border border-red-700/30 text-red-300 rounded-full text-xs">
                  <AlertTriangle size={11} />
                  {unresolved} alert{unresolved !== 1 ? 's' : ''}
                </button>
              )}
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse" title="Live" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar nav */}
        <nav className="hidden md:flex flex-col gap-1 w-44 shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                tab === id
                  ? 'bg-slate-700/70 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={15} className={tab === id ? 'text-slate-300' : 'text-slate-500'} />
              {label}
              {id === 'alerts' && unresolved > 0 && (
                <span className="ml-auto text-[10px] bg-red-700/60 text-red-300 rounded-full px-1.5 py-0.5">{unresolved}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-1 overflow-x-auto pb-1 w-full -mx-4 px-4 mb-4 shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                tab === id ? 'bg-slate-700 text-slate-100' : 'bg-slate-800/60 text-slate-400'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {tab === 'overview' && <OverviewTab />}
          {tab === 'lexi' && <LexiTab />}
          {tab === 'bips' && <BipsTab />}
          {tab === 'gear' && <GearTab />}
          {tab === 'workboard' && <WorkboardTab />}
          {tab === 'alerts' && <AlertsTab />}
          {tab === 'notes' && <NotesTab />}
          {tab === 'session' && <SessionTab />}
          {tab === 'notifications' && <NotificationsTab />}
        </main>
      </div>

      {/* PWA footer */}
      <footer className="border-t border-slate-800/40 mt-12 py-4 px-6">
        <p className="text-xs text-slate-600 text-center">
          ᗺIPS Operations Control &mdash; Install as PWA: browser menu &rarr; "Add to Home Screen" / "Install App"
        </p>
      </footer>
    </div>
  );
}
