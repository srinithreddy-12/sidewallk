# Phase 2B — private alpha

Phase 2B turns the local demonstration into a product that a small group of
real organizers and members can use. The visitor experience remains public and
requires no account.

## Outcome

An organizer can create a draft town, invite members, review their buildings,
and publish the town. An invited member can edit only the building assigned to
them. A signed-out visitor can browse only published towns.

## Roles

- **Visitor:** signed out; can browse published towns and follow safe outbound
  links. Cannot see drafts or editing controls.
- **Member:** signed in and assigned to one building in a town; can preview the
  town, edit that building and upload assets for it. Cannot edit town settings,
  other buildings, invitations or publication state.
- **Organizer:** signed in with an active organizer membership; can manage the
  town, every member building, invitations and publication state.

Roles are scoped to a town. A person may organize one town and be a member in
another. UI checks improve the experience, but server-side data access checks
and Postgres row-level security are the enforcement boundaries.

## Build sequence

1. **Foundation (this slice):** current supported Next.js/test tooling,
   draft/published town metadata, pure permission rules with exhaustive tests,
   and a reviewed Postgres/RLS migration.
2. **Authentication (connected, end-to-end email verification pending):**
   Supabase email magic-link sign-in, cookie-based SSR sessions, and a
   server-only verified-claims boundary. No role is trusted from the browser
   or from user-editable metadata.
3. **Town persistence:** repository adapter for towns, members and memberships;
   migrate the editor from local overrides to authenticated server mutations
   with optimistic concurrency.
4. **Organizer and member workspace:** create a town, invite/assign a member,
   edit permitted records, preview a draft, publish/unpublish, and show clear
   empty/error/save states.
5. **Assets:** image upload, file type/size validation, ownership policies,
   alt text and deletion. Generated demo artwork remains as the offline sample.
6. **Private alpha hardening:** invitation expiry, audit events for destructive
   changes, rate limits, backups, error reporting and browser/device testing.

## Foundation decisions

- Use Supabase Auth, Postgres and Storage for the first private alpha. It keeps
  authentication, relational data, file storage and row-level authorization in
  one service. The SSR package is integrated only after project credentials
  exist; the app must continue to run as the sample demo without them.
- Keep the scene model and rendering components independent from persistence.
  Database rows translate to the existing `Town`, `Member`, `Building`, `Room`
  and `RoomProp` types at the data access boundary.
- Use database-generated UUIDs for production records and separate stable
  slugs for URLs. Existing demo IDs remain valid local identifiers.
- Store member profile fields in columns and the scene-specific building/room
  structures in validated JSON initially. Normalize them only when query or
  reporting needs justify it.
- Use optimistic version numbers on towns and members so one editor cannot
  silently overwrite another editor's changes.

## Explicitly later

Payments, subscriptions, marketplace resale, cryptocurrency, multiplayer
avatars, voice chat, native apps, runtime AI generation and unrestricted 3D
editing remain outside Phase 2B. They add cost and moderation/security work
before the core organizer/member publishing loop has evidence of demand.

## Acceptance checks

- Signed-out visitors cannot fetch draft town or member rows.
- Members cannot fetch or mutate another member's private building data.
- Organizers can manage only towns where they have an active organizer role.
- Invitations alone grant no draft or edit access until accepted.
- Published towns remain fully usable on phone and desktop without sign-in.
- Unsafe URLs remain rejected at validation and render time.
- Local demo mode still starts without environment variables or network access.
- Tests, typecheck, lint, production build and the complete browser flow pass.

## Current boundary

The project is linked to the hosted Sidewallk Supabase project and migration
`202610170001_phase2b_core.sql` is applied. The new tables respond through the
Data API with row-level security active. The configured sign-in form, callback,
cookie-refresh proxy and verified-claims code compile and have been exercised
in the production browser build. A real magic-link delivery, callback exchange
and authenticated session still require an email address supplied by the human
tester; no test email has been sent automatically.
