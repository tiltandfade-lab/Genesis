/* dev/model-qa/creatures/rlm-combat-medic-drone-corrupted.js — COMBAT MEDIC DRONE, CORRUPTED
   (chrome, Medium, CR 3). Read: a hovering triage drone — boxy chassis, a red cross-plate
   housing, twin stub repulsor pods — whose dispenser arm has fused a long serrated bayonet
   where the med-nozzle used to be. Cracked white/gunmetal plating, a live corrupted-red
   status glow instead of the old medical blue. NO eye quads — a single flat sensor-visor
   band. Whole-object grammar: one function, one frame, no anchors. Medium size, base disc
   r=0.42, hovering just off the disc. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildCombatMedicDroneCorrupted(){
  const P = {
    plate:0xc4c8ca, plateDk:0x84898b, plateLt:0xe0e2e3, crack:0x55585a,
    cross:0x8a2020, crossDk:0x5c1414,
    gunmetal:0x54585c, gunmetalDk:0x35383b,
    visor:0x902020, visorGlow:0xd83838,
    glow:0xe23a3a, glowDk:0x7a1818,
    blade:0x8d9296, bladeDk:0x585c60, bladeEdge:0xd8dadc,
    disc:0x4a4038, discTop:0x585047,
  };

  const hover = 0.30; // hull floats above the disc
  const S = {
    base:  V(0, hover+0.10, 0),
    body:  V(0, hover+0.30, 0),
    top:   V(0, hover+0.46, 0),
  };

  /* boxy chassis body — stacked wide rings, flattened box-ish silhouette */
  {
    const n=8, ph=Math.PI/8;
    const bands=[
      {y:S.base.y,  rx:0.170, rz:0.150, hex:P.plateDk},
      {y:S.body.y-0.06, rx:0.230, rz:0.200, hex:P.plate},
      {y:S.body.y+0.08, rx:0.230, rz:0.200, hex:P.plate},
      {y:S.top.y,   rx:0.150, rz:0.130, hex:P.plateDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.top.y+0.05,0), P.gunmetalDk);
    capFan(rings[0], V(0,S.base.y-0.05,0), P.gunmetalDk, true);
  }

  /* cracked red cross-plate housing on the chest face */
  {
    const cy=S.body.y, cz=0.205;
    quad(V(-0.10,cy+0.10,cz), V(0.10,cy+0.10,cz), V(0.10,cy+0.14,cz), V(-0.10,cy+0.14,cz), P.cross, 0.05);
    quad(V(-0.03,cy-0.02,cz), V(0.03,cy-0.02,cz), V(0.03,cy+0.22,cz), V(-0.03,cy+0.22,cz), P.cross, 0.04);
    quad(V(-0.13,cy+0.08,cz), V(0.13,cy+0.08,cz), V(0.13,cy+0.13,cz), V(-0.13,cy+0.13,cz), P.cross, 0.04);
    /* crack lines through the housing (corruption) */
    quad(V(-0.02,cy+0.22,cz+0.002), V(0.01,cy+0.22,cz+0.002), V(0.05,cy-0.05,cz+0.002), V(0.02,cy-0.05,cz+0.002), P.crack, 0.06);
    quad(V(-0.13,cy+0.10,cz+0.002), V(-0.07,cy+0.09,cz+0.002), V(-0.05,cy+0.06,cz+0.002), V(-0.11,cy+0.07,cz+0.002), P.crack, 0.06);
  }

  /* sensor-visor band — single flat band, no eye quads, glowing corrupted red */
  {
    const vy=S.top.y-0.06, vz=0.148;
    quad(V(-0.11,vy,vz), V(0.11,vy,vz), V(0.10,vy-0.035,vz-0.005), V(-0.10,vy-0.035,vz-0.005), P.visor, 0.05);
    quad(V(-0.075,vy-0.008,vz+0.002), V(0.075,vy-0.008,vz+0.002), V(0.068,vy-0.024,vz-0.002), V(-0.068,vy-0.024,vz-0.002), P.visorGlow, 0.08);
  }

  /* twin stub repulsor pods on the flanks */
  for(const s of [-1,1]){
    const pc = V(s*0.245, S.body.y-0.02, -0.02);
    const r1=ring(pc, V(1,0,0), 0.075, 0.075, 7, Math.PI/7);
    const r2=ring(V(pc.x+s*0.06,pc.y,pc.z), V(1,0,0), 0.062, 0.062, 7, Math.PI/7);
    stitch([r1,r2], ()=>P.gunmetal);
    capFan(r2, V(pc.x+s*0.08,pc.y,pc.z), P.gunmetalDk);
    /* underglow ring, thrust vents */
    quad(V(pc.x+s*0.055,pc.y-0.05,pc.z-0.04), V(pc.x+s*0.055,pc.y-0.05,pc.z+0.04), V(pc.x+s*0.075,pc.y-0.07,pc.z+0.03), V(pc.x+s*0.075,pc.y-0.07,pc.z-0.03), P.glow, 0.1);
  }

  /* dispenser arm — left arm intact (short stub manipulator); right arm fused with a long
     serrated bayonet where the med-nozzle dispenser head used to be */
  {
    const shL = V(-0.20, S.body.y+0.02, 0.05);
    const hnL = V(-0.26, S.body.y-0.10, 0.16);
    tube(shL, hnL, 0.045, 0.032, 6, P.gunmetal, {capB:{hex:P.gunmetalDk, lift:0.012}});

    const shR = V(0.20, S.body.y+0.02, 0.05);
    const elR = V(0.27, S.body.y-0.04, 0.20);
    const armT = V(0.24, S.body.y-0.02, 0.34);
    tube(shR, elR, 0.050, 0.040, 6, P.gunmetal);
    tube(elR, armT, 0.038, 0.026, 6, P.gunmetalDk);
    /* the old dispenser-nozzle collar, cracked, still visible at the base of the bayonet */
    {
      const r1=ring(armT, V(0,0,1), 0.030, 0.030, 6, Math.PI/6);
      const r2=ring(V(armT.x,armT.y,armT.z+0.03), V(0,0,1), 0.026, 0.026, 6, Math.PI/6);
      stitch([r1,r2], ()=>P.crossDk);
    }
    /* SERRATED BAYONET — long tapering blade fused straight out where the nozzle head was */
    const bladeBase = V(armT.x, armT.y, armT.z+0.03);
    const bladeMid  = V(armT.x-0.01, armT.y+0.01, armT.z+0.28);
    const bladeTip  = V(armT.x-0.02, armT.y+0.015, armT.z+0.50);
    tube(bladeBase, bladeMid, 0.034, 0.022, 5, P.blade, {raz:0.010, rbz:0.007});
    tube(bladeMid, bladeTip, 0.022, 0.004, 5, P.bladeEdge, {raz:0.007, rbz:0.002, capB:{hex:P.bladeEdge, lift:0.004}});
    /* serration teeth along one edge */
    for(let i=0;i<5;i++){
      const t=i/4, bx=bladeBase.x+(bladeMid.x-bladeBase.x)*t, by=bladeBase.y+(bladeMid.y-bladeBase.y)*t, bz=bladeBase.z+(bladeMid.z-bladeBase.z)*t;
      quad(V(bx-0.024,by,bz), V(bx-0.016,by,bz+0.01), V(bx-0.024,by,bz+0.03), V(bx-0.030,by,bz+0.015), P.bladeDk, 0.05);
    }
  }

  /* base disc (Medium: r=0.42) — the drone hovers above it */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
    /* faint shadow-glow spot under the hover point */
    quad(V(-0.10,0.049,-0.10), V(0.10,0.049,-0.10), V(0.09,0.049,0.09), V(-0.09,0.049,0.09), P.glowDk, 0.1);
  }
}
