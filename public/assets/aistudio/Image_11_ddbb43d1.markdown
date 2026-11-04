---
name: DevPulse High-Tech Telemetry
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#b9cbbc'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#849587'
  outline-variant: '#3b4a3f'
  surface-tint: '#00e38b'
  primary: '#f4fff3'
  on-primary: '#00391f'
  primary-container: '#00ff9d'
  on-primary-container: '#007143'
  inverse-primary: '#006d40'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#fffaff'
  on-tertiary: '#67001b'
  tertiary-container: '#ffd5d6'
  on-tertiary-container: '#c2133e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#56ffa8'
  primary-fixed-dim: '#00e38b'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#00522f'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  code-display:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  code-body:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.5rem
  margin: 1.5rem
  margin-mobile: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system is engineered for systems engineers, site reliability engineers (SREs), and DevOps architects who operate mission-critical cloud infrastructure and bare-metal environments. The aesthetic embodies a refined high-tech cyberpunk telemetry console: dense, authoritative, surgically precise, and hyper-responsive.

The design movement synthesizes **Utilitarian Terminal Brutalism** with **Modern Cybernetic Neomorphism**:
- Deep obsidian and pitch-zinc backdrops eliminate ocular fatigue during extended command-center monitoring.
- High-frequency metrics leverage luminescence and localized neon phosphor accents rather than visual clutter.
- Crisp hairline architectural framing conveys structural stability and technical discipline.
- Micro-interactions emulate high-speed instrumentation: immediate state feedback, sub-millisecond glowing pulse indicators, and zero artificial interface latency.

## Colors

The palette relies on absolute dark-mode discipline with calibrated contrast hierarchies for rapid state triage:

- **Primary (`#00FF9D` / `#10B981`)**: Neon Emerald. Represents nominal cluster health, operational uptime, active daemon state, and execution success.
- **Secondary (`#06B6D4` / `#38BDF8`)**: Electric Cyan & Sky. Encodes telemetry data streams, active socket traffic, throughput velocity, and I/O reads/writes.
- **Tertiary (`#F43F5E`)**: Pulse Crimson. Strict utility reserved for critical node dropouts, OOM kills, kernel panics, and alert threshold breaches.
- **Warning Accent (`#F59E0B`)**: High-visibility Amber. Deployed for threshold limits, container resource throttling, and pending sync locks.
- **Base Surfaces & Framing (`#090D16`, `#0D1117`, `#161B22`)**: Obsidian, Void Zinc, and Deep Slate. Establishes multi-layer z-axis container depth without distracting from telemetry points.
- **Structural Boundaries (`#1F2937`, `#374151`)**: Subdued structural hairline borders with 1px stroke boundaries separating high-density data panels.

## Typography

The type system balances human-readable structural clarity with tabular monospaced precision:

- **Display & Interface Text (`Inter`)**: Applied to global navigation, layout titling, system actions, and general modal dialogs. Set tight tracking on headings to maintain visual density.
- **Telemetry, Metrics & Terminal Data (`JetBrains Mono`)**: Applied to all dynamic values, container IDs, kernel metrics, IP/CIDR notations, logs, and badge labels. Monospaced tabular figures prevent horizontal jitter when values refresh at 60Hz.
- **Micro Labels (`label-caps`)**: Uppercase micro-typography in `JetBrains Mono` at `10px` ensures optimal readability in dense grid matrices without consuming critical viewport space.

## Layout & Spacing

A compact, 12-column modular grid optimized for information-dense dashboard monitors, network topographies, and log stream consoles.

- **Desktop (1440px+)**: 12-column fluid grid, `1.5rem` outer canvas margin, `1rem` column gutters. Accommodates persistent left-rail telemetry hubs and multi-card metric grids.
- **Tablet (768px - 1439px)**: 8-column layout with `1rem` outer margin, auto-reflowing multi-metric cards into 2-column or 4-column structures.
- **Mobile (< 768px)**: Single-column linear stack with `0.75rem` outer canvas padding. Complex data tables degrade to swipeable terminal cards with monospaced key-value layouts.
- **Density Philosophy**: Padding inside data cards is clamped between `space-sm` (`0.5rem`) and `space-lg` (`1rem`) to keep critical diagnostic data above the fold.

## Elevation & Depth

