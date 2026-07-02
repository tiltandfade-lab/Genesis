/* GENESIS MODULE — src/world/capture.js — CAPTURE AS RE-ENTRY (docs/WALK-CONSUMPTION.md §6).
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   MUST load after prep.js (walkSetActive/walkAdvance/walkOfFrontier) + codex.js + state.js.

   Capture is NOT a new branch — it is another ENTRANCE into the walk already in motion. On subdual the
   PC is dropped into a HOLDING SEGMENT of the active walk (reused if the topology already has one, minted
   as a single node if not — never a new prison subsystem), a PRE-CAST NPC is nominated as the possible
   escape lever (the DM decides ally-or-betray — verbs stay with the DM), and a DISPOSITION CLOCK is lit
   that CAN actually run out (a capture that can't go wrong is a free vacation — see DM hard/dangerous).

   ENGINE OWNS THE NOUNS: only four sub-rolls are new dice (disposition / holding-when-minted /
   confiscation / opening) — they seed a HANDLE, not a scene. The captor, the cell-when-reused, and the
   lever are pulled from LIVE state (faction clocks, active walk, pre-cast). All internals `cap`-prefixed. */

// ─── disposition sets the clock. execution-pending is short BY DESIGN — it must be able to fire. ──
const CAPTURE_DISPOSITIONS = [
  { id:"ransom",        label:"Held for ransom",        fuse:8, doom:"the ransom deadline passes and the captor cuts their losses" },
  { id:"interrogation", label:"Held for interrogation", fuse:5, doom:"the questioner runs out of patience" },
  { id:"labor",         label:"Sold into labor",        fuse:6, doom:"the slaver's caravan departs with the PC in it" },
  { id:"execution",     label:"Execution pending",      fuse:3, doom:"the sentence is carried out" },
  { id:"trade",         label:"Trade-bait / hostage",   fuse:7, doom:"the exchange goes through — for someone else's gain" },
  { id:"trophy",        label:"Kept as a trophy",       fuse:6, doom:"the captor tires of the prize and disposes of it" },
];
// the cell noun — ONLY rolled when the active walk has no holding-type segment to reuse.
const CAPTURE_HOLDING = ["a black-iron cell","a flooded pit","a hanging cage","a windowless strongroom",
  "an oubliette beneath the floor","a slaver's brig","a root-cellar gaol"];
// where the confiscated gear went — the recovery hook.
const CAPTURE_CONFISCATION = [
  { id:"jailer",     text:"your gear hangs on the jailer's belt" },
  { id:"strongroom", text:"your gear is locked in a strongroom" },
  { id:"sold",       text:"your gear has already been sold off" },
  { id:"boss",       text:"the captor's boss keeps your finest piece" },
  { id:"missed",     text:"they missed one thing — you still have it on you" },
];
// the rolled escape vector — a handle, not a guarantee (the DM owns whether it's real or a trap).
const CAPTURE_OPENING = [
  "a sympathetic guard who hates this work",
  "a bar already loose in its setting",
  "the slack hour at the shift-change",
  "someone they keep nearby who could be turned",
  "a tool they failed to take from you",
];

// segment shapes that already read as a holding (reuse instead of minting)
const CAPTURE_HOLDING_TAGS = /cell|pit|hold(ing)?|cage|vault|strongroom|oubliette|gaol|jail|dungeon|brig|cellar|crypt|prison|stockade/i;

function capPick(arr){ return (typeof pick==="function") ? pick(arr) : arr[0]; }

/* the four new sub-rolls — nouns only. */
function rollCapture(opts){
  opts=opts||{};
  const disposition = opts.disposition
    ? (CAPTURE_DISPOSITIONS.find(d=>d.id===opts.disposition) || capPick(CAPTURE_DISPOSITIONS))
    : capPick(CAPTURE_DISPOSITIONS);
  return {
    disposition,
    confiscation: capPick(CAPTURE_CONFISCATION),
    opening:      capPick(CAPTURE_OPENING),
    holdingNoun:  capPick(CAPTURE_HOLDING),
  };
}

