/* dev/model-qa/creatures/rlm-molten-vat-ooze.js — MOLTEN VAT OOZE (ash, Large Ooze, CR 5).
   Read: a chemical-waste slag ooze — a low bulbous mass of glowing molten-slag sludge
   dredged from a factory waste vat, cratered/bubbling surface, streaked with cooling-crust
   scab plates, dripping tendrils reaching from the main mass, faint sickly heat-glow through
   cracks. VS-desaturated base (ash-grey slag crust) with a hot glowing ember-orange
   undertone bleeding through cracks — grit over glow, not clean lava. NO eye quads — this is
   a formless ooze, no face at all. Whole-object grammar: one function, one frame, no
   anchors (uses `blob` for the bulbous mass). Large size, base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildMoltenVatOoze(){
  const P = {
    slag:0x4a4438, slagDk:0x2e2a20, slagLt:0x605a4a,
    crust:0x363228, crustDk:0x201e16,
    ember:0x9a4a1e, emberDk:0x5e2a0e, emberHot:0xc06428,
    drip:0x585044,
    disc:0x4a4038, discTop:0x585047,
  };

  /* MAIN MASS — a low bulbous slag blob, wider than tall */
  blob(0, 0.24, 0, 0.44, 0.30, 0.42, P.slag, 10, 6);
  blob(0, 0.16, 0.02, 0.40, 0.22, 0.38, P.slagDk, 9, 5);

  /* cratered/bubbling surface texture — irregular crust scab plates dotted over the mass */
  {
    const scabs = [
      [-0.22,0.34,-0.16,0.09], [0.18,0.30,0.20,0.08], [0.02,0.42,-0.05,0.07],
      [-0.10,0.26,0.24,0.075], [0.28,0.20,-0.10,0.065], [-0.30,0.18,0.10,0.06],
      [0.08,0.40,0.14,0.06], [-0.02,0.18,-0.28,0.07],
    ];
    for(const [x,y,z,r] of scabs){
      const n=6, ph=Math.PI/n;
      const b1=ring(V(x,y,z), V(0,1,0), r, r*0.9, n, ph);
      const b2=ring(V(x,y+r*0.5,z), V(0,1,0), r*0.7, r*0.6, n, ph);
      stitch([b1,b2], ()=>P.crust);
      capFan(b2, V(x,y+r*0.7,z), P.crustDk);
    }
  }

  /* glowing ember cracks bleeding through the crust — thin bright quads set into the scabs */
  {
    const cracks = [
      [-0.18,0.30,-0.10,0.16,0.36,-0.02],
      [0.10,0.26,0.16,0.22,0.34,0.04],
      [-0.04,0.16,-0.22,0.06,0.24,-0.10],
      [0.22,0.16,-0.06,0.30,0.22,0.02],
    ];
    for(const [x0,y0,z0,x1,y1,z1] of cracks){
      quad(V(x0-0.012,y0,z0), V(x0+0.012,y0,z0), V(x1+0.010,y1,z1), V(x1-0.010,y1,z1), P.ember, 0.10);
      quad(V(x0-0.006,y0+0.004,z0+0.002), V(x0+0.006,y0+0.004,z0+0.002), V(x1+0.005,y1+0.004,z1+0.002), V(x1-0.005,y1+0.004,z1+0.002), P.emberHot, 0.12);
    }
    /* a couple of open bubbling craters glowing from within */
    for(const [x,z] of [[-0.14,0.06],[0.16,-0.12]]){
      const n=6, ph=Math.PI/n;
      const rim = ring(V(x,0.34,z), V(0,1,0), 0.055, 0.05, n, ph);
      capFan(rim, V(x,0.30,z), P.emberDk, true);
      stitch([rim, ring(V(x,0.32,z), V(0,1,0), 0.04, 0.036, n, ph)], (b)=> b===0?P.crustDk:P.ember);
    }
  }

  /* DRIPPING TENDRILS reaching from the main mass, drooping to the ground */
  {
    const tendril=(bx,bz,dx,dz,len)=>{
      const base = V(bx, 0.30, bz);
      const mid  = V(bx+dx*0.5, 0.14, bz+dz*0.5);
      const tip  = V(bx+dx, 0.03, bz+dz);
      tube(base, mid, 0.070, 0.045, 6, P.slag);
      tube(mid, tip, 0.045, 0.018, 6, P.slagDk, {capB:{hex:P.emberDk, lift:0.006}});
    };
    tendril(-0.30, 0.14, -0.14, 0.16, 0.2);
    tendril( 0.32, 0.10,  0.16, 0.12, 0.2);
    tendril( 0.02, -0.34, 0.04,-0.18, 0.2);
    tendril(-0.10, 0.36, -0.02, 0.20, 0.2);
  }

  /* small cooling-slag puddle spatters on the disc floor near the base */
  {
    for(const [x,z,r] of [[-0.38,0.22,0.07],[0.36,-0.10,0.06],[-0.06,-0.40,0.05]]){
      quad(V(x-r,0.012,z), V(x+r,0.012,z), V(x+r*0.7,0.008,z+r*0.6), V(x-r*0.7,0.008,z+r*0.6), P.drip, 0.06);
    }
  }

  /* base disc (Large: r=0.55) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
