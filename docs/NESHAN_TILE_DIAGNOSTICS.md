# Neshan raster tile diagnosis (2026-10-13)

## Finding and correction
The earlier live-activation report treated HTTP 204 from tile5–8 as missing base-map coverage. That conclusion was incorrect: host-only diagnostics did not classify SDK layers, and screenshots waited for only one decoded tile.

Official Neshan Leaflet 1.0.8 creates a base TileLayer and a separate label TileLayer even with poi:false and traffic:false. Every observed 204 belongs to that empty label overlay; none belongs to base imagery. The adapter listened for tileerror on every layer, so harmless empty overlays produced the false map-loading-incomplete warning. No persistent blank base coverage was reproduced once all visible base PNGs finished loading.

The fix observes failures on the configured base TileLayer only. Overlay layers are neither removed nor rerouted. Real base failure still uses the existing honest nonblocking error/retry presentation and retains the center pin. No automatic retry loop, provider switch, CSS/layout change or credential change.

The pinned SDK identifies its base layer with _url equal to the configured style and labels with empty _url. This implementation detail is isolated in neshan-adapter.ts, covered for both supported styles and real SDK traffic, and must be reverified on SDK upgrades. A data-neshan-layer=base attribute supports actual coverage checks without publishing URLs.

## Official documentation
https://platform.neshan.org/docs/sdk/web/leaflet/neshan-leaflet-sdk/

Neshan documents dreamy/standard-night and notes that Leaflet POI/traffic layers are not updated. It does not promise every overlay request contains image data. Empty labels are not missing base imagery. The public default stays dreamy; dark style was diagnostic only. Neshan/OSM attribution stays intact. No provider migration.

## Real-provider reproduction
Installed official SDK and authorized local key; actual browser traffic, no interception/referrer spoofing. Browser cache disabled and service workers blocked for the matrix. SDK-generated paths correlated with actual tile objects, not a guessed encoded-path decoder.

Areas: Tehran 35.699739,51.338097; Mashhad 36.2972,59.6067.

| Style / area | Zoom 12 decoded/visible base | Zoom 14 | Zoom 16 |
|---|---:|---:|---:|
| dreamy / Tehran | 6/6 | 9/9 | 6/6 |
| dreamy / Mashhad | 6/6 | 4/4 | 4/4 |
| standard-night / Tehran | 6/6 | 9/9 | 6/6 |
| standard-night / Mashhad | 6/6 | 4/4 | 4/4 |

All 70 base responses: HTTP 200, image/png, decoded 256×256. All 70 corresponding labels: HTTP 204, no Content-Type/image body. No enabled POI/traffic or authorization/usage-limit rejection observed.

Sanitized sample, headers and timing: docs/NESHAN_TILE_DIAGNOSTICS.json. Full sanitized per-request records/screenshots: ignored .agent/reference-review/neshan-tiles/. No API key recorded.

This establishes tested coverage, not uptime for all geography/future requests. Incomplete rendering while images are pending remains possible. Earlier premature screenshots cannot establish a provider coverage defect. Never mask real failed base requests as success.

## Screenshots / application checks
Matching 390×844 GPS zoom-16 screenshots:
- Before: .agent/reference-review/neshan-tiles/app-gps-before.png.
- After: .agent/reference-review/neshan-tiles/app-gps-after.png.

After: complete base imagery, no false overlay warning. No CSS/crop change. Application screenshots at 360×800,390×844,430×932,1440×960 verify pin, controls, attribution and bounded AppViewport. No historical baseline change.

The strengthened live scenario requires every visible base image to decode and checks grid coverage across the map. Coverage checked after selection, zoom/resizing, reinitialization and refresh; real reverse lookup, explicit GPS fixture, editing and durable numeric metadata remain covered. Fixture GPS is not physical-device GPS proof.

## Support / follow-up
No failed base request class reproduced; a base-coverage escalation is not currently justified. Contrasting sanitized examples at zoom16,x42113,y25802:
- Base: tile1.neshan.org /301235621680884226129010.png — HTTP200,image/png.
- Labels: tile5.neshan.org /3012456216160884226129010.png — HTTP204,no image Content-Type.
- Server: Sotoon CDN; Cache-Control: public,max-age=86400,must-revalidate,stale-while-revalidate=28800,stale-if-error=28800.

If labels should contain additional content, support can inspect those paths and supplied response date/timing/layer/coordinates. Share credentials only through the secure provider account, never a HAR/ticket attachment.

For a future actual base failure, collect sanitized SDK layer, encoded path, coordinates/zoom, status, Content-Type, date/cache/CDN headers, decoded image state and viewport; compare fresh cache/SW-isolated results. Do not endlessly retry permanent204, route around restricted hosts or migrate automatically. MapLibre remains a separately approved alternative; raster base service was not proven unreliable here.

## Boundaries
GPS, pin, physical coordinates, reverse contract, editing, persistence, mock/auth journey, tenant settings and local-only proxy unchanged. No production Node endpoint, optional3D, admin or media work. Readiness changes untouched.
