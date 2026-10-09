# Sidewallk — build spec

This is the brief for the first milestone. It is the source of truth for scope.
If anything in `CLAUDE.md` or `AGENTS.md` contradicts this file, this file wins.

## Product

Sidewallk is an explorable digital town for creative communities.

- **Organizers** run towns.
- **Members** have buildings containing their work, products or services.
- **Visitors** explore the town and enter buildings without signing in.

The main differentiator is beautiful, elaborate interiors that contain useful,
clickable content.

Create an original product and visual identity. PetriPlot is category
inspiration; do not copy its branding, assets, text or source code.

## First milestone

Build one complete experience:

> A visitor opens a populated miniature street, discovers a member, enters their
> interior, explores their content and follows a useful action.

Include a simple editor so the room can be changed and those changes persist.

This milestone uses local demo data. It must not require cloud accounts, paid
services or API keys.

## Before implementing

1. Inspect the repository and its existing instructions.
2. If an app exists, extend it without replacing working code unnecessarily.
3. If the repository is empty, scaffold the project.
4. Briefly state the implementation plan, then proceed.
5. Ask questions only when genuinely blocked. Choose sensible defaults for
   routine decisions.

## Technical direction

For a fresh project, use:

- Next.js with TypeScript.
- A small, consistent styling system.
- Original SVG/CSS artwork for the initial isometric town.
- PixiJS only if a concrete rendering requirement justifies it.
- Typed demo data and versioned localStorage for editor persistence.

Separate scene rendering, room content, editor state and reusable UI.

Use stable IDs for towns, members, buildings, rooms and props. Design these
structures so a backend can replace local persistence later.

## Design direction

Make Sidewallk feel like a carefully crafted miniature creative neighborhood.

Use:

- Warm daylight and a restrained palette.
- Boutique storefronts with distinct silhouettes.
- Detailed furniture, plants, shelves, lamps and framed artwork.
- Consistent isometric perspective and lighting.
- Clear typography and generous clickable areas.
- Subtle motion that supports exploration.
- A polished transition from street to interior.

The town and interiors should dominate the experience. Keep navigation compact.

Create original modular artwork in code. Avoid a generic dashboard appearance,
excessive cards, gradients and decorative effects.

## First version features

### 1. Town

- Eight demo buildings.
- At least four distinct exterior designs.
- Smooth pan and zoom with obvious controls.
- Clickable buildings and readable names.
- Search by member name and category.
- An accessible list view showing the same members.
- Direct links to individual buildings.

### 2. Interiors

- Three detailed templates: gallery, studio and shop.
- Each room should contain a coherent arrangement of editable objects.
- **Gallery:** framed work with title, description and project links.
- **Studio:** services, portfolio items and a booking/contact action.
- **Shop:** product displays with links to external product pages.
- Clicking a content object opens a readable detail panel.
- Clear navigation back to the street.

### 3. Demo editor

- Edit member name, description, category and action links.
- Select an interior template.
- Change supported room colors.
- Add, move and remove a small set of furniture/decor objects.
- Attach content to supported display objects.
- Provide controls usable without dragging.
- Preview changes immediately.
- Save locally across refreshes.
- Reset to the original demo data.

Keep editable props separate from room backgrounds. Do not flatten an entire
editable room into one image.

### 4. Responsive and accessible experience

- Make browsing and content work on mobile.
- Keep the list view fully usable without interacting with the map.
- Support keyboard navigation, visible focus and reduced motion.
- Ensure dialogs and detail panels have correct focus behavior.
- Use readable contrast and practical touch targets.

### 5. Demo honesty

- Clearly identify sample members and sample content.
- Do not invent live visitor counts, testimonials or customer activity.
- Label the editor as a local demo.
- Treat organizer/member/visitor as product roles for future development; local
  editor controls are not real authorization.

## Outside this milestone

Do not implement:

- Real authentication or production permissions.
- Payments, subscriptions or checkout.
- Multiplayer avatars or voice chat.
- Cryptocurrency or resale.
- Native apps.
- Runtime AI generation.
- Unrestricted 3D editing.
- A large organizer dashboard.

Document these as future phases.

## Implementation quality

Deliver functioning interactions, not just a visual mockup.

- Handle missing content and invalid local saves gracefully.
- Validate external links and allow only appropriate protocols.
- Avoid unnecessary dependencies and premature architecture.
- Add meaningful checks for important state behavior and persistence.
- Run type checking, linting and a production build.

If browser tooling is available, verify the full visitor-to-interior flow and
the editor at desktop and mobile widths. Report anything that could not be
verified.

## Project documentation

Create or update:

- `README.md` with installation and local run instructions.
- `CLAUDE.md` with architecture and development conventions.
- `AGENTS.md` with consistent guidance for Codex and other coding agents.
- `MILESTONE.md`, a short checklist showing completed work and remaining
  limitations.

## Finishing

Continue until this milestone works locally.

Start the development server if possible and give the exact local URL.

Summarize:

- What works.
- How to explore and edit it.
- Checks performed.
- Known limitations.
- The next recommended milestone.

Do not deploy, buy services or push to a remote repository.
