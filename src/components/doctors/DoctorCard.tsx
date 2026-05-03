'use client';

import Link from 'next/link';
import { Star, MapPin, BadgeCheck, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Profile, User } from '@/types';

interface DoctorCardProps {
  doctor: User & { profile?: Profile };
  index?: number;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const profile = doctor.profile;
  const displayName = profile?.realName || 'طبيب';
  const specialty = profile?.specialty || 'طب نفسي';
  const location = profile?.location;
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
      stars.push(
        <Star
          key={i}
          className={`size-3.5 ${
            i <= Math.round(ratingValue)
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className="rounded-xl shadow-sm border-gray-100 p-0 overflow-hidden">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Doctor Header */}
        <div className="flex items-start gap-4">
          <Avatar className="size-14 shrink-0 ring-2 ring-teal-100">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-teal-50 text-teal-700 font-bold text-base">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 truncate text-sm">
                {displayName}
              </h3>
              {isVerified && (
                <BadgeCheck className="size-5 text-emerald-500 shrink-0" />
              )}
            </div>
            <Badge className="bg-teal-600 text-white hover:bg-teal-600">
              {specialty}
            </Badge>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-4 flex flex-col gap-2 flex-1">
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="size-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {renderStars(rating)}
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {rating.toFixed(1)}
              </span>
            </div>
          )}

          {bio && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-relaxed">
              {bio}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <Button asChild className="w-full mt-4 gap-2 bg-teal-600 hover:bg-teal-700 text-white">
          <Link href={`/book/${doctor.id}`}>
            <Calendar className="size-4" />
            احجز موعد
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
