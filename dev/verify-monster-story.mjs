/* Verify MONSTER-STORY-WIRING (docs/MONSTER-STORY-WIRING.md) — regular (non-realm) monsters join the
   story layer: habitat fit as a selection+narration factor, boss-slot/CR>=3 codex minting with
   bestiary story fields, custom d10 flavor rolled once at mint (canon-lock), wilderness behavior
   carried to the foe object, and quest-hook threatBinding. jsdom, full manifest.loadOrder module
   load (same convention as dev/verify-realm-wiring.mjs).

   §5.2 verify plan:
     1. habitat fit logic: a forest biome prefers forest-capable creatures; a forced misfit stamps
        `displaced`.
     2. boss-slot mint: a CR-4 non-realm boss mints kind:"creature" with habitat/factionFit fields;
        a CR-1 mook does not.
     3. customTables flavor rolled once + identical on re-mint (canon-lock).
     4. wilderness behavior survives to the foe object.
     5. quest hook with opts.threat carries threatBinding with a valid angle; hook without
        opts.threat -> byte-identical legacy shape (regression).
     6. MUTATION (red-first): break the habitat filter -> misfits never re-pick AND never stamp
        displaced -> fail. Break the flavor canon-lock (re-roll each mint) -> fail.

   Run:  node dev/verify-monster-story.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
// BESTIARY etc are top-level `const` — expose thin accessors so win.eval-scoped code can reach them
// from outside (same pattern as verify-realm-wiring.mjs's __realmBestiary/__bestiary wrappers;
// `const` doesn't attach to `window` under win.eval, only var/function).
const accessors = `
  function __bestiary(){ return (typeof BESTIARY!=="undefined") ? BESTIARY : null; }
  function __monsterHabitatFit(id,setting){ return monsterHabitatFit(id,setting); }
  function __resolveArchetypePool(name,opts,pool){ return resolveArchetypePool(name,opts,pool); }
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

// ============================================================================
// 1. monsterHabitatFit — a wilderness forest biome prefers forest-capable creatures;
//    a mismatched creature/setting pair correctly reports false.
// ============================================================================
{
  const win = freshWin();
  const BESTIARY = win.__bestiary();
  check("0. BESTIARY loaded", !!BESTIARY && Object.keys(BESTIARY).length > 0);

  // wolf: habitat ["forest","hill","grassland","arctic","mountain"] — fits a forest biome
  check("1a. wolf fits a forest-biome wilderness setting", win.__monsterHabitatFit("wolf", { env: "wilderness", biome: "Forest" }) === true);
  // aarakocra-aeromancer: habitat ["mountain","sky"] — does NOT fit a swamp biome
  check("1b. aarakocra-aeromancer (mountain/sky) does NOT fit a swamp-biome wilderness setting", win.__monsterHabitatFit("aarakocra-aeromancer", { env: "wilderness", biome: "Swamp" }) === false);
  // an unresolvable name always fits (never punish the threat tables' names)
  check("1c. an unresolvable creature name always fits", win.__monsterHabitatFit("Totally Made Up Threat Name", { env: "wilderness", biome: "Swamp" }) === true);
  // an unknown biome word -> no filter -> always fits
  check("1d. an unknown/unmapped biome word never filters (always fits)", win.__monsterHabitatFit("aarakocra-aeromancer", { env: "wilderness", biome: "Xyzzyland" }) === true);
  // habitat containing "any" always fits
  check("1e. a habitat list containing \"any\" always fits any setting", win.__monsterHabitatFit("rat", { env: "wilderness", biome: "Swamp" }) === true, JSON.stringify(BESTIARY.rat.habitat));
  // dungeon env maps to cave/ruins/deeplands — rat (has cave) fits; aarakocra (mountain/sky, no cave/ruins/deeplands) but "any" is in rat's habitat so use aarakocra for a real dungeon-mismatch check
  check("1f. aarakocra-aeromancer (mountain/sky, no any) does NOT fit a dungeon setting", win.__monsterHabitatFit("aarakocra-aeromancer", { env: "dungeon" }) === false);
  check("1g. animated-armor (ruins/urban/deeplands) fits a dungeon setting", win.__monsterHabitatFit("animated-armor", { env: "dungeon" }) === true);
  check("1h. animated-armor (ruins/urban/deeplands) fits an urban setting", win.__monsterHabitatFit("animated-armor", { env: "urban" }) === true);
}

// ============================================================================
// 2. dwalkEncounter selection: a misfit re-picks once (boss slot ALWAYS re-picks) and
//    stamps displaced:true when the re-pick is still a misfit / on a non-repicked low/mid miss.
//    We can't force the RNG deterministically without a mutation, so we sample many draws and
//    assert the INVARIANT: every creature returned either fits its dungeon setting OR carries
//    displaced:true (the law is "keep it and stamp it," never a silent bad value).
// ============================================================================
{
  const win = freshWin();
  const BESTIARY = win.__bestiary();
  const THREAT = { id: "Beast Den", role: "predators", low: "wolf", mid: "wolf", boss: "wolf", scale: "", signs: "" };
  let sawAny = false, invariantHeld = true, sampleBad = null;
  for (let i = 0; i < 200; i++) {
    const enc = win.dwalkEncounter(THREAT, false, {});
    if (!enc || !enc.isEnemy || !Array.isArray(enc.creatures)) continue;
    enc.creatures.forEach(c => {
      sawAny = true;
      const fits = win.__monsterHabitatFit(c.creature, { env: "dungeon" });
      if (!fits && !c.displaced) { invariantHeld = false; if (!sampleBad) sampleBad = c; }
    });
  }
  check("2a. sampled at least one dungeon enemy encounter with creatures", sawAny);
  check("2b. INVARIANT: every dungeon creature either fits the dungeon setting or carries displaced:true", invariantHeld, JSON.stringify(sampleBad));

  // force a guaranteed misfit: a threat pool of ONLY a creature with a narrow non-dungeon habitat
  // (aarakocra-aeromancer: mountain/sky only) — re-pick can only draw the same misfit back, so this
  // MUST end up displaced:true (single-member pool proves the "keep + stamp" path fires for real).
  const NARROW_THREAT = { id: "Aarakocra-Only", role: "predators", low: "Aarakocra Aeromancer", mid: "Aarakocra Aeromancer", boss: "Aarakocra Aeromancer", scale: "", signs: "" };
  let sawDisplaced = false, sampleGood = null;
  for (let i = 0; i < 50; i++) {
    const enc = win.dwalkEncounter(NARROW_THREAT, true, {});
    if (!enc || !enc.isEnemy || !Array.isArray(enc.creatures)) continue;
    enc.creatures.forEach(c => { if (c.displaced) { sawDisplaced = true; sampleGood = c; } });
  }
  check("2c. a single-member misfit-only pool eventually stamps displaced:true (the keep+stamp path is live)", sawDisplaced, JSON.stringify(sampleGood));
}

// ============================================================================
// 3. dungeon/urban activity carry: a creature spec picks up BESTIARY[id].activity's first
//    non-"any" value as `activity` (dungeon has no behavior roll).
// ============================================================================
{
  const win = freshWin();
  const THREAT = { id: "Beast Den", role: "predators", low: "aarakocra-aeromancer", mid: "aarakocra-aeromancer", boss: "aarakocra-aeromancer", scale: "", signs: "" };
  let sawActivity = false, sample = null;
  for (let i = 0; i < 100; i++) {
    const enc = win.dwalkEncounter(THREAT, false, {});
    if (!enc || !enc.isEnemy || !Array.isArray(enc.creatures)) continue;
    enc.creatures.forEach(c => { if (!sample) sample = c; if (c.activity === "day") sawActivity = true; });
  }
  check("3a. a dungeon creature spec carries `activity` from BESTIARY (aarakocra-aeromancer -> \"day\")", sawActivity, JSON.stringify(sample));
}

// ============================================================================
// 4. wilderness behavior survives to the foe object (combatFromEncounter carries it as `doing`).
// ============================================================================
{
  const win = freshWin();
  const enc = { isEnemy: true, type: "Enemy", creature: "Wolf", behavior: "hunting in a coordinated pack", cr: 0.25 };
  const foes = win.combatFromEncounter(enc, {});
  check("4a. combatFromEncounter resolves one foe from a wilderness single-creature encounter", Array.isArray(foes) && foes.length === 1, JSON.stringify(foes));
  const f = foes && foes[0];
  check("4b. the foe's `doing` carries the wilderness behavior string verbatim", f && f.doing === "hunting in a coordinated pack", JSON.stringify(f && f.doing));
}

// ============================================================================
// 5. dungeon/urban activity survives combatFromEncounter as `doing` when no behavior is present.
// ============================================================================
{
  const win = freshWin();
  const enc = { isEnemy: true, type: "Enemy", creatures: [{ slot: "Boss CR", creature: "Aarakocra Aeromancer", bossSlot: true, activity: "day" }] };
  const foes = win.combatFromEncounter(enc, {});
  const f = foes && foes[0];
  check("5a. a dungeon/urban creature spec's `activity` becomes the foe's `doing` (no behavior roll to prefer)", f && f.doing === "day", JSON.stringify(f && f.doing));
  check("5b. bossSlot:true carries onto the combat foe object", f && f.bossSlot === true, JSON.stringify(f));
}

// ============================================================================
// 6. boss-slot / CR>=3 codex mint: a CR-4 non-realm boss mints kind:"creature" with
//    habitat/activity/factionFit/treasure fields; a CR-1 mook does not.
// ============================================================================
const DOM_HTML = `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div>
  <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
  </body></html>`;
function freshWinStory(customSrc) {
  const dom = new JSDOM(DOM_HTML, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (customSrc || srcText));
  return win;
}
function makeStoryWorld(win) {
  const world = {
    id: "w-mstory", name: "The Monster-Story Test World",
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
    factions: [{ name:"Copper Hand", dominant:false, agenda:"a", method:"b", tags:[], clock:{filled:0,size:6} }],
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

// a CR-4 non-realm boss-slot foe (Aarakocra Aeromancer: habitat mountain/sky, factionFit non-empty,
// treasure "arcana" != "none")
const BOSS_FOE = { name: "Aarakocra Aeromancer", statId: "aarakocra-aeromancer", cr: 4, bossSlot: true };
const MOOK_FOE = { name: "Common Rat", statId: "rat", cr: 0 };

{
  const win = freshWinStory();
  const world = makeStoryWorld(win);
  const r = win.applyEvent(world, { type: "combat_start", payload: { foes: [Object.assign({}, BOSS_FOE)] } });
  check("6a. combat_start returns ok:true", r && r.ok === true, JSON.stringify(r));
  const rec = world.codex && world.codex.records && world.codex.records["creature:aarakocra-aeromancer"];
  check("6b. a boss-slot CR-4 non-realm foe mints a codex 'creature' record", !!rec, JSON.stringify(world.codex));
  check("6c. the record carries fields.habitat (array) from BESTIARY", rec && Array.isArray(rec.fields.habitat) && rec.fields.habitat.length > 0, JSON.stringify(rec && rec.fields));
  check("6d. the record carries fields.activity from BESTIARY", rec && Array.isArray(rec.fields.activity) && rec.fields.activity.length > 0, JSON.stringify(rec && rec.fields));
  check("6e. the record carries fields.factionFit from BESTIARY", rec && Array.isArray(rec.fields.factionFit) && rec.fields.factionFit.length > 0, JSON.stringify(rec && rec.fields));
  check("6f. the record carries fields.treasure from BESTIARY", rec && rec.fields.treasure === "arcana", JSON.stringify(rec && rec.fields));
}
{
  const win = freshWinStory();
  const world = makeStoryWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [Object.assign({}, MOOK_FOE)] } });
  const creatureRecs = world.codex ? Object.values(world.codex.records).filter(r => r.kind === "creature") : [];
  check("6g. a CR-1 (here CR-0) mook does NOT mint a codex creature record", creatureRecs.length === 0, JSON.stringify(creatureRecs));
}

// ============================================================================
// 7. customTables flavor rolled ONCE at mint + IDENTICAL on re-mint (canon-lock).
// ============================================================================
{
  const win = freshWinStory();
  const world = makeStoryWorld(win);
  const ARMOR_FOE = { name: "Animated Armor", statId: "animated-armor", cr: 1, bossSlot: true };
  win.applyEvent(world, { type: "combat_start", payload: { foes: [Object.assign({}, ARMOR_FOE)] } });
  const rec1 = world.codex.records["creature:animated-armor"];
  check("7a. a bossSlot foe with customTables mints dm.flavor (one row per table)", rec1 && Array.isArray(rec1.dm.flavor) && rec1.dm.flavor.length === 2, JSON.stringify(rec1 && rec1.dm.flavor));
  const flavorSnapshot = JSON.stringify(rec1 && rec1.dm.flavor);

  // "re-encounter" the same-name foe: fight 1 must resolve (foe removed from combat) before a
  // second combat_start can mint/touch the record again (mirrors verify-realm-wiring's own pattern).
  let guard = 0;
  while (win.GS.combat && !win.GS.combat.foes[0].down && guard < 60) { win.applyEvent(world, { type: "attack", payload: { d20: 20, target: win.GS.combat.foes[0].fid } }); guard++; }
  win.applyEvent(world, { type: "combat_start", payload: { foes: [Object.assign({}, ARMOR_FOE)] } });
  const rec2 = world.codex.records["creature:animated-armor"];
  check("7b. a SECOND mint of the SAME creature does NOT re-roll dm.flavor (canon-lock)", JSON.stringify(rec2 && rec2.dm.flavor) === flavorSnapshot, JSON.stringify(rec2 && rec2.dm.flavor));
}

// ============================================================================
// 8. quest hook threatBinding: opts.threat carries a resolvable boss -> threatBinding with a
//    valid angle; no opts.threat -> byte-identical legacy shape (regression).
// ============================================================================
{
  const win = freshWin();
  const THREAT = { id: "Aarakocra-Aeromancer", role: "raiders", low: "Aarakocra Aeromancer", mid: "Aarakocra Aeromancer", boss: "Aarakocra Aeromancer", scale: "", signs: "" };
  const hook = win.rollQuestHook({ environment: "dungeon", threat: THREAT });
  check("8a. a hook rolled with a resolvable opts.threat carries threatBinding", !!hook.threatBinding, JSON.stringify(hook.threatBinding));
  check("8b. threatBinding.creature names the resolved bestiary creature", hook.threatBinding && hook.threatBinding.creature === "Aarakocra Aeromancer", JSON.stringify(hook.threatBinding));
  check("8c. threatBinding.statId carries the chassis id", hook.threatBinding && hook.threatBinding.statId === "aarakocra-aeromancer", JSON.stringify(hook.threatBinding));
  check("8d. threatBinding.angle is \"plunder\" (aarakocra-aeromancer's treasure != \"none\")", hook.threatBinding && hook.threatBinding.angle === "plunder", JSON.stringify(hook.threatBinding));

  const hookNoThreat = win.rollQuestHook({ environment: "dungeon" });
  check("8e. a hook rolled with NO opts.threat carries no threatBinding key at all (regression, byte-identical legacy shape)", !("threatBinding" in hookNoThreat), JSON.stringify(Object.keys(hookNoThreat)));
  check("8f. the legacy fields (leadsTo/macguffin/complication/urgency/questgiverPitch/questgiver) are all still present", hookNoThreat.leadsTo === "dungeon" && !!hookNoThreat.macguffin && !!hookNoThreat.complication && !!hookNoThreat.urgency && "questgiverPitch" in hookNoThreat && hookNoThreat.questgiver === null, JSON.stringify(hookNoThreat));

  // a threat with no resolvable boss/id -> no binding (graceful, not an error)
  const hookUnresolvable = win.rollQuestHook({ environment: "wilderness", threat: { id: "Some Wilderness Vibe Nobody Statted", low:"x", mid:"y", boss:"z" } });
  check("8g. an unresolvable threat produces no threatBinding (graceful)", !("threatBinding" in hookUnresolvable), JSON.stringify(Object.keys(hookUnresolvable)));
}

// ============================================================================
// 9. MUTATION CHECK (RED-FIRST): break the habitat filter (monsterHabitatFit always returns true)
//    -> misfits never re-pick AND never stamp displaced -> the harness's own §2c invariant
//    (single-member misfit-only pool eventually stamps displaced) must FAIL red.
// ============================================================================
{
  const original = read("src/engine/walk-archetypes.js");
  const marker = `  if(!allowed) return true;\n  return habitat.some(h=>allowed.indexOf(h)>=0);\n}`;
  if (!original.includes(marker)) {
    fail++; console.log("  ✗ MUTATION(habitat-filter): guard text not found verbatim — spec drifted?");
  } else {
    const mutated = `  if(!allowed) return true;\n  return true; // MUTATED: habitat filter disabled, always fits\n}`;
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js"))
        .map(p => p === "src/engine/walk-archetypes.js" ? original.replace(marker, mutated) : read(p))
        .join("\n;\n") + "\n;\n" + accessors;
    const win = freshWin(mutSrc);
    const NARROW_THREAT = { id: "Aarakocra-Only", role: "predators", low: "Aarakocra Aeromancer", mid: "Aarakocra Aeromancer", boss: "Aarakocra Aeromancer", scale: "", signs: "" };
    let sawDisplaced = false;
    for (let i = 0; i < 50; i++) {
      const enc = win.dwalkEncounter(NARROW_THREAT, true, {});
      if (!enc || !enc.isEnemy || !Array.isArray(enc.creatures)) continue;
      enc.creatures.forEach(c => { if (c.displaced) sawDisplaced = true; });
    }
    // RED-FIRST: with the habitat filter broken (always "fits"), we EXPECT displaced NEVER to be
    // stamped even for the guaranteed-misfit narrow pool — proving the real filter is load-bearing
    // for check 2c above. If the mutated build somehow still stamps displaced, that itself is the finding.
    check("9a. MUTATION reproduces: a broken habitat filter (always-fit) never stamps displaced even for a guaranteed misfit (proves §2c is load-bearing)", !sawDisplaced, "sawDisplaced=" + sawDisplaced);
  }
}

// ============================================================================
// 10. MUTATION CHECK (RED-FIRST): break the flavor canon-lock (re-roll every mint, ignore
//     alreadyMinted) -> a second mint's dm.flavor differs from the first -> the harness's own §7b
//     assertion (identical flavor on re-mint) must FAIL red.
// ============================================================================
{
  const original = read("src/world/dm.js");
  const marker = `    const existingId=codexKeyId("creature", f.name);
    const alreadyMinted=!!(typeof codexGet==="function" && codexGet(w, existingId));
    const flavor=(!alreadyMinted && f.statId) ? monsterRollFlavor(f.statId) : null;`;
  if (!original.includes(marker)) {
    fail++; console.log("  ✗ MUTATION(flavor-canon-lock): guard text not found verbatim — spec drifted?");
  } else {
    const mutated = `    const existingId=codexKeyId("creature", f.name);
    const alreadyMinted=!!(typeof codexGet==="function" && codexGet(w, existingId));
    const flavor=f.statId ? monsterRollFlavor(f.statId) : null; // MUTATED: re-rolls on every mint, ignoring alreadyMinted`;
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js"))
        .map(p => p === "src/world/dm.js" ? original.replace(marker, mutated) : read(p))
        .join("\n;\n") + "\n;\n" + accessors;
    const win = freshWinStory(mutSrc);
    const world = makeStoryWorld(win);
    const ARMOR_FOE = { name: "Animated Armor", statId: "animated-armor", cr: 1, bossSlot: true };
    win.applyEvent(world, { type: "combat_start", payload: { foes: [Object.assign({}, ARMOR_FOE)] } });
    const rec1 = world.codex.records["creature:animated-armor"];
    const flavorSnapshot = JSON.stringify(rec1 && rec1.dm.flavor);
    let guard = 0;
    while (win.GS.combat && !win.GS.combat.foes[0].down && guard < 60) { win.applyEvent(world, { type: "attack", payload: { d20: 20, target: win.GS.combat.foes[0].fid } }); guard++; }
    // roll many re-mints looking for ANY divergence from the first roll (a d10/d10 table pair has a
    // 1/100 chance of an identical re-roll by pure luck — sampling several tries makes a false-negative
    // vanishingly unlikely while keeping this deterministic-enough for a CI gate).
    let sawDivergence = false;
    for (let i = 0; i < 15 && !sawDivergence; i++) {
      win.applyEvent(world, { type: "combat_start", payload: { foes: [Object.assign({}, ARMOR_FOE)] } });
      const recN = world.codex.records["creature:animated-armor"];
      if (JSON.stringify(recN && recN.dm.flavor) !== flavorSnapshot) sawDivergence = true;
      guard = 0;
      while (win.GS.combat && !win.GS.combat.foes[0].down && guard < 60) { win.applyEvent(world, { type: "attack", payload: { d20: 20, target: win.GS.combat.foes[0].fid } }); guard++; }
    }
    // RED-FIRST: with canon-lock broken (re-rolls every mint), we EXPECT to see a divergent flavor
    // roll across re-mints — proving the real canon-lock guard is load-bearing for check 7b above.
    check("10a. MUTATION reproduces: breaking the canon-lock guard causes dm.flavor to diverge across re-mints (proves §7b is load-bearing)", sawDivergence, "sawDivergence=" + sawDivergence);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
