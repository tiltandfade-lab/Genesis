/* ============================================================================
   EVENT-NUM-FOLD PROBES — HQ2-1 (fix/event-num-fold, HOTFIX-QUEUE 07-07 keystone).
   ----------------------------------------------------------------------------
   Per-field `num:[...]` tags in DM_EVENT_FIELDS coerce the payload fields the
   handlers do MATH on ONCE inside dmFoldPayload (dmNum), retiring the hand-called
   dmNum sites. Red-first, mutation-asserted probes:

     P1 (flagship #1) clock_advanced delta:"-1" — RED: the string falls to the
        default +1 and the clock moves FORWARD; GREEN: coerced to -1, the clock
        moves BACKWARD. Assert the clock VALUE moved DOWN.
     P2 (flagship #2) grapple bonus:"2" — RED: "2" string-concats into the total
        ("…2", non-finite); GREEN: coerced to 2, attackerTotal===19 (finite).
     P3 preservation — the retired hand-sites still coerce through the fold:
        hp_changed delta:"-5" drops HP by 5; check bonus:"3" totals correctly.
     P4 loudness — a coerced field emits ONE payload-coercion drift ledger line.

   Boot pattern copied from dev/verify-detected-events.mjs.
   Run:  node dev/verify-event-num-fold.mjs
   ============================================================================ */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const srcText = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{},souls:[]}; var SEED=null;`;
const EXPOSE = ["DM_EVENT_TYPES", "DM_EVENT_FIELDS", "dmFoldPayload", "applyEvent", "findClockTarget", "resolveGrapple"];
const expose = ";" + EXPOSE.map((n) => `try{window.${n}=${n};}catch(e){}`).join("");
const STUBS = ["renderWorld", "wakeReveal", "postState", "saveU", "toast", "showTab", "dieRoll", "streamDMText", "diceOverlay", "dmBridgeDown"];

function boot() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText + "\n" + expose);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  for (const n of STUBS) { try { win.eval(`typeof ${n}==="function"&&(${n}=function(){});`); } catch (_) {} }
  win.GS.dm = { turnId: null, pending: false, rollReq: null, ask: null, telemetry: [] };
  return win;
}

function seedWorld(win, opts) {
  opts = opts || {};
  const w = {
    id: "w-probe", name: "Probe Hold",
    seed: { master: { name: "Probe Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
      taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" }, faction: { name: "The Probe Circle" } },
    characters: [{ id: "c1", status: "living", name: "Probe PC", headline: "a test", pronouns: "they",
      sheet: { species: "Human", class: "Wizard", background: "Sage", level: opts.level || 1, xp: opts.xp || 0,
        hp: 20, hpCur: opts.hpCur != null ? opts.hpCur : 20, ac: 14, tempHp: 0, profBonus: 2, gold: opts.gold != null ? opts.gold : 0,
        scores: { str: 10, dex: 12, con: 14, int: 16, wis: 10, cha: 10 },
        mods: { str: 0, dex: 1, con: 2, int: 3, wis: 0, cha: 0 }, saveProfs: [], skillProfs: [], conditions: [], inventory: [],
        exhaustion: opts.exhaustion || 0 } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name: "The Ironwood Circle", dominant: true, agenda: "spread", method: "force", tags: [], clock: { size: 6, filled: opts.clockFilled != null ? opts.clockFilled : 0 } }],
    pressures: [], revealed: {}, dmlog: [],
  };
  const origin = win.addNode(w, "Probe Hold", "Setting");
  w.currentNodeId = origin; win.seeNode(w, origin);
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  if (typeof win.ensureResources === "function") win.ensureResources(w.characters[0].sheet);
  return w;
}

const results = [];
const probe = (id, title, resolved, detail) => results.push({ id, title, resolved, detail });

console.log("=== EVENT-NUM-FOLD probes ===\n");

// ---------------------------------------------------------------------------
// P1 — clock_advanced delta:"-1" (STRING). Seed the Ironwood clock at filled=2.
// RED: string is not a number -> handler default d=1 -> filled 2 -> 3 (FORWARD).
// GREEN: fold coerces "-1" -> -1 -> filled 2 -> 1 (BACKWARD). Assert value DROPPED.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { clockFilled: 2 });
  const before = w.factions[0].clock.filled;
  win.applyEvent(w, { type: "clock_advanced", source: "declared", payload: { clockId: "The Ironwood Circle", delta: "-1" } });
  const after = w.factions[0].clock.filled;
  probe("P1", 'clock_advanced delta:"-1" moves the clock BACKWARD (coerced string)',
    after === before - 1, `filled ${before} -> ${after} (expected ${before - 1}); moved ${after < before ? "DOWN" : after > before ? "UP" : "NONE"}`);
}

// ---------------------------------------------------------------------------
// P2 — grapple bonus:"2" (STRING), d20:17. No combat foe -> +0 defender.
// RED: "2" concatenates into the contest total (non-finite / "...2").
// GREEN: fold coerces "2" -> 2 -> attackerTotal === 17+0+0+2 === 19 (finite).
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, {});
  const res = win.applyEvent(w, { type: "grapple", source: "declared", payload: { d20: 17, bonus: "2" } });
  const total = res && res.attackerTotal;
  probe("P2", 'grapple bonus:"2" totals 19 not "172" (coerced string)',
    Number.isFinite(total) && total === 19, `attackerTotal=${JSON.stringify(total)} (finite=${Number.isFinite(total)}; expected 19)`);
}

// ---------------------------------------------------------------------------
// P3a — preservation: hp_changed delta:"-5" (STRING) still drops HP by 5 via fold.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { hpCur: 20 });
  const sh = w.characters[0].sheet;
  const before = sh.hpCur;
  win.applyEvent(w, { type: "hp_changed", source: "declared", payload: { delta: "-5" } });
  const after = sh.hpCur;
  probe("P3a", 'preserved: hp_changed delta:"-5" drops HP by 5 through the fold',
    after === before - 5, `hpCur ${before} -> ${after} (expected ${before - 5})`);
}

// ---------------------------------------------------------------------------
// P3b — preservation: check bonus:"3" (STRING) still folds into a numeric total.
// Wizard, Investigation (INT+3), not proficient -> total = 10 + 3(int) + 3(bonus) = 16.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, {});
  const res = win.applyEvent(w, { type: "check", source: "declared", payload: { d20: 10, key: "Investigation", dc: 15, bonus: "3" } });
  const total = res && res.result && res.result.total;
  probe("P3b", 'preserved: check bonus:"3" folds into a numeric total (16)',
    Number.isFinite(total) && total === 16, `total=${JSON.stringify(total)} (expected 16)`);
}

// ---------------------------------------------------------------------------
// P4 — loudness: a coerced field emits ONE payload-coercion drift ledger line.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { clockFilled: 2 });
  win.applyEvent(w, { type: "clock_advanced", source: "declared", payload: { clockId: "The Ironwood Circle", delta: "-1" } });
  const coercions = (w.ledger || []).filter((l) => l.data && l.data.kind === "payload-coercion" && l.data.type === "clock_advanced" && l.data.key === "delta");
  probe("P4", "a coerced clock_advanced.delta emits one payload-coercion drift ledger line",
    coercions.length === 1, `payload-coercion lines for clock_advanced.delta = ${coercions.length}`);
}

// ---------------------------------------------------------------------------
// P5 — tag integrity: every field named in a DM_EVENT_FIELDS `num` list is also
// in that event's `accept` list (a num tag on a non-accepted field is a latent
// no-op the fold would never see). Self-adjusting (reads live spec).
// ---------------------------------------------------------------------------
{
  const win = boot();
  const F = win.DM_EVENT_FIELDS;
  const bad = [];
  Object.keys(F).forEach((t) => {
    const spec = F[t] || {};
    (spec.num || []).forEach((k) => { if ((spec.accept || []).indexOf(k) < 0) bad.push(t + "." + k); });
  });
  probe("P5", "every DM_EVENT_FIELDS num field is also an accept field",
    bad.length === 0, bad.length ? "orphan num tags: " + bad.join(", ") : "all num fields accepted");
}

/* ============================================================================
   HQ2-1-TOPUP probes (HOTFIX-QUEUE-2026-07-07 HQ2-1 full-table top-up, branch
   fix/event-num-fold-topup). The keystone tagged only 8 events; this batch tags
   the rest of the spec's table. P6-P9 cover the 4 fields the task calls out by
   name. Each pairs (a) a VALUE assertion and (b) a LOUDNESS assertion (a
   payload-coercion ledger line) — for temp_hp/item_split/social_check the
   handler's own inline Number()/typeof-tolerant math already survives a clean
   numeric STRING pre-topup (Math.max/Number() coerce silently), so the VALUE
   assertion alone does NOT flip red — the LOUDNESS assertion is what is
   actually RED pre-topup (no dmFoldPayload num tag -> no coercion -> no ledger
   line) and GREEN post-topup. item_changed.gold is the one exception: its
   pre-topup `typeof p.gold==="number"` gate SILENTLY DROPS a string gold delta
   entirely (gold stays unchanged) -- that one is red on the VALUE itself. ============================================================================ */

// ---------------------------------------------------------------------------
// P6 — temp_hp n:"8" (STRING). VALUE: hpTemp moves to 8, not NaN/concat.
// LOUDNESS (the real red/green split): a payload-coercion ledger line for
// temp_hp.n exists post-topup; pre-topup grantTempHp's own Math.max(0,"8")
// silently coerces with NO ledger line at all.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, {});
  win.applyEvent(w, { type: "temp_hp", source: "declared", payload: { n: "8" } });
  const tempHp = w.characters[0].sheet.tempHp;
  probe("P6a", 'temp_hp n:"8" grants 8 temp HP, not NaN/concat',
    tempHp === 8, `sheet.tempHp=${JSON.stringify(tempHp)} (expected 8)`);
  const coercions = (w.ledger || []).filter((l) => l.data && l.data.kind === "payload-coercion" && l.data.type === "temp_hp" && l.data.key === "n");
  probe("P6b", 'temp_hp n:"8" emits one payload-coercion drift ledger line (RED pre-topup: 0 lines, handler silently self-coerced)',
    coercions.length === 1, `payload-coercion lines for temp_hp.n = ${coercions.length}`);
}

// ---------------------------------------------------------------------------
// P7 — item_changed gold:"-50" (STRING) at gold 100. Genuinely RED on the VALUE
// pre-topup: the retired `typeof p.gold==="number"` gate rejects a string
// outright and DROPS the whole gold delta (gold stays 100).
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, { gold: 100 });
  win.applyEvent(w, { type: "item_changed", source: "declared", payload: { gold: "-50" } });
  const gold = w.characters[0].sheet.gold;
  probe("P7", 'item_changed gold:"-50" drops gold to 50 (RED pre-topup: stays 100, string silently dropped)',
    gold === 50, `sheet.gold=${JSON.stringify(gold)} (expected 50)`);
}

// ---------------------------------------------------------------------------
// P8 — social_check dc:"18" (STRING) graded vs 18. VALUE: the resolved dc is
// the number 18 (both pre- and post-topup — the site's own isFinite(Number())
// clamp already coerced strings). LOUDNESS is the real split: post-topup a
// payload-coercion ledger line fires for social_check.dc; pre-topup the hand
// clamp coerced silently, no ledger line.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, {});
  w.codex = { records: { npcA: { id: "npcA", kind: "npc", name: "Test NPC", status: {} } }, version: 1 };
  const res = win.applyEvent(w, { type: "social_check", source: "declared", payload: { target: "npcA", dc: "18", skill: "persuasion" } });
  probe("P8a", 'social_check dc:"18" grades against dc===18 (a NUMBER)',
    res && res.dc === 18, `result.dc=${JSON.stringify(res && res.dc)} (expected 18)`);
  const coercions = (w.ledger || []).filter((l) => l.data && l.data.kind === "payload-coercion" && l.data.type === "social_check" && l.data.key === "dc");
  probe("P8b", 'social_check dc:"18" emits one payload-coercion drift ledger line (RED pre-topup: 0 lines, hand clamp self-coerced)',
    coercions.length === 1, `payload-coercion lines for social_check.dc = ${coercions.length}`);
}

// ---------------------------------------------------------------------------
// P9 — item_split qty:"2" (STRING) off a stack of 5. VALUE: the split peels
// exactly 2 (both pre- and post-topup — the site's own Math.floor(Number(...))
// already coerced strings). LOUDNESS is the real split: post-topup a
// payload-coercion ledger line fires for item_split.qty; pre-topup the inline
// Number() coerced silently, no ledger line.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const w = seedWorld(win, {});
  const sh = w.characters[0].sheet;
  sh.inventory.push({ id: "arrows1", name: "Arrows", qty: 5 });
  const res = win.applyEvent(w, { type: "item_split", source: "declared", payload: { itemId: "arrows1", qty: "2" } });
  const from = sh.inventory.find((it) => it.id === "arrows1");
  probe("P9a", 'item_split qty:"2" leaves 3 behind (peeled a real 2, not NaN)',
    res && res.ok && from && from.qty === 3, `ok=${res && res.ok} from.qty=${from && from.qty} (expected true/3)`);
  const coercions = (w.ledger || []).filter((l) => l.data && l.data.kind === "payload-coercion" && l.data.type === "item_split" && l.data.key === "qty");
  probe("P9b", 'item_split qty:"2" emits one payload-coercion drift ledger line (RED pre-topup: 0 lines, inline Number() self-coerced)',
    coercions.length === 1, `payload-coercion lines for item_split.qty = ${coercions.length}`);
}

// ---------------------------------------------------------------------------
let pass = 0, fail = 0;
for (const r of results) {
  const ok = r.resolved;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.id}  ${r.title}`);
  console.log(`        ${r.detail}`);
  ok ? pass++ : fail++;
}
console.log(`\n${pass}/${results.length} probes green` + (fail ? `  (${fail} RED)` : ""));
process.exit(fail ? 1 : 0);
