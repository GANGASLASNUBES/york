import { useState } from 'react';
import { RefreshCw, Clock, TriangleAlert as AlertTriangle, Circle, ChevronDown, ExternalLink, Database, Settings, Activity } from 'lucide-react';

type CivicSource = {
  source: string;
  endpoint: string;
  refreshInterval: number;
  lastSuccess: number;
  lastError: string | null;
};

const SOURCES: CivicSource[] = [
  { source: 'contracts', endpoint: 'donnees.montreal.ca/...contracts', refreshInterval: 3600000, lastSuccess: Date.now() - 120000, lastError: null },
  { source: 'grants', endpoint: 'donnees.montreal.ca/...grants', refreshInterval: 3600000, lastSuccess: Date.now() - 300000, lastError: null },
  { source: 'shelters', endpoint: 'donnees.montreal.ca/...shelters', refreshInterval: 1800000, lastSuccess: Date.now() - 60000, lastError: null },
  { source: 'waste', endpoint: 'donnees.montreal.ca/...waste', refreshInterval: 3600000, lastSuccess: Date.now() - 900000, lastError: null },
  { source: 'snow', endpoint: 'donnees.montreal.ca/...snow', refreshInterval: 1800000, lastSuccess: Date.now() - 180000, lastError: null },
  { source: 'traffic', endpoint: 'donnees.montreal.ca/...traffic', refreshInterval: 900000, lastSuccess: Date.now() - 45000, lastError: null },
  { source: 'bike_paths', endpoint: 'donnees.montreal.ca/...bike_paths', refreshInterval: 3600000, lastSuccess: Date.now() - 2400000, lastError: null },
  { source: 'wifi', endpoint: 'donnees.montreal.ca/...wifi', refreshInterval: 7200000, lastSuccess: Date.now() - 4000000, lastError: null },
  { source: 'parks', endpoint: 'donnees.montreal.ca/...parks', refreshInterval: 86400000, lastSuccess: Date.now() - 43200000, lastError: null },
  { source: 'cultural_events', endpoint: 'donnees.montreal.ca/...cultural_events', refreshInterval: 3600000, lastSuccess: Date.now() - 600000, lastError: null },
  { source: 'libraries', endpoint: 'donnees.montreal.ca/...libraries', refreshInterval: 86400000, lastSuccess: Date.now() - 60000000, lastError: null },
  { source: 'pools', endpoint: 'donnees.montreal.ca/...pools', refreshInterval: 86400000, lastSuccess: Date.now() - 72000000, lastError: null },
  { source: 'sports', endpoint: 'donnees.montreal.ca/...sports', refreshInterval: 86400000, lastSuccess: Date.now() - 50000000, lastError: null },
  { source: 'public_art', endpoint: 'donnees.montreal.ca/...public_art', refreshInterval: 86400000, lastSuccess: Date.now() - 86000000, lastError: null },
  { source: 'air_quality', endpoint: 'donnees.montreal.ca/...air_quality', refreshInterval: 1800000, lastSuccess: Date.now() - 900000, lastError: null },
  { source: 'noise', endpoint: 'donnees.montreal.ca/...noise', refreshInterval: 3600000, lastSuccess: Date.now() - 1800000, lastError: null },
  { source: 'water_quality', endpoint: 'donnees.montreal.ca/...water_quality', refreshInterval: 7200000, lastSuccess: Date.now() - 5400000, lastError: null },
  { source: 'permits', endpoint: 'donnees.montreal.ca/...permits', refreshInterval: 3600000, lastSuccess: Date.now() - 2700000, lastError: null },
  { source: 'transit', endpoint: 'donnees.montreal.ca/...transit', refreshInterval: 900000, lastSuccess: Date.now() - 300000, lastError: 'Timeout after 5000ms' },
  { source: 'street_closures', endpoint: 'donnees.montreal.ca/...street_closures', refreshInterval: 1800000, lastSuccess: Date.now() - 1200000, lastError: null },
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

export function CivicAdminPanel() {
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  const healthyCount = SOURCES.filter((s) => !s.lastError).length;
  const errorCount = SOURCES.filter((s) => s.lastError).length;

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Civic Data Engine</h3>
          <p className="text-xs text-gray-500 mt-0.5">20 sources | Montreal Open Data</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-medium text-white transition-colors">
          <RefreshCw size={12} />
          Refresh All
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Circle size={8} className="text-emerald-400 fill-emerald-400" />
            <span className="text-xs text-gray-400">Healthy</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{healthyCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={8} className="text-red-400" />
            <span className="text-xs text-gray-400">Errors</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{errorCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Database size={8} className="text-blue-400" />
            <span className="text-xs text-gray-400">Sources</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{SOURCES.length}</p>
        </div>
      </div>

      {/* Sources table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-300">Source Registry</h4>
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <Activity size={10} />
            <span>Real-time sync enabled</span>
          </div>
        </div>

        <div className="divide-y divide-gray-800/50">
          {SOURCES.map((source) => {
            const isExpanded = expandedSource === source.source;
            const hasError = !!source.lastError;
            return (
              <div key={source.source}>
                <button
                  onClick={() => setExpandedSource(isExpanded ? null : source.source)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800/30 transition-colors text-left"
                >
                  <Circle
                    size={6}
                    className={hasError ? 'text-red-400 fill-red-400' : 'text-emerald-400 fill-emerald-400'}
                  />
                  <span className="text-xs font-medium text-white w-32 truncate">{source.source}</span>
                  <span className="text-[10px] text-gray-500 flex-1 truncate">{source.endpoint}</span>
                  <span className="text-[10px] text-gray-500 w-16 text-right">{formatInterval(source.refreshInterval)}</span>
                  <span className="text-[10px] text-gray-500 w-20 text-right">{timeAgo(source.lastSuccess)}</span>
                  <ChevronDown
                    size={12}
                    className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-gray-800/20">
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-gray-500">Endpoint:</span>
                        <p className="text-gray-300 mt-0.5 font-mono text-[10px] break-all">{source.endpoint}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Refresh Interval:</span>
                        <p className="text-gray-300 mt-0.5">{formatInterval(source.refreshInterval)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Success:</span>
                        <p className="text-gray-300 mt-0.5">{new Date(source.lastSuccess).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Error:</span>
                        <p className={`mt-0.5 ${hasError ? 'text-red-400' : 'text-gray-600'}`}>
                          {source.lastError || 'None'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-[10px] text-gray-300 transition-colors">
                        <RefreshCw size={10} />
                        Refresh Now
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-[10px] text-gray-300 transition-colors">
                        <Settings size={10} />
                        Edit
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-[10px] text-gray-300 transition-colors">
                        <ExternalLink size={10} />
                        Test
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
