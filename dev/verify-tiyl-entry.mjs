/* Verify the TIYL entry-wiring fix (Adam's ruling 2026-07-26, fix/tiyl-entry-wiring):
     "hometown should be where you are from and origin should probably be renamed to starting
     location" — plus the dead-code fix in rollEntry's places seeding.

   Two independent bugs, confirmed in source before this branch:
     1. The bardo "hometown" beat rolls place-master-setting (src/creator/bardo.js:14) and the
        world STAGES roll a separate "master" beat (data/creation-flow.js's `master` table, read via
        lookup() in bindWorld) — two INDEPENDENT d100 draws that don't generally match. Pre-fix,
        cgBind (src/creator/sheet.js) set bornWhere to GS.CGEN.spawnWhere||w.seed.master.name —
        i.e. the WORLD seed, never the hometown roll (GS.CGEN.spawnWhere is never actually set
        during a normal bardo passage). Fixed via hometownSettingName(w) (src/world/play.js),
        which extracts the plain name off world.seed.hometown.setting.text — every row of the
        compiled place-master-setting table leads with "Name: description." (confirmed against all
        100 compiled rows at fix time; NOT `**bold**` markdown).
     2. rollEntry (src/engine/world-gen.js) seeded the "places" bundle slot from up to 2 gazetteer
        records via `add("places",g.name,"place")` — forwarding only g.name, dropping g.desc. And
        because those 2 entries almost always exist, the Option-C "still-empty slot" fallback never
        fired for places, so the richer spice-graded EB.places table (data/starting-state.js) never
        rolled in practice. Fixed: gazetteer entries now carry "Name — desc"; one fresh EB.places
        roll is ALWAYS pushed on top (bypassing add()'s 2-item cap), so places can carry up to 3:
        2 canon gazetteer + 1 fresh archetype (a Fable-proposed default — see docs/DESIGN.md).

   Also verifies bindWorld's founding ledger no longer calls the world's first node the character's
   "origin"/birthplace in player-facing text — it now reads "Starting location: X.", parallel to the
   adjacent "Hometown: X · Origin: Y · Myth: Z." line's own label style (that line's own inner
   "Origin:" label is the HOMETOWN's founding history, a different, legitimate sense of the word —
   left untouched; see docs/DESIGN.md).

   Assertions:
     (a) every gazetteer-sourced places bundle entry contains that gazetteer record's desc text.
     (b) at least one places entry comes from the fresh EB.places source ("fresh").
     (c) bornWhere equals the REAL hometown (ht_setting) roll's name, not the world seed's master
         name, when both exist and differ (rolled for real via lookup()/rollTable(), looped until
         they differ — no fixed RNG position asserted, since streams diverge across node versions).
     (d) the ledger carries BOTH a "Starting location: …" fact and a "Hometown: …" fact as distinct
         lines.
     (e) regression: a world with no hometown roll (legacy shape) still falls back to the world's
         master-setting name for bornWhere — unchanged pre-fix behavior.

   Run:  node dev/verify-tiyl-entry.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const srcPaths = man.loadOrder.filter((p) => p.endsWith(".js"));

function boot(){
  const src = srcPaths.map(read).join("\n;\n");
  const dom = new JSDOM(
    `<!doctype html><html><body>
       <div id="bindbar" style="display:none"></div>
       <input id="worldName" value="">
       <div id="stages"></div>
       <div id="worldView"></div>
       <div id="bardoView"></div>
     </body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);
  win.saveU = () => {};
  win.renderWorld = () => {};
  win.showTab = () => {};
  win.toast = () => {};
  win.fetch = () => Promise.resolve({ ok:false });
  return win;
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

/* ── (a)+(b): rollEntry's places bundle — desc-forwarding + the revived EB.places fresh roll ── */
console.log("(a)+(b) rollEntry: gazetteer places carry desc; EB.places fresh roll always present");
{
  const win = boot();
  const gazPlaces = [
    { name:"The Salt-Road Outpost", desc:"a supply depot and garrison midway across a featureless salt steppe" },
    { name:"Three-Candle Way", desc:"a muddy crossroads hub filled with trade wagons" },
  ];
  const w = { id:"wp", name:"PlacesTest", clock:{day:1,min:360}, session:0, ledger:[], log:[],
    gazetteer: gazPlaces.map(p => ({ type:"Place", name:p.name, desc:p.desc, cat:"", discoveredAt:Date.now() })),
    factions:[], pressures:[] };
  const c = { id:"pc1", name:"Vess", bornWhere:"The Salt-Road Outpost", sheet:{ class:"Fighter" } };
  win.rollEntry(w, c);

  const places = (c.entry && c.entry.bundle && c.entry.bundle.places) || [];
  check("places bundle has 3 entries (2 canon gazetteer + 1 fresh)", places.length === 3, JSON.stringify(places));

  const canonEntries = places.filter(p => p.src === "place");
  check("exactly 2 gazetteer-sourced ('place') entries", canonEntries.length === 2, JSON.stringify(canonEntries));
  gazPlaces.forEach(g => {
    const hit = canonEntries.find(p => p.text && p.text.indexOf(g.name) >= 0);
    check(`gazetteer entry for "${g.name}" carries its own desc text`,
      !!hit && hit.text.indexOf(g.desc) >= 0, JSON.stringify(hit));
  });

  const freshEntries = places.filter(p => p.src === "fresh");
  check("at least one places entry comes from the fresh EB.places source", freshEntries.length >= 1, JSON.stringify(places));
  check("the fresh entry has real non-empty text", freshEntries[0] && typeof freshEntries[0].text === "string" && freshEntries[0].text.length > 0,
    JSON.stringify(freshEntries[0]));

  // sanity: the fresh entry's text must NOT equal either canon gazetteer name/desc (proves it's a
  // genuinely separate roll, not an accidental duplicate of a canon entry).
  check("the fresh entry is distinct from both canon gazetteer entries",
    freshEntries[0] && !canonEntries.some(p => p.text === freshEntries[0].text), JSON.stringify({ fresh: freshEntries[0], canon: canonEntries }));
}

