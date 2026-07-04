/* dev/model-qa/creatures/mon-bulette.js — the BULETTE ("land-shark", bespoke ARMORED QUADRUPED, Large Monstrosity).
   docs/CREATURE-MODELS-P2.md Wave 1: an armored land-shark — a hunched, heavily ARMORED quadruped
   with a huge fin/plate cresting the back (its signature — a big dorsal plate ridge like a shark
   fin), a blunt shovel-like head with a wide toothy maw, thick powerful DIGGING claws, and stumpy
   strong legs. Slate/iron-grey armored plates (VS desaturated, dirt-scuffed), darker plate seams,
   bone-pale claws/teeth. NO eye quads. Seeds the armored-burrower base (umber-hulk lifts from it
   later). Whole-object grammar: one function, one geometry frame, no anchors. Large size: base
   disc r=0.55. Imported by the ps1-sheet p2mon set. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildBulette(){
  /* ---------- PALETTE (VS desaturated; slate/iron-grey armor, dirt-scuffed, bone-pale claws) ---------- */
  const P = {
    plate:0x5a5c5a, plateDk:0x3d3f3e, plateLt:0x6f716c,        // slate-grey armor plates
    seam:0x2a2b28,                                              // dark plate seams/joints
    dirt:0x63583f, dirtDk:0x453d2c,                             // dirt-scuffed grime patches
    fin:0x4a4c4a, finDk:0x333432,                                // the big dorsal fin/plate ridge
    hide:0x54524a,                                              // hide between plates (throat/belly/joints)
    maw:0x241f19, tooth:0xcabf9e, toothDk:0x9d9377,             // dark maw, bone-pale teeth
    claw:0xc4b896, clawDk:0x958a6c,                              // bone-pale digging claws
    disc:0x453d2c, discTop:0x544a35,
  };
  setChannels({
    [P.plate]:'stone', [P.plateDk]:'stone', [P.plateLt]:'stone',
    [P.fin]:'stone', [P.finDk]:'stone',
    [P.tooth]:'bone', [P.toothDk]:'bone', [P.claw]:'bone', [P.clawDk]:'bone',
    [P.hide]:'leather',
  });

  /* ---------- LANDMARKS — spine along +z, HUNCHED (rump high, head low/forward), body ~1.4u long. ---------- */
  const S = {
    tailBase: V(0, 0.42, -0.58),
    rump:     V(0, 0.56, -0.40),   // rump held HIGH (hunched stance, the shark-fin hump root)
    loin:     V(0, 0.58, -0.16),
    mid:      V(0, 0.54,  0.06),
    shldr:    V(0, 0.44,  0.30),
    neck:     V(0, 0.34,  0.46),
    headB:    V(0, 0.26,  0.58),   // head held low + forward, blunt shovel read
  };

  /* ---------- BODY — one loft; a broad, armored barrel, rump-high hunch tapering down to the head. --- */
  const n=10, ph=Math.PI/n;
  tube(S.rump,  S.loin,  0.290, 0.310, n, P.plate,   {phase:ph, capA:{hex:P.plateDk, lift:0.02}});
  tube(S.loin,  S.mid,   0.310, 0.300, n, P.plateLt, {phase:ph});
  tube(S.mid,   S.shldr, 0.300, 0.260, n, P.plate,   {phase:ph});
  tube(S.shldr, S.neck,  0.260, 0.190, n, P.plateDk, {phase:ph});
  tube(S.neck,  S.headB, 0.190, 0.165, n, P.plate,   {phase:ph});

  /* pale-hide belly strip low on the flanks (soft underside between the armor plates) */
  {
    const by = 0.10;
    quad(V(-0.20,by,-0.34), V(0.20,by,-0.34), V(0.17,by+0.02,0.28), V(-0.17,by+0.02,0.28), P.hide, 0.05);
  }

  /* dirt-scuff grime patches on the flanks (VS dirty read) */
  {
    for(const [x,y,z,s] of [[-0.24,0.42,-0.20,0.10],[0.22,0.38,0.02,0.09],[-0.18,0.30,0.34,0.07],[0.20,0.50,-0.30,0.08]]){
      quad(V(x-s,y,z-s*0.6), V(x+s,y,z-s*0.6), V(x+s*0.8,y-0.01,z+s*0.6), V(x-s*0.8,y-0.01,z+s*0.6), P.dirt, 0.10);
    }
  }

  /* ---------- DORSAL FIN/PLATE RIDGE — the signature: a big shark-fin-like plate crest running
     the spine, tallest over the rump/hunch, sweeping back and down toward the tail. ---------- */
  {
    const finPts = [
      {z:-0.52, base:0.56, tip:0.94},
      {z:-0.40, base:0.60, tip:1.16},   // the tallest point of the crest — over the hunch
      {z:-0.22, base:0.62, tip:1.10},
      {z: 0.00, base:0.58, tip:0.90},
      {z: 0.20, base:0.50, tip:0.68},
      {z: 0.36, base:0.44, tip:0.52},
    ];
    for(let i=0;i<finPts.length-1;i++){
      const a=finPts[i], b=finPts[i+1];
      const baseA=V(0,a.base,a.z), baseB=V(0,b.base,b.z);
      const tipA=V(0,a.tip,a.z*0.94), tipB=V(0,b.tip,b.z*0.94);
      // thin bladed plate: two side quads (front/back face) + a thin cap edge for thickness read
      quad(baseA, baseB, tipB, tipA, i%2? P.fin : P.finDk, 0.05);
      const thick=0.028;
      quad(V(-thick,a.base,a.z),V(thick,a.base,a.z),V(thick,b.base,b.z),V(-thick,b.base,b.z), P.finDk, 0.05);
    }
    // serrated plate notches along the crest's trailing edge (armored-plate read, not smooth fin)
    for(const a of finPts){
      quad(V(-0.03,a.tip-0.05,a.z), V(0.03,a.tip-0.05,a.z), V(0.018,a.tip+0.03,a.z-0.02), V(-0.018,a.tip+0.03,a.z-0.02), P.finDk, 0.06);
    }
  }

  /* additional smaller armor-plate ridge scutes running down toward the tail base (secondary crest) */
  {
    const seg=[[-0.52,0.60],[-0.66,0.50],[-0.80,0.40]];
    for(const [z,y] of seg){
      quad(V(-0.05,y,z), V(0.05,y,z), V(0.03,y+0.14,z-0.04), V(-0.03,y+0.14,z-0.04), P.fin, 0.05);
    }
  }

  /* flank armor-plate seams (a few dark seam lines suggesting overlapping plates) */
  {
    for(const z of [-0.30,-0.06,0.18]){
      for(const s of [-1,1]){
        const x = s*0.29;
        quad(V(x,0.30,z-0.05), V(x,0.30,z+0.05), V(x*0.96,0.52,z+0.04), V(x*0.96,0.52,z-0.04), P.seam, 0.04);
      }
    }
  }

  /* ---------- HEAD — a broad, BLUNT SHOVEL wedge with a wide toothy maw. ---------- */
  {
    const bands=[
      {y:0.10, cz:0.60, rx:0.190, rz:0.200, hex:P.plate},    // wide lower jaw/cheek
      {y:0.22, cz:0.62, rx:0.210, rz:0.210, hex:P.plateLt},  // broadest point — the shovel skull
      {y:0.32, cz:0.58, rx:0.170, rz:0.170, hex:P.plateDk},  // brow, flattened
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,0.36,0.58), P.plateDk);

    /* SNOUT — a broad blunt SHOVEL projecting forward (+z), flattened top-to-bottom, blunt tip. */
    const snB = V(0, 0.11, 0.72);
    const snM = V(0, 0.09, 0.88);
    const snT = V(0, 0.08, 1.00);
    tube(snB, snM, 0.195, 0.150, n, P.plate,   {raz:0.170, rbz:0.130, phase:ph});
    tube(snM, snT, 0.150, 0.100, n, P.plateLt, {raz:0.130, rbz:0.080, phase:ph, capB:{hex:P.plateDk, lift:0.006}});

    /* WIDE TOOTHY MAW — a big dark mouth slash across the shovel-snout underside, ringed w/ teeth */
    quad(V(-0.17,0.02,0.66), V(0.17,0.02,0.66), V(0.13,0.00,0.98), V(-0.13,0.00,0.98), P.maw, 0.04);
    /* upper row of jagged teeth along the mouth line */
    const toothCount=9;
    for(let i=0;i<toothCount;i++){
      const t=i/(toothCount-1);
      const z=0.68+t*0.28, x=-0.15+t*0.30, y=0.045;
      const h = (i%2===0)?0.05:0.035;
      quad(V(x-0.014,y,z), V(x+0.014,y,z), V(x+0.008,y-h,z+0.006), V(x-0.008,y-h,z+0.006), P.tooth, 0.05);
    }
    /* lower row of teeth */
    for(let i=0;i<toothCount-1;i++){
      const t=(i+0.5)/(toothCount-1);
      const z=0.68+t*0.28, x=-0.15+t*0.30, y=0.005;
      const h = 0.03;
      quad(V(x-0.012,y,z), V(x+0.012,y,z), V(x+0.006,y+h,z-0.004), V(x-0.006,y+h,z-0.004), P.toothDk, 0.05);
    }

    /* two dark nostril slits on the shovel-top (no eyes, per house ruling — shape not paint) */
    for(const s of [-1,1]) quad(V(s*0.035-0.012,0.135,0.80), V(s*0.035+0.012,0.135,0.80),
                                V(s*0.035+0.009,0.140,0.86), V(s*0.035-0.009,0.140,0.86), P.seam, 0.02);
  }

  /* ---------- LEGS — STUMPY strong, wide-planted quadruped stance carrying the armored bulk. ---------- */
  {
    const stumpLeg=(shoulder, footX, footZ)=>{
      const knee = V(shoulder.x + Math.sign(shoulder.x)*0.06, shoulder.y - 0.22, shoulder.z + (footZ>shoulder.z?0.03:-0.03));
      const foot = V(footX, 0.075, footZ);
      tube(shoulder, knee, 0.115, 0.100, 8, P.plate,   {phase:ph, capA:{hex:P.plateDk, lift:0.02}});
      tube(knee, foot,     0.100, 0.078, 8, P.plateDk, {phase:ph, capB:{hex:P.hide, lift:0.01}});
      /* thick powerful DIGGING claws — 3 broad blunt claws splayed forward from the stumpy foot */
      const pad = V(foot.x, 0.05, foot.z+0.04);
      for(const dx of [-0.055, 0, 0.055]){
        const cb = V(pad.x+dx*0.7, 0.055, pad.z);
        const ct = V(pad.x+dx, 0.012, pad.z+0.10);
        tube(cb, ct, 0.032, 0.012, 5, P.claw, {capB:{hex:P.clawDk, lift:0.006}});
      }
    };
    // front legs (broad stance, shoulder ~z0.28)
    stumpLeg(V(-0.235, 0.38, 0.28),  -0.32, 0.36);
    stumpLeg(V( 0.235, 0.38, 0.28),   0.32, 0.36);
    // rear legs (haunch ~z-0.38, wide + powerful — the digger's main thrust)
    stumpLeg(V(-0.255, 0.46, -0.38), -0.34, -0.44);
    stumpLeg(V( 0.255, 0.46, -0.38),  0.34, -0.44);
  }

  /* ---------- TAIL — short, thick, heavily armored, tapering fast (a stub compared to the lizard's
     whip — the bulette silhouette reads front-loaded/hunched, not tail-balanced). ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.02, 0.32, -0.82);
    const t2 = V(0.05, 0.24, -1.00);
    const tip= V(0.08, 0.18, -1.12);
    tube(t0, t1, 0.170, 0.130, 8, P.plate,   {phase:ph, capA:{hex:P.plateDk}});
    tube(t1, t2, 0.130, 0.085, 8, P.plateDk, {phase:ph});
    tube(t2, tip,0.085, 0.030, 8, P.plate,   {phase:ph, capB:{hex:P.plateDk, lift:0.006}});
    // small armor scutes continuing onto the tail base
    quad(V(-0.03,0.50,-0.62), V(0.03,0.50,-0.62), V(0.024,0.40,-0.80), V(-0.024,0.40,-0.80), P.fin, 0.04);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
