import { useState } from 'react';
import { Plus, Sparkles, Heart, Zap, Cloud, Coffee, Flame, Sun, Moon, Battery, BatteryLow, BatteryFull, CreditCard as Edit3, Trash2 } from 'lucide-react';

type CardData = {
  id: string;
  label: string;
  emoji: string;
  icon: typeof Heart;
  color: string;
  assignedTo: string;
};

const PRESET_CARDS: CardData[] = [
  { id: 'c1', label: 'In Flow', emoji: '', icon: Zap, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-600/30', assignedTo: 'both' },
  { id: 'c2', label: 'Overloaded', emoji: '', icon: BatteryLow, color: 'bg-red-500/20 text-red-400 border-red-600/30', assignedTo: 'both' },
  { id: 'c3', label: 'Need Clarity', emoji: '', icon: Cloud, color: 'bg-blue-500/20 text-blue-400 border-blue-600/30', assignedTo: 'both' },
  { id: 'c4', label: 'Ready to Ship', emoji: '', icon: Flame, color: 'bg-orange-500/20 text-orange-400 border-orange-600/30', assignedTo: 'both' },
  { id: 'c5', label: 'Need Check-In', emoji: '', icon: Heart, color: 'bg-pink-500/20 text-pink-400 border-pink-600/30', assignedTo: 'both' },
  { id: 'c6', label: 'Energized', emoji: '', icon: BatteryFull, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-600/30', assignedTo: 'both' },
  { id: 'c7', label: 'Focused', emoji: '', icon: Sun, color: 'bg-amber-500/20 text-amber-400 border-amber-600/30', assignedTo: 'both' },
  { id: 'c8', label: 'Winding Down', emoji: '', icon: Moon, color: 'bg-blue-500/20 text-blue-300 border-blue-600/30', assignedTo: 'both' },
  { id: 'c9', label: 'Taking a Break', emoji: '', icon: Coffee, color: 'bg-amber-500/20 text-amber-300 border-amber-600/30', assignedTo: 'both' },
  { id: 'c10', label: 'Grateful', emoji: '', icon: Sparkles, color: 'bg-pink-500/20 text-pink-300 border-pink-600/30', assignedTo: 'both' },
];

type Props = {
  userRole: 'admin' | 'member';
};

export function LeachEmotionalCards({ userRole }: Props) {
  const [cards] = useState<CardData[]>(PRESET_CARDS);
  const [sentCard, setSentCard] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<{ card: string; time: string; from: string }[]>([
    { card: 'In Flow', time: '2:15 PM', from: 'Lexi' },
    { card: 'Ready to Ship', time: '1:45 PM', from: 'Kee' },
    { card: 'Need Check-In', time: '11:00 AM', from: 'Lexi' },
  ]);

  const handleTrigger = (card: CardData) => {
    setSentCard(card.id);
    setRecentEvents([{ card: card.label, time: 'Just now', from: userRole === 'admin' ? 'Kee' : 'Lexi' }, ...recentEvents.slice(0, 9)]);
    setTimeout(() => setSentCard(null), 1500);
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Emotional Cards</h3>
          <p className="text-xs text-gray-500 mt-0.5">Tap to signal the other person</p>
        </div>
        {userRole === 'admin' && (
          <button className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm text-white font-medium transition-colors">
            <Plus size={14} />
            New Card
          </button>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSent = sentCard === card.id;
          return (
            <button
              key={card.id}
              onClick={() => handleTrigger(card)}
              className={`relative p-4 rounded-xl border transition-all ${card.color} ${
                isSent ? 'scale-95 ring-2 ring-white/20' : 'hover:scale-105'
              }`}
            >
              {isSent && (
                <div className="absolute inset-0 rounded-xl bg-white/10 animate-ping" />
              )}
              <Icon size={24} className="mx-auto mb-2" />
              <p className="text-xs font-medium text-center leading-tight">{card.label}</p>
              {userRole === 'admin' && (
                <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 hover:opacity-100 group-hover:opacity-100">
                  <button className="w-5 h-5 rounded bg-gray-900/80 flex items-center justify-center">
                    <Edit3 size={8} className="text-gray-400" />
                  </button>
                  <button className="w-5 h-5 rounded bg-gray-900/80 flex items-center justify-center">
                    <Trash2 size={8} className="text-red-400" />
                  </button>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Recent events */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Recent Signals</h4>
        <div className="space-y-2">
          {recentEvents.map((evt, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-800">
              <Heart size={14} className="text-pink-400" />
              <div className="flex-1">
                <span className="text-sm text-white">{evt.from}</span>
                <span className="text-sm text-gray-400"> sent </span>
                <span className="text-sm text-amber-300 font-medium">{evt.card}</span>
              </div>
              <span className="text-[10px] text-gray-600">{evt.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
