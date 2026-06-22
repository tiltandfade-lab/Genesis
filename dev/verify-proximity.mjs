/* Genesis — verify faction proximity at creation (docs/DEATH-AND-REBIRTH.md step 4).
   Full-app jsdom load (real data + engine), then exercises factionKind / rollFactionProximity /
   rollEntry: kind classification, class-weighted faction choice, the tie>member>none distribution,
   and that rollEntry records c.entry.proximity + a canon/proximity ledger entry.
   Run: node dev/verify-proximity.mjs  (jsdom from JSDOM_HOME or ~/.genesis-jsdom) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;
  var STAGES=[],WORLDBEATS=[],GUIDE={},LIFE_STEP={};`;
const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(harness + "\n" + src);

let pass = 0, fail = 0;
const ok = (c, m) => c ? pass++ : (fail++, console.log("  FAIL:", m));

// factionKind classifies Method text
const kinds = win.eval(`[
  factionKind({method:"faith, charisma, and persuasion"}),
  factionKind({method:"open force — arms, numbers, fear"}),
  factionKind({method:"smuggling and the black market"}),
  factionKind({method:"law, courts, charters, and bureaucracy"}),
  factionKind({method:"commerce, debt, and quiet ownership"}),
  factionKind({method:"something unmappable"})
]`);
ok(kinds[0]==="divine", `faith→divine (got ${kinds[0]})`);
ok(kinds[1]==="martial", `force→martial (got ${kinds[1]})`);
ok(kinds[2]==="criminal", `smuggling→criminal (got ${kinds[2]})`);
ok(kinds[3]==="civic", `law→civic (got ${kinds[3]})`);
ok(kinds[4]==="mercantile", `commerce→mercantile (got ${kinds[4]})`);
ok(kinds[5]==="civic", `unmappable→civic default (got ${kinds[5]})`);

// class-weighted choice + relationship distribution over many rolls
const dist = win.eval(`(function(){
  var w={factions:[
    {name:"Divine Order",method:"faith, charisma, and persuasion"},
    {name:"War Band",method:"open force — arms, numbers, fear"},
    {name:"Smugglers",method:"smuggling and the black market"}]};
  var cleric={sheet:{class:"Cleric"}};
  var rel={tie:0,member:0,none:0}, fac={};
  for(var i=0;i<3000;i++){var p=rollFactionProximity(w,cleric);rel[p.relationship]++;if(p.faction)fac[p.faction]=(fac[p.faction]||0)+1;}
  return {rel,fac};
})()`);
ok(dist.rel.tie > dist.rel.member && dist.rel.member > dist.rel.none, `relationship tie>member>none (${JSON.stringify(dist.rel)})`);
const total = dist.fac["Divine Order"]+dist.fac["War Band"]+dist.fac["Smugglers"];
ok(dist.fac["Divine Order"]/total > 0.5, `Cleric lands near the Divine Order >50% of the time (${(dist.fac["Divine Order"]/total*100).toFixed(0)}%)`);
ok(dist.fac["Smugglers"] > 0, "a Cleric can still land near a criminal faction (any class, any faction)");

// rollEntry integration: records proximity + a canon ledger entry when not 'none'
const ent = win.eval(`(function(){
  var hits=0,prox=0,ledger=0;
  for(var i=0;i<40;i++){
    var w={id:'w',name:'S',clock:{day:1,min:360},ledger:[],log:[],gazetteer:[],
      seed:{faction:{name:'The Tithe-Keepers'},master:{name:'Saltmarsh'}},factions:[],pressures:[]};
    rollStartingState(w);
    var c={id:'pc'+i,name:'PC',bornWhere:'Saltmarsh',sheet:{class:'Cleric'}};
    rollEntry(w,c);
    if(c.entry&&c.entry.proximity)hits++;
    if(c.entry.proximity.relationship!=='none'){prox++;
      if(w.ledger.some(e=>e.type==='canon'&&e.data.kind==='proximity'&&e.data.char===c.id))ledger++;}
  }
  return {hits,prox,ledger};
})()`);
ok(ent.hits===40, `rollEntry always records c.entry.proximity (${ent.hits}/40)`);
ok(ent.prox>0, "some characters are born tied/sworn to a faction");
ok(ent.ledger===ent.prox, `every non-'none' proximity writes a canon ledger entry (${ent.ledger}/${ent.prox})`);

console.log(`\nverify-proximity: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
