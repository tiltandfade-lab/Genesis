/* Verify ECONOMY v1 — the buy/sell ENGINE + DATA spine (docs/ECONOMY.md) — full-app jsdom load.
   Covers, per the spec's §7 verification plan:
     1. Pricing (itemPrice) — mundane SRD cost incl. unit conversion; cost:null → gp:null;
        magic rarity bands (Common/Uncommon/Rare); consumable halving; unknown name → null, no throw.
     2. Sell (sellValue) — floor(price*SELL_RATIO); merchant-coin cap.
     3. Stock gating (rollShopStock) — no Rare at tier 0; no Very Rare+ at any tier; apothecary
        reliably stocks a healing consumable; determinism under a stubbed rng.
     4. Transactions round-tripped through the REAL applyEvent (previewBuy/previewSell → apply →
        assert gold/inventory; insufficient-gold refused with no event; over-capacity surfaced).
     5. The 7th mutation-guard check — SELL_RATIO / consumable-halving / Very-Rare gate broken
        one at a time; each must flip a specific assertion RED, then restored → GREEN.

   Run:  node dev/verify-economy.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

// Re-reads every module fresh off disk each call (NOT cached) — required so the mutation-guard
// section (§6 below), which rewrites data/economy.js / src/engine/economy.js on disk between
// calls, actually observes the mutated source instead of a stale in-memory snapshot.
function newWin(){
  const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`, { runScripts: "dangerously" });
  dom.window.eval(harness + "\n" + src);
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const mkWorld = (gold) => ({
  id: "w-ev", characters: [{ status: "living", name: "Test", conditions: [],
    sheet: { gold: gold, scores: { str: 10 }, inventory: [
      { id: "a1", name: "Scimitar", conditions: [] },
    ] } }],
  ledger: [], clock: { day: 1, min: 360 },
});

// ============================================================================
// 1. PRICING — itemPrice
// ============================================================================
{
  const win = newWin();
  win.eval(`
    window.__mace = itemPrice("Mace");                          // mundane, 5gp flat
    window.__messKit = itemPrice("Mess Kit");                    // mundane, 2sp -> 0.2gp (unit conversion)
    window.__arrow = itemPrice("Arrow");                         // mundane per-unit, 0.05gp
    window.__almsBox = itemPrice("Alms Box");                    // cost:null mundane -> gp:null
    window.__common = itemPrice("Bead of Nourishment");          // pure magic, Common, non-consumable
    window.__uncommon = itemPrice("Cloak of Protection");        // pure magic, Uncommon, non-consumable
    window.__rare = itemPrice("Amulet of Health");                // pure magic, Rare, non-consumable
    window.__potHeal = itemPrice("Potion of Healing");            // SRD mundane cost entry exists (50gp) — mundane wins
    window.__potGreater = itemPrice("Potion of Greater Healing"); // pure magic consumable, Uncommon 400 -> half 200
    window.__unknown = itemPrice("Not A Real Item Xyzzy");        // unknown -> null, no throw
  `);
  check("mundane cost resolves in gp (Mace = 5gp)", win.__mace.gp === 5 && win.__mace.source === "srd", JSON.stringify(win.__mace));
  check("mundane sp cost unit-converts to gp (Mess Kit 2sp -> 0.2gp)", Math.abs(win.__messKit.gp - 0.2) < 1e-9, JSON.stringify(win.__messKit));
  check("mundane per-unit cost (Arrow 0.05gp)", Math.abs(win.__arrow.gp - 0.05) < 1e-9, JSON.stringify(win.__arrow));
  check("cost:null mundane item -> gp:null (unpriceable)", win.__almsBox.gp === null, JSON.stringify(win.__almsBox));
  check("Common magic rarity band = 100", win.__common.gp === 100 && win.__common.source === "rarity", JSON.stringify(win.__common));
  check("Uncommon magic rarity band = 400", win.__uncommon.gp === 400, JSON.stringify(win.__uncommon));
  check("Rare magic rarity band = 4000", win.__rare.gp === 4000, JSON.stringify(win.__rare));
  check("Potion of Healing resolves via its own SRD mundane cost entry (50gp), not the rarity band",
    win.__potHeal.gp === 50 && win.__potHeal.source === "srd", JSON.stringify(win.__potHeal));
  check("a pure-magic consumable (Potion of Greater Healing) halves its rarity band (Uncommon 400 -> 200)",
    win.__potGreater.gp === 200 && win.__potGreater.consumable === true, JSON.stringify(win.__potGreater));
  check("an unknown item name degrades to gp:null, never throws", win.__unknown.gp === null && win.__unknown.consumable === false, JSON.stringify(win.__unknown));
}

// ============================================================================
// 2. SELL — sellValue
// ============================================================================
{
  const win = newWin();
  win.eval(`
    window.__sellMace = sellValue("Mace", { coin: 1000 });                 // 5 * 0.5 = 2.5 -> floor 2
    window.__sellRareUncapped = sellValue("Amulet of Health", { coin: 100000 }); // 4000*0.5=2000, plenty of coin
    window.__sellRareCapped = sellValue("Amulet of Health", { coin: 500 });      // 2000 > 500 -> capped
    window.__sellUnpriceable = sellValue("Alms Box", { coin: 1000 });
  `);
  check("sellValue = floor(price * SELL_RATIO) (Mace 5gp -> 2gp)", win.__sellMace.gp === 2 && !win.__sellMace.capped, JSON.stringify(win.__sellMace));
  check("sellValue under merchant coin is NOT capped", win.__sellRareUncapped.gp === 2000 && !win.__sellRareUncapped.capped, JSON.stringify(win.__sellRareUncapped));
  check("sellValue exceeding merchant.coin is CAPPED to the merchant's coin", win.__sellRareCapped.gp === 500 && win.__sellRareCapped.capped === true, JSON.stringify(win.__sellRareCapped));
  check("an unpriceable item is not sellable (gp:null)", win.__sellUnpriceable.gp === null, JSON.stringify(win.__sellUnpriceable));
}

// ============================================================================
// 3. STOCK GATING — rollShopStock / makeShop, determinism
// ============================================================================
{
  const win = newWin();
  win.eval(`
    function stubRng(seq){ let i=0; return function(){ const v=seq[i % seq.length]; i++; return v; }; }
    window.__hamletStock = rollShopStock(0, "smith", stubRng([0.1,0.3,0.5,0.7,0.9,0.2,0.4,0.6,0.8,0.05,0.95,0.15]));
    window.__cityStock = rollShopStock(3, "smith", stubRng([0.1,0.3,0.5,0.7,0.9,0.2,0.4,0.6,0.8,0.05,0.95,0.15]));
    window.__apoStock = rollShopStock(2, "apothecary", stubRng([0.1,0.3,0.5,0.7,0.9,0.2,0.4,0.6,0.8]));
    window.__anyTier = [0,1,2,3].map(t => rollShopStock(t, "arcanist", stubRng([0.11,0.22,0.33,0.44,0.55,0.66,0.77,0.88,0.99,0.05])));
    // determinism: same rng sequence -> identical stock list
    window.__detA = rollShopStock(1, "general", stubRng([0.2,0.4,0.6,0.1,0.3,0.5,0.7]));
    window.__detB = rollShopStock(1, "general", stubRng([0.2,0.4,0.6,0.1,0.3,0.5,0.7]));
  `);
  const rarityOf = (win, name) => { const md = win.eval(`magicDef(${JSON.stringify(name)})`); return md ? md.rarity : null; };
  check("a tier-0 hamlet shop never stocks Rare", !win.__hamletStock.some(l => rarityOf(win, l.name) === "Rare"), JSON.stringify(win.__hamletStock));
  check("a tier-3 city shop MAY stock Rare (smith magicKinds include Weapon/Armor)",
    win.__cityStock.length > 0, JSON.stringify(win.__cityStock));
  check("NO shop at ANY tier ever stocks Very Rare or higher (T1/T2 scope, structural gate)",
    win.__anyTier.every(stock => !stock.some(l => { const r = rarityOf(win, l.name); return r === "Very Rare" || r === "Legendary" || r === "Artifact"; })),
    JSON.stringify(win.__anyTier));
  check("an apothecary reliably stocks a healing consumable (Potion of Healing)",
    win.__apoStock.some(l => l.name === "Potion of Healing"), JSON.stringify(win.__apoStock));
  check("rollShopStock is deterministic under a stubbed rng (identical sequence -> identical stock)",
    JSON.stringify(win.__detA) === JSON.stringify(win.__detB), JSON.stringify({ a: win.__detA, b: win.__detB }));

  win.eval(`window.__shop = makeShop({ tier: 2, archetype: "apothecary", rng: stubRng([0.3,0.5,0.7]) });`);
  check("makeShop sets coin from merchantCoin(tier) (town = 500)", win.__shop.coin === 500, JSON.stringify(win.__shop));
  check("makeShop's stock includes the apothecary healing guarantee", win.__shop.stock.some(l => l.name === "Potion of Healing"), JSON.stringify(win.__shop.stock));
}

// ============================================================================
// 4. TRANSACTIONS — round-tripped through the REAL applyEvent
// ============================================================================
{
  const win = newWin();
  const w = mkWorld(100);
  const sh = w.characters[0].sheet;
  const shop = { id: "shop1", stock: [{ name: "Mace", qty: 2 }], coin: 1000 };

  win.eval(`window.__pb = previewBuy(${JSON.stringify(sh)}, ${JSON.stringify(shop)}, "Mace");`);
  check("previewBuy succeeds for an in-stock, affordable, priceable item", win.__pb.ok && win.__pb.price === 5, JSON.stringify(win.__pb));

  const before = sh.gold;
  const r = win.applyEvent(w, win.__pb.event);
  check("applying the buy event drops gold by price", r.ok && sh.gold === before - 5, JSON.stringify({ r, gold: sh.gold }));
  check("applying the buy event adds the item to inventory", sh.inventory.some(it => it.name === "Mace"), JSON.stringify(sh.inventory));

  // sell it back
  const inst = sh.inventory.find(it => it.name === "Mace");
  win.eval(`window.__ps = previewSell(${JSON.stringify(sh)}, ${JSON.stringify(shop)}, ${JSON.stringify(inst.id)});`);
  check("previewSell succeeds for a held, priceable instance", win.__ps.ok && win.__ps.payout === 2, JSON.stringify(win.__ps));
  const goldBeforeSell = sh.gold;
  const r2 = win.applyEvent(w, win.__ps.event);
  check("applying the sell event raises gold by payout", r2.ok && sh.gold === goldBeforeSell + 2, JSON.stringify({ r2, gold: sh.gold }));
  check("applying the sell event removes the instance", !sh.inventory.some(it => it.id === inst.id), JSON.stringify(sh.inventory));

  // merchant-broke guard: a payout capped to exactly 0 must REFUSE the sale (no event) — otherwise
  // the caller's removeIds event would take the player's item for nothing. But a LOW-but-nonzero
  // coin still completes the sale at the reduced (capped, >0) payout — the partial case stays valid.
  const wSell = mkWorld(0);
  const rareInst = { id: "amuletX", name: "Amulet of Health", conditions: [] };   // 4000gp -> sells 2000
  wSell.characters[0].sheet.inventory.push(rareInst);
  const shSell = wSell.characters[0].sheet;
  win.eval(`window.__psBroke = previewSell(${JSON.stringify(shSell)}, ${JSON.stringify({ id: "broke", coin: 0 })}, "amuletX");`);
  check("previewSell REFUSES a zero-payout sale (broke merchant, coin 0) — reason:merchant-broke, NO event",
    win.__psBroke.ok === false && win.__psBroke.reason === "merchant-broke" && win.__psBroke.event === undefined, JSON.stringify(win.__psBroke));
  win.eval(`window.__psPartial = previewSell(${JSON.stringify(shSell)}, ${JSON.stringify({ id: "lowcoin", coin: 100 })}, "amuletX");`);
  check("previewSell COMPLETES a partial sale at the capped, reduced (>0) payout (coin 100 < half-price 2000)",
    win.__psPartial.ok === true && win.__psPartial.payout === 100 && win.__psPartial.capped === true && !!win.__psPartial.event, JSON.stringify(win.__psPartial));

  // insufficient gold
  const wPoor = mkWorld(1);
  win.eval(`window.__pbPoor = previewBuy(${JSON.stringify(wPoor.characters[0].sheet)}, ${JSON.stringify(shop)}, "Mace");`);
  check("previewBuy refuses insufficient gold with a reason and NO event",
    win.__pbPoor.ok === false && win.__pbPoor.reason === "insufficient-gold" && win.__pbPoor.event === undefined, JSON.stringify(win.__pbPoor));

  // out of stock
  win.eval(`window.__pbOos = previewBuy(${JSON.stringify(sh)}, ${JSON.stringify({ id: "s2", stock: [], coin: 100 })}, "Mace");`);
  check("previewBuy refuses an out-of-stock item", win.__pbOos.ok === false && win.__pbOos.reason === "out-of-stock", JSON.stringify(win.__pbOos));

  // unpriceable
  win.eval(`window.__pbUnp = previewBuy(${JSON.stringify(sh)}, ${JSON.stringify({ id: "s3", stock: [{ name: "Alms Box", qty: 1 }], coin: 100 })}, "Alms Box");`);
  check("previewBuy refuses an unpriceable item", win.__pbUnp.ok === false && win.__pbUnp.reason === "unpriceable", JSON.stringify(win.__pbUnp));

  // over-capacity — a buy that breaches STR x 30 surfaces via the REAL item_changed handler
  const wHeavy = mkWorld(100000);
  wHeavy.characters[0].sheet.scores = { str: 3 };   // hard cap = 90 lb
  const heavyShop = { id: "s4", stock: [{ name: "Plate Armor", qty: 2 }], coin: 100 };
  win.eval(`window.__pbHeavy = previewBuy(${JSON.stringify(wHeavy.characters[0].sheet)}, ${JSON.stringify(heavyShop)}, "Plate Armor");`);
  check("previewBuy itself doesn't pre-check encumbrance (per spec — the handler is the source of truth)", win.__pbHeavy.ok === true, JSON.stringify(win.__pbHeavy));
  const rHeavy = win.applyEvent(wHeavy, win.__pbHeavy.event);
  wHeavy.characters[0].sheet.inventory.push({ id: "extra", name: "Plate Armor", conditions: [] });   // pile on weight
  const rHeavy2 = win.applyEvent(wHeavy, { type: "item_changed", payload: { add: [{ name: "Plate Armor" }] } });
  check("the REAL applyEvent surfaces over-capacity on a breach (STR x 30 hard cap)", rHeavy2.ok === false && rHeavy2.reason === "over-capacity", JSON.stringify(rHeavy2));
}

// ============================================================================
// 5. shopStockValue — sanity (sum of priced lines, unpriceable lines contribute 0)
// ============================================================================
{
  const win = newWin();
  win.eval(`
    window.__ssv = shopStockValue({ stock: [{ name: "Mace", qty: 2 }, { name: "Alms Box", qty: 1 }] });
  `);
  check("shopStockValue sums priced lines and skips unpriceable ones (Mace 5gp x2 = 10)", win.__ssv === 10, win.__ssv);
}

console.log(`\n${fail ? "✗" : "✓"} economy (pre-mutation-guard): ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);

// ============================================================================
// 6. MUTATION GUARDS (docs/ECONOMY.md §7.4) — break, confirm RED, restore, confirm GREEN.
// ============================================================================
console.log("\n--- mutation guards ---");
const economyPath = join(ROOT, "data/economy.js");
const originalEconomy = readFileSync(economyPath, "utf-8");
let guardPass = 0, guardFail = 0;
const gcheck = (name, cond, detail = "") =>
  cond ? (guardPass++, console.log("  ✓", name)) : (guardFail++, console.log("  ✗", name, "—", detail));

function withMutatedEconomy(mutateFn, testFn){
  const mutated = mutateFn(originalEconomy);
  if (mutated === originalEconomy) throw new Error("mutation did not change the file — pattern didn't match");
  try {
    writeFileSyncTemp(mutated);
    return testFn();
  } finally {
    writeFileSyncTemp(originalEconomy);
  }
}
import { writeFileSync as _writeFileSync } from "node:fs";
function writeFileSyncTemp(content){ _writeFileSync(economyPath, content, "utf-8"); }

// (a) SELL_RATIO -> 1.0
{
  const redOk = withMutatedEconomy(
    (s) => s.replace("const SELL_RATIO = 0.5;", "const SELL_RATIO = 1.0;"),
    () => {
      const win = newWin();
      win.eval(`window.__sell = sellValue("Mace", { coin: 1000 });`);
      return win.__sell.gp === 5;   // if the mutation held, sell = full price, NOT the expected 2 -> the real assertion (===2) would fail
    }
  );
  gcheck("SELL_RATIO->1.0 breaks the sell assertion (RED confirmed: payout became full price, not half)", redOk === true, "sell did not change under the mutation");
  const win = newWin();
  win.eval(`window.__sell = sellValue("Mace", { coin: 1000 });`);
  gcheck("SELL_RATIO restored -> sell assertion GREEN again (Mace sells for 2gp)", win.__sell.gp === 2, JSON.stringify(win.__sell));
}

// (b) remove the consumable 1/2 halving in src/engine/economy.js (itemPrice's cons branch)
{
  const enginePath = join(ROOT, "src/engine/economy.js");
  const originalEngine = readFileSync(enginePath, "utf-8");
  const mutatedEngine = originalEngine.replace(
    "const gp=cons ? Math.floor(band/2) : band;",
    "const gp=band;"
  );
  if (mutatedEngine === originalEngine) throw new Error("consumable-halving mutation pattern didn't match");
  _writeFileSync(enginePath, mutatedEngine, "utf-8");
  let redVal;
  try {
    const win = newWin();
    win.eval(`window.__pg = itemPrice("Potion of Greater Healing");`);
    redVal = win.__pg.gp;
  } finally {
    _writeFileSync(enginePath, originalEngine, "utf-8");
  }
  gcheck("removing the consumable 1/2 halving breaks the potion-price assertion (RED: 400, not 200)", redVal === 400, "got " + redVal);
  const win = newWin();
  win.eval(`window.__pg = itemPrice("Potion of Greater Healing");`);
  gcheck("consumable halving restored -> potion-price assertion GREEN again (200)", win.__pg.gp === 200, JSON.stringify(win.__pg));
}

// (c) drop the Very-Rare tier gate (PLACE_TIERS rarities lists include "Very Rare")
{
  const redOk = withMutatedEconomy(
    (s) => s.replace(
      `{ tier: 3, name: "city", rarities: ["Common", "Uncommon", "Rare"], stockSize: { min: 8, max: 14 }, coin: 2000 },`,
      `{ tier: 3, name: "city", rarities: ["Common", "Uncommon", "Rare", "Very Rare"], stockSize: { min: 8, max: 14 }, coin: 2000 },`
    ),
    () => {
      const win = newWin();
      win.eval(`
        function stubRng(seq){ let i=0; return function(){ const v=seq[i % seq.length]; i++; return v; }; }
        window.__vr = rollShopStock(3, "smith", stubRng([0.05,0.15,0.25,0.35,0.45,0.55,0.65,0.75,0.85,0.95,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5]));
      `);
      const md = (name) => win.eval(`magicDef(${JSON.stringify(name)})`);
      return win.__vr.some(l => { const d = md(l.name); return d && d.rarity === "Very Rare"; });
    }
  );
  gcheck("dropping the Very-Rare tier gate breaks the stock-gating assertion (RED: a Very Rare item appears)", redOk === true, "no Very Rare item surfaced under the mutation");
  const win = newWin();
  win.eval(`
    function stubRng(seq){ let i=0; return function(){ const v=seq[i % seq.length]; i++; return v; }; }
    window.__vr2 = rollShopStock(3, "smith", stubRng([0.05,0.15,0.25,0.35,0.45,0.55,0.65,0.75,0.85,0.95,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5]));
  `);
  const md2 = (name) => win.eval(`magicDef(${JSON.stringify(name)})`);
  gcheck("Very-Rare gate restored -> stock-gating assertion GREEN again (no Very Rare at tier 3)",
    !win.__vr2.some(l => { const d = md2(l.name); return d && d.rarity === "Very Rare"; }), JSON.stringify(win.__vr2));
}

// (d) remove the zero-payout merchant-broke guard in src/engine/economy.js (previewSell)
{
  const enginePath = join(ROOT, "src/engine/economy.js");
  const originalEngine = readFileSync(enginePath, "utf-8");
  const mutatedEngine = originalEngine.replace(
    `  if(sv.gp<=0) return { ok:false, reason:"merchant-broke" };\n`,
    ""
  );
  if (mutatedEngine === originalEngine) throw new Error("merchant-broke guard mutation pattern didn't match");
  _writeFileSync(enginePath, mutatedEngine, "utf-8");
  let redRes;
  try {
    const win = newWin();
    const shSell = { gold: 0, scores: { str: 10 }, inventory: [{ id: "amuletX", name: "Amulet of Health", conditions: [] }] };
    win.eval(`window.__psRed = previewSell(${JSON.stringify(shSell)}, ${JSON.stringify({ id: "broke", coin: 0 })}, "amuletX");`);
    redRes = win.__psRed;
  } finally {
    _writeFileSync(enginePath, originalEngine, "utf-8");
  }
  // Without the guard, a broke merchant returns ok:true with a payout of 0 AND a removeIds event —
  // the exact item-for-nothing loss the guard prevents. RED = the merchant-broke assertion no longer holds.
  gcheck("removing the <=0 guard breaks the merchant-broke assertion (RED: ok:true + 0-payout removeIds event)",
    redRes.ok === true && redRes.payout === 0 && !!redRes.event, JSON.stringify(redRes));
  const win = newWin();
  const shSell2 = { gold: 0, scores: { str: 10 }, inventory: [{ id: "amuletX", name: "Amulet of Health", conditions: [] }] };
  win.eval(`window.__psGreen = previewSell(${JSON.stringify(shSell2)}, ${JSON.stringify({ id: "broke", coin: 0 })}, "amuletX");`);
  gcheck("merchant-broke guard restored -> assertion GREEN again (ok:false, reason:merchant-broke, no event)",
    win.__psGreen.ok === false && win.__psGreen.reason === "merchant-broke" && win.__psGreen.event === undefined, JSON.stringify(win.__psGreen));
}

console.log(`\n${guardFail ? "✗" : "✓"} mutation guards: ${guardPass} passed, ${guardFail} failed`);

const totalPass = pass + guardPass, totalFail = fail + guardFail;
console.log(`\n${totalFail ? "✗" : "✓"} verify-economy TOTAL: ${totalPass} passed, ${totalFail} failed`);
process.exit(totalFail ? 1 : 0);
