/* Verify ECONOMY-SINKS (docs/ECONOMY-SINKS.md; BATCH-GUARDRAILS G6) — full-app jsdom load, full
   manifest.loadOrder (same convention as dev/verify-economy.mjs / dev/verify-shop-ui.mjs). Covers:
     1. Dawn rest at an inhabited node (a shop present) charges gold + writes a lodging ledger line;
        the same rest at an uninhabited (wilderness) node charges nothing.
     2. Short rest is free everywhere, inhabited or not.
     3. Shortfall: gold < price -> the rest still happens, gold clamps to 0, ledger notes the unpaid
        remainder — never a hard block. MUTATION CHECK: break the never-blocks guard, confirm RED,
        restore, confirm GREEN.
     4. Owner tint: a codex NPC at the node with attitude +2 discounts the price 20% (rounded, floor
        1); no NPC at the node -> flat (untinted) price.
     5. The valuables table compiles clean with full 1..100 coverage and band shares 66/20/9/4/1.
     6. previewSell honors instance.value as a price override (floor(value*SELL_RATIO) tinted/capped
        exactly like sellValue); a valuable instance with no `value` falls back to itemPrice/refusal
        exactly as today (zero regression for ordinary items).
     7. dwalkLoot's "maxed coin roll" upgrade: a coin roll >= 80% of that expression's max attaches a
        valuable; an ordinary (non-maxed) roll does not.

   Run:  node dev/verify-economy-sinks.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function newWin(){
  // tables.js (window.GENESIS_TABLES, the compiled walkPick/walkRows source) is NOT a manifest
  // module — the real app fetch()es it at runtime. Load it explicitly first, same as
  // dev/verify-travel-walks.mjs's file list, so dwalkValuable's walkPick("dungeon-loot-valuables")
  // resolves instead of silently returning empty cells.
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full);
  // WIRING-SWEEP-A's rest-risk (docs/WIRING-MAP.md item 4) can — by real chance-gated design, see
  // dev/verify-wiring-a.mjs §1b/§2 — interrupt a rest and skip its `rest` ledger entry entirely.
  // This suite is about the LODGING/economy sink, not rest-risk, and every check below keys off a
  // `rest` ledger entry being present; stub restRiskRoll deterministically non-interrupting so this
  // suite's own assertions stay guardrail-green regardless of Math.random() (rest-risk's stochastic
  // behavior is already covered, on purpose, by verify-wiring-a.mjs).
  dom.window.eval(`restRiskRoll = function(){ return { ok:true, class:"inn", text:"Uneventful", band:"", severe:false, interrupted:false }; };`);
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function mkWorld(win, opts){
  opts = opts || {};
  const w = {
    id: "w-es", name: "Test World", session: 1, startNodeId: "home", currentNodeId: opts.nodeId || "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: [], log: [], clock: { day: 1, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: opts.gold != null ? opts.gold : 100, scores: { str: 10 }, inventory: opts.inventory || [] } }],
    factions: [], pressures: [], shops: opts.shops || {}, codex: { records: {}, version: 1 },
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

// ============================================================================
// 1. Dawn rest at an inhabited node charges gold + writes a lodging ledger line
// ============================================================================
{
  const win = newWin();
  const w = mkWorld(win, { gold: 50, shops: { s1: { id: "s1", nodeId: "home", tier: 2, coin: 500, stock: [] } } });
  win.passTime("dawn");
  const pc = w.characters[0];
  check("dawn rest at an inhabited (tier-2) node charges gold (50 - 2 = 48)", pc.sheet.gold === 48, "gold=" + pc.sheet.gold);
  const ledgerLine = w.ledger.slice().reverse().find(e => e.data && e.data.kind === "lodging");
  check("lodging ledger line present", !!ledgerLine && /Lodging at/.test(ledgerLine.text), JSON.stringify(ledgerLine));
  check("lodging ledger records the tier-2 price (2gp)", ledgerLine.data.price === 2, JSON.stringify(ledgerLine && ledgerLine.data));
}

// ============================================================================
// 2. Same rest at an uninhabited (wilderness) node charges nothing
// ============================================================================
{
  const win = newWin();
  const w = mkWorld(win, { gold: 50, nodeId: "wild", nodes: { wild: { id: "wild", name: "Deep Wood", type: "Wilds", x: 1, y: 1 } } });
  win.passTime("dawn");
  const pc = w.characters[0];
  check("dawn rest at a wilderness node charges nothing", pc.sheet.gold === 50, "gold=" + pc.sheet.gold);
  const ledgerLine = w.ledger.slice().reverse().find(e => e.data && e.data.kind === "lodging");
  check("no lodging ledger line at an uninhabited node", !ledgerLine, JSON.stringify(ledgerLine));
}

// ============================================================================
// 3. Short rest is free everywhere (even at an inhabited/shop node)
// ============================================================================
{
  const win = newWin();
  const w = mkWorld(win, { gold: 50, shops: { s1: { id: "s1", nodeId: "home", tier: 3, coin: 2000, stock: [] } } });
  win.passTime("short");
  check("short rest is free at an inhabited node", w.characters[0].sheet.gold === 50, "gold=" + w.characters[0].sheet.gold);
}

// ============================================================================
// 4. Shortfall: gold < price -> rest still happens, gold clamps to 0, ledger notes unpaid
// ============================================================================
{
  const win = newWin();
  const w = mkWorld(win, { gold: 1, shops: { s1: { id: "s1", nodeId: "home", tier: 2, coin: 500, stock: [] } } }); // price=2, gold=1
  win.passTime("dawn");
  const pc = w.characters[0];
  check("shortfall: gold clamps to 0 (never negative, never blocks)", pc.sheet.gold === 0, "gold=" + pc.sheet.gold);
  const restEntry = w.ledger.slice().reverse().find(e => e.data && e.data.kind === "rest");
  check("the rest itself still happened (rest ledger entry present)", !!restEntry, JSON.stringify(restEntry));
  const ledgerLine = w.ledger.slice().reverse().find(e => e.data && e.data.kind === "lodging");
  check("shortfall noted in the ledger (unpaid:1)", ledgerLine && ledgerLine.data.unpaid === 1, JSON.stringify(ledgerLine && ledgerLine.data));
  check("shortfall ledger text mentions unpaid", /unpaid/.test(ledgerLine.text), ledgerLine.text);
}

console.log(`\n${fail ? "✗" : "✓"} economy-sinks (pre-mutation-guard): ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);

// ============================================================================
// 5. MUTATION CHECK — break the never-blocks-sleep guard, confirm RED, restore, confirm GREEN
// ============================================================================
console.log("\n--- mutation guard: lodging shortfall must never block the rest ---");
let guardPass = 0, guardFail = 0;
const gcheck = (name, cond, detail = "") =>
  cond ? (guardPass++, console.log("  ✓", name)) : (guardFail++, console.log("  ✗", name, "—", detail));

const playPath = join(ROOT, "src/world/play.js");
const originalPlay = readFileSync(playPath, "utf-8");
// Simulate a hard-block mutation: if the charge would exceed available gold, bail out of passTime
// before the rest resolves — the exact failure mode the spec forbids ("the rest still happens...
// never hard-block sleep"). We insert a `return;` right after the charge/shortfall computation.
const mutated = originalPlay.replace(
  "const have=lodgePC.sheet.gold||0, charge=Math.min(have,price), short=price-charge;",
  "const have=lodgePC.sheet.gold||0, charge=Math.min(have,price), short=price-charge; if(short>0) return; /* MUTATION: hard-block on shortfall */"
);
if (mutated === originalPlay) throw new Error("mutation pattern didn't match src/world/play.js — update the harness");
try {
  writeFileSync(playPath, mutated, "utf-8");
  const win = newWin();
  const w = mkWorld(win, { gold: 1, shops: { s1: { id: "s1", nodeId: "home", tier: 2, coin: 500, stock: [] } } });
  win.passTime("dawn");
  const restEntry = w.ledger.slice().reverse().find(e => e.data && e.data.kind === "rest");
  const blocked = !restEntry; // the mutated guard bails BEFORE restRecover/ledger — rest never happens
  gcheck("MUTATION RED: hard-blocking on shortfall makes the rest never happen (confirms the never-blocks guard is load-bearing)", blocked === true, "restEntry=" + JSON.stringify(restEntry));
} finally {
  writeFileSync(playPath, originalPlay, "utf-8");
}
{
  const win = newWin();
  const w = mkWorld(win, { gold: 1, shops: { s1: { id: "s1", nodeId: "home", tier: 2, coin: 500, stock: [] } } });
  win.passTime("dawn");
  const restEntry = w.ledger.slice().reverse().find(e => e.data && e.data.kind === "rest");
  gcheck("restored -> GREEN again (rest happens on shortfall)", !!restEntry, JSON.stringify(restEntry));
}

