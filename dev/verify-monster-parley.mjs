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
    14. REVIEW-FIXES-0705 U4 — creature-parley §1 wiring (REACHABLE-PATH, via applyEvent, not a direct
        creatureLevers() call): social_check auto-merges creatureLevers(rec0) into levers, dedupe by
        priced key (DM lever wins); digest attaches parleyAbility to creature records; ledger carries
        leversDerived. NPC social_check is byte-identical (no derived levers, no parleyAbility).

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

// U3 (docs/REVIEW-FIXES-0705.md) — reachable-path tests drive passTime/applyEvent, never the
// companion pet functions directly. passTime's tail calls saveU/renderWorld/toast, which touch the
// DOM (same convention as dev/verify-economy-sinks.mjs's newWin) — stub #worldView/#toast into the
// body and pin restRiskRoll deterministically non-interrupting so a stochastic rest-risk roll can
// never flake this suite's own assertions (rest-risk itself is covered elsewhere, on purpose).
function freshWinForPassTime() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  win.eval(`restRiskRoll = function(){ return { ok:true, class:"inn", text:"Uneventful", band:"", severe:false, interrupted:false }; };`);
  return win;
}

// world shape passTime's rest gate reads (characters/currentNodeId/ledger/clock) — a wilderness
// node (no shop/lodging) so the lodging sink's gold-charge doesn't interfere with loyalty asserts.
function freshWorldForPassTime(win, opts) {
  opts = opts || {};
  const w = {
    id: "w-pet", name: "Pet Test World", session: 1,
    startNodeId: "wild", currentNodeId: "wild",
    map: { nodes: { wild: { id: "wild", name: "Deep Wood", type: "Wilds", x: 0, y: 0 } }, edges: [] },
    gazetteer: [], ledger: [], log: [], clock: { day: 1, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: opts.gold != null ? opts.gold : 0, scores: { str: 10 }, inventory: [] } }],
    factions: [], pressures: [], shops: {}, codex: { records: {}, version: 1 },
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null };
  win.GS.combat = null;
  return w;
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
  // §2b UPDATE: Helpful (+2) alone is NO LONGER sufficient — the ANOMALY LAW's second gate
  // (rec.fields.bondEligible===true) must ALSO hold. This record was set Helpful directly via
  // codexSetAttitude (bypassing social_check entirely), so bondEligible was never stamped —
  // recruit_creature must refuse "no-bond", not grant on attitude alone.
  const refusedNoBond = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "hireling" });
  check("4c. Helpful (+2) WITHOUT bondEligible refuses (no-bond) — §2b's second gate", refusedNoBond.ok === false && refusedNoBond.reason === "no-bond", JSON.stringify(refusedNoBond));

  // 4d. Helpful (+2) WITH bondEligible stamped succeeds — the double gate, both conditions met.
  rec.fields.bondEligible = true;
  const grantedHireling = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "hireling" });
  check("4d. Helpful (+2) + bondEligible succeeds (hireling)", grantedHireling.ok === true, JSON.stringify(grantedHireling));
}

