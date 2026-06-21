> [!info] Dungeon Procedure v3.9 Generator
> **To run:** Cmd/Ctrl+P → *Templater: Create new note from template* → pick this file.
> You'll be prompted for a **dungeon name**, **number of segments** (rooms before the finale), and **play tier** (1 = Local Heroes lv 1–4, 2 = Heroes of the Realm lv 5–9). The finished sketch lands in `02. Asset Library/Dungeons/Sketches/` automatically.
>
> **One-time setup:** Settings → Templater → Template folder location → set to `Arcana Engine v 0.25/00. Engine/01. _Templates`
>
> **What gets generated:**
> - **◆ Setup** — Type, Origin, Skin, Art Motif + Modifier, Threat Identity (tier-appropriate), Rest Pressure, Topology, Dungeon Lore, Dungeon Haul.
> - **◆ Rooms** — N segments with Space, Lighting, Sensory, Scene, Connections, Dressing, Encounter, Loot, Secret. Room 1 adds Entry Pressure. Exit counts shaped by Topology; semantically constrained room types (Four-Way Intersection, T-Junction, Dead-End Chamber, etc.) override topology for correct exit counts.
> - **◆ Enemy encounters:** 75% composition-first from Threat Identity creature pool (slots filled by composition type via SLOT_MAP); 25% pull directly from Enemy Category as a Complication (no composition roll). Interrupted Conflict auto-pulls two Category entries as opposing factions — no re-roll prompt.
> - **◆ Social/Contact encounters** include a full Narrative Device pull (name, core situation, player misread, DM leverage).
> - **◆ Finale** — Boss archetype filtered by Myth Seed affinity; Revelation filtered by Myth Seed affinity; Narrative Device from table with full operational detail; Finale Type, Exit State, Loot, Secret.
>
> v3.9 changes from v3.8: Tier prompt selects T1/T2 threat table. Composition-first encounter model with SLOT_MAP replaces creature-first. Category-as-encounter for complication pulls (no composition layered on top). Interrupted Conflict auto-generates two faction entries. Room semantic exit validation. Myth Seed affinity columns bias Boss archetype and Revelation pulls in the finale. Narrative Device migrated from inline arrays to full table pick with operational columns.

<%*
// =============================================================================
// DUNGEON SKETCH GENERATOR — Arcana Engine v0.25 · Dungeon Procedure v3.9
// v3.5: Myth Seed in Setup | Entry Pressure on Room 1 | Narrative Device on
//        Social/Contact + Boss
// v3.6: Secrets payoff linked to tier | Loot per room |
//        Topology drives exit count range + room size filtering
// v3.7: Dungeon Threat Profile → Dungeon Threat Identity (creature-specific
//        packages) | 75/25 threat/complication enemy split | CR-weighted pool
//        pulls | Finale shows threat boss creature + behavioral archetype
// v3.8: Budget loot system (deck built at generation, dealt to rooms) |
//        Empty slots use Dungeon Loot Empty flavor table |
//        Setup shows Dungeon Haul summary | Fix: Legendary/Outlandish col index
// v3.9: Tier prompt → T1 (lv 1–4) or T2 (lv 5–9) threat tables |
//        Composition-first encounter model + SLOT_MAP |
//        Category-as-encounter for complication pulls |
//        Interrupted Conflict auto-generates two faction entries |
//        Room semantic exit validation (EXIT_CONSTRAINTS) |
//        Myth Seed affinity columns filter Boss + Revelation in finale |
//        Narrative Device migrated to table pick with full operational columns
// =============================================================================

const SKETCHES_FOLDER = "Arcana Engine v 0.25/02. Asset Library/Dungeons/Sketches";

// ─── COMPOSITION SLOT MAP ────────────────────────────────────────────────────
// Maps composition name → ordered array of CR tier labels to fill from threat
// pool. Each entry in the array pulls one creature from that tier.
// null = special handling (Interrupted Conflict).

