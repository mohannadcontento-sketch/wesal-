'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AvatarPicker } from '@/components/avatars/AvatarPicker';
import { renderAvatarSvg, isBuiltInAvatar } from '@/lib/avatars';
import { UserAvatar } from '@/components/avatars/UserAvatar';
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
  moods?: string;
}

const tierConfig = [
  { key: 'beginner', label: 'مبتدئ', icon: 'eco', min: 0, max: 49, desc: 'بداية رحلتك في المجتمع' },
  { key: 'active', label: 'نشط', icon: 'local_fire_department', min: 50, max: 149, desc: 'مشاركة منتظمة ومفيدة' },
  { key: 'notable', label: 'مميز', icon: 'stars', min: 150, max: 299, desc: 'محتوى مميز يساعد الكثيرين' },
  { key: 'eligible', label: 'مؤهل للتوثيق', icon: 'workspace_premium', min: 300, max: 500, desc: 'ثقة المجتمع وتواصل مستمر' },
] as const;

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
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'posts'>('about');
  const [reputationExpanded, setReputationExpanded] = useState(false);
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

        // Fetch recent 3 posts for overview
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

  // Fetch all user posts when "posts" tab is clicked
  useEffect(() => {
    if (activeTab !== 'posts') return;
    setPostsLoading(true);
    async function fetchAllPosts() {
      try {
        const postsRes = await fetch(`/api/posts?author=${username}`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setAllPosts(postsData.posts || []);
        }
      } catch {
        // ignore
      }
      setPostsLoading(false);
    }
    fetchAllPosts();
  }, [activeTab, username]);

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
  const currentTierIdx = tierConfig.findIndex(t => t.key === profile.reputationTier) || 0;
  const currentTier = tierConfig[currentTierIdx] || tierConfig[0];
  const nextTier = tierConfig[currentTierIdx + 1];
  const tierRange = nextTier ? nextTier.min - currentTier.min : 1;
  const progressInTier = profile.reputationScore - currentTier.min;
  const progressPercent = nextTier
    ? Math.min(100, Math.max(0, (progressInTier / tierRange) * 100))
    : 100;
  const pointsToNext = nextTier ? nextTier.min - profile.reputationScore : 0;
  const interests = profile.interests || (profile.specialty ? [profile.specialty] : []);
  const joinYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : 2023;

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
                  <UserAvatar
                    avatarUrl={profile.avatarUrl}
                    username={profile.realName || profile.username}
                    size="xl"
                    className="!w-[120px] !h-[120px] !border-[3px]"
                  />
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
                <div className="absolute -bottom-1 left-1 bg-wesal-dark text-white text-[10px] px-2.5 py-0.5 rounded-full border-2 border-wesal-cream font-semibold tracking-wide flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">{currentTier.icon}</span>
                  {currentTier.label}
                </div>
              </div>

              {/* Name & Badges */}
              <div className="flex-1 pb-2">
                <h1 className="text-[28px] md:text-[32px] font-bold text-wesal-navy mb-1 leading-tight drop-shadow-sm">
                  {isPublic ? profile.realName : '@' + username}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {profile.isVerified && (
                    <span className="text-wesal-dark text-sm flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined filled text-base text-wesal-dark">verified</span>
                      موثق
                    </span>
                  )}
                  <span className="text-wesal-medium text-sm font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    عضو منذ {joinYear}
                  </span>
                  {isPublic && (
                    <span className="text-wesal-medium text-sm font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">person</span>
                      {profile.reputationScore} نقطة سمعة
                    </span>
                  )}
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

        {/* Profile Tabs */}
        <div className="max-w-4xl mx-auto px-6 mt-8">
          <nav className="flex gap-1 border-b border-wesal-ice pb-0 mb-8">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
                activeTab === 'about'
                  ? 'text-wesal-dark border-wesal-dark'
                  : 'text-wesal-medium hover:text-wesal-navy border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${activeTab === 'about' ? 'filled' : ''}`}>account_circle</span>
              معلومات
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
                activeTab === 'posts'
                  ? 'text-wesal-dark border-wesal-dark'
                  : 'text-wesal-medium hover:text-wesal-navy border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${activeTab === 'posts' ? 'filled' : ''}`}>edit_note</span>
              مشاركاتي
              {posts.length > 0 && (
                <span className="text-[11px] bg-wesal-ice text-wesal-dark px-2 py-0.5 rounded-full font-bold">{posts.length > 3 ? '3+' : posts.length}</span>
              )}
            </button>
          </nav>
        </div>

        {/* Profile Body */}
        <div className="max-w-4xl mx-auto px-6 pb-16">
          {/* ═══ ABOUT TAB ═══ */}
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sidebar Info (4 Columns) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Stats Card */}
                <div className="glass-card p-6 rounded-2xl space-y-5">
                  {profile.specialty && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-wesal-dark">psychology</span>
                        <span className="text-base font-bold text-wesal-navy">التخصص</span>
                      </div>
                      <p className="text-sm text-wesal-navy/80 pr-9">{profile.specialty}</p>
                      <hr className="border-wesal-ice" />
                    </>
                  )}

                  {profile.location && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-wesal-dark">location_on</span>
                        <span className="text-base font-bold text-wesal-navy">الموقع</span>
                      </div>
                      <p className="text-sm text-wesal-navy/80 pr-9">{profile.location}</p>
                      <hr className="border-wesal-ice" />
                    </>
                  )}

                  {profile.rating != null && profile.rating > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined filled text-amber-500">star</span>
                        <span className="text-base font-bold text-wesal-navy">التقييم</span>
                      </div>
                      <span className="text-xl font-bold text-wesal-dark">{profile.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Reputation System Card */}
                <div className="bg-gradient-to-br from-wesal-navy to-wesal-dark text-white p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-wesal-navy/15">
                  {/* Decorative watermark */}
                  <div className="absolute -left-6 -top-6 pointer-events-none">
                    <span className="material-symbols-outlined text-[120px] text-white/[0.07]">workspace_premium</span>
                  </div>
                  <div className="relative z-10">
                    {/* Header - clickable */}
                    <button
                      onClick={() => setReputationExpanded(!reputationExpanded)}
                      className="w-full text-right cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined filled text-wesal-sky">workspace_premium</span>
                          <h3 className="text-xl font-bold">نظام السمعة</h3>
                        </div>
                        <span
                          className={`material-symbols-outlined text-white/60 transition-transform duration-300 ${
                            reputationExpanded ? 'rotate-180' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </div>
                    </button>

                    {/* Score & Progress */}
                    <p className="text-[48px] font-black leading-none mb-1 tracking-tight">{profile.reputationScore}</p>
                    <p className="text-sm text-white/80 mb-4 font-medium">
                      {nextTier ? `${pointsToNext} نقطة للمستوى التالي` : 'وصلت لأعلى مستوى'}
                    </p>
                    <div className="w-full bg-white/20 h-2.5 rounded-full mb-2">
                      <div
                        className="bg-gradient-to-l from-wesal-ice to-wesal-sky h-full rounded-full transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-white/70">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">{currentTier.icon}</span>
                        {currentTier.label}
                      </span>
                      {nextTier && (
                        <span className="flex items-center gap-1">
                          {nextTier.label}
                          <span className="material-symbols-outlined text-[14px]">{nextTier.icon}</span>
                        </span>
                      )}
                    </div>

                    {/* Expanded Details */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        reputationExpanded ? 'max-h-[500px] opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0'
                      }`}
                    >
                      <div className="border-t border-white/15 pt-4 space-y-3">
                        <p className="text-xs text-white/60 font-medium mb-3">مستويات نظام السمعة</p>
                        {tierConfig.map((tier, idx) => {
                          const isActive = tier.key === profile.reputationTier;
                          const isUnlocked = profile.reputationScore >= tier.min;
                          return (
                            <div
                              key={tier.key}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                isActive
                                  ? 'bg-white/15 border border-white/20'
                                  : isUnlocked
                                  ? 'bg-white/5'
                                  : 'opacity-40'
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                isActive ? 'bg-wesal-sky/30' : 'bg-white/10'
                              }`}>
                                <span className={`material-symbols-outlined text-lg ${isActive ? 'filled text-wesal-ice' : ''}`}>
                                  {tier.icon}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-bold ${isActive ? 'text-wesal-ice' : ''}`}>
                                    {tier.label}
                                  </span>
                                  <span className="text-[11px] text-white/50">{tier.min}+</span>
                                </div>
                                <p className="text-[11px] text-white/50 mt-0.5 truncate">{tier.desc}</p>
                              </div>
                              {isActive && (
                                <span className="material-symbols-outlined text-wesal-ice text-lg">check_circle</span>
                              )}
                            </div>
                          );
                        })}

                        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-wesal-sky text-base">info</span>
                            <span className="text-xs font-bold text-white/80">كيف تزيد سمعتك؟</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[11px] text-white/60">
                              <span className="material-symbols-outlined text-[14px] text-wesal-ice">favorite</span>
                              <span>الحصول على تفاعل من المجتمع</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-white/60">
                              <span className="material-symbols-outlined text-[14px] text-wesal-ice">chat_bubble</span>
                              <span>المشاركة في النقاشات والتعليقات</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-white/60">
                              <span className="material-symbols-outlined text-[14px] text-wesal-ice">volunteer_activism</span>
                              <span>مساعدة الآخرين ومحتوى مفيد</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content (8 Columns) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Bio Section */}
                {profile.bio && (
                  <div className="glass-card p-8 rounded-2xl">
                    <h3 className="text-xl font-bold text-wesal-navy mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-wesal-dark">description</span>
                      نبذة شخصية
                    </h3>
                    <p className="text-base text-wesal-dark/90 leading-relaxed whitespace-pre-line">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Interests */}
                {interests.length > 0 && (
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-wesal-navy mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined filled text-amber-500">interests</span>
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

                {/* Recent Activity Preview */}
                {posts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-wesal-navy flex items-center gap-2">
                        <span className="material-symbols-outlined text-wesal-dark">auto_awesome</span>
                        آخر النشاطات
                      </h3>
                      <button
                        onClick={() => setActiveTab('posts')}
                        className="text-wesal-medium hover:text-wesal-dark text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        عرض الكل
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                      </button>
                    </div>

                    {posts.slice(0, 3).map((post) => (
                      <article key={post.id} className="bg-white border border-wesal-ice p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-wesal-sky/40 transition-all duration-200">
                        <p className="text-base text-wesal-dark/90 mb-3 line-clamp-3 leading-relaxed">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-5 pt-3 border-t border-wesal-ice">
                          <span className="flex items-center gap-1.5 text-wesal-medium text-sm font-medium">
                            <span className="material-symbols-outlined text-xl">favorite</span>
                            {post.reactionCount}
                          </span>
                          <span className="flex items-center gap-1.5 text-wesal-medium text-sm font-medium">
                            <span className="material-symbols-outlined text-xl">chat_bubble</span>
                            {post.commentCount}
                          </span>
                          <span className="text-wesal-medium/60 text-xs mr-auto">
                            {getRelativeTime(post.createdAt)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ POSTS TAB ═══ */}
          {activeTab === 'posts' && (
            <div className="max-w-2xl">
              {postsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white/70 border border-wesal-ice p-5 rounded-2xl animate-pulse">
                      <div className="space-y-3">
                        <div className="h-4 w-full bg-wesal-ice/60 rounded" />
                        <div className="h-4 w-4/5 bg-wesal-ice/60 rounded" />
                        <div className="h-4 w-3/5 bg-wesal-ice/60 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : allPosts.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined filled text-wesal-dark">edit_note</span>
                    <h3 className="text-xl font-bold text-wesal-navy">مشاركاتي</h3>
                    <span className="text-sm text-wesal-medium">({allPosts.length} منشور)</span>
                  </div>
                  {allPosts.map((post) => (
                    <article key={post.id} className="bg-white border border-wesal-ice p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-wesal-sky/40 transition-all duration-200">
                      <p className="text-base text-wesal-dark/90 mb-3 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                      {post.moods && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.moods.split(',').filter(Boolean).map((mood, i) => (
                            <span key={i} className="px-3 py-0.5 rounded-full bg-wesal-ice text-wesal-navy text-[11px] font-medium">
                              {mood.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-5 pt-3 border-t border-wesal-ice">
                        <span className="flex items-center gap-1.5 text-wesal-medium text-sm font-medium">
                          <span className="material-symbols-outlined text-xl">favorite</span>
                          {post.reactionCount}
                        </span>
                        <span className="flex items-center gap-1.5 text-wesal-medium text-sm font-medium">
                          <span className="material-symbols-outlined text-xl">chat_bubble</span>
                          {post.commentCount}
                        </span>
                        <span className="text-wesal-medium/60 text-xs mr-auto">
                          {getRelativeTime(post.createdAt)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-wesal-ice p-12 rounded-2xl text-center">
                  <div className="w-16 h-16 rounded-2xl bg-wesal-ice flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-wesal-medium">edit_note</span>
                  </div>
                  <p className="text-base font-semibold text-wesal-navy">لا توجد مشاركات بعد</p>
                  <p className="text-sm text-wesal-medium mt-1">شارك أول تجربة مع المجتمع!</p>
                </div>
              )}
            </div>
          )}
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
