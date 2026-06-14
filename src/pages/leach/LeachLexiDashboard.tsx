import { useState } from 'react';
import { MessageSquare, Heart, MapPin, Settings, Sparkles, Send, Clock, Target, CircleCheck as CheckCircle2, Circle, Radio, Zap, Mail, BookOpen } from 'lucide-react';
import { LeachEmotionalCards } from '../../components/leach/LeachEmotionalCards';
import { LeachChat } from '../../components/leach/LeachChat';
import { LeachLocationMap } from '../../components/leach/LeachLocationMap';
import { SyncProtocolViewer } from '../../components/leach/SyncProtocolViewer';
import { EnvironmentalModifiers } from '../../components/leach/EnvironmentalModifiers';

const SYNC_PROTOCOL_DEFAULT = `# LEACH SYNC PROTOCOL GUIDE\n\nThis guide defines how Lexi and Kee stay emotionally, operationally, and creatively aligned while running the BIPS ecosystem.\n\n---\n\n## 1. Daily Sync Ritual (5 minutes)\n\n- Exchange one Emotional Card\n- Lexi updates "Today's Focus"\n- Kee updates "Load Level"\n- Review Workboard for movement, blocks, and next steps\n\n---\n\n## 2. Workboard Protocol\n\n- Every idea becomes a Workboard item\n- Every decision is tagged "Decision" in chat\n\n---\n\n## 3. Co-Work Sessions\n\n- Shared banner + timer\n- Emotional geometry enters Focus Mode\n\n---\n\n## 4. Emotional Geometry\n\n**Lexi:** Energy Level (Low / Mid / High)\n**Kee:** Load Level (Clear / Stacked / Overloaded)\n\n---\n\n## 5. Purpose\n\nTo maintain emotional alignment, operational clarity, and creative flow.`;

type Tab = 'chat' | 'cards' | 'map' | 'protocol' | 'settings';
type EnergyLevel = 'low' | 'medium' | 'high';

export function LeachLexiDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [todaysFocus, setTodaysFocus] = useState('');
  const [needFromKee, setNeedFromKee] = useState<string[]>(['', '', '']);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [editingFocus, setEditingFocus] = useState(false);

  const tabs: { key: Tab; icon: typeof MessageSquare; label: string }[] = [
    { key: 'chat', icon: MessageSquare, label: 'Chat' },
    { key: 'cards', icon: Heart, label: 'Cards' },
    { key: 'map', icon: MapPin, label: 'Map' },
    { key: 'protocol', icon: BookOpen, label: 'Protocol' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];

  const energyColors: Record<EnergyLevel, string> = {
    low: 'bg-blue-500',
    medium: 'bg-amber-500',
    high: 'bg-emerald-500',
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-950">
      {/* Left sidebar - Teams-style nav */}
      <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-2">
        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
          <Radio className="text-amber-400" size={18} />
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
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
              title={tab.label}
            >
              <Icon size={20} />
            </button>
          );
        })}
        <div className="mt-auto">
          <a
            href="https://mail.zoho.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-gray-500 hover:text-amber-400 hover:bg-gray-800 transition-all"
            title="Zoho Mail"
          >
            <Mail size={20} />
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Center panel */}
        <div className="flex-1 flex flex-col">
          {/* Session banner */}
          <div className="h-10 bg-amber-900/30 border-b border-amber-800/50 flex items-center justify-center gap-2 px-4">
            <Zap size={12} className="text-amber-400" />
            <span className="text-xs text-amber-300 font-medium">Co-work Session Active</span>
            <span className="text-xs text-amber-500 ml-2">1h 23m</span>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && <LeachChat userRole="member" />}
            {activeTab === 'cards' && <LeachEmotionalCards userRole="member" />}
            {activeTab === 'map' && <LeachLocationMap />}
            {activeTab === 'protocol' && (
              <SyncProtocolViewer
                content={SYNC_PROTOCOL_DEFAULT}
                updatedAt={Date.now()}
                updatedBy="system"
              />
            )}
            {activeTab === 'settings' && (
              <div className="p-6 space-y-6 overflow-y-auto h-full">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Theme</h3>
                  <div className="flex gap-2">
                    {['Warm Glow', 'Soft Rose', 'Night Amber'].map((t) => (
                      <button key={t} className="px-4 py-2 rounded-lg bg-gray-800 text-xs text-gray-300 hover:bg-amber-900/30 hover:text-amber-300 transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Preferred Check-in Windows</h3>
                  <div className="flex gap-2">
                    {['Mornings', 'Afternoons', 'Evenings'].map((w) => (
                      <button key={w} className="px-4 py-2 rounded-lg bg-gray-800 text-xs text-gray-300 hover:bg-amber-900/30 hover:text-amber-300 transition-colors">
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar - Sync panel */}
        <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col overflow-y-auto">
          {/* Status */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">My Status</span>
              <div className="flex items-center gap-1.5">
                <Circle size={8} className="text-emerald-400 fill-emerald-400" />
                <span className="text-[10px] text-emerald-400">Online</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Energy:</span>
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as EnergyLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setEnergyLevel(level)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      energyLevel === level ? energyColors[level] : 'bg-gray-800'
                    }`}
                  >
                    <Sparkles size={10} className={energyLevel === level ? 'text-white' : 'text-gray-600'} />
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-gray-500 capitalize">{energyLevel}</span>
            </div>
          </div>

          {/* Today's Focus */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Focus</span>
              <button onClick={() => setEditingFocus(!editingFocus)} className="text-amber-400 hover:text-amber-300">
                <Target size={12} />
              </button>
            </div>
            {editingFocus ? (
              <input
                type="text"
                value={todaysFocus}
                onChange={(e) => setTodaysFocus(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingFocus(false)}
                placeholder="What are you working on?"
                className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                autoFocus
              />
            ) : (
              <p className="text-sm text-gray-300">{todaysFocus || 'Not set yet'}</p>
            )}
          </div>

          {/* Need from Kee */}
          <div className="p-4 border-b border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Need from Kee</span>
            <div className="space-y-2">
              {needFromKee.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className={item ? 'text-amber-400' : 'text-gray-700'} />
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...needFromKee];
                      updated[i] = e.target.value;
                      setNeedFromKee(updated);
                    }}
                    placeholder={`Ask ${i + 1}...`}
                    className="flex-1 px-2 py-1 bg-transparent text-sm text-gray-300 placeholder-gray-700 border-b border-gray-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Last Sync */}
          <div className="p-4 border-b border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Last Sync</span>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-500" />
              <span className="text-sm text-gray-300">Today at 2:15 PM</span>
            </div>
          </div>

          {/* Kee's Status */}
          <div className="p-4 border-b border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Kee's Status</span>
            <div className="bg-gray-950 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <Circle size={8} className="text-emerald-400 fill-emerald-400" />
                <span className="text-sm text-white font-medium">Online</span>
              </div>
              <p className="text-[10px] text-gray-500">In the field | Load: Stacked</p>
            </div>
          </div>

          {/* Environmental Modifiers */}
          <div className="p-4">
            <EnvironmentalModifiers />
          </div>
        </div>
      </div>
    </div>
  );
}
