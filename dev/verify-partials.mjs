/* Verify NPC-PARTIALS (docs/NPC-PARTIALS.md "Engine build step") — rollPartial(kind, opts), a
   lightweight sibling to rollNPC for children/animals: real presence, their own small stuff,
   NEVER the adult lever stack (want-2d50/leverage/fear/flawSecret/bond/motivation). Coherence
   hard-defaults to 'archetype' on every partial.

   Full-app jsdom load + compiled tables.js (same convention as dev/verify-coherence-dial.mjs /
   dev/verify-codex-roll.mjs / dev/verify-dm-events.mjs). Covers this unit's test plan:
     1. rollPartial('child') shape + non-null want + NO adult levers.        (RED-FIRST)
     2. rollPartial('animal') shape + kind/tell/need + NO want, NO adult levers. (RED-FIRST)
     3. child 'saw' hook-carrier fires sometimes/absent sometimes (scaled); hookRate 1/0 boundary.
     4. data reachability — child-want/child-saw/animal-kind/animal-tell all return real rows.
     5. determinism/shape — 500 rolls of each kind never throw, always documented shape.

   Run:  node dev/verify-partials.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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

function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);
  return win;
}

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

const ADULT_LEVER_KEYS = ["leverage", "fear", "flawSecret", "bond", "motivation"];
function hasAdultLeverValue(obj) {
  if (!obj) return false;
  return ADULT_LEVER_KEYS.some((k) => obj[k] != null);
}

// ============================================================================
// 0. SYMBOL PRESENT
// ============================================================================
{
  const win = freshWin();
  check("global rollPartial", typeof win.rollPartial === "function", typeof win.rollPartial);
}

// ============================================================================
// 4. DATA REACHABILITY — all 4 compiled tables return real rows via rollTable()
// ============================================================================
{
  const win = freshWin();
  for (const id of ["child-want", "child-saw", "animal-kind", "animal-tell"]) {
    const row = win.rollTable(id);
    check(`rollTable('${id}') returns a real row`, !!row && (row.text != null || (row.cells && row.cells.length)), JSON.stringify(row));
  }
}

// ============================================================================
// 1. rollPartial('child') shape — RED-FIRST
// ============================================================================
console.log("\n--- RED-FIRST: check 1 (child shape / no adult levers) ---");
{
  // stub rollPartial to leak an adult lever + wrong coherence, prove the harness catches it
  const win = freshWin();
  win.eval(`
    var __realRollPartial = rollPartial;
    rollPartial = function(kind, opts){
      if (kind === "child") {
        return { kind:"partial", partialKind:"child", coherence:"wrinkled",
          name:"Stub Kid",
          fields:{ role:"child", want:"stub want" },
          dm:{ want:"stub want", saw:null, cracksAdult:false, leverage:"a stubbed-in adult lever" } };
      }
      return __realRollPartial(kind, opts);
    };
  `);
  const stubbed = win.rollPartial("child");
  const stubbedOk = stubbed && stubbed.kind === "partial" && stubbed.partialKind === "child"
    && stubbed.coherence === "archetype" && stubbed.fields && stubbed.fields.want != null
    && !hasAdultLeverValue(stubbed.dm);
  console.log("  [RED capture] stubbed rollPartial('child') passes real checks?", stubbedOk, "—", JSON.stringify(stubbed));
  check("RED-FIRST: stubbed leak (adult lever + wrong coherence) is caught as invalid", !stubbedOk);
}
{
  const win = freshWin();
  const c = win.rollPartial("child");
  check("child: kind='partial'", c && c.kind === "partial", JSON.stringify(c));
  check("child: partialKind='child'", c && c.partialKind === "child");
  check("child: coherence='archetype'", c && c.coherence === "archetype");
  check("child: fields.want non-null", c && c.fields && c.fields.want != null, JSON.stringify(c && c.fields));
  check("child: dm.want non-null", c && c.dm && c.dm.want != null, JSON.stringify(c && c.dm));
  check("child: NO adult levers in fields", !hasAdultLeverValue(c && c.fields), JSON.stringify(c && c.fields));
  check("child: NO adult levers in dm", !hasAdultLeverValue(c && c.dm), JSON.stringify(c && c.dm));
  check("child: NO adult levers at top level", !hasAdultLeverValue(c), JSON.stringify(c));
  console.log("  [GREEN] real rollPartial('child') sample:", JSON.stringify(c));
}

// ============================================================================
// 2. rollPartial('animal') shape — RED-FIRST
// ============================================================================
console.log("\n--- RED-FIRST: check 2 (animal shape / no want, no adult levers) ---");
{
  const win = freshWin();
  win.eval(`
    var __realRollPartial2 = rollPartial;
    rollPartial = function(kind, opts){
      if (kind === "animal") {
        return { kind:"partial", partialKind:"animal", coherence:"layered",
          name:null,
          fields:{ role:"animal", animalKind:"stub dog", want:"stub animal want" },
          dm:{ tell:"stub tell", need:"hungry", fear:"a stubbed-in adult lever" } };
      }
      return __realRollPartial2(kind, opts);
    };
  `);
  const stubbed = win.rollPartial("animal");
  const NEED_SET = ["hungry", "guarding", "lost", "loyal"];
  const stubbedOk = stubbed && stubbed.kind === "partial" && stubbed.partialKind === "animal"
    && stubbed.coherence === "archetype" && stubbed.fields && stubbed.fields.animalKind != null
    && stubbed.fields.want == null && stubbed.dm && stubbed.dm.tell != null
    && NEED_SET.includes(stubbed.dm.need) && !hasAdultLeverValue(stubbed.fields) && !hasAdultLeverValue(stubbed.dm);
  console.log("  [RED capture] stubbed rollPartial('animal') passes real checks?", stubbedOk, "—", JSON.stringify(stubbed));
  check("RED-FIRST: stubbed leak (want key + adult lever + wrong coherence) is caught as invalid", !stubbedOk);
}
{
  const win = freshWin();
  const NEED_SET = ["hungry", "guarding", "lost", "loyal"];
  const a = win.rollPartial("animal");
  check("animal: kind='partial'", a && a.kind === "partial", JSON.stringify(a));
  check("animal: partialKind='animal'", a && a.partialKind === "animal");
  check("animal: coherence='archetype'", a && a.coherence === "archetype");
  check("animal: fields.animalKind non-null", a && a.fields && a.fields.animalKind != null, JSON.stringify(a && a.fields));
  check("animal: dm.tell non-null", a && a.dm && a.dm.tell != null, JSON.stringify(a && a.dm));
  check("animal: dm.need in {hungry,guarding,lost,loyal}", a && a.dm && NEED_SET.includes(a.dm.need), JSON.stringify(a && a.dm));
  check("animal: NO want anywhere (fields.want)", !(a && a.fields && a.fields.want != null), JSON.stringify(a && a.fields));
  check("animal: NO want anywhere (dm.want)", !(a && a.dm && a.dm.want != null), JSON.stringify(a && a.dm));
  check("animal: NO adult levers in fields", !hasAdultLeverValue(a && a.fields), JSON.stringify(a && a.fields));
  check("animal: NO adult levers in dm", !hasAdultLeverValue(a && a.dm), JSON.stringify(a && a.dm));
  console.log("  [GREEN] real rollPartial('animal') sample:", JSON.stringify(a));
}

// ============================================================================
// 3. child 'saw' hook-carrier — scaled, fires sometimes/absent sometimes; hookRate 1/0 boundary
// ============================================================================
{
  const win = freshWin();
  const N = 400;
  let sawCount = 0;
  for (let i = 0; i < N; i++) {
    const c = win.rollPartial("child");
    if (c.dm.saw != null) sawCount++;
  }
  const rate = sawCount / N;
  check(`child 'saw' fires SOMETIMES over ${N} default-rate rolls (count>0)`, sawCount > 0, `sawCount=${sawCount}`);
  check(`child 'saw' is ABSENT sometimes over ${N} default-rate rolls (count<N)`, sawCount < N, `sawCount=${sawCount}`);
  check(`default hookRate observed rate ~0.5 (within [0.3,0.7])`, rate > 0.3 && rate < 0.7, `rate=${rate}`);
}
{
  const win = freshWin();
  const N = 100;
  let always = true, never = true;
  for (let i = 0; i < N; i++) {
    if (win.rollPartial("child", { hookRate: 1 }).dm.saw == null) always = false;
    if (win.rollPartial("child", { hookRate: 0 }).dm.saw != null) never = false;
  }
  check("opts.hookRate=1 -> always carries (saw non-null every roll)", always);
  check("opts.hookRate=0 -> never carries (saw null every roll)", never);
}

// ============================================================================
// 5. determinism/shape — 500 rolls of each kind never throw, always documented shape
// ============================================================================
{
  const win = freshWin();
  let threw = false, badShape = 0;
  const NEED_SET = ["hungry", "guarding", "lost", "loyal"];
  try {
    for (let i = 0; i < 500; i++) {
      const c = win.rollPartial("child");
      if (!(c && c.kind === "partial" && c.partialKind === "child" && c.coherence === "archetype"
        && c.fields && c.fields.want != null && !hasAdultLeverValue(c.dm))) badShape++;
    }
  } catch (e) { threw = true; console.log("  [threw]", e.message); }
  check("500x rollPartial('child') never throws", !threw);
  check("500x rollPartial('child') always documented shape", badShape === 0, `badShape=${badShape}`);
}
{
  const win = freshWin();
  let threw = false, badShape = 0;
  const NEED_SET = ["hungry", "guarding", "lost", "loyal"];
  try {
    for (let i = 0; i < 500; i++) {
      const a = win.rollPartial("animal");
      if (!(a && a.kind === "partial" && a.partialKind === "animal" && a.coherence === "archetype"
        && a.fields && a.fields.animalKind != null && a.dm && a.dm.tell != null
        && NEED_SET.includes(a.dm.need) && a.fields.want == null && !hasAdultLeverValue(a.dm))) badShape++;
    }
  } catch (e) { threw = true; console.log("  [threw]", e.message); }
  check("500x rollPartial('animal') never throws", !threw);
  check("500x rollPartial('animal') always documented shape", badShape === 0, `badShape=${badShape}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
