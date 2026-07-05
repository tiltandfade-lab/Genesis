/* dev/model-qa/creatures/rlm-blazing-ember-skull-oracle.js — BLAZING EMBER-SKULL ORACLE
   (lost-world, Tiny Undead, CR 4). Read: a burning severed skull hovering low, muttering
   fire-lit prophecy — a bare bone skull with cracked fissures glowing ember-orange from
   within, small drifting flame-wisps rising off the cranium, a lower jaw that hangs loose
   and animate, and a scatter of embers/ash drifting below it in place of a body. No eye
   quads — the sockets themselves glow ember-orange (a lit hollow, not a living eye).
   VS-desaturated bone-grey base + ember orange/red glow accents. Whole-object grammar: one
   function, one frame, no anchors. Tiny size, base disc r=0.32. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildBlazingEmberSkullOracle(){
  const P = {
    bone:0xa89a7c, boneDk:0x796c54, boneLt:0xc0b494,
    crack:0x2a1e14,
    ember:0xd97a30, emberDk:0x8f4418, emberHot:0xf0a850,
    socket:0xe0691f,
    tooth:0xdccfa8,
    ash:0x6b6154, ashDk:0x453e34,
    disc:0x4a4038, discTop:0x585047,
  };

  /* SKULL — hovers low, no body; bare cranium narrowing toward a loose animate jaw */
  const hoverY = 0.42;
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:hoverY-0.02, cz:0, rx:0.115, rz:0.118, hex:P.bone},
      {y:hoverY+0.08, cz:0.01, rx:0.135, rz:0.130, hex:P.boneLt},
      {y:hoverY+0.16, cz:0, rx:0.110, rz:0.105, hex:P.boneDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,hoverY+0.22,0.0), P.boneDk);
    capFan(rings[0], V(0,hoverY-0.09,0.0), P.bone, true);

    /* eye sockets — glowing ember hollows, not eye quads */
    for(const s of [-1,1]) quad(V(s*0.038,hoverY+0.02,0.104), V(s*0.060,hoverY+0.02,0.104),
                                 V(s*0.054,hoverY-0.02,0.108), V(s*0.042,hoverY-0.02,0.108), P.socket, 0.05);
    /* nasal cavity, also lit faintly */
    quad(V(-0.016,hoverY-0.01,0.112), V(0.016,hoverY-0.01,0.112), V(0.012,hoverY-0.045,0.115), V(-0.012,hoverY-0.045,0.115), P.emberDk, 0.03);

    /* cracked glowing fissures spidering across the cranium */
    for(const [ax,ay,az,bx,by,bz] of [
      [0.04,hoverY+0.14,0.08, 0.10,hoverY+0.05,0.06],
      [-0.05,hoverY+0.16,0.06, -0.02,hoverY+0.02,0.09],
      [0.0,hoverY+0.20,0.0, -0.08,hoverY+0.12,0.03],
    ]){
      quad(V(ax-0.006,ay,az), V(ax+0.006,ay,az), V(bx+0.005,by,bz), V(bx-0.005,by,bz), P.ember, 0.06);
    }

    /* loose animate lower jaw, hanging slightly open/detached below the cranium */
    const jawT=V(0,hoverY-0.09,0.05), jawB=V(0,hoverY-0.20,0.06);
    tube(jawT, jawB, 0.075, 0.055, n, P.bone, {raz:0.09, rbz:0.06, phase:ph, capB:{hex:P.boneDk, lift:0.01}});
    /* teeth row along the jaw edge */
    for(let i=-2;i<=2;i++) quad(V(i*0.016-0.006,hoverY-0.185,0.10), V(i*0.016+0.006,hoverY-0.185,0.10),
                                 V(i*0.016+0.005,hoverY-0.165,0.10), V(i*0.016-0.005,hoverY-0.165,0.10), P.tooth, 0.03);
  }

  /* FLAME-WISPS — small drifting tongues of fire rising off the top of the cranium */
  {
    const wisp=(cx,cz,h,hex)=>{
      const b=V(cx,hoverY+0.20,cz), m=V(cx*1.3,hoverY+0.20+h*0.6,cz*1.2), t=V(cx*1.6,hoverY+0.20+h,cz*1.5);
      tube(b,m,0.028,0.016,5,hex);
      tube(m,t,0.016,0.003,5,P.emberHot,{capB:{hex:P.emberHot, lift:0.003}});
    };
    wisp(0.02,0.03,0.20,P.ember);
    wisp(-0.05,-0.02,0.15,P.emberDk);
    wisp(0.06,-0.06,0.12,P.ember);
  }

  /* EMBER/ASH SCATTER — drifting embers and ash motes suspended below the skull (no body) */
  {
    for(const [dx,dy,dz,r,hex] of [
      [0.06,-0.10,0.05,0.020,P.ember], [-0.08,-0.16,-0.03,0.016,P.ash],
      [0.02,-0.24,0.08,0.014,P.emberDk], [-0.04,-0.30,-0.06,0.012,P.ashDk],
      [0.10,-0.20,-0.08,0.014,P.ember],
    ]){
      const cx=dx, cy=hoverY+dy, cz=dz;
      quad(V(cx-r,cy,cz), V(cx+r,cy,cz), V(cx+r*0.6,cy+r,cz+r*0.4), V(cx-r*0.6,cy+r,cz+r*0.4), hex, 0.08);
    }
  }

  /* base disc (Tiny: r=0.32) — a scatter of ash/ember settling on the ground beneath the hover */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 14);
    const r2=ring(V(0,0.035,0), V(0,1,0), 0.30, 0.30, 14);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.038,0), P.discTop);
  }
}
