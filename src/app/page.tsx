'use client';

import { useState } from 'react';
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

export default function Home() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [authOpen, setAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setAuthOpen(false);
    setCurrentPage('tracker');
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      handleNavigate('profile');
    } else {
      setAuthOpen(true);
    }
  };

  const renderPage = () => {
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
        return <ProfilePage />;
      default:
        return <LandingPage onGetStarted={() => setAuthOpen(true)} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onAuthClick={handleAuthClick}
        isLoggedIn={isLoggedIn}
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
      <Footer />
      <EmergencyButton />
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
