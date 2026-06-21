> [!info] Dungeon Procedure v3.5 Generator
> **To run:** Cmd/Ctrl+P → *Templater: Create new note from template* → pick this file.
> You'll be prompted for a **dungeon name** and **number of segments** (rooms before the finale). The finished sketch lands in `02. Asset Library/Dungeons/Sketches/` automatically.
>
> **One-time setup:** Settings → Templater → Template folder location → set to `Arcana Engine v 0.25/00. Engine/01. _Templates`
>
> **Tables update automatically.** This template reads your table files live — any edits you make to a table are reflected the next time you run it. No changes needed here.
>
> **What gets generated:**
> - **◆ Setup** — Type, Origin, Skin, Art Motif + Modifier, Threat Profile, Rest Pressure, Topology, Dungeon Lore (Myth Seed + Legend Distortion)
> - **◆ Rooms** — N segments, each with Space, Lighting, Sensory, Scene, Connections (1–3 exits with door type + state), two Dressing entries + Object + Feature, a full Encounter (Enemy / Hazard / Contact / Problem / Empty), and a Secret with reveal method + payoff tier. **Room 1 also rolls Entry Pressure.**
> - **◆ Social/Contact encounters** include a Narrative Device overlay for moral texture.
> - **◆ Finale** — same structure but with Boss archetype + Narrative Device overlay, Finale Type, Revelation, and Exit State.
>
> Room 1 is tagged *(Entry)*, the middle room gets *(Mid-Point)* if you run 5+ segments, and the last room is *(Finale)*. Override anything — rolls are suggestions, not rules.

<%*
// =============================================================================
// DUNGEON SKETCH GENERATOR — Arcana Engine v0.25 · Dungeon Procedure v3.5
// v3.5 additions:
//   • Myth Seed + Witness Distortion in Setup (dungeon lore hook)
//   • Starting State Pressure on Entry Room (Room 1 only)
//   • Narrative Device overlay on Social/Contact encounters
//   • Narrative Device overlay on Finale Boss
// =============================================================================

const SKETCHES_FOLDER = "Arcana Engine v 0.25/02. Asset Library/Dungeons/Sketches";

// ─── NARRATIVE DEVICE POOL ───────────────────────────────────────────────────
// Defined once, reused for both Contact encounters and Finale Boss.
// Subset scoped to dungeon context (social/moral pressure, not urban-only devices).

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

// ─── TABLE READER ────────────────────────────────────────────────────────────
// Reads a markdown table file, skips header/separator rows, returns data rows.
// Handles tables that start with a separator (no header) and multiple tables
// within a single file.

async function readTable(filename) {
  const tfile = app.vault.getMarkdownFiles().find(f => f.basename === filename);
  if (!tfile) return [];
  const text = await app.vault.read(tfile);
  const rows = [];
  let state = "out"; // out → header → data
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) {
      if (state === "data") state = "out";
      continue;
    }
    // Separator row: every cell contains only - : and spaces
    const cells = line.split("|").slice(1, -1);
    const isSep = cells.length > 0 && cells.every(c => /^[\s:]*-+[\s:-]*$/.test(c));
    if (isSep) {
      if (state === "header" || state === "out") state = "data";
      continue;
    }
    if (state === "out")    { state = "header"; continue; } // first content row = header
    if (state === "header") { continue; }                   // skip extra header rows
    if (state === "data") {
      const cols = cells.map(c =>
        c.trim()
          .replace(/\*\*/g, "")     // strip bold
          .replace(/^\*|\*$/g, "")  // strip leading/trailing italic
          .replace(/^_|_$/g, "")    // strip underscore italic
          .trim()
      );
      if (cols.some(c => c !== "")) rows.push(cols);
    }
  }
  return rows;
}

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// pick(filename, col1, col2, ...) → always returns an array of strings
async function pick(filename, ...colIndices) {
  const rows = await readTable(filename);
  if (!rows.length) return colIndices.map(i => `[${filename}:col${i}?]`);
  const row = rnd(rows);
  return colIndices.map(i => (row[i] || "").trim());
}

// Format secret desc: "Bold Name. rest of text." → "Bold Name — rest of text"
function formatSecretDesc(s) {
  return s.replace(/^([^.]+)\.\s*/, "$1 — ").replace(/\.$/, "");
}

// ─── USER INPUT ──────────────────────────────────────────────────────────────

const dungeonName = await tp.system.prompt("Dungeon Name");
if (!dungeonName) { new Notice("Dungeon generation cancelled."); return; }

const segStr = await tp.system.prompt("How many segments? (not counting the finale)", "3");
const segCount = Math.max(1, Math.min(9, parseInt(segStr) || 3));
const totalRooms = segCount + 1; // segments + finale

// ─── SETUP ROLLS ─────────────────────────────────────────────────────────────

const [typeArch, typeAtmo]      = await pick("Dungeon Type",                1, 3);
const [originCat, originFlav]   = await pick("Dungeon Origin",              1, 3);
const [skinName,  skinVis]      = await pick("Dungeon Environment Skin",    1, 2);
const [motifName, motifDesc]    = await pick("Dungeon Art Motif",           1, 2);
const [modName,   modDesc]      = await pick("Dungeon Art Motif Modifier",  1, 2);
const [threatArch,threatBeh]    = await pick("Dungeon Threat Profile",      1, 2);
const [restName,  restDesc]     = await pick("Dungeon Rest Complications",  1, 2);
const [topoName,  topoDesc]     = await pick("Dungeon Topology",            1, 2);

// v3.5 — Dungeon Lore: Myth Seed + Witness Distortion
const [mythSeed]       = await pick("Myth Seeds",              1);
const [witnessDistort] = await pick("Witness Distortion Table", 1);

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

