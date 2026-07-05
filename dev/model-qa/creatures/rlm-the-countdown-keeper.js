/* dev/model-qa/creatures/rlm-the-countdown-keeper.js — THE COUNTDOWN KEEPER (ash realm, Medium,
   CR 14). Read: an ancient cult figurehead whispering the final number — an impossibly old,
   ash-mummified robed figure, hunched deep under a heavy layered ceremonial mantle stitched with
   countless numeral-tally scars, a great ring of rusted numeral-dial pendants hung at the chest,
   a bowed skeletal-gaunt face, hands raised as if counting down on withered fingers. Whole-object
   grammar: one function, one merged frame, no anchors. NO eye quads — hollow dark sockets only.
   Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheCountdownKeeper(){
  /* ---------- PALETTE (VS-desaturated ash-mummified hide, deep ceremonial mantle, rust-dial hoard) - */
  const P = {
    skin:0x5c4c3a, skinDk:0x362c20, skinLt:0x6e5c46,
    mantle:0x453e30, mantleDk:0x2c2720, mantleLt:0x574f3e,   // heavy layered ceremonial mantle
    tally:0x8a3428,                                            // numeral-tally scar stitching
    dial:0x6c6350, dialDk:0x453e30, dialRust:0x6c3a20,        // rusted numeral-dial pendants
    hood:0x342e24, hoodDk:0x211d16,
    socket:0x0d0a07,
    disc:0x3a3428, discTop:0x453f32,
  };

  /* ---------- LANDMARKS — deeply hunched, ancient, bowed under the mantle's weight ---------- */
  const L = { hipY:0.50, waistY:0.64, chestY:0.84, shldY:0.94, neckY:0.98, headBY:1.02, headTY:1.16 };
  const hunch = (p)=>{
    const q = p.clone().sub(V(0, L.chestY, 0));
    q.applyAxisAngle(V(1,0,0), 0.22);
    return q.add(V(0, L.chestY, 0));
  };

  /* ---------- TORSO — heavy layered ceremonial mantle, numeral-tally stitching scars ---------- */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.145, hex:P.mantleDk},
    {y:L.waistY, rx:0.135, rz:0.130, hex:P.mantle},
    {y:L.chestY, rx:0.170, rz:0.160, hex:P.mantleLt},
    {y:L.shldY,  rx:0.175, rz:0.165, hex:P.mantle},
    {y:L.neckY,  rx:0.068, rz:0.064, hex:P.skinDk},
  ], 8, {xform:hunch, capTop:{hex:P.skinDk, lift:0.006}});

  /* numeral-tally scar stitching lines across the mantle's front */
  for(const y of [0.60,0.72,0.84]){
    for(let i=-2;i<=2;i++){
      quad(V(i*0.03-0.008,y,0.16), V(i*0.03+0.008,y,0.16), V(i*0.03+0.006,y-0.04,0.165), V(i*0.03-0.006,y-0.04,0.165), P.tally, 0.05);
    }
  }
  /* draped over-mantle layer trailing to the ground */
  quad(V(-0.16,L.shldY,0.02), V(0.16,L.shldY,0.02), V(0.12,0.10,0.08), V(-0.12,0.10,0.08), P.mantleDk, 0.05);

  /* ---------- RING OF RUSTED NUMERAL-DIAL PENDANTS — hung heavy at the chest ---------- */
  {
    for(let i=0;i<7;i++){
      const ang = (i/7)*Math.PI - Math.PI*0.5;
      const cx = Math.cos(ang)*0.15, cz = 0.16 + Math.sin(ang)*0.03;
      const cy = L.chestY-0.10 - Math.abs(Math.sin(ang))*0.06;
      const outer = ring(V(cx,cy,cz), V(0,0,1), 0.032, 0.032, 6, Math.PI/6);
      const inner = ring(V(cx,cy,cz-0.006), V(0,0,1), 0.022, 0.022, 6, Math.PI/6);
      stitch([outer,inner], ()=>(i%2? P.dial : P.dialRust));
      capFan(inner, V(cx,cy,cz-0.01), P.dialDk);
    }
  }

  /* ---------- HEAD — deep hood, bowed skeletal-gaunt face, hollow dark sockets (no eye quads) ---- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.headBY,      cz:0.02, rx:0.084, rz:0.086, hex:P.skinDk},
      {y:L.headBY+0.08, cz:0.03, rx:0.088, rz:0.084, hex:P.skin},
      {y:L.headTY-0.02, cz:0.01, rx:0.072, rz:0.070, hex:P.hoodDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTY+0.02, -0.01), P.hoodDk);
    /* deep hood draping over + past the head, points forward-down over the bowed face */
    quad(V(-0.11,L.headTY+0.02,-0.05), V(0.11,L.headTY+0.02,-0.05), V(0.06,L.headBY-0.12,0.11), V(-0.06,L.headBY-0.12,0.11), P.hood, 0.05);
    quad(V(-0.06,L.headBY-0.10,0.10), V(0.06,L.headBY-0.10,0.10), V(0.03,L.headBY-0.16,0.11), V(-0.03,L.headBY-0.16,0.11), P.hoodDk, 0.05);
    /* hollow dark sockets, deep recessed under the hood shadow */
    for(const s of [-1,1]){
      quad(V(s*0.045-0.018,L.headBY+0.08,0.075), V(s*0.045+0.018,L.headBY+0.08,0.075),
           V(s*0.045+0.014,L.headBY+0.03,0.08), V(s*0.045-0.014,L.headBY+0.03,0.08), P.socket, 0.02);
    }
  }

  /* ---------- ARMS — hands raised as if counting down on withered fingers ---------- */
  {
    const shL = V(-0.15, 0.90, 0.00), shR = V(0.15, 0.90, 0.01);
    const elL = V(-0.20, 0.72, 0.10), elR = V(0.20, 0.72, 0.10);
    const hL  = V(-0.14, 0.78, 0.24), hR  = V(0.14, 0.78, 0.24);
    tube(shL, elL, 0.046, 0.036, 6, P.mantle);
    tube(elL, hL,  0.036, 0.024, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.008}});
    tube(shR, elR, 0.046, 0.036, 6, P.mantle);
    tube(elR, hR,  0.036, 0.024, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.008}});
    /* withered raised fingers, counting */
    for(const [hx,dx] of [[hL,-1],[hR,1]]){
      for(const dy of [0.0,0.03,0.06]){
        const f0=V(hx.x+dx*0.02,hx.y+dy,hx.z+0.02), f1=V(hx.x+dx*0.05,hx.y+dy+0.06,hx.z+0.04);
        tube(f0,f1,0.010,0.004,3,P.skinDk,{capB:{hex:P.skinDk,lift:0.003}});
      }
    }
  }

  /* ---------- LEGS — hidden under the trailing mantle hem, brief stance hint ---------- */
  {
    const legs=(hipX)=>{
      const hip = V(hipX, L.hipY-0.02, 0);
      const foot = V(hipX*0.9, 0.03, 0.04);
      tube(hip, foot, 0.06, 0.05, 6, P.mantleDk);
    };
    legs(-0.06); legs(0.06);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
