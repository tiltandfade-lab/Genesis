/* Verify ROLL-BRANCHES (docs/ROLL-BRANCHES.md) — the check resolves the moment the dice land.
   Spec build plan steps 1-4 + §5 assertions + BATCH-GUARDRAILS G3's worked example.

   Loads EVERY module in manifest load order into one jsdom global scope (the same "const-via-eval"
   pattern as verify-dm-events.mjs — classic <script> top-level const/function need one shared eval).
   Drives dmRollFor() end-to-end with a stubbed rollDie (deterministic dice) and a stubbed fetch (no
   real network — the branch path must never reach sendTurn/fetch at all; the live-flow fallback paths
   DO call sendTurn, so fetch is stubbed to resolve harmlessly rather than throw).

   Run:  node dev/verify-roll-branches.mjs
   (jsdom resolved per CLAUDE.md "headless test" — override JSDOM_HOME if not at ~/.genesis-jsdom.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const srcText = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshDom() {
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  // stub the network — the branch path must NEVER call fetch; the live-flow fallback paths (nat20/1,
  // missing branch, un-branched) DO call sendTurn→fetch, so it must resolve harmlessly rather than hang
  // or throw (no real dm-bridge.py in this harness).
  // §5 assertion 1 means "0 TURNS posted" — resolveBranch still calls postState() (a /state snapshot,
  // per §2 step 4 "saveU, postState"), so count /turn posts specifically, not every fetch.
  let turnCalls = 0;
  win.fetch = (url) => { if (String(url).includes("/turn")) turnCalls++; return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }); };
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);   // diceOverlay's board theater — not under test here
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  const world = {
    id: "w-branch", name: "The Branch Test",
    seed: { master: { name: "Test Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
            taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" } },
    characters: [{ status: "living", name: "Tester", headline: "a climber", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Folk Hero", level: 3, hp: 20, hpCur: 20, ac: 15,
               profBonus: 2, scores: {}, mods: { str: 2, dex: 1 }, saveProfs: [], skillProfs: ["Athletics"] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [], revealed: {}, dmlog: [],
  };
  const originId = win.addNode(world, "Test Hold", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  return { win, world, turnCalls: () => turnCalls };
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const branchedRQ = () => ({
  skill: "Athletics", ability: "str", dc: 13, dcHidden: true,
  branches: {
    success:  { narration: "You haul yourself over the lip.", events: [{ type: "hp_changed", payload: { delta: 0 } }] },
    nearMiss: { narration: "Your fingers catch — barely; the ledge crumbles behind you.", events: [{ type: "hp_changed", payload: { delta: -1 } }] },
    fail:     { narration: "The wall sheds you; the fall bites.", events: [{ type: "hp_changed", payload: { delta: -5 } }] },
  },
});

// force a specific d1 (and, for adv/disadv, d2) out of rollDie — dmRollFor calls rollDie(20) once (or
// twice under adv/disadv); we don't use adv/disadv here so a simple FIFO queue suffices.
function withDie(win, val) { win.rollDie = () => val; }

// === 1. success → success narration, 0 turns posted, events applied source:"branch" ===
{ const { win, world, turnCalls } = freshDom();
  win.GS.dm.rollReq = branchedRQ();
  const hpBefore = world.characters[0].sheet.hpCur;   // HOTFIX-QUEUE-2026-07-06 H6 #1: assert the VALUE moved
  withDie(win, 16);   // 16 + str(2) + prof(2, Athletics proficient) = 20 vs dc 13 → margin +7 → success
  win.dmRollFor("Athletics", "str", null);
  const log = win.dmLogOf(world);
  const last = log[log.length - 1];
  check("success: DM-voice entry rendered", last.role === "dm" && /haul yourself over the lip/.test(last.text), last.text);
  check("success: branchResolved marker set", last.branchResolved === true);
  check("success: 0 turns posted (/turn never called)", turnCalls() === 0, `/turn called ${turnCalls()}x`);
  check("success: event applied with source:'branch'", last.events[0].source === "branch", JSON.stringify(last.events));
  check("success: every branch event actually APPLIED (ok:true, no silent no-op)",
        Array.isArray(last.applied) && last.applied.length > 0 && last.applied.every(a => a.res && a.res.ok === true),
        JSON.stringify(last.applied));
  check("success: GS.dm.rollReq cleared", win.GS.dm.rollReq === null);
  check("success: lastResolution stamped on w.dm", world.dm && world.dm.lastResolution && world.dm.lastResolution.branch === "success",
        JSON.stringify(world.dm && world.dm.lastResolution));
  check("success: hp unchanged (delta 0 — the VALUE, not just the label)", world.characters[0].sheet.hpCur === hpBefore,
        `hpBefore=${hpBefore} hpCur=${world.characters[0].sheet.hpCur}`); }

// === 2. margin ladder → nearMiss (miss by 1-2) vs fail (miss by 3+) — the TIGHT grace ===
{ const { win, world } = freshDom();
  win.GS.dm.rollReq = branchedRQ();
  const hpBefore = world.characters[0].sheet.hpCur;   // HOTFIX-QUEUE-2026-07-06 H6 #1
  withDie(win, 9);   // 9+2+2 = 13... need a MISS: use die 7 → 7+2+2=11 vs dc13 → margin -2 → nearMiss
  win.rollDie = () => 7;
  win.dmRollFor("Athletics", "str", null);
  let last = win.dmLogOf(world)[win.dmLogOf(world).length - 1];
  check("miss by 2 → nearMiss branch fires", last.branchResolved && /fingers catch/.test(last.text), last.text);
  check("miss by 2 → lastResolution.branch === 'nearMiss'", world.dm.lastResolution.branch === "nearMiss", world.dm.lastResolution.branch);
  check("miss by 2 → hp dropped by exactly 1 (the VALUE moved)", world.characters[0].sheet.hpCur === hpBefore - 1,
        `hpBefore=${hpBefore} hpCur=${world.characters[0].sheet.hpCur}`);
}
{ const { win, world } = freshDom();
  win.GS.dm.rollReq = branchedRQ();
  const hpBefore = world.characters[0].sheet.hpCur;   // HOTFIX-QUEUE-2026-07-06 H6 #1
  win.rollDie = () => 4;   // 4+2+2=8 vs dc13 → margin -5 → fail (miss by 3+ — never a near-thing)
  win.dmRollFor("Athletics", "str", null);
  const last = win.dmLogOf(world)[win.dmLogOf(world).length - 1];
  check("miss by 5 → fail branch fires (NOT nearMiss)", last.branchResolved && /wall sheds you/.test(last.text), last.text);
  check("miss by 5 → lastResolution.branch === 'fail'", world.dm.lastResolution.branch === "fail", world.dm.lastResolution.branch);
  check("fail: fail-branch events applied ok (no invalid-envelope)",
        Array.isArray(last.applied) && last.applied.every(a => a.res && a.res.ok === true),
        JSON.stringify(last.applied));
  check("miss by 5 → hp dropped by exactly 5 (the VALUE moved)", world.characters[0].sheet.hpCur === hpBefore - 5,
        `hpBefore=${hpBefore} hpCur=${world.characters[0].sheet.hpCur}`);
}

// === 2b. MUTATION CHECK — widen the near-miss grace in checkDegree; harness must go RED, then restore ===
{
  const original = read("src/engine/check.js");
  const widened = original.replace('if(margin >= -2)   return "near-miss";', 'if(margin >= -5)   return "near-miss";');
  if (widened === original) { fail++; console.log("  ✗ mutation check: pattern to widen not found in check.js (spec drifted?)"); }
  else {
    const mutatedSrc = man.loadOrder.filter((p) => p.endsWith(".js"))
      .map((p) => p === "src/engine/check.js" ? widened : read(p)).join("\n;\n");
    const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
    const win = dom.window;
    win.eval(harness + "\n" + mutatedSrc);
    win.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
    win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
    win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
    const world = { id: "w-mut", name: "Mut", seed: { master:{name:"m",desc:"d"},smell:{name:"s"},sound:{name:"s"},arch:{name:"a"},taboo:{name:"t",desc:"d"},myth:{name:"m",desc:"d"} },
      characters: [{ status: "living", name: "Tester", headline: "h", pronouns: "they",
        sheet: { species: "Human", class: "Fighter", background: "b", level: 3, hp: "20/20", ac: 15, profBonus: 2, scores:{}, mods: { str: 2 }, saveProfs: [], skillProfs: ["Athletics"] } }],
      gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1, map: { nodes: {}, edges: [] }, currentNodeId: null,
      factions: [], pressures: [], revealed: {}, dmlog: [] };
    const originId = win.addNode(world, "Mut", "Setting"); world.currentNodeId = originId;
    win.U.worlds[world.id] = world; win.U.activeWorldId = world.id;
    win.GS.dm.rollReq = branchedRQ();
    win.rollDie = () => 4;   // margin -5 — under the REAL ladder this is "fail"; under the WIDENED (mutated) ladder it's "near-miss"
    win.dmRollFor("Athletics", "str", null);
    const last = win.dmLogOf(world)[win.dmLogOf(world).length - 1];
    const mutationShowsRed = last.branchResolved && /fingers catch/.test(last.text);   // if TRUE, the mutated ladder wrongly graced a -5 as nearMiss
    check("MUTATION (shown RED then restored): widened near-miss grace flips a -5 miss to nearMiss — guard proven load-bearing",
      mutationShowsRed, mutationShowsRed ? "confirmed RED under mutation, as expected" : "guard did not move — check.js wiring may have changed");
  }
  // "restore" — nothing was ever written to disk; the mutated source only existed in the in-memory string above.
}

// === 3. nat 20 / nat 1 → NO local resolve; rides the next turn (today's flow), branches present or not ===
{ const { win, world, turnCalls } = freshDom();
  win.GS.dm.rollReq = branchedRQ();
  win.rollDie = () => 20;
  win.dmRollFor("Athletics", "str", null);
  check("nat 20 with branches present → falls through to live flow (fetch called)", turnCalls() === 1, `fetch called ${turnCalls()}x`);
  const log = win.dmLogOf(world);
  check("nat 20 → no branch-resolved DM entry appended locally", !log.some((m) => m.branchResolved)); }
{ const { win, world, turnCalls } = freshDom();
  win.GS.dm.rollReq = branchedRQ();
  win.rollDie = () => 1;
  win.dmRollFor("Athletics", "str", null);
  check("nat 1 with branches present → falls through to live flow (fetch called)", turnCalls() === 1, `fetch called ${turnCalls()}x`);
}

// === 3b. BUG-08 regression: the nat-20/1 FALL-THROUGH clears the persisted w.dm.rollReq ITSELF.
// sendTurn also clears it (dm.js ~409), which MASKS the bug in-process — stub sendTurn so the
// harness measures dmRollFor's own clear (the throw/process-boundary window Run 2 actually hit). ===
{ const { win, world } = freshDom();
  win.eval('sendTurn=function(){return Promise.resolve("t-stub");}');
  const rq = branchedRQ();
  win.GS.dm.rollReq = rq;
  world.dm = world.dm || {}; world.dm.rollReq = rq;   // mimic applyResponse's persistence, as test 8 does
  win.rollDie = () => 20;
  win.dmRollFor("Athletics", "str", null);
  check("nat 20 fall-through clears the persisted w.dm.rollReq (BUG-08)", world.dm.rollReq === null, JSON.stringify(world.dm.rollReq));
  check("nat 20 fall-through clears GS.dm.rollReq", win.GS.dm.rollReq === null);
  // HQ3-D3: the persistence half — {action,rolls} must survive as w.dm.pendingRoll, not just live in
  // this call's sendTurn payload (sendTurn is stubbed above so nothing but dmRollFor itself can set it).
  check("nat 20 fall-through persists w.dm.pendingRoll as a non-null object", world.dm.pendingRoll && typeof world.dm.pendingRoll === "object", JSON.stringify(world.dm.pendingRoll));
  check("persisted pendingRoll carries action", world.dm.pendingRoll && typeof world.dm.pendingRoll.action === "string", JSON.stringify(world.dm.pendingRoll));
  check("persisted pendingRoll carries rolls", world.dm.pendingRoll && Array.isArray(world.dm.pendingRoll.rolls) && world.dm.pendingRoll.rolls.length > 0, JSON.stringify(world.dm.pendingRoll));
  // a delivered response (applyResponse's w.dm rebuild) is the natural clear point — drive the REAL
  // applyResponse runtime (a bare turn, no rollRequest) and assert the carried pendingRoll is gone.
  win.applyResponse({ turnId: "t-followup", narration: "", events: [] });
  check("a delivered applyResponse clears the carried pendingRoll", world.dm.pendingRoll === null, JSON.stringify(world.dm.pendingRoll));
}

// === 4. missing branch key → fall-through rules ===
{ // missing nearMiss key → falls to fail's branch
  const { win, world } = freshDom();
  const rq = branchedRQ(); delete rq.branches.nearMiss;
  win.GS.dm.rollReq = rq;
  win.rollDie = () => 7;   // margin -2 → nearMiss key, but it's ABSENT → falls to fail's branch
  win.dmRollFor("Athletics", "str", null);
  const last = win.dmLogOf(world)[win.dmLogOf(world).length - 1];
  check("missing nearMiss key → falls to fail's branch", last.branchResolved && /wall sheds you/.test(last.text), last.text);
}
{ // missing needed branch entirely (no success branch at all, and roll is a success) → live flow
  const { win, world, turnCalls } = freshDom();
  const rq = branchedRQ(); delete rq.branches.success;
  win.GS.dm.rollReq = rq;
  win.rollDie = () => 16;   // margin +7 → success key, but it's ABSENT → nothing declared → live flow
  win.dmRollFor("Athletics", "str", null);
  check("missing needed branch entirely → falls through to live flow", turnCalls() === 1, `fetch called ${turnCalls()}x`);
  check("missing needed branch → no local branch-resolved entry", !win.dmLogOf(world).some((m) => m.branchResolved));
}

// === 5. malformed branches (no dc / bad shape) → stripped to bare rollRequest, check still works ===
{ const { win } = freshDom();
  const bad1 = { skill: "Athletics", ability: "str", branches: { success: { narration: "x", events: [] } } };   // no dc
  const stripped1 = win.sanitizeRollRequest(bad1);
  check("malformed (no dc) → branches stripped, bare rollRequest survives", !stripped1.branches && stripped1.skill === "Athletics", JSON.stringify(stripped1));
  const bad2 = { skill: "Athletics", dc: 13, branches: "not-an-object" };
  const stripped2 = win.sanitizeRollRequest(bad2);
  check("malformed (branches not an object) → stripped", !stripped2.branches, JSON.stringify(stripped2));
  const bad3 = { skill: "Athletics", dc: 13, branches: { nearMiss: { narration: "n" } } };   // no success branch
  const stripped3 = win.sanitizeRollRequest(bad3);
  check("malformed (no success branch) → stripped", !stripped3.branches, JSON.stringify(stripped3));
  const ok = { skill: "Athletics", dc: 13, branches: { success: { narration: "ok" } } };   // events missing on the branch itself — repaired, not stripped
  const repaired = win.sanitizeRollRequest(ok);
  check("individually malformed branch (missing events) is REPAIRED, not stripped wholesale",
    !!repaired.branches && Array.isArray(repaired.branches.success.events) && repaired.branches.success.events.length === 0, JSON.stringify(repaired)); }

// === 6. next sendTurn carries lastResolution once, then clears ===
{ const { win, world } = freshDom();
  win.GS.dm.rollReq = branchedRQ();
  win.rollDie = () => 16;   // success
  win.dmRollFor("Athletics", "str", null);
  check("lastResolution present on w.dm after a branch resolve", world.dm.lastResolution && world.dm.lastResolution.skill === "Athletics");
  let capturedTurn = null;
  win.fetch = (url, opts) => { capturedTurn = JSON.parse(opts.body); return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }); };
  win.dmSend("I look around.");
  check("next sendTurn carries lastResolution top-level", capturedTurn && capturedTurn.lastResolution && capturedTurn.lastResolution.branch === "success", JSON.stringify(capturedTurn && capturedTurn.lastResolution));
  check("lastResolution cleared on w.dm after riding one turn", world.dm.lastResolution === null); }

// === 7. rollRequest.dice ignores branches (never branches — no DC, nothing to resolve against) ===
{ const { win } = freshDom();
  const diceRQ = { dice: "2d6+3", label: "fire damage", branches: { success: { narration: "n", events: [] } } };
  const sanitized = win.sanitizeRollRequest(diceRQ);
  check("dice request strips any stray branches key (never branches)", !sanitized.branches && sanitized.dice === "2d6+3", JSON.stringify(sanitized)); }

// === 8. regression: resolveBranch clears the PERSISTED w.dm.rollReq too — render.js's re-hydration
// guard (`if(GS.dm.rollReq==null&&w.dm.rollReq) GS.dm.rollReq=w.dm.rollReq;`) must not resurrect a
// resolved branch's roll prompt on the next renderWorld() (the bug: only GS.dm.rollReq was cleared,
// leaving the stale w.dm.rollReq to re-hydrate and re-fire the branch on every render). ===
{ const { win, world } = freshDom();
  const rq = branchedRQ();
  win.GS.dm.rollReq = rq;
  world.dm = world.dm || {};
  world.dm.rollReq = rq;   // mimic applyResponse's persistence (dm.js:253) — a real app has this set BEFORE dmRollFor runs
  win.rollDie = () => 16;   // success
  win.dmRollFor("Athletics", "str", null);
  check("resolveBranch clears the persisted w.dm.rollReq", world.dm.rollReq === null, JSON.stringify(world.dm.rollReq));
  win.GS.dm.rollReq = null;   // simulate a fresh render pass where GS was reset (e.g. page reload) but w.dm persisted
  win.renderWorld();
  check("renderWorld() does not re-hydrate a resolved branch's rollReq from w.dm", win.GS.dm.rollReq === null, JSON.stringify(win.GS.dm.rollReq));
}

// regression: un-branched rollRequest behaves byte-identically to today (falls straight to sendTurn)
{ const { win, world, turnCalls } = freshDom();
  win.GS.dm.rollReq = { skill: "Athletics", ability: "str", dcHidden: true };   // no branches at all — today's shape
  win.rollDie = () => 10;
  win.dmRollFor("Athletics", "str", null);
  check("regression: un-branched rollRequest still rides the next turn (fetch called)", turnCalls() === 1);
  check("regression: no branch-resolved entry for a plain request", !win.dmLogOf(world).some((m) => m.branchResolved)); }

// === 9. HQ3-B3: a branch's `social_check` grades against the LIVE d20 that selected the branch —
// the DM's authored literal `total` is discarded, never trusted (SET-02-F2 class, branch vector). ===
const socialBranchRQ = (targetId) => ({
  skill: "Persuasion", ability: "cha", dc: 10, dcHidden: true,
  branches: {
    success:  { narration: "He softens, just barely — the offer lands.",
                events: [{ type: "social_check", payload: { target: targetId, skill: "Persuasion", total: 5, dc: 15 } }] },
    nearMiss: { narration: "n", events: [] },
    fail:     { narration: "f", events: [] },
  },
});
{ const { win, world } = freshDom();
  win.codexAdd(world, { kind: "npc", name: "Maddan Strole", provenance: "rolled" });   // opens lazy at Indifferent (0)
  const targetId = "npc:maddan-strole";
  world.characters[0].sheet.mods.cha = 3;
  world.characters[0].sheet.skillProfs.push("Persuasion");
  const rq = socialBranchRQ(targetId);
  win.GS.dm.rollReq = rq;
  withDie(win, 17);   // 17 + cha(3) + prof(2, Persuasion proficient) = 22 vs branch-selection dc 10 → margin +12 → success
  win.dmRollFor("Persuasion", "cha", null);
  const log = win.dmLogOf(world);
  const last = log[log.length - 1];
  check("B3: branch resolved to the success narration", last.branchResolved && /softens/.test(last.text), last.text);
  check("B3: applied social_check.total is the LIVE 22, not the authored literal 5",
    last.events[0].payload.total === 22, JSON.stringify(last.events[0].payload));
  check("B3: applied social_check.natural carries the live die (17)",
    last.events[0].payload.natural === 17, JSON.stringify(last.events[0].payload));
  check("B3: the authored branch literal is NOT mutated in place (still total:5 on the source rq)",
    rq.branches.success.events[0].payload.total === 5, JSON.stringify(rq.branches.success.events[0].payload));
  check("B3: attitude committed against the LIVE die — success (+1), not the stale literal's backfire (-1)",
    win.codexGetAttitude(world, targetId).value === 1, JSON.stringify(win.codexGetAttitude(world, targetId)));
}

// === 9b. MUTATION CHECK (red-first) — restore the plain (pre-fix) events map in resolveBranch;
// the harness must go RED (grades against the stale authored total:5 → a backfire, attitude drops
// to -1, not +1), proving the injection is load-bearing. Nothing is written to disk — the mutated
// source only exists in the in-memory string built below. ===
{
  const dmSrc = read("src/world/dm.js");
  const injected = `const _liveNat=(rolls&&rolls[0]&&rolls[0].result)|0;
  const events=(branch.events||[]).map(e=>{
    const ev=Object.assign({},e,{source:"branch"});
    if(ev.type==="social_check"){
      // HQ3-B3: the branch was SELECTED by the live d20 — grade the committed attitude shift against
      // that die, not the DM's blind literal. Clone the payload (never mutate the authored branch),
      // override total + natural; leave dc/skill/target/levers as authored.
      ev.payload=Object.assign({}, ev.payload, { total: total, natural: _liveNat });
    }
    return ev;
  });`;
  const original = `const events=(branch.events||[]).map(e=>Object.assign({},e,{source:"branch"}));`;
  if (!dmSrc.includes(injected)) { fail++; console.log("  ✗ mutation check: HQ3-B3 injected block not found in dm.js (spec drifted?)"); }
  else {
    const mutatedDmSrc = dmSrc.replace(injected, original);
    const mutatedSrc = man.loadOrder.filter((p) => p.endsWith(".js"))
      .map((p) => p === "src/world/dm.js" ? mutatedDmSrc : read(p)).join("\n;\n");
    const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
    const win = dom.window;
    win.eval(harness + "\n" + mutatedSrc);
    win.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
    win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
    win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
    const world = { id: "w-mut-b3", name: "Mut B3", seed: { master:{name:"m",desc:"d"},smell:{name:"s"},sound:{name:"s"},arch:{name:"a"},taboo:{name:"t",desc:"d"},myth:{name:"m",desc:"d"} },
      characters: [{ status: "living", name: "Tester", headline: "h", pronouns: "they",
        sheet: { species: "Human", class: "Fighter", background: "b", level: 3, hp: 20, hpCur: 20, ac: 15, profBonus: 2, scores:{}, mods: { cha: 3 }, saveProfs: [], skillProfs: ["Persuasion"] } }],
      gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1, map: { nodes: {}, edges: [] }, currentNodeId: null,
      factions: [], pressures: [], revealed: {}, dmlog: [] };
    const originId = win.addNode(world, "Mut B3", "Setting"); world.currentNodeId = originId;
    win.U.worlds[world.id] = world; win.U.activeWorldId = world.id;
    win.codexAdd(world, { kind: "npc", name: "Maddan Strole", provenance: "rolled" });
    const targetId = "npc:maddan-strole";
    win.GS.dm.rollReq = socialBranchRQ(targetId);
    win.rollDie = () => 17;   // same live 22 as the fixed test — under the MUTATED (pre-fix) map this never reaches the applied event
    win.dmRollFor("Persuasion", "cha", null);
    const last = win.dmLogOf(world)[win.dmLogOf(world).length - 1];
    const appliedTotal = last && last.events && last.events[0] && last.events[0].payload && last.events[0].payload.total;
    const attAfter = win.codexGetAttitude(world, targetId).value;
    const mutationShowsRed = appliedTotal === 5 && attAfter === -1;   // stale literal graded → backfire, not the live-die success
    check("MUTATION (shown RED then restored): reverting the injection grades against the stale literal (5) → backfire (-1), not the live 22 → success (+1)",
      mutationShowsRed, `appliedTotal=${appliedTotal} attAfter=${attAfter}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
