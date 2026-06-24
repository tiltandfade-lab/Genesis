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
  const dice=t.dice||("d"+t.die),total=rollExpr(dice);
  const row=t.rows.find(r=>total>=r[0]&&total<=r[1])||t.rows[t.rows.length-1];
  return {id,dice,total,band:row[2],text:row[3],fragment:row[4],cells:row[5]||null};}
