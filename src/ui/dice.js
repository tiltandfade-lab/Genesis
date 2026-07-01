/* GENESIS MODULE — src/ui/dice.js — the dice visual engine (one place for all roll FX).
   Established 2026-06-21. Dice are used everywhere (creation, the world-genesis ritual, fate),
   so the tumble-then-settle animation + the spice "juice" live here once. Context adapters
   (animateDie in world.play, bardoDieFx/bardoFx in creator.bardo) delegate to these.
   Improve the dice feel HERE and it applies everywhere.

   Generic + dependency-free (DOM only) so every layer can call down into it. Classic <script>. */

/* Core: tumble an element through random faces, then settle on `result`.
   opts: { result, faces=100, band, ticks=9, interval=52, done=true, onDone } */
function dieRoll(el, opts){
  if(!el) return;
  opts = opts || {};
  const faces   = opts.faces || 100;
  const result  = opts.result;
  const band    = opts.band;
  const ticks   = (opts.ticks != null ? opts.ticks : 9);
  const base    = opts.interval || 52;
  const useDone = opts.done !== false;
  el.classList.remove("done","settle");
  el.classList.add("rolling");
  let n = 0;
  function step(){
    el.textContent = 1 + Math.floor(Math.random() * faces);
    if (++n > ticks) {
      el.classList.remove("rolling");
      if (useDone) el.classList.add("done");
      if (result != null) el.textContent = result;
      el.classList.remove("settle"); void el.offsetWidth; el.classList.add("settle"); // settle pop
      if (band) diceSpice(band);
      if (typeof opts.onDone === "function") opts.onDone();
      return;
    }
    // ease-out: each flip waits a little longer than the last, so the die decelerates into rest
    const p = n / ticks;
    setTimeout(step, base + Math.round(base * 1.8 * p * p));
  }
  setTimeout(step, base);
}

/* The spice "juice": glow the anchor card + fire a screen pop for the rarer bands.
   anchor defaults to the bardo card; pass an element for other contexts. */
function diceSpice(band, anchor){
  const map = { Textured:["","j-textured"], Strange:["Bizarre…","j-strange"], Volatile:["Otherworldly!","j-volatile"], Mythic:["SPICY!!","j-mythic"] };
  const m = map[band]; if(!m) return;
  const card = anchor || document.getElementById("bardoCard");
  if(card){ ["j-textured","j-strange","j-volatile","j-mythic"].forEach(c=>card.classList.remove(c)); void card.offsetWidth; card.classList.add(m[1]); }
  if(m[0]){
    let pop = document.getElementById("spicePop");
    if(!pop){ pop = document.createElement("div"); pop.id = "spicePop"; pop.className = "spice-pop"; document.body.appendChild(pop); }
    pop.textContent = m[0];
    pop.style.color = ({ Strange:"#2e6f63", Volatile:"#c07a3a", Mythic:"#c4435e" })[band] || "#cdbf9e";
    pop.classList.remove("go"); void pop.offsetWidth; pop.classList.add("go");
  }
}

/* ============================================================
   THE BOARD OVERLAY — diceOverlay(spec) (docs/DICE-OVERLAY.md)
   Polyhedral dice tumble over the feed and settle on the ENGINE'S predetermined results — theater
   only, results are inputs (the script owns the number; the animation lands on it). Mounted on
   document.body so renderWorld() re-renders can't kill it; pointer-events:none so play is never
   blocked. spec = { title, resultLine, dice:[{sides,result,dropped?,crit?}], stage2?:{dice,resultLine} }
   ============================================================ */
