/* dev/model-qa/creatures/rlm-cassildas-mourner.js — CASSILDA'S MOURNER (cosmic, Medium, CR 5).
   Read: a black-veiled wailing figure trailing tattered star-cloth — a slim robed humanoid
   silhouette, face lost in a deep black veil-hood (dark hollow, no eye quads), trailing long
   ragged ribbons of cloth stitched with faint cold starlight pinpricks, arms raised in a frozen
   wail. VS-desaturated: matte black veil-cloth, ash-grey robe, the star-cloth ribbons a cold
   washed slate-blue with faint pale flecks. Whole-object grammar, one merged frame.
   Medium disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildCassildasMourner(){
  const P = {
    robe:0x3a3a3e, robeDk:0x242428, robeLt:0x4c4c52,           // ash-grey robe
    veil:0x141216, veilDk:0x0a090c,                             // matte black veil-hood
    star:0x525e68, starDk:0x363e46,                             // cold slate-blue star-cloth ribbons
    fleck:0x9aa4ac,                                             // faint pale starlight pinpricks
    hand:0x2c2a2e,
    disc:0x201f22, discTop:0x2c2a30,
  };

  /* ---------- LANDMARKS — a slim standing robed spine, arms raised in a frozen wail. ---------- */
  const S = {
    hem:   V(0, 0.05, 0.0),
    knee:  V(0.01, 0.55, 0.02),
    waist: V(-0.01, 1.00, 0.0),
    chest: V(0.02, 1.30, 0.01),
    neck:  V(0.0,  1.52, 0.0),
    head:  V(0.0,  1.68, 0.0),
  };

  /* ---------- ROBE — a slim tapering column, wider at the hem, cinched narrow at the waist. ---- */
  {
    const n=10, ph=Math.PI/n;
    tube(S.hem, S.knee,   0.30, 0.24, n, P.robeDk, {phase:ph});
    tube(S.knee, S.waist, 0.24, 0.17, n, P.robe,   {phase:ph});
    tube(S.waist, S.chest,0.17, 0.15, n, P.robeLt, {phase:ph});
    tube(S.chest, S.neck, 0.15, 0.09, n, P.robe,   {phase:ph});
  }

  /* ---------- VEIL-HOOD — a deep black hood fully hiding the face, a dark hollow within (no eye
     quads), the hood's edge draping down over the shoulders. ---------- */
  {
    const n=9, ph=Math.PI/n;
    const bands=[
      {y:S.neck.y+0.01, r:0.115, hex:P.veil},
      {y:S.neck.y+0.10, r:0.125, hex:P.veilDk},
      {y:S.neck.y+0.20, r:0.095, hex:P.veil},
      {y:S.neck.y+0.28, r:0.055, hex:P.veilDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.r, b.r, n, ph));
    stitch(rings, i=>bands[i].hex);
    capFan(rings.at(-1), V(0,S.neck.y+0.32,0), P.veilDk);
    // dark hollow within the hood's front opening (not an eye — an absence)
    quad(V(-0.05,S.neck.y+0.10,0.09), V(0.05,S.neck.y+0.10,0.09), V(0.04,S.neck.y+0.22,0.07), V(-0.04,S.neck.y+0.22,0.07), P.veilDk, 0.02);
    // hood-edge drape over the shoulders (a wide flat collar-skirt)
    quad(V(-0.20,S.chest.y+0.10,-0.06), V(0.20,S.chest.y+0.10,-0.06), V(0.14,S.chest.y-0.04,0.10), V(-0.14,S.chest.y-0.04,0.10), P.veilDk, 0.05);
  }

  /* ---------- RAISED ARMS — thin sleeved arms lifted up and out, frozen in a wail, hands open. -- */
  for(const s of [-1,1]){
    const sh = V(s*0.14, S.chest.y+0.02, 0.0);
    const elbow = V(s*0.28, S.chest.y+0.24, -0.04);
    const wrist = V(s*0.34, S.chest.y+0.48, -0.02);
    const hand  = V(s*0.36, S.chest.y+0.62, 0.02);
    tube(sh, elbow, 0.075, 0.058, 6, P.robe, {phase:Math.PI/6});
    tube(elbow, wrist, 0.058, 0.040, 6, P.robeDk, {phase:Math.PI/6});
    tube(wrist, hand, 0.040, 0.022, 5, P.hand, {phase:Math.PI/5, capB:{hex:P.hand, lift:0.01}});
    // splayed fingers, open in the wail
    for(const dx of [-0.02,0,0.02]){
      const ft = V(hand.x+dx, hand.y+0.09, hand.z+0.02);
      tube(hand, ft, 0.012, 0.004, 3, P.hand, {capB:{hex:P.hand, lift:0.005}});
    }
  }

  /* ---------- STAR-CLOTH RIBBONS — long ragged trailing ribbons hanging from the shoulders/waist,
     drifting down past the hem, faintly stitched with cold pinprick star-flecks. ---------- */
  {
    const ribbons = [
      {root:V(-0.18,S.chest.y+0.05,-0.02), tip:V(-0.30,-0.10,-0.30), w:0.06},
      {root:V(0.16, S.waist.y+0.02,-0.03), tip:V(0.34,-0.14,0.24), w:0.05},
      {root:V(-0.10,S.knee.y+0.05,0.05),   tip:V(-0.20,-0.16,0.34), w:0.045},
      {root:V(0.06, S.hem.y+0.10,-0.06),   tip:V(0.18,-0.14,-0.36), w:0.04},
    ];
    ribbons.forEach((rb,i)=>{
      const mid = V((rb.root.x+rb.tip.x)/2 + (i%2?0.08:-0.08), (rb.root.y+rb.tip.y)/2, (rb.root.z+rb.tip.z)/2);
      quad(V(rb.root.x-rb.w,rb.root.y,rb.root.z), V(rb.root.x+rb.w,rb.root.y,rb.root.z),
           V(mid.x+rb.w*0.6,mid.y,mid.z), V(mid.x-rb.w*0.6,mid.y,mid.z), P.star, 0.10);
      quad(V(mid.x-rb.w*0.6,mid.y,mid.z), V(mid.x+rb.w*0.6,mid.y,mid.z),
           V(rb.tip.x+rb.w*0.2,rb.tip.y,rb.tip.z), V(rb.tip.x-rb.w*0.2,rb.tip.y,rb.tip.z), P.starDk, 0.10);
      // pinprick flecks along the ribbon
      for(let k=0;k<3;k++){
        const t=k/2;
        const px=rb.root.x+(rb.tip.x-rb.root.x)*t, py=rb.root.y+(rb.tip.y-rb.root.y)*t, pz=rb.root.z+(rb.tip.z-rb.root.z)*t;
        quad(V(px-0.01,py,pz), V(px+0.01,py,pz), V(px+0.008,py+0.012,pz), V(px-0.008,py+0.012,pz), P.fleck, 0.15);
      }
    });
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.047,0), P.discTop);
  }
}
