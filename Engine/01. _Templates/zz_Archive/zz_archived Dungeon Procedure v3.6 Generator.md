> [!info] Dungeon Procedure v3.6 Generator
> **To run:** Cmd/Ctrl+P → *Templater: Create new note from template* → pick this file.
> You'll be prompted for a **dungeon name** and **number of segments** (rooms before the finale). The finished sketch lands in `02. Asset Library/Dungeons/Sketches/` automatically.
>
> **One-time setup:** Settings → Templater → Template folder location → set to `Arcana Engine v 0.25/00. Engine/01. _Templates`
>
> **What gets generated:**
> - **◆ Setup** — Type, Origin, Skin, Art Motif + Modifier, Threat Profile, Rest Pressure, Topology, Dungeon Lore (Myth Seed + Legend Distortion)
> - **◆ Rooms** — N segments, each with Space, Lighting, Sensory, Scene, Connections, Dressing, Encounter, Loot, and a Secret. Room 1 also rolls Entry Pressure. Exit counts and room sizes are shaped by Topology.
> - **◆ Social/Contact encounters** include a Narrative Device overlay.
> - **◆ Finale** — Boss + Narrative Device overlay, Finale Type, Revelation, Exit State, Loot, Secret.
>
> v3.6 changes from v3.5: (1) Secrets no longer roll a separate Payoff — tier description already contains payoff info; (2) Loot block added to every room; (3) Topology now drives exit count range and filters out oversized rooms.

<%*
// =============================================================================
// DUNGEON SKETCH GENERATOR — Arcana Engine v0.25 · Dungeon Procedure v3.6
// v3.5: Myth Seed in Setup | Entry Pressure on Room 1 | Narrative Device on
//        Social/Contact + Boss
// v3.6: Secrets payoff linked to tier (no independent roll) | Loot per room |
//        Topology drives exit count range + room size filtering
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

// ─── LOOT TABLE MAP ──────────────────────────────────────────────────────────
// Maps recipe keywords (from Dungeon Loot Composition) to table filenames.

const LOOT_TABLE_MAP = {
  "Junk":            "Dungeon Loot - Junk",
  "Common":          "Dungeon Loot - Common",
  "Minor Resource":  "Dungeon Loot - Minor Resource",
  "Minor Resources": "Dungeon Loot - Minor Resource",
  "Rare":            "Dungeon Loot - Rare",
  "Legendary":       "Dungeon Loot - Legendary",
  "Other-Worldly":   "Dungeon Loot - Outlandish",
};

// ─── TOPOLOGY PROFILES ───────────────────────────────────────────────────────
// exits: [min, max] range for random exit count per room.
// size:  "small" = filter out 40ft+ rooms | "medium" = any | "any" = any

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

// ─── USER INPUT ──────────────────────────────────────────────────────────────

const dungeonName = await tp.system.prompt("Dungeon Name");
if (!dungeonName) { new Notice("Dungeon generation cancelled."); return; }

const segStr = await tp.system.prompt("How many segments? (not counting the finale)", "3");
const segCount = Math.max(1, Math.min(9, parseInt(segStr) || 3));
const totalRooms = segCount + 1;

// ─── SETUP ROLLS ─────────────────────────────────────────────────────────────

const [typeArch, typeAtmo]      = await pick("Dungeon Type",                1, 3);
const [originCat, originFlav]   = await pick("Dungeon Origin",              1, 3);
const [skinName,  skinVis]      = await pick("Dungeon Environment Skin",    1, 2);
const [motifName, motifDesc]    = await pick("Dungeon Art Motif",           1, 2);
const [modName,   modDesc]      = await pick("Dungeon Art Motif Modifier",  1, 2);
const [threatArch,threatBeh]    = await pick("Dungeon Threat Profile",      1, 2);
const [restName,  restDesc]     = await pick("Dungeon Rest Complications",  1, 2);
const [topoName,  topoDesc]     = await pick("Dungeon Topology",            1, 2);
const [mythSeed]                = await pick("Myth Seeds",                  1);
const [witnessDistort]          = await pick("Witness Distortion Table",    1);

// Derive topology profile for room generation
const topoProfile = TOPOLOGY_PROFILE[topoName] || DEFAULT_TOPO;

const setup = {
  type:       `${typeArch} — *${typeAtmo}*`,
  origin:     `${originCat} — *${originFlav}*`,
  skin:       `${skinName} — *${skinVis}*`,
  artMotif:   `${motifName} — *${motifDesc}*`,
  motifMod:   `${modName} — *${modDesc}*`,
  threat:     `${threatArch} — *${threatBeh}*`,
  rest:       `${restName} — *${restDesc}*`,
  topology:   `**${topoName}** — ${topoDesc}`,
  mythLore:   `*${mythSeed}*`,
  distortion: `*${witnessDistort}*`,
};

// ─── CONNECTIONS ─────────────────────────────────────────────────────────────
// Exit labels extended to support 4–5 exits (possible in Hub topology).

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

