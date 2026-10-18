# Customer hero composition

## Scope and source of truth

Targeted framing/flow correction on the canonical integrated branch. References 01, 02, 03, 04,
06, 14 and 15 define screen hierarchy; the approved Emerald/Amber/Slate system and exact supplied
white sedan supersede historical reference paint/vehicle imagery. This does not redesign the
customer workflow. No route, field name, customer copy, button label or business rule changed.

## Causes and corrections

- Landing/OTP/consent used fixed-height cover frames. They now use contained artwork in a reserved
  aspect-ratio box below the heading/description. Landing's negative panel margin was removed.
- Readiness placed absolute copy over a cover background shifted horizontally by 100px. Its copy
  and artwork now occupy separate flow boxes; the overlay gradient/offset are removed. All four
  preparation requirements and four device diagnostics remain intact.
- Consent's flex children could shrink the illustration to zero at small heights. Header, intro,
  artwork and content now retain their intrinsic layout; the existing main scroller handles excess.
- Vehicle identity combined a 69% absolute render and 34% details column with a nonwrapping model
  title. Details now wrap above a compact image, including inside Final Summary. VehicleCard also
  resolves the existing referral/introduction White-Label image override, formerly bypassed.
- Receipt now orders heading/description before a contained 220x165 maximum illustration. Its
  reference, queue state, timeline, copy and tenant image resolution are unchanged.
- A previously cached optimized landing size variant still showed older off-center source framing
  after the existing local file replacement. Built-in hero URLs alone get an explicit cache revision
  (hero-flow-20261017). Next localPatterns permits that exact query on the built-in paths while
  retaining query-free local sources. Tenant URLs are never rewritten. Future in-place built-in
  image publications must revise this key or use versioned filenames.
- The previous sticky landing action could cover its referral input on short screens. It now
  follows that input in flow. Short-height artwork budgets keep the action visible at 390x500;
  longer content remains reachable through AppViewport's existing main scroller.

## Presentation boundary

CustomerHeroArtwork is a small presentation component, reusing BrandingImage and the existing
runtime/tenant asset resolver. It reserves geometry before decode and applies contain/center
without mirroring, transforms or stretching. No additional state, viewport system, dependency or
client boundary was introduced. OTP retains the phone/security illustration.

| Role | Normal artwork budget | Short-height behavior |
| --- | --- | --- |
| Landing | natural 1672:941 ratio, max 270px; max 200px at 651-900px height | 150px at <=650px; 80px at <=550px |
| OTP | 3:2 frame, max 190px | 130px at <=650px; 80px at <=550px |
| Readiness | 1672:941 frame, max 150px | 125px at <=650px |
| Consent | 1672:941 frame, max 150px | 120px at <=650px |
| Introduction | 1672:941 frame, max 165px | existing main scroll |
| Summary vehicle | compact frame, max 110px | existing summary scroll |
| Receipt | 4:3 frame, width <=220px, height <=165px | width <=200px, height <=150px |

Custom portrait, square and wide images retain their full content through containment. Deliberate
letterboxing is preferable to cropping unknown brokerage artwork. No attempt is made to trim an
uploaded image or infer the location of its vehicle. Longer brokerage names can wrap safely.

## Visual review and reproducibility

Local artifacts (ignored by Git): .agent/reference-review/hero-composition/.

- before/: 49 full-page viewport captures (seven pages at seven sizes) plus four portrait checks,
  captured before implementation.
- after/: same default page/size matrix, 125% text stress screenshots and tenant standard,
  portrait, square and wide images across landing, OTP, readiness, consent, introduction and receipt.
- comparison-<page>.jpg: rows contain before/after 390x844, then 320x568, 360x800, 430x932,
  centered customer shells at 768x1024 and 1440x960, 844x390 landscape, and enlarged text.
- preservation.json / preservation-after.json: 741 protected SHA-256 checks.
- *-results.json: actual Playwright process results.

