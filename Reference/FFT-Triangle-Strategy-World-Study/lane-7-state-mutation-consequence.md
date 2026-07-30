# Lane 7 — State, mutation, and visible consequence

Answers §5.8. Evidence classes per §12: **Observed** (frame), **Documented** (developer or
reliable gameplay source), **Inferred**, **Proposed** (Genesis translation).

## 7.1 What the model games actually change

### FFT (original)

- **Documented:** door/gate states in gate maps (portcullis opens for story beats); Fort
  Zeakden's fire is a *story-scripted* map state (the fort burns in cutscene continuity, not
  as a systemic burn); Riovanes roof and similar maps swap by scene, not by player act.
- **Observed:** across the five-angle corpus there is **no persistent battle scarring
  vocabulary** — no crater decals, no wall damage states, no post-battle residue. The board
  is immutable terrain + mobile units. Water/depth affects units (documented: drowning,
  water tiles), terrain never records the fight.
- **Verdict:** FFT's consequence layer lives in the *story state machine* (which map variant
  loads), not in the map. Changes are battle-local or scripted, never systemic.

### Triangle Strategy

- **Documented (guides; lane-6-touchstones sourcing):** Wolffort Streets — the market can be
  **packed away by asking the shopkeeper during the pre-battle walk**, converting plaza
  clutter into trap-ready ground; Hawk Statuette fire traps are armed pre-battle and fire
  once (with a story cost — using one locks out the Golden Route); Jens **builds ladders**
  that create new vertical access during battle; fire traps burn units on trigger.
- **Documented:** these are *authored per-scenario levers*, each hand-placed with bespoke
  narrative wiring. No general mutation vocabulary (any stall, any wall) is documented
  anywhere in the game's coverage.
- **Verdict:** TS proves the *player-legible value* of pre-battle environment interaction
  and mid-battle access creation — and simultaneously proves how expensive the authored
  version is (one map got the full treatment and it is the map every guide writes about).

### Ivalice Chronicles (Enhanced)

- **Observed (committed + acquired frames):** the remaster does not add an environment-state
  layer; it re-renders the same immutable boards. Battle-local unit states got new VFX; the
  world does not remember.

## 7.2 Before/after legibility

- **Documented:** TS's packed-market is maximally legible — the geometry is *gone*, the
  ground is clear. The trap state is legible via statuette props. XCOM (touchstone) grades
  cover pips and shows destroyed cover as rubble — state = silhouette change plus UI pip.
- **Inferred rule:** legibility ranks **geometry change > attachment/prop change > decal >
  tint**. A state that only tints is invisible at contact-sheet scale (the thumbnail test
  fails on tint-only states in every corpus image where we probed value at 25% scale).

## 7.3 Scripted vs systemic — the cost split

| | scripted (TS/FFT model) | systemic (Genesis target) |
|---|---|---|
| authoring cost | per-scene, per-beat, bespoke | one channel amortized over every scene |
| narrative fit | perfect (hand-tuned) | requires DM-seat interpretation discipline |
| replay/persistence | none (plays once) | native — state is world truth |
| examples | packed market, statuette traps | decal channel, material override, attachment socket, structural state family |

Genesis already **rules** the systemic side (ART-DIRECTION-CANON: layered durable-history
projection; mechanics-first physical-prop floor; broad eventual mechanical citizenship with
delivery tiers; Golden-Site native procedural decay = ordered event stack, not grunge). None
of it is built as a runtime mutation vocabulary yet (GENESIS-CAPTURE-INVENTORY: door
instance/state machinery exists in the Clayroom; decals exist as an authored register).

## 7.4 The minimum mutation vocabulary (§5.8 Q10), graded

Channel priority by (consequence-visibility × reuse × build cost), from the corpus evidence:

1. **decal** (scorch, blood, crack, paint, wear) — cheapest persistent memory; Genesis's
   decal canon (naturalistic organic marks, strict top/front projection) is already ruled.
   Carries: threshold scorched, wall bloodied, floor rutted.
2. **attachment/prop** (rope, brace, plank, banner, seal, tarp) — the TS-ladder lesson as a
   *channel*: player-made access and marks mount to sockets. Genesis's component-kit
   contract (isolated parts, engine assembles) is the right substrate.
3. **material override** (per-instance: repainted, soot-darkened, whitewashed, waterlogged)
   — needs per-instance material routing; CL-R4b's parent/instance separation points the way.
4. **geometry/structural state** (intact→worn→cracked→displaced→failed→braced/patched) —
   the Golden-Site decay ladder; highest cost, highest consequence (collision/cover change).
