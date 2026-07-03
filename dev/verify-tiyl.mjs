/* Verify docs/TIYL-DEEPENING.md — "This Is Your Life" deepening (names · presentation · the prep
   bridge). Reconciled against merged reality (BATCH2-GUARDRAILS levelup-picker precedent — read the
   actual code, log differences):
     - lifeGold → sheet.gold was ALREADY WIRED (src/creator/sheet.js cgSheetExtras' lifeGp) — §0's
       claim it's "computed but never lands on the sheet" does not hold against the merged code. This
       harness asserts the existing wiring (regression-style) rather than re-fixing a non-gap.
     - marks (§3.1) land on sheet.marks[] — real fix. The "+ codex record" half of §3.1 is NOT built:
       no PC codex record exists anywhere in this codebase (confirmed — the PC lives on
       w.characters[] only), and minting one would ride codexDigest's "every kind but region" filter
       every turn, fighting DIGEST-DIET's own byte-budget discipline. Flagged in uncertainties.
     - people get atoms (§3.3): tiylBackfillPeople mints a full rollNPC() codex record for every
       TIYL-seeded person at bind time (opts.name has nothing to preserve — TIYL never rolled these
       people a proper name, only a role label + prose; the connecting identity rides fields.tiylRole).
     - threads feed prep (§3.4): pbundleTiylThread/pbundleApplyTiylBias bias the FIRST session's first
       frontier hook toward an unresolved TIYL thread (additive hook.tiylBias field).
     - the biography rides the handoff ONCE (§3.5): tiylLifeDigest, wired into dmDigest().pc.life,
       gated the same send-once way as dmDigest().setting (foundingTurn).
     - world/PC-name options (§1): worldNameOptions()/charNameOptions() (new module
       src/creator/world-name.js), wired into bardo.js's "found" step as 3 chips + free text (free
       text always wins — the input's value is still what bardoWake/bardoFound read).
     - presentation (§2): the `show` fade class now applies to the life-chain reveal too (previously
       only world/hometown steps had it). The spec's "streamDMText-style pace on Strange+ rows only"
       is NOT built — CG's life tables (data/character-genesis.js) carry no spice-band tag on any row
       to key a band-conditional pace off; flagged, not guessed.

   Assertions:
   1. globals present.
   2. worldNameOptions()/charNameOptions() return 3 distinct, non-empty names (table-backed path).
   3. a "mark" tag lands on sheet.marks[] via cgHandleSec→seedFromLife (MUTATION CHECK: neuter the
      mark branch, harness shows the mark missing, then restore — shown RED then GREEN).
   4. lifeGold lands on sheet.gold (regression-style — MUTATION CHECK: neuter cgSheetExtras' lifeGp
      read, harness shows gold short by the life gold, then restore — shown RED then GREEN).
   5. tiylBackfillPeople mints a rollNPC-shaped codex record (rolled.race/role/quirk/… present) for
      every npc-life ledger entry, carrying fields.tiylRole as the connecting identity.
   6. pbundleTiylThread finds an unresolved TIYL thread; pbundleApplyTiylBias attaches hook.tiylBias
      to environments[0] ONLY, leaving hook.macguffin/complication/questgiverPitch byte-untouched.
   7. dmDigest().pc.life is present + non-null the FIRST turn (foundingTurn) and null every turn after.
   8. regression: dev/verify-capture.mjs and dev/verify-levelup-picker.mjs stay green (0 failed).

   Run:  node dev/verify-tiyl.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const srcPaths = man.loadOrder.filter((p) => p.endsWith(".js"));

function boot(){
  const src = srcPaths.map(read).join("\n;\n");
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="bardoView"></div></body></html>`,
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

let win = boot();

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ── 1. globals present ────────────────────────────────────────────────────
for (const f of ["worldNameOptions","charNameOptions","tiylBackfillPeople","seedFromLife",
  "pbundleTiylThread","pbundleApplyTiylBias","tiylLifeDigest","assemblePrepBundle","dmDigest"])
  check(`global ${f}`, typeof win[f] === "function", typeof win[f]);

// ── helper: build a fresh world + a bound TIYL character via the real ritual paths ──
function freshWorld(id){
  const w = { id, name:"Test World "+id, createdAt:Date.now(),
    seed:{ master:{name:"Testholm", desc:"a place"}, smell:{name:"smoke"}, sound:{name:"bells"}, arch:{name:"stone"},
           taboo:{name:"iron", desc:"never carry it"}, myth:{name:"the deep", desc:"something sleeps"},
           faction:{name:"The Wardens", desc:"keep the peace"} },
    gazetteer:[], characters:[], log:[], ledger:[], clock:{day:1,min:360}, session:0,
    map:{nodes:{},edges:[]}, currentNodeId:null, factions:[], pressures:[] };
  const originId = win.addNode(w, "Testholm", "Setting");
  w.currentNodeId = originId; w.startNodeId = originId; win.seeNode(w, originId);
  win.setNodeXY(w, originId, 0, 0);
  win.U.worlds[id] = w; win.U.activeWorldId = id;
  return w;
}

// a life object shaped like cgRollLife's real output, WITH one tagged "mark" seed (adventures row 1-10)
// and one "enemy" seed + a search thread, so backfill/thread-bias both have real material to work on.
function makeCgen(){
  return {
    spawnWhere:null, species:"Human", class:"Fighter", background:"Soldier", pronouns:"they",
    scores:{str:16,dex:13,con:14,int:10,wis:12,cha:8},
    life:null, name:"Vess", skills:[], kit:null, cantrips:[], spells:[], scoreBreak:[],
    featPick:{skills:[],cantrips:[],spells:[]}, toolPicks:{}, languages:[]
  };
}

// cgMakeEvent's sub-table roll (cgLookup(tag)) always re-rolls internally via rollDie/Math.random — it
// does NOT read ev.total. To land a DETERMINISTIC sub-row (needed for the mark/thread assertions below)
// this queues exact rollDie() return values for the duration of the callback, then restores the real fn.
function withRollDieQueue(w, queue, fn){
  const real = w.rollDie;
  const q = queue.slice();
  w.rollDie = (max) => q.length ? q.shift() : real(max);
  try { return fn(); } finally { w.rollDie = real; }
}

win.GS.CGEN = makeCgen();
{
  const g = win.GS.CGEN;
  // simulate cgRollLife's shape directly (deterministic, no dice dependency for the harness):
  g.life = { origins:{ birthplace:{text:"In a barn or outbuilding"}, family:{text:"Mother and father"},
                        lifestyle:{text:"Modest"} },
             decisions:{ background:{roll:1,text:"I took up arms to keep the things in the dark away from my people."},
                         classTraining:{roll:1,text:"I took up arms to keep the things in the dark away from my people."} },
             events:[], age:"21–30" };
  // event 1: an "enemy" seed (npc, name-less — role+desc only, exactly what entrySeeds/backfill sees)
  const ev1 = win.cgMakeEvent({ total:35, text:"You made an enemy of a wanderer like yourself.", tag:"enemy" });
  g.life.events.push(ev1);
  // event 2: an "adventures" roll — force the sub-table's d100 lookup (cgLookup("adventures") rolls
  // 1dCG.adventures.die = 1d100) to land on row 1 (1-10, "scars, and you're missing…", tag:"mark").
  const ev2 = withRollDieQueue(win, [1], () =>
    win.cgMakeEvent({ total:76, text:"You went out on an adventure.", tag:"adventures" }));
  g.life.events.push(ev2);
  g.lifeGold = 47; // simulate banked life-gold the way cgMakeEvent accumulates it (kept deterministic here)
}

// ── 2. worldNameOptions()/charNameOptions() ───────────────────────────────
{
  const wn = win.worldNameOptions(3);
  check("worldNameOptions returns 3 names", Array.isArray(wn) && wn.length === 3, JSON.stringify(wn));
  check("worldNameOptions names are distinct non-empty strings",
    wn.every(n => typeof n === "string" && n.length > 0) && new Set(wn).size === wn.length, JSON.stringify(wn));

  const cn = win.charNameOptions("Human", 3);
  check("charNameOptions returns 3 names", Array.isArray(cn) && cn.length === 3, JSON.stringify(cn));
  check("charNameOptions names are distinct non-empty strings",
    cn.every(n => typeof n === "string" && n.length > 0) && new Set(cn).size === cn.length, JSON.stringify(cn));
}

// ── build the world + bind the character through the real cgBind path ────
const w1 = freshWorld("w1");
win.ensureCodex(w1);
win.bindWorld ? null : null; // (bindWorld itself rolls a fresh GS.SEED — we already hand-built w1 for determinism)
win.GS.SEED = null; // guard: cgBind doesn't touch GS.SEED, only bindWorld does — not exercised here
win.cgBind();
const boundChar = w1.characters[w1.characters.length - 1];

// ── 3. marks land on sheet.marks[] (MUTATION CHECK) ───────────────────────
{
  check("mark event seeded {kind:'mark'} in cgMakeEvent output",
    win.GS.CGEN === null && Array.isArray(boundChar && boundChar.life && boundChar.life.events), "cgBind clears GS.CGEN");
  const marks = boundChar && boundChar.sheet && boundChar.sheet.marks;
  check("sheet.marks[] is populated from the rolled 'mark' life event",
    Array.isArray(marks) && marks.length >= 1 && /scar|miss/i.test(marks[0] || ""), JSON.stringify(marks));

  // MUTATION: neuter cgHandleSec's mark branch, rebuild, confirm the harness catches the regression, restore.
  const origSrc = read("src/creator/life.js");
  const mutated = origSrc.replace(
    'else if(t==="mark")seeds.push({kind:"mark",text:sec.text});',
    'else if(t==="mark"){/* mutated: mark branch neutered */}'
  );
  if (mutated === origSrc) { fail++; console.log("  ✗ mutation target string not found in src/creator/life.js — cannot mutate"); }
  else {
    const winM = (() => {
      const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="bardoView"></div></body></html>`,
        { runScripts: "dangerously", url: "http://localhost/" });
      const w2 = dom.window;
      const srcMutated = srcPaths.map(p => p === "src/creator/life.js" ? mutated : read(p)).join("\n;\n");
      w2.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + srcMutated);
      w2.saveU = () => {}; w2.renderWorld = () => {}; w2.showTab = () => {}; w2.toast = () => {};
      w2.fetch = () => Promise.resolve({ ok:false });
      return w2;
    })();
    const wM = (() => {
      const w = { id:"wm", name:"Mutation World", createdAt:Date.now(),
        seed:{ master:{name:"M",desc:"m"}, smell:{name:"m"}, sound:{name:"m"}, arch:{name:"m"},
               taboo:{name:"m",desc:"m"}, myth:{name:"m",desc:"m"}, faction:{name:"m",desc:"m"} },
        gazetteer:[], characters:[], log:[], ledger:[], clock:{day:1,min:360}, session:0,
        map:{nodes:{},edges:[]}, currentNodeId:null, factions:[], pressures:[] };
      const originId = winM.addNode(w, "M", "Setting"); w.currentNodeId=originId; w.startNodeId=originId;
      winM.seeNode(w, originId); winM.setNodeXY(w, originId, 0, 0);
      winM.U.worlds["wm"] = w; winM.U.activeWorldId = "wm";
      return w;
    })();
    winM.ensureCodex(wM);
    winM.GS.CGEN = makeCgen();
    const g = winM.GS.CGEN;
    g.life = { origins:{ birthplace:{text:"x"}, family:{text:"Mother and father"}, lifestyle:{text:"Modest"} },
               decisions:{ background:{roll:1,text:"x"}, classTraining:{roll:1,text:"x"} }, events:[], age:"21–30" };
    const evM = withRollDieQueue(winM, [1], () =>
      winM.cgMakeEvent({ total:76, text:"You went out on an adventure.", tag:"adventures" }));
    g.life.events.push(evM);
    winM.cgBind();
    const boundM = wM.characters[wM.characters.length - 1];
    const marksAfterMutation = boundM && boundM.sheet && boundM.sheet.marks;
    check("MUTATION shown RED: neutering the mark branch loses the mark off the sheet",
      !marksAfterMutation || marksAfterMutation.length === 0, JSON.stringify(marksAfterMutation));
    check("RESTORED: the real (unmutated) build still lands the mark (re-checked above)", marks.length >= 1);
  }
}

// ── 3b. REVIEW FIX: a mark seed must ride the SAME resolved {a|b|c} branch pick as the biography
// detail (no independent re-roll → no self-contradiction) AND must never leak an unrolled NdM literal
// (e.g. "1d3 fingers") onto the sheet. Force adventures row 1-10 (a branch WITH inline dice) via a
// deterministic rollDie queue: [1]=table lookup lands row 1-10, [2]=branch pick "1d3 fingers",
// [1]=the 1d3 roll itself resolves to 1. Exactly 3 rollDie calls if (and only if) the mark text is
// derived from the single resolved `detail` pass rather than re-resolving independently.
{
  const evMark = withRollDieQueue(win, [1, 2, 1], () =>
    win.cgMakeEvent({ total:76, text:"You went out on an adventure.", tag:"adventures" }));
  const markSeed = (evMark.seeds || []).find(s => s.kind === "mark");
  check("mark seed exists on the forced adventures row 1-10 event", !!markSeed, JSON.stringify(evMark.seeds));
  check("mark seed carries no unrolled NdM dice literal (e.g. '1d3')",
    markSeed && !/\d+d\d+/i.test(markSeed.text || ""), JSON.stringify(markSeed));
  check("mark seed text matches the biography detail exactly (same resolved branch pick, not a second independent roll)",
    markSeed && markSeed.text === evMark.detail, JSON.stringify({ mark: markSeed && markSeed.text, detail: evMark.detail }));
  check("mark seed's rolled dice value is baked in (the specific '1' from the queued 1d3 roll)",
    markSeed && /\bmissing 1 fingers\b/.test(markSeed.text || ""), JSON.stringify(markSeed));
}

// ── 4. lifeGold lands on sheet.gold (regression-style; MUTATION CHECK) ────
{
  const kit = (win.CLASS_KIT && win.CLASS_KIT[boundChar.sheet.class]) || [];
  const kitGp = (kit.find(o => o.id === boundChar.sheet.kit) || {}).gp || 0;
  check("sheet.gold includes the banked life-gold on top of kit gold",
    boundChar.sheet.gold === kitGp + 47, `gold=${boundChar.sheet.gold} kitGp=${kitGp} expected=${kitGp+47}`);

  const origSrc = read("src/creator/sheet.js");
  const mutated = origSrc.replace(
    "const lifeGp=g.lifeGold||0;",
    "const lifeGp=0; /* mutated: life gold read neutered */"
  );
  if (mutated === origSrc) { fail++; console.log("  ✗ mutation target string not found in src/creator/sheet.js — cannot mutate"); }
  else {
    const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="bardoView"></div></body></html>`,
      { runScripts: "dangerously", url: "http://localhost/" });
    const w2 = dom.window;
    const srcMutated = srcPaths.map(p => p === "src/creator/sheet.js" ? mutated : read(p)).join("\n;\n");
    w2.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + srcMutated);
    w2.saveU = () => {}; w2.renderWorld = () => {}; w2.showTab = () => {}; w2.toast = () => {};
    w2.fetch = () => Promise.resolve({ ok:false });
    const wM2 = { id:"wm2", name:"Mutation World 2", createdAt:Date.now(),
      seed:{ master:{name:"M",desc:"m"}, smell:{name:"m"}, sound:{name:"m"}, arch:{name:"m"},
             taboo:{name:"m",desc:"m"}, myth:{name:"m",desc:"m"}, faction:{name:"m",desc:"m"} },
      gazetteer:[], characters:[], log:[], ledger:[], clock:{day:1,min:360}, session:0,
      map:{nodes:{},edges:[]}, currentNodeId:null, factions:[], pressures:[] };
    const originId2 = w2.addNode(wM2, "M", "Setting"); wM2.currentNodeId=originId2; wM2.startNodeId=originId2;
    w2.seeNode(wM2, originId2); w2.setNodeXY(wM2, originId2, 0, 0);
    w2.U.worlds["wm2"] = wM2; w2.U.activeWorldId = "wm2";
    w2.ensureCodex(wM2);
    w2.GS.CGEN = makeCgen();
    const g2 = w2.GS.CGEN;
    g2.life = { origins:{ birthplace:{text:"x"}, family:{text:"Mother and father"}, lifestyle:{text:"Modest"} },
                decisions:{ background:{roll:1,text:"x"}, classTraining:{roll:1,text:"x"} }, events:[], age:"21–30" };
    g2.lifeGold = 47;
    w2.cgBind();
    const boundM2 = wM2.characters[wM2.characters.length - 1];
    check("MUTATION shown RED: neutering the lifeGp read drops gold back to just kit gp",
      boundM2.sheet.gold === kitGp, `gold=${boundM2.sheet.gold} expected(mutated)=${kitGp}`);
    check("RESTORED: the real (unmutated) build still adds life-gold (re-checked above)",
      boundChar.sheet.gold === kitGp + 47);
  }
}

