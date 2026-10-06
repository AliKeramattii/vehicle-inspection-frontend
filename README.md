# Vehicle Inspection Frontend

Persian RTL Next.js App Router frontend for customer self-inspection, reviewer operations,
and administration. Implemented: `00-bootstrap`, `01-landing-otp`, `02-readiness-consent`, `03-location-vehicle`, and revised Phase 04 image-guided photography.

```sh
npm ci
npm run dev
```

Open [the referral landing](http://localhost:3000). Use mock referral `A4K9P2` and OTP `12345`.
The initial demo number is `09120004567`; change it on the OTP screen if needed.
The [foundation preview](http://localhost:3000/foundation/preview) and
[the component gallery](http://localhost:3000/foundation) remain available.

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run test:e2e`.
Install the test browser first with `npx playwright install chromium`.
`npm run build` checks the production build.

See [bootstrap usage and boundaries](docs/BOOTSTRAP.md), [architecture](docs/ARCHITECTURE.md),
[API contracts and mock values](docs/API_CONTRACT.md), and [canonical references](references/INDEX.md).
See [readiness and consent](docs/READINESS_CONSENT.md) and its
[execution plan](.agent/plans/readiness-consent.md). Consent continues through location/vehicle to photography. See [photography architecture](docs/PHOTOGRAPHY.md).
Remote upload/submission, reviewer/admin and optional 3D remain future work.

Development listens on `0.0.0.0`, so localhost and this machine's LAN address serve
the same app. See [origin parity and development reset instructions](docs/DEVELOPMENT_ORIGINS.md).
Run `npm run test:e2e:dev` to check both development origins and hot reload.
