import { useState } from 'react';
import { Radio, Plus, Trash2, CreditCard as Edit3, Clock, Users, ChartBar as BarChart3, Settings, Play, Square, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Loader, Wrench, Heart, BookOpen, Activity } from 'lucide-react';
import { LeachEmotionalCards } from '../../components/leach/LeachEmotionalCards';
import { LeachChat } from '../../components/leach/LeachChat';
import { LeachLocationMap } from '../../components/leach/LeachLocationMap';
import { SyncProtocolEditor } from '../../components/leach/SyncProtocolEditor';
import { CivicAdminPanel } from '../../components/civic/CivicAdminPanel';
import { EnvironmentalModifiers } from '../../components/leach/EnvironmentalModifiers';

const ADMIN_PROTOCOL_DEFAULT = `# LEACH SYNC PROTOCOL GUIDE\n\nThis guide defines how Lexi and Kee stay emotionally, operationally, and creatively aligned while running the BIPS ecosystem.\n\n---\n\n## 1. Daily Sync Ritual (5 minutes)\n\n- Exchange one Emotional Card\n- Lexi updates "Today's Focus"\n- Kee updates "Load Level"\n- Review Workboard for movement, blocks, and next steps\n\n---\n\n## 2. Workboard Protocol\n\n- Every idea becomes a Workboard item\n- Every decision is tagged "Decision" in chat\n- Every completed item triggers "Ready to Ship"\n- Statuses: **Queued** | **In Motion** | **Blocked** | **Ready to Ship** | **Shipped**\n\n---\n\n## 3. Co-Work Sessions\n\n- Shared banner + timer\n- Notifications soften\n- Emotional geometry enters Focus Mode\n- Auto-generated session summary\n\n---\n\n## 4. Emotional Geometry\n\n**Lexi:** Energy Level (Low / Mid / High)\n**Kee:** Load Level (Clear / Stacked / Overloaded)\n\nUse geometry to pace collaboration.\n\n---\n\n## 5. Emotional Card Protocol\n\nCards are signals, not conversations.\nUse them before words when emotions are high.\n\n---\n\n## 6. Chat Protocol\n\nChat is for decisions, clarifications, updates, voice notes, pinned messages, and summaries.\n\n---\n\n## 7. Metro Map Protocol\n\nMap shows Kee's location + emotional zone.\n- Lexi views; Kee controls visibility\n\n---\n\n## 8. Weekly Review Ritual\n\nReview Workboard, emotional patterns, sync rituals, and shipped items.\n\n---\n\n## 9. Conflict-Light Protocol\n\n1. Send a card\n2. Pause\n3. Switch to text\n4. Tag "Need Clarity" or "Overloaded"\n5. Move issue to Workboard\n6. Resolve during next sync\n\n---\n\n## 10. Purpose\n\nTo maintain emotional alignment, operational clarity, and creative flow.`;

type AdminTab = 'workboard' | 'cards' | 'sessions' | 'chat' | 'map' | 'protocol' | 'civic' | 'settings';
type WorkItemStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
type LoadLevel = 'clear' | 'stacked' | 'overloaded';

type WorkItem = {
  id: string;
  title: string;
  owner: string;
  status: WorkItemStatus;
  priority: 'low' | 'medium' | 'high';
  lastUpdate: string;
};

const MOCK_WORKITEMS: WorkItem[] = [
  { id: '1', title: 'Glow Club landing page', owner: 'lexi', status: 'done', priority: 'high', lastUpdate: 'Today' },
  { id: '2', title: 'HUD Telemetry dashboard', owner: 'kee', status: 'in_progress', priority: 'high', lastUpdate: 'Today' },
  { id: '3', title: 'Gear Configurator builds', owner: 'kee', status: 'done', priority: 'medium', lastUpdate: 'Yesterday' },
  { id: '4', title: 'Routines Marketplace', owner: 'lexi', status: 'done', priority: 'medium', lastUpdate: 'Today' },
  { id: '5', title: 'LEACH platform deployment', owner: 'kee', status: 'in_progress', priority: 'high', lastUpdate: 'Today' },
  { id: '6', title: 'Affiliate auto-suggestions', owner: 'lexi', status: 'todo', priority: 'low', lastUpdate: '3 days ago' },
];

const statusIcons: Record<WorkItemStatus, typeof CheckCircle2> = {
  todo: AlertCircle,
  in_progress: Loader,
  done: CheckCircle2,
  blocked: Square,
};

const statusColors: Record<WorkItemStatus, string> = {
  todo: 'text-gray-400',
  in_progress: 'text-orange-400',
  done: 'text-emerald-400',
  blocked: 'text-red-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-700 text-gray-300',
  medium: 'bg-amber-900/50 text-amber-300',
  high: 'bg-red-900/50 text-red-300',
};

