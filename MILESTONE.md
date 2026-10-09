# Milestone 1 — visitor walks the street and steps inside

Nothing is built yet. Tick an item only when it has actually been run, not when
the code looks right. Add a line under **Limitations** for anything that is
partly done, and say so in the final summary rather than leaving it implied.

## Town

- [ ] Eight demo buildings on the street
- [ ] At least four distinct exterior designs
- [ ] Smooth pan and zoom with obvious controls
- [ ] Buildings are clickable and their names are readable
- [ ] Search by member name and category
- [ ] Accessible list view showing the same members
- [ ] Direct link to an individual building

## Interiors

- [ ] Gallery template — framed work with title, description, project link
- [ ] Studio template — services, portfolio items, booking or contact action
- [ ] Shop template — product displays linking to external product pages
- [ ] Each room is a coherent arrangement, not scattered props
- [ ] Clicking a content object opens a readable detail panel
- [ ] Clear navigation back to the street
- [ ] Polished transition between street and interior

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
- [ ] Dialogs trap focus, close on Escape, restore focus on close
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

_Record anything incomplete, unverified or deliberately deferred._

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
