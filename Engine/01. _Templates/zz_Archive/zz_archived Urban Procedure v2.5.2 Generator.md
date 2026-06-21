> [!info] Urban Procedure v2.5.2 Generator
> **To run:** Cmd/Ctrl+P → *Templater: Create new note from template* → pick this file.
> You'll be prompted for adventure name, segment count, play tier, and topology. The generator creates a **subfolder** in Urban/Sketches containing individual segment notes, a `.canvas` topology map, and an index overview note.
>
> **One-time setup:** Settings → Templater → Template folder location → `Arcana Engine v 0.25/00. Engine/01. _Templates`
>
> **What gets generated:**
> - **`{name}.canvas`** — segments as linked cards, positioned by topology. Open in Obsidian Canvas for live play.
> - **`S{nn} — {label}.md`** — one note per segment. Contains location, sensory, encounter, dressing, transition, secret.
> - **`{name}.md`** — index note with DM Briefing, Setup table, topology diagram, segment roster, Heat rules, and full content scan.
>
> v2.5.2: **Label diversity overhaul** — fixes label monotony across all 16 topologies.
> - **Cycle topologies** (Trail, Mosaic, Carousel, Crucible, Tightrope, Gauntlet, Rundown): inject thematic breather nodes (Hub, Cold Scene, Event Scene, Escalation) at regular intervals instead of clamping to a single label.
> - **Ramping topologies** (Shell Game, Layer Cake, Stronghold, Stakeout, Ratchet): distribute labels proportionally across segment count so temperature/depth gradients scale with adventure length.
> - **Turf**: spoke nodes cycle through Excursion/Surface/Event Scene for district variety.
> - New shared helpers: `cycleLabel()`, `pureCycleLabel()`, `rampLabel()`.

<%*
// =============================================================================
// URBAN SKETCH GENERATOR — Arcana Engine v0.25 · Urban Procedure v2.5.2
// v2.5.2: Label diversity overhaul. Cycle topologies inject breather nodes;
//         ramping topologies use proportional distribution; Turf spokes cycle.
//         Shared helpers: cycleLabel(), pureCycleLabel(), rampLabel().
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

// ─── TOPOLOGY CONFIG (all 16) ────────────────────────────────────────────────

const TOPOLOGY_MIN_SEGS = {
  "The Trail": 2, "The Web": 3, "The Mosaic": 3, "The Shell Game": 2,
  "The Turf": 3, "The Layer Cake": 3, "The Stronghold": 3, "The Gauntlet": 3,
  "The Rundown": 2, "The Carousel": 3, "The Stakeout": 3, "The Crucible": 2,
  "The Double Cross": 3, "The Tightrope": 3, "The Ratchet": 3, "The Fracture": 4,
};

const TOPOLOGY_FALLBACK = {
  // Investigative — floor: The Trail (min 2)
  "The Web":          "The Trail",
  "The Mosaic":       "The Trail",
  // Shell Game (min 2) — already at floor

  // Navigational — no min-2 in family, cross to closest feel
  "The Turf":         "The Trail",         // hub-and-spoke → spine
  "The Layer Cake":   "The Trail",         // onion → spine (loses depth, keeps linearity)
  "The Stronghold":   "The Trail",         // fortified hub → spine (was Layer Cake no-op)
  "The Gauntlet":     "The Rundown",       // survive-and-push → cascade (closest feel)

  // Reactive — floor: Rundown (min 2), Crucible (min 2)
  "The Carousel":     "The Crucible",      // dense event pressure → dense cluster
  "The Stakeout":     "The Rundown",       // timeline → cascade
  // Rundown (min 2), Crucible (min 2) — already at floor

  // Competitive — no min-2 in family, cross to Reactive floor
  "The Fracture":     "The Double Cross",  // figure-8 → loop (stays in family, min 4→3)
  "The Double Cross": "The Crucible",      // trapped with rivals → pressure cooker
  "The Tightrope":    "The Crucible",      // faction tension → pressure cooker
  "The Ratchet":      "The Rundown",       // contracting → cascading pressure
};

// ─── TOPOLOGY LABELS (all 16) ────────────────────────────────────────────────

const TOPOLOGY_LABELS = {
  // --- CYCLE TOPOLOGIES (repeat after prefix, breathers injected) ---
  "The Trail":        { seq: ["Opening", "Lead", "Lead", "Lead", "Lead", "Hub"], finale: "Finale" },
  "The Mosaic":       { seq: ["Fragment", "Fragment", "Fragment", "Fragment", "Cold Scene"], finale: "Revelation" },
  "The Carousel":     { seq: ["Arrival", "Event Scene", "Event Scene", "Event Scene", "Hub", "Event Scene", "Event Scene", "Event Scene"], finale: "Climax" },
  "The Crucible":     { seq: ["Containment", "Pressure", "Pressure", "Pressure", "Event Scene", "Pressure", "Pressure", "Pressure"], finale: "Release" },
  "The Tightrope":    { seq: ["Introduction", "Faction Scene", "Faction Scene", "Faction Scene", "Hub", "Faction Scene", "Faction Scene", "Faction Scene"], finale: "Reckoning" },
  "The Gauntlet":     { seq: ["Start", "Waypoint", "Waypoint", "Waypoint", "Escalation", "Waypoint", "Waypoint", "Waypoint"], finale: "Haven" },
  "The Rundown":      { seq: ["Spark", "Escalation", "Escalation", "Escalation", "Hub", "Escalation", "Escalation", "Escalation", "Event Scene"], finale: "Breaking Point" },
  // --- RAMPING TOPOLOGIES (proportional distribution across segment count) ---
  "The Shell Game":   { seq: ["Cold Scene", "Cold Scene", "Warm Scene", "Hot Scene", "Hot Scene"], finale: "Finale" },
  "The Layer Cake":   { layers: ["Surface", "Surface", "Threshold", "Inner", "Inner", "Inner"], finale: "Core" },
  "The Stronghold":   { layers: ["Approach", "Approach", "Outer Ring", "Inner Ring", "Inner Ring"], finale: "Sanctum" },
  "The Stakeout":     { seq: ["Setup", "Watch", "Watch", "Incident", "Incident", "Incident"], finale: "Payoff" },
  "The Ratchet":      { seq: ["Open", "Open", "Narrowing", "Narrowing", "Narrowing", "Narrowing"], finale: "Cornered" },
  // --- STRUCTURAL TOPOLOGIES (diverse by graph shape) ---
  "The Web":          { seq: ["Opening", "Core Lead", "Core Lead", "Core Lead", "Core Lead", "Core Lead"], branch: "Side Lead", finale: "Finale" },
  "The Turf":         { hub: "Hub", spokeSeq: ["Excursion", "Excursion", "Excursion", "Surface", "Excursion", "Excursion", "Excursion", "Event Scene"], finale: "Finale" },
  "The Double Cross": { pathA: "Path A", pathB: "Path B", opening: "Opening", convergence: "Convergence", finale: "Finale" },
  "The Fracture":     { opening: "Opening", splitPoint: "Split Point", threadA: "Thread A", threadB: "Thread B", reunion: "Reunion", finale: "Finale" },
};

// ─── PER-TOPOLOGY ENCOUNTER WEIGHTS ──────────────────────────────────────────
// Order: Enemy, Social, Problem, Hazard, Commerce, Spectacle, Rumor, Empty

