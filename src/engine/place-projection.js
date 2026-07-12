/* GENESIS MODULE — src/engine/place-projection.js
   Walk-card projection boundary. The walk/deal owns facts and homes; this pure layer decides which
   already-authored references are staged, narrated, reserved, or reveal-gated for one active room.
   Player projections never carry concealed payload text. No RNG, world writes, DOM, or renderer calls. */

const WSP_MECHANICAL_ROLES = Object.freeze([
  "cast", "hazard", "objective", "connection", "interactable", "cover", "trace"
]);
const WSP_ROLE_PRIORITY = Object.freeze({
  hazard: 100, cast: 95, objective: 92, connection: 90, interactable: 85,
  trace: 82, cover: 80, centerpiece: 72, activeMagic: 70, feature: 64,
  lore: 58, dressing: 40, atmosphere: 20
});

function wspClamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function wspRole(card) { return (card && (card.role || (card.visual && card.visual.role) || card.kind)) || "dressing"; }
function wspPriority(card) {
  if (card && Number.isFinite(Number(card.priority))) return Number(card.priority);
  return WSP_ROLE_PRIORITY[wspRole(card)] || 30;
}
function wspWeight(card) {
  const n = card && card.visual && Number(card.visual.weight);
  return Number.isFinite(n) && n > 0 ? n : (wspRole(card) === "centerpiece" ? 3 : 1);
}
function wspAssignmentMap(walk) {
  const out = new Map();
  const list = walk && walk.deck && Array.isArray(walk.deck.assignments) ? walk.deck.assignments : [];
  list.forEach((a) => { if (a && a.cardId != null) out.set(String(a.cardId), a); });
  return out;
}
function wspSecretState(secret, overlay) {
  const revealed = overlay && Array.isArray(overlay.revealedSecrets) ? overlay.revealedSecrets : [];
  const noticed = overlay && Array.isArray(overlay.noticedSecrets) ? overlay.noticedSecrets : [];
  if (secret && revealed.indexOf(secret.id) >= 0) return "revealed";
  if (secret && noticed.indexOf(secret.id) >= 0) return "noticed";
  return (secret && secret.state) || "hidden";
}
function wspSecretMap(walk) {
  const out = new Map();
  const list = walk && Array.isArray(walk.secretNetwork) ? walk.secretNetwork : [];
  list.forEach((s) => { if (s && s.id != null) out.set(String(s.id), s); });
  return out;
}
function wspApplyEntityGuise(card, opts) {
  if (!card || card.entityRef == null) return card;
  const byId = opts && opts.guiseByEntityId;
  const guise = byId && byId[card.entityRef];
  if (!guise || !Array.isArray(guise.forms)) return card;
  const form = guise.forms.find((f) => f && f.formId === guise.active);
  if (!form || !form.spriteSlug) return card;
  const objectForm = form.kind === "object" || form.kind === "prop";
  const identityHidden = guise.revealState === "hidden" || guise.revealState === "suspected";
  return Object.assign({}, card, {
    presentationId:card.presentationId || String(card.entityRef),
    sourceRef:identityHidden ? (card.publicSourceRef || card.sourceRef || String(card.id)) : (card.sourceRef || String(card.id)),
    role:objectForm ? "guise" : "cast",
    mechanical:true,
    guise:true,
    visual:Object.assign({}, card.visual || {}, {
      presentation:objectForm ? "object" : "standee",
      slug:form.spriteSlug,
      size:form.sizeBand || (card.visual && card.visual.size) || null,
      scaleVsHuman:form.scaleVsHuman == null ? null : form.scaleVsHuman
    })
  });
}
function wspFallbackCards(segment) {
  if (!segment) return [];
  const p = "S" + segment.num + ".";
  const cards = [];
  const add = (field, role, value, extra) => {
    if (value == null) return;
    if (typeof value === "object" && !Array.isArray(value) && !Object.keys(value).length) return;
    cards.push(Object.assign({ id: p + field, sourceRef: p + field, homeSegNum: segment.num, role }, extra || {}));
  };
  if (segment.encounter && segment.encounter.type && segment.encounter.type !== "Empty") {
    const role = segment.encounter.type === "Hazard" ? "hazard"
      : segment.encounter.type === "Lore" || segment.encounter.type === "Discovery" ? "lore" : "cast";
    add("encounter", role, segment.encounter, { mechanical: role === "hazard" || role === "cast" });
  }
  add("finale", "objective", segment.finale, { mechanical: true, centerpiece: true });
  add("feature", "feature", segment.feature, { centerpiece: true });
  add("object", "interactable", segment.object, { mechanical: true });
  add("activeMagic", "activeMagic", segment.activeMagic);
  add("regionEncounter", "cast", segment.regionEncounter, { mechanical: true });
  add("dressing", "dressing", segment.dressing);
  add("atmo", "atmosphere", segment.atmo);
  return cards;
}
function wspCardsForRoom(walk, segment) {
  const deck = walk && walk.deck;
  if (!deck || !Array.isArray(deck.cards)) return { explicit: false, cards: wspFallbackCards(segment) };
  const assignments = wspAssignmentMap(walk);
  const segNum = segment && segment.num;
  const cards = deck.cards.map((card) => {
    if (!card || card.id == null) return null;
    const assignment = assignments.get(String(card.id)) || {};
    const homeSegNum = assignment.homeSegNum != null ? assignment.homeSegNum : card.homeSegNum;
    if (homeSegNum !== segNum) return null;
    return Object.assign({}, card, { __assignment: assignment, homeSegNum });
  }).filter(Boolean);
  return { explicit: true, cards };
}
function wspRoomCapacity(plan, segNum, isEmpty) {
  const room = plan && Array.isArray(plan.rooms) ? plan.rooms.find((r) => r.segNum === segNum) : null;
  const area = room ? Math.max(1, Number(room.w || 1) * Number(room.d || 1)) : 24;
  return wspClamp(Math.floor(area / 8) + (isEmpty ? 2 : 0), 3, 10);
}
function wspPublicCard(card) {
  const visual = card.visual || {};
  const count = Math.max(1, Number(card.count) || 1);
  const px = visual.position && Number(visual.position.x);
  const py = visual.position && Number(visual.position.y);
  const position = Number.isFinite(px) && Number.isFinite(py) ? { x:px, y:py } : null;
  return {
    id: String(card.presentationId || card.id), sourceRef: card.sourceRef || String(card.id), role: wspRole(card),
    priority: wspPriority(card), weight: wspWeight(card), mechanical: !!card.mechanical,
    centerpiece: !!card.centerpiece || wspRole(card) === "centerpiece",
    presentation: visual.presentation || card.presentation || null,
    guise: !!card.guise || visual.presentation === "guise",
    cardKind: visual.size || null,
    slug: visual.slug || null,
    position,
    count, representativeCount: Math.min(count, Math.max(1, Number(visual.maxRepresentatives) || 3)),
    groupFootprint: visual.groupFootprint || null
  };
}

