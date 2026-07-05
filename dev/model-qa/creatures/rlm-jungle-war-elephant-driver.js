/* dev/model-qa/creatures/rlm-jungle-war-elephant-driver.js — Jungle War-Elephant Driver (theater,
   jungle lens, Huge, CR 5). A barded war-elephant carrying its mahout through the chaos: a heavy
   quadruped elephant body (mammal upright-legged, like rlm-zombie-herd-elephant-carrier but ALIVE
   — alert head, raised trunk, tusks intact) wearing lashed jungle-plate barding + a mahout figure
   seated at the neck with a driving goad. Whole-object grammar: one merged frame, no anchors.
   VS-desaturated jungle-drab hide + weathered leather/plate barding + mottled cloth mahout dress.
   NO eye quads (brow-shadowed sockets only). Huge disc r=0.68. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildJungleWarElephantDriver(){
  const P = {
    hide:0x6a6250, hideDk:0x4a4536, hideLt:0x817962,
    tusk:0xc4b896, tuskDk:0x8a7e64,
    barding:0x4e5638, bardingDk:0x323a20, bardingLt:0x636b46,
    strap:0x3a2c1e,
    mahout:0x54563e, mahoutDk:0x363826,
    skin:0x7d6650, skinDk:0x574636,
    socket:0x201d16, mouth:0x241d16,
    disc:0x453d2e, discTop:0x554c37,
  };

  /* ---------- SPINE — mammal-normal height, alert upright carriage (not sagging). ---------- */
  const spY = 0.66;
  const S = {
    rump:  V(0, spY+0.06, -0.62),
    loin:  V(0, spY+0.12, -0.30),
    mid:   V(0, spY+0.14,  0.02),
    shldr: V(0, spY+0.12,  0.32),
    neck:  V(0, spY+0.06,  0.54),
    headB: V(0, spY+0.02,  0.66),
  };

  /* ---------- BODY — a broad barrel loft, alert and upright. ---------- */
  tube(S.rump,  S.loin,  0.345, 0.365, 10, P.hide,   {phase:Math.PI/10, capA:{hex:P.hideDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.365, 0.375, 10, P.hideDk, {phase:Math.PI/10});
  tube(S.mid,   S.shldr, 0.375, 0.345, 10, P.hide,   {phase:Math.PI/10});
  tube(S.shldr, S.neck,  0.345, 0.225, 10, P.hideDk, {phase:Math.PI/10});
  tube(S.neck,  S.headB, 0.225, 0.185, 10, P.hide,   {phase:Math.PI/10});

  /* ---------- HEAD — broad, alert, brow-shadowed sockets (no eyes), intact tusks, raised trunk. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:spY-0.06, cz:0.66, rx:0.190, rz:0.178, hex:P.hide},
      {y:spY+0.04, cz:0.70, rx:0.210, rz:0.195, hex:P.hideDk},
      {y:spY+0.16, cz:0.66, rx:0.175, rz:0.155, hex:P.hide},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+0.26,0.64), P.hideDk);

    // large fan ears
    for(const s of [-1,1]){
      const ea=V(s*0.20, spY+0.16, 0.58), eb=V(s*0.38, spY+0.06, 0.60), ec=V(s*0.34, spY-0.12, 0.62);
      quad(ea, eb, ec, V(s*0.22,spY-0.04,0.58), P.hideDk, 0.06);
    }
    // brow-shadowed sockets (no eyes)
    for(const s of [-1,1]){
      const ex=s*0.10, ey=spY+0.08, ez=0.72;
      quad(V(ex-0.026,ey+0.022,ez), V(ex+0.026,ey+0.022,ez), V(ex+0.022,ey-0.022,ez-0.01), V(ex-0.022,ey-0.022,ez-0.01), P.socket, 0.0);
    }
    // intact tusks, pale ivory, curving forward and up
    for(const s of [-1,1]){
      const t0=V(s*0.09, spY-0.12, 0.74), t1=V(s*0.13, spY-0.14, 0.92), tip=V(s*0.15, spY-0.06, 1.04);
      tube(t0,t1,0.038,0.024,6,P.tusk);
      tube(t1,tip,0.024,0.008,6,P.tuskDk,{capB:{hex:P.tuskDk,lift:0.006}});
    }
    quad(V(-0.06,spY-0.16,0.76), V(0.06,spY-0.16,0.76), V(0.04,spY-0.20,0.80), V(-0.04,spY-0.20,0.80), P.mouth, 0.03);
  }

  /* ---------- RAISED TRUNK — alert, curling upward mid-motion (not slack). ---------- */
  {
    const tr0=V(0,spY-0.12,0.78), tr1=V(0.02,spY-0.02,0.92), tr2=V(0.04,spY+0.14,0.98), tr3=V(0.02,spY+0.28,0.92), tip=V(0,spY+0.34,0.82);
    tube(tr0,tr1,0.078,0.064,7,P.hideDk);
    tube(tr1,tr2,0.064,0.050,7,P.hide);
    tube(tr2,tr3,0.050,0.036,7,P.hideDk);
    tube(tr3,tip,0.036,0.020,7,P.hide,{capB:{hex:P.hideDk,lift:0.006}});
  }

  /* ---------- LEGS — 4 thick upright mammal legs, alert weight-bearing. ---------- */
  {
    const leg=(hip, footX, footZ)=>{
      const knee=V(hip.x, 0.32, hip.z + (footZ>hip.z?0.02:-0.02));
      const foot=V(footX, 0.05, footZ);
      tube(hip, knee, 0.158, 0.132, 8, P.hide);
      tube(knee, foot, 0.130, 0.142, 8, P.hideDk, {capB:{hex:P.hideDk, lift:0.01}});
      const pd=ring(V(foot.x,0.03,foot.z), V(0,1,0), 0.13, 0.12, 7, 0);
      capFan(pd, V(foot.x,0.01,foot.z), P.hideDk, true);
    };
    leg(V(-0.24, spY-0.04, 0.30),  -0.34, 0.34);
    leg(V( 0.24, spY-0.04, 0.30),   0.34, 0.30);
    leg(V(-0.26, spY-0.02, -0.44), -0.36, -0.38);
    leg(V( 0.26, spY-0.02, -0.44),  0.36, -0.42);
  }

  /* ---------- TAIL — short, tufted, alert (held out slightly, not limp). ---------- */
  {
    const t0=S.rump, t1=V(0.04, spY-0.06, -0.86), tip=V(0.06, spY-0.14, -1.00);
    tube(t0,t1,0.052,0.032,6,P.hideDk);
    tube(t1,tip,0.032,0.012,6,P.hide,{capB:{hex:P.hideDk}});
  }

  /* ---------- JUNGLE-PLATE BARDING — lashed leather-and-plate armor panels over the flanks + brow. ---------- */
  {
    // flank panels, both sides
    for(const s of [-1,1]){
      const a=V(s*0.30,spY+0.16,-0.10), b=V(s*0.36,spY-0.10,-0.14), c=V(s*0.34,spY-0.10,0.20), d=V(s*0.30,spY+0.14,0.22);
      quad(a,b,c,d, s>0?P.barding:P.bardingDk, 0.06);
      // plate rivets/seams
      for(let i=0;i<3;i++){
        const zz=-0.10+i*0.12;
        quad(V(s*0.32,spY+0.02,zz), V(s*0.34,spY+0.02,zz), V(s*0.34,spY-0.02,zz), V(s*0.32,spY-0.02,zz), P.bardingLt, 0.03);
      }
    }
    // brow plate
    quad(V(-0.14,spY+0.22,0.62), V(0.14,spY+0.22,0.62), V(0.11,spY+0.14,0.68), V(-0.11,spY+0.14,0.68), P.barding, 0.05);
    // girth straps
    for(const z of [0.0,0.26]){
      ring(V(0,spY,z), V(0,0,1), 0.38, 0.34, 8).forEach((p,i,arr)=>{
        const p2=arr[(i+1)%arr.length];
        quad(p,p2,V(p2.x,p2.y,p2.z+0.02),V(p.x,p.y,p.z+0.02), P.strap, 0.05);
      });
    }
  }

  /* ---------- MAHOUT — seated at the base of the neck, driving goad in hand. ---------- */
  {
    const seatY = spY+0.38, seatZ = 0.42;
    const hip=V(0,seatY,seatZ), waist=V(0,seatY+0.10,seatZ+0.02), chest=V(0,seatY+0.20,seatZ+0.03),
          shldr=V(0,seatY+0.27,seatZ+0.02), headB=V(0,seatY+0.31,seatZ), headT=V(0,seatY+0.43,seatZ-0.02);
    const n=8, ph=Math.PI/n;
    const bands=[{y:hip.y,cz:hip.z,rx:0.088,hex:P.mahoutDk},{y:waist.y,cz:waist.z,rx:0.084,hex:P.mahout},
                 {y:chest.y,cz:chest.z,rx:0.092,hex:P.mahout},{y:shldr.y,cz:shldr.z,rx:0.096,hex:P.mahoutDk}];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz),V(0,1,0),b.rx,b.rx*0.85,n,ph));
    stitch(rings, b=>bands[b].hex);
    // head, brow-shadowed sockets only (no eyes)
    const hb=ring(V(0,headB.y,headB.z),V(0,1,0),0.058,0.055,n,ph);
    const ht=ring(V(0,headT.y-0.02,headB.z),V(0,1,0),0.048,0.045,n,ph);
    stitch([hb,ht], ()=>P.skin);
    capFan(ht, V(0,headT.y,headB.z), P.skinDk);
    quad(V(-0.04,headB.y+0.03,headB.z+0.045), V(-0.01,headB.y+0.03,headB.z+0.05),
         V(-0.015,headB.y+0.055,headB.z+0.045), V(-0.038,headB.y+0.055,headB.z+0.04), P.skinDk, 0.05);
    quad(V(0.01,headB.y+0.03,headB.z+0.05), V(0.04,headB.y+0.03,headB.z+0.045),
         V(0.038,headB.y+0.055,headB.z+0.04), V(0.015,headB.y+0.055,headB.z+0.045), P.skinDk, 0.05);
    // arm + driving goad, raised forward toward the ear
    const shR=V(-0.08,shldr.y-0.02,shldr.z), elR=V(-0.14,shldr.y-0.10,shldr.z+0.12), hR=V(-0.10,shldr.y-0.02,shldr.z+0.26);
    tube(shR,elR,0.030,0.024,5,P.mahout);
    tube(elR,hR,0.024,0.018,5,P.skin,{capB:{hex:P.skin,lift:0.012}});
    tube(hR, V(-0.06,shldr.y+0.10,shldr.z+0.38), 0.012,0.006,4,P.strap,{capB:{hex:P.strap,lift:0.006}});
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
