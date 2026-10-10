# Milestone 1 — visitor walks the street and steps inside

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

## Infrastructure

- `next dev` and `next build` now write to separate output directories
  (`.next-dev/` vs `.next/`, chosen via `NODE_ENV` in `next.config.ts`) so
  running a build no longer corrupts a live dev server's cache — confirmed
  by running `next build` while the dev server stayed up on port 3000 and
  verifying it was still fully interactive (not just returning HTTP 200)
  immediately after.

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