/* the captor = the faction most advanced against the PC (highest clock fill), or an explicit id, or
   the dominant power, or null (a rolled generic press-gang the DM voices). */
function capChooseCaptor(w, captorId){
  const facs = w.factions || [];
  if(captorId && typeof findClockTarget==="function"){
    const t=findClockTarget(w,captorId); if(t&&t.kind==="faction") return t.obj;
  }
  if(!facs.length) return null;
  const ratio=f=>{ const c=f.clock||{}; return c.size ? (c.filled||0)/c.size : 0; };
  const ranked=facs.slice().sort((a,b)=>ratio(b)-ratio(a));
  return ranked.find(f=>ratio(f)>0) || facs.find(f=>f.dominant) || ranked[0];
}

/* find a holding-type segment in the active walk, else MINT one appended to the walk (a single node,
   not a new walk). Returns the segment, with `.minted` set when freshly created. */
function capHoldingSegment(w, walk, roll){
  const segs = walk.segments || (walk.segments=[]);
  const hit = segs.find(s => CAPTURE_HOLDING_TAGS.test([s.label,s.segType,s.areaType,s.description].filter(Boolean).join(" ")));
  if(hit) return hit;
  const num = segs.reduce((mx,s)=>Math.max(mx, s.num||0), 0) + 1;
  const seg = { id:"hold-"+num, num, label:roll.holdingNoun, isFinale:false, depth:0, exits:[],
                segType:"holding", description:"A place built to keep someone who does not wish to stay.", minted:true };
  segs.push(seg);
  walk.segCount = Math.max(walk.segCount||0, segs.length);
  return seg;
}

/* if there's no active walk at all (taken in town, before any walk), mint a one-node holding walk and
   make it the active walk — capture becomes its own minimal walk, fully consistent with the cursor model. */
function capMintHoldingWalk(w, roll){
  const P=prepOf(w);
  if(!P.bundle) P.bundle={ schema:"prep-bundle/v1", environments:[] };
  if(!P.bundle.environments) P.bundle.environments=[];
  const nodeId = addNode(w, roll.holdingNoun, "Frontier");
  const m=mapOf(w), nn=m.nodes[nodeId]; if(nn) nn.soft=false;
  const walk = { environment:"holding", topology:null, segCount:1,
    segments:[{ id:"hold-1", num:1, label:roll.holdingNoun, isFinale:false, depth:0, exits:[],
                segType:"holding", description:"A place built to keep someone who does not wish to stay.", minted:true }] };
  P.bundle.environments.push({ kind:"holding", walk, hook:null, cast:null });
  const idx=P.bundle.environments.length-1;
  P.nodes[nodeId]={ env:"holding", idx, soft:false, locked:true };
  w.currentNodeId=nodeId; if(typeof seeNode==="function") seeNode(w,nodeId);
  walkSetActive(w,nodeId);
  return nodeId;
}

/* open the disposition front — a real, fireable clock the DM advances over time. Resolves via the
   standard clock_advanced/clock_fired machinery (findClockTarget matches on slug(danger)). */
function capOpenDispositionClock(w, captor, roll){
  const danger = "Captivity — " + roll.disposition.label + (captor?(" ("+captor.name+")"):"");
  w.pressures = w.pressures || [];
  const front = {
    id: slug(danger), kind:"capture", danger,
    clock:{ filled:0, size:roll.disposition.fuse },
    impersonal:false, known:true, closed:false,
    real:{ text:"The way out: "+roll.opening+"." },          // the rolled opening rides as the front's hidden truth
    doom: roll.disposition.doom,                              // what happens when the clock fills
  };
  w.pressures.push(front);
  if(typeof reveal==="function") reveal(w,'powers');
  return front;
}

/* nominate a pre-cast soft NPC at this frontier as the POSSIBLE lever (the DM decides ally/betray).
   Falls back to an on-demand minted jailer when nothing was pre-cast. Returns the codex id or null. */
