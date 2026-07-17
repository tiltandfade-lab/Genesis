#!/usr/bin/env node
/* KGR-4C ten-asset calibration, normalization, determinism, and visual-capture gate. */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createWorkbenchServer } from "./model-foundry/kenney-workbench-server.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAL_PATH = join(ROOT, "dev/model-foundry/kenney-calibration.json");
const CENSUS_PATH = join(ROOT, "dev/model-foundry/kenney-census.json");
const NORMALIZED = join(ROOT, "assets/models-normalized");
const PROVENANCE = join(ROOT, "dev/model-foundry/KS1-PROVENANCE.json");
const OUT = join(ROOT, "dev/model-foundry/kenney-workbench-captures");
const REPORT_PATH = join(OUT, "pilot-calibration-report.json");
const IDENTITY_Q = [0, 0, 0, 1];
let pass = 0, fail = 0;
function check(name, condition, detail = "") {
  if (condition) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`); }
}
const finite = value => typeof value === "number" && Number.isFinite(value);
const close = (a, b, tolerance = 1e-6) => finite(a) && Math.abs(a - b) <= tolerance;
const assetPath = id => join(ROOT, "assets/models", ...id.split("/")) + ".glb";
const normalizedPath = id => join(NORMALIZED, ...id.split("/")) + ".glb";
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const fileSha256 = path => sha256(readFileSync(path));
const dimsOf = bounds => bounds.aabbMax.map((value, index) => value - bounds.aabbMin[index]);

const packs = {
  "kenney-retro-fantasy-kit": 2,
  "kenney-pirate-kit": 0.7,
  "kenney-furniture-kit": 1.5,
  "kenney-fantasy-town-kit": 1,
  "kenney-factory-kit": 1,
};
const pilots = [
  { id:"kenney-retro-fantasy-kit/detail-barrel", mount:"floor-mount", envelope:d=>d[1]>=.50&&d[1]<=.85&&d[0]>=.35&&d[0]<=.80&&d[2]>=.35&&d[2]<=.80 },
  { id:"kenney-pirate-kit/crate", mount:"floor-mount", envelope:d=>d[1]>=.30&&d[1]<=.80&&d[0]>=.35&&d[0]<=1.20&&d[2]>=.35&&d[2]<=1.20 },
  { id:"kenney-pirate-kit/chest", mount:"floor-mount", envelope:d=>d[1]>=.35&&d[1]<=.85&&d[0]>=.60&&d[0]<=1.30&&d[2]>=.30&&d[2]<=.90 },
  { id:"kenney-furniture-kit/tableRound", mount:"floor-mount", envelope:d=>d[1]>=.50&&d[1]<=.72&&d[0]>=.60&&d[0]<=1.40&&d[2]>=.60&&d[2]<=1.40 },
  { id:"kenney-furniture-kit/benchCushionLow", mount:"floor-mount", envelope:d=>d[1]>=.30&&d[1]<=.65&&Math.max(d[0],d[2])>=.65&&Math.max(d[0],d[2])<=1.80 },
  { id:"kenney-furniture-kit/chair", mount:"floor-mount", envelope:d=>d[1]>=.55&&d[1]<=1.05&&d[0]>=.25&&d[0]<=.80&&d[2]>=.25&&d[2]<=.80 },
  { id:"kenney-furniture-kit/lampWall", mount:"wall-mount", envelope:d=>d[1]>=.10&&d[1]<=.60&&d[2]<=.40 },
  { id:"kenney-furniture-kit/lampRoundFloor", mount:"floor-mount", envelope:d=>d[1]>=.80&&d[1]<=1.60&&d[0]>=.15&&d[0]<=.60&&d[2]>=.15&&d[2]<=.60 },
  { id:"kenney-fantasy-town-kit/lantern", mount:"floor-mount", envelope:d=>d[1]>=.80&&d[1]<=2.00&&d[0]>=.15&&d[0]<=.70&&d[2]>=.15&&d[2]<=.70 },
  { id:"kenney-factory-kit/lever-double", mount:"floor-mount", envelope:d=>d[1]>=.25&&d[1]<=.85&&d[0]>=.25&&d[0]<=1.00&&d[2]>=.25&&d[2]<=1.00 },
];
const pilotIds = new Set(pilots.map(item => item.id));
const calibration = JSON.parse(readFileSync(CAL_PATH, "utf8"));
const census = JSON.parse(readFileSync(CENSUS_PATH, "utf8"));
const censusById = new Map(census.assets.map(entry => [`${entry.pack}/${entry.name.replace(/\.glb$/i, "")}`, entry]));

function readGlb(path) {
  const bytes = readFileSync(path);
  check(`${relative(ROOT, path)} has glTF 2 header`, bytes.subarray(0, 4).toString() === "glTF" && bytes.readUInt32LE(4) === 2);
  let offset = 12, json = null;
  while (offset < bytes.length) {
    const length = bytes.readUInt32LE(offset), type = bytes.readUInt32LE(offset + 4);
    offset += 8;
    const chunk = bytes.subarray(offset, offset + length); offset += length;
    if (type === 0x4e4f534a) json = JSON.parse(chunk.toString("utf8"));
  }
  return { bytes, json };
}
function donorMetadata(gltf) {
  for (const node of gltf.nodes || []) if (node.extras?.genesisDonor?.schema === "genesis.donor.v2") return node.extras.genesisDonor;
  return null;
}
function everyPrimitiveHasUv(gltf) {
  const primitives = (gltf.meshes || []).flatMap(mesh => mesh.primitives || []);
  return primitives.length > 0 && primitives.every(primitive => Number.isInteger(primitive.attributes?.TEXCOORD_0));
}
function treeDigest(paths) {
  const hash = createHash("sha256");
  function add(path) {
    const stat = statSync(path);
    if (stat.isDirectory()) for (const name of readdirSync(path).sort()) add(join(path, name));
    else { hash.update(relative(ROOT, path)); hash.update(readFileSync(path)); }
  }
  for (const path of paths) add(path);
  return hash.digest("hex");
}
function rotatedFootprint(fp, orientationIndex) {
  const odd = orientationIndex % 2 === 1;
  return { halfExtents:odd ? [fp.halfExtents[1], fp.halfExtents[0]] : [...fp.halfExtents], yawRadians:fp.yawRadians + orientationIndex * Math.PI / 2 };
}
function quatRotatesPlusZAway(q) {
  const [x,y,z,w] = q;
  const vx = 2 * (x*z + w*y), vy = 2 * (y*z - w*x), vz = 1 - 2 * (x*x + y*y);
  return Math.abs(vx) <= 1e-6 && Math.abs(vy) <= 1e-6 && vz > .999999;
}

mkdirSync(OUT, { recursive:true });
const report = { schema:"genesis.kenney-pilot-calibration-report.v1", unit:"KGR-4C", qaState:"approved-runtime", pilots:[], rejectedCandidates:[], captures:{perAsset:{},lineup:null}, consoleErrors:[], deterministic:{} };

console.log("\n=== KGR-4C calibration records ===");
for (const [pack, scale] of Object.entries(packs)) {
  const record = calibration.packs[pack];
  check(`${pack} nonstructural pack exists`, !!record && record.structuralGrid === null);
  check(`${pack} locks +Y up / +Z forward`, record?.sourceUp === "+Y" && record?.sourceForward === "+Z");
  check(`${pack} canonicalScale=${scale}`, close(record?.canonicalScale, scale));
}
check("exactly ten named pilot candidates", pilots.length === 10 && pilotIds.size === 10);
// KGR-7 (OPERATION §15): the walk-demand tranche joins the runtime set, and the plain pulley is a
// NAMED approved-dev demotion (edge-on sliver at the production camera; pulley-crate replaced it).
const kgr7RuntimeIds = new Set([
  "kenney-castle-kit/rocks-small", "kenney-retro-fantasy-kit/pulley-crate", "kenney-food-kit/pot-stew",
]);
const runtimeIds = Object.entries(calibration.assets).filter(([, record]) => record.qaStatus === "approved-runtime").map(([id]) => id);
check("exactly the ten named pilots + KGR-7 tranche are approved-runtime",
  runtimeIds.length === pilotIds.size + kgr7RuntimeIds.size &&
  runtimeIds.every(id => pilotIds.has(id) || kgr7RuntimeIds.has(id)) &&
  pilots.every(({id}) => runtimeIds.includes(id)) && [...kgr7RuntimeIds].every(id => runtimeIds.includes(id)));
check("approved-dev is exactly the named KGR-7 pulley demotion",
  Object.entries(calibration.assets).filter(([, record]) => record.qaStatus === "approved-dev")
    .map(([id]) => id).join(",") === "kenney-retro-fantasy-kit/pulley");

console.log("\n=== KGR-4C normalized contracts ===");
for (const item of pilots) {
  const { id, mount, envelope } = item, record = calibration.assets[id], censusEntry = censusById.get(id);
  const pack = id.split("/")[0], glb = readGlb(normalizedPath(id)), metadata = donorMetadata(glb.json);
  const index = JSON.parse(readFileSync(join(NORMALIZED, pack, "index.json"), "utf8")).assets[id.split("/")[1]];
  check(`${id} is approved-runtime`, record?.qaStatus === "approved-runtime" && metadata?.qaStatus === "approved-runtime" && index?.qaStatus === "approved-runtime");
  check(`${id} source hash matches census, source bytes, index, and GLB`, !!censusEntry && record.sourceSha256 === censusEntry.sha256 && record.sourceSha256 === fileSha256(assetPath(id)) && index.sourceSha256 === record.sourceSha256 && metadata.sourceSha256 === record.sourceSha256);
  check(`${id} uses uniform positive asset scale`, record.preTransform.scale.length === 3 && record.preTransform.scale.every(finite) && record.preTransform.scale.every(value => value > 0) && close(record.preTransform.scale[0], record.preTransform.scale[1], 1e-12) && close(record.preTransform.scale[1], record.preTransform.scale[2], 1e-12));
  if (id.endsWith("/benchCushionLow")) check(`${id} has the sole justified semantic scale`, !close(record.preTransform.scale[0], 1, 1e-12) && record.scaleReason === "semantic-size:height 0.30-0.65u; long axis 0.65-1.80u");
  else check(`${id} has no per-asset semantic scale`, record.preTransform.scale.every(value => close(value, 1, 1e-12)) && record.scaleReason === null);
  check(`${id} has exactly one reviewed ${mount}`, record.sockets.length === 1 && record.sockets[0].type === mount && record.sockets[0].id === mount);
  check(`${id} mount quaternion is normalized`, close(Math.hypot(...record.sockets[0].rotation), 1, 1e-6));
  check(`${id} normalized primitives retain TEXCOORD_0`, everyPrimitiveHasUv(glb.json));
  const bounds = metadata.bounds, dims = dimsOf(bounds), fp = bounds.footprint;
  check(`${id} has finite transformed bounds`, [...bounds.aabbMin,...bounds.aabbMax].every(finite) && dims.every(value => finite(value) && value > 0));
  check(`${id} lies inside its locked physical envelope`, envelope(dims), JSON.stringify(dims));
  check(`${id} has a finite positive OBB footprint`, fp.center.length === 2 && fp.halfExtents.length === 2 && [...fp.center,...fp.halfExtents,fp.yawRadians].every(finite) && fp.halfExtents.every(value => value > 0));
  if (mount === "floor-mount") check(`${id} floor mount is on derived ground <=0.01u`, Math.abs(record.sockets[0].position[1] - bounds.groundY) <= .01, `${record.sockets[0].position[1]} vs ${bounds.groundY}`);
  else {
    check(`${id} wall mount is on the rear wall plane <=0.01u`, Math.abs(record.sockets[0].position[2] - bounds.aabbMin[2]) <= .01, `${record.sockets[0].position[2]} vs ${bounds.aabbMin[2]}`);
    check(`${id} wall mount +Z faces away from the wall`, quatRotatesPlusZAway(record.sockets[0].rotation));
  }
  const orientations = [0,1,2,3].map(index => ({ index, ...rotatedFootprint(fp,index) }));
  check(`${id} orientationIndex 0..3 footprints stay finite`, orientations.every(value => [...value.halfExtents,value.yawRadians].every(finite)));
  check(`${id} quarter-turn footprint swaps projected extents`, close(orientations[0].halfExtents[0],orientations[1].halfExtents[1]) && close(orientations[0].halfExtents[1],orientations[1].halfExtents[0]));
  report.pilots.push({ assetId:id, sourceSha256:record.sourceSha256, packScale:packs[pack], perAssetScale:record.preTransform.scale[0], scaleReason:record.scaleReason, dimensions:dims, footprint:fp, mount:record.sockets[0], qaStatus:record.qaStatus, rootMaterialFamily:record.rootMaterialFamily, orientations });
}

console.log("\n=== KGR-4C rejected original candidate ===");
const rejectedId = "kenney-furniture-kit/bench", rejected = calibration.assets[rejectedId], rejectedGlb = readGlb(normalizedPath(rejectedId)), rejectedMetadata = donorMetadata(rejectedGlb.json);
check("original bench is not one of the ten pilots", !pilotIds.has(rejectedId));
check("original bench remains quarantined in calibration and output", rejected?.qaStatus === "quarantined" && rejectedMetadata?.qaStatus === "quarantined");
check("original bench remains mount-free in calibration and output", rejected?.sockets?.length === 0 && rejectedMetadata?.sockets?.length === 0);
check("original bench records exact ratio proof", rejected.notes.some(note => note.includes("raw long/height 0.40/0.47")) && rejected.notes.some(note => note.includes("total scale >=1.625")) && rejected.notes.some(note => note.includes("total scale <=1.382979")));
check("original bench names the honest replacement and false-face rejection", rejected.notes.some(note => note.includes("benchCushionLow") && note.includes("false ground face")));
report.rejectedCandidates.push({ assetId:rejectedId, sourceSha256:rejected.sourceSha256, qaStatus:rejected.qaStatus, mounts:rejected.sockets, notes:rejected.notes });

console.log("\n=== KGR-4C byte determinism ===");
const beforeDigest = treeDigest([NORMALIZED, PROVENANCE]);
const normalizer = spawnSync("python3", ["build/normalize-donors.py"], { cwd:ROOT, encoding:"utf8" });
const afterDigest = treeDigest([NORMALIZED, PROVENANCE]);
report.deterministic = { beforeDigest, afterDigest, stdout:normalizer.stdout.trim(), stderr:normalizer.stderr.trim() };
check("second sequential normalizer run succeeds", normalizer.status === 0, `${normalizer.stdout}\n${normalizer.stderr}`);
check("two normalizer runs are byte-identical", beforeDigest === afterDigest, `${beforeDigest} != ${afterDigest}`);

function listen(server) { return new Promise((ok,bad)=>{ server.once("error",bad); server.listen(0,"127.0.0.1",()=>ok(server.address().port)); }); }
function closeServer(server) { return new Promise(resolveClose => server.close(resolveClose)); }
async function waitLoaded(page, view) {
  await page.waitForFunction(expected => window.__kenneyWorkbench.state.view === expected && !document.querySelector("#saveStatus").textContent.startsWith("loading"), { timeout:30000 }, view);
  const state = await page.evaluate(() => ({ status:document.querySelector("#saveStatus").textContent, error:document.querySelector("#errors").textContent, model:!!window.__kenneyWorkbench.state.model }));
  if (!state.model || !state.status.endsWith("loaded")) throw new Error(`${view} failed: ${JSON.stringify(state)}`);
  return state;
}
async function compose(browser, title, subtitle, cells, columns, outputPath) {
  const page = await browser.newPage();
  const width = columns === 4 ? 1420 : 1280;
  await page.setViewport({ width, height:900, deviceScaleFactor:1 });
  const safe = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const html = `<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#121116;color:#eee;font:14px system-ui;padding:22px}h1{margin:0 0 4px;color:#f0d18b;font-size:24px}p{margin:0 0 16px;color:#b9b2a8}.grid{display:grid;grid-template-columns:repeat(${columns},1fr);gap:12px}.cell{background:#201e24;border:1px solid #45404a;padding:7px;break-inside:avoid}.cell h2{font-size:13px;margin:0 0 6px;color:#eee}.cell img{display:block;width:100%;height:auto;background:#17161a}.meta{font-size:11px;color:#bdb5aa;margin-top:5px;min-height:28px;white-space:pre-wrap}</style><h1>${safe(title)}</h1><p>${safe(subtitle)}</p><div class="grid">${cells.map(cell=>`<div class="cell"><h2>${safe(cell.label)}</h2><img src="data:image/png;base64,${cell.image}"><div class="meta">${safe(cell.meta||"")}</div></div>`).join("")}</div>`;
  await page.setContent(html, { waitUntil:"networkidle0" });
  await page.screenshot({ path:outputPath, fullPage:true });
  await page.close();
}

