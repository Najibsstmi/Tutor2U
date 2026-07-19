-- Demo password for every seeded account: Password123!
create extension if not exists "pgcrypto";

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'admin@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"admin"}', now(), now()),
  ('00000000-0000-4000-8000-000000000101', 'authenticated', 'authenticated', 'farah.parent@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"parent"}', now(), now()),
  ('00000000-0000-4000-8000-000000000102', 'authenticated', 'authenticated', 'danial.parent@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"parent"}', now(), now()),
  ('00000000-0000-4000-8000-000000000103', 'authenticated', 'authenticated', 'mei.parent@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"parent"}', now(), now()),
  ('00000000-0000-4000-8000-000000001001', 'authenticated', 'authenticated', 'aisyah.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now()),
  ('00000000-0000-4000-8000-000000001002', 'authenticated', 'authenticated', 'hafiz.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now()),
  ('00000000-0000-4000-8000-000000001003', 'authenticated', 'authenticated', 'sarah.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now()),
  ('00000000-0000-4000-8000-000000001004', 'authenticated', 'authenticated', 'kumar.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now()),
  ('00000000-0000-4000-8000-000000001005', 'authenticated', 'authenticated', 'nurul.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now()),
  ('00000000-0000-4000-8000-000000001006', 'authenticated', 'authenticated', 'amir.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now()),
  ('00000000-0000-4000-8000-000000001007', 'authenticated', 'authenticated', 'lina.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now()),
  ('00000000-0000-4000-8000-000000001008', 'authenticated', 'authenticated', 'azlan.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now()),
  ('00000000-0000-4000-8000-000000001009', 'authenticated', 'authenticated', 'priyaa.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now()),
  ('00000000-0000-4000-8000-000000001010', 'authenticated', 'authenticated', 'hakim.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now()),
  ('00000000-0000-4000-8000-000000001011', 'authenticated', 'authenticated', 'nadia.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now()),
  ('00000000-0000-4000-8000-000000001012', 'authenticated', 'authenticated', 'wei.tutor@tutor2u.test', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"tutor"}', now(), now())
on conflict (id) do update set email = excluded.email, updated_at = now();

insert into public.curriculums (id, name, description)
values
  ('60000000-0000-4000-8000-000000000001', 'KSSR', 'Kurikulum Standard Sekolah Rendah'),
  ('60000000-0000-4000-8000-000000000002', 'KSSM', 'Kurikulum Standard Sekolah Menengah'),
  ('60000000-0000-4000-8000-000000000003', 'IGCSE', 'Cambridge International Lower Secondary dan IGCSE')
on conflict (id) do update set name = excluded.name, description = excluded.description;

insert into public.education_levels (id, name, sort_order)
values
  ('50000000-0000-4000-8000-000000000001', 'Tahun 1-3', 10),
  ('50000000-0000-4000-8000-000000000002', 'Tahun 4-6', 20),
  ('50000000-0000-4000-8000-000000000003', 'Tingkatan 1-3', 30),
  ('50000000-0000-4000-8000-000000000004', 'SPM', 40),
  ('50000000-0000-4000-8000-000000000005', 'IGCSE', 50)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.subjects (id, name, slug, category)
values
  ('40000000-0000-4000-8000-000000000001', 'Matematik', 'matematik', 'STEM'),
  ('40000000-0000-4000-8000-000000000002', 'Matematik Tambahan', 'matematik-tambahan', 'STEM'),
  ('40000000-0000-4000-8000-000000000003', 'Sains', 'sains', 'STEM'),
  ('40000000-0000-4000-8000-000000000004', 'Fizik', 'fizik', 'STEM'),
  ('40000000-0000-4000-8000-000000000005', 'Kimia', 'kimia', 'STEM'),
  ('40000000-0000-4000-8000-000000000006', 'Bahasa Melayu', 'bahasa-melayu', 'Bahasa'),
  ('40000000-0000-4000-8000-000000000007', 'Bahasa Inggeris', 'bahasa-inggeris', 'Bahasa'),
  ('40000000-0000-4000-8000-000000000008', 'Sejarah', 'sejarah', 'Kemanusiaan')
on conflict (id) do update set name = excluded.name, slug = excluded.slug, category = excluded.category;

insert into public.profiles (id, role, full_name, email, phone, locale)
values
  ('00000000-0000-4000-8000-000000000001', 'admin', 'Puan Siti Mariam', 'admin@tutor2u.test', '+60123450001', 'ms'),
  ('00000000-0000-4000-8000-000000000101', 'parent', 'Farah Nabilah', 'farah.parent@tutor2u.test', '+60123450101', 'ms'),
  ('00000000-0000-4000-8000-000000000102', 'parent', 'Danial Hakimi', 'danial.parent@tutor2u.test', '+60123450102', 'ms'),
  ('00000000-0000-4000-8000-000000000103', 'parent', 'Mei Ling Tan', 'mei.parent@tutor2u.test', '+60123450103', 'ms'),
  ('00000000-0000-4000-8000-000000001001', 'tutor', 'Cikgu Aisyah Rahman', 'aisyah.tutor@tutor2u.test', '+60123451001', 'ms'),
  ('00000000-0000-4000-8000-000000001002', 'tutor', 'Cikgu Hafiz Iskandar', 'hafiz.tutor@tutor2u.test', '+60123451002', 'ms'),
  ('00000000-0000-4000-8000-000000001003', 'tutor', 'Teacher Sarah Lim', 'sarah.tutor@tutor2u.test', '+60123451003', 'ms'),
  ('00000000-0000-4000-8000-000000001004', 'tutor', 'Mr Kumar Raj', 'kumar.tutor@tutor2u.test', '+60123451004', 'ms'),
  ('00000000-0000-4000-8000-000000001005', 'tutor', 'Cikgu Nurul Iman', 'nurul.tutor@tutor2u.test', '+60123451005', 'ms'),
  ('00000000-0000-4000-8000-000000001006', 'tutor', 'Dr Amir Faiz', 'amir.tutor@tutor2u.test', '+60123451006', 'ms'),
  ('00000000-0000-4000-8000-000000001007', 'tutor', 'Cikgu Lina Zulkifli', 'lina.tutor@tutor2u.test', '+60123451007', 'ms'),
  ('00000000-0000-4000-8000-000000001008', 'tutor', 'Cikgu Azlan Omar', 'azlan.tutor@tutor2u.test', '+60123451008', 'ms'),
  ('00000000-0000-4000-8000-000000001009', 'tutor', 'Teacher Priyaa Menon', 'priyaa.tutor@tutor2u.test', '+60123451009', 'ms'),
  ('00000000-0000-4000-8000-000000001010', 'tutor', 'Cikgu Hakim Yusof', 'hakim.tutor@tutor2u.test', '+60123451010', 'ms'),
  ('00000000-0000-4000-8000-000000001011', 'tutor', 'Cikgu Nadia Salleh', 'nadia.tutor@tutor2u.test', '+60123451011', 'ms'),
  ('00000000-0000-4000-8000-000000001012', 'tutor', 'Teacher Wei Jian', 'wei.tutor@tutor2u.test', '+60123451012', 'ms')
on conflict (id) do update set full_name = excluded.full_name, phone = excluded.phone, role = excluded.role;

insert into public.parent_profiles (id, profile_id, address, state, district, emergency_contact)
values
  ('20000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000101', 'Taman Tun Dr Ismail', 'Kuala Lumpur', 'Kuala Lumpur', '+60193330001'),
  ('20000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000102', 'Seksyen 7', 'Selangor', 'Shah Alam', '+60193330002'),
  ('20000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000103', 'Tanjung Tokong', 'Pulau Pinang', 'Timur Laut', '+60193330003')
on conflict (id) do update set state = excluded.state, district = excluded.district;

insert into public.student_profiles (id, parent_profile_id, full_name, birth_year, education_level_id, curriculum_id, school_name, learning_notes)
values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000101', 'Adam Faris', 2010, '50000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000002', 'SMK Taman Tun', 'Perlu kukuhkan algebra dan teknik menjawab SPM.'),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000101', 'Sofia Hana', 2014, '50000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001', 'SK Bukit Damansara', 'Yakin membaca tetapi perlukan latihan pecahan.'),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000102', 'Irfan Danial', 2011, '50000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000002', 'SMK Seksyen 9', 'Sasaran naik dari C ke B untuk Sains.'),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000103', 'Chloe Tan', 2012, '50000000-0000-4000-8000-000000000005', '60000000-0000-4000-8000-000000000003', 'Penang International School', 'Perlu latihan writing dan speaking.'),
  ('30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000103', 'Ryan Tan', 2015, '50000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001', 'SJKC Hun Bin', 'Suka eksperimen, cepat bosan dengan latihan berulang.')
on conflict (id) do update set learning_notes = excluded.learning_notes;

insert into public.tutor_profiles (id, profile_id, verification_status, professional_title, bio, gender, teaching_experience_years, highest_qualification, hourly_rate_cents, response_minutes, completion_rate, cancellation_rate, can_teach_online, can_teach_physical, base_state, base_district, approved_at)
values
  ('10000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000001001', 'approved', 'Pakar Matematik SPM', 'Membantu murid lemah asas algebra membina keyakinan melalui latihan bertahap.', 'female', 9, 'Sarjana Pendidikan Matematik', 7500, 18, 98.2, 1.1, true, true, 'Kuala Lumpur', 'Kuala Lumpur', now()),
  ('10000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000001002', 'approved', 'Jurulatih Sains Menengah', 'Menggunakan demonstrasi ringkas dan peta konsep untuk topik Sains Tingkatan 1-3.', 'male', 7, 'Ijazah Sarjana Muda Sains', 6500, 35, 96.4, 2.0, true, true, 'Selangor', 'Shah Alam', now()),
  ('10000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000001003', 'approved', 'English Speaking Coach', 'Fokus kepada grammar, writing structure dan confidence untuk murid IGCSE.', 'female', 11, 'TESL Cambridge CELTA', 9000, 22, 99.0, 0.8, true, false, 'Pulau Pinang', 'Timur Laut', now()),
  ('10000000-0000-4000-8000-000000001004', '00000000-0000-4000-8000-000000001004', 'approved', 'Guru Fizik Berpengalaman', 'Menerangkan konsep fizik melalui analogi harian dan soalan berformat peperiksaan.', 'male', 14, 'BSc Physics', 9500, 40, 97.5, 1.7, true, true, 'Johor', 'Johor Bahru', now()),
  ('10000000-0000-4000-8000-000000001005', '00000000-0000-4000-8000-000000001005', 'approved', 'Tutor Bahasa Melayu UPSR/SPM', 'Membimbing karangan, tatabahasa dan pemahaman dengan rubrik yang jelas.', 'female', 8, 'Ijazah Bahasa Melayu', 6000, 28, 95.5, 1.9, true, true, 'Perak', 'Ipoh', now()),
  ('10000000-0000-4000-8000-000000001006', '00000000-0000-4000-8000-000000001006', 'approved', 'Kimia SPM dan Pra-U', 'Bekas pensyarah kolej yang memberi penekanan kepada stoikiometri dan eksperimen.', 'male', 15, 'PhD Kimia', 12000, 60, 94.0, 2.6, true, false, 'Negeri Sembilan', 'Seremban', now()),
  ('10000000-0000-4000-8000-000000001007', '00000000-0000-4000-8000-000000001007', 'approved', 'Guru Matematik Rendah', 'Kelas ceria dan tersusun untuk murid Tahun 4-6 yang perlukan asas kukuh.', 'female', 6, 'Diploma Pendidikan Rendah', 5000, 16, 98.8, 0.5, true, true, 'Selangor', 'Petaling', now()),
  ('10000000-0000-4000-8000-000000001008', '00000000-0000-4000-8000-000000001008', 'submitted', 'Calon Tutor Sejarah', 'Mengaitkan fakta sejarah dengan kronologi dan latihan esei pendek.', 'male', 4, 'Ijazah Sejarah', 5200, 80, 90.0, 4.0, true, true, 'Kedah', 'Alor Setar', null),
  ('10000000-0000-4000-8000-000000001009', '00000000-0000-4000-8000-000000001009', 'approved', 'IGCSE Mathematics Specialist', 'Menyediakan latihan topical, checkpoint dan mock test untuk murid IGCSE.', 'female', 10, 'MSc Applied Mathematics', 11000, 25, 97.0, 1.5, true, false, 'Kuala Lumpur', 'Kuala Lumpur', now()),
  ('10000000-0000-4000-8000-000000001010', '00000000-0000-4000-8000-000000001010', 'correction_required', 'Tutor Sains Online', 'Profil sedang dilengkapkan selepas semakan dokumen.', 'male', 3, 'BSc Biology', 4500, 120, 88.5, 5.2, true, false, 'Kelantan', 'Kota Bharu', null),
  ('10000000-0000-4000-8000-000000001011', '00000000-0000-4000-8000-000000001011', 'approved', 'Pakar Add Math SPM', 'Strategi step-by-step untuk fungsi, kalkulus asas dan soalan KBAT.', 'female', 12, 'Sarjana Matematik', 10000, 14, 99.1, 0.7, true, true, 'Selangor', 'Subang Jaya', now()),
  ('10000000-0000-4000-8000-000000001012', '00000000-0000-4000-8000-000000001012', 'approved', 'English and Science Bilingual Tutor', 'Menggabungkan penerangan dwibahasa untuk murid yang bertukar dari sekolah Cina ke KSSM.', 'male', 5, 'BEd Science Education', 6800, 32, 93.0, 2.8, true, true, 'Sabah', 'Kota Kinabalu', now())
on conflict (id) do update set verification_status = excluded.verification_status, professional_title = excluded.professional_title, hourly_rate_cents = excluded.hourly_rate_cents;

insert into public.tutor_scores (tutor_profile_id, professional_score, academic_qualification_score, teaching_experience_score, completed_classes_score, punctuality_score, response_score, student_outcome_score, discipline_score, customer_rating, review_count)
values
  ('10000000-0000-4000-8000-000000001001', 94, 96, 92, 94, 98, 97, 91, 100, 4.9, 86),
  ('10000000-0000-4000-8000-000000001002', 88, 84, 86, 91, 94, 89, 85, 100, 4.7, 61),
  ('10000000-0000-4000-8000-000000001003', 91, 93, 95, 88, 97, 95, 90, 100, 4.8, 72),
  ('10000000-0000-4000-8000-000000001004', 89, 90, 96, 87, 92, 84, 88, 100, 4.6, 55),
  ('10000000-0000-4000-8000-000000001005', 84, 82, 85, 82, 90, 88, 84, 100, 4.6, 43),
  ('10000000-0000-4000-8000-000000001006', 92, 100, 97, 84, 89, 78, 93, 100, 4.7, 38),
  ('10000000-0000-4000-8000-000000001007', 87, 80, 83, 92, 99, 98, 82, 100, 4.9, 47),
  ('10000000-0000-4000-8000-000000001008', 69, 72, 66, 55, 80, 64, 58, 100, 0, 0),
  ('10000000-0000-4000-8000-000000001009', 93, 97, 90, 89, 94, 96, 92, 100, 4.8, 49),
  ('10000000-0000-4000-8000-000000001010', 58, 65, 50, 40, 75, 54, 48, 100, 0, 0),
  ('10000000-0000-4000-8000-000000001011', 96, 98, 96, 95, 99, 99, 94, 100, 5.0, 91),
  ('10000000-0000-4000-8000-000000001012', 82, 78, 76, 80, 86, 90, 78, 100, 4.5, 27)
on conflict (tutor_profile_id) do update set professional_score = excluded.professional_score, customer_rating = excluded.customer_rating, review_count = excluded.review_count;

insert into public.tutor_badges (tutor_profile_id, badge_name)
select tutor_id, badge
from (values
  ('10000000-0000-4000-8000-000000001001'::uuid, 'Identiti Disahkan'), ('10000000-0000-4000-8000-000000001001'::uuid, 'Pakar SPM'), ('10000000-0000-4000-8000-000000001001'::uuid, 'Tutor Pilihan Ibu Bapa'),
  ('10000000-0000-4000-8000-000000001002'::uuid, 'Sijil Disahkan'), ('10000000-0000-4000-8000-000000001002'::uuid, 'Respons Pantas'),
  ('10000000-0000-4000-8000-000000001003'::uuid, 'Sijil Disahkan'), ('10000000-0000-4000-8000-000000001003'::uuid, 'Kehadiran Cemerlang'),
  ('10000000-0000-4000-8000-000000001011'::uuid, 'Guru Berdaftar'), ('10000000-0000-4000-8000-000000001011'::uuid, 'Pakar SPM'), ('10000000-0000-4000-8000-000000001011'::uuid, 'Respons Pantas')
) as x(tutor_id, badge)
on conflict do nothing;

insert into public.tutor_subjects (tutor_profile_id, subject_id, education_level_id, curriculum_id, years_experience)
values
  ('10000000-0000-4000-8000-000000001001', '40000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000002', 9),
  ('10000000-0000-4000-8000-000000001001', '40000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000002', 7),
  ('10000000-0000-4000-8000-000000001002', '40000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000002', 7),
  ('10000000-0000-4000-8000-000000001003', '40000000-0000-4000-8000-000000000007', '50000000-0000-4000-8000-000000000005', '60000000-0000-4000-8000-000000000003', 11),
  ('10000000-0000-4000-8000-000000001004', '40000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000002', 14),
  ('10000000-0000-4000-8000-000000001005', '40000000-0000-4000-8000-000000000006', '50000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000002', 8),
  ('10000000-0000-4000-8000-000000001006', '40000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000002', 15),
  ('10000000-0000-4000-8000-000000001007', '40000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001', 6),
  ('10000000-0000-4000-8000-000000001008', '40000000-0000-4000-8000-000000000008', '50000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000002', 4),
  ('10000000-0000-4000-8000-000000001009', '40000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000005', '60000000-0000-4000-8000-000000000003', 10),
  ('10000000-0000-4000-8000-000000001010', '40000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000002', 3),
  ('10000000-0000-4000-8000-000000001011', '40000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000002', 12),
  ('10000000-0000-4000-8000-000000001012', '40000000-0000-4000-8000-000000000007', '50000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000002', 5)
on conflict do nothing;

insert into public.tutor_service_areas (tutor_profile_id, state, district, radius_km)
values
  ('10000000-0000-4000-8000-000000001001', 'Kuala Lumpur', 'Kuala Lumpur', 18),
  ('10000000-0000-4000-8000-000000001002', 'Selangor', 'Shah Alam', 20),
  ('10000000-0000-4000-8000-000000001003', 'Pulau Pinang', 'Timur Laut', 12),
  ('10000000-0000-4000-8000-000000001004', 'Johor', 'Johor Bahru', 15),
  ('10000000-0000-4000-8000-000000001005', 'Perak', 'Ipoh', 16),
  ('10000000-0000-4000-8000-000000001006', 'Negeri Sembilan', 'Seremban', 10),
  ('10000000-0000-4000-8000-000000001007', 'Selangor', 'Petaling', 12),
  ('10000000-0000-4000-8000-000000001008', 'Kedah', 'Alor Setar', 15),
  ('10000000-0000-4000-8000-000000001009', 'Kuala Lumpur', 'Kuala Lumpur', 8),
  ('10000000-0000-4000-8000-000000001010', 'Kelantan', 'Kota Bharu', 10),
  ('10000000-0000-4000-8000-000000001011', 'Selangor', 'Subang Jaya', 18),
  ('10000000-0000-4000-8000-000000001012', 'Sabah', 'Kota Kinabalu', 20);

insert into public.tutor_availability (tutor_profile_id, availability_date, starts_at, ends_at, mode, status)
values
  ('10000000-0000-4000-8000-000000001001', current_date + 1, '20:00', '21:30', 'online', 'available'),
  ('10000000-0000-4000-8000-000000001001', current_date + 3, '18:00', '19:30', 'physical', 'available'),
  ('10000000-0000-4000-8000-000000001002', current_date + 2, '19:30', '21:00', 'online', 'available'),
  ('10000000-0000-4000-8000-000000001003', current_date + 1, '17:00', '18:30', 'online', 'available'),
  ('10000000-0000-4000-8000-000000001004', current_date + 4, '20:30', '22:00', 'online', 'temporarily_held'),
  ('10000000-0000-4000-8000-000000001005', current_date + 5, '10:00', '11:30', 'physical', 'available'),
  ('10000000-0000-4000-8000-000000001006', current_date + 2, '21:00', '22:30', 'online', 'available'),
  ('10000000-0000-4000-8000-000000001007', current_date + 1, '15:00', '16:30', 'physical', 'available'),
  ('10000000-0000-4000-8000-000000001009', current_date + 3, '20:00', '21:30', 'online', 'available'),
  ('10000000-0000-4000-8000-000000001011', current_date + 2, '18:30', '20:00', 'hybrid', 'available');

insert into public.packages (id, name, subject_id, education_level_id, session_count, duration_minutes, price_cents, is_trial)
values
  ('80000000-0000-4000-8000-000000000001', 'Sesi Percubaan 60 Minit', '40000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000004', 1, 60, 3900, true),
  ('80000000-0000-4000-8000-000000000002', 'Pakej Fokus SPM 4 Sesi', '40000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000004', 4, 90, 32000, false),
  ('80000000-0000-4000-8000-000000000003', 'Pakej Asas Rendah 8 Sesi', '40000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002', 8, 75, 36000, false)
on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents;

insert into public.bookings (id, parent_profile_id, student_profile_id, tutor_profile_id, subject_id, package_id, mode, learning_objective, status, payment_status, total_cents)
values
  ('70000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000101', '30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000001001', '40000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000002', 'online', 'Naikkan markah Add Math dari 52 ke 70 sebelum peperiksaan percubaan.', 'confirmed', 'paid', 32000),
  ('70000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000102', '30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000001002', '40000000-0000-4000-8000-000000000003', '80000000-0000-4000-8000-000000000001', 'physical', 'Uji keserasian tutor dan bina jadual ulang kaji Sains.', 'completed', 'paid', 3900),
  ('70000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000103', '30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000001003', '40000000-0000-4000-8000-000000000007', null, 'online', 'Persediaan writing task dan speaking confidence untuk IGCSE.', 'pending_tutor_confirmation', 'pending', 9000)
on conflict (id) do update set status = excluded.status, payment_status = excluded.payment_status;

insert into public.booking_sessions (id, booking_id, tutor_profile_id, student_profile_id, starts_at, ends_at, mode, status, attendance_pin)
values
  ('71000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000001001', '30000000-0000-4000-8000-000000000001', now() + interval '1 day', now() + interval '1 day 90 minutes', 'online', 'confirmed', '4286'),
  ('71000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000001002', '30000000-0000-4000-8000-000000000003', now() - interval '2 days', now() - interval '2 days' + interval '90 minutes', 'physical', 'completed', '7391'),
  ('71000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000001003', '30000000-0000-4000-8000-000000000004', now() + interval '3 days', now() + interval '3 days 90 minutes', 'online', 'booked', '1184')
on conflict (id) do update set status = excluded.status;

insert into public.attendance (booking_session_id, student_present, tutor_present, confirmed_by_parent_at, confirmed_by_tutor_at, pin_verified, notes)
values
  ('71000000-0000-4000-8000-000000000002', true, true, now() - interval '2 days' + interval '95 minutes', now() - interval '2 days' + interval '92 minutes', true, 'Kelas selesai tepat masa dan murid aktif bertanya.')
on conflict (booking_session_id) do update set pin_verified = excluded.pin_verified, notes = excluded.notes;

insert into public.curriculum_topics (id, curriculum_id, education_level_id, subject_id, chapter, topic, skill, content_standard, learning_standard, sort_order)
values
  ('90000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000002', 'Fungsi', 'Fungsi Kuadratik', 'Melakar graf dan menentukan punca', 'Menganalisis hubungan kuadratik', 'Menyelesaikan masalah fungsi kuadratik', 10),
  ('90000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003', 'Daya dan Gerakan', 'Inersia', 'Menghubung kait jisim dan inersia', 'Memahami kesan daya', 'Menerangkan aplikasi inersia', 20),
  ('90000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000007', 'Writing', 'Argumentative Essay', 'Planning and paragraph cohesion', 'Write coherent arguments', 'Use evidence and transition phrases', 30)
on conflict (id) do update set topic = excluded.topic;

insert into public.student_topic_progress (student_profile_id, curriculum_topic_id, mastery_level, confidence_note, updated_by_tutor_profile_id)
values
  ('30000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000001', 4, 'Boleh faktorkan soalan asas, masih perlukan latihan graf.', '10000000-0000-4000-8000-000000001001'),
  ('30000000-0000-4000-8000-000000000003', '90000000-0000-4000-8000-000000000002', 3, 'Faham definisi inersia tetapi kurang yakin menjawab KBAT.', '10000000-0000-4000-8000-000000001002'),
  ('30000000-0000-4000-8000-000000000004', '90000000-0000-4000-8000-000000000003', 5, 'Struktur esei semakin kemas dan contoh lebih tepat.', '10000000-0000-4000-8000-000000001003')
on conflict (student_profile_id, curriculum_topic_id) do update set mastery_level = excluded.mastery_level, confidence_note = excluded.confidence_note;

insert into public.progress_reports (booking_session_id, tutor_profile_id, student_profile_id, topics_covered, skills_practiced, mastery_level, homework, strengths, weaknesses, tutor_recommendation, submitted_at)
values
  ('71000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000001002', '30000000-0000-4000-8000-000000000003', '{"Inersia","Daya seimbang"}', '{"Melukis rajah daya","Menjawab soalan objektif"}', 3, 'Siapkan latihan topikal muka surat 24-26.', 'Cepat faham contoh harian dan aktif menjawab.', 'Perlu tulis kata kunci dengan lebih tepat.', 'Ulang kaji formula dan buat 10 soalan KBAT minggu ini.', now() - interval '2 days' + interval '2 hours')
on conflict (booking_session_id) do update set mastery_level = excluded.mastery_level, tutor_recommendation = excluded.tutor_recommendation;

insert into public.assignments (id, booking_id, tutor_profile_id, student_profile_id, title, instructions, due_at)
values
  ('92000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000001001', '30000000-0000-4000-8000-000000000001', 'Latihan Fungsi Kuadratik Set A', 'Jawab semua soalan dan tandakan bahagian yang tidak pasti.', now() + interval '5 days'),
  ('92000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000001002', '30000000-0000-4000-8000-000000000003', 'Kuiz Inersia', 'Selesaikan kuiz ringkas sebelum kelas susulan.', now() + interval '2 days')
on conflict (id) do update set title = excluded.title;

insert into public.assessments (id, tutor_profile_id, subject_id, education_level_id, title, assessment_type, max_score)
values
  ('93000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000001001', '40000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000004', 'Diagnostik Add Math Julai', 'diagnostic', 100),
  ('93000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000001002', '40000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000003', 'Ujian Sains Bab Daya', 'quiz', 40)
on conflict (id) do update set title = excluded.title;

insert into public.assessment_results (assessment_id, student_profile_id, booking_id, score, taken_at)
values
  ('93000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001', 62, now() - interval '9 days'),
  ('93000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001', 68, now() - interval '2 days'),
  ('93000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000002', 31, now() - interval '1 day');

insert into public.reviews (id, booking_session_id, parent_profile_id, tutor_profile_id, rating, review_text)
values
  ('94000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000001002', 4.7, 'Cikgu Hafiz sabar dan jelas. Anak saya faham inersia selepas contoh dalam kereta.')
on conflict (id) do update set rating = excluded.rating, review_text = excluded.review_text;

insert into public.review_criteria_scores (review_id, criteria, score)
values
  ('94000000-0000-4000-8000-000000000001', 'Penguasaan subjek', 5),
  ('94000000-0000-4000-8000-000000000001', 'Cara penerangan', 5),
  ('94000000-0000-4000-8000-000000000001', 'Kesabaran', 5),
  ('94000000-0000-4000-8000-000000000001', 'Komunikasi', 4),
  ('94000000-0000-4000-8000-000000000001', 'Ketepatan masa', 5),
  ('94000000-0000-4000-8000-000000000001', 'Persediaan kelas', 4),
  ('94000000-0000-4000-8000-000000000001', 'Profesionalisme', 5),
  ('94000000-0000-4000-8000-000000000001', 'Keberkesanan pembelajaran', 5)
on conflict (review_id, criteria) do update set score = excluded.score;

insert into public.tutor_documents (tutor_profile_id, document_type, file_path, status, reviewed_by, reviewed_at, notes)
values
  ('10000000-0000-4000-8000-000000001008', 'Kad Pengenalan', 'azlan/ic.pdf', 'submitted', null, null, 'Menunggu semakan admin.'),
  ('10000000-0000-4000-8000-000000001010', 'Sijil Akademik', 'hakim/degree.pdf', 'correction_required', '00000000-0000-4000-8000-000000000001', now(), 'Muat naik salinan yang lebih jelas.');

insert into public.complaints (parent_profile_id, tutor_profile_id, booking_id, category, description, status, requested_resolution, assigned_admin_profile_id)
values
  ('20000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000001001', '70000000-0000-4000-8000-000000000001', 'Jadual', 'Ibu bapa minta tukar slot kerana peperiksaan sekolah bertindih.', 'active', 'Reschedule requested', '00000000-0000-4000-8000-000000000001');

insert into public.payments (booking_id, parent_profile_id, amount_cents, platform_fee_cents, provider, provider_reference, status, paid_at)
values
  ('70000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000101', 32000, 4800, 'placeholder', 'PAY-DEMO-1001', 'paid', now() - interval '3 days'),
  ('70000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000102', 3900, 585, 'placeholder', 'PAY-DEMO-1002', 'paid', now() - interval '2 days');

insert into public.tutor_payouts (tutor_profile_id, gross_cents, commission_cents, net_cents, status, scheduled_for)
values
  ('10000000-0000-4000-8000-000000001001', 32000, 4800, 27200, 'pending', current_date + 7),
  ('10000000-0000-4000-8000-000000001002', 3900, 585, 3315, 'processing', current_date + 2);

insert into public.notifications (profile_id, title, body)
values
  ('00000000-0000-4000-8000-000000000101', 'Slot kelas disahkan', 'Kelas Add Math bersama Cikgu Aisyah telah disahkan untuk esok malam.'),
  ('00000000-0000-4000-8000-000000001008', 'Dokumen menunggu semakan', 'Pejabat Tutor2U sedang menyemak dokumen anda.'),
  ('00000000-0000-4000-8000-000000000001', 'Tutor perlu disemak', '2 profil tutor memerlukan tindakan pengesahan hari ini.');

insert into public.audit_logs (actor_profile_id, action, entity_table, entity_id, metadata)
values
  ('00000000-0000-4000-8000-000000000001', 'request_correction', 'tutor_documents', null, '{"reason":"Dokumen tidak jelas"}'),
  ('00000000-0000-4000-8000-000000000001', 'approve_tutor', 'tutor_profiles', '10000000-0000-4000-8000-000000001001', '{"channel":"admin_dashboard"}');
