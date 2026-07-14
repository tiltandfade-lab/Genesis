/* Verify ANIMAL-SOCIAL §6 U4 (docs/ANIMAL-SOCIAL.md) — the witness packet (Speak with Animals lane):
   animalWitness(w, rec) assembles {tell, seen, nearby, placeMemory} from already-rolled state
   (ledger + codex + map); surfaced on the digest (codexFullRecord's `witness` key) only once an
   interview is open (the `animal_interview` event); attitude gates volunteered depth (§3); a
   spice-band-gated breach-perception entry rides `seen` per RESOLVED ruling 3.

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-animal-social-u1/u2/u3.mjs).
   Run:  node dev/verify-animal-social-u4.mjs  (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md)

   Accept criteria (spec §6 U4):
     1. same world state -> identical packet (determinism test, run twice, diff empty).
     2. packet never contains NPC proper names (role/smell handles only — scanned against the
        codex name list).
     3. events older than 1 in-world day are excluded, except placeMemory.
   Red-first: today's digest for an animal interview carries only kind+tell+need (no `witness` key
   at all) — document that, then build until the full packet exists. */
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
    id: opts.id || "w-u4", name: "Test World", session: 1,
    startNodeId: "home", currentNodeId: "home",
    map: { nodes: Object.assign({
      home: { id: "home", name: "Home Glade", type: "Setting", x: 0, y: 0 },
      north: { id: "north", name: "North Ford", type: "Setting", x: 0, y: 1 },
      far: { id: "far", name: "Far Hollow", type: "Setting", x: 5, y: 5 },
    }, opts.nodes || {}), edges: opts.edges || [{ from: "home", to: "north", bearing: "N" }] },
    gazetteer: [], ledger: opts.ledger || [], log: [], clock: { day: 10, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: [], equipped:{} } }],
    factions: [], pressures: [], shops: {}, codex: { records: {}, version: 1 },
    regions: {}, seed: {}, realm: { active: !!opts.realmActive },
    prep: { session:1, bundle:null, overlays:{}, harvest:null, nodes: {}, debt: [] },
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

function mintAnimal(win, w, opts){
  opts = opts || {};
  win.eval(`window.__mintOut = (function(){
    var p = rollPartial('animal', ${JSON.stringify(opts.rollOpts||{})});
    var rec = codexAdd(U.worlds['${w.id}'], Object.assign({}, p, { kind:"npc",
      id: ${JSON.stringify(opts.id||"animal-1")},
      status:{ soft:true, at:${JSON.stringify(opts.at||"home")} },
      dm: Object.assign({}, p.dm, { partial:true, partialKind:p.partialKind, ambient:true, tellBoundTo:${JSON.stringify(opts.tellBoundTo||null)} })
    }));
    if (typeof codexAttitudeOpen === "function"){
      codexAttitudeOpen(U.worlds['${w.id}'], rec.id, ${opts.attitude!=null?opts.attitude:0}, {cause:"animal-opening"});
    }
    return rec.id;
  })();`);
  return win.eval("window.__mintOut");
}

console.log("=== RED-FIRST: today's digest for an animal interview carries only kind+tell+need ===");
{
  const win = newWin();
  const w = mkWorld(win);
  const id = mintAnimal(win, w, { at: "home" });
  const full = win.eval(`JSON.stringify(codexFullRecord(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}')))`);
  const parsed = JSON.parse(full);
  check("RED baseline: fields.animalKind + dm.tell + dm.need already ride the digest",
    !!parsed.fields.animalKind && !!parsed.dm.tell && !!parsed.dm.need, full);
  check("RED baseline: no `witness` key ships when the interview is NOT open",
    parsed.witness === undefined, full);
}

