#!/usr/bin/env node
/* dev/roll-noun.mjs — ON-DEMAND-GEN.md §9: the bridge-era same-beat shortcut.
   Loads the real compiled tables + the real codex-roll.js (pattern of dev/verify-prep-bundle.mjs's
   `new Function("window", …)` factory — these are pure data/logic modules, no DOM needed) and prints
   ONE roller payload as JSON. Read-only; never touches .dm/ — safe to run during a live session.

   The DM loop runs this mid-composition when it needs atoms in the SAME beat, then emits `codex_add`
   with the payload VERBATIM (provenance:"rolled", atoms unedited) in that turn's events.

   Usage:
     node dev/roll-noun.mjs npc --role captor --name "Vess"
     node dev/roll-noun.mjs interior --kind home
     node dev/roll-noun.mjs item --lock
     node dev/roll-noun.mjs loot --rarity uncommon
*/
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const factory = new Function("window",
  ["tables.js", "src/engine/core.js", "data/names.js", "src/engine/compiled.js",
   "src/engine/walk.js", "src/engine/dungeon-walk.js", "src/engine/codex-roll.js"].map(read).join("\n") +
  ";return { rollNPC, rollBuildingInterior, rollItem, rollLoot };"
);
const A = factory({});

const ROLLERS = { npc: A.rollNPC, interior: A.rollBuildingInterior, item: A.rollItem, loot: A.rollLoot };

function parseArgs(argv){
  const kind = argv[0];
  const opts = {};
  for(let i=1;i<argv.length;i++){
    const a=argv[i];
    if(!a.startsWith("--")) continue;
    const key=a.slice(2);
    const next=argv[i+1];
    if(next===undefined || next.startsWith("--")){ opts[key]=true; continue; }
    opts[key]=next; i++;
  }
  // flag → opts-shape aliases the spec's roller signatures actually read
  if(Object.prototype.hasOwnProperty.call(opts,"role")) opts.roleHint=opts.role;
  return { kind, opts };
}

const { kind, opts } = parseArgs(process.argv.slice(2));
const roller = ROLLERS[kind];
if(!roller){
  console.error("usage: node dev/roll-noun.mjs <npc|interior|item|loot> [--opt value ...]");
  process.exit(1);
}
const payload = roller(opts);
console.log(JSON.stringify(payload, null, 2));
