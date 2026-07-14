> [!info] Dungeon Procedure v4.1 Generator
> **To run:** Cmd/Ctrl+P → *Templater: Create new note from template* → pick this file.
> You'll be prompted for dungeon name, segment count, and play tier. The generator creates a **subfolder** in Sketches containing individual room notes, a `.canvas` topology map, and an index overview note. Open the canvas to see all rooms pre-positioned and connected by topology.
>
> **One-time setup:** Settings → Templater → Template folder location → `Arcana Engine v 0.25/00. Engine/01. _Templates`
>
> **What gets generated:**
> - **`{name}.canvas`** — rooms as linked cards, positioned by BFS depth, connected by topology edges. Open in Obsidian Canvas for live play reference or drag to rearrange.
> - **`R{nn} — {label}.md`** — one note per room. Contains all room content (space, lighting, sensory, scene, connections with named targets, dressing, encounter, loot, secret). Entry Pressure on Room 1.
> - **`{name}.md`** — index note with full Setup table and room roster.
>
> v4.1 changes from v4.0: Discovery and Lore encounter branches added to buildEncounter(). Discovery rolls Form + Content independently (50×50 combinations). Lore uses a single roll indexing Dungeon Lore Content and Dungeon Lore Art at the same position — the art directly depicts the lore revelation. Dungeon Scene expanded to d36 with 7 distinct registers. Encounter type weights rebalanced.

<%*
// =============================================================================
// DUNGEON SKETCH GENERATOR — Arcana Engine v0.25 · Dungeon Procedure v4.1
// v4.1: Discovery and Lore encounter branches. Discovery = Form × Content
//       (independent picks, 2500 combinations). Lore = single roll indexing
//       Dungeon Lore Content and Dungeon Lore Art at same position.
//       Scene d36 with 7 registers. Rebalanced encounter type weights.
// v4.0: Graph-first topology. Each topology builds a real connection graph.
//       Rooms generated as individual notes. Canvas file positions rooms by
//       BFS depth and connects them with edges. Two-pass generation.
//       All 12 topology types. Fallback chain for undersized dungeons.
// =============================================================================

const SKETCHES_FOLDER = "Arcana Engine v 0.25/02. Asset Library/Dungeons/Sketches";

// ─── COMPOSITION SLOT MAP ────────────────────────────────────────────────────

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

// ─── TOPOLOGY CONFIG ─────────────────────────────────────────────────────────

const TOPO_SIZE = {
  "The Spine": "any", "The Branch": "any", "The Cascade": "any", "The Ruin": "any",
  "The Loop": "medium", "The Hub": "any", "The Stronghold": "medium",
  "The Figure-8": "medium", "The Convergence": "any", "The Onion": "any",
  "The Web": "medium", "The Labyrinth Fragment": "small",
};

const TOPOLOGY_MIN_SEGS = {
  "The Spine": 1, "The Cascade": 1,
  "The Branch": 2, "The Ruin": 2,
  "The Loop": 3, "The Hub": 3, "The Stronghold": 3,
  "The Convergence": 4, "The Onion": 4, "The Web": 4,
  "The Figure-8": 5, "The Labyrinth Fragment": 5,
};

const TOPOLOGY_FALLBACK = {
  "The Figure-8": "The Loop", "The Labyrinth Fragment": "The Web",
  "The Web": "The Loop", "The Convergence": "The Loop", "The Onion": "The Loop",
  "The Loop": "The Branch", "The Hub": "The Branch",
  "The Stronghold": "The Branch", "The Ruin": "The Branch",
  "The Branch": "The Spine", "The Cascade": "The Spine",
};

// ─── TABLE READER ────────────────────────────────────────────────────────────

