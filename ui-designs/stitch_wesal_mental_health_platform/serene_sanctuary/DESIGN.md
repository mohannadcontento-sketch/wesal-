---
name: Serene Sanctuary
colors:
  surface: '#f8f9f9'
  surface-dim: '#d9dada'
  surface-bright: '#f8f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f3'
  surface-container: '#edeeee'
  surface-container-high: '#e7e8e8'
  surface-container-highest: '#e1e3e2'
  on-surface: '#191c1c'
  on-surface-variant: '#404849'
  inverse-surface: '#2e3131'
  inverse-on-surface: '#f0f1f0'
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
  tertiary: '#002b31'
  on-tertiary: '#ffffff'
  tertiary-container: '#00434b'
  on-tertiary-container: '#77b0b9'
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
  tertiary-fixed: '#b2ecf6'
  tertiary-fixed-dim: '#96d0da'
  on-tertiary-fixed: '#001f24'
  on-tertiary-fixed-variant: '#094e57'
  background: '#f8f9f9'
  on-background: '#191c1c'
  surface-variant: '#e1e3e2'
typography:
  display:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h2:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  h3:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.5'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The brand personality is anchored in empathy, discretion, and professional clinical care. It aims to reduce the anxiety often associated with seeking mental health support by providing a digital environment that feels like a quiet, warm office rather than a cold medical institution. 

This design system employs a **Modern Minimalist** style with **Organic** influences. By prioritizing generous whitespace and a restricted, nature-inspired palette, the interface lowers cognitive load. The visual language is intentionally soft, avoiding sharp edges or aggressive transitions to evoke a sense of safety and continuity. Every element is designed to feel intentional and stable, reinforcing the platform's role as a reliable partner in a user's wellness journey.

## Colors
The palette is built on a foundation of warmth and clinical depth. The Off-White background is the primary canvas, chosen specifically to reduce eye strain and provide a "paper-like" warmth that stark white lacks.

**Dark Navy** serves as the anchor for structural elements and high-contrast typography, ensuring maximum legibility. **Deep Teal** is reserved for primary actions, providing a sophisticated alternative to standard "call-to-action" colors. **Muted Teal** and **Light Accent** are used for secondary information architecture, creating a gentle hierarchy. **Soft Cyan** is used for non-intrusive background surfaces and state indicators, providing a subtle visual "breath" within the layout.

## Typography
The typography system uses **Manrope** for headlines and **Inter** for body text. This combination bridges the gap between modern tech and professional healthcare. 

For the Arabic implementation, fonts like IBM Plex Sans Arabic or Cairo must be paired to match the weight and x-height of the Latin counterparts. Headlines should remain bold and grounded in Dark Navy, while body text utilizes a slightly increased line height (1.6) to ensure effortless readability, which is critical for therapeutic content. All type scales must be mirrored for RTL support, ensuring that right-aligned text maintains proper optical balance.

## Layout & Spacing
This design system utilizes a **Fixed Grid** philosophy on desktop and a **Fluid Grid** on mobile devices. A 12-column grid is standard, with generous 24px gutters to prevent elements from feeling crowded. 

The spacing rhythm is based on a 4px baseline, but defaults to larger increments (16px, 24px, 40px) to maintain the brand’s promise of "ample whitespace." Vertical margins between sections should be expansive (64px+) to create a sense of calm and clarity. For RTL layouts, the grid and flex directions are completely inverted, ensuring that the visual "start" of the page is always on the right.

## Elevation & Depth
Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. Instead of harsh drop shadows, this design system uses highly diffused, low-opacity shadows with a slight Dark Navy (#172A39) tint to make them feel integrated with the environment.

Depth is used sparingly to signify "interactive" vs. "informative."
- **Level 0 (Floor):** The Off-White background.
- **Level 1 (Cards):** Soft Cyan or White surfaces with a subtle 1px border (#73B3CE at 20% opacity) and no shadow.
- **Level 2 (Active Elements):** Elements like active session cards use an ambient shadow (Blur: 20px, Y: 4px, Opacity: 5%).
- **Level 3 (Overlays):** Modals and dropdowns use a deeper shadow to pull them forward from the background.

## Shapes
The shape language is defined by a consistent **Rounded** (0.5rem) corner radius. This choice softens the overall appearance of the platform, making it feel more approachable and less rigid. 

Larger containers, such as hero sections or main content cards, should utilize `rounded-xl` (1.5rem) to emphasize a "container of safety" feel. Buttons and input fields should strictly adhere to the standard `rounded-md` (0.5rem) to maintain professional alignment. Circular shapes are reserved exclusively for avatars and status indicators.

## Components
- **Buttons:** Primary buttons use the Deep Teal gradient with white text. Secondary buttons use a Light Accent border with Dark Navy text. Use 16px horizontal padding to give text plenty of room.
- **Input Fields:** Use a subtle Soft Cyan background for the field to differentiate it from the page background. Labels should be in Dark Navy, and the focus state should be a 2px Deep Teal border.
- **Chips & Badges:** Use Soft Cyan with Muted Teal text for "Tags" or "Specialties." These should have a pill-shape (full roundedness) to contrast against the standard rounded buttons.
- **Cards:** Cards are the primary vessel for information. They should have a 1px border of `#73B3CE` at low opacity. For patient privacy, "Sensitive" cards should include a subtle blur overlay that requires an intentional click to reveal content.
- **Progress Indicators:** Use the Primary Gradient for progress bars to symbolize growth and movement.
- **RTL Considerations:** All icons (except those that are symmetrical) must be flipped for RTL. Chevrons, back arrows, and search icons must reflect the right-to-left reading direction.