// ── 5. tiylBackfillPeople mints rollNPC-shaped codex records ─────────────
{
  const npcRecs = Object.values(win.codexOf(w1).records).filter(r => r.kind === "npc" && r.dm && r.dm.tiylFromChar === boundChar.id);
  check("tiylBackfillPeople minted at least one codex npc for the TIYL 'enemy' seed", npcRecs.length >= 1, JSON.stringify(npcRecs.map(r=>r.id)));
  const rec = npcRecs[0];
  check("backfilled npc carries a full rollNPC atom (rolled.race/role/quirk/mannerism/flawSecret/bond/fear/leverage/want/motivation)",
    rec && rec.rolled && ["race","role","quirk","mannerism","flawSecret","bond","fear","leverage","want","motivation"].every(k => k in rec.rolled),
    JSON.stringify(rec && rec.rolled));
  check("backfilled npc's fields.tiylRole carries the seeded role text (the connecting identity)",
    rec && rec.fields && typeof rec.fields.tiylRole === "string" && rec.fields.tiylRole.length > 0, JSON.stringify(rec && rec.fields));
  check("backfilled npc has a real minted name (TIYL never rolled one; rollNPC always mints fresh)",
    rec && typeof rec.name === "string" && rec.name.length > 0, JSON.stringify(rec && rec.name));
}

