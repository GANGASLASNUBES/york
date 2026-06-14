import { useState, useRef, useEffect } from 'react';
import { Terminal, Activity, Shield, BookOpen, Clock, Radio, Send, Loader, ChevronRight, TriangleAlert as AlertTriangle, Check, X, Eye, Zap, ChartBar as BarChart3, Settings, Cpu } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

type AdminTab = 'overview' | 'geometry' | 'rituals' | 'workboard' | 'hud' | 'protocol' | 'logs';

interface CopilotAction {
  type: string;
  params: Record<string, unknown>;
  description: string;
}

interface CopilotMessage {
  id: string;
  role: 'user' | 'copilot';
  text: string;
  actions?: CopilotAction[];
  timestamp: number;
}

interface AdminEvent {
  id: string;
  actor: string;
  action: string;
  params: Record<string, unknown>;
  event_timestamp: number;
  status: 'pending' | 'success' | 'error';
  scope: string;
}

const MOCK_SNAPSHOT = {
  emotionalGeometry: { kee: 'stacked', lexi: 'medium' },
  rituals: [
    { type: 'daily_checkin', label: 'Daily Check-in', time: '8:00 PM' },
    { type: 'weekly_review', label: 'Weekly Review', time: '10:00 AM Sun' },
    { type: 'conflict_light', label: 'Conflict Resolution', time: 'As needed' },
  ],
  workboardItems: [
    { id: '1', title: 'Glow Club landing page', status: 'done', owner: 'lexi', priority: 'high' },
    { id: '2', title: 'HUD Telemetry dashboard', status: 'in_progress', owner: 'kee', priority: 'high' },
    { id: '3', title: 'Gear Configurator builds', status: 'done', owner: 'kee', priority: 'medium' },
    { id: '4', title: 'Routines Marketplace', status: 'done', owner: 'lexi', priority: 'medium' },
    { id: '5', title: 'LEACH platform deployment', status: 'in_progress', owner: 'kee', priority: 'high' },
    { id: '6', title: 'Affiliate auto-suggestions', status: 'blocked', owner: 'lexi', priority: 'low' },
  ],
  hudTelemetry: { active: true, lastUpdate: Date.now() },
  syncProtocol: { version: '2.1', lastUpdated: Date.now() - 86400000 },
  onlineUsers: ['kee'],
};

const geometryColors: Record<string, string> = {
  clear: 'text-emerald-400',
  stacked: 'text-orange-400',
  overloaded: 'text-red-400',
  low: 'text-blue-400',
  medium: 'text-amber-400',
  high: 'text-emerald-400',
};

const statusColors: Record<string, string> = {
  todo: 'text-gray-400',
  in_progress: 'text-orange-400',
  done: 'text-emerald-400',
  blocked: 'text-red-400',
  shipped: 'text-blue-400',
};

