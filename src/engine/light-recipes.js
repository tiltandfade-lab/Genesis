/* GENESIS MODULE — src/engine/light-recipes.js
   CL-R1's shared, pure lighting authority. Authored values live in
   data/light-profile-locks.json and compile deterministically to
   LIGHT_PROFILE_LOCKS_COMPILED before this module loads. The renderer and the
   Clayroom both consume these same named recipes; neither owns a private copy. */

var LIGHT_RECIPE_LOCK_SCHEMA_VERSION = 2;
var LIGHT_RECIPE_MAX_LIGHTS = 4;

function lightRecipeDeepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function lightRecipeDeepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.keys(value).forEach(function (key) { lightRecipeDeepFreeze(value[key]); });
  return Object.freeze(value);
}

function lightRecipeColorNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^0x[0-9a-f]{6}$/i.test(value)) {
    return parseInt(value.slice(2), 16);
  }
  throw new Error("light recipe color must be 0xRRGGBB");
}

function lightRecipeFiniteInRange(value, low, high) {
  return typeof value === "number" && Number.isFinite(value) && value >= low && value <= high;
}

function lightRecipeKelvinColor(temperatureK) {
  var t = Math.max(1000, Math.min(20000, temperatureK)) / 100;
  var red;
  var green;
  var blue;
  if (t <= 66) {
    red = 255;
    green = 99.4708025861 * Math.log(t) - 161.1195681661;
    blue = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    red = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    green = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    blue = 255;
  }
  function channel(value) { return Math.max(0, Math.min(255, Math.round(value))); }
  return (channel(red) << 16) | (channel(green) << 8) | channel(blue);
}

