/* THEATER FIGURE BUILD — figureFor's whole resolution chain plus the legacy weaponMeshFor composer,
   extracted VERBATIM from src/ui/theater-boot.js in split step B3 (2026-07-25;
   docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   OWNERSHIP: the ONE question "given a unit, what mesh represents it?" — figureFor's precedence chain
   (sprite billboard -> whole-object module -> glb -> pcRecipe -> bestiary recipe -> archetype cuboid,
   every branch falling through rather than throwing), the MODEL-PATH INSTRUMENTATION that records
   which rung answered (MODEL_PATH_STATS + _classifyWholeKey + _tallyPath — figureFor is their only
   writer), and weaponMeshFor + its WEAPON_BASE_OFFSET grip constant (the legacy archetype path's
   weapon composer, used only when a unit has no recipe). This module holds no cache, no GPU resource,
   no timer and no theater state: every mesh it returns is owned by whoever adds it to the scene, and
   the geometry/material caches behind it belong to theater-whole-object.js.

   CTX LAW (recon §7.3 — acyclic imports; the same shape as theater-clay-room.js /
   theater-light-lab.js / theater-skins.js / theater-whole-object.js): this module NEVER imports
   theater-boot.js. Its sibling leaves it DOES import directly — theater-parts.js (the part registry
   weaponMeshFor composes from), theater-figures.js (the whole-object registry + NEAREST_SUB the path
   classifier reads), theater-whole-object.js (the geometry/material factory and its two placement
   laws) — which stays acyclic because none of the three imports this file or the root. Everything
   else arrives ONCE through figureBuildInit(ctx):
     the composition capabilities that stay root-owned — renderPartInto, flatTints,
       ARCHETYPE_BUILDERS, buildFigureFromRecipe, recipeFor, orientYawForArchetype, WEAPON_PART_KEY,
       weaponCarryFor (buildFigureFromRecipe uses those last two as well, so they are the recipe
       path's property, not this module's);
     the sprite-channel seams — spriteEntryFor, buildSpriteBillboard, interiorSpriteBillboard and
       _spriteCensusOutcome (which reads FACETED_FLIP_ENABLED, a literal dev/battle-gate/
       capture-s5-flip-card.mjs rewrites in place, so it and its readers stay in the root);
     and TWO ACCESSORS, figCtxSpriteChannelEnabled / figCtxWholeObjectEnabled, for the live A/B flags
       SPRITE_CHANNEL_ENABLED and WHOLE_OBJECT_ENABLED. Those are root `let`s the
       window.Theater.spriteChannel / window.Theater.wholeObject setters write at runtime: an import
       binding is read-only and a plain mirror would go stale the moment a capture gate flips one, so
       they are READ THROUGH A CALL, never copied.
   `theaterCensusRecord` is left exactly as it was — a classic-script global reached through
   `typeof theaterCensusRecord === "function"`, which resolves off globalThis from module scope just as
   it did from the root's, and stays a clean no-op when the census script isn't loaded.
   figureBuildInit runs at the ROOT'S END-OF-BODY (unlike skinsInit/wholeObjectInit, which run right
   after the root's imports): this ctx carries top-level `const`s — ARCHETYPE_BUILDERS,
   WEAPON_PART_KEY — that are still in their temporal dead zone up there. Nothing can call figureFor
   or weaponMeshFor before then; the root's own boot-time render entry, clayRoomBootSelfMount(), is
   the last statement in the file, after this wiring.

   NON-VERBATIM EDITS — the complete list, two lines, both inside figureFor and both the flag-accessor
   swap described above (each carries its own inline `split B3` note at the point of change):
     `if(SPRITE_CHANNEL_ENABLED && ...)`  ->  `if(figCtxSpriteChannelEnabled() && ...)`
     `if(WHOLE_OBJECT_ENABLED){`          ->  `if(figCtxWholeObjectEnabled()){`
   Everything else — including the header/import/mirror prologue above the first moved line and the
   trailing `export {...}` block — is additive; not one other byte inside a moved declaration changed. */
import * as THREE from "three";
import * as Parts from "./theater-parts.js";
import { resolveWholeObject, WHOLE_OBJECT_REGISTRY, NEAREST_SUB } from "./theater-figures.js";
import {
  WHOLE_OBJECT_YAW, wholeObjectKeyFor, wholeObjectGeometryFor, wholeObjectGeometryForGlb,
  wholeObjectMaterialsFor
} from "./theater-whole-object.js";

