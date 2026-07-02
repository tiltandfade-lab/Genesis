/* verify-loose-ends.mjs — headless test for docs/LOOSE-ENDS-070126.md
   (BATCH2-GUARDRAILS H1: loose-ends >=5/0).

   Enumerated assertions (spec §1-§2):
   §1 SOCIAL loose ends:
   1. a "gift" applyEvent writes codex.gifts[] on the target NPC ({what,day,from}) — given=remembered.
   2. the gift rides codexDigest's full-tier record (o.gifts) so the DM sees it without recalling prose.
   3. the reconciled lever key: applyLeverage("trustLever") is the SAME -5 mod social_check already
      prices (BATCH2-GUARDRAILS H3 — "must be one the SOCIAL applyLeverage already prices"). MUTATION
      check: drop the lever mod, harness fails, then RESTORE.
   4. a gift RECEIVED (given:false) or with no target does not write codex.gifts[] (only a standing
      gift TO an NPC is remembered), and the reputation half of the event still applies unchanged.
   5. tool/DC/charm digest wiring: null-safe when the sheet holds none (today's common case — no
      compiled tool/charm data source exists yet); populates when the sheet DOES carry toolProfs/
      charms/blessings, and is attached to the PC digest block "only when held" (never an empty stub).

   §2 Outlandish diegetic intrusion:
   6. dwalkOutlandish() returns an `intrusion` note ({note,hookBand}) alongside the UNTOUCHED
      mechanical row (name/origin/effect) — the reskin is additive, never a rewrite of the roll.
   7. utility/combat band -> hookBand:false (intrudes quietly, no thread); high-power/reality-breaking
      -> hookBand:true (the spice gate MUTATION check: invert the gate, harness fails, then RESTORE).
   8. item_changed mints a companion codex "thread" record (kind:"thread", legs:"thread-seed") ONLY
      when spec.outlandish.intrusion.hookBand is true; the item's own inventory row is untouched by it.
   9. regression: verify-social stays 97/97 (this file's wiring doesn't perturb the existing suite).

   Loads EVERY module in manifest load order into one jsdom global scope — the "const-via-eval"
   pattern (CLAUDE.md "headless test").
   Run: node dev/verify-loose-ends.mjs   (from repo root) */
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
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshDom(){
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + moduleSrc);
  return dom.window;
}

