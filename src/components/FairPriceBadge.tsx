import React from 'react';
import { GameReview } from '../types/game-review';

interface FairPriceBadgeProps {
  tier: GameReview['fairPriceTier'];
  amount?: number;
  size?: 'sm' | 'md' | 'lg';
}

const tierColors: Record<GameReview['fairPriceTier'], string> = {
  Premium: 'bg-price-premium text-white',
  Standard: 'bg-price-standard text-white',
  Budget: 'bg-price-budget text-black',
  'Free-to-Play': 'bg-price-free-play text-white',
  'Wait-for-Sale': 'bg-price-wait-sale text-white',
  'Never-Buy': 'bg-price-never-buy text-white',
  'Subscription-Only': 'bg-price-subscription text-white',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

const FairPriceBadge: React.FC<FairPriceBadgeProps> = ({ tier, amount, size = 'md' }) => {
  const colorClass = tierColors[tier] || 'bg-gray-300 text-black'; // Fallback color
  const sizeClass = sizeClasses[size];

  const displayContent = () => {
    switch (tier) {
      case 'Premium':
      case 'Standard':
      case 'Budget':
        return amount ? `$${amount}` : tier; // Show amount if available, otherwise tier name
      case 'Free-to-Play':
        return 'Free-to-Play';
      case 'Wait-for-Sale':
        return 'Wait for Sale';
      case 'Never-Buy':
        return 'Never Buy';
      case 'Subscription-Only':
        return 'Subscription Only';
      default:
        return tier;
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${colorClass} ${sizeClass}`}>
      {displayContent()}
    </span>
  );
};

export default FairPriceBadge;
