---
name: Modern Wellness System
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#404849'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#707979'
  outline-variant: '#bfc8c8'
  surface-tint: '#306669'
  primary: '#002b2d'
  on-primary: '#ffffff'
  primary-container: '#004346'
  on-primary-container: '#7aafb2'
  inverse-primary: '#9ad0d3'
  secondary: '#4e6071'
  on-secondary: '#ffffff'
  secondary-container: '#cee2f6'
  on-secondary-container: '#526576'
  tertiary: '#002a37'
  on-tertiary: '#ffffff'
  tertiary-container: '#004154'
  on-tertiary-container: '#6eaec9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b6ecef'
  primary-fixed-dim: '#9ad0d3'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#134e51'
  secondary-fixed: '#d1e5f9'
  secondary-fixed-dim: '#b5c9dc'
  on-secondary-fixed: '#091d2c'
  on-secondary-fixed-variant: '#364959'
  tertiary-fixed: '#bbe9ff'
  tertiary-fixed-dim: '#8fcfeb'
  on-tertiary-fixed: '#001f29'
  on-tertiary-fixed-variant: '#004d63'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-bold:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system establishes a high-performance digital environment for mental wellness, balancing professional clinical depth with energetic vitality. The aesthetic is defined by **Modern Glassmorphism**, utilizing translucent layers and vibrant gradients to move away from the "sterile" feel of traditional healthcare. 

The atmosphere is intentionally supportive yet forward-leaning, designed to evoke feelings of clarity, progress, and safety. By merging deep, grounding tones with ethereal light effects, the UI provides a sense of "digital sanctuary" that feels both premium and accessible. It prioritizes a seamless RTL (Right-to-Left) experience, ensuring the visual flow is natural and intuitive for Arabic-speaking users.

## Colors

The palette is anchored by **Warm Off-White (#F8F5F0)**, which provides a soft, non-intrusive canvas that reduces eye strain compared to pure white. 

- **Core Depth:** Deep Navy (#172A39) is used for primary text and structural elements to convey authority and trust.
- **Vibrancy:** Energetic Teal (#004346) serves as the primary action color, while Light Accent Blue (#73B3CE) handles interactive highlights.
- **Glass Effects:** Soft Cyan (#D6F3F4) is utilized at low opacities (10-30%) for frosted glass overlays and subtle background glows.
- **Gradients:** Use linear gradients starting from Deep Navy to Energetic Teal, occasionally terminating in Soft Cyan to represent a journey from darkness to light/clarity.

## Typography

**Manrope** is the sole typeface for this design system, chosen for its exceptional geometric clarity and modern terminal cuts. It scales beautifully for both English and Arabic scripts, maintaining a professional yet rhythmic cadence.

For RTL layouts, ensure line heights are increased by approximately 10-15% to accommodate Arabic diacritics without crowding the text blocks. Headlines should use tighter tracking (-0.02em) to feel "sleek" and modern, while body text remains neutral for maximum legibility during therapeutic reading or journaling.

## Layout & Spacing

This design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile devices. The spacing rhythm is based on an 8px scale, with a 12px "half-step" specifically reserved for internal component padding.

Layouts should favor generous whitespace (using `lg` and `xl` spacing tokens) to prevent cognitive overload. Elements are grouped using containment rather than heavy borders, relying on the grid's gutters to create a sense of organized, breathable structure. Margins are intentionally wide to center the user's focus on the content.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and soft, tinted shadows. Rather than using traditional grey dropshadows, this system employs "Ambient Tinted Shadows"—low-opacity shadows that take on a hint of the Deep Navy or Energetic Teal primary colors.

- **Level 1 (Base):** Flat on the Warm Off-White background.
- **Level 2 (Cards):** 10-15% opacity white fill with a 40px blur, a 1px semi-transparent border (#FFFFFF 40%), and a soft navy-tinted shadow.
- **Level 3 (Modals/Popovers):** Heavier background blur (20px+) with a distinct "frosting" effect. 

Use vibrant radial gradients (Cyan at 10% opacity) in the background behind glass layers to create a sense of light source and "energetic" depth.

## Shapes

The shape language is defined by **Round 12** logic. Standard UI components like input fields and small buttons use a 12px corner radius (`rounded-lg` in this system's scale). 

Large containers and feature cards utilize a more pronounced 24px radius to feel friendly and safe. This consistency in rounding helps soften the professional navy tones, making the digital environment feel more "organic" and human-centric. High-quality iconography should follow this rule, using rounded terminals rather than sharp corners.

## Components

- **Buttons:** Primary buttons use the Navy-to-Teal gradient with white text. Secondary buttons are "Ghost" style with a 1px Energetic Teal border and subtle Cyan hover states. All buttons maintain a 12px radius.
- **Cards:** Use the Level 2 Elevation glassmorphism style. For mental health tracking or progress cards, use a Soft Cyan background with 50% opacity to highlight "positive" data.
- **Input Fields:** Backgrounds are slightly darker than the page background (a tint of Muted Teal) with a 12px radius. On focus, the border transitions to a vibrant Light Accent Blue glow.
- **Chips/Labels:** Use pill-shaped (fully rounded) forms with Muted Teal backgrounds and Deep Navy text for categorization.
- **Lists:** Items are separated by generous padding and subtle, low-contrast Cyan dividers rather than harsh lines.
- **Iconography:** Use a "Dual-Tone" style where the primary stroke is Deep Navy and a secondary accent element is Soft Cyan. Icons must be clear and non-abstract to support emotional accessibility.