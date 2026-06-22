/* Genesis — verify the Saga extractor (docs/DEATH-AND-REBIRTH.md build step 1).
   Loads src/world/saga.js in a vm context with stubbed world.state deps (slug/ledgerOf/nodeName),
   builds a world + character whose ledger mirrors what char-genesis / world-gen actually write,
   and asserts computeSaga ranks the right entities. No DOM needed — saga.js is pure logic.
   Run: node dev/verify-saga.mjs */
import {readFileSync} from "node:fs";
import vm from "node:vm";

let pass=0,fail=0;
const ok=(c,m)=>{if(c){pass++;}else{fail++;console.log("  FAIL:",m);}};

// --- minimal stubs of the world.state symbols saga.js reads at call-time ---
const ctx={
  slug:s=>(s||"").toString().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"x",
  ledgerOf:w=>w.ledger||(w.ledger=[]),
  nodeName:(w,id)=>((w.map&&w.map.nodes&&w.map.nodes[id]&&w.map.nodes[id].name)||id),
};
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL("../src/world/saga.js",import.meta.url),"utf8"),ctx);
const {computeSaga,refreshSaga,sagaKey}=ctx;
// top-level const isn't on the vm context (only var/functions are — the documented classic-script
// gotcha), so read SAGA_MAX by evaluating it in the same context.
const SAGA_MAX=vm.runInContext("SAGA_MAX",ctx);

// --- build a world + character the way the real engine does ---
let n=0;const uid=()=>"e"+(++n);
const c={id:"pc1",name:"Robin",bornWhere:"Saltmarsh",
  entry:{standing:"a marked enemy of",standingFaction:"The Tithe-Keepers"}};
const w={
  currentNodeId:"saltmarsh",
  map:{nodes:{saltmarsh:{name:"Saltmarsh"}}},
  gazetteer:[{type:"Setting",name:"Saltmarsh"},{type:"Place",name:"The Drowned Mire"}],
  characters:[c],
  ledger:[
    // world-gen faction web
    {id:uid(),type:"canon",data:{kind:"faction",name:"The Tithe-Keepers",agenda:"seize the grain",dominant:true}},
    {id:uid(),type:"clock",data:{kind:"faction-agenda",faction:"The Tithe-Keepers"}},
    {id:uid(),type:"canon",data:{kind:"faction",name:"The River-Rats",agenda:"strip the wrecks",dominant:false}},
    // this PC's life (seedFromLife writes npc-life + canon/thread, tagged fromChar)
    {id:uid(),type:"npc-life",data:{role:"An enemy made in the past",desc:"a sour reeve",fromChar:"pc1",source:"char-genesis"}},
    {id:uid(),type:"npc-life",data:{role:"A love or spouse",desc:"a glass-singer",fromChar:"pc1",source:"char-genesis"}},
    {id:uid(),type:"canon",data:{kind:"thread",text:"Searching for a lover who vanished",fromChar:"pc1",source:"char-genesis"}},
    // someone ELSE's past NPC (different character) — should rank below the PC's own
    {id:uid(),type:"npc-life",data:{role:"A former employer",desc:"a merchant",fromChar:"other"}},
    // a place learned of in play
    {id:uid(),type:"canon",data:{kind:"place",name:"The Drowned Mire",desc:"a sunken ruin"}},
  ],
};

const saga=computeSaga(w,c);
const byType=t=>saga.filter(s=>s.type===t);
const names=saga.map(s=>s.name);

ok(Array.isArray(saga),"returns an array");
ok(saga.length<=SAGA_MAX,`caps at SAGA_MAX (${SAGA_MAX}), got ${saga.length}`);
ok(byType("enemy").some(s=>/enemy made/i.test(s.name)),"the PC's enemy is tagged type 'enemy'");
ok(byType("thread").length>=1,"the open thread (vanished lover) is captured");
ok(names.some(n=>/Tithe-Keepers/.test(n)),"the dominant/standing faction is present");
ok(saga.every(s=>s.score>0),"every entry has a positive score");

