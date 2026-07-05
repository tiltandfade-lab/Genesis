---
type: fix-spec
project: Genesis
status: SPECCED — forks RULED (Fable, 2026-07-05); build-ready
provenance: deep /code-review over the 2026-07-05 monster-production wave (range 7cb3a5c^..HEAD);
  8 finder angles → 1-vote verify; 9 CONFIRMED + 1 PLAUSIBLE; 4 candidates REFUTED at verify
updated: 2026-07-05
---

# Review-Fixes — the 2026-07-05 wave (LOCKED)

Verified findings from the deep review of the monster-production wave's authored
diff. All ⚑ forks are **RULED** below with grounds — executors do not re-litigate.
All `file:line` anchors verified against the current master tree by the
orchestrator (2026-07-05). Two of the HIGH bugs (U3, U4) passed
`verify-monster-parley 58/0` because the harness calls the functions directly
while nothing in the game does — every unit here therefore requires
**reachable-path** tests, not direct-call tests.

**Refuted at verify (do NOT "fix" these):** foe `size`/`creatureType` ARE stamped
(combat.js:85/90); the anomaly-clamp narration reads `res.shift` not
`res.outcome`; the friendly-spawn disposition is intentionally slot-owned (a
re-picked creature inheriting it is design, dungeon-walk.js:324-325); the
Mythic row-8 `role` field IS present in dev/model-qa/monster-flavor.json.

## The queue

| unit | branch | files | depends on |
|---|---|---|---|
| U1 | `fix/flavor-first-fight` | src/world/dm.js | — |
| U2 | `fix/realm-grade-mirror` | src/engine/theater-data.js, src/ui/theater-boot.js | — |
| U3 | `feat/pet-upkeep-wiring` | src/world/play.js, src/world/companions.js, src/world/dm.js | — |
| U4 | `feat/creature-parley-wiring` | src/world/dm.js, (read-only: src/engine/social.js) | — |
| U5 | `fix/combat-traits-parse` | src/engine/combat.js | — |
| U6 | `refactor/bestiary-resolve-index` | combat.js, walk.js, dungeon-walk.js, walk-archetypes.js, quest-hook.js, manifest.json | U1–U5 landed |

U1–U5 are independent (U1/U3/U4 all touch dm.js but in disjoint regions —
digest/mint ~243/1024, attack ~1307 + tend_pet new case, social_check ~2167;
merges resolve cleanly in landing order U1→U3→U4). U6 runs as wave 2 off the
post-landing master (combat.js contention with U5). Banked cleanup (R8-rest) at
the bottom — NOT in this wave.

---

## U1 — flavor payload on the FIRST fight + mint name guard (dm.js)

**Bugs (CONFIRMED HIGH + PLAUSIBLE).** `combatDigest` gates the foe's
`flavor`/`flavorD8` payload on `rec.fields.seenCount===1` (dm.js:243, 249), but
`codexMintSignificantFoes` (dm.js:1024) mints with NO `seenCount` in the fields
blob, and `seenCount` is first written at `encounter_resolved` (dm.js:2391) as
`(rec.fields.seenCount||0)+1`. First fight: `undefined!==1` → payload dropped;
it surfaces one encounter late, never for a once-met foe. Also: the mint derives
the id via `codexKeyId("creature", f.name)` (dm.js:1035) with no non-empty-name
guard.

**⚑ RULED — seed-at-mint.** Seed `seenCount: 1` in the mint fields blob. Grounds:
minimal, and the first *sighting* is the first encounter. Accepted nuance: a foe
minted in a fight that never resolves (fled) keeps `seenCount===1`, so the flavor
shows again in its first *resolved* fight — desirable, not a bug. The
`encounter_resolved` bump is untouched (1→2 after the first resolved fight).

**Steps.**
1. In `codexMintSignificantFoes` (dm.js:1024), at the top of the per-foe loop:
   `if(!f || !f.name) continue;` (the name guard).
2. In the same function's mint fields blob (the `codexAdd` payload around
   dm.js:1062-1071 — realm/cr/size/type/summary/habitat/activity/factionFit/
   treasure/displaced): add `seenCount: 1`.
3. Touch NOTHING else — the digest gate (243/249) and the resolved bump (2391)
   stay byte-identical.

**Out of scope:** any change to the digest gate condition, the flavor payload
shape, or encounter_resolved.

**Verification (dev/verify-monster-story.mjs — extend).**
1. ⊗ RED-FIRST: drive `applyEvent(combat_start)` with a significant realm foe →
   build `combatDigest` → assert the digest carries `flavor` and `flavorD8` for
   that foe **during the first fight**. Prove this fails on pre-fix master.
