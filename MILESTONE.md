# Milestone 1 — visitor walks the street and steps inside

Tick an item only when it has actually been run, not when the code looks
right. Add a line under **Limitations** for anything that is partly done, and
say so in the final summary rather than leaving it implied.

## Town

- [x] Eight demo buildings on the street
- [x] At least four distinct exterior designs (gallery-front, studio-front,
      shop-front, cafe-front, each with distinct window/door/awning facades)
- [x] Smooth pan and zoom with obvious controls (keyboard arrows + on-screen
      zoom buttons, verified in browser)
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

- [ ] Works at phone width
- [ ] List view fully usable without the map
- [ ] Keyboard navigation throughout, with visible focus
- [x] Dialogs trap focus, close on Escape, restore focus on close (verified in
      browser: Escape closes the content panel and focus returns to the prop
      that opened it)
- [ ] `prefers-reduced-motion` respected
- [ ] Contrast and touch targets checked

## Demo honesty

- [ ] Sample members and sample content clearly labelled
- [ ] No invented visitor counts, testimonials or activity
- [ ] Outbound demo links all use the `.example` TLD
- [ ] Roles described as future product roles, not real authorization

## Robustness

- [ ] Missing or partial content renders without crashing
- [ ] Corrupt or wrong-version local save falls back to demo data
- [ ] Only `http:`, `https:` and `mailto:` links are rendered

## Checks

- [x] Unit tests for state and persistence behaviour (33 tests: links,
      search, storage/overrides, room-edit)
- [x] Type checking passes (`tsc --noEmit`)
- [x] Lint passes (`eslint .`, zero warnings)
- [x] Production build passes (`next build`)
- [x] Full visitor flow driven in a real browser at desktop width (street →
      search/list → building → content panel → action link → editor)
- [ ] Full visitor flow driven in a real browser at phone width
- [x] Editor driven in a real browser (member fields, props add/move/remove,
      content fields, reset, persistence across reload)

## Limitations

- Phone-width verification has not been run yet.
- Building silhouettes share one box shape; the four exterior kinds differ by
  facade (window/door/awning arrangement) and colour, not roofline.
- A newly added display prop starts with empty content and is not clickable
  in the room until the editor's title/description fields are filled in —
  confirmed this degrades gracefully (renders, just inert) rather than
  crashing.
- Contrast/touch-target review against the actual token values (not just
  visual inspection) has not been done yet.
- No automated check yet that a corrupt/wrong-version `localStorage` value
  falls back to demo data at the UI level (the parsing logic itself is unit
  tested in `storage.test.ts`).

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
