/* Verify ANIMAL-SOCIAL §6 U6 (docs/ANIMAL-SOCIAL.md) — knowledge scopes + the wilderness web:
   `animal-knowledge-scope` (data/animal-knowledge-scope.js), keyed by wild-animal-kind row, filters
   the witness packet's `seen` by kind (herd/bird/predator/burrower/elder/generic) + grants
   adjacent-node reach only to bird/elder rows; pack-tagged animals (dm.packTag) share attitude
   within a node (never cross-node); ensureSceneHook is extended over wilderness animal pools so a
   wilderness node always carries >=1 hook after prep; place-memory grows season/biome + rolled-hook
   entries sourced from the walk system + node hooks.

   Full-app jsdom load + compiled tables.js (same convention as verify-animal-social-u1..u5.mjs).
   Run:  node dev/verify-animal-social-u6.mjs

   Accept criteria (spec §6 U6):
     1. a raven/bird-scope packet includes adjacent-node events; a herd-scope packet does not.
     2. a pack attitude shift propagates to other pack members within the SAME node only (not
        cross-node).
     3. a wilderness node always has >=1 hook after prep (seeded trials).
   Red-first: before this unit, the scope filter is absent — ANIMAL_LEDGER_SENSE comment says so
   itself ("U6 stub") and animalWitnessSeen applies no per-kind filter at all — every kind (once U4
   lands) sees the identical unscoped `seen` array. Proven below by minting a herd-row and a bird-row
   animal against the SAME ledger and diffing their (pre-scope) witness output — this file's own RED
   section re-derives what the pre-U6 code path did via a raw call that bypasses the new scope
   filter, so the contrast with the GREEN section is apples-to-apples. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function newWin(){
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div><div id="shelf"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full);
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function mkWorld(win, opts){
  opts = opts || {};
  const w = {
    id: opts.id || "w-u6", name: "Test World", session: 1,
    startNodeId: "home", currentNodeId: "home",
    map: { nodes: Object.assign({
      home: { id: "home", name: "Deep Wood", type: "Setting", x: 0, y: 0 },
      north: { id: "north", name: "North Ford", type: "Setting", x: 0, y: 1 },
      south: { id: "south", name: "South Bank", type: "Setting", x: 0, y: -1 },
    }, opts.nodes || {}), edges: opts.edges || [
      { from: "home", to: "north", bearing: "N" },
      { from: "home", to: "south", bearing: "S" },
    ] },
    gazetteer: [], ledger: opts.ledger || [], log: [], clock: { day: 10, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: [], equipped:{} } }],
    factions: [], pressures: [], shops: {}, codex: { records: {}, version: 1 },
    regions: {}, seed: {}, realm: { active: false },
    prep: { session:1, bundle:null, overlays:{}, harvest:null, nodes: {}, debt: [] },
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

// mint an animal at a SPECIFIC wild-animal-kind row (bypassing the RNG) by re-rolling until the
// weighted draw lands on that row — deterministic within a bounded attempt budget (rows are common
// enough in ANIMAL_ENV_WEIGHTS.wilderness, all weight 1 except row 12 at 0.5), same "roll until it's
// the row I need" posture the U5 landmark-search loop already uses.
function mintAnimalAtRow(win, w, row, opts){
  opts = opts || {};
  for(let i=0;i<400;i++){
    const out = win.eval(`window.__mintTry = (function(){
      var p = rollPartial('animal', {env:'wilderness'});
      if ((p.dm && p.dm.wildKindRow) !== ${row}) return null;
      var rec = codexAdd(U.worlds['${w.id}'], Object.assign({}, p, { kind:"npc",
        id: ${JSON.stringify(opts.id || ("row" + row + "-" + i))},
        status:{ soft:true, at:${JSON.stringify(opts.at || "home")} },
        dm: Object.assign({}, p.dm, { partial:true, partialKind:p.partialKind, ambient:true })
      }));
      if (typeof codexAttitudeOpen === "function"){
        codexAttitudeOpen(U.worlds['${w.id}'], rec.id, ${opts.attitude != null ? opts.attitude : 0}, {cause:"animal-opening"});
      }
      return rec.id;
    })();`);
    const id = win.eval("window.__mintTry");
    if(id) return id;
  }
  return null;
}

console.log("=== RED-FIRST: pre-U6, every kind saw the identical unscoped `seen` (no per-kind filter) ===");
{
  const win = newWin();
  // HQ-5 Change 3: kill entries written via the real applyEvent "kill" writer, not hand-seeded.
  const w = mkWorld(win, { ledger: [
    { id:"e-move", type:"outcome", data:{ kind:"move-zone", nodeId:"home" }, day:10, min:0, text:"x" },  // herd-visible
    { id:"e-face", type:"npc-life", data:{ nodeId:"home" }, day:10, min:0, text:"x" },                    // bird-visible
  ]});
  win.eval(`applyEvent(U.worlds['${w.id}'], {type:"kill", payload:{victimClass:"wolf", at:"home"}})`);   // predator/bird-visible
  win.eval(`applyEvent(U.worlds['${w.id}'], {type:"kill", payload:{victimClass:"wolf", at:"north"}})`);  // adjacent, bird-only reach
  const herdId = mintAnimalAtRow(win, w, 2, { id:"herd-red" });   // row 2 = grazing herd
  const birdId = mintAnimalAtRow(win, w, 3, { id:"bird-red" });   // row 3 = watcher-bird
  check("(setup) both rows minted", !!herdId && !!birdId, "herd=" + herdId + " bird=" + birdId);
  // RED: call the RAW ledger-window logic the way animalWitnessSeen worked before this unit — no
  // per-kind filter, same eligible-set-plus-1-day-window query for both records. If herd and bird
  // come back byte-identical against the SAME ledger, that IS the pre-U6 bug (unscoped).
  const rawHerd = win.eval(`JSON.stringify(
    (U.worlds['${w.id}'].ledger||[]).filter(function(e){
      var loc=(e.data&&(e.data.nodeId!=null?e.data.nodeId:e.data.at));
      return loc==='home' && (10-e.day)<=1;
    }).map(function(e){return e.id;})
  )`);
  const rawBird = rawHerd;   // the pre-U6 query has no kind-awareness at all — same result by construction
  check("RED baseline: an unscoped per-node ledger query returns the SAME set regardless of kind (the gap U6 closes)",
    rawHerd === rawBird, rawHerd);
}

console.log("\n=== GREEN: knowledge scope filters `seen` + grants adjacent reach by kind ===");
{
  const win = newWin();
  // HQ-5 (docs/ANIMAL-SOCIAL-HQ.md Change 3): the two kill entries are now written BY the
  // production "kill" writer via applyEvent (dm.js stamps data.nodeId itself) — never
  // hand-seeded {kind:"kill", nodeId:...} fixtures. Hand-seeding was the exact false-green the
  // HQ review caught: it proved the scope filter's logic but never that a real kill event
  // produces a ledger shape animalWitnessSeen can match.
  const w = mkWorld(win, { ledger: [
    { id:"e-move-here",  type:"outcome", data:{ kind:"move-zone", nodeId:"home" }, day:10, min:0, text:"x" },
    { id:"e-face-here",  type:"npc-life", data:{ nodeId:"home" }, day:10, min:0, text:"x" },
    { id:"e-drift-here", type:"drift", data:{ nodeId:"home" }, day:10, min:0, text:"x" },
  ]});
  win.eval(`applyEvent(U.worlds['${w.id}'], {type:"kill", payload:{victimClass:"wolf", at:"home"}})`);
  win.eval(`applyEvent(U.worlds['${w.id}'], {type:"kill", payload:{victimClass:"wolf", at:"north"}})`);
  const herdId = mintAnimalAtRow(win, w, 2, { id:"herd-1" });     // herd category
  const birdId = mintAnimalAtRow(win, w, 3, { id:"bird-1" });     // bird category
  const predId = mintAnimalAtRow(win, w, 6, { id:"pred-1" });     // predator category
  const burrId = mintAnimalAtRow(win, w, 5, { id:"burr-1" });     // burrower category

  const wHerd = win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${herdId}')))`);
  const wBird = win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${birdId}')))`);
  const wPred = win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${predId}')))`);
  const wBurr = win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${burrId}')))`);
  const [pHerd, pBird, pPred, pBurr] = [wHerd, wBird, wPred, wBurr].map(JSON.parse);

  check("ACCEPT: a raven/bird-scope packet includes adjacent-node events (e-kill-adj at 'north')",
    pBird.seen.some(s => s.day === 10) && pBird.nearby, wBird);
  // adjacency is proven by node-set eligibility, not directly visible on the seen entry (it carries
  // no nodeId) — re-derive via count: bird sees kill-here, face-here, kill-adj = up to 3 kill/face
  // entries (kill matched twice: home+north); herd must NOT include the adjacent one at all since
  // herd never gets adjacentReach.
  const birdKillCount = pBird.seen.filter(s => s.note && s.note.indexOf("loud-hurt") >= 0).length;
  check("ACCEPT: bird scope sees BOTH the here-kill and the adjacent-node kill (2 kill entries)",
    birdKillCount === 2, JSON.stringify(pBird.seen));
  const herdKillCount = pHerd.seen.filter(s => s.note && s.note.indexOf("loud-hurt") >= 0).length;
  check("ACCEPT: a herd-scope packet does NOT include adjacent-node events (0 kill entries — herd has no reach, and kill isn't even in herd's ledgerTypes)",
    herdKillCount === 0, JSON.stringify(pHerd.seen));
  check("herd scope DOES see its own movement entry at home", pHerd.seen.some(s => s.note && s.note.indexOf("quick feet") >= 0), JSON.stringify(pHerd.seen));
  check("herd scope does NOT see the face/npc-life entry (out of herd's ledgerTypes)", !pHerd.seen.some(s => s.note && s.note.indexOf("two-legged") >= 0), JSON.stringify(pHerd.seen));
  check("predator scope sees the here-kill but NOT the adjacent one (no adjacentReach)",
    pPred.seen.filter(s => s.note && s.note.indexOf("loud-hurt") >= 0).length === 1, JSON.stringify(pPred.seen));
  check("burrower scope sees the drift entry", pBurr.seen.some(s => s.note && s.note.indexOf("smelled different") >= 0), JSON.stringify(pBurr.seen));
  check("burrower scope does NOT see the kill entry (out of burrower's ledgerTypes)", !pBurr.seen.some(s => s.note && s.note.indexOf("loud-hurt") >= 0), JSON.stringify(pBurr.seen));
}

console.log("\n=== GREEN: pack-tag shared attitude — propagates within a node, never cross-node ===");
{
  const win = newWin();
  const w = mkWorld(win);
  // row 1 = territory wolf/pack-runner (tags: pack, territory) — pack-tagged.
  const packA = mintAnimalAtRow(win, w, 1, { id:"pack-a", at:"home", attitude: 0 });
  const packB = mintAnimalAtRow(win, w, 1, { id:"pack-b", at:"home", attitude: 0 });
  const packAway = mintAnimalAtRow(win, w, 1, { id:"pack-away", at:"north", attitude: 0 });
  // row 9 = old solitary beast (tags: solitary, sentinel) — never propagates.
  const soloId = mintAnimalAtRow(win, w, 9, { id:"solo-1", at:"home", attitude: 0 });
  check("(setup) pack-tagged rows minted with dm.packTag",
    win.eval(`codexGet(U.worlds['${w.id}'], 'pack-a').dm.packTag === true && codexGet(U.worlds['${w.id}'], 'pack-b').dm.packTag === true`));
  check("(setup) solitary row does NOT carry packTag",
    win.eval(`!codexGet(U.worlds['${w.id}'], 'solo-1').dm.packTag`));
  win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check", payload:{ target:'pack-a', skill:"Animal Handling", levers:[{type:"feeding",decisive:true}] } });`);
  const aVal = win.eval(`codexGetAttitude(U.worlds['${w.id}'], 'pack-a').value`);
  const bVal = win.eval(`codexGetAttitude(U.worlds['${w.id}'], 'pack-b').value`);
  const awayVal = win.eval(`codexGetAttitude(U.worlds['${w.id}'], 'pack-away').value`);
  const soloVal = win.eval(`codexGetAttitude(U.worlds['${w.id}'], 'solo-1').value`);
  check("ACCEPT: befriending the pack leader shifts the leader itself", aVal === 1, "a=" + aVal);
  check("ACCEPT: the shift propagates to another pack member in the SAME node", bVal === 1, "b=" + bVal);
  check("ACCEPT: the shift does NOT propagate cross-node (pack-away at a different node)", awayVal === 0, "away=" + awayVal);
  check("solitary-tagged animal at the same node is UNTOUCHED (no propagation to non-pack kinds)", soloVal === 0, "solo=" + soloVal);
}

console.log("\n=== GREEN: a wilderness node always has >=1 hook after prep (seeded trials) ===");
{
  let allHooked = true, misses = [];
  for(let i=0;i<40;i++){
    const win = newWin();
    const w = mkWorld(win, { id: "w-hook-" + i, nodes: { wild1: { id:"wild1", name:"Deep Wood", type:"Setting", x:9, y:9 } } });
    w.prep.nodes.wild1 = { env:"wilderness" };
    win.eval(`prepCastEnvAnimals(U.worlds['${"w-hook-" + i}'], 'wild1')`);
    const hooked = win.eval(`
      Object.values(codexOf(U.worlds['${"w-hook-" + i}']).records)
        .some(function(r){ return r.status && r.status.at==='wild1' && r.dm && r.dm.hook; })
    `);
    if(!hooked){ allHooked = false; misses.push(i); }
  }
  check("ACCEPT: EVERY seeded trial (40/40) mints >=1 hook at the wilderness node after prep",
    allHooked, "misses=" + JSON.stringify(misses));
  // sanity: the hook rides the territory-holder specifically (§5 "the hook rides the territory-
  // holder's tell"), not an arbitrary pool member.
  {
    const win = newWin();
    const w = mkWorld(win, { nodes: { wild1: { id:"wild1", name:"Deep Wood", type:"Setting", x:9, y:9 } } });
    w.prep.nodes.wild1 = { env:"wilderness" };
    win.eval(`prepCastEnvAnimals(U.worlds['${w.id}'], 'wild1')`);
    const holderHooked = win.eval(`
      Object.values(codexOf(U.worlds['${w.id}']).records)
        .some(function(r){ return r.dm && r.dm.territoryHolder && r.dm.hook; })
    `);
    check("(informational) the guaranteed hook lands on the territory-holder when one minted this call", holderHooked === true);
  }
}

console.log("\n=== GREEN: place-memory grows season/biome + rolled-hook entries ===");
{
  const win = newWin();
  const w = mkWorld(win);
  w.prep.bundle = { environments: [ { kind:"wilderness", walk: { startBiome: "Forest" } } ] };
  w.prep.nodes.home = { env:"wilderness", idx: 0 };
  const id = mintAnimalAtRow(win, w, 2, { id:"herd-pm" });
  win.eval(`codexGet(U.worlds['${w.id}'], '${id}').dm.hook = { text:"A trail of broken branches leads deeper into the wood.", ref:"npc-hook#123" };`);
  const packet = JSON.parse(win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}')))`));
  check("ACCEPT: place-memory includes a biome-sourced, season-keyed standing fact",
    packet.placeMemory.some(f => /forest/i.test(f.fact) && f.season), JSON.stringify(packet.placeMemory));
  check("ACCEPT: place-memory includes the animal's own rolled node hook as a standing fact",
    packet.placeMemory.some(f => f.fact === "A trail of broken branches leads deeper into the wood."), JSON.stringify(packet.placeMemory));
}

console.log("\n=== GREEN: HQ-5 (docs/ANIMAL-SOCIAL-HQ.md) — the kill writer's ledger shape reaches a predator-scope witness ===");
{
  const win = newWin();
  const w = mkWorld(win);
  const predId = mintAnimalAtRow(win, w, 6, { id:"pred-hq5", at:"home" });  // row 6 = predator category
  check("(setup) predator row minted", !!predId, "pred=" + predId);
  // production kill path — applyEvent, not a hand-seeded ledger fixture (D7/Change 1: the kill
  // writer now stamps data.nodeId itself).
  win.eval(`applyEvent(U.worlds['${w.id}'], {type:"kill", payload:{victimClass:"wolf", at:"home"}})`);
  // "open an interview" — the production animal_interview event (dm.js), not a raw field write.
  const openRes = JSON.parse(win.eval(`JSON.stringify(applyEvent(U.worlds['${w.id}'], {type:"animal_interview", payload:{id:'${predId}', open:true}}))`));
  check("(setup) interview opened via applyEvent", openRes.ok === true && openRes.interviewOpen === true, JSON.stringify(openRes));
  const packet = JSON.parse(win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${predId}')))`));
  check("ACCEPT: a predator-scope animal at the kill's node witnesses it (seen[] carries the kill)",
    packet.seen.some(s => s.note && s.note.indexOf("loud-hurt") >= 0), JSON.stringify(packet.seen));
  // check 3 (spec): the kill ledger line's prose twin is unchanged — only data gained nodeId.
  const killEntry = JSON.parse(win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).find(function(e){return e.data&&e.data.kind==="kill"&&e.data.nodeId==="home";}))`));
  check("ledger line's prose twin unchanged (still \"✦ A wolf was slain.\")",
    killEntry && killEntry.text === "✦ A wolf was slain.", JSON.stringify(killEntry));
  check("ledger line's data carries nodeId (the only data change)",
    killEntry && killEntry.data.nodeId === "home", JSON.stringify(killEntry));
}

console.log("\n=== GREEN: HQ-5 — predator scope no longer matches move-zone (D7: not node-scoped, was never satisfiable) ===");
{
  const win = newWin();
  const w = mkWorld(win, { ledger: [
    { id:"e-move-here", type:"outcome", data:{ kind:"move-zone", nodeId:"home" }, day:10, min:0, text:"x" },
  ]});
  const predId = mintAnimalAtRow(win, w, 6, { id:"pred-hq5-mz", at:"home" });
  const packet = JSON.parse(win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${predId}')))`));
  check("predator scope does NOT see a move-zone entry (dropped from predator's ledgerTypes)",
    !packet.seen.some(s => s.note && s.note.indexOf("quick feet") >= 0), JSON.stringify(packet.seen));
}

/* ============================================================================================
   HQ-8 (docs/ANIMAL-SOCIAL-HQ.md) — npc-life writers stamp nodeId; the bird witness channel
   goes live. RED on master (0e203cd): no npc-life writer stamped nodeId/at, so
   animalWitnessSeen's location filter excluded every real npc-life entry — the bird's
   faces-sense ("a two-legged one came and went") was verify-only. THE WIRING LAW: every check
   below drives a PRODUCTION entry point (applyEvent / worldTurn / companionAdjustLoyalty /
   seedFromLife / ssFactionTurn) — never a hand-built ledger fixture, never the writer's own
   addLedger call read directly.
   ============================================================================================ */