// ============================================================================
// 5. pet mint — non-leveling, chassis+traits stats verbatim, CR gate
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);
  const rec = mintCreature(win, w, { slug: "wolf-pet", fields: { type: "beast", cr: 0.25 } });
  win.codexSetAttitude(w, rec.id, 2, "won over");
  rec.fields.bondEligible = true;   // §2b's second gate — this section tests the MINT mechanics, not the gate itself
  const statBase = { cr: 0.25, hp: 11, maxHp: 11, abilities: { wis: { mod: 0 } } };
  const petResult = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "pet", statBase });
  check("5a. pet mint succeeds at Helpful+bondEligible, CR<=2", petResult.ok === true, JSON.stringify(petResult));
  check("5b. pet stats are the chassis passthrough (statBase verbatim)", petResult.pet && petResult.pet.statBase && petResult.pet.statBase.hp === 11);
  check("5c. pet carries no wage (non-leveling bond, not a payroll line)", petResult.pet && petResult.pet.wage === undefined);

  const bigRec = mintCreature(win, w, { slug: "big-thing", fields: { type: "giant", cr: 5 } });
  win.codexSetAttitude(w, bigRec.id, 2, "won over");
  bigRec.fields.bondEligible = true;
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
  rec.fields.bondEligible = true;   // §2b's second gate — this section tests sidekick-promotion mechanics, not the gate
  const sk1 = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "sidekick", className: "Warrior", cr: 0.25 });
  check("6a. Beast at CR<=1/2 promotes to sidekick (Tasha's model, any type)", sk1.ok === true, JSON.stringify(sk1));

  const rec2 = mintCreature(win, w, { slug: "second-sidekick", fields: { type: "beast", cr: 0.25 } });
  win.codexSetAttitude(w, rec2.id, 2, "won over");
  rec2.fields.bondEligible = true;
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
  rec.fields.bondEligible = true;   // §2b's second gate — this section tests pet-loyalty mechanics, not the gate
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

  // 9c. §2b MUTATION GUARD — the grind ceiling: grind a creature's attitude via ordinary social_check
  // successes ALL THE WAY from 0 up; it must never clear +1 (Friendly). If the ceiling clamp were ever
  // removed, repeated successes would walk 0->1->2 exactly like an NPC and this assertion goes red.
  const grindRec = mintCreature(win, w, { slug: "grind-wolf" });
  win.codexAttitudeOpen(w, grindRec.id, 0, { cause: "test" });
  for (let i = 0; i < 20; i++) {
    ev(win, w, "social_check", { target: grindRec.id, skill: "Animal Handling", total: 99 });   // total 99 vs any DC on the ladder always succeeds
  }
  const grindFinal = win.codexGetAttitude(w, grindRec.id);
  check("9c. MUTATION GUARD — 20 ordinary social_check successes on a creature NEVER clear +1 (Friendly)",
    grindFinal.value === 1,
    "if this is ever 2, the §2b grind ceiling was removed — attitude=" + grindFinal.value);
  check("9c-bond. grinding to the ceiling alone never stamps bondEligible (ordinary means only)",
    !(win.codexGet(w, grindRec.id).fields && win.codexGet(w, grindRec.id).fields.bondEligible));

  // 9d. §2b MUTATION GUARD — the bondEligible gate on recruit_creature: a record forced to attitude
  // +2 WITHOUT bondEligible must refuse "no-bond". If that gate were ever removed, bare +2 attitude
  // (however reached) would grant the recruit outright and this assertion goes red.
  const bareRec = mintCreature(win, w, { slug: "bare-plus2-wolf" });
  win.codexAttitudeOpen(w, bareRec.id, 0, { cause: "test" });
  win.codexSetAttitude(w, bareRec.id, 2, "forced");   // +2 with no bondEligible stamp
  const bareAttempt = ev(win, w, "recruit_creature", { codexId: bareRec.id, tier: "hireling" });
  check("9d. MUTATION GUARD — bare +2 (no bondEligible) recruit refuses, never silently granted",
    bareAttempt.ok === false && bareAttempt.reason === "no-bond",
    "if this ever reads ok:true, the §2b bondEligible gate was removed — " + JSON.stringify(bareAttempt));
}

// ============================================================================
// 10. THE GRIND CEILING (§2b.1) — social_check clamps a creature at +1; an NPC is untouched
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);

  // 10a. a creature starting at Friendly (+1): an ordinary successful social_check must HOLD at +1,
  // never advance to +2 — the resolver would normally grant +1->+2 (ceiling=ATTITUDE_MAX=2), but the
  // creature-only ceiling intercepts it.
  const rec = mintCreature(win, w, { slug: "ceiling-wolf" });
  win.codexAttitudeOpen(w, rec.id, 1, { cause: "test" });   // Friendly
  const r1 = ev(win, w, "social_check", { target: rec.id, skill: "Animal Handling", total: 99 });
  check("10a. a creature at +1 clamps at +1 on an ordinary success (never reaches +2)", r1.to === 1, JSON.stringify(r1));

  // 10b. an NPC at Friendly (+1) is COMPLETELY UNTOUCHED — an ordinary success reaches +2 exactly as
  // before this unit (byte-identical NPC path, per §2b: "NPCs are untouched").
  const npc = win.codexAdd(w, { id: "npc:ceiling-test", kind: "npc", name: "Ceiling Test NPC", provenance: "rolled",
    fields: {}, status: { known: true, soft: false, at: w.currentNodeId, condition: "active" } });
  win.codexAttitudeOpen(w, npc.id, 1, { cause: "test" });   // Friendly
  const r2 = ev(win, w, "social_check", { target: npc.id, skill: "Persuasion", total: 99 });
  check("10b. an NPC at +1 STILL reaches +2 on an ordinary success — NPCs are byte-identical, untouched",
    r2.to === 2, JSON.stringify(r2));

  // 10c. a FAILING social_check on a creature at 0 never triggers the ceiling discussion at all
  // (shift is 0 or negative) — the clamp only ever engages on a positive, ceiling-crossing shift.
  const rec2 = mintCreature(win, w, { slug: "ceiling-wolf-fail" });
  win.codexAttitudeOpen(w, rec2.id, 0, { cause: "test" });
  const r3 = ev(win, w, "social_check", { target: rec2.id, skill: "Animal Handling", total: 1, dc: 30 });
  check("10c. a failing check on a creature is unaffected by the ceiling (shift stays <=0)", r3.to <= 0, JSON.stringify(r3));
}

