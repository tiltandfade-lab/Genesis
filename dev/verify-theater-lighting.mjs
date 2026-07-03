/* Verify BATTLE-THEATER LIGHTING (docs/BATTLE-THEATER.md follow-up, Adam 2026-07-03: "we need some
   in-game lighting on the board... some rooms as dark as the battlemap is now but others torchlight,
   lava light, glowing light, magic light, spell light... incredibly basic shadows to help the eye
   determine the exact location of things"). jsdom, full manifest load order (same convention as
   dev/verify-theater-data.mjs / dev/verify-walk-refresh.mjs) — no GL, no window.Theater; this harness
   only exercises the PURE data layer (theater-data.js's light table + the three walk-roller stamps +
   the dm.js digest additive lines). theater-boot.js's LIGHT_PROFILES/grounding-blob GL work is the
   browser-check gate (dev/theater-preview.html), not covered here.

   Red-first checks:
     1. every env in THEATER_LIGHT_TABLE (dungeon/urban/wilderness/breach) has a non-empty weighted
        profile table (walkWeighted-style parallel arrays, no env silently degrading to an empty pool).
     2. theaterRollLight is DETERMINISTIC: the same (env, seedKey) always returns the same profile
        across two independent calls (re-entering a room never flickers to a different light).
     3. two DIFFERENT seed keys against the same env are not universally identical (the roll actually
        varies — not a constant-function false positive on check 2).
     4. theaterLightOverrideFromText: a feature-text keyword (torch/lava/glow/etc.) overrides the
        rolled default; text with no keyword hit returns null (the roll wins).
     5. theaterBoardFrom exposes board.light = {profile,...} — both from a pre-stamped segment.light
        (the walk-roller's own stamp wins verbatim) and via its own fresh-roll fallback when a segment
        carries no light at all (an older snapshot / narrow harness).
     6. segment.light gets STAMPED at the roll seam in all three walkers: rollUrbanWalk, rollDungeonWalk,
        rollWildernessWalk — every segment (including finales/arrival) carries a `.light.profile` string.
     7. activeWalkDigest's "here" segment carries an additive `light` line; combatDigest carries an
        additive `light` line mid-fight (both null-safe when absent).
     8. MUTATION CHECK: neuter THEATER_LIGHT_TABLE's dungeon weights to all-zero -> theaterRollLightProfile
        must fall back to THEATER_DEFAULT_LIGHT rather than throwing/undefined — proving the total<=0
        guard is real, not vacuously true.

   Run:  node dev/verify-theater-lighting.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleTypedPaths = new Set(man.modules.filter(m => m.type === "module").map(m => m.path));
const moduleSrc = man.loadOrder
  .filter((p) => p.endsWith(".js") && !moduleTypedPaths.has(p))
  .map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
// THEATER_LIGHT_TABLE/THEATER_DEFAULT_LIGHT are top-level `const` — don't attach to jsdom's `window`
// under win.eval (only var/function do), same gotcha verify-theater-data.mjs documents.
const accessors = "function __theaterLightTable(){return THEATER_LIGHT_TABLE;} function __theaterDefaultLight(){return THEATER_DEFAULT_LIGHT;}";

function freshWin(overrideSrc){
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (overrideSrc || (read("tables.js") + "\n;\n" + moduleSrc)) + "\n;\n" + accessors);
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 1. every env has a non-empty weighted profile table
// ============================================================================
{
  const win = freshWin();
  const table = win.__theaterLightTable();
  ["dungeon", "urban", "wilderness", "breach"].forEach(env => {
    const t = table[env];
    check(`1. THEATER_LIGHT_TABLE.${env} has a non-empty weighted profile table`,
      !!t && Array.isArray(t.weights) && Array.isArray(t.profiles) && t.weights.length > 0 &&
      t.weights.length === t.profiles.length && t.weights.every(w => w > 0),
      JSON.stringify(t));
  });
}

// ============================================================================
// 2/3. determinism + variance
// ============================================================================
{
  const win = freshWin();
  const a1 = win.theaterRollLight("dungeon", "room-42", "");
  const a2 = win.theaterRollLight("dungeon", "room-42", "");
  check("2. theaterRollLight is deterministic for the same (env, seedKey)", a1.profile === a2.profile,
    `${a1.profile} vs ${a2.profile}`);

  const seeds = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
  const results = new Set(seeds.map(s => win.theaterRollLight("dungeon", s, "").profile));
  check("3. different seed keys against the same env are not ALL identical (the roll actually varies)",
    results.size > 1, JSON.stringify([...results]));
}

// ============================================================================
// 4. keyword override
// ============================================================================
{
  const win = freshWin();
  check("4a. a torch keyword overrides to torchlit", win.theaterLightOverrideFromText("a lit torch on the wall") === "torchlit");
  check("4b. a lava keyword overrides to lavalit", win.theaterLightOverrideFromText("the room fills with molten lava") === "lavalit");
  check("4c. no keyword hit returns null (roll wins)", win.theaterLightOverrideFromText("a dusty empty room") === null);
  const r = win.theaterRollLight("dungeon", "room-x", "torches line the walls");
  check("4d. theaterRollLight's own override wins over the roll", r.profile === "torchlit" && r.overridden === true, JSON.stringify(r));
}

// ============================================================================
// 5. theaterBoardFrom exposes board.light
// ============================================================================
{
  const win = freshWin();
  const stamped = { id: "seg-1", dims: "40' x 60'", light: { profile: "lavalit", rolled: "dark", overridden: true } };
  const boardStamped = win.theaterBoardFrom(stamped, {}, { env: "dungeon" });
  check("5a. a pre-stamped segment.light wins verbatim on board.light", boardStamped.light && boardStamped.light.profile === "lavalit",
    JSON.stringify(boardStamped.light));

  const unstamped = { id: "seg-2", dims: "40' x 60'" };
  const boardFresh = win.theaterBoardFrom(unstamped, {}, { env: "dungeon" });
  check("5b. an unstamped segment falls back to a fresh roll (board.light still a valid profile string)",
    boardFresh.light && typeof boardFresh.light.profile === "string" && boardFresh.light.profile.length > 0,
    JSON.stringify(boardFresh.light));
}

// ============================================================================
// 6. segment.light stamped by all three walkers
// ============================================================================
{
  const win = freshWin();
  const uw = win.rollUrbanWalk({ segCount: 5, tier: 1 });
  check("6a. rollUrbanWalk stamps light.profile on every segment", (uw.segments || []).every(s => s.light && typeof s.light.profile === "string"),
    JSON.stringify((uw.segments || []).map(s => s.light)));

  const dw = win.rollDungeonWalk({ segCount: 5, tier: 1 });
  check("6b. rollDungeonWalk stamps light.profile on every room (incl. finale)", (dw.segments || []).every(s => s.light && typeof s.light.profile === "string"),
    JSON.stringify((dw.segments || []).map(s => s.light)));

  const ww = win.rollWildernessWalk({ legCount: 4, tier: 1 });
  check("6c. rollWildernessWalk stamps light.profile on every leg + the arrival", (ww.segments || []).every(s => s.light && typeof s.light.profile === "string"),
    JSON.stringify((ww.segments || []).map(s => s.light)));

  // same segment id -> same light across two independent walk rolls' worth of re-derivation (theater-
  // data.js's fallback path, not the walker itself — the walker re-rolls fresh dice each call by design,
  // this just proves the UNDERLYING seed-based roll a re-entered room would get is stable).
  const relight1 = win.theaterRollLight("dungeon", dw.segments[0].id + ":light", "");
  const relight2 = win.theaterRollLight("dungeon", dw.segments[0].id + ":light", "");
  check("6d. re-deriving the same room's light (same seed key) reproduces identically", relight1.profile === relight2.profile,
    `${relight1.profile} vs ${relight2.profile}`);
}

// ============================================================================
// 7. digest lines
// ============================================================================
{
  const win = freshWin();
  const world = {
    id: "w1", name: "Test", seed: { master: { name: "T", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
      taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" } },
    characters: [], gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null, factions: [], pressures: [], revealed: {}, dmlog: [],
  };
  win.U.worlds[world.id] = world; win.U.activeWorldId = world.id;
  const originId = win.addNode(world, "Test Hold", "Setting");
  world.currentNodeId = originId; world.startNodeId = originId;

  const walk = win.rollDungeonWalk({ segCount: 3, tier: 1 });
  const nodeId = win.prepStartWalk ? null : null; // no-op guard; walkSetActive below is the real entry point
  win.prepOf(world).nodes = win.prepOf(world).nodes || {};
  win.prepOf(world).nodes["node-walk"] = { walk, cursor: { current: 1, touched: [1], done: false }, segments: null };
  win.walkSetActive(world, "node-walk");
  const digest = win.activeWalkDigest(world);
  const hereSeg = digest && (digest.segments || []).find(s => s.state === "here");
  check("7a. activeWalkDigest's here segment carries an additive light line", hereSeg && "light" in hereSeg && typeof hereSeg.light === "string",
    JSON.stringify(hereSeg));

  // combatDigest mid-fight
  win.GS = win.GS || {};
  win.GS.combat = { active: true, round: 1, side: "pc", first: "pc", pc: { band: "melee", lane: "C" }, foes: [],
    scene: {}, segment: { environment: "dungeon", light: { profile: "torchlit", overridden: false } } };
  const cd = win.combatDigest(world);
  check("7b. combatDigest carries an additive light line mid-fight", cd && cd.light === "torchlit", JSON.stringify(cd && cd.light));
  win.GS.combat = null;
}

// ============================================================================
// 8. MUTATION CHECK: an all-zero-weight env table must fall back cleanly, not throw
// ============================================================================
{
  const win = freshWin();
  const table = win.__theaterLightTable();
  const before = win.theaterRollLightProfile("dungeon", "seed-mut");
  check("8a. baseline: dungeon rolls a real profile pre-mutation", typeof before === "string" && before.length > 0, before);

  const src = (read("tables.js") + "\n;\n" + moduleSrc);
  const mutated = src.replace(
    /const THEATER_LIGHT_TABLE = \{[\s\S]*?\n\};/,
    `const THEATER_LIGHT_TABLE = { dungeon: { weights: [0,0,0], profiles: ["dark","torchlit","magic-glow"] } };`
  );
  check("8b. MUTATION applies cleanly (block replaced)", mutated !== src);
  const winMut = freshWin(mutated);
  let threw = false, result = null;
  try{ result = winMut.theaterRollLightProfile("dungeon", "seed-mut"); }catch(e){ threw = true; }
  check("8c. an all-zero-weight table falls back to THEATER_DEFAULT_LIGHT, never throws",
    !threw && result === winMut.__theaterDefaultLight(), `threw=${threw} result=${result}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
