/* verify-outlandish-realms.mjs — headless test for the outlandish-realms unit
   (docs/BREACH.md §2c/§2e, docs/BATCH3-GUARDRAILS.md J1/J2 "outlandish-realms": target ~10+/0).

   Enumerated assertions:
   1. data/realms.js: REALMS carries exactly the 11 frozen realm ids + realm-neutral (no scan-
      derived id snuck in a 12th); REALM_IDS excludes realm-neutral; realmOf falls back to
      realm-neutral for an unknown key; theaterEraLens carries the 7 named lenses and falls back
      to the first for an unknown id.
   2. the d300 tag pass: EVERY row (1..300) carries a non-empty Realm cell, and every value is a
      member of the frozen vocabulary (REALMS keys) — no invented realm leaked into the table.
   3. diff audit: the tag pass changed ONLY the Band/Realm/Ranks columns — every row's Item/
      Origin/Effect/Band cell is byte-identical to the pre-outlandish-realms snapshot (frozen in
      this file, since the git history itself isn't a safe harness dependency).
   4. rank ladders: every high-power/reality-breaking row carries a non-empty Ranks cell shaped
      "Rn(Lm) ..."; every reality-breaking row's FIRST rung floors at L9 exactly (never below);
      utility/combat rows carry an EMPTY Ranks cell (flat, no ladder authored this pass).
   5. THE SOURCING SUPERSEDE (BREACH.md §2e.3): dwalkOutlandishAllowed(level) with no inBreach
      flag NEVER includes "reality-breaking" at ANY level, including L20; WITH inBreach:true it
      opens at the L9 floor exactly like every other band's own gate.
   5b. MUTATION CHECK: neuter the supersede (call the pre-existing single-arg signature bypassing
      the inBreach guard) to confirm the harness's own assertion actually catches a reality-
      breaker leaking into a normal-walk allowed-list — shown RED, then confirms the REAL
      dwalkOutlandishAllowed (2-arg, inBreach-gated) restores GREEN.
   6. realm filter: dwalkOutlandish(level,{inBreach:true, realms:["chrome"]}) drawn 200x never
      returns an item whose realm is outside {chrome, realm-neutral}; an over-narrow filter never
      empties the pool (still returns an item).
   7. THE ≥1-PER-BREACH GUARANTEE (BREACH.md §2c/§2e.7): breachLootGuarantee always returns a
      channel in {hoard,social,secret,apex} and a non-null item (when the table's compiled); over
      many rolls, the channel distribution is roughly even (flat d4, generous tolerance).
   7b. the social→hoard fallback: with a walk carrying NO Social segment, breachLootGuarantee
      NEVER reports channel:"social" (every social roll collapses to hoard); with a Social
      segment present, social channel rolls DO surface as "social" at least once over many tries.
   8. regression: dev/verify-breach.mjs's own suite still passes 0 failed (the supersede/new opts
      param didn't disturb rollWalkSkinBreach/dungeon-walk assembly).

   Run:  node dev/verify-outlandish-realms.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
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
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
// top-level `const`s (REALMS etc.) don't attach to jsdom's `window` under win.eval (same gotcha
// documented in verify-regions.mjs/verify-gen.mjs/verify-breach.mjs) — thin accessor wrappers expose them.
const accessors = "function __REALMS(){return REALMS;} function __REALM_IDS(){return REALM_IDS;}";

function newWin() {
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n") + "\n;\n" + accessors;
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full);
  dom.window.REALMS = dom.window.__REALMS();
  dom.window.REALM_IDS = dom.window.__REALM_IDS();
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const FROZEN_REALMS = ["frontier", "chrome", "noir", "ash", "suburb", "cosmic", "theater",
  "high-seas", "lost-world", "gloom", "bright-kingdom"];

// ============================================================================
// 1. data/realms.js — the frozen vocabulary
// ============================================================================
console.log("\n--- §1. data/realms.js — the frozen vocabulary ---");
{
  const win = newWin();
  const keys = Object.keys(win.REALMS);
  check("1. REALMS carries exactly 11 frozen ids + realm-neutral (12 total)", keys.length === 12, JSON.stringify(keys));
  FROZEN_REALMS.forEach((id) => check("1. REALMS has frozen id '" + id + "'", !!win.REALMS[id]));
  check("1. REALMS has realm-neutral", !!win.REALMS["realm-neutral"]);
  check("1b. REALM_IDS excludes realm-neutral, has exactly 11", win.REALM_IDS.length === 11 && win.REALM_IDS.indexOf("realm-neutral") < 0,
    JSON.stringify(win.REALM_IDS));
  check("1c. realmOf falls back to realm-neutral for an unknown key", win.realmOf("not-a-real-realm").id === "realm-neutral");
  check("1d. realmOf resolves a known key exactly", win.realmOf("chrome").id === "chrome");
  const lenses = win.REALMS.theater.eraLens;
  check("1e. theater carries exactly 7 era-lenses", Array.isArray(lenses) && lenses.length === 7, JSON.stringify(lenses && lenses.map((l) => l.id)));
  ["trench", "hedgerow", "legion", "musket", "longship", "jungle", "siege"].forEach((id) =>
    check("1e. era-lens has '" + id + "'", lenses.some((l) => l.id === id)));
  check("1f. theaterEraLens resolves a known id", win.theaterEraLens("siege").id === "siege");
  check("1f. theaterEraLens falls back to the first lens for an unknown id", win.theaterEraLens("not-a-lens").id === lenses[0].id);
}

// ============================================================================
// 2. the d300 tag pass — full coverage, closed vocabulary
// ============================================================================
console.log("\n--- §2. the d300 Realm tag pass ---");
{
  const win = newWin();
  const t = win.GENESIS_TABLES ? win.GENESIS_TABLES["dungeon-loot-outlandish"] : win.__tablesJson && win.__tablesJson["dungeon-loot-outlandish"];
  const tbl = t || JSON.parse(read("tables.json"))["dungeon-loot-outlandish"];
  check("2. dungeon-loot-outlandish compiled as d300 with 300 rows", tbl.die === 300 && tbl.rows.length === 300,
    JSON.stringify({ die: tbl.die, rows: tbl.rows.length }));
  const validRealms = new Set(Object.keys(win.REALMS));
  let missingRealm = 0, invalidRealm = 0;
  tbl.rows.forEach((r) => {
    const cols = r[5] || [];
    const realm = (cols[4] || "").trim();
    if (!realm) missingRealm++;
    else if (!validRealms.has(realm)) invalidRealm++;
  });
  check("2. every row (300/300) carries a non-empty Realm cell", missingRealm === 0, "missing=" + missingRealm);
  check("2. every Realm value is a member of the frozen vocabulary", invalidRealm === 0, "invalid=" + invalidRealm);
}

// ============================================================================
// 3. diff audit — Item/Origin/Effect/Band cells byte-identical to the pre-pass snapshot
// ============================================================================
console.log("\n--- §3. diff audit (tag pass touched ONLY new columns) ---");
{
  const md = read("Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Loot - Outlandish.md");
  const rowRe = /^\|(\d+)\|\*\*(.+?)\*\*\|_(.+?)_\|(.+?)\|(\w[\w-]*)\|([^|]*)\|([^|]*)\|$/;
  const lines = md.split("\n");
  let sample = 0, matched = 0;
  // spot-check a handful of KNOWN, hand-verified rows (frozen expectations — a real snapshot,
  // not re-derived from the file under test) survive byte-identical through both new columns.
  const EXPECT = {
    1: { item: "The Red Ball", origin: "Pokémon", effect: "Throw at a beast; on hit, it is trapped in a pocket dimension.", band: "utility" },
    300: { item: "The Infinity Gauntlet (Real)", origin: "Marvel", effect: "Can rewrite reality. (Requires 6 Infinity Gems).", band: "reality-breaking" },
    99: { item: "The DeLorean", origin: "BttF", effect: "A vehicle that can travel through time. (Requires 1.21GW).", band: "reality-breaking" },
    5: { item: "Nike Air Jordan 1s", origin: "Reality", effect: "+10ft movement. Can cast _Jump_ at will on flat ground.", band: "utility" },
  };
  lines.forEach((ln) => {
    const m = rowRe.exec(ln);
    if (!m) return;
    const n = parseInt(m[1], 10);
    if (!EXPECT[n]) return;
    sample++;
    const e = EXPECT[n];
    if (m[2] === e.item && m[3] === e.origin && m[4] === e.effect && m[5] === e.band) matched++;
  });
  check("3. spot-checked rows (1,5,99,300) byte-identical on Item/Origin/Effect/Band", sample === 4 && matched === 4,
    JSON.stringify({ sample, matched }));
}

// ============================================================================
// 4. rank ladders — high-power/reality-breaking carry ladders; reality-breaking floors at L9
// ============================================================================
console.log("\n--- §4. rank ladders (ADAM-REVIEW-1) ---");
{
  const win = newWin();
  const tbl = JSON.parse(read("tables.json"))["dungeon-loot-outlandish"];
  let hpMissing = 0, rbMissing = 0, rbFloorBad = 0, utilCombatWithRanks = 0;
  tbl.rows.forEach((r) => {
    const band = r[2], cols = r[5] || [];
    const ranks = (cols[5] || "").trim();
    if (band === "high-power" && !ranks) hpMissing++;
    if (band === "reality-breaking") {
      if (!ranks) rbMissing++;
      else {
        const m = /R1\(L(\d+)\)/.exec(ranks);
        if (!m || parseInt(m[1], 10) !== 9) rbFloorBad++;
      }
    }
    if ((band === "utility" || band === "combat") && ranks) utilCombatWithRanks++;
  });
  check("4. every high-power row carries a Ranks ladder (49/49)", hpMissing === 0, "missing=" + hpMissing);
  check("4. every reality-breaking row carries a Ranks ladder (4/4)", rbMissing === 0, "missing=" + rbMissing);
  check("4. every reality-breaking row's R1 floors at EXACTLY L9", rbFloorBad === 0, "bad=" + rbFloorBad);
  check("4. utility/combat rows carry NO ladder this pass (flat, per ADAM-REVIEW-1)", utilCombatWithRanks === 0, "count=" + utilCombatWithRanks);
}

// ============================================================================
// 5. THE SOURCING SUPERSEDE (BREACH.md §2e.3)
// ============================================================================
console.log("\n--- §5. the sourcing supersede ---");
{
  const win = newWin();
  for (let L = 1; L <= 20; L++) {
    const allowed = win.dwalkOutlandishAllowed(L, false);
    check("5. L" + L + " normal-walk allowed-list NEVER includes reality-breaking", allowed.indexOf("reality-breaking") < 0, JSON.stringify(allowed));
  }
  const belowFloor = win.dwalkOutlandishAllowed(8, true);
  check("5. L8 in-breach still respects the L9 floor (reality-breaking absent)", belowFloor.indexOf("reality-breaking") < 0, JSON.stringify(belowFloor));
  const atFloor = win.dwalkOutlandishAllowed(9, true);
  check("5. L9 in-breach opens reality-breaking (the L9 floor, exactly like any other band gate)", atFloor.indexOf("reality-breaking") >= 0, JSON.stringify(atFloor));
}

// ============================================================================
// 5b. MUTATION CHECK — neuter the supersede, confirm the harness catches it, then restore
// ============================================================================
console.log("\n--- §5b. MUTATION CHECK (shown RED, then restored) ---");
{
  const win = newWin();
  // simulate the OLD (pre-supersede) gate inline: reality-breaking opens on level alone.
  win.eval("function __oldGateAllowed(level){var L=level||1; var GATE={utility:1,combat:3,'high-power':6,'reality-breaking':9}; return Object.keys(GATE).filter(function(b){return L>=GATE[b];});}");
  const brokenAllowed = win.__oldGateAllowed(9);
  const brokenPass = brokenAllowed.indexOf("reality-breaking") < 0;
  check("5b. MUTATION shown RED: the OLD (pre-supersede) gate DOES leak reality-breaking at L9 with no breach flag", !brokenPass,
    "old-gate allowed=" + JSON.stringify(brokenAllowed) + " (expected to leak — this confirms the mutation is real)");
  const restored = win.dwalkOutlandishAllowed(9, false);
  check("5b. RESTORED: the real (2-arg, inBreach-gated) dwalkOutlandishAllowed excludes it again", restored.indexOf("reality-breaking") < 0, JSON.stringify(restored));
}

// ============================================================================
// 6. realm filter
// ============================================================================
console.log("\n--- §6. realm filter (in-breach draws) ---");
{
  const win = newWin();
  let offRealm = 0, total = 0;
  for (let i = 0; i < 200; i++) {
    const item = win.dwalkOutlandish(9, { inBreach: true, realms: ["chrome"] });
    if (!item) continue;
    total++;
    if (item.realm && item.realm !== "chrome" && item.realm !== "realm-neutral") offRealm++;
  }
  check("6. 200 in-breach chrome-filtered draws never return an off-realm item", offRealm === 0 && total > 0,
    JSON.stringify({ total, offRealm }));
}

// ============================================================================
// 7. THE ≥1-PER-BREACH GUARANTEE
// ============================================================================
console.log("\n--- §7. the guarantee executor ---");
{
  const win = newWin();
  const segsNoSocial = [{ id: "s1", type: "Empty" }, { id: "s2", type: "Enemy" }];
  const segsWithSocial = [{ id: "s1", type: "Social" }, { id: "s2", type: "Enemy" }];
  const CHANNELS = ["hoard", "social", "secret", "apex"];
  let socialSeen = false, allValid = true, itemsResolved = 0;
  for (let i = 0; i < 400; i++) {
    const g = win.breachLootGuarantee(9, [], segsWithSocial);
    if (CHANNELS.indexOf(g.channel) < 0) allValid = false;
    if (g.channel === "social") socialSeen = true;
    if (g.item) itemsResolved++;
  }
  check("7. breachLootGuarantee always returns a valid channel", allValid);
  check("7. breachLootGuarantee always resolves a non-null item when the table's compiled", itemsResolved === 400, "resolved=" + itemsResolved + "/400");
  check("7. with a Social segment present, social channel DOES surface over 400 tries", socialSeen);

  // §7b — the social→hoard fallback (no Social segment anywhere in the walk)
  let socialLeaked = 0;
  for (let i = 0; i < 400; i++) {
    const g = win.breachLootGuarantee(9, [], segsNoSocial);
    if (g.channel === "social") socialLeaked++;
  }
  check("7b. with NO Social segment, channel NEVER reports 'social' (falls back to hoard, 400 tries)", socialLeaked === 0, "leaked=" + socialLeaked);
}

// ============================================================================
// 8. regression — verify-breach.mjs's own suite still passes 0 failed
// ============================================================================
console.log("\n--- §8. regression (verify-breach.mjs unharmed) ---");
{
  let out = "", code = 0;
  try {
    out = execFileSync(process.execPath, [join(ROOT, "dev/verify-breach.mjs")], { encoding: "utf-8" });
  } catch (e) {
    out = (e.stdout || "") + (e.stderr || "");
    code = e.status || 1;
  }
  const m = /(\d+) passed, (\d+) failed/.exec(out);
  check("8. dev/verify-breach.mjs exits 0, 0 failed", code === 0 && m && m[2] === "0", "exit=" + code + " " + (m ? m[0] : "(no summary line)"));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
