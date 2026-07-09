---
type: system-spec
project: Genesis
status: SPEC — drafted by Fable 2026-07-08, awaiting Adam's review
created: 2026-07-08
origin: Adam 2026-07-08 — "we might as well start speccing out a more fleshed-out place generation
  system based on all of this realm knowledge" (the night the realms got keyed identities)
related:
  - "[[NPC-ROLE-REALMS]]"
  - "[[REALM-ROLE-EDGES]]"
  - "[[NPC-PRESENCE-AND-HOOKS]]"
  - "[[NPC-PARTIALS]]"
  - "[[ON-DEMAND-GEN]]"
  - "[[SPATIAL-MODEL]]"
  - "[[SESSION-PREP]]"
  - "[[HOOK-WALKS]]"
  - "[[BREACH]]"
---

# PLACE-GEN — realm-true places from birth

**The thesis:** tonight the realms stopped being palettes and became *keys* — Chrome is a
Warriors/TMNT/Robocop neon-slum megacity with subways and turf; Cosmic is an Egyptian/Hermetic
temple-desert; Gloom is Derry — the town that made a deal. The NPC layer already honors that
(`roleForRealm`, 11 role skins, 112+ edge-roles). **The place layer does not.** A minted place
today is generic fantasy with a realm-tinted lens bolted on afterward at the encounter level. This
spec makes a minted place **realm-true from birth**: its type, name, cast, props, items, and hooks
all drawn through the realm's key — by REPLACING the generic place roll, not by adding a parallel
system alongside it.

