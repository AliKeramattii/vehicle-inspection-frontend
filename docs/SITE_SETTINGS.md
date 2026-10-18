# Runtime Site Settings and Admin

Modules: src/config/site-settings.schema.ts, defaults, loader, provider, repository, branding-assets; Site Settings Admin feature extends existing shell at /admin/site-settings via the Branding page action.

## Customer integration
Public bootstrap validates before UploadRuntime/workflow mount. Typed Query state is context-scoped; loading/error/retry are explicit. Default demo retains earlier screenshots and copy. Custom identity appears in entry/consent/shared headers; CSS variables affect relevant primary actions/accents/backgrounds without remapping success/error/gray-blue-orange evidence status. Canonical photo guides and vehicle controls remain untouched. Logo/hero references are centralized with safe default assets and load-failure fallback.

Asset roles: landing/referral share the current landing screen (landing takes precedence, referral fills it when landing unset), otp, readiness cover background behind existing readable text, consent contained illustration. No arbitrary global object-cover rule. Captured evidence/guidance use their existing framing system.

## Admin categories and lifecycle
Identity (name/title/public contacts/logo/favicon references), colors/contrast, decorative images, supported public preferences/published template selection, read-only deployment API/version, and unverified backend storage status. No physical path/connection form. API changes require deployment configuration, not an untrusted Admin/query override. The module clearly labels local-only behavior.

RHF/Zod owns unsaved fields; existing Admin dirty navigation/close safeguards apply. Save uses revision CAS, validating tenant/API and supported template publication. Publish creates immutable settings history, updates published pointer and records actor/time/action. Reset restores published settings into draft, not a destructive inspection reset. Preview changes only its contained card/dialog. Service permits platform-admin through existing branding permission; editor/viewer read only. These are mock permissions, not real security.

A public mock reader consumes only published settings, never draft. API-mode public reader still consumes backend settings; local Admin mock publication cannot update a real server and is labeled accordingly. Publication changes future branding, not existing evidence/pinned template requirements. The selected default template is an integration boundary, not automatic customer plan rollout.

Public supportLink controls the existing support disclosure; configured public email/phone appear there. Mandatory capture capabilities are read-only supported flags, not switches to remove evidence. Admin asset preview validates references before making image requests; invalid API settings never reveal raw validation payloads. TanStack Query notifications use microtasks so bootstrap I/O does not depend on a clock tick, and skip-link focus is transferred when loading content becomes ready.

## Durable storage and recovery
inspection-site-settings IndexedDB stores small JSON workspace per origin/tenant/API context, separate from customer media and existing Admin workspace. Transactions enforce save conflict and publication history, connections close after transactions/blocked opens. Configuration errors fail closed; another tenant's cached branding is never substituted. Reload is recoverable. No automatic evidence cleanup occurs.

## Scope limits
No branding upload endpoint, backend health probe, real publication, production authentication or client filesystem browser. The current template remains configurable through existing Admin and pinned for customers; Site Settings does not alter evidence count. Static export and PWA cold-start/installability remain separate documented blockers.


## Location map settings
Existing API settings tab exposes map enable, public Neshan Web Map key and address lookup
mode. These are published per-tenant runtime configuration, not build variables or private
reverse credentials. Missing keys show an honest configuration state. Legacy workspace
defaults apply to the editing view without rewriting history.
Shape/setup: TENANT_CONFIGURATION_SPEC.md and NESHAN_LOCATION_INTEGRATION.md.
