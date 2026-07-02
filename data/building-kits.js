/* GENESIS MODULE — data/building-kits.js — URBAN FABRIC type kits (docs/URBAN-FABRIC.md §1).
   Classic <script> (shared global scope); hand-authored (not generated) — safe to edit directly.
   Registered in manifest.json; validated by build/check-manifest.py.

   BUILDING_KITS is the TYPE-KIT catalog rollBuilding (src/engine/codex-roll.js) consumes: each kit
   is {label, functionLine, proprietorRoleHint, patronsLane, economyTie, hookLane, namePattern,
   delegatesToShop (archetype id string | null), tavern (bool — the flagship kit, extra tables)}.
   v1 types (docs/URBAN-FABRIC.md §1): tavern, temple, guildhall, manor, garrison, court, bathhouse,
   gambling-den, warehouse, dock-house — plus the shop kinds (smithy/apothecary/general/arcanist)
   which DELEGATE to makeShop (the kit adds the room around the counter, never a parallel stock
   system). BATCH3-GUARDRAILS J2 (urban-fabric): "rollBuilding proprietors mint via the ambient-pool
   path (soft, at the node)" — that wiring lives in rollBuilding itself; this file is data-only. */

const BUILDING_KITS = {
  tavern: {
    label: "Tavern",
    functionLine: "drink, gossip, a room for the night — the town's living room",
    proprietorRoleHint: "tavern-keeper",
    patronsLane: "locals-and-travelers",
    economyTie: "lodging",
    hookLane: "rumor",
    namePattern: "tavern-name",     // Engine table id extracted from Tavern 2.0 (§3 step 2)
    delegatesToShop: null,
    tavern: true,
  },
  temple: {
    label: "Temple",
    functionLine: "worship, healing, the quiet weight of an old faith",
    proprietorRoleHint: "cleric-or-priest",
    patronsLane: "the-devout",
    economyTie: "none",
    hookLane: "faith",
    namePattern: null,
    delegatesToShop: null,
    tavern: false,
  },
  guildhall: {
    label: "Guildhall",
    functionLine: "trade politics, dues, a guild's business done behind closed doors",
    proprietorRoleHint: "guildmaster",
    patronsLane: "guild-members",
    economyTie: "faction",
    hookLane: "faction",
    namePattern: null,
    delegatesToShop: null,
    tavern: false,
  },
  manor: {
    label: "Manor",
    functionLine: "a family's wealth made into walls; old claims, old grudges",
    proprietorRoleHint: "noble-or-steward",
    patronsLane: "household",
    economyTie: "none",
    hookLane: "intrigue",
    namePattern: null,
    delegatesToShop: null,
    tavern: false,
  },
  garrison: {
    label: "Garrison",
    functionLine: "watch, order, the town's sanctioned violence, filed in triplicate",
    proprietorRoleHint: "watch-captain",
    patronsLane: "guards",
    economyTie: "none",
    hookLane: "law",
    namePattern: null,
    delegatesToShop: null,
    tavern: false,
  },
  court: {
    label: "Court",
    functionLine: "judgment, record, the place disputes go to become official",
    proprietorRoleHint: "magistrate",
    patronsLane: "petitioners",
    economyTie: "none",
    hookLane: "law",
    namePattern: null,
    delegatesToShop: null,
    tavern: false,
  },
  bathhouse: {
    label: "Bathhouse",
    functionLine: "steam, gossip undressed of rank, a rare truce between strangers",
    proprietorRoleHint: "bath-keeper",
    patronsLane: "mixed-clientele",
    economyTie: "none",
    hookLane: "rumor",
    namePattern: null,
    delegatesToShop: null,
    tavern: false,
  },
  "gambling-den": {
    label: "Gambling Den",
    functionLine: "dice, cards, debts that outlive the hand that lost them",
    proprietorRoleHint: "den-runner",
    patronsLane: "gamblers-and-toughs",
    economyTie: "faction",
    hookLane: "debt",
    namePattern: null,
    delegatesToShop: null,
    tavern: false,
  },
  warehouse: {
    label: "Warehouse",
    functionLine: "crates stacked to the rafters; whatever's inside is somebody's whole margin",
    proprietorRoleHint: "warehouse-foreman",
    patronsLane: "laborers",
    economyTie: "goods",
    hookLane: "smuggling",
    namePattern: null,
    delegatesToShop: null,
    tavern: false,
  },
  "dock-house": {
    label: "Dock-House",
    functionLine: "harbor business, tide-tables, cargo manifests that don't always match the hold",
    proprietorRoleHint: "harbormaster",
    patronsLane: "sailors-and-dockers",
    economyTie: "goods",
    hookLane: "smuggling",
    namePattern: null,
    delegatesToShop: null,
    tavern: false,
  },
  // shop kinds delegate to makeShop (docs/URBAN-FABRIC.md §1: "the kit adds the room around the
  // counter") — economy.js's SHOP_ARCHETYPES already owns stock/pricing; never a parallel system.
  smithy: {
    label: "Smithy",
    functionLine: "the forge-heat, the ring of hammer on steel, edges made and mended",
    proprietorRoleHint: "smith",
    patronsLane: "customers",
    economyTie: "shop",
    hookLane: "commerce",
    namePattern: null,
    delegatesToShop: "smith",
    tavern: false,
  },
  apothecary: {
    label: "Apothecary",
    functionLine: "dried herbs, tinctures, a cure or a poison depending who's asking",
    proprietorRoleHint: "apothecary",
    patronsLane: "customers",
    economyTie: "shop",
    hookLane: "commerce",
    namePattern: null,
    delegatesToShop: "apothecary",
    tavern: false,
  },
  general: {
    label: "General Store",
    functionLine: "rope, rations, nails — the unglamorous stuff a party actually runs out of",
    proprietorRoleHint: "shopkeeper",
    patronsLane: "customers",
    economyTie: "shop",
    hookLane: "commerce",
    namePattern: null,
    delegatesToShop: "general",
    tavern: false,
  },
  arcanist: {
    label: "Arcanist's Shop",
    functionLine: "components, scrolls, a proprietor who prices curiosity by the ounce",
    proprietorRoleHint: "arcanist",
    patronsLane: "customers",
    economyTie: "shop",
    hookLane: "commerce",
    namePattern: null,
    delegatesToShop: "arcanist",
    tavern: false,
  },
};

/* BUILDING_KIT_TYPES — the enumerated v1 type ids (docs/URBAN-FABRIC.md §1 "~12 types"), the
   canonical list rollBuilding validates against. Kept in sync with BUILDING_KITS' keys by hand
   (a small, hand-authored catalog — no generator needed). */
const BUILDING_KIT_TYPES = Object.keys(BUILDING_KITS);
