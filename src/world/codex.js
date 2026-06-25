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

/* mint or merge a record (idempotent). rec: {id?,kind,name,rolled?,fields?,dm?,links?,status?,provenance?,source?} */
function codexAdd(w, rec){
  const C=codexOf(w);
  const id=rec.id || codexKeyId(rec.kind, rec.name);
  const ex=C.records[id];
  if(ex){
    if(rec.rolled && !ex.rolled) ex.rolled=rec.rolled;
    if(rec.fields) Object.assign(ex.fields, rec.fields);
    if(rec.dm)     Object.assign(ex.dm, rec.dm);
    if(rec.source && !ex.source) ex.source=rec.source;
    if(rec.status) Object.assign(ex.status, rec.status);
    (rec.links||[]).forEach(l=>{ if(!ex.links.some(x=>x.rel===l.rel&&x.to===l.to)) ex.links.push(l); });
    return ex;
  }
  const r={ id, kind:rec.kind||"thing", name:rec.name||id,
    rolled:rec.rolled||null, fields:rec.fields||{}, dm:rec.dm||{}, links:rec.links||[],
    status:Object.assign({ known:false, soft:(rec.provenance!=="authored"), at:null, condition:"ok" }, rec.status||{}),
    provenance:rec.provenance||"authored", source:rec.source||null, ledgerRefs:rec.ledgerRefs||[] };
  C.records[id]=r; return r;
}

/* add a typed relationship (stored once on the `from` record; codexLinksOf reads it both ways). */
function codexLink(w, from, rel, to){
  const a=codexGet(w,from); if(!a) return null;
  if(!a.links.some(l=>l.rel===rel&&l.to===to)) a.links.push({rel,to});
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

function codexUpdate(w, id, patch){
  const r=codexGet(w,id); if(!r) return null;
  if(patch.fields) Object.assign(r.fields, patch.fields);
  if(patch.dm)     Object.assign(r.dm, patch.dm);
  if(patch.status) Object.assign(r.status, patch.status);
  return r;
}
function codexReveal(w, id){ const r=codexGet(w,id); if(r) r.status.known=true; return r; }

/* the player TOUCHED it → lock to canon forever (soft→hard; never recontextualized again). */
function codexContact(w, id){ const r=codexGet(w,id); if(r){ r.status.soft=false; r.status.known=true; } return r; }

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

/* DM-facing slice (all-seeing): every record, compact, WITH dm-only fields. */
function codexDigest(w){
  return Object.values(codexOf(w).records).map(r=>({
    id:r.id, kind:r.kind, name:r.name, fields:r.fields, dm:r.dm,
    links:r.links, status:r.status, source:r.source, provenance:r.provenance }));
}

/* PLAYER-facing projection: only KNOWN records, sanitized (no dm-only fields), links pruned to other
   known records (so a link never leaks an unknown entity). This is the only entity view the player sees. */
function codexPlayerView(w){
  const C=codexOf(w); const known=id=>C.records[id] && C.records[id].status.known;
  return Object.values(C.records).filter(r=>r.status.known).map(r=>({
    id:r.id, kind:r.kind, name:r.name, fields:r.fields,
    links:(r.links||[]).filter(l=>known(l.to)), status:{ at:r.status.at, condition:r.status.condition } }));
}

/* provenance / mechanical-vs-invented audit — the anti-drift ratio test (docs/CODEX.md).
   "Mechanical" = the record has a real `rolled` payload (the engine dealt the atoms); "invented" = the
   DM conjured it with no dice behind it (legacy `authored` prose, or a from-scratch codex_add). The
   Codex's whole job is to push this ratio toward mechanical. Saltrest baseline (the cast-invented first
   playtest) ≈ 0.20. `recontextualized` records count as mechanical AND are the highest-value transform —
   the rolled soul preserved, the role reassigned (never a wholesale recycle: the architecture forces it,
   since soft entities must be re-fielded to be reused and touched ones lock forever). */
function codexIsMechanical(r){ return !!(r.rolled && Object.keys(r.rolled).length); }
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
    if(!C.records[id]) codexAdd(w,{ id, kind, name:g.name, provenance:"authored",
      fields:{ desc:g.desc||null, cat:g.cat||null }, status:{ known:!!g.known, soft:false } }); });
  w._codexInit=true;
}