console.log("\n=== GREEN: animalWitness + digest wiring ===");
{
  // 1. the assembler is a no-op for non-animal records.
  {
    const win = newWin();
    const w = mkWorld(win);
    win.eval(`codexAdd(U.worlds['${w.id}'], { kind:"npc", id:"plain-npc", name:"Plain Bob",
      fields:{}, dm:{}, status:{ soft:true, at:'home' } });`);
    const out = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], 'plain-npc'))`);
    check("animalWitness returns null for a non-animal record", out === null);
  }

  // 2. tell + boundTo surface from the mint-time roll.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { tellBoundTo: "loc:north-ford-cellar" });
    const out = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}'))`);
    check("witness.tell.text carries the rolled tell", typeof out.tell.text === "string" && out.tell.text.length > 0, JSON.stringify(out.tell));
    check("witness.tell.boundTo carries the DM's binding", out.tell.boundTo === "loc:north-ford-cellar");
  }

  // 3. seen[] pulls in-window, at-node ledger entries; excludes out-of-window and off-node ones.
  {
    const win = newWin();
    const w = mkWorld(win, { ledger: [
      { id:"e1", type:"outcome", day:10, min:100, data:{ kind:"kill", nodeId:"home" }, text:"secret name leak test" },
      { id:"e2", type:"drift", day:8, min:0, data:{ nodeId:"home" }, text:"old news" },          // 2 days old -> excluded
      { id:"e3", type:"npc-life", day:9, min:0, data:{ nodeId:"far" }, text:"wrong node" },       // right day, wrong node -> excluded
      { id:"e4", type:"canon", day:10, min:200, data:{ kind:"discovery", nodeId:"home" }, text:"fresh discovery" },
    ]});
    const id = mintAnimal(win, w);
    const out = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}'))`);
    check("seen includes the in-window at-node kill entry", out.seen.some(s => s.day === 10 && s.min === 100));
    check("seen includes the in-window at-node discovery entry", out.seen.some(s => s.day === 10 && s.min === 200));
    check("seen EXCLUDES the 2-day-old entry", !out.seen.some(s => s.min === 0 && s.day === 8));
    check("seen EXCLUDES the off-node entry (day 9, node 'far')", !out.seen.some(s => s.day === 9));
    check("every seen entry carries a sensory-channel tag", out.seen.every(s => !!s.sense), JSON.stringify(out.seen));
  }

  // 4. bird-kind reach: adjacent-node events are included for a bird animalKind.
  {
    const win = newWin();
    const w = mkWorld(win, { ledger: [
      { id:"e1", type:"drift", day:10, min:0, data:{ nodeId:"north" }, text:"north event" },
    ]});
    win.eval(`window.__birdId = (function(){
      var p = rollPartial('animal', {});
      p.fields.animalKind = "raven";
      var rec = codexAdd(U.worlds['${w.id}'], Object.assign({}, p, { kind:"npc", id:"bird-1",
        status:{ soft:true, at:'home' },
        dm: Object.assign({}, p.dm, { partial:true, partialKind:p.partialKind, ambient:true }) }));
      codexAttitudeOpen(U.worlds['${w.id}'], rec.id, 0, {cause:"opening"});
      return rec.id;
    })();`);
    const outBird = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], window.__birdId))`);
    check("a bird-kind animal's seen[] reaches the adjacent node", outBird.seen.some(s => s.day === 10));

    const idGround = mintAnimal(win, w, { id: "ground-1", rollOpts: {} });
    win.eval(`codexGet(U.worlds['${w.id}'], '${idGround}').fields.animalKind = "dog";`);
    const outGround = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${idGround}'))`);
    check("a non-bird animal at 'home' does NOT see the adjacent-node-only event", !outGround.seen.some(s => s.day === 10));
  }

  // 5. nearby: exits (place names OK) + creature/npc handles (never names).
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w);
    win.eval(`codexAdd(U.worlds['${w.id}'], { kind:"npc", id:"named-npc", name:"Miller Hask",
      fields:{ role:"miller" }, dm:{}, status:{ at:'home' } });`);
    const out = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}'))`);
    check("nearby.exits carries the real destination place name", out.nearby.exits.some(e => e.toName === "North Ford"));
    check("nearby.creatures carries a handle, never the co-located NPC's name",
      out.nearby.creatures.some(c => c.handle && c.handle.indexOf("Hask") === -1));
    const flat = JSON.stringify(out);
    check("the co-located NPC's proper name never appears anywhere in the packet", flat.indexOf("Hask") === -1, flat);
  }

  // 6. placeMemory persists even for facts outside the 1-day window (the §2 exception).
  {
    const win = newWin();
    const w = mkWorld(win);
    w.map.nodes.home.codexId = "loc-home";
    win.eval(`codexAdd(U.worlds['${w.id}'], { kind:"location", id:"loc-home", name:"Home Glade",
      fields:{}, dm:{}, status:{ at:null, condition:"strained" } });`);
    const id = mintAnimal(win, w);
    const out = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}'))`);
    check("placeMemory carries the node's standing condition", out.placeMemory.some(m => /strained/.test(m.fact)), JSON.stringify(out.placeMemory));
  }

  // 7. attitude gates volunteered depth: Hostile/Unfriendly volunteers nothing beyond the tell.
  {
    const win = newWin();
    const w = mkWorld(win, { ledger: [
      { id:"e1", type:"drift", day:10, min:0, data:{ nodeId:"home" }, text:"an event" },
    ]});
    const id = mintAnimal(win, w, { attitude: -1 });
    const out = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}'))`);
    check("Unfriendly (-1) gates seen[] to empty", out.seen.length === 0, JSON.stringify(out.seen));
    check("Unfriendly (-1) gates nearby to empty", out.nearby.exits.length === 0 && out.nearby.creatures.length === 0);
    check("Unfriendly (-1) still volunteers the tell", typeof out.tell.text === "string" && out.tell.text.length > 0);
    check("gated packet is flagged", out.gated === true);

    const w2 = mkWorld(win, { id: "w-friendly", ledger: w.ledger });
    const id2 = mintAnimal(win, w2, { attitude: 0 });
    const out2 = win.eval(`animalWitness(U.worlds['${w2.id}'], codexGet(U.worlds['${w2.id}'], '${id2}'))`);
    check("Indifferent (0) or better volunteers the full packet (seen[] populated)", out2.seen.length > 0, JSON.stringify(out2.seen));
  }

  // 8. RESOLVED ruling 3 — breach-tagged perception, spice-band-gated.
  {
    const win = newWin();
    const w = mkWorld(win);
    w.map.nodes.home.codexId = "loc-home-b";
    win.eval(`codexAdd(U.worlds['${w.id}'], { kind:"location", id:"loc-home-b", name:"Home Glade",
      fields:{}, dm:{}, status:{ at:null, condition:"Grounded" } });`);
    const id = mintAnimal(win, w);
    const outLow = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}'))`);
    check("a Grounded-band node carries NO breach-perception entry", !outLow.seen.some(s => s.sense === "breach"));

    win.eval(`codexUpdate(U.worlds['${w.id}'], "loc-home-b", { status:{ condition:"Volatile" } });`);
    const outHigh = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}'))`);
    check("a Volatile-band node's interviewed animal MAY report the breach-tagged perception",
      outHigh.seen.some(s => s.sense === "breach"), JSON.stringify(outHigh.seen));

    const w2 = mkWorld(win, { id: "w-realm", realmActive: true });
    const id2 = mintAnimal(win, w2);
    const outRealm = win.eval(`animalWitness(U.worlds['${w2.id}'], codexGet(U.worlds['${w2.id}'], '${id2}'))`);
    check("an active marooned realm also gates the breach-perception entry in, independent of node band",
      outRealm.seen.some(s => s.sense === "breach"));
  }

  // 9. digest wiring: witness rides codexFullRecord ONLY once the animal_interview event opens it.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w);
    const before = win.eval(`codexFullRecord(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}')).witness`);
    check("witness absent before the interview opens", before === undefined);
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"animal_interview", payload:{ id:'${id}', open:true } });`);
    const after = win.eval(`codexFullRecord(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}')).witness`);
    check("witness present once the interview is open", after && typeof after === "object", JSON.stringify(after));
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"animal_interview", payload:{ id:'${id}', open:false } });`);
    const closed = win.eval(`codexFullRecord(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}')).witness`);
    check("witness absent again once the channel is closed", closed === undefined);
  }

  // 10. ACCEPT: determinism — same world state, called twice, byte-identical (diff empty).
  {
    const win = newWin();
    const w = mkWorld(win, { ledger: [
      { id:"e1", type:"outcome", day:10, min:100, data:{ kind:"kill", nodeId:"home" }, text:"x" },
      { id:"e2", type:"npc-life", day:10, min:50, data:{ nodeId:"home" }, text:"y" },
    ]});
    w.map.nodes.home.codexId = "loc-home-d";
    win.eval(`codexAdd(U.worlds['${w.id}'], { kind:"location", id:"loc-home-d", name:"Home Glade",
      fields:{}, dm:{}, status:{ at:null, condition:"Strange" } });`);
    const id = mintAnimal(win, w, { attitude: 0 });
    const a = win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}')))`);
    const b = win.eval(`JSON.stringify(animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}')))`);
    const diff = a === b ? "" : "DIFF: a=" + a + "\\nb=" + b;
    check("ACCEPT: same world state -> identical packet twice (diff empty)", a === b, diff);
    console.log("  determinism diff:", JSON.stringify(diff));
  }

  // 11. ACCEPT: packet never contains any codex-known NPC's proper name.
  {
    const win = newWin();
    const w = mkWorld(win, { ledger: [
      { id:"e1", type:"outcome", day:10, min:100, data:{ kind:"kill", nodeId:"home" }, text:"the miller Hask killed" },
    ]});
    win.eval(`codexAdd(U.worlds['${w.id}'], { kind:"npc", id:"n1", name:"Hask Miller",
      fields:{ role:"miller" }, dm:{}, status:{ at:'home' } });`);
    win.eval(`codexAdd(U.worlds['${w.id}'], { kind:"npc", id:"n2", name:"Old Perrin",
      fields:{ role:"innkeeper" }, dm:{}, status:{ at:'north' } });`);
    const id = mintAnimal(win, w, { attitude: 1 });
    const out = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}'))`);
    const names = win.eval(`Object.values(U.worlds['${w.id}'].codex.records).filter(r=>r.kind==="npc").map(r=>r.name)`);
    const flat = JSON.stringify(out);
    const leaked = names.filter(n => n && flat.indexOf(n) >= 0);
    check("ACCEPT: no codex NPC proper name appears anywhere in the witness packet",
      leaked.length === 0, "leaked=" + JSON.stringify(leaked) + " packet=" + flat);
  }

  // 12. ACCEPT: events older than 1 in-world day are excluded, except placeMemory.
  {
    const win = newWin();
    const w = mkWorld(win, { ledger: [
      { id:"e1", type:"drift", day:5, min:0, data:{ nodeId:"home" }, text:"ancient" },   // day 10 now, 5 days old
    ]});
    w.map.nodes.home.codexId = "loc-home-e";
    win.eval(`codexAdd(U.worlds['${w.id}'], { kind:"location", id:"loc-home-e", name:"Home Glade",
      fields:{}, dm:{}, status:{ at:null, condition:"uneasy" } });`);
    const id = mintAnimal(win, w);
    const out = win.eval(`animalWitness(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], '${id}'))`);
    check("ACCEPT: a 5-day-old event is excluded from seen[]", out.seen.length === 0, JSON.stringify(out.seen));
    check("ACCEPT: placeMemory is unaffected by the 1-day window (standing fact still present)",
      out.placeMemory.length > 0, JSON.stringify(out.placeMemory));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
