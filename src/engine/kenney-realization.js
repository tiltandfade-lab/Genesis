/* GENESIS MODULE — src/engine/kenney-realization.js — KGR-5 walk-to-Kenney realization.
   Pure classic-script engine code: it adds replaceable visualAsset metadata to already-selected
   nouns without changing canonical identity, count, room, sourceRef, or anchor coordinates.  Rules
   are first-match and candidates are drawn only from the generated approved-runtime registry with a
   local hash; no global RNG stream is consumed. */

const KENNEY_QUARTER_TURNS = Object.freeze([0, Math.PI / 2, Math.PI, Math.PI * 3 / 2]);
const KENNEY_WALL_SIDE_YAW = Object.freeze({ n: 0, s: Math.PI, w: -Math.PI / 2, e: Math.PI / 2 });

function kenneyHashStr(value) {
  const str = String(value == null ? "" : value);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function kenneyCellCodeAt(x, y, plan) {
  if (!plan || !plan.cells || !Number.isInteger(plan.cellW) || !Number.isInteger(plan.cellD)) return null;
  if (x < 0 || y < 0 || x >= plan.cellW || y >= plan.cellD) return null;
  return plan.cells[y * plan.cellW + x];
}

/* Single wall-side authority shared by pre-distribution realization and theater-interior's later
   wall-prop projection.  Direction names the side on which the adjacent WALL cell sits. */
function kenneyWallSideAt(x, y, plan) {
  if (typeof SPATIAL_CELL === "undefined") return null;
  if (kenneyCellCodeAt(x, y - 1, plan) === SPATIAL_CELL.WALL) return "n";
  if (kenneyCellCodeAt(x, y + 1, plan) === SPATIAL_CELL.WALL) return "s";
  if (kenneyCellCodeAt(x - 1, y, plan) === SPATIAL_CELL.WALL) return "w";
  if (kenneyCellCodeAt(x + 1, y, plan) === SPATIAL_CELL.WALL) return "e";
  return null;
}

function kenneyRuleMatches(entry, rule) {
  if (!entry || !rule || !rule.match) return false;
  const match = rule.match;
  if (match.slug != null && String(entry.slug || "") !== String(match.slug)) return false;
  if (Array.isArray(match.realmPropNameIncludes)) {
    const name = String(entry.realmPropName || "").toLowerCase();
    if (!name || !match.realmPropNameIncludes.some((word) => name.includes(String(word).toLowerCase()))) return false;
  }
  return match.slug != null || Array.isArray(match.realmPropNameIncludes);
}

function kenneyRuleAllowsRealm(rule, realmId) {
  if (!Array.isArray(rule && rule.realms) || !rule.realms.length) return true;
  return rule.realms.indexOf("*") >= 0 || rule.realms.indexOf(realmId) >= 0;
}

function kenneyMountTypeFor(entry, rule, plan) {
  if (rule.mount !== "context") return rule.mount;
  if (entry.wallSide || entry.primary === "wall-hang") return "wall-mount";
  const side = kenneyWallSideAt(Number(entry.x), Number(entry.y), plan);
  return side && entry.primary === "light" ? "wall-mount" : "floor-mount";
}

function kenneyRuntimeCandidates(rule, mountType, realmId) {
  if (typeof KENNEY_RUNTIME_ASSETS === "undefined") return [];
  const families = new Set(rule.families || []);
  return Object.keys(KENNEY_RUNTIME_ASSETS).sort().map((id) => KENNEY_RUNTIME_ASSETS[id]).filter((candidate) => {
    if (!candidate || candidate.qaStatus !== "approved-runtime" || !/^[0-9a-f]{64}$/.test(candidate.sourceSha256 || "")) return false;
    if (!families.has(candidate.family)) return false;
    if (!kenneyRuleAllowsRealm(rule, realmId)) return false;
    return (candidate.sockets || []).some((socket) => socket && socket.type === mountType);
  });
}

function kenneyVisualAssetFor(entry, opts) {
  opts = opts || {};
  if (!entry || typeof KENNEY_VISUAL_RULES === "undefined" ||
      typeof KENNEY_RUNTIME_REGISTRY_HASH === "undefined") return null;
  const realmId = opts.realmId || null;
  const rule = KENNEY_VISUAL_RULES.find((candidate) => kenneyRuleMatches(entry, candidate));
  if (!rule || !kenneyRuleAllowsRealm(rule, realmId)) return null;
  const mountType = kenneyMountTypeFor(entry, rule, opts.plan || null);
  const candidates = kenneyRuntimeCandidates(rule, mountType, realmId);
  if (!candidates.length) return null;
  const sourceRef = entry.sourceRef || entry.slug || entry.realmPropName || "unprovenanced";
  const sourceKey = sourceRef && typeof sourceRef === "object" ? JSON.stringify(sourceRef) : String(sourceRef);
  const pickHash = kenneyHashStr(sourceKey + "|" + rule.id + "|" + KENNEY_RUNTIME_REGISTRY_HASH);
  const candidate = candidates[pickHash % candidates.length];
  const socket = candidate.sockets.find((item) => item.type === mountType);
  if (!socket || !socket.id) return null;

  let wallSide = entry.wallSide || null;
  if (mountType === "wall-mount" && !wallSide) wallSide = kenneyWallSideAt(Number(entry.x), Number(entry.y), opts.plan || null);
  if (mountType === "wall-mount" && !wallSide) return null;
  const yawRadians = mountType === "wall-mount"
    ? KENNEY_WALL_SIDE_YAW[wallSide]
    : KENNEY_QUARTER_TURNS[pickHash % KENNEY_QUARTER_TURNS.length];

  return {
    assetId: candidate.assetId,
    pack: candidate.pack,
    slug: candidate.slug,
    mountSocket: socket.id,
    yawRadians,
    footprint: {
      center: candidate.footprint.center.slice(),
      halfExtents: candidate.footprint.halfExtents.slice(),
      yawRadians: Number(candidate.footprint.yawRadians) || 0,
    },
    resolutionRule: rule.id,
    registryHash: KENNEY_RUNTIME_REGISTRY_HASH,
    placementStatus: "candidate",
    wallSide: wallSide || undefined,
  };
}

function kenneyRealizeEntry(entry, opts) {
  const visualAsset = kenneyVisualAssetFor(entry, opts);
  return visualAsset ? Object.assign({}, entry, { visualAsset }) : entry;
}

/* kenneyRealizePlan(plan, opts) -> shallow clone only when a visualAsset is actually stamped.
   Both `dressing` (interior) and `props` (flat trays) use the same rule boundary. */
function kenneyRealizePlan(plan, opts) {
  if (!plan || typeof plan !== "object") return plan;
  opts = Object.assign({}, opts || {}, { plan });
  let changed = false;
  const out = Object.assign({}, plan);
  ["dressing", "props"].forEach((field) => {
    if (!Array.isArray(plan[field])) return;
    let fieldChanged = false;
    const next = plan[field].map((entry) => {
      const realized = kenneyRealizeEntry(entry, opts);
      if (realized !== entry) fieldChanged = true;
      return realized;
    });
    if (fieldChanged) {
      changed = true;
      out[field] = next;
    }
  });
  return changed ? out : plan;
}

window.kenneyHashStr = kenneyHashStr;
window.kenneyWallSideAt = kenneyWallSideAt;
window.kenneyVisualAssetFor = kenneyVisualAssetFor;
window.kenneyRealizePlan = kenneyRealizePlan;
