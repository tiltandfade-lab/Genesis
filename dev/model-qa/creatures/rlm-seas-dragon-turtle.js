/* dev/model-qa/creatures/rlm-seas-dragon-turtle.js — the DRAGON TURTLE landmark table
   (CHELONIAN-DRAGON family — no dedicated ANATOMY-CANON section exists yet, so this is authored
   from first principles per the DIRECTION brief, cross-referencing the WINGED family's neck/head
   discipline for the dragon head and the existing rlm-dragon-turtle-of-the-drowned-necropolis.js
   chassis for scale/proportion grounding), Gargantuan, CR 17, realm high-seas, authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry pilot, seas-w2 cell 3, port
   5277). Core identity: the pale unkillable thing that turns and fights back — the apex of the
   realm. Bespoke to the render key "dragon-turtle" — realm reskins ride this chassis narratively.

   BAND NOTE: bakes to ~1,774 tris — inside the 1,000-2,000 safe band, but at the high end of it
   on purpose. Gargantuan apex-predator anatomy genuinely needs the triangles to stay legible at
   three simultaneous capture criteria law 4 demands — countable shell-ridge plates (law 1: tris
   as expression, not smoothing), a reared serpent-dragon neck long enough to read as its own
   limb, and an open-jaw steam-blast payload — none of which could be cut without sanding off the
   two things this file exists to prove: the shell-mountain silhouette and the reared dragon head.
   No triangle here pads a count; every one buys a countable feature. (No >2,000 exception needed.)

   FEATURE CHECKLIST (the ~1,774-tri budget buys):
     1. SHELL-MOUNTAIN — a huge domed carapace built as a banded loft (the "mountain" massing),
        studded with a spine of COUNTABLE ridge plates running bow-to-stern (9 raised wedge
        ossicles, tallest at mid-shell tapering toward bow/stern — a mountain-range silhouette,
        never a smoothed dome) plus two flanking rows of smaller side-ridges. Each plate is its
        own little pyramid with a lit top facet — law 1's "tris are points of expression" applied
        directly to the anatomy family's name.
     2. SIGNATURE — the reared serpent-dragon neck: a long S-curved neck climbing near-vertical
        off the shell's bow to a heavy horned dragon skull, jaws thrown WIDE open (upper skull +
        a separately hinged, dropped lower jaw) mid steam-blast — a cloud of pale scalding-steam
        puffs erupting forward off the open mouth. This is the one loud exaggerated payload (law
        4) the flavor line names, and the pose's high-expression moment (law 5).
     3. Wake/foam collar — a ring of bright foam wedges girdling the shell at the waterline, where
        the shell-mountain is breaking the surface like a surfacing island (the pose's literal
        "broach") — the law-3 high-value zone riding the base of the signature.
     4. FOUR flipper-claws, one RAISED: three braced/planted taking the surfacing weight, the
        near-front-left flipper thrown up and forward out of the wake, trailing its own small
        splash, each foot fanning three clawed digits — law 5's asymmetric counterweight.
     5. Pale barnacle-scoured belly/throat ladder and shell-ridge highlights (the law-3 value
        contrast) against a deep weathered hide, carried up the throat into the open jaw and onto
        the steam cloud itself so the signature carries the highest values in the piece.
     6. Short heavy tapering tail with a low dorsal-fin row, planted low and trailing as the
        counterweight anchoring the reared neck — never a static at-rest column.

   POSE SENTENCE (the broach — law 5): surfacing mid-breach, the shell-mountain punching up
   through its own foam-wake collar, the dragon neck reared to near-vertical, jaws thrown wide
   mid steam-blast, one flipper-claw raised dripping out of the wake while the other three brace
   the dive — the apex that turns and fights back, never a still, submerged, at-rest hulk.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w2'], cell 3, fn buildDragonTurtle). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildDragonTurtle(){
  /* ---------- PALETTE — "the pale unkillable thing": weathered bone-pale hide/shell rather
     than the necropolis variant's swamp-green, so the base render key reads distinct from its
     realm reskins. Foam/steam pushed near-white for law 3's mandatory high-value zone. ---------- */
  const P = {
    hide:0x8c8a76, hideDk:0x625f4e, hideLt:0xaba888,
    shell:0x76705c, shellDk:0x4e493a, shellLt:0x9b9478, ridgeLt:0xc4bd98,
    belly:0xc8c0a0, bellyDk:0x9a9271,
    horn:0xd4c8a0, hornDk:0x9c8f68,
    mouth:0x241c16, tooth:0xe8ddb8, tongue:0x8a3830,
    claw:0x2a231a,
    foam:0xe8f0e4, foamDk:0xb8c8ba,
    steam:0xf0ece0, steamDk:0xd0c8b0,
    eye:0xc8b040, pupil:0x1a1408,
    disc:0x38342a, discTop:0x443f32,
  };

  /* ---------- LANDMARKS — spine low & wide, Gargantuan bulk, shell centered over the barrel. */
  const spY = 0.58;
  const S = {
    tailBase: V(0, spY-0.05, -0.92),
    rump:     V(0, spY+0.02, -0.60),
    loin:     V(0, spY+0.08, -0.24),
    mid:      V(0, spY+0.12,  0.14),
    shldr:    V(0, spY+0.10,  0.50),
    neck1:    V(0.00, spY+0.55, 0.58),
    neck2:    V(0.03, spY+1.02, 0.50),
    neck3:    V(0.06, spY+1.42, 0.38),
    headB:    V(0.08, spY+1.65, 0.28),
  };

  /* ---------- BODY — wide low barrel under the shell (mostly hidden, seats the flippers/tail). */
  tube(S.rump, S.loin, 0.500, 0.560, 10, P.hide, {phase:Math.PI/10, capA:{hex:P.hideDk, lift:0.04}});
  tube(S.loin, S.mid,  0.560, 0.580, 10, P.hide, {phase:Math.PI/10});
  tube(S.mid,  S.shldr,0.580, 0.500, 10, P.hide, {phase:Math.PI/10});
  /* pale belly strip low on the flanks */
  {
    const by=spY-0.48;
    quad(V(-0.38,by,-0.56), V(0.38,by,-0.56), V(0.32,by+0.03,0.38), V(-0.32,by+0.03,0.38), P.belly, 0.05);
  }

  /* ---------- SHELL-MOUNTAIN — banded dome + countable ridge-plate spine (signature #1). ---------- */
  {
    const bands=[
      {y:spY+0.28, cz:-0.58, rx:0.58, rz:0.44, hex:P.shell},
      {y:spY+0.66, cz:-0.18, rx:0.74, rz:0.60, hex:P.shellLt},
      {y:spY+0.88, cz: 0.22, rx:0.70, rz:0.58, hex:P.shell},
      {y:spY+0.64, cz: 0.54, rx:0.50, rz:0.40, hex:P.shellDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, 14, Math.PI/14));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+0.70,0.62), P.shellDk, true);
    capFan(rings[0], V(0,spY+0.18,-0.64), P.shellDk);

    /* R2 SELF-CORRECTION (post r1 engine render): r1's spine plates read as mere surface
       texture — same mid-value as the shell around them, too short to break the dome outline.
       Nearly doubled the heights + widened, and lifted the plate hex to a near-white tone so
       each one is a real silhouette spike + a law-3 value spike, not a shading variation. */
    const spine = [
      [-0.52,0.115,0.19], [-0.36,0.158,0.24], [-0.20,0.196,0.28], [-0.04,0.224,0.30],
      [0.12,0.234,0.30], [0.28,0.202,0.27], [0.42,0.160,0.23], [0.54,0.116,0.18], [0.64,0.076,0.14],
    ];
    for(const [cz,h,w] of spine){
      const base = ring(V(0,spY+0.84,cz), V(0,1,0), w, w*0.62, 5, Math.PI/5);
      capFan(base, V(0,spY+0.84+h,cz), P.ridgeLt);
    }
    /* two flanking rows of smaller side-ridges, both flanks, 4 each — cheaper pyramids,
       also lifted brighter so the whole spine+flank plate family reads as one value family. */
    for(const side of [-1,1]){
      for(const cz of [-0.40,-0.12,0.16,0.42]){
        const rx = side*0.48 * (0.58+0.30*Math.cos(cz*1.6));
        const base = ring(V(rx,spY+0.60,cz), V(0,1,0), 0.10, 0.085, 4, Math.PI/4);
        capFan(base, V(rx*1.10,spY+0.74,cz), P.ridgeLt);
      }
    }
  }

  /* ---------- WAKE / FOAM COLLAR — the broach: a ring of bright foam wedges girdling the
     shell at its WIDEST band (signature #3). R2 SELF-CORRECTION: r1 placed this collar down at
     the flipper base, where it visually merged with the legs and never read as a wave breaking
     around the shell. Moved up to the shell's equator (matches the widest shell band, rx~0.74)
     and enlarged so it clears the shell rim as its own silhouette ring. */
  {
    const N = 16, collarY = spY + 0.62, collarR = 0.82;
    for(let i=0;i<N;i++){
      const t = i/N*Math.PI*2;
      const rx = collarR + 0.06*Math.sin(t*3.1);
      const cx = Math.cos(t)*rx, cz0 = Math.sin(t)*rx*0.82;
      const dir = new THREE.Vector3(Math.cos(t), 0.15, Math.sin(t)*0.82).normalize();
      const base = V(cx*0.92, collarY-0.08, cz0*0.92);
      const tip  = V(cx + dir.x*0.20, collarY+0.14+0.07*(i%3), cz0 + dir.z*0.20);
      const b1 = ring(base, dir, 0.10, 0.065, 4, i*0.7);
      capFan(b1, tip, (i%2)?P.foam:P.foamDk);
    }
  }

  /* ---------- LONG REARED DRAGON NECK + horned skull, jaws wide mid steam-blast. ---------- */
  tube(S.shldr, S.neck1, 0.310, 0.250, 9, P.hideDk, {phase:Math.PI/9});
  tube(S.neck1, S.neck2, 0.250, 0.205, 9, P.hide,   {phase:Math.PI/9});
  tube(S.neck2, S.neck3, 0.205, 0.172, 9, P.hideLt, {phase:Math.PI/9});
  tube(S.neck3, S.headB, 0.172, 0.148, 9, P.hideDk, {phase:Math.PI/9});
  {
    const n=9, ph=Math.PI/n;
    /* upper skull, rising off the neck top */
    const bands=[
      {y:spY+1.62, cz:0.34, rx:0.150, rz:0.185, hex:P.hide},
      {y:spY+1.74, cz:0.40, rx:0.170, rz:0.205, hex:P.hideLt},
      {y:spY+1.86, cz:0.32, rx:0.142, rz:0.160, hex:P.hideDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,spY+1.92,0.30), P.hideDk);

    /* R2 SELF-CORRECTION (post r1 engine render): the wide-open jaw + steam did not read at
       all — r1's lower jaw swung down INTO the same y/z volume the reared neck already
       occupied, so from camera it read as more body-meat, not a gap of void. Fixed by pushing
       the ENTIRE snout/jaw assembly forward (+z) clear of the neck column, and swinging the
       lower jaw down-and-forward at a much steeper angle so it hangs in open air below/ahead
       of the skull with real void behind it — the gap itself is now the readable feature. */

    /* R3 SELF-CORRECTION (pass-2 critic, post r2 engine render): r2's snout cleared the neck
       in 3D but the dimetric camera (yaw45/el30) projects +z screen-LEFT-and-DOWN, not
       toward-viewer — so the steep lower-jaw drop (tip at world y=spY+0.68) landed the whole
       gap+steam cluster down at the SAME screen height as the wake-collar/raised-flipper
       splash (both ~py 420-530), and it read as one indistinct pale smudge, not an open dragon
       mouth. Verified by projecting landmark coords through the actual camera matrix (see
       pass-2 critic notes): raising the lower-jaw tip/mid and pulling the steam puffs back+up
       keeps the whole open-mouth+steam cluster near the HEAD in screen space (clear of the
       waterline blob), where the void behind it makes the gap read. No silhouette-scale
       rewrite — same jaw/steam shapes, retargeted coordinates only. */

    /* upper snout — reaches further forward than r1 so it clears the neck entirely */
    const snB=V(0,spY+1.66,0.50), snM=V(0,spY+1.68,0.92), snT=V(0,spY+1.70,1.28);
    tube(snB, snM, 0.145, 0.100, n, P.hide, {raz:0.115, rbz:0.075, phase:ph});
    tube(snM, snT, 0.100, 0.052, n, P.hide, {raz:0.075, rbz:0.038, phase:ph, capB:{hex:P.mouth, lift:0.01}});
    /* upper jaw line + upper teeth (fixed, pointing down into the gape) */
    quad(V(-0.11,spY+1.60,0.56), V(0.11,spY+1.60,0.56), V(0.06,spY+1.58,1.20), V(-0.06,spY+1.58,1.20), P.mouth, 0.03);
    for(const s of [-1,1]) for(const t of [0,1,2]){
      const tb=V(s*0.085,spY+1.595,0.66+t*0.20), tt=tb.clone().add(V(0,-0.08,0.0));
      tube(tb,tt,0.016,0.004,3,P.tooth,{capB:{hex:P.tooth,lift:0.003}});
    }

    /* LOWER JAW — hinged at the skull chin, swung STEEPLY down-and-forward, clearing the
       neck's z-range entirely (neck tops out z<=0.42; the jaw sweeps to z=1.30) so the open
       gap reads against void from every turnaround angle. */
    const hinge = V(0,spY+1.56,0.44);
    const jawMid = V(0.05,spY+1.42,0.74);
    const jawTip = V(0.06,spY+1.18,1.02);
    tube(hinge, jawMid, 0.125, 0.082, 7, P.hideDk, {phase:Math.PI/7});
    tube(jawMid, jawTip, 0.082, 0.040, 7, P.hideDk, {phase:Math.PI/7, capB:{hex:P.mouth, lift:0.01}});
    quad(V(-0.075,spY+1.40,0.72), V(0.075,spY+1.40,0.72), V(0.035,spY+1.20,0.96), V(-0.035,spY+1.20,0.96), P.tongue, 0.04);
    for(const s of [-1,1]) for(const t of [0,1,2]){
      const tb=V(s*0.065,spY+1.38-t*0.08,0.78+t*0.12), tt=tb.clone().add(V(0,0.07,0.0));
      tube(tb,tt,0.014,0.004,3,P.tooth,{capB:{hex:P.tooth,lift:0.003}});
    }

    /* two backswept horns off the skull crown */
    for(const s of [-1,1]){
      const hb=V(s*0.10,spY+1.86,0.24), ht=V(s*0.20,spY+2.14,-0.02);
      tube(hb,ht,0.048,0.014,5,P.horn,{capB:{hex:P.hornDk,lift:0.006}});
    }
    /* eyes, set high on the skull for the reared-up read */
    for(const s of [-1,1]){
      blob(s*0.135, spY+1.80, 0.42, 0.032,0.032,0.032, P.eye, 5, 3);
      blob(s*0.150, spY+1.80, 0.45, 0.014,0.014,0.014, P.pupil, 4, 2);
    }

    /* STEAM-BLAST — enlarged + pushed well forward of the (now-open) jaw gap, in the
       brightest near-white tone in the piece, so the cloud reads as an unmissable silhouette
       payload jutting past the head rather than a texture lost inside it. */
    const puffs = [
      [0.08,1.80,1.22,0.145], [0.21,1.94,1.46,0.115], [-0.04,1.86,1.40,0.11],
      [0.13,2.08,1.66,0.10], [0.00,1.68,1.52,0.095], [0.24,1.62,1.28,0.085],
    ];
    for(const [x,dy,z,r] of puffs){
      blob(x, spY+dy, z, r, r*0.85, r, P.steam, 6, 4);
      blob(x*1.15, spY+dy+r*0.3, z+r*0.4, r*0.6, r*0.55, r*0.6, P.steamDk, 5, 3);
    }
  }

  /* ---------- FOUR FLIPPER-CLAWS — three braced, one RAISED out of the wake (signature #4). */
  {
    const flipper=(shoulder, footX, footY, footZ, hex, raised)=>{
      const elbowX=shoulder.x + Math.sign(shoulder.x||1)*0.28;
      const elbowY= raised ? shoulder.y+0.10 : spY-0.20;
      const elbow=V(elbowX, elbowY, shoulder.z + (footZ>shoulder.z?0.10:-0.10));
      const foot=V(footX, footY, footZ);
      tube(shoulder, elbow, 0.220, 0.180, 8, hex);
      tube(elbow, foot, 0.180, 0.132, 7, P.hideDk, {capB:{hex:P.hideDk, lift:0.02}});
      const pad=V(foot.x, foot.y-0.03, foot.z+0.08);
      const side=Math.sign(foot.x||1);
      const p1=ring(pad,V(0,1,0),0.21,0.19,7), p2=ring(pad.clone().add(V(0,0.05,0)),V(0,1,0),0.19,0.17,7);
      stitch([p1,p2],()=>hex);
      for(const [dx,dz] of [[side*0.15,0.08],[side*0.07,0.18],[-side*0.04,0.19]]){
        const cb=V(pad.x, pad.y+0.02, pad.z), ct=V(pad.x+dx, pad.y-0.04, pad.z+dz+0.06);
        tube(cb, ct, 0.044, 0.015, 4, P.claw, {capB:{hex:P.claw, lift:0.008}});
      }
      if(raised){
        /* splash trailing off the raised flipper as it breaks the surface */
        for(const [ox,oy,oz] of [[0.08,0.05,0.02],[-0.06,0.09,0.06],[0.02,0.14,-0.03]]){
          blob(foot.x+ox, foot.y+oy, foot.z+oz, 0.045,0.045,0.045, P.foam, 5, 3);
        }
      }
    };
    /* near-front-left RAISED, thrown up and forward out of the wake */
    flipper(V(-0.50, spY-0.06, 0.42), -0.62, 0.62, 0.86, P.hide, true);
    flipper(V( 0.50, spY-0.10, 0.42),  0.80, 0.10, 0.50, P.hide, false);
    flipper(V(-0.54, spY-0.06, -0.60), -0.84, 0.10, -0.72, P.hide, false);
    flipper(V( 0.54, spY-0.06, -0.60),  0.84, 0.10, -0.78, P.hide, false);
  }

  /* ---------- TAIL — heavy at the base, tapering, low dorsal-fin row (the counterweight). ---------- */
  {
    const t0=S.tailBase;
    const t1=V(0.04, spY-0.14, -1.24);
    const t2=V(0.10, spY-0.22, -1.52);
    const t3=V(0.18, spY-0.10, -1.74);
    const tip=V(0.26, 0.08,    -1.92);
    tube(t0, t1, 0.300, 0.220, 9, P.hide,    {phase:Math.PI/9, capA:{hex:P.hideDk}});
    tube(t1, t2, 0.220, 0.140, 9, P.hideDk,  {phase:Math.PI/9});
    tube(t2, t3, 0.140, 0.070, 9, P.hide,    {phase:Math.PI/9});
    tube(t3, tip,0.070, 0.020, 9, P.hideDk,  {phase:Math.PI/9, capB:{hex:P.hideDk, lift:0.01}});
    for(const [cz,y,h] of [[-1.18,spY+0.08,0.14],[-1.44,spY-0.02,0.11],[-1.66,spY-0.08,0.08]]){
      quad(V(-0.03,y,cz), V(0.03,y,cz), V(0,y+h,cz-0.05), V(0,y+h,cz-0.05), P.hideDk, 0.04);
    }
  }

  /* ---------- base disc (Gargantuan: r=0.90 — the wake collar rides past r=0.86). ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.90, 0.90, 20);
    const r2=ring(V(0,0.066,0), V(0,1,0), 0.88, 0.88, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.069,0), P.discTop);
  }
}
