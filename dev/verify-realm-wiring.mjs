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
// 5.5 REALM-TRAITS-APPLY (docs/REALM-TRAITS-APPLY.md) §4 — a realm creature's authored `traits`
//     override blob lands on the LIVE foe at construction (hp/ac/actions), surfaces in the digest,
//     and a traits-less creature stays byte-identical to today (regression).
// ============================================================================
const COYOTE_TRAITS = {
  hp: 30,
  actions: [
    { name: "Snap of Wrong Teeth", replaces: "Bite",
      text: "**Snap of Wrong Teeth.** Melee Attack Roll: +6, reach 5 ft. Hit: 9 (2d6 + 2) Piercing damage." },
    { name: "Unsettling Gaze", text: "The target must succeed on a DC 12 Wisdom saving throw or be Frightened." },
  ],
  note: "Its eyes are the wrong color for a wolf.",
};

// 5.5a — hp/hpMax override lands, chassis action renamed (Bite -> Snap of Wrong Teeth) with NO
// leftover "Bite", damage mechanics preserved (chassis's, since the replacement text re-parses to its
// OWN mechanics per §2.2 divergence license — the authored numbers are the law, not "preserved from
// the chassis"; verify the parsed 2d6+2 piercing actually landed), additive action appended, cap holds.
{
  const win = freshWin();
  const enc = {
    isEnemy: true, type: "Enemy",
    creatures: [{ slot: "Low CR", creature: "Coyote-Thing", statId: "wolf", modelKey: "wolf", cr: 0.25, realm: "frontier",
      traits: COYOTE_TRAITS }]
  };
  const foes = win.combatFromEncounter(enc, {});
  const f = foes && foes[0];
  check("5.5a. traits.hp sets BOTH f.hp and f.hpMax to 30", f && f.hp === 30 && f.hpMax === 30, JSON.stringify(f && { hp: f.hp, hpMax: f.hpMax }));
  const names = (f && f.actions || []).map(a => a.name);
  check("5.5b. the chassis action 'Bite' is gone (renamed, not additive)", names.indexOf("Bite") === -1, JSON.stringify(names));
  check("5.5c. 'Snap of Wrong Teeth' is present (the replacement name)", names.indexOf("Snap of Wrong Teeth") >= 0, JSON.stringify(names));
  const snap = (f && f.actions || []).find(a => a.name === "Snap of Wrong Teeth");
  check("5.5d. the replacement's OWN re-parsed mechanics (2d6+2 piercing, divergence-licensed) replaced the chassis's (1d6+2)",
    snap && Array.isArray(snap.dmg) && snap.dmg[0] && snap.dmg[0].n === 2 && snap.dmg[0].die === 6 && snap.dmg[0].bonus === 2 && snap.dmg[0].type === "piercing",
    JSON.stringify(snap));
  check("5.5e. an additive action (no `replaces`) appended: 'Unsettling Gaze' present", names.indexOf("Unsettling Gaze") >= 0, JSON.stringify(names));
  check("5.5f. action count: rename-in-place doesn't grow the roster, +1 additive = 2 total", (f && f.actions || []).length === 2, JSON.stringify(names));
  check("5.5g. f.traitNote carries the note verbatim", f && f.traitNote === COYOTE_TRAITS.note, JSON.stringify(f && f.traitNote));
  check("5.5h. f.traitsApplied harness hook is stamped true", f && f.traitsApplied === true);
}

// 5.5i — a `replaces` entry whose own text parses to NOTHING keeps the chassis mechanics under the
// new name (the "text parses to nothing -> keep chassis mechanics" branch of §2).
{
  const win = freshWin();
  const enc = {
    isEnemy: true, type: "Enemy",
    creatures: [{ slot: "Low CR", creature: "Coyote-Thing", statId: "wolf", modelKey: "wolf", cr: 0.25, realm: "frontier",
      traits: { actions: [{ name: "A Different Kind of Bite", replaces: "Bite", text: "It bites you. It is bad." }] } }]
  };
  const foes = win.combatFromEncounter(enc, {});
  const f = foes && foes[0];
  const renamed = (f && f.actions || []).find(a => a.name === "A Different Kind of Bite");
  check("5.5i. unparseable replacement text keeps the CHASSIS mechanics (1d6+2 piercing) under the new name",
    renamed && Array.isArray(renamed.dmg) && renamed.dmg[0] && renamed.dmg[0].n === 1 && renamed.dmg[0].die === 6 && renamed.dmg[0].bonus === 2,
    JSON.stringify(renamed));
}

