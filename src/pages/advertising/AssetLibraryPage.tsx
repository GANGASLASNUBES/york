import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AssetUploadModal } from '../../components/advertising/AssetUploadModal';
import { useAuth } from '../../lib/auth';
import {
  Upload, Filter, Search, Video, Image, Music,
  Smartphone, Activity, Package, MoreVertical,
  Eye, Download, Trash2, Cloud, CheckCircle, LogIn, ArrowRight
} from 'lucide-react';

type AssetType = 'all' | 'video' | 'image' | 'audio' | 'ar' | 'telemetry' | 'product';
type AssetStatus = 'draft' | 'approved' | 'published' | 'archived';

interface Asset {
  id: string;
  title: string;
  type: AssetType;
  status: AssetStatus;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  dimensions?: string;
  duration?: string;
  roleAccess: string[];
  source?: 'local' | 'onedrive';
}

const mockAssets: Asset[] = [
  { id: '1', title: 'BIPS Gear AR Demo', type: 'ar', status: 'published', tags: ['AR', 'demo', 'interactive'], uploadedBy: 'John Doe', uploadedAt: '2024-01-08', fileSize: '15.2 MB', roleAccess: ['admin', 'creator', 'brand'], source: 'local' },
  { id: '2', title: 'Product Launch Video', type: 'video', status: 'approved', tags: ['launch', 'promo', 'tiktok'], uploadedBy: 'Jane Smith', uploadedAt: '2024-01-07', fileSize: '45.8 MB', duration: '0:30', dimensions: '1080x1920', roleAccess: ['admin', 'creator'], source: 'local' },
  { id: '3', title: 'Battery Telemetry Data', type: 'telemetry', status: 'published', tags: ['telemetry', 'battery', 'analytics'], uploadedBy: 'Tech Team', uploadedAt: '2024-01-06', fileSize: '2.1 MB', roleAccess: ['admin', 'brand'], source: 'local' },
  { id: '4', title: 'Product Hero Image', type: 'image', status: 'published', tags: ['hero', 'product', 'marketing'], uploadedBy: 'Design Team', uploadedAt: '2024-01-05', fileSize: '3.5 MB', dimensions: '3840x2160', roleAccess: ['admin', 'creator', 'brand'], source: 'local' },
  { id: '5', title: 'Background Music', type: 'audio', status: 'approved', tags: ['music', 'background', 'ambient'], uploadedBy: 'Audio Team', uploadedAt: '2024-01-04', fileSize: '8.7 MB', duration: '2:15', roleAccess: ['admin', 'creator'], source: 'local' },
  { id: '6', title: 'New Gear Model', type: 'product', status: 'draft', tags: ['product', '3d', 'model'], uploadedBy: 'John Doe', uploadedAt: '2024-01-03', fileSize: '25.4 MB', roleAccess: ['admin'], source: 'local' },
];

const oneDriveAssets: Asset[] = [
  { id: 'od-1', title: 'Campaign Hero Banner', type: 'image', status: 'published', tags: ['campaign', 'banner', 'onedrive'], uploadedBy: 'OneDrive Sync', uploadedAt: '2024-01-09', fileSize: '4.2 MB', dimensions: '1920x1080', roleAccess: ['admin', 'creator'], source: 'onedrive' },
  { id: 'od-2', title: 'Brand Guidelines PDF', type: 'image', status: 'approved', tags: ['brand', 'guidelines', 'onedrive'], uploadedBy: 'OneDrive Sync', uploadedAt: '2024-01-08', fileSize: '2.4 MB', roleAccess: ['admin', 'creator', 'brand'], source: 'onedrive' },
  { id: 'od-3', title: 'Social Media Templates', type: 'image', status: 'published', tags: ['social', 'templates', 'onedrive'], uploadedBy: 'OneDrive Sync', uploadedAt: '2024-01-07', fileSize: '8.1 MB', roleAccess: ['admin', 'creator'], source: 'onedrive' },
];

const assetTypeIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  video: Video,
  image: Image,
  audio: Music,
  ar: Smartphone,
  telemetry: Activity,
  product: Package,
  all: Filter,
};

const statusColors: Record<AssetStatus, string> = {
  draft: 'bg-gray-600',
  approved: 'bg-blue-600',
  published: 'bg-green-600',
  archived: 'bg-red-600',
};

