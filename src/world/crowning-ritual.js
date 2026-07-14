/* GENESIS MODULE — src/world/crowning-ritual.js — CROWNING §7.C2: the ritual + legend state.
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.
   Depends on C1 (src/engine/crowning.js: doomFront/crownEligible/CROWN_HOW_VERBS).

   The player-initiated Crowning ceremony (docs/CROWNING-BASTION.md §3.3): a bardo-pattern modal
   (reuses #bardoModal/#bardoBody, the openBardo mold — src/world/fate.js:38) with three click-rolls
   (Legend / Crown epithet / Succession) + a computed testament (computeSaga), then the additive
   w.crowned state write, the crowned PC retiring to U.souls (Q2), and the U.legends universe pool
   + Distant Word widening (§3.4). Also carries markSundered — the Sundering's (C1's flag) shared
   legend pass, inverted valence, gated behind C1's clock_fired write via a typeof guard so the two
   units compose without C1 re-editing.

   Zero new model calls (SPEED-DOCTRINE): every roll here is a deterministic click-roll
   (rollDie/CROWN_LEGEND index); every state write is additive. The DM's crowning/founding narration
   rides the turn it would have narrated anyway. */

const U_LEGENDS_CAP = 40;   // bound the universe legend pool (oldest evicted) — remembered, not infinite

/* openCrowning() — mirrors openBardo (fate.js:38): reuses #bardoModal/#bardoBody + .show, prose-
   first, click-revealed. Does NOT roll on open; renders the three roll buttons via renderCrowning. */
function openCrowning(){
  const w=activeWorld(); if(!w) return;
  const v=crownEligible(w);
  if(!v.eligible){ toast(v.blocked==="sundered"?"This world is sundered — it cannot be crowned."
    : v.blocked==="crowned"?"This world is already crowned." : "The world is not ready to be crowned."); return; }
  GS.CROWN={ step:0, legend:null, epithet:null, testament:null, succession:null };
  renderCrowning(w);
  document.getElementById("bardoModal").classList.add("show");
}

/* renderCrowning(w) — the step-by-step reveal, same shape as renderBardoPassage (fate.js:48): a
   heading, the reveals so far, and one primary button for the next un-taken step. The final
   step's button commits via crownWorld(). Blind-playable: the modal IS its own prose twin. */
function renderCrowning(w){
  const body=document.getElementById("bardoBody"); if(!body) return;
  const cr=GS.CROWN||{};
  const doom=doomFront(w);
  const rows=[];
  rows.push(`<div class="bardo-gap">The Doom is broken. ${escHtml(w.name)} stands at the edge of legend.</div>`);
  if(cr.legend) rows.push(`<div class="vis-frag peace">The plane will remember this as ${escHtml(cr.legend.text)}.</div>`);
  if(cr.testament && cr.testament.length) rows.push(`<div class="vis-group"><h4>The Testament</h4>${
    cr.testament.map(e=>`<div class="vis-frag peace">${escHtml(e.name)}</div>`).join("")}</div>`);
  if(cr.succession!=null && cr.testament && cr.testament[cr.succession]) rows.push(
    `<div class="vis-frag peace">What endures: ${escHtml(cr.testament[cr.succession].name)}.</div>`);
  let btn;
  if(!cr.legend) btn=`<button class="btn primary" onclick="crownRoll(1)">✦ Roll the Legend →</button>`;
  else if(!cr.testament) btn=`<button class="btn primary" onclick="crownRoll(2)">✦ Name the Crown →</button>`;
  else if(cr.succession==null) btn=`<button class="btn primary" onclick="crownRoll(3)">✦ Roll the Succession →</button>`;
  else btn=`<button class="btn primary" onclick="crownWorld()">⟡ Crown the world →</button>`;
  body.innerHTML=`<h3>The Crowning</h3>${rows.join("")}<div style="text-align:center">${btn}</div>`;
}

/* crownRoll(step) — resolves one deterministic roll into GS.CROWN, then re-renders.
     step 1 — Legend: one CROWN_LEGEND row (index via rollDie — see data/crown-legend.js).
     step 2 — Crown epithet: NOT rolled from a table — arms w.dm.needsEpithet so the DM's crowning
       narration mints it through the existing epithet_grant round-trip (repuGrantEpithet); this
       call also computes the Testament (computeSaga) so step 3 has a list to pick from.
     step 3 — Succession: one testament-entry index — which entry becomes the world's standing
       legend-hook (feeds B2 + Distant Word §3.4). */
function crownRoll(step){
  const w=activeWorld(); if(!w||!GS.CROWN) return;
  const cr=GS.CROWN;
  if(step===1 && !cr.legend){
    cr.legend=CROWN_LEGEND[rollDie(CROWN_LEGEND.length)-1];
  } else if(step===2 && !cr.testament){
    w.dm=w.dm||{}; w.dm.needsEpithet={deedRef:"crowning", day:(typeof clockOf==="function"?clockOf(w).day:null)};
    cr.epithet="(awaiting your DM's naming)";
    const t=(typeof livingSheet==="function")?livingSheet(w):null;
    cr.testament=computeSaga(w, t?t.c:null);
  } else if(step===3 && cr.succession==null){
    const len=(cr.testament||[]).length;
    cr.succession=len?(rollDie(len)-1):null;
  }
  renderCrowning(w);
}

/* crownWorld() — the additive, non-destructive answer to destroyWorld (play.js:420, which just
   deletes + never banks souls). Writes w.crowned, retires the PC to U.souls (Q2), feeds the
   universe legend pool (§3.4), then hands the plane to a brand-new successor (the crown costs
   the character, §3.5). */
