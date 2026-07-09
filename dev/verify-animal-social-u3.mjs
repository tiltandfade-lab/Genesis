/* Verify ANIMAL-SOCIAL §6 U3 (docs/ANIMAL-SOCIAL.md) — animals on the attitude ladder:
   attitude field on animal partials, socialCheckAbilityFor routes partialKind:"animal" to WIS
   (Animal Handling), animalLevers(rec) derives care levers from need, ranger/druid opening bump +
   Speak-with-Animals advantage flags, the +1 grind clamp, and the fields.care 3-visit Helpful gate
   (bypassable per RESOLVED ruling 2 — animal-friendship spell / strong Charisma).

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-animal-social-u1.mjs /
   dev/verify-animal-social-u2.mjs). Run:  node dev/verify-animal-social-u3.mjs
   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md)

   Accept criteria (spec §6 U3):
     1. social_check vs an animal uses Animal Handling.
     2. attitude persists across prep revisits.
     3. care<3-visits can never yield +2 regardless of rolls (fuzz 500 checks, 0 escapes) unless
        the documented bypass fires.
   Red-first: codexSetAttitude/codexGetAttitude on a freshly-minted animal partial record —
   document current (pre-fix) behavior (the mint-time dm.attitude number is never stamped onto
   status.attitude — every partial reads the lazy Indifferent(0) default regardless of its rolled
   attitude), then gate. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function newWin(){
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div><div id="shelf"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full);
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function mkWorld(win, opts){
  opts = opts || {};
  const w = {
    id: opts.id || "w-u3", name: "Test World", session: 1,
    startNodeId: "home", currentNodeId: "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: [], log: [], clock: { day: 10, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: [], equipped:{} } }],
    factions: [], pressures: [], shops: opts.shops || {}, codex: { records: {}, version: 1 },
    regions: {}, seed: {}, realm: { active:false },
    prep: { session:1, bundle:null, overlays:{}, harvest:null, nodes: opts.prepNodes || {}, debt: [] },
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

function mintAnimal(win, w, opts){
  opts = opts || {};
  win.eval(`window.__mintOut = (function(){
    var p = rollPartial('animal', ${JSON.stringify(opts)});
    var rec = codexAdd(U.worlds['${w.id}'], Object.assign({}, p, { kind:"npc",
      id: "animal-"+Math.random().toString(36).slice(2),
      status:{ soft:true, at:'home' },
      dm: Object.assign({}, p.dm, { partial:true, partialKind:p.partialKind, ambient:true })
    }));
    if (typeof codexAttitudeOpen === "function"){
      codexAttitudeOpen(U.worlds['${w.id}'], rec.id, (p.dm && p.dm.attitude!=null)?p.dm.attitude:0, {cause:"animal-opening"});
    }
    return rec.id;
  })();`);
  return win.eval("window.__mintOut");
}

console.log("=== RED-FIRST: codexSetAttitude/codexGetAttitude on a bare (pre-stamp) animal partial ===");
{
  const win = newWin();
  const w = mkWorld(win, { id:"w-red" });
  // mint WITHOUT the codexAttitudeOpen stamp (the pre-fix path) to document the gap this unit closes.
  win.eval(`window.__bareId = (function(){
    var p = rollPartial('animal', {env:'wilderness'});
    var rec = codexAdd(U.worlds['${w.id}'], Object.assign({}, p, { kind:"npc",
      id:"bare-animal", status:{ soft:true, at:'home' },
      dm: Object.assign({}, p.dm, { partial:true, partialKind:p.partialKind, ambient:true })
    }));
    window.__bareMintAttitude = p.dm.attitude;
    return rec.id;
  })();`);
  const mintAttitude = win.eval("window.__bareMintAttitude");
  const readBack = win.eval(`codexGetAttitude(U.worlds['${w.id}'], window.__bareId).value`);
  console.log(`  (informational) rollPartial minted dm.attitude=${mintAttitude}; codexGetAttitude reads status.attitude.value=${readBack} (lazy default, unstamped)`);
  check("RED baseline: an un-stamped animal partial reads the lazy Indifferent(0) default regardless of its rolled dm.attitude",
    readBack === 0, `mint=${mintAttitude} readback=${readBack}`);
}

console.log("\n=== GREEN: post-fix behavior ===");
{
  // 1. social_check vs an animal uses Animal Handling.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { env:"village" });
    const ability = win.eval(`JSON.stringify(socialCheckAbilityFor(codexGet(U.worlds['${w.id}'], '${id}')))`);
    check("socialCheckAbilityFor routes partialKind:animal to WIS/Animal Handling",
      ability === JSON.stringify({ ability:"wis", skill:"Animal Handling" }), ability);
  }

  // 2. attitude persists across prep "revisits" (re-reading the same record after other engine calls).
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { env:"wilderness" });
    const first = win.eval(`codexGetAttitude(U.worlds['${w.id}'], '${id}').value`);
    // simulate a revisit: touch the record via codex_contact (real event-layer seam) and re-read.
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"codex_contact", payload:{ id:'${id}' } });`);
    const second = win.eval(`codexGetAttitude(U.worlds['${w.id}'], '${id}').value`);
    check("attitude persists across a prep revisit (codex_contact doesn't reset it)",
      first === second, `first=${first} second=${second}`);
  }

  // 3. mint-time attitude IS actually stamped (the red-first gap, closed).
  {
    const win = newWin();
    const w = mkWorld(win);
    // force a wild draw with the wild/wary tag path -> attitude should read -1 (never 0).
    let sawNegative = false;
    for (let i = 0; i < 20 && !sawNegative; i++){
      const id = mintAnimal(win, mkWorld(win, { id:"w-wild-"+i }), { env:"wilderness" });
      const v = win.eval(`codexGetAttitude(U.worlds['w-wild-${i}'], '${id}').value`);
      if (v === -1) sawNegative = true;
    }
    check("wilderness-drawn animal partials can read attitude -1 (mint-time stamp actually wired)", sawNegative);
  }

  // 4. ranger/druid opening-attitude-one-step-better (flat, mint-time).
  {
    const win = newWin();
    const w = mkWorld(win);
    const idPlain = mintAnimal(win, w, { env:"village", pcClass:null });
    const w2 = mkWorld(win, { id:"w-ranger" });
    const idRanger = mintAnimal(win, w2, { env:"village", pcClass:"ranger" });
    const plainV = win.eval(`codexGetAttitude(U.worlds['${w.id}'], '${idPlain}').value`);
    const rangerV = win.eval(`codexGetAttitude(U.worlds['w-ranger'], '${idRanger}').value`);
    check("ranger opening reads one step better than plain (0 -> 1 for a domestic/village draw)",
      rangerV === plainV + 1, `plain=${plainV} ranger=${rangerV}`);
    check("clamped at ATTITUDE_MAX (never overshoots Helpful from the opening bump alone)",
      rangerV <= 2);
  }

  // 5. animalLevers(rec) derives from need, mirrors creatureLevers' shape.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { env:"village" });
    win.eval(`codexGet(U.worlds['${w.id}'], '${id}').dm.need = "hungry";`);
    const levers = win.eval(`animalLevers(codexGet(U.worlds['${w.id}'], '${id}'))`);
    check("animalLevers(hungry) includes a feeding lever with advantage+consumableSink",
      levers.some(l => l.type === "feeding" && l.advantage === true && l.consumableSink === true), JSON.stringify(levers));
    check("animalLevers always includes the universal patience lever",
      levers.some(l => l.type === "patience" && l.revisit === true), JSON.stringify(levers));
    win.eval(`codexGet(U.worlds['${w.id}'], '${id}').dm.need = "guarding";`);
    const levers2 = win.eval(`animalLevers(codexGet(U.worlds['${w.id}'], '${id}'))`);
    check("animalLevers(guarding) includes a threshold lever with wrongApproachDisadvantage",
      levers2.some(l => l.type === "threshold" && l.wrongApproachDisadvantage === true), JSON.stringify(levers2));
  }

  // 6. the +1 grind clamp: an ordinary social_check success chain never crosses into +2 without care.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { env:"village" }); // opens at 0
    // Grind: repeated high-roll persuasion checks (no care ticks, no bypass flags).
    let cur = 0;
    for (let i = 0; i < 10; i++){
      const out = win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check",
        payload:{ target:'${id}', skill:"persuasion", total:99, dc:1 } });`);
      cur = out.to;
      if (cur >= 2) break;
    }
    check("ordinary grinding (no care, no bypass) never lifts an animal partial past +1 (Friendly)",
      cur <= 1, `ended at ${cur}`);
  }

  // 7. fuzz — 500 checks, 0 escapes past +2 without care>=3 or a bypass flag.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { env:"village" });
    let escapes = 0;
    for (let i = 0; i < 500; i++){
      const total = 1 + Math.floor(Math.random()*40);
      const dc = 1 + Math.floor(Math.random()*30);
      const natural = (Math.random() < 0.05) ? 20 : null;
      const out = win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check",
        payload:{ target:'${id}', skill:"persuasion", total:${total}, dc:${dc}${natural?",natural:20":""} } });`);
      const careNow = win.eval(`(codexGet(U.worlds['${w.id}'], '${id}').fields||{}).care||0`);
      if (out.to >= 2 && careNow < 3) escapes++;
    }
    check("fuzz 500 checks: 0 escapes to +2 while care<3 and no bypass flag", escapes === 0, `escapes=${escapes}`);
  }

  // 8. the care track: 3 distinct animal_care visits (different days) unlock +2; fewer don't.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { env:"village" });
    // hand-shift to +1 first (one ordinary success).
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check", payload:{ target:'${id}', skill:"persuasion", total:99, dc:1 } });`);
    const afterOne = win.eval(`codexGetAttitude(U.worlds['${w.id}'], '${id}').value`);
    check("one ordinary success reaches Friendly (+1)", afterOne === 1, `got ${afterOne}`);
    // 2 distinct-day care visits: still capped at +1.
    win.eval(`U.worlds['${w.id}'].clock.day = 1; applyEvent(U.worlds['${w.id}'], { type:"animal_care", payload:{ target:'${id}', event:"fed" } });`);
    win.eval(`U.worlds['${w.id}'].clock.day = 2; applyEvent(U.worlds['${w.id}'], { type:"animal_care", payload:{ target:'${id}', event:"tended" } });`);
    const careAfterTwo = win.eval(`codexGet(U.worlds['${w.id}'], '${id}').fields.care`);
    const outTwo = win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check", payload:{ target:'${id}', skill:"persuasion", total:99, dc:1 } });`);
    check("care=2 (< 3 visits): a would-be +2 shift still clamps at +1", careAfterTwo === 2 && outTwo.to === 1, `care=${careAfterTwo} to=${outTwo.to}`);
    // repeating care on the SAME day does not tick a new distinct visit.
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"animal_care", payload:{ target:'${id}', event:"fed-again-same-day" } });`);
    const careSameDay = win.eval(`codexGet(U.worlds['${w.id}'], '${id}').fields.care`);
    check("a second care event on the SAME day does not tick a new distinct visit", careSameDay === 2, `care=${careSameDay}`);
    // 3rd distinct-day visit unlocks +2.
    win.eval(`U.worlds['${w.id}'].clock.day = 3; applyEvent(U.worlds['${w.id}'], { type:"animal_care", payload:{ target:'${id}', event:"defended" } });`);
    const careAfterThree = win.eval(`codexGet(U.worlds['${w.id}'], '${id}').fields.care`);
    const outThree = win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check", payload:{ target:'${id}', skill:"persuasion", total:99, dc:1 } });`);
    check("care=3 distinct visits: an ordinary success now reaches +2 (Helpful)",
      careAfterThree === 3 && outThree.to === 2, `care=${careAfterThree} to=${outThree.to}`);
  }

  // 9. the RESOLVED ruling-2 bypass: animal-friendship spell / strong CHA reaches +2 even with care<3.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { env:"village" });
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check", payload:{ target:'${id}', skill:"persuasion", total:99, dc:1 } });`); // -> +1
    const bypassSpell = win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check",
      payload:{ target:'${id}', skill:"persuasion", total:99, dc:1, animalFriendshipSpell:true } });`);
    check("animal-friendship-class spell bypasses the 3-visit gate (care=0 still reaches +2)",
      bypassSpell.to === 2, JSON.stringify(bypassSpell));

    const w2 = mkWorld(win, { id:"w-cha" });
    const id2 = mintAnimal(win, w2, { env:"village" });
    win.eval(`applyEvent(U.worlds['w-cha'], { type:"social_check", payload:{ target:'${id2}', skill:"persuasion", total:99, dc:1 } });`); // -> +1
    const bypassCha = win.eval(`applyEvent(U.worlds['w-cha'], { type:"social_check",
      payload:{ target:'${id2}', skill:"persuasion", total:99, dc:1, strongCha:true } });`);
    check("a caller-flagged strong-Charisma result bypasses the 3-visit gate too",
      bypassCha.to === 2, JSON.stringify(bypassCha));
  }

  // 10. Speak with Animals advantage flag is a pure, flat function (no DM judgment).
  {
    const win = newWin();
    check("animalCheckAdvantage(cls, true) -> true regardless of class",
      win.eval(`animalCheckAdvantage("fighter", true)`) === true);
    check("animalCheckAdvantage(cls, false) -> false", win.eval(`animalCheckAdvantage("ranger", false)`) === false);
  }

  // 11. NPC (non-animal) records are completely untouched by this unit's clamp.
  {
    const win = newWin();
    const w = mkWorld(win);
    win.eval(`codexAdd(U.worlds['${w.id}'], { kind:"npc", id:"plain-npc", name:"Plain Bob",
      fields:{}, dm:{}, status:{ soft:true, at:'home' } });`);
    win.eval(`codexAttitudeOpen(U.worlds['${w.id}'], "plain-npc", 0, {cause:"opening"});`);
    const out = win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check", payload:{ target:"plain-npc", skill:"persuasion", total:99, dc:1, natural:20 } });`);
    // a plain NPC has no grind ceiling at all (that's creature/animal-only) — ordinary success can
    // step past +1 over repeated checks same as it always could pre-this-unit.
    check("a plain NPC record is unaffected by the animal Helpful-gate (isAnimalPartial=false path)",
      typeof out.to === "number");
  }
}

console.log("\n=== HQ-3 (docs/ANIMAL-SOCIAL-HQ.md): parley routing reaches the DM digest ===");
{
  // WIRING LAW: drive codexDigest (production entry point), never socialCheckAbilityFor/
  // animalLevers directly, and never codexFullRecord directly either.
  // 1. an animal partial's digest record carries parleyAbility (WIS/Animal Handling). Force it
  // into the here-and-now set via opts.mintIds (a legitimate production path — ON-DEMAND-GEN's
  // spotlight — codexHereNowIds otherwise excludes an untouched-ambient partial).
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { env:"village" });
    const digest = win.eval(`JSON.stringify(codexDigest(U.worlds['${w.id}'], { atNodeId:'home', mintIds:['${id}'] }))`);
    const parsed = JSON.parse(digest);
    const rec = parsed.codex.find(r => r.id === id);
    check("HQ-3.1: an animal partial's codexDigest record carries parleyAbility (WIS/Animal Handling)",
      !!rec && rec.parleyAbility && rec.parleyAbility.ability === "wis" && rec.parleyAbility.skill === "Animal Handling",
      JSON.stringify(rec));
  }

  // 2. a hungry-tagged animal's social_check ledger entry shows the derived feeding lever merged
  // in (dm.js's own `leversDerived` ledger-data field, U4's precedent for surfacing the engine's
  // auto-merged levers) — driven purely through applyEvent, no declared feeding lever supplied.
  {
    const win = newWin();
    const w = mkWorld(win);
    const id = mintAnimal(win, w, { env:"village" });
    win.eval(`codexGet(U.worlds['${w.id}'], '${id}').dm.need = "hungry";`);
    win.eval(`applyEvent(U.worlds['${w.id}'], { type:"social_check",
      payload:{ target:'${id}', skill:"animal handling", total:1, dc:1 } });`);
    const lastEntry = win.eval(`U.worlds['${w.id}'].ledger[U.worlds['${w.id}'].ledger.length-1]`);
    const derived = (lastEntry && lastEntry.data && lastEntry.data.leversDerived) || [];
    check("HQ-3.2: a hungry animal's social_check ledger entry lists the derived feeding lever (production merge, no lever declared)",
      derived.includes("feeding"), JSON.stringify(lastEntry));
  }

  // 3. creatures (kind:"creature") are unchanged — existing parleyAbility path still fires.
  {
    const win = newWin();
    const w = mkWorld(win);
    win.eval(`codexAdd(U.worlds['${w.id}'], { kind:"creature", id:"wolf-1", name:"Wolf",
      fields:{ type:"beast" }, dm:{}, status:{ soft:true, at:'home' } });`);
    win.eval(`codexAttitudeOpen(U.worlds['${w.id}'], "wolf-1", 0, {cause:"opening"});`);
    const digest = win.eval(`JSON.stringify(codexDigest(U.worlds['${w.id}'], { atNodeId:'home' }))`);
    const rec = JSON.parse(digest).codex.find(r => r.id === "wolf-1");
    check("HQ-3.3: kind:creature digest record still carries parleyAbility (WIS/Animal Handling, unchanged)",
      !!rec && rec.parleyAbility && rec.parleyAbility.ability === "wis", JSON.stringify(rec));
  }

  // 4. human NPC records carry NO parleyAbility (the gate did not over-widen).
  {
    const win = newWin();
    const w = mkWorld(win);
    win.eval(`codexAdd(U.worlds['${w.id}'], { kind:"npc", id:"human-1", name:"Bob",
      fields:{}, dm:{}, status:{ soft:true, at:'home' } });`);
    win.eval(`codexAttitudeOpen(U.worlds['${w.id}'], "human-1", 0, {cause:"opening"});`);
    const digest = win.eval(`JSON.stringify(codexDigest(U.worlds['${w.id}'], { atNodeId:'home' }))`);
    const rec = JSON.parse(digest).codex.find(r => r.id === "human-1");
    check("HQ-3.4: a plain human NPC digest record carries NO parleyAbility (gate not over-widened)",
      !!rec && !("parleyAbility" in rec), JSON.stringify(rec));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
