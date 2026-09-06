---
type: system-spec
status: FOUNDER-RULED — implementation slice 1 active
created: 2026-08-03
owner: text-first product priority, walk restoration, and optional-presentation boundary
related:
  - "[[DREAM-HORIZON]]"
  - "[[WALK-CONSUMPTION]]"
  - "[[HOOK-WALKS]]"
  - "[[OUTLANDISH-REALMS]]"
  - "[[GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE]]"
---

# Text-first walk restoration

## 0. Founder ruling and scope

Adam's 2026-08-03 direction restores Genesis's original center of gravity: infinite
storytelling, deterministic object/world state, imagination, and the relevance-scoped AI
digest are the product constraints. A battlefield or visual engine is not a prerequisite for
play. Existing sprites remain useful; a small node-map projection may follow; the full theater
is preserved as an optional laboratory for future technology.

This is an implementation-priority supersession, not a deletion program. It supersedes the
current instructions that make BattleMat/EngagementLens, the Golden visual campaign, or any
renderer proof the next required product cut. It does not delete or invalidate their code,
assets, research, fixtures, contracts, or retained evidence. They remain optional projections
and future work behind explicit selection.

The binding doctrine remains `DREAM-HORIZON.md` §0: the text is the game, event-sourced state is
the game, and every renderer is replaceable.

## 1. Presentation boundary

Genesis exposes three presentation dispositions over the same canonical state:

1. **Story** — the default. DM narration, prose twins, controls, cards, dice, and state views;
   no theater mount attempt and no battlefield expectation.
2. **Sprites** — optional 2D citizens/portraits/state markers over Story. Sprites never own
   position, combat legality, identity, or object state.
3. **Theater Lab** — explicit opt-in to the retained 3D/theater stack. It is a development and
   future-technology lens, not a release dependency or current build priority.

All three dispositions must commit identical engine events and produce identical canonical
world state. Presentation failure cannot block a turn. No visual asset-availability check may
narrow a roll, realm, creature, site, object, or consequence.

## 2. Walk restoration

### 2.1 Substantive walks versus scene chains

A substantive dungeon, urban, or wilderness walk targets **8–12 segments**. Its topology,
route/reward obligation, and fiction select within that range; PC level controls threat and
content budget, not how much world is allowed to exist.

Short 1–3 beat errands remain valid as **scene chains**. They do not consume a topology whose
layout requires a full walk. This preserves small local stories without shrinking full walks
until their graphs stop functioning.

The built level-scaled 3–7 urban/dungeon and 3–5 wilderness default in
`src/engine/prep-bundle.js` is superseded for substantive prep walks.

### 2.2 Focus is not lifecycle

`prep.activeWalkId` is the current DM/digest focus pointer. Activating walk B suspends walk A;
it does not complete or abandon A. Every walk node retains its own cursor, touched/ticked
segments, overlays, state assertions, and timestamps. Re-entry resumes that cursor and may apply
elapsed-world staleness through the normal World Turn/state owners.

Explicit player/DM abandonment and resolved finales still close a walk. Merely following another
lead does not. This implements the already-adopted `HOOK-WALKS` resume-with-staleness ruling.

### 2.3 Digest scaling

Longer walks do not widen the steady-state AI context. `activeWalkDigest` continues to send the
current segment in full and all other segments as compact stubs; the first follow-up may add only
the current segment's legal exits/adjacent stubs. The 12 KB digest stress ceiling remains.

## 3. Object state is the primary world-realization seam

Untouched interchangeable detail may remain deterministic and re-derivable. Once a noun is
named, used, searched, moved, opened, broken, depleted, promised, stolen, repaired, or made
mechanically relevant, the engine commits a sparse stable assertion keyed by canonical identity
and source provenance. Only relevant deltas persist.

The first proof is one walk-backed object surviving:

`enter → interact/state transition → leave/suspend → save → reload → resume → same state`.

The existing `walk-interactables` `sourceRef` work and theater projection consumers are retained.
The documented gap between re-derivable `plan.interactables[]` and persistent prep-node state is
the seam to close; the renderer does not become the store.

## 4. Realms and Golden work

Realms are engine semantic context, not render styles. A shared renderer-neutral realm resolver
must eventually own primary influence, adjacent leakage, intensity, and provenance for world,
region, node, walk, segment, and entity consumers. Existing bestiary, NPC-role, item, hook, prop,
surface, and sprite work remains reusable. Missing art falls back to prose/generic sprite; it
never removes the noun.

Golden Sites remain retained integration proofs. Host identity, operating program, ordered state
transforms, custody, damage, repair, occupation, dormancy, materialization windows, receipts, and
provenance are semantic/state work and remain in scope. Geometry/material/camera outputs become
optional projection targets. No Golden number becomes a runtime enum.

## 5. Safe cutover and first slice

No existing visual module or asset is deleted in this program. Work proceeds in reversible units:

1. make Story the default and Theater Lab explicit opt-in;
2. replace implicit walk abandonment with suspension/resumption;
3. restore substantive prep walks to the 8–12 functional range;
4. prove an existing save can load and round-trip without destructive migration;
5. close one stable walk-object state round trip;
6. then extract renderer-neutral realm context and consider a derived 2D node map.

Required gates for the first slice:

- old save/migration/storage harnesses remain green;
- current walk, prep, digest, realm, combat, and manifest harnesses remain green;
- switching presentation disposition does not change a canonical-state fingerprint;
- switching walks preserves the prior cursor and does not log completion/abandonment;
- L1 and L10 default prep both create substantive walks within 8–12 segments;
- a 12-segment active walk remains under the digest size ceiling;
- Theater Lab can still be explicitly re-enabled.

## 6. Explicitly deferred

No table reauthoring, renderer deletion, asset purge, combat-resolver replacement, exact-cell
cutover, broad realm rewrite, or node-map implementation belongs to the first slice.
