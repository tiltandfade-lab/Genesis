/* ============================================================================
   PLAYTEST BUG PROBES — the running regression suite for bugs caught in play.
   ----------------------------------------------------------------------------
   The bridgeless playtest (dev/playtest-bridgeless.mjs) surfaced a cluster of
   engine bugs on 2026-07-05 (session "The Shimmering Maw"). This file makes the
   harness AWARE of them: one deterministic probe per bug that reports whether it
   still REPRODUCES against the current engine. Run it before/after any fix — a
   probe that flips from PRESENT to RESOLVED is your regression guard; a RESOLVED
   probe that goes PRESENT again is a re-introduced bug.

   Companion doc (the running list, with root cause + intended fix):
     docs/PLAYTEST-BUGS.md   (bug ids below match that file: BUG-01 … )

   Run:  node dev/playtest-bug-probes.mjs
   (jsdom resolved per CLAUDE.md "headless test"; override JSDOM_HOME if needed.)
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
const EXPOSE = ["STAGES", "SPECIES", "CLASSES", "BACKGROUNDS", "DM_EVENT_TYPES", "DM_EVENT_FIELDS", "dmFoldPayload"];
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

// a minimal living world for the applyEvent-based probes
function seedWorld(win) {
  const w = {
    id: "w-probe", name: "Probe Hold",
    seed: { master: { name: "Probe Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
      taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" }, faction: { name: "The Probe Circle" } },
    characters: [{ id: "c1", status: "living", name: "Probe PC", headline: "a test", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Soldier", level: 1, xp: 0,
        hp: 9, hpCur: 9, ac: 14, tempHp: 0, profBonus: 2, scores: { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
        mods: { str: 1, dex: 1, con: 1, int: 0, wis: 0, cha: 0 }, saveProfs: [], skillProfs: [], conditions: [], inventory: [] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name: "The Ironwood Circle", dominant: true, agenda: "spread", method: "force", tags: [], clock: { size: 6, filled: 0 } }],
    pressures: [], revealed: {}, dmlog: [],
  };
  const origin = win.addNode(w, "Probe Hold", "Setting");
  w.currentNodeId = origin; win.seeNode(w, origin);
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  if (typeof win.ensureResources === "function") win.ensureResources(w.characters[0].sheet);
  return w;
}

// ROOT-A REGRESSION GUARD — apply one event and demand BOTH halves of the proof:
//   (1) ok-flag true with no degradation flag (untracked), and
//   (2) a real before/after state change in the slice the event claims to mutate.
// A silent no-op ({ok:false} read as refusal, or {ok:true,untracked:true} read as
// success) fails here — the exact invisibility that shipped BUG-01/BUG-09.
// snap() returns the watched slice (JSON-serializable); pass = flag AND diff.
function applyMutates(win, w, e, snap) {
  const before = JSON.stringify(snap());
  const res = win.applyEvent(w, e);
  const after = JSON.stringify(snap());
  const okFlag = !!(res && res.ok === true && !res.untracked);
  const changed = before !== after;
  return { res, okFlag, changed, pass: okFlag && changed, before, after };
}

const results = [];
const probe = (id, title, present, detail) => results.push({ id, title, present, detail });

// ---------------------------------------------------------------------------
// VARIETY CHARACTERIZATION — the world-seed roll should give a fresh setting
// name almost every game (bardo reincarnation is the only intended repeat path).
// Not a bug per se; a distribution flag. PRESENT = suspiciously low variety.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const N = 60, names = {};
  for (let i = 0; i < N; i++) { const r = win.lookup("master"); names[r.name] = (names[r.name] || 0) + 1; }
  const distinct = Object.keys(names).length;
  const maxHit = Math.max(...Object.values(names));
  const top = Object.entries(names).sort((a, b) => b[1] - a[1])[0];
  // flag if fewer than ~40% distinct over 60 rolls, or any single setting hits >4x (skew)
  const lowVariety = distinct < N * 0.4 || maxHit > 4;
  probe("VARIETY", `world-seed variety: ${distinct} distinct settings in ${N} rolls (top: "${top[0]}" ×${top[1]})`,
    lowVariety, `distinct=${distinct}/${N}, maxHit=${maxHit}. Bardo-reincarnation repeat path is a separate FUTURE feature (see PLAYTEST-BUGS.md FIX-A).`);
}

// ---------------------------------------------------------------------------
// BUG-01 (CRITICAL) — branch events rejected: resolveBranch stamps source:"branch",
// validateEvent only accepts detected|declared, so every branch event no-ops.
// Probe the seam directly: does applyEvent DROP a well-formed source:"branch" event?
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const m = applyMutates(win, w,
    { type: "clock_advanced", source: "branch", payload: { clockId: "The Ironwood Circle", delta: 1 } },
    () => w.factions[0].clock.filled);
  probe("BUG-01", "branch-sourced events rejected by validateEvent (roll-branch consequences vanish)",
    !m.pass, `applyEvent(source:"branch") -> ${JSON.stringify(m.res)}; clock ${m.before}->${m.after}`);
}

// ---------------------------------------------------------------------------
// BUG-09 (CRITICAL) — every manual player-action button dead: inventory.js ×6 and
// claimLevelUp (creator/levelup.js:146) stamp source:"player", which validateEvent
// rejected. Probe both halves at the seam: does a source:"player" equip land on the
// sheet, and does a source:"player" level_applied grow the level?
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const sh = w.characters[0].sheet;
  sh.inventory.push({ id: "it-probe-sword", name: "Probe Sword" });   // unindexed → equip skips the kind check
  const eq = applyMutates(win, w,
    { type: "equip", source: "player", payload: { itemId: "it-probe-sword", slot: "mainHand" } },
    () => (sh.equipped && sh.equipped.mainHand) || null);
  const equipDead = !eq.pass || sh.equipped.mainHand !== "it-probe-sword";
  const lv = applyMutates(win, w,
    { type: "level_applied", source: "player", payload: { to: 2 } },
    () => sh.level);
  const levelDead = !lv.pass || sh.level !== 2;
  probe("BUG-09", "player-sourced UI events rejected (all 7 inventory/level-up buttons dead)",
    equipDead || levelDead,
    `equip -> ${JSON.stringify(eq.res)} mainHand=${sh.equipped && sh.equipped.mainHand}; level_applied -> ${JSON.stringify(lv.res)} level=${sh.level}`);
}

// ---------------------------------------------------------------------------
// ROOT-A GUARD — the source enum: every legitimate provenance validates; a typo'd
// one still fails LOUD. PRESENT = the enum regressed in either direction.
// ---------------------------------------------------------------------------
{
  const win = boot();
  const legit = ["detected", "declared", "player", "branch", null];
  const rejected = legit.filter((s) => {
    const e = { type: "hp_changed", payload: { delta: 0 } }; if (s !== null) e.source = s;
    return !win.validateEvent(e).ok;
  });
  const laundered = win.validateEvent({ type: "hp_changed", payload: { delta: 0 }, source: "guessed" }).ok;
  probe("ROOT-A", "source-enum drift guard (legit provenances validate; garbage still fails)",
    rejected.length > 0 || laundered,
    `rejected legit: [${rejected.join(",")}]; garbage "guessed" accepted=${laundered}`);
}

// ---------------------------------------------------------------------------
// BUG-02 (HIGH) — no event advances the WORLD CLOCK: walk_advance moves a walk
// cursor, not the clock. Probe: does clock.min move after a walk_advance?
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const before = w.clock.min;
  win.applyEvent(w, { type: "walk_advance", source: "detected", payload: { hours: 1, from: "a", to: "b" } });
  const stuck = w.clock.min === before;
  probe("BUG-02", "world clock does not advance on travel/combat (no DM event ticks the clock)",
    stuck, `walk_advance hours:1 -> clock.min ${before} -> ${w.clock.min}. (Design: combat should tick >=6s/round; distance should advance.)`);
}

// ---------------------------------------------------------------------------
// BUG-03 (HIGH) — digest ships MAX hp, not current: DM can't see how hurt the PC is.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.characters[0].sheet.hpCur = 1;   // badly hurt
  const dg = win.dmDigest();
  const hidesCurrent = dg && dg.pc && dg.pc.hp === 9 && dg.pc.hp !== 1;
  probe("BUG-03", "digest reports MAX hp, never hpCur (DM narrates combat blind to PC wounds)",
    hidesCurrent, `hpCur=1 but digest.pc.hp=${dg && dg.pc && dg.pc.hp}`);
}

// ---------------------------------------------------------------------------
// BUG-04 (HIGH) — no non-lethal KO: hp_changed to 0 triggers death saves even for
// a declared capture. Probe: dropping to exactly 0 starts the dying/death-save track.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  w.characters[0].sheet.hpCur = 3;
  const res = win.applyEvent(w, { type: "hp_changed", source: "declared", payload: { delta: -3 } });
  const sh = w.characters[0].sheet;
  const dying = !!(res && (res.deathSavesStarted || res.dropped)) || !!(sh.deathSaves);
  probe("BUG-04", "no non-lethal knockout path (0 HP always starts death saves, even on declared capture)",
    dying, `hp 3 - 3 -> ${sh.hpCur}; deathSaves=${JSON.stringify(sh.deathSaves || null)}, res=${JSON.stringify(res)}`);
}

// ---------------------------------------------------------------------------
// BUG-05 (MED) — discovery makeNode creates a node but never moves the PC.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const before = w.currentNodeId, nBefore = Object.keys(w.map.nodes).length;
  win.applyEvent(w, { type: "discovery", source: "detected", payload: { what: "A New Place", makeNode: true } });
  const madeNode = Object.keys(w.map.nodes).length > nBefore;
  const didNotMove = w.currentNodeId === before;
  probe("BUG-05", "discovery makeNode creates a node but does not relocate the PC (no travel event)",
    madeNode && didNotMove, `nodes ${nBefore}->${Object.keys(w.map.nodes).length}, currentNode unchanged=${didNotMove}`);
}

// ---------------------------------------------------------------------------
// BUG-06a (MED) — clock_advanced field mismatch: digest calls it `faction`, the
// event wants `clockId`. Probe with the digest's field name -> untracked.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const before = w.factions[0].clock.filled;
  const res = win.applyEvent(w, { type: "clock_advanced", source: "declared", payload: { faction: "The Ironwood Circle", delta: 1 } });
  const missed = w.factions[0].clock.filled === before;
  probe("BUG-06a", "clock_advanced ignores payload.faction (wants payload.clockId; digest uses `faction`)",
    missed, `payload.faction -> ${JSON.stringify(res)}; clock ${before}->${w.factions[0].clock.filled}`);
}

// ---------------------------------------------------------------------------
// BUG-06b (MED) — epithet_grant field mismatch: wants payload.text, DM reaches for
// payload.epithet.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const res = win.applyEvent(w, { type: "epithet_grant", source: "declared", payload: { epithet: "the Tested" } });
  const failed = !(res && res.ok);
  probe("BUG-06b", "epithet_grant ignores payload.epithet (wants payload.text)",
    failed, `payload.epithet -> ${JSON.stringify(res)}`);
}

// ---------------------------------------------------------------------------
// BUG-07 (MED) — distant_word ignores the DM-supplied text and rolls its own rumor.
// RULED WAI 2026-07-05 (Root B): anti-invention BY DESIGN — the distortion lens binds to a
// REAL ledger fact (distantWordRoll reads no opts; EVENT-CONTRACT documents the payload as {}).
// The probe STAYS ● PRESENT by design; Root B's drift-warn now makes a supplied `text` LOUD
// (console.warn + a `drift` ledger line) instead of silently vanishing.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const marker = "ZZ_UNIQUE_DM_TEXT_MARKER_ZZ";
  win.applyEvent(w, { type: "distant_word", source: "detected", payload: { text: marker } });
  const ledgerText = win.ledgerOf(w).map((e) => e.text).join(" | ");
  const ignored = !ledgerText.includes(marker);
  probe("BUG-07", "distant_word ignores DM-supplied payload.text (rolls its own ambient rumor)",
    ignored, `marker present in ledger=${!ignored} — RULED WAI 2026-07-05: anti-invention by design (payload is {}); ROOT-B's drift-warn now makes a supplied text loud instead of invisible.`);
}

// ---------------------------------------------------------------------------
// BUG-06c (HIGH) — codex_update {id, note} silently dropped the note (codexUpdate had
// no `note` field) — the DM's accumulated understanding did not survive into the codex.
// Fixed: note APPENDS to dm.notes[] (ROOT-B / codex.js).
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const rec = win.codexAdd(w, { kind: "npc", name: "Corran Half-Step" });
  const m = applyMutates(win, w,
    { type: "codex_update", source: "declared", payload: { id: rec.id, note: "keeps count of the tide bells" } },
    () => rec.dm);
  const kept = !!(rec.dm && Array.isArray(rec.dm.notes) && rec.dm.notes.some(n => /tide bells/.test(n)));
  probe("BUG-06c", "codex_update drops the DM's `note` (knowledge does not survive into the codex)",
    !m.pass || !kept, `codex_update{note} -> ${JSON.stringify(m.res)}; dm.notes=${JSON.stringify(rec.dm && rec.dm.notes)}`);
}

// ---------------------------------------------------------------------------
// BUG-06d (MED) — discovery wants `what` (DM reaches for `name`); fact_canonized wants
// `what` (DM reaches for `text`). Fixed by the ROOT-B alias fold.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const nBefore = Object.keys(w.map.nodes).length;
  const d = win.applyEvent(w, { type: "discovery", source: "declared", payload: { name: "The Salt Door", makeNode: true } });
  const nodeMade = Object.keys(w.map.nodes).length > nBefore;
  const f = win.applyEvent(w, { type: "fact_canonized", source: "declared", payload: { text: "The tide obeys the bell" } });
  const ledger = win.ledgerOf(w).map(e => e.text).join(" | ");
  const discoveryNamed = /Salt Door/.test(ledger), factNamed = /tide obeys the bell/.test(ledger);
  probe("BUG-06d", "discovery ignores payload.name / fact_canonized ignores payload.text (want `what`)",
    !(d && d.ok && nodeMade && discoveryNamed && f && f.ok && factNamed),
    `discovery -> ${JSON.stringify(d)} nodeMade=${nodeMade} named=${discoveryNamed}; fact -> ${JSON.stringify(f)} named=${factNamed}`);
}

// ---------------------------------------------------------------------------
// BUG-10 (HIGH) — the digest called the clock key `id`; the handler reads `clockId`;
// a DM copying the digest's own key silently landed `untracked`. Fixed both ways:
// dmDigest ships `clockId`, and `id` is a handler alias.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const dg = win.dmDigest();
  const key = dg && dg.powers && dg.powers[0] && dg.powers[0].clockId;
  const m = applyMutates(win, w,
    { type: "clock_advanced", source: "declared", payload: { id: key || "the-ironwood-circle", delta: 1 } },
    () => w.factions[0].clock.filled);
  probe("BUG-10", "digest clock key does not round-trip into clock_advanced (id vs clockId)",
    !key || !m.pass || !!(m.res && m.res.untracked),
    `digest.powers[0].clockId=${key}; payload.id -> ${JSON.stringify(m.res)}; clock ${m.before}->${m.after}`);
}

// ---------------------------------------------------------------------------
// BUG-11 (HIGH) — codex_add with no id silently Object.assign-merged onto an existing
// ESTABLISHED record (F-07: a warm DM minting a new "Ospra" overwrote the real one).
// Fixed: id-less mint onto a known/hard record refuses {reason:"id-collision"}.
// The probe asserts the INVERSE of mutation: the established record must NOT change.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const rec = win.codexAdd(w, { kind: "npc", name: "Ospra", fields: { trade: "tanner" } });
  win.codexContact(w, rec.id);   // touched → known + hard (locked to canon)
  const before = JSON.stringify({ name: rec.name, fields: rec.fields, dm: rec.dm });
  const res = win.applyEvent(w, { type: "codex_add", source: "declared", payload: { kind: "npc", name: "Ospra", fields: { trade: "imposter" } } });
  const untouched = JSON.stringify({ name: rec.name, fields: rec.fields, dm: rec.dm }) === before;
  const refused = !!(res && res.ok === false && res.reason === "id-collision" && res.existing && res.existing.id === rec.id);
  probe("BUG-11", "codex_add silently merges onto an established record (no id-collision guard)",
    !untouched || !refused,
    `re-mint -> ${JSON.stringify(res)}; established record untouched=${untouched}`);
}

// ---------------------------------------------------------------------------
// BUG-12 (MED) — gift {to,item} moved renown but silently skipped the NPC gift-memory
// (handler reads target/what). Fixed by ROOT-B aliases to→target, item→what.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const rec = win.codexAdd(w, { kind: "npc", name: "Talla Reed" });
  const m = applyMutates(win, w,
    { type: "gift", source: "declared", payload: { to: rec.id, item: "a carved knife" } },
    () => rec.gifts || null);
  const remembered = !!(rec.gifts && rec.gifts.length === 1 && rec.gifts[0].what === "a carved knife");
  probe("BUG-12", "gift ignores payload.to/item (codex gift-memory silently skipped)",
    !m.pass || !remembered, `gift{to,item} -> ${JSON.stringify(m.res)}; gifts=${JSON.stringify(rec.gifts || null)}`);
}

// ---------------------------------------------------------------------------
// BUG-13 (LOW) — codex_update on a missing id returned a bare {ok:false} (no reason,
// indistinguishable from an ordinary refusal). Fixed: {ok:false, reason:"no-record:<id>"}.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const res = win.applyEvent(w, { type: "codex_update", source: "declared", payload: { id: "npc:nobody-here", dm: { x: 1 } } });
  const loud = !!(res && res.ok === false && typeof res.reason === "string" && res.reason.indexOf("no-record:") === 0);
  probe("BUG-13", "codex_update on a missing id fails silent (bare ok:false, no reason)",
    !loud, `codex_update{id:"npc:nobody-here"} -> ${JSON.stringify(res)}`);
}

// ---------------------------------------------------------------------------
// BUG-08 (MED) — nat 20/1 against a branched rollRequest falls through to the live flow
// but left w.dm.rollReq set (only GS cleared) → render re-hydration re-fires the roll.
// sendTurn masks it in-process (clears w.dm.rollReq itself) — stub sendTurn so the probe
// measures dmRollFor's OWN clear, the process-boundary window Run 2 hit.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  win.eval('sendTurn=function(){return Promise.resolve("t-stub");}');
  win.eval('rollDie=function(){return 20;}');
  const rq = { skill: "Athletics", ability: "str", dc: 12,
    branches: { success: { narration: "up", events: [] }, fail: { narration: "down", events: [] } } };
  win.GS.dm.rollReq = rq; w.dm = w.dm || {}; w.dm.rollReq = rq;
  win.dmRollFor("Athletics", "str", null);
  probe("BUG-08", "nat-20/1 fall-through leaves the persisted w.dm.rollReq set (re-fires the roll)",
    w.dm.rollReq !== null, `after dmRollFor(nat20): w.dm.rollReq=${JSON.stringify(w.dm.rollReq)}, GS.dm.rollReq=${JSON.stringify(win.GS.dm.rollReq)}`);
}

// ---------------------------------------------------------------------------
// BUG-17 (HIGH) — attitude_shift doubly broken vs its own seat prompt: (a) prompt field
// `id` vs handler `target`; (b) string attitudes Number()-coerce to 0. Fixed: id→target
// alias + attitudeParse word map. Legs: verbatim-prompt payload MOVES the value; clamps
// hold; concentration_broken {spell} no longer burns a drift ledger line.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  // leg 1 — the exact per-prompt payload must MOVE status.attitude.value 0 → -2
  const rec = win.codexAdd(w, { kind: "npc", name: "Watch-Sergeant Brann" });
  const m = applyMutates(win, w,
    { type: "attitude_shift", source: "declared", payload: { id: rec.id, to: "hostile", cause: "dominated in public" } },
    () => (rec.status.attitude && rec.status.attitude.value) || 0);
  const moved = m.pass && rec.status.attitude && rec.status.attitude.value === -2;
  // leg 2 — per-NPC clamp respected: ceiling -1 NPC asked to "helpful" lands at -1, floor -1 holds "hostile" at -1
  const rec2 = win.codexAdd(w, { kind: "npc", name: "Sworn Enemy" });
  win.codexAttitudeOpen(w, rec2.id, -1, { floor: -1, ceiling: -1 });
  win.applyEvent(w, { type: "attitude_shift", source: "declared", payload: { target: rec2.id, to: "helpful" } });
  const clamped = rec2.status.attitude.value === -1;
  // leg 3 — concentration_broken {spell} is accepted-advisory: no payload-drift ledger line
  win.applyEvent(w, { type: "concentration_start", source: "declared", payload: { spell: "Hold Person" } });
  const cb = win.applyEvent(w, { type: "concentration_broken", source: "declared", payload: { spell: "Hold Person", cause: "damage" } });
  const spellDrift = win.ledgerOf(w).some(e => e.type === "drift" && e.data && e.data.type === "concentration_broken" && (e.data.keys || []).indexOf("spell") >= 0);
  probe("BUG-17", "attitude_shift dead to its own seat prompt (id vs target; string→Number→0); concentration_broken {spell} drifts",
    !moved || !clamped || !(cb && cb.broken) || spellDrift,
    `verbatim {id,to:"hostile"} -> ${JSON.stringify(m.res)} value=${rec.status.attitude && rec.status.attitude.value}; clamp=${rec2.status.attitude.value}; conc=${JSON.stringify(cb)} spellDrift=${spellDrift}`);
}

// ---------------------------------------------------------------------------
// ROOT-B GUARD — the payload fold: aliases land, unknown keys warn+ledger WITHOUT
// blocking the event, and every DM_EVENT_FIELDS key is a real DM_EVENT_TYPES member.
// PRESENT = the fold regressed (silent drops, dead aliases, or map/type drift).
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  const m = applyMutates(win, w,
    { type: "clock_advanced", source: "declared", payload: { clockId: "The Ironwood Circle", delta: 1, frobnicate: 1 } },
    () => w.factions[0].clock.filled);
  const driftLine = win.ledgerOf(w).some(e => e.type === "drift" && e.data && e.data.kind === "payload-drift" && (e.data.keys || []).indexOf("frobnicate") >= 0);
  const mapKeys = Object.keys(win.DM_EVENT_FIELDS);
  const strays = mapKeys.filter(k => win.DM_EVENT_TYPES.indexOf(k) < 0);
  probe("ROOT-B", "payload-fold drift guard (unknown key warns+ledgers, event still applies; map ⊆ event types)",
    !m.pass || !driftLine || strays.length > 0,
    `applied=${m.pass} driftLine=${driftLine} strayMapKeys=[${strays.join(",")}]`);
}

// ---------------------------------------------------------------------------
// CONTRACT-1 GUARD (docs/DM-CONTRACT-ARTIFACT.md §6) — the machine-readable contract's 87 worked
// examples must fold clean through the LIVE dmFoldPayload (contract↔runtime agreement, condensed to
// one probe). PRESENT = an example drifted (a bogus/aliased field, or the artifact fell out of sync
// with the registry). This is the ROOT-B family — an OK guard, not a caught bug.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  let contract = null, parseErr = "";
  try { contract = JSON.parse(read("dm-contract.json")); } catch (e) { parseErr = String(e && e.message || e); }
  let clean = 0, total = 0, firstDrift = "";
  if (contract && contract.events) {
    for (const t of Object.keys(contract.events)) {
      total++;
      const ex = contract.events[t].example;
      const before = win.ledgerOf(w).length;
      win.dmFoldPayload(w, { type: t, payload: (ex && ex.payload) || {} });
      const grew = win.ledgerOf(w).length - before;
      if (grew === 0) clean++;
      else if (!firstDrift) firstDrift = t;
    }
  }
  const allClean = contract && total === 87 && clean === 87;
  probe("CONTRACT-1", "dm-contract.json examples fold clean through the live dmFoldPayload (contract↔runtime agreement)",
    !allClean,
    allClean ? `PASS (${clean}/${total} examples fold clean)`
             : (parseErr ? `dm-contract.json unreadable: ${parseErr}` : `FAIL (${clean}/${total} clean; first drift: ${firstDrift || "n/a"})`));
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
const bugs = results.filter((r) => r.id.startsWith("BUG"));
const present = bugs.filter((r) => r.present).length;
console.log("\n  GENESIS PLAYTEST BUG PROBES — caught in 'The Shimmering Maw', 2026-07-05\n");
for (const r of results) {
  const flag = (r.id === "VARIETY" || r.id === "ROOT-A" || r.id === "ROOT-B" || r.id === "CONTRACT-1") ? (r.present ? "⚠ LOW " : "✓ OK  ") : (r.present ? "● PRESENT " : "○ resolved");
  console.log(`  [${flag.padEnd(9)}] ${r.id.padEnd(8)} ${r.title}`);
  console.log(`             ${r.detail}\n`);
}
console.log(`  ${present}/${bugs.length} caught bugs still reproduce. When a fix lands, its probe should flip to "resolved".`);
console.log(`  Details + intended fixes: docs/PLAYTEST-BUGS.md\n`);
