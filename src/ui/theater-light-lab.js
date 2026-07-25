/* THEATER LIGHT LAB — LL-1, Adam's dev-only live lighting tool, extracted VERBATIM from
   src/ui/theater-boot.js in split step B2 (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md).

   OWNERSHIP: the lab DOM panel + its S.lightLab* bookkeeping and teardown (unmountLightLab).
   Zero cost when off — one memoized boolean read per frame in the root's renderTheaterFrame
   poll, exactly as before the split. The lighting CONSTS the lab tunes (STAGE_AMBIENT_FLOOR,
   BLOOM_*, GRADE_*, ITR_* — the verify-light-lab scrape set) STAY in the root: the lab is the
   UI over LIGHT_TUNABLES, not the owner of the render-path values.

   CTX LAW (same shape as theater-clay-room.js): never imports the root; capabilities arrive
   once via lightLabInit(ctx) into the module-local mirrors below (bodies stay byte-identical),
   S re-syncs via lightLabSyncState(S) at the root's S-reassignment sites, GRADE_TONEMAP stays
   root-owned behind labCtxGetGradeTonemap. The region's top-level window.Theater seam
   assignments moved INSIDE lightLabPublishSeams() — module eval runs before the root creates
   the facade; the root calls publish at its end-of-body, so every seam is live by page-ready
   exactly as before (the surface gate proves the 219-key set). */
import { clayRoomSetLightingRecipe } from "./theater-clay-room.js";

// ---- root-capability mirrors (wired once by lightLabInit; S re-synced by lightLabSyncState) ----
let S;
let labCtxGetGradeTonemap;
let applyCelestialArc, applyLightProfile, markDirty, mount, mountPostSuite;
let renderTheaterFrame, retire, scheduleRender, setBoard, setInteriorBoard;
let updatePostSuiteGrade, CELESTIAL_ARC, LIGHT_DEFAULT_PROFILE, LIGHT_LAB_AUTHORED_BASELINE, LIGHT_PROFILES;
let LIGHT_TUNABLES, STAGE_AMBIENT_FLOOR;

