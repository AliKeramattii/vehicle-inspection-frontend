# Frontend -> ASP.NET API Contract

This document is the frontend team's requested API surface.
The backend team may refine URLs and DTOs, but behavior and required data must remain explicit.

## General rules

- JSON unless an upload URL requires binary upload.
- Dates: ISO 8601 UTC strings.
- Numeric odometer values are integers, never Persian-formatted strings.
- Stable machine-readable status/reason codes.
- Consistent validation/error envelope.
- OpenAPI/Swagger published by the ASP.NET service.
- Frontend TypeScript API types should ultimately be generated from OpenAPI.

## Bootstrap repository boundary

`src/lib/api/repositories.ts` defines `AuthRepository` and `InspectionRepository` in domain terms.
`src/lib/api/client.ts` explicitly composes isolated mock implementations; no HTTP calls are made.
When the ASP.NET service is available, implement HTTP repositories behind these interfaces, place
OpenAPI-generated transport types in `src/lib/api/generated/`, validate transport responses, and
adapt them before returning domain models to components. Existing paths used by these interfaces
are centralized in `src/lib/api/endpoints.ts`; add further paths when their phases are implemented.

The inspection DTO in `src/lib/api/adapters/inspection.ts` is provisional: `inspectionId`,
`vehicleDetails`, `locationDetails`, and `evidenceItems` map to domain `id`, `vehicle`, `location`,
and `evidence`. This shape is a frontend fixture, not a finalized backend response specification.

Mock development values:
- Referral: `A4K9P2` (trimmed and normalized to uppercase).
- Mobile: an ASCII Iranian mobile number matching `09` plus nine digits.
- OTP: `12345`; call `requestOtp` on the same repository instance first.
- Inspection: `insp_demo`; a draft with sample vehicle, no location, and no evidence.
- Capture plan: two sample slots with arbitrary codes; not the later 14-shot template.

Mock OTP challenges expire after two minutes, allow three incorrect attempts, and are consumed
on successful verification. The factory defaults to a 60-second resend window; phase 01's customer
provider configures 120 seconds to match the reference countdown. The mock enforces this window.
SMS delivery, durable sessions, and production authentication remain backend responsibilities.
Mocks hold challenges only inside each repository instance and never issue tokens.
Repository errors expose stable codes; Zod rejects malformed input or fixture data.

## Entry/auth

### Phase 01 mock workflow

- `/` validates `A4K9P2`, then requests an OTP for the mock invitation mobile `09120004567`.
  This demo context is defined in `features/auth/config.ts`; it is not inferred from a backend
  referral response. Production invitation/phone acquisition still needs an agreed contract.
- `/verify` accepts five digits (`12345` succeeds), auto-verifies exactly once per completed
  entry, and presents Persian numerals while sending ASCII values to the repository.
- Resend and number editing call the same repository's `requestOtp`; cooldowns and failed-attempt
  metadata come from that repository. Phase 02 now routes successful verification to `/readiness`,
  then `/consent`, retaining only the verified inspection ID in transient workflow memory.
- No tokens, HTTP requests, persistent sessions, or browser SMS interception are implemented.
  Native `autocomplete="one-time-code"` supports autofill-capable browsers; actual SMS delivery
  and platform autofill depend on future backend integration and device behavior.

Frontend-required challenge metadata (a requested future API shape, not a finalized response):

```json
{ "expiresAt": "2026-10-04T00:02:00Z", "retryAfterSeconds": 120, "remainingAttempts": 3 }
```

Failed verification must expose `remainingAttempts`; early resend must expose `retryAfterSeconds`.
Mock `RepositoryError.details` carries these fields alongside `OTP_INVALID`, `OTP_LOCKED`, or
`OTP_RESEND_TOO_SOON`. Transport adapters should map authoritative API error metadata to this
domain shape once OpenAPI is available. The UI does not locally guess the number of attempts.

Partner/support branding is reference copy. The support disclosure directs customers to their
issuing insurance representative; no phone number or external contact URL has been invented.

### POST `/api/referrals/validate`
Request:
```json
{ "code": "A4K9P2" }
```

Response:
```json
{
  "valid": true,
  "partnerId": "partner_123",
  "partnerName": "بیمه نمونه",
  "referralOwnerName": "نام نمونه"
}
```

### POST `/api/auth/otp/request`
Request:
```json
{ "mobile": "09121234567", "referralCode": "A4K9P2" }
```

### POST `/api/auth/otp/verify`
Request:
```json
{ "mobile": "09121234567", "code": "12345" }
```

Response:
```json
{
  "verified": true,
  "isNewUser": false,
  "inspectionId": "insp_123"
}
```

### GET `/api/me`
Returns current user/session context.

## Inspection

### POST `/api/inspections`
Creates/initializes an inspection when needed.

### GET `/api/inspections/{inspectionId}`
Returns inspection summary and workflow state.

### GET `/api/inspections/{inspectionId}/status`
Returns the current inspection/review status.

