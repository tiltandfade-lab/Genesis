/* Verify ITEMS — the type/instance split for gear (docs/ITEMS.md) — full-app jsdom load.
   Covers the whole build in one harness, the verify-triage.mjs pattern:
     1. the generated index (data/items.js: ITEMS_BY_NAME / ITEM_CONDITIONS / PACK_EXPANSIONS /
        KIT_ITEM_EXPANSIONS) — spot-check correctness against known SRD values, not just presence;
     2. migrateWorld backfills a legacy string-array inventory into instances, idempotently;
     3. character creation (cgSheetExtras) expands a kit + its pack into real individual instances;
     4. the new EVENT-CONTRACT events (item_changed/item_split/condition_add/condition_remove/
        equip/unequip) through applyEvent;
     5. cmEquippedDamage — the PC's objective weapon damage, incl. the SRD base dual-wield rule;
     6. dmDigest surfaces pc.inventory/pc.equipped/pc.equippedWeapons;
     7. renderCharacterPanel doesn't throw on instances/conditions/equipped/an unindexed name.

   Run:  node dev/verify-items.mjs
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
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

// Section 1's probes reference top-level `const ITEMS_BY_NAME`/etc (data/items.js) by bare name —
// those bindings live ONLY in the lexical scope of the eval() call that defined them (a real-JS
// quirk: top-level const/let, unlike var/function, never become window properties, so a LATER
// separate eval() can't see them). Fold the probe assignments into the SAME initial eval as the app
// source so they share scope. Every other section calls already-window-attached FUNCTIONS
// (applyEvent/cmEquippedDamage/dmDigest/etc. — function declarations DO persist as window
// properties), so those are unaffected and stay as plain calls from outside.
const probe1 = `
  window.__scimitar = ITEMS_BY_NAME["scimitar"];
  window.__mace = ITEMS_BY_NAME["mace"];
  window.__longbow = ITEMS_BY_NAME["longbow"];
  window.__shield = ITEMS_BY_NAME["shield"];
  window.__studded = ITEMS_BY_NAME["studded leather armor"];
  window.__arrow = ITEMS_BY_NAME["arrow"];
  window.__blowgun = ITEMS_BY_NAME["blowgun"];
  window.__conditions = ITEM_CONDITIONS;
  window.__explorerPack = PACK_EXPANSIONS["Explorer's Pack"];
  window.__handaxes = KIT_ITEM_EXPANSIONS["4 Handaxes"];
  window.__kitCount = Object.keys(KIT_ITEM_EXPANSIONS).length;
`;

const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`, { runScripts: "dangerously" });
const win = dom.window;
win.eval(harness + "\n" + src + "\n" + probe1);

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 1. THE GENERATED INDEX
// ============================================================================
{
  check("Scimitar: 1d6 slashing, Finesse+Light, Nick mastery", win.__scimitar &&
    win.__scimitar.damage.n === 1 && win.__scimitar.damage.die === 6 && win.__scimitar.damage.type === "slashing" &&
    win.__scimitar.properties.includes("Finesse") && win.__scimitar.properties.includes("Light") &&
    win.__scimitar.mastery === "Nick", JSON.stringify(win.__scimitar));
  check("Mace: 1d6 bludgeoning, no properties", win.__mace &&
    win.__mace.damage.n === 1 && win.__mace.damage.die === 6 && win.__mace.damage.type === "bludgeoning" &&
    win.__mace.properties.length === 0, JSON.stringify(win.__mace));
  check("Longbow: 1d8 piercing", win.__longbow && win.__longbow.damage.n === 1 && win.__longbow.damage.die === 8 &&
    win.__longbow.damage.type === "piercing", JSON.stringify(win.__longbow));
  check("Shield: +2 AC, not a weapon", win.__shield && win.__shield.ac.shieldBonus === 2 && win.__shield.kind === "shield",
    JSON.stringify(win.__shield));
  check("Studded Leather: 12 + Dex (no cap), 13 lb", win.__studded && win.__studded.ac.base === 12 &&
    win.__studded.ac.dexMod === true && win.__studded.ac.dexCap === null && win.__studded.weight === 13,
    JSON.stringify(win.__studded));
  check("Arrow: stackable, per-unit weight/cost (20 for 1lb/1gp)", win.__arrow && win.__arrow.stackable === true &&
    Math.abs(win.__arrow.weight * 20 - 1) < 1e-6 && Math.abs(win.__arrow.cost.n * 20 - 1) < 1e-6,
    JSON.stringify(win.__arrow));
  check("Blowgun: flat 1 piercing damage (diceless n:0,die:0,bonus:1 — combat.js convention)",
    win.__blowgun && win.__blowgun.damage.n === 0 && win.__blowgun.damage.die === 0 &&
    win.__blowgun.damage.bonus === 1 && win.__blowgun.damage.type === "piercing", JSON.stringify(win.__blowgun));
  check("ITEM_CONDITIONS is a small fixed vocabulary including the asked-for ones",
    Array.isArray(win.__conditions) && win.__conditions.length >= 6 &&
    ["on-fire", "frozen", "poisoned-coated", "dropped"].every((c) => win.__conditions.includes(c)),
    JSON.stringify(win.__conditions));
  check("Explorer's Pack expands to real individual line items (not a bundled string)",
    Array.isArray(win.__explorerPack) && win.__explorerPack.length >= 6 &&
    win.__explorerPack.some((e) => e.name === "Torch" && e.qty === 10) &&
    win.__explorerPack.some((e) => e.name === "Rations" && e.qty === 10) &&
    win.__explorerPack.some((e) => e.name === "Backpack"), JSON.stringify(win.__explorerPack));
  check("'4 Handaxes' (a non-pack kit item) splits to {name,qty} too, not just packs",
    Array.isArray(win.__handaxes) && win.__handaxes.length === 1 &&
    win.__handaxes[0].name === "Handaxe" && win.__handaxes[0].qty === 4, JSON.stringify(win.__handaxes));
  check("KIT_ITEM_EXPANSIONS covers every distinct CLASS_KIT item string", win.__kitCount > 30, win.__kitCount);
}

// ============================================================================
// 2. MIGRATION (state.js migrateWorld)
// ============================================================================
{
  const w = { id: "w-mig", characters: [{ status: "living", sheet: { inventory: ["Mace", "Shield"] } }],
              gazetteer: [], factions: [], pressures: [] };
  win.migrateWorld(w);
  const inv1 = w.characters[0].sheet.inventory;
  check("migrateWorld turns a legacy string array into instances", inv1.length === 2 &&
    inv1.every((it) => it.id && it.name && Array.isArray(it.conditions)), JSON.stringify(inv1));
  const ids1 = inv1.map((it) => it.id);
  win.migrateWorld(w);                                    // idempotent — re-running must not re-mint ids
  const ids2 = w.characters[0].sheet.inventory.map((it) => it.id);
  check("migrateWorld is idempotent (already-migrated instances pass through untouched)",
    JSON.stringify(ids1) === JSON.stringify(ids2), JSON.stringify({ ids1, ids2 }));
}

// ============================================================================
// 3. CHARACTER CREATION (cgSheetExtras expands kit + pack)
// ============================================================================
{
  win.eval(`
    GS.CGEN = {species:"Human",class:"Fighter",background:"Soldier",name:"Test",
      scores:{str:15,dex:14,con:13,int:12,wis:10,cha:8},
      skills:[],languages:[],kit:"B",toolPicks:{},featPick:null,life:null};
    window.__ex = cgSheetExtras();
  `);
  const inv = win.__ex.inventory;
  check("character creation mints real instances for every kit item", Array.isArray(inv) && inv.length > 5 &&
    inv.every((it) => it.id && it.name && Array.isArray(it.conditions)), JSON.stringify(inv));
  check("a pack in the kit expands to its individual contents (Backpack/Rope/etc, not 'Dungeoneer's Pack')",
    inv.some((it) => it.name === "Backpack") && inv.some((it) => it.name === "Rope") &&
    !inv.some((it) => it.name.includes("Pack")), inv.map((i) => i.name));
  check("'20 Arrows' in the kit becomes one Arrow instance with qty 20",
    inv.some((it) => it.name === "Arrow" && it.qty === 20), inv.map((i) => [i.name, i.qty]));
  check("ids are unique across the whole expanded inventory",
    new Set(inv.map((it) => it.id)).size === inv.length);
}

// ============================================================================
// 4. EVENT-CONTRACT — item_split / condition_add / condition_remove / equip / unequip
// ============================================================================
const mkWorld = () => ({
  id: "w-ev", characters: [{ status: "living", name: "Test", conditions: [],
    sheet: { gold: 0, inventory: [
      { id: "a1", name: "Scimitar", conditions: [] },
      { id: "a2", name: "Arrow", qty: 20, conditions: [] },
    ] } }],
  ledger: [], clock: { day: 1, min: 360 },
});

{
  const w = mkWorld();
  const r = win.applyEvent(w, { type: "item_split", payload: { itemId: "a2", qty: 5 } });
  const inv = w.characters[0].sheet.inventory;
  check("item_split divides a stack into two instances", r.ok && inv.length === 3 &&
    inv.find((it) => it.id === "a2").qty === 15 && inv.find((it) => it.id === r.newId).qty === 5,
    JSON.stringify(inv));
  const r2 = win.applyEvent(w, { type: "item_split", payload: { itemId: "a2", qty: 999 } });
  check("item_split refuses to split off MORE than the stack holds", r2.ok === false && r2.reason === "insufficient");
  // review fix: qty is floored to an integer and a non-positive / non-numeric request is REJECTED
  // (not silently |0-coerced to 1 or 32-bit-overflowed). A fractional ≥1 floors to a valid split.
  const w2 = mkWorld();
  check("item_split floors a fractional qty (2.9 → split 2)",
    win.applyEvent(w2, { type: "item_split", payload: { itemId: "a2", qty: 2.9 } }).remaining === 18);
  const w3 = mkWorld();
  check("item_split rejects qty 0", win.applyEvent(w3, { type: "item_split", payload: { itemId: "a2", qty: 0 } }).reason === "bad-qty");
  check("item_split rejects a negative qty", win.applyEvent(w3, { type: "item_split", payload: { itemId: "a2", qty: -3 } }).reason === "bad-qty");
  check("item_split rejects a non-numeric qty", win.applyEvent(w3, { type: "item_split", payload: { itemId: "a2", qty: "abc" } }).reason === "bad-qty");
  check("item_split rejects a sub-1 fractional qty (0.5 → floor 0)", win.applyEvent(w3, { type: "item_split", payload: { itemId: "a2", qty: 0.5 } }).reason === "bad-qty");
}

// review fix: item_changed honors the DEPRECATED name-based remove (a stale DM emitter must not silently no-op)
{
  const w = mkWorld();
  const r = win.applyEvent(w, { type: "item_changed", payload: { remove: ["scimitar"] } });   // old shape, case-insensitive
  check("item_changed back-compat: remove:[name] still removes (no silent confiscation failure)",
    r.ok && r.removed.length === 1 && r.removed[0].name === "Scimitar" &&
    !w.characters[0].sheet.inventory.some((it) => it.name === "Scimitar"), JSON.stringify(r));
}

// review fix: equip rejects a kind/slot mismatch (armor can't go in a hand)
{
  const w = mkWorld();
  w.characters[0].sheet.inventory.push({ id: "arm", name: "Studded Leather Armor", conditions: [] });
  const rBad = win.applyEvent(w, { type: "equip", payload: { itemId: "arm", slot: "mainHand" } });
  check("equip rejects armor into a hand slot (kind/slot mismatch)", rBad.ok === false && rBad.reason === "slot-kind-mismatch", JSON.stringify(rBad));
  const rOk = win.applyEvent(w, { type: "equip", payload: { itemId: "arm", slot: "armor" } });
  check("equip accepts armor into the armor slot", rOk.ok === true);
  const rFlavor = win.applyEvent(w, { type: "equip", payload: { itemId: "a1", slot: "mainHand" } });   // Scimitar — a weapon
  check("equip still accepts a weapon into a hand", rFlavor.ok === true);
}

{
  const w = mkWorld();
  const r1 = win.applyEvent(w, { type: "condition_add", payload: { itemId: "a1", condition: "poisoned-coated" } });
  check("condition_add tags a known condition", r1.ok && r1.conditions.includes("poisoned-coated"), JSON.stringify(r1));
  const r2 = win.applyEvent(w, { type: "condition_add", payload: { itemId: "a1", condition: "not-a-real-condition" } });
  check("condition_add rejects an unknown condition (the fixed vocabulary holds)",
    r2.ok === false && r2.reason === "unknown-condition", JSON.stringify(r2));
  const r3 = win.applyEvent(w, { type: "condition_remove", payload: { itemId: "a1", condition: "poisoned-coated" } });
  check("condition_remove untags it", r3.ok && !r3.conditions.includes("poisoned-coated"), JSON.stringify(r3));
}

{
  const w = mkWorld();
  w.characters[0].sheet.inventory.push({ id: "a3", name: "Dagger", conditions: [] });
  const rMain = win.applyEvent(w, { type: "equip", payload: { itemId: "a1", slot: "mainHand" } });
  const rOff = win.applyEvent(w, { type: "equip", payload: { itemId: "a3", slot: "offHand" } });
  check("DUAL-WIELD: mainHand and offHand hold two DIFFERENT weapons simultaneously",
    rMain.ok && rOff.ok && rMain.equipped.mainHand === "a1" && rOff.equipped.offHand === "a3" &&
    rOff.equipped.mainHand === "a1", JSON.stringify(rOff));
  const rBad = win.applyEvent(w, { type: "equip", payload: { itemId: "a1", slot: "notaslot" } });
  check("equip rejects an unknown slot", rBad.ok === false && rBad.reason === "bad-slot");
  const rUn = win.applyEvent(w, { type: "unequip", payload: { slot: "offHand" } });
  check("unequip clears just that slot, leaves mainHand alone",
    rUn.ok && rUn.equipped.offHand === null && rUn.equipped.mainHand === "a1", JSON.stringify(rUn));
}

// ============================================================================
// 5. cmEquippedDamage — objective weapon damage, incl. the SRD base dual-wield rule
// ============================================================================
{
  win.eval(`
    var __eq = {mainHand:"i1", offHand:"i2", armor:null};
    var __inv = [{id:"i1",name:"Scimitar",conditions:[]},{id:"i2",name:"Dagger",conditions:[]},
                 {id:"i3",name:"Mace",conditions:[]},{id:"i4",name:"Longbow",conditions:[]}];
    window.__posMain = cmEquippedDamage(__eq, __inv, {str:1,dex:3}, "mainHand");
    window.__posOff  = cmEquippedDamage(__eq, __inv, {str:1,dex:3}, "offHand");
    window.__negMain = cmEquippedDamage(__eq, __inv, {str:-1,dex:-2}, "mainHand");
    window.__negOff  = cmEquippedDamage(__eq, __inv, {str:-1,dex:-2}, "offHand");
    var __eq2 = {mainHand:"i1", offHand:"i3", armor:null};                 // Mace off-hand: not Light
    window.__nonLightOff = cmEquippedDamage(__eq2, __inv, {str:1,dex:1}, "offHand");
    window.__emptySlot = cmEquippedDamage({mainHand:null}, __inv, {}, "mainHand");
    var __eq3 = {mainHand:"i4", offHand:null, armor:null};                 // Longbow: ranged uses DEX
    window.__rangedMain = cmEquippedDamage(__eq3, __inv, {str:5,dex:2}, "mainHand");
    window.__unindexed = cmEquippedDamage({mainHand:"i9"}, [{id:"i9",name:"Heirloom Locket",conditions:[]}], {str:1}, "mainHand");
  `);
  check("mainHand (Finesse, positive mods) always adds the better of STR/DEX",
    win.__posMain && win.__posMain.dmg[0].bonus === 3, JSON.stringify(win.__posMain));
  check("DUAL-WIELD off-hand (positive mod) does NOT add the ability mod (SRD base rule)",
    win.__posOff && win.__posOff.dmg[0].bonus === 0, JSON.stringify(win.__posOff));
  check("mainHand with negative mods adds the (negative) modifier same as positive",
    win.__negMain && win.__negMain.dmg[0].bonus === -1, JSON.stringify(win.__negMain));
  check("DUAL-WIELD off-hand DOES add the modifier when it's negative (the one exception)",
    win.__negOff && win.__negOff.dmg[0].bonus === -1, JSON.stringify(win.__negOff));
  check("a non-Light weapon can't go off-hand (returns null, never invents an attack)",
    win.__nonLightOff === null);
  check("an empty slot returns null (caller falls back to DM-supplied damage)", win.__emptySlot === null);
  check("ranged weapon (Longbow) uses DEX, not STR", win.__rangedMain && win.__rangedMain.dmg[0].bonus === 2,
    JSON.stringify(win.__rangedMain));
  check("an unindexed item (no SRD match) returns null, never fabricates a die", win.__unindexed === null);
}

// ============================================================================
// 5b. cmEquippedAC — armor/shield → AC, the 5.5e math (review-fix: equipping armor must change AC)
// ============================================================================
{
  win.eval(`
    var __inv2 = [
      {id:"studded",name:"Studded Leather Armor",conditions:[]},  // 12 + DEX (light, no cap)
      {id:"half",name:"Half Plate Armor",conditions:[]},          // 15 + min(DEX,2) (medium)
      {id:"plate",name:"Plate Armor",conditions:[]},              // 18 flat (heavy)
      {id:"shield",name:"Shield",conditions:[]},                  // +2
      {id:"sword",name:"Scimitar",conditions:[]}
    ];
    window.__acUnarmored = cmEquippedAC({mainHand:"sword",offHand:null,armor:null}, __inv2, {dex:3});
    window.__acLight     = cmEquippedAC({armor:"studded"}, __inv2, {dex:3});            // 12+3=15
    window.__acMedium    = cmEquippedAC({armor:"half"}, __inv2, {dex:3});               // 15+min(3,2)=17
    window.__acHeavy     = cmEquippedAC({armor:"plate"}, __inv2, {dex:3});              // 18 (no dex)
    window.__acShield    = cmEquippedAC({armor:"studded",offHand:"shield"}, __inv2, {dex:3}); // 15+2=17
    window.__acNegDex    = cmEquippedAC({armor:"half"}, __inv2, {dex:-1});              // 15+min(-1,2)=14
    window.__autoEq      = defaultEquip(__inv2);
  `);
  check("unarmored AC = 10 + DEX", win.__acUnarmored === 13, win.__acUnarmored);
  check("light armor = base + full DEX (Studded 12 + 3)", win.__acLight === 15, win.__acLight);
  check("medium armor caps DEX at 2 (Half Plate 15 + min(3,2))", win.__acMedium === 17, win.__acMedium);
  check("heavy armor ignores DEX (Plate = 18)", win.__acHeavy === 18, win.__acHeavy);
  check("a shield adds its flat bonus on top (15 + 2)", win.__acShield === 17, win.__acShield);
  check("a negative DEX still applies under a medium cap (15 + -1)", win.__acNegDex === 14, win.__acNegDex);
  check("defaultEquip wears armor + shield + a weapon", win.__autoEq.armor === "studded" || win.__autoEq.armor === "half" || win.__autoEq.armor === "plate",
    JSON.stringify(win.__autoEq));
  check("defaultEquip picks the HIGHEST-base armor (Plate 18 over Studded/Half)", win.__autoEq.armor === "plate", JSON.stringify(win.__autoEq));
  check("defaultEquip routes a shield to the off-hand", win.__autoEq.offHand === "shield", JSON.stringify(win.__autoEq));
  check("defaultEquip puts a weapon in the main hand", win.__autoEq.mainHand === "sword", JSON.stringify(win.__autoEq));
}

// 5b-ii. cmSheetAC folds a flat feat AC bonus (Iron Skin +1) ON TOP of armor — and a DEX bump must NOT
// raise AC under heavy armor (the level-up ripple bug)
{
  win.eval(`
    var __inv3=[{id:"plate",name:"Plate Armor",conditions:[]},{id:"studded",name:"Studded Leather Armor",conditions:[]}];
    window.__sheetPlain = cmSheetAC({equipped:{armor:"studded"},inventory:__inv3,mods:{dex:2}});            // 12+2=14
    window.__sheetBonus = cmSheetAC({equipped:{armor:"studded"},inventory:__inv3,mods:{dex:2},acBonus:1});   // 14+1=15
    window.__heavyLowDex = cmSheetAC({equipped:{armor:"plate"},inventory:__inv3,mods:{dex:0}});              // 18
    window.__heavyHiDex  = cmSheetAC({equipped:{armor:"plate"},inventory:__inv3,mods:{dex:5}});              // STILL 18 (no dex)
  `);
  check("cmSheetAC adds armor + DEX", win.__sheetPlain === 14, win.__sheetPlain);
  check("cmSheetAC folds a feat AC bonus on top of armor", win.__sheetBonus === 15, win.__sheetBonus);
  check("heavy armor AC is DEX-independent — a DEX bump does NOT raise it (the level-up ripple bug)",
    win.__heavyLowDex === 18 && win.__heavyHiDex === 18, JSON.stringify([win.__heavyLowDex, win.__heavyHiDex]));
}

// 5c. the equip/unequip events RECOMPUTE sh.ac (the actual bug)
{
  const w = mkWorld();
  const sh = w.characters[0].sheet;
  sh.mods = { str: 0, dex: 2 }; sh.ac = 12;
  sh.inventory.push({ id: "arm2", name: "Chain Mail", conditions: [] });   // 16 flat (heavy)
  const rEq = win.applyEvent(w, { type: "equip", payload: { itemId: "arm2", slot: "armor" } });
  check("equipping armor RECOMPUTES sh.ac (the review bug — was a no-op)", sh.ac === 16 && rEq.ac === 16, JSON.stringify({ ac: sh.ac, r: rEq.ac }));
  const rUn = win.applyEvent(w, { type: "unequip", payload: { slot: "armor" } });
  check("unequipping armor drops AC back to unarmored (10 + DEX)", sh.ac === 12 && rUn.ac === 12, JSON.stringify({ ac: sh.ac, r: rUn.ac }));
}

// ============================================================================
// 6. dmDigest surfaces inventory/equipped/equippedWeapons
// ============================================================================
{
  const w = mkWorld();
  w.characters[0].sheet.equipped = { mainHand: "a1", offHand: null, armor: null };
  w.characters[0].sheet.mods = { str: 2, dex: 1 };
  w.characters[0].sheet.scores = {}; w.characters[0].sheet.saveProfs = []; w.characters[0].sheet.skillProfs = [];
  w.currentNodeId = null; w.gazetteer = []; w.revealed = {};
  w.seed = { master: { name: "X", desc: "x" }, smell: { name: "x" }, sound: { name: "x" }, arch: { name: "x" },
             taboo: { name: "x", desc: "x" }, myth: { name: "x", desc: "x" } };
  w.factions = []; w.pressures = []; w.session = 1; w.map = { nodes: {}, edges: [] };
  win.U.worlds["w-ev"] = w; win.U.activeWorldId = "w-ev";
  const d = win.dmDigest();
  check("dmDigest.pc.inventory lists instance identity (id/name/qty/conditions)",
    d.pc.inventory.length === 2 && d.pc.inventory[0].id === "a1", JSON.stringify(d.pc.inventory));
  check("dmDigest.pc.equipped mirrors sheet.equipped", d.pc.equipped.mainHand === "a1");
  check("dmDigest.pc.equippedWeapons resolves the objective damage spec — the DM narrates FROM this",
    d.pc.equippedWeapons.mainHand && d.pc.equippedWeapons.mainHand.weaponName === "Scimitar" &&
    d.pc.equippedWeapons.mainHand.dmg[0].die === 6, JSON.stringify(d.pc.equippedWeapons));
}

// ============================================================================
// 7. RENDER — doesn't throw on instances / conditions / equipped / an unindexed name
// ============================================================================
{
  const cur = { status: "living", name: "Render Test", conditions: [], headline: "x", pronouns: "they",
    sheet: { species: "Orc", class: "Ranger", background: "Hermit", level: 1, xp: 13, hp: 12, hpCur: 12, ac: 11,
      profBonus: 2, scores: { str: 12 }, mods: { str: 1 }, saveProfs: [], skillProfs: [],
      passivePerception: 11, hitDie: "d10", gold: 13, feat: null,
      equipped: { mainHand: "i1", offHand: null, armor: "i3" },
      inventory: [
        { id: "i1", name: "Scimitar", conditions: ["poisoned-coated"] },
        { id: "i2", name: "Arrow", qty: 20, conditions: [] },
        { id: "i3", name: "Studded Leather Armor", conditions: [] },
        { id: "i4", name: "An Unindexed Flavor Item", conditions: [] },
      ] } };
  let html, threw = null;
  try { html = win.renderCharacterPanel({ id: "w-r", currentNodeId: null }, cur); }
  catch (e) { threw = e.message; }
  check("renderCharacterPanel doesn't throw on instances/conditions/equipped/unindexed names", !threw, threw);
  if (html) {
    check("shows total weight vs. carrying capacity", html.includes("Carrying"));
    check("shows the equipped slots", html.includes("Equipped") && html.includes("Scimitar"));
    check("shows a condition badge on the tagged instance", html.includes("item-cond") && html.includes("poisoned-coated"));
    check("shows the qty stack (Arrow ×20)", html.includes("×20"));
    check("an unindexed item still renders (degrades to flavor-only, never dropped)",
      html.includes("An Unindexed Flavor Item"));
  }
}

console.log(`\n${fail ? "✗" : "✓"} items: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
