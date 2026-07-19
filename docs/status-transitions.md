# Tutor Application Status Transitions

Internal statuses:

- `draft`
- `submitted`
- `under_review`
- `changes_requested`
- `resubmitted`
- `approved`
- `rejected`
- `suspended`

Allowed transitions:

| From | To | Actor |
| --- | --- | --- |
| `draft` | `submitted` | Tutor owner |
| `submitted` | `under_review` | Admin |
| `under_review` | `changes_requested` | Admin |
| `under_review` | `approved` | Admin |
| `under_review` | `rejected` | Admin |
| `changes_requested` | `resubmitted` | Tutor owner |
| `resubmitted` | `under_review` | Admin |
| `approved` | `suspended` | Admin |

Enforcement layers:

- Client demo: `src/lib/tutor-onboarding/status-transitions.ts`
- Database: `public.tutor_application_transition_allowed()`
- Database trigger: `public.enforce_tutor_application_transition()`
- RLS: tutors can only edit their own draft or changes-requested application state.
