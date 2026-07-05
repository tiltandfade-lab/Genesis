/* dev/model-qa/creatures/rlm-ashen-vampire-spawn-handmaiden.js — ASHEN VAMPIRE-SPAWN HANDMAIDEN
   (lost-world, Medium Undead, CR 5). Read: a pale ash-grey undead handmaiden in a faded court
   gown, still bent in a servile attending posture over a throne that has stood empty for
   centuries — hands cupped as if to offer a chalice no one will ever drink from. VS-desaturated
   antiquity register: ashen-grey undead flesh, faded funeral-court violet/silver gown, tarnished
   silver hair-jewelry. NO eye quads — dark hollow sockets only. Whole-object grammar: one
   function, one frame, no anchors. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildAshenVampireSpawnHandmaiden(){
  const P = {
    skin:0x9a9088, skinDk:0x716a63, skinLt:0xb0a89f,      // ashen-grey undead flesh
    gown:0x5e4a5c, gownDk:0x3f3140, gownLt:0x766072,       // faded funeral-court violet
    trim:0x8a8478, trimDk:0x5e594e,                        // faded silver-grey trim
    hair:0x312a2c, hairDk:0x1e191a,
    socket:0x18130f, mouth:0x2a1518, fang:0xd8d0c0,
    chalice:0x736a52, chaliceDk:0x4c4636,
    disc:0x4a4038, discTop:0x585047,
  };

  /* SPINE — bent forward in a servile attending stoop */
  const S = {
    hip:    V(0, 0.62, 0),
    waist:  V(0.01, 0.82, 0.03),
    chest:  V(0.03, 1.00, 0.08),
    shldr:  V(0.03, 1.08, 0.12),
    neck:   V(0.02, 1.16, 0.15),
    headB:  V(0.01, 1.24, 0.16),
  };

  /* GOWN BODY — a long faded court gown, tapering, trailing hem */
  tube(S.hip,   S.waist, 0.165, 0.140, 8, P.gown,   {phase:Math.PI/8, capA:{hex:P.gownDk, lift:0.02}});
  tube(S.waist, S.chest, 0.140, 0.130, 8, P.gownDk, {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.130, 0.110, 8, P.gown,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.062, 0.048, 6, P.skinDk, {phase:Math.PI/6});
  /* trailing gown hem, wide at the floor */
  {
    const hemTop=ring(V(0,0.50,0.02), V(0,1,0), 0.20, 0.19, 10, Math.PI/10);
    const hemBot=ring(V(0,0.05,0.10), V(0,1,0), 0.27, 0.24, 10, Math.PI/10);
    stitch([hemTop,hemBot], ()=>P.gownDk);
    capFan(hemBot, V(0,0.04,0.10), P.gownDk, true);
  }
  /* silver trim band at the waist */
  quad(V(-0.145,0.80,0.02), V(0.145,0.80,0.03), V(0.14,0.76,0.13), V(-0.14,0.76,0.12), P.trim, 0.04);

  /* HEAD — ashen face, dark sunken sockets, hair pinned with tarnished silver jewelry */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.14, cz:0.15, rx:0.062,rz:0.062, hex:P.skinDk},
      {y:1.21, cz:0.17, rx:0.068,rz:0.068, hex:P.skin},
      {y:1.27, cz:0.15, rx:0.058,rz:0.056, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.31,0.15), P.hairDk);
    /* jaw */
    tube(V(0,1.14,0.17), V(0,1.09,0.155), 0.05,0.038,n,P.skin,{raz:0.055,rbz:0.04,phase:ph, capB:{hex:P.skinDk,lift:0.006}});
    /* sunken sockets */
    for(const s of [-1,1]) quad(V(s*0.028,1.225,0.205), V(s*0.046,1.225,0.205),
                                 V(s*0.042,1.20,0.202), V(s*0.032,1.20,0.202), P.socket, 0.02);
    /* faint fanged mouth-line */
    quad(V(-0.022,1.095,0.205), V(0.022,1.095,0.205), V(0.017,1.085,0.207), V(-0.017,1.085,0.207), P.mouth, 0.03);
    quad(V(-0.014,1.093,0.206), V(-0.006,1.093,0.206), V(-0.008,1.083,0.207), V(-0.012,1.083,0.207), P.fang, 0.02);
    quad(V(0.006,1.093,0.206),  V(0.014,1.093,0.206),  V(0.012,1.083,0.207), V(0.008,1.083,0.207), P.fang, 0.02);
    /* pinned hair, swept back with a tarnished silver clasp */
    const hairTop=ring(V(0,1.30,0.10), V(0,1,0), 0.04,0.05,n,ph);
    const hairLow=ring(V(0,1.16,0.02), V(0,1,0), 0.075,0.09,n,ph);
    stitch([hairTop,hairLow], ()=>P.hair);
    capFan(hairTop, V(0,1.33,0.08), P.hairDk);
    quad(V(-0.03,1.24,-0.01), V(0.03,1.24,-0.01), V(0.02,1.20,-0.02), V(-0.02,1.20,-0.02), P.trim, 0.04);
  }

  /* ARMS — cupped forward, offering a chalice to no one */
  {
    const offerArm=(x,sign)=>{
      const sh=V(x, 1.02, 0.10);
      const el=V(x*1.3, 0.90, 0.26);
      const wr=V(x*0.7, 0.86, 0.40);
      tube(sh, el, 0.048, 0.036, 6, P.gown);
      tube(el, wr, 0.032, 0.024, 6, P.skinDk);
      const hd=V(x*0.4, 0.83, 0.44);
      tube(wr, hd, 0.024,0.016,5,P.skin,{capB:{hex:P.skin,lift:0.006}});
      return hd;
    };
    const hL=offerArm(-0.15,-1), hR=offerArm(0.15,1);
    /* the empty chalice, held between both cupped hands */
    const cB=V(0,0.80,0.46), cT=V(0,0.90,0.46);
    tube(cB, V(0,0.83,0.46), 0.03,0.05,6,P.chaliceDk);
    tube(V(0,0.83,0.46), cT, 0.05,0.06,6,P.chalice, {capB:{hex:P.chaliceDk, lift:0.006}});
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
