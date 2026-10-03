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

## Entry/auth

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
