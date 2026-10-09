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

- [ ] Edit member name, description, category and action link
- [ ] Select an interior template
- [ ] Change supported room colours
- [ ] Add, move and remove furniture and decor
- [ ] Attach content to display objects
- [ ] Every control usable without dragging
- [ ] Changes preview immediately
- [ ] Changes survive a refresh
- [ ] Reset returns to the original demo data
- [ ] Editor is visibly labelled a local demo

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

- [ ] Unit tests for state and persistence behaviour
- [ ] Type checking passes
- [ ] Lint passes
- [ ] Production build passes
- [ ] Full visitor flow driven in a real browser at desktop width
- [ ] Full visitor flow driven in a real browser at phone width
- [ ] Editor driven in a real browser

## Limitations

- The demo editor is not built yet — rooms render the fixed demo arrangement
  and cannot be changed.
- Phone-width verification has not been run yet.
- Building silhouettes share one box shape; the four exterior kinds differ by
  facade (window/door/awning arrangement) and colour, not roofline.
- Decor props (plant, lamp, bench, rug) are not clickable by design — only
  display props with content open the detail panel. Not yet verified with a
  display prop that has no content attached (can't happen yet since demo data
  always attaches content; will matter once the editor can add props).

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
