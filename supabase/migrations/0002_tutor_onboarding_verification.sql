create extension if not exists "pgcrypto";

alter type public.verification_status add value if not exists 'under_review';
alter type public.verification_status add value if not exists 'changes_requested';
alter type public.verification_status add value if not exists 'resubmitted';

do $$ begin
  create type public.tutor_application_status as enum (
    'draft',
    'submitted',
    'under_review',
    'changes_requested',
    'resubmitted',
    'approved',
    'rejected',
    'suspended'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.tutor_applications (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  status public.tutor_application_status not null default 'draft',
  completion_percent int not null default 0 check (completion_percent between 0 and 100),
  personal_information jsonb not null default '{}',
  identity_private jsonb not null default '{}',
  teaching_experience jsonb not null default '{}',
  selections jsonb not null default '{}',
  declarations jsonb not null default '{}',
  missing_items jsonb not null default '[]',
  correction_notes jsonb not null default '[]',
  admin_notes jsonb not null default '[]',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists tutor_applications_one_active_per_tutor
on public.tutor_applications (tutor_profile_id)
where deleted_at is null and status not in ('rejected', 'suspended');

create index if not exists idx_tutor_applications_status on public.tutor_applications(status, submitted_at desc);
create index if not exists idx_tutor_applications_tutor on public.tutor_applications(tutor_profile_id, status);

alter table public.tutor_documents add column if not exists application_id uuid references public.tutor_applications(id) on delete cascade;
alter table public.tutor_documents add column if not exists bucket_id text not null default 'tutor-documents';
alter table public.tutor_documents add column if not exists document_scope text not null default 'qualification';
alter table public.tutor_documents add column if not exists private boolean not null default true;
alter table public.tutor_documents add column if not exists file_size_bytes bigint;
alter table public.tutor_documents add column if not exists mime_type text;
alter table public.tutor_documents add column if not exists signed_url_requested_at timestamptz;

alter table public.tutor_qualifications add column if not exists application_id uuid references public.tutor_applications(id) on delete cascade;
alter table public.tutor_qualifications add column if not exists qualification_level text;
alter table public.tutor_qualifications add column if not exists field_of_study text;
alter table public.tutor_qualifications add column if not exists certificate_document_id uuid references public.tutor_documents(id) on delete set null;
alter table public.tutor_qualifications add column if not exists verification_status public.verification_status not null default 'submitted';
alter table public.tutor_qualifications add column if not exists admin_notes text;
alter table public.tutor_qualifications add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.tutor_qualifications add column if not exists reviewed_at timestamptz;

create table if not exists public.tutor_experiences (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  application_id uuid references public.tutor_applications(id) on delete cascade,
  total_years int not null default 0 check (total_years >= 0),
  current_occupation text not null,
  is_school_teacher boolean not null default false,
  teaching_institution text,
  experience_bio text not null,
  student_levels_taught text[] not null default '{}',
  teaching_languages text[] not null default '{}',
  special_expertise text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tutor_education_levels (
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  education_level_id uuid not null references public.education_levels(id) on delete restrict,
  application_id uuid references public.tutor_applications(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tutor_profile_id, education_level_id)
);

create table if not exists public.tutor_curriculums (
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  curriculum_id uuid not null references public.curriculums(id) on delete restrict,
  application_id uuid references public.tutor_applications(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tutor_profile_id, curriculum_id)
);

create table if not exists public.tutor_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.tutor_profile_categories (
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  tutor_category_id uuid not null references public.tutor_categories(id) on delete restrict,
  application_id uuid references public.tutor_applications(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tutor_profile_id, tutor_category_id)
);

create table if not exists public.tutor_rates (
  id uuid primary key default gen_random_uuid(),
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  application_id uuid references public.tutor_applications(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete restrict,
  education_level_id uuid references public.education_levels(id) on delete restrict,
  mode public.class_mode not null,
  duration_minutes int not null check (duration_minutes > 0),
  group_type text not null check (group_type in ('individual', 'group')),
  session_type text not null check (session_type in ('trial', 'standard')),
  amount_cents int not null check (amount_cents > 0),
  currency text not null default 'MYR',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.tutor_service_areas add column if not exists application_id uuid references public.tutor_applications(id) on delete cascade;
alter table public.tutor_service_areas add column if not exists postcode text;
alter table public.tutor_service_areas add column if not exists travel_fee_cents int not null default 0 check (travel_fee_cents >= 0);
alter table public.tutor_service_areas add column if not exists accepts_student_home boolean not null default true;
alter table public.tutor_service_areas add column if not exists accepts_tutor_location boolean not null default false;
alter table public.tutor_service_areas add column if not exists accepts_public_location boolean not null default false;
alter table public.tutor_service_areas add column if not exists latitude numeric(9,6);
alter table public.tutor_service_areas add column if not exists longitude numeric(9,6);
alter table public.tutor_service_areas add column if not exists deleted_at timestamptz;

alter table public.tutor_availability add column if not exists application_id uuid references public.tutor_applications(id) on delete cascade;
alter table public.tutor_availability add column if not exists timezone text not null default 'Asia/Kuala_Lumpur';
alter table public.tutor_availability add column if not exists active boolean not null default true;
alter table public.tutor_availability add column if not exists deleted_at timestamptz;

create table if not exists public.tutor_verification_actions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.tutor_applications(id) on delete cascade,
  tutor_profile_id uuid not null references public.tutor_profiles(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_role public.user_role not null,
  action text not null,
  old_status public.tutor_application_status,
  new_status public.tutor_application_status,
  reason text,
  internal_metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_tutor_verification_actions_application
on public.tutor_verification_actions(application_id, created_at desc);

alter table public.audit_logs add column if not exists actor_role public.user_role;
alter table public.audit_logs add column if not exists old_value jsonb;
alter table public.audit_logs add column if not exists new_value jsonb;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tutor_applications_touch_updated_at on public.tutor_applications;
create trigger tutor_applications_touch_updated_at
before update on public.tutor_applications
for each row execute function public.touch_updated_at();

drop trigger if exists tutor_experiences_touch_updated_at on public.tutor_experiences;
create trigger tutor_experiences_touch_updated_at
before update on public.tutor_experiences
for each row execute function public.touch_updated_at();

drop trigger if exists tutor_rates_touch_updated_at on public.tutor_rates;
create trigger tutor_rates_touch_updated_at
before update on public.tutor_rates
for each row execute function public.touch_updated_at();

create or replace function public.tutor_application_transition_allowed(
  old_status public.tutor_application_status,
  new_status public.tutor_application_status
)
returns boolean
language sql
stable
as $$
  select case
    when old_status = new_status then true
    when old_status = 'draft' and new_status = 'submitted' then true
    when old_status = 'submitted' and new_status = 'under_review' then true
    when old_status = 'under_review' and new_status in ('changes_requested', 'approved', 'rejected') then true
    when old_status = 'changes_requested' and new_status = 'resubmitted' then true
    when old_status = 'resubmitted' and new_status = 'under_review' then true
    when old_status = 'approved' and new_status = 'suspended' then true
    else false
  end;
$$;

create or replace function public.enforce_tutor_application_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_profile_id uuid;
  current_role public.user_role;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft' and not public.is_admin() then
      raise exception 'Tutor applications must start as draft';
    end if;
    return new;
  end if;

  if old.status is distinct from new.status then
    if not public.tutor_application_transition_allowed(old.status, new.status) then
      raise exception 'Invalid tutor application status transition: % -> %', old.status, new.status;
    end if;

    select tp.profile_id into owner_profile_id
    from public.tutor_profiles tp
    where tp.id = new.tutor_profile_id;

    select p.role into current_role
    from public.profiles p
    where p.id = auth.uid();

    if current_role = 'tutor' then
      if owner_profile_id is distinct from auth.uid() then
        raise exception 'Tutor cannot update another tutor application';
      end if;

      if not ((old.status = 'draft' and new.status = 'submitted') or (old.status = 'changes_requested' and new.status = 'resubmitted')) then
        raise exception 'Tutor cannot perform this status transition';
      end if;

      if new.reviewed_by is distinct from old.reviewed_by
        or new.reviewed_at is distinct from old.reviewed_at
        or new.approved_at is distinct from old.approved_at
        or new.admin_notes is distinct from old.admin_notes then
        raise exception 'Tutor cannot change verification fields';
      end if;
    elsif current_role = 'admin' then
      if owner_profile_id = auth.uid() then
        raise exception 'Admin cannot approve or review their own tutor application';
      end if;
    elsif auth.uid() is not null then
      raise exception 'Only tutors and admins can transition tutor applications';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_tutor_application_transition on public.tutor_applications;
create trigger enforce_tutor_application_transition
before insert or update on public.tutor_applications
for each row execute function public.enforce_tutor_application_transition();

create or replace function public.audit_tutor_application_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role public.user_role;
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    select p.role into current_role
    from public.profiles p
    where p.id = auth.uid();

    insert into public.tutor_verification_actions (
      application_id,
      tutor_profile_id,
      actor_profile_id,
      actor_role,
      action,
      old_status,
      new_status,
      internal_metadata
    )
    values (
      new.id,
      new.tutor_profile_id,
      auth.uid(),
      coalesce(current_role, 'admin'),
      'status_changed',
      old.status,
      new.status,
      jsonb_build_object('source', 'database_trigger')
    );

    insert into public.audit_logs (
      actor_profile_id,
      actor_role,
      action,
      entity_table,
      entity_id,
      old_value,
      new_value,
      metadata
    )
    values (
      auth.uid(),
      current_role,
      'tutor_application_status_changed',
      'tutor_applications',
      new.id,
      jsonb_build_object('status', old.status),
      jsonb_build_object('status', new.status),
      jsonb_build_object('tutor_profile_id', new.tutor_profile_id)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists audit_tutor_application_status on public.tutor_applications;
create trigger audit_tutor_application_status
after update on public.tutor_applications
for each row execute function public.audit_tutor_application_status();

create or replace function public.prevent_tutor_availability_overlap()
returns trigger
language plpgsql
as $$
begin
  if new.deleted_at is null and new.active = true and new.day_of_week is not null and new.status <> 'unavailable' then
    if exists (
      select 1
      from public.tutor_availability existing
      where existing.tutor_profile_id = new.tutor_profile_id
        and existing.id <> coalesce(new.id, gen_random_uuid())
        and existing.deleted_at is null
        and existing.active = true
        and existing.day_of_week = new.day_of_week
        and existing.status <> 'unavailable'
        and existing.starts_at < new.ends_at
        and new.starts_at < existing.ends_at
    ) then
      raise exception 'Tutor availability slots cannot overlap';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_tutor_availability_overlap on public.tutor_availability;
create trigger prevent_tutor_availability_overlap
before insert or update on public.tutor_availability
for each row execute function public.prevent_tutor_availability_overlap();

alter table public.tutor_applications enable row level security;
alter table public.tutor_experiences enable row level security;
alter table public.tutor_education_levels enable row level security;
alter table public.tutor_curriculums enable row level security;
alter table public.tutor_categories enable row level security;
alter table public.tutor_profile_categories enable row level security;
alter table public.tutor_rates enable row level security;
alter table public.tutor_verification_actions enable row level security;

drop policy if exists "tutor_applications_owner_admin_read" on public.tutor_applications;
create policy "tutor_applications_owner_admin_read" on public.tutor_applications
for select using (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "tutor_applications_owner_insert_draft" on public.tutor_applications;
create policy "tutor_applications_owner_insert_draft" on public.tutor_applications
for insert with check ((public.is_tutor_profile(tutor_profile_id) and status = 'draft') or public.is_admin());

drop policy if exists "tutor_applications_owner_update_limited" on public.tutor_applications;
create policy "tutor_applications_owner_update_limited" on public.tutor_applications
for update using (
  public.is_admin()
  or (public.is_tutor_profile(tutor_profile_id) and status in ('draft', 'changes_requested'))
) with check (
  public.is_admin()
  or (public.is_tutor_profile(tutor_profile_id) and status in ('draft', 'submitted', 'changes_requested', 'resubmitted'))
);

drop policy if exists "tutor_experiences_owner_admin" on public.tutor_experiences;
create policy "tutor_experiences_owner_admin" on public.tutor_experiences
for all using (public.is_tutor_profile(tutor_profile_id) or public.is_admin())
with check (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "tutor_education_levels_owner_admin" on public.tutor_education_levels;
create policy "tutor_education_levels_owner_admin" on public.tutor_education_levels
for all using (public.is_tutor_profile(tutor_profile_id) or public.is_admin())
with check (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "tutor_curriculums_owner_admin" on public.tutor_curriculums;
create policy "tutor_curriculums_owner_admin" on public.tutor_curriculums
for all using (public.is_tutor_profile(tutor_profile_id) or public.is_admin())
with check (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "tutor_categories_public_read" on public.tutor_categories;
create policy "tutor_categories_public_read" on public.tutor_categories for select using (true);
drop policy if exists "tutor_categories_admin_write" on public.tutor_categories;
create policy "tutor_categories_admin_write" on public.tutor_categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "tutor_profile_categories_owner_admin" on public.tutor_profile_categories;
create policy "tutor_profile_categories_owner_admin" on public.tutor_profile_categories
for all using (public.is_tutor_profile(tutor_profile_id) or public.is_admin())
with check (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "tutor_rates_owner_admin_read_public_approved" on public.tutor_rates;
create policy "tutor_rates_owner_admin_read_public_approved" on public.tutor_rates
for select using (
  public.is_admin()
  or public.is_tutor_profile(tutor_profile_id)
  or exists (
    select 1 from public.tutor_profiles tp
    where tp.id = tutor_profile_id and tp.verification_status = 'approved'
  )
);

drop policy if exists "tutor_rates_owner_admin_write" on public.tutor_rates;
create policy "tutor_rates_owner_admin_write" on public.tutor_rates
for all using (public.is_tutor_profile(tutor_profile_id) or public.is_admin())
with check (public.is_tutor_profile(tutor_profile_id) or public.is_admin());

drop policy if exists "tutor_verification_actions_admin_read_owner_read" on public.tutor_verification_actions;
create policy "tutor_verification_actions_admin_read_owner_read" on public.tutor_verification_actions
for select using (public.is_admin() or public.is_tutor_profile(tutor_profile_id));

drop policy if exists "tutor_verification_actions_admin_insert" on public.tutor_verification_actions;
create policy "tutor_verification_actions_admin_insert" on public.tutor_verification_actions
for insert with check (public.is_admin());

create or replace view public.approved_tutor_public_profiles as
select
  tp.id as tutor_profile_id,
  p.full_name as display_name,
  tp.professional_title,
  tp.bio,
  tp.base_state,
  tp.base_district,
  tp.profile_photo_url,
  tp.approved_at
from public.tutor_profiles tp
join public.profiles p on p.id = tp.profile_id
where tp.verification_status = 'approved';

do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public)
    values
      ('tutor-identity-documents', 'tutor-identity-documents', false),
      ('tutor-qualification-documents', 'tutor-qualification-documents', false),
      ('tutor-profile-images', 'tutor-profile-images', true)
    on conflict (id) do nothing;

    drop policy if exists "tutor_identity_documents_private_read" on storage.objects;
    create policy "tutor_identity_documents_private_read" on storage.objects
    for select using (
      bucket_id = 'tutor-identity-documents'
      and (
        public.is_admin()
        or exists (
          select 1
          from public.tutor_documents td
          join public.tutor_profiles tp on tp.id = td.tutor_profile_id
          where td.bucket_id = storage.objects.bucket_id
            and td.file_path = storage.objects.name
            and tp.profile_id = auth.uid()
        )
      )
    );

    drop policy if exists "tutor_qualification_documents_private_read" on storage.objects;
    create policy "tutor_qualification_documents_private_read" on storage.objects
    for select using (
      bucket_id = 'tutor-qualification-documents'
      and (
        public.is_admin()
        or exists (
          select 1
          from public.tutor_documents td
          join public.tutor_profiles tp on tp.id = td.tutor_profile_id
          where td.bucket_id = storage.objects.bucket_id
            and td.file_path = storage.objects.name
            and tp.profile_id = auth.uid()
        )
      )
    );

    drop policy if exists "tutor_private_documents_owner_upload" on storage.objects;
    create policy "tutor_private_documents_owner_upload" on storage.objects
    for insert with check (
      bucket_id in ('tutor-identity-documents', 'tutor-qualification-documents')
      and auth.uid()::text = (storage.foldername(name))[1]
    );

    drop policy if exists "tutor_profile_images_public_read" on storage.objects;
    create policy "tutor_profile_images_public_read" on storage.objects
    for select using (bucket_id = 'tutor-profile-images');

    drop policy if exists "tutor_profile_images_owner_upload" on storage.objects;
    create policy "tutor_profile_images_owner_upload" on storage.objects
    for insert with check (
      bucket_id = 'tutor-profile-images'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;
end $$;
