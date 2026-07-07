/* GENESIS MODULE — src/world/codex.js — the relational entity store (docs/CODEX.md).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   The codex is the OMNISCIENT store — casting/lighting/set-design/crew, all-knowing and all-shifting.
   NPCs / Locations / Items / Factions are records with: `rolled` (raw dice, verbatim), `fields`
   (player-safe interpretation), `dm` (DM-only: secrets/fears/truths), typed `links[]` (wikilinks),
   and `status{known,soft,at,condition}`. Two-tier lifecycle: SOFT entities (untouched) are a reusable
   pool — recontextualizable into new roles, preserving the rolled soul. The instant the player TOUCHES
   one it locks (soft→hard) to canon FOREVER — never recontextualized, never duplicated; only its state
   may evolve. The player never sees this raw: codexPlayerView() projects a knowledge-gated, sanitized
   slice; codexDigest() is the DM-facing (all-seeing) slice. Written only through codex_* events
   (EVENT-CONTRACT) applied in world.dm; the script stays the sole state owner. */

/* core link vocabulary (§8b) — directional; inverses implied so links query both ways. */
const CODEX_RELS = ["kin-of","ally-of","enemy-of","member-of","serves","leads","located-in","near",
  "holds","controls","wants","knows-about","hunts","hunted-by","owes","owed-by","unlocks","proves","part-of"];
const CODEX_REL_SYMMETRIC = ["kin-of","ally-of","enemy-of","near"];
const CODEX_REL_INVERSE = { hunts:"hunted-by","hunted-by":"hunts", owes:"owed-by","owed-by":"owes",
  leads:"led-by", holds:"held-by", controls:"controlled-by", unlocks:"unlocked-by", "located-in":"contains" };

function codexOf(w){ return w.codex || (w.codex = { records:{}, version:1 }); }
function codexKeyId(kind,name){ return (kind||"thing")+":"+slug(name||"x"); }
function codexGet(w,id){ return codexOf(w).records[id] || null; }

/* PLOT-ITEM-RECURRENCE: the SAME table row minting a SECOND time in this world (a Mythic plot-item/
   plot-lock row is one specific, singular legendary thing — never a duplicate). Looks up an existing
   record by its mint-time `origin` tag (e.g. "plot-item:298"); optionally narrowed by kind. Returns
   null when no record in THIS world carries that origin — a different world's codex is a separate
   `w.codex`, so this is naturally world-scoped with zero extra bookkeeping. */
function codexFindByOrigin(w, origin, kind){
  if(!origin) return null;
  return Object.values(codexOf(w).records).find(r=>r.origin===origin && (!kind || r.kind===kind)) || null;
}

/* DIGEST-DIET §2: bump the shared mint/touch counter and stamp it on a record — the single write
   path every touch-site below funnels through, so `touchedSeq` and mint `seq` never drift apart. */
function codexTouch(C, r){ r.touchedSeq=(C.seq=(C.seq||0)+1); return r.touchedSeq; }

/* MODEL-GRAMMAR G2 §4b — resolve + canon-lock a DM-authored shape hint onto a MINTING codex
   record. `rec.shape` (when present) is a §4b shape hint {base,size,modules,channels,stance}
   — validated against the real part vocabulary by src/engine/theater-data.js's pure
   resolveShapeHint (this file, not that one, owns writing the result + logging gaps, per that
   function's own header: "this file stays a PURE data layer... zero GS/w/U/ledger writes of
   its own"). Every dropped/unknown name resolveShapeHint reports gets ONE `drift` ledger line
   (kind:"shape-gap") — the growth signal MODEL-GRAMMAR §4b calls "the menu is a growth
   surface: recurring shape-gap log entries -> a new part." Absent resolveShapeHint (module not
   loaded / a narrow test harness) degrades to a silent no-op — a record simply mints without a
   `.shape` field, same as before this unit existed. */
function codexResolveShapeOnMint(w, r, rec){
  if(!rec || !rec.shape) return;
  if(typeof resolveShapeHint !== "function") return;
  const res = resolveShapeHint(rec.shape);
  r.shape = res.resolved;   // canon-lock: written once, at mint, on the record itself (see the
                              // codexUpdate guard below for the "never overwritten again" half).
  if(res.gaps && res.gaps.length && typeof addLedger === "function"){
    res.gaps.forEach(function(gap){
      const label = gap.kind === "base" ? "base body" : (gap.kind === "anchor" ? "anchor" : "part");
      addLedger(w, "drift", { kind: "shape-gap", recordId: r.id, recordName: r.name, gap: gap },
        "◇ shape-gap: " + r.name + " asked for an unknown " + label + " (\"" + (gap.requested || "?") +
        "\") — dropped to nearest-known.");
    });
  }
}

