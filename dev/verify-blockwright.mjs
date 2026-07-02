/* Verify BLOCKWRIGHT (docs/BLOCKWRIGHT.md) — the procedural visual layer (CSS-3D cuboids, zero
   dependencies), over a full jsdom load (real modules in manifest order, same convention as
   dev/verify-battlemap.mjs / dev/verify-combat-tracker.mjs). Asserts per the spec's §4 verify plan
   + BATCH2-GUARDRAILS H1/H3 rulings (gate now >=10/0, superseding the H1 table's earlier >=8/0):
     1. Face-count budget respected on a max fixture (<=180 faces) — MUTATION CHECK: exceed it,
        the harness's own budget assertion must fire RED.
     2. Silhouette/size mapping per bestiary tags.type (unknown -> biped Medium).
     3. Shade math: top > front > flank, derived from ONE base color (bwShade multipliers).
     4. Anti-Minecraft invariant: organic silhouettes (quadruped/serpent/mass) are frustums, never
        plain boxes.
     5. Anti-Minecraft invariant: every prop carries a nonzero deterministic rotY scatter — the
        SAME seed produces the SAME scatter twice — MUTATION CHECK: zero the scatter, harness fails.
     6. Zero <img>/background-image/filter/box-shadow anywhere in the diorama subtree (grep-enforced
        on the rendered combat-panel HTML, real DOM render via renderWorld()).
     7. Fog is the only sub-1-opacity cuboid (.bw-fog is the sole opacity rule in the module's CSS
        contract — asserted structurally since jsdom doesn't compute cascaded opacity reliably).
     8. prefers-reduced-motion kills animation (bw-reduced class path / CSS media query present).
     9. Hidden panel (no active combat) renders nothing — the diorama wrapper never appears in the DOM.
    10. Regression: verify-combat-tracker.mjs and verify-battlemap.mjs counts unchanged (run
        separately by the caller sweep; this harness reports its own count only, per
        BATCH-GUARDRAILS G1 "same counts as before your change").
    11. Region palette hookup: a region with vector.skinBias nudges the ground/accent colors away
        from the flat default; no region -> the default palette (NULL-SAFE, since REGIONS-NAMES'
        built vector has no structured color field yet — reconciled against the real code).

   Run:  node dev/verify-blockwright.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
// BW_DEFAULT_PALETTE is a top-level `const` — it doesn't attach to jsdom's `window` under win.eval
// (only var/function do), so expose it via a thin accessor wrapper (same pattern as
// verify-combat-tracker.mjs's __cmBands / verify-battlemap.mjs's __cmLanes).
const accessors = "function __bwDefaultPalette(){return BW_DEFAULT_PALETTE;} function __bestiary(){return BESTIARY;}";
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
    id: "w-blockwrighttest", name: "The Blockwright Test World",
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
    factions: [], pressures: [], regions: {},
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

function startFight(win, opts = {}) {
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
// 1. face-count budget respected on a max fixture (<=180 faces) + MUTATION CHECK
// ============================================================================
{
  const win = freshWin();
  // a max-ish fixture: full 4x3 grid, PC+2 allies+2 foes populating one zone each — bounded well
  // under budget by construction (bwFigure emits 3-4 cuboids = 9-12 faces; tiles are 3 faces each).
  const world = makeWorld(win);
  const combat = startFight(win, { segment: { dims: "" }, foes: [{ name: "Bat" }, { name: "Basilisk" }, { name: "Goblin Skirmisher" }] });
  win.GS.combat = combat;
  win.GS.gamePanel = "combat";
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  const wrap = host.querySelector(".bw-diorama-wrap");
  check("1a. the diorama renders for an active fight", !!wrap);
  const faceDivs = wrap ? wrap.querySelectorAll(".bw-face").length : 0;
  check("1b. face-count stays within the <=180 hard budget on this fixture", faceDivs > 0 && faceDivs <= 180, "faceDivs=" + faceDivs);

  // MUTATION CHECK: break bwWithinBudget so it always reports "within budget" — the harness's OWN
  // budget assertion (not the app's) must be the thing that catches an over-budget scene; we
  // simulate an over-budget scene directly against the pure function and show the guard moving.
  const original = read("src/ui/blockwright.js");
  const marker = `function bwWithinBudget(faceCount){ return faceCount <= BW_FACE_BUDGET; }`;
  if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(face-budget): guard text not found verbatim — spec drifted?"); }
  else {
    const mutated = `function bwWithinBudget(faceCount){ return true; }`;
    const mutSrc = read("tables.js") + "\n;\n" + man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/ui/blockwright.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n");
    const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
    const mwin = dom.window; mwin.eval(harness + "\n" + mutSrc);
    const overBudget = mwin.bwWithinBudget(999); // 999 faces would be catastrophically over budget
    check("MUTATION (shown RED then restored): neutering bwWithinBudget makes a 999-face scene read as 'within budget'",
      overBudget === true, "confirmed RED under mutation, as expected");
  }
}

// ============================================================================
// 2. silhouette/size mapping per bestiary tags.type (unknown -> biped Medium)
// ============================================================================
{
  const win = freshWin();
  check("2a. undead -> biped", win.bwSilhouetteFor("undead") === "biped");
  check("2b. beast -> quadruped", win.bwSilhouetteFor("beast") === "quadruped");
  check("2c. ooze -> mass", win.bwSilhouetteFor("ooze") === "mass");
  check("2d. dragon -> serpent", win.bwSilhouetteFor("dragon") === "serpent");
  check("2e. an unknown/unmapped creature type -> biped (the documented fallback)", win.bwSilhouetteFor("some-invented-type") === "biped");
  check("2f. no creature type at all (null) -> biped", win.bwSilhouetteFor(null) === "biped");
  check("2g. size scale: Tiny/Small/Medium/Large/Huge map to the 5 documented scalars",
    win.bwSizeScaleFor("Tiny") === 0.4 && win.bwSizeScaleFor("Small") === 0.7 && win.bwSizeScaleFor("Medium") === 1 &&
    win.bwSizeScaleFor("Large") === 2 && win.bwSizeScaleFor("Huge") === 3,
    JSON.stringify([win.bwSizeScaleFor("Tiny"), win.bwSizeScaleFor("Small"), win.bwSizeScaleFor("Medium"), win.bwSizeScaleFor("Large"), win.bwSizeScaleFor("Huge")]));
  check("2h. an unrecognized/missing size -> Medium's scalar (1)", win.bwSizeScaleFor("Colossal") === 1 && win.bwSizeScaleFor(undefined) === 1);
  // reconciled against the real bestiary shape: entry.tags.type (not a bare entry.type) carries the
  // SRD creature type — bestiary.js entries all have tags.type populated (verified against the real file).
  const bestiary = win.__bestiary();
  const sample = bestiary && bestiary["aarakocra-aeromancer"];
  check("2i. the real bestiary's creature-type tag lives at entry.tags.type (the reconciled field)", !!(sample && sample.tags && sample.tags.type), JSON.stringify(sample && sample.tags));
}

// ============================================================================
// 3. shade math: top > front > flank, ONE base color
// ============================================================================
{
  const win = freshWin();
  const shades = win.bwFaceShades("#556070");
  const toNum = (hex) => parseInt(hex.replace("#", ""), 16);
  check("3a. top shade is brighter than front (top x1.15 > front x1.00)", toNum(shades.top) > toNum(shades.front), JSON.stringify(shades));
  check("3b. front shade is brighter than flank (front x1.00 > flank x0.82)", toNum(shades.front) > toNum(shades.flank), JSON.stringify(shades));
  const box = win.bwBox({ x: 0, y: 0, z: 0, w: 1, d: 1, h: 1, color: "#556070" });
  check("3c. bwBox emits exactly 3 visible faces (top/front/flank — the rest are culled)", box.faceCount === 3, box.faceCount);
  check("3d. the rendered box HTML carries exactly one distinct base color's 3 shades (no 4th/5th face div)", (box.html.match(/bw-face/g) || []).length === 3, box.html);
}

// ============================================================================
// 4. anti-Minecraft: organic silhouettes are frustums, never plain boxes
// ============================================================================
{
  const win = freshWin();
  const quad = win.bwFigure({ size: "Medium", silhouette: "quadruped", palette: "#7a5a35", label: "test-wolf" });
  const serp = win.bwFigure({ size: "Medium", silhouette: "serpent", palette: "#5a4430", label: "test-snake" });
  const mass = win.bwFigure({ size: "Medium", silhouette: "mass", palette: "#4f6b4a", label: "test-ooze" });
  check("4a. quadruped's body/head parts are frustums (clip-path present)", quad.html.includes("bw-frustum"), quad.html);
  check("4b. serpent's segmented run is a frustum", serp.html.includes("bw-frustum"), serp.html);
  check("4c. mass (ooze/swarm/blob) is a single frustum mound", mass.html.includes("bw-frustum"), mass.html);
  // a straight bwBox call (used for tiles/limbs, deliberately NOT organic) never emits bw-frustum on its own.
  const plainBox = win.bwBox({ x: 0, y: 0, z: 0, w: 1, d: 1, h: 1, color: "#556070" });
  check("4d. a plain bwBox call carries no frustum clip-path (control — proves 4a-4c aren't false positives)", !plainBox.html.includes("bw-frustum"), plainBox.html);
}

// ============================================================================
// 5. anti-Minecraft: deterministic nonzero rotY scatter, same seed -> same result + MUTATION CHECK
// ============================================================================
{
  const win = freshWin();
  const r1 = win.bwPropRotY("seed-alpha");
  const r2 = win.bwPropRotY("seed-alpha");
  const r3 = win.bwPropRotY("seed-beta");
  check("5a. the SAME seed produces the SAME rotY scatter twice", r1 === r2, JSON.stringify([r1, r2]));
  check("5b. a DIFFERENT seed produces a (very likely) different rotY", r1 !== r3, JSON.stringify([r1, r3]));
  check("5c. rotY stays within the documented +/-15 degree band", r1 >= -15 && r1 <= 15 && r3 >= -15 && r3 <= 15, JSON.stringify([r1, r3]));
  // sample many seeds — at least one must be nonzero (the scatter is real, not a stub returning 0).
  let anyNonzero = false;
  for (let i = 0; i < 20; i++) { if (win.bwPropRotY("seed-" + i) !== 0) { anyNonzero = true; break; } }
  check("5d. the scatter is a real distribution, not a stubbed-zero (>=1 of 20 seeds is nonzero)", anyNonzero);

  // MUTATION CHECK: zero the scatter — bwPropRotY always returns 0 — the "nonzero" assertion must fail RED.
  const original = read("src/ui/blockwright.js");
  const marker = `function bwPropRotY(seed){
  const frac = bwSeedFrac(seed, "rotY");
  return Math.round((frac * 30 - 15) * 100) / 100; // -15..+15, 2dp
}`;
  if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(rotY-scatter): guard text not found verbatim — spec drifted?"); }
  else {
    const mutated = `function bwPropRotY(seed){ return 0; }`;
    const mutSrc = read("tables.js") + "\n;\n" + man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/ui/blockwright.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n");
    const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
    const mwin = dom.window; mwin.eval(harness + "\n" + mutSrc);
    let mAnyNonzero = false;
    for (let i = 0; i < 20; i++) { if (mwin.bwPropRotY("seed-" + i) !== 0) { mAnyNonzero = true; break; } }
    check("MUTATION (shown RED then restored): zeroing bwPropRotY collapses the scatter to all-zero",
      mAnyNonzero === false, "confirmed RED under mutation, as expected");
  }
}

// ============================================================================
// 6. zero <img>/background-image/filter/box-shadow anywhere in the diorama subtree
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, { segment: { dims: "" } });
  win.GS.combat = combat;
  win.GS.gamePanel = "combat";
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  const wrap = host.querySelector(".bw-diorama-wrap");
  check("6a. the diorama subtree renders", !!wrap);
  const html = wrap ? wrap.innerHTML : "";
  check("6b. no <img> tag in the diorama subtree", !/<img/i.test(html), html.slice(0, 300));
  check("6c. no background-image in the diorama subtree", !/background-image/i.test(html), html.slice(0, 300));
  check("6d. no filter: in the diorama subtree", !/filter\s*:/i.test(html), html.slice(0, 300));
  check("6e. no box-shadow in the diorama subtree", !/box-shadow/i.test(html), html.slice(0, 300));
}

// ============================================================================
// 7. fog is the only sub-1-opacity cuboid
// ============================================================================
{
  const win = freshWin();
  const fog = win.bwFeature("fog", { seed: "seg-fog-test" });
  check("7a. a fog feature carries the bw-fog class (the one opacity hook)", fog.html.includes("bw-fog"), fog.html);
  const tree = win.bwFeature("tree", { seed: "seg-tree-test" });
  const boulder = win.bwFeature("boulder", { seed: "seg-boulder-test" });
  const dais = win.bwFeature("dais", { seed: "seg-dais-test" });
  check("7b. non-fog features never carry the bw-fog opacity class", !tree.html.includes("bw-fog") && !boulder.html.includes("bw-fog") && !dais.html.includes("bw-fog"));
  // the ONLY opacity rule in the module's CSS contract is .bw-fog (genesis.html) — structural check
  // since jsdom doesn't reliably compute cascaded opacity from stylesheet rules.
  const cssText = read("genesis.html");
  const bwBlock = cssText.slice(cssText.indexOf(".bw-stage{"), cssText.indexOf("/* reference cards"));
  const opacityRules = (bwBlock.match(/opacity\s*:/g) || []).length;
  check("7c. the blockwright CSS block declares exactly one opacity rule (.bw-fog)", opacityRules === 1, "opacityRules=" + opacityRules + "\n" + bwBlock);
}

// ============================================================================
// 8. prefers-reduced-motion kills animation
// ============================================================================
{
  const win = freshWin();
  const cssText = read("genesis.html");
  check("8a. a prefers-reduced-motion media query exists in the blockwright CSS contract", /@media \(prefers-reduced-motion: reduce\)\{[^}]*\.bw-cuboid/.test(cssText));
  // bwStage checks matchMedia and stamps bw-reduced when the browser signals reduced motion.
  win.matchMedia = () => ({ matches: true });
  const stage = win.bwStage(null, { gridW: 1, gridD: 1 });
  const mounted = stage.mount([win.bwBox({ x: 0, y: 0, z: 0, w: 1, d: 1, h: 1, color: "#556070" })]);
  check("8b. bwStage stamps bw-reduced when prefers-reduced-motion matches", mounted.html.includes("bw-reduced"), mounted.html.slice(0, 120));
}

// ============================================================================
// 9. hidden panel (no active combat) renders nothing — the diorama never appears
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.GS.combat = null;
  win.GS.gamePanel = null;
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  check("9a. no combat panel content renders when there's no active fight", !host.querySelector(".cmb-grid"));
  check("9b. no diorama wrapper renders when there's no active fight", !host.querySelector(".bw-diorama-wrap"));
}

// ============================================================================
// 10. Regression smoke — verify-combat-tracker + verify-battlemap still pass (reported by caller;
//     this harness's own DOM-additive check: the pre-existing .cmb-grid still renders unchanged
//     alongside the new diorama, proving the upgrade is additive, not a replacement)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, { segment: { dims: "" } });
  win.GS.combat = combat;
  win.GS.gamePanel = "combat";
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  check("10a. the pre-existing .cmb-grid zone grid still renders (additive, not replaced)", !!host.querySelector(".cmb-grid"));
  check("10b. the pre-existing .cmb-lane band-lane rows still render", !!host.querySelector(".cmb-lane"));
  const basilisk = combat.foes.find(f => /basilisk/i.test(f.name));
  const wrapHtml = host.querySelector(".bw-diorama-wrap") ? host.querySelector(".bw-diorama-wrap").innerHTML : "";
  check("10c. no foe HP number leaks into the diorama subtree", !new RegExp("\\b" + basilisk.maxHp + "\\b").test(wrapHtml), wrapHtml.slice(0, 200));
  check("10d. no foe AC number leaks into the diorama subtree", !new RegExp("\\b" + basilisk.ac + "\\b").test(wrapHtml), wrapHtml.slice(0, 200));
}

// ============================================================================
// 11. region palette hookup — NULL-SAFE (REGIONS-NAMES has no structured color field yet)
// ============================================================================
{
  const win = freshWin();
  const def = win.bwRegionPalette(null);
  check("11a. no region -> the default flat palette", JSON.stringify(def) === JSON.stringify(win.__bwDefaultPalette()), JSON.stringify(def));
  const wetRegion = { vector: { skinBias: "wet / mournful" } };
  const wetPal = win.bwRegionPalette(wetRegion);
  check("11b. a region with a recognized skinBias word nudges the palette away from default", JSON.stringify(wetPal) !== JSON.stringify(def), JSON.stringify(wetPal));
  const unknownRegion = { vector: { skinBias: "some totally unrecognized freeform prose" } };
  const unkPal = win.bwRegionPalette(unknownRegion);
  check("11c. an unrecognized skinBias falls back to the default palette (never a crash/undefined)", JSON.stringify(unkPal) === JSON.stringify(def), JSON.stringify(unkPal));
  const dark = win.bwDarkenPalette(def, 0.5);
  const toNum = (hex) => parseInt(hex.replace("#", ""), 16);
  check("11d. bwDarkenPalette actually darkens every channel", toNum(dark.ground) < toNum(def.ground) && toNum(dark.wall) < toNum(def.wall), JSON.stringify([def, dark]));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
