/* GENESIS MODULE — src/engine/walk-scene.js
   WALK-NATIVE-A.md WDV-1 — the anti-drift boundary between the stored walk and the graphics engine
   (docs/WALK-NATIVE-A.md; ui-sketches/mock-frames/vq-battle-scenes/WALK-NATIVE-DIORAMA-CONTRACT.md
   §2 envelope, §3 provenance, §4 taxonomy, §5-7 field maps). Classic <script> (shared global scope),
   engine-pure like src/engine/place-projection.js — NOT an ES module. No THREE, no DOM, no
   Math.random()/Date.now(), no world writes. Never mutates walk/segment/overlay/spatialRoom.

   walkSceneFrom(...) WRAPS walkSceneProjectionFrom (place-projection.js) for cast/interactable/
   dressing/hidden cards dealt off the walk's own deck (or its legacy per-field fallback) — it NEVER
   re-deals or re-rolls. It ADDS the structure/connection/surface/practical/condition/atmosphere
   classification of the raw walk/segment fields the dealer ignores (areaType/dims/side, exits+door
   state, biome/skin register, light sources, dressing.condition, sensory/atmo prose, and the
   reveal-gated secret/loot/artFind facts) so a room reads as a staged place, not just a cast list.

   Every returned entry is `{role, sourceRef, ...roleFields}`; `sourceRef` is `{walkId, segmentNum,
   fieldPath, tableId, roll, overlayRef}` (contract §3) — `tableId`/`roll` stay null until WDV-2's
   `segment.rollRefs[<fieldKey>]` sibling map exists (read opportunistically here, never required).
   `fieldRefs[]` is the flat index of every sourceRef emitted, one per lane entry. */

// ─── small pure helpers ───────────────────────────────────────────────────────
function wsPresent(v){
  if(v == null) return false;
  if(typeof v === "string") return v.trim().length > 0;
  if(Array.isArray(v)) return v.length > 0;
  if(typeof v === "object") return Object.keys(v).some(function(k){ return wsPresent(v[k]); });
  return true;
}
function wsRollRef(segment, fieldKey){
  if(!fieldKey || !segment || !segment.rollRefs) return null;
  return segment.rollRefs[fieldKey] || null;
}
function wsSourceRef(walkId, segmentNum, fieldPath, rollRef, overlayRef){
  return {
    walkId: walkId == null ? null : walkId,
    segmentNum: segmentNum == null ? null : segmentNum,
    fieldPath: fieldPath == null ? null : fieldPath,
    tableId: (rollRef && rollRef.tableId) || null,
    roll: (rollRef && rollRef.total != null) ? rollRef.total : null,
    overlayRef: overlayRef == null ? null : overlayRef
  };
}
function wsEmit(scene, laneKey, entry){
  scene[laneKey].push(entry);
  scene.fieldRefs.push(entry.sourceRef);
}
// strips any 'role'/'sourceRef' keys a spread raw-object field might carry — those two keys are
// ALWAYS ours (the entry envelope), never the copied fact's own, so a raw overlay object with its
// own 'sourceRef'/'role' key can never clobber the one this module derives.
function wsSafeFields(fields){
  if(!fields) return {};
  const out = {};
  Object.keys(fields).forEach(function(k){ if(k !== "role" && k !== "sourceRef") out[k] = fields[k]; });
  return out;
}
function wsEmitField(scene, ctx, fieldPath, laneKey, role, fields, rollRefKey, overlayRef){
  const rollRef = wsRollRef(ctx.segment, rollRefKey || null);
  const sourceRef = wsSourceRef(ctx.walkId, ctx.segNum, fieldPath, rollRef, overlayRef || null);
  const entry = Object.assign({ role: role, sourceRef: sourceRef }, wsSafeFields(fields));
  wsEmit(scene, laneKey, entry);
}
// reveal-gated fact (secret/loot/artFind): stays in hidden[] (no player-visible role entry) until
// live.discoveredSecrets or overlay.revealedSecrets names "S<segNum>.<fieldKey>" — mirrors the
// "S<num>.<field>" sourceRef vocabulary place-projection's own fallback cards already use.
function wsHiddenField(scene, ctx, fieldKey, value, promote){
  if(!wsPresent(value)) return;
  const hiddenId = "S" + ctx.segNum + "." + fieldKey;
  const live = ctx.live || {};
  const overlay = ctx.overlay || {};
  const discovered =
    (Array.isArray(live.discoveredSecrets) && live.discoveredSecrets.indexOf(hiddenId) >= 0) ||
    (Array.isArray(overlay.revealedSecrets) && overlay.revealedSecrets.indexOf(hiddenId) >= 0);
  const rollRef = wsRollRef(ctx.segment, fieldKey);
  const sourceRef = wsSourceRef(ctx.walkId, ctx.segNum, fieldKey, rollRef, null);
  if(!discovered){
    wsEmit(scene, "hidden", { role: "hidden", sourceRef: sourceRef, fieldKey: fieldKey, value: value });
    return;
  }
  const p = promote(value);
  wsEmit(scene, p.lane, Object.assign({ role: p.role, sourceRef: sourceRef }, p.fields || {}));
}

