'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useState, useEffect, use } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Settings,
  Star,
  TrendingUp,
  User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ProfileData {
  username: string;
  realName?: string;
  bio?: string;
  location?: string;
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
          <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="py-16 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
            <User className="h-7 w-7 text-teal-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">البروفايل مش موجود</p>
          <p className="text-xs text-gray-500 mt-1">تأكد من اسم المستخدم</p>
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
  const remainingPoints = maxScore - profile.reputationScore;
  const interests = profile.interests || (profile.specialty ? [profile.specialty] : []);
  const joinYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : 2023;

  return (
    <MainLayout>
      {/* Profile Header with teal gradient */}
      <section className="bg-teal-600 relative -mx-4 sm:-mx-6 -mt-2 pt-6 pb-16 px-5 flex flex-col items-center text-center rounded-b-[2rem]">
        {/* Back button */}
        <div className="absolute top-4 right-4">
          <button className="inline-flex items-center justify-center rounded-md bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm p-2 transition-colors">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Settings button */}
        <div className="absolute top-4 left-4">
          <button className="inline-flex items-center justify-center rounded-md bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm p-2 transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Large Avatar */}
        <div className="relative mb-4 mt-2">
          <Avatar className="size-20 ring-4 ring-white/30 shadow-lg">
            <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
              {profile.badge}
            </AvatarFallback>
          </Avatar>
          {profile.isVerified && (
            <div className="absolute bottom-1 left-1 bg-teal-600 text-white rounded-full p-1 border-2 border-white flex items-center justify-center">
              <BadgeCheck className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Name & Handle */}
        <h1 className="text-xl font-bold text-white mb-1">
          {isPublic ? profile.realName : 'مستخدم مجهول'}
        </h1>
        <p className="text-sm text-white/70 mb-2">
          @{profile.username}
        </p>

        {/* Bio (short) */}
        {profile.bio && (
          <p className="text-sm text-white/80 max-w-xs mx-auto leading-relaxed line-clamp-2 mb-3">
            {profile.bio}
          </p>
        )}

        {/* Location */}
        {profile.location && (
          <div className="flex items-center gap-1 text-white/60 text-xs mb-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>{profile.location}</span>
          </div>
        )}
      </section>

      {/* Stats Row — overlaps the header */}
      <section className="px-5 -mt-10 relative z-10 mb-6">
        <Card className="rounded-2xl shadow-md border-gray-200 bg-white p-4">
          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x divide-gray-200 text-center">
              <div>
                <p className="text-xl font-bold text-teal-600">{posts.length}</p>
                <p className="text-xs text-gray-500">مشاركة</p>
              </div>
              <div>
                <p className="text-xl font-bold text-teal-600">{profile.reputationScore}</p>
                <p className="text-xs text-gray-500">نقاط السمعة</p>
              </div>
              <div>
                <p className="text-xl font-bold text-teal-600">{joinYear}</p>
                <p className="text-xs text-gray-500">عضو منذ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Reputation Tier Card */}
      <section className="px-5 mb-6">
        <Card className="rounded-2xl shadow-sm border-gray-200 bg-white p-5 relative overflow-hidden">
          <CardContent className="p-0">
            {/* Decorative glow */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">نقاط الدعم</h3>
                  <p className="text-sm text-gray-500">
                    {remainingPoints > 0 ? `${remainingPoints} نقطة متبقية للمستوى التالي` : 'وصلت أعلى مستوى'}
                  </p>
                </div>
              </div>
              <Badge className="bg-teal-600 text-white hover:bg-teal-600 gap-1">
                <Star className="h-3 w-3" />
                {tierLabel}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="relative z-10">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{tierLabel}</span>
                <span>{nextTierLabel}</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Bio Section (long bio) */}
      {profile.bio && profile.bio.length > 80 && (
        <section className="px-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-teal-600" />
            نبذة عني
          </h2>
          <Card className="rounded-2xl shadow-sm border-gray-200 bg-white p-4">
            <CardContent className="p-0 text-gray-500 text-sm leading-relaxed">
              {profile.bio}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <section className="px-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-amber-500" />
            الاهتمامات
          </h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-1.5"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="px-5 mb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-sm">المشاركات الأخيرة</h2>
          <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
            عرض الكل
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="rounded-2xl shadow-sm border-gray-200 bg-white p-4">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                        <span className="text-sm">{profile.badge}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {post.section === 'shares' ? 'مشاركة' : post.section === 'trending' ? 'نقاش رائج' : 'منشور'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {getRelativeTime(post.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                  <Separator className="bg-gray-100 mb-3" />
                  <div className="flex items-center gap-4 text-gray-500 text-xs">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-teal-600 transition-colors">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{post.reactionCount} إعجاب</span>
                    </div>
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-teal-600 transition-colors">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{post.commentCount} تعليق</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="rounded-2xl shadow-sm border-gray-200 bg-white p-8 text-center">
              <CardContent className="p-0">
                <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">لا توجد مشاركات بعد</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
