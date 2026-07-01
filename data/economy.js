/* GENESIS DATA — data/economy.js
   Economy v1 (docs/ECONOMY.md) — the money loop's BALANCE DATA. Pure data, no functions: every
   tunable number the buy/sell engine (src/engine/economy.js) reads lives here so re-tuning the
   economy after playtest is a one-file edit (CLAUDE.md discipline: keep balance numbers out of
   the engine). IP-clean, genericized — a DMG-derived STRUCTURE (rarity bands a shop can sell at)
   with Adam's own numbers; no source table is pasted.
   Classic <script> (shared global scope); defines RARITY_VALUE, SELL_RATIO, PLACE_TIERS,
   SHOP_ARCHETYPES. Hand-authored (not generated) — safe to edit directly. */

/* RARITY_VALUE — the authored magic-item price band (docs/ECONOMY.md §2b). A magic item's price
   in v1 is a flat function of its rarity, not a per-item hand-priced table (no parallel pricing
   system — mundane gear prices off SRD `cost`; magic gear prices off this band). Artifact is
   priceless in v1 (null — never sold/bought via gold). */
const RARITY_VALUE = {
  "Common": 100,
  "Uncommon": 400,
  "Rare": 4000,
  "Very Rare": 40000,
  "Legendary": 200000,
  "Artifact": null,
};

/* SELL_RATIO — merchants pay below value (SRD half-value baseline: selling loot nets half its
   price). One knob, applied in engine.economy's sellValue. */
const SELL_RATIO = 0.5;

/* PLACE_TIERS (docs/ECONOMY.md §4) — goods are tiered by PLACE + access, never by PC level (the
   world is real, not a theme park scaling to the PC). `tier` lives on the shop record (assigned
   at mint time, since world nodes carry no tier field yet). `rarities` = the rarity ceiling this
   tier's shops may stock (inclusive list — a lower tier is a strict subset of a higher one).
   `stockSize` = {min,max} item-line count rolled per shop. `coin` = the merchant's starting/
   replenished coin pool (the sell-side saturation guard). ALL PROVISIONAL BALANCE NUMBERS —
   tune after playtest; this is the one file to touch. */
const PLACE_TIERS = [
  { tier: 0, name: "hamlet", rarities: ["Common"], stockSize: { min: 3, max: 5 }, coin: 25 },
  { tier: 1, name: "village", rarities: ["Common", "Uncommon"], stockSize: { min: 4, max: 7 }, coin: 100 },
  { tier: 2, name: "town", rarities: ["Common", "Uncommon", "Rare"], stockSize: { min: 6, max: 10 }, coin: 500 },
  { tier: 3, name: "city", rarities: ["Common", "Uncommon", "Rare"], stockSize: { min: 8, max: 14 }, coin: 2000 },
];
// Note (§4): AVAILABILITY is the HARD gate — a tier's `rarities` list is what rollShopStock
// enforces (town and city share the same Rare ceiling; Very Rare+ is never listed, a structural
// gate not a probability, per T1/T2 scope). RARE_ROLL_CHANCE below is a SEPARATE, currently-UNUSED
// knob RESERVED for a future frequency-weighting pass: rollShopStock draws uniformly from the
// allowed pool today (so town shows Rare as often as city, gated only by availability); when the
// frequency pass lands, this table will bias how often a given magic draw reaches for the Rare band
// per tier (town "rarely" vs city "sometimes"). Documented-reserved, NOT wired — safe to retune.
const RARE_ROLL_CHANCE = { 0: 0, 1: 0.05, 2: 0.20, 3: 0.35 };   // RESERVED (unused): per-tier chance a magic stock draw reaches for Rare — future frequency pass

/* SHOP_ARCHETYPES (docs/ECONOMY.md §3b) — data-driven category gates so adding a new archetype
   later needs no code. `categories` match itemDef(...).category — the REAL values baked by
   build/gen-items.py into ITEMS_BY_NAME: "Adventuring Gear" | "Ammunition" | "Heavy/Medium/Light
   Armor" | "Shield" | "Simple/Martial Melee/Ranged Weapons" | "Spellcasting Focus" | "Tools".
   `magicKinds` match magicDef(...).category — the magic catalog's real values: "Armor" | "Potion"
   | "Ring" | "Rod" | "Scroll" | "Staff" | "Wand" | "Weapon" | "Wondrous Item".
   `consumables:true` means this archetype's stock is weighted toward consumables (the keystone
   sink must be reliably buyable). */
const SHOP_ARCHETYPES = {
  general: {
    label: "General Store",
    categories: ["Adventuring Gear", "Tools", "Ammunition", "Spellcasting Focus"],
    magicKinds: [],
    consumables: false,
  },
  apothecary: {
    label: "Apothecary",
    categories: ["Adventuring Gear"],                 // mundane antitoxin/herbalism kit etc. (+ Potion of Healing's own SRD cost entry)
    magicKinds: ["Potion"],
    consumables: true,
  },
  smith: {
    label: "Smith",
    categories: ["Simple Melee Weapons", "Simple Ranged Weapons", "Martial Melee Weapons",
      "Martial Ranged Weapons", "Light Armor", "Medium Armor", "Heavy Armor", "Shield"],
    magicKinds: ["Weapon", "Armor"],
    consumables: false,
  },
  arcanist: {
    label: "Arcanist",
    categories: ["Spellcasting Focus", "Adventuring Gear"],          // foci/components
    magicKinds: ["Scroll", "Wondrous Item", "Wand", "Staff", "Ring", "Rod"],
    consumables: false,
  },
};

/* Named balance knobs referenced by rollShopStock's apothecary weighting — the keystone-sink
   reliability guarantee (docs/ECONOMY.md §4 "apothecary stock is weighted toward consumables").
   HEALING_POTION_NAME is the canonical mundane-priced restock item (SRD `cost` 50gp — see
   data/items.js "potion of healing"). */
const HEALING_POTION_NAME = "Potion of Healing";
const APOTHECARY_HEALING_GUARANTEE = true;   // an apothecary shop always includes at least one Potion of Healing line
