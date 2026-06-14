import { useState, useEffect } from 'react';
import { Eye, Download, Share2, Package, Gamepad2, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ClothingDesign } from '../../types/clothing';

export default function CompletedAssetsGallery() {
  const [designs, setDesigns] = useState<ClothingDesign[]>([]);
  const [filter, setFilter] = useState<'all' | 'draft' | 'ready' | 'published'>('all');
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadDesigns();
  }, [filter]);

  async function loadDesigns() {
    try {
      setLoading(true);
      const response = await supabase
        .from('clothing_designs')
        .select('*');

      if (response.error) throw response.error;

      let data = response.data || [];

      if (filter !== 'all') {
        data = data.filter((design: any) => design.status === filter);
      }

      data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setDesigns(data || []);
    } catch (error) {
      console.error('Error loading designs:', error);
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-600',
    ready: 'bg-amber-500 text-black',
    published: 'bg-green-600',
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-white">Completed Assets</h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-amber-500 transition-colors p-0.5"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex gap-1.5">
          {(['all', 'draft', 'ready', 'published'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-2.5 py-1 text-xs rounded-md capitalize transition-colors ${
                filter === status
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border border-transparent hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
              </div>
            ) : designs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No completed designs yet</p>
                <p className="text-xs mt-1 text-gray-600">Create your first design to see it here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {designs.map((design) => (
                  <div
                    key={design.id}
                    className="bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-amber-500/30 transition-all group overflow-hidden"
                  >
                    <div className="aspect-video bg-gray-800 relative overflow-hidden">
                      {design.mockup_urls.length > 0 ? (
                        <img
                          src={design.mockup_urls[0]}
                          alt={design.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                          <Package className="w-10 h-10" />
                        </div>
                      )}
                      <div
                        className={`absolute top-2 right-2 ${
                          statusColors[design.status] || 'bg-gray-600'
                        } text-white text-[10px] px-2 py-0.5 rounded font-medium uppercase`}
                      >
                        {design.status}
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="text-white font-medium text-xs mb-0.5">{design.name}</h3>
                      <p className="text-[10px] text-gray-500 capitalize">{design.product_type}</p>

                      <div className="flex items-center gap-1.5 mt-2 mb-2">
                        <span className="text-[10px] text-gray-600">Channels:</span>
                        <div className="flex gap-1">
                          {design.printful_product_id && (
                            <div className="p-0.5 bg-gray-700/50 rounded" title="Printful">
                              <Package className="w-2.5 h-2.5 text-gray-400" />
                            </div>
                          )}
                          {design.status === 'published' && (
                            <>
                              <div className="p-0.5 bg-gray-700/50 rounded" title="Gameware">
                                <Gamepad2 className="w-2.5 h-2.5 text-gray-400" />
                              </div>
                              <div className="p-0.5 bg-gray-700/50 rounded" title="AR">
                                <Smartphone className="w-2.5 h-2.5 text-gray-400" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button className="flex-1 px-2 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-white text-[10px] flex items-center justify-center gap-1 rounded-md transition-colors">
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button className="px-2 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-white rounded-md transition-colors">
                          <Download className="w-3 h-3" />
                        </button>
                        <button className="px-2 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-white rounded-md transition-colors">
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-700/30 text-[10px] text-gray-600">
                        {new Date(design.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-gray-500">
                <span className="text-white font-medium">{designs.length}</span> designs
              </div>
              <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-medium rounded-md transition-colors">
                Export All
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
