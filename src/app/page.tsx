'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  EyeOff,
  Heart,
  MessageCircle,
  Users,
  Stethoscope,
  Star,
  CheckCircle,
  ArrowRight,
  UserPlus,
  Headphones,
  Sparkles,
  Fingerprint,
} from 'lucide-react';

/* ─── Animation Variants ─── */
const fadeInUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
};

const stagger = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
};

/* ─── Data ─── */
const stats = [
  { icon: Users, value: '1,000+', label: 'مستخدم نشط' },
  { icon: Stethoscope, value: '+50', label: 'طبيب معتمد' },
  { icon: MessageCircle, value: '+100', label: 'مشاركة يومياً' },
  { icon: Star, value: '98%', label: 'رضا المستخدمين' },
];

const features = [
  {
    icon: Fingerprint,
    title: 'خصوصية تامة',
    desc: 'شارك بأمان مع إخفاء هويتك بالكامل. اسمك الحقيقي مش بيظهر لأي حد.',
  },
  {
    icon: Stethoscope,
    title: 'أطباء موثوقين',
    desc: 'تواصل مع أطباء نفسيين معتمدين وموثقين. كل الأطباء بيتم التحقق من مؤهلاتهم.',
  },
  {
    icon: Heart,
    title: 'مجتمع داعم',
    desc: 'تفاعل مع ناس بتمر بنفس التجارب. أنت مش لوحدي في رحلتك.',
  },
  {
    icon: MessageCircle,
    title: 'محادثات آمنة',
    desc: 'شات خاص وآمن مع الدكتور. كل المحادثات مشفرة بالكامل.',
  },
];

const steps = [
  {
    icon: UserPlus,
    title: 'سجّل حسابك',
    desc: 'اعمل حساب باسم مستعار في ثواني. بدون بيانات حقيقية.',
  },
  {
    icon: MessageCircle,
    title: 'شارك وتفاعل',
    desc: 'اكتب وعلّق وادعم الناس. شارك تجربتك واقرأ تجارب تانية.',
  },
  {
    icon: Headphones,
    title: 'تواصل مع دكتور',
    desc: 'احجز موعد وتكلم مع دكتور معتمد في خصوصية تامة.',
  },
];

const trustItems = [
  {
    icon: Lock,
    title: 'تشفير كامل',
    desc: 'كل المحادثات والبيانات مشفرة بالكامل. محدش يقدر يوصل لمعلوماتك.',
  },
  {
    icon: EyeOff,
    title: 'هوية مخفية',
    desc: 'اسمك الحقيقي مش بيظهر لأي حد. اختار اسم مستعار وشارك براحتك.',
  },
  {
    icon: CheckCircle,
    title: 'أطباء موثوقين',
    desc: 'كل الأطباء موثقين ومعتمدين. نتأكد من مؤهلاتهم قبل ما يظهروا.',
  },
];

const testimonials = [
  {
    text: 'أخيراً لقيت مكان أقدر أتكلم فيه من غير خوف. وصال غيرت حياتي وخلاني أفهم نفسي أكتر.',
    name: 'مستخدم مجهول',
  },
  {
    text: 'الدكتور كان محترم جداً وفهم حالتي. المحادثة كانت آمنة تماماً وحسيت براحة كبيرة.',
    name: 'مستخدم مجهول',
  },
  {
    text: 'المجتمع هنا داعم جداً. حسيت إني مش لوحدي في اللي بمر بيه. شكراً ليكم.',
    name: 'مستخدم مجهول',
  },
];

