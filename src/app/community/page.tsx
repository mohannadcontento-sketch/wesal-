'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostFeed } from '@/components/posts/PostFeed';
import { PostForm } from '@/components/posts/PostForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const tabs = [
  { value: 'shares', label: 'مشاركات', icon: 'forum' },
  { value: 'trending', label: 'رائج', icon: 'trending_up' },
  { value: 'doctors', label: 'أطباء', icon: 'verified' },
] as const;

const trendingTopics = [
  { tag: '#إدارة_القلق', posts: 342 },
  { tag: '#التأمل_اليومي', posts: 218 },
  { tag: '#دعم_الأقران', posts: 156 },
  { tag: '#اليقظة_الذهنية', posts: 98 },
  { tag: '#التعافي', posts: 87 },
];

export default function CommunityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState('shares');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <span className="material-symbols-outlined text-[32px] text-primary-container animate-spin">progress_activity</span>
            <p className="text-sm text-on-surface-variant mt-3">جاري التحميل...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) return null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  return (
    <MainLayout>
      <div className="flex gap-6 max-w-[1280px] mx-auto">
        {/* ── Main Feed Column ── */}
        <div className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">
          {/* Greeting */}
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center">
              <span className="material-symbols-outlined filled text-primary-container">auto_awesome</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-on-surface font-[var(--font-heading)]">المجتمع</h1>
              <p className="text-sm text-on-surface-variant">
                {greeting()}، {user.badge}
              </p>
            </div>
          </div>

          {/* Post Creation Form */}
          {user && <PostForm />}

          {/* Tabs */}
          <nav className="flex gap-2 border-b border-outline-variant/30 pb-0 mt-6 mb-6 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSection(tab.value)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                  section === tab.value
                    ? 'text-primary-container border-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface border-transparent'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${section === tab.value ? 'filled' : ''}`}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Feed */}
          <PostFeed section={section} />
        </div>

        {/* ── Right Sidebar (Desktop Only) ── */}
        <aside className="hidden lg:flex flex-col gap-6 w-80 shrink-0 sticky top-24 self-start">
          {/* Reputation Points Card */}
          <div className="bg-gradient-to-bl from-primary-container/20 via-primary-container/5 to-transparent rounded-xl border border-primary-container/20 p-5 ambient-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-primary-fixed-dim/30 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center">
                <span className="material-symbols-outlined filled text-xl text-primary-container">shield_person</span>
              </div>
              <div>
                <h3 className="font-semibold text-on-surface font-[var(--font-heading)]">نقاط السمعة</h3>
                <p className="text-xs text-on-surface-variant">مجتمعك يدعمك</p>
              </div>
            </div>
            <div className="relative z-10">
              <span className="text-3xl font-bold text-primary-container font-[var(--font-heading)]">1,250</span>
              <p className="text-xs text-on-surface-variant mt-1">450 نقطة للمستوى التالي</p>
              <div className="mt-3 h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-primary-container to-primary rounded-full w-[73%]" />
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant mt-1.5">
                <span>مستوى 3</span>
                <span>مستوى 4</span>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-surface-bright rounded-xl border border-outline-variant/30 p-5 ambient-shadow">
            <h3 className="font-semibold text-on-surface mb-4 flex items-center gap-2 font-[var(--font-heading)]">
              <span className="material-symbols-outlined text-xl text-primary-container filled">trending_up</span>
              مواضيع رائجة
            </h3>
            <div className="flex flex-col gap-3">
              {trendingTopics.map((topic, i) => (
                <button
                  key={topic.tag}
                  className="flex items-center justify-between py-1.5 group transition-colors hover:bg-surface-container-low rounded-lg px-2 -mx-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-on-surface-variant font-medium w-4">{i + 1}</span>
                    <span className="text-sm font-medium text-on-surface group-hover:text-primary-container transition-colors">
                      {topic.tag}
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant">{topic.posts} مشاركة</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
