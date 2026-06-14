import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Send, MessageSquare } from 'lucide-react';
import type { Id } from '../convex/_generated/dataModel';

interface TriadChatProps {
  conversationId?: string;
}

export function TriadChat({ conversationId }: TriadChatProps) {
  const [message, setMessage] = useState('');
  const messages = useQuery(api.messages.getConversation, {
    conversationId: conversationId as Id<'conversations'>,
  });
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);

  const handleSend = async () => {
    if (!message.trim() || !conversationId) return;

    try {
      await sendMessage({
        conversationId: conversationId as Id<'conversations'>,
        content: message,
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!messages) {
    return <div className="p-4 text-gray-500">Loading chat...</div>;
  }

  const reversedMessages = [...messages].reverse();

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {reversedMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageSquare className="mx-auto mb-2 opacity-50" size={24} />
            <p>No messages yet</p>
          </div>
        ) : (
          reversedMessages.map((msg) => (
            <div key={msg._id} className="flex gap-2">
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">{msg.senderName}</p>
                  <p className="text-sm text-gray-700 mt-1">{msg.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