// 5.5j — regression: a traits-less realm creature is byte-identical to §5's existing assertions
// (no traitNote, no traitsApplied, chassis actions untouched).
{
  const win = freshWin();
  const enc = {
    isEnemy: true, type: "Enemy",
    creatures: [{ slot: "Low CR", creature: "Coyote-Thing", statId: "wolf", modelKey: "wolf", cr: 0.25, realm: "frontier" }]
  };
  const foes = win.combatFromEncounter(enc, {});
  const f = foes && foes[0];
  check("5.5j. NO traits -> f.traitsApplied is falsy (regression, byte-identical to pre-unit behavior)", !f.traitsApplied, JSON.stringify(f && f.traitsApplied));
  check("5.5k. NO traits -> f.traitNote is undefined", f.traitNote === undefined, JSON.stringify(f && f.traitNote));
  check("5.5l. NO traits -> the chassis 'Bite' action is untouched", (f.actions || []).length === 1 && f.actions[0].name === "Bite", JSON.stringify(f.actions));
}

// 5.5m — combatDigest surfaces traitNote once per foe name (digest-diet law, same as desc/flavor).
{
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div>
    <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
    </body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  const world = {
    id: "w-traits", name: "Traits Digest Test", seed: { master: { name: "Test", desc: "d" },
      smell:{name:"s"}, sound:{name:"s"}, arch:{name:"s"}, taboo:{name:"t",desc:"d"}, myth:{name:"m",desc:"d"} },
    characters: [{ id: "c1", status: "living", name: "Test PC", headline: "h", spark: "s", pronouns: "he",
      sheet: { species:"Human", class:"Fighter", background:"Soldier", level:1, xp:0, hp:10, hpCur:10, ac:10, tempHp:0,
        profBonus:2, scores:{str:10}, mods:{str:0}, saveProfs:[], skillProfs:[], passivePerception:10, hitDie:"d10",
        gold:0, feat:null, conditions:[], exhaustion:0, inspiration:false, cantrips:[], spells:[], inventory:[],
        equipped:{mainHand:null,offHand:null,armor:null}, pools:{} } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null, factions: [], pressures: [],
    revealed: { map:1, powers:1, ledger:1, gaz:1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Node", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world; win.U.activeWorldId = world.id;
  win.GS.dm = { turnId:null, pending:false, poll:null, rollReq:null, ask:null, animate:false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.chase = null;

  win.applyEvent(world, { type: "combat_start", payload: { foes: [
    Object.assign({ name: "Coyote-Thing", cr: 0.25, statId: "wolf" }, { traits: COYOTE_TRAITS }),
    Object.assign({ name: "Coyote-Thing", cr: 0.25, statId: "wolf" }, { traits: COYOTE_TRAITS }),
  ] } });
  const digest = win.combatDigest(world);
  check("5.5m. combatDigest's first foe of a name carries traitNote", digest && digest.foes[0].traitNote === COYOTE_TRAITS.note, JSON.stringify(digest && digest.foes[0]));
  check("5.5n. combatDigest's SECOND foe of the SAME name carries NO traitNote (digest-diet)", digest && digest.foes[1].traitNote === undefined, JSON.stringify(digest && digest.foes[1]));
}

// ============================================================================
// 5.6 MUTATION CHECK (RED-FIRST, REALM-TRAITS-APPLY §4): stub the apply call out entirely ->
//     the fixture foe still shows "Bite" (never renamed) -> the harness's own §5.5b/5.5c
//     assertions must fail RED, proving cmApplyTraits is load-bearing (not a vacuous no-op).
// ============================================================================
{
  const originalCombat = read("src/engine/combat.js");
  // U5/R8a: the traits carry+apply call now lives inside the shared cmStampFoeStory helper (used by
  // BOTH cmResolveFoe and combatFromEncounter), not inlined at combatFromEncounter's own foe-mapping —
  // mutate the helper's one traits-apply line instead of the old inline call.
  const marker = `  if(spec.traits){ foe.override = spec.traits; cmApplyTraits(foe, spec.traits); }`;
  if (!originalCombat.includes(marker)) {
    fail++; console.log("  ✗ MUTATION(traits-apply): guard text not found verbatim — spec drifted?");
  } else {
    const mutated = `  if(spec.traits){ foe.override = spec.traits; /* MUTATED OUT: cmApplyTraits stubbed — apply step never runs */ }`;
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js"))
        .map(p => p === "src/engine/combat.js" ? originalCombat.replace(marker, mutated) : read(p))
        .join("\n;\n") + "\n;\n" + accessors;
    const win = freshWin(mutSrc);
    const enc = {
      isEnemy: true, type: "Enemy",
      creatures: [{ slot: "Low CR", creature: "Coyote-Thing", statId: "wolf", modelKey: "wolf", cr: 0.25, realm: "frontier",
        traits: COYOTE_TRAITS }]
    };
    const foes = win.combatFromEncounter(enc, {});
    const f = foes && foes[0];
    const names = (f && f.actions || []).map(a => a.name);
    const stillShowsBite = names.indexOf("Bite") >= 0;
    // RED-FIRST: with the apply call stubbed, we EXPECT "Bite" to still be present (never renamed).
    // If the mutated build somehow renamed it anyway, that itself is the finding.
    check("5.6a. MUTATION reproduces: stubbing cmApplyTraits leaves the chassis 'Bite' action untouched (proves the apply seam is load-bearing)", stillShowsBite, JSON.stringify(names));
  }
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

// ============================================================================
// 7+. REALM-STORY-WIRING (docs/REALM-STORY-WIRING.md §4.2) — breach foes reach the DM's mouth
//     (digest) and the world's memory (codex). Full applyEvent flow, same fixture convention as
//     dev/verify-combat-lifecycle.mjs's makeWorld/freshWin (richer DOM: combat_start/combat_end
//     both call renderWorld() internally regardless of whether the harness calls it).
// ============================================================================
const DOM_HTML_STORY = `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div>
  <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
  </body></html>`;

function freshWinStory(customSrc) {
  const dom = new JSDOM(DOM_HTML_STORY, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (customSrc || srcText));
  return win;
}

function makeStoryWorld(win, opts = {}) {
  const world = {
    id: "w-story", name: "The Story-Wiring Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting the seam" },
            smell:{name:"smoke"}, sound:{name:"wind"}, arch:{name:"stone"},
            taboo:{name:"t",desc:"d"}, myth:{name:"m",desc:"d"} },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: {
        species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16, dex: 12 }, mods: { str: 4, con: 3, dex: 1 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [{ id:"w1", name:"Dagger", qty:1, conditions:[] }],
        equipped: { mainHand:"w1", offHand:null, armor:null }, pools: {},
      } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: opts.factions || [{ name:"Copper Hand", dominant:false, agenda:"a", method:"b", tags:[], clock:{filled:0,size:6} }],
    pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null;
  win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.chase = null;
  return world;
}

// a realm-tagged apex foe spec — the harness injects desc/summary directly onto the foe spec (§0
// decision 5's graceful-degradation law: data/realm-bestiary.js carries no desc field YET, but the
// wiring must prove correct once it does; injecting straight onto the spec exercises the exact same
// carry-path as a real rc.desc would, without waiting on the writing lane).
const APEX_COYOTE = { name: "Coyote-Thing", statId: "wolf", cr: 2, realm: "frontier", realmRole: "apex",
  desc: "A lean thing that walks like a man until it doesn't.", summary: "a shapeshifting frontier stalker" };
const MOOK_RAT = { name: "Common Rat", statId: "rat", cr: 0.125, realm: "frontier", realmRole: "mook" };

// ============================================================================
// 7. combat_start with an apex realm foe -> codex mints a "creature" record with realm/desc
// ============================================================================
{
  const win = freshWinStory();
  const world = makeStoryWorld(win);
  const r = win.applyEvent(world, { type: "combat_start", payload: { foes: [Object.assign({}, APEX_COYOTE)] } });
  check("7a. combat_start returns ok:true", r && r.ok === true, JSON.stringify(r));
  const rec = world.codex && world.codex.records && world.codex.records["creature:coyote-thing"];
  check("7b. a codex 'creature' record is minted, keyed by codexKeyId", !!rec, JSON.stringify(world.codex));
  check("7c. the record carries kind:creature, name, and fields.realm", rec && rec.kind === "creature" && rec.name === "Coyote-Thing" && rec.fields.realm === "frontier", JSON.stringify(rec));
  check("7d. the record's DM-only desc matches the foe's desc verbatim", rec && rec.dm && rec.dm.desc === APEX_COYOTE.desc, JSON.stringify(rec && rec.dm));
  check("7e. the record is known:true (the player just met it in combat)", rec && rec.status && rec.status.known === true);
}

// ============================================================================
// 8. a mook-only fight mints nothing
// ============================================================================
{
  const win = freshWinStory();
  const world = makeStoryWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [Object.assign({}, MOOK_RAT)] } });
  const creatureRecs = world.codex ? Object.values(world.codex.records).filter(r => r.kind === "creature") : [];
  check("8a. a mook-only fight (realmRole:mook, cr<1) mints NO codex creature record", creatureRecs.length === 0, JSON.stringify(creatureRecs));
}

// ============================================================================
// 9. the SAME foe name twice -> ONE record, seenCount 2 (recurrence, not duplication)
// ============================================================================
{
  const win = freshWinStory();
  const world = makeStoryWorld(win);
  // fight 1: mint, then resolve as slain (force-kill via guaranteed crits, mirrors verify-combat-lifecycle §4)
  win.applyEvent(world, { type: "combat_start", payload: { foes: [Object.assign({}, APEX_COYOTE)] } });
  const fid1 = win.GS.combat.foes[0].fid;
  let guard = 0;
  // guard on GS.combat itself, not just foe.down — a killing blow auto-fires combat_end
  // (cmMaybeAutoEnd), which nulls GS.combat in the SAME applyEvent call that downs the foe.
  while (win.GS.combat && !win.GS.combat.foes[0].down && guard < 50) { win.applyEvent(world, { type: "attack", payload: { d20: 20, target: fid1 } }); guard++; }
  check("9a. fight 1's foe is down (auto combat_end fired)", win.GS.combat === null, "guard="+guard);
  const recCount1 = world.codex ? Object.values(world.codex.records).filter(r => r.kind === "creature" && r.name === "Coyote-Thing").length : 0;
  check("9b. exactly one creature record after fight 1", recCount1 === 1, JSON.stringify(recCount1));
  const rec1 = world.codex.records["creature:coyote-thing"];
  check("9c. seenCount is 1 after the first encounter (fields.seenCount stamped by encounter_resolved)", rec1 && rec1.fields.seenCount === 1, JSON.stringify(rec1 && rec1.fields));
  check("9d. lastOutcome is 'slain' (the foe was downed)", rec1 && rec1.fields.lastOutcome === "slain", JSON.stringify(rec1 && rec1.fields));

  // fight 2: the SAME name mints again -> must TOUCH the same record, not create a second one
  win.applyEvent(world, { type: "combat_start", payload: { foes: [Object.assign({}, APEX_COYOTE)] } });
  const recCount2 = Object.values(world.codex.records).filter(r => r.kind === "creature" && r.name === "Coyote-Thing").length;
  check("9e. STILL exactly one creature record after a second same-name encounter (idempotent touch, not a duplicate mint)", recCount2 === 1, JSON.stringify(recCount2));
  // this time the foe FLEES rather than dies — `.fled` is a per-foe morale flag (only morale_check's
  // resolution sets it; a scene-level combat_end{outcome} alone never flips it), so flip it directly
  // to exercise the lastOutcome:"fled" branch (mirrors MONSTER-TACTICS' own morale-flee mechanism).
  win.GS.combat.foes[0].fled = true;
  win.applyEvent(world, { type: "combat_end", payload: { outcome: "fled" } });
  const rec2 = world.codex.records["creature:coyote-thing"];
  check("9f. seenCount is 2 after the second encounter (the SAME record accrues history)", rec2 && rec2.fields.seenCount === 2, JSON.stringify(rec2 && rec2.fields));
  check("9g. lastOutcome updates to 'fled' (the second fight's real outcome, not stale from fight 1)", rec2 && rec2.fields.lastOutcome === "fled", JSON.stringify(rec2 && rec2.fields));
}

// ============================================================================
// 10. combatDigest foe carries realm + first-instance desc (once-per-name, digest-diet law)
// ============================================================================
{
  const win = freshWinStory();
  const world = makeStoryWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [
    Object.assign({}, APEX_COYOTE),
    Object.assign({}, APEX_COYOTE),   // second foe, SAME name — desc should NOT repeat
  ] } });
  const digest = win.combatDigest(world);
  check("10a. combatDigest().foes has 2 entries", digest && digest.foes.length === 2, JSON.stringify(digest && digest.foes));
  check("10b. both foes carry realm:'frontier'", digest.foes.every(f => f.realm === "frontier"), JSON.stringify(digest.foes));
  check("10c. the FIRST foe of this name carries desc", digest.foes[0].desc === APEX_COYOTE.desc, JSON.stringify(digest.foes[0]));
  check("10d. the SECOND foe of the SAME name carries NO desc (digest-diet: not a duplicate)", digest.foes[1].desc === undefined, JSON.stringify(digest.foes[1]));
}

