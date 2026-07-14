/* dev/model-qa/creatures/mon-bat.js — the GIANT BAT landmark table (WINGED/AVIAN family REBUILD,
   Large, CR 1/4, realm core — 21 instances + the swarm-family stand-in until w2 lands), authored
   under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry pilot, rebuild-w2 cell 2).
   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z, ground y=0.
   Miniature convention kept from the original: the small furry body floats ~0.6u above its base
   disc — no visible support strut, the figure just hovers (matches the rest of the flying roster).

   FEATURE CHECKLIST (the budget buys):
     1. WINGED/AVIAN anatomy (docs/ANATOMY-CANON.md §WINGED) — wing = arm-analog, never a fabric
        panel: shoulder->humerus->radius->wrist, then a THICKENED leading-edge spar continuing
        into the first digit, with 4 more finger struts fanning back from the wrist. Membrane is
        skin hung BETWEEN and BEHIND the struts (never a single flat quad off the shoulder).
     2. SIGNATURE — the strut-built wings themselves: trailing edge is NOT a straight line, it is
        pulled into concave scallops between each pair of finger-tips (law 4's one loud feature,
        taken straight from the flavor line's "strut-built wings").
     3. Pose = the swoop — wings at full ASYMMETRIC extension, one wing swept high (upstroke) and
        the other swept low (downstroke, banking), never a symmetric flap and never at-attention
        (law 5).
     4. Open mouth — jaw dropped, dark mouth cavity, two long pale fangs breaking past the lower
        lip (high-value payload riding the signature area near the head).
     5. Big fox-bat ears — tall triangular fans off the crown with a paler lit inner membrane
        (secondary silhouette read, keeps the AVIAN family's oversized-ear tell).
     6. Feet reaching — both clawed hind feet thrust forward/down at the swoop's grab-moment
        instead of dangling limp, toes spread.

   POSE SENTENCE: mid-swoop, banking hard — the near wing thrown high on the upstroke while the
   far wing sweeps low on the downstroke, head snapped forward with the jaw dropped open on its
   fangs, both clawed feet reaching down-forward for the strike — never a symmetric flap, never
   at rest.

   Imported by ps1-sheet.html (SETS['rebuild-w2'], cell 2) and export-obj.mjs. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

/* one finger-spar with a membrane-scalloping trailing edge helper computed by the caller —
   this just draws the tapered strut tube itself, base color -> claw-dark tip. */
function strut(base, tip, r0, r1, hex, claw){
  tube(base, tip, r0, r1, 5, hex, { capB:{ hex:claw, lift:0.010 } });
}

