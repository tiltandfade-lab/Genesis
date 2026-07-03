---
type: system-spec
project: Genesis
status: PLANNED — Layer-1 companion to PRE-PLAYTEST-GAUNTLET.md · run parameters LOCKED (Adam, 2026-07-03 — §6)
updated: 2026-07-03
---

# AUTOMATED PLAYTEST — the Layer-1 loop (AI player × real DM stack)

**Purpose.** A faithful dry-run of Adam's live bridge playtest, run by an AI player against the
**real production DM stack**, in the **real app**. It catches everything the mechanical gauntlet
(`docs/PRE-PLAYTEST-GAUNTLET.md`) structurally cannot — because the gauntlet never calls a model:
DM-charter violations, roll-branches resolving wrong under real turns, digest-diet correctness, and
above all **real cost and latency under a stateful session.** Its output is transcripts +
instrument data + triaged friction notes, not a pass/fail.

This is **Layer 1** of the test pyramid. Layer 0 = the mechanical gauntlet (no model). Layer 2 =
Adam's hands-on live playtest (fun, feel, prose — only a human registers those). Each layer feeds
the next; never spend the expensive layer's attention on what a cheaper one already caught.

---

## §0 The shape — a detection loop with an escalating judgment ladder

Identical in shape to the gauntlet (`PRE-PLAYTEST-GAUNTLET.md §0`): generate signal, escalate it
through a ladder where the model tier climbs as the signal distills, act, re-verify, **loop until
the bridge is fast AND charter-clean.** Not a pipeline.

**The role ladder (bottom = cheap/high-volume, top = Fable):**

1. **Player — Sonnet, rotating personas.** Makes in-character choices; drives the real app in
   Chrome. Personas rotate to stress the DM from different angles (§3).
2. **DM — the real production stack** (Sonnet fast-lane / Opus deep-lane via the existing
   `dmTriage`), over the bridge. **This is the system under test — never substitute or stub it.**
3. **Scribe — a script, no model.** Logs per-turn: wall-clock latency, tokens in/out, $ cost, the
   `dmTriage` lane taken, whether a roll resolved via a pre-authored branch or a live inference,
   and the digest byte-size sent. Extends `dev/session-cost-report.py`.
4. **Critic — Opus.** First-pass over the transcript, in one read: (a) flags charter breaks and
   tags each note 🔧 mechanical / 🎨 narrative / 📏 calibration; (b) writes a **story recap** (§4a);
   (c) scores the session on the **engagement rubric** (§4b) — the snoozefest detector. Mirrors the
   gauntlet's **Triager** rung.
5. **Analyst — Fable.** Deep pass: difficulty/lethality feel, prose quality, cost triage, and
   turning the note-batch into branched fix/tune work. Mirrors the gauntlet's **Verifier** rung.
6. **Loop** — re-run until the bridge runs at expected speed and the transcript is charter-clean.

**The burn-rate gate (Adam, locked).** Token-burn rate is a **first-class test signal, not just an
outcome.** If a run is spending faster than expected, **STOP immediately — do not push to the token
cap.** Investigate (the prime suspect is the digest shipping the full codex every turn — see the
cost finding in memory), triage, fix, retry. Only resume the playtest once the bridge is operating
at expected speed. A slow/expensive bridge is a bug to fix, not a cost to absorb.

**Hard cap:** 2M tokens worst-case per run (the known stateful-session ceiling). The scribe aborts
the run at the cap and files a `crash`-tier finding — but the burn-rate gate should trip long
before the cap is ever reached.

---

## §1 What this layer tests (and what it does NOT)

