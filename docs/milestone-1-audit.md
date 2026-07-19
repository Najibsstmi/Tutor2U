# Milestone 1 Audit

Date: 2026-07-19
Workspace inspected: `C:\Projects\Tutor2U`

## Summary

Milestone 1 has a solid Next.js App Router foundation, shadcn/ui components, demo dashboards, Supabase helpers, a first database migration, seed data, PWA assets and brand assets. Critical gaps found before Milestone 2 were the missing bilingual message files/language persistence, missing `.env.example`, no explicit TypeScript/test scripts, and no dedicated audit document.

## Requirement Status

| Area | Status | Notes / Fix |
| --- | --- | --- |
| Current folder structure | Complete | `src/app`, `src/components`, `src/lib`, `supabase`, `docs`, and `public` are present. |
| Installed dependencies | Complete | Next.js 16, React 19, Supabase, shadcn/ui, Zod, React Hook Form, Recharts, Sonner and Lucide are installed. |
| Next.js configuration | Complete | App Router project with `src/proxy.ts`, PWA manifest route, and build-ready config. |
| Internationalization implementation | Partially complete | Added `messages/ms.json`, `messages/en.json`, `src/lib/i18n/*`, cookie persistence, and a header language switcher. Existing older pages still contain hardcoded BM text and remain to be migrated. |
| Bahasa Melayu and English files | Complete | New user-facing Milestone 2 text is centralized in `messages/ms.json` and `messages/en.json`. |
| Language-switching persistence | Complete | `tutor2u_locale` cookie persists BM/EN and `router.refresh()` preserves current route. |
| Supabase configuration | Complete | Browser/server helpers exist and lazy initialization keeps demo mode build-safe when env vars are absent. |
| Authentication implementation | Partially complete | Demo auth/role cookie works locally. Production Supabase Auth wiring still needs real sign-up/session flows. |
| Role-based routing | Partially complete | `src/proxy.ts` redirects dashboard roles by demo role cookie. Server component/action authorization is still required for production data mutations. |
| Parent dashboard | Partially complete | Rich demo dashboard exists. Real Supabase data binding is pending. |
| Tutor dashboard | Partially complete | Existing demo dashboard plus new link to onboarding. Real backend persistence is pending. |
| Admin dashboard | Partially complete | Existing demo dashboard plus new link to verification module. Real backend persistence is pending. |
| Database migrations | Complete | `0001_initial_schema.sql` exists; `0002_tutor_onboarding_verification.sql` now extends onboarding/verification safely. |
| Row Level Security | Partially complete | M1 RLS exists; M2 adds application/document/action policies. Supabase SQL should still be run in a real project for final verification. |
| Demo data | Complete | Marketplace/demo dashboards exist; M2 adds realistic tutor application demo data with masked identity numbers. |
| Lint status | Pending validation | Run with `npm run lint` after implementation. |
| TypeScript status | Pending validation | Added `npm run typecheck`; run after implementation. |
| Production build status | Pending validation | Run with `npm run build` after implementation. |
| PWA and icons | Complete | Manifest, service worker, and Tutor2U brand assets are present in `public/brand`. |
| Environment example | Complete | Added `.env.example` for local and deployment setup. |

## Critical Fixes Applied

- Added bilingual message files and translation helpers.
- Added language switcher with cookie persistence.
- Added `.env.example`.
- Added `typecheck` and `test` npm scripts.
- Added Milestone 2 status and availability logic with tests.
- Added Supabase migration for tutor onboarding, private storage buckets, RLS, audit logs and transition triggers.

## Remaining Milestone 1 Limitations

- Several older Fasa 1 pages and dashboard sections still contain hardcoded Bahasa Melayu text.
- Demo auth uses cookies; production Supabase Auth session handling and server-side authorization must be expanded before live use.
- Existing dashboard statistics are demo data, not live Supabase queries.