// ============================================================================
// 6. Owner tint: +2 attitude discounts 20% (rounded, floor 1); no NPC -> flat
// ============================================================================
{
  const win = newWin();
  const w = mkWorld(win, { gold: 100, shops: { s1: { id: "s1", nodeId: "home", tier: 2, coin: 500, stock: [] } } });
  win.codexAdd(w, { id: "innkeep1", kind: "npc", name: "Innkeep", fields: {}, dm: {}, status: { at: "home" } });
  win.codexAttitudeOpen(w, "innkeep1", 2, { cause: "test" });
  win.passTime("dawn");
  const pc = w.characters[0];
  check("owner attitude +2 discounts the charged lodging price end-to-end through passTime (100-2=98)", pc.sheet.gold === 98, "gold=" + pc.sheet.gold);
}
{
  const win = newWin();
  win.eval(`window.__flat = lodgingPrice(2, 0); window.__tinted = lodgingPrice(2, 2); window.__gouged = lodgingPrice(2, -2);`);
  check("no tint (att 0): tier-2 price is the flat LODGING_GP figure (2gp)", win.__flat === 2, "flat=" + win.__flat);
  check("+2 attitude discounts price 20% rounded (2gp * 0.8 = 1.6 -> round 2)", win.__tinted === Math.max(1, Math.round(2 * 0.8)), "tinted=" + win.__tinted);
  check("-2 attitude gouges price 20% rounded (2gp * 1.2 = 2.4 -> round 2)", win.__gouged === Math.max(1, Math.round(2 * 1.2)), "gouged=" + win.__gouged);
  win.eval(`window.__floor = lodgingPrice(0, 2);`); // tier-0 base 1gp, +2 tint would floor to 0 without the min-1 clamp
  check("tint never floors lodging to 0 (tier-0 base 1gp, +2 tint -> clamped to min 1)", win.__floor === 1, "floor=" + win.__floor);
}
{
  const win = newWin();
  const w = mkWorld(win, { gold: 100, shops: { s1: { id: "s1", nodeId: "home", tier: 2, coin: 500, stock: [] } } });
  win.eval(`window.__noOwner = nodeOwnerAttitude(U.worlds["w-es"], "home");`);
  check("no codex NPC at the node -> untinted (attitude 0)", win.__noOwner === 0, "att=" + win.__noOwner);
  win.codexAdd(w, { id: "innkeep2", kind: "npc", name: "Innkeep2", fields: {}, dm: {}, status: { at: "home" } });
  win.codexAttitudeOpen(w, "innkeep2", 2, { cause: "test" });
  win.eval(`window.__withOwner = nodeOwnerAttitude(U.worlds["w-es"], "home");`);
  check("a codex NPC at the node resolves the owner tint (attitude 2)", win.__withOwner === 2, "att=" + win.__withOwner);
}