// the PC's own enemy must out-rank a stranger's past NPC
const myEnemy=saga.find(s=>/enemy made/i.test(s.name));
const strangerNpc=saga.find(s=>/former employer/i.test(s.name));
ok(myEnemy,"PC's enemy is in the Saga");
ok(!strangerNpc||myEnemy.score>strangerNpc.score,"PC's own enemy out-ranks a stranger's NPC");

// the standing faction the PC is marked against should rank high (top 3)
const top3=names.slice(0,3);
ok(top3.some(n=>/Tithe-Keepers/.test(n)),"the faction the PC stands against ranks in the top 3");

// refreshSaga persists onto the character
const r=refreshSaga(w,c);
ok(c.saga===r&&Array.isArray(c.saga),"refreshSaga stores onto c.saga");

// fellWhere (set at death) should enter and rank as a high-stake place
c.fellWhere="The Drowned Mire";
const dead=computeSaga(w,c);
const mire=dead.find(s=>s.type==="place"&&/Drowned Mire/.test(s.name));
ok(mire,"where they fell is captured as a place once dead");

// determinism: same inputs → same ranking
ok(JSON.stringify(computeSaga(w,c))===JSON.stringify(computeSaga(w,c)),"deterministic for identical state");

// ============================================================
//  Bardo gap (docs/DEATH-AND-REBIRTH.md build step 2) — needs more world.state/engine deps,
//  so load src/world/rebirth.js into the same vm context with the extra stubs it reads.
// ============================================================
let factionTurns=0;
Object.assign(ctx,{
  rollDie:n=>1+Math.floor(Math.random()*n),
  clockOf:w=>w.clock||(w.clock={day:1,min:360}),
  advanceClock:(w,min)=>{const c=ctx.clockOf(w);const t=c.min+min;c.day+=Math.floor(t/1440);c.min=((t%1440)+1440)%1440;return c;},
  timeOfDay:()=>"morning",
  addLedger:(w,type,data,text)=>{const e={id:uid(),type,data:data||{},text:text||""};(w.ledger||(w.ledger=[])).push(e);return e;},
  logEvent:()=>{},
  ssFactionTurn:()=>{factionTurns++;},
});
vm.runInContext(readFileSync(new URL("../src/world/rebirth.js",import.meta.url),"utf8"),ctx);
const {rollBardoGap,bardoGap}=ctx;
const BARDO_MAX=vm.runInContext("BARDO_MAX_DAYS",ctx);

let lo=99,hi=-1,outOfRange=0,sum=0;
for(let i=0;i<4000;i++){const d=rollBardoGap();if(d<lo)lo=d;if(d>hi)hi=d;sum+=d;if(d<0||d>BARDO_MAX)outOfRange++;}
ok(outOfRange===0,`all 4000 gap rolls in 0..${BARDO_MAX} (${outOfRange} out of range)`);
ok(lo<7&&hi>40,`gap roll spans a wide range (saw ${lo}..${hi})`);
ok(sum/4000>18&&sum/4000<31,`gap mode lands ~3–4 weeks (mean ${(sum/4000).toFixed(1)} days)`);

// applies to a world: clock advances by exactly days, web turns ~once/week
const gw={clock:{day:10,min:360},ledger:[],characters:[]};
factionTurns=0;
const res=bardoGap(gw,21);
ok(res&&res.days===21,"bardoGap honors an explicit day count");
ok(gw.clock.day===31,`clock advanced 21 days (10→${gw.clock.day})`);
ok(factionTurns===3,`web turned once per week — 3 turns for 21 days (got ${factionTurns})`);
ok((gw.ledger||[]).some(e=>e.type==="transition"&&e.data.kind==="bardo"),"a 'bardo' transition is written to the ledger");

// instant exit (0 days): no faction turns, no clock move
const gw0={clock:{day:5,min:360},ledger:[]};factionTurns=0;
const r0=bardoGap(gw0,0);
ok(r0.days===0&&gw0.clock.day===5&&factionTurns===0,"a 0-day bardo moves nothing");

console.log(`\nverify-saga: ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
