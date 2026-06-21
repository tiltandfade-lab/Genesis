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
  SEED: null,                  // world-genesis seed (the ritual)
  ORC: { q: "", last: null },  // the Oracle tab state
  dm: { turnId: null, pending: false, poll: null, rollReq: null, ask: null }  // DM Bridge turn/response (docs/DM-BRIDGE.md)
};
