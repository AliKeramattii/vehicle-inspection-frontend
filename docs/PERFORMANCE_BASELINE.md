# Performance baseline

Measured against starting HEAD `3b62f68bd88dc631d902023562360fe6944bfe9d` plus the pre-existing local user changes. These are lab observations, not production telemetry. The current template remains seven sections and twelve photos, with separate numeric odometer and walk-around video.

## Reproduction and conditions

Use the canonical integrated worktree and its installed dependencies: Next 16.3.8 / React 19.2.8, Windows Chromium supplied by Playwright. `npm run build` followed by `$env:PERF_PHASE='before'; npx playwright test --config playwright.performance.config.ts`. Do not label a run against optimized source as a new before baseline.

Three repeats, fresh isolated mobile contexts at 390x844, DPR 1, reduced motion, disabled HTTP cache, 4x CPU slowdown, 150ms network latency, 200,000 bytes/s download and 93,750 bytes/s upload. Operations use 1440x960. Setup/auth/fixture seeding occurs outside throttled measurements. Production `next start` listens on loopback 3217. Each measurement includes application configuration/hydration until its named visible control, then 600ms settling. It does not isolate hydration CPU. Test fixtures contain no real customer media.

| Route | Ready ms | LCP ms | CLS | JS encoded bytes | JS decoded bytes | CDP task ms | JS heap MiB |
|---|---:|---:|---:|---:|---:|---:|---:|
| landing | 3034 | 3228 | 0.027 | 280,534 | 983,887 | 723 | 8.50 |
| capture | 3180 | 3644 | 0.002 | 310,791 | 1,078,710 | 567 | 21.63 |
| guide | 3152 | 3524 | 0.038 | 310,791 | 1,078,710 | 513 | 11.35 |
| camera-fixture | 4681 | 700 | 0.001 | 310,791 | 1,078,710 | 567 | 20.68 |
| reviewer-case | 3644 | 3164 | 0.596 | 293,595 | 1,035,110 | 695 | 15.95 |
| admin-settings | 3134 | 3120 | 0.000 | 286,540 | 1,003,152 | 545 | 30.68 |

Encoded means compressed JavaScript response bodies observed by Resource Timing, excluding headers; decoded means uncompressed script bodies. Summed gzip build chunks are a separate build inventory, never startup payload. Original build inventory: 3,113,952 raw bytes / 925,877 gzip bytes, including optional code not requested by the customer overview.

## Confirmed bottlenecks

- Overview, guidance and camera each loaded 1,078,710 decoded JS bytes. Camera/recording/review modules shared their eager workflow import graph. The framework/runtime remains most of that payload; there is no claim that all bytes can be removed.
- PhotoStore.list fetched all 480 fixture records across 40 namespaces to return twelve. Seven actual IDB reads: 480 records each; median 8.7ms. This unnecessarily materializes other inspections' Blobs.
- Reviewer filmstrip already used visibility-based loading, but remounts decoded the same full source repeatedly; status-only object changes could repeat lookup. Full-resolution preview should remain selected-only.
- Cold marker-to-guidance median 308ms; shutter-to-durable-review median 429ms (range 411-897ms). Synthetic camera output 193,380-byte JPEG, not real device capture.
- Reviewer CLS approximately 0.600 is an existing layout issue. This task does not redesign it or claim acceptable Core Web Vitals.

## Media and cache inventory

76 public raster assets total 13,493,418 bytes. Large legacy PNGs exist alongside active WebPs; the active OTP illustration is 1,502,067 bytes. Canonical photo-guide inventory has sixteen files including alternatives, average 117,421 bytes / maximum 455,842 bytes. Supplied hero edits were already local user work and are excluded from this optimization commit. No automotive assets are replaced.

No real-customer photo/video size distribution exists. Fixture accepted-photo mean/max and capture-equivalent quality results must not be described as user averages. Camera currently captures JPEG at quality .92; video requests 1080p / 2.5Mbps. Camera constraints are ideal, not guarantees.

Neshan and optional 3D already have explicit loading boundaries; they do not need a competing loader. Optional GLB remains restricted local development and is never published. Local Vazirmatn already uses font loading with swap. Serwist dependency and serviceWorker API support do not establish an active service worker: current source has no registered offline shell. Do not claim offline cold-start support.

## Measurement limits

The interaction observer is a lab event-latency sample, not field INP; zero can mean no captured interaction. CDP TaskDuration/JSHeapUsedSize are browser counters/snapshots, not total native image memory, OS CPU, battery or peak RAM. Small timing differences across three runs are not statistically conclusive.

Queue uploads are deterministic in-process mocks. CDP network throttling measures route requests, not mock binary upload throughput. Real ASP.NET transfer throughput, field INP, iOS/Android device memory, physical camera startup and insurance readability require separate deployment/device acceptance. See MEDIA_OPTIMIZATION_POLICY.md and PERFORMANCE_OPTIMIZATION_REPORT.md.

Raw diagnostics are intentionally local/ignored under `.agent/reference-review/performance/`: before-benchmark.json, before-mobile-{1,2,3}.json, before-indexeddb.json, static-image-inventory.json and command logs. Reproduction specs are committed under tests/performance; saved results summarized here remain reviewable without those files.
