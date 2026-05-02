export interface UserSession {
  userId: string;
  email: string;
  role: 'user' | 'doctor' | 'trusted' | 'admin';
  username?: string;
  realName: string;
  avatarUrl?: string;
  specialty?: string;
  reputationScore: number;
  reputationTier: string;
  isVerified: boolean;
  badge: string;
}

export interface PostWithCounts {
  id: string;
  authorDisplay: string;
  authorBadge: string;
  authorRole: string;
  content: string;
  moods: string;
  section: string;
  commentCount: number;
  reactionCount: number;
  createdAt: string;
  isBookmarked?: boolean;
  userReactions?: string[];
}

export interface CommentWithReactions {
  id: string;
  postId: string;
  authorDisplay: string;
  authorBadge: string;
  parentId?: string;
  content: string;
  createdAt: string;
  reactions: { type: string; count: number }[];
  userReaction?: string;
  replies?: CommentWithReactions[];
}

export type ReputationPoints = {
  helpful: 5;
  thanks: 3;
  like: 1;
};

export const REPUTATION_POINTS: ReputationPoints = {
  helpful: 5,
  thanks: 3,
  like: 1,
};

export const REPUTATION_TIERS = {
  beginner: { min: 0, max: 49, label: 'مبتدئ', badge: '🔰' },
  active: { min: 50, max: 149, label: 'نشط', badge: '📚' },
  notable: { min: 150, max: 299, label: 'مميز', badge: '⭐' },
  eligible: { min: 300, max: Infinity, label: 'مؤهل للتوثيق', badge: '🌟' },
} as const;

export function getReputationTier(score: number): { tier: string; label: string; badge: string } {
  if (score >= 300) return { tier: 'eligible', label: 'مؤهل للتوثيق', badge: '🌟' };
  if (score >= 150) return { tier: 'notable', label: 'مميز', badge: '⭐' };
  if (score >= 50) return { tier: 'active', label: 'نشط', badge: '📚' };
  return { tier: 'beginner', label: 'مبتدئ', badge: '🔰' };
}

export function getUserBadge(role: string, reputationTier?: string): string {
  if (role === 'doctor') return '🏥';
  if (role === 'trusted') return '🌟';
  if (role === 'admin') return '🛡️';
  if (reputationTier === 'notable') return '⭐';
  if (reputationTier === 'active') return '📚';
  return '🔰';
}

export function getDisplayName(data: { realName: string; username?: string | null; role?: string }): string {
  if (data.role === 'doctor' || data.role === 'admin') return data.realName;
  if (data.role === 'trusted') return data.realName;
  return data.username || 'مجهول';
}

export interface VerificationRequest {
  id: string;
  userId: string;
  status: string;
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  user?: {
    id: string;
    email: string;
    role: string;
    profile?: {
      realName: string;
      username?: string | null;
      specialty?: string | null;
      reputationScore: number;
      reputationTier: string;
    };
  };
}

export interface Profile {
  id: string;
  userId: string;
  username?: string | null;
  realName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  specialty?: string | null;
  location?: string | null;
  rating: number;
  reputationScore: number;
  reputationTier: string;
  isVerified: boolean;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  role: string;
  disabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  profile?: Profile;
}

export interface Post {
  id: string;
  authorId: string;
  authorDisplay: string;
  authorBadge: string;
  authorRole: string;
  content: string;
  moods: string;
  section: string;
  commentCount: number;
  reactionCount: number;
  createdAt: string;
}

export interface ChatMessageType {
  id: string;
  roomId: string;
  senderId: string;
  messageType: string;
  content?: string | null;
  voiceUrl?: string | null;
  voiceDuration?: number | null;
  read: boolean;
  createdAt: string;
}

export interface ChatRoomType {
  id: string;
  appointmentId?: string | null;
  patientId: string;
  doctorId: string;
  status: string;
  createdAt: string;
  messages?: ChatMessageType[];
}

// Aliases for backward compatibility
export type ChatMessage = ChatMessageType;
export type ChatRoom = ChatRoomType;