## Consent

### POST `/api/inspections/{inspectionId}/consent`
Planned ASP.NET endpoint; Phase 02 calls `InspectionRepository.recordConsent` with an
isolated in-memory mock instead of HTTP. No browser permission grant is represented by consent.

Request (explicit acceptance required):
```json
{
  "accepted": true,
  "termsVersion": "2026-10"
}
```

Requested response, not yet confirmed by the backend:
```json
{
  "inspectionId": "insp_123",
  "accepted": true,
  "termsVersion": "2026-10",
  "acceptedAt": "2026-10-04T00:00:00Z"
}
```

The server must authenticate the customer and authorize access to this inspection; credentials
and session strategy remain unconfirmed. Acceptance time is server-controlled. Repeating the
same accepted terms version should be idempotent. Reject missing/false acceptance or unsupported
terms versions with structured validation errors (400/422); distinguish 401, 403, 404, stale-version
409, 429, and server/network/timeout failures. The future adapter must preserve safe useful errors
for the form's retry state. No additional consent endpoints are assumed.

The mock validates `accepted: true` and version `2026-10`, records a cloned receipt per repository
instance, and returns it idempotently. Refresh resets it, just like mock auth. This is development
workflow evidence, not durable production consent. Final terms, retention policy and customer
rights require service-owner/legal approval before production use.

Readiness capability checks are local diagnostics through `CapabilityService`, currently
deterministic mock results. They do not invoke camera/GPS permissions, create WebGL contexts,
reserve storage, or submit device facts to the backend. These require future browser adapters
and explicit permission requests in the relevant feature, not a new API endpoint.

## Location

### PUT `/api/inspections/{inspectionId}/location`
Planned contract, not a confirmed ASP.NET implementation. Phase 03 calls the typed in-memory
`InspectionRepository.saveLocation`. Its frontend model is flat; a future transport adapter maps
`formattedAddress`, building, unit/floor and parking into the nested `address` payload below.
Coordinates/accuracy are numbers; unit/floor and parking may be empty or omitted. Building numbers
are strings (the form normalizes Persian/Arabic numeric glyphs to ASCII). The server should return
the authoritative saved coordinates, accuracy and address in the same shape, adapted back to
`InspectionLocation`. It must authorize the inspection owner and require accepted consent.

```json
{
  "latitude": 35.721,
  "longitude": 51.334,
  "accuracyMeters": 8,
  "address": {
    "formatted": "تهران، ...",
    "buildingNumber": "123",
    "unitFloor": "طبقه ۳، واحد ۱۲",
    "parkingDescription": "پارکینگ ورودی ساختمان، سمت راست"
  }
}
```

The development map/GPS adapter returns one deterministic suggested location with 8m accuracy.
Dragging or keyboard panning changes coordinates; the pin remains anchored and the GPS marker
moves with the map. There is no production tile/geocoding provider, browser GPS prompt, external
map URL or API key. A real provider must implement the stable map/location boundary and perform
permission requests only after explicit locate interaction. This does not require a new endpoint.
Distinguish 400/422 field validation, 401/403, 404, 409 missing consent/stale inspection, 429 and
server/network/timeout errors. The mock enforces consent and validates coordinate bounds.

## Vehicle

### GET `/api/inspections/{inspectionId}/vehicle`
Planned response supplies `make`, `model`, numeric `year`, `colorName`, optional `colorHex`,
masked-only `vinMasked`, semantic `plate` (below), and optional numeric `odometerKm`.
The frontend never requests or reconstructs the full VIN. `getVehicle` currently returns a cloned
frontend model or null through the mock repository; transport DTOs must be adapted in a real client.

### PUT `/api/inspections/{inspectionId}/vehicle`
Planned confirmation request (not integrated):
```json
{
  "confirmed": true,
  "plate": { "firstTwoDigits": "45", "letter": "ب", "threeDigits": "723", "regionDigits": "11" },
  "discrepancy": { "field": "color", "description": "رنگ بدنه سفید است" }
}
```
`discrepancy` is optional; supported field IDs are `model`, `year`, `color`, `vin` and description
is short customer-entered text (3–500 characters). It records a review concern rather than silently
overwriting official vehicle details. The requested operation atomically confirms/saves the plate
and optional discrepancy and returns `{ inspectionId, plate, discrepancy?, confirmedAt }`, with
server-controlled ISO time. Equivalent repeated confirmations should be idempotent. A future
adapter adds the transport-only `confirmed: true`; the domain action is `confirmVehicle`.
Backend agreement on this atomic request remains pending; no extra endpoint is assumed.

The mock requires previously saved location, validates semantic plate values, returns cloned
receipts and keeps per-instance confirmation/plate state. Query owns reads and save results;
local forms own only editing drafts. Refresh resets auth/consent/location/confirmation. Authentication,
owner authorization and durable records remain production backend responsibilities. Distinguish
400/422 plate/discrepancy errors, 401/403, 404 missing vehicle, 409 missing location/stale data,
429, server/network/timeout failures. No real ASP.NET requests are enabled.