Reviewed 320x568, 360x800, 390x844, 430x932, 768x1024, 1440x960, 844x390 landscape and 125% text.
No document-level overflow or text/artwork collisions in these checks. Primary actions retain
44px+ targets and are reachable in the existing internal scroller; short/landscape/text-enlarged
screens intentionally scroll rather than reducing text. Receipt fits without internal scrolling
at 360x800, 390x844 and 430x932. Referral/OTP focus and keyboard-height behavior were verified.

## Regression coverage and baseline policy

Run npm run test:e2e -- --config playwright.hero.config.ts after npm run build. The configuration
starts the built app on 3140; HERO_ORIGIN can point to an existing dev/production server instead.
Six scenarios cover the real workflow, all viewport sizes, enlarged text, four tenant image ratios,
URL preservation, errors/resources, action reachability and withheld-image layout stability.

Five new baselines under tests/e2e/screenshots/hero-composition.spec.ts/:
hero-landing-customer.png, hero-readiness-customer.png, hero-consent-customer.png,
hero-introduction-customer.png, hero-receipt-customer.png.
They were visually reviewed before copying into the baseline directory, including deliberate
landing/receipt refinements. They use a deterministic test-only derivative of the committed
source/front-45-left.webp, never a production image replacement. This keeps the new regressions
independent of the ten pre-existing unstaged hero-image edits. No historical baseline is updated.

Validation:
- npm run lint: exit 0, no warnings after removing an unused new test helper.
- npm run typecheck: exit 0.
- npm run test: exit 0, 400 tests across 33 files.
- npm run build: exit 0. A new test's Node.remove typing error was corrected before final build.
- Hero browser suite: exit 0, six scenarios, including five screenshot comparisons.
- Focused functional regressions: exit 0, 72 passed / 38 project-specific skips. Existing
  REVIEW_SUBMISSION=1 records review screenshots without comparing obsolete submission baselines;
  screenshot-only, historical brokerage/Admin visual tests and the unrelated Admin-copy failure
  were excluded explicitly. This is a functional result, not a full visual-suite PASS.
- Unfiltered affected run initially exited 1: eight historical screenshot differences, the
  pre-existing Admin validation-copy mismatch, two keyboard cases and one receipt-fit case.
  The keyboard and receipt-fit regressions were fixed and rerun successfully. Historical
  landing/preparation/location comparisons also exit 1; all baselines remain unchanged.
  Historical landing now reaches the screenshot comparison with its support target fully visible.

## Preserved work / limitations

All 741 protected paths are byte-identical except the explicitly approved local schema correction:
./vehicle-assets.ts -> ./vehicle-assets. Reversing just that suffix reproduces its original hash.
All other existing schema text/BOM edits remain untouched and unstaged. HEAD already has the
suffix-free import, so this local correction is excluded from the hero commit.

The initial 19 dirty paths remain outside this commit: ten hero images, six Playwright configs,
globals.css, the development model route and the Site Settings schema. No production derivatives
were created. Supplied/reference images, GLB/model geometry, optional viewer, photography, camera,
ghosts, recorder, map, authentication, IndexedDB and queue behavior are unchanged.

Known separate issues: historical screenshot drift (palette/sedan/prior changes plus these approved
hero changes), pre-existing garbled Admin schema validation copy, and existing development-only
Next image dimension warnings on evidence previews/map icons. No new console/page/resource errors
were observed by the focused hero checks. Full historical visual validation is not green.

## Delivery and local preview

Implementation: 3553dd1e1d9d733bc09a6b163194e308357e254e on feat/unified-ui-admin-3d,
normal push to origin verified. Existing 19 modified paths were excluded. No merge or new worktree.

For an isolated hero preview, in PowerShell at C:/Projects/vehicle-inspection-integrated:

    $env:DEV_NESHAN_ENABLED="0"
    npm.cmd run dev -- --port 3114

This process-only override uses the existing mock settings/map and does not edit .env.local,
provider code or the local-only live Neshan proxy. Open http://localhost:3114/. Use A4K9P2 and
12345 to progress through /verify, /readiness, /consent and /inspection/insp_demo/vehicle.
Summary /inspection/insp_demo/review and receipt /inspection/insp_demo/submitted retain their
normal capture/upload/submission guards. Run the existing workflow or the deterministic hero
tests to view those states; no guard bypass was added.
