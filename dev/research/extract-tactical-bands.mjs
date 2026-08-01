#!/usr/bin/env node
// extract-tactical-bands.mjs — TACTICAL-PROMISE-GATE §2 T1 (docs/TACTICAL-PROMISE-GATE.md)
//
// Parses Reference/FFT-Triangle-Strategy-World-Study/data/MEASUREMENTS.csv (45 data rows,
// 37 columns, quoted fields contain commas), groups band-eligible rows into three size
// classes by traversableCellEstimate terciles, and emits per-class AND per-grouping
// (fftOnly vs pooled FFT+TS — spec §5 Q1 side-by-side) distributions for the eight
// tactical metrics of spec §1: min / p10 / median / p90 / max / n + source rows.
//
// Outputs (both written by this script; deterministic — no timestamps, fixed ordering,
// two consecutive runs are byte-identical):
//   docs/intel/tactical-promise-bands.json   (committed truth)
//   docs/intel/tactical-promise-bands.md     (readable tables + quoted lane-1 counting
//                                             rules + DERIVED rules and special cases)
//
// Gate G1 self-checks (asserted in-script, printed on success):
//   - all 45 data rows parsed, per-game counts asserted (FFT 12 / TS 12 / Genesis 12 / IC 9)
//   - zero NaN/null in emitted bands (every stat finite, every n >= 1)
//   - .md row accounting: parsed-appendix rows + excluded rows === 45
//   - every declared special case consumed exactly once (stale-special-case tripwire)
//
// No dependencies beyond node builtins.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strict as assert } from 'node:assert';

// ---------------------------------------------------------------------------
// Paths (script lives at <root>/dev/research/; resolve everything from root)
// ---------------------------------------------------------------------------
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CSV_PATH = resolve(ROOT, 'Reference/FFT-Triangle-Strategy-World-Study/data/MEASUREMENTS.csv');
const OUT_DIR = resolve(ROOT, 'docs/intel');
const OUT_JSON = resolve(OUT_DIR, 'tactical-promise-bands.json');
const OUT_MD = resolve(OUT_DIR, 'tactical-promise-bands.md');

// ---------------------------------------------------------------------------
// Expected schema — hard tripwire: if the CSV's column order ever drifts, fail
// loudly instead of silently mis-binding columns.
// ---------------------------------------------------------------------------
const EXPECTED_HEADER = [
  'game', 'version', 'mapName', 'chapterOrId', 'sourceUrls', 'sourceType', 'captureView',
  'nativeOrRescaled', 'playableWidthCells', 'playableHeightCells', 'traversableCellEstimate',
  'framePlayableAreaPct', 'frameScenicContextPct', 'spawnToFirstDecisionCells',
  'longestMandatoryApproachCells', 'likelyBacktrackCells', 'elevationBandCount',
  'maxConsequentialElevationDelta', 'majorRouteCount', 'alternateRouteCount',
  'shortLoopCount', 'chokepointCount', 'reachableHighGroundCount', 'sceneryOnlyHighMassCount',
  'majorSilhouetteMassCount', 'broadMaterialFamilyCount', 'dominantTexelFrequencyEstimate',
  'practicalLightCount', 'foregroundLayerPresent', 'midgroundLayerPresent', 'farFieldPresent',
  'cameraRotationRange', 'cameraZoomRange', 'spriteDirectionEvidence', 'dynamicStateEvidence',
  'notes', 'confidence',
];

// The eight tactical metrics of spec §1 (spec table order, spawn last), plus the driver.
const SIZE_DRIVER = 'traversableCellEstimate';
const METRICS = [
  'elevationBandCount',
  'maxConsequentialElevationDelta',
  'majorRouteCount',
  'alternateRouteCount',
  'shortLoopCount',
  'chokepointCount',
  'reachableHighGroundCount',
  'spawnToFirstDecisionCells',
];

const EXPECTED_DATA_ROWS = 45;
const EXPECTED_GAME_COUNTS = { FFT: 12, TriangleStrategy: 12, Genesis: 12, IvaliceChronicles: 9 };

// Band eligibility: which rows carry independent tactical measurements.
//  - FFT: measured corpus rows                          -> fftOnly + pooled
//  - TriangleStrategy: estimated corpus rows            -> pooled
//  - Genesis: subject-under-test design-intent/fixture rows (incl. one DECLARED GAP row
//    whose cells are em-dashes) — not corpus evidence   -> excluded
//  - IvaliceChronicles: every tactical cell is the literal alias "as FFT (same board)";
//    no independent values (and 3 of 9 alias boards absent from the 12 measured FFT rows,
//    so the alias is not even resolvable) — duplicates, not evidence -> excluded
const EXCLUDED_GAME_REASONS = {
  Genesis:
    'subject-under-test rows (design intents / engine fixtures), not tactics-corpus evidence; ' +
    'cells are design-intent prose, and the DECLARED GAP row carries em-dash placeholders',
  IvaliceChronicles:
    'alias rows — every tactical cell reads "as FFT (same board)" (no independent values); ' +
    '3 of 9 (Lionel Castle Gate, Riovanes Castle Roof, Sand Rat\'s Sietch) alias boards that are ' +
    'not among the 12 measured FFT rows, and resolving the other 6 would only double-weight ' +
    'FFT boards in the pooled band',
};

