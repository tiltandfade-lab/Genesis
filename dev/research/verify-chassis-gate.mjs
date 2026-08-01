#!/usr/bin/env node
/* verify-chassis-gate.mjs — mechanical gate for ChassisV0 declarative building chassis.
   R4 Codex chassis throughput probe (docs/research/CODEX-CHASSIS-THROUGHPUT-PROBE.md, Setup
   item 3). Contract: dev/research/chassis-schema.md. No dependencies, no renderer, no model
   call — a plain node process, per the SPEED doctrine and the socket-algebra harness precedent.

   Usage:
     node dev/research/verify-chassis-gate.mjs dev/research/chassis/exemplar-watchhouse.json
     node dev/research/verify-chassis-gate.mjs --suite

   --suite is the red-first proof (the Teeth Law): the clean exemplar must PASS every gate,
   and every sabotaged fixture in dev/research/chassis/negative/ must FAIL the specific gate
   its "_expect" field names. Exit 0 iff every expectation holds. */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const HARNESS_DIR = dirname(fileURLToPath(import.meta.url));
const EXEMPLAR_PATH = join(HARNESS_DIR, "chassis", "exemplar-watchhouse.json");
const NEGATIVE_DIR = join(HARNESS_DIR, "chassis", "negative");

const FACES = ["n", "e", "s", "w"];
const CHECK_ORDER = [
  "shape", "parameter-legality", "closed-wall-loops", "roof-coverage",
  "opening-placement", "program-obligations", "stair-reach", "support", "parameter-sweep"
];
const SUPPORT_MODES = ["grounded-solid", "bearing-on-lower-structure"];
const THRESHOLD_KINDS = ["door", "gate"];

/* ── small helpers ─────────────────────────────────────────────────────────────────────────── */

function isObj(v){ return v !== null && typeof v === "object" && !Array.isArray(v); }
function dataKeys(obj){ return Object.keys(obj).filter(k => !k.startsWith("_")); }

/* Walk the whole document collecting every parameter name referenced by a resolvable. */
function collectParamRefs(node, out){
  if(Array.isArray(node)){ node.forEach(child => collectParamRefs(child, out)); return; }
  if(!isObj(node)) return;
  if(typeof node.param === "string") out.add(node.param);
  if(typeof node.selectByParam === "string") out.add(node.selectByParam);
  for(const key of dataKeys(node)) collectParamRefs(node[key], out);
}

/* Resolve a resolvable (schema: number | {param} | {selectByParam, options} | {sum:[…]}).
   `allowString` admits string options (labels only). Errors are plain sentences. */
function resolveValue(value, params, where, errors, allowString){
  if(typeof value === "number" && Number.isFinite(value)) return value;
  if(allowString && typeof value === "string") return value;
  if(isObj(value)){
    if(typeof value.param === "string"){
      const v = params[value.param];
      if(typeof v !== "number"){ errors.push(`${where}: references parameter "${value.param}" which has no value`); return NaN; }
      return v;
    }
    if(typeof value.selectByParam === "string"){
      const idx = params[value.selectByParam];
      if(typeof idx !== "number" || !Number.isInteger(idx)){ errors.push(`${where}: selectByParam "${value.selectByParam}" has no integer value`); return NaN; }
      if(!Array.isArray(value.options) || idx < 0 || idx >= value.options.length){
        errors.push(`${where}: selectByParam "${value.selectByParam}" = ${idx} falls outside its ${Array.isArray(value.options) ? value.options.length : 0} options`);
        return NaN;
      }
      const chosen = value.options[idx];
      if(typeof chosen === "number") return chosen;
      if(allowString && typeof chosen === "string") return chosen;
      errors.push(`${where}: option ${idx} is not a number`); return NaN;
    }
    if(Array.isArray(value.sum)){
      let total = 0;
      for(let i = 0; i < value.sum.length; i++){
        const part = resolveValue(value.sum[i], params, `${where}.sum[${i}]`, errors, false);
        if(typeof part !== "number" || Number.isNaN(part)) return NaN;
        total += part;
      }
      return total;
    }
  }
  errors.push(`${where}: not a resolvable value (number, {param}, {selectByParam, options}, or {sum})`);
  return NaN;
}

function defaultParams(chassis){
  const params = {};
  for(const p of chassis.parameters || []) params[p.name] = p.default;
  return params;
}

