/* dev/model-qa/creatures/rlm-musket-line-ghost-regiment.js — Musket-Line Ghost Regiment
   (theater/musket era-lens, Large, CR 9). A spectral regiment marching in perfect dead formation —
   read as ONE fused figure: a tall central spectral soldier flanked/overlapped by two translucent
   ghost-ranks half-phased behind him, muskets held at identical shoulder-arms angle, tricorne-shaped
   hat silhouettes. Whole-object grammar: one merged frame, no anchors. VS-desaturated palette: pale
   spectral grey-blue drab, faded ghost-white cloth, dull tarnished musket-iron, faint cold ember
   glow at the collar. NO eye quads (hollow shadow-recess under the hat brim instead). Large size:
   base disc r=0.55.*/
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildMusketLineGhostRegiment(){
  const P = {
    coat:0x565a5e, coatDk:0x363a3e, coatLt:0x6c7276,
    ghost:0x8a9296, ghostDk:0x5c6266,                  // translucent-read pale ghost ranks (unsat blue-grey)
    cloth:0x9aa0a0, clothDk:0x6a7070,
    hat:0x2c2e30, hatDk:0x1a1c1e,
    musket:0x3a362e, musketDk:0x201d18, bayonet:0x6e6e66,
    glow:0x6a9aa8,
    disc:0x3c4044, discTop:0x484d51,
  };

  /* ---------- helper: ONE marching soldier silhouette (bipedal, musket at shoulder-arms), offset
     + given a palette pair so ghost-ranks read paler/behind the lead figure. ---------- */
  function soldier(ox, oz, scale, hex, hexDk, hexLt, opacTag){
    const S = {
      hip: V(ox, 0.30*scale, oz), waist:V(ox,0.42*scale,oz+0.01*scale),
      chest:V(ox,0.58*scale,oz+0.02*scale), shldr:V(ox,0.70*scale,oz),
      neck:V(ox,0.75*scale,oz-0.01*scale), headB:V(ox,0.80*scale,oz-0.01*scale), headT:V(ox,0.98*scale,oz-0.02*scale),
    };
    const n=7, ph=Math.PI/7;
    const bands=[
      {y:S.hip.y, rx:0.13*scale, hex:hexDk},
      {y:S.waist.y, rx:0.125*scale, hex:hex},
      {y:S.chest.y, rx:0.14*scale, hex:hex},
      {y:S.shldr.y, rx:0.115*scale, hex:hexLt},
    ];
    const rings=bands.map(b=>ring(V(ox,b.y,oz), V(0,1,0), b.rx, b.rx*0.78, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(ox,S.neck.y,oz), hexLt);
    capFan(rings[0], V(ox,S.hip.y-0.06*scale,oz), hexDk, true);
    // head + tricorne hat silhouette (no face, hollow brim shadow)
    {
      const hn=7, hph=Math.PI/7;
      const hb=[{y:S.headB.y, r:0.075*scale, hex:hexDk},{y:S.headB.y+0.06*scale, r:0.08*scale, hex:hex}];
      const hr=hb.map(b=>ring(V(ox,b.y,oz-0.01*scale), V(0,1,0), b.r, b.r*0.9, hn, hph));
      stitch(hr, b=>hb[b].hex);
      // tricorne: three flat brim panels
      for(let i=0;i<3;i++){
        const a=(i/3)*Math.PI*2;
        const bx=ox+Math.sin(a)*0.11*scale, bz=oz+Math.cos(a)*0.11*scale-0.01*scale;
        quad(V(bx-0.05*scale,S.headT.y-0.03*scale,bz), V(bx+0.05*scale,S.headT.y-0.03*scale,bz),
             V(ox,S.headT.y+0.02*scale,oz), V(ox,S.headT.y+0.02*scale,oz), P.hatDk, 0.05);
      }
      capFan(hr.at(-1), V(ox,S.headT.y-0.01*scale,oz-0.01*scale), P.hatDk);
      // hollow brim-shadow recess (no eyes) + faint cold collar glow
      quad(V(ox-0.05*scale,S.headB.y+0.01*scale,oz+0.075*scale), V(ox+0.05*scale,S.headB.y+0.01*scale,oz+0.075*scale),
           V(ox+0.04*scale,S.headB.y+0.06*scale,oz+0.07*scale), V(ox-0.04*scale,S.headB.y+0.06*scale,oz+0.07*scale), P.hatDk, 0.02);
      quad(V(ox-0.05*scale,S.neck.y-0.01*scale,oz+0.06*scale),V(ox+0.05*scale,S.neck.y-0.01*scale,oz+0.06*scale),
           V(ox+0.04*scale,S.neck.y+0.02*scale,oz+0.055*scale),V(ox-0.04*scale,S.neck.y+0.02*scale,oz+0.055*scale), P.glow, 0.08);
    }
    // musket at shoulder-arms — diagonal across the chest, barrel up-forward
    {
      const gb=V(ox+0.10*scale, S.hip.y+0.04*scale, oz+0.08*scale);
      const gt=V(ox-0.06*scale, S.headT.y+0.05*scale, oz-0.10*scale);
      tube(gb,gt,0.020*scale,0.014*scale,4,P.musket,{capB:{hex:P.bayonet, lift:0.02*scale}});
      // bayonet tip
      tube(gt, V(gt.x-0.02*scale,gt.y+0.10*scale,gt.z-0.03*scale), 0.010*scale,0.002*scale,3,P.bayonet,{capB:{hex:P.bayonet}});
    }
    // simple hanging arms
    for(const s of [-1,1]) tube(V(ox+s*0.13*scale,S.shldr.y-0.05*scale,oz), V(ox+s*0.14*scale,S.hip.y+0.02*scale,oz+0.02*scale), 0.035*scale,0.028*scale,4,hexDk);
  }

  /* ---------- GHOST RANKS — two paler half-phased soldiers offset behind/beside the lead figure,
     smaller-scale (depth read), same palette family but the ghost tones (paler, cooler). ---------- */
  soldier(-0.22, -0.14, 0.86, P.ghost, P.ghostDk, P.cloth, true);
  soldier( 0.24, -0.20, 0.80, P.ghost, P.ghostDk, P.clothDk, true);

  /* ---------- LEAD SOLDIER — full scale, front-center, drab coat (the "solid" read of the mass). */
  soldier(0.0, 0.06, 1.0, P.coat, P.coatDk, P.coatLt, false);

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
