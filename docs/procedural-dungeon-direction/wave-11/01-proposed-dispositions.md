---
type: design-study
status: CLOSED — 2026-07-22 at §19.7 (founder-review session; sweep §19.6)
wave: 11
part: 01
legacy_sections: "19"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 11 running record — proposed dispositions (section 19)

Question wording preserved verbatim from `../QUESTIONNAIRE.md`. Labels and phasing fields as in
the Wave 7 record.

## 19.1 Inherited law recovered before any new question

Wave 11 does not re-ask: the workbench must lock and reroll individual layers (architecture,
portals, dressing, arrangement, skin, state), show room program / candidate and rejected portal
slots / reservations / footprints / sockets / candidate gallery / score breakdown / degradation
/ provenance, let Adam pin or adjust examples to teach, and capture *why a candidate won*
rather than storing hand-authored production rooms (FOUNDATION §2.11); production compilation
may try hidden candidates but a discovered room never rerolls (§2.10); human-readable rollers
and recipe packages are the sole authoring surface, compiling with schema validation and full
provenance — generated artifacts are never the editing surface (W1 §8.12.3; CLAUDE.md);
solver/compiler failures explain themselves in plain language with retained rejected and
unsatisfied traces (P3.5/P3.8); the clay corpus is constituted — deliberately small retained
deterministic fixtures, one primary risk per pass, grown by uncovered risk, never discarded
(CLAY-PROOF-LADDER; P6.12/P5.12); acceptance is three-layered (deterministic/golden,
batch/property, human/play) and "no paper justifies replacing representative human judgment
with aggregate green counts" (P2.20); asset admission carries technical/visual/provenance/
license evidence with conservative rights quarantine (P10.11); certification of reusable
inventions is governed and initially human/hybrid (G2.1-CERT); autonomous lanes exist only
under the charter's multi-agent gates, the WIRING LAW, and never-trust-self-reported-green; and
evidence-method discipline (frozen envelopes, matched captures, vetoes-then-comparison) is
P10.12's.

## 19.2 Proposed dispositions

### P11.1 — workbench users and jobs
> "What must Adam, a future designer, a table/content author, an artist, a modder, an AI agent,
> QA, and a player-facing creator each inspect or change; which powers and dangerous operations
> must remain distinct?"

**Disposition: FABLE-PROPOSED tiers + OPEN-ADAM identity (Q11-A).**
Proposal: v1 audiences are exactly three — **Adam** (all powers), **AI agents** (propose +
diagnose; commits only through the ordinary reviewed lanes), **QA/harnesses** (read + assert).
Future designer/artist/modder/player-creator are *feature-goal tiers* whose seams (role-scoped
powers, sandboxing, provenance) are retained now because P10.11/P12.8 already require them.
Power classes kept distinct from day one: READ/inspect (safe, everything) · PREVIEW/propose
(validated, uncommitted) · COMMIT-SOURCE (edits authored sources; Adam or explicitly authorized
lanes) · DANGEROUS (migrations, retirements, certification, autonomy grants — always explicit,
always logged, never batched silently). Whether a *player-facing creator* is ever product is
Adam's (Q11-A).
Cost: engine S (role flags on existing tools), QA S. Phase: MVP (three audiences). Seam: power-
class flags. Clay: first workbench pass below. Owner: this record.

### P11.2 — source-of-truth and compile path
> "Which markdown/tables/data/assets/schemas are authored sources, which artifacts are
> generated, how are provenance and ownership exposed, and how does the workbench prevent
> editing compiled outputs or creating parallel truth?"

