import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Settings, Plus, Trash2, CreditCard as Edit2 } from 'lucide-react';

export function AdminDashboard() {
  const cards = useQuery(api.cards.getAdminCards);
  const users = useQuery(api.users.getAllUsers);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [label, setLabel] = useState('');
  const [emoji, setEmoji] = useState('');
  const createCard = useMutation(api.cards.createCard);
  const deleteCard = useMutation(api.cards.deleteCard);

  const handleCreateCard = async () => {
    if (!label.trim()) return;

    try {
      await createCard({
        label,
        emoji,
        assignedTo: [],
      });
      setLabel('');
      setEmoji('');
      setShowCreateCard(false);
    } catch (error) {
      console.error('Failed to create card:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={24} className="text-gray-900" />
        <h2 className="text-2xl font-bold text-gray-900">Admin Control Center</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Emotional Cards</h3>
            <button
              onClick={() => setShowCreateCard(!showCreateCard)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus size={16} /> Create
            </button>
          </div>

          {showCreateCard && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Card label"
                className="w-full px-2 py-1 mb-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="Emoji"
                maxLength={2}
                className="w-full px-2 py-1 mb-2 border border-gray-300 rounded text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateCard}
                  className="flex-1 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateCard(false)}
                  className="flex-1 px-2 py-1 bg-gray-200 text-gray-900 text-sm rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {cards?.map((card) => (
              <div key={card._id} className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{card.emoji || '🎯'}</span>
                  <span className="font-medium text-gray-900">{card.label}</span>
                </div>
                <button
                  onClick={() => deleteCard({ cardId: card._id })}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-2">
            {users?.map((user) => (
              <div key={user._id} className="p-3 border border-gray-200 rounded hover:bg-gray-50">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="mt-1 flex gap-1">
                  <span className={`text-xs px-2 py-1 rounded ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700">
                    {user.theme}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