// ============================================================================
// 11. bondEligible SETTERS (§2b.2) — nat-20, decisive lever at +1, friendly spawn
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);

  // 11a. NAT-20 on a creature's social_check: lifts the ceiling for THIS shift (a creature at +1 can
  // reach +2) AND stamps bondEligible.
  const nat20Rec = mintCreature(win, w, { slug: "nat20-wolf" });
  win.codexAttitudeOpen(w, nat20Rec.id, 1, { cause: "test" });   // Friendly
  const natRes = ev(win, w, "social_check", { target: nat20Rec.id, skill: "Animal Handling", total: 99, natural: 20 });
  check("11a. a nat-20 on a creature at +1 LIFTS the ceiling — reaches +2", natRes.to === 2, JSON.stringify(natRes));
  check("11a-bond. that same nat-20 shift stamps bondEligible", win.codexGet(w, nat20Rec.id).fields.bondEligible === true);

  // 11a-neg. a nat-20 declared on an NPC never touches bondEligible (the field/gate is creature-only —
  // recruit_creature's own kind check already refuses non-creatures outright, this just confirms the
  // stamp path itself never fires for an npc record).
  const nat20Npc = win.codexAdd(w, { id: "npc:nat20-test", kind: "npc", name: "Nat20 Test NPC", provenance: "rolled",
    fields: {}, status: { known: true, soft: false, at: w.currentNodeId, condition: "active" } });
  win.codexAttitudeOpen(w, nat20Npc.id, 1, { cause: "test" });
  ev(win, w, "social_check", { target: nat20Npc.id, skill: "Persuasion", total: 99, natural: 20 });
  check("11a-npc. a nat-20 on an NPC never stamps bondEligible (NPCs don't carry the field)",
    !(win.codexGet(w, nat20Npc.id).fields && win.codexGet(w, nat20Npc.id).fields.bondEligible));

  // 11b. a DECISIVE lever cashed exactly at +1 (0 -> 1 auto-shift) stamps bondEligible — "you gave it
  // the thing it wanted most; the lever IS the bond." It does NOT itself lift the ceiling past +1.
  const leverRec = mintCreature(win, w, { slug: "lever-wolf" });
  win.codexAttitudeOpen(w, leverRec.id, 0, { cause: "test" });   // Indifferent
  const leverRes = ev(win, w, "social_check", { target: leverRec.id, skill: "Persuasion", total: 0, levers: [{ type: "want", decisive: true }] });
  check("11b. a decisive lever from 0 auto-shifts to +1", leverRes.to === 1, JSON.stringify(leverRes));
  check("11b-bond. landing exactly at +1 via a decisive lever stamps bondEligible", win.codexGet(w, leverRec.id).fields.bondEligible === true);

  // 11b-ceiling. the SAME decisive-lever mechanism starting from +1 would auto-shift toward +2 — the
  // ceiling clamp still catches it back to +1 (only nat-20 lifts the ceiling, not a lever alone).
  const leverRec2 = mintCreature(win, w, { slug: "lever-wolf-ceiling" });
  win.codexAttitudeOpen(w, leverRec2.id, 1, { cause: "test" });   // Friendly
  const leverRes2 = ev(win, w, "social_check", { target: leverRec2.id, skill: "Persuasion", total: 0, levers: [{ type: "want", decisive: true }] });
  check("11b-ceiling. a decisive lever from +1 is STILL clamped at +1 (only nat-20 lifts the ceiling)",
    leverRes2.to === 1, JSON.stringify(leverRes2));

  // 11c. recruit_creature succeeds end-to-end once bondEligible is earned via the nat-20 anomaly.
  const recruitAfterNat20 = ev(win, w, "recruit_creature", { codexId: nat20Rec.id, tier: "hireling" });
  check("11c. recruit_creature succeeds once bondEligible is earned via nat-20 + attitude is +2", recruitAfterNat20.ok === true, JSON.stringify(recruitAfterNat20));
}