/** walkSceneProjectionFrom(walk, segment, plan, opts) -> player-safe or DM projection.
 * opts: {overlay, viewer:"player"|"dm"}. Explicit assignment lanes win; otherwise mechanical
 * citizens stage first, sensory material narrates, and the visual budget fills by stable priority. */
function walkSceneProjectionFrom(walk, segment, plan, opts) {
  opts = opts || {};
  const viewer = opts.viewer === "dm" ? "dm" : "player";
  const overlay = opts.overlay || null;
  const segNum = segment && segment.num;
  const source = wspCardsForRoom(walk, segment);
  const secrets = wspSecretMap(walk);
  const visible = [], concealed = [];

  source.cards.forEach((rawCard) => {
    const card = wspApplyEntityGuise(rawCard, opts);
    const secret = card.secretId != null ? secrets.get(String(card.secretId)) : null;
    const state = secret ? wspSecretState(secret, overlay) : (card.revealState || "revealed");
    if (state === "hidden") {
      if (viewer === "dm") concealed.push({ id: String(card.id), sourceRef: card.sourceRef || String(card.id), secretId: secret && secret.id });
      return;
    }
    if (state === "noticed") {
      if (card.tell && card.tell.sourceRef) {
        visible.push({ id: String(card.id) + ":tell", sourceRef: card.tell.sourceRef, role: "atmosphere",
          priority: wspPriority(card), visual: card.tell.visual || null, __assignment: { lane: "narrateNow" } });
      }
      return;
    }
    visible.push(card);
  });

  const isEmpty = !segment || !segment.encounter || segment.encounter.type === "Empty";
  const capacity = wspRoomCapacity(plan, segNum, isEmpty);
  const ordered = visible.slice().sort((a, b) => wspPriority(b) - wspPriority(a) || String(a.id).localeCompare(String(b.id)));
  const stageNow = [], narrateNow = [], reserve = [];
  let used = 0;
  ordered.forEach((card) => {
    const lane = card.__assignment && card.__assignment.lane;
    const role = wspRole(card);
    const mandatory = !!card.mechanical || WSP_MECHANICAL_ROLES.indexOf(role) >= 0;
    if (lane === "reserve") { reserve.push(Object.assign(wspPublicCard(card), { reason: "dealt-reserve" })); return; }
    if (lane === "narrateNow" || role === "atmosphere" || role === "lore") { narrateNow.push(wspPublicCard(card)); return; }
    const weight = wspWeight(card);
    if (lane === "stageNow" || mandatory || used + weight <= capacity) {
      stageNow.push(wspPublicCard(card)); used += weight;
    } else {
      reserve.push(Object.assign(wspPublicCard(card), { reason: "visual-density" }));
    }
  });

  const visibleConnections = [];
  (walk && Array.isArray(walk.secretNetwork) ? walk.secretNetwork : []).forEach((secret) => {
    if (!secret || secret.kind !== "connection" || wspSecretState(secret, overlay) !== "revealed") return;
    if (secret.fromSegNum !== segNum && secret.toSegNum !== segNum) return;
    visibleConnections.push({ id: secret.id, fromSegNum: secret.fromSegNum, toSegNum: secret.toSegNum,
      sourceRef: secret.sourceRef || ("secret:" + secret.id), visual: secret.visual || null });
  });

  const density = used > capacity ? "overloaded" : used >= capacity * 0.75 ? "dense" : stageNow.length ? "composed" : "quiet";
  const out = { version: 1, explicitDeal: source.explicit, activeSegNum: segNum, capacity, used,
    density, stageNow, narrateNow, reserve, visibleConnections };
  if (viewer === "dm") out.concealed = concealed;
  return out;
}