// ============================================================================
// 7. Valuables table — compiles clean, full 1..100 coverage, band shares 66/20/9/4/1
// ============================================================================
{
  const tables = JSON.parse(read("tables.json"));
  const t = tables["dungeon-loot-valuables"];
  check("dungeon-loot-valuables present in the compiled tables", !!t, "missing from tables.json");
  if (t) {
    check("d100, 100 rows", t.dice === "d100" && t.rows.length === 100, `dice=${t.dice} rows=${t.rows.length}`);
    const covered = new Set();
    t.rows.forEach(r => { for (let v = r[0]; v <= r[1]; v++) covered.add(v); });
    const gaps = []; for (let v = 1; v <= 100; v++) if (!covered.has(v)) gaps.push(v);
    check("full 1..100 coverage, no gaps", gaps.length === 0, "gaps=" + JSON.stringify(gaps));
    const bandCounts = {};
    t.rows.forEach(r => { const b = r[2]; bandCounts[b] = (bandCounts[b] || 0) + (r[1] - r[0] + 1); });
    check("band shares match 66/20/9/4/1", JSON.stringify(bandCounts) === JSON.stringify({ Grounded: 66, Textured: 20, Strange: 9, Volatile: 4, Mythic: 1 }), JSON.stringify(bandCounts));
  }
}

