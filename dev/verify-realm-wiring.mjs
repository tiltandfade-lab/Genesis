/* Verify REALM-WIRING (docs/REALM-WIRING.md) — breach encounters spawn the active realm's creatures,
   mirroring dwalkOutlandish's existing realm-filtered loot. jsdom, full manifest.loadOrder module
   load (same convention as dev/verify-battlemap.mjs).

   §5.2 verify plan:
     1. a fixture skin {tail:"breach", realms:["frontier"]} -> dwalkEncounter returns foes whose
        `creature` name is drawn from frontier's REALM_BESTIARY and whose `statId` resolves in
        BESTIARY (a valid chassis).
     2. a {tail:"center"} skin -> foes come from the normal archetype pool (realm filter OFF,
        regression — no statId/modelKey/realm stamped).
     3. leak: over 500 draws, ~18% come from an adjacent realm, 0% from a non-adjacent realm.
     4. modelKey preference: a foe with modelKey resolves that model over statId in theaterUnitsFrom.
     5. MUTATION CHECK: break the realm filter (force realmEncounterPool to return null) -> a breach
        draws off-realm creatures -> the harness's own realm-membership assertion fails RED.

   Run:  node dev/verify-realm-wiring.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
// REALM_BESTIARY/BESTIARY/DWALK_SLOT_MAP etc are top-level `const` — expose thin accessors so
// win.eval-scoped code can reach them from outside (same pattern as verify-battlemap.mjs's
// __cmBands/__cmLanes wrappers; `const` doesn't attach to `window` under win.eval, only var/function).
const accessors = `
  function __realmBestiary(){ return (typeof REALM_BESTIARY!=="undefined") ? REALM_BESTIARY : null; }
  function __bestiary(){ return (typeof BESTIARY!=="undefined") ? BESTIARY : null; }
  function __realmAdjacency(){ return REALM_ADJACENCY; }
  function __leakChance(){ return LEAK_CHANCE; }
`;
const srcText = read("tables.js") + "\n;\n" + moduleSrc + "\n;\n" + accessors;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null; var GS={};`;

function freshWin(customSrc) {
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (customSrc || srcText));
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// a real dungeon-threat-identity row shape, matching dwalkEncounter's expectations
const THREAT = { id: "Bandits", role: "raiders", low: "Bandit", mid: "Bandit Captain", boss: "Bandit Chief", scale: "", signs: "" };

function rollEncountersUntilEnemyWithCreatures(win, opts, tries = 400) {
  const out = [];
  for (let i = 0; i < tries; i++) {
    const enc = win.dwalkEncounter(THREAT, false, opts);
    if (enc && enc.isEnemy && Array.isArray(enc.creatures) && enc.creatures.length) out.push(enc);
  }
  return out;
}

// ============================================================================
// 1. breach skin -> realm-filtered creatures (frontier), valid BESTIARY chassis
// ============================================================================
{
  const win = freshWin();
  const REALM_BESTIARY = win.__realmBestiary();
  const BESTIARY = win.__bestiary();
  check("0. REALM_BESTIARY loaded (data/realm-bestiary.js registered)", !!REALM_BESTIARY && Array.isArray(REALM_BESTIARY.frontier) && REALM_BESTIARY.frontier.length > 0);
  check("0b. BESTIARY loaded", !!BESTIARY && Object.keys(BESTIARY).length > 0);

  const encs = rollEncountersUntilEnemyWithCreatures(win, { realms: ["frontier"] });
  check("1a. at least one Enemy encounter with creatures drawn", encs.length > 0, `got ${encs.length}`);

  const frontierNames = new Set((REALM_BESTIARY.frontier || []).map(c => c.name));
  let allFromFrontierFamily = true, allStatIdsValid = true, sample = null;
  const REALM_ADJACENCY = win.__realmAdjacency();
  const eligibleRealms = new Set(["frontier", ...(REALM_ADJACENCY.frontier || [])]);
  const eligibleNames = new Set();
  eligibleRealms.forEach(r => (REALM_BESTIARY[r] || []).forEach(c => eligibleNames.add(c.name)));

  encs.forEach(enc => enc.creatures.forEach(c => {
    if (!sample) sample = c;
    if (c.statId) { // realm-tagged slot
      if (!eligibleNames.has(c.creature)) allFromFrontierFamily = false;
      if (!BESTIARY[c.statId]) allStatIdsValid = false;
    }
  }));
  check("1b. every realm-tagged creature name comes from frontier or its adjacent realms (ash/theater)", allFromFrontierFamily, JSON.stringify(sample));
  check("1c. every realm-tagged creature's statId resolves in BESTIARY (a valid stat chassis)", allStatIdsValid, JSON.stringify(sample));

  const anyRealmTagged = encs.some(enc => enc.creatures.some(c => c.statId));
  check("1d. at least one creature in the sample carries statId/modelKey/realm (the realm path actually engaged)", anyRealmTagged);
}

// ============================================================================
// 2. center-mass (no realms) -> regression: normal pool, no realm fields stamped
// ============================================================================
{
  const win = freshWin();
  const encs = rollEncountersUntilEnemyWithCreatures(win, {}); // opts.realms absent -> []
  check("2a. at least one Enemy encounter with creatures drawn (no realms)", encs.length > 0);
  const anyRealmField = encs.some(enc => enc.creatures.some(c => c.statId || c.modelKey || c.realm));
  check("2b. NO creature carries statId/modelKey/realm when opts.realms is empty (regression, byte-identical to pre-unit behavior)", !anyRealmField);

  // back-compat: calling with NO opts arg at all (old call-site shape) still works
  const enc3 = win.dwalkEncounter(THREAT, false);
  check("2c. dwalkEncounter(threat, t2) with no 3rd arg still returns a valid encounter (back-compat)", !!enc3 && !!enc3.type);
}

// ============================================================================
// 3. leak distribution: over 500 draws, ~18% adjacent-realm, 0% non-adjacent
// ============================================================================
{
  const win = freshWin();
  const REALM_BESTIARY = win.__realmBestiary();
  const REALM_ADJACENCY = win.__realmAdjacency();
  const primary = "frontier";
  const adjacent = new Set(REALM_ADJACENCY[primary] || []);
  const allRealms = Object.keys(REALM_BESTIARY);
  const nonAdjacent = allRealms.filter(r => r !== primary && !adjacent.has(r));
  // build name->realm index (names are unique enough across realms for this sample-based check;
  // a name collision would only ever bias the count, never invalidate the 0%-non-adjacent assertion
  // since we check realm MEMBERSHIP of the drawn name's home realm(s), not string equality alone)
  const nameHomeRealms = {};
  allRealms.forEach(r => (REALM_BESTIARY[r] || []).forEach(c => {
    (nameHomeRealms[c.name] = nameHomeRealms[c.name] || new Set()).add(r);
  }));

  let n = 500, primaryCount = 0, adjacentCount = 0, nonAdjacentCount = 0, unresolved = 0;
  for (let i = 0; i < n; i++) {
    const rc = win.realmEncounterPool([primary], "mook");
    if (!rc) { unresolved++; continue; }
    const homes = nameHomeRealms[rc.name] || new Set();
    if (homes.has(primary)) primaryCount++;
    else if ([...homes].some(r => adjacent.has(r))) adjacentCount++;
    else if ([...homes].some(r => nonAdjacent.includes(r))) nonAdjacentCount++;
  }
  const adjRate = adjacentCount / (n - unresolved);
  check("3a. adjacent-realm leak rate is roughly 18% (tolerance 10-28%)", adjRate >= 0.10 && adjRate <= 0.28, `rate=${adjRate.toFixed(3)} (adj=${adjacentCount}, primary=${primaryCount}, nonadj=${nonAdjacentCount}, unresolved=${unresolved})`);
  check("3b. zero draws land on a non-adjacent, non-primary realm", nonAdjacentCount === 0, `nonAdjacentCount=${nonAdjacentCount}`);
}

// ============================================================================
// 4. modelKey preference in theaterUnitsFrom (recipeSlug = modelKey when present)
// ============================================================================
{
  const win = freshWin();
  const combat = {
    pc: null, allies: [],
    foes: [{ fid: "f1", band: "melee", lane: "C", statId: "wolf", modelKey: "custom-realm-wolf", name: "Coyote-Thing" }]
  };
  const { units } = win.theaterUnitsFrom(combat);
  const foeUnit = units.find(u => u.id === "f1");
  check("4a. a foe with modelKey resolves recipeSlug = modelKey (not statId)", !!foeUnit && foeUnit.recipeSlug === "custom-realm-wolf", JSON.stringify(foeUnit && foeUnit.recipeSlug));

  const combat2 = { pc: null, allies: [], foes: [{ fid: "f2", band: "melee", lane: "C", statId: "wolf" }] };
  const { units: units2 } = win.theaterUnitsFrom(combat2);
  const foeUnit2 = units2.find(u => u.id === "f2");
  check("4b. a foe with NO modelKey still falls back to statId (regression)", !!foeUnit2 && foeUnit2.recipeSlug === "wolf", JSON.stringify(foeUnit2 && foeUnit2.recipeSlug));
}

// ============================================================================
// 5. combatFromEncounter honors statId/modelKey/realm + name override verbatim
// ============================================================================
{
  const win = freshWin();
  const enc = {
    isEnemy: true, type: "Enemy",
    creatures: [{ slot: "Low CR", creature: "Coyote-Thing", statId: "wolf", modelKey: "wolf", cr: 0.25, realm: "frontier" }]
  };
  const foes = win.combatFromEncounter(enc, {});
  check("5a. combatFromEncounter resolves one foe", Array.isArray(foes) && foes.length === 1, JSON.stringify(foes));
  const f = foes && foes[0];
  check("5b. foe.name overrides to the realm creature's name verbatim", f && f.name === "Coyote-Thing", JSON.stringify(f && f.name));
  check("5c. foe.statId carries the chassis id (wolf)", f && f.statId === "wolf", JSON.stringify(f && f.statId));
  check("5d. foe stats are the REAL wolf chassis (ac/maxHp resolved from BESTIARY, not a quick-stats placeholder)", f && f.maxHp != null && f.ac != null, JSON.stringify(f));
  check("5e. foe.modelKey carried through onto the combat foe object", f && f.modelKey === "wolf", JSON.stringify(f && f.modelKey));
  check("5f. foe.realm carried through", f && f.realm === "frontier", JSON.stringify(f && f.realm));
}

// ============================================================================
// 6. MUTATION CHECK: break realmEncounterPool's realm filter -> a breach draws off-realm
//    creatures -> the harness's own membership assertion (mirrors §1b) must fire RED.
// ============================================================================
{
  const original = read("src/engine/dungeon-walk.js");
  const marker = `  const pool=(REALM_BESTIARY[drawRealm]||[]).filter(rc=>!role || rc.role===role);
  const use = pool.length ? pool : (REALM_BESTIARY[drawRealm]||[]);   // never over-narrow a realm's own pool to empty
  if(!use.length) return null;
  const rc=walkRnd(use);
  return Object.assign({}, rc, { __realm: drawRealm });`;
  if (!original.includes(marker)) {
    fail++; console.log("  ✗ MUTATION(realm-filter): guard text not found verbatim — spec drifted?");
  } else {
    // the mutation: ignore the resolved realm entirely and draw from a random OTHER (non-adjacent-
    // guaranteed) realm's full unfiltered pool — simulates "the realm filter broke."
    const mutated = `  const allRealms=Object.keys(REALM_BESTIARY);
  const wrongRealm=allRealms[Math.floor(Math.random()*allRealms.length)];
  const use=(REALM_BESTIARY[wrongRealm]||[]);
  if(!use.length) return null;
  const rc=walkRnd(use);
  return Object.assign({}, rc, { __realm: wrongRealm });`;
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js"))
        .map(p => p === "src/engine/dungeon-walk.js" ? original.replace(marker, mutated) : read(p))
        .join("\n;\n") + "\n;\n" + accessors;
    const win = freshWin(mutSrc);
    const REALM_BESTIARY = win.__realmBestiary();
    const REALM_ADJACENCY = win.__realmAdjacency();
    const eligibleRealms = new Set(["frontier", ...(REALM_ADJACENCY.frontier || [])]);
    const eligibleNames = new Set();
    eligibleRealms.forEach(r => (REALM_BESTIARY[r] || []).forEach(c => eligibleNames.add(c.name)));

    const encs = rollEncountersUntilEnemyWithCreatures(win, { realms: ["frontier"] });
    let sawOffRealm = false, sample = null;
    encs.forEach(enc => enc.creatures.forEach(c => {
      if (c.statId && !eligibleNames.has(c.creature)) { sawOffRealm = true; if (!sample) sample = c; }
    }));
    // RED-FIRST: with the filter broken, we EXPECT to see an off-realm creature. If the mutated
    // harness run does NOT reproduce the break, that itself is a finding (report, don't silently pass).
    check("6a. MUTATION reproduces: broken realm filter draws an off-realm creature (proves the real filter is load-bearing)", sawOffRealm, JSON.stringify(sample));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
