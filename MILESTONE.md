# Milestone 1 — visitor walks the street and steps inside

## Visual reset — 15 October 2026

- Rebuilt the visitor shell: compact brand/navigation, search, category
  filters, an accessible directory, and a selected-member entry panel.
- Replaced the long diagonal street with eight storefronts across two rows,
  paths, a crossing, square, trees, varied roofs and planted frontage.
- Added camera pan/zoom/recenter, filtered-result camera framing, a drag
  threshold to separate navigation from clicks, and keyboard camera controls.
- Rebuilt the interior page around a visitor information rail and a larger
  cutaway. Added a window, projected timber floor, HTML content buttons and
  a modal editor using the existing focus-trapping Dialog.
- Corrected the print workbench into a raised tabletop on legs.
- Kept the existing member/content models, URL validation, overrides and
  persistence. This preview uses port 3002 and its own browser storage origin.
- Typecheck, lint and production build passed. All 54 existing tests passed
  using Vitest's programmatic runner with config bundling bypassed and cache
  disabled (the ordinary runner hits filesystem restrictions in this managed
  workspace; the reused dependency folder is read-only).
- Chrome desktop was visually inspected. Opening an SVG artwork was verified
  through the live accessibility tree. Chrome's actual responsive toolbar
  showed 390 × 844; the gallery layout and modal editor were inspected there.

Limits: this remains local sample content. The redesign was built and checked
in a separate working copy based on bbaf9fc. No deployment was performed.
A full phone visitor flow, drag/scroll behavior,
focus restoration and refresh persistence were not manually reverified in
this pass. Small-screen content has separate 44px HTML buttons; map labels
can still be small at the overview zoom. More template-specific furnishing
and unique architecture remain possible future design work.

Tick an item only when it has actually been run, not when the code looks
right. Add a line under **Limitations** for anything that is partly done, and
say so in the final summary rather than leaving it implied.

## Town

- [x] Eight demo buildings on the street
- [x] At least four distinct exterior designs (gallery-front, studio-front,
      shop-front, cafe-front, each with distinct window/door/awning facades)
- [x] Smooth pan and zoom with obvious controls (keyboard arrows, on-screen
      zoom buttons, an on-screen directional pad, and drag-to-pan via Pointer
      Events — mouse and touch both verified in browser)
- [x] A search that narrows the map to one or two results now re-centers and
      zooms the street to bring them into view, instead of leaving them
      wherever the street happened to be panned (verified in browser:
      searching "Needle" brought the previously off-screen building into
      view with its highlight visible; clearing the search snaps back to the
      full default view)
- [x] Buildings are clickable and their names are readable
- [x] Search by member name and category
- [x] Accessible list view showing the same members
- [x] Direct link to an individual building (`/b/[memberId]` route; interior
      content itself is still a placeholder — see Limitations)

## Interiors

- [x] Gallery template — framed work with title, description, project link
- [x] Studio template — services, portfolio items, booking or contact action
- [x] Shop template — product displays linking to external product pages
- [x] Each room is a coherent arrangement, not scattered props
- [x] Clicking a content object opens a readable detail panel
- [x] Clear navigation back to the street
- [x] Polished transition between street and interior (fade/rise on mount,
      skipped under `prefers-reduced-motion`)

## Demo editor

- [x] Edit member name, description, category and action link
- [x] Select an interior template
- [x] Change supported room colours
- [x] Add, move and remove furniture and decor
- [x] Attach content to display objects
- [x] Every control usable without dragging (buttons and native inputs only)
- [x] Changes preview immediately (verified in browser: typing a new name
      updates the page heading live)
- [x] Changes survive a refresh (verified in browser: renamed member and a
      moved prop both survived a full page reload)
- [x] Reset returns to the original demo data (verified in browser)
- [x] Editor is visibly labelled a local demo ("Local demo editor" badge plus
      an explicit "changes save to this browser only" note)

## Responsive and accessible

- [x] Works at phone width (verified in browser at 500×755 and 375×812 target
      sizes: street, list, building, editor and content dialog all reflow to
      a single comfortable column)
- [x] List view fully usable without the map
- [x] Keyboard navigation throughout, with visible focus (verified in
      browser: Tab reaches the skip link, search, view toggle, map, and each
      building in turn, each with a visible focus ring; Enter activates a
      focused building)
- [x] Dialogs trap focus, close on Escape, restore focus on close (verified in
      browser: Escape closes the content panel and focus returns to the prop
      that opened it)
- [x] `prefers-reduced-motion` respected (global CSS rule collapses all
      animation/transition durations; the street pan/zoom and the page-entry
      transition both use plain CSS transitions covered by that rule)
- [x] Contrast and touch targets checked (verified programmatically in
      browser, see Checks below) — found and fixed a real AA contrast
      failure and a real touch-target failure, see Limitations

## Demo honesty

