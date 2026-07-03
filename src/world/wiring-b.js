/* GENESIS MODULE — src/world/wiring-b.js — WIRING-SWEEP-B (docs/WIRING-MAP.md §B Wave B,
   docs/BATCH3-PLAN.md unit 11, docs/BATCH3-GUARDRAILS.md J1 "wiring-sweep-B"). Classic <script>,
   shared global scope. Registered in manifest.json; validated by build/check-manifest.py.

   The Wave-B wire-in queue + the §B RECONCILES + the ADAM-REVIEW-1 absorptions that name this unit
   (§1 Place-Drift Effect executors; the region name-per-world generator lives in engine.region
   instead — same file as regionEnsure, see that module's §1b; the dwalkCoin 1gp-minimum retune
   lives in engine.dungeon-walk itself, next to dwalkCoinRoll — both are call-site-adjacent edits,
   not new machinery, so neither duplicates into this file).

   §1 PLACE-DRIFT EFFECT EXECUTORS (ADAM-REVIEW-1 §1) — applyDriftEffect(w, roll, nodeId) dispatches
      on the compiled place-drift row's 4th cell (the `Effect` tag column, closed vocabulary:
      clock±/npc-swap/thread/price±/stock/contact/festival/board/rep/codex-only/none) to the SAME
      executors every other system already exposes — never a new mutator. Each executor is a pure
      best-effort nudge (never blocks/replaces the drift ledger line turnDriftOnRevisit already
      writes — this is an ADDITIONAL mechanical tick riding the same roll, not a second drift system).

   §2 PUZZLE CHAIN — puzzleChainRoll() rolls the 4-table chain (puzzle-type -> -mechanism ->
      -solution-path -> -failsafe) as ONE bundled puzzle object for dungeon-walk.js's existing
      Problem/Lock branch (dwalkEncounter) to attach alongside dungeon-problem's flavor line —
      additive, never replaces the existing obstacle/bypass text.

   §3 DISPATCH MAP COMPLETION — urban-background-event (the walk-ambience lane the WIRING-MAP names
      as the trio's third leg, distinct from urban-catalyst/-spectacle which are already wired) —
      urbanBackgroundEventRoll(), chance-gated, called from engine.walk's per-segment assembly.

   §4 DISTRICT SKIN — districtSkinRoll() rolls urban-environment-skin as the DISTRICT's atmosphere
      line (distinct jurisdiction from the WALK skin urban-environment-skin already serves at
      walk.js:424 — WIRING-MAP item 13's collision resolution: "walk-skin owns the walk,
      environment-skin owns the district"), called once by world.urban's mintDistricts per district.

   §5 PLACE-* DEPTH (dedupe'd) — placeNearbyRoll/placeRaceRelationsRoll/placeRuler StatusRoll wired
      as world-genesis DEPTH fields alongside the STATIC bardo "nearby" triad (data/world-tables.js'
      T.nearby is a SEPARATE inline mirror, never touched — see §5's header note for the dedupe
      reasoning) — placeDepthRoll(w) bundles all three as one additive "deep facts" reveal for
      Session-Prep to surface once per world, never replacing the char-genesis hometown beats.

   §6 SUPERNATURAL BLESSING/CHARM — the reward-currency lane: blessingOrCharmRoll(kind) rolls
      supernatural-blessing/-charm as a boon payload shaped for item_changed's add[] (mirrors
      dwalkValuable's shape convention) for a consequence-sink caller to grant.

   §7 WILDERNESS ART/MAGIC PARITY — wwalkActiveMagicRoll()/wwalkArtRoll() give wilderness legs the
      same active-magic-zone + art-encounter texture urban/dungeon already carry (dungeon-art-motif,
      urban-art-motif) — called from engine.wild-walk's per-leg assembly, chance-gated same as every
      other ambient wilderness lane (wilderness-survival-constraint's own 0.35 convention).

   §8 EMPTY-RESULT TEXTURE — dwalkEmptyTexture() rides ALONGSIDE dungeon-empty-result (never
      replaces it): a chance-gated extra junk/trinket/furnishing find so an "Empty" dungeon-walk
      result still yields texture, matching WIRING-MAP item 17's framing ("empty rooms yield
      texture, not nothing").

   §9 CAMP-COOKING — campCookingRoll() rolls camp-cooking-complications + cuisine-effects as one
      downtime/rest-adjacent beat, called from world.play's passTime for a NON-inhabited (wilderness/
      camp) rest — the inhabited-node rest already has the tavern/lodging surface; camp cooking is
      specifically the "cooking over a fire in the open" texture lodging doesn't cover.

   §10 DOOR/EXIT DRESSING — dwalkDoorRoll() rolls dungeon-door-type + dungeon-door-state as one
      per-exit dressing pair for dungeon-walk.js's room `exits[]` array (doors ARE the edges per
      that file's own header comment) — additive segment dressing, same posture as every other
      *-flavor field already on a room/exit.

   NULL-SAFE throughout (matches WIRING-A/GAP-WIRING/WORLD-TURN convention): every rollTable() call
   degrades to a logged no-op / flagged null if a table isn't compiled — never a fabricated result.

   Reads rollTable (engine.compiled), rollDie/pick (engine.core), addLedger/clockOf/nodeName/mapOf
   (world.state), codexOf/codexAdd/codexUpdate/codexGet (world.codex), regionPeekNode/regionEconBump/
   regionClampTier (engine.region), jobBoardRead (world.job-walks), festivalRoll (world.gap-wiring),
   rollNPC (engine.codex-roll) at call-time — all null-safe degrades. regionPeekNode is READ-ONLY —
   never regionForNode here, so a passive drift roll never mints a region / writes a surprise canon
   ledger line as a side effect (matches play.js's lodging convention). */

