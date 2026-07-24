# RLS Testing

Recommended manual RLS checks after applying migrations:

1. Create a parent through public signup and confirm `profiles.role = parent`.
2. Create a tutor through public signup and confirm a draft `tutor_profiles` row exists.
3. Attempt public signup with metadata `{ "role": "admin" }` and confirm role is normalized to parent.
4. As a parent, confirm tutor application tables are not readable.
5. As a tutor, confirm another tutor application is not readable or writable.
6. As a tutor, upload a document and confirm only the owner and admin can read metadata.
7. As anon, query `approved_tutor_public_profiles` and confirm only approved tutors appear.
8. As anon, confirm private document tables and storage objects are not readable.
9. As admin, request changes, approve and reject using server actions, then inspect `tutor_verification_actions` and `audit_logs`.

Automated tests currently verify pure transition/storage rules and migration content. Live RLS tests require a Supabase test project.