// ============================================================================
// 12. FRIENDLY SPAWN (§2b, "the friendly-spawn channel") — the 3% roll, mook-skip, mint + bondEligible
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);

  // 12a. rollFriendlySpawn distribution: ~3% fire rate over 2000 draws, roughly even neutral/friendly
  // split when it does fire. Wide tolerance band (a probabilistic property, not an exact count).
  let fired = 0, neutral = 0, friendly = 0;
  const TRIES = 2000;
  for (let i = 0; i < TRIES; i++) {
    const spawn = win.rollFriendlySpawn(false);
    if (spawn) { fired++; if (spawn === "neutral") neutral++; else if (spawn === "friendly") friendly++; }
  }
  const rate = fired / TRIES;
  check("12a. rollFriendlySpawn fires at ~3% over 2000 draws (0.5%-6% band)", rate >= 0.005 && rate <= 0.06, "rate=" + rate + " (" + fired + "/" + TRIES + ")");
  check("12a-split. the fired spawns split roughly neutral/friendly (both present in 2000 draws' worth of fires)",
    fired < 20 || (neutral > 0 && friendly > 0), "neutral=" + neutral + " friendly=" + friendly + " fired=" + fired);

  // 12b. mook slots NEVER fire, regardless of the gate roll — isMookSlot=true short-circuits before
  // the 3% check even runs (force the gate roll to 0, which would ALWAYS fire on a non-mook slot).
  let mookFired = 0;
  for (let i = 0; i < 200; i++) { if (win.rollFriendlySpawn(true, 0, 0.4)) mookFired++; }
  check("12b. a mook slot NEVER fires a friendly spawn, even forced to the gate roll's floor", mookFired === 0, "mookFired=" + mookFired);

  // 12c. forced determinism: forced=0 (below the 3% threshold) on a non-mook slot ALWAYS fires;
  // forcedSplit pins neutral vs friendly deterministically.
  check("12c. forced gate roll 0 (< 3%) on a non-mook slot always fires", !!win.rollFriendlySpawn(false, 0, 0.1));
  check("12c-neutral. forcedSplit < 0.5 -> neutral", win.rollFriendlySpawn(false, 0, 0.1) === "neutral");
  check("12c-friendly. forcedSplit >= 0.5 -> friendly", win.rollFriendlySpawn(false, 0, 0.9) === "friendly");
  check("12c-miss. forced gate roll 0.05 (>= 3%) never fires", win.rollFriendlySpawn(false, 0.05, 0.1) === null);

  // 12d. codexMintSignificantFoes mints a spawnDisposition-flagged foe REGARDLESS of the significance
  // threshold (a mook-tier CR-0.25 foe with no bossSlot/realmRole/CR>=3 would normally never mint) —
  // opens at 0 (neutral) or +1 (friendly), and stamps bondEligible:true ("born eligible").
  const neutralFoe = { name: "Friendly Test Critter A", cr: 0.25, statId: "wolf", spawnDisposition: "neutral" };
  win.codexMintSignificantFoes(w, [neutralFoe]);
  const neutralRecId = win.codexKeyId ? win.codexKeyId("creature", neutralFoe.name) : null;
  const neutralRec = neutralRecId ? win.codexGet(w, neutralRecId) : null;
  check("12d. a mook-CR friendly-spawn foe (spawnDisposition:'neutral') MINTS despite failing every ordinary significance test",
    !!neutralRec, "neutralRec=" + JSON.stringify(neutralRec));
  if (neutralRec) {
    const att = win.codexGetAttitude(w, neutralRec.id);
    check("12d-open. 'neutral' spawnDisposition opens attitude at 0 (Indifferent)", att.value === 0, "value=" + att.value);
    check("12d-bond. a friendly-spawn mint stamps bondEligible:true (born eligible)", neutralRec.fields.bondEligible === true);
  }

  const friendlyFoe = { name: "Friendly Test Critter B", cr: 0.25, statId: "wolf", spawnDisposition: "friendly" };
  win.codexMintSignificantFoes(w, [friendlyFoe]);
  const friendlyRecId = win.codexKeyId ? win.codexKeyId("creature", friendlyFoe.name) : null;
  const friendlyRec = friendlyRecId ? win.codexGet(w, friendlyRecId) : null;
  if (friendlyRec) {
    const att2 = win.codexGetAttitude(w, friendlyRec.id);
    check("12d-open-friendly. 'friendly' spawnDisposition opens attitude at +1 (Friendly)", att2.value === 1, "value=" + att2.value);
    check("12d-bond-friendly. a friendly 'friendly' spawn mint also stamps bondEligible:true", friendlyRec.fields.bondEligible === true);
  }

  // 12e. an ordinary (non-spawnDisposition) mook-CR foe STILL never mints (the pre-existing
  // significance threshold is unchanged for everything that ISN'T a friendly spawn — regression).
  const ordinaryMook = { name: "Ordinary Test Mook", cr: 0.25, statId: "wolf" };
  win.codexMintSignificantFoes(w, [ordinaryMook]);
  const ordinaryRecId = win.codexKeyId ? win.codexKeyId("creature", ordinaryMook.name) : null;
  check("12e. an ordinary mook-CR foe (no spawnDisposition) still never mints — regression, unchanged",
    !win.codexGet(w, ordinaryRecId));
}