function diceOverlay(spec){
  spec=spec||{}; const dice=(spec.dice||[]).slice(0,10);
  if(!dice.length) return;
  const reduced=(typeof matchMedia==="function")&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  const old=document.getElementById("diceOverlay");
  if(old){ (old._t||[]).forEach(clearTimeout); if(old.parentNode)old.parentNode.removeChild(old); }
  const ov=document.createElement("div"); ov.id="diceOverlay"; ov._t=[];
  const col=document.querySelector(".chat-col");   // center over the feed when in-session
  if(col){ const r=col.getBoundingClientRect(); ov.style.left=r.left+"px"; ov.style.width=r.width+"px"; }
  ov.innerHTML=`<div class="dov-title">${spec.title?String(spec.title).replace(/[<>&]/g,""):""}</div>
    <div class="dov-row"></div><div class="dov-plate"></div>`;
  document.body.appendChild(ov);
  const later=(fn,ms)=>{ const t=setTimeout(fn,ms); ov._t.push(t); return t; };
  requestAnimationFrame(()=>ov.classList.add("on"));

  const SHAPES={ 4:"50,6 94,88 6,88", 8:"50,4 96,50 50,96 4,50", 10:"50,2 89,40 50,98 11,40",
    12:"50,4 93,35 77,88 23,88 7,35", 20:"50,3 91,26 91,74 50,97 9,74 9,26" };
  const dieSvg=s=>`<svg viewBox="0 0 100 100" aria-hidden="true">${
    s===6?'<rect x="8" y="8" width="84" height="84" rx="12" class="dp-body"/>'
         :`<polygon class="dp-body" points="${SHAPES[s]||SHAPES[20]}"/>`}${
    (s===20||!SHAPES[s]&&s!==6)?'<polygon class="dp-facet" points="50,24 73,61 27,61"/>':""}</svg>`;
  const anyDropped=dice.some(d=>d.dropped);

  function addDie(host,d,idx){
    const el=document.createElement("div"); el.className="die-poly";
    el.innerHTML=dieSvg(d.sides||20)+`<span class="dp-num"></span>`;
    host.appendChild(el);
    const num=el.querySelector(".dp-num");
    const mark=()=>{ if(d.dropped)el.classList.add("dropped"); else if(anyDropped)el.classList.add("kept");
      if(d.crit==="crit")el.classList.add("crit"); if(d.crit==="fumble")el.classList.add("fumble"); };
    if(reduced){ num.textContent=d.result; el.classList.add("settled"); mark(); return 0; }
    el.style.animationDelay=(idx*70)+"ms"; el.classList.add("tumbling");
    let n=0; const ticks=8, base=60;
    (function step(){ num.textContent=1+Math.floor(Math.random()*(d.sides||20));
      if(++n>ticks){ num.textContent=d.result; el.classList.remove("tumbling"); el.classList.add("settled"); mark(); return; }
      later(step, base+Math.round(base*1.6*(n/ticks)*(n/ticks)));
    })();
    return 920+idx*70;
  }
  const row=ov.querySelector(".dov-row"), plate=ov.querySelector(".dov-plate");
  let settle=0; dice.forEach((d,i)=>{ settle=Math.max(settle, addDie(row,d,i)); });
  const plateAt=(txt,ms)=>later(()=>{ plate.textContent=txt; ov.classList.add("plated"); }, ms);
  if(spec.resultLine) plateAt(spec.resultLine, settle);
  let end=settle;
  if(spec.stage2 && spec.stage2.dice && spec.stage2.dice.length){
    // the two-beat crit drama: the 20 (or 1) lands … then the magnitude die drops
    end=settle+250;
    later(()=>{ let s2=0; spec.stage2.dice.slice(0,4).forEach((d,i)=>{ s2=Math.max(s2, addDie(row,d,i)); });
      if(spec.stage2.resultLine) plateAt(spec.resultLine+"  ·  "+spec.stage2.resultLine, s2);
      later(dismiss, s2+1600);
    }, end);
  } else later(dismiss, end+1400);
  function dismiss(){ ov.classList.add("fade"); later(()=>{ if(ov.parentNode)ov.parentNode.removeChild(ov); }, 320); }
}

/* Parse + roll a free dice expression so the player can roll ANY combination on a DM prompt — not just a
   d20. Handles "2d6+3", "1d8", "2d6+1d4+1", "1d20-2", "4d6". Returns {ok,total,show,terms,expr} where
   `show` is a readable trace, e.g. "2d6+3 → [4,5]+3 = 12". Requires at least one die term (a flat number
   alone isn't a roll). Caps quantity at 100 to keep a typo from hanging the UI.
   (NB: distinct from engine.compiled's `rollExpr`, which only returns a total for Track-B tables.) */
function rollDiceExpr(expr){
  const s=String(expr||"").replace(/\s+/g,"");
  if(!s) return {ok:false};
  const re=/([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/gi;
  let m, total=0, parts=[], anyDie=false, consumed=0;
  while((m=re.exec(s))){
    consumed+=m[0].length;
    if(m[3]){
      const sign=m[1]==="-"?-1:1, n=Math.max(1,+(m[2]||1)), sides=+m[3];
      if(sides<2||n>100) return {ok:false};
      const rolls=[]; for(let i=0;i<n;i++)rolls.push(rollDie(sides));
      const sub=rolls.reduce((a,b)=>a+b,0); total+=sign*sub; anyDie=true;
      parts.push({sign,n,sides,rolls,sub});
    } else if(m[5]!=null){
      const sign=m[4]==="-"?-1:1; total+=sign*(+m[5]); parts.push({sign,flat:+m[5]});
    }
  }
  if(!anyDie || consumed!==s.length) return {ok:false};   // reject gibberish / partial parses
  const show=parts.map((p,i)=>{const sg=p.sign<0?"−":(i>0?"+":"");
    return p.flat!=null ? sg+p.flat : sg+`${p.n}d${p.sides}[${p.rolls.join(",")}]`;}).join("")+" = "+total;
  return {ok:true,total,show,terms:parts,expr:s};
}
