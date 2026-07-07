/* GENESIS MODULE — src/engine/compiled.js — Track-B compiled-tables dice engine (CT reader + rollExpr + rollTable)
   Carved from genesis.html monolith on 2026-06-20 (Pass 5, logic-by-domain). Classic <script>, shared global scope. */

/* ============================================================
   COMPILED TABLES — the engine reads the 300+ tables compiled from
   the markdown source by compile-tables.py (loaded via tables.js).
   Dice-aware: rolls flat dN, bell NdM, and mixed (d12+d8) honestly.
   ============================================================ */
const CT=()=>window.GENESIS_TABLES||{};
function rollExpr(dice){ // "d100" | "2d20" | "d12+d8" -> a single total
  let tot=0;(dice||"d100").split("+").forEach(term=>{
    const m=term.trim().match(/^(\d*)d(\d+)$/i);if(!m)return;
    const n=+(m[1]||1),s=+m[2];for(let i=0;i<n;i++)tot+=1+Math.floor(Math.random()*s);});
  return tot;}
function rollTable(id){ // -> {id,dice,total,band,text,fragment} or null
  const t=CT()[id];if(!t)return null;
  // TABLE-ATLAS.md unit U1 — roll-count telemetry seam: a transient in-memory tally on GS
  // (CLAUDE.md "New mutable state goes in GS"). Guarded no-op when GS is absent (e.g. an
  // Oracle-only jsdom harness that loads compiled.js without state.js) — never load-bearing.
  try{ if(typeof GS!=="undefined"&&GS){ const c=(GS.tableRolls=GS.tableRolls||{}); c[id]=(c[id]||0)+1; } }catch(_){/* tally never load-bearing on a roll */}
  const dice=t.dice||("d"+t.die),total=rollExpr(dice);
  const row=t.rows.find(r=>total>=r[0]&&total<=r[1])||t.rows[t.rows.length-1];
  // row[6]/row[7] = DM-only Consequence-Ladder tags (legs/pool) — present only on tagged tables (else "").
  // row[8]/row[9] = SKIN-GRANTS.md §1/§1b DM-only tags (grants/motif) — present only on the three Walk
  // Skin tables today (else ""); untagged tables are byte-identical (rollTable's shape unchanged).
  return {id,dice,total,band:row[2],text:row[3],fragment:row[4],cells:row[5]||null,legs:row[6]||"",pool:row[7]||"",
          grants:row[8]||"",motif:row[9]||""};}

/* SPICE-RAISE §2b — band-first row pick: uniform among the table's rows AT the target band,
   stepping DOWN the ladder when the band has no rows (a table's class ceiling is law — asking a
   Spark table for Mythic serves its hottest available band, never invents heat). Ungraded table
   (no row matches any band at/below target) -> honest flat rollTable fallback. Missing table -> null. */
function rollTableAtBand(id, band){
  const t=CT()[id]; if(!t) return null;
  const ladder=["Grounded","Textured","Strange","Volatile","Mythic"];
  let bi=ladder.indexOf(band);
  if(bi<0) return rollTable(id);
  for(; bi>=0; bi--){
    const rows=t.rows.filter(r=>r[2]===ladder[bi]);
    if(rows.length){
      const row=rows[Math.floor(Math.random()*rows.length)];
      const total=row[0]+Math.floor(Math.random()*(row[1]-row[0]+1)); // an honest total WITHIN the row's range, so "#total" refs stay real
      const dice=t.dice||("d"+t.die);
      return {id,dice,total,band:row[2],text:row[3],fragment:row[4],cells:row[5]||null,
              legs:row[6]||"",pool:row[7]||"",grants:row[8]||"",motif:row[9]||"",bandTarget:band};
    }
  }
  return rollTable(id);
}
/* rollTableSpiced(id,tier) — the one-call consumer surface: tier -> band -> row. Degrades to
   flat rollTable when engine.region hasn't loaded (lean harness). */
function rollTableSpiced(id, tier){
  if(typeof spiceBandPick!=="function") return rollTable(id);
  return rollTableAtBand(id, spiceBandPick(tier||"baseline"));
}
