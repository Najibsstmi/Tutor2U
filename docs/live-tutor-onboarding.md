# Live Tutor Onboarding

Live onboarding support is implemented in `src/lib/tutor-onboarding/live-actions.ts`.

Current capabilities:

- Validate submitted form values on the server with the existing Zod schema.
- Create or reuse the tutor profile for the current Supabase user.
- Upsert the active tutor application.
- Persist application JSON sections.
- Replace experience, qualifications, rates, service area and availability detail rows for the application.
- Submit or resubmit using the existing status transition rules.

The client onboarding flow now calls these actions when Supabase env vars are configured and keeps localStorage as an explicit demo fallback.

Remaining work:

- Make draft saves allow incomplete partial forms with a dedicated draft schema.
- Move multi-table writes into a Postgres RPC transaction.
- Hydrate the client form from the saved Supabase draft on page load.
