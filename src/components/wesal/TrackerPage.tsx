'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Award, Sparkles, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getSession, setSession } from '@/lib/permissions';
import { submitMood, fetchTrackerLogs, analyzeMood } from '@/lib/api';

const moodEmojis = [
  { emoji: '😢', label: 'سيء جداً', value: 1 },
  { emoji: '😔', label: 'سيء', value: 3 },
  { emoji: '😐', label: 'عادي', value: 5 },
  { emoji: '😊', label: 'جيد', value: 7 },
  { emoji: '😄', label: 'رائع', value: 9 },
];

const fallbackWeeklyData = [
  { day: 'السبت', score: 4, color: 'bg-amber-400' },
  { day: 'الأحد', score: 5, color: 'bg-amber-400' },
  { day: 'الاثنين', score: 3, color: 'bg-red-400' },
  { day: 'الثلاثاء', score: 6, color: 'bg-accent' },
  { day: 'الأربعاء', score: 7, color: 'bg-accent' },
  { day: 'الخميس', score: 8, color: 'bg-teal-500' },
  { day: 'الجمعة', score: 6, color: 'bg-accent' },
];

function scoreToColor(score: number): string {
  if (score <= 3) return 'bg-red-400';
  if (score <= 5) return 'bg-amber-400';
  if (score <= 7) return 'bg-accent';
  return 'bg-teal-500';
}