2. Same world: resolve the encounter, start a second fight with the same foe →
   assert the digest does NOT repeat the payload (`seenCount` now 2).
3. Mint called with a foe whose `name` is `""`/undefined → no record minted, no
   throw.
4. Regression: full `verify-monster-story`, `verify-dm-events`,
   `gauntlet-fuzz-events` green.

---

## U2 — kill the realm render-profile mirror (theater-data.js + theater-boot.js)

**Bugs (CONFIRMED HIGH ×2).**
- T1: `data/realms.js` profiles carry a STRING tint (`"#c88a3c"`);
  theater-boot's local `hexToRGB` (theater-boot.js:289) returns `0x808080` for
  any non-number. `setBoard` prefers the stamped string-tint profile as
  `S.realmProfile` (theater-boot.js:3436), so `figureMaterialFor` /
  `applyLightProfile` / the void tint all grade toward GREY while tiles (graded
  in theater-data via `_gradeHexToRGB`, which accepts strings) tint correctly.
  Root cause: the `REALM_RENDER_PROFILES` mirror (theater-boot.js:2657-2689) —
  the dual-table trap resurrected as a type mismatch.
- T2: with 2+ active realms the floor surface picks its realm by seeded hash
  (`theaterFloorSurfaceInfo`, theater-data.js:637) while the render grade uses
  `realms[0]` (via `realmRenderProfile` at theater-data.js:700) — floor and
  grade can come from different realms in the same room.

**⚑ RULED — the stamp is the ONLY path, and the seeded pick is the room's realm.**
Grounds: "if a data table lives in two places kept in sync by convention, that IS
the bug" (this exact mirror already shipped the lava-red bright-kingdom). And one
seeded realm per room keeps floor + grade + narration coherent while preserving
multi-realm variety (realms[0] would bias every mixed room to the first realm).

**Steps.**
1. In `theaterBoardFrom` (theater-data.js): resolve the room's realm ONCE —
   hoist the seeded pick (the `theaterLightSeedHash(seedKey+":realm") %
   opts.realms.length` expression at :637) to a single `boardRealm`, and thread
   it into BOTH `theaterFloorSurfaceInfo` (replace its internal pick with the
   passed realm; keep the internal pick as fallback when none is passed) AND the
   `renderProfile` resolution at :700 (resolve the profile for `boardRealm`, not
   `realms[0]`).
2. Stamp a **GL-ready** profile at :700/:885: convert the tint string to a
   NUMBER once here (`parseInt(tint.replace('#',''), 16)`; a tint that is
   already a number passes through; null/absent tint → null). The stamped shape:
   `{ sat, tint: <int|null>, tintAmt, contrast }`.
3. In theater-boot.js: DELETE `REALM_RENDER_PROFILES`,
   `REALM_RENDER_DEFAULT_LOCAL`, and `realmRenderProfileLocal`
   (:2657-2689 region). Keep `gradeColorLocal` (the sealed module can't import
   the classic-global `gradeColor`) but it now reads a numeric tint only.
   `setBoard` (:3436) becomes `S.realmProfile = data.renderProfile || null`; a
   null profile → `gradeColorLocal` returns the input color unchanged (no-op
   grade).
4. Every `gradeColorLocal` call site (figure material, light profile, void tint)
   must behave identically for null profiles (verify each).

