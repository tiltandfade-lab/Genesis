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
      return `<div class="dm-msg dm-you"><div class="dm-sigil"><span class="sg">✦</span><span class="dm-who">You</span></div><div><div class="dm-txt">${escHtml(m.text)}${rolls}</div></div></div>`;
    }
    const ev=(m.events&&m.events.length)?`<div class="dm-events">${m.events.map(e=>`<span class="dm-ev">${escHtml(e.type)}</span>`).join("")}</div>`:"";
    return `<div class="dm-msg dm-dm"><div class="dm-sigil"><span class="sg">❖</span><span class="dm-who">DM</span></div><div><div class="dm-txt">${escHtml(m.text)}</div>${ev}</div></div>`;
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
    const opts=(a.options||[]).map(o=>`<button class="btn ghost sm dm-opt" onclick="dmSend(${JSON.stringify(o).replace(/"/g,'&quot;')})">◆ ${escHtml(o)}</button>`).join("");
    foot=`<div class="dm-ask"><div class="dm-ask-q">${escHtml(a.prompt||"What do you do?")}</div><div class="dm-opts">${opts}</div>
      ${a.orElse!==false?`<div class="dm-orelse">…or something else.</div>`:""}</div>`;
  }
  const box=`<div class="dm-input"><textarea id="dmAction" rows="1" placeholder="Type your response…" onkeydown="if(event.key==='Enter'&&(event.metaKey||event.ctrlKey)){event.preventDefault();dmSend();}"></textarea>
    <button class="btn sm" onclick="dmSend()" ${GS.dm.pending?"disabled":""}>▸</button></div>`;

  return `<div class="section dm-section"><h3>The DM <span style="color:var(--ink-dim);font-size:11px;letter-spacing:0;text-transform:none">live · narration is definitive · you roll your own dice</span></h3>
    <div class="dm-feed">${feed}</div>${foot}${box}</div>`;
}

/* Chat-first World view (NEW-GAME-FLOW §9): the DM conversation is the center; the world's panels
   (Character/Map/Ledger/Gazetteer/Powers) live in a left icon rail and slide in beside the chat. */
function renderWorld(){
  const w=activeWorld();const host=document.getElementById("worldView");
  if(!w){host.innerHTML=`<div class="empty">No world is open.<br>Go to the Universe and forge or enter one.</div>`;return;}
  const s=w.seed;
  const cur=w.characters.filter(c=>c.status==="living").slice(-1)[0]||null;
  const panel=GS.gamePanel||null;

  const head=`<div class="scene-head">
    <h2>${nodeName(w,w.currentNodeId)}</h2>
    <div class="clock-hud"><div class="ch-time">${fmtClock(w)}</div><div class="ch-sess">Session ${w.session||0}</div></div>
  </div>`;

  let chat;
  if(cur){
    const openingFirst=cur.entry&&!(w.dmlog&&w.dmlog.length);   // show the rolled opening until the DM speaks
    chat=`${openingFirst?renderOpening(w,cur):""}${renderDMFeed(w)}${worldActions(w)}`;
  } else {
    chat=`<div class="char-strip"><div class="char-av">·</div>
      <div><div class="cn">No living soul here</div><div class="cs">the world waits for someone to walk into it</div></div>
      <div class="char-actions"><button class="btn sm" onclick="rollCharacter()">⚅ Roll a soul into the world</button></div></div>`;
  }

  host.innerHTML=`<div class="game ${panel?'has-panel':''}">
    ${gameRail(w,cur,panel)}
    <div class="game-main">
      <div class="chat-col">${head}${chat}</div>
      ${panel?`<aside class="panel-col">${gamePanelContent(w,cur,panel)}</aside>`:""}
    </div>
  </div>`;
  const feed=host.querySelector(".dm-feed");if(feed)feed.scrollTop=feed.scrollHeight;
}

