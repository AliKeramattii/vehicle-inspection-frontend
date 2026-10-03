# Codex Execution Plans

Use an ExecPlan for a substantial feature, architectural change, multi-screen phase, or refactor.

Save active plans under `.agent/plans/<short-name>.md`.

An ExecPlan must be understandable by a developer who has only the repository and the plan.

## Required sections

# <Plan title>

## Goal
What observable result will exist when this plan is complete?

## User-visible behavior
Describe the final workflow and visual outcome.

## Current state
What relevant files, components, mocks, and limitations currently exist?

## Constraints
List important architecture, RTL, design, browser, security, and backend constraints.

## Implementation
Ordered implementation steps with file paths.

## API impact
New/changed frontend domain types, mock contracts, and endpoints needed from ASP.NET.

## Testing
Unit, Playwright, visual regression, and manual verification.

## Acceptance criteria
Concrete checklist that can be verified.

## Progress
Keep this updated while implementing:
- [ ] ...
