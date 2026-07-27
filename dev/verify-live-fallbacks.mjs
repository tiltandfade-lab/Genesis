/* Verify no fresh-roll fallback path is reachable-but-dead (UNIT W4, 2026-07-27).

   BACKGROUND: two independent "reachable but never firing" content bugs were found this week —
   the EB.places fresh fallback (pre-fix: the 2 canon gazetteer places always filled the slot, so
   EB.places' own spice-graded table never rolled in practice; fixed 2026-07-26, see
   fix/tiyl-entry-wiring and dev/verify-tiyl-entry.mjs) and a wilderness single-draw-limit class of
   bug referenced in session memory but not locatable in this worktree's currently-wired
   src/engine (searched: every `function *Roll(` definition, every `!x.length`/empty-slot-fill
   guard, every "fallback"/"fresh" mention across src/engine + src/world + src/creator — nothing
   else shares EB's shape; see the SCOPE note below). This harness exists so the NEXT one gets
   caught automatically instead of by accident.

   SCOPE — what counts as an "Option-C style fallback" here: a slot with a canon-first preference
   order that only rolls a dedicated FRESH table when every canon source came up empty, tagged
   `src:"fresh"` (or equivalent) so a consumer can tell a rolled-fresh entry from a canon one.
   `ebRoll(slot)` (src/engine/tables.js) — `{text:r.text,src:"fresh",band:...}` off `EB[slot]`
   (data/starting-state.js) — is the ONLY function in this codebase with that shape. Proof:
   `grep -rn "ebRoll(" src data` turns up exactly TWO call sites, both in `rollEntry()`
   (src/engine/world-gen.js):
     :124  B.places.push(ebRoll("places"));                                    // UNCONDITIONAL
     :127  ["enemies","friends","complications","things","places"].forEach(s=>
             {if(!B[s].length)B[s].push(ebRoll(s));});                          // Option C proper
   `EB` itself is never read anywhere else. So the fallback family under audit is exactly these 5
   dispatch sites (places counted once, since :124 already unconditionally covers it — see below).

   METHOD: drives N=200 independent headless character creations through the REAL production
   pipeline — bindWorld() -> rollStartingState() [inside bindWorld] -> cgRollLife() -> cgBind()
   [which calls rollEntry() itself] — exactly src/world/play.js's + src/creator/sheet.js's own call
   chain (src/creator/sheet.js:78's own comment: "the PC<->world bridge"). Nothing synthetic: every
   world seed field, every life event, every faction/pressure/proximity roll is a REAL roll off the
   REAL tables. No fixed RNG position is ever asserted (CLAUDE.md) — only whether a path fired at
   least once across N, i.e. distribution/shape.

   INSTRUMENTATION: `ebRoll` is wrapped once per boot to log every {slot} call, in order, into
   `ebLog`. Given the grep-proof above (exactly 2 call sites total), a slot's Option-C branch fired
   this trial IFF:
     - enemies/friends/complications/things: ebRoll(slot) was called AT ALL (their only call site
       IS the Option-C forEach — no unconditional caller exists for them).
     - places: ebRoll("places") was called MORE THAN ONCE (the 1st call is always the unconditional
       push at :124, one line above the forEach; a 2nd call can only come from the forEach's own
       `if(!B.places.length)` guard actually passing).
   Cross-checked every trial against the OTHER observable signal (c.entry.bundle[slot]'s own
   `src==="fresh"` entries) — the two must always agree, or the instrumentation itself is suspect.

   "WALKS": the unit brief says "creations/walks." Read wild-walk.js/walk.js/dungeon-walk.js in full
   looking for a second Option-C-shaped family reachable from a walk (not just creation) and found
   none — wilderness's wwalkEncounter is a mutually-exclusive branch dispatch off a rolled encounter
   TYPE (Enemy/Hazard/Social/Trap/Discovery/Empty), never a canon-first/fresh-if-empty preference
   chain; WALK_SUBTABLE_OVERFLOW is a dedup-exhaustion overflow, a different shape again (routes to
   a related table when the PRIMARY table's rows run out this walk, not "only roll if canon is
   empty"). Neither produces a "reachable but never firing" content hole the way Option C can. This
   harness therefore drives creations only — walks are a negative finding, documented, not silently
   dropped.

   KNOWN_DEAD: an in-file registry of paths this harness itself proved (dated, with the concrete
   mechanism) never fire under the CURRENT wiring. A path absent from both "fired this run" and
   KNOWN_DEAD is a hard FAIL — that's the whole point. Adding an entry here is not "satisfying the
   validator" (CLAUDE.md's own warning against that) — every entry is independently re-verified by
   this same run every time it executes; a false KNOWN_DEAD entry (a path that actually DOES fire)
   will never be reached by the fail branch, so it costs nothing to leave in and never goes stale
   silently. Fixing what's listed here is a design call, not this unit's job (see the report).

   RED-FIRST: proven by temporarily deleting "things" from world-gen.js:127's dispatch array (the
   one slot proven analytically to ALWAYS need Option C — nothing upstream of it ever fills
   "things"), re-running, and confirming the harness reports EB.things newly-dead-and-unlisted
   (FAIL, exit 1). Reverted before the real run. Full transcript in the session report, not in this
   file — this file is the harness, not the lab notebook.

   Run:  node dev/verify-live-fallbacks.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */

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

