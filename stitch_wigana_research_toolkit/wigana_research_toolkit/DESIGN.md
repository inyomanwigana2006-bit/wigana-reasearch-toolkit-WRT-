---
name: Wigana Research Toolkit
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#404752'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707783'
  outline-variant: '#c0c7d4'
  surface-tint: '#0061a5'
  primary: '#0061a5'
  on-primary: '#ffffff'
  primary-container: '#4da6ff'
  on-primary-container: '#003a67'
  inverse-primary: '#a0caff'
  secondary: '#0055c9'
  on-secondary: '#ffffff'
  secondary-container: '#036cfb'
  on-secondary-container: '#fefcff'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#0cb880'
  on-tertiary-container: '#00412b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0caff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#00497e'
  secondary-fixed: '#dae2ff'
  secondary-fixed-dim: '#b1c5ff'
  on-secondary-fixed: '#001946'
  on-secondary-fixed-variant: '#00419e'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
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
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  panel-sidebar: 280px
  panel-content: 1fr
  panel-inspector: 320px
  gutter: 24px
  container-padding: 32px
  stack-gap: 16px
---

## Brand & Style

The design system is engineered for high-density academic and enterprise research. It bridges the gap between the functional rigor of legacy statistical software and the fluid, intuitive experience of modern productivity tools. The personality is authoritative yet accessible—prioritizing clarity of data over decorative flourish.

The visual style is **Corporate Modern** with a focus on structural precision. It utilizes a refined three-panel architecture to manage complex information hierarchies, ensuring that researchers can transition from high-level data overviews to granular analysis without cognitive overload. The aesthetic is defined by "Analytical Transparency"—using subtle glassmorphism and clear borders to create a workspace that feels light, organized, and scientifically rigorous.

## Colors

The palette is anchored in a spectrum of "Scientific Blues" to evoke trust and stability. 
- **Primary & Accent:** The primary blue (#4DA6FF) is used for active states and highlights, while the deeper accent blue (#0D6EFD) drives primary actions and brand presence.
- **Backgrounds:** The primary workspace uses a very light cool-tinted white (#F8FBFF) to reduce eye strain during long research sessions, contrasting with pure white cards.
- **Status Tones:** A strict semantic system is used for data validation: Emerald for Valid, Amber for Anomalies, and Rose for Invalid entries.
- **Borders:** A soft, cool-grey border (#E4EDF8) defines the structural grid without creating visual noise.

## Typography

This design system employs a tiered typography strategy to handle varied data types. 
- **Headlines:** Hanken Grotesk provides a sharp, contemporary professional feel for page titles and section headers.
- **Body & UI:** Inter is the workhorse for all interface elements and descriptive text, chosen for its exceptional legibility at small sizes.
- **Data & Tables:** JetBrains Mono is utilized for raw data strings, coordinates, and mathematical outputs to ensure character alignment and distinction (e.g., O vs 0).

## Layout & Spacing

The layout follows a **Three-Panel Fixed Grid** philosophy tailored for desktop environments:
1.  **Navigation Panel (Left):** 280px width. Glassmorphic texture. Houses the research hierarchy and project file tree.
2.  **Analysis Canvas (Center):** Fluid width. The main staging area for data tables and visualization cards.
3.  **Inspector/Properties (Right):** 320px width. Contextual tools for the selected data point or chart.

The spacing rhythm is based on an **8px linear scale**, favoring generous margins (32px) at the container level to maintain an "academic" feel of whitespace, while using tighter gaps (12px-16px) inside cards to maximize data density.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Subtle Diffusion**:
- **Level 0 (Base):** The #F8FBFF background.
- **Level 1 (Panels):** The sidebar uses a `backdrop-filter: blur(20px)` with a 60% white opacity, creating a sense of physical layering over the content.
- **Level 2 (Cards):** Analytics cards use a pure white background with a very soft, large-radius shadow: `0 4px 20px rgba(13, 110, 253, 0.04)`. This blue-tinted shadow keeps the "cool" temperature of the design.
- **Level 3 (Popovers/Modals):** These use a more pronounced shadow and a 1px border of #E4EDF8 to separate them from the analysis canvas.

## Shapes

The shape language is **Soft (0.25rem)**. This avoids the industrial harshness of sharp corners while remaining more professional and "buttoned-up" than fully rounded lifestyle apps. 
- Standard buttons and input fields use a **4px radius**.
- Analytics cards and large panels use a **8px radius** (rounded-lg) to provide a gentle container for complex data.
- Status badges use a **full pill-shape** to distinguish them clearly from interactive buttons.

## Components

### Buttons
- **Primary:** Solid #0D6EFD with white text. 4px radius. 
- **Secondary:** Transparent background with #0D6EFD border and text.
- **Ghost:** Used in the three-panel navigation for low-priority actions.

### Data Tables
- **Header:** Light grey #F1F5F9 background, bold Inter 12px text.
- **Rows:** 40px height. Subtle #E4EDF8 bottom border. Alternate row striping is not used; instead, use hover-state highlights in #F8FBFF.
- **Cells:** Use JetBrains Mono for numeric values to ensure decimal alignment.

### Analytics Cards
- White background, 8px radius, 1px border #E4EDF8.
- Header contains a Title (Hanken Grotesk) and an optional "Info" icon.
- Content area for charts or summary statistics.

### Status Badges
- **Valid:** Light green tint background with dark green text.
- **Anomaly:** Light amber tint background with dark amber text.
- **Invalid:** Light red tint background with dark red text.
- Style: 10px bold Inter, uppercase, pill-shaped.

### Input Fields
- 1px solid #E4EDF8 border. On focus, the border changes to #4DA6FF with a 2px soft blue outer glow.
- Labels are positioned above the field in `label-caps` style.