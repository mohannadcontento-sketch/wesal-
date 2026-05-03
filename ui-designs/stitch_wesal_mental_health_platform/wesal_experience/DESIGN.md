---
name: Wesal Experience
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
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

This design system is built upon the pillars of sanctuary and connectivity. The brand personality is grounded, empathetic, and technologically refined, aiming to bridge the gap between clinical reliability and personal warmth. The target audience includes individuals seeking a secure harbor for mental exploration and professional support.

The visual style is a sophisticated blend of **Modern Minimalism** and **Glassmorphism**. By utilizing translucent layers and soft background blurs, the UI evokes a sense of "transparency" and "clarity," which are vital for a private mental wellness platform. The aesthetic avoids the coldness of traditional medical apps, instead opting for an atmosphere that feels like a quiet, sun-drenched interior.

## Colors

The palette is anchored in deep, oceanic tones to represent stability and depth. **Deep Teal** serves as the primary brand driver, symbolizing health and rejuvenation. **Navy** is reserved for high-contrast elements and core grounding components to instill a sense of institutional trust and privacy.

**Off-White** provides a warm, non-clinical foundation for the background, while **Soft Cyan** and **Light Accent** are used for interactive surfaces and glassmorphic highlights. The signature **Navy-Teal-Cyan gradient** should be used sparingly for immersive backgrounds, primary call-to-actions, or progress indicators to signify a journey toward clarity.

## Typography

**Manrope** is used exclusively to maintain a modern, systematic feel. It provides the perfect balance between geometric precision and organic warmth. 

Headlines utilize tighter tracking and heavier weights to provide clear hierarchy and a sense of authority. Body text is prioritized for legibility with generous line heights, ensuring that users in various emotional states can consume information without fatigue. Labels utilize slightly increased letter spacing to remain distinct even at smaller sizes.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to ensure content remains focused and manageable, while transitioning to a fluid model for mobile. A 12-column grid is used with 24px gutters.

Spacing follows a strict 8px rhythm to maintain visual harmony. Generous whitespace (macro-spacing) is encouraged to reduce cognitive load, particularly in journaling or therapeutic modules. Elements are often centered to create a focused, intentional user experience, drawing inspiration from high-end productivity and wellness tools.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and tonal layering. Rather than traditional heavy shadows, depth is achieved through:

1.  **Backdrop Blurs:** Surfaces use a 12px to 20px blur to separate themselves from the background.
2.  **Translucent Borders:** Elements are defined by 1px solid borders in `Light Accent` or white at 20-40% opacity.
3.  **Soft Ambient Shadows:** When required, shadows should be highly diffused (20px+ blur), low opacity (8-12%), and tinted with the `Navy` primary color to maintain a cohesive atmosphere.
4.  **Luminance Tiering:** Deeper content levels use more opaque versions of `Soft Cyan`, while top-level modals use higher transparency and stronger blurs.

## Shapes

The shape language is consistently **Rounded**. This choice avoids the aggression of sharp corners while maintaining more structure than a fully organic/blob-based system. 

The standard `0.5rem` radius applies to cards and input fields. Larger containers, such as modal overlays or highlighted feature sections, utilize the `rounded-xl` (1.5rem) setting to create a "container within a container" feel that feels protective and modern.

## Components

### Buttons
Primary buttons utilize the **Navy-Teal-Cyan gradient** with white text. Secondary buttons use a `Muted Teal` ghost style with a subtle 1px border. Hover states should include a slight increase in backdrop-blur or a subtle scale-up effect (1.02x).

### Cards
Cards are the primary vehicle for content. They must feature a glassmorphic treatment: a semi-transparent `Soft Cyan` or white fill, a subtle 1px border, and a 16px backdrop-filter blur.

### Input Fields
Inputs use the `Off-White` background with a 1px `Light Accent` border. Upon focus, the border transitions to `Deep Teal` with a soft outer glow. Placeholders should be in a low-contrast `Muted Teal`.

### Chips & Tags
Chips are pill-shaped (rounded-full) and use a solid `Soft Cyan` background with `Deep Teal` text for high legibility in categorization tasks.

### Additional Components
*   **Mood Sliders:** Custom sliders using the primary gradient for the track and a large, soft-shadowed white thumb.
*   **Privacy Indicators:** Persistent, subtle badges in the header or footer using the `Navy` tone to remind users of their secure connection.
*   **Journaling Interface:** A distraction-free mode that removes all navigation, leaving only a centered, glassmorphic text container.