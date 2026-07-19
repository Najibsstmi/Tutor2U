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

## Supabase Setup

1. Cipta projek Supabase.
2. Jalankan migration:

```bash
supabase db push
```

Atau jalankan SQL dalam `supabase/migrations/0001_initial_schema.sql` melalui SQL editor.

3. Jalankan seed data:

```bash
supabase db seed
```

Atau jalankan `supabase/seed.sql` melalui SQL editor.

4. Pastikan bucket `tutor-documents` wujud dan private. Migration akan cuba menciptanya jika schema Storage tersedia.

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

## Project Structure

```txt
src/app
src/components/auth
src/components/dashboards
src/components/marketplace
src/components/pwa
src/components/shared
src/components/ui
src/lib
supabase/migrations
supabase/seed.sql
docs/architecture.md
```

## Validation

```bash
npm run lint
npm run build
```

## Vercel Deployment

1. Push repository ke GitHub.
2. Import project di Vercel.
3. Set environment variables daripada `.env.example`.
4. Deploy.
5. Set `NEXT_PUBLIC_APP_URL` kepada production URL.

Payment gateway masih placeholder dalam Fasa 1, tetapi jadual `payments` dan `tutor_payouts` sudah bersedia untuk integrasi provider sebenar.
