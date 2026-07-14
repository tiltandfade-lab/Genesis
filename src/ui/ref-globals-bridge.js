/* GENESIS MODULE — src/ui/ref-globals-bridge.js — the classic-script -> ES-module globals bridge for
   the Reference Shelf's Monster Manual (src/ui/ref-bestiary.js, docs/BESTIARY-MANUAL.md unit S2).

   ROOT CAUSE this file fixes: data/bestiary.js, data/realm-bestiary.js, data/monster-flavor.js, and
   data/model-recipes.js each declare their payload as a top-level `const` (BESTIARY, REALM_BESTIARY,
   MONSTER_FLAVOR, MODEL_RECIPES) inside a classic (non-module) <script> tag. Classic <script> tags
   share ONE declarative scope, so every other classic script can already see those consts directly
   (e.g. src/engine/theater-data.js reads PART_NAMES as a bare identifier) — but top-level const/let
   bindings, unlike `var` and function declarations, are NOT added as properties of `window`. An ES
   module (src/ui/ref-bestiary.js) has its own module scope and cannot see the classic scripts'
   declarative bindings at all — its only way in is through `window`. Since these four consts never
   attached to `window`, ref-bestiary.js's `manualEntries()` read `window.BESTIARY` etc. as `undefined`
   and silently fell back to `{}`, so the Monster Manual grid rendered empty and every filter was a
   no-op filtering nothing. (`theaterArchetypeFor`, `cmParseActionText`, and `referenceShelfRegister`
   are ordinary function DECLARATIONS, which — like `var` — DO become properties of `window`
   automatically; those three were never broken.)

   FIX: this tiny classic script runs after all four data files (and after model-recipe-overrides.js,
   which may further mutate the same MODEL_RECIPES object by reference) and republishes each const onto
   `window` explicitly. It is placed immediately before the ES-module tags so every module-boundary
   consumer (today: ref-bestiary.js; potentially more later) has a stable, explicit seam to depend on
   instead of each new module re-deriving its own defensive typeof-guard copy of this same fix.

   Never edits data/*.js (generated, edit-source-only per CLAUDE.md) — this file is the seam, not a
   data change. Owns no other symbols; a pure republish. */

window.BESTIARY = (typeof BESTIARY !== "undefined") ? BESTIARY : undefined;
window.BESTIARY_BY_CR = (typeof BESTIARY_BY_CR !== "undefined") ? BESTIARY_BY_CR : undefined;
window.REALM_BESTIARY = (typeof REALM_BESTIARY !== "undefined") ? REALM_BESTIARY : undefined;
window.MONSTER_FLAVOR = (typeof MONSTER_FLAVOR !== "undefined") ? MONSTER_FLAVOR : undefined;
window.MODEL_RECIPES = (typeof MODEL_RECIPES !== "undefined") ? MODEL_RECIPES : undefined;
