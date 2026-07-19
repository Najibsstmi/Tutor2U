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
