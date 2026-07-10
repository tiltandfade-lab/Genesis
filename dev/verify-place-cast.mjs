/* Verify PLACE-GEN §5 unit 3 (docs/PLACE-GEN.md) — cast wiring: a minted place's anchor NPC picks
   its role via roleForRealm FILTERED to the place's castProfile anchor class (bounded retry,
   ROLE_CLASS_RETRY_BOUND=12 in src/engine/codex-roll.js's rollNPC), never dangling when a class has
   zero candidates in a realm's skin; and SCENE_BUCKET_BY_ARCHETYPE (data/place-skins.js, generated
   by build/gen-place-skins.py) resolves an ambient-population scene-bucket for every spine key.

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-place-roll.mjs /
   dev/verify-place-skins.mjs).

   Covers the task brief:
     (a) RED-FIRST — force a Watering-hole (key 2, castProfile anchor "trade") mint via
         archetypeBias, then roll rollNPC({roleClass: cast.anchor}) 200 times: cls==="trade" share
         > 0.9 (allowing the never-dangle fallback's rare tail). Also proves the fallback path is
         REACHABLE and doesn't hang: rollNPC({roleClass:"nonexistent-class"}) completes and still
         mints (roleCls !== the impossible class, since it fell through to the unfiltered pick).
     (b) MUTATION — stub roleForRealm to ignore cls entirely (return the same cand regardless) so
         the filter can never match on purpose; the class-match share collapses far below the (a)
         threshold, proving (a) actually exercises the filter (not some unrelated code path).
     (c) SCENE_BUCKET_BY_ARCHETYPE / sceneBucketForArchetype resolves (never undefined) for all 24
         spine keys + every authored realm's [ADD] keys.
     (d) regen determinism — run separately by the caller (`python3 build/gen-place-skins.py` twice,
         `git diff --stat data/place-skins.js` must be empty); this harness doesn't shell out.

   Run:  node dev/verify-place-cast.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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

function boot(extraJs) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src
    + "\nfunction __placeSpine(){return PLACE_SPINE;}"
    + "\nfunction __placeSkins(){return PLACE_SKINS;}"
    + "\nfunction __sceneBucketMap(){return SCENE_BUCKET_BY_ARCHETYPE;}"
    + "\nfunction __sceneBucketDefault(){return SCENE_BUCKET_DEFAULT;}"
    + (extraJs || ""));
  return win;
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// draw a Watering-hole (key 2) mint by biasing hard, gloom realm (matches PLACE-GEN.md's worked
// example: "Watering-hole: `trade` anchor + `service`/`margin` ambient" — same key across skins).
function forceWateringHole(win) {
  for (let i = 0; i < 200; i++) {
    const r = win.rollPlace({ realm: "gloom", archetypeBias: [2] });
    if (r.rolled && r.rolled.archetypeKey === 2) return r;
  }
  return null;
}

// ============================================================================
// (a) RED-FIRST — anchor NPC's cls matches the Watering-hole's castProfile anchor ("trade")
// ============================================================================
{
  const win = boot();
  const place = forceWateringHole(win);
  check("forced a Watering-hole (key 2) mint", !!place, JSON.stringify(place && place.rolled));
  const anchorCls = place && place.rolled && place.rolled.cast && place.rolled.cast.anchor;
  check("Watering-hole castProfile anchor is 'trade'", anchorCls === "trade", String(anchorCls));

  const N = 200;
  let matchCount = 0;
  for (let i = 0; i < N; i++) {
    const npc = win.rollNPC({ roleClass: anchorCls, region: null });
    if (npc.rolled && npc.rolled.roleCls === anchorCls) matchCount++;
  }
  check("anchor NPC cls === 'trade' in > 0.9 of 200 seeded mints", matchCount / N > 0.9,
    `${matchCount}/${N}`);
}

// ============================================================================
// (a) never-dangle — a class with zero candidates in the realm's skin doesn't hang, and falls
// through to the unfiltered pick (roleCls comes back something OTHER than the impossible class,
// since no real spine/ADD row carries it).
// ============================================================================
{
  const win = boot();
  const IMPOSSIBLE = "nonexistent-class-zzz";
  const start = Date.now();
  const npc = win.rollNPC({ roleClass: IMPOSSIBLE, region: null });
  const elapsed = Date.now() - start;
  check("never-dangle: rollNPC({roleClass: impossible}) returns (no hang)", !!npc && elapsed < 2000,
    `elapsed=${elapsed}ms`);
  check("never-dangle: fallback path reached (roleCls !== the impossible class)",
    npc.rolled && npc.rolled.roleCls !== IMPOSSIBLE, String(npc.rolled && npc.rolled.roleCls));
  check("never-dangle: NPC still has a real role label (mint never dangles empty)",
    !!(npc.fields && npc.fields.role), String(npc.fields && npc.fields.role));
}

// ============================================================================
// (b) MUTATION — stub roleForRealm to never honor cls (always return the same-shaped cand whose
// cls never equals the requested roleClass) → the class-match share COLLAPSES, proving (a) actually
// exercises the filter line in rollNPC, not some unrelated code path.
// ============================================================================
{
  const win = boot(
    // stub AFTER the real roleForRealm is defined — overwrite the global with a version whose
    // returned cls is deliberately never the caller's requested class (still realistic shape/label
    // so rollNPC's downstream field reads don't blow up).
    "\nvar __realRoleForRealm=roleForRealm;" +
    "\nroleForRealm=function(realmId,rng,opts){ var r=__realRoleForRealm(realmId,rng,opts);" +
    " if(r) r=Object.assign({}, r, {cls:'__stubbed-never-matches__'}); return r; };"
  );
  const place = forceWateringHole(win);
  const anchorCls = place && place.rolled && place.rolled.cast && place.rolled.cast.anchor;
  const N = 200;
  let matchCount = 0;
  for (let i = 0; i < N; i++) {
    const npc = win.rollNPC({ roleClass: anchorCls, region: null });
    if (npc.rolled && npc.rolled.roleCls === anchorCls) matchCount++;
  }
  check("MUTATION (roleForRealm cls stubbed off): class-match share collapses (<=0.05)",
    matchCount / N <= 0.05, `${matchCount}/${N}`);
}

// ============================================================================
// (c) SCENE_BUCKET_BY_ARCHETYPE resolves for all 24 spine keys + every authored realm's ADD keys
// ============================================================================
{
  const win = boot();
  const BUCKETS = new Set(["shrine", "shop", "tavern", "market"]);
  const spine = win.__placeSpine();
  let spineOk = 0;
  const spineMisses = [];
  spine.forEach((row) => {
    const b = win.sceneBucketForArchetype(row.key);
    if (BUCKETS.has(b)) spineOk++; else spineMisses.push([row.key, b]);
  });
  check(`SCENE_BUCKET resolves for all ${spine.length} spine keys`, spineOk === spine.length,
    JSON.stringify(spineMisses));

  const skins = win.__placeSkins();
  let addKeys = 0, addOk = 0;
  const addMisses = [];
  Object.keys(skins).forEach((realmId) => {
    (skins[realmId].adds || []).forEach((add) => {
      addKeys++;
      const b = win.sceneBucketForArchetype(add.key);
      if (BUCKETS.has(b)) addOk++; else addMisses.push([realmId, add.key, b]);
    });
  });
  check(`SCENE_BUCKET resolves for all ${addKeys} authored [ADD] keys (falls to default)`,
    addOk === addKeys, JSON.stringify(addMisses));

  check("sceneBucketForArchetype(null) resolves to the default bucket, never undefined",
    win.sceneBucketForArchetype(null) === win.__sceneBucketDefault());
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
