/* verify-capture-receipts.mjs — UNIT W6 (tier-2, engine correctness): capture-path rolls are
   under-receipted/unseeded (Site-6 self-flagged blocker #1, a SHARED engine gap, 2026-07-27).

   Bug shape: rollCapture()'s four sub-rolls (disposition/confiscation/opening/holdingNoun) picked
   through capPick(arr) -> pick(arr) -> arr[Math.floor(Math.random()*arr.length)] — a raw index draw
   that discards the die value entirely. Nothing records WHICH roll produced the noun, so a capture
   outcome can never be audited or reproduced-in-spirit the way every other rolled record in this
   engine can (world-gen's gazetteer `rolled:{table,roll,idx,...}` via rolledOf(), src/world/play.js;
   codex NPC/place mints; compiled-table rolls). Separately, `capture` was never registered in
   DM_EVENT_FIELDS (src/world/dm.js) — a "whole-payload-pass" handler exempt from dmFoldPayload's
   accept/alias/num fold — so a DM-supplied `holdingSeg` (the segment to re-enter) had NO numeric
   coercion: a JSON-plausible STRING ("2" instead of 2) silently fails applyCapture's own
   `typeof p.holdingSeg==="number"` gate and the DM's named segment is silently ignored (a fresh
   segment gets minted or a different one reused instead) — the exact HQ2-1 bug class (CLAUDE.md
   "Disciplines": normalization lives at the contract boundary, never a per-handler coercion).

   This harness proves BOTH gaps RED against the unmodified base, then (post-fix) GREEN:
     T1  rollCapture(): every one of the four sub-rolls carries a truthful {table,roll,idx} receipt
         (matches rolledOf()'s convention/field names exactly — src/world/play.js).
     T2  a DM-declared, VALID disposition override is honored verbatim and its receipt is `null`
         (no dice were rolled — matches rolledOf()'s own null-on-no-roll rule).
     T3  a DM-declared, UNKNOWN disposition id falls back to a real roll, and THAT roll DOES carry
         a receipt (the existing fallback-on-garbage behavior is preserved, now audit-visible).
     T4  a 300-roll census: roll/idx always land in-bounds and vary across the sample — proves real
         dice, never a fixed RNG position (Math.random is genuinely unseeded in this engine; the
         census checks distribution/shape only, per the no-fixed-RNG-position law).
     T5  applyCapture: the receipt bundle rides the ledger beat, `t.c.captured`, AND the return
         value — not just one of the three.
     T6  THE CONTRACT BOUNDARY: DM_EVENT_FIELDS.capture is registered (accept + num:["holdingSeg"]),
         and a STRING holdingSeg naming a REAL existing segment still routes the PC to that exact
         segment (coerced, not silently dropped) with no stray segment minted — the concrete HQ2-1
         value-moved proof (mirrors verify-event-num-fold.mjs's P1/P2 style).
     T7  drift-loudness: an unrecognized capture payload key now emits one payload-drift ledger line
         — proof the fold is actually running on capture now, not a silent bypass.
     T8  regression: captor selection / captured-condition / lever nomination / fireable disposition
         clock / the no-active-walk mint path are all unchanged by the receipt + boundary work.

   SCOPE GUARD: receipts + the contract-boundary registration only. Confiscation/item-mutation
   semantics (ITEMS Part II, founder-gated) are untouched and untested here — see docs/EVENT-
   CONTRACT.md's own note that capture's confiscation still moves gear via codex_update, unchanged.

   Boot pattern copied verbatim in shape from dev/verify-tiyl-entry.mjs (manifest.json loadOrder +
   tables.js, real jsdom, runScripts:"dangerously"); the DM_EVENT_FIELDS/DM_EVENT_TYPES/CAPTURE_*
   const-expose trick is copied from dev/verify-dm-seam.mjs + dev/verify-event-num-fold.mjs (const/
   let top-level bindings are NOT window properties under eval; only function/var are).

   Run:  node dev/verify-capture-receipts.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const srcPaths = man.loadOrder.filter((p) => p.endsWith(".js"));
// const-declared globals the harness inspects from OUTSIDE the eval scope — must be surfaced onto
// `window` explicitly (function/var declarations already land there under sloppy-mode eval; these
// four + the two DM registries do not). See file header.
const EXPOSE = ["DM_EVENT_FIELDS", "DM_EVENT_TYPES", "CAPTURE_DISPOSITIONS", "CAPTURE_HOLDING", "CAPTURE_CONFISCATION", "CAPTURE_OPENING"];

function boot(){
  const src = srcPaths.map(read).join("\n;\n");
  const expose = ";" + EXPOSE.map((n) => `try{window.${n}=${n};}catch(e){}`).join("");
  const dom = new JSDOM(
    `<!doctype html><html><body>
       <div id="bindbar" style="display:none"></div>
       <input id="worldName" value="">
       <div id="stages"></div>
       <div id="worldView"></div>
       <div id="bardoView"></div>
       <div id="toast"></div>
     </body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src + expose);
  win.saveU = () => {};
  win.renderWorld = () => {};
  win.showTab = () => {};
  win.toast = () => {};
  win.wakeReveal = () => {};
  win.pushDmLog = () => {};
  win.fetch = () => Promise.resolve({ ok:false });
  win.GS.dm = { turnId:null, pending:false, poll:null, rollReq:null, ask:null, telemetry:[], animate:false };
  return win;
}

// same shape as dev/verify-capture.mjs's proven freshWorld() — a faction web the captor-choice
// logic can rank, a living PC, and a home node startPrep/lockOnContact can hang a walk off.
function freshWorld(){
  return { id:"w1", name:"Test World", session:1, currentNodeId:"home",
    map:{ nodes:{ home:{id:"home",name:"Home",type:"Setting",x:0,y:0} }, edges:[] },
    ledger:[], clock:{day:1,min:600},
    characters:[{status:"living",name:"Wren",conditions:[],sheet:{level:4}}],
    factions:[
      {name:"Ashguild",dominant:true,agenda:"control the docks",method:"extortion",clock:{filled:4,size:6}},
      {name:"Lamplighters",agenda:"keep the peace",method:"watch",clock:{filled:0,size:6}},
    ],
    pressures:[], seed:{} };
}

function urbanWalk(win, w){
  win.startPrep(w);
  const urbanId = Object.keys(w.prep.nodes).find(id=>w.prep.nodes[id].env==="urban");
  win.lockOnContact(w, urbanId);
  return urbanId;
}

let pass=0, fail=0; const fails=[];
const check = (n,c,d="") => { if(c){ pass++; console.log("  ✓",n); } else { fail++; fails.push(n); console.log("  ✗",n,"—",d); } };

const TABLE_CONST = { disposition:"CAPTURE_DISPOSITIONS", confiscation:"CAPTURE_CONFISCATION", opening:"CAPTURE_OPENING", holdingNoun:"CAPTURE_HOLDING" };
const FIELDS = Object.keys(TABLE_CONST);

// ============================================================================
console.log("T1 rollCapture(): every sub-roll carries a truthful {table,roll,idx} receipt");
// ============================================================================
{
  const win = boot();
  const r = win.rollCapture({});
  check("r.rolled exists at all", !!r.rolled, JSON.stringify(r));
  FIELDS.forEach(f=>{
    const rec = r.rolled && r.rolled[f];
    const arr = win[TABLE_CONST[f]] || [];
    const shapeOk = !!rec && typeof rec.table==="string" && rec.table.length>0
      && Number.isInteger(rec.roll) && Number.isInteger(rec.idx)
      && rec.idx===rec.roll-1 && rec.idx>=0 && rec.idx<arr.length;
    check(`rolled.${f} is a well-formed {table,roll,idx} receipt (in-bounds, idx=roll-1)`,
      shapeOk, JSON.stringify({rec, arrLen:arr.length}));
    // the receipt must be TRUTHFUL — its idx points at the value rollCapture actually returned,
    // never a decorative/unrelated number.
    const picked = r[f];
    const atIdx = (rec && arr[rec.idx]!=null) ? arr[rec.idx] : undefined;
    const truthful = picked!=null && atIdx!=null && ((typeof picked==="string") ? picked===atIdx : picked.id===atIdx.id);
    check(`rolled.${f}.idx truthfully points at the SAME value rollCapture returned`,
      truthful, JSON.stringify({picked, atIdx}));
  });
  const tables = FIELDS.map(f=>r.rolled && r.rolled[f] && r.rolled[f].table);
  check("the four receipts use four DISTINCT table ids (never collapsed onto one name)",
    new Set(tables).size===4, JSON.stringify(tables));
}

// ============================================================================
console.log("T2 DM-declared disposition (VALID id): honored verbatim, receipt is null (no dice rolled)");
// ============================================================================
{
  const win = boot();
  const r = win.rollCapture({disposition:"execution"});
  check("disposition.id honors the DM's explicit id", r.disposition && r.disposition.id==="execution", JSON.stringify(r.disposition));
  const rec = r.rolled ? r.rolled.disposition : "MISSING-rolled-bundle";
  check("rolled.disposition is null — truthful: no roll happened, the DM declared it",
    rec===null, JSON.stringify(rec));
  // the other three fields are UNAFFECTED by the disposition override — still receipted.
  ["confiscation","opening","holdingNoun"].forEach(f=>{
    const rec2 = r.rolled && r.rolled[f];
    check(`rolled.${f} is still a real receipt (the disposition override doesn't suppress it)`,
      !!rec2 && Number.isInteger(rec2.roll), JSON.stringify(rec2));
  });
}

// ============================================================================
console.log("T3 DM-declared disposition (UNKNOWN id): falls back to a real roll WITH a receipt");
// ============================================================================
{
  const win = boot();
  const r = win.rollCapture({disposition:"not-a-real-id"});
  check("disposition falls back to a real, known id (existing fallback-on-garbage behavior)",
    r.disposition && typeof r.disposition.id==="string" && r.disposition.id!=="not-a-real-id", JSON.stringify(r.disposition));
  const rec = r.rolled && r.rolled.disposition;
  check("rolled.disposition IS a receipt this time — a real die produced the fallback",
    !!rec && typeof rec.table==="string" && Number.isInteger(rec.roll), JSON.stringify(rec));
}

// ============================================================================
console.log("T4 census (300 rolls): roll/idx stay in-range and vary — never a fixed RNG position");
// ============================================================================
{
  const win = boot();
  const N = 300;
  const stats = {}; FIELDS.forEach(f=>stats[f]={idxs:new Set(), minRoll:Infinity, maxRoll:-Infinity});
  for(let i=0;i<N;i++){
    const r = win.rollCapture({});
    FIELDS.forEach(f=>{
      const rec = r.rolled && r.rolled[f];
      if(rec){ stats[f].idxs.add(rec.idx); stats[f].minRoll=Math.min(stats[f].minRoll,rec.roll); stats[f].maxRoll=Math.max(stats[f].maxRoll,rec.roll); }
    });
  }
  FIELDS.forEach(f=>{
    const arr = win[TABLE_CONST[f]] || [];
    const s = stats[f];
    check(`${f}: ${N} rolls cover MORE THAN ONE distinct idx of ${arr.length} (real dice, not a hardcoded pick)`,
      s.idxs.size>1, `distinct idx seen=${s.idxs.size}`);
    check(`${f}: every roll stayed within [1, ${arr.length}] (no out-of-band draw)`,
      s.minRoll>=1 && s.maxRoll<=arr.length, JSON.stringify(s));
  });
}

// ============================================================================
console.log("T5 applyCapture: the receipt bundle rides the ledger beat + t.c.captured + the return value");
// ============================================================================
{
  const win = boot(); const w = freshWorld();
  const urbanId = urbanWalk(win, w);

  const cap = win.applyEvent(w, {type:"capture", payload:{}});
  check("capture applies ok", cap.ok, JSON.stringify(cap));
  check("applyCapture's return value carries .rolled", !!cap.rolled, JSON.stringify(cap.rolled));

  const beat = win.ledgerOf(w).slice().reverse().find(e=>e.data&&e.data.kind==="capture");
  check("the ledger beat's data carries .rolled", !!(beat && beat.data.rolled), JSON.stringify(beat && beat.data));
  check("ledger .rolled matches the return value's .rolled (one truth, not two)",
    !!(beat && cap.rolled && JSON.stringify(beat.data.rolled)===JSON.stringify(cap.rolled)),
    JSON.stringify({ledger:beat&&beat.data.rolled, ret:cap.rolled}));

  const pc = w.characters[0];
  check("t.c.captured carries .rolled too (the persisted capture-state stamp)",
    !!(pc.captured && pc.captured.rolled), JSON.stringify(pc.captured));
  void urbanId;
}

// ============================================================================
console.log("T6 CONTRACT BOUNDARY: DM_EVENT_FIELDS.capture registered; STRING holdingSeg still routes (HQ2-1)");
// ============================================================================
{
  const win = boot();
  const spec = win.DM_EVENT_FIELDS && win.DM_EVENT_FIELDS.capture;
  check("DM_EVENT_FIELDS.capture is registered (no longer a whole-payload-pass exemption)",
    !!spec, JSON.stringify(spec));
  check("holdingSeg is BOTH accepted AND numeric-tagged (the HQ2-1 num[] convention)",
    !!spec && (spec.accept||[]).indexOf("holdingSeg")>=0 && (spec.num||[]).indexOf("holdingSeg")>=0,
    JSON.stringify(spec));
  // the pre-existing fields must still be accepted (a registration must never narrow what already
  // worked — captorFactionId/disposition/leverId/source were all read by the handler before this
  // unit existed).
  ["captorFactionId","disposition","leverId","source"].forEach(k=>{
    check(`${k} remains an accepted field (registration doesn't regress the whole-payload-pass fields)`,
      !!spec && (spec.accept||[]).indexOf(k)>=0, JSON.stringify(spec));
  });

  const w = freshWorld();
  const urbanId = urbanWalk(win, w);
  const walk = win.walkOfFrontier(w, urbanId);
  const targetSeg = walk.segments[0].num;                 // ANY real, pre-existing segment number
  const segCountBefore = walk.segments.length;

  // THE red probe: holdingSeg supplied as a STRING (LLM-plausible JSON), naming a REAL segment.
  const cap = win.applyEvent(w, {type:"capture", payload:{ holdingSeg: String(targetSeg) }});
  check("capture{holdingSeg:STRING} still applies ok", cap.ok, JSON.stringify(cap));
  check(`capture{holdingSeg:"${targetSeg}"} (STRING) lands the PC on segment #${targetSeg} — coerced, not silently dropped`,
    cap.holdingSeg===targetSeg, `cap.holdingSeg=${JSON.stringify(cap.holdingSeg)} (expected ${targetSeg})`);
  const segCountAfter = win.walkOfFrontier(w, urbanId).segments.length;
  check("no NEW segment was minted (the DM-named one was reused, never bypassed)",
    segCountAfter===segCountBefore, `before=${segCountBefore} after=${segCountAfter}`);
}

// ============================================================================
console.log("T7 drift-loudness: an unrecognized capture payload key now emits one payload-drift ledger line");
// ============================================================================
{
  const win = boot(); const w = freshWorld();
  win.applyEvent(w, {type:"capture", payload:{ frobnicate:1 }});
  const driftLines = win.ledgerOf(w).filter(e=>e.type==="drift" && e.data && e.data.kind==="payload-drift"
    && e.data.type==="capture" && (e.data.keys||[]).indexOf("frobnicate")>=0);
  check("an unrecognized capture key fires exactly one payload-drift ledger line",
    driftLines.length===1, `driftLines=${JSON.stringify(driftLines)}`);
}

// ============================================================================
console.log("T8 regression: captor / captured-condition / lever / fireable clock / no-walk mint unchanged");
// ============================================================================
{
  const win = boot(); const w = freshWorld();
  const urbanId = urbanWalk(win, w);
  const cap = win.applyEvent(w, {type:"capture", payload:{}});
  check("captor = the faction most advanced against the PC (Ashguild 4/6)", cap.captor==="Ashguild", JSON.stringify(cap));
  check("PC gains the 'captured' condition", w.characters[0].conditions.indexOf("captured")>=0);
  check("a lever NPC is nominated and resolvable in the codex", !!(cap.leverId && win.codexGet(w, cap.leverId)));
  const tgt = win.findClockTarget(w, cap.frontId);
  check("the disposition opened a fireable front (finite clock size > 0)", !!(tgt && tgt.kind==="front" && tgt.clock.size>0), JSON.stringify(tgt));
  void urbanId;

  const w2 = freshWorld();
  const cap2 = win.applyCapture(w2, {});
  check("capture with no active walk still mints a holding walk", cap2.ok && cap2.minted, JSON.stringify(cap2));
  check("that no-walk capture ALSO carries a receipt bundle", !!cap2.rolled, JSON.stringify(cap2.rolled));
}

console.log(`\n${fail===0?"PASS":"FAIL"} — ${pass} assertions passed, ${fail} failed`);
if(fail){ for(const f of fails) console.log("   ✗ "+f); }
process.exit(fail?1:0);
