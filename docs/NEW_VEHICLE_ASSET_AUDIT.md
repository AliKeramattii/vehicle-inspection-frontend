# Supplied sedan asset audit

Canonical worktree: C:/Projects/vehicle-inspection-integrated. Branch: feat/unified-ui-admin-3d.
The approved UI refinement 7e712051bd0c4830d1f4e89c594b50c1b8faf1ba was integrated by fast-forward before this migration. Functional audit checkpoint: e41df97.

## Actual supplied package

Reviewed all 19 source photographs, eight navigation files, five heroes and eight ghosts (40 WebPs).
The expected manifest.json, README_FA.md, GENERATE_THESE_IMAGES.md and previews/contact-sheet.jpg were not supplied. This report and NEW_VEHICLE_ASSETS.json are derived inventories, not fabricated source metadata.
The advertised 512×512 view-* navigation files do not exist: the eight actual navigation files have source names and are byte-identical to source photographs. Eight explicit UI roles reuse approved source URLs instead of duplicating bytes or generating approximations.

The supplied vehicle is a white four-door sedan. No marque/model was inferred. The user approved “خودروی سدان نمونه” for new mock inspection data only; saved inspection facts and body-color selection remain unchanged.

## Active/default/fallback replacement inventory

| Previous reference | New reference | Consumers |
|---|---|---|
| /images/auth/landing-suv.png | /assets/inspection-vehicle/hero/landing-vehicle.webp | Landing and failed tenant-image fallback |
| /images/auth/landing-suv.png (referral role) | /assets/inspection-vehicle/hero/introduction-vehicle.webp | Introduction/referral default and Admin preview |
| /images/vehicle/identity-suv.png | /assets/inspection-vehicle/hero/introduction-vehicle.webp | VehicleCard: identity, summary, foundation/mock consumers |
| /images/preparation/vehicle-inspection.webp | /assets/inspection-vehicle/hero/readiness-vehicle.webp | Readiness background, brokerage B fixture |
| /images/preparation/consent-hero.webp | /assets/inspection-vehicle/hero/consent-vehicle.webp | PrivacyArtwork and Admin fallback |
| /illustrations/success/inspection-submitted.svg | /assets/inspection-vehicle/hero/receipt-vehicle.webp | Receipt/submission and Admin fallback |
| /illustrations/readiness/readiness-clean-vehicle.webp | /assets/inspection-vehicle/photo-guides/front-plate.webp | Readiness clean/readable-plate row |
| /illustrations/readiness/readiness-open-space.webp | /assets/inspection-vehicle/photo-guides/right.webp | Readiness open-space row |
| /assets/inspection/photo-guides/<12 canonical IDs>.webp | /assets/inspection-vehicle/photo-guides/<same ID>.webp | Template, overview, cards, sections, guidance, compact samples, Admin templates and evidence-reference comparisons |
| /ui-refinement/navigation/view-top.webp | /assets/inspection-vehicle/photo-guides/car-roof.webp | Upper view control |
| /ui-refinement/navigation/view-rear.webp | /assets/inspection-vehicle/photo-guides/rear-plate.webp | Rear view control |
| /ui-refinement/navigation/view-right.webp | /assets/inspection-vehicle/photo-guides/right.webp | Physical right view control |
| /ui-refinement/navigation/view-front.webp | /assets/inspection-vehicle/photo-guides/front-plate.webp | Front view control |
| /ui-refinement/navigation/view-left.webp | /assets/inspection-vehicle/photo-guides/left.webp | Physical left view control |
| /ui-refinement/navigation/view-body.webp | /assets/inspection-vehicle/photo-guides/front-45-right.webp | Body category |
| /ui-refinement/navigation/view-cabin.webp | /assets/inspection-vehicle/photo-guides/driver-interior.webp | Cabin category |
| /ui-refinement/navigation/view-engine-specs.webp | /assets/inspection-vehicle/photo-guides/engine-bay.webp | Engine/details category |
| /assets/360-recording/ghost-guides/<8 ghost names> | /assets/inspection-vehicle/ghost-guides/<same names> | Recorder V2 manually selected, UI-only ghost layer |

All twelve guide IDs are the filenames in the following source table that have a public guide URL, excluding left/right (supplementary navigation only). Seven sections and twelve required photographs remain unchanged. Odometer data and video remain separate.

## Exact source inventory and hashes

Navigation duplicates are identified by matching SHA-256, not by guessed filenames. Supplementary source views without runtime URLs remain preserved references, not new requirements.