/* mint or merge a record (idempotent). rec: {id?,kind,name,rolled?,fields?,dm?,links?,status?,provenance?,source?,shape?,origin?} */
function codexAdd(w, rec){
  const C=codexOf(w);
  const id=rec.id || codexKeyId(rec.kind, rec.name);
  const ex=C.records[id];
  if(ex){
    // ROOT-C observability (F-07/BUG-11): a CONTENT-BEARING merge onto an ESTABLISHED record
    // (known or hard) gets one `drift` ledger line — every direct caller (urban/job-walks/capture/
    // region/the gen mint/the event case) inherits it. A bare idempotent re-touch (no new content)
    // stays silent so revisit-re-adds don't bury the drift lane.
    if((ex.status.known || ex.status.soft===false)
       && (rec.rolled||rec.fields||rec.dm||rec.status||rec.shape||(rec.links&&rec.links.length))
       && typeof addLedger==="function")
      addLedger(w,"drift",{kind:"codex-merge-known",id:id,name:ex.name,recKind:ex.kind,source:rec.source||null},
        "◇ codex merge onto established record — "+ex.name+" ("+id+").");
    if(rec.rolled && !ex.rolled) ex.rolled=rec.rolled;
    if(rec.fields) Object.assign(ex.fields, rec.fields);
    if(rec.dm)     Object.assign(ex.dm, rec.dm);
    if(rec.source && !ex.source) ex.source=rec.source;
    // PLOT-ITEM-RECURRENCE: same "never overwrite once set" posture as source — a stable row-origin tag
    // (e.g. "plot-item:298") is a mint-time identity, not a mutable field.
    if(rec.origin && !ex.origin) ex.origin=rec.origin;
    if(rec.status){
      // DEEP-merge the attitude sub-object so a partial re-add (idempotent merge) can't shallow-clobber
      // the per-NPC clamps/opening/terror (a sworn enemy silently losing its ceiling:-1). Flat status
      // fields (known/soft/at/condition) stay a plain assign.
      if(rec.status.attitude && ex.status.attitude) Object.assign(ex.status.attitude, rec.status.attitude);
      Object.keys(rec.status).forEach(k=>{ if(k==="attitude" && ex.status.attitude) return; ex.status[k]=rec.status[k]; });
    }
    (rec.links||[]).forEach(l=>{ if(!ex.links.some(x=>x.rel===l.rel&&x.to===l.to)) ex.links.push(l); });
    // MODEL-GRAMMAR G2 §4b canon-lock: a re-add/merge NEVER re-resolves or overwrites an already-set
    // shape (the mogwai looks like YOUR mogwai forever) — only a record with no `.shape` yet accepts
    // one, matching the doc's own "immutable-once-revealed rule" for names extended to shapes.
    if(!ex.shape && rec.shape) codexResolveShapeOnMint(w, ex, rec);
    codexTouch(C, ex);
    return ex;
  }
  const r={ id, kind:rec.kind||"thing", name:rec.name||id,
    rolled:rec.rolled||null, fields:rec.fields||{}, dm:rec.dm||{}, links:rec.links||[],
    status:Object.assign({ known:false, soft:(rec.provenance!=="authored"), at:null, condition:"ok" }, rec.status||{}),
    provenance:rec.provenance||"authored", source:rec.source||null, origin:rec.origin||null, ledgerRefs:rec.ledgerRefs||[],
    seq:(C.seq=(C.seq||0)+1) };   // monotonic mint order — eviction keeps the freshest soft records as the reusable pool
  codexResolveShapeOnMint(w, r, rec);   // §4b: resolve+canon-lock the shape hint (if any) at mint time
  C.records[id]=r; codexTouch(C, r); return r;
}

/* add a typed relationship (stored once on the `from` record; codexLinksOf reads it both ways). */
function codexLink(w, from, rel, to){
  const C=codexOf(w), a=codexGet(w,from); if(!a) return null;
  if(!a.links.some(l=>l.rel===rel&&l.to===to)) a.links.push({rel,to});
  codexTouch(C, a);
  // DIGEST-DIET §2: a link is bidirectional in meaning (codexLinksOf reads both ways) — touch the
  // `to` endpoint as well, so a far-side record that just got linked-to rides the next delta digest.
  const b=codexGet(w,to); if(b) codexTouch(C, b);
  return a;
}
/* every link touching `id`, from either direction (dir:"out" = id is the source). */
function codexLinksOf(w, id){
  const C=codexOf(w), out=[]; const self=C.records[id];
  if(self) self.links.forEach(l=>out.push({from:id, rel:l.rel, to:l.to, dir:"out"}));
  Object.keys(C.records).forEach(rid=>{ if(rid===id) return; C.records[rid].links.forEach(l=>{
    if(l.to===id) out.push({from:rid, rel:l.rel, to:id, dir:"in", inverse:CODEX_REL_INVERSE[l.rel]||null}); }); });
  return out;
}