// ─── card-lane fold (step 2: reuse walkSceneProjectionFrom, never re-deal) ────
// Maps a dealt card's place-projection role to a WalkScene lane. Only the 5 buckets the WDV-1 spec
// names explicitly are {cast}->citizens, {interactable}->interactables, {centerpiece,feature}->
// structure/citizen (by centerpiece flag), {dressing,cover}->dressing, {trace}->traces; this extends
// that table with the remaining WSP_ROLE_PRIORITY roles a real (non-explicit-deck) walk's fallback
// deal actually emits, so no mechanically-active dealt card silently drops out of the boundary:
// hazard/objective fold into the same interactable/centerpiece-flag rules (a Hazard-type encounter
// reads as an actionable trap fixture per the taxonomy's own "trap" example; an objective card always
// carries centerpiece:true, same dominant-anchor rule as centerpiece/feature), guise -> citizen (a
// disguised creature keeps its identity), connection/activeMagic map to their taxonomy homes.
// atmosphere/lore-role cards never reach stageNow/reserve (place-projection routes them to
// narrateNow) so they never appear here — their raw fields are classified directly in step 3 instead.
const WS_LANE_ROLE = {
  structure: "structure", citizens: "citizen", interactables: "interactable",
  dressing: "dressing", traces: "trace", connections: "connection", conditions: "condition"
};
function wsCardLaneKey(role, card){
  if(role === "cast" || role === "guise") return "citizens";
  if(role === "interactable" || role === "hazard") return "interactables";
  if(role === "centerpiece" || role === "feature" || role === "objective") return card.centerpiece ? "structure" : "citizens";
  if(role === "dressing" || role === "cover") return "dressing";
  if(role === "trace") return "traces";
  if(role === "connection") return "connections";
  if(role === "activeMagic") return "conditions";
  return null;
}
function wsFieldKeyFromCardRef(ref){
  if(typeof ref !== "string") return null;
  const m = /^S-?\d+\.([A-Za-z0-9_]+)/.exec(ref);
  return m ? m[1] : null;
}
function wsFoldCardLane(scene, ctx, projection){
  ["stageNow", "reserve"].forEach(function(laneName){
    const list = (projection && Array.isArray(projection[laneName])) ? projection[laneName] : [];
    list.forEach(function(card){
      if(!card) return;
      const dealRole = card.role;
      const laneKey = wsCardLaneKey(dealRole, card);
      if(!laneKey) return;
      const fieldKey = wsFieldKeyFromCardRef(card.sourceRef);
      const rollRef = wsRollRef(ctx.segment, fieldKey);
      const sourceRef = wsSourceRef(ctx.walkId, ctx.segNum, card.sourceRef == null ? null : card.sourceRef, rollRef, null);
      const entry = { role: WS_LANE_ROLE[laneKey], sourceRef: sourceRef };
      Object.keys(card).forEach(function(k){
        if(k === "sourceRef" || k === "role") return;
        entry[k] = card[k];
      });
      if(laneName === "reserve") entry.deferred = true;
      wsEmit(scene, laneKey, entry);
    });
  });
  // concealed (DM-only lane) — inert under the player-viewer call WDV-1 always makes, kept for the
  // contract's own "concealed... -> hidden[]" instruction so a future dm-viewer caller degrades safely.
  if(projection && Array.isArray(projection.concealed)){
    projection.concealed.forEach(function(c){
      if(!c) return;
      const fieldKey = wsFieldKeyFromCardRef(c.sourceRef);
      const rollRef = wsRollRef(ctx.segment, fieldKey);
      const sourceRef = wsSourceRef(ctx.walkId, ctx.segNum, c.sourceRef == null ? null : c.sourceRef, rollRef, null);
      wsEmit(scene, "hidden", { role: "hidden", sourceRef: sourceRef, secretId: c.secretId == null ? null : c.secretId });
    });
  }
}

