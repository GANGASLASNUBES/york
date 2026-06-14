import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { APIHealthMonitor, type APIHealthState, type APIStatus } from '../lib/apiHealth';

export default function APIStatusIndicator() {
  const [apiState, setApiState] = useState<APIHealthState | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const unsubscribe = APIHealthMonitor.subscribe((state) => {
      setApiState(state);

      const unavailableAPIs = Object.values(state).filter(api => !api.available);
      if (unavailableAPIs.length > 0) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    });

    return unsubscribe;
  }, []);

  if (!apiState) {
    return null;
  }

  const allAPIs = Object.values(apiState);
  const availableCount = allAPIs.filter(api => api.available).length;
  const totalCount = allAPIs.length;
  const allOnline = availableCount === totalCount;

  return (
    <>
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-amber-500/30 rounded-lg p-4 shadow-xl animate-slide-in">
          <div className="flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-medium text-sm mb-1">API Status Alert</h4>
              <p className="text-gray-400 text-xs">
                {totalCount - availableCount} API{totalCount - availableCount !== 1 ? 's are' : ' is'} currently offline.
                Running in guest mode with limited functionality.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 transition-colors w-full"
          >
            {allOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
            )}
            <span className="text-xs text-white font-medium">
              {availableCount}/{totalCount} APIs Online
            </span>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronUp className="w-3 h-3 text-gray-500" />
            )}
          </button>

          {isExpanded && (
            <div className="border-t border-gray-800 p-3 space-y-2">
              {allAPIs.map((api) => (
                <APIStatusRow key={api.name} api={api} />
              ))}
              <div className="pt-2 border-t border-gray-800">
                <p className="text-[10px] text-gray-600 text-center">
                  Last checked: {new Date(allAPIs[0].lastChecked).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function APIStatusRow({ api }: { api: APIStatus }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            api.available ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-gray-300">{api.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {api.responseTime && (
          <span className="text-gray-600 text-[10px]">{api.responseTime}ms</span>
        )}
        <span
          className={`text-[10px] ${
            api.available ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {api.available ? 'Online' : api.message || 'Offline'}
        </span>
      </div>
    </div>
  );
}
