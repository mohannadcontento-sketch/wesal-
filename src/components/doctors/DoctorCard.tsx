'use client';

import Link from 'next/link';
import { Star, MapPin, BadgeCheck, Calendar } from 'lucide-react';
import AnimatedCard from '@/components/animations/AnimatedCard';
import type { Profile, User } from '@/types';

interface DoctorCardProps {
  doctor: User & { profile?: Profile };
  index?: number;
}

export default function DoctorCard({ doctor, index = 0 }: DoctorCardProps) {
  const profile = doctor.profile;
  const displayName = profile?.realName || 'طبيب';
  const specialty = profile?.specialty || 'طب نفسي';
  const location = profile?.location;
  const rating = profile?.rating || 0;
  const isVerified = profile?.isVerified;
  const bio = profile?.bio;
  const avatarUrl = profile?.avatarUrl;

  // Get initials for avatar fallback
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('');

  // Render star rating
  const renderStars = (ratingValue: number) => {
    const stars: React.ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`size-3.5 ${
            i <= Math.round(ratingValue)
              ? 'fill-warm text-warm'
              : 'text-border'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <AnimatedCard delay={index * 0.08}>
      <div className="card card-interactive p-5 h-full flex flex-col">
        {/* Doctor Header */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {avatarUrl ? (
            <div className="avatar avatar-lg shrink-0 ring-2 ring-primary-light">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="avatar avatar-lg shrink-0 ring-2 ring-primary-light">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Name + Verified */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-h4 text-foreground font-heading truncate">
                {displayName}
              </h3>
              {isVerified && (
                <BadgeCheck className="size-5 text-success shrink-0" />
              )}
            </div>

            {/* Specialty Badge */}
            <span className="badge badge-primary">
              {specialty}
            </span>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-4 flex flex-col gap-2 flex-1">
          {/* Location */}
          {location && (
            <div className="flex items-center gap-1.5 text-body-sm text-text-secondary">
              <MapPin className="size-3.5 text-text-tertiary shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {renderStars(rating)}
              </div>
              <span className="text-body-sm text-text-secondary font-medium">
                {rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Bio */}
          {bio && (
            <p className="text-body-sm text-text-secondary line-clamp-2 mt-1 leading-relaxed">
              {bio}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <Link
          href={`/book/${doctor.id}`}
          className="btn btn-primary w-full mt-4 gap-2 text-sm"
        >
          <Calendar className="size-4" />
          احجز موعد
        </Link>
      </div>
    </AnimatedCard>
  );
}