// ── 5b. SD-004/SD-005: species binding + TIYL-relationship attitude init (MUTATION CHECKS) ─────
// SD-004 (shakedown finding): tiylBackfillPeople minted a codex record whose fields.species came from
// an INDEPENDENT rollNPC({}) race roll, disconnected from the species cgPersonDesc() already rolled
// into the tiylDesc prose — "a elf sailor" landed on a Dwarf record. SD-005: attitude init never read
// the TIYL relationship stance (cgHandleSec's sub-table tag, e.g. "hostile") — "former friend, now
// hostile" shipped as the lazy Indifferent/0 default.
// Build a DETERMINISTIC "hostile" tragedies event (die:12 row 3 → tag "hostile") with a forced dwarf
// race roll (CG.race row 41-50) so both the prose and the bound record are checkable byte-for-byte.
{
  const w5 = freshWorld("w5");
  win.ensureCodex(w5);
  win.GS.CGEN = makeCgen();
  win.GS.CGEN.name = "Oriff";
  const g5 = win.GS.CGEN;
  g5.life = { origins:{ birthplace:{text:"x"}, family:{text:"Mother and father"}, lifestyle:{text:"Modest"} },
              decisions:{ background:{roll:1,text:"x"}, classTraining:{roll:1,text:"x"} }, events:[], age:"21–30" };
  // queue: [1]=tragedies d12 lookup->row 3 ("hostile"); cgPersonDesc then rolls occupation(1)=91->Sailor
  // (91-95, no reroll branch), race(1)=45->dwarf (41-50), relationship(3 dice)=1,1,1->total 3 (3-4 band),
  // status(3 dice)=1,1,1->total 3 (3-3 band, "dead"/"death" — irrelevant to this check, just deterministic).
  const evH = withRollDieQueue(win, [3, 91,45,1,1,1,1,1,1], () =>
    win.cgMakeEvent({ total:5, text:"You suffered a tragedy.", tag:"tragedies" }));
  check("SD-005 fixture: the hostile tragedies row seeds an npc with relTag 'hostile'",
    evH.seeds.length === 1 && evH.seeds[0].relTag === "hostile", JSON.stringify(evH.seeds));
  check("SD-004 fixture: the seeded npc's desc names 'dwarf' with the correct article ('a dwarf', not 'an dwarf')",
    /^a dwarf /.test(evH.seeds[0].desc || ""), JSON.stringify(evH.seeds[0]));
  check("SD-004 fixture: the seed carries species:'Dwarf' matching the desc prose",
    evH.seeds[0].species === "Dwarf", JSON.stringify(evH.seeds[0]));
  g5.life.events.push(evH);
  win.cgBind();
  const boundChar5 = w5.characters[w5.characters.length - 1];
  const npcRecs5 = Object.values(win.codexOf(w5).records).filter(r => r.kind === "npc" && r.dm && r.dm.tiylFromChar === boundChar5.id);
  const rec5 = npcRecs5[0];

  check("SD-004: backfilled codex record exists for the hostile-dwarf TIYL seed", !!rec5, JSON.stringify(npcRecs5.map(r=>r.id)));
  check("SD-004: backfilled npc's fields.species is 'Dwarf' — matches the tiylDesc prose (was independently re-rolled before the fix)",
    rec5 && rec5.fields.species === "Dwarf", JSON.stringify(rec5 && rec5.fields));
  check("SD-004: backfilled npc's tiylDesc prose still reads 'a dwarf sailor…' (species+desc agree)",
    rec5 && /^a dwarf /.test(rec5.fields.tiylDesc || ""), JSON.stringify(rec5 && rec5.fields.tiylDesc));

  const att5 = win.codexGetAttitude(w5, rec5.id);
  check("SD-005: backfilled npc's attitude opens at Hostile (-2), not the lazy Indifferent/0 default",
    att5 && att5.value === -2 && !att5.lazy, JSON.stringify(att5));
  check("SD-005: attitude carries a TIYL-relationship cause note (not a generic/lazy open)",
    att5 && /tiyl-relationship:hostile/.test(att5.note || ""), JSON.stringify(att5));

  // MUTATION CHECK (SD-004): rebuild src/engine/codex-roll.js with opts.species dropped from rollNPC
  // (byte-identical to the pre-fix call site tiylBackfillPeople used to make: rollNPC({})) and prove
  // the species binding breaks — deterministically, by forcing the SAME race roll (45 → dwarf) both
  // times via a queued rollDie, so any difference in fields.species is attributable ONLY to the
  // opts.species plumbing, not to random variance in which race gets rolled.
  {
    const origSrc = read("src/engine/codex-roll.js");
    const mutated = origSrc.replace(
      "const species=opts.species||npcSpeciesFromRace(tx(race));",
      "const species=npcSpeciesFromRace(tx(race)); /* mutated: opts.species dropped — SD-004 regression */"
    );
    if (mutated === origSrc) { fail++; console.log("  ✗ SD-004 mutation target string not found in src/engine/codex-roll.js — cannot mutate"); }
    else {
      const domM = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="bardoView"></div></body></html>`,
        { runScripts: "dangerously", url: "http://localhost/" });
      const winM = domM.window;
      const srcMutated = srcPaths.map(p => p === "src/engine/codex-roll.js" ? mutated : read(p)).join("\n;\n");
      winM.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + srcMutated);
      // rollTable's rollExpr rolls via Math.random() directly (not rollDie), so pin Math.random to a
      // fixed value that lands the compiled npc-race-weighted table on a KNOWN non-dwarf row — stub
      // rollTable itself instead of chasing Math.random/dice internals, so this stays robust to the
      // compiled table's exact row layout. Forces the race roll to report "human" deterministically.
      const realRollTableM = winM.rollTable;
      winM.rollTable = (id) => id === "npc-race-weighted"
        ? {id, dice:"d100", total:1, band:null, text:"human", fragment:null, cells:null, legs:"", pool:"", grants:"", motif:""}
        : realRollTableM(id);
      const withSpecies = winM.rollNPC({species:"Dwarf"});
      const withoutSpecies = winM.rollNPC({});
      winM.rollTable = realRollTableM;
      check("MUTATION shown RED: with opts.species plumbing dropped, rollNPC({species:'Dwarf'}) ignores the override and mints 'Human' (the forced race roll) instead",
        withSpecies.fields.species === "Human" && withSpecies.fields.species === withoutSpecies.fields.species,
        JSON.stringify({withSpecies:withSpecies.fields.species, withoutSpecies:withoutSpecies.fields.species}));
    }
  }
  // the real (unmutated) build: rollNPC({species:"Dwarf"}) must bind Dwarf regardless of the internal
  // race roll — the direct proof the fix's opts.species short-circuit works, isolated from the whole
  // TIYL bind pipeline above.
  {
    const forced = win.rollNPC({species:"Dwarf"});
    check("RESTORED: rollNPC({species:'Dwarf'}) binds fields.species:'Dwarf' directly (opts.species honored)",
      forced.fields.species === "Dwarf", JSON.stringify(forced.fields));
  }
  check("RESTORED: the real (unmutated) build still binds species:'Dwarf' through the full TIYL pipeline (re-checked above)",
    rec5 && rec5.fields.species === "Dwarf");

  // MUTATION CHECK (SD-005): neuter the TIYL_REL_ATTITUDE lookup / codexAttitudeOpen call in
  // tiylBackfillPeople, rebuild from mutated source, confirm the harness shows the record falls back
  // to the lazy Indifferent default, then confirm the real build still opens Hostile.
  {
    const origSrc = read("src/creator/life.js");
    const mutated = origSrc.replace(
      'const opening=d.relTag&&TIYL_REL_ATTITUDE[d.relTag];\n      if(opening!=null&&typeof codexAttitudeOpen==="function")\n        codexAttitudeOpen(w,rec.id,opening,{cause:"tiyl-relationship:"+d.relTag});',
      '/* mutated: SD-005 attitude-open call neutered */'
    );
    if (mutated === origSrc) { fail++; console.log("  ✗ SD-005 mutation target string not found in src/creator/life.js — cannot mutate"); }
    else {
      const domM = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="bardoView"></div></body></html>`,
        { runScripts: "dangerously", url: "http://localhost/" });
      const winM = domM.window;
      const srcMutated = srcPaths.map(p => p === "src/creator/life.js" ? mutated : read(p)).join("\n;\n");
      winM.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + srcMutated);
      winM.saveU=()=>{};winM.renderWorld=()=>{};winM.showTab=()=>{};winM.toast=()=>{};winM.fetch=()=>Promise.resolve({ok:false});
      const wM5 = (() => {
        const w = { id:"wm5", name:"Mutation World 5", createdAt:Date.now(),
          seed:{ master:{name:"M",desc:"m"}, smell:{name:"m"}, sound:{name:"m"}, arch:{name:"m"},
                 taboo:{name:"m",desc:"m"}, myth:{name:"m",desc:"m"}, faction:{name:"m",desc:"m"} },
          gazetteer:[], characters:[], log:[], ledger:[], clock:{day:1,min:360}, session:0,
          map:{nodes:{},edges:[]}, currentNodeId:null, factions:[], pressures:[] };
        const originId = winM.addNode(w, "M", "Setting"); w.currentNodeId=originId; w.startNodeId=originId;
        winM.seeNode(w, originId); winM.setNodeXY(w, originId, 0, 0);
        winM.U.worlds["wm5"] = w; winM.U.activeWorldId = "wm5";
        return w;
      })();
      winM.ensureCodex(wM5);
      winM.GS.CGEN = makeCgen();
      const gM5 = winM.GS.CGEN;
      gM5.life = { origins:{ birthplace:{text:"x"}, family:{text:"Mother and father"}, lifestyle:{text:"Modest"} },
                   decisions:{ background:{roll:1,text:"x"}, classTraining:{roll:1,text:"x"} }, events:[], age:"21–30" };
      const evHM = (() => {
        const real = winM.rollDie; const q=[3, 91,45,1,1,1,1,1,1];
        winM.rollDie = (max) => q.length ? q.shift() : real(max);
        try { return winM.cgMakeEvent({ total:5, text:"You suffered a tragedy.", tag:"tragedies" }); }
        finally { winM.rollDie = real; }
      })();
      gM5.life.events.push(evHM);
      winM.cgBind();
      const boundM5b = wM5.characters[wM5.characters.length - 1];
      const npcRecsM5b = Object.values(winM.codexOf(wM5).records).filter(r => r.kind === "npc" && r.dm && r.dm.tiylFromChar === boundM5b.id);
      const recM5b = npcRecsM5b[0];
      const attM5b = winM.codexGetAttitude(wM5, recM5b.id);
      check("MUTATION shown RED: neutering the SD-005 attitude-open call drops the hostile npc back to lazy Indifferent/0",
        attM5b && attM5b.value === 0 && attM5b.lazy === true, JSON.stringify(attM5b));
      check("RESTORED: the real (unmutated) build still opens the hostile npc at -2/Hostile (re-checked above)",
        att5 && att5.value === -2);
    }
  }
}