// ─── ROOM GENERATION ─────────────────────────────────────────────────────────

async function buildConnections(numExits) {
  const prefixes = numExits === 1 ? [""]
                 : numExits === 2 ? ["Main: ", "Alt: "]
                 :                  ["Main: ", "Side: ", "Far: "];
  const lines = [];
  for (let i = 0; i < numExits; i++) {
    const [doorType]  = await pick("Dungeon Door Type",  1);
    const [doorState] = await pick("Dungeon Door State", 1);
    lines.push(`- ${prefixes[i]}${doorType} | *${doorState}*`);
  }
  return lines.join("\n");
}

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

  // v3.5 — Social/Contact now includes a Narrative Device overlay
  if (encType.includes("Social") || encType.includes("Contact")) {
    const [entity, hook] = await pick("Dungeon Contact", 1, 3);
    const device = rnd(NARRATIVE_DEVICES_CONTACT);
    return `**Encounter:** Social / Contact
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
    } else {
      return `**Encounter: Problem**
- **${obstacle}** — *${bypass}*`;
    }
  }

  // Empty
  const [emptyName, emptyFx] = await pick("Dungeon Empty Result", 2, 3);
  return `**Encounter:** Empty
- ${emptyName} — *${emptyFx}*`;
}

async function buildSecret() {
  const [tier, tierDesc]           = await pick("Dungeon Secret Tier",       1, 2);
  const [revealName, revealSkills] = await pick("Dungeon Secret Reveal Type", 1, 2);
  const [payoffSize, payoffDesc]   = await pick("Dungeon Secret Payoff Size", 1, 2);

  const majorTiers = ["Major", "Major+", "Mythic"];
  const payoffFmt  = majorTiers.includes(payoffSize) ? `**${payoffSize}**` : payoffSize;
  const payoffShort = payoffDesc.split(":")[0].replace(/\*\*/g, "").trim();

  return `**Secret:** ${tier} *(${formatSecretDesc(tierDesc)})*
Reveal via: ${revealName} — ${revealSkills} | Payoff: ${payoffFmt} *(${payoffShort.toLowerCase()})*`;
}

// v3.5 — isEntry flag triggers Starting State Pressure roll on Room 1
async function generateRoom(roomNum, label, isEntry = false) {
  const [areaType, dims, side]    = await pick("Dungeon Area Type",  1, 2, 3);
  const [lighting, lightFlavor]   = await pick("Dungeon Lighting",   1, 2);
  const [sensory]                 = await pick("Dungeon Sensory",    1);
  const [scene]                   = await pick("Dungeon Scene",      1);

  const numExits   = Math.floor(Math.random() * 3) + 1;
  const conns      = await buildConnections(numExits);
  const exitWord   = numExits === 1 ? "exit" : "exits";

  const [d1]               = await pick("Dungeon Set Dressing",           1);
  const [c1]               = await pick("Dungeon Set Dressing Condition", 2);
  const [d2]               = await pick("Dungeon Set Dressing",           1);
  const [c2]               = await pick("Dungeon Set Dressing Condition", 2);
  const [objName, objFl]   = await pick("Dungeon Interactable Object",    1, 2);
  const [featName, featFl] = await pick("Dungeon Feature",                1, 2);

  const encounter = await buildEncounter();
  const secret    = await buildSecret();
  const labelStr  = label ? ` *(${label})*` : "";

  // v3.5 — Entry Pressure block (Room 1 only)
  let entryPressureBlock = "";
  if (isEntry) {
    const [pressureCat, pressureResult] = await pick("Starting State Pressure", 1, 2);
    entryPressureBlock = `
**Entry Pressure:** ${pressureCat} — *${pressureResult}*
`;
  }

  return `### Room ${roomNum} — ${areaType}${labelStr}
**Space:** ${dims} | ${side}
**Lighting:** ${lighting} — *${lightFlavor}*
**Sensory:** *${sensory}*
**Scene:** *${scene}*
${entryPressureBlock}
**Connections** *(${numExits} ${exitWord})*
${conns}

**Dressing**
- ${d1} — *${c1}*
- ${d2} — *${c2}*
- **Object:** ${objName} — ${objFl}
- **Feature:** ${featName} — ${featFl}

${encounter}

${secret}

---`;
}

async function generateFinale(roomNum) {
  const [areaType, dims, side]    = await pick("Dungeon Area Type",  1, 2, 3);
  const [lighting, lightFlavor]   = await pick("Dungeon Lighting",   1, 2);
  const [sensory]                 = await pick("Dungeon Sensory",    1);
  const [scene]                   = await pick("Dungeon Scene",      1);

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
  const secret                   = await buildSecret();

  // v3.5 — Narrative Device overlay on Boss
  const bossDevice = rnd(NARRATIVE_DEVICES_BOSS);

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

${secret}

---`;
}

// ─── MAIN LOOP ────────────────────────────────────────────────────────────────

const roomBlocks = [];
for (let i = 1; i <= segCount; i++) {
  let label = "";
  if (i === 1) label = "Entry";
  else if (segCount >= 5 && i === Math.round(segCount / 2)) label = "Mid-Point";
  // v3.5 — pass isEntry flag for Room 1
  roomBlocks.push(await generateRoom(i, label, i === 1));
}
roomBlocks.push(await generateFinale(totalRooms));

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

*Generated with Arcana Engine v0.25 — Dungeon Procedure v3.5*
`;

// ─── MOVE TO SKETCHES FOLDER ─────────────────────────────────────────────────

const destPath = `${SKETCHES_FOLDER}/Dungeon Sketch — ${dungeonName}`;
await tp.file.move(destPath);
%>
