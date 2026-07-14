/* Verify CHASE-SOFT-RECALL (docs/CHASE-SOFT-RECALL.md) — an "away" chase ending must leave a codex
   handle (a hard+known npc record), not just a static ledger line (finding #7:
   dev/playtest-chase-0704-findings.md — TABLE-GAPS-070126.md §1 promised "the fled foe persists
   soft, recall fodder"; the built chase wrote only prose). jsdom over the real genesis.html modules
   (bootstrap copied verbatim from dev/verify-chase-contract.mjs — nearest sibling; it already drives
   the full combat->flee->chase flow).

   Implements the checks from CHASE-SOFT-RECALL.md "Verification" verbatim:
     1. ⊗ RED-FIRST: combat_start ONE significant foe (factionId) -> foe_morale flee -> chase_start
        -> combat_end{fled} -> chase_round quarry-wins to away. Assert a codex npc record exists:
        known+hard+condition:"fled"+at, origin "chase-escaped:"-prefixed, dm.chaseEscaped, mintQueue entry.
     2. Mook guard: same flow, a bare bestiary-name foe with no factionId/codexId -> codex record
        COUNT unchanged; chase-end ledger line still present.
     3. npcId path: chase_start{npcId:<existing codex npc>} -> away -> NO new record; existing
        record's condition "fled", at updated, touchedSeq bumped.
     4. Re-escape: check 1's quarry to away TWICE -> exactly ONE record; second away = update.
     5. chase_yield: side:"pursuer" -> mints (same asserts as 1); side:"quarry" -> no mint.
     6. Recall integration: with the escapee the only known+hard record, turnRecall(w,{}) returns it.
     7. Snapshot survival: after combat_end, GS.chase.quarry.name still reads the real name.
     8. ⊗ MUTATION: (a) stub chaseEscapeRecall to a no-op -> checks 1/5/6 red; (b) force
        significant=true unconditionally -> check 2 red. Re-apply -> green. Both runs recorded by caller.

   Run:  node dev/verify-chase-soft-recall.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

const DOM_HTML = `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div>
  <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
  </body></html>`;

function freshWin() {
  const dom = new JSDOM(DOM_HTML, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

function makeWorld(win, opts = {}) {
  const sheetOverrides = opts.sheet || {};
  const world = {
    id: "w-chase-recall", name: "The Chase Soft-Recall Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting the seam" },
            smell:{name:"smoke"}, sound:{name:"wind"}, arch:{name:"stone"},
            taboo:{name:"t",desc:"d"}, myth:{name:"m",desc:"d"} },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: Object.assign({
        species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16, dex: 12 }, mods: { str: 4, con: 3, dex: 1 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [{ id:"w1", name:"Dagger", qty:1, conditions:[] }],
        equipped: { mainHand:"w1", offHand:null, armor:null }, pools: {},
      }, sheetOverrides) }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name:"The Cartel", dominant:false, agenda:"a", method:"b", tags:[], clock:{filled:0,size:6} }],
    pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = opts.gamePanel!==undefined ? opts.gamePanel : null;
  win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.chase = null;
  return world;
}

// force a solo foe to flee via foe_morale — same deterministic recipe as verify-chase-contract.mjs
function forceSoloFlee(win, world, fid) {
  const foe = (win.GS.combat.foes || []).find(f => f.fid === fid);
  if (foe) foe.creatureType = "humanoid";
  return win.applyEvent(world, { type: "foe_morale", payload: { foe: fid, trigger: "first-blood", d20: 1, dispositionRoll: 1 } });
}

// drive an active GS.chase to the "away" end via chase_round quarry-wins (pursuerWon:false) rounds.
function driveChaseAway(win, world) {
  let guard = 0, last = null;
  while (win.GS.chase && win.GS.chase.active && guard < 20) {
    last = win.applyEvent(world, { type: "chase_round", payload: { pursuerWon: false } });
    guard++;
  }
  return last;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") => {
  if (cond) { pass++; console.log("  ✓", name); }
  else { fail++; console.log("  ✗", name, "—", detail); }
};

function codexNpcRecords(world) {
  if (!world.codex || !world.codex.records) return [];
  return Object.values(world.codex.records).filter(r => r.kind === "npc");
}

// ============================================================================
// CHECK 1 (⊗ RED-FIRST): a significant escaped quarry mints a hard+known codex record on "away"
// ============================================================================
function runCheck1() {
  const win = freshWin();
  const world = makeWorld(win);
  const r0 = win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Cartel Lookout", cr:0.25, factionId:"The Cartel" }] } });
  const fid = win.GS.combat.foes[0].fid;
  check("1a. combat_start ok", r0 && r0.ok === true, JSON.stringify(r0));
  forceSoloFlee(win, world, fid);
  const rc = win.applyEvent(world, { type: "chase_start", payload: { targetFid: fid } });
  check("1b. chase_start ok, real name", rc && rc.ok === true && rc.quarry === "Cartel Lookout", JSON.stringify(rc));
  const re = win.applyEvent(world, { type: "combat_end", payload: { outcome: "fled" } });
  check("1c. combat_end ok, GS.combat torn down", re && re.ok === true && win.GS.combat === null, JSON.stringify(re));
  check("1d. GS.chase survives combat teardown", win.GS.chase && win.GS.chase.active === true, JSON.stringify(win.GS.chase));

  const before = codexNpcRecords(world).length;
  const rr = driveChaseAway(win, world);
  check("1e. chase ended away", rr && rr.ok === true && rr.ended === true && rr.outcome === "away", JSON.stringify(rr));

  const after = codexNpcRecords(world);
  check("1f. exactly ONE new npc codex record minted", after.length === before + 1, "before="+before+" after="+after.length);
  const rec = after.find(r => r.name === "Cartel Lookout");
  check("1g. record exists named the real quarry", !!rec, JSON.stringify(after.map(r=>r.name)));
  if (rec) {
    check("1h. status known+hard, condition fled, at set", rec.status.known === true && rec.status.soft === false && rec.status.condition === "fled" && !!rec.status.at,
      JSON.stringify(rec.status));
    check("1i. origin prefixed chase-escaped:", typeof rec.origin === "string" && rec.origin.indexOf("chase-escaped:") === 0, rec.origin);
    check("1j. dm.chaseEscaped flagged", rec.dm && rec.dm.chaseEscaped === true, JSON.stringify(rec.dm));
    const mq = (world.dm && world.dm.mintQueue) || [];
    check("1k. mintQueue carries the escapee", mq.some(m => m.id === rec.id), JSON.stringify(mq));
  }
  const lastLedger = world.ledger[world.ledger.length-1];
  check("1l. chase-escaped ledger line present", lastLedger && lastLedger.data && lastLedger.data.kind === "chase-escaped", lastLedger && JSON.stringify(lastLedger.data));
  return { win, world };
}

// ============================================================================
// CHECK 2: mook guard — a generic bestiary-name foe (no factionId/codexId) mints NOTHING on away
// ============================================================================
function runCheck2() {
  const win = freshWin();
  const world = makeWorld(win);
  // "Goblin Warrior" resolves to an EXACT bestiary entry (statId:"goblin-warrior", name matches
  // BESTIARY[statId].name verbatim) with no factionId/codexId — the spec's literal "exact bestiary
  // match" mook case. A bare "Goblin" is NOT an exact key in data/bestiary.js (only compound names
  // like goblin-warrior/goblin-boss/etc exist) and falls through to the CR-band/quick-stats resolver,
  // which is a different (non-exact) resolution path than the spec's check 2 intends.
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin Warrior", cr:0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  forceSoloFlee(win, world, fid);
  win.applyEvent(world, { type: "chase_start", payload: { targetFid: fid } });
  win.applyEvent(world, { type: "combat_end", payload: { outcome: "fled" } });

  const before = codexNpcRecords(world).length;
  const rr = driveChaseAway(win, world);
  check("2a. chase ended away", rr && rr.ok === true && rr.outcome === "away", JSON.stringify(rr));
  const after = codexNpcRecords(world).length;
  check("2b. mook guard: NO new codex record for a generic bestiary-exact foe", after === before, "before="+before+" after="+after);
  const lastLedger = world.ledger[world.ledger.length-1];
  check("2c. chase-end ledger line still present (unchanged base behavior)", lastLedger && lastLedger.data && lastLedger.data.kind === "chase-end", lastLedger && JSON.stringify(lastLedger.data));
}

// ============================================================================
// CHECK 3: npcId path — an existing codex npc quarry updates in place, no new record
// ============================================================================
function runCheck3() {
  const win = freshWin();
  const world = makeWorld(win);
  const npc = win.codexAdd(world, { kind:"npc", name:"Sera the Fence", provenance:"authored",
    status:{ known:true, soft:false, at: world.currentNodeId, condition:"ok" } });
  const before = codexNpcRecords(world).length;
  const touchedBefore = npc.touchedSeq;

  const rc = win.applyEvent(world, { type: "chase_start", payload: { npcId: npc.id } });
  check("3a. chase_start via npcId ok, real name from codexGet", rc && rc.ok === true && rc.quarry === "Sera the Fence", JSON.stringify(rc));
  const rr = driveChaseAway(win, world);
  check("3b. chase ended away", rr && rr.ok === true && rr.outcome === "away", JSON.stringify(rr));

  const after = codexNpcRecords(world);
  check("3c. NO new record minted (existing npcId record updated in place)", after.length === before, "before="+before+" after="+after.length);
  const updated = win.codexGet(world, npc.id);
  check("3d. existing record condition -> fled, at updated", updated.status.condition === "fled" && !!updated.status.at, JSON.stringify(updated.status));
  check("3e. touchedSeq bumped", updated.touchedSeq > touchedBefore, "before="+touchedBefore+" after="+updated.touchedSeq);
}

// ============================================================================
// CHECK 4: re-escape — the SAME quarry escaping twice yields exactly ONE record (update, not dupe)
// ============================================================================
function runCheck4() {
  const win = freshWin();
  const world = makeWorld(win);

  // first escape
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Cartel Lookout", cr:0.25, factionId:"The Cartel" }] } });
  let fid = win.GS.combat.foes[0].fid;
  forceSoloFlee(win, world, fid);
  win.applyEvent(world, { type: "chase_start", payload: { targetFid: fid } });
  win.applyEvent(world, { type: "combat_end", payload: { outcome: "fled" } });
  driveChaseAway(win, world);
  const afterFirst = codexNpcRecords(world);
  check("4a. first escape mints one record", afterFirst.length === 1, JSON.stringify(afterFirst.map(r=>r.name)));
  const recId = afterFirst[0] && afterFirst[0].id;

  // second escape — same name/faction, resolved via origin tag (a fresh combat encounter, same foe identity)
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Cartel Lookout", cr:0.25, factionId:"The Cartel" }] } });
  fid = win.GS.combat.foes[0].fid;
  forceSoloFlee(win, world, fid);
  win.applyEvent(world, { type: "chase_start", payload: { targetFid: fid } });
  win.applyEvent(world, { type: "combat_end", payload: { outcome: "fled" } });
  driveChaseAway(win, world);

  const afterSecond = codexNpcRecords(world);
  check("4b. second escape UPDATES, does not duplicate — still exactly ONE record", afterSecond.length === 1, JSON.stringify(afterSecond.map(r=>r.name)));
  check("4c. same record id both times", afterSecond[0] && afterSecond[0].id === recId, JSON.stringify(afterSecond.map(r=>r.id)));
}

// ============================================================================
// CHECK 5: chase_yield — side:"pursuer" mints (== away); side:"quarry" (== contact) does not
// ============================================================================
function runCheck5() {
  const win = freshWin();
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Cartel Lookout", cr:0.25, factionId:"The Cartel" }] } });
  const fid = win.GS.combat.foes[0].fid;
  forceSoloFlee(win, world, fid);
  win.applyEvent(world, { type: "chase_start", payload: { targetFid: fid } });
  win.applyEvent(world, { type: "combat_end", payload: { outcome: "fled" } });

  const before = codexNpcRecords(world).length;
  const ry = win.applyEvent(world, { type: "chase_yield", payload: { side: "pursuer" } });
  check("5a. chase_yield pursuer -> outcome away", ry && ry.ok === true && ry.outcome === "away", JSON.stringify(ry));
  const after = codexNpcRecords(world);
  check("5b. chase_yield side:pursuer MINTS a record", after.length === before + 1, "before="+before+" after="+after.length);

  // side:"quarry" -> outcome contact -> no mint
  const win2 = freshWin();
  const world2 = makeWorld(win2);
  win2.applyEvent(world2, { type: "combat_start", payload: { foes: [{ name:"Cartel Lookout", cr:0.25, factionId:"The Cartel" }] } });
  const fid2 = win2.GS.combat.foes[0].fid;
  forceSoloFlee(win2, world2, fid2);
  win2.applyEvent(world2, { type: "chase_start", payload: { targetFid: fid2 } });
  win2.applyEvent(world2, { type: "combat_end", payload: { outcome: "fled" } });
  const before2 = codexNpcRecords(world2).length;
  const ry2 = win2.applyEvent(world2, { type: "chase_yield", payload: { side: "quarry" } });
  check("5c. chase_yield quarry -> outcome contact", ry2 && ry2.ok === true && ry2.outcome === "contact", JSON.stringify(ry2));
  const after2 = codexNpcRecords(world2);
  check("5d. chase_yield side:quarry (contact) does NOT mint", after2.length === before2, "before="+before2+" after="+after2.length);
}

// ============================================================================
// CHECK 6: recall integration — the escapee, being the only known+hard record, is what turnRecall draws
// ============================================================================
function runCheck6() {
  const win = freshWin();
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Cartel Lookout", cr:0.25, factionId:"The Cartel" }] } });
  const fid = win.GS.combat.foes[0].fid;
  forceSoloFlee(win, world, fid);
  win.applyEvent(world, { type: "chase_start", payload: { targetFid: fid } });
  win.applyEvent(world, { type: "combat_end", payload: { outcome: "fled" } });
  driveChaseAway(win, world);

  const drawn = win.turnRecall(world, {});
  check("6a. turnRecall returns the escapee (only known+hard record)", drawn && drawn.name === "Cartel Lookout", JSON.stringify(drawn));
}

// ============================================================================
// CHECK 7: snapshot survival — GS.chase.quarry.name reads the real name even after combat teardown
// ============================================================================
function runCheck7() {
  const win = freshWin();
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Cartel Lookout", cr:0.25, factionId:"The Cartel" }] } });
  const fid = win.GS.combat.foes[0].fid;
  forceSoloFlee(win, world, fid);
  win.applyEvent(world, { type: "chase_start", payload: { targetFid: fid } });
  check("7a. GS.chase.quarry stamped at chase_start", win.GS.chase && win.GS.chase.quarry && win.GS.chase.quarry.name === "Cartel Lookout", win.GS.chase && JSON.stringify(win.GS.chase.quarry));
  win.applyEvent(world, { type: "combat_end", payload: { outcome: "fled" } });
  check("7b. GS.chase.quarry.name survives combat teardown (GS.combat now null)", win.GS.combat === null && win.GS.chase && win.GS.chase.quarry && win.GS.chase.quarry.name === "Cartel Lookout",
    JSON.stringify({ combat: win.GS.combat, quarry: win.GS.chase && win.GS.chase.quarry }));
}

console.log("=== CHECK 1 (RED-FIRST): significant quarry mints a hard+known codex record on away ===");
runCheck1();
console.log("\n=== CHECK 2: mook guard — no mint for a generic bestiary foe ===");
runCheck2();
console.log("\n=== CHECK 3: npcId path — update in place, no new record ===");
runCheck3();
console.log("\n=== CHECK 4: re-escape — exactly one record across two aways ===");
runCheck4();
console.log("\n=== CHECK 5: chase_yield — pursuer mints, quarry does not ===");
runCheck5();
console.log("\n=== CHECK 6: recall integration ===");
runCheck6();
console.log("\n=== CHECK 7: snapshot survival ===");
runCheck7();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
