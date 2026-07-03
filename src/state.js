/* GENESIS MODULE — src/state.js — GS: the single mutable-state container.
   Established 2026-06-20 (see docs/SCALING.md). All transient app/creator state lives here,
   so every mutation is greppable as `GS.<x> =` and future modules have one obvious home
   for state instead of scattering new globals.

   `var` (not const) is deliberate: it puts GS on `window`, which is required for inline
   on* handlers (e.g. oninput="GS.CGEN.name=this.value") to reach it — top-level const/let
   do NOT land on window. Loaded FIRST in the manifest so GS exists before anything runs.

   NOTE: the persistent universe `U` is intentionally NOT in GS — it already has its own
   disciplined accessor layer (loadU/saveU/activeWorld) in world.state. */
var GS = {
  CGEN: null,                  // the character currently being created (creator flow)
  BARDO: null,                 // the spirit-guide state machine
  CG_DRAG: null,               // ability-score drag-drop transient
  FATE_CTX: null,              // the death/fate context
  LEVELUP: null,               // the in-app level-up choice picker (docs/ADVANCEMENT.md)
  SEED: null,                  // world-genesis seed (the ritual)
  ORC: { q: "", last: null },  // the Oracle tab state
  dm: { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false, streamTimer: null },  // DM Bridge turn/response (docs/DM-BRIDGE.md); animate = stream the next DM reply word-by-word
  gamePanel: null,             // chat-first World view: which side panel is open (null = Story/chat only) — NEW-GAME-FLOW §9
  charTab: "sheet",            // Character panel active tab: sheet | inventory | history (docs/IN-SESSION-UI.md §5a)
  actionsTab: "actions",       // Actions panel active tab: actions | abilities | spells (§5b)
  menuOpen: false,             // the ⚙ Menu overflow popover open/closed (§6)
  ledgerDM: false,             // Character › History: DM-view (all entries) vs player-visible slice
  sheetCollapse: { saves: false, skills: false },  // Character › Sheet collapsible sections (mockup <details>); false = OPEN
  waking: false,               // true during the bardo→play fade ("waking" cinematic)
  wakePrep: false,             // true while the prep/loading screen is up, waiting on the DM's opening words
  activeShopId: null,          // the open merchant's w.shops id (docs/SHOP-UI.md §1); GS.gamePanel==='shop' renders it
  shopTab: "buy",              // shop panel active tab: buy | sell (§3 Ruling 1)
  shopSel: null,                // confirm-on-plaque selection: {kind:"buy"|"sell", key} (§3 Ruling 2)
  prevPanel: undefined,         // COMBAT-TRACKER §1/G7: the panel to restore once a live fight ends (undefined = not mid-fight)
  chase: null,                  // GAP-WIRING (docs/TABLE-GAPS-070126.md §1): the transient chase gap-clock, created/cleared by world.dm's chase_start/chase_round/chase_yield (mirrors the dynamic GS.combat lifecycle)
  cmbLastStates: null,          // BATTLE-VISUALS A3: previous combatPanel render's {fid: stateWord} map, for the damage-flash diff
  cmbDioramaOpen: false,         // BATTLE-VISUALS A1: the "⌗ diorama" toggle — collapsed by default until Phase B (BATTLE-THEATER) replaces the slot
  theaterMounted: false          // BATTLE-STAGE (docs/BATTLE-THEATER.md §6): true once window.Theater.mount() has succeeded for the CURRENT fight — gates the stage-mode layout swap (feed moves to the right rail, the theater canvas + zone strip take the center). Reset to false on combat_end so the next fight re-attempts mount.
};