const SLOT_MAP = {
  "The Horde":                ["low"],
  "The Staggered Mob":        ["low"],
  "Frontline & Shooter":      ["mid", "low"],
  "The Ambush":               ["mid"],
  "Boss & Fodder":            ["boss", "low"],
  "Boss & Guards":            ["boss", "mid"],
  "The Controller & Thralls": ["mid", "low"],
  "The Elite Pair":           ["mid"],
  "The Solo Threat":          ["boss"],
  "Interrupted Conflict":     null,
};

// ─── EXIT CONSTRAINTS ────────────────────────────────────────────────────────
// Certain area types have a semantically fixed exit count that overrides the
// topology profile range. Checked in order; first match wins.

const EXIT_CONSTRAINTS = [
  { pattern: /four-way/i,          exits: 4 },
  { pattern: /cross-shaped hall/i, exits: 4 },
  { pattern: /convergence chamber/i, exits: 4 },
  { pattern: /t-?shaped chamber/i, exits: 3 },
  { pattern: /t-?junction/i,       exits: 3 },
  { pattern: /dead-end/i,          exits: 1 },
];

// ─── TOPOLOGY PROFILES ───────────────────────────────────────────────────────
// exits: [min, max] range for random exit count per room.
// size:  "small" = filter out 40ft+ rooms | "medium" = filter out 50ft+ | "any" = no filter

const TOPOLOGY_PROFILE = {
  "The Spine":              { exits: [1, 2], size: "any"    },
  "The Branch":             { exits: [1, 3], size: "any"    },
  "The Loop":               { exits: [2, 3], size: "medium" },
  "The Figure-8":           { exits: [2, 3], size: "medium" },
  "The Hub":                { exits: [1, 5], size: "any"    },
  "The Web":                { exits: [2, 4], size: "medium" },
  "The Cascade":            { exits: [1, 2], size: "any"    },
  "The Onion":              { exits: [1, 3], size: "any"    },
  "The Stronghold":         { exits: [2, 3], size: "medium" },
  "The Ruin":               { exits: [1, 3], size: "any"    },
  "The Convergence":        { exits: [1, 2], size: "any"    },
  "The Labyrinth Fragment": { exits: [2, 3], size: "small"  },
};
const DEFAULT_TOPO = { exits: [1, 3], size: "any" };

// ─── TABLE READER ────────────────────────────────────────────────────────────

async function readTable(filename) {
  const tfile = app.vault.getMarkdownFiles().find(f => f.basename === filename);
  if (!tfile) return [];
  const text = await app.vault.read(tfile);
  const rows = [];
  let state = "out";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) {
      if (state === "data") state = "out";
      continue;
    }
    const cells = line.split("|").slice(1, -1);
    const isSep = cells.length > 0 && cells.every(c => /^[\s:]*-+[\s:-]*$/.test(c));
    if (isSep) {
      if (state === "header" || state === "out") state = "data";
      continue;
    }
    if (state === "out")    { state = "header"; continue; }
    if (state === "header") { continue; }
    if (state === "data") {
      const cols = cells.map(c =>
        c.trim().replace(/\*\*/g, "").replace(/^\*|\*$/g, "").replace(/^_|_$/g, "").trim()
      );
      if (cols.some(c => c !== "")) rows.push(cols);
    }
  }
  return rows;
}

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function pick(filename, ...colIndices) {
  const rows = await readTable(filename);
  if (!rows.length) return colIndices.map(i => `[${filename}:col${i}?]`);
  const row = rnd(rows);
  return colIndices.map(i => (row[i] || "").trim());
}

// pickFromPool: given a slash-delimited creature string (e.g. "Ghoul / Wight"),
// picks one option at random. Used for threat pool enemy selection.
function pickFromPool(creatureStr) {
  const options = (creatureStr || "").split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
  if (!options.length) return creatureStr || "[creature?]";
  return rnd(options);
}

// ─── AFFINITY HELPERS ────────────────────────────────────────────────────────
// Used by Myth Seed affinity columns to bias Boss and Revelation picks in the
// finale. Falls back to unconstrained picks if pool is too small.

