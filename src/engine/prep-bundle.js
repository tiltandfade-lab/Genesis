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
function pbundlePlan(opts){
  if(opts.environments && opts.environments.length) return opts.environments;
  const t = Math.min(TIER_CAP, opts.tier||1);
  return [
    { kind:"urban",      segCount:5, tier:t },
    { kind:"dungeon",    segCount:4, tier:t },
    { kind:"wilderness", legCount:4, tier:t },
  ];
}

function pbundleRollEnv(env){
  if(env.kind==="dungeon")    return rollDungeonWalk({ segCount:env.segCount, tier:env.tier, topology:env.topology });
  if(env.kind==="wilderness") return rollWildernessWalk({ legCount:env.legCount, biome:env.biome, tier:env.tier });
  return rollUrbanWalk({ segCount:env.segCount, tier:env.tier, topology:env.topology }); // default urban
}

// ─── casting (CODEX Phase 3, docs/CODEX.md §4): the engine rolls a soft cast ──
// Per frontier: 1 named location (rollPlace) + 1–2 motivated NPCs (rollNPC), one biased to the hook's
// questgiver, + the SPECIFIC plot-object the hook turns on (rollItem, sometimes sealed behind a lock).
// These are codexAdd-ready payloads — atoms only; the synthesis pass CONNECTS them (assigns
// kin/holders/links) over the dice-dealt cast instead of inventing nouns. No-op (cast:null) if the
// codex rollers / compiled tables aren't loaded, so the bundle stays valid in lean headless contexts.
function pbundleCast(env){
  if(typeof rollPlace!=="function" || typeof rollNPC!=="function") return null;
  if(typeof CT!=="function" || !Object.keys(CT()).length) return null;
  const location = rollPlace({ art:true });                // notable frontier → 0–2 art pieces (Consequence Ladder §11)
  const npcs = [ rollNPC({ roleHint:"questgiver" }) ];     // the questgiver the hook points at
  if(rollExpr("d2")===2) npcs.push(rollNPC());             // 1–2 NPCs/frontier (lean; §8 open Q)
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
  const environments = plan.map(env => {
    const walk = pbundleRollEnv(env);
    const hook = (typeof rollQuestHook==="function") ? rollQuestHook({ environment:env.kind }) : null;
    const cast = pbundleCast(env);
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
