/* dev/model-qa/creatures/rlm-gilgameshs-shade.js — GILGAMESH'S SHADE (lost-world, Medium, CR 11).
   A once-great king's armored shade, bull-horned crown, still swinging for immortality. Read: an
   upright humanoid warrior-shade in tarnished bronze plate, semi-translucent-read smoky hem at
   the legs (achieved via darker fading tones, not real transparency), a bull-horned crown/helm
   (no eye quads — dark hollow sockets, a ghost-king), a massive two-handed bronze sword held
   ready. Whole-object grammar, one merged frame. Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGilgameshsShade(){
  const P = {
    bronze:0x8a6a3a, bronzeDk:0x5e4826, bronzeLt:0xa9895a,
    tarnish:0x3f4a3e,                                  // verdigris tarnish patches
    shade:0x3a3f4a, shadeDk:0x22262e, shadeLt:0x565d6a, // smoky ghost-fade at hem/edges
    horn:0x5a4a38, hornDk:0x362c20,
    skull:0x201f22,                                     // hollow sockets under the helm
    sword:0x9a9284, swordDk:0x625d52, hilt:0x4a3a28,
    disc:0x3a3f42, discTop:0x484e52,
  };

  const spY = 0.60;
  /* ---------- LEGS — fading to smoky shade-tones toward the ground (ghost-king). ---------- */
  {
    const hipY=0.56, kneeY=0.28, footY=0.03;
    for(const s of [-1,1]){
      const hip = V(s*0.09, hipY, 0);
      const knee = V(s*0.10, kneeY, 0.03);
      const foot = V(s*0.10, footY, 0.05);
      tube(hip, knee, 0.075, 0.060, 7, P.bronzeDk);
      tube(knee, foot, 0.058, 0.075, 7, P.shade, {capB:{hex:P.shadeDk, lift:0.01}});
    }
    // smoky hem skirt fading out at the boots
    quad(V(-0.16,0.30,0.06), V(0.16,0.30,0.06), V(0.20,0.06,0.10), V(-0.20,0.06,0.10), P.shadeDk, 0.10);
  }

  /* ---------- TORSO — tarnished bronze plate cuirass, broad kingly build. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:0.52, rx:0.150, hex:P.bronzeDk},
      {y:0.68, rx:0.170, hex:P.bronze},
      {y:0.84, rx:0.180, hex:P.bronzeLt},
      {y:0.98, rx:0.140, hex:P.bronzeDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx*0.82, n, ph));
    stitch(rings, b=>bands[b].hex);
    // tarnish verdigris patches on the cuirass
    for(const [y,z] of [[0.72,0.15],[0.88,-0.10]]){
      quad(V(-0.06,y,z), V(0.06,y,z), V(0.05,y-0.05,z+0.03), V(-0.05,y-0.05,z+0.03), P.tarnish, 0.08);
    }
    // engraved chest sigil band
    quad(V(-0.10,0.80,0.155), V(0.10,0.80,0.155), V(0.09,0.72,0.148), V(-0.09,0.72,0.148), P.bronzeDk, 0.05);
  }

  /* ---------- ARMS — one raised bearing the great bronze sword two-handed, one lower brace. ------ */
  {
    // sword arm (right, raised high, mid-swing)
    const sh1 = V(0.155, 0.95, 0.02);
    const el1 = V(0.30, 0.86, 0.14);
    const hd1 = V(0.26, 1.08, 0.28);
    tube(sh1, el1, 0.062, 0.050, 6, P.bronze);
    tube(el1, hd1, 0.050, 0.040, 6, P.bronzeDk, {capB:{hex:P.shadeDk, lift:0.01}});

    // brace arm (left, gripping the pommel low, two-handed hold)
    const sh2 = V(-0.155, 0.94, 0.02);
    const el2 = V(-0.16, 0.80, 0.16);
    const hd2 = V(0.02, 0.92, 0.30);
    tube(sh2, el2, 0.062, 0.050, 6, P.bronze);
    tube(el2, hd2, 0.050, 0.040, 6, P.bronzeDk, {capB:{hex:P.shadeDk, lift:0.01}});

    // GREAT BRONZE SWORD — two-handed, long broad blade, held ready mid-arc
    const hiltB = hd2, hiltT = hd1;
    tube(hiltB, hiltT, 0.024, 0.020, 6, P.hilt);
    const guardC = hd1;
    quad(V(guardC.x-0.09,guardC.y,guardC.z), V(guardC.x+0.09,guardC.y,guardC.z),
         V(guardC.x+0.07,guardC.y-0.03,guardC.z+0.02), V(guardC.x-0.07,guardC.y-0.03,guardC.z+0.02), P.swordDk, 0.05);
    const bladeB = guardC, bladeT = V(guardC.x-0.05, guardC.y+0.62, guardC.z+0.16);
    tube(bladeB, bladeT, 0.045, 0.010, 4, P.sword, {capB:{hex:P.sword, lift:0.01}});
    // fuller line down the blade
    quad(V(bladeB.x-0.006,bladeB.y+0.05,bladeB.z), V(bladeB.x+0.006,bladeB.y+0.05,bladeB.z),
         V(bladeT.x+0.004,bladeT.y-0.05,bladeT.z), V(bladeT.x-0.004,bladeT.y-0.05,bladeT.z), P.swordDk, 0.04);
    // pommel
    quad(V(hiltB.x-0.03,hiltB.y-0.02,hiltB.z), V(hiltB.x+0.03,hiltB.y-0.02,hiltB.z),
         V(hiltB.x+0.02,hiltB.y-0.06,hiltB.z+0.02), V(hiltB.x-0.02,hiltB.y-0.06,hiltB.z+0.02), P.bronzeDk, 0.05);
  }

  /* ---------- HEAD — bull-horned crown/helm, hollow sockets, ghost-king gravity. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands2=[
      {y:1.02, cz:0.00, rx:0.098, rz:0.100, hex:P.bronzeDk},
      {y:1.12, cz:0.01, rx:0.105, rz:0.105, hex:P.bronze},
      {y:1.22, cz:0.00, rx:0.085, rz:0.088, hex:P.bronzeLt},
    ];
    const rings = bands2.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands2[b].hex);
    capFan(rings.at(-1), V(0,1.24,0.00), P.bronzeLt);
    capFan(rings[0], V(0,1.00,0.00), P.shadeDk, true);

    // hollow sockets under the helm brow (no eye quads)
    for(const s of [-1,1]){
      const sx=s*0.04, sy=1.10, sz=0.095;
      quad(V(sx-0.022,sy+0.014,sz), V(sx+0.022,sy+0.014,sz), V(sx+0.018,sy-0.016,sz+0.006), V(sx-0.018,sy-0.016,sz+0.006), P.skull, 0.04);
    }
    // grim closed mouth line
    quad(V(-0.03,1.05,0.095), V(0.03,1.05,0.095), V(0.024,1.045,0.10), V(-0.024,1.045,0.10), P.skull, 0.04);

    // bull-horned crown — thick curling horns from the helm sides
    for(const s of [-1,1]){
      const hb = V(s*0.075, 1.20, -0.01);
      const hm = V(s*0.16, 1.28, -0.06);
      const ht = V(s*0.22, 1.24, -0.14);
      tube(hb, hm, 0.032, 0.020, 6, P.horn);
      tube(hm, ht, 0.020, 0.006, 6, P.hornDk, {capB:{hex:P.hornDk, lift:0.005}});
    }
    // gold-bronze circlet band across the brow
    const cb = ring(V(0,1.155,0.00), V(0,1,0), 0.100, 0.102, n, ph);
    const ct = ring(V(0,1.175,0.00), V(0,1,0), 0.095, 0.097, n, ph);
    stitch([cb,ct], ()=>P.bronzeLt);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
