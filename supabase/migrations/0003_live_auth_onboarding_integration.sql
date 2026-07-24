create extension if not exists "pgcrypto";

create or replace function public.normalize_public_signup_role(raw_role text)
returns public.user_role
language sql
immutable
as $$
  select case
    when raw_role = 'tutor' then 'tutor'::public.user_role
    else 'parent'::public.user_role
  end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requested_role public.user_role;
  requested_name text;
begin
  requested_role := public.normalize_public_signup_role(new.raw_user_meta_data ->> 'role');
  requested_name := coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1), 'Tutor2U user');

  insert into public.profiles (id, role, full_name, email, locale)
  values (new.id, requested_role, requested_name, new.email, 'ms')
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
    updated_at = now();

  if requested_role = 'parent' then
    insert into public.parent_profiles (profile_id)
    values (new.id)
    on conflict (profile_id) do nothing;
  elsif requested_role = 'tutor' then
    insert into public.tutor_profiles (
      profile_id,
      verification_status,
      professional_title,
      bio,
      hourly_rate_cents
    )
    values (
      new.id,
      'draft',
      requested_name,
      '',
      0
    )
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_profile_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin() and new.role is distinct from old.role then
    raise exception 'Users cannot change their own Tutor2U role';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_self_escalation on public.profiles;
create trigger prevent_profile_role_self_escalation
before update on public.profiles
for each row execute function public.prevent_profile_role_self_escalation();

drop policy if exists "profiles_insert_self_non_admin" on public.profiles;
create policy "profiles_insert_self_non_admin" on public.profiles
for insert with check (
  id = auth.uid()
  and role in ('parent', 'tutor')
);

drop policy if exists "tutor_profiles_self_insert_draft" on public.tutor_profiles;
create policy "tutor_profiles_self_insert_draft" on public.tutor_profiles
for insert with check (
  profile_id = auth.uid()
  and verification_status = 'draft'
);

drop policy if exists "parent_profiles_self_insert" on public.parent_profiles;
create policy "parent_profiles_self_insert" on public.parent_profiles
for insert with check (profile_id = auth.uid());

drop policy if exists "tutor_subjects_safe_public_read" on public.tutor_subjects;
create policy "tutor_subjects_safe_public_read" on public.tutor_subjects
for select using (
  public.is_admin()
  or public.is_tutor_profile(tutor_profile_id)
  or exists (
    select 1 from public.tutor_profiles tp
    where tp.id = tutor_profile_id and tp.verification_status = 'approved'
  )
);

drop policy if exists "tutor_public_profile_parts_read" on public.tutor_subjects;

drop policy if exists "service_areas_safe_public_read" on public.tutor_service_areas;
create policy "service_areas_safe_public_read" on public.tutor_service_areas
for select using (
  public.is_admin()
  or public.is_tutor_profile(tutor_profile_id)
  or exists (
    select 1 from public.tutor_profiles tp
    where tp.id = tutor_profile_id and tp.verification_status = 'approved'
  )
);

drop policy if exists "service_areas_public_read" on public.tutor_service_areas;

drop policy if exists "availability_safe_public_read" on public.tutor_availability;
create policy "availability_safe_public_read" on public.tutor_availability
for select using (
  public.is_admin()
  or public.is_tutor_profile(tutor_profile_id)
  or exists (
    select 1 from public.tutor_profiles tp
    where tp.id = tutor_profile_id and tp.verification_status = 'approved'
  )
);

drop policy if exists "availability_public_read" on public.tutor_availability;

drop policy if exists "tutor_badges_safe_public_read" on public.tutor_badges;
create policy "tutor_badges_safe_public_read" on public.tutor_badges
for select using (
  public.is_admin()
  or public.is_tutor_profile(tutor_profile_id)
  or exists (
    select 1 from public.tutor_profiles tp
    where tp.id = tutor_profile_id and tp.verification_status = 'approved'
  )
);

drop policy if exists "tutor_quality_public_read" on public.tutor_badges;

drop policy if exists "tutor_scores_safe_public_read" on public.tutor_scores;
create policy "tutor_scores_safe_public_read" on public.tutor_scores
for select using (
  public.is_admin()
  or public.is_tutor_profile(tutor_profile_id)
  or exists (
    select 1 from public.tutor_profiles tp
    where tp.id = tutor_profile_id and tp.verification_status = 'approved'
  )
);

drop policy if exists "tutor_scores_public_read" on public.tutor_scores;

create or replace view public.approved_tutor_public_profiles as
select
  tp.id as tutor_profile_id,
  p.full_name as display_name,
  tp.professional_title,
  tp.bio,
  tp.gender,
  tp.teaching_experience_years,
  tp.hourly_rate_cents,
  tp.response_minutes,
  tp.completion_rate,
  tp.cancellation_rate,
  tp.can_teach_online,
  tp.can_teach_physical,
  tp.base_state,
  tp.base_district,
  tp.profile_photo_url,
  tp.approved_at,
  coalesce(ts.professional_score, 0) as professional_score,
  coalesce(ts.customer_rating, 0) as customer_rating,
  coalesce(ts.review_count, 0) as review_count,
  coalesce((
    select array_agg(distinct s.name order by s.name)
    from public.tutor_subjects tsub
    join public.subjects s on s.id = tsub.subject_id
    where tsub.tutor_profile_id = tp.id
  ), '{}'::text[]) as subjects,
  coalesce((
    select array_agg(distinct el.name order by el.name)
    from public.tutor_subjects tsub
    join public.education_levels el on el.id = tsub.education_level_id
    where tsub.tutor_profile_id = tp.id
  ), '{}'::text[]) as education_levels,
  coalesce((
    select array_agg(distinct c.name order by c.name)
    from public.tutor_subjects tsub
    join public.curriculums c on c.id = tsub.curriculum_id
    where tsub.tutor_profile_id = tp.id
  ), '{}'::text[]) as curriculums,
  coalesce((
    select array_agg(distinct tb.badge_name order by tb.badge_name)
    from public.tutor_badges tb
    where tb.tutor_profile_id = tp.id
  ), '{}'::text[]) as badges
from public.tutor_profiles tp
join public.profiles p on p.id = tp.profile_id
left join public.tutor_scores ts on ts.tutor_profile_id = tp.id
where tp.verification_status = 'approved';

grant usage on schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

grant select on
  public.subjects,
  public.education_levels,
  public.curriculums,
  public.packages,
  public.reviews,
  public.review_criteria_scores,
  public.approved_tutor_public_profiles
to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;

alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
grant select, insert, update, delete on tables to service_role;

do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    drop policy if exists "tutor_private_documents_owner_delete" on storage.objects;
    create policy "tutor_private_documents_owner_delete" on storage.objects
    for delete using (
      bucket_id in ('tutor-identity-documents', 'tutor-qualification-documents', 'tutor-profile-images')
      and auth.uid()::text = (storage.foldername(name))[1]
    );

    drop policy if exists "tutor_private_documents_owner_update" on storage.objects;
    create policy "tutor_private_documents_owner_update" on storage.objects
    for update using (
      bucket_id in ('tutor-identity-documents', 'tutor-qualification-documents', 'tutor-profile-images')
      and auth.uid()::text = (storage.foldername(name))[1]
    ) with check (
      bucket_id in ('tutor-identity-documents', 'tutor-qualification-documents', 'tutor-profile-images')
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;
end $$;
