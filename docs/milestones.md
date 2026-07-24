# Tutor2U Milestones

## Milestone 1: Foundation

Status: Partially complete with critical fixes applied.

Completed foundations include Next.js App Router, shadcn/ui, Supabase helpers, PWA assets, role dashboards, marketplace demo data, base database migration and RLS. Added during this pass: bilingual message files, language switcher, `.env.example`, typecheck and test scripts.

## Milestone 2: Tutor Onboarding and Admin Verification

Status: Implemented as a production-oriented demo flow with database architecture.

Delivered:

- Tutor onboarding route and multi-step form.
- Draft save and autosave.
- Zod/RHF validation.
- Admin tutor application review route.
- Confirmation dialogs and reason capture.
- Status transition helpers and tests.
- Supabase migration for applications, actions, rates, categories, storage and RLS.
- Documentation for onboarding, verification, storage and transitions.

Remaining:

- Wire form submissions to Supabase server actions.
- Implement real Supabase Storage uploads and signed URL generation.
- Migrate older Milestone 1 UI text fully into i18n files.

## Recommended Milestone 3

Connect the tutor onboarding and admin verification UI to live Supabase:

- Server actions for draft save, submit, resubmit and admin decisions.
- Real private document upload and signed URL fetching.
- Admin dashboard live queries with pagination.
- Public marketplace visibility for approved tutors only.

## Milestone 3: Live Auth and Supabase Integration

Status: Partially implemented.

Delivered in this pass:

- Server-side Supabase auth helpers and actions.
- Supabase email callback route.
- Dashboard server guards with Supabase-first role resolution.
- Tutor onboarding server actions for live save/submit/resubmit.
- Private document upload route and storage path validation helpers.
- Admin verification server actions for status, document review and signed URLs.
- Approved tutor marketplace data source with demo fallback.
- Migration `0003_live_auth_onboarding_integration.sql` for auth profile bootstrap, role escalation guard, stricter public read policies and storage update/delete policies.
- Additional tests for public role restrictions, storage path safety and migration hardening.

Remaining:

- Apply migrations to a real Supabase project and run end-to-end auth/storage/admin flows.
- Wire admin panel to live list/actions.
- Wire onboarding file inputs directly to the upload route.
- Complete localization for older UI surfaces.
