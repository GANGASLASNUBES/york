import { useState, useRef, useEffect } from 'react';
import { Send, Pin, Tag, FileText, Smile, Mic, MoveVertical as MoreVertical, Check, CheckCheck, Shield } from 'lucide-react';

type Message = {
  id: string;
  sender: 'lexi' | 'kee';
  content: string;
  time: string;
  read: boolean;
  isPinned: boolean;
  isDecision: boolean;
  reactions: string[];
};

const MOCK_MESSAGES: Message[] = [
  { id: '1', sender: 'kee', content: 'Glow Club landing page is deployed. Check it out when you get a moment.', time: '1:30 PM', read: true, isPinned: false, isDecision: false, reactions: [] },
  { id: '2', sender: 'lexi', content: 'Just saw it! The pricing section looks great. Can we add a "See what\'s inside" button near the hero?', time: '1:35 PM', read: true, isPinned: false, isDecision: false, reactions: ['sparkles'] },
  { id: '3', sender: 'kee', content: 'Done. Also pushed the routines marketplace with all 10 routines loaded.', time: '1:42 PM', read: true, isPinned: true, isDecision: false, reactions: [] },
  { id: '4', sender: 'lexi', content: 'Perfect. Let\'s lock the pricing at $9.99/mo and $99/yr. That\'s final.', time: '1:45 PM', read: true, isPinned: false, isDecision: true, reactions: ['check'] },
  { id: '5', sender: 'kee', content: 'Noted. Moving to LEACH platform next. Should have chat + cards + map working by end of session.', time: '2:00 PM', read: true, isPinned: false, isDecision: false, reactions: [] },
  { id: '6', sender: 'lexi', content: 'I\'m in flow right now. Let me know when you need me to test the emotional cards.', time: '2:10 PM', read: false, isPinned: false, isDecision: false, reactions: [] },
];

type Props = {
  userRole: 'admin' | 'member';
};

export function LeachChat({ userRole }: Props) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [showActions, setShowActions] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: userRole === 'admin' ? 'kee' : 'lexi',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      read: false,
      isPinned: false,
      isDecision: false,
      reactions: [],
    };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  const senderColors = {
    lexi: 'text-amber-400',
    kee: 'text-orange-400',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="h-12 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-emerald-500" />
          <span className="text-sm font-medium text-white">Encrypted Chat</span>
          <span className="text-[10px] text-gray-500">E2EE</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-gray-500 hover:text-white transition-colors" title="Voice note">
            <Mic size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = (userRole === 'admin' && msg.sender === 'kee') || (userRole === 'member' && msg.sender === 'lexi');
          return (
            <div key={msg.id} className={`group flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
                {/* Sender label */}
                <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
                  <span className={`text-[10px] font-semibold capitalize ${senderColors[msg.sender]}`}>
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-gray-600">{msg.time}</span>
                  {msg.isPinned && <Pin size={9} className="text-amber-400" />}
                  {msg.isDecision && <Tag size={9} className="text-emerald-400" />}
                </div>

                {/* Bubble */}
                <div
                  className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn
                      ? msg.sender === 'kee'
                        ? 'bg-orange-900/30 text-gray-200 rounded-br-md'
                        : 'bg-amber-900/30 text-gray-200 rounded-br-md'
                      : 'bg-gray-900 border border-gray-800 text-gray-300 rounded-bl-md'
                  } ${msg.isDecision ? 'border-l-2 border-l-emerald-500' : ''}`}
                >
                  {msg.content}

                  {/* Reactions */}
                  {msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {msg.reactions.map((r, i) => (
                        <span key={i} className="text-[10px] bg-gray-800 rounded-full px-1.5 py-0.5">
                          {r === 'check' ? 'decision' : r}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read status */}
                  {isOwn && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {msg.read ? (
                        <CheckCheck size={12} className="text-emerald-500" />
                      ) : (
                        <Check size={12} className="text-gray-600" />
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'justify-end' : ''}`}>
                  <button
                    onClick={() => setShowActions(showActions === msg.id ? null : msg.id)}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-800 text-gray-600 hover:text-gray-300"
                  >
                    <MoreVertical size={12} />
                  </button>
                  <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-800 text-gray-600 hover:text-gray-300" title="React">
                    <Smile size={12} />
                  </button>
                  <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-800 text-gray-600 hover:text-gray-300" title="Pin to Workboard">
                    <Pin size={12} />
                  </button>
                  <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-800 text-gray-600 hover:text-gray-300" title="Mark as Decision">
                    <Tag size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* End of Day Summary template */}
      <div className="px-4 pb-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-[10px] text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
          <FileText size={10} />
          End of Day Summary
        </button>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-600 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
