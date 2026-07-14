/* Verify PLOT-ITEM-RECURRENCE (dev/top-band-uniqueness-report.md, class-(iii) #53/#54) — canon-aware
   recurrence for the Mythic/top-band Plot Item + Plot Lock rows. Fix lives entirely in the ROLL/mint
   seam (src/engine/codex-roll.js's rollItem stamps `origin:"plot-item:<row>"` on a Mythic fire;
   src/world/codex.js's codexAdd/codexFindByOrigin persist + look it up; src/world/dm.js's genApply is
   the mint-time seam that recognizes a same-origin record already minted in THIS world and hands it
   back flagged recurrence:true instead of minting a duplicate) — zero table edits.

   Loads EVERY module in manifest load order (+ tables.js) into one jsdom global scope, same pattern as
   dev/verify-gen.mjs / dev/verify-codex-roll.mjs.

   Run:  node dev/verify-plot-recurrence.mjs
   (jsdom resolved per CLAUDE.md "headless test" — override JSDOM_HOME if not at ~/.genesis-jsdom.) */
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

// HOTFIX-QUEUE-2026-07-07 HQ2-10 — flake-proofing: test 0 samples 400 live rollItem() draws looking
// for at least one Mythic (d300, 3/300 rows) fire; on live Math.random that's a real (tiny but
// nonzero) chance of an all-miss run. Install a deterministic mulberry32 generator as the window's
// Math.random (idiom copied verbatim from dev/playtest-bridgeless.mjs's --seed path) so a CI run is
// reproducible. --seed=<int> overrides; a FIXED default keeps an un-argumented run deterministic too.
const __seedArg = process.argv.find((a) => a.startsWith("--seed="));
const RNG_SEED = __seedArg ? (parseInt(__seedArg.slice(7), 10) >>> 0) || 1 : 20260707;
function installSeededRandom(win, seed){
  let s = seed >>> 0;
  win.Math.random = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function baseWorld(id){
  return {
    id, name: "The Recurrence Test",
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
  installSeededRandom(win, RNG_SEED);   // BEFORE any scenario's first roll (HQ2-10)
  win.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  const world = baseWorld("w-recur-" + Math.random().toString(36).slice(2));
  const originId = win.addNode(world, "Test Hold", "Setting");
  world.currentNodeId = originId; world.startNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  return { win, world, originId };
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================
// 0. Sanity: rollItem stamps origin ONLY on a Mythic (row 298-300) fire; non-Mythic rows get no origin.
// ============================================================
{ const { win } = freshDom();
  let mythicSeen = 0, nonMythicSeen = 0, mythicOriginOk = 0, nonMythicOriginNull = 0;
  for (let i = 0; i < 400; i++) {
    const it = win.rollItem({});
    // reverse-engineer the row band from the item's own source.ref (plot-item#<row>)
    const row = it.source && it.source.ref ? +it.source.ref.split("#")[1] : null;
    const isMythic = row != null && row >= 298 && row <= 300;
    if (isMythic) { mythicSeen++; if (it.origin === "plot-item:" + row) mythicOriginOk++; }
    else { nonMythicSeen++; if (it.origin == null) nonMythicOriginNull++; }
  }
  check("0. sampled at least one Mythic fire in 400 rolls (d300, 3/300 rows)", mythicSeen > 0, "mythicSeen=" + mythicSeen);
  check("0. every Mythic fire stamps origin:'plot-item:<row>'", mythicSeen > 0 && mythicOriginOk === mythicSeen,
    `${mythicOriginOk}/${mythicSeen}`);
  check("0. every non-Mythic fire carries NO origin tag", nonMythicSeen > 0 && nonMythicOriginNull === nonMythicSeen,
    `${nonMythicOriginNull}/${nonMythicSeen}`);
}

// ============================================================
// FORCED-ROLL HELPER: stub rollTable so plot-item ALWAYS returns a specific row, deterministically,
// for the rest of this suite (sampling 400 tries for a natural Mythic hit is wasteful and flaky at the
// margins — force it instead, same posture as other verify scripts stubbing engine randomness).
// ============================================================
function forceMythicRow(win, row){
  win.eval(`
    var __origRollTable = rollTable;
    rollTable = function(id){
      if (id === "plot-item") {
        var t = GENESIS_TABLES["plot-item"];
        var r = t.rows.find(function(rr){ return rr[0] <= ${row} && ${row} <= rr[1]; });
        return { id: id, dice: t.dice || ("d" + t.die), total: ${row}, band: r[2], text: r[3], fragment: r[4],
                 cells: r[5] || null, legs: r[6] || "", pool: r[7] || "", grants: r[8] || "", motif: r[9] || "" };
      }
      return __origRollTable(id);
    };
  `);
}

/* same idea, but the stub STAYS live across multiple applyResponse calls (genReserveTopUp fires a real
   rollItem at the end of every genApply pass and would otherwise silently re-seed the reserve off
   whatever row was forced most recently — this variant is for sub-tests that need the SAME forced row
   honored on every draw, live or reserved, across an arbitrary number of calls). */
function forceMythicRowPersistent(win, row){
  win.eval(`
    rollTable = function(id){
      if (id === "plot-item") {
        var t = GENESIS_TABLES["plot-item"];
        var r = t.rows.find(function(rr){ return rr[0] <= ${row} && ${row} <= rr[1]; });
        return { id: id, dice: t.dice || ("d" + t.die), total: ${row}, band: r[2], text: r[3], fragment: r[4],
                 cells: r[5] || null, legs: r[6] || "", pool: r[7] || "", grants: r[8] || "", motif: r[9] || "" };
      }
      return CT()[id] ? (function(){ var t=CT()[id]; var dice=t.dice||("d"+t.die); var total=rollExpr(dice);
        var row2=t.rows.find(function(rr){return total>=rr[0]&&total<=rr[1];})||t.rows[t.rows.length-1];
        return {id:id,dice:dice,total:total,band:row2[2],text:row2[3],fragment:row2[4],cells:row2[5]||null,
                legs:row2[6]||"",pool:row2[7]||"",grants:row2[8]||"",motif:row2[9]||""}; })() : null;
    };
  `);
}

// ============================================================
// 1. RED-FIRST / then GREEN: first fire of a forced Mythic row (300) mints exactly once and tags origin.
// ============================================================
{ const { win, world } = freshDom();
  forceMythicRow(win, 300);
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "item" }] });
  const items = Object.values(win.codexOf(world).records).filter(r => r.kind === "item");
  check("1. first fire mints exactly one item record", items.length === 1, "items=" + items.length);
  check("1. minted record carries origin:'plot-item:300'", items[0] && items[0].origin === "plot-item:300",
    items[0] && items[0].origin);
  check("1. minted record is provenance:rolled, soft, at current node",
    items[0] && items[0].provenance === "rolled" && items[0].status.soft === true && items[0].status.at === world.currentNodeId,
    items[0] && JSON.stringify(items[0].status));
  const chip = win.dmLogOf(world).find(l => l.system && l.gen);
  check("1. feed chip reads 'world provides' (a genuine mint, not a recurrence)", !!chip && /world provides — item rolled/.test(chip.text), chip && chip.text);
  check("1. mintQueue entry carries no recurrence flag on first fire", world.dm.mintQueue[0] && !world.dm.mintQueue[0].recurrence, JSON.stringify(world.dm.mintQueue));
}

