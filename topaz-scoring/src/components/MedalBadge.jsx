import React from 'react';
import { MedalLevelIcon } from './AppIcons';

/**
 * MedalBadge Component
 * Displays medal achievement badges with appropriate styling
 *
 * @param {string} medalLevel - "None", "Bronze", "Silver", or "Gold"
 * @param {number} points - Current total points
 * @param {string} size - "sm", "md", or "lg" (default: "md")
 * @param {boolean} showProgress - Whether to show progress text (default: false)
 */
function MedalBadge({ medalLevel, points = 0, size = 'md', showProgress = false }) {
  if (!medalLevel || medalLevel === 'None') {
    if (!showProgress) return null;

    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold border-2 border-gray-300">
        Working toward Bronze ({points}/25)
      </span>
    );
  }

  const medalConfig = {
    Bronze: {
      color: 'bg-amber-100 text-amber-800 border-amber-400'
    },
    Silver: {
      color: 'bg-slate-200 text-slate-800 border-slate-400'
    },
    Gold: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-400'
    }
  };

  const sizeMap = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const iconSizeMap = {
    sm: 14,
    md: 16,
    lg: 18
  };

  const config = medalConfig[medalLevel];
  if (!config) return null;

  const sizeClass = sizeMap[size] || sizeMap.md;
  const iconSize = iconSizeMap[size] || iconSizeMap.md;

  const getProgressText = () => {
    if (medalLevel === 'Gold') {
      return 'Gold Medal Achieved!';
    }
    if (medalLevel === 'Silver') {
      return `Silver Medal - Working toward Gold (${points}/50)`;
    }
    if (medalLevel === 'Bronze') {
      return `Bronze Medal - Working toward Silver (${points}/35)`;
    }
    return `${medalLevel} Medal`;
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border-2 ${config.color} ${sizeClass}`}
      title={`${medalLevel} Medal - ${points} points`}
    >
      <MedalLevelIcon level={medalLevel} size={iconSize} />
      {showProgress ? getProgressText() : medalLevel}
    </span>
  );
}

/**
 * Helper function to determine medal level based on points
 */
export const getMedalLevel = (points) => {
  if (points >= 50) return 'Gold';
  if (points >= 35) return 'Silver';
  if (points >= 25) return 'Bronze';
  return 'None';
};

/**
 * Helper function to get progress text (plain text, no icons)
 */
export const getMedalProgress = (points) => {
  if (points >= 50) {
    return 'Gold Medal Achieved!';
  }
  if (points >= 35) {
    return `Silver Medal - Working toward Gold (${points}/50)`;
  }
  if (points >= 25) {
    return `Bronze Medal - Working toward Silver (${points}/35)`;
  }
  return `Working toward Bronze (${points}/25)`;
};

export default MedalBadge;
