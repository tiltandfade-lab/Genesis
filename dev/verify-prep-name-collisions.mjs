/* verify-prep-name-collisions.mjs — headless regression for the prep-mint name-collision fix
   (src/world/prep.js: prepNameTaken/prepCastNoDupe, wired into prepCastFrontier).

   BUG (shakedown run 2, world "Old Tide"): prepCastFrontier minted TWO codex records with the exact
   same NAME (a location "the-tide-that-stopped"/"the-tide-that-stopped-2", and the same "ornate door
   hinges" item at two locations). Root cause: prepCastId only disambiguated the codex *id* (append
   -2/-3 on collision) — it never rerolled the underlying table draw, so the same NAME survived twice
   under two different ids. Two different environments in ONE prep pass each call pbundleCast
   independently (src/engine/prep-bundle.js pbundleCast, one call per environment, no cross-env
   awareness), so the same place-master-setting/plot-item row (or just a repeated name) can be drawn
   more than once per session-prep pass.

   Fix: on a same-kind name collision against the world's LIVE codex, REROLL via the same table path
   (rollPlace/rollItem — never invent a name in code), bounded at 5 retries, before falling back to the
   id-only -N suffix. Because prepCastFrontier mints its cast SEQUENTIALLY per environment (the forEach
   in startPrep), each later environment's collision check sees every earlier environment's already-
   minted names in the same pass — closing the cross-environment dupe, not just same-call dupes.

   This harness forces the collision deterministically by stubbing Math.random to a scripted sequence:
   enough repeats of the SAME value to force the initial roll (and, in the bounded-exhaustion case, every
   retry) onto a known table row, then a different value so a reroll's fresh draw is provably distinct.

   Run: node dev/verify-prep-name-collisions.mjs   (from repo root) */
import { readFileSync } from "node:fs";
const read = p => readFileSync(p, "utf8");

const stubs = `
  var localStorage={getItem:()=>null,setItem:()=>{}};
  var U={worlds:{},activeWorldId:null,revealed:{}};
  var GS={}, SEED=1;
  function toast(){} function renderWorld(){}
`;
const files = ["tables.js","src/engine/core.js","data/names.js","src/engine/compiled.js",
  "src/engine/walk.js","src/engine/dungeon-walk.js",
  "src/engine/wild-walk.js","src/engine/quest-hook.js","src/engine/codex-roll.js","src/engine/prep-bundle.js",
  "src/world/state.js","src/world/codex.js","src/world/prep.js"];
const factory = new Function("window",
  stubs + "\n" + files.map(read).join("\n") +
  ";return { startPrep, prepOf, mapOf, ledgerOf, codexOf, codexGet, codexAdd, prepCastId, prepNameTaken, prepCastNoDupe, prepCastFrontier, rollPlace, rollItem };");
const A = factory({});

let pass=0, fail=0; const fails=[];
const ok=(c,m)=>{ if(c) pass++; else { fail++; fails.push(m); } };

function freshWorld(){
  return { id:"w1", name:"Old Tide", session:1, currentNodeId:"home",
    map:{ nodes:{ home:{id:"home",name:"Home",type:"Setting",x:0,y:0} }, edges:[] },
    ledger:[], clock:{day:1,min:600},
    characters:[{status:"living",sheet:{level:3}}],
    factions:[], pressures:[], seed:{} };
}

// a scripted Math.random sequence: `seq[i]` for the i-th call, holding the LAST entry forever once
// the sequence runs out (so tables/rollers deep in the walk/hook machinery that call Math.random far
// more times than we scripted don't crash — they just keep drawing whatever the tail value yields).
function scriptRandom(seq){
  let i=0;
  return ()=> (i<seq.length) ? seq[i++] : seq[seq.length-1];
}

// ── unit: prepNameTaken sees an existing same-kind name (case/whitespace-insensitive) ────────────
{
  const w=freshWorld();
  A.codexAdd(w, { id:"location:the-tide-that-stopped", kind:"location", name:"The Tide That Stopped", provenance:"prep" });
  ok(A.prepNameTaken(w,"location","The Tide That Stopped")===true, "prepNameTaken: exact name match");
  ok(A.prepNameTaken(w,"location","the tide that stopped")===true, "prepNameTaken: case/slug-insensitive match");
  ok(A.prepNameTaken(w,"location","Some Other Place")===false, "prepNameTaken: no false positive on a distinct name");
  ok(A.prepNameTaken(w,"npc","The Tide That Stopped")===false, "prepNameTaken: kind-scoped — a location name doesn't block an NPC");
}

