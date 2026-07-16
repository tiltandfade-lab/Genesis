/* GENESIS DATA — data/theater-beats.js
   VQ2-RESPEC.md §4 unit F2 (Sol P-D, ledger #11 — dev/play-lens/DEMAND-LEDGER.md row 4:
   "shop_open/shop_closed/long_rest/dungeon_complete all render the identical idle pedestal; the
   day-part label is the only tell") — THE BEAT REGISTRY. A state beat (shop_open/shop_closed/
   long_rest/walk_complete) earns a MICRO-STAGE instead of theaterIdleBoardFrom's permanently empty
   table, via this DATA TABLE — consumed by theaterStageBeat (src/engine/theater-data.js, the
   BEAT-staging region of trayFrom) AFTER the board/walkScene derivation, NEVER as an if/else branch
   inside theater-boot.js (that file is untouched by this unit — F2's lane boundary).

   Sol P-D's budget: 1 anchor + <=3 support props + 1 bright practical + minimal cast. The cast is
   NOT this registry's job — castFrom's existing shopOpen->shopfront arrangement already stages the
   shopkeep/PC (src/engine/theater-data.js §U4); this registry only ever adds PROPS (board.props) and
   a LIGHT profile (board.light) — composing with the existing cast seam, never duplicating it. The
   "1 bright practical" is expressed as `lightText` (free text theaterLightOverrideFromText/
   theaterRollLight already turn into a profile, e.g. "lamp" -> "lamplit") rather than a prop
   instance: mountLightProp (src/ui/theater-boot.js) already auto-mounts + positions a practical prop
   BEFORE applyLightProfile runs whenever board.light.profile resolves to torchlit/lamplit/lavalit/
   magic-glow — the EXISTING board-channel convention this unit reuses instead of editing the light
   rig (theater-boot.js) or inventing a second practical-prop mechanism.

   Every prop id is a STABLE literal string within its beat FAMILY — shop_open/shop_closed share ONE
   family ("shop") and the SAME ids (Sol P-D: "states mutate the same scene graph — stable ids across
   state changes"); `states[stateId]` holds only the per-state DELTA (which ids are hidden, whether
   the practical is lit), never a second copy of the geometry. `part` values are drawn ONLY from
   src/engine/theater-data.js's own existing THEATER_PROP_KEYWORD_RULES/PART_NAMES vocabulary
   (table-slab/crate/tent-canopy/furnace-block/...) — no new render geometry class, no theater-boot.js
   registry edit.

   KNOWN DEVIATION (flagged, not silently patched): shop_closed's "shutter" and rest's literal
   "night ring" vignette are NOT separate render primitives — no shutter/vignette part exists in the
   existing vocabulary and this unit does not invent one (CLAUDE.md: "an untagged/exempt/red state
   that tells the truth beats a green that lies"). shop_closed instead darkens (practical off) +
   thins the goods (hides shelf-2) as the honest in-lane approximation of "shuttered"; long_rest's
   "night ring" is achieved by the SAME torchlit profile's own warm-pool-against-dark-ambient read
   every other torchlit tray already has, not a bespoke ring mesh. See F2's unit report for the
   full call. */

const THEATER_BEAT_REGISTRY = {
  shop: {
    // -> theaterLightOverrideFromText -> "lamplit" (THEATER_LIGHT_KEYWORD_RULES already matches
    // \blamp(light|lit)?\b) — the SAME free-text-to-profile seam every walked room's light already
    // resolves through, never a bespoke lookup.
    lightText: "a lamp burns steady over the counter",
    anchor: { id: "beat:shop:counter", part: "table-slab", partParams: {}, x: 0, z: -0.6 },
    support: [
      { id: "beat:shop:shelf-1", part: "crate", partParams: { round: false }, x: -1.8, z: -1.2 },
      { id: "beat:shop:shelf-2", part: "crate", partParams: { round: false }, x: 1.8, z: -1.2 }
    ],
    states: {
      // shop open: the full counter + both shelves, lamp lit — the vendor row/PC are castFrom's job
      // (shopOpen->shopfront), composed with, never duplicated, here.
      shop_open: { hide: [], lightOn: true },
      // shop closed: SAME counter+shelf-1 ids stay mounted (the shuttered storefront silhouette);
      // shelf-2 hides (a "back room, not browsing" read) and the lamp goes dark (lightOn:false ->
      // theaterStageBeat omits lightText -> mountLightProp finds no override -> "lamp 0"). Shopkeep
      // visibility is castFrom's own shopOpen-gated read, already off when the panel is closed.
      shop_closed: { hide: ["beat:shop:shelf-2"], lightOn: false }
    }
  },
  rest: {
    // -> "torchlit" (THEATER_LIGHT_KEYWORD_RULES matches \bbrazier\b|\btorch...|... but not "campfire"
    // itself, so the text below leans on "brazier"'s own synonym set via the furnace-block part read
    // instead; the override text names the fire literally to land on torchlit's warm-pool profile).
    lightText: "a brazier of campfire coals crackles, a small ring of light in the dark",
    anchor: { id: "beat:rest:campfire-pit", part: "furnace-block", partParams: {}, x: 0, z: 0 },
    support: [
      { id: "beat:rest:tent", part: "tent-canopy", partParams: {}, x: -1.6, z: -1.0 },
      { id: "beat:rest:bedroll", part: "table-slab", partParams: { scale: 0.3 }, x: 1.4, z: -0.6 }
    ],
    states: {
      // campArrangement: theaterStageBeat/castFrom's cue to seat the PC at the fire (arrangeTableau's
      // "camp" arrangement, theater-data.js) instead of the default vignette scatter.
      long_rest: { hide: [], lightOn: true, campArrangement: true }
    }
  },
  arrival: {
    // walk-native law: this beat NEVER invents a light — the finale segment's own rolled light (or
    // the tray's ordinary rolled default) stands untouched; only the rolled feature/area stage.
    lightText: null,
    anchor: null,   // the anchor IS the rolled feature — projected in theaterStageBeat off the
                     // classification's own rolled fields, never authored here (no invented default).
    support: [],
    states: {
      walk_complete: { hide: [], lightOn: false }
    }
  }
};

// beatId -> family key (shop_open/shop_closed share "shop"; each other beat is its own family).
const THEATER_BEAT_FAMILY_BY_STATE = {
  shop_open: "shop", shop_closed: "shop", long_rest: "rest", walk_complete: "arrival"
};

// Sol P-D's budget, named ONCE so theaterStageBeat (the enforcer) and dev/verify-f2-staging-beats.mjs
// (the checker) read the identical numbers — never two copies of a budget constant.
const THEATER_BEAT_MAX_PROPS = 4;
const THEATER_BEAT_MAX_PRACTICALS = 1;
