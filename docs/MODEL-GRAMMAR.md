---
type: system-spec
project: Genesis
status: SPECCED 2026-07-03 — orchestration queued behind the in-flight theater wave (see §8)
created: 2026-07-03
author: Fable (from the design talk with Adam: "attach a little model to almost everything… smartly and in a modular way where things can be reused and just have modules attached")
related:
  - "[[BATTLE-THEATER]]"     # §3 — figures ARE the creatures; this systematizes them
  - "[[DESIGN-GUIDE]]"       # §II.0b all art is placeholder; swap-cheap seams
  - "[[ITEMS]]"              # equip slots = the anchor contract's twin
  - "[[SKIN-GRANTS]]"        # realm reskins — the visual layer follows the same seam
---

# MODEL-GRAMMAR — recipes, not models

## §0 Thesis

A procedural figure is ~10 lines of DATA naming which PARTS to compose. Parts are code, written
once (~40 of them); recipes are data, nearly free — so "a little model on almost everything" is
not an art project, it's a **derivation project**, and the script owns it (the anti-drift lens,
applied to art): the bestiary/items/spells/walk data already carry everything a recipe needs.
Everything here is placeholder-tier per §II.0b; when real art arrives, the recipe corpus IS the
artist's brief, and meshes swap in per-part through the same seam.

## §1 The parts library (`src/ui/theater-parts.js`, ES module beside theater-boot)

