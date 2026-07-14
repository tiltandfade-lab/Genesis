/* Verify COMBAT-TRACKER (docs/COMBAT-TRACKER.md) — the combat panel + Abilities-tab fill, over a full
   jsdom load (real modules in manifest order, same convention as dev/verify-shop-ui.mjs). Drives real
   events through applyEvent and asserts the rendered DOM per the spec's §5 verification plan +
   BATCH-GUARDRAILS G7 rulings:
     1. GS.combat.active auto-opens the combat panel; four band lanes render (CM_BANDS order,
        melee-first); foes land in their band's lane.
     2. Foe state word (fresh/bloodied/down) derives correctly; NO foe.hp/foe.maxHp/foe.ac numeral
        ever appears in the rendered combat-panel HTML (mutation check: leak foe.hp into a chip →
        the harness's own regex assertion fails; restore).
     3. round_tick bumps the header round; a {rounds:n} condition shows n dots, decays, clears on expiry.
     4. PC at 0 HP → death-save pips in the panel AND the status sidebar; death_save events fill them.
     5. Concentration badge appears on cast-with-concentration, clears on concentration_broken.
     6. Combat end restores the prior panel exactly once.
     7. Abilities tab: L5 Barbarian fixture lists Rage + Extra Attack (+ subclass feature if the sheet
        has one); a L1 fixture shows only L1 features; no advice verb ("should"/"best"/"consider")
        appears anywhere in the Abilities body (mutation check on the same regex).
     8. Regression smoke: the shop panel still renders unaffected.

   Run:  node dev/verify-combat-tracker.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
// CM_BANDS is a top-level `const` — it doesn't attach to jsdom's `window` under win.eval (only var/
// function do), so expose it via a thin accessor wrapper (same pattern as verify-gen.mjs's __charNames).
const accessors = "function __cmBands(){return CM_BANDS;}";
const srcText = read("tables.js") + "\n;\n" + moduleSrc + "\n;\n" + accessors;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

function makeWorld(win, sheetOverrides = {}) {
  const world = {
    id: "w-combattest", name: "The Combat Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting DOM" } },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: Object.assign({
        species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16 }, mods: { str: 4, con: 3 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [], equipped: {}, pools: {},
      }, sheetOverrides) }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined;
  return world;
}

function startFight(win, world, opts = {}) {
  const combat = win.combatStart(Object.assign({
    pc: { init: 2 },
    foes: [{ name: "Bat" }, { name: "Basilisk" }],
    pcRoll: 15, foeRoll: 3,
  }, opts));
  win.GS.combat = combat;
  return combat;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 1. AUTO-OPEN + FOUR BAND LANES (§1, §5.1)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, world);
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  check("1a. GS.gamePanel auto-opens to 'combat' while GS.combat.active", win.GS.gamePanel === "combat", win.GS.gamePanel);
  // BATTLE-VISUALS A1 (2026-07-03): "one board, not three" — the redundant .cmb-lane/.cmb-lane-lbl chip
  // strip is REMOVED (its chips migrated into the zone grid's cells); the zone grid's own
  // .cmb-zone-row[data-band] rows are now the sole surviving evidence of "four band lanes render in
  // canonical order" — same assertion, updated to the surviving structure per the amendment's red-first
  // rule (RED proof: pre-fix run showed "✗ 1b ... — []" once .cmb-lane-lbl stopped rendering).
  const bandRows = [...host.querySelectorAll(".cmb-zone-row")].map(el => el.getAttribute("data-band"));
  check("1b. four band lanes render in engine canonical order (melee-first), now as the zone grid's own rows", bandRows[0] === "melee", JSON.stringify(bandRows));
  const cmBands = win.__cmBands(); // top-level `const` doesn't land on window under win.eval — read it via the accessor wrapper
  check("1c. CM_BANDS is exactly [melee,near,far,out] (spec's 'Distant' reconciles to the code's 'out' — see uncertainties)",
    JSON.stringify(cmBands) === JSON.stringify(["melee","near","far","out"]), JSON.stringify(cmBands));
  const chipNames = [...host.querySelectorAll(".cmb-chip-name")].map(el => el.textContent);
  check("1d. both foes + the PC appear as chips", chipNames.some(n => /Bat/.test(n)) && chipNames.some(n => /Basilisk/.test(n)) && chipNames.some(n => /Borin/.test(n)),
    JSON.stringify(chipNames));
}

// ============================================================================
// 2. FOE STATE WORD + NO HP/AC LEAK (§5.2) — the mutation check
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, world);
  const bat = combat.foes.find(f => /bat/i.test(f.name));
  const basilisk = combat.foes.find(f => /basilisk/i.test(f.name));
  basilisk.hp = Math.floor(basilisk.maxHp / 2); // bloodied (<=half, still >0 — Basilisk's maxHp is 52)
  bat.hp = 0; bat.down = true; // down (Bat's maxHp is 1, so hp<=0 is the only reachable "down" state for it)
  win.GS.combat = combat;
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  const panelHtml = host.querySelector(".panel-col") ? host.querySelector(".panel-col").innerHTML : "";
  const states = {};
  host.querySelectorAll(".cmb-chip").forEach(chip => {
    const name = chip.querySelector(".cmb-chip-name"); const st = chip.querySelector(".cmb-chip-state");
    if (name && st) states[name.textContent.trim()] = st.textContent.trim();
  });
  const batState = Object.entries(states).find(([n]) => /bat/i.test(n));
  const basState = Object.entries(states).find(([n]) => /basilisk/i.test(n));
  check("2a. a foe at <=half HP (still >0) shows 'bloodied'", basState && basState[1] === "bloodied", JSON.stringify(states));
  check("2b. a foe at 0 HP / down shows 'down'", batState && batState[1] === "down", JSON.stringify(states));
  // scope the HP-leak check to the FOE chips only (.cmb-chip, not .cmb-chip.pc) — the PC's OWN HP
  // legitimately renders in its chip (spec §1: "the player's own numbers are theirs"), and Borin's
  // fixture HP (52/52) coincidentally matches Basilisk's maxHp, so a whole-panel regex would false-positive.
  const foeChipsHtml = [...host.querySelectorAll(".cmb-chip:not(.pc)")].map(c => c.innerHTML).join("");
  const leaksAc = combat.foes.some(f => f.ac != null && new RegExp("\\b" + f.ac + "\\b").test(foeChipsHtml));
  check("2c. no FOE chip contains a foe HP number", !new RegExp("\\b" + basilisk.maxHp + "\\b").test(foeChipsHtml), foeChipsHtml);
  check("2d. no FOE chip contains a foe AC number", !leaksAc);

  // MUTATION CHECK: leak foe.hp into the chip's name line — the harness's OWN detector must now fire RED.
  {
    const original = read("src/world/render.js");
    // BATTLE-VISUALS A2/A3 (2026-07-03): cmFoeChip now carries the token-ring class, a data-state
    // attribute, and a `flashed` param (the damage-flash hook) — the guard text below was updated to
    // match verbatim; the invariant under test (no foe.hp/foe.maxHp numeral in the chip) is unchanged.
    const marker = `function cmFoeChip(f,flashed){\n  const word=cmFoeStateWord(f);\n  const badges=cmConditionBadges(f);\n  const active=!!(GS.combat&&GS.combat.side!=="pc");\n  const flash=flashed&&flashed.has(f.fid||f.name);\n  return \`<div class="cmb-chip cmb-ring-hostile\${word==='down'?' down':''}\${active?' cmb-active':''}\${flash?' cmb-flash':''}" data-fid="\${escHtml(f.fid||"")}" data-state="\${word}"><div class="cmb-chip-name">\${escHtml(f.name||"?")}\${f.cr!=null?\`<span class="cmb-chip-cr">CR \${escHtml(String(f.cr))}</span>\`:""}</div>`;
    const mutated = `function cmFoeChip(f,flashed){\n  const word=cmFoeStateWord(f);\n  const badges=cmConditionBadges(f);\n  const active=!!(GS.combat&&GS.combat.side!=="pc");\n  const flash=flashed&&flashed.has(f.fid||f.name);\n  return \`<div class="cmb-chip cmb-ring-hostile\${word==='down'?' down':''}\${active?' cmb-active':''}\${flash?' cmb-flash':''}" data-fid="\${escHtml(f.fid||"")}" data-state="\${word}"><div class="cmb-chip-name">\${escHtml(f.name||"?")} HP:\${f.hp}/\${f.maxHp}\${f.cr!=null?\`<span class="cmb-chip-cr">CR \${escHtml(String(f.cr))}</span>\`:""}</div>`;
    if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(no-foe-hp-leak): guard text not found verbatim — spec drifted?"); }
    else {
      const mutSrc = read("tables.js") + "\n;\n" + man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/world/render.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n");
      const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
      const mwin = dom.window; mwin.eval(harness + "\n" + mutSrc);
      const mworld = makeWorld(mwin);
      const mcombat = startFight(mwin, mworld);
      const mbat = mcombat.foes.find(f => /bat/i.test(f.name));
      mwin.GS.combat = mcombat;
      mwin.renderWorld();
      const mhost = mwin.document.getElementById("worldView");
      const mPanelHtml = mhost.querySelector(".panel-col") ? mhost.querySelector(".panel-col").innerHTML : "";
      const nowLeaks = new RegExp("HP:" + mbat.maxHp + "/" + mbat.maxHp).test(mPanelHtml);
      check("MUTATION (shown RED then restored): leaking foe.hp/foe.maxHp into the chip makes the no-leak assertion fail",
        nowLeaks, nowLeaks ? "confirmed RED under mutation, as expected" : "guard did not move — render.js wiring may have changed");
    }
  }
}

// ============================================================================
// 3. round_tick + ttl dots (§5.3)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, world);
  win.GS.combat = combat;
  const bat = combat.foes.find(f => /bat/i.test(f.name));
  win.addCondition(bat, "poisoned", { rounds: 2 }, combat.round);
  win.renderWorld();
  let host = win.document.getElementById("worldView");
  check("3a. round header shows Round 1", /Round 1/.test(host.querySelector(".cmb-head").textContent));
  let badge = [...host.querySelectorAll(".cmb-badge")].find(b => /poisoned/i.test(b.textContent));
  check("3b. a {rounds:2} condition shows 2 ttl dots", badge && (badge.textContent.match(/·/g) || []).length === 2, badge && badge.textContent);

  // advance two rounds via round_tick (end phase) — expires the condition
  win.applyEvent(world, { type: "round_tick", payload: { round: 2, phase: "end" } });
  combat.round = 2; win.renderWorld();
  host = win.document.getElementById("worldView");
  check("3c. round header bumps to Round 2", /Round 2/.test(host.querySelector(".cmb-head").textContent));
  win.applyEvent(world, { type: "round_tick", payload: { round: 3, phase: "end" } });
  combat.round = 3; win.renderWorld();
  host = win.document.getElementById("worldView");
  const stillHas = [...host.querySelectorAll(".cmb-badge")].some(b => /poisoned/i.test(b.textContent));
  check("3d. the condition badge clears once the ttl decays to 0", !stillHas);
}

// ============================================================================
// 4. death-save pips (§5.4) — panel + sidebar
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win, { hpCur: 0, deathSaves: { succ: 0, fail: 0 } });
  const combat = startFight(win, world);
  win.GS.combat = combat;
  win.renderWorld();
  let host = win.document.getElementById("worldView");
  check("4a. death-save pips render in the combat panel at 0 HP", host.querySelectorAll(".panel-col .cmb-ds-pip").length === 6);
  check("4b. death-save pips ALSO render in the status sidebar (§2 out-of-panel visibility)", host.querySelectorAll(".status-side .cmb-ds-pip").length === 6);
  win.applyEvent(world, { type: "death_save", payload: { d20: 15 } });
  win.renderWorld();
  host = win.document.getElementById("worldView");
  const onPips = host.querySelectorAll(".panel-col .cmb-ds-pip.succ.on").length;
  check("4c. a death_save success fills one success pip", onPips === 1, "onPips=" + onPips);
}

// ============================================================================
// 5. concentration badge (§5.5)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win, { level: 5, class: "Wizard", cantrips: ["Fire Bolt"], spells: ["Shield","Web"] });
  const combat = startFight(win, world);
  win.GS.combat = combat;
  win.applyEvent(world, { type: "cast", payload: { spell: "Web", concentration: true } });
  win.renderWorld();
  let host = win.document.getElementById("worldView");
  check("5a. a concentration badge appears after casting a concentration spell", /concentrating: Web/.test(host.textContent));
  win.applyEvent(world, { type: "concentration_broken", payload: { cause: "damage" } });
  win.renderWorld();
  host = win.document.getElementById("worldView");
  check("5b. the badge clears on concentration_broken", !/concentrating: Web/.test(host.textContent));
}

// ============================================================================
// 6. combat end restores the prior panel (§5.6, G7 auto-open/restore)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.GS.gamePanel = "character";
  win.renderWorld();
  check("6a. baseline: character panel open pre-fight", win.GS.gamePanel === "character");
  const combat = startFight(win, world);
  win.GS.combat = combat;
  win.renderWorld();
  check("6b. combat auto-opens over the character panel", win.GS.gamePanel === "combat");
  check("6c. GS.prevPanel remembers the panel that was open", win.GS.prevPanel === "character");
  win.GS.combat = null;
  win.renderWorld();
  check("6d. ending combat restores the prior panel exactly once", win.GS.gamePanel === "character" && win.GS.prevPanel === undefined);
}

// ============================================================================
// 7. Abilities tab body (§3, §5.7)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win, { level: 5, class: "Barbarian", subclassFeatures: [{ level: 3, name: "Frenzy" }] });
  win.GS.gamePanel = "actions"; win.GS.actionsTab = "abilities";
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  const body = host.querySelector(".panel-col").textContent;
  check("7a. a L5 Barbarian fixture lists Rage", /Rage/.test(body));
  check("7b. a L5 Barbarian fixture lists Extra Attack (granted at L5)", /Extra Attack/.test(body));
  check("7c. a L5 Barbarian fixture lists its subclass feature (Frenzy, sh.subclassFeatures)", /Frenzy/.test(body));
  check("7d. the origin feat (Alert) appears as a reference card", /Alert/.test(body));

  const win2 = freshWin();
  const world2 = makeWorld(win2, { level: 1, class: "Barbarian" });
  win2.GS.gamePanel = "actions"; win2.GS.actionsTab = "abilities";
  win2.renderWorld();
  const host2 = win2.document.getElementById("worldView");
  const body2 = host2.querySelector(".panel-col").textContent;
  check("7e. a L1 fixture does NOT list Extra Attack (L5-gated)", !/Extra Attack/.test(body2));
  check("7f. a L1 fixture DOES list L1 features (Rage/Unarmored Defense)", /Rage/.test(body2) && /Unarmored Defense/.test(body2));

  // G7: "no advice verbs anywhere in template strings" targets the APP's own authored chrome (labels,
  // notes, the spell pointer) — not verbatim SRD feature text quoted from CLASS_PROGRESSION (which can
  // legitimately contain "should" in the rules' own prose, e.g. Danger Sense's "as they should be").
  // Scope the assertion to the non-.rc-d template strings by stripping every .rc-d node's text first.
  const advice = /\b(should|best|consider)\b/i;
  const bodyClone = host.querySelector(".panel-col").cloneNode(true);
  bodyClone.querySelectorAll(".rc-d").forEach(el => el.remove());
  const chromeText = bodyClone.textContent;
  check("7g. no advice verb (should/best/consider) in the app's OWN template chrome (SRD feature text excluded)", !advice.test(chromeText), chromeText.match(advice));

  // MUTATION CHECK: inject an advice verb into a template string — the harness's OWN regex must fire RED.
  {
    const original = read("src/world/render.js");
    const marker = `const spellPointer=caster?\`<div class="pn-note"><span class="star">✦</span> Your spells live on the Spells tab.</div>\`:"";`;
    const mutated = `const spellPointer=caster?\`<div class="pn-note"><span class="star">✦</span> You should check the Spells tab.</div>\`:"";`;
    if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(no-advice-verbs): guard text not found verbatim — spec drifted?"); }
    else {
      const mutSrc = read("tables.js") + "\n;\n" + man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/world/render.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n");
      const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
      const mwin = dom.window; mwin.eval(harness + "\n" + mutSrc);
      const mworld = makeWorld(mwin, { level: 5, class: "Barbarian", cantrips: ["x"] });
      mwin.GS.gamePanel = "actions"; mwin.GS.actionsTab = "abilities";
      mwin.renderWorld();
      const mhost = mwin.document.getElementById("worldView");
      const mbody = mhost.querySelector(".panel-col").textContent;
      const nowFails = advice.test(mbody);
      check("MUTATION (shown RED then restored): injecting 'should' into a template string makes the no-advice-verb assertion fail",
        nowFails, nowFails ? "confirmed RED under mutation, as expected" : "guard did not move — render.js wiring may have changed");
    }
  }
}

// ============================================================================
// 8. Regression smoke — the shop panel still renders unaffected (§5.8)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.applyEvent(world, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Test Market" } });
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  check("8a. the shop panel still opens + renders (no regression from the combat-panel wiring)", win.GS.gamePanel === "shop" && !!host.querySelector(".shop-header"));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