// Special cases — cells that resist the leading-range parse, keyed by (mapName, column).
// Any OTHER unparseable cell is a hard error naming the row: rows are never dropped silently.
const SPECIAL_CASES = [
  {
    mapName: 'Telliore reservoir dam',
    column: 'maxConsequentialElevationDelta',
    rawMustInclude: "'Height 32' HUD documented",
    value: 32,
    note:
      "cell is prose, not a range: the study recorded the HUD reading 'Height 32' — TS fine " +
      'height units, an absolute tile height documented as evidence of a large delta, not a ' +
      'measured delta, and incomparable to FFT h-units. Parsed as 32 so the pooled grouping ' +
      'SHOWS the unit clash instead of hiding the row; the fftOnly grouping is unaffected.',
    used: 0,
  },
];

// ---------------------------------------------------------------------------
// CSV parser — RFC-4180 state machine (quoted fields with commas, "" escapes,
// tolerant of newlines inside quotes although this file has none).
// ---------------------------------------------------------------------------
function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  assert.equal(inQuotes, false, 'CSV ended inside a quoted field');
  return rows;
}

// ---------------------------------------------------------------------------
// Cell parser for metric/driver cells (band-eligible rows only).
// DERIVED midpoint rule: take the LEADING numeric token of the cell — a single
// number or a lo-hi range; a range becomes its arithmetic midpoint; a leading
// "~" is recorded as approximate; trailing unit letters (h, units) are stripped
// and recorded; everything after the leading token (parentheticals like
// "(visual; envelope 156)" or "(est)") is annotation, not value.
// ---------------------------------------------------------------------------
const LEADING_NUMBER_RE = /^(~)?\s*(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?\s*([A-Za-z]*)/;

function parseMetricCell(raw, mapName, column) {
  const sc = SPECIAL_CASES.find((s) => s.mapName === mapName && s.column === column);
  if (sc) {
    assert.ok(
      raw.includes(sc.rawMustInclude),
      `special case for ${mapName}/${column} no longer matches the cell — CSV changed?`,
    );
    sc.used += 1;
    return { raw, value: sc.value, kind: 'special-case', unit: 'TS fine height units', approx: true };
  }
  const m = LEADING_NUMBER_RE.exec(raw.trim());
  if (!m || m[2] === undefined) {
    throw new Error(
      `Unparseable cell for "${mapName}" / ${column}: "${raw}" — add a SPECIAL_CASES entry; ` +
      'rows are never dropped silently (gate G1).',
    );
  }
  const approx = m[1] === '~';
  const lo = Number(m[2]);
  const hi = m[3] === undefined ? undefined : Number(m[3]);
  const unit = m[4] || '';
  const value = hi === undefined ? lo : (lo + hi) / 2;
  const kind = hi === undefined ? (approx ? 'single(~)' : 'exact') : (approx ? 'midpoint(~)' : 'midpoint');
  assert.ok(Number.isFinite(value), `non-finite parse for ${mapName}/${column}: "${raw}"`);
  return { raw, value, kind, unit, approx };
}

// ---------------------------------------------------------------------------
// Stats — deterministic, documented.
// DERIVED quantile rule: linear interpolation between order statistics
// (type R-7, the numpy/Excel default): q(p) = s[(n-1)p], interpolated.
// DERIVED tercile rule: per grouping, sort driver values ascending;
// e1 = ceil(n/3)-th smallest, e2 = ceil(2n/3)-th smallest;
// class small: v <= e1 · medium: e1 < v <= e2 · large: v > e2.
// Equal driver values always share a class (no rank tie-breaks by name).
// ---------------------------------------------------------------------------
const round4 = (v) => Math.round(v * 10000) / 10000;

function quantile(sorted, p) {
  const n = sorted.length;
  if (n === 1) return sorted[0];
  const h = (n - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.ceil(h);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (h - lo);
}

function stats(values, sourceRows) {
  assert.ok(values.length >= 1, 'stats over empty set');
  const s = [...values].sort((a, b) => a - b);
  const out = {
    min: round4(s[0]),
    p10: round4(quantile(s, 0.10)),
    median: round4(quantile(s, 0.50)),
    p90: round4(quantile(s, 0.90)),
    max: round4(s[s.length - 1]),
    n: s.length,
    sourceRows,
  };
  for (const k of ['min', 'p10', 'median', 'p90', 'max']) {
    assert.ok(Number.isFinite(out[k]), `NaN in band stat ${k}`);
  }
  return out;
}

function tercileEdges(values) {
  const s = [...values].sort((a, b) => a - b);
  const n = s.length;
  const e1 = s[Math.ceil(n / 3) - 1];
  const e2 = s[Math.ceil((2 * n) / 3) - 1];
  return { e1: round4(e1), e2: round4(e2), min: round4(s[0]), max: round4(s[n - 1]) };
}

const classOf = (v, edges) => (v <= edges.e1 ? 'small' : v <= edges.e2 ? 'medium' : 'large');

// ---------------------------------------------------------------------------
// Load + parse
// ---------------------------------------------------------------------------
const csvText = readFileSync(CSV_PATH, 'utf8');
const table = parseCsv(csvText);
const header = table[0];
assert.equal(header.length, 37, `header has ${header.length} columns, expected 37`);
assert.deepEqual(header, EXPECTED_HEADER, 'CSV header drifted from the expected 37-column schema');

const dataRows = table.slice(1).filter((r) => !(r.length === 1 && r[0] === ''));
assert.equal(
  dataRows.length, EXPECTED_DATA_ROWS,
  `parsed ${dataRows.length} data rows, expected ${EXPECTED_DATA_ROWS}`,
);
for (const r of dataRows) {
  assert.equal(r.length, 37, `row "${r[2]}" has ${r.length} fields, expected 37`);
}

const col = Object.fromEntries(EXPECTED_HEADER.map((name, i) => [name, i]));
const gameCounts = {};
for (const r of dataRows) gameCounts[r[col.game]] = (gameCounts[r[col.game]] || 0) + 1;
assert.deepEqual(
  { ...gameCounts }, EXPECTED_GAME_COUNTS,
  'per-game row counts drifted from FFT 12 / TriangleStrategy 12 / Genesis 12 / IvaliceChronicles 9',
);

// Row records (CSV order preserved everywhere — it is the corpus's own ordering).
const rows = dataRows.map((r) => {
  const game = r[col.game];
  const mapName = r[col.mapName];
  const base = {
    game,
    mapName,
    chapterOrId: r[col.chapterOrId],
    confidence: r[col.confidence], // confidence tag pass-through, verbatim
  };
  if (game === 'FFT' || game === 'TriangleStrategy') {
    const cells = {};
    for (const c of [SIZE_DRIVER, ...METRICS]) cells[c] = parseMetricCell(r[col[c]], mapName, c);
    return { ...base, included: true, cells };
  }
  return {
    ...base,
    included: false,
    excludedReason: EXCLUDED_GAME_REASONS[game],
    traversableCellEstimateRaw: r[col[SIZE_DRIVER]],
  };
});

for (const sc of SPECIAL_CASES) {
  assert.equal(sc.used, 1, `special case ${sc.mapName}/${sc.column} consumed ${sc.used} times, expected 1`);
}

const corpusRows = rows.filter((r) => r.included);
const excludedRows = rows.filter((r) => !r.included);
assert.equal(corpusRows.length + excludedRows.length, EXPECTED_DATA_ROWS);

// ---------------------------------------------------------------------------
// Groupings: fftOnly (FFT rows) and pooled (FFT + TriangleStrategy rows).
// Terciles are computed PER GROUPING over that grouping's own driver values, so
// each grouping's three classes are guaranteed non-empty (G1: no NaN from an
// empty class) and each grouping is a self-contained banding of its corpus.
// ---------------------------------------------------------------------------
function buildGrouping(name, memberRows) {
  const driverValues = memberRows.map((r) => r.cells[SIZE_DRIVER].value);
  const edges = tercileEdges(driverValues);
  const classes = { small: [], medium: [], large: [] };
  for (const r of memberRows) classes[classOf(r.cells[SIZE_DRIVER].value, edges)].push(r);
  for (const [k, members] of Object.entries(classes)) {
    assert.ok(members.length >= 1, `${name}: empty size class ${k}`);
  }

  const bandsFor = (members) => {
    const bands = {};
    for (const metric of METRICS) {
      bands[metric] = stats(
        members.map((r) => r.cells[metric].value),
        members.map((r) => r.mapName),
      );
    }
    return bands;
  };
  const driverFor = (members) => stats(
    members.map((r) => r.cells[SIZE_DRIVER].value),
    members.map((r) => r.mapName),
  );

  return {
    rows: memberRows.map((r) => r.mapName),
    n: memberRows.length,
    tercileEdges: edges,
    sizeClassRule:
      `small: traversable <= ${edges.e1} · medium: <= ${edges.e2} · large: > ${edges.e2} ` +
      '(edges DERIVED from this grouping\'s own rows; equal values always share a class)',
    classes: {
      small: { rows: classes.small.map((r) => r.mapName), n: classes.small.length },
      medium: { rows: classes.medium.map((r) => r.mapName), n: classes.medium.length },
      large: { rows: classes.large.map((r) => r.mapName), n: classes.large.length },
    },
    driver: {
      all: driverFor(memberRows),
      small: driverFor(classes.small),
      medium: driverFor(classes.medium),
      large: driverFor(classes.large),
    },
    bands: {
      all: bandsFor(memberRows),
      small: bandsFor(classes.small),
      medium: bandsFor(classes.medium),
      large: bandsFor(classes.large),
    },
  };
}

const fftRows = corpusRows.filter((r) => r.game === 'FFT');
const groupings = {
  fftOnly: buildGrouping('fftOnly', fftRows),
  pooled: buildGrouping('pooled', corpusRows),
};

// Per-row size classes (a row's class can differ between groupings — both are true
// statements inside their own grouping; recorded on the row so T2 can consume either).
for (const r of corpusRows) {
  if (r.game === 'FFT') r.sizeClassFftOnly = classOf(r.cells[SIZE_DRIVER].value, groupings.fftOnly.tercileEdges);
  r.sizeClassPooled = classOf(r.cells[SIZE_DRIVER].value, groupings.pooled.tercileEdges);
}

// G1: zero NaN/null anywhere in emitted bands.
let bandStatCount = 0;
for (const g of Object.values(groupings)) {
  for (const classBlock of Object.values(g.bands)) {
    for (const st of Object.values(classBlock)) {
      for (const k of ['min', 'p10', 'median', 'p90', 'max', 'n']) {
        assert.ok(Number.isFinite(st[k]), `NaN/null band stat ${k}`);
        bandStatCount += 1;
      }
    }
  }
  for (const st of Object.values(g.driver)) {
    for (const k of ['min', 'p10', 'median', 'p90', 'max', 'n']) {
      assert.ok(Number.isFinite(st[k]), `NaN/null driver stat ${k}`);
      bandStatCount += 1;
    }
  }
}

// ---------------------------------------------------------------------------
// Lane-1 counting rules — quoted VERBATIM from
// Reference/FFT-Triangle-Strategy-World-Study/lane-1-footprint-topology-pacing.md
// (the counting-rule authority; T2 inherits these beside each implementation).
// ---------------------------------------------------------------------------
const LANE1 = 'Reference/FFT-Triangle-Strategy-World-Study/lane-1-footprint-topology-pacing.md';
const COUNTING_RULES = [
  {
    metric: 'traversableCellEstimate (size-class driver)',
    quotes: [
      '§1.1: "Measured (28 px/tile top-down renders, cross-checked against FFHacktics data grids; 40/48 exact agreement, 8 cases where the data grid carries 1–2 unrendered edge columns — both figures recorded)"',
      '§1.3: "FFT: measured non-void share of the top-down envelope: 60–95% by map (CSV per-row); the remainder is *composed void*, not world — beyond the edge is black."',
      '§1.2 (TS method): "No public per-tile data exists (declared measurement limit). From full-map deploy renders with visible grid patches + unit-height scale reference (sprite ≈ 1 tile)"',
    ],
  },
  {
    metric: 'elevationBandCount',
    quotes: [
      '§1.7: "FFT cohort: 2–5 bands; every reachable band is contestable (height = attack/defense + range mechanics per the Aerostar BMG, 783K-char local copy); scenery-only verticals are clearly nonwalkable (spires, church towers, tree crowns)."',
    ],
  },
  {
    metric: 'maxConsequentialElevationDelta',
    quotes: [
      'lane-1 states NO dedicated counting rule for this column (flagged per gate G3 — nothing to inherit beyond §1.7\'s consequential-vs-decorative frame, quoted above). The CSV cells carry their own unit annotations: FFT "(FFT h-units, visual est)", TS "units". The two unit systems are NOT comparable — see DERIVED notes.',
    ],
  },
  {
    metric: 'majorRouteCount',
    quotes: [
      '§1.8: "primary routes 1 (Mandalia\'s open field = 2–3 broad approaches)"',
      '§1.8: "**The shape is: one spine, one licensed alternate, one constraint**"',
      'lane-1 states NO cell-share distinctness rule; the spec §2 T2 "≤30% shared cells" rule stays DERIVED (spec-origin), uncontradicted by lane-1.',
    ],
  },
  {
    metric: 'alternateRouteCount',
    quotes: ['§1.8: "alternates 0–2"'],
  },
  {
    metric: 'shortLoopCount',
    quotes: ['§1.8: "short loops 0–1"'],
  },
  {
    metric: 'chokepointCount',
    quotes: ['§1.8: "chokepoints 0–2 (gates/bridges)"'],
  },
  {
    metric: 'reachableHighGroundCount',
    quotes: [
      '§1.8: "reachable high grounds 1–6; scenery masses 1–8"',
      '§1.7 (the reachable-vs-scenery split): "scenery-only verticals are clearly nonwalkable (spires, church towers, tree crowns)" — the CSV keeps the scenery side in its own column, sceneryOnlyHighMassCount.',
    ],
  },
  {
    metric: 'spawnToFirstDecisionCells',
    quotes: [
      '§1.4: "FFT (cohort views + documented starts): party spawns at a board edge; enemies visible immediately; first branch (route/height choice) within **2–4 cells**."',
      '§1.4: "TS (Wolffort deploy render): deploy tiles abut the contested street; first choice (street vs stair-to-roofs) is **1–3 cells** out."',
    ],
  },
];

// ---------------------------------------------------------------------------
// Assemble JSON (fixed insertion order everywhere -> deterministic output)
// ---------------------------------------------------------------------------
const jsonOut = {
  meta: {
    spec: 'docs/TACTICAL-PROMISE-GATE.md §2 T1',
    source: 'Reference/FFT-Triangle-Strategy-World-Study/data/MEASUREMENTS.csv',
    countingRuleAuthority: LANE1,
    generator: 'dev/research/extract-tactical-bands.mjs',
    deterministic: 'no timestamps; fixed ordering; reruns are byte-identical',
    rowCounts: {
      csvDataRows: dataRows.length,
      bandEligible: corpusRows.length,
      excluded: excludedRows.length,
      byGame: EXPECTED_GAME_COUNTS,
    },
    sizeClassDriver: SIZE_DRIVER,
    metrics: METRICS,
    derivedRules: {
      midpoint:
        'a cell\'s LEADING numeric token is the value: "3-4" -> 3.5, "2-3h" -> strip unit ' +
        'letters then midpoint -> 2.5, "120-140 (visual; envelope 156)" -> leading range only ' +
        '-> 130, "~200-280 (est)" -> 240 (leading "~" recorded as approximate). Parentheticals ' +
        'are annotation, never value.',
      quantile:
        'p10/median/p90 by linear interpolation between order statistics (type R-7, the ' +
        'numpy/Excel default): q(p) = s[(n-1)p] interpolated; min/max exact.',
      terciles:
        'per grouping over that grouping\'s own driver values: e1 = ceil(n/3)-th smallest, ' +
        'e2 = ceil(2n/3)-th smallest; small v<=e1, medium e1<v<=e2, large v>e2; equal driver ' +
        'values always share a class. Computed per grouping so every class is non-empty in ' +
        'both groupings (a single pooled edge set would leave fftOnly\'s large class empty).',
      exclusions: EXCLUDED_GAME_REASONS,
      specialCases: SPECIAL_CASES.map(({ mapName, column, value, note }) => ({ mapName, column, value, note })),
      unitCaveat:
        'maxConsequentialElevationDelta pools two unit systems (FFT h-units vs TS "units"/fine ' +
        'HUD units). fftOnly bands are unit-clean; pooled delta bands are shown for the §5 Q1 ' +
        'ruling but are NOT unit-normalized.',
    },
    countingRules: COUNTING_RULES,
    t2Flags: [
      'Spec §3 G2 GREEN-fixture values for Grog Hill MAP081 ("2-3 bands, 5-6h delta, 1 major + ' +
      '1 alternate, 2 loops, 4 chokepoints") disagree with the CSV row, which reads: ' +
      'spawnToFirstDecisionCells 2-3, elevationBandCount 4, delta 5-6h, 1 major + 1 alternate, ' +
      '1 loop, 2 chokepoints, 4 reachable high grounds. The spec line appears column-shifted; ' +
      'MEASUREMENTS.csv is the row-level authority (lane-1: "Data: `data/MEASUREMENTS.csv` ' +
      '(row-level)"). T2 must hand-translate the fixture from the CSV row, not the spec prose.',
      'lane-1 defines no counting rule for maxConsequentialElevationDelta and no route ' +
      'cell-share distinctness rule; both stay DERIVED in T2 (gate G3 flags, lane-1 wins if it ' +
      'ever states one).',
    ],
  },
  groupings,
  rows: rows.map((r) => {
    if (!r.included) {
      return {
        game: r.game,
        mapName: r.mapName,
        chapterOrId: r.chapterOrId,
        confidence: r.confidence,
        included: false,
        excludedReason: r.excludedReason,
        traversableCellEstimateRaw: r.traversableCellEstimateRaw,
      };
    }
    const cells = {};
    for (const c of [SIZE_DRIVER, ...METRICS]) {
      const { raw, value, kind, unit } = r.cells[c];
      cells[c] = { raw, value: round4(value), kind, ...(unit ? { unit } : {}) };
    }
    return {
      game: r.game,
      mapName: r.mapName,
      chapterOrId: r.chapterOrId,
      confidence: r.confidence,
      included: true,
      ...(r.sizeClassFftOnly ? { sizeClassFftOnly: r.sizeClassFftOnly } : {}),
      sizeClassPooled: r.sizeClassPooled,
      cells,
    };
  }),
};

// ---------------------------------------------------------------------------
// Assemble Markdown
// ---------------------------------------------------------------------------
const fmt = (v) => String(v);
const kindMark = (k) =>
  k === 'exact' ? '' : k === 'midpoint' ? '*' : k === 'midpoint(~)' ? '*~' : k === 'single(~)' ? '~' : '†';

function bandTable(bands, driverStat) {
  const lines = [];
  lines.push('| metric | min | p10 | median | p90 | max | n |');
  lines.push('|---|---|---|---|---|---|---|');
  lines.push(
    `| _${SIZE_DRIVER} (driver)_ | ${fmt(driverStat.min)} | ${fmt(driverStat.p10)} | ${fmt(driverStat.median)} | ${fmt(driverStat.p90)} | ${fmt(driverStat.max)} | ${driverStat.n} |`,
  );
  for (const metric of METRICS) {
    const s = bands[metric];
    lines.push(`| ${metric} | ${fmt(s.min)} | ${fmt(s.p10)} | ${fmt(s.median)} | ${fmt(s.p90)} | ${fmt(s.max)} | ${s.n} |`);
  }
  return lines;
}

const md = [];
md.push('---');
md.push('type: research-artifact');
md.push('project: Genesis');
md.push('status: GENERATED — do not hand-edit; regenerate with `node dev/research/extract-tactical-bands.mjs`');
md.push('spec: docs/TACTICAL-PROMISE-GATE.md §2 T1');
md.push('source: Reference/FFT-Triangle-Strategy-World-Study/data/MEASUREMENTS.csv');
md.push(`counting-rule authority: ${LANE1}`);
md.push('---');
md.push('');
md.push('# Tactical promise bands (T1)');
md.push('');
md.push('Measured FFT-corpus (and pooled FFT+TS) distributions for the eight tactical metrics of');
md.push('TACTICAL-PROMISE-GATE §1, per size class, for the T2 gate harness to assert against.');
md.push('Committed truth: `docs/intel/tactical-promise-bands.json` (same generator, same run).');
md.push('');
md.push('## Row accounting (matches the CSV)');
md.push('');
md.push(`- CSV data rows: **${dataRows.length}** (header excluded) — all parsed; per-game: FFT 12 · TriangleStrategy 12 · Genesis 12 · IvaliceChronicles 9.`);
md.push(`- Band-eligible corpus rows: **${corpusRows.length}** (FFT 12 + TriangleStrategy 12) — the parsed-values appendix below lists every one.`);
md.push(`- Band-excluded rows: **${excludedRows.length}** (Genesis 12 + IvaliceChronicles 9) — parsed and accounted for, listed below with reasons; never silently dropped.`);
md.push(`- ${corpusRows.length} + ${excludedRows.length} = ${dataRows.length}. ✔`);
md.push('');
md.push('### Excluded rows (parse-included, band-excluded)');
md.push('');
md.push('| game | mapName | reason (summary) |');
md.push('|---|---|---|');
for (const r of excludedRows) {
  const reason = r.game === 'Genesis'
    ? 'subject-under-test design-intent/fixture row, not corpus evidence'
    : 'alias row — tactical cells read "as FFT (same board)"; no independent values';
  md.push(`| ${r.game} | ${r.mapName.replace(/\|/g, '\\|')} | ${reason} |`);
}
md.push('');
md.push('Full reasons:');
md.push('');
md.push(`- **Genesis (12 rows):** ${EXCLUDED_GAME_REASONS.Genesis}.`);
md.push(`- **IvaliceChronicles (9 rows):** ${EXCLUDED_GAME_REASONS.IvaliceChronicles}.`);
md.push('');
md.push('## Size classes (terciles of traversableCellEstimate)');
md.push('');
md.push('Terciles are computed **per grouping** over that grouping\'s own rows (DERIVED rule below),');
md.push('so every class is non-empty in both groupings. A row\'s class can therefore differ between');
md.push('groupings (e.g. Grog Hill: fftOnly **large**, pooled **medium**) — each is true inside its');
md.push('own grouping, and T2 must use the edge set of whichever grouping §5 Q1\'s ruling picks.');
md.push('');
for (const [gName, g] of Object.entries(groupings)) {
  const e = g.tercileEdges;
  md.push(`### ${gName} (n=${g.n})`);
  md.push('');
  md.push(`- Edges: **small ≤ ${e.e1} · medium ${e.e1}–${e.e2} · large > ${e.e2}** (driver min ${e.min}, max ${e.max}).`);
  md.push(`- small (n=${g.classes.small.n}): ${g.classes.small.rows.join(' · ')}`);
  md.push(`- medium (n=${g.classes.medium.n}): ${g.classes.medium.rows.join(' · ')}`);
  md.push(`- large (n=${g.classes.large.n}): ${g.classes.large.rows.join(' · ')}`);
  md.push('');
}
md.push('## Bands');
md.push('');
md.push('Values carry the midpoint marks of the appendix (`*` midpoint, `~` approximate, `†` special');
md.push('case) only in the appendix; band stats below are computed over the parsed values. The');
md.push('`all` block is the whole grouping (the §5 Q1 side-by-side view); small/medium/large are');
md.push('the per-class bands T2 asserts against.');
md.push('');
for (const [gName, g] of Object.entries(groupings)) {
  const label = gName === 'fftOnly'
    ? 'fftOnly — FFT rows only (unit-clean)'
    : 'pooled — FFT + TriangleStrategy (delta metric mixes unit systems; see DERIVED)';
  md.push(`### Grouping: ${label}`);
  md.push('');
  for (const classKey of ['all', 'small', 'medium', 'large']) {
    const members = classKey === 'all' ? g.rows : g.classes[classKey].rows;
    md.push(`#### ${gName} / ${classKey} (n=${members.length})`);
    md.push('');
    md.push(...bandTable(g.bands[classKey], g.driver[classKey]));
    md.push('');
    md.push(`Rows: ${members.join(' · ')}`);
    md.push('');
  }
}
md.push('## Lane-1 counting rules (quoted — T2 inherits these beside each metric implementation)');
md.push('');
md.push(`Authority: \`${LANE1}\` (its line 3 names the row-level source: "Data: \`data/MEASUREMENTS.csv\` (row-level)").`);
md.push('');
for (const cr of COUNTING_RULES) {
  md.push(`### ${cr.metric}`);
  md.push('');
  for (const q of cr.quotes) md.push(`> ${q}`);
  md.push('');
}
md.push('## DERIVED rules (everything that is interpretation, not measurement)');
md.push('');
md.push('1. **Midpoint rule.** A cell\'s LEADING numeric token is the value: `3-4` → 3.5; `2-3h` →');
md.push('   strip trailing unit letters, then midpoint → 2.5; `120-140 (visual; envelope 156)` →');
md.push('   leading range only → 130; `~200-280 (est)` → 240, with the leading `~` recorded as');
md.push('   approximate. Parentheticals are annotation, never value. Midpointed values are tagged');
md.push('   DERIVED in the appendix (`*`); untouched integers are MEASURED as recorded.');
md.push('2. **Quantile rule.** p10/median/p90 by linear interpolation between order statistics');
md.push('   (type R-7, the numpy/Excel default): q(p) = s[(n−1)p] interpolated; min/max exact.');
md.push('3. **Tercile rule.** Per grouping over its own driver values: e1 = ceil(n/3)-th smallest,');
md.push('   e2 = ceil(2n/3)-th smallest; small v ≤ e1, medium e1 < v ≤ e2, large v > e2; equal');
md.push('   driver values always share a class (no name tie-breaks). Computed per grouping because');
md.push('   a single pooled edge set would leave fftOnly\'s large class EMPTY (every FFT row except');
md.push('   the two 130s sits below the pooled e1) and empty classes would put NaN in bands (G1).');
md.push(`   Resulting edges — fftOnly: e1 ${groupings.fftOnly.tercileEdges.e1}, e2 ${groupings.fftOnly.tercileEdges.e2}; pooled: e1 ${groupings.pooled.tercileEdges.e1}, e2 ${groupings.pooled.tercileEdges.e2}.`);
md.push('4. **Row exclusions (by game, every row listed above).** Genesis rows are the subject under');
md.push('   test (design intents / fixtures; the "DECLARED GAP — no Genesis snow/ice target or');
md.push('   capture exists yet" row carries em-dash placeholders in every consumed column and is the');
md.push('   canonical resists-parsing row — excluded at the game level before cell parsing, so no');
md.push('   invented values). IvaliceChronicles rows alias FFT boards ("as FFT (same board)") with');
md.push('   no independent numbers; three alias boards absent from the measured FFT set.');
md.push('5. **Special-cased cells (by mapName):**');
for (const sc of SPECIAL_CASES) {
  md.push(`   - **${sc.mapName}** / \`${sc.column}\`: raw cell begins \`'Height 32' HUD documented —…\` — ${sc.note}`);
}
md.push('6. **Unit caveat (pooled delta).** `maxConsequentialElevationDelta` pools FFT h-units with');
md.push('   TS "units"/fine HUD units. fftOnly delta bands are unit-clean; pooled delta bands are');
md.push('   emitted for the §5 Q1 side-by-side ruling but are NOT unit-normalized — the pooled');
md.push('   medium-class max of 32 is the Telliore special case showing through, on purpose.');
md.push('7. **Flag for T2 (spec-vs-CSV discrepancy).** Spec §3 G2\'s Grog Hill MAP081 example');
md.push('   ("2-3 bands, 5-6h delta, 1 major + 1 alternate, 2 loops, 4 chokepoints") disagrees with');
md.push('   the CSV row: spawn 2-3 · bands 4 · delta 5-6h · 1 major · 1 alternate · **1 loop** ·');
md.push('   **2 chokepoints** · 4 reachable high grounds. The spec line appears column-shifted.');
md.push('   MEASUREMENTS.csv is the row-level authority; T2\'s GREEN fixture must be translated');
md.push('   from the CSV row, not the spec prose.');
md.push('8. **Flag for T2 (rules lane-1 does NOT state).** No lane-1 counting rule exists for');
md.push('   `maxConsequentialElevationDelta` (only §1.7\'s consequential-vs-decorative frame), and');
md.push('   no route cell-share distinctness rule exists (the spec\'s ≤30% stays DERIVED). Gate G3:');
md.push('   flag, don\'t invent; lane-1 wins if it ever states one.');
md.push('');
md.push('## Appendix — parsed values per corpus row (MEASURED vs DERIVED provenance)');
md.push('');
md.push('Marks: unmarked = MEASURED integer as recorded · `*` = DERIVED midpoint of a recorded');
md.push('range · `~` = recorded as approximate in the CSV · `†` = special case (see DERIVED §5).');
md.push('Raw cell text is preserved verbatim in the JSON (`rows[].cells[].raw`). Confidence is the');
md.push('CSV tag, passed through verbatim.');
md.push('');
md.push('| game | mapName | class (fft/pooled) | trav | elevBands | maxDelta | major | alt | loops | chokes | reachHigh | spawn→dec | confidence |');
md.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of corpusRows) {
  const c = (m) => `${fmt(round4(r.cells[m].value))}${kindMark(r.cells[m].kind)}`;
  const cls = `${r.sizeClassFftOnly ?? '—'}/${r.sizeClassPooled}`;
  md.push(
    `| ${r.game} | ${r.mapName.replace(/\|/g, '\\|')} | ${cls} | ${c(SIZE_DRIVER)} | ${c('elevationBandCount')} | ${c('maxConsequentialElevationDelta')} | ${c('majorRouteCount')} | ${c('alternateRouteCount')} | ${c('shortLoopCount')} | ${c('chokepointCount')} | ${c('reachableHighGroundCount')} | ${c('spawnToFirstDecisionCells')} | ${r.confidence.replace(/\|/g, '\\|')} |`,
  );
}
md.push('');
md.push(`Appendix rows: ${corpusRows.length} · excluded rows listed above: ${excludedRows.length} · total = ${corpusRows.length + excludedRows.length} = CSV data rows. ✔`);
md.push('');

// .md row-count self-check against the CSV (gate G1)
const appendixRowCount = corpusRows.length;
const excludedTableCount = excludedRows.length;
assert.equal(appendixRowCount + excludedTableCount, dataRows.length, '.md row accounting drifted from the CSV');

// ---------------------------------------------------------------------------
// Write outputs (LF, trailing newline, no timestamps)
// ---------------------------------------------------------------------------
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(jsonOut, null, 2) + '\n', 'utf8');
writeFileSync(OUT_MD, md.join('\n') + '\n', 'utf8');

// ---------------------------------------------------------------------------
// G1 proof lines
// ---------------------------------------------------------------------------
console.log(`G1 rows: parsed ${dataRows.length}/${EXPECTED_DATA_ROWS} data rows (FFT 12 · TriangleStrategy 12 · Genesis 12 · IvaliceChronicles 9) — all asserted`);
console.log(`G1 bands: ${bandStatCount} emitted stats checked — zero NaN/null (asserted per value)`);
console.log(`G1 md accounting: ${appendixRowCount} appendix + ${excludedTableCount} excluded = ${dataRows.length} = CSV data rows`);
console.log(`terciles fftOnly: e1=${groupings.fftOnly.tercileEdges.e1} e2=${groupings.fftOnly.tercileEdges.e2} (4/4/4) · pooled: e1=${groupings.pooled.tercileEdges.e1} e2=${groupings.pooled.tercileEdges.e2} (${groupings.pooled.classes.small.n}/${groupings.pooled.classes.medium.n}/${groupings.pooled.classes.large.n})`);
console.log(`wrote ${OUT_JSON}`);
console.log(`wrote ${OUT_MD}`);