console.log("(a)+(b) edge case: zero gazetteer places still yields the fresh EB.places roll alone");
{
  const win = boot();
  const w = { id:"wp0", name:"PlacesTestZero", clock:{day:1,min:360}, session:0, ledger:[], log:[],
    gazetteer: [], factions:[], pressures:[] };
  const c = { id:"pc0", name:"Orin", bornWhere:"Nowhere", sheet:{ class:"Wizard" } };
  win.rollEntry(w, c);
  const places = (c.entry && c.entry.bundle && c.entry.bundle.places) || [];
  check("with 0 gazetteer places, exactly 1 fresh entry lands (no Option-C double-fire)",
    places.length === 1 && places[0].src === "fresh", JSON.stringify(places));
}

/* ── (c)+(d): bornWhere resolves to the REAL hometown roll, not the world seed; ledger carries
   both a distinctly-labeled "Starting location" and "Hometown" fact ── */
console.log("(c)+(d) bornWhere = hometown roll (not world seed); ledger carries both labeled facts");
{
  const win = boot();

  // roll the world's master-setting beat (bindWorld's GS.SEED.master, via lookup()) and the bardo
  // hometown-setting beat (place-master-setting, via rollTable()) FOR REAL — two independent tables
  // — looping until their names differ, so the assertion below is never vacuously true. No fixed
  // RNG position is asserted; only that the wiring reads the right roll once they diverge.
  const nameOfMaster = (r) => r.name;
  const nameOfHometown = (r) => { const m = /^([^:]+):\s*/.exec(r.text || ""); return m ? m[1].trim() : null; };

  let master, hometown, tries = 0;
  do {
    master = win.lookup("master");
    hometown = win.rollTable("place-master-setting");
    tries++;
  } while (nameOfMaster(master) === nameOfHometown(hometown) && tries < 50);
  check("master-setting roll and hometown roll produced names to compare (sanity)",
    !!nameOfMaster(master) && !!nameOfHometown(hometown), JSON.stringify({ master, hometown }));
  check("(fixture) the two rolls actually differ within the retry budget — proves this isn't a vacuous pass",
    nameOfMaster(master) !== nameOfHometown(hometown), `tries=${tries} master=${nameOfMaster(master)} hometown=${nameOfHometown(hometown)}`);

  win.GS.SEED = {
    master,
    smell:{name:"woodsmoke",desc:"woodsmoke"}, sound:{name:"a bell",desc:"a bell"},
    arch:{name:"timber",desc:"timber"}, pressure:{name:"a debt",desc:"a debt"},
    taboo:{name:"iron",desc:"never carry it"},
    myth:{name:"the deep",desc:"something sleeps"},
    faction:{name:"The Wardens",desc:"keep the peace",method:"",agenda:""},
    nearby: [],
    ht_setting: hometown,
    ht_history: win.rollTable("place-history"),
    ht_myth: win.rollTable("place-mythology"),
  };
  win.bindWorld();
  const w = win.U.worlds[win.U.activeWorldId];
  check("world bound", !!w, JSON.stringify(win.U.activeWorldId));
  check("world.seed.hometown.setting carries the real hometown roll",
    w && w.seed && w.seed.hometown && w.seed.hometown.setting && w.seed.hometown.setting.text === hometown.text,
    JSON.stringify(w && w.seed && w.seed.hometown));

  // bind a character through the real cgBind path — no spawnWhere override, so the fix's fallback
  // order (spawnWhere -> hometownSettingName(w) -> w.seed.master.name) is exercised honestly.
  win.GS.CGEN = {
    spawnWhere:null, species:"Human", class:"Fighter", background:"Soldier", pronouns:"they",
    scores:{str:16,dex:13,con:14,int:10,wis:12,cha:8},
    life:null, name:"Vess", skills:[], kit:null, cantrips:[], spells:[], scoreBreak:[],
    featPick:{skills:[],cantrips:[],spells:[]}, toolPicks:{}, languages:[]
  };
  win.cgBind();
  const boundChar = w.characters[w.characters.length - 1];
  const expectedHtName = nameOfHometown(hometown);
  const masterName = nameOfMaster(master);

  check("bornWhere equals the hometown roll's name", boundChar && boundChar.bornWhere === expectedHtName,
    JSON.stringify({ bornWhere: boundChar && boundChar.bornWhere, expected: expectedHtName }));
  check("bornWhere is NOT the world's master-setting name (the pre-fix bug)",
    boundChar && boundChar.bornWhere !== masterName,
    JSON.stringify({ bornWhere: boundChar && boundChar.bornWhere, masterName }));

  const ledger = w.ledger || [];
  const startingLine = ledger.find(e => typeof e.text === "string" && e.text.indexOf("Starting location: ") === 0);
  const hometownLine = ledger.find(e => typeof e.text === "string" && e.text.indexOf("Hometown: ") === 0);
  check(`ledger has a "Starting location: ${masterName}." fact`,
    !!startingLine && startingLine.text === `Starting location: ${masterName}.`, JSON.stringify(startingLine));
  check("ledger has a \"Hometown: …\" fact", !!hometownLine, JSON.stringify(hometownLine));
  check("the two facts are DISTINCT ledger lines (not the same entry re-labeled)",
    !!startingLine && !!hometownLine && startingLine.id !== hometownLine.id, "");
  check("the Hometown fact never says the character was rolled into being AT the master-setting name",
    !!hometownLine && hometownLine.text.indexOf(`rolled into being at ${masterName}`) < 0, JSON.stringify(hometownLine));
}

