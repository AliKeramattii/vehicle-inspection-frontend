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
  metadata come from that repository. Verification succeeds on the current screen; phase 02 is
  deliberately not routed or implemented.
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
```json
{
  "accepted": true,
  "termsVersion": "2026-10"
}
```

## Location

### PUT `/api/inspections/{inspectionId}/location`
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

## Vehicle

### GET `/api/inspections/{inspectionId}/vehicle`

### PUT `/api/inspections/{inspectionId}/vehicle`
Use for customer-confirmed/corrected vehicle values.

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