/* ON-DEMAND-GEN §3 — the name-freeze guard: once a record is REVEALED (status.known — spoken aloud
   to the player), its name is frozen — never silently renamed underneath the player. Pre-reveal renames
   (soft prep still finding its identity) stay legal. A patch that ONLY renames a known record is refused
   outright (patch.name dropped, everything else in the patch still applies); codexAdd's merge path is
   the mint/re-add route and is untouched by this guard. */
function codexUpdate(w, id, patch){
  const r=codexGet(w,id); if(!r) return null;
  if(patch.name!=null){
    if(r.status.known){ console.warn("[codex] name-freeze — rename refused on a known record:",id); }
    else r.name=patch.name;
  }
  // MODEL-GRAMMAR G2 §4b canon-lock: once a record has a resolved `.shape` (set once, at mint —
  // codexResolveShapeOnMint above), NO later patch can replace it — "the mogwai sidekick looks
  // like YOUR mogwai forever." A record with no shape yet may still receive one via update (a
  // shape hint arriving after the initial mint, e.g. the DM attaching it on first real
  // description rather than at roll time) — same asymmetry the name-freeze guard uses (locked
  // only once the thing to protect actually exists).
  if(patch.shape!=null){
    if(r.shape){ console.warn("[codex] shape canon-lock — shape change refused on a resolved record:",id); }
    else if(typeof resolveShapeHint === "function") codexResolveShapeOnMint(w, r, { shape: patch.shape, id: r.id, name: r.name });
  }
  if(patch.fields) Object.assign(r.fields, patch.fields);
  if(patch.dm)     Object.assign(r.dm, patch.dm);
  // ROOT-B (BUG-06c): the DM's natural `note` field APPENDS to dm.notes[] — the DM-only layer
  // (a note may carry secrets; codexPlayerView must never see it), and an append (never assign)
  // so accumulated understanding survives every later update — the Run-2 codex-survival headline.
  if(patch.note!=null && patch.note!==""){ r.dm=r.dm||{}; (r.dm.notes=r.dm.notes||[]).push(String(patch.note)); }
  if(patch.status) Object.assign(r.status, patch.status);
  codexTouch(codexOf(w), r);
  return r;
}
function codexReveal(w, id){ const r=codexGet(w,id); if(r) r.status.known=true; return r; }

/* the player TOUCHED it → lock to canon forever (soft→hard; never recontextualized again). */
function codexContact(w, id){ const r=codexGet(w,id); if(r){ r.status.soft=false; r.status.known=true; codexTouch(codexOf(w), r); } return r; }

/* LOOSE-ENDS §1 — `codex.gifts[]`: the gift flag the SOCIAL spec left unbuilt. A standing gift given
   TO an NPC (or received FROM one) is remembered on the record — persists, surfaces in codexDigest
   (codexFullRecord below), and decays only by DM story action (there is no automatic expiry/decay
   here — "given = remembered", per the spec's own wording). Appends; never overwrites prior gifts.
   `what`/`from` are free text (the DM's declared gift); `day` defaults to the world clock's current
   day so a caller that doesn't pass one still gets a real timestamp. Non-npc records are refused
   (gifts are a social-ladder concept — applyLeverage's `trustLever` only ever reads NPC attitude). */
function codexGift(w, id, gift){
  const r=codexGet(w,id); if(!r || r.kind!=="npc") return null;
  gift=gift||{};
  const day=(gift.day!=null) ? gift.day : ((typeof clockOf==="function") ? clockOf(w).day : null);
  r.gifts=r.gifts||[];
  r.gifts.push({ what:gift.what||null, day, from:gift.from||null });
  codexTouch(codexOf(w), r);
  return r.gifts;
}

/* ── SOCIAL — per-NPC Attitude (the Standing ladder, docs/SOCIAL.md §1) ─────────────────────────────
   Attitude is an additive sibling on `status` (alongside known/soft/at/condition): a small object so it
   carries its own history, not a naked int. value/opening ride the −2..+2 ladder; floor/ceiling are the
   per-NPC clamps that keep attitude honest with the fixed-by-default world (a sworn enemy may have
   ceiling −1); lastShiftClock drives the (default-OFF, §1.4) drift; `terrified` is the per-encounter
   override (§1) — fear that makes a Hostile NPC comply NOW and lapses on the next interaction.
   PHASE 1 = the data model only: open/set/read + clamp enforcement + lazy default. The RESOLVER that
   decides how far attitude moves on a check (one step at a time) lives in src/engine/social.js (Phase 2);
   it calls codexSetAttitude as its writer. */
