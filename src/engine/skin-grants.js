/* GENESIS MODULE — src/engine/skin-grants.js — skin grants + motif pervasion (docs/SKIN-GRANTS.md)
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.
   MUST load after src/engine/dungeon-walk.js (dwalkLootSlot/dwalkValuable), src/engine/codex-roll.js
   (rollNPC/rollItem), src/world/codex.js (codexAdd), data/skin-motifs.js (SKIN_MOTIF_KITS), and
   src/engine/walk.js (walkRnd et al) — all calls are typeof-guarded so a lean/headless load order
   that omits any of them degrades to a no-op rather than throwing (BATCH-GUARDRAILS G9 discipline).

   §1 THE CONTRACT (SKIN-GRANTS.md): a skin's promise is a debt the assembler pays through rolled
   machinery, never freehand. `applySkinGrants(walk, skin, w)` runs AFTER base walk assembly and
   mutates the walk deterministically per the skin's `grants` (comma-separated closed vocabulary) +
   `motif` (one of 14 kits, data/skin-motifs.js). `w` is OPTIONAL — grants that would touch live world
   state (faction-mark, clock, captive's codex mint) degrade gracefully to a walk-local placement when
   no world is passed (a headless/lean caller), never inventing a fact.

   Table-dependent: `skin.grants`/`skin.motif` come from rollTable's row[8]/row[9] (SKIN-GRANTS §1/§1b),
   present only once the three Walk Skin tables carry the Grants/Motif columns. Until compiled, both
   are "" — applySkinGrants no-ops entirely (NULL-SAFE, per BATCH-GUARDRAILS: ships now, activates the
   moment the table pass lands — which this same unit's build step 5 lands together, so it's live). */

const SKIN_GRANT_TOKENS = ["hoard","captive","faction-mark","threat-bias","hazard-suffuse","density","relic","clock"];

/* parse "faction-mark,density:+" -> [{token:"faction-mark",arg:null},{token:"density",arg:"+"}].
   Unknown tokens are KEPT in the parsed list (so callers can log+no-op per token) rather than dropped
   silently — SKIN-GRANTS §1's "unknown grant token → log + no-op (forward-compatible)". */
function skinParseGrants(grantsStr){
  return (grantsStr||"").split(",").map(s=>s.trim()).filter(Boolean).map(tok=>{
    const i=tok.indexOf(":");
    return i<0 ? {token:tok, arg:null} : {token:tok.slice(0,i), arg:tok.slice(i+1)};
  });
}

// ─── segment helpers (shared by several executors) ───────────────────────────
function skinSegments(walk){ return walk && Array.isArray(walk.segments) ? walk.segments : []; }
function skinDepthOf(seg, idx){ return (typeof seg.depth==="number") ? seg.depth : idx; }
function skinIsEnemySeg(seg){ return !!(seg.encounter && seg.encounter.isEnemy); }
function skinMidDeepIndex(segs){
  // depth >= ceil(segCount/2), per BATCH3-GUARDRAILS J2 ("captive places at depth >= ceil(segCount/2)")
  const n=segs.length; const minDepth=Math.ceil(n/2);
  const eligible=segs.map((s,i)=>({s,i})).filter(({s,i})=>skinDepthOf(s,i)>=minDepth && !s.isFinale);
  return eligible.length ? eligible[eligible.length-1].i : Math.max(0, n-1);
}

// ─── the eight grant executors (SKIN-GRANTS.md §1 closed vocabulary) ─────────

/* hoard: upgrade one segment's loot slot — +1 rarity step, capped at the TIER CEILING (BATCH3-
   GUARDRAILS J2: "hoard upgrade = +1 rarity step, capped at the tier ceiling" — T1's dwalkBudget
   never grants veryRare, so a T1 walk's ceiling is "rare"; T2's ceiling is "very-rare"). Placed
   ON/ADJACENT to an Enemy segment (guarded by construction); falls back to the finale/last segment
   if no Enemy segment exists (still a real, placed hoard — never dropped). */
const SKIN_RARITY_STEP = {"common":"uncommon","uncommon":"rare","rare":"very-rare","very-rare":"very-rare"};
const SKIN_RARITY_RANK = {"common":0,"uncommon":1,"rare":2,"very-rare":3};
/* skinTierCeiling(walk): normalize the two tier representations in play (dungeon-walk.js stamps
   walk.tier as the STRING "T1"/"T2"; walk.js/wild-walk.js stamp it NUMERIC 1/2) to a rarity ceiling.
   Unrecognized/missing tier defaults to the T1 (safer, lower) ceiling — never assume T2 headroom. */
