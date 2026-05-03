'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostFeed } from '@/components/posts/PostFeed';
import { PostForm } from '@/components/posts/PostForm';

/* ═══════════════════════════════════════════════════════════════════
   Intersection Observer hook — adds "animate-fade-in-up" when visible
   ═══════════════════════════════════════════════════════════════════ */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function FadeInSection({
  children,
  className = '',
  delay = '',
  threshold = 0.12,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: string;
  threshold?: number;
}) {
  const { ref, visible } = useInView(threshold);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transitionDelay: delay,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Community Feed (shown for logged-in users)
   ═══════════════════════════════════════════════════════════════════ */
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

function CommunityFeed({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const [section, setSection] = useState('shares');

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  return (
    <div className="flex gap-6 max-w-[1280px] mx-auto">
      {/* ── Main Feed Column ── */}
      <div className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">
        {/* Greeting */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-wesal-ice to-wesal-sky/30 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined filled text-wesal-dark text-xl">auto_awesome</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-wesal-navy">المجتمع</h1>
            <p className="text-sm text-wesal-medium">
              {greeting()}، {user.badge}
            </p>
          </div>
        </div>

        {/* Post Creation Form */}
        {user && <PostForm />}

        {/* Tabs */}
        <nav className="flex gap-2 border-b border-wesal-ice pb-0 mt-6 mb-6 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSection(tab.value)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                section === tab.value
                  ? 'text-wesal-dark border-wesal-dark'
                  : 'text-wesal-medium hover:text-wesal-navy border-transparent'
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
      <aside className="hidden lg:flex flex-col gap-5 w-80 shrink-0 sticky top-20 self-start">
        {/* Reputation Points Card */}
        <div className="bg-gradient-to-bl from-wesal-ice/50 via-wesal-ice/15 to-transparent rounded-2xl border border-wesal-ice p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-wesal-sky/15 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-wesal-ice flex items-center justify-center">
              <span className="material-symbols-outlined filled text-xl text-wesal-dark">shield_person</span>
            </div>
            <div>
              <h3 className="font-bold text-wesal-navy text-sm">نقاط السمعة</h3>
              <p className="text-xs text-wesal-medium">مجتمعك يدعمك</p>
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-extrabold text-wesal-dark">1,250</span>
            <p className="text-xs text-wesal-medium mt-1">450 نقطة للمستوى التالي</p>
            <div className="mt-3 h-2 w-full bg-wesal-cream rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-l from-wesal-sky to-wesal-dark rounded-full w-[73%] transition-all duration-1000" />
            </div>
            <div className="flex justify-between text-xs text-wesal-medium mt-1.5">
              <span>مستوى 3</span>
              <span>مستوى 4</span>
            </div>
          </div>
        </div>

        {/* Trending Topics */}
        <div className="bg-white rounded-2xl border border-wesal-ice p-5 shadow-sm">
          <h3 className="font-bold text-wesal-navy text-sm mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-wesal-dark filled">trending_up</span>
            مواضيع رائجة
          </h3>
          <div className="flex flex-col gap-1">
            {trendingTopics.map((topic, i) => (
              <button
                key={topic.tag}
                className="flex items-center justify-between py-2 group transition-colors hover:bg-wesal-ice/40 rounded-lg px-2.5 -mx-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] text-wesal-medium font-bold w-4">{i + 1}</span>
                  <span className="text-sm font-medium text-wesal-navy group-hover:text-wesal-dark transition-colors">
                    {topic.tag}
                  </span>
                </div>
                <span className="text-[11px] text-wesal-medium">{topic.posts} مشاركة</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Landing Page (shown for guests)
   ═══════════════════════════════════════════════════════════════════ */
function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const stats = [
    { value: '١٠٠٠+', label: 'مستخدم نشط', icon: 'group' },
    { value: '٥٠+', label: 'طبيب معتمد', icon: 'medical_services' },
    { value: '١٠٠+', label: 'مقالة داعمة', icon: 'article' },
    { value: '٩٨٪', label: 'نسبة الرضا', icon: 'sentiment_satisfied' },
  ];

  const features = [
    { 
      icon: 'shield', 
      title: 'خصوصية لا تقبل المساومة', 
      desc: 'بياناتك مشفرة بالكامل. يمكنك اختيار اسم مستعار والتحكم الكامل فيما تشاركه ومع من تشاركه.',
      span: 2, 
      dark: false,
      visual: 'privacy'
    },
    { 
      icon: 'verified', 
      title: 'أطباء معتمدون', 
      desc: 'فريقنا يضم نخبة من المتخصصين المرخصين الذين خضعوا لتدقيق صارم لضمان جودة الرعاية.',
      span: 1, 
      dark: true,
      visual: 'doctors'
    },
    { 
      icon: 'diversity_3', 
      title: 'مجتمع داعم', 
      desc: 'تواصل مع أشخاص يمرون بتجارب مشابهة في مساحات نقاشية آمنة ومراقبة باحترافية.',
      span: 1, 
      dark: false, 
      accent: true,
      visual: 'community'
    },
    { 
      icon: 'forum', 
      title: 'محادثات آمنة ومشفرة', 
      desc: 'جلسات فردية فورية عبر رسائل نصية أو صوتية مشفرة تضمن لك الراحة في أي وقت وأي مكان.',
      span: 2, 
      dark: false,
      visual: 'chat'
    },
    { 
      icon: 'self_improvement', 
      title: 'محتوى تعليمي مخصص', 
      desc: 'مقالات وأدوات تفاعلية تساعدك على فهم مشاعرك وتطوير مهاراتك في التعامل مع الضغوط.',
      span: 1, 
      dark: false, 
      accent: true,
      visual: 'learn'
    },
  ];

  const steps = [
    { step: '١', title: 'سجّل حسابك', desc: 'أنشئ حسابك في ثوانٍ. لا نحتاج لهويتك الحقيقية لتبدأ رحلتك.', icon: 'person_add' },
    { step: '٢', title: 'اكتشف وشارك', desc: 'ابحث عن الطبيب المناسب أو شارك في المجتمعات المفتوحة والداعمة.', icon: 'explore' },
    { step: '٣', title: 'تواصل وتعافَ', desc: 'ابدأ رحلة العلاج مع متخصص يدعمك في كل خطوة نحو السلام النفسي.', icon: 'volunteer_activism' },
  ];

  const security = [
    { icon: 'enhanced_encryption', title: 'تشفير كامل للبيانات', desc: 'نستخدم بروتوكولات تشفير متقدمة لضمان أن لا أحد غيرك وطبيبك يمكنه الوصول لمحادثاتك.' },
    { icon: 'masks', title: 'هوية مخفية تماماً', desc: 'لك كامل الحرية في اختيار اسم مستعار وعدم مشاركة أي تفاصيل شخصية تكشف هويتك.' },
    { icon: 'workspace_premium', title: 'خبراء موثوقون', desc: 'كل مقدم خدمة على المنصة يتم التحقق من تراخيصه المهنية وخبراته العملية بدقة.' },
  ];

  const testimonials = [
    { text: 'وجدت هنا الأمان والسرية اللي كنت بدور عليها. الطبيب اللي تواصلت معاه كان مستمع رائع وساعدني كتير.', name: 'مستخدم هادئ', time: 'منذ شهرين', initials: 'م', color: 'bg-wesal-dark' },
    { text: 'مجتمع وصال خلاني أحس إني مش لوحدي. النقاشات الجماعية مفيدة جداً وتحت إشراف متخصصين.', name: 'صديق وصال', time: 'منذ ٥ أشهر', initials: 'ص', color: 'bg-wesal-medium' },
    { text: 'التجربة سهلة ومريحة جداً. ما تخيلتش إن الحصول على استشارة نفسية ممكن يكون بالسهولة والخصوصية دي.', name: 'باحث عن الهدوء', time: 'منذ سنة', initials: 'ب', color: 'bg-wesal-sky' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-wesal-cream text-wesal-navy overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 h-14 ${scrolled ? 'glass-panel shadow-lg shadow-wesal-navy/5' : 'bg-transparent'}`}>
        <nav className="flex justify-between items-center px-4 sm:px-6 lg:px-10 w-full h-full max-w-[1400px] mx-auto">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className={`relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-500 ${scrolled ? '' : 'ring-1 ring-white/20'}`}>
              <Image src="/logo.png" alt="وصال" fill className="object-cover" />
            </div>
            <span className={`text-lg font-bold tracking-tight transition-colors duration-500 ${scrolled ? 'text-wesal-dark' : 'text-white'}`}>وصال</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {['الرئيسية', 'المجتمع', 'الأطباء', 'المقالات'].map((item, i) => (
              <a key={item} href="#" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${i === 0 ? (scrolled ? 'text-wesal-dark bg-wesal-ice/60' : 'text-white bg-white/15') : (scrolled ? 'text-wesal-medium hover:text-wesal-dark hover:bg-wesal-ice/40' : 'text-white/70 hover:text-white hover:bg-white/10')}`}>{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className={`hidden sm:inline-flex px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${scrolled ? 'text-wesal-dark hover:bg-wesal-ice/50' : 'text-white hover:bg-white/10'}`}>تسجيل الدخول</Link>
            <Link href="/register" className={`px-4 sm:px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg ${scrolled ? 'bg-wesal-dark text-white shadow-wesal-dark/20 hover:bg-wesal-navy' : 'bg-white text-wesal-dark shadow-black/10 hover:bg-white/90'}`}>ابدأ الآن</Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`md:hidden p-2 rounded-xl transition-all duration-300 ${scrolled ? 'text-wesal-dark hover:bg-wesal-ice/50' : 'text-white hover:bg-white/10'}`} aria-label="القائمة">
              <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-wesal-ice/50 animate-fade-in-up">
            <div className="px-4 py-4 space-y-1">
              {['الرئيسية', 'المجتمع', 'الأطباء', 'المقالات'].map((item, i) => (
                <a key={item} href="#" className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${i === 0 ? 'text-wesal-dark bg-wesal-ice/60' : 'text-wesal-medium hover:text-wesal-dark hover:bg-wesal-ice/40'}`} onClick={() => setMobileMenuOpen(false)}>{item}</a>
              ))}
              <div className="pt-2 border-t border-wesal-ice/50 mt-2">
                <Link href="/login" className="block px-4 py-3 rounded-xl text-sm font-semibold text-wesal-dark hover:bg-wesal-ice/40 transition-colors" onClick={() => setMobileMenuOpen(false)}>تسجيل الدخول</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pt-14">
        {/* ══════════ HERO ══════════ */}
        <section className="gradient-hero relative min-h-[92vh] flex items-center overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="hidden lg:block absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-white/[0.03] animate-float-slow" />
            <div className="hidden lg:block absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-wesal-sky/10 animate-float" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-wesal-sky/5 rounded-full blur-[120px]" />
            {/* Decorative dots pattern */}
            <div className="hidden lg:block absolute top-20 left-[15%] opacity-[0.07]">
              <svg width="120" height="120" viewBox="0 0 120 120">
                {Array.from({ length: 25 }).map((_, i) => (
                  <circle key={i} cx={(i % 5) * 30 + 15} cy={Math.floor(i / 5) * 30 + 15} r="2" fill="white" />
                ))}
              </svg>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-20">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="text-right animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-1.5 mb-6">
                  <span className="material-symbols-outlined filled text-wesal-ice text-sm">verified</span>
                  <span className="text-white/80 text-xs font-medium">منصة معتمدة طبياً</span>
                </div>
                <h1 className="text-[clamp(2rem,5.5vw,3.25rem)] font-extrabold text-white mb-6 leading-[1.3] tracking-tight">
                  مساحتك الآمنة<br /><span className="text-wesal-ice">للصحة النفسية</span>
                </h1>
                <p className="text-base sm:text-lg text-white/75 mb-10 max-w-xl leading-relaxed">
                  نوفّر لك بيئة سرية تماماً للتعبير عن نفسك والتواصل مع خبراء متخصصين. خصوصيتك هي أولويتنا القصوى في رحلة تعافيك.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold bg-white text-wesal-dark rounded-2xl shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                    ابدأ مجاناً الآن
                  </Link>
                  <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold border-2 border-white/25 text-white rounded-2xl hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                    عندي حساب
                  </Link>
                </div>
                <div className="mt-10 flex flex-wrap gap-5 items-center">
                  {[
                    { icon: 'lock', text: 'مشفّر بالكامل' },
                    { icon: 'visibility_off', text: 'مجهول الهوية' },
                    { icon: 'verified_user', text: 'خصوصية تامة' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-1.5 text-white/60 text-xs sm:text-sm">
                      <span className="material-symbols-outlined filled text-wesal-ice text-base">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Hero Visual: Phone Mockup with App Preview ── */}
              <div className="hidden lg:flex items-center justify-center relative">
                <div className="relative w-full max-w-[440px]">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-wesal-sky/10 rounded-[3rem] blur-[80px]" />
                  
                  {/* Phone mockup */}
                  <div className="relative z-10">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-3 shadow-2xl">
                      <div className="bg-white/95 rounded-[2rem] overflow-hidden">
                        {/* Status bar */}
                        <div className="flex justify-between items-center px-6 pt-4 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6 rounded-lg overflow-hidden">
                              <Image src="/logo.png" alt="وصال" fill className="object-cover" />
                            </div>
                            <span className="text-xs font-bold text-wesal-dark">وصال</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-wesal-sky" />
                            <div className="w-2 h-2 rounded-full bg-wesal-ice" />
                            <div className="w-2 h-2 rounded-full bg-wesal-medium" />
                          </div>
                        </div>
                        
                        {/* Content preview */}
                        <div className="px-5 pb-6 pt-2">
                          {/* Greeting */}
                          <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-wesal-dark to-wesal-medium flex items-center justify-center">
                              <span className="text-white text-xs font-bold">م</span>
                            </div>
                            <div>
                              <p className="text-[11px] text-wesal-medium">صباح الخير 👋</p>
                              <p className="text-[13px] font-bold text-wesal-dark">كيف حالك اليوم؟</p>
                            </div>
                          </div>
                          
                          {/* Quick actions */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {[
                              { emoji: '💬', label: 'محادثة', bg: 'from-wesal-dark to-wesal-medium' },
                              { emoji: '👨‍⚕️', label: 'استشارة', bg: 'from-wesal-sky to-wesal-medium' },
                              { emoji: '📝', label: 'مقالات', bg: 'from-wesal-ice to-wesal-sky/50' },
                            ].map((action) => (
                              <div key={action.label} className={`bg-gradient-to-br ${action.bg} rounded-2xl p-3 text-center`}>
                                <div className="text-xl mb-1">{action.emoji}</div>
                                <div className="text-[10px] font-semibold text-white">{action.label}</div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Post card preview */}
                          <div className="bg-wesal-cream/80 rounded-2xl p-3.5">
                            <div className="flex items-center gap-2 mb-2.5">
                              <div className="w-7 h-7 rounded-full bg-wesal-ice flex items-center justify-center">
                                <span className="text-wesal-dark text-[10px] font-bold">ن</span>
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-wesal-dark">نورا أحمد</p>
                                <p className="text-[9px] text-wesal-medium">منذ ٣ ساعات</p>
                              </div>
                            </div>
                            <p className="text-[11px] text-wesal-navy leading-relaxed mb-2.5">اليوم كان يوم صعب، لكنني تعلمت تقنية التنفس العميق وساعدتني كثيراً في الهدوء 🌿</p>
                            <div className="flex items-center gap-4 text-[10px] text-wesal-medium">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined filled text-red-400" style={{ fontSize: '14px' }}>favorite</span>
                                ٢٤
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat_bubble</span>
                                ٨
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating decorative elements */}
                    <div className="absolute -top-4 -right-4 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-3 animate-float shadow-lg">
                      <span className="material-symbols-outlined filled text-wesal-ice text-2xl">psychology</span>
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-3 animate-float-slow shadow-lg">
                      <span className="material-symbols-outlined filled text-wesal-ice text-2xl">favorite</span>
                    </div>
                    <div className="absolute top-1/2 -left-8 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-2.5 animate-float stagger-2 shadow-lg">
                      <span className="material-symbols-outlined filled text-wesal-ice text-lg">shield</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 50C240 90 480 10 720 50C960 90 1200 10 1440 50V100H0V50Z" fill="#f8f5f0" />
            </svg>
          </div>
        </section>

        {/* ══════════ STATS ══════════ */}
        <section className="relative z-20 max-w-[1200px] mx-auto px-4 sm:px-6 -mt-8 md:-mt-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, i) => (
              <FadeInSection key={stat.label} delay={`${i * 100}ms`} className="h-full">
                <div className="glass-card rounded-2xl p-5 sm:p-7 text-center h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                  <div className="w-11 h-11 rounded-xl bg-wesal-ice/80 flex items-center justify-center mx-auto mb-3 group-hover:bg-wesal-dark group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-wesal-dark group-hover:text-white transition-colors duration-300">{stat.icon}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-wesal-dark mb-0.5">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-semibold text-wesal-medium">{stat.label}</div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section className="py-20 md:py-28 max-w-[1200px] mx-auto px-4 sm:px-6">
          <FadeInSection className="text-center mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 bg-wesal-ice rounded-full px-4 py-1.5 mb-5">
              <span className="material-symbols-outlined text-wesal-dark text-sm">auto_awesome</span>
              <span className="text-wesal-dark text-xs font-semibold">المميزات</span>
            </div>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold text-wesal-dark mb-4">ليه تختار <span className="text-wesal-medium">وصال</span>؟</h2>
            <p className="text-base text-wesal-medium max-w-2xl mx-auto leading-relaxed">صمّمنا المنصة لتكون ملاذك الآمن الذي يجمع بين التكنولوجيا المتطورة والخبرة البشرية العميقة.</p>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <FadeInSection key={f.title} delay={`${i * 80}ms`} className={f.span === 2 ? 'md:col-span-2' : ''}>
                <div className={`h-full rounded-2xl p-7 sm:p-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden ${f.dark ? 'gradient-primary text-white shadow-lg shadow-wesal-dark/20' : f.accent ? 'bg-wesal-ice/50 border border-wesal-ice hover:border-wesal-sky/40' : 'bg-white border border-wesal-ice hover:border-wesal-sky/30 shadow-sm'}`}>
                  {/* Decorative background for dark cards */}
                  {f.dark && (
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-[60px]" />
                  )}
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${f.dark ? 'bg-white/15 group-hover:bg-white/25' : f.accent ? 'bg-wesal-dark/10 group-hover:bg-wesal-dark group-hover:text-white' : 'bg-wesal-ice group-hover:bg-wesal-dark group-hover:text-white'}`}>
                      <span className={`material-symbols-outlined text-xl transition-colors duration-300 ${f.dark ? 'text-white' : 'text-wesal-dark group-hover:text-white'}`}>{f.icon}</span>
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${f.dark ? 'text-white' : 'text-wesal-navy'}`}>{f.title}</h3>
                    <p className={`text-sm sm:text-base leading-relaxed ${f.dark ? 'text-white/75' : 'text-wesal-medium'}`}>{f.desc}</p>
                  </div>
                  {/* Large watermark icon for wide cards */}
                  {f.span === 2 && !f.dark && (
                    <div className="absolute bottom-0 left-0 opacity-[0.04] pointer-events-none">
                      <span className="material-symbols-outlined text-[140px] text-wesal-dark">{f.icon}</span>
                    </div>
                  )}
                  {/* Decorative shape for accent cards */}
                  {f.accent && (
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-wesal-sky/10 rounded-full blur-2xl pointer-events-none" />
                  )}
                </div>
              </FadeInSection>
            ))}
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section className="py-20 md:py-28 gradient-warm relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-wesal-ice/50 blur-[80px]" />
            <div className="hidden lg:block absolute bottom-10 left-[15%] opacity-[0.06]">
              <svg width="100" height="100" viewBox="0 0 100 100">
                {Array.from({ length: 16 }).map((_, i) => (
                  <circle key={i} cx={(i % 4) * 28 + 10} cy={Math.floor(i / 4) * 28 + 10} r="3" fill="#004346" />
                ))}
              </svg>
            </div>
          </div>
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6">
            <FadeInSection className="text-center mb-14 md:mb-20">
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 mb-5 shadow-sm">
                <span className="material-symbols-outlined text-wesal-dark text-sm">route</span>
                <span className="text-wesal-dark text-xs font-semibold">كيف نعمل</span>
              </div>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold text-wesal-dark mb-4">خطواتك نحو <span className="text-wesal-medium">السلام النفسي</span></h2>
            </FadeInSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
              <div className="hidden md:block absolute top-[52px] left-[20%] right-[20%] h-[2px]" style={{ background: 'repeating-linear-gradient(to left, #d6f3f4 0, #d6f3f4 8px, transparent 8px, transparent 16px)' }} aria-hidden="true" />
              {steps.map((item, i) => (
                <FadeInSection key={item.step} delay={`${i * 150}ms`}>
                  <div className="relative text-center group">
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <div className="w-[104px] h-[104px] rounded-full bg-white shadow-lg shadow-wesal-dark/5 flex items-center justify-center group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
                        <span className="material-symbols-outlined text-wesal-dark text-4xl">{item.icon}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-wesal-dark text-white flex items-center justify-center text-sm font-bold shadow-md">{item.step}</div>
                      <div className="absolute inset-0 rounded-full border-2 border-wesal-dark/10 animate-pulse-glow" />
                    </div>
                    <h3 className="text-xl font-bold text-wesal-dark mb-3">{item.title}</h3>
                    <p className="text-sm text-wesal-medium leading-relaxed max-w-[260px] mx-auto">{item.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ SECURITY ══════════ */}
        <section className="py-20 md:py-28 max-w-[1200px] mx-auto px-4 sm:px-6">
          <FadeInSection className="text-center mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 bg-wesal-ice rounded-full px-4 py-1.5 mb-5">
              <span className="material-symbols-outlined text-wesal-dark text-sm">gpp_good</span>
              <span className="text-wesal-dark text-xs font-semibold">الأمان والخصوصية</span>
            </div>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold text-wesal-dark mb-4">أمانك هو <span className="text-wesal-medium">أولويتنا</span></h2>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {security.map((item, i) => (
              <FadeInSection key={item.title} delay={`${i * 100}ms`}>
                <div className="h-full bg-white rounded-2xl p-8 border border-wesal-ice hover:border-wesal-sky/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute -bottom-4 -left-4 opacity-[0.04] pointer-events-none">
                    <span className="material-symbols-outlined text-[100px] text-wesal-dark">{item.icon}</span>
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-wesal-ice to-wesal-cream flex items-center justify-center mb-5 group-hover:from-wesal-dark group-hover:to-wesal-medium transition-all duration-500">
                      <span className="material-symbols-outlined text-wesal-dark text-2xl group-hover:text-white transition-colors duration-500">{item.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-wesal-dark mb-3">{item.title}</h3>
                    <p className="text-sm text-wesal-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </section>

        {/* ══════════ TESTIMONIALS ══════════ */}
        <section className="py-20 md:py-28 gradient-warm relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-wesal-ice to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-wesal-ice to-transparent" />
          </div>
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6">
            <FadeInSection className="text-center mb-14 md:mb-20">
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 mb-5 shadow-sm">
                <span className="material-symbols-outlined text-wesal-dark text-sm">format_quote</span>
                <span className="text-wesal-dark text-xs font-semibold">شهادات المستخدمين</span>
              </div>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold text-wesal-dark mb-4">قصص نجاح من <span className="text-wesal-medium">مجتمعنا</span></h2>
            </FadeInSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((review, i) => (
                <FadeInSection key={i} delay={`${i * 120}ms`}>
                  <div className="h-full bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-wesal-ice hover:shadow-lg hover:-translate-y-1 transition-all duration-500 flex flex-col">
                    <div className="flex gap-0.5 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="material-symbols-outlined filled text-amber-400" style={{ fontSize: '20px' }}>star</span>
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-wesal-navy leading-relaxed flex-1 mb-6">&ldquo;{review.text}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-5 border-t border-wesal-ice">
                      <div className={`w-10 h-10 rounded-full ${review.color} text-white flex items-center justify-center text-sm font-bold`}>{review.initials}</div>
                      <div>
                        <div className="text-sm font-bold text-wesal-dark">{review.name}</div>
                        <div className="text-xs text-wesal-medium">{review.time}</div>
                      </div>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section className="py-20 md:py-28 max-w-[1200px] mx-auto px-4 sm:px-6">
          <FadeInSection>
            <div className="gradient-hero rounded-[2rem] sm:rounded-[2.5rem] p-10 sm:p-16 md:p-20 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/[0.04] animate-float" />
                <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-wesal-sky/10 animate-float-slow stagger-3" />
              </div>
              <div className="relative z-10">
                {/* Logo in CTA */}
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-8 shadow-xl ring-4 ring-white/10">
                  <Image src="/logo.png" alt="وصال" fill className="object-cover" />
                </div>
                <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold text-white mb-6 leading-tight">جاهز تبدأ رحلتك<br />نحو <span className="text-wesal-ice">السلام النفسي</span>؟</h2>
                <p className="text-base sm:text-lg text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">نحن هنا لندعمك في كل خطوة. ابدأ أولى خطواتك نحو حياة نفسية أكثر اتزاناً وسلاماً.</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/register" className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-bold bg-white text-wesal-dark rounded-2xl shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                    سجّل مجاناً الآن
                  </Link>
                  <Link href="/login" className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-semibold border-2 border-white/25 text-white rounded-2xl hover:bg-white/10 hover:border-white/40 transition-all duration-300">عندي حساب</Link>
                </div>
              </div>
            </div>
          </FadeInSection>
        </section>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-wesal-navy text-white mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src="/logo.png" alt="وصال" fill className="object-cover" />
                </div>
                <span className="text-xl font-bold">وصال</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed max-w-[260px]">منصة رقمية متكاملة تهدف لرفع الوعي بالصحة النفسية وتوفير سبل الدعم الاحترافية بسرية تامة.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-5">روابط سريعة</h4>
              <ul className="space-y-3">
                {['عن المنصة', 'كيف نعمل', 'الأطباء', 'الأسئلة الشائعة'].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-white/50 hover:text-white transition-colors duration-300">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-5">قانوني</h4>
              <ul className="space-y-3">
                {['سياسة الخصوصية', 'شروط الاستخدام', 'اتفاقية السرية'].map((item) => (
                  <li key={item}><a href="#" className="text-sm text-white/50 hover:text-white transition-colors duration-300">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-5">تواصل معنا</h4>
              <div className="flex gap-3 mb-6">
                {[
                  { icon: 'mail', label: 'بريد' },
                  { icon: 'share', label: 'مشاركة' },
                  { icon: 'language', label: 'لغة' },
                ].map((item) => (
                  <a key={item.icon} href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors duration-300" aria-label={item.label}>
                    <span className="material-symbols-outlined text-lg text-white/60">{item.icon}</span>
                  </a>
                ))}
              </div>
              <p className="text-sm text-white/50">info@wesal.com</p>
            </div>
          </div>
          <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-6 rounded-lg overflow-hidden">
                <Image src="/logo.png" alt="وصال" fill className="object-cover opacity-60" />
              </div>
              <p className="text-xs text-white/40">© ٢٠٢٤ وصال (Wesal). جميع الحقوق محفوظة.</p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="material-symbols-outlined text-wesal-ice text-sm filled">verified</span>
              <span className="text-xs text-white/40">معتمد طبياً</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Page — routes to Community (logged-in) or Landing (guest)
   ═══════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <div className="text-center animate-fade-in-up">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 shadow-xl ring-4 ring-white/10">
            <Image src="/logo.png" alt="وصال" fill className="object-cover" />
          </div>
          <div className="text-2xl font-extrabold text-white mb-1 tracking-tight">وصال</div>
          <div className="text-white/40 text-xs tracking-[0.3em] font-medium">WESAL</div>
          <div className="mt-6 w-16 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-wesal-ice rounded-full animate-shimmer w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <MainLayout>
        <CommunityFeed user={user} />
      </MainLayout>
    );
  }

  return <LandingPage />;
}
