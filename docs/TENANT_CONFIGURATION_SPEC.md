# Tenant public configuration specification

## Public deployment bootstrap
Serve /site-bootstrap.json on each independent frontend origin, Cache-Control: no-store. Schema 1:
```json
{"schemaVersion":1,"tenantId":"broker-a","apiBaseUrl":"/api","siteSettingsEndpoint":"/api/public/site-settings","settingsSource":"api"}
```
Default repository fixture uses tenant demo and settingsSource mock. No query string, localStorage setting or hostname switch overrides the bootstrap. Absolute API endpoints require HTTPS, no credentials, query/fragment, traversal or encoded separators. Public settings endpoint must remain inside the configured API origin/base path. Same-origin /api is preferred.

## Site Settings schema
schemaVersion/version/publishedAt/tenantId; identity brokerageName/appTitle/logo/favicon/publicEmail/publicPhone; theme primary/secondary/background/neutral/onPrimary/onBackground; images landing/referral/otp/readiness/consent; application apiBaseUrl/contractVersion/template{id,version}/features{nativeCaptureFallback,additionalEvidence,supportLink}. All objects are strict; unknown secret/operational fields fail validation. Existing capture capabilities remain supported; no template-required data is removed through branding.

Color values are six-digit hex; primary/onPrimary, background/onBackground and secondary/background require WCAG contrast >=4.5. Assets are local /images, /icons, /branding, /favicon.ico or HTTPS on validated frontend/API origins. PNG/WebP/JPEG/ICO allowed; existing local icon SVGs are trusted project assets, not arbitrary uploaded SVG markup. Backend must validate real MIME/signature/size/dimensions, strip unsafe content and generate immutable public asset versions. This phase accepts references, not file uploads. Signed private evidence URLs are a different contract.

## Loading, cache and isolation
Both bootstrap and API public-settings GET use credentials omit, cache no-store, redirect error and AbortSignal. Loading is bounded inside AppViewport; failure shows retry and does not mount customer services. Query keys include validated origin, tenant, API and settings endpoint. There is no disk cache fallback for API settings and no global last-broker record.

Mock drafts/publications and deployment binding use separate transactional IndexedDB. Binding rejects a different tenant/API on an already used origin; it never deletes legacy photos/uploads. Initial binding preserves existing demo data. A same-origin tenant migration is deliberately unsupported until an explicit authenticated migration procedure exists. Independent domains naturally separate cookies/IndexedDB/SW. This is not protection against malicious local users; ASP.NET must enforce authority.

No active SW currently exists. A future SW must bypass bootstrap/public settings/auth/evidence APIs, use versioned same-tenant shell cache and never reuse another installation's branding. Offline cold startup remains blocked without a verified tenant-bound configuration/SW strategy. Mounted capture/queue data remains durable and existing offline retry works.

## API adapter boundary
apiUrl resolves only a validated deployment base plus a restricted relative endpoint path. Runtime provider exposes bootstrap/context to future typed HTTP adapters. Current auth/inspection/upload/submission repositories remain explicit mocks. Public settings source api does not turn business mocks into real integrations.

## Private configuration (never public)
ASP.NET environment/secret store owns MSSQL credentials, physical filesystem root, OTP credentials, signing keys, webhook secrets and authorization policies. Admin forms/public JSON contain none of those. Client tenantId, branding, API origin and folder pattern are not authorization credentials.


## Public Neshan map extension
Optional application.locationMap keeps old schema-1 publications readable. Missing configuration
uses defaults below. Local Admin normalizes its returned editing view, not old publication
history. No private reverse credential belongs in this strict public object.

    {
      "application": {
        "locationMap": {
          "enabled": true,
          "webMapKey": null,
          "mapType": "dreamy",
          "initialViewport": { "latitude": 35.699739, "longitude": 51.338097, "zoom": 12 },
          "reverseGeocoding": "unavailable"
        }
      }
    }

Extension fragment only: preserve the rest of Site Settings. webMapKey is null or nonempty
public domain-restricted Neshan Web Map key. mapType: dreamy / standard-night; bright dreamy
is default. Initial coordinates must be finite WGS84; zoom integer 3–18. Camera defaults are
never automatic inspection selection. reverseGeocoding: unavailable / mock / api. Mock is
visibly labelled; api uses trusted bootstrap apiBaseUrl + /maps/reverse, not arbitrary URL/
query override. Unknown/private fields fail validation.

Local mock setup: /admin/site-settings → API settings → map enable/public key/address mode,
save/publish. Actual API installations publish through their authorized backend lifecycle;
local mock Admin cannot update that server. Scope browser keys to each frontend origin in
the Neshan account. No rebuild or NEXT_PUBLIC_NESHAN key needed. Private service keys stay
in ASP.NET secret storage. See NESHAN_LOCATION_INTEGRATION.md and API_CONTRACT.md.