// ============================================================================
// 11. activeWalkDigest surfaces creature names on the "here" segment (preview, summary not desc)
// ============================================================================
{
  const win = freshWinStory();
  // activeWalkDigest reads prepOf(w).nodes[activeWalkId].walk (walkOfFrontier's real contract,
  // src/world/prep.js:363-369 — `pn.walk` stored directly on the node's prep slot, the TRAVEL-WALKS
  // shape) + .cursor/.briefing/.cast — build exactly that minimal shape, not a guessed one.
  const world = makeStoryWorld(win);
  const walk = {
    environment: "dungeon", topology: "linear", segCount: 1,
    segments: [{ num: 1, label: "The Threshold", segType: "room",
      encounter: { type: "Enemy", isEnemy: true, creatures: [
        { creature: "Coyote-Thing", realm: "frontier", summary: "a shapeshifting frontier stalker", statId:"wolf" },
        { creature: "Company Enforcer", realm: "frontier", summary: null, statId:"bandit-enforcer" },
      ] } }],
  };
  world.prep = win.prepOf(world);
  world.prep.activeWalkId = "w1";
  world.prep.nodes["w1"] = { env:"dungeon", soft:false, locked:false, hook:null,
    cursor: { current: 1, touched: [1], done:false }, briefing:null, cast:null, walk };
  win.mapOf(world).nodes["w1"] = { name:"The Threshold Approach", type:"Dungeon" };
  const digest = win.activeWalkDigest(world);
  check("11a. activeWalkDigest resolves (prep/walkOfFrontier fixture wired correctly)", !!digest, JSON.stringify(digest));
  const hereSeg = digest && digest.segments.find(s => s.state === "here");
  check("11b. the 'here' segment carries a creatures[] line", hereSeg && Array.isArray(hereSeg.creatures), JSON.stringify(hereSeg));
  check("11c. creatures[] entries carry {name,realm,summary} — summary, NOT full desc", hereSeg && hereSeg.creatures[0].name === "Coyote-Thing" && hereSeg.creatures[0].realm === "frontier" && hereSeg.creatures[0].summary === "a shapeshifting frontier stalker" && hereSeg.creatures[0].desc === undefined, JSON.stringify(hereSeg && hereSeg.creatures));
}

