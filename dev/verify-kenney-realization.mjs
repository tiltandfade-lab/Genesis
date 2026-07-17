/* Verify KENNEY GRAPHICS REPAIR OPERATION KGR-5: exact runtime admission, deterministic additive
   realization, quarter-turn OBB SAT/wall erosion, fail-closed fallback, and legacy-first renderer. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
let passed = 0, failed = 0;
function ok(value, label) { if (value) { passed++; console.log("  ✓ " + label); } else { failed++; console.error("  FAIL: " + label); } }
function equal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function loadRuntime(overrides = {}) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  let registry = read("data/kenney-runtime-registry.js");
  if (overrides.registry) registry = overrides.registry(registry);
  let realization = read("src/engine/kenney-realization.js");
  if (overrides.realization) realization = overrides.realization(realization);
  let distribution = read("src/engine/place-distribution.js");
  if (overrides.distribution) distribution = overrides.distribution(distribution);
  vm.runInContext(read("src/engine/place-spatialize.js") + "\n" + read("src/engine/place-dressing.js") +
    "\n" + registry + "\n" + realization + "\n" + distribution + `
    this.__assets=KENNEY_RUNTIME_ASSETS; this.__rules=KENNEY_VISUAL_RULES;
    this.__registryHash=KENNEY_RUNTIME_REGISTRY_HASH;
    this.__realize=kenneyRealizePlan; this.__visual=kenneyVisualAssetFor;
    this.__wallSide=kenneyWallSideAt; this.__distribute=placeDistribute;
    this.__obbFor=pldObbFor; this.__obbOverlap=pldObbOverlaps;
    this.__radiusOn=pldObbRadiusOnAxis; this.__clearWalls=pldObbClearsWalls;
    this.__entryOverlap=pldEntriesOverlap; this.__flag=ROOM_PLACE_DISTRIBUTE;
  `, sandbox);
  return sandbox;
}

console.log("\n[1 — exact generated admission and stale/hash fail-closed]");
const check = spawnSync("python3", ["build/gen-kenney-runtime-registry.py", "--check"], { cwd: ROOT, encoding: "utf8" });
ok(check.status === 0, "generator --check is clean");
const rt = loadRuntime();
const exactIds = [
  "kenney-retro-fantasy-kit/detail-barrel", "kenney-pirate-kit/crate", "kenney-pirate-kit/chest",
  "kenney-furniture-kit/tableRound", "kenney-furniture-kit/benchCushionLow", "kenney-furniture-kit/chair",
  "kenney-furniture-kit/lampWall", "kenney-furniture-kit/lampRoundFloor",
  "kenney-fantasy-town-kit/lantern", "kenney-factory-kit/lever-double",
].sort();
ok(equal(Object.keys(rt.__assets).sort(), exactIds), "registry contains exactly the ten approved-runtime pilots");
ok(Object.values(rt.__assets).every((a) => a.qaStatus === "approved-runtime" && /^[0-9a-f]{64}$/.test(a.sourceSha256)),
  "every runtime entry is approved and source-hash-bound");
const stale = loadRuntime({ registry: (src) => src.replaceAll('"qaStatus": "approved-runtime"', '"qaStatus": "approved-dev"') });
ok(stale.__visual({ slug:"fantasy-clutter-emptybarrel", sourceRef:"stale" }, { realmId:"fantasy" }) === null,
  "⊗ non-runtime candidate fails closed");

console.log("\n[2 — first-match deterministic additive realization]");
const barrel = { slug:"fantasy-clutter-emptybarrel", x:3, y:4, primary:"floor", cardKind:"medium",
  roomSegNum:7, sourceRef:"S7.dressing", role:"dressing", count:2 };
const before = JSON.parse(JSON.stringify(barrel));
const first = rt.__realize({ dressing:[barrel] }, { realmId:"fantasy" }).dressing[0];
const second = rt.__realize({ dressing:[JSON.parse(JSON.stringify(barrel))] }, { realmId:"fantasy" }).dressing[0];
ok(first.visualAsset && first.visualAsset.assetId === "kenney-retro-fantasy-kit/detail-barrel", "exact slug rule resolves the barrel pilot");
ok(first.visualAsset.resolutionRule === "fantasy-emptybarrel", "first matching rule wins");
ok(equal(first, second), "same sourceRef/rule/registry produces byte-identical visualAsset");
const objectRef = { kind:"rolled-field", fieldPath:"segments.s7.feature" };
const objectRefLight = rt.__visual({ realmPropName:"Signal Lamp", primary:"floor", sourceRef:objectRef }, { realmId:"fantasy" });
const floorLightIds = Object.values(rt.__assets)
  .filter((asset) => ["lantern","lamp-floor","lamp-wall"].includes(asset.family) && asset.sockets.some((s) => s.type === "floor-mount"))
  .map((asset) => asset.assetId).sort();
const objectRefHash = rt.kenneyHashStr(JSON.stringify(objectRef) + "|realm-prop-light|" + rt.__registryHash);
ok(objectRefLight.assetId === floorLightIds[objectRefHash % floorLightIds.length],
  "structured sourceRef hashes its deterministic JSON value, not a collapsed object string");
const canonicalKeys = ["slug","sourceRef","role","count","roomSegNum","x","y","primary","cardKind"];
ok(canonicalKeys.every((key) => equal(first[key], before[key])), "visual realization changes no canonical field");
const unmatched = { slug:"fantasy-flora-roots", x:1, y:2, sourceRef:"S1.roots" };
const unmatchedPlan = { dressing:[unmatched] };
ok(rt.__realize(unmatchedPlan, { realmId:"fantasy" }) === unmatchedPlan, "unmatched noun returns the old visual path unchanged");
let randomCalls = 0;
const savedRandom = Math.random;
Math.random = () => { randomCalls++; return 0.5; };
rt.__realize({ dressing:[barrel] }, { realmId:"fantasy" });
Math.random = savedRandom;
ok(randomCalls === 0, "realization consumes no global RNG stream");
const reversed = loadRuntime({ realization: (src) => src.replace("KENNEY_VISUAL_RULES.find((candidate) => kenneyRuleMatches(entry, candidate))",
  "KENNEY_VISUAL_RULES.slice().reverse().find((candidate) => kenneyRuleMatches(entry, candidate))") });
const multi = { slug:"fantasy-clutter-emptybarrel", realmPropName:"Powder Barrel", sourceRef:"multi" };
ok(reversed.__visual(multi, { realmId:"fantasy" }).resolutionRule !== rt.__visual(multi, { realmId:"fantasy" }).resolutionRule,
  "⊗ reversing first-match order changes the winner (order gate is load-bearing)");

console.log("\n[3 — single wall authority and quarter-turn wall yaw]");
const W=2, F=1;
const wallPlan = { cellW:5, cellD:5, cells:new Array(25).fill(F) };
wallPlan.cells[1 * 5 + 2] = W;
ok(rt.__wallSide(2, 2, wallPlan) === "n", "engine wall-side authority names the north wall");
const wallEntry = { slug:"fantasy-clutter-lanternhook", x:2, y:2, primary:"wall-hang", sourceRef:"wall-lamp" };
const wallAsset = rt.__visual(wallEntry, { realmId:"fantasy", plan:wallPlan });
ok(wallAsset && wallAsset.mountSocket === "wall-mount" && wallAsset.wallSide === "n" && wallAsset.yawRadians === 0,
  "wall mount derives socket/yaw from the shared stamped side");
const interiorSrc = read("src/ui/theater-interior.js");
ok(/function itrWallSideAt\(x, y, plan\) \{\s*return typeof kenneyWallSideAt/.test(interiorSrc),
  "theater-interior delegates to the one engine wall authority");
const brokenDelegate = interiorSrc.replace("typeof kenneyWallSideAt === \"function\" ? kenneyWallSideAt(x, y, plan) : null", "null");
ok(!/function itrWallSideAt\(x, y, plan\) \{\s*return typeof kenneyWallSideAt/.test(brokenDelegate),
  "⊗ removing the delegate makes the parity guard red");

console.log("\n[4 — OBB SAT beats circle proxy; quarter-turn erosion]");
function visualEntry(halfExtents, yaw, cardKind) {
  return { cardKind, visualAsset:{ yawRadians:yaw, footprint:{ center:[0,0], halfExtents, yawRadians:0 } } };
}
const table = visualEntry([0.6,0.25], 0, "large");
const chair = visualEntry([0.15,0.15], 0, "small");
const tableBody = { entry:table, x:0, y:0, radius:0.70 };
const chairBody = { entry:chair, x:0.80, y:0, radius:0.28 };
ok(Math.hypot(0.8,0) < 0.70 + 0.28, "circle proxy reports the long table/chair pair overlapping");
ok(rt.__entryOverlap(tableBody, chairBody) === false, "OBB SAT separates the same long table/chair pair");
const circleMutation = loadRuntime({ distribution: (src) => src.replace(
  "if (aObb && bObb) return pldObbOverlaps(aObb, bObb);",
  "if (aObb && bObb) return pldDist(a, b) < a.radius + b.radius;") });
ok(circleMutation.__entryOverlap(tableBody, chairBody) === true, "⊗ replacing SAT with cardKind circles makes the fixture red");
const long0 = rt.__obbFor(visualEntry([1,0.25],0,"large"),0,0);
const long90 = rt.__obbFor(visualEntry([1,0.25],Math.PI/2,"large"),0,0);
ok(Math.abs(rt.__radiusOn(long0,{x:1,y:0})-1)<1e-9 && Math.abs(rt.__radiusOn(long90,{x:1,y:0})-0.25)<1e-9,
  "PI/2 swaps a 2x0.5 footprint's projected half-extents");
const erosionPlan = { cellW:3, cellD:3, cells:new Array(9).fill(F) };
erosionPlan.cells[1*3+2]=W;
ok(rt.__clearWalls(visualEntry([0.6,0.2],0,"large"), {x:1,y:1}, {x:1,y:1}, erosionPlan) === false &&
   rt.__clearWalls(visualEntry([0.6,0.2],Math.PI/2,"large"), {x:1,y:1}, {x:1,y:1}, erosionPlan) === true,
  "quarter-turn changes wall eligibility via projected half-extent");

console.log("\n[5 — distribution flip, containment, and fallback-overlap]");
ok(rt.__flag === true, "ROOM_PLACE_DISTRIBUTE is enabled only with the KGR-5 fixture suite present");
const cramped = { seed:"cramped", cellW:3, cellD:3, cells:[W,W,W,W,F,W,W,W,W],
  rooms:[{segNum:1,x:1,y:1,w:1,d:1}], dressing:[Object.assign({}, barrel,{x:1,y:1,roomSegNum:1})] };
const crampedRealized = rt.__realize(cramped,{realmId:"fantasy"});
const crampedOut = rt.__distribute(crampedRealized,{walkId:"cramped"}).dressing[0];
ok(crampedOut.x === 1 && crampedOut.y === 1 && crampedOut.visualAsset.placementStatus === "fallback-overlap",
  "no legal placement retains canonical anchor and marks fallback-overlap");
const distributedA = rt.__distribute({ seed:"wide", cellW:7, cellD:7, cells:new Array(49).fill(F),
  rooms:[{segNum:1,x:0,y:0,w:7,d:7}], dressing:[Object.assign({}, first,{x:0,y:0,roomSegNum:1})] },{walkId:"walk-1"});
const distributedB = rt.__distribute({ seed:"wide", cellW:7, cellD:7, cells:new Array(49).fill(F),
  rooms:[{segNum:1,x:0,y:0,w:7,d:7}], dressing:[Object.assign({}, first,{x:0,y:0,roomSegNum:1})] },{walkId:"walk-1"});
ok(equal(distributedA,distributedB), "same walk/source refs produce byte-identical realized positions");

console.log("\n[6 — production ordering and legacy-first async renderer]");
const theaterData = read("src/engine/theater-data.js");
ok(theaterData.indexOf("dressedPlan = kenneyRealizePlan") < theaterData.indexOf("dressedPlan = placeDistribute"),
  "theater-data stamps visualAsset before distribution");
const boot = read("src/ui/theater-boot.js");
ok(boot.indexOf("const kenneyProp = kenneyDonorMountFor") < boot.indexOf("if(p.slug && !p.part && !p.model)"),
  "board prop donor attempt precedes the old visual fallback");
ok(boot.indexOf("const donor = kenneyDonorMountFor(d, donorTarget") < boot.indexOf("const g = buildDressingCard(d)"),
  "interior donor attempt precedes the old dressing card fallback");
const donorMountSrc = boot.slice(boot.indexOf("function kenneyDonorMountFor"), boot.indexOf("// test-seam bridge", boot.indexOf("function kenneyDonorMountFor")));
ok(/if\(!tmpl \|\| !tmpl\.group\) return null;/.test(donorMountSrc) &&
   /if\(!socket\) return null;/.test(donorMountSrc) && /visualAsset\.placementStatus === "fallback-overlap"/.test(donorMountSrc) &&
   !/set(?:Interior)?Board\(/.test(donorMountSrc),
  "cold cache, invalid socket, and overlap return null without scheduling a replay");
const donorCacheSrc = boot.slice(boot.indexOf("function donorTemplateFor"), boot.indexOf("function donorSocketForVisualAsset"));
ok(/if\(S\.lastBoard\.kind === "interior3d"\) setInteriorBoard\(S\.lastBoard\);/.test(donorCacheSrc),
  "successful donor load replays an interior board through setInteriorBoard");
ok(/else setBoard\(S\.lastBoard\);/.test(donorCacheSrc),
  "successful donor load replays a flat board through setBoard");
const failureBranch = donorCacheSrc.match(/\.catch\(\(\) => \{([^}]*)\}/);
ok(failureBranch && /delete DONOR_TEMPLATE_CACHE\[key\]/.test(failureBranch[1]) && !/set(?:Interior)?Board\(/.test(failureBranch[1]),
  "donor load failure clears the cache and schedules no board replay");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
