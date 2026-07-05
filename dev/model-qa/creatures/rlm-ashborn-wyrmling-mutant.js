/* dev/model-qa/creatures/rlm-ashborn-wyrmling-mutant.js — ASHBORN WYRMLING MUTANT (ash,
   Large mutant Dragon-kin, CR 5). Read: a sun-cracking mutant reptile — a low-slung
   quadruped wyrmling body (kin to the giant-lizard grammar) but scorched/mutated: hide
   cracked into ash-grey scutes with glowing ember lines showing through the cracks, small
   vestigial stub wings on the shoulders (flightless, mutation not majesty), a heavy ridged
   tail, wide jaw with cracked scorch-lines running up the snout. VS-desaturated ash-grey
   hide with ember-crack glow bleeding through — a wyrmling gone wrong under a dying sun, not
   a proper dragon. NO eye quads. Whole-object grammar: one function, one frame, no anchors.
   Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildAshbornWyrmlingMutant(){
  const P = {
    hide:0x5c5648, hideDk:0x3c382c, hideLt:0x726c58,
    crack:0x282420,
    ember:0x9a4a1e, emberHot:0xc06428,
    belly:0x8a8474, bellyDk:0x64604e,
    snout:0x504a3c, mouth:0x241f18, tooth:0xc4b894,
    wing:0x4a4638, wingDk:0x2e2b22,
    claw:0x201d18,
    disc:0x4a4038, discTop:0x585047,
  };

  const spY = 0.42;
  const S = {
    tailBase: V(0, spY-0.02, -0.68),
    rump:     V(0, spY+0.03, -0.48),
    loin:     V(0, spY+0.05, -0.22),
    mid:      V(0, spY+0.05,  0.02),
    shldr:    V(0, spY+0.02,  0.28),
    neck:     V(0, spY-0.02,  0.50),
    headB:    V(0, spY-0.05,  0.64),
  };
  tube(S.rump,  S.loin,  0.250, 0.275, 9, P.hide,   {phase:Math.PI/9, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.275, 0.280, 9, P.hideDk, {phase:Math.PI/9});
  tube(S.mid,   S.shldr, 0.280, 0.250, 9, P.hide,   {phase:Math.PI/9});
  tube(S.shldr, S.neck,  0.250, 0.165, 9, P.hideDk, {phase:Math.PI/9});
  tube(S.neck,  S.headB, 0.165, 0.135, 9, P.hide,   {phase:Math.PI/9});

  /* pale ash-belly strip */
  {
    const by = spY-0.245;
    quad(V(-0.18,by,-0.42), V(0.18,by,-0.42), V(0.16,by+0.02,0.27), V(-0.16,by+0.02,0.27), P.belly, 0.05);
  }

  /* scorch-cracked scutes along the spine with ember glow bleeding through */
  {
    const seg = [[-0.46,spY+0.26],[-0.20,spY+0.28],[0.04,spY+0.28],[0.28,spY+0.24]];
    for(let i=0;i<seg.length;i++){
      const [z,y]=seg[i];
      quad(V(-0.03,y,z), V(0.03,y,z), V(0.026,y+0.05,z-0.01), V(-0.026,y+0.05,z-0.01), P.crack, 0.04);
      quad(V(-0.014,y+0.01,z), V(0.014,y+0.01,z), V(0.010,y+0.045,z-0.005), V(-0.010,y+0.045,z-0.005), P.ember, 0.10);
    }
    /* cracked hide patches scattered across the flanks, glowing faint ember at the seams */
    for(const [x,y,z] of [[0.20,spY+0.02,-0.10],[-0.22,spY,-0.30],[0.18,spY+0.03,0.14],[-0.16,spY-0.02,-0.02]]){
      quad(V(x-0.05,y+0.03,z), V(x+0.05,y+0.03,z), V(x+0.04,y-0.03,z+0.02), V(x-0.04,y-0.03,z+0.02), P.crack, 0.05);
      quad(V(x-0.02,y+0.01,z+0.005), V(x+0.02,y+0.01,z+0.005), V(x+0.016,y-0.01,z+0.02), V(x-0.016,y-0.01,z+0.02), P.emberHot, 0.10);
    }
  }

  /* HEAD — wide jaw, scorch-lines up the snout, no eye quads */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.08, cz:0.66, rx:0.135, rz:0.140, hex:P.hide},
      {y:spY-0.03, cz:0.69, rx:0.155, rz:0.145, hex:P.hide},
      {y:spY+0.01, cz:0.66, rx:0.125, rz:0.112, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+0.03,0.66), P.hideDk);

    const snB = V(0, spY-0.09, 0.66);
    const snM = V(0, spY-0.11, 0.79);
    const snT = V(0, spY-0.125,0.90);
    tube(snB, snM, 0.125, 0.090, n, P.snout, {raz:0.10, rbz:0.068, phase:ph});
    tube(snM, snT, 0.090, 0.054, n, P.snout, {raz:0.068, rbz:0.038, phase:ph, capB:{hex:P.mouth, lift:0.008}});
    /* scorch-crack lines running up the snout to the brow, glowing */
    quad(V(-0.006,spY-0.02,0.68), V(0.006,spY-0.02,0.68), V(0.005,spY-0.10,0.86), V(-0.005,spY-0.10,0.86), P.crack, 0.05);
    quad(V(-0.003,spY-0.02,0.685), V(0.003,spY-0.02,0.685), V(0.0025,spY-0.10,0.855), V(-0.0025,spY-0.10,0.855), P.emberHot, 0.10);

    quad(V(-0.09,spY-0.14,0.70), V(0.09,spY-0.14,0.70), V(0.054,spY-0.145,0.88), V(-0.054,spY-0.145,0.88), P.mouth, 0.03);
    for(let i=-1;i<=1;i++) quad(V(i*0.04-0.012,spY-0.135,0.85), V(i*0.04+0.012,spY-0.135,0.85), V(i*0.04+0.009,spY-0.15,0.85), V(i*0.04-0.009,spY-0.15,0.85), P.tooth, 0.03);
  }

  /* VESTIGIAL STUB WINGS — small, mutation not majesty, folded flat against the flanks */
  {
    const stubWing=(sx)=>{
      const base = V(sx*0.20, spY+0.16, 0.10);
      const tip  = V(sx*0.42, spY+0.06, -0.10);
      /* membrane as a flattened triangle-ish quad */
      quad(V(base.x,base.y,base.z), V(sx*0.34,spY+0.20,-0.02), V(tip.x,tip.y,tip.z), V(sx*0.24,spY+0.04,0.12), P.wing, 0.06);
      /* a small strut bone along the leading edge */
      tube(base, tip, 0.020, 0.008, 4, P.wingDk, {capB:{hex:P.wingDk, lift:0.004}});
    };
    stubWing(-1); stubWing(1);
  }

  /* LEGS — sprawling reptile stance (wyrmling-lizard kin grammar) */
  {
    const sprawlLeg=(shoulder, footX, footZ, hex)=>{
      const elbowX = shoulder.x + Math.sign(shoulder.x)*0.21;
      const elbow = V(elbowX, spY-0.10, shoulder.z + (footZ>shoulder.z?0.04:-0.04));
      const foot  = V(footX, 0.06, footZ);
      tube(shoulder, elbow, 0.082, 0.060, 7, hex);
      tube(elbow, foot, 0.058, 0.040, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});
      const pad = V(foot.x, 0.03, foot.z+0.03);
      const side = Math.sign(foot.x||1);
      for(const [dx,dz] of [[side*0.06,0.02],[side*0.03,0.06],[-side*0.01,0.07],[-side*0.04,0.05]]){
        const cb = V(pad.x, 0.036, pad.z);
        const ct = V(pad.x+dx, 0.012, pad.z+dz+0.03);
        tube(cb, ct, 0.015, 0.005, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    sprawlLeg(V(-0.195, spY-0.02, 0.26), -0.44, 0.34, P.hide);
    sprawlLeg(V( 0.195, spY-0.02, 0.26),  0.44, 0.30, P.hide);
    sprawlLeg(V(-0.210, spY,     -0.42), -0.46,-0.36, P.hide);
    sprawlLeg(V( 0.210, spY,     -0.42),  0.46,-0.40, P.hide);
  }

  /* TAIL — long, heavy, ridged, tapering */
  {
    const t0 = S.tailBase;
    const t1 = V(0.05, spY-0.06, -0.96);
    const t2 = V(0.12, spY-0.12, -1.22);
    const t3 = V(0.22, 0.22,     -1.46);
    const t4 = V(0.34, 0.14,     -1.64);
    const tip= V(0.46, 0.075,    -1.78);
    tube(t0, t1, 0.155, 0.128, 8, P.hide,   {phase:Math.PI/8, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.128, 0.098, 8, P.hideDk, {phase:Math.PI/8});
    tube(t2, t3, 0.098, 0.066, 8, P.hide,   {phase:Math.PI/8});
    tube(t3, t4, 0.066, 0.038, 8, P.hideDk, {phase:Math.PI/8});
    tube(t4, tip,0.038, 0.010, 8, P.hide,   {phase:Math.PI/8, capB:{hex:P.hideDk, lift:0.006}});
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
