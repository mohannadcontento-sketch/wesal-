'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostFeed } from '@/components/posts/PostFeed';
import { PostForm } from '@/components/posts/PostForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, TrendingUp, Stethoscope, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const tabs = [
  { value: 'shares', label: 'المشاركات', icon: MessageSquarePlus },
  { value: 'trending', label: 'رائج', icon: TrendingUp },
  { value: 'doctors', label: 'الأطباء', icon: Stethoscope },
] as const;

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
            <div className="h-8 w-8 mx-auto mb-3 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
            <p className="text-xs text-gray-400">جاري التحميل...</p>
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
      <div className="px-4 sm:px-5 py-4 space-y-5 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">المجتمع</h1>
            <p className="text-xs text-gray-400">
              {greeting()}، {user.badge}
            </p>
          </div>
        </div>

        {/* Create Post */}
        {user && <PostForm />}

        {/* Tabs */}
        <Tabs value={section} onValueChange={setSection} dir="rtl">
          <TabsList className="w-full h-auto p-1 rounded-xl bg-gray-50 border border-gray-100">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="shares">
            <PostFeed section="shares" />
          </TabsContent>
          <TabsContent value="trending">
            <PostFeed section="trending" />
          </TabsContent>
          <TabsContent value="doctors">
            <PostFeed section="doctors" />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
