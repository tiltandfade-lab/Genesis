/* dev/model-qa/creatures/rlm-wreck-diver.js — WRECK-DIVER (ash realm, Medium humanoid, CR 0.5).
   Read: a wreck-stripping salvager — patched scavenger coveralls, a scrap-plate chest harness
   hung with looted tools/parts, a cracked breather-mask over the lower face, a crowbar slung on
   the back, one goggle-lens held up on a headband. Whole-object grammar: one function, one merged
   frame, no anchors. NO eye quads (goggle lens is a flat glass disc, not a face). Base disc r=0.42
   (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildWreckDiver(){
  /* ---------- PALETTE (VS-desaturated scavenger drab, ash register) ---------- */
  const P = {
    cloth:0x6b6350, clothDk:0x484230, clothLt:0x847a5f,
    skin:0x9a7a5c, skinDk:0x6e5540,
    scrap:0x5a5a54, scrapDk:0x3a3a34, scrapLt:0x767468,
    mask:0x2e2c26, maskCrack:0x131210,
    lens:0x5c6a54, lensGlint:0x9caa8c,
    leather:0x4a3826, bootDk:0x241d16,
    hair:0x2a231a,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — standing humanoid, slight forward crouch (scavenger posture) ---------- */
  const S = {
    hip:    V(0, 0.52, 0),
    waist:  V(0, 0.66, 0.01),
    chest:  V(0, 0.86, 0.02),
    shldr:  V(0, 0.98, 0.01),
    neck:   V(0, 1.05, 0.00),
    headB:  V(0, 1.12, -0.01),
    headT:  V(0, 1.28, -0.02),
  };

  /* ---------- TORSO — patched coveralls barrel ---------- */
  tube(S.hip,   S.waist, 0.150, 0.135, 8, P.cloth,   {phase:Math.PI/8});
  tube(S.waist, S.chest, 0.135, 0.175, 8, P.clothDk, {phase:Math.PI/8});
  tube(S.chest, S.shldr, 0.175, 0.155, 8, P.cloth,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.155, 0.075, 8, P.clothDk, {phase:Math.PI/8});
  /* patch quads on the coveralls */
  for(const [x,y,z,w,h] of [[0.09,0.72,0.14,0.05,0.06],[-0.11,0.60,0.10,0.045,0.05]])
    quad(V(x-w,y,z), V(x+w,y,z), V(x+w*0.8,y+h,z+0.01), V(x-w*0.8,y+h,z+0.01), P.clothLt, 0.06);

  /* ---------- SCRAP HARNESS — plate straps across the chest hung with a couple of loot chunks --- */
  {
    for(const s of [-1,1]) quad(V(s*0.02,0.98,0.10), V(s*0.10,0.94,0.14), V(s*0.10,0.66,0.10), V(s*0.02,0.70,0.06), P.leather, 0.06);
    /* buckled plate on the chest */
    quad(V(-0.07,0.86,0.16), V(0.07,0.86,0.16), V(0.06,0.76,0.15), V(-0.06,0.76,0.15), P.scrap, 0.05);
    quad(V(-0.03,0.83,0.165), V(0.03,0.83,0.165), V(0.025,0.79,0.155), V(-0.025,0.79,0.155), P.scrapLt, 0.04);
    /* a hung scrap part dangling off the belt */
    tube(V(0.14,0.62,0.06), V(0.16,0.48,0.05), 0.02, 0.03, 5, P.scrapDk);
  }

  /* ---------- HEAD — breather mask over the lower face, headband + one goggle-lens flipped up --- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y,      cz:-0.01, rx:0.098, rz:0.100, hex:P.skin},
      {y:S.headB.y+0.10, cz:-0.01, rx:0.100, rz:0.098, hex:P.skinDk},
      {y:S.headT.y-0.02, cz:-0.02, rx:0.082, rz:0.078, hex:P.hair},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headT.y+0.02, -0.02), P.hair);

    /* breather mask — a wide dark shell over nose/mouth, cracked seam */
    quad(V(-0.075,S.headB.y-0.01,0.075), V(0.075,S.headB.y-0.01,0.075), V(0.062,S.headB.y-0.09,0.085), V(-0.062,S.headB.y-0.09,0.085), P.mask, 0.05);
    quad(V(-0.01,S.headB.y-0.02,0.088), V(0.01,S.headB.y-0.02,0.088), V(0.006,S.headB.y-0.07,0.09), V(-0.006,S.headB.y-0.07,0.09), P.maskCrack, 0.03);
    /* headband + flipped-up goggle lens (a flat glass disc, not eyes) */
    {
      const c = V(-0.10, S.headB.y+0.11, 0.02);
      const outer = ring(c, V(0,0,1), 0.045, 0.045, 8, Math.PI/8);
      const inner = ring(V(c.x,c.y,c.z+0.008), V(0,0,1), 0.032, 0.032, 8, Math.PI/8);
      stitch([outer,inner], ()=>P.scrapDk);
      capFan(inner, V(c.x,c.y,c.z+0.014), P.lens);
      quad(V(c.x+0.004,c.y+0.014,c.z+0.015), V(c.x+0.016,c.y+0.014,c.z+0.015), V(c.x+0.01,c.y+0.004,c.z+0.015), V(c.x,c.y+0.004,c.z+0.015), P.lensGlint, 0.04);
    }
    quad(V(-0.09,S.headB.y+0.145,0.05), V(0.09,S.headB.y+0.145,0.05), V(0.075,S.headB.y+0.125,-0.03), V(-0.075,S.headB.y+0.125,-0.03), P.scrap, 0.05);
  }

  /* ---------- ARMS — one arm carrying a scavenged crowbar ---------- */
  {
    const shL = V(-0.165, 0.95, 0.01), shR = V(0.165, 0.95, 0.01);
    const elL = V(-0.20, 0.76, 0.08), elR = V(0.19, 0.75, -0.02);
    const hL  = V(-0.17, 0.58, 0.14), hR  = V(0.22, 0.55, -0.06);
    tube(shL, elL, 0.058, 0.048, 6, P.cloth);
    tube(elL, hL,  0.048, 0.038, 6, P.skin, {capB:{hex:P.skin, lift:0.01}});
    tube(shR, elR, 0.058, 0.048, 6, P.cloth);
    tube(elR, hR,  0.048, 0.038, 6, P.skin, {capB:{hex:P.skin, lift:0.01}});
    /* crowbar slung diagonally across the back */
    tube(V(-0.08,1.02,-0.10), V(0.14,0.60,0.06), 0.018, 0.014, 5, P.scrapDk, {capA:{hex:P.scrapLt}, capB:{hex:P.scrapLt}});
  }

  /* ---------- LEGS — patched trousers into scavenged boots ---------- */
  {
    const legs=(hipX)=>{
      const hip = V(hipX, S.hip.y-0.02, 0);
      const knee = V(hipX*0.9, 0.28, 0.03);
      const foot = V(hipX*0.85, 0.03, 0.05);
      tube(hip, knee, 0.078, 0.062, 6, P.cloth);
      tube(knee, foot, 0.062, 0.052, 6, P.clothDk, {capB:{hex:P.bootDk, lift:0.02}});
      quad(V(foot.x-0.05,0.025,foot.z-0.03), V(foot.x+0.05,0.025,foot.z-0.03), V(foot.x+0.045,0.01,foot.z+0.08), V(foot.x-0.045,0.01,foot.z+0.08), P.bootDk, 0.04);
    };
    legs(-0.085); legs(0.085);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
