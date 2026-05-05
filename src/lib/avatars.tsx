'use client';

import React from 'react';

export interface AvatarOption {
  id: string;
  name: string;
  category: 'nature' | 'wellness' | 'abstract' | 'animals' | 'people' | 'emotions' | 'space' | 'music' | 'food' | 'sports' | 'art';
}

/* ── Wesal Brand Colors ── */
const NAVY = '#172a39';
const DARK = '#004346';
const MEDIUM = '#508992';
const SKY = '#73b3ce';
const ICE = '#d6f3f4';
const CREAM = '#f8f5f0';
const WHITE = '#ffffff';

/* ═══════════════════════════════════════════
   CATEGORY 1: NATURE (الطبيعة)
   ═══════════════════════════════════════════ */

function LeafSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={ICE} />
      <path d="M28 12C28 12 16 18 14 28C12 38 20 44 28 44C28 44 24 34 28 24C32 34 28 44 28 44C36 44 44 38 42 28C40 18 28 12 28 12Z" fill={DARK} />
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

/* ═══════════════════════════════════════════
   CATEGORY 2: WELLNESS (الصحة النفسية)
   ═══════════════════════════════════════════ */

function BrainSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={CREAM} />
      <path d="M28 14C22 14 18 18 17 22C14 22 12 25 13 28C12 30 14 33 17 33C17 36 20 39 24 38C26 40 30 40 32 38C36 39 39 36 39 33C42 33 44 30 43 28C44 25 42 22 39 22C38 18 34 14 28 14Z" fill={DARK} />
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
      <path d="M28 42C28 42 12 32 12 22C12 16 17 12 22 12C25.5 12 28 15 28 15C28 15 30.5 12 34 12C39 12 44 16 44 22C44 32 28 42 28 42Z" fill={DARK} />
      <path d="M20 22C20 19 23 17 25.5 18.5" stroke={ICE} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M28 24L26 26L28 28L30 26L28 24Z" fill={SKY} />
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
      <polygon points="28,10 33,22 46,22 36,30 39,43 28,35 17,43 20,30 10,22 23,22" fill={DARK} />
      <polygon points="28,14 32,23 42,23 34,29 37,40 28,33 19,40 22,29 14,23 24,23" fill={MEDIUM} opacity="0.4" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY 3: ABSTRACT (أشكال تجريدية)
   ═══════════════════════════════════════════ */

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
      <path d="M4 22C10 18 16 26 22 22C28 18 34 26 40 22C46 18 52 26 52 22" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M4 28C10 24 16 32 22 28C28 24 34 32 40 28C46 24 52 32 52 28" stroke={MEDIUM} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M4 34C10 30 16 38 22 34C28 30 34 38 40 34C46 30 52 38 52 34" stroke={SKY} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M4 40C10 36 16 44 22 40C28 36 34 44 40 40C46 36 52 44 52 40" stroke={MEDIUM} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
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
      <path d="M36 14C28 14 22 20 22 28C22 36 28 42 36 42C30 42 24 36 24 28C24 20 30 14 36 14Z" fill={ICE} />
      <circle cx="16" cy="16" r="1.2" fill={SKY} opacity="0.7" />
      <circle cx="12" cy="24" r="0.8" fill={ICE} opacity="0.5" />
      <circle cx="18" cy="40" r="1" fill={SKY} opacity="0.6" />
      <circle cx="10" cy="34" r="0.6" fill={ICE} opacity="0.4" />
      <circle cx="42" cy="18" r="0.8" fill={ICE} opacity="0.5" />
      <circle cx="44" cy="36" r="1" fill={SKY} opacity="0.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY 4: ANIMALS (الحيوانات)
   ═══════════════════════════════════════════ */

function BirdSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={ICE} />
      <ellipse cx="28" cy="30" rx="12" ry="10" fill={DARK} />
      <circle cx="22" cy="24" r="7" fill={DARK} />
      <polygon points="16,24 8,22 16,26" fill={MEDIUM} />
      <circle cx="20" cy="23" r="1.5" fill={WHITE} />
      <circle cx="20" cy="23" r="0.7" fill={NAVY} />
      <path d="M34 28C38 24 42 26 44 24" stroke={MEDIUM} strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="28" cy="38" rx="3" ry="5" fill={SKY} opacity="0.6" />
    </svg>
  );
}

function CatSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={CREAM} />
      <path d="M18 16L14 6V18H18Z" fill={DARK} />
      <path d="M38 16L42 6V18H38Z" fill={DARK} />
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
      <path d="M22 22C24 18 28 18 30 22" stroke={ICE} strokeWidth="1.5" strokeLinecap="round" fill="none" />
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

/* ═══════════════════════════════════════════
   CATEGORY 5: PEOPLE (شخصيات) - NEW
   ═══════════════════════════════════════════ */

function SmileSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#FFF3E0" />
      <circle cx="28" cy="26" r="16" fill={SKY} opacity="0.3" />
      <circle cx="21" cy="23" r="2" fill={DARK} />
      <circle cx="35" cy="23" r="2" fill={DARK} />
      <path d="M20 31Q28 38 36 31" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="14" r="3" fill={ICE} opacity="0.6" />
      <circle cx="44" cy="18" r="2" fill={SKY} opacity="0.4" />
    </svg>
  );
}

function ThinkerSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={CREAM} />
      <circle cx="28" cy="18" r="9" fill={DARK} />
      <rect x="19" y="27" width="18" height="16" rx="8" fill={DARK} />
      <circle cx="25" cy="17" r="1.5" fill={ICE} />
      <circle cx="31" cy="17" r="1.5" fill={ICE} />
      <path d="M25 21Q28 23 31 21" stroke={ICE} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Hand on chin */}
      <ellipse cx="20" cy="28" rx="4" ry="3" fill={MEDIUM} opacity="0.7" />
      {/* Thought bubble */}
      <circle cx="42" cy="12" r="2" fill={MEDIUM} opacity="0.4" />
      <circle cx="44" cy="8" r="3" fill={MEDIUM} opacity="0.3" />
      <circle cx="46" cy="4" r="4" fill={MEDIUM} opacity="0.2" />
    </svg>
  );
}

function HugSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#E8F5E9" />
      {/* Two people hugging */}
      <circle cx="22" cy="16" r="6" fill={DARK} />
      <circle cx="34" cy="16" r="6" fill={MEDIUM} />
      <path d="M14 26C14 24 18 22 22 22C26 22 30 24 30 26" fill={DARK} />
      <path d="M26 26C26 24 30 22 34 22C38 22 42 24 42 26" fill={MEDIUM} />
      {/* Hugging arms */}
      <path d="M16 28C16 34 20 42 28 42" stroke={DARK} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M40 28C40 34 36 42 28 42" stroke={MEDIUM} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Heart */}
      <path d="M26 30L28 28L30 30" stroke={SKY} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function StudentSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#E3F2FD" />
      {/* Head */}
      <circle cx="28" cy="20" r="8" fill={DARK} />
      {/* Graduation cap */}
      <polygon points="16,16 28,8 40,16 28,20" fill={NAVY} />
      <rect x="27" y="16" width="2" height="6" fill={NAVY} />
      <circle cx="40" cy="16" r="1.5" fill={ICE} />
      {/* Eyes */}
      <circle cx="25" cy="19" r="1.2" fill={WHITE} />
      <circle cx="31" cy="19" r="1.2" fill={WHITE} />
      {/* Body */}
      <rect x="21" y="28" width="14" height="14" rx="4" fill={SKY} />
      {/* Smile */}
      <path d="M25 23Q28 25 31 23" stroke={ICE} strokeWidth="1" strokeLinecap="round" fill="none" />
      {/* Book */}
      <rect x="33" y="32" width="8" height="6" rx="1" fill={DARK} opacity="0.6" />
      <line x1="37" y1="32" x2="37" y2="38" stroke={ICE} strokeWidth="0.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY 6: EMOTIONS (المشاعر) - NEW
   ═══════════════════════════════════════════ */

function HappySvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#FFFDE7" />
      <circle cx="28" cy="28" r="18" fill={DARK} />
      <circle cx="22" cy="24" r="2.5" fill={ICE} />
      <circle cx="34" cy="24" r="2.5" fill={ICE} />
      <circle cx="22" cy="24" r="1.2" fill={NAVY} />
      <circle cx="34" cy="24" r="1.2" fill={NAVY} />
      <path d="M20 32Q28 40 36 32" stroke={ICE} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Sparkles */}
      <circle cx="10" cy="10" r="1.5" fill={SKY} opacity="0.6" />
      <circle cx="46" cy="12" r="1" fill={SKY} opacity="0.5" />
      <circle cx="8" cy="40" r="1" fill={ICE} opacity="0.4" />
    </svg>
  );
}

function CalmSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={ICE} />
      {/* Closed eyes (zen) */}
      <circle cx="28" cy="28" r="16" fill={DARK} opacity="0.15" />
      <circle cx="28" cy="28" r="16" stroke={DARK} strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M20 26Q24 29 28 26" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M28 26Q32 29 36 26" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Gentle smile */}
      <path d="M23 32Q28 35 33 32" stroke={DARK} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Lotus petals around */}
      <ellipse cx="28" cy="10" rx="4" ry="3" fill={SKY} opacity="0.3" />
      <ellipse cx="46" cy="28" rx="3" ry="4" fill={SKY} opacity="0.3" />
      <ellipse cx="10" cy="28" rx="3" ry="4" fill={SKY} opacity="0.3" />
      <ellipse cx="28" cy="46" rx="4" ry="3" fill={SKY} opacity="0.3" />
    </svg>
  );
}

function LoveSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#FCE4EC" />
      {/* Big heart */}
      <path d="M28 44C28 44 10 34 10 22C10 15 15 10 21 10C24.5 10 27 12 28 14C29 12 31.5 10 35 10C41 10 46 15 46 22C46 34 28 44 28 44Z" fill={DARK} />
      {/* Inner glow */}
      <path d="M28 38C28 38 16 31 16 23C16 19 19 16 22 16C24 16 26 17.5 27 19C27 17.5 29 16 31 16C34 16 37 19 37 23C37 31 28 38 28 38Z" fill={SKY} opacity="0.3" />
      {/* Small hearts */}
      <path d="M12 14C12 14 10 12 11 11C12 10 14 12 14 12C14 12 12 14 12 14Z" fill={SKY} opacity="0.6" />
      <path d="M44 12C44 12 42 10 43 9C44 8 46 10 46 10C46 10 44 12 44 12Z" fill={SKY} opacity="0.6" />
    </svg>
  );
}

function HopeSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#E8EAF6" />
      {/* Rainbow arc */}
      <path d="M8 32Q28 4 48 32" stroke="#E57373" strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M11 32Q28 10 45 32" stroke={SKY} strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M14 32Q28 16 42 32" stroke="#FFF176" strokeWidth="2.5" fill="none" opacity="0.7" />
      {/* Star at top */}
      <polygon points="28,8 30,14 36,14 31,18 33,24 28,20 23,24 25,18 20,14 26,14" fill={DARK} opacity="0.8" />
      {/* Cloud */}
      <ellipse cx="16" cy="38" rx="6" ry="4" fill={WHITE} opacity="0.5" />
      <ellipse cx="40" cy="40" rx="5" ry="3" fill={WHITE} opacity="0.4" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY 7: SPACE (الفضاء) - NEW
   ═══════════════════════════════════════════ */

function PlanetSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={NAVY} />
      {/* Planet */}
      <circle cx="24" cy="28" r="12" fill={DARK} />
      <circle cx="22" cy="24" r="3" fill={MEDIUM} opacity="0.4" />
      <circle cx="28" cy="32" r="2" fill={SKY} opacity="0.3" />
      {/* Ring */}
      <ellipse cx="24" cy="28" rx="20" ry="5" stroke={ICE} strokeWidth="1.5" fill="none" opacity="0.5" transform="rotate(-20 24 28)" />
      {/* Stars */}
      <circle cx="44" cy="12" r="1.5" fill={WHITE} />
      <circle cx="8" cy="14" r="1" fill={ICE} />
      <circle cx="46" cy="38" r="0.8" fill={ICE} />
      <circle cx="12" cy="44" r="1.2" fill={WHITE} opacity="0.7" />
    </svg>
  );
}

function RocketSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={NAVY} />
      {/* Rocket body */}
      <path d="M28 8C28 8 20 18 20 30C20 36 24 42 28 44C32 42 36 36 36 30C36 18 28 8 28 8Z" fill={ICE} />
      <circle cx="28" cy="26" r="4" fill={DARK} />
      {/* Fins */}
      <path d="M20 30L14 38L20 36Z" fill={SKY} />
      <path d="M36 30L42 38L36 36Z" fill={SKY} />
      {/* Flame */}
      <path d="M24 42Q28 50 32 42" fill="#FF8A65" opacity="0.8" />
      <path d="M26 42Q28 47 30 42" fill="#FFD54F" opacity="0.9" />
      {/* Stars */}
      <circle cx="10" cy="12" r="1" fill={ICE} />
      <circle cx="44" cy="8" r="1.5" fill={ICE} opacity="0.7" />
      <circle cx="46" cy="44" r="1" fill={WHITE} opacity="0.5" />
    </svg>
  );
}

function CometSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="56" rx="28" fill={NAVY} />
      {/* Comet tail */}
      <path d="M12 44Q28 28 36 16" stroke={ICE} strokeWidth="3" strokeLinecap="round" opacity="0.3" />
      <path d="M16 42Q30 28 36 18" stroke={SKY} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M20 40Q32 28 38 20" stroke={MEDIUM} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Comet head */}
      <circle cx="38" cy="16" r="6" fill={ICE} />
      <circle cx="38" cy="16" r="4" fill={WHITE} />
      {/* Stars */}
      <circle cx="12" cy="12" r="1.2" fill={ICE} />
      <circle cx="20" cy="8" r="0.8" fill={WHITE} opacity="0.5" />
      <circle cx="8" cy="28" r="1" fill={ICE} opacity="0.4" />
      <circle cx="46" cy="40" r="0.8" fill={WHITE} opacity="0.3" />
    </svg>
  );
}

function GalaxySvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#0D1B2A" />
      {/* Spiral galaxy */}
      <path d="M28 28Q22 20 28 14Q34 8 38 14Q44 22 36 26Q28 30 28 28Z" fill={SKY} opacity="0.3" />
      <path d="M28 28Q34 36 28 42Q22 48 18 42Q12 34 20 30Q28 26 28 28Z" fill={ICE} opacity="0.2" />
      <circle cx="28" cy="28" r="3" fill={WHITE} opacity="0.8" />
      <circle cx="28" cy="28" r="1.5" fill={ICE} />
      {/* Stars */}
      <circle cx="10" cy="10" r="1" fill={WHITE} />
      <circle cx="44" cy="8" r="1.2" fill={ICE} />
      <circle cx="8" cy="42" r="0.8" fill={WHITE} opacity="0.6" />
      <circle cx="48" cy="44" r="1" fill={ICE} opacity="0.5" />
      <circle cx="14" cy="24" r="0.6" fill={WHITE} opacity="0.4" />
      <circle cx="42" cy="30" r="0.7" fill={ICE} opacity="0.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY 8: MUSIC (الموسيقى) - NEW
   ═══════════════════════════════════════════ */

function NoteSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#F3E5F5" />
      {/* Music note */}
      <ellipse cx="20" cy="38" rx="6" ry="4.5" fill={DARK} transform="rotate(-15 20 38)" />
      <rect x="25" y="14" width="3" height="24" rx="1.5" fill={DARK} />
      <path d="M28 14Q36 10 40 16" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="16" r="3" fill={DARK} />
      {/* Small notes */}
      <circle cx="12" cy="14" r="1.5" fill={SKY} opacity="0.5" />
      <circle cx="44" cy="40" r="1" fill={MEDIUM} opacity="0.4" />
    </svg>
  );
}

function HeadphonesSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={CREAM} />
      {/* Headband */}
      <path d="M12 30Q12 12 28 12Q44 12 44 30" stroke={DARK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Left ear cup */}
      <rect x="8" y="28" width="8" height="12" rx="4" fill={DARK} />
      <rect x="9" y="30" width="6" height="8" rx="3" fill={MEDIUM} opacity="0.5" />
      {/* Right ear cup */}
      <rect x="40" y="28" width="8" height="12" rx="4" fill={DARK} />
      <rect x="41" y="30" width="6" height="8" rx="3" fill={MEDIUM} opacity="0.5" />
      {/* Sound waves */}
      <path d="M5 34Q3 32 5 30" stroke={SKY} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M51 34Q53 32 51 30" stroke={SKY} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  );
}

function GuitarSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#FFF3E0" />
      {/* Guitar body */}
      <ellipse cx="24" cy="36" rx="12" ry="10" fill={DARK} />
      <ellipse cx="24" cy="30" rx="8" ry="7" fill={DARK} />
      {/* Sound hole */}
      <circle cx="24" cy="34" r="4" fill={NAVY} />
      <circle cx="24" cy="34" r="3" fill={ICE} opacity="0.2" />
      {/* Neck */}
      <rect x="22" y="10" width="4" height="18" rx="1" fill={MEDIUM} />
      {/* Strings */}
      <line x1="23" y1="12" x2="23" y2="40" stroke={ICE} strokeWidth="0.5" opacity="0.5" />
      <line x1="25" y1="12" x2="25" y2="40" stroke={ICE} strokeWidth="0.5" opacity="0.5" />
      {/* Tuning pegs */}
      <circle cx="21" cy="12" r="1.5" fill={ICE} />
      <circle cx="27" cy="12" r="1.5" fill={ICE} />
    </svg>
  );
}

function PianoSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={ICE} />
      {/* Piano body */}
      <rect x="8" y="20" width="40" height="22" rx="3" fill={WHITE} stroke={NAVY} strokeWidth="1.5" />
      {/* White keys */}
      <line x1="16" y1="20" x2="16" y2="42" stroke={NAVY} strokeWidth="0.5" />
      <line x1="24" y1="20" x2="24" y2="42" stroke={NAVY} strokeWidth="0.5" />
      <line x1="32" y1="20" x2="32" y2="42" stroke={NAVY} strokeWidth="0.5" />
      <line x1="40" y1="20" x2="40" y2="42" stroke={NAVY} strokeWidth="0.5" />
      {/* Black keys */}
      <rect x="13" y="20" width="4" height="13" rx="1" fill={NAVY} />
      <rect x="21" y="20" width="4" height="13" rx="1" fill={NAVY} />
      <rect x="37" y="20" width="4" height="13" rx="1" fill={NAVY} />
      {/* Musical notes */}
      <circle cx="44" cy="14" r="2" fill={SKY} opacity="0.5" />
      <circle cx="12" cy="14" r="1.5" fill={MEDIUM} opacity="0.4" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY 9: FOOD (الطعام) - NEW
   ═══════════════════════════════════════════ */

function CoffeeSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#EFEBE9" />
      {/* Cup body */}
      <path d="M14 22H36V40C36 43 33 46 30 46H20C17 46 14 43 14 40V22Z" fill={DARK} />
      <path d="M16 22H34V38C34 41 31 44 28 44H22C19 44 16 41 16 38V22Z" fill={MEDIUM} opacity="0.3" />
      {/* Cup rim */}
      <rect x="12" y="19" width="26" height="5" rx="2.5" fill={NAVY} />
      {/* Handle */}
      <path d="M36 26C40 26 42 30 42 34C42 38 40 40 36 40" stroke={DARK} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Steam */}
      <path d="M22 16Q24 12 22 8" stroke={SKY} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M28 14Q30 10 28 6" stroke={SKY} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M34 16Q36 12 34 8" stroke={SKY} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
    </svg>
  );
}

function CupcakeSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#FCE4EC" />
      {/* Cup wrapper */}
      <path d="M16 28L18 46H38L40 28Z" fill={DARK} />
      <path d="M18 28L19.5 44H36.5L38 28Z" fill={MEDIUM} opacity="0.3" />
      {/* Wrapper lines */}
      <line x1="22" y1="30" x2="23" y2="44" stroke={ICE} strokeWidth="0.8" opacity="0.3" />
      <line x1="28" y1="30" x2="28" y2="44" stroke={ICE} strokeWidth="0.8" opacity="0.3" />
      <line x1="34" y1="30" x2="33" y2="44" stroke={ICE} strokeWidth="0.8" opacity="0.3" />
      {/* Frosting */}
      <path d="M14 28C14 28 18 16 28 16C38 16 42 28 42 28Z" fill={SKY} />
      <circle cx="28" cy="16" r="3" fill="#FF8A80" />
      <circle cx="20" cy="20" r="2" fill={ICE} opacity="0.5" />
      <circle cx="36" cy="20" r="2" fill={ICE} opacity="0.5" />
    </svg>
  );
}

function FruitSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#E8F5E9" />
      {/* Apple body */}
      <path d="M28 16C22 16 16 22 16 30C16 40 22 46 28 46C34 46 40 40 40 30C40 22 34 16 28 16Z" fill="#E57373" />
      <path d="M28 20C26 18 24 16 24 14" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Leaf */}
      <path d="M26 16Q30 12 34 14" fill="#66BB6A" />
      <ellipse cx="24" cy="24" rx="4" ry="6" fill={WHITE} opacity="0.15" />
    </svg>
  );
}

function TeaSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#FFF8E1" />
      {/* Teapot body */}
      <ellipse cx="26" cy="32" rx="14" ry="12" fill={DARK} />
      <ellipse cx="26" cy="30" rx="10" ry="8" fill={MEDIUM} opacity="0.2" />
      {/* Spout */}
      <path d="M40 28C44 28 46 32 44 36" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Handle */}
      <path d="M12 26C8 26 6 32 8 36" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Lid */}
      <ellipse cx="26" cy="20" rx="10" ry="3" fill={NAVY} />
      <circle cx="26" cy="17" r="2.5" fill={NAVY} />
      {/* Steam */}
      <path d="M20 14Q22 10 20 6" stroke={SKY} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M28 12Q30 8 28 4" stroke={SKY} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.3" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY 10: SPORTS (الرياضة) - NEW
   ═══════════════════════════════════════════ */

function YogaSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#E8EAF6" />
      {/* Person in lotus pose */}
      <circle cx="28" cy="14" r="6" fill={DARK} />
      {/* Body */}
      <path d="M28 20V32" stroke={DARK} strokeWidth="3.5" strokeLinecap="round" />
      {/* Arms stretched out */}
      <path d="M28 24L16 18" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 24L40 18" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
      {/* Crossed legs */}
      <path d="M22 32Q28 40 34 32" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M18 36Q28 44 38 36" stroke={DARK} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Zen circle */}
      <circle cx="28" cy="28" r="22" stroke={SKY} strokeWidth="1" fill="none" opacity="0.3" />
    </svg>
  );
}

function RunningSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#E3F2FD" />
      {/* Head */}
      <circle cx="34" cy="14" r="5" fill={DARK} />
      {/* Body - running pose */}
      <path d="M34 19L30 30" stroke={DARK} strokeWidth="3" strokeLinecap="round" />
      {/* Arms */}
      <path d="M32 22L24 20" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 24L38 30" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <path d="M30 30L20 42" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 30L38 42" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
      {/* Motion lines */}
      <line x1="10" y1="20" x2="16" y2="20" stroke={SKY} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="8" y1="28" x2="14" y2="28" stroke={SKY} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="12" y1="36" x2="18" y2="36" stroke={SKY} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function CyclingSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#E0F7FA" />
      {/* Wheels */}
      <circle cx="16" cy="38" r="8" stroke={DARK} strokeWidth="2" fill="none" />
      <circle cx="40" cy="38" r="8" stroke={DARK} strokeWidth="2" fill="none" />
      <circle cx="16" cy="38" r="1.5" fill={DARK} />
      <circle cx="40" cy="38" r="1.5" fill={DARK} />
      {/* Frame */}
      <path d="M16 38L28 20L40 38" stroke={DARK} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M28 20L36 20" stroke={DARK} strokeWidth="2" strokeLinecap="round" />
      {/* Handlebars */}
      <path d="M36 20L38 16" stroke={DARK} strokeWidth="2" strokeLinecap="round" />
      {/* Seat */}
      <line x1="26" y1="18" x2="30" y2="18" stroke={DARK} strokeWidth="3" strokeLinecap="round" />
      {/* Rider head */}
      <circle cx="38" cy="13" r="4" fill={MEDIUM} />
    </svg>
  );
}

function SwimmingSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={ICE} />
      {/* Water waves */}
      <path d="M4 34C12 30 18 38 26 34C34 30 40 38 48 34" stroke={SKY} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M4 40C12 36 18 44 26 40C34 36 40 44 48 40" stroke={MEDIUM} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M4 46C12 42 18 50 26 46C34 42 40 50 48 46" stroke={SKY} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
      {/* Swimmer */}
      <circle cx="32" cy="20" r="4" fill={DARK} />
      <path d="M28 24L16 28" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 24L38 28" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 28L44 24" stroke={DARK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY 11: ART (الفنون) - NEW
   ═══════════════════════════════════════════ */

function PaletteSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#F3E5F5" />
      {/* Palette shape */}
      <path d="M28 10C18 10 10 18 10 28C10 38 18 46 28 46C30 46 32 44 32 42C32 40 30 39 30 37C30 35 32 33 34 33H38C44 33 48 29 48 23C48 16 39 10 28 10Z" fill={CREAM} stroke={DARK} strokeWidth="1.5" />
      {/* Color dots */}
      <circle cx="20" cy="22" r="3.5" fill="#E57373" />
      <circle cx="28" cy="18" r="3.5" fill="#FFD54F" />
      <circle cx="36" cy="22" r="3.5" fill="#4FC3F7" />
      <circle cx="16" cy="32" r="3.5" fill="#66BB6A" />
      <circle cx="24" cy="38" r="3" fill={SKY} />
    </svg>
  );
}

function CameraSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#ECEFF1" />
      {/* Camera body */}
      <rect x="10" y="18" width="36" height="24" rx="4" fill={DARK} />
      <rect x="12" y="20" width="32" height="20" rx="3" fill={MEDIUM} opacity="0.2" />
      {/* Flash/viewfinder */}
      <rect x="22" y="12" width="12" height="8" rx="2" fill={NAVY} />
      {/* Lens */}
      <circle cx="28" cy="32" r="8" fill={ICE} stroke={NAVY} strokeWidth="2" />
      <circle cx="28" cy="32" r="5" fill={SKY} />
      <circle cx="28" cy="32" r="2.5" fill={NAVY} opacity="0.5" />
      {/* Flash dot */}
      <circle cx="38" cy="22" r="1.5" fill={WHITE} opacity="0.6" />
    </svg>
  );
}

function BrushSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#FFF3E0" />
      {/* Brush handle */}
      <rect x="26" y="8" width="4" height="24" rx="2" fill={NAVY} />
      {/* Ferrule */}
      <rect x="24" y="30" width="8" height="4" rx="1" fill={MEDIUM} />
      {/* Bristles */}
      <path d="M22 34Q28 48 34 34" fill={DARK} />
      <path d="M24 34Q28 46 32 34" fill={MEDIUM} opacity="0.4" />
      {/* Paint splashes */}
      <circle cx="14" cy="44" r="3" fill={SKY} opacity="0.5" />
      <circle cx="40" cy="42" r="2.5" fill="#E57373" opacity="0.4" />
      <circle cx="42" cy="48" r="1.5" fill="#FFD54F" opacity="0.5" />
      <circle cx="10" cy="48" r="2" fill="#66BB6A" opacity="0.4" />
    </svg>
  );
}

function BookSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill="#E8F5E9" />
      {/* Open book */}
      <path d="M8 16L28 12L48 16V44L28 40L8 44V16Z" fill={CREAM} stroke={DARK} strokeWidth="1.5" />
      {/* Spine */}
      <line x1="28" y1="12" x2="28" y2="40" stroke={DARK} strokeWidth="1.5" />
      {/* Left page lines */}
      <line x1="12" y1="22" x2="24" y2="20" stroke={MEDIUM} strokeWidth="0.8" opacity="0.5" />
      <line x1="12" y1="26" x2="24" y2="24" stroke={MEDIUM} strokeWidth="0.8" opacity="0.5" />
      <line x1="12" y1="30" x2="24" y2="28" stroke={MEDIUM} strokeWidth="0.8" opacity="0.5" />
      <line x1="12" y1="34" x2="24" y2="32" stroke={MEDIUM} strokeWidth="0.8" opacity="0.5" />
      {/* Right page lines */}
      <line x1="32" y1="20" x2="44" y2="22" stroke={MEDIUM} strokeWidth="0.8" opacity="0.5" />
      <line x1="32" y1="24" x2="44" y2="26" stroke={MEDIUM} strokeWidth="0.8" opacity="0.5" />
      <line x1="32" y1="28" x2="44" y2="30" stroke={MEDIUM} strokeWidth="0.8" opacity="0.5" />
      <line x1="32" y1="32" x2="44" y2="34" stroke={MEDIUM} strokeWidth="0.8" opacity="0.5" />
      {/* Bookmark */}
      <path d="M36 12L36 20L38 18L40 20L40 12" fill={SKY} />
    </svg>
  );
}

