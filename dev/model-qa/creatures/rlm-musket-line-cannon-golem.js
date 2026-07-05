/* dev/model-qa/creatures/rlm-musket-line-cannon-golem.js — Musket-Line Cannon Golem
   (theater/musket era-lens, Large, CR 8). A field gun BOLTED onto a lumbering walking chassis — the
   long iron cannon barrel is the dominant silhouette, riding forward on a squat two-legged construct
   body with a carriage-wheel motif fused into its hips. Whole-object grammar: one merged frame, no
   anchors. VS-desaturated gunmetal + weathered oak-carriage palette (dull iron barrel, brass bands,
   dark oak carriage wood, worn wheel spokes). NO eye quads — inert war-machine, no face. Large size:
   base disc r=0.55. Abstracted, no nation markers.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMusketLineCannonGolem(){
  const P = {
    iron:0x35322c, ironLt:0x4e4a41, ironDk:0x211f1b,
    brass:0x8c7c40, brassDk:0x685c30,
    wood:0x5c4d3c, woodDk:0x3c3226, woodLt:0x6f5f4a,
    wheel:0x453a2c, wheelDk:0x2c2419,
    disc:0x453f34, discTop:0x524b3c,
  };

  /* ---------- LANDMARKS — squat chassis body ~0.9u tall, barrel riding forward at ~0.75u. ---------- */
  const L = {
    hipY:0.30, waistY:0.48, chestY:0.66, shldY:0.80,
  };

  /* ===== CHASSIS BODY — a blocky riveted iron torso/carriage-bed fused together, wide and low. ===== */
  {
    const bands=[
      {y:L.hipY-0.04, rx:0.26, rz:0.30, hex:P.ironDk},
      {y:L.waistY,    rx:0.29, rz:0.33, hex:P.iron},
      {y:L.chestY,    rx:0.31, rz:0.34, hex:P.ironLt},
      {y:L.shldY,     rx:0.26, rz:0.28, hex:P.iron},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, 8, Math.PI/8));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.shldY+0.08,0), P.ironLt);
    // riveted brass band around the chest
    { const r=ring(V(0,L.chestY-0.02,0), V(0,1,0), 0.315,0.345, 8, Math.PI/8);
      const r2=ring(V(0,L.chestY+0.05,0), V(0,1,0), 0.315,0.345, 8, Math.PI/8);
      stitch([r,r2], ()=>P.brass); }
  }

  /* ===== CARRIAGE-WHEEL HIPS — two big spoked timber wheels fused at the hips, both the construct's
     "legs" silhouette and its wheeled-carriage read, planted wide. ===== */
  {
    const wheelAt=(sign)=>{
      const cx = sign*0.34, cy = 0.20, cz = -0.02;
      const r1=ring(V(cx,cy,cz), V(1,0,0), 0.24, 0.24, 10, 0);
      const r2=ring(V(cx+sign*0.05,cy,cz), V(1,0,0), 0.24, 0.24, 10, 0);
      stitch([r1,r2], ()=>P.wheel);
      capFan(r1, V(cx-sign*0.01,cy,cz), P.wheelDk);
      capFan(r2, V(cx+sign*0.06,cy,cz), P.wheelDk, true);
      // spokes — thin quads from hub to rim
      for(let i=0;i<6;i++){
        const a = i/6*Math.PI*2;
        const rimY = cy + Math.cos(a)*0.20, rimZ = cz + Math.sin(a)*0.20;
        quad(V(cx-0.01,cy,cz), V(cx+0.01,cy,cz), V(cx+0.01,rimY,rimZ), V(cx-0.01,rimY,rimZ), P.wheelDk, 0.04);
      }
      // iron hub cap
      quad(V(cx-sign*0.02,cy-0.05,cz-0.05), V(cx-sign*0.02,cy+0.05,cz-0.05),
           V(cx-sign*0.02,cy+0.05,cz+0.05), V(cx-sign*0.02,cy-0.05,cz+0.05), P.iron, 0.03);
    };
    wheelAt(-1); wheelAt(1);
  }

  /* ===== SMALL SQUARE HEAD — set low/forward on the chassis, a riveted iron box, dwarfed by the
     barrel above it. No face — a plain iron block with a brass rivet row. ===== */
  {
    const cy = L.shldY+0.16, cz=0.10;
    const bands=[
      {y:cy-0.06, rx:0.105, rz:0.10, hex:P.iron},
      {y:cy+0.06, rx:0.095, rz:0.09, hex:P.ironLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,cz), V(0,1,0), b.rx, b.rz, 6, Math.PI/6));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,cy+0.09,cz), P.ironDk);
    for(const x of [-0.05,0.05]) quad(V(x-0.008,cy-0.02,cz+0.095),V(x+0.008,cy-0.02,cz+0.095),
      V(x+0.006,cy+0.02,cz+0.095),V(x-0.006,cy+0.02,cz+0.095), P.brass, 0.04);
  }

  /* ===== THE CANNON BARREL — the dominant silhouette element: a LONG heavy iron tube mounted
     forward at chest height, slightly muzzle-up, thick reinforcing brass bands, flared muzzle. ===== */
  {
    const root = V(0, L.chestY+0.02, 0.30);
    const mid  = V(0, L.chestY+0.10, 0.72);
    const muz  = V(0, L.chestY+0.16, 1.12);
    tube(root, mid, 0.145, 0.115, 10, P.iron, {phase:Math.PI/10});
    tube(mid, muz, 0.115, 0.095, 10, P.ironLt, {phase:Math.PI/10, capB:{hex:P.ironDk, lift:0.02}});
    // flared muzzle lip
    { const r1=ring(muz, V(0,0.07,0.997).normalize?V(0,0.07,1):V(0,0,1), 0.095,0.095, 10, Math.PI/10);
      const flare=V(muz.x, muz.y+0.01, muz.z+0.03);
      const r2=ring(flare, V(0,0,1), 0.12,0.12, 10, Math.PI/10);
      stitch([r1,r2], ()=>P.ironDk); capFan(r2, flare, P.ironDk); }
    // reinforcing brass bands along the barrel
    for(const t of [0.15,0.42,0.68]){
      const p = V(root.x+(muz.x-root.x)*t, root.y+(muz.y-root.y)*t, root.z+(muz.z-root.z)*t);
      const rad = 0.145+(0.095-0.145)*t + 0.012;
      const r1=ring(p, V(0,0,1), rad,rad, 10, Math.PI/10);
      const r2=ring(V(p.x,p.y,p.z+0.04), V(0,0,1), rad,rad, 10, Math.PI/10);
      stitch([r1,r2], ()=>P.brass);
    }
    // trunnion mounts (short stub cylinders) fixing the barrel to the chassis shoulders
    for(const s of [-1,1]) tube(V(s*0.10,L.chestY+0.02,0.28), V(s*0.22,L.chestY+0.02,0.28), 0.06,0.06, 6, P.ironDk);
  }

  /* ===== TWO STUMPY BRACE ARMS — short thick iron struts bracing the barrel down to the chassis,
     construct "arms" doubling as gun-carriage braces. ===== */
  {
    for(const s of [-1,1]){
      tube(V(s*0.20,L.chestY,0.30), V(s*0.16,L.waistY-0.04,0.20), 0.08,0.065, 6, P.ironDk);
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
