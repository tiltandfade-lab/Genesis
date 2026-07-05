/* dev/model-qa/creatures/rlm-chrome-ganger-lieutenant.js — CHROME-GANGER LIEUTENANT (chrome,
   Medium humanoid, CR 4). Read: a showboating lieutenant — lean, flashy armor over a leather
   base, twin ARC-BLADES crackling in each hand (short energy-edged short-swords, not guns),
   a swept mohawk-crest helmet vent, cocky asymmetric shoulder trim. Chrome register: cracked
   white/gunmetal plate + a hot cyan-white arc glow at both blades. NO eye quads — a single
   flat visor band. Whole-object grammar: one function, one frame, no anchors. Medium size,
   base disc r=0.42. Wide showy stance, blades held out to the sides. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildChromeGangerLieutenant(){
  const P = {
    leather:0x453528, leatherDk:0x2a2018, leatherLt:0x5a4736,
    plate:0xc7cbce, plateDk:0x898d90, plateLt:0xe2e4e6,
    skin:0x8f6f52, skinDk:0x63482f,
    visor:0x2c3236, visorGlow:0x6fd8f0,
    crest:0xa02838, crestDk:0x6a1a24,
    arc:0x7fe8f5, arcDk:0x2c8a98, hilt:0x3a3e42,
    boot:0x1e1a16, disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    hip:   V(0, 0.62, 0),
    waist: V(0, 0.80, 0.01),
    chest: V(0, 1.02, -0.01),
    neck:  V(0, 1.18, 0),
    headB: V(0, 1.22, 0),
    headT: V(0, 1.40, 0),
  };

  /* torso — lean build, flashy plate over leather */
  tube(S.hip, S.waist, 0.155, 0.145, 8, P.leather, {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.145, 0.185, 8, P.leatherDk, {phase:Math.PI/8});
  tube(S.chest, S.neck, 0.185, 0.092, 8, P.leather, {phase:Math.PI/8, capB:{hex:P.leatherDk, lift:0.01}});
  /* angular chest plate, cracked white, riveted trim */
  quad(V(-0.145,0.90,0.15), V(0.145,0.90,0.15), V(0.115,1.11,0.14), V(-0.115,1.11,0.14), P.plate, 0.05);
  quad(V(-0.10,0.70,0.165), V(0.10,0.70,0.165), V(0.085,0.88,0.15), V(-0.085,0.88,0.15), P.plateDk, 0.05);
  /* asymmetric showy shoulder trim — flared left pauldron, bare right shoulder */
  quad(V(-0.15,1.06,-0.02), V(-0.30,1.10,-0.02), V(-0.27,0.90,0.04), V(-0.14,0.94,0.04), P.plateLt, 0.06);
  quad(V(-0.30,1.10,-0.02), V(-0.34,1.02,-0.02), V(-0.30,0.90,0.02), V(-0.27,0.90,0.04), P.plateDk, 0.05);

  /* head — swept mohawk-crest helmet vent, single flat visor band, no eye quads */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y, rx:0.098, rz:0.092, hex:P.skinDk},
      {y:S.headB.y+0.09, rx:0.104, rz:0.096, hex:P.skin},
      {y:S.headT.y-0.03, rx:0.092, rz:0.084, hex:P.plateDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.headT.y,0), P.plateDk);
    /* visor band */
    quad(V(-0.075,S.headT.y-0.11,0.075), V(0.075,S.headT.y-0.11,0.075), V(0.068,S.headT.y-0.14,0.07), V(-0.068,S.headT.y-0.14,0.07), P.visor, 0.05);
    quad(V(-0.05,S.headT.y-0.12,0.078), V(0.05,S.headT.y-0.12,0.078), V(0.045,S.headT.y-0.135,0.072), V(-0.045,S.headT.y-0.135,0.072), P.visorGlow, 0.08);
    /* swept mohawk crest running the crown, front to back */
    const crestPts = [[S.headB.y+0.14,0.06],[S.headT.y+0.02,0.0],[S.headT.y+0.05,-0.05],[S.headT.y-0.02,-0.10]];
    for(let i=0;i<crestPts.length-1;i++){
      const [y0,z0]=crestPts[i], [y1,z1]=crestPts[i+1];
      quad(V(-0.014,y0,z0), V(0.014,y0,z0), V(0.010,y1,z1), V(-0.010,y1,z1), P.crest, 0.06);
    }
  }

  /* arms — both bare-ish, ending in twin arc-blade hilts held OUT to the sides, showboating */
  {
    const armBlade=(sx)=>{
      const sh = V(sx*0.185, 0.98, 0);
      const el = V(sx*0.30, 0.82, 0.10);
      const hn = V(sx*0.42, 0.86, 0.18);
      tube(sh, el, 0.062, 0.052, 6, P.leather, {phase:Math.PI/6});
      tube(el, hn, 0.050, 0.038, 6, P.skinDk, {phase:Math.PI/6, capB:{hex:P.hilt, lift:0.015}});
      /* hilt + short energy-edged arc-blade, angled outward, crackling glow */
      const hiltT = V(hn.x+sx*0.03, hn.y+0.01, hn.z+0.02);
      const bladeMid = V(hn.x+sx*0.16, hn.y+0.09, hn.z+0.10);
      const bladeTip = V(hn.x+sx*0.30, hn.y+0.16, hn.z+0.16);
      tube(hn, hiltT, 0.028, 0.022, 5, P.hilt);
      tube(hiltT, bladeMid, 0.022, 0.014, 5, P.arc, {capA:{hex:P.arcDk}});
      tube(bladeMid, bladeTip, 0.014, 0.003, 5, P.arc, {capB:{hex:P.arc, lift:0.004}});
      /* glow flare quad along the blade edge */
      quad(V(hiltT.x,hiltT.y+0.02,hiltT.z), V(bladeMid.x,bladeMid.y+0.015,bladeMid.z), V(bladeTip.x,bladeTip.y+0.008,bladeTip.z), V(bladeTip.x,bladeTip.y,bladeTip.z), P.arcDk, 0.1);
    };
    armBlade(-1); armBlade(1);
  }

  /* legs — wide showy stance, heavy boots */
  {
    const legPair=(sx)=>{
      const hipJ = V(sx*0.115, 0.60, 0);
      const knee = V(sx*0.155, 0.30, 0.03);
      const foot = V(sx*0.16, 0.03, 0.10);
      tube(hipJ, knee, 0.088, 0.062, 6, P.leatherDk, {phase:Math.PI/6});
      tube(knee, foot, 0.062, 0.046, 6, P.leather, {phase:Math.PI/6, capB:{hex:P.boot, lift:0.02}});
      quad(V(sx*0.16-0.055,0.05,foot.z-0.06), V(sx*0.16+0.055,0.05,foot.z-0.06), V(sx*0.16+0.05,0.02,foot.z+0.09), V(sx*0.16-0.05,0.02,foot.z+0.09), P.boot, 0.03);
    };
    legPair(-1); legPair(1);
  }

  /* base disc (Medium: r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
