# Architecture and conventions

## Phase 2B: private-alpha product slice

`PHASE2B.md` defines the product slice. `Town` now carries a stable slug and
`draft`/`published` state. `lib/access.ts` is the shared optimistic permission
model for organizer, member and visitor behavior. It is suitable for showing
or hiding controls, but it is not the security boundary: authenticated server
data access must repeat the check, and Postgres row-level security enforces it
at the database (`supabase/migrations/202610170001_phase2b_core.sql` for
towns/members/memberships, `20261020010126_revoke_anon_rpc_execute.sql` for a
grant-hygiene fix, `20261020010413_add_town_invitations.sql` for invitations).

Production roles are town-scoped. A member role is tied to one member building;
organizers control town-wide actions. Invitations are not active access until
accepted. Keep auth provider code and database clients out of scene, room and
reusable UI components.

### Data access boundary (`lib/repository/`)

- `rows.ts` — raw Postgres row shapes (`TownRow`, `MemberRow`,
  `TownMembershipRow`), kept deliberately separate from the domain model in
  `lib/types.ts` since a row is untrusted input until converted.
- `convert.ts` — pure `convert*` functions turning a row into a `Member`/
  `Town`, using validators shared with `storage.ts` (see `lib/validation.ts`
  below) so a local-storage override and a database row can never disagree on
  what counts as valid. A structurally broken building/room/category drops
  that member entirely rather than crashing; a merely-invalid sub-field
  (colour, sign text) falls back to a safe default and keeps the rest. The
  inverse `*ToJson` functions serialize a domain object back to the jsonb
  shape the columns expect, used on every write.
- `public.ts` — unauthenticated-safe reads for the public `/t/[townSlug]`
  route, wrapped in React's `cache()`. Returns `null` for every "don't show
  this" case alike (not configured, not found, not published, a DB error) —
  the route cannot leak which one it was.
- `workspace.ts` — server-only authenticated reads and writes
  (list/create/update/publish/unpublish/add-member), each re-deriving the
  viewer's membership from a freshly queried row (never a client-supplied
  role) and gating through `authorizeTownAction` before touching anything.
  Every mutation takes an `expectedVersion` and returns a distinct
  `{reason: "conflict"}` result instead of silently overwriting a newer row —
  the one explicit persistence adapter instead of scattering Supabase calls
  through visual components.
- `invitations.ts` — thin wrappers around the three invitation RPCs; all
  authorization lives in the database functions and RLS, not here.

`lib/validation.ts` holds the field-level validators (`isHexColor`,
`validateLink`, `validateProp`, slug helpers) shared by `storage.ts` (local
overrides) and `repository/convert.ts` (database rows) — extracted so the two
untrusted-input paths can't drift.

### Production routes

- `/t/[townSlug]` and `/t/[townSlug]/b/[memberSlug]` — public, published-only.
  Render through the *same* `Neighborhood`/`ListView`/`RoomScene` components
  the sample town uses (via `PublicTownView`), not a fork. A missing, private
  or broken town all resolve to the one `not-found.tsx` state via
  `next/navigation`'s `notFound()`.
- `/workspace` — authenticated; lists towns with an *active* membership only,
  sign-out Server Action, draft-town creation.
- `/workspace/towns/[townId]` — organizer settings/publish/members/invites, or
  a member's own assigned building, gated by `getWorkspaceTown`'s role.
- `/workspace/towns/[townId]/members/[memberId]` — the production editor.
  Reuses `EditorPanel` (now a pure, props-driven component — see below)
  through `WorkspaceMemberEditor`, which merges each patch with
  `applyOverride` (the same merge local overrides use) and sends it through
  `updateMember`'s version check; a stale version surfaces as a conflict
  banner with a reload prompt, never a silent overwrite.
- `/workspace/towns/[townId]/preview` — reuses `PublicTownView` again (now
  parameterized with `getMemberHref`/`homeHref`/`draftBanner` instead of a
  second implementation) so an organizer previews a draft through the exact
  renderer a visitor will eventually see.
- `/invite/[token]` — single explicit "Accept invitation" action; no preview
  of the invitation's contents beforehand, since the only read path is the
  single-use accept RPC itself.

### Editor: local demo vs. production

