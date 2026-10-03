# Codex task — Prepare API integration boundary

Read `docs/API_CONTRACT.md`.

Do not assume the ASP.NET backend is complete.

Implement:

1. Central API client abstraction.
2. Endpoint constants/config.
3. Zod validation at important external-data boundaries.
4. DTO -> domain adapters.
5. Repository interfaces for:
   - auth/referral
   - inspection
   - capture plan
   - evidence
   - upload
   - reviewer
   - admin templates
6. Mock repository implementations.
7. Real repository stubs behind environment/config switching.
8. A documented plan for OpenAPI-generated TypeScript types under `src/lib/api/generated/`.
9. Predictable API error normalization.
10. No secrets in browser bundles.

UI components must consume domain/repository hooks, not transport DTOs.
