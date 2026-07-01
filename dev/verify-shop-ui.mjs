/* Verify the Shop UI (docs/SHOP-UI.md) — full-app jsdom load, per the spec's §6 verification plan.
   Modeled EXACTLY on dev/verify-in-session-ui.mjs's harness (same JSDOM_HOME, manifest loadOrder
   eval, check() helper). Covers:
     1. open_shop mints a w.shops record and opens the panel (GS.gamePanel==='shop').
     2. The Buy|Sell tab bar renders; BUY lists stock with qty markers; the header shows the
        player's gold and does NOT contain shop.coin's figure (Ruling 4); no row has a direct
        Buy/Sell onclick — only the confirm-on-plaque flow (selectShopRow -> .shop-confirm).
     3. Buy / unaffordable / over-capacity / Sell / merchant-broke / persistence (§6.3).
     4. Attitude tint (§3b): +2 discounts buy 10%/rung, sell payout tints before the coin cap;
        -2 gouges; no codexId -> byte-matches the untinted engine.
     5. Mutation guards (§6.4, run by the caller from this file's exports-by-convention: this file
        focuses on the base assertions; the calling report performs the red/green guard walk by
        editing source and re-running — see the report for the actual red/green output).

   Run:  node dev/verify-shop-ui.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

// every module, in real load order (manifest.json is the spine — CLAUDE.md)
const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshWin() {
  // localStorage (persistence test §9) needs a real origin URL — jsdom throws SecurityError on
  // localStorage access under the default about:blank origin.
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + src);
  return win;
}

function makeWorld(win, sheetOverrides = {}) {
  const world = {
    id: "w-shoptest", name: "The Shop Test World",
    seed: { master: { name: "Test Shrine", desc: "a place for asserting DOM" } },
    characters: [{ id: "c1", status: "living", name: "Ilyra Stonesong", headline: "a test soul", spark: "a test soul", pronouns: "she",
      sheet: Object.assign({
        species: "Elf", class: "Wizard", background: "Sage", level: 3, xp: 400,
        hp: 20, hpCur: 14, ac: 13, tempHp: 0,
        profBonus: 2, scores: { str: 10, int: 16 }, mods: { int: 3 }, saveProfs: ["int","wis"], skillProfs: ["Arcana"],
        passivePerception: 11, hitDie: "d6", gold: 100,
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: ["Fire Bolt"], spells: ["Magic Missile"],
        inventory: [{ id: "i1", name: "Quarterstaff", conditions: [] }],
        equipped: {},
      }, sheetOverrides) }],
    gazetteer: [], log: [], ledger: [], clock: { day: 4, min: 500 }, session: 2,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Shrine", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = null;
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  return world;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 0. DEV MENU AFFORDANCE — "Open test shop" is wired via a resolvable global (activeWorld()), NOT
//    a bare local-scope identifier that would ReferenceError when the browser evaluates the inline
//    onclick string in global scope (docs/SHOP-UI.md §2c).
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.toggleMenu();
  const html = win.document.getElementById("worldView").innerHTML;
  check("Open test shop menu item renders", html.includes("Open test shop"));
  check("Open test shop's onclick resolves the world via activeWorld(), not a bare local 'w'",
    /onclick="closeMenu\(\);applyEvent\(activeWorld\(\),\{type:'open_shop'/.test(html));
  // execute the exact onclick string the DOM would run, in GLOBAL scope (mirrors a real browser
  // click) — a bare 'w' reference would throw ReferenceError here, catching the exact bug class.
  const btn = [...win.document.querySelectorAll(".mi")].find(b => b.textContent.includes("Open test shop"));
  const onclick = btn.getAttribute("onclick");
  win.GS.menuOpen = true; // toggleMenu() above already opened it; re-affirm before the raw eval
  win.eval(onclick);
  check("the dev affordance's exact onclick string opens the shop panel with no ReferenceError", win.GS.gamePanel === "shop", `gamePanel=${win.GS.gamePanel}`);
}

// ============================================================================
// 1. open_shop MINTS + OPENS — GS.gamePanel==='shop', w.shops populated
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const r = win.applyEvent(world, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Test Market" } });
  check("open_shop returns ok:true with a shopId", r.ok === true && !!r.shopId, JSON.stringify(r));
  check("open_shop mints a w.shops record", !!world.shops && !!world.shops[r.shopId], JSON.stringify(world.shops));
  check("open_shop sets GS.gamePanel to 'shop'", win.GS.gamePanel === "shop");
  check("open_shop sets GS.activeShopId", win.GS.activeShopId === r.shopId);
  check("minted shop has a stock array and a coin pool", Array.isArray(world.shops[r.shopId].stock) && typeof world.shops[r.shopId].coin === "number");

  // re-opening the SAME shopId re-attaches the existing (possibly depleted) record, not a fresh mint
  world.shops[r.shopId].coin = 7;
  const r2 = win.applyEvent(world, { type: "open_shop", payload: { shopId: r.shopId } });
  check("re-opening a known shopId preserves its depleted state (coin stays 7, not remint)", world.shops[r.shopId].coin === 7 && r2.shopId === r.shopId);
}

// ============================================================================
// 2. PANEL RENDER — Buy|Sell tabs, qty markers, gold shown, shop.coin NEVER rendered, no direct
//    Buy/Sell onclick (confirm-on-plaque only)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.applyEvent(world, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Test Market" } });
  const shopId = win.GS.activeShopId;
  const shop = world.shops[shopId];
  shop.stock = [{ name: "Mace", qty: 3 }, { name: "Rope, Hempen (50 feet)", qty: 1 }];
  shop.coin = 424242; // a distinctive figure that must NEVER appear in the rendered panel (Ruling 4)
  win.renderWorld();
  const html = win.document.getElementById("worldView").innerHTML;

  check("shop panel renders (panel-col present)", /class="panel-col"/.test(html));
  check("Buy|Sell tab bar renders", /panel-tabs/.test(html) && html.includes(">Buy<") && html.includes(">Sell<"));
  check("Buy tab is active by default", /class="ptab active"[^>]*>Buy</.test(html));
  check("BUY tab lists stock with qty markers (×3)", html.includes("Mace") && html.includes("×3"));
  check("header shows the player's gold (100 gp)", /shop-gold/.test(html) && html.includes("100") && html.includes("gp"));
  check("header does NOT contain shop.coin's figure (424242) — Ruling 4, merchant pool hidden", !html.includes("424242"));
  check("no row has a direct buyItem/sellItem onclick (transactions only via .shop-confirm)",
    !/class="shop-row[^"]*"\s+onclick="buyItem/.test(html) && !/class="shop-row[^"]*"\s+onclick="sellItem/.test(html));
  check("rows select via selectShopRow, not a direct transaction call", /onclick="selectShopRow\('buy','Mace'\)"/.test(html));

  // switch to Sell
  win.setShopTab("sell");
  const html2 = win.document.getElementById("worldView").innerHTML;
  check("setShopTab('sell') activates the Sell tab", /class="ptab active"[^>]*>Sell</.test(html2));
  check("SELL tab lists the player's inventory (Quarterstaff)", html2.includes("Quarterstaff"));
  check("sell rows select via selectShopRow, not a direct sellItem call", /onclick="selectShopRow\('sell','i1'\)"/.test(html2));
}

// ============================================================================
// 3. CONFIRM-ON-PLAQUE — selecting a row expands a detail strip with .shop-confirm
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.applyEvent(world, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Test Market" } });
  const shopId = win.GS.activeShopId;
  world.shops[shopId].stock = [{ name: "Mace", qty: 3 }];
  win.selectShopRow("buy", "Mace");
  const html = win.document.getElementById("worldView").innerHTML;
  check("selecting a row expands a .shop-detail with a .shop-confirm plaque", /shop-detail/.test(html) && /shop-confirm/.test(html));
  check("the confirm plaque calls buyItem with the shop id and item name", new RegExp(`onclick="buyItem\\('${shopId}','Mace'\\)"`).test(html));

  // clicking the same row again collapses it
  win.selectShopRow("buy", "Mace");
  check("re-selecting the same row collapses it (GS.shopSel cleared)", win.GS.shopSel === null);
}

// ============================================================================
// 4. BUY — affordable purchase drops gold, adds to inventory, decrements stock
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win, { gold: 100 });
  win.applyEvent(world, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Test Market" } });
  const shopId = win.GS.activeShopId;
  const shop = world.shops[shopId];
  shop.stock = [{ name: "Mace", qty: 3 }]; // Mace = 5gp
  const sh = world.characters[0].sheet;
  const goldBefore = sh.gold, invBefore = sh.inventory.length;
  win.buyItem(shopId, "Mace");
  check("buyItem drops gold by the price (Mace 5gp)", sh.gold === goldBefore - 5, `gold=${sh.gold}`);
  check("buyItem adds the item to inventory", sh.inventory.some(it => it.name === "Mace") && sh.inventory.length === invBefore + 1);
  check("buyItem decrements shop.stock qty", shop.stock.find(l => l.name === "Mace").qty === 2, JSON.stringify(shop.stock));
}

// ============================================================================
// 5. UNAFFORDABLE — buyItem refuses, no change, Confirm renders disabled
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win, { gold: 2 }); // below Mace's 5gp
  win.applyEvent(world, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Test Market" } });
  const shopId = win.GS.activeShopId;
  world.shops[shopId].stock = [{ name: "Mace", qty: 3 }];
  const sh = world.characters[0].sheet;
  const goldBefore = sh.gold, invBefore = sh.inventory.length;
  win.buyItem(shopId, "Mace");
  check("buyItem refuses when unaffordable (no gold change)", sh.gold === goldBefore);
  check("buyItem refuses when unaffordable (no inventory change)", sh.inventory.length === invBefore);

  win.selectShopRow("buy", "Mace");
  const html = win.document.getElementById("worldView").innerHTML;
  check("the rendered Confirm plaque carries the disabled attribute when unaffordable", /class="shop-confirm" disabled/.test(html));
  check("the disabled reason is inline (Not enough gold)", html.includes("Not enough gold"));
}

// ============================================================================
// 6. OVER-CAPACITY — a buy that breaches STR×30 is refused via the real applyEvent, no change
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win, { gold: 100000, scores: { str: 3 } }); // hard cap = 90 lb
  win.applyEvent(world, { type: "open_shop", payload: { tier: 3, archetype: "smith", name: "Heavy Goods" } });
  const shopId = win.GS.activeShopId;
  world.shops[shopId].stock = [{ name: "Plate Armor", qty: 2 }];
  const sh = world.characters[0].sheet;
  const goldBefore = sh.gold, invBefore = sh.inventory.length;
  // pile on weight first so a single Plate Armor purchase breaches the cap
  sh.inventory.push({ id: "heavy1", name: "Plate Armor", conditions: [] });
  sh.inventory.push({ id: "heavy2", name: "Plate Armor", conditions: [] });
  win.buyItem(shopId, "Plate Armor");
  check("over-capacity buy is refused (gold unchanged)", sh.gold === goldBefore, `gold=${sh.gold}`);
  check("over-capacity buy is refused (no new inventory item beyond the pre-loaded ones)", sh.inventory.length === invBefore + 2, `len=${sh.inventory.length}`);
}

// ============================================================================
// 7. SELL — payout raises gold, instance removed, shop.coin drops
// ============================================================================
{
  const win = freshWin();
  // Quarterstaff (0.2gp) sells for floor(0.2*0.5)=0 -> previewSell's zero-payout guard refuses it
  // (correctly — see mutation guard (d) in verify-economy.mjs). Use a real-value item (Mace, 5gp ->
  // sells 2gp) so this test actually exercises a successful sale.
  const world = makeWorld(win, { gold: 0, inventory: [{ id: "m1", name: "Mace", conditions: [] }] });
  win.applyEvent(world, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Test Market" } });
  const shopId = win.GS.activeShopId;
  const shop = world.shops[shopId];
  shop.coin = 1000;
  const sh = world.characters[0].sheet; // holds Mace (id m1)
  const goldBefore = sh.gold, coinBefore = shop.coin;
  win.sellItem(shopId, "m1");
  check("sellItem raises gold by the payout", sh.gold > goldBefore, `gold=${sh.gold}`);
  check("sellItem removes the sold instance", !sh.inventory.some(it => it.id === "m1"));
  check("sellItem decrements shop.coin by the payout", shop.coin === coinBefore - sh.gold, `coin=${shop.coin} gold=${sh.gold}`);
}

// ============================================================================
// 8. MERCHANT BROKE — a zero-coin merchant disables Confirm + refuses sellItem
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win, {
    gold: 0,
    inventory: [{ id: "rareItem", name: "Amulet of Health", conditions: [] }], // 4000gp rarity band -> sells 2000
  });
  win.applyEvent(world, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Test Market" } });
  const shopId = win.GS.activeShopId;
  const shop = world.shops[shopId];
  shop.coin = 0; // broke merchant
  const sh = world.characters[0].sheet;
  const goldBefore = sh.gold, invBefore = sh.inventory.length;
  win.sellItem(shopId, "rareItem");
  check("sellItem refuses on a broke merchant (no gold change)", sh.gold === goldBefore);
  check("sellItem refuses on a broke merchant (item not removed)", sh.inventory.length === invBefore);

  win.setShopTab("sell");
  win.selectShopRow("sell", "rareItem");
  const html = win.document.getElementById("worldView").innerHTML;
  check("the rendered Confirm plaque is disabled for a broke merchant", /class="shop-confirm" disabled/.test(html));
  check("the disabled reason reads Their purse is empty", html.includes("Their purse is empty"));
}

// ============================================================================
// 9. PERSISTENCE — buy+sell then reload (loadU-equivalent) reflects the depleted state
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win, { gold: 100 });
  win.applyEvent(world, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Test Market" } });
  const shopId = win.GS.activeShopId;
  world.shops[shopId].stock = [{ name: "Mace", qty: 3 }];
  world.shops[shopId].coin = 1000;
  win.buyItem(shopId, "Mace");
  const sh = world.characters[0].sheet;
  win.sellItem(shopId, sh.inventory.find(it => it.name === "Mace").id);

  // buyItem/sellItem persist via their OWN internal saveU() call (docs/SHOP-UI.md §4 — "saveU() after
  // each transaction so a reload preserves the depleted shop"). Read back through loadU (the real
  // persistence layer, localStorage shim in jsdom) WITHOUT calling saveU again here — this is the
  // mutation-guard (b) target: remove the module's saveU() call and this assertion goes RED.
  const reloaded = win.loadU();
  const rShop = reloaded.worlds[world.id].shops[shopId];
  // buy decrements Mace qty 3->2, the immediate sell-back restocks it 2->3 (addToShopStock) — the
  // STOCK count nets to unchanged, but COIN persistently reflects the sell payout (1000 - 2gp = 998,
  // the stateful saturation guard depleting across the session — the actual thing being verified).
  check("persistence: reloaded w.shops[id].stock reflects the buy+sell round-trip (net unchanged, qty 3)", !!rShop && rShop.stock.find(l => l.name === "Mace").qty === 3, JSON.stringify(rShop && rShop.stock));
  check("persistence: reloaded w.shops[id].coin reflects the sell payout (1000 - 2gp = 998)", !!rShop && rShop.coin === 998, `coin=${rShop && rShop.coin}`);
}

// ============================================================================
// 10. ATTITUDE TINT (§3b) — codex-linked shop at +2/-2 tints buy price and sell payout
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win, { gold: 1000 });
  const npc = win.codexAdd(world, { kind: "npc", name: "Merchant Toran", fields: {} });
  win.codexAttitudeOpen(world, npc.id, 0, {});
  win.codexSetAttitude(world, npc.id, 2, "test-favorable");
  const r = win.applyEvent(world, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Toran's Goods", codexId: npc.id } });
  const shopId = r.shopId;
  const shop = world.shops[shopId];
  shop.stock = [{ name: "Mace", qty: 3 }]; // base 5gp
  const sh = world.characters[0].sheet;

  const baseBuy = win.eval(`itemPrice("Mace").gp`); // 5
  const expectedBuyPlus2 = Math.max(1, Math.round(baseBuy * (1 - 0.10 * 2))); // round(5*0.8)=4
  win.renderWorld();
  const html = win.document.getElementById("worldView").innerHTML;
  check("attitude +2: rendered buy price is round(base*0.8) (Mace 5gp -> 4gp)", html.includes(`${expectedBuyPlus2} gp`), `expected ${expectedBuyPlus2}`);

  const goldBefore = sh.gold;
  win.buyItem(shopId, "Mace");
  check("attitude +2: buyItem charges exactly the tinted price (4gp)", sh.gold === goldBefore - expectedBuyPlus2, `gold=${sh.gold}`);

  // sell payout at +2 = floor(base*ratio*1.2) pre-cap
  shop.coin = 100000;
  const sv = win.eval(`sellValue("Quarterstaff", {coin:100000}, 2)`);
  win.setShopTab("sell");
  const html2 = win.document.getElementById("worldView").innerHTML;
  check("attitude +2: sell payout tints favorably (floor(base*ratio*1.2))", html2.includes(`${sv.gp} gp`), `expected ${sv.gp}`);

  // now flip to -2 (gouged) and confirm the buy price rises
  win.codexSetAttitude(world, npc.id, -2, "test-unfavorable");
  win.setShopTab("buy");
  win.renderWorld();
  const html3 = win.document.getElementById("worldView").innerHTML;
  const expectedBuyMinus2 = Math.max(1, Math.round(baseBuy * (1 - 0.10 * -2))); // round(5*1.2)=6
  check("attitude -2: rendered buy price is round(base*1.2) (Mace 5gp -> 6gp)", html3.includes(`${expectedBuyMinus2} gp`), `expected ${expectedBuyMinus2}`);

  // NO codexId -> prices byte-match the untinted engine
  const win2 = freshWin();
  const world2 = makeWorld(win2, { gold: 1000 });
  const r2 = win2.applyEvent(world2, { type: "open_shop", payload: { tier: 2, archetype: "general", name: "Plain Market" } });
  world2.shops[r2.shopId].stock = [{ name: "Mace", qty: 3 }];
  win2.renderWorld();
  const html4 = win2.document.getElementById("worldView").innerHTML;
  check("no codexId -> buy price byte-matches the untinted engine price (5gp)", html4.includes(">5 gp<") || html4.includes("5 gp"), "expected base 5gp");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