// ─── overlay-derived traces/removals (step 4) ─────────────────────────────────
function wsFoldOverlay(scene, ctx){
  const overlay = ctx.overlay;
  if(!overlay) return;
  (Array.isArray(overlay.traces) ? overlay.traces : []).forEach(function(t, i){
    if(t == null) return;
    const overlayRef = (t && typeof t === "object" && t.id != null) ? String(t.id) : null;
    wsEmitField(scene, ctx, "overlay.traces[" + i + "]", "traces", "trace",
      Object.assign({}, (t && typeof t === "object") ? t : { value: t }), null, overlayRef);
  });
  (Array.isArray(overlay.removed) ? overlay.removed : []).forEach(function(r, i){
    if(r == null) return;
    wsEmitField(scene, ctx, "overlay.removed[" + i + "]", "removals", "removal",
      Object.assign({}, (r && typeof r === "object") ? r : { id: r }), null);
  });
  (Array.isArray(overlay.decals) ? overlay.decals : []).forEach(function(d, i){
    if(d == null) return;
    wsEmitField(scene, ctx, "overlay.decals[" + i + "]", "traces", "trace",
      Object.assign({}, (d && typeof d === "object") ? d : { value: d }), null);
  });
}

// ─── environment field maps (step 3: the non-card structural/environmental facts) ────────────────
// docs/.../WALK-NATIVE-DIORAMA-CONTRACT.md §5 dungeon field map.
function wsClassifyDungeon(scene, ctx){
  const s = ctx.segment;
  if(wsPresent(s.areaType)) wsEmitField(scene, ctx, "areaType", "structure", "structure", { value: s.areaType }, "area");
  if(wsPresent(s.dims)) wsEmitField(scene, ctx, "dims", "structure", "structure", { value: s.dims }, "area");
  if(wsPresent(s.side)) wsEmitField(scene, ctx, "side", "structure", "structure", { value: s.side }, "area");
  (Array.isArray(s.exits) ? s.exits : []).forEach(function(exit, i){
    if(!exit) return;
    const path = "exits[" + i + "]";
    wsEmitField(scene, ctx, path, "connections", "connection", {
      targetSegNum: exit.num == null ? null : exit.num, targetId: exit.targetId == null ? null : exit.targetId,
      label: exit.label || null, isFinale: !!exit.isFinale,
      door: exit.door ? { type: exit.door.type || null, state: exit.door.state || null } : null
    }, "door");
    if(exit.door && exit.door.state){
      wsEmitField(scene, ctx, path + ".door.state", "interactables", "interactable", {
        name: exit.door.state.name || null, desc: exit.door.state.desc || null, kind: "door-state"
      }, "door");
    }
  });
  if(wsPresent(s.dressing && s.dressing.condition)){
    wsEmitField(scene, ctx, "dressing.condition", "conditions", "condition", { value: s.dressing.condition }, "dressing");
  }
  if(wsPresent(s.light) || wsPresent(s.lighting) || wsPresent(s.lightFlavor)){
    wsEmitField(scene, ctx, "light", "practicals", "practical",
      { light: s.light || null, lighting: s.lighting || null, lightFlavor: s.lightFlavor || null }, "light");
  }
  if(wsPresent(s.sensory)) wsEmitField(scene, ctx, "sensory", "atmosphere", "atmosphere", { text: s.sensory });
  if(wsPresent(s.atmo)) wsEmitField(scene, ctx, "atmo", "atmosphere", "atmosphere",
    { lane: (s.atmo && s.atmo.lane) || null, text: (s.atmo && s.atmo.text) || null });

  wsHiddenField(scene, ctx, "secret", s.secret, function(v){
    return { lane: "interactables", role: "interactable",
      fields: { tier: v.tier || null, desc: v.desc || null, reveal: v.reveal || null, skills: v.skills || null } };
  });
  wsHiddenField(scene, ctx, "loot", s.loot, function(v){
    return { lane: "citizens", role: "citizen",
      fields: { magic: v.magic || null, coin: v.coin || null, valuable: v.valuable || null, enemyLoot: !!v.enemyLoot } };
  });
}

