'use client';

import React from 'react';

export interface AvatarOption {
  id: string;
  name: string;
  category: 'nature' | 'wellness' | 'abstract' | 'animals';
}

/* ── Wesal Brand Colors ── */
const NAVY = '#172a39';
const DARK = '#004346';
const MEDIUM = '#508992';
const SKY = '#73b3ce';
const ICE = '#d6f3f4';
const CREAM = '#f8f5f0';
const WHITE = '#ffffff';

/* ── SVG Avatar Components ── */
function LeafSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={ICE} />
      <path
        d="M28 12C28 12 16 18 14 28C12 38 20 44 28 44C28 44 24 34 28 24C32 34 28 44 28 44C36 44 44 38 42 28C40 18 28 12 28 12Z"
        fill={DARK}
      />
      <path d="M28 18V40" stroke={ICE} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 24L22 20" stroke={ICE} strokeWidth="1" strokeLinecap="round" />
      <path d="M28 30L34 26" stroke={ICE} strokeWidth="1" strokeLinecap="round" />
      <path d="M28 36L22 32" stroke={ICE} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function FlowerSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={CREAM} />
      <circle cx="28" cy="18" r="7" fill={SKY} opacity="0.8" />
      <circle cx="35" cy="25" r="7" fill={MEDIUM} opacity="0.7" />
      <circle cx="32" cy="34" r="7" fill={SKY} opacity="0.8" />
      <circle cx="24" cy="34" r="7" fill={MEDIUM} opacity="0.7" />
      <circle cx="21" cy="25" r="7" fill={SKY} opacity="0.8" />
      <circle cx="28" cy="27" r="5" fill={DARK} />
      <circle cx="26" cy="25" r="1.5" fill={CREAM} />
      <circle cx="30" cy="25" r="1.5" fill={CREAM} />
      <circle cx="28" cy="29" r="1" fill={CREAM} />
    </svg>
  );
}

function TreeSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={ICE} />
      <rect x="25" y="36" width="6" height="12" rx="2" fill={NAVY} />
      <polygon points="28,8 14,28 20,28 12,38 44,38 36,28 42,28" fill={DARK} />
      <polygon points="28,12 18,26 38,26" fill={MEDIUM} opacity="0.6" />
    </svg>
  );
}

function SunSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#FFF8E1" />
      <circle cx="28" cy="28" r="10" fill={DARK} />
      <g stroke={DARK} strokeWidth="2.5" strokeLinecap="round">
        <line x1="28" y1="6" x2="28" y2="12" />
        <line x1="28" y1="44" x2="28" y2="50" />
        <line x1="6" y1="28" x2="12" y2="28" />
        <line x1="44" y1="28" x2="50" y2="28" />
        <line x1="13" y1="13" x2="17" y2="17" />
        <line x1="39" y1="39" x2="43" y2="43" />
        <line x1="43" y1="13" x2="39" y2="17" />
        <line x1="17" y1="39" x2="13" y2="43" />
      </g>
      <circle cx="24" cy="26" r="1.5" fill={ICE} />
      <circle cx="31" cy="26" r="1.5" fill={ICE} />
      <path d="M24 31Q28 34 32 31" stroke={ICE} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function BrainSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={CREAM} />
      <path
        d="M28 14C22 14 18 18 17 22C14 22 12 25 13 28C12 30 14 33 17 33C17 36 20 39 24 38C26 40 30 40 32 38C36 39 39 36 39 33C42 33 44 30 43 28C44 25 42 22 39 22C38 18 34 14 28 14Z"
        fill={DARK}
      />
      <line x1="28" y1="18" x2="28" y2="38" stroke={CREAM} strokeWidth="1.2" />
      <path d="M28 22C22 22 19 25 18 28" stroke={CREAM} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M28 22C34 22 37 25 38 28" stroke={CREAM} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M28 28C22 28 19 30 18 33" stroke={CREAM} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M28 28C34 28 37 30 38 33" stroke={CREAM} strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function HeartSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#FDE8E8" />
      <path
        d="M28 42C28 42 12 32 12 22C12 16 17 12 22 12C25.5 12 28 15 28 15C28 15 30.5 12 34 12C39 12 44 16 44 22C44 32 28 42 28 42Z"
        fill={DARK}
      />
      <path
        d="M20 22C20 19 23 17 25.5 18.5"
        stroke={ICE}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 24L26 26L28 28L30 26L28 24Z"
        fill={SKY}
      />
    </svg>
  );
}

function PeaceSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={ICE} />
      <circle cx="28" cy="28" r="18" stroke={DARK} strokeWidth="2" fill="none" />
      <line x1="28" y1="28" x2="28" y2="10" stroke={DARK} strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="28" x2="16" y2="40" stroke={DARK} strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="28" x2="40" y2="40" stroke={DARK} strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="28" r="3" fill={MEDIUM} />
    </svg>
  );
}

function StarSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={CREAM} />
      <polygon
        points="28,10 33,22 46,22 36,30 39,43 28,35 17,43 20,30 10,22 23,22"
        fill={DARK}
      />
      <polygon
        points="28,14 32,23 42,23 34,29 37,40 28,33 19,40 22,29 14,23 24,23"
        fill={MEDIUM}
        opacity="0.4"
      />
    </svg>
  );
}

function CirclesSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={NAVY} />
      <circle cx="28" cy="28" r="20" stroke={ICE} strokeWidth="1.5" fill="none" />
      <circle cx="28" cy="28" r="14" stroke={SKY} strokeWidth="1.5" fill="none" />
      <circle cx="28" cy="28" r="8" stroke={MEDIUM} strokeWidth="1.5" fill="none" />
      <circle cx="28" cy="28" r="3" fill={ICE} />
    </svg>
  );
}

function WavesSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="56" rx="28" fill={ICE} />
      <path
        d="M4 22C10 18 16 26 22 22C28 18 34 26 40 22C46 18 52 26 52 22"
        stroke={DARK}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4 28C10 24 16 32 22 28C28 24 34 32 40 28C46 24 52 32 52 28"
        stroke={MEDIUM}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4 34C10 30 16 38 22 34C28 30 34 38 40 34C46 30 52 38 52 34"
        stroke={SKY}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4 40C10 36 16 44 22 40C28 36 34 44 40 40C46 36 52 44 52 40"
        stroke={MEDIUM}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

function GemSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="56" rx="28" fill={NAVY} />
      <polygon points="28,10 42,22 42,38 28,48 14,38 14,22" fill={DARK} stroke={SKY} strokeWidth="1" />
      <polygon points="28,10 35,22 28,48" fill={MEDIUM} opacity="0.6" />
      <polygon points="28,10 21,22 28,48" fill={DARK} />
      <line x1="14" y1="22" x2="42" y2="22" stroke={ICE} strokeWidth="1" />
      <polygon points="28,10 42,22 28,28 14,22" fill={SKY} opacity="0.3" />
    </svg>
  );
}

function MoonSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="56" rx="28" fill={NAVY} />
      <path
        d="M36 14C28 14 22 20 22 28C22 36 28 42 36 42C30 42 24 36 24 28C24 20 30 14 36 14Z"
        fill={ICE}
      />
      <circle cx="16" cy="16" r="1.2" fill={SKY} opacity="0.7" />
      <circle cx="12" cy="24" r="0.8" fill={ICE} opacity="0.5" />
      <circle cx="18" cy="40" r="1" fill={SKY} opacity="0.6" />
      <circle cx="10" cy="34" r="0.6" fill={ICE} opacity="0.4" />
      <circle cx="42" cy="18" r="0.8" fill={ICE} opacity="0.5" />
      <circle cx="44" cy="36" r="1" fill={SKY} opacity="0.5" />
    </svg>
  );
}

function BirdSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={ICE} />
      <ellipse cx="28" cy="30" rx="12" ry="10" fill={DARK} />
      <circle cx="22" cy="24" r="7" fill={DARK} />
      <polygon points="16,24 8,22 16,26" fill={MEDIUM} />
      <circle cx="20" cy="23" r="1.5" fill={WHITE} />
      <circle cx="20" cy="23" r="0.7" fill={NAVY} />
      <path
        d="M34 28C38 24 42 26 44 24"
        stroke={MEDIUM}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="28" cy="38" rx="3" ry="5" fill={SKY} opacity="0.6" />
    </svg>
  );
}

function CatSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={CREAM} />
      <path
        d="M18 16L14 6V18H18Z"
        fill={DARK}
      />
      <path
        d="M38 16L42 6V18H38Z"
        fill={DARK}
      />
      <ellipse cx="28" cy="30" rx="14" ry="12" fill={DARK} />
      <ellipse cx="28" cy="38" rx="8" ry="5" fill={MEDIUM} opacity="0.5" />
      <ellipse cx="22" cy="26" rx="2.5" ry="3" fill={ICE} />
      <ellipse cx="34" cy="26" rx="2.5" ry="3" fill={ICE} />
      <ellipse cx="22" cy="26" rx="1.2" ry="2" fill={NAVY} />
      <ellipse cx="34" cy="26" rx="1.2" ry="2" fill={NAVY} />
      <ellipse cx="28" cy="31" rx="2" ry="1.2" fill={SKY} />
      <line x1="16" y1="30" x2="8" y2="28" stroke={MEDIUM} strokeWidth="1" strokeLinecap="round" />
      <line x1="16" y1="32" x2="8" y2="33" stroke={MEDIUM} strokeWidth="1" strokeLinecap="round" />
      <line x1="40" y1="30" x2="48" y2="28" stroke={MEDIUM} strokeWidth="1" strokeLinecap="round" />
      <line x1="40" y1="32" x2="48" y2="33" stroke={MEDIUM} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function FishSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={ICE} />
      <ellipse cx="26" cy="28" rx="16" ry="10" fill={DARK} />
      <polygon points="42,28 52,20 52,36" fill={MEDIUM} />
      <ellipse cx="26" cy="28" rx="12" ry="7" fill={MEDIUM} opacity="0.3" />
      <circle cx="18" cy="26" r="2.5" fill={WHITE} />
      <circle cx="18" cy="26" r="1.2" fill={NAVY} />
      <path
        d="M22 22C24 18 28 18 30 22"
        stroke={ICE}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10 28C6 24 6 32 10 28Z"
        stroke={MEDIUM}
        strokeWidth="1"
        fill={MEDIUM}
        opacity="0.5"
      />
    </svg>
  );
}

function ButterflySvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={CREAM} />
      <ellipse cx="18" cy="20" rx="10" ry="12" fill={SKY} opacity="0.8" />
      <ellipse cx="38" cy="20" rx="10" ry="12" fill={SKY} opacity="0.8" />
      <ellipse cx="18" cy="36" rx="7" ry="9" fill={MEDIUM} opacity="0.7" />
      <ellipse cx="38" cy="36" rx="7" ry="9" fill={MEDIUM} opacity="0.7" />
      <ellipse cx="18" cy="20" rx="5" ry="7" fill={ICE} opacity="0.5" />
      <ellipse cx="38" cy="20" rx="5" ry="7" fill={ICE} opacity="0.5" />
      <rect x="27" y="14" width="2" height="28" rx="1" fill={DARK} />
      <line x1="28" y1="14" x2="24" y2="8" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="14" x2="32" y2="8" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="8" r="1.5" fill={DARK} />
      <circle cx="32" cy="8" r="1.5" fill={DARK} />
    </svg>
  );
}

/* ── Map of avatar id to SVG component ── */
const avatarSvgs: Record<string, () => React.ReactElement> = {
  'avatar:leaf': LeafSvg,
  'avatar:flower': FlowerSvg,
  'avatar:tree': TreeSvg,
  'avatar:sun': SunSvg,
  'avatar:brain': BrainSvg,
  'avatar:heart': HeartSvg,
  'avatar:peace': PeaceSvg,
  'avatar:star': StarSvg,
  'avatar:circles': CirclesSvg,
  'avatar:waves': WavesSvg,
  'avatar:gem': GemSvg,
  'avatar:moon': MoonSvg,
  'avatar:bird': BirdSvg,
  'avatar:cat': CatSvg,
  'avatar:fish': FishSvg,
  'avatar:butterfly': ButterflySvg,
};

/* ── Avatar data list ── */
export const AVATARS: AvatarOption[] = [
  // Nature
  { id: 'avatar:leaf', name: 'ورقة', category: 'nature' },
  { id: 'avatar:flower', name: 'زهرة', category: 'nature' },
  { id: 'avatar:tree', name: 'شجرة', category: 'nature' },
  { id: 'avatar:sun', name: 'شمس', category: 'nature' },
  // Mental Wellness
  { id: 'avatar:brain', name: 'عقل', category: 'wellness' },
  { id: 'avatar:heart', name: 'قلب', category: 'wellness' },
  { id: 'avatar:peace', name: 'سلام', category: 'wellness' },
  { id: 'avatar:star', name: 'نجمة', category: 'wellness' },
  // Abstract
  { id: 'avatar:circles', name: 'دوائر', category: 'abstract' },
  { id: 'avatar:waves', name: 'أمواج', category: 'abstract' },
  { id: 'avatar:gem', name: 'جوهرة', category: 'abstract' },
  { id: 'avatar:moon', name: 'قمر', category: 'abstract' },
  // Animals
  { id: 'avatar:bird', name: 'عصفور', category: 'animals' },
  { id: 'avatar:cat', name: 'قطة', category: 'animals' },
  { id: 'avatar:fish', name: 'سمكة', category: 'animals' },
  { id: 'avatar:butterfly', name: 'فراشة', category: 'animals' },
];

/* ── Category labels in Arabic ── */
export const CATEGORY_LABELS: Record<string, string> = {
  nature: 'الطبيعة',
  wellness: 'الصحة النفسية',
  abstract: 'أشكال تجريدية',
  animals: 'الحيوانات',
};

/* ── Get SVG component by avatar id ── */
export function getAvatarSvg(avatarId: string): (() => React.ReactElement) | null {
  return avatarSvgs[avatarId] || null;
}

/* ── Render avatar SVG inline ── */
export function renderAvatarSvg(avatarId: string, className?: string): React.ReactNode {
  const SvgComponent = getAvatarSvg(avatarId);
  if (!SvgComponent) return null;
  return <SvgComponent />;
}

/* ── Check if an avatarUrl is a built-in avatar ── */
export function isBuiltInAvatar(avatarUrl: string | null | undefined): boolean {
  if (!avatarUrl) return false;
  return avatarUrl.startsWith('avatar:');
}