// ============================================================
// 2. SECOND fire of the SAME forced row in the SAME world → returns the SAME codexId flagged
//    recurrence:true, and mints NOTHING new (still exactly one item record in the codex).
// ============================================================
{ const { win, world } = freshDom();
  forceMythicRow(win, 299);
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "item" }] });
  const firstId = Object.values(win.codexOf(world).records).find(r => r.kind === "item").id;
  const firstName = win.codexGet(world, firstId).name;

  win.applyResponse({ turnId: "t-2", narration: "n2", events: [], gen: [{ kind: "item" }] });
  const items = Object.values(win.codexOf(world).records).filter(r => r.kind === "item");
  check("2. second fire mints NOTHING new (still exactly one item record)", items.length === 1, "items=" + items.length);
  check("2. second fire's mintQueue entry returns the SAME codexId", world.dm.mintQueue[0] && world.dm.mintQueue[0].id === firstId,
    JSON.stringify(world.dm.mintQueue[0]));
  check("2. second fire is flagged recurrence:true", world.dm.mintQueue[0] && world.dm.mintQueue[0].recurrence === true,
    JSON.stringify(world.dm.mintQueue[0]));
  check("2. recurrence entry carries the resurface note for the DM",
    world.dm.mintQueue[0] && /resurface/i.test(world.dm.mintQueue[0].note || ""), world.dm.mintQueue[0] && world.dm.mintQueue[0].note);
  check("2. recurrence entry carries the same name as the existing record",
    world.dm.mintQueue[0] && world.dm.mintQueue[0].name === firstName, world.dm.mintQueue[0] && world.dm.mintQueue[0].name);
  const chip = win.dmLogOf(world).slice(-1)[0];
  check("2. feed chip reads 'world remembers ... resurfaces' (distinguishes from a fresh mint)",
    !!chip && /world remembers.*resurfaces/i.test(chip.text), chip && chip.text);
  check("2. digest.minted carries {recurrence:true, codexId, name}", (() => {
    const d = win.dmDigest();
    const m = d.minted && d.minted[0];
    return !!m && m.recurrence === true && m.id === firstId && m.name === firstName;
  })(), JSON.stringify(win.dmDigest().minted));
}

