/* GENESIS MODULE — src/ui/dice.js — the dice visual engine (one place for all roll FX).
   Established 2026-06-21. Dice are used everywhere (creation, the world-genesis ritual, fate),
   so the tumble-then-settle animation + the spice "juice" live here once. Context adapters
   (animateDie in world.play, bardoDieFx/bardoFx in creator.bardo, rollFate in world.fate)
   delegate to these. Improve the dice feel HERE and it applies everywhere.

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
