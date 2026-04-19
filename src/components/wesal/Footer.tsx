'use client';

import { WesalLogo } from './WesalLogo';
import { Heart, Phone, Mail, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Wave Divider */}
      <div className="w-full overflow-hidden">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#F8F9FA"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <WesalLogo size="md" variant="light" />
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              وصال هو رفيقك الذكي للصحة النفسية الآمنة. منصة مجتمعية مصممة للمستخدم العربي تجمع بين الدعم الإنساني والذكاء الاصطناعي.
            </p>
            <div className="flex gap-3 pt-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                >
                  <Icon size={16} className="text-primary-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'المجتمع', page: 'community' },
                { label: 'التراكر الذكي', page: 'tracker' },
                { label: 'الاستشارات', page: 'consultations' },
                { label: 'الفعاليات', page: 'events' },
              ].map((link) => (
                <li key={link.page}>
                  <button className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">الدعم والمساعدة</h3>
            <ul className="space-y-2.5">
              {['سياسة الخصوصية', 'شروط الاستخدام', 'الأسئلة الشائعة', 'تواصل معنا'].map((link) => (
                <li key={link}>
                  <button className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">تواصل معنا</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Phone size={14} />
                </div>
                <span className="text-sm text-primary-foreground/70" dir="ltr">+20 10 409 945 655</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Mail size={14} />
                </div>
                <span className="text-sm text-primary-foreground/70">info@wesal.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Globe size={14} />
                </div>
                <span className="text-sm text-primary-foreground/70">www.wesal.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            &copy; 2026 وصال - جميع الحقوق محفوظة
          </p>
          <p className="text-sm text-primary-foreground/50 flex items-center gap-1">
            صُنع بـ <Heart size={14} className="text-red-400" fill="currentColor" /> لعالمنا العربي
          </p>
        </div>
      </div>
    </footer>
  );
}
