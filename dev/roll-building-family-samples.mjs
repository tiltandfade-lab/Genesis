/* roll-building-family-samples.mjs
   Pure deterministic taste sampler for the proposed typed-building family stack.

   This does not call or modify the live building roller. It proves that the sample
   tables compose in the intended order:
     family chassis -> program arrangement -> operating state -> current scene
     -> band-selected program Spice -> realm realization.

   Run:
     node dev/roll-building-family-samples.mjs
     node dev/roll-building-family-samples.mjs --check
*/
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "Reference", "Building-Family-Table-Samples");
const TABLE_PATH = join(OUT_DIR, "TABLE-SAMPLES.json");
const RECEIPT_PATH = join(OUT_DIR, "ROLL-RECEIPTS.json");
const CARD_PATH = join(OUT_DIR, "TABLE-AND-ROLL-CARDS.md");
const CHECK = process.argv.includes("--check");
const sourceText = readFileSync(TABLE_PATH, "utf8");
const source = JSON.parse(sourceText);

function fail(message) {
  throw new Error(message);
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

function pick(rows, random) {
  return rows[Math.floor(random() * rows.length)];
}

function requirementsMet(row, contextTags) {
  return (row.requires || []).every((tag) => contextTags.includes(tag));
}

function preferContextSpecific(rows, profile) {
  if (!profile.preferContextSpecificRows) return rows;
  const specific = rows.filter((row) => (row.requires || []).length > 0);
  return specific.length > 0 ? specific : rows;
}

function collectText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(collectText).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value).map(collectText).join(" ");
  }
  return "";
}

function validateSource() {
  if (source.schema !== "genesis.building-family-table-samples.v1") {
    fail("Unexpected source schema: " + source.schema);
  }
  if (source.families.length !== 7) {
    fail("Expected seven families, found " + source.families.length);
  }
  if (source.profiles.length !== 4) {
    fail("Expected four taste profiles, found " + source.profiles.length);
  }

  const familyIds = new Set();
  const programIds = new Set();
  const requiredBands = new Set(["Grounded", "Textured", "Strange", "Volatile"]);
  const requiredRealms = ["frontier", "chrome", "gloom"];

  for (const family of source.families) {
    if (familyIds.has(family.id)) fail("Duplicate family id: " + family.id);
    familyIds.add(family.id);
    if (family.chassis.length !== 6) {
      fail(family.id + " must expose exactly six taste chassis rows");
    }
    if (family.states.length !== 4) {
      fail(family.id + " must expose exactly four taste state rows");
    }
    if (!family.programs.length) fail(family.id + " has no programs");

    for (const program of family.programs) {
      if (programIds.has(program.id)) fail("Duplicate program id: " + program.id);
      programIds.add(program.id);
      if (program.arrangements.length !== 4) {
        fail(program.id + " must expose exactly four arrangement rows");
      }
      if (program.scenes.length !== 4) {
        fail(program.id + " must expose exactly four current-scene rows");
      }
      const bands = new Set(program.spice.map((row) => row.band));
      for (const band of requiredBands) {
        if (!bands.has(band)) fail(program.id + " is missing Spice band " + band);
      }
      for (const realm of requiredRealms) {
        if (!program.realm[realm]) fail(program.id + " is missing realm " + realm);
      }
      const chassisIds = new Set(family.chassis.map((row) => row.id));
      for (const arrangement of program.arrangements) {
        for (const chassisId of arrangement.chassisAllow || []) {
          if (!chassisIds.has(chassisId)) {
            fail(`${arrangement.id} allows unknown chassis ${chassisId}`);
          }
        }
      }
    }
  }

  const expectedPrograms = new Set([
    "tavern",
    "temple",
    "guildhall",
    "manor",
    "garrison",
    "court",
    "bathhouse",
    "gambling-den",
    "warehouse",
    "dock-house",
    "smithy",
    "apothecary",
    "general",
    "arcanist",
    "prison-custody",
  ]);
  if (programIds.size !== expectedPrograms.size) {
    fail("Expected 15 programs, found " + programIds.size);
  }
  for (const id of expectedPrograms) {
    if (!programIds.has(id)) fail("Missing program " + id);
  }

  const custody = source.families.find((family) => family.id === "BF-CUSTODY");
  if (!custody || custody.programs.length !== 1 || custody.programs[0].id !== "prison-custody") {
    fail("Prison/Custody must be the sole program in BF-CUSTODY");
  }
  const civic = source.families.find((family) => family.id === "BF-CIVIC-AUTHORITY");
  if (!civic || civic.programs.some((program) => program.id === "prison-custody")) {
    fail("Prison/Custody leaked into BF-CIVIC-AUTHORITY");
  }

  const manor = source.families
    .flatMap((family) => family.programs)
    .find((program) => program.id === "manor");
  if (/\b(?:hospital|printer|letter-writing)\b/i.test(collectText(manor))) {
    fail("Manor sample carries a forbidden unrelated primary program");
  }
  const apothecary = source.families
    .flatMap((family) => family.programs)
    .find((program) => program.id === "apothecary");
  if (/\b(?:printer|printing press|print shop)\b/i.test(collectText(apothecary))) {
    fail("Apothecary sample carries printer occupation");
  }
}