function lightRecipeValidate(profile) {
  var errors = [];
  if (!profile || typeof profile !== "object") return { ok: false, errors: ["profile must be an object"] };
  if (!profile.id || typeof profile.id !== "string") errors.push("profile.id is required");
  if (!profile.mode || !/^(diagnostic|production)-/.test(profile.mode)) errors.push("profile.mode is invalid");
  if (!profile.source || typeof profile.source !== "object") errors.push("profile.source is required");
  if (!profile.ambient || typeof profile.ambient !== "object") errors.push("profile.ambient is required");
  try { lightRecipeColorNumber(profile.ambient && profile.ambient.color); } catch (e) { errors.push("ambient.color is invalid"); }
  if (!lightRecipeFiniteInRange(profile.exposureFloor, 0, 0.3)) errors.push("profile.exposureFloor must be in [0, 0.3]");
  if (!profile.toneMap || !/^(none|agx)$/.test(profile.toneMap.profile)
    || !lightRecipeFiniteInRange(profile.toneMap.strength, 0, 1)) errors.push("profile.toneMap is invalid");
  if (!profile.bloom || !lightRecipeFiniteInRange(profile.bloom.threshold, 0, 2)
    || !lightRecipeFiniteInRange(profile.bloom.strength, 0, 3)) errors.push("profile.bloom is invalid");
  if (!profile.spriteResponse || !lightRecipeFiniteInRange(profile.spriteResponse.emissiveFloor, 0, 0.3)
    || !profile.spriteResponse.materialRecipe) errors.push("profile.spriteResponse is invalid");
  var invariants = profile.spriteResponse && profile.spriteResponse.invariants;
  if (!invariants || invariants.colorSpace !== "srgb"
    || invariants.magnificationFilter !== "nearest"
    || invariants.minificationFilter !== "linear"
    || invariants.alphaMode !== "registry-cutoff") errors.push("profile.spriteResponse.invariants are invalid");
  if (!Array.isArray(profile.lights)) errors.push("profile.lights must be an array");
  if (Array.isArray(profile.lights) && profile.lights.length > LIGHT_RECIPE_MAX_LIGHTS) {
    errors.push("profile.lights exceeds the " + LIGHT_RECIPE_MAX_LIGHTS + "-light bound");
  }
  (profile.lights || []).forEach(function (light, index) {
    var label = "lights[" + index + "]";
    if (!light || typeof light !== "object") { errors.push(label + " must be an object"); return; }
    if (!light.id) errors.push(label + ".id is required");
    if (!/^(environment|directional|point|spot)$/.test(light.type || "")) errors.push(label + ".type is invalid");
    if (!lightRecipeFiniteInRange(light.temperatureK, 1000, 20000)) errors.push(label + ".temperatureK must be in [1000, 20000]");
    if (typeof light.colorOverride !== "boolean") errors.push(label + ".colorOverride must be boolean");
    try { lightRecipeColorNumber(light.color); } catch (e) { errors.push(label + ".color is invalid"); }
    [
      ["intensity", 0, 30],
      ["physicalIntensity", 0, 30],
      ["heightM", 0, 20],
      ["rangeM", 0, 100],
      ["falloff", 0, 2]
    ].forEach(function (rule) {
      if (!lightRecipeFiniteInRange(light[rule[0]], rule[1], rule[2])) {
        errors.push(label + "." + rule[0] + " must be in [" + rule[1] + ", " + rule[2] + "]");
      }
    });
    if (!/^(board-relative|socket-relative)$/.test(light.positionStrategy || "")) errors.push(label + ".positionStrategy is invalid");
    if (!lightRecipeFiniteInRange(light.azimuthDeg, -360, 360)) errors.push(label + ".azimuthDeg is invalid");
    if (!lightRecipeFiniteInRange(light.elevationDeg, -90, 90)) errors.push(label + ".elevationDeg is invalid");
    if (!/^(steady|flickering)$/.test(light.state || "")) errors.push(label + ".state is invalid");
    if (!light.spot || !lightRecipeFiniteInRange(light.spot.coneDeg, 1, 179)
      || !lightRecipeFiniteInRange(light.spot.penumbra, 0, 1)) errors.push(label + ".spot is invalid");
    if (!light.shadow || typeof light.shadow.cast !== "boolean"
      || !lightRecipeFiniteInRange(light.shadow.bias, -0.1, 0.1)
      || !lightRecipeFiniteInRange(light.shadow.normalBias, 0, 1)
      || [256, 512, 1024, 2048].indexOf(light.shadow.mapSize) === -1
      || !lightRecipeFiniteInRange(light.shadow.budgetPriority, 0, 3)) errors.push(label + ".shadow is invalid");
    if (!light.flicker || !light.flicker.recipeId
      || !lightRecipeFiniteInRange(light.flicker.amplitude, 0, 0.5)
      || !lightRecipeFiniteInRange(light.flicker.cadenceMs, 100, 5000)
      || !lightRecipeFiniteInRange(light.flicker.intervalJitter, 0, 0.9)
      || !lightRecipeFiniteInRange(light.flicker.directionAmplitude, 0, 0.08)) errors.push(label + ".flicker is invalid");
    if (profile.source && profile.source.visibleEmitterRequired) {
      if (!light.fixtureId) errors.push(label + ".fixtureId is required");
      if (!light.emitterLocal) errors.push(label + ".emitterLocal is required");
      // CR-3's written diagnostic-studio exception, kept in lockstep with
      // build/compile-light-locks.py (2026-07-25 visual-correction Checkpoint 2): explicitly
      // labelled studio test hardware may float board-relative; production visible emitters
      // keep the socket-relative mount contract.
      if (profile.mode !== "diagnostic-studio" && light.positionStrategy !== "socket-relative") {
        errors.push(label + ".positionStrategy must be socket-relative");
      }
    }
  });
  return { ok: errors.length === 0, errors: errors };
}

function lightRecipeNormalize(profile) {
  var copy = lightRecipeDeepClone(profile);
  copy.ambient.color = lightRecipeColorNumber(copy.ambient.color);
  copy.lights.forEach(function (light) {
    light.color = lightRecipeColorNumber(light.color);
    if (light.colorOverride === false) light.color = lightRecipeKelvinColor(light.temperatureK);
    light.enabled = light.enabled !== false;
    light.state = light.state || "steady";
    light.flicker = Object.assign({
      amplitude: 0,
      cadenceMs: 480,
      intervalJitter: 0,
      directionAmplitude: 0
    }, light.flicker || {});
  });
  var report = lightRecipeValidate(copy);
  if (!report.ok) throw new Error("invalid light recipe '" + (copy.id || "?") + "': " + report.errors.join("; "));
  return lightRecipeDeepFreeze(copy);
}

