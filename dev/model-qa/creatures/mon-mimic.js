/* dev/model-qa/creatures/mon-mimic.js — the MIMIC: the treasure chest that BITES. Whole-object
   grammar: one function, one geometry frame, no anchors. The dual read is the whole point — from
   BEHIND it is convincing FURNITURE (a banded, brass-cornered wooden chest, back panel intact);
   from the FRONT it is a HORROR (the lid frozen mid-bite at ~40° open, two rows of pale needle
   FANGS lining the maw, a long wet pink-red TONGUE lolling out over the front lip toward the disc,
   and stubby pseudopod feet barely visible under the base corners). Wood browns + brass, then the
   shock of the wet mouth colors. No held item (it IS the trap). Sits low + wide on its disc.
   Imported by mon-mimic-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildMimic(){
  /* ---------- PALETTE (VS desaturated wood + brass, then the WET shock inside) ---------- */
  const P = {
    wood:0x6a4a2c, woodDk:0x4e371f, woodDkr:0x372615,     // oak chest planks — mid, shadow, deepest
    woodLt:0x835f39, plank:0x5c4126,                       // lit plank face; groove line
    brass:0xa8823c, brassDk:0x77592a, brassLt:0xc6a256,    // banding + corner brackets (tarnished)
    iron:0x4a453e, ironDk:0x2f2c27,                        // lock plate + nailheads
    gum:0x7c3b3e, gumDk:0x5a2a2d,                          // dark red gum-flesh lining the maw
    fang:0xd8cdb0, fangDk:0xa79c82,                        // pale bone needle fangs
    tongue:0xb85668, tongueDk:0x8f3f50, tongueLt:0xd07a88, // wet pink-red tongue
    maw:0x1c0f10,                                          // the near-black wet throat behind the teeth
    foot:0x5b3d26, footDk:0x3e2a19,                        // stubby pseudopod feet (wood-fleshed)
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- LANDMARKS — a low wide chest. The base box is the body; the lid hinges at the BACK
     top edge and swings UP+BACK to ~40° open, so the mouth gapes toward +z (the camera front). --- */
  const L = {
    x:0.34,            // chest half-width (x)
    zF:0.24,           // front face z (+z, toward camera)
    zB:-0.24,          // back face z (the hinge side)
    baseY0:0.10,       // base box bottom (sits just above the disc)
    baseY1:0.52,       // base box top rim (the lower lip of the maw)
    lidAng:72*Math.PI/180,  // lid open angle — stands up + leans back behind the maw
  };

  /* ===== FEET FIRST-ish — 4 stubby pseudopod feet barely poking under the base corners. Squat
     fleshy nubs (wood-toned so they half-hide), just breaking the disc under each corner. ===== */
  {
    const foot=(fx,fz)=>{
      // a squat blob sitting low, mostly under the box, toes splayed a touch outward
      const c=V(fx, 0.085, fz);
      const rings=blob(c.x, c.y, c.z, 0.085, 0.075, 0.095, P.foot, 6, 3);
      // flatten the sole into the disc
      rings.forEach((rg,k)=>{ if(k<=1) rg.forEach(p=>{ if(p.y<0.03) p.y=0.012; }); });
      // a darker cleft line across the front (reads as a splayed toe pad)
      quad(V(fx-0.055,0.02,fz+0.06), V(fx+0.055,0.02,fz+0.06),
           V(fx+0.045,0.09,fz+0.055), V(fx-0.045,0.09,fz+0.055), P.footDk, 0.03);
    };
    foot(-L.x+0.06,  L.zF-0.05);
    foot( L.x-0.06,  L.zF-0.05);
    foot(-L.x+0.06,  L.zB+0.05);
    foot( L.x-0.06,  L.zB+0.05);
  }

  /* ===== BASE BOX — the chest body. A rectangular wooden box (the back + sides + front-bottom stay
     furniture-convincing). Built as 8 explicit corner verts → 5 outer faces (top is the open maw).
     Then plank grooves, brass bands, corner brackets, a lock plate + nailheads on the front. ===== */
  const bx=L.x, y0=L.baseY0, y1=L.baseY1, zf=L.zF, zb=L.zB;
  // corner helper: (sx in ±1, y, sz in ±1)
  const bc=(sx,y,sz)=>V(sx*bx, y, sz>0?zf:zb);
  {
    // FRONT face (+z) — the face that will read as furniture from the front-bottom, horror above
    quad(bc(-1,y0,1), bc(1,y0,1), bc(1,y1,1), bc(-1,y1,1), P.wood, 0.05);
    // BACK face (−z) — the convincing furniture panel (must read as a plain chest back)
    quad(bc(1,y0,-1), bc(-1,y0,-1), bc(-1,y1,-1), bc(1,y1,-1), P.woodDk, 0.05);
    // LEFT + RIGHT side faces
    quad(bc(-1,y0,-1), bc(-1,y0,1), bc(-1,y1,1), bc(-1,y1,-1), P.woodDk, 0.05);
    quad(bc(1,y0,1), bc(1,y0,-1), bc(1,y1,-1), bc(1,y1,1), P.woodDk, 0.05);
    // BOTTOM face (closes it underneath so it's a solid box)
    quad(bc(-1,y0,-1), bc(1,y0,-1), bc(1,y0,1), bc(-1,y0,1), P.woodDkr, 0.03);

    /* plank grooves — 2 horizontal darker groove lines across FRONT + BACK (barrel-plank read) */
    for(const gy of [y0+0.14, y0+0.28]){
      // front
      quad(V(-bx,gy-0.012,zf+0.002), V(bx,gy-0.012,zf+0.002), V(bx,gy+0.012,zf+0.002), V(-bx,gy+0.012,zf+0.002), P.plank, 0.02);
      // back
      quad(V(bx,gy-0.012,zb-0.002), V(-bx,gy-0.012,zb-0.002), V(-bx,gy+0.012,zb-0.002), V(bx,gy+0.012,zb-0.002), P.woodDkr, 0.02);
    }

    /* BRASS BANDS — two vertical straps wrapping front→top→back on both sides of the lock (the
       classic banded chest). Each band = a thin proud quad on the front and matching on the back. */
    for(const bxpos of [-0.16, 0.16]){
      // front strap
      quad(V(bxpos-0.028,y0,zf+0.004), V(bxpos+0.028,y0,zf+0.004),
           V(bxpos+0.028,y1,zf+0.004), V(bxpos-0.028,y1,zf+0.004), P.brass, 0.03);
      // back strap
      quad(V(bxpos+0.028,y0,zb-0.004), V(bxpos-0.028,y0,zb-0.004),
           V(bxpos-0.028,y1,zb-0.004), V(bxpos+0.028,y1,zb-0.004), P.brassDk, 0.03);
    }

    /* CORNER BRACKETS — brass L-brackets on the 4 vertical front edges + back edges (furniture tell).
       A thin brass quad hugging each vertical corner, front and back. */
    for(const sx of [-1,1]){
      // front vertical corner bracket
      quad(V(sx*bx-sx*0.04,y0,zf+0.005), V(sx*bx,y0,zf+0.005), V(sx*bx,y1,zf+0.005), V(sx*bx-sx*0.04,y1,zf+0.005), P.brassDk, 0.03);
      // wrap onto the side face a touch
      quad(V(sx*bx+0.004,y0,zf), V(sx*bx+0.004,y0,zf-0.05), V(sx*bx+0.004,y1,zf-0.05), V(sx*bx+0.004,y1,zf), P.brassDk, 0.03);
      // back vertical corner bracket
      quad(V(sx*bx,y0,zb-0.005), V(sx*bx-sx*0.04,y0,zb-0.005), V(sx*bx-sx*0.04,y1,zb-0.005), V(sx*bx,y1,zb-0.005), P.brassDk, 0.03);
    }

    /* LOCK PLATE — an iron escutcheon centered low on the FRONT face + a keyhole + 4 nailheads.
       This is the money detail selling "treasure chest" head-on. */
    quad(V(-0.075,y0+0.05,zf+0.006), V(0.075,y0+0.05,zf+0.006),
         V(0.075,y0+0.22,zf+0.006), V(-0.075,y0+0.22,zf+0.006), P.iron, 0.02);
    quad(V(-0.070,y0+0.055,zf+0.008), V(0.070,y0+0.055,zf+0.008),
         V(0.070,y0+0.215,zf+0.008), V(-0.070,y0+0.215,zf+0.008), P.ironDk, 0.0);  // recessed inner
    // keyhole (a tiny dark slot)
    quad(V(-0.012,y0+0.10,zf+0.010), V(0.012,y0+0.10,zf+0.010),
         V(0.010,y0+0.155,zf+0.010), V(-0.010,y0+0.155,zf+0.010), 0x120d09, 0.0);
    // brass keyhole bezel dot at top
    quad(V(-0.016,y0+0.145,zf+0.011), V(0.016,y0+0.145,zf+0.011),
         V(0.014,y0+0.175,zf+0.011), V(-0.014,y0+0.175,zf+0.011), P.brassLt, 0.0);
    // 4 nailheads on the lock plate corners
    for(const nx of [-0.058,0.058]) for(const ny of [y0+0.065, y0+0.205]){
      quad(V(nx-0.012,ny-0.012,zf+0.009), V(nx+0.012,ny-0.012,zf+0.009),
           V(nx+0.012,ny+0.012,zf+0.009), V(nx-0.012,ny+0.012,zf+0.009), P.brassLt, 0.02);
    }
  }

  /* ===== THE MAW — the open top of the base box is the LOWER JAW. The whole top of the box gapes:
     the inner walls of the box are DARK WET GUM/THROAT (near-black), sloping down into the throat.
     Build the throat as a recessed dark liner just inside the top rim, dropping to a small floor. == */
  {
    const rimY=y1, floorY=y0+0.12, inset=0.06;
    // top rim of the box (the lower lip) — a brass-capped edge band around all 4 sides
    // FRONT lip (the tongue lolls over this)
    quad(bc(-1,rimY,1), bc(1,rimY,1), V(bx-0.0,rimY-0.02,zf-0.02), V(-bx+0.0,rimY-0.02,zf-0.02), P.brassDk, 0.03);
    // inner throat walls (near-black wet), 4 sloping quads from rim inward+down to a floor
    const fL=-bx+inset, fR=bx-inset, fF=zf-inset, fB=zb+inset;
    // front inner wall
    quad(V(-bx,rimY,zf), V(bx,rimY,zf), V(fR,floorY,fF), V(fL,floorY,fF), P.maw, 0.02);
    // back inner wall — WOOD-dark (not flesh) so from directly behind, over the rim, it reads as a
    // shadowed chest interior, not a red maw (keeps the furniture read from the back panel)
    quad(V(bx,rimY,zb), V(-bx,rimY,zb), V(fL,floorY,fB), V(fR,floorY,fB), P.woodDkr, 0.02);
    // left + right inner walls
    quad(V(-bx,rimY,zb), V(-bx,rimY,zf), V(fL,floorY,fF), V(fL,floorY,fB), P.maw, 0.02);
    quad(V(bx,rimY,zf), V(bx,rimY,zb), V(fR,floorY,fB), V(fR,floorY,fF), P.maw, 0.02);
    // throat floor (dark gum)
    quad(V(fL,floorY,fB), V(fR,floorY,fB), V(fR,floorY,fF), V(fL,floorY,fF), P.gumDk, 0.02);
    // a gum ridge just inside the front rim (wet red gumline the bottom fangs rise from)
    quad(V(-bx+0.03,rimY-0.01,zf-0.03), V(bx-0.03,rimY-0.01,zf-0.03),
         V(bx-0.05,rimY-0.06,zf-0.09), V(-bx+0.05,rimY-0.06,zf-0.09), P.gum, 0.03);
  }

  /* ===== BOTTOM FANG ROW — pale needle fangs RISING from the front gumline of the base box. A row
     of little 4-sided pyramids pointing UP, tilted slightly inward (toward the throat). ===== */
  {
    const gy=y1-0.02, gz=zf-0.05;                 // gumline position along the front
    const nF=7;                                    // fangs across the front
    for(let i=0;i<nF;i++){
      const t=(i/(nF-1))*2-1;                       // -1..1 across the width
      const fx=t*(bx-0.06);
      const h=0.10 + Math.cos(t*1.3)*0.03;          // center fangs a touch taller
      const baseC=V(fx, gy, gz);
      const tip=V(fx*0.9, gy+h, gz-0.03);            // tilt inward + up
      const w=0.026;
      // 4-face pyramid (front, back, 2 sides) so it reads as a needle from any angle
      const b0=V(fx-w,gy,gz+0.012), b1=V(fx+w,gy,gz+0.012), b2=V(fx+w*0.7,gy,gz-0.028), b3=V(fx-w*0.7,gy,gz-0.028);
      quad(b0,b1,tip,tip, P.fang, 0.04);            // front
      quad(b1,b2,tip,tip, P.fangDk, 0.04);          // right
      quad(b2,b3,tip,tip, P.fangDk, 0.05);          // back
      quad(b3,b0,tip,tip, P.fang, 0.04);            // left
    }
  }

  /* ===== THE LID — hinged at the BACK-TOP edge (z=zb, y=y1), swung UP+BACK to ~40° open. Build the
     lid flat in a local frame (a plank slab the size of the chest top) then ROTATE it about the
     hinge axis (the back top edge, running along x). From behind it caps the chest; from the front
     its UNDERSIDE shows, and the top fang row hangs from that underside. ===== */
  const hingeY=y1, hingeZ=zb;                       // hinge line: along x at (y1, zb)
  const lidDepth=(zf-zb);                            // lid spans front→back
  const lidThick=0.06;
  // rotate a point about the hinge axis (x-axis through (any x, hingeY, hingeZ)) by +ang (opens UP+BACK)
  const ang=L.lidAng;
  const rot=(y,z)=>{                                  // returns [y',z'] rotating (y,z) about (hingeY,hingeZ)
    const dy=y-hingeY, dz=z-hingeZ;
    // opening up-and-back: the FRONT edge (dz>0) rises UP and swings toward −z (over the hinge).
    const ny=hingeY + dy*Math.cos(ang) + dz*Math.sin(ang);
    const nz=hingeZ - dy*Math.sin(ang) + dz*Math.cos(ang);
    return [ny,nz];
  };
  const lp=(sx, along, up)=>{                         // lid point: sx=±1 width, along=0(back)..1(front), up=0(under)..1(top)
    const z0=hingeZ + along*lidDepth;                 // pre-rotation z (back→front)
    const y0v=hingeY + up*lidThick;                   // pre-rotation y (under→top face)
    const [ny,nz]=rot(y0v,z0);
    return V(sx*bx, ny, nz);
  };
  {
    // TOP face of lid (the outer chest-top; furniture read from behind) — brass-banded planks
    quad(lp(-1,0,1), lp(1,0,1), lp(1,1,1), lp(-1,1,1), P.woodLt, 0.05);
    // UNDERSIDE of lid (the dark wet inner lid; the top fangs hang from here)
    quad(lp(1,0,0), lp(-1,0,0), lp(-1,1,0), lp(1,1,0), P.gumDk, 0.03);
    // FRONT edge of lid (the thin front rim of the raised lid)
    quad(lp(-1,1,0), lp(-1,1,1), lp(1,1,1), lp(1,1,0), P.woodDk, 0.04);
    // BACK edge (at the hinge — thin)
    quad(lp(1,0,0), lp(1,0,1), lp(-1,0,1), lp(-1,0,0), P.woodDkr, 0.03);
    // LEFT + RIGHT edge strips of the lid slab
    quad(lp(-1,0,0), lp(-1,0,1), lp(-1,1,1), lp(-1,1,0), P.woodDk, 0.04);
    quad(lp(1,1,0), lp(1,1,1), lp(1,0,1), lp(1,0,0), P.woodDk, 0.04);

    /* brass band + grooves on the lid TOP (so from behind it's clearly a chest lid) */
    for(const bxpos of [-0.16,0.16]){
      const a0=lp(bxpos/bx, 0, 1.02), a1=lp(bxpos/bx, 1, 1.02);
      // approximate a strap as a thin quad between two along-lines — build 4 corners
      const c00=lp((bxpos-0.028)/bx,0,1.02), c01=lp((bxpos+0.028)/bx,0,1.02);
      const c10=lp((bxpos-0.028)/bx,1,1.02), c11=lp((bxpos+0.028)/bx,1,1.02);
      quad(c00,c01,c11,c10, P.brass, 0.03);
    }
    // a brass hasp loop at the front-center of the lid top (the clasp that "should" lock it)
    { const c00=lp(-0.06/bx,0.86,1.04), c01=lp(0.06/bx,0.86,1.04), c10=lp(-0.06/bx,1.0,1.10), c11=lp(0.06/bx,1.0,1.10);
      quad(c00,c01,c11,c10, P.brassLt, 0.02); }

    /* ===== TOP FANG ROW — pale needle fangs HANGING DOWN from the lid underside (front edge), the
       mate to the bottom row. Pyramids pointing DOWN into the maw. Placed along the raised front
       edge of the lid so they read as the upper teeth of the bite. ===== */
    const nT=7;
    for(let i=0;i<nT;i++){
      const t=(i/(nT-1))*2-1;
      const along=0.82;                              // near the front edge of the lid
      // base of the tooth on the lid underside
      const rootC=lp(t*(bx-0.06)/bx, along, 0.0);
      const w=0.026;
      const b0=lp((t*(bx-0.06)-w)/bx, along-0.04, 0.0);
      const b1=lp((t*(bx-0.06)+w)/bx, along-0.04, 0.0);
      const b2=lp((t*(bx-0.06)+w*0.7)/bx, along+0.04, 0.0);
      const b3=lp((t*(bx-0.06)-w*0.7)/bx, along+0.04, 0.0);
      // tip hangs DOWN toward the throat (subtract from y, pull toward front-center)
      const h=0.10 + Math.cos(t*1.3)*0.03;
      const tip=V(rootC.x*0.92, rootC.y - h, rootC.z + 0.02);
      quad(b1,b0,tip,tip, P.fang, 0.04);             // front (wind reversed so it faces out/down)
      quad(b2,b1,tip,tip, P.fangDk, 0.04);
      quad(b3,b2,tip,tip, P.fangDk, 0.05);
      quad(b0,b3,tip,tip, P.fang, 0.04);
    }
    // a red gum band along the lid underside front edge (the upper gumline the top fangs sit in)
    { const g0=lp((-bx+0.03)/bx,0.78,0.02), g1=lp((bx-0.03)/bx,0.78,0.02),
            g2=lp((bx-0.05)/bx,0.9,0.02), g3=lp((-bx+0.05)/bx,0.9,0.02);
      quad(g0,g1,g2,g3, P.gum, 0.03); }
  }

  /* ===== THE TONGUE — a long glistening pink-red tongue lolling OUT over the front lip and drooping
     down toward the disc. Authored as a tapering strap of stacked cross-sections curving from the
     throat floor, up over the front rim, then flopping down the front of the chest. Wet highlight
     stripe down the center. ===== */
  {
    // spine points: from deep in the throat → over the front lip → drooping down the front face
    const spine=[
      V(0.02, y0+0.16, zf-0.14),   // rooted in the throat
      V(0.0,  y1-0.04, zf-0.02),   // rising to the front lip
      V(-0.02,y1-0.02, zf+0.08),   // cresting over the lip
      V(-0.03,y1-0.14, zf+0.14),   // flopping down the front
      V(-0.02,y0+0.30, zf+0.16),   // hanging down the chest face
      V(0.0,  y0+0.14, zf+0.12),   // drooping tip toward the disc
    ];
    const wid=[0.075,0.085,0.090,0.080,0.062,0.030];   // fat mid, tapering to a rounded tip
    const th =[0.030,0.034,0.036,0.030,0.024,0.014];
    // build cross-section rings (a flat-ish ellipse ⊥ the local spine direction)
    const rings=[];
    for(let i=0;i<spine.length;i++){
      const a=spine[Math.max(0,i-1)], b=spine[Math.min(spine.length-1,i+1)];
      const axis=new THREE.Vector3().subVectors(b,a).normalize();
      rings.push(ring(spine[i], axis, wid[i], th[i], 8, Math.PI/8));
    }
    stitch(rings, (bnd,i)=> P.tongue);
    capFan(rings.at(-1), spine.at(-1).clone().add(V(0,-0.02,0.01)), P.tongueDk);   // rounded tip
    // a darker central groove down the top of the tongue
    for(let i=0;i<spine.length-1;i++){
      const a=spine[i], b=spine[i+1];
      quad(a.clone().add(V(-0.012,0.02,0)), a.clone().add(V(0.012,0.02,0)),
           b.clone().add(V(0.012,0.02,0)), b.clone().add(V(-0.012,0.02,0)), P.tongueDk, 0.03);
    }
    // wet glisten dabs along the tongue crest
    const dab=(p,r)=>quad(p.clone().add(V(-r,0.03,-r)), p.clone().add(V(r,0.03,-r)),
                          p.clone().add(V(r,0.03,r)), p.clone().add(V(-r,0.03,r)), P.tongueLt, 0.02);
    dab(spine[2],0.028); dab(spine[3],0.024); dab(spine[4],0.018);
  }

  /* base disc — Large piece (r=0.44). The chest sits low + wide on it, feet just breaking the rim. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
