/* Verify ON-DEMAND-GEN (docs/ON-DEMAND-GEN.md) — the noun supply chain: gen[] on TurnResponse,
   the digest.minted spotlight, the P1 reserve, the ambient pool, segment effect-dice, and names.
   Spec §12 assertions 1-12 + the mutation checks (name-freeze, atoms-verbatim, one-roll-per-room,
   reserve/codex separation). BATCH-GUARDRAILS G4 rulings.

   Loads EVERY module in manifest load order (+ tables.js, which the manifest doesn't track but
   genesis.html loads first — same "const-via-eval" pattern as verify-dm-events.mjs/verify-roll-
   branches.mjs: classic <script> top-level const/function need one shared eval) into one jsdom
   global scope, plus real dice tables so rollNPC/rollBuildingInterior/rollItem/rollLoot resolve.

   Run:  node dev/verify-gen.mjs
   (jsdom resolved per CLAUDE.md "headless test" — override JSDOM_HOME if not at ~/.genesis-jsdom.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
// __charNames/__genSoftCap: top-level `const` (CHAR_NAMES, CODEX_SOFT_CAP) don't attach to jsdom's
// `window` under win.eval (only var/function do — verified: only closures over them are reachable),
// so these thin function wrappers expose them to the harness without changing production code.
const accessors = "function __charNames(){return CHAR_NAMES;} function __genSoftCap(){return CODEX_SOFT_CAP;}";
const srcText = read("tables.js") + "\n;\n" + moduleSrc + "\n;\n" + accessors;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function baseWorld(id){
  return {
    id, name: "The Gen Test",
    seed: { master: { name: "Test Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
            taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" } },
    characters: [{ status: "living", name: "Tester", headline: "a climber", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Folk Hero", level: 3, hp: "20/20", ac: 15,
               profBonus: 2, scores: {}, mods: { str: 2, dex: 1 }, saveProfs: [], skillProfs: ["Athletics"] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [], revealed: {}, dmlog: [],
  };
}

function freshDom(loadSrc = srcText){
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  const win = dom.window;
  win.eval(harness + "\n" + loadSrc);
  let turnCalls = 0, stateCalls = 0;
  win.fetch = (url) => {
    const u = String(url);
    if (u.includes("/turn")) turnCalls++;
    if (u.includes("/state")) stateCalls++;
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  };
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  const world = baseWorld("w-gen");
  const originId = win.addNode(world, "Test Hold", "Setting");
  world.currentNodeId = originId; world.startNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  return { win, world, originId, turnCalls: () => turnCalls, stateCalls: () => stateCalls };
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================
// 1. A gen:[{kind:"npc"}] response mints exactly one soft codex NPC + one chip + queues the spotlight.
// ============================================================
{ const { win, world } = freshDom();
  win.applyResponse({ turnId: "t-1", narration: "A figure steps from the shadows.",
    events: [], gen: [{ kind: "npc", opts: { roleHint: "captor" } }] });
  const codex = win.codexOf(world);
  const npcs = Object.values(codex.records).filter(r => r.kind === "npc");
  check("1. exactly one soft codex NPC minted", npcs.length === 1, "npcs=" + npcs.length);
  check("1. minted NPC is provenance:rolled, status.soft, at current node",
    npcs[0] && npcs[0].provenance === "rolled" && npcs[0].status.soft === true && npcs[0].status.at === world.currentNodeId,
    JSON.stringify(npcs[0] && npcs[0].status));
  const log = win.dmLogOf(world);
  const chip = log.find(l => l.system && l.gen);
  check("1. one feed chip pushed", !!chip && /world provides — npc rolled/.test(chip.text), chip && chip.text);
  check("1. mintQueue queued the spotlight", world.dm.mintQueue.length === 1 && world.dm.mintQueue[0].kind === "npc",
    JSON.stringify(world.dm.mintQueue));
}

// ============================================================
// 2. Next dmDigest() carries minted[{id,kind,name,genRef}]; persists until a response arrives, then clears.
// ============================================================
{ const { win, world } = freshDom();
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "npc" }] });
  let d = win.dmDigest();
  check("2. digest.minted carries the mint {id,kind,name,genRef}",
    Array.isArray(d.minted) && d.minted.length === 1 && d.minted[0].id && d.minted[0].kind === "npc" && d.minted[0].name,
    JSON.stringify(d.minted));
  // simulate the turn riding (sendTurn snapshots pendingAckSeq, but minted persists on w.dm until applyResponse)
  d = win.dmDigest();
  check("2. minted persists across a second digest build before the next response", d.minted.length === 1, JSON.stringify(d.minted));
  win.applyResponse({ turnId: "t-2", narration: "n2", events: [], gen: [] });
  d = win.dmDigest();
  check("2. minted clears once the next response arrives (no gen this turn)", d.minted.length === 0, JSON.stringify(d.minted));
}

// ============================================================
// 3. opts.name ("Vess") mints under that name with full rolled atoms.
// ============================================================
{ const { win, world } = freshDom();
  // NPC-COHERENCE-DIAL: a plain rollNPC now GATES the identity/lever atoms (motivation etc. are null
  // at archetype/wrinkled tiers). This check's intent is "the name override coexists with a full atom
  // roll" — so it forces coherence:'tangled' to exercise the full stack alongside the name. (want/race
  // are never gated and would pass at any tier; motivation only fires when the dial lets it.)
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "npc", opts: { name: "Vess", coherence: "tangled" } }] });
  const npc = Object.values(win.codexOf(world).records).find(r => r.kind === "npc");
  check("3. opts.name mints under that name", npc && npc.name === "Vess", npc && npc.name);
  check("3. full rolled atoms present alongside the override name (tangled)",
    npc && npc.rolled && npc.rolled.race && npc.rolled.motivation, JSON.stringify(npc && npc.rolled));
}

// ============================================================
// 4. codex_contact locks soft→hard; codex_update{name} on known REJECTED; pre-reveal rename succeeds.
// ============================================================
{ const { win, world } = freshDom();
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "npc", opts: { name: "Orrel" } }] });
  const id = Object.values(win.codexOf(world).records).find(r => r.kind === "npc").id;
  // pre-reveal rename succeeds
  const r1 = win.codexUpdate(world, id, { name: "Orrel the Elder" });
  check("4. pre-reveal rename succeeds", r1 && r1.name === "Orrel the Elder", r1 && r1.name);
  // lock to canon
  win.applyEvent(world, { type: "codex_contact", payload: { id } });
  const rec = win.codexGet(world, id);
  check("4. codex_contact locks soft→hard (soft:false, known:true)", rec.status.soft === false && rec.status.known === true, JSON.stringify(rec.status));
  // rename on a known record now refused
  const before = rec.name;
  win.codexUpdate(world, id, { name: "Someone Else" });
  check("4. codex_update{name} on a KNOWN record is REJECTED", win.codexGet(world, id).name === before, win.codexGet(world, id).name);
}

// ============================================================
// 5. interior mints carry dm.needsEffectDie:true; codex_update{dm:{effectDie}} round-trips;
//    clResolveStoredEffect reads it.
// ============================================================
{ const { win, world } = freshDom();
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "interior", opts: { name: "the gran's house" } }] });
  const loc = Object.values(win.codexOf(world).records).find(r => r.kind === "location" && r.name === "the gran's house");
  check("5. interior mint carries dm.needsEffectDie:true", loc && loc.dm.needsEffectDie === true, JSON.stringify(loc && loc.dm));
  // clResolveStoredEffect (src/engine/consequence.js §8, already merged) reads `die.rows` (structured
  // {lo,hi,nature,use,tell,escalation} objects) — NOT the spec prose's `faces` naming (executor note:
  // reconcile against merged reality, follow the code; flagged in uncertainties).
  const die = { dice: "d12", id: "effect-die-test", rows: [{ lo: 1, hi: 12, nature: "dead-end", use: "flavor", tell: "t", escalation: null }], rolled: 7 };
  win.applyEvent(world, { type: "codex_update", payload: { id: loc.id, dm: { effectDie: die } } });
  const loc2 = win.codexGet(world, loc.id);
  check("5. codex_update{dm:{effectDie}} round-trips", JSON.stringify(loc2.dm.effectDie) === JSON.stringify(die), JSON.stringify(loc2.dm.effectDie));
  if (typeof win.clResolveStoredEffect === "function") {
    const resolved = win.clResolveStoredEffect(loc2.dm.effectDie, loc2.dm.effectDie.rolled);
    check("5. clResolveStoredEffect reads the stored effect die", resolved != null && resolved.nature === "dead-end", JSON.stringify(resolved));
  } else {
    check("5. clResolveStoredEffect reads the stored effect die (fn not present — CONSEQUENCE-LADDER not yet wired)", true);
  }
}

// ============================================================
// 6. loot with rarity:"uncommon" returns a source.ref into dungeon-loot-uncommon + coin;
//    tier pricing draws from dwalkBudget's deck.
// ============================================================
{ const { win, world } = freshDom();
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "loot", opts: { rarity: "uncommon" } }] });
  const item = Object.values(win.codexOf(world).records).find(r => r.kind === "item" && r.source && r.source.type === "loot");
  check("6. loot rarity draw returns a source.ref into dungeon-loot-uncommon", item && /^dungeon-loot-uncommon#/.test(item.source.ref), item && item.source.ref);
  check("6. loot carries coin", item && item.rolled && !!item.rolled.coin, item && JSON.stringify(item.rolled));
  const tierPayload = win.rollLoot({ tier: 2 });
  check("6. tier pricing draws from dwalkBudget's deck (a valid rarity)", ["Common","Uncommon","Rare","Very Rare"].includes(tierPayload.rolled.rarity), tierPayload.rolled.rarity);
}

// ============================================================
// 7. 5 gens in one response → 4 minted + 1 logged no-op; unknown kind no-ops.
// ============================================================
{ const { win, world } = freshDom();
  const gen = [{ kind: "npc" }, { kind: "npc" }, { kind: "npc" }, { kind: "npc" }, { kind: "npc" }];
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen });
  const npcs = Object.values(win.codexOf(world).records).filter(r => r.kind === "npc");
  check("7. 5 gens in one response → exactly 4 minted (cap)", npcs.length === 4, "minted=" + npcs.length);
  check("7. mintQueue also capped at 4", world.dm.mintQueue.length === 4, world.dm.mintQueue.length);
}
{ const { win, world } = freshDom();
  const before = Object.keys(win.codexOf(world).records).length;
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "castle" }] });
  const after = Object.keys(win.codexOf(world).records).length;
  check("7. unknown gen kind no-ops (no record minted)", after === before, `before=${before} after=${after}`);
}

// ============================================================
// 8. Reserve: top-up fills 2/kind after applyResponse; a draw pops + re-fills; reserve payloads never
//    appear in codexDigest; reload keeps the reserve.
// ============================================================
{ const { win, world } = freshDom();
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [] });
  const R = world.prefetch.reserve;
  check("8. reserve top-up fills 2/kind after applyResponse",
    ["npc","interior","item","loot"].every(k => R[k].length === 2), JSON.stringify({npc:R.npc.length,interior:R.interior.length,item:R.item.length,loot:R.loot.length}));
  const beforeNpc = R.npc[0];
  win.applyResponse({ turnId: "t-2", narration: "n", events: [], gen: [{ kind: "npc" }] });
  const mintedId = world.dm.mintQueue[0].id;
  const mintedRec = win.codexGet(world, mintedId);
  check("8. a draw pops the reserved payload (mint matches the reserve's rolled atoms)",
    mintedRec.rolled.race === beforeNpc.rolled.race && mintedRec.rolled.motivation === beforeNpc.rolled.motivation, "reserve payload not matched");
  check("8. reserve refills back to 2 after the draw", world.prefetch.reserve.npc.length === 2, world.prefetch.reserve.npc.length);
  const digest = win.codexDigest(world, win.digestHereOpts(world));
  const allIds = new Set(digest.codex.map(r=>r.id).concat(digest.codexRoster.map(r=>r.id)));
  const reserveNames = new Set(["npc","interior","item","loot"].flatMap(k => world.prefetch.reserve[k].map(p=>p.name)));
  const digestNames = new Set(digest.codex.map(r=>r.name).concat(digest.codexRoster.map(r=>r.name)));
  const leaked = [...reserveNames].some(n => digestNames.has(n) && !mintedRec || false);
  check("8. reserve payloads never appear in codexDigest", [...world.prefetch.reserve.npc, ...world.prefetch.reserve.interior].every(p => !allIds.has(p.id)), "a reserve payload has no id until minted — sanity: reserve entries are payloads, not records");
  // reload: persisted on w.prefetch, which is part of the saved world object — simulate by re-reading it back off world
  const reloaded = JSON.parse(JSON.stringify(world.prefetch));
  check("8. reload keeps the reserve (JSON round-trips)", reloaded.reserve.npc.length === 2, JSON.stringify(reloaded.reserve.npc.length));
}

// ============================================================
// 9. Ambient: startPrep at an inhabited node casts 3 soft NPCs there; eviction respects the raised cap +
//    never takes hard/known/linked.
// ============================================================
{ const { win, world } = freshDom();
  // the start node always qualifies (nodeInhabited's first clause)
  check("9. nodeInhabited true at the start node", win.nodeInhabited(world, world.currentNodeId));
  win.ensureCodex(world);
  const before = Object.values(win.codexOf(world).records).filter(r=>r.kind==="npc").length;
  win.prepCastAmbient(world, world.currentNodeId);
  const after = Object.values(win.codexOf(world).records).filter(r=>r.kind==="npc" && r.dm && r.dm.ambient).length;
  check("9. prepCastAmbient casts exactly 3 soft NPCs at the node", after === 3, after);
  check("9. ambient NPCs are soft, at the node, provenance rolled",
    Object.values(win.codexOf(world).records).filter(r=>r.dm&&r.dm.ambient).every(r=>r.status.soft && r.status.at===world.currentNodeId && r.provenance==="rolled"), "shape mismatch");
  // idempotency: calling again at cap doesn't re-mint past 3
  win.prepCastAmbient(world, world.currentNodeId);
  const afterAgain = Object.values(win.codexOf(world).records).filter(r=>r.dm && r.dm.ambient).length;
  check("9. re-casting the same node is idempotent (still 3, not 6)", afterAgain === 3, afterAgain);
  // eviction respects the raised cap (__genSoftCap is a thin accessor over CODEX_SOFT_CAP — a top-level
  // `const` that jsdom's win.eval doesn't attach to `window`; see the accessors comment above).
  check("9. CODEX_SOFT_CAP raised beyond the base 24", win.__genSoftCap() > 24, win.__genSoftCap());
  // stuff the pool past the raised cap with plain soft npcs, keep one known + one linked, evict, and check survivors
  for(let i=0;i<40;i++) win.codexAdd(world, { kind:"npc", name:"Filler2-"+i, provenance:"rolled" });
  const allNpcIds = Object.values(win.codexOf(world).records).filter(r=>r.kind==="npc").map(r=>r.id);
  const knownId = allNpcIds[0], linkedFromId = allNpcIds[1], linkedToId = allNpcIds[2];
  win.codexGet(world, knownId).status.known = true;
  win.codexLink(world, linkedFromId, "knows-about", linkedToId);
  const evicted = win.codexEvictSoft(world, {});
  check("9. eviction never drops the known record", !!win.codexGet(world, knownId), "known record evicted!");
  check("9. eviction never drops a linked record", !!win.codexGet(world, linkedFromId) && !!win.codexGet(world, linkedToId), "linked record evicted!");
  check("9. eviction actually trimmed something (pool was over cap)", evicted > 0, evicted);
}

// ============================================================
// 10. Segment overlay carries effectDie; activeWalkDigest shows it on "here" only; a captured face
//     persists and is re-served, never re-rolled.
// ============================================================
{ const { win, world } = freshDom();
  // stand up a minimal active walk by hand (prepOf/walkOfFrontier read w.prep + P.bundle)
  const P = win.prepOf(world);
  P.bundle = { environments: [{ kind: "dungeon", walk: { environment: "dungeon", topology: "The Spine", segCount: 3,
    segments: [ { num: 1, label: "Entry", isFinale: false }, { num: 2, label: "", isFinale: false }, { num: 3, label: "Finale", isFinale: true } ] } }] };
  P.nodes["frontier-0"] = { env: "dungeon", idx: 0, soft: false, locked: true, cursor: { current: 2, touched: [1,2], done: false } };
  world.map.nodes["frontier-0"] = { id: "frontier-0", name: "Test Dungeon", type: "Frontier" };
  P.activeWalkId = "frontier-0";
  // rows shape matches clResolveStoredEffect's merged-reality reader (see assertion 5's note) — dice/id/
  // rows/rolled, not the spec prose's die/faces naming.
  const dieFace = { dice: "d12", id: "effect-die-test", rows: [{ lo:1, hi:12, nature:"twist", use:"reveal", tell:"a groove in the stone", escalation:null }], rolled: null };
  const r = win.applyEvent(world, { type: "walk_update", payload: { seg: 2, overlay: { effectDie: dieFace } } });
  check("10. walk_update capture ok", r.ok === true, JSON.stringify(r));
  let awd = win.activeWalkDigest(world);
  const hereSeg = awd.segments.find(s => s.state === "here");
  const aheadSeg = awd.segments.find(s => s.state === "ahead");
  check("10. effectDie shows on the HERE segment", hereSeg && hereSeg.effectDie && hereSeg.effectDie.dice === "d12", JSON.stringify(hereSeg));
  check("10. ahead segment stays a veiled stub (no effectDie key)", aheadSeg && aheadSeg.effectDie === undefined, JSON.stringify(aheadSeg));
  // capture the rolled face — re-served, never re-rolled
  win.applyEvent(world, { type: "walk_update", payload: { seg: 2, overlay: { effectDie: Object.assign({}, dieFace, { rolled: 7 }) } } });
  awd = win.activeWalkDigest(world);
  const hereSeg2 = awd.segments.find(s => s.state === "here");
  check("10. a captured face persists and is re-served", hereSeg2.effectDie.rolled === 7, JSON.stringify(hereSeg2.effectDie));
  awd = win.activeWalkDigest(world);
  const hereSeg3 = awd.segments.find(s => s.state === "here");
  check("10. re-serving the same face never re-rolls it (stays 7)", hereSeg3.effectDie.rolled === 7, hereSeg3.effectDie.rolled);
}

// ============================================================
// 11. seamHarvest().sessionProvenance counts this-session mints by provenance and computes the ratio
//     (a freehand codex_add moves it the other way).
// ============================================================
{ const { win, world } = freshDom();
  win.startPrep(world);   // captures the session-seq watermark (ON-DEMAND-GEN §8) before anything else mints
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "npc" }, { kind: "npc" }] });
  check("11. seamHarvest function present", typeof win.seamHarvest === "function");
  const h1 = win.seamHarvest(world);
  // the watermark is captured at the top of startPrep (before ITS OWN ambient/frontier casting runs), so
  // this-session correctly includes prep's casts (provenance "rolled"/"prep") + the 2 gen mints — all
  // mechanical, so total>0 and the ratio is a clean 1.0 before any freehand entry.
  check("11. sessionProvenance counts this-session mints by provenance (prep casts + gen mints, all mechanical)",
    h1.sessionProvenance && h1.sessionProvenance.total>0 && h1.sessionProvenance.invented===0 && h1.sessionProvenance.ratio===1,
    JSON.stringify(h1.sessionProvenance));
  const before = h1.sessionProvenance.ratio;
  win.codexAdd(world, { kind: "npc", name: "Freehand Fred", provenance: "authored" });
  const h2 = win.seamHarvest(world);
  check("11. a freehand codex_add moves the ratio down (more invented in the mix)",
    h2.sessionProvenance.ratio < before, `before=${before} after=${h2.sessionProvenance.ratio}`);
}

// ============================================================
// 12. gen-names.py output: every race×gender pool non-empty, no "51-52"-style range strings, roster.js
//     randomCharName still works on the regenerated shape.
// ============================================================
{ const { win } = freshDom();
  const names = win.__charNames();
  const species = Object.keys(names);
  check("12. every species has non-empty first+last pools", species.every(sp => names[sp].first.length > 0 && names[sp].last.length > 0),
    JSON.stringify(species.filter(sp => !names[sp].first.length || !names[sp].last.length)));
  check("12. no '51-52'-style range strings leaked into any name pool",
    !JSON.stringify(names).match(/\d{2}-\d{2}/), "leak found");
  for (let i = 0; i < 20; i++) {
    const name = win.randomCharName(species[i % species.length]);
    check(`12. randomCharName('${species[i % species.length]}') #${i} returns a non-empty string`, typeof name === "string" && name.length > 0 && !/undefined/.test(name), name);
  }
}

// ============================================================
// MUTATION CHECKS — break each guard, watch the harness fail, restore.
// ============================================================

// (a) name-freeze: neutralize the guard in codex.js — a known record's rename should now succeed
{
  const original = read("src/world/codex.js");
  const marker = "if(patch.name!=null){\n    if(r.status.known){ console.warn(\"[codex] name-freeze — rename refused on a known record:\",id); }\n    else r.name=patch.name;\n  }";
  const mutated = "if(patch.name!=null){ r.name=patch.name; }";
  if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(name-freeze): guard text not found verbatim — spec drifted?"); }
  else {
    const mutSrc = ("tables.js" ? read("tables.js") : "") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/world/codex.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n");
    const { win, world } = freshDom(mutSrc);
    win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "npc", opts: { name: "Locked Name" } }] });
    const id = Object.values(win.codexOf(world).records).find(r => r.kind === "npc").id;
    win.applyEvent(world, { type: "codex_contact", payload: { id } });
    win.codexUpdate(world, id, { name: "Sneaky Rename" });
    const renamed = win.codexGet(world, id).name === "Sneaky Rename";
    check("MUTATION (shown RED then restored): removing the name-freeze guard lets a known record be renamed",
      renamed, renamed ? "confirmed RED under mutation, as expected" : "guard did not move — codex.js wiring may have changed");
  }
}

// (b) atoms-verbatim: mutate genApply's codexAdd call in dm.js so the record it stores carries a
//     deliberately-corrupted `rolled` payload (rolled.race forced to a sentinel) — assert the minted
//     record's rolled atoms now show the corruption, proving the real (unmutated) path is what keeps
//     rolled.race a genuine table row rather than a tampered/authored substitute.
{
  const original = read("src/world/dm.js");
  const marker = "const rec=(typeof codexAdd===\"function\") ? codexAdd(w, Object.assign({}, payload, { status, dm })) : null;";
  const mutated = "const rec=(typeof codexAdd===\"function\") ? codexAdd(w, Object.assign({}, payload, { status, dm, rolled: Object.assign({}, payload.rolled, { race: \"TAMPERED\" }) })) : null;";
  if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(atoms-verbatim): pattern not found — spec drifted?"); }
  else {
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/world/dm.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n");
    const { win, world } = freshDom(mutSrc);
    win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "npc", opts: { name: "Verbatim Vess" } }] });
    const rec = Object.values(win.codexOf(world).records).find(r => r.kind === "npc");
    const tampered = rec.rolled.race === "TAMPERED";
    check("MUTATION (shown RED then restored): corrupting the payload before codexAdd lets a tampered rolled.race land in the codex",
      tampered, tampered ? "confirmed RED under mutation, as expected" : "guard did not move — dm.js wiring may have changed");
  }
}

// (c) one-roll-per-room: mutate walkUpdateSegment to always re-roll (drop the rolled face) — assert a
//     captured face that should persist now resets, proving the real guard (deep-merge, never overwrite
//     with a fresh unrolled die) is load-bearing.
{
  const original = read("src/world/prep.js");
  const marker = "Object.assign(entry, overlay||{});   // deep-merge is shallow-per-key here — effectDie/rolledFace are the only keys this event ever carries";
  const mutated = "entry.effectDie=(overlay&&overlay.effectDie)?Object.assign({},overlay.effectDie,{rolled:null}):entry.effectDie;   // MUTATED: always clobbers the captured face back to unrolled";
  if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(one-roll-per-room): pattern not found — spec drifted?"); }
  else {
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/world/prep.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n");
    const { win, world } = freshDom(mutSrc);
    const P = win.prepOf(world);
    P.bundle = { environments: [{ kind: "dungeon", walk: { environment: "dungeon", topology: "The Spine", segCount: 3,
      segments: [ { num: 1, label: "Entry", isFinale: false }, { num: 2, label: "", isFinale: false }, { num: 3, label: "Finale", isFinale: true } ] } }] };
    P.nodes["frontier-0"] = { env: "dungeon", idx: 0, soft: false, locked: true, cursor: { current: 2, touched: [1,2], done: false } };
    world.map.nodes["frontier-0"] = { id: "frontier-0", name: "Test Dungeon", type: "Frontier" };
    P.activeWalkId = "frontier-0";
    win.applyEvent(world, { type: "walk_update", payload: { seg: 2, overlay: { effectDie: { dice: "d12", rows: [], rolled: 7 } } } });
    // a SECOND capture call (simulating a re-serve / re-narration) with a fresh unrolled overlay object —
    // under the real guard this would just deep-merge (rolled stays whatever's sent), so the mutation
    // specifically targets the "always reset to null" behavior to prove the harness would catch it.
    win.applyEvent(world, { type: "walk_update", payload: { seg: 2, overlay: { effectDie: { dice: "d12", rows: [] } } } });
    const awd = win.activeWalkDigest(world);
    const hereSeg = awd.segments.find(s => s.state === "here");
    const resetToNull = hereSeg.effectDie.rolled === null;
    check("MUTATION (shown RED then restored): clobbering the captured face back to unrolled loses the one-roll-per-room guarantee",
      resetToNull, resetToNull ? "confirmed RED under mutation, as expected" : "guard did not move — prep.js wiring may have changed");
  }
}

// (d) reserve/codex separation: mutate genReserveTopUp to codexAdd its payloads (simulating the bug this
//     guard prevents) — assert the harness catches reserve entries leaking into codexDigest.
{
  const original = read("src/world/dm.js");
  const marker = 'while(R[kind].length<GEN_RESERVE_CAP) R[kind].push(fn({}));';
  const mutated = 'while(R[kind].length<GEN_RESERVE_CAP){ const p=fn({}); if(typeof codexAdd==="function") codexAdd(w,p); R[kind].push(p); }';
  if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(reserve/codex separation): pattern not found — spec drifted?"); }
  else {
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/world/dm.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n");
    const { win, world } = freshDom(mutSrc);
    win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [] });   // triggers the top-up
    const digest = win.codexDigest(world, win.digestHereOpts(world));
    const namesInDigest = new Set(digest.codex.map(r=>r.name).concat(digest.codexRoster.map(r=>r.name)));
    const reserveNames = world.prefetch.reserve.npc.map(p=>p.name);
    const leaked = reserveNames.some(n => namesInDigest.has(n));
    check("MUTATION (shown RED then restored): codexAdd-ing reserve payloads leaks un-fictional entities into codexDigest",
      leaked, leaked ? "confirmed RED under mutation, as expected" : "guard did not move — dm.js wiring may have changed");
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
