'use client';

import React, { useState } from 'react';
import { AVATARS, CATEGORY_LABELS } from '@/lib/avatars';
import { renderAvatarSvg } from '@/lib/avatars';
import { PageTransition } from '@/components/animations/PageTransition';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

interface AvatarSetProps {
  currentAvatar?: string;
  onSelect: (avatarId: string) => void;
  className?: string;
}

const categories = ['nature', 'wellness', 'abstract', 'animals'] as const;

export function AvatarSet({ currentAvatar, onSelect, className = '' }: AvatarSetProps) {
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  return (
    <PageTransition>
      <div className={`space-y-6 ${className}`}>
        {categories.map((category) => {
          const categoryAvatars = AVATARS.filter((a) => a.category === category);
          return (
            <ScrollReveal key={category} direction="up" delay={0.05}>
              <div>
                <h4 className="text-sm font-semibold text-wesal-medium mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-wesal-sky" />
                  {CATEGORY_LABELS[category]}
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {categoryAvatars.map((avatar) => {
                    const isSelected = currentAvatar === avatar.id;
                    const isHovered = hoveredAvatar === avatar.id;

                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => onSelect(avatar.id)}
                        onMouseEnter={() => setHoveredAvatar(avatar.id)}
                        onMouseLeave={() => setHoveredAvatar(null)}
                        className={`
                          group relative flex flex-col items-center gap-1.5 p-2 rounded-xl
                          transition-all duration-200 ease-out cursor-pointer
                          ${isSelected
                            ? 'bg-wesal-ice ring-2 ring-wesal-sky shadow-md'
                            : 'hover:bg-wesal-ice/60 hover:shadow-sm'
                          }
                        `}
                        aria-label={avatar.name}
                        aria-pressed={isSelected}
                      >
                        {/* Avatar circle */}
                        <div
                          className={`
                            w-12 h-12 rounded-full overflow-hidden transition-all duration-200
                            border-2 ${isSelected ? 'border-wesal-dark' : 'border-wesal-sky/30'}
                            ${isHovered && !isSelected ? 'scale-110 border-wesal-medium' : ''}
                            ${isSelected ? 'scale-105' : ''}
                            flex items-center justify-center bg-wesal-ice
                          `}
                        >
                          <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full">
                            {renderAvatarSvg(avatar.id)}
                          </div>
                        </div>

                        {/* Selection check */}
                        {isSelected && (
                          <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-wesal-dark flex items-center justify-center">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}

                        {/* Label */}
                        <span
                          className={`
                            text-[11px] font-medium transition-colors duration-200
                            ${isSelected ? 'text-wesal-dark' : 'text-wesal-medium'}
                            ${isHovered && !isSelected ? 'text-wesal-dark' : ''}
                          `}
                        >
                          {avatar.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </PageTransition>
  );
}
