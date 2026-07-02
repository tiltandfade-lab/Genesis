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
      sheet: { species: "Human", class: "Fighter", background: "Folk Hero", level: 3, hp: "20/20", ac: 15,
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
  withDie(win, 16);   // 16 + str(2) + prof(2, Athletics proficient) = 20 vs dc 13 → margin +7 → success
  win.dmRollFor("Athletics", "str", null);
  const log = win.dmLogOf(world);
  const last = log[log.length - 1];
  check("success: DM-voice entry rendered", last.role === "dm" && /haul yourself over the lip/.test(last.text), last.text);
  check("success: branchResolved marker set", last.branchResolved === true);
  check("success: 0 turns posted (/turn never called)", turnCalls() === 0, `/turn called ${turnCalls()}x`);
  check("success: event applied with source:'branch'", last.events[0].source === "branch", JSON.stringify(last.events));
  check("success: GS.dm.rollReq cleared", win.GS.dm.rollReq === null);
  check("success: lastResolution stamped on w.dm", world.dm && world.dm.lastResolution && world.dm.lastResolution.branch === "success",
        JSON.stringify(world.dm && world.dm.lastResolution)); }

// === 2. margin ladder → nearMiss (miss by 1-2) vs fail (miss by 3+) — the TIGHT grace ===
{ const { win, world } = freshDom();
  win.GS.dm.rollReq = branchedRQ();
  withDie(win, 9);   // 9+2+2 = 13... need a MISS: use die 7 → 7+2+2=11 vs dc13 → margin -2 → nearMiss
  win.rollDie = () => 7;
  win.dmRollFor("Athletics", "str", null);
  let last = win.dmLogOf(world)[win.dmLogOf(world).length - 1];
  check("miss by 2 → nearMiss branch fires", last.branchResolved && /fingers catch/.test(last.text), last.text);
  check("miss by 2 → lastResolution.branch === 'nearMiss'", world.dm.lastResolution.branch === "nearMiss", world.dm.lastResolution.branch);
}
{ const { win, world } = freshDom();
  win.GS.dm.rollReq = branchedRQ();
  win.rollDie = () => 4;   // 4+2+2=8 vs dc13 → margin -5 → fail (miss by 3+ — never a near-thing)
  win.dmRollFor("Athletics", "str", null);
  const last = win.dmLogOf(world)[win.dmLogOf(world).length - 1];
  check("miss by 5 → fail branch fires (NOT nearMiss)", last.branchResolved && /wall sheds you/.test(last.text), last.text);
  check("miss by 5 → lastResolution.branch === 'fail'", world.dm.lastResolution.branch === "fail", world.dm.lastResolution.branch);
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

// regression: un-branched rollRequest behaves byte-identically to today (falls straight to sendTurn)
{ const { win, world, turnCalls } = freshDom();
  win.GS.dm.rollReq = { skill: "Athletics", ability: "str", dcHidden: true };   // no branches at all — today's shape
  win.rollDie = () => 10;
  win.dmRollFor("Athletics", "str", null);
  check("regression: un-branched rollRequest still rides the next turn (fetch called)", turnCalls() === 1);
  check("regression: no branch-resolved entry for a plain request", !win.dmLogOf(world).some((m) => m.branchResolved)); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