const ATTITUDE_MIN=-2;
const ATTITUDE_MAX=2;
const ATTITUDE_STATES={ "-2":"Hostile", "-1":"Wary", "0":"Indifferent", "1":"Friendly", "2":"Helpful" };
function attitudeClampInt(n,lo,hi){ n=Math.round(Number(n)||0); return n<lo?lo:(n>hi?hi:n); }
function attitudeLabel(v){ return ATTITUDE_STATES[String(attitudeClampInt(v,ATTITUDE_MIN,ATTITUDE_MAX))]; }

/* SOCIAL-SPINE-FIXES §S1 — parse a DM-supplied attitude VALUE. Raw ints and numeric strings pass
   through (rounded; the caller's codexSetAttitude applies the per-NPC floor/ceiling clamps); label
   strings map via the ladder + the seat-prompt synonyms (case/whitespace-insensitive). Unknown →
   null — the caller refuses LOUD, never a silent 0 (the Number("hostile")||0 fault, BUG-17). */
const ATTITUDE_WORDS={ hostile:-2, unfriendly:-1, wary:-1, neutral:0, indifferent:0, friendly:1, helpful:2 };
function attitudeParse(v){
  if(typeof v==="number" && isFinite(v)) return Math.round(v);
  if(typeof v==="string"){
    const s=v.trim().toLowerCase();
    if(s!=="" && isFinite(Number(s))) return Math.round(Number(s));
    if(ATTITUDE_WORDS[s]!=null) return ATTITUDE_WORDS[s];
  }
  return null;
}

/* the lazy default: a record minted before this landed (no attitude) reads as Indifferent-opening
   (docs/SOCIAL.md §1) — never written until first contact, same lazy pattern as the gazetteer migration. */
function codexGetAttitude(w, id){
  const r=codexGet(w,id); if(!r) return null;
  return r.status.attitude || { value:0, opening:0, floor:ATTITUDE_MIN, ceiling:ATTITUDE_MAX,
    lastShiftClock:null, terrified:false, note:null, lazy:true };
}

/* stamp the ROLLED opening ONCE (from NPC Opening Attitude, or the Monster Motivation map for creatures),
   plus the per-NPC clamps. Opening is rolled once and never silently re-set (§1.1) — refuses to overwrite
   an existing attitude unless opts.force. Returns the attitude object. */
function codexAttitudeOpen(w, id, opening, opts){
  const r=codexGet(w,id); if(!r) return null; opts=opts||{};
  const cur=r.status.attitude;
  if(cur && !opts.force) return cur;
  const floor   = attitudeClampInt(opts.floor   != null ? opts.floor   : ATTITUDE_MIN, ATTITUDE_MIN, ATTITUDE_MAX);
  const ceiling = attitudeClampInt(opts.ceiling != null ? opts.ceiling : ATTITUDE_MAX, floor,        ATTITUDE_MAX);
  const o = attitudeClampInt(opening, ATTITUDE_MIN, ATTITUDE_MAX);
  r.status.attitude = { value:attitudeClampInt(o,floor,ceiling), opening:o, floor, ceiling,
    lastShiftClock:(opts.clock!=null?opts.clock:null), terrified:false, note:(opts.cause||"opening") };
  return r.status.attitude;
}

/* set attitude to an ABSOLUTE value, clamped to the per-NPC floor/ceiling; stamp the cause + clock.
   The Phase-2 resolver computes the target value (one step per check, §2) and calls this to write it. */
function codexSetAttitude(w, id, value, cause, clock){
  const r=codexGet(w,id); if(!r) return null;
  const a=r.status.attitude || codexAttitudeOpen(w,id,0,{cause:"lazy-default",clock});
  a.floor   = attitudeClampInt(a.floor   != null ? a.floor   : ATTITUDE_MIN, ATTITUDE_MIN, ATTITUDE_MAX);
  a.ceiling = attitudeClampInt(a.ceiling != null ? a.ceiling : ATTITUDE_MAX, a.floor,      ATTITUDE_MAX);
  a.value   = attitudeClampInt(value, a.floor, a.ceiling);
  if(cause!=null) a.note=cause;
  if(clock!=null) a.lastShiftClock=clock;
  codexTouch(codexOf(w), r);
  return a;
}

/* the per-encounter Terrified override (§1): set on an Intimidation overshoot. The underlying value drops
   to as-Hostile-as-the-clamps-allow (compliance through fear, not affection); the resolver clears the flag
   on the next interaction (Phase 2/3), leaving the NPC at plain Hostile — now angry. */