// ── unit: prepCastNoDupe rerolls (bounded) until the name clears, via the SAME roller path ────────
{
  const w=freshWorld();
  A.codexAdd(w, { id:"location:the-bog-iron-camp", kind:"location", name:"The Bog-Iron Camp", provenance:"prep" });
  // place-master-setting row 1 = "The Bog-Iron Camp" (d100 total=1); row 2 = "High-Harrow Gate" (total=2).
  // Math.random()->0 forces rollExpr("d100") to total 1 every time it's asked; ->0.05 forces total 6.
  const realRandom = Math.random;
  Math.random = scriptRandom([0, 0, 0.05]);   // 1st draw collides (row1); reroll draws a fresh (different) row
  try{
    const first = A.rollPlace({ art:true });
    ok(first.name==="The Bog-Iron Camp", "fixture sanity: the forced first roll lands on the seeded collision name");
    const deduped = A.prepCastNoDupe(w, "location", first, ()=>A.rollPlace({ art:true }));
    ok(deduped.name!=="The Bog-Iron Camp", `reroll fired and produced a distinct name (got "${deduped.name}")`);
    ok(!A.prepNameTaken(w, "location", deduped.name), "the rerolled name is not itself already taken");
  } finally { Math.random = realRandom; }
}

// ── unit: prepCastNoDupe falls back to the SAME name only after exhausting bounded retries (the
//    dice-genuinely-repeated case — kept, not hidden) ──────────────────────────────────────────────
{
  const w=freshWorld();
  A.codexAdd(w, { id:"location:the-bog-iron-camp", kind:"location", name:"The Bog-Iron Camp", provenance:"prep" });
  const realRandom = Math.random;
  Math.random = scriptRandom([0]);   // EVERY draw (initial + all 5 retries) lands on row 1 — always collides
  try{
    const first = A.rollPlace({ art:true });
    let rerollCalls=0;
    const deduped = A.prepCastNoDupe(w, "location", first, ()=>{ rerollCalls++; return A.rollPlace({ art:true }); });
    ok(rerollCalls===5, `bounded at exactly 5 reroll attempts when every draw collides (got ${rerollCalls})`);
    ok(deduped.name==="The Bog-Iron Camp", "exhausted retries fall back to the last (still-colliding) honest draw — never invents a name");
  } finally { Math.random = realRandom; }
}

// ── integration: prepCastFrontier mints two frontiers whose bundles happen to roll the SAME location
//    name — assert the SECOND-minted record does not share the first's name (no same-kind name dupe
//    survives a prep pass), unlike the pre-fix behavior (prepCastId alone would mint both under
//    "location:the-bog-iron-camp" / "location:the-bog-iron-camp-2", same duplicated name). ──────────
{
  const w=freshWorld();
  const realRandom = Math.random;
  // env A's cast is rolled first with a forced collision-prone stream, then env B is rolled with a
  // stream that ALSO starts on the same colliding row (mirrors two frontiers independently drawing the
  // same place-master-setting row) before diverging so its reroll can clear.
  Math.random = scriptRandom([0, 0, 0, 0, 0]);   // env A: every relevant draw lands on row 1, no reroll needed (nothing minted yet to collide with)
  const bundleA = A.rollPlace ? null : null; // no-op placeholder (kept for readability of the staging below)
  const envA = { kind:"urban", cast: { location: A.rollPlace({ art:true }), npcs:[], item: A.rollItem({ lock:false }) } };
  Math.random = realRandom;

  A.mapOf(w).nodes["frontier-a"]={ id:"frontier-a", name:"A (rumored)", type:"Frontier", soft:true };
  A.prepOf(w).nodes["frontier-a"]={ env:"urban", idx:0, soft:true, locked:false, hook:null };
  A.prepCastFrontier(w, "frontier-a", envA);   // mints "The Bog-Iron Camp" for real, now live in the codex

  // env B: force its FIRST location draw to collide with envA's minted name, then diverge on reroll.
  Math.random = scriptRandom([0, 0, 0.05]);
  const envB = { kind:"dungeon", cast: { location: A.rollPlace({ art:true }), npcs:[], item: null } };
  Math.random = realRandom;
  ok(envB.cast.location.name==="The Bog-Iron Camp", "fixture sanity: env B's raw draw collides with env A's minted location");

  A.mapOf(w).nodes["frontier-b"]={ id:"frontier-b", name:"B (rumored)", type:"Frontier", soft:true };
  A.prepOf(w).nodes["frontier-b"]={ env:"dungeon", idx:1, soft:true, locked:false, hook:null };
  Math.random = scriptRandom([0.05]);   // prepCastFrontier's internal reroll call draws the differing row
  A.prepCastFrontier(w, "frontier-b", envB);
  Math.random = realRandom;

  const locs = Object.values(A.codexOf(w).records).filter(r=>r.kind==="location");
  ok(locs.length===2, `both frontiers minted a location record (got ${locs.length})`);
  const names = locs.map(r=>r.name);
  ok(new Set(names).size===names.length, `no two location records share a name (got: ${names.join(" | ")})`);
}