async function readTable(filename) {
  const tfile = app.vault.getMarkdownFiles().find(f => f.basename === filename);
  if (!tfile) return [];
  const text = await app.vault.read(tfile);
  const rows = [];
  let state = "out";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) { if (state === "data") state = "out"; continue; }
    const cells = line.split("|").slice(1, -1);
    const isSep = cells.length > 0 && cells.every(c => /^[\s:]*-+[\s:-]*$/.test(c));
    if (isSep) { if (state === "header" || state === "out") state = "data"; continue; }
    if (state === "out")    { state = "header"; continue; }
    if (state === "header") { continue; }
    if (state === "data") {
      const cols = cells.map(c => c.trim().replace(/\*\*/g, "").replace(/^\*|\*$/g, "").replace(/^_|_$/g, "").trim());
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

function pickFromPool(creatureStr) {
  const options = (creatureStr || "").split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
  return options.length ? rnd(options) : (creatureStr || "[creature?]");
}

// ─── AFFINITY HELPERS ────────────────────────────────────────────────────────

function parseAffinity(str) {
  return (str || "").split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
}

async function pickFilteredBoss(affinity) {
  const rows = await readTable("Dungeon Boss");
  if (!rows.length) return ["[Boss?]", "[Behavior?]"];
  const list = parseAffinity(affinity);
  if (list.length > 0) {
    const filtered = rows.filter(r => list.some(a => (r[1] || "").includes(a)));
    if (filtered.length >= 3) { const row = rnd(filtered); return [row[1] || "[Boss?]", row[2] || "[Behavior?]"]; }
  }
  const row = rnd(rows);
  return [row[1] || "[Boss?]", row[2] || "[Behavior?]"];
}

async function pickFilteredRevelation(affinity) {
  const rows = await readTable("Dungeon Revelation");
  if (!rows.length) return "[Revelation?]";
  const nums = (affinity || "").split(/\s*,\s*/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (nums.length >= 2) {
    const filtered = rows.filter(r => nums.includes(parseInt((r[0] || "0").trim())));
    if (filtered.length >= 2) return (rnd(filtered)[1] || "").trim();
  }
  return (rnd(rows)[1] || "").trim();
}

// ─── AREA TYPE PICKER ────────────────────────────────────────────────────────

async function pickAreaType(sizePreference) {
  const rows = await readTable("Dungeon Area Type");
  if (!rows.length) return ["[Area?]", "[Dims?]", "[Side?]"];
  let pool = rows;
  if (sizePreference === "small") {
    const f = rows.filter(r => !(/\b[4-9]\d'/.test(r[2] || "")));
    if (f.length >= 5) pool = f;
  } else if (sizePreference === "medium") {
    const f = rows.filter(r => !(/\b[5-9]\d'/.test(r[2] || "")));
    if (f.length >= 5) pool = f;
  }
  const row = rnd(pool);
  return [row[1] || "", row[2] || "", row[3] || ""];
}

function safeFileName(str) { return str.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 60); }
function formatSecretDesc(s) { return s.replace(/^([^.]+)\.\s*/, "$1 — ").replace(/\.$/, ""); }

// ─── LOOT BUDGET ─────────────────────────────────────────────────────────────

function computeBudget(segCount) {
  const rooms = segCount + 1;
  return {
    apex: 1, rare: Math.max(0, Math.floor(segCount / 3)),
    common: Math.max(1, Math.floor(rooms * 0.4)), minor: Math.max(0, Math.floor(rooms * 0.25)),
    junk: Math.max(0, Math.floor(rooms * 0.15)), empty: Math.max(2, Math.round(rooms * 0.55)),
  };
}

function buildLootDeck(budget) {
  const deck = [
    ...Array(budget.apex).fill("apex"), ...Array(budget.rare).fill("rare"),
    ...Array(budget.common).fill("common"), ...Array(budget.minor).fill("minor"),
    ...Array(budget.junk).fill("junk"), ...Array(budget.empty).fill("empty"),
  ];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]];
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
    if (Math.random() < 0.6) { const [n, d] = await pick("Dungeon Loot - Legendary", 1, 3); return { label: "Legendary", name: n, desc: d }; }
    else { const [n, d] = await pick("Dungeon Loot - Outlandish", 1, 3); return { label: "Other-Worldly", name: n, desc: d }; }
  }
  if (tier === "rare")   { const [n, d] = await pick("Dungeon Loot - Rare", 1, 2);           return { label: "Rare",  name: n, desc: d }; }
  if (tier === "common") { const [n, d] = await pick("Dungeon Loot - Common", 1, 2);          return { label: null,   name: n, desc: d }; }
  if (tier === "minor")  { const [n, d] = await pick("Dungeon Loot - Minor Resource", 1, 2);  return { label: null,   name: n, desc: d }; }
  if (tier === "junk")   { const [n, d] = await pick("Dungeon Loot - Junk", 1, 2);            return { label: "Junk", name: n, desc: d }; }
  const [n, d] = await pick("Dungeon Loot Empty", 1, 2);
  return { label: null, name: n, desc: d };
}

async function buildLootBlock(lootCards) {
  if (!lootCards || !lootCards.length) {
    const [n, d] = await pick("Dungeon Loot Empty", 1, 2);
    return `**Loot:** ${n} — *${d}*`;
  }
  const lines = [];
  for (const tier of lootCards) {
    const item = await resolveLootSlot(tier);
    if (item.label === "Legendary" || item.label === "Other-Worldly") lines.push(`- **[${item.label}]** ${item.name} — *${item.desc}*`);
    else if (item.label === "Rare")  lines.push(`- **[Rare]** ${item.name} — *${item.desc}*`);
    else if (item.label === "Junk")  lines.push(`- ~~${item.name}~~ — *${item.desc}*`);
    else                             lines.push(`- ${item.name} — *${item.desc}*`);
  }
  return `**Loot**\n${lines.join("\n")}`;
}

// ─── CONNECTIONS ─────────────────────────────────────────────────────────────
// exits: [{targetNum, targetLabel}] — derived from graph adjacency

async function buildConnections(exits) {
  const prefixSets = {
    1: [""], 2: ["Main: ", "Alt: "], 3: ["Main: ", "Side: ", "Far: "],
    4: ["Main: ", "Side: ", "Alt: ", "Far: "], 5: ["Main: ", "Side-A: ", "Side-B: ", "Alt: ", "Far: "],
  };
  const prefixes = prefixSets[Math.min(exits.length, 5)] || prefixSets[3];
  const lines = [];
  for (let i = 0; i < exits.length; i++) {
    const { targetNum, targetLabel } = exits[i];
    const [doorType]  = await pick("Dungeon Door Type",  1);
    const [doorState] = await pick("Dungeon Door State", 1);
    const dest = targetLabel ? `→ **Room ${targetNum}** *(${targetLabel})*` : `→ **Room ${targetNum}**`;
    lines.push(`- ${prefixes[i]}${doorType} | *${doorState}* ${dest}`);
  }
  return lines.join("\n");
}

// ─── ENCOUNTER ───────────────────────────────────────────────────────────────

async function buildEncounter(threatCtx) {
  const [encType] = await pick("Dungeon Encounter Type", 1);

  if (encType.includes("Enemy") || encType.includes("Faction")) {
    const [terrain] = await pick("Dungeon Tactical Terrain", 1);
    if (Math.random() < 0.75) {
      const [compName, compRoster, compT] = await pick("Dungeon Enemy Composition", 1, 2, 3);
      if (compName === "Interrupted Conflict") {
        const [factionA] = await pick("Dungeon Enemy Category", 1);
        const [factionB] = await pick("Dungeon Enemy Category", 1);
        return `**Encounter: Enemy** *(Faction Clash)*\n- Faction A: *${factionA}*\n- Faction B: *${factionB}*\n- *${compT}*\n- Tactical: ${terrain}`;
      }
      const slots = SLOT_MAP[compName] || ["low"];
      const creatureLines = slots.map(slot => {
        let creature, label;
        if (slot === "low")  { creature = pickFromPool(threatCtx.low);  label = "Low CR"; }
        if (slot === "mid")  { creature = pickFromPool(threatCtx.mid);  label = "Mid CR"; }
        if (slot === "boss") { creature = pickFromPool(threatCtx.boss); label = "Boss CR"; }
        return `- ${label}: *${creature}*`;
      });
      return `**Encounter: Enemy** *(${threatCtx.id} — ${compName})*\n- ${compRoster} | *${compT}*\n${creatureLines.join("\n")}\n- Tactical: ${terrain}`;
    } else {
      const [enemy] = await pick("Dungeon Enemy Category", 1);
      return `**Encounter: Enemy** *(Complication)*\n- *${enemy}*\n- Tactical: ${terrain}`;
    }
  }
  if (encType.includes("Hazard") || encType.includes("Trap")) {
    const [hazName, hazCheck, hazFx] = await pick("Dungeon Hazard", 1, 2, 3);
    return `**Encounter: Hazard**\n- ${hazName} — ${hazCheck} | *${hazFx}*`;
  }
  if (encType.includes("Social") || encType.includes("Contact")) {
    const [entity, hook] = await pick("Dungeon Contact", 1, 3);
    const [devName, devSit, devMisread, devLev] = await pick("Dungeon Narrative Device", 1, 2, 3, 4);
    return `**Encounter: Social / Contact**\n- *${entity} — ${hook}*\n- **Device:** ${devName} — *${devSit}*\n- **Misread:** ${devMisread}\n- **Leverage:** ${devLev}`;
  }
  if (encType.includes("Problem") || encType.includes("Lock")) {
    const [obstacle, bypass] = await pick("Dungeon Problem", 1, 2);
    const ci = obstacle.indexOf(":");
    if (ci > -1) return `**Encounter: Problem**\n- **${obstacle.slice(0,ci).trim()}** — ${obstacle.slice(ci+1).trim()} *${bypass}*`;
    return `**Encounter: Problem**\n- **${obstacle}** — *${bypass}*`;
  }
  if (encType.includes("Discovery")) {
    const [discForm]    = await pick("Dungeon Discovery Form",    1);
    const [discContent] = await pick("Dungeon Discovery Content", 1);
    return `**Encounter: Discovery**\n- **Form:** ${discForm}\n- **Content:** *${discContent}*`;
  }
  if (encType.includes("Lore")) {
    const loreContentRows = await readTable("Dungeon Lore Content");
    const loreArtRows     = await readTable("Dungeon Lore Art");
    if (loreContentRows.length && loreArtRows.length) {
      const idx         = Math.floor(Math.random() * Math.min(loreContentRows.length, loreArtRows.length));
      const loreContent = (loreContentRows[idx][1] || "").trim();
      const loreArt     = (loreArtRows[idx][1]     || "").trim();
      return `**Encounter: Lore**\n- **Revelation:** *${loreContent}*\n- **Art:** ${loreArt}`;
    }
    const [fallback] = await pick("Dungeon Lore Content", 1);
    return `**Encounter: Lore**\n- *${fallback}*`;
  }
  const [emptyName, emptyFx] = await pick("Dungeon Empty Result", 2, 3);
  return `**Encounter: Empty**\n- ${emptyName} — *${emptyFx}*`;
}

// ─── SECRET ──────────────────────────────────────────────────────────────────

async function buildSecret() {
  const [tier, tierDesc]            = await pick("Dungeon Secret Tier",        1, 2);
  const [revealName, revealSkills]  = await pick("Dungeon Secret Reveal Type", 1, 2);
  return `**Secret:** ${tier} — *${formatSecretDesc(tierDesc)}*\nReveal via: ${revealName} — ${revealSkills}`;
}

// ─── GRAPH UTILITIES ─────────────────────────────────────────────────────────

function buildGraph(nodeList, edgePairs) {
  const adj = {};
  for (const { id } of nodeList) adj[id] = [];
  for (const [a, b] of edgePairs) { adj[a].push(b); adj[b].push(a); }
  return { adj, nodes: nodeList };
}

function bfsGraph(adj, entryId) {
  const visited = new Set();
  const queue = [{ id: entryId, depth: 0 }];
  const order = [], depth = {};
  while (queue.length) {
    const { id, depth: d } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id); order.push(id); depth[id] = d;
    for (const nb of (adj[id] || [])) { if (!visited.has(nb)) queue.push({ id: nb, depth: d + 1 }); }
  }
  return { order, depth };
}

function assignRoomNumbers(bfsOrder, nodes) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const nonFinale = bfsOrder.filter(id => !nodeMap[id]?.isFinale);
  const finales   = bfsOrder.filter(id =>  nodeMap[id]?.isFinale);
  const numMap = {};
  [...nonFinale, ...finales].forEach((id, idx) => { numMap[id] = idx + 1; });
  return numMap;
}