// ── 6. pbundleTiylThread + pbundleApplyTiylBias ───────────────────────────
{
  // w1's session is still 0 (freshWorld default) and boundChar has no "thread" seed yet (only an
  // "enemy" npc seed) — add a thread-bearing character to a second fresh world to exercise the bias.
  const w3 = freshWorld("w3");
  win.ensureCodex(w3);
  win.GS.CGEN = makeCgen();
  win.GS.CGEN.name = "Rell";
  const g3 = win.GS.CGEN;
  g3.life = { origins:{ birthplace:{text:"x"}, family:{text:"Mother and father"}, lifestyle:{text:"Modest"} },
              decisions:{ background:{roll:1,text:"x"}, classTraining:{roll:1,text:"x"} }, events:[], age:"21–30" };
  // a "tragedies" roll — force the sub-table's d12 lookup (cgLookup("tragedies")) to land on row 7
  // ("A lover vanished without a trace. You have searched ever since.", tag:"lostlove"), which seeds
  // BOTH an npc AND a search thread (cgHandleSec's lostlove branch).
  const evT = withRollDieQueue(win, [7], () =>
    win.cgMakeEvent({ total:5, text:"You suffered a tragedy.", tag:"tragedies" }));
  g3.life.events.push(evT);
  win.cgBind();
  const boundChar3 = w3.characters[w3.characters.length - 1];

  const thread = win.pbundleTiylThread(w3);
  check("pbundleTiylThread finds the unresolved TIYL search-thread for the living PC",
    typeof thread === "string" && /search|vanish/i.test(thread), JSON.stringify(thread));

  const bundle = win.assemblePrepBundle({ world: w3, tier: 1 });
  check("assemblePrepBundle's first environment carries hook.tiylBias when a TIYL thread exists",
    bundle.environments[0] && bundle.environments[0].hook && bundle.environments[0].hook.tiylBias &&
    bundle.environments[0].hook.tiylBias.thread === thread, JSON.stringify(bundle.environments[0] && bundle.environments[0].hook && bundle.environments[0].hook.tiylBias));
  check("the OTHER environments carry no tiylBias (biases exactly ONE hook)",
    bundle.environments.slice(1).every(e => !e.hook || !e.hook.tiylBias), "");
  check("hook.macguffin/complication/questgiverPitch shape stays byte-untouched (additive field only)",
    bundle.environments[0].hook.macguffin && typeof bundle.environments[0].hook.macguffin.name === "string" &&
    bundle.environments[0].hook.complication && typeof bundle.environments[0].hook.complication.name === "string",
    JSON.stringify(bundle.environments[0].hook));

  // a SECOND session (session>0) must never bias — first-session only
  w3.session = 1;
  const bundle2 = win.assemblePrepBundle({ world: w3, tier: 1 });
  check("session>0: no tiylBias fires (first-session only)", !bundle2.environments[0].hook.tiylBias, JSON.stringify(bundle2.environments[0].hook.tiylBias));
}