function codexSetTerrified(w, id, on, clock){
  const r=codexGet(w,id); if(!r) return null;
  on=!!on;
  // clearing terror on an NPC that was never frightened is a no-op — do NOT mint a fresh Hostile
  // attitude (the old `|| codexAttitudeOpen(…,ATTITUDE_MIN)` branded a never-scared NPC permanently
  // Hostile when the resolver cleared the flag on the next interaction). Only fabricate when SETTING.
  if(!on && !r.status.attitude) return codexGetAttitude(w,id);
  const a=r.status.attitude || codexAttitudeOpen(w,id,ATTITUDE_MIN,{cause:"terrified",clock});
  a.terrified=on;
  if(on) a.value=attitudeClampInt(ATTITUDE_MIN, a.floor, a.ceiling);
  if(clock!=null) a.lastShiftClock=clock;
  codexTouch(codexOf(w), r);
  return a;
}

/* every codex NPC co-located at `at` (a node/location id) EXCEPT `exceptId` — the witness set for the
   detected social cost of a public crime (SOCIAL §5: a civilian kill near witnesses turns them Hostile).
   The store owns the query; the event layer (world.dm) iterates it and calls codexSetAttitude. */
function codexWitnessesAt(w, at, exceptId){
  if(at==null) return [];
  return Object.values(codexOf(w).records)
    .filter(r=> r.kind==="npc" && r.id!==exceptId && r.status && r.status.at===at)
    .map(r=> r.id);
}

/* §6 — the player made a successful Insight read: flag `read` on the attitude so the player view exposes
   the five-step tell (hidden-by-default until earned, §6.2). Mints an Indifferent baseline if the NPC had
   no attitude yet (the player has now assessed them). A read stays read — lapse isn't modelled in v1. */
function codexMarkAttitudeRead(w, id, on){
  const r=codexGet(w,id); if(!r) return null;
  on=(on===undefined)?true:!!on;
  const a=r.status.attitude || codexAttitudeOpen(w,id,0,{cause:"read"});
  a.read=on;
  return a;
}

/* recontextualize a SOFT (untouched) entity into a new role — preserve `rolled` + identity, reassign the
   context (fields/links/placement). REFUSES on hard entities (touched = canon, sacred). §8b. */
function codexRecontextualize(w, id, ctx){
  const r=codexGet(w,id); if(!r) return {ok:false, reason:"no-record"};
  if(!r.status.soft) return {ok:false, reason:"locked"};
  ctx=ctx||{};
  if(ctx.name) r.name=ctx.name;
  if(ctx.fields){ r.fields={}; Object.assign(r.fields, ctx.fields); }
  if(ctx.dm){ Object.assign(r.dm, ctx.dm); }
  if(ctx.links!==undefined) r.links=ctx.links||[];
  if(ctx.at!==undefined) r.status.at=ctx.at;
  if(ctx.kind) r.kind=ctx.kind;
  r.provenance="recontextualized";
  return {ok:true, record:r};
}

/* the reusable soft pool — untouched, recontextualizable entities (optionally of one kind). */
function codexSoftPool(w, kind){ return Object.values(codexOf(w).records).filter(r=>r.status.soft && (!kind||r.kind===kind)); }

/* bound the soft pool (the code-review follow-up). Every session casts ~6 soft records and dmDigest
   ships the whole codex each turn, so an uncapped pool bloats the DM's context over a long campaign.
   Evict the OLDEST untouched soft records beyond `cap` (by mint `seq`), keeping the freshest as the
   §8b reusable pool. SACRED — never evicted: hard records (touched = canon), known records (the player
   has seen them), any link endpoint (eviction would orphan a relationship), and anything in `keepIds`
   (the caller's still-bound frontier cast). Returns the count evicted.
   ON-DEMAND-GEN §6: raised from 24 → 27 (+3, prep.js's AMBIENT_POOL_SIZE — codex.js loads BEFORE
   prep.js per manifest load order, so this can't reference that const live; keep the two in sync by
   hand if either changes) so the ambient pool coexists with the frontier casts + gen mints without
   immediately evicting itself. */
const CODEX_SOFT_CAP = 27;
function codexEvictSoft(w, opts){
  opts=opts||{};
  const C=codexOf(w), cap=(typeof opts.cap==="number")?opts.cap:CODEX_SOFT_CAP;
  const keep=new Set(opts.keepIds||[]);
  const linked=new Set();                                       // any id touched by a link, either direction
  Object.values(C.records).forEach(r=>(r.links||[]).forEach(l=>{ linked.add(r.id); linked.add(l.to); }));
  const evictable=Object.values(C.records).filter(r=>
    r.status.soft && !r.status.known && !keep.has(r.id) && !linked.has(r.id));
  if(evictable.length<=cap) return 0;
  evictable.sort((a,b)=>(a.seq||0)-(b.seq||0));                 // oldest first
  const drop=evictable.slice(0, evictable.length-cap);
  drop.forEach(r=>{ delete C.records[r.id]; });
  return drop.length;
}