function skinTierCeiling(walk){
  const t=walk&&walk.tier;
  const isT2 = t===2 || t==="T2" || t==="2";
  return isT2 ? "very-rare" : "rare";
}
function skinGrantHoard(walk){
  const segs=skinSegments(walk); if(!segs.length) return;
  let target = segs.find(s=>skinIsEnemySeg(s) && s.loot);
  if(!target) target = segs.find(s=>s.isFinale && s.loot) || segs[segs.length-1];
  if(!target) return;
  if(!target.loot) target.loot={ magic:null, coin:null, valuable:null };
  const curRarity = target.loot.magic ? target.loot.magic.rarity.toLowerCase().replace(" ","-") : "common";
  let upgraded = SKIN_RARITY_STEP[curRarity]||curRarity;
  const ceiling = skinTierCeiling(walk);
  if((SKIN_RARITY_RANK[upgraded]||0) > SKIN_RARITY_RANK[ceiling]) upgraded = ceiling;
  const slot=(typeof dwalkLootSlot==="function") ? dwalkLootSlot(upgraded) : null;
  const valuable=(typeof dwalkValuable==="function") ? dwalkValuable() : null;
  target.loot.magic = slot || target.loot.magic;
  if(!target.loot.valuable) target.loot.valuable = valuable;
  target.loot.grantSource = "hoard";
}

/* captive: a full rollNPC mint (soft, real atoms), status:held, placed mid/deep (J2: depth >=
   ceil(segCount/2)). Reuses the capture machinery's "holding segment" concept — disposition/
   recruitment stay the DM's verbs; this only mints + places the atom. */
function skinGrantCaptive(walk, w){
  if(typeof rollNPC!=="function") return;
  const segs=skinSegments(walk); if(!segs.length) return;
  const idx=skinMidDeepIndex(segs); const seg=segs[idx]; if(!seg) return;
  const npc=rollNPC({ roleHint:"captive" });
  npc.status = Object.assign({}, npc.status, { held:true, at:seg.id||seg.num });
  if(w && typeof codexAdd==="function") codexAdd(w, npc);
  seg.captiveNpc = npc;
  seg.grantSource = (seg.grantSource?seg.grantSource+",":"")+"captive";
}

/* skinFactionSalienceWeights(w, factions): salience weight per faction, mirroring the pattern already
   used elsewhere in the engine (gap-wiring.js's distantWordFactPool duplicate-in-pool trick; seam.js's
   seamSalienceOf) rather than a uniform rollDie pick. Weight = 1 (baseline eligibility) + 1 if `known`
   (the world has surfaced this power already — SKIN-GRANTS' own G9 "never invent a named faction" bar
   is satisfied by w.factions membership; known factions are MORE salient to bind a skin to, not less)
   + 1 if the faction's clock is >=2/3 full (seamProximity-style: a power already close to firing is the
   most salient thing to tie a fresh mark to) + 1 per recent (last 30 in-world days) ledger entry that
   names this faction (recency signal, same 30-day window gap-wiring.js uses). Duplicate-in-pool encodes
   the weight without an external RNG dependency. */
function skinFactionSalienceWeights(w, factions){
  const log=(w&&Array.isArray(w.ledger))?w.ledger:[];
  const day=(w&&w.clock&&typeof w.clock.day==="number")?w.clock.day:null;
  const pool=[];
  factions.forEach(f=>{
    let weight=1;
    if(f.known) weight+=1;
    if(f.clock && f.clock.size>0 && (f.clock.filled||0)/f.clock.size >= 2/3) weight+=1;
    if(day!=null){
      const recent = log.some(e=>e && (day-(e.day||0))<=30 && typeof e.text==="string" && e.text.indexOf(f.name)>=0);
      if(recent) weight+=1;
    }
    for(let i=0;i<weight;i++) pool.push(f);
  });
  return pool;
}
/* faction-mark: bind the skin's implied power to a REAL faction — a SALIENCE-WEIGHTED pick over
   w.factions (SKIN-GRANTS §1: "bind ... via salience pick + a clock tie"), not a uniform roll. When
   the chosen faction carries a clock, record an actual fireable TIE — `clockId: slug(faction.name)` —
   the same slug findClockTarget(w, clockId) already resolves by (dm.js's factions-resolver), so the
   assembler/DM has a real handle to advance, not a freehand mention. w absent / no factions yet →
   degrades to a walk-local placeholder tag (never invents a named faction — BATCH-GUARDRAILS G9),
   still recorded on the walk so provenance stays honest. */
