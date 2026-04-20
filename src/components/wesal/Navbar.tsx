'use client';

import { useState } from 'react';
import { Menu, User, LogOut, LayoutDashboard, Shield, MessageCircle, ClipboardList, Calendar, Home, Activity, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { WesalLogo } from './WesalLogo';
import { ROLE_PERMISSIONS, type UserRole } from '@/lib/permissions';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onAuthClick: () => void;
  isLoggedIn?: boolean;
  userRole?: UserRole;
  trackerEnabled?: boolean;
  onLogout?: () => void;
}

export function Navbar({ currentPage, onNavigate, onAuthClick, isLoggedIn, userRole = 'patient', trackerEnabled = false, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const roleInfo = ROLE_PERMISSIONS[userRole];

  // روابط الـ Navigation حسب الدور
  const getNavLinks = (): { id: string; label: string; icon: LucideIcon }[] => {
    const links: { id: string; label: string; icon: LucideIcon }[] = [];

    if (isLoggedIn) {
      links.push({ id: 'community', label: 'المجتمع', icon: Home });
    }
    if (roleInfo.can.consultations) {
      links.push({ id: 'consultations', label: 'الاستشارات', icon: MessageCircle });
    }
    if (trackerEnabled && roleInfo.can.tracker) {
      links.push({ id: 'tracker', label: 'التراكر', icon: Activity });
    }
    if (roleInfo.can.viewEvents) {
      links.push({ id: 'events', label: 'الفعاليات', icon: Calendar });
    }
    if (roleInfo.can.adminPanel || roleInfo.can.moderate) {
      links.push({ id: 'admin', label: roleInfo.can.adminPanel ? 'لوحة الإدارة' : 'المراجعة', icon: LayoutDashboard });
    }

    return links;
  };

  const navLinks = getNavLinks();
  const handleNav = (page: string) => {
    if (page === 'tracker' && !trackerEnabled) {
      alert('التراكر متاح بس للمرضى المتابعين مع دكتور. الدكتور هيفعّله ليك بعد ما تحجز جلسة.');
      return;
    }
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => isLoggedIn ? handleNav('community') : onNavigate('landing')} className="flex-shrink-0">
            <WesalLogo size="md" />
          </button>

          {/* Desktop Navigation */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === link.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground/70 hover:text-primary hover:bg-secondary'
                  }`}
                >
                  <link.icon size={16} />
                  {link.label}
                </button>
              ))}
            </div>
          )}

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {roleInfo.badge && (
                  <Badge className={`${roleInfo.badgeColor} text-[10px] px-2 py-0.5`}>
                    {roleInfo.badge}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  className="gap-2 text-foreground/70 hover:text-primary"
                  onClick={onAuthClick}
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={14} className="text-primary" />
                  </div>
                  حسابي
                </Button>
                <Button
                  variant="ghost"
                  className="gap-1 text-muted-foreground hover:text-red-500 text-xs"
                  onClick={onLogout}
                >
                  <LogOut size={16} />
                </Button>
              </>
            ) : (
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={onAuthClick}
              >
                تسجيل الدخول
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={24} className="text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-card">
                <SheetTitle className="sr-only">القائمة</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-6 border-b border-border">
                    <WesalLogo size="md" />
                    {isLoggedIn && roleInfo.badge && (
                      <Badge className={`${roleInfo.badgeColor} text-[10px] mt-2`}>
                        {roleInfo.badge}
                      </Badge>
                    )}
                  </div>

                  {/* Mobile Links */}
                  <div className="flex-1 py-2">
                    {navLinks.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => handleNav(link.id)}
                        className={`w-full text-right px-6 py-3 text-sm font-medium transition-colors flex items-center gap-3 ${
                          currentPage === link.id
                            ? 'text-primary bg-secondary border-r-4 border-primary'
                            : 'text-foreground/70 hover:text-primary hover:bg-secondary/50'
                        }`}
                      >
                        <link.icon size={18} />
                        {link.label}
                      </button>
                    ))}
                  </div>

                  {/* Mobile Footer */}
                  <div className="p-6 border-t border-border space-y-3">
                    {isLoggedIn ? (
                      <>
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => { onAuthClick(); setMobileOpen(false); }}
                        >
                          <User size={18} />
                          حسابي
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => { onLogout?.(); setMobileOpen(false); }}
                        >
                          <LogOut size={18} />
                          تسجيل خروج
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                        onClick={() => { onAuthClick(); setMobileOpen(false); }}
                      >
                        تسجيل الدخول
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
