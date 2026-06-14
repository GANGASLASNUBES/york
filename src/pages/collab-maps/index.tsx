import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Map, Users, Globe, Lock, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { sanitizeText, validateMapName } from '../../lib/security/sanitize';
import { checkRateLimit, getRateLimitError } from '../../lib/security/rateLimit';
import { logAuditEvent } from '../../lib/security/auditLog';
import CollaborativeMapEditor from '../../components/collab/CollaborativeMapEditor';
import CollaborativeMapSidebar from '../../components/collab/CollaborativeMapSidebar';
import CollaborativeMapActivityFeed from '../../components/collab/CollaborativeMapActivityFeed';
import type { CollabMember, CollabPin } from '../../components/collab/CollaborativeMapSidebar';
import type { ActivityEvent } from '../../components/collab/CollaborativeMapActivityFeed';

type CollabMap = {
  id: string;
  title: string;
  description: string;
  overlays: string[];
  centerLat: number;
  centerLng: number;
  zoom: number;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
};

type ViewMode = 'list' | 'editor';

export default function CollaborativeMapsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [maps, setMaps] = useState<CollabMap[]>([]);
  const [selectedMap, setSelectedMap] = useState<CollabMap | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<CollabMember[]>([]);
  const [pins, setPins] = useState<CollabPin[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from('collab_maps')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setMaps(data.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          overlays: d.overlays as string[],
          centerLat: d.center_lat,
          centerLng: d.center_lng,
          zoom: d.zoom,
          isPublic: d.is_public,
          publicSlug: d.public_slug,
          createdAt: d.created_at,
        })));
      }
    }
    load();
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    setError(null);
    const validation = validateMapName(newTitle);
    if (!validation.valid) { setError(validation.error!); return; }

    const rateCheck = checkRateLimit(user.id, 'map:create');
    if (!rateCheck.allowed) { setError(getRateLimitError(rateCheck.retryAfterMs!)); return; }

    const { data, error: dbError } = await supabase.from('collab_maps').insert({
      owner_id: user.id,
      title: sanitizeText(newTitle),
      description: sanitizeText(newDescription),
      overlays: ['traffic', 'shelters', 'public_art'],
    }).select().maybeSingle();

    if (dbError) { setError('Failed to create map'); return; }
    if (data) {
      const newMap: CollabMap = {
        id: data.id,
        title: data.title,
        description: data.description,
        overlays: data.overlays as string[],
        centerLat: data.center_lat,
        centerLng: data.center_lng,
        zoom: data.zoom,
        isPublic: data.is_public,
        publicSlug: data.public_slug,
        createdAt: data.created_at,
      };
      setMaps((prev) => [newMap, ...prev]);
      await logAuditEvent(user.id, 'map:create', { mapId: data.id, title: data.title }, 'map', data.id);
    }
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const openMap = async (map: CollabMap) => {
    setSelectedMap(map);
    setViewMode('editor');

    const { data: memberData } = await supabase
      .from('collab_map_members')
      .select('*')
      .eq('map_id', map.id);

    if (memberData) {
      setMembers(memberData.map((m) => ({
        id: m.id,
        email: m.email,
        role: m.role as CollabMember['role'],
        accepted: !!m.accepted_at,
      })));
    }

    const { data: pinData } = await supabase
      .from('collab_map_pins')
      .select('*')
      .eq('map_id', map.id);

    if (pinData) {
      setPins(pinData.map((p) => ({
        id: p.id,
        lat: Number(p.lat),
        lng: Number(p.lng),
        title: p.title,
        category: p.category,
        userName: 'You',
      })));
    }
  };

  const handleAddPin = async (lat: number, lng: number) => {
    if (!user || !selectedMap) return;
    const pinTitle = `Pin at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const { data } = await supabase.from('collab_map_pins').insert({
      map_id: selectedMap.id,
      user_id: user.id,
      lat,
      lng,
      title: pinTitle,
      category: 'general',
    }).select().maybeSingle();

    if (data) {
      setPins((prev) => [...prev, {
        id: data.id,
        lat: Number(data.lat),
        lng: Number(data.lng),
        title: data.title,
        category: data.category,
        userName: 'You',
      }]);
      setActivity((prev) => [{
        id: crypto.randomUUID(),
        type: 'pin_added',
        userName: 'You',
        description: `added a pin: "${pinTitle}"`,
        timestamp: 'Just now',
      }, ...prev]);
    }
  };

  if (viewMode === 'editor' && selectedMap) {
    return (
      <div className="h-screen flex flex-col bg-gray-950 text-white">
        {/* Editor top bar */}
        <div className="h-12 bg-gray-900/95 border-b border-gray-800 flex items-center px-4 shrink-0">
          <button onClick={() => setViewMode('list')} className="text-gray-500 hover:text-white mr-3">
            <ArrowLeft size={14} />
          </button>
          <div className="flex-1">
            <h2 className="text-xs font-bold text-white">{selectedMap.title}</h2>
            <p className="text-[9px] text-gray-500">{selectedMap.description || 'No description'}</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedMap.isPublic ? (
              <span className="flex items-center gap-1 text-[9px] text-emerald-400"><Globe size={10} /> Public</span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] text-gray-500"><Lock size={10} /> Private</span>
            )}
          </div>
        </div>

        {/* Editor body */}
        <div className="flex-1 flex overflow-hidden">
          <CollaborativeMapEditor
            center={[selectedMap.centerLat, selectedMap.centerLng]}
            zoom={selectedMap.zoom}
            pins={pins}
            canAddPins={true}
            onAddPin={handleAddPin}
            onPinClick={() => {}}
          />
          <div className="flex flex-col">
            <CollaborativeMapSidebar
              members={members}
              pins={pins}
              overlays={selectedMap.overlays}
              onInvite={() => {}}
            />
            <div className="p-3 border-t border-gray-800 bg-gray-900/95">
              <CollaborativeMapActivityFeed events={activity} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gray-900/95 border-b border-gray-800 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/bips/civic-intel')} className="text-gray-500 hover:text-white">
              <ArrowLeft size={16} />
            </button>
            <div className="w-8 h-8 bg-teal-600/20 rounded-lg flex items-center justify-center">
              <Map size={14} className="text-teal-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold">{t('collabMaps.title')}</h1>
              <p className="text-[10px] text-gray-500">{t('collabMaps.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-700 hover:bg-teal-600 rounded-lg text-xs font-medium text-white transition-colors"
            >
              <Plus size={12} />
              {t('collabMaps.newMap')}
            </button>
          </div>
        </div>
      </div>

      {/* Maps list */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {maps.length === 0 && !showCreateModal && (
          <div className="text-center py-20">
            <Map size={40} className="text-gray-700 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-4">{t('collabMaps.noMaps')}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 rounded-lg text-xs font-medium text-white transition-colors"
            >
              {t('collabMaps.createFirst')}
            </button>
          </div>
        )}

        <div className="grid gap-3">
          {maps.map((m) => (
            <button
              key={m.id}
              onClick={() => openMap(m)}
              className="w-full text-left bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">{m.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{m.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {m.isPublic && <Globe size={12} className="text-emerald-500" />}
                  <ExternalLink size={12} className="text-gray-600 group-hover:text-gray-400" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[9px] text-gray-600">{m.overlays.length} overlays</span>
                <span className="text-[9px] text-gray-600">Created {new Date(m.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-sm font-bold text-white mb-4">{t('collabMaps.createMap')}</h2>
            {error && <p className="text-[10px] text-red-400 mb-3 bg-red-900/20 px-3 py-1.5 rounded-lg">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-teal-600"
                  placeholder="e.g. Weekend Art Walk"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-teal-600 resize-none h-20"
                  placeholder="What is this map about?"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => { setShowCreateModal(false); setError(null); }}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-3 py-2 bg-teal-700 hover:bg-teal-600 rounded-lg text-xs font-medium text-white transition-colors"
              >
                Create Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
