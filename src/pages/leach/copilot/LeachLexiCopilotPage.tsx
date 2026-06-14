import { useState, useRef, useEffect } from 'react';
import { Sparkles, Activity, Clock, ChartBar as BarChart3, BookOpen, Radio, Send, Loader, Heart, Sun, Moon, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

type LexiTab = 'overview' | 'geometry' | 'rituals' | 'workboard' | 'protocol' | 'hud';

interface CopilotMessage {
  id: string;
  role: 'user' | 'copilot';
  text: string;
  timestamp: number;
}

interface LexiEvent {
  id: string;
  actor: string;
  action: string;
  event_timestamp: number;
  status: string;
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
};

const geometryColors: Record<string, string> = {
  clear: 'text-emerald-400',
  stacked: 'text-orange-400',
  overloaded: 'text-red-400',
  low: 'text-blue-400',
  medium: 'text-amber-400',
  high: 'text-emerald-400',
};

const geometryBgColors: Record<string, string> = {
  clear: 'border-emerald-500/40 bg-emerald-500/5',
  stacked: 'border-orange-500/40 bg-orange-500/5',
  overloaded: 'border-red-500/40 bg-red-500/5',
  low: 'border-blue-500/40 bg-blue-500/5',
  medium: 'border-amber-500/40 bg-amber-500/5',
  high: 'border-emerald-500/40 bg-emerald-500/5',
};

const statusLabels: Record<string, string> = {
  todo: 'Queued',
  in_progress: 'In Motion',
  done: 'Ready to Ship',
  blocked: 'Blocked',
  shipped: 'Shipped',
};

const statusColors: Record<string, string> = {
  todo: 'text-gray-400',
  in_progress: 'text-amber-400',
  done: 'text-emerald-400',
  blocked: 'text-red-400',
  shipped: 'text-blue-400',
};

export function LeachLexiCopilotPage() {
  const [activeTab, setActiveTab] = useState<LexiTab>('overview');
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: '0',
      role: 'copilot',
      text: "Hey Lexi. I'm here whenever you need a moment of clarity, a workboard glance, or just to talk something through. What's on your mind?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<LexiEvent[]>([]);
  const [lexiEnergy, setLexiEnergy] = useState<'low' | 'medium' | 'high'>('medium');
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
      .eq('scope', 'lexi')
      .order('event_timestamp', { ascending: false })
      .limit(20);
    if (data) setEvents(data as LexiEvent[]);
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
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/leach-lexi-copilot`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          snapshot: { ...MOCK_SNAPSHOT, emotionalGeometry: { ...MOCK_SNAPSHOT.emotionalGeometry, lexi: lexiEnergy } },
        }),
      });
      const data = await res.json();
      const copilotMsg: CopilotMessage = {
        id: crypto.randomUUID(),
        role: 'copilot',
        text: data.responseText || 'I hear you. Let me think about that.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'copilot', text: 'Connection interrupted. Take a breath - I will be back.', timestamp: Date.now() },
      ]);
    }
    setLoading(false);
    loadEvents();
  }

  const tabs: { key: LexiTab; icon: typeof Sparkles; label: string }[] = [
    { key: 'overview', icon: Eye, label: 'Overview' },
    { key: 'geometry', icon: Activity, label: 'Geometry' },
    { key: 'rituals', icon: Clock, label: 'Rituals' },
    { key: 'workboard', icon: BarChart3, label: 'Workboard' },
    { key: 'protocol', icon: BookOpen, label: 'Protocol' },
    { key: 'hud', icon: Radio, label: 'HUD' },
  ];

  const energyIcons: Record<string, typeof Sun> = { low: Moon, medium: Sun, high: Sparkles };

  return (
    <div className="h-screen flex bg-gray-950 overflow-hidden">
      {/* Left sidebar nav */}
      <div className="w-14 bg-gray-900 border-r border-gray-800/60 flex flex-col items-center py-4 gap-1.5">
        <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center mb-4">
          <Sparkles className="text-amber-400" size={16} />
        </div>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isActive ? 'bg-amber-500/15 text-amber-400' : 'text-gray-600 hover:text-gray-300 hover:bg-gray-800/60'
              }`}
              title={tab.label}
            >
              <Icon size={17} />
            </button>
          );
        })}
      </div>

      {/* Main content - left 65% */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-11 bg-gray-900/60 border-b border-gray-800/60 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-bold text-white tracking-wide">Lexi Companion</h2>
            <span className="text-[9px] text-gray-700">|</span>
            <div className="flex items-center gap-1.5">
              <Heart size={10} className="text-amber-400" />
              <span className="text-[10px] text-gray-400">Energy:</span>
              <span className={`text-[10px] font-semibold capitalize ${geometryColors[lexiEnergy]}`}>{lexiEnergy}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['low', 'medium', 'high'] as const).map((level) => {
              const Icon = energyIcons[level];
              return (
                <button
                  key={level}
                  onClick={() => setLexiEnergy(level)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all duration-200 ${
                    lexiEnergy === level ? 'bg-amber-900/30 text-amber-300 border border-amber-800/40' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  <Icon size={10} />
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content panels */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Geometry summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-2xl border p-5 transition-all duration-300 ${geometryBgColors[MOCK_SNAPSHOT.emotionalGeometry.kee]}`}>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Kee</span>
                    <div className="mt-3 mb-2">
                      <div className={`w-16 h-16 rounded-full border-2 mx-auto flex items-center justify-center ${geometryBgColors[MOCK_SNAPSHOT.emotionalGeometry.kee]}`}>
                        <Activity size={20} className={geometryColors[MOCK_SNAPSHOT.emotionalGeometry.kee]} />
                      </div>
                    </div>
                    <span className={`text-sm font-semibold capitalize ${geometryColors[MOCK_SNAPSHOT.emotionalGeometry.kee]}`}>
                      {MOCK_SNAPSHOT.emotionalGeometry.kee}
                    </span>
                  </div>
                </div>
                <div className={`rounded-2xl border p-5 transition-all duration-300 ${geometryBgColors[lexiEnergy]}`}>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Lexi</span>
                    <div className="mt-3 mb-2">
                      <div className={`w-16 h-16 rounded-full border-2 mx-auto flex items-center justify-center ${geometryBgColors[lexiEnergy]}`}>
                        <Heart size={20} className={geometryColors[lexiEnergy]} />
                      </div>
                    </div>
                    <span className={`text-sm font-semibold capitalize ${geometryColors[lexiEnergy]}`}>
                      {lexiEnergy}
                    </span>
                  </div>
                </div>
              </div>

              {/* My workboard items */}
              <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={14} className="text-amber-400" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">My Focus</span>
                </div>
                {MOCK_SNAPSHOT.workboardItems
                  .filter((i) => i.owner === 'lexi')
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-800/40 last:border-0">
                      <span className="text-xs text-gray-200">{item.title}</span>
                      <span className={`text-[10px] font-medium ${statusColors[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Upcoming rituals */}
              <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-amber-400" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Rituals</span>
                </div>
                {MOCK_SNAPSHOT.rituals.map((r) => (
                  <div key={r.type} className="flex items-center justify-between py-2 border-b border-gray-800/40 last:border-0">
                    <span className="text-xs text-gray-200">{r.label}</span>
                    <span className="text-[10px] text-gray-500">{r.time}</span>
                  </div>
                ))}
              </div>

              {/* Event stream */}
              {events.length > 0 && (
                <div className="bg-gray-900/60 border border-amber-900/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">My Activity</span>
                  </div>
                  <div className="space-y-1.5">
                    {events.slice(0, 5).map((evt) => (
                      <div key={evt.id} className="flex items-center gap-2 py-1.5">
                        <div className="w-1 h-1 rounded-full bg-amber-400/60" />
                        <span className="text-[10px] text-gray-300 flex-1 truncate">{evt.action}</span>
                        <span className="text-[9px] text-gray-600">{new Date(evt.event_timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'geometry' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Emotional Geometry</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Geometry shows how you and Kee are feeling right now. Use this to pace collaboration and signal when you need space or support.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-2xl border p-6 ${geometryBgColors[MOCK_SNAPSHOT.emotionalGeometry.kee]}`}>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-4">Kee - Architect Vector</span>
                    <div className={`w-28 h-28 rounded-full border-2 mx-auto flex items-center justify-center mb-4 ${geometryBgColors[MOCK_SNAPSHOT.emotionalGeometry.kee]}`}>
                      <span className={`text-xl font-bold capitalize ${geometryColors[MOCK_SNAPSHOT.emotionalGeometry.kee]}`}>
                        {MOCK_SNAPSHOT.emotionalGeometry.kee}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500">Read-only. Kee manages his own geometry.</p>
                  </div>
                </div>
                <div className={`rounded-2xl border p-6 ${geometryBgColors[lexiEnergy]}`}>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-4">Lexi - Spark Vector</span>
                    <div className={`w-28 h-28 rounded-full border-2 mx-auto flex items-center justify-center mb-4 ${geometryBgColors[lexiEnergy]}`}>
                      <span className={`text-xl font-bold capitalize ${geometryColors[lexiEnergy]}`}>
                        {lexiEnergy}
                      </span>
                    </div>
                    <div className="flex gap-2 justify-center">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setLexiEnergy(level)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 ${
                            lexiEnergy === level ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rituals' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Rituals</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Rituals are your anchors. Even a brief moment of presence counts.
              </p>
              {MOCK_SNAPSHOT.rituals.map((r) => (
                <div key={r.type} className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Clock size={16} className="text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{r.label}</p>
                    <p className="text-[10px] text-gray-500">{r.time}</p>
                  </div>
                  <span className="text-[9px] text-gray-600 uppercase">View only</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'workboard' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Workboard</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pick what feels aligned with your energy. The rest can wait.
              </p>
              <div className="space-y-2">
                {MOCK_SNAPSHOT.workboardItems.map((item) => (
                  <div key={item.id} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${statusColors[item.status]?.replace('text-', 'bg-')}`} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-200">{item.title}</p>
                      <p className="text-[10px] text-gray-600">Owner: {item.owner} | {statusLabels[item.status]}</p>
                    </div>
                    {item.owner === 'lexi' && (
                      <span className="text-[9px] text-amber-400 bg-amber-900/20 px-2 py-0.5 rounded">Yours</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'protocol' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Sync Protocol</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                The protocol is your shared agreement with Kee. Read-only from here.
              </p>
              <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-gray-400">Version {MOCK_SNAPSHOT.syncProtocol.version}</span>
                  <span className="text-[9px] text-gray-600 uppercase">Read only</span>
                </div>
                <div className="space-y-2">
                  {['Daily Sync Ritual', 'Workboard Protocol', 'Co-Work Sessions', 'Emotional Geometry', 'Emotional Card Protocol', 'Chat Protocol', 'Metro Map Protocol', 'Weekly Review Ritual', 'Conflict-Light Protocol', 'Purpose'].map((section, i) => (
                    <div key={section} className="flex items-center gap-2 py-2 border-b border-gray-800/40 last:border-0">
                      <span className="text-[10px] text-gray-600 w-5">{i + 1}.</span>
                      <span className="text-xs text-gray-300">{section}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hud' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">HUD Telemetry</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                View-only. Kee controls the telemetry streams.
              </p>
              <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Radio size={16} className={MOCK_SNAPSHOT.hudTelemetry.active ? 'text-emerald-400' : 'text-gray-600'} />
                  <div>
                    <p className="text-sm text-white">Telemetry Stream</p>
                    <p className="text-[10px] text-gray-500">
                      {MOCK_SNAPSHOT.hudTelemetry.active ? 'All channels active' : 'Stream paused by admin'}
                    </p>
                  </div>
                </div>
                {MOCK_SNAPSHOT.hudTelemetry.active && (
                  <div className="grid grid-cols-2 gap-3">
                    {['Emotional', 'Location', 'Workboard', 'Sync'].map((channel) => (
                      <div key={channel} className="bg-gray-950/60 rounded-xl p-3 border border-gray-800/40">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                          <span className="text-[9px] text-gray-400 uppercase">{channel}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400/80">Streaming</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right copilot sidebar - 35% */}
      <div className="w-[360px] bg-gray-900/60 border-l border-gray-800/60 flex flex-col">
        {/* Sidebar header */}
        <div className="h-11 border-b border-gray-800/60 flex items-center px-4 shrink-0">
          <Sparkles size={14} className="text-amber-400 mr-2" />
          <span className="text-xs font-bold text-white">Companion</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`${msg.role === 'user' ? 'ml-6' : 'mr-3'}`}>
              <div className={`rounded-2xl px-3.5 py-3 ${
                msg.role === 'user'
                  ? 'bg-amber-900/20 border border-amber-800/30 rounded-br-md'
                  : 'bg-gray-800/60 border border-gray-700/40 rounded-bl-md'
              }`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {msg.role === 'copilot' && <Sparkles size={9} className="text-amber-400" />}
                  <span className="text-[9px] text-gray-500">
                    {msg.role === 'user' ? 'Lexi' : 'Companion'}
                  </span>
                </div>
                <p className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2">
              <Loader size={12} className="text-amber-400 animate-spin" />
              <span className="text-[10px] text-gray-500">Reflecting...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-800/60 p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="What's on your mind..."
              className="flex-1 px-3 py-2.5 bg-gray-950/60 border border-gray-700/60 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-600/60 transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-gray-800 disabled:text-gray-600 flex items-center justify-center transition-all duration-200"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