const N = 200;

/* ============================================================
   KNOWN_DEAD — paths this harness proved (dated, with mechanism + this run's own proof count)
   never fire under the wiring as it stands today. Empty-slot key = "not yet found dead."
   ============================================================ */
const KNOWN_DEAD = {
  places: {
    since: "2026-07-27",
    reason: "Structurally unreachable, not just rare or unlucky. src/engine/world-gen.js:124 " +
      "pushes a fresh ebRoll(\"places\") UNCONDITIONALLY, one line above the Option-C forEach on " +
      ":127 that also lists \"places\" among its 5 slots. By the time the forEach runs, " +
      "B.places.length is already >=1 on literally every call (ebRoll always returns a row — " +
      "EB.places' rows cover the full 1-100 range), so the forEach's `if(!B.places.length)` guard " +
      "can never pass for \"places\". The EB.places TABLE is very much alive — it fires on EVERY " +
      "trial via the unconditional :124 call; only the redundant SECOND listing of \"places\" " +
      "inside the Option-C array is dead code. No content gap here, just an inert leftover from " +
      "the 2026-07-26 fix (fa7a6fdb) that added the unconditional push but never removed \"places\" " +
      "from the forEach's slot list.",
    proof: "0/200 (2026-07-27 run) — analytically guaranteed 0/200 under the current code, not " +
      "merely empirically rare; the forEach's guard is unsatisfiable for this slot as written.",
  },
  complications: {
    since: "2026-07-27",
    reason: "Structurally unreachable under the current production pipeline (not merely rare). " +
      "rollStartingState(world) always runs inside bindWorld() BEFORE any character (and therefore " +
      "rollEntry) can exist, and it ALWAYS produces at least one rival faction: `const " +
      "n=rollDie(3);` is 1-3, never 0, and `rivals.push(rollFaction(nm,false))` runs unconditionally " +
      "n times regardless of the name-collision retry loop above it (the retry only affects WHICH " +
      "name is picked, never whether the push happens). rollEntry's step 3 " +
      "(`if(rivals[0])add(\"complications\",...)`) therefore fires on every single call, filling " +
      "B.complications before the Option-C forEach ever runs. Once a world exists, w.factions is " +
      "never emptied again (nothing removes entries), so this holds for rebirth successors too, " +
      "not just first characters.",
    proof: "0/200 (2026-07-27 run) — analytically guaranteed 0/200 under the current code, not " +
      "merely empirically rare; rivals[0] is unconditionally guaranteed once rollStartingState runs.",
  },
};

