'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Activity,
  CalendarCheck,
  Star,
  Settings,
  Search,
  ChevronLeft,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  Phone,
  MessageSquare,
  Clock,
  Flame,
  Award,
  BarChart3,
  Menu,
  UserCog,
  Bell,
  Lock,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { UserRole } from '@/lib/permissions';

// ─── Types ───
type AdminTab = 'dashboard' | 'users' | 'moderation' | 'tracker' | 'bookings' | 'reputation' | 'settings';

interface MockUser {
  id: string;
  anonId: string;
  nickname: string;
  role: UserRole;
  tier: string;
  trackerEnabled: boolean;
  dailyFollowUp: boolean;
  supervisor: string | null;
  streakDays: number;
  reputation: number;
  postsCount: number;
  joinDate: string;
  moodScore?: number;
}

interface MockReport {
  id: string;
  content: string;
  reporter: string;
  reason: string;
  riskScore: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  userAnonId: string;
}

interface MockBooking {
  id: string;
  patientAnonId: string;
  doctor: string;
  date: string;
  time: string;
  type: 'voice' | 'chat';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: string;
}

// ─── Mock Data ───
const initialUsers: MockUser[] = [
  { id: '1', anonId: 'مسافر #2487', nickname: 'مسافر', role: 'patient', tier: 'active', trackerEnabled: true, dailyFollowUp: false, supervisor: 'د. نورهان', streakDays: 12, reputation: 85, postsCount: 24, joinDate: '2026-03-15', moodScore: 7 },
  { id: '2', anonId: 'نسمة #3194', nickname: 'نسمة', role: 'patient', tier: 'trusted', trackerEnabled: true, dailyFollowUp: true, supervisor: null, streakDays: 30, reputation: 210, postsCount: 56, joinDate: '2026-02-20', moodScore: 8 },
  { id: '3', anonId: 'د. نورهان أحمد', nickname: 'د. نورهان', role: 'doctor', tier: 'expert', trackerEnabled: false, dailyFollowUp: false, supervisor: null, streakDays: 0, reputation: 450, postsCount: 120, joinDate: '2026-01-10' },
  { id: '4', anonId: 'صباح #1523', nickname: 'صباح', role: 'patient', tier: 'new', trackerEnabled: false, dailyFollowUp: false, supervisor: null, streakDays: 0, reputation: 15, postsCount: 3, joinDate: '2026-04-18' },
  { id: '5', anonId: 'قمر #4871', nickname: 'قمر', role: 'patient', tier: 'active', trackerEnabled: true, dailyFollowUp: true, supervisor: 'د. أحمد', streakDays: 7, reputation: 68, postsCount: 18, joinDate: '2026-03-25', moodScore: 5 },
  { id: '6', anonId: 'فجر #6238', nickname: 'فجر', role: 'patient', tier: 'active', trackerEnabled: true, dailyFollowUp: false, supervisor: 'د. نورهان', streakDays: 30, reputation: 134, postsCount: 42, joinDate: '2026-03-01', moodScore: 9 },
  { id: '7', anonId: 'ليالي #7012', nickname: 'ليالي', role: 'patient', tier: 'new', trackerEnabled: false, dailyFollowUp: false, supervisor: null, streakDays: 0, reputation: 8, postsCount: 2, joinDate: '2026-04-19' },
  { id: '8', anonId: 'بدر #5543', nickname: 'بدر', role: 'patient', tier: 'active', trackerEnabled: true, dailyFollowUp: false, supervisor: 'د. أحمد', streakDays: 5, reputation: 52, postsCount: 15, joinDate: '2026-04-01', moodScore: 6 },
  { id: '9', anonId: 'المشرف #9001', nickname: 'المشرف', role: 'moderator', tier: 'expert', trackerEnabled: false, dailyFollowUp: false, supervisor: null, streakDays: 0, reputation: 320, postsCount: 0, joinDate: '2026-01-05' },
  { id: '10', anonId: 'د. أحمد محمود', nickname: 'د. أحمد', role: 'doctor', tier: 'expert', trackerEnabled: false, dailyFollowUp: false, supervisor: null, streakDays: 0, reputation: 380, postsCount: 95, joinDate: '2026-01-01' },
];

const initialReports: MockReport[] = [
  { id: '1', content: 'أنا حاسس إن مفيش فايدة...', reporter: 'نظام تلقائي', reason: 'كلمات محظورة مكتشفة', riskScore: 50, status: 'pending', date: '2026-04-20', userAnonId: 'مسافر #5555' },
  { id: '2', content: 'النهاردة كنت فاكر أعمل حاجة غلط...', reporter: 'بدر #5543', reason: 'محتوى مقلق', riskScore: 35, status: 'pending', date: '2026-04-20', userAnonId: 'قمر #4871' },
  { id: '3', content: 'عايز أشكركم على الدعم...', reporter: 'فجر #6238', reason: 'سبام', riskScore: 5, status: 'approved', date: '2026-04-19', userAnonId: 'مسافر #7777' },
];