function parseAffinity(str) {
  return (str || "").split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
}

// pickFilteredBoss: filters Dungeon Boss rows to those whose archetype (col 1)
// matches any name in the affinity list. Falls back to full table if < 3 rows match.
async function pickFilteredBoss(affinity) {
  const rows = await readTable("Dungeon Boss");
  if (!rows.length) return ["[Boss?]", "[Behavior?]"];
  const list = parseAffinity(affinity);
  if (list.length > 0) {
    const filtered = rows.filter(r => list.some(a => (r[1] || "").includes(a)));
    if (filtered.length >= 3) {
      const row = rnd(filtered);
      return [row[1] || "[Boss?]", row[2] || "[Behavior?]"];
    }
  }
  const row = rnd(rows);
  return [row[1] || "[Boss?]", row[2] || "[Behavior?]"];
}

// pickFilteredRevelation: picks from only the row numbers listed in affinity.
// Falls back to full table if < 2 matching rows found.
async function pickFilteredRevelation(affinity) {
  const rows = await readTable("Dungeon Revelation");
  if (!rows.length) return "[Revelation?]";
  const nums = (affinity || "")
    .split(/\s*,\s*/)
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n));
  if (nums.length >= 2) {
    const filtered = rows.filter(r => nums.includes(parseInt((r[0] || "0").trim())));
    if (filtered.length >= 2) return (rnd(filtered)[1] || "").trim();
  }
  return (rnd(rows)[1] || "").trim();
}