function faceLength(face, w, d){ return (face === "n" || face === "s") ? w : d; }

function comboLabel(params){
  return "{" + Object.keys(params).map(k => `${k}: ${params[k]}`).join(", ") + "}";
}

/* ── instantiation ─────────────────────────────────────────────────────────────────────────── */

/* Resolve one concrete building from (chassis, parameter values). Geometry stays at cell
   resolution; world-unit fields are carried through informationally. */
function instantiate(chassis, params){
  const errors = [];
  const w = resolveValue(chassis.footprint.w, params, "footprint.w", errors);
  const d = resolveValue(chassis.footprint.d, params, "footprint.d", errors);
  if(!errors.length){
    if(!Number.isInteger(w) || w < 1) errors.push(`footprint.w resolved to ${w}, not a positive integer cell count`);
    if(!Number.isInteger(d) || d < 1) errors.push(`footprint.d resolved to ${d}, not a positive integer cell count`);
  }
  if(errors.length) return { errors };
  const wr = chassis.footprint.wRange, dr = chassis.footprint.dRange;
  if(wr && (w < wr.min || w > wr.max)) errors.push(`footprint.w = ${w} escapes the declared envelope ${wr.min}..${wr.max}`);
  if(dr && (d < dr.min || d > dr.max)) errors.push(`footprint.d = ${d} escapes the declared envelope ${dr.min}..${dr.max}`);

  const storeys = (chassis.storeys || []).map((s, i) => ({
    id: s.id, role: s.role, enclosure: s.enclosure, order: i,
    programRole: s.programRole || null
  }));

  const walls = [];
  for(const run of chassis.wallRuns || []){
    const len = faceLength(run.face, w, d);
    let from = 0, to = len - 1;
    if(run.span !== "full" && isObj(run.span)){
      from = resolveValue(run.span.from, params, `wall run "${run.id}" span.from`, errors);
      to = resolveValue(run.span.to, params, `wall run "${run.id}" span.to`, errors);
    } else if(run.span !== "full"){
      errors.push(`wall run "${run.id}": span must be "full" or {from, to}`);
      continue;
    }
    const openings = (run.openings || []).map(op => ({
      id: op.id, kind: op.kind, access: op.access || "none",
      observation: !!op.observation, clearance: op.clearance || null,
      station: resolveValue(op.station, params, `opening "${op.id}" station`, errors),
      widthCells: resolveValue(op.widthCells, params, `opening "${op.id}" widthCells`, errors),
      face: run.face, storey: run.storey, wallRunId: run.id
    }));
    walls.push({ id: run.id, storey: run.storey, face: run.face, from, to, len,
      class: run.class, supportedBy: (run.supportedBy || []).slice(), openings });
  }

  const declaredOpen = (chassis.declaredOpen || []).map(row => {
    const len = faceLength(row.face, w, d);
    let from = 0, to = len - 1;
    if(row.span !== "full" && isObj(row.span)){
      from = resolveValue(row.span.from, params, `declaredOpen on ${row.storey} face "${row.face}" from`, errors);
      to = resolveValue(row.span.to, params, `declaredOpen on ${row.storey} face "${row.face}" to`, errors);
    }
    return { storey: row.storey, face: row.face, from, to, len, reason: row.reason || "" };
  });

  /* Roof cells. "top-enclosed-storey" = the full plan of the topmost enclosed storey. */
  const topEnclosed = [...storeys].reverse().find(s => s.enclosure === "enclosed") || null;
  const roofCells = new Set();
  if(chassis.roof){
    if(chassis.roof.covers === "top-enclosed-storey"){
      for(let y = 0; y < d; y++) for(let x = 0; x < w; x++) roofCells.add(`${x},${y}`);
    } else if(Array.isArray(chassis.roof.covers)){
      chassis.roof.covers.forEach((rect, i) => {
        const rx = resolveValue(rect.x, params, `roof.covers[${i}].x`, errors);
        const ry = resolveValue(rect.y, params, `roof.covers[${i}].y`, errors);
        const rw = resolveValue(rect.w, params, `roof.covers[${i}].w`, errors);
        const rd = resolveValue(rect.d, params, `roof.covers[${i}].d`, errors);
        for(let y = ry; y < ry + rd; y++) for(let x = rx; x < rx + rw; x++) roofCells.add(`${x},${y}`);
      });
    } else {
      errors.push(`roof.covers must be "top-enclosed-storey" or an array of rects`);
    }
  }

  let attachment = null;
  if(chassis.deckAttachment){
    const a = chassis.deckAttachment;
    attachment = {
      id: a.id, kind: a.kind, face: a.face,
      alongOffset: resolveValue(a.alongOffset, params, "deckAttachment.alongOffset", errors),
      w: resolveValue(a.w, params, "deckAttachment.w", errors),
      d: resolveValue(a.d, params, "deckAttachment.d", errors),
      lapRows: resolveValue(a.lapRows == null ? 0 : a.lapRows, params, "deckAttachment.lapRows", errors),
      bearingH: a.bearingH == null ? null : resolveValue(a.bearingH, params, "deckAttachment.bearingH", errors),
      label: a.label == null ? null : resolveValue(a.label, params, "deckAttachment.label", errors, true),
      bearing: (a.bearing || []).slice(),
      externalAccess: !!a.externalAccess,
      programRole: a.programRole || null
    };
  }

  if(chassis.sitePlacement){
    resolveValue(chassis.sitePlacement.anchorX, params, "sitePlacement.anchorX", errors);
    resolveValue(chassis.sitePlacement.anchorY, params, "sitePlacement.anchorY", errors);
  }

  return { errors, w, d, storeys, walls, declaredOpen, roofCells, topEnclosed,
    attachment, stairs: (chassis.stairs || []), accessRecords: (chassis.accessRecords || []),
    params };
}

