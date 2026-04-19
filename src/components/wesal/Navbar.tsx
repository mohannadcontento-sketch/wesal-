'use client';

import { useState } from 'react';
import { Menu, X, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { WesalLogo } from './WesalLogo';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onAuthClick: () => void;
  isLoggedIn?: boolean;
}

const navLinks = [
  { id: 'landing', label: 'الرئيسية' },
  { id: 'community', label: 'المجتمع' },
  { id: 'tracker', label: 'التراكر' },
  { id: 'consultations', label: 'الاستشارات' },
  { id: 'events', label: 'الفعاليات' },
];

export function Navbar({ currentPage, onNavigate, onAuthClick, isLoggedIn }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNav('landing')} className="flex-shrink-0">
            <WesalLogo size="md" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === link.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground/70 hover:text-primary hover:bg-secondary'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <Button
                variant="ghost"
                className="gap-2 text-foreground/70 hover:text-primary"
                onClick={onAuthClick}
              >
                <User size={18} />
                حسابي
              </Button>
            ) : (
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={onAuthClick}
              >
                <LogIn size={18} />
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
                  {/* Mobile Logo */}
                  <div className="p-6 border-b border-border">
                    <WesalLogo size="lg" />
                  </div>

                  {/* Mobile Links */}
                  <div className="flex-1 py-4">
                    {navLinks.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => handleNav(link.id)}
                        className={`w-full text-right px-6 py-3 text-base font-medium transition-colors ${
                          currentPage === link.id
                            ? 'text-primary bg-secondary border-r-4 border-primary'
                            : 'text-foreground/70 hover:text-primary hover:bg-secondary/50'
                        }`}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>

                  {/* Mobile Auth */}
                  <div className="p-6 border-t border-border">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                      onClick={() => {
                        onAuthClick();
                        setMobileOpen(false);
                      }}
                    >
                      {isLoggedIn ? (
                        <>
                          <User size={18} />
                          حسابي
                        </>
                      ) : (
                        <>
                          <LogIn size={18} />
                          تسجيل الدخول
                        </>
                      )}
                    </Button>
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
