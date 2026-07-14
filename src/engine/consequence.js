/* GENESIS MODULE — src/engine/consequence.js — the Consequence-Ladder RESOLVER (docs/CONSEQUENCE-LADDER.md).
   Classic <script>, shared global scope. Registered in manifest.json; validated by build/check-manifest.py.
   Reads the compiled tables (window.GENESIS_TABLES) at call time for effect pools — MUST load after engine.compiled.

   PURE + DETERMINISTIC (mirrors engine.social). Every function takes plain values and RETURNS A DESCRIPTOR /
   PAYLOAD — it never reads or writes the world/codex. The wiring layer (applyEvent) calls these, then commits
   via codex/ledger events. The model (docs/CONSEQUENCE-LADDER.md): a flavor roll's `legs` routes the
   consequence (NOT its band — band sets *intensity*); the `pool` archetype routes the effect die; resolution
   is latent → bind-first → roll-on-miss. Invention captured, never free-floating (DM-CHARTER §8.5).
   All internals `cl`/`CL_`-prefixed. */

/* §2/§3 — the legs ladder: story-potential → what it plants + its sink. Consequence routes on LEGS, not band.
   `store` = "eligible to store IF the player engages" (storage is interaction-gated, §5 — the wiring layer
   supplies the engagement; dead-end is never stored: narrated and forgotten). */
const CL_LEGS = {
  "dead-end":    { store:false, sink:null,    opensThread:false, clock:false },
  "hook":        { store:true,  sink:"handle", opensThread:false, clock:false },
  "thread-seed": { store:true,  sink:"thread", opensThread:true,  clock:true  },
  "canon-shift": { store:true,  sink:"canon",  opensThread:true,  clock:false },
};

/* §4 — band → clock/effect INTENSITY. Band sets how hard reality bends when a thread fires, NOT whether the
   thread/clock exists (that's `legs`). A Strange-band thread-seed runs a Strange-intensity clock. */
const CL_BAND_INTENSITY = { Grounded:0, Textured:1, Strange:2, Volatile:3, Mythic:4 };

/* §8 — the effect-pool registry (archetype → compiled table id). PLUGGABLE: register a pool by adding a line.
   A null entry (pool authored later) degrades gracefully — clResolveEffect returns null, so the DM / an
   on-the-fly die handles it (DM-CHARTER §8.5) until the pooled floor is authored. */
const CL_POOLS = {
  Watcher:   "watcher-effect-pool",
  Passage:   null,
  Oracle:    null,
  Omen:      null,
  Predation: null,
  Containment: null,
  Identity:  null,
};

/* §3 — classify a tagged roll into a consequence descriptor. spec = {legs, band, pool} (e.g. straight off
   rollTable's new legs/pool fields). Returns the sink + whether a thread/clock opens + the band-intensity. */
function consequenceFor(spec){
  spec = spec || {};
  const legs = String(spec.legs || "dead-end");
  const rule = CL_LEGS[legs] || CL_LEGS["dead-end"];
  const band = spec.band || "";
  const intensity = (CL_BAND_INTENSITY[band] != null) ? CL_BAND_INTENSITY[band] : 0;
  const pool = spec.pool || "";
  return {
    legs, band, pool,
    store:       rule.store,        // eligible to store IF the player engages (§5, interaction-gated)
    sink:        rule.sink,         // null | "handle" | "thread" | "canon"
    opensThread: rule.opensThread,  // a thread-seed/canon-shift may open a persistent thread...
    clock:       rule.clock,        // ...a thread carries a clock...
    intensity,                      // ...whose intensity = band (§4)
    hasPool:     !!(pool && CL_POOLS[pool]),  // is a pooled effect die authored for this archetype yet?
  };
}

/* §8/§6 — resolve the effect die for a pool. `dieTotal` = the PLAYER's open roll (§6 — the effect die is a
   player roll); if omitted, rolls it. Returns {pool, table, roll, nature, use, tell, escalation, raw} or
   null when the pool has no table yet (→ caller falls back to DM / on-the-fly generation). */
