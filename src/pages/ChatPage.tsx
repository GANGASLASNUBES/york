import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { AppLayout } from '../components/AppLayout';
import { TriadChat } from '../components/TriadChat';
import { MessageCircle, Plus } from 'lucide-react';
import type { Id } from '../convex/_generated/dataModel';

export function ChatPage() {
  const conversations = useQuery(api.messages.getConversations);
  const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConvId) {
      setSelectedConvId(conversations[0]._id as string);
    }
  }, [conversations, selectedConvId]);

  const handleCreateTriadChat = async () => {
    try {
      const conv = await getOrCreateConversation({
        participants: ['kee', 'lexi', 'venessa'],
        type: 'triad',
      });
      setSelectedConvId(conv._id as string);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <AppLayout>
      <div className="h-full flex gap-4 p-6 max-w-7xl mx-auto">
        <div className="w-64 bg-white rounded-lg border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Conversations</h2>
            <button
              onClick={handleCreateTriadChat}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Create Triad Chat"
            >
              <Plus size={18} className="text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {!conversations || conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConvId(conv._id as string)}
                  className={`w-full text-left p-2 rounded transition-colors ${
                    selectedConvId === conv._id
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <p className="text-sm font-medium">{conv.type === 'triad' ? 'Triad Chat' : 'Direct Message'}</p>
                  <p className="text-xs opacity-75">
                    {new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1">
          {selectedConvId ? (
            <TriadChat conversationId={selectedConvId} />
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-lg border border-gray-200">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Select a conversation to start</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