// ─── AREA TYPE PICKER ────────────────────────────────────────────────────────
// "small"  = exclude any room with a dimension ≥ 40ft
// "medium" = exclude rooms with a dimension ≥ 50ft (allows up to ~40ft)
// "any"    = no filter
async function pickAreaType(sizePreference) {
  const rows = await readTable("Dungeon Area Type");
  if (!rows.length) return ["[Area?]", "[Dims?]", "[Side?]"];

  let pool = rows;
  if (sizePreference === "small") {
    const filtered = rows.filter(r => !(/\b[4-9]\d'/.test(r[2] || "")));
    if (filtered.length >= 5) pool = filtered;
  } else if (sizePreference === "medium") {
    const filtered = rows.filter(r => !(/\b[5-9]\d'/.test(r[2] || "")));
    if (filtered.length >= 5) pool = filtered;
  }

  const row = rnd(pool);
  return [row[1] || "", row[2] || "", row[3] || ""];
}

function formatSecretDesc(s) {
  return s.replace(/^([^.]+)\.\s*/, "$1 — ").replace(/\.$/, "");
}

// ─── LOOT BUDGET SYSTEM ──────────────────────────────────────────────────────
// v3.8: Instead of rolling loot independently per room, a deck is built at
// generation time from a budget scaled to dungeon size, shuffled, and dealt
// round-robin to rooms. Empty slots pull from the Dungeon Loot Empty flavor
// table so no room is ever silently blank.
//
// Tier resolution column indices (corrected from v3.6–v3.7):
//   Common, Rare, Junk, Minor Resource : col 1 = name, col 2 = description
//   Legendary, Outlandish              : col 1 = name, col 3 = description
//   Dungeon Loot Empty                 : col 1 = name, col 2 = detail

function computeBudget(segCount) {
  const rooms = segCount + 1;
  return {
    apex:  1,
    rare:  Math.max(0, Math.floor(segCount / 3)),
    common: Math.max(1, Math.floor(rooms * 0.4)),
    minor: Math.max(0, Math.floor(rooms * 0.25)),
    junk:  Math.max(0, Math.floor(rooms * 0.15)),
    empty: Math.max(2, Math.round(rooms * 0.55)),
  };
}

function buildLootDeck(budget) {
  const deck = [
    ...Array(budget.apex).fill("apex"),
    ...Array(budget.rare).fill("rare"),
    ...Array(budget.common).fill("common"),
    ...Array(budget.minor).fill("minor"),
    ...Array(budget.junk).fill("junk"),
    ...Array(budget.empty).fill("empty"),
  ];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function assignLootToRooms(deck, numRooms) {
  const roomLoot = Array.from({ length: numRooms }, () => []);
  deck.forEach((card, i) => { roomLoot[i % numRooms].push(card); });
  return roomLoot;
}

function haulSummary(budget) {
  const parts = ["1 Apex"];
  if (budget.rare  > 0) parts.push(`${budget.rare} Rare`);
  if (budget.common > 0) parts.push(`${budget.common} Common`);
  if (budget.minor  > 0) parts.push(`${budget.minor} Minor Resource`);
  if (budget.junk   > 0) parts.push(`${budget.junk} Junk`);
  parts.push(`${budget.empty} Empty (flavor)`);
  return parts.join(" · ");
}

async function resolveLootSlot(tier) {
  if (tier === "apex") {
    if (Math.random() < 0.6) {
      const [name, desc] = await pick("Dungeon Loot - Legendary", 1, 3);
      return { label: "Legendary", name, desc };
    } else {
      const [name, desc] = await pick("Dungeon Loot - Outlandish", 1, 3);
      return { label: "Other-Worldly", name, desc };
    }
  }
  if (tier === "rare") {
    const [name, desc] = await pick("Dungeon Loot - Rare", 1, 2);
    return { label: "Rare", name, desc };
  }
  if (tier === "common") {
    const [name, desc] = await pick("Dungeon Loot - Common", 1, 2);
    return { label: null, name, desc };
  }
  if (tier === "minor") {
    const [name, desc] = await pick("Dungeon Loot - Minor Resource", 1, 2);
    return { label: null, name, desc };
  }
  if (tier === "junk") {
    const [name, desc] = await pick("Dungeon Loot - Junk", 1, 2);
    return { label: "Junk", name, desc };
  }
  const [name, desc] = await pick("Dungeon Loot Empty", 1, 2);
  return { label: null, name, desc };
}

async function buildLootBlock(lootCards) {
  if (!lootCards || lootCards.length === 0) {
    const [name, desc] = await pick("Dungeon Loot Empty", 1, 2);
    return `**Loot:** ${name} — *${desc}*`;
  }

  const lines = [];
  for (const tier of lootCards) {
    const item = await resolveLootSlot(tier);
    if (item.label === "Legendary" || item.label === "Other-Worldly") {
      lines.push(`- **[${item.label}]** ${item.name} — *${item.desc}*`);
    } else if (item.label === "Rare") {
      lines.push(`- **[Rare]** ${item.name} — *${item.desc}*`);
    } else if (item.label === "Junk") {
      lines.push(`- ~~${item.name}~~ — *${item.desc}*`);
    } else {
      lines.push(`- ${item.name} — *${item.desc}*`);
    }
  }

  return `**Loot**\n${lines.join("\n")}`;
}

// ─── USER INPUT ──────────────────────────────────────────────────────────────

const dungeonName = await tp.system.prompt("Dungeon Name");
if (!dungeonName) { new Notice("Dungeon generation cancelled."); return; }

const segStr = await tp.system.prompt("How many segments? (not counting the finale)", "3");
const segCount = Math.max(1, Math.min(9, parseInt(segStr) || 3));
const totalRooms = segCount + 1;

const tierStr = await tp.system.prompt("Play tier? 1 = Local Heroes (lv 1–4) · 2 = Heroes of the Realm (lv 5–9)", "1");
const tier = (tierStr || "1").trim() === "2" ? "T2" : "T1";
const threatTableName = tier === "T2" ? "Dungeon Threat Identity T2" : "Dungeon Threat Identity T1";

// ─── SETUP ROLLS ─────────────────────────────────────────────────────────────

const [typeArch, typeAtmo]    = await pick("Dungeon Type",                1, 3);
const [originCat, originFlav] = await pick("Dungeon Origin",              1, 3);
const [skinName,  skinVis]    = await pick("Dungeon Environment Skin",    1, 2);
const [motifName, motifDesc]  = await pick("Dungeon Art Motif",           1, 2);
const [modName,   modDesc]    = await pick("Dungeon Art Motif Modifier",  1, 2);
const [restName,  restDesc]   = await pick("Dungeon Rest Complications",  1, 2);
const [topoName,  topoDesc]   = await pick("Dungeon Topology",            1, 2);
const [witnessDistort]        = await pick("Witness Distortion Table",    1);

// Myth Seeds — col 1 = seed phrase, col 2 = boss affinity, col 3 = revelation affinity
const [mythSeed, bossAffinity, revelAffinity] = await pick("Myth Seeds", 1, 2, 3);

// Threat Identity — tier-appropriate table, all 7 columns
// cols: 0=d | 1=Identity | 2=Behavioral Role | 3=Low CR | 4=Mid CR | 5=Boss | 6=Composition Scale | 7=Environmental Signature
const [threatId, threatRole, threatLow, threatMid, threatBoss, threatScale, threatSigns] =
  await pick(threatTableName, 1, 2, 3, 4, 5, 6, 7);

const threatCtx = { id: threatId, role: threatRole, low: threatLow, mid: threatMid, boss: threatBoss, scale: threatScale, signs: threatSigns };

// Topology profile for room generation
const topoProfile = TOPOLOGY_PROFILE[topoName] || DEFAULT_TOPO;

// ─── LOOT BUDGET ─────────────────────────────────────────────────────────────

const lootBudget      = computeBudget(segCount);
const lootDeck        = buildLootDeck(lootBudget);
const lootAssignments = assignLootToRooms(lootDeck, totalRooms);

const setup = {
  tier:        tier === "T2" ? "Heroes of the Realm (Lv 5–9)" : "Local Heroes (Lv 1–4)",
  type:        `${typeArch} — *${typeAtmo}*`,
  origin:      `${originCat} — *${originFlav}*`,
  skin:        `${skinName} — *${skinVis}*`,
  artMotif:    `${motifName} — *${motifDesc}*`,
  motifMod:    `${modName} — *${modDesc}*`,
  threatId:    `${threatId} — *${threatRole}*`,
  threatEnemy: `Low: ${threatLow} | Mid: ${threatMid} | Boss: ${threatBoss}`,
  threatScale: threatScale,
  threatSigns: `*${threatSigns}*`,
  rest:        `${restName} — *${restDesc}*`,
  topology:    `**${topoName}** — ${topoDesc}`,
  mythLore:    `*${mythSeed}*`,
  distortion:  `*${witnessDistort}*`,
  haul:        haulSummary(lootBudget),
};

// ─── CONNECTIONS ─────────────────────────────────────────────────────────────

async function buildConnections(numExits) {
  const prefixSets = {
    1: [""],
    2: ["Main: ", "Alt: "],
    3: ["Main: ", "Side: ", "Far: "],
    4: ["Main: ", "Side: ", "Alt: ", "Far: "],
    5: ["Main: ", "Side-A: ", "Side-B: ", "Alt: ", "Far: "],
  };
  const prefixes = prefixSets[Math.min(numExits, 5)] || prefixSets[3];
  const lines = [];
  for (let i = 0; i < numExits; i++) {
    const [doorType]  = await pick("Dungeon Door Type",  1);
    const [doorState] = await pick("Dungeon Door State", 1);
    lines.push(`- ${prefixes[i]}${doorType} | *${doorState}*`);
  }
  return lines.join("\n");
}

// ─── ENCOUNTER ───────────────────────────────────────────────────────────────
// v3.9 encounter model:
//   75% → composition-first: roll composition → SLOT_MAP fills CR slots from
//          threat pool. "Interrupted Conflict" auto-pulls two Category entries
//          as opposing factions; no re-roll prompt.
//   25% → complication: pull directly from Enemy Category. No composition roll.
//          Category entry IS the encounter.
// Social/Contact and Boss encounters pull Narrative Device from table (all columns).

async function buildEncounter(threatCtx) {
  const [encType] = await pick("Dungeon Encounter Type", 1);

  if (encType.includes("Enemy") || encType.includes("Faction")) {
    const [terrain] = await pick("Dungeon Tactical Terrain", 1);

    if (Math.random() < 0.75) {
      // ── COMPOSITION-FIRST PATH ──
      const [compName, compRoster, compT] = await pick("Dungeon Enemy Composition", 1, 2, 3);

      if (compName === "Interrupted Conflict") {
        // Auto-generate two faction entries from Category table
        const [factionA] = await pick("Dungeon Enemy Category", 1);
        const [factionB] = await pick("Dungeon Enemy Category", 1);
        return `**Encounter: Enemy** *(Faction Clash)*
- Faction A: *${factionA}*
- Faction B: *${factionB}*
- *${compT}*
- Tactical: ${terrain}`;
      }

      // Fill creature slots from threat pool using SLOT_MAP
      const slots = SLOT_MAP[compName] || ["low"];
      const creatureLines = [];
      for (const slot of slots) {
        let creature, label;
        if (slot === "low")  { creature = pickFromPool(threatCtx.low);  label = "Low CR"; }
        if (slot === "mid")  { creature = pickFromPool(threatCtx.mid);  label = "Mid CR"; }
        if (slot === "boss") { creature = pickFromPool(threatCtx.boss); label = "Boss CR"; }
        creatureLines.push(`- ${label}: *${creature}*`);
      }

      return `**Encounter: Enemy** *(${threatCtx.id} — ${compName})*
- ${compRoster} | *${compT}*
${creatureLines.join("\n")}
- Tactical: ${terrain}`;

    } else {
      // ── COMPLICATION PATH — Category IS the encounter ──
      const [enemy] = await pick("Dungeon Enemy Category", 1);
      return `**Encounter: Enemy** *(Complication)*
- *${enemy}*
- Tactical: ${terrain}`;
    }
  }

  if (encType.includes("Hazard") || encType.includes("Trap")) {
    const [hazName, hazCheck, hazFx] = await pick("Dungeon Hazard", 1, 2, 3);
    return `**Encounter: Hazard**
- ${hazName} — ${hazCheck} | *${hazFx}*`;
  }

  if (encType.includes("Social") || encType.includes("Contact")) {
    const [entity, hook] = await pick("Dungeon Contact", 1, 3);
    const [devName, devSit, devMisread, devLev] = await pick("Dungeon Narrative Device", 1, 2, 3, 4);
    return `**Encounter: Social / Contact**
- *${entity} — ${hook}*
- **Device:** ${devName} — *${devSit}*
- **Misread:** ${devMisread}
- **Leverage:** ${devLev}`;
  }

  if (encType.includes("Problem") || encType.includes("Lock")) {
    const [obstacle, bypass] = await pick("Dungeon Problem", 1, 2);
    const colonIdx = obstacle.indexOf(":");
    if (colonIdx > -1) {
      const probName = obstacle.slice(0, colonIdx).trim();
      const probDesc = obstacle.slice(colonIdx + 1).trim();
      return `**Encounter: Problem**
- **${probName}** — ${probDesc} *${bypass}*`;
    }
    return `**Encounter: Problem**
- **${obstacle}** — *${bypass}*`;
  }

  const [emptyName, emptyFx] = await pick("Dungeon Empty Result", 2, 3);
  return `**Encounter: Empty**
- ${emptyName} — *${emptyFx}*`;
}

// ─── SECRET ──────────────────────────────────────────────────────────────────

async function buildSecret() {
  const [tier, tierDesc]           = await pick("Dungeon Secret Tier",       1, 2);
  const [revealName, revealSkills] = await pick("Dungeon Secret Reveal Type", 1, 2);
  return `**Secret:** ${tier} — *${formatSecretDesc(tierDesc)}*
Reveal via: ${revealName} — ${revealSkills}`;
}

// ─── ROOM GENERATION ─────────────────────────────────────────────────────────
// Exit count is determined by topology profile, then overridden if the rolled
// area type has a semantic constraint (EXIT_CONSTRAINTS).

async function generateRoom(roomNum, label, isEntry, topoProf, threatCtx, lootCards) {
  const [areaType, dims, side]  = await pickAreaType(topoProf.size);
  const [lighting, lightFlavor] = await pick("Dungeon Lighting",   1, 2);
  const [sensory]               = await pick("Dungeon Sensory",    1);
  const [scene]                 = await pick("Dungeon Scene",      1);

  // Semantic exit override
  const constraint = EXIT_CONSTRAINTS.find(c => c.pattern.test(areaType));
  let numExits;
  if (constraint) {
    numExits = constraint.exits;
  } else {
    const [minEx, maxEx] = topoProf.exits;
    numExits = minEx + Math.floor(Math.random() * (maxEx - minEx + 1));
  }

  const conns    = await buildConnections(numExits);
  const exitWord = numExits === 1 ? "exit" : "exits";

  const [d1]               = await pick("Dungeon Set Dressing",           1);
  const [c1]               = await pick("Dungeon Set Dressing Condition", 2);
  const [d2]               = await pick("Dungeon Set Dressing",           1);
  const [c2]               = await pick("Dungeon Set Dressing Condition", 2);
  const [objName, objFl]             = await pick("Dungeon Interactable Object", 1, 2);
  const [featName, featFl, featDims] = await pick("Dungeon Feature",             1, 2, 3);

  const encounter = await buildEncounter(threatCtx);
  const loot      = await buildLootBlock(lootCards);
  const secret    = await buildSecret();
  const labelStr  = label ? ` *(${label})*` : "";

  let entryPressureBlock = "";
  if (isEntry) {
    const [pressureCat, pressureResult] = await pick("Starting State Pressure", 1, 2);
    entryPressureBlock = `\n**Entry Pressure:** ${pressureCat} — *${pressureResult}*`;
  }

  return `### Room ${roomNum} — ${areaType}${labelStr}
**Space:** ${dims} | ${side}
**Lighting:** ${lighting} — *${lightFlavor}*
**Sensory:** *${sensory}*
**Scene:** *${scene}*${entryPressureBlock}

**Connections** *(${numExits} ${exitWord})*
${conns}

**Dressing**
- ${d1} — *${c1}*
- ${d2} — *${c2}*
- **Object:** ${objName} — ${objFl}
- **Feature:** ${featName} — ${featFl} *(${featDims})*

${encounter}

${loot}

${secret}

---`;
}

// ─── FINALE GENERATION ───────────────────────────────────────────────────────
// Boss archetype filtered by Myth Seed Boss Affinity (falls back to full table).
// Revelation filtered by Myth Seed Revelation Affinity (falls back to full table).
// Narrative Device pulled from table with full operational columns.

async function generateFinale(roomNum, topoProf, threatCtx, lootCards) {
  const [areaType, dims, side]  = await pickAreaType(topoProf.size);
  const [lighting, lightFlavor] = await pick("Dungeon Lighting",   1, 2);
  const [sensory]               = await pick("Dungeon Sensory",    1);
  const [scene]                 = await pick("Dungeon Scene",      1);

  const [doorType]  = await pick("Dungeon Door Type",  1);
  const [doorState] = await pick("Dungeon Door State", 1);

  const [d1]               = await pick("Dungeon Set Dressing",           1);
  const [c1]               = await pick("Dungeon Set Dressing Condition", 2);
  const [d2]               = await pick("Dungeon Set Dressing",           1);
  const [c2]               = await pick("Dungeon Set Dressing Condition", 2);
  const [objName, objFl]             = await pick("Dungeon Interactable Object", 1, 2);
  const [featName, featFl, featDims] = await pick("Dungeon Feature",             1, 2, 3);

  const [finaleType, finaleDesc] = await pick("Dungeon Finale Type", 1, 3);

  // Boss archetype filtered by Myth Seed affinity
  const [bossArch, bossBeh] = await pickFilteredBoss(bossAffinity);

  // Revelation filtered by Myth Seed affinity
  const revelation = await pickFilteredRevelation(revelAffinity);

  const [exitState] = await pick("Dungeon Exit State", 1);

  // 90% threat boss creature; 10% fall back to boss archetype name as creature
  const bossCreature = (Math.random() < 0.90)
    ? pickFromPool(threatCtx.boss)
    : bossArch;

  // Narrative Device — full operational pull from table
  const [devName, devSit, devMisread, devLev] = await pick("Dungeon Narrative Device", 1, 2, 3, 4);

  const loot   = await buildLootBlock(lootCards);
  const secret = await buildSecret();

  return `### Room ${roomNum} — ${areaType} *(Finale)*
**Space:** ${dims} | ${side}
**Lighting:** ${lighting} — *${lightFlavor}*
**Sensory:** *${sensory}*
**Scene:** *${scene}*

**Connections** *(1 exit)*
- ${doorType} | *${doorState}*

**Dressing**
- ${d1} — *${c1}*
- ${d2} — *${c2}*
- **Object:** ${objName} — ${objFl}
- **Feature:** ${featName} — ${featFl} *(${featDims})*

**Finale Type:** ${finaleType} — *${finaleDesc}*

**Boss Creature:** ${bossCreature} *(${threatCtx.id})*
**Boss Archetype:** ${bossArch} — *${bossBeh}*
**Boss Device:** ${devName} — *${devSit}*
**Misread:** ${devMisread}
**Leverage:** ${devLev}

**Revelation:** *${revelation}*

**Exit State:** *${exitState}*

${loot}

${secret}

---`;
}

// ─── MAIN LOOP ────────────────────────────────────────────────────────────────

const roomBlocks = [];
for (let i = 1; i <= segCount; i++) {
  let label = "";
  if (i === 1) label = "Entry";
  else if (segCount >= 5 && i === Math.round(segCount / 2)) label = "Mid-Point";
  roomBlocks.push(await generateRoom(i, label, i === 1, topoProfile, threatCtx, lootAssignments[i - 1]));
}
roomBlocks.push(await generateFinale(totalRooms, topoProfile, threatCtx, lootAssignments[totalRooms - 1]));

// ─── ASSEMBLE NOTE ───────────────────────────────────────────────────────────

tR = `---
tags: [dungeon, sketch, arcana-engine]
rooms: ${totalRooms}
tier: ${tier}
status: sketch
---

# Dungeon Sketch — ${dungeonName}

> Design-first. Override anything that doesn't serve the room. All rolls optional.

---

## ◆ Setup

| | |
|:--|:--|
| **Tier** | ${setup.tier} |
| **Type** | ${setup.type} |
| **Origin** | ${setup.origin} |
| **Skin** | ${setup.skin} |
| **Art Motif** | ${setup.artMotif} |
| **Motif Modifier** | ${setup.motifMod} |
| **Threat Identity** | ${setup.threatId} |
| **↳ Creatures** | ${setup.threatEnemy} |
| **↳ Scale** | ${setup.threatScale} |
| **↳ Signs** | ${setup.threatSigns} |
| **Rest Pressure** | ${setup.rest} |
| **Topology** | ${setup.topology} |
| **Dungeon Lore** | ${setup.mythLore} |
| **Legend Distorted** | ${setup.distortion} |
| **Dungeon Haul** | ${setup.haul} |

---

## ◆ Rooms

---

${roomBlocks.join("\n\n")}

*Generated with Arcana Engine v0.25 — Dungeon Procedure v3.9*
`;

// ─── MOVE TO SKETCHES FOLDER ─────────────────────────────────────────────────

const destPath = `${SKETCHES_FOLDER}/Dungeon Sketch — ${dungeonName}`;
await tp.file.move(destPath);
%>
