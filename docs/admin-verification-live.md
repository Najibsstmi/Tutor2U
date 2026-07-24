# Admin Verification Live

Admin server actions live in `src/lib/admin/verification-actions.ts`.

Implemented:

- `updateTutorApplicationStatus`
- `updateTutorDocumentVerification`
- `createAdminDocumentSignedUrl`
- `requiresAdminReason`

The actions enforce `requireAdmin()`, validate input with Zod, re-check status transitions, write audit/action rows and revalidate admin/marketplace paths.

Current limitation: `src/components/admin/tutor-verification-panel.tsx` still uses demo client state. The next pass should load applications from Supabase and call these actions from the panel.
