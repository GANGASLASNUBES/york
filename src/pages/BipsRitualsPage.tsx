import { AppLayout } from '../components/layout/AppLayout';
import { RitualCard } from '../components/RitualCard';
import { Plus, BookOpen } from 'lucide-react';

export function BipsRitualsPage() {
  const rituals: any[] = [];

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rituals</h1>
            <p className="text-gray-600 mt-2">Daily flows, processes, and routines</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            New Ritual
          </button>
        </div>

        {!rituals || rituals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpen size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No rituals found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rituals.map((ritual) => (
              <RitualCard key={ritual._id} ritual={ritual} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