- [x] Sample members and sample content clearly labelled ("Sample member" /
      "Sample artwork for this demo" / "Sample catalogue item" badges
      throughout)
- [x] No invented visitor counts, testimonials or activity
- [x] Outbound demo links all use the `.example` TLD
- [x] Roles described as future product roles, not real authorization (editor
      is explicitly labelled a local-only demo with no real authorization)

## Robustness

- [x] Missing or partial content renders without crashing (verified in
      browser: a newly added display prop with empty content renders inert,
      no crash; also covered by the "degrades gracefully" unit tests in
      `storage.test.ts`)
- [x] Corrupt or wrong-version local save falls back to demo data (verified
      in browser: set `localStorage['sidewallk.town.v1']` to invalid JSON,
      reloaded, app rendered demo data with no console errors; also unit
      tested in `storage.test.ts`)
- [x] Only `http:`, `https:` and `mailto:` links are rendered (verified in
      browser: entered a `javascript:` URL into the editor's action link
      field — the action button disappeared rather than rendering the unsafe
      href; also unit tested in `links.test.ts`)

## Checks

- [x] Unit tests for state and persistence behaviour (44 tests: links, search,
      storage/overrides, room-edit — including dedicated regression coverage
      for persistence round-trips through real `loadOverrides`/
      `saveOverrides` calls, `removeOverride`/reset semantics, and room
      template selection via `mergeOverride`/`applyOverride`)
- [x] Type checking passes (`tsc --noEmit`)
- [x] Lint passes (`eslint .`, zero warnings)
- [x] Production build passes (`next build`)
- [x] Full visitor flow driven in a real browser at desktop width (street →
      search/list → building → content panel → action link → editor)
- [x] Full visitor flow driven in a real browser at phone width
- [x] Editor driven in a real browser (member fields, props add/move/remove,
      content fields, reset, persistence across reload)

## Limitations

- Building silhouettes share one box shape; the four exterior kinds differ by
  facade (window/door/awning arrangement) and colour, not roofline.
- A newly added display prop starts with empty content and is not clickable
  in the room until the editor's title/description fields are filled in —
  confirmed this degrades gracefully (renders, just inert) rather than
  crashing.
- The phone-width check used the narrowest viewport the available browser
  tooling could reach (~500px, then confirmed down to 375px via a fresh tab)
  rather than a real device; layout uses relative units and `flex-wrap`
  throughout so it should hold below that, but it was not pixel-checked on
  an actual phone.
- Contrast/touch-target review was a targeted programmatic check (WCAG
  contrast math and `getBoundingClientRect` over every interactive element)
  rather than a full manual accessibility audit with assistive tech.

## Visual redesign (Papermoth Press)

Scoped to one building — Papermoth Press, its gallery interior, and the
shared street composition — per the plan to finish one building before
extending the redesign across the town. No feature, navigation or
persistence changes.

- [x] "press-front" exterior with a true-isometric gable roof, recessed
      window/entrance detail, flower box and bracket-hung sign (Papermoth
      only; every other building keeps its original flat-box exterior)
- [x] Gallery interior: each framed-work prop renders an original,
      deterministic riso-print motif (`generateArtwork`, seeded by prop id)
      instead of a flat grey rectangle; pedestal, plant, bench, rug and lamp
      are kind-specific shapes instead of bare boxes
- [x] Paved street with kerb line and seeded tree/lamp-post scenery between
      buildings, replacing the flat gradient backdrop
- [x] Fixed two rendering bugs found in review (both shared across gallery,
      studio and shop, since `RoomPropView`/`ArtworkFace` are one component
      used by every room template, not duplicated per template):
      - `ArtworkFace` rendered rectangles as `x - w/2` (centre-anchored), but
        three of the four generated motifs supplied left-edge `x` values, so
        every Papermoth frame had a shape drawn outside the mat. Standardized
        `ArtworkShape.x`/`y` to always mean the shape's bounding-box centre
        and corrected the affected motifs' values accordingly; also added a
        unique, stable (prop-id-derived) `clipPath` around each frame's
        artwork so any future out-of-bounds shape is clipped to the mat
        instead of bleeding onto the wall.
      - The pedestal's cap `IsoBox` had no `z0`, so it rendered at floor
        level instead of on top of the column, and the book prop sat on an
        invisible surface. Added `z0={columnHeight}` so the cap stacks on
        the completed column.
      - Verified in a real browser (desktop width) at `/b/papermoth-press`
        (gallery), `/b/linden-and-kiln` (studio) and `/b/harbor-light-goods`
        (shop): all three Papermoth frames now show artwork fully inside the
        mat, the studio's framed-work renders correctly too, and pedestals
        in both the gallery and the shop show the cap sitting visibly on top
        of the column with the book resting on it. Also reopened the editor
        on Papermoth Press to confirm the fix didn't disturb editor state.
