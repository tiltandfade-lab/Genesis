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
  // REVIEW-FIXES-0705 U6 — shared resolver (engine.combat's bestiaryResolve), replacing this
  // file's own copy of the exact-id/slug-of-name loop.
  for(const nm of tryNames){
    const entry=(typeof bestiaryResolve==="function") ? bestiaryResolve(nm) : BESTIARY[nm];
    if(entry) return entry;
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

/* MONSTER-PARLEY §3 — is this creature the kind that can plausibly SPEAK (or otherwise negotiate)?
   Script-owned, degrades gracefully: a stat block with INT >= 3 reads as speech-capable (the SRD-ish
   convention — most true beasts sit at 1-2); a compiled flavorTable stamped mode:"hook" is licensed
   (MONSTER-FLAVOR-TABLES §1/§3) regardless of INT — a mindless-but-hook-authored creature can still
   carry a parley-forward want. Neither field present (not-yet-compiled flavorTable, no abilities read)
   → false, never a fabricated yes. */
function qhookCreatureSpeechCapable(entry){
  if(!entry) return false;
  const int=entry.abilities && entry.abilities.int && typeof entry.abilities.int.score==="number" ? entry.abilities.int.score : null;
  if(int!=null && int>=3) return true;
  if(entry.flavorTable && entry.flavorTable.mode==="hook") return true;
  return false;
}

/* MONSTER-PARLEY §3 — curveball quests: a bound threat that CAN speak/negotiate gets a 1-in-4 shot at
   the `angle:"parley"` pitch instead of (or alongside) the treasure/faction/menace read above — the
   hook's pitch frames the creature as APPROACHABLE (it wants something; the fight is optional). A
   curveball, not the default — fights stay the norm (§5 decision 6). `roll` is injectable (1..4,
   defaults to a fresh d4) so callers/tests can force either branch without patching Math.random. */
function qhookMaybeParleyAngle(tb, entry, roll){
  if(!qhookCreatureSpeechCapable(entry)) return null;
  const r=(roll!=null) ? roll : (Math.floor(Math.random()*4)+1);
  return (r===1) ? "parley" : null;
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
    // MONSTER-PARLEY §3 — a fourth angle, script-owned 1-in-4 roll on speech-capable/hook-mode
    // threats only: overrides the treasure/faction/menace read above so the pitch frames the
    // creature as approachable, never stacks with it (one angle per hook, same as the base three).
    const parleyAngle=qhookMaybeParleyAngle(tb, tb, opts.parleyRoll);
    if(parleyAngle) hook.threatBinding.angle=parleyAngle;
  }
  return hook;
}
