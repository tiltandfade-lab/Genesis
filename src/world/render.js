/* GENESIS MODULE — src/world/render.js — the world renders (DOM)
   Carved from genesis.html monolith on 2026-06-20 (Pass 6). Classic <script>, shared global scope.
   AST-extracted (acorn) by exact offsets. Creator renders (renderBardo/renderCharge) stay in their domain. */

/* Which map nodes the player may see (fog-of-war): where they stand, the origin, anywhere they've walked
   (`seen`), rumored frontiers (`soft`), or any place whose gazetteer entry they already know. Everything
   else stays the DM's until reached. */
function mapVisibleIds(w){
  const m=mapOf(w); if(w.currentNodeId&&m.nodes[w.currentNodeId])m.nodes[w.currentNodeId].seen=true;
  const known=new Set((w.gazetteer||[]).filter(g=>g.known).map(g=>(g.name||"").toLowerCase()));
  return Object.keys(m.nodes).filter(id=>{const n=m.nodes[id];
    return id===w.currentNodeId||n.seen||n.soft||n.type==="Setting"||known.has((n.name||"").toLowerCase());});
}
function renderHexMap(w){
  const m=mapOf(w),ids=mapVisibleIds(w);if(!ids.length)return '<div class="empty">No places mapped yet.</div>';
  const vis=new Set(ids);
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
  const edges=m.edges.map(e=>{if(!vis.has(e.from)||!vis.has(e.to))return"";const p=nodeXY(w,e.from),qn=nodeXY(w,e.to);if(!p||!qn)return"";
    const dash=e.soft?' stroke-dasharray="3 3"':'';
    return `<line x1="${tx(p.x).toFixed(1)}" y1="${ty(p.y).toFixed(1)}" x2="${tx(qn.x).toFixed(1)}" y2="${ty(qn.y).toFixed(1)}" stroke="${e.soft?'#2a2114':'#1c1610'}" stroke-width="1.2"${dash}/>`;}).join("");
  const nodes=ids.map(id=>{const nn=m.nodes[id],cx=tx(nn.x),cy=ty(nn.y),cur=id===w.currentNodeId,set=nn.type==="Setting";
    if(nn.soft){ // a rumored frontier: dashed, dim, until contact (Charter §8.4)
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="#0e0b07" fill-opacity="0.6" stroke="#6b5a8f" stroke-width="1.2" stroke-dasharray="2.5 2.5"/>`+
        `<text x="${cx.toFixed(1)}" y="${(cy-9).toFixed(1)}" fill="#8f7fb0" font-size="8.5" font-style="italic" text-anchor="middle">${nn.name}</text>`;}
    const fill=cur?"#c9a24b":set?"#241d15":"#0e0b07",stroke=cur?"#e0c074":"#3a3026";
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${cur?7:5}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`+
      `<text x="${cx.toFixed(1)}" y="${(cy-9).toFixed(1)}" fill="${cur?'#e0c074':'#cdbf9e'}" font-size="9" text-anchor="middle">${nn.name}${cur?' ◆':''}</text>`;}).join("");
  return `<svg viewBox="0 0 ${VW} ${VH}" style="width:100%;max-width:480px;height:auto;display:block;margin:2px auto;background:#0a0805;border:1px solid var(--edge);border-radius:8px">${hexes}${edges}${nodes}</svg>`;}

function renderOpening(w,c){
  const en=c.entry;if(!en)return"";const B=en.bundle||{};
  const meta={enemies:["⚔","Enemies"],friends:["🤝","Friends"],complications:["🪢","Complications"],things:["◈","Things"],places:["⌖","Places"]};
  // spice juice — celebrate intensity (band), don't spoil content (SPICE-CURVE §5)
  const spice={Strange:["Bizarre","#8f7fc0"],Volatile:["Otherworldly","#c07a3a"],Mythic:["SPICY","#c4435e"]};
  const chip=x=>{const s=spice[x.band];return s?` <span style="font-size:12px;color:${s[1]};border:1px solid ${s[1]};border-radius:6px;padding:0 4px;letter-spacing:.08em;vertical-align:1px">${s[0]}</span>`:"";};
  const rows=["enemies","friends","complications","things","places"].map(k=>{
    const items=(B[k]||[]);if(!items.length)return"";
    return `<div style="display:flex;gap:8px;padding:5px 0;border-top:1px solid var(--edge)">
      <span style="width:18px;text-align:center">${meta[k][0]}</span>
      <span style="width:96px;color:var(--ink-dim);font-size:14px;letter-spacing:.06em;text-transform:uppercase;flex-shrink:0">${meta[k][1]}</span>
      <span style="color:var(--bone);font-size:17px">${items.map(x=>x.text+(x.src==="past"?' <span style="color:var(--gold-soft);font-size:13px">⟡ your past</span>':"")+chip(x)).join("<br>")}</span></div>`;}).join("");
  return `<div class="section"><h3>The Opening <span style="color:var(--ink-dim);font-size:14px;letter-spacing:0;text-transform:none">your arrival — the DM holds what's hidden</span></h3>
    <div style="font-size:17px;color:var(--ink);margin-bottom:8px;line-height:1.55">You came here <strong style="color:var(--bone)">${en.why}</strong>; to <strong style="color:var(--bone)">${en.standingFaction}</strong> you are <strong style="color:var(--bone)">${en.standing}</strong>; you have <strong style="color:var(--bone)">${en.foot}</strong>.</div>
    ${en.tension?`<div style="font-size:17px;color:var(--gold-soft);margin-bottom:6px">◭ Looming: ${en.tension.dangerFrag||en.tension.danger}</div>`:""}
    ${rows}</div>`;
}

/* Knowledge gating (DM-CHARTER slow drip): the player's panels show only what the CHARACTER knows.
   Idempotently seed `known` on factions / pressures / gazetteer entries — once, per world — so a fresh
   PC wakes knowing only where they stand and the faction they're tied to; everything else is learned in
   play (explore()/discovery events flip `known`). The DM's digest is unaffected — it always sees all. */
function initKnown(w){
  if(!w||w._knownInit)return;
  const cur=(w.characters||[]).filter(c=>c.status==="living").slice(-1)[0];
  const standing=cur&&cur.entry&&cur.entry.standingFaction;
  const loc=nodeName(w,w.currentNodeId);
  (w.factions||[]).forEach(f=>{ if(f.known===undefined) f.known = !!(standing && f.name===standing); });
  (w.pressures||[]).forEach(p=>{ if(p.known===undefined) p.known = false; });
  (w.gazetteer||[]).forEach(g=>{ if(g.known===undefined)
    g.known = (g.type==="Setting") || (g.name===loc) || !!(standing && g.type==="Faction" && g.name===standing); });
  w._knownInit=true;
}

function renderPowers(w){
  const facs=(w.factions||[]).filter(f=>f.known);
  const prs=(w.pressures||[]).filter(p=>p.known);
  if(!facs.length&&!prs.length)
    return `<div class="section"><h3>Powers &amp; Pressures <span style="color:var(--ink-dim);font-size:14px;letter-spacing:0;text-transform:none">what you've come to know</span></h3>
      <div class="empty">You don't yet know who truly holds power here, or what stalks the edges of it. What you learn will be written down.</div></div>`;
  const fac=facs.map(f=>{const c=f.clock||{size:6,filled:0};
    return `<div class="gaz-item"><div class="gi-top"><span class="gtype">${f.dominant?'dominant':'rival'}</span><span class="gn">${escHtml(f.name)}</span><span style="margin-left:auto;color:var(--gold-soft);font-size:14px">clock ${c.filled}/${c.size}</span></div>
      <div class="gd">means to ${escHtml(f.agenda)}, through ${escHtml(f.method)}${f.tags&&f.tags.length?` · ${escHtml(f.tags.join(', '))}`:''}${f.rel?` · ${escHtml(f.rel)}`:''}</div></div>`;}).join("");
  const pr=prs.map(p=>{const c=p.clock||{size:6,filled:0};
    return `<div class="gaz-item"><div class="gi-top"><span class="gtype">${escHtml(p.kind)}</span><span class="gn">${escHtml(p.dangerFrag||p.danger)}</span><span style="margin-left:auto;color:var(--ink-dim);font-size:14px">clock ${c.filled}/${c.size}</span></div><div class="gd" style="font-style:italic;color:var(--ink-dim)">a standing pressure · its true shape is the DM's</div></div>`;}).join("");
  return `<div class="section"><h3>Powers &amp; Pressures <span style="color:var(--ink-dim);font-size:14px;letter-spacing:0;text-transform:none">${facs.length} known ${facs.length===1?'power':'powers'}${prs.length?` · ${prs.length} felt pressure${prs.length===1?'':'s'}`:''} · more is hidden</span></h3>${fac}${pr}</div>`;}

// Escapes &<> AND double-quotes — the quote escape is load-bearing: the freshest DM line is carried in a
// `data-full="…"` attribute for the word-by-word streamer, so an unescaped " in dialogue ("Who goes there?")
// would close the attribute early and the streamer would only ever show the text up to the first quote.
function escHtml(s){return (s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
/* Turn an applied DM event into a readable mechanical chip in the feed — so the player always SEES the
   number (HP lost, slot spent), even if the narration doesn't say it out loud. `res` is applyEvent's return. */
function eventChip(e,res){
  const p=(e&&e.payload)||{}, t=e&&e.type;
  if(t==="hp_changed"){const d=typeof p.delta==="number"?p.delta:0;
    const lab=d<0?`−${-d} HP`:(d>0?`+${d} HP`:"HP");
    return `<span class="dm-ev ${d<0?'ev-hurt':d>0?'ev-heal':''}">${d<0?'✦':d>0?'✚':'•'} ${lab}${res&&res.hp?` → ${escHtml(res.hp)}`:""}${res&&res.dropped?" · DOWN":""}</span>`;}
  if(t==="slot_spent")return `<span class="dm-ev ev-cast">◇ L${p.level||1} slot${res&&res.remaining?` → ${escHtml(res.remaining)}`:(res&&res.empty?" · none left":"")}</span>`;
  if(t==="resource_spent")return `<span class="dm-ev ev-cast">◆ ${escHtml(p.label||p.key||"resource")}${res&&res.remaining?` → ${escHtml(res.remaining)}`:""}</span>`;
  if(t==="rest")return `<span class="dm-ev ev-heal">☾ ${escHtml(p.kind||"rest")}</span>`;
  if(t==="kill")return `<span class="dm-ev ev-hurt">⚔ ${escHtml(p.creature||p.name||"slain")}</span>`;
  if(t==="level_applied")return `<span class="dm-ev ev-heal">⬆ level up</span>`;
  return `<span class="dm-ev">${escHtml(String(t||"").replace(/_/g," "))}</span>`;
}
/* lightweight inline markdown for DM narration — **bold** and *italic* / _italic_ (input must already be
   escHtml'd). Bold runs FIRST so its inner `*` are consumed before the single-`*` italic pass; both require
   a closing marker, so a partial token mid-stream stays literal until it closes. */
function mdBold(s){return (s==null?"":String(s))
  .replace(/\*\*([^*]+?)\*\*/g,"<b>$1</b>")
  .replace(/(^|[^*\w])\*([^*\n]+?)\*(?![*\w])/g,"$1<i>$2</i>")
  .replace(/(^|[^_\w])_([^_\n]+?)_(?![_\w])/g,"$1<i>$2</i>");}

/* The DM feed — the chat-first play surface for the DM Bridge (docs/DM-BRIDGE.md, NEW-GAME-FLOW §9
   lane B). A scrolling chronicle of player turns + DM narration, the "DM is considering…" indicator,
   the roll-handshake affordance, the three-options ask, and the free-text action box. Logic lives in
   src/world/dm.js (dmSend/dmRollFor/sendTurn); this just paints GS.dm + dmLogOf(w). */
function renderDMFeed(w){
  const log=dmLogOf(w);
  const slice=log.slice(-24);
  const feed=log.length?slice.map((m,idx)=>{
    if(m.role==="player"){
      // show the FULL breakdown so proficiency/ability mods are always visible: "Stealth d20=14 +3 +2 prof = 19"
      const rolls=(m.rolls&&m.rolls.length)?` <span class="dm-roll">⚅ ${m.rolls.map(r=>{
        if(r.breakdown) return escHtml(`${r.label}: ${r.breakdown}`);   // free/dice roll — show the full trace
        const die=r.die||"d20", base=(r.result!=null?r.result:r.total), md=(r.mods&&String(r.mods).trim())?" "+String(r.mods).trim():"";
        const baseStr=r.pair?`${die}=${base} [${r.pair.join(",")}${r.adv==="advantage"?"↑":"↓"}]`:`${die}=${base}`;
        return escHtml(`${r.label} ${baseStr}${md} = ${r.total}`);
      }).join(", ")}</span>`:"";
      return `<div class="dm-msg dm-you"><div class="dm-sigil"><span class="sg">❖</span><span class="dm-who">You</span></div><div><div class="dm-txt">${escHtml(m.text)}${rolls}</div></div></div>`;
    }
    const ev=(m.events&&m.events.length)?`<div class="dm-events">${m.events.map((e,ei)=>eventChip(e,(m.applied&&m.applied[ei])?m.applied[ei].res:null)).join("")}</div>`:"";
    // the freshest DM line streams in word-by-word (GS.dm.animate, set on a new reply) — render an empty
    // span carrying the full text in data-full; streamDMText() fills it after the DOM is in place.
    const streaming=(idx===slice.length-1)&&GS.dm.animate&&m.role==="dm";
    const txt=streaming?`<span id="dmStream" class="dm-txt streaming" data-full="${escHtml(m.text)}"></span>`:`<div class="dm-txt">${mdBold(escHtml(m.text))}</div>`;
    const lat=(m.latencyMs!=null)?`<span class="dm-latency" title="turn round-trip — your send → DM answer">⏱ ${(m.latencyMs/1000).toFixed(1)}s</span>`:"";
    return `<div class="dm-msg dm-dm"><div class="dm-sigil"><span class="sg">◆</span><span class="dm-who">DM</span>${lat}</div><div>${txt}${ev}</div></div>`;
  }).join(""):`<div class="empty">The DM is silent. Say or do something to begin — make sure <code>dev/dm-bridge.py</code> is running.</div>`;

  let foot="";
  if(GS.dm.pending){
    // hold the mood while the DM composes — an on-tone line instead of dead air (varied per turn so the
    // wait reads as the world breathing, not a spinner). The die stays for dmRollFor's animation hook.
    const waits=["the world holds its breath…","the threads of fate gather…","something stirs in the dark…","the dream thickens around you…","the moment turns, slow as deep water…","fate sharpens its edge…"];
    const line=waits[(dmLogOf(w).length||0)%waits.length];
    foot=`<div class="dm-pending">✦ <span id="dmDie" class="die-mini">d20</span> <span class="dm-pending-line">${line}</span></div>`;
  } else if(GS.dm.rollReq && GS.dm.rollReq.dice){
    // the DM asked for a specific dice roll (damage, healing, a table die) — roll exactly that expression.
    // Contextual roll prompt only (mockup "THE DM CALLS FOR A ROLL · [ROLL]"); dmRollDice wiring preserved.
    const rq=GS.dm.rollReq;
    const dArg=JSON.stringify(rq.dice||"").replace(/"/g,'&quot;'), lArg=JSON.stringify(rq.label||rq.dice||"").replace(/"/g,'&quot;');
    foot=`<div class="dm-ask"><div class="dm-ask-row"><div class="dm-ask-q"><div class="dm-ask-lbl">The DM calls for a roll</div>Roll <b style="color:var(--steel)">${escHtml(rq.label?rq.label+" ":"")}${escHtml(rq.dice)}</b></div>
      <button class="roll-btn" onclick="dmRollDice(${dArg},${lArg})"><span class="rb-die">⚅</span><span class="rb-lbl">ROLL</span></button></div></div>`;
  } else if(GS.dm.rollReq){
    const rq=GS.dm.rollReq, ab=(rq.ability||"").toUpperCase();
    // args are DM-supplied — pass them as JSON string literals (HTML-attr-escaped); dmRollFor wiring preserved.
    const sArg=JSON.stringify(rq.skill||"").replace(/"/g,'&quot;'), aArg=JSON.stringify(rq.ability||"").replace(/"/g,'&quot;'), advArg=JSON.stringify(rq.adv||"").replace(/"/g,'&quot;');
    const advNote=rq.adv==="advantage"?` · <span style="color:var(--grounded)">advantage</span>`:rq.adv==="disadvantage"?` · <span style="color:var(--blood)">disadvantage</span>`:"";
    foot=`<div class="dm-ask"><div class="dm-ask-row"><div class="dm-ask-q"><div class="dm-ask-lbl">The DM calls for a roll</div>Make ${/^[aeiou]/i.test(rq.skill||"")?"an":"a"} <b style="color:var(--steel)">${escHtml(rq.skill||"check")}</b> check${ab?` <span style="color:var(--ink-dim)">(${escHtml(ab)})</span>`:""}${rq.dcHidden?` · <span style="color:var(--ink-dim)">DC hidden</span>`:""}${advNote}</div>
      <button class="roll-btn" onclick="dmRollFor(${sArg},${aArg},${advArg})"><span class="rb-die">⚅</span><span class="rb-lbl">ROLL</span></button></div></div>`;
  } else if(GS.dm.ask){
    const a=GS.dm.ask;
    // DM-CHARTER §3: the enumerated 3-option menu is a DIAL, default OFF. Render option buttons only when
    // the tutorial/scaffold dial (U.dmOptions) is explicitly on; otherwise the prompt + open input alone.
    const showOpts=!!(U.dmOptions && a.options && a.options.length);
    const opts=showOpts?a.options.map(o=>`<button class="btn ghost sm dm-opt" onclick="dmSend(${JSON.stringify(o).replace(/"/g,'&quot;')})">◆ ${escHtml(o)}</button>`).join(""):"";
    foot=`<div class="dm-ask"><div class="dm-ask-q">${escHtml(a.prompt||"What do you do?")}</div>${showOpts?`<div class="dm-opts">${opts}</div>`:""}
      ${(showOpts&&a.orElse!==false)?`<div class="dm-orelse">…or something else.</div>`:""}</div>`;
  }
  // pinned composer (mockup) — the ONLY dice-rolling UI is the contextual roll prompt above; no standing tray.
  const box=`<div class="dm-input"><textarea id="dmAction" rows="1" placeholder="type what you do…" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();dmSend();}"></textarea>
    <button onclick="dmSend()" ${GS.dm.pending?"disabled":""}>▷</button></div>`;

  return `<div class="section dm-section"><h3>The DM</h3>
    <div class="dm-feed">${feed}${foot}</div>${box}</div>`;
}

/* Chat-first World view (NEW-GAME-FLOW §9): the DM conversation is the center; the world's panels
   (Character/Map/Ledger/Gazetteer/Powers) live in a left icon rail and slide in beside the chat. */
function renderWorld(){
  const w=activeWorld();const host=document.getElementById("worldView");
  if(!w){host.innerHTML=`<div class="empty">No world is open.<br>Go to the Universe and forge or enter one.</div>`;return;}
  initKnown(w);   // seed what the character knows (once) before rendering the knowledge-gated panels
  // restore DM state across reloads — GS is transient, w.dm persists (only fill when GS is empty)
  if(w.dm){
    if(GS.dm.rollReq==null&&w.dm.rollReq) GS.dm.rollReq=w.dm.rollReq;
    if(GS.dm.ask==null&&w.dm.ask) GS.dm.ask=w.dm.ask;
    // a turn was in-flight when the page reloaded → re-attach the poll so the DM's reply still lands
    if(w.dm.pendingTurnId && !GS.dm.pending && typeof pollResponse==="function"){
      GS.dm.pending=true; GS.dm.turnId=w.dm.pendingTurnId; pollResponse(w.dm.pendingTurnId);
    }
  }
  const s=w.seed;
  const cur=w.characters.filter(c=>c.status==="living").slice(-1)[0]||null;
  const panel=GS.gamePanel||null;

  // sceneHead shrinks to near-nothing (docs/IN-SESSION-UI.md §4) — location + clock relocate to the
  // status sidebar. A faint world/setting whisper, top-right of the feed, is all that remains (mockup
  // "◈ EMBERREACH" = the setting/region name, not the current room — that lives in the sidebar).
  const settingName=(w.seed&&w.seed.master&&w.seed.master.name)||w.name||"";
  const head=`<div class="scene-head-mini">◈ ${escHtml(settingName)}</div>`;

  // a pending level-up is a big event — a persistent, glowing banner re-surfaces the picker until the
  // player finalizes, so an accidental close / reload can never silently skip it (docs/ADVANCEMENT.md)
  const lvlBanner=(typeof levelUpBannerHTML==="function")?levelUpBannerHTML(w,cur):"";

  let chat;
  if(cur){
    // The player's opening is the DM's NARRATION (woven from the entry bundle), not a raw data dump.
    // renderOpening() is retained as a no-bridge reference card but is no longer the player-facing intro;
    // the prep cinematic (wakeIntoWorld) holds the screen until the DM's first words arrive.
    // worldActions() no longer renders under the feed — its controls moved into the ⚙ Menu (§6).
    chat=`${lvlBanner}${renderDMFeed(w)}`;
  } else {
    chat=`<div class="char-strip"><div class="char-av">·</div>
      <div><div class="cn">No living soul here</div><div class="cs">the world waits for someone to walk into it</div></div>
      <div class="char-actions"><button class="btn roll sm" onclick="rollCharacter()">⚅ Roll a soul into the world</button></div></div>`;
  }

  host.innerHTML=`<div class="game ${panel?'has-panel':''}">
    ${statusSidebar(w,cur,panel)}
    <div class="game-main">
      <div class="chat-col">${head}${chat}</div>
      ${panel?`<aside class="panel-col">${gamePanelContent(w,cur,panel)}</aside>`:""}
    </div>
  </div>`;
  const feed=host.querySelector(".dm-feed");
  if(GS.dm.animate){ GS.dm.animate=false; streamDMText(); }   // new DM reply: scroll to its TOP and type it in
  else if(feed) feed.scrollTop=feed.scrollHeight;             // otherwise jump to the latest line
  // auto-open the level-up picker when picks are owed (e.g. after a reload) — it can't be skipped
  if(typeof openLevelUpForActive==="function") openLevelUpForActive();
  // the ⚙ Menu popover closes on an outside click (its own clicks stopPropagation, §6)
  if(GS.menuOpen){
    setTimeout(()=>{ document.addEventListener("click",closeMenu,{once:true}); },0);
  }
}

/* Stream the freshest DM narration in word-by-word (LLM-chat style). STICKY-BUT-ESCAPABLE: it follows
   the growing text only while the reader is parked at the bottom; the moment they scroll (to read back),
   the stream completes instantly and stops following — so they can scroll freely instead of being forced
   to watch it type. */
function streamDMText(){
  const el=document.getElementById("dmStream"); if(!el){return;}
  const feed=el.closest(".dm-feed");
  if(GS.dm.streamTimer){clearInterval(GS.dm.streamTimer);GS.dm.streamTimer=null;}
  const full=el.getAttribute("data-full")||"";
  const toks=full.split(/(\s+)/);   // words + the whitespace between them, so spacing is preserved
  let i=0, shown="", follow=true, lastSet=0, done=false;
  const finish=()=>{
    if(done)return; done=true;
    if(GS.dm.streamTimer){clearInterval(GS.dm.streamTimer);GS.dm.streamTimer=null;}
    el.innerHTML=mdBold(escHtml(full)); el.classList.remove("streaming");
    if(feed){ feed.removeEventListener("scroll",onScroll); if(follow){feed.scrollTop=feed.scrollHeight;lastSet=feed.scrollTop;} }
  };
  // user grabbed the scrollbar (current pos diverged from what WE last set) → reveal the full text now
  // and stop following, so they read freely instead of chasing the typewriter.
  function onScroll(){ if(feed && Math.abs(feed.scrollTop-lastSet)>4){ follow=false; finish(); } }
  if(feed){ feed.scrollTop=feed.scrollHeight; lastSet=feed.scrollTop; feed.addEventListener("scroll",onScroll); }
  GS.dm.streamTimer=setInterval(()=>{
    if(i>=toks.length){ finish(); return; }
    shown+=toks[i++];
    el.innerHTML=mdBold(escHtml(shown));   // re-render so **bold** resolves as it closes (partial ** stays literal until closed)
    if(feed && follow){ feed.scrollTop=feed.scrollHeight; lastSet=feed.scrollTop; }
  },24);
}

/* the in-world icon rail — retriaged to exactly the brief (docs/IN-SESSION-UI.md §3): Character ·
   Actions · Map · ⚙ Menu. Story is implicit (the no-panel default, not a button). Now lives INSIDE
   statusSidebar (below the divider), styled as a vertical stack that fits the sidebar's remaining
   height. Codex/Ledger/Powers/Universe/Oracle retired from the rail — see §8 for their new homes. */
/* R3 "Framed tabs" (docs/IN-SESSION-UI.md REV 2 §3, mockup .rl): centered icon-over-label; the ACTIVE
   item renders as a squared parchment tab that juts rightward toward the feed (reads as "this panel is
   open"). Glyphs are the engraved-gold icon set (DESIGN-GUIDE.md §II.4: no Unicode glyph where an
   engraved icon exists) — helm · sword-shield · compass · key, from assets/icons/. */
function gameRail(w,cur,panel){
  const rl=(key,icon,label,show)=>show?`<button class="rl ${panel===key?'on':''}" title="${label}" onclick="openPanel(${key===null?'null':`'${key}'`})"><img class="ic" src="assets/icons/${icon}.png" alt=""><span class="lb">${label}</span></button>`:"";
  return `<nav class="game-rail">
    ${rl("character","helm","Character",!!cur)}
    ${rl("actions","sword-shield","Actions",!!cur)}
    ${rl("map","compass","Map",isRevealed(w,'map'))}
    <div class="ss-spacer"></div>
    <div class="ss-menu-div"></div>
    <button class="rl ${GS.menuOpen?'on':''}" title="Menu" onclick="toggleMenu(event)"><img class="ic" src="assets/icons/key.png" alt=""><span class="lb">Menu</span></button>
  </nav>`;
}

/* ⚙ Menu — an overflow POPOVER anchored above the rail's ⚙ button (docs/IN-SESSION-UI.md §6), NOT a
   slide-in panel: the feed stays full-width behind it. GS.menuOpen is a simple bool; toggleMenu flips
   it, closeMenu() closes it (bound to an outside click). Reuses every handler verbatim — this is just
   a new container for buttons that already exist (Universe/session/destroy/world-transitions/dev tools). */
function toggleMenu(ev){ if(ev&&ev.stopPropagation)ev.stopPropagation(); GS.menuOpen=!GS.menuOpen; renderWorld(); }
function closeMenu(){ if(GS.menuOpen){ GS.menuOpen=false; renderWorld(); } }
/* ⚙ Menu popover (mockup S6 .mi idiom). Positioned in render via inline left/bottom so it clears the
   sidebar's bottom edge and shows every item (no clip). Adds the Powers entry (was orphaned). Every
   handler is reused verbatim — this is just a styled container for existing actions. */
function actionsMenu(w){
  if(!GS.menuOpen)return "";
  const revealItem=allRevealed(w)?"":`<button class="mi" onclick="showAllPanels()"><span class="mi-ic">◇</span>Reveal all</button>`;
  const sess=w.sessionLive
    ?`<button class="mi" onclick="closeMenu();endSession()" title="Close the session — recycle unvisited rumors, return to your worlds"><span class="mi-ic">✦</span>End session</button>`
    :`<button class="mi" onclick="closeMenu();startSession()" title="Begin a session — prep casts the codex, then the DM opens the scene"><span class="mi-ic">✦</span>Start session</button>`;
  return `<div class="actions-menu" style="left:196px;bottom:22px" onclick="event.stopPropagation()">
    <button class="mi" onclick="closeMenu();showTab('universe')"><span class="mi-ic">◈</span>Return to your worlds</button>
    ${sess}
    <button class="mi" onclick="closeMenu();openPanel('powers')"><span class="mi-ic">♜</span>Powers &amp; pressures</button>
    <div class="mi-sep"></div>
    <div class="mi-lbl">World &amp; transitions</div>
    <button class="mi" onclick="closeMenu();explore('nearby','Place')"><span class="mi-ic">⚅</span>Travel</button>
    <button class="mi" onclick="closeMenu();explore('faction','Faction')"><span class="mi-ic">⚅</span>New power</button>
    <button class="mi" onclick="closeMenu();explore('myth','Myth')"><span class="mi-ic">⚅</span>New whisper</button>
    <button class="mi" onclick="closeMenu();passTime('short')"><span class="mi-ic">⏳</span>+1 hour</button>
    <button class="mi" onclick="closeMenu();passTime('dawn')"><span class="mi-ic">☾</span>Dawn</button>
    <button class="mi" onclick="closeMenu();passTime('montage')"><span class="mi-ic">⏩</span>+1 day</button>
    ${(w.prep&&w.prep.bundle)?`<button class="mi" onclick="closeMenu();copyPrepHandoff()" title="Copy the staged prep bundle + synthesis instructions for your DM"><span class="mi-ic">⎘</span>Prep handoff</button>`:""}
    <button class="mi" onclick="closeMenu();handToDM()"><span class="mi-ic">✦</span>Copy world (clipboard DM)</button>
    <div class="mi-sep"></div>
    <button class="mi mi-danger" onclick="destroyWorld('${w.id}')"><span class="mi-ic">✖</span>Destroy world…</button>
    <div class="mi-sep"></div>
    <div class="mi-lbl">Dev tools</div>
    <button class="mi" onclick="closeMenu();showTab('oracle')"><span class="mi-ic">◇</span>Oracle</button>
    <button class="mi" onclick="closeMenu();applyEvent(activeWorld(),{type:'open_shop',payload:{tier:2,archetype:'general',name:'Test Market'}})" title="Exercise the shop panel without a live DM"><span class="mi-ic">❖</span>Open test shop</button>
    ${revealItem}
  </div>`;
}

/* the side panel that slides in beside the chat (Disco-Elysium two-pane) */
function gamePanelContent(w,cur,panel){
  const close=`<button class="panel-close" title="Close" onclick="openPanel(null)">×</button>`;
  if(panel==="character")return `${close}${renderCharacterPanel(w,cur)}`;
  if(panel==="actions")return `${close}${renderActionsPanel(w,cur)}`;
  if(panel==="map")return `${close}<div style="font-family:var(--display);font-size:15px;color:#6b5115;letter-spacing:.04em;margin-bottom:2px;padding-right:24px">${escHtml(nodeName(w,w.currentNodeId))}</div>
    <div style="font-size:12px;color:var(--ink-dim);font-style:italic;margin-bottom:12px">${mapVisibleIds(w).length} known · discovered paths</div>
    <div class="pn-body">${renderHexMap(w)}<div class="pcap">◆ you are here — what lies beyond is the DM's until you reach it</div></div>`;
  // Codex/Gazetteer stay reachable (functions kept, docs/IN-SESSION-UI.md §5d) but have no rail entry.
  if(panel==="codex"||panel==="gazetteer")return `${close}<h3>The Codex</h3><div class="pn-body">${knowledgePanel(w)}</div>`;
  if(panel==="powers")return `${close}<h3>Powers &amp; Pressures</h3><div class="pn-body">${renderPowers(w)}</div>`;
  if(panel==="shop")return shopPanel(w, cur, shopOf(w, GS.activeShopId));
  return close;
}

/* Actions panel — tabs: Actions · Abilities · Spells (docs/IN-SESSION-UI.md §5b; mockup S4/S7).
   GS.actionsTab holds the active tab (default 'actions'). The Spells tab only appears for casters. */
function setActionsTab(t){GS.actionsTab=t;renderWorld();}
const PN_INFORM_NOTE=`<div class="pn-note"><span class="star">✦</span> Reference only — you act by typing. These name what the rules give you.</div>`;
function actionsActionsBody(){
  // reference cards, non-interactive on purpose (no onclick) — vocabulary, not a command palette
  // (brief §15, §77). Hover-for-text via title on the card.
  const cards=(typeof STANDARD_ACTIONS_REF!=="undefined"?STANDARD_ACTIONS_REF:[]).map(a=>
    `<div class="refc" title="${escHtml(a.desc)}"><div class="rc-n">${escHtml(a.name)}</div><div class="rc-d">${escHtml(a.desc)}</div></div>`).join("");
  return `${PN_INFORM_NOTE}<div class="pn-body"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${cards}</div></div>`;
}
/* dot slot-tracker row (mockup): a title + subtext on the left, filled/empty dots, and the N/M count.
   `max` drives the "cur / max" label (the real total); `dotMax` (defaults to max) caps how many dots
   actually render, so a pool with max>12 still shows its true total in the label but draws at most
   the capped dot count. */
function slotTrackRow(title,sub,cur,max,dashed,dotMax){
  const dn=dotMax==null?max:dotMax;
  let dots="";for(let i=0;i<dn;i++)dots+=`<span class="st-dot ${dashed?'':(i<cur?'on':'off')}" ${dashed?'style="border-style:dashed"':''}></span>`;
  return `<div class="slot-track"><div class="st-main"><div class="st-t">${escHtml(title)}</div>${sub?`<div class="st-s">${escHtml(sub)}</div>`:""}</div>
    <div class="st-dots">${dots}</div>${max?`<div class="st-n">${cur} / ${max}</div>`:""}</div>`;
}
function actionsAbilitiesBody(w,cur){
  const sh=cur&&cur.sheet; if(!sh)return `<div class="empty">No soul in play.</div>`;
  if(typeof ensureResources==="function")ensureResources(sh);
  const rows=[];
  // class pools (Rage, Channel Divinity, Ki, Bardic Inspiration, Superiority dice …) as dot-trackers
  for(const k in (sh.pools||{})){const p=sh.pools[k];if(!p||!p.max)continue;
    const lab=((typeof RESOURCE_POOLS!=="undefined"&&RESOURCE_POOLS[k])||{}).label||k;
    rows.push(slotTrackRow(lab,p.die?String(p.die):"",p.cur,p.max,false,Math.min(p.max,12)));}
  if(!rows.length)return `${PN_INFORM_NOTE}<div class="pn-body"><div class="empty">${escHtml(cur.name)} has no tracked class resources.</div></div>`;
  return `${PN_INFORM_NOTE}<div class="pn-body"><div class="pn-h first">Class Resources</div>${rows.join("")}</div>`;
}
function renderActionsPanel(w,cur){
  if(!cur)return `<div class="empty">No soul in play.</div>`;
  const sh=cur.sheet;
  const caster=!!(sh&&[].concat(sh.cantrips||[],sh.spells||[],sh.featCantrips||[],sh.featSpells||[]).length);
  let tab=GS.actionsTab||"actions";
  if(tab==="spells"&&!caster)tab="actions";   // never strand the tab on a hidden Spells tab
  const tabs=[["actions","Actions"],["abilities","Abilities"]]; if(caster)tabs.push(["spells","Spells"]);
  const tabBar=panelTabBar(tabs,tab,"setActionsTab");
  const body=tab==="abilities"?actionsAbilitiesBody(w,cur):tab==="spells"?renderSpellPanel(w,cur):actionsActionsBody();
  return `${tabBar}${body}`;
}

/* Zone 1 — the persistent status sidebar (docs/IN-SESSION-UI.md §2). Identity/HP/AC/conditions/clock/
   location, live off `cur.sheet` at render time (renderWorld re-runs on every DM turn / state change,
   so this stays live for free — no new GS state). The rail (§3) lives beneath a divider inside it. */
/* HP bar — mockup structure: a label row (HIT POINTS · "5 / 12 +3 tmp") over a squared bar where the
   red fill spans hpCur/hpMax and a blue hatched overlay marks the temp-HP cushion beyond it. */
function ssHpBar(sh){
  const hpCur=(sh.hpCur==null?sh.hp:sh.hpCur), hpMax=sh.hp||1, tmp=sh.tempHp||0;
  const fillPct=Math.max(0,Math.min(100,(hpCur/hpMax)*100));
  const tmpPct=Math.max(0,Math.min(100-fillPct,(tmp/hpMax)*100));   // the temp cushion, capped to the bar
  const tmpLbl=tmp>0?` <span class="ss-hp-tmp">+${tmp} tmp</span>`:"";
  return `<div class="ss-hp">
    <div class="ss-hp-head"><span class="ss-hp-lbl"><img class="ss-hp-ic" src="assets/icons/heart.png" alt="">Hit Points</span>
      <span class="ss-hp-val"><b>${hpCur}</b> / ${hpMax}${tmpLbl}</span></div>
    <div class="ss-hp-bar"><div class="ss-hp-fill" style="width:${fillPct.toFixed(1)}%"></div>${tmp>0?`<div class="ss-hp-temp" style="left:${fillPct.toFixed(1)}%;width:${tmpPct.toFixed(1)}%"></div>`:""}</div>
  </div>`;
}
/* Condition / exhaustion / inspiration chips (mockup: squared, hue-coded). Absent when none. */
function ssBadges(sh){
  const chips=[];
  (sh.conditions||[]).forEach(e=>{ const n=(typeof condName==="function")?condName(e):e; if(n)chips.push(`<span class="ss-badge cond">${escHtml(n.charAt(0).toUpperCase()+n.slice(1))}</span>`); });
  const exl=(typeof exhaustionLevel==="function")?exhaustionLevel(sh):0;
  if(exl>0)chips.push(`<span class="ss-badge exh">Exhaustion ${exl}</span>`);
  if((typeof hasInspiration==="function")&&hasInspiration(sh))chips.push(`<span class="ss-badge insp">◆ Inspiration</span>`);
  return chips.length?`<div class="ss-badges">${chips.join("")}</div>`:"";
}
/* Spell-slot readout under AC (Adam 2026-07-01: slots are a first-tier visual ref, like HP/AC).
   One compact row per slot level — roman-numeral label + pip dots (slot counts stay ≤4 under the
   L10 ceiling, so rows stay narrow) — plus a steel-tinted Pact Magic row for warlocks. Absent
   entirely for non-casters: martials keep the lean sidebar. */
function ssSpellSlots(sh){
  const ROMAN=["I","II","III","IV","V","VI","VII","VIII","IX"];
  const grps=[];
  (sh.slotsMax||[]).forEach((m,i)=>{ if(!(m>0))return;
    const cur=Math.max(0,Math.min(m,(sh.slots||[])[i]||0));
    let dots="";for(let d=0;d<m;d++)dots+=`<span class="ss-slot-dot ${d<cur?'on':'off'}"></span>`;
    grps.push(`<span class="ss-slot-grp"><span class="ss-slot-lvl">${ROMAN[i]||String(i+1)}</span>${dots}</span>`);
  });
  if(sh.pact&&sh.pact.max>0){
    const cur=Math.max(0,Math.min(sh.pact.max,(sh.pact.cur!=null?sh.pact.cur:sh.pact.max)));
    let dots="";for(let d=0;d<sh.pact.max;d++)dots+=`<span class="ss-slot-dot pact ${d<cur?'on':'off'}"></span>`;
    grps.push(`<span class="ss-slot-grp"><span class="ss-slot-lvl">P${sh.pact.level||""}</span>${dots}</span>`);
  }
  if(!grps.length)return "";
  return `<div class="ss-slots"><div class="ss-slots-lbl">Spell Slots</div><div class="ss-slot-rows">${grps.join("")}</div></div>`;
}
/* The menu popover (§6) must escape the sidebar's own clip (the sidebar enforces the no-scroll
   invariant with overflow:hidden on its content), so it renders as a sibling of the sidebar's inner
   content wrapper, not a descendant of the clipped box — .status-side itself stays overflow:visible;
   .ss-inner carries the height-fit + hidden-overflow instead. */
/* clock/location meta block (mockup .ss-meta) — DAY N · TIME on the left, Session N on the right, then
   the ◈ current location beneath. fmtClock gives "Day N · time" (+exact time when known) — split into
   an upper-cased "DAY N · TIME" head to match the mockup's small-caps treatment. */
function ssMeta(w){
  const clock=(typeof clockOf==="function")?clockOf(w):(w.clock||{day:1,min:0});
  const tod=(typeof timeOfDay==="function")?timeOfDay(clock.min):"";
  const head=`DAY ${clock.day}${tod?` · ${escHtml(tod)}`:""}`.toUpperCase();
  return `<div class="ss-meta">
    <div class="ss-clock-line"><span class="ss-clock">${head}</span><span class="ss-sess">Session ${w.session||1}</span></div>
    <div class="ss-loc"><img class="ss-loc-ic" src="assets/icons/pin.png" alt=""> ${escHtml(nodeName(w,w.currentNodeId))}</div>
  </div>`;
}
function ssDivider(){
  return `<div class="ss-div"><span class="rule-l"></span><span class="gem">◆</span><span class="rule-r"></span></div>`;
}
function statusSidebar(w,cur,panel){
  const rail=gameRail(w,cur,panel);
  const menu=actionsMenu(w);
  if(!cur){
    return `<aside class="status-side">
      <div class="ss-inner">
        <div class="ss-id"><div class="ss-name">No soul in play</div></div>
        ${ssMeta(w)}
        ${ssDivider()}
        ${rail}
      </div>
      ${menu}
    </aside>`;
  }
  const sh=cur.sheet||{};
  const id=`<div class="ss-id"><div class="ss-name">${escHtml(cur.name)}</div>
    <div class="ss-sub">${escHtml(sh.species||"")} · ${escHtml(sh.class||"")} · Lvl ${sh.level||1}</div></div>`;
  const ac=`<div class="ss-ac"><span class="ss-ac-shield">${sh.ac!=null?sh.ac:"—"}</span><span class="ss-ac-lbl">Armor Class</span></div>`;
  return `<aside class="status-side">
    <div class="ss-inner">
      ${id}
      ${ssHpBar(sh)}
      ${ac}
      ${ssSpellSlots(sh)}
      ${ssBadges(sh)}
      ${ssMeta(w)}
      ${ssDivider()}
      ${rail}
    </div>
    ${menu}
  </aside>`;
}

function gazKnown(w){return (w.gazetteer||[]).filter(g=>g.known);}
function gazPanel(w){
  const order=["Setting","Place","Faction","NPC","Myth"];
  const known=gazKnown(w);
  const html=order.map(type=>known.filter(g=>g.type===type).map(g=>
    `<div class="gaz-item"><div class="gi-top"><span class="gtype">${type}</span><span class="gn">${escHtml(g.name)}</span>${g.cat?`<span class="cat ${escHtml(g.cat.replace(/\s/g,''))}" style="margin-left:auto">${escHtml(g.cat)}</span>`:""}</div><div class="gd">${escHtml(g.desc)}</div></div>`).join("")).join("");
  return html||`<div class="empty">Nothing learned yet. What you discover as you explore will be recorded here.</div>`;
}

/* The Codex panel — the relational entity view (docs/CODEX.md §6). Reads the knowledge-gated, sanitized
   codexPlayerView (KNOWN records only, links pre-pruned to known targets), groups records by kind, and
   renders each record's links as clickable cross-refs (the Obsidian feel — jump straight to the linked
   record). Shares the Gazetteer's reveal gate; the Gazetteer stays the flat list, the Codex is the web. */
function codexKnownView(w){return (typeof codexPlayerView==="function")?codexPlayerView(w):[];}
function codexDomId(id){return "cx-"+String(id).replace(/[^a-z0-9]+/gi,"-");}
function codexJump(id){const el=document.getElementById(codexDomId(id));if(!el)return;
  el.scrollIntoView({behavior:"smooth",block:"center"});
  el.style.transition="background .25s";el.style.background="rgba(201,168,94,.20)";
  setTimeout(()=>{el.style.background="";},1200);}
function codexPanel(w){
  const view=codexKnownView(w);
  if(!view.length)return `<div class="empty">No one and nowhere known yet. The people, places, and things you meet — and how they connect — will be recorded here.</div>`;
  const nameOf={};view.forEach(r=>nameOf[r.id]=r.name);
  const KINDS=[["npc","People","☗"],["location","Places","◈"],["faction","Powers","♜"],["item","Things","❖"]];
  const chip=`background:none;border:1px solid var(--edge);border-radius:999px;color:var(--ink);font-size:13px;padding:2px 9px;margin:4px 4px 0 0;cursor:pointer`;
  const fieldOf=r=>{const f=r.fields||{};const v=f.desc||f.role||f.agenda||f.object||f.trait||"";return v?`<div class="gd">${escHtml(String(v))}</div>`:"";};
  const atOf=r=>{const at=r.status&&r.status.at;return (at&&nameOf[at])?`<span style="margin-left:auto;color:var(--ink-dim);font-size:13px">at ${escHtml(nameOf[at])}</span>`:"";};
  // the five-step disposition tell — only present when the player has READ this NPC via Insight
  // (codexPlayerView gates it; SOCIAL §6.2). A dot ladder ◦◦●◦◦ filled to the read value + its label.
  const attOf=r=>{if(!r.attitude)return "";const v=r.attitude.value;
    const dots=[-2,-1,0,1,2].map(s=>`<span style="display:inline-block;width:7px;height:7px;border-radius:50%;margin:0 1px;vertical-align:middle;background:${s===v?'var(--gold-soft)':'var(--edge)'}"></span>`).join("");
    return `<div class="gd" title="Your read of their disposition (Insight)"><span style="color:var(--ink-dim);font-size:12px">disposition</span> ${dots} <b style="color:var(--gold-soft);font-size:12px">${escHtml(r.attitude.label)}</b></div>`;};
  const linksOf=r=>{const ls=(r.links||[]).filter(l=>nameOf[l.to]);if(!ls.length)return "";
    return `<div style="margin-top:4px">`+ls.map(l=>`<button style="${chip}" onclick="codexJump('${l.to}')">${escHtml(l.rel.replace(/-/g," "))} → <b style="color:var(--gold-soft)">${escHtml(nameOf[l.to])}</b></button>`).join("")+`</div>`;};
  return KINDS.map(([kind,label,glyph])=>{
    const recs=view.filter(r=>r.kind===kind);if(!recs.length)return "";
    return `<div style="margin-top:14px"><div style="color:var(--bone);font-size:15px;letter-spacing:.04em;margin-bottom:6px">${glyph} ${label} <span class="psub">${recs.length}</span></div>`+
      recs.map(r=>`<div class="gaz-item" id="${codexDomId(r.id)}"><div class="gi-top"><span class="gn">${escHtml(r.name)}</span>${atOf(r)}</div>${fieldOf(r)}${attOf(r)}${linksOf(r)}</div>`).join("")+`</div>`;
  }).join("")||`<div class="empty">Nothing known yet.</div>`;
}

/* The unified "Codex" the player sees — one place for everything known. The relational codex (people /
   places / powers / things) on top, then a Lore section folding in known gazetteer entries the codex
   doesn't model (the Setting, myths/whispers, and any discovery not yet an entity). Gazetteer + Codex are
   one thing to the player. */
function knowledgePanel(w){
  const codexNames=new Set(codexKnownView(w).map(r=>(r.name||"").toLowerCase()));
  const codexHtml=codexKnownView(w).length?codexPanel(w):"";
  const lore=gazKnown(w).filter(g=>g.type==="Setting"||g.type==="Myth"||!codexNames.has((g.name||"").toLowerCase()));
  const loreHtml=lore.length?`<div style="margin-top:14px"><div style="color:var(--bone);font-size:15px;letter-spacing:.04em;margin-bottom:6px">◈ Lore &amp; rumor <span class="psub">${lore.length}</span></div>`+
    lore.map(g=>`<div class="gaz-item"><div class="gi-top"><span class="gtype">${escHtml(g.type)}</span><span class="gn">${escHtml(g.name)}</span>${g.cat?`<span class="cat ${escHtml(g.cat.replace(/\s/g,''))}" style="margin-left:auto">${escHtml(g.cat)}</span>`:""}</div><div class="gd">${escHtml(g.desc)}</div></div>`).join("")+`</div>`:"";
  return (codexHtml+loreHtml)||`<div class="empty">No one and nowhere known yet. The people, places, powers, and lore you discover gather here.</div>`;
}

/* The Spell book — read-only in-play view: casting stats + slot pips, then every known spell as a uniform
   gridded card (hover/focus → full text via #spellTip). Pulls class spells AND feat-granted spells, so
   nothing the player chose goes missing. */
function spellByName(name){return (typeof SPELLS_SLIM!=="undefined"?SPELLS_SLIM:[]).find(s=>s&&s.name===name)||null;}
/* Spells tab (mockup S7): a slot-tracker header (per-level slots or Pact Magic dots + "recovers on…"),
   then Cantrips · at will as reference cards, then Known Spells as cards with a Lv tag. Hover-for-text
   via the card's title (the mockup's "hover a spell for its full text"); the player casts by typing. */
function renderSpellPanel(w,cur){
  const sh=cur&&cur.sheet; if(!sh)return `<div class="empty">No soul in play.</div>`;
  if(typeof ensureResources==="function")ensureResources(sh);
  const cantrips=[].concat(sh.cantrips||[],sh.featCantrips||[]);
  const leveled=[].concat(sh.spells||[],sh.featSpells||[]);
  if(!cantrips.length&&!leveled.length)return `${PN_INFORM_NOTE}<div class="pn-body"><div class="empty">${escHtml(cur.name)} channels no spells.</div></div>`;
  // slot header: Pact Magic (warlock) → one dot row + "recovers on a short rest"; else per-level slot rows.
  let slotRows="";
  if(sh.pact&&sh.pact.max){
    slotRows+=slotTrackRow("Slot Level "+sh.pact.level,"Recovers on a short rest",(sh.pact.cur!=null?sh.pact.cur:sh.pact.max),sh.pact.max);
  }
  (sh.slotsMax||[]).forEach((m,i)=>{if(m>0)slotRows+=slotTrackRow("Slot Level "+(i+1),"",(sh.slots||[])[i]||0,m);});
  const slotHead=slotRows?`<div class="pn-h first">${sh.pact&&sh.pact.max?"Pact Magic · Spell Slots":"Spell Slots"}</div>${slotRows}`:"";
  const card=name=>{const s=spellByName(name);
    const desc=s?(s.flavor||s.text||""):"the DM holds this spell's text";
    return `<div class="refc" title="${escHtml(s&&s.text?s.text:desc)}"><div class="rc-n">${escHtml(name)}</div><div class="rc-d">${escHtml(desc)}</div></div>`;};
  const cardLv=name=>{const s=spellByName(name);
    const lv=s?(s.level===0?"Cantrip":("Lv "+s.level)):"Spell";
    const desc=s?(s.flavor||s.text||""):"the DM holds this spell's text";
    return `<div class="refc" title="${escHtml(s&&s.text?s.text:desc)}" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><div class="rc-n">${escHtml(name)}</div><div class="rc-d">${escHtml(desc)}</div></div><span class="itag">${lv}</span></div>`;};
  const cantripGrid=cantrips.length?`<div class="pn-h${slotHead?"":" first"}">Cantrips · at will</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${cantrips.map(card).join("")}</div>`:"";
  const spellList=leveled.length?`<div class="pn-h">Known Spells</div><div style="display:flex;flex-direction:column;gap:7px">${leveled.map(cardLv).join("")}</div>`:"";
  return `<div class="pn-note"><span class="star">✦</span> Reference only — hover a spell for its full text; you cast by typing.</div>
    <div class="pn-body">${slotHead}${cantripGrid}${spellList}</div>`;
}

/* Character panel — tabbed (docs/IN-SESSION-UI.md §5a; mockup S2/S3): Sheet · Inventory · History.
   The identity/HP/AC header lives persistently in the sidebar, so each tab body leads into its content.
   GS.charTab holds the active tab (default 'sheet'); setCharTab() mirrors openPanel's re-render pattern. */
function setCharTab(t){GS.charTab=t;renderWorld();}
/* shared tab-bar builder for BOTH tabbed panels (Character + Actions) — mockup .pn-tabs / .pn-tab.on */
function panelTabBar(tabs,active,fn){
  return `<div class="panel-tabs">${tabs.map(([k,l])=>`<button class="ptab ${active===k?'active':''}" onclick="${fn}('${k}')">${escHtml(l)}</button>`).join("")}</div>`;
}

/* ── The Shop panel (docs/SHOP-UI.md §3) — tabbed Buy|Sell, confirm-on-plaque transactions,
   attitude-tinted prices, stock counts shown, merchant coin pool HIDDEN (Rulings 1/2/3/4). Engine
   owns numbers (previewBuy/previewSell); this only renders + wires GS.shopSel/GS.shopTab clicks
   through to src/world/shop.js's handlers. ─────────────────────────────────────────────────── */
/* shopAttTint(delta) — hue cue for a tinted price/payout line: favorable (att>0) --grounded, gouged
   (att<0) --blood, untinted → no color override. No numeric breakdown (the fiction explains it). */
function shopAttTint(att){ return att>0?`color:var(--grounded)`:att<0?`color:var(--blood)`:``; }
function shopConfirmPlaque(label,disabled,reason,onclick){
  return `<button class="shop-confirm" ${disabled?"disabled":""} onclick="${disabled?"":onclick}">
    ${escHtml(label)}${disabled&&reason?`<span class="shop-confirm-reason">${escHtml(reason)}</span>`:""}</button>`;
}
function shopBuyRow(w,shop,sh,line,att,selected){
  const price=(typeof itemPrice==="function")?itemPrice(line.name):{gp:null};
  const eff=price.gp==null?null:Math.max(1,Math.round(price.gp*(1-0.10*att)));
  const cons=(typeof isConsumable==="function")&&isConsumable(line.name);
  const afford=eff!=null && (sh.gold||0)>=eff;
  const priceHtml=eff==null?`<span class="shop-price">—</span>`:`<span class="shop-price" style="${shopAttTint(att)}">${eff} gp</span>`;
  const row=`<div class="shop-row ${selected?'sel':''}" onclick="selectShopRow('buy','${escHtml(line.name).replace(/'/g,"\\'")}')">
    <span class="shop-row-name">${escHtml(line.name)}${cons?`<span class="itag">Consumable</span>`:""}</span>
    <span class="shop-row-qty">×${line.qty}</span>
    ${priceHtml}
  </div>`;
  if(!selected)return row;
  const reason=eff==null?"Can't be priced":!afford?"Not enough gold":"";
  const detail=`<div class="shop-detail">
    <div class="shop-detail-line">${eff==null?"Can't be priced":`${eff} gp`}</div>
    ${shopConfirmPlaque("Confirm",!(eff!=null&&afford),reason,`buyItem('${shop.id}','${escHtml(line.name).replace(/'/g,"\\'")}')`)}
  </div>`;
  return row+detail;
}
function shopSellRow(w,shop,sh,inst,att,selected){
  const sv=(typeof sellValue==="function")?sellValue(inst.name, shop, att):{gp:null,capped:false};
  const eq=sh.equipped||{};
  const equipped=eq.mainHand===inst.id||eq.offHand===inst.id||eq.armor===inst.id;
  const payoutHtml=sv.gp==null?`<span class="shop-price">—</span>`:`<span class="shop-price" style="${shopAttTint(att)}">${sv.gp} gp</span>`;
  const row=`<div class="shop-row ${selected?'sel':''}" onclick="selectShopRow('sell','${inst.id}')">
    <span class="shop-row-name">${escHtml(inst.name)}${equipped?`<span class="itag">Equipped</span>`:""}</span>
    ${payoutHtml}
  </div>`;
  if(!selected)return row;
  const brokeRefused=sv.gp==null; // previewSell also refuses a capped-to-0 payout (merchant-broke) — same disabled UI
  const merchantBroke=sv.gp===0;
  const reason=brokeRefused?"Can't be priced":merchantBroke?"Their purse is empty":"";
  const cappedNote=sv.capped&&sv.gp>0?`<div class="shop-detail-note">they can't pay full price</div>`:"";
  const detail=`<div class="shop-detail">
    <div class="shop-detail-line">${sv.gp==null?"Can't be priced":`${sv.gp} gp`}</div>
    ${cappedNote}
    ${shopConfirmPlaque("Confirm",!(sv.gp>0),reason,`sellItem('${shop.id}','${inst.id}')`)}
  </div>`;
  return row+detail;
}
function shopPanel(w,cur,shop){
  const close=`<button class="panel-close" title="Close" onclick="openPanel(null)">×</button>`;
  if(!shop)return `${close}<div class="empty">No merchant here.</div>`;
  const sh=cur&&cur.sheet;
  if(!sh)return `${close}<div class="empty">No soul in play.</div>`;
  const att=(typeof shopAttitude==="function")?shopAttitude(w,shop):0;
  const tab=GS.shopTab||"buy";
  const tabBar=panelTabBar([["buy","Buy"],["sell","Sell"]],tab,"setShopTab");
  const archLabel=(typeof SHOP_ARCHETYPES!=="undefined"&&SHOP_ARCHETYPES[shop.archetype])?SHOP_ARCHETYPES[shop.archetype].label:shop.archetype;
  const loc=shop.nodeId?escHtml(nodeName(w,shop.nodeId)):"";
  const header=`<div class="shop-header">
    <div class="shop-name">${escHtml(shop.name||"Shop")}</div>
    <div class="shop-sub">${escHtml(archLabel||"")}${loc?` · ${loc}`:""}</div>
    <div class="shop-gold">Your gold: <b>${sh.gold||0}</b> gp</div>
  </div>`;
  let body;
  if(tab==="sell"){
    const inv=(sh.inventory||[]);
    if(!inv.length){
      body=`<div class="empty">You have nothing they'll buy.</div>`;
    } else {
      body=inv.map(inst=>{
        const selected=!!(GS.shopSel&&GS.shopSel.kind==="sell"&&GS.shopSel.key===inst.id);
        return shopSellRow(w,shop,sh,inst,att,selected);
      }).join("");
    }
  } else {
    const stock=(shop.stock||[]).filter(l=>(l.qty||0)>0);
    if(!stock.length){
      body=`<div class="empty">The merchant has nothing left to sell.</div>`;
    } else {
      body=stock.map(line=>{
        const selected=!!(GS.shopSel&&GS.shopSel.kind==="buy"&&GS.shopSel.key===line.name);
        return shopBuyRow(w,shop,sh,line,att,selected);
      }).join("");
    }
  }
  return `${close}${header}${tabBar}<div class="pn-body shop-body">${body}</div>`;
}
/* collapsible Sheet section (mockup <details> with a chevron header). GS.sheetCollapse[key]===true → collapsed. */
function toggleSheetSection(key){ if(!GS.sheetCollapse)GS.sheetCollapse={}; GS.sheetCollapse[key]=!GS.sheetCollapse[key]; renderWorld(); }
function sheetCollapse(key,title,bodyHtml){
  const open=!(GS.sheetCollapse&&GS.sheetCollapse[key]);
  return `<details class="pn-collapse"${open?" open":""}>
    <summary onclick="event.preventDefault();toggleSheetSection('${key}')">${escHtml(title)}<span class="chev">▾</span></summary>
    <div class="pn-collapse-body">${bodyHtml}</div></details>`;
}

function charSheetBody(w,cur){
  const sh=cur.sheet;
  if(!sh)return `<div class="cs">${cur.headline||cur.spark}</div>`;
  if(typeof ensureResources==="function")ensureResources(sh);
  // XP / advancement readout (advancement.js) — kept; the level-up claim/pick buttons are load-bearing.
  const xp=sh.xp||0, lvl=sh.level||1;
  const ceiling=(typeof LEVEL_CEILING!=="undefined")?LEVEL_CEILING:10;
  const atMax=lvl>=ceiling;
  const xpFloor=(typeof xpForLevel==="function")?xpForLevel(lvl):0;
  const xpNext=(!atMax&&typeof xpForLevel==="function")?xpForLevel(lvl+1):null;
  const toNext=(xpNext!=null)?Math.max(0,xpNext-xp):0;
  const xpPct=(xpNext!=null&&xpNext>xpFloor)?Math.max(0,Math.min(100,Math.round((xp-xpFloor)/(xpNext-xpFloor)*100))):100;
  const canLevel=(typeof pendingLevelUp==="function")&&pendingLevelUp(sh);
  const owesPicks=!canLevel&&(typeof pendingChoices==="function")&&pendingChoices(sh);
  const earnedTo=canLevel&&(typeof levelForXp==="function")?levelForXp(xp):lvl;
  const sc=sh.scores||{},md=sh.mods||{};
  const hpCur=(sh.hpCur==null?sh.hp:sh.hpCur);
  // ability-score boxes (mockup .abil): label · signed mod · raw score
  const scores=ABIL.map(a=>`<div class="abil"><div class="ab-l">${escHtml((ABIL_LABEL[a]||a).charAt(0)+(ABIL_LABEL[a]||a).slice(1).toLowerCase())}</div><div class="ab-m">${(md[a]||0)>=0?'+':''}${md[a]||0}</div><div class="ab-s">${sc[a]!=null?sc[a]:"—"}</div></div>`).join("");
  // combat key/value rows (mockup .krow)
  const initMod=md.dex||0;
  const combat=[
    `<div class="krow"><span>Armor Class</span><b>${sh.ac!=null?sh.ac:"—"}</b></div>`,
    `<div class="krow"><span>Hit Points</span><b>${hpCur} / ${sh.hp}${sh.tempHp>0?` (+${sh.tempHp})`:""}</b></div>`,
    `<div class="krow"><span>Proficiency</span><b>+${sh.profBonus}</b></div>`,
    `<div class="krow"><span>Initiative</span><b>${initMod>=0?'+':''}${initMod}</b></div>`,
    `<div class="krow"><span>Passive Perception</span><b>${sh.passivePerception}</b></div>`,
    `<div class="krow"><span>Hit Die</span><b>${escHtml(sh.hitDie||"—")}</b></div>`,
    (sh.gold!=null?`<div class="krow"><span>Gold</span><b>${sh.gold} gp</b></div>`:"")
  ].join("");
  // Saving Throws (collapsible) — ◆ marks a proficient save
  const saveSet=new Set(sh.saveProfs||[]);
  const saves=ABIL.map(a=>{const prof=saveSet.has(a);const tot=(md[a]||0)+(prof?(sh.profBonus||0):0);
    return `<div class="krow"><span>${escHtml((ABIL_LABEL[a]||a))} ${prof?'<span class="prof">◆</span>':''}</span><b>${tot>=0?'+':''}${tot}</b></div>`;}).join("");
  // Skills (collapsible) — full list, best-first, ◆ proficient
  const profSet=new Set(sh.skillProfs||[]);
  const skills=(typeof ALL_SKILLS!=="undefined"?ALL_SKILLS:[]).map(s=>{
    const ab=(typeof SKILL_ABILITY!=="undefined"&&SKILL_ABILITY[s])||"int", prof=profSet.has(s);
    const tot=(md[ab]||0)+(prof?(sh.profBonus||0):0);
    return {s,ab,prof,tot};
  }).sort((a,b)=>b.tot-a.tot||a.s.localeCompare(b.s))
    .map(r=>`<div class="crow"><span>${r.prof?'<span class="prof">◆</span> ':''}${escHtml(r.s)} <span style="color:#a3906a;font-size:.82em">${ABIL_LABEL[r.ab]}</span></span><span class="v">${r.tot>=0?'+':''}${r.tot}</span></div>`).join("")
    ||`<div class="crow"><span>—</span></div>`;
  // State chips (mockup) — conditions + exhaustion (inspiration lives in the sidebar badge)
  const stateChips=[];
  (sh.conditions||[]).forEach(e=>{const n=(typeof condName==="function")?condName(e):e;if(n)stateChips.push(`<span class="ss-badge cond">${escHtml(n.charAt(0).toUpperCase()+n.slice(1))}</span>`);});
  const exl=(typeof exhaustionLevel==="function")?exhaustionLevel(sh):0;
  if(exl>0)stateChips.push(`<span class="ss-badge exh">Exhaustion ${exl}</span>`);
  const xpBlock=`<div class="cp-xp">
      ${atMax
        ? `<div class="cp-xp-line">Level ${lvl} — the ceiling of this age.</div>`
        : canLevel
        ? `<div class="cp-xp-bar"><span style="width:100%"></span></div><div class="cp-xp-line"><b>${xp}</b> XP — enough to advance.</div>`
        : `<div class="cp-xp-bar"><span style="width:${xpPct}%"></span></div><div class="cp-xp-line"><b>${toNext}</b> XP to level ${lvl+1} <span class="cp-xp-dim">· ${xp} / ${xpNext}</span></div>`}
      ${canLevel
        ? `<button class="iact" style="display:block;width:100%;margin-top:8px;text-align:center;padding:7px" onclick="claimLevelUp()">⬆ Come into your power — Level ${earnedTo}</button>`
        : owesPicks
        ? `<button class="iact" style="display:block;width:100%;margin-top:8px;text-align:center;padding:7px" onclick="openLevelUpForActive()">✦ Choose your level-${lvl} powers</button>`
        : ""}
    </div>`;
  const featsFoot=[
    (sh.feat?`<b>Feat</b> ${escHtml(sh.feat)}`:""),
    ((sh.feats&&sh.feats.length)?`<b>Feats</b> ${sh.feats.map(f=>escHtml(f.name)).join(", ")}`:""),
    ((sh.subclassFeatures&&sh.subclassFeatures.length)?`<b>${escHtml(sh.subclass||"Subclass")}</b> ${sh.subclassFeatures.map(f=>escHtml(f.name)).join(", ")}`:"")
  ].filter(Boolean).join(" · ");
  return `<div class="pn-body">
    <div class="pn-h first">Ability Scores</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px">${scores}</div>
    <div class="pn-h">Combat</div>
    ${combat}
    ${xpBlock}
    ${sheetCollapse("saves","Saving Throws",saves)}
    ${sheetCollapse("skills","Skills · all "+(typeof ALL_SKILLS!=="undefined"?ALL_SKILLS.length:0),skills)}
    ${stateChips.length?`<div class="pn-h">State</div><div style="display:flex;flex-wrap:wrap;gap:5px">${stateChips.join("")}</div>`:""}
    ${featsFoot?`<div class="cp-foot">${featsFoot}</div>`:""}
  </div>`;
}

function charInventoryBody(w,cur){
  const sh=cur.sheet;
  if(!sh)return `<div class="empty">No soul in play.</div>`;
  // ITEMS (docs/ITEMS.md): sh.inventory holds INSTANCES ({id,name,qty?,conditions:[]}); resolvers guarded
  // so a headless render harness (no engine.combat) degrades cleanly.
  const inv=(sh.inventory&&sh.inventory.length)?sh.inventory.slice():[];
  const sc=sh.scores||{};
  const idef=(typeof itemDef==="function")?itemDef:(name=>(typeof ITEMS_BY_NAME!=="undefined")?ITEMS_BY_NAME[String(name||"").trim().toLowerCase()]:null);
  const fmtLb=n=>String(Math.round(n*100)/100);
  const carry=(typeof carryState==="function")?carryState(sh):null;
  const totalWeight=carry?carry.weight:inv.reduce((sum,it)=>{const d=idef(it.base||it.name);return sum+((d&&d.weight)||0)*(it.qty||1);},0);
  const capacity=carry?carry.soft:15*((sc.str!=null?sc.str:10));
  const bdef=(typeof baseDef==="function")?baseDef:(it=>idef(it.base||it.name));
  const ench=(typeof enchOf==="function")?enchOf:(it=>it.ench||null);
  const mdef=(typeof magicDef==="function")?magicDef:(()=>null);
  const eq=sh.equipped||{};
  const eqName=id=>{const it=inv.find(x=>x.id===id);return it?it.name:null;};
  // EQUIPPED SLOTS (mockup .slot grid): Weapon · Off-hand / Armor · (Focus omitted — the app models 3 slots)
  const slot=(label,id)=>{const nm=id?eqName(id):null;
    return `<div class="slot"><div class="sl-l">${escHtml(label)}</div><div class="sl-v${nm?"":" empty"}">${nm?escHtml(nm):"— empty —"}</div></div>`;};
  const slotsHtml=`<div style="display:flex;gap:7px;margin-bottom:7px">${slot("Weapon",eq.mainHand)}${slot("Off-hand",eq.offHand)}</div>
    <div style="display:flex;gap:7px">${slot("Armor",eq.armor)}</div>`;
  // CARRIED LIST (mockup .item): name (·tags) … [chips ATTUNED/EQUIPPED] [action buttons]
  const items=inv.length?inv.map(it=>{
    const d=bdef(it), md=mdef(it.name), en=ench(it)||{};
    const qtyTag=it.qty?` ×${it.qty}`:"";
    const bonusTag=(en.bonus)?`<span class="item-ench">+${en.bonus}</span>`:"";
    const riderTag=(en.damageRider)?`<span class="item-ench">+${en.damageRider.n}d${en.damageRider.die} ${escHtml(en.damageRider.type)}</span>`:"";
    const chgTag=(en.charges)?`<span class="item-ench">⚡${en.charges.cur==null?en.charges.max:en.charges.cur}/${en.charges.max}</span>`:"";
    const condTags=(it.conditions||[]).map(c=>`<span class="item-cond">${escHtml(c)}</span>`).join("");
    const eqSlot=(eq.mainHand===it.id)?"mainHand":(eq.offHand===it.id)?"offHand":(eq.armor===it.id)?"armor":null;
    const kind=d&&d.kind, equippable=(kind==="weapon"||kind==="shield"||kind==="armor");
    const consumable=!!(it.consumable||(md&&md.consumable));
    const requiresAttune=!!(en.attunement||(md&&md.attunement));
    const readable=/grimoire|book|tome|scroll|letter|note|journal|map/i.test(it.name||"");   // mockup "Read" affordance
    // tag chips (mockup .itag): Equipped / Attuned
    const tags=[];
    if(eqSlot)tags.push(`<span class="itag">Equipped</span>`);
    if(requiresAttune&&it.attuned)tags.push(`<span class="itag">Attuned</span>`);
    // action buttons (mockup .iact) — every handler preserved
    const acts=[];
    if(consumable)acts.push(`<span class="iact" onclick="useItem('${it.id}')">Use</span>`);
    if(eqSlot)acts.push(`<span class="iact" onclick="unequipSlot('${eqSlot}')">Stow</span>`);
    else if(equippable)acts.push(`<span class="iact" onclick="equipItem('${it.id}')">Equip</span>`);
    if(eqSlot==="mainHand" && d && d.versatile && !eq.offHand){
      const grip=(eq.grip==="1h")?"1h":"2h";
      acts.push(`<span class="iact" title="switch grip" onclick="setGrip('${grip==="2h"?"1h":"2h"}')">Grip ${grip}</span>`);
    }
    if(requiresAttune)acts.push(it.attuned
      ? `<span class="iact" onclick="unattuneItem('${it.id}')">Release</span>`
      : `<span class="iact" onclick="attuneItem('${it.id}')">Attune</span>`);
    if(readable&&!consumable&&!equippable)acts.push(`<span class="iact" onclick="dmSend(${JSON.stringify(`I read ${it.name||''}.`).replace(/"/g,'&quot;')})">Read</span>`);
    return `<div class="item"><span>${escHtml(it.name)}${qtyTag}${bonusTag}${riderTag}${chgTag} ${condTags}</span>${tags.join("")}${acts.length?`<span style="margin-left:auto;display:inline-flex;gap:5px">${acts.join("")}</span>`:""}</div>`;
  }).join(""):`<div class="item"><span style="color:#a3906a">— nothing carried —</span></div>`;
  // LOAD BAR (mockup)
  const loadPct=Math.max(0,Math.min(100,Math.round((totalWeight/(capacity||1))*100)));
  const over=totalWeight>capacity;
  const loadBar=`<div class="pn-h">Load</div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px"><span style="font-size:12.5px;color:#6a5c40">Weight carried</span><span style="font-family:var(--display);font-size:13px;color:var(--bone)">${fmtLb(totalWeight)} / ${capacity} lb</span></div>
    <div class="load-bar${over?" over":""}"><span style="width:${loadPct}%"></span></div>`;
  return `<div class="pn-body">
    <div class="pn-h first">Equipped</div>
    ${slotsHtml}
    <div class="pn-h">Carried</div>
    ${items}
    ${loadBar}
  </div>`;
}

function charHistoryBody(w,cur){
  // absorbs the player-facing Ledger (docs/IN-SESSION-UI.md §5a) — its player-visible slice folds in here.
  const dmv=!!GS.ledgerDM;
  const toggle=`<span class="iact" style="float:right" onclick="GS.ledgerDM=!GS.ledgerDM;renderWorld()">${dmv?"showing all (DM)":"what you know"}</span>`;
  const vis=dmv?ledgerOf(w):ledgerOf(w).filter(ledgerPlayerVisible);
  const fallen=w.characters.filter(c=>c.status==="fallen");
  const corpses=(typeof corpsesAt==="function"?corpsesAt(w,w.currentNodeId):[]).filter(d=>d.id!==cur.id);
  return `<div class="pn-body">
    ${renderCharacterHistory(w,cur)}
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px">
      <span class="iact" style="margin-left:0" onclick="handToDM()">✦ Hand to your DM</span>
      <span class="iact" onclick="killCharacter('${cur.id}')">They fall…</span>
      ${corpses.map(d=>`<span class="iact" onclick="recoverFallen('${d.id}')">⚰ Recover ${escHtml(d.name)}'s effects</span>`).join("")}</div>
    <div class="pn-h">Chronicle ${toggle}</div>
    <div class="ledger-list">${renderLedger(w,vis)}</div>
    ${fallen.length?`<div class="pn-h">The Fallen</div>${fallen.map(c=>`<div class="grave-item"><span class="gname">${c.name}</span> — ${c.spark}. Fell at ${c.fellWhere||"parts unknown"}. ${c.fate||""}</div>`).join("")}`:""}
  </div>`;
}

/* The Character panel — tab bar + active tab body (docs/IN-SESSION-UI.md §5a; mockup S2/S3). */
function renderCharacterPanel(w,cur){
  if(!cur)return `<div class="empty">No soul in play.</div>`;
  const sh=cur.sheet;
  if(!sh)return `<h3>${cur.name}</h3><div class="cs">${cur.headline||cur.spark}</div>`;
  const tab=GS.charTab||"sheet";
  const tabBar=panelTabBar([["sheet","Sheet"],["inventory","Inventory"],["history","History"]],tab,"setCharTab");
  const body=tab==="inventory"?charInventoryBody(w,cur):tab==="history"?charHistoryBody(w,cur):charSheetBody(w,cur);
  return `${tabBar}${body}`;
}

/* The character's chronicle — backstory (origins / the path that brought them here / formative life events,
   with their inner rolls) + the in-play journey pulled from the ledger. A collapsible block so it deepens
   role-play without crowding the live sheet. */
function renderCharacterHistory(w,cur){
  if(!cur)return "";
  const L=cur.life, e=escHtml;
  const head=cur.headline?`<div class="cp-hist-headline">${e(cur.headline)}</div>`:"";
  let bio="";
  if(L&&L.origins){
    const O=L.origins;
    const row=(k,v)=>v?`<div class="cp-hist-row"><span class="k">${e(k)}</span><span class="v">${e(v)}</span></div>`:"";
    const sib=O.siblings?(O.siblings.count===0?"None — an only child":`${O.siblings.text} sibling${O.siblings.count===1?"":"s"}${O.siblings.birthOrder?` (${O.siblings.birthOrder.toLowerCase()})`:""}`):"";
    const origins=[
      row("Born", O.birthplace&&(O.birthplace.text+(O.parents&&O.parents.total>95?" · parents unknown":""))),
      row("Family", O.family&&("raised by "+O.family.text.replace(/^An? /,'')+(O.absent?` — ${O.absent.text}`:""))),
      row("Siblings", sib),
      row("Upbringing", (O.lifestyle&&O.childhoodHome)&&(O.lifestyle.text.toLowerCase()+" — "+O.childhoodHome.text.toLowerCase())),
      O.childhoodMemory?`<div class="cp-hist-row"><span class="k">Memory</span><span class="v" style="font-style:italic">“${e(O.childhoodMemory.text)}”</span></div>`:""
    ].join("");
    const path=L.decisions?[
      L.decisions.background&&`<div class="cp-hist-line">• ${e(L.decisions.background.text)}</div>`,
      L.decisions.classTraining&&`<div class="cp-hist-line">• ${e(L.decisions.classTraining.text)}</div>`
    ].filter(Boolean).join(""):"";
    const evs=(L.events||[]).map(ev=>`<div class="cp-hist-event"><div class="eh">${e(ev.summary)}</div>${ev.detail?`<div class="ed">${e(ev.detail)}</div>`:""}${(ev.sub&&ev.sub.length)?`<div class="cp-hist-sub">⚅ ${e(ev.sub.join(" · "))}</div>`:""}</div>`).join("");
    bio=`<div class="cp-hist-grp"><div class="cp-hist-lbl">Origins</div>${origins}</div>
      ${path?`<div class="cp-hist-grp"><div class="cp-hist-lbl">Why this path</div>${path}</div>`:""}
      ${evs?`<div class="cp-hist-grp"><div class="cp-hist-lbl">Life events${L.age?` · age ${e(L.age)}`:""}</div>${evs}</div>`:""}`;
  } else {
    bio=`<div class="cs" style="color:var(--ink-dim)">No recorded past for this soul.</div>`;
  }
  const led=(w.ledger||[]).filter(x=>x&&x.text&&cur.name&&x.text.indexOf(cur.name)>=0).slice(-8);
  const journey=led.length?`<div class="cp-hist-grp"><div class="cp-hist-lbl">The journey so far</div>${led.map(x=>`<div class="cp-hist-line">D${x.day} · ${e(x.text)}</div>`).join("")}</div>`:"";
  return `<details class="cp-history"><summary>📖 Chronicle &amp; history — who they are</summary>
    ${head}${bio}${journey}</details>`;
}

/* router for the in-world rail (chat-first §9) */
/* clicking a rail item toggles its panel — if it's already open, collapse back to the Story view.
   Leaving the shop panel (closing it or switching to another) clears its transient selection state
   (docs/SHOP-UI.md §3) — GS.activeShopId/GS.shopSel are only meaningful while panel==='shop'. */
function openPanel(name){
  const next=(GS.gamePanel===(name||null)?null:(name||null));
  if(GS.gamePanel==="shop"&&next!=="shop"){ GS.activeShopId=null; GS.shopSel=null; }
  GS.gamePanel=next;
  renderWorld();
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

/* Player vs DM vision (DM-CHARTER slow drip): the Chronicle shows only what the CHARACTER witnessed.
   The world-state ledger also records the DM's off-screen machinery — route geometry, off-stage drift,
   time bookkeeping, world-gen seeds, NPC life the player hasn't met — none of which the player should read.
   The ⛨/👁 toggle lets the dev see the full ledger. */
function ledgerPlayerVisible(e){
  if(!e)return false; const d=e.data||{};
  switch(e.type){
    case "spatial": case "drift": case "clock": case "npc-life": return false;   // DM machinery
    case "canon": return !d.origin;                                              // discovered facts yes; world-gen seeds no
    default: return true;                                                        // outcome / transition / session — player-facing
  }
}
function renderLedger(w,list){
  // default to the PLAYER-visible view — a bare renderLedger(w) must never leak DM machinery (the DM-view
  // path passes the full ledger explicitly).
  const L=list||ledgerOf(w).filter(ledgerPlayerVisible);if(!L.length)return '<div class="empty">Nothing witnessed yet — your story writes itself here as you live it.</div>';
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
    <img class="start-wordmark" src="assets/title/genesis.png" alt="GENESIS">
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
    const liveBadge=w.sessionLive?'<div class="badge" style="background:var(--gold,#c9a14a);color:#1a140c">session live</div>':(U.activeWorldId===id?'<div class="badge">active</div>':'');
    return `<div class="world-card ${U.activeWorldId===id?'active-w':''}" onclick="enterWorld('${id}')">
      ${liveBadge}
      <h3>${w.name}</h3>
      <div class="setting">${w.seed.master.name} — ${w.seed.master.desc}</div>
      <div class="stats"><span>${w.gazetteer.length} discovered</span><span>${living} living</span><span>${fallen} fallen</span>${far}</div>
      <button class="btn sm wc-start" onclick="event.stopPropagation();startSession('${id}')" title="Prep casts the world, then the DM opens the scene">${w.sessionLive?'▶ Resume session':'▶ Start session'}</button>
    </div>`;
  }).join("");
  const planeNote=ids.length>1?`<div style="grid-column:1/-1;font-size:14px;color:var(--ink-dim);letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px">Regions of the plane — one soul's death sends the next to a distant shore</div>`:"";
  cards=planeNote+cards;
  shelf.innerHTML=cards+`<div class="forge" onclick="newWorld()"><div class="plus">+</div><div>Forge a new world</div></div>`+soulsHTML();
  if(!ids.length){
    shelf.innerHTML=`<div class="forge" onclick="newWorld()" style="grid-column:1/-1;min-height:200px">
      <div class="plus">✦</div><div>Forge your first world</div>
      <div style="font-size:16px;color:var(--ink-dim);max-width:300px;text-align:center">Roll a world into being. It will persist here forever — across sessions, across characters — until you choose to destroy it.</div></div>`+soulsHTML();
  }
}
