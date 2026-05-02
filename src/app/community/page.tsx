'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostFeed } from '@/components/posts/PostFeed';
import { PostForm } from '@/components/posts/PostForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, TrendingUp, Stethoscope, Sparkles } from 'lucide-react';

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
            <div className="h-8 w-8 mx-auto mb-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-body-sm text-text-tertiary">جاري التحميل...</p>
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-h3 text-text-primary">المجتمع</h1>
            <p className="text-caption text-text-tertiary">
              {greeting()}، {user.badge}
            </p>
          </div>
        </motion.div>

        {/* Create Post */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <PostForm />
          </motion.div>
        )}

        {/* Custom Tab Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="flex gap-2 p-1 rounded-2xl bg-surface-container border border-border-light">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = section === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSection(tab.value)}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-body-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-card'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="community-tab-active"
                      className="absolute inset-0 rounded-xl gradient-primary shadow-md"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-white' : ''}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Post Feed */}
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PostFeed section={section} />
          </motion.div>
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
