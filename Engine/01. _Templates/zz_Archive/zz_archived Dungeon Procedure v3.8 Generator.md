> [!info] Dungeon Procedure v3.8 Generator
> **To run:** Cmd/Ctrl+P → *Templater: Create new note from template* → pick this file.
> You'll be prompted for a **dungeon name** and **number of segments** (rooms before the finale). The finished sketch lands in `02. Asset Library/Dungeons/Sketches/` automatically.
>
> **One-time setup:** Settings → Templater → Template folder location → set to `Arcana Engine v 0.25/00. Engine/01. _Templates`
>
> **What gets generated:**
> - **◆ Setup** — Type, Origin, Skin, Art Motif + Modifier, Threat Identity, Rest Pressure, Topology, Dungeon Lore, **Dungeon Haul** (full loot budget summary).
> - **◆ Rooms** — N segments with Space, Lighting, Sensory, Scene, Connections, Dressing, Encounter, Loot, Secret. Room 1 adds Entry Pressure. Exit counts and room sizes shaped by Topology.
> - **◆ Enemy encounters:** 75% pull from Threat Identity creature pool (CR-weighted); 25% pull from Enemy Category as a "Complication."
> - **◆ Social/Contact encounters** include a Narrative Device overlay.
> - **◆ Finale** — Threat Boss creature + Boss behavioral archetype + Narrative Device, Finale Type, Revelation, Exit State, Loot, Secret.
>
> v3.8 changes from v3.7: Replaced per-room random loot with a **budget loot system**. At generation time a loot deck is built (1 Apex + scaled Rare/Common/Minor Resource/Junk/Empty tiers), shuffled, and dealt round-robin to rooms. Every room gets at least one slot; empty slots pull from the Dungeon Loot Empty flavor table rather than printing nothing. The Setup table shows a **Dungeon Haul** summary of the full budget. Also fixes a column-index bug in v3.6–v3.7 where Legendary and Other-Worldly items returned their tier/origin field instead of their description.

<%*
// =============================================================================
// DUNGEON SKETCH GENERATOR — Arcana Engine v0.25 · Dungeon Procedure v3.8
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
// =============================================================================

const SKETCHES_FOLDER = "Arcana Engine v 0.25/02. Asset Library/Dungeons/Sketches";

// ─── NARRATIVE DEVICE POOLS ──────────────────────────────────────────────────

const NARRATIVE_DEVICES_CONTACT = [
  "Unwilling Accomplice",
  "Misguided Savior",
  "Hidden Patron",
  "Social Leverage",
  "Misidentified Villain",
];

