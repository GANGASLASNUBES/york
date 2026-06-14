import { useState, useEffect } from 'react';
import { Activity, Radio, Waves, Eye, Heart } from 'lucide-react';

type TelemetryEvent = {
  id: string;
  deviceId: string;
  event: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
};

type Emotion = { mood: string; intensity: number; timestamp: number };

const SAMPLE_EVENTS: TelemetryEvent[] = [
  { id: '1', deviceId: 'HUD-01', event: 'Contact detected: ally zone', timestamp: Date.now() - 1000, severity: 'info' },
  { id: '2', deviceId: 'HUD-01', event: 'Site proximity alert', timestamp: Date.now() - 15000, severity: 'warning' },
  { id: '3', deviceId: 'HUD-02', event: 'Biometric spike detected', timestamp: Date.now() - 45000, severity: 'critical' },
  { id: '4', deviceId: 'HUD-01', event: 'Ritual sync complete', timestamp: Date.now() - 120000, severity: 'info' },
  { id: '5', deviceId: 'HUD-02', event: 'Position lock: grid 7B', timestamp: Date.now() - 180000, severity: 'info' },
];

const SAMPLE_EMOTIONS: Emotion[] = [
  { mood: 'Focused', intensity: 0.85, timestamp: Date.now() - 1000 },
  { mood: 'Alert', intensity: 0.72, timestamp: Date.now() - 30000 },
  { mood: 'Calm', intensity: 0.58, timestamp: Date.now() - 90000 },
];

export function BipsHudTelemetryPage() {
  const [events, setEvents] = useState<TelemetryEvent[]>(SAMPLE_EVENTS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  const severityColor = (s: TelemetryEvent['severity']) => {
    if (s === 'critical') return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (s === 'warning') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">HUD Telemetry</h1>
          <p className="text-gray-400 text-sm">Live stream • {events.length} events • Tick {tick}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">Live</span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Radio, label: 'Active Devices', value: '2', color: 'text-cyan-400' },
          { icon: Activity, label: 'Events / min', value: '14', color: 'text-emerald-400' },
          { icon: Waves, label: 'Signal Strength', value: '92%', color: 'text-amber-400' },
          { icon: Heart, label: 'Biometric Avg', value: '68 bpm', color: 'text-rose-400' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <s.icon className={`${s.color} mb-3`} size={20} />
            <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={18} />
            Event Stream
          </h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {events.map((e) => (
              <div key={e.id} className={`border rounded-lg px-4 py-3 ${severityColor(e.severity)}`}>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-1">{e.deviceId}</div>
                    <div className="text-sm text-white">{e.event}</div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Eye size={18} />
            Emotion Overlay
          </h2>
          <div className="space-y-4">
            {SAMPLE_EMOTIONS.map((emo) => (
              <div key={emo.timestamp}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white font-medium">{emo.mood}</span>
                  <span className="text-gray-400">{Math.round(emo.intensity * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${emo.intensity * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(emo.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              setEvents([
                {
                  id: String(Date.now()),
                  deviceId: 'HUD-01',
                  event: 'Manual telemetry probe',
                  timestamp: Date.now(),
                  severity: 'info',
                },
                ...events,
              ])
            }
            className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Probe HUD Now
          </button>
        </div>
      </div>
    </div>
  );
}
