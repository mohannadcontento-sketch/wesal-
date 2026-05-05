'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AvatarPicker } from '@/components/avatars/AvatarPicker';
import { renderAvatarSvg, isBuiltInAvatar } from '@/lib/avatars';
import Image from 'next/image';

interface ProfileData {
  username: string;
  realName?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  specialty?: string;
  rating?: number;
  badge: string;
  reputationScore: number;
  reputationTier: string;
  isVerified?: boolean;
  createdAt?: string;
  interests?: string[];
}

interface PostData {
  id: string;
  content: string;
  section: string;
  commentCount: number;
  reactionCount: number;
  createdAt: string;
}

const tierLabels: Record<string, string> = {
  beginner: 'مبتدئ',
  active: 'نشط',
  notable: 'بارز',
  eligible: 'مؤهل',
};

const tierNextLabels: Record<string, string> = {
  beginner: 'نشط',
  active: 'بارز',
  notable: 'مؤهل',
  eligible: 'الأعلى',
};

const tierMaxScores: Record<string, number> = {
  beginner: 50,
  active: 150,
  notable: 300,
  eligible: 500,
};

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'اليوم';
  if (days === 1) return 'أمس';
  if (days < 7) return `قبل ${days} أيام`;
  if (days < 30) return `قبل ${Math.floor(days / 7)} أسبوع`;
  if (days < 365) return `قبل ${Math.floor(days / 30)} شهر`;
  return `قبل ${Math.floor(days / 365)} سنة`;
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const { user } = useAuth();

  const isOwnProfile = user?.username === username;

  const handleAvatarConfirm = useCallback((avatarUrl: string) => {
    setProfile((prev) => prev ? { ...prev, avatarUrl } : prev);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await fetch(`/api/profiles/${username}`);
        const profileData = await profileRes.json();
        setProfile(profileData.profile || null);

        const postsRes = await fetch(`/api/posts?author=${username}&limit=3`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || []);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    fetchData();
  }, [username]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined text-4xl text-primary-container animate-spin">progress_activity</span>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="py-16 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high">
            <span className="material-symbols-outlined text-3xl text-primary-container">person</span>
          </div>
          <p className="text-sm font-bold text-on-surface">البروفايل مش موجود</p>
          <p className="text-xs text-on-surface-variant mt-1">تأكد من اسم المستخدم</p>
        </div>
      </MainLayout>
    );
  }

  const isPublic = !!profile.realName;
  const maxScore = tierMaxScores[profile.reputationTier] || 500;
  const currentTierMin = profile.reputationTier === 'eligible' ? 300 :
    profile.reputationTier === 'notable' ? 150 :
    profile.reputationTier === 'active' ? 50 : 0;
  const progressInTier = profile.reputationScore - currentTierMin;
  const tierRange = maxScore - currentTierMin;
  const progressPercent = Math.min(100, Math.max(0, (progressInTier / tierRange) * 100));
  const tierLabel = tierLabels[profile.reputationTier] || 'مبتدئ';
  const nextTierLabel = tierNextLabels[profile.reputationTier] || 'مستوى أعلى';
  const interests = profile.interests || (profile.specialty ? [profile.specialty] : []);
  const joinYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : 2023;

  const sectionIconMap: Record<string, string> = {
    shares: 'forum',
    trending: 'trending_up',
    general: 'help_center',
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Profile Header */}
        <section className="relative">
          {/* Gradient background with smooth bottom fade */}
          <div className="h-52 md:h-72 profile-gradient w-full relative">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-wesal-cream to-transparent" />
          </div>
          <div className="max-w-4xl mx-auto px-6 -mt-20 relative">
            <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <div className="w-[128px] h-[128px] rounded-full bg-gradient-to-br from-wesal-ice to-wesal-sky flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                  {profile.avatarUrl && isBuiltInAvatar(profile.avatarUrl) ? (
                    <div className="w-full h-full [&_svg]:w-full [&_svg]:h-full">
                      {renderAvatarSvg(profile.avatarUrl)}
                    </div>
                  ) : profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.realName || username}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : profile.badge ? (
                    <span className="text-4xl font-bold text-wesal-navy">{profile.badge}</span>
                  ) : (
                    <span className="material-symbols-outlined text-5xl text-wesal-navy">person</span>
                  )}
                </div>
                {/* Edit avatar button (only for own profile) */}
                {isOwnProfile && (
                  <button
                    onClick={() => setAvatarPickerOpen(true)}
                    className="absolute inset-0 rounded-full bg-wesal-navy/0 group-hover:bg-wesal-navy/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="تعديل الصورة الشخصية"
                  >
                    <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                  </button>
                )}
                {/* Tier badge */}
                <div className="absolute -bottom-1 left-1 bg-wesal-dark text-white text-[10px] px-2.5 py-0.5 rounded-full border-2 border-wesal-cream font-semibold tracking-wide">
                  {tierLabel}
                </div>
              </div>

              {/* Name & Badges */}
              <div className="flex-1 pb-2">
                <h1 className="text-[32px] font-bold text-wesal-navy mb-1 leading-tight drop-shadow-sm">
                  {isPublic ? profile.realName : 'مستخدم مجهول'}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {!isPublic && (
                    <span className="bg-wesal-ice px-3 py-1 rounded-full text-xs font-medium text-wesal-dark">
                      مستخدم مجهول
                    </span>
                  )}
                  {profile.isVerified && (
                    <span className="text-wesal-dark text-sm flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined filled text-base text-wesal-dark">verified</span>
                      موثق
                    </span>
                  )}
                  <span className="text-wesal-medium text-sm font-medium">
                    عضو منذ {joinYear}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              {isOwnProfile && (
                <div className="flex gap-3 pb-2">
                  <button
                    onClick={() => setAvatarPickerOpen(true)}
                    className="bg-wesal-dark hover:bg-wesal-navy text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-wesal-dark/20 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    تعديل الصورة
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Profile Body Grid */}
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Info (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Stats Card */}
            <div className="glass-card p-6 rounded-2xl space-y-5">
              {profile.specialty && (
                <>
                  <div className="flex items-center gap-3 text-wesal-dark">
                    <span className="material-symbols-outlined text-wesal-dark">psychology</span>
                    <span className="text-lg font-bold text-wesal-navy">التخصص</span>
                  </div>
                  <p className="text-base text-wesal-navy/80 pr-9">{profile.specialty}</p>
                  <hr className="border-wesal-ice" />
                </>
              )}

              {profile.location && (
                <>
                  <div className="flex items-center gap-3 text-wesal-dark">
                    <span className="material-symbols-outlined text-wesal-dark">location_on</span>
                    <span className="text-lg font-bold text-wesal-navy">الموقع</span>
                  </div>
                  <p className="text-base text-wesal-navy/80 pr-9">{profile.location}</p>
                  <hr className="border-wesal-ice" />
                </>
              )}

              {profile.rating != null && profile.rating > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-wesal-dark">
                    <span className="material-symbols-outlined filled text-amber-500">star</span>
                    <span className="text-lg font-bold text-wesal-navy">التقييم</span>
                  </div>
                  <span className="text-xl font-bold text-wesal-dark">{profile.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Reputation Card */}
            <div className="bg-gradient-to-br from-wesal-navy to-wesal-dark text-white p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-wesal-navy/15">
              {/* Decorative shield watermark */}
              <div className="absolute -left-6 -top-6 pointer-events-none">
                <span className="material-symbols-outlined text-[120px] text-white/[0.07]">shield</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined filled text-wesal-sky">shield</span>
                  <h3 className="text-xl font-bold">درع السمعة</h3>
                </div>
                <p className="text-[52px] font-black leading-none mb-2 tracking-tight">{profile.reputationScore}</p>
                <p className="text-sm text-white/90 mb-5 font-medium">نقطة تم جمعها من مساعدة الآخرين</p>
                <div className="w-full bg-white/20 h-2.5 rounded-full mb-3">
                  <div
                    className="bg-wesal-ice h-full rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-semibold text-white/80">
                  <span>{tierLabel}</span>
                  <span>{nextTierLabel} ({maxScore})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Bio Section */}
            {profile.bio && (
              <div className="glass-card p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-wesal-navy mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-wesal-dark">edit_note</span>
                  نبذة شخصية
                </h3>
                <p className="text-lg text-wesal-dark/90 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Interests */}
            {interests.length > 0 && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-wesal-navy mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined filled text-amber-500">star</span>
                  الاهتمامات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, i) => (
                    <span key={i} className="px-4 py-1.5 rounded-full bg-wesal-ice text-wesal-navy text-sm font-medium border border-wesal-sky/30">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Feed */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-wesal-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-wesal-dark">forum</span>
                  آخر المشاركات
                </h3>
                <button className="text-wesal-medium hover:text-wesal-dark text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer">
                  عرض الكل
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
              </div>

              {posts.length > 0 ? (
                posts.map((post) => (
                  <article key={post.id} className="bg-white border border-wesal-ice p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-wesal-sky/40 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-wesal-ice flex items-center justify-center text-wesal-dark flex-shrink-0">
                        <span className="material-symbols-outlined">{sectionIconMap[post.section] || 'article'}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-bold text-wesal-navy leading-snug truncate">{post.content.slice(0, 60)}{post.content.length > 60 ? '...' : ''}</h4>
                        <p className="text-sm text-wesal-medium font-medium mt-0.5">
                          {getRelativeTime(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-base text-wesal-dark/90 mb-4 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-5 pt-4 border-t border-wesal-ice">
                      <span className="flex items-center gap-1.5 text-wesal-medium text-sm font-medium hover:text-wesal-dark transition-colors">
                        <span className="material-symbols-outlined text-xl">favorite</span>
                        {post.reactionCount}
                      </span>
                      <span className="flex items-center gap-1.5 text-wesal-medium text-sm font-medium hover:text-wesal-dark transition-colors">
                        <span className="material-symbols-outlined text-xl">comment</span>
                        {post.commentCount}
                      </span>
                      <span className="flex items-center gap-1.5 text-wesal-medium text-sm font-medium hover:text-wesal-dark transition-colors mr-auto cursor-pointer">
                        <span className="material-symbols-outlined text-xl">share</span>
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="bg-white border border-wesal-ice p-12 rounded-2xl text-center">
                  <div className="w-16 h-16 rounded-2xl bg-wesal-ice flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-wesal-medium">forum</span>
                  </div>
                  <p className="text-base font-semibold text-wesal-navy">لا توجد مشاركات بعد</p>
                  <p className="text-sm text-wesal-medium mt-1">سيظهر هنا آخر نشاطات المستخدم</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Picker Sheet */}
      <AvatarPicker
        open={avatarPickerOpen}
        onOpenChange={setAvatarPickerOpen}
        currentAvatar={profile?.avatarUrl || undefined}
        onConfirm={handleAvatarConfirm}
      />
    </MainLayout>
  );
}
