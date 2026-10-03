# Vehicle Inspection UI Asset Library

Production-oriented visual assets and React building blocks for the Persian RTL vehicle self-inspection platform.

## Contents
- **304 SVG assets** across navigation, journey, vehicle, camera, 3D, location, upload, status, security, readiness, reviewer/admin, ghost overlays, plates, progress and illustrations.
- `icons-manifest.json` — predictable runtime/icon metadata.
- `svg-catalog.json` — every SVG's full source + usage metadata.
- `SVG_ASSETS.md` — human-readable index.
- `COMPONENTS.md` — component inventory, states, dependencies and accessibility.
- `CATEGORY_REVIEW.md` — consistency review checklist.
- `src/components/` — React/TypeScript implementation starter components.
- `src/styles/` — design tokens and implementation CSS.

## Design tokens
Primary `#2563EB`, background `#F8FAFC`, surface `#FFFFFF`, text `#111827`, muted `#6B7280`, border `#E2E8F0`, success `#059669`, warning `#D97706`, error `#DC2626`.

## React icon API
```tsx
<Icon name="camera" size={24} strokeWidth={1.75} aria-label="دوربین" />
```
`IconRegistry.tsx` renders inline SVG React nodes and uses no unsafe HTML injection.

## Integration notes
- Set the app root to `dir="rtl"`. Keep referral/OTP/VIN/reference codes `dir="ltr"`.
- Do not mirror physical vehicle directions, camera orientation or map directions with `scaleX(-1)`. Use semantic direction assets.
- Statuses pair color with icon/text.
- Interactive targets should remain at least 44×44 CSS pixels.
- For camera ghost overlays, combine the angle-specific ghost SVG with the target bracket and ground-line assets.