// ============================================================================
// 13. wilderness behavior text (§2b) — opens attitude at 0 but NEVER sets bondEligible by itself
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);
  // No mechanized code path today reads wilderness `behavior` text to set attitude/bondEligible (it's
  // DM-narrated per the doc's own wording, "may ALSO open at 0" — guidance, not a coded trigger). The
  // guarantee this test protects: an ordinary creature-mint (no spawnDisposition, non-guarded activity)
  // opens at plain Indifierent(0) with bondEligible untouched — confirming nothing in this unit
  // accidentally wires behavior text into the bond gate.
  const behaviorFoe = { name: "Wary Test Critter", cr: 0.25, statId: "wolf", bossSlot: true, activity: undefined };
  win.codexMintSignificantFoes(w, [behaviorFoe]);
  const recId = win.codexKeyId("creature", behaviorFoe.name);
  const rec = win.codexGet(w, recId);
  check("13a. an ordinary (non-spawn) creature mint opens at 0 without bondEligible", !!rec && win.codexGetAttitude(w, rec.id).value === 0);
  check("13b. bondEligible is NOT set by a plain wilderness/ordinary mint", !(rec.fields && rec.fields.bondEligible));
}

// ============================================================================
// U3 (docs/REVIEW-FIXES-0705.md) — pet upkeep/decay wired at REACHABLE paths (passTime/applyEvent),
// never companionTickAllPets/companionPetHarmedByKind called directly.
// ============================================================================

// shared setup: mint+bond+recruit a pet onto a fresh passTime-capable world; returns {win, w, pet, rec}
function mintBoundPet(opts) {
  opts = opts || {};
  const win = freshWinForPassTime();
  const w = freshWorldForPassTime(win, opts.worldOpts);
  const rec = mintCreature(win, w, {
    slug: opts.slug || "wired-pet-wolf",
    fields: { type: "beast", cr: 0.25 },
  });
  win.codexSetAttitude(w, rec.id, 2, "won over");
  rec.fields.bondEligible = true;
  const petResult = ev(win, w, "recruit_creature", { codexId: rec.id, tier: "pet", statBase: { cr: 0.25, id: "wolf" } });
  const pet = win.companionsOf(w).pets[0];
  return { win, w, pet, rec, petResult };
}

// ── U3.1 (⊗ RED-FIRST): passTime("dawn") ticks neglect — loyalty drops by 1 via the REAL rest gate ──
{
  const { win, w, pet } = mintBoundPet({ slug: "u3-neglect-wolf" });
  check("U3.1-setup. pet bound onto w.companions.pets at loyalty 3", !!pet && pet.loyalty === 3, JSON.stringify(pet));
  win.passTime("dawn");
  const petAfter = win.companionsOf(w).pets[0];
  check("U3.1 RED-FIRST: passTime('dawn') neglect-ticks a bound pet — loyalty drops 3 -> 2 via the REAL rest gate",
    !!petAfter && petAfter.loyalty === 2, "loyalty=" + (petAfter && petAfter.loyalty));
}

