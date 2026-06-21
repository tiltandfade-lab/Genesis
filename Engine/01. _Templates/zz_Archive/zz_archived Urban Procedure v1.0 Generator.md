> [!info] Urban Procedure v1.0 Generator
> **To run:** Cmd/Ctrl+P → *Templater: Create new note from template* → pick this file.
> You'll be prompted for adventure name, segment count, and play tier. The generator creates a **subfolder** in Urban/Sketches containing individual segment notes, a `.canvas` topology map, and an index overview note.
>
> **One-time setup:** Settings → Templater → Template folder location → `Arcana Engine v 0.25/00. Engine/01. _Templates`
>
> **What gets generated:**
> - **`{name}.canvas`** — segments as linked cards, positioned by topology. Open in Obsidian Canvas for live play.
> - **`S{nn} — {label}.md`** — one note per segment. Contains location, sensory, encounter, dressing, transition, secret.
> - **`{name}.md`** — index note with DM Briefing, Setup table, topology diagram, segment roster, Heat rules, and full content scan.
>
> v1.0: Initial release. 4 topologies (Trail, Web, Turf, Layer Cake). 8 encounter branches with per-topology weights. Discovery finale track. Existing urban tables. Placeholder Catalyst d20.

<%*
// =============================================================================
// URBAN SKETCH GENERATOR — Arcana Engine v0.25 · Urban Procedure v1.0
// v1.0: 4 topologies (Trail, Web, Turf, Layer Cake). Per-topology encounter
//       weights. Discovery finale. Existing d100/d200 urban tables.
//       Placeholder Catalyst. Canvas + segment notes + index.
// =============================================================================

const SKETCHES_FOLDER = "Arcana Engine v 0.25/02. Asset Library/Urban/Sketches";

// ─── COMPOSITION SLOT MAP ────────────────────────────────────────────────────

const SLOT_MAP = {
  "The Crowd":                  ["low"],
  "The Gang":                   ["low"],
  "Enforcers & Watch":          ["mid", "low"],
  "The Ambush":                 ["mid"],
  "Boss & Muscle":              ["boss", "low"],
  "Boss & Guard":               ["boss", "mid"],
  "The Spellcaster & Allies":   ["mid", "low"],
  "The Elite Pair":             ["mid"],
  "The Solo Threat":            ["boss"],
  "Factional Conflict":         null,
};

// ─── TOPOLOGY CONFIG ─────────────────────────────────────────────────────────

const TOPOLOGY_MIN_SEGS = {
  "The Trail": 1, "The Web": 2, "The Turf": 2, "The Layer Cake": 2,
};

const TOPOLOGY_FALLBACK = {
  "The Layer Cake": "The Web", "The Turf": "The Web",
  "The Web": "The Trail",
};

// ─── TOPOLOGY LABELS ─────────────────────────────────────────────────────────

const TOPOLOGY_LABELS = {
  "The Trail":      { seq: ["Opening", "Lead", "Lead", "Lead", "Lead", "Lead", "Lead", "Lead"], finale: "Finale" },
  "The Web":        { seq: ["Opening", "Core Lead", "Core Lead", "Core Lead", "Core Lead", "Core Lead"], branch: "Side Lead", finale: "Finale" },
  "The Turf":       { hub: "Hub", spoke: "Excursion", finale: "Finale" },
  "The Layer Cake": { layers: ["Surface", "Surface", "Threshold", "Inner", "Inner", "Inner"], finale: "Core" },
};

// ─── PER-TOPOLOGY ENCOUNTER WEIGHTS ──────────────────────────────────────────
// Order: Enemy, Social, Problem, Hazard, Commerce, Spectacle, Rumor, Empty

const ENCOUNTER_WEIGHTS = {
  "The Trail":      [10, 20, 15,  5,  5,  5, 30, 10],
  "The Web":        [15, 20, 10,  5, 10, 10, 20, 10],
  "The Turf":       [15, 20, 10,  5, 15, 10, 15, 10],
  "The Layer Cake": [15, 15, 20, 10,  5,  5, 15, 15],
};

const ENCOUNTER_BRANCHES = ["Enemy", "Social", "Problem", "Hazard", "Commerce", "Spectacle", "Rumor", "Empty"];

// ─── HEAT GUIDANCE ───────────────────────────────────────────────────────────

