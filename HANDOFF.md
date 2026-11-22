# HANDOFF — Concrete Dragon (CD1)

**Last updated: 2026-11-22 (America/New_York).**
**Repo:** `mhvnsnt/ConcreteDragon` (PUBLIC), default branch `main`.
**Purpose of this file:** any agent that picks up work here reads this FIRST, then the linked docs. It states what we've done, where we're at, and what we're working toward — so the owner can say "go to this repo, pick up the work" and you just know. Update this file in the same PR whenever the state changes (add, don't delete).

## 1. What this repo is

Concrete Dragon 1 — the kid-friendly, colorful game. A mobile street brawler: tap combat, ragdoll KOs, battle pass, live service. By Orion Enterprises LLC.

**CD1 stays the kid-friendly, colorful game it is.** The realistic urban beat-'em-up is a SEPARATE game — Concrete Dragon 2, in `mhvnsnt/ConcreteDragon2`. Do not mix them: no realistic-humanoid rework lands here, no CD2 systems get pulled back into CD1 without his say-so.

## 2. Where we're at

### DONE
- **Step 0 start-flow — landed and merged.**
- **Step 2 fight-verbs — landed and merged.**
- **Sourcing rule docs (2026-11-19, PR #72 merged, 51f57ab).**
- **Pre-made parts first rule (2026-11-20, PR #73 merged, 678cd1c).**
- **Releases:** `wrestling-moves-local-20261023` (2026-10-24), `guardian-archive-20261018` (2026-10-18).

### IN PROGRESS
- **Xbox lane (open PR #71).** Gamepad API support + self-updating UWP shell + phone pusher kit. Open, not merged.
- **Itch page draft (open PR #74).** Itch page draft + setup notes. Open, not merged.

### BLOCKED
- **Nothing hard-blocked.** The remaining steps (Step 3, Step 4, Step 5) are owed work, not blocks — see §3.

## 3. What we're working toward

**The goal in order:** Step 3 style blend → Step 4 finisher and crowd → Step 5 owner playtest. Then the itch page (#74) and the Xbox lane (#71) land when he says so.

**The bar:** the game stays kid-friendly and colorful; tap combat feels addictive; ragdoll KOs land; battle pass and live service work. Proof is his eye and his playtest — the quality gate is the money gate: content fires only on builds passing his eye/playtest.

## 4. Standing rules that apply here

- **Branch → PR → merge, always.** Never push to main directly. Add-only, zero-conflict PRs, no force pushes.
- **Checkpoint-and-save law:** CHECKPOINT.md first, update after every step; the repo is the save; resume, never restart.
- **No-temp-storage law:** nothing in /tmp or any wipeable location, ever. Everything goes straight into the repo or a durable folder the second it exists.
- **No-gaps / solve-it law:** a gap or block is never the end of the work — route-switch until it's done or every reasonable route is exhausted with exact errors recorded.
- **Real-source-only:** every part comes from the actual source code and files, wired up fully. No hand-tooled lookalikes.
- **Pre-made parts first (owner, 2026-11-20):** pull working parts before building anything from scratch.
- **CD1 stays kid-friendly.** The realistic rework lives in ConcreteDragon2, never here.
- **Never kill in-progress work.** Never delete game files or other lanes' work without the standing verification rules.
- **Sign-in standing approval:** Google/Gmail (fmmg.mars@gmail.com) and GitHub (mhvnsnt) are blanket-approved forever. Never ask him to do sign-in steps himself.

## 5. Key files and paths

| What | Where |
|---|---|
| Game source + start flow + fight verbs | Repo root / game source (see README) |
| Sourcing rule / pre-made-parts-first docs | Docs landed with PRs #72 / #73 |
| Releases | `wrestling-moves-local-20261023`, `guardian-archive-20261018` |
| Open PRs | #71 Xbox lane: Gamepad API + UWP shell + phone pusher kit · #74 Itch page draft + setup notes |

## 6. Open decisions needing the owner

- **Itch page (#74):** publish the draft page, or hold? His call.
- **Xbox lane (#71):** land the Gamepad/UWP work, or hold? His call.
- **Step 5 owner playtest:** when he plays it, his verdict is the gate — lanes do not self-pass it.

## 7. How to pick up

1. Read this HANDOFF.md first, then the README in the repo.
2. Check what other agents are already doing before starting anything (never start a duplicate session).
3. Resume from the stated next step — Step 3 style blend is the next owed work. Never restart, never re-derive finished work.
4. Land work branch → PR → merge, add-only. Stage finished work to the repo as it lands.
5. Update this HANDOFF.md in the same PR when the state changes. Verify with your own eyes before claiming anything done. CD1 stays kid-friendly — if a change would make it otherwise, stop and ask.
