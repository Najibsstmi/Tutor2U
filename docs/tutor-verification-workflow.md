# Tutor Verification Workflow

Admin review is available at `/dashboard/admin/tutor-applications`.

## Admin Capabilities

- Search tutor applications by display name.
- Filter by status, state and subject.
- View full application details.
- View private document metadata.
- Generate a signed URL placeholder.
- Verify document records.
- Mark documents as needing changes.
- Start review.
- Request changes with a required reason.
- Approve applications.
- Reject applications with a required reason.
- Suspend approved tutors with a required reason.
- Append action history and audit notes in demo state.

## Workflow

1. Tutor submits `draft -> submitted`.
2. Admin starts review `submitted -> under_review`.
3. Admin can request changes, approve or reject from `under_review`.
4. Tutor can resubmit `changes_requested -> resubmitted`.
5. Admin restarts review `resubmitted -> under_review`.
6. Approved tutors can later be suspended `approved -> suspended`.

The UI uses `src/lib/tutor-onboarding/status-transitions.ts`, while the database uses `public.enforce_tutor_application_transition()` to prevent arbitrary status changes.

## Demo Limitation

The admin module is functional in local state for Milestone 2 verification. Live persistence requires wiring these actions to Supabase server actions or route handlers.