/* ============================================================================
   §1 — PLACE-DRIFT EFFECT EXECUTORS (ADAM-REVIEW-1 §1)
   ============================================================================ */

/* clock± — bump the world's DOMINANT faction's agenda clock by 1 (capped at size). Factions aren't
   node-bound in this codebase (verified — no per-node faction link exists anywhere); "the dominant
   power's agenda progresses while you were elsewhere" is the existing capChooseCaptor precedent
   (world.capture: ranked-by-clock-fill, else dominant, else first) reused verbatim for "which
   faction" rather than inventing a new node→faction heuristic. No factions yet -> no-op. */
function driftEffectClock(w){
  const facs=w.factions||[]; if(!facs.length) return {applied:false};
  const ratio=f=>{ const c=f.clock||{}; return c.size?(c.filled||0)/c.size:0; };
  const ranked=facs.slice().sort((a,b)=>ratio(b)-ratio(a));
  const f=ranked.find(x=>ratio(x)>0)||facs.find(x=>x.dominant)||ranked[0];
  if(!f||!f.clock) return {applied:false};
  f.clock.filled=Math.min(f.clock.size,(f.clock.filled||0)+1);
  return {applied:true, faction:f.name, filled:f.clock.filled, size:f.clock.size};
}

/* npc-swap — the location's owner NPC (nodeOwnerAttitude's target, if one is minted+known there)
   gets a life-event roll (turnLifeEvent, world-turn's own npc-life-event mechanism — reused, not
   duplicated); no eligible NPC -> no-op (never invents a successor out of nothing). */
function driftEffectNpcSwap(w, nodeId){
  if(typeof turnLifeEvent!=="function") return {applied:false, reason:"no-turn-life-event"};
  const out=turnLifeEvent(w, nodeId);
  return out ? {applied:true, event:out} : {applied:false};
}

/* thread — flags the drift roll's OWN just-written ledger entry as needsEffectDie (Strange+ rows
   per ADAM-REVIEW-1 §1: "Strange rows also flag needsEffectDie") so a future gen-loop consumer can
   attach a real effect die; never invents the die itself here (that's ON-DEMAND-GEN's own lane). */
function driftEffectThread(entry){
  if(entry && entry.data) entry.data.needsEffectDie=true;
  return {applied:!!entry};
}

/* price±/stock — the existing REGION econTilt (regionEconBump's existing +/-1 bounded nudge) is the
   only mutable per-place economy lever this codebase carries (no per-node tilt field exists — G9:
   never invent one). The tag itself (`price±`) is direction-AGNOSTIC by design — it does not encode
   which way a given row moved (row 1 "prices crept up," row 60 "a craft fell out of fashion" both
   carry the SAME tag) and inferring direction from the row's free prose would be exactly the kind
   of guessed heuristic G9 forbids (a prior draft tried a `/down/i` text regex here; it silently
   mis-signed most rows, since neither table nor its own prose encodes direction as a parseable
   word — removed). So: every `price±`/`stock` row nudges the containing region's econTilt by the
   SAME bounded +1 (never a guessed sign) — "the place's economy is visibly, mechanically in motion"
   is the honest fact this tag can carry; which direction is DM-narrated straight from the row text,
   same as every other flavor field in this codebase. No region yet (node uncharted) -> no-op. */
