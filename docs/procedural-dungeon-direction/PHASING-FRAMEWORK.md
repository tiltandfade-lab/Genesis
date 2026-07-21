---
type: design-study
status: DISCOVERY
created: 2026-07-21
updated: 2026-07-21
scope: cross-wave prototype and MVP phasing
---

# Procedural Dungeon Prototype/MVP Phasing Framework

This amendment corrects a weakness in the discovery record: many accepted answers describe the desired mature
system without saying which part must exist in pre-alpha and which part can be reached through a simpler honest
scaffold. It does not revoke those destination rulings. It adds an implementation horizon to them.

The framework is accepted as the way future questions must be decided. The first-pass Wave 1, Wave 2, and Wave 10
classifications linked below are a review draft until Adam accepts or amends their cut lines.

## The two required decision forms

Every accepted direction must now use one of these forms:

1. **SCAFFOLD FIRST -> FEATURE GOAL**
   - **Pre-alpha form:** the smallest honest playable version that delivers the game loop.
   - **Feature goal:** the accepted richer destination.
   - **Non-negotiable seam:** the data, authority, identity, or adapter boundary that must exist now so promotion is
     extension rather than replacement.
   - **Promotion evidence:** the playtest, corpus, scale, or content condition that justifies the added complexity.
2. **PRE-ALPHA CRITICAL**
   - The feature goal cannot wait because its absence would corrupt canonical state, break persistence or legality,
     violate player trust, make the core game unrecognizable, or force a destructive migration/rewrite later.
   - A critical feature may still have deliberately narrow content breadth, plain presentation, and conservative
     limits in pre-alpha. “Critical” does not mean “fully polished.”

A **proof spike** is a kind of scheduled work, not a third decision class. It may test whether a proposed critical
seam is viable or whether a feature goal has earned promotion, but the spike does not silently authorize the full
destination system.

## Classification test

Ask these questions in order:

1. If this is absent, can the player still experience the intended Genesis loop rather than a disconnected tech
   demo?
2. Could the scaffold lie about world truth, reroll or duplicate committed facts, leak secrets, lose consequences,
   permit illegal actions, or make saved worlds incompatible?
3. Would adding the destination later require replacing canonical identifiers, authority, event shapes, save data,
   or renderer ownership rather than extending an existing seam?
4. Is the complexity mostly breadth, visual richness, authoring volume, UI convenience, timing polish, or simulation
   depth that can be added after the loop is proven?
5. What concrete evidence tells us to promote the scaffold rather than merely preferring the ideal in the abstract?

Questions 2 or 3 normally make the relevant invariant **PRE-ALPHA CRITICAL**. A “yes” to question 4 normally makes
the richer realization **SCAFFOLD FIRST -> FEATURE GOAL**.

## Global laws

1. **Destination stays visible.** Phasing does not convert an accepted feature goal into a forgotten “maybe later.”
   Every scaffold names its destination and promotion evidence.
2. **A scaffold must be honest.** It may be plain, narrow, serial, manual, or conservative. It may not fabricate
   causality, erase canon, expose unknown information, silently drop an obligation, or move gameplay authority into
   a presentation adapter.
3. **Build the seam before the spectacle.** Stable ids, typed receipts, viewpoint law, canonical ownership,
   persistence boundaries, and deterministic validation are often critical even when their rich visual or
   narrative projection is later.
4. **Judge simplicity end to end.** Fewer visible controls can hide more state-machine work; a quick visual flourish
   can create a future renderer rewrite. “Simpler” means lower total implementation, content, migration,
   maintenance, and proof cost while preserving the seam.
5. **Narrow before simulating broadly.** A small number of typed resources, history transformations, actor pools,
   cue families, and physical event verbs may prove the architecture. Pre-alpha does not need every family or every
   combination.
6. **Writing-heavy is cheaper, not free.** Tracking and simulation usually demand less art production than the
   graphics engine, but still require schemas, canonical owners, deterministic transitions, persistence,
   compaction, migrations, and tests. Store the minimum durable truth now; defer breadth and elaborate projection.
7. **Graphics earn complexity through proof.** First prove that canonical actors, objects, movement, areas, state
   changes, topology, hazards, and custody can be rendered truthfully at gameplay scale. Add smart camera behavior,
   layered attention UI, rich materials, and presentation choreography only when the base event corpus works.
8. **No second system for the upgrade.** The destination must be a policy, content, adapter, or capacity expansion
   over the scaffold wherever practical. If the proposal requires parallel authorities, the seam is wrong.
9. **Review can promote or demote.** A playtest may show that a deferred feature is essential to comprehension or
   identity; a supposedly critical ideal may prove safely scaffoldable. Record that evidence and amend the cut.
10. **Discovery is not build authorization.** Wave 12 still owns the dependency graph, exact vertical slices,
    budgets, acceptance gates, and final authorization.

## Required record for future answers

After Adam chooses an option, the running record must add:

- **Phase class:** `PRE-ALPHA CRITICAL` or `SCAFFOLD FIRST -> FEATURE GOAL`.
- **Pre-alpha form:** exact narrow behavior intended for the first playable build.
- **Feature goal:** exact accepted destination, if different.
- **Seam retained now:** identities, data, authority, adapter, policy, and save commitments that cannot be deferred.
- **Promotion trigger:** named evidence or dependency, not “when there is time.”
- **Known debt:** what the scaffold cannot yet do and how the game stays truthful without it.

If the phase cannot be chosen responsibly during the question, the ruling remains provisional and its closure audit
must name the unresolved phasing question.

## Current audit set

- [Wave 1 phasing audit](wave-01/PHASING-AUDIT.md)
- [Wave 2 phasing audit](wave-02/PHASING-AUDIT.md)
- [Wave 10 phasing audit](wave-10/PHASING-AUDIT.md)

These audits classify decision families rather than rewriting every historical answer. The chronological wave
records remain the authority for semantics, exceptions, rejected options, and generated follow-ups.