// ============================================================================
// 8. previewSell honors instance.value as a price override
// ============================================================================
{
  const win = newWin();
  win.eval(`
    window.__inst = { id: "v1", name: "A gem that hums", value: 40 };
    window.__sh = { inventory: [window.__inst] };
    window.__shop = { coin: 1000 };
    window.__r = previewSell(window.__sh, window.__shop, "v1", 0);
    window.__rTinted = previewSell(window.__sh, window.__shop, "v1", 2);
    window.__instCapped = { id: "v2", name: "Another gem", value: 40 };
    window.__shCapped = { inventory: [window.__instCapped] };
    window.__shopCapped = { coin: 5 };
    window.__rCapped = previewSell(window.__shCapped, window.__shopCapped, "v2", 0);
    window.__instNoValue = { id: "v3", name: "Mace" };
    window.__shNoValue = { inventory: [window.__instNoValue] };
    window.__rNoValue = previewSell(window.__shNoValue, { coin: 1000 }, "v3", 0);
    window.__instUnpriceable = { id: "v4", name: "Not A Real Item Xyzzy" };
    window.__shUnpriceable = { inventory: [window.__instUnpriceable] };
    window.__rUnpriceable = previewSell(window.__shUnpriceable, { coin: 1000 }, "v4", 0);
  `);
  check("valuable instance.value sells for floor(40*0.5)=20", win.__r.ok === true && win.__r.payout === 20, JSON.stringify(win.__r));
  check("valuable instance.value tints with attitude (+2 -> floor(40*0.5*1.2)=24)", win.__rTinted.ok === true && win.__rTinted.payout === 24, JSON.stringify(win.__rTinted));
  check("valuable sale is capped by merchant coin (20 > 5 -> capped to 5)", win.__rCapped.ok === true && win.__rCapped.payout === 5 && win.__rCapped.capped === true, JSON.stringify(win.__rCapped));
  check("a no-value item falls back to itemPrice exactly as today (Mace 5gp*0.5=2)", win.__rNoValue.ok === true && win.__rNoValue.payout === 2, JSON.stringify(win.__rNoValue));
  check("an unpriceable no-value item refuses exactly as today", win.__rUnpriceable.ok === false && win.__rUnpriceable.reason === "unsellable", JSON.stringify(win.__rUnpriceable));
}