/* ── gate 1: shape ─────────────────────────────────────────────────────────────────────────── */

function checkShape(chassis){
  const out = [];
  if(chassis.chassisVersion !== "ChassisV0") out.push(`chassisVersion must be "ChassisV0" (found ${JSON.stringify(chassis.chassisVersion)})`);
  for(const field of ["id", "family", "parameters", "footprint", "storeys", "wallRuns", "roof", "foundation", "supportClasses", "obligations", "declares"]){
    if(chassis[field] == null) out.push(`required field "${field}" is missing`);
  }
  if(out.length) return out;

  const paramNames = new Set();
  for(const p of chassis.parameters){
    if(typeof p.name !== "string" || !p.name) out.push("a parameter has no name");
    else if(paramNames.has(p.name)) out.push(`parameter "${p.name}" is declared twice`);
    else paramNames.add(p.name);
  }
  const storeyIds = new Set();
  for(const s of chassis.storeys){
    if(!s.id) out.push("a storey has no id");
    else if(storeyIds.has(s.id)) out.push(`storey "${s.id}" is declared twice`);
    else storeyIds.add(s.id);
    if(s.enclosure !== "enclosed" && s.enclosure !== "open-deck"){
      out.push(`storey "${s.id}": enclosure must be "enclosed" or "open-deck" (found ${JSON.stringify(s.enclosure)})`);
    }
  }
  if(!chassis.storeys.length) out.push("storeys is empty — a chassis needs at least one storey");

  const seenOpenings = new Set();
  for(const run of chassis.wallRuns){
    if(!run.id) out.push("a wall run has no id");
    if(!storeyIds.has(run.storey)) out.push(`wall run "${run.id}": unknown storey "${run.storey}"`);
    if(!FACES.includes(run.face)) out.push(`wall run "${run.id}": face must be one of n/e/s/w (found ${JSON.stringify(run.face)})`);
    if(typeof run.class !== "string" || chassis.supportClasses[run.class] == null){
      out.push(`wall run "${run.id}": class "${run.class}" is not declared in supportClasses`);
    }
    for(const op of run.openings || []){
      if(!op.id) out.push(`an opening on wall run "${run.id}" has no id`);
      else if(seenOpenings.has(op.id)) out.push(`opening "${op.id}" is declared twice`);
      else seenOpenings.add(op.id);
    }
  }
  for(const row of chassis.declaredOpen || []){
    if(!storeyIds.has(row.storey)) out.push(`declaredOpen: unknown storey "${row.storey}"`);
    if(!FACES.includes(row.face)) out.push(`declaredOpen: face must be one of n/e/s/w (found ${JSON.stringify(row.face)})`);
    const storey = chassis.storeys.find(s => s.id === row.storey);
    if(storey && storey.enclosure === "enclosed"){
      out.push(`declaredOpen on storey "${row.storey}": an enclosed storey may not declare open perimeter`);
    }
  }
  if(chassis.deckAttachment && !FACES.includes(chassis.deckAttachment.face)){
    out.push(`deckAttachment: face must be one of n/e/s/w (found ${JSON.stringify(chassis.deckAttachment.face)})`);
  }
  for(const stair of chassis.stairs || []){
    if(!stair.id) out.push("a stair has no id");
    if(stair.from !== "ground" && !storeyIds.has(stair.from)) out.push(`stair "${stair.id}": from must be "ground" or a storey id (found ${JSON.stringify(stair.from)})`);
    if(!storeyIds.has(stair.to)) out.push(`stair "${stair.id}": to must be a storey id (found ${JSON.stringify(stair.to)})`);
  }
  for(const rec of chassis.accessRecords || []){
    if(!rec.id) out.push("an access record has no id");
    if(typeof rec.via !== "string" || !rec.via) out.push(`access record "${rec.id}": via must name an element`);
  }

  const refs = new Set();
  collectParamRefs(chassis, refs);
  for(const name of refs){
    if(!paramNames.has(name)) out.push(`a resolvable references parameter "${name}", which is not declared`);
  }
  return out;
}