// ---- root-capability mirrors (wired once by figureBuildInit; see the CTX LAW note above) ----
let figCtxSpriteChannelEnabled, figCtxWholeObjectEnabled;
let ARCHETYPE_BUILDERS, WEAPON_PART_KEY, _spriteCensusOutcome, buildFigureFromRecipe, buildSpriteBillboard;
let flatTints, interiorSpriteBillboard, orientYawForArchetype, recipeFor, renderPartInto;
let spriteEntryFor, weaponCarryFor;

export function figureBuildInit(ctx){
  ({ ARCHETYPE_BUILDERS,
    WEAPON_PART_KEY,
    _spriteCensusOutcome,
    buildFigureFromRecipe,
    buildSpriteBillboard,
    flatTints,
    interiorSpriteBillboard,
    orientYawForArchetype,
    recipeFor,
    renderPartInto,
    spriteEntryFor,
    weaponCarryFor } = ctx);
  figCtxSpriteChannelEnabled = ctx.figCtxSpriteChannelEnabled;
  figCtxWholeObjectEnabled = ctx.figCtxWholeObjectEnabled;
}

// THE FIST RULE (L14, 2026-07-03): kept byte-identical to torsoBiped.anchors.mainHand.pos (0.3, 0.58,
// 0.02) — the FIST CENTER the fist retarget moved the biped grip to (see theater-parts.js's own FIST-
// RULE anchor header). A weapon seated here has its grip section INSIDE the arm's oversized fist box
// (geometric intersection, not adjacency). The "one grip contract, two render paths" invariant: the
// legacy weaponMeshFor path (this constant) and the recipe path (the anchor) MUST agree; the giant
// path reads torsoBipedHuge.anchors.mainHand live (no separate literal).
const WEAPON_BASE_OFFSET = { x: 0.3, y: 0.58, z: 0.02 };
/* weaponMeshFor — the LEGACY archetype-builder weapon composer (buildBiped/buildGiant's fallback path,
   used only when a unit has NO recipe). `weapon` is a weapon SHAPE key (sword/axe/spear/...); `offset`
   is the caller's grip anchor (torsoBiped/torsoBipedHuge mainHand). CARRY STATES (L14/L15): routes
   through the SAME weaponCarryFor the recipe path uses, so a legacy spear PLANTS and a legacy sword is
   held-fist identically to a recipe one — the two paths stay in sync (the desync the ruling warns
   against). The legacy path has no heavy-2H signal (a bare shape key can't distinguish a longsword from
   a greatsword) so it never back-mounts — a fallback figure just holds its weapon at the fist, which is
   correct (back-mount is a recipe/PC-item affordance). Returns null for none/unknown. */
function weaponMeshFor(weapon, tint, offset){
  if(!weapon || weapon === "none") return null;
  const partKey = WEAPON_PART_KEY[weapon];
  const partFn = partKey && Parts.PARTS[partKey];
  if(!partFn) return null;
  const base = offset || WEAPON_BASE_OFFSET;
  const carry = weaponCarryFor(partKey, { heavy: false });
  const g = new THREE.Group();
  const dpos = carry.dpos || { x: 0, y: 0, z: 0 };
  renderPartInto(g, partFn, {}, flatTints(tint),
    { x: base.x + (dpos.x || 0), y: base.y + (dpos.y || 0), z: base.z + (dpos.z || 0) }, { z: carry.rz });
  return g;
}
/* MODEL-PATH INSTRUMENTATION (Codex diagnosis rec #2, 2026-07-08 — "visual misses stop being a black
   box"). Every figure resolution tallies WHICH path built it: a bespoke model (exact), a NEAREST_SUB
   stand-in (alias), the unpainted meeple (blank), a PC/bestiary recipe, or the legacy archetype cuboid
   — plus loadFail (a real key whose builder wasn't loaded / geometry threw, the invisible failure that
   used to look like taste). `misses` keys the cuboid/loadFail cases by their render key so "why is THIS
   a cuboid" is answerable at a glance. Read-only diagnostics — nothing in product logic reads these;
   exposed on window.Theater.stats.modelPaths + window.Theater.modelPathReport(). */
