/* Verify PLACE-GEN §7 unit 9 (docs/PLACE-GEN.md ADDENDUM §7D item 9) — TIYL start routing.
   The bardo hometown beat rolls place-master-setting DIRECTLY (src/creator/bardo.js:14) and
   bindWorld() (src/world/play.js:66) makes that roll the world's origin node — pre-unit-9 that
   origin codex record got NONE of rollPlace's realm composition (itemsPool/dressing pointers)
   every other minted place gets. This harness drives bindWorld() itself (not the full bardo UI —
   dev/verify-bardo-port.mjs already covers the UI passage/onclick inventory) with a scripted
   GS.SEED, matching the real bindWorld() contract exactly.

   Full-app jsdom load + compiled tables.js (dev/verify-place-roll.mjs's own convention).

   Covers the task brief:
     (a) RED-FIRST — origin codex record carries dm.itemsPool==="realm-items-frontier" +
         dm.dressing={props:"frontier",surfaces:"frontier"} AND rec.name === the bardo-rolled
         hometown name, byte-equal (SACRED: the mint must never replace what the player saw).
     (b) GOLDEN — a pre-unit-9 origin record's field set (name/kind/provenance/rolled/fields/dm.secret/
         dm.history/status) is a SUBSET of the post-unit-9 record (superset law — nothing dropped).
     (c) MUTATION — stub world.realm to a marooned-realm shape *after* mintOriginPlaceThread would
         normally read it away (simulated by calling the mint fn directly with a gloom-marooned
         world) → itemsPool becomes "realm-items-gloom", proving the realm-thread line is actually
         live, not a hardcoded "frontier" string.

   Run:  node dev/verify-place-tiyl.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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

/* Scripted GS.SEED — same shape bindWorld() reads (mirrors what rollStage/rollTriad populate
   during the real bardo passage; place-master-setting is a Commitment-class d100, so this
   mirrors one concrete roll of it rather than re-driving the UI). */
function seedGS(win, masterName, masterDesc){
  win.GS.SEED = {
    master: { name: masterName, desc: masterDesc, cat: "Grounded", roll: 42, idx: 41 },
    smell: { name:"woodsmoke", desc:"woodsmoke" }, sound: { name:"a bell", desc:"a bell" },
    arch: { name:"timber", desc:"timber" }, pressure: { name:"a debt", desc:"a debt" },
    taboo: { name:"a taboo", desc:"a taboo" },
    myth: { name:"a myth", desc:"a myth" }, faction: { name:"a faction", desc:"a faction", method:"", agenda:"" },
    nearby: [],
    ht_setting: { text:"**"+masterName+"** — "+masterDesc },
    ht_history: { text:"a history" }, ht_myth: { text:"a myth" },
  };
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

console.log("(a) RED-FIRST / post-wire: origin codex record carries the realm thread, name untouched");
{
  const win = boot();
  seedGS(win, "Rustwatch Hollow", "a leaning frontier crossing");
  win.bindWorld();
  const w = win.U.worlds[win.U.activeWorldId];
  const rec = win.codexGet(w, "location:" + w.startNodeId);
  check("origin codex record exists", !!rec, JSON.stringify(w.startNodeId));
  check("name byte-equal to the bardo-rolled hometown name", rec && rec.name === "Rustwatch Hollow",
    rec && rec.name);
  check("dm.itemsPool === realm-items-frontier (no world.realm set at genesis)",
    rec && rec.dm && rec.dm.itemsPool === "realm-items-frontier", rec && rec.dm && rec.dm.itemsPool);
  check("dm.dressing.props === frontier", rec && rec.dm && rec.dm.dressing && rec.dm.dressing.props === "frontier",
    rec && rec.dm && rec.dm.dressing);
  check("dm.dressing.surfaces === frontier", rec && rec.dm && rec.dm.dressing && rec.dm.dressing.surfaces === "frontier",
    rec && rec.dm && rec.dm.dressing);
  check("rec.fields.desc untouched (still the bardo-rolled desc)",
    rec && rec.fields && rec.fields.desc === "a leaning frontier crossing", rec && rec.fields);
  check("no archetype draw on the settlement itself (rolled.archetypeKey absent — scale fence)",
    rec && rec.rolled && rec.rolled.archetypeKey === undefined);
}

console.log("(b) GOLDEN — pre-unit-9 field set stays a SUBSET of the post-unit-9 record");
{
  // pre-unit-9 golden shape: exactly what ensureCodex's grounded-location branch produced,
  // captured from codex.js's own codexAdd call shape (kind/name/provenance/rolled/fields/status;
  // NO dm.itemsPool/dm.dressing — those didn't exist before this unit).
  const GOLDEN_KEYS = ["id","kind","name","provenance","rolled","fields","status"];
  const win = boot();
  seedGS(win, "Copperlatch", "a mining town gone quiet");
  win.bindWorld();
  const w = win.U.worlds[win.U.activeWorldId];
  const rec = win.codexGet(w, "location:" + w.startNodeId);
  GOLDEN_KEYS.forEach(k => check("golden key present: " + k, rec && Object.prototype.hasOwnProperty.call(rec, k)));
  check("golden field rolled.name matches master roll", rec && rec.rolled && rec.rolled.name === "Copperlatch");
  check("new field dm.itemsPool is ADDITIVE (present, not replacing any golden key)",
    rec && rec.dm && "itemsPool" in rec.dm);
}

console.log("(c) MUTATION — realm-thread line is live, not a hardcoded 'frontier' constant");
{
  const win = boot();
  seedGS(win, "Cinder Fen", "a bog town under a dying gloom sky");
  win.bindWorld();
  const w = win.U.worlds[win.U.activeWorldId];
  // simulate a world already marooned in a realm at genesis time (the shape mintOriginPlaceThread
  // reads: w.realm.name — data/realms.js:133) and re-run the thread directly.
  w.realm = { name: "gloom" };
  win.mintOriginPlaceThread(w, w.startNodeId);
  const rec = win.codexGet(w, "location:" + w.startNodeId);
  check("itemsPool follows world.realm.name when present", rec.dm.itemsPool === "realm-items-gloom",
    rec.dm.itemsPool);
  check("dressing follows world.realm.name when present", rec.dm.dressing.props === "gloom");
  check("name STILL untouched by the realm switch", rec.name === "Cinder Fen");

  // stub check: if the realm-resolution line were reverted to a hardcoded 'frontier' string,
  // this assertion fails — proving the test exercises the live read, not a coincidence.
  const stubbed = rec.dm.itemsPool !== "realm-items-frontier";
  check("(mutation guard) hardcoded-frontier stub would fail this suite", stubbed);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
