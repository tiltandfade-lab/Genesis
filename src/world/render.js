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
      return `<div class="dm-msg dm-you"><div class="dm-sigil"><span class="sg">✦</span><span class="dm-who">You</span></div><div><div class="dm-txt">${escHtml(m.text)}${rolls}</div></div></div>`;
    }
    const ev=(m.events&&m.events.length)?`<div class="dm-events">${m.events.map((e,ei)=>eventChip(e,(m.applied&&m.applied[ei])?m.applied[ei].res:null)).join("")}</div>`:"";
    // the freshest DM line streams in word-by-word (GS.dm.animate, set on a new reply) — render an empty
    // span carrying the full text in data-full; streamDMText() fills it after the DOM is in place.
    const streaming=(idx===slice.length-1)&&GS.dm.animate&&m.role==="dm";
    const txt=streaming?`<span id="dmStream" class="dm-txt streaming" data-full="${escHtml(m.text)}"></span>`:`<div class="dm-txt">${mdBold(escHtml(m.text))}</div>`;
    const lat=(m.latencyMs!=null)?`<span class="dm-latency" title="turn round-trip — your send → DM answer">⏱ ${(m.latencyMs/1000).toFixed(1)}s</span>`:"";
    return `<div class="dm-msg dm-dm"><div class="dm-sigil"><span class="sg">❖</span><span class="dm-who">DM</span>${lat}</div><div>${txt}${ev}</div></div>`;
  }).join(""):`<div class="empty">The DM is silent. Say or do something to begin — make sure <code>dev/dm-bridge.py</code> is running.</div>`;

  let foot="";
  if(GS.dm.pending){
    // hold the mood while the DM composes — an on-tone line instead of dead air (varied per turn so the
    // wait reads as the world breathing, not a spinner). The die stays for dmRollFor's animation hook.
    const waits=["the world holds its breath…","the threads of fate gather…","something stirs in the dark…","the dream thickens around you…","the moment turns, slow as deep water…","fate sharpens its edge…"];
    const line=waits[(dmLogOf(w).length||0)%waits.length];
    foot=`<div class="dm-pending">✦ <span id="dmDie" class="die-mini">d20</span> <span class="dm-pending-line">${line}</span></div>`;
  } else if(GS.dm.rollReq && GS.dm.rollReq.dice){
    // the DM asked for a specific dice roll (damage, healing, a table die) — roll exactly that expression
    const rq=GS.dm.rollReq;
    const dArg=JSON.stringify(rq.dice||"").replace(/"/g,'&quot;'), lArg=JSON.stringify(rq.label||rq.dice||"").replace(/"/g,'&quot;');
    foot=`<div class="dm-ask"><div class="dm-ask-q">The DM calls for a roll — <strong>${escHtml(rq.label?rq.label+" ":"")}${escHtml(rq.dice)}</strong>. Roll openly:</div>
      <button class="btn roll sm" onclick="dmRollDice(${dArg},${lArg})">⚅ Roll ${escHtml(rq.dice)}</button></div>`;
  } else if(GS.dm.rollReq){
    const rq=GS.dm.rollReq, ab=(rq.ability||"").toUpperCase();
    // args are DM-supplied — pass them as JSON string literals (HTML-attr-escaped), the same robust
    // pattern as the option buttons below; escHtml alone wouldn't guard a `'` inside the JS-string context.
    const sArg=JSON.stringify(rq.skill||"").replace(/"/g,'&quot;'), aArg=JSON.stringify(rq.ability||"").replace(/"/g,'&quot;'), advArg=JSON.stringify(rq.adv||"").replace(/"/g,'&quot;');
    const advNote=rq.adv==="advantage"?` · <span style="color:var(--grounded)">advantage</span>`:rq.adv==="disadvantage"?` · <span style="color:var(--blood)">disadvantage</span>`:"";
    const advBtn=rq.adv==="advantage"?" (adv)":rq.adv==="disadvantage"?" (disadv)":"";
    foot=`<div class="dm-ask"><div class="dm-ask-q">The DM calls for a roll — <strong>${escHtml(rq.skill||"a check")}</strong>${ab?` (${escHtml(ab)})`:""}${rq.dcHidden?` · DC hidden`:""}${advNote}. Roll openly:</div>
      <button class="btn roll sm" onclick="dmRollFor(${sArg},${aArg},${advArg})">⚅ Roll ${escHtml(rq.skill||"the check")}${advBtn}</button></div>`;
  } else if(GS.dm.ask){
    const a=GS.dm.ask;
    // DM-CHARTER §3: the enumerated 3-option menu is a DIAL, default OFF (2026-06-24 — "takes the
    // imagination out of the game"). Render option buttons only when the tutorial/scaffold dial
    // (U.dmOptions) is explicitly on; otherwise show the prompt + open input alone, so leading options
    // never reappear. A genuine either/or fork lives in the DM's prose, not in buttons.
    const showOpts=!!(U.dmOptions && a.options && a.options.length);
    const opts=showOpts?a.options.map(o=>`<button class="btn ghost sm dm-opt" onclick="dmSend(${JSON.stringify(o).replace(/"/g,'&quot;')})">◆ ${escHtml(o)}</button>`).join(""):"";
    foot=`<div class="dm-ask"><div class="dm-ask-q">${escHtml(a.prompt||"What do you do?")}</div>${showOpts?`<div class="dm-opts">${opts}</div>`:""}
      ${(showOpts&&a.orElse!==false)?`<div class="dm-orelse">…or something else.</div>`:""}</div>`;
  }
  const box=`<div class="dm-input"><textarea id="dmAction" rows="1" placeholder="Type your response… (Enter to send · Shift+Enter for a new line)" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();dmSend();}"></textarea>
    <button class="btn sm" onclick="dmSend()" ${GS.dm.pending?"disabled":""}>▸</button></div>`;
  // free dice tray — roll ANY combination on demand (quick dice + a typed expression like 2d6+3); the
  // result rides the next turn just like a DM-prompted roll.
  const quick=[4,6,8,10,12,20,100].map(n=>`<button class="btn ghost xs dice-q" onclick="dmRollDice('1d${n}','d${n}')">d${n}</button>`).join("");
  const tray=`<details class="dice-tray"><summary>🎲 Roll dice</summary>
    <div class="dice-tray-body">${quick}
      <input id="diceExpr" class="dice-expr" placeholder="2d6+3" onkeydown="if(event.key==='Enter'){event.preventDefault();dmRollExprInput();}">
      <button class="btn sm" onclick="dmRollExprInput()">⚅ Roll</button></div></details>`;

  return `<div class="section dm-section"><h3>The DM <span style="color:var(--ink-dim);font-size:14px;letter-spacing:0;text-transform:none">live · narration is definitive · you roll your own dice</span></h3>
    <div class="dm-feed">${feed}</div>${foot}${box}${tray}</div>`;
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

  const sessBtn=w.sessionLive
    ? `<button class="btn ghost ch-sess-btn" onclick="endSession()" title="Close the session — recycle unvisited rumors, return to your worlds">■ End session</button>`
    : `<button class="btn ghost ch-sess-btn" onclick="startSession()" title="Begin a session — prep casts the codex, then the DM opens the scene">▶ Start session</button>`;
  const head=`<div class="scene-head">
    <h2>${nodeName(w,w.currentNodeId)}</h2>
    <div class="clock-hud"><div class="ch-line"><span class="ch-time">${fmtClock(w)}</span><span class="ch-sess">Session ${w.session||1}</span></div>${sessBtn}</div>
  </div>`;

  // a pending level-up is a big event — a persistent, glowing banner re-surfaces the picker until the
  // player finalizes, so an accidental close / reload can never silently skip it (docs/ADVANCEMENT.md)
  const lvlBanner=(typeof levelUpBannerHTML==="function")?levelUpBannerHTML(w,cur):"";

  let chat;
  if(cur){
    // The player's opening is the DM's NARRATION (woven from the entry bundle), not a raw data dump.
    // renderOpening() is retained as a no-bridge reference card but is no longer the player-facing intro;
    // the prep cinematic (wakeIntoWorld) holds the screen until the DM's first words arrive.
    chat=`${lvlBanner}${renderDMFeed(w)}${worldActions(w)}`;
  } else {
    chat=`<div class="char-strip"><div class="char-av">·</div>
      <div><div class="cn">No living soul here</div><div class="cs">the world waits for someone to walk into it</div></div>
      <div class="char-actions"><button class="btn roll sm" onclick="rollCharacter()">⚅ Roll a soul into the world</button></div></div>`;
  }

  host.innerHTML=`<div class="game ${panel?'has-panel':''}">
    ${gameRail(w,cur,panel)}
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

/* the in-world icon rail — granular icons (§9); each reveals on first relevance (Curve of Revelation §8) */
/* Ivalice icon (extracted from the asset sheets → assets/icons/). Falls back to a glyph if the PNG
   is missing, so the rail never shows a broken image. */
function gico(name,glyph,sz){return `<img src="assets/icons/${name}.png" alt="" class="gr-img" style="width:${sz||26}px;height:${sz||26}px;object-fit:contain" onerror="this.outerHTML='${glyph||""}'">`;}
function gameRail(w,cur,panel){
  const ic=(key,icon,glyph,label,show)=>show?`<button class="grail-btn ${panel===key?'active':''}" title="${label}" onclick="openPanel(${key===null?'null':`'${key}'`})"><span class="gr-ico">${gico(icon,glyph)}</span><span class="gr-lbl">${label}</span></button>`:"";
  const caster=!!(cur&&cur.sheet&&[].concat(cur.sheet.cantrips||[],cur.sheet.spells||[],cur.sheet.featCantrips||[],cur.sheet.featSpells||[]).length);
  return `<nav class="game-rail">
    ${ic(null,"book-open","❖","Story",true)}
    ${ic("character","helm","☖","Character",!!cur)}
    ${ic("spells","wand","✶","Spells",caster)}
    ${ic("map","compass","◉","Map",isRevealed(w,'map'))}
    ${ic("codex","book-arcane","◈","Codex",isRevealed(w,'gaz'))}
    ${ic("ledger","tome","❡","Ledger",isRevealed(w,'ledger'))}
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
      <button class="btn roll sm" onclick="explore('nearby','Place')">⚅ Travel</button>
      <button class="btn roll sm" onclick="explore('faction','Faction')">⚅ New power</button>
      <button class="btn roll sm" onclick="explore('myth','Myth')">⚅ New whisper</button></div>
    <div class="wa-grp"><span class="wa-lbl">Session — prep casts the world, then play</span>
      ${w.sessionLive
        ?`<button class="btn ghost sm" onclick="endSession()" title="Close the session — recycle unvisited rumors, return to your worlds">■ End session</button>`
        :`<button class="btn ghost sm" onclick="startSession()" title="Begin a session — prep casts the codex, then the DM opens the scene">▶ Start session</button>`}
      ${(w.prep&&w.prep.bundle)?`<button class="btn ghost sm" onclick="copyPrepHandoff()" title="Copy the staged prep bundle + synthesis instructions for your DM">⎘ Prep handoff</button>`:""}</div>
    <div class="wa-grp"><span class="wa-lbl">Time — the clock moves only here</span>
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
  if(panel==="spells")return `${close}<h3>Spells &amp; magic</h3>${renderSpellPanel(w,cur)}`;
  if(panel==="map")return `${close}<h3>The Map <span class="psub">${mapVisibleIds(w).length} known · the map grows only where you walk</span></h3>${renderHexMap(w)}<div class="pcap">◆ you are here — what lies beyond is the DM's until you reach it</div>`;
  if(panel==="ledger"){const fallen=w.characters.filter(c=>c.status==="fallen");
    const dmv=!!GS.ledgerDM;
    const toggle=`<button class="btn ghost sm" style="float:right;margin-top:-2px" onclick="GS.ledgerDM=!GS.ledgerDM;renderWorld()">${dmv?"👁 showing all (DM)":"⛨ what you know"}</button>`;
    const vis=dmv?ledgerOf(w):ledgerOf(w).filter(ledgerPlayerVisible);
    return `${close}<h3>Chronicle ${toggle}<span class="psub">${vis.length} ${dmv?"entries · DM view":"things you've witnessed"}</span></h3><div class="ledger-list">${renderLedger(w,vis)}</div>`+
      (fallen.length?`<h3 style="margin-top:16px">The Fallen</h3>${fallen.map(c=>`<div class="grave-item"><span class="gname">${c.name}</span> — ${c.spark}. Fell at ${c.fellWhere||"parts unknown"}. ${c.fate||""}</div>`).join("")}`:"");}
  if(panel==="codex"||panel==="gazetteer")return `${close}<h3>The Codex <span class="psub">all you know — people, places, powers &amp; lore</span></h3>${knowledgePanel(w)}`;
  if(panel==="powers")return `${close}${renderPowers(w)}`;
  return close;
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
function renderSpellPanel(w,cur){
  const sh=cur&&cur.sheet; if(!sh)return `<div class="empty">No soul in play.</div>`;
  if(typeof ensureResources==="function")ensureResources(sh);
  const cantrips=[].concat(sh.cantrips||[],sh.featCantrips||[]);
  const leveled=[].concat(sh.spells||[],sh.featSpells||[]);
  if(!cantrips.length&&!leveled.length)return `<div class="empty">${escHtml(cur.name)} channels no spells.</div>`;
  const ab=sh.spellAbility||sh.featSpellAbility, am=(ab&&sh.mods&&sh.mods[ab]!=null)?sh.mods[ab]:null, pb=sh.profBonus||0;
  const tag=(lab,val)=>`<span class="slot-tag">${lab} <b>${val}</b></span>`;
  const hud=[
    ab?tag("Casting",ABIL_LABEL[ab]||ab.toUpperCase()):"",
    am!=null?tag("Save DC",8+pb+am):"",
    am!=null?tag("Attack",(pb+am>=0?"+":"")+(pb+am)):""
  ];
  const card=name=>{const s=spellByName(name);const meta=(s&&s.level===0)?"Cantrip":(s?("Level "+s.level):"Spell");
    return `<div class="bardo-opt spell-opt spell-card" tabindex="0" onmouseenter="showSpellTip(this)" onmouseleave="hideSpellTip()" onfocus="showSpellTip(this)" onblur="hideSpellTip()">`+
      `<span class="opt-title">${escHtml(name)}</span>`+
      `<span class="opt-meta">${meta}${s&&s.school?" · "+s.school:""}</span>`+
      `<span class="opt-desc">${escHtml(s?(s.flavor||""):"the DM holds this spell's text")}</span>`+
      (s&&s.text?`<span class="opt-full">${escHtml(s.text)}</span>`:"")+`</div>`;};
  const grp=(title,names)=>names.length?`<div class="spell-grp-lbl">${title} <span class="psub">${names.length}</span></div><div class="bardo-opts grid">${names.map(card).join("")}</div>`:"";
  return `<div class="spell-hud">${hud.filter(Boolean).join("")}</div>${spellSlotTracker(sh)}${grp("Cantrips",cantrips)}${grp("Spells",leveled)}
    <div class="pcap" style="margin-top:8px">Hover a spell for its full text. ● a slot you hold · ○ a slot spent — slots spend at the table, your DM tracks the cast.</div>`;
}

/* Dotted spell-slot tracker — one row per spell level (filled ● = held, hollow ○ = spent), the pact row
   for warlocks, plus class pools. One row per level so it grows DOWNWARD as higher slots unlock (room for
   all of L1–L9); each row's dots wrap if a level ever holds many. */
function spellSlotTracker(sh){
  const row=(label,cur,max,cls)=>{let d="";for(let i=0;i<max;i++)d+=`<span class="slot-pip${i<cur?' on':''}${cls?' '+cls:''}"></span>`;
    return `<div class="slot-trow"><span class="slot-tlab">${escHtml(label)}</span><span class="slot-tpips">${d}</span><span class="slot-tnum">${cur}/${max}</span></div>`;};
  const rows=[];
  (sh.slotsMax||[]).forEach((m,i)=>{if(m>0)rows.push(row("Level "+(i+1),(sh.slots||[])[i]||0,m));});
  if(sh.pact&&sh.pact.max)rows.push(row("Pact · L"+sh.pact.level,(sh.pact.cur!=null?sh.pact.cur:sh.pact.max),sh.pact.max,"pact"));
  for(const k in (sh.pools||{})){const p=sh.pools[k];if(!p||!p.max||p.max>12)continue;
    const lab=((typeof RESOURCE_POOLS!=="undefined"&&RESOURCE_POOLS[k])||{}).label||k;
    rows.push(row(lab,p.cur,p.max,"pool"));}
  return rows.length?`<div class="slot-tracker">${rows.join("")}</div>`:"";
}

/* the character sheet, as a side panel */
/* Live consumable-economy tracker (read-only reflection of state — docs/EVENT-CONTRACT.md):
   spell-slot pips per level, pact slots, and class pools. HP lives in the badge above. */
function resourceTrackerHTML(sh){
  if(typeof ensureResources==="function")ensureResources(sh);
  const pips=(cur,max)=>{let s="";for(let i=0;i<max;i++)s+=`<span class="rp-pip${i<cur?' on':''}"></span>`;return s;};
  const rows=[];
  (sh.slotsMax||[]).forEach((m,i)=>{if(m>0)rows.push(`<div class="rp-row"><span class="rp-lab">Level ${i+1} slots</span><span class="rp-pips">${pips((sh.slots||[])[i]||0,m)}</span><span class="rp-num">${(sh.slots||[])[i]||0}/${m}</span></div>`);});
  if(sh.pact)rows.push(`<div class="rp-row"><span class="rp-lab">Pact slots <span class="dim">(L${sh.pact.level})</span></span><span class="rp-pips">${pips(sh.pact.cur,sh.pact.max)}</span><span class="rp-num">${sh.pact.cur}/${sh.pact.max}</span></div>`);
  for(const k in (sh.pools||{})){const p=sh.pools[k],lab=((typeof RESOURCE_POOLS!=="undefined"&&RESOURCE_POOLS[k])||{}).label||k;
    rows.push(`<div class="rp-row"><span class="rp-lab">${escHtml(lab)}${p.die?` <span class="dim">${p.die}</span>`:""}</span><span class="rp-pips">${p.max<=10?pips(p.cur,p.max):""}</span><span class="rp-num">${p.cur}/${p.max}</span></div>`);}
  if(!rows.length)return "";
  return `<div class="cp-resources"><h4>✶ Resources</h4>${rows.join("")}</div>`;
}

function renderCharacterPanel(w,cur){
  if(!cur)return `<div class="empty">No soul in play.</div>`;
  const sh=cur.sheet;
  if(!sh)return `<h3>${cur.name}</h3><div class="cs">${cur.headline||cur.spark}</div>`;
  if(typeof ensureResources==="function")ensureResources(sh);
  const hpCur=(sh.hpCur==null?sh.hp:sh.hpCur);
  // XP / advancement readout (advancement.js). At the ceiling there is no "next"; below it we show
  // the bar from this level's floor to the next level's threshold + the remaining XP.
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
  const scores=ABIL.map(a=>`<div class="cp-score"><div class="cp-ab">${ABIL_LABEL[a]}</div><div class="cp-val">${sc[a]!=null?sc[a]:"—"}</div><div class="cp-mod">${(md[a]||0)>=0?'+':''}${md[a]||0}</div></div>`).join("");
  const inv=(sh.inventory&&sh.inventory.length)?sh.inventory.slice():[];
  const allCantrips=[].concat(sh.cantrips||[],sh.featCantrips||[]);
  const allSpells=[].concat(sh.spells||[],sh.featSpells||[]);
  const spells=[].concat(allCantrips,allSpells);
  // full skill list with the actual roll modifier (ability mod + prof if proficient), best-first,
  // so the player can pick the right skill at a glance. ● = proficient.
  const profSet=new Set(sh.skillProfs||[]);
  const skillCol=(typeof ALL_SKILLS!=="undefined"?ALL_SKILLS:[]).map(s=>{
    const ab=(typeof SKILL_ABILITY!=="undefined"&&SKILL_ABILITY[s])||"int", prof=profSet.has(s);
    const tot=(md[ab]||0)+(prof?(sh.profBonus||0):0);
    return {s,ab,prof,tot};
  }).sort((a,b)=>b.tot-a.tot||a.s.localeCompare(b.s))
    .map(r=>`<div class="crow"${r.prof?' style="font-weight:600"':''}><span>${r.prof?'●':'○'} ${escHtml(r.s)} <span style="color:var(--ink-dim);font-size:.82em">${ABIL_LABEL[r.ab]}</span></span><span class="v" style="color:var(--gold-soft)">${r.tot>=0?'+':''}${r.tot}</span></div>`).join("")
    ||`<div class="crow"><span class="dim">—</span></div>`;
  const PACKS=(typeof PACK_CONTENTS!=="undefined")?PACK_CONTENTS:{};
  const packOf=name=>{const k=Object.keys(PACKS).find(p=>name.indexOf(p)>=0);return k?PACKS[k]:null;};
  const invCol=inv.length?inv.map(i=>{const pc=packOf(i);
    return pc
      ? `<details class="crow pack-row"><summary>${escHtml(i)} <span class="pack-n">${pc.length} items ▾</span></summary><div class="pack-contents">${pc.map(x=>`<div class="pack-item">· ${escHtml(x)}</div>`).join("")}</div></details>`
      : `<div class="crow"><span>${escHtml(i)}</span></div>`;}).join(""):`<div class="crow"><span class="dim">—</span></div>`;
  return `<div class="cp-head"><div class="cp-portrait">☖</div><div><h3>${escHtml(cur.name)}</h3>
      <div class="cp-sub">${escHtml(sh.species)} ${escHtml(sh.class)}${sh.subclass?` <span style="color:var(--gold-soft)">(${escHtml(sh.subclass)})</span>`:""}${sh.background?" · "+escHtml(sh.background):""} · Lv ${sh.level||1}</div></div></div>
    <div class="cp-scores">${scores}</div>
    <div class="cp-badges">
      <div class="cp-badge hp"><span class="bi">${gico("heart","❤",18)}</span><span class="bv">${hpCur}<span class="bvmax">/${sh.hp}</span></span><span class="bl">HP</span></div>
      <div class="cp-badge ac"><span class="bi">${gico("shield","🛡",18)}</span><span class="bv">${sh.ac}</span><span class="bl">AC</span></div>
      <div class="cp-badge xp"><span class="bi">✦</span><span class="bv">${xp}</span><span class="bl">XP</span></div></div>
    <div class="cp-xp">
      ${atMax
        ? `<div class="cp-xp-line">Level ${lvl} — the ceiling of this age.</div>`
        : canLevel
        ? `<div class="cp-xp-bar"><span style="width:100%"></span></div>
           <div class="cp-xp-line"><b>${xp}</b> XP — enough to advance.</div>`
        : `<div class="cp-xp-bar"><span style="width:${xpPct}%"></span></div>
           <div class="cp-xp-line"><b>${toNext}</b> XP to level ${lvl+1} <span class="cp-xp-dim">· ${xp} / ${xpNext}</span></div>`}
      ${canLevel
        ? `<button class="btn primary sm" style="width:100%;margin-top:8px" onclick="claimLevelUp()">⬆ Come into your power — Level ${earnedTo}</button>`
        : owesPicks
        ? `<button class="btn primary sm" style="width:100%;margin-top:8px" onclick="openLevelUpForActive()">✦ Choose your level-${lvl} powers</button>`
        : ""}
    </div>
    ${resourceTrackerHTML(sh)}
    <div class="cp-cols">
      <div class="cp-col"><h4>⚔ Skills</h4>${skillCol}</div>
      <div class="cp-col"><h4>❖ Inventory</h4>${invCol}</div></div>
    ${(allCantrips.length||allSpells.length)?`<div class="cp-foot">${allCantrips.length?`<b>Cantrips</b> ${escHtml(allCantrips.join(", "))}`:""}${(allCantrips.length&&allSpells.length)?" · ":""}${allSpells.length?`<b>Spells</b> ${escHtml(allSpells.join(", "))}`:""} <button class="btn ghost sm" style="margin-left:6px" onclick="openPanel('spells')">✶ Spellbook</button></div>`:""}
    <div class="cp-foot"><b>Prof</b> +${sh.profBonus} · <b>PP</b> ${sh.passivePerception} · <b>Hit Die</b> ${sh.hitDie} · <b>Saves</b> ${(sh.saveProfs||[]).map(x=>ABIL_LABEL[x]).join("/")||"—"} · <b>Gold</b> ${sh.gold!=null?sh.gold+" gp":"—"}${sh.feat?` · <b>Feat</b> ${escHtml(sh.feat)}`:""}${(sh.feats&&sh.feats.length)?` · <b>Feats</b> ${sh.feats.map(f=>escHtml(f.name)).join(", ")}`:""}</div>
    ${(sh.subclassFeatures&&sh.subclassFeatures.length)?`<div class="cp-foot"><b>${escHtml(sh.subclass||"Subclass")}</b> ${sh.subclassFeatures.map(f=>escHtml(f.name)).join(", ")}</div>`:""}
    ${renderCharacterHistory(w,cur)}
    <div class="char-actions" style="margin-top:14px">
      <button class="btn sm" onclick="handToDM()">✦ Hand to your DM</button>
      <button class="btn ghost sm" onclick="killCharacter('${cur.id}')">They fall…</button>
      ${(typeof corpsesAt==="function"?corpsesAt(w,w.currentNodeId):[]).filter(d=>d.id!==cur.id)
        .map(d=>`<button class="btn ghost sm" onclick="recoverFallen('${d.id}')">⚰ Recover ${escHtml(d.name)}'s effects</button>`).join("")}</div>`;
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
/* clicking a rail item toggles its panel — if it's already open, collapse back to the Story view */
function openPanel(name){GS.gamePanel=(GS.gamePanel===(name||null)?null:(name||null));renderWorld();}

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