/* ── gate 2: parameter-legality ────────────────────────────────────────────────────────────── */

function checkParameterLegality(chassis){
  const out = [];
  const refs = new Set();
  collectParamRefs(chassis, refs);
  for(const p of chassis.parameters || []){
    const who = `parameter "${p.name}"`;
    if(typeof p.min !== "number" || typeof p.max !== "number") { out.push(`${who}: min and max must be numbers`); continue; }
    if(p.min > p.max) out.push(`${who}: min ${p.min} is greater than max ${p.max}`);
    if(typeof p.default !== "number") out.push(`${who}: default is missing`);
    else if(p.default < p.min || p.default > p.max){
      out.push(`${who}: default ${p.default} sits outside its own declared range ${p.min}..${p.max}`);
    }
    if(p.integer && [p.min, p.max, p.default].some(v => typeof v === "number" && !Number.isInteger(v))){
      out.push(`${who}: declared integer but min/default/max are not all integers`);
    }
    if(!Array.isArray(p.affects) || !p.affects.length) out.push(`${who}: affects[] must name at least one field`);
    if(!refs.has(p.name)) out.push(`${who}: declared but never referenced by any resolvable — unused parameters are dishonest variety`);
  }
  /* Every selectByParam must be driven by an integer parameter starting at 0 whose whole
     range the options list covers — otherwise part of the declared range is illegal. */
  (function walk(node, where){
    if(Array.isArray(node)){ node.forEach((c, i) => walk(c, `${where}[${i}]`)); return; }
    if(!isObj(node)) return;
    if(typeof node.selectByParam === "string"){
      const p = (chassis.parameters || []).find(x => x.name === node.selectByParam);
      if(p){
        if(!p.integer || p.min !== 0) out.push(`selectByParam "${p.name}" at ${where}: selector parameters must be integers with min 0`);
        else if(!Array.isArray(node.options) || node.options.length < p.max + 1){
          out.push(`selectByParam "${p.name}" at ${where}: ${Array.isArray(node.options) ? node.options.length : 0} options do not cover the parameter range 0..${p.max}`);
        }
      }
    }
    for(const key of dataKeys(node)) walk(node[key], where === "" ? key : `${where}.${key}`);
  })(chassis, "");
  return out;
}

/* ── gate 3: closed-wall-loops ─────────────────────────────────────────────────────────────── */

