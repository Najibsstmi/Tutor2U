# Tutor2U

Tutor2U ialah Progressive Web App marketplace tutor seluruh Malaysia. Fasa 1 merangkumi authentication structure, role-based dashboards, profil tutor, profil ibu bapa dan murid, pengesahan tutor, carian dan tapisan tutor, perbandingan tutor, jadual, tempahan, kehadiran, laporan perkembangan, rating terperinci dan dashboard admin.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth, PostgreSQL dan Storage
- Zod dan React Hook Form
- Recharts
- Lucide React
- PWA manifest dan service worker
- Vercel-ready deployment

## Local Setup

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

Tanpa Supabase env vars, app berjalan dalam mod demo. Login demo:

- Parent: `farah.parent@tutor2u.test`
- Tutor: `aisyah.tutor@tutor2u.test`
- Admin: `admin@tutor2u.test`
- Password demo: `Password123!`

## Environment

Salin `.env.example` kepada `.env.local` dan isi nilai Supabase sebenar.

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PAYMENT_PROVIDER=placeholder
```

Jangan commit secret key.

## New Milestone 2 Routes

- Tutor onboarding: `http://localhost:3000/dashboard/tutor/onboarding`
- Admin verification: `http://localhost:3000/dashboard/admin/tutor-applications`

Use the demo login flow and choose the matching role before opening each dashboard route.

## Supabase Setup

1. Cipta projek Supabase.
2. Jalankan migration:

```bash
supabase db push
```

Atau jalankan SQL migration berikut melalui SQL editor mengikut turutan:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_tutor_onboarding_verification.sql`

3. Jalankan seed data:

```bash
supabase db seed
```

Atau jalankan `supabase/seed.sql` melalui SQL editor.

4. Pastikan bucket berikut wujud:

- `tutor-documents` private legacy bucket
- `tutor-identity-documents` private
- `tutor-qualification-documents` private
- `tutor-profile-images` public atau safe public profile image mechanism

## Database and RLS

Migration menyediakan jadual utama yang diminta:

- `profiles`, `parent_profiles`, `tutor_profiles`, `student_profiles`
- `tutor_documents`, `tutor_qualifications`, `tutor_subjects`, `tutor_service_areas`, `tutor_availability`
- `subjects`, `education_levels`, `curriculums`, `curriculum_topics`
- `tutor_badges`, `tutor_scores`, `favourite_tutors`, `tutor_comparisons`
- `packages`, `bookings`, `booking_sessions`, `attendance`
- `progress_reports`, `student_topic_progress`, `assignments`, `assignment_submissions`
- `assessments`, `assessment_results`, `reviews`, `review_criteria_scores`
- `complaints`, `payments`, `tutor_payouts`, `notifications`, `audit_logs`

RLS memastikan parent hanya melihat anak sendiri, tutor hanya melihat murid/kelas yang diberikan, admin boleh mengurus semua data, review hanya untuk sesi selesai, dan dokumen tutor tidak boleh diakses umum.

Double booking dicegah melalui unique partial index pada `booking_sessions` untuk slot tutor aktif.

Milestone 2 menambah:

- `tutor_applications`
- `tutor_experiences`
- `tutor_education_levels`
- `tutor_curriculums`
- `tutor_categories`
- `tutor_profile_categories`
- `tutor_rates`
- `tutor_verification_actions`
- transition trigger untuk status permohonan tutor
- trigger menghalang slot availability bertindih
- RLS untuk aplikasi, dokumen private, kadar, kategori dan audit tindakan

## Project Structure

```txt
src/app
src/components/auth
src/components/dashboards
src/components/marketplace
src/components/pwa
src/components/shared
src/components/tutor-onboarding
src/components/admin
src/components/ui
src/lib/i18n
src/lib/tutor-onboarding
src/lib
supabase/migrations
supabase/seed.sql
docs/architecture.md
docs/milestone-1-audit.md
docs/tutor-onboarding.md
docs/tutor-verification-workflow.md
docs/storage-security.md
docs/status-transitions.md
```

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Bilingual Text

New Milestone 2 text is centralized in:

- `messages/ms.json`
- `messages/en.json`

Language selection is stored in the `tutor2u_locale` cookie. Older Fasa 1 pages still contain hardcoded BM copy and should be migrated incrementally.

## Vercel Deployment

1. Push repository ke GitHub.
2. Import project di Vercel.
3. Set environment variables daripada `.env.example`.
4. Deploy.
5. Set `NEXT_PUBLIC_APP_URL` kepada production URL.

Payment gateway masih placeholder dalam Fasa 1, tetapi jadual `payments` dan `tutor_payouts` sudah bersedia untuk integrasi provider sebenar.

Tutor onboarding and admin verification are implemented as local demo flows with production-oriented database/RLS architecture. Live persistence requires wiring the new routes to Supabase server actions and Storage signed URL APIs.