A part = a pure function `(params) → [{box: {w,h,d}, pos, rot, taper?, channel}]` in part-local
space. Parametric (scale / taper / rotation / tint **channel** — never a literal color, §5).
Deterministic, no randomness inside parts (seeding happens at recipe level). Budget per part ≤6
boxes. The initial library (~40 parts, seeded FROM the archetypes-2 unit's builders — decompose,
don't rewrite):

- **Bodies** (each exports the §2 anchors): `torso-biped`, `torso-biped-huge`, `torso-quad`,
  `blob-mass`, `thorax-abdomen` (arachnid), `serpent-coil`, `swarm-scatter`, `horror-mass`.
- **Limbs/locomotion**: `arm-tapered`, `leg-tapered`, `leg-spider` (angled slab pair),
  `wing-slab` (pair), `tail-segments`, `fin-ridge`.
- **Heads**: `head-round`, `head-snout`, `head-horned`, `head-skull`, `head-eyeless`.
- **Weapons** (silhouette-first, Adam's rule): `sword-slab`, `axe-wedge`, `spear-pole`,
  `bow-arcs`, `staff-tipped`, `shield-slab`, `dagger-slabs`, `club-mass`.
- **Armor**: `pauldrons`, `chest-plate`, `helm-crest`, `robe-skirt` (caster silhouette).
- **FX attachments** (static geometry; motion stays T3's): `ember-flecks`, `glow-halo`,
  `drip-tendrils`, `bone-protrusions`.
- **Props** (terrain nouns): `crate`, `cart`, `pillar-broken`, `shrine-block`, `tree-bare`,
  `rubble-scatter`, `banner-pole`.

## §2 The anchor contract

Every BODY part exports named anchors — local transforms where modules attach:
`mainHand · offHand · back · head · shoulders · base · mount`. Modules declare which anchor they
expect. The builder composes: base body → anchored modules → whole-figure pose/scale.

**The loadout mirror (the killer feature):** the PC/ally recipe is built live from the sheet —
`sheet.equipped.mainHand`'s item resolves through its existing ITEMS properties to a weapon part
(`itemDef` props → slab shape), armor class band → armor modules, caster class → `robe-skirt` +
`staff-tipped`. Equip the greataxe and the mini holds the axe. Conditions attach too: `prone` =
base rotation, `burning` = `ember-flecks`, `restrained` = a binding band. All read-only
derivations from state that already exists — zero new bookkeeping.

## §3 Recipes — format + storage (the house edit-source → compile pattern)

```js
{ slug: "goblin", base: "torso-biped", size: "S",
  modules: [ {part:"spear-pole", anchor:"mainHand"},
             {part:"head-snout", anchor:"head", params:{scale:0.8}} ],
  channels: { skin:"skin-green-grey", armor:"leather", accent:"none" },
  poseSeed: "goblin" }
```

- **`data/model-recipes.js` is GENERATED** by `build/gen-model-recipes.py` from
  `data/bestiary.js` + `data/items.js` — committed but never hand-edited (the tables.js rule).
- **`data/model-recipe-overrides.js` is HAND-AUTHORED** and small — art direction for heroes and
  anything the derivation gets wrong; an override wins by slug. This is where Adam+Fable G9
  sessions do their tuning.

## §4 Derivation rules (the script owns the look)

The generator maps data → recipe, in this precedence order (each rule cites the field it reads):

1. `creatureType` + `size` → base body (the archetypes-2 mapping, inherited).
2. Movement: a fly speed → `wing-slab`; swim-only → `fin-ridge`; burrow → low profile scalar.
3. Actions: any ranged weapon action → `bow-arcs` (or `spear-pole` for thrown); reach melee →
   longer arm params; multiattack claws → clawed arm taper.
4. AC bands: ≤12 none · 13–15 `leather` channel · 16–17 `chest-plate` · 18+ plate set + `helm-crest`.
5. Name keywords (curated list, not NLP): skeleton/skull → `head-skull` + `bone-protrusions`;
   spider → `thorax-abdomen` + `leg-spider`; flame/fire → `ember-flecks`; shadow/wraith →
   `drip-tendrils` + dark channels; dire/dread → bulk scalar; etc. (~25 rules, each one line.)
6. CR: imposing scalar curve (bulk + crest at high CR) — big things read big.
7. Anything unresolved → the archetypes-2 default figure (never worse than today).

Walk-feature props derive the same way: a curated keyword map from segment feature/hazard
strings → prop parts (`cart` → cart, shrine → `shrine-block`, …), falling back to the current
generic cover column.

## §4b Off-bestiary creatures — the shape-hint contract (the mogwai clause)

**The guarantee: nothing that exists is ever shapeless, and the part menu never gates DM
invention.** (Adam 2026-07-03: "I never want the game's open potential to be limited by the
models it has to choose from.") Three tiers:

1. **In-library** → its recipe.
2. **Off-bestiary but statted** (everything is — `resolveCreature`'s quick-stat guarantee):
   the §4 derivation runs on ANY creature object (size/CR/type-hint/name all exist) → a
   generic-but-present figure. Never invisible.
3. **The shape hint**: when the DM introduces an original creature (gen handshake /
   `codex_add`), it may attach `shape: {base, size, modules:[...], channels:{...}, stance}` —
   **picked from the CLOSED part vocabulary, not freeform** (the DM owns the meaning; the
   script owns the parts — parts ARE the nouns). The resolver validates every name: unknown
   parts drop to nearest-known (unknown head module → head params; unknown attachment →
   omitted) and the drop is LOGGED to a `shape-gaps` ledger line — the growth signal.

- **Persistence = canon-lock**: the resolved shape binds to the creature's codex record under
  the same immutable-once-revealed rule as names. The mogwai sidekick looks like YOUR mogwai
  forever; a companion renders it ally-tinted from its codex shape.
- **The menu is a growth surface**: recurring shape-gap log entries → a new part (a ≤6-box pure
  function, one small unit through the normal pipeline). The library grows because of play.
- G2 builds the resolver + validator + gap logging; the DM-side prompt line ("you may attach a
  shape from this part menu") rides the SEAT-PROMPT/runbook when those next update — until
  then tier 2 covers everything invented live.

## §5 Channels, not colors — realms and factions for free

Recipes name semantic channels (`skin / armor / accent / glow`); the theater resolves channels
through the active palette stack: env palette (THEATER_ENV_PALETTE) → realm skin (the
skin-grants seam — an Ash-realm goblin and a Noir goblin are ONE recipe under different light)
→ faction accent (clock-holding factions get their accent on their creatures' `accent` channel).
No recipe ever hardcodes a hex.

## §6 Runtime

`buildFigureFromRecipe(recipe, palette)` in theater-boot absorbs the archetype builders (they
become the fallback recipe set). Budgets: ≤24 boxes standard, ≤40 hero-override. Seeded pose
jitter per `poseSeed`. Render-on-demand untouched; recipes build once per combat, not per frame.

## §7 Verification — `dev/verify-model-grammar.mjs` (pure layer, red-first)

1. The generator produces a valid recipe for EVERY bestiary entry (510/510, zero throws).
2. Each derivation rule fires on a named real fixture (a flyer gets wings; an AC-18 knight gets
   plate; the skeleton gets the skull head; the spider gets the thorax) — one check per rule.
3. Overrides win by slug (mutation check: remove override → derived recipe returns).
4. Every base body exports the full anchor set; every module's anchor exists on its base.
5. Box budgets hold across all 510 (fail lists offenders).
6. Determinism: two generator runs → byte-identical output.
7. Loadout mirror: a fixture sheet with a greatsword equips `sword-slab` at `mainHand`; swapping
   to a bow swaps the module; `prone` rotates the base.
8. Regressions: verify-theater-data · theater family · full sweep · check-manifest.

## §7b The blind recognition gate — model quality without Adam's supervision

*(Adam 2026-07-03: "some of them are hard to recognize — what's your plan on improving the
models without my constant supervision?")* The quality bar is NOT reference-matching; it is
**blind recognizability at ~100px**. Mechanized as a loop no human sits inside:

1. **Render solo** — a stager drives the preview page's lineup fixture and captures one PNG per
   recipe (batches by family).
2. **Blind judge** — a FRESH agent per batch, given ONLY the images (never the recipe, never
   the mapping, never this doc), answers "what creature is this?" free-text, scored against the
   bestiary with family credit: right creature = pass · right family ("some large cat" for a
   dire lion) = family-pass · wrong/blob = fail. The judge must not be the authoring agent —
   no self-grading, ever.
3. **Iterate** — failing recipes go to a tuning executor that first PULLS REFERENCE IMAGERY for
   the creature family (classic monster art) and adjusts the recipe against it, re-renders,
   re-judges with ANOTHER fresh judge. Cap ~3 attempts, then the miss is logged for the G5
   hand-override session rather than looped forever.
4. **Thresholds respect the tail:** the top-100 most-encountered creatures (CR-weighted walk
   frequency) must PASS; the long tail needs only family-pass (honestly generic beats wrongly
   specific). Results land in a committed scorecard (`dev/model-recognition-report.json`) so
   progress is measurable across passes.
5. Adam's role: periodic lineup contact-sheets + the G5 hero sessions — taste rulings, not QA.

## §8 Orchestration plan (queued behind the in-flight wave — theater-boot contention)

Merge order first: camera-yaw fix → archetypes-2 → verbs → battle-stage (all in flight). THEN:

| unit | scope | model/effort |
|---|---|---|
| G1 `feat/model-parts` | §1 parts library + §2 anchors, decomposed from archetypes-2's builders; preview page gains a parts-lineup fixture | Sonnet, medium |
| G2 `feat/model-recipes` | §3 generator + §4 rules + overrides file + §7 harness | Sonnet, medium (the big one) |
| G3 `feat/model-loadout-mirror` | §2's sheet/conditions derivation for PC+allies | Sonnet, low-medium |
| G4 `feat/model-prop-recipes` | walk-feature → prop derivation | Sonnet, low |
| G5 | the hand-override art pass | Adam+Fable G9 session, not an executor |

G1→G2 sequential (G2 consumes G1's part names); G3/G4 parallel after G2. Each unit: worktree,
red-first, orchestrator re-gates personally, --no-ff. Fable's hands: this spec, the §4 keyword
curation review at G2's gate, and G5.

## §9 Decisions

| # | Decision | Ground |
|---|---|---|
| 1 | Recipes are DATA; parts are the only code | cost structure: write 40 parts once, derive 510+ recipes free |
| 2 | Generated + hand-override, never hand-edit generated | the tables.js house rule |
| 3 | Channels not colors | realms/factions/envs restyle everything for free; §II.0b swap-cheap |
| 4 | Derivation cites existing fields only (type/size/speed/actions/AC/name/CR) | anti-drift: the script owns the look; no invented lore |
| 5 | PC minis mirror sheet.equipped + conditions | the anchor contract IS the equip-slot system with geometry |
| 6 | Archetypes-2 figures remain the universal fallback | never worse than today |
| 7 | All of it placeholder-tier | §II.0b; the recipe corpus doubles as the future artist's brief |
