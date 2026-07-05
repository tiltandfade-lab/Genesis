/* dev/model-qa/creatures/rlm-storm-bound-efreeti-corsair.js — STORM-BOUND EFREETI CORSAIR
   (high-seas, Large Elemental, CR 9). Read: a fire-wreathed genie bound INTO a ship's captain's
   FIGUREHEAD — humanoid torso rising fused at the waist from a carved prow-figurehead base, steam
   hissing where flame meets sea-spray. Corsair trappings: a tricorne-suggestion of guttering flame,
   a sash, cutlass. VS-desaturated: charcoal-bronze genie skin, dull ember-orange flame, weathered
   figurehead wood pale and salt-bleached, dull grey steam wisps. Whole-object grammar: one
   function, one frame, no anchors. Large size, base disc r=0.55. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildStormBoundEfreetiCorsair(){
  const P = {
    skin:0x4a3a30, skinDk:0x33261f, skinLt:0x62483a,
    fire:0x8a3a1c, fireDk:0x5c260f, fireLt:0xd08a3a,
    steam:0x8a8c86, steamLt:0xb0b2ac,
    sash:0x6a2a26, sashDk:0x481c18,
    wood:0x8c7d64, woodDk:0x5e5240, woodLt:0xa8977a,          // salt-bleached figurehead wood
    blade:0x9aa0a0, bladeDk:0x6a7070, hilt:0x241d18,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = { hipY:0.80, waistY:1.12, chestY:1.42, shldY:1.68, neckY:1.78, jawY:1.88, crownY:2.06 };

  /* ---------- FIGUREHEAD BASE — carved prow-wood, salt-bleached, fused at the waist. ---------- */
  {
    const b1=ring(V(0,0.06,0.10),V(0,1,0),0.26,0.34,8,Math.PI/8);
    const b2=ring(V(0,0.34,0.06),V(0,1,0),0.24,0.30,8,Math.PI/8);
    const b3=ring(V(0,L.hipY-0.06,0),V(0,1,0),0.22,0.24,8,Math.PI/8);
    stitch([b1,b2],()=>P.woodDk); stitch([b2,b3],()=>P.wood);
    // carved plank-lines on the prow
    for(const y of [0.16,0.24]) quad(V(-0.24,y,0.16),V(0.24,y,0.16),V(0.20,y+0.01,0.10),V(-0.20,y+0.01,0.10),P.woodLt,0.04);
    // curling prow-scroll flourish forward
    tube(V(0,0.20,0.30),V(0.06,0.30,0.42),0.06,0.03,5,P.wood,{capB:{hex:P.woodLt}});
  }

  /* ---------- TORSO — powerful corsair-genie frame rising from the prow, cracked embers glowing. ---------- */
  stack([
    {y:L.hipY,   rx:0.260, rz:0.230, hex:P.skinDk},
    {y:L.waistY, rx:0.280, rz:0.240, hex:P.skin},
    {y:L.chestY, rx:0.330, rz:0.250, hex:P.skinLt},
    {y:L.shldY,  rx:0.400, rz:0.260, hex:P.skin},
    {y:L.neckY,  rx:0.150, rz:0.140, hex:P.skinDk},
  ], 8, {phase:Math.PI/8});
  // sash crossing the chest, corsair trapping
  quad(V(-0.30,L.shldY-0.02,0.16),V(-0.10,L.chestY-0.04,0.20),V(0.02,L.hipY+0.06,0.16),V(-0.20,L.hipY+0.10,0.10),P.sash,0.05);
  // molten crack fissures + ember glow across the chest
  quad(V(0.10,L.chestY+0.06,0.24),V(0.14,L.chestY+0.06,0.24),V(0.09,L.waistY+0.02,0.20),V(0.05,L.waistY+0.02,0.20),P.fire,0.05);
  for(const [x,y,z] of [[0.14,L.chestY,0.26],[-0.10,L.waistY+0.04,0.22]]) blob(x,y,z,0.045,0.03,0.02,P.fireLt,4,3);
  // steam wisps hissing where fire meets the wet figurehead (waist seam)
  for(const [dx,dz] of [[0.20,0.16],[-0.22,0.10],[0.05,0.24]]){
    tube(V(dx,L.hipY-0.04,dz),V(dx*1.3,L.hipY+0.24,dz*0.8),0.03,0.008,4,P.steam,{capB:{hex:P.steamLt,lift:0.02}});
  }

  /* ---------- HEAD — heavy corsair jaw, flame crown suggesting a tricorne. ---------- */
  {
    const bands=[
      {y:L.jawY,   rx:0.150, rz:0.145, hex:P.skinLt},
      {y:L.jawY+0.10, rx:0.160, rz:0.150, hex:P.skin},
      {y:L.crownY-0.10, rx:0.135, rz:0.120, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01),V(0,1,0),b.rx,b.rz,8,Math.PI/8));
    stitch(rings,b=>bands[b].hex);
    capFan(rings.at(-1),V(0,L.crownY-0.02,0),P.skinDk);
    // eye sockets, no eye quads
    for(const s of [-1,1]) quad(V(s*0.055,L.jawY+0.13,0.135),V(s*0.08,L.jawY+0.13,0.135),V(s*0.072,L.jawY+0.06,0.125),V(s*0.058,L.jawY+0.06,0.125),P.fire,0.0);
    // flame crown — tricorne silhouette of guttering flame tongues
    for(const [dx,dz,h] of [[0,0.10,0.24],[0.16,0,0.16],[-0.16,0,0.16],[0.10,-0.10,0.18],[-0.10,-0.10,0.18]]){
      const b=V(dx,L.crownY,dz), t=V(dx*1.3,L.crownY+h,dz*1.2);
      tube(b,t,0.045,0.012,5,P.fire,{capB:{hex:P.fireLt,lift:0.015}});
    }
  }

  /* ---------- ARMS — one gripping a cutlass raised, one braced on the hip. ---------- */
  {
    const S=V(0.40,L.shldY-0.04,0), E=V(0.56,L.chestY+0.08,-0.06), W=V(0.52,L.neckY+0.22,-0.16);
    tube(S,E,0.140,0.108,7,P.skin); tube(E,W,0.108,0.080,7,P.skinDk,{capB:{hex:P.skinDk,lift:0.01}});
    // cutlass blade
    tube(V(0.52,L.neckY+0.24,-0.18),V(0.52,L.neckY+0.24,-0.18),0.03,0.03,4,P.hilt);
    const bladeB=V(0.50,L.neckY+0.32,-0.22), bladeT=V(0.38,L.neckY+0.72,-0.34);
    tube(bladeB,bladeT,0.030,0.010,4,P.blade,{capB:{hex:P.bladeDk,lift:0.01}});
    const S2=V(-0.40,L.shldY-0.04,0), E2=V(-0.44,L.waistY+0.04,0.14), W2=V(-0.34,L.hipY-0.04,0.20);
    tube(S2,E2,0.140,0.108,7,P.skin); tube(E2,W2,0.108,0.080,7,P.skinDk,{capB:{hex:P.skinDk,lift:0.01}});
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0),V(0,1,0),0.55,0.55,18);
    const r2=ring(V(0,0.050,0),V(0,1,0),0.53,0.53,18);
    stitch([r1,r2],()=>P.disc);
    capFan(r2,V(0,0.053,0),P.discTop);
  }
}
