# Sidewallk

An explorable digital town for creative communities. Organizers run towns,
members have buildings containing their work, and visitors walk the street and
step inside without signing in.

The point of difference is the interiors: detailed rooms that hold real,
clickable content rather than a profile card.

> **Status: specification only.** This repository currently contains the brief
> and the agent guidance. The application has not been built yet. Whichever
> agent scaffolds it should replace this section with real install and run
> instructions.

## Repository layout

Work happens in git worktrees, one per coding agent, so two agents can attempt
the milestone independently from the same starting point.

| Path | Branch | Purpose |
| --- | --- | --- |
| `sidewallk/` | `main` | Shared history. Docs only. |
| `sidewallk-claude/` | `claude` | Claude Code's attempt. |
| `sidewallk-codex/` | `codex` | Codex's attempt. |

Each worktree installs its own `node_modules`.

## Documents

| File | What it is |
| --- | --- |
| `SPEC.md` | The build brief. Source of truth for scope. |
| `CLAUDE.md` | Target architecture and development conventions. |
| `AGENTS.md` | Working agreement every coding agent must follow. |
| `MILESTONE.md` | Checklist of completed work and known limitations. |

## Getting started

Once the project has been scaffolded, this section should read something like:

```bash
npm install
npm run dev
```

and give the exact local URL.

## Milestone

One complete experience: a visitor opens a populated miniature street,
discovers a member, enters their interior, explores their content and follows a
useful action — plus a local editor for changing a room and having those
changes persist.

Everything runs from typed local data. No accounts, no paid services, no API
keys.

## A note on the demo content

Every member, room and link in this project is invented sample content.
Outbound links use the reserved `.example` TLD so nothing can be mistaken for a
real business. The project deliberately contains no visitor counts,
testimonials or activity feeds.