- [x] Unit tests (54), `tsc --noEmit`, `eslint .` and `next build` all pass
      after the fixes

### Limitations

- The redesign and both bug fixes were verified only at desktop viewport
  width in a real browser. Unlike Milestone 1's visitor flow (phone-width
  checked down to 375px, see above), this redesign has **not** been checked
  at phone width at all — the gable roof, recessed facade detail, artwork
  frames and new street scenery could reflow or clip differently on a
  narrow viewport, and that has not been confirmed either way.
- The redesign covers Papermoth Press only; the other seven buildings still
  use the original flat-box exterior and bare-box interior props.

## Visual quality pass 2 (street composition + Papermoth interior)

Scoped the same way as the first redesign pass: the street's shared
composition and Papermoth Press's interior only. No new product features, no
other building's exterior or interior touched, no change to the override
system, persistence, or editor logic.

### Street composition

- [x] Inspected the initial view and Reset View (they share one `DEFAULT_PAN`
      constant, so fixing one fixes both) and measured the actual rendered
      geometry in the browser via `getBBox()` on every building and its name
      label, rather than eyeballing it.
- [x] Found the previous default already clipped Papermoth's own name label
      on the left edge (`pan.x = 100` put part of "Papermoth Press" at
      viewBox x < 0), on top of leaving roughly 39% of the frame as empty sky
      above the rooflines.
- [x] Changed `DEFAULT_PAN` in `Street.tsx` from `{x: 100, y: 308}` to
      `{x: 160, y: 130}`, chosen by measurement, not feel: at this pan, the
      first three buildings' name labels are each either fully inside the
      1000×560 viewBox or fully outside it — none straddle an edge — and the
      top sky margin drops to roughly 7% of the frame height. A fourth
      building (Marrow Coffee Roastery) is intentionally left peeking in at
      the bottom-right, roofline only, well before its own label would start,
      signalling there's more to pan to.
- [x] Re-verified after the change: re-ran the same `getBBox()` measurement
      (not just a visual check) and confirmed zero straddling labels across
      all eight buildings, then confirmed visually with a screenshot, then
      panned away and clicked Reset View to confirm it returns to the same
      framing.
- [x] Left `DEFAULT_PAN.x`/`.y` as the single source of truth used by mount,
      Reset View, and the search "show everyone" branch, so this fix applies
      everywhere that state is used, not just one of the three.

### Papermoth interior refinement

All of this is gated by a `richDecor` flag computed in `RoomScene` as
`memberId === "papermoth-press" && room.template === "gallery"` — threaded
down as an optional prop to `RoomPropView` — so every other member's room
renders through the exact same code path, unchanged. Confirmed this by
loading Birch & Vellum Studio (the other `gallery`-template member) after the
change: original frame size, original five-leaf plant, original wall tone,
no workbench/storage/shadows.

- [x] **Intentional arrangement.** Kept the existing three-frame gallery wall
      and the rug/pedestal/bench viewing nook, and added a "print studio"
      corner on the right (a workbench below the third frame, a flat-file
      storage unit behind it) so the one room reads as both a gallery and a
      working studio, matching the member's own description. Moved the lamp
      from `(5, 2)` to `(5, 3.3)` — its old spot is now standing inside the
      new storage unit.
- [x] **Artwork scale.** Papermoth's framed-work pieces render larger under
      `richDecor` (width 0.78→0.9 of the footprint, height 0.85→1.16 units)
      than the shared default used by every other gallery/studio room.
- [x] **Richer plant.** The existing editable plant prop gets a fuller
      canopy (5→9 leaf clusters, two-tone pot) under `richDecor`; unchanged
      everywhere else.
- [x] **Workbench, print storage, books.** New fixed (non-editable,
      non-persisted) set dressing in `PapermothStudioDecor.tsx`: a workbench
      with a fanned stack of proof sheets, a brayer and an ink tin; a
      three-drawer flat-file storage unit with printed-sheet edges peeking
      out; two book stacks (workbench and storage top); an accent plant.
      Nothing here is a `RoomProp` — it has no id, isn't in `room.props`,
      can't be selected, moved or persisted, and has no effect on the
      override system.
- [x] **Material contrast.** Papermoth's own wall tone (`#cdbfa3`) replaces
      the shared `GALLERY_WALL` constant it used to reuse, so its warm wood
      furniture and riso inks read against a deeper background than Birch &
      Vellum's lighter gallery wall. Also added `#cdbfa3` to
      `ROOM_PALETTE_OPTIONS` — caught in testing that without this, the
      editor's colour-swatch row showed *no* swatch as selected for
      Papermoth (its colour wasn't one of the eight presets), which would
      have read as a broken control; it's now a selectable preset for every
      member, though only Papermoth defaults to it.
- [x] **Contact shadows, consistent lighting.** Every floor prop in
      Papermoth's room (pedestal, bench, plant, lamp; rug is flush with the
      floor and skipped) now sits on a soft, low-opacity ellipse drawn in one
      pass before any prop, so a shadow can never paint over the object
      casting it. The fixed decor pieces share the same shadow recipe.