async function buildEncounter() {
  const [encType] = await pick("Dungeon Encounter Type", 1);

  if (encType.includes("Enemy") || encType.includes("Faction")) {
    const [enemy]                       = await pick("Dungeon Enemy Category",    1);
    const [compName, compRoster, compT] = await pick("Dungeon Enemy Composition", 1, 2, 3);
    const [terrain]                     = await pick("Dungeon Tactical Terrain",  1);
    return `**Encounter: Enemy**
- *${enemy}*
- Composition: ${compName} — ${compRoster} | *${compT}*
- Tactical: ${terrain}`;
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
// v3.6: Payoff is NOT rolled separately. The tier description already contains
// what the secret yields. Rolling payoff independently produced tier/payoff
// mismatches (e.g. "Mythic secret | Payoff: Standard"). Removed.

async function buildSecret() {
  const [tier, tierDesc]           = await pick("Dungeon Secret Tier",       1, 2);
  const [revealName, revealSkills] = await pick("Dungeon Secret Reveal Type", 1, 2);

  return `**Secret:** ${tier} — *${formatSecretDesc(tierDesc)}*
Reveal via: ${revealName} — ${revealSkills}`;
}

// ─── LOOT ────────────────────────────────────────────────────────────────────
// v3.6: Rolls from Dungeon Loot Composition (bundle type + recipe), then pulls
// actual items from the referenced sub-tables.

async function buildLoot() {
  const [bundleName, recipe] = await pick("Dungeon Loot Composition", 1, 2);

  if (!recipe || recipe.toLowerCase().includes("no loot")) {
    return `**Loot:** —`;
  }

  // Parse "Roll 1 Rare + 1 Common + 1 Junk" → [[tableName, count], ...]
  const parts = recipe.replace(/^Roll\s+/i, "").replace(/\.$/, "").split(/\s*\+\s*/);
  const lines = [];

  for (const part of parts) {
    const match = part.match(/^(\d+)\s+(.+)$/);
    if (!match) continue;
    const count    = parseInt(match[1]);
    const typeName = match[2].trim();
    const tableName = LOOT_TABLE_MAP[typeName];

    if (!tableName) {
      lines.push(`- ${count}× ${typeName}`);
      continue;
    }

    for (let i = 0; i < count; i++) {
      const [itemName, itemDesc] = await pick(tableName, 1, 2);
      if (itemName) lines.push(`- **${itemName}** — *${itemDesc}*`);
    }
  }

  if (!lines.length) return `**Loot:** —`;
  return `**Loot:** ${bundleName}\n${lines.join("\n")}`;
}

// ─── ROOM GENERATION ─────────────────────────────────────────────────────────

async function generateRoom(roomNum, label, isEntry, topoProf) {
  // Topology-aware area type (size filtered) and exit count
  const [areaType, dims, side] = await pickAreaType(topoProf.size);
  const [lighting, lightFlavor]   = await pick("Dungeon Lighting",   1, 2);
  const [sensory]                 = await pick("Dungeon Sensory",    1);
  const [scene]                   = await pick("Dungeon Scene",      1);

  const [minEx, maxEx] = topoProf.exits;
  const numExits = minEx + Math.floor(Math.random() * (maxEx - minEx + 1));
  const conns    = await buildConnections(numExits);
  const exitWord = numExits === 1 ? "exit" : "exits";

  const [d1]               = await pick("Dungeon Set Dressing",           1);
  const [c1]               = await pick("Dungeon Set Dressing Condition", 2);
  const [d2]               = await pick("Dungeon Set Dressing",           1);
  const [c2]               = await pick("Dungeon Set Dressing Condition", 2);
  const [objName, objFl]   = await pick("Dungeon Interactable Object",    1, 2);
  const [featName, featFl] = await pick("Dungeon Feature",                1, 2);

  const encounter = await buildEncounter();
  const loot      = await buildLoot();
  const secret    = await buildSecret();
  const labelStr  = label ? ` *(${label})*` : "";

  // Entry Pressure: Room 1 only
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
- **Feature:** ${featName} — ${featFl}

${encounter}

${loot}

${secret}

---`;
}

async function generateFinale(roomNum, topoProf) {
  const [areaType, dims, side]    = await pickAreaType(topoProf.size);
  const [lighting, lightFlavor]   = await pick("Dungeon Lighting",   1, 2);
  const [sensory]                 = await pick("Dungeon Sensory",    1);
  const [scene]                   = await pick("Dungeon Scene",      1);

  // Finale always has exactly 1 exit
  const [doorType]  = await pick("Dungeon Door Type",  1);
  const [doorState] = await pick("Dungeon Door State", 1);

  const [d1]               = await pick("Dungeon Set Dressing",           1);
  const [c1]               = await pick("Dungeon Set Dressing Condition", 2);
  const [d2]               = await pick("Dungeon Set Dressing",           1);
  const [c2]               = await pick("Dungeon Set Dressing Condition", 2);
  const [objName, objFl]   = await pick("Dungeon Interactable Object",    1, 2);
  const [featName, featFl] = await pick("Dungeon Feature",                1, 2);

  const [finaleType, finaleDesc] = await pick("Dungeon Finale Type",    1, 3);
  const [bossArch,   bossBeh]    = await pick("Dungeon Boss",           1, 2);
  const [revelation]             = await pick("Dungeon Revelation",     1);
  const [exitState]              = await pick("Dungeon Exit State",     1);

  const bossDevice = rnd(NARRATIVE_DEVICES_BOSS);
  const loot       = await buildLoot();
  const secret     = await buildSecret();

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
- **Feature:** ${featName} — ${featFl}

**Finale Type:** ${finaleType} — *${finaleDesc}*

**Boss:** ${bossArch} — *${bossBeh}*
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
  roomBlocks.push(await generateRoom(i, label, i === 1, topoProfile));
}
roomBlocks.push(await generateFinale(totalRooms, topoProfile));

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
| **Threat Profile** | ${setup.threat} |
| **Rest Pressure** | ${setup.rest} |
| **Topology** | ${setup.topology} |
| **Dungeon Lore** | ${setup.mythLore} |
| **Legend Distorted** | ${setup.distortion} |

---

## ◆ Rooms

---

${roomBlocks.join("\n\n")}

*Generated with Arcana Engine v0.25 — Dungeon Procedure v3.6*
`;

// ─── MOVE TO SKETCHES FOLDER ─────────────────────────────────────────────────

const destPath = `${SKETCHES_FOLDER}/Dungeon Sketch — ${dungeonName}`;
await tp.file.move(destPath);
%>
