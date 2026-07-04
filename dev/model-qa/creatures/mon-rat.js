/* dev/model-qa/creatures/mon-rat.js — the GIANT RAT landmark table (QUADRUPED family debut, Small).
   Whole-object grammar: one function, one geometry frame, no anchors. The spine is authored as a
   HORIZONTAL loft — a chain of tube() segments along the +z axis (nose ahead, rump behind) sitting
   low (~0.35u off the ground) — so the body reads low-slung, not upright. Four short legs are placed
   ON that body by construction (spider-style hips on the surface). The read is carried by three
   exaggerated features: a long bare pale TAIL as long as the body, big round ears, and a whiskery
   pointed snout — an unnaturally BIG rat, never a dog. Imported by mon-rat-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGiantRat(){
  /* ---------- PALETTE (VS desaturated; matted grey-brown vermin) ---------- */
  const P = {
    fur:0x6b6053, furDk:0x4c443a, furLt:0x8a7d6c, belly:0x9c8f7c,
    tail:0xb8a48f, tailDk:0x8a7a68,           // bare pale scaly tail (lighter than the coat)
    ear:0xa88f7d, earIn:0x6e4d47,             // fleshy pink-grey ear + darker inner cup
    snout:0x847264, nose:0x2a2320, tooth:0xd8cdb4,
    whisker:0xcabfa8, eye:0x141010, eyeGlow:0x30251c,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — spine runs along +z, low to the ground. Body ~0.9u long. ---------- */
  const spineY = 0.35;                        // horizontal spine height off the base disc
  /* body loft: RUMP (behind, -z, high round haunch) -> back -> SHOULDER -> NECK -> HEAD-base (+z, low) */
  const S = {
    rump:   V(0, spineY+0.03, -0.34),
    back:   V(0, spineY+0.05, -0.16),
    mid:    V(0, spineY+0.04,  0.02),
    shldr:  V(0, spineY+0.02,  0.18),
    neck:   V(0, spineY-0.02,  0.30),
    headB:  V(0, spineY-0.05,  0.40),          // where the wedge head meets the neck (held LOW)
  };

  /* ---------- BODY — one horizontal loft along the spine (arched back, fat rump) ---------- */
  tube(S.rump,  S.back,  0.235, 0.250, 8, P.fur,   {phase:Math.PI/8, capA:{hex:P.furDk, lift:0.02}});
  tube(S.back,  S.mid,   0.250, 0.240, 8, P.fur,   {phase:Math.PI/8});
  tube(S.mid,   S.shldr, 0.240, 0.215, 8, P.fur,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.215, 0.150, 8, P.furDk, {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.150, 0.115, 8, P.furDk, {phase:Math.PI/8});
  /* pale belly strip under the barrel — a lighter band low on the flanks */
  {
    const by = spineY-0.20;
    quad(V(-0.13,by,-0.28), V(0.13,by,-0.28), V(0.12,by+0.02,0.10), V(-0.12,by+0.02,0.10), P.belly, 0.05);
  }

  /* ---------- HEAD — a low-held WEDGE tapering to a whiskery pointed snout ---------- */
  {
    const n=8, ph=Math.PI/n;
    /* skull wedge: cheek/jaw -> brow -> crown, sitting just ahead of headB and angled down */
    const bands=[
      {y:spineY-0.08, cz:0.44, rx:0.115, rz:0.120, hex:P.fur},
      {y:spineY-0.05, cz:0.47, rx:0.130, rz:0.125, hex:P.fur},
      {y:spineY-0.02, cz:0.46, rx:0.118, rz:0.108, hex:P.furDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spineY+0.01, 0.45), P.furDk);

    /* SNOUT — a wedge projecting forward (+z) and DOWN from the face to a blunt nose.
       Built via tube() on a +z/-y-leaning axis. Kept SHORTER + blunter than a shrew so it reads
       rat, not anteater. */
    const snB = V(0, spineY-0.095, 0.50);      // meets the face front
    const snM = V(0, spineY-0.130, 0.575);
    const snT = V(0, spineY-0.150, 0.635);     // nose tip (pulled back in)
    tube(snB, snM, 0.104, 0.074, n, P.snout, {raz:0.088, rbz:0.060, phase:ph});
    tube(snM, snT, 0.074, 0.040, n, P.snout, {raz:0.060, rbz:0.032, phase:ph, capB:{hex:P.nose, lift:0.010}});

    /* two prominent incisors under the nose tip (rodent read) — wider + longer */
    for(const s of [-1,1]){
      const tx=s*0.016;
      quad(V(tx-0.014,spineY-0.168,0.615), V(tx+0.014,spineY-0.168,0.615),
           V(tx+0.010,spineY-0.212,0.600), V(tx-0.010,spineY-0.212,0.600), P.tooth, 0.02);
    }

    /* WHISKERS — a few thin quads splaying from the snout sides (barely-there flecks at res) */
    for(const s of [-1,1]){
      for(const [dy,dz,len] of [[0.010,0.02,0.16],[-0.006,0.01,0.18],[-0.022,0.0,0.15]]){
        const a=V(s*0.042, spineY-0.135+dy, 0.575+dz);
        const b=a.clone().add(V(s*len, dy*0.4-0.01, 0.02));
        quad(a, V(a.x,a.y-0.004,a.z), V(b.x,b.y-0.004,b.z), b, P.whisker, 0.0);
      }
    }

    /* EYES — small dark beady dots high on the wedge, flanking the brow (proud of the face) */
    for(const s of [-1,1]){
      const ex=s*0.088, ey=spineY-0.010, ez=0.475;
      quad(V(ex-0.020,ey-0.020,ez), V(ex+0.020,ey-0.020,ez),
           V(ex+0.020,ey+0.020,ez-0.010), V(ex-0.020,ey+0.020,ez-0.010), P.eye, 0.0);
      quad(V(ex-0.007,ey-0.006,ez+0.004), V(ex+0.007,ey-0.006,ez+0.004),
           V(ex+0.007,ey+0.006,ez-0.002), V(ex-0.007,ey+0.006,ez-0.002), P.eyeGlow, 0.0);
    }

    /* BIG ROUND EARS — two large thin discs riding HIGH on the crown on a short stub, cupped to
       face forward + out so they read from the front and 3/4. Signature feature #1: oversized,
       petal-like, the giveaway that this is a rat and not a dog. */
    for(const s of [-1,1]){
      const stubB=V(s*0.100, spineY+0.055, 0.415);   // stub roots on the skull
      const ec   =V(s*0.150, spineY+0.150, 0.430);   // ear disc center, high + outboard
      const out  =V(s*0.80, 0.36, 0.48); out.normalize();  // cup faces forward+up+out
      // short stub from skull to the ear base
      tube(stubB, ec.clone().addScaledVector(out,-0.02), 0.045, 0.055, 6, P.ear);
      // the big round ear disc (a shallow cupped fan)
      const r1=ring(ec, out, 0.145, 0.135, 10);
      const r2=ring(ec.clone().addScaledVector(out,0.024), out, 0.120, 0.112, 10);
      stitch([r1,r2], ()=>P.ear);
      capFan(r2, ec.clone().addScaledVector(out,0.030), P.ear);        // outer back of ear
      // inner cup (darker, recessed toward the head)
      const ri=ring(ec.clone().addScaledVector(out,-0.008), out, 0.100, 0.094, 10);
      capFan(ri, ec.clone().addScaledVector(out,-0.042), P.earIn, true);
    }
  }

  /* ---------- LEGS — 4 SHORT limbs, hips placed ON the body barrel (spider-style). ---------- */
  /* Front pair hang from the shoulder ring; rear pair from the haunch. Feet planted on the disc. */
  {
    const leg=(hip, foot, hex)=>{
      const knee=V((hip.x+foot.x)/2 + Math.sign(hip.x)*0.02, spineY-0.19, (hip.z+foot.z)/2);
      tube(hip, knee, 0.058, 0.046, 6, hex);
      tube(knee, foot, 0.044, 0.028, 6, P.furLt, {capB:{hex:P.snout, lift:0.008}});
      // little splayed foot pad
      const pad=V(foot.x, 0.02, foot.z+0.03);
      tube(V(foot.x,0.05,foot.z), pad, 0.030, 0.024, 5, P.snout, {capB:{hex:P.snout, lift:0.006}});
    };
    // front legs (under the shoulder, z~0.20)
    leg(V(-0.155, spineY-0.06,  0.19), V(-0.175, 0.055,  0.24), P.fur);
    leg(V( 0.155, spineY-0.06,  0.19), V( 0.175, 0.055,  0.20), P.fur);
    // rear legs (under the rump, z~-0.24) — a touch splayed for the low crouch
    leg(V(-0.170, spineY-0.04, -0.24), V(-0.200, 0.055, -0.20), P.fur);
    leg(V( 0.170, spineY-0.04, -0.24), V( 0.200, 0.055, -0.24), P.fur);
  }

  /* ---------- TAIL — bare, pale, as long as the body; thin tube segments curving behind. ----------
     Signature feature #2. Roots at the rump (behind, -z), sweeps back and DOWN, then trails off to
     one side low over the disc so it clears the rear legs. Longer than the body length (~0.9u). */
  {
    const root = V(0.03, spineY-0.02, -0.42);      // low on the rump, behind the body
    const t1   = V(0.09, spineY-0.06, -0.60);
    const t2   = V(0.16, 0.22,        -0.72);
    const t3   = V(0.26, 0.14,        -0.78);
    const t4   = V(0.40, 0.095,       -0.74);
    const t5   = V(0.54, 0.075,       -0.62);
    const tip  = V(0.64, 0.065,       -0.48);
    tube(root, t1, 0.058, 0.050, 6, P.tailDk, {phase:Math.PI/6, capA:{hex:P.furDk}});
    tube(t1,   t2, 0.050, 0.042, 6, P.tail,   {phase:Math.PI/6});
    tube(t2,   t3, 0.042, 0.034, 6, P.tail,   {phase:Math.PI/6});
    tube(t3,   t4, 0.034, 0.026, 6, P.tail,   {phase:Math.PI/6});
    tube(t4,   t5, 0.026, 0.018, 6, P.tail,   {phase:Math.PI/6});
    tube(t5,   tip,0.018, 0.009, 6, P.tailDk, {phase:Math.PI/6, capB:{hex:P.tailDk, lift:0.006}});
  }

  /* ---------- base disc (Small: r≈0.32, humanoid pattern scaled down) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.32, 0.32, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.30, 0.30, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
