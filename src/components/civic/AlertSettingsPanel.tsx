import { useState } from 'react';
import { Bell, Snowflake, Bus, Wind, Calendar, Shield, Mail, Smartphone, Globe } from 'lucide-react';

type AlertType = 'snow' | 'transit' | 'air_quality' | 'events' | 'safety';
type Severity = 'green' | 'amber' | 'red';
type Delivery = 'web' | 'email' | 'sms';

type AlertConfig = {
  type: AlertType;
  label: string;
  icon: typeof Snowflake;
  enabled: boolean;
  severity: Severity;
  delivery: Delivery;
};

const DEFAULT_ALERTS: AlertConfig[] = [
  { type: 'snow', label: 'Snow Operations', icon: Snowflake, enabled: true, severity: 'amber', delivery: 'web' },
  { type: 'transit', label: 'Transit Disruptions', icon: Bus, enabled: true, severity: 'amber', delivery: 'web' },
  { type: 'air_quality', label: 'Air Quality', icon: Wind, enabled: false, severity: 'red', delivery: 'web' },
  { type: 'events', label: 'Cultural Events', icon: Calendar, enabled: true, severity: 'green', delivery: 'web' },
  { type: 'safety', label: 'Safety Advisories', icon: Shield, enabled: true, severity: 'amber', delivery: 'email' },
];

const severityOptions: { value: Severity; label: string; color: string }[] = [
  { value: 'green', label: 'All', color: 'bg-emerald-600' },
  { value: 'amber', label: 'Caution+', color: 'bg-amber-600' },
  { value: 'red', label: 'Urgent only', color: 'bg-red-600' },
];

const deliveryOptions: { value: Delivery; label: string; icon: typeof Globe }[] = [
  { value: 'web', label: 'Web', icon: Globe },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: Smartphone },
];

type Props = {
  onSave?: (alerts: AlertConfig[]) => void;
};

export function AlertSettingsPanel({ onSave }: Props) {
  const [alerts, setAlerts] = useState(DEFAULT_ALERTS);

  const toggleAlert = (type: AlertType) => {
    setAlerts((prev) => prev.map((a) => a.type === type ? { ...a, enabled: !a.enabled } : a));
  };

  const setSeverity = (type: AlertType, severity: Severity) => {
    setAlerts((prev) => prev.map((a) => a.type === type ? { ...a, severity } : a));
  };

  const setDelivery = (type: AlertType, delivery: Delivery) => {
    setAlerts((prev) => prev.map((a) => a.type === type ? { ...a, delivery } : a));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Bell size={14} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white">Alert Preferences</h3>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.type}
              className={`bg-gray-900 border rounded-xl p-4 transition-all ${
                alert.enabled ? 'border-gray-700' : 'border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className={alert.enabled ? 'text-amber-400' : 'text-gray-600'} />
                  <span className="text-xs font-medium text-white">{alert.label}</span>
                </div>
                <button
                  onClick={() => toggleAlert(alert.type)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${alert.enabled ? 'bg-emerald-600' : 'bg-gray-700'}`}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all" style={{ left: alert.enabled ? '18px' : '3px' }} />
                </button>
              </div>

              {alert.enabled && (
                <div className="space-y-2.5 pt-2 border-t border-gray-800">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Severity Threshold</p>
                    <div className="flex gap-1.5">
                      {severityOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSeverity(alert.type, opt.value)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                            alert.severity === opt.value
                              ? `${opt.color} text-white`
                              : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Delivery</p>
                    <div className="flex gap-1.5">
                      {deliveryOptions.map((opt) => {
                        const DIcon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setDelivery(alert.type, opt.value)}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                              alert.delivery === opt.value
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-800 text-gray-500'
                            }`}
                          >
                            <DIcon size={9} />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onSave?.(alerts)}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-medium text-white transition-colors"
      >
        Save Alert Settings
      </button>
    </div>
  );
}