**Disposition: INHERITED.** This is the repo's standing constitution: edit-source →
compile-artifact; the generated-artifact registry (tables.js, data/*.js, dm-contract.json,
reports) is never hand-edited; manifest.json owns module/symbol truth; provenance stamps
(source path + hash + timestamp) make staleness visible; drift harnesses gate by regeneration.
The workbench *displays* provenance and refuses edit affordances on generated surfaces — a UI
obligation over existing law, not a new decision. Owner: CLAUDE.md/W1 §8.12.3.

### P11.3 — semantic and recipe authoring (with G11.1)
> P11.3: "Under G11.1, how are fact types, classes, services, attributes, relationships,
> constraints, triggers, effects, costs, affordances, failures, variants, motifs, fallbacks,
> and version rules created and explained without requiring raw code?"
> G11.1: "How can a human-readable roller/workbench author fact types, state transitions,
> combination permissions, affordances, motif hooks, and fallback behavior while compiling them
> into controlled, versioned contracts?"

**Disposition: FABLE-PROPOSED.** Generalize the proven table pattern: **declarative authored
sources** (markdown tables + lean YAML frontmatter, exactly the corpus's existing idiom) for
each new vocabulary this program created — function/recipe rosters, obligation profiles,
MaterialProfiles, AffordanceTags, MutationOp families, card kinds, doctrine profiles,
CultureVisualConstitution inputs, realization manifests — each compiled by a validator that
resolves references, derives what must never be hand-stored (the lean-frontmatter law), pins
versions, and emits the runtime registry plus a human diff report. No raw code to author; new
*mechanics* (vs. content) still require registered primitives (the G2.1 compile law — authored
data may compose primitives, never define executable behavior). Explanation = every compiled
contract renders a plain-language card in the workbench (what it is, what consumes it, what
would break).
Cost: build-lane M (one generator pattern reused), QA M. Phase: PROOF→MVP→GOAL (proof: one new
vocabulary — AffordanceTags — authored→compiled→consumed end to end; MVP: the program's core
vocabularies; goal: full G11.1 breadth incl. motif hooks). Seam: shared validator + registry
emitter. Clay: rides the owning waves' passes. Owner: this record.

### P11.4 — controlled preview and compilation
> "How does an author preview rolls, site graphs, rooms, assemblies, mechanics, inventions,
> migrations, and visuals; fix meaningful choices; request variants; and compile only after
> validation while preserving reproducible seeds and inputs?"

**Disposition: INHERITED.** FOUNDATION §2.11/§2.10 already grant layer lock/reroll, hidden
candidate exploration, and candidate galleries; W1 §8.12.3 fixes seed/provenance retention;
P12.6 (inherited from capsule law) fixes reproducibility. FABLE-PROPOSED thin addition: a
**preview sandbox flag** — everything previewed is watermarked uncommitted and cannot leak into
a live world (the dev-portal boundary; DEV-PORTAL.md is the implementation-evidence seam).
Owner: FOUNDATION; this record's sandbox flag.

### P11.5 — constraint and causal debugger
> "What view explains why a candidate appeared, which constraints passed/failed, what relaxed,
> who owned each fact/change, how an effect propagated, why a callback was legal, and where an
> unsatisfied request stopped without dumping internal noise?"

**Disposition: FABLE-PROPOSED (view over mandated data).** The data already exists by law:
retained rejected/unsatisfied traces (P3.5/P3.8), reservation diagnostics (P3.6), receipt
lineage (G8.1/G2.1), card legality predicates (P9.2), compile diagnostics (G2.1.12's typed
codes). Proposal: the **Explain panel** — for any selected artifact (room candidate, receipt,
card play, compile result) render its causal card: inputs → constraints evaluated (pass/fail/
relaxed with owners) → chosen-over alternatives → downstream consumers. Depth is progressive
(summary card first, full trace on demand) so internal noise stays behind a click. This is a
read-only projection; it can never edit what it explains.
Cost: engine M (one panel, many adapters), QA S. Phase: PROOF→MVP→GOAL (proof: Explain over the
C1A room's compile + one receipt chain; MVP: Explain over supported artifact kinds; goal:
G11.2's full causal debugger). Seam: every diagnostic law keeps machine-readable output (already
mandated). Clay: first workbench pass. Owner: this record.

### P11.6 — clay corpus design
> "Which small, deliberately ugly/cheap canonical scenarios isolate site purpose, roster,
> structure, portals, assemblies, scales, tactics, mutation, cards, rendering, invention, and
> migration so rule quality can be judged before expensive content/art production?"

**Disposition: INHERITED.** The Clay Proof Ladder *is* this answer — retained deterministic
fixtures with one primary risk each, vertical through production paths, grown by uncovered
risk, plus the golden-site portfolio as the eventual breadth. The waves drafted in this pass
slot their proofs into the same ladder (W7 archetype overlay, F8.1 breakable door, W9 soak
traces). Nothing new to decide; the corpus's *production tooling* (batch runners, capture rigs)
is this wave's MVP work item. Owner: CLAY-PROOF-LADDER.

### P11.7 — golden causal traces (with G11.2)
> P11.7: "Under G11.2, how do long deterministic sessions prove early nouns, actors, resources,
> clues, conditions, positions, rolls, effects, callbacks, inventions, and terminal outcomes
> survive, become consumable only when legal, and fail loudly on continuity drift?"
> G11.2: "What causal debugger and clay corpus prove that an early prop, actor, resource, clue,
> or condition survives many turns, is consumed only when legal, produces a readable trace, and
> fails loudly when narration attempts a Leonardo-style continuity error?"

**Disposition: INHERITED + FABLE-PROPOSED assertion layer.** Inherited: the deterministic/
golden proof layer and eight adversarial transition traces (P2.20 — including the long-delay
SceneFact/callback consumption trace, which is exactly the Leonardo class); the state-hygiene
eval harness (golden-turn replay scored on state hygiene); G12.2 will own the flagship IP-clean
long trace. Proposal: **continuity assertions as first-class fixture content** — a golden trace
declares its invariants (this noun's id/custody/state at turn N; this callback illegal before
receipt X; this consumption must fail) and the harness fails loudly on any drift, including a
provider narrating a fact the engine never committed (the validation boundary already blocks
commitment; the assertion catches the *narration* attempt too). Phase: MVP (assertions on
existing harness). Clay: soak traces + C4C. Owner: this record over P2.20/STATE-HYGIENE-EVAL.

### P11.8 — batch simulation and coverage
> "How are purpose/size/state/realm/Spice/seed matrices, solver tails, path playability,
> resource balance, visual captures, model behaviors, edge cases, and regression diffs sampled
> and summarized without mistaking aggregate green metrics for good individual worlds?"

**Disposition: INHERITED + FABLE-PROPOSED sampling rule.** Inherited: the batch/property layer
exists by P2.20 with the human-judgment law as its cap; gauntlets and drift harnesses are live
evidence; P10.12 owns capture method. Proposal: **mandatory per-batch inspection samples** —
every batch run emits N randomly-sampled *individual* worlds/rooms/traces for eyes-on review
alongside its aggregates, and a batch cannot green a gate whose sample review was skipped
(mechanizing "no aggregate green counts"). Solver tails: batch runs retain worst-K solve traces
for the Explain panel. Phase: MVP. Owner: this record beneath P2.20.

### P11.9 — teaching and feedback loop
> "How do human selections, redlines, rejected candidates, semantic corrections, playtest
> complaints, runtime traces, and certification outcomes become versioned examples, rules,
> fixtures, weights, or model context without silently learning private data or overfitting
> one preference?"

**Disposition: FABLE-PROPOSED.** The **preference-capture ledger**: every teaching act (pin,
redline, rejection, correction, complaint disposition) is a versioned WHY-record {artifact,
verdict, reason, scope} — FOUNDATION's "why a candidate won" made durable. Promotion out of the
ledger is always explicit: → a fixture (regression), → a rule/constraint (compiled, versioned),
→ a weight change (versioned control surface), → curated model context (reviewed corpus entry).
Nothing learns silently; nothing player/private enters shipped context without the consent lane
(G2.1-CERT/P12.8); single-preference overfit is bounded because rules/weights cite their
WHY-records and the sample-review law (P11.8) keeps eyes on outcomes. Live precedent: the
sprite-review tool's pass/fail→registry loop is this pattern's first working instance.
Cost: engine M, process S. Phase: PROOF→MVP→GOAL (proof: WHY-records on one workbench session;
MVP: ledger + explicit promotion lanes; goal: G11.1 motif hooks + curated context corpus).
Seam: WHY-record schema. Clay: first workbench pass. Owner: this record.

### P11.10 — mod/IP/provenance boundary
> "How are tables, rules, schemas, assets, recipes, model outputs, and external references
> licensed, attributed, packaged, sandboxed, versioned, dependency-checked, shared, removed,
> and prevented from contaminating core or another world?"

**Disposition: INHERITED skeleton + DEFERRED product depth.** Inherited: rights/provenance
states with conservative quarantine (P10.11); ATTRIBUTION forever-guards; P0-P4's law that
fiction never crosses worlds merely because mechanics do; world isolation and consent
boundaries (P12.8's frame); dependency loss handled by deterministic fallbacks or honest stops
(P12.4). DEFERRED: the *product* mod/sharing surface (packaging format, distribution, removal
tooling) — seam retained (everything above), destination named (a Wave 12/product decision),
trigger: the first real external-sharing intent or release planning. "Later" here has an owner:
[OPEN-QUESTIONS.md](../../canon/OPEN-QUESTIONS.md) batch 2 carries it to Adam at that trigger.
Owner: P10.11/P12.8 + this record's deferral.

### P11.11 — no-human pipeline authority
> "Which authoring, validation, visual generation, certification, migration, and promotion
> lanes may graduate to autonomous operation; what executable evidence, audit sampling,
> budgets, quarantine, rollback, and human exception path earn and retain that trust?"

**Disposition: INHERITED laws + EVIDENCE-GATED graduation contract.** Inherited: the charter's
multi-agent execution gates; never trust a subagent's self-reported green; the WIRING LAW
(checks drive production entry points); G2.1-CERT's human/hybrid-first certification with
per-domain graduation; P10.11 admission evidence.
Proposal (the graduation contract, gate-shaped): a lane may run autonomously only after — N
consecutive clean *audited* batches (audit = the P11.8 sample review) · a quarantine path
(outputs land staged, never straight to canon/master) · a rollback proof · budget caps ·
a standing human exception path · and revocation on any post-graduation audit failure.
N and budgets are measured per lane, not authored today. Live evidence: sprite regen and
gauntlet lanes are the first candidates; both already run staged.
Phase: MVP (contract enforced on existing lanes). Owner: this record beneath the charter.

### P11.12 — Wave 11 acceptance corpus
> "Which novice/expert authoring tasks, source edits, broken constraints, long traces, visual
> redlines, mods, IP hazards, autonomous batches, migrations, and rollback exercises prove the
> workbench understandable, safe, useful, reproducible, and capable of teaching the system?"

**Disposition: FABLE-PROPOSED structure + EVIDENCE-GATED thresholds.** Incremental overlay:
an authoring round-trip trace (source edit → compile → consume → Explain) · a broken-constraint
trace (validator refuses with plain language) · a generated-surface edit refusal · a teaching
trace (redline → WHY-record → explicit promotion → regression fixture) · a long golden trace
with continuity assertions (P11.7) · a batch run with sample review + worst-K tails · an
IP-hazard quarantine trace · an autonomous-lane graduation + revocation drill · a preview-
sandbox leak check · a rollback exercise. Novice-user tasks join when a second human user
exists (Q11-A's answer gates that). Owner: this record + P10.12 process.

## 19.3 Generated follow-up

### F11.1 — workbench-edit provenance (material gap)
When Adam pins/adjusts a candidate in the workbench, what exactly is stored? **FABLE-PROPOSED:**
the adjustment stores as a WHY-record plus a *constraint/preference delta* against the
generator's inputs — never as a hand-authored room blessed into production (FOUNDATION already
forbids that); replaying generation with the delta must reproduce the pinned outcome or fail
loudly (reproducibility law). This keeps teaching compatible with author-in/compile-to. Phase:
MVP with the teaching loop. No founder fork.

## 19.4 The founder question (easy batch, one item)

### Q11-A — workbench product identity (OPEN-ADAM)
Who is the workbench ultimately *for*? Architecture barely changes near-term (power classes and
sandboxing are retained regardless), but the product promise differs:

- **A. Internal instrument, forever.** Dev/authoring tool only; never shipped. Simplest;
  forecloses a creator community without a later reversal.
- **B. Internal now; player-facing creator as a tracked feature goal (recommended).** v1 serves
  Adam+agents+QA; the creator surface stays on the ledger with the P11.1 seams as its promotion
  path, triggered by product evidence (post-MVP demand). Matches the FABLE-DEV-TOOLS
  "read-only instruments first, source-safe editors later" posture.
- **C. Commit now to a creator product.** Pulls UI/safety/mod work forward before the game
  itself is playable; contradicts depth-over-breadth.

Recommendation: **B**.

#### Founder ruling — 2026-07-22 (Adam, Batch 1)

**Q11-A: B.** Adam's answer, verbatim: "B." The workbench is an internal instrument now — v1
serves Adam + agents + QA — and the player-facing creator surface is a tracked feature goal on
the Feature-Promotion Ledger, with the P11.1 power-class seams as its promotion path and
post-MVP product evidence as its trigger. **Q11-A is LOCKED.** The power-tier machinery
(P11.1's FABLE-PROPOSED component) still awaits the Wave 11 sweep.

## 19.5 Coverage and authority audit (proposed)

All 14 bank questions dispositioned; 1 generated follow-up (F11.1); 1 founder item (Q11-A);
1 explicit deferral with owner/trigger (P11.10 product depth). Authority: Wave 11 owns tooling,
corpus production, diagnostics-as-views, teaching capture, and autonomy graduation — it owns no
game semantics and can never bless content past a validator (GEN-LAW-6). No contradiction with
closed waves found while drafting. **No closure is claimed; no implementation is authorized.**

## 19.6 Wave 11 sweep — 2026-07-22 founder review (Adam)

Adam swept the thirteen items (P11.1-P11.12 + F11.1) in the plain-language founder review.
Verbatim rulings and their dispositions:

1. **P11.1 — ACCEPTED.** "sounds right."
2. **P11.2 — ACCEPTED.** "yeah, i think that's right."
3. **P11.3 — ACCEPTED with the level-design carve-out.** "in most cases that will be the
   idea, level design might require different approaches but everything else I would love
   for it to have that nod to the true D&D soul." → Table-authoring is the default and the
   idiom ("the true D&D soul"); level-design/geometry authoring may take different tooling
   when its time comes — a scope note, not a new decision; no parallel truth is licensed by
   it.
4. **P11.4 — ACCEPTED with the three-tier worlds rider.** "i think so, we will eventually
   need a real game world, and a test game world, and maybe even an experimental game
   world." → The preview-sandbox flag is the seed of a fuller taxonomy: **live worlds ·
   test worlds · experimental worlds** as first-class, non-leaking tiers. Routed to the
   Wave 12 sweep (P12.1 canonical save boundary) as a mechanical detail to bind there.
5. **P11.5 — ACCEPTED.** "yeah, that makes sense."
6. **P11.6 — ACCEPTED (the clay corpus stands), with a founder priority declaration
   recorded verbatim:** "maybe, i think one of our next big production waves will actually
   be getting the game to look like what I imagine. this means a big geometry pass and a
   big texture pass. it already looks pretty good. I think if we can aim for getting the
   first of the 12 golden sites looking decent we are getting somewhere in the engine,
   especially if we can get that scene to roll in various procedural configurations and
   still not be broken. right now the storytelling and game mechanics work pretty well.
   Things could be more mechanized, but the visual engine hasn't proven itself at all, so I
   want to at least get that to a rudimentary version, we will clayroom for a while before
   moving to the guard's post." → Read as direction, not authorization: clay-room proofs
   first, then **golden site 1 ("the guard's post") looking decent AND rolling across
   procedural configurations unbroken** as the visual engine's proving target; the next big
   production waves after this design program are a geometry pass + a texture pass. Feeds
   P12.10's build-order consolidation at the Wave 12 sweep and the Graphics Convergence
   lane; the implementation hold stands untouched today.
7. **P11.7 — ACCEPTED.** "very key to not ruining the entire game."
8. **P11.8 — ACCEPTED.** "yes."
9. **P11.9 — ACCEPTED.** "yes."
10. **P11.10 — ACCEPTED with the founder sequencing note.** "workshop stuff is further down
    the line than most everything else we have ruled on." → The deferral stands; workbench
    product work sits later in the queue than most ruled families — consistent with the
    visual-priority declaration at item 6.
11. **P11.11 — ACCEPTED.** "absolutely (no offense)." (None taken; the robots earn it.)
12. **P11.12 — ACCEPTED.** "yes."
13. **F11.1 — ACCEPTED.** "yes."

## 19.7 Wave 11 closure — 2026-07-22 (Adam)

Adam explicitly closed Wave 11 in the 2026-07-22 founder-review session. Verbatim, in
response to the closure ask: "ok lets close that and do the last one, then i gotta sleeep."
The closure takes the sweep at §19.6 (all thirteen items ruled, verbatim, with the
level-design carve-out, the three-tier worlds rider routed to the Wave 12 sweep, the visual-
engine priority declaration, and the workshop-later sequencing note), the Q11-A founder
ruling at §19.4, and the phasing audit as presented. Wave 11 is **CLOSED on its recorded
phased basis**: design disposition and traceability only; no implementation, evidence,
dependency, or release claim; the implementation hold stands until Wave 12's gate. Reopening
requires an explicit named contradiction per the reopen law.
