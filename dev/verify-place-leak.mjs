/* Verify PLACE-GEN §5 unit 5 (docs/PLACE-GEN.md) — the breach leak: rollPlace(opts) now accepts an
   ADDITIVE opts.hybridRealm. When present AND fray>0 (opts.region.center via frayLevel, same
   convention as rollNPC's hybridization rider), a fray-scaled MINORITY of mints
   (p=min(0.35, fray*ROLE_HYBRID_K) — the SAME shared constant as the NPC leak, never forked) draw
   their WHOLE archetype from opts.hybridRealm's skin (§4 "the frontier town with one Theater mess
   tent" — the whole breached skin, deliberately broader than the NPC leak's addsOnly narrowing).
   On a leak hit: rolled.hybridRealm=<hybridRealm> and dm.dressing.hybridProps=<hybridRealm>
   (additive; home props/surfaces pointers unchanged).

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-place-roll.mjs).

   Covers the task brief:
     (a) RED-FIRST — leaky-breach fixture (fray>=0.7, so p caps at 0.35): {realm:'frontier',
         hybridRealm:'gloom', region with fray-yielding center} → 500 mints → gloom-skin labels
         PRESENT but <40% (and >10%, sanity floor). Leaked mints carry
         dm.dressing.hybridProps==='gloom' and rolled.hybridRealm==='gloom'. Proven RED against the
         unmodified rollPlace (no hybridRealm handling existed at all — zero gloom labels), then
         GREEN once wired.
     (b) no-breach fixture (no hybridRealm passed) → ZERO gloom labels in 500 mints, and
         dm.dressing has NO hybridProps key on any mint.
     (c) shared-constant guard — temporarily redefine ROLE_HYBRID_K in the harness scope and
         observe the leak rate move (the mutation test: a forked/duplicated constant would NOT
         respond to this redefinition).

   Run:  node dev/verify-place-leak.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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

function boot() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src
    + "\nfunction __placeSkins(){return PLACE_SKINS;}"
    + "\nfunction __roleHybridK(){return ROLE_HYBRID_K;}"
    + "\nfunction __setRoleHybridK(v){ROLE_HYBRID_K=v;}");
  return win;
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// fray = min(1, hexDist(q,r)/40). q=28,r=0 -> hexDist=28 -> fray=0.7, so p = min(0.35, 0.7*K) caps
// exactly at 0.35 for the default K=0.5 (§5 unit 5 fixture: "fray high enough that p caps").
const LEAKY_REGION = { realm: "frontier", center: { q: 28, r: 0 } };

// ============================================================================
// (a) RED-FIRST — leaky-breach fixture
// ============================================================================
{
  const win = boot();
  const SKINS = win.__placeSkins();
  const gloomLabels = new Set(
    Object.values(SKINS.gloom.reskin).map((r) => r.label)
      .concat(SKINS.gloom.adds.map((a) => a.label))
  );

  const N = 500;
  let gloomLabelHits = 0, taggedHybridProps = 0, taggedRolledHybrid = 0, mismatchTag = 0;
  for (let i = 0; i < N; i++) {
    const r = win.rollPlace({ realm: "frontier", hybridRealm: "gloom", region: LEAKY_REGION });
    const isGloomLabel = r.fields && gloomLabels.has(r.fields.type);
    if (isGloomLabel) gloomLabelHits++;
    const hasHybridProps = r.dm && r.dm.dressing && r.dm.dressing.hybridProps === "gloom";
    const hasRolledHybrid = r.rolled && r.rolled.hybridRealm === "gloom";
    if (hasHybridProps) taggedHybridProps++;
    if (hasRolledHybrid) taggedRolledHybrid++;
    // every leaked mint (gloom label) MUST carry both tells; every non-leaked mint must NOT.
    if (isGloomLabel !== hasHybridProps || isGloomLabel !== hasRolledHybrid) mismatchTag++;
  }
  const rate = gloomLabelHits / N;
  check("leaky fixture: gloom-skin labels present (>10% sanity floor)", rate > 0.10, `${gloomLabelHits}/${N} = ${rate}`);
  check("leaky fixture: gloom-skin labels < 40% (0.35 cap + slack)", rate < 0.40, `${gloomLabelHits}/${N} = ${rate}`);
  check("leaky fixture: dm.dressing.hybridProps==='gloom' exactly on leaked mints",
    taggedHybridProps === gloomLabelHits, `tagged=${taggedHybridProps} leaked=${gloomLabelHits}`);
  check("leaky fixture: rolled.hybridRealm==='gloom' exactly on leaked mints",
    taggedRolledHybrid === gloomLabelHits, `tagged=${taggedRolledHybrid} leaked=${gloomLabelHits}`);
  check("leaky fixture: no tag/label mismatch across all draws", mismatchTag === 0, `${mismatchTag} mismatches`);
}

// ============================================================================
// (b) no-breach fixture (no hybridRealm) → zero gloom labels, no hybridProps key anywhere
// ============================================================================
{
  const win = boot();
  const SKINS = win.__placeSkins();
  const gloomLabels = new Set(
    Object.values(SKINS.gloom.reskin).map((r) => r.label)
      .concat(SKINS.gloom.adds.map((a) => a.label))
  );

  const N = 500;
  let gloomLabelHits = 0, hybridPropsKeyPresent = 0;
  for (let i = 0; i < N; i++) {
    const r = win.rollPlace({ realm: "frontier", region: LEAKY_REGION }); // fray present, no hybridRealm
    if (r.fields && gloomLabels.has(r.fields.type)) gloomLabelHits++;
    if (r.dm && r.dm.dressing && Object.prototype.hasOwnProperty.call(r.dm.dressing, "hybridProps")) hybridPropsKeyPresent++;
  }
  check("no-breach fixture: zero gloom labels (500 draws)", gloomLabelHits === 0, `${gloomLabelHits}/${N}`);
  check("no-breach fixture: no dm.dressing.hybridProps key on any mint", hybridPropsKeyPresent === 0, `${hybridPropsKeyPresent}/${N}`);
}

// ============================================================================
// (c) shared-constant guard — redefining ROLE_HYBRID_K must move the leak rate
//     (a forked/duplicated constant would NOT respond)
// ============================================================================
{
  const win = boot();
  const N = 400;
  const rateAt = () => {
    const SKINS = win.__placeSkins();
    const gloomLabels = new Set(
      Object.values(SKINS.gloom.reskin).map((r) => r.label)
        .concat(SKINS.gloom.adds.map((a) => a.label))
    );
    let hits = 0;
    for (let i = 0; i < N; i++) {
      const r = win.rollPlace({ realm: "frontier", hybridRealm: "gloom", region: LEAKY_REGION });
      if (r.fields && gloomLabels.has(r.fields.type)) hits++;
    }
    return hits / N;
  };
  const baseRate = rateAt();
  check("guard baseline: ROLE_HYBRID_K reads as 0.5 (spec default)", win.__roleHybridK() === 0.5, `got ${win.__roleHybridK()}`);
  win.__setRoleHybridK(0); // K=0 -> p=0 -> leak rate must collapse to ~0
  const zeroRate = rateAt();
  check("MUTATION: redefining the shared ROLE_HYBRID_K to 0 collapses the leak rate",
    zeroRate < baseRate && zeroRate === 0, `base=${baseRate} afterK0=${zeroRate}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
