import { useState } from 'react';
import { BookOpen, CreditCard as Edit3, Radio, ArrowLeft } from 'lucide-react';
import { SyncProtocolViewer } from '../../components/leach/SyncProtocolViewer';
import { SyncProtocolEditor } from '../../components/leach/SyncProtocolEditor';

const DEFAULT_PROTOCOL = `# LEACH SYNC PROTOCOL GUIDE

This guide defines how Lexi and Kee stay emotionally, operationally, and creatively aligned while running the BIPS ecosystem.

---

## 1. Daily Sync Ritual (5 minutes)

- Exchange one Emotional Card
- Lexi updates "Today's Focus"
- Kee updates "Load Level"
- Review Workboard for movement, blocks, and next steps

---

## 2. Workboard Protocol

- Every idea becomes a Workboard item
- Every decision is tagged "Decision" in chat
- Every completed item triggers "Ready to Ship"
- Statuses: **Queued** | **In Motion** | **Blocked** | **Ready to Ship** | **Shipped**

---

## 3. Co-Work Sessions

- Shared banner + timer
- Notifications soften
- Emotional geometry enters Focus Mode
- Auto-generated session summary

---

## 4. Emotional Geometry

**Lexi:** Energy Level (Low / Mid / High)
**Kee:** Load Level (Clear / Stacked / Overloaded)

Use geometry to pace collaboration. If both are overloaded, keep interactions light.

---

## 5. Emotional Card Protocol

Cards are signals, not conversations.
Use them before words when emotions are high.

1. Feel something - send a card
2. Receive a card - acknowledge silently or respond with a card
3. Only escalate to text if clarity is needed

---

## 6. Chat Protocol

Chat is for:
- Decisions
- Clarifications
- Updates
- Voice notes
- Pinned messages
- End-of-day summaries

Tag important messages as **Decision** or **Pin to Workboard**.

---

## 7. Metro Map Protocol

Map shows Kee's location + emotional zone.
- Lexi views; Kee controls visibility
- Mood tags: Safe / Neutral / Stressful
- Key pins: Shelters, Work, Anchor Spots

---

## 8. Weekly Review Ritual

Review:
- Workboard progress
- Emotional patterns (card usage)
- Sync ritual adherence
- Shipped items
- Upcoming priorities

---

## 9. Conflict-Light Protocol

When tension arises:

1. Send a card ("Need Clarity" or "Overloaded")
2. Pause (minimum 10 minutes)
3. Switch to text only if needed
4. Move the issue to Workboard
5. Resolve during next scheduled sync
6. Never resolve conflict during a co-work session

---

## 10. Purpose

To maintain emotional alignment, operational clarity, and creative flow between Lexi and Kee.
`;

type Props = {
  isAdmin?: boolean;
};

export function LeachSyncProtocolPage({ isAdmin = false }: Props) {
  const [protocol, setProtocol] = useState({
    content: DEFAULT_PROTOCOL,
    updatedAt: Date.now(),
    updatedBy: 'system',
  });
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');

  const handleSave = (content: string) => {
    setProtocol({ content, updatedAt: Date.now(), updatedBy: 'kee@bips.dev' });
    setViewMode('view');
  };

  const handleReset = () => {
    setProtocol({ content: DEFAULT_PROTOCOL, updatedAt: Date.now(), updatedBy: 'system' });
    setViewMode('view');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-950">
      <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
          isAdmin ? 'bg-orange-500/20' : 'bg-amber-500/20'
        }`}>
          <Radio className={isAdmin ? 'text-orange-400' : 'text-amber-400'} size={18} />
        </div>
        <a
          href={isAdmin ? '#/leach/admin' : '#/leach/dashboard'}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all"
          title="Back"
        >
          <ArrowLeft size={20} />
        </a>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400">
          <BookOpen size={20} />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white">Sync Protocol</h2>
            {isAdmin && (
              <>
                <span className="text-[10px] text-gray-500">|</span>
                <span className="text-[10px] text-orange-400 font-medium">Admin Editor</span>
              </>
            )}
          </div>
          {isAdmin && viewMode === 'view' && (
            <button
              onClick={() => setViewMode('edit')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-xs font-medium text-white transition-colors"
            >
              <Edit3 size={12} />
              Edit Protocol
            </button>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {viewMode === 'edit' && isAdmin ? (
            <SyncProtocolEditor
              content={protocol.content}
              updatedAt={protocol.updatedAt}
              updatedBy={protocol.updatedBy}
              onSave={handleSave}
              onReset={handleReset}
            />
          ) : (
            <div className="h-full overflow-y-auto">
              <SyncProtocolViewer
                content={protocol.content}
                updatedAt={protocol.updatedAt}
                updatedBy={protocol.updatedBy}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
