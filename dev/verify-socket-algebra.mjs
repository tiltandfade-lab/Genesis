#!/usr/bin/env node
/* dev/verify-socket-algebra.mjs — THE SOCKET ALGEBRA GATE
   ══════════════════════════════════════════════════════════════════════════════════════════════
   Authority: docs/CLAYROOM-PROOF-BACKLOG.md § A1 "One socket algebra" (decision-log D1), and
   docs/STRUCTURE-KIT-CATALOG.md §4's owed "one merged registry, one authority ... at C1H
   validator time".  The registry is src/ui/theater-socket-algebra.js; this file is its teeth.

   RED-FIRST.  This harness was written and run BEFORE the migration, against the live
   three-vocabulary state, and it failed — see docs/DESIGN.md's dated PROPOSED entry for the
   captured output.  A ruling is not recorded until its enforcing check exists (teeth law).

   NO BROWSER, NO THREE, NO JSDOM.  The algebra module imports nothing, so this runs in a plain
   `node` process in well under a second and is safe for CI (unlike the 19 puppeteer harnesses CI
   skips).  It reads real production data — the normalized donor indexes, the structure catalog,
   the Meshy runtime citizenship pack — rather than fixtures invented for the test.

   WHAT IT PROVES
     1  registry sanity — every row well-formed, aliases resolve, non-seating kinds seat nothing,
        accepts symmetry where both sides are seating.
     2  ONE MERGED REGISTRY — every socket type name emitted by EVERY live source (procedural kit,
        donor normalizer, the three shipped donor indexes, the structure catalog + its CL-F01
        specimens, the Meshy runtime citizenship pack, the seven frozen figure anchors) is
        registered.  An unregistered name is the eighth-vocabulary failure A1 names.
     3  THE FUNNEL — the three writers construct socket records ONLY through makeSocket(); no raw
        socket object literal reaches userData.sockets anywhere under src/.
     4  READER MIGRATION — no runtime reader still reaches for the flat legacy `.position` /
        `.rotation` keys on a socket record.
     5  GEOMETRY IS UNCHANGED — every Euler triple the procedural kit emits round-trips through
        frame{normal,tangent} and back to the identical Euler (max error reported).  This is the
        proof the migration moved a contract, not a model.
     6  YAW-HOSTILE — a wall mount on all four wall faces plus one non-axis-aligned face resolves
        from normal/tangent with no world-axis assumption.
     7  ILLEGAL PAIRING + CAPACITY — typed rejection reasons for a joist pocket asked to take a
        sconce, for a second thing requesting a one-capacity slot, and for an over-fat shaft.
     8  PROJECTIONS — all seven of A1's representations project into valid canonical records.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const readJson = (rel) => JSON.parse(read(rel));

const errors = [];
const notes = [];
const fail = (msg) => errors.push(msg);

const ALGEBRA_PATH = "src/ui/theater-socket-algebra.js";
let A = null;
try {
  A = await import(new URL(`../${ALGEBRA_PATH}`, import.meta.url).href);
} catch (e) {
  console.error(`SOCKET ALGEBRA: FAIL\n  cannot load ${ALGEBRA_PATH}: ${e.message}`);
  process.exit(1);
}
const {
  SOCKET_TYPES, SOCKET_JOIN_CLASSES, SOCKET_ALGEBRA_VERSION,
  makeSocket, validateSocket, validateSocketRecords, socketCanonicalType,
  socketBasisFromEuler, socketEulerXYZ, canSeat, seatSocket, socketsOfKind,
  socketFromEulerSpec, socketFromDonorExtras, socketFromFigureAnchor,
  socketFromMountSlot, socketFromStructureSpec, socketFromCitizenshipString,
} = A;

/* ── 1 · registry sanity ───────────────────────────────────────────────────────────────────── */
const typeIds = Object.keys(SOCKET_TYPES);
if (typeIds.length < 90) fail(`registry has only ${typeIds.length} types — the live union is 97+ names`);
for (const id of typeIds) {
  const t = SOCKET_TYPES[id];
  if (!t.join || t.join.length < 12) fail(`registry ${id}: no physical-join restatement (A1 opens on "a builder does not attach; he seats")`);
  if (!SOCKET_JOIN_CLASSES[t.joinClass]) fail(`registry ${id}: unknown join class ${t.joinClass}`);
  if (t.aliasOf && !SOCKET_TYPES[t.aliasOf]) fail(`registry ${id}: aliasOf "${t.aliasOf}" is not registered`);
  if (t.aliasOf && socketCanonicalType(id) !== t.aliasOf) fail(`registry ${id}: alias does not resolve`);
  if (!t.seating && t.capacity !== 0) fail(`registry ${id}: non-seating but capacity ${t.capacity}`);
  if (t.seating && t.capacity < 1) fail(`registry ${id}: seating but capacity ${t.capacity}`);
  if (Math.abs(Math.hypot(...t.defaultNormal) - 1) > 1e-6) fail(`registry ${id}: defaultNormal is not unit length`);
  for (const a of t.accepts) if (!SOCKET_TYPES[a]) fail(`registry ${id}: accepts unregistered "${a}"`);
  if (!t.seating && t.accepts.length) fail(`registry ${id}: non-seating but declares accepts`);
  // no invented rows: KS-1's "adopt their conventions, don't invent a schema" made countable.
  if (!t.sources.length) fail(`registry ${id}: cites no live source — an invented type, not an adopted one`);
}
// accepts symmetry: if P accepts C, C's own class must list P's class as something it mates with.
for (const id of typeIds) {
  const p = SOCKET_TYPES[id];
  if (!p.seating) continue;
  for (const a of p.accepts) {
    const c = SOCKET_TYPES[a];
    const cReceives = SOCKET_JOIN_CLASSES[c.joinClass].receives;
    const pReceives = SOCKET_JOIN_CLASSES[p.joinClass].receives;
    if (!pReceives.includes(c.joinClass)) {
      fail(`registry ${id} (${p.joinClass}) accepts ${a} (${c.joinClass}) but its class does not receive that class`);
    }
    void cReceives;
  }
}

