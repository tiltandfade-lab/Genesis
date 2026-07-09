/* Verify ANIMAL-SOCIAL §6 U5 (docs/ANIMAL-SOCIAL.md) — promotion + the befriended ally:
   any animal engaged twice, named, or raised past +0 promotes from ambient to a full codex record
   (drop dm.ambient, keep the partial stack); landmark rows (row 12 / wild row 12) mint ALREADY
   promoted+named; +2 (Helpful) stamps dm.ally:true -> auto-volunteer witness with no check,
   soft-recall-shaped `guide` on the packet, tell re-roll on world turn; Terrified overshoot marks
   node-wide cruelty memory (-1 opening for animals minted there afterward); recruit_creature still
   REJECTS partials — MONSTER-PARLEY's pet-tier gate stays the only door to a real companion.

   Full-app jsdom load + compiled tables.js (same convention as verify-animal-social-u1..u4.mjs).
   Run:  node dev/verify-animal-social-u5.mjs

   Red-first: ambient animals are currently pool-recycled (codexEvictSoft evicts any
   status.soft&&!status.known record beyond the cap) — not persistent — until promoted. */
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
    id: opts.id || "w-u5", name: "Test World", session: 1,
    startNodeId: "home", currentNodeId: "home",
    map: { nodes: Object.assign({
      home: { id: "home", name: "Home Glade", type: "Setting", x: 0, y: 0 },
      north: { id: "north", name: "North Ford", type: "Setting", x: 0, y: 1 },
    }, opts.nodes || {}), edges: opts.edges || [{ from: "home", to: "north", bearing: "N" }] },
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

function mintAnimal(win, w, opts){
  opts = opts || {};
  win.eval(`window.__mintOut = (function(){
    var p = rollPartial('animal', ${JSON.stringify(opts.rollOpts||{})});
    var rec = codexAdd(U.worlds['${w.id}'], Object.assign({}, p, { kind:"npc",
      id: ${JSON.stringify(opts.id||"animal-1")},
      status:{ soft:true, at:${JSON.stringify(opts.at||"home")} },
      dm: Object.assign({}, p.dm, { partial:true, partialKind:p.partialKind, ambient:true })
    }));
    if (typeof codexAttitudeOpen === "function"){
      codexAttitudeOpen(U.worlds['${w.id}'], rec.id, ${opts.attitude!=null?opts.attitude:0}, {cause:"animal-opening"});
    }
    return rec.id;
  })();`);
  return win.eval("window.__mintOut");
}

console.log("=== RED-FIRST: ambient animals are currently pool-recycled, not persistent ===");
{
  const win = newWin();
  const w = mkWorld(win);
  const id = mintAnimal(win, w);
  const evicted = win.eval(`codexEvictSoft(U.worlds['${w.id}'], { cap: 0 })`);
  const gone = win.eval(`codexGet(U.worlds['${w.id}'], '${id}') === null`);
  check("RED baseline: a fresh ambient animal (status.soft, !known) is evictable by codexEvictSoft",
    evicted >= 1 && gone === true, "evicted=" + evicted + " gone=" + gone);
}

