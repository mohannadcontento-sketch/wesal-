'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/community');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <div className="text-center">
          <div className="text-6xl font-bold text-white mb-2">وصال</div>
          <div className="text-white/60 text-base">wesal</div>
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden">

      {/* ═══════════ 1. NAVBAR ═══════════ */}
      <header className="bg-surface-bright/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-teal-100/20 shadow-sm">
        <nav className="flex justify-between items-center px-6 py-4 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-teal-800">وصال</Link>
            <div className="hidden md:flex gap-6 font-medium text-sm text-teal-900">
              <a className="text-teal-700 border-b-2 border-teal-700 pb-1" href="#">الرئيسية</a>
              <a className="text-slate-500 hover:text-teal-600 transition-colors" href="#">المجتمع</a>
              <a className="text-slate-500 hover:text-teal-600 transition-colors" href="#">الأطباء</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 ml-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container transition-colors rounded-lg"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold bg-primary text-on-primary rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                ابدأ الآن
              </Link>
            </div>
            <Link href="/login" className="md:hidden text-slate-500 cursor-pointer hover:text-teal-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </Link>
            <Link href="/login" className="md:hidden text-slate-500 cursor-pointer hover:text-teal-600 transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-[72px]">

        {/* ═══════════ 2. HERO ═══════════ */}
        <section className="gradient-hero relative min-h-[870px] flex items-center overflow-hidden px-6">
          <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-10 items-center relative z-10">
            <div className="text-right">
              <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-white mb-6 leading-tight">
                مساحتك الآمنة للصحة النفسية
              </h1>
              <p className="text-lg text-white/80 mb-10 max-w-xl leading-relaxed">
                نحن نوفر لك بيئة سرية تماماً للتعبير عن نفسك والتواصل مع خبراء متخصصين. خصوصيتك هي أولويتنا القصوى في رحلة تعافيك النفسي.
              </p>
              <div className="flex flex-wrap gap-4 justify-start">
                <Link
                  href="/register"
                  className="px-10 py-4 text-sm font-semibold bg-on-primary-container text-primary-container rounded-full hover:bg-white transition-all shadow-xl shadow-black/10"
                >
                  ابدأ دلوقتي مجاناً
                </Link>
                <Link
                  href="/login"
                  className="px-10 py-4 text-sm font-semibold border-2 border-white/30 text-white rounded-full hover:bg-white/10 transition-all"
                >
                  عندي حساب
                </Link>
              </div>
              <div className="mt-16 flex gap-6 items-center opacity-80">
                <div className="flex items-center gap-1 text-white text-sm">
                  <span className="material-symbols-outlined text-sm filled">lock</span>
                  Encrypted
                </div>
                <div className="flex items-center gap-1 text-white text-sm">
                  <span className="material-symbols-outlined text-sm filled">visibility_off</span>
                  Anonymous
                </div>
                <div className="flex items-center gap-1 text-white text-sm">
                  <span className="material-symbols-outlined text-sm filled">verified_user</span>
                  Privacy
                </div>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur-[100px]" />
              {/* Decorative illustration placeholder */}
              <div className="relative z-10 w-full flex items-center justify-center" style={{ minHeight: 400 }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-6 rounded-2xl text-white">
                    <span className="material-symbols-outlined text-4xl mb-3">psychology</span>
                    <div className="text-sm font-medium">دعم نفسي</div>
                    <div className="text-xs opacity-70 mt-1">متخصصون مرخصون</div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl text-white mt-8">
                    <span className="material-symbols-outlined text-4xl mb-3">favorite</span>
                    <div className="text-sm font-medium">مجتمع آمن</div>
                    <div className="text-xs opacity-70 mt-1">تجارب مشتركة</div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl text-white">
                    <span className="material-symbols-outlined text-4xl mb-3">shield</span>
                    <div className="text-sm font-medium">خصوصية تامة</div>
                    <div className="text-xs opacity-70 mt-1">تشفير كامل</div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl text-white mt-8">
                    <span className="material-symbols-outlined text-4xl mb-3">chat</span>
                    <div className="text-sm font-medium">محادثات آمنة</div>
                    <div className="text-xs opacity-70 mt-1">متاحة 24/7</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ 3. STATS ═══════════ */}
        <section className="py-16 max-w-[1280px] mx-auto px-6 -mt-12 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: '1,000+', label: 'مستخدم نشط' },
              { value: '50+', label: 'طبيب معتمد' },
              { value: '100+', label: 'مقالات داعمة' },
              { value: '98%', label: 'نسبة الرضا' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-container-lowest p-10 rounded-xl border border-outline-variant/30 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-[clamp(1.5rem,3vw,3rem)] font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ 4. FEATURES (BENTO GRID) ═══════════ */}
        <section className="py-16 max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-primary mb-4">
              ليه تختار وصال؟
            </h2>
            <p className="text-base text-secondary max-w-2xl mx-auto leading-relaxed">
              صممنا المنصة لتكون ملاذك الآمن الذي يجمع بين التكنولوجيا المتطورة والخبرة البشرية العميقة.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Privacy (spans 2 cols) */}
            <div className="md:col-span-2 bg-white p-10 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between group hover:border-primary/20 transition-all">
              <div>
                <span className="material-symbols-outlined text-4xl text-primary mb-4">security</span>
                <h3 className="text-2xl font-semibold text-primary mb-2">خصوصية لا تقبل المساومة</h3>
                <p className="text-base text-secondary leading-relaxed">
                  بياناتك مشفرة بالكامل. يمكنك اختيار اسم مستعار والتحكم الكامل فيما تشاركه ومع من تشاركه.
                </p>
              </div>
              <div className="mt-10 h-48 bg-surface-container rounded-lg overflow-hidden relative">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-8xl text-primary/20">lock</span>
                </div>
              </div>
            </div>

            {/* Feature 2: Certified Doctors */}
            <div className="bg-primary text-on-primary p-10 rounded-xl flex flex-col justify-center">
              <span className="material-symbols-outlined text-4xl mb-4">verified</span>
              <h3 className="text-2xl font-semibold mb-2">أطباء معتمدون</h3>
              <p className="text-base opacity-80 leading-relaxed">
                فريقنا يضم نخبة من المتخصصين المرخصين الذين خضعوا لتدقيق صارم لضمان جودة الرعاية المقدمة.
              </p>
            </div>

            {/* Feature 3: Supportive Community */}
            <div className="bg-secondary-container p-10 rounded-xl border border-outline-variant/20 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-on-secondary-container mb-4">groups</span>
              <h3 className="text-2xl font-semibold text-on-secondary-container mb-2">مجتمع داعم</h3>
              <p className="text-base text-on-secondary-container/80 leading-relaxed">
                تواصل مع أشخاص يمرون بتجارب مشابهة في مساحات نقاشية آمنة ومراقبة باحترافية.
              </p>
            </div>

            {/* Feature 4: Safe Chats (spans 2 cols) */}
            <div className="md:col-span-2 bg-white p-10 rounded-xl border border-outline-variant/20 shadow-sm flex items-center gap-6 group hover:border-primary/20 transition-all">
              <div className="w-1/3 min-h-[160px] bg-tertiary-container/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-6xl text-primary">chat_bubble</span>
              </div>
              <div className="w-2/3">
                <h3 className="text-2xl font-semibold text-primary mb-2">محادثات آمنة</h3>
                <p className="text-base text-secondary leading-relaxed">
                  جلسات فردية فورية عبر رسائل نصية أو صوتية مشفرة تضمن لك الراحة في أي وقت وأي مكان.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ 5. HOW IT WORKS ═══════════ */}
        <section className="py-16 bg-surface-container-low">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-primary mb-4">
                خطواتك نحو السلام النفسي
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {[
                {
                  step: '1',
                  title: 'سجل حسابك',
                  desc: 'أنشئ حسابك في ثوانٍ. لا نحتاج لهويتك الحقيقية لتبدأ.',
                },
                {
                  step: '2',
                  title: 'شارك قصتك',
                  desc: 'ابحث عن الطبيب المناسب أو شارك في المجتمعات المفتوحة.',
                },
                {
                  step: '3',
                  title: 'تواصل وتعافى',
                  desc: 'ابدأ رحلة العلاج مع متخصص يدعمك في كل خطوة.',
                },
              ].map((item) => (
                <div key={item.step} className="text-center relative z-10">
                  <div className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-medium text-primary mb-2">{item.title}</h3>
                  <p className="text-base text-secondary leading-relaxed">{item.desc}</p>
                </div>
              ))}
              {/* Connector Line (Hidden on Mobile) */}
              <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-primary/20 -z-0" />
            </div>
          </div>
        </section>

        {/* ═══════════ 6. SECURITY CARDS ═══════════ */}
        <section className="py-16 max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-primary mb-4">
              أمانك أولويتنا القصوى
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'lock_open',
                title: 'تشفير كامل للبيانات',
                desc: 'نستخدم بروتوكولات تشفير عسكرية لضمان أن لا أحد غيرك وطبيبك يمكنه الوصول للمحادثات.',
              },
              {
                icon: 'masks',
                title: 'هوية مخفية تماماً',
                desc: 'لك كامل الحرية في اختيار اسم مستعار وعدم مشاركة أي تفاصيل شخصية تكشف هويتك.',
              },
              {
                icon: 'badge',
                title: 'خبراء موثوقون',
                desc: 'كل مقدم خدمة على المنصة يتم التحقق من تراخيصه المهنية وخبراته العملية بدقة.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-10 rounded-xl border-2 border-primary/5 hover:border-primary/20 transition-all text-right"
              >
                <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <h3 className="text-xl font-medium text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ 7. TESTIMONIALS ═══════════ */}
        <section className="py-16 bg-primary/5">
          <div className="max-w-[1280px] mx-auto px-6">
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-primary text-center mb-16">
              قصص نجاح من مجتمعنا
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  text: '"وجدت هنا الأمان والسرية اللي كنت بدور عليها. الطبيب اللي تواصلت معاه كان مستمع رائع وساعدني كتير."',
                  name: 'مستخدم هادئ',
                  time: 'منذ شهرين',
                  avatarBg: 'bg-secondary-fixed',
                },
                {
                  text: '"مجتمع وصال خلاني أحس إني مش لوحدي. النقاشات الجماعية مفيدة جداً وتحت إشراف متخصصين."',
                  name: 'صديق وصال',
                  time: 'منذ ٥ أشهر',
                  avatarBg: 'bg-tertiary-fixed',
                },
                {
                  text: '"التجربة سهلة ومريحة جداً. ما تخيلتش إن الحصول على استشارة نفسية ممكن يكون بالسهولة والخصوصية دي."',
                  name: 'باحث عن الهدوء',
                  time: 'منذ سنة',
                  avatarBg: 'bg-primary-fixed',
                },
              ].map((review, i) => (
                <div
                  key={i}
                  className="bg-white p-10 rounded-xl shadow-sm border border-outline-variant/10"
                >
                  <div className="flex gap-1 text-yellow-500 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined filled"
                        style={{ fontSize: '20px' }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-base text-primary italic mb-6 leading-relaxed">
                    {review.text}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${review.avatarBg}`} />
                    <div>
                      <div className="text-sm font-semibold text-primary">{review.name}</div>
                      <div className="text-xs text-secondary">{review.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ 8. FINAL CTA ═══════════ */}
        <section className="py-16 max-w-[1280px] mx-auto px-6 text-center">
          <div className="gradient-hero p-16 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="relative z-10">
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-white mb-6">
                جاهز تبدأ رحلتك؟
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
                نحن هنا لندعمك في كل خطوة. ابدأ أولى خطواتك نحو حياة نفسية أكثر اتزاناً اليوم.
              </p>
              <Link
                href="/register"
                className="inline-block px-16 py-4 bg-white text-primary text-xl font-medium rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                سجل مجاناً الآن
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════ 9. FOOTER ═══════════ */}
      <footer className="bg-surface-container py-16 border-t border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="text-2xl font-bold text-teal-800 mb-6">وصال</div>
            <p className="text-sm text-secondary leading-relaxed">
              منصة رقمية متكاملة تهدف لرفع الوعي بالصحة النفسية وتوفير سبل الدعم الاحترافية بسرية تامة.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary mb-6">روابط سريعة</h4>
            <ul className="space-y-4 text-sm text-secondary">
              <li><a className="hover:text-primary transition-colors" href="#">عن المنصة</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">كيف نعمل</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">الأطباء</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">الأسئلة الشائعة</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary mb-6">قانوني</h4>
            <ul className="space-y-4 text-sm text-secondary">
              <li><a className="hover:text-primary transition-colors" href="#">سياسة الخصوصية</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">شروط الاستخدام</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">اتفاقية السرية</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary mb-6">تواصل معنا</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="text-secondary hover:text-primary transition-colors">
                <span className="material-symbols-outlined">mail</span>
              </a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">
                <span className="material-symbols-outlined">share</span>
              </a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">
                <span className="material-symbols-outlined">language</span>
              </a>
            </div>
            <p className="text-sm text-secondary">info@wesal.com</p>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 mt-16 pt-6 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-secondary">© 2024 وصال (Wesal). جميع الحقوق محفوظة.</p>
          <div className="flex gap-4 items-center">
            <span className="material-symbols-outlined text-teal-800 text-sm filled">verified</span>
            <span className="text-xs text-secondary">معتمد طبياً</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