// ── 7. the biography rides the handoff ONCE (dmDigest().pc.life) ─────────
{
  const w4 = freshWorld("w4");
  win.ensureCodex(w4);
  win.GS.CGEN = makeCgen();
  win.GS.CGEN.name = "Orin";
  const g4 = win.GS.CGEN;
  g4.life = { origins:{ birthplace:{text:"In a barn or outbuilding"}, family:{text:"Mother and father"}, lifestyle:{text:"Modest"} },
              decisions:{ background:{roll:1,text:"I took up arms."}, classTraining:{roll:1,text:"I took up arms."} },
              events:[{roll:50,summary:"You worked a while at your old trade.",detail:"",hook:"worked a while at your old trade",seeds:[],sub:[]}],
              age:"21–30" };
  win.cgBind();
  win.U.activeWorldId = "w4"; // cgBind's wakeIntoWorld doesn't change activeWorldId; keep it pinned

  const d1 = win.dmDigest();
  check("dmDigest().pc.life present + non-null on the FOUNDING turn (w.dmlog still empty)",
    d1 && d1.pc && d1.pc.life && Array.isArray(d1.pc.life.steps) && d1.pc.life.steps.length > 0, JSON.stringify(d1 && d1.pc && d1.pc.life));
  check("life digest carries the compact step→result one-liners (an actual event summary, not just hook labels)",
    d1.pc.life.steps.some(s => /worked a while at your old trade/i.test(s)), JSON.stringify(d1.pc.life.steps));

  // simulate a turn having landed (pushDmLog sets w.dmlog) — the NEXT digest must carry life:null
  w4.dmlog = [{ from:"player", text:"hi" }];
  const d2 = win.dmDigest();
  check("dmDigest().pc.life is null on every subsequent turn (send-once — DIGEST-DIET discipline)",
    d2 && d2.pc && d2.pc.life === null, JSON.stringify(d2 && d2.pc && d2.pc.life));

  check("dmDigest().pc.marks rides every turn (small, load-bearing sheet fact — not send-once)",
    Array.isArray(d2.pc.marks), JSON.stringify(d2.pc.marks));
}

// ── 8. regression ──────────────────────────────────────────────────────
try {
  execFileSync(process.execPath, [join(ROOT, "dev/verify-capture.mjs")], { stdio: "pipe" });
  check("regression: dev/verify-capture.mjs exits 0 (no failures)", true);
} catch (e) {
  check("regression: dev/verify-capture.mjs exits 0 (no failures)", false, e.stdout ? e.stdout.toString().slice(-400) : String(e));
}
try {
  execFileSync(process.execPath, [join(ROOT, "dev/verify-levelup-picker.mjs")], { stdio: "pipe" });
  check("regression: dev/verify-levelup-picker.mjs exits 0 (no failures)", true);
} catch (e) {
  check("regression: dev/verify-levelup-picker.mjs exits 0 (no failures)", false, e.stdout ? e.stdout.toString().slice(-400) : String(e));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
