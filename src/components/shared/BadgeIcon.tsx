'use client';

interface BadgeIconProps {
  badge: string;
  className?: string;
}

// Map both old emojis and new icon names to Material Symbols icon names
const badgeIconMap: Record<string, string> = {
  // New icon names
  'eco': 'eco',
  'menu_book': 'menu_book',
  'stars': 'stars',
  'workspace_premium': 'workspace_premium',
  'local_hospital': 'local_hospital',
  'shield': 'shield',
  // Old emojis (backward compat)
  '🌱': 'eco',
  '📚': 'menu_book',
  '⭐': 'stars',
  '🌟': 'workspace_premium',
  '🏥': 'local_hospital',
  '🛡️': 'shield',
  '🔰': 'eco',
};

export function BadgeIcon({ badge, className = '' }: BadgeIconProps) {
  const iconName = badgeIconMap[badge] || 'eco';
  return (
    <span className={`material-symbols-outlined filled ${className}`}>{iconName}</span>
  );
}

export default BadgeIcon;
