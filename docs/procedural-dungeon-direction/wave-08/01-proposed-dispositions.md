---
type: design-study
status: CLOSED — 2026-07-22 at §17.7 (founder-review session; sweep §17.6)
wave: 8
part: 01
legacy_sections: "17"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 8 running record — proposed dispositions (section 17)

Question wording preserved verbatim from `../QUESTIONNAIRE.md`. Labels and required phasing
fields as in Wave 7's record.

## 17.1 Inherited law recovered before any new question

Wave 8 does not re-ask: every meaningful structure already has stable identity plus generic
material/volume/support/attachment/condition seams with one narrow family exercised first (W3
P3.3, Adam's ideal "everything has some mechanical existence eventually" preserved as the
destination); certified TTRPG action resolution — not renderer physics — commits physical facts
(P3.10 correction); structural mutations persist until authorized repair/removal, material
condition has lifecycle, residue may coalesce (P3.11/G3.2); connection creation/mutation flows
through typed receipts under symmetric laws for any capable actor (P4.9/F4.9b/G4.1); required
progression keeps validated redundancy/recovery or an explicit failing branch while optional
access may be genuinely lost (P4.7); clues get causal resilience, not plot armor (F10.7d); local
prop transactions escalate structure/topology/fire/support changes to this wave's owner (P5.9);
touched-state assertions promote ids rather than minting duplicates (G5.1); typed terminal
outcomes are owned by `TerminalDisposition` (W2 §10.11.50) with `obliterated` as compatibility
projection only; offscreen advancement is deterministic lazy catch-up with due-hard-consequence
preservation and fail-closed recovery (W2 §10.2/§10.10, P2.14 "never spontaneous restock");
only magnitude-20 Mythic crits (or licensed C3-C4 owners) mint persistent world-scale novelty,
under the Mythic/Worldbreaker reach profiles (W2 §10.11.36-44); hostile environmental adaptation
uses causal commitment windows and graduated counters with no reactive scaling (G2.1); and
presentation obeys receipts, tells, viewpoint law, and the anti-pop boundary (W10).

## 17.2 Proposed dispositions

### P8.1 — mutation operations and owners
> "What typed operations may change object, assembly, zone, structure, connection, resource,
> ecology, or place state; which system owns each; and what source authority, target,
> precondition, cost, evidence, dependency, and terminal rule must every mutation declare?"

**Disposition: FABLE-PROPOSED.** One **MutationOp registry** at the contract boundary (the
GEN-DM-3 pattern — declared once, never per-handler): each op declares {op kind, owner system,
source authority (resolved action / crit mandate / licensed owner / world clock / DM C-band),
target ids, preconditions, cost/time/noise, emitted evidence, dependency edges, duration class,
terminal rule}. Initial op families: break/damage, ignite/extinguish, flood/drain, collapse,
breach, block/seal, bridge/span, tunnel, repair/stabilize, contaminate/cleanse, power on/off,
infest/clear. Owners are the existing canonical owners (objects/assemblies → W5 transaction;
structure → W3 citizenship; connections/topology → W4 receipts; resources/ecology → W2 stock
laws; place state → site operating model); the registry adds no new owner — it types the verbs.
Dungeon example: "chop the door" = break(op) on Connection(closure facet), source = resolved
attack vs object AC/HP, evidence = splinters + noise, dependency = alarm clock listener.
DM-seat: a provider proposes `break` with a target id; validation runs the real object rules; a
rejected proposal is never narrated as done.
Cost: engine M (registry + routing), authoring S, QA M. Phase: PRE-ALPHA CRITICAL (registry
seam) with op breadth PROOF→MVP→GOAL. Seam: registry schema + op ids in receipts. Promotion:
new op families as content demands. Debt: unregistered interactions refuse honestly. First
Clay Pass: the F8.1 destructible proof; MVP gate C2C. Owner: this record.

### P8.2 — material response and damage
> "How do material, construction, scale, force, damage type, temperature, pressure, corrosion,
> contamination, magic, wear, and existing condition determine damage, resistance, fracture,
> ignition, deformation, leakage, collapse, and repair without a bespoke simulation for every
> noun?"

