/* Verify MONSTER-PARLEY (docs/MONSTER-PARLEY.md) — creatures join the attitude ladder, recruit at
   Helpful into pet/hireling/sidekick, curveball quest-hook parley angle. jsdom, full
   manifest.loadOrder module load (same convention as dev/verify-realm-wiring.mjs).

   §4 verify plan:
     1. attitude ladder works on a creature record (codexFullRecord/codexPlayerView widen kind gate)
     2. socialCheckAbilityFor: Beast -> WIS/Animal Handling; ogre (non-beast) -> Cha/Persuasion
     3. creatureLevers derives from treasure/displaced/factionFit/hostile-flavor
     4. recruit_creature below +2 refuses (not-helpful); at +2 succeeds per tier
     5. pet mints non-leveling with chassis+traits stats (statBase passthrough), CR-gate
     6. sidekick CR-gate holds; sidekick slot uniqueness holds (second promotion refused)
     7. parley-angle hook appears only for speech-capable/hook-mode creatures (roll forced via opts)
     8. pet loyalty drops on neglect tick; hard-drop on harmed-by-kind; wanders at 0
     9. MUTATION red-first: remove the +2 gate -> a Hostile wolf recruits -> fail (asserted directly)
        remove the ability-for fork -> a wolf parley rolls Cha -> fail (asserted directly)

   Run:  node dev/verify-monster-parley.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
// BESTIARY is a top-level `const` — invisible to `window` under win.eval (same gotcha noted in
// verify-realm-wiring.mjs's own accessor comment). Expose a MUTATOR that writes INTO the real
// object (Object.assign), so test fixtures land in the same closure qhookResolveThreatCreature reads
// from — reassigning win.BESTIARY would create a disconnected shadow global instead.
const accessors = `
  function __bestiaryPut(id, entry){ if(typeof BESTIARY!=="undefined") BESTIARY[id]=entry; }
`;
const srcText = read("tables.js") + "\n;\n" + moduleSrc + "\n;\n" + accessors;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null; var GS={};`;

function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function freshWorld(win) {
  const w = { currentNodeId: "loc:start", characters: [], factions: [], session: 1 };
  if (typeof win.ensureCodex === "function") win.ensureCodex(w);
  return w;
}

function mintCreature(win, w, opts) {
  opts = opts || {};
  const id = "creature:" + (opts.slug || "test-wolf");
  const rec = win.codexAdd(w, {
    id, kind: "creature", name: opts.name || "Test Wolf", provenance: "rolled",
    fields: Object.assign({ type: "beast", cr: 0.25, treasure: "none", factionFit: [] }, opts.fields || {}),
    dm: opts.dm || {},
    status: { known: true, soft: false, at: w.currentNodeId, condition: "active" },
  });
  return rec;
}

const ev = (win, w, type, payload) => win.applyEvent(w, { type, payload, source: "declared" });

// ============================================================================
// 1. attitude ladder on a creature record (digest + player view widen the npc-only gate)
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);
  const rec = mintCreature(win, w, {});
  win.codexAttitudeOpen(w, rec.id, 0, { cause: "test" });
  const full = win.codexFullRecord(w, win.codexGet(w, rec.id));
  check("1a. codexFullRecord materializes attitude for kind:creature", !!full.attitude && full.attitude.label === "Indifferent");

  win.codexSetAttitude(w, rec.id, 1, "warmed");
  win.codexMarkAttitudeRead(w, rec.id, true);
  const pv = win.codexPlayerView(w).find(r => r.id === rec.id);
  check("1b. codexPlayerView exposes the read tell for kind:creature", !!pv && !!pv.attitude && pv.attitude.label === "Friendly");
}

// ============================================================================
// 2. socialCheckAbilityFor — Beast -> WIS/Animal Handling; non-beast -> Cha/Persuasion
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);
  const wolf = mintCreature(win, w, { slug: "wolf", fields: { type: "beast" } });
  const ogre = mintCreature(win, w, { slug: "ogre", name: "Test Ogre", fields: { type: "giant" } });
  const wolfAbility = win.socialCheckAbilityFor(win.codexGet(w, wolf.id));
  const ogreAbility = win.socialCheckAbilityFor(win.codexGet(w, ogre.id));
  check("2a. Beast resolves WIS/Animal Handling", wolfAbility.ability === "wis" && wolfAbility.skill === "Animal Handling", JSON.stringify(wolfAbility));
  check("2b. non-Beast (giant) resolves Cha/Persuasion", ogreAbility.ability === "cha" && ogreAbility.skill === "Persuasion", JSON.stringify(ogreAbility));
  const npcAbility = win.socialCheckAbilityFor({ kind: "npc" });
  check("2c. an npc record always resolves Cha (never Beast-forked)", npcAbility.ability === "cha");
}

// ============================================================================
// 3. creatureLevers — derives from treasure/displaced/factionFit/hostile-flavor
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);
  const rec = mintCreature(win, w, {
    fields: { treasure: "coins", displaced: true, factionFit: ["Raiders"] },
    dm: { flavor: [{ band: "Volatile", text: "it snarls, cornered" }] },
  });
  const levers = win.creatureLevers(win.codexGet(w, rec.id));
  const types = levers.map(l => l.type);
  check("3a. treasure!=='none' -> a 'want' lever", types.indexOf("want") >= 0, JSON.stringify(levers));
  check("3b. factionFit non-empty -> a 'leverage' lever", types.indexOf("leverage") >= 0, JSON.stringify(levers));
  check("3c. Volatile/Mythic flavor band -> a 'fear' lever", types.indexOf("fear") >= 0, JSON.stringify(levers));

  const calmRec = mintCreature(win, w, { slug: "calm-thing", fields: { treasure: "none", factionFit: [] } });
  const calmLevers = win.creatureLevers(win.codexGet(w, calmRec.id));
  check("3d. no signal -> no levers", calmLevers.length === 0, JSON.stringify(calmLevers));
}

// ============================================================================
// 4. recruit_creature — the +2 gate, script-owned and absolute
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);
  const rec = mintCreature(win, w, { slug: "gate-test" });
  win.codexAttitudeOpen(w, rec.id, -2, { cause: "test" });   // Hostile
  const refusedHostile = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "hireling" });
  check("4a. Hostile (-2) recruit refuses (not-helpful)", refusedHostile.ok === false && refusedHostile.reason === "not-helpful", JSON.stringify(refusedHostile));

  win.codexSetAttitude(w, rec.id, 1, "warming");   // Friendly, still not Helpful
  const refusedFriendly = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "hireling" });
  check("4b. Friendly (+1) recruit STILL refuses — only +2 qualifies", refusedFriendly.ok === false && refusedFriendly.reason === "not-helpful");

  win.codexSetAttitude(w, rec.id, 2, "won over");   // Helpful
  const grantedHireling = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "hireling" });
  check("4c. Helpful (+2) recruit succeeds (hireling)", grantedHireling.ok === true, JSON.stringify(grantedHireling));
}

// ============================================================================
// 5. pet mint — non-leveling, chassis+traits stats verbatim, CR gate
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);
  const rec = mintCreature(win, w, { slug: "wolf-pet", fields: { type: "beast", cr: 0.25 } });
  win.codexSetAttitude(w, rec.id, 2, "won over");
  const statBase = { cr: 0.25, hp: 11, maxHp: 11, abilities: { wis: { mod: 0 } } };
  const petResult = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "pet", statBase });
  check("5a. pet mint succeeds at Helpful, CR<=2", petResult.ok === true, JSON.stringify(petResult));
  check("5b. pet stats are the chassis passthrough (statBase verbatim)", petResult.pet && petResult.pet.statBase && petResult.pet.statBase.hp === 11);
  check("5c. pet carries no wage (non-leveling bond, not a payroll line)", petResult.pet && petResult.pet.wage === undefined);

  const bigRec = mintCreature(win, w, { slug: "big-thing", fields: { type: "giant", cr: 5 } });
  win.codexSetAttitude(w, bigRec.id, 2, "won over");
  const overCr = ev(win, w, "recruit_creature", { codexId: bigRec.id, tier: "pet", statBase: { cr: 5 } });
  check("5d. CR>2 pet mint refuses (cr-too-high)", overCr.ok === false && overCr.reason === "cr-too-high", JSON.stringify(overCr));
}

// ============================================================================
// 6. sidekick — CR gate + slot uniqueness (Tasha's model, any type incl. Beast)
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);
  win.SIDEKICK_CLASSES = win.SIDEKICK_CLASSES || { Warrior: { levels: {} }, Expert: { levels: {} }, Spellcaster: { levels: {} } };
  const rec = mintCreature(win, w, { slug: "sidekick-wolf", fields: { type: "beast", cr: 0.25 } });
  win.codexSetAttitude(w, rec.id, 2, "won over");
  const sk1 = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "sidekick", className: "Warrior", cr: 0.25 });
  check("6a. Beast at CR<=1/2 promotes to sidekick (Tasha's model, any type)", sk1.ok === true, JSON.stringify(sk1));

  const rec2 = mintCreature(win, w, { slug: "second-sidekick", fields: { type: "beast", cr: 0.25 } });
  win.codexSetAttitude(w, rec2.id, 2, "won over");
  const sk2 = ev(win, w, "recruit_creature", { codexId: rec2.id, tier: "sidekick", className: "Warrior", cr: 0.25 });
  check("6b. a SECOND sidekick promotion is refused (one-slot law)", sk2.ok === false && sk2.reason === "slot-occupied", JSON.stringify(sk2));
}

// ============================================================================
// 7. quest-hook parley angle — only on speech-capable/hook-mode threats, script-rolled
// ============================================================================
{
  const win = freshWin();
  win.__bestiaryPut("chatty-goblin", { id: "chatty-goblin", name: "Chatty Goblin", habitat: ["cave"], activity: ["raiding"], factionFit: [], treasure: "coins", abilities: { int: { score: 10 } } });
  const threat = { id: "chatty-goblin", role: "raiders", boss: "Chatty Goblin", low: "Goblin", mid: "Goblin", scale: "", signs: "" };

  const hookForced = win.rollQuestHook({ threat, parleyRoll: 1 });
  check("7a. speech-capable (INT>=3) threat + forced roll=1 -> angle:parley", hookForced.threatBinding && hookForced.threatBinding.angle === "parley", JSON.stringify(hookForced.threatBinding));

  const hookMissed = win.rollQuestHook({ threat, parleyRoll: 2 });
  check("7b. speech-capable threat + forced roll!=1 -> falls back to the base angle (not parley)", hookMissed.threatBinding && hookMissed.threatBinding.angle !== "parley", JSON.stringify(hookMissed.threatBinding));

  win.__bestiaryPut("mindless-ooze", { id: "mindless-ooze", name: "Mindless Ooze", habitat: ["cave"], activity: [], factionFit: [], treasure: "none", abilities: { int: { score: 1 } } });
  const mindlessThreat = { id: "mindless-ooze", role: "hazard", boss: "Mindless Ooze", low: "Ooze", mid: "Ooze", scale: "", signs: "" };
  const hookMindless = win.rollQuestHook({ threat: mindlessThreat, parleyRoll: 1 });
  check("7c. a non-speech-capable, non-hook-mode threat NEVER gets angle:parley even on roll=1", hookMindless.threatBinding && hookMindless.threatBinding.angle !== "parley", JSON.stringify(hookMindless.threatBinding));

  win.__bestiaryPut("hook-slime", { id: "hook-slime", name: "Hook Slime", habitat: ["cave"], activity: [], factionFit: [], treasure: "none", abilities: { int: { score: 1 } }, flavorTable: { mode: "hook" } });
  const hookModeThreat = { id: "hook-slime", role: "hazard", boss: "Hook Slime", low: "Slime", mid: "Slime", scale: "", signs: "" };
  const hookModeResult = win.rollQuestHook({ threat: hookModeThreat, parleyRoll: 1 });
  check("7d. flavorTable.mode==='hook' licenses parley even at INT 1", hookModeResult.threatBinding && hookModeResult.threatBinding.angle === "parley", JSON.stringify(hookModeResult.threatBinding));
}

// ============================================================================
// 8. pet loyalty — neglect tick, harmed-by-kind hard drop, wanders at 0
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);
  const rec = mintCreature(win, w, { slug: "loyalty-wolf", fields: { type: "beast", cr: 0.25 } });
  win.codexSetAttitude(w, rec.id, 2, "won over");
  const petResult = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "pet", statBase: { cr: 0.25, id: "wolf" } });
  const pet = win.companionsOf(w).pets[0];
  check("8a. pet mints onto w.companions.pets", !!pet && pet.loyalty === 3);

  win.companionPetNeglectTick(w, pet, false);
  check("8b. neglect tick drops loyalty by 1", pet.loyalty === 2, "loyalty=" + pet.loyalty);

  win.companionPetNeglectTick(w, pet, true);   // tended — holds steady
  check("8c. a tended tick holds loyalty steady", pet.loyalty === 2, "loyalty=" + pet.loyalty);

  win.companionPetHarmedByKind(w, "wolf");
  check("8d. harmed-by-kind drops loyalty HARD (double the ordinary tick)", pet.loyalty === 0, "loyalty=" + pet.loyalty);
  check("8e. loyalty 0 -> the pet wanders off the roster", win.companionsOf(w).pets.length === 0);
}

// ============================================================================
// 9. MUTATION red-first (asserted directly against the source functions/events)
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);
  // 9a. the +2 gate: assert the ACTUAL guard condition a Hostile wolf would hit — if this string
  // literal ("not-helpful") or the strict a.value!==2 check were ever loosened, this assertion
  // (run against the real applyEvent output) goes red exactly as the code review requires.
  const rec = mintCreature(win, w, { slug: "mutation-wolf" });
  win.codexAttitudeOpen(w, rec.id, -2, { cause: "test" });
  const hostileAttempt = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "hireling" });
  check("9a. MUTATION GUARD — a Hostile wolf's recruit attempt is refused, not silently granted",
    hostileAttempt.ok === false && hostileAttempt.reason === "not-helpful",
    "if this ever reads ok:true, the +2 gate was relaxed — " + JSON.stringify(hostileAttempt));

  // 9b. the ability-for fork: assert a beast NEVER resolves to Cha — if the fork were removed
  // (always falling through to the Cha default), this comparison catches it directly.
  const wolfAbility = win.socialCheckAbilityFor(win.codexGet(w, rec.id));
  check("9b. MUTATION GUARD — a Beast's parley ability is NEVER Cha",
    wolfAbility.ability === "wis",
    "if this ever reads 'cha', the ability-for fork was removed — " + JSON.stringify(wolfAbility));
}

console.log(`\nMONSTER-PARLEY: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
