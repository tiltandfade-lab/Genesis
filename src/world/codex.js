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
    else {
      r.name=patch.name;
      // ANIMAL-SOCIAL.md §4/§6 U5 — "named" is one of the three promotion triggers (engaged twice /
      // named / raised past +0). Stamp it on the successful rename, then run the promotion check —
      // animal-only, no-op for every other kind.
      if(r.kind==="npc" && r.dm && r.dm.partialKind==="animal"){
        r.dm.named=true;
        if(typeof animalMaybePromote==="function") animalMaybePromote(w, r, "named");
      }
    }
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
  // HQ3-D2 (SET-10-F1): notes are now STAMPED OBJECTS {text,day,min,supersedes?} — same clockOf
  // precedent as codexGift (line 176 above) — so a memoryless seat can see WHEN a claim was made.
  // Legacy bare-string notes already on a record are never rewritten (read tolerantly via noteText()
  // below); this only changes what NEW pushes look like.
  if(patch.note!=null && patch.note!==""){
    r.dm=r.dm||{}; (r.dm.notes=r.dm.notes||[]);
    const c=(typeof clockOf==="function")?clockOf(w):{day:null,min:null};
    const entry={ text:String(patch.note), day:c.day, min:c.min };
    if(patch.supersedes) entry.supersedes=true;
    r.dm.notes.push(entry);
  }
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

/* HQ3-D2 — a `dm.notes[]` entry is either a legacy bare string (never migrated, L2/L7 precedent) or a
   stamped object {text,day,min,supersedes?}. Read tolerantly everywhere a note's text is needed. */
function noteText(n){ return (n&&typeof n==="object")?(n.text||""):String(n||""); }

/* HQ3-D2/D5 — the ONE shared digest projection for dm.notes[]: newest-first (append order is the
   reliable recency key, robust for legacy strings — L8) + a hard budget of 6 notes shipped FULL,
   collapsing anything older into a single COUNT rollup line (never a content summary — no model
   call, SPEED-DOCTRINE; L16). A `supersedes:true` note always renders first with a
   "(corrects earlier claims)" prefix so the seat treats it as canon (L9). Pure — never mutates the
   stored `dm` object or its `notes` array; returns a shallow clone with a compacted `notes`. */
const DIGEST_NOTE_BUDGET = 6;   // L16
function dmNotesForDigest(dm){
  const notes=(dm&&dm.notes)||[];
  if(notes.length<=0) return dm;
  const newestFirst=notes.slice().reverse();                 // append order → newest first (L8) —
  // a supersedes correction is pushed as the newest note, so it already lands first here; L9 needs
  // no extra reordering, only the prefix stamp below.
  const kept=newestFirst.slice(0, DIGEST_NOTE_BUDGET).map(n=>{
    const o={ text:noteText(n) };
    if(n&&typeof n==="object"){
      if(n.day!=null) o.day=n.day;
      if(n.min!=null) o.min=n.min;
      if(n.supersedes){ o.supersedes=true; o.text="(corrects earlier claims) "+o.text; }
    }
    return o;
  });
  const extra=notes.length-kept.length;
  if(extra>0) kept.push({ text:"…and "+extra+" earlier note"+(extra===1?"":"s")+" (full history in stored state)", rollup:true });
  return Object.assign({}, dm, { notes:kept });               // clone — stored r.dm.notes stays full (L16/D5)
}

/* one full DM-facing record — compact, WITH dm-only fields. NPC `attitude` is MATERIALIZED via
   codexGetAttitude (SOCIAL §7.4) so the DM reads the stance — value+label+opening+clamps+terror —
   even on a lazy-default NPC that never had attitude written; the DM narrates TO this, never guesses it. */