export function LeachKeeAdmin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('workboard');
  const [loadLevel, setLoadLevel] = useState<LoadLevel>('stacked');
  const [sessionActive, setSessionActive] = useState(true);
  const [workItems] = useState<WorkItem[]>(MOCK_WORKITEMS);

  const tabs: { key: AdminTab; icon: typeof Radio; label: string }[] = [
    { key: 'workboard', icon: BarChart3, label: 'Workboard' },
    { key: 'cards', icon: Heart, label: 'Cards' },
    { key: 'sessions', icon: Clock, label: 'Sessions' },
    { key: 'chat', icon: Users, label: 'Chat' },
    { key: 'map', icon: Radio, label: 'Map' },
    { key: 'protocol', icon: BookOpen, label: 'Protocol' },
    { key: 'civic', icon: Activity, label: 'Civic' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];

  const loadColors: Record<LoadLevel, string> = {
    clear: 'text-emerald-400',
    stacked: 'text-orange-400',
    overloaded: 'text-red-400',
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-950">
      {/* Left nav */}
      <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-2">
        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
          <Wrench className="text-orange-400" size={18} />
        </div>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
              title={tab.label}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-12 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white">Kee Admin</h2>
            <span className="text-[10px] text-gray-500">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Load:</span>
              <span className={`text-xs font-semibold capitalize ${loadColors[loadLevel]}`}>{loadLevel}</span>
            </div>
            <span className="text-[10px] text-gray-500">|</span>
            <EnvironmentalModifiers compact />
          </div>
          <div className="flex items-center gap-3">
            {sessionActive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-900/30 rounded-full border border-orange-800/50">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-[10px] text-orange-300 font-medium">Co-work Session</span>
              </div>
            )}
            <div className="flex gap-1">
              {(['clear', 'stacked', 'overloaded'] as LoadLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setLoadLevel(level)}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                    loadLevel === level ? 'bg-gray-700 text-white' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'workboard' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Shared Workboard</h3>
                <button className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm text-white font-medium transition-colors">
                  <Plus size={14} />
                  Add Task
                </button>
              </div>

              <div className="space-y-2">
                {workItems.map((item) => {
                  const StatusIcon = statusIcons[item.status];
                  return (
                    <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
                      <StatusIcon size={18} className={statusColors[item.status]} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{item.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${priorityColors[item.priority]}`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-500">Owner: <span className="text-gray-300 capitalize">{item.owner}</span></span>
                          <span className="text-[10px] text-gray-500">Updated: {item.lastUpdate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                          <Edit3 size={13} />
                        </button>
                        <button className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'cards' && <LeachEmotionalCards userRole="admin" />}

          {activeTab === 'sessions' && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-6">Session & Sync Management</h3>

              {/* Session mode */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-white">Co-work Session</h4>
                  <button
                    onClick={() => setSessionActive(!sessionActive)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      sessionActive
                        ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                        : 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50'
                    }`}
                  >
                    {sessionActive ? <Square size={12} /> : <Play size={12} />}
                    {sessionActive ? 'End Session' : 'Start Session'}
                  </button>
                </div>
                {sessionActive && (
                  <div className="bg-gray-950 rounded-lg p-3 border border-orange-900/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      <span className="text-sm text-orange-300">Active since 12:52 PM (1h 23m)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sync reminders */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-white">Sync Reminders</h4>
                  <button className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300">
                    <Plus size={12} />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Check in with Lexi', time: '8:00 PM', days: 'Daily', enabled: true },
                    { label: 'Weekly ecosystem review', time: '10:00 AM', days: 'Sundays', enabled: true },
                    { label: 'End of day sync', time: '11:00 PM', days: 'Weekdays', enabled: false },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between p-3 bg-gray-950 rounded-lg border border-gray-800">
                      <div>
                        <p className="text-sm text-white">{r.label}</p>
                        <p className="text-[10px] text-gray-500">{r.time} | {r.days}</p>
                      </div>
                      <div className={`w-8 h-4 rounded-full flex items-center transition-colors ${r.enabled ? 'bg-emerald-600 justify-end' : 'bg-gray-700 justify-start'}`}>
                        <div className="w-3 h-3 rounded-full bg-white mx-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync rituals */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-white mb-4">Configured Rituals</h4>
                <div className="space-y-2">
                  {[
                    { type: 'daily_checkin', label: 'Daily Check-in', time: '8:00 PM' },
                    { type: 'weekly_review', label: 'Weekly Review', time: '10:00 AM Sun' },
                  ].map((ritual) => (
                    <div key={ritual.type} className="flex items-center gap-3 p-3 bg-gray-950 rounded-lg border border-gray-800">
                      <Clock size={14} className="text-orange-400" />
                      <div className="flex-1">
                        <p className="text-sm text-white">{ritual.label}</p>
                        <p className="text-[10px] text-gray-500">{ritual.time}</p>
                      </div>
                      <Edit3 size={12} className="text-gray-500 hover:text-white cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && <LeachChat userRole="admin" />}
          {activeTab === 'map' && <LeachLocationMap isAdmin />}

          {activeTab === 'protocol' && (
            <SyncProtocolEditor
              content={ADMIN_PROTOCOL_DEFAULT}
              updatedAt={Date.now()}
              updatedBy="kee@bips.dev"
              onSave={() => {}}
              onReset={() => {}}
            />
          )}

          {activeTab === 'civic' && <CivicAdminPanel />}

          {activeTab === 'settings' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-white">Admin Settings</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Feature Toggles</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Map Visibility (Lexi)', enabled: true },
                      { label: 'Voice Notes', enabled: true },
                      { label: 'Emotional Cards', enabled: true },
                      { label: 'Session Mode', enabled: true },
                    ].map((f) => (
                      <div key={f.label} className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{f.label}</span>
                        <div className={`w-8 h-4 rounded-full flex items-center transition-colors ${f.enabled ? 'bg-emerald-600 justify-end' : 'bg-gray-700 justify-start'}`}>
                          <div className="w-3 h-3 rounded-full bg-white mx-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Display</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Kee Display Name</label>
                      <input className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-sm text-white" defaultValue="Kee" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Lexi Display Name</label>
                      <input className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-sm text-white" defaultValue="Lexi" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Theme</label>
                      <select className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-sm text-white">
                        <option>Architect Dark</option>
                        <option>Construction Orange</option>
                        <option>Minimal</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