// ============================================================================
// 12. MUTATION CHECK (RED-FIRST): stub combatDigest's `realm` field out -> the harness's own
//     §10b assertion (every foe carries realm) must fail RED, proving the digest field is
//     load-bearing (not a decorative no-op the harness would pass either way).
// ============================================================================
{
  const dmSrc = read("src/world/dm.js");
  const marker = `      conditions:condNames(f.conditions),\n          realm:f.realm||null\n        };`;
  // the exact text as written (indentation matters for an exact marker match) — read it back
  // fresh rather than hand-retyping, to avoid a silent drift between this harness and the real file.
  const markerFound = dmSrc.includes("realm:f.realm||null");
  if (!markerFound) {
    fail++; console.log("  ✗ MUTATION(digest-realm): 'realm:f.realm||null' not found verbatim in src/world/dm.js — spec drifted?");
  } else {
    const mutatedDm = dmSrc.replace("realm:f.realm||null", "/* MUTATED OUT */ realm:undefined");
    const mutMan = man.loadOrder.filter(p => p.endsWith(".js"));
    const mutSrc = read("tables.js") + "\n;\n" +
      mutMan.map(p => p === "src/world/dm.js" ? mutatedDm : read(p)).join("\n;\n") + "\n;\n" + accessors;
    const win = freshWinStory(mutSrc);
    const world = makeStoryWorld(win);
    win.applyEvent(world, { type: "combat_start", payload: { foes: [Object.assign({}, APEX_COYOTE)] } });
    const digest = win.combatDigest(world);
    const stillCarriesRealm = digest && digest.foes.length && digest.foes.every(f => f.realm === "frontier");
    // RED-FIRST: with the field mutated out, we EXPECT realm to be missing — the real §10b check
    // (asserting every foe carries realm) would FAIL against this mutated build, proving it's load-
    // bearing. If the mutated build somehow still carries realm, that itself is the finding.
    check("12a. MUTATION reproduces: stubbing out combatDigest's realm field drops it from the foe (proves §10b is load-bearing, not a vacuous pass)", !stillCarriesRealm, JSON.stringify(digest && digest.foes));
  }
}

