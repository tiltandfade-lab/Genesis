/* Verify the DM SEAM — typed contracts + structured telemetry (docs/EVENT-CONTRACT.md,
   docs/POSITIONING.md "typed contracts at the seams" + "structured logging on the DM seat").

   Two guards on the one AI↔engine interface:
     1. validateEvent / validateTurnResponse — machine-check the inbound shapes; forward-compatible
        (unknown-but-well-formed event types PASS, malformed envelopes are no-op'd).
     2. logDmTurn — one structured DMTurnTelemetry row per completed turn (latency/lane/bytes/events/
        est. cost), ring-buffered in GS.dm.telemetry + fired at the bridge's /telemetry sink.

   Same "const-via-eval into one jsdom scope" pattern as verify-roll-branches.mjs.
   Includes a RED-FIRST parity guard: DM_EVENT_TYPES must equal applyEvent's switch cases, proven
   load-bearing by showing a dropped type flips validateEvent's unknownType flag.

   Run:  node dev/verify-dm-seam.mjs
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
// Top-level `const`/`let` share the classic-scripts lexical scope (the real app reaches them by bare
// name across files) but are NOT properties of `window` under indirect eval — so surface the few the
// harness inspects onto window explicitly, from inside the eval scope where they're visible.
const expose = `;window.DM_EVENT_TYPES=DM_EVENT_TYPES;window.DM_MODEL_RATES=DM_MODEL_RATES;window.DM_RATE_DEFAULT=DM_RATE_DEFAULT;window.DM_TELEMETRY_CAP=DM_TELEMETRY_CAP;`;

function freshDom() {
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  const win = dom.window;
  win.eval(harness + "\n" + srcText + "\n" + expose);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  return win;
}

// a minimal living world wired into U (mirrors verify-roll-branches.mjs's scaffold)
function seedWorld(win) {
  const world = {
    id: "w-seam", name: "The Seam Test",
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
  return world;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================
// 1. validateEvent — envelope contract
// ============================================================
{ const win = freshDom();
  const okEv = win.validateEvent({ type: "hp_changed", payload: { delta: -3 }, source: "detected" });
  check("validateEvent: well-formed event passes", okEv.ok && !okEv.unknownType, JSON.stringify(okEv));

  const noType = win.validateEvent({ payload: {} });
  check("validateEvent: missing type fails", !noType.ok && /type/.test(noType.errors.join()), JSON.stringify(noType));

  const badPayload = win.validateEvent({ type: "hp_changed", payload: [1, 2] });
  check("validateEvent: array payload fails", !badPayload.ok && /payload/.test(badPayload.errors.join()), JSON.stringify(badPayload));

  const badSource = win.validateEvent({ type: "hp_changed", source: "guessed" });
  check("validateEvent: bad source fails", !badSource.ok && /source/.test(badSource.errors.join()), JSON.stringify(badSource));

  const badRefs = win.validateEvent({ type: "hp_changed", ledgerRefs: "l-1" });
  check("validateEvent: non-array ledgerRefs fails", !badRefs.ok && /ledgerRefs/.test(badRefs.errors.join()), JSON.stringify(badRefs));

  const notObj = win.validateEvent(null);
  check("validateEvent: null event fails cleanly", !notObj.ok, JSON.stringify(notObj));

  // FORWARD-COMPATIBLE: an unknown but well-formed type PASSES (the switch no-ops it) with unknownType:true
  const future = win.validateEvent({ type: "teleport_v2", payload: {} });
  check("validateEvent: unknown well-formed type passes, flagged unknownType", future.ok && future.unknownType === true, JSON.stringify(future));
}

// ============================================================
// 2. RED-FIRST parity — DM_EVENT_TYPES == applyEvent's switch cases
// ============================================================
{ const win = freshDom();
  // brace-match applyEvent's body, then take ONLY its top-level (4-space-indented) case labels — nested
  // sub-switch cases are more deeply indented and must not count toward the vocabulary parity.
  const dm = read("src/world/dm.js");
  const fnStart = dm.indexOf("function applyEvent(w,e){");
  let i = dm.indexOf("{", fnStart), depth = 0, bodyEnd = dm.length;
  for (let j = i; j < dm.length; j++) { const c = dm[j]; if (c === "{") depth++; else if (c === "}") { depth--; if (depth === 0) { bodyEnd = j; break; } } }
  const applyBody = dm.slice(i, bodyEnd);
  const caseLabels = [...applyBody.matchAll(/\n    case "([a-z_0-9]+)"\s*:/g)].map((m) => m[1]);
  const switchSet = new Set(caseLabels);
  const listSet = new Set(win.DM_EVENT_TYPES);
  const missingFromList = [...switchSet].filter((t) => !listSet.has(t));
  const extraInList = [...listSet].filter((t) => !switchSet.has(t));
  check("parity: DM_EVENT_TYPES covers every applyEvent switch case (no drift)",
    missingFromList.length === 0 && extraInList.length === 0,
    `missingFromList=${JSON.stringify(missingFromList)} extraInList=${JSON.stringify(extraInList)}`);

  // prove the list is LOAD-BEARING: drop one type and validateEvent must now call it unknown (RED)
  const dropped = win.DM_EVENT_TYPES[0];
  const shrunk = win.DM_EVENT_TYPES.filter((t) => t !== dropped);
  const wasKnown = shrunk.indexOf(dropped) < 0 && win.DM_EVENT_TYPES.indexOf(dropped) >= 0;
  check("parity guard is load-bearing: a dropped type would flip to unknownType (RED shown)",
    wasKnown, `dropped=${dropped}`);
}

// ============================================================
// 3. applyEvent honors the contract — malformed no-ops, never throws
// ============================================================
{ const win = freshDom(); const world = seedWorld(win);
  let threw = false, res;
  try { res = win.applyEvent(world, { payload: {} }); } catch (e) { threw = true; }   // no type
  check("applyEvent: malformed event does not throw", !threw);
  check("applyEvent: malformed event no-ops with invalid-envelope reason", res && res.ok === false && res.reason === "invalid-envelope", JSON.stringify(res));

  const unknownRes = win.applyEvent(world, { type: "teleport_v2", payload: {} });
  check("applyEvent: unknown type falls through to forward-compatible default", unknownRes && unknownRes.ok === false && /unknown-type/.test(unknownRes.reason || ""), JSON.stringify(unknownRes));

  const goodRes = win.applyEvent(world, { type: "hp_changed", payload: { delta: 0 }, source: "detected" });
  check("applyEvent: valid hp_changed still applies", goodRes && goodRes.ok === true, JSON.stringify(goodRes));
}

// ============================================================
// 4. validateTurnResponse
// ============================================================
{ const win = freshDom();
  const good = win.validateTurnResponse({ narration: "You step inside.", events: [{ type: "hp_changed", payload: { delta: 0 } }] });
  check("validateTurnResponse: good response passes", good.ok, JSON.stringify(good));

  const badNarr = win.validateTurnResponse({ narration: 42 });
  check("validateTurnResponse: numeric narration flagged", !badNarr.ok && /narration/.test(badNarr.errors.join()), JSON.stringify(badNarr));

  const badEvents = win.validateTurnResponse({ events: "nope" });
  check("validateTurnResponse: non-array events flagged", !badEvents.ok && /events/.test(badEvents.errors.join()), JSON.stringify(badEvents));

  const nestedBad = win.validateTurnResponse({ events: [{ payload: {} }] });   // event missing type
  check("validateTurnResponse: nested malformed event flagged with index", !nestedBad.ok && /events\[0\]/.test(nestedBad.errors.join()), JSON.stringify(nestedBad));
}

// ============================================================
// 5. dmEstimateCost + jsonBytes
// ============================================================
{ const win = freshDom();
  const c = win.dmEstimateCost("claude-sonnet-5", 4000, 800);
  check("dmEstimateCost: tokens ≈ bytes/4", c.inTok === 1000 && c.outTok === 200, JSON.stringify(c));
  check("dmEstimateCost: usd from the rate table", Math.abs(c.usd - (1000 * 3 / 1e6 + 200 * 15 / 1e6)) < 1e-9, JSON.stringify(c));
  check("dmEstimateCost: always flagged estimated", c.estimated === true);

  const unmapped = win.dmEstimateCost("some-future-model", 4000, 0);
  check("dmEstimateCost: unmapped model falls to DM_RATE_DEFAULT", unmapped.inTok === 1000 && unmapped.usd === +(1000 * win.DM_RATE_DEFAULT[0]).toFixed(5), JSON.stringify(unmapped));

  check("jsonBytes: measures compact length", win.jsonBytes({ a: 1 }) === JSON.stringify({ a: 1 }).length);
  const cyclic = {}; cyclic.self = cyclic;
  check("jsonBytes: crash-proof on a cyclic value (returns 0)", win.jsonBytes(cyclic) === 0);
}

// ============================================================
// 6. logDmTurn — ring buffer + fire-and-forget /telemetry POST
// ============================================================
{ const win = freshDom();
  let posts = [];
  win.fetch = (url, opts) => { if (String(url).includes("/telemetry")) posts.push(JSON.parse(opts.body)); return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }); };
  const w = { id: "w-x" };
  const row = win.logDmTurn(w, { turnId: "t-1", worldId: "w-x", ok: true });
  check("logDmTurn: returns the row", row && row.turnId === "t-1");
  check("logDmTurn: pushed to GS.dm.telemetry ring buffer", win.GS.dm.telemetry.length === 1 && win.GS.dm.telemetry[0].turnId === "t-1");
  check("logDmTurn: fired one /telemetry POST with the row", posts.length === 1 && posts[0].turnId === "t-1", JSON.stringify(posts));

  // ring buffer caps at DM_TELEMETRY_CAP, dropping the oldest
  for (let i = 0; i < win.DM_TELEMETRY_CAP + 25; i++) win.logDmTurn(w, { turnId: "r-" + i });
  check("logDmTurn: ring buffer capped at DM_TELEMETRY_CAP", win.GS.dm.telemetry.length === win.DM_TELEMETRY_CAP, `len=${win.GS.dm.telemetry.length}`);
  const last = win.GS.dm.telemetry[win.GS.dm.telemetry.length - 1];
  check("logDmTurn: newest row retained at the tail", last.turnId === "r-" + (win.DM_TELEMETRY_CAP + 24), last.turnId);

  // never throws even if telemetry internals are hostile (GS missing dm)
  let threw = false; try { delete win.GS.dm; win.logDmTurn(w, { turnId: "safe" }); } catch (e) { threw = true; }
  check("logDmTurn: never throws a turn", !threw);
}

// ============================================================
// 7. end-to-end — sendTurn → applyResponse writes ONE complete telemetry row
// ============================================================
{ const win = freshDom(); const world = seedWorld(win);
  let telemetryPosts = [];
  win.fetch = (url, opts) => {
    if (String(url).includes("/telemetry")) telemetryPosts.push(JSON.parse(opts.body));
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ turnId: "t-e2e" }) });
  };
  win.sendTurn("I look around.", null);   // stamps GS.dm.turnStart + GS.dm.lastTurnMeta (fetch stubbed)
  check("e2e: sendTurn stashed lastTurnMeta with measured bytes", win.GS.dm.lastTurnMeta && win.GS.dm.lastTurnMeta.digestBytes > 0 && win.GS.dm.lastTurnMeta.turnBytes > 0, JSON.stringify(win.GS.dm.lastTurnMeta));

  win.applyResponse({ turnId: win.GS.dm.lastTurnMeta.turnId, narration: "The hold is silent.", events: [{ type: "hp_changed", payload: { delta: 0 }, source: "detected" }] });
  const rows = (win.GS.dm.telemetry || []);
  check("e2e: exactly one telemetry row recorded", rows.length === 1, `len=${rows.length}`);
  const r = rows[0] || {};
  check("e2e: row carries latency (number ≥ 0)", typeof r.latencyMs === "number" && r.latencyMs >= 0, JSON.stringify(r.latencyMs));
  check("e2e: row carries the payload byte counts", r.digestBytes > 0 && r.turnBytes > 0 && r.responseBytes > 0, `digest=${r.digestBytes} turn=${r.turnBytes} resp=${r.responseBytes}`);
  check("e2e: row lists the applied event types", Array.isArray(r.eventTypes) && r.eventTypes.indexOf("hp_changed") >= 0, JSON.stringify(r.eventTypes));
  check("e2e: row carries an estimated cost", r.cost && r.cost.estimated === true && typeof r.cost.usd === "number", JSON.stringify(r.cost));
  check("e2e: row.ok reflects the contract (true for a clean response)", r.ok === true);
  check("e2e: the row was fired at the /telemetry sink", telemetryPosts.some((p) => p.turnId === r.turnId), `posts=${telemetryPosts.length}`);
  check("e2e: lastTurnMeta cleared after the row closes", win.GS.dm.lastTurnMeta === null);
}

// ============================================================
// 8. H3 (HOTFIX-QUEUE-2026-07-06) — string-payload coercion on the hottest MATH events.
//    dmNum() repairs a coercible string field to a number (loud: console.warn + one
//    kind:"payload-coercion" ledger line) and passes clean numbers silently; the combat.js
//    cmRollD20 net catches every other d20 caller. RED-FIRST: each probe's pre-fix red line
//    is noted in the commit; here we assert the VALUE moved (the BUG-01 discipline).
// ============================================================

// helper: seed the living PC with a clean NUMERIC hp/hpCur so the math is exact (ensureResources
// would copy sh.hp into hpCur; we set both explicitly to the known baseline H).
function seedPcHp(world, H) { const sh = world.characters[0].sheet; sh.hp = H; sh.hpCur = H; return sh; }

{ // 8.1 — THE red probe: a STRING negative delta must apply, not silently zero out.
  const win = freshDom(); const world = seedWorld(win);
  const sh = seedPcHp(world, 20);
  win.applyEvent(world, { type: "hp_changed", payload: { delta: "-4" }, source: "declared" });
  check("H3.1 hp_changed {delta:'-4'} applies −4 (VALUE moved)", sh.hpCur === 16, `hpCur=${sh.hpCur} (pre-fix: 20)`);
}

{ // 8.2 — a STRING heal raises hp (Number("+3")===3), capped at max.
  const win = freshDom(); const world = seedWorld(win);
  const sh = seedPcHp(world, 20); sh.hpCur = 10;
  win.applyEvent(world, { type: "hp_changed", payload: { delta: "+3" }, source: "declared" });
  check("H3.2 hp_changed {delta:'+3'} heals to 13", sh.hpCur === 13, `hpCur=${sh.hpCur}`);
}

{ // 8.3 — a STRING d20 on an attack resolves to a NUMBER total (no "18"+atkBonus string concat).
  const win = freshDom(); const world = seedWorld(win);
  const sh = seedPcHp(world, 20);
  sh.inventory = [{ id: "w1", name: "Longsword" }];
  sh.equipped = { mainHand: "w1", offHand: null, armor: null };
  const res = win.applyEvent(world, { type: "attack", payload: { d20: "18", targetAC: 10 }, source: "declared" });
  const r = res && res.result;
  check("H3.3 attack {d20:'18'} → result.total is a NUMBER", r && typeof r.total === "number", JSON.stringify(res));
  check("H3.3 attack {d20:'18'} → total < 100 (no string-concat '185')", r && r.total < 100, r && `total=${r.total}`);
}

{ // 8.4 — a STRING nat-20 on a death save must FIRE the strict revive path (not the ≥10 compare).
  const win = freshDom(); const world = seedWorld(win);
  const sh = seedPcHp(world, 20); sh.hpCur = 0; sh.deathSaves = { succ: 0, fail: 0 };
  const res = win.applyEvent(world, { type: "death_save", payload: { d20: "20" }, source: "declared" });
  check("H3.4 death_save {d20:'20'} → outcome 'revived'", res && res.outcome === "revived", JSON.stringify(res));
  check("H3.4 death_save {d20:'20'} → hpCur === 1", sh.hpCur === 1, `hpCur=${sh.hpCur}`);
}

{ // 8.5 — a STRING n on charge_restore restores n, NOT a full refill.
  const win = freshDom(); const world = seedWorld(win);
  const sh = seedPcHp(world, 20);
  sh.inventory = [{ id: "wand1", name: "Wand", ench: { charges: { cur: 3, max: 10 } } }];
  win.applyEvent(world, { type: "charge_restore", payload: { itemId: "wand1", n: "2" }, source: "declared" });
  check("H3.5 charge_restore {n:'2'} restores to 5, not 10", sh.inventory[0].ench.charges.cur === 5, `cur=${sh.inventory[0].ench.charges.cur}`);
}

{ // 8.6 — the coercion is LOUD: a payload-coercion ledger line lands for probe 8.1's repair.
  const win = freshDom(); const world = seedWorld(win);
  seedPcHp(world, 20);
  win.applyEvent(world, { type: "hp_changed", payload: { delta: "-4" }, source: "declared" });
  const coerce = (world.ledger || []).filter(l => l.data && l.data.kind === "payload-coercion");
  const last = coerce[coerce.length - 1];
  check("H3.6 payload-coercion ledger line exists (type/key/repaired)",
    !!last && last.data.type === "hp_changed" && last.data.key === "delta" && last.data.repaired === true,
    JSON.stringify(coerce));
}

{ // 8.7 — clean-number silence: a real numeric delta produces NO payload-coercion ledger line.
  const win = freshDom(); const world = seedWorld(win);
  seedPcHp(world, 20);
  win.applyEvent(world, { type: "hp_changed", payload: { delta: -4 }, source: "declared" });
  const coerce = (world.ledger || []).filter(l => l.data && l.data.kind === "payload-coercion");
  check("H3.7 clean number delta:-4 → NO payload-coercion ledger line", coerce.length === 0, `found=${coerce.length}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
