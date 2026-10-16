# Sidewallk

## Phase 2B foundation — 17 October 2026

The first private-alpha slice is in progress. The repository now defines
draft/published towns, town-scoped organizer/member permissions, and the
Postgres row-level-security schema that will enforce them. The current sample
experience still runs entirely offline; no Supabase project or credentials are
required yet. See `PHASE2B.md` for the sequence and acceptance checks.

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

The sample town needs no environment variables. To connect private-alpha
sign-in later, copy `.env.example` to `.env.local` and fill in the Supabase
project URL, publishable key and public site URL. Never commit `.env.local`.

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

Everything runs from typed local data. No accounts, no paid services, no API
keys, no network calls at runtime.

## A note on the demo content

Every member, room and link in this project is invented sample content,
clearly labelled as such throughout the UI. Outbound links use the reserved
`.example` TLD so nothing can be mistaken for a real business. The project
deliberately contains no visitor counts, testimonials or activity feeds, and
the editor is explicitly labelled a local-only demo with no real
authorization.