const HEAT_GUIDANCE = {
  "The Trail":      "Heat represents exposure — the target learns you're asking questions.",
  "The Web":        "Side leads don't generate Heat; core leads do.",
  "The Turf":       "Heat accumulates in the district. The Hub becomes less safe.",
  "The Layer Cake": "Each layer has its own Heat awareness. Surface Heat doesn't reach Inner.",
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

function safeFileName(str) { return str.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 60); }

// ─── WEIGHTED RANDOM ─────────────────────────────────────────────────────────

function weightedPick(weights, labels) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return labels[i];
  }
  return labels[labels.length - 1];
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

function assignSegNumbers(bfsOrder, nodes) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const nonFinale = bfsOrder.filter(id => !nodeMap[id]?.isFinale);
  const finales   = bfsOrder.filter(id =>  nodeMap[id]?.isFinale);
  const numMap = {};
  [...nonFinale, ...finales].forEach((id, idx) => { numMap[id] = idx + 1; });
  return numMap;
}

// ─── TOPOLOGY GRAPH BUILDERS ─────────────────────────────────────────────────

function buildTrailGraph(n) {
  const labels = TOPOLOGY_LABELS["The Trail"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = labels.seq[Math.min(i - 1, labels.seq.length - 1)];
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildWebGraph(n) {
  const labels = TOPOLOGY_LABELS["The Web"];
  const mainLen = Math.max(2, Math.ceil(n * 0.6));
  const branchCount = n - mainLen;
  const nodes = [], edges = [];
  for (let i = 1; i <= mainLen; i++) {
    const label = labels.seq[Math.min(i - 1, labels.seq.length - 1)];
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${mainLen}`, "finale"]);
  for (let b = 0; b < branchCount; b++) {
    const bId = `b${b+1}`;
    const attachRange = mainLen - 1;
    const rawIdx = attachRange <= 1 ? 2 : 2 + Math.round(b * (attachRange - 1) / Math.max(branchCount - 1, 1));
    const attachNum = Math.max(2, Math.min(mainLen, rawIdx));
    nodes.push({ id: bId, label: labels.branch, isFinale: false });
    edges.push([`s${attachNum}`, bId]);
  }
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildTurfGraph(n) {
  const labels = TOPOLOGY_LABELS["The Turf"];
  const spokeCount = n - 1; // minus hub
  const nodes = [
    { id: "s1", label: labels.hub, isFinale: false },
  ];
  const edges = [];
  for (let i = 0; i < spokeCount; i++) {
    const id = `s${i+2}`;
    nodes.push({ id, label: labels.spoke, isFinale: false });
    edges.push(["s1", id]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push(["s1", "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildLayerCakeGraph(n) {
  const labels = TOPOLOGY_LABELS["The Layer Cake"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = labels.layers[Math.min(i - 1, labels.layers.length - 1)];
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

const GRAPH_BUILDERS = {
  "The Trail": buildTrailGraph, "The Web": buildWebGraph,
  "The Turf": buildTurfGraph, "The Layer Cake": buildLayerCakeGraph,
};

// ─── TOPOLOGY RESOLVER ───────────────────────────────────────────────────────

function resolveTopology(topoName, segCount) {
  let name = topoName, original = topoName;
  while (name && (TOPOLOGY_MIN_SEGS[name] || 1) > segCount) {
    name = TOPOLOGY_FALLBACK[name] || "The Trail";
  }
  return { resolved: name || "The Trail", original, wasFallback: name !== original };
}

// ─── ENCOUNTER BUILDER ──────────────────────────────────────────────────────

async function buildEncounter(topoName, threatCtx) {
  const weights = ENCOUNTER_WEIGHTS[topoName] || ENCOUNTER_WEIGHTS["The Trail"];
  const branch = weightedPick(weights, ENCOUNTER_BRANCHES);

  if (branch === "Enemy") {
    if (Math.random() < 0.75) {
      const [compName, compRoster, compT] = await pick("Urban Enemy Composition", 1, 2, 3);
      if (compName === "Factional Conflict") {
        const [fA] = await pick("Urban Enemy Category", 1);
        const [fB] = await pick("Urban Enemy Category", 1);
        return { type: "Enemy", text: `**Encounter: Enemy** *(Faction Clash)*\n- Faction A: *${fA}*\n- Faction B: *${fB}*\n- *${compT}*`, isEnemy: true };
      }
      const slots = SLOT_MAP[compName] || ["low"];
      const creatureLines = slots.map(slot => {
        let creature, label;
        if (slot === "low")  { creature = pickFromPool(threatCtx.low);  label = "Low CR"; }
        if (slot === "mid")  { creature = pickFromPool(threatCtx.mid);  label = "Mid CR"; }
        if (slot === "boss") { creature = pickFromPool(threatCtx.boss); label = "Boss CR"; }
        return `- ${label}: *${creature}*`;
      });
      return { type: "Enemy", text: `**Encounter: Enemy** *(${threatCtx.id} — ${compName})*\n- ${compRoster} | *${compT}*\n${creatureLines.join("\n")}`, isEnemy: true };
    } else {
      const [enemy] = await pick("Urban Enemy Category", 1);
      return { type: "Enemy", text: `**Encounter: Enemy** *(Complication)*\n- *${enemy}*`, isEnemy: true };
    }
  }

  if (branch === "Social") {
    const [entity, tone, hook] = await pick("Urban Contact", 1, 1, 1);
    return { type: "Social", text: `**Encounter: Social / Contact**\n- *${entity}*`, isEnemy: false };
  }

  if (branch === "Problem") {
    const [obstacle] = await pick("Urban Problem", 1);
    return { type: "Problem", text: `**Encounter: Problem / Obstacle**\n- *${obstacle}*`, isEnemy: false };
  }

  if (branch === "Hazard") {
    const [hazard] = await pick("Urban Hazard", 1);
    return { type: "Hazard", text: `**Encounter: Hazard**\n- *${hazard}*`, isEnemy: false };
  }

  if (branch === "Commerce") {
    const [commerce] = await pick("Urban Commerce", 1);
    return { type: "Commerce", text: `**Encounter: Commerce**\n- *${commerce}*`, isEnemy: false };
  }

  if (branch === "Spectacle") {
    const [spectacle] = await pick("Urban Spectacle", 1);
    return { type: "Spectacle", text: `**Encounter: Spectacle**\n- *${spectacle}*`, isEnemy: false };
  }

  if (branch === "Rumor") {
    const [rumor] = await pick("Urban Rumor Intel", 1);
    return { type: "Rumor", text: `**Encounter: Rumor / Intel**\n- *${rumor}*`, isEnemy: false };
  }

  // Empty
  const [emptyName, emptyFx] = await pick("Urban Empty Result", 1, 1);
  return { type: "Empty", text: `**Encounter: Empty**\n- *${emptyName}*`, isEnemy: false };
}

// ─── SECRET ──────────────────────────────────────────────────────────────────

async function buildSecret() {
  const [sensory] = await pick("Urban Sensory", 1);
  return `**Secret / Detail:** *${sensory}*`;
}

// ─── CONNECTIONS ─────────────────────────────────────────────────────────────

function buildConnections(exits, segNumbers, nodeMap) {
  const lines = [];
  for (const { targetId } of exits) {
    const num = segNumbers[targetId];
    const label = nodeMap[targetId]?.label || "";
    const dest = label ? `→ **S${String(num).padStart(2,"0")}** *(${label})*` : `→ **S${String(num).padStart(2,"0")}**`;
    lines.push(`- ${dest}`);
  }
  return lines.join("\n");
}

// ─── SEGMENT NOTE ────────────────────────────────────────────────────────────

async function generateSegmentNote(segNum, node, exits, segNumbers, nodeMap, topoName, threatCtx, adventureName, isInvestigative) {
  const labelStr = node.label ? ` — ${node.label}` : "";
  const [sensory]     = await pick("Urban Sensory", 1);
  const [d1]          = await pick("Urban Set Dressing", 1);
  const [c1]          = await pick("Urban Set Dressing Condition", 1);
  const [d2]          = await pick("Urban Set Dressing", 1);
  const [c2]          = await pick("Urban Set Dressing Condition", 1);
  const conns         = buildConnections(exits, segNumbers, nodeMap);
  const encounter     = await buildEncounter(topoName, threatCtx);
  const secret        = await buildSecret();

  const heatFlag = encounter.isEnemy ? "\n\n⚠ **Likely Heat +1**" : "";
  const intelThread = isInvestigative ? `\n\n**Intel Thread:** *[What information is available here? Where does it point?]*` : "";

  return `---
tags: [urban-segment, arcana-engine]
adventure: "${adventureName}"
segment: ${segNum}
label: "${node.label}"
topology: "${topoName}"
---

## S${String(segNum).padStart(2,"0")}${labelStr}

**Sensory:** *${sensory}*
${intelThread}

**Connections**
${conns}

**Dressing**
- ${d1} — *${c1}*
- ${d2} — *${c2}*

${encounter.text}${heatFlag}

${secret}
`;
}

// ─── FINALE NOTE ─────────────────────────────────────────────────────────────

async function generateFinaleNote(segNum, node, exits, segNumbers, nodeMap, topoName, threatCtx, adventureName, catalystResult) {
  const [sensory] = await pick("Urban Sensory", 1);
  const [d1]      = await pick("Urban Set Dressing", 1);
  const [c1]      = await pick("Urban Set Dressing Condition", 1);
  const [d2]      = await pick("Urban Set Dressing", 1);
  const [c2]      = await pick("Urban Set Dressing Condition", 1);
  const conns     = buildConnections(exits, segNumbers, nodeMap);

  // Discovery Finale
  const [revelation] = await pick("Urban Revelation", 1);
  const [exitState]  = await pick("Urban Exit State", 1);

  // Reward roll (d8)
  const rewardRoll = Math.floor(Math.random() * 8) + 1;
  let reward;
  if (rewardRoll <= 2)      reward = "Intel — the discovery itself is the reward";
  else if (rewardRoll <= 4) reward = "Intel + Access — the truth opens a previously hidden path";
  else if (rewardRoll <= 6) reward = "Intel + Favor — someone wants to reward you for what you found";
  else if (rewardRoll <= 7) reward = "Access + Coin — the discovery leads to something valuable";
  else                      reward = "Intel (campaign-tier) — what you found changes everything";

  return `---
tags: [urban-segment, urban-finale, arcana-engine]
adventure: "${adventureName}"
segment: ${segNum}
label: "${node.label}"
topology: "${topoName}"
finale-track: Discovery
---

## S${String(segNum).padStart(2,"0")} — Finale — ${node.label}

**Sensory:** *${sensory}*

**Connections**
${conns}

**Dressing**
- ${d1} — *${c1}*
- ${d2} — *${c2}*

**Finale Type:** Discovery
**Catalyst Callback:** *The "${catalystResult}" was actually something deeper. What does this change?*

**Revelation:** *${revelation}*

**Exit State:** *${exitState}*

**Reward:** ${reward}
`;
}

// ─── CANVAS LAYOUT ───────────────────────────────────────────────────────────

function layoutNodes(nodes, bfsDepth, topoName) {
  const NODE_W = 420, NODE_H = 520, H_GAP = 100, V_GAP = 80;

  // Layer Cake: top-to-bottom
  if (topoName === "The Layer Cake") {
    const positions = {};
    const sorted = [...nodes].sort((a, b) => (bfsDepth[a.id] ?? 0) - (bfsDepth[b.id] ?? 0));
    sorted.forEach((node, i) => {
      positions[node.id] = { x: 0, y: i * (NODE_H + V_GAP) };
    });
    return positions;
  }

  // Turf: hub centered, spokes radiating
  if (topoName === "The Turf") {
    const positions = {};
    const hub = nodes.find(n => n.label === "Hub");
    const others = nodes.filter(n => n.id !== hub?.id);
    if (hub) positions[hub.id] = { x: 0, y: 0 };
    const angleStep = (2 * Math.PI) / others.length;
    const radius = (NODE_W + H_GAP) * 1.2;
    others.forEach((node, i) => {
      const angle = angleStep * i - Math.PI / 2;
      positions[node.id] = {
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius),
      };
    });
    return positions;
  }

  // Default: BFS depth left-to-right (Trail, Web)
  const byDepth = {};
  for (const node of nodes) {
    const d = bfsDepth[node.id] ?? 0;
    if (!byDepth[d]) byDepth[d] = [];
    byDepth[d].push(node.id);
  }
  const depths = Object.keys(byDepth).map(Number).sort((a, b) => a - b);
  const positions = {};
  for (const d of depths) {
    const group = byDepth[d];
    const count = group.length;
    const totalHeight = count * NODE_H + Math.max(0, count - 1) * V_GAP;
    const x = d * (NODE_W + H_GAP);
    group.forEach((nodeId, i) => {
      const y = -totalHeight / 2 + i * (NODE_H + V_GAP);
      positions[nodeId] = { x: Math.round(x), y: Math.round(y) };
    });
  }
  return positions;
}

function generateCanvasJSON(nodes, adj, bfsDepth, segFilePaths, topoName) {
  const positions = layoutNodes(nodes, bfsDepth, topoName);
  const canvasNodes = nodes.map(node => ({
    id: node.id, type: "file", file: segFilePaths[node.id],
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

function generateMermaid(nodes, adj, segNumbers, nodeMap, topoName) {
  const dir = topoName === "The Layer Cake" ? "TB" : "LR";
  const lines = [`flowchart ${dir}`];
  for (const node of nodes) {
    const num   = segNumbers[node.id];
    const label = node.label || "";
    const fin   = node.isFinale ? " ★" : "";
    const nId   = `S${String(num).padStart(2, "0")}`;
    lines.push(`  ${nId}["S${String(num).padStart(2,"0")} — ${label}${fin}"]`);
  }
  const edgeSet = new Set();
  for (const node of nodes) {
    for (const nbId of (adj[node.id] || [])) {
      const key = [node.id, nbId].sort().join("|");
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        const a = `S${String(segNumbers[node.id]).padStart(2, "0")}`;
        const b = `S${String(segNumbers[nbId]).padStart(2, "0")}`;
        lines.push(`  ${a} --> ${b}`);
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

// ─── CATALYST ────────────────────────────────────────────────────────────────
// Now reads from the Urban Catalyst d200 table file instead of a hardcoded list.

// ─── USER INPUT ──────────────────────────────────────────────────────────────

const adventureName = await tp.system.prompt("Adventure Name");
if (!adventureName) { new Notice("Urban generation cancelled."); return; }

const segStr = await tp.system.prompt("How many segments? (not counting the finale)", "4");
const segCount = Math.max(1, Math.min(8, parseInt(segStr) || 4));

const topoChoices = ["The Trail", "The Web", "The Turf", "The Layer Cake"];
const topoStr = await tp.system.suggester(topoChoices, topoChoices, false, "Choose topology (or cancel to roll random)");
const chosenTopo = topoStr || rnd(topoChoices);

// ─── SETUP ROLLS ─────────────────────────────────────────────────────────────

const [typeArch, typeAtmo]    = await pick("Urban Type",               1, 2);
const [originCat, originFlav] = await pick("Urban Origin",             1, 2);
const [skinName,  skinVis]    = await pick("Urban Environment Skin",   1, 2);
const [motifName, motifDesc]  = await pick("Urban Art Motif",          1, 2);
const [modName,   modDesc]    = await pick("Urban Art Motif Modifier", 1, 2);
const [threatArch, threatBeh, threatSigns] = await pick("Urban Threat Profile", 1, 2, 3);
const [restName,  restDesc]   = await pick("Urban Rest Complications", 1, 2);
const [catalystResult] = await pick("Urban Catalyst", 1);

// Threat context — use Threat Profile as creature identity for v1.0
const threatCtx = {
  id: threatArch,
  low: threatArch,
  mid: threatArch,
  boss: threatArch,
};

// ─── TOPOLOGY RESOLUTION + GRAPH ─────────────────────────────────────────────

const { resolved: resolvedTopo, original: origTopo, wasFallback } = resolveTopology(chosenTopo, segCount);
const graph = GRAPH_BUILDERS[resolvedTopo](segCount);
const { order: bfsOrder, depth: bfsDepth } = bfsGraph(graph.adj, graph.entry);
const segNumbers = assignSegNumbers(bfsOrder, graph.nodes);
const nodeMap    = Object.fromEntries(graph.nodes.map(n => [n.id, n]));
const totalSegs  = segCount + 1;
const finaleId   = bfsOrder.find(id => nodeMap[id]?.isFinale) || bfsOrder[bfsOrder.length - 1];
const fallbackNote = wasFallback ? ` *(rolled ${origTopo}, fell back — needs ${TOPOLOGY_MIN_SEGS[origTopo]} segs)*` : "";

const isInvestigative = ["The Trail", "The Web"].includes(resolvedTopo);

// ─── FOLDER SETUP ────────────────────────────────────────────────────────────

const adventureFolderPath = `${SKETCHES_FOLDER}/${adventureName}`;
try { await app.vault.createFolder(adventureFolderPath); } catch(e) { /* exists */ }

// ─── GENERATE SEGMENT NOTES ─────────────────────────────────────────────────

const segFilePaths  = {};
const segIndexRows  = [];
const segFullBlocks = [];

for (const nodeId of bfsOrder) {
  const node    = nodeMap[nodeId];
  const segNum  = segNumbers[nodeId];

  const exits = (graph.adj[nodeId] || []).map(nbId => ({
    targetId: nbId,
    targetNum: segNumbers[nbId],
    targetLabel: nodeMap[nbId]?.label || "",
  }));

  let noteContent;
  if (node.isFinale) {
    noteContent = await generateFinaleNote(segNum, node, exits, segNumbers, nodeMap, resolvedTopo, threatCtx, adventureName, catalystResult);
  } else {
    noteContent = await generateSegmentNote(segNum, node, exits, segNumbers, nodeMap, resolvedTopo, threatCtx, adventureName, isInvestigative);
  }

  const displayLabel = node.isFinale ? "Finale" : (node.label || `Segment ${segNum}`);
  const segFileName = `S${String(segNum).padStart(2, "0")} — ${safeFileName(displayLabel)}.md`;
  const segFilePath = `${adventureFolderPath}/${segFileName}`;
  await createOrOverwrite(segFilePath, noteContent);
  segFilePaths[nodeId] = segFilePath;
  segFullBlocks.push(noteContent.replace(/^---[\s\S]*?---\n/, "").trimStart());

  const neighborStr = exits.map(e => e.targetLabel ? `S${String(e.targetNum).padStart(2,"0")} (${e.targetLabel})` : `S${String(e.targetNum).padStart(2,"0")}`).join(", ");
  segIndexRows.push(`| [[${segFileName.replace(".md", "")}\\|S${String(segNum).padStart(2,"0")}]] | ${node.label || "—"} | ${neighborStr} |`);
}

// ─── CANVAS ──────────────────────────────────────────────────────────────────

const canvasJson = generateCanvasJSON(graph.nodes, graph.adj, bfsDepth, segFilePaths, resolvedTopo);
await createOrOverwrite(`${adventureFolderPath}/${adventureName}.canvas`, canvasJson);

const mermaidDiagram = generateMermaid(graph.nodes, graph.adj, segNumbers, nodeMap, resolvedTopo);

// ─── DM BRIEFING ─────────────────────────────────────────────────────────────

const briefing = `In the ${skinName.toLowerCase()} ${typeArch.toLowerCase()} shaped by ${originCat.toLowerCase()}, ${catalystResult.toLowerCase()}. The local threat is ${threatArch.toLowerCase()} — ${threatBeh.toLowerCase()}. Signs of presence: ${threatSigns.toLowerCase()}. The cultural motif of ${motifName.toLowerCase()} (${motifDesc.toLowerCase()}) is ${modName.toLowerCase()} — ${modDesc.toLowerCase()}.`;

// ─── ASSEMBLE INDEX NOTE ─────────────────────────────────────────────────────

tR = `---
tags: [urban, sketch, arcana-engine]
segments: ${totalSegs}
topology: "${resolvedTopo}"
finale-track: Discovery
status: sketch
---

# ${adventureName}

> [[${adventureName}.canvas|Open Adventure Canvas]] — segments positioned by topology, connected by narrative flow.

---

## DM Briefing

${briefing}

**Run this as:** A ${resolvedTopo} adventure. ${HEAT_GUIDANCE[resolvedTopo]}

---

## Setup

| | |
|:--|:--|
| **Topology** | **${resolvedTopo}**${fallbackNote} |
| **Context** | ${typeArch} — *${typeAtmo}* |
| **Power** | ${originCat} — *${originFlav}* |
| **Skin** | ${skinName} — *${skinVis}* |
| **Motif** | ${motifName} — *${motifDesc}* |
| **Motif Modifier** | ${modName} — *${modDesc}* |
| **Threat** | ${threatArch} — *${threatBeh}* |
| **↳ Signs** | *${threatSigns}* |
| **Catalyst** | *${catalystResult}* |
| **Rest Pressure** | ${restName} — *${restDesc}* |

---

## Topology

\`\`\`mermaid
${mermaidDiagram}
\`\`\`

---

## Heat Rules

| Heat | State | Effect |
|:----:|:------|:-------|
| 0 | Cold | Normal activity. No adjustments. |
| 1 | Warm | Word is spreading. Locals watch more closely; enemies reposition cautiously. |
| 2 | Hot | Patrols, rivals, or locals actively looking. +1 creature to future combat. |
| 3 | Burning | The block is mobilized. Boss fortifies, relocates, or prepares ambush. |

**${resolvedTopo} Guidance:** ${HEAT_GUIDANCE[resolvedTopo]}

---

## Segment Roster

| Seg | Label | Connections |
|:----|:------|:------------|
${segIndexRows.join("\n")}

---

## Full Content Scan

${segFullBlocks.join("\n\n---\n\n")}

---

*Generated with Arcana Engine v0.25 — Urban Procedure v1.0*
`;

// Move index note into adventure subfolder
await tp.file.move(`${adventureFolderPath}/${adventureName}`);
%>