function capNominateLever(w, nodeId){
  const P=prepOf(w), pn=P.nodes&&P.nodes[nodeId];
  let leverId = pn && pn.cast && (pn.cast.npcIds||[])[0];
  if(!leverId && typeof rollNPC==="function" && typeof codexAdd==="function" && typeof CT==="function" && Object.keys(CT()).length){
    // REGIONS-NAMES.md §3: the holding's own region blends its culture bank into the jailer's name.
    const jailerRegion=(typeof regionForNode==="function")?regionForNode(w,nodeId):null;
    const npc=rollNPC({ roleHint:"jailer", region:jailerRegion });
    const r=codexAdd(w, Object.assign({}, npc, { provenance:"rolled", status:{ at:(P.nodes[nodeId]&&P.nodes[nodeId].cast&&P.nodes[nodeId].cast.locId)||null } }));
    leverId=r&&r.id;
  }
  if(leverId && typeof codexUpdate==="function"){
    const rec=(typeof codexGet==="function")?codexGet(w,leverId):null;
    codexUpdate(w, leverId, { dm: Object.assign({}, rec&&rec.dm, { role:"possible-lever", note:"a way out — if they can be trusted" }) });
  }
  return leverId||null;
}

/* APPLY a capture (EVENT-CONTRACT type "capture"). All payload fields optional — the script fills any
   the DM omits. Lands the PC inside the walk already in motion, beside a cast lever, under a ticking
   disposition clock. The DM owns the verbs (the captor's real motive + lies, whether the lever helps). */
function applyCapture(w, p){
  p=p||{};
  if(typeof livingSheet!=="function") return {ok:false, reason:"unavailable"};
  const t=livingSheet(w); if(!t) return {ok:false, reason:"no-pc"};
  const roll=rollCapture(p);
  const captor=capChooseCaptor(w, p.captorFactionId);

  // 1) the holding — reuse a holding segment of the active walk, else mint one; or mint a holding walk.
  const P=prepOf(w);
  let nodeId=P.activeWalkId, seg=null, minted=false;
  if(nodeId){
    const walk=walkOfFrontier(w,nodeId);
    seg = (typeof p.holdingSeg==="number" && walk) ? (walk.segments||[]).find(s=>s.num===p.holdingSeg) : null;
    if(!seg && walk) seg=capHoldingSegment(w, walk, roll);
    minted = !!(seg&&seg.minted);
    if(seg) walkAdvance(w, seg.num, nodeId);              // point the cursor at the cell
  } else {
    nodeId=capMintHoldingWalk(w, roll);                  // taken with no walk in motion → capture IS the walk
    seg=walkOfFrontier(w,nodeId).segments[0]; minted=true;
  }

  // 2) the disposition clock (fireable) + 3) the lever (pre-cast or minted)
  const front=capOpenDispositionClock(w, captor, roll);
  const leverId=p.leverId || capNominateLever(w, nodeId);

  // 4) confiscation + the captured condition
  t.c.conditions = t.c.conditions || [];
  if(t.c.conditions.indexOf("captured")<0) t.c.conditions.push("captured");
  t.c.captured = { dispositionId:roll.disposition.id, frontId:front.id, captor:captor?captor.name:null,
                   confiscation:roll.confiscation.id, leverId:leverId||null, at:nodeId };

  // 5) one ledger beat carrying all the nouns + walk provenance (Step C sees the capture loop)
  const wk=(typeof walkStamp==="function")?walkStamp(w):null;
  addLedger(w,"outcome",{kind:"capture",dispositionId:roll.disposition.id,captor:captor?captor.name:null,
      confiscation:roll.confiscation.id,leverId:leverId||null,minted,frontId:front.id,walk:wk,source:p.source||"play"},
    `⛓ Taken${captor?(" by "+captor.name):""} — ${roll.disposition.label.toLowerCase()}. ${cap1(roll.confiscation.text)}. `+
    `The clock turns toward ${roll.disposition.doom}.`);

  return { ok:true, captor:captor?captor.name:null, disposition:roll.disposition.id,
           fuse:roll.disposition.fuse, frontId:front.id, holdingSeg:seg?seg.num:null, minted,
           leverId:leverId||null, confiscation:roll.confiscation.id, opening:roll.opening, at:nodeId };
}

function cap1(s){ s=s||""; return s.charAt(0).toUpperCase()+s.slice(1); }
