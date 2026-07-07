/* dev/state-eval/fixture-seed.mjs — STATE-HYGIENE-EVAL §4 fallback + §5 negative-control seed.
   Shared synthetic seed-world builder. Exports seedWorld(win) — copies the shape of
   dev/playtest-bug-probes.mjs:47–66 EXACTLY (same world skeleton, same L1 Fighter sheet) so
   synthetic fixtures score against the identical minimal world every probe already trusts.
   No app-code edits ride on this file; it only assembles plain JSON the harness's boot() reads.
*/

// Mirrors dev/playtest-bug-probes.mjs seedWorld(win) verbatim (the L1 Fighter, Probe Hold).
// Callers pass the booted jsdom `win` so addNode/seeNode/ensureResources run for real.
export function seedWorld(win) {
  const w = {
    id: "w-probe", name: "Probe Hold",
    seed: { master: { name: "Probe Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
      taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" }, faction: { name: "The Probe Circle" } },
    characters: [{ id: "c1", status: "living", name: "Probe PC", headline: "a test", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Soldier", level: 1, xp: 0,
        hp: 9, hpCur: 9, ac: 14, tempHp: 0, profBonus: 2, scores: { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
        mods: { str: 1, dex: 1, con: 1, int: 0, wis: 0, cha: 0 }, saveProfs: [], skillProfs: [], conditions: [], inventory: [],
        gold: 15 } }],
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

// Minimal codex-carrying variant — same skeleton, plus one NPC record (for codex-note / gift
// fixtures) via the real codex helpers if present, else a hand-built record in the same shape
// codexOf(w).records holds (STATE-HYGIENE-EVAL §4 hx-07/hx-08 synthetic fallback).
export function seedWorldWithNpc(win, npcId, npcName) {
  const w = seedWorld(win);
  if (typeof win.ensureCodex === "function") win.ensureCodex(w);
  const codex = (typeof win.codexOf === "function") ? win.codexOf(w) : (w.codex = w.codex || { records: {}, seq: 0 });
  codex.records = codex.records || {};
  codex.records[npcId] = {
    id: npcId, kind: "npc", name: npcName, rolled: null, fields: {}, dm: {}, links: [],
    status: { known: true, soft: false, at: null, condition: "ok" },
    provenance: "authored", source: null, origin: null, ledgerRefs: [], seq: 1, touchedSeq: 1,
  };
  return w;
}

// Bridgeless-shape snapshot builder — {U, gs} — matches dev/playtest-bridgeless.mjs save().
export function snapshotOf(win) {
  return JSON.parse(JSON.stringify({
    U: win.U,
    gs: { dm: win.GS.dm, combat: win.GS.combat || null, chase: win.GS.chase || null },
  }, (k, v) => (typeof v === "function" ? undefined : v)));
}