5. **light/emission** (lit/doused/flaring) — already per-light state (steady/flickering law);
   extend to lit/doused and ownership changes.
6. **occupancy/authority** (banner/seal/claim marks) — Site-8 Layered Control language;
   visually = decal + attachment on thresholds/fixtures.
7. **temporary VFX** (smoke, dust, settling) — event punctuation, never the record.

**Failure case to design against (§ lane brief):** changing a *shared* material parent
mutates every instance in the world — the CL-R4b parent/bay structure shows the trap: the
override must bind to the object instance (or its socket), never to the parent material.
Second failure: decal accumulation without coalescence — the ruled representative-residue
fields (coalesce low-consequence residue, preserve contributors) are the answer and already
canon; the mutation layer must write *into* that system, not beside it.

## 7.5 The cart-disguise worked example (§5.8 Q7)

Player: *"I repaint Farrow's cart and tar over the guild mark so the toll post won't know it."*

```text
player intent
  -> SRD resolution: tool check (painter's supplies or smith's tools), time cost, materials
     consumed; DC from mark prominence + weather; margin grades the result (Genesis's
     degrees-of-failure law: near-miss = sloppy edge, full fail = wet smear + witnesses)
  -> canonical object-instance state: cart#0413 gains
     { paint: {color: "ochre", quality: check-margin-band, appliedDay: D14},
       markState: {guildMark: "obscured", method: "tar", quality: …} }
     provenance: event id, actor, location, materials
  -> realization:
     decal channel — tar blotch decal over the mark socket (strict-side projection);
     material override — body panels remapped to ochre variant of the cart's family
     (instance-bound, parent untouched);
     attachment — none needed (no new geometry)
  -> mechanical consequences:
     recognition DCs change (toll-post guard rolls vs disguise quality);
     NO collision/cover change (same body);
     ownership truth unchanged — the DISGUISE is visual+social state, title never moved
     (custody/ownership projection law: a mark does not prove ownership);
     witness records: anyone who saw the repaint knows
  -> persistence/expiry:
     paint weathers on the condition clock (climate + use fields from the decay stack);
     tar chips at a documented rate → mark partially re-emerges as a decal state;
     repaint-over-repaint stacks as chronological layers (repair-is-an-overlay rule)
```

Everything above uses channels 1–3 + existing SRD resolution + existing provenance law.
**No bespoke scene branch, no new renderer authority, no model call in the loop** (SPEED
doctrine). That is the wedge: TS hand-authored one packable market; Genesis's rolled facts +
channel vocabulary make *every* cart, stall, wall, and threshold this kind of object.

## 7.6 What must accompany visible change (§5.8 Q9)

From the canon audit: a mutation that changes **collision, cover, sight, support, light
position, or reach** must update those truths in the same receipt (invisible tactical
furniture is banned; the smallest truthful proxy law). A mutation that changes only
appearance (paint, grime, mark) must *not* touch them. The channel taxonomy above encodes
exactly this split — channels 1/5/6/7 are truth-light, channels 2/4 are truth-bearing,
channel 3 is truth-light unless the material change implies condition (waterlogged wood →
weight/flammability facts live in canonical state, not in the shader).

## 7.7 Findings

```text
FINDING L7-1
Claim: Neither model game owns a systemic environment-mutation vocabulary; TS's celebrated
       market interaction is bespoke per-scenario authoring.
Evidence: TS Wolffort documentation (Game8/TheGamer/Neoseeker via lane-6-touchstones);
          FFT five-angle corpus shows no scar/residue vocabulary; IC frames unchanged boards.
Observed in: corpus-wide
Counterexample/limit: TS fire traps + Jens ladders are real mid-battle terrain changes —
          authored, not systemic.
Evidence class: documented gameplay + direct frame
Confidence: high
Genesis translation: the wedge is real — a 7-channel instance-bound mutation vocabulary
          (decal, attachment, material override, structural state, light, authority, VFX)
          turns TS's one showcase map into Genesis's default behavior.
Solo-cost class: renderer multiplier (channels amortize; per-object art not required)
Decision status: research finding only
```

```text
FINDING L7-2
Claim: Visible-consequence legibility ranks geometry > attachment > decal > tint; tint-only
       states fail the thumbnail test.
Evidence: TS packed-market (geometry removal) vs trap statuettes (props) vs FFT's nothing;
          value probes on cohort frames at 25% scale.
Evidence class: observed + inference
Confidence: medium-high
Genesis translation: spend the mutation budget on silhouette-visible channels first;
          reserve tint for supporting the primary cue, never carrying it.
Solo-cost class: reusable asset/system
Decision status: research finding only
```