/* ─── Component ─── */
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
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-6xl font-bold text-white mb-3 font-heading">وصال</div>
          <div className="text-accent/80 text-base tracking-wide">wesal</div>
        </motion.div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════
          1. NAVBAR — Fixed glass effect
          ═══════════════════════════════════════════════════════ */}
      <header className="fixed top-0 right-0 left-0 z-50 glass border-b border-border/30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-border/30">
              <Heart className="h-[18px] w-[18px] text-primary" />
            </div>
            <span className="text-xl font-bold text-primary font-heading">وصال</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost text-sm">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="btn btn-primary text-sm">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          2. HERO — Gradient background with decorative blurs
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 sm:pt-32 pb-0">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero" />

        {/* Decorative blurred circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-[-80px] w-[500px] h-[500px] bg-primary-200/15 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-400/8 rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-3xl px-5 pt-8 pb-20 sm:pt-12 sm:pb-28 text-center">
          {/* Badge pill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/15"
          >
            <Sparkles className="h-4 w-4 text-accent-200" />
            <span className="text-sm text-white/90 font-medium">
              مجتمع الصحة النفسية الأول عربياً
            </span>
          </motion.div>

          {/* Big heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl font-black text-white sm:text-5xl md:text-6xl leading-[1.2] tracking-tight font-heading"
          >
            مساحتك الآمنة
            <br />
            <span className="gradient-text-accent">للصحة النفسية</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 max-w-lg mx-auto text-base text-white/65 sm:text-lg leading-relaxed"
          >
            شارك أفكارك ومشاعرك بأمان تام. تواصل مع أطباء موثوقين في مجتمع
            يفهمك ويدعمك.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5"
          >
            <Link href="/register">
              <button className="btn btn-lg group flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 font-bold text-primary-900 shadow-xl shadow-black/20 hover:scale-[1.03] transition-transform">
                ابدأ دلوقتي مجاناً
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/login">
              <button className="btn btn-lg flex items-center justify-center gap-2 rounded-2xl border-2 border-white/20 bg-white/5 px-8 font-semibold text-white/90 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all">
                عندي حساب
              </button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-white/45"
          >
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>مشفر بالكامل</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-1.5">
              <EyeOff className="h-3.5 w-3.5" />
              <span>هوية مخفية</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>خصوصية تامة</span>
            </div>
          </motion.div>
        </div>

        {/* SVG wave divider */}
        <div className="relative">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block"
            aria-hidden="true"
          >
            <path
              d="M0 120L48 108C96 96 192 72 288 60C384 48 480 48 576 54C672 60 768 72 864 78C960 84 1056 84 1152 78C1248 72 1344 60 1392 54L1440 48V120H0Z"
              fill="#F8F9FB"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. STATS — 4 stat cards in grid
          ═══════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card flex flex-col items-center p-6 sm:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold gradient-text-primary font-heading">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4. FEATURES — 4 feature cards in 2-col grid
          ═══════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20" id="features">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-14">
            <span className="badge badge-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              المميزات
            </span>
            <h2 className="text-h1 sm:text-display font-heading text-foreground">
              ليه <span className="gradient-text-primary">وصال</span> مختلفة؟
            </h2>
            <p className="mt-3 text-body-lg text-muted-foreground max-w-md mx-auto">
              منصة عربية متكاملة بتركز على خصوصيتك وراحتك النفسية
            </p>
          </motion.div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card card-interactive group p-6 sm:p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-white shadow-sm mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-h4 font-heading text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-body-md text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. HOW IT WORKS — 3 step cards
          ═══════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 bg-muted/40">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-14">
            <span className="badge badge-primary mb-4">إزاي تشتغل؟</span>
            <h2 className="text-h1 sm:text-display font-heading text-foreground">
              ثلاث خطوات بس
            </h2>
            <p className="mt-3 text-body-lg text-muted-foreground max-w-md mx-auto">
              ابدأ رحلتك في دقائق معدودة
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="card relative flex flex-col items-center text-center p-6 sm:p-7"
              >
                {/* Step number badge */}
                <div className="absolute top-4 left-4 flex h-7 w-7 items-center justify-center rounded-full gradient-primary text-xs font-bold text-white">
                  {i + 1}
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-h4 font-heading text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-body-md text-muted-foreground leading-relaxed max-w-[240px]">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          6. TRUST / SECURITY — 3 cards
          ═══════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-14">
            <span className="badge badge-primary mb-4">
              <Shield className="h-3.5 w-3.5" />
              الأمان والخصوصية
            </span>
            <h2 className="text-h1 sm:text-display font-heading text-foreground">
              خصوصيتك أولويتنا
            </h2>
            <p className="mt-3 text-body-lg text-muted-foreground max-w-md mx-auto">
              أخذنا كل الاحتياطات عشان تحس بالأمان الكامل
            </p>
          </motion.div>

          <div className="grid gap-5 sm:gap-6 sm:grid-cols-3">
            {trustItems.map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card card-interactive flex flex-col items-center text-center p-6 sm:p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-white shadow-sm mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-h4 font-heading text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-body-md text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          7. TESTIMONIALS — 3 cards on dark gradient background
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        {/* Dark gradient background */}
        <div className="absolute inset-0 gradient-hero" />
        {/* Decorative blurs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-[-40px] w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-[-60px] w-80 h-80 bg-primary-200/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 text-center">
          <motion.div {...fadeInUp}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-accent-200 mb-5 border border-white/10 backdrop-blur-sm">
              <Star className="h-3.5 w-3.5" />
              آراء المستخدمين
            </span>
            <h2 className="text-h1 sm:text-display text-white mb-8 sm:mb-10 font-heading">
              ناس حقيقية، تجارب حقيقية
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:gap-6 sm:grid-cols-3">
            {testimonials.map((review, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm text-right hover:bg-white/8 transition-all"
              >
                {/* Star rating */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-white/80 text-body-md leading-relaxed mb-5">
                  {review.text}
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/60">
                    <UserPlus className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-caption text-white/40 font-medium">
                    {review.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          8. CTA — Final call-to-action
          ═══════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <motion.div
            {...fadeInUp}
            className="relative overflow-hidden rounded-2xl gradient-hero p-8 sm:p-12 text-center shadow-2xl"
          >
            {/* Decorative blurs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <div className="absolute top-0 right-[-40px] w-56 h-56 bg-accent/15 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-[-40px] w-40 h-40 bg-primary-200/15 rounded-full blur-[80px]" />
            </div>

            <div className="relative">
              <h2 className="text-h1 sm:text-display text-white font-heading">
                جاهز تبدأ رحلتك؟
              </h2>
              <p className="mt-4 text-body-lg text-white/60 max-w-sm mx-auto leading-relaxed">
                انضم لآلاف الأشخاص اللي اختاروا يعتنوا بصحتهم النفسية في مكان آمن وداعم.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/register">
                  <button className="btn btn-lg group flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 font-bold text-primary-900 shadow-2xl shadow-black/20 hover:scale-[1.03] transition-transform">
                    ابدأ دلوقتي مجاناً
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-white/40 text-xs">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>مجاني بالكامل</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>بدون بطاقة ائتمان</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          9. FOOTER — Simple footer with logo and links
          ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-border/30 bg-card py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-bold text-primary font-heading">وصال</span>
              <span className="text-xs text-muted-foreground/50">wesal</span>
            </div>

            {/* Tagline */}
            <div className="text-caption text-muted-foreground/60">
              مجتمع الصحة النفسية العربي
            </div>

            {/* Links */}
            <div className="flex items-center gap-4 text-caption text-muted-foreground/50">
              <span className="hover:text-primary cursor-pointer transition-colors">
                سياسة الخصوصية
              </span>
              <span className="hover:text-primary cursor-pointer transition-colors">
                شروط الاستخدام
              </span>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground/30">
            جميع المحادثات مشفرة ومحمية. هويتك في أمان تام.
          </div>
        </div>
      </footer>
    </div>
  );
}
