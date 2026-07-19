# Tutor2U Architecture Plan

Tutor2U is a production-ready, mobile-first PWA for a Malaysian tutor marketplace. Fasa 1 focuses on authentication structure, role-based dashboards, tutor discovery, booking, attendance, progress reporting, rating, and admin verification.

## 1. Architecture Plan

- Framework: Next.js App Router with TypeScript, Server Components by default, and Client Components only for interactive flows.
- UI: Tailwind CSS, shadcn/ui source components, Lucide React icons, Recharts for academic and operations graphs.
- Authentication: Supabase Auth with a role-aware `profiles` table. The local Fasa 1 build includes a demo role cookie so the app can run without Supabase secrets.
- Database: Supabase PostgreSQL with UUID primary keys, timestamp with timezone columns, foreign keys, indexes, RLS policies, and a transaction-safe booking model.
- Storage: Supabase Storage bucket for private tutor documents. Public profile images are separated from sensitive document uploads.
- Validation: Zod schemas paired with React Hook Form for auth, profile, booking, report, and review forms.
- PWA: Manifest metadata, installable icons, offline fallback cache, and responsive app shell.
- Deployment: Vercel-ready Next.js app with `.env.example`, Supabase migrations, seed data, and README setup instructions.

## 2. Folder Structure

```txt
src/
  app/
    page.tsx
    manifest.ts
    login/page.tsx
    daftar/page.tsx
    cari-tutor/page.tsx
    tutor/[id]/page.tsx
    dashboard/
      page.tsx
      parent/page.tsx
      tutor/page.tsx
      admin/page.tsx
  components/
    auth/
    dashboards/
    marketplace/
    pwa/
    shared/
    ui/
  lib/
    auth/
    demo-data.ts
    i18n.ts
    supabase/
    types.ts
    validation.ts
supabase/
  migrations/
  seed.sql
docs/
  architecture.md
```

## 3. Database Entity Relationship Plan

Core identity:

- `profiles` stores every authenticated user and role: parent, tutor, admin.
- `parent_profiles`, `tutor_profiles`, and `student_profiles` extend `profiles`.
- A parent owns many students. A tutor may teach many students through bookings.

Tutor marketplace:

- `subjects`, `education_levels`, and `curriculums` define searchable academic taxonomy.
- `tutor_subjects`, `tutor_service_areas`, `tutor_availability`, `tutor_badges`, and `tutor_scores` power discovery and ranking.
- `favourite_tutors` and `tutor_comparisons` support parent shortlisting.

Booking and classes:

- `packages` defines purchasable plans.
- `bookings` represents a parent booking for one child, tutor, subject, and package.
- `booking_sessions` stores scheduled class slots and prevents double booking with a unique partial index.
- `attendance` records PIN confirmation and tutor attendance status.

Academic monitoring:

- `curriculum_topics`, `student_topic_progress`, `assignments`, `assignment_submissions`, `assessments`, `assessment_results`, and `progress_reports` track mastery, work, tests, and tutor recommendations.

Quality and operations:

- `reviews` and `review_criteria_scores` separate verified customer rating from professional score.
- `complaints`, `payments`, `tutor_payouts`, `notifications`, and `audit_logs` support admin operations and payment integration later.

## 4. User Flows

Parent:

1. Register or login.
2. Complete parent profile and add one or more children.
3. Search tutors by location, subject, level, curriculum, class mode, rating, professional score, price, and available slots.
4. Save favourites or compare up to three tutors.
5. View tutor profile and real-time schedule.
6. Book trial or package, choose child, subject, mode, slot, and learning objective.
7. Confirm attendance by PIN after class.
8. Review progress charts, submit rating, or raise a complaint/change request.

Tutor:

1. Register as tutor and complete staged professional profile.
2. Upload profile photo, IC, and certificates.
3. Add qualifications, subjects, levels, service areas, rate, and weekly availability.
4. Accept or reject class requests.
5. Start/end class, record attendance, submit report, assign work, and record marks.
6. Track reviews, income, commission, payout status, absences, and replacement requests.

Admin:

1. Login as admin.
2. Review operational dashboard.
3. Verify tutor documents, approve/reject/request corrections/suspend/block.
4. Manage parents, students, bookings, classes, reports, reviews, complaints, packages, payments, tutor payouts, categories, replacement tutors, and audit logs.

## 5. Page List

Public:

- `/`
- `/cari-tutor`
- `/cara-ia-berfungsi`
- `/kategori-tutor`
- `/jadi-tutor`
- `/tentang-kami`
- `/soalan-lazim`
- `/hubungi-kami`
- `/terma-perkhidmatan`
- `/polisi-privasi`
- `/login`
- `/daftar`
- `/tutor/[id]`

Authenticated:

- `/dashboard`
- `/dashboard/parent`
- `/dashboard/tutor`
- `/dashboard/admin`

## 6. Milestone Plan

Milestone 1: Foundation

- Scaffold Next.js App Router, Tailwind, shadcn/ui, Supabase helpers, env example, PWA manifest, and app shell.

Milestone 2: Data and Security

- Add migration SQL, seed data, RLS policies, role helpers, validation schemas, and demo data layer.

Milestone 3: Public Marketplace

- Build landing page, tutor search filters, tutor cards, comparison, profile detail, schedule view, and booking dialog.

Milestone 4: Role Dashboards

- Build parent, tutor, and admin dashboards with realistic stats, charts, tables, empty states, and key Fasa 1 actions.

Milestone 5: Verification and Quality

- Add admin tutor verification workflow, rating criteria, attendance confirmation, progress reports, and complaint/change request surfaces.

Milestone 6: Production Readiness

- Add README, PWA registration, Supabase setup notes, Vercel deployment guidance, lint/build validation, and accessibility checks.