**Disposition: FABLE-PROPOSED.** **MaterialProfile classes, not per-noun physics**: every
structural/prop citizen references one of a small set of material/construction profiles (wood-
plank, timber-beam, stone-block, masonry, iron, cloth/rope, glass/ceramic, earth, bone,
enchanted-X overlay) carrying SRD object statistics first (AC, HP by size/fragility, damage
thresholds, immunities — the DMG object rules are the rules authority), plus typed response
tags (flammable, brittle, load-bearing-capable, porous, conductive) and condition-state
transitions from W5's sparse grammar (intact→damaged→breached→destroyed; dry→wet; cool→burning
→charred). Scale multiplies HP/threshold by size class, never invents new physics. Magic/
contamination act as overlays with their effect text as authority (P6.8's effect-text law
generalized). EVIDENCE-GATED: profile granularity (how many profiles the corpus actually needs)
is measured at the first destructible proof, not authored exhaustively now.
Dungeon example: the same axe blow — pine door (AC 15, HP 18, flammable) breaches; iron
portcullis (AC 19, threshold 10) shrugs anything under a heavy blow.
Cost: engine M, authoring M (profile table), QA M. Phase: PROOF→MVP→GOAL (proof: 3-4 profiles
in one room; MVP: profiles for supported noun families; goal: realm/culture material breadth
via W3 constitutions). Seam: profile id on every citizen (already implied by W3 material
identity). Clay: F8.1 proof; C3C contrast. Owner: this record beneath SRD object rules.

### P8.3 — propagation
> "How do fire, smoke, water, gas, cold, electricity, disease, infestation, collapse, flooding,
> contamination, alarms, and magical effects spread through owned graphs with bounded cadence,
> barriers, fuel/resources, aggregation, and deterministic lazy catch-up?"

