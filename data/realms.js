/* GENESIS DATA — data/realms.js — the frozen Outlandish-REALM vocabulary (docs/BREACH.md §2c/§2e,
   BATCH3-GUARDRAILS.md J2 "outlandish-realms" closure — Adam's founding slate, 2026-07-03)
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Hand-authored source data (like data/tarot.js, data/skin-motifs.js) — NOT a compiled artifact.

   THE FOUNDING SLATE IS DECLARED (BATCH3-GUARDRAILS J2): exactly these 11 realm ids + realm-neutral.
   The d300 inventory scan (docs/BREACH.md §2c point 3) MERGES onto this slate — scan-derived
   categories map onto these; nothing scan-derived may mint a new id. Freeze exactly these ids.

     frontier · chrome · noir · ash · suburb · cosmic · theater · high-seas · lost-world ·
     gloom · bright-kingdom  (+ realm-neutral — stays in the d300; no neutral realm table)

   Each realm entry: {id, label, register, voice} — `register` is the one-line tone anchor for
   DM narration + table authoring (J3b voice anchors); `voice` is a short list of sensory/word
   anchors an author can lean on without inventing a new register. THEATER carries `eraLens` —
   a d8 sub-table of war shapes (BREACH.md §2c: "wars RHYME, never named: shapes without flags,
   and real atrocity is never loot").

   Division of labor (BATCH3-GUARDRAILS J2 "realm-kits -> REALM TABLES" restructure): breach
   draws roll the per-realm d100 table (Engine/03. _Tables/05. Realms/); anachronism-INTRUSIONS
   roll the legacy d300 (its permanent cross-realm grab-bag role) — this file is the vocabulary
   spine both lean on, not a table itself. */

const REALMS = {
  frontier: {
    id: "frontier",
    label: "Frontier",
    register: "Western — dust, debt, and a line nobody enforces till somebody does.",
    voice: ["dust", "the noon-draw", "a saloon door that never quite shuts", "the last honest lawman for a hundred miles"],
    render: { sat: 0.75, tint: "#c88a3c", tintAmt: 0.20, contrast: 1.05 },
  },
  chrome: {
    id: "chrome",
    label: "Chrome",
    register: "Tech/sci-fi — clean hard surfaces, cheap miracles, and a battery bar always dropping.",
    voice: ["a charge indicator", "vacuum-sealed corridors", "the hum under everything", "a manual nobody kept"],
    render: { sat: 0.85, tint: "#3ec8c0", tintAmt: 0.18, contrast: 1.15 },
  },
  noir: {
    id: "noir",
    label: "Noir",
    register: "Noir/modern-crime — everyone owes somebody, and the rain never checks your alibi.",
    voice: ["a case that isn't closed", "cigarette light through blinds", "a name people stop saying", "the honest cop, alone"],
    render: { sat: 0.45, tint: "#4a5878", tintAmt: 0.28, contrast: 1.35 },
  },
  ash: {
    id: "ash",
    label: "Ash",
    register: "Post-apocalyptic — the world already ended once; everyone's still deciding what that means.",
    voice: ["cracked asphalt", "a Geiger tick", "hoarded fuel", "the last working thing in a dead town"],
    render: { sat: 0.60, tint: "#c9b27a", tintAmt: 0.22, contrast: 1.10 },
  },
  suburb: {
    id: "suburb",
    label: "Suburb",
    register: "Sleep-stalker suburbia — cheerful lawns, identical doors, and a wrongness that keeps regular hours.",
    voice: ["a sprinkler at 3am", "cul-de-sac quiet", "the neighbor who waves too fast", "curfew lights"],
    render: { sat: 0.90, tint: "#d8a868", tintAmt: 0.15, contrast: 0.85 },
  },
  cosmic: {
    id: "cosmic",
    label: "Cosmic",
    register: "Hermetic-Enochian esoterica — as above, so below, made literal: correspondences are load-bearing, true names command, sacred geometry casts, and the wonder answers back when you spell it right.",
    voice: ["a true name, spoken exactly once", "a circle squared into a door", "the tongue of Thoth, read aloud and answering", "a heart laid on the scale"],
    render: { sat: 1.25, tint: "#8a3ce0", tintAmt: 0.30, contrast: 0.90 },
  },
  theater: {
    id: "theater",
    label: "Theater",
    register: "War, any war — never named, never flagged; shapes without nations, real atrocity never loot (docs/BREACH.md §2d content-safety).",
    voice: ["a whistle before the guns answer", "mud that remembers boots", "a letter never sent", "the line that held, once"],
    render: { sat: 0.65, tint: "#6e6238", tintAmt: 0.22, contrast: 1.10 },
    eraLens: [
      { id: "trench", label: "Trench", flavor: "mud, wire, and a whistle that means something terrible" },
      { id: "hedgerow", label: "Hedgerow", flavor: "close green country, a landing that didn't stop coming" },
      { id: "legion", label: "Legion", flavor: "shield-wall discipline, a road built to outlast the army on it" },
      { id: "musket", label: "Musket", flavor: "smoke-line volleys, a drum that tells you when to advance" },
      { id: "longship", label: "Longship", flavor: "a coastline that learned to dread a particular silhouette" },
      { id: "jungle", label: "Jungle", flavor: "heat, canopy, a war fought as much against the ground" },
      { id: "siege", label: "Siege", flavor: "a wall, a patience, and a starving calendar" },
    ],
  },
  "high-seas": {
    id: "high-seas",
    label: "High Seas",
    register: "Age of sail — salt, debt-to-the-crew, and a horizon that keeps its own counsel.",
    voice: ["a creaking hold", "the captain's ledger", "a chart with a torn corner", "gulls before a storm"],
    render: { sat: 0.85, tint: "#3c7888", tintAmt: 0.20, contrast: 1.10 },
  },
  "lost-world": {
    id: "lost-world",
    label: "Lost World",
    register: "Vanished civilizations & epic-fantasy antiquity — a wonder that outlived everyone who built it.",
    voice: ["a monument with no living reader", "a name that means king in a dead tongue", "sand that used to be a garden", "a road that goes nowhere on purpose"],
    render: { sat: 1.00, tint: "#c89a3c", tintAmt: 0.15, contrast: 1.05 },
  },
  gloom: {
    id: "gloom",
    label: "Gloom",
    register: "Horror/occult — the dread that answers a knock; nothing here is a metaphor.",
    voice: ["a candle that gutters at the wrong moment", "handwriting that isn't yours anymore", "a mirror one second slow", "the cellar door, ajar"],
    render: { sat: 0.55, tint: "#3a5c3e", tintAmt: 0.26, contrast: 1.25 },
  },
  "bright-kingdom": {
    id: "bright-kingdom",
    label: "Bright Kingdom",
    register: "Toybox/anachronism/whimsical wonder — power-ups you EAT, rules a child could recite, teeth underneath the candy.",
    voice: ["a fanfare for a small victory", "a rule everyone already knows", "a prize that's watching you", "the too-bright color of a warning"],
    render: { sat: 1.25, tint: "#ffb0e0", tintAmt: 0.24, contrast: 0.92 },  // Adam 2026-07-05: candyland/mushroom-kingdom, NOT lava — cotton-candy pink tint, lifted contrast (bright+airy), the old #e83c64 red read as a fire level
  },
  "realm-neutral": {
    id: "realm-neutral",
    label: "Realm-Neutral",
    register: "No home realm — the cross-IP grab-bag register the legacy d300 keeps; stays in the d300, never gets its own table.",
    voice: [],
  },
};