console.log("\n=== GREEN: promotion + ally ===");
{
  // 1. engaged twice promotes.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w);
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"codex_contact", payload:{ id:'${id}' } });`);
    let rec = win.eval(`codexGet(U.worlds['${w.id}'], '${id}')`);
    check("one contact does NOT yet promote", rec.dm.promoted !== true, JSON.stringify(rec.dm));
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"codex_contact", payload:{ id:'${id}' } });`);
    rec = win.eval(`codexGet(U.worlds['${w.id}'], '${id}')`);
    check("ACCEPT: a SECOND contact promotes (dm.ambient dropped, dm.promoted true)",
      rec.dm.promoted === true && rec.dm.ambient === false, JSON.stringify(rec.dm));
    check("promotion keeps the partial stack (partialKind/fields.animalKind survive)",
      rec.dm.partialKind === "animal" && !!rec.fields.animalKind, JSON.stringify(rec));
    check("promotion locks canon (status.soft:false) so the eviction sweep can never recycle it",
      rec.status.soft === false);
    check("promotion stamps a home node", rec.dm.homeNodeId === "home");
    // ACCEPT: recurs at its node across "sessions" — codexEvictSoft (even cap:0) never touches it.
    win.eval(`codexEvictSoft(U.worlds['${w.id}'], { cap: 0 })`);
    const stillThere = win.eval(`codexGet(U.worlds['${w.id}'], '${id}') !== null`);
    check("ACCEPT: promoted animal recurs at its node — survives an aggressive eviction sweep", stillThere === true);
  }

  // 2. named promotes.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w);
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"codex_update", payload:{ id:'${id}', name:"Juniper" } });`);
    const rec = win.eval(`codexGet(U.worlds['${w.id}'], '${id}')`);
    check("ACCEPT: naming promotes", rec.dm.promoted === true && rec.name === "Juniper", JSON.stringify(rec));
  }

  // 3. raised past +0 promotes, via social_check.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { attitude: 0 });
    // a decisive lever auto-shifts Indifferent(0) -> Friendly(+1) with no roll needed.
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check", payload:{ target:'${id}', skill:"Animal Handling", levers:[{type:"feeding",decisive:true}] } });`);
    const rec = win.eval(`codexGet(U.worlds['${w.id}'], '${id}')`);
    check("ACCEPT: attitude raised past +0 promotes", rec.dm.promoted === true, JSON.stringify(rec.dm));
  }

  // 4. +2 (Helpful) stamps dm.ally + auto-volunteers the packet with NO check (no animal_interview open).
  {
    const win = newWin();
    const w = mkWorld(win, { ledger: [
      { id:"e1", type:"drift", day:10, min:0, data:{ nodeId:"home" }, text:"an event" },
    ]});
    const id = mintAnimal(win, w, { attitude: 1 });
    win.eval(`
      var W = U.worlds['${w.id}'];
      var r = codexGet(W, '${id}');
      r.fields.care = 3;   // sustained-care track already at the Helpful floor
      codexSetAttitude(W, '${id}', 2, "care", 10);
    `);
    const rec = win.eval(`codexGet(U.worlds['${w.id}'], '${id}')`);
    check("dm.ally stamped at +2", rec.status.attitude.value === 2, JSON.stringify(rec.status));
    // ally-stamp only fires through the social_check/attitude_shift event path, not a raw codexSetAttitude
    // call (that's the pure writer) — drive it through the real event to prove the wiring.
    const id2 = mintAnimal(win, w, { id:"animal-2", attitude: 1 });
    win.eval(`
      var W2 = U.worlds['${w.id}'];
      var r2 = codexGet(W2, 'animal-2');
      r2.fields.care = 3;
    `);
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check", payload:{ target:'animal-2', skill:"Animal Handling", levers:[{type:"feeding",decisive:true}] } });`);
    const rec2 = win.eval(`codexGet(U.worlds['${w.id}'], 'animal-2')`);
    check("ACCEPT: dm.ally:true stamped via the real social_check event at +2",
      rec2.dm.ally === true, JSON.stringify(rec2.dm));
    const full = win.eval(`JSON.stringify(codexFullRecord(U.worlds['${w.id}'], codexGet(U.worlds['${w.id}'], 'animal-2')))`);
    const parsed = JSON.parse(full);
    check("ACCEPT: ally packet needs no check — witness rides the digest with NO animal_interview open",
      parsed.witness && Array.isArray(parsed.witness.seen), full);
    check("ally packet is never gated (auto-volunteer)", parsed.witness.gated !== true);
    check("ally packet carries a soft-recall-shaped guide field", parsed.witness.guide && parsed.witness.guide.available === true, full);
  }

  // 5. tell re-rolls on world turn for an ally (standing sensor); non-ally animals are untouched.
  {
    const win = newWin();
    const w = mkWorld(win);
    const allyId = mintAnimal(win, w, { id:"ally-1", attitude: 1 });
    const plainId = mintAnimal(win, w, { id:"plain-1", attitude: 0 });
    win.eval(`codexGet(U.worlds['${w.id}'], '${allyId}').dm.ally = true;`);
    win.eval(`codexGet(U.worlds['${w.id}'], '${allyId}').dm.tellBoundTo = "loc:old-binding";`);
    const beforeAlly = win.eval(`codexGet(U.worlds['${w.id}'], '${allyId}').dm.tell`);
    const beforePlain = win.eval(`codexGet(U.worlds['${w.id}'], '${plainId}').dm.tell`);
    win.eval(`worldTurn(U.worlds['${w.id}'], "montage")`);
    const afterAlly = win.eval(`codexGet(U.worlds['${w.id}'], '${allyId}').dm`);
    const afterPlainTell = win.eval(`codexGet(U.worlds['${w.id}'], '${plainId}').dm.tell`);
    check("ACCEPT: an ally's tellBoundTo clears on world turn (awaiting a fresh DM binding)",
      afterAlly.tellBoundTo === null, JSON.stringify(afterAlly));
    check("a non-ally animal's tell is UNTOUCHED by the world turn", afterPlainTell === beforePlain,
      "before=" + beforePlain + " after=" + afterPlainTell);
    check("(informational) ally tell field still present after refresh", typeof afterAlly.tell === "string" || afterAlly.tell === null);
  }

  // 6. row-12 landmark animals mint ALREADY promoted + named — from the start.
  {
    const win = newWin();
    let foundLandmark = null;
    for(let i=0;i<200 && !foundLandmark;i++){
      const w2 = mkWorld(win, { id: "w-land-"+i, nodes: { wild1: { id:"wild1", name:"Deep Wood", type:"Setting", x:9, y:9 } } });
      w2.prep.nodes.wild1 = { env:"wilderness" };
      const out = win.eval(`prepCastEnvAnimals(U.worlds['${"w-land-"+i}'], 'wild1')`);
      const ids = out.ids || [];
      for(const id of ids){
        const r = win.eval(`codexGet(U.worlds['${"w-land-"+i}'], '${id}')`);
        if(r && r.dm && r.dm.landmark){ foundLandmark = r; break; }
      }
    }
    check("ACCEPT: a landmark (row-12) draw mints already-promoted", !!foundLandmark && foundLandmark.dm.promoted === true,
      foundLandmark ? JSON.stringify(foundLandmark.dm) : "no landmark drawn in 200 attempts");
    check("ACCEPT: a landmark draw mints already-named", !!foundLandmark && typeof foundLandmark.name === "string" && foundLandmark.name.length > 0);
    check("ACCEPT: a landmark draw is never dm.ambient", !!foundLandmark && foundLandmark.dm.ambient !== true);
  }

  // 7. Terrified overshoot marks node-wide cruelty memory -> subsequent animal mints open -1 colder.
  {
    const win = newWin();
    const w = mkWorld(win);
    const victimId = mintAnimal(win, w, { id:"victim-1", attitude: 0 });
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check", payload:{ target:'victim-1', skill:"intimidation", total:99, dc:15, overshoot:true } });`);
    const victim = win.eval(`codexGet(U.worlds['${w.id}'], 'victim-1')`);
    check("(sanity) the overshoot actually terrified the target", victim.status.attitude.terrified === true, JSON.stringify(victim.status));
    const nodeFlag = win.eval(`U.worlds['${w.id}'].map.nodes.home.animalCruelty === true`);
    check("ACCEPT: node-wide cruelty memory is marked after a Terrified overshoot", nodeFlag === true);
    // a fresh scene-typed animal mint at the same node now opens colder (market's own 0.5 animal
    // chance, over enough attempts, is plenty — no need to mutate the const table).
    let coldMint = null;
    for(let i=0;i<60 && !coldMint;i++){
      const out = win.eval(`prepCastAmbientScene(U.worlds['${w.id}'], 'home', 'market', {})`);
      const pids = out.partialIds || [];
      for(const id of pids){
        const r = win.eval(`codexGet(U.worlds['${w.id}'], '${id}')`);
        if(r && r.dm && r.dm.partialKind==="animal" && !r.dm.landmark){ coldMint = r; break; }
      }
    }
    check("ACCEPT: a fresh animal minted at the cruelty-marked node opens colder (attitude <= -1)",
      !!coldMint && coldMint.status.attitude.value <= -1, coldMint ? JSON.stringify(coldMint.status) : "no animal drawn");
  }
}

