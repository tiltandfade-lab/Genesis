/* GENESIS MODULE — src/engine/crit.js — the Critical-Magnitude engine (docs/CRIT-MAGNITUDE.md §1, §4).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   The honest-dice spike. A natural 20 / natural 1 on any d20 action demands a SECOND d20 — the
   magnitude die. The first die sets DIRECTION (triumph/disaster); the second sets HOW FAR — two axes
   at once: how many distinct things change (count) and how far each reaches (scope). rollCritMagnitude
   maps the band → a lens count, draws that many DISTINCT lenses from the compiled
   `mythic-success-lenses` / `mythic-failure-lenses` (d12 each), and — if the row-1 "a place is
   transformed/scarred" lens fires — routes into the Myth suite (rolls `myth-seeds` as the entry).
   It returns an ATOM payload only (rolled dice verbatim + the drawn lens vectors); it NEVER writes the
   world — the DM narrates the shape, then emits a `crit_outcome` event (world.dm) to canonize a Mythic
   result to the Ledger. Reads rollExpr + rollTable (engine.compiled) at call-time. */

/* the band table (CRIT-MAGNITUDE §1): natural ∈ {20,1}, magnitude d20 → {tier, scope, lensMin, lensMax}.
   PURE (a lookup — no dice; rollCritMagnitude realizes the count from the range). Failure runs INVERTED —
   on a nat 1, LOWER is worse (1 is the floor of catastrophe). The "2–3" band is a min/max the roller
   rolls within; mythic is a fixed 3-lens cascade. */
function critBand(natural, mag){
  if(natural===20){
    if(mag<=10) return { tier:"standard",        scope:"local",    lensMin:0, lensMax:0 };
    if(mag<=14) return { tier:"amplified-minor",  scope:"regional", lensMin:1, lensMax:1 };
    if(mag<=19) return { tier:"amplified-major",  scope:"regional", lensMin:2, lensMax:3 };
    return            { tier:"mythic",           scope:"planar",   lensMin:3, lensMax:3, cascade:true }; // 20/20
  }
  // natural === 1 (inverted)
  if(mag>=11) return { tier:"standard",        scope:"local",    lensMin:0, lensMax:0 };
  if(mag>=7)  return { tier:"amplified-minor",  scope:"local",    lensMin:1, lensMax:1 };
  if(mag>=2)  return { tier:"amplified-major",  scope:"regional", lensMin:2, lensMax:3 };
  return           { tier:"mythic",           scope:"planar",   lensMin:3, lensMax:3, cascade:true };    // 1/1
}

/* draw `count` DISTINCT lenses (reroll duplicates — count = kinds, intensity = degree; keep them
   separate). Each lens is a VECTOR (a kind of permanent change); the DM fills the content. Row 1 of
   each lens table is the "a place is transformed / scarred" handoff to the Myth suite. */
function critDrawLenses(success, count){
  const tableId = success ? "mythic-success-lenses" : "mythic-failure-lenses";
  const seen=new Set(), lenses=[]; let guard=0;
  while(lenses.length<count && guard++<60){
    const r=rollTable(tableId); if(!r) break;
    if(seen.has(r.total)){ if(seen.size>=12) break; continue; }   // distinct; bail if the d12 is exhausted
    seen.add(r.total);
    const c=r.cells||[];
    lenses.push({ row:r.total, lens:c[0]||r.text||null, detail:c[1]||null, placeHandoff:r.total===1 });
  }
  return lenses;
}

/* rollCritMagnitude(natural, opts) → the crit-outcome atom (or null if not a crit).
   opts: {magnitude?} — pass the openly-rolled second d20 (Charter §6.1 dice transparency); else rolled
   here. Returns {natural, magnitude, success, tier, scope, cascade, lensCount, lenses[], placeHandoff,
   mythSeed?, canon}. `canon:true` means a Mythic result the DM should write to the Ledger as permanent
   canon. Does not mutate the world. */
function rollCritMagnitude(natural, opts){
  opts=opts||{};
  if(natural!==20 && natural!==1) return null;                    // only crits trigger the magnitude die
  const success=natural===20;
  const mag=(typeof opts.magnitude==="number") ? opts.magnitude : rollExpr("d20");
  const band=critBand(natural, mag);
  // realize the count from the band's range (the roller owns the dice; critBand stays pure)
  const lensCount=band.lensMin + (band.lensMax>band.lensMin ? rollExpr("d"+(band.lensMax-band.lensMin+1))-1 : 0);
  const lenses=lensCount>0 ? critDrawLenses(success, lensCount) : [];
  const out={ natural, magnitude:mag, success,
    tier:band.tier, scope:band.scope, cascade:!!band.cascade,
    lensCount, lenses,
    placeHandoff:lenses.some(l=>l.placeHandoff),
    canon:band.tier==="mythic" };
  if(out.placeHandoff){                                             // the place lens routes into the Myth suite
    const seed=rollTable("myth-seeds");
    if(seed) out.mythSeed={ row:seed.total, text:seed.text };      // Seed → (DM continues Costs → Geography)
  }
  return out;
}
