/* GENESIS MODULE — src/engine/prep-bundle.js — the prep-bundle assembler (docs/SYNTHESIS-CONTRACT.md)
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Reuses the walk/dungeon/wild/quest rollers — MUST load after those modules.

   The deterministic pre-step of the Session-Prep synthesis pass: fires the multi-environment walk
   rollers, binds a quest hook to each environment, and gathers ledger context from the live world —
   producing the INPUT bundle the staged synthesis prompts consume (Engine/00. _System/AI Prompts/).
   No LLM here: this is pure dice + state-read. `prepBundleSummary` produces the cheap Stage-1 view.
   All internals `pbundle`-prefixed. */

// ─── tier ceiling (docs/TIER-SCOPE.md): this version caps at Tier 2 (levels 1–10). T3/T4 are a future
// expansion — their tables exist authored-but-inert, and the generators must never reach for them. ──
const TIER_CAP = 2;            // ← single un-cap point: bump to 4 when the expansion ships
const CR_CEILING = 10;         // the stat-block CR ceiling the DM honors at T2 (matches the CR4-10 roster)
function pbundleTierForLevel(lvl){ return Math.min(TIER_CAP, (lvl && lvl>=5) ? 2 : 1); }
// the level a PC plateaus at — owned by engine.advancement (Phase C); 10 until that loads
function pbundleLevelCeiling(){ return (typeof LEVEL_CEILING!=="undefined") ? LEVEL_CEILING : 10; }

// ─── ledger context (compact) from a live world `w`, or {} headless ──────────
function pbundleLedger(w, optTier){
  if(!w) return { pcLocation:null, tier:Math.min(TIER_CAP, optTier||1), factions:[], pressures:[], dripTargets:[], canon:[], frontier:null };
  const loc = (w.map && w.map.nodes && w.currentNodeId && w.map.nodes[w.currentNodeId]) ? w.map.nodes[w.currentNodeId].name : null;
  // tier from the living PC's level if present, else opt/default — always clamped to the tier cap
  let tier = optTier ? Math.min(TIER_CAP, optTier) : null;
  if(!tier){ const pc=(w.characters||[]).filter(c=>c.status==="living").slice(-1)[0];
    const lvl = pc && pc.sheet && pc.sheet.level; tier = pbundleTierForLevel(lvl); }
  const factions = (w.factions||[]).map(f=>({ name:f.name, dominant:!!f.dominant, rel:f.rel||null,
    agenda:f.agenda, method:f.method, tags:f.tags||[], clock:f.clock?`${f.clock.filled}/${f.clock.size}`:null }));
  const pressures = (w.pressures||[]).map(p=>({ kind:p.kind, danger:p.danger, impersonal:p.impersonal||null,
    clock:p.clock?`${p.clock.filled}/${p.clock.size}`:null, truth:p.real?p.real.text:null, doom:p.doom||null }));
  // drip targets = the hidden truths the world is foreshadowing (Charter §8.4)
  const dripTargets = pressures.filter(p=>p.truth).map(p=>({ from:p.kind, truth:p.truth, doom:p.doom }));
  const canon = (w.ledger||[]).filter(e=>e.type==="canon").slice(-8).map(e=>e.text).filter(Boolean);
  return { pcLocation:loc, tier, factions, pressures, dripTargets, canon, frontier:loc };
}

// ─── default environment plan (override via opts.environments) ────────────────
// Each environment is plausible-from-the-frontier in the full design; v1 fires a sensible default
// set and lets the caller override. (Plausibility-from-frontier is a tune item — see the spec.)
// WALK-CONSUMPTION (docs/WALK-CONSUMPTION.md, Step D): walk LENGTH scales with the living PC's level —
// shorter walks early game, longer late game. Content/threat band stays TIER-driven (above); this is
// length only. walk.js clamps segCount to 2–30, so every value below is valid; a too-short walk just
// can't roll a topology whose minimum exceeds it (walkResolveTopology falls back).
function pbundleSegCount(level){
  const L = Math.max(1, Math.min(pbundleLevelCeiling(), level||1));
  return Math.max(3, Math.min(7, 2 + Math.ceil(L/2)));   // L1–2:3  L3–4:4  L5–6:5  L7–8:6  L9–10:7
}
function pbundleLegCount(level){
  const L = Math.max(1, Math.min(pbundleLevelCeiling(), level||1));
  return Math.max(3, Math.min(5, 2 + Math.ceil(L/3)));   // L1–3:3  L4–6:4  L7–10:5
}
function pbundlePlanLevel(opts){
  if(opts.level) return opts.level;
  const pc = opts.world && (opts.world.characters||[]).filter(c=>c.status==="living").slice(-1)[0];
  return (pc && pc.sheet && pc.sheet.level) || 1;
}
function pbundlePlan(opts){
  if(opts.environments && opts.environments.length) return opts.environments;
  const t = Math.min(TIER_CAP, opts.tier||1);
  const lvl = pbundlePlanLevel(opts);
  return [
    { kind:"urban",      segCount:pbundleSegCount(lvl), tier:t },
    { kind:"dungeon",    segCount:pbundleSegCount(lvl), tier:t },
    { kind:"wilderness", legCount:pbundleLegCount(lvl), tier:t },
  ];
}