/* ── Map of avatar id to SVG component ── */
const avatarSvgs: Record<string, () => React.ReactElement> = {
  // Nature
  'avatar:leaf': LeafSvg,
  'avatar:flower': FlowerSvg,
  'avatar:tree': TreeSvg,
  'avatar:sun': SunSvg,
  // Wellness
  'avatar:brain': BrainSvg,
  'avatar:heart': HeartSvg,
  'avatar:peace': PeaceSvg,
  'avatar:star': StarSvg,
  // Abstract
  'avatar:circles': CirclesSvg,
  'avatar:waves': WavesSvg,
  'avatar:gem': GemSvg,
  'avatar:moon': MoonSvg,
  // Animals
  'avatar:bird': BirdSvg,
  'avatar:cat': CatSvg,
  'avatar:fish': FishSvg,
  'avatar:butterfly': ButterflySvg,
  // People (NEW)
  'avatar:smile': SmileSvg,
  'avatar:thinker': ThinkerSvg,
  'avatar:hug': HugSvg,
  'avatar:student': StudentSvg,
  // Emotions (NEW)
  'avatar:happy': HappySvg,
  'avatar:calm': CalmSvg,
  'avatar:love': LoveSvg,
  'avatar:hope': HopeSvg,
  // Space (NEW)
  'avatar:planet': PlanetSvg,
  'avatar:rocket': RocketSvg,
  'avatar:comet': CometSvg,
  'avatar:galaxy': GalaxySvg,
  // Music (NEW)
  'avatar:note': NoteSvg,
  'avatar:headphones': HeadphonesSvg,
  'avatar:guitar': GuitarSvg,
  'avatar:piano': PianoSvg,
  // Food (NEW)
  'avatar:coffee': CoffeeSvg,
  'avatar:cupcake': CupcakeSvg,
  'avatar:fruit': FruitSvg,
  'avatar:tea': TeaSvg,
  // Sports (NEW)
  'avatar:yoga': YogaSvg,
  'avatar:running': RunningSvg,
  'avatar:cycling': CyclingSvg,
  'avatar:swimming': SwimmingSvg,
  // Art (NEW)
  'avatar:palette': PaletteSvg,
  'avatar:camera': CameraSvg,
  'avatar:brush': BrushSvg,
  'avatar:book': BookSvg,
};

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
  // People (شخصيات) - NEW
  { id: 'avatar:smile', name: 'ابتسامة', category: 'people' },
  { id: 'avatar:thinker', name: 'مفكر', category: 'people' },
  { id: 'avatar:hug', name: 'عناق', category: 'people' },
  { id: 'avatar:student', name: 'طالب', category: 'people' },
  // Emotions (المشاعر) - NEW
  { id: 'avatar:happy', name: 'سعادة', category: 'emotions' },
  { id: 'avatar:calm', name: 'هدوء', category: 'emotions' },
  { id: 'avatar:love', name: 'حب', category: 'emotions' },
  { id: 'avatar:hope', name: 'أمل', category: 'emotions' },
  // Space (الفضاء) - NEW
  { id: 'avatar:planet', name: 'كوكب', category: 'space' },
  { id: 'avatar:rocket', name: 'صاروخ', category: 'space' },
  { id: 'avatar:comet', name: 'مذنب', category: 'space' },
  { id: 'avatar:galaxy', name: 'مجرة', category: 'space' },
  // Music (الموسيقى) - NEW
  { id: 'avatar:note', name: 'نغمة', category: 'music' },
  { id: 'avatar:headphones', name: 'سماعات', category: 'music' },
  { id: 'avatar:guitar', name: 'جيتار', category: 'music' },
  { id: 'avatar:piano', name: 'بيانو', category: 'music' },
  // Food (الطعام) - NEW
  { id: 'avatar:coffee', name: 'قهوة', category: 'food' },
  { id: 'avatar:cupcake', name: 'كب كيك', category: 'food' },
  { id: 'avatar:fruit', name: 'فاكهة', category: 'food' },
  { id: 'avatar:tea', name: 'شاي', category: 'food' },
  // Sports (الرياضة) - NEW
  { id: 'avatar:yoga', name: 'يوجا', category: 'sports' },
  { id: 'avatar:running', name: 'جري', category: 'sports' },
  { id: 'avatar:cycling', name: 'دراجة', category: 'sports' },
  { id: 'avatar:swimming', name: 'سباحة', category: 'sports' },
  // Art (الفنون) - NEW
  { id: 'avatar:palette', name: 'لوحة ألوان', category: 'art' },
  { id: 'avatar:camera', name: 'كاميرا', category: 'art' },
  { id: 'avatar:brush', name: 'فرشاة', category: 'art' },
  { id: 'avatar:book', name: 'كتاب', category: 'art' },
];

/* ── Category labels in Arabic ── */
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
