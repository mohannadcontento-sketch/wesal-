'use client';

import { useState, useCallback } from 'react';
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
import { getSession, setSession, clearSession, hasPermission, type UserSession, type UserRole } from '@/lib/permissions';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getSession());
  const [currentPage, setCurrentPage] = useState(() => getSession() ? 'community' : 'landing');
  const [authOpen, setAuthOpen] = useState(false);

  const handleNavigate = useCallback((page: string) => {
    // فحص صلاحيات الوصول
    if (page === 'tracker' && !hasPermission('tracker')) {
      alert('التراكر متاح بس للمرضى المتابعين مع دكتور. الدكتور هيفعّله ليك بعد ما تحجز جلسة.');
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAuthSuccess = useCallback((role: UserRole = 'patient', nickname?: string) => {
    const anonId = nickname || 'مسافر #' + Math.floor(Math.random() * 9000 + 1000);
    const colors = ['bg-teal-100 text-teal-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700'];
    const session: UserSession = {
      userId: crypto.randomUUID(),
      anonId,
      nickname,
      role,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      trackerEnabled: false, // الدكتور يفعّله
      tier: 'new',
      streakDays: 0,
    };
    setSession(session);
    setIsLoggedIn(true);
    setAuthOpen(false);
    setCurrentPage('community'); // المجتمع = الصفحة الرئيسية بعد الدخول
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
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

  const renderPage = () => {
    // Landing page = بس قبل تسجيل الدخول
    if (!isLoggedIn && currentPage === 'landing') {
      return <LandingPage onGetStarted={() => setAuthOpen(true)} />;
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={() => setAuthOpen(true)} />;
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
        userRole={session?.role}
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
