# AGENTS.md

Instructions for every AI agent working in this repo.

## No-data-loss rules (MANDATORY)
Read and follow [`docs/NO-DATA-LOSS-RULES.md`](docs/NO-DATA-LOSS-RULES.md) (canonical: mhvnsnt/agent-ops). No force-push, no rebase/amend of pushed work, no history rewrite, no branch/asset deletion without backup + owner approval, PRs only, empty D-filter + gitleaks + green CI before merge, push incrementally, keep WORKLOG, back up and sha256-verify before disk cleanup, never touch other agents' or Muse's work.


## MERGE-IT-YOURSELF LAW (owner 2026-10-15)
"Stop leaving things open for me to merge... I don't like to manually handle PRs."
When a PR satisfies ALL merge conditions (GitHub says MERGEABLE, CI green, no-deletion guard clean, gitleaks clean, build passes), MERGE IT — do not leave it open for the owner. He does not want to manually handle PRs.
The merge must be CLEAN and NON-DESTRUCTIVE: merge commits, never rebase/squash/force-push; resolve conflicts by keeping both sides' work — nothing lost, nothing clobbered, nothing destroyed on either side. Verify the merged result still builds and passes tests before calling it done.
A PR that is red, conflicting, or would lose work stays OPEN with a comment naming the blocker — but the default for a clean, green PR is MERGE, never "leave it for the owner."
Carve-outs (standing owner decisions, not overridden): never merge a DRAFT PR; never merge a PR the owner explicitly excluded.

---

## ANTI-CLOBBER LAW (owner 2026-10-17)
Propagated to ConcreteDragon 2026-10-23 via the idle merge lane (PR flow, docs-only).
Canonical text: mhvnsnt/agent-ops `docs/ANTI-CLOBBER-LAW.md`. The full 5-law text follows verbatim.
Supersedes open PRs #60 and #61 (the earlier anti-clobber pair, blocked on the instruction-gate).

# ANTI-CLOBBER LAW (owner 2026-10-17)

## The incident
On 2026-10-17, commit `cd3bf38` ("DXMMII limb system", branch `feat/dxmmii-limb-system`,
merged via PR mhvnsnt/western-heart#221) deleted **54,456 files** against **105 legitimate
additions**. The agent committed from a working tree that was missing tens of thousands of
files; `git add -A` swept every missing file in as a deletion. The commit message said
nothing about deletions. Nobody checked the deletion list before committing or merging.

The 105 additions were the agent's real work (all under `tools/limb-system/dxmmii/`).
Everything deleted was recovered from git history — but it should never have happened.

How a tree gets gutted (any one of these is enough):
- Working in a directory that isn't a complete clone (partial checkout, interrupted
  clone, or files removed to "save disk").
- A cleanup process, VM replacement, or another lane deleting files out from under
  the working tree.
- The agent itself deleting directories it didn't think it needed.

In every case the failure is the same: `git add -A` turns "files missing from my
tree" into "files deleted from the repo", silently.

## The law

1. Read your deletions before every commit. Run `git status` and
   `git diff --cached --name-status`. Every deleted file must be something your task
   meant to delete. If you see deletions you can't explain, STOP. Do not commit.
   Assume your environment is corrupted — do not try to "fix" it by committing.
2. Never `git add -A` or `git commit -a` in a tree you didn't fully populate yourself.
   If you didn't clone it and watch it finish, verify the tree is complete first —
   compare file counts against the remote branch. A tree missing files turns every
   missing file into a deletion the second you stage everything.
3. Say what you deleted, in the commit message. If you delete files, the message names
   the directories or file types and why. If the message says one thing and the diff
   shows 50,000 deletions, that's a hard failure — do not push it.
4. Deletion circuit breaker. Any deletion outside your task's scope blocks the commit.
   "My task touches 10 files but the commit deletes 500" is never fine. Stop and
   report instead of committing.
5. The merger checks the deletion list. Before merging any PR, read what it deletes
   and match it against the task. Deletions the task doesn't explain block the merge.
   A giant diff's deletions are never "probably fine."

## Co-authors
Written with the full agent team per the owner's TEAM RELAY LAW and ALL-AGENTS-WORKFLOW
LAW: Aider (rule 1 wording, the "assume your environment is corrupted" framing, and the
hallucinated-deletion gap behind rule 3), Copilot (rule 1 `name-status` inspection, rule 4's
clear stop condition). Cline was unresponsive at drafting time (its free-tier API hung);
proceeded without it per the workflow law's exception clause.

## Propagation
This law is appended to every mhvnsnt repo's `AGENTS.md`, each via branch → PR → merge
per the MERGE-IT-YOURSELF LAW. This file is the canonical text; repo copies reference it.

---

## NO-SPARSE-COMMIT LAW (owner 2026-10-23 — the cape-jones #219 main wipe)
NEVER commit or push from a sparse/partial checkout. A missing-file tree turns `git add -A`
into a silent repo wipe the moment you stage everything (this is exactly how cape-jones
main was wiped in PR #219 on 2026-10-23: the commit was built from an incomplete
checkout and the missing files were staged as deletions).

Before any commit from a non-full clone, VERIFY the working tree against the branch's
real tree: diff the root listing, or compare tree SHAs (`git rev-parse HEAD^{tree}`
vs the remote). If anything is missing, STOP — do not commit.

Default recovery: revert the merge commit (`git revert -m 1 <merge-sha>`) and re-add
the branch's real payload. When in doubt, build the commit via the Git Data API from
verified tree SHAs instead of trusting a local checkout.

GOTCHA: `gh`'s `-f content=@file` does NOT expand `@file` for the blobs API —
base64 the file explicitly (e.g. `base64.b64encode`) and pass `encoding: "base64"`.
