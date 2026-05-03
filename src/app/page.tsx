'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  ArrowLeft,
  UserPlus,
  Headphones,
  Sparkles,
  Fingerprint,
} from 'lucide-react';

/* ─── Fade-in animation helper ─── */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
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
      <div className="flex min-h-screen items-center justify-center bg-teal-600">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-6xl font-bold text-white mb-2">وصال</div>
          <div className="text-teal-200 text-base">wesal</div>
        </motion.div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ═══════════ 1. NAVBAR ═══════════ */}
      <header className="fixed top-0 right-0 left-0 z-50 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-teal-600">وصال</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button
              size="sm"
              className="bg-teal-600 text-white hover:bg-teal-700"
              asChild
            >
              <Link href="/register">إنشاء حساب</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════ 2. HERO ═══════════ */}
      <section className="bg-teal-600 pt-28 pb-20 sm:pt-32 sm:pb-28">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
            <Badge className="mb-6 bg-white/15 text-white border-white/20 hover:bg-white/20">
              <Sparkles className="h-3.5 w-3.5 ml-1" />
              مجتمع الصحة النفسية الأول عربياً
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl leading-tight"
          >
            مساحتك الآمنة للصحة النفسية
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 max-w-lg mx-auto text-base text-teal-100 sm:text-lg leading-relaxed"
          >
            شارك أفكارك ومشاعرك بأمان تام. تواصل مع أطباء موثوقين في مجتمع
            يفهمك ويدعمك.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              className="bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-xl px-8 shadow-lg"
              asChild
            >
              <Link href="/register" className="flex items-center gap-2">
                ابدأ دلوقتي مجاناً
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white bg-white/5 hover:bg-white/10 hover:text-white rounded-xl px-8"
              asChild
            >
              <Link href="/login">عندي حساب</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-teal-200"
          >
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>مشفر بالكامل</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-teal-300" />
            <div className="flex items-center gap-1.5">
              <EyeOff className="h-3.5 w-3.5" />
              <span>هوية مخفية</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-teal-300" />
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>خصوصية تامة</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 3. STATS ═══════════ */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Card className="bg-white text-center py-6 sm:py-8 hover:shadow-md transition-shadow">
                  <CardContent className="flex flex-col items-center gap-3 px-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-teal-600">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 4. FEATURES ═══════════ */}
      <section className="py-14 sm:py-20" id="features">
        <div className="mx-auto max-w-6xl px-5">
          <motion.div {...fadeUp} className="text-center mb-10 sm:mb-14">
            <Badge className="mb-4 bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100">
              <Sparkles className="h-3.5 w-3.5 ml-1" />
              المميزات
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              ليه <span className="text-teal-600">وصال</span> مختلفة؟
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-md mx-auto">
              منصة عربية متكاملة بتركز على خصوصيتك وراحتك النفسية
            </p>
          </motion.div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
            {features.map((feature, i) => (
              <motion.div key={feature.title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Card className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white mb-3">
                      <feature.icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-gray-500 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 5. HOW IT WORKS ═══════════ */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-5">
          <motion.div {...fadeUp} className="text-center mb-10 sm:mb-14">
            <Badge className="mb-4 bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100">
              إزاي تشتغل؟
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              ثلاث خطوات بس
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-md mx-auto">
              ابدأ رحلتك في دقائق معدودة
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.15 }}>
                <Card className="relative bg-white text-center hover:shadow-md transition-shadow">
                  <CardHeader className="pb-0 relative">
                    <div className="absolute top-0 left-0 flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                      {i + 1}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center text-center pt-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-4">
                      <step.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-gray-500 text-sm leading-relaxed max-w-[260px]">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 6. TESTIMONIALS ═══════════ */}
      <section className="bg-teal-700 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <motion.div {...fadeUp}>
            <Badge className="mb-5 bg-white/10 text-teal-100 border-white/15 hover:bg-white/15">
              <Star className="h-3.5 w-3.5 ml-1" />
              آراء المستخدمين
            </Badge>
            <h2 className="text-3xl sm:text-4xl text-white font-bold mb-8 sm:mb-10">
              ناس حقيقية، تجارب حقيقية
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:gap-6 sm:grid-cols-3">
            {testimonials.map((review, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Card className="bg-white/10 border-white/10 text-right hover:bg-white/15 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-0.5 mb-4 justify-start">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="h-4 w-4 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed mb-5">
                      {review.text}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                        <UserPlus className="h-3.5 w-3.5 text-white/60" />
                      </div>
                      <span className="text-xs text-white/50 font-medium">
                        {review.name}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 7. CTA ═══════════ */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-5">
          <motion.div {...fadeUp}>
            <Card className="bg-gradient-to-br from-teal-600 to-teal-800 border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-8 sm:p-12 text-center">
                <h2 className="text-3xl sm:text-4xl text-white font-bold">
                  جاهز تبدأ رحلتك؟
                </h2>
                <p className="mt-4 text-teal-100 max-w-sm mx-auto leading-relaxed">
                  انضم لآلاف الأشخاص اللي اختاروا يعتنوا بصحتهم النفسية في مكان آمن وداعم.
                </p>

                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-xl px-8 shadow-lg"
                    asChild
                  >
                    <Link href="/register" className="flex items-center gap-2">
                      ابدأ دلوقتي مجاناً
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-teal-200 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>مجاني بالكامل</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-teal-300 hidden sm:block" />
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>بدون بطاقة ائتمان</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ 8. FOOTER ═══════════ */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50">
                <Heart className="h-4 w-4 text-teal-600" />
              </div>
              <span className="text-lg font-bold text-teal-600">وصال</span>
              <span className="text-xs text-gray-400">wesal</span>
            </div>

            <div className="text-xs text-gray-400">
              مجتمع الصحة النفسية العربي
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="hover:text-teal-600 cursor-pointer transition-colors">
                سياسة الخصوصية
              </span>
              <span className="hover:text-teal-600 cursor-pointer transition-colors">
                شروط الاستخدام
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-center text-xs text-gray-300">
            جميع المحادثات مشفرة ومحمية. هويتك في أمان تام.
          </div>
        </div>
      </footer>
    </div>
  );
}
