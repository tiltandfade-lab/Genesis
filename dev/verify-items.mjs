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
  window.__thievesTools = itemDef("Thieves’ Tools");   // curly U+2019 — must resolve through itemKey's fold
  window.__messKit = ITEMS_BY_NAME["mess kit"];
  window.__druidFocus = ITEMS_BY_NAME["druidic focus (quarterstaff)"];
  window.__disguise = ITEMS_BY_NAME["disguise kit"];
  window.__itemCount = Object.keys(ITEMS_BY_NAME).length;
  window.__magicCount = Object.keys(MAGIC_ITEMS_BY_NAME).length;
  window.__flametongue = MAGIC_ITEMS_BY_NAME["flame tongue"];
  window.__potHeal = MAGIC_ITEMS_BY_NAME["potion of healing"];
  window.__potFly = MAGIC_ITEMS_BY_NAME["potion of flying"];
  window.__ringProt = MAGIC_ITEMS_BY_NAME["ring of protection"];
  window.__plusWeapon = MAGIC_ITEMS_BY_NAME["weapon, +1, +2, or +3"];
  window.__staffFire = MAGIC_ITEMS_BY_NAME["staff of fire"];
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
  check("ITEM_CONDITIONS is a small fixed vocabulary (SRD-grounded + parked rusted; frozen/waterlogged cut)",
    Array.isArray(win.__conditions) && win.__conditions.length >= 5 &&
    ["on-fire", "poisoned-coated", "cursed", "broken", "dropped", "rusted"].every((c) => win.__conditions.includes(c)) &&
    !["frozen", "waterlogged"].some((c) => win.__conditions.includes(c)),
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
  // indexing completeness (the SRD tools table + foci + the 2014-pack supplement)
  check("itemDef resolves a CURLY-apostrophe name (Thieves’ Tools) via the apostrophe fold",
    win.__thievesTools && win.__thievesTools.kind === "tool" && win.__thievesTools.weight === 1, JSON.stringify(win.__thievesTools));
  check("a tool is indexed (Disguise Kit, kind:tool)", win.__disguise && win.__disguise.kind === "tool", JSON.stringify(win.__disguise));
  check("a focus-by-form is indexed (Druidic Focus (Quarterstaff), kind:focus, 4lb)",
    win.__druidFocus && win.__druidFocus.kind === "focus" && win.__druidFocus.weight === 4, JSON.stringify(win.__druidFocus));
  check("a 2024-dropped pack item is supplemented (Mess Kit has a real weight)", win.__messKit && win.__messKit.weight === 1, JSON.stringify(win.__messKit));
  check("the index is now substantially complete (170+ items)", win.__itemCount >= 170, win.__itemCount);
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

// ============================================================================
// 8. CONGRUENCE (docs/ITEMS.md §E) — the magic index + enchantment overlay + potions + charges + attack
// ============================================================================
{
  check("MAGIC_ITEMS_BY_NAME indexes the SRD magic catalog (250+)", win.__magicCount >= 250, win.__magicCount);
  check("Flame Tongue parses a damage rider (2d6 fire)", win.__flametongue && win.__flametongue.ench &&
    win.__flametongue.ench.damageRider.n === 2 && win.__flametongue.ench.damageRider.die === 6 &&
    win.__flametongue.ench.damageRider.type === "fire", JSON.stringify(win.__flametongue));
  check("Potion of Healing carries a numeric heal consumable (2d4+2)", win.__potHeal && win.__potHeal.consumable &&
    win.__potHeal.consumable.effect.kind === "heal" && win.__potHeal.consumable.effect.dice.n === 2 &&
    win.__potHeal.consumable.effect.dice.bonus === 2, JSON.stringify(win.__potHeal));
  check("a duration potion is a structured buff (Flying, 1 hour)", win.__potFly && win.__potFly.consumable &&
    win.__potFly.consumable.effect.kind === "buff" && win.__potFly.consumable.effect.duration === "1 hour",
    JSON.stringify(win.__potFly));
  check("Ring of Protection parses an acBonus overlay (+1)", win.__ringProt && win.__ringProt.ench &&
    win.__ringProt.ench.acBonus === 1, JSON.stringify(win.__ringProt));
  check("the generic +N weapon template records bonusOptions [1,2,3]", win.__plusWeapon && win.__plusWeapon.ench &&
    JSON.stringify(win.__plusWeapon.ench.bonusOptions) === "[1,2,3]", JSON.stringify(win.__plusWeapon));
  check("Staff of Fire parses charges (10)", win.__staffFire && win.__staffFire.ench &&
    win.__staffFire.ench.charges.max === 10, JSON.stringify(win.__staffFire));

  // congruent cmEquippedDamage — a magic instance resolves BASE off inst.base + folds the overlay
  win.eval(`
    var __minv = [
      {id:"m1",name:"+1 Longsword",base:"Longsword",conditions:[],ench:{bonus:1}},
      {id:"m2",name:"Flame Tongue",base:"Longsword",conditions:[],ench:{damageRider:{n:2,die:6,type:"fire"}}},
      {id:"m3",name:"+2 Plate Armor",base:"Plate Armor",conditions:[],ench:{bonus:2}}
    ];
    window.__mDmg  = cmEquippedDamage({mainHand:"m1"}, __minv, {str:3}, "mainHand");   // 1d8 + 3(str) + 1(magic)
    window.__mRider= cmEquippedDamage({mainHand:"m2"}, __minv, {str:3}, "mainHand");   // base clause + fire rider clause
    window.__mAC   = cmEquippedAC({armor:"m3"}, __minv, {dex:3});                       // Plate 18 + 2 = 20
  `);
  check("congruent cmEquippedDamage: a +1 weapon resolves base off inst.base and adds the magic bonus to damage",
    win.__mDmg && win.__mDmg.baseName === "Longsword" && win.__mDmg.dmg[0].bonus === 4 && win.__mDmg.magicBonus === 1,
    JSON.stringify(win.__mDmg));
  check("congruent cmEquippedDamage: a damage rider is a SECOND damage clause (2d6 fire)",
    win.__mRider && win.__mRider.dmg.length === 2 && win.__mRider.dmg[1].die === 6 && win.__mRider.dmg[1].type === "fire",
    JSON.stringify(win.__mRider));
  check("congruent cmEquippedAC: magic armor +N folds into AC (Plate 18 + 2 = 20)", win.__mAC === 20, win.__mAC);

  // item_changed mints the congruent overlay from the catalog + explicit spec
  {
    const w = mkWorld();
    const r = win.applyEvent(w, { type: "item_changed", payload: { add: [
      { name: "Flame Tongue", base: "Longsword" },              // ench defaults from the catalog
      { name: "+1 Longsword", base: "Longsword", bonus: 1 },     // bonus shorthand
      { name: "Staff of Fire", base: "Quarterstaff" },           // charges default full
    ] } });
    const ft = w.characters[0].sheet.inventory.find(it => it.name === "Flame Tongue");
    const staff = w.characters[0].sheet.inventory.find(it => it.name === "Staff of Fire");
    check("item_changed.add mints a magic instance with the catalog overlay (Flame Tongue rider)",
      r.ok && ft && ft.ench && ft.ench.damageRider && ft.ench.damageRider.type === "fire", JSON.stringify(ft));
    check("item_changed.add: bonus shorthand sets ench.bonus",
      w.characters[0].sheet.inventory.find(it => it.name === "+1 Longsword").ench.bonus === 1);
    check("item_changed.add: charges initialize full (cur=max) on mint", staff && staff.ench.charges.cur === staff.ench.charges.max &&
      staff.ench.charges.max === 10, JSON.stringify(staff && staff.ench));
  }

  // item_use — numeric heal fires in-engine; a buff stamps sh.buffs; the item is consumed
  {
    const w = mkWorld();
    const sh = w.characters[0].sheet; sh.hp = 20; sh.hpCur = 5;
    sh.inventory.push({ id: "pot1", name: "Potion of Healing", conditions: [] });
    const r = win.applyEvent(w, { type: "item_use", payload: { itemId: "pot1", roll: 8 } });   // roll supplied for determinism
    check("item_use heals numerically in-engine (5 + 8 = 13)", r.ok && r.effect.kind === "heal" && sh.hpCur === 13, JSON.stringify({ r, hp: sh.hpCur }));
    check("item_use consumes the potion (removed from inventory)", !sh.inventory.some(it => it.id === "pot1"));
    sh.inventory.push({ id: "pot2", name: "Potion of Flying", conditions: [], consumable: { effect: { kind: "buff", name: "flying", duration: "1 hour" } } });
    const r2 = win.applyEvent(w, { type: "item_use", payload: { itemId: "pot2" } });
    check("item_use stamps a structured buff the DM honors (sh.buffs)", r2.ok && r2.effect.kind === "buff" &&
      Array.isArray(sh.buffs) && sh.buffs.some(b => b.name === "flying"), JSON.stringify({ r2, buffs: sh.buffs }));
    const r3 = win.applyEvent(w, { type: "item_use", payload: { itemId: "a1" } });   // Scimitar — not consumable
    check("item_use refuses a non-consumable", r3.ok === false && r3.reason === "not-consumable", JSON.stringify(r3));
  }

  // charge_spend / charge_restore / long-rest recharge
  {
    const w = mkWorld();
    const sh = w.characters[0].sheet;
    sh.inventory.push({ id: "st1", name: "Staff of Fire", base: "Quarterstaff", conditions: [], ench: { charges: { max: 10, cur: 10 } } });
    const r = win.applyEvent(w, { type: "charge_spend", payload: { itemId: "st1", n: 4 } });
    check("charge_spend decrements the per-instance charge pool", r.ok && r.charges.cur === 6, JSON.stringify(r));
    const rOver = win.applyEvent(w, { type: "charge_spend", payload: { itemId: "st1", n: 99 } });
    check("charge_spend refuses to overspend", rOver.ok === false && rOver.reason === "insufficient-charges", JSON.stringify(rOver));
    const rRest = win.applyEvent(w, { type: "rest", payload: { kind: "long" } });
    check("a long rest recharges magic-item charges to max", rRest.ok && sh.inventory.find(it => it.id === "st1").ench.charges.cur === 10,
      JSON.stringify(sh.inventory.find(it => it.id === "st1").ench.charges));
  }

  // attack — the live path: the PC's equipped weapon actually drives resolveAttack
  {
    const w = mkWorld();
    const sh = w.characters[0].sheet;
    sh.mods = { str: 3, dex: 1 }; sh.profBonus = 2;
    sh.inventory.push({ id: "sw1", name: "+1 Longsword", base: "Longsword", conditions: [], ench: { bonus: 1 } });
    sh.equipped = { mainHand: "sw1", offHand: null, armor: null };
    const r = win.applyEvent(w, { type: "attack", payload: { d20: 15, targetAC: 12, slot: "mainHand" } });   // 15 + 3(str) + 2(prof) + 1(magic) = 21 vs 12
    check("attack: pcAttack drives resolveAttack from the equipped weapon (hit, +1 folded into to-hit)",
      r.ok && r.result.hit === true && r.result.atkBonus === 6 && r.result.weaponName === "+1 Longsword", JSON.stringify(r.result));
    const rNo = win.applyEvent(w, { type: "attack", payload: { d20: 10, targetAC: 12, slot: "offHand" } });   // nothing equipped off-hand
    check("attack: an empty/unindexed slot returns no-weapon (DM resolves manually)", rNo.ok === false && rNo.reason === "no-weapon", JSON.stringify(rNo));
  }

  // render: ench badges + Use/Equip buttons appear on the character panel
  {
    const cur = { status: "living", name: "Magic Test", conditions: [], pronouns: "they",
      sheet: { species: "Elf", class: "Wizard", background: "Sage", level: 3, xp: 900, hp: 18, hpCur: 18, ac: 12,
        profBonus: 2, scores: { dex: 14 }, mods: { dex: 2 }, saveProfs: [], skillProfs: [], passivePerception: 12, hitDie: "d6", gold: 5,
        equipped: { mainHand: "w1", offHand: null, armor: null },
        inventory: [
          { id: "w1", name: "Flame Tongue", base: "Longsword", conditions: [], ench: { damageRider: { n: 2, die: 6, type: "fire" } } },
          { id: "p1", name: "Potion of Healing", conditions: [], consumable: { effect: { kind: "heal", dice: { n: 2, die: 4, bonus: 2 } } } },
          { id: "s1", name: "Staff of Fire", base: "Quarterstaff", conditions: [], ench: { charges: { max: 10, cur: 7 } } },
        ] } };
    let html, threw = null;
    try { html = win.renderCharacterPanel({ id: "w-m", currentNodeId: null }, cur); } catch (e) { threw = e.message; }
    check("render doesn't throw on magic instances (ench/consumable/charges)", !threw, threw);
    if (html) {
      check("render shows a magic overlay badge (item-ench)", html.includes("item-ench"));
      check("render shows a charge readout (⚡7/10)", html.includes("7/10"));
      check("render shows a Use button on a consumable", html.includes("useItem('p1')"));
      check("render shows an equip control (Unequip on the equipped weapon)", html.includes("unequipSlot('mainHand')"));
    }
  }
}

// ============================================================================
// 9. VERSATILE GRIP (Dec 1) + ENCUMBRANCE (Dec 4) + ATTUNEMENT CAP (§E)
// ============================================================================
{
  // Versatile grip: base 1d8 one-handed, 1d10 two-handed; default 2h when off-hand free, override to 1h
  win.eval(`
    var __vinv=[{id:"ls",name:"Longsword",conditions:[]},{id:"sh",name:"Shield",conditions:[]}];
    window.__grip2hDefault = cmEquippedDamage({mainHand:"ls",offHand:null}, __vinv, {str:2}, "mainHand");        // free off-hand → 2h → 1d10
    window.__grip1hOverride= cmEquippedDamage({mainHand:"ls",offHand:null,grip:"1h"}, __vinv, {str:2}, "mainHand"); // player forces 1h → 1d8
    window.__gripShieldForced=cmEquippedDamage({mainHand:"ls",offHand:"sh",grip:"2h"}, __vinv, {str:2}, "mainHand");  // shield occupies off-hand → forced 1h
  `);
  check("Versatile DEFAULTS to two-handed die (1d10) when the off-hand is free", win.__grip2hDefault &&
    win.__grip2hDefault.dmg[0].die === 10 && win.__grip2hDefault.grip === "2h", JSON.stringify(win.__grip2hDefault));
  check("Versatile grip:1h override uses the one-handed die (1d8)", win.__grip1hOverride &&
    win.__grip1hOverride.dmg[0].die === 8 && win.__grip1hOverride.grip === "1h", JSON.stringify(win.__grip1hOverride));
  check("an occupied off-hand FORCES 1h even if grip says 2h (1d8)", win.__gripShieldForced &&
    win.__gripShieldForced.dmg[0].die === 8 && win.__gripShieldForced.grip === "1h", JSON.stringify(win.__gripShieldForced));
  // set_grip event
  {
    const w = mkWorld();
    const sh = w.characters[0].sheet; sh.inventory.push({ id: "ls2", name: "Longsword", conditions: [] });
    sh.equipped = { mainHand: "ls2", offHand: null, armor: null };
    const r = win.applyEvent(w, { type: "set_grip", payload: { grip: "1h" } });
    check("set_grip sets sheet.equipped.grip", r.ok && sh.equipped.grip === "1h", JSON.stringify(r));
    sh.equipped.offHand = "x";
    const rBad = win.applyEvent(w, { type: "set_grip", payload: { grip: "2h" } });
    check("set_grip refuses 2h when the off-hand is occupied", rBad.ok === false && rBad.reason === "off-hand-occupied");
  }

  // encumbrance: carryState tiers + item_changed hard-cap refusal
  {
    win.eval(`
      var __hinv=[{id:"p",name:"Plate Armor",conditions:[]}];  // Plate = 65 lb
      window.__carryOk = carryState({scores:{str:10},inventory:__hinv});        // 65 vs soft 150 → ok
      window.__carryEnc= carryState({scores:{str:3},inventory:[{id:"p",name:"Plate Armor",conditions:[]},{id:"p2",name:"Plate Armor",conditions:[]}]}); // 130 vs soft 45/hard 90 → over-hard
    `);
    check("carryState: within soft cap is 'ok' (no speed penalty)", win.__carryOk.tier === "ok" && win.__carryOk.speedCap === null, JSON.stringify(win.__carryOk));
    check("carryState: over the hard cap flags over-hard + Speed 5", win.__carryEnc.tier === "over-hard" && win.__carryEnc.speedCap === 5, JSON.stringify(win.__carryEnc));
    const w = mkWorld();
    w.characters[0].sheet.scores = { str: 3 };   // soft 45, hard 90
    const rHeavy = win.applyEvent(w, { type: "item_changed", payload: { add: [{ name: "Plate Armor" }, { name: "Plate Armor" }] } }); // 130 > 90
    check("item_changed refuses a pickup over the STR×30 hard cap (no barrelmancers)", rHeavy.ok === false && rHeavy.reason === "over-capacity", JSON.stringify(rHeavy));
    const rForced = win.applyEvent(w, { type: "item_changed", payload: { force: true, add: [{ name: "Plate Armor" }] } });
    check("item_changed force:true overrides the hard cap (DM's call)", rForced.ok === true);
  }

  // attunement cap: dormant until attuned, max 3, ench gated
  {
    const w = mkWorld();
    const sh = w.characters[0].sheet;
    sh.mods = { dex: 0 };
    sh.inventory.push({ id: "ring", name: "Ring of Protection", conditions: [], ench: { acBonus: 1, attunement: true } });
    // dormant before attunement: cmEquippedAC must NOT include the +1 (ring isn't even in a slot, but test the gate on armor)
    sh.inventory.push({ id: "marm", name: "Plate Armor", conditions: [], ench: { acBonus: 2, attunement: true } });
    sh.equipped = { armor: "marm" };
    const acDormant = win.cmSheetAC(sh);
    check("attunement gate: an unattuned +AC armor confers NO bonus (Plate 18, not 20)", acDormant === 18, acDormant);
    const rA = win.applyEvent(w, { type: "attune", payload: { itemId: "marm" } });
    check("attune binds the item and recomputes AC (18 + 2 = 20)", rA.ok && rA.attuned && sh.ac === 20, JSON.stringify({ r: rA, ac: sh.ac }));
    // fill to the cap
    sh.inventory.push({ id: "i5", name: "A", conditions: [], ench: { bonus: 1, attunement: true } });
    sh.inventory.push({ id: "i6", name: "B", conditions: [], ench: { bonus: 1, attunement: true } });
    win.applyEvent(w, { type: "attune", payload: { itemId: "i5" } });
    win.applyEvent(w, { type: "attune", payload: { itemId: "i6" } });
    const rCap = win.applyEvent(w, { type: "attune", payload: { itemId: "ring" } });   // would be the 4th
    check("attune enforces the SRD max-3 cap (4th is refused)", rCap.ok === false && rCap.reason === "attunement-cap", JSON.stringify(rCap));
    const rUn = win.applyEvent(w, { type: "unattune", payload: { itemId: "marm" } });
    check("unattune frees a slot + drops the AC back (20 → 18)", rUn.ok && sh.ac === 18, JSON.stringify({ r: rUn, ac: sh.ac }));
    const rNow = win.applyEvent(w, { type: "attune", payload: { itemId: "ring" } });
    check("attune succeeds once a slot is freed", rNow.ok && rNow.attuned);
    const rMundane = win.applyEvent(w, { type: "attune", payload: { itemId: "a1" } });  // Scimitar — no attunement
    check("attune refuses a non-attunement item", rMundane.ok === false && rMundane.reason === "no-attunement-needed");
  }

  // render: grip toggle + attune button + amber/red encumbrance note
  {
    const cur = { status: "living", name: "Grip Test", conditions: [], pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Soldier", level: 1, xp: 0, hp: 12, hpCur: 12, ac: 16,
        profBonus: 2, scores: { str: 3, dex: 1 }, mods: { str: 3, dex: 1 }, saveProfs: [], skillProfs: [], passivePerception: 10, hitDie: "d10", gold: 0,
        equipped: { mainHand: "l1", offHand: null, armor: null, grip: "2h" },
        inventory: [
          { id: "l1", name: "Longsword", conditions: [] },
          { id: "r1", name: "Ring of Protection", conditions: [], ench: { acBonus: 1, attunement: true } },
        ] } };
    let html, threw = null;
    try { html = win.renderCharacterPanel({ id: "w-g", currentNodeId: null }, cur); } catch (e) { threw = e.message; }
    check("render doesn't throw with grip/attunement/encumbrance", !threw, threw);
    if (html) {
      check("render shows the Versatile grip toggle on the equipped main-hand", html.includes("setGrip("));
      check("render shows an Attune button on an attunement item", html.includes("attuneItem('r1')"));
      check("render shows the encumbrance note (STR 3 + Longsword+Ring under soft cap → still ok, no note)",
        html.includes("Carrying"));
    }
  }
}

console.log(`\n${fail ? "✗" : "✓"} items: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
