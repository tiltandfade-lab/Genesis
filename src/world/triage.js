/* HYBRID FAST-LANE TRIAGE — the script-owned model-routing decision (docs/DM-BRIDGE.md
   §"Hybrid fast-lane"). A PURE classifier: given the world + the player's action, decide which
   model lane the DM loop should answer on, so the loop OBEYS a script verdict instead of the DM
   eyeballing stakes every turn (anti-drift: the script owns the decision; the noun, not the verb).

   DOCTRINE (from the spec): default to FAST — "a player would rather a quick good turn than a slow
   great one for 'I check the door'." We escalate to DEEP only on signals knowable BEFORE the DM
   composes: a live fight, arrival at a place the DM hasn't narrated yet, the PC in real jeopardy, a
   doom clock come due, or death. The deep beats that only the DM can foresee mid-compose — a Mythic
   crit, a major revelation — are NOT mechanizable from the player's action, so the runbook keeps an
   UPGRADE override: the DM may always lift a fast turn to deep when the moment turns out to matter.
   It never downgrades. Script owns the floor; the DM owns the ceiling.

   Returns { lane:"fast"|"deep", model:"sonnet"|"opus", reasons:[...] }. `reasons` is stamped onto the
   turn for transparency + latency telemetry (why did this turn route the way it did?). */

// Bare combat verbs (idiom-dominant ones like "loose"/"swing"/"strike a bargain" deliberately left
// out to keep the fast lane fast), PLUS a targeted-cast branch that tolerates multi-word SRD spell
// names — "cast fire bolt at", "cast ray of frost at" — not just a single token.
const DM_COMBAT_VERBS = /\b(?:attack|attacks|attacking|stab|slash|fight|fights|kill|murder|ambush|charge|charges|shoot|shoots|lunge|lunges|grapple|smite|disarm)\b|\bcast\b(?:\s+[\w']+){0,4}?\s+at\b/;
const DM_ROUTINE_VERBS = /\b(travel|walk|go|head|ride|march|rest|sleep|camp|wait|loiter|look|examine|inspect|search|inventory|buy|sell|shop|barter|ask|chat|greet)\b/;

// HQ3-B4 — negation scope. A combat verb is "asserted" unless a negator sits within the ~3 tokens
// immediately before it. Deliberately tiny: no dependency parse, no clause splitting — one lookbehind
// window over the matched verb. False-positives that survive this (a NEGATED verb far from its
// negator, or a quoted un-negated threat) are TOLERATED (see spec §B4 ruling).
const DM_NEGATORS = /\b(?:no|not|n't|never|without|nor|hardly|dont|don't|doesnt|doesn't)\b/;
function combatActionAsserted(txt){
  const re=new RegExp(DM_COMBAT_VERBS.source, "g");
  let m;
  while((m=re.exec(txt))!==null){
    const pre=txt.slice(Math.max(0, m.index-24), m.index);   // ~3-4 words of lookbehind
    const preWords=pre.split(/[^a-z']+/).filter(Boolean).slice(-3).join(" ");
    if(!DM_NEGATORS.test(preWords)) return true;             // this hit is asserted → combat-action
  }
  return false;                                              // every hit was negated
}

function dmTriage(w, action){
  const reasons = [];
  const txt = String(action || "").toLowerCase();
  const cur = (w && w.characters) ? w.characters.filter(x => x.status === "living").slice(-1)[0] : null;
  const sh  = cur && cur.sheet;

  // A — FIRST CONTACT WITH A PLACE: we're standing somewhere the DM hasn't narrated yet. (Set on
  //     arrival; applyResponse stamps w.dm.lastNarratedNodeId after the DM answers, so the SECOND
  //     turn at the same node falls back to fast.) Session-open also lands here → opening scene = deep.
  const here = w && w.currentNodeId;
  if (here && here !== (w.dm && w.dm.lastNarratedNodeId)) reasons.push("new-place");

  // B — a live fight (forward-compatible with the combat-tracker fast-follow that sets GS.combat).
  if (typeof GS !== "undefined" && GS && GS.combat) reasons.push("combat-active");

  // C — the action itself opens violence. HQ3-B4: skip a violence verb whose nearest preceding word
  //     is a negator ("I make no move", "I do not attack", "without striking") — a self-negated
  //     clause is not an attack. Coarse by design (a cost router, never a correctness gate): scan
  //     each verb hit and require it NOT be immediately negated within a short window.
  if (combatActionAsserted(txt)) reasons.push("combat-action");

  // D — the PC is in real jeopardy: downed (hpCur 0), or below a quarter of max, or a dire condition.
  if (sh && sh.hpCur != null) {
    if (sh.hpCur <= 0) reasons.push("pc-downed");
    else if (sh.hp && sh.hpCur <= sh.hp * 0.25) reasons.push("pc-bloodied");
  }
  if (cur && (cur.conditions || []).some(x => /uncons|dying|stunned|paralys|petrif|grappl/i.test(String(x))))
    reasons.push("pc-condition");

  // E — a doom clock is full (and still open): the front comes due → a beat that bites.
  if (((w && w.pressures) || []).some(p => p && !p.closed && p.clock && p.clock.filled >= p.clock.size))
    reasons.push("clock-due");

  // F — death / no living PC (the bardo) — always the heaviest beat.
  if (w && w.characters && w.characters.length && !cur) reasons.push("no-living-pc");

  const lane = reasons.length ? "deep" : "fast";
  if (lane === "fast") {
    // record the routine shape for telemetry (informative only — it never changes a fast verdict).
    const m = txt.match(DM_ROUTINE_VERBS);
    reasons.push(m ? ("routine:" + m[1]) : "default-fast");
  }
  return { lane: lane, model: (lane === "deep" ? "opus" : "sonnet"), reasons: reasons };
}
