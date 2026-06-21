/* GENESIS MODULE — src/engine/tables.js — table-roll primitives (rollTbl, fragAt, ebRoll, concretize)
   Carved from genesis.html monolith on 2026-06-20 (Pass 3, logic-by-domain: engine).
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Reads carved data (EB/FRAG/SS/SS_CONC; rollDie from engine.core) at call-time. */

function ebRoll(slot){const r=rollTbl(EB[slot]);return {text:r.text,src:"fresh",band:r.tag||"Grounded"};}

function fragAt(key,idx){const a=FRAG[key];return (a&&idx>=0&&idx<a.length)?a[idx]:"";}
function rollTbl(tbl,mod){const n=tbl.d||1;let base=0;for(let i=0;i<n;i++)base+=rollDie(tbl.die);const total=base+(mod||0);
  let idx=tbl.rows.findIndex(r=>total>=r[0]&&total<=r[1]);if(idx<0)idx=tbl.rows.length-1;const row=tbl.rows[idx];
  return {roll:base,total,idx,text:row[2],tag:(typeof row[3]==="string"?row[3]:""),mod:(typeof row[3]==="number"?row[3]:0)};}
function concretize(tag){
  if(tag==="beast")return {kind:"beast",text:"a specific creature preying from the underbelly (pull one from the monster library)"};
  if(!SS_CONC[tag])return null;
  const r=rollTbl(SS[SS_CONC[tag]]);let txt=r.text;
  if(tag==="intrusion")txt+=" — manifesting as "+rollTbl(SS.cIntrusionManifest).text;
  return {kind:tag,text:txt};}
