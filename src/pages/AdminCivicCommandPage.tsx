import { useState } from 'react';
import {
  RefreshCw, TriangleAlert as AlertTriangle, Circle, ChevronDown, ExternalLink,
  Database, Settings, Activity, Zap, Wind, Volume2, Snowflake, Calendar, Bus,
  Power, RotateCcw, Eye, Shield, TrendingUp, TrendingDown, MapPin, Check, X, Flag
} from 'lucide-react';
import { CivicSeverityBadge } from '../components/civic/CivicSeverityBadge';
import { AdminBanner } from '../components/civic/AdminBanner';

type Severity = 'green' | 'amber' | 'red';

type CivicSource = {
  source: string;
  endpoint: string;
  refreshInterval: number;
  lastSuccess: number;
  lastError: string | null;
  severity: Severity;
  recordCount: number;
};

const SOURCES: CivicSource[] = [
  { source: 'contracts', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=contracts', refreshInterval: 3600000, lastSuccess: Date.now() - 120000, lastError: null, severity: 'green', recordCount: 1420 },
  { source: 'grants', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=grants', refreshInterval: 3600000, lastSuccess: Date.now() - 300000, lastError: null, severity: 'green', recordCount: 340 },
  { source: 'shelters', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=shelters', refreshInterval: 1800000, lastSuccess: Date.now() - 60000, lastError: null, severity: 'green', recordCount: 42 },
  { source: 'waste', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=waste', refreshInterval: 3600000, lastSuccess: Date.now() - 900000, lastError: null, severity: 'green', recordCount: 890 },
  { source: 'snow', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=snow', refreshInterval: 1800000, lastSuccess: Date.now() - 180000, lastError: null, severity: 'amber', recordCount: 156 },
  { source: 'traffic', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=traffic', refreshInterval: 900000, lastSuccess: Date.now() - 45000, lastError: null, severity: 'red', recordCount: 2100 },
  { source: 'bike_paths', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=bike_paths', refreshInterval: 3600000, lastSuccess: Date.now() - 2400000, lastError: null, severity: 'green', recordCount: 480 },
  { source: 'wifi', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=wifi', refreshInterval: 7200000, lastSuccess: Date.now() - 4000000, lastError: null, severity: 'green', recordCount: 650 },
  { source: 'parks', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=parks', refreshInterval: 86400000, lastSuccess: Date.now() - 43200000, lastError: null, severity: 'green', recordCount: 1200 },
  { source: 'cultural_events', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=cultural_events', refreshInterval: 3600000, lastSuccess: Date.now() - 600000, lastError: null, severity: 'green', recordCount: 89 },
  { source: 'libraries', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=libraries', refreshInterval: 86400000, lastSuccess: Date.now() - 60000000, lastError: null, severity: 'green', recordCount: 45 },
  { source: 'pools', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=pools', refreshInterval: 86400000, lastSuccess: Date.now() - 72000000, lastError: null, severity: 'green', recordCount: 78 },
  { source: 'sports', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=sports', refreshInterval: 86400000, lastSuccess: Date.now() - 50000000, lastError: null, severity: 'green', recordCount: 310 },
  { source: 'public_art', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=public_art', refreshInterval: 86400000, lastSuccess: Date.now() - 86000000, lastError: null, severity: 'green', recordCount: 420 },
  { source: 'air_quality', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=air_quality', refreshInterval: 1800000, lastSuccess: Date.now() - 900000, lastError: null, severity: 'green', recordCount: 24 },
  { source: 'noise', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=noise', refreshInterval: 3600000, lastSuccess: Date.now() - 1800000, lastError: null, severity: 'amber', recordCount: 56 },
  { source: 'water_quality', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=water_quality', refreshInterval: 7200000, lastSuccess: Date.now() - 5400000, lastError: null, severity: 'green', recordCount: 24 },
  { source: 'permits', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=permits', refreshInterval: 3600000, lastSuccess: Date.now() - 2700000, lastError: null, severity: 'green', recordCount: 340 },
  { source: 'transit', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=transit', refreshInterval: 900000, lastSuccess: Date.now() - 300000, lastError: 'Timeout after 5000ms', severity: 'red', recordCount: 180 },
  { source: 'street_closures', endpoint: 'https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=street_closures', refreshInterval: 1800000, lastSuccess: Date.now() - 1200000, lastError: null, severity: 'amber', recordCount: 67 },
];

type EnvModifier = {
  factor: string;
  icon: typeof Wind;
  loadDelta: number;
  energyDelta: number;
  active: boolean;
  threshold: string;
};

const ENV_MODIFIERS: EnvModifier[] = [
  { factor: 'Noise Level (High)', icon: Volume2, loadDelta: 1, energyDelta: 0, active: true, threshold: '>65 dB avg' },
  { factor: 'Air Quality (Poor)', icon: Wind, loadDelta: 0, energyDelta: -1, active: false, threshold: 'AQI > 100' },
  { factor: 'Snowstorm Active', icon: Snowflake, loadDelta: 1, energyDelta: -1, active: false, threshold: 'Snow ops active' },
  { factor: 'Cultural Event Nearby', icon: Calendar, loadDelta: 0, energyDelta: 1, active: true, threshold: 'Events > 0' },
  { factor: 'Transit Disruption', icon: Bus, loadDelta: 1, energyDelta: 0, active: false, threshold: 'Disruptions > 0' },
];

function formatInterval(ms: number): string {
  if (ms >= 86400000) return `${Math.round(ms / 86400000)}d`;
  if (ms >= 3600000) return `${Math.round(ms / 3600000)}h`;
  if (ms >= 60000) return `${Math.round(ms / 60000)}m`;
  return `${Math.round(ms / 1000)}s`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
  return `${Math.round(diff / 86400000)}d ago`;
}

type Tab = 'sources' | 'modifiers' | 'controls' | 'moderation';

type PendingPin = {
  id: string;
  user: string;
  title: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  createdAt: number;
  severity: string | null;
};

const PENDING_PINS: PendingPin[] = [
  { id: 'pin1', user: 'lexi@bips.dev', title: 'Safe Rest Spot', category: 'safety', lat: 45.5120, lng: -73.5540, description: 'Quiet bench near metro with Wi-Fi coverage and shelter overhang.', createdAt: Date.now() - 3600000, severity: 'green' },
  { id: 'pin2', user: 'user42@gmail.com', title: 'Road Hazard', category: 'safety', lat: 45.5088, lng: -73.5668, description: 'Large pothole on southbound lane, risk for cyclists.', createdAt: Date.now() - 7200000, severity: 'red' },
  { id: 'pin3', user: 'community@mtl.org', title: 'Pop-up Market', category: 'event', lat: 45.5195, lng: -73.5721, description: 'Local artisan market every Saturday 9am-3pm through June.', createdAt: Date.now() - 1800000, severity: null },
  { id: 'pin4', user: 'user99@outlook.com', title: 'Mural Photo Spot', category: 'art', lat: 45.5244, lng: -73.5692, description: 'Best angle for photographing the new Under Pressure mural on the east wall.', createdAt: Date.now() - 5400000, severity: null },
  { id: 'pin5', user: 'cyclist_mtl@gmail.com', title: 'Glass on Path', category: 'safety', lat: 45.5100, lng: -73.5650, description: 'Broken glass on De Maisonneuve bike path near Guy station.', createdAt: Date.now() - 900000, severity: 'amber' },
];

export function AdminCivicCommandPage() {
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('sources');
  const [modifiers, setModifiers] = useState(ENV_MODIFIERS);
  const [envEnabled, setEnvEnabled] = useState(true);

  const healthyCount = SOURCES.filter((s) => s.severity === 'green').length;
  const warningCount = SOURCES.filter((s) => s.severity === 'amber').length;
  const errorCount = SOURCES.filter((s) => s.severity === 'red').length;
  const totalRecords = SOURCES.reduce((sum, s) => sum + s.recordCount, 0);

  const toggleModifier = (i: number) => {
    const updated = [...modifiers];
    updated[i] = { ...updated[i], active: !updated[i].active };
    setModifiers(updated);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminBanner />
      {/* Command center header */}
      <div className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
                <Database size={18} className="text-orange-400" />
              </div>
              <div>
                <h1 className="text-base font-bold flex items-center gap-2">
                  Civic Command Center
                  <span className="text-[9px] text-orange-400 bg-orange-900/30 px-2 py-0.5 rounded-full font-medium">ADMIN</span>
                </h1>
                <p className="text-[10px] text-gray-500">Source registry | Environmental controls | Cache management</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-xs font-medium transition-colors">
              <RefreshCw size={12} />
              Refresh All Sources
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-5">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Circle size={6} className="text-emerald-400 fill-emerald-400" />
              <span className="text-[10px] text-gray-400">Healthy</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{healthyCount}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Circle size={6} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] text-gray-400">Warning</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{warningCount}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={10} className="text-red-400" />
              <span className="text-[10px] text-gray-400">Errors</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{errorCount}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Database size={10} className="text-blue-400" />
              <span className="text-[10px] text-gray-400">Sources</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{SOURCES.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={10} className="text-cyan-400" />
              <span className="text-[10px] text-gray-400">Records</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{totalRecords.toLocaleString()}</p>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {[
            { key: 'sources', label: 'Source Registry', icon: Database },
            { key: 'modifiers', label: 'Environmental Modifiers', icon: Zap },
            { key: 'controls', label: 'Controls', icon: Settings },
            { key: 'moderation', label: 'Pin Moderation', icon: Flag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as Tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Source Registry */}
        {activeTab === 'sources' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-white">Source Registry</h3>
                <span className="text-[9px] text-gray-500">{SOURCES.length} registered</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <Activity size={10} className="text-emerald-400" />
                <span>Real-time sync active</span>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_2fr_80px_80px_80px_60px_24px] gap-2 px-4 py-2 border-b border-gray-800/50 text-[9px] text-gray-500 font-medium uppercase tracking-wider">
              <span>Source</span>
              <span>Endpoint</span>
              <span>Interval</span>
              <span>Last OK</span>
              <span>Records</span>
              <span>Status</span>
              <span></span>
            </div>

            <div className="divide-y divide-gray-800/30 max-h-[500px] overflow-y-auto">
              {SOURCES.map((source) => {
                const isExpanded = expandedSource === source.source;
                return (
                  <div key={source.source}>
                    <button
                      onClick={() => setExpandedSource(isExpanded ? null : source.source)}
                      className="w-full grid grid-cols-[1fr_2fr_80px_80px_80px_60px_24px] gap-2 items-center px-4 py-3 hover:bg-gray-800/20 transition-colors text-left"
                    >
                      <span className="text-xs font-medium text-white truncate">{source.source}</span>
                      <span className="text-[10px] text-gray-500 truncate font-mono">{source.endpoint.slice(0, 50)}...</span>
                      <span className="text-[10px] text-gray-400">{formatInterval(source.refreshInterval)}</span>
                      <span className="text-[10px] text-gray-400">{timeAgo(source.lastSuccess)}</span>
                      <span className="text-[10px] text-gray-400">{source.recordCount}</span>
                      <CivicSeverityBadge severity={source.severity} compact />
                      <ChevronDown size={10} className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 bg-gray-800/10 border-t border-gray-800/30">
                        <div className="grid grid-cols-2 gap-4 text-[11px] mb-3">
                          <div>
                            <span className="text-gray-500 block mb-0.5">Full Endpoint</span>
                            <p className="text-gray-300 font-mono text-[10px] break-all bg-gray-950 p-2 rounded-lg">{source.endpoint}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-0.5">Last Error</span>
                            <p className={`text-[10px] ${source.lastError ? 'text-red-400' : 'text-gray-600'} bg-gray-950 p-2 rounded-lg`}>
                              {source.lastError || 'No errors recorded'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-0.5">Schema Preview</span>
                            <p className="text-gray-300 font-mono text-[10px] bg-gray-950 p-2 rounded-lg">
                              {`{ "records": [...], "total": ${source.recordCount}, "fields": [...] }`}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-0.5">Refresh Interval</span>
                            <p className="text-gray-300 text-[10px] bg-gray-950 p-2 rounded-lg">
                              Every {formatInterval(source.refreshInterval)} | Next: {formatInterval(source.refreshInterval - (Date.now() - source.lastSuccess))}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-[10px] text-white font-medium transition-colors">
                            <RefreshCw size={10} />
                            Refresh Now
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-[10px] text-gray-300 transition-colors">
                            <Settings size={10} />
                            Edit Config
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-[10px] text-gray-300 transition-colors">
                            <ExternalLink size={10} />
                            Test Fetch
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-[10px] text-gray-300 transition-colors">
                            <Eye size={10} />
                            View Payload
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Environmental Modifiers */}
        {activeTab === 'modifiers' && (
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Environmental Geometry Modifiers</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Adjust LEACH emotional geometry based on civic conditions</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-medium ${envEnabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {envEnabled ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => setEnvEnabled(!envEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${envEnabled ? 'bg-emerald-600' : 'bg-gray-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${envEnabled ? 'left-5.5' : 'left-0.5'}`} style={{ left: envEnabled ? '22px' : '2px' }} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {modifiers.map((mod, i) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.factor}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        mod.active && envEnabled
                          ? 'bg-gray-800/50 border-gray-700'
                          : 'bg-gray-900/30 border-gray-800/50 opacity-60'
                      }`}
                    >
                      <button
                        onClick={() => toggleModifier(i)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          mod.active ? 'bg-orange-600 border-orange-500' : 'bg-gray-800 border-gray-700'
                        }`}
                      >
                        {mod.active && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </button>
                      <Icon size={16} className={mod.active ? 'text-orange-400' : 'text-gray-600'} />
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${mod.active ? 'text-white' : 'text-gray-500'}`}>{mod.factor}</p>
                        <p className="text-[9px] text-gray-600 mt-0.5">Threshold: {mod.threshold}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {mod.loadDelta !== 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp size={10} className="text-red-400" />
                            <span className="text-[10px] text-red-400 font-medium">Load +{mod.loadDelta}</span>
                          </div>
                        )}
                        {mod.energyDelta !== 0 && (
                          <div className="flex items-center gap-1">
                            {mod.energyDelta > 0 ? (
                              <TrendingUp size={10} className="text-emerald-400" />
                            ) : (
                              <TrendingDown size={10} className="text-red-400" />
                            )}
                            <span className={`text-[10px] font-medium ${mod.energyDelta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              Energy {mod.energyDelta > 0 ? '+' : ''}{mod.energyDelta}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Effect Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                  <p className="text-[10px] text-gray-500 mb-1">Total Load Delta</p>
                  <p className="text-2xl font-bold text-red-400">
                    +{modifiers.filter((m) => m.active && envEnabled).reduce((s, m) => s + m.loadDelta, 0)}
                  </p>
                </div>
                <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                  <p className="text-[10px] text-gray-500 mb-1">Total Energy Delta</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {(() => {
                      const delta = modifiers.filter((m) => m.active && envEnabled).reduce((s, m) => s + m.energyDelta, 0);
                      return delta >= 0 ? `+${delta}` : delta;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        {activeTab === 'controls' && (
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">System Controls</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button className="flex items-center gap-3 p-4 bg-gray-950 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                    <RefreshCw size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Force Refresh All</p>
                    <p className="text-[9px] text-gray-500">Re-fetch all 20 sources immediately</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gray-950 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center">
                    <RotateCcw size={16} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Reset Cache</p>
                    <p className="text-[9px] text-gray-500">Clear all cached civic data</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gray-950 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center">
                    <Power size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Toggle Civic Engine</p>
                    <p className="text-[9px] text-gray-500">Enable/disable all civic data fetching</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 p-4 bg-gray-950 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-left">
                  <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
                    <Shield size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Override Severity</p>
                    <p className="text-[9px] text-gray-500">Manually set severity thresholds</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Settings toggles */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Settings</h3>
              <div className="space-y-3">
                {[
                  { label: 'Civic Data Awareness', desc: 'Enable civic data across all domains', enabled: true },
                  { label: 'Environmental Geometry Modifiers', desc: 'Adjust LEACH geometry from civic data', enabled: envEnabled },
                  { label: 'Gear Recommendations', desc: 'Show gear suggestions based on conditions', enabled: true },
                  { label: 'Story Generation', desc: 'Power Lexi narratives from civic sources', enabled: true },
                  { label: 'Auto-Refresh', desc: 'Automatically refresh sources on interval', enabled: true },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                    <div>
                      <p className="text-xs font-medium text-white">{setting.label}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">{setting.desc}</p>
                    </div>
                    <div className={`w-9 h-5 rounded-full transition-colors relative ${setting.enabled ? 'bg-emerald-600' : 'bg-gray-700'}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all" style={{ left: setting.enabled ? '18px' : '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pin Moderation */}
        {activeTab === 'moderation' && (
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Pending Public Pins</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{PENDING_PINS.length} pins awaiting review</p>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-orange-400" />
                  <span className="text-[10px] text-orange-400 font-medium">Moderation Queue</span>
                </div>
              </div>

              <div className="divide-y divide-gray-800/30">
                {PENDING_PINS.map((pin) => (
                  <div key={pin.id} className="p-4 hover:bg-gray-800/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin size={14} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-xs font-semibold text-white">{pin.title}</h4>
                          {pin.severity && <CivicSeverityBadge severity={pin.severity as 'green' | 'amber' | 'red'} />}
                        </div>
                        <p className="text-[10px] text-gray-400 mb-1">{pin.description}</p>
                        <div className="flex items-center gap-3 text-[9px] text-gray-500">
                          <span>{pin.user}</span>
                          <span>{pin.category}</span>
                          <span>{pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}</span>
                          <span>{Math.round((Date.now() - pin.createdAt) / 60000)}m ago</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button className="w-8 h-8 rounded-lg bg-emerald-900/30 hover:bg-emerald-800/50 flex items-center justify-center text-emerald-400 transition-colors" title="Approve">
                          <Check size={14} />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-red-900/30 hover:bg-red-800/50 flex items-center justify-center text-red-400 transition-colors" title="Deny">
                          <X size={14} />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 transition-colors" title="View on Map">
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Moderation stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{PENDING_PINS.length}</p>
                <p className="text-[10px] text-gray-500 mt-1">Pending Review</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">47</p>
                <p className="text-[10px] text-gray-500 mt-1">Approved (7d)</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-400">3</p>
                <p className="text-[10px] text-gray-500 mt-1">Denied (7d)</p>
              </div>
            </div>

            {/* Moderation policies */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Auto-Moderation Rules</h3>
              <div className="space-y-2">
                {[
                  { label: 'Auto-approve verified users', desc: 'Users with 5+ approved pins', enabled: true },
                  { label: 'Flag duplicate locations', desc: 'Pins within 50m of existing', enabled: true },
                  { label: 'Block profanity', desc: 'Auto-deny pins with inappropriate content', enabled: true },
                  { label: 'Require image for art pins', desc: 'Art category pins must include an image', enabled: false },
                ].map((rule) => (
                  <div key={rule.label} className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800">
                    <div>
                      <p className="text-xs font-medium text-white">{rule.label}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">{rule.desc}</p>
                    </div>
                    <div className={`w-9 h-5 rounded-full transition-colors relative ${rule.enabled ? 'bg-emerald-600' : 'bg-gray-700'}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all" style={{ left: rule.enabled ? '18px' : '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
