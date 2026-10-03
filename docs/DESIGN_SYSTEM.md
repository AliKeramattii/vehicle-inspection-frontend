# Vehicle Inspection Design System

## Product character

The visual language combines:
- premium automotive configurator
- precise inspection tool
- trustworthy fintech/insurance product
- clean professional SaaS for operations surfaces

Customer screens should feel calm and premium rather than governmental or like generic form software.

## Core colors

| Token | Value | Use |
|---|---|---|
| background | `#F8FAFC` | app background |
| surface | `#FFFFFF` | cards/sheets |
| primary | `#2563EB` | primary actions/selected state |
| ink | `#111827` | primary text |
| muted | `#6B7280` | secondary text |
| border | `#E2E8F0` | separators/borders |
| success | `#059669` | completed/verified |
| warning | `#D97706` | retake/SLA attention |
| destructive | `#DC2626` | true failure/destructive |
| information | `#0284C7` | informational state |

Status colors communicate state, not decoration.

## Typography

Use a Persian-first family:
- Vazirmatn during development
- IRANSansX if the project has the appropriate production license

Recommended weights:
- 400 regular
- 500 medium
- 600 semibold
- 700 bold

Technical codes, VIN fragments, and references remain LTR.

## Geometry

- Small controls: 8–10px radius
- Inputs: 12px
- Cards: 16px
- Bottom sheets/major surfaces: 20–24px
- Mobile CTA height: 48–52px
- Minimum tap target: 44×44px

## Shadows

Use soft cool shadows. Avoid dramatic floating-card effects.

Example:
`0 2px 6px rgb(15 23 42 / .03), 0 12px 30px rgb(15 23 42 / .06)`

## Customer layout

Primary acceptance viewport: 390×844.

Principles:
- one primary action per screen
- large visual/3D content before paragraphs
- sticky primary CTA near the bottom
- generous whitespace
- safe-area-aware bottom spacing
- native RTL alignment

## Desktop operations layout

Primary acceptance viewport: 1440×960.

Reviewer/admin:
- dense but highly legible
- strong hierarchy
- smaller radii than marketing/customer hero surfaces
- table/data density similar to high-quality developer/operations software
- no giant KPI cards

## Camera

Camera is the only intentionally dark customer surface.

Use:
- real live `<video>`
- translucent top controls
- separate ghost SVG layer
- restrained green/amber quality indicators
- professional camera ergonomics

## 3D

Studio:
- white/cool-grey cyclorama
- realistic PBR vehicle
- soft automotive studio lighting
- contact shadow
- custom numbered inspection pins
- selected pin: blue + pulse
- completed: green
- retake: amber
- pending: neutral grey
