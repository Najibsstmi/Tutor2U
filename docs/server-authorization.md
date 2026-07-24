# Server Authorization

Server authorization is centralized in `src/lib/auth/server.ts`.

Helpers:

- `getCurrentProfile()` returns the authenticated Supabase user and safe profile DTO.
- `requireUser()` rejects unauthenticated access.
- `requireRole(role | role[])` enforces parent/tutor/admin access.
- `requireAdmin()` enforces admin access.
- `getDashboardRole()` supports dashboard routing with Supabase first and demo fallback second.

Server Actions and Route Handlers must call these helpers directly. UI gating and `proxy.ts` are convenience checks only; they are not the security boundary.

Dashboard pages now check role server-side before rendering parent, tutor and admin dashboards.