/* REALM-RENDER-STYLE.md §2/§4 — the neutral/no-realm baseline profile: sat=1 (no chroma change),
   tintAmt=0 (no hue shift — the tint hex is irrelevant at amt 0, but a real color keeps gradeColor's
   math well-defined), contrast=1 (no value/contrast change). realmRenderProfile falls back to this
   for realm-neutral, an unrecognized realm id, or no active realm at all — §4's "no realms ->
   byte-identical" regression law: gradeColor(hex, REALM_RENDER_DEFAULT) must equal hex exactly. */
const REALM_RENDER_DEFAULT = Object.freeze({ sat: 1, tint: "#808080", tintAmt: 0, contrast: 1 });

/* §3 "Active realm resolver" — ONE source of truth, shared with the realm-surface/realm-prop/
   realm-monster selectors (all three already answer "what realm am I in?" off the SAME
   activeRealmsFor(skin,w) shape: an array of active realm ids, e.g. cm.segment.realms /
   opts.realms elsewhere in this codebase). Accepts either:
     - an array of realm ids (the activeRealmsFor(skin,w) shape itself) — the primary/first id's
       profile wins (a breach's realms[] is small; §3 names `realms[0]` as the read for "the
       current breach's realms"),
     - a world-like object carrying `.realm.name` (the marooned-in-a-realm shape §3 also names),
     - or a bare realm id string (defensive convenience — never required by any real caller today).
   Absent/empty/unrecognized input resolves to REALM_RENDER_DEFAULT — never throws, never returns
   undefined, matching realmOf's own total-function discipline. */
function realmRenderProfile(w_or_realms) {
  let realmId = null;
  if (Array.isArray(w_or_realms)) {
    realmId = w_or_realms.length ? w_or_realms[0] : null;
  } else if (typeof w_or_realms === "string") {
    realmId = w_or_realms;
  } else if (w_or_realms && typeof w_or_realms === "object") {
    realmId = (w_or_realms.realm && w_or_realms.realm.name) || null;
  }
  if (!realmId || realmId === "realm-neutral") return REALM_RENDER_DEFAULT;
  const entry = REALMS[realmId];
  if (!entry || !entry.render) return REALM_RENDER_DEFAULT;
  return entry.render;
}