// §6 urban field map — `sceneFrame`, NOT `scene` (urban segments carry no `.scene` field at all).
function wsClassifyUrban(scene, ctx){
  const s = ctx.segment;
  if(wsPresent(s.segType)) wsEmitField(scene, ctx, "segType", "structure", "structure", { value: s.segType });
  if(wsPresent(s.description)) wsEmitField(scene, ctx, "description", "structure", "structure", { value: s.description });
  if(wsPresent(s.transition)) wsEmitField(scene, ctx, "transition", "connections", "connection", { value: s.transition });
  if(wsPresent(s.sceneFrame)) wsEmitField(scene, ctx, "sceneFrame", "structure", "structure", {
    frame: s.sceneFrame.frame || null, dims: s.sceneFrame.dims || null, tactical: s.sceneFrame.tactical || null
  }, "sceneFrame");
  (Array.isArray(s.exits) ? s.exits : []).forEach(function(exit, i){
    if(!exit) return;
    wsEmitField(scene, ctx, "exits[" + i + "]", "connections", "connection", {
      targetSegNum: exit.num == null ? null : exit.num, targetId: exit.targetId == null ? null : exit.targetId,
      label: exit.label || null, isFinale: !!exit.isFinale, door: null
    });
  });
  if(wsPresent(s.dressing && s.dressing.condition)){
    wsEmitField(scene, ctx, "dressing.condition", "conditions", "condition", { value: s.dressing.condition }, "dressing");
  }
  if(wsPresent(s.light)) wsEmitField(scene, ctx, "light", "practicals", "practical", { light: s.light }, "light");
  if(wsPresent(s.interactable)) wsEmitField(scene, ctx, "interactable", "interactables", "interactable", {
    name: s.interactable.name || null, flavor: s.interactable.flavor || null,
    tag: s.interactable.tag || null, tag2: s.interactable.tag2 || null,
    signal: s.interactable.signal || null, visibility: s.interactable.visibility || null, tone: s.interactable.tone || null
  }, "interactable");
  // backgroundEvent: a chance-gated {text,band} ambient beat with no licensed participant list —
  // prose-only atmosphere (§8.5 no coherence veto: never invent a visible participant the roll
  // didn't name).
  if(wsPresent(s.backgroundEvent)) wsEmitField(scene, ctx, "backgroundEvent", "atmosphere", "atmosphere",
    { text: s.backgroundEvent.text || null, band: s.backgroundEvent.band || null });

  wsHiddenField(scene, ctx, "loot", s.loot, function(v){
    return { lane: "citizens", role: "citizen",
      fields: { magic: v.magic || null, coin: v.coin || null, valuable: v.valuable || null, enemyLoot: !!v.enemyLoot } };
  });
}

