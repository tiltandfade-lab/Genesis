/* Verify the NPC-COHERENCE-DIAL (docs/NPC-COHERENCE-DIAL.md) — a rollNPC() generation MODE that gates
   which identity/lever atoms fire (quirk/manner/flawSecret/bond/fear/leverage/motivation) by region
   temperature, with roleHint/walkOn/explicit-coherence overrides. THE LAW: simplifies the PERSON, never
   the SITUATION — race/role/name/want/hook stay untouched; want fires at EVERY tier.

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-codex-roll.mjs /
   dev/verify-dm-events.mjs). Covers the spec's 6-check test plan in docs/NPC-COHERENCE-DIAL.md
   "Implementation spec / Test plan":
     1. Distribution   — N≈2000 rolls/temperature band, tier mix within ±3pp of the curve table.
     2. Invariant       — want/role/name non-null at every tier.
     3. Suppression     — archetype payloads: null flaw/bond/fear/leverage/motivation, ≤1 of quirk/manner.
     4. Overrides       — walkOn & roleHint -> archetype; opts.coherence -> exact tier.
     5. Null-safety     — an archetype NPC drives applyLeverage with no leverage/fear/want-lever, no throw.
     6. Regression      — existing callers (life.js/prep.js/prep-bundle.js real invocation; urban.js/
                           job-walks.js/capture.js literal call-site replication) still produce valid NPCs.

   Run:  node dev/verify-coherence-dial.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
// tables.js (the compiled artifact) populates window.GENESIS_TABLES; it isn't a manifest module.
// COHERENCE_TIERS/COHERENCE_CURVE are top-level `const` in codex-roll.js — a lexical binding, never a
// `window` property even under runScripts (same const-vs-window gotcha verify-touched-npcs.mjs / DE-14
// in verify-dm-events.mjs already document): append same-scope accessor FUNCTION declarations (those
// DO attach to window) so the harness can read them without touching the module's own const discipline.
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src
  + "\nfunction __coherenceTiers(){return COHERENCE_TIERS;}"
  + "\nfunction __coherenceCurve(){return COHERENCE_CURVE;}");

const COHERENCE_TIERS = win.__coherenceTiers();
const COHERENCE_CURVE = win.__coherenceCurve();

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ============================================================================
// 0. SYMBOLS + BOUNDARIES
// ============================================================================
for (const f of ["rollNPC", "pickCoherence", "coherenceTemperature", "pickCoherenceTier", "coherenceAtomGate"])
  check(`global ${f}`, typeof win[f] === "function", typeof win[f]);
check("COHERENCE_TIERS is the 4-tier array", JSON.stringify(COHERENCE_TIERS) === JSON.stringify(["archetype","wrinkled","layered","tangled"]));
check("COHERENCE_CURVE rows each sum to 100", ["sleepy","ordinary","uneasy","strained","breached"].every(t => {
  const row = COHERENCE_CURVE[t];
  return row.archetype + row.wrinkled + row.layered + row.tangled === 100;
}), JSON.stringify(COHERENCE_CURVE));

// coherenceTemperature band boundaries (spec §pickCoherence step 4)
check("coherenceTemperature(null) -> ordinary (no-region default)", win.coherenceTemperature(null) === "ordinary");
check("coherenceTemperature(undefined) -> ordinary", win.coherenceTemperature(undefined) === "ordinary");
check("coherenceTemperature(-1) -> ordinary (non-numeric/negative guard)", win.coherenceTemperature(-1) === "ordinary");
check("coherenceTemperature(0) -> sleepy", win.coherenceTemperature(0) === "sleepy");
check("coherenceTemperature(0.1) -> sleepy", win.coherenceTemperature(0.1) === "sleepy");
check("coherenceTemperature(0.15) -> ordinary (band edge, inclusive lower)", win.coherenceTemperature(0.15) === "ordinary");
check("coherenceTemperature(0.3) -> ordinary", win.coherenceTemperature(0.3) === "ordinary");
check("coherenceTemperature(0.4) -> uneasy (band edge)", win.coherenceTemperature(0.4) === "uneasy");
check("coherenceTemperature(0.6) -> uneasy", win.coherenceTemperature(0.6) === "uneasy");
check("coherenceTemperature(0.65) -> strained (band edge)", win.coherenceTemperature(0.65) === "strained");
check("coherenceTemperature(0.8) -> strained", win.coherenceTemperature(0.8) === "strained");
check("coherenceTemperature(0.85) -> breached (band edge)", win.coherenceTemperature(0.85) === "breached");
check("coherenceTemperature(1) -> breached", win.coherenceTemperature(1) === "breached");

// pickCoherence actually threading region.center -> frayLevel -> temperature -> tier-eligible-band:
// q=0 (fray 0, sleepy) forced through many rolls should never land tangled at a rate above the sleepy
// row's 1% by more than the statistical margin used below; spot-checked via the full distribution
// pass in section 1 (this section only proves the WIRING, not the curve numbers).
{
  const originRegion = { center: { q: 0, r: 0 } };
  let allArchetypeOrWrinkled = true;
  for (let i = 0; i < 200; i++) {
    const t = win.pickCoherence({ region: originRegion });
    if (t !== "archetype" && t !== "wrinkled" && t !== "layered" && t !== "tangled") allArchetypeOrWrinkled = false;
  }
  check("pickCoherence({region: origin}) always returns a real tier", allArchetypeOrWrinkled);
}

// ============================================================================
// 1. DISTRIBUTION (RED-FIRST candidate #1) — N=2000/band, tier mix within +/-3pp of the curve table
// ============================================================================
const N_DIST = 2000;
const MARGIN_PP = 3; // percentage points
let distAllPass = true;
const distReport = [];
for (const temp of ["sleepy", "ordinary", "uneasy", "strained", "breached"]) {
  const row = COHERENCE_CURVE[temp];
  const tally = { archetype: 0, wrinkled: 0, layered: 0, tangled: 0 };
  for (let i = 0; i < N_DIST; i++) tally[win.pickCoherenceTier(row)]++;
  let bandOk = true;
  const detail = {};
  for (const tier of COHERENCE_TIERS) {
    const pct = (tally[tier] / N_DIST) * 100;
    const expected = row[tier];
    const within = Math.abs(pct - expected) <= MARGIN_PP;
    detail[tier] = `${pct.toFixed(1)}% (expect ${expected}%)`;
    if (!within) bandOk = false;
  }
  distAllPass = distAllPass && bandOk;
  distReport.push(`${temp}: ${JSON.stringify(detail)}`);
  check(`distribution: ${temp} tier mix within ±${MARGIN_PP}pp of the curve (N=${N_DIST})`, bandOk, JSON.stringify(detail));
}
console.log("  [distribution detail]\n    " + distReport.join("\n    "));

// --- RED-FIRST MUTATION CHECK (spec-required, same convention as verify-touched-npcs.mjs's
//     "MUTATION CHECK"): force pickCoherenceTier to ignore the curve row entirely (always "tangled"),
//     re-run the ordinary-band distribution assertion, confirm it is now VIOLATED (proves check #1
//     has real teeth — it would catch a broken weighting), then restore and re-confirm green. ---
{
  const realFn = win.pickCoherenceTier;
  win.pickCoherenceTier = function () { return "tangled"; };   // mutate: ignore the row's weights entirely
  const row = COHERENCE_CURVE.ordinary;
  const tally = { archetype: 0, wrinkled: 0, layered: 0, tangled: 0 };
  for (let i = 0; i < N_DIST; i++) tally[win.pickCoherenceTier(row)]++;
  const archPct = (tally.archetype / N_DIST) * 100;
  const brokenAsExpected = Math.abs(archPct - row.archetype) > MARGIN_PP; // 0% archetype vs expected 58%
  console.log(`  [mutation] pickCoherenceTier forced constant "tangled" -> ordinary-band archetype rate = ${archPct.toFixed(1)}% (expected ~${row.archetype}%) -> RED as expected: ${brokenAsExpected}`);
  check("MUTATION #1: forcing pickCoherenceTier constant breaks the distribution guarantee (shown RED)", brokenAsExpected);
  win.pickCoherenceTier = realFn;   // restore
  const tally2 = { archetype: 0, wrinkled: 0, layered: 0, tangled: 0 };
  for (let i = 0; i < N_DIST; i++) tally2[win.pickCoherenceTier(row)]++;
  const archPct2 = (tally2.archetype / N_DIST) * 100;
  const restoredOk = Math.abs(archPct2 - row.archetype) <= MARGIN_PP;
  check("MUTATION #1 restored: ordinary-band archetype rate back within ±3pp after undoing the mutation", restoredOk, `${archPct2.toFixed(1)}%`);
}

// ============================================================================
// 2. INVARIANT — want/role/name non-null at EVERY tier (all 4 explicit + natural random)
// ============================================================================
{
  let ok = true, checked = 0;
  for (const tier of COHERENCE_TIERS) {
    for (let i = 0; i < 500; i++) {
      const npc = win.rollNPC({ coherence: tier });
      checked++;
      if (!(npc.rolled.want && npc.rolled.role && typeof npc.name === "string" && npc.name.length
            && npc.fields.role && npc.dm.want)) { ok = false; break; }
    }
  }
  check(`invariant: want/role/name non-null at every explicit tier (${checked} rolls)`, ok, `checked=${checked}`);
}
{
  // natural (no override) rolls too — the region-temperature path must not accidentally null these.
  let ok = true;
  for (let i = 0; i < 500; i++) {
    const npc = win.rollNPC({});
    if (!(npc.rolled.want && npc.rolled.role && npc.name && npc.dm.want)) { ok = false; break; }
  }
  check("invariant: want/role/name non-null across 500 natural (unforced-tier) rolls", ok);
}

// ============================================================================
// 3. SUPPRESSION (RED-FIRST candidate #2) — archetype payloads
// ============================================================================
{
  const N_SUP = 500;
  let leversAlwaysNull = true, graceAtMostOne = true, graceEverFires = false, graceEverAbsent = false;
  let leverKeysHit = { flawSecret: 0, bond: 0, fear: 0, leverage: 0, motivation: 0 };
  for (let i = 0; i < N_SUP; i++) {
    const npc = win.rollNPC({ coherence: "archetype" });
    if (npc.rolled.flawSecret !== null) leversAlwaysNull = false;
    if (npc.rolled.bond !== null) leversAlwaysNull = false;
    if (npc.rolled.fear !== null) leversAlwaysNull = false;
    if (npc.rolled.leverage !== null) leversAlwaysNull = false;
    if (npc.rolled.motivation !== null) leversAlwaysNull = false;
    if (npc.dm.secret !== null) leversAlwaysNull = false;
    if (npc.dm.fear !== null) leversAlwaysNull = false;
    if (npc.dm.bond !== null) leversAlwaysNull = false;
    if (npc.dm.leverage !== null) leversAlwaysNull = false;
    if (npc.dm.motivation !== null) leversAlwaysNull = false;
    const graceCount = (npc.rolled.quirk !== null ? 1 : 0) + (npc.rolled.mannerism !== null ? 1 : 0);
    if (graceCount > 1) graceAtMostOne = false;
    if (graceCount === 1) graceEverFires = true;
    if (graceCount === 0) graceEverAbsent = true;
  }
  check(`suppression: archetype never fires flaw/bond/fear/leverage/motivation (rolled+dm, N=${N_SUP})`, leversAlwaysNull);
  check(`suppression: archetype fires ≤1 of {quirk,manner} every roll (N=${N_SUP})`, graceAtMostOne);
  check("suppression: the single grace-note DOES fire sometimes (not permanently suppressed)", graceEverFires);
  check("suppression: the grace-note is also sometimes ABSENT (a pure archetype can read clean)", graceEverAbsent);

  // --- RED-FIRST MUTATION CHECK (spec-required): force coherenceAtomGate("archetype") to ALSO fire
  //     `bond` (simulating the exact suppression bug the spec exists to prevent — an identity/lever
  //     atom leaking through on a clean archetype), re-sample, confirm the "never fires" assertion is
  //     now VIOLATED, then restore and re-confirm green. ---
  const realGate = win.coherenceAtomGate;
  win.coherenceAtomGate = function (tier) {
    const g = realGate(tier);
    if (tier === "archetype") g.bond = true;   // mutate: leak a suppressed lever through
    return g;
  };
  let mutatedLeversAlwaysNull = true;
  for (let i = 0; i < N_SUP; i++) {
    const npc = win.rollNPC({ coherence: "archetype" });
    if (npc.rolled.bond !== null || npc.dm.bond !== null) mutatedLeversAlwaysNull = false;
  }
  const brokenAsExpected = mutatedLeversAlwaysNull === false;
  console.log(`  [mutation] coherenceAtomGate("archetype") forced to also fire 'bond' -> suppression held: ${mutatedLeversAlwaysNull} -> RED as expected: ${brokenAsExpected}`);
  check("MUTATION #2: leaking 'bond' through the archetype gate breaks the suppression guarantee (shown RED)", brokenAsExpected);
  win.coherenceAtomGate = realGate;   // restore
  let restoredLeversAlwaysNull = true;
  for (let i = 0; i < N_SUP; i++) {
    const npc = win.rollNPC({ coherence: "archetype" });
    if (npc.rolled.bond !== null || npc.dm.bond !== null) restoredLeversAlwaysNull = false;
  }
  check("MUTATION #2 restored: archetype bond stays null again after undoing the mutation", restoredLeversAlwaysNull);
}

// ============================================================================
// 4. OVERRIDES — walkOn & roleHint -> archetype (even in a breached/tangled-favoring region);
//                opts.coherence -> exact tier (even overriding roleHint).
// ============================================================================
{
  const breachedRegion = { center: { q: 1000, r: 1000 } }; // hexDist >> FRAY_D=40 -> frayLevel clamps to 1 -> breached band
  let walkOnOk = true, roleHintOk = true;
  const N_OV = 300;
  for (let i = 0; i < N_OV; i++) {
    const w1 = win.rollNPC({ walkOn: true, region: breachedRegion });
    if (w1.rolled.coherence !== "archetype") walkOnOk = false;
    const w2 = win.rollNPC({ roleHint: "questgiver", region: breachedRegion });
    if (w2.rolled.coherence !== "archetype") roleHintOk = false;
  }
  check(`override: opts.walkOn forces archetype in a breached (tangled-favoring) region (N=${N_OV})`, walkOnOk);
  check(`override: opts.roleHint forces archetype in a breached region (N=${N_OV})`, roleHintOk);

  let coherenceOverrideOk = true;
  for (const tier of COHERENCE_TIERS) {
    for (let i = 0; i < 100; i++) {
      // opts.coherence wins over roleHint (pickCoherence step 1 beats step 3) — a real conflict case.
      const npc = win.rollNPC({ coherence: tier, roleHint: "jailer", region: breachedRegion });
      if (npc.rolled.coherence !== tier) coherenceOverrideOk = false;
    }
  }
  check("override: opts.coherence picks the EXACT tier every time, even overriding a present roleHint", coherenceOverrideOk);

  check("pickCoherence: bad/unknown opts.coherence string falls through to the region-band roll (not treated as a valid override)",
    ["archetype","wrinkled","layered","tangled"].indexOf(win.pickCoherence({ coherence: "nonsense-tier" })) >= 0);
}

// ============================================================================
// 5. NULL-SAFETY — an archetype NPC drives applyLeverage with leverage/fear/want-lever absent, no throw.
// ============================================================================
{
  let threw = false, allDcSane = true;
  const N_NS = 500;
  for (let i = 0; i < N_NS; i++) {
    const npc = win.rollNPC({ coherence: "archetype" });
    // faithfully reproduce a naive caller building a levers array straight off the NPC's dm payload
    // WITHOUT filtering nulls first (dm.leverage/dm.fear/dm.bond/dm.motivation are null for archetype;
    // only dm.want is guaranteed non-null) — this is exactly the shape applyLeverage must tolerate.
    const levers = [
      npc.dm.leverage ? { type: "leverage" } : npc.dm.leverage,
      npc.dm.fear ? { type: "fear" } : npc.dm.fear,
      npc.dm.bond ? { type: "bond" } : npc.dm.bond,
      npc.dm.motivation,
      { type: "want", decisive: false },
    ];
    try {
      const res = win.applyLeverage(15, levers);
      if (!(res && (typeof res.dc === "number" || res.dc === null))) allDcSane = false;
    } catch (e) { threw = true; }
  }
  check(`null-safety: applyLeverage never throws against ${N_NS} archetype NPCs' null-heavy dm levers`, !threw);
  check("null-safety: applyLeverage always returns a sane {dc} shape (number or null)", allDcSane);
  // spec check #5 also requires "verify-dm-events.mjs stays green" — run separately (see report / the
  // full dev/verify-*.mjs sweep), not spawned from inside this harness.
}

// ============================================================================
// 6. REGRESSION — existing callers still produce valid NPCs.
//    life.js / prep.js / prep-bundle.js: REAL function invocation (minimal fixtures).
//    urban.js / job-walks.js / capture.js: literal call-site replication (see report — the real
//    functions need building-kit/job-board/prep-cast scaffolding out of this unit's scope; the exact
//    rollNPC(...) opts shape each site calls with is reproduced verbatim below).
// ============================================================================
function validNpcShape(npc) {
  return !!(npc && npc.kind === "npc" && npc.provenance === "rolled" && typeof npc.name === "string" && npc.name.length
    && npc.rolled && npc.rolled.want && npc.rolled.role
    && npc.fields && npc.fields.species && npc.fields.role
    && npc.dm && npc.dm.want);
}

// --- life.js: tiylBackfillPeople(w,c) — real invocation ---
{
  const w = { id: "w-life", name: "LifeFixture", gazetteer: [], factions: [], ledger: [], clock: { day: 1, min: 360 } };
  const c = { id: "char-1" };
  w.ledger.push({ id: "lg-1", type: "npc-life", data: { fromChar: "char-1", role: "a dwarf sailor", desc: "gruff but loyal", species: "Dwarf" } });
  const ids = win.tiylBackfillPeople(w, c);
  check("regression life.js: tiylBackfillPeople minted a record", Array.isArray(ids) && ids.length === 1, JSON.stringify(ids));
  const rec = win.codexGet(w, ids[0]);
  check("regression life.js: minted record is a valid NPC shape", validNpcShape(rec), JSON.stringify(rec));
}

// --- prep.js: prepCastAmbient(w, nodeId) — real invocation ---
{
  const w = { id: "w-prep", name: "PrepFixture", gazetteer: [], factions: [], ledger: [], clock: { day: 1, min: 360 },
    map: { nodes: {}, edges: [] }, currentNodeId: null, regions: {} };
  const nodeId = win.addNode(w, "Prep Fixture Node", "Settlement");
  const res = win.prepCastAmbient(w, nodeId);
  check("regression prep.js: prepCastAmbient minted the ambient pool", res && res.minted > 0, JSON.stringify(res));
  const allValid = (res.ids || []).every(id => validNpcShape(win.codexGet(w, id)));
  check("regression prep.js: every ambient-minted NPC is a valid shape", allValid);
}

// --- prep-bundle.js: pbundleCast(env, region) — real invocation ---
{
  const cast = win.pbundleCast(null, null);
  check("regression prep-bundle.js: pbundleCast produced a cast bundle", !!(cast && cast.location && Array.isArray(cast.npcs) && cast.npcs.length >= 1), JSON.stringify(cast && Object.keys(cast)));
  const allValid = !!cast && cast.npcs.every(validNpcShape);
  check("regression prep-bundle.js: every cast NPC (questgiver + companion) is a valid shape", allValid, JSON.stringify(cast && cast.npcs));
}

// --- urban.js literal call-site replication: rollNPC({ roleHint: rolled.kit.proprietorRoleHint, region }) ---
{
  const npc = win.rollNPC({ roleHint: "proprietor", region: null });
  check("regression urban.js call-site: rollNPC({roleHint:'proprietor', region}) still valid + forced archetype", validNpcShape(npc) && npc.rolled.coherence === "archetype", JSON.stringify(npc));
}

// --- job-walks.js literal call-site replication: rollNPC({region, roleHint:"employer"}) ---
{
  const npc = win.rollNPC({ region: null, roleHint: "employer" });
  check("regression job-walks.js call-site: rollNPC({region, roleHint:'employer'}) still valid + forced archetype", validNpcShape(npc) && npc.rolled.coherence === "archetype", JSON.stringify(npc));
}

// --- capture.js literal call-site replication: rollNPC({ roleHint:"jailer", region:jailerRegion }) ---
{
  const npc = win.rollNPC({ roleHint: "jailer", region: null });
  check("regression capture.js call-site: rollNPC({roleHint:'jailer', region}) still valid + forced archetype", validNpcShape(npc) && npc.rolled.coherence === "archetype", JSON.stringify(npc));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