function checkClosedWallLoops(chassis, inst){
  const out = [];
  for(const storey of inst.storeys){
    for(const face of FACES){
      const len = faceLength(face, inst.w, inst.d);
      const wallCover = new Array(len).fill(0);
      const wallNames = new Array(len).fill(null);
      const openCover = new Array(len).fill(0);
      for(const run of inst.walls.filter(r => r.storey === storey.id && r.face === face)){
        if(run.from < 0 || run.to > len - 1 || run.from > run.to){
          out.push(`wall run "${run.id}" (storey ${storey.id}, face "${face}"): span ${run.from}..${run.to} does not fit the face's ${len} edge slots`);
          continue;
        }
        for(let i = run.from; i <= run.to; i++){ wallCover[i]++; wallNames[i] = run.id; }
      }
      for(const row of inst.declaredOpen.filter(r => r.storey === storey.id && r.face === face)){
        for(let i = Math.max(0, row.from); i <= Math.min(len - 1, row.to); i++) openCover[i]++;
      }
      for(let i = 0; i < len; i++){
        if(wallCover[i] > 1) out.push(`storey ${storey.id}, face "${face}", edge slot ${i}: covered by ${wallCover[i]} overlapping wall runs — the loop double-builds here`);
        if(storey.enclosure === "enclosed"){
          if(openCover[i]) out.push(`storey ${storey.id}, face "${face}", edge slot ${i}: declared open on an enclosed storey`);
          if(wallCover[i] === 0) out.push(`storey ${storey.id}, face "${face}", edge slot ${i}: no wall run covers this perimeter edge — the wall loop is open`);
        } else {
          if(wallCover[i] && openCover[i]) out.push(`storey ${storey.id}, face "${face}", edge slot ${i}: both a parapet and a declared-open span claim this edge`);
          if(!wallCover[i] && !openCover[i]) out.push(`storey ${storey.id}, face "${face}", edge slot ${i}: neither parapet nor declared-open — an undeclared gap in the deck perimeter`);
        }
      }
    }
  }
  return out;
}

/* ── gate 4: roof-coverage ─────────────────────────────────────────────────────────────────── */

function checkRoofCoverage(chassis, inst){
  const out = [];
  if(!inst.topEnclosed){ out.push("no enclosed storey exists for the roof to cover"); return out; }
  for(let y = 0; y < inst.d; y++){
    for(let x = 0; x < inst.w; x++){
      if(!inst.roofCells.has(`${x},${y}`)){
        out.push(`cell (${x},${y}) of top enclosed storey ${inst.topEnclosed.id} has no roof above it (roof family ${chassis.roof.familyId})`);
      }
    }
  }
  return out;
}

/* ── gate 5: opening-placement ─────────────────────────────────────────────────────────────── */

function checkOpeningPlacement(chassis, inst){
  const out = [];
  const apronFaces = (chassis.foundation && chassis.foundation.apronFaces) || [];
  for(const run of inst.walls){
    for(const op of run.openings){
      const len = faceLength(op.face, inst.w, inst.d);
      const who = `opening "${op.id}" (${op.kind}, storey ${op.storey}, face "${op.face}")`;
      if(!Number.isInteger(op.station) || !Number.isInteger(op.widthCells) || op.widthCells < 1){
        out.push(`${who}: station/widthCells must resolve to integers with width >= 1`);
        continue;
      }
      if(op.station < 0 || op.station + op.widthCells > len){
        out.push(`${who}: occupies slots ${op.station}..${op.station + op.widthCells - 1} but the face has only ${len}`);
      }
      if(op.station < run.from || op.station + op.widthCells - 1 > run.to){
        out.push(`${who}: falls outside its own wall run "${run.id}" (span ${run.from}..${run.to})`);
      }
      if(op.clearance && !(op.clearance.widthUnits > 0 && op.clearance.heightUnits > 0)){
        out.push(`${who}: clearance must have positive widthUnits and heightUnits`);
      }
      if(op.access === "walk"){
        const stairServes = inst.stairs.some(st => st.face === op.face);
        const attachServes = inst.attachment && inst.attachment.face === op.face;
        if(!apronFaces.includes(op.face) && !stairServes && !attachServes){
          out.push(`${who}: walk access but no walkable approach outside — no foundation apron, stair landing, or attachment on face "${op.face}"`);
        }
      }
    }
  }
  return out;
}

/* ── gate 6: program-obligations ───────────────────────────────────────────────────────────── */

function obligationBoundsOk(bound, value){
  if(typeof bound.exactly === "number") return value === bound.exactly;
  if(typeof bound.min === "number" && value < bound.min) return false;
  if(typeof bound.max === "number" && value > bound.max) return false;
  return true;
}

