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

console.log(`\nverify-saga: ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