**Tests (model-in-the-loop signal only this layer produces):**
- **DM-charter adherence** — never rolls the player's dice; never decides the PC's actions; no
  tactical coaching; single narrator voice; no NPC bleed across worlds/PCs (DM-CHARTER §3, and the
  memory'd feedback rules).
- **Roll-branches correctness** — `rollRequest.branches` resolve locally via the margin ladder;
  nat 20/1 go live; the two-inference check stays killed (`docs/ROLL-BRANCHES.md`).
- **Digest-diet correctness** — two-tier codex + `touchedSeq` delta + send-once statics behave
  under real consecutive turns (`docs/DIGEST-DIET.md`).
- **Cost & latency** — real numbers under a stateful `/loop` session; the thing the gauntlet cannot
  see and the reason full-fidelity (not bridge-only) is mandatory.
- **Degrees-of-failure** — margin-graded outcomes land tight, not over-generous (the memory'd
  near-miss correction).
- **Engagement — "never a snoozefest"** — a session can be mechanically clean and still dead
  boring. The story arc is scored every run (§4b); a low score is a first-class finding, not a
  footnote. This is the dimension only a model-in-the-loop read can surface.

**Does NOT test (covered elsewhere — don't duplicate):** UI wiring / dead handlers (gauntlet G1),
combat math (G2), level-up data (G3), persistence (G6), visual layout (G8). If a UI bug surfaces
mid-playtest, file it and let the gauntlet own the fix.

## §2 Full-fidelity wiring (Chrome, not bridge-only)

**Locked: full-fidelity.** The cheap model drives the **real app in Chrome** so the real
`dmDigest` pipeline builds the digest and the real bridge answers — bridge-only (posting synthetic
digests to the mailbox) is rejected because the whole cost story *is* the digest.

- **Server:** the **bridge** (`python3 dev/dm-bridge.py`) — serves the app *and* the `/turn`
  `/response` mailbox. Never the plain `http.server` (no mailbox → every turn fails "bridge
  unreachable"). Verify first with `python3 dev/verify-bridge.py` **only when no live session is
  up** (it resets the mailbox — standing gotcha).
- **DM client:** a `/loop` watching `.dm/` as the DM, per `docs/DM-BRIDGE.md`.
- **Player loop:** the Player agent reads the rendered DM narration from the page (Claude-in-Chrome
  per the browser-control memory), decides an in-character action, and enters it through the real UI
  controls — clicking is pure mechanism, only the *decision* is model judgment.
- **Scribe:** taps the bridge mailbox + the model call metadata each turn; writes
  `dev/playtest-transcript-<seed>.json` (turn-indexed) + a cost/latency table.

**Safety:** never run `verify-bridge.py` or otherwise touch `.dm/` mid-run (shared mailbox, eats
pending turns). One playtest at a time.

## §3 Personas (rotation — locked)

Run **one "reasonable player" shakedown first** to debug the *loop itself* cheaply, then **rotate**
as the steady-state protocol so the DM gets stressed from multiple angles:
- **Reasonable** — plays the game as intended (the shakedown persona).
- **Cautious** — over-checks, retreats, hoards; stresses pacing and the DM's patience.
- **Reckless** — charges everything; stresses lethality and the danger dial.
- **Rules-lawyer** — probes mechanics, questions rulings; stresses charter consistency.
- **Chaos** — off-script, tries to break narrative; stresses invention-capture (DM-CHARTER §8.5).

Each run records its persona; the scribe tags every transcript with it so the Critic reads notes in
persona context.

## §4 The report / friction-note contract

Reuse the gauntlet's severity ladder for mechanical issues (`crash`/`corrupt`/`wrong`/`ugly`) and
add the playtest-native tags for the model-in-the-loop notes:
- 🔧 **mechanical** — a rule/engine misfire the DM exposed.
- 🎨 **narrative** — voice, prose, pacing, charter-voice issues.
- 📏 **calibration** — difficulty, reward, spice-band, near-miss-grace tuning.

Each note carries: turn index, persona, the transcript excerpt, the charter/spec clause it touches
(if any), and the Critic's tag. The Analyst (Fable) turns the batch into branched fix/tune work.

### §4a Story recap (per run)

The Critic writes `dev/playtest-recap-<seed>-<persona>.md` — a **readable narrative digest** of what
actually happened, so Adam (and Fable) can read a session like a recap instead of scrubbing the
transcript. Beat-by-beat but tight: the arc, the turns, the memorable moments, how it ended. This is
the artifact that lets Layer 1 partially stand in for Adam's attention on "is it fun" — if the recap
reads as a good story, the game is doing its job; if the recap is a shrug, that's the signal.

### §4b Engagement rubric — the snoozefest detector

The Critic scores each session 1–5 on these dimensions (criteria, not vibes) and writes them into
the report + the recap header:
- **Stakes** — was there something real to lose across each stretch, or was it consequence-free?
- **Escalation** — did tension rise, or flatline?
- **Variety** — did scene types/beats vary, or repeat (walk → walk → walk)?
- **Pacing** — momentum vs. dead-air/filler turns.
- **Memorable beat** — at least one genuinely cool moment (honor-the-cool danger; a spice band
  landing)?
- **Spice expression** — did the higher bands actually fire and land, or did it stay vanilla?
  (ties to `SPICE-CURVE` + the "let it get MYTHIC" calibration).
- **Agency** — DM presented situations and stopped, vs. rail-roaded/coached.

A run below threshold on the arc dimensions is flagged **snoozefest-risk** (📏), a first-class
finding for Fable's tuning pass.

**Attribution ruling (critical):** an automated Sonnet player can produce a boring session because
the *player* was bland, not because the *game* was. The Critic must attribute dead air to **system
vs. player** — "the DM/world offered no stakes" is a bug; "the player declined the stakes on offer"
is not. The Reckless and Chaos personas partly control for this; a session that scores low across
*all* personas is a system problem, while one boring only under Cautious is a signal the game may be
**too safe for careful play** (ties to the "hard & dangerous / too safe?" pillar) — itself worth a
tuning note, but a different one.

## §5 Run order & definition of done

- **Prereq:** the mechanical gauntlet is green (Layer 0) — no point burning model tokens on a build
  that still crashes headlessly.
- **Sequence:** shakedown run (reasonable persona, short — verify the loop + burn rate) → if burn is
  sane, the persona rotation → Opus Critic pass → Fable Analyst triage → fix batches → re-run.
- **Done:** a full session per persona completes under the burn-rate expectation (not merely under
  the 2M cap); transcript + cost/latency tables written; friction notes triaged into branches;
  charter-clean. **Then, and only then, Adam's hands-on live playtest (Layer 2).**

## §6 Run parameters (LOCKED — Adam, 2026-07-03)

- **Session length:** **40 player turns or 2 in-world days, whichever comes first.** Long enough
  for stakes/escalation to be scoreable (§4b), short enough to keep the five-persona rotation
  affordable. The scribe ends the run at the cap and the Critic scores what exists.
- **World setup:** **fresh world per persona**, and every run's player brief REQUIRES at least one
  leave-and-return within the session — drift, recall, world-turn, and reputation only show on
  revisits; a run that never returns anywhere never exercises the living-world spine.
- **Shakedown timing: EARLY.** The reasonable-persona shakedown fires as soon as the gauntlet fix
  batch lands — it debugs the loop (bridge, player, scribe, burn rate), not the game, so it does
  NOT wait on full Layer-0 coverage. The **persona rotation DOES wait** for the gauntlet to re-run
  green with the coverage debt paid (G1 staging floor, Monkey Session, applyEvent-fuzz).
- **Reporting seam:** Adam is pinged **after the shakedown's burn numbers** — before the rotation
  spends anything. Burn-rate gate armed as: scribe checks every 5 turns; cost/turn > 2× the
  DIGEST-DIET expectation or median turn latency > 60s → STOP the run, file the finding.
- **Fable spend (per the token-budget ruling):** Fable appears only at the seams — the G2-rerun
  lethality read, phase-gate decisions, and the Analyst pass over the full rotation batch
  (re-adjudicating every snoozefest-risk attribution itself, never taking the Critic's
  player-vs-system call at face value). Player/DM/Critic run Sonnet/Opus.
