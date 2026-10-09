# Working agreement for coding agents

This file applies to every agent working in this repository — Claude Code,
Codex, Cursor, or anything else. `CLAUDE.md` covers the technical architecture.
`SPEC.md` is the scope and wins any disagreement.

Read `SPEC.md` before writing code.

## Where you are

This repository is checked out as **git worktrees**, one per agent:

```
sidewallk/          branch: main      shared history, docs only
sidewallk-claude/   branch: claude    Claude Code works here
sidewallk-codex/    branch: codex     Codex works here
```

Rules that follow from that:

- **Work only in your own worktree.** Do not `cd` into a sibling worktree, read
  its files for ideas, or commit to its branch.
- **Never check out `main`** in your worktree, and never force-push or rewrite
  shared history. Git refuses to check out a branch that another worktree
  already has, so if a checkout fails, that is why.
- Commit to your own branch freely. Small, working commits with real messages.
- Do not merge branches. The human decides what gets merged.
- `node_modules/` is installed per worktree. That is expected.

## Hard rules

1. **Original work only.** PetriPlot is category inspiration. Do not copy its
   branding, wording, layout, source or artwork. Do not reproduce any other
   product's assets. All artwork in this project is generated in code.
2. **No invented social proof.** No visitor counts, no "3 people here now", no
   testimonials, no reviews, no activity feeds. The spec forbids it and it would
   be dishonest in a demo shown to real organizers.
3. **Sample content must be labelled as sample content.** Every demo member and
   every piece of room content is visibly an example.
4. **Outbound links use the reserved `.example` TLD**, e.g.
   `https://papermoth.example/intro-call`. Nothing in demo data may point at a
   real business, and nothing may look like it does.
5. **Validate every URL before rendering it.** Allow `http:`, `https:` and
   `mailto:` only. Reject `javascript:`, `data:` and anything unparseable.
6. **No cloud accounts, paid services, API keys or network calls at runtime.**
   The milestone runs entirely offline from typed local data.
7. **Do not deploy, buy anything, or push to a remote.**

## Quality bar

Deliver working interactions, not a mockup.

- Invalid or missing local saves must degrade to demo data, never to a crash or
  a blank screen.
- Keyboard: every interactive thing reachable, visible focus, Escape closes
  dialogs, focus returns where it came from.
- `prefers-reduced-motion` is respected everywhere motion exists.
- Phone width works. The list view must be fully usable without touching the map.
- Run type checking, lint and a production build before claiming done.

## Reporting rules

The person running this cannot read the code. Your self-check is not evidence.

- Never say "fixed", "works" or "verified" for anything you did not actually
  run. Saying a build passed means you ran the build and read the output.
- State plainly what you verified, how, and what you could not verify.
- If browser tooling is available, drive the real flow — street, building,
  interior, content panel, action, editor — at desktop and phone widths, and say
  which of those you exercised.
- List known limitations honestly at the end. An unreported gap found later
  costs far more than one declared up front.

## Workflow

1. Read `SPEC.md`, then `CLAUDE.md`.
2. State a short implementation plan before building.
3. Scaffold, then build in vertical slices that are each runnable: street →
   interior → editor. Do not build all the scaffolding for everything first.
4. Keep `MILESTONE.md` updated as you go. It is the checklist the human reads.
5. Update `README.md` with real install and run instructions once the project
   exists.
6. Ask only when genuinely blocked. Pick sensible defaults for routine choices
   and note them.