// REGIONS-NAMES.md §1: `region` (a w.regions[] record, or null) rides through to the walk rollers'
// skin/archetype bias. Optional final param — every existing caller (verify harnesses included)
// that omits it gets region:null, i.e. today's exact unbiased behavior.
function pbundleRollEnv(env, region){
  if(env.kind==="dungeon")    return rollDungeonWalk({ segCount:env.segCount, tier:env.tier, topology:env.topology, region });
  if(env.kind==="wilderness") return rollWildernessWalk({ legCount:env.legCount, biome:env.biome, tier:env.tier, region });
  return rollUrbanWalk({ segCount:env.segCount, tier:env.tier, topology:env.topology, region }); // default urban
}

// ─── casting (CODEX Phase 3, docs/CODEX.md §4): the engine rolls a soft cast ──
// Per frontier: 1 named location (rollPlace) + 1–2 motivated NPCs (rollNPC), one biased to the hook's
// questgiver, + the SPECIFIC plot-object the hook turns on (rollItem, sometimes sealed behind a lock).
// These are codexAdd-ready payloads — atoms only; the synthesis pass CONNECTS them (assigns
// kin/holders/links) over the dice-dealt cast instead of inventing nouns. No-op (cast:null) if the
// codex rollers / compiled tables aren't loaded, so the bundle stays valid in lean headless contexts.
// REGIONS-NAMES.md §3: `region` is a best-effort soft prior (the PC's DEPARTURE region — the
// frontier's own node isn't placed on the map yet at bundle-assembly time, so there's no exact
// coordinate to resolve a region from). Omit it and this is identical to before.
function pbundleCast(env, region){
  if(typeof rollPlace!=="function" || typeof rollNPC!=="function") return null;
  if(typeof CT!=="function" || !Object.keys(CT()).length) return null;
  const location = rollPlace({ art:true });                // notable frontier → 0–2 art pieces (Consequence Ladder §11)
  const npcs = [ rollNPC({ roleHint:"questgiver", region }) ];     // the questgiver the hook points at
  if(rollExpr("d2")===2) npcs.push(rollNPC({ region }));             // 1–2 NPCs/frontier (lean; §8 open Q)
  // the concrete macguffin (the abstract hook.macguffin is the throughline; this is the actual object).
  // The DM wires "questgiver holds it / it rests in the location" over the cast; prep only places it.
  const item = (typeof rollItem==="function") ? rollItem({ lock: rollExpr("d2")===2 }) : null;
  return { location, npcs, item };
}

/* assemble the input bundle the synthesis pass consumes.
   opts: { world?, tier?, environments?:[{kind,segCount|legCount,topology?}] } */
function assemblePrepBundle(opts){
  opts = opts || {};
  const ledger = pbundleLedger(opts.world, opts.tier);
  const plan = pbundlePlan(opts);
  // REGIONS-NAMES.md §1: the frontier's region (from the PC's current node) flavors every environment
  // rolled into this bundle. null-safe at every layer (no world / no coords yet / module absent).
  const region = (opts.world && typeof regionForNode==="function")
    ? regionForNode(opts.world, opts.world.currentNodeId) : null;
  const environments = plan.map(env => {
    const walk = pbundleRollEnv(env, region);
    const hook = (typeof rollQuestHook==="function") ? rollQuestHook({ environment:env.kind }) : null;
    const cast = pbundleCast(env, region);
    return { kind:env.kind, walk, hook, cast };
  });
  return {
    schema:"prep-bundle/v1",
    ledger,
    environments,
    // the DM reads these ceilings and honors them (e.g. never pulls a CR>crCeiling boss into a T2 scene)
    meta:{ tier:ledger.tier, tierCap:TIER_CAP, levelCeiling:pbundleLevelCeiling(), crCeiling:CR_CEILING, environmentCount:environments.length },
  };
}

// ─── Stage-1 summary view (cheap: labels/types only, no full prose) ──────────
function pbundleSummWalk(walk){
  const segs = walk.segments.map(s => s.isFinale
    ? { ref:`S${s.num}`, label:s.label, finale:true,
        gist: s.finale ? (s.finale.track || s.finale.revelation || s.areaType || "arrival") : (s.areaType || "arrival") }
    : { ref:`S${s.num}`, label:s.label,
        gist: [s.segType||s.areaType||s.biome, s.encounter && s.encounter.type].filter(Boolean).join(" / ") });
  return { environment:walk.environment, topology:walk.topology||null,
           posture:walk.posture||null, biome:walk.startBiome||null,
           // WALK-REFRESH §3: the rolled skin (null until tables-wave1 lands) rides the Stage-1 view too
           // — the synthesis pass sees it before the walk is ever "active".
           skin: walk.skin ? { text:walk.skin.text, band:walk.skin.band } : null,
           setup:walk.setup||null, threat:walk.threat||null, segCount:walk.segCount, segments:segs };
}
function prepBundleSummary(bundle){
  return {
    schema:"prep-bundle-summary/v1",
    ledger:bundle.ledger,
    environments: bundle.environments.map(e => ({
      kind:e.kind, walk:pbundleSummWalk(e.walk),
      hook: e.hook ? { leadsTo:e.hook.leadsTo, macguffin:e.hook.macguffin.name,
        complication:e.hook.complication.name, urgency:e.hook.urgency.name } : null,
      cast: e.cast ? {
        location: e.cast.location ? e.cast.location.name : null,
        npcs: (e.cast.npcs||[]).map(n => ({ name:n.name, role:n.fields.role||null, species:n.fields.species })),
        item: e.cast.item ? e.cast.item.name : null,
      } : null,
    })),
  };
}