export function AssetLibraryPage() {
  const { user, profile } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AssetType>('all');
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allAssets = profile?.ms_connected && profile?.ms_onedrive_enabled
    ? [...mockAssets, ...oneDriveAssets]
    : mockAssets;

  const allTags = Array.from(new Set(allAssets.flatMap(asset => asset.tags)));

  const filteredAssets = allAssets.filter(asset => {
    if (selectedType !== 'all' && asset.type !== selectedType) return false;
    if (selectedStatus !== 'all' && asset.status !== selectedStatus) return false;
    if (searchQuery && !asset.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedTags.length > 0 && !selectedTags.some(tag => asset.tags.includes(tag))) return false;
    return true;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="p-4 rounded-xl bg-gray-800 w-fit mx-auto mb-6">
            <LogIn size={48} className="text-gray-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-400 mb-8 text-lg leading-relaxed">
            Sign in to access the Asset Library and manage your advertising assets.
          </p>
          <Link to="/auth">
            <Button variant="primary" className="min-w-[200px]">
              Sign In
              <ArrowRight className="inline-block ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-5xl font-bold">Asset Library</h1>
          <p className="text-gray-400 mt-2 text-lg">Manage your advertising assets</p>
        </div>
        <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="inline-block mr-2" size={20} />
          Upload Asset
        </Button>
      </div>

      {profile?.ms_connected && profile?.ms_onedrive_enabled && (
        <Card className="mb-8 border-green-800/50">
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-900/30 border border-green-700/30">
                <Cloud size={20} className="text-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">OneDrive Connected</span>
                  <CheckCircle size={14} className="text-green-500" />
                </div>
                <p className="text-sm text-gray-400">
                  {oneDriveAssets.length} assets synced from {profile.ms_display_name}'s OneDrive
                </p>
              </div>
              <Link to="/advertising/m365">
                <Button variant="ghost" className="text-sm">Manage</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      {profile?.ms_connected && !profile?.ms_onedrive_enabled && (
        <Card className="mb-8 border-amber-500/30">
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-900/30 border border-amber-700/30">
                <Cloud size={20} className="text-amber-500" />
              </div>
              <div className="flex-1">
                <span className="font-semibold">Enable OneDrive Sync</span>
                <p className="text-sm text-gray-400">
                  Your Microsoft account is connected but OneDrive sync is disabled.
                </p>
              </div>
              <Link to="/advertising/m365">
                <Button variant="primary" className="text-sm">Enable</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      {!profile?.ms_connected && (
        <Card className="mb-8 border-gray-700">
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-800 border border-gray-700">
                <Cloud size={20} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-gray-300">Connect Microsoft 365</span>
                <p className="text-sm text-gray-500">
                  Link your Microsoft account to sync assets from OneDrive automatically.
                </p>
              </div>
              <Link to="/advertising/m365">
                <Button variant="secondary" className="text-sm">Connect</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'video', 'image', 'audio', 'ar', 'telemetry', 'product'] as AssetType[]).map(type => {
            const Icon = assetTypeIcons[type];
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                  selectedType === type
                    ? 'bg-amber-600 text-black font-semibold'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'draft', 'approved', 'published', 'archived'] as (AssetStatus | 'all')[]).map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                selectedStatus === status
                  ? 'bg-amber-600 text-black font-semibold'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Filter by tags:</label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-amber-600 text-black font-semibold'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 text-gray-400 text-sm">
        Showing {filteredAssets.length} of {allAssets.length} assets
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map(asset => {
          const Icon = assetTypeIcons[asset.type] || Filter;
          return (
            <Card key={asset.id} className="hover:border-amber-500/50 transition-all group overflow-hidden">
              <div className="relative aspect-video bg-gray-800 flex items-center justify-center">
                <Icon className="w-16 h-16 text-gray-600" />
                {asset.source === 'onedrive' && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-blue-900/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Cloud size={12} className="text-blue-400" />
                    <span className="text-xs text-blue-300 font-medium">OneDrive</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                  <button className="bg-amber-600 hover:bg-amber-700 text-black p-2 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <CardBody>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{asset.title}</h3>
                  <button className="text-gray-400 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${statusColors[asset.status]}`}>
                    {asset.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {asset.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">#{tag}</span>
                  ))}
                </div>

                <div className="text-sm text-gray-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{asset.type.toUpperCase()}</span>
                  </div>
                  <div>{asset.fileSize}</div>
                  {asset.dimensions && <div>{asset.dimensions}</div>}
                  {asset.duration && <div>Duration: {asset.duration}</div>}
                  <div className="text-xs">by {asset.uploadedBy} -- {asset.uploadedAt}</div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-800">
                  <div className="text-xs text-gray-400 mb-1">Access:</div>
                  <div className="flex flex-wrap gap-1">
                    {asset.roleAccess.map(role => (
                      <span key={role} className="text-xs bg-amber-900/30 text-amber-500 px-2 py-0.5 rounded border border-amber-700/30">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-16">
          <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No assets found</h3>
          <p className="text-gray-500">Try adjusting your filters or upload a new asset</p>
        </div>
      )}

      <AssetUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
