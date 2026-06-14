import { Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AlertSettingsPanel } from '../../components/civic/AlertSettingsPanel';

export function MyAlertsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <Bell size={16} className="text-amber-400" />
          <h1 className="text-sm font-bold">My Alerts</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <AlertSettingsPanel onSave={() => {}} />
      </div>
    </div>
  );
}