// ============================================================================
// 13. regression guard: a NON-realm (ordinary) fight is byte-identical — no realm/desc fields,
//     no codex creature mint, matching pre-unit behavior for every existing fight in the game.
// ============================================================================
{
  const win = freshWinStory();
  const world = makeStoryWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name: "Goblin", cr: 0.25 }] } });
  const digest = win.combatDigest(world);
  check("13a. an ordinary (non-realm) foe carries realm:null in the digest", digest.foes[0].realm === null, JSON.stringify(digest.foes[0]));
  check("13b. an ordinary foe carries no desc key at all", digest.foes[0].desc === undefined, JSON.stringify(digest.foes[0]));
  const creatureRecs = world.codex ? Object.values(world.codex.records).filter(r => r.kind === "creature") : [];
  check("13c. a normal (non-realm, low-CR) fight mints NO codex creature record", creatureRecs.length === 0, JSON.stringify(creatureRecs));
}

// ============================================================================
// 14+. REALM-WALK-WIRING (docs/REALM-WALK-WIRING.md) — urban + wilderness breaches spawn realm
//     creatures too, mirroring §3 of REALM-WIRING exactly (dungeon already wired).
// ============================================================================

// a real urban-threat-identity row shape, matching walkEncounter's expectations
const URBAN_THREAT = { id: "Street Gangs", low: "Thug", mid: "Enforcer", boss: "Boss" };

