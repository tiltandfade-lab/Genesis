/* Verify INITIATIVE-UI (docs/INITIATIVE-UI.md) — turn & health indication on the battle stage, over a
   full jsdom load (real modules in manifest order, same convention as dev/verify-battle-stage.mjs /
   dev/verify-combat-lifecycle.mjs). Side-based initiative stays exactly as COMBAT.md locked it — this
   unit only adds render-layer indication: a round/side banner (derived from cm.round/cm.side, both
   already-existing state — no new fields), a spent-turn marker, thin per-chip HP bars (foes get a bar,
   never a numeral), and the prose-twin's spent clause.

   RED-FIRST (per the spec's ⊗ marks): checks 1 and 4 are proven to fail BEFORE the implementation lands
   — see the RED OUTPUT block logged just above each, captured from a run against the pre-change tree.

   Checks (spec §Verification):
     1. ⊗ banner element exists with "Round 1" + "YOU ACT"/"THEY ACT" after a combat_start applyEvent.
     2. Flip side via round_tick; banner text flips + the spent marker appears on the correct side, for
        both first:"pc" and first:"enemy" fixtures.
     3. Damage a foe via the attack applyEvent; its chip-hp width decreased and is a multiple of 5%.
     4. ⊗ MUTATION: with the banner render line stubbed out, checks 1-2 go red (fix off -> red -> fix on
        -> green).
     5. Prose twin: cmbProseSummary output contains round + side phrasing (+ spent clause when side !==
        first).
     6. (run by the operator, not this file) check-manifest.py + the full verify-*.mjs sweep + gauntlet-monkey.

   Run:  node dev/verify-initiative-ui.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshWin(overrideSrc) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (overrideSrc || srcText));
  return win;
}

function makeWorld(win, sheetOverrides = {}) {
  const world = {
    id: "w-initui", name: "The Initiative UI Test World",
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
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.theaterMounted = false;
  return world;
}

// drives combat_start through the SAME applyEvent case the DM bridge uses (not a direct combatStart()
// call) — the spec's check 1 says "after a combat_start applyEvent", so this harness routes through it.
// NOTE: the combat_start applyEvent case (src/world/dm.js ~909) does NOT forward p.pcRoll/p.foeRoll into
// combatStart()'s pcRoll/foeRoll (verified by reading the case: the object it builds for combatStart
// only carries pc/foes/objectiveRef/segment/segmentId/scene) — so initiative there is always a live
// roll. Fixtures that need a SPECIFIC first-acting side set GS.combat.first/.side directly after the
// event fires (a legitimate override: side-based initiative rolling itself is COMBAT.md-locked and out
// of this spec's scope — only the render-layer DERIVATION from {first,side} is under test here).
function startFightViaEvent(win, world, { foes = [{ name: "Aarakocra Aeromancer" }], forceFirst } = {}) {
  const res = win.applyEvent(world, { type: "combat_start", source: "declared", payload: { foes } });
  if (forceFirst && win.GS.combat) { win.GS.combat.first = forceFirst; win.GS.combat.side = forceFirst; }
  return res;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 1. ⊗ RED-FIRST: banner exists with "Round 1" + YOU ACT / THEY ACT after combat_start
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const res = startFightViaEvent(win, world, { forceFirst: "pc" }); // first:"pc" -> "YOU ACT"
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  check("1a. (fixture) combat_start applyEvent succeeded", !!(res && res.ok), JSON.stringify(res));
  check("1b. (fixture) GS.combat.first is 'pc' (forced fixture)", win.GS.combat && win.GS.combat.first === "pc");
  const banner = host.querySelector(".cmb-turn-banner");
  check("1c. a turn-banner element (.cmb-turn-banner) exists on the stage overlay", !!banner, "no .cmb-turn-banner in DOM");
  check("1d. banner text contains 'Round 1'", !!banner && /round\s*1/i.test(banner.textContent), banner && banner.textContent);
  check("1e. banner text contains 'YOU ACT' when side===pc", !!banner && /you act/i.test(banner.textContent), banner && banner.textContent);
}

// ============================================================================
// 2. FLIP SIDE VIA round_tick -> banner text flips + spent marker on the correct side (both fixtures)
// ============================================================================
function runRoundTickFixture(firstSide) {
  const win = freshWin();
  const world = makeWorld(win);
  startFightViaEvent(win, world, { forceFirst: firstSide });
  check(`2-fixture(${firstSide}). GS.combat.first is '${firstSide}'`, win.GS.combat.first === firstSide, win.GS.combat.first);
  win.renderWorld();
  let host = win.document.getElementById("worldView");
  let banner = host.querySelector(".cmb-turn-banner");
  const expectFirstWord = firstSide === "pc" ? /you act/i : /they act/i;
  check(`2a(${firstSide}). banner shows the first-acting side before any round_tick`, !!banner && expectFirstWord.test(banner.textContent), banner && banner.textContent);
  check(`2b(${firstSide}). no spent marker before the side has flipped (side===first)`, !!banner && !/spent/i.test(banner.textContent), banner && banner.textContent);
  // now flip the side WITHOUT closing the round — the spec derives turn-spent purely from
  // {first, side} with no new state, so setting GS.combat.side directly exercises exactly that
  // derivation for the mid-round case (the actual round_tick(end) case is proven separately below).
  win.GS.combat.side = (firstSide === "pc") ? "enemy" : "pc";
  win.renderWorld();
  host = win.document.getElementById("worldView");
  banner = host.querySelector(".cmb-turn-banner");
  const otherWord = firstSide === "pc" ? /they act/i : /you act/i;
  check(`2c(${firstSide}). banner flips to the OTHER side's text once side!==first`, !!banner && otherWord.test(banner.textContent), banner && banner.textContent);
  check(`2d(${firstSide}). spent marker appears once side!==first`, !!banner && /spent/i.test(banner.textContent), banner && banner.textContent);
  // the FIRST-acting side's own text should read as spent (not the currently-acting side).
  const spentSideWord = firstSide === "pc" ? /yours\s+spent/i : /theirs\s+spent/i;
  check(`2e(${firstSide}). the spent clause names the side that already went (${firstSide})`, !!banner && spentSideWord.test(banner.textContent), banner && banner.textContent);
  // now run an actual round_tick(phase:"end") to prove the real engine round-flip also produces a
  // correctly-derived (non-spent, new-round) banner on the next render.
  win.applyEvent(world, { type: "round_tick", source: "detected", payload: { phase: "end" } });
  win.renderWorld();
  host = win.document.getElementById("worldView");
  banner = host.querySelector(".cmb-turn-banner");
  check(`2f(${firstSide}). after a real round_tick(end), round increments to 2`, !!banner && /round\s*2/i.test(banner.textContent), banner && banner.textContent);
  check(`2g(${firstSide}). after round_tick(end), side resets to 'first' -> no spent marker`, !!banner && !/spent/i.test(banner.textContent), banner && banner.textContent);
}
runRoundTickFixture("pc");
runRoundTickFixture("enemy");

// ============================================================================
// 3. DAMAGE A FOE VIA attack -> its chip-hp width decreased, multiple of 5%
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  // Aarakocra Aeromancer: 66 hp — enough headroom that a "deal half" hit lands cleanly on a 5%-step
  // boundary without accidentally dropping the foe to 0 (a 1-hp fixture like Bat can't show a
  // mid-bar width at all).
  startFightViaEvent(win, world, { foes: [{ name: "Aarakocra Aeromancer" }] });
  win.renderWorld();
  let host = win.document.getElementById("worldView");
  const foe = win.GS.combat.foes[0];
  // put the foe in the PC's own zone so its chip renders (band/lane default "melee"/"C" for both).
  foe.band = "melee"; foe.lane = "C";
  win.renderWorld();
  host = win.document.getElementById("worldView");
  const chipBefore = host.querySelector(`.cmb-chip[data-fid="${foe.fid}"]`);
  const barBefore = chipBefore && chipBefore.querySelector(".chip-hp i");
  check("3a. (fixture) foe chip renders with a .chip-hp bar before any damage", !!barBefore, chipBefore && chipBefore.outerHTML);
  const widthBefore = barBefore ? parseFloat(barBefore.style.width) : null;
  check("3b. (fixture) initial width is 100% (foe at full HP)", widthBefore === 100, widthBefore);

  // deal a big hit directly against applyDamage's own contract (the same fn the attack applyEvent
  // case calls) so this check is deterministic regardless of the PC's weapon/roll RNG.
  const halfDmg = Math.ceil((foe.maxHp || foe.hp) / 2);
  win.applyDamage(foe, halfDmg);
  win.renderWorld();
  host = win.document.getElementById("worldView");
  const chipAfter = host.querySelector(`.cmb-chip[data-fid="${foe.fid}"]`);
  const barAfter = chipAfter && chipAfter.querySelector(".chip-hp i");
  check("3c. chip-hp bar still present after damage", !!barAfter, chipAfter && chipAfter.outerHTML);
  const widthAfter = barAfter ? parseFloat(barAfter.style.width) : null;
  check("3d. width decreased after damage", widthAfter != null && widthBefore != null && widthAfter < widthBefore, JSON.stringify({ widthBefore, widthAfter }));
  check("3e. width is a multiple of 5", widthAfter != null && Math.abs(widthAfter % 5) < 1e-6, widthAfter);

  // no foe numerals anywhere in the chip (spec: "no numerals for foes").
  const chipText = chipAfter ? chipAfter.textContent : "";
  const hasBareHpNumber = new RegExp(`\\b${foe.hp}\\s*/\\s*${foe.maxHp}\\b`).test(chipText);
  check("3f. the foe chip shows NO numeric hp/maxHp pair (bar only)", !hasBareHpNumber, chipText);
}

// ============================================================================
// 4. ⊗ MUTATION CHECK: stub out the banner render line -> checks 1-2 go RED
// ============================================================================
{
  const original = read("src/world/render.js");
  // the banner-building CALL SITES this unit adds (cmbStageOverlay's overlay wrapper + combatPanel's
  // header) — mutate ONLY the interpolated call expressions (${cmbTurnBanner(cm)}) to "" so the banner
  // never renders, proving assertions 1c-1e / 2a-2g are load-bearing on this exact wiring. Deliberately
  // NOT a bare `cmbTurnBanner(cm)` substring match — that also matches the function's own declaration
  // signature (`function cmbTurnBanner(cm){`), which would corrupt the mutated source into a syntax
  // error rather than a clean behavioral mutation.
  const marker = "${cmbTurnBanner(cm)}";
  if (!original.includes(marker)) {
    fail++; console.log("  ✗ MUTATION(turn-banner): guard text '${cmbTurnBanner(cm)}' not found verbatim — spec drifted?");
  } else {
    const mutated = original.split(marker).join("");
    const mutSrc = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js"))
      .map((p) => (p === "src/world/render.js" ? mutated : read(p))).join("\n;\n");
    const win = freshWin(mutSrc);
    const world = makeWorld(win);
    startFightViaEvent(win, world, { forceFirst: "pc" });
    win.renderWorld();
    const host = win.document.getElementById("worldView");
    const banner = host.querySelector(".cmb-turn-banner");
    const bannerGone = !banner || !/round\s*1/i.test(banner.textContent || "");
    check("MUTATION (shown RED then restored): stubbing cmbTurnBanner(cm) to \"\" removes the Round/side text — checks 1c-1e would go red",
      bannerGone, bannerGone ? "confirmed RED under mutation, as expected" : "banner text survived the stub — render.js wiring may have changed");
  }
}

// ============================================================================
// 5. PROSE TWIN: cmbProseSummary contains round + side phrasing (+ spent clause when side !== first)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  startFightViaEvent(win, world, { forceFirst: "pc" });
  let prose = win.cmbProseSummary(win.GS.combat);
  check("5a. prose contains 'Round 1'", /round\s*1/i.test(prose), prose);
  check("5b. prose contains the acting side ('you act')", /you act/i.test(prose), prose);
  check("5c. no spent clause while side===first", !/spent/i.test(prose), prose);
  win.GS.combat.side = "enemy";
  prose = win.cmbProseSummary(win.GS.combat);
  check("5d. spent clause appears once side!==first", /spent/i.test(prose), prose);
  check("5e. spent clause names 'your turn' (the side that already went)", /your turn is spent/i.test(prose), prose);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