**Out of scope:** the profile VALUES (Adam's §2 tune is a separate ledger item);
any tile-grading change in theater-data (already correct); fog/dressing logic.

**Verification.**
1. ⊗ RED-FIRST (dev/verify-theater-data.mjs — extend): assert the stamped
   `renderProfile.tint` is `typeof "number"` or null for every realm with a
   tint. Prove it fails pre-fix (string tint).
2. Extend: a 2-realm board → assert the floor-surface realm === the
   renderProfile realm (stamp the chosen realm id on the board for the test,
   e.g. `board.realmId`).
3. Grep-gate: `REALM_RENDER_PROFILES` has ZERO references in src/ after the
   change.
4. Full `verify-theater-data`, `verify-theater-figures`, `verify-battlemap`
   green.
5. VISUAL (orchestrator, not harness): re-render the 12-swatch review sheet +
   a figure sheet in a warm-tint realm; figures/lights/void must visibly match
   the tile tint (no grey wash). The orchestrator reads the PNGs personally.

---

## U3 — wire pet upkeep/decay (play.js + companions.js + dm.js)

**Bug (CONFIRMED HIGH).** `companionTickAllPets` / `companionPetNeglectTick` /
`companionPetHarmedByKind` / `companionPetWanders` (companions.js:233-282) have
no game-path callers — `passTime` (play.js:358) only calls
`companionChargeWages`; no damage path calls harmed-by-kind. Pets never decay;
MONSTER-PARLEY §2's "bond with upkeep" never fires.

**⚑ RULED — tend is a DM-declared event; decay defaults on; harm fires on any
PC damage, once per kind per combat.** Grounds: the DM judges WHEN an
interpretive beat lands (Charter §8.3b pattern), the script owns the number;
default-on decay is the "upkeep" in bond-with-upkeep (hard-and-dangerous); and
waiting for a kill would soften "DOWN HARD if the PC harms its kind" — any
damage counts, but once per combat per kind so multi-hit rounds don't shred.

**Steps.**
1. **New applyEvent case `tend_pet`** (dm.js, beside the other companion events):
   payload `{ type:"tend_pet", target:<pet codexId> }`. Find the pet in
   `companionsOf(w).pets` by codexId; not found → `{ok:false,
   reason:"no-pet:"+target}`. Found → stamp `pet.tendedDay = clockOf(w).day`,
   ledger an outcome (`kind:"pet-tended"`), return ok. Mirror the guard style of
   the adjacent companion cases.
2. **Neglect tick at the rest gate** (play.js:358 block): inside the existing
   `if((kind==="dawn"||kind==="montage") && ...)` region add
   `if(typeof companionTickAllPets==="function") companionTickAllPets(w);` —
   non-blocking, same posture as the wages call.
3. **Tended semantics** (companions.js:247 `companionTickAllPets`): derive
   per-pet `tended = (tendedIds set has codexId) || (pet.tendedDay != null &&
   (clockOf(w).day - pet.tendedDay) <= 1)`. Keep the `tendedIds` param (harness
   channel); `tend_pet` is the game channel.
4. **Harm-by-kind at the attack path** (dm.js:1307 `case "attack"`): where PC
   damage is committed to a foe, add: resolve `kindKey = (foe.statBase &&
   foe.statBase.id) || foe.creatureType || null`; guard once-per-combat-per-kind
   via `cm.petHarmFired = cm.petHarmFired || {}` on the live combat container
   (`if(cm.petHarmFired[kindKey]) skip; else mark + call
   companionPetHarmedByKind(w, kindKey)`). Non-blocking; only when damage > 0
   actually lands on the foe.

**Out of scope:** loyalty VALUES/curve (companions.js math is built and
untouched); hireling wages; any UI.

**Verification (dev/verify-monster-parley.mjs — extend; REACHABLE-PATH only).**
1. ⊗ RED-FIRST: bind a pet, drive `passTime("dawn")` (the real function, not
   companionTickAllPets directly) → assert loyalty dropped by 1. Prove it fails
   pre-fix (loyalty frozen).
2. `applyEvent({type:"tend_pet", target})` then `passTime("dawn")` same day →
   loyalty unchanged.
3. ⊗ RED-FIRST: drive the real `attack` applyEvent dealing damage to a foe of
   the pet's kind → assert the hard drop (−2) + ledger line; a SECOND attack on
   the same kind in the same combat → no further drop. Prove the first fails
   pre-fix.
4. Loyalty driven to 0 via ticks → pet wanders (roster removed, codex record
   persists).
5. `gauntlet-fuzz-events` (hostile `tend_pet` payloads: missing target, unknown
   id, non-pet codexId) + `gauntlet-monkey` 0-aborted; full
   `verify-monster-parley`, `verify-companions`, `verify-combat` green.

---

## U4 — wire creature-parley §1 (dm.js social_check)

**Bug (CONFIRMED MED-HIGH).** `socialCheckAbilityFor` (social.js:113) and
`creatureLevers` (social.js:130) have zero resolver callers — the `social_check`
case (dm.js:2167) uses DM-supplied `p.levers` → `applyLeverage` (:2172) and
DM-supplied `p.skill`, so beast parley runs on the Charisma/Persuasion default
and the "read the animal" path does nothing.

**⚑ RULED — ability is ADVISORY (digest hint); creature levers AUTO-MERGE with
dedupe.** Grounds: engine owns the nouns — a creature's intrinsic want/fear is a
table-rolled fact the DM should never have to re-declare (anti-drift); but the
roll itself is the DM's (agency law), so the ability is surfaced advice, not an
enforcement gate that would reject legitimate DM judgment.

**Steps.**
1. In `case "social_check"` (dm.js:2167), after `rec0` is fetched (:2170) and
   the DM levers are read (:2171): if `rec0 && rec0.kind==="creature" && typeof
   creatureLevers==="function"`, compute `derived = creatureLevers(rec0)` and
   merge into `levers`, deduping by the lever key applyLeverage prices (a
   DM-declared lever of the same key wins; no double-pricing). The merged array
   feeds the existing `applyLeverage(socialDC(a.value), levers)` — resolver math
   in engine.social stays byte-identical.
2. Digest surfacing: where creature codex records reach the DM digest (the
   parley-angle block), attach `parleyAbility: socialCheckAbilityFor(rec)` for
   `kind==="creature"` records — one short field, DIGEST-DIET conscious.
3. Ledger the auto-merged levers in the social_check outcome payload
   (`leversDerived: [...keys]`) so playtests can see the engine's contribution.

**Out of scope:** `resolveSocialCheck` / `applyLeverage` internals (byte-
identical); NPC (non-creature) social flow; the grind ceiling / bondEligible
stamps (built, untouched); any new lever TYPES.

**Verification (dev/verify-monster-parley.mjs — extend; REACHABLE-PATH).**
1. ⊗ RED-FIRST: `applyEvent(social_check)` against a Beast codex record with an
   authored want/fear and NO DM levers → assert the outcome shows the derived
   lever affected the DC (compare vs a record with no story fields). Prove it
   fails pre-fix (derived levers ignored).
2. DM declares a lever with the same key the creature derives → priced once.
3. Digest for a scene with a creature record → `parleyAbility` present and
   correct for a Beast (Animal Handling) vs a non-beast creature.
4. NPC record → byte-identical behavior to pre-fix (no derived levers, no
   parleyAbility on NPCs).
5. Full `verify-monster-parley`, `verify-social` green; `gauntlet-fuzz-events`
   on social_check payloads.

---

## U5 — combat action-parse + traits-apply + the story-stamp seam (combat.js)

**Bugs (CONFIRMED ×3) + the R8a altitude fix (same file, bundled).**

**⚑ RULED (three):**
- **C3 → parse the range.** `cmParseActionText` (:101) never assigns
  `out.range`, so the `|| out.range` disjunct (:133) is dead and a ranged action
  without the literal word "Ranged" misclassifies as melee. Ruling: parse it —
  realm actions are authored freely; requiring a token is a silent authoring
  trap. Add: match `/range\s+(\d+)(?:\/(\d+))?\s*ft/i` → `out.range =
  {normal:+$1, long:+$2||+$1}`; the existing disjunct then works. Confirm the
  resolver's `kind:"ranged"` consumers behave (grep `kind==="ranged"` /
  `kind:'ranged'` and eyeball each).
