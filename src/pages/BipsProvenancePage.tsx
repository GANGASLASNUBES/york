import { AppLayout } from '../components/layout/AppLayout';
import { ProvenanceCard } from '../components/ProvenanceCard';
import { Plus, Inbox } from 'lucide-react';

export function BipsProvenancePage() {
  const provenance: any[] = [];

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provenance</h1>
            <p className="text-gray-600 mt-2">Artifacts, events, recipes, and documentation</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            New Object
          </button>
        </div>

        {!provenance || provenance.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Inbox size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No provenance objects yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {provenance.map((obj) => (
              <ProvenanceCard key={obj._id} provenance={obj} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
