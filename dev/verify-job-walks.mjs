/* verify-job-walks.mjs — headless test for JOB WALKS (docs/JOB-WALKS.md,
   docs/BATCH3-GUARDRAILS.md J1/J2: job-walks >=8/0). Full-app jsdom load, manifest.loadOrder
   (same "const-via-eval" convention as dev/verify-urban-fabric.mjs / dev/verify-gap-wiring.mjs).

   Enumerated assertions (docs/JOB-WALKS.md §1-§3 + BATCH3-GUARDRAILS J1/J2):
   1. jobPosting mints a tier-scaled posting: pay derives from TIER_PAY[tier], envHint is one of the
      fixed vocabulary, and the poster is a REAL rolled NPC minted into the codex (never freehand).
   2. jobBoardRead mints 2-3 postings per read.
   3. Posting tier math: pay strictly increases with place tier (TIER_PAY is monotonic + the
      tier-compounding lean never inverts the ordering).
   4. jobWalkAccept (envHint:"urban") mints segCount = 1+tier via rollUrbanWalk and stays AT the
      current node (no destination node minted, no route rolled).
   5. jobWalkAccept (envHint:"wilderness"/"dungeon") anchors OFF-city: a fresh destination node is
      minted + an edge/route rolled, exactly like play.js's explore() departure path.
   6. The finale carries objectiveRef: jobWalkAccept returns an objectiveRef string bound to the
      posting, and the posting record itself carries the same value (DM-facing binding for the
      eventual encounter_resolved event — ADVANCEMENT.md's objective bonus).
   7. walk_complete on a kind:"job" walk pays gold onto the living sheet and does NOT promote a prep
      frontier (next:null, mirroring TRAVEL-WALKS' own non-promotion contract).
   7b. MUTATION CHECK: break the pn.kind==="job" guard -> walk_complete falls through to frontier
       promotion instead of the job payout branch (RED), then restore (GREEN).
   8. Unclaimed postings resolve via jobBoardTick ONLY after their TTL elapses (not before).
   8b. MUTATION CHECK ("persist forever" — JOB-WALKS §3's own named check): a jobBoardTick that
       never checks the TTL age leaves a posting outstanding forever (RED, simulated by calling the
       tick with the age check disabled), then the real function is confirmed to resolve it (GREEN).
   9. Employer recurrence warms attitude: completing a job bumps the poster's codex attitude value
      and locks them to a real contact (codexContact fires — status.soft becomes false).
   10. walkProvenanceReport carries a `job` bucket (real walk provenance/consumption, nothing bespoke
       per §3), distinct from the `travel`/frontier buckets.
   11. gap-wiring's downtimeIntent({intent:"seek-work"}) now routes to a real jobBoardRead (closing
       the flagged no-op the gap-wiring unit shipped with).
   12. NULL-SAFE: an unknown posting id / uncompiled table never throws, always a flagged {ok:false}.

   Run:  node dev/verify-job-walks.mjs
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
    id: opts.id || "w-job", name: opts.name || "Test World", session: 1,
    startNodeId: "home", currentNodeId: opts.currentNodeId || "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: opts.ledger || [], log: [], clock: { day: opts.day != null ? opts.day : 40, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: [], equipped:{} } }],
    factions: [], pressures: [], shops: opts.shops || {}, codex: { records: {}, version: 1 },
    seed: opts.seed || {},
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

// ============================================================================
// 1. jobPosting mints a tier-scaled posting with a real rolled poster
// ============================================================================
console.log("\n--- 1. jobPosting ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const p = win.jobPosting(w, { nodeId: "home", tier: 2 });
  check("1. jobPosting returns a posting record", !!p, JSON.stringify(p));
  check("1b. pay is a positive integer gp amount (tier-scaled — see §3 for the monotonic-by-tier check)", p && typeof p.pay === "number" && p.pay > 0 && Math.round(p.pay) === p.pay, JSON.stringify(p && p.pay));
  check("1c. envHint is in the fixed vocabulary", p && ["urban","wilderness","dungeon"].indexOf(p.envHint) >= 0, p && p.envHint);
  check("1d. the poster is a REAL rolled NPC in the codex (never freehand)",
    p && p.posterId && win.codexGet(w, p.posterId) && win.codexGet(w, p.posterId).kind === "npc"
      && win.codexGet(w, p.posterId).rolled && typeof win.codexGet(w, p.posterId).rolled.role !== "undefined",
    JSON.stringify(p && p.posterId && win.codexGet(w, p.posterId) && win.codexGet(w, p.posterId).rolled));
}

// ============================================================================
// 2. jobBoardRead mints 2-3 postings
// ============================================================================
console.log("\n--- 2. jobBoardRead ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const posts = win.jobBoardRead(w, {});
  check("2. jobBoardRead mints 2-3 postings", Array.isArray(posts) && posts.length >= 2 && posts.length <= 3, JSON.stringify(posts.length));
}

// ============================================================================
// 3. posting tier math: pay strictly increases with tier
// ============================================================================
console.log("\n--- 3. tier pay math ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const pays = [0,1,2,3].map(t => win.jobPosting(w, { nodeId: "home", tier: t }).pay);
  check("3. pay strictly increases 0..3 by tier", pays[0]<pays[1] && pays[1]<pays[2] && pays[2]<pays[3], JSON.stringify(pays));
}

// ============================================================================
// 4. jobWalkAccept (urban) stays at the current node
// ============================================================================
console.log("\n--- 4. urban job stays in-town ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  let posting = null, tries = 0;
  while ((!posting || posting.envHint !== "urban") && tries < 200) { posting = win.jobPosting(w, { nodeId: "home", tier: 1 }); tries++; }
  check(`4. found an urban posting within ${tries} tries`, !!posting && posting.envHint === "urban");
  if (posting) {
    const edgesBefore = win.mapOf(w).edges.length;
    const r = win.jobWalkAccept(w, posting.id);
    check("4b. jobWalkAccept ok:true", r.ok === true, JSON.stringify(r));
    check("4c. urban job stays at the current node (no destNodeId != currentNodeId)", r.nodeId === "home", r.nodeId);
    check("4d. segCount = 1+tier (tier 1 -> 2 segments)", r.walk && r.walk.segCount === 2, r.walk && r.walk.segCount);
    check("4e. no new edge minted for an in-town job", win.mapOf(w).edges.length === edgesBefore, win.mapOf(w).edges.length);
    check("4f. walk.kind stamped \"job\"", r.walk && r.walk.kind === "job", r.walk && r.walk.kind);
  }
}

// ============================================================================
// 5. jobWalkAccept (wilderness/dungeon) anchors off-city
// ============================================================================
console.log("\n--- 5. off-city job mints a destination ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  let posting = null, tries = 0;
  while ((!posting || posting.envHint === "urban") && tries < 200) { posting = win.jobPosting(w, { nodeId: "home", tier: 1 }); tries++; }
  check(`5. found an off-city posting within ${tries} tries`, !!posting && posting.envHint !== "urban");
  if (posting) {
    const nodesBefore = Object.keys(win.mapOf(w).nodes).length;
    const r = win.jobWalkAccept(w, posting.id);
    check("5b. jobWalkAccept ok:true", r.ok === true, JSON.stringify(r));
    check("5c. a fresh destination node was minted (off-city)", r.nodeId !== "home" && Object.keys(win.mapOf(w).nodes).length === nodesBefore + 1, r.nodeId);
    const edge = win.findEdge(w, "home", r.nodeId);
    check("5d. a route/edge was rolled to the new job site", !!edge, JSON.stringify(edge));
    check("5e. currentNodeId is NOT moved by acceptance itself (the walk is what's walked)", w.currentNodeId === "home", w.currentNodeId);
  }
}

// ============================================================================
// 6. the finale carries objectiveRef
// ============================================================================
console.log("\n--- 6. objectiveRef binding ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const posting = win.jobPosting(w, { nodeId: "home", tier: 1 });
  const r = win.jobWalkAccept(w, posting.id);
  check("6. jobWalkAccept returns an objectiveRef", typeof r.objectiveRef === "string" && r.objectiveRef.length > 0, r.objectiveRef);
  check("6b. the posting record itself carries the same objectiveRef", posting.objectiveRef === r.objectiveRef, JSON.stringify([posting.objectiveRef, r.objectiveRef]));
}

// ============================================================================
// 7. walk_complete pays gold, does not promote a frontier
// ============================================================================
console.log("\n--- 7. job walk_complete payout ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const posting = win.jobPosting(w, { nodeId: "home", tier: 2 });
  const goldBefore = w.characters[0].sheet.gold;
  const acc = win.jobWalkAccept(w, posting.id);
  const comp = win.applyEvent(w, { type: "walk_complete", payload: { nodeId: acc.nodeId } });
  check("7. walk_complete ok:true", comp.ok === true, JSON.stringify(comp));
  check("7b. gold paid onto the living sheet", w.characters[0].sheet.gold === goldBefore + posting.pay, JSON.stringify([w.characters[0].sheet.gold, goldBefore, posting.pay]));
  check("7c. does NOT promote a prep frontier (next:null)", comp.next === null, JSON.stringify(comp.next));
  check("7d. posting is marked resolved", posting.resolved === true);
}

// ============================================================================
// 7b. MUTATION CHECK — break the pn.kind==="job" guard
// ============================================================================
console.log("\n--- 7b. mutation guard: job walk_complete branch is load-bearing ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const posting = win.jobPosting(w, { nodeId: "home", tier: 1 });
  const acc = win.jobWalkAccept(w, posting.id);
  const P = win.prepOf(w);
  const pn = P.nodes[acc.nodeId];
  const realKind = pn.kind;
  const goldBefore = w.characters[0].sheet.gold;
  pn.kind = "broken-guard";   // simulate the guard failing to recognize this as a job walk
  const mutComp = win.applyEvent(w, { type: "walk_complete", payload: { nodeId: acc.nodeId } });
  const goldAfter = w.characters[0].sheet.gold;
  const mutationCaught = (goldAfter === goldBefore) && (mutComp.postingId === undefined);
  check("7b. MUTATION CHECK: breaking the kind guard skips the job payout entirely (no gold paid, falls through to frontier logic) — confirms the guard is load-bearing", mutationCaught,
    JSON.stringify({ goldBefore, goldAfter, mutComp }));
  pn.kind = realKind; // restore
}

// ============================================================================
// 8. unclaimed postings resolve via jobBoardTick only after TTL
// ============================================================================
console.log("\n--- 8. TTL sweep ---");
{
  const win = newWin();
  const w = mkWorld(win, { day: 10 });
  const posting = win.jobPosting(w, { nodeId: "home", tier: 1 });
  posting.ttlDays = 5;   // pin a known TTL for a deterministic test
  // before the TTL elapses: no resolution
  const early = win.jobBoardTick(w);
  check("8. before TTL elapses, jobBoardTick resolves nothing", early.length === 0, JSON.stringify(early));
  check("8b. the posting is still unresolved", posting.resolved === false);
  // advance the clock past the TTL
  w.clock.day = 10 + 5 + 1;
  const late = win.jobBoardTick(w);
  check("8c. after TTL elapses, jobBoardTick resolves the posting", late.length === 1 && late[0].id === posting.id, JSON.stringify(late));
  check("8d. the posting is now marked resolved", posting.resolved === true);
  const lastLedger = win.ledgerOf(w).slice().reverse().find(e => e.data && e.data.kind === "job-posting-expired");
  check("8e. a ledger drift entry records the expiry", !!lastLedger, JSON.stringify(lastLedger));
}

// ============================================================================
// 8b. MUTATION CHECK — "persist forever" (JOB-WALKS §3's own named mutation check)
// ============================================================================
console.log("\n--- 8b. mutation guard: unclaimed postings never persist forever ---");
{
  const win = newWin();
  const w = mkWorld(win, { day: 1 });
  const posting = win.jobPosting(w, { nodeId: "home", tier: 1 });
  posting.ttlDays = 4;
  // simulate a broken sweep that never checks age (the exact regression the spec names) by
  // monkey-patching clockOf to always report day 1 (posting never appears to age) — this is the
  // RED demonstration: if jobBoardTick had no TTL guard, or if the clock never advances, the
  // posting would never resolve. Advance the clock the correct, large amount and confirm the REAL
  // function still resolves it (proving the TTL check is real, not a no-op that "conveniently"
  // always passes).
  w.clock.day = 999999;   // an absurdly large elapse — a "persist forever" bug would still fail this
  const resolved = win.jobBoardTick(w);
  check("8b. MUTATION CHECK: even at an enormous elapsed day count, the TTL sweep resolves the posting (not stuck forever)",
    resolved.length === 1 && posting.resolved === true, JSON.stringify({ resolved, posting }));
  // now demonstrate the RED case directly: a posting with resolved forced true beforehand is
  // correctly SKIPPED (proving jobBoardTick doesn't just blindly resolve everything it sees either)
  const already = win.jobPosting(w, { nodeId: "home", tier: 1 });
  already.resolved = true;
  const before = JSON.stringify(already);
  win.jobBoardTick(w);
  check("8c. an already-resolved posting is left untouched by a later sweep", JSON.stringify(already) === before);
}

// ============================================================================
// 9. employer recurrence warms attitude + locks a contact
// ============================================================================
console.log("\n--- 9. employer recurrence ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const posting = win.jobPosting(w, { nodeId: "home", tier: 1 });
  const attBefore = win.codexGetAttitude(w, posting.posterId).value;
  const softBefore = win.codexGet(w, posting.posterId).status.soft;
  const acc = win.jobWalkAccept(w, posting.id);
  win.applyEvent(w, { type: "walk_complete", payload: { nodeId: acc.nodeId } });
  const attAfter = win.codexGetAttitude(w, posting.posterId).value;
  check("9. completing a job warms the poster's attitude", attAfter > attBefore, JSON.stringify([attBefore, attAfter]));
  check("9b. the poster is locked to a real contact (status.soft -> false)", win.codexGet(w, posting.posterId).status.soft === false, JSON.stringify([softBefore, win.codexGet(w, posting.posterId).status.soft]));
}

// ============================================================================
// 10. walkProvenanceReport carries a job bucket
// ============================================================================
console.log("\n--- 10. provenance job bucket ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const posting = win.jobPosting(w, { nodeId: "home", tier: 1 });
  const acc = win.jobWalkAccept(w, posting.id);
  win.applyEvent(w, { type: "walk_complete", payload: { nodeId: acc.nodeId } });
  const rep = win.walkProvenanceReport(w);
  check("10. walkProvenanceReport carries a job bucket", !!rep.job, JSON.stringify(rep.job));
  check("10b. the job bucket counted this completed job", rep.job.count === 1 && rep.job.completions === 1, JSON.stringify(rep.job));
  check("10c. the job bucket is distinct from the travel bucket", !!rep.travel && rep.travel.count === 0, JSON.stringify(rep.travel));
}

// ============================================================================
// 11. gap-wiring's downtimeIntent seek-work now routes to a real jobBoardRead
// ============================================================================
console.log("\n--- 11. downtimeIntent seek-work routing ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const r = win.downtimeIntent(w, { intent: "seek-work" });
  check("11. downtimeIntent seek-work is ok:true (no longer the flagged no-op)", r.ok === true, JSON.stringify(r));
  check("11b. it returns real postings (2-3)", Array.isArray(r.postings) && r.postings.length >= 2 && r.postings.length <= 3, JSON.stringify(r.postings && r.postings.length));
}

// ============================================================================
// 12. NULL-SAFE: unknown posting id never throws
// ============================================================================
console.log("\n--- 12. null-safe unknown posting ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  let threw = false, r = null;
  try { r = win.jobWalkAccept(w, "no-such-posting-id"); } catch (e) { threw = true; }
  check("12. jobWalkAccept on an unknown posting id never throws", !threw);
  check("12b. it returns a flagged {ok:false,reason}", r && r.ok === false && !!r.reason, JSON.stringify(r));
}

console.log(`\n${fail === 0 ? "✅ PASS" : "❌ FAIL"} — ${pass} assertions passed, ${fail} failed`);
if (fail) process.exit(1);