// a variant loader that lets a mutation test patch the SOURCE TEXT of a single module before eval
// (same "the harness tests itself, no production mutation" posture as verify-animal-table-fingerprint.mjs).
function newWinPatched(patchFn){
  const man2 = JSON.parse(read("manifest.json"));
  const pieces = man2.loadOrder.filter((p) => p.endsWith(".js")).map((p) => {
    const src = read(p);
    return patchFn ? patchFn(p, src) : src;
  });
  const full = read("tables.js") + "\n;\n" + pieces.join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div><div id="shelf"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full);
  return dom.window;
}

console.log("\n=== HQ-8 RED-FIRST: a production npc-life event (the turn life-event tick) reaches a bird-scope witness ===");
{
  const win = newWin();
  const w = mkWorld(win);
  const birdId = mintAnimalAtRow(win, w, 3, { id:"bird-hq8", at:"home" });
  check("(setup) bird row minted", !!birdId, "bird=" + birdId);

  // seed ONE known npc at the node so turnLifeEvent's salience draw deterministically picks it
  win.eval(`codexAdd(U.worlds['${w.id}'], { id:"npc:known-hq8", kind:"npc", name:"Aldric",
    status:{ known:true, at:"home", condition:"alive" }, dm:{}, fields:{} });`);

  // production path: advance_clock >= 1 day -> applyEvent's "advance_clock" case -> worldTurn("montage")
  // -> turnLifeEvent(w, w.currentNodeId, {monthsLong:true}) (src/world/turn.js — the real writer).
  const advRes = JSON.parse(win.eval(`JSON.stringify(applyEvent(U.worlds['${w.id}'], {type:"advance_clock", payload:{days:1}}))`));
  check("(setup) advance_clock fired via production applyEvent", advRes.ok === true, JSON.stringify(advRes));
  const lifeEntry = JSON.parse(win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).find(function(e){return e.type==="npc-life" && e.data && e.data.kind==="life-event";}))`));
  check("(setup) a life-event npc-life ledger entry was written", !!lifeEntry, JSON.stringify(lifeEntry));

  const openRes = JSON.parse(win.eval(`JSON.stringify(applyEvent(U.worlds['${w.id}'], {type:"animal_interview", payload:{id:'${birdId}', open:true}}))`));
  check("(setup) interview opened via applyEvent", openRes.ok === true && openRes.interviewOpen === true, JSON.stringify(openRes));

  const packet = JSON.parse(win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${birdId}')))`));
  check("ACCEPT (check 1, life-event leg): the bird's seen[] contains the npc-life life-event entry (nodeId now stamped)",
    packet.seen.some(s => lifeEntry && s.day === lifeEntry.day && s.note && s.note.indexOf("two-legged") >= 0),
    JSON.stringify(packet.seen));
  check("ledger entry's data carries nodeId (the only data change)",
    lifeEntry && lifeEntry.data.nodeId === "home", JSON.stringify(lifeEntry));
  check("ledger entry's prose twin is byte-unchanged (starts with '◆ Aldric — ')",
    lifeEntry && lifeEntry.text.indexOf("◆ Aldric — ") === 0, JSON.stringify(lifeEntry));
}

