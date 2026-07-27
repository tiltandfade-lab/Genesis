---
type: workflow-guide
created: 2026-07-25
updated: 2026-07-26
status: ACTIVE
authority: GOLDEN-SITES-CATALOG.md
---

# GOLDEN SITE CONCEPTING GUIDELINES

## What this guide is for

A Golden Site session is not a meeting for designing one beautiful scene. It is a
working session for discovering a family of related places that Genesis can generate,
scale, damage, redress, and adapt without losing their identity.

The session should stay visual and plain-spoken. Research supports the conversation;
it does not become the conversation. Adam should see important choices and proof
results instead of having to reconstruct them from technical prose.

## The result we are aiming for

By the end of a healthy concepting cycle, we should know:

- what encountering the site promises the player;
- what must remain true in every valid version;
- how culture changes the solution;
- how terrain, climate, materials, wealth, permanence, occupants, and current use
  change it;
- how the same real rolls project beyond the tactical footprint into a truthful world
  context rather than a generic void;
- what its small, ordinary, large, degraded, and unusual expressions look like;
- which first build teaches us the most about the rest of the family;
- what belongs in Proof, MVP, and Ideal; and
- which questions genuinely require Adam's taste.

The written brief records those answers after they have become clear. It is not a
substitute for making them clear.

## Governing law — fun strategic gameplay comes first

The main goal of every built level is fun strategic gameplay. Historical accuracy,
architectural plausibility, cultural detail, simulation depth, lighting, and visual
beauty support that goal; none of them outranks it.

“Strategic” does not mean every site must become a combat arena. It means the player
can read the situation, form a plan, choose among meaningfully different approaches,
use the site's particular systems, and experience understandable consequences. Social,
stealth, exploration, rescue, sabotage, defense, escape, and combat plans may all
qualify.

Every concept and proof should therefore ask:

- What interesting decision does this place create that another level does not?
- Are there at least two viable approaches with different advantages, risks, and
  consequences?
- Can the player change the situation by understanding and using the site?
- Do position, routes, elevation, cover, hazards, timing, occupants, light, and
  objectives create useful tradeoffs instead of decoration?
- Can the player recognize what changed after a choice?
- Is approach, commitment, failure, retreat, and recovery possible?
- Does the layout remain interesting across changed seeds, rather than depending on one
  hand-authored arrangement?

A beautiful, believable, procedurally valid level that produces one obvious plan or no
meaningful decision fails. The generator should reject or revise strategically flat
candidates just as it rejects broken geometry.

## The session, in order

### 0. Audit the current rollers

Before choosing a hero composition, inspect the current paths that can already produce
this site's ingredients. Use `GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md` as the shared
ledger and extend it when a new source or retained composition is found.

Record:

- live world, place, building, walk, room, feature, capture, and occupancy sources;
- exact table ids or Track-A keys and the roller that consumes them;
- at least one real rolled result or honestly reconstructed composition worth retaining;
- whether each source is `LIVE`, `LIVE-COMPOSED`, `AUTHORED-UNWIRED`,
  `ORACLE-MANUAL`, `INTERPRETIVE`, or a proposed `TARGET-ADAPTER`; and
- which existing outcomes would be lost if the Golden Seed were mistaken for the family.

This is a preservation and classification pass, not a demand to keep every historical
implementation. Anything deliberately superseded needs a named replacement and cutover.
An authored row that is not called by the relevant player-facing roller must never be
described as live.

### 0.5. Classify the request before inventing a site family

Use `GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md` to ask what the proposed Golden case is
actually proving:

- a **host program** with a distinct operating model;
- a **cross-host transform** that should work over unlike programs;
- a **scale/relationship** stress case;
- a **substrate/ownership** stress case; or
- an **ordinary venue fixture** needed to prove the common path.

Do not create a new geometry generator merely because a story state is visually rich.
Apply dormant, layered control, occupation, damage, flooding, repair, and similar states
as transforms when the host retains its identity. Do not create a new numbered Golden
Site merely because a common venue—such as a tavern—deserves a retained proof.

Record the host, transform stack, entering walk family, and smallest honest
materialization window before choosing a hero composition.

### 1. State the site's promise

Begin without discussing individual props or architectural details. Answer, in plain
English:

