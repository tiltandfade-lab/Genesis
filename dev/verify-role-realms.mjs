/* Verify NPC-ROLE-REALMS (docs/NPC-ROLE-REALMS.md) — the spine+skin realm-aware role system that
   replaces rollNPC's old frontier-coast-only flat rollTable("npc-role") call.

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-coherence-dial.mjs /
   dev/verify-codex-roll.mjs / dev/verify-dm-events.mjs). NPC_ROLE_SPINE/NPC_ROLE_SKINS are
   top-level `const` in data/npc-role-skins.js — a lexical binding, never a `window` property even
   under jsdom's runScripts:"dangerously" (same const-vs-window gotcha this codebase's other verify
   harnesses already document) — so this file appends same-scope accessor FUNCTION declarations
   (those DO attach to window) rather than reading the consts directly off `win`.

   Covers the executor brief's 5-point test plan:
     1. Gen output shape    — 35 spine archetypes; every REALM_ID has a skin; every non-dropped
                              archetype has a label; every ADD row carries role/weight/cls/note.
     2. Weighted pick       — dropped (weight-0) archetypes never appear for that realm (RED-FIRST:
                              mutate a drop's weight positive, show it leaks; restore, show it's gone
                              again); higher-weight archetypes appear proportionally more often.
     3. Realm-correct labels — noir never yields a frontier-only dropped label; cosmic never yields
                              its dropped labor labels; realm ADDs actually appear in the pool.
     4. Migration parity (RED-FIRST) — a 'frontier' roll over N≈3000 reproduces today's labor/craft-
                              heavy top archetypes (Hauler > Wild-provider > Land-worker > Maker, the
                              spine's 4 strictly-highest defaults) within a documented tolerance;
                              mutating the spine to uniform weights breaks that ordering (shown RED),
                              then restoring recovers it.
     5. rollNPC integration  — rollNPC({region:{realm:'noir',...}}) returns a valid NPC whose
                              rolled.role is a noir label + rolled.archetypeKey is set; want/name/
                              coherence still behave; role fires even at the archetype tier.
   Plus a light smoke check (§6) on the opts.hybridRealm seam (NPC-ROLE-REALMS.md §Hybridization).

   Run:  node dev/verify-role-realms.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src
  + "\nfunction __npcRoleSpine(){return NPC_ROLE_SPINE;}"
  + "\nfunction __npcRoleSkins(){return NPC_ROLE_SKINS;}"
  + "\nfunction __realmIds(){return REALM_IDS;}");

let SPINE = win.__npcRoleSpine();
let SKINS = win.__npcRoleSkins();
const REALM_IDS = win.__realmIds();

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ============================================================================
// 0. SYMBOLS
// ============================================================================
check("global roleForRealm", typeof win.roleForRealm === "function");
check("global rollNPC", typeof win.rollNPC === "function");

// ============================================================================
// 1. GEN OUTPUT SHAPE
// ============================================================================
check("NPC_ROLE_SPINE has exactly 35 entries", Array.isArray(SPINE) && SPINE.length === 35, String(SPINE.length));
{
  const keys = SPINE.map(a => a.key).sort((a, b) => a - b);
  const expected = Array.from({ length: 35 }, (_, i) => i + 1);
  check("NPC_ROLE_SPINE keys are exactly 1..35", JSON.stringify(keys) === JSON.stringify(expected));
  const allHaveShape = SPINE.every(a => typeof a.archetype === "string" && a.archetype.length
    && typeof a.note === "string" && a.note.length && typeof a.weight === "number" && a.weight > 0
    && typeof a.cls === "string" && a.cls.length);
  check("every spine archetype has {archetype,note,weight>0,cls}", allHaveShape);
}
check(`every REALM_ID (${REALM_IDS.length}) has a skin in NPC_ROLE_SKINS`,
  REALM_IDS.every(r => SKINS[r]), JSON.stringify(REALM_IDS.filter(r => !SKINS[r])));
{
  let labelsOk = true, addsOk = true, addsPresent = true;
  const badRealms = [];
  for (const realmId of REALM_IDS) {
    const skin = SKINS[realmId];
    for (const a of SPINE) {
      const row = skin.reskin[String(a.key)];
      const dropped = row && row.weight === 0;
      if (!dropped) {
        const label = (row && row.label) || a.archetype;
        if (!label || !label.trim().length || label.trim() === "—") { labelsOk = false; badRealms.push(`${realmId}#${a.key}`); }
      }
    }
    if (!Array.isArray(skin.adds) || !skin.adds.length) addsPresent = false;
    for (const add of skin.adds || []) {
      if (!(add.role && add.role.length && typeof add.weight === "number" && add.weight > 0
            && add.cls && add.cls.length && add.note && add.note.length)) addsOk = false;
    }
  }
  check("every non-dropped archetype carries a real label, in every realm", labelsOk, JSON.stringify(badRealms));
  check("every realm authors at least one [ADD] role", addsPresent);
  check("every [ADD] row carries role+weight+cls+note", addsOk);
}

// ============================================================================
// helper: tally N roleForRealm(realmId) picks by archetypeKey
// ============================================================================
function tally(realmId, n, opts) {
  const t = {};
  for (let i = 0; i < n; i++) {
    const r = win.roleForRealm(realmId, undefined, opts);
    const k = String(r.archetypeKey);
    t[k] = (t[k] || 0) + 1;
  }
  return t;
}

// ============================================================================
// 2. WEIGHTED PICK HONORS WEIGHTS
// ============================================================================
{
  // Noir drops archetype keys 1 (Land-worker), 2 (Wild-provider), 12 (Outfitter) — weight 0.
  const N = 1000;
  const before = tally("noir", N);
  const droppedNeverAppear = ["1", "2", "12"].every(k => !before[k]);
  check(`weighted pick: noir's dropped archetypes (1,2,12) never appear (N=${N})`, droppedNeverAppear,
    JSON.stringify(before));

  // --- RED-FIRST: force noir's archetype-1 (Land-worker) weight positive (simulating the exact
  //     drop-exclusion bug this check exists to catch), re-tally, confirm it NOW leaks through
  //     (RED as expected), then restore weight 0 and confirm the guarantee holds again. ---
  const realWeight = SKINS.noir.reskin["1"].weight; // 0
  SKINS.noir.reskin["1"].weight = 5; // mutate: un-drop it
  const mutated = tally("noir", N);
  const leaked = mutated["1"] > 0;
  console.log(`  [mutation] forced noir archetype-1 (dropped) weight 0->5 -> it now appears ${mutated["1"] || 0}/${N} times -> RED as expected: ${leaked}`);
  check("MUTATION: un-dropping noir archetype-1 makes the drop-exclusion check fail (shown RED)", leaked);
  SKINS.noir.reskin["1"].weight = realWeight; // restore
  const restored = tally("noir", N);
  check("MUTATION restored: noir archetype-1 is excluded again after undoing the mutation", !restored["1"]);

  // Higher-weight archetypes appear proportionally more (frontier: Hauler weight 10 vs Performer weight 1).
  const N2 = 3000;
  const frontierTally = tally("frontier", N2);
  const haulerPct = ((frontierTally["3"] || 0) / N2) * 100;
  const performerPct = ((frontierTally["18"] || 0) / N2) * 100;
  check(`weighted pick: frontier Hauler (weight 10, ${haulerPct.toFixed(1)}%) fires far more than Performer (weight 1, ${performerPct.toFixed(1)}%)`,
    haulerPct > performerPct * 3, `hauler=${haulerPct.toFixed(1)}% performer=${performerPct.toFixed(1)}%`);
}

// ============================================================================
// 3. REALM-CORRECT LABELS
// ============================================================================
{
  const N = 800;
  let noirNeverFrontierFarmer = true, noirAddSeen = false;
  for (let i = 0; i < N; i++) {
    const r = win.roleForRealm("noir");
    if (r.label === "Farmer or Grower") noirNeverFrontierFarmer = false; // the frontier label for the archetype noir drops
    if (String(r.archetypeKey).startsWith("add:")) noirAddSeen = true;
  }
  check(`a noir roll never yields the frontier "Farmer or Grower" label (N=${N})`, noirNeverFrontierFarmer);
  check("noir adds (private eye / fatale / etc.) actually appear in the pool", noirAddSeen);

  let cosmicNeverDroppedLabor = true, cosmicAddSeen = false;
  for (let i = 0; i < N; i++) {
    const r = win.roleForRealm("cosmic");
    if (r.archetypeKey === 1 || r.archetypeKey === 3) cosmicNeverDroppedLabor = false; // Land-worker/Hauler, both dropped in cosmic
    if (String(r.archetypeKey).startsWith("add:")) cosmicAddSeen = true;
  }
  check(`cosmic never yields its dropped labor archetypes (Land-worker key 1 / Hauler key 3) (N=${N})`, cosmicNeverDroppedLabor);
  check("cosmic adds (star-reader / touched pilgrim / etc.) actually appear in the pool", cosmicAddSeen);
}

// ============================================================================
// 4. MIGRATION PARITY (RED-FIRST) — frontier reproduces today's npc-role distribution shape.
//    TOLERANCE (documented + deliberately loose, per the brief: "pick + DOCUMENT a defensible
//    tolerance; assert the shape... not exact counts"): the spine's 4 strictly-highest-weight
//    archetypes are Hauler=10, Wild-provider=8, Land-worker=6, Maker=5 — the TOP 2 (10 vs 8, a
//    2-point/~20% relative gap) are asserted in STRICT rank order (sampling SD at N=8000 for an
//    ~8%-of-pool proportion is ~0.3pp, so a real order flip there needs a real weighting bug).
//    Land-worker(6) vs Maker(5) is only a 1-point/~17% relative gap — too close for a reliable
//    strict-order assertion at any sane N (that's exactly what flipped in an earlier draft of this
//    harness at N=3000: a legitimate false-flake, not a real bug) — so those two are asserted as a
//    SET (both must be in the top 4; order between them isn't asserted). This is still a real
//    shape/no-wild-inversion check: it would catch a weight-corruption bug (e.g. Hauler dropping
//    out of the top 4, or a weight-4 archetype like Enforcer/Servant/Trader climbing above Maker).
// ============================================================================
{
  const N = 8000;
  const t = tally("frontier", N);
  const pct = (k) => ((t[k] || 0) / N) * 100;
  const ranked = Object.keys(t).filter(k => !k.startsWith("add:")).sort((a, b) => (t[b] || 0) - (t[a] || 0));
  const top4 = ranked.slice(0, 4);
  const expectedTop2 = ["3", "2"];             // Hauler, Wild-provider (weights 10, 8 — well-separated)
  const expectedTop4Set = new Set(["3", "2", "1", "7"]); // + Land-worker, Maker (weights 6, 5 — order not asserted)
  console.log(`  [migration] frontier top-4 archetype keys (empirical rank): ${JSON.stringify(top4)} `
    + `(pcts: ${top4.map(k => pct(k).toFixed(1) + "%").join(", ")}) vs expected top-2 ${JSON.stringify(expectedTop2)} `
    + `+ set ${JSON.stringify([...expectedTop4Set])}`);
  const top2Ok = JSON.stringify(top4.slice(0, 2)) === JSON.stringify(expectedTop2);
  const setOk = top4.length === 4 && top4.every(k => expectedTop4Set.has(k));
  check("migration parity: frontier's top-2 (Hauler, Wild-provider) match the spine's top-2-by-weight, in strict order",
    top2Ok, JSON.stringify(top4.slice(0, 2)));
  check("migration parity: frontier's top-4 SET (+Land-worker, Maker) matches the spine's top-4-by-weight (order unasserted for the close pair)",
    setOk, JSON.stringify(top4));

  // --- RED-FIRST: force every spine archetype to weight 1 (uniform pool — the exact bug this
  //     check exists to catch: a weighting regression that makes every role equally likely),
  //     re-tally frontier, confirm Hauler's share collapses toward uniform (~1/35≈2.9% of the
  //     spine-only slice) and the ordering assertion above would now fail (RED), then restore. ---
  const savedWeights = SPINE.map(a => a.weight);
  SPINE.forEach(a => { a.weight = 1; });
  const uniformTally = tally("frontier", N);
  const haulerUniformPct = ((uniformTally["3"] || 0) / N) * 100;
  const brokenAsExpected = haulerUniformPct < (pct("3") / 2); // collapsed well below its real weighted share
  console.log(`  [mutation] spine forced to uniform weight -> frontier Hauler share ${haulerUniformPct.toFixed(1)}% `
    + `(was ${pct("3").toFixed(1)}%) -> RED as expected: ${brokenAsExpected}`);
  check("MUTATION: forcing uniform spine weights collapses Hauler's dominant share (shown RED)", brokenAsExpected);
  SPINE.forEach((a, i) => { a.weight = savedWeights[i]; }); // restore
  const restoredTally = tally("frontier", N);
  const restoredTop4 = Object.keys(restoredTally).filter(k => !k.startsWith("add:"))
    .sort((a, b) => (restoredTally[b] || 0) - (restoredTally[a] || 0)).slice(0, 4);
  const restoredOk = JSON.stringify(restoredTop4.slice(0, 2)) === JSON.stringify(expectedTop2)
    && restoredTop4.length === 4 && restoredTop4.every(k => expectedTop4Set.has(k));
  check("MUTATION restored: frontier's top-2 order + top-4 set are back to normal after undoing the mutation",
    restoredOk, JSON.stringify(restoredTop4));
}

// ============================================================================
// 5. rollNPC INTEGRATION
// ============================================================================
function validNpcShape(npc) {
  return !!(npc && npc.kind === "npc" && npc.provenance === "rolled" && typeof npc.name === "string" && npc.name.length
    && npc.rolled && npc.rolled.want && npc.rolled.role
    && npc.fields && npc.fields.species && npc.fields.role
    && npc.dm && npc.dm.want);
}
{
  const NOIR_DROPPED_FRONTIER_LABELS = new Set(["Farmer or Grower", "Hunter, Fisher, or Trapper", "Wheelwright or Ostler"]);
  const N = 300;
  let allValid = true, allNoirLabeled = true, allArchetypeKeySet = true;
  for (let i = 0; i < N; i++) {
    const npc = win.rollNPC({ region: { realm: "noir" } });
    if (!validNpcShape(npc)) allValid = false;
    if (NOIR_DROPPED_FRONTIER_LABELS.has(npc.rolled.role)) allNoirLabeled = false;
    if (npc.rolled.archetypeKey === null || npc.rolled.archetypeKey === undefined) allArchetypeKeySet = false;
  }
  check(`rollNPC({region:{realm:'noir'}}) always returns a valid NPC shape (N=${N})`, allValid);
  check("rollNPC noir NPCs never carry a frontier-only dropped label", allNoirLabeled);
  check("rollNPC noir NPCs always carry rolled.archetypeKey", allArchetypeKeySet);

  // opts.realm (flat alias, no .region) also resolves realm-aware role.
  const flatNpc = win.rollNPC({ realm: "cosmic" });
  check("rollNPC({realm:'cosmic'}) (flat alias, no .region) still realm-resolves",
    validNpcShape(flatNpc) && flatNpc.rolled.archetypeKey !== null && flatNpc.rolled.archetypeKey !== undefined,
    JSON.stringify(flatNpc && flatNpc.rolled));

  // role fires at EVERY coherence tier, including forced archetype (walkOn / roleHint / explicit).
  let roleAlwaysFiresAtArchetype = true;
  for (let i = 0; i < 200; i++) {
    const npc = win.rollNPC({ region: { realm: "gloom" }, walkOn: true });
    if (npc.rolled.coherence !== "archetype" || !npc.rolled.role || npc.rolled.archetypeKey === null) roleAlwaysFiresAtArchetype = false;
  }
  check("role (+archetypeKey) fires even at the archetype coherence tier (never gated)", roleAlwaysFiresAtArchetype);

  // no region/realm at all -> old byte-identical default (frontier), never a hole.
  const bare = win.rollNPC({});
  check("rollNPC({}) with no region/realm still returns a valid NPC (frontier default)", validNpcShape(bare));
}

// ============================================================================
// 6. HYBRIDIZATION SEAM SMOKE TEST (opts.hybridRealm — additive, opt-in; NPC-ROLE-REALMS.md
//    §Hybridization). Not in the executor brief's numbered 5, but proves the wired mechanism.
// ============================================================================
{
  const rimRegion = { center: { q: 1000, r: 1000 } }; // hexDist >> FRAY_D=40 -> frayLevel clamps to 1
  let sawHybridAdd = false, sawHome = false;
  const N = 400;
  for (let i = 0; i < N; i++) {
    const npc = win.rollNPC({ region: { realm: "frontier", center: rimRegion.center }, hybridRealm: "theater" });
    const k = String(npc.rolled.archetypeKey);
    const isTheaterAdd = k.startsWith("add:") && (SKINS.theater.adds || []).some(a => "add:" + a.role === k);
    if (isTheaterAdd) sawHybridAdd = true; else sawHome = true;
  }
  check(`opts.hybridRealm seam: a high-fray frontier roll sometimes draws a theater edge-add (N=${N})`, sawHybridAdd);
  check("opts.hybridRealm seam: it stays a MINORITY — home-realm picks still occur too", sawHome);

  // no hybridRealm passed -> byte-identical to before this rider (never fires).
  let neverHybridWithoutOptIn = true;
  for (let i = 0; i < 200; i++) {
    const npc = win.rollNPC({ region: { realm: "frontier", center: rimRegion.center } });
    const k = String(npc.rolled.archetypeKey);
    if (k.startsWith("add:") && (SKINS.theater.adds || []).some(a => "add:" + a.role === k)) neverHybridWithoutOptIn = false;
  }
  check("without opts.hybridRealm, a frontier roll never draws a theater add even at high fray (no regression)", neverHybridWithoutOptIn);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
