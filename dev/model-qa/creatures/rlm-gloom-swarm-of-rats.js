/* dev/model-qa/creatures/rlm-gloom-swarm-of-rats.js — SWARM OF RATS (gloom, CR 2, Medium).
   THE RAT KING: dozens of sewer rats fused tail-to-tail into one furious many-headed knot.

   FEATURE CHECKLIST (what the tri budget buys):
     1. Central BRAIDED TAIL HUB — dark knotted fur core wearing a crown of pale naked tails
        twisted/looped together (the signature; pale = the one high-value zone, law 3).
     2. 7 individual rat bodies radiating out from the hub, heads out, tails merging into it —
        countable rump->shoulder->pointed-snout lofts (law 1: tris spent on countable rats).
     3. Round ears per rat, seated off the skull surface (law: seat from surface not center).
     4. Front paws/claws per rat, angled outward-down (grounded rats) or outward-up (rearing rats)
        — the "clawing outward in different directions" read.
     5. Two rats REARING off the top of the knot (pitched up, chest/head lifted) vs five low and
        wide clawing at the ground — the boil, mid-roll pose (law 5, never at-attention).
     6. Coat variation (3 fur tones cycling) so the mass reads as many bodies, not one blob.

   POSE SENTENCE: the knot is mid-roll — five rats claw outward low across the ground in a
   splayed ring while two rear up off the top of the tangled mass, snarling, front paws raised.

   Whole-object grammar: one exported build fn, probe-lib primitives only, spine +z per rat body
   (local frame per radiating arm), ground y=0. No anchors, no ES-module cross-imports besides
   probe-lib. Gloom realm palette pulled from the Threshold Rat entry (matted grey-brown vermin,
   clouded dark eyes) — no eye quads per the 2026-07-04 house ruling (vermin get no eyes). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildSwarmOfRats(){
  const P = {
    fur:0x6b6053, fur2:0x5c5142, fur3:0x746654,      // 3 cycling coats
    furDk:0x453d33, snout:0x847264, nose:0x241d18,
    ear:0x8f7a68, foot:0x362f27,
    tailDk:0x77664f, tail:0xc7b89e,                   // pale braided tail (the signature, high-value)
    knot:0x3c342a,                                    // dark fused core under the braid
    disc:0x4a4038, discTop:0x584f45,
  };

  const hubY = 0.095;

  /* local frame for one radiating rat arm: yaw spreads it around the hub, pitch lifts the whole
     body (rearing). lx/ly/lz are local coords (lz = outward along the arm, ly = local up). */
  function frame(yaw, pitch){
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const cy = Math.cos(yaw),   sy = Math.sin(yaw);
    return (lx, ly, lz) => {
      const y1 = ly*cp + lz*sp, z1 = -ly*sp + lz*cp;        // pitch about local x (positive pitch REARS UP)
      const x2 = lx*cy + z1*sy, z2 = -lx*sy + z1*cy;        // yaw about y
      return V(x2, hubY + y1, z2);
    };
  }

  /* one rat body: tail root buried in the hub -> rump -> shoulder -> pointed snout, at the far
     end. sc scales the whole arm (~0.85..1.05). rear=true lifts paws for the clawing-up read. */
  function rat(yaw, pitch, sc, coat, rear){
    const P3 = (lx, ly, lz) => { const p = frame(yaw, pitch)(lx*sc, ly*sc, lz*sc); return p; };

    const rump  = P3(0, 0.020, 0.11);
    const mid   = P3(0, 0.030, 0.26);
    const shldr = P3(0, 0.022, 0.40);
    const snB   = P3(0, -0.006, 0.50);
    const snT   = P3(0, -0.026, 0.60);
    tube(rump,  mid,   0.090, 0.100, 7, coat,    {phase:Math.PI/7});
    tube(mid,   shldr, 0.100, 0.076, 7, coat,    {phase:Math.PI/7});
    tube(shldr, snB,   0.076, 0.048, 7, P.furDk, {phase:Math.PI/7});
    tube(snB,   snT,   0.048, 0.015, 7, P.snout, {phase:Math.PI/7, capB:{hex:P.nose, lift:0.007}});

    /* two round ears seated off the skull surface, clear of the body — sized to clear the
       0.04u feature floor so they survive 1/3-res dither instead of dissolving */
    for(const s of [-1,1]){
      const eb = P3(s*0.060, 0.078, 0.38);
      const et = P3(s*0.095, 0.148, 0.37);
      tube(eb, et, 0.022, 0.040, 6, P.ear, {capB:{hex:P.ear, lift:0.005}});
    }

    /* front paws — clawing outward-down for grounded rats, raised outward-up for rearing rats.
       PASS-2 FIX: rear paws were lofted to lz=0.54/ly=0.20, which — compounded through the
       pitch rotation on the two high-pitch rearing rats — launched the paw ~0.15u above the
       rat's own snout tip, reading as a disconnected floating spike (a stray antenna) rather
       than "a paw raised near the snarling head". Pulling the paw closer in z (nearer the
       shoulder/snout cluster) and lowering the lift keeps it visually anchored to the head. */
    const clawLift = rear ? 0.12 : -0.09;
    for(const s of [-1,1]){
      const hip  = P3(s*0.060, 0.012, 0.42);
      const foot = P3(s*0.13,  clawLift, 0.46);
      tube(hip, foot, 0.027, 0.018, 5, coat, {capB:{hex:P.foot, lift:0.004}});
    }
  }

  /* ---------- 7 rats radiating from the hub: 5 low/wide clawing the ground, 2 rearing up ---------- */
  //  i   yaw(rad)              pitch     scale   coat        rear
  const coats = [P.fur, P.fur2, P.fur3];
  const arms = [
    { yaw: 0.10,               pitch: 0.50, sc: 0.98, rear: true  },
    { yaw: 0.95,               pitch: 0.08, sc: 1.00, rear: false },
    { yaw: 1.80,               pitch: 0.05, sc: 0.90, rear: false },
    { yaw: 2.62,               pitch: 0.55, sc: 0.95, rear: true  },
    { yaw: 3.55,               pitch: 0.06, sc: 0.92, rear: false },
    { yaw: 4.45,               pitch: 0.03, sc: 1.02, rear: false },
    { yaw: 5.35,               pitch: 0.10, sc: 0.88, rear: false },
  ];
  arms.forEach((a, i) => rat(a.yaw, a.pitch, a.sc, coats[i % 3], a.rear));

  /* ---------- the fused hub: dark knotted core + a crown of pale braided tails (the SIGNATURE,
     the one high-value zone the whole model reads by) ---------- */
  blob(0, hubY + 0.05, 0, 0.10, 0.075, 0.10, P.knot, 7, 4);

  const B = 6;
  for(let k=0;k<B;k++){
    const a = (k/B)*Math.PI*2 + 0.35;
    const a1 = a + 0.42, a2 = a + 0.95, a3 = a + 1.35;
    const t0 = V(0.030*Math.cos(a),  hubY + 0.015, 0.030*Math.sin(a));
    const t1 = V(0.105*Math.cos(a1), hubY + 0.150, 0.105*Math.sin(a1));
    const t2 = V(0.065*Math.cos(a2), hubY + 0.230, 0.065*Math.sin(a2));
    const t3 = V(0.020*Math.cos(a3), hubY + 0.165, 0.020*Math.sin(a3));
    tube(t0, t1, 0.028, 0.022, 5, P.tailDk, {phase:Math.PI/5});
    tube(t1, t2, 0.022, 0.015, 5, P.tail,   {phase:Math.PI/5});
    tube(t2, t3, 0.015, 0.006, 5, P.tail,   {phase:Math.PI/5, capB:{hex:P.tail, lift:0.004}});
  }

  /* ---------- base disc (Medium: r=0.42, house pattern) ---------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2 = ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