// ─── TOPOLOGY GRAPH BUILDERS ─────────────────────────────────────────────────

function buildSpineGraph(n) {
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    nodes.push({ id: `r${i}`, label: i === 1 ? "Entry" : "", isFinale: false });
    if (i > 1) edges.push([`r${i-1}`, `r${i}`]);
  }
  nodes.push({ id: "finale", label: "Finale", isFinale: true });
  edges.push([`r${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "r1" };
}

function buildBranchGraph(n) {
  const mainLen = Math.max(2, Math.ceil(n * 0.6));
  const branchCount = n - mainLen;
  const nodes = [], edges = [];
  for (let i = 1; i <= mainLen; i++) {
    nodes.push({ id: `r${i}`, label: i === 1 ? "Entry" : "", isFinale: false });
    if (i > 1) edges.push([`r${i-1}`, `r${i}`]);
  }
  nodes.push({ id: "finale", label: "Finale", isFinale: true });
  edges.push([`r${mainLen}`, "finale"]);
  for (let b = 0; b < branchCount; b++) {
    const bId = `b${b+1}`;
    const attachRange = mainLen - 1; // r2..r(mainLen-1) eligible, skip r1 and last
    const rawIdx = attachRange <= 1 ? 2 : 2 + Math.round(b * (attachRange - 1) / Math.max(branchCount - 1, 1));
    const attachNum = Math.max(2, Math.min(mainLen, rawIdx));
    nodes.push({ id: bId, label: "Branch", isFinale: false });
    edges.push([`r${attachNum}`, bId]);
  }
  return { ...buildGraph(nodes, edges), entry: "r1" };
}

function buildCascadeGraph(n) {
  // Structurally identical to Spine; topology name provides the flavor
  return buildSpineGraph(n);
}

function buildRuinGraph(n) {
  const graph = buildBranchGraph(n);
  for (const node of graph.nodes) { if (node.label === "Branch") node.label = "Isolated Section"; }
  return graph;
}

function buildLoopGraph(n) {
  // Two parallel paths from Entry to Finale
  const pathA = Math.ceil((n - 1) / 2);
  const pathB = (n - 1) - pathA;
  const nodes = [{ id: "r1", label: "Entry", isFinale: false }];
  const edges = [];
  let nextId = 2;
  const aIds = Array.from({ length: pathA }, () => { const id = `r${nextId++}`; nodes.push({ id, label: "", isFinale: false }); return id; });
  const bIds = Array.from({ length: pathB }, () => { const id = `r${nextId++}`; nodes.push({ id, label: "", isFinale: false }); return id; });
  nodes.push({ id: "finale", label: "Finale", isFinale: true });
  // Connect Path A
  edges.push(["r1", aIds.length ? aIds[0] : "finale"]);
  for (let i = 0; i < aIds.length - 1; i++) edges.push([aIds[i], aIds[i+1]]);
  if (aIds.length) edges.push([aIds[aIds.length-1], "finale"]);
  // Connect Path B
  if (bIds.length) {
    edges.push(["r1", bIds[0]]);
    for (let i = 0; i < bIds.length - 1; i++) edges.push([bIds[i], bIds[i+1]]);
    edges.push([bIds[bIds.length-1], "finale"]);
  } else {
    // n=3 edge case: both paths are 1 room; already handled above
    // n=2 would have been caught by fallback; path B length 0 means direct r1→finale exists via A
  }
  return { ...buildGraph(nodes, edges), entry: "r1" };
}

function buildHubGraph(n) {
  const spokeCount = n - 2; // n segs - entry - hub
  const nodes = [
    { id: "r1", label: "Entry", isFinale: false },
    { id: "r2", label: "Hub",   isFinale: false },
  ];
  const edges = [["r1", "r2"]];
  for (let i = 0; i < spokeCount; i++) {
    const id = `r${i+3}`;
    nodes.push({ id, label: "Spoke", isFinale: false });
    edges.push(["r2", id]);
  }
  nodes.push({ id: "finale", label: "Finale", isFinale: true });
  edges.push(["r2", "finale"]);
  return { ...buildGraph(nodes, edges), entry: "r1" };
}

function buildStrongholdGraph(n) {
  const graph = buildHubGraph(n);
  for (const node of graph.nodes) {
    if (node.label === "Hub")   node.label = "Inner Gate";
    if (node.label === "Spoke") node.label = "Fortified Chamber";
  }
  return graph;
}

function buildFigure8Graph(n) {
  // Loop + linear path sharing connector (r2)
  const remaining = n - 2; // after entry + connector
  const loopSize = Math.floor(remaining / 2);
  const approachSize = remaining - loopSize;
  const nodes = [
    { id: "r1", label: "Entry",     isFinale: false },
    { id: "r2", label: "Connector", isFinale: false },
  ];
  const edges = [["r1", "r2"]];
  let nextId = 3;
  const loopIds = Array.from({ length: loopSize }, (_, i) => {
    const id = `r${nextId++}`; nodes.push({ id, label: i === 0 ? "Loop" : "", isFinale: false }); return id;
  });
  if (loopIds.length) {
    edges.push(["r2", loopIds[0]]);
    for (let i = 0; i < loopIds.length - 1; i++) edges.push([loopIds[i], loopIds[i+1]]);
    edges.push([loopIds[loopIds.length-1], "r2"]);
  }
  const approachIds = Array.from({ length: approachSize }, () => {
    const id = `r${nextId++}`; nodes.push({ id, label: "", isFinale: false }); return id;
  });
  edges.push(["r2", approachIds.length ? approachIds[0] : "finale"]);
  for (let i = 0; i < approachIds.length - 1; i++) edges.push([approachIds[i], approachIds[i+1]]);
  if (approachIds.length) edges.push([approachIds[approachIds.length-1], "finale"]);
  nodes.push({ id: "finale", label: "Finale", isFinale: true });
  return { ...buildGraph(nodes, edges), entry: "r1" };
}

function buildConvergenceGraph(n) {
  const pathRooms = n - 2; // minus entry and convergence node
  const pathA = Math.ceil(pathRooms / 2);
  const pathB = pathRooms - pathA;
  const nodes = [{ id: "r1", label: "Entry", isFinale: false }];
  const edges = [];
  let nextId = 2;
  const aIds = Array.from({ length: pathA }, (_, i) => {
    const id = `r${nextId++}`; nodes.push({ id, label: i === 0 ? "Path A" : "", isFinale: false }); return id;
  });
  const bIds = Array.from({ length: pathB }, (_, i) => {
    const id = `r${nextId++}`; nodes.push({ id, label: i === 0 ? "Path B" : "", isFinale: false }); return id;
  });
  const convId = `r${nextId++}`;
  nodes.push({ id: convId, label: "Convergence", isFinale: false });
  nodes.push({ id: "finale", label: "Finale", isFinale: true });
  edges.push(["r1", aIds.length ? aIds[0] : convId]);
  for (let i = 0; i < aIds.length - 1; i++) edges.push([aIds[i], aIds[i+1]]);
  if (aIds.length) edges.push([aIds[aIds.length-1], convId]);
  edges.push(["r1", bIds.length ? bIds[0] : convId]);
  for (let i = 0; i < bIds.length - 1; i++) edges.push([bIds[i], bIds[i+1]]);
  if (bIds.length) edges.push([bIds[bIds.length-1], convId]);
  edges.push([convId, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "r1" };
}

function buildOnionGraph(n) {
  const outerCount = Math.max(3, Math.ceil(n * 0.6));
  const innerCount = n - outerCount;
  const nodes = [], edges = [];
  let nextId = 1;
  const outerIds = Array.from({ length: outerCount }, (_, i) => {
    const id = `r${nextId++}`; nodes.push({ id, label: i === 0 ? "Entry" : "Outer Ring", isFinale: false }); return id;
  });
  for (let i = 0; i < outerCount; i++) edges.push([outerIds[i], outerIds[(i+1) % outerCount]]);
  const gatewayId = outerIds[1];
  const innerIds = Array.from({ length: innerCount }, (_, i) => {
    const id = `r${nextId++}`; nodes.push({ id, label: i === 0 ? "Inner Sanctum" : "", isFinale: false }); return id;
  });
  if (innerIds.length) {
    edges.push([gatewayId, innerIds[0]]);
    for (let i = 0; i < innerIds.length - 1; i++) edges.push([innerIds[i], innerIds[i+1]]);
    edges.push([innerIds[innerIds.length-1], "finale"]);
  } else {
    edges.push([gatewayId, "finale"]);
  }
  nodes.push({ id: "finale", label: "Finale", isFinale: true });
  return { ...buildGraph(nodes, edges), entry: outerIds[0] };
}

function buildWebGraph(n) {
  const graph = buildBranchGraph(n);
  const nonFinaleIds = graph.nodes.filter(nd => !nd.isFinale).map(nd => nd.id);
  const crossCount = Math.min(2, Math.floor(n / 2));
  for (let c = 0; c < crossCount; c++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const a = nonFinaleIds[Math.floor(Math.random() * nonFinaleIds.length)];
      const b = nonFinaleIds[Math.floor(Math.random() * nonFinaleIds.length)];
      if (a !== b && !graph.adj[a].includes(b)) { graph.adj[a].push(b); graph.adj[b].push(a); break; }
    }
  }
  return graph;
}

function buildLabyrinthFragment(n) {
  const graph = buildWebGraph(n);
  const nonFinaleIds = graph.nodes.filter(nd => !nd.isFinale).map(nd => nd.id);
  const extraCount = Math.floor(n / 2);
  for (let c = 0; c < extraCount; c++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const a = nonFinaleIds[Math.floor(Math.random() * nonFinaleIds.length)];
      const b = nonFinaleIds[Math.floor(Math.random() * nonFinaleIds.length)];
      if (a !== b && !graph.adj[a].includes(b)) { graph.adj[a].push(b); graph.adj[b].push(a); break; }
    }
  }
  return graph;
}

const GRAPH_BUILDERS = {
  "The Spine": buildSpineGraph, "The Branch": buildBranchGraph,
  "The Cascade": buildCascadeGraph, "The Ruin": buildRuinGraph,
  "The Loop": buildLoopGraph, "The Hub": buildHubGraph,
  "The Stronghold": buildStrongholdGraph, "The Figure-8": buildFigure8Graph,
  "The Convergence": buildConvergenceGraph, "The Onion": buildOnionGraph,
  "The Web": buildWebGraph, "The Labyrinth Fragment": buildLabyrinthFragment,
};

// ─── TOPOLOGY RESOLVER ───────────────────────────────────────────────────────

function resolveTopology(topoName, segCount) {
  let name = topoName, original = topoName;
  while (name && (TOPOLOGY_MIN_SEGS[name] || 1) > segCount) {
    name = TOPOLOGY_FALLBACK[name] || "The Spine";
  }
  return { resolved: name || "The Spine", original, wasFallback: name !== original };
}

// ─── CANVAS LAYOUT ───────────────────────────────────────────────────────────

function layoutNodes(nodes, bfsDepth) {
  const NODE_W = 420, NODE_H = 520, H_GAP = 100, V_GAP = 80;
  const byDepth = {};
  for (const node of nodes) {
    const d = bfsDepth[node.id] ?? 0;
    if (!byDepth[d]) byDepth[d] = [];
    byDepth[d].push(node.id);
  }
  const depths = Object.keys(byDepth).map(Number).sort((a, b) => a - b);
  const maxDepth = depths[depths.length - 1] || 0;
  const totalWidth = maxDepth * (NODE_W + H_GAP);
  const positions = {};
  for (const d of depths) {
    const group = byDepth[d];
    const count = group.length;
    const totalHeight = count * NODE_H + Math.max(0, count - 1) * V_GAP;
    const x = d * (NODE_W + H_GAP) - totalWidth / 2;
    group.forEach((nodeId, i) => {
      const y = -totalHeight / 2 + i * (NODE_H + V_GAP);
      positions[nodeId] = { x: Math.round(x), y: Math.round(y) };
    });
  }
  return positions;
}

function generateCanvasJSON(nodes, adj, bfsDepth, roomFilePaths) {
  const positions = layoutNodes(nodes, bfsDepth);
  const canvasNodes = nodes.map(node => ({
    id: node.id, type: "file", file: roomFilePaths[node.id],
    x: (positions[node.id] || { x: 0 }).x,
    y: (positions[node.id] || { y: 0 }).y,
    width: 420, height: 520,
  }));
  const edgeSet = new Set();
  const canvasEdges = [];
  let edgeId = 1;
  for (const node of nodes) {
    for (const nbId of (adj[node.id] || [])) {
      const key = [node.id, nbId].sort().join("|");
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        canvasEdges.push({ id: `e${edgeId++}`, fromNode: node.id, toNode: nbId });
      }
    }
  }
  return JSON.stringify({ nodes: canvasNodes, edges: canvasEdges }, null, 2);
}

// ─── MERMAID DIAGRAM ─────────────────────────────────────────────────────────

function generateMermaidDiagram(nodes, adj, roomNumbers, nodeMap, roomAreaData) {
  const lines = ["flowchart LR"];
  for (const node of nodes) {
    const num      = roomNumbers[node.id];
    const label    = node.label || "";
    const areaType = (roomAreaData[node.id] || {}).areaType || "";
    const topLine  = label ? `Room ${num} — ${label}` : `Room ${num}`;
    const nId      = `R${String(num).padStart(2, "0")}`;
    lines.push(`  ${nId}["${topLine}\\n${areaType}"]`);
  }
  const edgeSet = new Set();
  for (const node of nodes) {
    for (const nbId of (adj[node.id] || [])) {
      const key = [node.id, nbId].sort().join("|");
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        const a = `R${String(roomNumbers[node.id]).padStart(2, "0")}`;
        const b = `R${String(roomNumbers[nbId]).padStart(2, "0")}`;
        lines.push(`  ${a} --- ${b}`);
      }
    }
  }
  return lines.join("\n");
}

// ─── FILE HELPERS ────────────────────────────────────────────────────────────

async function createOrOverwrite(path, content) {
  const existing = app.vault.getAbstractFileByPath(path);
  if (existing) await app.vault.modify(existing, content);
  else await app.vault.create(path, content);
}

// ─── ROOM CONTENT ────────────────────────────────────────────────────────────

async function generateRoomNote(roomNum, node, exits, areaType, dims, side, isEntry, threatCtx, lootCards, dungeonName, tier) {
  const labelStr = node.label ? ` — ${node.label}` : "";
  const [lighting, lightFlavor] = await pick("Dungeon Lighting", 1, 2);
  const [sensory]               = await pick("Dungeon Sensory",  1);
  const [scene]                 = await pick("Dungeon Scene",    1);
  const [d1] = await pick("Dungeon Set Dressing", 1);
  const [c1] = await pick("Dungeon Set Dressing Condition", 2);
  const [d2] = await pick("Dungeon Set Dressing", 1);
  const [c2] = await pick("Dungeon Set Dressing Condition", 2);
  const [objName, objFl]             = await pick("Dungeon Interactable Object", 1, 2);
  const [featName, featFl, featDims] = await pick("Dungeon Feature", 1, 2, 3);
  const conns    = await buildConnections(exits);
  const encounter = await buildEncounter(threatCtx);
  const loot      = await buildLootBlock(lootCards);
  const secret    = await buildSecret();
  const exitWord  = exits.length === 1 ? "exit" : "exits";
  let entryBlock = "";
  if (isEntry) {
    const [pCat, pResult] = await pick("Starting State Pressure", 1, 2);
    entryBlock = `\n**Entry Pressure:** ${pCat} — *${pResult}*`;
  }

  return `---
tags: [dungeon-room, arcana-engine]
dungeon: "${dungeonName}"
room: ${roomNum}
tier: ${tier}
---

## Room ${roomNum}${labelStr} — ${areaType}

**Space:** ${dims} | ${side}
**Lighting:** ${lighting} — *${lightFlavor}*
**Sensory:** *${sensory}*
**Scene:** *${scene}*${entryBlock}

**Connections** *(${exits.length} ${exitWord})*
${conns}

**Dressing**
- ${d1} — *${c1}*
- ${d2} — *${c2}*
- **Object:** ${objName} — ${objFl}
- **Feature:** ${featName} — ${featFl} *(${featDims})*

${encounter}

${loot}

${secret}
`;
}

async function generateFinaleNote(roomNum, node, exits, areaType, dims, side, threatCtx, lootCards, bossAffinity, revelAffinity, dungeonName, tier) {
  const [lighting, lightFlavor] = await pick("Dungeon Lighting", 1, 2);
  const [sensory]               = await pick("Dungeon Sensory",  1);
  const [scene]                 = await pick("Dungeon Scene",    1);
  const [d1] = await pick("Dungeon Set Dressing", 1);
  const [c1] = await pick("Dungeon Set Dressing Condition", 2);
  const [d2] = await pick("Dungeon Set Dressing", 1);
  const [c2] = await pick("Dungeon Set Dressing Condition", 2);
  const [objName, objFl]             = await pick("Dungeon Interactable Object", 1, 2);
  const [featName, featFl, featDims] = await pick("Dungeon Feature", 1, 2, 3);
  const [finaleType, finaleDesc]     = await pick("Dungeon Finale Type", 1, 3);
  const [exitState]                  = await pick("Dungeon Exit State", 1);
  const [bossArch, bossBeh]          = await pickFilteredBoss(bossAffinity);
  const revelation                   = await pickFilteredRevelation(revelAffinity);
  const bossCreature = Math.random() < 0.90 ? pickFromPool(threatCtx.boss) : bossArch;
  const [devName, devSit, devMisread, devLev] = await pick("Dungeon Narrative Device", 1, 2, 3, 4);
  const conns  = await buildConnections(exits);
  const loot   = await buildLootBlock(lootCards);
  const secret = await buildSecret();
  const exitWord = exits.length === 1 ? "exit" : "exits";

  return `---
tags: [dungeon-room, dungeon-finale, arcana-engine]
dungeon: "${dungeonName}"
room: ${roomNum}
tier: ${tier}
---

## Room ${roomNum} — Finale — ${areaType}

**Space:** ${dims} | ${side}
**Lighting:** ${lighting} — *${lightFlavor}*
**Sensory:** *${sensory}*
**Scene:** *${scene}*

**Connections** *(${exits.length} ${exitWord})*
${conns}

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
`;
}

// ─── USER INPUT ──────────────────────────────────────────────────────────────

const dungeonName = await tp.system.prompt("Dungeon Name");
if (!dungeonName) { new Notice("Dungeon generation cancelled."); return; }

const segStr = await tp.system.prompt("How many segments? (not counting the finale)", "3");
const segCount = Math.max(1, Math.min(9, parseInt(segStr) || 3));

const tierStr = await tp.system.prompt("Play tier? 1 = Local Heroes (lv 1–4) · 2 = Heroes of the Realm (lv 5–9)", "1");
const tier = (tierStr || "1").trim() === "2" ? "T2" : "T1";
const threatTableName = tier === "T2" ? "Dungeon Threat Identity T2" : "Dungeon Threat Identity T1";

// ─── SETUP ROLLS ─────────────────────────────────────────────────────────────

const [typeArch, typeAtmo]    = await pick("Dungeon Type",               1, 3);
const [originCat, originFlav] = await pick("Dungeon Origin",             1, 3);
const [skinName,  skinVis]    = await pick("Dungeon Environment Skin",   1, 2);
const [motifName, motifDesc]  = await pick("Dungeon Art Motif",          1, 2);
const [modName,   modDesc]    = await pick("Dungeon Art Motif Modifier", 1, 2);
const [restName,  restDesc]   = await pick("Dungeon Rest Complications", 1, 2);
const [topoName,  topoDesc]   = await pick("Dungeon Topology",           1, 2);
const [witnessDistort]        = await pick("Witness Distortion Table",   1);
const [mythSeed, bossAffinity, revelAffinity] = await pick("Myth Seeds", 1, 2, 3);
const [threatId, threatRole, threatLow, threatMid, threatBoss, threatScale, threatSigns] =
  await pick(threatTableName, 1, 2, 3, 4, 5, 6, 7);

const threatCtx = { id: threatId, role: threatRole, low: threatLow, mid: threatMid, boss: threatBoss, scale: threatScale, signs: threatSigns };

// ─── TOPOLOGY RESOLUTION + GRAPH ─────────────────────────────────────────────

const { resolved: resolvedTopo, original: origTopo, wasFallback } = resolveTopology(topoName, segCount);
const topoSizePref = TOPO_SIZE[resolvedTopo] || "any";

const graph = GRAPH_BUILDERS[resolvedTopo](segCount);
const { order: bfsOrder, depth: bfsDepth } = bfsGraph(graph.adj, graph.nodes[0].id);
const roomNumbers = assignRoomNumbers(bfsOrder, graph.nodes);
const nodeMap     = Object.fromEntries(graph.nodes.map(n => [n.id, n]));

const totalRooms   = segCount + 1;
const lootBudget   = computeBudget(segCount);
const lootDeck     = buildLootDeck(lootBudget);
const lootByOrder  = assignLootToRooms(lootDeck, totalRooms);
// Map node id → loot cards (in BFS order)
const lootByNode   = {};
bfsOrder.forEach((id, i) => { lootByNode[id] = lootByOrder[i] || []; });

const tierLabel = tier === "T2" ? "Heroes of the Realm (Lv 5–9)" : "Local Heroes (Lv 1–4)";
const fallbackNote = wasFallback ? ` *(rolled ${origTopo}, fell back — needs ${TOPOLOGY_MIN_SEGS[origTopo]} segs)*` : "";

// ─── FOLDER SETUP ────────────────────────────────────────────────────────────

const dungeonFolderPath = `${SKETCHES_FOLDER}/${dungeonName}`;
try { await app.vault.createFolder(dungeonFolderPath); } catch(e) { /* folder exists */ }

// ─── PASS 1: ASSIGN AREA TYPES ───────────────────────────────────────────────

const roomAreaData = {}; // nodeId → { areaType, dims, side }
for (const nodeId of bfsOrder) {
  const [areaType, dims, side] = await pickAreaType(topoSizePref);
  roomAreaData[nodeId] = { areaType, dims, side };
}

// ─── PASS 2: GENERATE CONTENT + CREATE ROOM FILES ────────────────────────────

const roomFilePaths  = {}; // nodeId → vault path (for canvas)
const roomIndexRows  = []; // for index note
const roomFullBlocks = []; // full prose for index note full-scan section

for (const nodeId of bfsOrder) {
  const node      = nodeMap[nodeId];
  const roomNum   = roomNumbers[nodeId];
  const { areaType, dims, side } = roomAreaData[nodeId];
  const isEntry   = roomNum === 1;

  // Build exits array for this room: neighbors → {targetNum, targetLabel}
  const exits = (graph.adj[nodeId] || []).map(nbId => ({
    targetNum:   roomNumbers[nbId],
    targetLabel: nodeMap[nbId]?.label || "",
  }));

  let noteContent;
  if (node.isFinale) {
    noteContent = await generateFinaleNote(roomNum, node, exits, areaType, dims, side, threatCtx, lootByNode[nodeId], bossAffinity, revelAffinity, dungeonName, tier);
  } else {
    noteContent = await generateRoomNote(roomNum, node, exits, areaType, dims, side, isEntry, threatCtx, lootByNode[nodeId], dungeonName, tier);
  }

  // File name: R01 — Entry.md, R05 — Hub.md, R06 — Finale.md
  const displayLabel = node.isFinale ? "Finale" : (node.label || areaType);
  const roomFileName = `R${String(roomNum).padStart(2, "0")} — ${safeFileName(displayLabel)}.md`;
  const roomFilePath = `${dungeonFolderPath}/${roomFileName}`;
  await createOrOverwrite(roomFilePath, noteContent);
  roomFilePaths[nodeId] = roomFilePath;
  roomFullBlocks.push(noteContent.replace(/^---[\s\S]*?---\n/, "").trimStart());

  // Index row
  const neighborStr = exits.map(e => e.targetLabel ? `R${e.targetNum} (${e.targetLabel})` : `R${e.targetNum}`).join(", ");
  roomIndexRows.push(`| [[${roomFileName.replace(".md", "")}\\|Room ${roomNum}]] | ${node.label || "—"} | ${areaType} | ${bfsDepth[nodeId]} | ${neighborStr} |`);
}

// ─── CANVAS ──────────────────────────────────────────────────────────────────

const canvasJson = generateCanvasJSON(graph.nodes, graph.adj, bfsDepth, roomFilePaths);
await createOrOverwrite(`${dungeonFolderPath}/${dungeonName}.canvas`, canvasJson);

const mermaidDiagram = generateMermaidDiagram(graph.nodes, graph.adj, roomNumbers, nodeMap, roomAreaData);

// ─── ASSEMBLE INDEX NOTE ─────────────────────────────────────────────────────

tR = `---
tags: [dungeon, sketch, arcana-engine]
rooms: ${totalRooms}
tier: ${tier}
topology: "${resolvedTopo}"
status: sketch
---

# ${dungeonName}

> [[${dungeonName}.canvas|Open Dungeon Canvas]] — rooms positioned by depth, connected by topology.

---

## ◆ Setup

| | |
|:--|:--|
| **Tier** | ${tierLabel} |
| **Topology** | **${resolvedTopo}**${fallbackNote} — ${topoDesc} |
| **Type** | ${typeArch} — *${typeAtmo}* |
| **Origin** | ${originCat} — *${originFlav}* |
| **Skin** | ${skinName} — *${skinVis}* |
| **Art Motif** | ${motifName} — *${motifDesc}* |
| **Motif Modifier** | ${modName} — *${modDesc}* |
| **Threat Identity** | ${threatId} — *${threatRole}* |
| **↳ Creatures** | Low: ${threatLow} \| Mid: ${threatMid} \| Boss: ${threatBoss} |
| **↳ Scale** | ${threatScale} |
| **↳ Signs** | *${threatSigns}* |
| **Rest Pressure** | ${restName} — *${restDesc}* |
| **Dungeon Lore** | *${mythSeed}* |
| **Legend Distorted** | *${witnessDistort}* |
| **Dungeon Haul** | ${haulSummary(lootBudget)} |

---

## ◆ Topology

\`\`\`mermaid
${mermaidDiagram}
\`\`\`

---

## ◆ Room Roster

| Room | Label | Area Type | Depth | Connections |
|:-----|:------|:----------|:-----:|:------------|
${roomIndexRows.join("\n")}

---

*Generated with Arcana Engine v0.25 — Dungeon Procedure v4.0*

---

## ◆ Full Content Scan

${roomFullBlocks.join("\n\n---\n\n")}
`;

// Move index note into dungeon subfolder
await tp.file.move(`${dungeonFolderPath}/${dungeonName}`);
%>
