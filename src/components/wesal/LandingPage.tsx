'use client';

import { Heart, MessageCircle, Brain, Shield, UserPlus, ClipboardList, ArrowLeft, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (page: string) => void;
}

export function LandingPage({ onGetStarted, onNavigate }: LandingPageProps) {
  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-bl from-primary via-[#003638] to-primary/90" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
        </div>

        {/* Floating Hearts Decoration */}
        <div className="absolute top-32 left-[15%] animate-float opacity-20">
          <Heart size={40} className="text-accent" fill="currentColor" />
        </div>
        <div className="absolute top-48 right-[10%] animate-float opacity-15" style={{ animationDelay: '1s' }}>
          <Heart size={28} className="text-secondary" fill="currentColor" />
        </div>
        <div className="absolute bottom-32 left-[25%] animate-float opacity-10" style={{ animationDelay: '2s' }}>
          <Heart size={52} className="text-accent" fill="currentColor" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-right space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/90 text-sm font-medium">مجاني وآمن ومجهول بالكامل</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                رفيقك الذكي
                <br />
                <span className="text-accent">للصحة النفسية</span>
                <br />
                الآمنة
              </h1>

              <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 lg:mr-0 leading-relaxed">
                حيث يلتقي الوعي بالرعاية، والذكاء الاصطناعي بالدعم الإنساني.
                <br />
                مساحة آمنة تتكلم فيها عن مشاعرك من غير ما حد يعرف مين أنت.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6 rounded-2xl shadow-xl shadow-black/20 transition-all hover:scale-105"
                  onClick={onGetStarted}
                >
                  ابدأ رحلتك
                  <ArrowLeft size={20} className="mr-2" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 font-medium text-lg px-8 py-6 rounded-2xl border border-white/20"
                  onClick={() => onNavigate('community')}
                >
                  تعرف على وصال
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">+2,500</p>
                  <p className="text-white/50 text-xs">مستخدم نشط</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">+50</p>
                  <p className="text-white/50 text-xs">دكتور معتمد</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">٤.٨</p>
                  <p className="text-white/50 text-xs flex items-center gap-1">
                    <Star size={12} fill="currentColor" className="text-yellow-400" />
                    تقييم
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                {/* Main Card */}
                <div className="w-80 h-96 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 flex flex-col items-center justify-center gap-6 shadow-2xl">
                  <div className="w-24 h-24 bg-white/15 rounded-full flex items-center justify-center animate-pulse-glow">
                    <Heart size={48} className="text-accent" fill="currentColor" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-white font-bold text-xl">وصال</p>
                    <p className="text-white/60 text-sm">معاك خطوة بخطوة</p>
                  </div>
                  {/* Mini mood indicators */}
                  <div className="flex gap-3">
                    {['😊', '😌', '💭', '💪'].map((emoji, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg animate-float"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Card 1 */}
                <div className="absolute -top-4 -right-8 bg-card rounded-2xl shadow-xl p-3 border border-border animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">
                      🎉
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">مزاجك بيتحسن!</p>
                      <p className="text-[10px] text-muted-foreground">+15% هذا الأسبوع</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute -bottom-4 -left-8 bg-card rounded-2xl shadow-xl p-3 border border-border animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                      💬
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">3 رسائل جديدة</p>
                      <p className="text-[10px] text-muted-foreground">من المجتمع</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 50 1440 40V80H0V40Z" fill="#F8F9FA"/>
          </svg>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent font-bold text-sm tracking-wider">لماذا وصال؟</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">
              مميزات تخلّيك تشعر بالأمان
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              صممنا وصال عشان يكون مكان آمن تدعمك فيه، تتابع حالتك النفسية، وتتواصل مع متخصصين حقيقيين — كل ده ومجهول بالكامل
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MessageCircle,
                emoji: '💬',
                title: 'مجتمع آمن',
                desc: 'مساحة آمنة للتعبير عن مشاعرك مع ناس بيمرون بنفس التجارب. منشورات وتعليقات مفيشة وبدون أحكام.',
                color: 'bg-teal-50 text-teal-600',
              },
              {
                icon: Brain,
                emoji: '🤖',
                title: 'تراكر ذكي',
                desc: 'تتبع مزاجك يومياً وتحليل ذكي بالذكاء الاصطناعي يساعدك تفهم نفسك أكتر وتحس بتقدّم حقيقي.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: ClipboardList,
                emoji: '👨‍⚕️',
                title: 'استشارات متخصصة',
                desc: 'جلسات مع دكاترة معتمدين في مجال الصحة النفسية بسعر رمزي. شات أو صوت — بالخصوصية اللي إنت عايزها.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: Shield,
                emoji: '🆘',
                title: 'أمان ٢٤ ساعة',
                desc: 'بروتوكول طوارئ يعمل على مدار الساعة لحمايتك. زر طوارئ ثابت في كل صفحة ومشرفين مدربين جاهزين.',
                color: 'bg-red-50 text-red-600',
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="group bg-card border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-16 h-16 rounded-2xl ${feature.color} mx-auto flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {feature.emoji}
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent font-bold text-sm tracking-wider">ببساطة</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">
              كيف يعمل وصال؟
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              ثلاث خطوات بس تفصلك عن بداية رحلتك نحو سلامك النفسي
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (desktop) */}
            <div className="hidden md:block absolute top-16 right-[20%] left-[20%] h-0.5 bg-gradient-to-l from-accent/40 via-accent to-accent/40" />

            {[
              {
                step: '١',
                icon: UserPlus,
                title: 'سجّل مجهولاً',
                desc: 'بدون اسم حقيقي أو صورة. بس رقم موبايل يتشفر فوراً. خصوصيتك أولوية عندنا ومفيش حاجة بتتشارك.',
                color: 'from-primary to-primary/80',
              },
              {
                step: '٢',
                icon: ClipboardList,
                title: 'تابع مزاجك',
                desc: 'سجّل إحساسك كل يوم بكلماتك إنت. الذكاء الاصطناعي بيفهمك وبيديك تقرير أسبوعي عن تطورك.',
                color: 'from-accent to-accent/80',
              },
              {
                step: '٣',
                icon: Heart,
                title: 'احصل على دعم',
                desc: 'مجتمع داعم بيتفاعل معاك ودكاترة متخصصين جاهزين يساعدوك في أي وقت.',
                color: 'from-[#7ED321] to-[#7ED321]/80',
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center space-y-4 animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                {/* Step Number Circle */}
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${item.color} text-white mx-auto flex items-center justify-center shadow-lg relative z-10`}>
                  <item.icon size={32} />
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-full w-8 h-8 mx-auto flex items-center justify-center -mt-6 relative z-20 border-2 border-background shadow-sm">
                  <span className="text-sm font-bold text-foreground">{item.step}</span>
                </div>
                <h3 className="font-bold text-xl text-foreground pt-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent font-bold text-sm tracking-wider">تجارب حقيقية</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">
              ناس زيّك اشتروا سلامهم النفسي
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'أحمد',
                age: '٢٨ سنة',
                text: 'وصال كان السبب إنى أبدأ أتكلم عن مشاعري بحرية. قبل كده كنت خايف إن حد يعرف، لكن المجهولية هنا خلّتني أكون طبيعي. الناس في المجتمع بتفهمني فعلاً.',
                avatar: 'أ',
                color: 'bg-teal-100 text-teal-700',
              },
              {
                name: 'سارة',
                age: '٢٤ سنة',
                text: 'التراكر ساعدنى أفهم نفسى أكتر. لما بدأت أسجل مزاجي كل يوم، لاحظت أنماط مش كنت عارفها. والتقرير الأسبوعي بيعطيني خلاصة واضحة عن تطوري.',
                avatar: 'س',
                color: 'bg-purple-100 text-purple-700',
              },
              {
                name: 'محمد',
                age: '٣٢ سنة',
                text: 'الدكاترة هنا بيفهموني فعلاً ومش بيحكمون عليّ. حجزت جلسة صوتية وكانت من أفضل التجارب. حاسس إن في حد فعلاً سامعني وبيدويني نصايح عملية.',
                avatar: 'م',
                color: 'bg-amber-100 text-amber-700',
              },
            ].map((testimonial, i) => (
              <Card key={i} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <Quote size={32} className="text-accent/30" />
                  <p className="text-foreground/80 text-sm leading-relaxed">{testimonial.text}</p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center font-bold text-sm`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-muted-foreground text-xs">{testimonial.age}</p>
                    </div>
                    <div className="mr-auto flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={12} className="text-yellow-400" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 bg-gradient-to-bl from-primary via-[#003638] to-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center space-y-8">
          <div className="w-20 h-20 bg-white/10 rounded-full mx-auto flex items-center justify-center">
            <Heart size={36} className="text-accent" fill="currentColor" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            جاهز تبدأ رحلتك؟
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            انضم لآلاف الناس اللي اشتروا سلامهم النفسي مع وصال. التسجيل مجاني ومجهول بالكامل.
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-10 py-6 rounded-2xl shadow-xl shadow-black/20 hover:scale-105 transition-all"
            onClick={onGetStarted}
          >
            ابدأ الآن مجاناً
            <ArrowLeft size={20} className="mr-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