This deliberately mirrors **NPC-ROLE-REALMS approach C** (Adam's ruling 2026-07-08): one universal
spine, per-realm skins with relabel / drop / add / reweight, hybridization as an opt-in breach
seam. Same machinery shape, same generator discipline, same craft format — so the two systems can
be authored, reviewed, and maintained as siblings.

---

## §1. Honest inventory — what place-gen is today

Read from the live tree 2026-07-08 (files, not memory):

**What exists and works:**

- **Node layer** (`src/world/state.js:addNode(w,name,type)`) — `type` is a free label ("Setting",
  "Place", "Frontier"). There is **no place-type taxonomy**; a node is a name and a dot on the map.
- **`rollPlace(opts)`** (`src/engine/codex-roll.js:505`) — the place mint: `place-master-setting`
  (name/desc via `placeNameDesc`) + `place-traits` (trait + calamity) + `place-secret` + optional
  `place-history` + 0–2 art pieces. Solid *shape* (visible trouble / hidden truth / art handles),
  but **every table is realm-blind generic fantasy**. This is the thin spot the old review flagged:
  the Place Generation folder (`Engine/03. _Tables/01. World Building/Place Generation/`) is 7
  tables of default-fantasy content (Mythology, Secret, History, Race Relations, Ruler Status,
  Building Interior, Region Identity) that no realm key ever touches.
- **Building layer** (`src/world/urban.js`): `rollBuilding(type)` over 12 `BUILDING_KITS`
  (smithy/apothecary/tavern/…) + `rollBuildingInterior` off the `building-interior` table; district
  fabric (`mintDistricts`) rolls `urban-district-type`, count by `PLACE_TIERS`
  (hamlet/village/town/city). All frontier-fantasy vocabulary. A Chrome world's "tavern" kit still
  mints a tavern, not a noodle bar under the rail line.
- **Region Identity** (`region-identity` d100, write-once per region, PROVISIONAL) — the
  temperature spine: `archetypeBias` / `skinBias` / `econTilt` / `spiceTilt` + 2 name cultures.
  This is the **region-level** flavor input and it works; it is *fantasy-region* flavored, not
  realm-keyed, but its mechanical vector is realm-agnostic and reusable as-is.
- **Walks** — Walk Skin ×3 families, `rollWalkSkinBreach`, and REALM-WALK-WIRING's
  `realmEncounterPool` thread realm **creatures** into walk encounters. Realm-aware, but only at
  the encounter slot, after the fact.
- **`gen[]` handshake** (ON-DEMAND-GEN §1) — kinds `npc/interior/item/loot`; **`place` is
  explicitly reserved** for prep/frontier machinery. `prepCastFrontier` calls `rollPlace({art:true})`
  when casting a node.
- **Realm knowledge, all landed and waiting:** `data/realms.js` (11 registers + voices + render),
  `data/realm-{bestiary,props,surfaces}.js`, `Engine/03. _Tables/05. Realms/Realm Items - *.md`
  (11 tables), NPC Role Spine + 11 skins + `roleForRealm` (`data/npc-role-skins.js`),
  `docs/REALM-ROLE-EDGES.md` (112+ edge-roles), presence/coherence/partials specs.

**The gap, stated plainly:** realm identity currently enters a place through *four side doors* —
creatures (walk wiring), items (breach draws), NPC roles (role skins), render tint — and never
through the front door. The place itself (what it IS, what it's called, what it looks like, who
staffs it) mints from generic tables. A Gloom world's node is "The Millrace Vale" with a
watermill; it should be a sodium-lit strip mall with one shop that never changes hands.

---

## §2. THE PLACE SPINE — universal place-types + per-realm skins

### The spine

A `place-spine` of universal place-type archetypes, exactly analogous to the NPC Role Spine's 35
archetypes. Each row: **key · archetype · function-note (the universal play-angle of the SPACE) ·
default weight · scale tag** (site / district / settlement — see §2c) **· cast profile** (which
role-classes staff it — see §3).

**Recommended spine size: 24 rows.** Rationale, argued not menued:

- The NPC spine needed 35 because people differentiate by *social function* and societies have
  many. Places differentiate by *what you can DO there*, and play verbs are fewer: gather, trade,
  worship, rule, work, dwell, hide, cross, delve, mourn. Doubling past ~24 adds rows the DM can't
  play differently (a "granary" and a "warehouse" are the same scene).
- Adam's depth-over-breadth law bites hardest here: place-gen is exactly where a system drifts
  into "a magic version of the real world where everything has a table." 24 rows × 11 skins =
  264 authored labels — a weekend craft pass, reviewable in one sitting. 40 rows would be 440 and
  the tail would be filler.
- The escape valve for realm-specific place shapes that fit no universal row is the same as NPC
  approach C: **[ADD] rows** (a Cosmic *processional way*, a Chrome *subway platform*, a High-Seas
  *careening beach* exist nowhere else — they're adds, not spine rows).

**Draft spine (for Adam's craft pass — keys stable, labels illustrative):**

| # | Archetype | Function-note (universal) | Scale |
|---|---|---|---|
| 1 | Gathering-place | Where everyone passes through; the social switchboard; rumor's home. | site |
| 2 | Watering-hole | Drink, food, and talk after dark; every side of every feud at adjacent tables. | site |
| 3 | Market | Goods change hands and so does information; haggling is the local theater. | site |
| 4 | Seat-of-power | Where the decisions get made; petitioners wait; guards watch. | site |
| 5 | Hall-of-law | Judgment, records, and the cells under it. | site |
| 6 | Shrine | The realm's relationship with the numinous, in one room. | site |
| 7 | House-of-healing | Where the hurt go; the healer knows everyone's wounds and secrets. | site |
| 8 | Workplace | The town's labor, concentrated; skilled hands and workplace grudges. | site |
| 9 | Workshop | One craftsperson's domain; commissions, repairs, and pride. | site |
| 10 | Storehouse | Value at rest; guarded, inventoried, and worth robbing. | site |
| 11 | Lodging | Beds for strangers; the ledger of who passed through. | site |
| 12 | Dwelling | Someone's home; entering means something. | site |
| 13 | Threshold | The gate/door/checkpoint between here and elsewhere; someone controls it. | site |
| 14 | Crossing | Where routes meet; travelers, tolls, and ambush geometry. | site |
| 15 | Hideout | Where the unwelcome gather out of sight. | site |
| 16 | Vice-den | Pleasure the daylight economy pretends not to see. | site |
| 17 | Ruin | What this place used to be; the past, enterable. | site |
| 18 | Boneyard | Where the dead are kept, and how the realm feels about them. | site |
| 19 | Watch-post | Eyes on the horizon; first to know, first to die. | site |
| 20 | Wild-margin | The edge where the settled gives out; foraging, dumping, disappearing. | site |
| 21 | Works | The big shared machine — mill, dock, pump, reactor: what the place runs on. | site |
| 22 | Commons | Open shared ground — square, green, lot — where public things happen. | site |
| 23 | Seat-of-learning | Records, teaching, maps; who's allowed to know things. | site |
| 24 | Monument | The thing built to be remembered; what it commemorates is contested. | site |

### The realm skins

`place-skin-<realm>` per realm (11), same craft format as the NPC role skins:

```
| Key | Archetype | Realm label | Weight (blank = spine default; 0 = drop) |
…reskin rows…
| [ADD] | <realm-unique place> | <weight> | <scale> | <cast-profile> | <note> |
```

The saloon / the corner bar / the mess tent / the subway platform demonstration — one spine row,
eleven skins (illustrative, craft pass owns final labels):

| Spine row | Frontier | Chrome | Noir | Gloom | Cosmic | High-Seas |
|---|---|---|---|---|---|---|
| Watering-hole | The saloon | Noodle bar under the rail line | The corner bar | The diner that closes at 9 sharp | The pilgrims' rest-house | The quayside tavern |
| Seat-of-power | The land office | Corp tower lobby, floor 1 of 200 | City hall, third floor | The realty office that owns the town | The high sanctum | The harbormaster's house |
| Threshold | The town gate | Turnstile checkpoint, turf line | The club door with the slot | The town-limits sign nobody walks past at night | The temple pylon gate | The boarding plank / customs shed |
| Boneyard | Boot hill | The recycler | Potter's field | The old cemetery the kids dare each other into | The necropolis row | The sailors' church wall of names |

**Edge-cases are the point (approach C):**

- **Chrome** — DROP Wild-margin (there is no outside, only lower levels). ADD: *subway platform ·
  rooftop territory · charging depot · the arcology mezzanine.* Turf grammar: districts are gang
  territory, so district records carry a faction handle by default.
- **Cosmic** — DROP Vice-den, Market thins hard. ADD: *processional way · star-observatory ·
  sealed vault-tomb · the silence garden.*
- **Gloom** — nothing drops; everything reskins to the suburb's shadow (Derry key: mundane
  American forms, wrong underneath). ADD: *the standpipe / waterworks · the fairground that
  shouldn't still be operating · the barrens.* Gloom skins bias `place-secret` draws upward (§3).
- **Lost-World** — three strata (saurian court key): skins carry an optional `stratum` tag
  (canopy / floor / under-earth) that the walk layer may read. ADD: *the egg-terrace · the
  courtly basking hall · the bone-flats.*
- **Bright-Kingdom** — Nintendo key: DROP Boneyard (death is soft here — that wrongness is
  breach fuel, not ambient). ADD: *the warp-gate garden · the castle town plaza · the minigame
  parlor.*
- **Theater** — everything reskins to its wartime form through the era-lens (mess tent, command
  post, field hospital, the wire). Content-safety inherits `Realm Items - Theater.md` law: no
  named nations, real atrocity never dressing.

### Scale — spine covers SITES; settlements stay compositional

A place-type row is a **site** (one scene's worth of space). Settlements are NOT spine rows —
a settlement is `PLACE_TIERS` (existing) + districts (existing) + a **realm-skinned site draw**
per notable site. This keeps the spine small and reuses the district fabric instead of competing
with it. `mintDistricts` gains realm labels the same way (the `urban-district-type` roll gets a
realm relabel pass — unit 6), it does not get its own spine.

---

## §3. COMPOSITION — what a minted place carries

`rollPlace(opts)` is **replaced in place** (same symbol, same payload shape, superset fields —
callers keep working). New signature: `rollPlace(opts)` where `opts.realm` (‖ `opts.region?.realm`)
defaults `'frontier'` exactly like `roleForRealm`. At mint, a place carries:

1. **Type** — `placeForRealm(realmId, rng)` weighted-picks a spine archetype through the skin
   (drops excluded, adds included), returns `{archetypeKey, label, note, scale, castProfile}`.
   Stored on `rolled` + `fields.type`. The node's free-text `type` label stays for back-compat;
   the codex record is where the taxonomy lives.
2. **Realm-skinned name** — the skin label seeds the name; the existing name-culture machinery
   (region-identity's 2-of-12 cultures) supplies proper nouns where the realm wants them.
   Frontier/fantasy realms keep `placeNameDesc`; realms whose key is *mundane-specific* (Gloom,
   Noir, Suburb) name by pattern (**"<Family-name>'s <label>"**, "The <label> on <street-noun>")
   — a small `namePatterns` field per skin, not a new megatable. Names freeze on reveal
   (ON-DEMAND-GEN §3 guard applies to locations already).
3. **Role-cast** — the `castProfile` lists 1–3 role-classes (e.g. Watering-hole: `trade` anchor +
   `service`/`margin` ambient). Anchor mints via `roleForRealm` filtered to the profile class;
   REALM-ROLE-EDGES adds are eligible (the saloon-keeper IS the frontier watering-hole anchor).
   Ambient fill count/coherence per NPC-PRESENCE-AND-HOOKS Component 2 (the scene-bucket table
   maps from spine scale + archetype: Watering-hole→tavern bucket, Market→market bucket, …).
4. **Ambient partials** — kids/animals per NPC-PARTIALS' env bands, realm-flavored kinds (the
   Chrome pet is a drone-companion). Place-gen just passes the archetype's env band; the partials
   engine owns rates.
5. **Items pool pointer** — `dm.itemsPool: "realm-items-<realm>"` (the compiled Realm Items table
   id). A pointer, not a pre-roll: loot/stock draws at this place route through the realm table
   first, existing generic tables as fallback. Shops (`makeShop`) read the same pointer for a
   realm-flavored stock line (v1: flavor only; pricing/economy untouched).
6. **Tray dressing pointer** — `dm.dressing: {props: realm props keys, surfaces: realm surface
   key}` resolved from `data/realm-props.js` / `data/realm-surfaces.js` by realm + archetype tag.
   The tabletop layer (theater) reads this to dress the tray; place-gen only points.
7. **Hook seed** — unchanged NPC-PRESENCE-AND-HOOKS Component 3: the anchor NPC draws the
   guaranteed `npc-hook` at mint. Place-gen's contribution: the **place-secret draw stays**
   (visible calamity / hidden truth are place-level, not NPC-level) and gains a realm voice pass
   in the craft lane (per-realm secret tables are NOT v1 — one generic table, realm register in
   the DM's narration, revisit after play).
8. **Temperature inputs** — unchanged: region-identity's vector + fray. Place-gen *reads*
   `spiceTilt`/`archetypeBias`; it adds no new dials.

**What a place does NOT carry (v1 scope fence):** no interior floor-plans beyond the existing
`building-interior` roll, no per-place economy, no schedules/opening-hours, no per-realm secret/
history/mythology table forks. Depth lands in the skins and the cast, not in more subsystems.

---

## §4. Interactions

### Walks + HOOK-WALKS (sibling spec, drafted concurrently)

HOOK-WALKS mints reward-terminated walks off hook engagement. **Place-gen supplies the walk's
stops and terminus:** a hook-walk's terminus is a `placeForRealm` draw biased by the hook's shape
(a smuggling hook terminates at Storehouse/Hideout/Crossing, not Shrine), and mid-walk stops that
resolve to enterable spaces mint through the same call. Contract: HOOK-WALKS calls
`rollPlace({realm, archetypeBias:[keys]})` — the only new parameter place-gen owes it. Walk
*segments* stay owned by the walk skins; place-gen owns only the nodes/interiors walks arrive at.

### Breach-blending (the hybridization seam, opt-in)

Mirror NPC-ROLE-REALMS exactly: near a leaky breach, `placeForRealm` draws a **minority** of
site mints (same `p ≈ min(0.35, fray*breachLeak)` curve — one law, one tune point, shared
constant with the NPC leak) from the **breached realm's skin** — the frontier town with one
Theater mess tent in it; the "what is a legionnaire's canteen doing here" mystery, generated.
Guard: leak is breach-proximate and minority; the settlement stays legibly its own realm. A
breached place may also carry `dm.dressing` from both realms' prop sets (the visual tell).

### gen[] / prep

- `prepCastFrontier` passes the node's realm into `rollPlace` — the main consumer, zero new API.
- The reserved `gen kind:"place"` (ON-DEMAND-GEN) **stays reserved** in v1. The DM's existing
  `interior` kind gains nothing new here except that typed buildings resolve their kit through
  the realm skin where a mapping exists (unit 6). Un-reserving `place` for the DM is a future
  call, Adam's.

---

## §5. Build units (Sonnet-executable, in order)

**Craft lane first (Adam + Fable, not Sonnet): author `Place Spine.md` + 11 `Place Skin - <Realm>.md`**
in `Engine/03. _Tables/05. Realms/`, format identical to the NPC role skins (reskin rows + [ADD]
rows + `namePatterns` + `castProfile`). Engine units below assume these exist; unit 1 can land
against Frontier + 2 keyed realms and backfill.

1. **`build/gen-place-skins.py` → `data/place-skins.js`** — mirror `gen-role-skins.py` exactly:
   parse spine + skins, emit classic-script globals `PLACE_SPINE`, `PLACE_SKINS`,
   `placeForRealm(realmId, rng, opts)` (weighted pick; `opts.archetypeBias` multiplies listed
   keys' weights; `opts.excludeScale` for future use). `weight:null` inherit, `0` drop; unknown
   realm → frontier. Register in `manifest.json` (owns those three symbols; `<script>` before
   codex-roll.js). `--check` mode. `check-manifest.py` green.
   *Red-first:* fixture skin with a dropped row → assert the key never appears in 500 draws for
   that realm (and DOES for frontier); mutation: break the weight override → distribution test fails.
2. **`rollPlace` realm swap** (`src/engine/codex-roll.js`) — thread `opts.realm`; call
   `placeForRealm`; store `rolled.archetypeKey/label/note`, `fields.type`; name via skin
   `namePatterns` when present else existing `placeNameDesc` path; add `dm.itemsPool`,
   `dm.dressing` pointers. **Back-compat law: `opts.realm` absent → frontier skin, payload a
   strict superset of today's shape** (regression assert on field presence + `prepCastFrontier`
   still green).
   *Red-first:* jsdom — mint a place in a `gloom` world fixture → `fields.type` is a Gloom label,
   `dm.itemsPool==="realm-items-gloom"`; no-realm mint → byte-superset of a pre-change golden.
3. **Cast wiring** — anchor NPC mints via `roleForRealm` filtered by `castProfile` class
   (fallback: unfiltered pick if the class has no candidates — never dangle); ambient scene-bucket
   mapping from archetype (a small `SCENE_BUCKET_BY_ARCHETYPE` map in place-skins.js); partials
   env band passed through. Composes with prepCastAmbientScene — no new population code.
   *Red-first:* Watering-hole mint → anchor's `cls` in the profile; mutation: drop the filter →
   class-mismatch rate explodes → fail.
4. **HOOK-WALKS seam** — accept + honor `opts.archetypeBias` (already in unit 1's signature);
   publish the terminus-bias mapping table (hook class → archetype keys) in this doc's appendix
   when HOOK-WALKS locks. Blocked-on: HOOK-WALKS spec lock; the parameter itself is not blocked.
5. **Breach leak** — the minority cross-skin draw, sharing the NPC leak constant (call the same
   global, do not fork the number). *Red-first:* leaky-breach fixture → 500 mints → breached-realm
   labels present but <40%; no-breach fixture → zero.
6. **Building kits + districts relabel** (smallest unit, can run parallel) — `BUILDING_KITS`
   gain per-realm label overrides (data-only; kit mechanics untouched); `mintDistricts` district
   names route through a realm relabel map. Chrome districts carry a faction handle default.
   *Red-first:* chrome world → no "smithy"-labeled kit surfaces; no-realm → labels byte-identical.

Every unit: own branch, `check-manifest.py`, regression run of `verify-prep-bundle` /
`verify-walk` / codex tests, orchestrator re-gates (never trust self-reported green).

---

## §6. Adam's rulings needed

1. **Spine size + rows** — 24 recommended above; the draft rows are Fable's; the craft pass is
   yours. Approve count + kill/merge/add rows.
2. **Skin labels** — all 11 realms' labels are yours (the NPC-skin precedent). Recommend the
   reference-pair order: Frontier + Chrome + Gloom first (most keyed tonight), backfill 8.
3. **Naming patterns for mundane-key realms** — is "<Family-name>'s Diner" pattern-naming
   acceptable for Gloom/Noir/Suburb, or do you want authored name tables per realm? (Recommend
   patterns — a name table per realm per place-type is the breadth trap.)
4. **Bright-Kingdom Boneyard drop** — I ruled death-forms out of ambient Bright-Kingdom (breach
   fuel only). Veto if you want the Nintendo world to have its Kirby-graveyard uncanny built in.
5. **Per-realm place-secret tables** — deferred out of v1 (one generic table, realm voice in
   narration). If Gloom's "the town made a deal" key deserves its own secret table NOW, say so —
   it's the one realm where I nearly broke my own scope fence.
6. **Shared leak constant** — place-leak and NPC-leak ride one number. Veto if places should
   hybridize rarer than people (defensible: a foreign *building* is louder than a foreign face).
7. **`gen kind:"place"` un-reservation** — stays reserved in v1 per ON-DEMAND-GEN. Rule when the
   DM seat may mint whole places mid-turn.

## RESOLVED — Adam's rulings (2026-07-08 night)
1. **Spine-24 + replace-rollPlace-in-place: adopted as drafted.** Adam does a craft pass on the spine rows and skin labels later — rows land PROVISIONAL.
2. **Pattern-naming for mundane-key realms: yes.**

---

## ADDENDUM 2026-07-09 — the visual-engine expansion (Adam's rulings, binding)

Context: the source gathers landed (`PLACE-GATHER-DMG14-SETTLEMENTS`, `PLACE-GATHER-DMG14-DUNGEONS`,
`PLACE-GATHER-DMG24-SETTLEMENTS`, `PLACE-GATHER-DMG24-BASTIONS` — vision-read, committed 2acdcb8),
and Adam expanded the plan: **generated places are no longer narrative-first with a render bolted
on — they generate the actual diorama spaces the tabletop shows.** Three rulings supersede parts
of the body above:

### A. THE GRID LAW — 5-ft cells are the spatial standard (NEW, rewire-class)

> **Every generated space is measured in real D&D 5-ft cells.** Any table row, kit, skin field, or
> spec that describes a physical space carries dimensions in feet divisible by 5. The diorama floor
> is divided into 5×5-ft cells.

Honest inventory at ruling time: **nothing was standardized.** Combat space = bands×lanes
(1 band ≈ 25 ft depth, 1 lane ≈ 20 ft width, `src/engine/combat.js:28`); theater tiles are
abstract (`TILE_SIZE=1` world unit, no footage); blockwright cuboids likewise. Adam ruled the
rewire worth it. The arithmetic is clean: **1 band = 5 cells deep, 1 lane = 4 cells wide** —
bands/lanes become *views over* the cell grid (combat math initially unchanged, reading derived
bands), not casualties of it. Rewire order: (1) place-gen emits footprints in cells from birth,
(2) theater tiles bind 1 tile = 1 cell (5 ft), (3) combat band/lane derives from cell geometry.
Step 3 is its own unit; steps 1–2 ride with this spec's build.

### B. Scope fence amended — structured interiors are IN

§3's "no interior floor-plans beyond the existing building-interior roll" is **lifted**. The DMG14
Appendix A machinery (start → chambers → purpose-by-site-type → state → contents → dressing, all
gathered) becomes the raw material for a **structured interior generator**: a site mint can emit
rooms with real cell dimensions, purposes, and dressing pointers — realm-skinned like everything
else. The Bastion facility taxonomy contributes **space bands (Cramped/Roomy/Vast, in sq ft → cells)
and staffing counts** as spine-row fields. Interior gen is a new build unit family (spec section to
be drafted before its build wave); the v1 fence on per-place economy/schedules still holds.

### C. Settlement-table upgrade lane (authorized 2026-07-09)

The five thin ported tables — `Place Ruler Status`, `Place Race Relations`, `Place Mythology`,
`Place Nearby`, `Place Relevancy` — get the Master-Setting-grade craft treatment (d100, 5-band,
66/20/9/4/1 authoring spread), seeded from the DMG14 gather rows. Physical rows carry GRID-LAW
dimensions. Originals archive to `zz_Archive/`; upgraded rows land **PROVISIONAL** pending Adam's
red-pen (the 06-22 precedent).

Still outstanding: full Van Richten's (current file is a subclasses excerpt — no domain-gen
chapter); Adam is sourcing it. Gloom skin gather waits on it.