const MODEL_PATH_STATS = { exact:0, alias:0, blank:0, glb:0, pcRecipe:0, recipe:0, cuboid:0, loadFail:0, sprite:0, misses:{} };
function _classifyWholeKey(wKey){
  if(!wKey) return null;
  if(wKey.indexOf("blank:") === 0) return "blank";
  if(WHOLE_OBJECT_REGISTRY[wKey]) return "exact";
  if(NEAREST_SUB[wKey]) return "alias";
  return "blank";   // resolveWholeObject's figure/prop floor returned the blank entry
}
function _tallyPath(bucket, key){
  MODEL_PATH_STATS[bucket] = (MODEL_PATH_STATS[bucket] || 0) + 1;
  if((bucket === "cuboid" || bucket === "loadFail") && key){
    MODEL_PATH_STATS.misses[key] = (MODEL_PATH_STATS.misses[key] || 0) + 1;
  }
}
// BEAUTY-WAVE.md VP1b (combat-standee true scale, follow-up to VP1): `interiorMode`/`wallHeightCap`
// are additive optional params — every existing caller (refFigure.build, and setUnits when the
// mounted board is the flat tabletop) omits them, so this degrades to the byte-identical tabletop
// buildSpriteBillboard call below. setUnits passes both ONLY when S.lastBoard.kind === "interior3d"
// (the same discriminator setInteriorBoard/setBoard already establish) — combat foes standing in a
// dungeon room then size through interiorSpriteBillboard's TRUE-SCALE math (HUMAN_TRUE_HEIGHT x
// scaleTrue, the SAME function VP1 wired for non-combat interior pieces) instead of inheriting the
// tabletop's render-height-multiplier convention (the kaiju bug this unit fixes).
function figureFor(archetype, seed, tint, silhouette, weapon, recipeSlug, pcRecipe, kind, className, wholeKeyOverride, interiorMode, wallHeightCap){
  // VQ2-RESPEC.md §3 unit L2 — a light context tag for the census entries below (which scene family
  // this figure resolved into), NOT a new state field — read-only, computed fresh per call from the
  // SAME interiorMode param setUnits/interiorBuildPieces already thread through.
  const _censusSceneKind = interiorMode ? "interior" : "tabletop";
  // SPRITE-TRANSITION T4: the sprite-billboard channel resolves AHEAD of the whole-object/glb/recipe/
  // cuboid chain below (docs/SPRITE-TRANSITION.md T4.1) — creature-kind pieces only (a pc/ally keys
  // off its CLASS, not a bestiary name, so it has no sprite-registry join key at all and always skips
  // straight past this branch, same as it always skipped the bestiary recipeSlug lookup further down).
  // Every guard here falls through rather than throwing/rendering blank: gate off, no registry loaded,
  // no name match, a pending (not-yet-cut) match, or a texture that hasn't loaded yet all reach the
  // SAME existing chain this file already had.
  if(figCtxSpriteChannelEnabled() && kind !== "pc" && kind !== "ally"){ // split B3: root-owned live flag (the facade setter writes it) — accessor, not a stale mirror
    const sEntry = spriteEntryFor(recipeSlug);
    if(sEntry){
      if(interiorMode){
        // VP1b: reuse interiorSpriteBillboard/buildSpriteBillboardMesh — never a second sizing formula.
        const built = interiorSpriteBillboard(sEntry, wallHeightCap);
        if(built){
          const g = built.group;
          g.userData.interiorTrueScale = true;
          g.userData.interiorHeight = built.height;
          // BW2-2: the base plinth's radius formula (0.42 x rendered width) needs the sprite's own
          // rendered WORLD width, not just its height — interiorSpriteBillboard already derives it
          // (aspect-scaled off the loaded texture), so stash it alongside interiorHeight rather than
          // re-deriving a second width formula at the setUnits call site.
          g.userData.interiorWidth = built.width;
          g.userData.interiorFloorFrac = 0; // footX/footY already place the canonical anchor at local origin
          _tallyPath("sprite", sEntry.slug);
          if(typeof theaterCensusRecord === "function") theaterCensusRecord("figure", _spriteCensusOutcome(sEntry), sEntry.slug, _censusSceneKind);
          return g;
        }
      } else {
        const sg = buildSpriteBillboard(sEntry);
        if(sg){
          _tallyPath("sprite", sEntry.slug);
          if(typeof theaterCensusRecord === "function") theaterCensusRecord("figure", _spriteCensusOutcome(sEntry), sEntry.slug, _censusSceneKind);
          return sg;
        }
      }
    }
  }
  // P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §4 step 5): resolved BEFORE the pcRecipe branch — the
  // roster-supersession clause (§8 decision 4: "cuboids demote to auto-fallback... never deleted").
  // Guards, in order, EVERY ONE falling through to the EXISTING chain below (pcRecipe -> bestiary
  // recipe -> archetype cuboid) rather than throwing or rendering blank:
  //   - gate off (WHOLE_OBJECT_ENABLED false)              -> skip
  //   - no resolvable key / no registry (+ NEAREST_SUB) hit -> skip (resolveWholeObject returns null)
  //   - builder not yet loaded / its import failed          -> skip (entry.build is not a function)
  //   - geometry build throws                               -> skip (wholeObjectGeometryFor's own
  //                                                             try/catch returns null, evicting any
  //                                                             stale cache entry for that key)
  // A resolved figure gets rotation.y = WHOLE_OBJECT_YAW unconditionally (§3-D3 — BASE_ORIENT_YAW
  // never applies on this path; every module is authored facing +z already).
  if(figCtxWholeObjectEnabled()){ // split B3: root-owned live flag (the facade setter writes it) — accessor, not a stale mirror
    // BATTLE-THEATER T2: an explicit wholeKeyOverride (the reference-shelf / prove-load path,
    // window.Theater.refFigure.build({wholeKey})) forces a specific registry key straight onto the
    // whole-object build path, bypassing wholeObjectKeyFor's kind/class/recipe derivation — the only
    // way to reach a glb test entry that is deliberately not wired to any live unit's key. A falsy
    // override falls back to the normal derivation, so every existing caller is byte-unchanged.
    const wKey = wholeKeyOverride || wholeObjectKeyFor(kind, className, recipeSlug);
    // TABLETOP-UNITS.md §U3: a figure request never comes up empty at the resolveWholeObject step —
    // pieceKind:"figure" routes a genuine miss to "blank:figure" instead of null (the unpainted
    // meeple). The cuboid fallback below is reached ONLY if the resolved entry's builder isn't
    // loaded yet / its geometry build throws (the load-failure path — see resolveWholeObject's own
    // header comment for the full chain).
    // Guarded on wKey truthy (unchanged from before this unit): a unit with NO whole-object key at
    // all (pc/ally with no className, foe with no recipeSlug) is a different situation than "a key
    // that fails to resolve" — it correctly falls through to the pcRecipe/bestiary-recipe/archetype
    // chain below, same as always. The blank-piece guarantee applies once we DO have a key to ask
    // the registry about and it comes back empty.
    const wEntry = wKey && resolveWholeObject(wKey, "figure");
    // BATTLE-THEATER T2: a glb-backed entry (carries `.glb`, no `.build`) takes the GLTFLoader path —
    // its parsed scene (populated on `.glbScene` by loadWholeObjectBuilders) is baked into the SAME
    // whole-object geometry/material shape as a probe-lib figure, wrapped/seated/yawed identically, and
    // tallied as its own "glb" resolution. glb and module entries are mutually exclusive (an entry is
    // one or the other), so this is a peer branch to the module path, not a reorder of it. A glb entry
    // whose scene hasn't loaded yet / whose bake fails falls through to the shared loadFail tally below.
    if(wEntry && wEntry.glb && wEntry.glbScene){
      const geo = wholeObjectGeometryForGlb(wKey, wEntry);
      if(geo){
        const mats = wholeObjectMaterialsFor(wEntry);
        const g = new THREE.Group();
        g.add(new THREE.Mesh(geo, mats));
        g.rotation.y = WHOLE_OBJECT_YAW;
        g.userData.wholeObject = true;
        g.userData.wholeObjectKey = wKey;
        g.userData.wholeObjectDiscR = wEntry.discR;
        _tallyPath("glb", wKey);
        if(typeof theaterCensusRecord === "function") theaterCensusRecord("figure", "glb", wKey, _censusSceneKind);
        return g;
      }
    } else if(wEntry && typeof wEntry.build === "function"){
      const geo = wholeObjectGeometryFor(wKey, false, "figure");
      if(geo){
        const mats = wholeObjectMaterialsFor(wEntry);
        const mesh = new THREE.Mesh(geo, mats);
        const g = new THREE.Group();
        g.add(mesh);
        g.rotation.y = WHOLE_OBJECT_YAW;
        g.userData.wholeObject = true;
        g.userData.wholeObjectKey = wKey;
        g.userData.wholeObjectDiscR = wEntry.discR;
        _tallyPath(_classifyWholeKey(wKey), wKey);
        if(typeof theaterCensusRecord === "function") theaterCensusRecord("figure", "whole-object", wKey, _censusSceneKind);
        return g;
      }
    }
    // a resolved entry we couldn't BUILD (builder not loaded yet / geometry threw) — the invisible
    // failure. Record it (it still falls through to the recipe/cuboid chain below, which tallies the
    // path actually taken; this is the separate "would-have-been-a-model" signal).
    if(wKey && wEntry) _tallyPath("loadFail", wKey);
  }
  // MODEL-GRAMMAR G2: a unit carrying a resolvable recipeSlug renders recipe-driven (§9
  // Decision 1: recipes may improve on the fixed archetypes — new weapon/armor modules from
  // actual bestiary fields — but never worse: recipeFor's own null-fallthrough plus this
  // function's existing archetype-builder fallback together guarantee SOME figure always
  // renders, recipe-driven or not). Silhouette/weapon (PC/ally class-driven / foe keyword-
  // scan) are ONLY meaningful to the fixed archetype builders (buildBiped's silhouette
  // branches, weaponMeshFor) — a recipe-driven figure ignores them entirely, since its own
  // modules[] already encode weapon/armor from the bestiary's real fields, a strictly richer
  // source than the name/action-text keyword scan those params come from.
  // MODEL-GRAMMAR G3 §2 (the loadout mirror): a unit carrying `pcRecipe` (theaterUnitsFrom's live
  // sheet.equipped derivation, PC/ally only) takes precedence over BOTH the bestiary recipeSlug
  // path and the archetype fallback — pcRecipe already IS a full §3 recipe shape
  // (buildFigureFromRecipe's own input), so this is just one more entry in the same precedence
  // chain (pcRecipe > bestiary recipe > archetype), not a new code path. A foe never carries
  // pcRecipe (theaterUnitsFrom only stamps it on pc/ally units), so this branch is a pure no-op
  // for every foe figure.
  if(pcRecipe){
    _tallyPath("pcRecipe", null);
    if(typeof theaterCensusRecord === "function") theaterCensusRecord("figure", "recipe", className || kind || null, _censusSceneKind);
    return buildFigureFromRecipe(pcRecipe, tint, kind);
  }
  const recipe = recipeFor(recipeSlug);
  if(recipe){
    _tallyPath("recipe", recipeSlug);
    if(typeof theaterCensusRecord === "function") theaterCensusRecord("figure", "recipe", recipeSlug, _censusSceneKind);
    return buildFigureFromRecipe(recipe, tint, kind);
  }
  // the legacy archetype-builder path — a genuine cuboid (§U3: reached only when there is NO whole-
  // object key, NO recipe; instrumented so this stops being invisible). `wKey||("kind:"+kind)` names
  // the miss so the debug report says WHAT couldn't resolve (a foe recipeSlug, a keyless npc, etc.).
  const _cuboidMissKey = wholeObjectKeyFor(kind, className, recipeSlug) || ("kind:" + kind);
  _tallyPath("cuboid", _cuboidMissKey);
  // L2: name the creature itself (recipeSlug — the bestiary id/name a caller already passed) when
  // present, falling back to the miss key only for a name-less piece (a keyless npc/pc) — the census
  // entry should say WHO had no art, not just which internal key failed to resolve.
  if(typeof theaterCensusRecord === "function") theaterCensusRecord("figure", "cuboid", recipeSlug || _cuboidMissKey, _censusSceneKind);
  const build = ARCHETYPE_BUILDERS[archetype] || ARCHETYPE_BUILDERS.biped;
  const g = build(seed, tint, silhouette, weapon);
  // UNIT 0 (L16): the legacy archetype-builder fallback (no recipe) turns to the SAME convention as
  // the recipe path — a legacy quadruped/arachnid/serpent presents its broadside profile too, so a
  // bestiary creature with a recipe and one without face the same way (the recipe path sets this yaw
  // inside buildFigureFromRecipe; this is the matching set for the no-recipe path). orientYawForArchetype
  // resolves the archetype -> base -> yaw, so both paths read the identical BASE_ORIENT_YAW value.
  if(g) g.rotation.y = orientYawForArchetype(archetype);
  return g;
}

// ---- the surface the root consumes. MODEL_PATH_STATS is exported as the LIVE counter object so the
// root's window.Theater.stats.modelPaths keeps pointing at the very record _tallyPath increments —
// same object identity as before the split, not a copy. ----
export {
  figureFor,
  weaponMeshFor,
  MODEL_PATH_STATS
};
