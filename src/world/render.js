/* GENESIS MODULE — src/world/render.js — the world renders (DOM)
   Carved from genesis.html monolith on 2026-06-20 (Pass 6). Classic <script>, shared global scope.
   AST-extracted (acorn) by exact offsets. Creator renders (renderBardo/renderCharge) stay in their domain. */

function renderHexMap(w){
  const m=mapOf(w),ids=Object.keys(m.nodes);if(!ids.length)return '<div class="empty">No places mapped yet.</div>';
  ids.forEach((id,i)=>{const nn=m.nodes[id];if(nn.x==null){const a=i*2.39966,rad=2+(i%3);nn.x=Math.cos(a)*rad;nn.y=Math.sin(a)*rad;}});
  let minx=0,maxx=0,miny=0,maxy=0;ids.forEach(id=>{const nn=m.nodes[id];minx=Math.min(minx,nn.x);maxx=Math.max(maxx,nn.x);miny=Math.min(miny,nn.y);maxy=Math.max(maxy,nn.y);});
  const pad=HEXW*4;minx-=pad;maxx+=pad;miny-=pad;maxy+=pad;
  let maxD=1;ids.forEach(id=>{const a=worldToAxial(m.nodes[id].x,m.nodes[id].y);maxD=Math.max(maxD,hexDist(a.q,a.r));});w._frayStart=maxD+2;
  const aMin=worldToAxial(minx,miny),aMax=worldToAxial(maxx,maxy);
  const qlo=Math.min(aMin.q,aMax.q)-3,qhi=Math.max(aMin.q,aMax.q)+3,rlo=Math.min(aMin.r,aMax.r)-3,rhi=Math.max(aMin.r,aMax.r)+3;
  const VW=460,VH=300,mg=12,sx=(VW-2*mg)/((maxx-minx)||1),sy=(VH-2*mg)/((maxy-miny)||1),s=Math.min(sx,sy);
  const tx=x=>(mg+(x-minx)*s),ty=y=>(mg+(y-miny)*s),hpx=HEXW*s;
  function hexPath(cx,cy,size){let p="";for(let k=0;k<6;k++){const ang=Math.PI/180*(60*k-90),px=cx+size*Math.cos(ang),py=cy+size*Math.sin(ang);p+=(k?"L":"M")+px.toFixed(1)+" "+py.toFixed(1);}return p+"Z";}
  let hexes="";
  for(let q=qlo;q<=qhi;q++)for(let r=rlo;r<=rhi;r++){const wc=axialToWorld(q,r);if(wc.x<minx||wc.x>maxx||wc.y<miny||wc.y>maxy)continue;
    const t=terrainAt(w,q,r);if(t.dist>w._frayStart+4)continue;
    const fill=t.fray>0.85?"#0e0b07":t.color,op=(1-t.fray*0.8).toFixed(2),
      stroke=(t.strange&&t.fray<0.85)?' stroke="#7a5cff" stroke-width="0.7"':' stroke="#0a0805" stroke-width="0.4"';
    hexes+=`<path d="${hexPath(tx(wc.x),ty(wc.y),hpx*0.92)}" fill="${fill}" fill-opacity="${op}"${stroke}/>`;}
  const edges=m.edges.map(e=>{const p=nodeXY(w,e.from),qn=nodeXY(w,e.to);if(!p||!qn)return"";
    return `<line x1="${tx(p.x).toFixed(1)}" y1="${ty(p.y).toFixed(1)}" x2="${tx(qn.x).toFixed(1)}" y2="${ty(qn.y).toFixed(1)}" stroke="#1c1610" stroke-width="1.2"/>`;}).join("");
  const nodes=ids.map(id=>{const nn=m.nodes[id],cx=tx(nn.x),cy=ty(nn.y),cur=id===w.currentNodeId,set=nn.type==="Setting";
    const fill=cur?"#c9a24b":set?"#241d15":"#0e0b07",stroke=cur?"#e0c074":"#3a3026";
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${cur?7:5}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`+
      `<text x="${cx.toFixed(1)}" y="${(cy-9).toFixed(1)}" fill="${cur?'#e0c074':'#cdbf9e'}" font-size="9" text-anchor="middle">${nn.name}${cur?' ◆':''}</text>`;}).join("");
  return `<svg viewBox="0 0 ${VW} ${VH}" style="width:100%;max-width:480px;height:auto;display:block;margin:2px auto;background:#0a0805;border:1px solid var(--edge);border-radius:8px">${hexes}${edges}${nodes}</svg>`;}

function renderOpening(w,c){
  const en=c.entry;if(!en)return"";const B=en.bundle||{};
  const meta={enemies:["⚔","Enemies"],friends:["🤝","Friends"],complications:["🪢","Complications"],things:["◈","Things"],places:["⌖","Places"]};
  // spice juice — celebrate intensity (band), don't spoil content (SPICE-CURVE §5)
  const spice={Strange:["Bizarre","#8f7fc0"],Volatile:["Otherworldly","#c07a3a"],Mythic:["SPICY","#c4435e"]};
  const chip=x=>{const s=spice[x.band];return s?` <span style="font-size:9px;color:${s[1]};border:1px solid ${s[1]};border-radius:6px;padding:0 4px;letter-spacing:.08em;vertical-align:1px">${s[0]}</span>`:"";};
  const rows=["enemies","friends","complications","things","places"].map(k=>{
    const items=(B[k]||[]);if(!items.length)return"";
    return `<div style="display:flex;gap:8px;padding:5px 0;border-top:1px solid var(--edge)">
      <span style="width:18px;text-align:center">${meta[k][0]}</span>
      <span style="width:96px;color:var(--ink-dim);font-size:11px;letter-spacing:.06em;text-transform:uppercase;flex-shrink:0">${meta[k][1]}</span>
      <span style="color:var(--bone);font-size:13px">${items.map(x=>x.text+(x.src==="past"?' <span style="color:var(--gold-soft);font-size:10px">⟡ your past</span>':"")+chip(x)).join("<br>")}</span></div>`;}).join("");
  return `<div class="section"><h3>The Opening <span style="color:var(--ink-dim);font-size:11px;letter-spacing:0;text-transform:none">your arrival — the DM holds what's hidden</span></h3>
    <div style="font-size:13px;color:var(--ink);margin-bottom:8px;line-height:1.55">You came here <strong style="color:var(--bone)">${en.why}</strong>; to <strong style="color:var(--bone)">${en.standingFaction}</strong> you are <strong style="color:var(--bone)">${en.standing}</strong>; you have <strong style="color:var(--bone)">${en.foot}</strong>.</div>
    ${en.tension?`<div style="font-size:13px;color:var(--gold-soft);margin-bottom:6px">◭ Looming: ${en.tension.dangerFrag||en.tension.danger}</div>`:""}
    ${rows}</div>`;
}

function renderPowers(w){
  if(!w.factions||!w.factions.length)return "";
  const fac=w.factions.map(f=>{const c=f.clock||{size:6,filled:0};
    return `<div class="gaz-item"><div class="gi-top"><span class="gtype">${f.dominant?'dominant':'rival'}</span><span class="gn">${f.name}</span><span style="margin-left:auto;color:var(--gold-soft);font-size:11px">clock ${c.filled}/${c.size}</span></div>
      <div class="gd">means to ${f.agenda}, through ${f.method}${f.tags&&f.tags.length?` · ${f.tags.join(', ')}`:''}${f.rel?` · ${f.rel}`:''}</div></div>`;}).join("");
  const pr=(w.pressures||[]).map(p=>{const c=p.clock||{size:6,filled:0};
    return `<div class="gaz-item"><div class="gi-top"><span class="gtype">${p.kind}</span><span class="gn">${p.dangerFrag||p.danger}</span><span style="margin-left:auto;color:var(--ink-dim);font-size:11px">clock ${c.filled}/${c.size}</span></div><div class="gd" style="font-style:italic;color:var(--ink-dim)">a standing pressure · its true shape is the DM's</div></div>`;}).join("");
  return `<div class="section"><h3>Powers &amp; Pressures <span style="color:var(--ink-dim);font-size:11px;letter-spacing:0;text-transform:none">${w.factions.length} factions · ${(w.pressures||[]).length} standing fronts · what they hide is the DM's</span></h3>${fac}${pr}</div>`;}

function escHtml(s){return (s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}

/* The DM feed — the chat-first play surface for the DM Bridge (docs/DM-BRIDGE.md, NEW-GAME-FLOW §9
   lane B). A scrolling chronicle of player turns + DM narration, the "DM is considering…" indicator,
   the roll-handshake affordance, the three-options ask, and the free-text action box. Logic lives in
   src/world/dm.js (dmSend/dmRollFor/sendTurn); this just paints GS.dm + dmLogOf(w). */
function renderDMFeed(w){
  const log=dmLogOf(w);
  const feed=log.length?log.slice(-24).map(m=>{
    if(m.role==="player"){
      const rolls=(m.rolls&&m.rolls.length)?` <span class="dm-roll">⚅ ${m.rolls.map(r=>escHtml(r.label+" "+r.total)).join(", ")}</span>`:"";
      return `<div class="dm-msg dm-you"><span class="dm-who">You</span><div class="dm-txt">${escHtml(m.text)}${rolls}</div></div>`;
    }
    const ev=(m.events&&m.events.length)?`<div class="dm-events">${m.events.map(e=>`<span class="dm-ev">${escHtml(e.type)}</span>`).join("")}</div>`:"";
    return `<div class="dm-msg dm-dm"><span class="dm-who">DM</span><div class="dm-txt">${escHtml(m.text)}</div>${ev}</div>`;
  }).join(""):`<div class="empty">The DM is silent. Say or do something to begin — make sure <code>dev/dm-bridge.py</code> is running.</div>`;

  let foot="";
  if(GS.dm.pending){
    foot=`<div class="dm-pending">✦ <span id="dmDie" class="die-mini">d20</span> the DM is considering…</div>`;
  } else if(GS.dm.rollReq){
    const rq=GS.dm.rollReq, ab=(rq.ability||"").toUpperCase();
    foot=`<div class="dm-ask"><div class="dm-ask-q">The DM calls for a roll — <strong>${escHtml(rq.skill||"a check")}</strong>${ab?` (${escHtml(ab)})`:""}${rq.dcHidden?` · DC hidden`:""}. Roll openly:</div>
      <button class="btn sm" onclick="dmRollFor('${escHtml(rq.skill||"")}','${escHtml(rq.ability||"")}')">⚅ Roll ${escHtml(rq.skill||"the check")}</button></div>`;
  } else if(GS.dm.ask){
    const a=GS.dm.ask;
    const opts=(a.options||[]).map(o=>`<button class="btn ghost sm dm-opt" onclick="dmSend(${JSON.stringify(o).replace(/"/g,'&quot;')})">${escHtml(o)}</button>`).join("");
    foot=`<div class="dm-ask"><div class="dm-ask-q">${escHtml(a.prompt||"What do you do?")}</div><div class="dm-opts">${opts}</div>
      ${a.orElse!==false?`<div class="dm-orelse">…or something else — type it below.</div>`:""}</div>`;
  }
  const box=`<div class="dm-input"><textarea id="dmAction" rows="2" placeholder="What do you do?" onkeydown="if(event.key==='Enter'&&(event.metaKey||event.ctrlKey)){event.preventDefault();dmSend();}"></textarea>
    <button class="btn sm" onclick="dmSend()" ${GS.dm.pending?"disabled":""}>Send ▸</button></div>`;

  return `<div class="section dm-section"><h3>The DM <span style="color:var(--ink-dim);font-size:11px;letter-spacing:0;text-transform:none">live · narration is definitive · you roll your own dice</span></h3>
    <div class="dm-feed">${feed}</div>${foot}${box}</div>`;
}

function renderWorld(){
  const w=activeWorld();const host=document.getElementById("worldView");
  if(!w){host.innerHTML=`<div class="empty">No world is open.<br>Go to the Universe and forge or enter one.</div>`;return;}
  const s=w.seed;
  const living=w.characters.filter(c=>c.status==="living");
  const fallen=w.characters.filter(c=>c.status==="fallen");
  const cur=living[living.length-1]||null;

  let charHtml;
  if(cur){
    const sh=cur.sheet;
    const sheetLine=sh?`<div class="status living" style="color:var(--gold-soft)">${sh.species} ${sh.class} · ${sh.background} · HP ${sh.hp} · AC ${sh.ac}${sh.feat?` · ${sh.feat}`:""}</div>`:"";
    charHtml=`<div class="char-strip"><div class="char-av">☖</div>
      <div><div class="cn">${cur.name}</div><div class="cs">${cur.headline||cur.spark}</div>
      ${sheetLine}
      <div class="status living">living · ${cur.bornWhere||w.seed.master.name}</div></div>
      <div class="char-actions">
        <button class="btn sm" onclick="handToDM()">✦ Hand to your DM</button>
        <button class="btn ghost sm" onclick="killCharacter('${cur.id}')">They fall…</button>
      </div></div>`;
  } else {
    charHtml=`<div class="char-strip"><div class="char-av">·</div>
      <div><div class="cn">No living soul here</div><div class="cs">the world waits for someone to walk into it</div></div>
      <div class="char-actions"><button class="btn sm" onclick="rollCharacter()">⚅ Roll a soul into the world</button></div></div>`;
  }

  const gazOrder=["Setting","Place","Faction","NPC","Myth"];
  const gazLabel={Setting:"The Place Itself",Place:"Places",Faction:"Powers",NPC:"Souls Met",Myth:"Myths & Whispers"};
  let gazHtml=gazOrder.map(type=>{
    const items=w.gazetteer.filter(g=>g.type===type);if(!items.length)return"";
    return items.map(g=>`<div class="gaz-item"><div class="gi-top"><span class="gtype">${type}</span>
      <span class="gn">${g.name}</span>${g.cat?`<span class="cat ${g.cat.replace(/\s/g,'')}" style="margin-left:auto">${g.cat}</span>`:""}</div>
      <div class="gd">${g.desc}</div></div>`).join("");
  }).join("");

  host.innerHTML=`
    <div class="wv-head">
      <div>
        <h2>${w.name}</h2>
        <div class="wv-setting"><strong style="color:var(--bone)">${s.master.name}.</strong> ${s.master.desc}</div>
        <div class="wv-sense">smells of ${s.smell.name.toLowerCase()} · sounds of ${s.sound.name.toLowerCase()} · built of ${s.arch.name.toLowerCase()} · taboo: ${s.taboo.name.toLowerCase()}</div>
      </div>
      <div class="clock-hud">
        <div class="ch-time">${fmtClock(w)}</div>
        <div class="ch-sess">Session ${w.session||0} · at ${nodeName(w,w.currentNodeId)}</div>
      </div>
    </div>
    ${allRevealed(w)?"":`<div style="text-align:right;margin:0 0 -4px"><button class="btn ghost sm" onclick="showAllPanels()" style="font-size:11px;color:var(--ink-dim)">⊕ reveal all panels</button></div>`}

    <div class="section"><h3>The Soul in Play</h3>${charHtml}</div>
    ${cur&&cur.entry?renderOpening(w,cur):""}

    ${cur?renderDMFeed(w):""}

    <div class="section"><h3>Explore — roll a new corner into being</h3>
      <div class="explore-row">
        <button class="btn sm" onclick="explore('nearby','Place')">⚅ Travel to a new place</button>
        <button class="btn sm" onclick="explore('faction','Faction')">⚅ Cross a new power</button>
        <button class="btn sm" onclick="explore('myth','Myth')">⚅ Hear a new whisper</button>
      </div>
    </div>

    <div class="section"><h3>Time &amp; Transitions <span style="color:var(--ink-dim);font-size:11px;letter-spacing:0;text-transform:none">the clock moves only here</span></h3>
      <div class="explore-row">
        <button class="btn sm" onclick="beginSession()">§ Begin a new session</button>
        <button class="btn ghost sm" onclick="passTime('short')">⏳ Short rest · +1h</button>
        <button class="btn ghost sm" onclick="passTime('dawn')">☾ Rest until dawn</button>
        <button class="btn ghost sm" onclick="passTime('montage')">⏩ Montage · +1 day</button>
      </div>
    </div>

    ${isRevealed(w,'powers')?renderPowers(w):""}

    ${isRevealed(w,'map')?`<div class="section"><h3>The Map <span style="color:var(--ink-dim);font-size:11px;letter-spacing:0;text-transform:none">${Object.keys(mapOf(w).nodes).length} places · ${mapOf(w).edges.length} routes · terrain from the seed</span></h3>
      ${renderHexMap(w)}
      <div style="text-align:center;color:var(--ink-dim);font-size:11px;margin-top:4px">◆ you are here — nodes pinned over a hex terrain field that frays at the unexplored edge</div>
    </div>`:""}

    ${isRevealed(w,'ledger')?`<div class="section"><h3>The World State Ledger <span style="color:var(--ink-dim);font-size:11px;letter-spacing:0;text-transform:none">${ledgerOf(w).length} entries · append-only</span></h3>
      <div class="ledger-list">${renderLedger(w)}</div>
    </div>`:""}

    ${isRevealed(w,'gaz')?`<div class="section"><h3>The Gazetteer <span style="color:var(--ink-dim);font-size:11px;letter-spacing:0;text-transform:none">${w.gazetteer.length} discovered</span></h3>${gazHtml}</div>`:""}

    ${fallen.length?`<div class="section"><h3>The Fallen</h3>${fallen.map(c=>`<div class="grave-item"><span class="gname">${c.name}</span> — ${c.spark}. Fell at ${c.fellWhere||"parts unknown"}. ${c.fate||""}</div>`).join("")}</div>`:""}

    <div class="section"><h3>Chronicle</h3>${w.log.slice(0,14).map(l=>`<div class="logline"><span class="lt">${fmtDate(l.t)}</span> — ${l.text}</div>`).join("")||'<div class="empty">Nothing has happened yet.</div>'}</div>

    <div class="section" style="text-align:center;border:none">
      <button class="danger" onclick="destroyWorld('${w.id}')">Destroy this world forever</button>
    </div>`;
}

function renderMap(w){
  const m=mapOf(w),ids=Object.keys(m.nodes);
  if(!ids.length)return '<div class="empty">No places mapped yet.</div>';
  const W=440,H=250,cx=W/2,cy=H/2,R=Math.min(W,H)/2-46;
  const pos={};ids.forEach((id,i)=>{const a=(-90+i/ids.length*360)*Math.PI/180;
    pos[id]=ids.length===1?{x:cx,y:cy}:{x:cx+R*Math.cos(a),y:cy+R*Math.sin(a)};});
  const edges=m.edges.map(e=>{const p=pos[e.from],q=pos[e.to];if(!p||!q)return"";
    const mx=(p.x+q.x)/2,my=(p.y+q.y)/2;
    return `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="#3a3026" stroke-width="1.5"/>`+
      `<text x="${mx.toFixed(1)}" y="${(my-3).toFixed(1)}" fill="#a59c86" font-size="9" text-anchor="middle">${e.bearing} ~${(e.travelMin/60).toFixed(1)}h</text>`;}).join("");
  const nodes=ids.map(id=>{const p=pos[id],cur=id===w.currentNodeId,set=m.nodes[id].type==="Setting";
    const fill=cur?"#c9a24b":set?"#241d15":"#0e0b07",stroke=cur?"#e0c074":"#3a3026";
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${cur?9:6}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`+
      `<text x="${p.x.toFixed(1)}" y="${(p.y-13).toFixed(1)}" fill="${cur?'#e0c074':'#cdbf9e'}" font-size="10" text-anchor="middle">${m.nodes[id].name}${cur?' ◆':''}</text>`;}).join("");
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:460px;height:auto;display:block;margin:2px auto">${edges}${nodes}</svg>`;
}

function renderLedger(w){
  const L=ledgerOf(w);if(!L.length)return '<div class="empty">The ledger is empty.</div>';
  const icon={canon:"◆",transition:"⏳",spatial:"➶",clock:"☼",drift:"≈","npc-life":"☖",outcome:"✦",session:"§"};
  return L.slice().reverse().slice(0,20).map(e=>
    `<div class="led-item"><div class="led-meta"><span class="led-type led-${e.type}">${icon[e.type]||"•"} ${e.type}</span>`+
    `<span class="led-when">D${e.day} ${fmtTime(e.min)}${e.session?` · s${e.session}`:""}</span></div>`+
    `<div class="led-text">${e.text||JSON.stringify(e.data)}</div></div>`).join("");
}

function renderStart(){
  const host=document.getElementById("startView");if(!host)return;
  const n=Object.keys((typeof U!=="undefined"&&U.worlds)||{}).length;
  host.innerHTML=`<div class="bardo">
    <div class="start-title">GENESIS</div>
    <div class="bardo-guide">A world waits to be rolled into being, and a soul to walk it. Begin — the guide will lead you through.</div>
    <div class="bardo-nav"><button class="btn primary" onclick="newWorld()">✦ Begin</button></div>
    ${n?`<div style="margin-top:16px"><button class="btn ghost sm" onclick="showTab('universe')">↩ return to your worlds (${n})</button></div>`:""}
  </div>`;}

function renderShelf(){
  const shelf=document.getElementById("shelf");const ids=Object.keys(U.worlds);
  let cards=ids.map(id=>{
    const w=U.worlds[id];const living=w.characters.filter(c=>c.status==="living").length;const fallen=w.characters.filter(c=>c.status==="fallen").length;
    return `<div class="world-card ${U.activeWorldId===id?'active-w':''}" onclick="enterWorld('${id}')">
      ${U.activeWorldId===id?'<div class="badge">active</div>':''}
      <h3>${w.name}</h3>
      <div class="setting">${w.seed.master.name} — ${w.seed.master.desc}</div>
      <div class="stats"><span>${w.gazetteer.length} discovered</span><span>${living} living</span><span>${fallen} fallen</span></div>
    </div>`;
  }).join("");
  shelf.innerHTML=cards+`<div class="forge" onclick="newWorld()"><div class="plus">+</div><div>Forge a new world</div></div>`+soulsHTML();
  if(!ids.length){
    shelf.innerHTML=`<div class="forge" onclick="newWorld()" style="grid-column:1/-1;min-height:200px">
      <div class="plus">✦</div><div>Forge your first world</div>
      <div style="font-size:12px;color:var(--ink-dim);max-width:300px;text-align:center">Roll a world into being. It will persist here forever — across sessions, across characters — until you choose to destroy it.</div></div>`+soulsHTML();
  }
}