const ENCOUNTER_WEIGHTS = {
  "The Trail":        [10, 20, 15,  5,  5,  5, 30, 10],
  "The Web":          [15, 20, 10,  5, 10, 10, 20, 10],
  "The Mosaic":       [10, 15, 10, 10, 10, 15, 25,  5],
  "The Shell Game":   [15, 20, 15,  5, 10,  5, 20, 10],
  "The Turf":         [15, 20, 10,  5, 15, 10, 15, 10],
  "The Layer Cake":   [15, 15, 20, 10,  5,  5, 15, 15],
  "The Stronghold":   [25, 10, 20, 15,  5,  0, 10, 15],
  "The Gauntlet":     [30,  5, 15, 20,  0,  5,  5, 20],
  "The Rundown":      [25,  5, 15, 20,  0, 10, 10, 15],
  "The Carousel":     [15, 15, 10, 10, 10, 25, 10,  5],
  "The Stakeout":     [20, 15, 10, 10,  5,  5, 25, 10],
  "The Crucible":     [20, 25, 15, 10,  5,  5, 10, 10],
  "The Double Cross": [20, 15, 15, 10, 10,  5, 15, 10],
  "The Tightrope":    [15, 30,  5,  5, 15, 10, 15,  5],
  "The Ratchet":      [25, 10, 15, 15,  5,  5, 10, 15],
  "The Fracture":     [20, 15, 15, 10, 10,  5, 15, 10],
};

const ENCOUNTER_BRANCHES = ["Enemy", "Social", "Problem", "Hazard", "Commerce", "Spectacle", "Rumor", "Empty"];

// ─── HEAT GUIDANCE (all 16) ──────────────────────────────────────────────────

const HEAT_START = {
  "The Trail": 0, "The Web": 0, "The Mosaic": 0, "The Shell Game": 1,
  "The Turf": 0, "The Layer Cake": 0, "The Stronghold": 1, "The Gauntlet": 2,
  "The Rundown": 3, "The Carousel": 0, "The Stakeout": 0, "The Crucible": 1,
  "The Double Cross": 0, "The Tightrope": 1, "The Ratchet": 1, "The Fracture": 0,
};

const HEAT_GUIDANCE = {
  "The Trail":        "Heat represents exposure — the target learns you're asking questions.",
  "The Web":          "Side leads don't generate Heat; core leads do.",
  "The Mosaic":       "Heat is fragmented — different fragments may have independent Heat tracks.",
  "The Shell Game":   "Heat means the target knows you're following. They move faster.",
  "The Turf":         "Heat accumulates in the district. The Hub becomes less safe.",
  "The Layer Cake":   "Each layer has its own Heat awareness. Surface Heat doesn't reach Inner.",
  "The Stronghold":   "Heat is expected. Starts at 1. Reaching 3 triggers lockdown.",
  "The Gauntlet":     "Starts at Heat 2. Every segment risks +1. This is a pressure cooker.",
  "The Rundown":      "Heat is the default state. You're already Burning — Heat 3 from the start.",
  "The Carousel":     "Heat = attention during a public event. Burning means the crowd turns on you.",
  "The Stakeout":     "Heat = blown cover. Heat 1 means the target is suspicious. Heat 3, they know.",
  "The Crucible":     "Heat = tension between trapped NPCs. Burning means someone snaps.",
  "The Double Cross": "Heat on one path doesn't affect the other — unless the paths converge.",
  "The Tightrope":    "Heat is faction-specific. Angering one faction raises Heat with them only.",
  "The Ratchet":      "Heat only goes up. No resets. This is the whole point of the topology.",
  "The Fracture":     "Each thread tracks Heat independently. Reunion combines the higher value.",
};

// ─── TOPOLOGY POSTURE & FINALE DEFAULTS ──────────────────────────────────────

const TOPOLOGY_POSTURE = {
  "The Trail": "Investigative", "The Web": "Investigative",
  "The Mosaic": "Investigative", "The Shell Game": "Investigative",
  "The Turf": "Navigational", "The Layer Cake": "Navigational",
  "The Stronghold": "Navigational", "The Gauntlet": "Navigational",
  "The Rundown": "Reactive", "The Carousel": "Reactive",
  "The Stakeout": "Reactive", "The Crucible": "Reactive",
  "The Double Cross": "Competitive", "The Tightrope": "Competitive",
  "The Ratchet": "Competitive", "The Fracture": "Competitive",
};

const FINALE_DEFAULTS = {
  "The Trail": "Discovery", "The Web": "Discovery",
  "The Mosaic": "Discovery", "The Shell Game": "Discovery",
  "The Layer Cake": "Discovery",
  "The Turf": "Discovery",       // flexible
  "The Stronghold": "Combat", "The Gauntlet": "Combat",
  "The Rundown": "Combat", "The Ratchet": "Combat",
  "The Stakeout": "Social", "The Crucible": "Social",
  "The Tightrope": "Social", "The Double Cross": "Social",
  "The Carousel": "Discovery",   // flexible
  "The Fracture": "Discovery",   // flexible
};

// ─── TOPOLOGY-AWARE SEGMENT FIELDS ──────────────────────────────────────────

const TOPOLOGY_FIELDS = {
  "The Trail":        (node) => `\n**Intel Thread:** *[What information is available here? Where does it point?]*`,
  "The Web":          (node) => `\n**Intel Thread:** *[What information is available here? Where does it point?]*`,
  "The Mosaic":       (node) => `\n**Intel Thread:** *[What pattern piece does this fragment add?]*`,
  "The Shell Game":   (node) => `\n**Intel Thread:** *[Was the target here? What trail did they leave?]*`,
  "The Tightrope":    (node) => `\n**Faction Disposition:** *[Which faction controls this scene? How do they view the party?]*`,
  "The Stakeout":     (node) => `\n**Time Elapsed:** *[How long since Setup? What has changed since last Watch?]*`,
  "The Crucible":     (node) => `\n**NPC Tension:** *[Who is close to breaking? What are they about to do?]*`,
  "The Ratchet":      (node) => `\n**What Closes:** *[What option, ally, or route becomes unavailable after this segment?]*`,
  "The Carousel":     (node) => `\n**Event Beat:** *[What phase of the public event is happening? What does the crowd do?]*`,
  "The Gauntlet":     (node) => `\n**Pursuit Status:** *[How close are the pursuers? What resource is running out?]*`,
  "The Rundown":      (node) => `\n**Pursuit Status:** *[What just escalated? What will escalate next if the party doesn't act?]*`,
  "The Stronghold":   (node) => `\n**Defenses:** *[What security must be bypassed or overcome here?]*`,
  "The Double Cross": (node) => `\n**Path Context:** *[Is this Path A (overt) or Path B (covert)? What does each path sacrifice?]*`,
  "The Fracture":     (node) => `\n**Thread Context:** *[Which thread is this? What is the other group dealing with right now?]*`,
};

// ─── LABEL → SUB-TABLE MAPPING ──────────────────────────────────────────────
// Maps structural labels to their segment type sub-table file basenames.
// Labels not in this map skip the sub-table roll (finales use their own system).

