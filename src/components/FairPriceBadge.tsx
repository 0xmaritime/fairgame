import React from 'react';
import { GameReview } from '../types/game-review';

interface FairPriceBadgeProps {
  tier: GameReview['fairPriceTier'];
  amount?: number;
}

const tierColors: Record<GameReview['fairPriceTier'], string> = {
  Premium: 'bg-premium text-white',
  Standard: 'bg-standard text-white',
  Budget: 'bg-budget text-black',
  'Free-to-Play': 'bg-free-to-play text-white',
  'Wait-for-Sale': 'bg-gray-500 text-white',
  'Never-Buy': 'bg-black text-white',
  'Subscription-Only': 'bg-purple-500 text-white', // Using a placeholder purple for now
};

const FairPriceBadge: React.FC<FairPriceBadgeProps> = ({ tier, amount }) => {
  const colorClass = tierColors[tier] || 'bg-gray-300 text-black'; // Fallback color

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
      {tier === 'Free-to-Play' ? 'Free-to-Play' : `$${amount || 'N/A'}`}
      {tier !== 'Free-to-Play' && amount && <span className="ml-1">{tier}</span>}
    </span>
  );
};

export default FairPriceBadge;