function driftEffectEconTilt(w, nodeId){
  const region=(typeof regionPeekNode==="function") ? regionPeekNode(w, nodeId) : null;
  if(!region || !region.vector) return {applied:false, reason:"no-region"};
  const cur=region.vector.econTilt||0;
  region.vector.econTilt=Math.min(2,cur+1);
  return {applied:true, econTilt:region.vector.econTilt};
}

/* contact — mint a fresh ambient ★ ○ ○-style NPC soft at the node via the SAME rollNPC path
   buildingApproach/prepCastAmbient already use (never a bespoke mint) — "a new face is here now"
   (new tenant/traveling merchant/faction recruiter/etc). No codexAdd/rollNPC available -> no-op. */
function driftEffectContact(w, nodeId){
  if(typeof rollNPC!=="function" || typeof codexAdd!=="function") return {applied:false};
  const region=(typeof regionPeekNode==="function") ? regionPeekNode(w, nodeId) : null;
  const payload=rollNPC({ region });
  const rec=codexAdd(w, Object.assign({}, payload, { status:Object.assign({soft:true, at:nodeId}, payload.status||{}) }));
  return rec ? {applied:true, id:rec.id, name:rec.name} : {applied:false};
}

/* festival — chain-roll a Festival (gap-wiring's existing festivalRoll — no new mechanism); the
   drift row's own Textured+ band already satisfies festivalEligibleFromDrift's gate (this executor
   only fires for rows explicitly tagged `festival`, so no separate eligibility re-check is needed
   here — the tag pass already encodes it). */
function driftEffectFestival(w){
  const f=(typeof festivalRoll==="function") ? festivalRoll(w) : null;
  return f ? {applied:true, festival:f} : {applied:false};
}

/* board — refresh the job board (a fresh jobBoardRead — "the notice board's been repainted and
   refilled" IS a board refresh) — reuses world.job-walks' existing read path verbatim. */
function driftEffectBoard(w, nodeId){
  if(typeof jobBoardRead!=="function") return {applied:false};
  const region=(typeof regionPeekNode==="function") ? regionPeekNode(w, nodeId) : null;
  const posted=jobBoardRead(w, {region});
  return {applied:true, posted:(posted||[]).length};
}

/* rep — row 13's "a rumor about you" (the Distant-Word lens pointed at yourself, per ADAM-REVIEW-1
   §1's own gloss) surfaces via gap-wiring's distantWordRoll pointed at the PC's own recent ledger
   trail — never a score mutation (row 79, "a renown consumer," READS existing standing rather than
   writing it, so it needs no executor at all — the DM narrates it straight from repuStandingWord). */
function driftEffectRep(w){
  const d=(typeof distantWordRoll==="function") ? distantWordRoll(w, {}) : null;
  return d ? {applied:true, distantWord:d} : {applied:false};
}

/* codex-only/none — no mechanical tick; the drift ledger line IS the whole effect (the DM narrates
   from the row text directly). Present as explicit no-ops so the dispatcher's vocabulary is total
   (every tag has a handler, even the ones that do nothing) rather than silently falling through. */
function driftEffectCodexOnly(){ return {applied:false, reason:"codex-only"}; }
function driftEffectNone(){ return {applied:false, reason:"none"}; }

/* applyDriftEffect(w, roll, nodeId, entry) -> {tag, ...executor result}. `roll` is the raw rollTable
   result for place-drift (roll.cells[3] is the Effect tag); `entry` is the ledger entry
   turnDriftOnRevisit just wrote for this same roll (needed by the `thread` executor to flag it).
   Unknown/missing tag -> codex-only-equivalent no-op (never guesses a mechanism for an unrecognized
   tag — G9). NULL-SAFE: a table without the Effect column (roll.cells.length<4) degrades the same way. */