if (typeof LIGHT_PROFILE_LOCKS_COMPILED === "undefined") {
  throw new Error("src/engine/light-recipes.js requires data/light-profile-locks.js");
}
if (LIGHT_PROFILE_LOCKS_COMPILED.schemaVersion !== LIGHT_RECIPE_LOCK_SCHEMA_VERSION) {
  throw new Error("unsupported light lock schema " + LIGHT_PROFILE_LOCKS_COMPILED.schemaVersion);
}

var LIGHT_RECIPE_REGISTRY = (function () {
  var out = {};
  Object.keys(LIGHT_PROFILE_LOCKS_COMPILED.profiles || {}).forEach(function (key) {
    var normalized = lightRecipeNormalize(LIGHT_PROFILE_LOCKS_COMPILED.profiles[key]);
    if (normalized.id !== key) throw new Error("light recipe id/key mismatch: " + key);
    out[key] = normalized;
  });
  return lightRecipeDeepFreeze(out);
})();

var LIGHT_LAB_COMPILED_SETTINGS = lightRecipeDeepFreeze(
  lightRecipeDeepClone(LIGHT_PROFILE_LOCKS_COMPILED.settings)
);

function lightRecipeFor(id) {
  return LIGHT_RECIPE_REGISTRY[id] || LIGHT_RECIPE_REGISTRY.dark;
}

function lightRecipeClone(id) {
  return lightRecipeDeepClone(lightRecipeFor(id));
}

function lightRecipeLegacyProfile(recipeOrId) {
  var recipe = typeof recipeOrId === "string" ? lightRecipeFor(recipeOrId) : recipeOrId;
  return {
    ambient: {
      color: lightRecipeColorNumber(recipe.ambient.color),
      intensity: recipe.ambient.intensity
    },
    points: (recipe.lights || []).filter(function (light) { return light.enabled !== false; }).map(function (light) {
      return {
        id: light.id,
        side: light.side || null,
        type: light.type,
        temperatureK: light.temperatureK,
        colorOverride: light.colorOverride,
        color: lightRecipeColorNumber(light.color),
        intensity: light.intensity,
        intensityUnit: light.intensityUnit,
        physicalIntensity: light.physicalIntensity,
        physicalIntensityUnit: light.physicalIntensityUnit,
        positionStrategy: light.positionStrategy,
        azimuthDeg: light.azimuthDeg,
        elevationDeg: light.elevationDeg,
        spot: lightRecipeDeepClone(light.spot),
        shadow: lightRecipeDeepClone(light.shadow),
        state: light.state || "steady",
        fixtureId: light.fixtureId || null,
        mount: light.mount || null,
        emitterLocal: light.emitterLocal ? lightRecipeDeepClone(light.emitterLocal) : null,
        heightM: light.heightM,
        rangeM: light.rangeM,
        falloff: light.falloff,
        flicker: lightRecipeDeepClone(light.flicker || { amplitude: 0, cadenceMs: 480 }),
        pos: lightRecipeDeepClone(light.pos)
      };
    }),
    flicker: (recipe.lights || []).reduce(function (max, light) {
      return Math.max(max, light.flicker ? light.flicker.amplitude || 0 : 0);
    }, 0),
    id: recipe.id,
    label: recipe.label,
    mode: recipe.mode,
    source: lightRecipeDeepClone(recipe.source)
  };
}

// Compatibility name retained for existing fixture/harness consumers. Its data
// now comes from the same compiled lock as the Lighting Lab.
var CLAY_C1A_LIGHT_PROFILE = lightRecipeDeepFreeze(
  lightRecipeLegacyProfile("clay-opposing-pair")
);