- **C2 → replaces-first, two-pass, no silent caps.** `cmApplyTraits` (:153):
  today a `replaces` entry that misses its chassis target falls into the
  additive branch (:172) under the same `chassisCount+2` cap (:155/:172/:176) —
  an authored replacement ("the law") can be silently dropped order-dependently.
  Ruling: pass 1 applies ALL `replaces` entries in place (no budget; a
  replace-MISS logs `console.warn("[cmApplyTraits] replace target not found: …")`
  and queues for pass 2); pass 2 applies additive entries under a HARD
  `chassisCount+2` cap (the CR-budget law holds) with a loud `console.warn` on
  every capped drop. Nothing is ever dropped silently.
- **C1 → foe.traits keeps its original meaning.** cmResolveFoe (:613) does
  `foe.traits = f.traits; cmApplyTraits(foe, foe.traits)` (:651), overwriting
  the chassis SRD trait array (cmFoeFrom :71-79) with the realm override blob —
  same key, different shape (latent; self-documented at :648-650). Ruling:
  `foe.traits` stays the chassis SRD array; the override blob is NOT stamped
  onto it — call `cmApplyTraits(foe, f.traits)` directly and stamp the blob on
  `foe.override` (provenance/debug). Apply the same change at
  combatFromEncounter's parallel stamp (~:700 region).

**R8a (bundled):** extract `cmStampFoeStory(foe, spec)` — the single helper that
carries the story fields (realm/desc/realmRole/bossSlot/displaced/doing/
spawnDisposition/nonHostile + the override/cmApplyTraits call) — used by BOTH
cmResolveFoe (:613) and combatFromEncounter (~:700), so a future 6th story field
is added once. Register nothing new in manifest unless the helper is
module-top-level (it will be — add to `owns`).

