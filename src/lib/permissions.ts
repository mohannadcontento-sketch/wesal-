// ============================================================
// وصال (Wesal) — نظام الصلاحيات والأدوار
// ============================================================

// ─── نوع الصلاحيات ───
type PermissionKey = 'post' | 'comment' | 'likeHelpful' | 'save' | 'report' | 'tracker' |
  'consultations' | 'viewEvents' | 'registerEvents' | 'viewProfile' |
  'adminPanel' | 'moderate' | 'viewAllTracker' | 'approveContent' |
  'manageDoctors' | 'manageUsers' | 'safetyAccess' | 'deleteOwnAccount';

export type UserRole = 'patient' | 'doctor' | 'admin' | 'moderator' | 'trainee';

export interface UserSession {
  userId: string;
  anonId: string;
  nickname: string;
  role: UserRole;
  avatarColor: string;
  trackerEnabled: boolean; // الدكتور هو اللي يفعّله
  followingDoctorId?: string;
  tier: string;
  streakDays: number;
}

// ─── صلاحيات كل دور ───
export const ROLE_PERMISSIONS: Record<UserRole, {
  label: string;
  badge: string;
  badgeColor: string;
  can: Record<PermissionKey, boolean>;
  limits: {
    postsPerDay: number;
    commentsPerDay: number;
  };
}> = {
  patient: {
    label: 'مستخدم',
    badge: '',
    badgeColor: '',
    can: {
      post: true,
      comment: true,
      likeHelpful: true,
      save: true,
      report: true,
      tracker: false, // يحتاج الدكتور يفعّله
      consultations: true,
      viewEvents: true,
      registerEvents: true,
      viewProfile: true,
      adminPanel: false,
      moderate: false,
      viewAllTracker: false,
      approveContent: false,
      manageDoctors: false,
      manageUsers: false,
      safetyAccess: false,
      deleteOwnAccount: true,
    },
    limits: { postsPerDay: 5, commentsPerDay: 20 },
  },
  doctor: {
    label: 'دكتور معتمد',
    badge: '✓ معتمد',
    badgeColor: 'bg-teal-100 text-teal-700',
    can: {
      post: true,
      comment: true,
      likeHelpful: true,
      save: true,
      report: true,
      tracker: true, // الدكتور عنده تراكره الخاص
      consultations: false, // هو اللي بيقدم الاستشارات
      viewEvents: true,
      registerEvents: false, // هو اللي بيعمل فعاليات
      viewProfile: true,
      adminPanel: false,
      moderate: false,
      viewAllTracker: true, // يشوف تراكر مرضاه
      approveContent: false,
      manageDoctors: false,
      manageUsers: false,
      safetyAccess: true, // بروتوكول طوارئ المرضى
      deleteOwnAccount: true,
    },
    limits: { postsPerDay: 20, commentsPerDay: 100 },
  },
  admin: {
    label: 'مدير النظام',
    badge: 'إدارة',
    badgeColor: 'bg-red-100 text-red-700',
    can: {
      post: true,
      comment: true,
      likeHelpful: true,
      save: true,
      report: true,
      tracker: true,
      consultations: true,
      viewEvents: true,
      registerEvents: true,
      viewProfile: true,
      adminPanel: true,       // ✅ لوحة إدارة كاملة
      moderate: true,          // ✅ مراجعة بلاغات
      viewAllTracker: true,    // ✅ رؤية كل التراكرات
      approveContent: true,    // ✅ موافقة محتوى
      manageDoctors: true,     // ✅ إدارة الدكاترة
      manageUsers: true,       // ✅ إدارة المستخدمين
      safetyAccess: true,      // ✅ صلاحيات طوارئ كاملة
      deleteOwnAccount: false, // الأدمن مش بيحذف حسابه
    },
    limits: { postsPerDay: 999, commentsPerDay: 999 },
  },
  moderator: {
    label: 'مشرف محتوى',
    badge: 'مشرف',
    badgeColor: 'bg-amber-100 text-amber-700',
    can: {
      post: true,
      comment: true,
      likeHelpful: true,
      save: true,
      report: true,
      tracker: false,
      consultations: true,
      viewEvents: true,
      registerEvents: true,
      viewProfile: true,
      adminPanel: false,
      moderate: true,          // ✅ مراجعة بلاغات + فلتر كلمات
      viewAllTracker: false,
      approveContent: true,    // ✅ موافقة/رفض محتوى
      manageDoctors: false,
      manageUsers: false,
      safetyAccess: true,      // ✅ بروتوكول طوارئ
      deleteOwnAccount: true,
    },
    limits: { postsPerDay: 10, commentsPerDay: 50 },
  },
  trainee: {
    label: 'طالب تربية',
    badge: '🔶 متدرب',
    badgeColor: 'bg-orange-100 text-orange-700',
    can: {
      post: true,            // محتوى تعليمي محدود
      comment: true,
      likeHelpful: true,
      save: true,
      report: true,
      tracker: false,
      consultations: true,
      viewEvents: true,
      registerEvents: true,
      viewProfile: true,
      adminPanel: false,
      moderate: false,
      viewAllTracker: false,
      approveContent: false,
      manageDoctors: false,
      manageUsers: false,
      safetyAccess: false,
      deleteOwnAccount: true,
    },
    limits: { postsPerDay: 3, commentsPerDay: 10 },
  },
};

// ─── Session Store ───
let _session: UserSession | null = null;

export function getSession(): UserSession | null {
  return _session;
}

export function setSession(session: UserSession): void {
  _session = session;
}

export function clearSession(): void {
  _session = null;
}

export function hasPermission(permission: PermissionKey): boolean {
  if (!_session) return false;
  const rolePerms = ROLE_PERMISSIONS[_session.role];
  if (permission === 'tracker') {
    return _session.trackerEnabled && rolePerms.can.tracker;
  }
  return rolePerms.can[permission];
}
