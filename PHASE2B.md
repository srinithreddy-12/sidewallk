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

1. **Foundation — done.** Draft/published town metadata, pure permission
   rules (`lib/access.ts`) with exhaustive tests, a reviewed Postgres/RLS
   migration, and the full `lib/repository/` data access boundary (row
   conversion, public reads, authenticated reads/writes) with its own tests.
2. **Authentication — connected, end-to-end email delivery unverified.**
   Supabase email magic-link sign-in, cookie-based SSR sessions, and a
   server-only verified-claims boundary (`lib/viewer.ts`, using
   `auth.getClaims()`, never user metadata). No role is trusted from the
   browser. The `next`-path round trip (sign-in → magic link → callback →
   back to where the user started) is implemented and the redirect behavior
   is verified; the actual email delivery and click-through has not been,
   since that requires a human-supplied address.
3. **Town persistence — done.** `lib/repository/workspace.ts` is the one
   explicit persistence adapter; every member/town mutation carries an
   `expectedVersion` and returns a distinct conflict result instead of
   overwriting a newer row. The production editor
   (`WorkspaceMemberEditor`) reuses the same `EditorPanel` the local demo
   editor uses, not a second implementation.
4. **Organizer and member workspace — done.** `/workspace` (list, create),
   `/workspace/towns/[townId]` (settings, publish/unpublish, members,
   invites), `/workspace/towns/[townId]/members/[memberId]` (edit),
   `/workspace/towns/[townId]/preview` (draft preview through the public
   renderer). Empty/loading/error states included; no invented activity.
5. **Invitations — foundation done, not email-verified.** A separate
   `town_invitations` table and three RPCs (create/revoke/accept), token
   stored only as a hash, single-use, expiring, email-matched on accept. A
   generated copyable link stands in for email delivery per this phase's
   explicit scope. Acceptance was exercised at the SQL/grant level, not
   through a real second authenticated browser identity.
6. **Assets — not started.** Image upload, file type/size validation,
   ownership policies, alt text and deletion. Generated demo artwork
   remains the offline sample.
7. **Private alpha hardening — not started.** Audit events for destructive
   changes, rate limits, backups, error reporting.

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

The project is linked to the hosted Sidewallk Supabase project. Three
migrations are applied: `202610170001_phase2b_core.sql` (towns, members,
memberships, RLS), `20261020010126_revoke_anon_rpc_execute.sql` (a grant-
hygiene fix — four SECURITY DEFINER functions carried an accidental default
EXECUTE grant to `anon` that the core migration's own revoke never reached;
see the migration file for how that was found and confirmed), and
`20261020010413_add_town_invitations.sql` (the invitation foundation below).

The full organizer loop is implemented and wired to Postgres: sign in, create
a draft town, add a member, edit its profile/building/room through the
existing editor, preview the draft, publish, view the public `/t/[slug]`
page, unpublish, invite a collaborator by email with a copyable one-time
link, and accept that invitation. The repository/permission logic (row
conversion, invalid-JSON handling, `authorizeTownAction`, Supabase-not-
configured fallback) has 127 passing unit tests. The RLS/grant boundary was
probed directly against the live database (role privilege checks, regex and
hashing behavior, `--dry-run` before every migration).

What has **not** been exercised is the end-to-end flow through a real signed-
in browser session: completing it requires a human to receive and click a
magic-link email, since sending one to an address not explicitly supplied by
the human tester is out of scope for this agent. Everything up to that point
— sign-in request, the `next`-path round trip, every authenticated route's
redirect behavior when signed out — has been verified with headless Chrome
driven over the DevTools protocol (zero console errors, zero horizontal
overflow, zero sub-44px touch targets at 1440×900 and 390×844 across every
new route). The local sample editor (open, edit, save, reload, reset) was
re-verified the same way after being refactored to share `EditorPanel` with
the production editor.