- [x] **Clickable affordance.** Added a `:hover` brightness filter
      (`RoomProp.module.css`) to every interactive room prop, matching the
      existing `.button--primary:hover` pattern in `globals.css` and
      automatically covered by the global `prefers-reduced-motion` rule. This
      one change applies to every room, not just Papermoth's — it only
      affects interaction feedback on hover, not any room's static
      appearance at rest, so it was judged safe outside the Papermoth-only
      scope. Keyboard focus (existing focus-ring circle) and touch (existing
      44px+ invisible padding) affordances were already in place and were
      re-verified, not changed.
- [x] Found and fixed a real bug while building the decor: `PrintStack` and
      `BookStack` were initially passed already-`iso()`-projected screen
      coordinates but treated them as world coordinates and projected them
      again, placing both off-screen. Caught by actually looking at the
      rendered result (no books or proof sheets visible), not by code
      review. Fixed by having both take a plain screen-space anchor point,
      matching the existing `PictureLight` convention.
- [x] Re-measured touch targets in the browser after every change
      (`getBoundingClientRect` over every interactive element): 0 of 9 on
      Papermoth's page measure under 44px in either dimension, same as
      before the frames got larger.
- [x] Opened the editor on Papermoth Press after all changes: member fields,
      template/colour pickers (with the new swatch correctly shown pressed),
      and the props list all still render and respond; closed it again with
      no change to this flow.
- [x] Unit tests (54), `tsc --noEmit`, `eslint .` and `next build` all pass.

### Limitations

