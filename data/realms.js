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
  },
  chrome: {
    id: "chrome",
    label: "Chrome",
    register: "Tech/sci-fi — clean hard surfaces, cheap miracles, and a battery bar always dropping.",
    voice: ["a charge indicator", "vacuum-sealed corridors", "the hum under everything", "a manual nobody kept"],
  },
  noir: {
    id: "noir",
    label: "Noir",
    register: "Noir/modern-crime — everyone owes somebody, and the rain never checks your alibi.",
    voice: ["a case that isn't closed", "cigarette light through blinds", "a name people stop saying", "the honest cop, alone"],
  },
  ash: {
    id: "ash",
    label: "Ash",
    register: "Post-apocalyptic — the world already ended once; everyone's still deciding what that means.",
    voice: ["cracked asphalt", "a Geiger tick", "hoarded fuel", "the last working thing in a dead town"],
  },
  suburb: {
    id: "suburb",
    label: "Suburb",
    register: "Sleep-stalker suburbia — cheerful lawns, identical doors, and a wrongness that keeps regular hours.",
    voice: ["a sprinkler at 3am", "cul-de-sac quiet", "the neighbor who waves too fast", "curfew lights"],
  },
  cosmic: {
    id: "cosmic",
    label: "Cosmic",
    register: "Cosmic/weird — scale that doesn't fit in a sentence; the wonder that answers back.",
    voice: ["a sound with no source", "geometry that argues with itself", "a name too long to finish", "the drowned language"],
  },
  theater: {
    id: "theater",
    label: "Theater",
    register: "War, any war — never named, never flagged; shapes without nations, real atrocity never loot (docs/BREACH.md §2d content-safety).",
    voice: ["a whistle before the guns answer", "mud that remembers boots", "a letter never sent", "the line that held, once"],
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
  },
  "lost-world": {
    id: "lost-world",
    label: "Lost World",
    register: "Vanished civilizations & epic-fantasy antiquity — a wonder that outlived everyone who built it.",
    voice: ["a monument with no living reader", "a name that means king in a dead tongue", "sand that used to be a garden", "a road that goes nowhere on purpose"],
  },
  gloom: {
    id: "gloom",
    label: "Gloom",
    register: "Horror/occult — the dread that answers a knock; nothing here is a metaphor.",
    voice: ["a candle that gutters at the wrong moment", "handwriting that isn't yours anymore", "a mirror one second slow", "the cellar door, ajar"],
  },
  "bright-kingdom": {
    id: "bright-kingdom",
    label: "Bright Kingdom",
    register: "Toybox/anachronism/whimsical wonder — power-ups you EAT, rules a child could recite, teeth underneath the candy.",
    voice: ["a fanfare for a small victory", "a rule everyone already knows", "a prize that's watching you", "the too-bright color of a warning"],
  },
  "realm-neutral": {
    id: "realm-neutral",
    label: "Realm-Neutral",
    register: "No home realm — the cross-IP grab-bag register the legacy d300 keeps; stays in the d300, never gets its own table.",
    voice: [],
  },
};

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