`EditorPanel` (`components/editor/EditorPanel.tsx`) no longer reads
`useTown()` itself — it takes `onPatch`/`saveStatus`/`onReset`/`sampleMode` as
props, so it has no opinion on where a patch goes. `LocalEditorPanel` restores
the original local-storage wiring (the sample town's only call site,
`b/[memberId]/page.tsx`, is unchanged). `WorkspaceMemberEditor` is the
Supabase-backed counterpart. Same editor, same `RoomScene`, two different
persistence adapters underneath — do not add a third, different editor.

A `sampleLabels`/`sampleBadge` prop (default `true`) on `Neighborhood`,
`NeighborhoodBuilding` and `ListView` keeps "sample member" wording scoped to
the one local demo town — a real organizer's published content must never
pick it up.

The project is on Next.js 16, React 19 and Vitest 5. Next 16 already isolates
development and production output, so the earlier custom `distDir` split is no
longer needed. Vitest uses Vite 8's Oxc JSX transform in `vitest.config.mts`.

## Visual reset

`Neighborhood.tsx` owns camera/navigation state. `NeighborhoodArt.tsx` draws
original SVG ground and buildings using the shared `iso()` projection.
`lib/neighborhood.ts` maps stable building positions onto two rows without
changing persisted models. `Brand.tsx` provides the shared compact
wordmark/navigation link. RoomScene retains individual editable props,
content dialogs and local persistence; it adds a projected window, timber
floor and HTML content buttons for small screens. The editor opens in the
existing focus-trapping Dialog. The public visitor UI has no account or
payment workflow.

## Phase 2A: visual completeness

Every building now renders through `ExteriorFacade` (facade art per
`ExteriorKind`), a kind-specific `Roofline`, a kind-specific `SignFixture`
(hanging bracket vs. flush plaque) and a kind-specific `StreetDetail`
(flower box, bistro set, sidewalk easel or placard post) — all in
`NeighborhoodArt.tsx`. Height is drawn from a kind-appropriate range with a
per-building `seededRandom` jitter, and body/trim colour come straight from
the member's own `Building` fields — no more hardcoded palette cycling. The
legacy single-row `Street`/`Building`/`StreetGround` renderer this
superseded has been deleted; `ExteriorFacade.tsx` and `RoofGable.tsx` are the
pieces of it that survived, now used by `NeighborhoodArt`.

`TemplateDecor.tsx` holds fixed, non-persisted set dressing keyed only by
`room.template` and `room.gridWidth`, so it applies to every member of a
template uniformly: a ceiling light track and a print/work corner for
gallery rooms (Papermoth keeps its own richer corner, `PapermothStudioDecor`,
instead of the generic one), a tool pegboard and materials crate for studio
rooms, and a counter plus packaging for shop rooms. Placements were checked
against every current member's demo prop layout for their template and sit
in the floor strip that layout leaves clear. `RoomProp.tsx`'s `enhanced` flag
(renamed from the old Papermoth-only `richDecor`) now applies the
larger-artwork, fuller-plant treatment to every gallery room, not one member.
Contact shadows under floor props are no longer gated to one room either.

Town ⇄ interior transitions are plain CSS mount-in animations (`stage-in` on
the town page, `room-in` on a building page) plus a pressed-state scale on
map buildings — no animation library, and all zeroed by the existing global
`prefers-reduced-motion` rule.

`SPEC.md` is the scope. `AGENTS.md` is the working agreement and the rules you
must not break. This file is the technical shape of the project.

Milestone 1 is built on the `claude` branch, matching the architecture below.
Keep this file accurate as the code grows — if you deviate, update this file
in the same commit and say why. `prop-registry.ts`, `search.ts` and
`room-edit.ts` were added to `lib/` beyond the original suggested layout;
they follow the same "plain function over hook" rule and are documented
inline.

## Stack

| Choice | Decision | Why |
| --- | --- | --- |
| Framework | Next.js, App Router, TypeScript, `src/` directory | Spec |
| Styling | CSS Modules + one global token sheet | Small and consistent; no utility-class framework needed for a scene-driven app |
| Artwork | Inline SVG generated by React components | Props must stay individually addressable and editable; a flattened image cannot be |
| Rendering | Plain SVG, no engine | Add PixiJS only if profiling shows SVG cannot hold frame rate. Record the reason here if you do |
| Persistence | Versioned `localStorage` behind pure functions | Testable without a DOM, replaceable by a backend |
| Tests | One lightweight runner (Vitest is fine) over pure logic | Keep dependencies minimal |

Do not add a state library, a component library, an animation library or an
icon package without a concrete need written down here.

## Suggested layout