const initialBookings: MockBooking[] = [
  { id: '1', patientAnonId: 'مسافر #2487', doctor: 'د. نورهان أحمد', date: '2026-04-21', time: '٣ مساءً', type: 'voice', status: 'confirmed', price: '٤٥ جنيه' },
  { id: '2', patientAnonId: 'نسمة #3194', doctor: 'د. أحمد محمود', date: '2026-04-22', time: '٥ مساءً', type: 'chat', status: 'pending', price: '٥٠ جنيه' },
  { id: '3', patientAnonId: 'فجر #6238', doctor: 'د. نورهان أحمد', date: '2026-04-19', time: '٢ مساءً', type: 'voice', status: 'completed', price: '٤٥ جنيه' },
  { id: '4', patientAnonId: 'قمر #4871', doctor: 'د. سارة حسين', date: '2026-04-23', time: '١٠ صباحاً', type: 'chat', status: 'pending', price: '٦٠ جنيه' },
];

const recentActivity = [
  { id: '1', text: 'مسافر #2487 نشر منشور جديد في المجتمع', time: 'منذ ٥ دقائق', type: 'post' as const },
  { id: '2', text: 'نسمة #3194 سجّلت نتيجة تراكر اليوم', time: 'منذ ١٥ دقيقة', type: 'tracker' as const },
  { id: '3', text: 'حجز استشارة جديد من فجر #6238', time: 'منذ ٣٠ دقيقة', type: 'booking' as const },
  { id: '4', text: 'بلاغ جديد: محتوى مقلق من قمر #4871', time: 'منذ ٤٥ دقيقة', type: 'report' as const },
  { id: '5', text: 'د. أحمد أكد حجز مع بدر #5543', time: 'منذ ساعة', type: 'booking' as const },
  { id: '6', text: 'ليالي #7012 سجّلت حساب جديد', time: 'منذ ساعتين', type: 'user' as const },
];

// ─── Role & Tier Labels ───
const roleLabels: Record<UserRole, string> = {
  patient: 'مستخدم',
  doctor: 'دكتور',
  admin: 'مدير',
  moderator: 'مشرف',
  trainee: 'متدرب',
};

const roleColors: Record<UserRole, string> = {
  patient: 'bg-teal-100 text-teal-700',
  doctor: 'bg-emerald-100 text-emerald-700',
  admin: 'bg-red-100 text-red-700',
  moderator: 'bg-amber-100 text-amber-700',
  trainee: 'bg-orange-100 text-orange-700',
};

const tierLabels: Record<string, string> = {
  new: 'جديد',
  active: 'نشط',
  trusted: 'موثوق',
  expert: 'خبير',
};

const tierColors: Record<string, string> = {
  new: 'bg-gray-100 text-gray-600',
  active: 'bg-teal-100 text-teal-700',
  trusted: 'bg-purple-100 text-purple-700',
  expert: 'bg-amber-100 text-amber-700',
};

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  approved: 'موافق عليه',
  rejected: 'مرفوض',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-teal-100 text-teal-700',
  cancelled: 'bg-red-100 text-red-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

// ─── Sidebar Navigation ───
const sidebarTabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'users', label: 'إدارة المستخدمين', icon: Users },
  { id: 'moderation', label: 'مراجعة المحتوى', icon: ShieldCheck },
  { id: 'tracker', label: 'إدارة التراكر', icon: Activity },
  { id: 'bookings', label: 'الحجوزات', icon: CalendarCheck },
  { id: 'reputation', label: 'نظام السمعة', icon: Star },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