/* the in-world icon rail — granular icons (§9); each reveals on first relevance (Curve of Revelation §8) */
/* Ivalice icon (extracted from the asset sheets → assets/icons/). Falls back to a glyph if the PNG
   is missing, so the rail never shows a broken image. */
function gico(name,glyph,sz){return `<img src="assets/icons/${name}.png" alt="" class="gr-img" style="width:${sz||26}px;height:${sz||26}px;object-fit:contain" onerror="this.outerHTML='${glyph||""}'">`;}
function gameRail(w,cur,panel){
  const ic=(key,icon,glyph,label,show)=>show?`<button class="grail-btn ${panel===key?'active':''}" title="${label}" onclick="openPanel(${key===null?'null':`'${key}'`})"><span class="gr-ico">${gico(icon,glyph)}</span><span class="gr-lbl">${label}</span></button>`:"";
  return `<nav class="game-rail">
    ${ic(null,"book-open","❖","Story",true)}
    ${ic("character","helm","☖","Character",!!cur)}
    ${ic("map","compass","◉","Map",isRevealed(w,'map'))}
    ${ic("ledger","tome","❡","Ledger",isRevealed(w,'ledger'))}
    ${ic("gazetteer","book-arcane","◈","Gazetteer",isRevealed(w,'gaz'))}
    ${ic("powers","banner","♜","Powers",isRevealed(w,'powers'))}
    <div class="grail-sep"></div>
    <button class="grail-btn" title="Universe — your worlds" onclick="showTab('universe')"><span class="gr-ico">${gico("sun","✦")}</span><span class="gr-lbl">Universe</span></button>
    <button class="grail-btn" title="Oracle (dev)" onclick="showTab('oracle')"><span class="gr-ico">${gico("d20","⚅")}</span><span class="gr-lbl">Oracle</span></button>
  </nav>`;
}

/* the engine affordances (explore / time-transitions / reveal / destroy), tucked under the chat so the
   scene stays uncluttered — the clock still moves ONLY here (DM-declared transitions). */
function worldActions(w){
  const revealBtn=allRevealed(w)?"":`<button class="btn ghost sm" onclick="showAllPanels()">⊕ reveal all</button>`;
  return `<details class="world-actions"><summary>⚙ World &amp; transitions</summary>
    <div class="wa-grp"><span class="wa-lbl">Explore — roll a new corner</span>
      <button class="btn ghost sm" onclick="explore('nearby','Place')">⚅ Travel</button>
      <button class="btn ghost sm" onclick="explore('faction','Faction')">⚅ New power</button>
      <button class="btn ghost sm" onclick="explore('myth','Myth')">⚅ New whisper</button></div>
    <div class="wa-grp"><span class="wa-lbl">Time — the clock moves only here</span>
      <button class="btn ghost sm" onclick="beginSession()">§ New session</button>
      <button class="btn ghost sm" onclick="passTime('short')">⏳ +1h</button>
      <button class="btn ghost sm" onclick="passTime('dawn')">☾ Dawn</button>
      <button class="btn ghost sm" onclick="passTime('montage')">⏩ +1 day</button></div>
    <div class="wa-grp">${revealBtn}<button class="btn ghost sm" onclick="handToDM()">✦ Copy world (clipboard DM)</button>
      <button class="btn ghost sm" style="color:var(--blood);border-color:var(--blood)" onclick="destroyWorld('${w.id}')">Destroy world</button></div>
  </details>`;
}

