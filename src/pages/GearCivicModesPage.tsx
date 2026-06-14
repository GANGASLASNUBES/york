import { useState } from 'react';
import {
  Car, Bike, Shield, Snowflake, CloudRain, Construction, Bus,
  Wind, Volume2, Wifi, Trees, MapPin, TriangleAlert as AlertTriangle,
  Circle, Zap, ShoppingBag, ArrowRight
} from 'lucide-react';
import { CivicSeverityBadge } from '../components/civic/CivicSeverityBadge';
import { CivicMapPanel } from '../components/civic/CivicMapPanel';

type Mode = 'commuter' | 'cyclist' | 'safety';
type Severity = 'green' | 'amber' | 'red';

const MODE_CONFIG: Record<Mode, { label: string; icon: typeof Car; color: string; bg: string; description: string }> = {
  commuter: { label: 'Commuter Mode', icon: Car, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-600/30', description: 'Traffic, transit, snow, and road closures' },
  cyclist: { label: 'Cyclist Mode', icon: Bike, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-600/30', description: 'Bike paths, air quality, and noise' },
  safety: { label: 'Safety Mode', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-600/30', description: 'Shelters, Wi-Fi, and green spaces' },
};

type AlertItem = {
  label: string;
  value: string;
  severity: Severity;
  icon: typeof Snowflake;
  suggestion?: string;
};

const MODE_ALERTS: Record<Mode, AlertItem[]> = {
  commuter: [
    { label: 'Snow Operations', value: 'Active - Plateau, Rosemont', severity: 'amber', icon: Snowflake, suggestion: 'Allow extra 15 min' },
    { label: 'Traffic Congestion', value: 'A-40 Heavy, Sherbrooke Moderate', severity: 'red', icon: Car, suggestion: 'Take metro or detour via Rene-Levesque' },
    { label: 'Street Closures', value: '3 active closures downtown', severity: 'amber', icon: Construction, suggestion: 'Avoid Sainte-Catherine W' },
    { label: 'Transit Delays', value: 'Orange line: 5 min delay', severity: 'green', icon: Bus, suggestion: 'Minor - no action needed' },
  ],
  cyclist: [
    { label: 'Bike Path Status', value: 'De Maisonneuve: Clear', severity: 'green', icon: Bike },
    { label: 'Air Quality', value: 'AQI 42 - Good', severity: 'green', icon: Wind },
    { label: 'Noise Level', value: 'High near Ville-Marie construction', severity: 'amber', icon: Volume2, suggestion: 'Route via Plateau for quieter ride' },
    { label: 'Weather Alert', value: 'Light rain expected 4pm', severity: 'amber', icon: CloudRain, suggestion: 'Pack rain layer' },
  ],
  safety: [
    { label: 'Nearest Shelter', value: 'Mission Old Brewery (0.4 km)', severity: 'green', icon: MapPin },
    { label: 'Wi-Fi Hotspots', value: '3 free spots within 500m', severity: 'green', icon: Wifi },
    { label: 'Green Spaces', value: 'Parc La Fontaine (0.6 km)', severity: 'green', icon: Trees },
    { label: 'Safety Advisory', value: 'No active advisories', severity: 'green', icon: Shield },
  ],
};

type GearRec = { name: string; reason: string; price: string };

const GEAR_RECOMMENDATIONS: Record<Mode, GearRec[]> = {
  commuter: [
    { name: 'BIPS Thermal Shell', reason: 'Snow ops active - waterproof outer layer recommended', price: '$189' },
    { name: 'BIPS Grip Soles', reason: 'Ice risk on sidewalks during snow removal', price: '$45' },
    { name: 'BIPS Transit Pack', reason: 'Hands-free commute - fits laptop + layers', price: '$129' },
  ],
  cyclist: [
    { name: 'BIPS Rain Layer', reason: 'Rain expected at 4pm - lightweight and packable', price: '$95' },
    { name: 'BIPS Reflective Vest', reason: 'Reduced visibility in rain conditions', price: '$55' },
    { name: 'BIPS Air Mask', reason: 'AQI moderate in East End - filter protection', price: '$35' },
  ],
  safety: [
    { name: 'BIPS Warm Core Hoodie', reason: 'Layerable warmth for outdoor exposure', price: '$79' },
    { name: 'BIPS Rechargeable Light', reason: 'Visibility in low-light areas', price: '$25' },
    { name: 'BIPS Emergency Kit', reason: 'Compact essentials: phone charger, whistle, first aid', price: '$49' },
  ],
};

const severityBorder: Record<Severity, string> = {
  green: 'border-emerald-600/20',
  amber: 'border-amber-600/20',
  red: 'border-red-600/20',
};

export function GearCivicModesPage() {
  const [activeMode, setActiveMode] = useState<Mode>('commuter');

  const config = MODE_CONFIG[activeMode];
  const alerts = MODE_ALERTS[activeMode];
  const gearRecs = GEAR_RECOMMENDATIONS[activeMode];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-orange-400" />
              </div>
              <div>
                <h1 className="text-base font-bold">Gear Civic Modes</h1>
                <p className="text-[10px] text-gray-500">Context-aware commuting intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Circle size={8} className="text-emerald-400 fill-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">Live data</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Mode selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([key, m]) => {
            const Icon = m.icon;
            const isActive = activeMode === key;
            return (
              <button
                key={key}
                onClick={() => setActiveMode(key as Mode)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? `${m.bg} ${m.color} scale-[1.02] shadow-lg`
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? '' : 'text-gray-500'} />
                  <div>
                    <h3 className={`text-sm font-bold ${isActive ? '' : 'text-gray-300'}`}>{m.label}</h3>
                    <p className={`text-[10px] mt-0.5 ${isActive ? 'opacity-70' : 'text-gray-600'}`}>{m.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Alerts column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Alert cards */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => { const Icon = config.icon; return <Icon size={14} className={config.color} />; })()}
                  <h2 className="text-sm font-bold">{config.label} Alerts</h2>
                </div>
                <span className="text-[9px] text-gray-500">Updated 2 min ago</span>
              </div>

              <div className="p-3 space-y-2">
                {alerts.map((alert, i) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border ${severityBorder[alert.severity]} bg-gray-950/50`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={14} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-white">{alert.label}</p>
                          <CivicSeverityBadge severity={alert.severity} />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{alert.value}</p>
                        {alert.suggestion && (
                          <p className="text-[10px] text-amber-300/80 mt-1.5 flex items-center gap-1">
                            <ArrowRight size={8} />
                            {alert.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map */}
            <CivicMapPanel title={`${config.label} — Active Conditions`} height="h-56" />
          </div>

          {/* Right column: Gear recommendations */}
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={14} className="text-orange-400" />
                  <h3 className="text-sm font-bold">Recommended Gear</h3>
                </div>
                <p className="text-[9px] text-gray-500 mt-1">Based on current civic conditions</p>
              </div>

              <div className="p-3 space-y-2">
                {gearRecs.map((rec, i) => (
                  <div key={i} className="p-3 bg-gray-950 rounded-xl border border-gray-800/50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-semibold text-white">{rec.name}</h4>
                      <span className="text-[10px] text-orange-400 font-bold">{rec.price}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{rec.reason}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-gray-800">
                <button className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-medium transition-colors">
                  Shop {config.label.split(' ')[0]} Gear
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Sources', value: '20' },
                { label: 'Refresh', value: '15m' },
                { label: 'Boroughs', value: '19' },
                { label: 'Uptime', value: '99.2%' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                  <p className="text-base font-bold text-white">{stat.value}</p>
                  <p className="text-[9px] text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
