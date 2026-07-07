/* GENESIS MODULE — src/engine/crowning.js — CROWNING §7.C1: the Doom-front flag + crown eligibility.
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   The Crowning (docs/CROWNING-BASTION.md) is the earned, opt-in ending Genesis has been missing:
   kill the world's Impending Doom at the tier cap and the world is promoted into legend instead of
   plateaued-forever or deleted. This unit (C1) does ONLY the flag + detection + the inert banner:

     1. `isDoom` — a flag set on the EXTERNAL pressure front at world-genesis time (Q4: external-
        front-always). Not a new roll, not a new table — the doom with a geography IS the Doom.
     2. `crownEligible(w)` — a pure, deterministic read: Doom front closed AND PC at LEVEL_CEILING
        AND a living PC exists AND the world is neither already sundered nor already crowned.
     3. The Sundering flag — when the Doom front's clock FIRES before it closes, the world sunders:
        the dark twin ending, uncrownable forever. One flag + one ledger line; the full legend
        testament is C2's job (markSundered, gated behind this unit's flag).
     4. The banner affordance — an inert prose span in charHistoryBody (C2 wires its onclick).

   Zero new model calls (SPEED-DOCTRINE): every check here is a synchronous read or a typed-event
   side effect, never a roll, never a table. The ritual itself (C2) is the only place dice are cast. */

// PROVISIONAL prose vocabulary for the DM's front_closed `how` field on a Doom front (§3.2/§3.5).
// The engine NEVER validates `how` against this — it is documentation only. A Doom front closing
// via "waited"/"ignored" is a DM-CHARTER contract violation caught in review, not an engine refusal
// (crownEligible keys off doom.closed alone — see C1.2's ruling comment below).
const CROWN_HOW_VERBS = ["defeated", "unraveled", "bargained"];

/* The world's Impending Doom front (CROWNING §3.1) — the external pressure front, flagged at
   rollStartingState time. Returns null for a legacy world with no external front, or (correctly)
   for a world forged before this unit shipped (no isDoom anywhere — see C1.5 edge 1: NEVER
   backfilled by migrateWorld; the flag is a genesis-time decision only). */
function doomFront(w) {
  if (!w || !Array.isArray(w.pressures)) return null;
  return w.pressures.find(p => p && p.isDoom) || null;
}

/* Deterministic crown-eligibility verdict. Zero model calls; never throws; never mutates.
   Returns { eligible, reasons:{doomClosed,atCeiling,alive}, doom, blocked }.
   blocked is "sundered" | "crowned" | null — sundered wins over crowned (a world can't be both,
   but if it somehow were, "the world already ended, darkly" takes precedence per C1.5 edge 4). */
function crownEligible(w) {
  const doom = doomFront(w);
  const t = (typeof livingSheet === "function") ? livingSheet(w) : null;
  const alive = !!t;
  const atCeiling = alive && (t.sh.level || 1) >= (typeof LEVEL_CEILING === "number" ? LEVEL_CEILING : 10);
  const doomClosed = !!(doom && doom.closed);
  const sundered = !!(w && w.sundered);
  const crowned = !!(w && w.crowned);
  const eligible = doomClosed && atCeiling && alive && !sundered && !crowned;
  const blocked = sundered ? "sundered" : (crowned ? "crowned" : null);
  return { eligible, reasons: { doomClosed, atCeiling, alive }, doom, blocked };
}