function makeReceipt(family, program, profile, ordinal) {
  const seedLabel = [
    "BUILDING-FAMILY-TASTE",
    family.id,
    program.id,
    profile.id,
    ordinal,
  ].join("/");
  const seed = hash32(seedLabel);
  const random = mulberry32(seed);
  const contextTags = profile.contextTags || [];
  const legalArrangements = preferContextSpecific(
    program.arrangements.filter((row) => requirementsMet(row, contextTags)),
    profile
  );
  if (legalArrangements.length === 0) {
    fail(`${program.id} has no arrangement legal for ${profile.id}`);
  }
  const arrangement = pick(legalArrangements, random);
  const legalChassis = preferContextSpecific(
    family.chassis.filter(
      (row) =>
        requirementsMet(row, contextTags) &&
        (!(arrangement.chassisAllow || []).length ||
          arrangement.chassisAllow.includes(row.id))
    ),
    profile
  );
  if (legalChassis.length === 0) {
    fail(`${program.id}/${arrangement.id} has no chassis legal for ${profile.id}`);
  }
  const chassis = pick(legalChassis, random);
  const state = pick(family.states, random);
  const scene = pick(program.scenes, random);
  const spiceRows = program.spice.filter((row) => row.band === profile.spiceBand);
  if (spiceRows.length === 0) {
    fail(program.id + " has no " + profile.spiceBand + " Spice row");
  }
  const spice = pick(spiceRows, random);
  const realm = program.realm[profile.realm];
  const receiptId = `${family.id}-${String(ordinal + 1).padStart(2, "0")}`;
  return {
    receiptId,
    seed: { label: seedLabel, value: seed },
    familyId: family.id,
    familyLabel: family.label,
    programId: program.id,
    programLabel: program.label,
    profileId: profile.id,
    contextTags,
    layers: {
      familyChassis: chassis,
      programArrangement: arrangement,
      operatingState: state,
      currentScene: scene,
      spice,
      realm: {
        id: profile.realm,
        ...realm,
      },
    },
    preservedInvariants: program.invariants,
    validation: {
      familyOwnsProgram: true,
      arrangementEligibleForContext: requirementsMet(arrangement, contextTags),
      chassisEligibleForContext: requirementsMet(chassis, contextTags),
      chassisAllowsArrangement:
        !(arrangement.chassisAllow || []).length ||
        arrangement.chassisAllow.includes(chassis.id),
      requestedSpiceBand: profile.spiceBand,
      selectedSpiceBand: spice.band,
      realmRealizationPresent: Boolean(realm && realm.label && realm.realization),
      programIdentityReadableBeforeDmInterpretation: "taste-call-required",
    },
    readout: [
      `${program.label} — ${realm.label}.`,
      chassis.text,
      arrangement.text,
      `Operating state: ${state.text}`,
      `Current scene: ${scene.text}`,
      `${spice.band} Spice: ${spice.text}`,
      `Realm realization: ${realm.realization}`,
    ].join(" "),
  };
}

