/* dev/model-qa/creatures/rlm-the-hamelin-piper.js — THE HAMELIN PIPER (bright-kingdom, Medium,
   CR 11). A gaunt piper in motley, pipe always at his lips, never draws a blade. Read: a tall
   gaunt humanoid in patchwork motley (parti-colored red/gold/black diamond panels), a long thin
   reed pipe held permanently raised to his lips with both hands (never a free weapon hand), a
   soft floppy jester-peaked cap, and long spindly limbs. No eye quads (dark socket recesses
   under an unsettling half-smile). Whole-object grammar, one merged frame, no anchors. Medium
   disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheHamelinPiper(){
  const P = {
    motleyR:0x8a2a30, motleyG:0x9c7d3a, motleyB:0x2c2a26,
    skin:0x9c8a70, skinDk:0x6e6048,
    cap:0x6e2a30, capDk:0x4a1c20, bell:0x9c7d3a,
    pipe:0x6b5638, pipeDk:0x453626, pipeLt:0x8a7048,
    disc:0x463c2f, discTop:0x554839,
  };

  const spY = 0.66;
  /* ---------- TORSO — tall gaunt body in patchwork motley diamond panels. ---------- */
  const bands=[
    {y:0.02,  rx:0.130, hex:P.motleyB},
    {y:0.22,  rx:0.135, hex:P.motleyR},
    {y:0.44,  rx:0.120, hex:P.motleyG},
    {y:0.64,  rx:0.100, hex:P.motleyB},
    {y:0.82,  rx:0.078, hex:P.motleyR},   // gaunt narrow shoulders
    {y:0.94,  rx:0.052, hex:P.skin},
  ];
  {
    const n=9, ph=Math.PI/n;
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rx*0.82, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0,0.01,0), P.motleyB, true);
  }
  // diamond patchwork accent panels breaking up the torso bands
  {
    const diamonds=[[0.10,0.32,P.motleyG],[-0.10,0.52,P.motleyR],[0.09,0.70,P.motleyB]];
    for(const [dx,dy,hex] of diamonds){
      const cz=0.10;
      quad(V(dx,dy+0.05,cz), V(dx+0.05,dy,cz), V(dx,dy-0.05,cz), V(dx-0.05,dy,cz), hex, 0.06);
    }
  }

  /* ---------- HEAD — narrow gaunt face, unsettling half-smile, dark socket recesses. ------------ */
  {
    const n=9, ph=Math.PI/n;
    const hb=[
      {y:0.97, cz:0.00, rx:0.070, rz:0.073, hex:P.skin},
      {y:1.06, cz:0.01, rx:0.072, rz:0.068, hex:P.skinDk},
      {y:1.15, cz:0.00, rx:0.055, rz:0.057, hex:P.skin},
    ];
    const rings = hb.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>hb[b].hex);
    capFan(rings.at(-1), V(0,1.17,0.00), P.skin);
    // dark socket recesses
    for(const s of [-1,1]){
      const sx=s*0.032, sy=1.075, sz=0.062;
      quad(V(sx-0.012,sy+0.010,sz), V(sx+0.012,sy+0.010,sz), V(sx+0.009,sy-0.010,sz+0.004), V(sx-0.009,sy-0.010,sz+0.004), P.skinDk, 0.04);
    }
    // unsettling half-smile — one side raised, one flat
    quad(V(-0.020,1.020,0.070), V(0.010,1.020,0.070), V(0.006,1.010,0.075), V(-0.018,1.006,0.075), P.skinDk, 0.03);

    /* soft floppy jester-peaked cap, single drooping point with a small bell. */
    const cb0=ring(V(0,1.16,0), V(0,1,0), 0.062, 0.064, n, ph);
    const cb1=ring(V(0,1.22,-0.01), V(0,1,0), 0.052, 0.054, n, ph);
    stitch([cb0,cb1], ()=>P.cap);
    // drooping peak curling forward-down
    const p0=V(0,1.22,-0.01), p1=V(0.05,1.34,0.10), p2=V(0.12,1.30,0.24), tip=V(0.16,1.20,0.30);
    tube(p0,p1,0.045,0.030,6,P.cap);
    tube(p1,p2,0.030,0.016,6,P.capDk);
    tube(p2,tip,0.016,0.004,6,P.cap,{capB:{hex:P.cap, lift:0.004}});
    // little bell on the tip
    const bl0=ring(tip, V(0,1,0), 0.018, 0.018, 6);
    capFan(bl0, V(tip.x,tip.y+0.012,tip.z), P.bell);
  }

  /* ---------- ARMS — BOTH hands raised, holding the pipe permanently to his lips. --------------- */
  {
    const sh1 = V(0.09, 0.90, 0.03);
    const el1 = V(0.14, 0.85, 0.20);
    const hd1 = V(0.03, 0.99, 0.32);
    tube(sh1, el1, 0.032, 0.024, 6, P.motleyR);
    tube(el1, hd1, 0.024, 0.016, 6, P.skinDk, {capB:{hex:P.skin, lift:0.006}});

    const sh2 = V(-0.09, 0.88, 0.03);
    const el2 = V(-0.10, 0.83, 0.18);
    const hd2 = V(-0.05, 0.985, 0.30);
    tube(sh2, el2, 0.032, 0.024, 6, P.motleyG);
    tube(el2, hd2, 0.024, 0.016, 6, P.skinDk, {capB:{hex:P.skin, lift:0.006}});

    /* PIPE — a long thin reed pipe spanning from the mouth outward, held by both hands. */
    const mouthP = V(0, 1.005, 0.075);
    const pipeEnd = V(0.14, 0.955, 0.36);
    tube(mouthP, pipeEnd, 0.014, 0.007, 6, P.pipe, {capB:{hex:P.pipeDk, lift:0.004}});
    // finger holes along the pipe
    for(let i=1;i<=3;i++){
      const t=i/4;
      const hx=mouthP.x+(pipeEnd.x-mouthP.x)*t, hy=mouthP.y+(pipeEnd.y-mouthP.y)*t, hz=mouthP.z+(pipeEnd.z-mouthP.z)*t;
      quad(V(hx-0.005,hy+0.01,hz), V(hx+0.005,hy+0.01,hz), V(hx+0.004,hy-0.01,hz), V(hx-0.004,hy-0.01,hz), P.pipeLt, 0.04);
    }
  }

  /* ---------- LEGS — long spindly gaunt legs. ---------- */
  {
    const leg=(hip,knee,foot,hex)=>{
      tube(hip, knee, 0.046, 0.032, 7, hex);
      tube(knee, foot, 0.032, 0.024, 7, P.motleyB, {capB:{hex:P.motleyB, lift:0.006}});
    };
    leg(V(-0.06,0.03,0.01), V(-0.07,0.30,0.06), V(-0.07,0.02,0.09), P.motleyR);
    leg(V( 0.06,0.03,0.01), V( 0.07,0.30,0.06), V( 0.07,0.02,0.09), P.motleyG);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.020,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.022,0), P.discTop, true);
  }
}