function skinGrantFactionMark(walk, w){
  const segs=skinSegments(walk); if(!segs.length) return;
  const seg = segs.find(s=>skinIsEnemySeg(s)) || segs[0];
  const factions=(w && w.factions) || [];
  let chosen=null;
  if(factions.length){
    const pool=skinFactionSalienceWeights(w, factions);
    chosen = pool.length ? pool[rollDie(pool.length)-1] : factions[rollDie(factions.length)-1];
  }
  const hasClock = !!(chosen && chosen.clock);
  seg.factionMark = {
    factionName: chosen?chosen.name:null,
    boundToClock: hasClock,
    clockId: hasClock ? (typeof slug==="function" ? slug(chosen.name) : chosen.name) : null,
  };
  seg.grantSource = (seg.grantSource?seg.grantSource+",":"")+"faction-mark";
}

/* threat-bias:<tag> — feed an archetype bias to resolveArchetypePool (flooded -> amphibious). Stored
   on the walk (threatBias[]) for the encounter builders that already thread tier/slot through
   resolveArchetypePool — a thin bias list they can fold into opts, not a re-roll here. */
function skinGrantThreatBias(walk, tag){
  if(!tag) return;
  walk.threatBias = walk.threatBias || [];
  if(walk.threatBias.indexOf(tag)<0) walk.threatBias.push(tag);
}

/* hazard-suffuse: +1 hazard row on 1d2 EXTRA segments (non-finale, chosen at random, deterministic
   given the seeded Math.random stream — same walk id would reproduce given a seeded RNG shim). */
function skinGrantHazardSuffuse(walk){
  const segs=skinSegments(walk).filter(s=>!s.isFinale); if(!segs.length) return;
  const n=Math.min(segs.length, rollDie(2));
  const pool=segs.slice(); const chosen=[];
  for(let i=0;i<n && pool.length;i++){ chosen.push(pool.splice(rollDie(pool.length)-1,1)[0]); }
  chosen.forEach(seg=>{
    seg.extraHazard = true;
    seg.grantSource = (seg.grantSource?seg.grantSource+",":"")+"hazard-suffuse";
  });
}

/* density:+|- — encounter density up/down one step. Recorded as a walk-level multiplier the DM/
   downstream density readers can honor; abandoned skins (density:-) empty out, occupied ones thicken. */
function skinGrantDensity(walk, arg){
  const delta = arg==="-" ? -1 : (arg==="+" ? 1 : 0);
  if(!delta) return;
  walk.densityShift = (walk.densityShift||0) + delta;
}

/* relic: a rollItem plot-object seeded into a Discovery segment (or the first non-finale segment if
   no Discovery segment rolled this walk — the promise still gets a home, never dropped). */
function skinGrantRelic(walk){
  if(typeof rollItem!=="function") return;
  const segs=skinSegments(walk); if(!segs.length) return;
  let target = segs.find(s=>s.encounter && s.encounter.type==="Discovery");
  if(!target) target = segs.find(s=>!s.isFinale) || segs[0];
  const item=rollItem({});
  target.relic = item;
  target.grantSource = (target.grantSource?target.grantSource+",":"")+"relic";
}

/* clock: the skin's implied pressure opens a real fireable front-clock on the walk (w.pressures),
   reusing capOpenDispositionClock's shape (src/world/capture.js). w absent -> the clock is stamped on
   the walk record only (walk.openedClock), not pushed to any world state — still a REAL structure the
   DM can promote later, never a freehand mention. */
function skinGrantClock(walk, skin, w){
  const danger = "Skin pressure — "+(skin&&skin.text?skin.text.replace(/\*\*/g,"").replace(/★/g,"").trim():"unnamed");
  const front = { id:(typeof slug==="function"?slug(danger):danger), kind:"skin", danger,
                  clock:{ filled:0, size:6 }, impersonal:true, known:false, closed:false,
                  doom:"the skin's pressure comes due" };
  walk.openedClock = front;
  if(w){ w.pressures=w.pressures||[]; w.pressures.push(front); }
}

