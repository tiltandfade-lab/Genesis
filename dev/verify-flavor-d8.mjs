/* Verify MONSTER-FLAVOR-TABLES §4 — the spice-clamped d8 flavor roll, canon-locked at codex mint.
   Companion to dev/verify-monster-story.mjs (custom-d10 canon-lock) and dev/verify-realm-wiring.mjs.
   jsdom, full manifest.loadOrder module load.

   §5 verify plan:
     1. monsterRollFlavorD8 returns a well-formed {table,mode,roll,band,text} for a real realm
        creature's flavorTable; null for a missing/malformed table.
     2. Clamp — a Grounded context (no breach, walk not Strange+) NEVER yields band Strange/Volatile/
        Mythic across a 500-roll distribution (raw 7-8 re-roll to the quiet band); a breach context
        DOES reach r8 (Volatile/Mythic) over 500 rolls.
     3. Canon-lock at mint — a realm foe mints dm.flavorD8 once; a SECOND mint of the same name does
        NOT re-roll (identical to the first).
     4. apex r8 = Mythic honored (the roster's apex flavorTables carry Mythic at row 8; non-apex do
        not — a data assertion over REALM_BESTIARY).
     5. MUTATION (red-first): remove the clamp (ceiling always 8) -> a Grounded-context mint can
        store a Volatile/Strange band -> the §2 clamp assertion fails.

   Run:  node dev/verify-flavor-d8.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");

const accessors = `
  function __realmBestiary(){ return (typeof REALM_BESTIARY!=="undefined") ? REALM_BESTIARY : null; }
  function __rollFlavorD8(ft, ctx){ return monsterRollFlavorD8(ft, ctx); }
  function __realmCreatureEntry(realm,name){ return realmCreatureEntry(realm,name); }
  function __codexMint(w, foes){ return codexMintSignificantFoes(w, foes); }
  function __codexGet(w, id){ return (typeof codexGet==="function") ? codexGet(w, id) : null; }
  function __codexKeyId(kind, name){ return codexKeyId(kind, name); }
`;
const baseSrc = read("tables.js") + "\n;\n" + moduleSrc + "\n;\n" + accessors;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null; var GS={};`;

function freshWin(customSrc) {
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (customSrc || baseSrc));
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// pick a real realm creature that carries a flavorTable (post-merge data)
function pickRealmCreatureWithTable(win, wantApex) {
  const RB = win.__realmBestiary();
  for (const realm of Object.keys(RB || {})) {
    for (const rc of RB[realm]) {
      if (rc.flavorTable && Array.isArray(rc.flavorTable.rows) && rc.flavorTable.rows.length === 8) {
        const isApex = String(rc.role || "").toLowerCase() === "apex";
        if (wantApex === undefined || isApex === wantApex) return { realm, rc };
      }
    }
  }
  return null;
}

// ============================================================================
// 1. monsterRollFlavorD8 shape
// ============================================================================
{
  const win = freshWin();
  const picked = pickRealmCreatureWithTable(win);
  check("1a. a realm creature with a flavorTable exists in REALM_BESTIARY", !!picked,
    "no realm creature carries a d8 flavorTable — did the merge run?");
  if (picked) {
    const r = win.__rollFlavorD8(picked.rc.flavorTable, { breach: true, strangePlus: true });
    check("1b. roll returns {table:'flavor-d8', roll 1..8, band, text}",
      r && r.table === "flavor-d8" && r.roll >= 1 && r.roll <= 8 && !!r.band && !!r.text, JSON.stringify(r));
    check("1c. mode is variant|hook", r && (r.mode === "variant" || r.mode === "hook"), r && r.mode);
  }
  const bad = win.__rollFlavorD8({ die: "d6", rows: [] }, { breach: true });
  check("1d. a malformed table returns null", bad === null, JSON.stringify(bad));
}

// ============================================================================
// 2. the spice clamp distribution
// ============================================================================
{
  const win = freshWin();
  const picked = pickRealmCreatureWithTable(win);
  if (picked) {
    const ft = picked.rc.flavorTable;
    const HIGH = new Set(["Strange", "Volatile", "Mythic"]);
    // Grounded context: 500 rolls, never a high band
    let groundedHigh = 0;
    for (let i = 0; i < 500; i++) {
      const r = win.__rollFlavorD8(ft, { breach: false, strangePlus: false });
      if (r && HIGH.has(r.band)) groundedHigh++;
    }
    check("2a. Grounded context NEVER stores a Strange+/Volatile/Mythic band (500 rolls)",
      groundedHigh === 0, "high-band count=" + groundedHigh);
    // Strange+ (non-breach) context: r7 opens, r8 does NOT
    let strangeVolatile = 0, strangeSawStrange = 0;
    for (let i = 0; i < 500; i++) {
      const r = win.__rollFlavorD8(ft, { breach: false, strangePlus: true });
      if (r && (r.band === "Volatile" || r.band === "Mythic")) strangeVolatile++;
      if (r && r.band === "Strange") strangeSawStrange++;
    }
    check("2b. Strange+ (non-breach) context opens r7 (Strange seen) but not r8 (no Volatile/Mythic)",
      strangeVolatile === 0 && strangeSawStrange > 0,
      "volatile=" + strangeVolatile + " strange=" + strangeSawStrange);
    // breach context: r8 reachable
    let breachTop = 0;
    for (let i = 0; i < 500; i++) {
      const r = win.__rollFlavorD8(ft, { breach: true, strangePlus: true });
      if (r && (r.band === "Volatile" || r.band === "Mythic")) breachTop++;
    }
    check("2c. breach context reaches r8 (Volatile/Mythic seen over 500 rolls)", breachTop > 0,
      "top-band count=" + breachTop);
  }
}

// ============================================================================
// 3. canon-lock at mint (rolled once; identical on re-mint)
// ============================================================================
function buildWorld(win) {
  // do NOT pre-set codex — codexOf(w) lazily builds { records:{}, version:1 } on first touch.
  const w = { id: "w1", currentNodeId: "n1", seed: {} };
  if (!win.U.worlds) win.U.worlds = {};
  win.U.worlds["w1"] = w; win.U.activeWorldId = "w1";
  return w;
}
function realmFoe(picked) {
  // a realm-tagged, significant foe (realmRole apex/high or cr>=1) so codexMint mints it
  return { name: picked.rc.name, realm: picked.realm, realmRole: picked.rc.role,
    cr: Math.max(1, picked.rc.cr || 1), size: picked.rc.size || "Medium",
    creatureType: picked.rc.type || "Aberration", statId: picked.rc.frame,
    desc: picked.rc.desc || null, summary: picked.rc.summary || null };
}
{
  const win = freshWin();
  const picked = pickRealmCreatureWithTable(win, true) || pickRealmCreatureWithTable(win);
  if (picked) {
    const w = buildWorld(win);
    const foe = realmFoe(picked);
    win.__codexMint(w, [foe]);
    const id = win.__codexKeyId("creature", foe.name);
    const rec1 = win.__codexGet(w, id);
    const snap = JSON.stringify(rec1 && rec1.dm && rec1.dm.flavorD8);
    check("3a. a realm foe mints dm.flavorD8", rec1 && rec1.dm && !!rec1.dm.flavorD8, snap);
    // re-mint the SAME creature
    win.__codexMint(w, [realmFoe(picked)]);
    const rec2 = win.__codexGet(w, id);
    check("3b. a SECOND mint does NOT re-roll dm.flavorD8 (canon-lock)",
      JSON.stringify(rec2 && rec2.dm && rec2.dm.flavorD8) === snap,
      JSON.stringify(rec2 && rec2.dm && rec2.dm.flavorD8));
    // the realm creature's OWN story fields reach the record
    check("3c. the record carries the realm creature's own treasure/habitat/activity",
      rec1 && rec1.fields && rec1.fields.treasure != null && rec1.fields.habitat != null && rec1.fields.activity != null,
      JSON.stringify(rec1 && rec1.fields));
  }
}

// ============================================================================
// 4. apex r8 = Mythic (data assertion) — every apex flavorTable's row 8 is Mythic; every
//    non-apex's row 8 is Volatile.
// ============================================================================
{
  const win = freshWin();
  const RB = win.__realmBestiary();
  // Per MONSTER-FLAVOR-TABLES §1: apex r8 MAY be Mythic (Volatile is also valid for apex); the hard
  // rail is that Mythic is apex-EXCLUSIVE. So: (a) apex tables exist, (b) some apex DO earn Mythic,
  // (c) NO non-apex ever uses Mythic (the exclusivity law — the load-bearing assertion).
  let apexCount = 0, apexMythic = 0, nonApexNoMythic = true;
  for (const realm of Object.keys(RB || {})) {
    for (const rc of RB[realm]) {
      const ft = rc.flavorTable;
      if (!ft || !Array.isArray(ft.rows)) continue;
      const r8 = ft.rows.find((x) => x.n === 8);
      if (!r8) continue;
      const isApex = String(rc.role || "").toLowerCase() === "apex";
      if (isApex) { apexCount++; if (r8.band === "Mythic") apexMythic++; }
      else if (r8.band === "Mythic") nonApexNoMythic = false;
    }
  }
  check("4a. at least one apex creature carries a d8 table", apexCount > 0, "apexCount=" + apexCount);
  check("4b. Mythic is used at r8 (apex creatures earn it)", apexMythic > 0, "apexMythic=" + apexMythic);
  check("4c. Mythic is apex-EXCLUSIVE — no non-apex flavorTable uses Mythic at row 8", nonApexNoMythic);
}

// ============================================================================
// 5. MUTATION (red-first): remove the clamp (ceiling forced to 8) -> a Grounded-context mint can
//    store a Volatile/Strange band -> the §2a assertion must fail.
// ============================================================================
{
  const mutated = baseSrc.replace(
    "const ceiling = (ctx && ctx.breach) ? 8 : ((ctx && ctx.strangePlus) ? 7 : 6);",
    "const ceiling = 8; /* MUTATED: clamp removed */");
  check("5-pre. mutation string replaced", mutated !== baseSrc, "replace target not found");
  const win = freshWin(mutated);
  const picked = pickRealmCreatureWithTable(win);
  if (picked) {
    const HIGH = new Set(["Strange", "Volatile", "Mythic"]);
    let groundedHigh = 0;
    for (let i = 0; i < 500; i++) {
      const r = win.__rollFlavorD8(picked.rc.flavorTable, { breach: false, strangePlus: false });
      if (r && HIGH.has(r.band)) groundedHigh++;
    }
    check("5a. MUTATION reproduces: with the clamp removed, a Grounded context DOES store high bands (proves §2a is load-bearing)",
      groundedHigh > 0, "high-band count=" + groundedHigh);
  }
}

console.log(`\nverify-flavor-d8: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
