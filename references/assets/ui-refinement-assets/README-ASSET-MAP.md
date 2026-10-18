# Vehicle Inspection — UI Refinement Assets

This zip contains the user-provided assets for the UI-only implementation phase.

## Asset organization
- `navigation/*.webp`: user-provided 8 view/category images; use in photography UI instead of matching SVG icons.
- `icons/*.svg`: user-provided SVG files for specific screens.
- `icons/map-pin.svg`: small Lucide-style location-pin fallback made because `map-pin.svg` was not in the uploads. If a canonical map-pin asset exists in the repo, prefer that.
- `inspection-360-kit/`: extracted contents of the user-provided `inspection-360-complete-kit.zip`, including `INTEGRATE-WITH-CODEX.md`, a UI reference PNG, and a Vite/React sample; selectively integrate visual/components into the existing Next.js architecture rather than installing or replacing the app.

## Usage
Place the extracted top-level `ui-refinement-assets/` directory under the project's `references/assets/` path, then ask Codex to copy ONLY the required production assets into the correct existing `public` paths and update references.
Do not include whole sample Vite app in the production bundle.
Do not use the kit's simulated quality/status/progress indicators in real capture mode.
Do not overlay scene-background.webp or studio-car illustration over live camera.
The kit's second uploaded copy has identical SHA-256; only one copy is packed.

## Not supplied
- Final app logo to use on every page. Codex must look for the approved canonical logo in the repository and report it if missing.
- Brokerage logo/support phone are intended to come from existing public Site Settings/API boundaries; use mock values until real backend work is approved.
- Neshan provider API credential. Never hardcode secret server-side keys in the browser.
