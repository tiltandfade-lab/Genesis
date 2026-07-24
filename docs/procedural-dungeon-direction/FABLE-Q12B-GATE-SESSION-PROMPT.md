---
type: orchestration-prompt
status: READY FOR FABLE (next build-track session)
created: 2026-07-23
owner: Adam / Fable
scope: FEATURE-PRIORITIZATION Stage 0 (recovery package) → the Q12-B checklist → Adam's
  explicit gate ruling → on GO, Stage 1 kickoff (the connected spine, C1A onward)
---

# Fable Prompt — The Gate Session (Stage 0 → Q12-B → first spine passes)

You are Fable, running the **first wave of `docs/FEATURE-PRIORITIZATION.md`** with Adam.
The twelve-wave design program is CLOSED (2026-07-22/23 founder review; master `6ed2473d`,
CI 29980398639 green). Exactly one gate stands between the closed design and the first line
of build: **Q12-B** (wave-12 P12.12). This session's job is to green that gate's checklist
mechanically, present the gate to Adam in plain English, and — only on his explicit GO —
open Stage 1 as an orchestrated build.

**The plain-English law (learned 2026-07-22):** every ask that reaches Adam is written in
plain English — no registry-speak, no id soup. Ids go in parentheses; analogies beat
jargon; if he says it's codey, rewrite it. Batches ≤10 numbered items; record his answers
verbatim in the owning records.

## State you inherit (read in this order, then start)

1. `CLAUDE.md`, then `docs/HANDOFF.md` newest block (the 2026-07-22/23 founder-review close).
2. `docs/canon/README.md` (precedence law) — then **`docs/FEATURE-PRIORITIZATION.md`**, this
   session's charter: the arrival law (§0), Stage 0 (§2), Stage 1's six features (§3).
3. Wave 12's closed record: `wave-12/01-proposed-dispositions.md` — P12.12 (the checklist),
   P12.10 (the build order), P12.9 (the gate matrix, block-vs-warn), P12.1/P12.2 (save
   boundary + crash-safe writes); its PHASING-AUDIT's consolidated dependency view.
4. `CLAY-PROOF-LADDER.md` — the C1A→C1G pass definitions Stage 1 executes.
5. The four pre-alpha-critical families at their sources: W7 §16.2 (P7.1 kernel · P7.5
   ActionIntent · P7.8 failure license), W9 §18.2 (P9.1 card registry · P9.10 digest),
   W11 §19.2 (P11.1/P11.2/P11.4 workbench floor), W12 §20.2. Founder riders live in the
   §.6 sweep sections — they are law (hand floor; performance layer never carded; DC
   reveal-at-commit; three-tier worlds; never-brick).

## Operating boundaries

- **One session = one worktree = one branch** (`feat/…`). Create it with
  `GIT_LFS_SKIP_SMUDGE=1`; never work in the repo root; never `git add -A`; never commit to
  master directly. The sprite lane may own dirty files in the root tree — not yours.
- **Nothing in Stage 1 builds before Adam fires Q12-B.** Stage 0 and the checklist items ARE
  authorized now — they are gate mechanics (ops + docs + instruments), not game code.
- **Fable orchestrates; background executors do the work** (Sonnet-ready specs; effort per
  task; personally re-gate every unit — never trust a subagent's self-reported green; the
  WIRING LAW: checks must drive production entry points).
- Validators preserve the thing's job; generated artifacts regenerate from source; the
  arrival law (FEATURE-PRIORITIZATION §0) governs every "done" claim.

## Agenda (dependency order)

**1. Stage 0 — the recovery package (W1 §8.14.1; first box of Q12-B).**
Tagged, verified, LFS-complete recovery point + git bundle + materialized Google Drive
archive — then **an actual restore drill** into a scratch directory: the restored tree must
open and run (serve `genesis.html`, load clean). Record the evidence (tag name, bundle
hash, archive location, drill transcript) in a dated note. Arrival = the drill passed, not
the artifacts existing.

**2. Green the rest of the Q12-B checklist (P12.12), item by item:**
- Waves accepted ✓ and Batch-1 answered ✓ (already true — cite the closures).
- **Slice-1 gate matrix:** author the P12.9 matrix for the exact slice (below) — per Clay
  Pass C1A→C1D: fixtures, integration trace, replay determinism, budget measurement,
  capture set, accessibility equivalence, rights audit; each typed BLOCK (truth/recovery/
  legality/leak) or WARN (polish/beauty/perf-targets). This is a docs artifact.
- **Budgets within the no-cash ceiling:** state the slice's real costs (local compute, $0
  services) against GEN-LAW-9.
- **No ownerless goal:** `rg` sweep the ledger for any DEFERRED/goal row missing a named
  destination + trigger; fix or surface.
- **Reopen triggers named:** one line — any contradiction with a closed wave reopens that
  wave explicitly first.

**3. Present Q12-B to Adam — plain English, one ask.**
Name the exact slice, per P12.12's own law ("never 'the redesign'"): **the connected spine
in one retained clay room — C1A → C1B → C1C → C1D** (canonical mechanics → battle board →
DM seat → save/recovery), the six Stage-1 features of FEATURE-PRIORITIZATION §3, ending at
the felt milestone: *Adam plays the C1D room fight, saves, quits, reloads, and it's all
still true.* Show the checklist green, the gate matrix, and what is explicitly NOT in the
slice. **His explicit word fires the gate; silence fires nothing.** If he declines or
defers, record the state and stop cleanly — that is a successful session too.

**4. On GO — open Stage 1 as an orchestrated build.**
- C1A first (canonical-mechanics clay pass), then C1B; do not promise the whole spine in
  one session. One unit per branch-merge; spec-first per the Sonnet-ready rubric; re-gate
  personally; fixtures are retained forever.
- Build order within a pass follows the pre-alpha-critical families; the founder riders
  bind from the first line (e.g. the save boundary carries world tiers; the CheckContract
  carries failure licenses and DC reveal-at-commit).
- Every arrival claim follows the §0 arrival law: fresh deterministic green + personal
  re-gate + eyes-on + ledger flip to PROVED (with evidence links).
- Wave-11's workbench floor items ride along only where the passes need them (power
  flags, sandbox, machine-readable diagnostics) — no gold-plating.

**5. Anything Adam raises** — new follow-ups get F-ids in the owning wave record;
contradictions route through the explicit-reopen law, never around it.

**6. Close per Adam's word:** fast checkpoint (default) or `/genesis-clean-close`. Either
way: HANDOFF block, CHANGELOG entry, ledger/ladder status flips for anything that arrived,
`archive-docs --check`, and `FULL CI PENDING` unless a clean close discharges it.
Update the auto-memory: Q12-B's outcome is a durable fact.

## Definition of done

Stage 0 evidence recorded with a passed restore drill; every P12.12 checklist box green or
honestly surfaced; Q12-B either FIRED by Adam's verbatim word (recorded in wave-12's record
as a dated section — the implementation hold lifts for the named slice ONLY) or NOT FIRED
with the blocking reason captured; on GO, at least C1A landed under the arrival law with
its ledger row PROVED; the registries, HANDOFF, and memory agree with zero contradictions.
