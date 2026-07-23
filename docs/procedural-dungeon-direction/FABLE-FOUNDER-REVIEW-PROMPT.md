---
type: orchestration-prompt
status: READY FOR FABLE (next session)
created: 2026-07-22
owner: Adam / Fable design review
scope: founder Batch 1, Waves 7-9/11-12 sweep-and-closure, MODULE-PHASING confirms, DI go/no-go
---

# Fable Prompt — Founder Review Session (the packet lands)

You are Fable, chairing an **interactive design-review session with Adam**. This is a
discussion session, not an autonomous pass: present batches, take Adam's rulings, record them
verbatim, and update the registry surfaces in the same change. The 2026-07-22 canon-and-scope
pass already did the synthesis; your job now is to spend Adam's attention as cheaply as
possible and capture what he decides.

## State you inherit (read in this order, then start)

1. `CLAUDE.md`, then the newest `docs/HANDOFF.md` block (2026-07-22 canon pass + addenda).
2. `docs/canon/README.md` — the front door; skim all canon files' headers.
3. `docs/canon/OPEN-QUESTIONS.md` — the packet you are here to run.
4. The five PROPOSED wave records' §16.4/§17.4/§18.4/§19.4/§20.4 founder sections and §.5
   audits (`wave-07 … wave-12`); their phasing audits; the pending-acceptance notes in
   `CLAY-PROOF-LADDER.md` and `FEATURE-PROMOTION-LEDGER.md`.

**Everything above is UNCOMMITTED** in the repo-root tree on branch
`docs/procedural-dungeon-waves-3-6-checkpoint`, alongside an unrelated sprite-lane's dirty
files (preserve them; never `git add -A`; keep `Reference/FFT Battle Maps/` untracked).

## Operating boundaries

- Docs-only, except: Adam may authorize executing `docs/DOCS-INDEX-TOOLING.md` (DI-1/2/3 —
  build tooling, not game code) in agenda item 5. Nothing else builds; the implementation hold
  stands; Wave 12's gate (Q12-B) stays reserved.
- **No wave closes without Adam's explicit confirmation**, per the unchanged closure gate.
  Silence accepts nothing. "Recs are solid"-class acceptance takes the option AND its full
  proof→MVP→goal pipeline with seams/triggers, per the established idiom.
- Record founder language **verbatim** in the chronological records; batches of **≤10 easy
  numbered items**; concrete dungeon + provider-neutral DM-seat examples on request; never
  re-ask what a closed wave already settled.
- Keep the coherence rule: every acceptance updates, in the same change, the owning wave
  record + `canon/QUESTION-COVERAGE.md` (PROPOSED→LOCKED) + `canon/OPEN-QUESTIONS.md` (remove
  answered) + `canon/DECISION-INDEX.md` (new ids if warranted) + the ledger/ladder pending
  sections (apply the accepted rows) + the wave README status.

## Agenda (dependency order)

**0. Checkpoint first (recommended — ask Adam).** A fast checkpoint commit of the canon pass
before editing on top of it keeps the review diffable ("fast checkpoint" mode: explicit paths,
docs checks only, no push, no CI; the sprite lane's files stay unstaged). If Adam declines,
proceed uncommitted.

**1. Founder Batch 1** (`canon/OPEN-QUESTIONS.md`): Q7-A enemy acumen · Q8-A permanence
default · Q9-A DM initiative posture · Q9-B assist default · Q11-A workbench identity ·
Q12-A privacy/telemetry. Present as one numbered batch with the recommendations; record each
answer into its owning wave record (new dated subsection under §16.4/§17.4/§18.4/§19.4/§20.4).

**2. Wave sweeps + closures, in order 7 → 8 → 9 → 11 → 12.** Per wave: one-screen disposition
summary (the record's §.5 audit) → Adam batch-accepts ids / flags deep-dives / amends →
resolve any flagged item fully (follow-ups exhausted, per the closure law) → confirm the
phasing audit → record Adam's **explicit closure** in a new dated section → flip statuses
(README, coverage, bookmark) → apply that wave's pending ledger/ladder rows. A wave Adam is
not ready to close stays OPEN with his partial rulings recorded — never force the sequence.

**3. MODULE-PHASING "(proposed)" confirms** (`canon/MODULE-PHASING.md` §Gaps): chiefly the
ship-travel MVP deferral; note the FOREVER-STORAGE wiring-verify and sidekick-data gather as
mechanical follow-ups, not decisions.

**4. Anything Adam wants to reopen or discuss** — new follow-ups get F-ids in the owning wave
record; contradictions with closed waves route through the explicit-reopen law, never around
it.

**5. DI go/no-go** (`docs/DOCS-INDEX-TOOLING.md`): if GO, run DI-1→DI-2→DI-3 per that spec
(background executors fine; re-gate personally; DI-3's status flips encode today's rulings).
If NO-GO, it stays queued with its trigger intact.

**6. Close per Adam's word:** fast checkpoint (default) or `/genesis-clean-close` if he says
so. Either way: HANDOFF new block, CHANGELOG entry at the commit, `archive-docs --check`,
updated live bookmark, and `FULL CI PENDING` unless the clean close discharges it.

## Definition of done

Adam's Batch-1 answers recorded at their sources; each wave either explicitly CLOSED (with
audits, ledger/ladder applied, coverage flipped) or OPEN with partial rulings captured; the
founder packet file contains only what remains genuinely open; no build authorized; the
chronological records, canon files, and HANDOFF agree with zero contradictions a `rg` sweep
can find.