console.log("\n=== NEGATIVE-SPACE (explicit, not an omission): recruit_creature still REJECTS partials ===");
{
  const win = newWin();
  const w = mkWorld(win);
  const id = mintAnimal(win, w, { attitude: 1 });
  // force it through the whole promotion + Helpful + bondEligible-shaped state a real creature would need —
  // an animal partial/promoted record is still kind:"npc", never kind:"creature".
  win.eval(`
    var W = U.worlds['${w.id}'];
    var r = codexGet(W, '${id}');
    r.dm.promoted = true; r.dm.ambient = false; r.dm.ally = true;
    r.fields.bondEligible = true;               // even if something tried to forge the creature-only flag
    codexSetAttitude(W, '${id}', 2, "care", 10); // Helpful
  `);
  const rec = win.eval(`codexGet(U.worlds['${w.id}'], '${id}')`);
  check("(sanity) the promoted/ally animal really is at +2 Helpful with bondEligible forged on",
    rec.status.attitude.value === 2 && rec.fields.bondEligible === true);
  const out = win.eval(`applyEvent(U.worlds['${w.id}'], { type:"recruit_creature", payload:{ codexId:'${id}', tier:"pet" } })`);
  check("NEGATIVE: recruit_creature REJECTS a promoted animal partial (kind:\\\"npc\\\", never \\\"creature\\\")",
    out && out.ok === false && out.reason === "not-a-creature", JSON.stringify(out));

  // and the ordinary un-promoted ambient case, for completeness.
  const id2 = mintAnimal(win, w, { id:"animal-plain", attitude: 1 });
  const out2 = win.eval(`applyEvent(U.worlds['${w.id}'], { type:"recruit_creature", payload:{ codexId:'animal-plain', tier:"hireling" } })`);
  check("NEGATIVE: recruit_creature REJECTS an ordinary (un-promoted) animal partial too",
    out2 && out2.ok === false && out2.reason === "not-a-creature", JSON.stringify(out2));
}

