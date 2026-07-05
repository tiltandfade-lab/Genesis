/* dev/model-qa/creatures/rlm-dragon-turtle-of-the-drowned-necropolis.js — DRAGON-TURTLE OF THE
   DROWNED NECROPOLIS (lost-world, Gargantuan Dragon, CR 17). Read: a shelled leviathan wearing
   a swallowed necropolis like armor — a broad turtle-dragon silhouette: a massive barnacled
   shell studded with fused tomb-stones and half-swallowed obelisk fragments, a long serpentine
   dragon-neck + horned crocodilian head, four stout paddle-limbs, a heavy tapering tail.
   VS-desaturated deep swamp-green shell, bone-grey stone growths. Whole-object grammar: one
   function, one frame, no anchors. Gargantuan size, base disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDragonTurtleOfTheDrownedNecropolis(){
  const P = {
    hide:0x4a5c48, hideDk:0x323f2e, hideLt:0x647a5c,
    shell:0x3c4636, shellDk:0x262e20, shellLt:0x54614a,
    stone:0x6a6458, stoneDk:0x484338, stoneLt:0x827c6c,
    belly:0x8c9478, bellyDk:0x646c50,
    horn:0xb8ae94, hornDk:0x8a8064,
    mouth:0x201d16, tooth:0xd8ceac, tongue:0x7a3436,
    claw:0x241f19,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — spine low & wide, Gargantuan bulk. ---------- */
  const spY = 0.62;
  const S = {
    tailBase: V(0, spY-0.04, -1.00),
    rump:     V(0, spY+0.04, -0.68),
    loin:     V(0, spY+0.08, -0.30),
    mid:      V(0, spY+0.10,  0.10),
    shldr:    V(0, spY+0.06,  0.48),
    neck1:    V(0, spY+0.22,  0.80),
    neck2:    V(0, spY+0.48,  1.02),
    neck3:    V(0, spY+0.74,  1.16),
    headB:    V(0, spY+0.92,  1.28),
  };

  /* ---------- BODY — wide low barrel under the shell. ---------- */
  tube(S.rump, S.loin, 0.520, 0.580, 10, P.hide, {phase:Math.PI/10, capA:{hex:P.hideDk, lift:0.04}});
  tube(S.loin, S.mid,  0.580, 0.600, 10, P.hide, {phase:Math.PI/10});
  tube(S.mid,  S.shldr,0.600, 0.520, 10, P.hide, {phase:Math.PI/10});
  /* pale belly strip low on the flanks */
  {
    const by=spY-0.50;
    quad(V(-0.40,by,-0.60), V(0.40,by,-0.60), V(0.34,by+0.03,0.40), V(-0.34,by+0.03,0.40), P.belly, 0.05);
  }

  /* ---------- SHELL — the necropolis-armor, a huge domed carapace studded with fused tomb-stone. ---------- */
  {
    const bands=[
      {y:spY+0.30, cz:-0.60, rx:0.60, rz:0.44, hex:P.shell},
      {y:spY+0.62, cz:-0.20, rx:0.72, rz:0.58, hex:P.shellLt},
      {y:spY+0.80, cz: 0.20, rx:0.68, rz:0.56, hex:P.shell},
      {y:spY+0.62, cz: 0.55, rx:0.52, rz:0.40, hex:P.shellDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 12, Math.PI/12));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+0.68,0.62), P.shellDk, true);
    capFan(rings[0], V(0,spY+0.20,-0.66), P.shellDk);
    // shell scute ridges (hexagon-ish plate seams)
    for(const [cz,rx] of [[-0.40,0.5],[-0.05,0.62],[0.30,0.5]]){
      const r1=ring(V(0,spY+0.72,cz),V(0,1,0),rx,rx*0.8,10), r2=ring(V(0,spY+0.75,cz),V(0,1,0),rx*0.98,rx*0.78,10);
      stitch([r1,r2],()=>P.shellDk);
    }
    // fused tomb-stones + obelisk fragments studding the shell top
    const studs=[[0.18,spY+0.98,-0.10,0.14,0.20,0.10],[-0.24,spY+0.94,0.10,0.12,0.16,0.09],
                 [0.02,spY+0.90,-0.42,0.11,0.14,0.09],[-0.12,spY+0.92,0.40,0.10,0.13,0.08]];
    for(const [x,y,z,rx,ry,rz] of studs){
      const b1=ring(V(x,y-ry*0.5,z),V(0,1,0),rx,rz,6), b2=ring(V(x,y+ry*0.5,z),V(0,1,0),rx*0.7,rz*0.7,6);
      stitch([b1,b2],()=>P.stone); capFan(b2,V(x,y+ry*0.6,z),P.stoneDk);
    }
    // barnacle-blobs scattered on the shell flank
    for(const [x,y,z] of [[0.5,spY+0.60,-0.20],[-0.5,spY+0.55,0.05],[0.4,spY+0.50,0.35]]){
      const r1=ring(V(x,y,z),V(0,1,0),0.06,0.05,5), r2=ring(V(x,y+0.03,z),V(0,1,0),0.045,0.038,5);
      stitch([r1,r2],()=>P.stoneLt);
    }
  }

  /* ---------- LONG DRAGON NECK + horned crocodilian head. ---------- */
  tube(S.shldr, S.neck1, 0.320, 0.260, 9, P.hideDk, {phase:Math.PI/9});
  tube(S.neck1, S.neck2, 0.260, 0.210, 9, P.hide,   {phase:Math.PI/9});
  tube(S.neck2, S.neck3, 0.210, 0.175, 9, P.hideLt, {phase:Math.PI/9});
  tube(S.neck3, S.headB, 0.175, 0.150, 9, P.hideDk, {phase:Math.PI/9});
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY+0.88, cz:1.30, rx:0.155, rz:0.190, hex:P.hide},
      {y:spY+0.98, cz:1.36, rx:0.175, rz:0.210, hex:P.hideLt},
      {y:spY+1.08, cz:1.30, rx:0.145, rz:0.165, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+1.14,1.28), P.hideDk);
    /* long crocodilian snout */
    const snB=V(0,spY+0.83,1.44), snM=V(0,spY+0.79,1.68), snT=V(0,spY+0.76,1.86);
    tube(snB, snM, 0.145, 0.100, n, P.hide, {raz:0.115, rbz:0.075, phase:ph});
    tube(snM, snT, 0.100, 0.052, n, P.hide, {raz:0.075, rbz:0.036, phase:ph, capB:{hex:P.mouth, lift:0.01}});
    /* jaw line + teeth */
    quad(V(-0.10,spY+0.68,1.50), V(0.10,spY+0.68,1.50), V(0.05,spY+0.66,1.82), V(-0.05,spY+0.66,1.82), P.mouth, 0.03);
    for(const s of [-1,1]) for(const t of [0,1]){
      const tb=V(s*0.08,spY+0.685,1.55+t*0.18), tt=tb.clone().add(V(0,-0.04,0.0));
      tube(tb,tt,0.012,0.004,3,P.tooth,{capB:{hex:P.tooth,lift:0.003}});
    }
    /* two backswept horns */
    for(const s of [-1,1]){
      const hb=V(s*0.10,spY+1.08,1.22), ht=V(s*0.18,spY+1.34,0.98);
      tube(hb,ht,0.045,0.014,5,P.horn,{capB:{hex:P.hornDk,lift:0.006}});
    }
  }

  /* ---------- FOUR STOUT PADDLE-LIMBS. ---------- */
  {
    const paddleLeg=(shoulder, footX, footZ, hex)=>{
      const elbowX=shoulder.x + Math.sign(shoulder.x)*0.30;
      const elbow=V(elbowX, spY-0.20, shoulder.z + (footZ>shoulder.z?0.10:-0.10));
      const foot=V(footX, 0.10, footZ);
      tube(shoulder, elbow, 0.230, 0.190, 8, hex);
      tube(elbow, foot, 0.190, 0.140, 7, P.hideDk, {capB:{hex:P.hideDk, lift:0.02}});
      // broad paddle-foot with clawed toes
      const pad=V(foot.x, 0.07, foot.z+0.08);
      const side=Math.sign(foot.x||1);
      const p1=ring(pad,V(0,1,0),0.22,0.20,7), p2=ring(pad.clone().add(V(0,0.05,0)),V(0,1,0),0.20,0.18,7);
      stitch([p1,p2],()=>P.hide);
      for(const [dx,dz] of [[side*0.16,0.08],[side*0.08,0.18],[-side*0.02,0.20],[-side*0.10,0.14]]){
        const cb=V(pad.x, 0.09, pad.z), ct=V(pad.x+dx, 0.03, pad.z+dz+0.06);
        tube(cb, ct, 0.045, 0.016, 4, P.claw, {capB:{hex:P.claw, lift:0.008}});
      }
    };
    paddleLeg(V(-0.50, spY-0.10, 0.42), -0.80, 0.56, P.hide);
    paddleLeg(V( 0.50, spY-0.10, 0.42),  0.80, 0.50, P.hide);
    paddleLeg(V(-0.54, spY-0.06, -0.62), -0.84, -0.74, P.hide);
    paddleLeg(V( 0.54, spY-0.06, -0.62),  0.84, -0.80, P.hide);
  }

  /* ---------- TAIL — heavy at the base, tapering, dragon-esque finned tip. ---------- */
  {
    const t0=S.tailBase;
    const t1=V(0.06, spY-0.14, -1.36);
    const t2=V(0.14, spY-0.24, -1.68);
    const t3=V(0.24, spY-0.10, -1.94);
    const t4=V(0.34, 0.10,     -2.12);
    const tip=V(0.44, 0.14,    -2.22);
    tube(t0, t1, 0.320, 0.250, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.250, 0.180, 9, P.hideDk,  {phase:Math.PI/9});
    tube(t2, t3, 0.180, 0.110, 9, P.hide,    {phase:Math.PI/9});
    tube(t3, t4, 0.110, 0.055, 9, P.hideDk,  {phase:Math.PI/9});
    tube(t4, tip,0.055, 0.018, 9, P.hide,    {phase:Math.PI/9, capB:{hex:P.hideDk, lift:0.01}});
    // dorsal fin ridge on the tail
    for(const [cz,y,h] of [[-1.30,spY+0.10,0.16],[-1.60,spY,0.13],[-1.86,spY-0.06,0.10]]){
      quad(V(-0.03,y,cz), V(0.03,y,cz), V(0,y+h,cz-0.05), V(0,y+h,cz-0.05), P.hideDk, 0.04);
    }
  }

  /* ---------- base disc (Gargantuan: r=0.72) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 20);
    const r2=ring(V(0,0.066,0), V(0,1,0), 0.70, 0.70, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.069,0), P.discTop);
  }
}