const SKIN_GRANT_EXECUTORS = {
  "hoard": (walk, arg, w)=>skinGrantHoard(walk),
  "captive": (walk, arg, w)=>skinGrantCaptive(walk, w),
  "faction-mark": (walk, arg, w)=>skinGrantFactionMark(walk, w),
  "threat-bias": (walk, arg, w)=>skinGrantThreatBias(walk, arg),
  "hazard-suffuse": (walk, arg, w)=>skinGrantHazardSuffuse(walk),
  "density": (walk, arg, w)=>skinGrantDensity(walk, arg),
  "relic": (walk, arg, w)=>skinGrantRelic(walk),
  "clock": (walk, arg, w)=>skinGrantClock(walk, skinCurrentSkin, w),
};
// skinCurrentSkin: a scratch holder so the executor map (built once) can still reach `skin` inside
// applySkinGrants's loop without changing every executor's signature. Set immediately before each
// clock-token dispatch, cleared after — never read outside applySkinGrants's own call stack.
let skinCurrentSkin=null;

/* ============================================================================
   §1b MOTIFS — pervasion (SKIN-GRANTS.md §1b): entrance beat, per-segment tint (composed, never
   replacing), threatBias feed, hazard/footing tint, palette (Blockwright hookup — inert data here).
   ============================================================================ */

/* compose a kit tint onto whichever field the segment actually PRESENTS via an em-dash join (BATCH3-
   GUARDRAILS J2: "kit tints COMPOSE by APPENDING a sentence fragment after the rolled sensory line —
   an em-dash join, never interleaving"). Dungeon/wilderness segments carry `.sensory`; URBAN segments
   (rollUrbanWalk) have no `.sensory` field at all — their presented text lives in `.description` — so
   composing onto `.sensory` there would write an orphan key nothing renders (found in review: grep
   confirms urban segments never set `.sensory`). Pick the first PRESENT field off the priority list;
   only fall back to creating `.sensory` when the segment has neither (never happens for the three real
   walk shapes today, but keeps the "still additive" contract for any future/synthetic segment shape). */
const SKIN_TINT_FIELDS = ["sensory","description"];
function skinComposeTint(seg, tint){
  if(!tint) return;
  const field = SKIN_TINT_FIELDS.find(f=>seg[f]) || "sensory";
  seg[field] = seg[field] ? (seg[field] + " — " + tint) : tint;
}

function skinApplyMotif(walk, motifKey){
  if(!motifKey || motifKey==="none") return;
  const kit = (typeof skinMotifKit==="function") ? skinMotifKit(motifKey) : null;
  if(!kit) return;
  const segs=skinSegments(walk); if(!segs.length) return;

  // point 1 — entrance beat leads segment 1's presentation.
  if(kit.entrance){
    const first=segs[0];
    first.motifEntrance = kit.entrance;
  }
  // point 2 — per-segment tint, one fragment per segment, composed (never replacing).
  if(kit.tints && kit.tints.length){
    segs.forEach(seg=>{
      const tint = (typeof walkRnd==="function") ? walkRnd(kit.tints) : kit.tints[0];
      skinComposeTint(seg, tint);
      seg.motifTint = tint;
    });
  }
  // point 3 — enemies: threatBias feeds resolveArchetypePool; reskinVerb rides the encounter object.
  if(kit.threatBias && kit.threatBias.length){
    kit.threatBias.forEach(tag=>skinGrantThreatBias(walk, tag));
  }
  segs.forEach(seg=>{
    if(skinIsEnemySeg(seg) && kit.reskinVerb) seg.encounter.reskinVerb = kit.reskinVerb;
  });
  // point 4 — hazard/footing tint composes with the existing hazard/footing rows.
  if(kit.hazardTint && kit.hazardTint.prefix){
    segs.forEach(seg=>{
      if(seg.encounter && seg.encounter.type==="Hazard"){
        seg.encounter.text = seg.encounter.text + " — " + kit.hazardTint.prefix;
      }
      if(seg.footing){ seg.footing = seg.footing + " — " + kit.hazardTint.prefix; }
    });
  }
  // point 5 — the diorama palette rides the walk for Blockwright's tileset (inert data until that
  // unit lands — SKIN-GRANTS §2.4: "composes with the blockwright unit if it lands after").
  if(kit.palette && kit.palette.length) walk.motifPalette = kit.palette;
  walk.motif = motifKey;
}

