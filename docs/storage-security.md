# Storage Security

## Buckets

Migration 0002 creates or documents these Supabase Storage buckets:

| Bucket | Public | Purpose |
| --- | --- | --- |
| `tutor-identity-documents` | No | MyKad, passport or identity verification files. |
| `tutor-qualification-documents` | No | Certificates and qualification evidence. |
| `tutor-profile-images` | Yes | Safe public tutor profile images. |

## Rules

- Public users cannot read identity documents.
- Public users cannot read qualification documents.
- Tutors can only read their own private documents.
- Admin users can review private documents.
- Private documents should be accessed through short-lived signed URLs.
- Identification numbers must not be stored in public tables or public pages.

## Path Convention

Use an owner-scoped prefix when uploading private files:

```txt
{auth_user_id}/identity/front.pdf
{auth_user_id}/qualifications/certificate.pdf
```

The storage insert policies use the first folder segment to match `auth.uid()`.
# Milestone 3 Addendum

New storage helpers and upload route:

- `src/lib/tutor-onboarding/storage.ts`
- `src/app/api/tutor-onboarding/documents/route.ts`

The route requires a logged-in tutor, validates MIME type and size, scopes object paths to `profileId/applicationId/scope`, uploads to the correct bucket and inserts metadata into `tutor_documents`.

Accepted MIME types:

- `image/png`
- `image/jpeg`
- `image/jpg`
- `application/pdf`

Maximum size: 5MB.

Migration `0003_live_auth_onboarding_integration.sql` adds owner update/delete policies for tutor document buckets. Private read policies still require owner/admin access and signed URLs should be generated server-side only.
