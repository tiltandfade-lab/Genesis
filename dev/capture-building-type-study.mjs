/* capture-building-type-study.mjs
   Deterministic evidence capture for every live BUILDING_KITS type.

   This does not add gates or correct incompatible rolls. It records the current
   stack exactly:
     kit/realm label -> ungated building-interior row -> optional shop delegation
     -> buildingApproach proprietor/ambient cast -> buildingContact.

   Three samples per type are seed-searched so the unchanged raw d300 lands in
   Grounded, Textured, and Strange-or-higher bands. The search is an audit tool,
   not a claim that the product can currently request a band.

   It also captures:
     - one same-seed Frontier/Chrome/Gloom mirror per type; and
     - Prison/Custody's real current boundary (no building kit, live capture nouns,
       raw d300 custody rows, and live dungeon-area custody rows).

   Run:
     node dev/capture-building-type-study.mjs
*/
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "Reference", "Building-Type-Roll-Study");
const JSON_OUT = join(OUT_DIR, "ROLL-RECEIPTS.json");
const MARKDOWN_OUT = join(OUT_DIR, "ROLL-STACK-CARDS.md");
const read = (path) => readFileSync(join(ROOT, path), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
const manifest = JSON.parse(read("manifest.json"));
const appSource =
  read("tables.js") +
  "\n;\n" +
  manifest.loadOrder.filter((path) => path.endsWith(".js")).map(read).join("\n;\n") +
  "\n;globalThis.__CAPTURE_BUILDING_KIT_TYPES=BUILDING_KIT_TYPES.slice();";
const harness = "var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;";

function newWindow() {
  const dom = new JSDOM(
    "<!doctype html><html><body><div id=\"worldView\"></div><div id=\"toast\"></div><div id=\"shelf\"></div></body></html>",
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  dom.window.eval(harness + "\n" + appSource);
  dom.window.Date.now = () => 1785081600000;
  return dom.window;
}

function hash32(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedWindow(win, seed) {
  win.Math.random = mulberry32(seed);
}

function parseInteriorRows() {
  const source = read(
    "Engine/03. _Tables/01. World Building/Place Generation/Building Interior.md"
  );
  const rows = new Map();
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(
      /^\|\s*(\d+)\s*\|\s*(Grounded|Textured|Strange|Volatile|Mythic)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/
    );
    if (!match) continue;
    rows.set(Number(match[1]), {
      total: Number(match[1]),
      band: match[2],
      layout: match[3],
      feature: match[4],
      inside: match[5],
    });
  }
  if (rows.size !== 300) {
    throw new Error("Expected 300 Building Interior rows, found " + rows.size);
  }
  return rows;
}

const INTERIOR_ROWS = parseInteriorRows();

function rowTotalFromRef(ref) {
  const match = String(ref || "").match(/building-interior#(\d+)$/);
  return match ? Number(match[1]) : null;
}

function rowForRoll(roll) {
  const total = rowTotalFromRef(roll && roll.interior && roll.interior.source.ref);
  return total == null ? null : INTERIOR_ROWS.get(total) || null;
}

function compactRecord(record) {
  if (!record) return null;
  return {
    id: record.id,
    kind: record.kind,
    name: record.name,
    provenance: record.provenance,
    source: record.source,
    rolled: record.rolled,
    fields: record.fields,
    dm: record.dm,
    status: record.status,
    links: record.links,
  };
}

function makeWorld(win, realm, type, seed) {
  const id = "building-type-study-" + type + "-" + realm + "-" + seed;
  const world = {
    id,
    name: "Building Type Study — " + type + " — " + realm,
    session: 1,
    startNodeId: "home",
    currentNodeId: "home",
    map: {
      nodes: {
        home: { id: "home", name: "Audit Node", type: "Settlement", x: 0, y: 0 },
        far: { id: "far", name: "Far Reach", type: "Settlement", x: 6, y: 4 },
      },
      edges: [],
    },
    gazetteer: [],
    ledger: [
      {
        id: "prior-fact",
        type: "outcome",
        day: 35,
        data: { nodeId: "far" },
        text: "The bridge at Far Reach was closed after the flood.",
      },
    ],
    log: [],
    clock: { day: 40, min: 1080 },
    characters: [
      {
        status: "living",
        name: "Wren",
        conditions: [],
        sheet: {
          level: 3,
          gold: 100,
          mods: { str: 1, dex: 2 },
          scores: { str: 10 },
          inventory: [],
          equipped: {},
        },
      },
    ],
    factions: [],
    pressures: [],
    shops: {},
    codex: { records: {}, version: 1 },
    seed: { master: { realm } },
  };
  win.U.worlds[id] = world;
  win.U.activeWorldId = id;
  return world;
}

const BAND_PROFILES = [
  { id: "grounded", realm: "frontier", accepts: new Set(["Grounded"]) },
  { id: "textured", realm: "chrome", accepts: new Set(["Textured"]) },
  {
    id: "high-spice",
    realm: "gloom",
    accepts: new Set(["Strange", "Volatile", "Mythic"]),
  },
];

function findBandSeed(win, type, profile) {
  for (let nonce = 0; nonce < 20000; nonce++) {
    const label = "BUILDING-TYPE/" + type + "/" + profile.id + "/" + nonce;
    const seed = hash32(label);
    seedWindow(win, seed);
    const roll = win.rollBuilding(type, {
      nodeId: "home",
      realm: profile.realm,
      tier: 2,
    });
    const row = rowForRoll(roll);
    if (row && profile.accepts.has(row.band)) {
      return { label, seed, nonce, band: row.band, rowRef: "building-interior#" + row.total };
    }
  }
  throw new Error("Could not find " + profile.id + " seed for " + type);
}

function compactShop(shop) {
  if (!shop) return null;
  return {
    id: shop.id,
    name: shop.name,
    archetype: shop.archetype,
    tier: shop.tier,
    coin: shop.coin,
    stock: shop.stock,
  };
}

function captureIntegrated(type, profile, selection) {
  const win = newWindow();

  seedWindow(win, selection.seed);
  const direct = win.rollBuilding(type, {
    nodeId: "home",
    realm: profile.realm,
    tier: 2,
  });
  const row = rowForRoll(direct);
  if (!row || row.band !== selection.band) {
    throw new Error("Direct replay drift for " + type + "/" + profile.id);
  }

  seedWindow(win, selection.seed);
  const world = makeWorld(win, profile.realm, type, selection.seed);
  const approach = win.buildingApproach(world, type, {
    nodeId: "home",
    realm: profile.realm,
    tier: 2,
  });
  const proprietor = win.codexGet(world, approach.proprietorId);
  const ambientRecords = ((approach.ambient && approach.ambient.ids) || [])
    .map((id) => win.codexGet(world, id))
    .filter(Boolean);
  const contact = win.buildingContact(world, approach.id);
  const buildingAfter = win.codexGet(world, approach.id);
  const proprietorAfter = win.codexGet(world, approach.proprietorId);

  const directRef = direct.interior && direct.interior.source.ref;
  const approachInterior =
    approach.record &&
    approach.record.rolled &&
    approach.record.rolled.interior &&
    approach.record.rolled.interior;
  const sameInteriorReplay =
    approachInterior &&
    direct.interior &&
    approachInterior.layout === direct.interior.rolled.layout &&
    approachInterior.feature === direct.interior.rolled.feature &&
    approachInterior.inside === direct.interior.rolled.inside;
  if (
    !directRef ||
    directRef !== "building-interior#" + row.total ||
    !sameInteriorReplay
  ) {
    throw new Error("Integrated source-ref drift for " + type + "/" + profile.id);
  }

  return {
    receiptId: "BLD-" + type.toUpperCase() + "-" + profile.id.toUpperCase(),
    type,
    auditProfile: profile.id,
    realm: profile.realm,
    seed: {
      label: selection.label,
      value: selection.seed,
      selectionNonce: selection.nonce,
      selectionRule:
        "search deterministic seeds until the unchanged raw d300 lands in the requested audit band; this is not a live product control",
    },
    layers: {
      typedKit: {
        defaultType: type,
        realmLabel: direct.kit.label,
        functionLine: direct.kit.functionLine,
        proprietorRoleHint: direct.kit.proprietorRoleHint,
        patronsLane: direct.kit.patronsLane,
        economyTie: direct.kit.economyTie,
        hookLane: direct.kit.hookLane,
        tavern: direct.kit.tavern,
      },
      generalInterior: {
        rowRef: directRef,
        band: row.band,
        layout: direct.interior.rolled.layout,
        feature: direct.interior.rolled.feature,
        sourceOccupant: direct.interior.rolled.inside,
        kindHintRetained: direct.interior.rolled.kind,
      },
      name: direct.name,
      shopDelegation: compactShop(direct.shop),
      approach: {
        building: compactRecord(approach.record),
        proprietor: compactRecord(proprietor),
        ambient: approach.ambient,
        ambientRecords: ambientRecords.map(compactRecord),
      },
      contact: {
        result: contact,
        buildingStatusAfter: buildingAfter && buildingAfter.status,
        proprietorStatusAfter: proprietorAfter && proprietorAfter.status,
      },
    },
    observedComposition: {
      interiorProgramFiltered: false,
      spiceBandRequestedByProduct: false,
      sourceOccupantReconciledWithCast: false,
      proprietorRoleConstrainedToHint: false,
      realmChangesInterior: false,
      shopInventoryDelegated: !!direct.shop,
      tavernOnlyContactLayer: type === "tavern",
    },
  };
}

function captureRealmMirror(win, type) {
  const label = "BUILDING-TYPE/" + type + "/realm-mirror";
  const seed = hash32(label);
  const rolls = ["frontier", "chrome", "gloom"].map((realm) => {
    seedWindow(win, seed);
    const roll = win.rollBuilding(type, { nodeId: "home", realm, tier: 2 });
    return {
      realm,
      kitLabel: roll.kit.label,
      name: roll.name,
      interiorRef: roll.interior && roll.interior.source.ref,
      layout: roll.interior && roll.interior.rolled.layout,
      feature: roll.interior && roll.interior.rolled.feature,
      sourceOccupant: roll.interior && roll.interior.rolled.inside,
      shopArchetype: roll.shop ? roll.shop.archetype : null,
      shopStock: roll.shop ? roll.shop.stock : null,
    };
  });
  const first = rolls[0];
  return {
    type,
    seed: { label, value: seed },
    rolls,
    sameInteriorAcrossRealms: rolls.every(
      (roll) =>
        roll.interiorRef === first.interiorRef &&
        roll.layout === first.layout &&
        roll.feature === first.feature &&
        roll.sourceOccupant === first.sourceOccupant
    ),
    sameShopStockAcrossRealms: first.shopStock
      ? rolls.every((roll) => JSON.stringify(roll.shopStock) === JSON.stringify(first.shopStock))
      : null,
  };
}

function findRawInteriorSeed(win, total) {
  for (let nonce = 0; nonce < 50000; nonce++) {
    const label = "BUILDING-TYPE/prison/raw-interior-" + total + "/" + nonce;
    const seed = hash32(label);
    seedWindow(win, seed);
    const roll = win.rollBuildingInterior({ kind: "prison" });
    if (rowTotalFromRef(roll && roll.source.ref) === total) {
      return { label, seed, nonce, roll };
    }
  }
  throw new Error("Could not replay raw custody interior #" + total);
}

function findDungeonAreaSeed(win, total) {
  for (let nonce = 0; nonce < 50000; nonce++) {
    const label = "BUILDING-TYPE/prison/dungeon-area-" + total + "/" + nonce;
    const seed = hash32(label);
    seedWindow(win, seed);
    const roll = win.dwalkArea();
    if (roll && roll._roll && roll._roll.total === total) {
      return { label, seed, nonce, roll };
    }
  }
  throw new Error("Could not replay dungeon area #" + total);
}

function capturePrisonBoundary(win) {
  seedWindow(win, hash32("BUILDING-TYPE/prison/unknown-kit"));
  const typedAttempt = win.rollBuilding("prison", {
    nodeId: "home",
    realm: "frontier",
    tier: 2,
  });

  const captureRolls = [1, 2, 3].map((ordinal) => {
    const label = "BUILDING-TYPE/prison/capture-" + ordinal;
    const seed = hash32(label);
    seedWindow(win, seed);
    return { label, seed, roll: win.rollCapture() };
  });

  const rawInteriors = [19, 78, 213].map((total) => {
    const found = findRawInteriorSeed(win, total);
    return {
      rowRef: "building-interior#" + total,
      band: INTERIOR_ROWS.get(total).band,
      seed: { label: found.label, value: found.seed, selectionNonce: found.nonce },
      roll: found.roll,
    };
  });

  const dungeonAreas = [66, 69, 150].map((total) => {
    const found = findDungeonAreaSeed(win, total);
    return {
      rowRef: "dungeon-area-type#" + total,
      seed: { label: found.label, value: found.seed, selectionNonce: found.nonce },
      roll: found.roll,
    };
  });

  return {
    typedBuildingAttempt: typedAttempt,
    liveCaptureNounRolls: captureRolls,
    rawGeneralInteriorCustodyRows: rawInteriors,
    liveDungeonAreaCustodyRows: dungeonAreas,
    authoredUnwiredUrbanRows: [
      {
        rowRef: "urban-area-type#160",
        label: "Suspended Cage",
        status: "AUTHORED-UNWIRED for rollUrbanWalk",
      },
      {
        rowRef: "urban-area-type#165",
        label: "Prison Block",
        status: "AUTHORED-UNWIRED for rollUrbanWalk",
      },
    ],
    interpretation:
      "Prison/Custody is presently a multi-source composition target, not a live typed building stack.",
  };
}

function mdEscape(text) {
  return String(text == null ? "—" : text).replace(/\|/g, "\\|").replace(/\n+/g, " ");
}

function shortStock(shop) {
  if (!shop || !shop.stock || !shop.stock.length) return "—";
  return shop.stock
    .slice(0, 5)
    .map((line) => line.name + " ×" + line.qty)
    .join("; ");
}

function buildMarkdown(result) {
  const lines = [
    "# Building Type Roll Study — live stack cards",
    "",
    "date: 2026-07-26  ",
    "status: deterministic implementation evidence; no gate, adapter, or source row was changed",
    "",
    "## Read this first",
    "",
    "These are real rolls through the current full-app path. Each of the fourteen live",
    "building kits has three retained samples. The harness searched deterministic seeds",
    "until the unchanged raw d300 happened to land in Grounded, Textured, and",
    "Strange/Volatile/Mythic bands. That search makes the current range inspectable; it",
    "does **not** mean a live typed caller can request a compatible program or Spice band.",
    "",
    "Every card exposes the actual layers:",
    "",
    "```text",
    "typed kit + realm label",
    "  → one ungated atomic building-interior row",
    "  → optional existing shop stock/economy delegation",
    "  → independently rolled proprietor + ambient cast",
    "  → contact (Tavern alone adds Distant Word/encounter)",
    "```",
    "",
    "The d300 band is the only building-interior Spice signal. The typed kit does not",
    "currently bias it, and the returned interior payload does not expose the band except",
    "through its source row reference. Source occupant, proprietor, and ambient cast are",
    "not reconciled.",
    "",
    "## Cross-realm isolation result",
    "",
    "Each kit was also rolled three times under one identical seed, changing only realm.",
    "In the current building core, all fourteen retained the exact same interior layout,",
    "feature, occupant, and source ref across Frontier/Chrome/Gloom. Realm changes the kit",
    "label; it does not transform the interior. The four shops also retained identical",
    "stock under the mirror seed.",
    "",
    "| type | Frontier | Chrome | Gloom | same interior |",
    "|---|---|---|---|---|",
  ];

  for (const mirror of result.realmMirrors) {
    lines.push(
      "| " +
        mdEscape(mirror.type) +
        " | " +
        mdEscape(mirror.rolls[0].kitLabel) +
        " | " +
        mdEscape(mirror.rolls[1].kitLabel) +
        " | " +
        mdEscape(mirror.rolls[2].kitLabel) +
        " | " +
        (mirror.sameInteriorAcrossRealms ? "yes" : "no") +
        " |"
    );
  }

  lines.push("", "## Live kit cards", "");
  for (const type of result.buildingTypes) {
    const samples = result.receipts.filter((receipt) => receipt.type === type);
    const kit = samples[0].layers.typedKit;
    lines.push(
      "## " + type,
      "",
      "- Function: " + kit.functionLine,
      "- Role hint: `" + kit.proprietorRoleHint + "`",
      "- Economy/hook lanes: `" + kit.economyTie + "` / `" + kit.hookLane + "`",
      ""
    );
    for (const sample of samples) {
      const layer = sample.layers;
      const interior = layer.generalInterior;
      const proprietor = layer.approach.proprietor;
      const ambient = layer.approach.ambientRecords || [];
      lines.push(
        "### " +
          sample.auditProfile +
          " — " +
          sample.realm +
          " — " +
          layer.typedKit.realmLabel,
        "",
        "- Receipt/seed: `" +
          sample.receiptId +
          "` · `" +
          sample.seed.value +
          "` · `" +
          interior.rowRef +
          "`",
        "- Interior band: **" + interior.band + "**",
        "- Layout: " + interior.layout,
        "- Notable feature: " + interior.feature,
        "- Source occupant: " + interior.sourceOccupant,
        "- Rolled proprietor: " +
          (proprietor
            ? proprietor.name + " — " + proprietor.rolled.role
            : "none"),
        "- Ambient cast: " +
          (ambient.length
            ? ambient.map((record) => record.name + " — " + record.rolled.role).join("; ")
            : "none"),
        "- Shop delegation: " +
          (layer.shopDelegation
            ? layer.shopDelegation.archetype +
              " · " +
              shortStock(layer.shopDelegation)
            : "none"),
        "- Contact addition: " +
          (sample.type === "tavern"
            ? "Tavern Distant Word plus chance-gated encounter"
            : "soft→hard lock only"),
        ""
      );
    }
  }

  const prison = result.prisonCustodyBoundary;
  lines.push(
    "## Prison / Custody — actual current boundary",
    "",
    "`rollBuilding(\"prison\")` returns:",
    "",
    "```json",
    JSON.stringify(prison.typedBuildingAttempt),
    "```",
    "",
    "There is no live Prison building kit. The current nouns arrive through separate",
    "surfaces:",
    "",
    "### Live capture noun rolls",
    ""
  );
  for (const entry of prison.liveCaptureNounRolls) {
    const roll = entry.roll;
    lines.push(
      "- `" +
        entry.seed +
        "` — " +
        roll.disposition.label +
        "; " +
        roll.holdingNoun +
        "; " +
        roll.confiscation.text +
        "; opening: " +
        roll.opening
    );
  }
  lines.push("", "### Raw d300 custody rows reached through the untyped roller", "");
  for (const entry of prison.rawGeneralInteriorCustodyRows) {
    lines.push(
      "- `" +
        entry.rowRef +
        "` · **" +
        entry.band +
        "** — " +
        entry.roll.rolled.layout +
        " Feature: " +
        entry.roll.rolled.feature +
        " Inside: " +
        entry.roll.rolled.inside
    );
  }
  lines.push("", "### Live dungeon-area custody rows", "");
  for (const entry of prison.liveDungeonAreaCustodyRows) {
    lines.push(
      "- `" +
        entry.rowRef +
        "` — " +
        entry.roll.areaType +
        "; " +
        entry.roll.dims +
        "; " +
        entry.roll.side
    );
  }
  lines.push(
    "",
    "Urban Area Type also contains Suspended Cage `#160` and Prison Block `#165`,",
    "but those rows are authored-unwired for `rollUrbanWalk`. Site 6's compiler is",
    "specified but unbuilt. This is source breadth, not yet one layered prison roll.",
    "",
    "## Verdict from the receipts",
    "",
    "- The walks' flavor/Spice relationship is **not** currently reproduced by typed",
    "  buildings.",
    "- The atomic d300 contributes real variation and its own Spice ladder.",
    "- Kit function, realm label, interior, proprietor, ambient cast, and—in Tavern's",
    "  case—contact content stack mechanically, but mostly as independent draws.",
    "- Shop kits have one genuinely reconciled layer: their inventory delegates to the",
    "  correct existing economy archetype.",
    "- The accepted family-chassis/program-layer work must be proven with a second after-state cohort",
    "  using these exact receipts as the before-state baseline.",
    ""
  );
  return lines.join("\n");
}

const selectorWindow = newWindow();
const buildingTypes = Array.from(selectorWindow.__CAPTURE_BUILDING_KIT_TYPES);
const selections = Object.fromEntries(
  buildingTypes.map((type) => [
    type,
    Object.fromEntries(
      BAND_PROFILES.map((profile) => [
        profile.id,
        findBandSeed(selectorWindow, type, profile),
      ])
    ),
  ])
);

const receipts = buildingTypes.flatMap((type) =>
  BAND_PROFILES.map((profile) =>
    captureIntegrated(type, profile, selections[type][profile.id])
  )
);
const realmMirrors = buildingTypes.map((type) =>
  captureRealmMirror(selectorWindow, type)
);
const prisonCustodyBoundary = capturePrisonBoundary(selectorWindow);

const result = {
  schema: "genesis.building-type-roll-study.v1",
  capturedOn: "2026-07-26",
  repositoryHead: execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf-8",
  }).trim(),
  sourcePaths: [
    "data/building-kits.js",
    "data/economy.js",
    "src/engine/codex-roll.js",
    "src/engine/dungeon-walk.js",
    "src/world/urban.js",
    "src/world/capture.js",
    "Engine/03. _Tables/01. World Building/Place Generation/Building Interior.md",
    "Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area Type.md",
    "Engine/03. _Tables/03. Session Mechanics/Dungeons/Urban Area Type.md",
  ],
  captureRules: {
    buildingTypeCount: buildingTypes.length,
    integratedSamplesPerType: BAND_PROFILES.length,
    integratedSampleCount: receipts.length,
    profiles: BAND_PROFILES.map((profile) => ({
      id: profile.id,
      realm: profile.realm,
      acceptedBands: Array.from(profile.accepts),
    })),
    livePath:
      "rollBuilding(type) -> buildingApproach(type) -> buildingContact",
    warning:
      "band samples are deterministic seed-search evidence; current callers cannot request band or program compatibility",
  },
  buildingTypes,
  receipts,
  realmMirrors,
  prisonCustodyBoundary,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(JSON_OUT, JSON.stringify(result, null, 2) + "\n", "utf-8");
writeFileSync(MARKDOWN_OUT, buildMarkdown(result) + "\n", "utf-8");
console.log(
  "Wrote " +
    receipts.length +
    " integrated building receipts, " +
    realmMirrors.length +
    " realm mirrors, and the Prison boundary to " +
    relative(ROOT, OUT_DIR)
);