function applyDriftEffect(w, roll, nodeId, entry){
  const tag=(roll && roll.cells && roll.cells[3]) ? roll.cells[3].trim() : null;
  let out;
  switch(tag){
    case "clock±":     out=driftEffectClock(w); break;
    case "npc-swap":   out=driftEffectNpcSwap(w, nodeId); break;
    case "thread":     out=driftEffectThread(entry); break;
    case "price±":     out=driftEffectEconTilt(w, nodeId); break;
    case "stock":      out=driftEffectEconTilt(w, nodeId); break;
    case "contact":    out=driftEffectContact(w, nodeId); break;
    case "festival":   out=driftEffectFestival(w); break;
    case "board":      out=driftEffectBoard(w, nodeId); break;
    case "rep":        out=driftEffectRep(w); break;
    case "codex-only": out=driftEffectCodexOnly(); break;
    default:           out=driftEffectNone(); break;
  }
  return Object.assign({tag:tag||"none"}, out);
}

/* ============================================================================
   §2 — PUZZLE CHAIN: puzzle-type -> -mechanism -> -solution-path -> -failsafe
   ============================================================================ */

/* puzzleChainRoll() — one bundled puzzle for a dungeon Problem/Lock segment (dwalkEncounter's
   existing branch). Returns {type:{name,desc}, mechanism:{setup,locked,failConsequence},
   solutionPath:{path,skillDc}, failsafe:{name,desc}} or null if puzzle-type isn't compiled (the
   other three degrade independently — a chain missing its later legs still returns what it has,
   since each table is authored standalone and none is a hard prerequisite of another at the data
   layer, even though they read as one chain in play). */
function puzzleChainRoll(){
  if(typeof rollTable!=="function") return null;
  const t=rollTable("puzzle-type"); if(!t) { console.warn("[wiring-b] puzzle-type not compiled — puzzle chain skipped (null-safe)"); return null; }
  const tc=t.cells||[];
  const out={ type:{ name:tc[1]||t.text||"", desc:tc[2]||"" } };
  const m=rollTable("puzzle-mechanism");
  if(m){ const mc=m.cells||[]; out.mechanism={ setup:mc[1]||"", locked:mc[2]||"", failConsequence:mc[3]||"" }; }
  const s=rollTable("puzzle-solution-path");
  if(s){ const sc=s.cells||[]; out.solutionPath={ path:sc[1]||"", skillDc:sc[2]||"" }; }
  const f=rollTable("puzzle-failsafe");
  if(f){ const fc=f.cells||[]; out.failsafe={ name:fc[1]||f.text||"", desc:fc[2]||"" }; }
  return out;
}

/* ============================================================================
   §3 — DISPATCH MAP COMPLETION: urban-background-event (the walk-ambience leg)
   ============================================================================ */

const URBAN_BACKGROUND_EVENT_CHANCE = 0.35;   // matches TAVERN_ENCOUNTER_CHANCE's ambient-lane convention

/* urbanBackgroundEventRoll() — chance-gated ambient street-life beat for a urban walk segment
   (distinct from urban-catalyst [plot ignition, already wired at rollUrbanWalk's Rumor branch] and
   urban-spectacle [the Spectacle branch's own dedicated roll] — this is the THIRD, undirected leg
   the WIRING-MAP dispatch map names: background-event = ambience, not plot, not a set-piece). */
function urbanBackgroundEventRoll(){
  if(Math.random()>=URBAN_BACKGROUND_EVENT_CHANCE) return null;
  const roll=(typeof rollTable==="function") ? rollTable("urban-background-event") : null;
  if(!roll){ console.warn("[wiring-b] urban-background-event not compiled — ambient beat skipped (null-safe)"); return null; }
  return { text:roll.text, band:roll.band };
}

/* ============================================================================
   §4 — DISTRICT SKIN: urban-environment-skin as the district's atmosphere line
   ============================================================================ */

/* districtSkinRoll() — ONE urban-environment-skin roll for a district's atmosphere (WIRING-MAP item
   13's collision resolution: walk-skin owns the WALK, environment-skin ALSO serves the DISTRICT —
   two different jurisdictions rolling the same table is intentional per that ruling, not a dupe
   bug). Called once per district at mint time (world.urban's mintDistricts). */
function districtSkinRoll(){
  const roll=(typeof rollTable==="function") ? rollTable("urban-environment-skin") : null;
  if(!roll){ console.warn("[wiring-b] urban-environment-skin not compiled — district skin skipped (null-safe)"); return null; }
  const c=roll.cells||[];
  return { name:c[1]||roll.text||"", visual:c[2]||null, band:roll.band };
}