```
src/
  app/
    layout.tsx            TownProvider, fonts, metadata
    page.tsx              the town: street + list view
    b/[memberId]/page.tsx deep link straight to one building
    globals.css           design tokens and shared control styles
  components/
    scene/                isometric primitives shared by street and rooms
    town/                 street scene, buildings, props, controls, list view
    interior/             room shell, templates, room props, content panel
    editor/               editor panel and its controls
    ui/                   dialog, button, field — reusable, no domain knowledge
  lib/
    types.ts              the data model
    iso.ts                projection + colour helpers
    demo-data.ts          the sample town
    storage.ts            parse / validate / merge / persist
    store.tsx             React context over the override layer
    links.ts              URL protocol allowlist
```

Keep the four concerns the spec names genuinely separate: **scene rendering**,
**room content**, **editor state**, **reusable UI**. A component in `scene/` or
`ui/` must not import from `lib/store`.

## Data model

Stable string IDs on every entity: town, member, building, room, prop. IDs are
the only thing linking them, so a backend can replace local persistence without
touching rendering.

```
Town
  └── Member            id, name, category, tagline, description, action
        ├── Building    exterior kind, position on the street, colours, sign
        └── Room        template, palette, grid size, props[]
              └── RoomProp  id, kind, grid x/y, tone, optional content
```

Two rules that keep the editor honest:

- A prop registry declares, per kind, whether it is a **display** prop (can
  carry content) or **decor**, and whether it mounts on the **floor** or a
  **wall**. The editor reads that registry instead of special-casing kinds, so
  it never offers a title field on a pot plant.
- Content lives on the prop, not in a parallel list. Moving a prop moves its
  content with it.

## Editor state: override layer

The demo town is immutable. Edits produce a separate override map keyed by
member id, and **only that map is persisted**.

```
DEMO_TOWN  +  { [memberId]: MemberOverride }  ->  rendered town
```

This is why it matters:

- "Reset to demo" is deleting a key, not reconstructing anything.
- The persisted shape is already the shape a backend would store, one record
  per member.
- A corrupt save loses edits, never the town.

The first time a prop is edited, seed the override's prop list from the demo
arrangement, then treat it as the full list from then on.

## Persistence rules

- Namespace and version the key, e.g. `sidewallk.town.v1`, and refuse to read a
  save whose version does not match.
- Validate field by field on load. Drop individual bad props rather than the
  whole room; drop the whole save only if it is unparseable or the wrong
  version.
- Re-validate stored URLs on load. A link that was saved before the allowlist
  tightened must not render.
- Wrap every `localStorage` call in try/catch. Private mode, blocked site data
  and quota errors must surface as "could not save", never as a crash.
- Read storage in an effect after mount, never during render, or the server and
  client markup will disagree and hydration will fail.

## Isometric conventions

One projection for the whole product, so the street and the interiors read as
the same world. True isometric: ground axes at 30°, so a unit step is
`(cos30, sin30)`.

- `iso(u, v, z)` is the only place the projection is defined.
- Every box derives its top and side faces from one body colour by lightening
  and darkening, so light always comes from the same direction.
- Flat 2D drawings (facades, signs, posters) are authored in ordinary
  coordinates and mapped onto a face with a matrix transform. Do not hand-place
  facade detail in isometric space.
- Draw back to front. Sort by depth rather than reaching for `z-index`.
- Scenery that should look varied but stay stable across renders uses a seeded
  generator, never `Math.random()` at render time.

## Accessibility

Not a final pass — build it in.

- The map is one focusable surface with arrow-key panning and `+`/`-` zoom.
  Individual buildings are focusable elements inside it with visible focus.
- The list view is a real alternative, not a fallback: same members, same
  search, fully usable without ever touching the map.
- Dialogs and detail panels trap focus, close on Escape, and return focus to
  whatever opened them.
- Editor props are moved with buttons and numeric inputs. Dragging, if added at
  all, is an extra on top of controls that already work without it.
- Respect `prefers-reduced-motion` for camera flights, transitions and traffic.
- Minimum 44px touch targets. Check contrast against the actual token values,
  including on user-chosen room colours — derive readable ink from luminance
  rather than assuming dark text works.

## Conventions

- Comments explain *why*, not *what*. Do not narrate the code.
- No `any`. No non-null `!` to silence the compiler.
- Prefer a plain function in `lib/` over a hook when there is no React state —
  it is testable without a renderer.
- Keep demo copy specific and plausible, written as a real member would write
  it, but always visibly labelled sample.
