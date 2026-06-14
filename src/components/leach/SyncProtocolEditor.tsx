import { useState } from 'react';
import { Save, RotateCcw, Eye, CreditCard as Edit3, TriangleAlert as AlertTriangle } from 'lucide-react';
import { SyncProtocolViewer } from './SyncProtocolViewer';

type Props = {
  content: string;
  updatedAt: number;
  updatedBy: string;
  onSave: (content: string) => void;
  onReset: () => void;
};

export function SyncProtocolEditor({ content, updatedAt, updatedBy, onSave, onReset }: Props) {
  const [editContent, setEditContent] = useState(content);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const hasChanges = editContent !== content;

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === 'edit' ? 'bg-orange-600/20 text-orange-300' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Edit3 size={12} />
              Edit
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === 'preview' ? 'bg-orange-600/20 text-orange-300' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Eye size={12} />
              Preview
            </button>
            {hasChanges && (
              <span className="text-[10px] text-amber-400 font-medium ml-2">Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-300 hover:bg-red-900/20 transition-colors"
            >
              <RotateCcw size={12} />
              Reset
            </button>
            <button
              onClick={() => setShowSaveConfirm(true)}
              disabled={!hasChanges}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white transition-colors"
            >
              <Save size={12} />
              Save Protocol
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {mode === 'edit' ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full p-6 bg-gray-950 text-sm text-gray-300 font-mono leading-relaxed resize-none focus:outline-none placeholder-gray-700"
            placeholder="Write your sync protocol in Markdown..."
            spellCheck={false}
          />
        ) : (
          <SyncProtocolViewer content={editContent} updatedAt={updatedAt} updatedBy={updatedBy} />
        )}
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Reset Protocol?</h3>
                <p className="text-xs text-gray-500">This will restore the default protocol content.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onReset(); setShowResetConfirm(false); }}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Save size={18} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Save Protocol?</h3>
                <p className="text-xs text-gray-500">Both users will see the updated protocol immediately.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onSave(editContent); setShowSaveConfirm(false); }}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