function checkProgramObligations(chassis, inst){
  const out = [];
  const declares = chassis.declares || {};
  for(const key of dataKeys(chassis.obligations)){
    const declared = declares[key];
    if(typeof declared !== "number"){ out.push(`declares.${key} is missing — every family obligation needs a declared count`); continue; }
    if(!obligationBoundsOk(chassis.obligations[key], declared)){
      out.push(`declares.${key} = ${declared} violates the family obligation ${JSON.stringify(chassis.obligations[key])}`);
    }
  }

  const thresholds = [];
  for(const run of inst.walls) for(const op of run.openings){
    if(THRESHOLD_KINDS.includes(op.kind) && op.access === "walk") thresholds.push(op.id);
  }
  const lookouts = [];
  if(inst.attachment && inst.attachment.programRole === "lookout") lookouts.push(inst.attachment.id);
  for(const s of inst.storeys) if(s.programRole === "lookout") lookouts.push(s.id);

  const elementIds = new Set();
  inst.stairs.forEach(st => elementIds.add(st.id));
  if(inst.attachment) elementIds.add(inst.attachment.id);
  for(const run of inst.walls){ elementIds.add(run.id); run.openings.forEach(op => elementIds.add(op.id)); }
  const retreats = [];
  for(const rec of inst.accessRecords){
    if(rec.programRole !== "retreat") continue;
    if(!elementIds.has(rec.via)){ out.push(`retreat route "${rec.id}": via "${rec.via}" names no existing element`); continue; }
    retreats.push(rec.id);
  }

  const counted = { operatingThreshold: thresholds, lookout: lookouts, retreat: retreats };
  for(const key of Object.keys(counted)){
    if(typeof declares[key] !== "number") continue; /* already reported above */
    if(counted[key].length !== declares[key]){
      out.push(`${key}: chassis declares ${declares[key]} but the instantiation has ${counted[key].length}` +
        (counted[key].length ? ` (${counted[key].join(", ")})` : "") +
        ` — declared program obligations must be met exactly`);
    }
  }
  return out;
}

/* ── gate 7: stair-reach ───────────────────────────────────────────────────────────────────── */

function checkStairReach(chassis, inst){
  const out = [];
  const apronFaces = (chassis.foundation && chassis.foundation.apronFaces) || [];
  const adj = new Map([["ground", new Set()]]);
  inst.storeys.forEach(s => adj.set(s.id, new Set()));
  const link = (a, b) => { adj.get(a).add(b); adj.get(b).add(a); };

  for(const run of inst.walls) for(const op of run.openings){
    if(op.access === "walk" && THRESHOLD_KINDS.includes(op.kind) && apronFaces.includes(op.face)){
      link("ground", op.storey);
    }
  }
  for(const st of inst.stairs){
    if(adj.has(st.from) && adj.has(st.to)) link(st.from, st.to);
  }
  /* Deck attachments are external-dependent (site terrain), so they do NOT satisfy this
     gate: the chassis must reach every storey through its own thresholds and stairs. */

  const seen = new Set(["ground"]);
  const queue = ["ground"];
  while(queue.length){
    const node = queue.shift();
    for(const next of adj.get(node)) if(!seen.has(next)){ seen.add(next); queue.push(next); }
  }
  for(const s of inst.storeys){
    if(!seen.has(s.id)){
      out.push(`storey ${s.id} is not reachable from the ground — no stair or walk threshold serves it (deck attachments are site-dependent and do not count)`);
    }
  }
  return out;
}

/* ── gate 8: support ───────────────────────────────────────────────────────────────────────── */

