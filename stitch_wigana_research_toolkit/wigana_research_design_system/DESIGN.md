---
name: Wigana Research Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#434655'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 16px
  gutter: 12px
---

## Brand & Style
The design system for Wigana Research Toolkit (WRT) is built on the pillars of **Modern Enterprise** and **Academic Precision**. It strikes a balance between professional data management and cutting-edge AI capability. The interface is designed to evoke a sense of trust, intellectual rigor, and technological sophistication.

The visual style utilizes **Corporate Modernism** with a high-tech edge. It leverages "Glassmorphism" for specialized AI overlays and modal states to maintain context while surfacing insights. The aesthetic is clean and organized, prioritizing the legibility of complex research data while remaining approachable through a refined mobile-first layout.

## Colors
The palette is rooted in "Professional Blue" to establish institutional authority and "Emerald Green" to signal growth and validation. A signature linear gradient is used sparingly for primary actions, progress indicators, and brand-defining moments (like AI insight headers).

**Dark Mode Implementation:**
In dark mode, the neutral background shifts to a deep navy (#0F172A). Surface containers use a slightly lighter slate (#1E293B) to maintain depth. Primary and secondary colors remain consistent but are paired with higher-contrast text to ensure accessibility standards are met for academic readability.

## Typography
This design system employs **Hanken Grotesk** as the primary typeface for its sharp, contemporary feel and excellent legibility in data-dense environments. For technical data, code snippets, or research metadata (like "Anomaly IDs"), **JetBrains Mono** is introduced to provide a clear visual distinction between narrative content and raw data.

Hierarchies are strictly enforced to guide the researcher's eye. Bold weights are reserved for high-level summaries and critical metrics, while medium weights are used for UI labels to ensure clarity at small sizes on mobile displays.

## Layout & Spacing
A **fluid grid** model is utilized, optimized for mobile-first consumption. On mobile devices, the layout uses a single-column structure with 16px side margins. Data is encapsulated in "High-Density Cards" that maximize horizontal space.

**Mobile Data Strategy:**
To manage high-density research data, the system employs "Progressive Disclosure." Cards display primary metrics (Status, ID, Primary Value) in the collapsed state. A toggle expands the card to reveal secondary data, charts, and AI-generated insights. This prevents cognitive overload while keeping all information accessible within a single thumb-scroll.

## Elevation & Depth
Hierarchy is established through a combination of **Tonal Layers** and **Soft Ambient Shadows**. 

1.  **Base Layer:** The canvas background (Light: #F8FAFC, Dark: #0F172A).
2.  **Surface Layer:** Cards and containers use a white/deep-slate fill with a 2px "Soft Shadow" (0px 4px 12px rgba(0,0,0,0.05)) to lift them slightly from the background.
3.  **Glass Layer:** Overlays, navigation bars, and AI insight panels use a backdrop-blur (12px) with a semi-transparent fill (80% opacity). This creates a "Modern Enterprise" feel that feels lightweight and contextual.
4.  **Action Layer:** Floating Action Buttons (FABs) and active tooltips use a more pronounced shadow to indicate interactivity.

## Shapes
The design system follows a consistent **16px (1rem) corner radius** for all primary containers, including cards, modals, and input fields. This generous rounding softens the "Academic" feel, making the tool feel more like a modern AI assistant than a rigid legacy database.

Smaller elements like buttons and badges use a 8px (0.5rem) radius to maintain a structural relationship with the larger containers while appearing more "clickable" and precise.

## Components

**Buttons & Actions**
Primary buttons utilize the brand gradient with white text. Secondary buttons use a Professional Blue outline. All buttons maintain a minimum tap target of 48px for mobile ergonomics.

**Research Cards**
The core of the UI. Cards feature a "Status Stripe" on the left edge (Green, Orange, or Red) to provide immediate visual context. The header area includes a title and a "Collapse/Expand" chevron.

**Input Fields**
Fields use 16px rounded corners with a subtle 1px border. In the focused state, the border transitions to Professional Blue with a soft glow effect. Label text is positioned above the field using the JetBrains Mono label style.

**Chips & Status Badges**
Used for filtering research tags or showing validation states. Badges use a soft tinted background (e.g., 10% opacity Emerald Green) with high-contrast text for maximum readability without visual noise.

**Collapsible AI Insights**
A specialized container with a glassmorphic background and an Emerald Green border-left. This section is used specifically for AI-generated anomalies or research summaries, visually separating "Machine Logic" from "Raw Data."