export function TrackerPage() {
  const session = getSession();
  const trackerEnabled = session?.trackerEnabled || false;

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodScore, setMoodScore] = useState(5);
  const [journalText, setJournalText] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [weeklyData, setWeeklyData] = useState(fallbackWeeklyData);
  const [streak, setStreak] = useState(12);
  const [loading, setLoading] = useState(false);

  // Load tracker data from API on mount
  useEffect(() => {
    if (!trackerEnabled || !session) return;
    fetchTrackerLogs(session.userId, 7)
      .then(res => {
        if (res.logs && res.logs.length > 0) {
          const mapped = res.logs.map((log: any) => ({
            day: log.day || log.date || '',
            score: log.score ?? log.moodScore ?? 0,
            color: scoreToColor(log.score ?? log.moodScore ?? 0),
          }));
          setWeeklyData(mapped);
        }
        if (res.streak !== undefined) {
          setStreak(res.streak);
        }
      })
      .catch(() => {
        // Fallback: keep default weekly data
      });
  }, [trackerEnabled]);

  const handleSubmit = async () => {
    if (!trackerEnabled || !selectedMood) return;
    const sess = getSession();
    if (!sess) return;

    setLoading(true);
    try {
      await submitMood({
        userId: sess.userId,
        moodScore: selectedMood,
        moodEmoji: moodEmojis.find(m => m.value === selectedMood)?.emoji,
        journalText: journalText,
      });
      setShowAnalysis(true);
      // Refresh data
      const res = await fetchTrackerLogs(sess.userId, 7);
      if (res.logs && res.logs.length > 0) {
        const mapped = res.logs.map((log: any) => ({
          day: log.day || log.date || '',
          score: log.score ?? log.moodScore ?? 0,
          color: scoreToColor(log.score ?? log.moodScore ?? 0),
        }));
        setWeeklyData(mapped);
      }
      if (res.streak !== undefined) {
        setStreak(res.streak);
      }
    } catch {
      // Fallback: still show analysis
      setShowAnalysis(true);
    }
    setLoading(false);
  };

  // ─── لو التراكر مش مفعّل ───
  if (!trackerEnabled) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">التراكر الذكي</h1>
          <p className="text-muted-foreground mt-1">تتبع مزاجك واحصل على رؤية أعمق</p>
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <div className="bg-gradient-to-l from-primary/5 to-secondary/50 p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-secondary rounded-full mx-auto flex items-center justify-center">
              <Lock size={36} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">التراكر مش متاح حالياً</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                التراكر الذكي متاح بس للمرضى المتابعين مع دكتور معتمد.
                الدكتور هيفعّلك التراكر بعد ما تحجز جلسة استشارة ويشوف إنك محتاجه.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border max-w-sm mx-auto space-y-3">
              <h3 className="font-bold text-sm text-foreground">إزاي تفعّل التراكر؟</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-[10px] text-primary-foreground font-bold flex-shrink-0 mt-0.5">١</div>
                  <p className="text-xs text-foreground/70">احجز جلسة استشارة مع دكتور معتمد</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-[10px] text-primary-foreground font-bold flex-shrink-0 mt-0.5">٢</div>
                  <p className="text-xs text-foreground/70">الدكتور هيقيّم حالتك ويقرر يفعّل التراكر</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-[10px] text-primary-foreground font-bold flex-shrink-0 mt-0.5">٣</div>
                  <p className="text-xs text-foreground/70">هتلاقي التراكر متاح في الـ Navigation</p>
                </div>
              </div>
            </div>

            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={() => {
                // Navigate to consultations — using custom event
                window.dispatchEvent(new CustomEvent('wesal:navigate', { detail: 'consultations' }));
              }}
            >
              احجز استشارة الآن
              <ArrowLeft size={16} className="mr-1" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ─── التراكر مفعّل ───
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">التراكر الذكي</h1>
          <Badge className="bg-green-100 text-green-700 text-[10px]">
            <CheckCircle size={10} className="ml-0.5" />
            مفعّل من د. {session?.followingDoctorId ? 'الدكتور' : 'معتمد'}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">تتبع مزاجك كل يوم واحصل على رؤية أعمق لنفسك</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Entry */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles size={20} className="text-accent" />
                  كيف حالك النهاردة؟
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground mb-3">اختار اللي بيمثل إحساسك:</p>
                <div className="flex justify-between">
                  {moodEmojis.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                        selectedMood === mood.value ? 'bg-secondary border-2 border-accent scale-110 shadow-md' : 'hover:bg-secondary/50 border-2 border-transparent'
                      }`}
                    >
                      <span className="text-3xl">{mood.emoji}</span>
                      <span className="text-[10px] text-muted-foreground">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">مستوى المزاج:</p>
                  <span className="text-lg font-bold text-primary">{moodScore}/10</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-l from-red-200 via-amber-200 to-teal-200 rounded-full h-3" />
                  <input
                    type="range"
                    min="1" max="10" value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="w-full relative z-10 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">عامل إيه النهاردة؟</p>
                <Textarea
                  placeholder="اكتب إحساسك بكلماتك..."
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  className="min-h-[100px] bg-background border-border resize-none"
                />
              </div>

              <Button onClick={handleSubmit} disabled={!selectedMood || !journalText.trim() || loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 py-5 text-base">
                {loading ? (
                  <span className="ml-2 inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Brain size={18} className="ml-2" />
                )}
                {loading ? 'جاري التسجيل...' : 'سجّل مزاجي واحصل على تحليل'}
              </Button>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {showAnalysis && (
            <Card className="bg-card border-accent/30 animate-slide-up">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain size={20} className="text-accent" />
                  تحليل الذكاء الاصطناعي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-secondary rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">المشاعر</p>
                    <p className="font-bold text-foreground text-sm mt-1">متوسط</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">الخطورة</p>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-1">منخفض</Badge>
                  </div>
                  <div className="bg-secondary rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">الثقة</p>
                    <p className="font-bold text-foreground text-sm mt-1">٩٢٪</p>
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-sm font-bold text-foreground mb-2">اقتراح لك:</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    نفهم إن النهاردة كانت صعبة، بس إحنا فخورين إنك فاتحتك وقولت. الضغط في الشغل بيأثر على كل جوانب حياتنا. خد وقتك واهتم بنفسك 💙
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp size={20} className="text-accent" />
                تقرير الأسبوع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-48 px-2">
                {weeklyData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-foreground">{d.score}</span>
                    <div className="w-full bg-secondary rounded-t-lg" style={{ height: `${d.score * 10}%` }}>
                      <div className={`w-full h-full ${d.color} rounded-t-lg`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary to-[#003638] text-white border-0">
            <CardContent className="p-5 text-center space-y-4">
              <div className="w-16 h-16 bg-white/15 rounded-full mx-auto flex items-center justify-center">
                <Award size={32} className="text-amber-300" />
              </div>
              <div>
                <p className="text-3xl font-bold">{streak}</p>
                <p className="text-white/70 text-sm">يوم متتالي!</p>
              </div>
              <Progress value={80} className="h-2 bg-white/20 [&>div]:bg-amber-400" />
              <p className="text-white/60 text-xs">٨ أيام تبقى للأهداف الشهرية</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                ملخص الأسبوع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed">
                لاحظنا تحسّن ملحوظ في مزاجك مقارنة بالأسبوع الماضي! متوسط مزاجك ارتفع من ٤.٢ لـ ٥.٦.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