/* ============================================================================
   §5 — PLACE-* DEPTH (dedupe'd against the Starting-State suite + Region Identity)
   ============================================================================
   DEDUPE NOTE (WIRING-MAP item 14): data/world-tables.js' T.nearby (the char-genesis "nearby" world
   beat, bardo.js) is a SEPARATE inline mirror table with its OWN 100 rows (row 1: "The Tithe-Barn"),
   rolled once per soul at character creation — it is NOT the same table as place-nearby (row 1 also
   "The Tithe-Barn: A massive timber structure..." — genuinely overlapping content, confirmed by
   direct row comparison). Rather than wire place-nearby onto the SAME beat (a silent duplicate roll
   with near-identical output) or retire either (T.nearby is load-bearing char-genesis content; Adam
   never asked for its removal), place-nearby/-race-relations/-ruler-status are wired as a SEPARATE,
   ADDITIVE world-genesis DEPTH layer — placeDepthRoll(w), called ONCE per world (world-gen's own
   bindWorld, mirroring how region-identity/place-mythology are both already once-per-scope rolls)
   — never re-fired, never presented as a second "nearby" pick alongside the bardo triad. */
function placeNearbyRoll(){
  const roll=(typeof rollTable==="function") ? rollTable("place-nearby") : null;
  if(!roll){ console.warn("[wiring-b] place-nearby not compiled — depth roll skipped (null-safe)"); return null; }
  return { text:roll.text, band:roll.band };
}
function placeRaceRelationsRoll(){
  const roll=(typeof rollTable==="function") ? rollTable("place-race-relations") : null;
  if(!roll){ console.warn("[wiring-b] place-race-relations not compiled — depth roll skipped (null-safe)"); return null; }
  return { text:roll.text, band:roll.band };
}
function placeRulerStatusRoll(){
  const roll=(typeof rollTable==="function") ? rollTable("place-ruler-status") : null;
  if(!roll){ console.warn("[wiring-b] place-ruler-status not compiled — depth roll skipped (null-safe)"); return null; }
  return { text:roll.text, band:roll.band };
}
/* placeDepthRoll(w) — bundles the three depth rolls ONCE per world, write-once on w.placeDepth
   (mirrors region-identity's write-once-canon posture). Idempotent: a second call returns the
   cached bundle, never re-rolls. */
function placeDepthRoll(w){
  if(!w) return null;
  if(w.placeDepth) return w.placeDepth;
  const bundle={ nearby:placeNearbyRoll(), raceRelations:placeRaceRelationsRoll(), rulerStatus:placeRulerStatusRoll() };
  w.placeDepth=bundle;
  return bundle;
}

/* ============================================================================
   §6 — SUPERNATURAL BLESSING/CHARM: the reward-currency lane
   ============================================================================ */

/* blessingOrCharmRoll(kind) — kind: "blessing"|"charm". Returns an item_changed-ready boon shape
   {name, desc, kind} (mirrors dwalkValuable's name/value/note convention, minus a gp value — these
   are narrative/mechanical boons, not sellable valuables) or null (uncompiled table). */
function blessingOrCharmRoll(kind){
  const id = kind==="charm" ? "supernatural-charm" : "supernatural-blessing";
  const roll=(typeof rollTable==="function") ? rollTable(id) : null;
  if(!roll){ console.warn("[wiring-b] "+id+" not compiled — boon roll skipped (null-safe)"); return null; }
  const c=roll.cells||[];
  return { name:c[1]||roll.text||"", desc:c[2]||"", kind };
}

/* ============================================================================
   §7 — WILDERNESS ART/MAGIC PARITY
   ============================================================================ */

const WILDERNESS_AMBIENT_CHANCE = 0.35;   // matches wilderness-survival-constraint's own ambient gate

/* wwalkActiveMagicRoll() — chance-gated wilderness-active-magic zone texture for a leg (parity with
   dungeon-walk's art-motif lane and urban's own — wilderness had no equivalent "something's here"
   ambient-magic texture before this unit). */
function wwalkActiveMagicRoll(){
  if(Math.random()>=WILDERNESS_AMBIENT_CHANCE) return null;
  const roll=(typeof rollTable==="function") ? rollTable("wilderness-active-magic") : null;
  if(!roll){ console.warn("[wiring-b] wilderness-active-magic not compiled — magic zone skipped (null-safe)"); return null; }
  return { text:roll.text, band:roll.band };
}
/* wwalkArtRoll() — chance-gated wilderness-art find for a leg (parity with dungeon-art-motif/
   urban-art-motif, which both roll unconditionally at walk-assembly — wilderness's art suite is a
   FIND, not a per-walk motif, so it's chance-gated instead of guaranteed, matching its own table's
   framing as an encountered artifact rather than a pervasive decorative theme). */
