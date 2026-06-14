import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { SiteCard } from '../components/SiteCard';
import { Plus, ListFilter as Filter } from 'lucide-react';

export function BipsSitesPage() {
  const sites: any[] = [];
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const types = ['shelter', 'field', 'work', 'other'];
  const filtered = !selectedType ? sites : (sites as any[]).filter((s: any) => s.type === selectedType);

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
            <p className="text-gray-600 mt-2">Shelters, field nodes, and work locations</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            New Site
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedType === null
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedType === type
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {!filtered || filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Filter size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No sites found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((site) => (
              <SiteCard key={site._id} site={site} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