function checkSupport(chassis, inst){
  const out = [];
  const storeyIds = new Set(inst.storeys.map(s => s.id));
  const terrain = new Set((chassis.foundation && chassis.foundation.terrainBearings) || []);
  function supportResolves(name){
    if(name === "ground" || name === "foundation" || name === "foundation-apron" || name === "roof-deck") return true;
    if(storeyIds.has(name)) return true;
    if(terrain.has(name)) return true;
    const m = name.match(/^(.+)-walls$/);
    if(m && storeyIds.has(m[1])) return true;
    return false;
  }
  for(const run of inst.walls){
    if(!run.supportedBy.length) out.push(`wall run "${run.id}" declares no support`);
    run.supportedBy.forEach(name => { if(!supportResolves(name)) out.push(`wall run "${run.id}": support "${name}" names nothing in this chassis`); });
  }
  const roof = chassis.roof;
  if(roof){
    (roof.supportedBy || []).forEach(name => { if(!supportResolves(name)) out.push(`roof: support "${name}" names nothing in this chassis`); });
    if(!(roof.supportedBy || []).length) out.push("roof declares no support");
    const cls = chassis.supportClasses[roof.class || "timber-deck"];
    if(!cls) out.push(`roof: class "${roof.class}" is not declared in supportClasses`);
    else if(inst.topEnclosed){
      /* structure-on-structure overhang: roof cells beyond the storey plan it bears on */
      let overhang = 0;
      for(const key of inst.roofCells){
        const [x, y] = key.split(",").map(Number);
        if(x < 0 || y < 0 || x >= inst.w || y >= inst.d) overhang++;
      }
      if(overhang > cls.maxOverhangCells){
        out.push(`roof: ${overhang} cells overhang the supporting storey, more than class allows (${cls.maxOverhangCells})`);
      }
    }
  }
  for(const st of inst.stairs){
    if(!SUPPORT_MODES.includes(st.supportMode)) out.push(`stair "${st.id}": supportMode "${st.supportMode}" is not one of ${SUPPORT_MODES.join(" | ")}`);
    if(!chassis.supportClasses[st.class]) out.push(`stair "${st.id}": class "${st.class}" is not declared in supportClasses`);
    (st.supportedBy || []).forEach(name => { if(!supportResolves(name)) out.push(`stair "${st.id}": support "${name}" names nothing in this chassis`); });
    if(!(st.supportedBy || []).length) out.push(`stair "${st.id}" declares no support`);
  }
  if(inst.attachment){
    const a = inst.attachment;
    if(!a.bearing.length) out.push(`deck attachment "${a.id}" declares no bearing`);
    a.bearing.forEach(name => { if(!supportResolves(name)) out.push(`deck attachment "${a.id}": bearing "${name}" names nothing in this chassis (declare terrain in foundation.terrainBearings)`); });
    if(!(a.lapRows >= 0 && a.lapRows <= a.d)) out.push(`deck attachment "${a.id}": lapRows ${a.lapRows} must sit within 0..its own depth ${a.d}`);
    if(!(a.w >= 1 && a.d >= 1)) out.push(`deck attachment "${a.id}": resolved footprint ${a.w}x${a.d} is not a positive rectangle`);
  }
  return out;
}

/* ── gate 9: parameter-sweep ───────────────────────────────────────────────────────────────── */

function sweepValues(p){
  const mid = p.integer ? Math.round((p.min + p.max) / 2) : (p.min + p.max) / 2;
  return [...new Set([p.min, mid, p.max])];
}

function sweepCombos(chassis){
  const params = chassis.parameters || [];
  const perParam = params.map(sweepValues);
  const full = perParam.reduce((n, vs) => n * vs.length, 1);
  const combos = [];
  if(full <= 27){
    (function walk(i, acc){
      if(i === params.length){ combos.push({ ...acc }); return; }
      for(const v of perParam[i]) walk(i + 1, { ...acc, [params[i].name]: v });
    })(0, {});
    return { combos, mode: `full cross product (${full} combos)` };
  }
  const seen = new Set();
  const base = defaultParams(chassis);
  for(let i = 0; i < params.length; i++){
    for(const v of perParam[i]){
      const combo = { ...base, [params[i].name]: v };
      const key = JSON.stringify(combo);
      if(!seen.has(key)){ seen.add(key); combos.push(combo); }
    }
  }
  return { combos, mode: `axis-at-a-time around defaults (${combos.length} combos; full product would be ${full})` };
}

function runInstanceGates(chassis, inst){
  return [
    ["closed-wall-loops", checkClosedWallLoops(chassis, inst)],
    ["roof-coverage", checkRoofCoverage(chassis, inst)],
    ["opening-placement", checkOpeningPlacement(chassis, inst)],
    ["program-obligations", checkProgramObligations(chassis, inst)],
    ["stair-reach", checkStairReach(chassis, inst)],
    ["support", checkSupport(chassis, inst)]
  ];
}

function checkParameterSweep(chassis){
  const out = [];
  const { combos, mode } = sweepCombos(chassis);
  let failing = 0;
  for(const combo of combos){
    const inst = instantiate(chassis, combo);
    if(inst.errors.length){
      failing++;
      out.push(`combo ${comboLabel(combo)} — instantiation failed: ${inst.errors[0]}`);
      continue;
    }
    for(const [name, messages] of runInstanceGates(chassis, inst)){
      if(messages.length){
        failing++;
        out.push(`combo ${comboLabel(combo)} — ${name}: ${messages[0]}` +
          (messages.length > 1 ? ` (+${messages.length - 1} more)` : ""));
      }
    }
  }
  if(out.length) out.unshift(`${failing} failing gate runs across ${combos.length} combos (${mode})`);
  return out;
}