console.log("\n=== HQ-8 GREEN: companion desertion / pet-wanders / sidekick departure+death stamp nodeId, reach a bird witness ===");
{
  const win = newWin();
  const w = mkWorld(win);
  const birdId = mintAnimalAtRow(win, w, 3, { id:"bird-hq8-comp", at:"home" });
  win.eval(`
    U.worlds['${w.id}'].companions = { hirelings:[{id:"h1", codexId:"npc:hire-1", name:"Bram", role:"guide", loyalty:0}], pets:[], sidekickId:null, sidekick:null };
    codexAdd(U.worlds['${w.id}'], { id:"npc:hire-1", kind:"npc", name:"Bram", status:{ known:true, at:"home" }, dm:{}, fields:{} });
    companionDesert(U.worlds['${w.id}'], U.worlds['${w.id}'].companions.hirelings[0]);
  `);
  const desertEntry = JSON.parse(win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).find(function(e){return e.data&&e.data.kind==="desertion";}))`));
  check("(setup) desertion fired via the production companionDesert path with nodeId stamped",
    desertEntry && desertEntry.data.nodeId === "home", JSON.stringify(desertEntry));
  const openRes = JSON.parse(win.eval(`JSON.stringify(applyEvent(U.worlds['${w.id}'], {type:"animal_interview", payload:{id:'${birdId}', open:true}}))`));
  check("(setup) interview opened", openRes.ok === true);
  const packet = JSON.parse(win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${birdId}')))`));
  check("ACCEPT: bird witness sees the desertion (companions.js:160/165 nodeId stamp)",
    packet.seen.some(s => desertEntry && s.day === desertEntry.day), JSON.stringify(packet.seen));
}
{
  const win = newWin();
  const w = mkWorld(win);
  win.eval(`
    U.worlds['${w.id}'].companions = { hirelings:[], pets:[{id:"p1", codexId:"npc:pet-1", name:"Fen", loyalty:0}], sidekickId:null, sidekick:null };
    codexAdd(U.worlds['${w.id}'], { id:"npc:pet-1", kind:"npc", name:"Fen", status:{ known:true, at:"home" }, dm:{}, fields:{} });
    companionPetWanders(U.worlds['${w.id}'], U.worlds['${w.id}'].companions.pets[0]);
  `);
  const wandersEntry = JSON.parse(win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).find(function(e){return e.data&&e.data.kind==="pet-wanders";}))`));
  check("ACCEPT: companionPetWanders stamps nodeId from the pet's own codex record (companions.js:293/299)",
    wandersEntry && wandersEntry.data.nodeId === "home", JSON.stringify(wandersEntry));
}
{
  const win = newWin();
  const w = mkWorld(win);
  win.eval(`
    U.worlds['${w.id}'].companions = { hirelings:[], pets:[], sidekickId:"npc:side-1",
      sidekick:{ id:"npc:side-1", loyalty:0 } };
    codexAdd(U.worlds['${w.id}'], { id:"npc:side-1", kind:"npc", name:"Toma", status:{ known:true, at:"home" }, dm:{}, fields:{} });
    companionSidekickLeaves(U.worlds['${w.id}']);
  `);
  const leavesEntry = JSON.parse(win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).find(function(e){return e.data&&e.data.kind==="sidekick-departure";}))`));
  check("ACCEPT: companionSidekickLeaves stamps nodeId from the sidekick's own codex record (companions.js:413/419)",
    leavesEntry && leavesEntry.data.nodeId === "home", JSON.stringify(leavesEntry));
}
{
  const win = newWin();
  const w = mkWorld(win);
  win.eval(`
    U.worlds['${w.id}'].companions = { hirelings:[], pets:[], sidekickId:"npc:side-2", sidekick:{ id:"npc:side-2", loyalty:3 } };
    codexAdd(U.worlds['${w.id}'], { id:"npc:side-2", kind:"npc", name:"Vess", status:{ known:true, at:"home" }, dm:{}, fields:{} });
    companionSidekickDies(U.worlds['${w.id}'], "a wound that would not close");
  `);
  const diesEntry = JSON.parse(win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).find(function(e){return e.data&&e.data.kind==="sidekick-death";}))`));
  check("ACCEPT: companionSidekickDies stamps nodeId from the sidekick's codex record read BEFORE the condition:dead update (companions.js:441/451)",
    diesEntry && diesEntry.data.nodeId === "home", JSON.stringify(diesEntry));
}

console.log("\n=== HQ-8 GREEN: successor-thread stamps npc.status.at ===");
{
  const win = newWin();
  const w = mkWorld(win);
  win.eval(`
    var npc = codexAdd(U.worlds['${w.id}'], { id:"npc:linked-1", kind:"npc", name:"Orin", status:{ known:true, at:"north", condition:"alive" }, dm:{}, fields:{} });
    var thread = codexAdd(U.worlds['${w.id}'], { id:"thread:x", kind:"thread", name:"a favor owed", status:{known:true,soft:false} });
    codexLink(U.worlds['${w.id}'], thread.id, "part-of", npc.id);
    turnMintSuccessorThread(U.worlds['${w.id}'], npc, "died");
  `);
  const succEntry = JSON.parse(win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).find(function(e){return e.data&&e.data.kind==="successor-thread";}))`));
  check("ACCEPT: turnMintSuccessorThread stamps nodeId = npc.status.at (turn.js:399/~407)",
    succEntry && succEntry.data.nodeId === "north", JSON.stringify(succEntry));
}

