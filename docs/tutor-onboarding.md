# Tutor Onboarding

Tutor onboarding is available at `/dashboard/tutor/onboarding`.

## Scope Implemented

- Multi-step tutor application form:
  - Personal information
  - Identity verification
  - Education and qualifications
  - Teaching experience
  - Subjects and levels
  - Teaching mode and service area
  - Rates
  - Weekly availability
  - Review and declaration
- Save draft with local persistence.
- Autosave indicator.
- Zod and React Hook Form validation.
- File type and size validation for PNG, JPG, JPEG and PDF files.
- Status-aware submit and resubmit flow.
- Bilingual BM/EN labels from `messages/*`.

## Data Handling

The current UI stores draft progress in `localStorage` for demo mode. The database architecture for production persistence is in `supabase/migrations/0002_tutor_onboarding_verification.sql`.

Sensitive fields are separated:

- Identity numbers remain private.
- Full home address is not part of public profile fields.
- Identity and qualification document references are private.
- Profile image can be served through `tutor-profile-images`.

## Production Integration Notes

When connecting Supabase:

1. Create or find the user's `tutor_profiles` row.
2. Insert a `tutor_applications` row with `status = 'draft'`.
3. Store section payloads in structured columns/tables from migration 0002.
4. Upload identity documents to `tutor-identity-documents`.
5. Upload certificates to `tutor-qualification-documents`.
6. Create `tutor_documents` records for every upload.
7. Submit through a server action or route handler that enforces the transition helper and database trigger.
