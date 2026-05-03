'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="flex justify-between items-center w-full max-w-5xl mx-auto px-4 sm:px-6 py-3">
          {/* Logo */}
          <Link
            href={user ? '/community' : '/'}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm group-hover:shadow-md transition-shadow">
              <svg
                width="18"
                height="18"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 8C14 8 10 12 10 16C10 20 14 22 20 28C26 22 30 20 30 16C30 12 26 8 20 8Z"
                  fill="rgba(255,255,255,0.9)"
                />
                <path
                  d="M12 18C12 14 16 12 20 16C24 12 28 14 28 18C28 22 24 24 20 28C16 24 12 22 12 18Z"
                  fill="rgba(255,255,255,0.5)"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-teal-600 tracking-tight">
              وصال
            </span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" title="التنبيهات">
                    <Bell className="w-[18px] h-[18px]" />
                  </Button>
                </Link>
                <Link href={`/profile/${user.username || 'me'}`}>
                  <Avatar className="w-9 h-9 cursor-pointer border-2 border-border hover:border-teal-600/30 transition-all">
                    <AvatarFallback className="bg-teal-600 text-sm text-white font-bold">
                      {user.realName?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-muted-foreground hover:text-red-600"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost">دخول</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    حساب جديد
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && user && (
          <div className="sm:hidden border-t border-border bg-white">
            <div className="px-4 py-3 space-y-1">
              <Link
                href={`/profile/${user.username || 'me'}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-teal-600 text-xs text-white font-bold">
                    {user.realName?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{user.realName}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.badge} {user.role === 'doctor' ? 'طبيب' : 'عضو'}
                  </div>
                </div>
              </Link>
              <Link
                href="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm"
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span>التنبيهات</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm text-red-600 w-full"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