/* ── 2 · ONE MERGED REGISTRY — harvest every live emitter ───────────────────────────────────── */
const emitted = new Map(); // typeName -> Set(source)
const emit = (name, source) => { (emitted.get(name) || emitted.set(name, new Set()).get(name)).add(source); };

// rep 1 — the procedural kit's literal socket() call sites
const KIT_PATH = "src/ui/theater-procedural-kit.js";
const kitSrc = read(KIT_PATH);
const kitCalls = [...kitSrc.matchAll(/\bsocket\(group,\s*"([^"]+)"\s*,\s*(\[[^\]]*\])\s*,\s*(\[[^\]]*\])/g)];
for (const m of kitCalls) emit(m[1], "kit");
for (const m of kitSrc.matchAll(/\bsocket\(group,\s*kind === "decal" \? "([^"]+)" : "([^"]+)"/g)) { emit(m[1], "kit"); emit(m[2], "kit"); }
if (kitCalls.length < 90) fail(`only ${kitCalls.length} procedural-kit socket() call sites parsed — the file has ~100; the parser is out of step with the writer`);

// rep 2 — the donor normalizer's stamped names + the three shipped normalized indexes
for (const m of read("build/normalize-donors.py").matchAll(/"type":\s*"([^"]+)"/g)) emit(m[1], "donor-normalizer");
const donorPacks = fs.readdirSync(path.join(root, "assets/models-normalized")).filter((d) => fs.existsSync(path.join(root, "assets/models-normalized", d, "index.json")));
const donorIndexes = {};
for (const pack of donorPacks) {
  const idx = readJson(`assets/models-normalized/${pack}/index.json`);
  donorIndexes[pack] = idx;
  for (const [slug, entry] of Object.entries(idx)) {
    for (const s of (entry.sockets || [])) emit(s.type, `donor-index:${pack}`);
    void slug;
  }
}

// rep 3 — the seven frozen figure anchors
const partsSrc = read("src/ui/theater-parts.js");
// anchored to line start — an identically-worded example inside this file's own header comment
// otherwise wins the match and harvests an empty block.
const anchorBlock = /^torsoBiped\.anchors\s*=\s*\{([\s\S]*?)^\};/m.exec(partsSrc);
if (!anchorBlock) fail("cannot locate torsoBiped.anchors in src/ui/theater-parts.js (rep 3 harvest broken)");
const figureAnchorNames = anchorBlock ? [...anchorBlock[1].matchAll(/(\w+)\s*:\s*anchor\(/g)].map((m) => m[1]) : [];
for (const n of figureAnchorNames) emit(`figure:${n}`, "figure-anchors");
if (figureAnchorNames.length !== 7) fail(`expected the 7 frozen figure anchors, harvested ${figureAnchorNames.length}`);

// rep 4 — room-mesh mountSlots project onto wall-mount
const roomMeshSrc = read("src/ui/theater-room-mesh.js");
if (!/mountSlotsOut\.push\(\{/.test(roomMeshSrc)) fail("src/ui/theater-room-mesh.js no longer emits mountSlots (rep 4 harvest broken)");
emit("wall-mount", "room-mesh-mountSlots");

// rep 5 — the structure catalog's declared families + CL-F01's specimen sockets
const clayEngineSrc = read("src/engine/clay-room.js");
const socketTypesBlock = /socketTypes:\s*Object\.freeze\(\[([\s\S]*?)\]\)/.exec(clayEngineSrc);
if (!socketTypesBlock) fail("cannot locate CLAY_STRUCTURE_KIT_CATALOG.socketTypes (rep 5 harvest broken)");
const structureFamilies = socketTypesBlock ? [...socketTypesBlock[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
for (const t of structureFamilies) emit(t, "structure-catalog");
const structureSpecs = [...clayEngineSrc.matchAll(/\{\s*id:\s*"([^"]+)",\s*type:\s*"([^"]+)",\s*axis:\s*Object\.freeze\(\{\s*x:\s*(-?[\d.]+),\s*z:\s*(-?[\d.]+)\s*\}\)/g)]
  .map((m) => ({ id: m[1], type: m[2], axis: { x: +m[3], z: +m[4] } }));
for (const s of structureSpecs) emit(s.type, "structure-fixture");
if (structureSpecs.length < 6) fail(`only ${structureSpecs.length} CL-F01 specimen sockets parsed (rep 5 harvest broken)`);

// rep 6 — the Meshy runtime citizenship pack
const citizenship = readJson("Reference/Meshy-Premium-Month-1/runtime-citizenship.json");
const citizenshipStrings = [];
(function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (o && typeof o === "object") {
    for (const [k, v] of Object.entries(o)) {
      if (k === "sockets" && Array.isArray(v)) {
        for (const x of v) {
          const t = typeof x === "string" ? x : x && x.type;
          if (t) { citizenshipStrings.push(t); emit(typeof x === "string" ? x.split(".")[0] : t, "meshy-citizenship"); }
        }
      }
      walk(v);
    }
  }
})(citizenship);

// rep 7 — the paper vocabulary: dotted strings in EXTRUDED-SPRITE-PROP-LIBRARY.md §6's registry
// contract. Paper-only today, but A1 counts it among the seven, so the merged registry must cover it.
const propLibSrc = read("docs/EXTRUDED-SPRITE-PROP-LIBRARY.md");
const paperSocketBlocks = [...propLibSrc.matchAll(/"sockets":\s*\[([^\]]*)\]/g)];
const paperStrings = paperSocketBlocks.flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
for (const m of propLibSrc.matchAll(/`([a-z]+\.[a-z]+)`/g)) paperStrings.push(m[1]);
if (!paperStrings.length) fail("no dotted socket strings harvested from docs/EXTRUDED-SPRITE-PROP-LIBRARY.md §6 (rep 7 harvest broken)");
for (const raw of new Set(paperStrings)) {
  let rec = null;
  try { rec = socketFromCitizenshipString(raw, { ownerRef: "prop-library" }); }
  catch (e) { fail(`UNREGISTERED PAPER SOCKET STRING "${raw}" (EXTRUDED-SPRITE-PROP-LIBRARY §6): ${e.message}`); }
  if (rec) emit(rec.type, "prop-library");
}

const unregistered = [...emitted.entries()].filter(([name]) => !SOCKET_TYPES[name]);
for (const [name, sources] of unregistered) {
  fail(`UNREGISTERED SOCKET TYPE "${name}" emitted by ${[...sources].join(", ")} — one merged registry, one authority (STRUCTURE-KIT-CATALOG §4)`);
}
notes.push(`merged registry: ${emitted.size} distinct type names harvested from ${new Set([...emitted.values()].flatMap((s) => [...s])).size} live sources; ${typeIds.length} registered`);

/* ── 3 · THE FUNNEL — the three writers must build records only through makeSocket() ─────────── */
const WRITERS = [
  {
    path: KIT_PATH, src: kitSrc, why: "rep 1 — the procedural kit's socket() helper",
    // the funnel: this file's ONE socket() helper must delegate, which makes all ~100 emissions
    // canonical by construction rather than by 100 hand-edits.
    delegates: [
      { re: /function socket\(group, type, position, rotation, extra\) \{[\s\S]{0,900}?socketFromEulerSpec\(/, what: "socket() must build its record with socketFromEulerSpec()" },
      { re: /child\.rotation\.set\(\.\.\.socketEulerXYZ\(target\)\)/, what: "attachProceduralAtSocket() must seat from socketEulerXYZ()" },
    ],
  },
  {
    path: "src/ui/theater-donor.js", src: read("src/ui/theater-donor.js"), why: "rep 2 — the donor loader's userData.sockets flattening",
    delegates: [
      { re: /sockets\.push\(socketFromDonorExtras\(/, what: "loadDonorPiece() must project stamped extras with socketFromDonorExtras()" },
      { re: /return socketsOfKind\(socketsOf\(group\), type\)/, what: "socketsByType() must resolve registry aliases with socketsOfKind()" },
    ],
  },
  {
    path: "src/ui/theater-boot.js", src: read("src/ui/theater-boot.js"), why: "the production reader of both",
    delegates: [
      { re: /socketPosition\(fm\)/, what: "the donor floor-mount reader must use socketPosition()" },
      { re: /socketPosition\(hingeSockets\[0\]\)/, what: "the kit-door hinge reader must use socketPosition()" },
    ],
  },
];
for (const w of WRITERS) {
  const importsAlgebra = /from\s+"\.\/theater-socket-algebra\.js"/.test(w.src);
  if (!importsAlgebra) fail(`${w.path} (${w.why}) does not import theater-socket-algebra.js — it still owns a private socket vocabulary`);
  for (const d of w.delegates) if (!d.re.test(w.src)) fail(`${w.path}: ${d.what}`);
}
// no raw literal socket construction anywhere under src/ (the "normalization at the contract
// boundary, not in handlers" discipline, applied to sockets)
const srcFiles = [];
(function collect(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) collect(p);
    else if (e.name.endsWith(".js")) srcFiles.push(p);
  }
})(path.join(root, "src"));
const RAW_LITERAL = /sockets(?:Out)?\.push\(\s*(?:Object\.assign\(\s*)?\{/g;
for (const f of srcFiles) {
  const rel = path.relative(root, f);
  if (rel === ALGEBRA_PATH) continue;
  const s = fs.readFileSync(f, "utf8");
  for (const m of s.matchAll(RAW_LITERAL)) {
    const line = s.slice(0, m.index).split("\n").length;
    fail(`${rel}:${line} pushes a RAW socket object literal — every socket record must be born in makeSocket()`);
  }
}

/* ── 4 · READER MIGRATION — no runtime reader still uses the flat legacy keys ────────────────── */
const LEGACY_READS = [
  { re: /socketsByType\([^)]*\)\s*\[\s*\d+\s*\]\s*\.position\b/g, what: "socket.position (flat) — canonical is socket.frame.position" },
  { re: /\bhingeSockets\[0\]\.position\b/g, what: "hingeSockets[0].position — canonical is .frame.position" },
  { re: /\bfm\s*\?\s*fm\.position\b/g, what: "fm.position — canonical is fm.frame.position" },
  { re: /target\.position\)\s*;?\s*\n[\s\S]{0,80}?child\.rotation\.set\(\.\.\.target\.rotation\)/g, what: "target.position/target.rotation — canonical is frame + socketEulerXYZ()" },
  { re: /cargo\.position\.fromArray\(target\.position\)/g, what: "target.position (flat) — canonical is target.frame.position" },
];
for (const w of WRITERS) {
  for (const probe of LEGACY_READS) {
    probe.re.lastIndex = 0;
    for (const m of w.src.matchAll(probe.re)) {
      const line = w.src.slice(0, m.index).split("\n").length;
      fail(`${w.path}:${line} still reads ${probe.what}`);
    }
  }
}

/* ── 5 · GEOMETRY UNCHANGED — every kit Euler round-trips exactly ────────────────────────────── */
let maxEulerErr = 0;
let roundTripped = 0;
for (const m of kitCalls) {
  const euler = JSON.parse(m[3].replace(/Math\.PI/g, String(Math.PI)).replace(/([\d.]+)\s*\/\s*([\d.]+)/g, (_, a, b) => String(+a / +b)));
  if (!Array.isArray(euler) || euler.length !== 3 || euler.some((v) => typeof v !== "number")) continue;
  const rec = socketFromEulerSpec(m[1], [0, 0, 0], euler, null, { ownerRef: "roundtrip" });
  const back = socketEulerXYZ(rec);
  for (let i = 0; i < 3; i++) maxEulerErr = Math.max(maxEulerErr, Math.abs(back[i] - euler[i]));
  roundTripped++;
}
if (roundTripped < 90) fail(`only ${roundTripped} kit Euler triples round-tripped — expected ~100`);
if (maxEulerErr > 1e-9) fail(`Euler round-trip error ${maxEulerErr.toExponential(3)} exceeds 1e-9 — the migration would MOVE GEOMETRY`);
notes.push(`geometry unchanged: ${roundTripped}/${kitCalls.length} kit Euler triples round-trip, max error ${maxEulerErr.toExponential(3)}`);

/* ── 6 · YAW-HOSTILE — four wall faces plus one non-axis-aligned face ────────────────────────── */
const yawCases = [
  { label: "north face", normal: [0, 0, -1] },
  { label: "east face", normal: [1, 0, 0] },
  { label: "south face", normal: [0, 0, 1] },
  { label: "west face", normal: [-1, 0, 0] },
  { label: "37° face", normal: [Math.sin(0.6458), 0, -Math.cos(0.6458)] },
];
for (const c of yawCases) {
  const s = socketFromMountSlot({ slotId: `yaw-${c.label}`, ownerSegIndex: 1, u: 0.5, worldPos: [1, 1.4, 2], normal: c.normal, tangent: [0, 1, 0] });
  const errs = validateSocket(s, `yaw ${c.label}`);
  if (errs.length) fail(...errs);
  const b = A.socketBasis(s);
  const rightLen = Math.hypot(...b.right);
  if (Math.abs(rightLen - 1) > 1e-6) fail(`yaw ${c.label}: derived right axis is not unit (${rightLen})`);
  // a sconce hung on this mount must face back along the wall normal at ANY yaw
  const dotN = b.normal[0] * c.normal[0] + b.normal[1] * c.normal[1] + b.normal[2] * c.normal[2];
  if (Math.abs(dotN - 1) > 1e-6) fail(`yaw ${c.label}: frame.normal drifted from the measured wall normal`);
}

/* ── 7 · ILLEGAL PAIRING + CAPACITY + ENVELOPE — typed rejection ─────────────────────────────── */
const pocket = makeSocket({ type: "bearing", position: [0, 0, 0], envelope: { radius: 0.06 }, source: "test" });
const sconce = makeSocket({ type: "wall", position: [0, 0, 0], source: "test" });
const badPair = canSeat(pocket, sconce);
if (badPair.ok) fail("a joist pocket accepted a sconce bracket — the illegal-pairing check does not bite");
if (badPair.reason !== "socket-type-mismatch") fail(`illegal pairing gave reason "${badPair.reason}", expected socket-type-mismatch`);

const slot = makeSocket({ type: "wall-mount", position: [0, 1.4, 0], source: "test" });
const footA = makeSocket({ type: "mount", position: [0, 0, 0], source: "test" });
const footB = makeSocket({ type: "mount", position: [0, 0, 0], source: "test" });
if (!seatSocket(slot, footA, "sconce-a").ok) fail("a legal wall mount was rejected");
const second = seatSocket(slot, footB, "sconce-b");
if (second.ok) fail("a one-capacity wall slot took a second occupant — rep 4's one-slot limit is still silent");
if (second.reason !== "capacity-exceeded") fail(`capacity rejection gave reason "${second.reason}"`);

const bore = makeSocket({ type: "axle", position: [0, 0, 0], envelope: { radius: 0.05 }, source: "test" });
const fatShaft = makeSocket({ type: "shaft", position: [0, 0, 0], envelope: { radius: 0.09 }, source: "test" });
const fat = canSeat(bore, fatShaft);
if (fat.ok) fail("an over-fat shaft entered a smaller bore — the envelope check does not bite");
if (fat.reason !== "envelope-exceeded") fail(`envelope rejection gave reason "${fat.reason}"`);

const originSeat = canSeat(makeSocket({ type: "flame-origin", position: [0, 0, 0], source: "test" }), footA);
if (originSeat.ok || originSeat.reason !== "non-seating-socket") fail("an emission origin was treated as a receiver");

// alias resolution: a Meshy join-west end must mate with a Kenney butt-join-e end
const west = makeSocket({ type: "join-west", position: [0, 0, 0], source: "test" });
const east = makeSocket({ type: "butt-join-e", position: [0, 0, 0], source: "test" });
if (!canSeat(east, west).ok) fail("butt-join-e refused an aliased join-west — the alias law does not resolve at seat time");
if (socketsOfKind([west], "butt-join-w").length !== 1) fail("socketsOfKind does not resolve aliases");

/* ── 8 · PROJECTIONS — all seven representations become valid canonical records ──────────────── */
const projected = [];
// rep 1
for (const m of kitCalls.slice(0, 40)) {
  const euler = JSON.parse(m[3].replace(/Math\.PI/g, String(Math.PI)).replace(/([\d.]+)\s*\/\s*([\d.]+)/g, (_, a, b) => String(+a / +b)));
  projected.push(socketFromEulerSpec(m[1], [0, 0, 0], euler, null, { ownerRef: "proj" }));
}
// rep 2 — every socket of every shipped donor piece
let donorSocketCount = 0;
for (const [pack, idx] of Object.entries(donorIndexes)) {
  for (const [slug, entry] of Object.entries(idx)) {
    const recs = (entry.sockets || []).map((s, i) => socketFromDonorExtras(s, { ownerRef: `donor:${pack}/${slug}`, ordinal: i }));
    donorSocketCount += recs.length;
    const errs = validateSocketRecords(recs, `donor ${pack}/${slug}`);
    if (errs.length) fail(...errs.slice(0, 4));
  }
}
if (donorSocketCount < 200) fail(`only ${donorSocketCount} donor sockets projected — the shipped packs carry more`);
// rep 3
for (const n of figureAnchorNames) projected.push(socketFromFigureAnchor(n, { pos: { x: 0.3, y: 0.58, z: 0.02 }, ry: 0.15 }, { ownerRef: "figure:torsoBiped" }));
// rep 4
projected.push(socketFromMountSlot({ slotId: "wall-slot-3-mid", ownerSegIndex: 3, u: 0.5, worldPos: [2, 1.4, 0], normal: [0, 0, 1], tangent: [0, 1, 0] }));
// rep 5
for (const s of structureSpecs) projected.push(socketFromStructureSpec(s, { ownerRef: "structure:cl-f01" }));
// rep 6 + 7 (bare and dotted strings)
for (const t of [...new Set(citizenshipStrings)]) projected.push(socketFromCitizenshipString(t, { ownerRef: "meshy:pack" }));
for (const t of ["interaction.front", "loot.origin", "wall-mount.left"]) projected.push(socketFromCitizenshipString(t, { ownerRef: "extruded-sprite-prop-library" }));
{
  const errs = validateSocketRecords(projected.map((r, i) => Object.assign({}, r, { id: `${r.id}@${i}` })), "projection");
  if (errs.length) fail(...errs.slice(0, 8));
}
notes.push(`projections: ${projected.length} records across reps 1/3/4/5/6/7 + ${donorSocketCount} shipped donor sockets (rep 2), all schema-valid`);

/* ── report ─────────────────────────────────────────────────────────────────────────────────── */
const unique = [...new Set(errors)];
console.log(`socket algebra v${SOCKET_ALGEBRA_VERSION} · ${typeIds.length} registered types · ${Object.keys(SOCKET_JOIN_CLASSES).length} join classes`);
for (const n of notes) console.log(`  · ${n}`);
if (unique.length) {
  console.error(`\nSOCKET ALGEBRA: FAIL — ${unique.length} problem(s)`);
  for (const e of unique) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log("SOCKET ALGEBRA: OK");