/* one full DM-facing record — compact, WITH dm-only fields. NPC `attitude` is MATERIALIZED via
   codexGetAttitude (SOCIAL §7.4) so the DM reads the stance — value+label+opening+clamps+terror —
   even on a lazy-default NPC that never had attitude written; the DM narrates TO this, never guesses it. */
function codexFullRecord(w, r){
  const o={ id:r.id, kind:r.kind, name:r.name, fields:r.fields, dm:r.dm,
    links:r.links, status:r.status, source:r.source, provenance:r.provenance };
  // MONSTER-PARLEY §1: creatures join the attitude ladder too (a wolf's morale-break parley has
  // somewhere to go) — widen the npc-only gate to npc||creature. Everything else about the shape
  // (materialize via codexGetAttitude, lazy-default-safe) is unchanged.
  if(r.kind==="npc"||r.kind==="creature"){
    const a=codexGetAttitude(w, r.id);
    o.attitude={ value:a.value, label:attitudeLabel(a.value), opening:a.opening, floor:a.floor,
      ceiling:a.ceiling, terrified:!!a.terrified, read:!!a.read, lazy:!!a.lazy };
    // LOOSE-ENDS §1: standing gifts ride the digest so the DM can declare {type:"trustLever"} on a
    // social_check without recalling prose from memory — the record IS the memory. DIGEST-DIET's size
    // budget (BATCH-GUARDRAILS G1: <12 KB) is per-record-in-the-here-now-set, not per-world — an
    // always-shipped `gifts:[]` on every ordinary NPC (the overwhelming common case, no gifts ever)
    // costs real bytes at scale for zero information; omit the key entirely when empty, same sparse-
    // key convention as resourceDigest/socialToolCharmDigest ("only when held").
    if(r.gifts && r.gifts.length) o.gifts=r.gifts;
  }
  // REVIEW-FIXES-0705 U4 — the parley angle: creature-only advisory hint of which ability/skill a
  // social_check against this record should roll (Beast -> Wis/Animal Handling, else Cha/Persuasion).
  // Advisory only (the roll stays the DM's, §5 anti-drift); NPCs never carry this field.
  if(r.kind==="creature" && typeof socialCheckAbilityFor==="function") o.parleyAbility=socialCheckAbilityFor(r);
  return o;
}

/* the ids of the "here-and-now set" (DIGEST-DIET §1): records that ride the digest FULL every turn,
   regardless of touchedSeq. opts:{atNodeId, walkNodeId, mintIds, ackSeq, founding}. Bounded by scene
   size, not world size — this is the whole point of the split. */
function codexHereNowIds(w, opts){
  opts=opts||{};
  const C=codexOf(w), ids=new Set();
  Object.values(C.records).forEach(r=>{
    // ON-DEMAND-GEN §6: an UNTOUCHED ambient-pool NPC (dm.ambient, still soft — never contacted) stays
    // roster-tier even though it's "at" the current node — it's a background-option pool (the DM pulls
    // one on demand via dev/peek-state.py, exactly like any roster entry), not yet-narrated scene cast.
    // The instant the DM engages one (codex_contact locks it to hard) it's no longer soft, so rule 1
    // below picks it up as ordinary here-and-now cast — this exclusion only ever applies pre-contact.
    const untouchedAmbient = r.dm && r.dm.ambient && r.status && r.status.soft;
    // 1. at the current node, or at a node of the active walk (both are "here" for narration purposes)
    if(!untouchedAmbient && r.status && r.status.at!=null && (r.status.at===opts.atNodeId || (opts.walkNodeId!=null && r.status.at===opts.walkNodeId))) ids.add(r.id);
    // HQ2-11 (PROVISIONAL, founding-digest-diet): on the FOUNDING turn only, a record the PC has
    // already CONTACTED (status.known, or soft locked to hard via codex_contact) rides full even off
    // the opening node — the "contacted OR nearby" founding slice the spec calls for. Off-founding,
    // rule 4 below already carries a contacted record forward via its touchedSeq bump, so this branch
    // would be redundant (and is gated off to keep the steady-state path byte-for-byte unchanged).
    if(opts.founding && r.status && (r.status.known || r.status.soft===false)) ids.add(r.id);
    // 4. touched since the last acknowledged turn (the delta, §2) — a crashed/unanswered turn never
    // advances digestAckSeq, so nothing already shipped silently drops out of the DM's view.
    // HQ2-11 (PROVISIONAL): SUPPRESSED at founding — ackSeq is always 0 on a world's first-ever digest
    // (digestHereOpts's own comment), and codexAdd's codexTouch stamps touchedSeq>0 on every record
    // minted during world-gen prep, so with rule 4 live this branch alone matches the ENTIRE just-
    // generated prep codex on turn 1 (the founding-digest-diet bug — dev/state-eval/budgets.json's
    // hx-01-founding fixture blew totalFounding on this). Full prep stays in w.codex regardless (this
    // function only scopes the DIGEST slice); post-founding, ackSeq carries a real per-turn watermark
    // and rule 4 resumes its normal job untouched.
    if(!opts.founding && opts.ackSeq!=null && typeof r.touchedSeq==="number" && r.touchedSeq>opts.ackSeq) ids.add(r.id);
  });
  // 2. the active walk's cast (pn.cast ids) — always full, not just when at that node
  (opts.castIds||[]).forEach(id=>{ if(C.records[id]) ids.add(id); });
  // 3. w.dm.mintQueue (ON-DEMAND-GEN's spotlight) — minted records are always full
  (opts.mintIds||[]).forEach(id=>{ if(C.records[id]) ids.add(id); });
  return ids;
}

