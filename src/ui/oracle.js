/* GENESIS MODULE — src/ui/oracle.js — the Oracle tab (ORC state + render/roll over the compiled tables)
   Carved from genesis.html monolith on 2026-06-20 (Pass 5, logic-by-domain). Classic <script>, shared global scope. */


const ORC_SPICE={Strange:["Bizarre","#8f7fc0"],Volatile:["Otherworldly","#c07a3a"],Mythic:["SPICY","#c4435e"]};
function oracleRoll(id){GS.ORC.last=rollTable(id);fillOracleResult();}
function fillOracleResult(){
  const host=document.getElementById("oracleResult");if(!host)return;
  const r=GS.ORC.last;if(!r){host.innerHTML="";return;}
  const s=ORC_SPICE[r.band];
  host.innerHTML=`<div style="border:1px solid var(--gold);border-radius:10px;background:#241d15;padding:12px 14px;margin-bottom:14px">
    <div style="font-size:14px;color:var(--ink-dim);letter-spacing:.06em;text-transform:uppercase">${r.id} · rolled ${r.dice} → ${r.total}${r.band?" · "+r.band:""}</div>
    <div style="font-size:20px;color:var(--bone);margin-top:5px">${r.text||"(no text)"}${s?` <span style="font-size:12px;color:${s[1]};border:1px solid ${s[1]};border-radius:6px;padding:0 4px;letter-spacing:.08em">${s[0]}</span>`:""}</div>
    <button class="btn sm" style="margin-top:8px" onclick="oracleRoll('${r.id}')">⚅ Roll again</button></div>`;}
function fillOracleList(){
  const host=document.getElementById("oracleList");if(!host)return;
  const CTB=CT(),q=GS.ORC.q.toLowerCase();
  const matched=Object.keys(CTB).filter(id=>id.includes(q)||(CTB[id].domain||"").toLowerCase().includes(q)).sort();
  const byDom={};matched.forEach(id=>{(byDom[CTB[id].domain||"—"]=byDom[CTB[id].domain||"—"]||[]).push(id);});
  host.innerHTML=Object.keys(byDom).sort().map(dom=>`<div style="margin-bottom:10px"><div style="font-size:14px;color:var(--gold-soft);letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px">${dom}</div>`+
    byDom[dom].map(id=>`<button class="btn ghost sm" style="margin:2px" onclick="oracleRoll('${id}')">${id.replace(/-/g," ")}</button>`).join("")+`</div>`).join("")
    ||`<div style="color:var(--ink-dim)">no tables match "${GS.ORC.q}"</div>`;}
function renderOracle(){
  const host=document.getElementById("oracleView");if(!host)return;
  const ids=Object.keys(CT());
  if(!ids.length){host.innerHTML=`<div class="section"><h3>The Oracle</h3>
    <div style="color:var(--ink-dim);font-size:17px;line-height:1.7">No compiled tables loaded yet. Generate them:<br>
    <code style="color:var(--gold-soft)">python3 "Engine/00. _System/compile-tables.py" --emit</code><br>
    then reload — it writes <code>tables.js</code> beside this file.</div></div>`;return;}
  host.innerHTML=`<div class="section"><h3>The Oracle <span style="color:var(--ink-dim);font-size:14px;letter-spacing:0;text-transform:none">${ids.length} compiled tables · roll any of them</span></h3>
    <div id="oracleResult"></div>
    <input id="oracleSearch" type="text" placeholder="filter tables…" oninput="GS.ORC.q=this.value;fillOracleList()"
      style="width:100%;box-sizing:border-box;padding:7px 10px;margin-bottom:12px;background:var(--vellum-2);border:1px solid var(--edge);border-radius:8px;color:var(--ink)">
    <div id="oracleList" style="max-height:440px;overflow:auto"></div></div>`;
  document.getElementById("oracleSearch").value=GS.ORC.q;
  fillOracleResult();fillOracleList();}
