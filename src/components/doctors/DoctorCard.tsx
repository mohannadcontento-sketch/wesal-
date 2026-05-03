'use client';

import Link from 'next/link';
import type { Profile, User } from '@/types';

interface DoctorCardProps {
  doctor: User & { profile?: Profile };
  index?: number;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const profile = doctor.profile;
  const displayName = profile?.realName || 'طبيب';
  const specialty = profile?.specialty || 'طب نفسي';
  const rating = profile?.rating || 0;
  const isVerified = profile?.isVerified;
  const bio = profile?.bio;
  const avatarUrl = profile?.avatarUrl;
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('');

  const renderStars = (ratingValue: number) => {
    const stars: React.ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(ratingValue)) {
        stars.push(
          <span key={i} className="material-symbols-outlined filled text-amber-500 text-sm">star</span>
        );
      } else if (i - 0.5 <= ratingValue) {
        stars.push(
          <span key={i} className="material-symbols-outlined filled text-amber-500 text-sm">star_half</span>
        );
      } else {
        stars.push(
          <span key={i} className="material-symbols-outlined text-amber-500 text-sm">star</span>
        );
      }
    }
    return stars;
  };

  // Build tags from specialty and bio keywords
  const tags = bio
    ? [specialty, ...bio.split(/[,،.؛]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 20).slice(0, 2)]
    : [specialty];

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,67,70,0.05)] hover:shadow-[0_16px_48px_0_rgba(0,67,70,0.1)] transition-all duration-300 flex flex-col group relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-tertiary-fixed/30 rounded-full blur-3xl group-hover:bg-tertiary-fixed/50 transition-colors pointer-events-none" />

      {/* Doctor Header */}
      <div className="flex items-start gap-4 mb-6 z-10">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              alt={displayName}
              src={avatarUrl}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-fixed to-primary-container flex items-center justify-center border-4 border-white shadow-sm">
              <span className="text-xl font-bold text-on-primary-fixed">{initials}</span>
            </div>
          )}
          {isVerified && (
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[20px] font-semibold text-on-surface mb-1">{displayName}</h3>
          <p className="text-sm text-primary-container font-medium mb-2">{specialty}</p>
          {rating > 0 && (
            <div className="flex items-center gap-1">
              {renderStars(rating)}
              <span className="text-xs text-on-surface-variant mr-2">({Math.round(rating * 20)} تقييم)</span>
            </div>
          )}
        </div>
      </div>

      {/* Specialty Tags */}
      <div className="flex gap-2 mb-6 z-10 flex-wrap">
        {tags.slice(0, 3).map((tag, i) => (
          <span key={i} className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-xs font-medium">
            {tag}
          </span>
        ))}
      </div>

      {/* Book Button */}
      <Link
        href={`/book/${doctor.id}`}
        className="mt-auto w-full py-3 rounded-xl bg-gradient-to-l from-primary to-primary-container text-on-primary font-bold text-sm shadow-md hover:shadow-lg hover:from-primary-container hover:to-primary transition-all z-10 text-center block"
      >
        حجز موعد
      </Link>
    </div>
  );
}