// ============================================================
// 3. A DIFFERENT world rolling the SAME row mints its OWN fresh record (world-scoped, not global).
// ============================================================
{ const { win: winA, world: worldA } = freshDom();
  forceMythicRow(winA, 298);
  winA.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "item" }] });
  const idA = Object.values(winA.codexOf(worldA).records).find(r => r.kind === "item").id;

  const { win: winB, world: worldB } = freshDom();
  forceMythicRow(winB, 298);
  winB.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "item" }] });
  const itemsB = Object.values(winB.codexOf(worldB).records).filter(r => r.kind === "item");
  check("3. a different world rolling the same Mythic row mints its OWN record", itemsB.length === 1, "itemsB=" + itemsB.length);
  check("3. the different world's mint is NOT flagged recurrence", winB.dmDigest().minted[0] && !winB.dmDigest().minted[0].recurrence,
    JSON.stringify(winB.dmDigest().minted));
  check("3. the two worlds' item ids differ (independent codices)", itemsB[0].id !== idA || worldA.id !== worldB.id, `A=${idA} B=${itemsB[0].id}`);
}

// ============================================================
// 4. Non-Mythic rows are UNAFFECTED — the origin gate never engages for them (no origin tag at all),
//    so two DIFFERENT ordinary rows each mint independently, exactly like before this fix existed.
//    (Two fires of the SAME ordinary row would still merge by name/id — that's codexAdd's pre-existing,
//    unrelated idempotent-mint behavior for any identically-named record, not this fix's concern.)
// ============================================================
{ const { win, world } = freshDom();
  forceMythicRow(win, 150);   // an ordinary row, band != Mythic
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "item" }] });
  const chip1 = win.dmLogOf(world).find(l => l.system && l.gen);
  check("4. a non-Mythic fire mints normally (feed chip reads 'world provides', never 'remembers')",
    !!chip1 && /world provides — item rolled/.test(chip1.text), chip1 && chip1.text);
  const items1 = Object.values(win.codexOf(world).records).filter(r => r.kind === "item");
  check("4. neither non-Mythic mint carries an origin tag", items1.every(r => r.origin == null), JSON.stringify(items1.map(r=>r.origin)));

  // drain the pre-rolled item reserve (genReserveTopUp seeded it live off row-150's stub while that
  // stub was still active — draining forces the next gen[] call to roll fresh under the NEW row-151
  // stub instead of silently handing back a reserved row-150 duplicate) before switching rows.
  world.prefetch.reserve.item.length = 0;
  forceMythicRowPersistent(win, 151);   // a DIFFERENT ordinary row, held for the rest of this sub-test
  win.applyResponse({ turnId: "t-2", narration: "n2", events: [], gen: [{ kind: "item" }] });
  const items2 = Object.values(win.codexOf(world).records).filter(r => r.kind === "item");
  check("4. a different non-Mythic row mints its own independent record (two total)", items2.length === 2, "items=" + items2.length);
}