function rollUrbanEncountersUntilEnemyWithCreatures(win, topo, threat, tier, opts, tries = 400) {
  const out = [];
  for (let i = 0; i < tries; i++) {
    const enc = win.walkEncounter(topo, threat, tier, opts);
    if (enc && enc.isEnemy && Array.isArray(enc.creatures) && enc.creatures.length) out.push(enc);
  }
  return out;
}

// ============================================================================
// 14. urban breach skin -> realm-filtered creatures (frontier), valid BESTIARY chassis
// ============================================================================
{
  const win = freshWin();
  const REALM_BESTIARY = win.__realmBestiary();
  const BESTIARY = win.__bestiary();
  const REALM_ADJACENCY = win.__realmAdjacency();
  const eligibleRealms = new Set(["frontier", ...(REALM_ADJACENCY.frontier || [])]);
  const eligibleNames = new Set();
  eligibleRealms.forEach(r => (REALM_BESTIARY[r] || []).forEach(c => eligibleNames.add(c.name)));

  const encs = rollUrbanEncountersUntilEnemyWithCreatures(win, "The Trail", URBAN_THREAT, 1, { realms: ["frontier"] });
  check("14a. at least one urban Enemy encounter with creatures drawn (breach)", encs.length > 0, `got ${encs.length}`);

  let allFromFrontierFamily = true, allStatIdsValid = true, sample = null;
  encs.forEach(enc => enc.creatures.forEach(c => {
    if (!sample) sample = c;
    if (c.statId) {
      if (!eligibleNames.has(c.creature)) allFromFrontierFamily = false;
      if (!BESTIARY[c.statId]) allStatIdsValid = false;
    }
  }));
  check("14b. every realm-tagged urban creature name comes from frontier or its adjacent realms", allFromFrontierFamily, JSON.stringify(sample));
  check("14c. every realm-tagged urban creature's statId resolves in BESTIARY (a valid stat chassis)", allStatIdsValid, JSON.stringify(sample));
  const anyRealmTagged = encs.some(enc => enc.creatures.some(c => c.statId));
  check("14d. at least one urban creature in the sample carries statId/modelKey/realm (the realm path actually engaged)", anyRealmTagged);
}

// ============================================================================
// 15. urban no-realm (opts absent / opts.realms empty) -> regression: normal pool, no realm fields
// ============================================================================
{
  const win = freshWin();
  const encsNoOpts = rollUrbanEncountersUntilEnemyWithCreatures(win, "The Trail", URBAN_THREAT, 1, undefined);
  check("15a. at least one urban Enemy encounter with creatures (no opts arg at all — back-compat)", encsNoOpts.length > 0);
  const anyRealmFieldNoOpts = encsNoOpts.some(enc => enc.creatures.some(c => c.statId || c.modelKey || c.realm));
  check("15b. NO urban creature carries statId/modelKey/realm with no opts arg (back-compat, byte-identical)", !anyRealmFieldNoOpts);

  const encsEmpty = rollUrbanEncountersUntilEnemyWithCreatures(win, "The Trail", URBAN_THREAT, 1, {});
  check("15c. at least one urban Enemy encounter with creatures (opts.realms absent)", encsEmpty.length > 0);
  const anyRealmFieldEmpty = encsEmpty.some(enc => enc.creatures.some(c => c.statId || c.modelKey || c.realm));
  check("15d. NO urban creature carries statId/modelKey/realm when opts.realms is empty (regression)", !anyRealmFieldEmpty);
}

