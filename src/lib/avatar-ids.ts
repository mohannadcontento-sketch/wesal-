/**
 * Server-safe avatar data (no React, no JSX).
 * Import this in API routes and server code.
 */

export interface AvatarOption {
  id: string;
  name: string;
  category: 'nature' | 'wellness' | 'abstract' | 'animals' | 'people' | 'emotions' | 'space' | 'music' | 'food' | 'sports' | 'art';
}

/* ── Avatar data list ── */
export const AVATARS: AvatarOption[] = [
  // Nature (الطبيعة)
  { id: 'avatar:leaf', name: 'ورقة', category: 'nature' },
  { id: 'avatar:flower', name: 'زهرة', category: 'nature' },
  { id: 'avatar:tree', name: 'شجرة', category: 'nature' },
  { id: 'avatar:sun', name: 'شمس', category: 'nature' },
  // Mental Wellness (الصحة النفسية)
  { id: 'avatar:brain', name: 'عقل', category: 'wellness' },
  { id: 'avatar:heart', name: 'قلب', category: 'wellness' },
  { id: 'avatar:peace', name: 'سلام', category: 'wellness' },
  { id: 'avatar:star', name: 'نجمة', category: 'wellness' },
  // Abstract (أشكال تجريدية)
  { id: 'avatar:circles', name: 'دوائر', category: 'abstract' },
  { id: 'avatar:waves', name: 'أمواج', category: 'abstract' },
  { id: 'avatar:gem', name: 'جوهرة', category: 'abstract' },
  { id: 'avatar:moon', name: 'قمر', category: 'abstract' },
  // Animals (الحيوانات)
  { id: 'avatar:bird', name: 'عصفور', category: 'animals' },
  { id: 'avatar:cat', name: 'قطة', category: 'animals' },
  { id: 'avatar:fish', name: 'سمكة', category: 'animals' },
  { id: 'avatar:butterfly', name: 'فراشة', category: 'animals' },
  // People (شخصيات)
  { id: 'avatar:smile', name: 'ابتسامة', category: 'people' },
  { id: 'avatar:thinker', name: 'مفكر', category: 'people' },
  { id: 'avatar:hug', name: 'عناق', category: 'people' },
  { id: 'avatar:student', name: 'طالب', category: 'people' },
  // Emotions (المشاعر)
  { id: 'avatar:happy', name: 'سعادة', category: 'emotions' },
  { id: 'avatar:calm', name: 'هدوء', category: 'emotions' },
  { id: 'avatar:love', name: 'حب', category: 'emotions' },
  { id: 'avatar:hope', name: 'أمل', category: 'emotions' },
  // Space (الفضاء)
  { id: 'avatar:planet', name: 'كوكب', category: 'space' },
  { id: 'avatar:rocket', name: 'صاروخ', category: 'space' },
  { id: 'avatar:comet', name: 'مذنب', category: 'space' },
  { id: 'avatar:galaxy', name: 'مجرة', category: 'space' },
  // Music (الموسيقى)
  { id: 'avatar:note', name: 'نوتة', category: 'music' },
  { id: 'avatar:headphones', name: 'سماعات', category: 'music' },
  { id: 'avatar:guitar', name: 'جيتار', category: 'music' },
  { id: 'avatar:piano', name: 'بيانو', category: 'music' },
  // Food (الطعام)
  { id: 'avatar:coffee', name: 'قهوة', category: 'food' },
  { id: 'avatar:cupcake', name: 'كب كيك', category: 'food' },
  { id: 'avatar:fruit', name: 'فاكهة', category: 'food' },
  { id: 'avatar:tea', name: 'شاي', category: 'food' },
  // Sports (الرياضة)
  { id: 'avatar:yoga', name: 'يوجا', category: 'sports' },
  { id: 'avatar:running', name: 'جري', category: 'sports' },
  { id: 'avatar:cycling', name: 'دراجة', category: 'sports' },
  { id: 'avatar:swimming', name: 'سباحة', category: 'sports' },
  // Art (الفنون)
  { id: 'avatar:palette', name: 'لوحة', category: 'art' },
  { id: 'avatar:camera', name: 'كاميرا', category: 'art' },
  { id: 'avatar:brush', name: 'فرشاة', category: 'art' },
  { id: 'avatar:book', name: 'كتاب', category: 'art' },
];

/* ── Category labels (Arabic) ── */
export const CATEGORY_LABELS: Record<string, string> = {
  nature: 'الطبيعة',
  wellness: 'الصحة النفسية',
  abstract: 'أشكال تجريدية',
  animals: 'الحيوانات',
  people: 'شخصيات',
  emotions: 'المشاعر',
  space: 'الفضاء',
  music: 'الموسيقى',
  food: 'الطعام',
  sports: 'الرياضة',
  art: 'الفنون',
};

/* ── Validation helpers ── */

export function isBuiltInAvatar(avatarUrl: string | null | undefined): boolean {
  if (!avatarUrl) return false;
  return avatarUrl.startsWith('avatar:');
}

export function isValidAvatarId(id: string): boolean {
  return AVATARS.some((a) => a.id === id);
}