### PUT `/api/inspections/{inspectionId}/vehicle/plate`
Plate structure should be semantic:
```json
{
  "firstTwoDigits": "45",
  "letter": "ب",
  "threeDigits": "723",
  "regionDigits": "11"
}
```
This existing planned endpoint can support independent plate correction. Phase 03 submits plate
and final confirmation through the single mock domain operation above; it does not independently
send or invent a plate HTTP request. Numeric segments remain ASCII strings with lengths 2/3/2;
presentation uses Persian glyphs. The letter selector supports the conventional letters listed in
`iranianPlateLetters`; alternate formats currently show contact guidance and block confirmation
while the disclosure is open. Alternate-format domain/API support remains unimplemented.

## Capture plan

### GET `/api/inspections/{inspectionId}/capture-plan`

The frontend must not permanently hardcode the 14-shot workflow.

Example:
```json
{
  "templateId": "body-standard",
  "templateVersion": 3,
  "totalRequired": 14,
  "shots": [
    {
      "code": "CAP-05",
      "title": "نمای مستقیم جلو با پلاک",
      "category": "body",
      "required": true,
      "guideAvailable": true,
      "distanceMeters": 3,
      "phoneHeight": "waist",
      "cameraOrientation": "portrait",
      "viewpoint": "front",
      "highlightNodes": ["Plate_Front", "Bumper_Front"],
      "qualityPolicy": {
        "plateReadable": true,
        "minimumGpsAccuracyMeters": 25
      }
    }
  ]
}
```

## Evidence/upload

Recommended flow:

1. Create evidence metadata.
2. Backend returns an object-storage upload URL.
3. Browser uploads media directly.
4. Frontend tells backend upload is complete.
5. Backend processes/verifies asynchronously.

### POST `/api/inspections/{inspectionId}/evidence`
```json
{
  "shotCode": "CAP-05",
  "mediaType": "image",
  "capturedAt": "2026-10-03T14:32:10Z",
  "location": {
    "latitude": 35.721,
    "longitude": 51.334,
    "accuracyMeters": 8
  }
}
```

Response:
```json
{
  "evidenceId": "ev_93842",
  "uploadUrl": "https://...",
  "expiresAt": "2026-10-03T14:47:10Z"
}
```

### POST `/api/evidence/{evidenceId}/complete`

### GET `/api/inspections/{inspectionId}/evidence`

Evidence state should support:
- local (frontend only)
- queued (frontend only)
- uploading (frontend only)
- processing
- uploaded
- verified
- failed
- retakeRequired

## Odometer

### PUT `/api/inspections/{inspectionId}/odometer`
```json
{
  "value": 48320,
  "evidenceId": "ev_CAP10"
}
```

## 360 video

Use the same evidence mechanism with `mediaType: "video360"` and appropriate upload metadata.

## Final summary/submission

### GET `/api/inspections/{inspectionId}/summary`

### POST `/api/inspections/{inspectionId}/submit`

Response:
```json
{
  "reference": "BDI-8F31K2",
  "status": "queuedForReview",
  "estimatedReviewMinutes": 120
}
```

## Additional evidence

### GET `/api/inspections/{inspectionId}/evidence-requests`

Response:
```json
{
  "requests": [
    {
      "id": "req_123",
      "shotCode": "CAP-05",
      "reason": "plateUnreadable",
      "message": "پلاک در تصویر قبلی خوانا نیست."
    }
  ]
}
```

### POST `/api/evidence-requests/{requestId}/replacement`

### POST `/api/inspections/{inspectionId}/resubmit`

## Reviewer

### GET `/api/reviewer/cases`
Filters:
- partner
- status
- flags
- submissionFrom
- submissionTo
- search
- page
- pageSize
- sort

### GET `/api/reviewer/cases/{caseId}`

### GET `/api/reviewer/cases/{caseId}/evidence`

### POST `/api/reviewer/evidence/{evidenceId}/decision`
```json
{
  "decision": "retake",
  "reason": "plateUnreadable",
  "comment": "پلاک در تصویر خوانا نیست."
}
```

### POST `/api/reviewer/cases/{caseId}/additional-evidence`

### POST `/api/reviewer/cases/{caseId}/decision`

## Admin capture templates

### GET `/api/admin/capture-templates`
### GET `/api/admin/capture-templates/{id}`
### POST `/api/admin/capture-templates`
### PUT `/api/admin/capture-templates/{id}`
### POST `/api/admin/capture-templates/{id}/versions`
### POST `/api/admin/capture-templates/{id}/publish`
### PUT `/api/admin/capture-templates/{id}/slots/{captureCode}`

## Errors

Use one predictable shape:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "اطلاعات واردشده معتبر نیست.",
  "errors": {
    "plate": ["شماره پلاک معتبر نیست."]
  },
  "traceId": "..."
}
```
