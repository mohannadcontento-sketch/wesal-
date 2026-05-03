'use client';

import React from 'react';
import { renderAvatarSvg, isBuiltInAvatar } from '@/lib/avatars';
import Image from 'next/image';

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const initialSizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const borderMap = {
  sm: 'border-2',
  md: 'border-2',
  lg: 'border-2',
  xl: 'border-[3px]',
};

export function UserAvatar({
  avatarUrl,
  username,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const sizeClasses = sizeMap[size];
  const initialClasses = initialSizeMap[size];
  const borderClasses = borderMap[size];

  // Built-in SVG avatar
  if (avatarUrl && isBuiltInAvatar(avatarUrl)) {
    return (
      <div
        className={`
          ${sizeClasses} ${borderClasses} rounded-full overflow-hidden
          border-wesal-sky/40 shadow-sm
          flex items-center justify-center
          bg-wesal-ice
          ${className}
        `}
      >
        <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full">
          {renderAvatarSvg(avatarUrl)}
        </div>
      </div>
    );
  }

  // External image URL
  if (avatarUrl) {
    return (
      <div
        className={`
          ${sizeClasses} ${borderClasses} rounded-full overflow-hidden
          border-wesal-sky/40 shadow-sm
          relative
          ${className}
        `}
      >
        <Image
          src={avatarUrl}
          alt={username || 'صورة المستخدم'}
          fill
          className="object-cover"
          sizes={size === 'xl' ? '64px' : size === 'lg' ? '48px' : size === 'md' ? '40px' : '32px'}
        />
      </div>
    );
  }

  // Fallback: initial letter with gradient
  const initial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`
        ${sizeClasses} ${borderClasses} rounded-full
        border-wesal-sky/40 shadow-sm
        bg-gradient-to-br from-wesal-dark to-wesal-medium
        flex items-center justify-center
        text-white font-bold
        ${initialClasses}
        ${className}
      `}
    >
      {initial}
    </div>
  );
}