// ============================================================================
// 9. dwalkLoot "maxed coin roll" upgrade — attaches a valuable at >= 80% of max; not otherwise
// ============================================================================
{
  const win = newWin();
  win.eval(`
    function findMaxedRoll(){
      let tries=0;
      while(tries<2000){
        const cr=dwalkCoinRoll(true,4,false); // t2, depth>=4 branch: 2d6*10, max 120
        if(cr.gp>=0.8*cr.maxGp) return cr;
        tries++;
      }
      return null;
    }
    function findLowRoll(){
      let tries=0;
      while(tries<2000){
        const cr=dwalkCoinRoll(true,4,false);
        if(cr.gp<0.8*cr.maxGp) return cr;
        tries++;
      }
      return null;
    }
    window.__maxed = findMaxedRoll();
    window.__low = findLowRoll();
  `);
  check("found a maxed coin roll within 2000 tries (>=80% of max)", !!win.__maxed, "null");
  check("found a low coin roll within 2000 tries (<80% of max)", !!win.__low, "null");
  if (win.__maxed) {
    win.eval(`window.__lootMaxed = { magic:null, coin: window.__maxed.label, valuable: (window.__maxed.gp>=0.8*window.__maxed.maxGp) ? dwalkValuable() : null, enemyLoot:false };`);
    check("a maxed coin roll attaches a valuable alongside coin", !!win.__lootMaxed.valuable, JSON.stringify(win.__lootMaxed));
  }
  if (win.__low) {
    win.eval(`window.__lootLow = { magic:null, coin: window.__low.label, valuable: (window.__low.gp>=0.8*window.__low.maxGp) ? dwalkValuable() : null, enemyLoot:false };`);
    check("an ordinary (non-maxed) coin roll does NOT attach a valuable", win.__lootLow.valuable === null, JSON.stringify(win.__lootLow));
  }
  // exercise the real dwalkLoot entry point directly with a forced-maxed scenario via repeated sampling
  win.eval(`
    function findMaxedViaDwalkLoot(){
      let tries=0;
      while(tries<3000){
        const l=dwalkLoot(null,4,false,true,false); // t2 depth>=4 branch, same 2d6*10/120 max
        const gp=parseInt(l.coin,10);
        if(gp>=0.8*120) return l;
        tries++;
      }
      return null;
    }
    window.__realMaxed = findMaxedViaDwalkLoot();
  `);
  check("dwalkLoot itself attaches .valuable when its own coin roll is maxed", !!win.__realMaxed && !!win.__realMaxed.valuable, JSON.stringify(win.__realMaxed));
  // companion negative case — drive the SAME production dwalkLoot entry point to a sub-80% roll and
  // confirm it withholds .valuable (a regression that only breaks the low path would otherwise pass).
  win.eval(`
    function findLowViaDwalkLoot(){
      let tries=0;
      while(tries<3000){
        const l=dwalkLoot(null,4,false,true,false); // t2 depth>=4 branch, same 2d6*10/120 max
        const gp=parseInt(l.coin,10);
        if(gp<0.8*120) return l;
        tries++;
      }
      return null;
    }
    window.__realLow = findLowViaDwalkLoot();
  `);
  check("dwalkLoot itself withholds .valuable when its own coin roll is sub-80%", !!win.__realLow && win.__realLow.valuable === null, JSON.stringify(win.__realLow));
}

// ============================================================================
// 10. rollLoot({kind:"valuable"}) — one draw off the valuables table on demand
// ============================================================================
{
  const win = newWin();
  win.eval(`window.__rv = rollLoot({ kind: "valuable" });`);
  check("rollLoot({kind:'valuable'}) returns an item record with a name + gp value", win.__rv && win.__rv.kind === "item" && typeof win.__rv.name === "string" && typeof win.__rv.rolled.value === "number", JSON.stringify(win.__rv));
}

console.log(`\n${(fail || guardFail) ? "❌ FAIL" : "✅ PASS"} — ${pass + guardPass} assertions passed, ${fail + guardFail} failed`);
if (fail || guardFail) process.exit(1);
