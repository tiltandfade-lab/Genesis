/* GENESIS MODULE — src/engine/hexmap.js — lazy deterministic hex substrate (geometry + terrain; docs/SPATIAL-MODEL.md)
   Carved from genesis.html monolith on 2026-06-20 (Pass 3, logic-by-domain: engine).
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Reads carved data (mapOf from app) at call-time. */

/* ============================================================
   SPATIAL — lazy deterministic hex substrate under the node-graph
   (docs/SPATIAL-MODEL.md: terrain = hash(seed,coords); never stored;
   nodes pinned over it in world units; the edge frays)
   ============================================================ */
const HEXW=1.6; // world-units (leagues) per hex
const BIOMES=[["plain","#586b3a"],["forest","#33502c"],["hill","#6f5d39"],["mount","#6d6d74"],["marsh","#3c5547"],["arid","#9a8455"],["water","#34546b"],["waste","#54473c"]];
const COMPASS={N:[0,-1],NE:[0.71,-0.71],E:[1,0],SE:[0.71,0.71],S:[0,1],SW:[-0.71,0.71],W:[-1,0],NW:[-0.71,-0.71]};
function hashCoord(seed,q,r){let h=2166136261>>>0;const s=seed+":"+q+","+r;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),16777619);}h>>>=0;return h/4294967296;}
function axialRound(q,r){let x=q,z=r,y=-x-z;let rx=Math.round(x),ry=Math.round(y),rz=Math.round(z);
  const dx=Math.abs(rx-x),dy=Math.abs(ry-y),dz=Math.abs(rz-z);
  if(dx>dy&&dx>dz)rx=-ry-rz;else if(dy>dz)ry=-rx-rz;else rz=-rx-ry;return {q:rx,r:rz};}
function worldToAxial(x,y){return axialRound((Math.sqrt(3)/3*x-1/3*y)/HEXW,(2/3*y)/HEXW);}
function axialToWorld(q,r){return {x:HEXW*Math.sqrt(3)*(q+r/2),y:HEXW*1.5*r};}
function hexDist(q,r){return (Math.abs(q)+Math.abs(r)+Math.abs(q+r))/2;}
function terrainAt(w,q,r){const n=hashCoord(w.id,q,r),d=hexDist(q,r),b=BIOMES[Math.floor(n*BIOMES.length)%BIOMES.length];
  const fray=Math.max(0,(d-(w._frayStart||8))/5);return {name:b[0],color:b[1],dist:d,fray:Math.min(1,fray),strange:n>0.985};}
function nodeXY(w,id){const nn=mapOf(w).nodes[id];return nn&&nn.x!=null?{x:nn.x,y:nn.y}:null;}
function setNodeXY(w,id,x,y){const nn=mapOf(w).nodes[id];if(nn){nn.x=x;nn.y=y;}}
function placeTravelNode(w,fromId,toId,route){
  const f=nodeXY(w,fromId)||{x:0,y:0};const d=COMPASS[route.bearing]||[1,0];const step=Math.max(1,route.leagues);
  setNodeXY(w,toId,f.x+d[0]*step,f.y+d[1]*step);}
