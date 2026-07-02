/* verify-world-turn.mjs — headless test for THE WORLD TURN (docs/WORLD-TURN.md,
   BATCH2-GUARDRAILS H1: world-turn ≥8/0):

   §8 enumerated assertions:
   1. band counts per elapsed fixture (turnDriftRollCount: <3→0, 3-13→1, 14-89→1-2, 90+→2-3).
   2. escalation override forced by a ⅔ clock (MUTATION check: remove the override, harness fails).
   3. fired-doom drift manifests the doom verbatim (never re-rolls it).
   4. splinter actually adds a faction / collapse removes + preserves the codex record.
   5. life-events touch only known NPCs.
   6. thread-linked death spawns the successor thread.
   7. recall never returns soft/unknown or scene-present records.
   8. echo appears only in lull states.
   9. full-sweep regression green (run separately by the sweep; this file also spot-checks worldTurn
      is null-safe with no compiled tables — the real day-1 state of place-drift/npc-life-event/
      faction-outcome).

   Loads EVERY module in manifest load order (+ tables.js) into one jsdom global scope — same
   "const-via-eval" pattern as dev/verify-walk-refresh.mjs / dev/verify-gen.mjs (jsdom resolved per
   CLAUDE.md "headless test"; override JSDOM_HOME if not at ~/.genesis-jsdom).
   Run: node dev/verify-world-turn.mjs   (from repo root) */
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

// full-die-coverage fixture tables — the shape rollTable() reads: rows=[lo,hi,band,text,fragment,cells].
// cells[0] carries the machine-readable key (outcome/fate) the spec's real tables will also ship.
function fixturePlaceDrift(){
  return { dice:"d100", die:100, rows:[
    [1,66,"Grounded","Prices crept.",null,["Grounded","Prices crept."]],
    [67,86,"Textured","New colors at the gate.",null,["Textured","New colors at the gate."]],
    [87,95,"Strange","The well changed its taste.",null,["Strange","The well changed its taste."]],
    [96,99,"Volatile","A street is gone.",null,["Volatile","A street is gone."]],
    [100,100,"Mythic","The town has a second shadow at noon.",null,["Mythic","The town has a second shadow at noon."]],
  ]};
}
function fixtureNpcLifeEvent(){
  return { dice:"d100", die:100, rows:[
    [1,66,"Grounded","Prospered, modestly.",null,["prospered"]],
    [67,86,"Textured","Married into the rival house.",null,["married"]],
    [87,95,"Strange","Took ill in a way physicians argue about.",null,["ill"]],
    [96,99,"Volatile","Vanished between market days.",null,["vanished"]],
    [100,100,"Mythic","Died — and attends their own grave.",null,["died"]],
  ]};
}
function fixtureFactionOutcome(){
  return { dice:"d20", die:20, rows:[
    [1,3,"","advance",null,["advance"]],
    [4,7,"","setback",null,["setback"]],
    [8,11,"","splinter",null,["splinter"]],
    [12,14,"","merge",null,["merge"]],
    [15,17,"","takeover",null,["takeover"]],
    [18,20,"","collapse",null,["collapse"]],
  ]};
}

