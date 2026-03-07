---
name: handoff
description: Generate a HANDOFF.md summarizing current session progress — what was done, what's in progress, and what to do next. Use at the end of a long session or before switching context.
---

Generate a handoff document for the current session.

## Step 1 — Gather Context

```bash
git status
git diff HEAD --stat
git log --oneline -10
```

Also read `tasks.md` if it exists in the project root.

## Step 2 — Write HANDOFF.md

Create or overwrite `HANDOFF.md` at the project root using this structure:

```markdown
# Handoff — [YYYY-MM-DD]

## Goal
[One sentence: what are we building or fixing in this session?]

## Branch
`[current branch name]`

## What Was Done
- [Completed item 1 — be specific, e.g. "Added Feature entity with Auditable embed"]
- [Completed item 2]

## Current State
[Describe what currently works, what's broken, any known issues or partial states]

## Files Changed
| File | What changed |
|---|---|
| `src/feature/feature.entity.ts` | New entity |
| `src/config/database/mikro-orm.config.ts` | Added table to includedTables |

## What's Next
- [ ] [Next action 1 — be specific enough that another agent can pick it up]
- [ ] [Next action 2]

## Decisions & Notes
[Any context the next agent/developer needs: why a certain approach was chosen,
known gotchas, things to watch out for, deferred work and why]
```

## Step 3 — Confirm

Tell the user that `HANDOFF.md` has been written, and give a one-paragraph summary of the key points (goal, progress, and the single most important next step).

> Note: `HANDOFF.md` is listed in `.gitignore` — it is a session scratchpad, not committed to source control. If you want to persist it, rename or move it.
