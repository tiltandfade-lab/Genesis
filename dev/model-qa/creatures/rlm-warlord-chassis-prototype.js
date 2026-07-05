/* dev/model-qa/creatures/rlm-warlord-chassis-prototype.js — WARLORD CHASSIS PROTOTYPE (chrome,
   Large construct, CR 6). Read: an unfinished war-prototype — hulking heavy-frame silhouette,
   MISSING half its safety plating so raw actuator struts + exposed hydraulic lines show
   through gaps on one flank, a single massive prototype forearm-cannon replacing one hand,
   crude unpainted weld-seams. Chrome register: gunmetal armor + exposed copper-bronze
   hydraulics + a hot white-blue prototype-core glow leaking from the exposed chest cavity.
   NO eye quads — a single flat targeting-slit visor. Whole-object grammar: one function,
   one frame, no anchors. Large size, base disc r=0.55. Heavy blocky bipedal war-frame. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildWarlordChassisPrototype(){
  const P = {
    plate:0x7e8286, plateDk:0x4c5052, plateLt:0x9ea2a4,
    weld:0x35383a,
    strut:0x5c5448, hydraulic:0xa06a3a, hydraulicDk:0x603a1c,
    core:0xcfeeff, coreDk:0x5a9ac0,
    visor:0x22262a, visorGlow:0xbfeaff,
    boot:0x28241f, disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.86, 0),
    waist: V(0, 1.14, 0.02),
    chest: V(0, 1.48, -0.03),
    neck:  V(0, 1.72, 0),
    headB: V(0, 1.78, 0),
    headT: V(0, 2.02, 0),
  };

  /* torso — massive heavy war-frame, blocky stacked bands, unpainted weld seams at every joint */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:S.hip.y,   rx:0.245, rz:0.220, hex:P.plateDk},
      {y:S.waist.y, rx:0.260, rz:0.235, hex:P.plate},
      {y:S.chest.y, rx:0.310, rz:0.270, hex:P.plate},
      {y:S.neck.y,  rx:0.150, rz:0.135, hex:P.plateDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    /* weld seam rings at every join */
    for(const b of bands) quad(V(-b.rx,b.y,0), V(b.rx,b.y,0), V(b.rx*0.6,b.y+0.01,b.rz*0.6), V(-b.rx*0.6,b.y+0.01,b.rz*0.6), P.weld, 0.1);
  }

  /* MISSING PLATING — a torn-open gap on the left flank exposing raw actuator struts + hydraulic lines */
  {
    const gy0=1.02, gy1=1.42;
    quad(V(-0.30,gy0,0.08), V(-0.10,gy0,0.18), V(-0.10,gy1,0.20), V(-0.30,gy1,0.10), P.weld, 0.1); // torn edge shadow
    for(let i=0;i<3;i++){
      const y0=gy0+0.06+i*0.12, y1=y0+0.09;
      tube(V(-0.20,y0,0.14), V(-0.19,y1,0.15), 0.028, 0.024, 5, P.strut);
      tube(V(-0.15,y0-0.02,0.17), V(-0.14,y1+0.02,0.18), 0.016, 0.014, 4, P.hydraulic, {capA:{hex:P.hydraulicDk}, capB:{hex:P.hydraulicDk}});
    }
  }
  /* exposed prototype-core chest cavity glow, unfinished panel missing */
  quad(V(-0.06,1.30,0.24), V(0.10,1.30,0.24), V(0.09,1.50,0.22), V(-0.05,1.50,0.22), P.core, 0.1);
  quad(V(-0.03,1.34,0.245), V(0.06,1.34,0.245), V(0.05,1.46,0.225), V(-0.02,1.46,0.225), P.coreDk, 0.15);

  /* right flank still armored (unfinished asymmetry) */
  quad(V(0.10,1.02,0.18), V(0.30,1.05,0.10), V(0.32,1.44,0.12), V(0.12,1.42,0.20), P.plateLt, 0.05);

  /* head — blocky war-helm, single flat targeting-slit visor (no eye quads) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, rx:0.150, rz:0.135, hex:P.plateDk},
      {y:S.headB.y+0.14, rx:0.158, rz:0.142, hex:P.plate},
      {y:S.headT.y-0.04, rx:0.130, rz:0.115, hex:P.plateDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.plateDk);
    /* targeting-slit visor */
    quad(V(-0.11,S.headT.y-0.14,0.115), V(0.11,S.headT.y-0.14,0.115), V(0.10,S.headT.y-0.17,0.108), V(-0.10,S.headT.y-0.17,0.108), P.visor, 0.04);
    quad(V(-0.07,S.headT.y-0.15,0.118), V(0.07,S.headT.y-0.15,0.118), V(0.06,S.headT.y-0.16,0.11), V(-0.06,S.headT.y-0.16,0.11), P.visorGlow, 0.12);
  }

  /* arms — left arm a normal heavy plated fist, right arm replaced entirely by a massive
     prototype forearm-cannon (unfinished, wires trailing) */
  {
    const shL = V(-0.33, 1.52, 0);
    const elL = V(-0.38, 1.18, 0.08);
    const hnL = V(-0.34, 0.86, 0.14);
    tube(shL, elL, 0.115, 0.095, 7, P.plate, {phase:Math.PI/7});
    tube(elL, hnL, 0.092, 0.075, 7, P.plateDk, {phase:Math.PI/7, capB:{hex:P.weld, lift:0.02}});

    const shR = V(0.33, 1.52, 0);
    const elR = V(0.37, 1.16, 0.06);
    const cannonBase = V(0.34, 0.90, 0.10);
    tube(shR, elR, 0.115, 0.100, 7, P.plate, {phase:Math.PI/7});
    tube(elR, cannonBase, 0.098, 0.115, 7, P.strut);
    /* massive prototype cannon barrel */
    const barrelMid = V(0.33, 0.72, 0.30);
    const muzzle    = V(0.32, 0.68, 0.58);
    tube(cannonBase, barrelMid, 0.130, 0.100, 8, P.plateDk, {capA:{hex:P.weld}});
    tube(barrelMid, muzzle, 0.098, 0.075, 8, P.plate, {capB:{hex:P.coreDk, lift:0.01}});
    /* trailing exposed wire off the unfinished cannon mount */
    tube(V(0.30,0.94,0.14), V(0.24,0.80,0.20), 0.012, 0.008, 4, P.hydraulic, {capA:{hex:P.hydraulicDk}, capB:{hex:P.hydraulicDk}});
  }

  /* legs — heavy blocky war-frame stance, weld seams at hip/knee */
  {
    const legPair=(sx)=>{
      const hipJ = V(sx*0.17, 0.84, 0);
      const knee = V(sx*0.20, 0.42, 0.03);
      const foot = V(sx*0.21, 0.03, 0.14);
      tube(hipJ, knee, 0.145, 0.105, 7, P.plate, {phase:Math.PI/7});
      quad(V(sx*0.20-0.02,0.44,0.08), V(sx*0.20+0.02,0.44,0.08), V(sx*0.20+0.018,0.48,0.07), V(sx*0.20-0.018,0.48,0.07), P.weld, 0.1);
      tube(knee, foot, 0.100, 0.078, 7, P.plateDk, {phase:Math.PI/7, capB:{hex:P.boot, lift:0.025}});
      quad(V(sx*0.21-0.08,0.05,foot.z-0.09), V(sx*0.21+0.08,0.05,foot.z-0.09), V(sx*0.21+0.075,0.02,foot.z+0.13), V(sx*0.21-0.075,0.02,foot.z+0.13), P.boot, 0.03);
    };
    legPair(-1); legPair(1);
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
