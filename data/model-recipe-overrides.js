/* GENESIS DATA (hand-authored) — data/model-recipe-overrides.js
   MODEL-GRAMMAR G2 (docs/MODEL-GRAMMAR.md §3) — art-direction overrides for
   data/model-recipes.js's generated recipes. An override WINS BY SLUG: the runtime
   resolver (theater-boot.js's recipe lookup) checks this file FIRST, and only falls
   through to the generated MODEL_RECIPES entry when no override exists for that slug.

   This file is the OPPOSITE of model-recipes.js — it is NEVER regenerated, NEVER
   touched by build/gen-model-recipes.py, and stays small by design (the tables.js
   house rule's hand-authored twin, same discipline as data/model-recipe-overrides
   relates to data/tables.js/Engine markdown sources). Add an entry here when:
     - the derivation gets a specific creature's silhouette wrong (art direction call),
     - a named hero/boss deserves a bespoke module list beyond what §4's rules can infer,
     - Adam+Fable's G9 tuning session wants to hand-place modules/channels for one slug.

   Shape: IDENTICAL to a generated recipe's shape (§3) — {base, size, modules, channels,
   poseSeed}. `slug` is implied by the object key, not repeated inside (unlike the
   generated file, which keeps slug on the record for self-description in isolation).
   Partial overrides are NOT supported — an override REPLACES the whole recipe for that
   slug (simpler mental model: "this creature's recipe is exactly this," not a diff/patch
   against the generated baseline, which would silently re-drift if the generator's rules
   change under it). Keep overrides minimal; prefer fixing a bad §4 rule in the generator
   over hand-patching every creature it mis-derives (a whole rule class going wrong is a
   generator bug, not an overrides-file job — this file is for genuine one-offs).

   Classic <script> (shared global scope); defines MODEL_RECIPE_OVERRIDES. Loaded
   immediately after data/model-recipes.js in genesis.html so both are global before
   src/engine/theater-data.js (the resolver) reads them. */
const MODEL_RECIPE_OVERRIDES={

 /* EXAMPLE 1 — a named hero/boss silhouette upgrade. The generated "lich" recipe reads
    off type:undead (biped base) + its AC band (likely a mid armor channel) + the "lich"
    name-keyword hits nothing in §4 rule 5's curated table today, so the generated figure
    is an unremarkable armored biped. A lich deserves the caster read (robe-skirt +
    staff-tipped) plus a skull head and a radiant-adjacent glow read for its phylactery
    magic — exactly the kind of one-off taste call §9 Decision 2 reserves for this file
    rather than growing the generator's name-keyword table for a single named monster. */
 "lich": {
  "base": "torso-biped",
  "size": "medium",
  "modules": [
   { "part": "robe-skirt", "anchor": "base" },
   { "part": "staff-tipped", "anchor": "mainHand" },
   { "part": "head-skull", "anchor": "head" },
   { "part": "glow-halo", "anchor": "head" }
  ],
  "channels": { "skin": "shadow-dark", "armor": "none", "accent": "crystal", "glow": "radiant" },
  "poseSeed": "lich"
 },

 // EXAMPLE 2 — a mutation-test proof fixture (dev/verify-model-grammar.mjs asserts THIS
 // exact slug's resolved recipe differs from its generated counterpart, then asserts
 // removing this entry makes the resolver fall back to the generated one — the "overrides
 // win by slug" red-proof the spec's §7 check 3 calls for). Deliberately trivial (one
 // weapon module swapped, sword->dagger+snout-head) so the test's intent reads at a
 // glance; the generated "goblin-warrior" recipe carries a sword-slab, so this override
 // is trivially provable as DIFFERENT from the generated baseline by inspection.
 "goblin-warrior": {
  "base": "torso-biped",
  "size": "small",
  "modules": [
   { "part": "dagger-slabs", "anchor": "mainHand" },
   { "part": "head-snout", "anchor": "head" }
  ],
  "channels": { "skin": "skin-green-grey", "armor": "leather", "accent": "none", "glow": "none" },
  "poseSeed": "goblin-warrior"
 }

};
