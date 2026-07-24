# Authentication

Tutor2U now uses server-side Supabase Auth actions as the production path.

Implemented files:

- `src/lib/auth/actions.ts`
- `src/lib/auth/server.ts`
- `src/app/auth/callback/route.ts`
- `src/proxy.ts`

## Supported Flows

- Parent/tutor registration through `registerWithPassword`.
- Password login through `loginWithPassword`.
- Logout through `signOutCurrentUser`.
- Password reset and update server actions.
- Supabase email callback through `/auth/callback`.

Public registration only accepts `parent` and `tutor`. The UI hides `admin` during registration, the server action rejects admin registration, and migration `0003_live_auth_onboarding_integration.sql` normalizes any public signup metadata outside `tutor` to `parent`.

## Demo Mode

If Supabase env vars are missing, auth actions set the `tutor2u_demo_role` cookie and keep the local demo workflow available.

Demo mode is not production auth and must not be used as an authorization source for sensitive data.
