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

/* MONSTER-STORY-WIRING §4 — resolve the destination walk's rolled threat into a bindable creature.
   `threat` is a dungeon/urban-threat-identity row shape ({id,role,low,mid,boss,scale,signs}). Tries
   threat.boss's first name that resolves in BESTIARY, else threat.id itself. Returns null when
   neither resolves (wilderness threats/unresolvable names — graceful, no binding). */
function qhookResolveThreatCreature(threat){
  if(!threat || typeof BESTIARY==="undefined") return null;
  const tryNames=[];
  if(threat.boss) tryNames.push.apply(tryNames, String(threat.boss).split(/\s*\/\s*/).map(s=>s.trim()).filter(Boolean));
  if(threat.id) tryNames.push(threat.id);
  for(const nm of tryNames){
    const want=(typeof cmSlug==="function") ? cmSlug(nm) : null;
    if(want && BESTIARY[want]) return BESTIARY[want];
    if(want){ for(const id in BESTIARY){ if(id===want || (typeof cmSlug==="function" && cmSlug(BESTIARY[id].name)===want)) return BESTIARY[id]; } }
  }
  return null;
}

/* MONSTER-STORY-WIRING §4 — WANT-HOOK down-payment: derive the threatBinding's `angle`, script-owned,
   first match wins (treasure > factionFit > menace). */
function qhookThreatAngle(tb){
  if(tb.treasure && tb.treasure!=="none") return "plunder";
  if(Array.isArray(tb.factionFit) && tb.factionFit.length) return "faction";
  return "menace";
}

/* roll a quest hook bound to an environment.
   opts: { environment?: "urban"|"dungeon"|"wilderness", threat?: <the destination walk's rolled
   threat object> } — the env this hook leads to (the destination), + (MONSTER-STORY-WIRING §4) the
   threat whose boss-pool creature becomes the story's subject. */
function rollQuestHook(opts){
  opts = opts || {};
  const [destination, destinationDesc]   = qhookPick("quest-destination", 1, 2);
  const [macguffin, macguffinDesc]       = qhookPick("quest-macguffin", 1, 2);
  const [complication, complicationDesc] = qhookPick("quest-complication", 1, 2);
  const [urgency, urgencyDesc]           = qhookPick("quest-urgency", 1, 2);
  const [avoidance, avoidanceDesc]       = qhookPick("quest-questgiver-avoidance", 1, 2);
  const [giverHook]                      = qhookPick("npc-hook", 1);
  const hook = {
    leadsTo: opts.environment || null,        // bound to a prepped environment (the real destination)
    destinationFlavor: { name: destination, desc: destinationDesc }, // raw roll — synthesis reconciles with the env
    macguffin: { name: macguffin, desc: macguffinDesc },             // what's sought there
    complication: { name: complication, desc: complicationDesc },    // the twist
    urgency: { name: urgency, desc: urgencyDesc },                   // the clock
    questgiverAvoidance: { name: avoidance, desc: avoidanceDesc },   // why they won't go themselves
    questgiverPitch: giverHook,              // raw pitch; synthesis attaches it to a ledger NPC or a new one
    questgiver: null,                        // ← synthesis assigns (draw from ledger first)
  };
  // MONSTER-STORY-WIRING §4 — ADDITIVE: every existing field above is unchanged. When opts.threat is
  // present AND resolvable, the threat becomes the story's subject (the WANT-HOOK down-payment).
  const tb = opts.threat ? qhookResolveThreatCreature(opts.threat) : null;
  if(tb){
    const acts=(tb.activity||[]).filter(a=>a!=="any");
    hook.threatBinding = {
      creature: tb.name, statId: tb.id, habitat: tb.habitat||[],
      doing: acts.length ? acts[0] : null,
      angle: qhookThreatAngle(tb),
    };
  }
  return hook;
}