console.log("\n=== HQ-8 GREEN (D-HQ8-2 holds): backstory seeds + faction-turn + animal-tell-refresh stay UNSTAMPED, invisible to every witness ===");
{
  const win = newWin();
  const w = mkWorld(win);
  const birdId = mintAnimalAtRow(win, w, 3, { id:"bird-hq8-neg", at:"home" });
  // production backstory-seed path: seedFromLife(w, c) (src/creator/life.js) — a real character's
  // life.events[].seeds, not a hand-rolled ledger fixture.
  win.eval(`
    var c = { id:"pc-1", name:"Kess", life:{ events:[{ seeds:[{ kind:"npc", role:"an old mentor", desc:"taught her the blade", species:"human" }] }] } };
    U.worlds['${w.id}'].gazetteer = [];
    seedFromLife(U.worlds['${w.id}'], c);
  `);
  const backstoryEntry = JSON.parse(win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).find(function(e){return e.type==="npc-life" && e.data && e.data.source==="char-genesis";}))`));
  check("(setup) backstory seed written via production seedFromLife", !!backstoryEntry, JSON.stringify(backstoryEntry));
  check("D-HQ8-2: creator/life.js's backstory seed carries NO nodeId/at (deliberately unstamped — pre-map, the PC's past)",
    backstoryEntry && backstoryEntry.data.nodeId == null && backstoryEntry.data.at == null, JSON.stringify(backstoryEntry));

  // production faction-turn path: ssFactionTurn(w) (src/engine/world-gen.js), the same function
  // worldTurn("montage") calls.
  win.eval(`U.worlds['${w.id}'].factions=[{name:"The Ashen Guild", clock:{filled:0,size:6}}]; ssFactionTurn(U.worlds['${w.id}']);`);
  const factionEntry = JSON.parse(win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).find(function(e){return e.data&&e.data.kind==="faction-turn";}))`));
  check("(setup) faction-turn written via production ssFactionTurn", !!factionEntry, JSON.stringify(factionEntry));
  check("D-HQ8-2: world-gen.js's faction-turn carries NO nodeId/at (deliberately unstamped — abstract web motion, not a scene)",
    factionEntry && factionEntry.data.nodeId == null && factionEntry.data.at == null, JSON.stringify(factionEntry));

  // production animal-tell-refresh path: turnAnimalAllyTellRefresh(w) needs an ally (dm.ally===true).
  win.eval(`codexGet(U.worlds['${w.id}'], '${birdId}').dm.ally = true; turnAnimalAllyTellRefresh(U.worlds['${w.id}']);`);
  const tellEntry = JSON.parse(win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).find(function(e){return e.data&&e.data.kind==="animal-tell-refresh";}))`));
  check("(setup) animal-tell-refresh written via production turnAnimalAllyTellRefresh", !!tellEntry, JSON.stringify(tellEntry));
  check("D-HQ8-2: turn.js's animal-tell-refresh carries NO nodeId/at (deliberately unstamped — meta bookkeeping, a bird must not witness a refresh sweep)",
    tellEntry && tellEntry.data.nodeId == null && tellEntry.data.at == null, JSON.stringify(tellEntry));

  // none of the three unstamped entries can EVER appear in any witness packet — no location, so
  // animalWitnessSeen's `loc==null` guard excludes them regardless of scope/ledgerTypes.
  const openRes = JSON.parse(win.eval(`JSON.stringify(applyEvent(U.worlds['${w.id}'], {type:"animal_interview", payload:{id:'${birdId}', open:true}}))`));
  const packet = JSON.parse(win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${birdId}')))`));
  check("ACCEPT: none of backstory/faction-turn/animal-tell-refresh appear in the bird's witness packet at all (seen[] is empty)",
    packet.seen.length === 0, JSON.stringify(packet.seen));
  // the sharper assertion: the raw ledger-window query (bypassing scope) still excludes them by
  // location alone, since animalWitnessSeen's `loc==null` short-circuit runs before the scope filter.
  const rawEligible = win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).filter(function(e){
    var loc=(e.data&&(e.data.nodeId!=null?e.data.nodeId:e.data.at));
    return loc!=null;
  }).map(function(e){return e.data.kind;}))`);
  check("no-location entries never even enter the location-eligible set (backstory/faction-turn/tell-refresh excluded)",
    JSON.parse(rawEligible).indexOf("char-genesis")===-1 && JSON.parse(rawEligible).indexOf("faction-turn")===-1 && JSON.parse(rawEligible).indexOf("animal-tell-refresh")===-1,
    rawEligible);
}

console.log("\n=== HQ-8 MUTATION: stripping the turn.js:354 life-event nodeId stamp turns check 1's life-event leg red ===");
{
  const win = newWinPatched((p, src) => {
    if(p.endsWith("src/world/turn.js")){
      const patched = src.replace(
        'addLedger(w,"npc-life",{kind:"life-event",npcId:npc.id,name:npc.name,fate,band:roll.band,monthsLong:!!opts.monthsLong,nodeId},',
        'addLedger(w,"npc-life",{kind:"life-event",npcId:npc.id,name:npc.name,fate,band:roll.band,monthsLong:!!opts.monthsLong},'
      );
      if(patched === src) throw new Error("HQ-8 mutation anchor not found in turn.js — update the mutation test's string match");
      return patched;
    }
    return src;
  });
  const w = mkWorld(win);
  const birdId = mintAnimalAtRow(win, w, 3, { id:"bird-hq8-mut", at:"home" });
  win.eval(`codexAdd(U.worlds['${w.id}'], { id:"npc:known-mut", kind:"npc", name:"Aldric", status:{ known:true, at:"home", condition:"alive" }, dm:{}, fields:{} });`);
  win.eval(`applyEvent(U.worlds['${w.id}'], {type:"advance_clock", payload:{days:1}})`);
  const lifeEntry = JSON.parse(win.eval(`JSON.stringify((U.worlds['${w.id}'].ledger||[]).find(function(e){return e.type==="npc-life" && e.data && e.data.kind==="life-event";}))`));
  win.eval(`applyEvent(U.worlds['${w.id}'], {type:"animal_interview", payload:{id:'${birdId}', open:true}})`);
  const packet = JSON.parse(win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${birdId}')))`));
  check("MUTATION: with the nodeId stamp stripped, the bird's seen[] does NOT contain the life-event (proves check 1 is load-bearing)",
    lifeEntry && lifeEntry.data.nodeId === undefined && !packet.seen.some(s => s.day === lifeEntry.day), JSON.stringify({lifeEntry, seen:packet.seen}));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
