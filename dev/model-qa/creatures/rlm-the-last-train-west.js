/* dev/model-qa/creatures/rlm-the-last-train-west.js — THE LAST TRAIN WEST (frontier,
   construct colossus, Gargantuan, CR 17). Read: an armored freight-train given a striding,
   many-legged locomotive body — a long low iron boiler-barrel torso with a cowcatcher
   "face," a smokestack rising off the front like a horn, riveted iron plating, and SIX
   short piston-driven legs along its underside (like train wheels turned into legs) that
   carry it in a striding gait. Frontier register: rust-black iron, brass fittings, dry
   dust kicked off the wheels/legs. NO eye quads — a dark rectangular cowcatcher grille for
   a "face," no other face detail. Whole-object grammar: one function, one frame, no
   anchors. Gargantuan size, base disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheLastTrainWest(){
  /* ---------- PALETTE (VS desaturated; rust-black iron, brass fittings, dusty steel) ---------- */
  const P = {
    iron:0x3a3632, ironDk:0x201e1c, ironLt:0x4e4a44,
    rust:0x6b4630, rustDk:0x452c1e,
    brass:0x8a6b34, brassDk:0x5c4620,
    rivet:0x14120f, grille:0x0e0d0b,
    smoke:0x5a544c, smokeDk:0x322e29,
    dust:0xb8a37e,
    disc:0x4a4038, discTop:0x585047,
  };

  const spY = 0.62;   /* spine height — a long low boiler-barrel body */

  /* ---------- landmarks along the long body axis (+z front, -z rear) ---------- */
  const S = {
    rear:   V(0, spY,      -1.35),
    boiler1:V(0, spY+0.02, -0.80),
    boiler2:V(0, spY+0.03, -0.20),
    boiler3:V(0, spY+0.02,  0.45),
    frontB: V(0, spY-0.02,  0.95),
    nose:   V(0, spY-0.08,  1.25),
  };

  /* ---------- MAIN BOILER-BARREL BODY — one long iron loft, front to rear ---------- */
  tube(S.rear,    S.boiler1, 0.34, 0.42, 12, P.iron,   {phase:Math.PI/12, capA:{hex:P.ironDk, lift:0.02}});
  tube(S.boiler1, S.boiler2, 0.42, 0.46, 12, P.ironLt, {phase:Math.PI/12});
  tube(S.boiler2, S.boiler3, 0.46, 0.42, 12, P.iron,   {phase:Math.PI/12});
  tube(S.boiler3, S.frontB,  0.42, 0.34, 12, P.ironDk, {phase:Math.PI/12});
  tube(S.frontB,  S.nose,    0.34, 0.22, 12, P.iron,   {phase:Math.PI/12});

  /* ---------- RIVETED IRON PLATING — rings of dark rivets studding the boiler ---------- */
  {
    const rivetRing=(cz, r, n)=>{
      for(let i=0;i<n;i++){
        const t=(i/n)*Math.PI*2;
        const cx=Math.cos(t)*r*0.94, cyOff=Math.sin(t)*r*0.94;
        const c=V(cx, spY+cyOff*0.55, cz);
        quad(c.clone().add(V(-0.015,0.015,0)), c.clone().add(V(0.015,0.015,0)),
             c.clone().add(V(0.012,-0.015,0)), c.clone().add(V(-0.012,-0.015,0)), P.rivet, 0.02);
      }
    };
    rivetRing(-0.95, 0.40, 10);
    rivetRing(-0.45, 0.44, 11);
    rivetRing(0.05,  0.44, 11);
    rivetRing(0.55,  0.40, 10);
    rivetRing(0.85,  0.32, 9);
  }

  /* ---------- SMOKESTACK — rises off the front like a horn ---------- */
  {
    const b0=V(0.05, spY+0.42, 0.55), b1=V(0.05, spY+0.85, 0.50), b2=V(0.05, spY+1.05, 0.48);
    tube(b0,b1,0.13,0.155,8,P.ironDk);
    tube(b1,b2,0.155,0.17,8,P.iron, {capB:{hex:P.ironDk, lift:0.02}});
    /* rising smoke wisps off the stack top */
    const smB=V(0.05, spY+1.10, 0.48), smM=V(0.02, spY+1.45, 0.40), smT=V(-0.05, spY+1.75, 0.30);
    tube(smB,smM,0.10,0.06,6,P.smoke);
    tube(smM,smT,0.06,0.02,6,P.smokeDk, {capB:{hex:P.smokeDk, lift:0.01}});
  }

  /* ---------- BRASS FITTINGS — bands + a headlamp-like brass ring near the nose ---------- */
  {
    const n=10, ph=Math.PI/10;
    const b=ring(V(0,spY-0.02,0.85), V(0,0,1), 0.36, 0.36, n, ph);
    const b2=ring(V(0,spY-0.02,0.90), V(0,0,1), 0.36, 0.36, n, ph);
    stitch([b,b2], ()=>P.brass);
    /* a small brass lamp-knob on the nose bridge */
    const lb=V(0,spY+0.20,1.05), lt=V(0,spY+0.20,1.16);
    tube(lb,lt,0.06,0.05,7,P.brass,{capB:{hex:P.brassDk, lift:0.01}});
  }

  /* ---------- COWCATCHER "FACE" — angled iron slats fanning forward off the nose, with a
     dark rectangular grille where a face would be (no eyes) ---------- */
  {
    const apex=S.nose.clone();
    const slat=(dx,dz,w)=>{
      const base=apex.clone().add(V(dx*0.02, -0.10, -0.05));
      const tip=apex.clone().add(V(dx, -0.35, dz));
      quad(base.clone().add(V(-w,0,0)), base.clone().add(V(w,0,0)),
           tip.clone().add(V(w*0.6,0,0)), tip.clone().add(V(-w*0.6,0,0)), P.ironDk, 0.04);
    };
    slat(-0.30,0.22,0.10); slat(-0.12,0.30,0.10); slat(0.12,0.30,0.10); slat(0.30,0.22,0.10);
    /* dark rectangular grille "face" set into the nose front */
    quad(V(-0.14,spY+0.02,1.22), V(0.14,spY+0.02,1.22), V(0.11,spY-0.14,1.24), V(-0.11,spY-0.14,1.24), P.grille, 0.02);
    for(let i=-1;i<=1;i++){
      const gx=i*0.08;
      quad(V(gx-0.02,spY+0.00,1.225), V(gx+0.02,spY+0.00,1.225), V(gx+0.015,spY-0.12,1.245), V(gx-0.015,spY-0.12,1.245), P.rivet, 0.02);
    }
  }

  /* ---------- SIX SHORT PISTON-DRIVEN LEGS — train-wheel-turned-legs, striding gait ---------- */
  {
    const wheelLeg=(hipZ, side, phase)=>{
      const hip=V(side*0.34, spY-0.10, hipZ);
      const kneeSwing = (phase%2===0)? 0.10 : -0.10;
      const knee=V(side*0.50, spY-0.34, hipZ+kneeSwing);
      const foot=V(side*0.56, 0.06, hipZ+kneeSwing*1.6);
      tube(hip, knee, 0.115, 0.090, 7, P.iron);
      tube(knee, foot, 0.088, 0.065, 7, P.ironDk, {capB:{hex:P.ironDk, lift:0.015}});
      /* a small wheel-disc at the knee joint — the "train wheel" read */
      const wr=ring(knee, V(1,0,0), 0.10, 0.10, 8, Math.PI/8);
      const wr2=ring(V(knee.x+0.03,knee.y,knee.z), V(1,0,0), 0.10, 0.10, 8, Math.PI/8);
      stitch([wr,wr2], ()=>P.brassDk);
      /* foot pad kicking dust */
      const pad=V(foot.x, 0.04, foot.z);
      quad(pad.clone().add(V(-0.06,0,-0.05)), pad.clone().add(V(0.06,0,-0.05)),
           pad.clone().add(V(0.05,0,0.06)), pad.clone().add(V(-0.05,0,0.06)), P.ironDk, 0.03);
    };
    let ph=0;
    for(const z of [0.75, 0.05, -0.75]){
      wheelLeg(z, -1, ph); wheelLeg(z, 1, ph+1); ph++;
    }
  }

  /* ---------- dust kicked up off the rear legs — striding-motion detail ---------- */
  {
    const kick=(cx,cz,len)=>{
      const p0=V(cx, 0.05, cz);
      const p1=V(cx-0.15, 0.20, cz-len*0.5);
      const tip=V(cx-0.30, 0.30, cz-len);
      tube(p0,p1,0.06,0.03,5,P.dust);
      tube(p1,tip,0.03,0.006,5,P.dust,{capB:{hex:P.dust,lift:0.004}});
    };
    kick(-0.56,-0.80,0.35); kick(0.56,-0.80,0.30);
  }

  /* base disc (Gargantuan: r=0.72) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.060,0), V(0,1,0), 0.70, 0.70, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.063,0), P.discTop);
  }
}
