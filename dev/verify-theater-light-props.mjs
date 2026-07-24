/* Verify P1' WHOLE-OBJECT WIRING Unit B (docs/P1-WIRING.md §4 Unit B / §7 check 10) — lighting-prop
   anchoring: the rolled per-room light profile's point light sources at the whole-object prop's own
   flame/glow head (dev/model-qa/creatures/prop-light.js's ENGINE NOTE, reserved for P1' by name).

   theater-boot.js is the ES-module GL boundary file (excluded from jsdom/classic-script harnesses per
   CLAUDE.md/this repo's own convention — see verify-theater-figures.mjs's header for the same
   discipline) — this harness therefore checks what IS checkable without a browser:
     1. every LIGHT_PROFILES key that theater-figures.js registers a "light:<key>" entry for is a REAL
        LIGHT_PROFILES key in theater-boot.js (text-scan cross-reference — a typo'd profile name in
        the registry would silently never anchor, caught here).
     2. every "light:<key>" registry entry's module/fn resolves a real callable builder (reuses
        theater-figures.js's own loader).
     3. flameY is present and numeric on every light: entry (mountLightProp's own fallback covers an
        absent value, but a present, sane number is the authored contract).
     4. structural guards (text-scan theater-boot.js): mountLightProp clears S.lightPropAnchor to null
        before any resolution attempt (guard §3: "no registry mapping -> no prop, light behavior
        byte-identical" requires the null-first discipline); applyLightProfile's point-light loop only
        overrides position for index 0 AND only when S.lightPropAnchor is truthy (never touches a
        profile's OTHER points, and never touches ANY point when no anchor resolved).
   The actual PIXEL-level browser proof (torchlit shows a torch + the point light sourced there; dark
   shows no prop, byte-identical light state) is a browser-only capture — see dev/model-qa/
   p1-wiring-gate/D-torchlit-wholeobject.png / D-dark-wholeobject.png (captured live via dev/model-qa/
   capture-p1-wiring.mjs's conventions), the check-10 capture-gate pair.

   Run:  node dev/verify-theater-light-props.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const FIGURES_URL = pathToFileURL(join(ROOT, "src/ui/theater-figures.js")).href;

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const Figures = await import(FIGURES_URL);
const { WHOLE_OBJECT_REGISTRY, loadWholeObjectBuilders } = Figures;
const bootSrc = read("src/ui/theater-boot.js");
const lightLock = JSON.parse(read("data/light-profile-locks.json"));

// ============================================================================
// 1. every "light:<key>" registry entry names a REAL LIGHT_PROFILES key
// ============================================================================
console.log("=== 1. light: registry keys match real LIGHT_PROFILES entries ===");
{
  const lightKeys = Object.keys(WHOLE_OBJECT_REGISTRY).filter(k => k.startsWith("light:"));
  check("at least one light: registry entry exists", lightKeys.length > 0, lightKeys.length);
  // CL-R1 moved the authority from a private theater object literal to the validated authored lock.
  // Read that source of truth directly; theater-boot's LIGHT_PROFILES is now a runtime compatibility
  // projection and intentionally has no scrapeable literal block.
  const profilesBlockMatch = /const LIGHT_PROFILES = Object\.freeze/.test(bootSrc);
  check("theater-boot.js projects LIGHT_PROFILES from the shared compiled registry",
    profilesBlockMatch && /LIGHT_RECIPE_REGISTRY/.test(bootSrc), "");
  const realProfileKeys = Object.keys(lightLock.profiles || {});
  check("shared lock carries at least 9 real LIGHT_PROFILES keys", realProfileKeys.length >= 9, JSON.stringify(realProfileKeys));

  const badKeys = lightKeys.filter(k => !realProfileKeys.includes(k.slice("light:".length)));
  check("every light: registry key names a REAL LIGHT_PROFILES entry", badKeys.length === 0, JSON.stringify(badKeys));
}

// ============================================================================
// 2. every light: entry resolves a real callable builder
// ============================================================================
console.log("\n=== 2. light: entries resolve real builders ===");
{
  await new Promise((resolve) => loadWholeObjectBuilders(resolve));
  const lightKeys = Object.keys(WHOLE_OBJECT_REGISTRY).filter(k => k.startsWith("light:"));
  const unresolved = lightKeys.filter(k => typeof WHOLE_OBJECT_REGISTRY[k].build !== "function");
  check("every light: entry resolves a real callable builder", unresolved.length === 0, JSON.stringify(unresolved));
}

// ============================================================================
// 3. flameY is present + numeric on every light: entry
// ============================================================================
console.log("\n=== 3. flameY is present + numeric on every light: entry ===");
{
  const lightKeys = Object.keys(WHOLE_OBJECT_REGISTRY).filter(k => k.startsWith("light:"));
  const badFlameY = lightKeys.filter(k => {
    const fy = WHOLE_OBJECT_REGISTRY[k].flameY;
    return typeof fy !== "number" || !isFinite(fy) || fy <= 0;
  });
  check("every light: entry carries a positive finite flameY", badFlameY.length === 0, JSON.stringify(badFlameY));
}

// ============================================================================
// 4. structural guards (text-scan) — the null-first discipline + the index-0-only override
// ============================================================================
console.log("\n=== 4. structural guards (RED-FIRST proof: red without Unit B, green with) ===");
{
  check("mountLightProp clears S.lightPropAnchor to null before any resolution attempt",
    /function mountLightProp\(data, cx, cz\)\{\s*S\.lightPropAnchor = null;/.test(bootSrc), "");
  check("applyLightProfile only overrides light position at index 0, guarded on S.lightPropAnchor",
    /if\(i === 0 && S\.lightPropAnchor\)/.test(bootSrc), "");
  check("mountLightProp is called from setBoard BEFORE applyLightProfile (so the anchor is ready in time)",
    (() => {
      const mountIdx = bootSrc.indexOf("mountLightProp(data, cx, cz);");
      // setBoard's applyLightProfile call was refactored (post-P1' Unit B) from the inline
      // `applyLightProfile((data.light && data.light.profile) || LIGHT_DEFAULT_PROFILE)` to a two-line
      // form: `const lightProfileKey = (data.light && data.light.profile) || LIGHT_DEFAULT_PROFILE;`
      // then `applyLightProfile(lightProfileKey);` (theater-boot.js:7651-7652). Behavior is byte-identical
      // — the profile is still keyed off data.light.profile with the same dark fallback. Match BOTH the
      // key derivation (preserves "keyed off data.light.profile", the intent the old string encoded) and
      // the call, and assert mount precedes the setBoard call. This is the SAME ordering guard, just
      // re-anchored on the current source text after a variable-extraction refactor.
      const keyIdx = bootSrc.indexOf("const lightProfileKey = (data.light && data.light.profile) || LIGHT_DEFAULT_PROFILE;");
      const applyIdx = bootSrc.indexOf("applyLightProfile(lightProfileKey);");
      return mountIdx >= 0 && keyIdx >= 0 && applyIdx >= 0 && mountIdx < applyIdx;
    })(), "");
  check("mountLightProp guards WHOLE_OBJECT_ENABLED (the gate) before any registry lookup",
    /function mountLightProp[\s\S]{0,120}if\(!WHOLE_OBJECT_ENABLED\) return;/.test(bootSrc), "");
}

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail > 0 ? 1 : 0);
