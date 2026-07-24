create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('parent', 'tutor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_status as enum ('draft', 'submitted', 'approved', 'rejected', 'correction_required', 'suspended', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.class_mode as enum ('online', 'physical', 'hybrid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.slot_status as enum ('available', 'temporarily_held', 'booked', 'unavailable');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum ('pending_payment', 'pending_tutor_confirmation', 'confirmed', 'in_progress', 'completed', 'cancelled', 'reschedule_requested', 'replacement_required');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.session_status as enum ('temporarily_held', 'booked', 'confirmed', 'in_progress', 'completed', 'cancelled', 'reschedule_requested', 'replacement_required');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payout_status as enum ('pending', 'processing', 'paid', 'held', 'failed');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  locale text not null default 'ms',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parent_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  address text,
  state text,
  district text,
  preferred_contact text not null default 'whatsapp',
  emergency_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.curriculums (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.education_levels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid not null references public.parent_profiles(id) on delete cascade,
  full_name text not null,
  birth_year int,
  education_level_id uuid references public.education_levels(id),
  curriculum_id uuid references public.curriculums(id),
  school_name text,
  learning_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tutor_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  verification_status public.verification_status not null default 'draft',
  professional_title text not null,
  bio text,
  gender text,
  teaching_experience_years int not null default 0,
  highest_qualification text,
  hourly_rate_cents int not null default 0 check (hourly_rate_cents >= 0),
  response_minutes int not null default 1440,
  completion_rate numeric(5,2) not null default 0,
  cancellation_rate numeric(5,2) not null default 0,
  can_teach_online boolean not null default true,
  can_teach_physical boolean not null default false,
  base_state text,
  base_district text,
  profile_photo_url text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tutor_documents (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  document_type text not null,
  file_path text not null,
  status public.verification_status not null default 'submitted',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.tutor_qualifications (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  qualification_type text not null,
  institution text not null,
  title text not null,
  year_awarded int,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tutor_subjects (
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  education_level_id uuid not null references public.education_levels(id) on delete restrict,
  curriculum_id uuid references public.curriculums(id) on delete restrict,
  years_experience int not null default 0,
  primary key (tutor_profile_id, subject_id, education_level_id)
);

create table if not exists public.tutor_service_areas (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  state text not null,
  district text not null,
  radius_km int not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists public.tutor_availability (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  availability_date date,
  day_of_week int check (day_of_week between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  mode public.class_mode not null default 'online',
  status public.slot_status not null default 'available',
  created_at timestamptz not null default now(),
  constraint tutor_availability_time_check check (starts_at < ends_at)
);

create table if not exists public.tutor_badges (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  badge_name text not null,
  awarded_at timestamptz not null default now(),
  unique (tutor_profile_id, badge_name)
);

create table if not exists public.tutor_scores (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null unique references public.tutor_profiles(id) on delete cascade,
  professional_score int not null check (professional_score between 0 and 100),
  academic_qualification_score int not null default 0 check (academic_qualification_score between 0 and 100),
  teaching_experience_score int not null default 0 check (teaching_experience_score between 0 and 100),
  completed_classes_score int not null default 0 check (completed_classes_score between 0 and 100),
  punctuality_score int not null default 0 check (punctuality_score between 0 and 100),
  response_score int not null default 0 check (response_score between 0 and 100),
  student_outcome_score int not null default 0 check (student_outcome_score between 0 and 100),
  discipline_score int not null default 100 check (discipline_score between 0 and 100),
  customer_rating numeric(3,2) not null default 0 check (customer_rating between 0 and 5),
  review_count int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.favourite_tutors (
  parent_profile_id uuid not null references public.parent_profiles(id) on delete cascade,
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_profile_id, tutor_profile_id)
);

create table if not exists public.tutor_comparisons (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid not null references public.parent_profiles(id) on delete cascade,
  name text not null default 'Senarai perbandingan',
  tutor_profile_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint tutor_comparisons_max_three check (array_length(tutor_profile_ids, 1) is null or array_length(tutor_profile_ids, 1) <= 3)
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject_id uuid references public.subjects(id),
  education_level_id uuid references public.education_levels(id),
  tutor_profile_id uuid references public.tutor_profiles(id) on delete set null,
  session_count int not null check (session_count > 0),
  duration_minutes int not null default 90,
  price_cents int not null check (price_cents >= 0),
  is_trial boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid not null references public.parent_profiles(id) on delete restrict,
  student_profile_id uuid not null references public.student_profiles(id) on delete restrict,
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  package_id uuid references public.packages(id) on delete set null,
  mode public.class_mode not null,
  learning_objective text not null,
  status public.booking_status not null default 'pending_payment',
  payment_status public.payment_status not null default 'pending',
  total_cents int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_sessions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete restrict,
  student_profile_id uuid not null references public.student_profiles(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  mode public.class_mode not null,
  status public.session_status not null default 'booked',
  attendance_pin text,
  replacement_tutor_profile_id uuid references public.tutor_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_sessions_time_check check (starts_at < ends_at)
);

create unique index if not exists booking_sessions_no_double_booking
on public.booking_sessions (tutor_profile_id, starts_at, ends_at)
where status in ('temporarily_held', 'booked', 'confirmed', 'in_progress');

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  booking_session_id uuid not null unique references public.booking_sessions(id) on delete cascade,
  student_present boolean not null default false,
  tutor_present boolean not null default false,
  confirmed_by_parent_at timestamptz,
  confirmed_by_tutor_at timestamptz,
  pin_verified boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.curriculum_topics (
  id uuid primary key default gen_random_uuid(),
  curriculum_id uuid not null references public.curriculums(id) on delete cascade,
  education_level_id uuid not null references public.education_levels(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  chapter text not null,
  topic text not null,
  skill text,
  content_standard text,
  learning_standard text,
  sort_order int not null default 0
);

create table if not exists public.student_topic_progress (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles(id) on delete cascade,
  curriculum_topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  mastery_level int not null default 1 check (mastery_level between 1 and 6),
  confidence_note text,
  updated_by_tutor_profile_id uuid references public.tutor_profiles(id),
  updated_at timestamptz not null default now(),
  unique (student_profile_id, curriculum_topic_id)
);

create table if not exists public.progress_reports (
  id uuid primary key default gen_random_uuid(),
  booking_session_id uuid not null unique references public.booking_sessions(id) on delete cascade,
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete restrict,
  student_profile_id uuid not null references public.student_profiles(id) on delete restrict,
  topics_covered text[] not null default '{}',
  skills_practiced text[] not null default '{}',
  mastery_level int not null check (mastery_level between 1 and 6),
  homework text,
  strengths text,
  weaknesses text,
  tutor_recommendation text,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete restrict,
  student_profile_id uuid not null references public.student_profiles(id) on delete restrict,
  title text not null,
  instructions text not null,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles(id) on delete cascade,
  submitted_at timestamptz,
  status text not null default 'assigned',
  file_url text,
  score numeric(5,2),
  feedback text,
  unique (assignment_id, student_profile_id)
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid references public.tutor_profiles(id) on delete set null,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  education_level_id uuid not null references public.education_levels(id) on delete restrict,
  title text not null,
  assessment_type text not null default 'diagnostic',
  max_score numeric(6,2) not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  score numeric(6,2) not null,
  taken_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_session_id uuid not null unique references public.booking_sessions(id) on delete cascade,
  parent_profile_id uuid not null references public.parent_profiles(id) on delete cascade,
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  rating numeric(2,1) not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.review_criteria_scores (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  criteria text not null,
  score int not null check (score between 1 and 5),
  unique (review_id, criteria)
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid references public.parent_profiles(id) on delete set null,
  tutor_profile_id uuid references public.tutor_profiles(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  category text not null,
  description text not null,
  status text not null default 'active',
  requested_resolution text,
  assigned_admin_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  parent_profile_id uuid not null references public.parent_profiles(id) on delete restrict,
  amount_cents int not null check (amount_cents >= 0),
  platform_fee_cents int not null default 0,
  provider text not null default 'placeholder',
  provider_reference text,
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tutor_payouts (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete set null,
  gross_cents int not null default 0,
  commission_cents int not null default 0,
  net_cents int not null default 0,
  status public.payout_status not null default 'pending',
  scheduled_for date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_tutor_profiles_status on public.tutor_profiles(verification_status);
create index if not exists idx_tutor_service_areas_state_district on public.tutor_service_areas(state, district);
create index if not exists idx_tutor_scores_professional on public.tutor_scores(professional_score desc, customer_rating desc);
create index if not exists idx_bookings_parent on public.bookings(parent_profile_id, status);
create index if not exists idx_bookings_tutor on public.bookings(tutor_profile_id, status);
create index if not exists idx_booking_sessions_tutor_time on public.booking_sessions(tutor_profile_id, starts_at);
create index if not exists idx_progress_reports_student on public.progress_reports(student_profile_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_parent_profile(parent_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.parent_profiles
    where id = parent_id and profile_id = auth.uid()
  );
$$;

create or replace function public.is_tutor_profile(tutor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tutor_profiles
    where id = tutor_id and profile_id = auth.uid()
  );
$$;

create or replace function public.parent_owns_student(student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.student_profiles sp
    join public.parent_profiles pp on pp.id = sp.parent_profile_id
    where sp.id = student_id and pp.profile_id = auth.uid()
  );
$$;

create or replace function public.tutor_teaches_student(student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.bookings b
    join public.tutor_profiles tp on tp.id = b.tutor_profile_id
    where b.student_profile_id = student_id
      and tp.profile_id = auth.uid()
      and b.status in ('confirmed', 'in_progress', 'completed')
  );
$$;

alter table public.profiles enable row level security;
alter table public.parent_profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.tutor_profiles enable row level security;
alter table public.tutor_documents enable row level security;
alter table public.tutor_qualifications enable row level security;
alter table public.subjects enable row level security;
alter table public.education_levels enable row level security;
alter table public.curriculums enable row level security;
alter table public.tutor_subjects enable row level security;
alter table public.tutor_service_areas enable row level security;
alter table public.tutor_availability enable row level security;
alter table public.tutor_badges enable row level security;
alter table public.tutor_scores enable row level security;
alter table public.favourite_tutors enable row level security;
alter table public.tutor_comparisons enable row level security;
alter table public.packages enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.progress_reports enable row level security;
alter table public.curriculum_topics enable row level security;
alter table public.student_topic_progress enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_results enable row level security;
alter table public.reviews enable row level security;
alter table public.review_criteria_scores enable row level security;
alter table public.complaints enable row level security;
alter table public.payments enable row level security;
alter table public.tutor_payouts enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
for update using (id = auth.uid() or public.is_admin());

drop policy if exists "parent_profiles_owner_or_admin" on public.parent_profiles;
create policy "parent_profiles_owner_or_admin" on public.parent_profiles
for all using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

drop policy if exists "student_profiles_parent_tutor_admin" on public.student_profiles;
create policy "student_profiles_parent_tutor_admin" on public.student_profiles
for select using (
  public.is_parent_profile(parent_profile_id)
  or public.tutor_teaches_student(id)
  or public.is_admin()
);

drop policy if exists "student_profiles_parent_write" on public.student_profiles;
create policy "student_profiles_parent_write" on public.student_profiles
for all using (public.is_parent_profile(parent_profile_id) or public.is_admin())
with check (public.is_parent_profile(parent_profile_id) or public.is_admin());

drop policy if exists "tutor_profiles_marketplace_read" on public.tutor_profiles;
create policy "tutor_profiles_marketplace_read" on public.tutor_profiles
for select using (
  verification_status = 'approved'
  or public.is_tutor_profile(id)
  or public.is_admin()
);

drop policy if exists "tutor_profiles_owner_or_admin_write" on public.tutor_profiles;
create policy "tutor_profiles_owner_or_admin_write" on public.tutor_profiles
for all using (public.is_tutor_profile(id) or public.is_admin())
with check (public.is_tutor_profile(id) or public.is_admin());

drop policy if exists "tutor_documents_private" on public.tutor_documents;
create policy "tutor_documents_private" on public.tutor_documents
for all using (public.is_tutor_profile(tutor_profile_id) or public.is_admin())
with check (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "taxonomy_public_read" on public.subjects;
create policy "taxonomy_public_read" on public.subjects for select using (true);
drop policy if exists "taxonomy_admin_write" on public.subjects;
create policy "taxonomy_admin_write" on public.subjects for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "levels_public_read" on public.education_levels;
create policy "levels_public_read" on public.education_levels for select using (true);
drop policy if exists "levels_admin_write" on public.education_levels;
create policy "levels_admin_write" on public.education_levels for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "curriculums_public_read" on public.curriculums;
create policy "curriculums_public_read" on public.curriculums for select using (true);
drop policy if exists "curriculums_admin_write" on public.curriculums;
create policy "curriculums_admin_write" on public.curriculums for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "tutor_public_profile_parts_read" on public.tutor_subjects;
create policy "tutor_public_profile_parts_read" on public.tutor_subjects for select using (true);
drop policy if exists "tutor_subject_owner_admin_write" on public.tutor_subjects;
create policy "tutor_subject_owner_admin_write" on public.tutor_subjects for all using (public.is_tutor_profile(tutor_profile_id) or public.is_admin()) with check (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "service_areas_public_read" on public.tutor_service_areas;
create policy "service_areas_public_read" on public.tutor_service_areas for select using (true);
drop policy if exists "service_areas_owner_admin_write" on public.tutor_service_areas;
create policy "service_areas_owner_admin_write" on public.tutor_service_areas for all using (public.is_tutor_profile(tutor_profile_id) or public.is_admin()) with check (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "availability_public_read" on public.tutor_availability;
create policy "availability_public_read" on public.tutor_availability for select using (true);
drop policy if exists "availability_owner_admin_write" on public.tutor_availability;
create policy "availability_owner_admin_write" on public.tutor_availability for all using (public.is_tutor_profile(tutor_profile_id) or public.is_admin()) with check (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "tutor_quality_public_read" on public.tutor_badges;
create policy "tutor_quality_public_read" on public.tutor_badges for select using (true);
drop policy if exists "tutor_scores_public_read" on public.tutor_scores;
create policy "tutor_scores_public_read" on public.tutor_scores for select using (true);

drop policy if exists "favourites_parent_only" on public.favourite_tutors;
create policy "favourites_parent_only" on public.favourite_tutors
for all using (public.is_parent_profile(parent_profile_id) or public.is_admin())
with check (public.is_parent_profile(parent_profile_id) or public.is_admin());

drop policy if exists "comparisons_parent_only" on public.tutor_comparisons;
create policy "comparisons_parent_only" on public.tutor_comparisons
for all using (public.is_parent_profile(parent_profile_id) or public.is_admin())
with check (public.is_parent_profile(parent_profile_id) or public.is_admin());

drop policy if exists "packages_public_read" on public.packages;
create policy "packages_public_read" on public.packages for select using (active = true or public.is_admin());
drop policy if exists "packages_admin_write" on public.packages;
create policy "packages_admin_write" on public.packages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "bookings_role_read" on public.bookings;
create policy "bookings_role_read" on public.bookings
for select using (
  public.is_parent_profile(parent_profile_id)
  or public.is_tutor_profile(tutor_profile_id)
  or public.is_admin()
);

drop policy if exists "bookings_parent_insert" on public.bookings;
create policy "bookings_parent_insert" on public.bookings
for insert with check (public.is_parent_profile(parent_profile_id) or public.is_admin());

drop policy if exists "bookings_role_update" on public.bookings;
create policy "bookings_role_update" on public.bookings
for update using (
  public.is_parent_profile(parent_profile_id)
  or public.is_tutor_profile(tutor_profile_id)
  or public.is_admin()
);

drop policy if exists "sessions_role_read" on public.booking_sessions;
create policy "sessions_role_read" on public.booking_sessions
for select using (
  public.parent_owns_student(student_profile_id)
  or public.is_tutor_profile(tutor_profile_id)
  or public.is_admin()
);

drop policy if exists "sessions_tutor_admin_write" on public.booking_sessions;
create policy "sessions_tutor_admin_write" on public.booking_sessions
for all using (public.is_tutor_profile(tutor_profile_id) or public.is_admin())
with check (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "attendance_role_access" on public.attendance;
create policy "attendance_role_access" on public.attendance
for all using (
  exists (
    select 1 from public.booking_sessions bs
    where bs.id = booking_session_id
      and (public.parent_owns_student(bs.student_profile_id) or public.is_tutor_profile(bs.tutor_profile_id) or public.is_admin())
  )
) with check (
  exists (
    select 1 from public.booking_sessions bs
    where bs.id = booking_session_id
      and (public.parent_owns_student(bs.student_profile_id) or public.is_tutor_profile(bs.tutor_profile_id) or public.is_admin())
  )
);

drop policy if exists "progress_role_read" on public.progress_reports;
create policy "progress_role_read" on public.progress_reports
for select using (
  public.parent_owns_student(student_profile_id)
  or public.is_tutor_profile(tutor_profile_id)
  or public.is_admin()
);

drop policy if exists "progress_tutor_admin_write" on public.progress_reports;
create policy "progress_tutor_admin_write" on public.progress_reports
for all using (public.is_tutor_profile(tutor_profile_id) or public.is_admin())
with check (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "curriculum_topics_read" on public.curriculum_topics;
create policy "curriculum_topics_read" on public.curriculum_topics for select using (true);

drop policy if exists "student_topic_progress_role" on public.student_topic_progress;
create policy "student_topic_progress_role" on public.student_topic_progress
for all using (
  public.parent_owns_student(student_profile_id)
  or public.tutor_teaches_student(student_profile_id)
  or public.is_admin()
) with check (
  public.parent_owns_student(student_profile_id)
  or public.tutor_teaches_student(student_profile_id)
  or public.is_admin()
);

drop policy if exists "assignments_role_access" on public.assignments;
create policy "assignments_role_access" on public.assignments
for all using (
  public.parent_owns_student(student_profile_id)
  or public.is_tutor_profile(tutor_profile_id)
  or public.is_admin()
) with check (
  public.parent_owns_student(student_profile_id)
  or public.is_tutor_profile(tutor_profile_id)
  or public.is_admin()
);

drop policy if exists "assignment_submissions_role_access" on public.assignment_submissions;
create policy "assignment_submissions_role_access" on public.assignment_submissions
for all using (public.parent_owns_student(student_profile_id) or public.tutor_teaches_student(student_profile_id) or public.is_admin())
with check (public.parent_owns_student(student_profile_id) or public.tutor_teaches_student(student_profile_id) or public.is_admin());

drop policy if exists "assessments_public_read" on public.assessments;
create policy "assessments_public_read" on public.assessments for select using (true);
drop policy if exists "assessment_results_role_access" on public.assessment_results;
create policy "assessment_results_role_access" on public.assessment_results
for all using (public.parent_owns_student(student_profile_id) or public.tutor_teaches_student(student_profile_id) or public.is_admin())
with check (public.parent_owns_student(student_profile_id) or public.tutor_teaches_student(student_profile_id) or public.is_admin());

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (true);

drop policy if exists "reviews_verified_completed_insert" on public.reviews;
create policy "reviews_verified_completed_insert" on public.reviews
for insert with check (
  public.is_parent_profile(parent_profile_id)
  and exists (
    select 1
    from public.booking_sessions bs
    join public.bookings b on b.id = bs.booking_id
    where bs.id = public.reviews.booking_session_id
      and bs.status = 'completed'
      and b.parent_profile_id = public.reviews.parent_profile_id
      and b.tutor_profile_id = public.reviews.tutor_profile_id
  )
);

drop policy if exists "review_scores_public_read" on public.review_criteria_scores;
create policy "review_scores_public_read" on public.review_criteria_scores for select using (true);
drop policy if exists "review_scores_parent_insert" on public.review_criteria_scores;
create policy "review_scores_parent_insert" on public.review_criteria_scores
for insert with check (
  exists (
    select 1 from public.reviews r
    where r.id = review_id and public.is_parent_profile(r.parent_profile_id)
  )
);

drop policy if exists "complaints_role_access" on public.complaints;
create policy "complaints_role_access" on public.complaints
for all using (
  (parent_profile_id is not null and public.is_parent_profile(parent_profile_id))
  or (tutor_profile_id is not null and public.is_tutor_profile(tutor_profile_id))
  or public.is_admin()
) with check (
  (parent_profile_id is not null and public.is_parent_profile(parent_profile_id))
  or (tutor_profile_id is not null and public.is_tutor_profile(tutor_profile_id))
  or public.is_admin()
);

drop policy if exists "payments_parent_admin" on public.payments;
create policy "payments_parent_admin" on public.payments
for select using (public.is_parent_profile(parent_profile_id) or public.is_admin());

drop policy if exists "payouts_tutor_admin" on public.tutor_payouts;
create policy "payouts_tutor_admin" on public.tutor_payouts
for select using (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "notifications_owner" on public.notifications;
create policy "notifications_owner" on public.notifications
for all using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

drop policy if exists "audit_admin_read" on public.audit_logs;
create policy "audit_admin_read" on public.audit_logs for select using (public.is_admin());
drop policy if exists "audit_admin_write" on public.audit_logs;
create policy "audit_admin_write" on public.audit_logs for insert with check (public.is_admin());

do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public)
    values ('tutor-documents', 'tutor-documents', false)
    on conflict (id) do nothing;

    drop policy if exists "tutor_documents_bucket_private" on storage.objects;
    create policy "tutor_documents_bucket_private" on storage.objects
    for select using (
      bucket_id = 'tutor-documents'
      and (
        public.is_admin()
        or exists (
          select 1
          from public.tutor_documents td
          join public.tutor_profiles tp on tp.id = td.tutor_profile_id
          where td.file_path = storage.objects.name and tp.profile_id = auth.uid()
        )
      )
    );
  end if;
end $$;