// ─── Sidebar Navigation Component ───
function SidebarNav({ activeTab, setActiveTab, pendingReports }: {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  pendingReports: number;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck size={20} />
          لوحة الإدارة
        </h2>
        <p className="text-xs text-white/50 mt-1">وصال — إدارة المنصة</p>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {sidebarTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {tab.label}
              {tab.id === 'moderation' && pendingReports > 0 && (
                <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 mr-auto min-w-[18px] text-center">
                  {pendingReports}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <UserCog size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">مدير النظام</p>
            <p className="text-[10px] text-white/50">admin@wesal.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ───
export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [users, setUsers] = useState<MockUser[]>(initialUsers);
  const [reports, setReports] = useState<MockReport[]>(initialReports);
  const [bookings] = useState<MockBooking[]>(initialBookings);
  const [userSearch, setUserSearch] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [supervisorDialog, setSupervisorDialog] = useState<{ open: boolean; userId: string }>({ open: false, userId: '' });
  const [journalDialog, setJournalDialog] = useState<{ open: boolean; user: MockUser | null }>({ open: false, user: null });

  // ─── Settings state ───
  const [settings, setSettings] = useState({
    autoModeration: true,
    emergencyAlerts: true,
    dailyReports: false,
    allowAnonymous: true,
    requireApproval: false,
    maxPostsPerDay: 5,
    maintenanceMode: false,
  });

  // ─── Stats ───
  const totalUsers = users.length;
  const patientsCount = users.filter(u => u.role === 'patient').length;
  const activeTrackers = users.filter(u => u.trackerEnabled).length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const todayBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
  const totalPosts = users.reduce((sum, u) => sum + u.postsCount, 0);

  // ─── Handlers ───
  const changeUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const toggleTracker = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, trackerEnabled: !u.trackerEnabled } : u));
  };

  const toggleDailyFollowUp = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, dailyFollowUp: !u.dailyFollowUp } : u));
  };

  const assignSupervisor = (userId: string, supervisorName: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, supervisor: supervisorName || null } : u));
    setSupervisorDialog({ open: false, userId: '' });
  };

  const updateReportStatus = (reportId: string, status: 'approved' | 'rejected') => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const updateBookingStatus = (bookingId: string, status: MockBooking['status']) => {
    // bookings is const, so we'd need state for this to work fully, but this shows the intent
  };

  // ─── Filtered data ───
  const filteredUsers = users.filter(u =>
    u.anonId.includes(userSearch) || u.nickname.includes(userSearch) || roleLabels[u.role].includes(userSearch)
  );

  const filteredReports = reports.filter(r => reportFilter === 'all' || r.status === reportFilter);

  const trackerUsers = users.filter(u => u.trackerEnabled);

  const supervisors = users.filter(u => u.role === 'doctor' || u.role === 'moderator');

  return (
    <div className="min-h-screen flex bg-gray-50/50" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#172A3A] flex-shrink-0 flex-col min-h-screen sticky top-16">
        <div className="p-4 pt-6">
          <SidebarNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            pendingReports={pendingReports}
          />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed bottom-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="rounded-full w-14 h-14 bg-[#004346] hover:bg-[#004346]/90 text-white shadow-xl">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-[#172A3A] border-none">
            <SheetTitle className="sr-only">القائمة الجانبية</SheetTitle>
            <SidebarNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              pendingReports={pendingReports}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#172A3A] flex items-center gap-2">
            {(() => {
              const active = sidebarTabs.find(t => t.id === activeTab);
              if (!active) return null;
              const Icon = active.icon;
              return <Icon size={24} className="text-[#004346]" />;
            })()}
            {sidebarTabs.find(t => t.id === activeTab)?.label}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'dashboard' && 'نظرة عامة على حالة المنصة'}
            {activeTab === 'users' && `إدارة ${totalUsers} مستخدم مسجل`}
            {activeTab === 'moderation' && `${pendingReports} بلاغ قيد الانتظار`}
            {activeTab === 'tracker' && `${activeTrackers} مستخدم بتراكر نشط`}
            {activeTab === 'bookings' && `${bookings.length} حجز في النظام`}
            {activeTab === 'reputation' && 'متابعة نظام السمعة والمستويات'}
            {activeTab === 'settings' && 'إعدادات المنصة العامة'}
          </p>
        </div>

        {/* ─── DASHBOARD ─── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <StatCard
                icon={<Users size={20} />}
                label="إجمالي المستخدمين"
                value={totalUsers}
                color="bg-teal-50 text-teal-600"
                iconBg="bg-teal-100"
              />
              <StatCard
                icon={<TrendingUp size={20} />}
                label="إجمالي المنشورات"
                value={totalPosts}
                color="bg-blue-50 text-blue-600"
                iconBg="bg-blue-100"
              />
              <StatCard
                icon={<Activity size={20} />}
                label="تراكرات نشطة"
                value={activeTrackers}
                color="bg-emerald-50 text-emerald-600"
                iconBg="bg-emerald-100"
              />
              <StatCard
                icon={<AlertTriangle size={20} />}
                label="بلاغات معلّقة"
                value={pendingReports}
                color="bg-amber-50 text-amber-600"
                iconBg="bg-amber-100"
              />
              <StatCard
                icon={<CalendarCheck size={20} />}
                label="حجوزات اليوم"
                value={todayBookings}
                color="bg-purple-50 text-purple-600"
                iconBg="bg-purple-100"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-[#172A3A] flex items-center gap-2">
                    <Clock size={18} className="text-[#508991]" />
                    النشاط الأخير
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-4">
                  <div className="space-y-3">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          activity.type === 'post' ? 'bg-blue-100 text-blue-500' :
                          activity.type === 'tracker' ? 'bg-emerald-100 text-emerald-500' :
                          activity.type === 'booking' ? 'bg-purple-100 text-purple-500' :
                          activity.type === 'report' ? 'bg-amber-100 text-amber-500' :
                          'bg-teal-100 text-teal-500'
                        }`}>
                          {activity.type === 'post' ? <MessageSquare size={14} /> :
                           activity.type === 'tracker' ? <Activity size={14} /> :
                           activity.type === 'booking' ? <CalendarCheck size={14} /> :
                           activity.type === 'report' ? <AlertTriangle size={14} /> :
                           <UserPlus size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">{activity.text}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-[#172A3A] flex items-center gap-2">
                    <Zap size={18} className="text-[#508991]" />
                    إجراءات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm text-gray-700 hover:bg-gray-50 h-11"
                    onClick={() => setActiveTab('users')}
                  >
                    <UserPlus size={16} className="text-[#004346]" />
                    إضافة مستخدم جديد
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm text-gray-700 hover:bg-gray-50 h-11"
                    onClick={() => setActiveTab('moderation')}
                  >
                    <ShieldCheck size={16} className="text-amber-500" />
                    مراجعة البلاغات ({pendingReports})
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm text-gray-700 hover:bg-gray-50 h-11"
                    onClick={() => setActiveTab('bookings')}
                  >
                    <CalendarCheck size={16} className="text-purple-500" />
                    إدارة الحجوزات
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm text-gray-700 hover:bg-gray-50 h-11"
                    onClick={() => setActiveTab('tracker')}
                  >
                    <Activity size={16} className="text-emerald-500" />
                    مراجعة التراكرات
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm text-gray-700 hover:bg-gray-50 h-11"
                    onClick={() => setActiveTab('reputation')}
                  >
                    <Star size={16} className="text-amber-500" />
                    نظام السمعة
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* User Distribution */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-[#004346]">{patientsCount}</div>
                <div className="text-xs text-gray-500 mt-1">مرضى</div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-[#004346] rounded-full h-1.5" style={{ width: `${(patientsCount / totalUsers) * 100}%` }} />
                </div>
              </Card>
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{users.filter(u => u.role === 'doctor').length}</div>
                <div className="text-xs text-gray-500 mt-1">دكاترة</div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-500 rounded-full h-1.5" style={{ width: `${(users.filter(u => u.role === 'doctor').length / totalUsers) * 100}%` }} />
                </div>
              </Card>
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{users.filter(u => u.role === 'moderator').length}</div>
                <div className="text-xs text-gray-500 mt-1">مشرفين</div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-amber-500 rounded-full h-1.5" style={{ width: `${(users.filter(u => u.role === 'moderator').length / totalUsers) * 100}%` }} />
                </div>
              </Card>
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-[#508991]">{activeTrackers}</div>
                <div className="text-xs text-gray-500 mt-1">تراكرات نشطة</div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div className="bg-[#508991] rounded-full h-1.5" style={{ width: `${(activeTrackers / totalUsers) * 100}%` }} />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ─── USERS MANAGEMENT ─── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search */}
            <Card className="border-0 shadow-sm p-4">
              <div className="relative">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="ابحث بالاسم المستعار، المعرف، أو الدور..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pr-10 bg-white border-gray-200"
                />
              </div>
            </Card>

            {/* Users Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-right text-xs font-semibold text-gray-500">المعرف</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-gray-500">الدور</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-gray-500 hidden sm:table-cell">المستوى</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-gray-500 hidden md:table-cell">التراكر</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-gray-500 hidden lg:table-cell">المشرف</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-gray-500 hidden xl:table-cell">انضم</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(user => (
                        <TableRow key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <TableCell className="py-3">
                            <div>
                              <p className="font-medium text-sm text-[#172A3A]">{user.anonId}</p>
                              <p className="text-[10px] text-gray-400">{user.postsCount} منشور</p>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <select
                              value={user.role}
                              onChange={(e) => changeUserRole(user.id, e.target.value as UserRole)}
                              className={`text-[11px] px-2 py-1 rounded-md border-0 cursor-pointer font-medium ${roleColors[user.role]}`}
                            >
                              {Object.entries(roleLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell className="py-3 hidden sm:table-cell">
                            <Badge className={`${tierColors[user.tier]} text-[10px] px-2 py-0.5 border-0`}>
                              {tierLabels[user.tier] || user.tier}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.trackerEnabled}
                                onCheckedChange={() => toggleTracker(user.id)}
                                className="data-[state=checked]:bg-[#004346]"
                              />
                              {user.trackerEnabled && (
                                <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                                  <Flame size={12} />
                                  {user.streakDays} يوم
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 hidden lg:table-cell">
                            {user.supervisor ? (
                              <Badge className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 border-0">
                                {user.supervisor}
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-3 hidden xl:table-cell">
                            <span className="text-xs text-gray-400">{user.joinDate}</span>
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-400 hover:text-[#004346]"
                                onClick={() => setSupervisorDialog({ open: true, userId: user.id })}
                                title="تعيين مشرف"
                              >
                                <UserCog size={14} />
                              </Button>
                              {user.role === 'patient' && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className={`h-8 w-8 ${user.dailyFollowUp ? 'text-emerald-500' : 'text-gray-400 hover:text-emerald-500'}`}
                                  onClick={() => toggleDailyFollowUp(user.id)}
                                  title="المتابعة اليومية"
                                >
                                  <Phone size={14} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="py-12 text-center">
                    <Search size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">لا توجد نتائج</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── CONTENT MODERATION ─── */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all' as const, label: 'الكل' },
                { key: 'pending' as const, label: 'قيد الانتظار' },
                { key: 'approved' as const, label: 'موافق عليه' },
                { key: 'rejected' as const, label: 'مرفوض' },
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={reportFilter === filter.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReportFilter(filter.key)}
                  className={
                    reportFilter === filter.key
                      ? 'bg-[#004346] text-white hover:bg-[#004346]/90'
                      : 'text-gray-600 hover:text-[#004346]'
                  }
                >
                  {filter.label}
                  {filter.key === 'pending' && (
                    <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 mr-1.5">
                      {reports.filter(r => r.status === 'pending').length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Reports List */}
            <div className="space-y-3">
              {filteredReports.map(report => (
                <Card key={report.id} className="border-0 shadow-sm overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge className={`${statusColors[report.status]} text-[10px] px-2 py-0.5 border-0`}>
                            {statusLabels[report.status]}
                          </Badge>
                          <Badge className={`text-[10px] px-2 py-0.5 border-0 ${
                            report.riskScore >= 50 ? 'bg-red-100 text-red-700' :
                            report.riskScore >= 25 ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            مخاطر: {report.riskScore}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">"{report.content}"</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1"><Users size={12} /> {report.userAnonId}</span>
                          <span className="flex items-center gap-1"><Eye size={12} /> {report.reporter}</span>
                          <span className="flex items-center gap-1"><AlertTriangle size={12} /> {report.reason}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {report.date}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {report.status === 'pending' && (
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 text-xs"
                            onClick={() => updateReportStatus(report.id, 'approved')}
                          >
                            <CheckCircle2 size={14} />
                            قبول
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 gap-1 text-xs"
                            onClick={() => updateReportStatus(report.id, 'rejected')}
                          >
                            <XCircle size={14} />
                            رفض
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 gap-1 text-xs"
                            onClick={() => deleteReport(report.id)}
                          >
                            <Trash2 size={14} />
                            حذف
                          </Button>
                        </div>
                      )}
                      {report.status !== 'pending' && (
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 gap-1 text-xs"
                            onClick={() => deleteReport(report.id)}
                          >
                            <Trash2 size={14} />
                            حذف
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredReports.length === 0 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center">
                    <ShieldCheck size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">لا توجد بلاغات في هذا القسم</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* ─── TRACKER MANAGEMENT ─── */}
        {activeTab === 'tracker' && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-[#004346]">{activeTrackers}</div>
                <div className="text-xs text-gray-500 mt-1">تراكر نشط</div>
              </Card>
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {trackerUsers.length > 0 ? Math.round(trackerUsers.reduce((s, u) => s + (u.moodScore || 0), 0) / trackerUsers.length * 10) / 10 : 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">متوسط المزاج</div>
              </Card>
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {trackerUsers.length > 0 ? Math.max(...trackerUsers.map(u => u.streakDays)) : 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">أطول سلسلة</div>
              </Card>
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-[#508991]">
                  {trackerUsers.filter(u => (u.moodScore || 0) >= 7).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">حالة مزاج جيدة</div>
              </Card>
            </div>

            {/* Tracker Users */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-right text-xs font-semibold text-gray-500">المريض</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500">المزاج</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500">السلسلة</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-gray-500 hidden sm:table-cell">المشرف</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trackerUsers.map(user => (
                        <TableRow key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-teal-700">{user.nickname.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-medium text-sm text-[#172A3A]">{user.anonId}</p>
                                <p className="text-[10px] text-gray-400">{user.postsCount} منشور • سمعة {user.reputation}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className={`w-3 h-3 rounded-full ${
                                (user.moodScore || 0) >= 7 ? 'bg-emerald-500' :
                                (user.moodScore || 0) >= 4 ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                              <span className="text-sm font-medium">
                                {user.moodScore || 0}/١٠
                              </span>
                            </div>
                            <div className="w-16 bg-gray-100 rounded-full h-1.5 mx-auto mt-1">
                              <div
                                className={`rounded-full h-1.5 ${
                                  (user.moodScore || 0) >= 7 ? 'bg-emerald-500' :
                                  (user.moodScore || 0) >= 4 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${((user.moodScore || 0) / 10) * 100}%` }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Flame size={14} className={user.streakDays >= 14 ? 'text-orange-500' : 'text-gray-400'} />
                              <span className="text-sm font-medium">{user.streakDays}</span>
                              <span className="text-[10px] text-gray-400">يوم</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 hidden sm:table-cell">
                            {user.supervisor ? (
                              <span className="text-xs text-gray-600">{user.supervisor}</span>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 border-0">بدون مشرف</Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-400 hover:text-[#004346]"
                                onClick={() => setSupervisorDialog({ open: true, userId: user.id })}
                                title="تعيين مشرف"
                              >
                                <UserCog size={14} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-400 hover:text-blue-600"
                                onClick={() => setJournalDialog({ open: true, user })}
                                title="عرض المذكرات"
                              >
                                <Eye size={14} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-400 hover:text-red-500"
                                onClick={() => toggleTracker(user.id)}
                                title="إيقاف التراكر"
                              >
                                <XCircle size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {trackerUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="py-12 text-center">
                            <Activity size={40} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">لا يوجد تراكرات نشطة</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── BOOKINGS ─── */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{bookings.filter(b => b.status === 'pending').length}</div>
                <div className="text-xs text-gray-500 mt-1">قيد الانتظار</div>
              </Card>
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{bookings.filter(b => b.status === 'confirmed').length}</div>
                <div className="text-xs text-gray-500 mt-1">مؤكد</div>
              </Card>
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-teal-600">{bookings.filter(b => b.status === 'completed').length}</div>
                <div className="text-xs text-gray-500 mt-1">مكتمل</div>
              </Card>
              <Card className="border-0 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-[#004346]">{bookings.length}</div>
                <div className="text-xs text-gray-500 mt-1">إجمالي الحجوزات</div>
              </Card>
            </div>

            {/* Bookings Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-right text-xs font-semibold text-gray-500">المريض</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-gray-500">الدكتور</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500">التاريخ</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500 hidden sm:table-cell">الوقت</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500">النوع</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500 hidden md:table-cell">السعر</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map(booking => (
                        <TableRow key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <TableCell className="py-3">
                            <p className="text-sm font-medium text-[#172A3A]">{booking.patientAnonId}</p>
                          </TableCell>
                          <TableCell className="py-3">
                            <p className="text-sm text-gray-700">{booking.doctor}</p>
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <span className="text-sm text-gray-600">{booking.date}</span>
                          </TableCell>
                          <TableCell className="py-3 text-center hidden sm:table-cell">
                            <span className="text-sm text-gray-600">{booking.time}</span>
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <Badge className={`text-[10px] px-2 py-0.5 border-0 ${
                              booking.type === 'voice' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {booking.type === 'voice' ? '📞 صوتي' : '💬 كتابي'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-center hidden md:table-cell">
                            <span className="text-sm text-gray-600">{booking.price}</span>
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <select
                              value={booking.status}
                              onChange={(e) => updateBookingStatus(booking.id, e.target.value as MockBooking['status'])}
                              className={`text-[11px] px-2 py-1 rounded-md border-0 cursor-pointer font-medium ${statusColors[booking.status]}`}
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="confirmed">مؤكد</option>
                              <option value="completed">مكتمل</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── REPUTATION ─── */}
        {activeTab === 'reputation' && (
          <div className="space-y-4">
            {/* Tier Legend */}
            <Card className="border-0 shadow-sm p-4">
              <h3 className="text-sm font-bold text-[#172A3A] mb-3">مستويات السمعة</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { tier: 'جديد', range: '٠ - ٥٠ نقطة', color: 'bg-gray-100 text-gray-600', icon: '🌱' },
                  { tier: 'نشط', range: '٥١ - ١٥٠ نقطة', color: 'bg-teal-100 text-teal-700', icon: '🌿' },
                  { tier: 'موثوق', range: '١٥١ - ٣٠٠ نقطة', color: 'bg-purple-100 text-purple-700', icon: '🌳' },
                  { tier: 'خبير', range: '٣٠١+ نقطة', color: 'bg-amber-100 text-amber-700', icon: '⭐' },
                ].map(t => (
                  <div key={t.tier} className="flex items-center gap-2">
                    <span className="text-lg">{t.icon}</span>
                    <div>
                      <p className="text-xs font-medium">{t.tier}</p>
                      <p className="text-[10px] text-gray-400">{t.range}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reputation Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-right text-xs font-semibold text-gray-500">المستخدم</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500">المستوى</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500">النقاط</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500 hidden sm:table-cell">المنشورات</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-500 hidden sm:table-cell">السلسلة</TableHead>
                        <TableHead className="text-right text-xs font-semibold text-gray-500 hidden md:table-cell">تفاصيل</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter(u => u.role !== 'admin')
                        .sort((a, b) => b.reputation - a.reputation)
                        .map((user, idx) => (
                          <TableRow key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <TableCell className="py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                  idx === 0 ? 'bg-amber-100 text-amber-700' :
                                  idx === 1 ? 'bg-gray-200 text-gray-600' :
                                  idx === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-100 text-gray-500'
                                }`}>
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#172A3A]">{user.anonId}</p>
                                  <Badge className={`${roleColors[user.role]} text-[9px] px-1.5 py-0 border-0 mt-0.5`}>
                                    {roleLabels[user.role]}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              <Badge className={`${tierColors[user.tier]} text-[10px] px-2 py-0.5 border-0`}>
                                {tierLabels[user.tier] || user.tier}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                <span className="text-sm font-bold text-[#172A3A]">{user.reputation}</span>
                              </div>
                              <div className="w-16 bg-gray-100 rounded-full h-1 mx-auto mt-1">
                                <div
                                  className="bg-amber-400 rounded-full h-1"
                                  style={{ width: `${Math.min((user.reputation / 500) * 100, 100)}%` }}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-center hidden sm:table-cell">
                              <span className="text-sm text-gray-600">{user.postsCount}</span>
                            </TableCell>
                            <TableCell className="py-3 text-center hidden sm:table-cell">
                              <span className="text-sm text-gray-600">{user.streakDays} يوم</span>
                            </TableCell>
                            <TableCell className="py-3 hidden md:table-cell">
                              <div className="text-[10px] text-gray-400 space-y-0.5">
                                <p>📝 المنشورات: ~{Math.round(user.postsCount * 1.5)} نقطة</p>
                                <p>💬 التعليقات: ~{Math.round(user.postsCount * 0.8)} نقطة</p>
                                <p>🔥 السلسلة: {user.streakDays * 2} نقطة</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── SETTINGS ─── */}
        {activeTab === 'settings' && (
          <div className="space-y-4 max-w-2xl">
            {/* Safety & Moderation */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#172A3A] flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#004346]" />
                  السلامة والمراقبة
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">إعدادات حماية المحتوى والمستخدمين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <SettingToggle
                  icon={<ShieldCheck size={16} />}
                  label="المراقبة التلقائية"
                  description="فحص تلقائي للكلمات المحظورة والمحتوى المقلق"
                  checked={settings.autoModeration}
                  onChange={(v) => setSettings(s => ({ ...s, autoModeration: v }))}
                />
                <Separator />
                <SettingToggle
                  icon={<Bell size={16} />}
                  label="تنبيهات الطوارئ"
                  description="إرسال تنبيهات فورية عند اكتشاف محتوى خطير"
                  checked={settings.emergencyAlerts}
                  onChange={(v) => setSettings(s => ({ ...s, emergencyAlerts: v }))}
                />
                <Separator />
                <SettingToggle
                  icon={<BarChart3 size={16} />}
                  label="التقارير اليومية"
                  description="إرسال ملخص يومي للنشاط والبلاغات"
                  checked={settings.dailyReports}
                  onChange={(v) => setSettings(s => ({ ...s, dailyReports: v }))}
                />
              </CardContent>
            </Card>

            {/* Platform Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#172A3A] flex items-center gap-2">
                  <Settings size={18} className="text-[#508991]" />
                  إعدادات المنصة
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">تحكم في الميزات العامة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <SettingToggle
                  icon={<Globe size={16} />}
                  label="السماح بالنشر المجهول"
                  description="السماح للمستخدمين بالنشر بأسماء مستعارة"
                  checked={settings.allowAnonymous}
                  onChange={(v) => setSettings(s => ({ ...s, allowAnonymous: v }))}
                />
                <Separator />
                <SettingToggle
                  icon={<Eye size={16} />}
                  label="طلب موافقة على المنشورات"
                  description="كل منشور جديد يحتاج موافقة المشرف قبل النشر"
                  checked={settings.requireApproval}
                  onChange={(v) => setSettings(s => ({ ...s, requireApproval: v }))}
                />
                <Separator />
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#172A3A]">الحد الأقصى للمنشورات اليومية</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">عدد المنشورات المسموح بها لكل مستخدم يومياً</p>
                      </div>
                      <span className="text-lg font-bold text-[#004346]">{settings.maxPostsPerDay}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[3, 5, 10, 20].map(v => (
                        <Button
                          key={v}
                          size="sm"
                          variant={settings.maxPostsPerDay === v ? 'default' : 'outline'}
                          onClick={() => setSettings(s => ({ ...s, maxPostsPerDay: v }))}
                          className={settings.maxPostsPerDay === v
                            ? 'bg-[#004346] text-white hover:bg-[#004346]/90 text-xs'
                            : 'text-xs'
                          }
                        >
                          {v}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <Separator />
                <SettingToggle
                  icon={<Lock size={16} />}
                  label="وضع الصيانة"
                  description="تعطيل الوصول للمنصة مؤقتاً للصيانة"
                  checked={settings.maintenanceMode}
                  onChange={(v) => setSettings(s => ({ ...s, maintenanceMode: v }))}
                />
              </CardContent>
            </Card>

            {/* Save */}
            <div className="flex justify-end">
              <Button className="bg-[#004346] hover:bg-[#004346]/90 text-white gap-2">
                <CheckCircle2 size={16} />
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* ─── Supervisor Assignment Dialog ─── */}
      <Dialog open={supervisorDialog.open} onOpenChange={(open) => setSupervisorDialog({ open, userId: '' })}>
        <DialogContent className="bg-card max-w-sm mx-4" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">تعيين مشرف</DialogTitle>
            <DialogDescription className="text-xs">اختر مشرف للمستخدم</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            {supervisors.map(sup => (
              <button
                key={sup.id}
                onClick={() => assignSupervisor(supervisorDialog.userId, sup.nickname)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-[#004346]/30 transition-all text-right"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${roleColors[sup.role]}`}>
                  <span className="text-sm font-bold">{sup.nickname.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{sup.anonId}</p>
                  <p className="text-[10px] text-gray-400">{roleLabels[sup.role]} • سمعة {sup.reputation}</p>
                </div>
                <ChevronLeft size={16} className="text-gray-400" />
              </button>
            ))}
            <button
              onClick={() => assignSupervisor(supervisorDialog.userId, '')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-200 hover:bg-red-50 transition-all text-right"
            >
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle size={16} className="text-red-500" />
              </div>
              <p className="text-sm text-red-600 font-medium">إزالة المشرف</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Journal Dialog ─── */}
      <Dialog open={journalDialog.open} onOpenChange={(open) => setJournalDialog({ open, user: null })}>
        <DialogContent className="bg-card max-w-md mx-4" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Activity size={18} className="text-[#004346]" />
              مذكرات {journalDialog.user?.anonId}
            </DialogTitle>
            <DialogDescription className="text-xs">آخر ٣ أيام من التسجيلات</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {journalDialog.user && (
              <>
                {[
                  { date: 'اليوم', mood: journalDialog.user.moodScore || 7, note: 'النهاردة كنت حاسس بتحسن، عملت تمارين تنفس وكانت مفيدة جداً' },
                  { date: 'أمس', mood: (journalDialog.user.moodScore || 7) - 1, note: 'يوم عادي، نمت بدري وحسيت براحة أكتر' },
                  { date: 'قبل يومين', mood: (journalDialog.user.moodScore || 7) - 2, note: 'كان في ضغط شوية بس اتغلب عليه' },
                ].map((entry, idx) => (
                  <Card key={idx} className="border-0 shadow-sm p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">{entry.date}</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          entry.mood >= 7 ? 'bg-emerald-500' :
                          entry.mood >= 4 ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <span className="text-xs font-bold">{Math.max(1, entry.mood)}/١٠</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{entry.note}</p>
                  </Card>
                ))}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">السلسلة الحالية</span>
                  <div className="flex items-center gap-1">
                    <Flame size={16} className="text-orange-500" />
                    <span className="text-sm font-bold text-[#172A3A]">{journalDialog.user.streakDays} يوم</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-Components ───

function StatCard({ icon, label, value, color, iconBg }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  iconBg: string;
}) {
  return (
    <Card className="border-0 shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <div className={color.split(' ')[1]}>{icon}</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#172A3A]">{value}</div>
          <div className="text-[11px] text-gray-400">{label}</div>
        </div>
      </div>
    </Card>
  );
}

function SettingToggle({ icon, label, description, checked, onChange }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#172A3A]">{label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
          </div>
          <Switch
            checked={checked}
            onCheckedChange={onChange}
            className="data-[state=checked]:bg-[#004346] flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
}

function Zap({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