console.log("\n=== KGR-4C fixed-camera browser captures ===");
const captureServer = createWorkbenchServer({ root:ROOT, calibrationPath:CAL_PATH, censusPath:CENSUS_PATH });
const port = await listen(captureServer);
let puppeteer = null;
try { puppeteer = createRequire(join(process.env.HOME, ".genesis-jsdom/package.json"))("puppeteer-core"); } catch {}
if (!puppeteer) check("Puppeteer available for mandatory KGR-4C visual gate", false, "puppeteer-core missing");
else {
  const browser = await puppeteer.launch({ executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless:"new", args:["--use-angle=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--no-sandbox","--disable-gpu-sandbox"], defaultViewport:{width:1440,height:960,deviceScaleFactor:1} });
  const page = await browser.newPage();
  page.on("console", message => { if (message.type() === "error") report.consoleErrors.push(message.text()); });
  page.on("pageerror", error => report.consoleErrors.push(error.message));
  const lineupCells = [];
  try {
    await page.goto(`http://127.0.0.1:${port}/dev/model-foundry/kenney-workbench.html`, { waitUntil:"networkidle0", timeout:30000 });
    await page.waitForFunction(() => window.__kenneyWorkbenchReady === true, { timeout:30000 });
    for (const item of pilots) {
      await page.evaluate(id => window.__kenneyWorkbench.selectAsset(id), item.id);
      const views = {};
      for (const view of ["raw","normalized","genesis"]) {
        const loaded = await page.evaluate(async selected => { const api=window.__kenneyWorkbench; if (selected === "raw") api.state.materialFallbacks.clear(); api.state.view=selected; await api.loadCurrentView(); return { url:document.querySelector("#loadedUrl").textContent }; }, view);
        const state = await waitLoaded(page, view);
        const image = await (await page.$("#viewCanvas")).screenshot({ encoding:"base64" });
        const diagnostic = await page.$eval("#errors", element => element.textContent);
        views[view] = { url:loaded.url, diagnostic, image };
        lineupCells.push({ label:`${item.id} · ${view}`, image, meta:diagnostic || loaded.url });
      }
      const orientationCells = [];
      for (const orientationIndex of [0,1,2,3]) {
        await page.click(`[data-o="${orientationIndex}"]`);
        await page.evaluate(() => new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(resolveFrame))));
        const image = await (await page.$("#viewCanvas")).screenshot({ encoding:"base64" });
        const occupancy = await page.$eval("#occupancy", element => element.textContent);
        orientationCells.push({ label:`orientationIndex ${orientationIndex}`, image, meta:occupancy });
      }
      const safeName = item.id.replace("/", "--");
      const output = join(OUT, `pilot-${safeName}.png`);
      await compose(browser, item.id, "Genesis material · orientationIndex 0..3 · fixed workbench camera · 6 ft / 1.2u yardstick", orientationCells, 4, output);
      const browserMetrics = await page.evaluate(() => { const api=window.__kenneyWorkbench, yardstick=api.humanYardstickMetrics(), meshes=[]; api.state.model.traverse(object=>{if(object.isMesh){const materials=Array.isArray(object.material)?object.material:[object.material];meshes.push({name:object.name,materials:materials.map(material=>({type:material?.type,color:material?.color?.getHexString?.()||null,metalness:material?.metalness??null,roughness:material?.roughness??null,transmission:material?.transmission??null}))});}}); return { yardstick, sockets:api.scene.getObjectByName("socket-overlays")?.children.length||0, appliedFamilies:[...(api.state.model.userData.genesisDonorPiece?.materialFamiliesApplied||[])], meshes }; });
      const row = report.pilots.find(value => value.assetId === item.id);
      row.views = Object.fromEntries(Object.entries(views).map(([key,value])=>[key,{url:value.url,diagnostic:value.diagnostic}]));
      row.browser = browserMetrics;
      report.captures.perAsset[item.id] = relative(ROOT, output);
      check(`${item.id} all three real workbench views loaded`, views.raw.url.startsWith("/assets/models/") && views.normalized.url.startsWith("/assets/models-normalized/") && views.genesis.url.startsWith("loadDonorPiece("));
      check(`${item.id} 1.2u yardstick is visible and grounded`, close(browserMetrics.yardstick.height,1.2,1e-6) && close(browserMetrics.yardstick.groundY,0,1e-9) && browserMetrics.yardstick.visible && browserMetrics.yardstick.onScreen);
      check(`${item.id} has exactly one visible reviewed socket`, browserMetrics.sockets === 1, String(browserMetrics.sockets));
      check(`${item.id} production loader resolves a family for every mesh`, browserMetrics.appliedFamilies.length === browserMetrics.meshes.length && browserMetrics.appliedFamilies.every(Boolean), JSON.stringify(browserMetrics.appliedFamilies));
      check(`${item.id} has zero white metallic fallback materials`, browserMetrics.meshes.flatMap(mesh=>mesh.materials).every(material=>!(material.color === "ffffff" && material.metalness === 1 && material.roughness === 1)), JSON.stringify(browserMetrics.meshes));
      const requiredBags = {
        "kenney-furniture-kit/benchCushionLow":["wood","cloth","wood"],
        "kenney-furniture-kit/lampWall":["iron","glass"],
        "kenney-furniture-kit/lampRoundFloor":["iron","glass"],
      };
      if (requiredBags[item.id]) check(`${item.id} exact production material family bag`, JSON.stringify([...browserMetrics.appliedFamilies].sort()) === JSON.stringify([...requiredBags[item.id]].sort()), JSON.stringify(browserMetrics.appliedFamilies));
      const needsFallback = ["detail-barrel","crate","chest","lantern","lever-double"].some(slug => item.id.endsWith(`/`+slug));
      check(`${item.id} raw material diagnostic is truthful`, needsFallback ? views.raw.diagnostic.includes("RAW MATERIAL UNAVAILABLE") : views.raw.diagnostic === "", views.raw.diagnostic);
    }
    const lineup = join(OUT, "pilot-all-ten-lineup.png");
    await compose(browser, "KGR-4C ten-asset pilot lineup", "Fixed workbench camera · raw / normalized / Genesis material · 6 ft / 1.2u yardstick · neutral raw fallback is labeled", lineupCells, 3, lineup);
    report.captures.lineup = relative(ROOT, lineup);
  } finally { await page.close(); await browser.close(); }
  check("browser captures have zero console/page errors", report.consoleErrors.length === 0, report.consoleErrors.join(" | "));
}
await closeServer(captureServer);

writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
