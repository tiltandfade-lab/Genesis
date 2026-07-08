/* dev/model-qa/export-obj.mjs — bake the probe creatures to Blender-ready OBJ.
   Runs the SAME landmark modules the browser renders (creatures/*.js on probe-lib primitives),
   reads the merged geometry buffers, welds coincident verts (so limbs/body come in as connected
   topology, not triangle soup), and writes one OBJ per creature with per-vertex colors.

   Blender import: File ▸ Import ▸ Wavefront (.obj). The default axis (-Z Forward, Y Up) converts
   this three.js Y-up geometry to Blender Z-up correctly. After import, select the mesh and run
   Mesh ▸ Face ▸ Tris to Quads (Alt+J) — stitch() laid the surfaces out as quad grids, so most of
   the clean quad topology comes right back. Vertex colors ride in the `v x y z r g b` extension
   (Blender 4.x reads them into a color attribute; older versions ignore the rgb harmlessly).

   Run: node dev/model-qa/export-obj.mjs   ->  dev/model-qa/exports/{humanoid,spider}.obj */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resetGeom, getBuffers } from './probe-lib.js';
import { buildHumanoid } from './creatures/humanoid.js';
import { buildSpider } from './creatures/spider.js';
import { buildWolf } from './creatures/mon-wolf.js';
import { buildWolfRig } from './rigs/quadruped.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'exports');
fs.mkdirSync(outDir, { recursive: true });

function toOBJ(name, POS, COL){
  const key = new Map();          // rounded-position -> welded index
  const verts = [];               // [x,y,z,r,g,b]
  const acc = [];                 // color accumulation [r,g,b,count] parallel to verts
  const idxOf = (i) => {
    const x=POS[i*3], y=POS[i*3+1], z=POS[i*3+2];
    const k = `${Math.round(x*1e4)},${Math.round(y*1e4)},${Math.round(z*1e4)}`;
    let id = key.get(k);
    if(id === undefined){ id = verts.length; key.set(k, id); verts.push([x,y,z]); acc.push([0,0,0,0]); }
    const a = acc[id]; a[0]+=COL[i*3]; a[1]+=COL[i*3+1]; a[2]+=COL[i*3+2]; a[3]++;
    return id;
  };
  const faces = [];
  const triCount = POS.length/9;
  for(let t=0;t<triCount;t++){
    const a=idxOf(t*3), b=idxOf(t*3+1), c=idxOf(t*3+2);
    if(a!==b && b!==c && a!==c) faces.push([a,b,c]);   // drop any degenerate welded tri
  }
  const lines = [`# Genesis whole-object probe — ${name}`, `# ${verts.length} verts, ${faces.length} tris (welded from ${triCount})`, `o ${name}`];
  for(let i=0;i<verts.length;i++){
    const [x,y,z]=verts[i], a=acc[i], r=(a[0]/a[3]).toFixed(4), g=(a[1]/a[3]).toFixed(4), b=(a[2]/a[3]).toFixed(4);
    lines.push(`v ${x.toFixed(5)} ${y.toFixed(5)} ${z.toFixed(5)} ${r} ${g} ${b}`);
  }
  for(const f of faces) lines.push(`f ${f[0]+1} ${f[1]+1} ${f[2]+1}`);
  return { obj: lines.join('\n') + '\n', verts: verts.length, tris: faces.length, rawTris: triCount };
}

for(const [name, build] of [['humanoid', buildHumanoid], ['spider', buildSpider], ['mon-wolf', buildWolf], ['wolf-rig', buildWolfRig]]){
  resetGeom();
  build();
  const { POS, COL } = getBuffers();
  const { obj, verts, tris, rawTris } = toOBJ(name, POS, COL);
  fs.writeFileSync(path.join(outDir, `${name}.obj`), obj);
  console.log(`${name}.obj  ${verts} verts · ${tris} tris (welded from ${rawTris})`);
}
console.log('-> dev/model-qa/exports/');
