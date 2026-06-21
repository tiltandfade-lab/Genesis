/* GENESIS MODULE — src/world/fate.js — the death/fate system (spawn-back or move on)
   Carved from genesis.html monolith on 2026-06-20 (Pass 8, app-core). AST-extracted (acorn).
   Classic <script>, shared global scope. Reads GS.* state + data consts (STAGES/WORLDBEATS/...) at call-time. */

function killCharacter(id){
  const w=activeWorld();if(!w)return;
  const c=w.characters.find(x=>x.id===id);if(!c)return;
  const where=prompt(`Where did ${c.name} fall? (a place, or leave blank)`,w.seed.master.name)||"parts unknown";
  c.status="fallen";c.fellAt=Date.now();c.fellWhere=where.trim()||"parts unknown";
  logEvent(w,`<span style="color:var(--blood)">${c.name} fell at ${c.fellWhere}.</span>`);
  saveU(U);
  openFate(c);
}

function openFate(c){
  GS.FATE_CTX=c;
  document.getElementById("fateWho").textContent=`${c.name} has fallen at ${c.fellWhere}. Roll to see if the world lets them spawn back into the same adventure — or moves on without them.`;
  document.getElementById("fateDie").textContent="d20";
  document.getElementById("fateVerdict").textContent="";document.getElementById("fateVerdict").className="fate-verdict";
  document.getElementById("fateActions").innerHTML=`<button class="btn primary" onclick="rollFate()">⚅ Roll your fate</button>`;
  document.getElementById("fateModal").classList.add("show");
}

function rollFate(){
  const r=rollDie(20);
  dieRoll(document.getElementById("fateDie"),{result:r,faces:20,done:false,onDone:()=>finishFate(r)});
}

function finishFate(r){
  const die=document.getElementById("fateDie");die.textContent=r;
  const v=document.getElementById("fateVerdict");const w=activeWorld();const c=GS.FATE_CTX;
  if(r>=FATE_THRESHOLD){
    v.textContent=`${r} — the thread holds. A new soul spawns back into the adventure at ${c.fellWhere}.`;v.className="fate-verdict back";
    c.fate=`A successor rolled back in (fate ${r}).`;
    document.getElementById("fateActions").innerHTML=`<button class="btn primary" onclick="closeFate(true,'${encodeURIComponent(c.fellWhere)}')">Spawn back in →</button>`;
  } else {
    v.textContent=`${r} — the world moves on. ${c.name} is gone for good; the next soul must find their own way in.`;v.className="fate-verdict gone";
    c.fate=`The world moved on (fate ${r}).`;
    document.getElementById("fateActions").innerHTML=`<button class="btn" onclick="closeFate(false,'')">A new soul enters →</button>`;
  }
  saveU(U);
}

function closeFate(back,where){
  document.getElementById("fateModal").classList.remove("show");
  if(back)rollCharacter(decodeURIComponent(where)); else rollCharacter();
}
