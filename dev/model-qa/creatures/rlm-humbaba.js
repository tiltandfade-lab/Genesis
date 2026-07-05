/* dev/model-qa/creatures/rlm-humbaba.js — HUMBABA (lost-world, Huge, CR 8). Bark-skinned forest
   titan, roaring face of coiled intestine-like features per the epic's description. Read: a
   massive hulking bipedal titan built of gnarled bark-skin, a broad roaring mouth, and a face
   whose "features" are described in the epic as coiled entrail-like ropes across the visage —
   rendered as thick coiled ridges wrapping the face in place of normal features (no eye quads —
   the coils occlude where eyes would be). Whole-object grammar, one merged frame. Huge disc r=0.68. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildHumbaba(){
  const P = {
    bark:0x4a3c28, barkDk:0x30261a, barkLt:0x655036,
    moss:0x556b3f, mossDk:0x3a4d2a,
    coil:0x7a4a3a, coilDk:0x522f24, coilLt:0x93604a,      // entrail-coil face features
    mouth:0x241a14, tooth:0xb8a984,
    claw:0x201812,
    disc:0x3f3626, discTop:0x4d4230,
  };

  const spY = 0.85;
  /* ---------- LEGS — massive, tree-trunk-thick, planted wide. ---------- */
  for(const s of [-1,1]){
    const hip = V(s*0.20, 0.82, 0);
    const knee = V(s*0.23, 0.42, 0.05);
    const foot = V(s*0.24, 0.04, 0.10);
    tube(hip, knee, 0.170, 0.140, 8, P.bark);
    tube(knee, foot, 0.140, 0.160, 8, P.barkDk, {capB:{hex:P.barkDk, lift:0.02}});
    // gnarled bark ridges on the shin
    quad(V(s*0.24-0.04,0.30,0.14), V(s*0.24+0.04,0.30,0.14), V(s*0.24+0.03,0.18,0.16), V(s*0.24-0.03,0.18,0.16), P.barkDk, 0.06);
    // toes
    for(const dx of [-0.06,0,0.06]){
      const tb = V(s*0.24+dx, 0.05, 0.16);
      const tt = V(s*0.24+dx, 0.02, 0.24);
      tube(tb, tt, 0.045, 0.02, 5, P.barkDk, {capB:{hex:P.claw, lift:0.006}});
    }
  }

  /* ---------- TORSO — huge barrel chest/gut, gnarled bark plates, mossy patches. ---------- */
  {
    const n=10, ph=Math.PI/n;
    const bands=[
      {y:0.78, rx:0.29, hex:P.bark},
      {y:1.05, rx:0.33, hex:P.barkLt},
      {y:1.32, rx:0.30, hex:P.bark},
      {y:1.55, rx:0.22, hex:P.barkDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx*0.85, n, ph));
    stitch(rings, b=>bands[b].hex);
    // moss patches
    for(const [y,z] of [[1.15,0.22],[0.90,-0.24]]){
      quad(V(-0.10,y,z), V(0.10,y,z), V(0.08,y-0.08,z+0.04), V(-0.08,y-0.08,z+0.04), P.moss, 0.10);
    }
    // deep bark cracks
    for(let i=0;i<3;i++){
      const y=0.95+i*0.18;
      quad(V(-0.02,y,0.28), V(0.02,y,0.28), V(0.015,y-0.10,0.26), V(-0.015,y-0.10,0.26), P.barkDk, 0.05);
    }
  }

  /* ---------- ARMS — thick, gnarled, one raised roaring/threatening, one low with claws. ---------- */
  for(const s of [-1,1]){
    const sh = V(s*0.28, 1.42, 0.05);
    const el = V(s*0.42, 1.10, 0.10 + (s>0?0.10:0));
    const hd = s>0 ? V(0.50, 1.55, 0.30) : V(-0.46, 0.80, 0.20);
    tube(sh, el, 0.135, 0.105, 7, P.bark);
    tube(el, hd, 0.105, 0.085, 7, P.barkDk, {capB:{hex:P.barkDk, lift:0.02}});
    for(let i=0;i<3;i++){
      const dx=(i-1)*0.05;
      const cb = V(hd.x+dx, hd.y-0.03, hd.z+0.02);
      const ct = V(hd.x+dx*1.4, hd.y-0.12, hd.z+0.14);
      tube(cb, ct, 0.028, 0.010, 4, P.claw, {capB:{hex:P.claw, lift:0.006}});
    }
  }

  /* ---------- HEAD — massive roaring face; "features" are coiled entrail-like ridges across it. -- */
  {
    const n=10, ph=Math.PI/n;
    const bands2=[
      {y:1.60, cz:0.02, rx:0.235, rz:0.245, hex:P.bark},
      {y:1.80, cz:0.03, rx:0.255, rz:0.260, hex:P.barkLt},
      {y:2.00, cz:0.00, rx:0.205, rz:0.210, hex:P.barkDk},
    ];
    const rings = bands2.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands2[b].hex);
    capFan(rings.at(-1), V(0,2.03,0.00), P.barkDk);
    capFan(rings[0], V(0,1.56,0.02), P.barkDk, true);

    /* ---- COILED ENTRAIL-RIDGE FEATURES — thick ropes wrapping the face where features would be --- */
    const coilPaths = [
      // brow-crossing coil (occludes where eyes/brow would sit)
      [V(-0.20,1.90,0.20), V(-0.06,1.94,0.26), V(0.06,1.90,0.26), V(0.20,1.86,0.20)],
      // cheek/nose coil looping down the center
      [V(0.0,1.86,0.28), V(-0.04,1.75,0.30), V(0.05,1.66,0.29), V(0.0,1.58,0.26)],
      // second brow coil, lower, crossing the first
      [V(-0.18,1.78,0.24), V(0.0,1.80,0.30), V(0.18,1.76,0.22)],
      // jaw-wrapping coil
      [V(-0.16,1.62,0.22), V(0.0,1.56,0.27), V(0.16,1.60,0.20)],
    ];
    for(const path of coilPaths){
      for(let i=0;i<path.length-1;i++){
        tube(path[i], path[i+1], 0.032, 0.028, 6, (i%2? P.coil : P.coilLt), {phase:Math.PI/6});
      }
      tube(path[0],path[0], 0,0,1,P.coil); // no-op guard (kept for symmetry; harmless zero-tri)
    }

    // ROARING MOUTH — wide gaping maw beneath the coils
    quad(V(-0.13,1.60,0.30), V(0.13,1.60,0.30), V(0.10,1.44,0.28), V(-0.10,1.44,0.28), P.mouth, 0.05);
    for(let i=0;i<5;i++){
      const t=i/4, tx=(t-0.5)*0.20;
      quad(V(tx-0.014,1.595,0.295), V(tx+0.014,1.595,0.295), V(tx+0.01,1.55,0.29), V(tx-0.01,1.55,0.29), P.tooth, 0.04);
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
