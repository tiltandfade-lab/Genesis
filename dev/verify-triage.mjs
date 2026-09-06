/* Verify the HYBRID FAST-LANE TRIAGE classifier — full-app jsdom load (spec: docs/DM-BRIDGE.md
   §"Hybrid fast-lane"). dmTriage(w,action) is PURE (reads w + GS only), so we load every module in
   real order, build worlds, and assert the lane/model/reasons verdict across the routing cases:
     - default FAST for routine beats; DEEP on new-place / combat / jeopardy / clock-due / death;
     - the lastNarratedNodeId fallback (2nd turn at a narrated node is no longer "new-place");
     - GS.combat as a forward-compatible deep signal;
     - lane stamping is wired into the turn (sendTurn sets lane/laneModel/laneReasons) via a fetch stub.

   Run:  node dev/verify-triage.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`, { runScripts: "dangerously" });
const win = dom.window;
win.eval(harness + "\n" + src);

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

check("dmTriage present after full load", typeof win.dmTriage === "function");
check("dmRoute present after full load", typeof win.dmRoute === "function");

// minimal world factory: a living PC at a node the DM has already narrated (so "new-place" is OFF by default)
const mkWorld = (over = {}) => Object.assign({
  id: "w-t", currentNodeId: "n1",
  dm: { lastNarratedNodeId: "n1" },
  characters: [{ status: "living", name: "Test", conditions: [],
                 sheet: { hp: 20, hpCur: 20 } }],
  pressures: [], factions: [],
}, over);

const T = (w, action) => win.dmTriage(w, action);
const R = (w, action, opts) => win.dmRoute(w, action, opts);

// --- EXECUTION ROUTE: conservative by default; independent from model-quality triage ---
let er=R(mkWorld(), "Show my inventory.");
check("exact inventory display → local-fact / zero model", er.mode === "local-fact" && er.localKind === "inventory" && er.modelCall === false, JSON.stringify(er));
er=R(mkWorld(), "What am I carrying right now?");
check("observed Brineglass inventory wording → local-fact / zero model", er.mode === "local-fact" && er.localKind === "inventory" && er.modelCall === false, JSON.stringify(er));
er=R(mkWorld(), "What do I have on me currently?");
check("natural exact inventory synonym → local-fact / zero model", er.mode === "local-fact" && er.localKind === "inventory" && er.modelCall === false, JSON.stringify(er));
er=R(mkWorld(), "I search my pack while the riders close in.");
check("contextual pack search remains freeform-ruling", er.mode === "freeform-ruling" && er.modelCall === true, JSON.stringify(er));
er=R(mkWorld(), "What am I carrying right now while the guard searches me?");
check("consequential inventory clause remains freeform-ruling", er.mode === "freeform-ruling" && er.modelCall === true, JSON.stringify(er));
const custodyWorld=mkWorld();
custodyWorld.itemCustody={version:2,items:{tube:{item:{id:"tube",name:"The First Answer Tube",codexId:"item:first-answer"},
  holder:{kind:"npc",ref:"npc:william",name:"William Sallow"},intent:"loan",at:{nodeId:custodyWorld.currentNodeId}}}};
er=R(custodyWorld,"Who is holding the First Answer Tube right now?");
check("exact name-matched custody query → local-fact / zero model",
  er.mode==="local-fact"&&er.localKind==="custody"&&er.localRef==="tube"&&!er.modelCall,JSON.stringify(er));
er=R(custodyWorld,"Where is the First Answer Tube now?");
check("exact item-location custody query → local-fact / zero model",
  er.mode==="local-fact"&&er.localKind==="custody"&&er.localRef==="tube"&&!er.modelCall,JSON.stringify(er));
const pluralCustody=mkWorld();
pluralCustody.itemCustody={version:2,items:{orders:{item:{id:"orders",name:"Copies of Venn’s Void Orders"},
  holder:{kind:"object",ref:"belfry",name:"the alley belfry"},intent:"place",at:{nodeId:"n1"}}}};
const pluralLine=win.dmLocalFactText(pluralCustody,{localKind:"custody",localRef:"orders"});
check("local custody text is number-neutral for plural item names",
  pluralLine==="Copies of Venn’s Void Orders — held by the alley belfry (place).",pluralLine);
custodyWorld.itemCustody.items.remote={item:{id:"remote",name:"Remote Reliquary"},
  holder:{kind:"npc",ref:"npc:far",name:"a distant keeper"},intent:"entrust",at:{nodeId:"n9"}};
const currentCustodyLine=win.dmLocalFactText(custodyWorld,{localKind:"custody"});
check("bare/current custody fact excludes remote holders while retaining here",
  /First Answer Tube/.test(currentCustodyLine)&&!/Remote Reliquary/.test(currentCustodyLine),currentCustodyLine);
const remoteCustodyLine=win.dmLocalFactText(custodyWorld,{localKind:"custody",localRef:"remote"});
check("id-addressed where-is custody fact can still retrieve a remote holder",
  /Remote Reliquary/.test(remoteCustodyLine)&&/distant keeper/.test(remoteCustodyLine),remoteCustodyLine);
er=R(custodyWorld,"Where is the First Answer Tube now that William lied to me?");
check("item-location question with consequential context remains freeform-ruling",
  er.mode==="freeform-ruling",JSON.stringify(er));
er=R(custodyWorld,"Why is William still holding the First Answer Tube?");
check("custody question with interpretive meaning remains freeform-ruling",er.mode==="freeform-ruling",JSON.stringify(er));
er=R(mkWorld(),"What are my current hit points and conditions?");
check("combined HP/conditions query is a local health fact",
  er.mode==="local-fact"&&er.localKind==="health"&&!er.modelCall,JSON.stringify(er));
er=R(mkWorld(),"What are my current hit points and conditions while the poisoner watches me?");
check("contextual HP/conditions question remains freeform-ruling",er.mode==="freeform-ruling",JSON.stringify(er));
const healthWorld=mkWorld();
healthWorld.characters[0].sheet.marks=[{text:"Your next poison save has disadvantage."}];
const healthLine=win.dmLocalFactText(healthWorld,{localKind:"health"});
check("local health text includes lasting marks without doubled punctuation",
  /20 \/ 20/.test(healthLine)&&/Conditions: none/.test(healthLine)&&!/\.\.$/.test(healthLine),healthLine);
er=R(mkWorld(), "I attack the nearest cultist.");
check("attack is not mechanized by the combat keyword list", er.mode === "freeform-ruling" && T(mkWorld(), "I attack the nearest cultist.").lane === "deep", JSON.stringify(er));
er=R(mkWorld(), "I take a short rest.");
check("exact declared rest → declared-mechanic", er.mode === "declared-mechanic" && er.mechanic && er.mechanic.payload.kind === "short", JSON.stringify(er));
er=R(mkWorld(), "I wedge the saint's jaw open with my shield.");
check("novel object use defaults to an open ruling contract", er.mode === "freeform-ruling" && er.rulingRequest && er.rulingRequest.kind === "open-intent", JSON.stringify(er));
er=R(mkWorld(), "Show my inventory.", { hidden:true });
check("hidden scene/meta turns can never be swallowed as local facts", er.mode === "freeform-ruling", JSON.stringify(er));

// --- DEFAULT FAST ---
let r = T(mkWorld(), "I walk down the lane toward the well.");
check("routine action → fast/sonnet", r.lane === "fast" && r.model === "sonnet", JSON.stringify(r));
check("routine reason tagged", r.reasons.some(x => x.startsWith("routine:")), JSON.stringify(r.reasons));

r = T(mkWorld(), "I ponder the carving for a moment.");
check("non-routine but stakes-neutral → default-fast", r.lane === "fast" && r.reasons.includes("default-fast"), JSON.stringify(r.reasons));

// --- A: NEW PLACE ---
r = T(mkWorld({ currentNodeId: "n2" }), "I look around.");   // currentNodeId !== lastNarrated
check("arrival at un-narrated node → deep (new-place)", r.lane === "deep" && r.reasons.includes("new-place"), JSON.stringify(r));
r = T(mkWorld({ currentNodeId: "n2", dm: { lastNarratedNodeId: "n2" } }), "I look around.");
check("second turn at same node → fast (lastNarratedNodeId fallback)", r.lane === "fast", JSON.stringify(r.reasons));

// --- A2: AUTHORED WALK FINALE ---
const finaleWorld=mkWorld({ prep:{ activeWalkId:"walk-finale-test", nodes:{
  "walk-finale-test":{
    cursor:{ current:3, done:false },
    walk:{ segments:[{num:1},{num:2},{num:3,isFinale:true}] },
    segments:[{ref:"S3",encounterState:"unresolved"}]
  }
}}});
r = T(finaleWorld, "I ask who hired him.");
check("unresolved authored walk finale → deep regardless of routine verb",
  r.lane === "deep" && r.reasons.includes("walk-finale"), JSON.stringify(r.reasons));
const resolvedFinaleWorld=mkWorld({ prep:{ activeWalkId:"walk-finale-test", nodes:{
  "walk-finale-test":{
    cursor:{ current:3, done:false },
    walk:{ segments:[{num:1},{num:2},{num:3,isFinale:true}] },
    segments:[{ref:"S3",encounterState:"resolved"}]
  }
}}});
r = T(resolvedFinaleWorld, "I ask what happens next.");
check("resolved walk finale releases the quality floor",
  r.lane === "fast" && !r.reasons.includes("walk-finale"), JSON.stringify(r.reasons));
const completedFinaleWorld=mkWorld({ prep:{ activeWalkId:"walk-finale-test", nodes:{
  "walk-finale-test":{
    cursor:{ current:3, done:true },
    walk:{ segments:[{num:3,isFinale:true}] },
    segments:[{ref:"S3",encounterState:"unresolved"}]
  }
}}});
r = T(completedFinaleWorld, "I ask what happens next.");
check("completed walk does not remain pinned to deep",
  r.lane === "fast" && !r.reasons.includes("walk-finale"), JSON.stringify(r.reasons));

// --- C: COMBAT ACTION ---
r = T(mkWorld(), "I attack the nearest cultist.");
check("combat verb → deep (combat-action)", r.lane === "deep" && r.model === "opus" && r.reasons.includes("combat-action"), JSON.stringify(r));
// targeted cast — single AND multi-word SRD spell names ("Fire Bolt", "Ray of Frost") must all match
r = T(mkWorld(), "I cast firebolt at the guard.");
check("cast (one word) at → deep", r.lane === "deep" && r.reasons.includes("combat-action"), JSON.stringify(r.reasons));
r = T(mkWorld(), "I cast fire bolt at the guard.");
check("cast TWO-word spell at → deep", r.lane === "deep" && r.reasons.includes("combat-action"), JSON.stringify(r.reasons));
r = T(mkWorld(), "I cast ray of frost at it.");
check("cast THREE-word spell at → deep", r.lane === "deep" && r.reasons.includes("combat-action"), JSON.stringify(r.reasons));
// idiom-dominant bare verbs were dropped → routine social/travel stays FAST
check("'strike a bargain' → fast (idiom not deep)", T(mkWorld(), "I strike a bargain with the merchant.").lane === "fast");
check("'swing by the tavern' → fast", T(mkWorld(), "I swing by the tavern.").lane === "fast");
check("'loose the strap' → fast", T(mkWorld(), "I loose the strap on my pack.").lane === "fast");

// HQ3-B4 — negation-scoping: a combat verb immediately preceded (within a small window) by a
// negator does not raise combat-action (SET-12-F1: "I make no move" / "I do NOT attack" cost
// false-positives). Real un-negated verbs, and the cast-at branch, must stay unaffected.
check("'I make no move toward him' → no combat-action (negated verb)",
  !T(mkWorld(), "I make no move toward him.").reasons.includes("combat-action"),
  JSON.stringify(T(mkWorld(), "I make no move toward him.").reasons));
check("'I do not attack anyone' → no combat-action (negated verb)",
  !T(mkWorld(), "I do not attack anyone.").reasons.includes("combat-action"),
  JSON.stringify(T(mkWorld(), "I do not attack anyone.").reasons));
check("'I lunge and stab the guard' → still combat-action (real attack unaffected)",
  T(mkWorld(), "I lunge and stab the guard.").reasons.includes("combat-action"),
  JSON.stringify(T(mkWorld(), "I lunge and stab the guard.").reasons));
check("'cast fire bolt at the wolf' → still combat-action (cast-at branch unaffected)",
  T(mkWorld(), "cast fire bolt at the wolf").reasons.includes("combat-action"),
  JSON.stringify(T(mkWorld(), "cast fire bolt at the wolf").reasons));
check("violence nouns with no verb never trip combat-action (unchanged; verb-only regex)",
  !T(mkWorld(), "He called me a saboteur and shook a knife.").reasons.includes("combat-action"),
  JSON.stringify(T(mkWorld(), "He called me a saboteur and shook a knife.").reasons));

// --- B: GS.combat forward-compat ---
win.GS.combat = { round: 1 };
r = T(mkWorld(), "I take a breath.");
check("GS.combat set → deep (combat-active)", r.lane === "deep" && r.reasons.includes("combat-active"), JSON.stringify(r));
win.GS.combat = null;
r = T(mkWorld(), "I take a breath.");
check("GS.combat cleared → back to fast", r.lane === "fast", JSON.stringify(r.reasons));

// --- D: JEOPARDY ---
r = T(mkWorld({ characters: [{ status: "living", conditions: [], sheet: { hp: 20, hpCur: 0 } }] }), "I crawl behind the pillar.");
check("downed PC → deep (pc-downed)", r.lane === "deep" && r.reasons.includes("pc-downed"), JSON.stringify(r));
r = T(mkWorld({ characters: [{ status: "living", conditions: [], sheet: { hp: 20, hpCur: 4 } }] }), "I sip my drink.");
check("PC under a quarter HP → deep (pc-bloodied)", r.lane === "deep" && r.reasons.includes("pc-bloodied"), JSON.stringify(r));
r = T(mkWorld({ characters: [{ status: "living", conditions: ["unconscious"], sheet: { hp: 20, hpCur: 12 } }] }), "...");
check("dire condition → deep (pc-condition)", r.lane === "deep" && r.reasons.includes("pc-condition"), JSON.stringify(r));

// --- E: CLOCK DUE ---
r = T(mkWorld({ pressures: [{ closed: false, clock: { filled: 4, size: 4 } }] }), "I order another ale.");
check("full doom clock → deep (clock-due)", r.lane === "deep" && r.reasons.includes("clock-due"), JSON.stringify(r));
r = T(mkWorld({ pressures: [{ closed: true, clock: { filled: 4, size: 4 } }] }), "I order another ale.");
check("CLOSED full clock → does not deep-lane", r.lane === "fast", JSON.stringify(r.reasons));
r = T(mkWorld({ pressures: [{ closed: false, clock: { filled: 2, size: 4 } }] }), "I order another ale.");
check("half-full clock → fast", r.lane === "fast", JSON.stringify(r.reasons));

// --- E2: TYPED PENDING SITUATION ---
r = T(mkWorld({dm:{lastNarratedNodeId:"n1",pendingSituation:{kind:"rest-risk",effect:{kind:"tracking-mark"}}}}),
  "I examine the chalk mark beside my bedroll.");
check("typed pending rest consequence → deep (pending-situation)",
  r.lane==="deep"&&r.reasons.includes("pending-situation"),JSON.stringify(r.reasons));

// --- F: DEATH ---
r = T(mkWorld({ characters: [{ status: "dead" }] }), "...");
check("no living PC → deep (no-living-pc)", r.lane === "deep" && r.reasons.includes("no-living-pc"), JSON.stringify(r));

const critTriage=win.dmTriage(mkWorld(),"(I roll Stealth: 23)",[
  {label:"Stealth",result:20,total:23},
  {label:"crit-magnitude",result:18,total:18,crit:{natural:20,magnitude:18,tier:"amplified-major"}}
]);
check("an open crit-magnitude follow-up receives the deep reasoning lane",
  critTriage.lane==="deep"&&critTriage.model==="opus"&&critTriage.reasons.includes("crit-magnitude:amplified-major"),
  JSON.stringify(critTriage));

// --- local-fact wiring: no digest and no provider transport ---
(() => {
  const w=mkWorld({name:"Local Fact World"});
  w.characters[0].sheet.inventory=[{id:"it-1",name:"Rope",qty:1}];
  w.characters[0].sheet.gold=7;
  win.U.worlds[w.id]=w; win.U.activeWorldId=w.id;
  let digests=0, providerPosts=0;
  win.dmDigest=()=>{digests++;return {};}; win.renderWorld=()=>{}; win.saveU=()=>{}; win.pushDmLog=()=>{};
  win.fetch=(url)=>{ if(/\/(?:turn|seat)$/.test(String(url))) providerPosts++;
    return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve({})}); };
  win.sendTurn("Show my inventory.",[]);
  check("local-fact sendTurn builds no digest", digests===0, `digests=${digests}`);
  check("local-fact sendTurn calls neither provider transport", providerPosts===0, `providerPosts=${providerPosts}`);
})();

// --- stamping wired into sendTurn (stub fetch, capture the posted turn body) ---
(() => {
  const w = mkWorld({ name: "Stamp World" });
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  // isolate the stamping path: stub the heavy side-effects (digest/render/persist) so the test
  // exercises sendTurn's lane wiring, not the full digest/render stack (covered by verify-dm-events).
  win.dmDigest = () => ({}); win.renderWorld = () => {}; win.saveU = () => {}; win.pushDmLog = () => {};
  let captured = null;
  win.fetch = (url, opt) => {
    if (String(url).endsWith("/turn")) { try { captured = JSON.parse(opt.body); } catch {} return Promise.resolve({ ok: true, json: () => Promise.resolve({ turnId: captured && captured.turnId }) }); }
    return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve({}) });
  };
  try {
    win.sendTurn("I attack the watchman.", []);
    check("sendTurn stamps lane onto the turn", captured && captured.lane === "deep" && captured.laneModel === "opus",
          JSON.stringify(captured && { lane: captured.lane, laneModel: captured.laneModel, laneReasons: captured.laneReasons }));
  } catch (e) {
    check("sendTurn stamps lane onto the turn", false, "threw: " + e.message);
  }
})();

// --- applyResponse defers lastNarratedNodeId while a rollRequest is pending (first-contact stays deep) ---
(() => {
  const w = mkWorld({ currentNodeId: "n2", dm: { lastNarratedNodeId: "n1" } });
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  // stub the side-effects so applyResponse exercises only the marker logic
  win.pushDmLog = () => {}; win.saveU = () => {}; win.renderWorld = () => {};
  win.postState = () => {}; win.wakeReveal = () => {}; win.applyEvent = () => ({});
  win.GS.dm = win.GS.dm || {};

  // turn 1: DM hands back a rollRequest on arrival → scene NOT delivered → marker must NOT advance
  win.applyResponse({ narration: "You crest the ridge. Roll Perception.", rollRequest: { skill: "Perception" } });
  check("rollRequest-only response does NOT advance lastNarratedNodeId", w.dm.lastNarratedNodeId === "n1",
        "got " + w.dm.lastNarratedNodeId);
  check("→ so the roll-submit turn still deep-lanes the arrival", T(w, "(I roll Perception: 14)").reasons.includes("new-place"),
        JSON.stringify(T(w, "x").reasons));

  // turn 2: DM delivers the reveal with no pending roll → marker advances → node now 'narrated'
  win.applyResponse({ narration: "The watchtower stands gutted, ravens on its lintel." });
  check("settled response advances lastNarratedNodeId", w.dm.lastNarratedNodeId === "n2", "got " + w.dm.lastNarratedNodeId);
  check("→ next turn at the narrated node is fast", T(w, "I look around.").lane === "fast", JSON.stringify(T(w, "x").reasons));
})();

console.log(`\n${fail ? "✗" : "✓"} triage: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
