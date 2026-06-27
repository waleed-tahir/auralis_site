---
name: Obsidian Flux
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c1c6d7'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#8b90a0'
  outline-variant: '#414755'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e69'
  primary-container: '#4b8eff'
  on-primary-container: '#00285c'
  inverse-primary: '#005bc1'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffb595'
  on-tertiary: '#571e00'
  tertiary-container: '#ef6719'
  on-tertiary-container: '#4c1a00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 13px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 20px
---

## Brand & Style

This design system is built on the philosophy of **Focus and Depth**. It targets high-performance users who require a distraction-free environment that feels both expansive and grounded. The aesthetic is a sophisticated blend of **Minimalism** and **Glassmorphism**, leveraging high-contrast "true black" backgrounds to create a sense of infinite space, where content floats as luminous, tactile layers.

The emotional response is one of calm authority and technical precision. By utilizing physical metaphors like "rim lighting" and "acrylic materiality," the UI moves away from flat digital planes toward a tangible, 3D workspace. It is designed to feel like a high-end physical tool—cold to the touch but responsive and alive in motion.

## Colors

The palette is anchored by a **Deep True-Black (#000000)** base layer, maximizing the contrast ratios of OLED displays and reducing visual noise. 

- **Primary Accent:** A Cool Electric Blue (#007AFF) is used sparingly for primary actions and active states, providing a high-energy focal point against the dark background.
- **Surface Neutrals:** Rather than solid grays, surfaces utilize varying opacities of white (10% to 25%) over the black base to create the "Acrylic" effect.
- **Typography Neutrals:** Primary text is pure white. Secondary information uses neutral grays at 85% opacity, while tertiary or disabled labels drop to 40% opacity.
- **State Logic:** Status indicators use high-vibrancy semantic colors with a slight inner glow to maintain the "luminous" theme.

## Typography

The typography system uses **Inter** (as a high-fidelity proxy for SF Pro) to ensure maximum legibility and a systematic, technical feel. **JetBrains Mono** is introduced for labels and small data points to reinforce the "utility" aspect of the brand.

- **Headlines:** Use tighter letter spacing and heavier weights to create strong visual anchors on the page.
- **Body:** Optimized for readability with a slightly increased line height (1.4x) to ensure the text doesn't feel cramped against the dark background.
- **Controls:** All interactive labels and button text use a medium weight to stand out against the glass surfaces.

## Layout & Spacing

The layout is governed by a **16-point adaptive grid**. This provides a generous, airy feel that prevents the dark UI from feeling claustrophobic.

- **Mobile Philosophy:** A fluid vertical scroll with a 20px outer safety margin.
- **Rhythm:** Elements are spaced in multiples of 8px or 16px. Large content blocks should favor 24px or 32px of vertical padding to maintain the "Focus" aspect of the philosophy.
- **Safe Areas:** Adhere strictly to device notches and home indicators, using them as natural boundaries for the deep-black base layer.

## Elevation & Depth

Depth is the primary communicator of hierarchy in this design system. It is achieved through **Materiality** rather than traditional dropshadows.

1.  **The Void (Base):** The #000000 background is the lowest level.
2.  **Acrylic Layers (Surfaces):** Floating cards use a backdrop-blur (20px to 40px) combined with a semi-transparent white fill.
3.  **Rim Lighting:** Every elevated surface features a 0.5pt white inner stroke (opacity 15-20%) on the top and left edges to simulate a "studio-quality" light source from above. This creates a 3D, lifted appearance.
4.  **Motion Physics:** Interactions use spring-damping physics. Transitions should feel heavy and intentional (high mass), with very little "bounce" (low friction), emphasizing the system's stability.

## Shapes

The design system utilizes **system-level squircles** (continuous curvature) rather than standard border-radii to achieve a high-end, integrated look.

- **Primary Containers:** 16px (rounded-lg) for cards and main UI blocks.
- **Interactive Elements:** 12px (standard) for buttons and inputs.
- **Small Elements:** 8px (rounded-sm) for chips and tags.
- **Visual Consistency:** The squircles ensure that even with heavy blurring and transparency, the edges of the UI feel soft and intentional.

## Components

### Buttons
Primary buttons are solid Electric Blue with white text. Secondary buttons are "Glass" style: a subtle white tint (15%), heavy backdrop blur, and a 1px rim-light stroke.

### Input Fields
Inputs are defined by their bottom border and a subtle glass background. On focus, the rim-light stroke intensifies to the Primary Accent color.

### Cards
Cards are the primary expression of the "Acrylic" effect. They must always have a backdrop-blur of at least 20px to remain legible over background content. They feature a 1px stroke at 10% white to define their boundaries.

### Chips & Badges
Small, pill-shaped elements with 40% opacity gray backgrounds for passive states, and low-opacity Electric Blue for active/selected states.

### Lists
List items are separated by thin, 0.5px lines at 10% white opacity. Active list items use a slight "lift" effect—increasing the background opacity and adding a subtle inner glow.

### Motion Details
All component states (hover, press, toggle) must use the defined spring-physics. A "press" state should slightly scale the element down (98%) to simulate physical compression.