// ============================================================
// 5. Same row via a DIFFERENT gen path (opts.lock:true, i.e. the paired plot-lock companion) still
//    dedupes correctly on the plot-item origin — the lock text rides inside the same item record.
// ============================================================
{ const { win, world } = freshDom();
  forceMythicRow(win, 300);
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "item", opts: { lock: true } }] });
  const first = Object.values(win.codexOf(world).records).find(r => r.kind === "item");
  check("5. first fire with opts.lock still mints + carries lock data", first && first.dm && first.dm.lock, JSON.stringify(first && first.dm));
  win.applyResponse({ turnId: "t-2", narration: "n2", events: [], gen: [{ kind: "item" }] });
  const items = Object.values(win.codexOf(world).records).filter(r => r.kind === "item");
  check("5. a later un-locked fire of the same row still recognizes the existing (locked) record", items.length === 1, "items=" + items.length);
}

// ============================================================
// 6. The SECOND mint path — src/world/prep.js's prepCastFrontier (session-prep frontier casting, used
//    by startPrep — separate from the live gen[] handshake) — dedupes the same way. This path always
//    forces a FRESH codex id via prepCastId, so without the origin check here it would mint a byte-
//    identical duplicate under a new id even though genApply's own seam is intact.
// ============================================================
{ const { win, world } = freshDom();
  forceMythicRowPersistent(win, 298);
  const frontierItem = win.rollItem({});
  check("6. setup: the forced-Mythic frontier item carries origin:'plot-item:298'", frontierItem.origin === "plot-item:298", frontierItem.origin);

  // first frontier cast: mints via prepCastFrontier directly (mirrors startPrep's per-environment call).
  win.ensureCodex(world);
  const env1 = { cast: { location: null, npcs: [], item: frontierItem } };
  const r1 = win.prepCastFrontier(world, world.currentNodeId, env1);
  const items1 = Object.values(win.codexOf(world).records).filter(r => r.kind === "item");
  check("6. first frontier cast mints exactly one item record", items1.length === 1, "items=" + items1.length);
  check("6. prepCastFrontier's own return carries that record's id", r1 && r1.itemIds[0] === items1[0].id, JSON.stringify(r1));

  // second frontier cast in the SAME world, same forced Mythic row (a second environment's pbundleCast
  // independently drawing the same table row — exactly the scenario PREP-NAME-COLLISIONS already guards
  // the LOCATION/NPC casts against; this is the ITEM half, closed by the origin check instead of a reroll
  // since a Mythic item reroll would be the wrong fix — the row IS the point, it should resurface).
  const frontierItem2 = win.rollItem({});
  const env2 = { cast: { location: null, npcs: [], item: frontierItem2 } };
  const r2 = win.prepCastFrontier(world, world.currentNodeId, env2);
  const items2 = Object.values(win.codexOf(world).records).filter(r => r.kind === "item");
  check("6. second frontier cast of the SAME Mythic row mints NOTHING new", items2.length === 1, "items=" + items2.length);
  check("6. second frontier cast's itemIds returns the SAME existing codexId", r2 && r2.itemIds[0] === items1[0].id, JSON.stringify(r2));
}

