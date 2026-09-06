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

/* MECHANIZATION / INTERPRETATION BOUNDARY (2026-08-04)
   -----------------------------------------------------
   dmTriage below chooses a MODEL QUALITY floor. It must never be mistaken for permission to turn a
   player's verbs into a closed videogame command list. dmRoute is the separate execution router:

     local-fact        exact, already-known information; no model call
     declared-mechanic an explicit engine operation whose result is settled before narration
     freeform-ruling   every other utterance; the DM interprets intent/applicability/meaning

   The default is deliberately freeform-ruling. Keyword presence is not enough to mechanize an
   action: "search my pack while the riders close in" contains inventory language but is fiction,
   not a database query. Add a local/declared route only with an engine resolver and adversarial
   false-positive tests. This is the practical form of "mechanize nouns, numbers, and receipts;
   leave verbs, intent, and meaning open." */
const DM_ROUTE_MODES = ["local-fact", "declared-mechanic", "freeform-ruling"];

function dmOpenRulingRequest(action){
  return {
    contractVersion: 1,
    kind: "open-intent",
    playerAction: String(action || ""),
    principle: "Interpret freely; propose consequences through the engine contract; never mutate state in prose.",
    returnFields: ["understoodAction", "ruling", "needsRoll", "proposedCheck", "stakes", "outcomeBranches", "proposedEvents"],
    authority: {
      dm: ["intent", "rule-applicability", "difficulty", "advantage-disadvantage", "stakes", "exceptions", "meaning"],
      engine: ["identity", "state", "custody", "dice", "arithmetic", "resources", "clock", "accepted-mutation"]
    }
  };
}

function dmRouteResult(mode, reasons, relevantSlices, extra){
  return Object.assign({
    mode,
    reasons: reasons || [],
    relevantSlices: relevantSlices || [],
    modelCall: mode !== "local-fact"
  }, extra || {});
}

/* Pure, conservative execution router. opts is a trusted UI affordance channel, not a bag of text
   hints. The first proof intentionally supports only the mechanic with a complete pre-resolution
   path (`rest` and a trusted, id-addressed `item-transfer`); attacks, item use, travel, and novel object interactions remain freeform until each
   has its own resolver + receipt. */