/* ── (e) regression: no hometown roll on the world (legacy shape) — bornWhere still falls back to
   the world's master-setting name, exactly as before this fix. ── */
console.log("(e) regression: legacy world with no hometown roll still falls back to seed.master.name");
{
  const win = boot();
  const w = { id:"wlegacy", name:"Legacy World", createdAt: Date.now(),
    seed: { master:{name:"Testholm",desc:"a place"}, smell:{name:"smoke"}, sound:{name:"bells"}, arch:{name:"stone"},
            taboo:{name:"iron",desc:"never carry it"}, myth:{name:"the deep",desc:"something sleeps"},
            faction:{name:"The Wardens",desc:"keep the peace"} },   // no `hometown` key at all
    gazetteer: [], characters: [], log: [], ledger: [], clock:{day:1,min:360}, session:0,
    map:{nodes:{},edges:[]}, currentNodeId:null, factions: [], pressures: [] };
  const originId = win.addNode(w, "Testholm", "Setting");
  w.currentNodeId = originId; w.startNodeId = originId; win.seeNode(w, originId);
  win.setNodeXY(w, originId, 0, 0);
  win.U.worlds["wlegacy"] = w; win.U.activeWorldId = "wlegacy";

  win.GS.CGEN = {
    spawnWhere:null, species:"Human", class:"Fighter", background:"Soldier", pronouns:"they",
    scores:{str:16,dex:13,con:14,int:10,wis:12,cha:8},
    life:null, name:"Orin", skills:[], kit:null, cantrips:[], spells:[], scoreBreak:[],
    featPick:{skills:[],cantrips:[],spells:[]}, toolPicks:{}, languages:[]
  };
  win.cgBind();
  const boundChar = w.characters[w.characters.length - 1];
  check("bornWhere falls back to w.seed.master.name when no hometown roll exists",
    boundChar && boundChar.bornWhere === "Testholm", JSON.stringify(boundChar && boundChar.bornWhere));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
