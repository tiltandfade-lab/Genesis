/* dev/model-qa/creatures/rlm-the-broodship-heart.js — THE BROODSHIP HEART (chrome, Gargantuan
   bio-construct hybrid, CR 12). Read: a massive beating organic engine-core — half bio-mass,
   half salvaged ship-hull chrome, a huge pulsing central heart-chamber wrapped in torn hull-plate
   ribs, anchored by thick root-tendrils, with smaller birthing-sacs clustered at its base still
   producing horrors (small membrane pods, some split open and empty). Chrome register: wet organic
   crimson/magenta bio-mass fused to salvage gunmetal — the most "flesh-meets-machine" of the roster.
   NO eye quads (it has no face — this is a core/organ, not a humanoid). Whole-object grammar: one
   function, one frame, no anchors. Gargantuan size, base disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildTheBroodshipHeart(){
  const P = {
    hull:0x565d60, hullDk:0x2e3336, hullLt:0x767d80,
    flesh:0x7a2c38, fleshDk:0x481620, fleshLt:0x9c4652,
    vein:0x3a1018, wetGlow:0xd85a68,
    membrane:0x6a3848, membraneDk:0x3c1c26, membraneLt:0x8a5464,
    root:0x2a2420, rootDk:0x161210,
    disc:0x4a4038, discTop:0x585047,
  };

  const S = {
    base:  V(0, 0.90, 0),
    mid:   V(0, 1.55, 0),
    upper: V(0, 2.15, 0),
    top:   V(0, 2.55, 0),
  };

  /* the huge central heart-chamber — a swollen organic bulge banded top and bottom by torn
     salvaged hull-plate ribs, biggest single mass in the roster */
  {
    const n=12, ph=Math.PI/n;
    const bands=[
      {y:S.base.y,  rx:0.55, rz:0.50, hex:P.hullDk},
      {y:1.15,      rx:0.68, rz:0.62, hex:P.flesh},
      {y:S.mid.y,   rx:0.74, rz:0.68, hex:P.fleshLt},
      {y:1.90,      rx:0.66, rz:0.60, hex:P.flesh},
      {y:S.upper.y, rx:0.48, rz:0.44, hex:P.hullDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,S.top.y-0.20,0), P.hullDk);
    capFan(rings[0], V(0,S.base.y-0.20,0), P.hullDk, true);

    /* torn hull-plate ribs wrapping the swollen flesh — salvage-chrome cage over the organ */
    for(let i=0;i<n;i+=2){
      const a = ph*2*i;
      const x0 = Math.cos(a)*0.50, z0 = Math.sin(a)*0.46;
      const x1 = Math.cos(a)*0.78, z1 = Math.sin(a)*0.72;
      quad(V(x0,1.05,z0), V(x1,1.30,z1), V(x1*0.97,1.85,z1*0.97), V(x0*0.97,1.75,z0*0.97), P.hull, 0.07);
    }
    /* wet pulsing veins running the surface — bright bio-glow accents */
    for(let i=0;i<6;i++){
      const a = (i/6)*Math.PI*2 + 0.3;
      const x = Math.cos(a)*0.60, z = Math.sin(a)*0.55;
      quad(V(x*0.9,1.25,z*0.9), V(x*0.95,1.25,z*0.95), V(x,1.75,z), V(x*0.95,1.75,z*0.95), P.wetGlow, 0.12);
    }
  }

  /* birthing-sacs clustered at the base — membrane pods still producing horrors, some split open */
  {
    const sac=(ang, dist, ry, split)=>{
      const bx=Math.cos(ang)*dist, bz=Math.sin(ang)*dist;
      const sc = V(bx, ry, bz);
      const n=7, ph=Math.PI/n;
      const bands=[
        {y:sc.y-0.14, rx:0.16, rz:0.15, hex:P.membraneDk},
        {y:sc.y,       rx:0.20, rz:0.19, hex:P.membrane},
        {y:sc.y+0.13, rx:0.14, rz:0.13, hex:P.membraneLt},
      ];
      const rings=bands.map(b=>ring(V(sc.x,b.y,sc.z), V(0,1,0), b.rx, b.rz, n, ph));
      stitch(rings, b=>bands[b].hex);
      if(split){
        /* split-open pod — a dark torn cavity mouth instead of a capped top, "already birthed" read */
        quad(V(sc.x-0.09,sc.y+0.10,sc.z), V(sc.x+0.09,sc.y+0.10,sc.z), V(sc.x+0.05,sc.y+0.22,sc.z+0.02), V(sc.x-0.05,sc.y+0.22,sc.z+0.02), P.fleshDk, 0.07);
      } else {
        capFan(rings.at(-1), V(sc.x,sc.y+0.18,sc.z), P.membraneLt);
        /* a faint glow at the sealed tip — something still gestating inside */
        quad(V(sc.x-0.03,sc.y+0.13,sc.z+0.10), V(sc.x+0.03,sc.y+0.13,sc.z+0.10), V(sc.x+0.02,sc.y+0.16,sc.z+0.10), V(sc.x-0.02,sc.y+0.16,sc.z+0.10), P.wetGlow, 0.15);
      }
    };
    sac(0.3, 0.62, 0.55, false);
    sac(1.4, 0.66, 0.50, true);
    sac(2.5, 0.60, 0.58, false);
    sac(3.7, 0.64, 0.52, true);
    sac(4.9, 0.62, 0.56, false);
  }

  /* thick root-tendrils anchoring the whole mass to the ground — bio-fused salvage cable */
  {
    const rootTendril=(ang, dist)=>{
      const bx=Math.cos(ang)*dist, bz=Math.sin(ang)*dist;
      const top = V(bx*0.4, S.base.y-0.10, bz*0.4);
      const mid = V(bx*0.9, 0.40, bz*0.9);
      const foot = V(bx*1.15, 0.04, bz*1.15);
      tube(top, mid, 0.18, 0.11, 7, P.root, {phase:Math.PI/7});
      tube(mid, foot, 0.11, 0.06, 7, P.rootDk, {phase:Math.PI/7, capB:{hex:P.rootDk, lift:0.02}});
    };
    rootTendril(0.0, 0.62); rootTendril(0.9, 0.64); rootTendril(1.9, 0.60);
    rootTendril(2.9, 0.62); rootTendril(3.9, 0.64); rootTendril(5.0, 0.60);
  }

  /* base disc (Gargantuan: r=0.72) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.69, 0.69, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