Visual hierarchy does not use soft naturalistic daylight shadows. Instead, it relies on **Layered Dark Phosphor Depth**, combining precise dark surface steps with low-opacity cybernetic neon glows:

- **Level 0 (Canvas Base)**: `#090D16` solid canvas. Pure background void.
- **Level 1 (Card & Frame Layer)**: `#0D1117` background with a crisp `1px solid #1F2937` perimeter border. Zero blur shadow.
- **Level 2 (Active Focus & Interactive Hover)**: `#161B22` background with a `1px solid #374151` border, paired with an ambient phosphor edge: `0 0 16px -4px rgba(6, 182, 212, 0.15)`.
- **Level 3 (Modals, Overlays, Terminal Drawers)**: `#0D1117` with `1px solid #374151` and high-density isolation shadow: `0 12px 32px -8px #000000, 0 0 1px 1px rgba(255, 255, 255, 0.08)`.
- **Alert States (Crimson & Emerald Pulses)**: Active status components emit directional glow fields (e.g., `0 0 8px rgba(0, 255, 157, 0.45)` for healthy nodes; `0 0 12px rgba(244, 63, 94, 0.55)` for degraded services).

## Shapes

The interface uses a **Soft Tactical (`1`)** shape language that emphasizes structural precision and technical utility:

- Default structural components (telemetry cards, terminal containers, inputs, data panels) use `0.25rem` (`4px`) corner radii.
- Larger overlays, modals, and container shells scale to `rounded-lg` at `0.5rem` (`8px`).
- Pill elements (status pings, running-state badges, protocol chips) use full circular border radius (`9999px`) to create an immediate shape-contrast against the rigid angular metric grid.

## Components

### Buttons
- **Primary Cyber Action**: Solid `#00FF9D` background with `#090D16` text, bold `Inter` font, `4px` corner radius. Hover state applies an intense glow: `box-shadow: 0 0 12px rgba(0, 255, 157, 0.5)`.
- **Secondary Terminal Action**: `#161B22` surface with `1px solid #374151` border and `#E5E7EB` text. Hover transitions border to `#06B6D4` with text color shifting to `#38BDF8`.
- **Destructive Kill Command**: Translucent dark crimson tint (`rgba(244, 63, 94, 0.12)`) with a `1px solid #F43F5E` border and bright `#F43F5E` text.

### Chips & Status Badges
- **Status Beacon Pill**: Compact height (`20px`), full pill shape, `JetBrains Mono` label at `10px`. Features a leading `6px` animated pulsing LED dot. Emerald background at `10%` alpha for healthy, Crimson at `15%` alpha for critical, Amber at `12%` alpha for warnings.
- **Filter / Flag Chip**: Rectangular (`4px` radius) with `#0D1117` background and `#1F2937` border. Active state toggles a `1px solid #06B6D4` outline and `#38BDF8` text.

### Input Fields & Terminal Consoles
- **Query / CLI Input**: `#090D16` background, inset border `1px solid #1F2937`, `JetBrains Mono` font at `13px`. Focus shifts border to `#00FF9D` with a subtle inner edge glow `0 0 0 1px #00FF9D`. Accompanied by a persistent green terminal prompt prefix (`>_`).
- **Interactive Log Stream**: `#090D16` background, monospace type, alternating line hover states (`rgba(255, 255, 255, 0.02)`), with inline syntax highlighting for timestamps, log levels (`INFO`, `WARN`, `FATAL`), and IP addresses.

### Cards & Data Tiles
- Built with `#0D1117` base fills and hair-thin `#1F2937` borders.
- Top card header integrates micro-labels, live latency indicators, and sparkline graphs rendered with neon stroke paths (`#00FF9D` or `#06B6D4`) without heavy background fills.

### Checkboxes & Toggle Switches
- **Checkboxes**: `16x16px` squares with `2px` border radius, `#0D1117` fill, and `#374151` stroke. Checked state triggers `#00FF9D` fill with `#090D16` checkmark icon.
- **Hardware-Style Toggle**: Compact horizontal track (`32x16px`) in `#1F2937`. Active state switches track to `#06B6D4` with an ultra-white thumb and neon cyan glow.

### Infrastructure Nodes / Container Blocks
- Compact matrix nodes representing container pods. State color fills the left `3px` accent border. Hover reveals tooltips with CPU/Memory usage, packet loss, and container uptime.