/* dev/model-qa/creatures/rlm-serpent-sworn-lamia-of-the-oasis-court.js — SERPENT-SWORN LAMIA OF
   THE OASIS COURT (lost-world, Large Monstrosity, CR 4). Read: a lamia — a regal humanoid torso
   (jeweled, court-adorned, arms open in welcome) fused at the waist to a long coiling serpent
   body, reclined as if holding court at a hidden oasis, tail coiled beneath her in loose rings.
   VS-desaturated antiquity register: sun-baked bronze skin, faded oasis-teal/gold court jewelry,
   dusty olive-scaled serpent coils. NO eye quads — dark kohl-rimmed sockets only. Whole-object
   grammar: one function, one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSerpentSwornLamiaOfTheOasisCourt(){
  const P = {
    skin:0x9c7654, skinDk:0x6e5238, skinLt:0xb6905e,        // sun-baked bronze skin
    scale:0x5c6042, scaleDk:0x3f4530, scaleLt:0x767a54,      // dusty olive serpent coils
    jewelTeal:0x3f7068, jewelGold:0x9c8348, jewelDk:0x2a4a44, // faded oasis-teal/gold jewelry
    hair:0x241d18, hairDk:0x161210,
    socket:0x1c1310, kohl:0x14100c, mouth:0x3a1e1a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* SPINE — reclined court posture; humanoid torso rising up from the coiled serpent waist */
  const spY = 0.66;   // serpent body carried low
  const S = {
    coilBase: V(0, spY-0.02, -0.60),
    waistJoin:V(0, spY+0.30, -0.10),      // where humanoid torso meets serpent body
    chest:    V(0.01, spY+0.62, 0.02),
    shldr:    V(0.01, spY+0.76, 0.04),
    neck:     V(0, spY+0.88, 0.02),
    headB:    V(0, spY+0.96, 0.0),
  };

  /* SERPENT LOWER BODY — long coiling tail, thick at the join, tapering, resting in loose rings */
  {
    const segs=[
      {p:S.waistJoin, r:0.26},
      {p:V(0.18, spY+0.10, -0.34), r:0.24},
      {p:V(0.34, spY-0.02, -0.62), r:0.20},
      {p:V(0.20, spY-0.06, -0.92), r:0.16},
      {p:V(-0.10, spY-0.04, -1.12), r:0.12},
      {p:V(-0.32, spY+0.02, -1.24), r:0.08},
      {p:V(-0.44, spY+0.05, -1.30), r:0.03},
    ];
    for(let i=0;i<segs.length-1;i++){
      const hex = (i%2===0)?P.scale:P.scaleDk;
      tube(segs[i].p, segs[i+1].p, segs[i].r, segs[i+1].r, 9, hex, {phase:Math.PI/9});
    }
    tube(segs.at(-2).p, segs.at(-1).p, segs.at(-2).r, segs.at(-1).r, 8, P.scaleDk, {capB:{hex:P.scaleDk, lift:0.004}});
    /* diamond scale-pattern belly stripe along the coil */
    for(let i=0;i<3;i++){
      const t=segs[i].p, u=segs[i+1].p;
      quad(V(t.x-0.06,t.y-segs[i].r*0.7,t.z), V(t.x+0.06,t.y-segs[i].r*0.7,t.z),
           V(u.x+0.05,u.y-segs[i+1].r*0.7,u.z), V(u.x-0.05,u.y-segs[i+1].r*0.7,u.z), P.scaleLt, 0.05);
    }
  }

  /* HUMANOID TORSO — bare bronze skin, court-jeweled, feminine build, welcoming posture */
  tube(S.waistJoin, S.chest, 0.235, 0.170, 9, P.skin,   {phase:Math.PI/9});
  tube(S.chest,      S.shldr, 0.170, 0.135, 8, P.skinLt,{phase:Math.PI/8});
  tube(S.shldr,      S.neck,  0.070, 0.052, 6, P.skinDk,{phase:Math.PI/6});
  /* jeweled belt-band at the waist join (humanoid meets serpent) */
  {
    const r1=ring(V(0,spY+0.30,-0.10), V(0,1,0), 0.24, 0.24, 10, Math.PI/10);
    const r2=ring(V(0,spY+0.34,-0.08), V(0,1,0), 0.235,0.235,10, Math.PI/10);
    stitch([r1,r2], ()=>P.jewelGold);
  }
  for(let i=0;i<5;i++){
    const ang=(i/5)*Math.PI*2;
    const x=Math.cos(ang)*0.235, z=-0.09+Math.sin(ang)*0.235;
    quad(V(x-0.02,spY+0.31,z-0.02), V(x+0.02,spY+0.31,z+0.02), V(x+0.015,spY+0.35,z+0.015), V(x-0.015,spY+0.35,z-0.015), P.jewelTeal, 0.05);
  }

  /* HEAD — regal, kohl-rimmed dark sockets, dark hair, court jewelry at the brow */
  {
    const n=8, ph=Math.PI/n;
    const hY = spY+0.88;
    const bands=[
      {y:hY+0.02, cz:0.0,  rx:0.062,rz:0.062, hex:P.skinDk},
      {y:hY+0.08, cz:0.01, rx:0.068,rz:0.068, hex:P.skin},
      {y:hY+0.14, cz:0.0,  rx:0.058,rz:0.056, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,hY+0.18,0.0), P.hairDk);
    /* jaw */
    tube(V(0,hY+0.02,0.02), V(0,hY-0.05,0.01), 0.05,0.036,n,P.skin,{raz:0.055,rbz:0.038,phase:ph, capB:{hex:P.skinDk,lift:0.006}});
    /* kohl-rimmed dark sockets */
    for(const s of [-1,1]){
      quad(V(s*0.028,hY+0.075,0.055), V(s*0.046,hY+0.075,0.055), V(s*0.042,hY+0.05,0.052), V(s*0.032,hY+0.05,0.052), P.socket, 0.02);
      quad(V(s*0.024,hY+0.078,0.058), V(s*0.050,hY+0.078,0.058), V(s*0.048,hY+0.070,0.056), V(s*0.026,hY+0.070,0.056), P.kohl, 0.02);
    }
    /* faint welcoming smile-line */
    quad(V(-0.02,hY-0.03,0.06), V(0.02,hY-0.03,0.06), V(0.016,hY-0.04,0.062), V(-0.016,hY-0.04,0.062), P.mouth, 0.03);
    /* dark hair swept back, teal-gold court circlet */
    const hairTop=ring(V(0,hY+0.20,-0.02), V(0,1,0), 0.03,0.04,n,ph);
    const hairLow=ring(V(0,hY+0.06,-0.06), V(0,1,0), 0.075,0.09,n,ph);
    stitch([hairTop,hairLow], ()=>P.hair);
    quad(V(-0.05,hY+0.10,0.02), V(0.05,hY+0.10,0.02), V(0.045,hY+0.07,0.01), V(-0.045,hY+0.07,0.01), P.jewelGold, 0.04);
  }

  /* ARMS — open welcoming gesture, jeweled bracelets */
  {
    const welcomeArm=(x,sign)=>{
      const sh=V(x, spY+0.80, 0.0);
      const el=V(x*1.5, spY+0.62, 0.16);
      const wr=V(x*1.9, spY+0.66, 0.30);
      tube(sh, el, 0.048, 0.036, 6, P.skin);
      tube(el, wr, 0.032, 0.024, 6, P.skinLt, {capB:{hex:P.skin, lift:0.006}});
      quad(V(el.x-0.03,el.y+0.02,el.z), V(el.x+0.03,el.y+0.02,el.z), V(el.x+0.025,el.y-0.02,el.z+0.02), V(el.x-0.025,el.y-0.02,el.z+0.02), P.jewelTeal, 0.05);
    };
    welcomeArm(-0.135,-1); welcomeArm(0.135,1);
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
