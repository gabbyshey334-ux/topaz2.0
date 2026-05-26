import { Medal, Award, Star, User, Users } from 'lucide-react';

const MEDAL_RANK_CLASS = {
  1: 'text-yellow-500 fill-yellow-400',
  2: 'text-gray-400 fill-gray-300',
  3: 'text-orange-500 fill-orange-400',
};

export function RankIcon({ rank, size = 24, className = '' }) {
  if (!rank) return null;

  if (rank >= 1 && rank <= 3) {
    return (
      <Medal
        size={size}
        className={`${MEDAL_RANK_CLASS[rank]} ${className}`.trim()}
        aria-hidden
      />
    );
  }

  if (rank === 4) {
    return (
      <Award
        size={size}
        className={`text-teal-500 ${className}`.trim()}
        aria-hidden
      />
    );
  }

  return (
    <span className={`font-bold ${className}`.trim()} aria-hidden>
      #{rank}
    </span>
  );
}

export function MedalLevelIcon({ level, size = 18, className = '' }) {
  if (level === 'Gold') {
    return (
      <Medal
        size={size}
        className={`text-yellow-500 fill-yellow-400 ${className}`.trim()}
        aria-hidden
      />
    );
  }
  if (level === 'Silver') {
    return (
      <Medal
        size={size}
        className={`text-gray-400 fill-gray-300 ${className}`.trim()}
        aria-hidden
      />
    );
  }
  if (level === 'Bronze') {
    return (
      <Medal
        size={size}
        className={`text-orange-500 fill-orange-400 ${className}`.trim()}
        aria-hidden
      />
    );
  }

  return (
    <Star
      size={size}
      className={`text-amber-400 ${className}`.trim()}
      aria-hidden
    />
  );
}

export function DivisionTypeIcon({ divisionType, size = 16, className = '' }) {
  const type = divisionType ? String(divisionType).toLowerCase() : '';
  const isSolo = !type || type.includes('solo');

  if (isSolo) {
    return <User size={size} className={className} aria-hidden />;
  }

  return <Users size={size} className={className} aria-hidden />;
}
