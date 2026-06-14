import { useState } from 'react';
import { Activity, Battery, Thermometer, Clock, Shield, Info } from 'lucide-react';

interface TelemetryVisualizerProps {
  showAnonymizationToggle?: boolean;
  dataSource?: string;
}

const batteryData = [
  { time: '0h', level: 100, temp: 20 },
  { time: '1h', level: 92, temp: 22 },
  { time: '2h', level: 84, temp: 25 },
  { time: '3h', level: 75, temp: 28 },
  { time: '4h', level: 68, temp: 30 },
  { time: '5h', level: 58, temp: 32 },
  { time: '6h', level: 48, temp: 33 },
  { time: '7h', level: 35, temp: 31 },
  { time: '8h', level: 22, temp: 29 },
  { time: '9h', level: 10, temp: 26 }
];

const heatZones = [
  { zone: 'Battery', temp: 32, status: 'normal' },
  { zone: 'Motor 1', temp: 45, status: 'warm' },
  { zone: 'Motor 2', temp: 48, status: 'warm' },
  { zone: 'Controller', temp: 38, status: 'normal' },
  { zone: 'Charging Port', temp: 28, status: 'cool' }
];

const usagePatterns = [
  { day: 'Mon', hours: 5.2, sessions: 3 },
  { day: 'Tue', hours: 6.8, sessions: 4 },
  { day: 'Wed', hours: 4.5, sessions: 2 },
  { day: 'Thu', hours: 7.2, sessions: 5 },
  { day: 'Fri', hours: 8.5, sessions: 6 },
  { day: 'Sat', hours: 9.3, sessions: 7 },
  { day: 'Sun', hours: 6.7, sessions: 4 }
];

export function TelemetryVisualizer({
  showAnonymizationToggle = true,
  dataSource = 'Aggregated from 1,234 devices'
}: TelemetryVisualizerProps) {
  const [isAnonymized, setIsAnonymized] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cool':
        return 'text-blue-400 bg-blue-900/30';
      case 'normal':
        return 'text-green-400 bg-green-900/30';
      case 'warm':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'hot':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-amber-500" />
          <div>
            <h3 className="text-lg font-bold text-white">Telemetry Data</h3>
            <p className="text-sm text-gray-400">{dataSource}</p>
          </div>
        </div>
        {showAnonymizationToggle && (
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm text-gray-300">Anonymized</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={isAnonymized}
                onChange={(e) => setIsAnonymized(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-12 h-6 rounded-full transition-colors ${
                  isAnonymized ? 'bg-green-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    isAnonymized ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`}
                />
              </div>
            </div>
          </label>
        )}
      </div>

      {/* Privacy Notice */}
      {isAnonymized && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-500 mt-0.5" />
          <div className="text-sm">
            <div className="text-green-400 font-semibold mb-1">Privacy Protected</div>
            <div className="text-gray-300">
              All data is anonymized and aggregated. No personal information is collected or displayed.
            </div>
          </div>
        </div>
      )}

      {/* Battery Runtime Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Battery className="w-5 h-5 text-amber-500" />
          <h4 className="font-semibold text-white">Battery Runtime Analysis</h4>
        </div>

        <div className="space-y-3">
          {batteryData.map((data, index) => {
            const maxLevel = Math.max(...batteryData.map(d => d.level));
            const percentage = (data.level / maxLevel) * 100;

            return (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 w-8">{data.time}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-semibold">{data.level}%</span>
                    <span className="text-gray-400">{data.temp}°C</span>
                  </div>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      data.level > 50
                        ? 'bg-gradient-to-r from-green-600 to-green-500'
                        : data.level > 20
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-500'
                        : 'bg-gradient-to-r from-red-600 to-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">9.2h</div>
            <div className="text-sm text-gray-400">Avg Runtime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">28°C</div>
            <div className="text-sm text-gray-400">Avg Temp</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">450</div>
            <div className="text-sm text-gray-400">Cycles</div>
          </div>
        </div>
      </div>

      {/* Heat Zone Map */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Thermometer className="w-5 h-5 text-amber-500" />
          <h4 className="font-semibold text-white">Heat Zone Map</h4>
        </div>

        <div className="space-y-3">
          {heatZones.map((zone, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Thermometer className="w-4 h-4 text-gray-400" />
                <span className="text-white font-medium">{zone.zone}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">{zone.temp}°C</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                    zone.status
                  )}`}
                >
                  {zone.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 mt-0.5" />
            <p className="text-sm text-gray-400">
              Temperature readings are averaged across all monitored zones during typical usage.
            </p>
          </div>
        </div>
      </div>

      {/* Usage Pattern Graph */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-amber-500" />
          <h4 className="font-semibold text-white">Weekly Usage Patterns</h4>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {usagePatterns.map((pattern, index) => {
            const maxHours = Math.max(...usagePatterns.map(p => p.hours));
            const heightPercentage = (pattern.hours / maxHours) * 100;

            return (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full h-32 flex flex-col justify-end mb-2">
                  <div
                    className="w-full bg-gradient-to-t from-amber-600 to-amber-500 rounded-t transition-all"
                    style={{ height: `${heightPercentage}%` }}
                  />
                </div>
                <div className="text-xs font-semibold text-white mb-1">{pattern.day}</div>
                <div className="text-xs text-gray-400">{pattern.hours}h</div>
                <div className="text-xs text-gray-500">{pattern.sessions} sessions</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-800">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Total Weekly Hours</div>
            <div className="text-2xl font-bold text-amber-500">48.2h</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Total Sessions</div>
            <div className="text-2xl font-bold text-amber-500">31</div>
          </div>
        </div>
      </div>

      {/* Data Source Footer */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Info className="w-4 h-4" />
            <span>Data updated in real-time</span>
          </div>
          <div className="text-gray-500">Last updated: Just now</div>
        </div>
      </div>
    </div>
  );
}