| Supplied path | Dimensions | Alpha | Runtime URL | SHA-256 |
|---|---|---|---|---|
| `generated/ghost-guides/ghost-front-45-left.webp` | 1254 × 1254 | yes (942559 transparent) | `/assets/inspection-vehicle/ghost-guides/ghost-front-45-left.webp` | `3a34c01391f9ef7b12a9dd3eadcdfe11af2121cfa2d1b04df6794b3cf2e84402` |
| `generated/ghost-guides/ghost-front-45-right.webp` | 1254 × 1254 | yes (847181 transparent) | `/assets/inspection-vehicle/ghost-guides/ghost-front-45-right.webp` | `a3c1aa26be2c1bf2ffde0d633a61572fcff9d581280007ee511a028863ef9afc` |
| `generated/ghost-guides/ghost-front.webp` | 1254 × 1254 | yes (546067 transparent) | `/assets/inspection-vehicle/ghost-guides/ghost-front.webp` | `e308ef6f7747f4ef00e6b74a1a3cd4a4c0a0a2a14af48758fa29621c4ff68b91` |
| `generated/ghost-guides/ghost-left.webp` | 1774 × 887 | yes (782973 transparent) | `/assets/inspection-vehicle/ghost-guides/ghost-left.webp` | `301075697485d8f9021b594d5e3a64cfd8bbcfa0daba20df40249c623cd21a8b` |
| `generated/ghost-guides/ghost-rear-45-left.webp` | 1254 × 1254 | yes (978403 transparent) | `/assets/inspection-vehicle/ghost-guides/ghost-rear-45-left.webp` | `e5fa5628eb333e8680a5ec7593ad230078e500d41781575e5788b3770902de41` |
| `generated/ghost-guides/ghost-rear-45-right.webp` | 1254 × 1254 | yes (973679 transparent) | `/assets/inspection-vehicle/ghost-guides/ghost-rear-45-right.webp` | `62ecb95d7d573a62f2f795f1944440328fee71643252643d76ed26a94e42738a` |
| `generated/ghost-guides/ghost-rear.webp` | 1254 × 1254 | yes (679813 transparent) | `/assets/inspection-vehicle/ghost-guides/ghost-rear.webp` | `aa71d6146cfde2109b74161b8f5b9f2f187e3b9f17fc5ea02efb23e08559c79e` |
| `generated/ghost-guides/ghost-right.webp` | 1254 × 1254 | yes (1093444 transparent) | `/assets/inspection-vehicle/ghost-guides/ghost-right.webp` | `4f827cb72234235590c4112c6d963ff327a300d47325c581328d2adb4cd732da` |
| `generated/hero/consent-vehicle.webp` | 1672 × 941 | no | `/assets/inspection-vehicle/hero/consent-vehicle.webp` | `73e894843405b235862cfcfb9279cfcd9ce22de750ca1dfe71e0d2b51547c476` |
| `generated/hero/introduction-vehicle.webp` | 1672 × 941 | no | `/assets/inspection-vehicle/hero/introduction-vehicle.webp` | `ec3cf91b9e67354b491294d77be1243ac23f59934d9433beb675a778117204fb` |
| `generated/hero/landing-vehicle.webp` | 1672 × 941 | no | `/assets/inspection-vehicle/hero/landing-vehicle.webp` | `f9a099845f653cab5e86f3722239e5d3b3232667e79c53b1f7cccd2e78eb49f9` |
| `generated/hero/readiness-vehicle.webp` | 1672 × 941 | no | `/assets/inspection-vehicle/hero/readiness-vehicle.webp` | `d8f93190d9d4fc66f0fe4d979be693b066d76e3e17d02ba145227decbec1cdd7` |
| `generated/hero/receipt-vehicle.webp` | 1448 × 1086 | no | `/assets/inspection-vehicle/hero/receipt-vehicle.webp` | `21c7986beed52a4e11b217fa931d63146651305d3030ec2f30cd146961e43639` |
| `navigation/back-45-left.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/back-45-left.webp` | `da82b12cc9baad1b324797acc1651a614189afeef451af2d26c05d83070af09c` |
| `navigation/back-45-right.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/back-45-right.webp` | `08c06809a06aecefefcd4f4a23697fe4663a5aecda9d46a781248327b321e806` |
| `navigation/front-45-left.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/front-45-left.webp` | `686a0d0acbd39278c97ac8254199e53e938a1b0897dc1988a07cb92d127e2204` |
| `navigation/front-45-right.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/front-45-right.webp` | `f7ea7bde065dbe2920e61111d7cb03291b2a7e2445577ba67fdca1e1616e5ce1` |
| `navigation/front-plate.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/front-plate.webp` | `791734004be721c880bc73c165dac5c8896f17a5c495bfe71a992cf91b42f9d7` |
| `navigation/left.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/left.webp` | `5a358dcfad17e34e8c50ed7c2ad40049803f08b4781e13a5a3a18b28b59f28a3` |
| `navigation/rear-plate.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/rear-plate.webp` | `067df7abaf970eabdec2bd75cedad1c1439d06966fa4aa4a22fe5d9e284b49e8` |
| `navigation/right.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/right.webp` | `1761eba0f5d609ffe4e7a8ff8c80aac4db3f4ed9983bd9466e5c36bbebc4face` |
| `source/back-45-left.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/back-45-left.webp` | `da82b12cc9baad1b324797acc1651a614189afeef451af2d26c05d83070af09c` |
| `source/back-45-right.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/back-45-right.webp` | `08c06809a06aecefefcd4f4a23697fe4663a5aecda9d46a781248327b321e806` |
| `source/car-roof.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/car-roof.webp` | `2a976ebf48b50fd4d0fb713994d6782ca33d80a38e345f09438124751e152692` |
| `source/chassis-number.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/chassis-number.webp` | `f6777118b58a3223536a533c7432f7fbeeabf5687b8a21bb860dde0a333a6318` |
| `source/driver-interior.webp` | 1698 × 926 | no | `/assets/inspection-vehicle/photo-guides/driver-interior.webp` | `fe9614eed8acf9c7f9b3df9f936132a7a219647eadb6c34632a1cc90dfc71d98` |
| `source/engine-bay.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/engine-bay.webp` | `452ca66b64a1349e59e1c0d86e995bdf15c085a2b683c7695f7d09b900a112d3` |
| `source/front-45-left.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/front-45-left.webp` | `686a0d0acbd39278c97ac8254199e53e938a1b0897dc1988a07cb92d127e2204` |
| `source/front-45-right.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/front-45-right.webp` | `f7ea7bde065dbe2920e61111d7cb03291b2a7e2445577ba67fdca1e1616e5ce1` |
| `source/front-plate.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/front-plate.webp` | `791734004be721c880bc73c165dac5c8896f17a5c495bfe71a992cf91b42f9d7` |
| `source/interior.webp` | 1697 × 927 | no |  | `0231ff391a5d986e900ea0c73e7aece222c2b4cd55c0ddb973ccccc8ad024f19` |
| `source/left.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/left.webp` | `5a358dcfad17e34e8c50ed7c2ad40049803f08b4781e13a5a3a18b28b59f28a3` |
| `source/odometer-on.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/odometer-on.webp` | `58b020924d18964399cdbeebfc476e7db5ebd9d90934b9e26f6b5cb431225d46` |
| `source/passenger-interior.webp` | 1697 × 927 | no |  | `99900d9cbf1c3f498435d3e54ace343b6123551f9a5f61439d87ced2adf63a70` |
| `source/rear-open.webp` | 1536 × 1024 | no |  | `6e6e8d2edbada9be117c34ced0bda8ceb4f47e18eb5138cfb51d0967873f78c4` |
| `source/rear-plate.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/rear-plate.webp` | `067df7abaf970eabdec2bd75cedad1c1439d06966fa4aa4a22fe5d9e284b49e8` |
| `source/right.webp` | 1697 × 927 | no | `/assets/inspection-vehicle/photo-guides/right.webp` | `1761eba0f5d609ffe4e7a8ff8c80aac4db3f4ed9983bd9466e5c36bbebc4face` |
| `source/spec-plate-2.webp` | 1672 × 941 | no |  | `deb65162ccc90cf10c95fc50608ff864b2e713714a10fbdf5f35f57bc89cef93` |
| `source/spec-plate.webp` | 1672 × 941 | no | `/assets/inspection-vehicle/photo-guides/spec-plate.webp` | `c098e6b93257e0d9ae1f7210974cf4076ba3bee14d7a490b7b0389797048da84` |
| `source/underbody.webp` | 1697 × 927 | no |  | `165e451cfeba6c2a8530610d1fd5bc7b3a980e5c1aeea8f90c789c2833f9c4ec` |

## Preserved/non-active exceptions

- Existing customer-captured photo/video Blobs are evidence, not replaceable guide artwork. Their bytes and accepted/draft history are untouched.
- Valid brokerage image overrides are preserved, including intentionally chosen historical imagery. No database-wide publication/draft migration runs. Admin can replace one slot or use its existing “پیش‌فرض” action, save and publish without resetting unrelated settings.
- OTP phone/shield, engine-power and phone-battery illustrations contain no vehicle-family artwork and remain. Logos and generic functional car icons remain brand/UI symbols.
- Optional 3D source, GLB, fallback, semantic nodes, materials, cameras, controls and licensing are untouched. Its Sportage differs intentionally from this sedan. The isolated old SVG 3D fallback is not the customer 2D workflow.
- VideoOrbit is an unmounted legacy component (no runtime import); its historical generic top-view SVG is not used by Recorder V2. Recorder onboarding/review use guidance text and actual recorded video, not hidden SUV artwork.
- Historical references/screens, screenshot baselines, legacy public automotive images and their provenance remain. They have no default production 2D consumer after migration; old canonical guide metadata is resolved at display time, not rewritten in immutable template history.
- The historical readiness local mismatch remains untouched in its original worktree; only the approved canonical default sedan image framing changed here.
