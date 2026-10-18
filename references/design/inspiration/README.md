# Design inspiration (internal comparison only)

The user supplied direct links. Downloaded images remain local and ignored, never imported into production.

|Reference|Local file / access|Observed design use|
|---|---|---|
|[Fleetr](https://dribbble.com/shots/23565014-Fleet-Management-App-Design-Design-Concept)|fleetr/reference.png; HTTP 200, inspected|Vehicle-led mobile hierarchy, distinct task and action regions|
|[Automotive Inspection](https://dribbble.com/shots/27360076-Inspection-App-Automotive-Assembly-Quality-Control)|automotive-inspection/reference.png; inspected|Grouped tasks, compact workflow progression|
|[Shadcn Admin](https://github.com/satnaing/shadcn-admin)|shadcn-admin/reference.png; inspected repository preview|Settings navigation, form/preview hierarchy, neutral operational workspace|
|[EGO](https://dribbble.com/shots/18419493-Vehicle-Inspection)|ego-vehicle/reference.jpg; HTTP 200, inspected|Separate task groups and focused camera framing|
|[Wreckbook](https://dribbble.com/shots/26569581-Wreckbook-Modern-Vehicle-Damage-Inventory-Management-UI)|Supplied CDN URL returns HTTP 404; not visually inspected|No unobserved visual details claimed; user authorized continuing without it|

Shadcn public source studied: layout/app-sidebar.tsx, header.tsx, nav-group.tsx, ui/sidebar.tsx, ui/sheet.tsx, settings/index.tsx, settings/components/sidebar-nav.tsx and MIT LICENSE (copyright SatNaing, 2024). The live Netlify preview timed out; the repository preview and source were available. Original project components are retained; no source copied from the reference.
