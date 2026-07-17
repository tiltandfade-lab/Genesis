#!/usr/bin/env node
/* KGR-6 executable admission gate. Consumes only evidence produced by the real-Chrome capture and
   independently rechecks immutable file/hash/schema facts so a default-valued report cannot pass. */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const OUT=join(ROOT,"dev/battle-gate/kenney-graphics-repair");
const NAMES=["rect.png","l-room.png","octagon.png","door-shut.png","door-open.png","pilot-lineup.png","socket-mates.png","report.json","inventory.json"];
let pass=0,fail=0;
function ok(condition,label,detail=""){if(condition){pass++;console.log(`  ✓ ${label}`);}else{fail++;console.error(`  FAIL: ${label}${detail?` — ${detail}`:""}`);}}
const finite=value=>typeof value==="number"&&Number.isFinite(value);
const sha256=bytes=>createHash("sha256").update(bytes).digest("hex");
function pngSize(path){const b=readFileSync(path);if(b.length<24||b.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")return null;return{width:b.readUInt32BE(16),height:b.readUInt32BE(20)};}

console.log("\n[KGR-6 evidence inventory]");
for(const name of NAMES)ok(existsSync(join(OUT,name)),`${name} exists`);
if(NAMES.some(name=>!existsSync(join(OUT,name)))){console.error("\nKGR-6 evidence incomplete; run node dev/battle-gate/capture-kenney-graphics-repair.mjs");process.exit(1);}
for(const name of NAMES.filter(name=>name.endsWith(".png"))){const size=pngSize(join(OUT,name));ok(!!size,`${name} has a valid PNG header`);const gameplay=["rect.png","l-room.png","octagon.png"].includes(name);ok(size&&size.width>=(gameplay?1500:2000)&&size.height>=1000,`${name} is a real DPR2-scale capture`,size?`${size.width}x${size.height}`:"invalid");}

const report=JSON.parse(readFileSync(join(OUT,"report.json"),"utf8"));
const inventory=JSON.parse(readFileSync(join(OUT,"inventory.json"),"utf8"));
ok(report.schema==="genesis.kenney-graphics-repair-report.v1"&&report.unit==="KGR-6"&&report.dpr===2,"report schema/unit/DPR are exact");
ok(inventory.schema==="genesis.kenney-graphics-repair-inventory.v1"&&inventory.unit==="KGR-6","inventory schema/unit are exact");

console.log("\n[finite geometry and detached-part preservation]");
ok(report.finite?.nonFiniteTransforms===0,"zero non-finite transforms",JSON.stringify(report.finite));
ok(report.finite?.nonFiniteVertices===0,"zero non-finite vertices",JSON.stringify(report.finite));
ok(finite(report.detachedPart?.maxWorldBoundsDelta),"detached leaf bounds delta was actually measured",JSON.stringify(report.detachedPart));
ok(finite(report.detachedPart?.maxWorldBoundsDelta)&&report.detachedPart.maxWorldBoundsDelta<=1e-5,"detached leaf pre/post root-frame bounds delta <= 1e-5",String(report.detachedPart?.maxWorldBoundsDelta));
ok(report.donorOutlineHullDescendants===0,"zero outline-hull descendants",String(report.donorOutlineHullDescendants));

console.log("\n[sockets, grounding, and wall contact]");
ok(Array.isArray(report.mounts)&&report.mounts.length===10,"exactly ten pilot mount measurements");
ok(report.mounts.every(row=>row.socketVisible===true),"every pilot socket frame was visible");
const expectedPilotIds=inventory.runtimeAssets.map(row=>row.assetId).sort();
ok(Array.isArray(report.lineupLabels)&&report.lineupLabels.length===30,"lineup records exactly 30 labeled cells");
ok(expectedPilotIds.every(assetId=>["raw","normalized","genesis"].every(view=>report.lineupLabels.filter(row=>row.assetId===assetId&&row.view===view).length===1)),"each of ten distinct pilot IDs appears exactly once in raw/normalized/Genesis views");
ok(report.mounts.filter(row=>row.type==="floor-mount").every(row=>finite(row.groundError)&&row.groundError<=.01),"every floor mount ground error <= 0.01u",JSON.stringify(report.mounts));
ok(Array.isArray(report.mates)&&report.mates.length===10,"exactly ten six-degree mate measurements");
ok(report.mates.every(row=>finite(row.positionError)&&row.positionError<=.005),"every mate position error <= 0.005u",JSON.stringify(report.mates));
ok(report.mates.every(row=>finite(row.angleErrorDegrees)&&row.angleErrorDegrees<=.5),"every mate angle error <= 0.5 degrees",JSON.stringify(report.mates));
ok(finite(report.placement?.wallPenetration),"wall penetration was actually measured",String(report.placement?.wallPenetration));
ok(finite(report.placement?.wallPenetration)&&report.placement.wallPenetration<=.01,"wall penetration <= 0.01u",String(report.placement?.wallPenetration));

console.log("\n[UV, registry, and structural contracts]");
ok(Number.isInteger(report.uv?.mappedPrimitives)&&report.uv.mappedPrimitives>0,"mapped primitive UV census was actually performed",JSON.stringify(report.uv));
ok(report.uv?.missingUvPrimitives===0,"every mapped donor primitive has TEXCOORD_0",JSON.stringify(report.uv));
ok(Array.isArray(report.registry?.stale)&&report.registry.stale.length===0,"zero stale runtime registry entries",JSON.stringify(report.registry));
ok(Array.isArray(report.registry?.unapproved)&&report.registry.unapproved.length===0,"zero non-approved runtime registry entries",JSON.stringify(report.registry));
ok(Array.isArray(report.structural?.measurements)&&report.structural.measurements.length>0,"structural module measurements were actually performed");
ok(Array.isArray(report.structural?.violations)&&report.structural.violations.length===0,"module/orientation/v2 socket structural violations are zero",JSON.stringify(report.structural?.violations));
ok(report.structural.measurements.every(row=>finite(row.transformedModule)&&Math.abs(row.transformedModule-row.targetWorldUnits)<=1e-6),"module constants match transformed scene basis");
ok(report.structural.measurements.every(row=>Array.isArray(row.orientationIndexes)&&row.orientationIndexes.length===4&&row.orientationIndexes.every(n=>Number.isInteger(n)&&n>=0&&n<=3)),"every structural orientation index is an integer in 0..3");
ok(report.structural.measurements.every(row=>Array.isArray(row.buttJoinSockets)&&row.buttJoinSockets.length===0),"no structural v2 donor emits butt-join-*");

console.log("\n[placement and compiled room shells]");
ok(Array.isArray(report.placement?.obbOverlaps),"OBB overlap result was actually measured");
ok(report.placement?.obbOverlaps?.length===0,"zero OBB overlaps among separately placed pilot props",JSON.stringify(report.placement?.obbOverlaps));
ok(Array.isArray(report.furnished?.entries)&&report.furnished.entries.length===6,"deterministic furnished room contains six requested rules");
ok(report.furnished?.entries?.every(row=>row.assetId),"every furnished rule resolved an admitted visual asset",JSON.stringify(report.furnished?.entries));
ok(report.furnished?.entries?.every(row=>row.placementStatus!=="fallback-overlap"),"no furnished pilot fell back to an overlapping legacy render",JSON.stringify(report.furnished?.entries));
ok(Array.isArray(report.rooms)&&report.rooms.length===3,"exactly rect/L/octagon room measurements");
ok(report.rooms.every(row=>row.continuousShell===true),"continuous compiled shell is active on all three shapes",JSON.stringify(report.rooms));
ok(report.rooms.every(row=>row.kitWallCount===0&&row.kitFloorCount===0),"kit wall/floor counts are zero on all three shapes",JSON.stringify(report.rooms));
ok(Array.isArray(report.doors)&&report.doors.length===6,"shut/ajar/open were measured in both width axes");
ok(report.doors.every(row=>row.kit===true&&[...row.groupDimensions,...row.frameDimensions,...row.leafDimensions,...row.doorPosition,...row.doorScale,...row.leafPiecePosition,...row.leafPieceScale,...row.leafPieceQuaternion].every(finite)),"every live kit-door transform/bounds measurement is finite");

console.log("\n[capture-page health and independent inventory hashes]");
ok(Array.isArray(report.consoleErrors)&&report.consoleErrors.length===0,"capture pages reported zero console errors",JSON.stringify(report.consoleErrors));
ok(Array.isArray(report.resourceConsoleMessages)&&report.resourceConsoleMessages.length===0,"capture pages reported zero generic resource-error console messages",JSON.stringify(report.resourceConsoleMessages));
ok(Array.isArray(report.failedGlbLoads)&&report.failedGlbLoads.length===0,"capture pages reported zero failed GLB loads",JSON.stringify(report.failedGlbLoads));
ok(Array.isArray(report.successfulGlbLoads)&&report.successfulGlbLoads.length>=10,"target GLB success responses were actually observed");
ok(Array.isArray(report.transientAbortedGlbLoads)&&report.transientAbortedGlbLoads.every(value=>report.successfulGlbLoads.includes(value.slice(value.indexOf("http")))),"every retained transient/cancelled GLB request has a successful terminal load",JSON.stringify(report.transientAbortedGlbLoads));
ok(Array.isArray(inventory.runtimeAssets)&&inventory.runtimeAssets.length===10,"inventory contains exactly ten runtime pilots");
for(const row of inventory.runtimeAssets){const source=join(ROOT,"assets/models",...row.assetId.split("/"))+".glb";ok(row.qaStatus==="approved-runtime",`${row.assetId} inventory status approved-runtime`);ok(row.sourceSha256===row.actualSourceSha256&&row.actualSourceSha256===sha256(readFileSync(source)),`${row.assetId} inventory/source hashes agree`);}
ok(Array.isArray(inventory.structuralPacks)&&inventory.structuralPacks.length===2,"inventory contains both structural packs");
ok(inventory.structuralPacks.every(pack=>pack.schema==="genesis.donor-index.v2"),"both structural indexes are v2");

console.log(`\n${pass} passed, ${fail} failed`);
if(fail)process.exit(1);