export function lightLabInit(ctx){
  ({ applyCelestialArc,
    applyLightProfile,
    markDirty,
    mount,
    mountPostSuite,
    renderTheaterFrame,
    retire,
    scheduleRender,
    setBoard,
    setInteriorBoard,
    updatePostSuiteGrade,
    CELESTIAL_ARC,
    LIGHT_DEFAULT_PROFILE,
    LIGHT_LAB_AUTHORED_BASELINE,
    LIGHT_PROFILES,
    LIGHT_TUNABLES,
    STAGE_AMBIENT_FLOOR } = ctx);
  S = ctx.S;
  labCtxGetGradeTonemap = ctx.labCtxGetGradeTonemap;
}
export function lightLabSyncState(nextS){ S = nextS; }

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   LL-1 (docs/KENNEY-SOCKET-WAVE.md unit LL-1) — LIGHT-LAB: Adam's dev-only tool for ruling the
   environment AND how sprites react to light, live. Plain DOM, zero dependencies, zero cost when off
   (ZERO DOM nodes built, ZERO listeners attached, and the ONLY per-frame cost is the one boolean flag
   check `renderTheaterFrame` already does — see lightLabMaybeAutoMount's own call site there). Every
   slider here writes through the SAME LIGHT_TUNABLES seam the render call sites already read (their
   own headers document the byte-identical-when-untouched contract) — the lab never writes source, it
   only ever mutates that one in-memory object; EXPORT hands the CURRENT values to Adam as JSON, and
   `build/fold-lightlab.py` (a separate, offline step Adam runs by hand) folds an exported file back
   into the named consts themselves — "sliders never write code directly," per the unit's own law.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

// get/set through the SAME dotted-path vocabulary the schema below uses. "profile.<field>" resolves
// against LIGHT_TUNABLES.profiles[<the profile currently selected in the lab>] (defaults to whatever's
// actually live, S.lightProfileKey) rather than a fixed key — the lab edits "the profile you're
// looking at," and the dropdown (buildLightLabDom, below) is what changes which one that is.
function lightLabNestedTarget(root, relative, meta){
  const parts = relative.split(".");
  let obj = root;
  for(let i = 0; i < parts.length - 1; i++){
    if(!obj || typeof obj !== "object"){
      return Object.assign({ obj: null, field: parts[parts.length - 1] }, meta || {});
    }
    obj = obj[parts[i]];
  }
  return Object.assign({ obj, field: parts[parts.length - 1] }, meta || {});
}
function lightLabResolveTarget(path){
  if(path.indexOf("profile.") === 0){
    const key = (S.lightLabProfileKey && LIGHT_TUNABLES.profiles[S.lightLabProfileKey]) ? S.lightLabProfileKey
      : (S.lightProfileKey || LIGHT_DEFAULT_PROFILE);
    const profile = LIGHT_TUNABLES.profiles[key];
    const relative = path.slice("profile.".length);
    if(relative.indexOf("light.") === 0){
      const index = Math.max(0, Math.min(
        Number.isInteger(S.lightLabLightIndex) ? S.lightLabLightIndex : 0,
        Math.max(0, (profile.lights || []).length - 1)
      ));
      return lightLabNestedTarget(
        (profile.lights || [])[index],
        relative.slice("light.".length),
        { profileKey: key, lightIndex: index }
      );
    }
    return lightLabNestedTarget(profile, relative, { profileKey: key });
  }
  if(path.indexOf("celestialArc.") === 0){
    return lightLabNestedTarget(LIGHT_TUNABLES.celestialArc, path.slice("celestialArc.".length));
  }
  return lightLabNestedTarget(LIGHT_TUNABLES, path);
}
function getLightTunable(path){
  const t = lightLabResolveTarget(path);
  return t.obj ? t.obj[t.field] : undefined;
}
// Re-applies whatever's currently mounted so a set() is visible without a page reload — "drag ->
// re-render." Replays the last board payload (setBoard/setInteriorBoard already funnel EVERY lighting
// call — applyLightProfile, applyCelestialArc, the ITR_* brightness-law block — through themselves, so
// a full replay is the one place guaranteed to pick up any tunable's new value correctly, at the cost
// of a real rebuild rather than a bare uniform poke). Grade/bloom dials are ALSO pushed directly onto
// the live pass (mountPostSuite's own updatePostSuiteGrade does this too, redundantly-but-harmlessly,
// on the interior path — this covers the tabletop path, where postSuite may be stale/unmounted).
function lightLabApplyTunables(){
  if(!S.mounted) return;
  if(S.clayRoomMounted && S.clayRoomLightRecipeId){
    clayRoomSetLightingRecipe(S.clayRoomLightRecipeId, "light-lab-tunable");
  } else if(S.lastBoard){
    if(S.isInteriorBoard) setInteriorBoard(S.lastBoard);
    else setBoard(S.lastBoard);
  } else if(S.lightProfileKey){
    applyLightProfile(S.lightProfileKey); // pre-setBoard/mount-time baseline (no board yet)
  }
  const activeRecipe = LIGHT_TUNABLES.profiles[
    (S.clayRoomMounted && S.clayRoomLightRecipeId) || S.lightLabProfileKey || S.lightProfileKey
  ];
  if(activeRecipe && activeRecipe.toneMap && activeRecipe.toneMap.profile !== labCtxGetGradeTonemap()){ // split B2: GRADE_TONEMAP is a root-owned live flag (facade setter writes it) — accessor, not a stale mirror
    window.Theater._setGradeTonemapForTest(activeRecipe.toneMap.profile);
  }
  if(S.postSuite){
    S.postSuite.grade.uniforms.uExposureFloor.value = activeRecipe
      ? activeRecipe.exposureFloor : LIGHT_TUNABLES.gradeExposureFloor;
    if(S.postSuite.grade.uniforms.uTonemapStrength){
      S.postSuite.grade.uniforms.uTonemapStrength.value = activeRecipe
        ? activeRecipe.toneMap.strength : 1;
    }
    if(S.postSuite.bloom){
      S.postSuite.bloom.threshold = activeRecipe
        ? activeRecipe.bloom.threshold : LIGHT_TUNABLES.bloomThreshold;
      S.postSuite.bloom.strength = activeRecipe
        ? activeRecipe.bloom.strength : LIGHT_TUNABLES.bloomStrength;
    }
  }
  markDirty();
  scheduleRender();
}
function setLightTunable(path, value){
  const t = lightLabResolveTarget(path);
  if(!t.obj || !(t.field in t.obj)) return false;
  S.lightLabUndo.push(lightRecipeDeepClone(LIGHT_TUNABLES));
  if(S.lightLabUndo.length > 60) S.lightLabUndo.shift();
  S.lightLabRedo = [];
  t.obj[t.field] = value;
  if(t.profileKey && t.lightIndex != null){
    const light = LIGHT_TUNABLES.profiles[t.profileKey].lights[t.lightIndex];
    if(path === "profile.light.color") light.colorOverride = true;
    if((path === "profile.light.temperatureK" || path === "profile.light.colorOverride")
      && light.colorOverride === false){
      light.color = lightRecipeKelvinColor(light.temperatureK);
    }
  }
  const selectedProfileKey = (S.lightLabProfileKey && LIGHT_TUNABLES.profiles[S.lightLabProfileKey])
    ? S.lightLabProfileKey : (S.lightProfileKey || LIGHT_DEFAULT_PROFILE);
  const selectedProfile = LIGHT_TUNABLES.profiles[selectedProfileKey];
  if(path === "profile.exposureFloor") LIGHT_TUNABLES.gradeExposureFloor = value;
  if(path === "profile.bloom.threshold") LIGHT_TUNABLES.bloomThreshold = value;
  if(path === "profile.bloom.strength") LIGHT_TUNABLES.bloomStrength = value;
  if(path === "profile.spriteResponse.emissiveFloor") LIGHT_TUNABLES.spriteEmissiveFloor = value;
  if(path === "gradeExposureFloor" && selectedProfile) selectedProfile.exposureFloor = value;
  if(path === "bloomThreshold" && selectedProfile) selectedProfile.bloom.threshold = value;
  if(path === "bloomStrength" && selectedProfile) selectedProfile.bloom.strength = value;
  if(path === "spriteEmissiveFloor" && selectedProfile) selectedProfile.spriteResponse.emissiveFloor = value;
  const profile = t.profileKey ? LIGHT_TUNABLES.profiles[t.profileKey] : null;
  if(profile){
    const report = lightRecipeValidate(profile);
    if(!report.ok){
      const prior = S.lightLabUndo.pop();
      lightLabReplaceTunables(prior);
      return false;
    }
  }
  S.lightLabDirty = true;
  lightLabApplyTunables();
  return true;
}
function lightLabReplaceTunables(snapshot){
  if(!snapshot || typeof snapshot !== "object") return false;
  Object.keys(LIGHT_TUNABLES).forEach((key) => { delete LIGHT_TUNABLES[key]; });
  Object.assign(LIGHT_TUNABLES, lightRecipeDeepClone(snapshot));
  return true;
}
function lightLabResetAuthored(){
  S.lightLabUndo.push(lightRecipeDeepClone(LIGHT_TUNABLES));
  if(S.lightLabUndo.length > 60) S.lightLabUndo.shift();
  S.lightLabRedo = [];
  lightLabReplaceTunables(LIGHT_LAB_AUTHORED_BASELINE);
  S.lightLabDirty = false;
  lightLabApplyTunables();
  return true;
}
function lightLabUndo(){
  if(!S.lightLabUndo.length) return false;
  S.lightLabRedo.push(lightRecipeDeepClone(LIGHT_TUNABLES));
  lightLabReplaceTunables(S.lightLabUndo.pop());
  S.lightLabDirty = JSON.stringify(LIGHT_TUNABLES) !== JSON.stringify(LIGHT_LAB_AUTHORED_BASELINE);
  lightLabApplyTunables();
  return true;
}
function lightLabRedo(){
  if(!S.lightLabRedo.length) return false;
  S.lightLabUndo.push(lightRecipeDeepClone(LIGHT_TUNABLES));
  lightLabReplaceTunables(S.lightLabRedo.pop());
  S.lightLabDirty = JSON.stringify(LIGHT_TUNABLES) !== JSON.stringify(LIGHT_LAB_AUTHORED_BASELINE);
  lightLabApplyTunables();
  return true;
}
// window.Theater._lightLabSetTunable/_lightLabGetTunable — the SAME function every DOM slider's own
// oninput handler calls (buildLightLabDom, below binds through these, never a second code path) — a
// scripted probe drives this seam directly, so "does the slider work" and "does this function work"
// are the same question by construction, not two independently-maintained proofs.

// The flat probe/UI manifest — one entry per bindable tunable. `group:"profile"` entries are relative
// to whichever profile the lab's dropdown currently has selected (lightLabResolveTarget's own "profile."
// prefix); every other entry is a direct LIGHT_TUNABLES (or LIGHT_TUNABLES.celestialArc) property.
const LIGHT_TUNABLE_SCHEMA = [
  { path: "profile.ambient.intensity", label: "Ambient intensity (fill)", type: "range", min: 0, max: 1.5, step: 0.01, group: "profile" },
  { path: "profile.ambient.color", label: "Ambient color (fill)", type: "color", group: "profile" },
  { path: "profile.exposureFloor", label: "Recipe exposure floor", type: "range", min: 0, max: 0.3, step: 0.005, group: "profile" },
  { path: "profile.toneMap.profile", label: "Tone-map profile", type: "select", options: ["agx", "none"], group: "profile" },
  { path: "profile.toneMap.strength", label: "Tone-map strength", type: "range", min: 0, max: 1, step: 0.01, group: "profile" },
  { path: "profile.bloom.threshold", label: "Recipe bloom threshold", type: "range", min: 0, max: 2, step: 0.01, group: "profile" },
  { path: "profile.bloom.strength", label: "Recipe bloom strength", type: "range", min: 0, max: 3, step: 0.05, group: "profile" },
  { path: "profile.spriteResponse.emissiveFloor", label: "Recipe sprite readability", type: "range", min: 0, max: 0.3, step: 0.005, group: "profile" },
  { path: "profile.light.enabled", label: "Fixture enabled", type: "checkbox", group: "light" },
  { path: "profile.light.state", label: "Local light state", type: "select", options: ["steady", "flickering"], group: "light" },
  { path: "profile.light.type", label: "Light type", type: "select", options: ["point", "spot", "directional", "environment"], group: "light" },
  { path: "profile.light.temperatureK", label: "Temperature (Kelvin)", type: "range", min: 1000, max: 20000, step: 100, group: "light" },
  { path: "profile.light.colorOverride", label: "Exact color override", type: "checkbox", group: "light" },
  { path: "profile.light.intensity", label: "Tabletop intensity", type: "range", min: 0, max: 30, step: 0.5, group: "light" },
  { path: "profile.light.physicalIntensity", label: "Physical fixture intensity", type: "range", min: 0, max: 30, step: 0.25, group: "light" },
  { path: "profile.light.color", label: "Light color", type: "color", group: "light" },
  { path: "profile.light.positionStrategy", label: "Position strategy", type: "select", options: ["board-relative", "socket-relative"], group: "light" },
  { path: "profile.light.pos.x", label: "Board position X", type: "range", min: -4, max: 8, step: 0.05, group: "light" },
  { path: "profile.light.pos.y", label: "Board position Y", type: "range", min: -4, max: 8, step: 0.05, group: "light" },
  { path: "profile.light.pos.z", label: "Board position Z", type: "range", min: -4, max: 8, step: 0.05, group: "light" },
  { path: "profile.light.rangeM", label: "Range (metres)", type: "range", min: 0, max: 60, step: 0.25, group: "light" },
  { path: "profile.light.heightM", label: "Source height (metres)", type: "range", min: 0, max: 8, step: 0.05, group: "light" },
  { path: "profile.light.falloff", label: "Physical falloff", type: "range", min: 0, max: 2, step: 0.05, group: "light" },
  { path: "profile.light.azimuthDeg", label: "Azimuth (degrees)", type: "range", min: -360, max: 360, step: 1, group: "light" },
  { path: "profile.light.elevationDeg", label: "Elevation (degrees)", type: "range", min: -90, max: 90, step: 1, group: "light" },
  { path: "profile.light.spot.coneDeg", label: "Spot cone (degrees)", type: "range", min: 1, max: 179, step: 1, group: "light" },
  { path: "profile.light.spot.penumbra", label: "Spot penumbra", type: "range", min: 0, max: 1, step: 0.01, group: "light" },
  { path: "profile.light.shadow.cast", label: "Cast shadow", type: "checkbox", group: "light" },
  { path: "profile.light.shadow.bias", label: "Shadow bias", type: "range", min: -0.1, max: 0.1, step: 0.0005, group: "light" },
  { path: "profile.light.shadow.normalBias", label: "Shadow normal bias", type: "range", min: 0, max: 1, step: 0.005, group: "light" },
  { path: "profile.light.shadow.mapSize", label: "Shadow map size", type: "select-number", options: [256, 512, 1024, 2048], group: "light" },
  { path: "profile.light.shadow.budgetPriority", label: "Shadow budget priority", type: "range", min: 0, max: 3, step: 1, group: "light" },
  { path: "profile.light.flicker.amplitude", label: "Flicker amplitude", type: "range", min: 0, max: 0.5, step: 0.01, group: "light" },
  { path: "profile.light.flicker.cadenceMs", label: "Flicker cadence (ms)", type: "range", min: 100, max: 5000, step: 20, group: "light" },
  { path: "profile.light.flicker.intervalJitter", label: "Flicker interval variation", type: "range", min: 0, max: 0.9, step: 0.01, group: "light" },
  { path: "profile.light.flicker.directionAmplitude", label: "Flame direction dance", type: "range", min: 0, max: 0.08, step: 0.001, group: "light" },
  { path: "profile.light.fixtureId", label: "Physical fixture id", type: "text", group: "light" },
  { path: "profile.light.mount", label: "Mount socket", type: "select", options: ["none", "floor", "wall", "ceiling"], group: "light" },
  { path: "profile.light.emitterLocal.x", label: "Emitter local X", type: "range", min: -4, max: 4, step: 0.01, group: "light" },
  { path: "profile.light.emitterLocal.y", label: "Emitter local Y", type: "range", min: -4, max: 4, step: 0.01, group: "light" },
  { path: "profile.light.emitterLocal.z", label: "Emitter local Z", type: "range", min: -4, max: 4, step: 0.01, group: "light" },
  { path: "stageAmbientFloor", label: "Stage ambient floor (STAGE_AMBIENT_FLOOR)", type: "range", min: 0, max: 1, step: 0.01, group: "global" },
  { path: "gradeExposureFloor", label: "Exposure floor, pre-AgX (ledger #12/13)", type: "range", min: 0, max: 0.3, step: 0.005, group: "global" },
  { path: "bloomThreshold", label: "Bloom threshold (linear)", type: "range", min: 0, max: 2, step: 0.01, group: "global" },
  { path: "bloomStrength", label: "Bloom strength", type: "range", min: 0, max: 3, step: 0.05, group: "global" },
  { path: "gradeTintScale", label: "Per-realm grade strength (tint scale)", type: "range", min: 0, max: 1.5, step: 0.01, group: "global" },
  { path: "gradeTintMax", label: "Grade tint hard cap", type: "range", min: 0, max: 0.5, step: 0.01, group: "global" },
  { path: "celestialArc.SUNRISE_MIN", label: "Sunrise (min-of-day)", type: "range", min: 0, max: 720, step: 5, group: "celestial" },
  { path: "celestialArc.SUNSET_MIN", label: "Sunset (min-of-day)", type: "range", min: 720, max: 1440, step: 5, group: "celestial" },
  { path: "celestialArc.MIN_ELEV_ANGLE", label: "Min elevation angle (rad)", type: "range", min: 0, max: 1, step: 0.01, group: "celestial" },
  { path: "celestialArc.OVERCAST_DESAT", label: "Overcast desaturation", type: "range", min: 0, max: 1, step: 0.01, group: "celestial" },
  { path: "celestialArc.OVERCAST_SHADOW_DAMP", label: "Overcast shadow damp", type: "range", min: 0, max: 1, step: 0.01, group: "celestial" },
  { path: "spriteEmissiveFloor", label: "Sprite readability floor", type: "range", min: 0, max: 0.3, step: 0.005, group: "sprite" },
  { path: "sceneAmbient", label: "Dark-corner cap (interior scene ambient)", type: "range", min: 0, max: 0.5, step: 0.005, group: "sprite" },
  { path: "lightRenderGain", label: "Torch-pool band (fixture render gain)", type: "range", min: 0, max: 10, step: 0.1, group: "sprite" },
];

function lightLabColorToHexStr(v){
  const n = (typeof v === "number") ? v : 0;
  return "#" + n.toString(16).padStart(6, "0");
}
function lightLabHexStrToNum(s){
  return parseInt(String(s).replace("#", ""), 16) || 0;
}

// EXPORT: the current LIGHT_TUNABLES values, JSON-serializable, colors as "0xRRGGBB" strings (matching
// the source's own hex-literal style so build/fold-lightlab.py can write them back verbatim rather
// than reformatting). "sliders never write code" — this is a snapshot handed to Adam; folding it back
// into the named consts is the SEPARATE, explicit, offline build/fold-lightlab.py step.
function lightLabExportJSON(){
  const hex = (n) => "0x" + (((typeof n === "number") ? n : 0).toString(16).padStart(6, "0"));
  const profiles = {};
  for(const key in LIGHT_TUNABLES.profiles){
    const p = LIGHT_TUNABLES.profiles[key];
    profiles[key] = lightRecipeDeepClone(p);
    profiles[key].ambient.color = hex(p.ambient.color);
    profiles[key].lights.forEach((light, index) => {
      light.color = hex(p.lights[index].color);
    });
  }
  return {
    kind: "light-profile-lock-set",
    schemaVersion: LIGHT_RECIPE_LOCK_SCHEMA_VERSION,
    id: LIGHT_PROFILE_LOCKS_COMPILED.id,
    version: LIGHT_PROFILE_LOCKS_COMPILED.version,
    settings: {
      stageAmbientFloor: LIGHT_TUNABLES.stageAmbientFloor,
      gradeExposureFloor: LIGHT_TUNABLES.gradeExposureFloor,
      bloomThreshold: LIGHT_TUNABLES.bloomThreshold,
      bloomStrength: LIGHT_TUNABLES.bloomStrength,
      gradeTintScale: LIGHT_TUNABLES.gradeTintScale,
      gradeTintMax: LIGHT_TUNABLES.gradeTintMax,
      celestialArc: Object.assign({}, LIGHT_TUNABLES.celestialArc),
      spriteEmissiveFloor: LIGHT_TUNABLES.spriteEmissiveFloor,
      sceneAmbient: LIGHT_TUNABLES.sceneAmbient,
      lightRenderGain: LIGHT_TUNABLES.lightRenderGain,
    },
    profiles,
  };
}

// Activation check: `?lightlab=1` in the URL OR `window.GS.lightLabEnabled === true` (console-settable
// at ANY time post-boot — Adam types `GS.lightLabEnabled = true` in devtools, no reload —
// lightLabMaybeAutoMount's own per-frame poll, below, is what notices the flag flip without a
// dedicated listener/timer). The URL check parses `location.search` — real work, so it's memoized into
// LIGHT_LAB_URL_FLAG on the FIRST call and never repeated; every frame after that is a true single
// boolean property read (`window.GS.lightLabEnabled`) plus one cached-boolean compare, matching the
// unit's own "no per-frame reads beyond one boolean" law.
let LIGHT_LAB_URL_FLAG = null;
function lightLabShouldEnable(){
  try {
    if(typeof window === "undefined") return false;
    if(window.GS && window.GS.lightLabEnabled === true) return true;
    if(LIGHT_LAB_URL_FLAG === null){
      LIGHT_LAB_URL_FLAG = !!(window.location && window.location.search
        && new URLSearchParams(window.location.search).get("lightlab") === "1");
    }
    return LIGHT_LAB_URL_FLAG;
  } catch(e){}
  return false;
}
// Called from renderTheaterFrame (the one render call site — BW3-0's own convention, reused here) —
// "no per-frame reads beyond one boolean" per the unit's own law: S.lightLabMounted is a plain boolean,
// lightLabShouldEnable() is a cheap property/URL check, and once mounted this function is a single
// truthy short-circuit (`if(S.lightLabMounted) return;`) for the rest of the session. Zero DOM, zero
// listeners, zero DOM until the flag actually flips true.
function lightLabMaybeAutoMount(){
  if(S.lightLabMounted) return;
  if(!lightLabShouldEnable()) return;
  mountLightLab();
}

function lightLabField(entry){
  const row = document.createElement("div");
  row.style.cssText = "display:flex;align-items:center;gap:6px;margin:3px 0;font:11px/1.3 monospace;color:#ddd;";
  const label = document.createElement("label");
  label.textContent = entry.label;
  label.title = entry.label + " (" + entry.path + ")"; // the panel's fixed width truncates long labels — full text + the raw tunable path on hover
  label.style.cssText = "flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
  row.appendChild(label);
  const valOut = document.createElement("span");
  valOut.style.cssText = "flex:0 0 48px;text-align:right;color:#9c9;";
  let input;
  if(entry.type === "checkbox"){
    input = document.createElement("input");
    input.type = "checkbox";
    input.checked = getLightTunable(entry.path) !== false;
    input.style.cssText = "flex:0 0 28px;height:16px;";
    valOut.textContent = input.checked ? "ON" : "OFF";
    input.addEventListener("change", () => {
      setLightTunable(entry.path, !!input.checked);
      valOut.textContent = input.checked ? "ON" : "OFF";
      lightLabRefreshReadouts();
    });
  } else if(entry.type === "color"){
    input = document.createElement("input");
    input.type = "color";
    input.style.cssText = "flex:0 0 28px;height:16px;border:none;padding:0;background:none;";
    const cur = getLightTunable(entry.path);
    input.value = lightLabColorToHexStr(cur);
    valOut.textContent = input.value;
    input.addEventListener("input", () => {
      const v = lightLabHexStrToNum(input.value);
      setLightTunable(entry.path, v);
      valOut.textContent = input.value;
      lightLabRefreshReadouts();
    });
  } else if(entry.type === "select" || entry.type === "select-number"){
    input = document.createElement("select");
    input.style.cssText = "flex:1 1 96px;min-width:0;background:#222;color:#eee;border:1px solid #444;";
    (entry.options || []).forEach((optionValue) => {
      const option = document.createElement("option");
      option.value = String(optionValue);
      option.textContent = String(optionValue);
      input.appendChild(option);
    });
    input.value = String(getLightTunable(entry.path));
    valOut.textContent = input.value;
    input.addEventListener("change", () => {
      const value = entry.type === "select-number" ? Number(input.value) : input.value;
      setLightTunable(entry.path, value);
      valOut.textContent = input.value;
      lightLabRefreshReadouts();
    });
  } else if(entry.type === "text"){
    input = document.createElement("input");
    input.type = "text";
    input.value = String(getLightTunable(entry.path) || "");
    input.style.cssText = "flex:1 1 96px;min-width:0;background:#222;color:#eee;border:1px solid #444;";
    valOut.textContent = "";
    input.addEventListener("change", () => {
      if(!setLightTunable(entry.path, input.value)){
        input.value = String(getLightTunable(entry.path) || "");
      }
      lightLabRefreshReadouts();
    });
  } else {
    input = document.createElement("input");
    input.type = "range";
    input.min = String(entry.min); input.max = String(entry.max); input.step = String(entry.step);
    const cur = getLightTunable(entry.path);
    input.value = String(typeof cur === "number" ? cur : entry.min);
    input.style.cssText = "flex:1 1 90px;min-width:0;";
    valOut.textContent = Number(input.value).toFixed(3);
    input.addEventListener("input", () => {
      const v = parseFloat(input.value);
      setLightTunable(entry.path, v);
      valOut.textContent = v.toFixed(3);
      lightLabRefreshReadouts();
    });
  }
  input.dataset.llPath = entry.path;
  row.appendChild(input);
  row.appendChild(valOut);
  return { row, input };
}

// re-renders the "profile" group's 4 fields against whichever profile the dropdown currently selects —
// called on dropdown change AND once at mount.
function lightLabRebuildProfileFields(container){
  container.innerHTML = "";
  LIGHT_TUNABLE_SCHEMA.filter((e) => e.group === "profile").forEach((entry) => {
    container.appendChild(lightLabField(entry).row);
  });
}
function lightLabRebuildLightFields(container){
  container.innerHTML = "";
  const profile = LIGHT_TUNABLES.profiles[S.lightLabProfileKey];
  if(!profile || !profile.lights || !profile.lights.length){
    const empty = document.createElement("div");
    empty.textContent = "No local light in this recipe; ambient/environment is the source.";
    empty.style.cssText = "color:#7a8494;margin:3px 0 6px;";
    container.appendChild(empty);
    return;
  }
  LIGHT_TUNABLE_SCHEMA.filter((e) => e.group === "light").forEach((entry) => {
    container.appendChild(lightLabField(entry).row);
  });
}

function lightLabRefreshReadouts(){
  if(!S.lightLabMounted || !S.lightLabEls || !S.lightLabEls.readout) return;
  const gates = (window.Theater._lumaGatesForTest && S.mounted) ? window.Theater._lumaGatesForTest() : null;
  const el = S.lightLabEls.readout;
  const recipe = LIGHT_TUNABLES.profiles[S.lightLabProfileKey] || LIGHT_TUNABLES.profiles[LIGHT_DEFAULT_PROFILE];
  const historyLine = "preview " + (S.lightLabDirty ? "DIRTY" : "AUTHORED")
    + " · undo " + S.lightLabUndo.length + " · redo " + S.lightLabRedo.length;
  if(!gates){
    el.textContent = recipe.id + " · " + recipe.mode + "\n" + historyLine
      + "\nP-A readouts: no live board mounted.";
    return;
  }
  const pct = (v) => (v == null ? "—" : (v * 100).toFixed(1) + "%");
  el.textContent =
    recipe.id + " · " + recipe.mode + "\n" + historyLine +
    "\nP-A readouts (docs/VQ2-RESPEC.md §1) — live profile: " + (gates.lightProfile || "—") +
    "\n  tray-edge luma: " + pct(gates.trayEdgeLuma) + "  (gate: <=12%)" +
    "\n  PC-face luma:   " + pct(gates.pcFaceLuma) + (gates.pcUnitFound ? "" : "  (no PC unit on this board)") + "  (gate: >=18%)" +
    "\n  frame median:   " + pct(gates.frameMedianLuma) + "  (compare across profiles for the >=6% separation gate)";
}

function mountLightLab(){
  if(S.lightLabMounted) return;
  if(typeof document === "undefined") return;
  // defensive: a prior instance's panel outliving an S reset (retire() always tears it down first, but
  // this is a one-line insurance policy against ever double-mounting) — remove any stale node before
  // building a fresh one.
  const stale = document.getElementById("genesis-light-lab");
  if(stale && stale.parentNode) stale.parentNode.removeChild(stale);
  const panel = document.createElement("div");
  panel.id = "genesis-light-lab";
  panel.style.cssText =
    "position:fixed;top:8px;right:8px;width:300px;max-height:92vh;overflow:auto;z-index:99999;" +
    "background:rgba(20,20,24,0.94);border:1px solid #444;border-radius:6px;padding:8px;" +
    "font:12px/1.3 -apple-system,sans-serif;color:#eee;box-shadow:0 4px 18px rgba(0,0,0,0.5);";
  const title = document.createElement("div");
  title.textContent = "LIGHT-LAB (LL-1) — dev only";
  title.style.cssText = "font-weight:600;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;";
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.cssText = "background:none;border:none;color:#ccc;font-size:16px;cursor:pointer;line-height:1;";
  closeBtn.addEventListener("click", () => unmountLightLab());
  title.appendChild(closeBtn);
  panel.appendChild(title);

  // profile selector + its 4 fields
  const profSection = document.createElement("div");
  profSection.style.cssText = "border-top:1px solid #333;padding-top:4px;margin-top:4px;";
  const profHeader = document.createElement("div");
  profHeader.textContent = "Profile (LIGHT_PROFILES)";
  profHeader.style.cssText = "color:#9ab;margin-bottom:2px;";
  profSection.appendChild(profHeader);
  const select = document.createElement("select");
  select.style.cssText = "width:100%;margin-bottom:4px;background:#222;color:#eee;border:1px solid #444;";
  Object.keys(LIGHT_TUNABLES.profiles).forEach((key) => {
    const opt = document.createElement("option");
    const recipe = LIGHT_TUNABLES.profiles[key];
    opt.value = key;
    opt.textContent = (recipe.rolled ? "WORLD · " : "TEST · ") + recipe.label;
    select.appendChild(opt);
  });
  select.value = S.lightLabProfileKey || S.lightProfileKey || LIGHT_DEFAULT_PROFILE;
  S.lightLabProfileKey = select.value;
  const recipeInfo = document.createElement("div");
  recipeInfo.style.cssText = "color:#9ab;margin:2px 0 5px;font:10px/1.35 monospace;";
  const profFields = document.createElement("div");
  const lightHeader = document.createElement("div");
  lightHeader.textContent = "Named light / fixture";
  lightHeader.style.cssText = "color:#9ab;border-top:1px solid #333;padding-top:5px;margin-top:5px;";
  const lightSelect = document.createElement("select");
  lightSelect.style.cssText = "width:100%;margin:3px 0 4px;background:#222;color:#eee;border:1px solid #444;";
  const lightFields = document.createElement("div");
  function refreshRecipeEditor(){
    const profile = LIGHT_TUNABLES.profiles[S.lightLabProfileKey];
    lightLabRebuildProfileFields(profFields);
    lightSelect.innerHTML = "";
    (profile && profile.lights ? profile.lights : []).forEach((light, index) => {
      const opt = document.createElement("option");
      opt.value = String(index);
      opt.textContent = light.label + " · " + light.id;
      lightSelect.appendChild(opt);
    });
    const count = profile && profile.lights ? profile.lights.length : 0;
    S.lightLabLightIndex = Math.max(0, Math.min(S.lightLabLightIndex || 0, Math.max(0, count - 1)));
    lightSelect.value = String(S.lightLabLightIndex);
    lightSelect.disabled = count === 0;
    if(profile){
      const invariants = profile.spriteResponse.invariants;
      const selectedLight = count ? profile.lights[S.lightLabLightIndex] : null;
      recipeInfo.textContent =
        profile.mode + " · source: " + profile.source.label
        + (profile.source.loreNative ? " · lore-native" : " · diagnostic only")
        + "\nsprite invariants (read-only): " + invariants.colorSpace + " · "
        + invariants.magnificationFilter + " mag / " + invariants.minificationFilter
        + " min · " + invariants.alphaMode
        + (selectedLight
          ? "\nunits: " + selectedLight.intensityUnit + " / " + selectedLight.physicalIntensityUnit
            + " · " + selectedLight.positionStrategy
          : "\nno local light; ambient/environment only");
    } else {
      recipeInfo.textContent = "recipe unavailable";
    }
    lightLabRebuildLightFields(lightFields);
  }
  select.addEventListener("change", () => {
    S.lightLabProfileKey = select.value;
    S.lightLabLightIndex = 0;
    refreshRecipeEditor();
  });
  lightSelect.addEventListener("change", () => {
    S.lightLabLightIndex = Number(lightSelect.value) || 0;
    refreshRecipeEditor();
  });
  const previewBtn = document.createElement("button");
  previewBtn.textContent = "Preview this profile on the live board";
  previewBtn.style.cssText = "width:100%;margin:2px 0 6px;font:11px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;";
  previewBtn.addEventListener("click", () => {
    if(!S.mounted) return;
    if(S.clayRoomMounted) clayRoomSetLightingRecipe(select.value, "light-lab-preview");
    else applyLightProfile(select.value);
    markDirty(); scheduleRender();
    lightLabRefreshReadouts();
  });
  profSection.appendChild(select);
  profSection.appendChild(recipeInfo);
  profSection.appendChild(previewBtn);
  profSection.appendChild(profFields);
  profSection.appendChild(lightHeader);
  profSection.appendChild(lightSelect);
  profSection.appendChild(lightFields);
  panel.appendChild(profSection);
  refreshRecipeEditor();

  ["global", "celestial", "sprite"].forEach((group) => {
    const section = document.createElement("div");
    section.style.cssText = "border-top:1px solid #333;padding-top:4px;margin-top:4px;";
    const header = document.createElement("div");
    header.textContent = group === "global" ? "Exposure / bloom / grade"
      : group === "celestial" ? "Celestial arc (CELESTIAL_ARC)" : "Sprite brightness (BW2-4b)";
    header.style.cssText = "color:#9ab;margin-bottom:2px;";
    section.appendChild(header);
    LIGHT_TUNABLE_SCHEMA.filter((e) => e.group === group).forEach((entry) => {
      section.appendChild(lightLabField(entry).row);
    });
    panel.appendChild(section);
  });

  // P-A readouts
  const readoutSection = document.createElement("div");
  readoutSection.style.cssText = "border-top:1px solid #333;padding-top:4px;margin-top:4px;";
  const readout = document.createElement("pre");
  readout.style.cssText = "white-space:pre-wrap;font:10px/1.4 monospace;color:#bcd;margin:0;";
  readoutSection.appendChild(readout);
  panel.appendChild(readoutSection);

  const historyActions = document.createElement("div");
  historyActions.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:6px;";
  [
    ["UNDO", () => lightLabUndo()],
    ["REDO", () => lightLabRedo()],
    ["RESET", () => lightLabResetAuthored()]
  ].forEach((def) => {
    const button = document.createElement("button");
    button.textContent = def[0];
    button.style.cssText = "font:10px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
    button.addEventListener("click", () => {
      def[1]();
      refreshRecipeEditor();
      lightLabRefreshReadouts();
    });
    historyActions.appendChild(button);
  });
  panel.appendChild(historyActions);

  // export
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "SAVE AUTHORED LOCK (JSON)";
  exportBtn.style.cssText = "width:100%;margin-top:6px;font:11px monospace;background:#2a2a30;color:#ddd;border:1px solid #444;border-radius:3px;cursor:pointer;padding:4px;";
  exportBtn.addEventListener("click", () => {
    const json = JSON.stringify(lightLabExportJSON(), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "light-profile-locks.json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  panel.appendChild(exportBtn);

  document.body.appendChild(panel);
  S.lightLabMounted = true;
  S.lightLabEls = { panel, readout };
  lightLabRefreshReadouts();
  S.lightLabReadoutTimer = (typeof window !== "undefined" && window.setInterval)
    ? window.setInterval(lightLabRefreshReadouts, 600) : null;
}
function unmountLightLab(){
  if(!S.lightLabMounted) return;
  if(S.lightLabReadoutTimer) { clearInterval(S.lightLabReadoutTimer); S.lightLabReadoutTimer = null; }
  if(S.lightLabEls && S.lightLabEls.panel && S.lightLabEls.panel.parentNode){
    S.lightLabEls.panel.parentNode.removeChild(S.lightLabEls.panel);
  }
  S.lightLabEls = null;
  S.lightLabMounted = false;
}
// ---- the facade seams this region used to assign at top level (see header) ----
export function lightLabPublishSeams(){
window.Theater._lightLabSetTunable = function(path, value){ return setLightTunable(path, value); };
window.Theater._lightLabGetTunable = function(path){ return getLightTunable(path); };
window.Theater._lightLabSchema = function(){ return LIGHT_TUNABLE_SCHEMA.map((e) => Object.assign({}, e)); };
window.Theater._lightLabExport = function(){ return lightLabExportJSON(); };
window.Theater._lightLabResetAuthored = function(){ return lightLabResetAuthored(); };
window.Theater._lightLabUndo = function(){ return lightLabUndo(); };
window.Theater._lightLabRedo = function(){ return lightLabRedo(); };
window.Theater._lightLabHistory = function(){
  return { undo: S.lightLabUndo.length, redo: S.lightLabRedo.length, dirty: !!S.lightLabDirty };
};
window.Theater._lightLabSelectForTest = function(profileKey, lightIndex){
  if(!LIGHT_TUNABLES.profiles[profileKey]) return false;
  S.lightLabProfileKey = profileKey;
  S.lightLabLightIndex = Math.max(0, Number(lightIndex) || 0);
  return true;
};
window.Theater.lightLab = function(enabled){
  if(enabled === false){ unmountLightLab(); return false; }
  mountLightLab();
  return S.lightLabMounted;
};
}

export {
  mountLightLab, unmountLightLab, lightLabMaybeAutoMount, lightLabShouldEnable,
  lightLabApplyTunables, lightLabUndo, lightLabRedo
};
