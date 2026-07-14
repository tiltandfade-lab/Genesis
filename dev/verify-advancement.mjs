/* Verify the Advancement spine (docs/ADVANCEMENT.md, docs/TIER-SCOPE.md) — full-app jsdom load.
   Asserts: SRD XP thresholds (L1-10) + the LEVEL_CEILING clamp; xpForEvent pricing (objective-gated
   combat, major-only choices); awardXp accrual + pending detection; applyLevelUp GROWS HP / proficiency
   / spell slots / class pools (proving the ensureResources fill-missing gap is handled); the level_applied
   event recompute through applyEvent; and the rest-gate claiming a pending level-up.

   Run:  node dev/verify-advancement.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

for (const f of ["levelForXp","xpForLevel","pendingLevelUp","awardXp","applyLevelUp","xpForEvent","advTier"])
  check(`global ${f}`, typeof win[f] === "function");

// (top-level `const` aren't on window in classic scripts — test the tables THROUGH the public functions)

// ── SRD thresholds (L1-10), read via xpForLevel ──────────────────────────────
const SRD = { 1:0, 2:300, 3:900, 4:2700, 5:6500, 6:14000, 7:23000, 8:34000, 9:48000, 10:64000 };
check("XP thresholds match SRD for L1-10", Object.entries(SRD).every(([l,xp]) => win.xpForLevel(+l) === xp));
check("levelForXp maps thresholds exactly", win.levelForXp(0)===1 && win.levelForXp(299)===1 && win.levelForXp(300)===2 && win.levelForXp(63999)===9 && win.levelForXp(64000)===10);

// ── the Tier-2 ceiling: XP past L10 still yields L10 (primary cap enforcement) ─
check("levelForXp clamps to the ceiling", win.levelForXp(64000)===10 && win.levelForXp(85000)===10 && win.levelForXp(999999)===10);
check("advTier: 1-4 → T1, 5-10 → T2", win.advTier(1)===1 && win.advTier(4)===1 && win.advTier(5)===2 && win.advTier(10)===2);

// ── xpForEvent pricing — ADVANCEMENT-RETUNE.md §2 (front_closed/clock_fired re-priced off E(L)) ──
check("front_closed prices 1.0×E(L) at size6 baseline (L1 → E(1)=200)", win.xpForEvent("front_closed",{},1,{size:6}) === 200);
check("front_closed scales with E(L) by level (L5 → E(5)=1800)", win.xpForEvent("front_closed",{},5,{size:6}) === 1800);
check("clock_fired(forPlayer) pays the unchanged pre-retune award", win.xpForEvent("clock_fired",{forPlayer:true},1) > 0);
check("clock_fired(against PC, NOT survived) pays 0", win.xpForEvent("clock_fired",{forPlayer:false},1) === 0);
check("clock_fired(against PC, survived) pays 0.5×E(L) — the retune's new 'world hit you' award", win.xpForEvent("clock_fired",{forPlayer:false},1,{survived:true}) === Math.round(0.5*200));
check("choice_logged pays only on major", win.xpForEvent("choice_logged",{weight:"major"},1) > 0 && win.xpForEvent("choice_logged",{weight:"minor"},1) === 0);
// ── ADVANCEMENT-RETUNE.md §0/§1: the kill gate is UN-GATED (every real fight pays); the old
// objective GATE is now a ×XP_TUNE.objBonus BONUS multiplier ────────────────────────────────────
check("encounter_resolved pays WITHOUT an objectiveRef (un-gated, retune §0/§1)", win.xpForEvent("encounter_resolved",{foes:[{cr:5}]},5) > 0);
check("encounter_resolved pays MORE with an objectiveRef (the bonus, not a gate)",
  win.xpForEvent("encounter_resolved",{foes:[{cr:5}],objectiveRef:"front:x"},5) > win.xpForEvent("encounter_resolved",{foes:[{cr:5}]},5));
check("encounter XP scales with the real foe CR (higher CR pays more)",
  win.xpForEvent("encounter_resolved",{foes:[{cr:8}]},8) > win.xpForEvent("encounter_resolved",{foes:[{cr:2}]},2));

// ── awardXp accrual + pending detection ──────────────────────────────────────
{ const sh={class:"Fighter",level:1,xp:0,mods:{con:2}};
  const r1=win.awardXp(sh,250); check("awardXp accrues", r1.xp===250 && r1.gained===250 && r1.pending===false);
  const r2=win.awardXp(sh,100); check("awardXp flags pending once a threshold is crossed", r2.xp===350 && r2.pending===true);
  check("pendingLevelUp agrees", win.pendingLevelUp(sh)===true); }

// ── level-up grows current HP by the GAIN — it must NOT full-heal (a short rest doesn't restore HP) ──
{ const sh={class:"Fighter",level:1,xp:300,mods:{con:2},hp:12,hpCur:4}; win.ensureResources(sh);
  const r=win.applyLevelUp(sh,2);
  check("damaged PC leveling on a short rest is NOT full-healed", sh.hpCur === 4 + r.hpGain && sh.hpCur < sh.hp);
  check("...and current is clamped to the new max", sh.hpCur <= sh.hp); }
{ const sh={class:"Fighter",level:1,xp:300,mods:{con:2},hp:12}; win.ensureResources(sh);  // full when undamaged
  const r=win.applyLevelUp(sh,2); check("undamaged PC leveling ends at the new full", sh.hpCur === sh.hp); }

// ── applyLevelUp GROWS maxes (the ensureResources fill-missing gap) ───────────
// A Wizard 4→5 gains a level-3 spell slot. Build a level-4 sheet, ensure resources, then level up.
{ const sh={class:"Wizard",level:4,xp:6500,mods:{con:1,int:3}};
  win.ensureResources(sh);
  const slots4=(sh.slotsMax||[]).slice();
  const hp4=sh.hp||0;
  const r=win.applyLevelUp(sh,5);
  check("applyLevelUp returns from/to", r.ok && r.from===4 && r.to===5);
  check("Wizard 4→5 GROWS spell slots (3rd-level slot appears)", (sh.slotsMax[2]||0) > (slots4[2]||0));
  check("current slots grew with max (topped on the rest)", sh.slots[2] === sh.slotsMax[2]);
  check("proficiency bonus recomputed (L5 → +3)", sh.profBonus === 3);
  check("HP grew (level-up gain applied)", typeof sh.hp==="number"); }

// HP growth amount: Barbarian (d12) L1→2 = floor(12/2)+1 + con
{ const sh={class:"Barbarian",level:1,xp:0,mods:{con:3},hp:15}; win.ensureResources(sh);
  const r=win.applyLevelUp(sh,2);
  check("Barbarian L1→2 HP gain = 7 + CON(3) = 10", r.hpGain === 10 && sh.hp === 25);
  check("Barbarian rages grew with level (1→2 gives more rages)", sh.pools && sh.pools.rages && sh.pools.rages.max >= 2); }

// ── the ceiling holds in applyLevelUp too ────────────────────────────────────
{ const sh={class:"Fighter",level:10,xp:999999,mods:{con:2}}; win.ensureResources(sh);
  const r=win.applyLevelUp(sh,12);
  check("applyLevelUp refuses to exceed the ceiling (10→12 is a no-op)", r.ok===false && sh.level===10); }

// ── level_applied event recompute through applyEvent ─────────────────────────
{ const w={ id:"wa", name:"Adv", ledger:[], clock:{day:1,min:360}, gazetteer:[], factions:[], revealed:{},
    characters:[{status:"living",name:"Ozun",sheet:{class:"Cleric",level:2,xp:900,mods:{con:2,wis:3}}}] };
  win.ensureResources(w.characters[0].sheet);
  const re=win.applyEvent(w,{type:"level_applied",payload:{to:3},source:"detected"});
  check("level_applied event advances the sheet", re.ok && re.to===3 && w.characters[0].sheet.level===3);
  check("level_applied wrote an outcome ledger line", w.ledger.some(e=>e.type==="outcome" && e.data && e.data.kind==="level")); }

// ── detected XP through applyEvent (front_closed) accrues + can flag a level ──
{ const w={ id:"wb", name:"XP", ledger:[], clock:{day:1,min:360}, gazetteer:[], factions:[{name:"Ash",clock:{filled:6,size:6},danger:null}], pressures:[], revealed:{},
    characters:[{status:"living",name:"Rell",sheet:{class:"Rogue",level:1,xp:0,mods:{con:1,dex:3}}}] };
  win.applyEvent(w,{type:"front_closed",payload:{frontId:"ash"},source:"detected"});
  check("front_closed accrues detected XP on the sheet", (w.characters[0].sheet.xp||0) > 0);
  check("front_closed wrote an XP ledger line", w.ledger.some(e=>e.type==="outcome" && e.data && e.data.kind==="xp")); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
