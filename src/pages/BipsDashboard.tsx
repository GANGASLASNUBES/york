import { AppLayout } from '../components/layout/AppLayout';
import { ChartBar as BarChart3, Users, MapPin, Archive } from 'lucide-react';

export function BipsDashboard() {
  const contacts: any[] = [];
  const sites: any[] = [];

  const stats = [
    {
      label: 'Total Contacts',
      value: contacts?.length ?? 0,
      icon: Users,
      color: 'from-blue-400 to-blue-600',
    },
    {
      label: 'Active Sites',
      value: sites?.filter((s) => s.active).length ?? 0,
      icon: MapPin,
      color: 'from-teal-400 to-teal-600',
    },
    {
      label: 'Trusted Contacts',
      value: 0,
      icon: Archive,
      color: 'from-green-400 to-green-600',
    },
  ];

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Operational overview and quick access</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{label}</p>
                  <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <Icon size={40} className="opacity-20" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Total Provenance Objects</span>
                <span className="font-semibold text-gray-900">—</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Active Rituals</span>
                <span className="font-semibold text-gray-900">—</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">HUD Sessions</span>
                <span className="font-semibold text-gray-900">—</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-8 text-gray-500">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
