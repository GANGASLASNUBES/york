import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../components/AppLayout';
import { EmotionalCardPanel } from '../components/EmotionalCardPanel';
import { RitualPanel } from '../components/RitualPanel';
import { ProvenanceViewer } from '../components/ProvenanceViewer';
import { MetroMapOverlay } from '../components/MetroMapOverlay';

export function DashboardPage() {
  const { user, isAdmin } = useAuth();

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Architect Vector - Admin Control' : `${user?.theme || 'BIPS'} Vector - Ready to signal`}
          </p>
        </div>

        {isAdmin && (
          <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-900">
              You are in admin mode. Access the Control Center to manage emotional cards and team settings.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Emotional Cards</h2>
              <EmotionalCardPanel />
            </div>

            {isAdmin && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Location Map</h2>
                <MetroMapOverlay />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <RitualPanel />
            <ProvenanceViewer />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
