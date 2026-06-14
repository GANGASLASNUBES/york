import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../components/AppLayout';
import { AdminDashboard } from '../components/AdminDashboard';
import { CircleAlert as AlertCircle } from 'lucide-react';

export function AdminPage() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="p-8 max-w-2xl mx-auto">
          <div className="flex items-start gap-4 p-6 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-1">Access Denied</h2>
              <p className="text-red-800">
                You do not have permission to access the Admin Control Center.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <AdminDashboard />
      </div>
    </AppLayout>
  );
}