**Disposition: FABLE-PROPOSED.** **Graph propagation, never cellular free-simulation**: each
propagating process is a typed front on an owned graph — room/connection graph for fire/smoke/
gas/flood/alarm; support graph for collapse; stock/dependency graph for contamination/disease/
infestation — advancing on bounded cadence ticks (turn-scale in mounted scenes, clock-scale
cold) consuming fuel/capacity, stopped by typed barriers (sealed Connection states, material
immunity, firebreaks), aggregating per room/zone rather than per cell (a burning room carries a
burn state + intensity, with cell-level detail only in the mounted active scene). Cold
advancement is the W2 lazy catch-up law: deterministic, bounded, due-hard-consequences preserved.
Active-front counts are capacity-capped (P8.11). Electricity/magical effects propagate only
where an effect text or owner licenses a medium.
Dungeon example: brazier tips (W7 setup) → floor-straw ignites (room front, intensity 1) → next
tick spreads through the open arch but not the sealed iron door → smoke state precedes flame by
one tick → alarm clock advances when the kennel cohort perceives it.
DM-seat: providers receive front states as facts ("the west hall is burning, smoke in the
corridor"), never simulate spread in prose.
Cost: engine M-L, QA M (golden propagation fixtures). Phase: PROOF→MVP→GOAL (proof: one fire
front across two rooms with one barrier — C2C's mutation gate is the natural home; MVP: fire/
smoke/flood/alarm/collapse on supported graphs; goal: full family list incl. disease/infestation
ecology with W2 owners). Seam: front records on graph ids + tick receipts. Promotion: corpus
demand + Mac budget headroom (P10.10). Debt: v1 families are few and coarse; unsupported
processes refuse or resolve narratively *without* state claims. Clay: C2C; C3B (time away).
Owner: this record.

### P8.4 — topology mutation
> "What authority and validation may breach, block, collapse, bridge, tunnel, move, rotate,
> invert, flood, seal, repair, or create paths; how are connectivity, occupants, supports,
> maps, secrets, pursuit, and escape reconciled atomically?"

**Disposition: INHERITED + FABLE-PROPOSED atomicity detail.** W4 already owns the instrument:
topology changes are Connection lifecycle receipts (create/destroy/state-change) under certified
symmetric laws, with progression safety (P4.7) and knowledge/map separation (P4.10). Structural
causes (collapse, breach) originate here as MutationOps whose receipts *contain* the W4
connection deltas. Proposal: the **atomic reconciliation transaction** — one mutation receipt
resolves, in order: connectivity delta → occupant resolution (traversal/fall owners; trapped =
waiting/cold records, never deletion) → support-graph re-check (secondary collapse queued as new
fronts, not instant cascade) → map/knowledge updates per viewpoint → pursuit/escape route
re-validation (P4.7 check) → evidence emission. Rotate/invert/move-room remain licensed-rare
(Mythic/realm law) but ride the same transaction.
Phase: PRE-ALPHA CRITICAL for the transaction seam (C2C multi-room mutation is its gate); rare
exotic ops are GOAL. Debt: v1 supports breach/block/collapse/bridge/seal/repair only. Owner:
W4 (connection truth) + this record (causes/transaction).

### P8.5 — temporary, persistent, repairable, and permanent
> "How are duration, stabilization, maintenance, restoration, regeneration, scarring,
> recurrence, and irreversibility chosen; what makes a change local, site-wide, regional,
> Mythic, or Worldbreaker?"

**Disposition: INHERITED composition + OPEN-ADAM default (Q8-A, §17.4).**
Inherited pieces: duration/lifecycle typing from P3.11 history layers; repair as certified
action/owner work (P4.9, P8.1's repair op); scale-of-change authority already graded — local/
site changes by ordinary resolved mechanics, regional+ requires licensed owners or C3-C4, and
permanent world-law novelty only through magnitude-20 crits under the Mythic/Worldbreaker reach
profiles (W2). Proposal: five duration classes on every mutation receipt — instant · scene ·
site-clock (decays/stabilizes on site time) · persistent-until-repaired · permanent-scar — with
the *default* class per op family being the founder question below. Regeneration/recurrence
only via a real owner (a spring refills, a warren re-infests) per "never spontaneous restock."
Phase: MVP (classes on receipts). Owner: this record; scale authority: W2 crit law.

### P8.6 — causal chains and dependencies (with G8.1)
> P8.6: "Under G8.1, how do mutations record parents, targets, propagation, supported/blocked
> dependencies, consumption, evidence, and downstream affordances so an early change can be
> legally used much later without keyword inference?"
> G8.1: "How do environmental mutations declare causal parents, targets, dependencies,
> propagation, duration, repair, evidence, and downstream affordances so an early fact can be
> legally consumed much later?"

**Disposition: INHERITED.** This is the G2.1/SceneFact machinery plus W3's typed history layers
applied to mutations: every mutation receipt carries parent (causing receipt/action), targets
(stable ids), dependency edges (supports/blocks), consumed resources, emitted evidence objects,
and duration class; downstream affordances surface as typed relation edges (the nine G2.1.4
relation modes — "two things may rhyme without sharing an origin" bars keyword inference by
construction); later legal consumption is a REPLAY/DERIVE lane read of the stored chain, and
dormant consequences are callback stubs. Nothing new to decide; Wave 8 contributes only the op
vocabulary those records reference (P8.1). Owner: G2.1 lifecycle + this record's op schema.

### P8.7 — terminal disposition across nouns (with G8.2)
> P8.7: "Under G8.2, how do ordinary damage, breakage, death, transformation, banishment,
> disintegration, planar consumption, obliteration compatibility, remains, inventory, identity,
> witnesses, recovery, and history resolve for actors, items, creatures, and structures?"
> G8.2: "How do ordinary damage, transformation, banishment, disintegration, planar consumption,
> and Worldbreaker-scale permanence resolve through typed terminal disposition while preserving
> inventory, remains, identity, witnesses, recovery possibilities, and prior history?"

**Disposition: INHERITED.** W2 §10.11.50 already rules it: `TerminalDisposition` owns
life/continuity, remains, location/destination, inventory, recovery, evidence, and identity
axes; ordinary death keeps intact corpse + carried loot (ITEM-LEGACY custody chain); special
effects override only licensed axes; observed history is preserved absent a separately
authorized lens; `obliterated` is compatibility projection only; transformations are P6.8's
engine-owned form events (never identity forks). Wave 8 adds only the **structure terminal
family** (FABLE-PROPOSED, thin): destroyed structures resolve to typed remains (rubble/debris
citizens with material profile, salvage affordances, and blocking state) — debris is a real
noun, not vanishing geometry. Phase: MVP. Clay: F8.1 proof includes one destruction-to-debris
trace. Owner: W2 law + this record's structure family.

### P8.8 — inactive and offscreen mutation
> "Which processes advance while rooms/sites are cold; what summaries make catch-up
> deterministic and bounded; how are due hard consequences preserved; and when must a site
> reactivate into a dedicated crisis rather than silently aggregate?"

**Disposition: INHERITED + FABLE-PROPOSED threshold rule.** Inherited: cold state advances by
deterministic lazy catch-up on owned clocks; due hard consequences are preserved, never eroded
by aggregation (W2 §10.2/§10.10; P2.20's cold-reactivation adversarial trace; F10.9h bounded
offscreen receipts). Proposal: the **crisis-reactivation threshold** — catch-up that would
cross a typed materiality line (structure loss affecting progression safety, casualties among
rooted NPCs, front reaching an adjacent active site, custody loss of committed unique items)
may not resolve silently; it opens a dedicated CrisisChain/site event for foreground play or an
owner-governed obligation (the F10.9h civic-obligation pattern). Below the line, fronts resolve
into summarized stable end-states (burned-out wing, flooded cellar) with evidence.
Phase: MVP (threshold typed conservatively). Clay: C3B (time away and return). Owner: this
record + W2 catch-up law.

### P8.9 — player, DM, system, and Crit authority
> "Which mutations arise directly from resolved mechanics, which are DM-authored consequence
> forms inside envelopes, which require place/ecology owners, and which need C3-C4 or explicit
> Crit reach; how are hostile and beneficial inventions kept symmetric and fair?"

**Disposition: INHERITED.** The authority lattice is complete: resolved mechanics commit
directly (engine-first receipts); DM-authored consequence forms live inside C0-C4 envelopes
with source-posture receipts, valence-neutral, hostile forms under causal commitment windows
and graduated counters; place/ecology-scale changes need their canonical owners; Mythic/
Worldbreaker permanence needs magnitude-20 crits under the chosen reach profile; symmetry is
F4.9b's shared-law rule ("shared laws, not identical intelligence"). Wave 8 contributes only
routing: every such authority expresses itself *through the MutationOp registry* so provenance
is uniform. Owner: W2 G2.1 + crit law; this record (routing).

### P8.10 — mutation tells and visual history
> "How do sound, debris, cracks, stains, smoke, temperature, motion, changed silhouettes,
> inaccessible routes, map updates, and Codex/evidence make active danger and lasting scars
> readable without revealing hidden propagation or unsupported precision?"

**Disposition: INHERITED.** P6.10's viewpoint-legal diegetic tells + expandable exact access,
G10.2's promoted-affordance/history legibility (closed with P10.7), W10's receipt-driven
feedback families and truthful fallbacks, P4.10's honest map precision, and P3.11's evidence/
residue layers together answer this. Proposal (thin): every MutationOp declares its evidence
objects (P8.1 already requires this), and active fronts emit *perceptible* tells only where a
viewpoint could perceive them — hidden propagation stays hidden (no universal glowing outline
law). Presentation weathering never claims mechanics (G3.2). Owner: closed sources; this
record's evidence field.

### P8.11 — performance and saturation
> "What active propagation fronts, mutable entities, topology edits, dependencies, histories,
> particles/visual states, and catch-up work fit each scene/site budget; how are minor resolved
> facts compacted without erasure?"

**Disposition: INHERITED law + EVIDENCE-GATED numbers.** Capacity-first limits, active slices,
event-driven propagation, bounded between-turn work (W2 §10.11.10 — treating fallback
activation in a normal fixture as an architecture failure); compaction that folds, never erases
(G2.1 lifecycle; conservative obligation-licensed compaction F10.9m); coalescing residue
(G3.2). Budgets (front counts, mutable-entity caps, catch-up work per remount) are measured on
the Mac low-tier fixture per P10.10's process — proposing numbers today would be invented.
Owner: W2/W10 laws; numbers: retained measurements.

### P8.12 — Wave 8 acceptance corpus
> "Which materials, damage types, propagation networks, topology changes, repairs, offscreen
> intervals, terminal dispositions, Mythic/Worldbreaker events, save migrations, and visual
> captures prove causal correctness, persistence, fairness, boundedness, and historical
> legibility?"

**Disposition: FABLE-PROPOSED structure + EVIDENCE-GATED thresholds.** The P6.12 incremental-
overlay pattern on retained fixtures: door chop-through · wall breach with debris custody ·
rope/bridge cut mid-crossing (W4 trace reuse) · fire front with barrier + smoke tell + alarm ·
flood with drain/seal · collapse with occupant resolution + secondary front · repair/stabilize
trace · offscreen interval with due-consequence preservation and one crisis-threshold breach ·
one Mythic-crit permanent scar trace (Worldbreaker variant behind the profile flag) · terminal
debris/salvage trace · save/remount/migration of every family above · fixed-camera captures.
Admitted only for uncovered risk; thresholds via P10.12 process. Owner: this record + ledger.

## 17.3 Generated follow-up

### F8.1 — the first destructible proof owner (material sequencing gap)
W3's ledger row left "first destructible proof owner to be reconciled with Wave 8." Proposal:
**one retained pass — "the breakable door"** — in the clay room lineage after C1C: one door
(wood profile) and one column (stone profile) exercise break/burn ops end-to-end: TTRPG action
resolution → MutationOp → material profile → condition states → connection delta (door) /
support check stub (column) → debris → tells → EngagementLens performance → save/remount →
honest refusal on an unregistered target. One primary risk: the mutation transaction spine.
Slots into the ladder between C1C and C2C (C2C then proves the multi-room causal reach).
EVIDENCE-GATED: its Mac cost informs P8.11 budgets. No new founder decision required.

## 17.4 The founder question (easy batch, one item)

### Q8-A — default permanence/scarring posture (OPEN-ADAM)
When a mutation's duration class is not dictated by rules text or an owner, what is the world's
default bias? All options keep repair/regeneration owner-driven and "never spontaneous restock."

- **A. Conservative-healing.** Ordinary damage defaults to site-clock stabilization (the world
  quietly tidies); scars persist only when dramatically licensed. Cheapest saves; weakest
  memory; risks contradicting "the world remembers what it SAW."
- **B. Persistent-until-repaired (recommended).** Physical changes persist until a real owner
  repairs them; scarring is the norm; compaction summarizes but never erases. Matches the
  reputation law, W3 history layers, hard-and-dangerous stakes, and the Diversion-rule ethos
  (consequences are real but don't chase you). Moderate save growth, bounded by the sparse-
  record law.
- **C. Accumulating-ruin.** As B, plus ambient decay fronts advance world-wide on the clock.
  Maximum entropy flavor; highest cost; risks a world that rots faster than play touches it.

Recommendation: **B**, with per-realm decay flavor as later content (a Gloom site may *choose*
C-like fronts through its owners).

#### Founder ruling — 2026-07-22 (Adam, Batch 1)

**Q8-A: B.** Adam's answer, verbatim: "B." Default permanence is persistent-until-repaired:
physical changes persist until a real owner repairs them, scarring is the norm, compaction
summarizes but never erases. Per-realm decay flavor stays later content — a site may choose
C-like fronts only through its owners. **Q8-A is LOCKED.** The duration-class machinery
(P8.5's FABLE-PROPOSED component) still awaits the Wave 8 sweep.

## 17.5 Coverage and authority audit (proposed)

All 14 bank questions dispositioned; 1 generated follow-up (F8.1); 1 founder item (Q8-A).
Authority: Wave 8 owns physical-change verbs, material response classes, propagation fronts,
and the mutation transaction — beneath SRD object rules, over W3/W4/W5 owners, feeding W7
affordances, scheduled by W9 only through licensed reserves, persisted per W6/W12 structure.
No contradiction with closed waves found while drafting; the F4.4a falling-damage rule and the
"Hazard Severity 20d6/~70 ft" content debt are noted as untouched by this wave. **No closure is
claimed; no implementation is authorized.**

## 17.6 Wave 8 sweep — 2026-07-22 founder review (Adam)

Adam swept the thirteen items (P8.1-P8.12 + F8.1) in the plain-language founder review.
Verbatim rulings and their dispositions:

1. **P8.1 — ACCEPTED with the robustness rider.** "I think this is good as long as the
   catalog is robust and edge cases are considered." → Acceptance rides on the registry
   growing to a robust op vocabulary; edge-case coverage is owned by the P8.12 corpus plus
   the honest-refusal debt rule (unregistered interactions refuse, never fake).
2. **P8.2 — ACCEPTED with a calibration touchstone + authored sourcing.** "That's right, i
   think BG3 handled this in an easy way with two types of force? regular force and heavy
   force, we can probably go a little more robust than that, but you have the right idea."
   Follow-up refinement, verbatim: "for #2 i mean, we can look through the DMG or the
   dungeon builders handbook and find all the door types." → BG3's two force tiers are the
   floor reference; the initial door/material catalog is **gathered from the books, not
   invented** — the DMG's object rules (AC/HP/thresholds, break DCs, door types: wooden,
   reinforced, stone, iron, portcullis) and dungeon-building references, mined via the
   established vision-read pipeline (scanned-PDF OCR gotcha; page index at
   `dev/model-qa/dmg-page-index.json`). Profile granularity stays EVIDENCE-GATED at the
   F8.1 proof: the gathered catalog proposes, the proof measures what the corpus needs.
3. **P8.3 — ACCEPTED with the granularity + conduction amendment.** "probably grid unit by
   grid unit and material by material, a fire is only going to set steel on fire if it is
   incredibly hot, though the steel might get hot enough to burn you anyways." → Reconciled
   in session: active mounted scenes resolve spread at cell resolution consuming material
   flammability (the proposal's cell-detail clause); cold/offscreen aggregation stays
   room-level (the performance law); ignition is material-gated — steel ignites only under
   extraordinary heat sources. **New state family from this ruling:** the heated-state
   secondary hazard — conductive profiles gain a cool→heated condition whose contact harm
   resolves through real rules without ignition.
4. **P8.4 — ACCEPTED.** "yeah, no half changes."
5. **P8.5 — ACCEPTED with the organic-regrowth rider.** "regrowth can happen in nature, but
   not in urban or most dungeons. So organic things can regrow over time." → Ecology is a
   real owner: organic materials and living systems may regrow on ecology clocks; built
   urban/dungeon fabric never self-repairs. "Never spontaneous restock" stands intact —
   regrowth always has a named owner and clock.
6. **P8.6 — ACCEPTED.** "yes."
7. **P8.7 — ACCEPTED.** "correct."
8. **P8.8 — ACCEPTED with the no-plot-armor rider.** "yeah, i think that just feels
   unfair...however there are big narrative beats that might wipe out entire villages and
   towns or special NPCs, so just because it's offscreen doesn't mean it has plot armor."
   → The crisis threshold governs **how** a materiality-crossing consequence resolves
   (visibly: foreground crisis, owner-governed obligation, or discovered aftermath) — never
   **whether** it may happen. Offscreen villages and special NPCs carry no plot armor; due
   hard consequences land per the preservation law; they just cannot land silently.
9. **P8.9 — ACCEPTED.** "As far as I can tell this is the best way."
10. **P8.10 — ACCEPTED with the senses note.** "That's right, and nightvision also gives
    bonuses in the dark." → Perceptibility of tells is evaluated against each viewer's real
    senses — darkvision and kin per the SRD — through the existing viewpoint law; no new
    mechanism required.
11. **P8.11 — ACCEPTED.** "yes."
12. **P8.12 — ACCEPTED.** "yep."
13. **F8.1 — ACCEPTED; generated F8.2.** "yes, i mean we will have to do a pass on a
    comprehensive list of all of the clay room proving ground waves." → Captured as F8.2
    below.

### F8.2 — the consolidated clay-pass enumeration (mechanical follow-up)

From Adam's F8.1 sweep language (verbatim above): once the remaining waves close, run a
comprehensive consolidation pass over the full Clay Proof Ladder — enumerate every pass
(existing + wave-added), order, parallelism, coverage gaps, and retirement candidates in one
consolidated list. Not a founder fork: this is the Wave 12 build-order consolidation family's
work (P12.10) executed against the ladder as owner; the ladder's "what remains provisional"
section already anticipates it. Trigger: the Wave 12 gate window (or Adam's earlier word).

## 17.7 Wave 8 closure — 2026-07-22 (Adam)

Adam explicitly closed Wave 8 in the 2026-07-22 founder-review session. Verbatim, in
response to the closure ask ("give me the closure word and I'll flip Wave 8's statuses"):
"ok, wave 9 it is." The closure takes the sweep at §17.6 (all thirteen items ruled, with the
five riders: robustness, book-sourced material catalog over the BG3 floor, cell-resolution
active spread + heated-state conduction, organic-regrowth ownership, no-plot-armor
offscreen), the phasing audit as presented (four pre-alpha-critical contracts; the
proof→MVP→goal table; the F8.1 ladder slot; ledger refinements + the new mutation row), and
the Q8-A founder ruling at §17.4. Wave 8 is **CLOSED on its recorded phased basis**: design
disposition and traceability only; no implementation, evidence, dependency, or release
claim; the implementation hold stands until Wave 12's gate. Reopening requires an explicit
named contradiction per the reopen law.
