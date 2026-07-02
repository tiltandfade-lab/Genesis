/* ============================================================================
   BLOCKWRIGHT — docs/BLOCKWRIGHT.md — the procedural visual layer (blocky, untextured, fast).
   New module, manifest+script-tag registered (BLOCKWRIGHT.md §4 build item 1).

   §0 constraints (verbatim intent, BLOCKWRIGHT.md §0): a HANDFUL of generic models by size class
   (never per-enemy models); environments geometric/blocky/NO textures, simple shaders only — the
   whole diorama is CSS-3D DOM, zero image-gen, zero asset pipeline, jsdom-testable.

   §1 THE RENDERER — CSS-3D cuboids, zero dependencies. A cuboid is 6 absolutely-positioned faces
   in a transform-style:preserve-3d group; the fixed isometric camera only ever needs 3 of them
   (top + two camera-facing sides), so bwBox only ever emits 3 face divs — "rest unrendered
   (culled — the fixed camera never sees them)" per the spec, kept literal: we never build faces
   the stage can't see, which is also how the ≤180-face budget stays cheap on a slow machine.
   Shades are precomputed multipliers on ONE base color: top ×1.15, side-A (camera-facing, "front")
   ×1.00, side-B (the other camera-facing side, "flank") ×0.82. No gradients/shadows/filters/lighting
   math at runtime — exactly 3 flat multiplies per cuboid, done once at render (static transforms
   composite once; nothing repaints per frame).
   ============================================================================ */

// ---- §1a color math: one base hex -> the 3 precomputed face shades ----------------------------
function bwShade(hex, mult){
  hex = String(hex || "#666666").replace("#", "");
  if(hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const n = parseInt(hex, 16);
  if(isNaN(n)) return "#666666";
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r * mult)));
  g = Math.max(0, Math.min(255, Math.round(g * mult)));
  b = Math.max(0, Math.min(255, Math.round(b * mult)));
  const hx = v => v.toString(16).padStart(2, "0");
  return "#" + hx(r) + hx(g) + hx(b);
}
function bwFaceShades(color){
  return { top: bwShade(color, 1.15), front: bwShade(color, 1.00), flank: bwShade(color, 0.82) };
}