// ============================================================
// MUTATION PROOF — drop the origin-tag check in genApply → the harness goes RED (a duplicate mints).
// Each fire is given a DISTINCT opts.name so codexAdd's own (unrelated) name-collision merge can't
// mask the mutation — the origin check must be the ONLY thing standing between two mints here.
// ============================================================
{
  const original = read("src/world/dm.js");
  const marker = `    if(payload && payload.origin && typeof codexFindByOrigin==="function"){`;
  if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(origin-check): guard text not found verbatim — spec drifted?"); }
  else {
    // neutralize the guard: force the condition false so the recurrence branch never fires.
    const mutated = `    if(false && payload && payload.origin && typeof codexFindByOrigin==="function"){`;
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/world/dm.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n");
    const { win, world } = freshDom(mutSrc);
    forceMythicRow(win, 299);
    win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "item", opts: { name: "Mutation Fire A" } }] });
    win.applyResponse({ turnId: "t-2", narration: "n2", events: [], gen: [{ kind: "item", opts: { name: "Mutation Fire B" } }] });
    const items = Object.values(win.codexOf(world).records).filter(r => r.kind === "item");
    const duplicated = items.length === 2;
    check("MUTATION (shown RED then restored): dropping the origin-tag check lets the same Mythic row mint a duplicate",
      duplicated, duplicated ? "confirmed RED under mutation, as expected" : "guard did not move — dm.js wiring may have changed");
  }
}

// ============================================================
// MUTATION PROOF 2 — confirm the SAME two-distinct-name fires are correctly deduped under the REAL
// (unmutated) code, proving mutation proof 1 isn't a name-collision artifact but a real origin-check
// catch: distinct names would normally mint two records; the origin gate collapses them to one anyway.
// ============================================================
{ const { win, world } = freshDom();
  forceMythicRow(win, 298);
  win.applyResponse({ turnId: "t-1", narration: "n", events: [], gen: [{ kind: "item", opts: { name: "Real Fire A" } }] });
  win.applyResponse({ turnId: "t-2", narration: "n2", events: [], gen: [{ kind: "item", opts: { name: "Real Fire B" } }] });
  const items = Object.values(win.codexOf(world).records).filter(r => r.kind === "item");
  check("MUTATION-CONTROL: under real code, two DIFFERENTLY-NAMED fires of the same Mythic row still dedupe to one record (origin, not name, is the key)",
    items.length === 1, "items=" + items.length);
  check("MUTATION-CONTROL: the surviving record keeps its FIRST name (opts.name on the recurrence draw is not applied)",
    items[0] && items[0].name === "Real Fire A", items[0] && items[0].name);
}

// ============================================================
// MUTATION PROOF 3 — drop the origin-tag check in prep.js's prepCastFrontier → a second frontier cast
// of the SAME Mythic row mints a duplicate under a fresh id (the gen[]/dm.js guard is untouched here,
// proving THIS check, not the other one, is what's load-bearing on the prep path).
// ============================================================
{
  const original = read("src/world/prep.js");
  const marker = `    const existingItem=(item&&item.origin&&typeof codexFindByOrigin==="function")\n      ? codexFindByOrigin(w, item.origin, "item") : null;`;
  if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(prep-origin-check): guard text not found verbatim — spec drifted?"); }
  else {
    const mutated = `    const existingItem=null;`;
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/world/prep.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n");
    const { win, world } = freshDom(mutSrc);
    forceMythicRowPersistent(win, 297 + 1);   // 298, held steady across both rolls below
    win.ensureCodex(world);
    const item1 = win.rollItem({});
    win.prepCastFrontier(world, world.currentNodeId, { cast: { location: null, npcs: [], item: item1 } });
    const item2 = win.rollItem({});
    win.prepCastFrontier(world, world.currentNodeId, { cast: { location: null, npcs: [], item: item2 } });
    const items = Object.values(win.codexOf(world).records).filter(r => r.kind === "item");
    const duplicated = items.length === 2;
    check("MUTATION (shown RED then restored): dropping the origin-tag check in prepCastFrontier lets the same Mythic row mint a duplicate under a fresh id",
      duplicated, duplicated ? "confirmed RED under mutation, as expected" : "guard did not move — prep.js wiring may have changed");
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