// ── U3.2: applyEvent(tend_pet) then passTime("dawn") the SAME day -> loyalty holds steady ──
{
  const { win, w, pet } = mintBoundPet({ slug: "u3-tended-wolf" });
  const tendRes = ev(win, w, "tend_pet", { target: pet.codexId });
  check("U3.2a. tend_pet succeeds and stamps pet.tendedDay", tendRes.ok === true && pet.tendedDay === win.clockOf(w).day, JSON.stringify(tendRes));
  win.passTime("dawn");
  const petAfter = win.companionsOf(w).pets[0];
  check("U3.2b. a tended pet holds loyalty steady through the same-day rest gate (still 3)",
    !!petAfter && petAfter.loyalty === 3, "loyalty=" + (petAfter && petAfter.loyalty));
}

// ── U3.2c: tend_pet hostile payloads — missing target / unknown id / non-pet codexId ──
{
  const { win, w, rec } = mintBoundPet({ slug: "u3-tend-guard-wolf" });
  const missingTarget = ev(win, w, "tend_pet", {});
  check("U3.2c-i. tend_pet with no target refuses, no throw", missingTarget.ok === false, JSON.stringify(missingTarget));
  const unknownId = ev(win, w, "tend_pet", { target: "creature:does-not-exist" });
  check("U3.2c-ii. tend_pet with an unknown codexId refuses (no-pet:*)", unknownId.ok === false && /no-pet:/.test(unknownId.reason), JSON.stringify(unknownId));
  const npc = win.codexAdd(w, { id: "npc:not-a-pet", kind: "npc", name: "Not A Pet", provenance: "rolled", fields: {}, status: { known: true, soft: false, at: w.currentNodeId, condition: "active" } });
  const nonPet = ev(win, w, "tend_pet", { target: npc.id });
  check("U3.2c-iii. tend_pet targeting a non-pet codexId (an NPC's id) refuses, no throw", nonPet.ok === false, JSON.stringify(nonPet));
}

// ── U3.3 (⊗ RED-FIRST): the REAL attack event dealing damage to a foe of the pet's kind -> hard drop ──
{
  const { win, w, pet } = mintBoundPet({ slug: "u3-harm-wolf" });
  // set up a live GS.combat with a foe of the SAME kind as the bound pet (statBase.id "wolf",
  // matching companionPetHarmedByKind's loose match against pet.statBase.id).
  const pc = w.characters[0];
  pc.sheet.weapons = pc.sheet.weapons || {};
  win.GS.combat = {
    active: true, round: 1,
    pc: { hp: 20, maxHp: 20 },
    foes: [{ fid: "f1", name: "Wild Wolf", hp: 11, maxHp: 11, ac: 12, down: false, statBase: { id: "wolf" }, creatureType: "beast" }],
  };
  const target = win.GS.combat.foes[0];
  // force a guaranteed hit + fixed damage via pcAttack's own contract: an unarmed/default resolve —
  // stub pcAttack deterministically so this test isolates the harm-by-kind wiring, not the dice.
  win.eval(`pcAttack = function(sh, o){ return { hit:true, damage:5, crit:false, natural:15, atkBonus:5, total:20, targetAC:o.targetAC, weaponName:"Fists", breakdown:[{type:"bludgeoning"}], magnitude:null, fullCover:false }; };`);
  const atk1 = ev(win, w, "attack", { d20: 15, targetAC: 12, target: "f1" });
  check("U3.3-setup. the stubbed attack hits and applies damage to the foe", atk1.ok === true && target.hp < 11, JSON.stringify(atk1) + " hp=" + target.hp);
  const petAfter1 = win.companionsOf(w).pets[0];
  check("U3.3 RED-FIRST: the REAL attack event on a foe of the pet's kind hard-drops loyalty (3 -> 1, double tick)",
    !!petAfter1 && petAfter1.loyalty === 1, "loyalty=" + (petAfter1 && petAfter1.loyalty));
  const ledgerHit = w.ledger.slice().reverse().find(e => e.data && e.data.kind === "pet-loyalty" && e.data.cause === "harmed its kind");
  check("U3.3-ledger. the hard drop ledgers a pet-loyalty/harmed-its-kind outcome line", !!ledgerHit, JSON.stringify(ledgerHit));

  // a SECOND attack on the SAME kind in the SAME combat -> no further drop (once-per-kind-per-combat guard)
  target.hp = 11; target.down = false;
  const atk2 = ev(win, w, "attack", { d20: 15, targetAC: 12, target: "f1" });
  const petAfter2 = win.companionsOf(w).pets[0];
  check("U3.3b. a SECOND attack on the same kind in the SAME combat causes no further drop (guard holds)",
    atk2.ok === true && !!petAfter2 && petAfter2.loyalty === 1, "loyalty=" + (petAfter2 && petAfter2.loyalty));
}