// §7 wilderness/travel field map.
function wsClassifyWilderness(scene, ctx){
  const s = ctx.segment;
  if(wsPresent(s.biome)) wsEmitField(scene, ctx, "biome", "surfaces", "surface", { biome: s.biome, biomeDesc: s.biomeDesc || null });
  if(wsPresent(s.signOfPassage)) wsEmitField(scene, ctx, "signOfPassage", "dressing", "dressing",
    { name: s.signOfPassage.name || null, effect: s.signOfPassage.effect || null }, "signOfPassage");
  if(wsPresent(s.footing)) wsEmitField(scene, ctx, "footing", "structure", "structure", { value: s.footing });
  if(wsPresent(s.survival)) wsEmitField(scene, ctx, "survival", "structure", "structure", { value: s.survival });
  if(wsPresent(s.areaType)) wsEmitField(scene, ctx, "areaType", "structure", "structure", { value: s.areaType }, "area");
  if(wsPresent(s.dims)) wsEmitField(scene, ctx, "dims", "structure", "structure", { value: s.dims }, "area");
  if(wsPresent(s.side)) wsEmitField(scene, ctx, "side", "structure", "structure", { value: s.side }, "area");
  (Array.isArray(s.exits) ? s.exits : []).forEach(function(exit, i){
    if(!exit) return;
    wsEmitField(scene, ctx, "exits[" + i + "]", "connections", "connection", {
      targetSegNum: exit.num == null ? null : exit.num, targetId: exit.targetId == null ? null : exit.targetId,
      label: exit.label || null, isFinale: !!exit.isFinale, door: null
    });
  });
  if(wsPresent(s.dressing && s.dressing.condition)){
    wsEmitField(scene, ctx, "dressing.condition", "conditions", "condition", { value: s.dressing.condition }, "dressing");
  }
  if(wsPresent(s.light)) wsEmitField(scene, ctx, "light", "practicals", "practical", { light: s.light }, "light");
  if(wsPresent(s.interactable)) wsEmitField(scene, ctx, "interactable", "interactables", "interactable", {
    name: s.interactable.name || null, flavor: s.interactable.flavor || null
  });
  if(wsPresent(s.sensory)) wsEmitField(scene, ctx, "sensory", "atmosphere", "atmosphere", { text: s.sensory });
  if(wsPresent(s.atmo)) wsEmitField(scene, ctx, "atmo", "atmosphere", "atmosphere",
    { lane: (s.atmo && s.atmo.lane) || null, text: (s.atmo && s.atmo.text) || null });

  wsHiddenField(scene, ctx, "artFind", s.artFind, function(v){
    return { lane: "citizens", role: "citizen", fields: { text: v.text || null, band: v.band || null } };
  });
  wsHiddenField(scene, ctx, "loot", s.loot, function(v){
    return { lane: "citizens", role: "citizen",
      fields: { magic: v.magic || null, coin: v.coin || null, valuable: v.valuable || null, enemyLoot: !!v.enemyLoot, frame: v.frame || null } };
  });
}

// ─── PUBLIC — walkSceneBeatFor(input) -> {beatId,family,rolled} | null (VQ2-RESPEC.md §4 F2,
// Sol P-D, ledger #11) ──────────────────────────────────────────────────────────────────────────
// THE BEAT CLASSIFICATION half of "a state beat earns a micro-stage" — pure, no GS/w/theater-boot.js
// reads of its own (this file's own header discipline: engine-pure, never a world write). Every fact
// it needs arrives as an EXPLICIT input flag from the caller (src/world/render.js's
// theaterBeatInputFor — the SAME "source carries flags" precedent theaterCastSourceFor's shopOpen/
// theaterHereSourceFor's env/realms/clockMin already set, none of them GS/w reads performed by the
// engine layer itself). The REGISTRY (data/theater-beats.js) holds the anchor/support/practical
// grammar per beat; this function only decides WHICH beat (if any) is active and, for walk_complete,
// extracts the ROLLED fields off the real finale segment (walk-native law: project ONLY what the
// segment actually carries — s.areaType/s.feature, the exact fields wsClassifyDungeon already reads
// for a live walked room — never an invented default).
//
// input = {
//   shopOpen: bool,          // GS.gamePanel==="shop" && GS.activeShopId (the existing shopOpen flag)
//   shopHere: bool,          // a shop is minted at the current node, panel not open
//   justRested: bool,        // an edge-triggered "the long rest that just completed" signal (this
//                            // render only, self-clearing — theaterBeatInputFor's own header comment,
//                            // src/world/render.js, has the full account of why it's edge-triggered
//                            // rather than a clock-minute match)
//   walkCompleteHere: bool,  // the current node's own frontier walk is done (no active walk here)
//   finaleSegment: object|null, walkId, walk  // for walk_complete's rolled-field projection
// }
// Priority order (first true wins — at most one beat stages per render, matching the single-idle-
// table precedent every other trayFrom branch already keeps): shopOpen > justRested > shopHere >
// walkCompleteHere. FOUND LIVE (a play-lens capture card caught it, not assumed): a rest taken AT a
// shop-bearing settlement node has BOTH shopHere and justRested true simultaneously (the party is
// standing exactly where a shop sits, panel closed, having just rested there) — shopHere used to be
// checked first, so the intentional "we just rested" beat silently lost to the ambient "there's a
// closed shop here" one every time (pl-021's own capture read as shop_closed, not camp). justRested
// now outranks shopHere: an ACTIVE just-happened event beats a passive ambient fact about the location,
// matching shopOpen's own precedent (an active transacting state also outranks the ambient facts below
// it). A caller passing multiple true flags still degrades to ONE beat, never a throw.
function walkSceneBeatFor(input){
  input = input || {};
  if(input.shopOpen) return { beatId: "shop_open", family: "shop", rolled: {} };
  if(input.justRested) return { beatId: "long_rest", family: "rest", rolled: {} };
  if(input.shopHere) return { beatId: "shop_closed", family: "shop", rolled: {} };
  if(input.walkCompleteHere){
    const seg = input.finaleSegment || null;
    const walkId = input.walkId != null ? input.walkId : null;
    const segNum = (seg && seg.num != null) ? seg.num : null;
    const areaType = (seg && wsPresent(seg.areaType)) ? seg.areaType : null;
    const feature = (seg && wsPresent(seg.feature)) ? { name: seg.feature.name || null, flavor: seg.feature.flavor || null } : null;
    return {
      beatId: "walk_complete", family: "arrival",
      rolled: {
        areaType: areaType,
        areaTypeSourceRef: areaType ? wsSourceRef(walkId, segNum, "areaType", wsRollRef(seg, "area"), null) : null,
        feature: feature,
        featureSourceRef: feature ? wsSourceRef(walkId, segNum, "feature", wsRollRef(seg, "feature"), null) : null
      }
    };
  }
  return null;
}