const NARRATIVE_DEVICES_BOSS = [
  "Misguided Savior",
  "Hidden Patron",
  "Misidentified Villain",
  "Unwilling Accomplice",
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

// pickAreaType: filters rows by room size if topology requires it.
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
    apex:  1,                                              // always 1 high-tier item
    rare:  Math.max(0, Math.floor(segCount / 3)),         // +1 per 3 segments
    common: Math.max(1, Math.floor(rooms * 0.4)),         // ~40% of rooms, min 1
    minor: Math.max(0, Math.floor(rooms * 0.25)),         // ~25% of rooms
    junk:  Math.max(0, Math.floor(rooms * 0.15)),         // ~15% of rooms
    empty: Math.max(2, Math.round(rooms * 0.55)),         // ~55% of rooms, min 2
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
  // Fisher-Yates shuffle — fully random, no positional bias
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Deal round-robin to rooms. Rooms with more total cards than others get the
// overflow; rooms with fewer cards still have at least one slot unless the deck
// is shorter than the room count (handled by buildLootBlock fallback).
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

// Resolve a single tier token to { label, name, desc }.
// label is null for tiers we don't prefix in the output (common, minor, empty).
async function resolveLootSlot(tier) {
  if (tier === "apex") {
    if (Math.random() < 0.6) {
      // Legendary: name=col1, description=col3 (col2 is the Tier range)
      const [name, desc] = await pick("Dungeon Loot - Legendary", 1, 3);
      return { label: "Legendary", name, desc };
    } else {
      // Outlandish: name=col1, description=col3 (col2 is Origin)
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
  // empty — pull from the flavor table; no label, no bold
  const [name, desc] = await pick("Dungeon Loot Empty", 1, 2);
  return { label: null, name, desc };
}

// Build the full loot block for a room from its assigned loot card array.
// If the room received no cards (can happen if deck < numRooms), fall back to
// a single Empty flavor pull rather than printing nothing.
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

// ─── SETUP ROLLS ─────────────────────────────────────────────────────────────

const [typeArch, typeAtmo]    = await pick("Dungeon Type",                1, 3);
const [originCat, originFlav] = await pick("Dungeon Origin",              1, 3);
const [skinName,  skinVis]    = await pick("Dungeon Environment Skin",    1, 2);
const [motifName, motifDesc]  = await pick("Dungeon Art Motif",           1, 2);
const [modName,   modDesc]    = await pick("Dungeon Art Motif Modifier",  1, 2);
const [restName,  restDesc]   = await pick("Dungeon Rest Complications",  1, 2);
const [topoName,  topoDesc]   = await pick("Dungeon Topology",            1, 2);
const [mythSeed]              = await pick("Myth Seeds",                  1);
const [witnessDistort]        = await pick("Witness Distortion Table",    1);

// Threat Identity — all 7 columns
// cols: 0=Identity | 1=Behavioral Role | 2=Low CR | 3=Mid CR | 4=Boss | 5=Composition Scale | 6=Environmental Signature
const [threatId, threatRole, threatLow, threatMid, threatBoss, threatScale, threatSigns] =
  await pick("Dungeon Threat Identity", 0, 1, 2, 3, 4, 5, 6);

const threatCtx = { id: threatId, role: threatRole, low: threatLow, mid: threatMid, boss: threatBoss, scale: threatScale, signs: threatSigns };

// Topology profile for room generation
const topoProfile = TOPOLOGY_PROFILE[topoName] || DEFAULT_TOPO;

// ─── LOOT BUDGET ─────────────────────────────────────────────────────────────
// Build deck once at generation time; assign to rooms before loop starts.

const lootBudget      = computeBudget(segCount);
const lootDeck        = buildLootDeck(lootBudget);
const lootAssignments = assignLootToRooms(lootDeck, totalRooms);

const setup = {
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
// v3.7: Enemy encounters use a 75/25 split.
//   75% → pull creature from Threat Identity pool, CR-weighted:
//          ~55% Low CR | ~30% Mid CR | ~15% Boss CR
//   25% → pull from full Dungeon Enemy Category table (labeled "Complication")
// Enemy Composition + Tactical Terrain still roll per encounter.

async function buildEncounter(threatCtx) {
  const [encType] = await pick("Dungeon Encounter Type", 1);

  if (encType.includes("Enemy") || encType.includes("Faction")) {
    const [compName, compRoster, compT] = await pick("Dungeon Enemy Composition", 1, 2, 3);
    const [terrain]                     = await pick("Dungeon Tactical Terrain",  1);

    if (Math.random() < 0.75) {
      // Threat pool — CR-weighted
      const crRoll = Math.random();
      let creature, crLabel;
      if (crRoll < 0.55) {
        creature = pickFromPool(threatCtx.low);  crLabel = "Low CR";
      } else if (crRoll < 0.85) {
        creature = pickFromPool(threatCtx.mid);  crLabel = "Mid CR";
      } else {
        creature = pickFromPool(threatCtx.boss); crLabel = "Boss CR";
      }
      return `**Encounter: Enemy** *(${threatCtx.id} — ${crLabel})*
- *${creature}*
- Composition: ${compName} — ${compRoster} | *${compT}*
- Tactical: ${terrain}`;
    } else {
      // Complication — full Enemy Category table
      const [enemy] = await pick("Dungeon Enemy Category", 1);
      return `**Encounter: Enemy** *(Complication)*
- *${enemy}*
- Composition: ${compName} — ${compRoster} | *${compT}*
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
    const device = rnd(NARRATIVE_DEVICES_CONTACT);
    return `**Encounter: Social / Contact**
- *${entity} — ${hook}*
- **Narrative Device:** ${device}`;
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

async function generateRoom(roomNum, label, isEntry, topoProf, threatCtx, lootCards) {
  const [areaType, dims, side]  = await pickAreaType(topoProf.size);
  const [lighting, lightFlavor] = await pick("Dungeon Lighting",   1, 2);
  const [sensory]               = await pick("Dungeon Sensory",    1);
  const [scene]                 = await pick("Dungeon Scene",      1);

  const [minEx, maxEx] = topoProf.exits;
  const numExits = minEx + Math.floor(Math.random() * (maxEx - minEx + 1));
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
  const [bossArch,   bossBeh]    = await pick("Dungeon Boss",        1, 2);
  const [revelation]             = await pick("Dungeon Revelation",  1);
  const [exitState]              = await pick("Dungeon Exit State",  1);

  // 90% threat boss creature; 10% fall back to boss archetype name as creature
  const bossCreature = (Math.random() < 0.90)
    ? pickFromPool(threatCtx.boss)
    : bossArch;
  const bossDevice = rnd(NARRATIVE_DEVICES_BOSS);

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
**Boss Device:** ${bossDevice}

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
  // lootAssignments is 0-indexed; rooms are 1-indexed
  roomBlocks.push(await generateRoom(i, label, i === 1, topoProfile, threatCtx, lootAssignments[i - 1]));
}
// Finale gets the last assignment slot (index totalRooms - 1)
roomBlocks.push(await generateFinale(totalRooms, topoProfile, threatCtx, lootAssignments[totalRooms - 1]));

// ─── ASSEMBLE NOTE ───────────────────────────────────────────────────────────

tR = `---
tags: [dungeon, sketch, arcana-engine]
rooms: ${totalRooms}
status: sketch
---

# Dungeon Sketch — ${dungeonName}

> Design-first. Override anything that doesn't serve the room. All rolls optional.

---

## ◆ Setup

| | |
|:--|:--|
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

*Generated with Arcana Engine v0.25 — Dungeon Procedure v3.8*
`;

// ─── MOVE TO SKETCHES FOLDER ─────────────────────────────────────────────────

const destPath = `${SKETCHES_FOLDER}/Dungeon Sketch — ${dungeonName}`;
await tp.file.move(destPath);
%>