function crownWorld(){
  const w=activeWorld(); if(!w) return;
  const v=crownEligible(w); if(!v.eligible){ toast("No longer eligible."); return; }
  const c=(w.characters||[]).filter(x=>x.status==="living").slice(-1)[0]; if(!c) return;
  const cr=GS.CROWN||{}; const day=(typeof clockOf==="function")?clockOf(w).day:null;
  const testament=(cr.testament&&cr.testament.length)?cr.testament:computeSaga(w,c);
  const epithetRec=(c.epithets&&c.epithets.length)?c.epithets[c.epithets.length-1]:null;
  const succIdx=(typeof cr.succession==="number")?cr.succession:0;
  const legend=cr.legend||{band:"grounded",text:"remembered"};
  const doom=doomFront(w);
  // 1) the additive world state write (§3.3)
  w.crowned = { day, by:{ pcId:c.id, name:c.name, epithet:epithetRec?epithetRec.text:null },
    legend, testament:testament.map(e=>({key:e.key,type:e.type,name:e.name})),
    succession:(testament[succIdx]?{key:testament[succIdx].key,name:testament[succIdx].name}:null),
    how:(doom&&doom.closedHow)||null };
  addLedger(w,"canon",{kind:"crowned",by:c.name,legend:legend.text,day},
    "⟡ "+c.name+" crowned "+w.name+" — "+legend.text+". The world passes into legend.");
  // 2) the crowned PC retires to the roster (Q2) — the souls feed destroyWorld never wired
  crownRetireToSoul(w,c);
  // 3) the universe legend pool + Distant Word widening (§3.4)
  legendRecord(w);
  GS.CROWN=null;
  if(typeof reveal==="function") reveal(w,'powers');
  saveU(U);
  document.getElementById("bardoModal").classList.remove("show");
  // 4) the crown costs the character — a NEW soul inherits the plane (epilogue play is a new PC, §3.4)
  if(typeof spawnSuccessorOnPlane==="function") spawnSuccessorOnPlane(); else if(typeof renderWorld==="function") renderWorld();
}

/* crownRetireToSoul(w,c) — banks the LIVING crowned character into U.souls (Q2). Mirrors
   soulFromCGEN's record shape (roster.js:20) but sources from the live character, not GS.CGEN, and
   stamps the crown. Deep-copies the sheet so the roster soul and the retired world character don't
   alias. c.status="crowned" is a NEW status value — the world character is retired IN PLACE (still
   in w.characters, world history intact) but no longer "living" (livingSheet returns null). */
function crownRetireToSoul(w,c){
  const roster=(typeof rosterSouls==="function")?rosterSouls():(U.souls=U.souls||[]);
  const sh=c.sheet||{};
  roster.push({ id:(typeof uid==="function"?uid():"soul-"+Date.now()), name:c.name,
    pronouns:c.pronouns||"they", bornAt:c.bornAt||Date.now(),
    sheet:JSON.parse(JSON.stringify(sh)),           // deep copy — the world char stays put (retired, not moved)
    life:c.life||null, headline:c.headline||c.spark||"",
    crowned:{ world:w.name, worldId:w.id, day:(w.crowned&&w.crowned.day)||null,
      legend:(w.crowned&&w.crowned.legend&&w.crowned.legend.text)||null,
      epithet:(w.crowned&&w.crowned.by&&w.crowned.by.epithet)||null } });
  c.status="crowned";   // the world character is retired IN PLACE (not deleted) — a new status value
  addLedger(w,"canon",{kind:"retired",char:c.id,name:c.name},
    "✧ "+c.name+" walks off into legend — a Wandering Soul now, the crown on their record.");
  return roster[roster.length-1];
}

/* markSundered(w) — the Sundering's (C1's w.sundered flag) shared legend pass, inverted valence
   (§3.5). Called from C1's clock_fired Sundering block via a typeof guard (world.dm never edited
   again by this unit). Idempotent — one pass; falls back to the last character (even if not
   living) for the testament so a Doom firing while the PC lies dead in the bardo (§5.3) never
   crashes on a null living sheet. */
function markSundered(w){
  if(!w||!w.sundered||w.sundered.legend) return;   // idempotent — one pass
  const c=(w.characters||[]).filter(x=>x.status==="living").slice(-1)[0]||(w.characters||[]).slice(-1)[0]||null;
  const testament=c?computeSaga(w,c):[];
  w.sundered.legend={ band:"dark", text:"the world where the Doom won" };
  w.sundered.testament=testament.map(e=>({key:e.key,type:e.type,name:e.name}));
  addLedger(w,"canon",{kind:"sundered-legend",day:w.sundered.day},
    "✧✦ The Sundering is sealed — a cautionary legend now, told against every world's Doom.");
  legendRecord(w);   // same universe-pool feed as the crown, inverted valence
}

/* legendRecord(w) — a crowned OR sundered world contributes its testament to a small universe-
   level pool (U.legends) so a PC in a fresh region can hear a distorted rumor of a world someone
   ELSE finished (§3.4). Additive to U; bounded by U_LEGENDS_CAP (oldest evicted). */
function legendRecord(w){
  U.legends=U.legends||[];
  const crowned=!!w.crowned, cw=crowned?w.crowned:w.sundered; if(!cw) return;
  U.legends.push({ worldId:w.id, worldName:w.name, kind:crowned?"crowned":"sundered",
    day:cw.day, legend:cw.legend?cw.legend.text:null,
    hook:cw.succession?cw.succession.name:(cw.testament&&cw.testament[0]?cw.testament[0].name:null),
    testament:(cw.testament||[]).slice(0, (typeof SAGA_MAX==="number"?SAGA_MAX:7)) });
  while(U.legends.length>U_LEGENDS_CAP) U.legends.shift();
}