/* ── runner ────────────────────────────────────────────────────────────────────────────────── */

function runAllGates(chassis){
  const results = new Map(CHECK_ORDER.map(name => [name, { messages: [], ran: false }]));
  const record = (name, messages) => { const r = results.get(name); r.ran = true; r.messages.push(...messages); };

  record("shape", checkShape(chassis));
  if(results.get("shape").messages.length) return finish(results);

  record("parameter-legality", checkParameterLegality(chassis));

  const inst = instantiate(chassis, defaultParams(chassis));
  if(inst.errors.length){
    record("shape", inst.errors.map(m => `default instantiation: ${m}`));
    return finish(results);
  }
  for(const [name, messages] of runInstanceGates(chassis, inst)) record(name, messages);
  record("parameter-sweep", checkParameterSweep(chassis));
  return finish(results);

  function finish(map){
    const rows = CHECK_ORDER.map(name => ({ check: name, ...map.get(name) }));
    return { rows, pass: rows.every(r => !r.messages.length) };
  }
}

function loadChassis(path){
  return JSON.parse(readFileSync(path, "utf8"));
}

function printReport(label, report){
  console.log(`\n=== ${label} ===`);
  let passCount = 0, failCount = 0;
  for(const row of report.rows){
    if(!row.ran && !row.messages.length){ console.log(`  SKIP ${row.check} (not reached)`); continue; }
    if(row.messages.length){
      failCount++;
      console.log(`  FAIL ${row.check} (${row.messages.length})`);
      row.messages.slice(0, 12).forEach(m => console.log(`       - ${m}`));
      if(row.messages.length > 12) console.log(`       … ${row.messages.length - 12} more`);
    } else {
      passCount++;
      console.log(`  PASS ${row.check}`);
    }
  }
  console.log(`  → ${report.pass ? "PASS" : "FAIL"} (${passCount} checks passed, ${failCount} failed)`);
  return { passCount, failCount };
}

function runSuite(){
  console.log("CHASSIS GATE SUITE — red-first proof (clean exemplar must pass; each sabotage must fail its named check)");
  let ok = true;
  const summary = [];

  const exemplar = loadChassis(EXEMPLAR_PATH);
  const exemplarReport = runAllGates(exemplar);
  printReport(`exemplar-watchhouse.json (expect PASS)`, exemplarReport);
  if(!exemplarReport.pass){ ok = false; summary.push("VIOLATED: the clean exemplar must pass every gate"); }
  else summary.push("ok: exemplar passes all gates");

  const negatives = existsSync(NEGATIVE_DIR)
    ? readdirSync(NEGATIVE_DIR).filter(f => f.endsWith(".json")).sort()
    : [];
  if(!negatives.length){ ok = false; summary.push("VIOLATED: no negative fixtures found — the gates are unproven"); }

  for(const file of negatives){
    const chassis = loadChassis(join(NEGATIVE_DIR, file));
    const expect = chassis._expect || {};
    const report = runAllGates(chassis);
    printReport(`negative/${file} (expect FAIL on ${expect.check || "?"})`, report);
    const failedChecks = report.rows.filter(r => r.messages.length).map(r => r.check);
    if(report.pass){
      ok = false; summary.push(`VIOLATED: ${file} passed — the sabotage went undetected`);
    } else if(!expect.check){
      ok = false; summary.push(`VIOLATED: ${file} has no "_expect.check" naming the gate it must trip`);
    } else if(!failedChecks.includes(expect.check)){
      ok = false; summary.push(`VIOLATED: ${file} failed [${failedChecks.join(", ")}] but not the expected check "${expect.check}"`);
    } else {
      summary.push(`ok: ${file} fails "${expect.check}" as expected`);
    }
  }

  console.log("\n=== SUITE VERDICT ===");
  summary.forEach(line => console.log("  " + line));
  console.log(ok ? "  SUITE GREEN — gates proven red-first" : "  SUITE RED — expectations violated");
  process.exit(ok ? 0 : 1);
}

/* ── CLI ───────────────────────────────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
if(args.includes("--suite")){
  runSuite();
} else if(args.length === 1){
  const path = resolvePath(args[0]);
  const report = runAllGates(loadChassis(path));
  printReport(path, report);
  process.exit(report.pass ? 0 : 1);
} else {
  console.log("usage: node dev/research/verify-chassis-gate.mjs <chassis.json> | --suite");
  process.exit(2);
}
