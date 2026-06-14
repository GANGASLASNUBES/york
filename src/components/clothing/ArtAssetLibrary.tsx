import { useState, useEffect } from 'react';
import { Search, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ArtAsset } from '../../types/clothing';

interface ArtAssetLibraryProps {
  onDragStart: (asset: ArtAsset) => void;
}

export default function ArtAssetLibrary({ onDragStart }: ArtAssetLibraryProps) {
  const [assets, setAssets] = useState<ArtAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadAssets();
  }, [selectedType]);

  async function loadAssets() {
    try {
      setLoading(true);
      const response = await supabase.from('art_assets').select('*');

      if (response.error) throw response.error;

      let data = response.data || [];

      if (selectedType !== 'all') {
        data = data.filter((asset: any) => asset.asset_type === selectedType);
      }

      data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAssets(data);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const assetTypes = [
    { value: 'all', label: 'All' },
    { value: 'avatar', label: 'Avatar' },
    { value: 'brand', label: 'Brand' },
    { value: 'pattern', label: 'Patterns' },
    { value: 'texture', label: 'Textures' },
    { value: 'mask', label: 'Masks' },
    { value: 'video_loop', label: 'Video' },
    { value: 'civic_data', label: 'Civic' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-white">Art Asset Library</h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-amber-500 transition-colors p-0.5"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex gap-2 mb-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {assetTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                selectedType === type.value
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border border-transparent hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No assets found. Upload your first asset to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  draggable
                  onDragStart={() => onDragStart(asset)}
                  className="group cursor-move bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-amber-500/40 transition-all overflow-hidden"
                >
                  <div className="aspect-square bg-gray-800 flex items-center justify-center relative overflow-hidden">
                    {asset.file_type === 'image' ? (
                      <img
                        src={asset.file_url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : asset.file_type === 'video' ? (
                      <video
                        src={asset.file_url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                      />
                    ) : (
                      <div className="text-gray-600 text-2xl font-medium">
                        {asset.file_type.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {asset.is_lexi_compliant && (
                      <div className="absolute top-1.5 right-1.5 bg-amber-500 text-black text-[10px] font-semibold px-1.5 py-0.5 rounded">
                        LEXI
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-white text-xs font-medium truncate">{asset.name}</h3>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {asset.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] bg-gray-700/50 text-gray-400 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
