/* Genesis module: engine.core
 * owns: rollDie, lookup, uid, pick
 * Core engine utilities. lookup() reads T + fragAt at call-time (global scope).
 * Classic <script> (shares global scope). Registered in manifest.json — run build/check-manifest.py after edits. */
function rollDie(max){return Math.floor(Math.random()*max)+1;}
function lookup(name){const tbl=T[name];if(!tbl||!tbl.rows||!tbl.rows.length){console.warn("lookup: no table '"+name+"' in T — returning empty result");return {roll:0,idx:-1,cat:"",name:"",desc:"",frag:""};}const r=rollDie(tbl.die);let idx=tbl.rows.findIndex(x=>r>=x[0]&&r<=x[1]);if(idx<0)idx=0;const row=tbl.rows[idx];return {roll:r,idx,cat:row[2],name:row[3],desc:row[4],frag:fragAt(name,idx)};}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
