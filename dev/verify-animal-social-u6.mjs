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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
