# Sidewallk

## Phase 2B — 20 October 2026

The private-alpha organizer loop is built: sign in, create a draft town, add
and edit member buildings through the same room editor the local demo uses,
preview the draft, publish it to a public `/t/[townSlug]` URL, unpublish it,
and invite a collaborator with a single-use copyable link. The sample
experience at `/` still runs entirely offline — no Supabase project or
credentials are required for it. See `PHASE2B.md` for the full build sequence
and what remains unverified (real magic-link email delivery requires a human
to click it; see that file for exactly what was and wasn't exercised).

The project requires Node.js 20.9 or newer. It currently uses Next.js 16 and
React 19.

## Visual reset — 15 October 2026

The visual redesign builds on committed source `bbaf9fc` and retains the
existing editor, content, URL validation and local persistence.

Run `npm run dev` and open http://localhost:3000. For a second preview beside
another dev server, run `npm run dev -- --port 3002`.
The town now fills the workspace with a two-row neighborhood, a shared
square, varied roofs, storefront details, trees, search and category filters.
The room uses a separate visitor information rail and a larger cutaway scene
with a window, wood floor, editable content and a modal local editor.

Existing state/persistence/URL validation code is retained. Map coordinates
are a presentation layer and do not rewrite saved building positions.

An explorable digital town for creative communities. Organizers run towns,
members have buildings containing their work, and visitors walk the street and
step inside without signing in.

The point of difference is the interiors: detailed rooms that hold real,
clickable content rather than a profile card.

> **Status: first milestone built.** A visitor can open the street, find a
> member, enter their interior, explore its content and follow a sample
> action — and a local editor can change a room and persist those changes.
> See `MILESTONE.md` for the full checklist and known limitations.

## Getting started

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

The sample town needs no environment variables. Private-alpha sign-in uses
Supabase when `.env.local` contains the project URL, publishable key and public
site URL from `.env.example`. The local file is ignored by Git and must never
be committed.

The Supabase CLI is installed as a development dependency. The hosted schema is
versioned in `supabase/migrations/`; use `npx supabase migration list` to compare
local and remote versions and `npx supabase db push --dry-run` before applying a
new migration.

Other scripts:

```bash
npm run build       # production build
npm start            # run the production build
npm run lint          # eslint
npm run typecheck     # tsc --noEmit
npm test               # vitest
```

## Repository layout

Work happens in git worktrees, one per coding agent, so two agents can attempt
the milestone independently from the same starting point.

| Path | Branch | Purpose |
| --- | --- | --- |
| `sidewallk/` | `main` | Shared, published branch. |
| `sidewallk-claude/` | `claude` | Claude Code's attempt. |
| `sidewallk-codex/` | `codex/*` | Codex review and feature branches. |

Each worktree installs its own `node_modules`.

## Documents

| File | What it is |
| --- | --- |
| `SPEC.md` | The build brief. Source of truth for scope. |
| `CLAUDE.md` | Architecture and development conventions. |
| `AGENTS.md` | Working agreement every coding agent must follow. |
| `MILESTONE.md` | Checklist of completed work and known limitations. |
| `PHASE2B.md` | Private-alpha roles, build sequence and acceptance checks. |

## What's here

- **The street** (`/`) — eight sample members across four distinct exterior
  styles, with pan/zoom, search by name or category, and an accessible list
  view that works without touching the map.
- **Interiors** (`/b/[memberId]`) — gallery, studio and shop room templates
  with clickable furniture and decor; clicking a display object opens a
  detail panel with its content and, where safe, a link.
- **A local demo editor** — from any interior, "Edit this room" opens
  controls to rename the member, change category/description/action link,
  switch template, recolor the room, and add/move/remove/annotate furniture.
  Every change previews immediately and is saved to `localStorage` under
  `sidewallk.town.v1`; "Reset to demo data" discards it.

The public sample still runs entirely from typed local data.

When `.env.local` is configured, the private-alpha product routes become
functional against the linked Supabase project:

- **Sign in** (`/sign-in`) — email magic link; returns to wherever `?next=`
  pointed (or `/workspace`).
- **Workspace** (`/workspace`) — towns where you have an *active* membership
  (an unaccepted invitation doesn't count), with a form to start a new draft
  town.
- **Town management** (`/workspace/towns/[townId]`) — organizer-only name
  editing, publish/unpublish, member list, add-member, and invite-by-email
  with a copyable one-time link. A member sees only their own assigned
  building here.
- **Member editor** (`/workspace/towns/[townId]/members/[memberId]`) — the
  same room editor as the local demo (`EditorPanel`), now saving to Postgres
  with optimistic-concurrency conflict detection instead of `localStorage`.
- **Draft preview** (`/workspace/towns/[townId]/preview`) — the draft town
  through the exact same street/interior renderer a visitor will see once
  published, with a banner making clear it isn't live yet.
- **Public town** (`/t/[townSlug]`, `/t/[townSlug]/b/[memberSlug]`) —
  published towns only, no sign-in required. A draft, missing or invalid slug
  all resolve to the same not-found page.
- **Accept an invitation** (`/invite/[token]`) — requires sign-in; a single
  explicit "Accept" action, no auto-accept and no preview of the invitation's
  contents beforehand.

## A note on the demo content

Every member, room and link in this project is invented sample content,
clearly labelled as such throughout the UI. Outbound links use the reserved
`.example` TLD so nothing can be mistaken for a real business. The project
deliberately contains no visitor counts, testimonials or activity feeds, and
the editor is explicitly labelled a local-only demo with no real
authorization.
