# Public Tutor Data

Approved tutor public data is exposed through the database view `public.approved_tutor_public_profiles`.

The view returns safe marketplace fields only:

- tutor profile id
- display name
- professional title
- biography
- gender
- experience years
- public rates and quality scores
- state/district service area
- profile photo URL
- approved date
- subjects, levels, curriculums and badges

Sensitive fields such as identification numbers, private documents, full addresses, correction notes and admin notes are not included.

The app reads this view from `src/lib/marketplace/live-tutors.ts` and falls back to demo data when Supabase is not configured or no approved rows are available.