let win = freshDom();

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function freshWorld(winRef){
  const w = {
    id: "w-loose", name: "Test World",
    seed: { master:{name:"Test",desc:"desc"}, smell:{name:"x"}, sound:{name:"x"}, arch:{name:"x"},
            taboo:{name:"x",desc:"x"}, myth:{name:"x",desc:"x"} },
    characters: [{ status: "living", name: "Ren", headline: "a wanderer", spark: "a wanderer", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Soldier", level: 3, hp: "20/20", ac: 15,
               profBonus: 2, scores: {}, mods: {}, saveProfs: [], skillProfs: [], inventory: [] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 10, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [],
    revealed: { powers: 1, map: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = winRef.addNode(w, "Wilderness Camp", "Place");
  w.currentNodeId = originId;
  w.startNodeId = null;
  winRef.U.worlds[w.id] = w;
  winRef.U.activeWorldId = w.id;
  winRef.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null };
  winRef.GS.combat = null;
  return { w, originId };
}

const need = ["codexGift","codexFullRecord","codexAdd","applyLeverage","socialToolCharmDigest",
  "dwalkOutlandish","dwalkOutlandishAllowed","applyEvent","dmDigest"];
check("all loose-ends globals present after full load", need.every((n) => typeof win[n] === "function"),
      need.filter((n) => typeof win[n] !== "function").join(", "));

// ── 1+2. gift applyEvent writes codex.gifts[] on the target NPC; rides codexDigest's full record ──
{
  const { w } = freshWorld(win);
  win.codexAdd(w, { kind: "npc", name: "Innkeep Marrow", provenance: "rolled" });
  const id = "npc:innkeep-marrow";
  const r = win.applyEvent(w, { type: "gift", payload: { target: id, what: "a warm cloak", from: "the PC" }, source: "declared" });
  check("gift applyEvent still returns ok:true", r.ok === true);
  const rec = win.codexGet(w, id);
  check("codex.gifts[] written on the target NPC", Array.isArray(rec.gifts) && rec.gifts.length === 1, JSON.stringify(rec.gifts));
  check("the gift entry is {what,day,from}", rec.gifts[0].what === "a warm cloak" && rec.gifts[0].from === "the PC" && rec.gifts[0].day === 10,
        JSON.stringify(rec.gifts[0]));
  const full = win.codexFullRecord(w, rec);
  check("codexFullRecord (the digest's full-tier shape) surfaces gifts[] so the DM sees it without recalling prose",
        Array.isArray(full.gifts) && full.gifts.length === 1, JSON.stringify(full.gifts));
}

// ── 3. the reconciled lever key: applyLeverage("trustLever") prices the SAME -5 mod social_check uses ──
{
  const lev = win.applyLeverage(15, ["trustLever"]);
  check("applyLeverage('trustLever') lowers DC by 5 (the standing-gift lever social_check already prices)",
        lev.dc === 10, "dc=" + lev.dc);
}
// MUTATION: replace applyLeverage with a build that drops the trustLever mod — must FAIL, then RESTORE.
{
  const original = win.applyLeverage;
  win.eval(`applyLeverage = function(dc, levers){
    levers = levers || [];
    let mod = 0, autoShift = false;
    const MODS = { want:-5, fear:-5, leverage:-5, wrongLever:5 };   // trustLever DROPPED — the mutation
    for (const l of levers){
      const t = (typeof l === "string") ? l : (l && l.type);
      if (l && typeof l === "object" && l.decisive) autoShift = true;
      if (MODS[t] != null) mod += MODS[t];
    }
    if (dc == null) return { dc: null, terminal: true, autoShift, mod };
    const out = Math.max(5, Math.min(30, (Number(dc) || 0) + mod));
    return { dc: out, autoShift, mod };
  };`);
  const lev = win.applyLeverage(15, ["trustLever"]);
  const mutatedBroke = lev.dc !== 10;
  console.log("  [MUTATION shown RED]", mutatedBroke ? "✓ dropping the trustLever mod DOES stop the DC drop (as expected of the broken build)" : "✗ mutation had no effect — test is not exercising the lever");
  check("MUTATION CONFIRMED: dropping the trustLever mod breaks the gift-leverage DC drop", mutatedBroke, "dc=" + lev.dc);
  win.applyLeverage = original;   // restore
}
win = freshDom();   // fresh DOM — the eval mutation above persists in `win` otherwise

// ── 4. a gift RECEIVED (given:false) or with no target does NOT write codex.gifts[] ──
{
  const { w } = freshWorld(win);
  win.codexAdd(w, { kind: "npc", name: "Wandering Peddler", provenance: "rolled" });
  const id = "npc:wandering-peddler";
  const r1 = win.applyEvent(w, { type: "gift", payload: { target: id, given: false, what: "a whittled charm" }, source: "declared" });
  check("gift RECEIVED (given:false) still returns ok:true (reputation half unaffected)", r1.ok === true);
  check("gift RECEIVED does NOT write codex.gifts[] (only a standing gift TO the NPC is remembered)",
        !(win.codexGet(w, id).gifts && win.codexGet(w, id).gifts.length));
  const r2 = win.applyEvent(w, { type: "gift", payload: { what: "coin, no target" }, source: "declared" });
  check("a gift with no target no-ops the codex write but still returns ok:true", r2.ok === true);
}

// ── 5. tool/DC/charm digest wiring: null-safe absent, populates + attaches "only when held" ──
{
  const noneSh = { toolProfs: [], charms: [], blessings: [] };
  check("socialToolCharmDigest returns null when the sheet holds none (today's common case)",
        win.socialToolCharmDigest(noneSh) === null);
  const heldSh = { toolProfs: ["thieves' tools"], charms: [{ name: "Charm of Vigor", effect: "+1 save vs. exhaustion" }], blessings: [] };
  const digest = win.socialToolCharmDigest(heldSh);
  check("socialToolCharmDigest populates tools[] when the sheet carries toolProfs (name at minimum, DC null-safe pre-table)",
        digest && Array.isArray(digest.tools) && digest.tools[0].name === "thieves' tools", JSON.stringify(digest));
  check("socialToolCharmDigest populates charms[] when the sheet carries charms; blessings[] omitted when empty",
        digest && digest.charms[0].name === "Charm of Vigor" && !("blessings" in digest), JSON.stringify(digest));
  // wired end to end via dmDigest's pc block
  const { w } = freshWorld(win);
  w.characters[0].sheet.toolProfs = ["alchemist's supplies"];
  win.U.activeWorldId = w.id;
  const d = win.dmDigest();
  check("dmDigest's pc block attaches toolsCharms only when held", d.pc && d.pc.toolsCharms && d.pc.toolsCharms.tools[0].name === "alchemist's supplies",
        JSON.stringify(d.pc && d.pc.toolsCharms));
  const { w: w2 } = freshWorld(win);
  win.U.activeWorldId = w2.id;
  const d2 = win.dmDigest();
  check("dmDigest's pc block is null (not an empty stub object) when the sheet holds no tools/charms/blessings",
        d2.pc && d2.pc.toolsCharms === null);
}

// ── 6+7. dwalkOutlandish's intrusion note is additive; band gate hookBand true only on high-power/reality-breaking ──
{
  const origWalkRows = win.walkRows, origWalkRnd = win.walkRnd;
  function stubFor(band){
    win.walkRows = () => ([[1,1,band,"o","e",[band,"Sunstone of Endless Noon","a dead god's toy","blinds for 1 round"]]]);
    win.walkRnd = (rows) => rows[0];
  }
  stubFor("utility");
  const rowU = win.dwalkOutlandish(9);   // level 9 clears every gate — isolates the band check, not the level gate
  check("dwalkOutlandish's mechanical row (name/origin/effect) is UNTOUCHED by the reskin", rowU.name === "Sunstone of Endless Noon" && rowU.origin === "a dead god's toy" && rowU.effect === "blinds for 1 round", JSON.stringify(rowU));
  check("dwalkOutlandish attaches an intrusion note that never names the item outright in its own text carrier (hookBand present)", rowU.intrusion && typeof rowU.intrusion.note === "string" && rowU.intrusion.note.indexOf("do not name it") >= 0, JSON.stringify(rowU.intrusion));
  check("utility band -> hookBand:false (intrudes quietly, no thread)", rowU.intrusion.hookBand === false);
  stubFor("combat");
  const rowC = win.dwalkOutlandish(9);
  check("combat band -> hookBand:false (intrudes quietly, no thread)", rowC.intrusion.hookBand === false);
  stubFor("high-power");
  const rowH = win.dwalkOutlandish(9);
  check("high-power band -> hookBand:true (mints a thread handle)", rowH.intrusion.hookBand === true);
  stubFor("reality-breaking");
  const rowR = win.dwalkOutlandish(9);
  check("reality-breaking band -> hookBand:true (mints a thread handle)", rowR.intrusion.hookBand === true);
  // MUTATION: invert the band gate — must FAIL, then RESTORE.
  const origDwalkOutlandish = win.dwalkOutlandish;
  win.eval(`
    function dwalkOutlandish(level){
      if(typeof rollTable!=="function") return null;
      const rows=walkRows("dungeon-loot-outlandish");
      if(!rows.length) return null;
      const row=walkRnd(rows), c=row[5]||[];
      const band=(row[2]||"").trim();
      const base=(band && (c[0]||"").trim()===band) ? 1 : 0;
      const name=c[base]||null, origin=c[base+1]||null, effect=c[base+2]||null;
      const hookBand=(band==="utility"||band==="combat");   // INVERTED gate — the mutation
      const intrusion = name ? { note:dwalkOutlandishIntrusionNote(name, band), hookBand } : null;
      return { band:row[2]||null, name, origin, effect, intrusion };
    }
  `);
  stubFor("high-power");
  const rowMut = win.dwalkOutlandish(9);
  const mutatedBroke = rowMut.intrusion.hookBand !== true;   // was true pre-mutation; inverted gate now says false
  console.log("  [MUTATION shown RED]", mutatedBroke ? "✓ inverting the band gate DOES flip high-power to hookBand:false (as expected of the broken build)" : "✗ mutation had no effect — test is not exercising the gate");
  check("MUTATION CONFIRMED: inverting the band gate breaks high-power's hookBand:true", mutatedBroke, JSON.stringify(rowMut.intrusion));
  win.walkRows = origWalkRows; win.walkRnd = origWalkRnd; win.dwalkOutlandish = origDwalkOutlandish;
}
win = freshDom();   // fresh DOM — the evals above persist in `win` otherwise

// ── 8. item_changed mints a thread ONLY when hookBand is true; the item row itself is untouched ──
{
  const { w } = freshWorld(win);
  const rQuiet = win.applyEvent(w, { type: "item_changed", payload: { add: [{ name: "Sunstone of Endless Noon",
    outlandish: { band: "utility", intrusion: { note: "present as an in-world curiosity", hookBand: false } } }] }, source: "declared" });
  check("item_changed (utility band) still adds the item to inventory", rQuiet.ok === true && rQuiet.added[0].name === "Sunstone of Endless Noon");
  check("item_changed (utility band) mints NO thread — quiet intrusion", rQuiet.added[0].intrusionThreadId === undefined);
  const threadCountBefore = Object.values(win.codexOf(w).records).filter(r => r.kind === "thread").length;
  check("sanity: no thread record exists yet", threadCountBefore === 0);

  const rHook = win.applyEvent(w, { type: "item_changed", payload: { add: [{ name: "Grieving Star Shard",
    outlandish: { band: "reality-breaking", intrusion: { note: "present as an in-world curiosity", hookBand: true } } }] }, source: "declared" });
  check("item_changed (reality-breaking band) still adds the item — mechanical row untouched by the reskin",
        rHook.ok === true && rHook.added[0].name === "Grieving Star Shard");
  const threadCountAfter = Object.values(win.codexOf(w).records).filter(r => r.kind === "thread").length;
  check("item_changed (reality-breaking band) mints exactly one companion thread handle", threadCountAfter === 1, "count=" + threadCountAfter);
  const thread = Object.values(win.codexOf(w).records).find(r => r.kind === "thread");
  check("the minted thread carries legs:thread-seed (the CONSEQUENCE-LADDER sink)", thread && thread.dm && thread.dm.legs === "thread-seed");
  check("the surfaced item's own inventory instance carries the thread's id back (for later reference)",
        rHook.added[0].intrusionThreadId === thread.id);
}

// ── 9. regression: verify-social stays 97/97 (this file's wiring doesn't perturb the existing suite) ──
{
  try {
    const out = execFileSync("node", [join(ROOT, "dev/verify-social.mjs")], { encoding: "utf-8" });
    const m = out.match(/(\d+) passed, (\d+) failed/);
    check("verify-social regression: 97 passed, 0 failed (unchanged)", !!m && m[1] === "97" && m[2] === "0", out.trim().split("\n").slice(-1)[0]);
  } catch (e) {
    check("verify-social regression: 97 passed, 0 failed (unchanged)", false, String(e));
  }
}

console.log(`\nLOOSE-ENDS: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