// ─── PUBLIC — walkSceneFrom(input) -> WalkScene (docs/WALK-NATIVE-A.md WDV-1) ────────────────────
function walkSceneFrom(input){
  input = input || {};
  const walkId = input.walkId == null ? null : input.walkId;
  const walk = input.walk || null;
  const segment = input.segment || null;
  const overlay = input.overlay || null;
  const spatialRoom = input.spatialRoom || null;
  const live = input.live || {};

  const scene = {
    walkRef: null, segmentRef: null, register: null,
    structure: [], connections: [], surfaces: [], practicals: [], citizens: [],
    interactables: [], dressing: [], conditions: [], atmosphere: [], hidden: [],
    traces: [], removals: [], fieldRefs: []
  };
  if(!segment) return scene;

  const segNum = segment.num == null ? null : segment.num;

  // 1. envelope + register
  scene.walkRef = {
    id: walkId,
    environment: walk && walk.environment != null ? walk.environment : null,
    topology: walk && walk.topology != null ? walk.topology : null
  };
  scene.segmentRef = {
    id: segment.id == null ? null : segment.id,
    num: segNum,
    label: segment.label == null ? null : segment.label
  };
  scene.register = {
    setup: walk && walk.setup != null ? walk.setup : null,
    skin: walk && walk.skin != null ? walk.skin : null,
    spiceTier: walk && walk.spiceTier != null ? walk.spiceTier : null,
    posture: (walk && walk.posture != null) ? walk.posture : null,
    depth: segment.depth != null ? segment.depth : null,
    isFinale: !!segment.isFinale
  };

  const ctx = { walkId: walkId, segNum: segNum, segment: segment, overlay: overlay, live: live };

  // 2. reuse the card lane for dealt content — never re-deal, never re-roll.
  const plan = spatialRoom ? { rooms: [spatialRoom] } : null;
  const projection = (typeof walkSceneProjectionFrom === "function")
    ? walkSceneProjectionFrom(walk, segment, plan, { overlay: overlay, viewer: "player" })
    : null;
  wsFoldCardLane(scene, ctx, projection);

  // 3. classify the non-card structural/environmental fields the dealer ignores.
  const env = walk && walk.environment != null ? walk.environment : null;
  if(env === "dungeon") wsClassifyDungeon(scene, ctx);
  else if(env === "urban") wsClassifyUrban(scene, ctx);
  else if(env === "wilderness") wsClassifyWilderness(scene, ctx);

  // 4. overlay-derived traces/removals (persistent room aftermath).
  wsFoldOverlay(scene, ctx);

  // 5. hidden gating is folded into steps 3's field classifiers above (wsHiddenField).

  // 6. return the WalkScene — never mutate walk/segment/overlay/spatialRoom.
  return scene;
}
