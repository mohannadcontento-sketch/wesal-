'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/avatars/UserAvatar';

interface Supporter {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  specialty: string;
  experience: string | null;
  certificates: string[];
  rating: number;
  totalSessions: number;
  isOnline: boolean;
}

interface SupporterCardProps {
  supporter: Supporter;
}

export default function SupporterCard({ supporter }: SupporterCardProps) {
  const router = useRouter();

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
          <span key={i} className="material-symbols-outlined text-amber-500/30 text-sm">star</span>
        );
      }
    }
    return stars;
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,67,70,0.05)] hover:shadow-[0_16px_48px_0_rgba(0,67,70,0.1)] transition-all duration-300 flex flex-col group relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary-fixed/20 rounded-full blur-3xl group-hover:bg-primary-fixed/40 transition-colors pointer-events-none" />

      {/* Header */}
      <div className="flex items-start gap-4 mb-5 z-10">
        <div className="relative shrink-0">
          <div className="relative">
            <UserAvatar
              avatarUrl={supporter.avatarUrl}
              username={supporter.name}
              size="xl"
              className="!w-[72px] !h-[72px] sm:!w-20 sm:!h-20"
            />
            {supporter.isOnline && (
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-[2.5px] border-white rounded-full" />
            )}
          </div>
          {/* Supporter badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-wesal-sky text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
            داعم معتمد
          </div>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-[18px] sm:text-[20px] font-bold text-on-surface mb-1 truncate">{supporter.name}</h3>
          <p className="text-xs sm:text-sm text-primary-container font-medium mb-2">{supporter.specialty}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {supporter.rating > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex">{renderStars(supporter.rating)}</div>
                <span className="text-[11px] text-on-surface-variant font-medium">{supporter.rating.toFixed(1)}</span>
              </div>
            )}
            {supporter.totalSessions > 0 && (
              <span className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>people</span>
                {supporter.totalSessions} جلسة
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {supporter.bio && (
        <p className="text-sm text-on-surface/80 leading-relaxed mb-4 z-10 line-clamp-3">{supporter.bio}</p>
      )}

      {/* Certificates */}
      {supporter.certificates && supporter.certificates.length > 0 && (
        <div className="flex gap-1.5 mb-5 z-10 flex-wrap">
          {supporter.certificates.slice(0, 3).map((cert, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container/60 text-primary-container text-[11px] font-medium">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>verified</span>
              {cert.length > 20 ? cert.substring(0, 20) + '...' : cert}
            </span>
          ))}
          {supporter.certificates.length > 3 && (
            <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-[11px] font-medium">
              +{supporter.certificates.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto flex gap-2 z-10">
        <Link
          href={`/supporters/${supporter.id}`}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-l from-primary to-primary-container text-on-primary font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition-all text-center flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          احجز جلسة
        </Link>
        <Link
          href={`/supporters/${supporter.id}`}
          className="py-2.5 px-4 rounded-xl bg-wesal-ice text-wesal-dark font-bold text-sm border border-wesal-sky/30 hover:bg-wesal-sky/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          البروفايل
        </Link>
      </div>
    </div>
  );
}
