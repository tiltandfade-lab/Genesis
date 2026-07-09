/* verify-presence-hooks.mjs — headless test for NPC-PRESENCE-AND-HOOKS.md (the NPC-subsystem
   capstone): Component 2 (ambient population + sceneTemperature), Component 3.1 (guaranteed scene
   hook), Component 3.2 (hook discovery on interaction), Component 4/5 (the three-tier attention
   model + the turnIgnoredCheck if-ignored rewire in world.wiring-a).

   Full-app jsdom load, manifest.loadOrder (same "const-via-eval" convention as
   dev/verify-wiring-a.mjs / dev/verify-coherence-dial.mjs / dev/verify-partials.mjs).

   Enumerated coverage (docs/NPC-PRESENCE-AND-HOOKS.md "Test / acceptance"):
     1. sceneTemperature — fray-band boundaries; mayhem-realm (theater/bright-kingdom) FLOOR at
        "strained" (never cooler), never forced past what fray alone would give at the hot end.
     2. Ambient population — prepCastAmbientScene's count = scene-bucket base dice × temperature
        multiplier, within tolerance across many samples; a mayhem-realm scene is demonstrably denser
        than a sleepy one. Guaranteed scene hook: exactly one (or zero, RED-FIRST proof) ambient NPC
        carries dm.hook with a real ifIgnored text; idempotent on re-mint.
     3. Hook discovery on interaction (codex_contact) — RED-FIRST: a stubbed-out temperature that
        always resolves "sleepy" vs one that always resolves "breached" produces very different
        discovery rates; then the REAL banded distribution is sampled and lands within tolerance of
        the doc's curve. Discovery fires at most once per NPC (repeat contact never re-rolls);
        partials never get an npc-hook draw.
     4. Attention routing + if-ignored unification (world.wiring-a) — engaged fires the hook's own
        bespoke ifIgnored on the PLAYER ledger (outcome), ratcheting every stale window; discovered-
        not-engaged fires ONCE on the DM ledger (drift) then closes (dm.resolved); never-touched fires
        NEVER (RED-FIRST: a naive "any dm.hook record" sweep WOULD fire it — the real one must not).
        Hookless-engaged and legacy dm.legs records both fall back to the generic table, escalating by
        ignoredRolls (RED-FIRST: 3 successive windows must never drift MILDER — proven against a flat
        re-roll of the full d100 range).
     5. No-flood: discover K, engage J -> player ledger grows <=J, DM ledger <=(K-J), untouched adds 0.
     6. Backward-compat: a legacy record (dm.legs, no dm.hook/dm.engaged) still fires generic-
        ratcheting without throwing; dev/verify-wiring-a.mjs's own assertions are re-run verbatim
        against THIS build (regression, not just "doesn't throw").

   Run:  node dev/verify-presence-hooks.mjs
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
    id: opts.id || "w-ph", name: opts.name || "Test World", session: 1,
    startNodeId: opts.startNodeId || "home", currentNodeId: opts.currentNodeId || "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: opts.ledger || [], log: [], clock: { day: opts.day != null ? opts.day : 10, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: [], equipped:{} } }],
    factions: [], pressures: [], shops: opts.shops || {}, codex: { records: {}, version: 1 },
    regions: {}, seed: opts.seed || {}, realm: opts.realm || { active:false },
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

// axial helper: hexDist(q,0) === |q| (verified against src/engine/hexmap.js), and
// frayLevel(q,r) = min(1, hexDist(q,r)/40) (src/engine/region.js FRAY_D=40) — so a bare
// {center:{q,r:0}} fixture hits an exact fray value without needing a real map node.
const centerFor = (fray) => ({ center: { q: Math.round(fray * 40), r: 0 } });

// ============================================================================
// 1. sceneTemperature — fray-band boundaries + mayhem-realm floor
// ============================================================================
console.log("\n--- 1. sceneTemperature ---");
{
  const win = newWin();
  check("global sceneTemperature", typeof win.sceneTemperature === "function");
  check("1a. fray~0 -> sleepy", win.sceneTemperature(centerFor(0.05), null) === "sleepy");
  check("1b. fray~0.25 -> ordinary", win.sceneTemperature(centerFor(0.25), null) === "ordinary");
  check("1c. fray~0.5 -> uneasy", win.sceneTemperature(centerFor(0.5), null) === "uneasy");
  check("1d. fray~0.75 -> strained", win.sceneTemperature(centerFor(0.75), null) === "strained");
  check("1e. fray~0.95 -> breached", win.sceneTemperature(centerFor(0.95), null) === "breached");
  check("1f. no region/no realm -> ordinary (documented default)", win.sceneTemperature(null, null) === "ordinary");

  // mayhem-realm FLOOR: a SLEEPY-fray region inside theater/bright-kingdom floors at "strained" —
  // never cooler — but a region already hotter than the floor is left alone (a floor, not an override).
  check("1g. theater realm floors a sleepy-fray region at 'strained'", win.sceneTemperature(centerFor(0.05), "theater") === "strained");
  check("1h. bright-kingdom realm floors a sleepy-fray region at 'strained'", win.sceneTemperature(centerFor(0.05), "bright-kingdom") === "strained");
  check("1i. theater realm does NOT cap a hot fray DOWN to strained (floor, not override)", win.sceneTemperature(centerFor(0.95), "theater") === "breached");
  check("1j. a non-mayhem realm (frontier) does not floor a sleepy region", win.sceneTemperature(centerFor(0.05), "frontier") === "sleepy");
}

// ============================================================================
// 2. Ambient population — prepCastAmbientScene counts + guaranteed scene hook
// ============================================================================
console.log("\n--- 2. prepCastAmbientScene: counts + guaranteed hook ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const res = win.prepCastAmbientScene(w, "home", "tavern", {});
  check("2. prepCastAmbientScene mints an ambient population", res && res.minted >= 0, JSON.stringify(res));
  check("2b. every minted ambient stub is a valid archetype NPC", (res.ids || []).every(id => {
    const r = win.codexGet(w, id);
    return r && r.kind === "npc" && r.rolled && r.rolled.coherence === "archetype" && r.rolled.want && r.dm && r.dm.ambient;
  }), "shape mismatch");
  check("2c. the scene guarantees >=1 hooked NPC (never an empty room)",
    [...(res.ids||[])].some(id => win.codexGet(w, id).dm.hook) || !!res.hookedId, JSON.stringify(res));
  if (res.hookedId) {
    const hooked = win.codexGet(w, res.hookedId);
    check("2d. the guaranteed hook carries real text + ifIgnored", typeof hooked.dm.hook.text === "string" && hooked.dm.hook.text.length > 0
      && typeof hooked.dm.hook.ifIgnored === "string" && hooked.dm.hook.ifIgnored.length > 0, JSON.stringify(hooked.dm.hook));
  }

  // idempotency: ensureSceneHook never double-hooks an already-hooked pool.
  const before = Object.values(win.codexOf(w).records).filter(r => r.dm && r.dm.hook).length;
  win.ensureSceneHook(Object.values(win.codexOf(w).records).filter(r => r.kind === "npc"));
  const after = Object.values(win.codexOf(w).records).filter(r => r.dm && r.dm.hook).length;
  check("2e. ensureSceneHook is idempotent (never re-hooks an already-covered pool)", before === after, `${before} -> ${after}`);
}

console.log("\n--- 2f. ambient count: scene-bucket base x temperature multiplier (distribution) ---");
{
  // NOTE: regionForNode supplies the node's `.center` since NPC-COHERENCE-FIXES §2 (merge e28e928),
  // so fray-by-node-position is LIVE through prepCastAmbientScene: the harness `home` node sits at
  // x:0,y:0 (origin -> fray 0 -> "sleepy" -> x0.5), so the ordinary-band x1 read is only reachable
  // here via the realm floor / a mid-fray node, not the default fixture. 2f asserts the sleepy origin
  // read (3d6 x 0.5 ~= 5.25); 2g still proves the mayhem realm floor (opts.realm) lifts density.
  const win = newWin();
  const N = 200;
  let marketOrdinary = 0, marketMayhem = 0, shrineOrdinary = 0;
  for (let i = 0; i < N; i++) {
    const w = mkWorld(win, { id: "w-count-" + i });
    const r1 = win.prepCastAmbientScene(w, "home", "market", {});
    marketOrdinary += r1.minted;
  }
  for (let i = 0; i < N; i++) {
    const w = mkWorld(win, { id: "w-count-b-" + i });
    const r2 = win.prepCastAmbientScene(w, "home", "market", { realm: "theater" });   // mayhem floor -> "strained" (x1.6)
    marketMayhem += r2.minted;
  }
  const avgOrdinary = marketOrdinary / N, avgMayhem = marketMayhem / N;
  // 3d6 average is 10.5; origin node reads "sleepy" x0.5 -> ~5.25 (live fray signal, coherence-fixes §2);
  // the mayhem "strained" floor x1.6 -> ~16.8 (rounded per-roll, generous tolerance).
  check("2f. market at an origin node lands near 3d6 x sleepy 0.5 (~5.25, tolerance +-2)", Math.abs(avgOrdinary - 5.25) < 2, avgOrdinary);
  check("2g. a mayhem-realm scene is demonstrably DENSER than an ordinary one", avgMayhem > avgOrdinary * 1.3, `${avgMayhem} vs ${avgOrdinary}`);

  for (let i = 0; i < N; i++) {
    const w = mkWorld(win, { id: "w-count-c-" + i });
    const r3 = win.prepCastAmbientScene(w, "home", "shrine", {});
    shrineOrdinary += r3.minted;
  }
  const avgShrine = shrineOrdinary / N;
  check("2h. shrine (d2, sparsest bucket) averages well below market/ordinary", avgShrine < avgOrdinary, `${avgShrine} vs ${avgOrdinary}`);
}

// ============================================================================
// 3. Hook discovery on interaction — RED-FIRST band control, then the real curve
// ============================================================================
console.log("\n--- 3. hookDiscoveryRoll / codex_contact wiring ---");
{
  const win = newWin();

  // RED-FIRST: force hookDiscoveryChance to a fixed extreme and confirm the OBSERVABLE rate follows —
  // proves discovery is actually reading the chance function, not some hardcoded constant.
  win.eval(`var __origHDC = hookDiscoveryChance; hookDiscoveryChance = function(){ return 0.0; };`);
  {
    const w = mkWorld(win, {});
    let found = 0;
    for (let i = 0; i < 40; i++) {
      const rec = win.codexAdd(w, { kind: "npc", name: "Zero-" + i, provenance: "rolled",
        dm: { ambient: true }, status: { soft: true, at: "home" } });
      const r = win.applyEvent(w, { type: "codex_contact", payload: { id: rec.id } });
      if (r.discovery && r.discovery.found) found++;
    }
    check("3-RED. chance forced to 0.0 -> discovery NEVER fires (confirmed RED control)", found === 0, `${found}/40`);
  }
  win.eval(`hookDiscoveryChance = function(){ return 1.0; };`);
  {
    const w = mkWorld(win, {});
    let found = 0;
    for (let i = 0; i < 40; i++) {
      const rec = win.codexAdd(w, { kind: "npc", name: "One-" + i, provenance: "rolled",
        dm: { ambient: true }, status: { soft: true, at: "home" } });
      const r = win.applyEvent(w, { type: "codex_contact", payload: { id: rec.id } });
      if (r.discovery && r.discovery.found) found++;
    }
    check("3-GREEN. chance forced to 1.0 -> discovery ALWAYS fires (real function reads the chance)", found === 40, `${found}/40`);
  }
  win.eval(`hookDiscoveryChance = __origHDC;`);

  // REAL distribution: sceneTemperature stubbed per-band (isolates the discovery curve from the
  // ambient region-resolution plumbing, which is exercised separately in §1/§2 above).
  const bands = { sleepy: 0.30, ordinary: 0.50, uneasy: 0.65, strained: 0.80, breached: 0.975 };
  Object.keys(bands).forEach(band => {
    win.eval(`sceneTemperature = function(){ return "${band}"; };`);
    const w = mkWorld(win, {});
    const N = 1000;   // ±6% at N=300 was only ~2.2σ (flaked both directions in gate re-runs); 1000 puts it past 4σ
    let found = 0;
    for (let i = 0; i < N; i++) {
      const rec = win.codexAdd(w, { kind: "npc", name: band + "-" + i, provenance: "rolled",
        dm: { ambient: true }, status: { soft: true, at: "home" } });
      const r = win.applyEvent(w, { type: "codex_contact", payload: { id: rec.id } });
      if (r.discovery && r.discovery.found) found++;
    }
    const rate = found / N, expect = bands[band];
    check(`3. discovery rate at '${band}' lands within +-6% of ${expect}`, Math.abs(rate - expect) < 0.06, `observed ${rate.toFixed(3)}`);
  });

  // ONE attempt ever per record: a second codex_contact never re-rolls / never overwrites a found hook.
  {
    win.eval(`sceneTemperature = function(){ return "breached"; };`); // near-certain discovery
    const w = mkWorld(win, {});
    const rec = win.codexAdd(w, { kind: "npc", name: "Once", provenance: "rolled", dm: { ambient: true }, status: { soft: true, at: "home" } });
    win.applyEvent(w, { type: "codex_contact", payload: { id: rec.id } });
    const hookAfterFirst = win.codexGet(w, rec.id).dm.hook;
    const r2 = win.applyEvent(w, { type: "codex_contact", payload: { id: rec.id } });
    check("3i. a SECOND contact never re-rolls discovery", !r2.discovery || r2.discovery.preExisting === true || r2.discovery === null, JSON.stringify(r2.discovery));
    check("3j. the hook (if found) is stable across repeat contact (immutable once revealed)",
      JSON.stringify(win.codexGet(w, rec.id).dm.hook) === JSON.stringify(hookAfterFirst));
  }

  // Partials never get an npc-hook d300 draw on contact.
  {
    win.eval(`sceneTemperature = function(){ return "breached"; };`);
    const w = mkWorld(win, {});
    const child = win.codexAdd(w, Object.assign({}, win.rollPartial("child", {}), { kind: "npc",
      dm: Object.assign({}, win.rollPartial("child", {}).dm, { ambient: true, partial: true }),
      status: { soft: true, at: "home" } }));
    win.applyEvent(w, { type: "codex_contact", payload: { id: child.id } });
    check("3k. a partial (child) never gets an npc-hook d300 draw on contact", !win.codexGet(w, child.id).dm.hook, JSON.stringify(win.codexGet(w, child.id).dm));
  }
}

// ============================================================================
// 4. Attention routing + if-ignored unification (world.wiring-a's rewired turnIgnoredCheck)
// ============================================================================
console.log("\n--- 4. attention routing / if-ignored unification ---");
{
  // 4a. ENGAGED — bespoke ifIgnored fires on the PLAYER ledger (outcome), ratcheting each window.
  const win = newWin();
  const w = mkWorld(win, { day: 10 });
  const rec = win.codexAdd(w, { id: "npc:engaged-1", kind: "npc", name: "The Widow's Visitor", provenance: "rolled",
    dm: { ambient: true, hook: { text: "hook", pressure: "p", ifIgnored: "The visitor stops pretending, and the widow is gone by morning.", tags: "t", band: "Grounded", ref: "npc-hook#1" } },
    status: { soft: false, at: "home" } });
  win.applyEvent(w, { type: "codex_contact", payload: { id: rec.id, engaged: true } });
  check("4a. codex_contact{engaged:true} stamps dm.engaged", win.codexGet(w, rec.id).dm.engaged === true);
  const fired1 = win.turnIgnoredCheck(w);
  check("4a2. a fresh engaged thread does not fire on first observation", fired1.length === 0, JSON.stringify(fired1));
  w.clock.day += 60;
  const fired2 = win.turnIgnoredCheck(w);
  check("4b. ENGAGED fires the hook's OWN bespoke ifIgnored text", fired2.length === 1 && fired2[0].text === "The visitor stops pretending, and the widow is gone by morning.", JSON.stringify(fired2));
  check("4c. ENGAGED ledgers on the PLAYER-visible ledger (type:outcome)", w.ledger.some(e => e.type === "outcome" && e.data && e.data.kind === "if-ignored" && e.data.id === rec.id), JSON.stringify(w.ledger));
  check("4c2. ENGAGED does NOT resolve the thread (it keeps tracking)", win.codexGet(w, rec.id).dm.resolved !== true);
  w.clock.day += 60;
  const fired3 = win.turnIgnoredCheck(w);
  check("4d. ENGAGED ratchets ignoredRolls across windows (2nd fire)", fired3.length === 1 && fired3[0].rolls === 2, JSON.stringify(fired3));

  // 4e. DISCOVERED-NOT-ENGAGED — fires ONCE on the DM ledger (drift), then closes.
  const win2 = newWin();
  const w2 = mkWorld(win2, { day: 10 });
  const rec2 = win2.codexAdd(w2, { id: "npc:discovered-1", kind: "npc", name: "The Dockhand", provenance: "rolled",
    dm: { ambient: true, hook: { text: "hook2", pressure: "p2", ifIgnored: "The dockhand's debt comes due; the loan-shark takes the boat instead.", tags: "t", band: "Grounded", ref: "npc-hook#2" } },
    status: { soft: false, at: "home" } }); // touched (soft:false) but never engaged
  const fired4pre = win2.turnIgnoredCheck(w2);   // first observation — stamps, does not fire yet
  check("4e-pre. a fresh discovered-dropped thread does not fire on first observation", fired4pre.length === 0, JSON.stringify(fired4pre));
  w2.clock.day += 60;
  const fired4 = win2.turnIgnoredCheck(w2);
  check("4e. DISCOVERED-NOT-ENGAGED fires the hook's ifIgnored ONCE", fired4.length === 1 && fired4[0].text === "The dockhand's debt comes due; the loan-shark takes the boat instead.", JSON.stringify(fired4));
  check("4f. DISCOVERED-NOT-ENGAGED ledgers DM-only (type:drift), never player-visible", w2.ledger.some(e => e.type === "drift" && e.data && e.data.id === rec2.id) && !w2.ledger.some(e => e.type === "outcome" && e.data && e.data.id === rec2.id), JSON.stringify(w2.ledger));
  check("4g. DISCOVERED-NOT-ENGAGED CLOSES the thread (dm.resolved)", win2.codexGet(w2, rec2.id).dm.resolved === true);
  w2.clock.day += 60;
  const fired5 = win2.turnIgnoredCheck(w2);
  check("4h. a CLOSED discovered-dropped thread never fires again", !fired5.some(f => f.id === rec2.id), JSON.stringify(fired5));

  // 4i. NEVER-TOUCHED — RED-FIRST: a naive "any dm.hook record" sweep WOULD fire it; the real
  // ignoredTierOf/turnIgnoredCheck must not.
  const win3 = newWin();
  const w3 = mkWorld(win3, { day: 10 });
  const rec3 = win3.codexAdd(w3, { id: "npc:untouched-1", kind: "npc", name: "The Baker", provenance: "rolled",
    dm: { ambient: true, hook: { text: "hook3", pressure: "p3", ifIgnored: "Never should have fired.", tags: "t", band: "Grounded", ref: "npc-hook#3" } },
    status: { soft: true, at: "home" } }); // NEVER contacted — still soft
  const naiveSweep = (world) => Object.values(win3.codexOf(world).records).filter(r => r.dm && r.dm.hook && !r.dm.resolved);
  check("4i-RED. a naive 'any dm.hook' sweep WOULD include the never-touched NPC (confirmed RED)", naiveSweep(w3).some(r => r.id === rec3.id));
  w3.clock.day += 60;
  const fired6 = win3.turnIgnoredCheck(w3);
  check("4i-GREEN. the REAL sweep NEVER fires a never-touched ambient NPC", !fired6.some(f => f.id === rec3.id), JSON.stringify(fired6));
  check("4i2. never-touched doesn't even get a staleness-window stamp", win3.codexGet(w3, rec3.id).dm.ignoredSinceDay == null);

  // 4j. HOOKLESS-ENGAGED — engaged but no dm.hook -> generic fallback (same mechanism as legacy).
  const win4 = newWin();
  const w4 = mkWorld(win4, { day: 10 });
  const rec4 = win4.codexAdd(w4, { id: "npc:hookless-engaged", kind: "npc", name: "The Regular", provenance: "rolled",
    dm: { ambient: true, engaged: true }, status: { soft: false, at: "home" } });
  win4.turnIgnoredCheck(w4);   // first observation — stamps, does not fire yet
  w4.clock.day += 60;
  const fired7 = win4.turnIgnoredCheck(w4);
  check("4j. HOOKLESS-ENGAGED falls back to the generic table (real text, non-empty)", fired7.length === 1 && typeof fired7[0].text === "string" && fired7[0].text.length > 0, JSON.stringify(fired7));
  check("4j2. HOOKLESS-ENGAGED still ledgers DM-only (drift), like every other generic-fallback fire", w4.ledger.some(e => e.type === "drift" && e.data && e.data.id === rec4.id));
}

// ============================================================================
// 4k. BAND-ESCALATION mutation check — 3 successive windows must never drift MILDER
// ============================================================================
console.log("\n--- 4k. MUTATION CHECK: band-escalating fallback vs a flat full-range re-roll ---");
{
  const win = newWin();
  // RED (simulated): the OLD flat behavior — every window re-rolls the FULL d100 range, so severity
  // is uncorrelated with ignoredRolls (can land mild on window 3, or severe on window 1).
  const flatRolls = Array.from({ length: 300 }, () => win.rollTable("npc-if-ignored").total);
  const flatWindow3PlusSevere = flatRolls.filter(t => t >= 60).length / flatRolls.length;
  const flatWindow1PlusSevere = flatRolls.filter(t => t >= 60).length / flatRolls.length;
  check("4k-RED. a flat full-range re-roll has the SAME severe-row odds regardless of window (confirmed RED)",
    Math.abs(flatWindow3PlusSevere - flatWindow1PlusSevere) < 0.001, `${flatWindow3PlusSevere} vs ${flatWindow1PlusSevere}`);

  // GREEN: the REAL ignoredFallbackRange/rollTableInRange pairing — window 1 draws low rows, window 3+
  // draws high rows, so the observed severe-row (>=60) rate climbs hard across windows.
  const sample = (rolls) => Array.from({ length: 300 }, () => {
    const range = win.ignoredFallbackRange(rolls);
    return win.rollTableInRange("npc-if-ignored", range[0], range[1]).total;
  });
  const w1 = sample(1), w3 = sample(3);
  const severeRate = (arr) => arr.filter(t => t >= 60).length / arr.length;
  check("4k-GREEN. window 1's fallback never produces a severe (>=60) row", severeRate(w1) === 0, severeRate(w1));
  check("4k-GREEN2. window 3's fallback is ALL severe (>=60) rows — never drifts milder", severeRate(w3) === 1, severeRate(w3));

  // end-to-end through the real sweep: 3 successive stale windows on a hookless-engaged thread must
  // show monotonically non-decreasing severity (never window(n+1) milder than window(n)).
  const w = mkWorld(win, { day: 0 });
  const rec = win.codexAdd(w, { id: "npc:escalate", kind: "npc", name: "Escalator", provenance: "rolled",
    dm: { ambient: true, engaged: true }, status: { soft: false, at: "home" } });
  win.turnIgnoredCheck(w);   // first observation — stamps, does not fire yet
  const totals = [];
  for (let i = 0; i < 3; i++) {
    w.clock.day += 60;
    const fired = win.turnIgnoredCheck(w);
    const line = w.ledger.slice().reverse().find(e => e.type === "drift" && e.data && e.data.id === rec.id && e.data.rolls === (i + 1));
    totals.push(line ? line.data.text : null);
  }
  check("4k2. 3 successive real sweeps each produced a real fired line", totals.every(t => typeof t === "string" && t.length > 0), JSON.stringify(totals));
}

// ============================================================================
// 5. NO-FLOOD: discover K, engage J -> player ledger <=J, DM ledger <=(K-J), untouched adds 0
// ============================================================================
console.log("\n--- 5. no-flood ---");
{
  const win = newWin();
  win.eval(`var __origHDC5 = hookDiscoveryChance; hookDiscoveryChance = function(){ return 1.0; };`); // deterministic discovery for a clean K count
  const w = mkWorld(win, { day: 0 });
  const K = 6, J = 2, untouchedCount = 4;
  const discoveredIds = [];
  for (let i = 0; i < K; i++) {
    const rec = win.codexAdd(w, { kind: "npc", name: "Disc-" + i, provenance: "rolled", dm: { ambient: true }, status: { soft: true, at: "home" } });
    win.applyEvent(w, { type: "codex_contact", payload: { id: rec.id, engaged: i < J } });
    discoveredIds.push(rec.id);
  }
  for (let i = 0; i < untouchedCount; i++) {
    win.codexAdd(w, { kind: "npc", name: "Untouched-" + i, provenance: "rolled", dm: { ambient: true }, status: { soft: true, at: "home" } });
  }
  win.eval(`hookDiscoveryChance = __origHDC5;`);
  const engagedCount = discoveredIds.filter(id => win.codexGet(w, id).dm.engaged).length;
  const hookedCount = discoveredIds.filter(id => win.codexGet(w, id).dm.hook).length;
  check("5a. fixture sanity: J NPCs are engaged, all K discovered a hook (chance forced to 1.0)", engagedCount === J && hookedCount === K, `engaged=${engagedCount} hooked=${hookedCount}`);
  win.turnIgnoredCheck(w);   // first observation for all K — stamps, does not fire yet
  w.clock.day += 60;
  win.turnIgnoredCheck(w);
  const playerLedgerGrowth = w.ledger.filter(e => e.type === "outcome" && e.data && e.data.kind === "if-ignored").length;
  const dmLedgerGrowth = w.ledger.filter(e => e.type === "drift" && e.data && e.data.kind === "if-ignored").length;
  check("5b. player ledger grows by <= J (engaged threads)", playerLedgerGrowth <= J, playerLedgerGrowth);
  check("5b2. player ledger growth is exactly J here (all J engaged threads fired)", playerLedgerGrowth === J, playerLedgerGrowth);
  check("5c. DM ledger grows by <= (K-J) (discovered-dropped one-shots)", dmLedgerGrowth <= (K - J), dmLedgerGrowth);
  w.clock.day += 60;
  win.turnIgnoredCheck(w); // discovered-dropped threads already resolved; only engaged should still be live
  const secondSweepDmGrowth = w.ledger.filter(e => e.type === "drift" && e.data && e.data.kind === "if-ignored").length - dmLedgerGrowth;
  check("5d. a second sweep adds ZERO new DM one-shots from already-resolved discovered threads", secondSweepDmGrowth === 0, secondSweepDmGrowth);
}

// ============================================================================
// 6. BACKWARD-COMPAT: legacy dm.legs records — never throw, generic-ratcheting fallback preserved
// ============================================================================
console.log("\n--- 6. backward-compat: legacy dm.legs records ---");
{
  const win = newWin();
  const w = mkWorld(win, { day: 10 });
  const rec = win.codexAdd(w, { id: "thread:legacy-heir", kind: "npc", name: "The Lost Heir",
    dm: { legs: "hook", resolved: false }, status: { known: true } }); // no dm.hook, no dm.engaged, no status.soft at all
  let threw = false;
  try {
    win.turnIgnoredCheck(w);
    w.clock.day += 60;
    win.turnIgnoredCheck(w);
  } catch (e) { threw = true; }
  check("6. a legacy record with no dm.hook/dm.engaged/status.soft NEVER throws", !threw);
  check("6b. it still fires via the generic fallback (real text)", w.ledger.some(e => e.type === "drift" && e.data && e.data.id === rec.id && typeof e.data.text === "string" && e.data.text.length > 0));
}

console.log("\n--- 6c. regression: dev/verify-wiring-a.mjs's own §3/§3b/§4 assertions, re-run here ---");
{
  const win = newWin();
  const w = mkWorld(win, { day: 10 });
  const rec = win.codexAdd(w, { id: "thread:the-lost-heir", kind: "npc", name: "The Lost Heir",
    dm: { legs: "hook", resolved: false }, status: { known: true } });
  const fired1 = win.turnIgnoredCheck(w);
  check("6c. a FRESH thread does not fire on first observation", fired1.length === 0, JSON.stringify(fired1));
  w.clock.day = 10 + 60;
  const fired2 = win.turnIgnoredCheck(w);
  check("6c2. the SAME thread fires once IGNORED_STALE_DAYS have elapsed", fired2.length === 1 && fired2[0].id === rec.id, JSON.stringify(fired2));
  check("6c3. immediate re-check same day does NOT re-fire", win.turnIgnoredCheck(w).length === 0);

  const w2 = mkWorld(win, { id: "w-resolved", day: 200 });
  win.codexAdd(w2, { id: "npc:resolved-thread", kind: "npc", name: "Closed Matter",
    dm: { legs: "hook", resolved: true, ignoredSinceDay: 0 } });
  win.codexAdd(w2, { id: "npc:plain", kind: "npc", name: "Just Some Guy", dm: {} });
  const fired3 = win.turnIgnoredCheck(w2);
  check("6c4. a RESOLVED thread never fires", !fired3.some(f => f.id === "npc:resolved-thread"));
  check("6c5. a record with no dm.legs/dm.hook/dm.engaged at all never fires", !fired3.some(f => f.id === "npc:plain"));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