- **Mobile viewport could not be verified.** `resize_window` reports success
  but has no actual effect in this environment — confirmed by resizing to
  390×844 on two independent tabs and reading `window.innerWidth/innerHeight`
  back afterward both times; the browser window stays pinned to the host
  display's full resolution regardless of the requested size. This is a
  repeat of a limitation hit in the prior session, not something introduced
  by this work. Everything above (street framing, Papermoth interior, touch
  targets, editor) was verified at desktop width only. To check phone width
  yourself: open `http://localhost:3000` in Chrome, open DevTools
  (`Ctrl+Shift+I`), toggle the device toolbar (`Ctrl+Shift+M`), and pick a
  ~390px preset; or, on a phone on the same network, visit
  `http://192.168.1.44:3000` (the dev server's printed LAN address — confirm
  it's still current in the terminal running `next dev`, as it can change
  with the host's network).
- ~~The print-studio corner's "intentional arrangement" is eyeballed for
  this one 6×5 room; it was checked for footprint overlaps by hand (grid
  math), not by an automated collision check, so a future edit to
  Papermoth's prop positions via the editor could visually collide with the
  fixed decor without the editor knowing (the decor isn't registry-aware,
  by design, since it isn't an editable prop).~~ **Resolved** — see "Fix
  Codex finding: Papermoth decor collision safety" below; `PapermothStudioDecor`
  now resolves its workbench, storage and accent plant against the room's
  live props through the same `findFreeLayout` geometry every other
  template decor piece uses.
- Reset-to-demo-data and prop add/move/remove were not re-exercised end to
  end this session (only editor *open* and the colour swatch were checked)
  — those flows weren't touched by this work and were verified in the prior
  milestone, but that verification wasn't repeated here.

## Phase 2A — visual completeness

Builds on `e6384d4`, the first Phase 2A pass (wired real per-exterior-kind
facades/rooflines into the live map renderer and added template-level
interior decor — see `CLAUDE.md`'s "Phase 2A" note for the architecture).
This entry covers the Codex-flagged follow-up fixes on top of that commit.
Supersedes two standing limitations recorded above: Milestone 1's "building
silhouettes share one box shape" (now one roofline per exterior kind) and
the visual-redesign pass's "other seven buildings still use the original
flat-box exterior" (now every building renders through `ExteriorFacade`).

### Architectural subvariants per building

- [x] Every building gets a deterministic 0/1 `variant` from
      `facadeVariants()` (`lib/neighborhood.ts`), assigned by each member's
      rank among others sharing its exterior kind in stable town order —
      not a hashed coin flip, so two buildings of the same kind are
      *guaranteed* to land on different variants rather than occasionally
      colliding on the same look.
- [x] For press-front, studio-front, cafe-front and gallery-front (each
      already left-right asymmetric), variant 1 mirrors the whole facade
      plus its awning, roof vent box, sign-bracket side and street-detail
      position — a real geometric reflection, not a recolour.
- [x] shop-front's default layout is left-right symmetric, so mirroring it
      would be a visual no-op — it gets a second, hand-authored layout
      instead: a single large bay/display window on one side with the door
      and a narrow accent window grouped on the other, in place of the
      default's twin flanking windows.
- [x] Every building also gets a small, independent per-building roof-pitch
      jitter (~±15% on rise/overhang, seeded off the member id) so even two
      buildings sharing both kind and variant would still carry a slightly
      different roofline.
- [x] Verified in a real browser (desktop, via headless Chrome screenshots —
      see Checks) at the town overview: Linden & Kiln vs. Needle & Groove
      (studio-front) show a mirrored door/window side and a mirrored roof
      vent box; Harbor Light Goods vs. Thistle & Thread (shop-front) show
      genuinely different window/door massing, not a mirror of the same
      shapes; Marrow Coffee Roastery vs. Salt City Letterpress (cafe-front)
      show a mirrored door/porthole/window side and a mirrored bistro-table
      position.
- [x] Unit tests (`neighborhood.test.ts`): two buildings sharing a kind
      always get different variants, checked against the real demo town's
      actual duplicated kinds (not only a synthetic fixture); a kind that
      appears once still gets a variant; assignment is stable across
      repeated calls and depends on list order, not id or position hashing.

### Collision-safe template decor

- [x] Extracted the fixed gallery/studio/shop set dressing's placement into
      pure, testable geometry (`lib/template-decor.ts`): `findFreeLayout`
      for floor rects, `findFreeWallSpan` for wall spans. Both are
      recomputed from the room's *current* `props` on every render, so an
      edited room is never stale.
- [x] Each decor piece tries a short, kind-appropriate list of fallback
      spots (the original position, then 2–3 alternates) in priority order
      and renders nothing at all if every candidate collides with an
      existing floor or wall prop — decor never draws on top of an editable
      prop.
- [x] The gallery work corner and the studio crate/pegboard resolve
      independently of each other (one can fall back or disappear without
      taking the other down); the shop counter and its two packaging boxes
      resolve as one composite unit, so they only ever appear together.
- [x] Fixed a bug caught in review before it shipped: the shop packaging
      boxes' resolved floor footprint (width × depth) was being overwritten
      by the decor-only 3D stack height, which would have drawn each box
      with the wrong depth. Separated the two numbers.
- [x] Fixed a formula bug caught by the first test run: the generalized
      studio pegboard span was centered on the room's true midpoint, which
      overlaps the demo studio layout's first wall shelf; corrected it to
      match the original, verified-safe gap just right of centre.
- [x] Unit tests (`template-decor.test.ts`, 15 tests): pure geometry tests
      for `findFreeLayout`/`findFreeWallSpan` (first-fit, fallback,
      all-candidates-occupied → null, out-of-bounds candidates skipped,
      composite layouts require every rect clear, wall props never block
      floor decor and vice versa), plus scenarios run against the **real
      demo town** through the **real** `moveProp`/`createProp` editor
      functions: dragging an existing prop onto a decor piece's default
      spot, and creating a brand-new prop and dragging it there. Confirmed
      by temporarily logging actual results (not just asserting
      non-equality) that these scenarios genuinely exercise both outcomes
      the spec asked for — falling back to a different, verified
      non-overlapping spot, and full omission when every candidate is
      blocked — rather than passing vacuously.
- [x] Re-verified in a real browser that the untouched demo rooms render
      pixel-identical to before this refactor (Harbor Light Goods'
      counter/merchandise, every gallery/studio room) — each pure
      function's first candidate matches the previous hardcoded position
      for every current member.

Scope note: this pass covered the generic `GalleryWorkCorner`,
`StudioWorkCorner` and `ShopCounterDecor` pieces in `TemplateDecor.tsx`.
Papermoth Press renders through its own separate `PapermothStudioDecor`
component instead (see `isPapermoth` in `RoomScene.tsx`), which was **not**
yet collision-safe at the end of this pass — a gap Codex caught and that is
fixed in "Fix Codex finding: Papermoth decor collision safety" below.

### Checks

- [x] Unit tests: 74 total (20 new — 5 in `neighborhood.test.ts`, 15 in
      `template-decor.test.ts`), all passing.
- [x] `tsc --noEmit` passes.
- [x] `eslint .` passes, zero warnings.
- [x] `next build` passes.
- [x] Visual verification: the `claude-in-chrome` browser extension was not
      connected in this session (as in the prior Phase 2A pass). Drove
      headless Chrome directly instead, over the DevTools protocol:
      `Page.captureScreenshot` with `Emulation.setDeviceMetricsOverride` for
      accurate 1440×900 and 390×844 rendering, plus a scripted sweep using
      `Runtime.evaluate` to measure `document.documentElement.scrollWidth`
      against `window.innerWidth` and `getBoundingClientRect()` on every
      `button`/`[role="button"]` element, across all 8 member pages at both
      widths: zero horizontal overflow, zero sub-44px touch targets.

### Limitations

- shop-front's two variants are both hand-authored, not generated, so a
  hypothetical third shop-front member would reuse one of the two existing
  looks rather than getting something new — fine for the current 8-member
  town, worth knowing before adding a 9th shop.
- The per-building roof-pitch jitter (~±15%) is a subtle, side-by-side cue;
  on its own it does not read as "a different roofline" the way the
  variant mirroring or shop's alternate layout does — it's additive on top
  of those, not a substitute for them.
- gallery-front and press-front each have only one member in the current
  demo town, so their mirror-variant code path has no second same-kind
  building to visually compare against yet. Verified by inspecting the
  mirrored geometry directly, and by the fact that studio/shop/cafe use the
  identical mechanism — not by a second gallery/press building actually
  existing.
- TemplateDecor's fallback search tries a small, fixed list of candidate
  spots (3–4 per piece), not an exhaustive scan of the grid; a room edited
  into an unusual, heavily cluttered arrangement could end up with decor
  omitted even though some other empty cell exists elsewhere in the room.
  This matches the spec ("omit decor when no safe position exists") rather
  than guaranteeing decor always finds the one remaining valid cell.
- As with the prior Phase 2A pass, verification used headless Chrome driven
  directly over the DevTools protocol, not the `claude-in-chrome` extension
  (unavailable both sessions) — an actual interactive click-through of the
  editor, live in a browser, dragging a prop onto a decor spot and watching
  it fall back, was not additionally performed; that behavior is covered by
  the unit tests against the real `room-edit.ts` functions instead.

## Fix Codex finding: Papermoth decor collision safety

Builds on `be8d0c6`. Closes the one gap the previous Phase 2A follow-up pass
left open on purpose (see the scope note above): `PapermothStudioDecor` —
Papermoth Press's bespoke print-studio corner (workbench, flat-file storage,
accent plant) — still used fixed coordinates checked by hand against the
demo data, bypassing the `findFreeLayout` collision system every other
template decor piece now goes through.

- [x] Added three candidate-layout functions to `lib/template-decor.ts`
      (`papermothWorkbenchLayouts`, `papermothStorageLayouts`,
      `papermothPlantLayouts`), reusing the existing `findFreeLayout` pure
      function rather than writing new collision logic — each piece's first
      candidate is derived to exactly reproduce its previous hardcoded
      position, confirmed by the regression test below rather than by eye.
- [x] `PapermothStudioDecor` now takes the room (not just `scale`), resolves
      each of its three pieces independently through `findFreeLayout`, and
      renders only the pieces that found a clear spot — losing one (say,
      the plant) doesn't take the other two down with it, matching
      `StudioWorkCorner`'s existing pegboard/crate precedent rather than
      `ShopCounterDecor`'s composite-unit one, since Papermoth's three
      pieces are looser-coupled than a counter and its own packaging.
      `RoomScene.tsx`'s call site updated to pass `room`.
- [x] Each piece gets the same three-candidate fallback shape as the rest of
      `TemplateDecor`: original spot, mirrored to the opposite wall side,
      then pushed toward the front — on whichever side it landed.
- [x] Unit tests (`template-decor.test.ts`, 6 new, 21 in the file total):
      every piece resolves to its original spot in the untouched Papermoth
      room; dragging the existing lamp onto the workbench's default
      footprint forces a fallback; creating a brand-new prop and dragging it
      onto the storage unit's default footprint forces a fallback; dragging
      the existing plant onto the accent plant's own default footprint
      forces a fallback; blocking all three of the workbench's candidates
      omits it entirely; blocking only the workbench doesn't disturb the
      storage or plant resolving normally (independence). As with the prior
      round, confirmed by temporarily logging actual resolved values (not
      only asserting non-equality) that the fallback assertions hit a real
      non-null, non-overlapping alternate and not a vacuous `null`.
- [x] Re-verified in a real browser that Papermoth's untouched room renders
      pixel-identical to before this change (workbench, storage, book
      stacks, accent plant all in their original positions) — confirms the
      derived candidate formulas actually reproduce the old hardcoded
      numbers rather than merely being close.
- [x] Corrected every now-stale collision-safety claim this fix touches:
      struck through and annotated the "print-studio corner ... eyeballed
      ... not by an automated collision check" limitation under "Visual
      quality pass 2" (now resolved), and added the scope note above the
      Checks section of "Phase 2A — visual completeness" clarifying that
      pass's `findFreeLayout` work did not yet cover Papermoth's own decor
      component.

### Checks

- [x] Unit tests: 80 total (6 new), all passing.
- [x] `tsc --noEmit` passes.
- [x] `eslint .` passes, zero warnings.
- [x] `next build` passes.

### Limitations

- ~~Papermoth's three pieces resolve independently (like `StudioWorkCorner`),
  not as a composite (like `ShopCounterDecor`) — so it's possible, in an
  edited room, for the workbench to land at its mirrored back-left spot
  while the storage unit stays at its original back-right spot, losing the
  two pieces' visual adjacency even though neither is drawn over an
  editable prop. Collision safety was the explicit ask here; preserving
  exact visual coupling under arbitrary edits was not, and would need a
  composite candidate list (workbench + storage + plant tried together) to
  fix, at the cost of all three disappearing together whenever any one of
  them can't find a spot.~~ **Resolved** — this predicted exactly the bug
  that surfaced as literal overlap between two pieces both reaching their
  front fallback. Fixed below in "Fix Codex finding: Papermoth decor pieces
  reserve each other's footprints" via `resolvePapermothDecor`'s shared
  reservation list. The three pieces are still resolved as independent (not
  composite) candidates, so visual *adjacency* when one falls back and
  another doesn't is still not guaranteed — but *overlap* between them now
  is, provably, impossible.
- As with every pass since the extension became unavailable, visual
  verification used headless Chrome driven directly over the DevTools
  protocol, not the `claude-in-chrome` extension — an actual interactive
  click-through of the editor, live in a browser, dragging a prop onto one
  of Papermoth's decor spots and watching it fall back, was not performed;
  that behavior is covered by the unit tests against the real
  `room-edit.ts` functions instead.

## Fix Codex finding: Papermoth decor pieces reserve each other's footprints

Builds on `ca16814`. Closes the gap that fix's own Limitations section
predicted and left open: Papermoth's workbench, storage and accent plant
each avoided editable room props independently, but not each other — when
two pieces both fell back to their front-of-room candidate, nothing stopped
them landing on top of each other.

- [x] Added `resolvePapermothDecor` to `lib/template-decor.ts`: one pure
      function that resolves all three pieces together in a fixed priority
      order (workbench, then storage, then plant), passing `findFreeLayout`
      a growing `reserved` list of every rect already accepted for an
      earlier piece in the same call — so no two pieces can ever land on
      overlapping spots, not just no piece on an editable prop.
- [x] Extended `findFreeLayout` with an optional third parameter,
      `extraOccupied: GridRect[]` (default `[]`), checked alongside room
      props. Backward compatible — every other caller (gallery/studio/shop
      decor) is unaffected and untouched.
- [x] `PapermothStudioDecor` now calls `resolvePapermothDecor` once instead
      of three independent `findFreeLayout` calls.
- [x] Found and fixed two real, previously-undetected collisions in the
      candidate geometry itself while building the tests below — not bugs
      in the new reservation logic, but in candidates the *previous* fix
      introduced without checking them against the real room closely
      enough:
      - storage's and the accent plant's mirrored "back-left" candidate
        both landed on top of Papermoth's own permanent `papermoth-plant`
        prop at grid (0,2)-(1,3), making that fallback silently unreachable
        in the one room that uses it. Moved both past the plant's right
        edge instead of mirroring all the way to the wall.
      - workbench's and storage's "front" candidate both landed on
        Papermoth's own permanent `papermoth-bench` and `papermoth-lamp`
        props. Moved both to the one verified-clear gap left in the front
        third of the room (left of the bench, below the rug).
      Both were caught by writing tests against the *real* Papermoth room
      rather than a synthetic fixture, and by actually running them instead
      of trusting hand-derived coordinate arithmetic a second time — twice
      in this pass, a test's expectation (based on manual geometry) turned
      out to be wrong and the production code was innocent; a small
      throwaway diagnostic script that printed every candidate's real
      collision status against every real floor prop settled it
      conclusively both times, faster than more hand-checking would have.
- [x] Unit tests (`template-decor.test.ts`, 5 new in a `resolvePapermothDecor`
      describe block, 26 in the file total): baseline resolves all three to
      their original spots; two pieces individually forced to their second
      candidate both succeed without overlapping each other; two pieces
      forced toward their (verified, deliberately) colliding front
      candidate — the first to resolve claims it, the second is correctly
      omitted instead of overlapping it; all three forced toward the front
      — workbench and the plant both land without overlapping each other
      (the plant's front candidate happens to collide with neither), while
      storage is correctly omitted; and a prop-overlap sweep confirming no
      resolved rect ever touches an editable floor prop even while pieces
      are being pushed into each other's way. Every test asserts pairwise
      non-overlap across whatever actually resolved, not just equality for
      the one piece nominally under test.
- [x] Fixed a blocker-construction bug in the tests themselves, caught by a
      test failing for the wrong reason: a synthetic 1×1 "lamp" floor prop
      — the smallest footprint available — anchored at a tiny candidate's
      corner (the accent plant's is 0.26×0.26) overhangs by up to a full
      unit and can clip a neighbouring piece's nearby candidate. Centering
      the blocker on the target candidate instead still guarantees it
      covers that candidate while halving the overhang in every direction.
- [x] Re-verified in a real browser that Papermoth's untouched room still
      renders pixel-identical to before this change.

### Checks

- [x] Unit tests: 85 total (5 net new), all passing.
- [x] `tsc --noEmit` passes.
- [x] `eslint .` passes, zero warnings (two `gridHeight`-unused warnings
      surfaced by the front-candidate fix above were cleared by dropping
      the now-unused parameter from `papermothWorkbenchLayouts` and
      `papermothStorageLayouts`, rather than suppressed).
- [x] `next build` passes.

### Limitations

- The three pieces' candidate lists were hand-authored and are verified
  clear only against Papermoth's own actual demo props — there is only one
  member using this component, so there's nothing else to check against.
  Twice now, across two separate fix rounds, a candidate added "by formula"
  without individually re-checking it against the real room turned out to
  silently collide with one of Papermoth's own permanent props. Any future
  change to Papermoth's demo prop list should re-run the "resolves all
  three pieces to their original spots" test and the prop-overlap sweep
  specifically, not trust the formulas on sight.
- As with every pass since the extension became unavailable, visual
  verification used headless Chrome driven directly over the DevTools
  protocol, not the `claude-in-chrome` extension. This session also hit a
  second, unrelated flake: the dev server's Jest/webpack worker crashed
  outright twice before a screenshot would load — once from a stale
  process still holding the port from an earlier run in this same session,
  once with no obvious cause — and needed a plain kill-and-restart both
  times. Noted in case it recurs; it did not reflect anything wrong in the
  code being verified, and the same screenshot succeeded immediately after
  each restart.

## Infrastructure

### Full release-path browser verification

- [x] Drove the production build in Chrome through the DevTools Protocol at
      1440×900 and 390×844. Covered the street, search, category filtering,
      the accessible directory, all eight member rooms, content dialogs,
      outbound actions, the editor, local-save persistence, reset, the missing
      member route, and reduced-motion handling.
- [x] Measured every visible interactive element during the sweep. Fixed the
      member breadcrumb and missing-member recovery link, the only two controls
      below the required 44×44 px target. Re-ran the sweep with zero undersized
      controls and zero horizontal overflow.
- [x] Confirmed Escape closes content dialogs and restores focus, unsafe
      `javascript:` actions are not rendered, deliberate edits survive reload,
      reset removes the override, and the browser console has no meaningful
      errors. Added the Sidewallk app icon so Chrome no longer requests a
      missing site asset.

The development server exhausted the available Node heap during the first
all-pages sweep on this 8 GB machine. The production build and production
server completed the same sweep without a crash. This remains an environment
and development-server stability limitation; it does not establish behavior
on other machines.

- `next dev` and `next build` now write to separate output directories
  (`.next-dev/` vs `.next/`, chosen via `NODE_ENV` in `next.config.ts`) so
  running a build no longer corrupts a live dev server's cache — confirmed
  by running `next build` while the dev server stayed up on port 3000 and
  verifying it was still fully interactive (not just returning HTTP 200)
  immediately after.

## Phase 2B foundation — private alpha

- [x] Added stable town slugs and explicit draft/published state to the domain
      model while keeping the existing sample town published and offline.
- [x] Added town-scoped organizer/member/visitor authorization rules. The 7 new
      tests cover public access, draft privacy, organizer-only actions, member
      ownership, inactive invitations and mismatched identities/towns.
- [x] Authored the first Postgres migration for towns, members and memberships,
      including grants and row-level-security policies. Security-definer helper
      functions avoid recursive membership-policy evaluation.
- [x] Upgraded the runtime/tooling baseline to Next.js 16.4.2, React 19.3.1,
      Vitest 5.0.5 and Vite 8.3.4. Production dependencies now report zero
      known vulnerabilities via `npm audit --omit=dev`.
- [x] Migrated ESLint and Vitest configuration to their current flat/Oxc
      formats. The stricter React lint rules surfaced and removed a derived-map
      camera effect; filter recentering is now derived without an extra render.
- [x] Re-ran 92 unit/component tests, TypeScript, ESLint and the Next.js 16
      production build. Repeated the complete Chrome sweep at 1440×900 and
      390×844 across all eight rooms; all interactions, 44 px targets,
      overflow checks and browser-console checks passed.

### Phase 2B boundary

- The SQL migration is authored but not applied or exercised against a live
  Postgres/Supabase instance because this repository has no project credentials.
- Authentication, server data access, uploads, invitations and management UI
  are the next slices; the existing editor still uses labelled local demo data.
- Full dependency audit still reports 5 high-severity findings in development
  lint tooling through `eslint-config-next`/`fast-glob`. The production audit is
  clean, and npm currently offers no non-breaking patched development tree.

## Future phases

Explicitly out of scope for this milestone:

- Real authentication and production permissions
- Payments, subscriptions, checkout
- Multiplayer avatars, voice chat
- Cryptocurrency, resale
- Native apps
- Runtime AI generation
- Unrestricted 3D editing
- A large organizer dashboard
