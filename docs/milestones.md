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
