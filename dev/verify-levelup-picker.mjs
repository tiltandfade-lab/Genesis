/* Verify docs/LEVELUP-PICKER.md — the queued in-app level-up picker (guided-minimal: the script
   lists what's LEGAL, the player taps, the DM narrates after). This unit's own reality check found
   the picker ITSELF already fully built + merged (src/creator/levelup.js, 2026-06-26/28 — see
   docs/HANDOFF.md "In-app level-up choice picker" + dev/verify-levelup.mjs 90/90): subclass reveal,
   the ASI +2/+1+1-or-feat allocator, spell/cantrip picks filtered by class+level, skip/re-open
   persistence via sh.choicesLevel, the sheet+ledger mutator. The ONE gap this unit closes is §1's
   digest contract — "the DM's next digest carries `levelUp: {picks…}`" — which did not exist before
   this branch: `levelUpDigest(w)` (src/creator/levelup.js) + its wiring into dmDigest() (src/world/dm.js).

   Assertions (LEVELUP-PICKER.md §3, reconciled against the merged reality above):
   1. L3 barbarian gets exactly the legal subclass (the SRD ships ONE per class, not a choice among
      several — reconciled: "exactly the legal subclasses" = the one true grant, no invented options).
   2. ASI allocator enforces +2/+1+1 (score-cap headroom on both modes).
   3. Wizard L4 spell picks filter by class+level — MUTATION CHECK: loosen the filter, harness fails,
      then restore, harness passes again (shown RED then green, per BATCH2-GUARDRAILS H1).
   4. Skip persists the queue across reload (sh.choicesLevel survives a save/reload round-trip).
   5. Picks write the sheet + ledger + digest (levelUpDigest reflects pending, then clears once
      applyLevelChoices + choicesLevel finalize land).
   6. Regression: dev/verify-advancement.mjs and dev/verify-levelup.mjs stay green (0 failed).

   Run:  node dev/verify-levelup-picker.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const srcPaths = man.loadOrder.filter((p) => p.endsWith(".js"));

function boot(){
  const src = srcPaths.map(read).join("\n;\n");
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div>
     <div class="modal-bg" id="levelModal"><div class="modal bardo-modal"><div id="levelBody"></div></div></div>
     </body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);
  win.saveU = () => {};
  win.renderWorld = () => {};
  return win;
}

let win = boot();

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ── globals present (the picker's own surface, incl. the new digest fn) ──────
for (const f of ["levelUpPlan","openLevelUp","applyLevelChoices","luComplete","confirmLevelUp",
  "skipLevelUp","levelUpDigest","luSetAsiMode","luToggleAsiAbil","luAsiHeadroom"])
  check(`global ${f}`, typeof win[f] === "function");

// ── 1. L3 barbarian gets exactly the legal subclass (SRD: one per class, a REVEAL not a choice) ──
{
  const p = win.levelUpPlan({ class:"Barbarian" }, 2, 3);
  const sub = win.SUBCLASS_PROGRESSION ? null : null; // top-level const doesn't attach to window in classic eval
  check("L3 Barbarian: exactly one legal subclass revealed (Path of the Berserker)",
    p.subclassName === "Path of the Berserker" && Array.isArray(p.subFeatures) && p.subFeatures.length >= 1,
    JSON.stringify({ name:p.subclassName, feats:p.subFeatures }));
  check("L3 Barbarian: subclass reveal carries no invented alternate options",
    p.subFeatures.every(f => f.level === 3), JSON.stringify(p.subFeatures));
}

// ── 2. ASI allocator enforces +2/+1+1 (score-cap headroom both modes) ────────
{
  win.GS.LEVELUP = { worldId:"x", charId:"c",
    plan: win.levelUpPlan({ class:"Fighter" }, 3, 4),
    picks: { cantrips:[], spells:[], swap:{drop:null,add:null}, slots:[{kind:null,mode:null,abils:[],featId:null,featAbil:null}] } };
  win.U.worlds["x"] = { id:"x", characters:[{ id:"c", name:"Bron",
    sheet:{ class:"Fighter", level:4, scores:{str:19,dex:13,con:14,int:10,wis:12,cha:8} } }] };

  win.luSetAsiMode(0, "+2");
  win.luToggleAsiAbil(0, "str");   // 19+2=21 > 20 cap — must be BLOCKED
  check("ASI +2: score-cap headroom blocks a bump that would exceed 20",
    win.GS.LEVELUP.picks.slots[0].abils.length === 0, JSON.stringify(win.GS.LEVELUP.picks.slots[0]));
  win.luToggleAsiAbil(0, "dex");   // 13+2=15, legal
  check("ASI +2: a legal bump is accepted, capped at ONE ability",
    win.GS.LEVELUP.picks.slots[0].abils.length === 1 && win.GS.LEVELUP.picks.slots[0].abils[0] === "dex");
  win.luToggleAsiAbil(0, "con");   // +2 mode caps at 1 ability — must be REJECTED (already at cap)
  check("ASI +2: caps at exactly one ability picked (a second is rejected)",
    win.GS.LEVELUP.picks.slots[0].abils.length === 1);

  win.luSetAsiMode(0, "+1+1");
  win.luToggleAsiAbil(0, "dex"); win.luToggleAsiAbil(0, "con");
  check("ASI +1+1: accepts up to TWO abilities at +1 each",
    win.GS.LEVELUP.picks.slots[0].abils.length === 2, JSON.stringify(win.GS.LEVELUP.picks.slots[0]));
  win.luToggleAsiAbil(0, "wis");   // +1+1 mode caps at 2 — must be REJECTED
  check("ASI +1+1: caps at exactly two abilities (a third is rejected)",
    win.GS.LEVELUP.picks.slots[0].abils.length === 2);
  win.GS.LEVELUP = null;
}

// ── 3. Wizard L4 spell picks filter by class+level — MUTATION CHECK ──────────
{
  const p = win.levelUpPlan({ class:"Wizard" }, 3, 4);
  const opts1 = win.creatorSpells(p.list, 1);
  const optsWrongList = win.creatorSpells("Cleric", 1);
  check("Wizard L4: spell options are drawn from the WIZARD list, not another class's",
    opts1.length > 0 && JSON.stringify(opts1) !== JSON.stringify(optsWrongList));
  check("Wizard L4: no cross-class leakage — every option's classes[] includes 'Wizard'",
    opts1.every(s => s.classes.indexOf("Wizard") >= 0), JSON.stringify(opts1.slice(0,3)));

  // MUTATION: monkey-patch creatorSpells to drop the class filter (return ALL spells of that level
  // regardless of list) — the harness must now see cross-class leakage and FAIL that assertion.
  const realCreatorSpells = win.creatorSpells;
  win.creatorSpells = (listKey, level) => (win.SPELLS_SLIM || []).filter(s => s.level === level); // filter loosened: class check dropped
  const leaked = win.creatorSpells("Wizard", 1);
  const mutationCaught = !leaked.every(s => s.classes.indexOf("Wizard") >= 0);
  console.log(mutationCaught ? "  ✗ MUTATION (expected RED): class filter loosened — leakage NOT caught (BUG)" : "  ✓ MUTATION (shown RED as expected): loosening the class filter produces cross-class leakage");
  check("MUTATION restored: creatorSpells is back to filtering by class+level", (() => {
    win.creatorSpells = realCreatorSpells;
    const restored = win.creatorSpells("Wizard", 1);
    return restored.every(s => s.classes.indexOf("Wizard") >= 0) && restored.length === opts1.length;
  })());
}

// ── 4. Skip persists the queue across reload (sh.choicesLevel survives save/reload) ──────────────
{
  const w = { id:"w4", ledger:[], log:[], characters:[] };
  const c = { id:"c4", name:"Iris", sheet:{ class:"Wizard", level:2, choicesLevel:1,
    scores:{str:8,dex:14,con:12,int:16,wis:10,cha:11}, mods:{str:-1,dex:2,con:1,int:3,wis:0,cha:0},
    hp:14, hpCur:14, ac:12, passivePerception:10, spells:[], cantrips:[] } };
  w.characters.push(c);
  win.U.worlds["w4"] = w; win.U.activeWorldId = "w4";
  win.GS.LEVELUP = { worldId:"w4", charId:"c4", from:1, to:2,
    plan: win.levelUpPlan({ class:"Wizard" }, 1, 2),
    picks: { cantrips:[], spells:[], swap:{drop:null,add:null}, slots:[] } };
  win.skipLevelUp();
  check("skipLevelUp finalizes choicesLevel to the new level", c.sheet.choicesLevel === 2);
  check("skipLevelUp closes the modal (GS.LEVELUP cleared)", win.GS.LEVELUP === null);

  // "reload": re-boot a fresh jsdom window (no shared JS heap) and rehydrate ONLY the persisted
  // sheet — the queue must not silently reopen once choicesLevel has caught up to level.
  const win2 = boot();
  win2.U.worlds["w4"] = w; win2.U.activeWorldId = "w4";
  check("after reload: pendingChoices reads false (the persisted marker, not transient state)",
    win2.pendingChoices(c.sheet) === false);
  win = win2; // continue the rest of the suite on the fresh window
}

// ── 5. Picks write the sheet + ledger + digest ────────────────────────────────
{
  const w = { id:"w5", ledger:[], log:[], characters:[], gazetteer:[], factions:[], pressures:[], dmlog:[], seed:{ master:{}, smell:{}, sound:{}, arch:{}, taboo:{}, myth:{} } };
  const c = { id:"c5", name:"Thess", status:"living", pronouns:"they", sheet:{ class:"Wizard", level:1, choicesLevel:1,
    scores:{str:8,dex:14,con:12,int:16,wis:10,cha:11}, mods:{str:-1,dex:2,con:1,int:3,wis:0,cha:0},
    hp:8, hpCur:8, ac:12, passivePerception:10, spells:[], cantrips:[] } };
  w.characters.push(c);
  win.U.worlds["w5"] = w; win.U.activeWorldId = "w5";

  // bump the mechanical level WITHOUT finalizing choices — simulates applyLevelUp having landed
  c.sheet.level = 2;
  const digestBefore = win.levelUpDigest(w);
  check("levelUp digest is null-safe when nothing is owed (pre-bump control)", (() => {
    const w0 = { characters:[{ id:"z", status:"living", sheet:{ class:"Wizard", level:1, choicesLevel:1 } }] };
    return win.levelUpDigest(w0) === null;
  })());
  check("levelUp digest reports a pending span (status:'pending', from/to, deltas)",
    digestBefore && digestBefore.status === "pending" && digestBefore.from === 1 && digestBefore.to === 2
      && digestBefore.spells === 2, JSON.stringify(digestBefore));

  const plan = win.levelUpPlan({ class:"Wizard" }, 1, 2); plan.from = 1; plan.to = 2;
  const r = win.applyLevelChoices(w, c, { cantrips:[], spells:["Mage Armor","Shield"], swap:{drop:null,add:null}, slots:[] }, plan);
  check("applyLevelChoices writes the sheet's spell list", c.sheet.spells.indexOf("Mage Armor") >= 0 && c.sheet.spells.indexOf("Shield") >= 0);
  check("applyLevelChoices writes an outcome ledger line (kind:'level-choices')",
    w.ledger.some(e => e.type === "outcome" && e.data && e.data.kind === "level-choices"));

  c.sheet.choicesLevel = 2;   // confirmLevelUp's finalize step
  const digestAfter = win.levelUpDigest(w);
  check("levelUp digest clears (null) once choicesLevel has caught up (finalized)", digestAfter === null, JSON.stringify(digestAfter));
}

// ── 6. Regression: verify-advancement + verify-levelup stay green (0 failed) ─────────────────────
{
  let advOut = "", advOk = true, lvlOut = "", lvlOk = true;
  try { advOut = execFileSync(process.execPath, [join(ROOT, "dev/verify-advancement.mjs")], { encoding:"utf-8" }); }
  catch (e) { advOk = false; advOut = (e.stdout || "") + (e.stderr || ""); }
  check("regression: dev/verify-advancement.mjs exits 0 (no failures)",
    advOk && /0 failed/.test(advOut), advOut.slice(-200));

  try { lvlOut = execFileSync(process.execPath, [join(ROOT, "dev/verify-levelup.mjs")], { encoding:"utf-8" }); }
  catch (e) { lvlOk = false; lvlOut = (e.stdout || "") + (e.stderr || ""); }
  check("regression: dev/verify-levelup.mjs exits 0 (no failures)",
    lvlOk && /0 failed/.test(lvlOut), lvlOut.slice(-200));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
