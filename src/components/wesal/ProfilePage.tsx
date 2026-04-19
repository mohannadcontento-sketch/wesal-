'use client';

import { useState } from 'react';
import {
  User, Award, BarChart3, Bookmark, Settings, Download, Trash2,
  Shield, TrendingUp, Bell, Lock, ChevronLeft, MessageCircle, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export function ProfilePage() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-l from-primary to-[#003638] rounded-3xl p-6 sm:p-8 mb-8 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <div className="w-24 h-24 bg-white/15 rounded-full flex items-center justify-center border-4 border-white/20">
            <User size={40} />
          </div>
          <div className="text-center sm:text-right flex-1">
            <h1 className="text-2xl font-bold">مسافر #2487</h1>
            <p className="text-white/60 text-sm mt-1">عضو منذ مارس ٢٠٢٦</p>
            <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
              <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/20 border-green-500/30 gap-1">
                <Award size={14} />
                نشط
              </Badge>
              <span className="text-white/50 text-xs">المستوى الثاني من أصل أربعة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: FileText, label: 'عدد المنشورات', value: '٢٤', color: 'bg-teal-50 text-teal-600' },
          { icon: MessageCircle, label: 'مرات التفاعل', value: '١٥٦', color: 'bg-purple-50 text-purple-600' },
          { icon: TrendingUp, label: 'أيام متتالية', value: '١٢', color: 'bg-amber-50 text-amber-600' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${stat.color} mx-auto flex items-center justify-center mb-2`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reputation Progress */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award size={20} className="text-accent" />
                نظام السمعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">المستوى الحالي: نشط</p>
                  <p className="text-xs text-muted-foreground mt-0.5">أنت على الطريق الصح!</p>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">المستوى الثاني</Badge>
              </div>

              <Progress value={45} className="h-3" />

              <div className="bg-secondary/50 rounded-xl p-4">
                <p className="text-sm font-bold text-foreground mb-2">المستوى التالي: موثوق</p>
                <ul className="space-y-1.5">
                  {[
                    { text: '٣٠ يوم عضوية', done: false },
                    { text: 'تقييم ٤.٥ من ٥', done: true },
                    { text: '٠ بلاغات عن محتوى', done: true },
                    { text: 'موافقة الأدمن', done: false },
                  ].map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      {req.done ? (
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-[10px]">✓</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-muted-foreground text-[10px]">○</span>
                        </div>
                      )}
                      <span className={req.done ? 'text-muted-foreground line-through' : 'text-foreground'}>
                        {req.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Saved Posts */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bookmark size={20} className="text-accent" />
                المنشورات المحفوظة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  author: 'صباح #1523',
                  snippet: 'حبيت أشارك تجربتي مع جلسة الاستشارة الصوتية هنا. كنت متخوف في الأول لكن...',
                  time: 'أمس',
                  helpfuls: 34,
                },
                {
                  author: 'فجر #6238',
                  snippet: 'النهاردة خلصت ٣٠ يوم متتالية في التراكر! فخورة جداً بنفسي...',
                  time: 'منذ ٣ أيام',
                  helpfuls: 52,
                },
              ].map((post, i) => (
                <div key={i} className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-foreground">{post.author}</span>
                    <span className="text-[10px] text-muted-foreground">{post.time}</span>
                  </div>
                  <p className="text-xs text-foreground/70 line-clamp-2">{post.snippet}</p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                    <span>مفيد ({post.helpfuls})</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings size={16} />
                الإعدادات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">إشعارات البريد</span>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">التذكير اليومي</span>
                </div>
                <Switch checked={dailyReminder} onCheckedChange={setDailyReminder} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock size={16} />
                الخصوصية والبيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-sm gap-2">
                <Download size={16} />
                تصدير بياناتي
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 size={16} />
                احذف حسابي وبياناتي
              </Button>
              <p className="text-[10px] text-muted-foreground text-center pt-2 leading-relaxed">
                بياناتك مشفرة ومحمية. لو حذفت حسابك، البيانات بتتكتب نهائياً خلال ٧٢ ساعة.
              </p>
            </CardContent>
          </Card>

          {/* Data Privacy Notice */}
          <Card className="bg-secondary/50 border-border">
            <CardContent className="p-4 text-center space-y-2">
              <Shield size={24} className="text-accent mx-auto" />
              <p className="text-xs text-foreground/70 leading-relaxed">
                خصوصيتك أولويتنا. هويتك المجهولة منفصلة تماماً عن بياناتك. حتى لو اتسرقت قاعدة البيانات، مفيش ربط ممكن بين المحتوى والهوية الحقيقية.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 size={20} />
              هل أنت متأكد؟
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70 leading-relaxed">
              ده إجراء لا يمكن التراجع عنه. كل بياناتك — منشوراتك، تعليقاتك، يومياتك، وكل حاجة — هتتمسح نهائياً خلال ٧٢ ساعة. مش هتقدر تسترجع أي حاجة بعد كده.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="bg-card text-foreground border-border hover:bg-secondary">
              لا، رجّعني
            </AlertDialogCancel>
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              نعم، احذف حسابي
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
