# Localization

Tutor2U now supports a lightweight BM/EN localization layer.

## Files

- `messages/ms.json`
- `messages/en.json`
- `src/lib/i18n/messages.ts`
- `src/lib/i18n/use-translations.ts`
- `src/components/shared/language-switcher.tsx`

## Persistence

The selected locale is stored in the `tutor2u_locale` cookie for one year. The header language switcher refreshes the current route after changing the cookie.

## Current Coverage

New Milestone 2 onboarding/admin verification text uses translation keys. Older Fasa 1 pages still contain hardcoded BM text and should be migrated incrementally.
# Milestone 3 Localization Status

The bilingual dictionary remains in:

- `messages/ms.json`
- `messages/en.json`

Milestone 2 onboarding and admin verification strings are centralized. Milestone 3 adds live server paths, but several older UI surfaces still contain hardcoded Bahasa Melayu text:

- auth panel labels/status copy
- marketplace filters, booking dialog and comparison table
- tutor profile page
- some dashboard cards from the original foundation pass

Do not claim complete localization until those surfaces are moved into the message dictionaries and checked in both `ms` and `en`.
