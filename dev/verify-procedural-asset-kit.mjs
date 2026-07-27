#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const output = path.join(here, "model-foundry", "procedural-asset-kit-proof.png");
const stateOutput = path.join(here, "model-foundry", "procedural-asset-state-recipes-proof.png");
const partsOutput = path.join(here, "model-foundry", "procedural-connective-parts-proof.png");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ports = [4193, 4194, 4195, 4196];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port }, () => { socket.destroy(); resolve(true); });
    socket.on("error", () => resolve(false));
    socket.setTimeout(500, () => { socket.destroy(); resolve(false); });
  });
}
async function servesGenesis(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/dev/model-foundry/procedural-asset-kit.html`);
    return response.ok && (await response.text()).includes("Engine-Owned Asset Foundry");
  } catch {
    return false;
  }
}
async function server() {
  for (const port of ports) {
    if (await portInUse(port)) {
      if (await servesGenesis(port)) return { port, proc: null };
      continue;
    }
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
      cwd: root,
      stdio: ["ignore", "ignore", "ignore"],
    });
    for (let attempt = 0; attempt < 40; attempt++) {
      await sleep(120);
      if (await servesGenesis(port)) return { port, proc };
    }
    proc.kill("SIGTERM");
  }
  throw new Error("No available local verification port.");
}

const expected = { parts: 40, paths: 2, effects: 4, surfaces: 4, containers: 5, states: 8, channels: 10 };
const errors = [];
const genesisSource = fs.readFileSync(path.join(root, "genesis.html"), "utf8");
if (!genesisSource.includes('<script type="module" src="src/ui/theater-procedural-kit.js"></script>')) {
  errors.push("production genesis.html does not load the procedural kit module");
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const manifestModule = manifest.modules?.find((entry) => entry.id === "ui.theater-procedural-kit");
if (!manifestModule || manifestModule.path !== "src/ui/theater-procedural-kit.js") {
  errors.push("production manifest does not register ui.theater-procedural-kit");
}
for (const symbol of ["PROCEDURAL_PART_CATALOG", "createProceduralPartForUse", "proceduralPartKindsForUse", "createProceduralBarrier", "applyProceduralStateRecipe"]) {
  if (!manifestModule?.owns?.includes(symbol)) errors.push(`production manifest does not own ${symbol}`);
}
const local = await server();
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu-sandbox",
    "--use-angle=swiftshader",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
  ],
  defaultViewport: { width: 1800, height: 1200, deviceScaleFactor: 1 },
});
try {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto(
    `http://127.0.0.1:${local.port}/dev/model-foundry/procedural-asset-kit.html?material=ironwood&state=occupied`,
    { waitUntil: "domcontentloaded", timeout: 120000 },
  );
  try {
    await page.waitForFunction(() => window.__proceduralKitReady === true, { timeout: 120000 });
  } catch (error) {
    throw new Error(`${error.message}\nBrowser errors:\n${consoleErrors.join("\n") || "(none)"}`);
  }
  const report = await page.evaluate(() => {
    const objects = [...window.__proceduralKitObjects.entries()];
    return {
      audit: window.__proceduralKitAudit,
      objectCount: objects.length,
      objects: objects.map(([key, object]) => {
        let meshes = 0;
        let points = 0;
        let missingChannel = 0;
        let triangles = 0;
        object.traverse((node) => {
          if (node.isMesh) {
            meshes++;
            const geometry = node.geometry;
            triangles += geometry?.index ? geometry.index.count / 3 : (geometry?.attributes?.position?.count || 0) / 3;
            if (!node.userData?.genesisProcedural?.channel && !node.parent?.userData?.genesisProceduralKit && !key.startsWith("assembly:")) {
              missingChannel++;
            }
          }
          if (node.isPoints) points++;
        });
        return {
          key,
          meshes,
          points,
          sockets: object.userData?.sockets?.length || 0,
          missingChannel,
          triangles,
          state: object.userData?.genesisProceduralKit?.state || null,
        };
      }),
      bridge: Object.keys(window.TheaterProceduralKit || {}).sort(),
      partCatalog: window.TheaterProceduralKit?.partCatalog || null,
      useSelection: (() => {
        const kit = window.TheaterProceduralKit;
        const uses = ["power-transfer", "rope-routing", "reinforcement", "ground-contact", "closure"];
        return uses.map((use) => {
          const candidates = kit.partKindsForUse(use);
          const selected = kit.createPartForUse(use, { seedKey: `verify:${use}` });
          return {
            use,
            candidates,
            selected: selected.userData.genesisProceduralKit.kind,
            requestedUse: selected.userData.genesisProceduralKit.requestedUse,
          };
        });
      })(),
    };
  });
  for (const [key, value] of Object.entries(expected)) {
    if (report.audit[key] !== value) errors.push(`${key}: expected ${value}, got ${report.audit[key]}`);
  }
  if (report.objectCount !== 60) errors.push(`expected 60 foundry objects, got ${report.objectCount}`);
  for (const object of report.objects) {
    if (object.meshes + object.points < 1) errors.push(`${object.key}: empty object`);
    if (!object.key.startsWith("assembly:") && object.missingChannel) errors.push(`${object.key}: ${object.missingChannel} meshes lack semantic channels`);
  }
  const totalTriangles = report.objects.reduce((sum, object) => sum + object.triangles, 0);
  if (totalTriangles > 60000) errors.push(`foundry exceeds triangle proof budget: ${totalTriangles}`);
  const stateCycle = await page.evaluate(async (states) => {
    const select = document.querySelector("#state");
    const results = [];
    for (const state of states) {
      select.value = state;
      select.dispatchEvent(new Event("change"));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      results.push({
        requested: state,
        applied: window.__proceduralKitObjects.get("state:lab")?.userData?.genesisProceduralKit?.state,
      });
    }
    return results;
  }, ["intact", "repaired", "damaged", "breached", "open", "closed", "occupied", "abandoned"]);
  stateCycle.forEach((entry) => {
    if (entry.applied !== entry.requested) errors.push(`state cycle ${entry.requested}: applied ${entry.applied}`);
  });
  for (const key of ["createPart", "createPartForUse", "partKindsForUse", "createPath", "createFx", "createSurface", "createContainer", "createCargoSocketRack", "createBarrier", "applyState", "applyStateRecipe", "attachAtSocket", "socketsOf", "tick"]) {
    if (!report.bridge.includes(key)) errors.push(`classic bridge missing ${key}`);
  }
  if (!report.partCatalog || Object.keys(report.partCatalog).length !== expected.parts) {
    errors.push(`runtime part catalog expected ${expected.parts} entries`);
  } else {
    Object.entries(report.partCatalog).forEach(([kind, entry]) => {
      if (!Array.isArray(entry.uses) || entry.uses.length < 1) errors.push(`${kind}: runtime catalog has no functional uses`);
    });
  }
  report.useSelection.forEach((entry) => {
    if (!entry.candidates.includes(entry.selected) || entry.requestedUse !== entry.use) {
      errors.push(`${entry.use}: functional selection did not return a catalog-compatible runtime part`);
    }
  });
  if (consoleErrors.length) errors.push(...consoleErrors.map((message) => `browser: ${message}`));
  await page.screenshot({ path: output });
  if (!fs.existsSync(output) || fs.statSync(output).size < 100000) errors.push("proof screenshot missing or suspiciously small");
  const statePage = await browser.newPage();
  statePage.setDefaultNavigationTimeout(120000);
  const stateErrors = [];
  statePage.on("console", (message) => { if (message.type() === "error") stateErrors.push(message.text()); });
  statePage.on("pageerror", (error) => stateErrors.push(error.message));
  await statePage.goto(
    `http://127.0.0.1:${local.port}/dev/model-foundry/procedural-asset-state-gallery.html`,
    { waitUntil: "domcontentloaded", timeout: 120000 },
  );
  await statePage.waitForFunction(() => window.__proceduralStateGalleryReady === true, { timeout: 120000 });
  const galleryReport = await statePage.evaluate(() => ({
    states: window.__proceduralStateGallery,
    recipes: window.__proceduralStateRecipes,
    metrics: window.__proceduralStateMetrics,
  }));
  const galleryStates = galleryReport.states;
  if (JSON.stringify(galleryStates) !== JSON.stringify(["intact","repaired","damaged","breached","open","closed","occupied","abandoned"])) {
    errors.push(`state gallery mismatch: ${JSON.stringify(galleryStates)}`);
  }
  const expectedRecipes = [
    { condition: "intact", access: "neutral", occupancy: "vacant" },
    { condition: "repaired", access: "neutral", occupancy: "vacant" },
    { condition: "damaged", access: "neutral", occupancy: "vacant" },
    { condition: "breached", access: "neutral", occupancy: "vacant" },
    { condition: "intact", access: "open", occupancy: "vacant" },
    { condition: "intact", access: "closed", occupancy: "vacant" },
    { condition: "intact", access: "neutral", occupancy: "occupied" },
    { condition: "abandoned", access: "neutral", occupancy: "vacant" },
  ];
  if (JSON.stringify(galleryReport.recipes) !== JSON.stringify(expectedRecipes)) {
    errors.push(`state recipe axes mismatch: ${JSON.stringify(galleryReport.recipes)}`);
  }
  const visualRequirements = {
    repaired: "repair-sister-plank-a",
    damaged: "damage-fallen-member",
    breached: "breach-rubble-1",
    closed: "closed-crossbar",
    occupied: "flame-layer-1",
    abandoned: "abandoned-growth-1-1",
  };
  galleryStates.forEach((state, index) => {
    const requiredName = visualRequirements[state];
    if (requiredName && !galleryReport.metrics[index]?.names?.includes(requiredName)) {
      errors.push(`${state}: missing strong visual signifier ${requiredName}`);
    }
  });
  const openMetric = galleryReport.metrics[galleryStates.indexOf("open")];
  if (!openMetric?.movable?.some((transform) => Math.abs(transform[1]) > 1)) {
    errors.push("open: closure did not rotate far enough to read as open");
  }
  if (stateErrors.length) errors.push(...stateErrors.map((message) => `state gallery: ${message}`));
  await statePage.screenshot({ path: stateOutput });
  if (!fs.existsSync(stateOutput) || fs.statSync(stateOutput).size < 100000) errors.push("state proof screenshot missing or suspiciously small");
  const partsPage = await browser.newPage();
  partsPage.setDefaultNavigationTimeout(120000);
  const partsErrors = [];
  partsPage.on("console", (message) => { if (message.type() === "error") partsErrors.push(message.text()); });
  partsPage.on("pageerror", (error) => partsErrors.push(error.message));
  await partsPage.goto(
    `http://127.0.0.1:${local.port}/dev/model-foundry/procedural-connective-parts-gallery.html`,
    { waitUntil: "domcontentloaded", timeout: 120000 },
  );
  await partsPage.waitForFunction(() => window.__proceduralPartsGalleryReady === true, { timeout: 120000 });
  const partsReport = await partsPage.evaluate(() => ({
    catalog: window.__proceduralPartsCatalog,
    objects: window.__proceduralPartsGallery.map((object) => {
      const meshNodes = [];
      object.updateWorldMatrix(true, true);
      object.traverse((node) => { if (node.isMesh) meshNodes.push(node); });
      const worldBox = (node) => {
        node.geometry.computeBoundingBox();
        const source = node.geometry.boundingBox;
        const minimum = source.min.clone().set(Infinity, Infinity, Infinity);
        const maximum = source.max.clone().set(-Infinity, -Infinity, -Infinity);
        for (const x of [source.min.x, source.max.x]) {
          for (const y of [source.min.y, source.max.y]) {
            for (const z of [source.min.z, source.max.z]) {
              const point = source.min.clone().set(x, y, z);
              node.localToWorld(point);
              minimum.min(point);
              maximum.max(point);
            }
          }
        }
        return { minimum, maximum };
      };
      const boxes = meshNodes.map((node) => ({ node, box: worldBox(node) }));
      const intersects = (a, b, epsilon = 0.004) => (
        a.minimum.x <= b.maximum.x + epsilon && a.maximum.x + epsilon >= b.minimum.x
        && a.minimum.y <= b.maximum.y + epsilon && a.maximum.y + epsilon >= b.minimum.y
        && a.minimum.z <= b.maximum.z + epsilon && a.maximum.z + epsilon >= b.minimum.z
      );
      const floating = boxes
        .filter((entry, index) => !boxes.some((other, otherIndex) => otherIndex !== index && intersects(entry.box, other.box)))
        .map((entry) => entry.node.name);
      return {
        kind: object.userData.genesisProceduralKit?.kind,
        meshes: meshNodes.length,
        sockets: object.userData.sockets?.length || 0,
        floating,
      };
    }),
  }));
  if (partsReport.catalog.length !== expected.parts || partsReport.objects.length !== expected.parts) {
    errors.push(`connective gallery expected ${expected.parts} parts, got ${partsReport.objects.length}`);
  }
  partsReport.objects.forEach((part) => {
    if (part.meshes < 1) errors.push(`${part.kind}: connective gallery object is empty`);
    if (part.sockets < 2) errors.push(`${part.kind}: expected at least two useful sockets`);
  });
  const connectivityTargets = new Set(["gear", "sprocket", "ratchet", "chain-guide", "fairlead", "shackle", "tensioner"]);
  partsReport.objects.filter((part) => connectivityTargets.has(part.kind)).forEach((part) => {
    if (part.floating.length) errors.push(`${part.kind}: disconnected mesh islands: ${part.floating.join(", ")}`);
  });
  if (partsErrors.length) errors.push(...partsErrors.map((message) => `parts gallery: ${message}`));
  await partsPage.screenshot({ path: partsOutput });
  if (!fs.existsSync(partsOutput) || fs.statSync(partsOutput).size < 100000) errors.push("connective-parts proof screenshot missing or suspiciously small");
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${report.objectCount} displayed objects; ${expected.parts} parts, ${expected.paths} paths, ${expected.effects} FX, ${expected.surfaces} surfaces, ${expected.containers} containers, ${expected.states} states, ${expected.channels} channels.`);
    console.log(output);
    console.log(stateOutput);
    console.log(partsOutput);
  }
} finally {
  await browser.close();
  if (local.proc) local.proc.kill("SIGTERM");
}