/* HQ2-11 (PROVISIONAL, founding-digest-diet): a conservative static ceiling for the founding turn's
   `codex` section, independent of dev/state-eval/budgets.json (a dev-only measurement artifact the
   app never reads at runtime). Sized so codex + every OTHER section's own worst-case budgets.json
   ceiling still clears totalFounding (32768) with margin — the exact number is a taste call, not a
   locked contract; flagged for Fable's gate same as the rest of this unit. */
const CODEX_FOUNDING_BYTE_CAP = 22528;

/* a roster one-liner — enough for the DM to remember the record exists and pull it on demand via
   dev/peek-state.py (§1); no fields/dm/links (that's the whole savings). */
function codexRosterLine(r){ return { id:r.id, kind:r.kind, name:r.name, at:r.status.at, known:!!r.status.known }; }

/* DM-facing slice (all-seeing). Two tiers (DIGEST-DIET §1):
     codex       — full records for the here-and-now set only (bounded ~5-10 KB regardless of world size)
     codexRoster — one-liner for every other record (~40 B/record — enough to remember it exists)
   No opts (or omitted opts) = legacy all-full behavior (back-compat for callers that haven't scoped yet). */
function codexDigest(w, opts){
  const C=codexOf(w);
  // REGIONS-NAMES.md §1: `region` records are backdrop geography (write-once canon, minted on every
  // node first-touch), not narratable cast — they never ride the digest (neither full nor roster tier)
  // so the digest-diet size budget (BATCH-GUARDRAILS G1: <12 KB) stays independent of how much of the
  // map has been explored. Still fully queryable directly (dev/peek-state.py `codex --kind region`).
  const all=Object.values(C.records).filter(r=>r.kind!=="region");
  if(!opts) return all.map(r=>codexFullRecord(w, r));   // back-compat: unscoped call ships every record full
  const here=codexHereNowIds(w, opts);
  const hereRecs=all.filter(r=>here.has(r.id));
  const notHereRecs=all.filter(r=>!here.has(r.id));
  // HQ2-11 (PROVISIONAL, founding-digest-diet): the founding turn does NOT roster the rest-of-prep set
  // the way a steady-state turn rosters its "not here" records — the fix shape is explicit that the
  // un-sliced prep "stays in w.codex (behind the screen)... NOT dumped in the opening digest" at ALL
  // (neither tier), not merely demoted to a one-liner. Rostering the full prep dump here would just move
  // the overflow from `codex` onto `codexRoster` (this fixture's prep alone would blow codexRoster's own
  // budgets.json ceiling — a section this unit's spec explicitly says not to touch) — a shell game, not
  // a fix. Post-founding (opts.founding false) this branch never runs; steady-state rostering (below)
  // is untouched.
  if(opts.founding && hereRecs.length){
    // Edge case (ruled): a founding scene with an unusually large nearby/contacted set could still blow
    // the codex budget even after suppressing the touchedSeq-delta rule above. Cap it: contacted records
    // first (already-met NPCs matter most to the opening scene), then everything else in the here set
    // ordered by mint order (touchedSeq) for determinism; whatever doesn't fit under CODEX_FOUNDING_BYTE_CAP
    // spills into codexRoster (a one-liner + an implicit count via its length) so the DM knows more exists
    // behind the screen — the ONLY thing that ever lands in codexRoster on a founding turn.
    const contacted=r=>!!(r.status && (r.status.known || r.status.soft===false));
    const ordered=hereRecs.slice().sort((a,b)=>{
      const ca=contacted(a)?0:1, cb=contacted(b)?0:1;
      if(ca!==cb) return ca-cb;
      return (a.touchedSeq||0)-(b.touchedSeq||0);
    });
    const kept=[]; const spilled=[]; let bytes=0;
    ordered.forEach(r=>{
      const full=codexFullRecord(w, r);
      const b=JSON.stringify(full).length;
      if(kept.length && bytes+b>CODEX_FOUNDING_BYTE_CAP){ spilled.push(r); return; }
      kept.push(full); bytes+=b;
    });
    return {
      codex: kept,
      codexRoster: spilled.map(codexRosterLine)
    };
  }
  return {
    codex: hereRecs.map(r=>codexFullRecord(w, r)),
    codexRoster: notHereRecs.map(codexRosterLine)
  };
}