function renderTable(rows, columns) {
  const header = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const rule = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map(
    (row, index) =>
      `| ${columns
        .map((column) => String(column.value(row, index)).replaceAll("|", "\\|"))
        .join(" | ")} |`
  );
  return [header, rule, ...body].join("\n");
}

function renderMarkdown(receipts) {
  const lines = [
    "# Building family sample tables and deterministic taste rolls",
    "",
    "date: 2026-07-26",
    "status: TASTE PACKET — sample d6/d4 tranches, not final d20 corpus or live runtime output",
    "source: `TABLE-SAMPLES.json`",
    "rerun: `node dev/roll-building-family-samples.mjs`",
    "",
    "## How to judge this packet",
    "",
    "For each family, decide:",
    "",
    "1. Does every chassis row belong to every program in the family?",
    "2. Does the program arrangement make the building recognizable before scene or Spice?",
    "3. Does the scene create immediate play without asking the DM to repair the building?",
    "4. Does Spice intensify a real program surface rather than replace the program?",
    "5. Does the realm realization materially change practice, technology, labor, and space?",
    "6. Should any family split, merge, or change its flavor before the tables expand?",
    "",
    "The sampler selects four deterministic receipts per family using Grounded/Frontier,",
    "Textured/Chrome, Strange/Gloom, and Volatile/Frontier profiles. Multi-program",
    "families rotate programs; singleton families exercise all four profiles.",
    "",
  ];

  for (const family of source.families) {
    lines.push(`## ${family.id} — ${family.label}`, "", family.sharedGrammar, "");
    lines.push("**Family forbids:**", "");
    for (const rule of family.forbids) lines.push(`- ${rule}`);
    lines.push("", "### Chassis taste tranche (d6)", "");
    lines.push(
      renderTable(family.chassis, [
        { label: "d6", value: (_row, index) => index + 1 },
        { label: "id", value: (row) => row.id },
        { label: "scale", value: (row) => row.scale },
        { label: "requires", value: (row) => (row.requires || []).join(", ") || "ordinary context" },
        { label: "sample relationship", value: (row) => row.text },
      ]),
      "",
      "### Operating-state taste tranche (d4)",
      "",
      renderTable(family.states, [
        { label: "d4", value: (_row, index) => index + 1 },
        { label: "id", value: (row) => row.id },
        { label: "sample state", value: (row) => row.text },
      ]),
      ""
    );

    for (const program of family.programs) {
      lines.push(`### ${program.label} program layer`, "");
      lines.push(`Invariants: ${program.invariants.join(" · ")}`, "");
      lines.push(program.programLayerLabel ? `Layer meaning: ${program.programLayerLabel}` : "Layer meaning: operating arrangement", "");
      lines.push("**Arrangement taste tranche (d4)**", "");
      lines.push(
        renderTable(program.arrangements, [
          { label: "d4", value: (_row, index) => index + 1 },
          { label: "id", value: (row) => row.id },
          {
            label: "eligibility",
            value: (row) => {
              const parts = [];
              if ((row.chassisAllow || []).length) parts.push("chassis " + row.chassisAllow.join(", "));
              if ((row.requires || []).length) parts.push("context " + row.requires.join(", "));
              return parts.join("; ") || "all family chassis";
            },
          },
          { label: "sample arrangement", value: (row) => row.text },
        ]),
        "",
        "**Current-scene taste tranche (d4)**",
        "",
        renderTable(program.scenes, [
          { label: "d4", value: (_row, index) => index + 1 },
          { label: "id", value: (row) => row.id },
          { label: "sample scene", value: (row) => row.text },
        ]),
        "",
        "**Spice taste tranche (band-selected d4 prototype)**",
        "",
        renderTable(program.spice, [
          { label: "band", value: (row) => row.band },
          { label: "id", value: (row) => row.id },
          { label: "sample Spice", value: (row) => row.text },
          { label: "surface", value: (row) => row.affects },
        ]),
        "",
        "**Realm-doctrine taste tranche**",
        "",
        renderTable(Object.entries(program.realm), [
          { label: "realm", value: (row) => row[0] },
          { label: "venue label", value: (row) => row[1].label },
          { label: "material operating realization", value: (row) => row[1].realization },
        ]),
        ""
      );
    }

    lines.push("### Deterministic sample rolls", "");
    for (const receipt of receipts.filter((row) => row.familyId === family.id)) {
      lines.push(
        `#### ${receipt.receiptId} — ${receipt.programLabel} — ${receipt.profileId}`,
        "",
        `Seed: \`${receipt.seed.label}\` → \`${receipt.seed.value}\``,
        "",
        `Context tags: ${receipt.contextTags.length ? receipt.contextTags.map((tag) => `\`${tag}\``).join(", ") : "ordinary"}`,
        "",
        `- Chassis: **${receipt.layers.familyChassis.id}** — ${receipt.layers.familyChassis.text}`,
        `- Arrangement: **${receipt.layers.programArrangement.id}** — ${receipt.layers.programArrangement.text}`,
        `- State: **${receipt.layers.operatingState.id}** — ${receipt.layers.operatingState.text}`,
        `- Scene: **${receipt.layers.currentScene.id}** — ${receipt.layers.currentScene.text}`,
        `- Spice: **${receipt.layers.spice.band} / ${receipt.layers.spice.id}** — ${receipt.layers.spice.text}`,
        `- Realm: **${receipt.layers.realm.id} / ${receipt.layers.realm.label}** — ${receipt.layers.realm.realization}`,
        ""
      );
    }
  }

  lines.push(
    "## Sampler verdict",
    "",
    "The sample architecture composes without using the general d300 or retrying an",
    "incompatible occupation. This is not yet a taste acceptance or runtime proof.",
    "Every `programIdentityReadableBeforeDmInterpretation` field deliberately remains",
    "`taste-call-required` until the founder reviews the rows and rolled combinations.",
    ""
  );
  return lines.join("\n");
}

function writeOrCheck(path, content) {
  if (!CHECK) {
    writeFileSync(path, content);
    return;
  }
  const existing = readFileSync(path, "utf8");
  if (existing !== content) {
    fail("Generated artifact is stale: " + path);
  }
}

validateSource();
const receipts = [];
for (const family of source.families) {
  for (let index = 0; index < source.profiles.length; index++) {
    const profile = source.profiles[index];
    const program = family.programs[index % family.programs.length];
    receipts.push(makeReceipt(family, program, profile, index));
  }
}

const sourceSha256 = createHash("sha256").update(sourceText).digest("hex");
const receiptDocument = {
  schema: "genesis.building-family-taste-rolls.v1",
  generatedOn: "2026-07-26",
  source: "Reference/Building-Family-Table-Samples/TABLE-SAMPLES.json",
  sourceSha256,
  sampler: "dev/roll-building-family-samples.mjs",
  familyCount: source.families.length,
  programCount: source.families.flatMap((family) => family.programs).length,
  receiptsPerFamily: source.profiles.length,
  receiptCount: receipts.length,
  profiles: source.profiles,
  receipts,
};
const receiptText = JSON.stringify(receiptDocument, null, 2) + "\n";
const cardText = renderMarkdown(receipts) + "\n";
writeOrCheck(RECEIPT_PATH, receiptText);
writeOrCheck(CARD_PATH, cardText);

console.log(
  `${CHECK ? "Verified" : "Wrote"} ${source.families.length} families, ` +
    `${receiptDocument.programCount} programs, and ${receipts.length} deterministic taste receipts`
);