export function LeachAdminCopilotPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: '0',
      role: 'copilot',
      text: 'LEACH Admin Copilot online. Systems nominal. Standing by for operational directives.',
      actions: [],
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState<CopilotAction[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [hudActive, setHudActive] = useState(true);
  const [geometry, setGeometry] = useState(MOCK_SNAPSHOT.emotionalGeometry);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const { data } = await supabase
      .from('admin_events')
      .select('*')
      .eq('scope', 'admin')
      .order('event_timestamp', { ascending: false })
      .limit(50);
    if (data) setEvents(data as AdminEvent[]);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: CopilotMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/leach-admin-copilot`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          snapshot: { ...MOCK_SNAPSHOT, emotionalGeometry: geometry, hudTelemetry: { active: hudActive, lastUpdate: Date.now() } },
        }),
      });
      const data = await res.json();
      const copilotMsg: CopilotMessage = {
        id: crypto.randomUUID(),
        role: 'copilot',
        text: data.responseText || 'No response.',
        actions: data.actions || [],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, copilotMsg]);
      if (data.actions && data.actions.length > 0) {
        setPendingActions(data.actions);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'copilot', text: 'Connection error. Retry.', timestamp: Date.now() },
      ]);
    }
    setLoading(false);
    loadEvents();
  }

  function confirmAction(action: CopilotAction) {
    if (action.type === 'toggleHudStream') {
      setHudActive(action.params.active as boolean);
    }
    if (action.type === 'setGeometryState') {
      setGeometry((prev) => ({ ...prev, [action.params.actor as string]: action.params.state as string }));
    }
    setPendingActions((prev) => prev.filter((a) => a !== action));
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'copilot', text: `Confirmed: ${action.description}`, timestamp: Date.now() },
    ]);
  }

  function rejectAction(action: CopilotAction) {
    setPendingActions((prev) => prev.filter((a) => a !== action));
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'copilot', text: `Rejected: ${action.description}. No changes applied.`, timestamp: Date.now() },
    ]);
  }

  const tabs: { key: AdminTab; icon: typeof Terminal; label: string }[] = [
    { key: 'overview', icon: Cpu, label: 'Overview' },
    { key: 'geometry', icon: Activity, label: 'Geometry' },
    { key: 'rituals', icon: Clock, label: 'Rituals' },
    { key: 'workboard', icon: BarChart3, label: 'Workboard' },
    { key: 'hud', icon: Radio, label: 'HUD' },
    { key: 'protocol', icon: BookOpen, label: 'Protocol' },
    { key: 'logs', icon: Shield, label: 'Audit' },
  ];

  return (
    <div className="h-screen flex bg-gray-950 overflow-hidden">
      {/* Left sidebar */}
      <div className="w-14 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-1.5">
        <div className="w-9 h-9 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
          <Terminal className="text-orange-400" size={16} />
        </div>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                isActive ? 'bg-orange-500/20 text-orange-400' : 'text-gray-600 hover:text-gray-300 hover:bg-gray-800'
              }`}
              title={tab.label}
            >
              <Icon size={17} />
            </button>
          );
        })}
        <div className="mt-auto">
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-gray-800" title="Settings">
            <Settings size={17} />
          </button>
        </div>
      </div>

      {/* Main content area - left 65% */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-11 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-bold text-white tracking-wide uppercase">Kee Admin Copilot</h2>
            <span className="text-[9px] text-gray-600">|</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${hudActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
              <span className="text-[10px] text-gray-400">HUD {hudActive ? 'ACTIVE' : 'PAUSED'}</span>
            </div>
            <span className="text-[9px] text-gray-600">|</span>
            <span className="text-[10px] text-gray-400">Geometry:</span>
            <span className={`text-[10px] font-semibold capitalize ${geometryColors[geometry.kee]}`}>{geometry.kee}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-900/30 rounded border border-orange-800/40">
              <Zap size={10} className="text-orange-400" />
              <span className="text-[9px] text-orange-300 font-medium">ADMIN</span>
            </div>
          </div>
        </div>

        {/* System panels */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity size={14} className="text-orange-400" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Geometry</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Kee</span>
                      <span className={`text-xs font-semibold capitalize ${geometryColors[geometry.kee]}`}>{geometry.kee}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Lexi</span>
                      <span className={`text-xs font-semibold capitalize ${geometryColors[geometry.lexi]}`}>{geometry.lexi}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Radio size={14} className={hudActive ? 'text-emerald-400' : 'text-gray-600'} />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">HUD Telemetry</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Status</span>
                      <span className={`text-xs font-semibold ${hudActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {hudActive ? 'Streaming' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300">Last Update</span>
                      <span className="text-xs text-gray-500">Just now</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye size={14} className="text-blue-400" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Online</span>
                  </div>
                  <div className="space-y-2">
                    {MOCK_SNAPSHOT.onlineUsers.map((u) => (
                      <div key={u} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-xs text-gray-300 capitalize">{u}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workboard summary */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={14} className="text-orange-400" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Workboard</span>
                </div>
                <div className="space-y-1.5">
                  {MOCK_SNAPSHOT.workboardItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusColors[item.status]?.replace('text-', 'bg-')}`} />
                        <span className="text-xs text-gray-200">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 capitalize">{item.owner}</span>
                        <span className={`text-[10px] font-medium capitalize ${statusColors[item.status]}`}>{item.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rituals */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-orange-400" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Rituals</span>
                </div>
                <div className="space-y-2">
                  {MOCK_SNAPSHOT.rituals.map((r) => (
                    <div key={r.type} className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">{r.label}</span>
                      <span className="text-[10px] text-gray-500">{r.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'geometry' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Emotional Geometry Control</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="text-center mb-4">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Kee - Architect Vector</span>
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center ${
                      geometry.kee === 'clear' ? 'border-emerald-500 bg-emerald-500/10' :
                      geometry.kee === 'stacked' ? 'border-orange-500 bg-orange-500/10' :
                      'border-red-500 bg-red-500/10'
                    }`}>
                      <span className={`text-lg font-bold capitalize ${geometryColors[geometry.kee]}`}>{geometry.kee}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    {(['clear', 'stacked', 'overloaded'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setGeometry((g) => ({ ...g, kee: level }))}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                          geometry.kee === level ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="text-center mb-4">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Lexi - Spark Vector</span>
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center ${
                      geometry.lexi === 'low' ? 'border-blue-500 bg-blue-500/10' :
                      geometry.lexi === 'medium' ? 'border-amber-500 bg-amber-500/10' :
                      'border-emerald-500 bg-emerald-500/10'
                    }`}>
                      <span className={`text-lg font-bold capitalize ${geometryColors[geometry.lexi]}`}>{geometry.lexi}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-500">Lexi controls her own geometry</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rituals' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Ritual Management</h3>
              {MOCK_SNAPSHOT.rituals.map((r) => (
                <div key={r.type} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-orange-400" />
                    <div>
                      <p className="text-sm text-white font-medium">{r.label}</p>
                      <p className="text-[10px] text-gray-500">{r.time}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-gray-800 text-gray-300 text-[10px] rounded-lg hover:bg-gray-700 transition-colors">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'workboard' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Workboard Control</h3>
              {MOCK_SNAPSHOT.workboardItems.map((item) => (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${statusColors[item.status]?.replace('text-', 'bg-')}`} />
                    <div>
                      <p className="text-sm text-white">{item.title}</p>
                      <p className="text-[10px] text-gray-500">Owner: {item.owner} | Priority: {item.priority}</p>
                    </div>
                  </div>
                  <select
                    className="bg-gray-800 border border-gray-700 rounded-lg text-[10px] text-gray-300 px-2 py-1"
                    defaultValue={item.status}
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                    <option value="shipped">Shipped</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'hud' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">HUD Telemetry Control</h3>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Radio size={18} className={hudActive ? 'text-emerald-400' : 'text-gray-600'} />
                    <div>
                      <p className="text-sm text-white">Telemetry Stream</p>
                      <p className="text-[10px] text-gray-500">{hudActive ? 'All channels active' : 'Stream paused'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setHudActive(!hudActive)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      hudActive ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' : 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60'
                    }`}
                  >
                    {hudActive ? 'Pause Stream' : 'Resume Stream'}
                  </button>
                </div>
                {hudActive && (
                  <div className="grid grid-cols-4 gap-3">
                    {['Emotional', 'Location', 'Workboard', 'Sync'].map((channel) => (
                      <div key={channel} className="bg-gray-950 rounded-lg p-3 border border-gray-800">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[9px] text-gray-400 uppercase">{channel}</span>
                        </div>
                        <span className="text-xs text-emerald-400 font-medium">Active</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'protocol' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Sync Protocol</h3>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-gray-400">Version {MOCK_SNAPSHOT.syncProtocol.version}</span>
                  <span className="text-[10px] text-gray-500">Last updated 1 day ago</span>
                </div>
                <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                  {['Daily Sync Ritual', 'Workboard Protocol', 'Co-Work Sessions', 'Emotional Geometry', 'Emotional Card Protocol', 'Chat Protocol', 'Metro Map Protocol', 'Weekly Review Ritual', 'Conflict-Light Protocol', 'Purpose'].map((section, i) => (
                    <div key={section} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-600 w-5">{i + 1}.</span>
                        <span className="text-gray-200">{section}</span>
                      </div>
                      <button className="text-[10px] text-orange-400 hover:text-orange-300">Edit</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Audit Log</h3>
              {events.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                  <Shield size={24} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No events recorded yet</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {events.map((evt) => (
                    <div key={evt.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        evt.status === 'success' ? 'bg-emerald-400' : evt.status === 'error' ? 'bg-red-400' : 'bg-amber-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-200 truncate">{evt.action}</p>
                        <p className="text-[10px] text-gray-600">{evt.actor} | {new Date(evt.event_timestamp).toLocaleTimeString()}</p>
                      </div>
                      <span className={`text-[9px] font-medium uppercase ${
                        evt.status === 'success' ? 'text-emerald-400' : evt.status === 'error' ? 'text-red-400' : 'text-amber-400'
                      }`}>{evt.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right copilot sidebar - 35% */}
      <div className="w-[380px] bg-gray-900 border-l border-gray-800 flex flex-col">
        {/* Sidebar header */}
        <div className="h-11 border-b border-gray-800 flex items-center px-4 shrink-0">
          <Terminal size={14} className="text-orange-400 mr-2" />
          <span className="text-xs font-bold text-white">Copilot Interpreter</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`${msg.role === 'user' ? 'ml-8' : 'mr-4'}`}>
              <div className={`rounded-xl px-3 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-orange-900/30 border border-orange-800/40'
                  : 'bg-gray-800 border border-gray-700'
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {msg.role === 'copilot' && <Terminal size={10} className="text-orange-400" />}
                  <span className="text-[9px] text-gray-500 uppercase">
                    {msg.role === 'user' ? 'Kee' : 'Copilot'}
                  </span>
                </div>
                <p className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-2 space-y-1.5 ml-2">
                  {msg.actions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-950 rounded-lg border border-orange-900/30">
                      <ChevronRight size={10} className="text-orange-400" />
                      <span className="text-[10px] text-gray-300 flex-1">{action.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2">
              <Loader size={12} className="text-orange-400 animate-spin" />
              <span className="text-[10px] text-gray-500">Processing...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Pending actions */}
        {pendingActions.length > 0 && (
          <div className="border-t border-gray-800 p-3 bg-gray-950">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={11} className="text-amber-400" />
              <span className="text-[10px] text-amber-400 font-medium uppercase">Pending Confirmation</span>
            </div>
            <div className="space-y-1.5">
              {pendingActions.map((action, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-900 rounded-lg border border-amber-900/30">
                  <span className="text-[10px] text-gray-300 flex-1">{action.description}</span>
                  <button
                    onClick={() => confirmAction(action)}
                    className="w-6 h-6 rounded bg-emerald-900/40 flex items-center justify-center hover:bg-emerald-900/60 transition-colors"
                  >
                    <Check size={11} className="text-emerald-400" />
                  </button>
                  <button
                    onClick={() => rejectAction(action)}
                    className="w-6 h-6 rounded bg-red-900/40 flex items-center justify-center hover:bg-red-900/60 transition-colors"
                  >
                    <X size={11} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-800 p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Enter operational directive..."
              className="flex-1 px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-600 transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-gray-800 disabled:text-gray-600 flex items-center justify-center transition-colors"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