/* the side panel that slides in beside the chat (Disco-Elysium two-pane) */
function gamePanelContent(w,cur,panel){
  const close=`<button class="panel-close" title="Close" onclick="openPanel(null)">×</button>`;
  if(panel==="character")return `${close}${renderCharacterPanel(w,cur)}`;
  if(panel==="map")return `${close}<h3>The Map <span class="psub">${Object.keys(mapOf(w).nodes).length} places · ${mapOf(w).edges.length} routes</span></h3>${renderHexMap(w)}<div class="pcap">◆ you are here — the map grows only where you walk</div>`;
  if(panel==="ledger"){const fallen=w.characters.filter(c=>c.status==="fallen");
    return `${close}<h3>World State Ledger <span class="psub">${ledgerOf(w).length} entries · append-only</span></h3><div class="ledger-list">${renderLedger(w)}</div>`+
      (fallen.length?`<h3 style="margin-top:16px">The Fallen</h3>${fallen.map(c=>`<div class="grave-item"><span class="gname">${c.name}</span> — ${c.spark}. Fell at ${c.fellWhere||"parts unknown"}. ${c.fate||""}</div>`).join("")}`:"");}
  if(panel==="gazetteer")return `${close}<h3>The Gazetteer <span class="psub">${w.gazetteer.length} known</span></h3>${gazPanel(w)}`;
  if(panel==="powers")return `${close}${renderPowers(w)}`;
  return close;
}

function gazPanel(w){
  const order=["Setting","Place","Faction","NPC","Myth"];
  const html=order.map(type=>w.gazetteer.filter(g=>g.type===type).map(g=>
    `<div class="gaz-item"><div class="gi-top"><span class="gtype">${type}</span><span class="gn">${g.name}</span>${g.cat?`<span class="cat ${g.cat.replace(/\s/g,'')}" style="margin-left:auto">${g.cat}</span>`:""}</div><div class="gd">${g.desc}</div></div>`).join("")).join("");
  return html||`<div class="empty">Nothing discovered yet.</div>`;
}

/* the character sheet, as a side panel */
function renderCharacterPanel(w,cur){
  if(!cur)return `<div class="empty">No soul in play.</div>`;
  const sh=cur.sheet;
  if(!sh)return `<h3>${cur.name}</h3><div class="cs">${cur.headline||cur.spark}</div>`;
  const sc=sh.scores||{},md=sh.mods||{};
  const scores=ABIL.map(a=>`<div class="cp-score"><div class="cp-ab">${ABIL_LABEL[a]}</div><div class="cp-val">${sc[a]!=null?sc[a]:"—"}</div><div class="cp-mod">${(md[a]||0)>=0?'+':''}${md[a]||0}</div></div>`).join("");
  const skills=(sh.skillProfs||[]);
  const inv=(sh.inventory&&sh.inventory.length)?sh.inventory.slice():[];
  const spells=[].concat(sh.cantrips||[],sh.spells||[]);
  const skillCol=skills.length?skills.map(s=>`<div class="crow"><span>${escHtml(s)}</span><span class="v">✦</span></div>`).join(""):`<div class="crow"><span class="dim">—</span></div>`;
  const invCol=inv.length?inv.map(i=>`<div class="crow"><span>${escHtml(i)}</span></div>`).join(""):`<div class="crow"><span class="dim">—</span></div>`;
  return `<div class="cp-head"><div class="cp-portrait">☖</div><div><h3>${escHtml(cur.name)}</h3>
      <div class="cp-sub">${escHtml(sh.species)} ${escHtml(sh.class)}${sh.background?" · "+escHtml(sh.background):""}</div></div></div>
    <div class="cp-scores">${scores}</div>
    <div class="cp-badges">
      <div class="cp-badge hp"><span class="bi">${gico("heart","❤",18)}</span><span class="bv">${sh.hp}</span><span class="bl">HP</span></div>
      <div class="cp-badge ac"><span class="bi">${gico("shield","🛡",18)}</span><span class="bv">${sh.ac}</span><span class="bl">AC</span></div></div>
    <div class="cp-cols">
      <div class="cp-col"><h4>⚔ Skills</h4>${skillCol}</div>
      <div class="cp-col"><h4>❖ Inventory</h4>${invCol}</div></div>
    ${spells.length?`<div class="cp-foot"><b>Spells</b> ${escHtml(spells.join(", "))}</div>`:""}
    <div class="cp-foot"><b>Prof</b> +${sh.profBonus} · <b>PP</b> ${sh.passivePerception} · <b>Hit Die</b> ${sh.hitDie} · <b>Saves</b> ${(sh.saveProfs||[]).map(x=>ABIL_LABEL[x]).join("/")||"—"} · <b>Gold</b> ${sh.gold!=null?sh.gold+" gp":"—"}${sh.feat?` · <b>Feat</b> ${escHtml(sh.feat)}`:""}</div>
    <div class="char-actions" style="margin-top:14px">
      <button class="btn sm" onclick="handToDM()">✦ Hand to your DM</button>
      <button class="btn ghost sm" onclick="killCharacter('${cur.id}')">They fall…</button>
      ${(typeof corpsesAt==="function"?corpsesAt(w,w.currentNodeId):[]).filter(d=>d.id!==cur.id)
        .map(d=>`<button class="btn ghost sm" onclick="recoverFallen('${d.id}')">⚰ Recover ${escHtml(d.name)}'s effects</button>`).join("")}</div>`;
}

