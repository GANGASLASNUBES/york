import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Heart, Zap, Anchor } from 'lucide-react';

export function EmotionalCardPanel() {
  const cards = useQuery(api.cards.getCardsForUser);
  const triggerEvent = useMutation(api.cards.triggerCardEvent);

  const handleCardTap = async (cardId: string) => {
    try {
      await triggerEvent({ cardId });
    } catch (error) {
      console.error('Failed to trigger card event:', error);
    }
  };

  if (!cards) {
    return <div className="p-4 text-gray-500">Loading cards...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {cards.map((card) => (
        <button
          key={card._id}
          onClick={() => handleCardTap(card._id)}
          className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-gray-200 hover:border-gray-400 transition-all hover:shadow-md"
        >
          <div className="text-4xl mb-2">{card.emoji || '🎯'}</div>
          <h3 className="font-semibold text-gray-800">{card.label}</h3>
          <p className="text-sm text-gray-500 mt-1">Tap to signal</p>
        </button>
      ))}
    </div>
  );
}