/* PLAYER-facing projection: only KNOWN records, sanitized (no dm-only fields), links pruned to other
   known records (so a link never leaks an unknown entity). This is the only entity view the player sees.
   The five-step attitude TELL rides only when the player has READ the NPC via Insight (§6.2 hidden-by-
   default) — coarse value+label only, never the DC / opening / clamps (those stay the DM's spine). */
function codexPlayerView(w){
  const C=codexOf(w); const known=id=>C.records[id] && C.records[id].status.known;
  return Object.values(C.records).filter(r=>r.status.known).map(r=>{
    const o={ id:r.id, kind:r.kind, name:r.name, fields:r.fields,
      links:(r.links||[]).filter(l=>known(l.to)), status:{ at:r.status.at, condition:r.status.condition } };
    const a=r.status.attitude;
    // MONSTER-PARLEY §1: the same read-gated coarse tell extends to creatures (a befriended
    // owlbear's disposition is exactly as player-visible as a read NPC's, never before).
    if((r.kind==="npc"||r.kind==="creature") && a && a.read) o.attitude={ value:a.value, label:attitudeLabel(a.value) };
    return o;
  });
}

/* provenance / mechanical-vs-invented audit — the anti-drift ratio test (docs/CODEX.md §7 success metric).
   The bucket definition is the SPEC's, by provenance (a deterministic script tally — never a model
   self-report): `rolled` / `recontextualized` / `prep` = MECHANICAL (the engine dealt the atoms; the soft
   pool's recontextualized records preserve the rolled soul, role reassigned — never a wholesale recycle,
   the architecture forbids it); everything else (`authored` legacy prose, a from-scratch `dm` codex_add)
   = INVENTED. The Codex's whole job is to push this ratio toward mechanical. Saltrest baseline ≈ 0.20. */
const CODEX_MECH_PROV = ["rolled","recontextualized","prep"];
function codexIsMechanical(r){ return !!r && CODEX_MECH_PROV.indexOf(r.provenance) >= 0; }
function codexProvenanceReport(w){
  const recs=Object.values(codexOf(w).records);
  const byProvenance={}, byKind={}; let mech=0, soft=0, recon=0, known=0;
  recs.forEach(r=>{
    byProvenance[r.provenance]=(byProvenance[r.provenance]||0)+1;
    const k=byKind[r.kind]||(byKind[r.kind]={total:0,mechanical:0});
    k.total++; if(codexIsMechanical(r)){ mech++; k.mechanical++; }
    if(r.status.soft) soft++;
    if(r.provenance==="recontextualized") recon++;
    if(r.status.known) known++;
  });
  const total=recs.length;
  return { total, mechanical:mech, invented:total-mech,
    mechanicalRatio: total? +(mech/total).toFixed(3) : 0,
    recontextualized:recon, softPool:soft, hard:total-soft, known,
    byProvenance, byKind,
    recontextualizable: codexSoftPool(w).filter(codexIsMechanical).length };
}

/* migrate an existing world's gazetteer + factions into codex records (idempotent, once per world).
   Non-destructive: gazetteer/factions stay; the codex becomes the store that subsumes them. */
function codexGazKind(t){ return ({Setting:"location", Place:"location", Faction:"faction", NPC:"npc", Item:"item"})[t]||null; }
function ensureCodex(w){
  if(!w || w._codexInit) return;
  const C=codexOf(w);
  (w.factions||[]).forEach(f=>{ const id="faction:"+slug(f.name);
    if(!C.records[id]) codexAdd(w,{ id, kind:"faction", name:f.name, provenance:"authored",
      fields:{ agenda:f.agenda||null, method:f.method||null, dominant:!!f.dominant, tags:f.tags||[] },
      status:{ known:!!f.known, soft:false } }); });
  (w.gazetteer||[]).forEach(g=>{ const kind=codexGazKind(g.type); if(!kind) return; const id=kind+":"+slug(g.name);
    // A world-gen PLACE that carried its dice forward (g.rolled) lands as a mechanical, drift-proof record
    // (`provenance:"rolled"`); legacy prose gazetteers (no dice) stay "authored". Factions keep their own path.
    const grounded = kind==="location" && g.rolled;
    if(!C.records[id]) codexAdd(w,{ id, kind, name:g.name,
      provenance: grounded ? "rolled" : "authored", rolled: grounded ? g.rolled : null,
      fields:{ desc:g.desc||null, cat:g.cat||null }, status:{ known:!!g.known, soft:false } }); });
  w._codexInit=true;
}