export function buildGiantBat(){
  /* ---------- PALETTE (VS desaturated; membrane pale carries the light on the signature) ------- */
  const P = {
    fur:0x6e5a4a, furDk:0x4c3d31, furLt:0x8c7863,          /* dark grey-brown body (CRITIC R8: value
      bumped — the previous set sat too close to the void clear color 0x0a0908 once dithered+1/3-res,
      the whole body/legs/ears read as an undifferentiated dark blob) */
    membrane:0x453629, membraneLt:0xe0c9a8,                 /* wing skin — dark shadow underside, pale lit top (CRITIC R8: pushed further — the signature panel needs to be the loudest value in frame) */
    spar:0x352a1f, claw:0x1a1410,                           /* finger bones / claw tips — darkest, reads as bone */
    ear:0x5e4c3d, earLt:0xa08b73, eye:0xb0402c, nose:0x241c17,
    fang:0xe8ddd0, mouth:0x120a0a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — hover height + body center ---------- */
  const HOVER = 0.62;                                       /* body floats this high over the disc */

  /* ---------- BODY (small furry loft, tucked flying posture, torso torn forward into the swoop) */
  stack([
    {y:HOVER-0.15, rx:0.075, rz:0.085, hex:P.furDk},        /* pelvis / tucked rump */
    {y:HOVER-0.05, rx:0.115, rz:0.135, hex:P.fur},
    {y:HOVER+0.05, rx:0.130, rz:0.155, hex:P.fur},          /* chest — widest, forward-leaning */
    {y:HOVER+0.14, rx:0.100, rz:0.125, hex:P.fur},
    {y:HOVER+0.20, rx:0.058, rz:0.070, hex:P.furDk},        /* neck, snapped forward */
  ], 8, {capBot:{hex:P.furDk, lift:0.02}});

  /* ---------- HEAD (fox-like snout, jaw DROPPED OPEN, big splayed ears), tilted into the dive --- */
  const HEAD = V(0, HOVER+0.30, 0.075);
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:HEAD.y-0.075, rx:0.062, rz:0.062, hex:P.furDk},    /* lower jaw — dropped down + open */
      {y:HEAD.y,       rx:0.095, rz:0.098, hex:P.fur},      /* cheeks / cranium */
      {y:HEAD.y+0.045, rx:0.078, rz:0.080, hex:P.fur},      /* brow */
    ];
    const rings=bands.map(b=>ring(V(HEAD.x,b.y,HEAD.z), V(0,1,0), b.rx, b.rz, n, ph));
    /* fox snout on the upper cheek ring — push the two FRONT verts forward+down into a muzzle */
    for(const i of [1,2]){ rings[1][i].z += 0.058; rings[1][i].y -= 0.012; }
    for(const i of [1,2]){ rings[0][i].z += 0.030; rings[0][i].y -= 0.010; }   /* dropped jaw follows forward */
    stitch(rings, b=>bands[b].hex);
    capFan(rings[2], V(HEAD.x, HEAD.y+0.075, HEAD.z-0.01), P.furDk);
    /* upper muzzle tip cap + nose */
    const snoutTip = V(HEAD.x, HEAD.y-0.010, HEAD.z+0.138);
    quad(V(snoutTip.x-0.022,snoutTip.y-0.004,snoutTip.z-0.01), V(snoutTip.x+0.022,snoutTip.y-0.004,snoutTip.z-0.01),
         V(snoutTip.x+0.018,snoutTip.y+0.022,snoutTip.z), V(snoutTip.x-0.018,snoutTip.y+0.022,snoutTip.z), P.nose, 0.02);

    /* OPEN MOUTH — dark cavity spanning upper muzzle down to the dropped lower jaw, two long pale
       fangs breaking past the lip (the high-value payload riding the signature area). */
    const upLip  = V(HEAD.x, HEAD.y-0.028, HEAD.z+0.128);
    const loLip  = V(HEAD.x, HEAD.y-0.088, HEAD.z+0.098);
    quad(V(upLip.x-0.045,upLip.y,upLip.z), V(upLip.x+0.045,upLip.y,upLip.z),
         V(loLip.x+0.036,loLip.y,loLip.z), V(loLip.x-0.036,loLip.y,loLip.z), P.mouth, 0.02);
    for(const s of [-1,1]){
      const fbase=V(HEAD.x+s*0.028, upLip.y-0.006, upLip.z-0.004);
      const ftip =V(HEAD.x+s*0.020, loLip.y-0.030, loLip.z+0.012);
      tube(fbase, ftip, 0.013, 0.003, 4, P.fang, {capB:{hex:P.fang}});
    }

    /* BIG EARS — two tall triangular fans rising from the crown, splayed outward, paler lit inner
       membrane so they carry a secondary value read (law 3, secondary zone). */
    for(const s of [-1,1]){
      const base=V(HEAD.x+s*0.055, HEAD.y+0.055, HEAD.z-0.02);
      const tip =V(HEAD.x+s*0.140, HEAD.y+0.245, HEAD.z-0.065);
      const back=V(HEAD.x+s*0.020, HEAD.y+0.070, HEAD.z-0.05);
      quad(base, V(base.x+s*0.045,base.y+0.010,base.z+0.03), tip, tip, P.ear, 0.05);
      quad(base, back, tip, tip, P.furDk, 0.05);
      quad(V(base.x+s*0.012,base.y+0.02,base.z+0.01), V(base.x+s*0.040,base.y+0.02,base.z+0.02),
           V(tip.x-s*0.008,tip.y-0.03,tip.z), V(tip.x-s*0.008,tip.y-0.03,tip.z), P.earLt, 0.05);
    }
  }

  /* ---------- WINGS — the READ. Full asymmetric extension: right (s=+1) up-and-forward on the
     upstroke, left (s=-1) low-and-back on the downstroke, banking hard (never a symmetric flap).
     Each wing: shoulder -> elbow -> WRIST as a thickened leading-edge spar (the humerus/radius
     bone-bar), continuing into a thick lead digit; 3 more finger struts fan back from the wrist,
     each thinner; membrane hangs between EVERY consecutive pair of struts and is pulled into a
     concave scallop at its trailing midpoint (never a taut flat plane). ------------------------ */
  const SH = V(0, HOVER+0.07, 0.02);
  function wing(s, upDeg){
    /* NOTE (R2 self-correction): an earlier version added a "fwdSweep" term that pushed the
       whole wing plane deep into +/-Z. That rotated the membrane's surface normal until it sat
       nearly PERPENDICULAR to the ps1-sheet dimetric camera's view ray (yaw45/elev30) — the
       panel had real 3D area but was viewed almost exactly edge-on, so it rendered as a hairline
       instead of a sail. Dropped fwdSweep entirely; the wing plane now stays mostly in the X-Y
       sweep (radiating out+up/down from the shoulder) with only the ORIGINAL modest z-fan on the
       fingers, which keeps the membrane's normal close to the camera-facing (+x,+y,+z) octant. */
    const up = upDeg*Math.PI/180;
    /* CRITIC R8 (fresh-context pass-2): the pass-1 wingspan (x-span ~2.28u vs ~1.0-1.1u for the
       rest of the roster) blew the per-cell auto-fit camera's `reach` far past every comparable
       figure, AND the finger-fan triangles project to only ~45px^2 average on screen even at that
       zoomed-out scale (measured via the real ps1-sheet camera matrix) — so the whole creature
       rendered as a spindly illegible scribble in a huge dark void (silhouette+essence law
       failure, confirmed against dev/model-qa/captures-foundry-w2/giant-bat-r7.png). WS pulls the
       reach-out wing chain in toward the shoulder (shoulder position itself unchanged) so the
       camera zooms in and body/head/ears/mouth/legs/membrane all render at a legible scale. */
    const WS = 0.70;
    const EL = V(s*0.23*WS, SH.y + Math.sin(up)*0.13*WS, SH.z - 0.02*WS);
    const WR = V(s*0.45*WS, SH.y + Math.sin(up)*0.32*WS, SH.z - 0.04*WS);
    /* LEADING-EDGE SPAR — thickened humerus + radius bar, the wing's structural front edge */
    tube(SH, EL, 0.052, 0.040, 6, P.spar, {capA:{hex:P.furDk}});
    tube(EL, WR, 0.038, 0.026, 6, P.spar);
    /* thumb claw hooking up-forward off the wrist */
    tube(WR, V(WR.x+s*0.030*WS, WR.y+0.06*WS, WR.z+0.05*WS), 0.014, 0.004, 5, P.spar, {capB:{hex:P.claw, lift:0.01}});

    const flap = Math.sin(up);
    /* 4 finger struts fanning WIDE from the wrist — F0 is the lead digit (thick, a continuation
       of the leading-edge spar), F1-F3 thinner, sweeping progressively further back so the trailing
       edge has real z-spread to scallop against.
       R3 SELF-CORRECTION: F0's first draft (x0.32,z0.36) pointed almost exactly along the
       ps1-sheet dimetric camera's view axis (~0.61,0.5,0.61) — WR and F0 projected to nearly the
       SAME screen pixel, so the whole fore-membrane panel (and the thick lead-digit spar itself)
       vanished into a hairline regardless of its true 3D area. Pulled F0's z down and its x up so
       it separates from WR on screen instead of receding straight toward the camera. R4: scaled
       every finger offset up ~1.3x for headroom. R5: the s=+1 wing STILL under-separated — the
       fixed world +z "forward sweep" isn't mirrored by s (correctly, forward is forward for both
       wings), but that means it happens to point almost exactly along the camera axis for s=+1
       while pointing safely off-axis for s=-1. Made the lead digit's z-bias asymmetric by s
       (`-0.02 - s*0.20`) so BOTH sides clear a healthy screen gap instead of one wing reading as
       a broad sail and the other as a hairline. */
    const F0 = V(WR.x + s*0.55*WS, WR.y + (0.29 + flap*0.13)*WS, WR.z + (-0.02 - s*0.20)*WS);   /* lead digit */
    const F1 = V(WR.x + s*0.65*WS, WR.y + (0.13 + flap*0.17)*WS, WR.z + 0.18*WS);
    const F2 = V(WR.x + s*0.68*WS, WR.y + (-0.03 + flap*0.20)*WS, WR.z + (-0.21)*WS);
    const F3 = V(WR.x + s*0.44*WS, WR.y + (-0.16 + flap*0.21)*WS, WR.z + (-0.52)*WS);                    /* trailing digit */
    /* CRITIC R8: tip radii bumped to clear the 0.04u minimum-feature floor (law 3) — the pass-1
       tips (0.005-0.008) were sub-floor and dissolved at 1/3-res regardless of zoom. */
    strut(WR, F0, 0.030, 0.022, P.spar, P.claw);          /* thick — lead digit continues the spar */
    strut(WR, F1, 0.024, 0.020, P.spar, P.claw);
    strut(WR, F2, 0.024, 0.020, P.spar, P.claw);
    strut(WR, F3, 0.022, 0.018, P.spar, P.claw);

    /* membrane hem roots at the body — fore (shoulder) and aft (flank) */
    const ROOTFORE = V(s*0.05, HOVER+0.04, 0.06);
    const ROOTAFT  = V(s*0.045, HOVER-0.11, -0.08);

    /* SCALLOP helper: the trailing-edge midpoint between two consecutive tips, dipped INWARD
       toward the wrist by a SHALLOW amount scaled to the LOCAL chord length between the two tips
       (never to the full tip->wrist distance — that collapses the whole panel into a near-
       colinear sliver, the R1 bug: a,b,notch all fell on ~one ray from WR and the "broad" panel
       rendered as a thin line). The notch stays near the outer tip-arc, just dipped a bit. */
    const scallop=(a,b)=>{
      const mid=V((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);
      const chord=Math.hypot(b.x-a.x, b.y-a.y, b.z-a.z) || 0.001;
      const dx=WR.x-mid.x, dy=WR.y-mid.y, dz=WR.z-mid.z;
      const dlen=Math.hypot(dx,dy,dz) || 0.001;
      const pull=chord*0.22;                                /* CRITIC R8: shallower pull (was 0.42) —
        at 0.42 the notch carved nearly half the bay away, leaving each panel a thin sliver that
        vanished on screen even before the WS zoom fix; 0.22 keeps the scalloped-edge signature
        readable while the bay stays a bold filled panel, not lace. */
      return V(mid.x + dx/dlen*pull, mid.y + dy/dlen*pull, mid.z + dz/dlen*pull);
    };
    const bays = [
      [ROOTFORE, F0, scallop(ROOTFORE,F0)],
      [F0, F1, scallop(F0,F1)],
      [F1, F2, scallop(F1,F2)],
      [F2, F3, scallop(F2,F3)],
      [F3, ROOTAFT, scallop(F3,ROOTAFT)],
    ];
    /* each bay = wrist + outer edge (tipA -> notch -> tipB), fan-triangulated from the wrist.
       Top surface (direct, no dip) is the PALE lit color — the high-value zone the law demands
       sits right on the signature; a slightly-dropped duplicate underneath in the dark shadow
       tone gives the membrane thickness so it never reads as a single zero-depth sheet.
       CRITIC R8 (the real fix): measured against the ps1-sheet's actual FrontSide-culled camera,
       47 of 64 pale-tri candidates had their normal facing AWAY from the dimetric camera — the
       hand-authored fan winding flips sign bay-to-bay as the fan sweeps, so most of the signature
       payload was being backface-culled into total invisibility (the true cause of the "wings read
       as bare struts" failure, not just scale). Emit the pale top tri in BOTH winding orders so it
       is front-facing from either side — doubles 20 tiny tris to 40, well inside the tri band. */
    for(const [a, b, notch] of bays){
      quad(WR, a, notch, notch, P.membraneLt, 0.05);
      quad(WR, notch, a, a, P.membraneLt, 0.05);            /* reverse-winding twin — guarantees front-face */
      quad(WR, notch, b, b, P.membraneLt, 0.05);
      quad(WR, b, notch, notch, P.membraneLt, 0.05);        /* reverse-winding twin */
      const dip=(p)=>V(p.x, p.y-0.010, p.z);
      quad(dip(WR), dip(notch), dip(a), dip(a), P.membrane, 0.05);
      quad(dip(WR), dip(a), dip(notch), dip(notch), P.membrane, 0.05);
      quad(dip(WR), dip(b), dip(notch), dip(notch), P.membrane, 0.05);
      quad(dip(WR), dip(notch), dip(b), dip(b), P.membrane, 0.05);
    }
  }
  wing(+1, 58);    /* right wing — full upstroke, thrown high */
  wing(-1, -38);   /* left wing — full downstroke, swept low (the bank) */

  /* ---------- LEGS — clawed hind feet REACHING forward/down for the strike, toes spread -------- */
  for(const s of [-1,1]){
    const hip = V(s*0.05, HOVER-0.13, -0.01);
    const knee = V(s*0.075, HOVER-0.22, 0.08);
    const foot = V(s*0.085, HOVER-0.33, 0.16);          /* reaching forward+down, not dangling */
    tube(hip, knee, 0.026, 0.019, 5, P.furDk);
    tube(knee, foot, 0.019, 0.013, 5, P.furDk, {capB:{hex:P.furDk}});
    /* 3 spread toe claws fanning out from the foot */
    for(const t of [-0.032, 0, 0.032]){
      tube(foot, V(foot.x+t, foot.y-0.028, foot.z+0.034), 0.008, 0.002, 4, P.claw, {capB:{hex:P.claw}});
    }
  }

  /* ---------- BASE DISC (Large piece — the bat floats above it, nothing connects) -------------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.34, 0.34, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.32, 0.32, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