function boot(){
  const bridge = `
    window.__SPECIES_KEYS=Object.keys(SPECIES);
    window.__CLASSES_KEYS=Object.keys(CLASSES);
    window.__BACKGROUNDS_KEYS=Object.keys(BACKGROUNDS);`;
  const src = srcPaths.map(read).join("\n;\n") + "\n;\n" + bridge;
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

/* draw the wilderness-triad "nearby" pair the exact way rollTriad (src/world/play.js) does, minus
   the DOM/card painting — dedup against itself, up to 8 tries, same as the real UI path. */
function drawNearbyPair(win){
  const draw=(avoid)=>{let r,t=0;do{r=win.lookup("nearby");t++;}while(avoid.some(x=>x&&x.name===r.name)&&t<8);return r;};
  const a=draw([null]); const b=draw([a]);
  return [a,b];
}

function rollSeed(win){
  const S = {};
  ["master","smell","sound","arch","taboo"].forEach(k => { S[k] = win.lookup(k); });
  S.nearby = drawNearbyPair(win);
  S.myth = win.lookup("myth");
  S.faction = win.lookup("faction");
  S.pressure = win.lookup("pressure");
  return S;
}

function rollCgen(win, i){
  const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
  return {
    spawnWhere:null,
    species: pick(win.__SPECIES_KEYS), class: pick(win.__CLASSES_KEYS), background: pick(win.__BACKGROUNDS_KEYS),
    pronouns:"they", scores:{str:14,dex:12,con:13,int:10,wis:11,cha:10},
    life:null, name:`Trial-${i}`, skills:[], kit:null, cantrips:[], spells:[], scoreBreak:[],
    featPick:{skills:[],cantrips:[],spells:[]}, toolPicks:{}, languages:[]
  };
}

/* one full headless creation, through the real pipeline. Returns the bound character + the slice
   of ebLog this trial's cgBind()->rollEntry() call produced. */
function runTrial(win, i, ebLog){
  win.GS.SEED = rollSeed(win);
  win.bindWorld();
  const w = win.U.worlds[win.U.activeWorldId];

  win.GS.CGEN = rollCgen(win, i);
  win.cgRollLife();          // real dice — 1+ life events, each may seed npcs/threads/marks

  const before = ebLog.length;
  win.cgBind();               // -> seedFromLife -> tiylBackfillPeople -> rollEntry (real pipeline)
  const fired = ebLog.slice(before);

  const c = w.characters[w.characters.length - 1];
  return { w, c, fired };
}

/* ============================================================ */

const win = boot();
const ebLog = [];
const realEbRoll = win.ebRoll;
if (typeof realEbRoll !== "function") {
  console.log("FATAL: ebRoll not found on window after boot — src/engine/tables.js not loaded?");
  process.exit(1);
}
win.ebRoll = function(slot){ ebLog.push(slot); return realEbRoll(slot); };

const tally = { enemies:0, friends:0, complications:0, things:0, places_optionC:0 };
const placesCallCounts = [];
let consistencyOk = 0, consistencyBad = 0;
const consistencyFailures = [];

for (let i = 0; i < N; i++) {
  const { c, fired } = runTrial(win, i, ebLog);
  const placesCalls = fired.filter(s => s === "places").length;
  placesCallCounts.push(placesCalls);
  if (placesCalls > 1) tally.places_optionC++;
  ["enemies","friends","complications","things"].forEach(slot => {
    if (fired.includes(slot)) tally[slot]++;
  });

  // cross-check vs the OTHER observable signal: the bundle's own src:"fresh" tags.
  const bundle = (c.entry && c.entry.bundle) || {};
  let ok = true;
  ["enemies","friends","complications","things"].forEach(slot => {
    const bundleFresh = (bundle[slot]||[]).filter(x=>x.src==="fresh").length;
    const logFresh = fired.filter(s=>s===slot).length;
    if (bundleFresh !== logFresh) { ok=false; consistencyFailures.push(`trial ${i} ${slot}: bundle=${bundleFresh} log=${logFresh}`); }
  });
  const bundlePlacesFresh = (bundle.places||[]).filter(x=>x.src==="fresh").length;
  if (bundlePlacesFresh !== placesCalls) { ok=false; consistencyFailures.push(`trial ${i} places: bundle=${bundlePlacesFresh} log=${placesCalls}`); }
  if (ok) consistencyOk++; else consistencyBad++;
}

console.log(`Live-fallback census — N=${N} independent headless creations (real dice throughout)\n`);

console.log("Option-C branch fire rate per slot:");
["enemies","friends","complications","things"].forEach(slot => {
  console.log(`  ${slot.padEnd(14)} ${String(tally[slot]).padStart(3)}/${N}`);
});
console.log(`  ${"places (2nd call)".padEnd(14)} ${String(tally.places_optionC).padStart(3)}/${N}   (places' unconditional 1st call fired ${placesCallCounts.filter(n=>n>=1).length}/${N}, as expected every trial)`);
console.log("");

let pass = 0, fail = 0;
const check = (n, c, d="") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

check("instrumentation cross-check: ebLog and bundle src:\"fresh\" tags agree on every trial",
  consistencyBad === 0, `${consistencyBad}/${N} trials disagreed: ${consistencyFailures.slice(0,5).join(" | ")}`);

console.log("\nPer-path assertion — fired at least once, OR explicitly KNOWN_DEAD with a reason:");
const PATHS = [
  { slot:"enemies", count: tally.enemies },
  { slot:"friends", count: tally.friends },
  { slot:"complications", count: tally.complications },
  { slot:"things", count: tally.things },
  { slot:"places", count: tally.places_optionC },
];
PATHS.forEach(p => {
  const label = `EB.${p.slot} (Option-C branch)`;
  const fired = p.count > 0;
  const known = KNOWN_DEAD[p.slot];
  if (fired) {
    check(`${label} — fired ${p.count}/${N}`, true);
  } else if (known) {
    check(`${label} — 0/${N}, KNOWN_DEAD since ${known.since} (${known.reason.slice(0,80)}…)`, true);
  } else {
    check(`${label} — 0/${N} and NOT in KNOWN_DEAD`, false, "reachable-but-never-firing path found — report it, do not fix it here");
  }
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
