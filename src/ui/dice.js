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
    pop.style.color = ({ Strange:"#8f7fc0", Volatile:"#c07a3a", Mythic:"#c4435e" })[band] || "#cdbf9e";
    pop.classList.remove("go"); void pop.offsetWidth; pop.classList.add("go");
  }
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