// ---- §1b deterministic seeded hash + jitter (self-contained — no cross-module dep; the ANTI-
// MINECRAFT rule needs "same seed -> same scatter twice", never Math.random) ---------------------
function bwSeedHash(s){
  s = String(s == null ? "" : s);
  let h = 0;
  for(let i = 0; i < s.length; i++){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}
// a deterministic float in [0,1) from a seed string + a salt (so two calls on the same seed with
// different salts don't collide) — used for the ±15° rotY scatter and the small dimension jitter.
function bwSeedFrac(seed, salt){
  const h = bwSeedHash(String(seed == null ? "" : seed) + "|" + String(salt == null ? "" : salt));
  return (h % 10000) / 10000;
}
// the ANTI-MINECRAFT rotY scatter: every PROP gets a deterministic ±15° Y-rotation (never 0 unless
// the seed lands exactly on center — vanishingly rare and still deterministic); tiles never call this.
function bwPropRotY(seed){
  const frac = bwSeedFrac(seed, "rotY");
  return Math.round((frac * 30 - 15) * 100) / 100; // -15..+15, 2dp
}
// small per-prop dimension jitter (§0 anti-Minecraft rule 4: "no two adjacent props share exact
// dimensions") — a bounded +/-12% multiplier, deterministic per seed+axis.
function bwDimJitter(seed, axis){
  const frac = bwSeedFrac(seed, "dim:" + axis);
  return 0.88 + frac * 0.24; // 0.88..1.12
}

// ---- §1c the four primitives ---------------------------------------------------------------
// bwBox({x,y,z,w,d,h,color,rotY}) -> {html, faceCount} — a straight cuboid, 3 visible faces.
function bwBox(o){
  o = o || {};
  const x = o.x || 0, y = o.y || 0, z = o.z || 0;
  const w = Math.max(0.01, o.w || 1), d = Math.max(0.01, o.d || 1), h = Math.max(0.01, o.h || 1);
  const color = o.color || "#556070";
  const rotY = o.rotY || 0;
  const shades = bwFaceShades(color);
  const U = 40; // px-per-unit — a fixed scale so the stage's grid is stable
  const px = x * U, py = y * U, pz = z * U, pw = w * U, pd = d * U, ph = h * U;
  const html =
    `<div class="bw-cuboid" style="transform:translate3d(${px}px,${py}px,${pz}px) rotateY(${rotY}deg);width:${pw}px;height:${ph}px;">` +
      `<div class="bw-face bw-top" style="background:${shades.top};width:${pw}px;height:${pd}px;transform:rotateX(90deg) translateZ(${ph}px);"></div>` +
      `<div class="bw-face bw-front" style="background:${shades.front};width:${pw}px;height:${ph}px;transform:translateZ(${pd/2}px);"></div>` +
      `<div class="bw-face bw-flank" style="background:${shades.flank};width:${pd}px;height:${ph}px;transform:rotateY(90deg) translateZ(${pw/2}px);"></div>` +
    `</div>`;
  return { html, faceCount: 3 };
}
// bwFrustum({...box, taper:0..0.6}) -> a tapered box (top face inset via a clip-path trapezoid on
// the two visible side faces) — organic forms (trees/boulders/torsos/heads) use this, never bwBox,
// per the anti-Minecraft rule. taper clamped 0..0.6 (0 == a plain box, kept as a frustum face-shape).
function bwFrustum(o){
  o = o || {};
  const taper = Math.max(0, Math.min(0.6, o.taper == null ? 0.25 : o.taper));
  const base = bwBox(o);
  const insetPct = Math.round(taper * 50); // half the taper on each side, symmetric trapezoid
  const clip = `polygon(${insetPct}% 0%, ${100 - insetPct}% 0%, 100% 100%, 0% 100%)`;
  const html = base.html
    .replace('class="bw-face bw-front" style="', `class="bw-face bw-front bw-frustum" style="clip-path:${clip};`)
    .replace('class="bw-face bw-flank" style="', `class="bw-face bw-flank bw-frustum" style="clip-path:${clip};`);
  return { html, faceCount: base.faceCount, tapered: true };
}
// bwPrism({...box, ridge:"x"|"z"}) -> a wedge/gable (roof shape) — top face collapses to a ridge
// line via a triangle clip on the top face; still 3 faces (no new divs), just a shaped top.
function bwPrism(o){
  o = o || {};
  const ridge = (o.ridge === "z") ? "z" : "x";
  const base = bwBox(o);
  const clip = (ridge === "x") ? "polygon(0% 100%, 50% 0%, 100% 100%)" : "polygon(100% 0%, 100% 100%, 0% 50%)";
  const html = base.html.replace(/class="bw-top" style="/, `class="bw-top bw-prism-${ridge}" style="clip-path:${clip};`);
  return { html, faceCount: base.faceCount, ridge };
}
// bwGroup(children, {x,y,z,rotY}) -> wraps an array of {html,faceCount} into one positioned group div.
function bwGroup(children, o){
  o = o || {}; children = children || [];
  const x = (o.x || 0) * 40, y = (o.y || 0) * 40, z = (o.z || 0) * 40, rotY = o.rotY || 0;
  const html = `<div class="bw-group" style="transform:translate3d(${x}px,${y}px,${z}px) rotateY(${rotY}deg);">` +
    children.map(c => c && c.html || "").join("") + `</div>`;
  const faceCount = children.reduce((n, c) => n + (c && c.faceCount || 0), 0);
  return { html, faceCount };
}
// bwStage(rootEl, {gridW,gridD}) -> mounts a fixed isometric camera group into rootEl and returns
// a stage handle {mount(children)} — the ONE rotateX/rotateZ on the whole scene (§1 "fixed camera").
function bwStage(rootEl, o){
  o = o || {};
  const gridW = o.gridW || 6, gridD = o.gridD || 6;
  return {
    gridW, gridD,
    mount(children){
      const reduced = (typeof matchMedia === "function") && matchMedia("(prefers-reduced-motion: reduce)").matches;
      const group = bwGroup(children, {});
      const html = `<div class="bw-stage${reduced ? " bw-reduced" : ""}"><div class="bw-camera">${group.html}</div></div>`;
      if(rootEl) rootEl.innerHTML = html;
      return { html, faceCount: group.faceCount };
    }
  };
}

// ---- §2 the generic figure roster (procedural, parameterized — no files) -----------------------
// BW_SILHOUETTE — bestiary TYPE tag -> one of the 4 silhouettes (BLOCKWRIGHT.md §2). Unknown -> biped.
const BW_SILHOUETTE = {
  humanoid: "biped", undead: "biped", giant: "biped", celestial: "biped", fiend: "biped",
  beast: "quadruped", monstrosity: "quadruped",
  ooze: "mass", swarm: "mass", plant: "mass", aberration: "mass",
  dragon: "serpent",
  construct: "biped", elemental: "mass", fey: "biped"
};
function bwSilhouetteFor(creatureType){
  return BW_SILHOUETTE[String(creatureType || "").toLowerCase()] || "biped";
}
// BW_TYPE_COLORS — creature TYPE -> one flat base color (BLOCKWRIGHT.md §2 "palette by creature type").
const BW_TYPE_COLORS = {
  undead: "#8d8368", beast: "#7a5a35", humanoid: "#4d5866", fiend: "#5e2a24",
  construct: "#6b6f73", elemental: "#3f6a72", dragon: "#5a4430", ooze: "#4f6b4a",
  swarm: "#565040", plant: "#3f5a3a", giant: "#5a5245", celestial: "#7a7250",
  fey: "#4a6858", monstrosity: "#5a4a52", aberration: "#453a52"
};
function bwColorFor(creatureType){
  return BW_TYPE_COLORS[String(creatureType || "").toLowerCase()] || "#556070";
}
// BW_SIZE_SCALE — the 5 size classes -> a uniform scalar (BLOCKWRIGHT.md §2).
const BW_SIZE_SCALE = { Tiny: 0.4, Small: 0.7, Medium: 1, Large: 2, Huge: 3, Gargantuan: 3 };
function bwSizeScaleFor(size){
  const key = String(size || "Medium").replace(/^./, c => c.toUpperCase());
  return BW_SIZE_SCALE[key] || BW_SIZE_SCALE.Medium;
}

/* bwFigure({size, silhouette, palette, label, seed, extra}) -> {html, faceCount}. Assembles 3-7
   cuboids per BLOCKWRIGHT.md §2. "Nobody gets a face" — no head-detail geometry beyond a plain
   head block; labels are the existing chip/nameplate DOM, never geometry here. `extra` (bool) adds
   the PC/sidekick weapon-block cuboid (§2 "one extra cuboid + class-hue"). Organic silhouettes
   (quadruped/serpent/mass) use bwFrustum per the anti-Minecraft rule; biped uses a mix (torso/head
   frustum, limbs slim boxes) so a "handful of generic models" still reads as painted miniatures. */
function bwFigure(o){
  o = o || {};
  const scale = bwSizeScaleFor(o.size);
  const color = o.palette || "#556070";
  const seed = o.seed != null ? o.seed : (o.label || "figure");
  const sil = o.silhouette || "biped";
  const parts = [];
  const rotY = bwPropRotY(seed); // every figure is a PROP — deterministic ±15° scatter (never 0-only)

  if(sil === "biped"){
    parts.push(bwFrustum({ x: 0, y: 0, z: 0, w: 0.5 * scale, d: 0.35 * scale, h: 0.55 * scale, color, taper: 0.15 })); // torso
    parts.push(bwFrustum({ x: 0, y: -0.55 * scale, z: 0, w: 0.32 * scale, d: 0.32 * scale, h: 0.3 * scale, color, taper: 0.25 })); // head
    parts.push(bwBox({ x: -0.18 * scale, y: 0.5 * scale, z: 0, w: 0.16 * scale, d: 0.16 * scale, h: 0.5 * scale, color })); // leg L
    parts.push(bwBox({ x: 0.18 * scale, y: 0.5 * scale, z: 0, w: 0.16 * scale, d: 0.16 * scale, h: 0.5 * scale, color })); // leg R
  } else if(sil === "quadruped"){
    parts.push(bwFrustum({ x: 0, y: 0.1 * scale, z: 0, w: 0.9 * scale, d: 0.4 * scale, h: 0.4 * scale, color, taper: 0.2 })); // body, low
    parts.push(bwFrustum({ x: 0.5 * scale, y: 0, z: 0, w: 0.3 * scale, d: 0.3 * scale, h: 0.3 * scale, color, taper: 0.2 })); // head
    parts.push(bwBox({ x: -0.3 * scale, y: 0.45 * scale, z: 0, w: 0.12 * scale, d: 0.12 * scale, h: 0.35 * scale, color })); // leg
    parts.push(bwBox({ x: 0.3 * scale, y: 0.45 * scale, z: 0, w: 0.12 * scale, d: 0.12 * scale, h: 0.35 * scale, color })); // leg
  } else if(sil === "serpent"){
    parts.push(bwFrustum({ x: 0, y: 0.2 * scale, z: 0, w: 1.1 * scale, d: 0.3 * scale, h: 0.25 * scale, color, taper: 0.35 })); // segmented run, low
    parts.push(bwFrustum({ x: 0.6 * scale, y: 0.15 * scale, z: 0, w: 0.35 * scale, d: 0.3 * scale, h: 0.3 * scale, color, taper: 0.3 })); // head
  } else { // mass — single mound (oozes, swarms, blobs)
    parts.push(bwFrustum({ x: 0, y: 0.15 * scale, z: 0, w: 0.8 * scale, d: 0.8 * scale, h: 0.5 * scale, color, taper: 0.4 }));
  }
  if(o.extra){ // PC/sidekick weapon block (a plain slim box — deliberately NOT organic)
    parts.push(bwBox({ x: 0.35 * scale, y: -0.1 * scale, z: 0.1 * scale, w: 0.08 * scale, d: 0.08 * scale, h: 0.7 * scale, color: o.extraColor || color }));
  }
  return bwGroup(parts, { rotY });
}

// ---- §3 environments — blocky by construction ---------------------------------------------------
// bwFeature(kind, {seed, palette}) -> {html, faceCount}. Rolled footprints (BATTLEMAP §1) map to
// ~10 blocky primitives; unknown -> a neutral marker block + label (never invisible/invented).
const BW_FEATURE_KINDS = ["tree", "copse", "boulder", "monolith", "trench", "fog", "dais", "perch", "choke", "brush"];
function bwFeature(kind, o){
  o = o || {};
  const seed = o.seed != null ? o.seed : kind;
  const palette = o.palette || {};
  const groundColor = palette.ground || "#3a4048";
  const propColor = palette.prop || "#4a6650";
  const accentColor = palette.accent || "#a86a3a";
  const rotY = bwPropRotY(seed);
  const jw = bwDimJitter(seed, "w"), jd = bwDimJitter(seed, "d");
  const k = String(kind || "").toLowerCase();
  let parts = [];
  if(k === "tree" || k === "copse"){
    const n = k === "copse" ? 3 : 1;
    for(let i = 0; i < n; i++){
      const s = seed + ":" + i;
      parts.push(bwFrustum({ x: i * 0.5 - (n - 1) * 0.25, y: 0, z: 0, w: 0.3 * jw, d: 0.3 * jd, h: 0.9 + bwSeedFrac(s, "h") * 0.4, color: propColor, taper: 0.4, rotY: bwPropRotY(s) }));
    }
    return bwGroup(parts, {});
  }
  if(k === "boulder" || k === "monolith"){
    parts.push(bwFrustum({ x: 0, y: 0, z: 0, w: 0.6 * jw, d: 0.6 * jd, h: k === "monolith" ? 1.4 : 0.5, color: "#71716b", taper: k === "monolith" ? 0.15 : 0.35, rotY }));
    return bwGroup(parts, {});
  }
  if(k === "trench"){ // a recessed tile — negative-height marker (rendered as a thin dark slab, no crater geometry)
    parts.push(bwBox({ x: 0, y: 0, z: 0, w: 1, d: 1, h: 0.08, color: "#1c1f22" }));
    return bwGroup(parts, {});
  }
  if(k === "fog"){ // the ONE allowed sub-1 opacity cuboid
    const box = bwBox({ x: 0, y: -0.3, z: 0, w: 1, d: 1, h: 0.6, color: "#c9d4da" });
    box.html = box.html.replace('class="bw-cuboid"', 'class="bw-cuboid bw-fog"');
    return { html: box.html, faceCount: box.faceCount };
  }
  if(k === "dais" || k === "perch"){
    parts.push(bwBox({ x: 0, y: 0.3, z: 0, w: 0.8 * jw, d: 0.8 * jd, h: 0.3, color: accentColor }));
    return bwGroup(parts, {});
  }
  if(k === "choke"){ // two wall blocks with a gap
    parts.push(bwBox({ x: -0.35, y: 0, z: 0, w: 0.3, d: 0.3, h: 1, color: groundColor }));
    parts.push(bwBox({ x: 0.35, y: 0, z: 0, w: 0.3, d: 0.3, h: 1, color: groundColor }));
    return bwGroup(parts, {});
  }
  if(k === "brush"){
    parts.push(bwFrustum({ x: 0, y: 0.35, z: 0, w: 0.7 * jw, d: 0.7 * jd, h: 0.2, color: propColor, taper: 0.3, rotY }));
    return bwGroup(parts, {});
  }
  // unknown feature -> a neutral marker block + label (never invisible, never invented geometry)
  const marker = bwBox({ x: 0, y: 0, z: 0, w: 0.4, d: 0.4, h: 0.4, color: "#888888" });
  return { html: `<div class="bw-feature-unknown" title="${String(kind || "feature")}">${marker.html}</div>`, faceCount: marker.faceCount };
}

// bwZoneTile(o) -> a flat platform cuboid (near-zero height); elevation = literally taller (elev flag).
function bwZoneTile(o){
  o = o || {};
  const h = o.elev ? 0.5 : 0.06;
  return bwBox({ x: o.x || 0, y: o.y || 0, z: o.z || 0, w: o.w || 1, d: o.d || 1, h, color: o.color || "#3a4048" });
}

// ---- region palette hookup (BLOCKWRIGHT.md §3) --------------------------------------------------
// REGIONS-NAMES ships a freeform `vector.skinBias`/`vector.archetypeBias` prose pair — NOT a
// structured 4-color field (reconciled against the real built src/engine/region.js; the spec
// assumed a color vector that doesn't exist yet). This derives a stable 4-color scheme from that
// prose deterministically (word-bucket -> hue lean), so region identity still nudges the diorama
// palette without inventing a new region-vector field. No region / no bias text -> the flat default
// palette (ground/wall/accent/prop), unchanged. NULL-SAFE per BATCH-GUARDRAILS G9.
const BW_DEFAULT_PALETTE = { ground: "#3a4048", wall: "#4a5058", accent: "#a86a3a", prop: "#4a6650" };
const BW_SKIN_HUE_WORDS = {
  wet: { ground: "#2e3a42", wall: "#37444c", accent: "#3f7a8a", prop: "#2e5248" },
  mournful: { ground: "#33323a", wall: "#40404a", accent: "#5a4a6a", prop: "#3a3a44" },
  ashen: { ground: "#3c3936", wall: "#484440", accent: "#8a5a3a", prop: "#454038" },
  verdant: { ground: "#333f30", wall: "#404c3c", accent: "#b0863a", prop: "#3f6a3a" },
  frozen: { ground: "#38434c", wall: "#44505a", accent: "#5a8ca8", prop: "#455058" },
  scorched: { ground: "#3f322a", wall: "#4c3c30", accent: "#c9662f", prop: "#4a3a2c" }
};
function bwRegionPalette(region){
  const bias = region && region.vector && region.vector.skinBias;
  if(!bias || typeof bias !== "string") return Object.assign({}, BW_DEFAULT_PALETTE);
  const lower = bias.toLowerCase();
  for(const word in BW_SKIN_HUE_WORDS){
    if(lower.indexOf(word) !== -1) return Object.assign({}, BW_SKIN_HUE_WORDS[word]);
  }
  return Object.assign({}, BW_DEFAULT_PALETTE);
}
// dungeon lighting rows darken the region (or default) palette — a flat multiply, no new geometry.
function bwDarkenPalette(palette, mult){
  const p = palette || BW_DEFAULT_PALETTE;
  const m = mult == null ? 0.7 : mult;
  return { ground: bwShade(p.ground, m), wall: bwShade(p.wall, m), accent: bwShade(p.accent, m), prop: bwShade(p.prop, m) };
}

// ---- §1 performance budget (hard, verify-enforced): <=180 face divs per diorama (~30 cuboids) ---
const BW_FACE_BUDGET = 180;
function bwWithinBudget(faceCount){ return faceCount <= BW_FACE_BUDGET; }
