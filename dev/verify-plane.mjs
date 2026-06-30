/* Genesis — verify the connected plane (docs/DEATH-AND-REBIRTH.md step 6).
   Full-app jsdom load (real origin so localStorage/saveU work). Checks region placement spirals
   outward + stays distinct, region distance + farthest-region selection, additive migration
   (region-less worlds get placed + the plane marker is set), and that a successor spawns in the
   region most distant from where they fell.
   Run: node dev/verify-plane.mjs  (jsdom from JSDOM_HOME or ~/.genesis-jsdom) */
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
// STAGES/WORLDBEATS/GUIDE/LIFE_STEP are now real consts in data/creation-flow.js (in loadOrder → `src`);
// predeclaring them here as `var` collides with their `const` (SyntaxError). Only stub what's NOT in src.
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(harness + "\n" + src);
win.eval(`rollCharacter=function(){window.__spawned=(window.__spawned||0)+1;};toast=function(){};renderWorld=function(){};`);

let pass = 0, fail = 0;
const ok = (c, m) => c ? pass++ : (fail++, console.log("  FAIL:", m));

// region spiral: distinct coordinates, centre at 0,0
const spiral = win.eval(`(function(){
  var seen={},dups=0,centre=JSON.stringify(regionRingPos(0));
  for(var n=0;n<25;n++){var k=JSON.stringify(regionRingPos(n));if(seen[k])dups++;seen[k]=1;}
  return {dups, centre, count:Object.keys(seen).length};
})()`);
ok(spiral.dups===0, `region spiral yields distinct coords (dups ${spiral.dups})`);
ok(spiral.centre==='{"q":0,"r":0}', "region 0 sits at the plane centre");
ok(spiral.count===25, "25 regions → 25 distinct positions");

// regionDistance + farthestRegion
const dist = win.eval(`(function(){
  var a={id:'a',region:{q:0,r:0}}, b={id:'b',region:{q:1,r:0}}, c={id:'c',region:{q:5,r:-2}};
  U.worlds={a:a,b:b,c:c};
  return { ab:regionDistance(a,b), ac:regionDistance(a,c), farFromA:farthestRegion(a).id };
})()`);
ok(dist.ab===1, `adjacent regions are distance 1 (got ${dist.ab})`);
ok(dist.ac>dist.ab, "a farther region reads a greater distance");
ok(dist.farFromA==="c", `farthestRegion(a) is c (got ${dist.farFromA})`);

// additive migration: region-less worlds get placed, plane marker set, nothing reset
const mig = win.eval(`(function(){
  U.worlds={w1:{id:'w1'},w2:{id:'w2'},w3:{id:'w3'}}; U.plane=null; U.souls=[];
  migrateAll();
  var ws=Object.values(U.worlds);
  var placed=ws.every(w=>w.region&&typeof w.region.q==='number');
  var coords=ws.map(w=>JSON.stringify(w.region));
  var distinct=new Set(coords).size===coords.length;
  return { placed, distinct, planeVersion:(U.plane&&U.plane.version), kept:ws.length };
})()`);
ok(mig.placed, "migration places every region-less world on the plane");
ok(mig.distinct, "migrated regions are distinct");
ok(mig.planeVersion===3, "the connected-plane marker (U.plane.version=3) is set");
ok(mig.kept===3, "migration keeps all existing worlds (non-destructive)");

// placeRegion fills the next free spiral slot (slots 0 and 1 taken → new world gets slot 2)
const place = win.eval(`(function(){
  U.worlds={a:{id:'a',region:regionRingPos(0)},b:{id:'b',region:regionRingPos(1)}};
  var nw={id:'c'}; placeRegion(nw);
  return { has:!!nw.region, matchesNext: JSON.stringify(nw.region)===JSON.stringify(regionRingPos(2)) };
})()`);
ok(place.has && place.matchesNext, "placeRegion fills the next free slot on the plane");

// placeRegion never collides with a live world, even after a slot is freed (the review bug)
const nocol = win.eval(`(function(){
  // worlds occupy spiral slots 0 and 2; slot 1 is free (as if the middle world was destroyed)
  U.worlds={a:{id:'a',region:regionRingPos(0)},c:{id:'c',region:regionRingPos(2)}};
  var nw={id:'d'}; placeRegion(nw);
  var coords=Object.values(U.worlds).map(w=>w.region.q+','+w.region.r);
  coords.push(nw.region.q+','+nw.region.r);
  var distinct=new Set(coords).size===coords.length;
  var fillsGap=(nw.region.q===regionRingPos(1).q && nw.region.r===regionRingPos(1).r);
  return { distinct, fillsGap };
})()`);
ok(nocol.distinct, "placeRegion produces no duplicate coords when a slot was freed");
ok(nocol.fillsGap, "placeRegion fills the lowest free slot, not a colliding one");

// successor spawns in the region most distant from where they fell
const spawn = win.eval(`(function(){
  var death={id:'death',name:'Saltmarsh',region:{q:0,r:0},characters:[]};
  var near ={id:'near', name:'Nearby',  region:{q:1,r:0},characters:[]};
  var far  ={id:'far',  name:'Tundra',  region:{q:9,r:-4},characters:[]};
  U.worlds={death:death,near:near,far:far}; U.activeWorldId='death'; window.__spawned=0;
  spawnSuccessorOnPlane();
  return { active:U.activeWorldId, spawned:window.__spawned };
})()`);
ok(spawn.active==="far", `successor wakes in the most distant region (active=${spawn.active})`);
ok(spawn.spawned===1, "a successor character is rolled");

// single-region plane: successor stays (no distant shore yet)
const solo = win.eval(`(function(){
  var only={id:'only',name:'Home',region:{q:0,r:0},characters:[]};
  U.worlds={only:only}; U.activeWorldId='only'; window.__spawned=0;
  spawnSuccessorOnPlane();
  return { active:U.activeWorldId, spawned:window.__spawned };
})()`);
ok(solo.active==="only" && solo.spawned===1, "with one region, the successor enters it (no crash)");

console.log(`\nverify-plane: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
