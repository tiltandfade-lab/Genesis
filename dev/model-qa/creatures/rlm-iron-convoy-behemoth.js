/* dev/model-qa/creatures/rlm-iron-convoy-behemoth.js — IRON CONVOY BEHEMOTH (ash realm, Huge
   Construct, CR 8). Read: an animated war-rig hauler — a long armored truck-cab-and-trailer
   frame that has come alive, riding on six huge treaded wheels, a jutting battering-ram grille
   for a "face" (single lit headlamp-eye, no eye quad), exhaust stacks like horns, chain-linked
   armor plating along the flanks, a crushing ram-plow at the front. Reads as a vehicle-monster
   silhouette — long and low, not humanoid. VS-desaturated ash palette: rust-streaked gunmetal,
   faded convoy paint, black treads. Whole-object grammar: one function, one merged frame, no
   anchors. Huge size, base disc r=0.68. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildIronConvoyBehemoth(){
  const P = {
    hull:0x4e4a40, hullDk:0x2e2b25, hullLt:0x666050,
    paint:0x6a3428, paintDk:0x421e16, paintLt:0x854434,
    rust:0x7a4a2e, rustDk:0x4e2f1c,
    tread:0x201e1a, treadDk:0x141310, rim:0x39362e,
    chain:0x403c34, rivet:0x1c1a16,
    lamp:0xc4a860, lampDk:0x7a6234,
    exhaust:0x38352c, exhaustDk:0x201e19,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — long low chassis spine along +z (cab at +z, trailer trailing -z). --- */
  const chY = 0.62;   // chassis-deck height
  const S = {
    trailerBack: V(0, chY, -1.05),
    trailerMid:  V(0, chY+0.02, -0.55),
    trailerFore: V(0, chY+0.02, -0.10),
    cabRear:     V(0, chY+0.05, 0.20),
    cabFore:     V(0, chY+0.02, 0.52),
    grille:      V(0, chY-0.05, 0.72),
  };

  /* ---------- HULL — one long low armored loft, cab higher/narrower than the boxy trailer. ---------- */
  tube(S.trailerBack, S.trailerMid,  0.340, 0.360, 8, P.hull,   {raz:0.300, rbz:0.310, phase:Math.PI/8, capA:{hex:P.hullDk, lift:0.03}});
  tube(S.trailerMid,  S.trailerFore, 0.360, 0.330, 8, P.paint,  {raz:0.310, rbz:0.290, phase:Math.PI/8});
  tube(S.trailerFore, S.cabRear,     0.330, 0.260, 8, P.hull,   {raz:0.290, rbz:0.230, phase:Math.PI/8});
  tube(S.cabRear,     S.cabFore,     0.260, 0.220, 8, P.paintLt,{raz:0.230, rbz:0.190, phase:Math.PI/8});
  tube(S.cabFore,     S.grille,      0.220, 0.190, 8, P.hullDk, {raz:0.190, rbz:0.170, phase:Math.PI/8});

  // convoy paint stripe down the trailer flank
  quad(V(-0.36,chY+0.10,-1.0),V(-0.36,chY+0.10,-0.05),V(-0.365,chY-0.12,-0.05),V(-0.365,chY-0.12,-1.0), P.paint, 0.05);
  quad(V(0.36,chY+0.10,-1.0),V(0.36,chY+0.10,-0.05),V(0.365,chY-0.12,-0.05),V(0.365,chY-0.12,-1.0), P.paintDk, 0.05);
  // rust streaks + rivets down the whole hull
  for(const [x,z] of [[-0.30,-0.7],[0.28,-0.3],[-0.25,0.15]]) quad(V(x-0.02,chY+0.15,z),V(x+0.02,chY+0.15,z),V(x+0.016,chY-0.14,z-0.02),V(x-0.016,chY-0.14,z-0.02),P.rust,0.08);
  for(const z of [-0.9,-0.6,-0.3,0.0,0.3]) for(const x of [-0.30,0.30]) quad(V(x-0.012,chY+0.05,z),V(x+0.012,chY+0.05,z),V(x+0.01,chY+0.03,z-0.01),V(x-0.01,chY+0.03,z-0.01),P.rivet,0.02);

  /* ---------- CHAIN-LINKED ARMOR PLATING along the flanks. ---------- */
  for(const s of [-1,1]){
    for(const z of [-0.85,-0.5,-0.15,0.25]){
      quad(V(s*0.36,chY+0.02,z-0.10),V(s*0.40,chY+0.02,z+0.10),V(s*0.38,chY-0.18,z+0.10),V(s*0.34,chY-0.18,z-0.10), P.hullLt, 0.06);
    }
    quad(V(s*0.30,chY+0.14,-0.95),V(s*0.30,chY+0.14,0.30),V(s*0.32,chY+0.10,0.30),V(s*0.32,chY+0.10,-0.95), P.chain, 0.09); // hanging chain-run
  }

  /* ---------- SIX HUGE TREADED WHEELS — three axles per side. ---------- */
  {
    const wheel=(x,z)=>{
      const c=V(x,0.22,z);
      const r1=ring(c, V(1,0,0), 0.24, 0.24, 10, Math.PI/10);
      const r2=ring(V(x+Math.sign(x)*0.10,0.22,z), V(1,0,0), 0.24, 0.24, 10, Math.PI/10);
      stitch([r1,r2], ()=>P.tread);
      capFan(r1, V(x,0.22,z), P.treadDk);
      capFan(r2, V(x+Math.sign(x)*0.12,0.22,z), P.treadDk, true);
      // rim hub
      const rr=ring(V(x+Math.sign(x)*0.02,0.22,z), V(1,0,0), 0.10, 0.10, 8, Math.PI/8);
      capFan(rr, V(x+Math.sign(x)*0.02,0.22,z), P.rim);
    };
    for(const s of [-1,1]){
      wheel(s*0.42, -0.80);
      wheel(s*0.42, -0.30);
      wheel(s*0.42,  0.35);
    }
  }

  /* ---------- FRONT GRILLE / "FACE" — a battering-ram grille with a single headlamp-eye. ---------- */
  {
    quad(V(-0.17,chY+0.05,0.74),V(0.17,chY+0.05,0.74),V(0.15,chY-0.16,0.76),V(-0.15,chY-0.16,0.76), P.hullDk, 0.05);
    for(let i=0;i<4;i++){ const y=chY+0.02-i*0.05; quad(V(-0.14,y,0.745),V(0.14,y,0.745),V(0.13,y-0.02,0.75),V(-0.13,y-0.02,0.75), P.rustDk, 0.04); } // grille bars
    // single lit headlamp-eye (no eye quad — a lamp shape, off-center like a cyclops headlight)
    blob(0.0,chY-0.02,0.78,0.055,0.048,0.02,P.lamp,6,4);
    blob(0.0,chY-0.02,0.79,0.030,0.026,0.010,P.lampDk,4,3);
    // ram-plow at the very front, low and wide
    quad(V(-0.22,0.30,0.80),V(0.22,0.30,0.80),V(0.16,0.10,0.88),V(-0.16,0.10,0.88), P.hullLt, 0.06);
    quad(V(-0.16,0.10,0.88),V(0.16,0.10,0.88),V(0.10,0.02,0.90),V(-0.10,0.02,0.90), P.rust, 0.07);
  }

  /* ---------- EXHAUST STACKS — like horns, rising off the cab roof. ---------- */
  for(const s of [-1,1]){
    const b=V(s*0.14, chY+0.20, 0.30), t=V(s*0.15, chY+0.52, 0.24);
    tube(b,t,0.032,0.024,6,P.exhaust,{capB:{hex:P.exhaustDk,lift:0.006}});
    blob(t.x,t.y+0.02,t.z,0.026,0.014,0.024,P.exhaustDk,4,3); // sooty cap
  }

  /* ---------- base disc (Huge r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.060,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.063,0), P.discTop);
  }
}
