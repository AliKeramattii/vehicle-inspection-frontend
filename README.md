# Vehicle Inspection Frontend

Persian RTL Next.js App Router frontend for customer self-inspection, reviewer operations,
and administration. Currently implemented: `00-bootstrap` and `01-landing-otp` only.

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
The active execution plan is [.agent/plans/landing-otp.md](.agent/plans/landing-otp.md).

Development listens on `0.0.0.0`, so localhost and this machine's LAN address serve
the same Phase-01 app. See [origin parity and development reset instructions](docs/DEVELOPMENT_ORIGINS.md).
Run `npm run test:e2e:dev` to check both development origins and hot reload.