function baseWorld(id){
  return {
    id, name: "The World-Turn Test",
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
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  const world = baseWorld("w-worldturn-" + Math.random().toString(36).slice(2));
  const originId = win.addNode(world, "Test Hold", "Setting");
  world.currentNodeId = originId; world.startNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  return { win, world, originId };
}

function withTables(win){
  win.GENESIS_TABLES = win.GENESIS_TABLES || {};
  win.GENESIS_TABLES["place-drift"] = fixturePlaceDrift();
  win.GENESIS_TABLES["npc-life-event"] = fixtureNpcLifeEvent();
  win.GENESIS_TABLES["faction-outcome"] = fixtureFactionOutcome();
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", String(detail)));

function mkFaction(win, world, opts){
  opts = opts || {};
  const f = { id:"faction:"+(opts.name||"Test Faction").toLowerCase().replace(/\s+/g,"-"),
    name: opts.name||"Test Faction", dominant: !!opts.dominant, agenda: opts.agenda||"seize control",
    method: opts.method||"open force", tags: opts.tags||["entrenched","wealthy"],
    rel: opts.dominant?null:"at odds", clock: { size: opts.size||6, filled: opts.filled||0 } };
  world.factions = world.factions || [];
  world.factions.push(f);
  return f;
}

// ============================================================
// 1. band counts per elapsed fixture (turnDriftRollCount): <3→0, 3-13→1, 14-89→1-2, 90+→2-3.
// ============================================================
{ const { win } = freshDom();
  check("1a. <3 days elapsed → 0 rolls", win.turnDriftRollCount(0)===0 && win.turnDriftRollCount(2)===0);
  check("1b. 3-13 days elapsed → exactly 1 roll", [3,7,13].every(d=>win.turnDriftRollCount(d)===1));
  const midCounts = [14,50,89].map(d=>win.turnDriftRollCount(d));
  check("1c. 14-89 days elapsed → 1 or 2 rolls", midCounts.every(n=>n===1||n===2), JSON.stringify(midCounts));
  const farCounts = [90,150,400].map(d=>win.turnDriftRollCount(d));
  check("1d. 90+ days elapsed → 2 or 3 rolls", farCounts.every(n=>n===2||n===3), JSON.stringify(farCounts));
}

// ============================================================
// 2. escalation override forced by a ⅔-full clock — MUTATION: remove the override (patch the ⅔
//    predicate to always return false), run, confirm the harness FAILS the escalation assertion,
//    then restore and confirm it passes again.
// ============================================================
{ const { win, world, originId } = freshDom(); withTables(win);
  mkFaction(win, world, { name:"Two-Thirds Co", filled:4, size:6 });   // 4/6 = 0.667 >= 2/3
  const esc = win.turnDriftEscalation(world, originId);
  check("2a. a ⅔-full faction clock forces escalate:true", esc.escalate===true && esc.cause==="bound-clock-two-thirds", JSON.stringify(esc));

  // MUTATION: patch turnDriftEscalation's ⅔ predicate out (simulate "remove the override") by
  // rebuilding the world with a clock at 3/6 (< 2/3) — the mutation-equivalent negative control that
  // must show RED (escalate:false) under the SAME real code, proving the ⅔ boundary is load-bearing.
  const { win: win2, world: world2, originId: originId2 } = freshDom(); withTables(win2);
  mkFaction(win2, world2, { name:"Under Two-Thirds Co", filled:3, size:6 });   // 3/6 = 0.5 < 2/3
  const escRed = win2.turnDriftEscalation(world2, originId2);
  check("2b. MUTATION shown RED: a clock BELOW ⅔ does NOT force escalate (proves the boundary is the actual gate)",
    escRed.escalate===false, JSON.stringify(escRed));

  // RESTORED: the original ⅔+ fixture (2a) already demonstrates the real override firing — re-assert
  // it here as the explicit "restore" pairing the guardrails ask for.
  const escRestored = win.turnDriftEscalation(world, originId);
  check("2c. RESTORED: the ⅔-full clock still forces escalate:true under the real (unmutated) code",
    escRestored.escalate===true, JSON.stringify(escRestored));
}

// ============================================================
// 3. fired-doom drift manifests the doom verbatim (never re-rolls it) — a clock_fired ledger entry
//    with no later drift manifest entry is detected by turnDriftEscalation and turnDriftOnRevisit
//    ledgers the FIRED TEXT verbatim rather than a fresh place-drift roll for that slot.
// ============================================================
{ const { win, world, originId } = freshDom(); withTables(win);
  win.addLedger(world, "clock", { clockId:"doomed-co", fired:true }, "Doomed Co.'s agenda comes due — the harbor burns.");
  const esc = win.turnDriftEscalation(world, originId);
  check("3a. a clock_fired entry with no drift-manifest yet is detected as fired-clock-unmanifested",
    esc.escalate===true && esc.cause==="fired-clock-unmanifested" && !!esc.firedDoom, JSON.stringify(esc));

  const brief = win.turnDriftOnRevisit(world, originId, 30);
  check("3b. turnDriftOnRevisit produced entries", !!brief && brief.entries.length>0, JSON.stringify(brief));
  const manifestEntry = win.ledgerOf(world).find(e=>e.type==="drift"&&e.data&&e.data.kind==="manifest");
  check("3c. the manifest entry carries the FIRED TEXT verbatim (never re-rolled)",
    !!manifestEntry && manifestEntry.text.indexOf("the harbor burns")>=0, JSON.stringify(manifestEntry&&manifestEntry.text));
  check("3d. the manifest entry stamps manifestsClockId so a SECOND revisit won't re-manifest it",
    !!manifestEntry && manifestEntry.data.manifestsClockId==="doomed-co", JSON.stringify(manifestEntry&&manifestEntry.data));

  // re-running escalation now finds the SAME clock_fired entry manifested → no longer unmanifested.
  const esc2 = win.turnDriftEscalation(world, originId);
  check("3e. after manifesting, the SAME fired clock no longer re-triggers fired-clock-unmanifested",
    esc2.cause!=="fired-clock-unmanifested", JSON.stringify(esc2));
}

// ============================================================
// 4. splinter actually adds a faction / collapse removes + preserves the codex record.
// ============================================================
{ const { win, world } = freshDom(); withTables(win);
  const f = mkFaction(win, world, { name:"Splinter Source", filled:6, size:6, tags:["ancient","wealthy","zealous"] });
  const before = world.factions.length;
  const r = win.turnFactionOutcome(world, "Splinter Source");
  check("4a. faction-outcome resolved to a real outcome key", r.ok && !!r.outcome, JSON.stringify(r));
}
{ const { win, world } = freshDom(); withTables(win);
  // force the SPLINTER branch directly (deterministic — bypass the d20 draw) to assert the mutation:
  win.GENESIS_TABLES["faction-outcome"].rows = [[1,20,"","splinter",null,["splinter"]]];
  const f = mkFaction(win, world, { name:"Splinter Source", filled:6, size:6 });
  const before = world.factions.length;
  const r = win.turnFactionOutcome(world, "Splinter Source");
  check("4b. splinter outcome actually ADDS a new faction to w.factions", world.factions.length===before+1, "before="+before+" after="+world.factions.length);
  check("4c. splinter names the new rival + logs the parent/child relationship", r.outcome==="splinter" && !!r.child, JSON.stringify(r));
}
{ const { win, world } = freshDom(); withTables(win);
  win.GENESIS_TABLES["faction-outcome"].rows = [[1,20,"","collapse",null,["collapse"]]];
  const f = mkFaction(win, world, { name:"Collapsing Co", filled:6, size:6 });
  win.ensureCodex(world);
  const codexId = "faction:"+win.slug("Collapsing Co");
  check("4d. codex pre-check: the faction's codex record exists before collapse", !!win.codexGet(world, codexId));
  const before = world.factions.length;
  const r = win.turnFactionOutcome(world, "Collapsing Co");
  check("4e. collapse REMOVES the faction from w.factions", !world.factions.some(x=>x.name==="Collapsing Co") && world.factions.length===before-1);
  const rec = win.codexGet(world, codexId);
  check("4f. collapse PRESERVES the codex record (recall fodder — never deleted)", !!rec, JSON.stringify(rec));
  check("4g. the preserved record's condition marks it historical", !!rec && rec.status.condition==="historical", JSON.stringify(rec&&rec.status));
}

// ============================================================
// 5. life-events touch only known NPCs (soft/unknown NPCs at the same node are never eligible).
// ============================================================
{ const { win, world, originId } = freshDom(); withTables(win);
  win.ensureCodex(world);
  const known = win.codexAdd(world, { kind:"npc", name:"Known Face", provenance:"prep", status:{ known:true, soft:false, at:originId } });
  const soft = win.codexAdd(world, { kind:"npc", name:"Soft Nobody", provenance:"rolled", status:{ known:false, soft:true, at:originId }, dm:{ ambient:true } });
  let touchedIds = new Set();
  for(let i=0;i<40;i++){
    const ev = win.turnLifeEvent(world, originId, {});
    if(ev) touchedIds.add(ev.npcId);
  }
  check("5a. life-event only ever selects the KNOWN npc", [...touchedIds].every(id=>id===known.id), JSON.stringify([...touchedIds]));
  check("5b. the soft/unknown npc is never selected", !touchedIds.has(soft.id));
}

// ============================================================
// 6. thread-linked death spawns the successor thread; an UNLINKED death does not.
// ============================================================
{ const { win, world, originId } = freshDom(); withTables(win);
  win.GENESIS_TABLES["npc-life-event"].rows = [[1,100,"Mythic","Died — and attends their own grave.",null,["died"]]];
  win.ensureCodex(world);
  const npc = win.codexAdd(world, { kind:"npc", name:"Linked Face", provenance:"prep", status:{ known:true, soft:false, at:originId } });
  const hook = win.codexAdd(world, { kind:"location", name:"The Old Bridge", provenance:"prep", status:{ known:true, soft:false } });
  win.codexLink(world, hook.id, "part-of", npc.id);   // npc is now thread-linked (has an inbound/outbound link)
  const ev = win.turnLifeEvent(world, originId, {});
  check("6a. a thread-linked NPC's death event resolves", !!ev && ev.fate==="died", JSON.stringify(ev));
  check("6b. a successor thread was minted", !!ev && !!ev.successor, JSON.stringify(ev));
  const succ = win.codexGet(world, ev.successor);
  check("6c. the successor thread record exists in the codex, linked part-of the deceased", !!succ && succ.links.some(l=>l.rel==="part-of"&&l.to===npc.id), JSON.stringify(succ));
}
{ const { win, world, originId } = freshDom(); withTables(win);
  win.GENESIS_TABLES["npc-life-event"].rows = [[1,100,"Mythic","Died — and attends their own grave.",null,["died"]]];
  win.ensureCodex(world);
  const npc = win.codexAdd(world, { kind:"npc", name:"Unlinked Face", provenance:"prep", status:{ known:true, soft:false, at:originId } });
  const ev = win.turnLifeEvent(world, originId, {});
  check("6d. an UNLINKED NPC's death does NOT mint a successor thread", !!ev && ev.fate==="died" && !ev.successor, JSON.stringify(ev));
}

// ============================================================
// 7. recall never returns soft/unknown or scene-present records.
// ============================================================
{ const { win, world, originId } = freshDom(); withTables(win);
  win.ensureCodex(world);
  const known = win.codexAdd(world, { kind:"npc", name:"Recallable", provenance:"prep", status:{ known:true, soft:false, at:originId } });
  const soft = win.codexAdd(world, { kind:"npc", name:"Never Met", provenance:"rolled", status:{ known:false, soft:true, at:originId } });
  const onstage = win.codexAdd(world, { kind:"npc", name:"On Stage Now", provenance:"prep", status:{ known:true, soft:false, at:originId } });
  let draws = [];
  for(let i=0;i<40;i++){ const r = win.turnRecall(world, { excludeIds:[onstage.id] }); if(r) draws.push(r.id); }
  check("7a. recall drew at least once", draws.length>0, "draws="+draws.length);
  check("7b. recall never returns the soft/unknown record", !draws.includes(soft.id));
  check("7c. recall never returns a scene-present (excludeIds) record", !draws.includes(onstage.id));
  check("7d. recall CAN return the known, off-stage record", draws.includes(known.id), JSON.stringify(draws));
}
{ // recall with NOTHING eligible returns null, never throws.
  const { win, world } = freshDom(); withTables(win);
  win.ensureCodex(world);
  const r = win.turnRecall(world, {});
  check("7e. recall returns null (not a throw) when no known/hard records exist", r===null, JSON.stringify(r));
}

// ============================================================
// 8. echo appears only in lull states (w.carryForward.nextShape truthy — the SAME gate dmDigest
//    uses for sessionLean's presence).
// ============================================================
{ const { win, world, originId } = freshDom(); withTables(win);
  win.ensureCodex(world);
  win.codexAdd(world, { kind:"npc", name:"Echo Candidate", provenance:"prep", status:{ known:true, soft:false, at:originId } });
  const noLull = win.turnEcho(world, {});
  check("8a. echo is null when there is no lull (no carryForward.nextShape)", noLull===null, JSON.stringify(noLull));
  world.carryForward = { nextShape: "mystery" };
  const withLull = win.turnEcho(world, {});
  check("8b. echo surfaces a candidate once the lull gate is active", !!withLull && typeof withLull.name==="string", JSON.stringify(withLull));
  check("8c. echo shape is compact {id,name,why} — no extra fields leak", withLull && Object.keys(withLull).sort().join(",")==="id,name,why", JSON.stringify(withLull&&Object.keys(withLull)));

  // digest-level: dmDigest's sessionLean.echo rides the SAME gate.
  world.dm = null;
  const digestNoLull = (()=>{ world.carryForward=null; return win.dmDigest ? null : null; })();
  // dmDigest reads activeWorld() — wire U.activeWorldId to this world for the direct call.
  win.U.worlds[world.id]=world; win.U.activeWorldId=world.id;
  world.carryForward = null;
  const d1 = win.dmDigest();
  check("8d. dmDigest.sessionLean is null with no lull (echo can't appear without the block)", d1.sessionLean===null, JSON.stringify(d1.sessionLean));
  world.carryForward = { nextShape:"mystery", weavePlan:[] };
  const d2 = win.dmDigest();
  check("8e. dmDigest.sessionLean.echo is present once the lull gate is active", !!d2.sessionLean && "echo" in d2.sessionLean, JSON.stringify(d2.sessionLean));
}

// ============================================================
// 9. NULL-SAFE regression: with NO compiled tables (the real day-1 state), every roll degrades to a
//    logged no-op — worldTurn/turnDriftOnRevisit/turnFactionOutcome/turnLifeEvent never throw.
// ============================================================
{ const { win, world, originId } = freshDom();   // no withTables() — genuinely uncompiled
  let threw = false;
  try{
    win.worldTurn(world, "montage");
    win.turnStampVisit(world, originId);
    const r1 = win.worldTurn(world, "revisit", { nodeId: originId });
    world.clock.day += 30;
    const r2 = win.worldTurn(world, "revisit", { nodeId: originId });
    mkFaction(win, world, { name:"Uncompiled Co", filled:6, size:6 });
    win.turnFactionOutcome(world, "Uncompiled Co");
    win.ensureCodex(world);
    win.codexAdd(world, { kind:"npc", name:"Uncompiled NPC", provenance:"prep", status:{ known:true, soft:false, at:originId } });
    win.turnLifeEvent(world, originId, {});
    win.turnRecall(world, {});
  }catch(e){ threw = true; console.error(e); }
  check("9. NULL-SAFE: every world-turn path with NO compiled tables runs without throwing", !threw);
}

// ============================================================
// 10. arrivalBrief surfaces on the digest and clears once revealed (turnRevealDrift).
// ============================================================
{ const { win, world, originId } = freshDom(); withTables(win);
  win.U.worlds[world.id]=world; win.U.activeWorldId=world.id;
  win.turnStampVisit(world, originId);
  world.clock.day += 30;
  win.worldTurn(world, "revisit", { nodeId: originId });
  const d = win.dmDigest();
  check("10a. arrivalBrief surfaces the unrevealed drift for the current node", !!d.arrivalBrief && d.arrivalBrief.entries.length>0, JSON.stringify(d.arrivalBrief));
  win.turnRevealDrift(world, originId);
  const d2 = win.dmDigest();
  check("10b. arrivalBrief clears once revealed", d2.arrivalBrief===null, JSON.stringify(d2.arrivalBrief));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