// ── U3.4: loyalty driven to 0 via ticks -> the pet wanders (roster removed, codex record persists) ──
{
  const { win, w, pet, rec } = mintBoundPet({ slug: "u3-wander-wolf" });
  win.passTime("dawn");  // 3 -> 2
  win.passTime("dawn");  // 2 -> 1
  win.passTime("dawn");  // 1 -> 0 -> wanders
  check("U3.4a. loyalty ticked to 0 over 3 untended rest-gate passes removes the pet from the roster",
    win.companionsOf(w).pets.length === 0, "pets=" + win.companionsOf(w).pets.length);
  check("U3.4b. the codex record persists after the pet wanders (recall-eligible)",
    !!win.codexGet(w, rec.id));
  const wanderLedger = w.ledger.slice().reverse().find(e => e.type === "npc-life" && e.data && e.data.kind === "pet-wanders");
  check("U3.4c. wandering off logs an npc-life/pet-wanders entry", !!wanderLedger, JSON.stringify(wanderLedger));
}

// ============================================================================
// 14. REVIEW-FIXES-0705 U4 — creature-parley §1 wiring (REACHABLE-PATH via applyEvent)
// ============================================================================
{
  const win = freshWin();
  const w = freshWorld(win);

  // 14a. ⊗ RED-FIRST — a Beast codex record with an authored want (treasure) and NO DM levers: the
  // resolver's DC must reflect the auto-merged 'want' lever (-5) exactly as if the DM HAD declared it.
  // Compare a record with story fields against a plain record with none, both driven through the real
  // applyEvent(social_check) path (never call creatureLevers() directly here).
  const storyRec = mintCreature(win, w, { slug: "story-wolf", fields: { type: "beast", treasure: "coins", factionFit: [] } });
  win.codexAttitudeOpen(w, storyRec.id, -1, { cause: "test" });   // Hostile(-1) -> DC 20 base (SOCIAL_DC_BY_ATTITUDE)
  // total=15 clears DC 20-5=15 (auto-merged want lever) but NOT the bare DC 20 — this is the fork the fix must close.
  const storyRes = ev(win, w, "social_check", { target: storyRec.id, skill: "Animal Handling", total: 15 });
  const storyLedger = w.ledger[w.ledger.length - 1];

  const plainRec = mintCreature(win, w, { slug: "plain-wolf", fields: { type: "beast", treasure: "none", factionFit: [] } });
  win.codexAttitudeOpen(w, plainRec.id, -1, { cause: "test" });
  const plainRes = ev(win, w, "social_check", { target: plainRec.id, skill: "Animal Handling", total: 17 });

  check("14a. ⊗ RED-FIRST — a creature's own story fields (treasure) auto-merge into levers and lower the effective DC (total=15 now clears)",
    storyRes.to > storyRes.from, "storyRes=" + JSON.stringify(storyRes));
  check("14a-contrast. the SAME kind of miss (total=17, no story fields) still fails at the bare DC 20 — no-shift, not a fix-dependent outcome",
    plainRes.to === plainRes.from, "plainRes=" + JSON.stringify(plainRes));

  // 14a-ledger. the auto-merged lever keys ride the outcome ledger line (leversDerived) so playtests can
  // see the engine's contribution.
  check("14a-ledger. the outcome payload carries leversDerived with the auto-merged 'want' key",
    !!storyLedger && Array.isArray(storyLedger.data.leversDerived) && storyLedger.data.leversDerived.indexOf("want") >= 0,
    JSON.stringify(storyLedger && storyLedger.data));

  // 14b. a DM-declared lever of the SAME key as a derived one is priced ONCE (DM lever wins, no double-pricing).
  const dedupeRec = mintCreature(win, w, { slug: "dedupe-wolf", fields: { type: "beast", treasure: "coins", factionFit: [] } });
  win.codexAttitudeOpen(w, dedupeRec.id, -1, { cause: "test" });   // DC 20 base
  // DM declares its OWN 'want' lever (decisive:false) — if double-priced this would be -10, clearing a
  // total as low as 10; single-priced it only clears down to DC 15 (total>=15 needed, same as 14a).
  const dedupeResLow = ev(win, w, "social_check", { target: dedupeRec.id, skill: "Animal Handling", total: 12, levers: [{ type: "want" }] });
  check("14b. a DM-declared lever of the same key as a derived one is priced ONCE (total=12 still fails — not double-priced to DC 10)",
    dedupeResLow.to === dedupeResLow.from, "dedupeResLow=" + JSON.stringify(dedupeResLow));

  const dedupeRec2 = mintCreature(win, w, { slug: "dedupe-wolf-2", fields: { type: "beast", treasure: "coins", factionFit: [] } });
  win.codexAttitudeOpen(w, dedupeRec2.id, -1, { cause: "test" });
  const dedupeResHigh = ev(win, w, "social_check", { target: dedupeRec2.id, skill: "Animal Handling", total: 15, levers: [{ type: "want" }] });
  check("14b-clears. single-priced, total=15 DOES clear (DC 20-5=15) confirming the dedupe collapses to one -5, not two",
    dedupeResHigh.to > dedupeResHigh.from, "dedupeResHigh=" + JSON.stringify(dedupeResHigh));

  // 14c. digest — parleyAbility rides codexFullRecord for a creature (Beast -> Animal Handling), and is
  // ABSENT for a non-creature (npc) record.
  const digestBeast = mintCreature(win, w, { slug: "digest-wolf", fields: { type: "beast" } });
  const fullBeast = win.codexFullRecord(w, win.codexGet(w, digestBeast.id));
  check("14c. the digest attaches parleyAbility to a Beast creature record (wis/Animal Handling)",
    !!fullBeast.parleyAbility && fullBeast.parleyAbility.ability === "wis" && fullBeast.parleyAbility.skill === "Animal Handling",
    JSON.stringify(fullBeast.parleyAbility));

  const digestGiant = mintCreature(win, w, { slug: "digest-ogre", name: "Digest Ogre", fields: { type: "giant" } });
  const fullGiant = win.codexFullRecord(w, win.codexGet(w, digestGiant.id));
  check("14c-nonbeast. a non-Beast creature record gets parleyAbility too (cha/Persuasion)",
    !!fullGiant.parleyAbility && fullGiant.parleyAbility.ability === "cha", JSON.stringify(fullGiant.parleyAbility));

  const npcRec = win.codexAdd(w, { id: "npc:digest-test", kind: "npc", name: "Digest Test NPC", provenance: "rolled",
    fields: {}, status: { known: true, soft: false, at: w.currentNodeId, condition: "active" } });
  const fullNpc = win.codexFullRecord(w, win.codexGet(w, npcRec.id));
  check("14d. an NPC record NEVER gets parleyAbility (creature-only digest field)", fullNpc.parleyAbility === undefined, JSON.stringify(fullNpc.parleyAbility));

  // 14d-social. NPC social_check stays byte-identical: no derived levers auto-merged (an NPC record has
  // no creature story fields to derive from, and the kind gate excludes it outright even if it did).
  win.codexAttitudeOpen(w, npcRec.id, -1, { cause: "test" });
  const npcSocial = ev(win, w, "social_check", { target: npcRec.id, skill: "Persuasion", total: 17 });
  check("14d-social. an NPC social_check at total=17 vs DC20 still fails (no-shift) — no derived levers auto-merged onto NPCs",
    npcSocial.to === npcSocial.from, "npcSocial=" + JSON.stringify(npcSocial));
  const lastNpcLedger = w.ledger[w.ledger.length - 1];
  check("14d-ledger. an NPC outcome payload carries no leversDerived (or an empty one) — never the creature-only field",
    !lastNpcLedger.data.leversDerived || lastNpcLedger.data.leversDerived.length === 0,
    JSON.stringify(lastNpcLedger.data.leversDerived));
}

console.log(`\nMONSTER-PARLEY: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
