/* GENESIS MODULE — src/engine/quest-hook.js — the quest-hook roller (docs/SYNTHESIS-CONTRACT.md)
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Reuses engine.walk's walkPick — MUST load after src/engine/walk.js.

   A quest hook is the connective tissue that LEADS the player to a prepped environment. This rolls
   raw hook material (destination flavor, macguffin, complication, urgency clock, why the questgiver
   won't go, the questgiver's pitch) from the Quest + NPC-hook tables. The questgiver IDENTITY is left
   for the synthesis pass to assign (draw from a ledger faction/NPC first; invent only if needed). The
   tables are flagged for an improvement pass — these are raw rolls, honored then reskinned.
   All internals `qhook`-prefixed. */

function qhookPick(id, ...cols){
  // graceful: walkPick returns "" for missing/short rows
  return (typeof walkPick === "function") ? walkPick(id, ...cols) : cols.map(()=> "");
}

/* roll a quest hook bound to an environment.
   opts: { environment?: "urban"|"dungeon"|"wilderness" } — the env this hook leads to (the destination). */
function rollQuestHook(opts){
  opts = opts || {};
  const [destination, destinationDesc]   = qhookPick("quest-destination", 1, 2);
  const [macguffin, macguffinDesc]       = qhookPick("quest-macguffin", 1, 2);
  const [complication, complicationDesc] = qhookPick("quest-complication", 1, 2);
  const [urgency, urgencyDesc]           = qhookPick("quest-urgency", 1, 2);
  const [avoidance, avoidanceDesc]       = qhookPick("quest-questgiver-avoidance", 1, 2);
  const [giverHook]                      = qhookPick("npc-hook", 1);
  return {
    leadsTo: opts.environment || null,        // bound to a prepped environment (the real destination)
    destinationFlavor: { name: destination, desc: destinationDesc }, // raw roll — synthesis reconciles with the env
    macguffin: { name: macguffin, desc: macguffinDesc },             // what's sought there
    complication: { name: complication, desc: complicationDesc },    // the twist
    urgency: { name: urgency, desc: urgencyDesc },                   // the clock
    questgiverAvoidance: { name: avoidance, desc: avoidanceDesc },   // why they won't go themselves
    questgiverPitch: giverHook,              // raw pitch; synthesis attaches it to a ledger NPC or a new one
    questgiver: null,                        // ← synthesis assigns (draw from ledger first)
  };
}
