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
/* TRANSITION-CONTRACT.md §3.5/§10 — one native, keyboard-reachable button per visible SOFT
   (rumored) frontier node, so choosing to set out visibly fires the start_walk handshake instead
   of depending on DM memory. Renders nothing (not an empty box) when there are no soft nodes. */
function renderSetOutButtons(w){
  const m=mapOf(w);
  const ids=mapVisibleIds(w).filter(id=>m.nodes[id]&&m.nodes[id].soft);
  if(!ids.length) return "";
  return `<div class="mi-sep"></div><div class="mi-lbl">Rumored frontiers</div>` +
    ids.map(id=>{const nm=escHtml(nodeName(w,id));
      return `<button class="mi" onclick="startWalkTo('${id}')" aria-label="Set out for ${nm}, a rumored frontier"><span class="mi-ic">⟶</span>Set out — ${nm}</button>`;
    }).join("");
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

/* BATTLE-VISUALS A7 — the ⚔ combat outcome ledger (addLedger(w,"outcome",{kind:...}), src/world/dm.js)
   currently never surfaces in the center feed — it's a separate append-only channel from dmLogOf's
   narration messages. Pull the combat-kind entries and render them as small quiet ⚔ chips alongside
   the DM's prose (the narration stays the hero; these are a supporting mechanical ledger, same voice
   as eventChip's HP/slot chips). combat-start/combat-end always show; the per-turn kinds (attack/
   foe-turn/death-save) are scoped to WITHIN a combat window (between that combat-start and its matching
   combat-end) so a stray attack-kind entry from some other system's reuse of the word never surfaces
   outside an actual fight. */
const CMB_FEED_KINDS=new Set(["attack","foe-turn","combat-start","combat-end","death-save"]);
function cmbLedgerFeedEntries(w){
  const ledger=(w&&w.ledger)||[];
  const out=[];
  let inFight=false;
  ledger.forEach(e=>{
    const kind=e&&e.data&&e.data.kind;
    if(kind==="combat-start"){ inFight=true; out.push(e); return; }
    if(kind==="combat-end"){ inFight=false; out.push(e); return; }
    if(inFight && CMB_FEED_KINDS.has(kind)) out.push(e);
  });
  return out;
}
/* One compact chip per ledger outcome — reuses the entry's own human-readable `text` (already carries
   the ⚔/☠ glyph + coarse state words, never a raw foe HP/AC number — addLedger's callers already honor
   the no-leak rule the combat panel enforces). */
function cmbFeedChip(e){
  const kind=(e&&e.data&&e.data.kind)||"";
  const cls=kind==="combat-start"?"cmb-feed-start":kind==="combat-end"?"cmb-feed-end":kind==="death-save"?"cmb-feed-death":"cmb-feed-turn";
  return `<div class="cmb-feed-chip ${cls}">${escHtml((e&&e.text)||"")}</div>`;
}

/* The DM feed — the chat-first play surface for the DM Bridge (docs/DM-BRIDGE.md, NEW-GAME-FLOW §9
   lane B). A scrolling chronicle of player turns + DM narration, the "DM is considering…" indicator,
   the roll-handshake affordance, the three-options ask, and the free-text action box. Logic lives in
   src/world/dm.js (dmSend/dmRollFor/sendTurn); this just paints GS.dm + dmLogOf(w). */
function renderDMFeed(w){
  const log=dmLogOf(w);
  const slice=log.slice(-24);
  // A7: merge the combat feed chips into the same chronological stream as the narration messages,
  // sorted by their shared `t` timestamp (both addLedger and pushDmLog stamp Date.now() at write time).
  const cmbEntries=cmbLedgerFeedEntries(w).filter(e=>!slice.length || e.t>=(slice[0].t||0));
  const stream=slice.map((m,idx)=>({t:m.t||0,idx,kind:"msg",m}))
    .concat(cmbEntries.map(e=>({t:e.t||0,idx:-1,kind:"cmb",e})))
    .sort((a,b)=>a.t-b.t || (a.kind==="cmb"?-1:1));
  const feed=log.length||cmbEntries.length?stream.map(item=>{
    if(item.kind==="cmb")return cmbFeedChip(item.e);
    const m=item.m, idx=item.idx;
    if(m.role==="player"){
      // show the FULL breakdown so proficiency/ability mods are always visible: "Stealth d20=14 +3 +2 prof = 19"
      const rolls=(m.rolls&&m.rolls.length)?` <span class="dm-roll">⚅ ${m.rolls.map(r=>{
        if(r.breakdown) return escHtml(`${r.label}: ${r.breakdown}`);   // free/dice roll — show the full trace
        const die=r.die||"d20", base=(r.result!=null?r.result:r.total), md=(r.mods&&String(r.mods).trim())?" "+String(r.mods).trim():"";
        const baseStr=r.pair?`${die}=${base} [${r.pair.join(",")}${r.adv==="advantage"?"↑":"↓"}]`:`${die}=${base}`;
        return escHtml(`${r.label} ${baseStr}${md} = ${r.total}`);
      }).join(", ")}</span>`:"";
      return `<div class="dm-msg dm-you"><div class="dm-sigil"><img class="sg-med" src="assets/icons/medallion-you.png" alt=""><span class="dm-who">You</span></div><div><div class="dm-txt">${escHtml(m.text)}${rolls}</div></div></div>`;
    }
    const ev=(m.events&&m.events.length)?`<div class="dm-events">${m.events.map((e,ei)=>eventChip(e,(m.applied&&m.applied[ei])?m.applied[ei].res:null)).join("")}</div>`:"";
    // the freshest DM line streams in word-by-word (GS.dm.animate, set on a new reply) — render an empty
    // span carrying the full text in data-full; streamDMText() fills it after the DOM is in place.
    const streaming=(idx===slice.length-1)&&GS.dm.animate&&m.role==="dm";
    const txt=streaming?`<span id="dmStream" class="dm-txt streaming" data-full="${escHtml(m.text)}"></span>`:`<div class="dm-txt">${mdBold(escHtml(m.text))}</div>`;
    const lat=(m.latencyMs!=null)?`<span class="dm-latency" title="turn round-trip — your send → DM answer">⏱ ${(m.latencyMs/1000).toFixed(1)}s</span>`:"";
    // ROLL-BRANCHES §2 step 3: the local-resolve marker — this line never made a live DM inference,
    // it was a pre-declared branch the script picked by margin the instant the dice landed.
    const branchTag=m.branchResolved?`<span class="dm-latency" title="resolved locally by the pre-declared branch — no DM inference this beat">⚄ resolved by the dice</span>`:"";
    return `<div class="dm-msg dm-dm"><div class="dm-sigil"><img class="sg-med" src="assets/icons/medallion-dm.png" alt=""><span class="dm-who">DM</span>${lat}${branchTag}</div><div>${txt}${ev}</div></div>`;
  }).join(""):`<div class="empty">The DM is silent. Say or do something to begin — make sure <code>dev/dm-bridge.py</code> is running.</div>`;

  let foot="";
  if(GS.dm.pending && GS.seat && GS.seat.streaming && GS.seat.streamText){
    // DM-SEAT (docs/DM-SEAT.md §1 "streaming"): real deltas are arriving NOW (seat.js's seatStreamAppend),
    // distinct from the mailbox's post-hoc word-by-word animation below — the seat has no completed
    // dmlog entry to animate yet (pushDmLog only runs once applyResponse validates the full reply), so
    // this renders the in-flight text directly as its own live bubble.
    foot=`<div class="dm-msg dm-dm"><div class="dm-sigil"><img class="sg-med" src="assets/icons/medallion-dm.png" alt=""><span class="dm-who">DM</span></div><div class="dm-txt streaming">${mdBold(escHtml(GS.seat.streamText))}</div></div>`;
  } else if(GS.dm.pending){
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
  const box=`<div class="dm-input"><textarea id="dmAction" rows="1" placeholder="type what you do…" aria-label="Your action" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();dmSend();}"></textarea>
    <button onclick="dmSend()" ${GS.dm.pending?"disabled":""}>▷</button></div>`;

  // TABLETOP-UNITS U2: the DM feed is the always-on live region (BLIND-PLAYABLE) — a roll trace,
  // a DM reply, an ask — every new line here must announce, whether the stage is showing or
  // collapsed. role=log matches the chronicle semantics (a scrolling log of turns), aria-live=polite
  // so it doesn't interrupt an in-progress announcement.
  return `<div class="section dm-section"><h3>The DM</h3>
    <div class="dm-feed" role="log" aria-live="polite">${feed}${foot}</div>${box}</div>`;
}

/* Chat-first World view (NEW-GAME-FLOW §9): the DM conversation is the center; the world's panels
   (Character/Map/Ledger/Gazetteer/Powers) live in a left icon rail and slide in beside the chat. */
function renderWorld(){
  // COMPOSER DRAFT PRESERVATION (docs/PLAYTEST-FINDINGS-0704.md finding #1): this function rebuilds
  // the ENTIRE #dmAction textarea markup on every call (host.innerHTML=... below), and it's invoked
  // from ~55 call sites incl. async DM-response paths (world/dm.js applyResponse/pollResponse) that
  // can land while the player is mid-type. Snapshot the live textarea's value/selection/focus BEFORE
  // the DOM is torn down, then re-apply it to the freshly-rendered node after, so a re-render never
  // silently wipes an in-flight, unsent draft. Guarded on both ends: the element may legitimately not
  // exist on either side (non-combat panels mid-transition, a fresh mount before the first render).
  // Constraint: dmSend() clears ta.value="" itself BEFORE sendTurn()'s render lands, so an EMPTY
  // snapshot in that flow is the correct, intentional state — this guard only restores a NON-EMPTY
  // snapshot, so the send-then-clear path is left alone by design, not accidentally preserved.
  const dmActionPre=document.getElementById("dmAction");
  const dmActionSnapshot=dmActionPre?{
    value:dmActionPre.value,
    selectionStart:dmActionPre.selectionStart,
    selectionEnd:dmActionPre.selectionEnd,
    hadFocus:(typeof document!=="undefined"&&document.activeElement===dmActionPre),
  }:null;
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
  // COMBAT-TRACKER §1/G7 auto-open: a live fight takes over the panel rail; the prior panel (if any)
  // is restored ONCE combat ends (GS.prevPanel is only meaningful mid-fight — cleared the moment it rides).
  if(GS.combat&&GS.combat.active){
    if(GS.gamePanel!=="combat"){ GS.prevPanel=GS.gamePanel; GS.gamePanel="combat"; }
  } else if(GS.prevPanel!==undefined && GS.gamePanel==="combat"){
    // CHASE-CONTRACT-FIX.md finding #5: a pre-fight `null` panel (chat-only, the common case) must
    // restore to `null`, not silently substitute "map" — `||"map"` treated null and undefined the
    // same, but only `undefined` means "no stashed panel to restore" (the mid-fight sentinel, set
    // above only when entering); a stashed `null` IS the real pre-fight state and must round-trip.
    GS.gamePanel=(GS.prevPanel===undefined?"map":GS.prevPanel); GS.prevPanel=undefined;
    // TABLETOP-VISION §3 "combat does not spawn a second surface" (TABLETOP-UNITS.md §U1 seam 3):
    // combat_end no longer retires the Theater instance here — the SAME mounted stage relaxes back
    // into the standing-table tray instead (this render's own per-render push, theaterStageSync
    // below, pushes trayFrom(hereSource,…) the moment it runs again for this pass, the instant
    // GS.combat is no longer active). GS.theaterMounted is left exactly as it was: true carries the
    // mount forward into the relaxed table; false (never mounted, or a failed mount) stays false and
    // the classic layout keeps rendering, unchanged. retire() itself still exists as a real verb —
    // it now fires only on leaving the in-session view (gsResetWorldTransients, src/world/play.js)
    // or the user collapsing the stage (GS.stageCollapsed toggle, a later unit).
  }
  const panel=GS.gamePanel||null;
  // BATTLE-STAGE mode (docs/BATTLE-THEATER.md §6, IN-SESSION-UI three-zone frame) — TABLETOP-VISION
  // §1 Standing Table (TABLETOP-UNITS.md §U1 seam 1): the stage is no longer combat-only — it's the
  // permanent center stage for the whole in-session view. Combat's own success/mount discipline is
  // unchanged (GS.theaterMounted is set by theaterStageSync, below, ONLY after a real mount() call
  // returns true); this gate just drops the `GS.combat&&GS.combat.active` requirement so a mounted
  // stage stays up outside a fight too. `!GS.stageCollapsed` is the user's own collapse toggle
  // (GS-only, a later unit's rail button) — undefined reads as "not collapsed", the default. Absent/
  // failed mount (or a collapsed stage) still renders the classic layout unchanged — the null-safe
  // degrade the spec requires (TEXT-FIRST).
  const stageMode=!!(GS.theaterMounted && !GS.stageCollapsed);
  // TABLETOP-VISION §1 Standing Table (TABLETOP-UNITS.md §U1 seam 2): "in-session" gates the mount
  // ATTEMPT (the probe below + theaterStageSync) — w.sessionLive is the same persistent flag
  // startSession/endSession (src/world/play.js) already flips, so the stage only ever tries to mount
  // once real play has begun (never mid-chargen/world-select), and stops trying the moment a session
  // ends (endSession sets it false before this function next renders).
  const inSession=!!(w&&w.sessionLive);

  // sceneHead shrinks to near-nothing (docs/IN-SESSION-UI.md §4) — location + clock relocate to the
  // status sidebar. A faint world/setting whisper, top-right of the feed, is all that remains (mockup
  // "◈ EMBERREACH" = the setting/region name, not the current room — that lives in the sidebar).
  const settingName=(w.seed&&w.seed.master&&w.seed.master.name)||w.name||"";
  // the whisper grew into the plaque (ASSET-PROMPTS batch 1 art) — still just the setting name, now on
  // the engraved banner. 9-slice via border-image so the finials never stretch. title="" carries the
  // FULL name even when the stage-mode rail's tighter width (BATTLE-STAGE REV2, round 1) ellipsizes the
  // visible text at some long-name/narrow-rail combination — hover/AT always exposes the whole name.
  const head=`<div class="scene-plaque-row"><div class="scene-plaque" title="${escHtml(settingName)}">${escHtml(settingName)}</div></div>`;

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

  // BATTLE-STAGE mode (docs/BATTLE-THEATER.md §6): pure re-arrangement, not a content change. The
  // feed markup (chat) and the combat panel's header/grid markup are IDENTICAL to the classic layout
  // (same functions, same output) — only WHICH column they land in differs. This keeps the
  // BLIND-PLAYABLE prose twin (role=status), every button, and the composer's wiring byte-identical;
  // only their container swaps. NOTE: theaterStageHtml computes the header/grid ITSELF in stage mode
  // (never via combatPanel()) — cmbDamageFlashed() mutates GS.cmbLastStates as a read-then-overwrite,
  // so calling it a second time in the same render pass would see a false "no change" diff.
  // BATTLE-STAGE mount probe: the FIRST render of a session (TABLETOP-UNITS.md §U1 seam 2 — no
  // longer gated on a fight being active) paints the CLASSIC layout (stageMode is false until a
  // mount actually succeeds — see stageMode's derivation above), so theaterStageSync needs a
  // #theaterStage element to exist even in the classic branch to attempt that first mount. Hidden
  // (0-size, off-flow) until stageMode flips true, at which point theaterStageHtml renders the same
  // id as the real, visible canvas container — same element identity, no re-mount needed.
  const mountProbe=(inSession&&!stageMode)
    ? `<div id="theaterStage" class="theater-stage-canvas theater-stage-probe" aria-hidden="true"></div>` : "";
  // TABLETOP-UNITS U2 (docs/TABLETOP-UNITS.md §U2): the stage-col/feed-col arrangement is the
  // STANDING layout whenever a stage is actually up — this local `showStage` folds in the
  // GS-only collapse toggle (see gameRail's stage button + toggleStage() below) WITHOUT touching
  // `stageMode` itself, which stays U1's seam (render.js's stageMode derivation, above) — collapsing
  // never un-mounts the theater, it only swaps which branch of THIS ternary paints.
  const showStage=stageMode&&!GS.stageCollapsed;
  // §9.11 (TABLETOP-VISION.md): .stage-prose (the battle prose twin, role=status aria-live=polite)
  // must live OUTSIDE the aria-hidden stage subtree — extracted here as the feed section's live
  // sibling, once, instead of nested inside theaterStageHtml's own (now aria-hidden) markup.
  const stageProse=showStage?stageProseHtml(GS.combat):"";
  const mainHtml=showStage
    ? `<div class="game-main">
        <div class="chat-col stage-col" aria-hidden="true">${theaterStageHtml(w,cur)}</div>
        <section class="panel-col stage-feed-col" aria-label="The DM">${stageProse}${head}${chat}</section>
      </div>`
    : `<div class="game-main">
        <section class="chat-col" aria-label="The DM">${head}${chat}${mountProbe}</section>
        ${panel?`<aside class="panel-col">${gamePanelContent(w,cur,panel)}</aside>`:""}
      </div>`;

  host.innerHTML=`<div class="game ${panel?'has-panel':''}${showStage?' battle-stage':''}">
    ${statusSidebar(w,cur,panel)}
    ${mainHtml}
  </div>`;
  // COMPOSER DRAFT PRESERVATION, restore half: only fires when the pre-render snapshot had a non-empty
  // value — an empty snapshot (incl. dmSend()'s deliberate clear-before-render) is left alone, matching
  // the constraint noted at the snapshot site above. Guarded: the freshly-rendered node may not exist
  // (e.g. this render landed on a panel with no composer).
  if(dmActionSnapshot&&dmActionSnapshot.value){
    const dmActionPost=document.getElementById("dmAction");
    if(dmActionPost){
      dmActionPost.value=dmActionSnapshot.value;
      if(typeof dmActionPost.setSelectionRange==="function"){
        try{ dmActionPost.setSelectionRange(dmActionSnapshot.selectionStart,dmActionSnapshot.selectionEnd); }catch(e){}
      }
      if(dmActionSnapshot.hadFocus) dmActionPost.focus();
    }
  }
  // the feed lives in .chat-col normally, but relocates into .panel-col during battle-stage mode —
  // query broadly so scroll-to-latest/streaming keep working in either column (IN-SESSION-UI's
  // "only the feed's message list scrolls" invariant is unaffected; it's the SAME node, new parent).
  const feed=host.querySelector(".dm-feed");
  if(GS.dm.animate){ GS.dm.animate=false; streamDMText(); }   // new DM reply: scroll to its TOP and type it in
  else if(feed) feed.scrollTop=feed.scrollHeight;             // otherwise jump to the latest line
  // auto-open the level-up picker when picks are owed (e.g. after a reload) — it can't be skipped
  if(typeof openLevelUpForActive==="function") openLevelUpForActive();
  // the ⚙ Menu popover closes on an outside click (its own clicks stopPropagation, §6)
  if(GS.menuOpen){
    setTimeout(()=>{ document.addEventListener("click",closeMenu,{once:true}); },0);
  }
  // BATTLE-STAGE mount/sync (docs/BATTLE-THEATER.md §6) — runs AFTER the DOM is in place so the
  // mount target element exists. Null-safe throughout: absent window.Theater / failed WebGL mount
  // leaves GS.theaterMounted false forever for this fight, and the classic combat-panel layout
  // (already painted above) is simply what stays on screen — no separate degrade path to maintain.
  theaterStageSync(w,cur);
}

/* TABLETOP-UNITS.md §U1 seam 4 — the standing table's own source read: the active walk's
   here-segment while the party is mid-walk, else the idle empty table. Mirrors src/world/dm.js's
   theaterEnvSegmentFor (the SAME prepOf/walkOfFrontier/cursor lookup combat_start's env-fill already
   performs) but returns the RAW segment record too (not just {environment,light,realms}) — trayFrom's
   "segment" source kind needs real feature/dressing/dims/light fields to derive a tray from, which
   theaterEnvSegmentFor's own smaller projection doesn't carry. theaterActiveRealmsFor(w) is the SAME
   activeRealmsFor(walk.skin,w) seam combat's own realm read uses, so a walked room's floor/light and
   its later combat both agree on which realm is active. Pure, null-safe throughout — any missing link
   in the prep/walk chain (no active walk, a narrow test harness, prep.js not loaded) degrades to
   {kind:"idle"}, never a throw. */
/* PLACE-GEN.md ADDENDUM §7 unit 7 — the node-tray lookup: mirrors urban.js's buildingApproach
   precedent for finding a node's bound codex place record (mapOf(w).nodes[nodeId].codexId ->
   codexGet), reused here rather than forked. Fires only when the record actually carries a spine
   archetypeKey (rollPlace's own archetype draw, codex-roll.js) — an untyped node (no place-gen mint
   at all, e.g. a bare urban-fabric district node) is NOT a node-tray candidate and this returns null,
   same "degrade to idle" law theaterHereSourceFor's every other missing-link case already keeps.
   Null-safe throughout: absent mapOf/codexGet (a narrow test harness), an unbound node, or a record
   with no rolled.archetypeKey all return null, never a throw. */
function theaterNodeSourceFor(w,nodeId){
  if(!nodeId) return null;
  if(typeof mapOf!=="function"||typeof codexGet!=="function") return null;
  const mnode=mapOf(w).nodes[nodeId];
  if(!mnode||!mnode.codexId) return null;
  const rec=codexGet(w,mnode.codexId);
  if(!rec||!rec.rolled||rec.rolled.archetypeKey==null) return null;
  return rec;
}

function theaterHereSourceFor(w){
  const realms=(typeof theaterActiveRealmsFor==="function")?theaterActiveRealmsFor(w):[];
  const hasWalkSeam=(typeof prepOf==="function"&&typeof walkOfFrontier==="function");
  const P=hasWalkSeam?prepOf(w):null, id=P&&P.activeWalkId;
  if(!id){
    const nodeRec=theaterNodeSourceFor(w,w&&w.currentNodeId);
    if(nodeRec) return { kind:"node", record:nodeRec, realms:realms };
    return { kind:"idle", realms:realms };
  }
  const pn=P.nodes&&P.nodes[id], walk=walkOfFrontier(w,id);
  if(!pn||!walk) return { kind:"idle", realms:realms };
  const cur=(pn.cursor&&pn.cursor.current)||1;
  const seg=(walk.segments||[]).find(s=>s.num===cur);
  if(!seg) return { kind:"idle", env:walk.environment||undefined, realms:realms };
  // TABLETOP-UNITS.md §U6 (U5's overlay.traces contract): the segment's own reskin/overlay entry
  // (pn.segments, keyed "S<num>" — the SAME array walkUpdateSegment/{type:"walk_update"} writes, see
  // dm.js's combat_end case) may carry {traces,removed} left by a combat that already ended on this
  // tray. Read-only here — this file never writes prep state — and purely additive to the return
  // shape (undefined when no reskin entry/no traces exist, same graceful-until-authored discipline
  // every other field on this object already has). castFrom (theater-data.js) reads these through
  // theaterCastSourceFor below to stage corpse figures; it never reaches into prep/walk itself.
  const reskinEntry=(pn.segments||[]).find(o=>o&&o.ref==="S"+cur)||null;
  // DUNGEON-GRAPH.md U3 item 2: a walk-with-SpatialPlan (pn.spatialPlan — same prep-node-overlay
  // home as pn.segments, docs/DUNGEON-GRAPH.md "Shared data shape" header) renders its current room +
  // immediate surroundings as the volumetric standing table instead of the flat combat-zone-grid tray.
  // No production writer stamps pn.spatialPlan yet (spatializePlan/semanticizePlan -> pn.spatialPlan is
  // DUNGEON-GRAPH.md U4's "walk binding" job, explicitly out of scope here) — this branch is the
  // RENDER-SIDE half only, additive and dormant until U4 lands: absent pn.spatialPlan (every walk
  // today), theaterHereSourceFor is byte-identical to before this unit (falls through to the existing
  // {kind:"segment"} return below).
  if(pn.spatialPlan){
    return { kind:"interior", plan:pn.spatialPlan, focusSegNum:cur, radius:1,
      env:walk.environment||undefined, realms:realms,
      traces:(reskinEntry&&reskinEntry.traces)||undefined, removed:(reskinEntry&&reskinEntry.removed)||undefined };
  }
  return { kind:"segment", segment:seg, env:walk.environment||undefined, realms:realms,
    traces:(reskinEntry&&reskinEntry.traces)||undefined, removed:(reskinEntry&&reskinEntry.removed)||undefined };
}

/* TABLETOP-UNITS.md §U6 — the standing tableau's OWN source read for castFrom(w,source): mirrors
   theaterHereSourceFor's null-safe discipline but shapes the {hereNodeId,walking,shopOpen,traces,
   removed} contract §U4 locked (+ §U6's two additive trace fields). hereNodeId prefers the active
   walk's frontier node (the same id ambientPresence/digest keys off, per U3) and falls back to
   w.currentNodeId for a non-walking node scene (a market haggle, per TABLETOP-VISION §3's node-tray
   source vocabulary) — node-tray DRESSING is out of this queue (TABLETOP-UNITS.md's closing note),
   but the cast (PC/companions/contacted NPCs/ambients) works of hereNodeId alone, so this costs
   nothing to generalize. shopOpen mirrors the SAME GS fields open_shop (dm.js) stamps. */
function theaterCastSourceFor(w,hereSource){
  const P=(typeof prepOf==="function")?prepOf(w):null;
  const walking=!!(hereSource&&hereSource.kind==="segment");
  const hereNodeId=(P&&P.activeWalkId)||(w&&w.currentNodeId)||null;
  const shopOpen=!!(GS.gamePanel==="shop"&&GS.activeShopId);
  return { hereNodeId:hereNodeId, walking:walking, shopOpen:shopOpen,
    traces:hereSource&&hereSource.traces, removed:hereSource&&hereSource.removed };
}

/* BATTLE-STAGE / TABLETOP-VISION Standing Table (TABLETOP-UNITS.md §U1 seams 2+4) — attempts the
   Theater mount (once per session, not once per fight — see `inSession`, renderWorld above) and, on
   every render, pushes the current board/units so the stage tracks state: the combat board/units
   while a fight is active (unchanged from BATTLE-THEATER §6), else the standing table's own tray
   (the here-segment while walking, the idle empty table otherwise) with castFrom's own tableau
   (TABLETOP-UNITS.md §U6 wires the unit-source switch; U4 built castFrom/arrangeTableau themselves).
   Split from renderWorld so the mount-then-rerender step (mounting flips
   GS.theaterMounted, which changes the LAYOUT, so it needs one more renderWorld() pass to actually
   paint the stage) stays a single, well-named seam. */
function theaterStageSync(w,cur){
  const inSession=!!(w&&w.sessionLive);
  const hasTheater=(typeof window!=="undefined")&&window.Theater&&typeof window.Theater.mount==="function";
  if(!inSession||!hasTheater) return;
  if(!GS.theaterMounted){
    const el=document.getElementById("theaterStage");
    if(!el) return;   // not yet in stage-attempt DOM this pass (classic layout painted instead) — next render tries again
    let ok=false;
    try{ ok=!!window.Theater.mount(el); }catch(e){ ok=false; }  // mount() itself is documented null-safe/non-throwing, but never let a stage failure crash the DM turn
    if(ok){
      GS.theaterMounted=true;
      renderWorld();   // one more pass: now that GS.theaterMounted is true, stageMode flips and the stage layout paints
      return;
    }
    return;  // mount failed (no WebGL etc.) — stays classic layout forever for this session, per the clean-degrade law
  }
  // already mounted: renderWorld's innerHTML pass DETACHED the live canvas — re-parent it into this
  // render's stage slot first (WebGL survives the move; reattach also re-fits size+camera, which
  // covers the hidden-probe zero-size mount). Found live 2026-07-03 (the black stage).
  const slot=document.getElementById("theaterStage");
  if(slot && typeof window.Theater.reattach==="function") window.Theater.reattach(slot);
  const cm=GS.combat;
  if(cm&&cm.active){
    // then push the current board/units so the stage stays in sync with GS.combat every render.
    if(typeof theaterBoardFrom==="function" && typeof window.Theater.setBoard==="function"){
      // BATTLE-THEATER LIGHTING: cm.segment.environment (stamped by the combat_start handler in dm.js off
      // the active walk — see theaterEnvSegmentFor) picks the palette/void-tint env; theaterBoardFrom's own
      // opts.env default ("dungeon") still covers a segment with no environment (an older snapshot, a
      // walk-less fight, a narrow test harness) — this is a pure additive read, never a required field.
      const env=(cm.segment&&cm.segment.environment)||undefined;
      // REALM-SURFACES-WIRING.md §3: cm.segment.realms (stamped by combat_start off the SAME
      // activeRealmsFor(skin,w) value the walk's own encounter path used — see dm.js's combat_start
      // case) selects the active realm's floor surface instead of the generic material pool. Absent on
      // a walk-less fight/older snapshot -> theaterBoardFrom's own opts.realms default (undefined) keeps
      // today's exact behavior, same null-safe discipline as `env` above.
      const realms=(cm.segment&&cm.segment.realms)||undefined;
      const board=theaterBoardFrom(cm.segment,cm.scene,{env,realms});
      window.Theater.setBoard(board);
    }
    if(typeof theaterUnitsFrom==="function" && typeof window.Theater.setUnits==="function"){
      const units=theaterUnitsFrom(cm);
      window.Theater.setUnits(units);
    }
  } else {
    // TABLETOP-VISION §1/§3 (TABLETOP-UNITS.md §U1 seam 4): outside combat the standing table shows
    // the here-segment's tray while walking, or the empty idle table when nothing is staged.
    const hereSource=theaterHereSourceFor(w);
    if(typeof trayFrom==="function" && typeof window.Theater.setBoard==="function"){
      const board=trayFrom(hereSource,null,{env:hereSource.env,realms:hereSource.realms});
      // DUNGEON-GRAPH.md U3: a SpatialPlan-sourced tray (theaterHereSourceFor's {kind:"interior",plan}
      // branch) comes back shaped {kind:"interior3d",...} — a materially different render family (real
      // volumetric InstancedMesh geometry, not the flat combat tile-column grid) that the GL layer's
      // own setInteriorBoard (not setBoard) knows how to build. Every other board kind is byte-
      // unchanged (still setBoard) — this is a pure additive routing split, not a setBoard rewrite.
      if(board && board.kind==="interior3d" && typeof window.Theater.setInteriorBoard==="function"){
        window.Theater.setInteriorBoard(board);
      } else {
        window.Theater.setBoard(board);
      }
    }
    // TABLETOP-UNITS.md §U6: combat_end reverses the unit-source switch — back to castFrom's own
    // tableau (PC/companions/contacted NPCs/blank ambients/corpse traces), arranged per U4's
    // mechanical rule. This is the "back" half of "combat_start switches castFrom->theaterUnitsFrom":
    // the SAME per-render push that already relaxed the BOARD (above, U1) now also relaxes the UNIT
    // list, so the relax is a full reconfigure, not just an empty stage. castFrom's own contract
    // (§U4) returns a plain `units[]` array — theater-boot.js's setUnits contract (its own header
    // comment: "`u` is a theaterUnitsFrom(...)-shaped {units:[...]}") wants the WRAPPED shape, the
    // same {units:[...]} the combat branch above already passes through unwrapped from
    // theaterUnitsFrom — wrap here so both branches feed the GL layer the identical shape. Falls back
    // to setUnits({units:[]}) if castFrom isn't loaded (a narrow harness), same degrade discipline as
    // every other guard here.
    if(typeof castFrom==="function" && typeof window.Theater.setUnits==="function"){
      const castSource=theaterCastSourceFor(w,hereSource);
      window.Theater.setUnits({ units: castFrom(w,castSource) });
    } else if(typeof window.Theater.setUnits==="function") window.Theater.setUnits({ units: [] });
  }
}

/* BATTLE-STAGE REV2 (docs/BATTLE-THEATER.md §6, layout rework 2026-07-03 — Adam: "think in LAYERS
   more and less in boxes"): the below-canvas zone-grid strip is RETIRED. The distance-indicating
   band arena Adam liked stays, but moves onto an OVERLAY LAYER absolutely positioned OVER the
   theater canvas — thin band-label rail along the board's depth edge + compact combatant chips
   pinned to the overlay's corners/edges, never covering the board center. The overlay is HTML/CSS
   over the canvas (no WebGL); pointer-events pass through everywhere except the chips themselves
   (cmbZoneInsert tap-sugar is preserved verbatim). Returns markup only — cmbZoneOccupants/
   cmbClampBand/CMB_BAND_LABEL are the same data path the old grid used, unchanged. */
function cmbStageOverlay(w,cur,cm,flashed){
  const grid=cm.grid||{bands:(typeof CM_BANDS!=="undefined"?CM_BANDS:["melee","near","far","out"]),lanes:(typeof CM_LANES!=="undefined"?CM_LANES:["L","C","R"])};
  const bands=grid.bands||[];
  const sh=cur&&cur.sheet;
  const allyRows=(typeof companionPartyStrip==="function")?companionPartyStrip(w):[];
  const scene=cm.scene||{};
  const hazardZones=(scene.hazardZones||[]).filter(hz=>typeof cmHazardVisible!=="function"||cmHazardVisible(hz));
  // one row per band, nearest (melee) at the bottom edge of the overlay, farthest at the top — this
  // mirrors the board's own depth axis (PC's melee range reads as "close to camera").
  const rows=bands.map(b=>{
    const lanesInRoom=(grid.lanes||["L","C","R"]);
    const occ=[].concat(...lanesInRoom.map(lane=>cmbZoneOccupants(cm,b,lane,cur,sh,allyRows,bands,flashed)));
    const elevAny=lanesInRoom.some(lane=>(typeof cmZoneElev==="function")&&cmZoneElev(cm,b,lane));
    const hz=hazardZones.find(h=>lanesInRoom.some(lane=>h.zone===(b+":"+lane)));
    const bandLbl=CMB_BAND_LABEL[b]||b;
    // empty bands stay in the ruler (the "distance-indicating arena" reads by ALWAYS showing all
    // bands) but carry NO plate/border of their own — just the thin label, so the overlay stays
    // near-invisible where nothing occupies it. Only a band with occupants gets the subtle plate.
    return `<div class="stage-band-row${occ.length?' has-occ':''}" data-band="${b}" onclick="cmbZoneInsert('${escHtml(bandLbl)}','C')">
      <span class="stage-band-lbl">${escHtml(bandLbl)}${elevAny?' <span class="stage-band-elev" title="elevated">▲</span>':''}${hz?` <span class="stage-band-hazard" title="${escHtml(hz.kind||"hazard")}">☠</span>`:''}</span>
      ${occ.length?`<span class="stage-band-chips">${occ.join("")}</span>`:""}
    </div>`;
  }).join("");
  // INITIATIVE-UI §1: the turn banner rides alongside the band rail at the overlay's top edge — a
  // sibling wrapper (not nested inside .stage-band-rail, which is its own column-reverse flex list of
  // ONLY band rows) so the banner's own CSS controls its position independent of the rail's layout.
  return `<div class="stage-overlay-top"><div class="stage-band-rail" aria-hidden="false">${rows}</div>${cmbTurnBanner(cm)}</div>`;
}
/* INITIATIVE-UI §1/§2 (docs/INITIATIVE-UI.md) — the turn banner: a compact plate on the stage overlay
   (top edge, between the band rail and the camera controls; pointer-events:none) reading
   "Round {N} — YOU ACT" / "Round {N} — THEY ACT", derived ONLY from cm.round + cm.side (no new state
   fields — side-based initiative stays exactly as COMBAT.md locked it). §2 spent tick: the side whose
   turn already passed THIS round (cm.side !== cm.first) gets a dim marker — rendered here as a muted
   glyph appended to the banner text itself so it reads at any zoom without a second DOM lookup;
   combatPanel's classic header gets the same text via the same function (§1 "Also rendered in the
   classic combatPanel as text"). */
function cmbTurnBanner(cm){
  if(!cm||!cm.active) return "";
  const round=cm.round||1;
  const sideWord=cm.side==="pc"?"YOU ACT":"THEY ACT";
  const spent=!!(cm.first && cm.side!==cm.first);
  // the side named in the spent clause is the FIRST-acting side (the one whose turn already passed
  // this round), never the side currently acting — cm.side!==cm.first means cm.first is the spent one.
  const spentWord=spent?(cm.first==="pc"?" · YOURS SPENT":" · THEIRS SPENT"):"";
  return `<div class="cmb-turn-banner${spent?' spent':''}" aria-hidden="false">Round ${round} — ${sideWord}${spentWord}</div>`;
}
/* THEATER-ZOOM-SPREAD — the camera-control corner plate (Adam's brief: "⊕/⊖ buttons on... the
   battle-stage overlay (top-right corner plate, pointer-events on, next to a ⟳ rotate button if none
   here yet — check; add both)"). cmbStageOverlay's existing children (the band rail top-left, the
   overlay-foot bottom-right) never claimed the top-right corner — .stage-overlay is a column flexbox
   (justify-content:space-between), so this plate is pinned there via its own CSS (position:absolute,
   see genesis.html), not flex order. pointer-events:auto on the plate itself (the overlay's own default
   is pointer-events:none so the board stays clickable underneath everywhere else — same pattern as
   .stage-band-row.has-occ / .stage-prose already use). window.Theater may be absent (no WebGL / a
   headless render) — the buttons still render (never worse than today / graceful markup presence) but
   their onclick calls are themselves null-safe (Theater.zoom/rotate are documented no-ops pre-mount). */
function cmbStageControls(){
  return `<div class="stage-cam-controls" role="group" aria-label="camera controls">
    <button type="button" class="stage-cam-btn" title="zoom in" aria-label="zoom in" onclick="if(window.Theater&&window.Theater.zoom)window.Theater.zoom(1)">⊕</button>
    <button type="button" class="stage-cam-btn" title="zoom out" aria-label="zoom out" onclick="if(window.Theater&&window.Theater.zoom)window.Theater.zoom(-1)">⊖</button>
    <button type="button" class="stage-cam-btn" title="rotate 90°" aria-label="rotate 90 degrees" onclick="if(window.Theater&&window.Theater.rotate)window.Theater.rotate()">⟳</button>
  </div>`;
}
/* BATTLE-STAGE center-column markup (docs/BATTLE-THEATER.md §6): the round/side header + scene tags
   collapse into ONE slim bar, the theater canvas grows to reclaim the vertical the old strip used
   (~72-74vh), and the band/chip arena + prose summary now live in an overlay layer absolutely
   positioned over the canvas (cmbStageOverlay) rather than a strip below it. Only called from
   renderWorld() when stageMode is true (GS.combat.active already guaranteed by the caller), but
   guards defensively anyway. */
function theaterStageHtml(w,cur){
  const cm=GS.combat;
  // TABLETOP-VISION §1 Standing Table (browser-QA finding 2026-07-08): outside combat the stage is
  // STILL the live canvas host — the standing tableau (trayFrom board + castFrom units, pushed every
  // render by theaterStageSync's non-combat branch) paints onto the SAME #theaterStage element. The
  // showStage branch (renderWorld's mainHtml) renders this into the visible stage column whenever the
  // stage is mounted, combat or not; if this returned "" outside combat (the old behavior) the visible
  // column had no host, the async-loaded canvas never re-parented (theaterStageSync.reattach found
  // nothing), and the tableau stayed blank — the exact bug real-WebGL Chrome caught while jsdom (which
  // stubs Theater) stayed green. Emit the bare host here: no combat header/scene-tags/overlay (there's
  // no round/side/cover to show when nothing is fighting), just the mount target + its wrap, same
  // #theaterStage id so the mounted canvas relaxes straight into the table.
  if(!cm||!cm.active) return `<div class="theater-stage-wrap">
      <div id="theaterStage" class="theater-stage-canvas" aria-label="the table"></div>
    </div>`;
  const scene=cm.scene||{};
  const tags=[].concat(
    Object.keys(scene.cover||{}).map(k=>`⛊ ${k}`),
    (scene.hazards||[]).map(h=>`☠ ${typeof h==="string"?h:(h.kind||h.name||"hazard")}`),
    (scene.exits||[]).map(x=>`⌖ ${typeof x==="string"?x:(x.name||"exit")}`)
  ).map(t=>`<span class="cmb-tag">${escHtml(t)}</span>`).join("");
  const header=`<div class="cmb-head stage-head"><b>Round ${cm.round||1}</b> · ${cm.side==="pc"?"your side acts":"the foes act"}
    ${cm.first?` · <span title="won initiative">${cm.first==="pc"?"you":"the foes"} went first</span>`:""}
    ${tags?`<div class="cmb-scene">${tags}</div>`:""}</div>`;
  // TABLETOP-UNITS U2 / §9.11: the prose twin (BLIND-PLAYABLE, COMBAT-LIFECYCLE §6) used to render
  // HERE, inside the stage-overlay-foot — but that subtree is now aria-hidden (the whole stage column
  // is decoration once the digest carries the same words). An aria-hidden ancestor silently suppresses
  // a descendant's aria-live announcements, so stage-prose is extracted to `stageProseHtml()` (below)
  // and rendered by the CALLER (renderWorld's mainHtml) as the feed column's live sibling instead —
  // this function no longer stages it at all, to guarantee there is never a duplicate copy.
  const sh=cur&&cur.sheet;
  const flashed=(typeof cmbDamageFlashed==="function")?cmbDamageFlashed(cm):new Set();
  const overlay=cmbStageOverlay(w,cur,cm,flashed);
  const camControls=cmbStageControls();
  const ds=(sh&&sh.hpCur!=null&&sh.hpCur<=0&&typeof cmDeathSavePips==="function")?cmDeathSavePips(sh):"";
  const conc=(typeof cmConcentrationBadge==="function")?cmConcentrationBadge(sh):"";
  return `${header}
    <div class="theater-stage-wrap">
      <div id="theaterStage" class="theater-stage-canvas" aria-label="battle stage"></div>
      <div class="stage-overlay">
        ${camControls}
        ${overlay}
        <div class="stage-overlay-foot">${ds}${conc?`<div style="margin-top:4px">${conc}</div>`:""}</div>
      </div>
    </div>`;
}

/* TABLETOP-UNITS U2 / §9.11: the battle prose twin, extracted so it can render OUTSIDE the
   aria-hidden stage column — the feed column's live sibling (renderWorld's mainHtml calls this
   directly). role=status + aria-live=polite are byte-identical to the markup this replaced; only
   its PARENT in the DOM changed, never its content or its screen-reader contract. */
function stageProseHtml(cm){
  if(!cm||!cm.active) return "";
  return `<div class="cmb-prose stage-prose" role="status" aria-live="polite">${escHtml((typeof cmbProseSummary==="function")?cmbProseSummary(cm):"")}</div>`;
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
  // TABLETOP-UNITS U2 (docs/TABLETOP-UNITS.md §U2): the stage-collapse toggle — GS.stageCollapsed
  // is GS-only transient UI state (never persisted, never an event); "on" reads as "the stage is
  // showing" (mirrors the other rail tabs' .on = "this is active" convention), so it's on when NOT
  // collapsed. Shown whenever a soul is in play, same visibility rule as Character/Actions — the
  // stage is part of the standing session chrome, not a combat-only affordance (TABLETOP-VISION §1:
  // "collapsible to zero; game whole without it").
  const stageToggle=cur?`<button class="rl ${GS.stageCollapsed?'':'on'}" title="Stage" aria-pressed="${GS.stageCollapsed?'false':'true'}" onclick="toggleStage()"><img class="ic" src="assets/icons/sun.png" alt=""><span class="lb">Stage</span></button>`:"";
  return `<nav class="game-rail">
    ${rl("character","helm","Character",!!cur)}
    ${rl("actions","sword-shield","Actions",!!cur)}
    ${rl("map","compass","Map",isRevealed(w,'map'))}
    ${stageToggle}
    <div class="ss-spacer"></div>
    <div class="ss-menu-div"></div>
    <button class="rl ${GS.menuOpen?'on':''}" title="Menu" onclick="toggleMenu(event)"><img class="ic" src="assets/icons/key.png" alt=""><span class="lb">Menu</span></button>
  </nav>`;
}
/* TABLETOP-UNITS U2: flips the GS-only stage-collapse flag and re-renders — the ONLY writer of
   GS.stageCollapsed. Collapsing never retires/un-mounts the theater instance (that stays U1's
   combat_end-only teardown); it only changes which branch of renderWorld's mainHtml ternary paints,
   so re-expanding is instant (no re-mount). */
function toggleStage(){ GS.stageCollapsed=!GS.stageCollapsed; renderWorld(); }

/* ⚙ Menu — an overflow POPOVER anchored above the rail's ⚙ button (docs/IN-SESSION-UI.md §6), NOT a
   slide-in panel: the feed stays full-width behind it. GS.menuOpen is a simple bool; toggleMenu flips
   it, closeMenu() closes it (bound to an outside click). Reuses every handler verbatim — this is just
   a new container for buttons that already exist (Universe/session/destroy/world-transitions/dev tools). */
function toggleMenu(ev){ if(ev&&ev.stopPropagation)ev.stopPropagation(); GS.menuOpen=!GS.menuOpen; renderWorld(); if(GS.menuOpen) storageMeterFill(); }
/* FOREVER-STORAGE.md §1 storage meter: "a dial, not a countdown" — IDB quotas are GB-scale, so this is
   informational only, filled in async after the menu paints (storageEstimate wraps navigator.storage.
   estimate(), world.store) so actionsMenu itself stays synchronous like every other render() path. */
function storageMeterFill(){
  if(typeof storageEstimate!=="function") return;
  storageEstimate().then(r=>{
    const el=document.getElementById("storageMeter"); if(!el) return;
    el.textContent = r.ok ? `${(r.usage/1048576).toFixed(1)} MB used${r.pct!=null?` (${r.pct}%)`:""}` : "storage meter unavailable";
  });
}
function closeMenu(){ if(GS.menuOpen){ GS.menuOpen=false; renderWorld(); } }
/* ⚙ Menu popover (mockup S6 .mi idiom). Positioned in render via inline left/bottom so it clears the
   sidebar's bottom edge and shows every item (no clip). Adds the Powers entry (was orphaned). Every
   handler is reused verbatim — this is just a styled container for existing actions. */
/* ECONOMY-SINKS §A — "the sink is visible before it bites": the rest-button price label, mirroring
   passTime's own trigger exactly (inhabited node only; a wilderness/travel node shows no price). */
function lodgingLabel(w){
  if(typeof nodeInhabited!=="function" || !nodeInhabited(w,w.currentNodeId)) return "";
  const tier=(typeof nodeLodgingTier==="function")?nodeLodgingTier(w,w.currentNodeId):0;
  const att=(typeof nodeOwnerAttitude==="function")?nodeOwnerAttitude(w,w.currentNodeId):0;
  const price=(typeof lodgingPrice==="function")?lodgingPrice(tier,att):null;
  return (price!=null) ? ` · ${price} gp` : "";
}
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
    <button class="mi" onclick="closeMenu();passTime('dawn')"><span class="mi-ic">☾</span>Dawn${lodgingLabel(w)}</button>
    <button class="mi" onclick="closeMenu();passTime('montage')"><span class="mi-ic">⏩</span>+1 day${lodgingLabel(w)}</button>
    ${(w.prep&&w.prep.bundle)?`<button class="mi" onclick="closeMenu();copyPrepHandoff()" title="Copy the staged prep bundle + synthesis instructions for your DM"><span class="mi-ic">⎘</span>Prep handoff</button>`:""}
    <button class="mi" onclick="closeMenu();handToDM()"><span class="mi-ic">✦</span>Copy world (clipboard DM)</button>
    <div class="mi-sep"></div>
    <div class="mi-lbl">Backup (DURABILITY-TRIO §1)</div>
    <div class="mi-lbl" id="storageMeter" style="opacity:.65">storage meter…</div>
    <button class="mi" onclick="closeMenu();exportUniverseFile()" title="Download every world + your roster as one JSON file"><span class="mi-ic">⇩</span>Export universe</button>
    <button class="mi" onclick="closeMenu();exportWorldFile()" title="Download just this world as a JSON file"><span class="mi-ic">⇩</span>Export this world</button>
    <button class="mi" onclick="closeMenu();document.getElementById('importUniverseInput').click()" title="Import a Genesis export — a world already here is duplicated as a copy, never overwritten"><span class="mi-ic">⇧</span>Import…</button>
    <div class="mi-sep"></div>
    <button class="mi mi-danger" onclick="destroyWorld('${w.id}')"><span class="mi-ic">✖</span>Destroy world…</button>
    <div class="mi-sep"></div>
    <div class="mi-lbl">Dev tools</div>
    <button class="mi" onclick="closeMenu();showTab('oracle')"><span class="mi-ic">◇</span>Oracle</button>
    <button class="mi" onclick="closeMenu();applyEvent(activeWorld(),{type:'open_shop',payload:{tier:2,archetype:'general',name:'Test Market'}})" title="Exercise the shop panel without a live DM"><span class="mi-ic">❖</span>Open test shop</button>
    <button class="mi" onclick="closeMenu();seatToggleTransport()" title="docs/DM-SEAT.md — the API-direct DM transport (needs docs/SEAT-PROMPT.md + the bridge's /seat route)"><span class="mi-ic">${(w.dm&&w.dm.transport==="seat")?"◉":"◎"}</span>DM seat: ${(w.dm&&w.dm.transport==="seat")?"on":"off"} (mailbox fallback)</button>
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
    <div class="pn-body">${renderHexMap(w)}${renderSetOutButtons(w)}<div class="pcap">◆ you are here — what lies beyond is the DM's until you reach it</div></div>`;
  // Codex/Gazetteer stay reachable (functions kept, docs/IN-SESSION-UI.md §5d) but have no rail entry.
  if(panel==="codex"||panel==="gazetteer")return `${close}<h3>The Codex</h3><div class="pn-body">${knowledgePanel(w)}</div>`;
  if(panel==="powers")return `${close}<h3>Powers &amp; Pressures</h3><div class="pn-body">${renderPowers(w)}</div>`;
  if(panel==="shop")return shopPanel(w, cur, shopOf(w, GS.activeShopId));
  if(panel==="combat")return combatPanel(w, cur);
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
/* the first sentence of a feature's SRD text — collapsed teaser for an expand-on-tap card (§3).
   Splits on the first ". "/"! "/"? " that isn't a lone-letter abbreviation edge case; falls back to
   the whole string when no sentence break is found (short text, or text ending without punctuation). */
function firstSentence(text){
  const s=String(text||"").trim(); if(!s)return "";
  const m=s.match(/^.*?[.!?](?=\s|$)/); return m?m[0]:s;
}
/* a reference-register feature card (name + first-sentence teaser, <details> expands to the full SRD
   text on tap — native disclosure, no new GS state needed). Reuses .refc styling (mockup, inform-only). */
function abilityFeatureCard(name,text){
  const teaser=firstSentence(text);
  const rest=text&&text.length>teaser.length?text.slice(teaser.length).trim():"";
  return `<details class="refc" style="margin-bottom:6px"><summary style="cursor:pointer;list-style:none"><span class="rc-n">${escHtml(name)}</span>
    <div class="rc-d">${escHtml(teaser)}</div></summary>${rest?`<div class="rc-d" style="margin-top:5px">${escHtml(rest)}</div>`:""}</details>`;
}
function actionsAbilitiesBody(w,cur){
  const sh=cur&&cur.sheet; if(!sh)return `<div class="empty">No soul in play.</div>`;
  if(typeof ensureResources==="function")ensureResources(sh);
  const rows=[];
  // class pools (Rage, Channel Divinity, Ki, Bardic Inspiration, Superiority dice …) as dot-trackers
  for(const k in (sh.pools||{})){const p=sh.pools[k];if(!p||!p.max)continue;
    const lab=((typeof RESOURCE_POOLS!=="undefined"&&RESOURCE_POOLS[k])||{}).label||k;
    rows.push(slotTrackRow(lab,p.die?String(p.die):"",p.cur,p.max,false,Math.min(p.max,12)));}
  const poolsHtml=rows.length?`<div class="pn-h first">Class Resources</div>${rows.join("")}`
    :`<div class="pn-h first">Class Resources</div><div class="empty">${escHtml(cur.name)} has no tracked class resources.</div>`;
  // §3: class features known at the sheet's current level, from CLASS_PROGRESSION (name + SRD text,
  // collapsed to first sentence, expand-on-tap) + subclass features where the sheet has one (name only —
  // sh.subclassFeatures drops text at commit time, docs/ADVANCEMENT.md's level-up flow).
  const lvl=sh.level||1;
  const prog=(typeof CLASS_PROGRESSION!=="undefined")?CLASS_PROGRESSION[sh.class]:null;
  const featureCards=[];
  if(prog&&prog.levels){
    for(let l=1;l<=lvl;l++){ const rec=prog.levels[String(l)]; if(!rec)continue;
      (rec.features||[]).forEach(f=>featureCards.push(abilityFeatureCard(f.name,f.text))); }
  }
  (sh.subclassFeatures||[]).filter(f=>(f.level||0)<=lvl).forEach(f=>featureCards.push(abilityFeatureCard(f.name,"")));
  const featuresHtml=featureCards.length
    ?`<div class="pn-h">Class Features</div>${featureCards.join("")}`
    :`<div class="pn-h">Class Features</div><div class="empty">No class features on record yet.</div>`;
  // origin feat (from the sheet) as one more reference card.
  const featDef=(typeof ORIGIN_FEATS!=="undefined"&&sh.feat)?ORIGIN_FEATS[sh.feat]:null;
  const featHtml=sh.feat?`<div class="pn-h">Origin Feat</div>${abilityFeatureCard(sh.feat,featDef?featDef.blurb:"")}`:"";
  // casters: a one-line pointer to the Spells tab (no duplication).
  const spellLists0=sh&&spellListsOf(sh);
  const caster=!!(spellLists0&&(spellLists0.cantrips.length||spellLists0.spells.length));
  const spellPointer=caster?`<div class="pn-note"><span class="star">✦</span> Your spells live on the Spells tab.</div>`:"";
  return `${PN_INFORM_NOTE}<div class="pn-body">${poolsHtml}${featuresHtml}${featHtml}${spellPointer}</div>`;
}
function renderActionsPanel(w,cur){
  if(!cur)return `<div class="empty">No soul in play.</div>`;
  const sh=cur.sheet;
  const spellLists1=sh&&spellListsOf(sh);
  const caster=!!(spellLists1&&(spellLists1.cantrips.length||spellLists1.spells.length));
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
/* Condition / exhaustion / inspiration chips (mockup: squared, hue-coded). Absent when none.
   COMBAT-TRACKER §2: death-save pips (at 0 HP) + a concentration badge ride alongside, out-of-panel
   visibility for a fight the player may have tabbed away from. */
function ssBadges(sh){
  const chips=[];
  (sh.conditions||[]).forEach(e=>{ const n=(typeof condName==="function")?condName(e):e; if(n)chips.push(`<span class="ss-badge cond">${escHtml(n.charAt(0).toUpperCase()+n.slice(1))}</span>`); });
  const exl=(typeof exhaustionLevel==="function")?exhaustionLevel(sh):0;
  if(exl>0)chips.push(`<span class="ss-badge exh">Exhaustion ${exl}</span>`);
  if((typeof hasInspiration==="function")&&hasInspiration(sh))chips.push(`<span class="ss-badge insp">◆ Inspiration</span>`);
  const badges=chips.length?`<div class="ss-badges">${chips.join("")}</div>`:"";
  const ds=(sh.hpCur!=null&&sh.hpCur<=0)?cmDeathSavePips(sh):"";
  const conc=cmConcentrationBadge(sh);
  return `${badges}${ds}${conc?`<div style="margin:4px 0 8px">${conc}</div>`:""}`;
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
    return `<aside class="status-side" aria-label="Character and party">
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
  return `<aside class="status-side" aria-label="Character and party">
    <div class="ss-inner">
      ${id}
      ${ssHpBar(sh)}
      ${ac}
      ${ssSpellSlots(sh)}
      ${ssBadges(sh)}
      ${ssPartyStrip(w)}
      ${ssMeta(w)}
      ${ssDivider()}
      ${rail}
    </div>
    ${menu}
  </aside>`;
}

/* COMPANIONS §4 "Sidebar party strip" — one compact row per companion, under the PC block. The
   sidekick gets a mini HP bar (player-side numbers are open, same convention as the PC's own HP);
   hirelings get a coarse loyalty pip row only (low/steady/true — never the raw number, §4). Absent
   entirely when the party is solo (no new DOM when companionPartyStrip returns nothing). */
function ssPartyRow(row){
  if(row.kind==="sidekick"){
    const hp=(row.hp!=null&&row.maxHp)?`<span class="ss-party-hp">${row.hp}/${row.maxHp}</span>`:"";
    return `<div class="ss-party-row sidekick"><span class="ss-party-glyph">◆</span>
      <span class="ss-party-name">${escHtml(row.name)}</span>
      <span class="ss-party-sub">${escHtml(row.className||"")} Lvl ${row.level||1}</span>
      ${hp}</div>`;
  }
  const dots=["low","steady","true"].map(w=>`<span class="ss-party-pip ${w===row.loyaltyWord?'on '+w:''}"></span>`).join("");
  return `<div class="ss-party-row hireling"><span class="ss-party-glyph">✦</span>
    <span class="ss-party-name">${escHtml(row.name)}</span>
    <span class="ss-party-sub">${escHtml(row.role||"")}</span>
    <span class="ss-party-pips">${dots}</span></div>`;
}
function ssPartyStrip(w){
  if(typeof companionPartyStrip!=="function") return "";
  const rows=companionPartyStrip(w);
  if(!rows.length) return "";
  return `<div class="ss-party"><div class="ss-party-lbl">Party</div>${rows.map(ssPartyRow).join("")}</div>`;
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
  // REALM-STORY-WIRING §3: "creature" is additive (codexAdd already accepts any kind string) — the
  // player-facing panel groups minted breach-significant foes under their own heading, same pattern
  // as the other three kinds.
  const KINDS=[["npc","People","☗"],["location","Places","◈"],["faction","Powers","♜"],["item","Things","❖"],["creature","Creatures","☉"]];
  const chip=`background:none;border:1px solid var(--edge);border-radius:999px;color:var(--ink);font-size:13px;padding:2px 9px;margin:4px 4px 0 0;cursor:pointer`;
  // REALM-STORY-WIRING §3: `summary` is the player-safe field a minted "creature" record carries
  // (fields.summary — the DM-only prose lives in dm.desc instead); appended to the existing
  // fallback chain, additive, doesn't change any other kind's display.
  const fieldOf=r=>{const f=r.fields||{};const v=f.desc||f.role||f.agenda||f.object||f.trait||f.summary||"";return v?`<div class="gd">${escHtml(String(v))}</div>`:"";};
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
  const { cantrips, spells:leveled }=spellListsOf(sh);
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
  const sv=(typeof sellValueForInstance==="function")?sellValueForInstance(inst, shop, att):{gp:null,capped:false};
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
    <div class="shop-name"><img class="shop-ic" src="assets/icons/storefront-awning.png" alt=""> ${escHtml(shop.name||"Shop")}</div>
    <div class="shop-sub">${escHtml(archLabel||"")}${loc?` · ${loc}`:""}</div>
    <div class="shop-gold"><img class="shop-purse" src="assets/icons/coin-purse.png" alt=""> Your gold: <b>${sh.gold||0}</b> gp</div>
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

/* ── The Combat panel (docs/COMBAT-TRACKER.md) — read-only surface over GS.combat (v1, no new
   module per BATCH-GUARDRAILS G7). Four band lanes in the engine's CANONICAL CM_BANDS order
   (melee-first) — reconciles the spec's "Melee · Near · Far · Distant" against the real constant,
   which names the outermost band "out" (docs/COMBAT-TRACKER.md §1 executor note: follow the code).
   NEVER put foe.hp/foe.maxHp/foe.ac in a rendered string — cmFoeStateWord derives only the WORD,
   the DOM never sees the number (verify greps the rendered HTML for this). ───────────────────── */
const CMB_BAND_LABEL={melee:"Melee",near:"Near",far:"Far",out:"Distant"};

/* cmTheaterNotify(kind,data) — BATTLE-THEATER T3 (docs/BATTLE-THEATER.md §4): "the cleanest seam is a
   small dispatcher theaterFxFromLedger(entry) called from the attack/foe_action/move_zone/foe_morale/
   crit_outcome/combat_end ledger sites via one null-safe hook function cmTheaterNotify(kind,data)
   defined in render.js." THE single call every ledger site in src/world/dm.js makes (≤8 sites) —
   never throws, never assumes window.Theater exists (headless/jsdom always no-ops here: window.Theater
   is only ever set by src/ui/theater-boot.js's ES-module boundary, which jsdom never loads). Wraps the
   {kind,...data} pair in the SAME shape theaterFxFromLedger (src/ui/theater-verbs.js, re-exported as
   window.Theater.fxFromLedger since this classic script can't `import` a sealed ES-module scope, §2)
   already expects an addLedger entry to carry ({data:{kind,...}}), so there's exactly one place — that
   pure function — that knows how to turn ledger semantics into a verb; this is only the bridge that
   calls it and forwards the result into window.Theater.play, with its own independent try/catch so a
   verb-mapping bug can never take down the caller's own ledger write (dm.js's addLedger already
   succeeded before this runs at every call site — animation is strictly best-effort on top of already-
   committed state). */
function cmTheaterNotify(kind, data){
  if(typeof window==="undefined" || !window.Theater || typeof window.Theater.play!=="function") return;
  try{
    const mapped=(typeof window.Theater.fxFromLedger==="function")
      ? window.Theater.fxFromLedger({data:Object.assign({kind},data||{})})
      : null;
    if(mapped && mapped.verb) window.Theater.play(mapped.verb, mapped.opts||{});
  }catch(e){ /* animation is best-effort — never let a theater/verb bug break the ledger write it followed */ }
}

/* DEAD-STATE (2026-07-03, Adam's ruling): "obliterated" is a DISTINCT state word from "down" — the
   prose twin (every ledger line/combat-tracker badge that reads this word) must say "is obliterated"
   for the vaporization exception, never the plain "is down" a default corpse gets. Checked BEFORE the
   down branch since an obliterated foe is also down by construction (HP<=0) but must never report the
   weaker word. */
function cmFoeStateWord(f){
  if(f.obliterated) return "obliterated";
  if(f.down || (f.hp!=null && f.hp<=0)) return "down";
  if(f.hp!=null && f.maxHp && f.hp<=f.maxHp/2) return "bloodied";
  return "fresh";
}
function cmConditionBadges(holder){
  const round=(GS.combat&&GS.combat.round)||1;
  const all=(holder.conditions||[]).map(e=>{ const n=(typeof condName==="function")?condName(e):e; if(!n)return"";
    const ttl=(typeof e==="object"&&e.ttl)||null;
    const appliedRound=(typeof e==="object"&&e.appliedRound)||0;
    // COMBAT-TRACKER §2/§5.3: dots = ROUNDS LEFT, not the fixed original duration — mirror
    // tickConditions' own remaining-rounds math (src/engine/conditions.js) so the badge never
    // outlives (or outcounts) what the engine will actually expire it at.
    const remaining=(ttl&&typeof ttl.rounds==="number")?Math.max(0,ttl.rounds-(round-appliedRound)):null;
    const dots=(remaining!=null)?(" "+"·".repeat(remaining)):"";
    return `<span class="cmb-badge">${escHtml(n.charAt(0).toUpperCase()+n.slice(1))}${escHtml(dots)}</span>`; }).filter(Boolean);
  // BATTLE-VISUALS A3 — cap visible badges at 3 + "+n" overflow so a heavily-conditioned combatant's
  // chip doesn't balloon; the overflow count is purely a DOM/visual cap, never a data loss (the full
  // condition list still lives on holder.conditions for the sheet/other surfaces to read).
  if(all.length>3){ const shown=all.slice(0,3).join(""); const extra=all.length-3;
    return shown+`<span class="cmb-badge cmb-badge-more">+${extra}</span>`; }
  return all.join("");
}
/* INITIATIVE-UI §3 — the thin chip-hp bar shared by every combatant chip (PC, ally rows carrying hp
   data, every foe): a bare <span class="chip-hp"><i style="width:{q}%"></i></span> under the name line,
   NO numerals (the no-foe-HP-numbers rule extends here to keep one shared code path for all three chip
   kinds rather than a foe-only special case). q = round(hp/hpMax*20)*5, quantized to 5% steps so it
   reads as grit, not lab equipment; clamped 0-100. A downed foe (down flag) shows 0 regardless of any
   residual hp field weirdness. Returns "" when hp/hpMax data is missing (ally hirelings — never fake a
   bar, per the spec's "otherwise the bar is omitted"). */
function cmChipHpBar(hp,hpMax,down){
  if(hp==null||!hpMax) return "";
  const pct=down?0:Math.max(0,Math.min(100,Math.round((hp/hpMax)*20)*5));
  return `<span class="chip-hp"><i style="width:${pct}%"></i></span>`;
}
function cmPcChip(cur,sh,flashed){
  const badges=cmConditionBadges(cur);
  const active=!!(GS.combat&&GS.combat.side==="pc");
  // A3 damage flash: renderWorld() replaces the WHOLE subtree every render (host.innerHTML=...), so a
  // CSS animation keyed on a static attribute selector would restart on every render regardless of
  // whether the state actually changed — cmbDamageFlashed diffs GS.cmbLastStates BEFORE the chips are
  // built, and only a truly-changed combatant gets the one-shot .cmb-flash class this pass.
  const flash=flashed&&flashed.has("pc");
  const hpCur=(sh&&sh.hpCur==null?sh&&sh.hp:sh&&sh.hpCur);
  return `<div class="cmb-chip pc cmb-ring-pc${active?' cmb-active':''}${flash?' cmb-flash':''}"><div class="cmb-chip-name">${escHtml(cur.name)}</div>
    ${ssHpBar(sh)}
    ${cmChipHpBar(hpCur,sh&&sh.hp,hpCur!=null&&hpCur<=0)}
    ${badges?`<div class="cmb-badges">${badges}</div>`:""}</div>`;
}
function cmFoeChip(f,flashed){
  const word=cmFoeStateWord(f);
  const badges=cmConditionBadges(f);
  const active=!!(GS.combat&&GS.combat.side!=="pc");
  const flash=flashed&&flashed.has(f.fid||f.name);
  return `<div class="cmb-chip cmb-ring-hostile${word==='down'?' down':''}${active?' cmb-active':''}${flash?' cmb-flash':''}" data-fid="${escHtml(f.fid||"")}" data-state="${word}"><div class="cmb-chip-name">${escHtml(f.name||"?")}${f.cr!=null?`<span class="cmb-chip-cr">CR ${escHtml(String(f.cr))}</span>`:""}</div>
    <div class="cmb-chip-state ${word}">${word}</div>
    ${cmChipHpBar(f.hp,f.maxHp,!!f.down)}
    ${badges?`<div class="cmb-badges">${badges}</div>`:""}</div>`;
}
/* COMPANIONS §4 "ally chips render in their band lanes next to the PC" — the sidekick shows an exact
   HP bar (player-side numbers are open, the no-foe-HP rule only guards FOE numbers); a hireling shows
   the state-word only (never the loyalty number) — companionPartyStrip already coarsens it (§4). No
   per-band ally position is tracked yet (out of this unit's combat-engine wiring scope), so allies
   render in the PC's own band lane — "next to the PC" literally. */
function cmAllyChip(row){
  if(row.kind==="sidekick"){
    const hpBar=(row.hp!=null&&row.maxHp)?ssHpBar({hp:row.maxHp,hpCur:row.hp}):"";
    // INITIATIVE-UI §3: hp bar only when the row actually carries hp data (sidekicks with a resolved
    // statBase) — a hireling row never carries hp/maxHp at all (companionPartyStrip's own shape,
    // src/world/companions.js:369), so cmChipHpBar's own null-guard omits it there, never fakes it.
    return `<div class="cmb-chip ally sidekick"><div class="cmb-chip-name">${escHtml(row.name)}</div>${hpBar}
    ${cmChipHpBar(row.hp,row.maxHp,row.hp!=null&&row.hp<=0)}</div>`;
  }
  return `<div class="cmb-chip ally hireling"><div class="cmb-chip-name">${escHtml(row.name)}</div>
    <div class="cmb-chip-state">${escHtml(row.loyaltyWord)}</div></div>`;
}
/* death-save pip row (§1/§2) — display only; the player's open d20 rolls via the existing prompt. */
function cmDeathSavePips(sh){
  if(!sh || !sh.deathSaves) return "";
  const ds=sh.deathSaves;
  let succ="",fail="";
  for(let i=0;i<3;i++) succ+=`<span class="cmb-ds-pip succ ${i<ds.succ?'on':''}"></span>`;
  for(let i=0;i<3;i++) fail+=`<span class="cmb-ds-pip fail ${i<ds.fail?'on':''}"></span>`;
  return `<div class="cmb-ds"><span class="cmb-ds-lbl">Death Saves</span><span>${succ}</span><span>${fail}</span></div>`;
}
/* concentration badge (§2) — reads sh.concentration ({spell,castRound}|null, engine.concentration). */
function cmConcentrationBadge(sh){
  if(!sh || !sh.concentration || !sh.concentration.spell) return "";
  return `<span class="cmb-conc">◉ concentrating: ${escHtml(sh.concentration.spell)}</span>`;
}
/* ── BATTLEMAP.md §3 — the 4×3 zone grid (evolves the tracker panel, same panel, one more axis).
   BATTLE-VISUALS A1 (2026-07-03): this grid is now the ONLY combatant view — the band-lane strip that
   used to sit alongside it (.cmb-lane/.cmb-lane-lbl) is removed; cmbZoneOccupants below folds those
   chips straight into the grid's own cells. Zone tap inserts the movement phrase into #dmAction and
   NEVER sends (BATTLEMAP.md §0 "Input" fork — the tap-sugar exists so the words are easy; the player's
   own words are still what rides). ──────────────────────────────────────────────────────────────── */
function cmbZoneInsert(bandLbl,lane){
  const laneWord={L:"left",C:"center",R:"right"}[lane]||lane;
  const phrase=`I move to ${String(bandLbl||"").toLowerCase()}-${laneWord}`;
  const ta=document.getElementById("dmAction");
  if(ta){ ta.value=phrase; ta.focus(); }
}
/* BATTLE-VISUALS A8 — band clamp. A foe's engine-tracked band can sit OUTSIDE the room's derived
   zone grid (e.g. a "far" band foe when the room only derives melee+near) — the engine never re-homes
   a combatant just because the DM's segment shrank the grid after placement, so without this the foe
   simply vanishes from every zone cell while cmbProseSummary (which reads f.band directly, no grid
   awareness) keeps narrating it. This is RENDER-SIDE ONLY: it never writes f.band — it only decides
   which grid ROW a foe's chip paints into, clamping to the nearest band the room actually has. */
function cmbClampBand(band,gridBands){
  const order=(typeof CM_BANDS!=="undefined"?CM_BANDS:["melee","near","far","out"]);
  if(!gridBands||!gridBands.length) return band;
  if(gridBands.indexOf(band)>=0) return band;
  const bi=order.indexOf(band);
  if(bi<0) return gridBands[gridBands.length-1];
  // walk outward from the foe's true band to the nearest row the room actually has, preferring the
  // closer of the two directions — ties (equally near on both sides) fall to the FARTHER row (a foe
  // that's off the far edge belongs in the room's last row, not its first).
  let best=gridBands[0], bestDist=Infinity;
  gridBands.forEach(gb=>{ const d=Math.abs(order.indexOf(gb)-bi); if(d<bestDist || (d===bestDist && order.indexOf(gb)>order.indexOf(best))){ best=gb; bestDist=d; } });
  return best;
}
function cmbZoneOccupants(cm,band,lane,cur,sh,allyRows,gridBands,flashed){
  const chips=[];
  const pc=cm.pc||{};
  const pcBand=cmbClampBand(pc.band||"melee",gridBands);
  if(pcBand===band && (pc.lane||"C")===lane && sh){
    chips.push(cmPcChip(cur,sh,flashed));
    (allyRows||[]).forEach(r=>chips.push(cmAllyChip(r)));
  }
  (cm.foes||[]).forEach(f=>{ const fb=cmbClampBand(f.band||"melee",gridBands); if(fb===band && (f.lane||"C")===lane) chips.push(cmFoeChip(f,flashed)); });
  return chips;
}
function cmbZoneGridHtml(w,cur,cm,flashed){
  const grid=cm.grid||{bands:(typeof CM_BANDS!=="undefined"?CM_BANDS:["melee","near","far","out"]),lanes:(typeof CM_LANES!=="undefined"?CM_LANES:["L","C","R"])};
  const bands=grid.bands||[]; const lanesAll=(typeof CM_LANES!=="undefined"?CM_LANES:["L","C","R"]);
  const sh=cur&&cur.sheet;
  const allyRows=(typeof companionPartyStrip==="function")?companionPartyStrip(w):[];
  const scene=cm.scene||{};
  const hazardZones=(scene.hazardZones||[]).filter(hz=>typeof cmHazardVisible!=="function"||cmHazardVisible(hz));
  // BATTLE-VISUALS A1 — the arena backdrop rides on the grid container (CSS background-image, zero
  // new assets: assets/battle/arena.png, banked ASSET-PROMPTS Batch 4 §8).
  const rows=bands.map(b=>{
    const cells=lanesAll.map(lane=>{
      const inRoom=(grid.lanes||lanesAll).indexOf(lane)>=0;
      if(!inRoom) return `<div class="cmb-zone cmb-zone-void"></div>`;
      const occ=cmbZoneOccupants(cm,b,lane,cur,sh,allyRows,bands,flashed);
      const elev=(typeof cmZoneElev==="function")&&cmZoneElev(cm,b,lane);
      const hz=hazardZones.find(h=>h.zone===(b+":"+lane));
      const bandLbl=CMB_BAND_LABEL[b]||b;
      // A1: an empty cell collapses to a slim outline (no more beige-card farm) — cmb-zone-empty is a
      // pure CSS hook (thinner min-height, dimmer border), the cell stays clickable (tap-sugar intact).
      return `<div class="cmb-zone${elev?" elev":""}${occ.length?"":" cmb-zone-empty"}" onclick="cmbZoneInsert('${escHtml(bandLbl)}','${lane}')" title="${escHtml(bandLbl)}-${lane}">
        <span class="cmb-zone-lbl">${lane}</span>
        ${elev?'<span class="cmb-zone-elev" title="elevated">▲</span>':""}
        ${hz?`<span class="cmb-zone-hazard" title="${escHtml(hz.kind||"hazard")}">☠</span>`:""}
        <div class="cmb-zone-chips">${occ.join("")}</div>
      </div>`;
    }).join("");
    return `<div class="cmb-zone-row" data-band="${b}"><div class="cmb-zone-row-lbl">${CMB_BAND_LABEL[b]||b}</div><div class="cmb-zone-cells">${cells}</div></div>`;
  }).join("");
  return `<div class="cmb-grid cmb-grid-arena">${rows}</div>`;
}

/* ── BLOCKWRIGHT.md §4 build item 2 — "BATTLEMAP's panel renders through it (the CSS-grid v1
   UPGRADES to this — same zone model, same tap-sugar, same invariants: no foe HP/AC anywhere in
   the DOM)." Additive: cmbZoneGridHtml above is UNCHANGED byte-for-byte (verify-combat-tracker's
   + verify-battlemap's assertions still hold) — this is a SECOND render of the same GS.combat,
   a procedural diorama sitting above the existing grid. NULL-SAFE: any missing engine hook (no
   region, no CM_BANDS, no foes) degrades to the default palette / empty diorama, never a crash. */
function cmbDioramaFigures(cm,band,lane,cur,sh,allyRows,palette){
  const parts=[];
  const pc=cm.pc||{};
  if((pc.band||"melee")===band && (pc.lane||"C")===lane && sh){
    // PCs are rendered at the standard Medium scale (sh.size isn't a reliably-present sheet field
    // across species yet — Medium is the correct default for the overwhelming majority of PCs).
    parts.push(bwFigure({size:"Medium",silhouette:"biped",palette:"#8a6a24",label:"pc:"+(cur&&cur.id||"pc"),extra:true,extraColor:"#c9a24b"}));
    (allyRows||[]).forEach((r,i)=>parts.push(bwFigure({size:"Medium",silhouette:"biped",palette:"#5a6a78",label:"ally:"+(r&&(r.id||r.name)||i)})));
  }
  (cm.foes||[]).forEach(f=>{
    if((f.band||"melee")!==band || (f.lane||"C")!==lane) return;
    const sil=(typeof bwSilhouetteFor==="function")?bwSilhouetteFor(f.creatureType):"biped";
    const color=(typeof bwColorFor==="function")?bwColorFor(f.creatureType):"#556070";
    parts.push(bwFigure({size:"Medium",silhouette:sil,palette:color,label:"foe:"+(f.id||f.name||"foe")}));
  });
  return parts;
}
function cmbDioramaHtml(w,cur,cm){
  if(typeof bwStage!=="function" || typeof bwBox!=="function") return ""; // BLOCKWRIGHT module absent — degrade silently
  const grid=cm.grid||{bands:(typeof CM_BANDS!=="undefined"?CM_BANDS:["melee","near","far","out"]),lanes:(typeof CM_LANES!=="undefined"?CM_LANES:["L","C","R"])};
  const bands=grid.bands||[]; const lanesAll=(typeof CM_LANES!=="undefined"?CM_LANES:["L","C","R"]);
  const sh=cur&&cur.sheet;
  const allyRows=(typeof companionPartyStrip==="function")?companionPartyStrip(w):[];
  const region=(typeof regionPeekNode==="function")?regionPeekNode(w,w&&w.currentNodeId):null;
  let palette=(typeof bwRegionPalette==="function")?bwRegionPalette(region):{ground:"#3a4048",wall:"#4a5058",accent:"#a86a3a",prop:"#4a6650"};
  // dungeon lighting rows darken the palette (BLOCKWRIGHT.md §3) — a lit torch/dais zone stays base tone.
  const dark=(w&&w.currentNodeId&&typeof nodeName==="function"&&/dungeon|crypt|cave|tomb|catacomb/i.test(String(nodeName(w,w.currentNodeId)||"")));
  if(dark && typeof bwDarkenPalette==="function") palette=bwDarkenPalette(palette,0.7);
  const children=[];
  bands.forEach((b,bi)=>{
    (grid.lanes||lanesAll).forEach((lane,li)=>{
      const elev=(typeof cmZoneElev==="function")&&cmZoneElev(cm,b,lane);
      children.push(bwZoneTile({x:li-1,y:bi,z:0,w:0.92,d:0.92,color:palette.ground,elev}));
      cmbDioramaFigures(cm,b,lane,cur,sh,allyRows,palette).forEach(fig=>{
        children.push(bwGroup([fig],{x:li-1,y:bi,z:elev?-0.5:0}));
      });
    });
  });
  const stage=bwStage(null,{gridW:lanesAll.length,gridD:bands.length});
  const mounted=stage.mount(children);
  // §1 hard performance budget (verify-blockwright.mjs mutation-checks this) — degrade to nothing
  // rather than exceed it (never silently render an over-budget scene).
  if(typeof bwWithinBudget==="function" && !bwWithinBudget(mounted.faceCount)) return "";
  return `<div class="bw-diorama-wrap">${mounted.html}</div>`;
}

/* COMBAT-LIFECYCLE.md §6 — the BLIND-PLAYABLE prose twin. One plain-language positional paragraph:
   round + whose side acts + each LIVE foe's band/lane/state (never a number) + the PC's own bloodied/
   concentrating state (PC numbers are open elsewhere in the panel — this paragraph stays qualitative,
   matching the feed's voice). Rendered as the FIRST block of the combat panel body, inside a
   role="status" aria-live="polite" container so a screen reader announces it every re-render — this
   paragraph is sighted players' normal visible text too, not a hidden a11y-only string. */
function cmbProseSummary(cm){
  if(!cm||!cm.active) return "";
  // INITIATIVE-UI §4: the spent clause — when the first-acting side's turn already passed this round
  // (cm.side!==cm.first), the round phrase leads with "your turn is spent" / "the foes' turn is spent"
  // BEFORE naming who acts now, matching the spec's example verbatim ("Round 3 — your turn is spent;
  // the foes act."). Derived only from {round,side,first} — no new state.
  const spent=!!(cm.first && cm.side!==cm.first);
  const sideWord=cm.side==="pc"?"you act":"the foes act";
  const spentClause=spent?(cm.first==="pc"?"your turn is spent; ":"the foes' turn is spent; "):"";
  const live=(cm.foes||[]).filter(f=>!f.down);
  const bandWord={melee:"in Melee",near:"Near",far:"Far",out:"far Out"};
  const foeParts=live.map(f=>{
    const word=(typeof cmFoeStateWord==="function")?cmFoeStateWord(f):"fresh";
    return `${f.name} ${bandWord[f.band]||f.band}, ${word}`;
  });
  const downCount=(cm.foes||[]).length-live.length;
  const foeSentence=foeParts.length
    ? foeParts.join("; ")+"."
    : (downCount?"every foe is down.":"no foes remain.");
  return `Round ${cm.round||1} — ${spentClause}${sideWord}. ${foeSentence}`;
}

/* BATTLE-VISUALS A3 — damage-flash detection. GS.cmbLastStates (transient, GS-owned per the state
   rule) holds the PREVIOUS render's {fid: stateWord} map; a combatant whose state word changed since
   then gets a one-shot CSS flash class this render. Read-then-overwrite happens once per combatPanel
   call, so a flash fires for exactly one render pass (the animation itself is the visual persistence). */
function cmbDamageFlashed(cm){
  const prev=GS.cmbLastStates||{};
  const now={};
  const flashed=new Set();
  (cm.foes||[]).forEach(f=>{ const id=f.fid||f.name; const word=cmFoeStateWord(f); now[id]=word;
    if(prev[id]!=null && prev[id]!==word) flashed.add(id); });
  const pcWord=(cm.pc&&cm.pc.hpCur!=null&&cm.pc.hp)?(cm.pc.hpCur<=0?"down":(cm.pc.hpCur<=cm.pc.hp/2?"bloodied":"fresh")):null;
  if(pcWord!=null){ now.pc=pcWord; if(prev.pc!=null && prev.pc!==pcWord) flashed.add("pc"); }
  GS.cmbLastStates=now;
  return flashed;
}
/* A1 diorama toggle — collapsed by default (GS.cmbDioramaOpen undefined/false = closed), flips on
   click, no other state touched. */
function toggleCmbDiorama(){ GS.cmbDioramaOpen=!GS.cmbDioramaOpen; renderWorld(); }
function combatPanel(w,cur){
  const close=`<button class="panel-close" title="Close" onclick="openPanel(null)">×</button>`;
  const cm=GS.combat;
  if(!cm||!cm.active)return `${close}<div class="empty">No fight in progress.</div>`;
  const sh=cur&&cur.sheet;
  const scene=cm.scene||{};
  const tags=[].concat(
    Object.keys(scene.cover||{}).map(k=>`⛊ ${k}`),
    (scene.hazards||[]).map(h=>`☠ ${typeof h==="string"?h:(h.kind||h.name||"hazard")}`),
    (scene.exits||[]).map(x=>`⌖ ${typeof x==="string"?x:(x.name||"exit")}`),
    ((scene.mods)||[]).map(m=>`⌇ ${m.op} ${m.zone}`)
  ).map(t=>`<span class="cmb-tag">${escHtml(t)}</span>`).join("");
  // INITIATIVE-UI §1/§2: the classic panel gets the SAME turn banner (cmbTurnBanner) the stage-overlay
  // uses, rendered as text right in the header — alongside the pre-existing "went first" line (kept
  // verbatim; the banner is additive, not a replacement).
  const header=`<div class="cmb-head">${cmbTurnBanner(cm)}<b>Round ${cm.round||1}</b> · ${cm.side==="pc"?"your side acts":"the foes act"}
    ${cm.first?` · <span title="won initiative">${cm.first==="pc"?"you":"the foes"} went first</span>`:""}
    ${tags?`<div class="cmb-scene">${tags}</div>`:""}</div>`;
  const prose=`<div class="cmb-prose" role="status" aria-live="polite">${escHtml(cmbProseSummary(cm))}</div>`;
  // A3: compute the flash set BEFORE painting the grid (renderWorld() replaces the whole subtree every
  // render, so the flash decision has to be made here in JS and threaded into the chip builders —
  // a CSS-only attribute-selector animation would restart unconditionally on every render instead).
  const flashed=cmbDamageFlashed(cm);
  // BATTLE-VISUALS A1 — "one board, not three": the redundant band-lane chip strip is gone (its chips
  // now live INSIDE the zone grid's cells, via cmbZoneOccupants); the grid is the ONLY combatant view.
  const grid=cmbZoneGridHtml(w,cur,cm,flashed);
  // A1: the blockwright diorama moves behind a collapsed-by-default toggle until Phase B (BATTLE-THEATER)
  // replaces the slot — cmbDioramaHtml keeps rendering unconditionally (verify-blockwright's DOM-presence
  // checks query .bw-diorama-wrap regardless of the <details> open/closed state), just no longer open by
  // default eating panel space.
  const dioramaBody=(typeof cmbDioramaHtml==="function")?cmbDioramaHtml(w,cur,cm):"";
  const dioramaOpen=!!GS.cmbDioramaOpen;   // COLLAPSED BY DEFAULT (A1) — opposite convention from sheetCollapse's open-unless-flagged
  const diorama=dioramaBody?`<details class="pn-collapse cmb-diorama-toggle"${dioramaOpen?" open":""}><summary onclick="event.preventDefault();toggleCmbDiorama()">⌗ diorama<span class="chev">▾</span></summary><div class="pn-collapse-body">${dioramaBody}</div></details>`:"";
  const ds=(sh&&sh.hpCur!=null&&sh.hpCur<=0)?cmDeathSavePips(sh):"";
  const conc=cmConcentrationBadge(sh);
  return `${close}${header}<div class="pn-body">${prose}${grid}${diorama}${ds}${conc?`<div style="margin-top:6px">${conc}</div>`:""}</div>`;
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
  // REPUTATION.md §3 player surface: CLAIMED/witnessed epithets + a coarse standing word per
  // *revealed* faction — never the raw score. repuEpithetsOf/repuStandingWord are pure reads;
  // guarded so a headless render (no world.reputation loaded) degrades to nothing rendered.
  const epithets=(typeof repuEpithetsOf==="function")?repuEpithetsOf(w):[];
  const epithetsHtml=epithets.length
    ?`<div class="pn-h">Known As</div><div class="cp-foot">${epithets.map(ep=>`“${escHtml(ep.text)}”`).join(" · ")}</div>`:"";
  const knownFacs=(w.factions||[]).filter(f=>f.known);
  const standingRows=(typeof repuStandingWord==="function")?knownFacs.map(f=>{
    const key=(typeof slug==="function")?slug(f.name):f.name;
    const word=repuStandingWord(w,key);
    return word?`<div class="krow"><span>${escHtml(f.name)}</span><b>${escHtml(word.charAt(0).toUpperCase()+word.slice(1))}</b></div>`:"";
  }).filter(Boolean).join(""):"";
  const standingHtml=standingRows?`<div class="pn-h">Standing</div>${standingRows}`:"";
  // TIYL-DEEPENING §3.1: marks rolled in "This Is Your Life" (scars/gray hair/coughs) — permanent,
  // DM-narratable, small (rarely more than a couple per soul) so a plain foot-line is enough.
  // HQ3-D1: sh.marks[] is UNIFIED on the object shape {id,text,kind,sinceDay,mechanical?}; a
  // legacy save may still hold bare strings — read tolerantly through markText() (no throw either way).
  const markText=m=>(m&&typeof m==="object")?(m.text||""):String(m||"");
  const marksHtml=(sh.marks&&sh.marks.length)?`<div class="pn-h">Marks</div><div class="cp-foot">${sh.marks.map(m=>escHtml(markText(m))).join(" · ")}</div>`:"";
  return `<div class="pn-body">
    <div class="pn-h first">Ability Scores</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px">${scores}</div>
    <div class="pn-h">Combat</div>
    ${combat}
    ${xpBlock}
    ${sheetCollapse("saves","Saving Throws",saves)}
    ${sheetCollapse("skills","Skills · all "+(typeof ALL_SKILLS!=="undefined"?ALL_SKILLS.length:0),skills)}
    ${stateChips.length?`<div class="pn-h">State</div><div style="display:flex;flex-wrap:wrap;gap:5px">${stateChips.join("")}</div>`:""}
    ${epithetsHtml}
    ${standingHtml}
    ${marksHtml}
    ${featsFoot?`<div class="cp-foot">${featsFoot}</div>`:""}
    ${sidekickMiniSheet(w)}
  </div>`;
}

/* COMPANIONS §4 "Sheet tab: the sidekick gets a mini-sheet subpanel" — stats/class features off
   data/sidekick-classes.js + equipment via the existing ITEMS instances (sh.inventory on the sidekick's
   own tracked stat block, when one exists). Absent entirely when there's no sidekick (no new DOM). */
function sidekickMiniSheet(w){
  if(typeof companionsOf!=="function") return "";
  const C=companionsOf(w);
  if(!C.sidekickId || !C.sidekick) return "";
  const rec=(typeof codexGet==="function")?codexGet(w,C.sidekickId):null;
  const name=rec?rec.name:"Your sidekick";
  const row=(typeof sidekickClassRow==="function")?sidekickClassRow(C.sidekick):null;
  const sb=C.sidekick.statBase||{};
  const hpLine=(sb.hp!=null&&sb.maxHp)?`<div class="krow"><span>Hit Points</span><b>${sb.hp} / ${sb.maxHp}</b></div>`:"";
  const acLine=(sb.ac!=null)?`<div class="krow"><span>Armor Class</span><b>${sb.ac}</b></div>`:"";
  const pbLine=row?`<div class="krow"><span>Proficiency Bonus</span><b>+${row.pb}</b></div>`:"";
  const features=(row&&row.features&&row.features.length)
    ?row.features.map(f=>`<div class="gaz-item"><div class="gi-top"><span class="gn">${escHtml(f.name)}</span></div><div class="gd">${escHtml(f.text)}</div></div>`).join("")
    :"";
  const equip=(sb.inventory||[]).map(it=>`<span class="ss-badge">${escHtml(it.name||it)}</span>`).join("");
  return `<div class="pn-h">Sidekick — ${escHtml(name)} (${escHtml(C.sidekick.className)}, Lvl ${C.sidekick.level||1})</div>
    ${hpLine}${acLine}${pbLine}
    ${equip?`<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px">${equip}</div>`:""}
    ${features?sheetCollapse("sidekick-features","Features",features):""}`;
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
      ${corpses.map(d=>`<span class="iact" onclick="recoverFallen('${d.id}')">⚰ Recover ${escHtml(d.name)}'s effects</span>`).join("")}
      ${(typeof crownEligible==="function" && crownEligible(w).eligible)?`<span class="iact" onclick="openCrowning()" title="This world's Doom is broken and you stand at the ceiling — it can be crowned.">⟡ The world can be crowned</span>`:""}
      ${(w.crowned)?`<span class="iact" style="opacity:.7" title="Crowned — passed into legend.">⟡ Crowned — Day ${w.crowned.day}</span>`:""}
      ${(w.sundered)?`<span class="iact" style="opacity:.7" title="The Doom came due — this world is sundered.">✧✦ Sundered — Day ${w.sundered.day}</span>`:""}</div>
    ${w.bastion?`<div class="pn-h">⌂ ${escHtml(w.bastion.name)}</div>
      <div class="pn-body" style="font-size:15px">Founded Day ${w.bastion.foundedDay} by ${escHtml(w.bastion.foundedBy.name)}${w.bastion.note?` — ${escHtml(w.bastion.note)}`:""}.
      ${(w.bastion.vault&&w.bastion.vault.length)?`Vault: ${w.bastion.vault.map(id=>{const r=(typeof codexGet==="function")?codexGet(w,id):null;return escHtml(r?r.name:id);}).join(", ")}.`:"The vault stands empty."}
      ${(w.currentNodeId===w.bastion.nodeId)?`<div style="margin-top:6px"><span class="iact" onclick="bastionDepositPrompt()">⌂ Lay an item in the vault</span></div>`:`<div style="margin-top:6px;color:var(--ink-dim)">Travel to ${escHtml(w.bastion.name)} to use its vault.</div>`}</div>`:""}
    <div class="pn-h">Chronicle ${toggle}</div>
    <div class="ledger-list">${renderLedger(w,vis)}</div>
    ${renderArchiveVault(w)}
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

/* Chronicle › the archived-narration vault (FOREVER-STORAGE §2: dmlog prose past the last HOT_SESSIONS
   moves to the IDB archive store — still local, still exported, and viewable HERE on demand). A native
   <details> (keyboard-accessible, same idiom as .cp-history above) that stays CLOSED by default — the
   archive read is on-demand only, never on the render hot path. Opening fetches archiveReadForWorld(w.id)
   once into GS.archive and paints the prose oldest-first (the same order the feed kept it in before it
   cooled). Player lines render plain; DM lines get the same mdBold pass as the live feed. */
function renderArchiveVault(w){
  const a=GS.archive||(GS.archive={open:false,worldId:null,entries:null,loading:false});
  const open=!!(a.open&&a.worldId===w.id);
  let body="";
  if(open){
    if(a.loading)body=`<div class="empty">Reaching into the vault…</div>`;
    else if(!a.entries||!a.entries.length)body=`<div class="empty">Nothing rests in the vault yet — narration older than the last ${typeof HOT_SESSIONS!=="undefined"?HOT_SESSIONS:3} sessions is archived here as it cools.</div>`;
    else body=`<div class="ledger-list">`+a.entries.map(m=>{
      const you=m&&m.role==="player";
      return `<div class="led-item"><div class="led-meta"><span class="led-type led-${you?"outcome":"session"}">${you?"➤ you":"✦ dm"}</span><span class="led-when">${(m&&m.session!=null)?`s${m.session}`:""}</span></div>`+
        `<div class="led-text">${you?escHtml(m.text):mdBold(escHtml((m&&m.text)||""))}</div></div>`;
    }).join("")+`</div>`;
  }
  return `<details class="cp-history"${open?" open":""} ontoggle="archiveVaultToggle('${w.id}',this.open)">
    <summary>🗝 Archived narration — older sessions rest in the vault</summary>${body}</details>`;
}
/* the vault's open/close handler. Guards the re-render echo: every renderWorld() rebuilds the <details>,
   and a details parsed with the `open` attribute re-fires ontoggle — a toggle whose state already matches
   GS is that echo, not a user action, so it must no-op (else open→render→toggle would refetch forever).
   The in-flight guard drops a stale read if the vault closed (or the world switched) before it resolved. */
function archiveVaultToggle(worldId,isOpen){
  const a=GS.archive||(GS.archive={open:false,worldId:null,entries:null,loading:false});
  const wasOpen=!!(a.open&&a.worldId===worldId);
  if(!!isOpen===wasOpen)return;                       // re-render echo, not a user action
  if(!isOpen){ a.open=false; a.entries=null; a.loading=false; renderWorld(); return; }
  a.open=true; a.worldId=worldId; a.loading=true; a.entries=null;
  renderWorld();
  const read=(typeof archiveReadForWorld==="function")?archiveReadForWorld(worldId):Promise.resolve([]);
  read.then(entries=>{
    if(!(a.open&&a.worldId===worldId))return;         // closed / switched worlds while the read was in flight
    a.entries=Array.isArray(entries)?entries:[];
    a.loading=false;
    renderWorld();
  });
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
    ${typeof referenceShelfSectionHTML!=="undefined"?referenceShelfSectionHTML():""}
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
    const crownBadge=w.crowned?'<div class="badge" title="Crowned — passed into legend.">⟡ Crowned</div>':(w.sundered?'<div class="badge" title="Sundered — the Doom came due.">✧✦ Sundered</div>':'');
    return `<div class="world-card ${U.activeWorldId===id?'active-w':''}" onclick="enterWorld('${id}')">
      ${liveBadge}
      ${crownBadge}
      <h3>${w.name}</h3>
      <div class="setting">${w.seed.master.name} — ${w.seed.master.desc}</div>
      <div class="stats"><span>${w.gazetteer.length} discovered</span><span>${living} living</span><span>${fallen} fallen</span>${far}</div>
      <button class="btn sm wc-start" onclick="event.stopPropagation();startSession('${id}')" title="Prep casts the world, then the DM opens the scene">${w.sessionLive?'▶ Resume session':'▶ Start session'}</button>
    </div>`;
  }).join("");
  const planeNote=ids.length>1?`<div style="grid-column:1/-1;font-size:14px;color:var(--ink-dim);letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px">Regions of the plane — one soul's death sends the next to a distant shore</div>`:"";
  cards=planeNote+cards;
  // DURABILITY-TRIO.md §1: a shelf-level Import link (the ⚙ Menu's export/import only shows inside an
  // active world — this is the one spot reachable with zero worlds forged / no session live).
  const importLink=`<div style="grid-column:1/-1;text-align:right;margin-bottom:4px"><span class="iact" onclick="document.getElementById('importUniverseInput').click()">⇧ Import a Genesis export…</span></div>`;
  shelf.innerHTML=importLink+cards+`<div class="forge" onclick="newWorld()"><div class="plus">+</div><div>Forge a new world</div></div>`+soulsHTML();
  if(!ids.length){
    shelf.innerHTML=importLink+`<div class="forge" onclick="newWorld()" style="grid-column:1/-1;min-height:200px">
      <div class="plus">✦</div><div>Forge your first world</div>
      <div style="font-size:16px;color:var(--ink-dim);max-width:300px;text-align:center">Roll a world into being. It will persist here forever — across sessions, across characters — until you choose to destroy it.</div></div>`+soulsHTML();
  }
}
