// ============================================================
// وصال (Wesal) — نظام الصلاحيات والأدوار
// ============================================================
// Session management moved to auth-context.tsx
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
  trackerEnabled: boolean;
  followingDoctorId?: string;
  tier: string;
  streakDays: number;
  reputationScore: number;
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
      tracker: true,
      consultations: false,
      viewEvents: true,
      registerEvents: false,
      viewProfile: true,
      adminPanel: false,
      moderate: false,
      viewAllTracker: true,
      approveContent: false,
      manageDoctors: false,
      manageUsers: false,
      safetyAccess: true,
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
      adminPanel: true,
      moderate: true,
      viewAllTracker: true,
      approveContent: true,
      manageDoctors: true,
      manageUsers: true,
      safetyAccess: true,
      deleteOwnAccount: false,
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
      moderate: true,
      viewAllTracker: false,
      approveContent: true,
      manageDoctors: false,
      manageUsers: false,
      safetyAccess: true,
      deleteOwnAccount: true,
    },
    limits: { postsPerDay: 10, commentsPerDay: 50 },
  },
  trainee: {
    label: 'طالب تربية',
    badge: '🔶 متدرب',
    badgeColor: 'bg-orange-100 text-orange-700',
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

// ─── Session Functions (re-exported from auth-context) ───
export {
  getSession,
  setSession,
  clearSession,
  checkAuthSession,
  signOut,
  getAccessToken,
  loadSessionFromStorage,
} from './auth-context';

// ─── التحقق من الصلاحيات ───
import { getSession } from './auth-context';

export function hasPermission(permission: PermissionKey): boolean {
  const session = getSession();
  if (!session) return false;
  const rolePerms = ROLE_PERMISSIONS[session.role as UserRole];
  if (!rolePerms) return false;
  if (permission === 'tracker') {
    return session.trackerEnabled && rolePerms.can.tracker;
  }
  return rolePerms.can[permission];
}
