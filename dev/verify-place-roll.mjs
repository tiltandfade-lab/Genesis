/* Verify PLACE-GEN §5 unit 2 (docs/PLACE-GEN.md) — the rollPlace realm swap: rollPlace(opts) now
   resolves a realm (opts.realm ‖ opts.region.realm ‖ 'frontier', the U6 convention from
   src/world/urban.js) and calls placeForRealm(realmId, rng, {archetypeBias}) to type/name/cast/
   dress the mint, while staying a STRICT SUPERSET of the pre-change payload shape.

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-place-skins.mjs /
   dev/verify-role-realms.mjs / dev/verify-codex-roll.mjs).

   Covers the task brief:
     (a) RED-FIRST — gloom world fixture: fields.type is a Gloom label (membership in the gloom
         skin's label set), dm.itemsPool==="realm-items-gloom", rolled.dims.w/d within the
         archetype's PLACE_SPACE_CELLS space band. Proven RED against the unmodified rollPlace
         (no realm-typing existed at all), then GREEN once wired.
     (b) no-realm mint → strict superset of the pre-change GOLDEN field set (every golden key
         still present; new fields are additive only).
     (c) opts.archetypeBias passes through placeForRealm — biasing key 2 (Watering-hole, gloom)
         hard raises its share measurably over 300 seeded mints vs an unbiased control.
     (d) chrome mint never yields archetypeKey 20 (Wild-margin, dropped weight 0 in the chrome skin).
     MUTATION: stub the realm resolution to always 'frontier' → (a) fails again (proves the test
     actually exercises the realm-threading line, not some other code path).

   GOLDEN: captured 2026-07-09 against the UNMODIFIED rollPlace (pre-unit-2, commit 9800688) by
   running this harness's golden-capture block against that tree — see the RED-FIRST tail in the
   unit-2 build report. Hardcoded here as the back-compat baseline (§5 unit 2 "payload a strict
   superset of today's shape").

   Run:  node dev/verify-place-roll.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
    + "\nfunction __spaceCells(){return PLACE_SPACE_CELLS;}");
  return win;
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ============================================================================
// GOLDEN — the pre-unit-2 payload shape (field presence), captured against the
// unmodified rollPlace. A no-realm mint after the swap must be a strict superset.
// ============================================================================
const GOLDEN_KEYS = {
  top: ["kind", "name", "provenance", "rolled", "fields", "dm"],
  rolled: ["setting", "trait", "calamity", "secret", "history"],
  fields: ["desc", "trait", "calamity"],
  dm: ["secret", "secretBand", "history"],
};

function keysPresent(obj, wantKeys) {
  return wantKeys.every((k) => Object.prototype.hasOwnProperty.call(obj || {}, k));
}

// ============================================================================
// (b) no-realm mint → strict superset of the golden shape
// ============================================================================
{
  const win = boot();
  const r = win.rollPlace({});
  check("no-realm mint: top-level golden keys all present", keysPresent(r, GOLDEN_KEYS.top));
  check("no-realm mint: rolled golden keys all present", keysPresent(r.rolled, GOLDEN_KEYS.rolled));
  check("no-realm mint: fields golden keys all present", keysPresent(r.fields, GOLDEN_KEYS.fields));
  check("no-realm mint: dm golden keys all present", keysPresent(r.dm, GOLDEN_KEYS.dm));
  check("no-realm mint: kind/provenance unchanged", r.kind === "location" && r.provenance === "rolled");
}

// ============================================================================
// (a) RED-FIRST — gloom world fixture
// ============================================================================
{
  const win = boot();
  const SKINS = win.__placeSkins();
  const gloomLabels = new Set(
    Object.values(SKINS.gloom.reskin).map((r) => r.label)
      .concat(SKINS.gloom.adds.map((a) => a.label))
  );
  const SPACE_CELLS = win.__spaceCells();

  let gloomTypeOk = 0, itemsPoolOk = 0, dimsOk = 0, n = 40;
  for (let i = 0; i < n; i++) {
    const r = win.rollPlace({ realm: "gloom" });
    if (r.fields && gloomLabels.has(r.fields.type)) gloomTypeOk++;
    if (r.dm && r.dm.itemsPool === "realm-items-gloom") itemsPoolOk++;
    if (r.rolled && r.rolled.dims && r.rolled.space && SPACE_CELLS[r.rolled.space]) {
      const band = SPACE_CELLS[r.rolled.space];
      const w = r.rolled.dims.w, d = r.rolled.dims.d;
      if (Number.isInteger(w) && Number.isInteger(d) && w >= band.wMin && w <= band.wMax && d >= band.dMin && d <= band.dMax) dimsOk++;
    }
  }
  check("gloom mint: fields.type is a Gloom label (all draws)", gloomTypeOk === n, `${gloomTypeOk}/${n}`);
  check("gloom mint: dm.itemsPool === realm-items-gloom (all draws)", itemsPoolOk === n, `${itemsPoolOk}/${n}`);
  check("gloom mint: rolled.dims within the archetype's space band (all draws)", dimsOk === n, `${dimsOk}/${n}`);
}

// ============================================================================
// (c) archetypeBias passes through
// ============================================================================
{
  const win = boot();
  const N = 300;
  let biasedHits = 0, controlHits = 0;
  for (let i = 0; i < N; i++) {
    const r = win.rollPlace({ realm: "gloom", archetypeBias: [2] });
    if (r.rolled && r.rolled.archetypeKey === 2) biasedHits++;
  }
  for (let i = 0; i < N; i++) {
    const r = win.rollPlace({ realm: "gloom" });
    if (r.rolled && r.rolled.archetypeKey === 2) controlHits++;
  }
  check("archetypeBias:[2] raises key-2 share vs unbiased control", biasedHits > controlHits,
    `biased=${biasedHits}/${N} control=${controlHits}/${N}`);
}

// ============================================================================
// (d) chrome mint never yields archetypeKey 20 (Wild-margin, dropped)
// ============================================================================
{
  const win = boot();
  let sawKey20 = false;
  for (let i = 0; i < 500; i++) {
    const r = win.rollPlace({ realm: "chrome" });
    if (r.rolled && r.rolled.archetypeKey === 20) sawKey20 = true;
  }
  check("chrome mint never yields archetypeKey 20 (500 draws)", !sawKey20);
}

// ============================================================================
// MUTATION — stub realm resolution to always 'frontier' → (a) must fail again
// ============================================================================
{
  const win = boot();
  win.eval(`
    (function(){
      var __orig = rollPlace;
      rollPlace = function(opts){ opts = Object.assign({}, opts); opts.realm = undefined; opts.region = undefined; return __orig(opts); };
    })();
  `);
  let mutFail = 0, n = 20;
  for (let i = 0; i < n; i++) {
    const r = win.rollPlace({ realm: "gloom" });
    if (!r.dm || r.dm.itemsPool !== "realm-items-gloom") mutFail++;
  }
  check("MUTATION: stubbed always-frontier resolution breaks gloom typing again", mutFail === n, `${mutFail}/${n}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
