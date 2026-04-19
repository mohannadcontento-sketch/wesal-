'use client';

import { useState } from 'react';
import { Brain, TrendingUp, Award, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const moodEmojis = [
  { emoji: '😢', label: 'سيء جداً', value: 1 },
  { emoji: '😔', label: 'سيء', value: 3 },
  { emoji: '😐', label: 'عادي', value: 5 },
  { emoji: '😊', label: 'جيد', value: 7 },
  { emoji: '😄', label: 'رائع', value: 9 },
];

const weeklyData = [
  { day: 'السبت', score: 4, color: 'bg-amber-400' },
  { day: 'الأحد', score: 5, color: 'bg-amber-400' },
  { day: 'الاثنين', score: 3, color: 'bg-red-400' },
  { day: 'الثلاثاء', score: 6, color: 'bg-accent' },
  { day: 'الأربعاء', score: 7, color: 'bg-accent' },
  { day: 'الخميس', score: 8, color: 'bg-teal-500' },
  { day: 'الجمعة', score: 6, color: 'bg-accent' },
];

export function TrackerPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodScore, setMoodScore] = useState(5);
  const [journalText, setJournalText] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleSubmit = () => {
    setShowAnalysis(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">التراكر الذكي</h1>
        <p className="text-muted-foreground mt-1">تتبع مزاجك كل يوم واحصل على رؤية أعمق لنفسك</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Entry Card */}
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
              {/* Emoji Selector */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">اختار اللي بيمثل إحساسك:</p>
                <div className="flex justify-between">
                  {moodEmojis.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                        selectedMood === mood.value
                          ? 'bg-secondary border-2 border-accent scale-110 shadow-md'
                          : 'hover:bg-secondary/50 border-2 border-transparent'
                      }`}
                    >
                      <span className="text-3xl">{mood.emoji}</span>
                      <span className="text-[10px] text-muted-foreground">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Score Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">مستوى المزاج:</p>
                  <span className="text-lg font-bold text-primary">{moodScore}/10</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-l from-red-200 via-amber-200 to-teal-200 rounded-full h-3" />
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="w-full relative z-10 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">سيء</span>
                  <span className="text-[10px] text-muted-foreground">رائع</span>
                </div>
              </div>

              {/* Journal Entry */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">عامل إيه النهاردة؟ اكتب إحساسك بكلماتك...</p>
                <Textarea
                  placeholder="مثلاً: النهاردة كنت حاسس بضغط في الشغل بس لما جيت البيت وقعدت مع عيلتي حاسس بتحسن..."
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  className="min-h-[100px] bg-background border-border resize-none text-foreground placeholder:text-muted-foreground/50"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!selectedMood || !journalText.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 py-5 text-base"
              >
                <Brain size={18} className="ml-2" />
                سجّل مزاجي واحصل على تحليل
              </Button>
            </CardContent>
          </Card>

          {/* AI Analysis Card */}
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
                    <p className="text-xs text-muted-foreground">مستوى الخطورة</p>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-1">منخفض</Badge>
                  </div>
                  <div className="bg-secondary rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">نسبة الثقة</p>
                    <p className="font-bold text-foreground text-sm mt-1">٩٢٪</p>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-sm font-bold text-foreground mb-2">اقتراح لك:</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    نفهم إن النهاردة كانت صعبة، بس إحنا فخورين إنك فاتحتك وقولت إحساسك. 
                    الضغط في الشغل بيأثر على كل جوانب حياتنا. خد وقتك واهتم بنفسك — 
                    ممكن تجرب تمشّي شوية أو تتكلم مع حد قريب منك. كل خطوة صغيرة بتعدّ 💙
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
                {weeklyData.map((data, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-foreground">{data.score}</span>
                    <div className="w-full bg-secondary rounded-t-lg relative" style={{ height: `${data.score * 10}%` }}>
                      <div
                        className={`absolute bottom-0 left-0 right-0 ${data.color} rounded-t-lg transition-all duration-500`}
                        style={{ height: '100%' }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{data.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Streak Card */}
          <Card className="bg-gradient-to-br from-primary to-[#003638] text-white border-0">
            <CardContent className="p-5 text-center space-y-4">
              <div className="w-16 h-16 bg-white/15 rounded-full mx-auto flex items-center justify-center">
                <Award size={32} className="text-amber-300" />
              </div>
              <div>
                <p className="text-3xl font-bold">١٢</p>
                <p className="text-white/70 text-sm">يوم متتالي!</p>
              </div>
              <Progress value={80} className="h-2 bg-white/20 [&>div]:bg-amber-400" />
              <p className="text-white/60 text-xs">٨ أيام تبقى للأهداف الشهرية</p>
            </CardContent>
          </Card>

          {/* Weekly Summary */}
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
                الأربعاء كان أحسن يوم عندك. حافظ على العادات اللي بتعملها في الأيام الجيدة.
              </p>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">نصيحة اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  &quot;جرب تكتب ٣ حاجات بتشكر عليها قبل ما تنام. الدراسات بتقول إن الشكر بيساعد يحسّن المزاج بشكل ملحوظ مع الوقت.&quot;
                </p>
                <p className="text-xs text-muted-foreground">— من فريق وصال 💙</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