1. What happens here?
2. What makes playing here different from playing at another site?
3. What should the player feel when it first comes into view?
4. What must remain recognizable across every realm, culture, scale, and occupancy?

Turn the answers into one short functional promise and a small set of gameplay
invariants. If the promise is still vague, do not compensate by adding detail.

### 2. Separate identity, culture, and circumstance

Read every major design choice through three layers:

- **Site identity** — the relationships that make the place this kind of site.
- **Cultural expression** — the inherited building traditions, proportions,
  construction habits, symbols, maintenance customs, and preferred solutions.
- **Local circumstance** — terrain, climate, available materials, wealth, mobility,
  intended duration, damage, current occupants, and current use.

Culture should have strong mechanical and visual influence, but it should not act as a
single lookup key. For example, culture can strongly weight a tent family while weather,
mobility, purpose, and permanence decide which expression of that tradition appears.

When a recommendation depends on more than one layer, name the contributing facts.
Avoid rules shaped like “Culture X always receives object Y.”

### 2.5. Project the real roll beyond the tray

Before polishing a hero image, separate:

- the canonical playfield and its true portals/supports;
- the context apron that explains how those edges sit in the world; and
- the near, mid, far, and atmospheric context that can be derived from visible,
  knowledge-safe world/place facts.

Use `GOLDEN-SITE-WORLD-CONTEXT-PROJECTION.md`. Background is not a generic biome choice
and not permission to paint mechanics. Audit the world setting, persistent architecture,
nearby nodes/edges, terrain/biome, place setting/traits/history, topology, elevation,
water/void, time, weather, light, current state, and host relationships.

Classify every candidate background fact as direct visual noun, physical property,
visible process, sensory-only, social/narrative, or secret/latent. Only the first three
may project automatically, and visible processes still require current local state.

Retain at least one real context roll for the family. A changed context roll should be
able to transform the world's silhouette without silently changing the site's mechanics.

### 3. Concept a family before polishing a hero

Sketch at least five related expressions:

1. the smallest believable version;
2. the ordinary version;
3. a large or advanced version;
4. a degraded, ruined, occupied, or repurposed version; and
5. one unusual but supported cultural or environmental version.

These are not five unrelated scenes. They should visibly share a relational grammar.
The comparison reveals which pieces are genuinely reusable and which only solve one
composition.

For each major feature, classify it using the catalog's live recommendation classes:
`REQUIRED`, `DEFAULT`, `LICENSED`, `VARIANT`, or `PROPOSED`.

### 4. Choose the first build for learning value

The first build is not automatically the smallest, easiest, or prettiest version.
Choose the version that exercises the most important reusable relationships without
requiring the whole Ideal asset library.

Ask:

- Which difficult relationship does this build prove?
- Which reusable pieces or systems does it force us to solve?
- Which later variants become recombination instead of new invention if it succeeds?
- What would still remain unknown after it passes?

Record the proposed promotion path into larger or more advanced expressions and the
degradation path into damaged, improvised, occupied, or repurposed expressions.

### 5. Demonstrate early

Build a rough clay proof once the family and first-build hypothesis are coherent.
Do this before polishing a long brief.

The first useful demonstration should show:

- the fixed production camera and the useful zoom range;
- a six-foot human plus relevant small and large standee envelopes;
- legal footprints, collision, stairs, slopes, and support;
- approach, deployment, objective, interaction, retreat, and alternate routes;
- the same committed layout in clay, tactical, and dressed presentations;
- the same committed layout with context disabled and with its real-roll context
  projection enabled;
- the distinct viable plans, their tradeoffs, and the site-specific levers that make
  them possible;
- motivated daylight, moonlight, magic, flame, or other setting-owned light;
- a dark case in which stairs, ledges, figures, and nearby forms remain readable
  through exposure, restrained ambient bounce, AO, contact, and honest cast shadows;
- at least two changed seeds; and
- at least one changed world-context receipt over an otherwise unchanged site chassis;
  and
- one deliberately hostile envelope, camera, or density case.

Darkness may be dark. Readability support must not pretend that an unexplained lamp
exists. Likewise, cutaway presentation may omit roofs or cave ceilings even when an
overhead boundary exists as a world or gameplay fact.

The full retained-fixture contract lives in `GOLDEN-SITES-PROOF-QUEUE.md`.

### 6. Ask fewer, better founder questions