/* §3 "Color grade" pure helper — REALM-SURFACES-WIRING.md's theaterApplySurfaceTint (src/engine/
   theater-data.js) is the sibling seam this was designed to share (its own header comment names
   gradeColor by name), but that function hands back a realm surface's free-text tint description
   verbatim (theater-data.js is the GL-free pure layer and can't resolve a hex itself) — gradeColor
   is the actual numeric-hex math both the GL layer (src/ui/theater-boot.js) and this pure layer can
   call once a real "#rrggbb"/0xrrggbb color is in hand. Pure: (hex, profile) -> a graded hex NUMBER,
   never a string, never NaN, never a negative/out-of-gamut channel.

   Order of operations (cheap, no postprocess pass — §1's own dimension list):
     1. saturation: mix the color toward its own Rec.601 grey by (1 - sat) when sat<1 (desaturate),
        or push AWAY from grey by extrapolating past the original color when sat>1 (saturate) — both
        expressed as one lerp toward/past grey, channel-clamped after.
     2. tint: mix toward the profile's tint color by tintAmt (0..~0.35 per §1 — not clamped here so a
        future authored value outside that band still behaves sanely, just less "cheap").
     3. contrast: scale each channel's distance from mid-grey (127.5) by `contrast`, so >1 crushes
        toward black/lifts toward white (more contrast) and <1 flattens toward mid-grey — matches §1
        rule 3's "noir crushes to hard blacks... suburb flattens to a faded-photo mid-tone" language.
   Every step clamps to [0,255] before the next reads it, so an extreme stacked profile (e.g.
   bright-kingdom's sat 1.45 + contrast 1.15) can never produce a negative or overflowed channel —
   channels are always valid 8-bit bytes, gamut-safe by construction, not just by luck. Accepts hex as
   either a "#rrggbb"/"rrggbb" string or a 0xrrggbb number; a malformed/absent hex defaults to mid-grey
   (0x808080) rather than throwing, same belt-and-suspenders discipline theater-boot.js's own
   hexToRGB uses. A null/absent profile resolves to REALM_RENDER_DEFAULT (byte-identical passthrough:
   sat 1 / tintAmt 0 / contrast 1 leaves every channel exactly where it started). */
function gradeColor(hex, profile) {
  const p = profile || REALM_RENDER_DEFAULT;
  const rgb = _gradeHexToRGB(hex);
  const sat = typeof p.sat === "number" && isFinite(p.sat) ? p.sat : 1;
  const tintAmt = typeof p.tintAmt === "number" && isFinite(p.tintAmt) ? p.tintAmt : 0;
  const contrast = typeof p.contrast === "number" && isFinite(p.contrast) ? p.contrast : 1;

  // 1. saturation — lerp toward/past the color's own grey (Rec.601 luma), then clamp.
  const grey = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
  let r = grey + (rgb.r - grey) * sat;
  let g = grey + (rgb.g - grey) * sat;
  let b = grey + (rgb.b - grey) * sat;
  r = _gradeClamp(r); g = _gradeClamp(g); b = _gradeClamp(b);

  // 2. tint — lerp toward the profile's tint color by tintAmt.
  if (tintAmt > 0) {
    const t = _gradeHexToRGB(p.tint);
    const amt = tintAmt < 0 ? 0 : tintAmt;
    r = _gradeClamp(r + (t.r - r) * amt);
    g = _gradeClamp(g + (t.g - g) * amt);
    b = _gradeClamp(b + (t.b - b) * amt);
  }

  // 3. contrast — scale each channel's distance from mid-grey (127.5), then clamp.
  r = _gradeClamp(127.5 + (r - 127.5) * contrast);
  g = _gradeClamp(127.5 + (g - 127.5) * contrast);
  b = _gradeClamp(127.5 + (b - 127.5) * contrast);

  return (r << 16) | (g << 8) | b;
}

// local byte clamp — gradeColor's own guard so every intermediate stays a valid [0,255] channel
// even under a stacked extreme profile (never negative, never >255, never NaN propagates through).
function _gradeClamp(v) {
  if (!isFinite(v)) return 0;
  return v < 0 ? 0 : (v > 255 ? 255 : v | 0);
}

// hex ("#rrggbb" / "rrggbb" string, or a 0xrrggbb number) -> {r,g,b} bytes. Mirrors theater-boot.js's
// own hexToRGB discipline (mid-grey default on anything malformed) but accepts a string too, since
// gradeColor's callers include the pure theater-data.js layer where tile tints are "#rrggbb" strings,
// not yet-parsed THREE.Color numbers. Never throws.
function _gradeHexToRGB(hex) {
  if (typeof hex === "number" && isFinite(hex)) {
    const n = hex & 0xffffff;
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
  }
  if (typeof hex === "string") {
    const s = hex.replace(/^#/, "");
    const n = parseInt(s, 16);
    if (isFinite(n) && s.length >= 3) return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
  }
  return { r: 128, g: 128, b: 128 };
}

const REALM_IDS = Object.keys(REALMS).filter((k) => k !== "realm-neutral");

// resolve a realm key to its entry, falling back to realm-neutral for an unknown/absent key
// (forward-compatible: SKIN-GRANTS.md "unknown grant token -> log + no-op" discipline extended here).
function realmOf(key) {
  return REALMS[key] || REALMS["realm-neutral"];
}

// pick a THEATER era-lens by id, falling back to the first lens for an unknown/absent id — never throws.
function theaterEraLens(key) {
  const lenses = REALMS.theater.eraLens;
  return lenses.find((l) => l.id === key) || lenses[0];
}