**Out of scope:** damage math, initiative, the traits DATA (generated), any walk
file (that's U6).

**Verification (dev/verify-combat.mjs — extend).**
1. ⊗ RED-FIRST: parse `"Attack Roll: +6, range 80/320 ft., Hit: 8 (1d10+3)
   piercing"` (no "Ranged" token) → `kind==="ranged"`. Prove pre-fix it says
   melee.
2. ⊗ RED-FIRST: a traits blob with 2 additive entries followed by 1 `replaces`
   entry that matches a chassis action → the replacement lands regardless of
   position. Prove pre-fix order-dependence (the replacement dropped).
3. A replace-miss → warn logged, entry lands additively if budget allows,
   capped-with-warn otherwise; never silent.
4. After a realm override: `foe.traits` is still the chassis SRD array;
   `foe.override` carries the blob; the applied actions reflect the override.
5. Both foe paths (combat_start via cmResolveFoe, and combatFromEncounter)
   produce identical story-field sets on the foe (the cmStampFoeStory unification
   check).
6. Full `verify-combat`, `verify-monster-story`, `verify-realm-wiring` green;
   `check-manifest.py` OK (new owned symbol).

---

## U6 — one bestiary resolver + slug index (wave 2, after U1–U5 land)

**Issue (CONFIRMED dup + hot-path O(n), 4 angles converged).** The fuzzy
"BESTIARY by exact id OR cmSlug(name)" loop is copy-pasted in 5 sites:
walk-archetypes.js:205 (`monsterHabitatFit`), dungeon-walk.js ~:401
(`dwalkActivity`, an inner closure), walk.js ~:292 (`walkActivity`, inner
closure, byte-identical to dwalkActivity), quest-hook.js:21
(`qhookResolveThreatCreature`), combat.js:207 (`resolveCreature`, the
pre-existing canonical). Each miss scans all 510 entries recomputing `cmSlug`;
fires 4-5× per generated encounter (habitat + activity re-resolve the same
creature).

**Fix (as specced — no forks).**
1. In combat.js beside `resolveCreature` (:207): add `bestiaryResolve(nameOrId)`
   → entry or null, backed by a lazily-built module-level index (built on first
   call, `cmSlug(entry.name)→id` + `id→id`; lazy avoids load-order coupling).
   Add `bestiaryActivityOf(entry)` → first non-`"any"` activity or null.
2. Replace all 5 sites (including `resolveCreature`'s own inner loop) with calls
   to the shared pair. In the walk encounter functions, resolve each creature
   ONCE per slot and read both `.habitat` and `.activity` from that entry —
   delete the `dwalkActivity`/`walkActivity` inner closures.
3. Register the new module-top-level symbols in manifest.json `owns` (engine
   layer); run `check-manifest.py`.

**Out of scope:** any behavior change — this is a pure refactor; encounter
output must be identical.

**Verification.**
1. DETERMINISM DIFF (the gate that matters): seed-drive N walk generations
   (dungeon + urban + wilderness) pre-branch and post-branch with identical
   seeds/forced rolls → byte-identical encounter output. (Copy the forced-roll
   harness pattern from dev/verify-realm-wiring.mjs.)
2. Full sweep green: `verify-walk`, `verify-realm-wiring`, `verify-combat`,
   `verify-monster-story`, `check-manifest.py` OK.
3. Sanity: `bestiaryResolve("Giant Rat")` === the entry `resolveCreature`
   found pre-refactor (index equivalence spot-check inside the harness).

---

## Banked (R8-rest — NOT this wave; carry to NEXT-STEPS at close)

- Walk-family habitat re-pick → shared `walkHabitatRepick` (walk-archetypes.js).
- Python generator dedup: shared `flavor_shape.py` (batch shape + d8 validator +
  HABITAT/TREASURE vocab) + shared node-eval extractor across the 4 gen-*.py / 2
  merge scripts.
- `REGISTERED_PROP_SLUGS` (gen-realm-props.py) derived by parsing
  WHOLE_OBJECT_REGISTRY's `prop:*` keys instead of a hand-synced set.
- `theaterRealmPropForText` pool hoist (once per theaterBoardFrom) + per-prop
  word-list precompute + `realmPropsFor` narrowed to active+`all` realms.

## Landing order

U1 → U3 → U4 (dm.js in disjoint regions, this order) → U2 → U5, then U6 off the
new master. Each unit lands `--no-ff` after the orchestrator personally re-gates
(checkout law first: `git branch --show-current`). Push origin after the batch.