// ── integration: item dedup within a single prep pass — two frontiers whose item draw collides ────
{
  const w=freshWorld();
  const realRandom = Math.random;
  Math.random = scriptRandom([0.9]);   // plot-item row: a stable non-colliding-yet baseline draw for env A
  const itemA = A.rollItem({ lock:false });
  Math.random = realRandom;
  const envA = { kind:"urban", cast: { location:null, npcs:[], item: itemA } };
  A.mapOf(w).nodes["frontier-c"]={ id:"frontier-c", name:"C (rumored)", type:"Frontier", soft:true };
  A.prepOf(w).nodes["frontier-c"]={ env:"urban", idx:0, soft:true, locked:false, hook:null };
  A.prepCastFrontier(w, "frontier-c", envA);

  // env B's raw item draw collides with env A's now-minted item name; its internal reroll must diverge.
  Math.random = scriptRandom([0.9]);
  const itemB = A.rollItem({ lock:false });
  Math.random = realRandom;
  ok(itemB.name===itemA.name, "fixture sanity: env B's raw item draw collides with env A's minted item");

  const envB = { kind:"dungeon", cast: { location:null, npcs:[], item: itemB } };
  A.mapOf(w).nodes["frontier-d"]={ id:"frontier-d", name:"D (rumored)", type:"Frontier", soft:true };
  A.prepOf(w).nodes["frontier-d"]={ env:"dungeon", idx:1, soft:true, locked:false, hook:null };
  Math.random = scriptRandom([0.15]);   // the internal reroll's fresh draw — a different plot-item row
  A.prepCastFrontier(w, "frontier-d", envB);
  Math.random = realRandom;

  const items = Object.values(A.codexOf(w).records).filter(r=>r.kind==="item");
  ok(items.length===2, `both frontiers minted an item record (got ${items.length})`);
  const inames = items.map(r=>r.name);
  ok(new Set(inames).size===inames.length, `no two item records share a name — the collision was rerolled, not silently duplicated (got: ${inames.join(" | ")})`);
}

// ── integration: a table that GENUINELY rolls the identical item twice (bounded retries also
//    exhausted) is HONORED — kept as a real duplicate, not silently dropped or renamed in code. ──────
{
  const w=freshWorld();
  const realRandom = Math.random;
  Math.random = scriptRandom([0.9]);
  const itemA = A.rollItem({ lock:false });
  Math.random = realRandom;
  const envA = { kind:"urban", cast: { location:null, npcs:[], item: itemA } };
  A.mapOf(w).nodes["frontier-e"]={ id:"frontier-e", name:"E (rumored)", type:"Frontier", soft:true };
  A.prepOf(w).nodes["frontier-e"]={ env:"urban", idx:0, soft:true, locked:false, hook:null };
  A.prepCastFrontier(w, "frontier-e", envA);

  Math.random = scriptRandom([0.9]);   // env B's raw draw collides
  const itemB = A.rollItem({ lock:false });
  Math.random = realRandom;

  const envB = { kind:"dungeon", cast: { location:null, npcs:[], item: itemB } };
  A.mapOf(w).nodes["frontier-f"]={ id:"frontier-f", name:"F (rumored)", type:"Frontier", soft:true };
  A.prepOf(w).nodes["frontier-f"]={ env:"dungeon", idx:1, soft:true, locked:false, hook:null };
  Math.random = scriptRandom([0.9]);   // EVERY reroll attempt (all 5) also lands on the same row — genuine dice repeat
  A.prepCastFrontier(w, "frontier-f", envB);
  Math.random = realRandom;

  const items = Object.values(A.codexOf(w).records).filter(r=>r.kind==="item");
  ok(items.length===2, "a genuine dice-repeat still mints two distinct records (ids disambiguated)");
  ok(items[0].name===items[1].name, "…and BOTH keep the same rolled name — that's the dice, not a bug (never invented in code)");
  ok(items[0].id!==items[1].id, "…under distinct ids (prepCastId's -N fallback), so neither codexAdd call silently merges the other away");
}

console.log(`\n${fail===0?"✅ PASS":"❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if(fail){ for(const f of fails) console.log("   ✗ "+f); process.exit(1); }
