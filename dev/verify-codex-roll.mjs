/* Verify the CODEX rollers (Phase 2; docs/CODEX.md §2) — full-app jsdom load + compiled tables.js.
   Asserts: rollNPC/rollPlace mint codexAdd-ready payloads from the real compiled tables — raw `rolled`
   atoms, a player-safe `fields` glance-read, DM-only `dm` levers — and that those payloads flow through
   codexAdd → records with the right shape, provenance, and soft state. Also the race→species mapper and
   the place name/desc split. Stochastic rollers are sampled across many runs.

   Run:  node dev/verify-codex-roll.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
// tables.js (the compiled artifact) populates window.GENESIS_TABLES; it isn't a manifest module.
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

check("tables.js populated GENESIS_TABLES", win.GENESIS_TABLES && Object.keys(win.GENESIS_TABLES).length > 300);
for (const f of ["rollNPC","rollPlace","npcSpeciesFromRace","npcRolledName","placeNameDesc"])
  check(`global ${f}`, typeof win[f] === "function");

// --- race → species mapper ---
check("mapper: Dwarf", win.npcSpeciesFromRace("Dwarf (Hill): stocky") === "Dwarf");
check("mapper: Half-Orc → Orc", win.npcSpeciesFromRace("Half-Orc — green-tinged") === "Orc");
check("mapper: Half-Elf → Elf", win.npcSpeciesFromRace("Half-Elf, slender") === "Elf");
check("mapper: Underdark Exile → Elf", win.npcSpeciesFromRace("Underdark Exile: pale") === "Elf");
check("mapper: unknown → Human fallback", win.npcSpeciesFromRace("Aarakocra??") === "Human");

// --- placeNameDesc split ---
const nd = win.placeNameDesc("The Bog-Iron Camp: A collection of mud-caked tents.");
check("placeNameDesc splits name on the colon", nd.name === "The Bog-Iron Camp" && /mud-caked/.test(nd.desc));
const nd2 = win.placeNameDesc("no colon here");
check("placeNameDesc: no colon → null name, full desc", nd2.name === null && nd2.desc === "no colon here");

// --- rollNPC shape (sample many to exercise the stochastic chain) ---
let npcOk = 0, dmOk = 0, softOk = 0;
for (let i = 0; i < 200; i++) {
  const r = win.rollNPC();
  if (r.kind === "npc" && r.provenance === "rolled" && typeof r.name === "string" && r.name.length
      && r.rolled && r.rolled.role && r.rolled.flawSecret && r.rolled.bond
      && r.fields && r.fields.species && r.fields.role) npcOk++;
  if (r.dm && r.dm.secret && r.dm.fear && r.dm.want) dmOk++;
  // player-safe fields must NOT carry the secret
  if (!r.fields.secret) softOk++;
}
check("rollNPC: 200/200 well-formed (kind/name/rolled atoms/player fields)", npcOk === 200, `${npcOk}/200`);
check("rollNPC: 200/200 carry DM-only levers (secret/fear/want)", dmOk === 200, `${dmOk}/200`);
check("rollNPC: the secret never leaks into player `fields`", softOk === 200, `${softOk}/200`);

const rh = win.rollNPC({ name: "Sabarra Perrybottom", roleHint: "questgiver" });
check("rollNPC: opts.name overrides the rolled name", rh.name === "Sabarra Perrybottom");
check("rollNPC: opts.roleHint is recorded for the AI", rh.rolled.roleHint === "questgiver");

// --- rollPlace shape ---
let placeOk = 0, secOk = 0;
for (let i = 0; i < 200; i++) {
  const p = win.rollPlace();
  if (p.kind === "location" && p.provenance === "rolled" && typeof p.name === "string" && p.name.length
      && p.rolled && p.rolled.setting && p.rolled.trait && p.fields && p.fields.trait) placeOk++;
  if (p.dm && p.dm.secret && !p.fields.secret) secOk++;
}
check("rollPlace: 200/200 well-formed (named, trait, desc)", placeOk === 200, `${placeOk}/200`);
check("rollPlace: hidden secret is DM-only, never in player `fields`", secOk === 200, `${secOk}/200`);
const pd = win.rollPlace({ depth: true });
check("rollPlace: depth=true also rolls history", typeof pd.dm.history === "string" && pd.dm.history.length > 0);
const pn = win.rollPlace({ name: "The Cinderyard" });
check("rollPlace: opts.name overrides", pn.name === "The Cinderyard");

// --- the payloads flow through codexAdd into real records ---
const w = { id:"w1", name:"T", gazetteer:[], factions:[], ledger:[], clock:{day:1,min:360} };
const npcRec = win.codexAdd(w, win.rollNPC({ name:"Quill" }));
check("rollNPC → codexAdd mints a soft, rolled NPC record", npcRec.id === "npc:quill" && npcRec.status.soft === true && npcRec.provenance === "rolled");
check("...record keeps the rolled atoms verbatim", !!npcRec.rolled.flawSecret && !!npcRec.rolled.bond);
check("...and the DM-only secret survives onto the record", !!npcRec.dm.secret);
const placeRec = win.codexAdd(w, win.rollPlace({ name:"The Cinderyard" }));
check("rollPlace → codexAdd mints a soft location record", placeRec.id === "location:the-cinderyard" && placeRec.kind === "location" && placeRec.status.soft === true);

// --- through the event runtime (the real write path prep/the DM use) ---
const w2 = { id:"w2", name:"Ev", gazetteer:[], factions:[], ledger:[], clock:{day:1,min:360}, revealed:{} };
win.applyEvent(w2, { type:"codex_add", payload: win.rollNPC({ name:"Mire" }), source:"prep" });
check("codex_add event accepts a rollNPC payload", !!win.codexGet(w2,"npc:mire") && win.codexGet(w2,"npc:mire").rolled.role);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
