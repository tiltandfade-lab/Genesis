/* dev/model-qa/creatures/rlm-broken-fang-wererat-tomb-rat.js — BROKEN-FANG WERERAT TOMB-RAT
   (lost-world, Medium Monstrosity/hybrid, CR 2). Read: a cursed grave-looter caught in its
   vermin shape — an oversized hunched RAT body scurrying tomb tunnels, but wrong: one snapped
   crooked fang jutting from the jaw, a too-long scarred naked tail, ragged notched ears, and
   a scrap of looted jewelry (a broken chain) snagged around the neck — the human curse
   showing through the animal shape. VS-desaturated grimy grey-brown fur, pale scarred tail.
   Whole-object grammar: one function, one frame, no anchors. Medium, base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildBrokenFangWereratTombRat(){
  const P = {
    fur:0x5a5248, furDk:0x3e392f, furLt:0x716858,
    scar:0x847a68,
    tail:0x9a8e78, tailDk:0x6e6454,
    ear:0x453f34, earIn:0x5c5348,
    tooth:0xd8cca0, fangBroke:0xb8a878, mouth:0x241f18,
    claw:0x201d17,
    chain:0x8a8272, chainDk:0x5c584c,
    disc:0x4a4038, discTop:0x585047,
  };

  /* HUNCHED RAT BODY — low horizontal spine, hunched shoulders higher than the low rump */
  const spY = 0.30;
  const S = {
    rump:  V(0, spY-0.02, -0.34),
    loin:  V(0, spY+0.02, -0.14),
    mid:   V(0, spY+0.06,  0.06),
    shldr: V(0, spY+0.10,  0.24),
    neck:  V(0, spY+0.06,  0.36),
    headB: V(0, spY+0.02,  0.44),
  };
  tube(S.rump,  S.loin,  0.185, 0.205, 8, P.fur,   {phase:Math.PI/8, capA:{hex:P.furDk,lift:0.02}});
  tube(S.loin,  S.mid,   0.205, 0.220, 8, P.furDk, {phase:Math.PI/8});
  tube(S.mid,   S.shldr, 0.220, 0.185, 8, P.fur,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.185, 0.120, 8, P.furLt, {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.120, 0.100, 8, P.furDk, {phase:Math.PI/8});
  /* mangy scarred patches on the flank */
  quad(V(-0.20,spY+0.02,-0.10), V(-0.08,spY+0.06,-0.06), V(-0.10,spY-0.06,-0.02), V(-0.22,spY-0.08,-0.08), P.scar, 0.06);

  /* HEAD — broad rodent skull narrowing to a pointed snout */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY-0.01, cz:0.42, rx:0.098, rz:0.100, hex:P.fur},
      {y:spY+0.05, cz:0.46, rx:0.108, rz:0.108, hex:P.furLt},
      {y:spY+0.08, cz:0.42, rx:0.088, rz:0.084, hex:P.furDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+0.12,0.42), P.furDk);
    /* pointed snout */
    const snB=V(0,spY-0.02,0.50), snT=V(0,spY-0.045,0.62);
    tube(snB, snT, 0.070, 0.026, n, P.fur, {raz:0.078, rbz:0.030, phase:ph, capB:{hex:P.mouth, lift:0.006}});
    /* nose tip */
    quad(V(-0.012,spY-0.045,0.615), V(0.012,spY-0.045,0.615), V(0.008,spY-0.030,0.605), V(-0.008,spY-0.030,0.605), P.mouth, 0.02);

    /* jaw + the BROKEN FANG — one snapped crooked fang jutting wrong out of the jaw */
    quad(V(-0.05,spY-0.075,0.44), V(0.05,spY-0.075,0.44), V(0.03,spY-0.09,0.58), V(-0.03,spY-0.09,0.58), P.mouth, 0.03);
    tube(V(0.018,spY-0.075,0.50), V(0.032,spY-0.045,0.48), 0.010, 0.003, 4, P.fangBroke, {capB:{hex:P.fangBroke, lift:0.003}}); // crooked, points UP wrong
    tube(V(-0.020,spY-0.078,0.51), V(-0.024,spY-0.098,0.55), 0.009, 0.003, 4, P.tooth, {capB:{hex:P.tooth, lift:0.003}}); // normal fang

    /* ragged notched ears */
    for(const s of [-1,1]){
      const eb=V(s*0.07, spY+0.14, 0.36), et=V(s*0.13, spY+0.24, 0.32);
      tube(eb, et, 0.045, 0.030, 5, P.ear, {capB:{hex:P.earIn, lift:0.01}});
      /* notch bite out of the ear edge */
      quad(V(s*0.13,spY+0.20,0.33), V(s*0.15,spY+0.21,0.32), V(s*0.14,spY+0.24,0.31), V(s*0.12,spY+0.23,0.32), P.mouth, 0.02);
    }
    /* whiskers — thin ticks from the snout */
    for(const s of [-1,1]) for(let i=0;i<2;i++){
      const wb=V(s*0.03,spY-0.03-i*0.015,0.55);
      const wt=V(s*0.14,spY-0.02-i*0.02,0.57+i*0.03);
      tube(wb,wt,0.004,0.001,3,P.furLt);
    }
  }

  /* LEGS — scurrying low stance, small clawed feet, front legs shorter than hind */
  {
    const leg=(hip, footX, footZ, len, hex)=>{
      const knee = V(hip.x + Math.sign(hip.x)*0.03, hip.y-len*0.55, hip.z + (footZ>hip.z?0.03:-0.03));
      const foot = V(footX, 0.045, footZ);
      tube(hip, knee, 0.052, 0.040, 6, hex);
      tube(knee, foot, 0.040, 0.026, 6, P.furDk, {capB:{hex:P.furDk, lift:0.005}});
      const side=Math.sign(foot.x||1);
      for(const [dx,dz] of [[side*0.03,0.02],[0,0.035],[-side*0.03,0.02]]){
        tube(V(foot.x,0.03,foot.z), V(foot.x+dx,0.006,foot.z+dz), 0.010, 0.003, 3, P.claw, {capB:{hex:P.claw, lift:0.003}});
      }
    };
    leg(V(-0.14, spY+0.06, 0.22), -0.20, 0.28, 0.20, P.fur); // front (shorter, hunched shoulders)
    leg(V( 0.14, spY+0.06, 0.22),  0.20, 0.26, 0.20, P.fur);
    leg(V(-0.15, spY-0.06,-0.30), -0.22,-0.36, 0.28, P.furDk); // hind (longer, powers the scurry)
    leg(V( 0.15, spY-0.06,-0.30),  0.22,-0.34, 0.28, P.furDk);
  }

  /* TAIL — too-long, naked, scarred pink-grey, whipping low behind */
  {
    const t0=S.rump, t1=V(0.06,spY-0.06,-0.60), t2=V(0.14,spY-0.02,-0.86), t3=V(0.10,spY+0.06,-1.08), tip=V(-0.02,spY+0.02,-1.20);
    tube(t0,t1,0.052,0.036,7,P.tail,{capA:{hex:P.tailDk}});
    tube(t1,t2,0.036,0.024,7,P.tailDk);
    tube(t2,t3,0.024,0.014,6,P.tail);
    tube(t3,tip,0.014,0.005,6,P.tailDk,{capB:{hex:P.tailDk, lift:0.004}});
    /* scar rings on the tail */
    quad(V(-0.03,spY-0.04,-0.66), V(0.03,spY-0.04,-0.66), V(0.026,spY-0.02,-0.70), V(-0.026,spY-0.02,-0.70), P.scar, 0.04);
  }

  /* CURSE TELL — a scrap of looted jewelry, a broken chain snagged around the neck */
  {
    const n=V(0,spY+0.08,0.34);
    for(let i=0;i<5;i++){
      const t=i/4, ang=t*Math.PI*1.4-0.7;
      const x=Math.sin(ang)*0.11, y=n.y-0.02+Math.cos(ang)*0.02, z=n.z+Math.cos(ang)*0.10;
      quad(V(x-0.012,y,z), V(x+0.012,y,z), V(x+0.008,y-0.012,z+0.006), V(x-0.008,y-0.012,z+0.006), P.chain, 0.05);
    }
    /* broken/dangling end link */
    tube(V(0.09,n.y-0.06,n.z+0.02), V(0.13,n.y-0.14,n.z-0.02), 0.014, 0.010, 4, P.chainDk, {capB:{hex:P.chainDk, lift:0.005}});
  }

  /* base disc (Medium r=0.42) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
