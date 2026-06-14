import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { HudStatusBar } from '../components/HudStatusBar';
import { Radio, Code } from 'lucide-react';

export function BipsHudPage() {
  const [mode, setMode] = useState('contacts');

  const contactsView: any[] = [];
  const sitesView: any[] = [];
  const provenanceView: any[] = [];
  const ritualsView: any[] = [];

  const views = {
    contacts: contactsView,
    sites: sitesView,
    provenance: provenanceView,
    rituals: ritualsView,
  };

  const currentView = views[mode as keyof typeof views] || [];

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HUD Integration</h1>
          <p className="text-gray-600 mt-2">AR device overlays and lightweight JSON endpoints</p>
        </div>

        <HudStatusBar
          isConnected={true}
          mode={mode}
          onModeChange={setMode}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Radio size={20} />
              Current View: {mode}
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentView && currentView.length > 0 ? (
                currentView.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-medium text-gray-900">{item.displayName || item.label}</p>
                    <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No data for this view</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code size={20} />
              JSON Payload
            </h2>
            <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto font-mono max-h-96">
              {JSON.stringify(currentView, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">HUD Endpoint Information</h3>
          <p className="text-sm text-blue-800 mb-4">
            These lightweight JSON endpoints are optimized for AR overlays on HUD devices. Each returns only essential fields to minimize payload and latency.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['contacts', 'sites', 'provenance', 'rituals'].map((endpoint) => (
              <div key={endpoint} className="bg-white p-3 rounded border border-blue-200">
                <p className="font-mono text-xs text-gray-600">/hud/{endpoint}</p>
                <p className="text-xs text-gray-500 capitalize mt-1">{endpoint}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