function wwalkArtRoll(){
  if(Math.random()>=WILDERNESS_AMBIENT_CHANCE) return null;
  const roll=(typeof rollTable==="function") ? rollTable("wilderness-art") : null;
  if(!roll){ console.warn("[wiring-b] wilderness-art not compiled — art find skipped (null-safe)"); return null; }
  return { text:roll.text, band:roll.band };
}

/* ============================================================================
   §8 — EMPTY-RESULT TEXTURE: junk/trinket/furnishing rides alongside dungeon-empty-result
   ============================================================================ */

const EMPTY_TEXTURE_CHANCE = 0.5;   // "empty rooms yield texture, not nothing" — coin-flip, not guaranteed

/* dwalkEmptyTexture() — a chance-gated extra find (dungeon-loot-junk OR trinket-table, picked
   50/50) riding ALONGSIDE dungeon-empty-result's existing negative-flavor roll (dwalkEncounter's
   fallthrough branch) — never replaces it. Returns {kind:"junk"|"trinket", name, desc} or null
   (chance missed, or neither table compiled). */
function dwalkEmptyTexture(){
  if(Math.random()>=EMPTY_TEXTURE_CHANCE) return null;
  if(typeof rollTable!=="function") return null;
  if(Math.random()<0.5){
    const j=rollTable("dungeon-loot-junk");
    if(j){ const c=j.cells||[]; return { kind:"junk", name:c[0]||j.text||"", desc:c[1]||"" }; }
  }
  const t=rollTable("trinket-table");
  if(t) return { kind:"trinket", name:t.text||"", desc:"" };
  console.warn("[wiring-b] dungeon-loot-junk/trinket-table not compiled — empty texture skipped (null-safe)");
  return null;
}

/* ============================================================================
   §9 — CAMP-COOKING: downtime/rest beat for a NON-inhabited rest
   ============================================================================ */

/* campCookingRoll() — one camp-cooking-complications roll + its paired cuisine-effects roll (the
   COOK's own skill/luck outcome), for a rest taken away from a settled node (world.play's passTime,
   the branch where nodeInhabited is false — the tavern/lodging surface already covers inhabited
   rests, so this is specifically the open-camp texture that lane doesn't reach). Returns
   {complication, effect} — either half null if its table isn't compiled (independent degrade). */
function campCookingRoll(){
  const comp=(typeof rollTable==="function") ? rollTable("camp-cooking-complications") : null;
  const eff=(typeof rollTable==="function") ? rollTable("cuisine-effects") : null;
  if(!comp) console.warn("[wiring-b] camp-cooking-complications not compiled — camp beat skipped (null-safe)");
  if(!eff) console.warn("[wiring-b] cuisine-effects not compiled — cuisine beat skipped (null-safe)");
  return { complication:comp?{text:comp.text,band:comp.band}:null, effect:eff?{text:eff.text,band:eff.band}:null };
}

/* ============================================================================
   §10 — DOOR/EXIT DRESSING
   ============================================================================ */

/* dwalkDoorRoll() — one dungeon-door-type + dungeon-door-state pair for a room's exit ("doors ARE
   the edges" per dungeon-walk.js's own header comment) — additive dressing alongside the exit's
   existing {targetId,num,label,isFinale} shape. Returns {type:{name,desc}, state:{name,desc}} (each
   half independently null-safe if its table isn't compiled). */
function dwalkDoorRoll(){
  const t=(typeof rollTable==="function") ? rollTable("dungeon-door-type") : null;
  const s=(typeof rollTable==="function") ? rollTable("dungeon-door-state") : null;
  if(!t) console.warn("[wiring-b] dungeon-door-type not compiled — door dressing skipped (null-safe)");
  if(!s) console.warn("[wiring-b] dungeon-door-state not compiled — door dressing skipped (null-safe)");
  const tc=t?(t.cells||[]):[], sc=s?(s.cells||[]):[];
  return {
    type:  t?{ name:tc[0]||t.text||"", desc:tc[1]||"" }:null,
    state: s?{ name:sc[0]||s.text||"", desc:sc[1]||"" }:null,
  };
}