const LABEL_TO_SUBTABLE = {
  // Shared
  "Opening": "Urban Segment Opening",
  "Arrival": "Urban Segment Opening",
  "Start": "Urban Segment Opening",
  "Setup": "Urban Segment Opening",
  "Introduction": "Urban Segment Opening",
  "Containment": "Urban Segment Opening",
  // Investigative
  "Lead": "Urban Segment Lead",
  "Core Lead": "Urban Segment Lead",
  "Side Lead": "Urban Segment Side Lead",
  "Fragment": "Urban Segment Fragment",
  "Cold Scene": "Urban Segment Cold Scene",
  "Warm Scene": "Urban Segment Warm Scene",
  "Hot Scene": "Urban Segment Hot Scene",
  // Navigational
  "Hub": "Urban Segment Hub",
  "Excursion": "Urban Segment Excursion",
  "Surface": "Urban Segment Surface",
  "Threshold": "Urban Segment Threshold",
  "Inner": "Urban Segment Inner",
  "Core": "Urban Segment Inner",
  "Inner Ring": "Urban Segment Inner",
  "Approach": "Urban Segment Approach",
  "Outer Ring": "Urban Segment Approach",
  "Waypoint": "Urban Segment Waypoint",
  // Reactive
  "Spark": "Urban Segment Escalation",
  "Escalation": "Urban Segment Escalation",
  "Pressure": "Urban Segment Escalation",
  "Event Scene": "Urban Segment Event Scene",
  "Watch": "Urban Segment Event Scene",
  "Incident": "Urban Segment Event Scene",
  // Competitive
  "Path A": "Urban Segment Path",
  "Path B": "Urban Segment Path",
  "Thread A": "Urban Segment Path",
  "Thread B": "Urban Segment Path",
  "Open": "Urban Segment Path",
  "Faction Scene": "Urban Segment Faction Scene",
  "Narrowing": "Urban Segment Faction Scene",
  // Special (no sub-table — handled by graph position or finale)
  "Convergence": null,
  "Split Point": null,
  "Reunion": null,
};

