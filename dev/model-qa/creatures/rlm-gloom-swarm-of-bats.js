/* dev/model-qa/creatures/rlm-gloom-swarm-of-bats.js — SWARM OF BATS landmark table (WINGED/AVIAN
   family, Large, CR 1/4, realm gloom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri
   band (2026-07-08 foundry pilot, gloom-w2 cell 7 — REQUEUE: wave-2 author reported green but
   wrote no file; this is the actual pass-1 author). Core identity: a rafters-thick cloud of bats
   that only stirs when the church bell cracks midnight — bespoke to render key "swarm-of-bats";
   realm reskins ride this chassis narratively (data/realm-bestiary.js "Feral Barn Bat-Swarm").

   FEATURE CHECKLIST (the ~1,100-1,300 budget buys):
     1. WINGED anatomy per ANATOMY-CANON §WINGED, authored INDIVIDUALLY on each bat in the swarm —
        wing = arm-analog: shoulder -> thickened leading-edge spar -> wrist, then TWO finger struts
        fanning back from the wrist (lead digit + trailing digit) with a scalloped membrane bay
        pulled in between them (never a single flat fabric panel off the shoulder).
     2. SIGNATURE — the VORTEX: 8 individual bats arranged in a rising funnel off the disc, tight
        near the ground, widening through the middle, two peeling outward off the top — the pour,
        not a static roost (law 4's one loud feature, taken from "pouring down in one shrieking
        mass").
     3. Countable individuals — each bat gets its own tapered body, pointed ears, and open-mouth
        read at small scale, so the mass reads as many bodies stacked in a spiral, not one blob.
     4. Every bat at a DIFFERENT wing-beat angle — per-bat asymmetric up/down flap phase (law 5:
        never a uniform synchronized flap, never at-attention).
     5. Value contrast — pale lit wing membrane on the upper/outer bats catching the light at the
        top of the cloud, darker membrane tone on the lower/inner bats still in shadow near the
        rafters (law 3's high-value zone riding the signature).
     6. Base disc (Large, r=0.55) — the swarm hovers/pours up off it, no bat touches down, no
        visible support strut (matches the flying-roster hover convention).

   POSE SENTENCE: the pour — the swarm boils up off the rafters in a rising funnel, the lowest
   bats still tight and low near the disc, the column widening as it climbs, the highest two bats
   peeling outward off the top of the vortex and breaking away, every wing at a different beat.

   Whole-object grammar: one exported build fn, probe-lib primitives only, LOCAL FRAME per bat via
   a rot3() closure (yaw about world +y only, so world-space mixing can't happen), ground y=0, no
   anchors. Imported by ps1-sheet.html (SETS['gloom-w2'], cell 7, fn buildSwarmOfBats). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSwarmOfBats(){
  /* ---------- PALETTE (VS-desaturated dark fur; membrane pale carries the light at the top of
     the cloud — law 3's high-value zone) ---------- */
  const P = {
    fur:0x564739, furDk:0x3b2f25, furLt:0x6e5c4a,
    spar:0x2e2419, claw:0x160f0a,
    ear:0x453729,
    membraneLt:0xd8c0a0,      /* the lit, top-of-cloud wing tone — the signature's high-value zone */
    membrane:0x4a3c2e,        /* the shadowed, low-in-the-cloud wing tone */
    disc:0x352c22, discTop:0x413526,
  };

  /* one bat, fully local: rot3 maps local (x,y,z) -> world, rotating only about world +y (yaw)
     and scaling uniformly — every point for this bat passes through it, so nothing raw world-
     space ever gets mixed into the local frame (the coordinate-frame warning). */
  function bat(cx, cy, cz, scale, yaw, flapR, flapL, lit){
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const rot3 = (lx, ly, lz) => V(cx + (lx*c - lz*s)*scale, cy + ly*scale, cz + (lx*s + lz*c)*scale);
    const membraneHex = lit ? P.membraneLt : P.membrane;
    const furHex = lit ? P.furLt : P.fur;

    /* ---------- body: tail -> chest -> head, small tapered loft (local +z = forward) ---------- */
    const tail  = rot3(0, -0.020, -0.095);
    const chest = rot3(0,  0.018,  0.020);
    const head  = rot3(0,  0.010,  0.115);
    tube(tail, chest, 0.028, 0.044, 4, furHex, {capA:{hex:P.furDk}});
    tube(chest, head, 0.044, 0.020, 4, P.furDk, {capB:{hex:P.furDk, lift:0.006}});

    /* small pointed ears off the skull, angled up-out */
    for(const side of [-1, 1]){
      const eb = rot3(side*0.018, 0.028, 0.095);
      const et = rot3(side*0.048, 0.078, 0.070);
      const ef = rot3(side*0.008, 0.032, 0.108);
      quad(eb, ef, et, et, P.ear, 0.06);
    }
    /* tiny dark open-mouth notch at the snout tip — the countable "this is a bat" close-up tell */
    const mB = rot3(0, -0.006, 0.128);
    const mT = rot3(0, 0.008, 0.132);
    quad(rot3(-0.012, -0.006, 0.122), rot3(0.012, -0.006, 0.122), mT, mB, P.spar, 0.08);

    /* ---------- wings: shoulder -> leading-edge spar -> wrist, then lead + trailing finger
       struts fanning back from the wrist with a scalloped membrane bay pulled between them
       (ANATOMY-CANON §WINGED: wing is an arm-analog, never a flat fabric panel). ------------- */
    function wing(side, flap){
      const SH = rot3(side*0.020, 0.020, 0.010);
      const WR = rot3(side*0.220, 0.020 + flap*0.095, -0.010);
      const F0 = rot3(side*0.430, 0.020 + flap*0.190, -0.060);   /* lead digit — thick */
      const F1 = rot3(side*0.300, 0.000 + flap*0.150, -0.165);   /* trailing digit — thin, swept back */
      const ROOT = rot3(side*0.018, -0.004, 0.055);               /* body flank attachment (aft of shoulder) */

      tube(SH, WR, 0.018, 0.013, 4, P.spar);                       /* leading-edge spar (humerus/radius) */
      tube(WR, F0, 0.011, 0.005, 4, P.spar, {capB:{hex:P.claw}});   /* lead finger strut */
      tube(WR, F1, 0.009, 0.004, 4, P.spar, {capB:{hex:P.claw}});   /* trailing finger strut */

      /* scallop helper: trailing-edge midpoint between two points, pulled in toward the wrist by
         a shallow amount scaled to the LOCAL chord (never the full span) — a bold filled bay with
         a scalloped notch, not a collapsed sliver. */
      const scallop = (a, b) => {
        const mid = V((a.x+b.x)/2, (a.y+b.y)/2, (a.z+b.z)/2);
        const chord = Math.hypot(b.x-a.x, b.y-a.y, b.z-a.z) || 0.001;
        const dx = WR.x-mid.x, dy = WR.y-mid.y, dz = WR.z-mid.z;
        const dl = Math.hypot(dx,dy,dz) || 0.001;
        const pull = chord*0.24;
        return V(mid.x + dx/dl*pull, mid.y + dy/dl*pull, mid.z + dz/dl*pull);
      };
      const bays = [ [ROOT, F0, scallop(ROOT,F0)], [F0, F1, scallop(F0,F1)] ];
      for(const [a, b, notch] of bays){
        /* pale/lit top layer, emitted in both winding orders so it stays front-facing from either
           camera side (the giant-bat R8 fix — a hand-authored fan flips winding bay-to-bay). */
        quad(WR, a, notch, notch, membraneHex, 0.05);
        quad(WR, notch, a, a, membraneHex, 0.05);
        quad(WR, notch, b, b, membraneHex, 0.05);
        quad(WR, b, notch, notch, membraneHex, 0.05);
        /* thin dark underside for a hint of thickness */
        const dip = (p) => V(p.x, p.y - scale*0.006, p.z);
        quad(dip(WR), dip(b), dip(a), dip(a), P.membrane, 0.06);
      }
    }
    wing(1, flapR);
    wing(-1, flapL);
  }

  /* ---------- the vortex: 8 bats spiraling up off the disc, tight at the bottom, widest through
     the middle, two peeling outward off the top ---------- */
  const N = 8;
  for(let i = 0; i < N; i++){
    const t = i / (N - 1);                                    /* 0 = lowest, 1 = highest */
    const y = 0.16 + 0.92*t;
    const turns = 2.35;
    const ang = t*turns*Math.PI*2 + i*0.62;
    /* R2 self-correction NOTE: a wider radius (tried 0.38) split the column into two disconnected
       flocks at a squint — reverted to the tighter 0.30 spread, which reads as ONE rising mass
       (the correct read for a swarm token, vs a loose scatter of individual bats). */
    let r = 0.075 + 0.30*Math.sin(t*Math.PI);                 /* tight bottom/top, wide middle */
    let peel = 0;
    if(i >= N-2){ r += 0.15; peel = 0.55; }                    /* top two peel outward/away */
    const cx = Math.cos(ang)*r, cz = Math.sin(ang)*r;
    const yaw = ang + Math.PI/2 + peel;                        /* faces tangent to the spiral */
    const scale = 0.86 + 0.30*((i*5)%4)/4;
    /* every bat at a different wing-beat angle — no two strokes synchronized */
    const flapR = Math.sin(ang*1.9 + i*1.3);
    const flapL = Math.sin(ang*1.7 + i*1.3 + 2.1);
    const lit = t > 0.35;                                      /* CRITIC R2: more of the column now
      catches the lit membrane tone (was 0.45) so the value ladder climbs earlier up the funnel. */
    bat(cx, y, cz, scale, yaw, flapR, flapL, lit);
  }

  /* ---------- base disc (Large: r=0.55, matches the yuan-ti-abomination Large pattern) --------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 16);
    const r2 = ring(V(0,0.048,0), V(0,1,0), 0.53, 0.53, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.050,0), P.discTop);
  }
}
