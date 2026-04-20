'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '@/components/wesal/Navbar';
import { Footer } from '@/components/wesal/Footer';
import { EmergencyButton } from '@/components/wesal/EmergencyButton';
import { AuthModal } from '@/components/wesal/AuthModal';
import { LandingPage } from '@/components/wesal/LandingPage';
import { CommunityPage } from '@/components/wesal/CommunityPage';
import { TrackerPage } from '@/components/wesal/TrackerPage';
import { ConsultationsPage } from '@/components/wesal/ConsultationsPage';
import { EventsPage } from '@/components/wesal/EventsPage';
import { ProfilePage } from '@/components/wesal/ProfilePage';
import {
  getSession, setSession, clearSession, hasPermission,
  checkAuthSession, signOut, loadSessionFromStorage,
  type UserSession, type UserRole,
} from '@/lib/permissions';
import { AdminPanel } from '@/components/wesal/AdminPanel';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');
  const [authOpen, setAuthOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // ── التحقق من الجلسة عند تحميل الصفحة ──
  useEffect(() => {
    async function initAuth() {
      // أول حاجة: نشوف لو فيه session محفوظ في الذاكرة/ localStorage
      const savedSession = loadSessionFromStorage();
      if (savedSession) {
        setSession(savedSession);
        setIsLoggedIn(true);
        setCurrentPage('community');
        setAuthLoading(false);

        // في الخلفية: نتأكد إن الـ Supabase session لسه active
        checkAuthSession().then((freshSession) => {
          if (!freshSession) {
            // الـ Supabase session انتهى — نسجل خروج
            clearSession();
            setIsLoggedIn(false);
            setCurrentPage('landing');
          }
          setAuthLoading(false);
        });
        return;
      }

      // محاولة استعادة الجلسة من Supabase Auth
      const session = await checkAuthSession();
      if (session) {
        setSession(session);
        setIsLoggedIn(true);
        setCurrentPage('community');
      }
      setAuthLoading(false);
    }

    initAuth();
  }, []);

  const handleNavigate = useCallback((page: string) => {
    if (page === 'tracker' && !hasPermission('tracker')) {
      alert('التراكر متاح بس للمرضى المتابعين مع دكتور. الدكتور هيفعّله ليك بعد ما تحجز جلسة.');
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAuthSuccess = useCallback(async () => {
    // نجح الـ OTP verification — نجيب الـ profile من API
    try {
      const session = await checkAuthSession();
      if (session) {
        setSession(session);
        setIsLoggedIn(true);
      }
    } catch {
      // لو حصل مشكلة في جلب الـ profile
      setIsLoggedIn(true);
    }
    setAuthOpen(false);
    setCurrentPage('community');
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut();
    setIsLoggedIn(false);
    setCurrentPage('landing');
  }, []);

  const handleAuthClick = useCallback(() => {
    if (isLoggedIn) {
      handleNavigate('profile');
    } else {
      setAuthOpen(true);
    }
  }, [isLoggedIn, handleNavigate]);

  // Listen for custom navigation events from child components
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) handleNavigate(detail);
    };
    window.addEventListener('wesal:navigate', handler);
    return () => window.removeEventListener('wesal:navigate', handler);
  }, [handleNavigate]);

  // ── Loading state ──
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#508991] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (!isLoggedIn && currentPage === 'landing') {
      return <LandingPage onGetStarted={() => setAuthOpen(true)} onNavigate={handleNavigate} />;
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={() => setAuthOpen(true)} onNavigate={handleNavigate} />;
      case 'community':
        return <CommunityPage />;
      case 'tracker':
        return <TrackerPage />;
      case 'consultations':
        return <ConsultationsPage />;
      case 'events':
        return <EventsPage />;
      case 'profile':
        return <ProfilePage onLogout={handleLogout} />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <CommunityPage />;
    }
  };

  const session = getSession();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onAuthClick={handleAuthClick}
        isLoggedIn={isLoggedIn}
        userRole={session?.role as UserRole | undefined}
        trackerEnabled={session?.trackerEnabled || false}
        onLogout={handleLogout}
      />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      {isLoggedIn && <Footer />}
      <EmergencyButton />
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