// ─── OVERFLOW MAP (when primary table exhausted, spill into related table) ───
const SUBTABLE_OVERFLOW = {
  "Urban Segment Opening":      "Urban Segment Event Scene",
  "Urban Segment Lead":         "Urban Segment Side Lead",
  "Urban Segment Side Lead":    "Urban Segment Lead",
  "Urban Segment Fragment":     "Urban Segment Cold Scene",
  "Urban Segment Cold Scene":   "Urban Segment Fragment",
  "Urban Segment Warm Scene":   "Urban Segment Hot Scene",
  "Urban Segment Hot Scene":    "Urban Segment Warm Scene",
  "Urban Segment Hub":          "Urban Segment Surface",
  "Urban Segment Excursion":    "Urban Segment Waypoint",
  "Urban Segment Surface":      "Urban Segment Hub",
  "Urban Segment Threshold":    "Urban Segment Approach",
  "Urban Segment Inner":        "Urban Segment Threshold",
  "Urban Segment Approach":     "Urban Segment Threshold",
  "Urban Segment Waypoint":     "Urban Segment Excursion",
  "Urban Segment Escalation":   "Urban Segment Event Scene",
  "Urban Segment Event Scene":  "Urban Segment Escalation",
  "Urban Segment Path":         "Urban Segment Excursion",
  "Urban Segment Faction Scene":"Urban Segment Event Scene",
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

// Track used sub-table results per table to avoid duplicates
const _usedSubResults = {};

async function rollSubTable(label) {
  const tableName = LABEL_TO_SUBTABLE[label];
  if (!tableName) return null;
  const rows = await readTable(tableName);
  if (!rows.length) return null;

  if (!_usedSubResults[tableName]) _usedSubResults[tableName] = new Set();
  const used = _usedSubResults[tableName];

  // Try to pick an unused row from primary table
  let unused = rows.filter(r => !used.has((r[1] || "").trim()));

  // If primary exhausted, spill into overflow table
  if (!unused.length && SUBTABLE_OVERFLOW[tableName]) {
    const overflowName = SUBTABLE_OVERFLOW[tableName];
    const overflowRows = await readTable(overflowName);
    if (overflowRows.length) {
      if (!_usedSubResults[overflowName]) _usedSubResults[overflowName] = new Set();
      const overflowUsed = _usedSubResults[overflowName];
      const overflowUnused = overflowRows.filter(r => !overflowUsed.has((r[1] || "").trim()));
      if (overflowUnused.length) {
        const row = rnd(overflowUnused);
        const segType = (row[1] || "").trim();
        overflowUsed.add(segType);
        return { segType, description: (row[2] || "").trim(), transition: (row[3] || "").trim() };
      }
    }
  }

  // Use unused from primary, or fall back to any row if both tables exhausted
  const pool = unused.length ? unused : rows;
  const row = rnd(pool);
  const segType = (row[1] || "").trim();
  used.add(segType);

  return {
    segType,
    description: (row[2] || "").trim(),
    transition: (row[3] || "").trim(),
  };
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

// ─── TOPOLOGY GRAPH BUILDERS (all 16) ────────────────────────────────────────

// Label assignment helpers — shared across graph builders.
// cycleLabel: first element is a fixed prefix (Opening/Spark/etc), then cycle
//             through the remaining elements. Used by identity topologies.
// rampLabel:  distribute labels proportionally across n segments so the ratio
//             of cool→warm→hot (or open→narrow) scales with adventure length.
//             Used by ramping topologies (Shell Game, Layer Cake, etc).
// pureCycleLabel: no prefix, cycle from the start. Used by Mosaic.
function cycleLabel(i, seq) {
  if (i === 1) return seq[0];
  const cycle = seq.slice(1);
  return cycle[(i - 2) % cycle.length];
}
function pureCycleLabel(i, seq) {
  return seq[(i - 1) % seq.length];
}
function rampLabel(i, n, labels) {
  return labels[Math.min(Math.floor((i - 1) * labels.length / n), labels.length - 1)];
}

function buildTrailGraph(n) {
  // Linear investigation chain. Cycle: Opening → [Lead×4, Hub] repeat → Finale.
  const labels = TOPOLOGY_LABELS["The Trail"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = cycleLabel(i, labels.seq);
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
  // Hub-and-spoke: spokes cycle through [Excursion×3, Surface, Excursion×3, Event Scene]
  // for district variety instead of all-Excursion monotone.
  const labels = TOPOLOGY_LABELS["The Turf"];
  const spokeCount = n - 1; // minus hub
  const nodes = [
    { id: "s1", label: labels.hub, isFinale: false },
  ];
  const edges = [];
  for (let i = 0; i < spokeCount; i++) {
    const id = `s${i+2}`;
    const label = labels.spokeSeq[i % labels.spokeSeq.length];
    nodes.push({ id, label, isFinale: false });
    edges.push(["s1", id]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push(["s1", "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildLayerCakeGraph(n) {
  // Proportional Surface → Threshold → Inner depth ramp.
  const labels = TOPOLOGY_LABELS["The Layer Cake"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = rampLabel(i, n, labels.layers);
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildMosaicGraph(n) {
  // Emergent graph: fragments with periodic Cold Scene contemplation beats.
  // Pure cycle: [Fragment×4, Cold Scene] repeat → Revelation.
  const labels = TOPOLOGY_LABELS["The Mosaic"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = pureCycleLabel(i, labels.seq);
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildShellGameGraph(n) {
  // Shifting nodes: linear chase with proportional Cold → Warm → Hot temperature ramp.
  const labels = TOPOLOGY_LABELS["The Shell Game"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = rampLabel(i, n, labels.seq);
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildStrongholdGraph(n) {
  // Fortified hub: proportional Approach → Outer Ring → Inner Ring depth ramp.
  const labels = TOPOLOGY_LABELS["The Stronghold"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = rampLabel(i, n, labels.layers);
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildGauntletGraph(n) {
  // Inverted convergence: branches merge toward haven.
  // Main spine cycles: Start → [Waypoint×3, Escalation, Waypoint×3] repeat.
  // Branch nodes stay as Waypoint (alternate escape routes).
  const labels = TOPOLOGY_LABELS["The Gauntlet"];
  const nodes = [], edges = [];
  const mainLen = Math.max(2, Math.ceil(n * 0.6));
  const branchCount = n - mainLen;
  for (let i = 1; i <= mainLen; i++) {
    const label = cycleLabel(i, labels.seq);
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  for (let b = 0; b < branchCount; b++) {
    const bId = `b${b+1}`;
    nodes.push({ id: bId, label: "Waypoint", isFinale: false });
    const attachIdx = Math.min(mainLen, 2 + b);
    edges.push([bId, `s${attachIdx}`]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${mainLen}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildRundownGraph(n) {
  // Cascade: linear, no backtracking, escalating labels with breather beats.
  // Seq pattern: Spark, then repeating cycle of [Esc×3, Hub, Esc×3, Event Scene].
  // Hub = safe-house regrouping. Event Scene = spectacle that shifts context.
  const labels = TOPOLOGY_LABELS["The Rundown"];
  const cycle = labels.seq.slice(1); // the 8-element repeating block after Spark
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    let label;
    if (i === 1) {
      label = labels.seq[0]; // Spark
    } else {
      label = cycle[(i - 2) % cycle.length];
    }
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildCarouselGraph(n) {
  // Loop + tail: public event with Hub backstage breathers.
  // Cycle: Arrival → [Event Scene×3, Hub, Event Scene×3] repeat → Climax.
  const labels = TOPOLOGY_LABELS["The Carousel"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = cycleLabel(i, labels.seq);
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  if (n >= 3) edges.push([`s${n}`, `s2`]);
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildStakeoutGraph(n) {
  // Timeline spine: proportional Setup → Watch → Incident ramp.
  const labels = TOPOLOGY_LABELS["The Stakeout"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = rampLabel(i, n, labels.seq);
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildCrucibleGraph(n) {
  // Dense cluster: all nodes interconnected.
  // Cycle: Containment → [Pressure×3, Event Scene, Pressure×3] repeat → Release.
  const labels = TOPOLOGY_LABELS["The Crucible"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = cycleLabel(i, labels.seq);
    nodes.push({ id: `s${i}`, label, isFinale: false });
  }
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      edges.push([`s${i}`, `s${j}`]);
    }
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  for (let i = 1; i <= n; i++) edges.push([`s${i}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildDoubleCrossGraph(n) {
  // Loop: opening → path A nodes and path B nodes in parallel → convergence → finale
  const labels = TOPOLOGY_LABELS["The Double Cross"];
  const nodes = [], edges = [];
  nodes.push({ id: "s1", label: labels.opening, isFinale: false });
  const remaining = n - 2;
  const pathACount = Math.ceil(remaining / 2);
  const pathBCount = remaining - pathACount;
  let nodeIdx = 2;
  const pathAIds = [], pathBIds = [];
  for (let i = 0; i < pathACount; i++) {
    const id = `s${nodeIdx++}`;
    nodes.push({ id, label: labels.pathA, isFinale: false });
    pathAIds.push(id);
  }
  for (let i = 0; i < pathBCount; i++) {
    const id = `s${nodeIdx++}`;
    nodes.push({ id, label: labels.pathB, isFinale: false });
    pathBIds.push(id);
  }
  const convId = `s${nodeIdx}`;
  nodes.push({ id: convId, label: labels.convergence, isFinale: false });
  if (pathAIds.length) edges.push(["s1", pathAIds[0]]);
  if (pathBIds.length) edges.push(["s1", pathBIds[0]]);
  if (!pathBIds.length) edges.push(["s1", convId]);
  for (let i = 1; i < pathAIds.length; i++) edges.push([pathAIds[i-1], pathAIds[i]]);
  for (let i = 1; i < pathBIds.length; i++) edges.push([pathBIds[i-1], pathBIds[i]]);
  if (pathAIds.length) edges.push([pathAIds[pathAIds.length - 1], convId]);
  if (pathBIds.length) edges.push([pathBIds[pathBIds.length - 1], convId]);
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([convId, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildTightropeGraph(n) {
  // Weighted mesh: faction scenes with Hub neutral-ground breathers.
  // Cycle: Introduction → [Faction Scene×3, Hub, Faction Scene×3] repeat → Reckoning.
  const labels = TOPOLOGY_LABELS["The Tightrope"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = cycleLabel(i, labels.seq);
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  for (let i = 2; i <= n; i++) {
    for (let j = i + 2; j <= n; j++) {
      if (Math.random() < 0.4) edges.push([`s${i}`, `s${j}`]);
    }
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildRatchetGraph(n) {
  // Contracting: proportional Open → Narrowing ramp. Many connections early, few late.
  const labels = TOPOLOGY_LABELS["The Ratchet"];
  const nodes = [], edges = [];
  for (let i = 1; i <= n; i++) {
    const label = rampLabel(i, n, labels.seq);
    nodes.push({ id: `s${i}`, label, isFinale: false });
    if (i > 1) edges.push([`s${i-1}`, `s${i}`]);
  }
  for (let i = 1; i <= Math.floor(n / 2); i++) {
    for (let j = i + 2; j <= Math.min(n, i + 3); j++) {
      edges.push([`s${i}`, `s${j}`]);
    }
  }
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([`s${n}`, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

function buildFractureGraph(n) {
  // Figure-8: opening → split point → thread A / thread B in parallel → reunion → finale
  const labels = TOPOLOGY_LABELS["The Fracture"];
  const nodes = [], edges = [];
  nodes.push({ id: "s1", label: labels.opening, isFinale: false });
  nodes.push({ id: "s2", label: labels.splitPoint, isFinale: false });
  edges.push(["s1", "s2"]);
  const remaining = n - 3;
  const threadACount = Math.ceil(remaining / 2);
  const threadBCount = remaining - threadACount;
  let nodeIdx = 3;
  const threadAIds = [], threadBIds = [];
  for (let i = 0; i < threadACount; i++) {
    const id = `s${nodeIdx++}`;
    nodes.push({ id, label: labels.threadA, isFinale: false });
    threadAIds.push(id);
  }
  for (let i = 0; i < threadBCount; i++) {
    const id = `s${nodeIdx++}`;
    nodes.push({ id, label: labels.threadB, isFinale: false });
    threadBIds.push(id);
  }
  const reunionId = `s${nodeIdx}`;
  nodes.push({ id: reunionId, label: labels.reunion, isFinale: false });
  if (threadAIds.length) edges.push(["s2", threadAIds[0]]);
  if (threadBIds.length) edges.push(["s2", threadBIds[0]]);
  for (let i = 1; i < threadAIds.length; i++) edges.push([threadAIds[i-1], threadAIds[i]]);
  for (let i = 1; i < threadBIds.length; i++) edges.push([threadBIds[i-1], threadBIds[i]]);
  if (threadAIds.length) edges.push([threadAIds[threadAIds.length - 1], reunionId]);
  else edges.push(["s2", reunionId]);
  if (threadBIds.length) edges.push([threadBIds[threadBIds.length - 1], reunionId]);
  nodes.push({ id: "finale", label: labels.finale, isFinale: true });
  edges.push([reunionId, "finale"]);
  return { ...buildGraph(nodes, edges), entry: "s1" };
}

const GRAPH_BUILDERS = {
  "The Trail": buildTrailGraph, "The Web": buildWebGraph,
  "The Turf": buildTurfGraph, "The Layer Cake": buildLayerCakeGraph,
  "The Mosaic": buildMosaicGraph, "The Shell Game": buildShellGameGraph,
  "The Stronghold": buildStrongholdGraph, "The Gauntlet": buildGauntletGraph,
  "The Rundown": buildRundownGraph, "The Carousel": buildCarouselGraph,
  "The Stakeout": buildStakeoutGraph, "The Crucible": buildCrucibleGraph,
  "The Double Cross": buildDoubleCrossGraph, "The Tightrope": buildTightropeGraph,
  "The Ratchet": buildRatchetGraph, "The Fracture": buildFractureGraph,
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
    // 30% chance to upgrade to a Boon — explicitly positive encounter
    if (Math.random() < 0.30) {
      const [boon, desc, benefit] = await pick("Urban Boon", 1, 2, 3);
      return { type: "Boon", text: `**Encounter: Boon** *(${boon})*\n- ${desc}\n- Benefit: *${benefit}*`, isEnemy: false };
    }
    const [entity, event, hook] = await pick("Urban Contact", 1, 2, 3);
    return { type: "Social", text: `**Encounter: Social / Contact**\n- *${entity}* — ${event}\n- Hook: *${hook}*`, isEnemy: false };
  }

  if (branch === "Problem") {
    const [obstacle, solving] = await pick("Urban Problem", 1, 2);
    return { type: "Problem", text: `**Encounter: Problem / Obstacle**\n- *${obstacle}* — ${solving}`, isEnemy: false };
  }

  if (branch === "Hazard") {
    const [hazardType, hazardDesc] = await pick("Urban Hazard", 1, 2);
    return { type: "Hazard", text: `**Encounter: Hazard** *(${hazardType})*\n- ${hazardDesc}`, isEnemy: false };
  }

  if (branch === "Commerce") {
    // 25% chance to upgrade to a Boon — explicitly positive encounter
    if (Math.random() < 0.25) {
      const [boon, desc, benefit] = await pick("Urban Boon", 1, 2, 3);
      return { type: "Boon", text: `**Encounter: Boon** *(${boon})*\n- ${desc}\n- Benefit: *${benefit}*`, isEnemy: false };
    }
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
  const [emptyResult, emptyImpact] = await pick("Urban Empty Result", 2, 3);
  return { type: "Empty", text: `**Encounter: Empty**\n- *${emptyResult}* — ${emptyImpact}`, isEnemy: false };
}

// ─── SECRET ──────────────────────────────────────────────────────────────────

async function buildSecret() {
  const [sensory] = await pick("Urban Sensory", 1);
  return `**Secret / Detail:** *${sensory}*`;
}

// ─── EDGE DENSITY HELPERS ────────────────────────────────────────────────────
// Dense topologies (Crucible, Tightrope at high counts) can produce hundreds
// of edges. These helpers simplify visual output while preserving narrative truth.

const MAX_VISUAL_EDGES = 60;   // Above this, mermaid/canvas get simplified
const MAX_DISPLAY_CONNS = 8;   // Per-segment cap in notes and roster

// Count total unique edges in an adjacency list.
function countEdges(adj) {
  const seen = new Set();
  for (const [src, targets] of Object.entries(adj)) {
    for (const tgt of targets) {
      const key = [src, tgt].sort().join("|");
      if (!seen.has(key)) seen.add(key);
    }
  }
  return seen.size;
}

// Return a pruned adjacency list for visual display.
// Keeps: sequential spine, breather/finale connections, nearest ±2 neighbors.
function simplifyForDisplay(nodes, adj) {
  const totalEdges = countEdges(adj);
  if (totalEdges <= MAX_VISUAL_EDGES) return { adj, simplified: false };
  const simpleAdj = {};
  for (const n of nodes) simpleAdj[n.id] = new Set();
  // Sort nodes by their id number for spine ordering
  const ordered = nodes.filter(n => !n.isFinale).sort((a, b) => {
    const na = parseInt(a.id.replace(/\D/g, "")) || 0;
    const nb = parseInt(b.id.replace(/\D/g, "")) || 0;
    return na - nb;
  });
  const finale = nodes.find(n => n.isFinale);
  // Sequential spine
  for (let i = 0; i < ordered.length - 1; i++) {
    simpleAdj[ordered[i].id].add(ordered[i+1].id);
    simpleAdj[ordered[i+1].id].add(ordered[i].id);
  }
  // Every node connects to finale
  if (finale) {
    for (const n of ordered) {
      if ((adj[n.id] || []).includes(finale.id)) {
        simpleAdj[n.id].add(finale.id);
        simpleAdj[finale.id].add(n.id);
      }
    }
  }
  // Breather nodes (non-dominant labels) get ±2 neighbor connections
  const breatherLabels = new Set(["Hub", "Event Scene", "Cold Scene", "Escalation", "Surface"]);
  for (let i = 0; i < ordered.length; i++) {
    if (breatherLabels.has(ordered[i].label)) {
      for (let j = Math.max(0, i-2); j <= Math.min(ordered.length-1, i+2); j++) {
        if (i !== j && (adj[ordered[i].id] || []).includes(ordered[j].id)) {
          simpleAdj[ordered[i].id].add(ordered[j].id);
          simpleAdj[ordered[j].id].add(ordered[i].id);
        }
      }
    }
  }
  // Convert sets to arrays
  const result = {};
  for (const [k, v] of Object.entries(simpleAdj)) result[k] = [...v];
  return { adj: result, simplified: true };
}

// ─── CONNECTIONS ─────────────────────────────────────────────────────────────

function buildConnections(exits, segNumbers, nodeMap, dense) {
  const lines = [];
  const shown = dense ? exits.slice(0, MAX_DISPLAY_CONNS) : exits;
  for (const { targetId } of shown) {
    const num = segNumbers[targetId];
    const node = nodeMap[targetId];
    const label = node?.label || "";
    const displayLabel = node?.isFinale ? "Finale" : (label || `Segment ${num}`);
    const linkTarget = `S${String(num).padStart(2,"0")} — ${safeFileName(displayLabel)}`;
    const displayText = label ? `S${String(num).padStart(2,"0")} (${label})` : `S${String(num).padStart(2,"0")}`;
    lines.push(`- → [[${linkTarget}|${displayText}]]`);
  }
  if (dense && exits.length > MAX_DISPLAY_CONNS) {
    lines.push(`- *... + ${exits.length - MAX_DISPLAY_CONNS} more (all segments interconnected)*`);
  }
  return lines.join("\n");
}

// ─── SEGMENT NOTE ────────────────────────────────────────────────────────────

async function generateSegmentNote(segNum, node, exits, segNumbers, nodeMap, topoName, threatCtx, adventureName, tier, subRoll, dense) {
  const labelStr = node.label ? ` — ${node.label}` : "";
  const [sensory]     = await pick("Urban Sensory", 1);
  const [d1]          = await pick("Urban Set Dressing", 1);
  const [c1]          = await pick("Urban Set Dressing Condition", 1);
  const [d2]          = await pick("Urban Set Dressing", 1);
  const [c2]          = await pick("Urban Set Dressing Condition", 1);
  const conns         = buildConnections(exits, segNumbers, nodeMap, dense);
  const encounter     = await buildEncounter(topoName, threatCtx);
  const secret        = await buildSecret();

  const segTypeBlock = subRoll
    ? `**Location:** *${subRoll.segType}* — ${subRoll.description}\n**Transition:** *${subRoll.transition}*`
    : "";

  const heatFlag = encounter.isEnemy ? "\n\n⚠ **Likely Heat +1**" : "";
  const topoField = TOPOLOGY_FIELDS[topoName] ? TOPOLOGY_FIELDS[topoName](node) : "";

  return `---
tags: [urban-segment, arcana-engine]
adventure: "${adventureName}"
segment: ${segNum}
label: "${node.label}"
topology: "${topoName}"
tier: ${tier}
---

## S${String(segNum).padStart(2,"0")}${labelStr}

${segTypeBlock}

**Sensory:** *${sensory}*
${topoField}

**Connections**
${conns}

**Dressing**
- ${d1} — *${c1}*
- ${d2} — *${c2}*

${encounter.text}${heatFlag}

${secret}
`;
}

// ─── FINALE NOTE (three tracks) ──────────────────────────────────────────────

async function generateFinaleNote(segNum, node, exits, segNumbers, nodeMap, topoName, threatCtx, adventureName, catalystResult, tier, dense) {
  const [sensory] = await pick("Urban Sensory", 1);
  const [d1]      = await pick("Urban Set Dressing", 1);
  const [c1]      = await pick("Urban Set Dressing Condition", 1);
  const [d2]      = await pick("Urban Set Dressing", 1);
  const [c2]      = await pick("Urban Set Dressing Condition", 1);
  const conns     = buildConnections(exits, segNumbers, nodeMap, dense);
  const topoField = TOPOLOGY_FIELDS[topoName] ? TOPOLOGY_FIELDS[topoName](node) : "";

  const finaleTrack = FINALE_DEFAULTS[topoName] || "Discovery";

  // Shared tables
  const [revelation] = await pick("Urban Revelation", 1);
  const [exitState]  = await pick("Urban Exit State", 1);

  // Reward roll (d8)
  const rewardRoll = Math.floor(Math.random() * 8) + 1;

  let trackBlock = "", reward = "";

  if (finaleTrack === "Combat") {
    const [bossArch] = await pick("Urban Boss", 1);
    const [tacticalSetup] = await pick("Urban Tactical Setup", 1);
    const bossCreature = pickFromPool(threatCtx.boss);
    trackBlock = `**Finale Type:** Combat
**Boss:** *${bossArch}*
**Boss Creature:** *${bossCreature}* (${threatCtx.id})
**Tactical Setup:** *${tacticalSetup}*

**Revelation:** *${revelation}*`;
    if (rewardRoll <= 2)      reward = "Coin — the spoils of victory";
    else if (rewardRoll <= 4) reward = "Coin + Access — the boss's territory is now open";
    else if (rewardRoll <= 6) reward = "Favor — a grateful faction owes the party";
    else if (rewardRoll <= 7) reward = "Intel + Coin — the boss's records reveal something valuable";
    else                      reward = "Access (campaign-tier) — the boss guarded something extraordinary";

  } else if (finaleTrack === "Social") {
    const [npcContact] = await pick("Urban Contact", 1);
    const narrativeRows = await readTable("Urban Narrative Device");
    let deviceBlock = "";
    if (narrativeRows.length) {
      const dRow = rnd(narrativeRows);
      const dName = (dRow[1] || "").trim();
      const dCore = (dRow[2] || "").trim();
      const dMisread = (dRow[3] || "").trim();
      const dLeverage = (dRow[4] || "").trim();
      deviceBlock = `**Narrative Device:** *${dName}*
- Core: ${dCore}
- Player Misread: ${dMisread}
- DM Leverage: ${dLeverage}`;
    }
    trackBlock = `**Finale Type:** Social
**Key NPC:** *${npcContact}*
${deviceBlock}

**Revelation:** *${revelation}*`;
    if (rewardRoll <= 2)      reward = "Favor — the NPC owes you personally";
    else if (rewardRoll <= 4) reward = "Intel — the conversation revealed something no one else knows";
    else if (rewardRoll <= 6) reward = "Access + Favor — doors open that were closed before";
    else if (rewardRoll <= 7) reward = "Intel + Access — the NPC grants both knowledge and a key";
    else                      reward = "Favor (campaign-tier) — you've made an ally who will change the game";

  } else {
    // Discovery
    trackBlock = `**Finale Type:** Discovery
**Catalyst Callback:** *The "${catalystResult}" was actually something deeper. What does this change?*

**Revelation:** *${revelation}*`;
    if (rewardRoll <= 2)      reward = "Intel — the discovery itself is the reward";
    else if (rewardRoll <= 4) reward = "Intel + Access — the truth opens a previously hidden path";
    else if (rewardRoll <= 6) reward = "Intel + Favor — someone wants to reward you for what you found";
    else if (rewardRoll <= 7) reward = "Access + Coin — the discovery leads to something valuable";
    else                      reward = "Intel (campaign-tier) — what you found changes everything";
  }

  return `---
tags: [urban-segment, urban-finale, arcana-engine]
adventure: "${adventureName}"
segment: ${segNum}
label: "${node.label}"
topology: "${topoName}"
finale-track: ${finaleTrack}
tier: ${tier}
---

## S${String(segNum).padStart(2,"0")} — Finale — ${node.label}

**Sensory:** *${sensory}*
${topoField}

**Connections**
${conns}

**Dressing**
- ${d1} — *${c1}*
- ${d2} — *${c2}*

${trackBlock}

**Exit State:** *${exitState}*

**Reward:** ${reward}
`;
}

// ─── CANVAS LAYOUT ───────────────────────────────────────────────────────────

function layoutNodes(nodes, bfsDepth, topoName) {
  const NODE_W = 420, NODE_H = 520, H_GAP = 100, V_GAP = 80;

  // Top-to-bottom: Layer Cake, Stronghold
  if (["The Layer Cake", "The Stronghold"].includes(topoName)) {
    const positions = {};
    const sorted = [...nodes].sort((a, b) => (bfsDepth[a.id] ?? 0) - (bfsDepth[b.id] ?? 0));
    sorted.forEach((node, i) => {
      positions[node.id] = { x: 0, y: i * (NODE_H + V_GAP) };
    });
    return positions;
  }

  // Hub layouts: Turf, Crucible
  if (["The Turf", "The Crucible"].includes(topoName)) {
    const positions = {};
    const hub = nodes[0];
    const others = nodes.filter(n => n.id !== hub.id);
    positions[hub.id] = { x: 0, y: 0 };
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

  // Parallel tracks: Double Cross, Fracture
  if (["The Double Cross", "The Fracture"].includes(topoName)) {
    const positions = {};
    const pathANodes = nodes.filter(n => n.label === "Path A" || n.label === "Thread A");
    const pathBNodes = nodes.filter(n => n.label === "Path B" || n.label === "Thread B");
    const sharedNodes = nodes.filter(n => !pathANodes.includes(n) && !pathBNodes.includes(n));
    let x = 0;
    for (const node of sharedNodes) {
      positions[node.id] = { x, y: 0 };
      x += NODE_W + H_GAP;
    }
    const startX = (NODE_W + H_GAP);
    pathANodes.forEach((node, i) => {
      positions[node.id] = { x: startX + i * (NODE_W + H_GAP), y: -(NODE_H + V_GAP) };
    });
    pathBNodes.forEach((node, i) => {
      positions[node.id] = { x: startX + i * (NODE_W + H_GAP), y: (NODE_H + V_GAP) };
    });
    return positions;
  }

  // Circular: Carousel
  if (topoName === "The Carousel") {
    const positions = {};
    const angleStep = (2 * Math.PI) / nodes.length;
    const radius = (NODE_W + H_GAP) * 1.0;
    nodes.forEach((node, i) => {
      const angle = angleStep * i - Math.PI / 2;
      positions[node.id] = {
        x: Math.round(Math.cos(angle) * radius),
        y: Math.round(Math.sin(angle) * radius),
      };
    });
    return positions;
  }

  // Converging: Gauntlet (branches converge to right)
  if (topoName === "The Gauntlet") {
    const positions = {};
    const mainNodes = nodes.filter(n => n.id.startsWith("s"));
    const branchNodes = nodes.filter(n => n.id.startsWith("b"));
    const finaleNode = nodes.find(n => n.isFinale);
    mainNodes.filter(n => !n.isFinale).forEach((node, i) => {
      positions[node.id] = { x: i * (NODE_W + H_GAP), y: 0 };
    });
    branchNodes.forEach((node, i) => {
      const yOff = (i % 2 === 0 ? -1 : 1) * (NODE_H + V_GAP);
      positions[node.id] = { x: 0, y: yOff };
    });
    if (finaleNode) {
      const maxX = Math.max(...Object.values(positions).map(p => p.x));
      positions[finaleNode.id] = { x: maxX + NODE_W + H_GAP, y: 0 };
    }
    return positions;
  }

  // Funnel: Ratchet (wider left, narrow right)
  if (topoName === "The Ratchet") {
    const positions = {};
    const sorted = [...nodes].sort((a, b) => (bfsDepth[a.id] ?? 0) - (bfsDepth[b.id] ?? 0));
    sorted.forEach((node, i) => {
      const spread = Math.max(0, (sorted.length - i - 1) * 40);
      const yOff = (i % 2 === 0 ? -1 : 1) * spread;
      positions[node.id] = { x: i * (NODE_W + H_GAP), y: Math.round(yOff) };
    });
    return positions;
  }

  // Scattered: Mosaic (loose grid)
  if (topoName === "The Mosaic") {
    const positions = {};
    const cols = Math.ceil(Math.sqrt(nodes.length));
    nodes.forEach((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = Math.round((Math.random() - 0.5) * 60);
      const jitterY = Math.round((Math.random() - 0.5) * 60);
      positions[node.id] = {
        x: col * (NODE_W + H_GAP) + jitterX,
        y: row * (NODE_H + V_GAP) + jitterY,
      };
    });
    return positions;
  }

  // Weighted mesh: Tightrope (grid with offset)
  if (topoName === "The Tightrope") {
    const positions = {};
    const cols = Math.ceil(nodes.length / 2);
    nodes.forEach((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions[node.id] = {
        x: col * (NODE_W + H_GAP),
        y: row * (NODE_H + V_GAP * 2),
      };
    });
    return positions;
  }

  // Default: BFS depth left-to-right (Trail, Web, Shell Game, Rundown, Stakeout)
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

function generateMermaid(nodes, adj, segNumbers, nodeMap, topoName, simplified) {
  const vertTopos = ["The Layer Cake", "The Stronghold"];
  const dir = vertTopos.includes(topoName) ? "TB" : "LR";
  const lines = [`flowchart ${dir}`];
  if (simplified) {
    lines.push(`  NOTE["⚡ Simplified — all segments interconnected"]`);
    lines.push(`  style NOTE fill:#fff3cd,stroke:#856404,color:#856404`);
  }
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

// ─── USER INPUT ──────────────────────────────────────────────────────────────

const adventureName = await tp.system.prompt("Adventure Name");
if (!adventureName) { new Notice("Urban generation cancelled."); return; }

const segStr = await tp.system.prompt("How many segments? (not counting the finale)", "4");
const segCount = Math.max(2, Math.min(30, parseInt(segStr) || 4));

const tierChoices = ["Tier 1 (Levels 1–4)", "Tier 2 (Levels 5–10)"];
const tierStr = await tp.system.suggester(tierChoices, tierChoices, false, "Choose play tier");
const tier = (tierStr || "").includes("Tier 2") ? 2 : 1;

const topoChoices = [
  "The Trail", "The Web", "The Mosaic", "The Shell Game",
  "The Turf", "The Layer Cake", "The Stronghold", "The Gauntlet",
  "The Rundown", "The Carousel", "The Stakeout", "The Crucible",
  "The Double Cross", "The Tightrope", "The Ratchet", "The Fracture",
];
const topoStr = await tp.system.suggester(topoChoices, topoChoices, false, "Choose topology (or cancel to roll random)");
const chosenTopo = topoStr || rnd(topoChoices);

// ─── SETUP ROLLS ─────────────────────────────────────────────────────────────

const [typeArch, typeAtmo]    = await pick("Urban Type",               1, 2);
const [originCat, originFlav] = await pick("Urban Origin",             1, 2);
const [skinName,  skinVis]    = await pick("Urban Environment Skin",   1, 2);
const [motifName, motifDesc]  = await pick("Urban Art Motif",          1, 2);
const [modName,   modDesc]    = await pick("Urban Art Motif Modifier", 1, 2);
const [restName,  restDesc]   = await pick("Urban Rest Complications", 1, 2);
const [catalystResult] = await pick("Urban Catalyst", 1);
const [distortionName, distortionHow, distortionPrompt] = await pick("Urban Street Distortion", 1, 2, 3);

// Tier-aware Threat Identity
const threatTable = tier === 2 ? "Urban Threat Identity T2" : "Urban Threat Identity T1";
const threatRow = await readTable(threatTable);
let threatCtx;
if (threatRow.length) {
  const row = rnd(threatRow);
  threatCtx = {
    id: (row[1] || "Unknown Threat").trim(),
    low: (row[2] || "Bandit / Thug").trim(),
    mid: (row[3] || "Bandit Captain / Spy").trim(),
    boss: (row[4] || "Gladiator / Assassin").trim(),
  };
} else {
  threatCtx = { id: "Unknown Threat", low: "Bandit", mid: "Captain", boss: "Boss" };
}

// ─── TOPOLOGY RESOLUTION + GRAPH ─────────────────────────────────────────────

const { resolved: resolvedTopo, original: origTopo, wasFallback } = resolveTopology(chosenTopo, segCount);
const graph = GRAPH_BUILDERS[resolvedTopo](segCount);
const { order: bfsOrder, depth: bfsDepth } = bfsGraph(graph.adj, graph.entry);
const segNumbers = assignSegNumbers(bfsOrder, graph.nodes);
const nodeMap    = Object.fromEntries(graph.nodes.map(n => [n.id, n]));
const totalSegs  = segCount + 1;
const finaleId   = bfsOrder.find(id => nodeMap[id]?.isFinale) || bfsOrder[bfsOrder.length - 1];
const fallbackNote = wasFallback ? ` *(rolled ${origTopo}, fell back — needs ${TOPOLOGY_MIN_SEGS[origTopo]} segs)*` : "";

// ─── FOLDER SETUP ────────────────────────────────────────────────────────────

const adventureFolderPath = `${SKETCHES_FOLDER}/${adventureName}`;
try { await app.vault.createFolder(adventureFolderPath); } catch(e) { /* exists */ }

// ─── GENERATE SEGMENT NOTES ─────────────────────────────────────────────────

const segFilePaths  = {};
const segIndexRows  = [];
const segFullBlocks = [];
const segLocations  = {};

for (const nodeId of bfsOrder) {
  const node    = nodeMap[nodeId];
  const segNum  = segNumbers[nodeId];

  const exits = (graph.adj[nodeId] || []).map(nbId => ({
    targetId: nbId,
    targetNum: segNumbers[nbId],
    targetLabel: nodeMap[nbId]?.label || "",
  }));

  // Detect dense graphs (Crucible, Tightrope at high counts) for connection capping
  const dense = exits.length > MAX_DISPLAY_CONNS;

  let noteContent;
  if (node.isFinale) {
    noteContent = await generateFinaleNote(segNum, node, exits, segNumbers, nodeMap, resolvedTopo, threatCtx, adventureName, catalystResult, tier, dense);
    segLocations[nodeId] = node.label;
  } else {
    const subRoll = await rollSubTable(node.label);
    noteContent = await generateSegmentNote(segNum, node, exits, segNumbers, nodeMap, resolvedTopo, threatCtx, adventureName, tier, subRoll, dense);
    segLocations[nodeId] = subRoll ? subRoll.segType : "—";
  }

  const displayLabel = node.isFinale ? "Finale" : (node.label || `Segment ${segNum}`);
  const segFileName = `S${String(segNum).padStart(2, "0")} — ${safeFileName(displayLabel)}.md`;
  const segFilePath = `${adventureFolderPath}/${segFileName}`;
  await createOrOverwrite(segFilePath, noteContent);
  segFilePaths[nodeId] = segFilePath;
  segFullBlocks.push(noteContent.replace(/^---[\s\S]*?---\n/, "").trimStart());

  // Roster connection string — cap for dense graphs
  const rosterExits = dense ? exits.slice(0, MAX_DISPLAY_CONNS) : exits;
  let neighborStr = rosterExits.map(e => e.targetLabel ? `S${String(e.targetNum).padStart(2,"0")} (${e.targetLabel})` : `S${String(e.targetNum).padStart(2,"0")}`).join(", ");
  if (dense && exits.length > MAX_DISPLAY_CONNS) neighborStr += `, ... +${exits.length - MAX_DISPLAY_CONNS} more`;
  segIndexRows.push(`| [[${segFileName.replace(".md", "")}\\|S${String(segNum).padStart(2,"0")}]] | ${node.label || "—"} | ${segLocations[nodeId] || "—"} | ${neighborStr} |`);
}

// ─── CANVAS & MERMAID (with edge density guard) ─────────────────────────────

const isDense = countEdges(graph.adj) > MAX_VISUAL_EDGES;
const { adj: displayAdj, simplified } = simplifyForDisplay(graph.nodes, graph.adj);

const canvasJson = generateCanvasJSON(graph.nodes, displayAdj, bfsDepth, segFilePaths, resolvedTopo);
await createOrOverwrite(`${adventureFolderPath}/${adventureName}.canvas`, canvasJson);

const mermaidDiagram = generateMermaid(graph.nodes, displayAdj, segNumbers, nodeMap, resolvedTopo, simplified);

// ─── DM BRIEFING ─────────────────────────────────────────────────────────────

const briefing = `**The Scene.** This is ${skinName.toLowerCase()} ${typeArch.toLowerCase()} — ${typeAtmo.toLowerCase()}. ${skinVis}

**The Situation.** ${catalystResult}. The power here flows from ${originCat.toLowerCase()} — *${originFlav.toLowerCase()}*. The threat is **${threatCtx.id}**: expect ${threatCtx.low} at street level, ${threatCtx.mid} when things escalate, and ${threatCtx.boss} behind it all.

**The Texture.** The visual motif is ${motifName.toLowerCase()} (${motifDesc.toLowerCase()}), ${modName.toLowerCase()} — ${modDesc.toLowerCase()}. NPCs garble the truth through **${distortionName.toLowerCase()}**: ${distortionHow.toLowerCase()} ${distortionPrompt} Rest is complicated by *${restName.toLowerCase()}* — ${restDesc.toLowerCase()}.`;

// ─── ASSEMBLE INDEX NOTE ─────────────────────────────────────────────────────

tR = `---
tags: [urban, sketch, arcana-engine]
segments: ${totalSegs}
topology: "${resolvedTopo}"
tier: ${tier}
finale-track: ${FINALE_DEFAULTS[resolvedTopo]}
status: sketch
---

# ${adventureName}

> [[${adventureName}.canvas|Open Adventure Canvas]] — segments positioned by topology, connected by narrative flow.

---

## DM Briefing

${briefing}

**Run this as:** A ${resolvedTopo} adventure (${TOPOLOGY_POSTURE[resolvedTopo]} posture). Default finale: ${FINALE_DEFAULTS[resolvedTopo]}. ${HEAT_GUIDANCE[resolvedTopo]}

---

## Setup

| | |
|:--|:--|
| **Topology** | **${resolvedTopo}**${fallbackNote} |
| **Tier** | **T${tier}** |
| **Context** | ${typeArch} |
| **Power** | ${originCat} — *${originFlav}* |
| **Skin** | ${skinName} — *${skinVis}* |
| **Motif** | ${motifName} — *${motifDesc}* |
| **Motif Modifier** | ${modName} — *${modDesc}* |
| **Threat** | ${threatCtx.id} |
| **↳ Low CR** | *${threatCtx.low}* |
| **↳ Mid CR** | *${threatCtx.mid}* |
| **↳ Boss CR** | *${threatCtx.boss}* |
| **Catalyst** | *${catalystResult}* |
| **Street Distortion** | **${distortionName}** — *${distortionHow}* |
| **Rest Pressure** | ${restName} — *${restDesc}* |

---

## Topology

\`\`\`mermaid
${mermaidDiagram}
\`\`\`

---

## Heat Rules

**Starting Heat: ${HEAT_START[resolvedTopo] || 0}** (${["Cold", "Warm", "Hot", "Burning"][HEAT_START[resolvedTopo] || 0]})

| Heat | State | Effect |
|:----:|:------|:-------|
| 0 | Cold | Normal activity. No adjustments. |
| 1 | Warm | Word is spreading. Locals watch more closely; enemies reposition cautiously. |
| 2 | Hot | Patrols, rivals, or locals actively looking. +1 creature to future combat. |
| 3 | Burning | The block is mobilized. Boss fortifies, relocates, or prepares ambush. |

**${resolvedTopo} Guidance:** ${HEAT_GUIDANCE[resolvedTopo]}

---

## Segment Roster

| Seg | Label | Location | Connections |
|:----|:------|:---------|:------------|
${segIndexRows.join("\n")}

---

## Full Content Scan

${segFullBlocks.join("\n\n---\n\n")}

---

*Generated with Arcana Engine v0.25 — Urban Procedure v2.5.2*
`;

// Move index note into adventure subfolder
await tp.file.move(`${adventureFolderPath}/${adventureName}`);
%>