// ============================================================================
// 16. wilderness breach -> realm-filtered SINGLE creature (frontier), valid BESTIARY chassis
// ============================================================================
{
  const win = freshWin();
  const REALM_BESTIARY = win.__realmBestiary();
  const BESTIARY = win.__bestiary();
  const REALM_ADJACENCY = win.__realmAdjacency();
  const eligibleRealms = new Set(["frontier", ...(REALM_ADJACENCY.frontier || [])]);
  const eligibleNames = new Set();
  eligibleRealms.forEach(r => (REALM_BESTIARY[r] || []).forEach(c => eligibleNames.add(c.name)));

  const wEncs = [];
  for (let i = 0; i < 400; i++) {
    const enc = win.wwalkEncounter(1, null, null, { realms: ["frontier"] });
    if (enc && enc.isEnemy && !enc.factions) wEncs.push(enc);
  }
  check("16a. at least one wilderness Enemy encounter drawn (breach)", wEncs.length > 0, `got ${wEncs.length}`);
  const realmTagged = wEncs.filter(enc => enc.statId);
  check("16b. at least one wilderness encounter carries statId/modelKey/realm (the realm path actually engaged)", realmTagged.length > 0);
  let allFromFrontierFamily = true, allStatIdsValid = true, sample = null;
  realmTagged.forEach(enc => {
    if (!sample) sample = enc;
    if (!eligibleNames.has(enc.creature)) allFromFrontierFamily = false;
    if (!BESTIARY[enc.statId]) allStatIdsValid = false;
  });
  check("16c. every realm-tagged wilderness creature name comes from frontier or its adjacent realms", allFromFrontierFamily, JSON.stringify(sample));
  check("16d. every realm-tagged wilderness creature's statId resolves in BESTIARY (a valid stat chassis)", allStatIdsValid, JSON.stringify(sample));
}

// ============================================================================
// 17. wilderness no-realm (opts absent / opts.realms empty) -> regression: normal pool
// ============================================================================
{
  const win = freshWin();
  const noOptsEncs = [];
  for (let i = 0; i < 400; i++) {
    const enc = win.wwalkEncounter(1, null, null); // no 4th arg at all — back-compat
    if (enc && enc.isEnemy && !enc.factions) noOptsEncs.push(enc);
  }
  check("17a. at least one wilderness Enemy encounter (no opts arg — back-compat)", noOptsEncs.length > 0);
  const anyRealmFieldNoOpts = noOptsEncs.some(enc => enc.statId || enc.modelKey || enc.realm);
  check("17b. NO wilderness encounter carries statId/modelKey/realm with no opts arg (back-compat)", !anyRealmFieldNoOpts);

  const emptyEncs = [];
  for (let i = 0; i < 400; i++) {
    const enc = win.wwalkEncounter(1, null, null, {});
    if (enc && enc.isEnemy && !enc.factions) emptyEncs.push(enc);
  }
  check("17c. at least one wilderness Enemy encounter (opts.realms absent)", emptyEncs.length > 0);
  const anyRealmFieldEmpty = emptyEncs.some(enc => enc.statId || enc.modelKey || enc.realm);
  check("17d. NO wilderness encounter carries statId/modelKey/realm when opts.realms is empty (regression)", !anyRealmFieldEmpty);
}

// ============================================================================
// 18. leak distribution sanity on ONE family (urban) — matches §3's ~18% adjacent / 0% non-adjacent
//     tolerance already proven for dungeon in check 3; here we just confirm urban's encounter path
//     draws through the SAME realmEncounterPool (one law, one tune point, per spec §3 decision).
// ============================================================================
{
  const win = freshWin();
  const REALM_BESTIARY = win.__realmBestiary();
  const REALM_ADJACENCY = win.__realmAdjacency();
  const primary = "frontier";
  const adjacent = new Set(REALM_ADJACENCY[primary] || []);
  const allRealms = Object.keys(REALM_BESTIARY);
  const nonAdjacent = allRealms.filter(r => r !== primary && !adjacent.has(r));
  const nameHomeRealms = {};
  allRealms.forEach(r => (REALM_BESTIARY[r] || []).forEach(c => {
    (nameHomeRealms[c.name] = nameHomeRealms[c.name] || new Set()).add(r);
  }));

  const encs = rollUrbanEncountersUntilEnemyWithCreatures(win, "The Trail", URBAN_THREAT, 1, { realms: [primary] }, 1200);
  let primaryCount = 0, adjacentCount = 0, nonAdjacentCount = 0, total = 0;
  encs.forEach(enc => enc.creatures.forEach(c => {
    if (!c.statId) return;
    total++;
    const homes = nameHomeRealms[c.creature] || new Set();
    if (homes.has(primary)) primaryCount++;
    else if ([...homes].some(r => adjacent.has(r))) adjacentCount++;
    else if ([...homes].some(r => nonAdjacent.includes(r))) nonAdjacentCount++;
  }));
  const adjRate = total ? adjacentCount / total : 0;
  check("18a. urban leak rate is roughly 18% (tolerance 8-30%, wider band — smaller urban sample)", total > 20 && adjRate >= 0.08 && adjRate <= 0.30, `rate=${adjRate.toFixed(3)} (adj=${adjacentCount}, primary=${primaryCount}, nonadj=${nonAdjacentCount}, total=${total})`);
  check("18b. zero urban draws land on a non-adjacent, non-primary realm", nonAdjacentCount === 0, `nonAdjacentCount=${nonAdjacentCount}`);
}