function clResolveEffect(pool, dieTotal){
  const id = CL_POOLS[pool];
  if (!id) return null;
  const pt = (typeof window !== "undefined" && window.GENESIS_TABLES) ? window.GENESIS_TABLES[id] : null;
  if (!pt || !pt.rows || !pt.rows.length) return null;
  let total = Number(dieTotal);
  if (!Number.isFinite(total)) total = (typeof rollExpr === "function") ? rollExpr(pt.dice || ("d"+(pt.die||8))) : 1;
  const row = pt.rows.find(r => total >= r[0] && total <= r[1]) || pt.rows[pt.rows.length-1];
  const parsed = clParsePoolRow(row[5] || []);
  return Object.assign({ pool, table:id, roll:total, raw:(row[5]||[]) }, parsed);
}

/* §8 — resolve a CAPTURED bespoke die (the prep-time / on-the-fly generated die, stored on the codex
   entry as `source:{type:"effect-die"}`). Rows are structured objects {lo,hi,nature,use,tell,escalation}
   (the AI emits JSON; captured to canon — DM-CHARTER §8.5). Takes precedence over the pooled exemplar.
   Returns the same payload shape as clResolveEffect, or null. PURE. */
function clResolveStoredEffect(die, dieTotal){
  if (!die || !Array.isArray(die.rows) || !die.rows.length) return null;
  let total = Number(dieTotal);
  if (!Number.isFinite(total)) total = (typeof rollExpr === "function") ? rollExpr(die.dice || ("d"+die.rows.length)) : 1;
  const lo = (r)=> (r.lo != null ? r.lo : r[0]), hi = (r)=> (r.hi != null ? r.hi : r[1]);
  const row = die.rows.find(r => total >= lo(r) && total <= hi(r)) || die.rows[die.rows.length-1];
  return { pool:die.pool || "bespoke", table:die.id || "effect-die", roll:total, source:"captured",
           nature:row.nature||"", use:row.use||"", tell:row.tell||"", escalation:row.escalation||"" };
}

/* parse a Hungering-Stone-shaped effect row (cols: Nature | Player Use | The "Tell" | Escalation Threshold). */
function clParsePoolRow(cells){
  cells = cells || [];
  return { nature:cells[0]||"", use:cells[1]||"", tell:cells[2]||"", escalation:cells[3]||"" };
}

/* §4/§7 — bind-first: choose an EXISTING thread to attach to (reincorporation / loop-back), else null →
   roll-on-miss. PURE: the wiring layer gathers candidate threads from the world (active fronts / open codex
   handles) and passes them in; this scores by shared seed tags (+ the seed's pool) and prefers a live front.
   Relevance is the known-hard part (the success-payout-binding open item) — this is an honest MVP heuristic. */
function clBindFirst(candidates, seed){
  candidates = candidates || [];
  if (!candidates.length) return null;
  seed = seed || {};
  const seedTags = (seed.tags || []).map(s => String(s).toLowerCase());
  const seedPool = String(seed.pool || "").toLowerCase();
  let best = null, bestScore = 0;
  for (const c of candidates){
    const tags = ((c && c.tags) || []).map(s => String(s).toLowerCase());
    let score = 0;
    if (seedPool && tags.includes(seedPool)) score += 2;
    for (const t of seedTags) if (tags.includes(t)) score += 1;
    if (c && c.active) score += 0.5;       // prefer a live front
    if (score > bestScore){ bestScore = score; best = c; }
  }
  return bestScore > 0 ? best : null;       // no relevant candidate → roll-on-miss
}

/* §8/§13 — roll-on-miss plan: names which generator the wiring layer mints from when bind-first finds nothing,
   seeded by the pool. Actual minting + codex capture (provenance: "rolled-at-resolution") is the wiring layer's
   job (deferred per §12). Returns a plan descriptor, not a mutation. */
function clOnMissPlan(pool){
  return { generator:"rollQuestHook", seededBy:pool || "", provenance:"rolled-at-resolution",
           note:"mint soft, bind to the active thread/front, capture to codex" };
}
