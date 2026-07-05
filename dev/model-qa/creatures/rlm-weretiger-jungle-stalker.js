/* dev/model-qa/creatures/rlm-weretiger-jungle-stalker.js — WERETIGER JUNGLE-STALKER
   (lost-world, Medium Monstrosity/hybrid, CR 4). Read: a cursed hunter caught mid-shift —
   a lean muscular HYBRID stance (digitigrade tiger-hind-legs + a humanoid torso/arms), a
   striped tiger head with a short powerful jaw, a long tiger tail balancing the crouch,
   clawed hands, a scrap of torn human clothing (a sash) still clinging to the waist — the
   curse's human tell. VS-desaturated dusty orange/black tiger stripes (jungle-canopy dim,
   not zoo-bright). No eye quads — narrow slit-shadow sockets only. Whole-object grammar:
   one function, one frame, no anchors. Medium, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildWeretigerJungleStalker(){
  const P = {
    fur:0xa06a3e, furDk:0x6e4526, furLt:0xbf8a5c,
    stripe:0x241f18, stripeDk:0x140f0a,
    belly:0xc9b98e,
    skin:0x8c6b48,
    claw:0x201d17, pad:0x5c4632,
    sash:0xa8967a, sashDk:0x7a6a52,
    socket:0x1c1712,
    disc:0x4a4038, discTop:0x585047,
  };

  /* TORSO — humanoid lean torso crouched forward, hunched over the digitigrade hind legs */
  const S = {
    hip:    V(0, 0.62, -0.06),
    waist:  V(0, 0.86, 0.02),
    chest:  V(0.02, 1.06, 0.10),
    neck:   V(0.02, 1.20, 0.16),
    headB:  V(0.02, 1.28, 0.20),
  };
  tube(S.hip,   S.waist, 0.150, 0.130, 8, P.fur,   {phase:Math.PI/8, capA:{hex:P.furDk, lift:0.02}});
  tube(S.waist, S.chest, 0.130, 0.155, 8, P.furLt, {phase:Math.PI/8});
  tube(S.chest, S.neck,  0.130, 0.075, 8, P.fur,   {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.075, 0.068, 8, P.furDk, {phase:Math.PI/8});
  /* pale belly/chest stripe patch */
  quad(V(-0.06,0.94,0.14), V(0.06,0.94,0.14), V(0.05,0.72,0.10), V(-0.05,0.72,0.10), P.belly, 0.05);
  /* tiger stripes across torso — diagonal dark bands */
  for(const [y0,y1] of [[1.00,1.06],[0.86,0.92],[0.70,0.76]]){
    quad(V(-0.14,y0,0.06), V(-0.06,y0,0.10), V(-0.02,y1,0.08), V(-0.10,y1,0.04), P.stripe, 0.04);
    quad(V(0.06,y0,0.06), V(0.14,y0,0.10), V(0.10,y1,0.08), V(0.02,y1,0.04), P.stripeDk, 0.04);
  }

  /* HEAD — tiger head, short powerful jaw, stripes, slit-shadow sockets (no eye quads) */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y-0.02, cz:0.20, rx:0.098, rz:0.100, hex:P.fur},
      {y:S.headB.y+0.08, cz:0.24, rx:0.115, rz:0.112, hex:P.furLt},
      {y:S.headB.y+0.16, cz:0.20, rx:0.090, rz:0.085, hex:P.furDk},
    ];
    const rings=bands.map(b=>ring(V(0.02,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0.02,S.headB.y+0.21,0.19), P.furDk);
    /* short broad muzzle */
    const snB=V(0.02,S.headB.y-0.03,0.30), snT=V(0.02,S.headB.y-0.05,0.40);
    tube(snB,snT,0.070,0.048,n,P.fur,{raz:0.078, rbz:0.05, phase:ph, capB:{hex:P.belly, lift:0.006}});
    /* dark nose */
    quad(V(-0.014,S.headB.y-0.05,0.395), V(0.014,S.headB.y-0.05,0.395), V(0.010,S.headB.y-0.035,0.39), V(-0.010,S.headB.y-0.035,0.39), P.stripe, 0.02);
    /* slit socket shadows (no eye quads) */
    for(const s of [-1,1]) quad(V(0.02+s*0.045,S.headB.y+0.075,0.28), V(0.02+s*0.070,S.headB.y+0.07,0.28),
                                 V(0.02+s*0.065,S.headB.y+0.05,0.28), V(0.02+s*0.048,S.headB.y+0.055,0.28), P.socket, 0.02);
    /* forehead stripes */
    for(const s of [-1,1]) quad(V(0.02+s*0.02,S.headB.y+0.18,0.20), V(0.02+s*0.05,S.headB.y+0.18,0.20),
                                 V(0.02+s*0.04,S.headB.y+0.10,0.24), V(0.02+s*0.015,S.headB.y+0.10,0.24), P.stripe, 0.04);
    /* rounded ears */
    for(const s of [-1,1]){
      const eb=V(0.02+s*0.07,S.headB.y+0.18,0.16), et=V(0.02+s*0.10,S.headB.y+0.28,0.14);
      tube(eb,et,0.036,0.010,5,P.fur,{capB:{hex:P.stripe, lift:0.006}});
    }
    /* jaw + fangs */
    quad(V(-0.05,S.headB.y-0.08,0.30), V(0.05,S.headB.y-0.08,0.30), V(0.035,S.headB.y-0.10,0.40), V(-0.035,S.headB.y-0.10,0.40), P.stripe, 0.03);
    for(const s of [-1,1]) tube(V(s*0.028,S.headB.y-0.075,0.36), V(s*0.030,S.headB.y-0.11,0.375), 0.010, 0.003, 4, P.belly, {capB:{hex:P.belly, lift:0.003}});
  }

  /* ARMS — muscular, ending in clawed hands, forward-crouched */
  {
    const armSet=(shX)=>{
      const sh=V(shX,1.10,0.06), el=V(shX*1.25,0.86,0.20), hd=V(shX*1.1,0.62,0.32);
      tube(sh,el,0.075,0.058,6,P.fur);
      tube(el,hd,0.058,0.044,6,P.furDk,{capB:{hex:P.furDk, lift:0.01}});
      const side=Math.sign(shX||1);
      for(const [dx,dz] of [[side*0.03,0.05],[0,0.06],[-side*0.03,0.05]]){
        tube(V(hd.x,hd.y-0.02,hd.z), V(hd.x+dx,hd.y-0.06,hd.z+dz), 0.014, 0.004, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    armSet(-0.16); armSet(0.16);
  }

  /* DIGITIGRADE HIND LEGS — powerful tiger-shaped legs bent for a crouched stalk */
  {
    const hindLeg=(hipX)=>{
      const hip=V(hipX,0.58,-0.08), knee=V(hipX*1.1,0.36,0.02), ankle=V(hipX*0.95,0.14,-0.10), foot=V(hipX*0.9,0.045,0.02);
      tube(hip,knee,0.115,0.088,7,P.fur);
      tube(knee,ankle,0.088,0.048,7,P.furLt);
      tube(ankle,foot,0.048,0.052,6,P.furDk,{capB:{hex:P.pad, lift:0.008}});
      const side=Math.sign(foot.x||1);
      for(const [dx,dz] of [[side*0.03,0.03],[0,0.04],[-side*0.03,0.03]]){
        tube(V(foot.x,0.03,foot.z), V(foot.x+dx,0.006,foot.z+dz), 0.012, 0.003, 4, P.claw, {capB:{hex:P.claw, lift:0.003}});
      }
      /* stripe band on the thigh */
      quad(V(hipX*0.9-0.03,0.50,-0.04), V(hipX*0.9+0.03,0.50,-0.04), V(hipX*0.9+0.024,0.42,0.0), V(hipX*0.9-0.024,0.42,0.0), P.stripeDk, 0.04);
    };
    hindLeg(-0.15); hindLeg(0.15);
  }

  /* LONG TIGER TAIL — balancing the crouch, sweeping low behind, striped */
  {
    const t0=V(0,0.70,-0.14), t1=V(-0.08,0.60,-0.42), t2=V(-0.02,0.44,-0.68), t3=V(0.10,0.32,-0.88), tip=V(0.16,0.26,-0.98);
    tube(t0,t1,0.055,0.040,7,P.fur,{capA:{hex:P.furDk}});
    tube(t1,t2,0.040,0.028,7,P.stripeDk);
    tube(t2,t3,0.028,0.018,6,P.fur);
    tube(t3,tip,0.018,0.006,6,P.stripe,{capB:{hex:P.stripe, lift:0.004}});
  }

  /* CURSE TELL — a scrap of torn human clothing, a ragged sash still clinging at the waist */
  {
    quad(V(-0.16,0.80,-0.02), V(0.02,0.86,0.04), V(-0.02,0.66,0.08), V(-0.20,0.62,0.0), P.sash, 0.06);
    quad(V(0.02,0.86,0.04), V(0.10,0.70,0.06), V(0.06,0.54,0.10), V(-0.02,0.66,0.08), P.sashDk, 0.06); // ragged trailing tail of the sash
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