// ============================================================================
// 19. MUTATION CHECK (urban): break the urban filter -> off-realm names appear -> fail.
//     Same technique as check 6 (dungeon) but mutating walkEncounter's realm-slot branch in walk.js
//     instead of dungeon-walk.js's realmEncounterPool — proves the URBAN call site's own filter
//     (not just the shared realmEncounterPool helper) is load-bearing.
// ============================================================================
{
  const originalWalk = read("src/engine/walk.js");
  // ANOMALY LAW §2b: walk.js's realm-slot return is now wrapped in stampSpawn(...) (the friendly-spawn
  // stamp, applied uniformly across every return this slot can take) — the marker/mutated text below
  // is updated to match verbatim; the mutation's INTENT (ignore the realm filter, draw an off-realm
  // pool) is unchanged, only the literal source text this check greps for.
  const marker = `        if(realms.length){
          const rc=realmEncounterPool(realms, slotRole(slot));
          // carry desc/summary through when the bestiary entry has them (REALM-STORY-WIRING §1
          // parity — absent today degrades to null/null gracefully, same as dungeon-walk.js).
          // REALM-TRAITS-APPLY §1 — carry rc.traits through (graceful-absent, same law as desc/
          // summary); stampSpawn = the anomaly law's wrapper (recovery merge keeps both sides).
          if(rc) return stampSpawn({ slot:label, creature:rc.name,
            statId:rc.frame, modelKey:rc.model, cr:rc.cr, realm:rc.__realm, realmRole:rc.role||null,
            desc:rc.desc||null, summary:rc.summary||null, traits:rc.traits||null });
        }`;
  if (!originalWalk.includes(marker)) {
    fail++; console.log("  ✗ MUTATION(urban-filter): guard text not found verbatim — spec drifted, or unit not yet built?");
  } else {
    // the mutation: ignore the realm filter entirely and draw a random OTHER realm's full unfiltered
    // pool regardless of which realms were requested — simulates "the urban filter broke."
    const mutated = `        if(realms.length){
          const allRealms=Object.keys(REALM_BESTIARY||{});
          const wrongRealm=allRealms[Math.floor(Math.random()*allRealms.length)];
          const use=(REALM_BESTIARY[wrongRealm]||[]);
          if(use.length){ const rc=Object.assign({}, use[Math.floor(Math.random()*use.length)], { __realm: wrongRealm });
            return stampSpawn({ slot:label, creature:rc.name,
              statId:rc.frame, modelKey:rc.model, cr:rc.cr, realm:rc.__realm, realmRole:rc.role||null,
              desc:rc.desc||null, summary:rc.summary||null, traits:rc.traits||null });
          }
        }`;
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js"))
        .map(p => p === "src/engine/walk.js" ? originalWalk.replace(marker, mutated) : read(p))
        .join("\n;\n") + "\n;\n" + accessors;
    const win = freshWin(mutSrc);
    const REALM_BESTIARY = win.__realmBestiary();
    const REALM_ADJACENCY = win.__realmAdjacency();
    const eligibleRealms = new Set(["frontier", ...(REALM_ADJACENCY.frontier || [])]);
    const eligibleNames = new Set();
    eligibleRealms.forEach(r => (REALM_BESTIARY[r] || []).forEach(c => eligibleNames.add(c.name)));

    const encs = rollUrbanEncountersUntilEnemyWithCreatures(win, "The Trail", URBAN_THREAT, 1, { realms: ["frontier"] });
    let sawOffRealm = false, sample = null;
    encs.forEach(enc => enc.creatures.forEach(c => {
      if (c.statId && !eligibleNames.has(c.creature)) { sawOffRealm = true; if (!sample) sample = c; }
    }));
    // RED-FIRST: with the urban filter broken, we EXPECT to see an off-realm creature. If the mutated
    // harness run does NOT reproduce the break, that itself is a finding (report, don't silently pass).
    check("19a. MUTATION reproduces: broken urban realm filter draws an off-realm creature (proves the real urban filter is load-bearing)", sawOffRealm, JSON.stringify(sample));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