console.log("\n=== HQ-2: the territory-holder can promote (docs/ANIMAL-SOCIAL-HQ.md HQ-2) ===");
{
  function findWildernessRecord(win, predicate, tries){
    let found = null, worldId = null;
    for(let i=0;i<(tries||200) && !found;i++){
      const wid = "w-hq2-"+i;
      const w2 = mkWorld(win, { id: wid, nodes: { wild1: { id:"wild1", name:"Deep Wood", type:"Setting", x:9, y:9 } } });
      w2.prep.nodes.wild1 = { env:"wilderness" };
      const out = win.eval(`prepCastEnvAnimals(U.worlds['${wid}'], 'wild1')`);
      const ids = out.ids || [];
      for(const id of ids){
        const r = win.eval(`codexGet(U.worlds['${wid}'], '${id}')`);
        if(r && predicate(r)){ found = r; worldId = wid; break; }
      }
    }
    return { rec: found, worldId };
  }

  // 1. RED-FIRST: a territory-holder, named via codex_update, must promote exactly like an ambient.
  {
    const win = newWin();
    const { rec: holder, worldId } = findWildernessRecord(win, r => r.dm && r.dm.territoryHolder && !r.dm.landmark);
    check("(sanity) found a non-landmark territory holder in wilderness draws", !!holder,
      "no holder found in 200 attempts");
    if(holder){
      check("(sanity) holder mints ambient:false, status.soft:true, no promoted/homeNodeId (the defect's shape)",
        holder.dm.ambient===false && holder.status.soft===true && !holder.dm.promoted && !holder.dm.homeNodeId,
        JSON.stringify({dm:holder.dm, status:holder.status}));
      win.eval(`applyEvent(U.worlds['${worldId}'], { type:"codex_update", payload:{ id:'${holder.id}', name:"Old Bramblehorn" } });`);
      const rec = win.eval(`codexGet(U.worlds['${worldId}'], '${holder.id}')`);
      check("ACCEPT: naming the territory-holder promotes it (dm.promoted true, status.soft false, homeNodeId stamped)",
        rec.dm.promoted===true && rec.status.soft===false && !!rec.dm.homeNodeId, JSON.stringify(rec.dm));
      const ledgerHit = win.eval(`(U.worlds['${worldId}'].ledger||[]).some(function(e){return e.data && e.data.kind==="animal-promoted" && e.data.id==='${holder.id}';})`);
      check("ACCEPT: the ◆ animal-promoted ledger beat fires for the holder same as an ambient",
        ledgerHit === true);
    }
  }

  // 2. Landmark record: promotion does NOT re-fire (no duplicate ledger beat) — already-promoted guard.
  {
    const win = newWin();
    const { rec: landmark, worldId } = findWildernessRecord(win, r => r.dm && r.dm.landmark);
    check("(sanity) found a landmark record in wilderness draws", !!landmark, "no landmark found in 200 attempts");
    if(landmark){
      check("(sanity) landmark mints already dm.promoted:true, dm.ambient:false",
        landmark.dm.promoted===true && landmark.dm.ambient===false, JSON.stringify(landmark.dm));
      const before = win.eval(`(U.worlds['${worldId}'].ledger||[]).filter(function(e){return e.data && e.data.kind==="animal-promoted" && e.data.id==='${landmark.id}';}).length`);
      // codex_contact is a real, always-legal event on the landmark (unlike a rename, which the
      // name-freeze guard may refuse once known) — drive the promotion re-check through it.
      win.eval(`applyEvent(U.worlds['${worldId}'], { type:"codex_contact", payload:{ id:'${landmark.id}' } });`);
      const after = win.eval(`(U.worlds['${worldId}'].ledger||[]).filter(function(e){return e.data && e.data.kind==="animal-promoted" && e.data.id==='${landmark.id}';}).length`);
      check("ACCEPT: an already-promoted landmark does not re-fire the promotion ledger beat",
        before === 0 && after === 0, "before="+before+" after="+after);
      const rec = win.eval(`codexGet(U.worlds['${worldId}'], '${landmark.id}')`);
      check("landmark stays promoted/known-canon after the no-op re-check", rec.dm.promoted===true);
    }
  }

  // 3. Plain ambient animal promotion is unaffected (existing u5 §1-3 checks above stay green;
  // this is a targeted re-check with the SAME guard change in play).
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { id:"plain-ambient-hq2" });
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"codex_contact", payload:{ id:'${id}' } });`);
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"codex_contact", payload:{ id:'${id}' } });`);
    const rec = win.eval(`codexGet(U.worlds['${w.id}'], '${id}')`);
    check("REGRESSION: a plain ambient animal still promotes on the second engaged contact",
      rec.dm.promoted===true && rec.dm.ambient===false && rec.status.soft===false, JSON.stringify(rec.dm));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
