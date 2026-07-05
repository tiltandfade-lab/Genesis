/* dev/model-qa/creatures/rlm-piston-arm-enforcer.js — PISTON-ARM ENFORCER (ash, Medium
   construct/mutant-hybrid, CR 5). Read: a hydraulic-press bolted enforcer — a bulky
   humanoid frame with one (or both) forearms replaced by a scavenged factory hydraulic
   press ram, bolted directly through the flesh/plate at the elbow, riveted scrap-armor
   torso, a blank riot-welder helm for a head. VS-desaturated: ash-grime scrap plating,
   gunmetal press cylinder, dull hazard-yellow (faded, dirty) stripe accents. NO eye quads —
   a single horizontal welder-visor slit instead. Whole-object grammar: one function, one
   frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildPistonArmEnforcer(){
  const P = {
    scrap:0x5a5448, scrapDk:0x363228, scrapLt:0x726c58,
    gun:0x40423e, gunDk:0x262824, gunLt:0x585a52,
    hazard:0x8a7a3e, hazardDk:0x5e5228,
    rivet:0x201d18, rust:0x7a4a30,
    visor:0x304038, visorDk:0x182018,
    hose:0x2a2622,
    disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.62, 0),
    waist: V(0, 0.90, -0.01),
    chest: V(0, 1.24, -0.02),
    neck:  V(0, 1.42, -0.02),
    headB: V(0, 1.48, -0.02),
  };
  tube(S.hip,   S.waist, 0.170, 0.150, 8, P.scrap,   {phase:Math.PI/8, capA:{hex:P.scrapDk, lift:0.02}});
  tube(S.waist, S.chest, 0.150, 0.210, 8, P.scrapDk, {phase:Math.PI/8});
  tube(S.chest, S.neck,  0.210, 0.095, 8, P.gun,     {phase:Math.PI/8});

  /* riveted scrap-armor chest plating */
  quad(V(-0.20,1.32,0.12), V(0.20,1.32,0.12), V(0.16,0.94,0.18), V(-0.16,0.94,0.18), P.scrapLt, 0.05);
  for(const [x,y] of [[-0.14,1.22],[0.14,1.22],[-0.12,1.02],[0.12,1.02]])
    quad(V(x-0.012,y,0.18), V(x+0.012,y,0.18), V(x+0.010,y-0.02,0.185), V(x-0.010,y-0.02,0.185), P.rivet, 0.02);
  /* faded hazard-stripe band across the chest */
  quad(V(-0.18,1.08,0.185), V(0.18,1.08,0.185), V(0.16,1.02,0.19), V(-0.16,1.02,0.19), P.hazard, 0.04);

  /* HEAD — blank riot-welder helm, single visor slit, no eye quads */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,      cz:0, rx:0.115, rz:0.118, hex:P.gunDk},
      {y:S.headB.y+0.14, cz:0.005, rx:0.125, rz:0.120, hex:P.gun},
      {y:S.headB.y+0.26, cz:0, rx:0.095, rz:0.090, hex:P.gunDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headB.y+0.32,0), P.gunDk);
    /* horizontal welder-visor slit */
    quad(V(-0.09,S.headB.y+0.15,0.11), V(0.09,S.headB.y+0.15,0.11), V(0.08,S.headB.y+0.10,0.115), V(-0.08,S.headB.y+0.10,0.115), P.visor, 0.03);
    quad(V(-0.07,S.headB.y+0.135,0.113), V(0.07,S.headB.y+0.135,0.113), V(0.06,S.headB.y+0.12,0.116), V(-0.06,S.headB.y+0.12,0.116), P.visorDk, 0.03);
    /* helm rivets */
    for(const s of [-1,1]) quad(V(s*0.11,S.headB.y+0.20,0.02), V(s*0.11+0.012,S.headB.y+0.20,0.02), V(s*0.11+0.010,S.headB.y+0.18,0.03), V(s*0.11-0.002,S.headB.y+0.18,0.03), P.rivet, 0.02);
  }

  /* LEGS — squat, plated, planted wide (heavy chassis stance) */
  {
    const leg=(hipX)=>{
      const hip=V(hipX,0.60,0), knee=V(hipX*1.08,0.32,0.04), foot=V(hipX*0.96,0.045,0.11);
      tube(hip,knee,0.100,0.078,7,P.scrap);
      tube(knee,foot,0.078,0.062,7,P.gunDk,{capB:{hex:P.gunDk, lift:0.01}});
    };
    leg(-0.11); leg(0.11);
  }

  /* ARMS — right arm normal (gripping/balance), LEFT forearm replaced by a bolted hydraulic
     press ram: shoulder+upper-arm flesh/plate, then a wide gunmetal cylinder ram bolted
     straight through at the elbow, ending in a flat crushing press-plate fist. */
  {
    const rsh=V(0.22,1.28,0), rel=V(0.30,1.00,0.08), rhd=V(0.26,0.70,0.12);
    tube(rsh,rel,0.098,0.076,6,P.scrap);
    tube(rel,rhd,0.076,0.058,6,P.scrapDk,{capB:{hex:P.scrapDk, lift:0.01}});

    const lsh=V(-0.22,1.28,0), lel=V(-0.30,1.00,0.08);
    tube(lsh,lel,0.098,0.080,6,P.scrap,{capB:{hex:P.gunDk, lift:0.015}});
    /* bolt collar where flesh meets the ram */
    const collarC = V(-0.30,1.00,0.08);
    const cr1=ring(collarC, V(0,1,0), 0.084, 0.084, 8, Math.PI/8);
    const cr2=ring(V(collarC.x,collarC.y-0.05,collarC.z), V(0,1,0), 0.090, 0.090, 8, Math.PI/8);
    stitch([cr1,cr2], ()=>P.rust);
    for(let i=0;i<8;i++){ const t=(i/8)*Math.PI*2;
      quad(V(collarC.x+Math.cos(t)*0.09,collarC.y-0.05,collarC.z+Math.sin(t)*0.09),
           V(collarC.x+Math.cos(t)*0.09+0.01,collarC.y-0.05,collarC.z+Math.sin(t)*0.09+0.01),
           V(collarC.x+Math.cos(t)*0.09+0.01,collarC.y-0.07,collarC.z+Math.sin(t)*0.09+0.01),
           V(collarC.x+Math.cos(t)*0.09,collarC.y-0.07,collarC.z+Math.sin(t)*0.09), P.rivet, 0.02); }
    /* the ram cylinder itself — wide, hard-edged, gunmetal, hazard stripe band */
    const ramB = V(-0.30, 0.95, 0.08);
    const ramT = V(-0.28, 0.58, 0.14);
    tube(ramB, ramT, 0.090, 0.075, 7, P.gun, {phase:Math.PI/7});
    const midY = (ramB.y+ramT.y)/2;
    quad(V(-0.36,midY,0.10), V(-0.20,midY,0.10), V(-0.19,midY-0.03,0.15), V(-0.35,midY-0.03,0.15), P.hazard, 0.04);
    /* hydraulic hoses running along the ram */
    tube(V(-0.36,0.98,0.06), V(-0.34,0.60,0.12), 0.014, 0.012, 4, P.hose);
    /* flat crushing press-plate fist */
    quad(V(-0.40,0.56,0.06), V(-0.16,0.56,0.06), V(-0.14,0.50,0.20), V(-0.42,0.50,0.20), P.gunLt, 0.04);
    quad(V(-0.38,0.52,0.08), V(-0.18,0.52,0.08), V(-0.16,0.48,0.19), V(-0.40,0.48,0.19), P.gunDk, 0.03);
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
