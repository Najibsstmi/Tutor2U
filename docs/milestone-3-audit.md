# Milestone 3 Audit

Date: 2026-07-20

Scope: live Supabase integration, production authentication, tutor onboarding persistence, storage, admin verification, approved tutor public data, localization, RLS and tests.

## Summary

Milestone 1 and 2 foundations are present: Next.js App Router, Supabase clients, database migrations, PWA assets, role dashboards, tutor onboarding UI, admin verification UI, bilingual message files and focused tests.

Milestone 3 is partially implemented in this pass. The codebase now has server-side auth helpers/actions, Supabase callback handling, dashboard server guards, live onboarding server actions, a document upload route, admin verification server actions, an approved-tutor marketplace data source and migration `0003_live_auth_onboarding_integration.sql`.

The project has not been verified against a real Supabase project in this environment, so production-live completion still requires applying migrations to Supabase and running end-to-end auth/upload/admin flows with real env vars.

## Classification

| Area | Status | Notes |
| --- | --- | --- |
| Supabase Auth client/server helpers | Partially complete | Server helpers and actions added. Needs real Supabase auth smoke test. |
| Public registration | Partially complete | Server action blocks public admin signup; DB trigger normalizes public signup role to parent/tutor only. |
| Login/logout/session refresh | Partially complete | Password login/logout actions and proxy session refresh added. UI logout control is not yet surfaced in header. |
| Password reset/update | Partially complete | Server actions exist; dedicated pages/forms still need UI. |
| Server authorization | Partially complete | `requireUser`, `requireRole`, `requireAdmin`, `getCurrentProfile` added and dashboard pages guarded. |
| Tutor onboarding persistence | Partially complete | Server actions persist application core and related detail rows. UI keeps demo localStorage fallback. |
| Supabase Storage uploads | Partially complete | Private upload route, safe path helper and metadata insert added. UI file controls still store metadata unless wired to POST route. |
| Admin verification live actions | Partially complete | Server actions for status, document status and signed URLs added. Client panel still uses demo state unless next pass wires live data/actions. |
| Approved public tutor data | Partially complete | Marketplace can read `approved_tutor_public_profiles` with demo fallback. |
| Localization | Partially complete | M2 pages use message files; older marketplace/profile/auth copy still has hardcoded BM text. |
| RLS hardening | Partially complete | New migration adds auth trigger, self-role-escalation guard, safer public read policies and storage update/delete policies. |
| Tests | Partially complete | Added pure tests for role restriction, storage path safety and migration checks. No live Supabase integration tests yet. |

## Main Risks

- Real Supabase flows need environment variables and migrations applied before claiming production completion.
- Onboarding Server Actions write multiple tables without a database transaction RPC; a future RPC would make all-or-nothing saves stronger.
- Admin verification UI still needs live query wiring and refresh states.
- File upload UI still needs direct POST integration to `/api/tutor-onboarding/documents`.
- Localization is not yet complete across all older pages.

## Recommended Next Work

1. Apply migrations `0001`, `0002`, `0003` to a Supabase project.
2. Test parent/tutor signup, email callback, login, dashboard access and logout.
3. Wire onboarding file inputs to the upload route and store returned document IDs.
4. Wire admin verification panel to live list/actions.
5. Finish hardcoded text migration to `messages/ms.json` and `messages/en.json`.
