/* dev/model-qa/creature-coverage-audit.mjs — CREATURE MODEL COVERAGE audit.

   The proof sheet shows the 51 bespoke creature models; in live combat a monster only renders one
   if its bestiary slug is in WHOLE_OBJECT_REGISTRY or NEAREST_SUB (src/ui/theater-figures.js) —
   else it falls back to the cuboid archetype. This audit sweeps all 510 bestiary monsters, and for
   each UNCOVERED one proposes the cheapest resolution:

     ALIAS  — its silhouette matches an existing bespoke model (type + size + name heuristic) -> a
              nearest-sub line ready to paste into NEAREST_SUB. No new geometry.
     NEW    — no existing silhouette fits -> it needs a net-new model (ranked build list).

   Output: dev/model-qa/creature-coverage-report.md (+ .json) — coverage projection, the proposed
   alias block, and the ranked net-new build list by type.

   RUN:  node dev/model-qa/creature-coverage-audit.mjs      DEV-ONLY. No src touched. */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const OUT = join(ROOT, "dev", "model-qa");

// ---- parse the bestiary (top-level entries, one-space indent) ----
const bsrc = read("data/bestiary.js");
const entries = [];
{
  const re = /^ "([a-z0-9-]+)":\s*\{/gm;
  let m;
  const idxs = [];
  while ((m = re.exec(bsrc))) idxs.push({ id: m[1], at: m.index });
  for (let i = 0; i < idxs.length; i++) {
    const body = bsrc.slice(idxs[i].at, i + 1 < idxs.length ? idxs[i + 1].at : bsrc.length);
    const tl = (body.match(/"typeline":\s*"([^"]*)"/) || [])[1] || "";
    const size = (body.match(/"size":\s*"([^"]*)"/) || [])[1] || "";
    entries.push({ id: idxs[i].id, typeline: tl, size: size.toLowerCase() });
  }
}

// ---- registry + alias coverage from theater-figures.js ----
const tf = read("src/ui/theater-figures.js");
const directKeys = [...tf.matchAll(/"([a-z0-9-]+)":\s*\{\s*module/g)].map((m) => m[1]);
const subBlock = (tf.match(/const NEAREST_SUB\s*=\s*\{([\s\S]*?)\n\};/) || [])[1] || "";
const subKeys = [...subBlock.matchAll(/"([a-z0-9-]+)"\s*:/g)].map((m) => m[1]);
const covered = new Set([...directKeys, ...subKeys]);

// the bespoke models that actually exist (alias targets must be one of these OR a direct key).
const MODELS = new Set(directKeys);

// ---- type from typeline: first capitalized word after the size token ----
function typeOf(tl) {
  const t = tl.replace(/^(Tiny|Small|Medium|Large|Huge|Gargantuan)(\s+or\s+(Small|Medium|Large))?\s+/i, "");
  const m = t.match(/^([A-Za-z]+)/);
  return m ? m[1] : "?";
}

// ---- the alias heuristic: (type, size, id) -> an existing model slug, or null (=> needs NEW) ----
function propose(id, type, size) {
  const n = id;
  const big = size === "large" || size === "huge" || size === "gargantuan";
  const small = size === "tiny" || size === "small";
  const has = (...ks) => ks.some((k) => n.includes(k));

  // name-keyword silhouette matches first (cross-type) ---------------------------------
  if (has("spider", "ettercap")) return "giant-spider";
  if (has("snake", "serpent", "naga", "constrictor", "viper", "python", "couatl")) return "giant-constrictor-snake";
  if (has("bat", "stirge")) return "giant-bat";
  if (has("aarakocra", "kenku")) return "harpy";                                  // bird-folk -> winged humanoid
  if (has("pegasus")) return "warhorse";                                          // winged horse ~ horse silhouette
  if (has("eagle", "owl", "hawk", "raven", "crow", "vulture", "roc", "kite")) return big ? "wyvern" : "harpy";
  if (has("wolf", "jackal", "hyena", "hound", "mastiff", "dog", "fox")) return big ? "dire-wolf" : "wolf";
  if (has("rat", "weasel", "ferret", "mouse", "vermin", "beetle")) return "giant-rat";
  if (has("skeleton")) return "skeleton";
  if (has("zombie")) return "zombie";
  if (has("ghoul", "ghast", "lacedon")) return "ghoul";
  if (has("wight", "mummy", "revenant", "death-knight")) return "wight";
  if (has("wraith", "specter", "spectre", "ghost", "shadow", "poltergeist", "banshee")) return "shadow";
  if (has("skeletal-horse", "warhorse-skeleton", "nightmare")) return "warhorse-skeleton";
  if (has("horse", "pony", "mule", "donkey", "elk", "deer", "stag", "moose", "ox", "boar", "pig")) return "warhorse";
  if (has("ooze", "pudding", "jelly", "slime", "mold")) return "gray-ooze";
  if (has("golem", "animated-armor", "helmed-horror", "shield-guardian")) return has("armor", "horror") ? "animated-armor" : "stone-golem";
  if (has("mephit", "imp", "quasit", "sprite", "pixie", "homunculus")) return "ice-mephit";
  if (has("harpy", "cockatrice")) return "harpy";
  if (has("gargoyle")) return "gargoyle";
  if (has("wyvern", "pteranodon", "peryton", "griffon", "hippogriff")) return "wyvern";
  if (has("owlbear", "bear")) return "owlbear";
  if (has("werewolf", "wererat", "wereboar", "weretiger", "lycan")) return "werewolf";
  if (has("minotaur")) return "minotaur-of-the-horned-king";
  if (has("troll")) return "troll";
  if (has("ogre")) return "ogre";
  if (has("mimic")) return "mimic";
  if (has("kobold")) return "kobold";
  if (has("goblin")) return "goblin-warrior";
  if (has("hobgoblin")) return "hobgoblin-soldier";
  if (has("bugbear")) return "bugbear-warrior";
  if (has("gnoll")) return "gnoll-warrior";
  if (has("orc")) return "orc-warrior";
  if (has("bandit", "thug", "guard", "soldier", "knight", "veteran", "scout", "archer", "warrior", "mercenary", "berserker")) return "warrior-veteran";
  if (has("cultist", "priest", "acolyte", "mage", "wizard", "warlock", "sorcerer", "druid", "adept", "apprentice")) return "cultist";
  if (has("commoner", "noble", "peasant", "servant", "citizen")) return "commoner";
  if (has("lizard", "gecko", "skink", "crocodile", "dinosaur", "raptor", "saurus")) return "giant-lizard";
  if (has("dragon", "drake", "wyrmling", "dracolich")) return "young-red-dragon";
  if (has("elemental")) return n.includes("fire") || n.includes("magma") || n.includes("lava") ? "fire-elemental" : "earth-elemental";

  // type + size fallbacks --------------------------------------------------------------
  switch (type) {
    case "Beast":       return big ? "owlbear" : (small ? "giant-rat" : "wolf");
    case "Humanoid":    return big ? "ogre" : "warrior-veteran";
    case "Undead":      return big ? "wight" : "skeleton";
    case "Giant":       return "hill-giant";
    case "Dragon":      return "young-red-dragon";
    case "Construct":   return big ? "stone-golem" : "animated-armor";
    case "Elemental":   return "earth-elemental";
    case "Ooze":        return "gray-ooze";
    case "Swarm":       return has("bat", "insect", "wasp", "bee") ? "giant-bat" : "giant-rat";
    case "Plant":       return "needle-blight";
    case "Fey":         return small ? "kobold" : "cultist";
    // genuinely novel silhouettes — no honest existing match:
    case "Aberration":  return small ? "ice-mephit" : null;
    case "Monstrosity": return big ? null : "giant-lizard";
    case "Fiend":       return small ? "ice-mephit" : (big ? "ogre" : null);
    case "Celestial":   return null;
    default:            return null;
  }
}

// ---- run ----
const already = entries.filter((e) => covered.has(e.id));
const uncovered = entries.filter((e) => !covered.has(e.id));
const aliasProposals = [];
const needsNew = [];
for (const e of uncovered) {
  const type = typeOf(e.typeline);
  const target = propose(e.id, type, e.size);
  if (target && MODELS.has(target)) aliasProposals_push(e, type, target);
  else needsNew.push({ id: e.id, type, size: e.size });
}
function aliasProposals_push(e, type, target) { aliasProposals.push({ id: e.id, type, size: e.size, target }); }

const projected = already.length + aliasProposals.length;
const pct = (n) => Math.round((100 * n) / entries.length);

// group needs-new by type, and alias proposals by target for a clean paste block
const newByType = {};
for (const x of needsNew) (newByType[x.type] ||= []).push(x.id);
const aliasByTarget = {};
for (const a of aliasProposals) (aliasByTarget[a.target] ||= []).push(a.id);

// ---- write report ----
let md = `---
type: audit-report
project: Genesis
status: REPORT-ONLY — no code/table changes
created: 2026-07-04
scope: "creature model coverage — data/bestiary.js (510) vs src/ui/theater-figures.js registry"
---

# Creature model coverage audit

**Today:** ${already.length}/${entries.length} monsters (${pct(already.length)}%) resolve to a bespoke whole-object model
(${directKeys.length} direct registry keys + ${subKeys.length} nearest-sub aliases). The other
${uncovered.length} render as the **cuboid fallback** in combat.

**If we accept the alias proposals below:** ${projected}/${entries.length} (${pct(projected)}%) covered by aliasing to
existing models — **${aliasProposals.length} monsters need NO new geometry**, just nearest-sub lines. That leaves
**${needsNew.length} that genuinely need a net-new model** (${pct(needsNew.length)}% of the bestiary), listed by type at the end.

> Heuristic proposals — every ALIAS is a silhouette-family guess (type + size + name). Adam gates
> each at taste review; a wrong family is a one-line edit. The NEW list is where the real modeling
> effort goes.

## Coverage math

| bucket | count | % of 510 |
|---|---:|---:|
| covered today (registry + aliases) | ${already.length} | ${pct(already.length)}% |
| + proposed aliases (no new geometry) | ${aliasProposals.length} | ${pct(aliasProposals.length)}% |
| **projected total covered** | **${projected}** | **${pct(projected)}%** |
| **still need a net-new model** | **${needsNew.length}** | **${pct(needsNew.length)}%** |

## Proposed NEAREST_SUB additions (grouped by target model)

Paste-ready. ${aliasProposals.length} aliases across ${Object.keys(aliasByTarget).length} existing models.

\`\`\`js
`;
for (const target of Object.keys(aliasByTarget).sort((a, b) => aliasByTarget[b].length - aliasByTarget[a].length)) {
  const ids = aliasByTarget[target].sort();
  md += `  // -> ${target} (${ids.length})\n`;
  // wrap ~3 per line
  for (let i = 0; i < ids.length; i += 3) {
    md += "  " + ids.slice(i, i + 3).map((x) => `"${x}": "${target}",`).join(" ") + "\n";
  }
}
md += `\`\`\`

## Net-new model build list (${needsNew.length}) — ranked by type

These have no honest existing silhouette. Grouped by creature type (a type often shares a buildable
base — e.g. one good "many-legged monstrosity" base could seed several).

`;
for (const type of Object.keys(newByType).sort((a, b) => newByType[b].length - newByType[a].length)) {
  const ids = newByType[type].sort();
  md += `### ${type} (${ids.length})\n${ids.map((x) => "- " + x).join("\n")}\n\n`;
}

writeFileSync(join(OUT, "creature-coverage-report.md"), md);
writeFileSync(join(OUT, "creature-coverage-report.json"),
  JSON.stringify({ total: entries.length, coveredToday: already.length, aliasProposals, needsNew, aliasByTarget, newByType }, null, 2) + "\n");

console.log(`\nCREATURE COVERAGE:`);
console.log(`  today:      ${already.length}/${entries.length} (${pct(already.length)}%) modeled`);
console.log(`  aliasable:  +${aliasProposals.length} -> ${projected}/${entries.length} (${pct(projected)}%) with zero new geometry`);
console.log(`  need NEW:   ${needsNew.length} (${pct(needsNew.length)}%)`);
console.log(`  need-new by type: ${Object.entries(newByType).map(([t, a]) => t + ":" + a.length).sort().join("  ")}`);
console.log(`\n  report -> dev/model-qa/creature-coverage-report.md`);
