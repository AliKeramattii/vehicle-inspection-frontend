# Codex task — Location + Vehicle Identity

## Canonical visual references

- `references/screens/05-location.png`
- `references/screens/06-vehicle-identity.png`

Inspect **all** references above before implementation. The first screen-specific image is the primary composition reference; the others are supporting references for shared visual language, media, 3D, or overlay details.


Create an ExecPlan before implementation.

Implement:
- inspection location
- vehicle confirmation
- Iranian plate confirmation/editing

Follow the existing product design system and local references/assets.

Location:
- map-first layout
- journey stepper
- center-fixed custom pin
- GPS accuracy state
- locate-me control
- editable Persian address form
- building/unit/parking fields
- mocked geolocation and map adapter behind an interface
- sticky CTA

Vehicle:
- premium configurator-like summary
- semantic vehicle model
- color swatch
- masked VIN
- custom IranianPlate component
- correct / plate incorrect choice
- segmented manual plate input
- discrepancy action
- sticky CTA

Do not tightly couple components to a specific map vendor.
Keep plate data semantic, not a single formatted string.