/* router for the in-world rail (chat-first §9) */
function openPanel(name){GS.gamePanel=name||null;renderWorld();}

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
  host.innerHTML=`<div class="parchment startpage">
    <div class="start-title">GENESIS</div>
    <div class="gem-rule"></div>
    <div class="bardo-guide" style="font-style:italic;max-width:30em">Roll the world into being, and let the tale unfold — a boundless journey guided by an AI Dungeon Master.</div>
    <div class="bardo-nav" style="margin-top:8px"><button class="btn primary" onclick="newWorld()">✦ Begin ✦</button></div>
    ${n?`<div style="margin-top:10px"><button class="btn ghost sm" onclick="showTab('universe')">↩ return to your worlds (${n})</button></div>`:""}
  </div>`;}

function renderShelf(){
  const shelf=document.getElementById("shelf");const ids=Object.keys(U.worlds);
  const active=U.activeWorldId?U.worlds[U.activeWorldId]:null;
  let cards=ids.map(id=>{
    const w=U.worlds[id];const living=w.characters.filter(c=>c.status==="living").length;const fallen=w.characters.filter(c=>c.status==="fallen").length;
    // the connected plane (step 6): show how far this region sits from the one you're in
    const dist=(active&&active.id!==id&&typeof regionDistance==="function")?regionDistance(active,w):0;
    const far=(dist&&isFinite(dist))?`<span title="distance across the plane">${dist} region${dist===1?"":"s"} away</span>`:"";
    return `<div class="world-card ${U.activeWorldId===id?'active-w':''}" onclick="enterWorld('${id}')">
      ${U.activeWorldId===id?'<div class="badge">active</div>':''}
      <h3>${w.name}</h3>
      <div class="setting">${w.seed.master.name} — ${w.seed.master.desc}</div>
      <div class="stats"><span>${w.gazetteer.length} discovered</span><span>${living} living</span><span>${fallen} fallen</span>${far}</div>
    </div>`;
  }).join("");
  const planeNote=ids.length>1?`<div style="grid-column:1/-1;font-size:11px;color:var(--ink-dim);letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px">Regions of the plane — one soul's death sends the next to a distant shore</div>`:"";
  cards=planeNote+cards;
  shelf.innerHTML=cards+`<div class="forge" onclick="newWorld()"><div class="plus">+</div><div>Forge a new world</div></div>`+soulsHTML();
  if(!ids.length){
    shelf.innerHTML=`<div class="forge" onclick="newWorld()" style="grid-column:1/-1;min-height:200px">
      <div class="plus">✦</div><div>Forge your first world</div>
      <div style="font-size:12px;color:var(--ink-dim);max-width:300px;text-align:center">Roll a world into being. It will persist here forever — across sessions, across characters — until you choose to destroy it.</div></div>`+soulsHTML();
  }
}
