#!/usr/bin/env node
/* CL-R1 persistent-lock verifier. It tests the authored JSON -> validated compile -> runtime recipe
   chain without a browser, then proves the bounded-light and visible-emitter failures are loud. */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;
let failed = 0;
function check(label, condition, detail) {
  if (condition) {
    passed++;
    console.log("  ✓", label);
  } else {
    failed++;
    console.error("  ✗", label, detail == null ? "" : "— " + JSON.stringify(detail));
  }
}
function runPython(args) {
  return spawnSync("python3", args, { cwd: ROOT, encoding: "utf8" });
}

const authoredPath = path.join(ROOT, "data/light-profile-locks.json");
const compiledPath = path.join(ROOT, "data/light-profile-locks.js");
const authored = JSON.parse(fs.readFileSync(authoredPath, "utf8"));

console.log("\n=== authored/compiled authority ===");
const current = runPython(["build/compile-light-locks.py", "--check"]);
check("1. authored JSON validates and compiled JS is current", current.status === 0, current.stderr || current.stdout);

const context = vm.createContext({ console });
vm.runInContext(fs.readFileSync(compiledPath, "utf8"), context, { filename: "data/light-profile-locks.js" });
vm.runInContext(fs.readFileSync(path.join(ROOT, "src/engine/light-recipes.js"), "utf8"), context,
  { filename: "src/engine/light-recipes.js" });
const runtime = vm.runInContext(`({
  keys:Object.keys(LIGHT_RECIPE_REGISTRY),
  rolled:Object.values(LIGHT_RECIPE_REGISTRY).filter(p=>p.rolled).map(p=>p.id),
  neutral:lightRecipeFor("clay-neutral-truth"),
  pair:lightRecipeFor("clay-opposing-pair"),
  torch:lightRecipeFor("torchlit"),
  legacy:CLAY_C1A_LIGHT_PROFILE
})`, context);
check("2. runtime registry has 10 world recipes and 2 diagnostics",
  runtime.keys.length === 12 && runtime.rolled.length === 10, runtime);
check("3. neutral, warm/cool, and fantasy torch modes are explicitly distinct",
  runtime.neutral.mode === "diagnostic-neutral"
    && runtime.pair.mode === "diagnostic-studio"
    && runtime.torch.mode === "production-practical"
    && runtime.torch.source.loreNative === true,
  { neutral: runtime.neutral.mode, pair: runtime.pair.mode, torch: runtime.torch.mode });
check("4. compatibility pair is projected from the same two locked lights",
  runtime.legacy.id === runtime.pair.id
    && runtime.legacy.points.length === 2
    && runtime.legacy.points[0].id === runtime.pair.lights[0].id
    && runtime.legacy.points[1].id === runtime.pair.lights[1].id);
check("5. runtime recipes are deeply frozen",
  vm.runInContext(`Object.isFrozen(LIGHT_RECIPE_REGISTRY)
    && Object.isFrozen(LIGHT_RECIPE_REGISTRY["clay-opposing-pair"])
    && Object.isFrozen(LIGHT_RECIPE_REGISTRY["clay-opposing-pair"].lights)`, context));
check("6. compiled recipes carry the complete per-recipe/per-light authoring contract",
  runtime.torch.toneMap.profile === "agx"
    && runtime.torch.spriteResponse.invariants.colorSpace === "srgb"
    && runtime.torch.lights[0].temperatureK === 1900
    && runtime.torch.lights[0].positionStrategy === "socket-relative"
    && runtime.torch.lights[0].rangeM === 36.576
    && runtime.torch.lights[0].falloff === 1.75
    && runtime.torch.lights[0].shadow.cast === true
    && runtime.torch.lights[0].shadow.mapSize === 512,
  runtime.torch);

console.log("\n=== red mutations ===");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "genesis-light-locks-"));
function mutationFails(name, mutate) {
  const bad = structuredClone(authored);
  mutate(bad);
  const source = path.join(tempDir, name + ".json");
  const output = path.join(tempDir, name + ".js");
  fs.writeFileSync(source, JSON.stringify(bad, null, 2));
  const result = runPython(["build/compile-light-locks.py", "--source", source, "--output", output]);
  return { failed: result.status !== 0, stderr: result.stderr, stdout: result.stdout };
}
const tooMany = mutationFails("too-many-lights", (lock) => {
  const light = lock.profiles["clay-opposing-pair"].lights[0];
  lock.profiles["clay-opposing-pair"].lights.push(
    { ...light, id: "extra-1" },
    { ...light, id: "extra-2" },
    { ...light, id: "extra-3" }
  );
});
check("7. a fifth light fails the bounded recipe compiler", tooMany.failed, tooMany);
const noEmitter = mutationFails("missing-emitter", (lock) => {
  delete lock.profiles.torchlit.lights[0].fixtureId;
});
check("8. a physical practical without a visible fixture fails", noEmitter.failed, noEmitter);
const notLoreNative = mutationFails("not-lore-native", (lock) => {
  lock.profiles.torchlit.source.loreNative = false;
});
check("9. a world physical practical that is not lore-native fails", notLoreNative.failed, notLoreNative);
const diagnosticEnteredWorld = mutationFails("diagnostic-entered-world", (lock) => {
  lock.profiles["clay-opposing-pair"].rolled = true;
});
check("10. the calibration bulbs cannot silently enter world-facing recipes",
  diagnosticEnteredWorld.failed, diagnosticEnteredWorld);
const wrongColorSpace = mutationFails("wrong-sprite-color-space", (lock) => {
  lock.defaults.profile.spriteResponse.invariants.colorSpace = "linear";
});
check("11. a deliberately wrong sprite colour-space mutation fails",
  wrongColorSpace.failed, wrongColorSpace);
const overpowered = mutationFails("overpowered-light", (lock) => {
  lock.profiles.torchlit.lights[0].physicalIntensity = 31;
});
check("12. an overpowered light beyond the Lab's declared bound fails",
  overpowered.failed, overpowered);

console.log(`\n${passed} passed, ${failed} failed`);
assert.equal(failed, 0);
