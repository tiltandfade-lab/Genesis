/* GENESIS MODULE — src/world/fate.js — death → the bardo passage → a new soul.
   REWORKED 2026-06-21 (Death & Rebirth build step 7): the old d20 "spawn back into the same
   adventure" is RETIRED. A death now stamps the in-world time it happened, writes the fall as
   canon, runs the bardo (src/world/rebirth.js: the gap drifts the world + the 14 visions dream
   its direction over the dead PC's Saga), shows the passage, then rolls a brand-new successor.
   Classic <script>, shared global scope. Reads activeWorld/clockOf/addLedger/logEvent/saveU
   (world.state), runBardo (world.rebirth), rollCharacter (world.play) at call-time. */

function killCharacter(id){
  const w=activeWorld();if(!w)return;
  const c=w.characters.find(x=>x.id===id);if(!c)return;
  const where=prompt(`Where did ${c.name} fall? (a place, or leave blank)`,w.seed.master.name)||"parts unknown";
  c.status="fallen";
  c.fellWhere=where.trim()||"parts unknown";
  c.fellWhen=Object.assign({},clockOf(w)); // in-world time of death (NOT wall-clock) — the corpse decays off this
  // the body + carried effects become a canon object at the fall site, decaying by context (step 5)
  c.corpse={context:rollCorpseContext(),items:((c.sheet&&c.sheet.inventory)||[]).slice(),gold:(c.sheet&&c.sheet.gold)||0,looted:false};
  logEvent(w,`<span style="color:var(--blood)">${c.name} fell at ${c.fellWhere}.</span>`);
  addLedger(w,"canon",{kind:"death",char:c.id,name:c.name,place:c.fellWhere,day:clockOf(w).day,min:clockOf(w).min},
    `${c.name} fell at ${c.fellWhere} — Day ${clockOf(w).day}.`);
  addLedger(w,"canon",{kind:"corpse",char:c.id,place:c.fellWhere,context:c.corpse.context.tag,gold:c.corpse.gold,items:c.corpse.items.length},
    `${c.name}'s body lies at ${c.fellWhere} — ${c.corpse.context.label}. Their effects remain, for now.`);
  saveU(U);
  openBardo(c);
}

/* The bardo passage: run the gap + visions, then reveal them to the player (fragments only —
   the truth is canon in the ledger for the DM). The world has already drifted by the time this
   shows; the closing button rolls the successor. */
function openBardo(c){
  GS.FATE_CTX=c;
  const w=activeWorld();
  const r=runBardo(w,c); // advances the clock, drifts the web, dreams the 14 visions onto c.visions
  c.fate=`Passed through the bardo — ${r.gap.days} day${r.gap.days===1?"":"s"} between lives; the world moved on.`;
  saveU(U);
  renderBardoPassage(c,r);
  document.getElementById("bardoModal").classList.add("show");
}

function renderBardoPassage(c,r){
  const body=document.getElementById("bardoBody");if(!body)return;
  const vis=(c.visions||[]);
  const peace=vis.filter(v=>v.valence==="peaceful"),wrath=vis.filter(v=>v.valence==="wrathful");
  const fragHTML=(list,cls)=>list.map((v,i)=>
    `<div class="vis-frag ${cls}" style="animation-delay:${(i*0.12).toFixed(2)}s">${escHtml(v.fragment)}</div>`).join("");
  const days=r.gap.days;
  const gapLine=days>0
    ? `${escHtml(c.name)} fell at ${escHtml(c.fellWhere)}.<br>${days} day${days===1?"":"s"} pass in the bardo. The world does not wait.`
    : `${escHtml(c.name)} fell at ${escHtml(c.fellWhere)}.<br>The bardo passes in a breath — a new soul stirs the same hour.`;
  body.innerHTML=
    `<h3>The Bardo</h3>
     <div class="bardo-gap">${gapLine}</div>
     ${peace.length?`<div class="vis-group"><h4>Peaceful visions</h4>${fragHTML(peace,"peace")}</div>`:""}
     ${wrath.length?`<div class="vis-group"><h4>Wrathful visions</h4>${fragHTML(wrath,"wrath")}</div>`:""}
     <div class="bardo-close">The wheel turns. A new soul gathers at the edge of the world.</div>
     <div style="text-align:center"><button class="btn primary" onclick="closeBardo()">✦ A new soul enters →</button></div>`;
}

function closeBardo(){
  document.getElementById("bardoModal").classList.remove("show");
  saveU(U);
  rollCharacter(); // a brand-new successor (no inherited quests); spawn placement on the shared plane is build step 6
}

/* Recover a fallen character's effects when a living PC stands where the body lies (step 5).
   The world view offers this only while the corpse is still recoverable (corpsesAt). */
function recoverFallen(id){
  const w=activeWorld();if(!w)return;
  const dead=w.characters.find(x=>x.id===id);
  const taker=w.characters.filter(x=>x.status==="living").slice(-1)[0];
  if(!dead||!taker){toast("No one here to recover it.");return;}
  const haul=claimCorpse(w,dead,taker);
  toast(haul?`Recovered ${haul.gold} gp and ${haul.items.length} item${haul.items.length===1?"":"s"} from ${dead.name}.`
            :`${dead.name}'s effects are gone — long since taken.`);
  saveU(U);renderWorld();
}