/* ============================================================================
   PUBLIC — applySkinGrants(walk, skin, w) — runs AFTER base walk assembly (SKIN-GRANTS.md §1
   ordering rule: "the skin rolls FIRST" refers to rollWalkSkin firing before segment assembly reads
   it for setup bias; grants themselves apply after assembly, mutating what's already rolled).
   `w` is optional — every executor degrades gracefully without it (see each executor's doc comment).
   Pure-lens rows (skin.grants empty/absent) mutate NOTHING. Unknown grant tokens log + no-op.
   ============================================================================ */
function applySkinGrants(walk, skin, w){
  if(!walk || !skin) return walk;
  const grantsStr = skin.grants || "";
  let motifKey = skin.motif || "none";
  // TAROT-2 §2.7 — alterWalkTexture: a motif-less walk takes the SESSION motif (The Moon et al.).
  // Gap-fill only: a skin that rolled its own motif keeps it. Guarded: no draw / no tarot module
  // → byte-identical behavior.
  if(motifKey==="none" && w && typeof tarotWalkMotif==="function" && typeof tarotVectorOf==="function"){
    const sessionMotif = tarotWalkMotif(tarotVectorOf(w));
    if(sessionMotif){ motifKey = sessionMotif; walk.motifSource="tarot"; walk.motifSession=w.session||0; }
  }
  skinApplyMotif(walk, motifKey);

  if(!grantsStr) return walk;   // pure-lens row — nothing more to do
  const tokens = skinParseGrants(grantsStr);
  skinCurrentSkin = skin;
  tokens.forEach(({token, arg})=>{
    const exec = SKIN_GRANT_EXECUTORS[token];
    if(!exec){ console.warn("[skin-grants] unknown grant token, no-op:", token); return; }
    exec(walk, arg, w);
  });
  skinCurrentSkin = null;
  walk.grantsApplied = tokens.map(t=>t.token);
  return walk;
}

/* ============================================================================
   PROVENANCE — walkSkinProvenance(walk): a promise-vs-found line per grant (SKIN-GRANTS.md §1
   "provenance: grants stamp {skinRef, grant} on what they place; walkProvenanceReport gains a
   promise-vs-found line — did the player ever find the payroll?"). DM-held until discovered in play;
   `found` reads segment-level `.discovered` flags the DM sets when play surfaces the placed content
   (absent today's play loop — defaults false, never guessed true).
   NAMING NOTE (reconciled against merged reality, per this unit's build instructions): the spec's own
   prose names this function `walkProvenanceReport`, but that exact name is already owned by
   src/world/seam.js (a session-level carry-forward/consumption report — a different shape, a
   different scope). Ships here as `walkSkinProvenance` to avoid a manifest DRIFT collision; seam.js's
   walkProvenanceReport is the natural caller — it can fold this array in under a `grants` key without
   this unit needing to touch that file (out of scope for a single verified code unit). */
function walkSkinProvenance(walk){
  if(!walk) return [];
  const out=[];
  const segs=skinSegments(walk);
  segs.forEach(seg=>{
    if(seg.loot && seg.loot.grantSource==="hoard"){
      out.push({ skinRef: (walk.skin&&walk.skin.ref)||null, grant:"hoard", at:seg.id||seg.num, found:!!seg.discovered });
    }
    if(seg.captiveNpc){
      out.push({ skinRef:(walk.skin&&walk.skin.ref)||null, grant:"captive", at:seg.id||seg.num, npcId:seg.captiveNpc.id||null, found:!!seg.discovered });
    }
    if(seg.relic){
      out.push({ skinRef:(walk.skin&&walk.skin.ref)||null, grant:"relic", at:seg.id||seg.num, found:!!seg.discovered });
    }
    if(seg.factionMark){
      out.push({ skinRef:(walk.skin&&walk.skin.ref)||null, grant:"faction-mark", at:seg.id||seg.num, faction:seg.factionMark.factionName, found:!!seg.discovered });
    }
  });
  if(walk.openedClock) out.push({ skinRef:(walk.skin&&walk.skin.ref)||null, grant:"clock", clockId:walk.openedClock.id, found:false });
  return out;
}