function dmRoute(w, action, opts){
  const raw = String(action || "").trim();
  const txt = raw.toLowerCase().replace(/[.!?]+$/, "").trim();
  const o = opts || {};

  // Hidden opening/meta turns are authored scene work even when their text happens to resemble a
  // local command. Never swallow them into the zero-model path.
  if(o.hidden) return dmRouteResult("freeform-ruling", ["hidden-scene-turn"], ["scene", "story-pressure"],
    { rulingRequest: dmOpenRulingRequest(raw) });

  // Trusted UI affordances may identify a fact panel without natural-language classification.
  const localKind = (o.localFact === "inventory" || o.localFact === "custody" || o.localFact === "sheet" ||
    o.localFact === "map" || o.localFact === "hp" || o.localFact === "health" ||
    o.localFact === "ac" || o.localFact === "gold")
    ? o.localFact : null;
  if(localKind) return dmRouteResult("local-fact", ["explicit-ui-fact:" + localKind], ["pc", localKind], { localKind });

  // Trusted mechanic affordance. These are structured UI/DM-adjudication results, never keyword
  // guesses over prose. Unknown mechanic declarations fall through to the DM.
  const mech = o.mechanic;
  if(mech && mech.type === "rest" && mech.payload && (mech.payload.kind === "short" || mech.payload.kind === "long")){
    return dmRouteResult("declared-mechanic", ["explicit-ui-mechanic:rest"], ["scene", "pc-rest", "clock", "pending-situation"],
      { mechanic: { type:"rest", payload:Object.assign({}, mech.payload) } });
  }
  if(mech && mech.type === "item-transfer" && mech.payload && typeof mech.payload === "object" &&
     !Array.isArray(mech.payload)){
    return dmRouteResult("declared-mechanic", ["explicit-ui-mechanic:item-transfer"],
      ["scene", "pc-inventory", "item-custody"],
      { mechanic: { type:"item-transfer", payload:Object.assign({}, mech.payload) } });
  }

  // Typed local facts are intentionally exact/anchored. Context, extra clauses, and consequential
  // verbs all miss these patterns and therefore remain open DM work.
  if(/^(?:show|open|display|list) (?:my )?(?:inventory|gear|equipment)(?: right now)?$/.test(txt) ||
     /^(?:what (?:am i carrying|do i carry|do i have on me|is in my inventory)|what's in my inventory)(?: right now| currently)?$/.test(txt))
    return dmRouteResult("local-fact", ["exact-fact:inventory"], ["pc", "inventory"], { localKind:"inventory" });
  if(/^(?:show|open|display) (?:my )?(?:character )?sheet$/.test(txt) || /^(?:show|display) my stats$/.test(txt))
    return dmRouteResult("local-fact", ["exact-fact:sheet"], ["pc"], { localKind:"sheet" });
  if(/^(?:show|open|display) (?:my )?(?:known )?map$/.test(txt))
    return dmRouteResult("local-fact", ["exact-fact:map"], ["map"], { localKind:"map" });
  if(/^(?:what is|what's) my (?:current )?(?:hp|hit points)$/.test(txt))
    return dmRouteResult("local-fact", ["exact-fact:hp"], ["pc", "hp"], { localKind:"hp" });
  if(/^(?:(?:what are|what's) my (?:current )?(?:conditions|hp and conditions|hit points and conditions)|(?:show|display|list) my (?:current )?conditions)$/.test(txt))
    return dmRouteResult("local-fact", ["exact-fact:health"], ["pc", "hp", "conditions", "marks"], { localKind:"health" });
  if(/^(?:what is|what's) my (?:ac|armor class)$/.test(txt))
    return dmRouteResult("local-fact", ["exact-fact:ac"], ["pc", "ac"], { localKind:"ac" });
  if(/^(?:how much gold do i have|what is my gold|what's my gold)$/.test(txt))
    return dmRouteResult("local-fact", ["exact-fact:gold"], ["pc", "gold"], { localKind:"gold" });
  if(/^(?:show|display|list) (?:the )?(?:current )?(?:item )?custody$/.test(txt) ||
     /^(?:what items have i left here|who is holding my items)$/.test(txt))
    return dmRouteResult("local-fact", ["exact-fact:custody"], ["item-custody"], { localKind:"custody" });
  // Stable custody answers both "who has it?" and "where is it?". Keep the grammar anchored and
  // require an exact item-name match below: a causal/context clause ("where is it now that the
  // keeper lied?") will not equal an item name and therefore remains interpretive DM work.
  const holder=/^who (?:is|'s) holding (.+?)(?: right now| currently)?$/.exec(txt) ||
    /^(?:where is|where's) (.+?)(?: right now| currently| now)?$/.exec(txt);
  if(holder){
    const q=holder[1].replace(/^(?:my|the)\s+/,"").trim();
    const carried=(w&&w.characters||[]).flatMap(c=>c&&c.sheet&&Array.isArray(c.sheet.inventory)?c.sheet.inventory:[]);
    const placed=Object.values((w&&w.itemCustody&&w.itemCustody.items)||{}).map(r=>r&&r.item).filter(Boolean);
    const match=carried.concat(placed).find(it=>String(it.name||it.base||"").toLowerCase().replace(/^the\s+/,"")===q);
    if(match)return dmRouteResult("local-fact", ["exact-fact:custody"], ["pc", "item-custody"],
      { localKind:"custody", localRef:match.id||null, localCodexId:match.codexId||null });
  }

  // The sole typed declared-mechanic proof. It is exact enough that no target, danger, condition,
  // disguise, or purpose clause can be erased by the router.
  const rest = /^(?:i |we )?(?:take|begin) (?:a )?(short|long) rest$/.exec(txt);
  if(rest) return dmRouteResult("declared-mechanic", ["exact-mechanic:rest"],
    ["scene", "pc-rest", "clock", "pending-situation"],
    { mechanic:{ type:"rest", payload:{ kind:rest[1] } } });

  return dmRouteResult("freeform-ruling", ["open-intent-default"],
    ["scene", "story-pressure", "relevant-state"], { rulingRequest:dmOpenRulingRequest(raw) });
}

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

function dmTriage(w, action, rolls){
  const reasons = [];
  const txt = String(action || "").toLowerCase();
  const cur = (w && w.characters) ? w.characters.filter(x => x.status === "living").slice(-1)[0] : null;
  const sh  = cur && cur.sheet;

  // A — FIRST CONTACT WITH A PLACE: we're standing somewhere the DM hasn't narrated yet. (Set on
  //     arrival; applyResponse stamps w.dm.lastNarratedNodeId after the DM answers, so the SECOND
  //     turn at the same node falls back to fast.) Session-open also lands here → opening scene = deep.
  const here = w && w.currentNodeId;
  if (here && here !== (w.dm && w.dm.lastNarratedNodeId)) reasons.push("new-place");

  // A2 — an unresolved authored walk finale. The action's vocabulary is a poor proxy for stakes
  // here: "I ask who hired him" can be the campaign's decisive confrontation. The prep graph is
  // already trusted engine state, so it can raise the quality floor without interpreting the
  // player's intent or granting the model any new execution authority. Once the finale overlay is
  // resolved (or the walk cursor is done), ordinary follow-up questions may return to FAST.
  const prep=w&&w.prep;
  const activeWalkId=prep&&prep.activeWalkId;
  const prepNode=activeWalkId&&prep&&prep.nodes&&prep.nodes[activeWalkId];
  const cursor=prepNode&&prepNode.cursor;
  const walk=prepNode&&prepNode.walk;
  const currentSeg=cursor&&walk&&Array.isArray(walk.segments)
    ? walk.segments.find(s=>s&&s.num===cursor.current) : null;
  const currentOverlay=cursor&&prepNode&&Array.isArray(prepNode.segments)
    ? prepNode.segments.find(s=>s&&s.ref===("S"+cursor.current)) : null;
  if(cursor&&!cursor.done&&currentSeg&&currentSeg.isFinale&&
     !(currentOverlay&&currentOverlay.encounterState==="resolved")) reasons.push("walk-finale");

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

  // E2 — a typed rest consequence waiting for narration. The engine already determined that an
  // ambush, tracker, blocked exit, damaged record, or other authored obligation exists; choosing its
  // fictional identity is exactly the kind of meaning work the deeper lane is for.
  if(w&&w.dm&&w.dm.pendingSituation) reasons.push("pending-situation");

  // F — death / no living PC (the bardo) — always the heaviest beat.
  if (w && w.characters && w.characters.length && !cur) reasons.push("no-living-pc");

  // The magnitude roll is already open engine truth before the follow-up TurnRequest is built. A
  // memoryless seat must not send that rare meaning-making beat down the routine lane merely because
  // the synthetic action text says only "I roll Stealth". Every crit/fumble magnitude gets the deep
  // reasoning floor; ordinary non-critical check results remain fast and locally branchable.
  const critRow=(rolls||[]).find(r=>r&&r.crit&&typeof r.crit==="object");
  if(critRow) reasons.push("crit-magnitude:"+(critRow.crit.tier||"standard"));

  const lane = reasons.length ? "deep" : "fast";
  if (lane === "fast") {
    // record the routine shape for telemetry (informative only — it never changes a fast verdict).
    const m = txt.match(DM_ROUTINE_VERBS);
    reasons.push(m ? ("routine:" + m[1]) : "default-fast");
  }
  return { lane: lane, model: (lane === "deep" ? "opus" : "sonnet"), reasons: reasons };
}