Only send Adam questions whose answers depend on taste, tone, or product direction.
Do not route research work, implementation choices, or proof failures into the founder
queue.

Each founder question should include:

- a plain-English description of the choice;
- two or three visible alternatives;
- a recommendation and its reason;
- what the choice changes later;
- whether it is easy to revise; and
- the proof image or diagram needed to judge it.

When both alternatives belong in the generator, the question is usually build order,
not permanent exclusion.

### 7. Close with the ladder

End the cycle with three explicit horizons:

- **Proof** — the smallest experiment that can disprove the important idea.
- **MVP** — the first production-worthy family with enough variation to feel generated.
- **Ideal** — the intended breadth of scales, cultures, conditions, and unusual cases.

Also record:

- promotion paths;
- degradation and repurposing paths;
- licensed variants and their triggering facts;
- known evidence gaps;
- proof failures;
- remaining founder choices; and
- the next visible demonstration.

Do not mark the site `CLAY-PROVED` because its prose or concept art is persuasive.

### 8. Produce the generator-grade working spec

Adam ruled the Site 5 Mine/Workshop specification as the new standard on 2026-07-25.
The ten-section catalog brief remains the portfolio summary; every site that approaches
implementation also receives a dedicated `working-site-spec`.

The working spec must state:

1. authority, honest gates, ruled decisions, and unresolved proposals;
2. plain-English promise and classified invariants;
3. scene ladder, implementation order, learning rationale, and Golden Seed;
4. required spatial zones and provisional grid/standee hypotheses;
5. distinct route/plan promises with their benefits, costs, and capacities;
6. site-specific operating circuits and factorized mutable states;
7. strategic levers and at least three demonstrable plans, including noncombat where
   the premise permits it;
8. current roller sources, their live/unwired/interpretive/adapter status, retained
   compositions, and the `rollerLineage` / `sourceRollRefs` receipt;
9. generator inputs, semantic blueprint, and ordered generation pass;
10. countable rejection rules and a deterministic simplification/fallback ladder;
11. culture, construction, organization, ecology, or occupant cards appropriate to the
    family—never one label or palette standing in for them;
12. occupancy states, hooks, lighting/cutaway law, rolled world-context projection, and
    site boundaries;
13. inherited/site-owned structure, mechanisms, material, decal, and prop demand;
14. retained runtime facts, stable ids, provenance, and proof-receipt fields; and
15. Proof, MVP, Ideal, remaining evidence, and the next visible demonstration.

Numbers in a working spec are hypotheses until clay and play accept them. Adding detail
must never silently turn a `PROPOSED` build order or card into a ruling. A working spec
is buildable instruction; `CLAY-PROVED` still requires the actual retained fixture.

## Recommended working rhythm

1. Codex audits the live rollers and shows the current results/compositions that must
   remain generatively reachable.
2. Codex presents a short visual concept board, the rolled world-context evidence, and
   a plain-English site promise.
3. Adam corrects the promise and the intended player experience.
4. Codex shows the family, its variable axes, and a recommended first build.
5. Adam answers only the consequential taste questions.
6. Codex builds and presents the clay proof.
7. Adam responds to the visible result.
8. Codex tests changed seeds and an adversarial case, then corrects failures.
9. Codex finalizes the brief, ladder, queues, lineage, and retained evidence.

If the session becomes dominated by prose, pause and produce the next useful comparison,
diagram, or live proof.

## Session completion checklist

A concepting session is ready to hand off when:

- [ ] the player-facing promise is one clear paragraph or less;
- [ ] current roller sources and retained compositions are classified without treating
  authored-but-unwired content as live;
- [ ] the site names its real-roll context inputs, legal apron/background families,
  forbidden visual claims, and grade-only fallback;
- [ ] invariants are separated from defaults and variants;
- [ ] culture and local circumstance both have named influence;
- [ ] the five-expression family has been compared visually;
- [ ] the first build has an explicit learning rationale;
- [ ] a generator-grade working spec defines zones, circuits, plans, inputs, generation,
  rejection, fallback, runtime facts, roller lineage, source roll refs, and receipt;
- [ ] Proof, MVP, and Ideal are separate;
- [ ] founder questions contain only real taste choices;
- [ ] the next clay demonstration is precisely defined; and
- [ ] no research, ruling, brief, or proof status is overstated.
