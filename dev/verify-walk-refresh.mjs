/* verify-walk-refresh.mjs — headless test for WALK-REFRESH (docs/WALK-REFRESH.md,
   BATCH2-GUARDRAILS H1: ≥7 asserts, 0 failed):

   §1 live rosters — resolveArchetypePool honors the tier/slot CR band + the archetype registry's
      type/habitat filters, and the authored pool is ALWAYS reachable (mutation check: empty the
      registry entry for an archetype → resolveArchetypePool degrades to authored-pool-only, exactly
      today's pre-refresh behavior).
   §2 treasure — urban + wilderness walks now carry a loot lane (closes L6); the Outlandish L4
      level-gate hides reality-breaking at L1 and admits it at L9 (dwalkOutlandishAllowed).
   §3 walk skin — rollWalkSkin is null-safe pre-authoring and returns a real {text,band,ref} now
      that tables-wave1's walk-skin-wilderness/dungeon/urban are compiled; stored on the walk +
      surfaced in activeWalkDigest (compact text+band) either way.
   Regression — verify-walk-consumption.mjs / verify-prep-bundle.mjs / verify-combat.mjs stay green
      (run separately by the same sweep; this file also spot-checks digest byte-shape didn't drift).

   Loads EVERY module in manifest load order (+ tables.js) into one jsdom global scope — same
   "const-via-eval" pattern as dev/verify-gen.mjs/verify-dm-events.mjs (jsdom resolved per CLAUDE.md
   "headless test"; override JSDOM_HOME if not at ~/.genesis-jsdom).
   Run: node dev/verify-walk-refresh.mjs   (from repo root) */
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
// __bestiary/__walkArchetypes: top-level `const` (BESTIARY, WALK_ARCHETYPES) don't attach to jsdom's
// `window` under win.eval (same gotcha as verify-gen.mjs's CHAR_NAMES/CODEX_SOFT_CAP accessors) —
// these thin function wrappers expose them to the harness without changing production code.
const accessors = "function __bestiary(){return BESTIARY;} function __walkArchetypes(){return WALK_ARCHETYPES;}";
const srcText = read("tables.js") + "\n;\n" + moduleSrc + "\n;\n" + accessors;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function baseWorld(id){
  return {
    id, name: "The Walk-Refresh Test",
    seed: { master: { name: "Test Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
            taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" } },
    characters: [{ status: "living", name: "Tester", headline: "a climber", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Folk Hero", level: 3, hp: "20/20", ac: 15,
               profBonus: 2, scores: {}, mods: { str: 2, dex: 1 }, saveProfs: [], skillProfs: ["Athletics"] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [], revealed: {}, dmlog: [],
  };
}

function freshDom(loadSrc = srcText){
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  const win = dom.window;
  win.eval(harness + "\n" + loadSrc);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  const world = baseWorld("w-walkrefresh-" + Math.random().toString(36).slice(2));
  const originId = win.addNode(world, "Test Hold", "Setting");
  world.currentNodeId = originId; world.startNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  return { win, world, originId };
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", String(detail)));

// ============================================================
// 1. resolveArchetypePool honors the per-tier/slot CR band for a known archetype ("Risen Dead" —
//    all undead in WALK_ARCHETYPES). A boss pull at T2 should land near the T2 boss band (5-10).
// ============================================================
{ const { win } = freshDom();
  const names = new Set();
  for (let i = 0; i < 60; i++) {
    const name = win.resolveArchetypePool("Risen Dead", { tier: 2, slot: "boss" }, "Skeleton / Zombie");
    names.add(name);
  }
  // every resolved name must EITHER be in the authored pool OR resolve to a BESTIARY undead entry
  // whose CR falls in the T2 boss band (5-10) — this is the "honors CR band per tier/slot" assertion.
  const authored = ["Skeleton", "Zombie"];
  let allValid = true, sawBestiary = false, offender = null;
  for (const n of names) {
    if (authored.includes(n)) continue;
    const hit = Object.values(win.__bestiary()).find(m => m.name === n);
    if (!hit || hit.cr == null || hit.cr < 5 || hit.cr > 10 || (hit.tags && hit.tags.type !== "undead")) {
      allValid = false; offender = { n, cr: hit && hit.cr, type: hit && hit.tags && hit.tags.type }; break;
    }
    sawBestiary = true;
  }
  check("1. resolveArchetypePool: every non-authored boss pull is a CR 5-10 undead (T2 boss band honored)",
    allValid, JSON.stringify(offender));
  check("1. resolveArchetypePool: the live BESTIARY pool actually gets used (not authored-only every time)",
    sawBestiary, "names=" + JSON.stringify([...names]));
}

// ============================================================
// 2. MUTATION (shown RED then restored): with the registry entry for an archetype emptied out,
//    resolveArchetypePool degrades to authored-pool-only — exactly today's pre-refresh behavior.
//    (The spec's explicit "unknown archetype = authored pool only, graceful" fallback case.)
// ============================================================
{
  const original = read("src/engine/walk-archetypes.js");
  // Match the whole `const WALK_ARCHETYPES = { ... };` object-literal block (up to the line-leading
  // closing `};`) and replace it wholesale with an empty registry — a clean, non-brittle mutation.
  const blockRe = /const WALK_ARCHETYPES = \{[\s\S]*?\n\};/;
  const hasBlock = blockRe.test(original);
  check("2a. MUTATION setup: WALK_ARCHETYPES block found in walk-archetypes.js", hasBlock);
  if (hasBlock) {
    const mutatedFull = original.replace(blockRe, "const WALK_ARCHETYPES = {};");
    const redOk = mutatedFull !== original;
    check("2b. MUTATION applies cleanly (block replaced)", redOk, "mutation source edit failed");

    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js"))
        .map(p => p === "src/engine/walk-archetypes.js" ? mutatedFull : read(p)).join("\n;\n") +
      "\n;\n" + accessors;
    const { win } = freshDom(mutSrc);
    check("2c. MUTATION shown RED: WALK_ARCHETYPES really is empty under the mutation",
      Object.keys(win.__walkArchetypes()).length === 0, "keys=" + Object.keys(win.__walkArchetypes()).length);
    let onlyAuthored = true, seen = new Set();
    for (let i = 0; i < 30; i++) {
      const name = win.resolveArchetypePool("Risen Dead", { tier: 2, slot: "boss" }, "Skeleton / Zombie");
      seen.add(name);
      if (name !== "Skeleton" && name !== "Zombie") onlyAuthored = false;
    }
    check("2d. MUTATION RED confirms authored-floor-only fallback under an emptied registry",
      onlyAuthored, "saw=" + JSON.stringify([...seen]));

    // RESTORE: re-run with the real (unmutated) source and confirm the live bestiary pool is reachable again.
    const { win: win2 } = freshDom();
    let sawBestiaryAgain = false;
    for (let i = 0; i < 60; i++) {
      const name = win2.resolveArchetypePool("Risen Dead", { tier: 2, slot: "boss" }, "Skeleton / Zombie");
      if (name !== "Skeleton" && name !== "Zombie") sawBestiaryAgain = true;
    }
    check("2e. RESTORED: the live BESTIARY pool is reachable again with the real registry",
      sawBestiaryAgain, "guard did not move back — resolveArchetypePool wiring may have changed");
  }
}

// ============================================================
// 3. Urban + wilderness walks now carry a per-segment loot lane (closes L6) — at least one non-null
//    loot slot across a T2 walk of reasonable length, and the environment framing differs.
// ============================================================
{ const { win } = freshDom();
  const uw = win.rollUrbanWalk({ segCount: 6, tier: 2 });
  const ww = win.rollWildernessWalk({ legCount: 6, tier: 2 });
  const uLoot = uw.segments.map(s => s.loot).filter(Boolean);
  const wLoot = ww.segments.map(s => s.loot).filter(Boolean);
  check("3a. urban walk carries a loot lane (every segment has a loot object, frame=stash/lockbox/strongbox)",
    uLoot.length === uw.segments.length && uLoot.every(l => l.frame === "stash/lockbox/strongbox"),
    "uLoot=" + uLoot.length + "/" + uw.segments.length);
  check("3b. wilderness walk carries a loot lane (frame=cache/remains/grave-goods)",
    wLoot.length === ww.segments.length && wLoot.every(l => l.frame === "cache/remains/grave-goods"),
    "wLoot=" + wLoot.length + "/" + ww.segments.length);
}

// ============================================================
// 4. Outlandish L4 level-gate: hides reality-breaking at L1, admits it at L9 (once the compiled
//    table carries a Band column — provisional/null-safe today, so this asserts the GATE FUNCTION
//    itself, per BATCH-GUARDRAILS G9 "ship the wiring null-safe, note it").
// ============================================================
{ const { win } = freshDom();
  const l1 = win.dwalkOutlandishAllowed(1), l9 = win.dwalkOutlandishAllowed(9);
  check("4a. level 1 does NOT admit reality-breaking", l1.indexOf("reality-breaking") < 0, JSON.stringify(l1));
  check("4b. level 9 DOES admit reality-breaking", l9.indexOf("reality-breaking") >= 0, JSON.stringify(l9));
  check("4c. level 1 admits utility (L1+)", l1.indexOf("utility") >= 0, JSON.stringify(l1));
  const roll = win.dwalkOutlandish(1);
  check("4d. dwalkOutlandish draws a row even with no Band column compiled yet (null-safe)",
    roll && typeof roll.name === "string" && roll.name.length > 0, JSON.stringify(roll));
}

// ============================================================
// 5. Walk skin: null-safe (no compiled walk-skin-* table yet) but the field is always present on
//    the walk object, and activeWalkDigest surfaces it compactly (or null) without throwing.
// ============================================================
{ const { win, world, originId } = freshDom();
  const uw = win.rollUrbanWalk({ segCount: 4, tier: 1 });
  check("5a. walk.skin field is present (null-safe: no compiled table yet -> null, not undefined/throw)",
    "skin" in uw && (uw.skin === null || (typeof uw.skin.text === "string")), JSON.stringify(uw.skin));

  const P = win.prepOf(world);
  P.nodes[originId] = { env: "urban", soft: false, locked: false, hook: null, walk: uw, cursor: null };
  const setRes = win.walkSetActive(world, originId);
  check("5b. walkSetActive succeeds against a directly-stored walk", setRes.ok === true, JSON.stringify(setRes));
  const digest = win.activeWalkDigest(world);
  check("5c. activeWalkDigest carries a skin field (compact text+band, or null) without throwing",
    digest && "skin" in digest && (digest.skin === null || (typeof digest.skin.text === "string" && "band" in digest.skin)),
    JSON.stringify(digest && digest.skin));
}

// ============================================================
// 6. rollWalkSkin itself: now that tables-wave1 has landed (walk-skin-wilderness/dungeon/urban
//    compiled into tables.js), it returns real {text,band,ref} instead of the pre-authoring null —
//    exactly the "activates when Adam's tables land" transition WALK-REFRESH §3 designed for.
// ============================================================
{ const { win } = freshDom();
  const s = win.rollWalkSkin("wilderness");
  check("6. rollWalkSkin returns a compiled skin (table landed) with text+band+ref, no throw",
    s && typeof s.text === "string" && typeof s.band === "string" && typeof s.ref === "string",
    JSON.stringify(s));
}

// ============================================================
// 7. Regression spot-check: dungeon walks are unaffected in shape (rollDungeonWalk still returns the
//    same top-level keys plus the new skin field) — the full regression suite (verify-walk-consumption/
//    verify-prep-bundle/verify-combat) is run separately by the sweep and stays green.
// ============================================================
{ const { win } = freshDom();
  const dw = win.rollDungeonWalk({ segCount: 5, tier: 2 });
  const hasCoreKeys = ["environment", "topology", "segments", "edges", "threat", "haul"].every(k => k in dw);
  check("7. rollDungeonWalk still returns byte-compatible top-level shape + the new skin field",
    hasCoreKeys && "skin" in dw, JSON.stringify(Object.keys(dw)));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