function codexFullRecord(w, r){
  const o={ id:r.id, kind:r.kind, name:r.name, fields:r.fields, dm:dmNotesForDigest(r.dm),
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
  // HQ-3 (ANIMAL-SOCIAL-HQ.md) — widen the gate so animal partials (kind:"npc",
  // dm.partialKind==="animal") ALSO get the advisory ability hint; previously excluded
  // because they aren't kind:"creature", so the digest never told the DM to route
  // WIS/Animal Handling and the engine defaulted to Cha/Persuasion.
  if((r.kind==="creature" || (r.kind==="npc" && r.dm && r.dm.partialKind==="animal")) && typeof socialCheckAbilityFor==="function") o.parleyAbility=socialCheckAbilityFor(r);
  // ANIMAL-SOCIAL.md §2/§6 U4 — the witness packet rides the digest ONLY once an interview is open
  // (Speak with Animals active, or the DM marked the channel open — r.dm.interviewOpen, set by the
  // animal_interview event). Absent that flag, an animal partial still ships its baseline kind+tell+
  // need via fields/dm above — this is purely additive, never a regression of today's shape.
  // ANIMAL-SOCIAL.md §4/§6 U5 — a befriended ally (r.dm.ally===true) auto-volunteers the packet
  // regardless of the interview channel ("no check" — the ally doesn't wait to be asked).
  if(r.kind==="npc" && r.dm && r.dm.partialKind==="animal" && (r.dm.interviewOpen || r.dm.ally===true) && typeof animalWitness==="function"){
    o.witness=animalWitness(w, r);
  }
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

/* TABLETOP-UNITS.md §U3 — the co-location parity fix (TABLETOP-VISION.md §2/§9.6): "entering a
   stage MUST fire the ambient-presence lines into the here-digest in the same event that stages
   the blank meeples... the digest rises to match the table." This is the ONE shared derivation —
   consumed by BOTH dm.js's digest (activeWalkDigest / dmDigest's node-scene sibling of `activeWalk`)
   AND, later, U4's cast-tableau staging function — normalization at ONE boundary. U3's own mutation
   check spies on call identity (both consumers must call this SAME function reference, not two
   functions that happen to agree on output).

   Computes over the EXACT untouchedAmbient set codexHereNowIds excludes from the full here-set
   above (r.dm.ambient && r.status.soft && r.status.at===hereNodeId) — this line SUMMARIZES what
   that exclusion hides; codexHereNowIds itself is UNTOUCHED (still the same exclusion, same
   behavior). `texture` = a place-tier stock phrase, NO names (the slow drip holds on identity, not
   on presence) — reuses prep.js's nodeLodgingTier (the one existing per-node tier signal,
   ECONOMY-SINKS §A) rather than inventing a second tier heuristic. Returns null when count is 0
   (no ambient records to summarize at this node — nothing rides the digest, nothing stages). */
const AMBIENT_TEXTURE_BY_TIER = [
  "a few locals going about their business",  // tier 0 (hamlet / no shop signal)
  "a modest gathering of regulars",
  "a well-heeled crowd of patrons",
  "a bustling crowd, several deep",
];
function codexAmbientPresenceFor(w, hereNodeId){
  if(!hereNodeId) return null;
  if(typeof codexOf!=="function") return null;
  const C=codexOf(w);
  let count=0;
  Object.values(C.records||{}).forEach(r=>{
    if(r.dm && r.dm.ambient && r.status && r.status.soft && r.status.at===hereNodeId) count++;
  });
  if(count<=0) return null;
  const tier=(typeof nodeLodgingTier==="function") ? (nodeLodgingTier(w, hereNodeId)||0) : 0;
  const idx=Math.max(0, Math.min(AMBIENT_TEXTURE_BY_TIER.length-1, tier|0));
  return { count, texture: AMBIENT_TEXTURE_BY_TIER[idx] };
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

/* ============================================================================
   ANIMAL-SOCIAL.md §2/§6 U4 — the WITNESS PACKET (Speak with Animals lane)
   ============================================================================
   animalWitness(w, rec) — what an interviewed animal can report: "information about nearby
   locations and monsters... including whatever it has perceived within the past day" (SRD, quoted
   in the spec). READ-ONLY / DETERMINISTIC: reads only w.ledger (the World State Ledger, already-
   rolled events), w.codex (already-minted records), w.map (already-rolled nodes/edges) — NEVER
   invents anything at ask-time, NEVER mutates w or rec. Same world state -> byte-identical packet.

   The significance-blind law (§2, binding): the packet carries SENSE-DATA, never meaning, and NEVER
   an NPC's proper name — only role/smell HANDLES (animalHandleFor below). This is enforced by
   construction: every helper below reads structured `data`/`fields` off records/ledger entries,
   never a record's own `.name` or a ledger entry's free-text `.text` (which DOES carry names, e.g.
   "${c.name} grows to level..." — copying it verbatim would leak identity through an animal's mouth). */

/* animalHandleFor(rec) — a nameless sense-handle for ANOTHER codex record ("the two-legged one",
   "the loud one", never rec.name). Pure; rec may be an npc or creature record. */
function animalHandleFor(rec){
  if(!rec) return "something";
  if(rec.kind==="creature"){
    const t=(rec.fields && rec.fields.type) ? String(rec.fields.type).toLowerCase() : null;
    return t ? "the "+t+"-shaped one" : "a wild thing";
  }
  const role=(rec.dm && rec.dm.partialKind==="animal") ? "another animal"
    : (rec.fields && rec.fields.role) ? String(rec.fields.role) : null;
  return role ? "the "+role : "a two-legged one";
}

/* Maps a ledger entry's `type`/`data.kind` to a sensory channel + a sense-data-only note — NEVER
   interpolates a name. ANIMAL-SOCIAL.md §5/§6 U6 narrows WHICH of these an animal reports by kind
   via animalKnowledgeScopeFor (data/animal-knowledge-scope.js) — see animalLedgerTypeMatches +
   animalWitnessSeen's scope filter below. */
const ANIMAL_LEDGER_SENSE = {
  "drift":       { sense:"smell", note:"the place itself smelled different afterward" },
  "npc-life":    { sense:"sight", note:"a two-legged one came and went" },
  "outcome:kill":     { sense:"sound", note:"a loud-hurt smell, then not-moving" },
  "outcome:social":   { sense:"sound", note:"raised voices, then quiet" },
  "outcome:move-zone":{ sense:"sight", note:"quick feet, back and forth" },
  "canon:discovery":  { sense:"sight", note:"something was uncovered nearby" },
};
function animalLedgerSenseFor(e){
  if(!e) return null;
  const composite=e.type+":"+((e.data&&e.data.kind)||"");
  return ANIMAL_LEDGER_SENSE[composite] || ANIMAL_LEDGER_SENSE[e.type] || { sense:"sound", note:"something happened nearby" };
}

/* ANIMAL-SOCIAL.md §5/§6 U6 — does ledger entry `e` fall inside knowledge-scope `ledgerTypes`?
   null (no filter, animal-knowledge-scope.js's "generic"/"elder" categories) -> everything passes,
   byte-identical to pre-U6 behavior. Otherwise matches either the composite key ("outcome:kill") or
   the bare type ("drift") — same two-tier lookup animalLedgerSenseFor itself already uses, so a
   scope entry never has to know which tier a given ledger type resolves at. */
function animalLedgerTypeMatches(e, ledgerTypes){
  if(!ledgerTypes) return true;
  const composite=e.type+":"+((e.data&&e.data.kind)||"");
  return ledgerTypes.indexOf(composite)>=0 || ledgerTypes.indexOf(e.type)>=0;
}

/* entries in the SRD's "past day" window at (or, for an adjacent-reach kind, adjacent to) the
   animal's own status.at. Only ledger entries carrying a resolvable location (data.nodeId or
   data.at) are eligible — an entry with no location is never guessed onto the animal's turf.
   ANIMAL-SOCIAL.md §5/§6 U6 — adjacent-node reach now comes off the row-driven knowledge scope
   (animalKnowledgeScopeFor's adjacentReach — bird/elder categories) rather than a text regex on the
   kind label alone; the old bird-text regex stays as an OR-fallback so a realm-skinned or domestic
   bird-flavored draw with no wildKindRow (pre-U6 records, or a non-wilderness bird-ish animal-kind
   row) keeps its adjacent reach unchanged — purely additive, never a narrowing of what already
   worked. Once the scope resolves, `seen` is further filtered to the scope's own ledgerTypes (§5:
   "a raven-scope packet includes adjacent-node events, a herd-scope packet does not" — the herd
   scope's ledgerTypes already excludes the "faces/carrion" entries a herd wouldn't remark on, even
   at its own node). */
function animalWitnessSeen(w, rec, at){
  if(!w || !at) return [];
  const day=(typeof clockOf==="function") ? clockOf(w).day : 0;
  const animalKind=(rec.fields && rec.fields.animalKind) || "";
  const isBirdText=/raven|hawk|owl|crow|falcon|bird|eagle/i.test(animalKind);
  const scope=(typeof animalKnowledgeScopeFor==="function") ? animalKnowledgeScopeFor(rec) : null;
  const adjacentReach=!!(isBirdText || (scope && scope.adjacentReach));
  const eligible=new Set([at]);
  if(adjacentReach && typeof mapOf==="function"){
    (mapOf(w).edges||[]).forEach(ed=>{
      if(ed.from===at) eligible.add(ed.to);
      if(ed.to===at) eligible.add(ed.from);
    });
  }
  return (w.ledger||[])
    .filter(e=>{
      const loc=(e.data&&(e.data.nodeId!=null?e.data.nodeId:e.data.at));
      if(loc==null || !eligible.has(loc)) return false;
      if(!animalLedgerTypeMatches(e, scope && scope.ledgerTypes)) return false;
      return (day - e.day) <= 1;   // the SRD's "within the past day"
    })
    .map(e=>{
      const s=animalLedgerSenseFor(e);
      return { day:e.day, min:e.min, sense:s.sense, note:s.note, atHere:(e.data.nodeId!=null?e.data.nodeId:e.data.at)===at };
    });
}

/* nearby exits + creature/npc records sharing the node — place names are fine (that's the SRD floor
   "locations and monsters"), but any OTHER record is surfaced only as a handle, never its name. */
function animalWitnessNearby(w, rec, at){
  if(!w || !at) return { exits:[], creatures:[] };
  const exits=(typeof mapOf==="function")
    ? (mapOf(w).edges||[]).filter(ed=>ed.from===at||ed.to===at)
        .map(ed=>({ bearing:ed.bearing, to:(ed.from===at?ed.to:ed.from), toName:nodeName(w,(ed.from===at?ed.to:ed.from)) }))
    : [];
  const C=codexOf(w);
  const creatures=Object.values(C.records)
    .filter(r=>r.id!==rec.id && r.status && r.status.at===at && (r.kind==="creature"||r.kind==="npc"))
    .map(r=>({ handle:animalHandleFor(r), kind:r.kind }));
  return { exits, creatures };
}

/* ANIMAL-SOCIAL.md §5/§6 U6 — a deterministic season label off the world clock. Numbers are
   implementation-fill (a 364-day year split into 4 even quarters); the SHAPE is the law (a stable,
   reproducible season word for a given clock day — never a fresh roll, same posture as every other
   "the shape is the law, not the exact figures" note in this spec family). */
const ANIMAL_SEASONS=["spring","summer","autumn","winter"];
function animalSeasonLabel(w){
  const day=(typeof clockOf==="function") ? clockOf(w).day : 0;
  const doy=((day%364)+364)%364;
  return ANIMAL_SEASONS[Math.floor(doy/91)%4];
}

/* standing facts about the animal's own territory — the §2 exception to the 1-day window ("place-
   memory" persists). Reads only the node's own already-rolled fields (never invents a fact).
   ANIMAL-SOCIAL.md §5/§6 U6 extends this with two more already-rolled sources, per the spec ("place-
   memory... includes the node's standing wilderness facts — the walk system's biome + any rolled
   node hooks — plus season-keyed entries"):
     - the walk system's biome (P.bundle.environments[pn.idx].walk.startBiome, the SAME already-
       rolled walk data prepNodeLabel/pbundleSummWalk read elsewhere — never a second biome roll),
       season-keyed via animalSeasonLabel above.
     - the node's rolled hook — `rec.dm.hook` (the guaranteed npc-hook d300 draw, ensureSceneHook,
       now extended over wilderness animal pools by this same unit below) rides here as a STANDING
       fact rather than a one-time interview answer, because a hook is inherently the "region's live
       hook" (§5), not a bounded past-day event. `rec` is optional (a non-animal caller, or a call
       before the hook has minted, simply skips this entry — never fabricated). */
function animalWitnessPlaceMemory(w, at, rec){
  if(!w || !at) return [];
  const out=[];
  const n=(typeof mapOf==="function") ? mapOf(w).nodes[at] : null;
  if(n && n.codexId){
    const loc=codexOf(w).records[n.codexId];
    if(loc && loc.status && loc.status.condition) out.push({ fact:"the place has been "+loc.status.condition+" for a while now" });
  }
  const P=(typeof prepOf==="function") ? prepOf(w) : null;
  const pn=P && P.nodes && P.nodes[at];
  const env=(pn && P.bundle && Array.isArray(P.bundle.environments)) ? P.bundle.environments[pn.idx] : null;
  const biome=env && env.walk && env.walk.startBiome;
  if(biome) out.push({ fact:`this ground reads ${String(biome).toLowerCase()} come ${animalSeasonLabel(w)}`, season:animalSeasonLabel(w) });
  if(rec && rec.dm && rec.dm.hook && rec.dm.hook.text) out.push({ fact:rec.dm.hook.text, ref:rec.dm.hook.ref||null });
  return out;
}

/* ANIMAL-SOCIAL.md RESOLVED ruling 3 (2026-07-08 night) — breach-tagged perceptions ARE included,
   spice-band-gated: an interviewed animal in a high-band world MAY report the thing with no smell.
   Deterministic — the entry's PRESENCE is gated by the node's own already-rolled drift band (or an
   active marooned realm), never by a fresh roll at ask-time (which would break the determinism
   contract). Threshold: Volatile+ on the shared SPICE_ORDER ladder (band-calibration ruling: Volatile
   = an active force, exactly the register this uncanny-leak belongs to). */
const ANIMAL_BREACH_PERCEPTION_FLOOR = "Volatile";
function animalWitnessBreachEntry(w, at){
  if(!w) return null;
  let band=null;
  const n=(typeof mapOf==="function") ? mapOf(w).nodes[at] : null;
  if(n && n.codexId){
    const loc=codexOf(w).records[n.codexId];
    band=loc && loc.status ? loc.status.condition : null;
  }
  const bandHigh = typeof SPICE_ORDER!=="undefined" && band!=null
    && SPICE_ORDER.indexOf(band) >= SPICE_ORDER.indexOf(ANIMAL_BREACH_PERCEPTION_FLOOR);
  const realmActive = !!(w.realm && w.realm.active);
  if(!bandHigh && !realmActive) return null;
  return { day:(typeof clockOf==="function"?clockOf(w).day:0), sense:"breach", note:"the thing with no smell" };
}

/* attitude gates VOLUNTEERED DEPTH, not the underlying truth (§2 "Willingness gates the interview,
   not the truth"): the full packet is always computed (determinism/reproducibility), but Hostile/
   Unfriendly (-2/-1) volunteers nothing beyond the tell — the existing social_check ladder (§3) is
   how a player opens it up. Friendly-or-better (>=0) volunteers the full packet.
   ANIMAL-SOCIAL.md §4/§6 U5 — a befriended ally (rec.dm.ally===true, only ever stamped at attitude
   +2) short-circuits straight to the full packet with NO gate check at all ("auto-volunteer the
   full witness packet with no check") — never even consults the attitude value. Every other animal
   keeps the exact -1/-2 gate above, unchanged. */
function animalWitnessGate(w, rec, full){
  if(rec && rec.dm && rec.dm.ally===true) return full;
  const a=(typeof codexGetAttitude==="function") ? codexGetAttitude(w, rec.id) : { value:0 };
  const value=(a && a.value!=null) ? a.value : 0;
  if(value <= -1){
    return { tell:full.tell, seen:[], nearby:{ exits:[], creatures:[] }, placeMemory:[], gated:true };
  }
  return full;
}

/* THE ASSEMBLER. rec must be a codex npc record minted via rollPartial('animal',...)
   (rec.dm.partialKind==="animal"). Returns null for anything else (never guesses a witness packet
   for a non-animal record).
   ANIMAL-SOCIAL.md §4/§6 U5 — a befriended ally also carries `guide` on the packet: the soft-recall
   walk seam's own data shape (CHASE-SOFT-RECALL.md — a `recallable` flag + a bound referent), so a
   future walk consumer can offer "the animal leads you there" without this unit inventing a new
   travel mechanism. `to` is whatever the tell is CURRENTLY bound to (dm.tellBoundTo, DM-set) — never
   fabricated here; absent a binding, `to` is null and `available` stays true (the ally still offers
   to lead, there's just nowhere pinned yet). */
function animalWitness(w, rec){
  if(!w || !rec || rec.kind!=="npc" || !(rec.dm && rec.dm.partialKind==="animal")) return null;
  const at=rec.status && rec.status.at;
  const tell={ text:(rec.dm && rec.dm.tell) || null, boundTo:(rec.dm && rec.dm.tellBoundTo) || null };
  const seen=animalWitnessSeen(w, rec, at);
  const breachEntry=animalWitnessBreachEntry(w, at);
  if(breachEntry) seen.push(breachEntry);
  const nearby=animalWitnessNearby(w, rec, at);
  const placeMemory=animalWitnessPlaceMemory(w, at, rec);
  const full={ tell, seen, nearby, placeMemory };
  if(rec.dm.ally===true) full.guide={ available:true, recallable:true, to:tell.boundTo };
  return animalWitnessGate(w, rec, full);
}

/* ANIMAL-SOCIAL.md §5/§6 U6 — pack-tag shared attitude: pack-tagged animals (rec.dm.packTag,
   stamped at mint off the wild-animal-kind row's own Tags column — src/engine/codex-roll.js) share
   attitude WITHIN THE SAME NODE ("befriend the pack leader, befriend the pack; wrong one, all of
   them"); solitary-tagged rows (packTag falsy) never propagate. Scoped to `rec.status.at` ONLY —
   never cross-node (a pack's reputation doesn't precede it to the next valley, §6's own accept
   criterion). Writes every OTHER pack member via the real codexSetAttitude writer (never a raw
   status.attitude mutation), so each member's own per-record floor/ceiling clamp still applies —
   propagation can't push a member past ITS OWN ceiling even if the source shift could. Called from
   dm.js's social_check/attitude_shift handlers (the same call sites the U5 promotion/ally stamps
   already use) — deliberately not a standalone event/DM_EVENT_TYPES entry, same posture as
   animalMaybePromote. Returns the array of propagated-to ids (empty/no-op-safe throughout). */
function animalPropagatePackAttitude(w, rec, newValue, cause){
  if(!w || !rec || !(rec.dm && rec.dm.packTag) || newValue==null) return [];
  const at=rec.status && rec.status.at;
  if(!at || typeof codexOf!=="function" || typeof codexSetAttitude!=="function" || typeof codexGetAttitude!=="function") return [];
  const C=codexOf(w);
  const propagated=[];
  Object.values(C.records).forEach(other=>{
    if(!other || other.id===rec.id) return;
    if(!(other.kind==="npc" && other.dm && other.dm.partialKind==="animal" && other.dm.packTag)) return;
    if(!(other.status && other.status.at===at)) return;
    const a=codexGetAttitude(w, other.id);
    if(!a || a.value===newValue) return;
    codexSetAttitude(w, other.id, newValue, cause||"pack-attitude", (typeof clockOf==="function")?clockOf(w).day:null);
    propagated.push(other.id);
  });
  return propagated;
}

/* ANIMAL-SOCIAL.md §4/§6 U5 — promotion: any animal engaged twice, named (codexUpdate above), or
   raised past +0 (Friendly) promotes from ambient to a full codex record — drop `dm.ambient` (keep
   the rest of the partial stack: partial:true/partialKind/fields.animalKind/dm.tell/dm.need/
   fields.care all survive untouched — "keep the partial stack"). Promotion locks the record to
   canon (status.soft:false, same posture as codexContact's canon-lock, so codexEvictSoft's pool-
   recycling sweep — `status.soft && !status.known` — can never touch it again) and stamps a home
   node (dm.homeNodeId) so it "recurs via prep at its territory/home node like any cast NPC."
   Idempotent (`dm.promoted` guards a second call from re-stamping/re-logging) — that idempotency
   guard is ALSO what keeps landmark row-12 animals (minted already dm.promoted:true) a guaranteed
   no-op here; it is not the ambient check's job. The wilderness territory-holder (ANIMAL-SOCIAL.md
   §4's "the one who gets promoted first") mints with `dm.ambient:false` too (prepCastEnvAnimals) —
   that flag was never meant to gate the holder, only to mark it as not an ordinary disposable
   ambient draw, so the holder must pass this guard on `dm.territoryHolder` as well.
   HQ-2 (docs/ANIMAL-SOCIAL-HQ.md): fixed a guard that read `!rec.dm.ambient` and silently killed
   every holder-promotion trigger. Null-safe/non-animal -> false. */
function animalMaybePromote(w, rec, cause){
  if(!rec || rec.kind!=="npc" || !(rec.dm && rec.dm.partialKind==="animal")) return false;
  if(rec.dm.promoted) return false;                  // already promoted — no-op (also excludes landmarks)
  if(!rec.dm.ambient && !rec.dm.territoryHolder) return false;   // not an ambient record and not the holder
  const a=(typeof codexGetAttitude==="function") ? codexGetAttitude(w, rec.id) : null;
  const attitudeAboveZero=!!(a && a.value>0);
  const engagedTwice=(rec.dm.animalContactCount||0)>=2;
  const named=!!rec.dm.named;
  if(!engagedTwice && !named && !attitudeAboveZero) return false;
  rec.dm.ambient=false;
  rec.dm.promoted=true;
  rec.dm.homeNodeId=rec.status && rec.status.at || null;
  rec.status=rec.status||{};
  rec.status.soft=false;
  codexTouch(codexOf(w), rec);
  addLedger(w,"canon",{kind:"animal-promoted",id:rec.id,cause:cause||null,homeNodeId:rec.dm.homeNodeId,source:"play"},
    `◆ ${rec.name||rec.fields&&rec.fields.animalKind||"the animal"} — no longer a passing face; it belongs to this place now.`);
  return true;
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
