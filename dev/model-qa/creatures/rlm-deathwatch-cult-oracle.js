/* dev/model-qa/creatures/rlm-deathwatch-cult-oracle.js — DEATHWATCH CULT ORACLE (ash realm,
   Medium, CR 10). Read: a preserved countdown-interpreting oracle — a mummified, ash-cured
   humanoid figure wrapped in tattered numeral-scrawled rags, a gaunt withered frame, a
   ritual clock/dial talisman worn at the chest (its hands frozen at a countdown reading), a
   staff hung with rusted numeral tags, a hollow desiccated face bowed as if listening for a
   tick. Whole-object grammar: one function, one merged frame, no anchors. NO eye quads — sunken
   dark sockets only. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildDeathwatchCultOracle(){
  /* ---------- PALETTE (VS-desaturated ash-cured mummified hide, rag wraps, rust dial accents) --- */
  const P = {
    skin:0x6c5c48, skinDk:0x453a2c, skinLt:0x80705a,     // desiccated ash-cured hide
    rag:0x59503e, ragDk:0x3a3428, ragLt:0x6c634c,        // tattered numeral-scrawled wraps
    numeral:0x8a3428,                                     // scrawled countdown numerals (ochre-red)
    dial:0x736a52, dialDk:0x4c4634, dialRust:0x6c3a20,   // ritual clock/dial talisman
    staff:0x3a3226, staffDk:0x241f18, tag:0x6c3a20, tagDk:0x45241a,
    socket:0x100c08,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — gaunt withered stance, bowed head, slight stoop as if listening ---------- */
  const L = { hipY:0.56, waistY:0.72, chestY:0.94, shldY:1.06, neckY:1.12, headBY:1.18, headTY:1.34 };
  const bow = (p)=>{
    const q = p.clone().sub(V(0, L.shldY, 0));
    q.applyAxisAngle(V(1,0,0), 0.10);
    return q.add(V(0, L.shldY, 0));
  };

  /* ---------- TORSO — gaunt withered frame wrapped in tattered rags ---------- */
  stack([
    {y:L.hipY,   rx:0.130, rz:0.120, hex:P.rag},
    {y:L.waistY, rx:0.110, rz:0.100, hex:P.ragDk},
    {y:L.chestY, rx:0.145, rz:0.130, hex:P.rag},
    {y:L.shldY,  rx:0.150, rz:0.135, hex:P.ragLt},
    {y:L.neckY,  rx:0.062, rz:0.058, hex:P.skinDk},
  ], 8, {xform:bow, capTop:{hex:P.skinDk, lift:0.006}});

  /* trailing tattered rag strips down the front */
  for(const x of [-0.09,0.0,0.09]){
    const t0=V(x,L.chestY-0.02,0.12), t1=V(x*1.1,0.30,0.16);
    tube(t0,t1,0.024,0.010,4,P.ragDk,{capB:{hex:P.ragDk,lift:0.004}});
  }
  /* scrawled countdown numerals on the rag wraps */
  for(const [y,z] of [[0.86,0.15],[0.68,0.13]]){
    quad(V(-0.05,y,z), V(0.05,y,z), V(0.04,y-0.08,z+0.01), V(-0.04,y-0.08,z+0.01), P.numeral, 0.06);
  }

  /* ---------- RITUAL DIAL TALISMAN — worn at the chest, hands frozen at a countdown reading ---------- */
  {
    const c = V(0, L.chestY+0.02, 0.16);
    const outer = ring(c, V(0,0,1), 0.075, 0.075, 10, Math.PI/10);
    const inner = ring(c.clone().add(V(0,0,-0.01)), V(0,0,1), 0.058, 0.058, 10, Math.PI/10);
    stitch([outer,inner], ()=>P.dial);
    capFan(inner, c.clone().add(V(0,0,-0.015)), P.dialDk);
    /* clock hands frozen mid-countdown */
    tube(c, c.clone().add(V(0.045,0.02,-0.005)), 0.008, 0.004, 3, P.dialRust);
    tube(c, c.clone().add(V(-0.01,0.05,-0.005)), 0.008, 0.003, 3, P.dialRust);
    /* rust stains at the dial's edge */
    quad(V(c.x+0.06,c.y-0.04,c.z-0.01), V(c.x+0.075,c.y-0.02,c.z-0.01), V(c.x+0.065,c.y-0.07,c.z-0.005), V(c.x+0.05,c.y-0.08,c.z-0.005), P.dialRust, 0.05);
  }

  /* ---------- HEAD — hollow desiccated face, bowed, sunken dark sockets (no eye quads) ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.headBY,      cz:0.01, rx:0.088, rz:0.090, hex:P.skinDk},
      {y:L.headBY+0.09, cz:0.02, rx:0.094, rz:0.088, hex:P.skin},
      {y:L.headTY-0.02, cz:0.00, rx:0.078, rz:0.074, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, L.headTY+0.02, -0.01), P.skinDk);
    /* trailing head-wrap rag over the crown, hanging down the back */
    quad(V(-0.07,L.headTY,-0.03), V(0.07,L.headTY,-0.03), V(0.05,L.headBY-0.10,-0.10), V(-0.05,L.headBY-0.10,-0.10), P.ragLt, 0.05);
    /* sunken dark eye sockets, deep recessed */
    for(const s of [-1,1]){
      quad(V(s*0.05-0.020,L.headBY+0.11,0.07), V(s*0.05+0.020,L.headBY+0.11,0.07),
           V(s*0.05+0.016,L.headBY+0.06,0.075), V(s*0.05-0.016,L.headBY+0.06,0.075), P.socket, 0.02);
    }
    /* hollow cheeks + jaw */
    quad(V(-0.06,L.headBY+0.02,0.06), V(0.06,L.headBY+0.02,0.06), V(0.045,L.headBY-0.06,0.07), V(-0.045,L.headBY-0.06,0.07), P.skinDk, 0.04);
  }

  /* ---------- ARMS — one gripping a staff hung with rusted numeral tags ---------- */
  {
    const shL = V(-0.15, 1.00, 0.00), shR = V(0.15, 1.00, 0.01);
    const elL = V(-0.19, 0.78, 0.06), elR = V(0.20, 0.80, 0.08);
    const hL  = V(-0.15, 0.58, 0.10), hR  = V(0.22, 0.56, 0.16);
    tube(shL, elL, 0.048, 0.038, 6, P.rag);
    tube(elL, hL,  0.038, 0.028, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.008}});
    tube(shR, elR, 0.050, 0.038, 6, P.rag);
    tube(elR, hR,  0.038, 0.028, 6, P.skinDk, {capB:{hex:P.skinDk, lift:0.008}});
    /* staff — planted, rising past the head, hung with numeral tags */
    const s0=V(0.24,0.54,0.18), s1=V(0.20,1.55,0.10);
    tube(s0,s1,0.026,0.016,6,P.staff,{capB:{hex:P.staffDk,lift:0.01}});
    for(const t of [0.35,0.55,0.75]){
      const p = s0.clone().lerp(s1,t);
      const tag0=p.clone().add(V(0.03,0.0,0.0)), tag1=p.clone().add(V(0.03,-0.07,0.0));
      tube(tag0,tag1,0.004,0.004,3,P.tagDk);
      quad(tag1.clone().add(V(-0.02,0,0)), tag1.clone().add(V(0.02,0,0)), tag1.clone().add(V(0.015,-0.04,0)), tag1.clone().add(V(-0.015,-0.04,0)), P.tag, 0.05);
    }
  }

  /* ---------- LEGS — gaunt, wrapped, dragging stance ---------- */
  {
    const legs=(hipX)=>{
      const hip = V(hipX, L.hipY-0.02, 0);
      const knee = V(hipX*0.9, 0.30, 0.03);
      const foot = V(hipX*0.85, 0.03, 0.05);
      tube(hip, knee, 0.062, 0.050, 6, P.rag);
      tube(knee, foot, 0.050, 0.040, 6, P.ragDk, {capB:{hex:P.skinDk, lift:0.015}});
    };
    legs(-0.07); legs(0.07);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
